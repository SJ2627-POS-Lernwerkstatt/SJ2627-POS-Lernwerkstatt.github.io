import { describe, expect, it } from 'vitest';
import { transformCallouts } from './callouts.ts';

describe('transformCallouts', () => {
	it('wraps a callout in an aside with its default title', () => {
		expect(transformCallouts(':::merke\nText\n:::')).toBe(
			'<aside class="callout callout-merke">\n<p class="callout-title">Merke</p>\n\nText\n\n</aside>'
		);
	});

	it('uses English default titles for files under content/en/', () => {
		expect(transformCallouts(':::merke\nText\n:::', '/x/src/content/en/jpa/08-rich-types.md')).toContain(
			'<p class="callout-title">Remember</p>'
		);
		expect(transformCallouts(':::info\nText\n:::', 'src/content/jpa/08-rich-types.md')).toContain(
			'<p class="callout-title">Gut zu wissen</p>'
		);
	});

	it('uses a custom title', () => {
		expect(transformCallouts(':::achtung Falscher Import\nx\n:::')).toContain(
			'<p class="callout-title">Falscher Import</p>'
		);
	});

	it('escapes HTML in titles', () => {
		expect(transformCallouts(':::pruefung List<String>\nx\n:::')).toContain('List&lt;String&gt;');
	});

	it('renders inline code in titles', () => {
		expect(transformCallouts(':::achtung `get()` ohne Prüfung\nx\n:::')).toContain(
			'<p class="callout-title"><code>get()</code> ohne Prüfung</p>'
		);
		expect(transformCallouts(':::merke `List<T>`\nx\n:::')).toContain('<code>List&lt;T&gt;</code>');
	});

	it('leaves code fences alone', () => {
		const src = '```text\n:::merke\n:::\n```';
		expect(transformCallouts(src)).toBe(src);
	});

	it('rejects unknown, nested, unclosed and stray callouts with line numbers', () => {
		expect(() => transformCallouts('a\n:::tipp\n:::', 'u.md')).toThrow('u.md:2: unknown callout ":::tipp"');
		expect(() => transformCallouts(':::merke\n:::achtung\n:::\n:::')).toThrow(/cannot be nested/);
		expect(() => transformCallouts(':::merke\ntext')).toThrow(/:1: callout is never closed/);
		expect(() => transformCallouts('text\n:::')).toThrow(/:2: ":::" without an opening callout/);
	});
});
