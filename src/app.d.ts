// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {}
	/** True only in builds with PUBLIC_API_URL=mock (vite.config.ts). */
	const __API_MOCK__: boolean;
}

export {};
