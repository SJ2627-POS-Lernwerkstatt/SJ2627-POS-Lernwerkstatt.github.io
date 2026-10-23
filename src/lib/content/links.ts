/** The cheat sheet is hosted privately; students are logged in to GitHub and have access. */
export const CHEAT_SHEET_URL = 'https://studious-system-8e43kky.pages.github.io/POS_Java_CheatSheet.pdf';

export const REPO_URL = 'https://github.com/SJ2627-POS-Lernwerkstatt/SJ2627-POS-Lernwerkstatt.github.io';

export function cheatSheetPage(page: number): string {
	return `${CHEAT_SHEET_URL}#page=${page}`;
}

/** Prefilled GitHub issue for reporting a mistake on a page. */
export function reportIssueUrl(what: string, title: string, pageUrl: string): string {
	const params = new URLSearchParams({
		title: `Fehler in ${what}: ${title}`,
		body: `Seite: ${pageUrl}\n\nWas ist falsch?\n\n`,
		labels: 'inhalt'
	});
	return `${REPO_URL}/issues/new?${params}`;
}
