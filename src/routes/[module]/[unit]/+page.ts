import type { Component } from 'svelte';
import type { PageLoad } from './$types';

// One chunk per unit (and per translation), loaded only on that unit's page.
const components = import.meta.glob<{ default: Component }>(['/src/content/*/*.md', '/src/content/en/*/*.md']);

export const load: PageLoad = async ({ data }) => {
	const de = components[`/src/content/${data.unit.file}`];
	const en = data.unit.en ? components[`/src/content/${data.unit.en.file}`] : undefined;
	const [{ default: component }, english] = await Promise.all([de(), en?.()]);
	return { ...data, component, componentEn: english?.default };
};
