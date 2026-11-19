export const DEFAULT_NEXT = '/woche';

/**
 * The `next` query param of /anmelden: only a site-relative path that starts with a single "/" is allowed
 * (no "//", no backslashes, no scheme); anything else goes to /woche.
 */
export function sanitizeNext(value: string | null | undefined): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return DEFAULT_NEXT;
	try {
		// Must stay on the same origin once resolved.
		if (new URL(value, 'https://site.invalid').origin !== 'https://site.invalid') return DEFAULT_NEXT;
	} catch {
		return DEFAULT_NEXT;
	}
	return value;
}
