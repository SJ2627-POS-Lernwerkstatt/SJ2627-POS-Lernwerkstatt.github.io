import { resolve } from '$app/paths';

/** Quest items carry site-relative links like "/jpa/entity"; this adds the base path. */
export function siteHref(href: string): string {
	return resolve(href.replace(/^\//, '') as '/');
}
