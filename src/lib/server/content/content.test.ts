import { expect, it } from 'vitest';

// Loading the real content index throws on any problem, so this test is the content check in CI.
it('all content files are valid', async () => {
	const { content } = await import('./index');
	expect(content.units.length).toBeGreaterThanOrEqual(0);
});
