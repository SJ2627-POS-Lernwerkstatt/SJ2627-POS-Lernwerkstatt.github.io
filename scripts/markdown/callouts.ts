/**
 * Turns callout blocks into HTML before mdsvex sees the file:
 *
 *   :::merke            ->  <aside class="callout callout-merke">
 *   Text **Markdown**       <p class="callout-title">Merke</p>
 *   :::                     ...Markdown stays Markdown...
 *                           </aside>
 *
 * mdsvex uses remark 8, which has no directive syntax, so this is done on the raw text.
 * Blank lines around the HTML tags keep the inner text parsed as Markdown.
 */

export const CALLOUTS = {
	merke: 'Merke',
	achtung: 'Achtung',
	pruefung: 'Prüfung'
} as const;

const OPEN = /^:::(\w+)(?:[ \t]+(.+?))?[ \t]*$/;
const CLOSE = /^:::[ \t]*$/;
const FENCE = /^(`{3,}|~{3,})/;

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function transformCallouts(source: string, file = 'markdown'): string {
	const lines = source.split('\n');
	const out: string[] = [];
	let fence: string | null = null;
	let open: { kind: string; line: number } | null = null;

	lines.forEach((line, i) => {
		const fenceMatch = FENCE.exec(line.trim());
		if (fenceMatch) {
			if (fence === null) fence = fenceMatch[1][0];
			else if (fenceMatch[1][0] === fence) fence = null;
			out.push(line);
			return;
		}
		if (fence !== null) {
			out.push(line);
			return;
		}

		const opening = OPEN.exec(line);
		if (opening) {
			const kind = opening[1];
			if (!(kind in CALLOUTS)) {
				throw new Error(`${file}:${i + 1}: unknown callout ":::${kind}" (allowed: ${Object.keys(CALLOUTS).join(', ')})`);
			}
			if (open) throw new Error(`${file}:${i + 1}: callouts cannot be nested (open since line ${open.line})`);
			open = { kind, line: i + 1 };
			const title = opening[2] ?? CALLOUTS[kind as keyof typeof CALLOUTS];
			out.push(`<aside class="callout callout-${kind}">`, `<p class="callout-title">${escapeHtml(title)}</p>`, '');
			return;
		}
		if (CLOSE.test(line)) {
			if (!open) throw new Error(`${file}:${i + 1}: ":::" without an opening callout`);
			open = null;
			out.push('', '</aside>');
			return;
		}
		out.push(line);
	});

	if (open !== null) {
		throw new Error(`${file}:${(open as { line: number }).line}: callout is never closed with ":::"`);
	}
	return out.join('\n');
}
