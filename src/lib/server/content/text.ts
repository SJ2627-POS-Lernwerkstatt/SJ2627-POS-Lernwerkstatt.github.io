import { highlightToHtml } from '../../../../scripts/markdown/highlight.ts';

/**
 * Markdown subset for question prompts, options and explanations (rendered at build time):
 * paragraphs, "- " and "1. " lists, ```fenced code```, `inline code`, **bold**, *italic*.
 * Everything else is shown as plain text. HTML is always escaped.
 */

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderInline(text: string): string {
	return text
		.split(/(`[^`]+`)/)
		.map((part) => {
			if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
				return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
			}
			return escapeHtml(part)
				.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
				.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
		})
		.join('');
}

const FENCE = /^```(\w*)[^\n]*\n([\s\S]*?)\n```\s*$/;

async function renderBlock(block: string): Promise<string> {
	const fence = FENCE.exec(block);
	if (fence) return highlightToHtml(fence[2], fence[1] || 'java');

	const lines = block.split('\n');
	if (lines.every((l) => /^[-*] /.test(l))) {
		return `<ul>${lines.map((l) => `<li>${renderInline(l.slice(2))}</li>`).join('')}</ul>`;
	}
	if (lines.every((l) => /^\d+\. /.test(l))) {
		return `<ol>${lines.map((l) => `<li>${renderInline(l.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
	}
	return `<p>${lines.map(renderInline).join(' ')}</p>`;
}

/** Splits on blank lines, but keeps fenced code blocks (which may contain blank lines) together. */
function blocks(text: string): string[] {
	const out: string[] = [];
	let current: string[] = [];
	let inFence = false;
	for (const line of text.replace(/\r\n/g, '\n').trim().split('\n')) {
		if (line.startsWith('```')) inFence = !inFence;
		if (!inFence && line.trim() === '' && !line.startsWith('```')) {
			if (current.length) out.push(current.join('\n'));
			current = [];
		} else current.push(line);
	}
	if (current.length) out.push(current.join('\n'));
	return out;
}

export async function renderMarkdown(text: string): Promise<string> {
	return (await Promise.all(blocks(text).map(renderBlock))).join('');
}
