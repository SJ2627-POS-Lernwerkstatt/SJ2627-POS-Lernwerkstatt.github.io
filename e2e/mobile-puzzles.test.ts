import { expect, test, type Locator, type Page } from '@playwright/test';

// A phone: 375 x 740, touch only. Every piece is placed by tapping.
test.use({ viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

async function hydrated(page: Page) {
	await expect(page.getByRole('button', { name: /Farbschema/ })).toBeVisible();
	// The tray's mode switch only exists once the page is interactive.
	await expect(page.getByRole('checkbox', { name: /Tippen/ })).toBeChecked();
}

/** Tapping a piece folds the tray; wait until the page has stopped moving (and the tap guard of 250 ms is over) before the next tap. */
const settle = (page: Page) => page.evaluate(() => new Promise((done) => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(done)), 300)));

/** A tap, once the page has settled from the previous one. */
const tap = async (page: Page, target: Locator) => {
	await settle(page);
	await target.tap();
};

async function noSideScroll(page: Page) {
	const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
	expect(scroll).toBeLessThanOrEqual(client);
}

test('line puzzle: solved by tapping only, on a 375 px screen', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-room-fields');
	await hydrated(page);
	await noSideScroll(page);

	const pool = page.getByTestId('pool');
	const end = page.getByRole('button', { name: 'Ans Ende der Lösung setzen' });

	// Selecting shows the insertion points; tapping the piece again would deselect it.
	await tap(page, pool.getByText('private Long id;', { exact: true }));
	await expect(page.getByRole('status')).toContainText('Ausgewählt');
	await expect(end).toBeVisible();
	await tap(page, page.getByRole('button', { name: 'Abbrechen' }));
	await expect(end).toHaveCount(0);

	// Build the solution; the last line first, so insertion in the middle is used too.
	const order = [
		'@Entity',
		'@Table(name = "rooms")',
		'@Getter',
		'@Setter',
		'@NoArgsConstructor(access = AccessLevel.PROTECTED)',
		'@AllArgsConstructor',
		'public class Room extends AbstractPersistable<Long> {',
		'@NotNull',
		'private String name;',
		'}'
	];
	for (const line of order) {
		await tap(page, pool.getByText(line, { exact: true }));
		await expect(end).toBeVisible();
			await tap(page, end);
		await expect(end).toHaveCount(0);
		}
	// Forgotten field: insert it before the closing brace.
	await tap(page, pool.getByText('private Integer seats;', { exact: true }));
	await tap(page, page.getByRole('button', { name: 'Vor Zeile 10 einfügen' }));

	// Touch targets of the placed lines and the pieces are at least 44 px high.
	const answer = page.getByTestId('answer');
	for (const li of await answer.getByRole('listitem').all()) expect((await li.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
	for (const li of await pool.getByRole('listitem').all()) expect((await li.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
	await noSideScroll(page);

	await page.screenshot({ path: 'test-results/mobile-line-puzzle.png' });
	await tap(page, page.getByRole('button', { name: 'Prüfen' }));
	await expect(page.getByText('Richtig!')).toBeVisible();
});

test('line puzzle: a placed line goes back to the tray by tapping it', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-room-fields');
	await hydrated(page);
	const pool = page.getByTestId('pool');
	await tap(page, pool.getByText('@Entity', { exact: true }));
	await tap(page, page.getByRole('button', { name: 'Ans Ende der Lösung setzen' }));
	await expect(page.getByTestId('answer').getByText('@Entity', { exact: true })).toBeVisible();
	await expect(pool.getByText('@Entity', { exact: true })).toHaveCount(0);
	await tap(page, page.getByTestId('answer').getByText('@Entity', { exact: true }));
	await expect(pool.getByText('@Entity', { exact: true })).toBeVisible();
});

test('template puzzle: solved by tapping only', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-publisher-own-id');
	await hydrated(page);
	await noSideScroll(page);

	const pool = page.getByTestId('pool');
	const fill = async (piece: string, gap: number) => {
		await tap(page, pool.getByText(piece, { exact: true }));
		await expect(page.getByTestId(`gap-${gap}`)).toHaveClass(/target/);
			await tap(page, page.getByTestId(`gap-${gap}`));
		await expect(page.getByTestId(`gap-${gap}`).getByText(piece, { exact: true })).toBeVisible();
	};
	await fill('@Id', 0);
	// Both annotations share one gap (any order); `Long` is the second gap.
	await fill('@GeneratedValue', 0);
	await fill('Long', 1);
	await page.screenshot({ path: 'test-results/mobile-template-puzzle.png' });

	await tap(page, page.getByRole('button', { name: 'Prüfen' }));
	await expect(page.getByText('Richtig!')).toBeVisible();
});

test('long puzzle: shows "Laptop empfohlen" and stays playable without side scroll', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-book-columns');
	await hydrated(page);
	await expect(page.getByText('Laptop empfohlen')).toBeVisible();
	await tap(page, page.getByTestId('pool').getByText('Entity', { exact: true }));
	await tap(page, page.getByTestId('gap-0'));
	await expect(page.getByTestId('gap-0').getByText('Entity', { exact: true })).toBeVisible();
	await noSideScroll(page);
});

test('short puzzle: no laptop hint', async ({ page }) => {
	await page.goto('/puzzles/jpa-entity/entity-publisher-own-id');
	await hydrated(page);
	await expect(page.getByText('Laptop empfohlen')).toHaveCount(0);
});

test.describe('desktop: tap mode is a switch, and works with the keyboard', () => {
	test.use({ viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false });

	test('Tab to a piece, Enter selects, Enter on a target places', async ({ page }) => {
		await page.goto('/puzzles/jpa-entity/entity-publisher-own-id');
		await expect(page.getByRole('button', { name: /Farbschema/ })).toBeVisible();
		const mode = page.getByRole('checkbox', { name: /Tippen/ });
		await expect(mode).not.toBeChecked();
		await mode.check();

		const pool = page.getByTestId('pool');
		await pool.getByText('@Id', { exact: true }).focus();
		await page.keyboard.press('Enter');
		await expect(pool.getByLabel('@Id, ausgewählt')).toBeVisible();
		const gap = page.getByTestId('gap-0');
		await expect(gap).toHaveAttribute('aria-label', 'Lücke 1, @Id hier einsetzen');
		await gap.focus();
		await page.keyboard.press('Enter');
		await expect(gap.getByText('@Id', { exact: true })).toBeVisible();
		// Enter on a placed piece sends it back.
		await gap.getByText('@Id', { exact: true }).focus();
		await page.keyboard.press('Enter');
		await expect(pool.getByText('@Id', { exact: true })).toBeVisible();
	});

	test('line puzzle: select with Enter, focus moves to the first insertion point', async ({ page }) => {
		await page.goto('/puzzles/jpa-entity/entity-room-fields');
		await expect(page.getByRole('button', { name: /Farbschema/ })).toBeVisible();
		await page.getByRole('checkbox', { name: /Tippen/ }).check();
		const pool = page.getByTestId('pool');
		await pool.getByLabel('@Entity, antippen zum Auswählen').focus();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('button', { name: 'Ans Ende der Lösung setzen' })).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page.getByTestId('answer').getByText('@Entity', { exact: true })).toBeVisible();
	});
});
