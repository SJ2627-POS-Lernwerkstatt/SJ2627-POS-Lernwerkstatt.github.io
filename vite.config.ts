import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Units and pages can be written in Markdown (.md) with Svelte components inside.
			extensions: ['.svelte', '.md'],
			preprocess: [mdsvex({ extensions: ['.md'] })],
			// Every page is prerendered; 404.html is the fallback for unknown paths on GitHub Pages.
			adapter: adapter({ fallback: '404.html' })
		})
	],
	test: {
		include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
	}
});
