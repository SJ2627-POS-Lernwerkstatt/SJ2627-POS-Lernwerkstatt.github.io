<script lang="ts">
	import { progress } from '#lib/progress/store.svelte.js';
	import { nextTheme, THEME_LABELS } from '#lib/theme.js';

	const theme = $derived(progress.data.settings.theme ?? 'system');
	const next = $derived(nextTheme(theme));
</script>

<!-- Hidden until the stored choice is known, so the label does not jump after hydration. -->
<button
	class="toggle"
	class:pending={!progress.loaded}
	type="button"
	title="Farbschema: {THEME_LABELS[theme]}. Klicken für {THEME_LABELS[next]}."
	onclick={() => progress.setTheme(next)}
>
	<span class="icon" aria-hidden="true">{theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐'}</span>
	<span class="sr">Farbschema:</span>
	{THEME_LABELS[theme]}
</button>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		padding: 4px 10px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		color: var(--text-muted);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}
	.toggle:hover {
		color: var(--primary);
		border-color: var(--primary);
	}
	.pending {
		visibility: hidden;
	}
	.icon {
		font-size: 15px;
		line-height: 1;
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
