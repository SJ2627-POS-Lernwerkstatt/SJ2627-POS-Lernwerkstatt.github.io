/** One piece of a unit that is read out in one go; `el` is highlighted while it is spoken. */
export type SpeechBlock = { el: HTMLElement; text: string };

const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * Splits rendered unit Markdown into blocks to read. Code is not read out: each code block is
 * announced as "Codebeispiel", diagrams by their caption, tables only by name.
 */
export function speechBlocks(root: HTMLElement): SpeechBlock[] {
	const out: SpeechBlock[] = [];
	const add = (el: HTMLElement, text: string) => {
		const t = clean(text);
		if (t) out.push({ el, text: t });
	};

	const visit = (el: HTMLElement) => {
		const tag = el.tagName;
		if (tag === 'PRE' || el.querySelector(':scope > pre.shiki')) return add(el, 'Codebeispiel.');
		if (tag === 'FIGURE' || el.dataset.tts === 'skip') {
			const caption = el.querySelector('figcaption')?.textContent;
			return add(el, caption ? `Diagramm: ${caption}.` : 'Diagramm.');
		}
		if (tag === 'TABLE') return add(el, 'Tabelle.');
		if (tag === 'UL' || tag === 'OL') {
			for (const li of el.querySelectorAll<HTMLElement>(':scope > li')) add(li, li.textContent ?? '');
			return;
		}
		if (tag === 'ASIDE' || tag === 'DIV' || tag === 'SECTION') {
			for (const child of el.children) visit(child as HTMLElement);
			return;
		}
		add(el, el.textContent ?? '');
	};

	for (const child of root.children) visit(child as HTMLElement);
	return out;
}
