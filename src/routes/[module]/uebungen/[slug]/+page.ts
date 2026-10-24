import type { Component } from 'svelte';
import type { PageLoad } from './$types';

// One chunk per exercise, loaded only on that exercise's page.
const components = import.meta.glob<{ default: Component }>('/src/content/*/exercises/*.md');

export const load: PageLoad = async ({ data }) => {
	const { default: component } = await components[`/src/content/${data.exercise.file}`]();
	return { ...data, component };
};
