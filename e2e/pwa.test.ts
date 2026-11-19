import { expect, test } from '@playwright/test';

test('manifest is served as valid JSON and linked from the page', async ({ page, request }) => {
	const res = await request.get('/manifest.webmanifest');
	expect(res.ok()).toBe(true);
	const manifest = await res.json();
	expect(manifest).toMatchObject({ name: 'POS Lernwerkstatt', short_name: 'Lernwerkstatt', display: 'standalone' });
	expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
	for (const icon of manifest.icons) expect((await request.get(new URL(icon.src, res.url()).href)).ok()).toBe(true);

	await page.goto('/');
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest$/);
});

test('service worker registers, precaches pages and serves them offline', async ({ page, context }) => {
	await page.goto('/');
	await page.evaluate(() => navigator.serviceWorker.ready);
	// First load is not controlled yet; after a reload the worker serves the page.
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

	const cached = await page.evaluate(async () => {
		const names = await caches.keys();
		const cache = await caches.open(names[0]);
		return { names: names.length, pages: (await cache.keys()).length };
	});
	expect(cached.names).toBe(1);
	expect(cached.pages).toBeGreaterThan(50);

	await context.setOffline(true);
	await page.goto('/datenschutz');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await context.setOffline(false);
});
