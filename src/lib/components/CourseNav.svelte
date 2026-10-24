<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ModuleSlug } from '#lib/content/modules.js';
	import { progress } from '#lib/progress/store.svelte.js';

	type NavModule = {
		slug: ModuleSlug;
		title: string;
		units: { id: string; slug: string; title: string; core: boolean }[];
		exercises: { slug: string; title: string }[];
	};

	let { modules }: { modules: NavModule[] } = $props();

	const path = $derived(page.url.pathname);
	const currentModule = $derived(page.params.module);
</script>

<nav class="course" aria-label="Kursübersicht">
	{#each modules as m (m.slug)}
		{@const moduleHref = resolve('/[module]', { module: m.slug })}
		<!-- Inside a module only that module is open; elsewhere all modules with content are. -->
		<details open={currentModule ? currentModule === m.slug : m.units.length > 0}>
			<summary>
				<a href={moduleHref} aria-current={path === moduleHref ? 'page' : undefined}>{m.title}</a>
			</summary>
			{#if m.units.length || m.exercises.length}
				<ol>
					{#each m.units as u (u.id)}
						{@const href = resolve('/[module]/[unit]', { module: m.slug, unit: u.slug })}
						<li>
							<a {href} aria-current={path === href ? 'page' : undefined}>
								<span class="title">{u.title}</span>
								{#if !u.core}<span class="tag" title="Vertiefung">V</span>{/if}
								{#if progress.isRead(u.id)}<span class="read" title="gelesen">✓</span>{/if}
							</a>
						</li>
					{/each}
				</ol>
				{#if m.exercises.length}
					<p class="group">Übungen</p>
					<ul>
						{#each m.exercises as x (x.slug)}
							{@const href = resolve('/[module]/uebungen/[slug]', { module: m.slug, slug: x.slug })}
							<li>
								<a {href} aria-current={path === href ? 'page' : undefined}>
									<span class="title">{x.title}</span>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				<p class="soon">folgt</p>
			{/if}
		</details>
	{/each}
</nav>

<style>
	.course {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px 12px 32px;
		font-size: 14px;
	}
	summary {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		border-radius: var(--radius);
		cursor: pointer;
		font-weight: 700;
	}
	summary:hover {
		background: var(--surface-alt);
	}
	summary a {
		flex: 1;
		color: var(--text);
		text-decoration: none;
	}
	ol,
	ul {
		margin: 2px 0 8px;
		padding: 0;
		list-style: none;
		counter-reset: unit;
	}
	ol li {
		counter-increment: unit;
	}
	li a {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 5px 8px 5px 12px;
		border-radius: var(--radius);
		color: var(--text-muted);
		text-decoration: none;
		line-height: 1.35;
	}
	ol li a::before {
		content: counter(unit) '.';
		min-width: 1.6em;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}
	li a:hover {
		background: var(--surface-alt);
		color: var(--text);
	}
	a[aria-current='page'] {
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 600;
	}
	li a[aria-current='page']::before {
		color: var(--primary);
	}
	.title {
		flex: 1;
	}
	.tag {
		padding: 0 5px;
		border-radius: 4px;
		background: var(--primary-soft);
		color: var(--primary);
		font-size: 11px;
		font-weight: 700;
	}
	.read {
		color: var(--success);
		font-weight: 700;
	}
	.group {
		margin: 6px 0 2px;
		padding: 0 8px 0 12px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.soon {
		margin: 0 0 6px;
		padding: 2px 8px 2px 12px;
		color: var(--text-muted);
		font-style: italic;
	}
</style>
