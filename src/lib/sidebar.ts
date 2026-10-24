/** Side panel state: collapsed on wide screens (remembered), drawer on narrow screens (not remembered). */

const KEY = 'lernwerkstatt:sidebar';
export const NARROW = '(max-width: 960px)';

export function isNarrow(): boolean {
	return window.matchMedia(NARROW).matches;
}

/** Same rule as the inline script in app.html. */
export function storedCollapsed(): boolean {
	try {
		return localStorage.getItem(KEY) === 'closed';
	} catch {
		return false;
	}
}

export function setCollapsed(collapsed: boolean, root = document.documentElement) {
	if (collapsed) root.dataset.sidebar = 'closed';
	else delete root.dataset.sidebar;
	try {
		if (collapsed) localStorage.setItem(KEY, 'closed');
		else localStorage.removeItem(KEY);
	} catch {
		// Storage blocked: the choice lasts until the page is reloaded.
	}
}

export function setDrawer(open: boolean, root = document.documentElement) {
	if (open) root.dataset.drawer = 'open';
	else delete root.dataset.drawer;
}
