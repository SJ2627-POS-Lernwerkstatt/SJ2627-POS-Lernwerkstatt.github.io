import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';

// One cache per deployed version; everything else is deleted on activate.
const CACHE = `lernwerkstatt-${version}`;
const SCOPE = self.registration.scope;
const absolute = (path: string) => new URL(path, SCOPE).href;

// Precache: all build output (hashed, immutable), static files, and the prerendered pages. Not precached, to keep the
// install small: the exercise/puzzle pages and the per-page `__data.json` files. Those are cached when visited.
const LAZY = /(^|\/)(__data\.json$|puzzles\/|ueben\/)/;
const shell = [...immutable, ...assets, ...prerendered].map((entry) => entry.path).filter((path) => !LAZY.test(path));
const SHELL = shell.map(absolute);
const SHELL_SET = new Set(SHELL);

self.addEventListener('install', (event) => {
	// No skipWaiting here: the page shows "Neue Version verfügbar" and asks us to take over (see message handler).
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
			await self.clients.claim();
		})()
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	// Never touch writes, and never touch other origins (the login API lives on its own origin).
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	// Versioned build output and static files never change under the same URL: cache first.
	if (SHELL_SET.has(url.origin + url.pathname) && !request.headers.has('range') && request.mode !== 'navigate') {
		event.respondWith(cacheFirst(request));
		return;
	}
	// Pages and anything else: network first, the cache is the offline fallback.
	event.respondWith(networkFirst(request));
});

async function cacheFirst(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	return (await cache.match(request)) ?? fetch(request);
}

async function networkFirst(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	try {
		const response = await fetch(request);
		if (response.ok && response.type === 'basic') void cache.put(request, response.clone());
		return response;
	} catch (error) {
		const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
		if (cached) return cached;
		if (request.mode === 'navigate') {
			const fallback = (await cache.match(absolute('404.html'))) ?? (await cache.match(SCOPE));
			if (fallback) return fallback;
		}
		throw error;
	}
}
