import { describe, expect, it } from 'vitest';
import { sanitizeNext } from './next.ts';

describe('sanitizeNext', () => {
	it('keeps site-relative paths', () => {
		expect(sanitizeNext('/woche')).toBe('/woche');
		expect(sanitizeNext('/heute')).toBe('/heute');
		expect(sanitizeNext('/ueben/jpa')).toBe('/ueben/jpa');
		expect(sanitizeNext('/ueben/jpa?x=1#a')).toBe('/ueben/jpa?x=1#a');
	});
	it('falls back to /woche for everything else', () => {
		for (const bad of [null, undefined, '', 'woche', '//evil.example', '///evil.example', 'https://evil.example', 'javascript:alert(1)', '/\\evil.example', '\\\\evil.example', '/a\nb', ' /woche']) {
			expect(sanitizeNext(bad)).toBe('/woche');
		}
	});
});
