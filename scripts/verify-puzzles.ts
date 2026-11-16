// Compiles every puzzle solution in a scratch copy of the exam seed and runs the subproject's tests
// (for JPA: the Spring context boots and Hibernate creates the schema from all puzzle entities).
//
//   node scripts/verify-puzzles.ts [topic ...]
//
// Env: SEED (default ../materials/seed), PUZZLE_SCRATCH (default <tmp>/puzzle-verify).
// The seed is copied once; only the generated puzzle packages are replaced on each run.

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { parseTemplate } from '../src/lib/puzzle/template.ts';

type Mutant = { find: string; replace: string };
type Raw = {
	id: string;
	kind: 'lines' | 'template';
	given?: string;
	solution?: string;
	template?: string;
	check?: string;
	mutants?: Mutant[];
};
/** One compiled unit: a puzzle, or a copy of it with a mutated `given` whose tests must fail. */
type Unit = { id: string; pkg: string; source: string; mutant: boolean };

const SUBPROJECTS: Record<string, { dir: string; base: string; sourceSet: 'main' | 'test'; imports: string[] }> = {
	jpa: {
		dir: 'Aufgabe1_ORMapping',
		base: 'ormapping',
		sourceSet: 'main',
		imports: [
			'jakarta.persistence.*',
			'jakarta.validation.*',
			'jakarta.validation.constraints.*',
			'java.math.BigDecimal',
			'java.time.*',
			'java.util.*',
			'lombok.*',
			'org.hibernate.annotations.EmbeddedColumnNaming',
			'org.springframework.data.jpa.domain.AbstractPersistable',
			'org.springframework.data.jpa.repository.*',
			// Single-type import wins over jakarta.persistence.Query from the wildcard above.
			'org.springframework.data.jpa.repository.Query',
			'org.springframework.data.repository.query.Param'
		]
	},
	service: {
		dir: 'Aufgabe2_BusinessService',
		base: 'businessservice',
		sourceSet: 'main',
		imports: [
			'java.math.*',
			'java.time.*',
			'java.time.temporal.ChronoUnit',
			'java.util.*',
			'java.util.function.*',
			'java.util.stream.*',
			'lombok.RequiredArgsConstructor'
		]
	},
	test: {
		dir: 'Aufgabe2_BusinessService',
		base: 'businessservice',
		sourceSet: 'test',
		imports: [
			'java.math.*',
			'java.time.*',
			'java.util.*',
			'org.junit.jupiter.api.*',
			'org.junit.jupiter.params.ParameterizedTest',
			'org.junit.jupiter.params.provider.*',
			'java.util.stream.*',
			'static org.junit.jupiter.params.provider.Arguments.*',
			'static org.assertj.core.api.Assertions.*'
		]
	},
	rest: {
		dir: 'Aufgabe3_RestfulApi',
		base: 'restfulapi',
		sourceSet: 'main',
		imports: [
			'jakarta.persistence.*',
			'jakarta.validation.*',
			'jakarta.validation.constraints.*',
			'java.net.URI',
			'java.util.*',
			'org.springframework.http.*',
			'org.springframework.web.bind.annotation.*',
			'org.springframework.web.servlet.support.ServletUriComponentsBuilder',
			'org.springframework.data.jpa.domain.AbstractPersistable',
			'org.springframework.data.jpa.repository.JpaRepository'
		]
	}
};

const TOPIC_SUBPROJECT: Record<string, keyof typeof SUBPROJECTS> = {
	'jpa-entity': 'jpa',
	'jpa-relation': 'jpa',
	'jpa-repository': 'jpa',
	'service-method': 'service',
	'unit-test': 'test',
	'rest-endpoint': 'rest'
};

const MARKER = /^([ \t]*)\/\/ ✎.*$/m;

/** Extra imports for puzzles that contain tests; they go to the test source set and really run. */
const TEST_IMPORTS: Record<string, string[]> = {
	jpa: [
		'org.junit.jupiter.api.Test',
		'org.springframework.beans.factory.annotation.Autowired',
		'org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest',
		'org.springframework.boot.jpa.test.autoconfigure.TestEntityManager',
		'static org.assertj.core.api.Assertions.*'
	],
	service: ['org.junit.jupiter.api.Test', 'static org.assertj.core.api.Assertions.*']
};

function dedent(code: string): string {
	return code.replace(/\s+$/, '');
}

function solutionOf(p: Raw): string {
	if (p.kind === 'lines') return dedent(p.solution!);
	const parsed = parseTemplate(p.template!.trimEnd());
	return parsed.lines
		.map((line) => line.map((s) => ('text' in s ? s.text : parsed.gaps[s.gap]!.expected.join(' '))).join(''))
		.join('\n');
}

/** The given code with the solution at the ✎ marker (or given + solution), plus the hidden check. */
function sourceOf(p: Raw): string {
	const code = codeOf(p);
	return p.check ? `${code}\n\n${p.check.trimEnd()}` : code;
}

function codeOf(p: Raw): string {
	const solution = solutionOf(p);
	if (!p.given) return solution;
	const m = MARKER.exec(p.given);
	if (!m) return `${p.given.trimEnd()}\n\n${solution}`;
	const indented = solution
		.split('\n')
		.map((l) => (l ? m[1] + l : l))
		.join('\n');
	return p.given.replace(MARKER, () => indented);
}

const root = resolve(import.meta.dirname, '..');
const seed = resolve(process.env.SEED ?? join(root, '..', 'materials', 'seed'));
const scratch = resolve(process.env.PUZZLE_SCRATCH ?? join(tmpdir(), 'puzzle-verify'));

if (!existsSync(join(scratch, 'gradlew'))) {
	console.log(`Copying seed ${seed} → ${scratch}`);
	cpSync(seed, scratch, { recursive: true, filter: (src) => !/[/\\](build|\.gradle)$/.test(src) });
}

const wanted = process.argv.slice(2);
const files = readdirSync(join(root, 'src/content/puzzles')).filter((f) => f.endsWith('.yaml'));
const bySub = new Map<string, Unit[]>();
for (const file of files) {
	const topic = file.replace(/\.yaml$/, '');
	if (wanted.length && !wanted.includes(topic)) continue;
	const sub = TOPIC_SUBPROJECT[topic];
	if (!sub) throw new Error(`no subproject for topic ${topic}`);
	const puzzles = parse(readFileSync(join(root, 'src/content/puzzles', file), 'utf8')) as Raw[];
	for (const p of puzzles ?? []) {
		const list = bySub.get(sub) ?? [];
		const pkg = p.id.replace(/-/g, '_');
		list.push({ id: p.id, pkg, source: sourceOf(p), mutant: false });
		// A mutant plants a bug in the given code; the puzzle's (correct) tests must catch it.
		for (const [i, m] of (p.mutants ?? []).entries()) {
			if (!p.given?.includes(m.find)) throw new Error(`${p.id}: mutant ${i + 1} text not found in given: ${m.find}`);
			const mutated = { ...p, given: p.given.replace(m.find, m.replace), check: undefined };
			list.push({ id: `${p.id} (Mutant ${i + 1})`, pkg: `${pkg}_m${i + 1}`, source: sourceOf(mutated), mutant: true });
		}
		bySub.set(sub, list);
	}
}

/** Class and table names a puzzle declares; two puzzles sharing one cannot boot in the same Hibernate context. */
function namesOf(source: string): string[] {
	const classes = [...source.matchAll(/\b(?:class|record|enum|interface) (\w+)/g)].map((m) => `class:${m[1]}`);
	const tables = [...source.matchAll(/@(?:Table|CollectionTable|JoinTable)\(name = "(\w+)"/g)].map((m) => `table:${m[1]}`);
	return [...classes, ...tables];
}

/** Greedy split into batches whose puzzles share no names (only Hibernate needs that). */
function batches(units: Unit[], byName: boolean): Unit[][] {
	if (!byName) return [units];
	const out: { items: Unit[]; names: Set<string> }[] = [];
	for (const p of units) {
		const names = namesOf(p.source);
		let batch = out.find((b) => names.every((n) => !b.names.has(n)));
		if (!batch) out.push((batch = { items: [], names: new Set() }));
		batch.items.push(p);
		names.forEach((n) => batch.names.add(n));
	}
	return out.map((b) => b.items);
}

type Case = { pkg: string; name: string; failed: boolean };

/** Test cases from the JUnit XML reports, with the puzzle package they belong to ("" for seed tests). */
function readCases(dir: string, base: string): Case[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith('.xml'))
		.flatMap((f) => {
			const xml = readFileSync(join(dir, f), 'utf8');
			return [...xml.matchAll(/<testcase name="([^"]*)" classname="([^"]*)"[^>]*?(\/>|>([\s\S]*?)<\/testcase>)/g)].map((m) => {
				const pkg = m[2]!.startsWith(`${base}.puzzles.`) ? m[2]!.slice(base.length + 9).split('.')[0]! : '';
				return { pkg, name: `${m[2]}.${m[1]}`, failed: /<(failure|error)\b/.test(m[4] ?? '') };
			});
		});
}

let failed = false;
for (const [key, all] of bySub) {
	const sp = SUBPROJECTS[key]!;
	const rootOf = (set: string) => join(scratch, sp.dir, 'src', set, 'java', sp.base, 'puzzles');
	const clean = () => ['main', 'test'].forEach((set) => rmSync(rootOf(set), { recursive: true, force: true }));
	const results = join(scratch, sp.dir, 'build/test-results/test');
	const groups = batches(all, key === 'jpa');
	for (const [n, units] of groups.entries()) {
		clean();
		for (const p of units) {
			const isTest = /@Test\b/.test(p.source) && TEST_IMPORTS[key];
			const dir = join(rootOf(isTest ? 'test' : sp.sourceSet), p.pkg);
			mkdirSync(dir, { recursive: true });
			// One file per puzzle: top-level types lose `public` so they can share it. Projections name
			// their record as in the course (`ormapping.persistence.X`); here it lives in the puzzle's package.
			const body = p.source
				.replace(/^public (?=(abstract |final |sealed )?(class|record|enum|interface) )/gm, '')
				.replaceAll(`${sp.base}.persistence.`, `${sp.base}.puzzles.${p.pkg}.`);
			const imports = [...sp.imports, ...(isTest ? TEST_IMPORTS[key]! : [])];
			const header = [`package ${sp.base}.puzzles.${p.pkg};`, '', ...imports.map((i) => `import ${i};`), ''].join('\n');
			writeFileSync(join(dir, 'Puzzle.java'), `${header}\n${body}\n`);
		}
		const mutants = units.filter((u) => u.mutant).length;
		console.log(`\n${sp.dir} batch ${n + 1}/${groups.length}: ${units.length - mutants} puzzles, ${mutants} mutants`);
		rmSync(results, { recursive: true, force: true });
		let output = '';
		try {
			// --continue: mutants are supposed to make tests fail; the reports decide.
			execFileSync('./gradlew', [`:${sp.dir}:test`, '--continue', '--console=plain', '-q'], { cwd: scratch, stdio: 'pipe' });
		} catch (e) {
			output = String((e as { stderr?: Buffer }).stderr ?? e);
		}
		const cases = readCases(results, sp.base);
		const problems: string[] = [];
		if (cases.length === 0) problems.push(`no test results – compile error?\n${output}`);
		for (const c of cases.filter((c) => c.failed && !units.find((u) => u.pkg === c.pkg)?.mutant)) {
			problems.push(`test failed: ${c.name}`);
		}
		for (const u of units.filter((u) => u.mutant)) {
			if (!cases.some((c) => c.pkg === u.pkg && c.failed)) problems.push(`not caught: ${u.id}`);
		}
		for (const u of units.filter((u) => !u.mutant && /@Test\b/.test(u.source))) {
			if (cases.length && !cases.some((c) => c.pkg === u.pkg)) problems.push(`no test ran for ${u.id}`);
		}
		if (problems.length === 0) {
			// Keep the report (with Hibernate's DDL) per batch: <scratch>/reports/<subproject>-<n>-*.xml
			mkdirSync(join(scratch, 'reports'), { recursive: true });
			for (const f of readdirSync(results).filter((f) => f.endsWith('.xml'))) {
				cpSync(join(results, f), join(scratch, 'reports', `${sp.dir}-${n + 1}-${f}`));
			}
			console.log('OK');
		} else {
			failed = true;
			console.error(`FAILED (sources under ${rootOf('main')} and ${rootOf('test')})\n- ${problems.join('\n- ')}`);
			break;
		}
	}
	// Keep the sources of a failed batch for inspection.
	if (!failed) clean();
}
process.exit(failed ? 1 : 0);
