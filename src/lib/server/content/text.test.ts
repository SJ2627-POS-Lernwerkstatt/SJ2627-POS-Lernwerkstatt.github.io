import { describe, expect, it } from 'vitest';
import { renderInline, renderMarkdown } from './text.ts';

describe('renderInline', () => {
	it('renders code, bold and italic, and escapes HTML', () => {
		expect(renderInline('Mit `List<String>` und **fett** und *kursiv* <b>')).toBe(
			'Mit <code>List&lt;String&gt;</code> und <strong>fett</strong> und <em>kursiv</em> &lt;b&gt;'
		);
	});

	it('does not format inside inline code', () => {
		expect(renderInline('`a * b * c`')).toBe('<code>a * b * c</code>');
	});
});

describe('renderMarkdown', () => {
	it('renders paragraphs and lists', async () => {
		expect(await renderMarkdown('Eins\nzwei\n\n- a\n- `b`\n\n1. x\n2. y')).toBe(
			'<p>Eins zwei</p><ul><li>a</li><li><code>b</code></li></ul><ol><li>x</li><li>y</li></ol>'
		);
	});

	it('highlights fenced code and keeps blank lines inside it', async () => {
		const html = await renderMarkdown('Vorher\n\n```java\nint a = 1;\n\nint b = 2;\n```\n\nNachher');
		expect(html.startsWith('<p>Vorher</p><pre class="shiki')).toBe(true);
		expect(html).toContain('int');
		expect(html.endsWith('<p>Nachher</p>')).toBe(true);
	});
});
