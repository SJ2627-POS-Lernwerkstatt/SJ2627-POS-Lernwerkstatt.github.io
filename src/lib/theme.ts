export type Theme = 'light' | 'dark' | 'system';

export const THEMES: readonly Theme[] = ['system', 'light', 'dark'];
export const THEME_LABELS: Record<Theme, string> = { system: 'System', light: 'Hell', dark: 'Dunkel' };

/** The theme after `current` when the toggle is pressed. */
export function nextTheme(current: Theme | undefined): Theme {
	return THEMES[(THEMES.indexOf(current ?? 'system') + 1) % THEMES.length];
}

/** Same rule as the inline script in app.html: only an explicit choice sets data-theme. */
export function applyTheme(theme: Theme | undefined, root = document.documentElement) {
	if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
	else delete root.dataset.theme;
}
