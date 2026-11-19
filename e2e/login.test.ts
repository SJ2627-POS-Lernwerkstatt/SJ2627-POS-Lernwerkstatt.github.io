import { expect, test, type Page } from '@playwright/test';

// Needs a build with PUBLIC_API_URL=mock (npm run test:e2e:mock).
test.use({ viewport: { width: 375, height: 740 } });

async function noHorizontalScroll(page: Page) {
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	expect(overflow).toBeLessThanOrEqual(0);
}

test('login with the mock code, read a unit, see it done, get the next suggestion', async ({ page }) => {
	// Logged out: /woche explains and links to the login.
	await page.goto('/woche');
	await expect(page.getByRole('link', { name: 'Anmelden' }).first()).toBeVisible();

	await page.goto('/anmelden');
	await page.getByLabel('E-Mail-Adresse').fill('schueler@schule.test');
	await page.getByRole('button', { name: 'Code senden' }).click();
	await expect(page.getByText(/6-stelligen Code/)).toBeVisible();
	await expect(page.getByText(/Auf dem iPhone/)).toBeVisible();

	// A wrong code is explained, the right one logs in.
	const code = page.getByLabel('Code');
	await expect(code).toHaveAttribute('autocomplete', 'one-time-code');
	await expect(code).toHaveAttribute('inputmode', 'numeric');
	await code.fill('111111');
	await page.getByRole('button', { name: 'Anmelden' }).click();
	await expect(page.getByRole('alert')).toContainText('Der Code stimmt nicht');
	await code.fill('123456');
	await page.getByRole('button', { name: 'Anmelden' }).click();

	await expect(page).toHaveURL(/\/woche$/);
	await expect(page.getByRole('heading', { level: 2, name: 'Wochenziel' })).toBeVisible();
	const items = page.locator('section[aria-labelledby="items"] li');
	await expect(items.first()).toBeVisible();
	await noHorizontalScroll(page);

	// /heute suggests one thing; remember which, and read exactly that unit.
	await page.goto('/heute');
	const open = page.getByRole('link', { name: "Los geht's" });
	await expect(open).toBeVisible();
	const first = await page.getByTestId('suggestion').innerText();
	await noHorizontalScroll(page);
	await open.click();
	await page.getByRole('button', { name: 'Als gelesen markieren' }).click();
	await expect(page.getByText('Du hast diese Einheit als gelesen markiert.')).toBeVisible();

	// The item is now done on /woche (client-side navigation keeps the session) ...
	await page.goto('/woche');
	const row = page.locator('section[aria-labelledby="items"] li', { hasText: first }).first();
	await expect(row).toHaveClass(/done/);
	await expect(page.getByText(/^\d+ von \d+ erledigt$|Wochenziel geschafft/).first()).toBeVisible();

	// ... and /heute moves on to the next one.
	await page.goto('/heute');
	await expect(page.getByRole('link', { name: "Los geht's" })).toBeVisible();
	await expect(page.getByTestId('suggestion')).not.toHaveText(first);

	// Logout from /fortschritt; the progress stays.
	await page.goto('/fortschritt');
	await page.getByRole('button', { name: 'Abmelden' }).click();
	await expect(page.getByRole('button', { name: 'Abmelden' })).toHaveCount(0);
	await expect(page.getByText(/^1\s*Gelesene Einheiten/).or(page.getByText('Gelesene Einheiten'))).toBeVisible();
});

test('link token: only the button redeems it; next is honoured, bad next falls back', async ({ page }) => {
	await page.goto('/anmelden?t=abc123&next=/heute');
	await expect(page.getByText(/Link aus der E-Mail/)).toBeVisible();
	await page.waitForTimeout(300);
	await expect(page).toHaveURL(/anmelden/);
	await page.getByRole('button', { name: 'Anmelden' }).click();
	await expect(page).toHaveURL(/\/heute$/);

	// Already logged in: straight to next, no button.
	await page.goto('/anmelden?t=other&next=/ueben');
	await expect(page).toHaveURL(/\/ueben$/);

	// An external target is ignored.
	await page.evaluate(() => localStorage.removeItem('lernwerkstatt:session'));
	await page.goto('/anmelden?t=abc123&next=//evil.example');
	await page.getByRole('button', { name: 'Anmelden' }).click();
	await expect(page).toHaveURL(/\/woche$/);
});
