import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { markdown } from './scripts/markdown/index.ts';

export default defineConfig({
	// Lets a real build drop src/lib/sync/mock.ts entirely (see session.svelte.ts).
	define: { __API_MOCK__: JSON.stringify(process.env.PUBLIC_API_URL === 'mock') },
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Units and pages can be written in Markdown (.md) with Svelte components inside.
			extensions: ['.svelte', '.md'],
			preprocess: markdown,
			// Every page is prerendered; 404.html is the fallback for unknown paths on GitHub Pages.
			adapter: adapter({ fallback: '404.html' })
		})
	],
	test: {
		include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
	}
});
