import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	/**
	 * Base URL of the Advent-of-Matura backend, e.g. "https://example.org/api". Empty or unset: the whole login
	 * feature is hidden. "mock": an in-browser fake API for development and e2e tests (src/lib/sync/mock.ts).
	 */
	PUBLIC_API_URL: {
		public: true,
		static: true,
		schema: (value) => (value ?? '').trim()
	}
});
