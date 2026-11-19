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

	// Only the core pages are precached.
	const cached = await page.evaluate(async () => {
		const names = await caches.keys();
		const cache = await caches.open(names[0]);
		return { names: names.length, urls: (await cache.keys()).map((r) => new URL(r.url).pathname) };
	});
	expect(cached.names).toBe(1);
	expect(cached.urls).toEqual(expect.arrayContaining(['/', '/woche', '/datenschutz', '/offline.html']));
	expect(cached.urls.length).toBeLessThan(80);
	expect(cached.urls.some((u) => u.includes('/puzzles/'))).toBe(false);

	// A unit page visited online is available offline afterwards; one never visited shows the offline page.
	await page.goto('/');
	await page.getByRole('link', { name: 'Aufbau eines Tests' }).first().click();
	await expect(page.getByRole('heading', { level: 1, name: 'Aufbau eines Tests' })).toBeVisible();
	const unitPath = new URL(page.url()).pathname;
	await page.goto('/datenschutz');

	await context.setOffline(true);
	await page.goto(unitPath);
	await expect(page.getByRole('heading', { level: 1, name: 'Aufbau eines Tests' })).toBeVisible();
	await page.goto('/jpa');
	await expect(page.getByText('Du bist offline – diese Seite war noch nicht geladen.')).toBeVisible();
	await context.setOffline(false);
});
