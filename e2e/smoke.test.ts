import { expect, test, type Page } from '@playwright/test';

/** The page hydrates with empty progress first; wait until the stored progress is loaded. */
async function hydrated(page: Page) {
	await expect(page.getByRole('button', { name: /Farbschema/ })).toBeVisible();
}

test('unit page: read a unit and answer a Wissenscheck question', async ({ page }) => {
	await page.goto('/');
	await hydrated(page);
	await page.getByRole('link', { name: 'Aufbau eines Tests' }).first().click();
	await expect(page.getByRole('heading', { level: 1, name: 'Aufbau eines Tests' })).toBeVisible();

	const first = page.getByRole('region', { name: 'Frage 1' });
	const check = first.getByRole('button', { name: 'Antwort prüfen' });
	await expect(check).toBeDisabled();
	await first.getByRole('radio').first().check();
	await check.click();
	// Feedback right away: the correct answer is marked and the Vertiefungsfrage opens.
	await expect(first.getByLabel('richtige Antwort')).toBeVisible();
	await expect(first.getByText('Vertiefung 1.1')).toBeVisible();

	await page.getByRole('button', { name: 'Als gelesen markieren' }).click();
	await expect(page.getByText('Du hast diese Einheit als gelesen markiert.')).toBeVisible();
	await page.goto('/testing');
	await expect(page.getByText(/^1 \/ \d+ Einheiten gelesen/)).toBeVisible();
});

test('exercise mode: a run survives a reload and ends with a review', async ({ page }) => {
	await page.goto('/ueben/testing');
	await page.getByRole('button', { name: 'Runde starten' }).click();
	await expect(page.getByText(/Fragengruppe 1 von \d+/)).toBeVisible();

	await page.getByRole('button', { name: 'Weiter' }).click();
	await expect(page.getByText(/Fragengruppe 2 von \d+/)).toBeVisible();
	await page.reload();
	await expect(page.getByText(/Fragengruppe 2 von \d+/)).toBeVisible();

	// Answer nothing more: unanswered questions count as wrong.
	const next = page.getByRole('button', { name: 'Weiter' });
	while (await next.isVisible()) await next.click();
	await page.getByRole('button', { name: 'Runde abgeben' }).click();

	await expect(page.getByRole('heading', { name: 'Auswertung' })).toBeVisible();
	await expect(page.getByText(/\d+ von \d+ Fragen richtig\./)).toBeVisible();

	await page.goto('/ueben');
	await expect(page.getByRole('heading', { name: 'Letzte Runden' })).toBeVisible();
});

test('exercise page: self-rating and "abgegeben" are stored', async ({ page }) => {
	await page.goto('/jpa/uebungen/fahrradverleih');
	await hydrated(page);
	await page.getByRole('radio', { name: 'Gut', exact: true }).check();
	await page.getByLabel('Ich habe diese Aufgabe abgegeben').check();
	await page.reload();
	await hydrated(page);
	await expect(page.getByRole('radio', { name: 'Gut', exact: true })).toBeChecked();
	await expect(page.getByLabel('Ich habe diese Aufgabe abgegeben')).toBeChecked();
});

test('mock exam pages: full exam shows all four tasks, small exam renders its UML', async ({ page }) => {
	await page.goto('/pruefungen/uebungen/autowerkstatt-und-fahrschule');
	await hydrated(page);
	await expect(page.getByRole('heading', { level: 1, name: /Autowerkstatt und Fahrschule/ })).toBeVisible();
	await expect(page.getByText('volle Probeprüfung', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: /Aufgabe \d/ })).toHaveCount(4);

	await page.goto('/pruefungen/uebungen/immobilienmakler');
	await expect(page.getByText('kleine Probeprüfung', { exact: true })).toBeVisible();
	// The task's PlantUML diagram is rendered at build time into an inline-SVG image.
	await expect(page.locator('figure.diagram-plantuml img').first()).toBeVisible();
});

test('side panel: shows the course, marks read units and stays collapsed after a reload', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/testing/aufbau');
	await hydrated(page);
	const panel = page.getByRole('navigation', { name: 'Kursübersicht' });
	await expect(panel.getByRole('link', { name: /Aufbau eines Tests/ })).toHaveAttribute('aria-current', 'page');

	await page.getByRole('button', { name: 'Als gelesen markieren' }).click();
	await expect(panel.getByRole('link', { name: /Aufbau eines Tests/ })).toContainText('✓');

	const toggle = page.getByRole('button', { name: 'Kursübersicht', exact: true });
	await toggle.click();
	await expect(panel).toBeHidden();
	await page.reload();
	await expect(panel).toBeHidden();
	await toggle.click();
	await expect(panel).toBeVisible();
});
