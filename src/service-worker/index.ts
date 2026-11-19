import { version } from '$app/env';
import { self } from '$app/service-worker';

// One cache per deployed version; everything else is deleted on activate.
const CACHE = `lernwerkstatt-${version}`;
const SCOPE = self.registration.scope;
const absolute = (path: string) => new URL(path, SCOPE).href;

// Precached on install (kept small for mobile data): the core pages and the hashed JS/CSS they reference, found by
// reading their HTML. Everything else (units, exams, puzzles, mermaid, __data.json) is cached on first visit.
const CORE_PAGES = ['', 'woche', 'heute', 'anmelden', 'einstieg', 'fortschritt', 'datenschutz'].map(absolute);
const OFFLINE = absolute('offline.html');
const ASSET_RE = /_app\/immutable\/[^"'`)\s\\]+/g;

self.addEventListener('install', (event) => {
	// No skipWaiting here: the page shows "Neue Version verfügbar" and asks us to take over (see message handler).
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			const assets = new Set<string>();
			for (const page of CORE_PAGES) {
				const response = await fetch(page);
				if (!response.ok) throw new Error(`precache ${page}: ${response.status}`);
				for (const m of (await response.clone().text()).matchAll(ASSET_RE)) assets.add(absolute(m[0]));
				await cache.put(page, response);
			}
			await cache.addAll([OFFLINE, ...assets]);
		})()
	);
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
	// Client-side navigations never request the page HTML, so the app asks us to store the page it just showed.
	if (event.data?.type === 'CACHE_PAGE' && typeof event.data.url === 'string') {
		const url = new URL(event.data.url, SCOPE);
		if (url.origin === self.location.origin) event.waitUntil(caches.open(CACHE).then((c) => c.add(url.pathname)).catch(() => {}));
	}
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	// Never touch writes, and never touch other origins (the login API lives on its own origin).
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	if (url.pathname.startsWith(new URL('_app/immutable/', SCOPE).pathname) && !request.headers.has('range')) {
		// Hashed, never changes under the same URL: cache first.
		event.respondWith(cacheFirst(request));
	} else {
		event.respondWith(networkFirst(request));
	}
});

async function cacheFirst(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok && response.type === 'basic') void cache.put(request, response.clone());
	return response;
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
			const fallback = await cache.match(OFFLINE);
			if (fallback) return fallback;
		}
		throw error;
	}
}
