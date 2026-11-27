/** Language of the course content. Units, questions and puzzles can be read in English; the site stays German. */
export type Lang = 'de' | 'en';

/** Same rule as the inline script in app.html: only English sets data-lang, German is the default. */
export function applyLang(lang: Lang | undefined, root = document.documentElement) {
	if (lang === 'en') root.dataset.lang = 'en';
	else delete root.dataset.lang;
}

/** German text, or the English one when English is chosen and a translation exists. For text that cannot be rendered twice (page title, mermaid). */
export function pick<T>(lang: Lang | undefined, de: T, en: T | undefined): T {
	return lang === 'en' && en !== undefined ? en : de;
}
