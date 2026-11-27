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
	// The draft/review status is for the hidden /review page only.
	await expect(page.getByText('Entwurf')).toHaveCount(0);

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
	await expect(page.getByRole('heading', { level: 2, name: /Aufgabe (A1|A2|B|C) / })).toHaveCount(4);

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

test('puzzles: a wrong try is marked, the right order is solved and stored', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-room-fields');
	await hydrated(page);
	const pool = page.getByTestId('pool');
	const answer = page.getByTestId('answer');
	const place = (text: string) => pool.getByText(text, { exact: true }).click();

	// A red herring first: marked wrong, then keep working.
	await place('private Long id;');
	await page.getByRole('button', { name: 'Prüfen' }).click();
	await expect(page.getByText(/Noch nicht ganz – 0 % richtig/)).toBeVisible();
	await page.getByRole('button', { name: 'Weiter bearbeiten' }).click();
	await answer.getByText('private Long id;', { exact: true }).click();

	// Annotations on one element may come in any order.
	for (const line of [
		'@Table(name = "rooms")',
		'@AllArgsConstructor',
		'@Entity',
		'@Getter',
		'@NoArgsConstructor(access = AccessLevel.PROTECTED)',
		'@Setter',
		'public class Room extends AbstractPersistable<Long> {',
		'@NotNull',
		'private String name;',
		'private Integer seats;',
		'}'
	]) {
		await place(line);
	}
	await page.getByRole('button', { name: 'Prüfen' }).click();
	await expect(page.getByText('Richtig!')).toBeVisible();

	await page.goto('/puzzles/jpa-entity');
	await hydrated(page);
	await expect(page.getByText(/^1 von \d+ gelöst$/)).toBeVisible();
});

test('puzzles: a template puzzle shows the solution after a wrong try', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-publisher-own-id');
	await hydrated(page);
	await page.getByTestId('pool').getByText('long', { exact: true }).click();
	await page.getByRole('button', { name: 'Prüfen' }).click();
	await page.getByRole('button', { name: 'Lösung zeigen' }).click();
	await expect(page.getByRole('heading', { name: 'Lösung' })).toBeVisible();
	await expect(page.getByText('@GeneratedValue', { exact: false }).filter({ visible: true }).last()).toBeVisible();
});

test('puzzles: long puzzles keep the pieces in view (side by side, or docked on a phone)', async ({ page }) => {
	const url = '/puzzles/jpa-entity/entity-book-columns';
	const pool = page.getByTestId('pool');

	// Desktop: task | code | pieces, course panel hidden; the pieces stay in view while scrolling.
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto(url);
	await hydrated(page);
	await expect(page.getByRole('navigation', { name: 'Kursübersicht' })).toBeHidden();
	await page.mouse.wheel(0, 600);
	await expect(pool).toBeInViewport();
	const box = (await pool.boundingBox())!;
	const code = (await page.getByRole('group', { name: 'Code mit Lücken' }).boundingBox())!;
	expect(box.x).toBeGreaterThan(code.x + code.width - 1);

	// Phone: the task folds away after the first piece, the pieces stay docked at the bottom.
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(url);
	await hydrated(page);
	// Narrow screens start in tap mode: select the piece, then tap the gap.
	await pool.getByText('Entity', { exact: true }).click();
	await page.waitForTimeout(300); // taps right after selecting are ignored
	await page.getByTestId('gap-0').click();
	await expect(page.getByText('einblenden')).toBeVisible();
	await page.mouse.wheel(0, 400);
	await expect(pool).toBeInViewport();
});

// Which build is under test: set PUBLIC_API_URL to the same value the build used ('mock' is covered by login.test.ts).
const apiUrl = process.env.PUBLIC_API_URL ?? '';

test('without PUBLIC_API_URL there is no login UI', async ({ page }) => {
	test.skip(apiUrl !== '', 'this build has the login enabled');
	await page.goto('/');
	await hydrated(page);
	await expect(page.getByRole('link', { name: /Anmelden|Lernwerkstatt-Login|Woche/ })).toHaveCount(0);
	await page.goto('/fortschritt');
	await hydrated(page);
	await expect(page.getByRole('button', { name: 'Abmelden' })).toHaveCount(0);
});

test('with PUBLIC_API_URL the login is offered and /anmelden shows the email form', async ({ page }) => {
	test.skip(apiUrl === '' || apiUrl === 'mock', 'needs a build with a real PUBLIC_API_URL');
	// Rendering should not need the API; answer anything that does (e.g. a session check) as logged out.
	await page.route(`${apiUrl.replace(/\/$/, '')}/**`, (route) => route.fulfill({ status: 401, json: {} }));
	await page.goto('/');
	await hydrated(page);
	await expect(page.getByRole('link', { name: 'Lernwerkstatt-Login' }).first()).toBeVisible();
	await page.goto('/anmelden');
	await hydrated(page);
	await expect(page.getByLabel(/E-Mail/i)).toBeVisible();
});

test('Mindestanforderung: badge only on tagged units, no Entwurf, module toggle filters', async ({ page }) => {
	await page.goto('/testing/aufbau');
	await expect(page.getByRole('heading', { level: 1, name: 'Aufbau eines Tests' })).toBeVisible();
	await expect(page.getByTestId('mindest')).toBeVisible();
	await expect(page.getByText('Entwurf')).toHaveCount(0);

	await page.goto('/testing/lebenszyklus');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByTestId('mindest')).toHaveCount(0);

	await page.goto('/testing');
	await expect(page.getByText('Mindestanforderung = das brauchst du für ein Genügend. Alles andere bringt bessere Noten.')).toBeVisible();
	await expect(page.getByText('Entwurf')).toHaveCount(0);
	const lifecycle = page.getByRole('main').getByRole('link', { name: /Lebenszyklus/ });
	const aufbau = page.getByRole('main').getByRole('link', { name: 'Aufbau eines Tests' });
	await expect(lifecycle).toBeVisible();
	await page.getByLabel('Nur Mindestanforderung zeigen').check();
	await expect(lifecycle).toHaveCount(0);
	await expect(aufbau).toBeVisible();
	// Remembered across a reload.
	await page.reload();
	await expect(page.getByLabel('Nur Mindestanforderung zeigen')).toBeChecked();
	await expect(lifecycle).toHaveCount(0);
});
