import type { Component } from 'svelte';
import type { PageLoad } from './$types';

// One chunk per unit, loaded only on that unit's page.
const components = import.meta.glob<{ default: Component }>('/src/content/*/*.md');

export const load: PageLoad = async ({ data }) => {
	const load = components[`/src/content/${data.unit.file}`];
	const { default: component } = await load();
	return { ...data, component };
};
