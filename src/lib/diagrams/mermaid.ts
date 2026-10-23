/** Renders <pre class="mermaid"> blocks inside `root`. Mermaid is only downloaded when a page has a diagram. */
export async function renderMermaid(root: HTMLElement): Promise<void> {
	const nodes = [...root.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])')];
	if (nodes.length === 0) return;

	const { default: mermaid } = await import('mermaid');
	mermaid.initialize({
		startOnLoad: false,
		securityLevel: 'strict',
		theme: isDark() ? 'dark' : 'neutral',
		fontFamily: getComputedStyle(document.body).fontFamily
	});
	await mermaid.run({ nodes });
}

function isDark(): boolean {
	const theme = document.documentElement.dataset.theme;
	if (theme === 'dark' || theme === 'light') return theme === 'dark';
	return matchMedia('(prefers-color-scheme: dark)').matches;
}
