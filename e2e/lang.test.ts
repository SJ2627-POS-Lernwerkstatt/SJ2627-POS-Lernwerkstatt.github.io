import { expect, test } from '@playwright/test';

const toggle = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /Inhalte auf Englisch/ });

test('content language: switch a unit and its Wissenscheck to English and keep the choice', async ({ page }) => {
	await page.goto('/jpa/rich-types');
	await expect(toggle(page)).toBeVisible();
	await expect(page.getByRole('heading', { level: 1, name: 'Rich Types mit AttributeConverter' })).toBeVisible();

	await toggle(page).click();
	await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('heading', { level: 1, name: 'Rich types with AttributeConverter' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 1, name: 'Rich Types mit AttributeConverter' })).toBeHidden();
	await expect(page.getByRole('heading', { name: 'The type: a record with rules' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Der Typ: ein Record mit Regeln' })).toBeHidden();
	// The site itself stays German, the questions switch.
	await expect(page.getByRole('heading', { name: 'Wissenscheck' })).toBeVisible();
	await expect(page.getByText('Where do you check the rules of a rich type', { exact: false })).toBeVisible();
	await expect(page.getByText('Wo prüfst du die Regeln eines Rich Types', { exact: false })).toBeHidden();

	// Applied before first paint after a reload, and on other pages.
	await page.reload();
	await expect(page.getByRole('heading', { level: 1, name: 'Rich types with AttributeConverter' })).toBeVisible();
	await page.goto('/puzzles/fundament/fund-equals-isbn');
	await expect(page.getByRole('heading', { level: 1, name: /ISBN – equals and hashCode/ })).toBeVisible();
	await expect(page.getByText('// ✎ equals and hashCode')).toBeVisible();

	await toggle(page).click();
	await expect(page.getByRole('heading', { level: 1, name: /ISBN – equals und hashCode/ })).toBeVisible();
});
