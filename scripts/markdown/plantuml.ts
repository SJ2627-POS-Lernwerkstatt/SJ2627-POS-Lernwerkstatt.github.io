import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Renders PlantUML to SVG at build time. Uses the jar in $PLANTUML_JAR if set (CI),
 * otherwise a `plantuml` command on the PATH (e.g. Homebrew). Results are cached by
 * content hash, so only changed diagrams start a JVM.
 */

const CACHE_DIR = join(process.cwd(), 'node_modules', '.cache', 'plantuml');
const MAX_PARALLEL = 4;

let running = 0;
const waiting: (() => void)[] = [];

async function limited<T>(task: () => Promise<T>): Promise<T> {
	if (running >= MAX_PARALLEL) await new Promise<void>((resolve) => waiting.push(resolve));
	running++;
	try {
		return await task();
	} finally {
		running--;
		waiting.shift()?.();
	}
}

/** Adds @startuml/@enduml when the block contains only the diagram body. */
export function wrapSource(source: string): string {
	const trimmed = source.trim();
	return trimmed.startsWith('@start') ? trimmed + '\n' : `@startuml\n${trimmed}\n@enduml\n`;
}

/** Turns PlantUML's error output ("ERROR\n<line>\n<message>", on stdout or stderr) into a readable message. */
export function errorMessage(stdout: string, stderr: string): string {
	for (const out of [stderr, stdout]) {
		const lines = out.trim().split(/\r?\n/);
		if (lines[0]?.trim() === 'ERROR') return `line ${lines[1]?.trim()}: ${lines[2]?.trim()}`;
	}
	return (stderr || stdout).trim().split('\n').slice(0, 3).join(' ') || 'unknown PlantUML error';
}

function command(): [string, string[]] {
	const args = ['-tsvg', '-pipe', '-charset', 'UTF-8'];
	const jar = process.env.PLANTUML_JAR;
	return jar ? ['java', ['-Djava.awt.headless=true', '-jar', jar, ...args]] : ['plantuml', args];
}

function run(source: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const [cmd, args] = command();
		const child = spawn(cmd, args);
		let stdout = '';
		let stderr = '';
		child.stdout.setEncoding('utf8').on('data', (d: string) => (stdout += d));
		child.stderr.setEncoding('utf8').on('data', (d: string) => (stderr += d));
		child.on('error', (e) =>
			reject(new Error(`cannot start PlantUML (${e.message}). Install plantuml or set PLANTUML_JAR.`))
		);
		child.on('close', (code) => {
			if (code === 0 && stdout.includes('<svg')) resolve(stdout.slice(stdout.indexOf('<svg')));
			else reject(new Error(`PlantUML ${errorMessage(stdout, stderr)}`));
		});
		child.stdin.end(source, 'utf8');
	});
}

export async function renderPlantUml(body: string): Promise<string> {
	const source = wrapSource(body);
	const key = createHash('sha256').update(source).digest('hex').slice(0, 32);
	const file = join(CACHE_DIR, `${key}.svg`);
	try {
		return await readFile(file, 'utf8');
	} catch {
		// not cached yet
	}
	const svg = await limited(() => run(source));
	await mkdir(CACHE_DIR, { recursive: true });
	await writeFile(file, svg, 'utf8');
	return svg;
}
