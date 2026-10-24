import { describe, expect, it } from 'vitest';
import { applyTheme, nextTheme } from './theme.ts';

describe('nextTheme', () => {
	it('cycles system → light → dark → system', () => {
		expect(nextTheme(undefined)).toBe('light');
		expect(nextTheme('system')).toBe('light');
		expect(nextTheme('light')).toBe('dark');
		expect(nextTheme('dark')).toBe('system');
	});
});

describe('applyTheme', () => {
	it('sets data-theme only for an explicit choice', () => {
		const root = { dataset: {} as DOMStringMap } as HTMLElement;
		applyTheme('dark', root);
		expect(root.dataset.theme).toBe('dark');
		applyTheme('system', root);
		expect(root.dataset.theme).toBeUndefined();
		applyTheme('light', root);
		applyTheme(undefined, root);
		expect(root.dataset.theme).toBeUndefined();
	});
});
