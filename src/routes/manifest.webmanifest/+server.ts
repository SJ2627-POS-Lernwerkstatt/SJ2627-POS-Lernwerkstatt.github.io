import { asset, resolve } from '$app/paths';
import { SYNC_ENABLED } from '#lib/sync/config.ts';

export const prerender = true;

// Same values as --bg and --primary in src/app.css (light theme).
const BACKGROUND = '#f6f6f3';
const THEME = '#3d5afe';

/** Web app manifest. With the login enabled at build time the installed app opens on the weekly quest page. */
export function GET() {
	const manifest = {
		name: 'POS Lernwerkstatt',
		short_name: 'Lernwerkstatt',
		lang: 'de',
		description: 'Selbstlernseite für die POS Reife- und Diplomprüfung',
		display: 'standalone',
		start_url: resolve(SYNC_ENABLED ? '/woche' : '/'),
		scope: resolve('/'),
		background_color: BACKGROUND,
		theme_color: THEME,
		icons: [
			{ src: asset('icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
			{ src: asset('icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
			{ src: asset('icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' }
		]
	};
	return new Response(JSON.stringify(manifest), {
		headers: { 'content-type': 'application/manifest+json' }
	});
}
