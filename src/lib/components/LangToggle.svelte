<script lang="ts">
	import { progress } from '#lib/progress/store.svelte.js';

	const en = $derived(progress.data.settings.lang === 'en');
</script>

<!-- Hidden until the stored choice is known, so the label does not jump after hydration. -->
<button
	class="toggle"
	class:pending={!progress.loaded}
	type="button"
	aria-pressed={en}
	title={en ? 'Inhalte auf Deutsch anzeigen' : 'Show the course content in English'}
	onclick={() => progress.setLang(en ? 'de' : 'en')}
>
	<span class="sr">Inhalte auf Englisch:</span>
	<span class="opt" class:on={!en} aria-hidden="true">DE</span>
	<span class="opt" class:on={en} aria-hidden="true">EN</span>
</button>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		min-height: 32px;
		padding: 3px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		color: var(--text-muted);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.toggle:hover {
		border-color: var(--primary);
	}
	.pending {
		visibility: hidden;
	}
	.opt {
		padding: 3px 7px;
		border-radius: 999px;
		line-height: 1.2;
	}
	.on {
		background: var(--primary-soft);
		color: var(--primary);
	}
	/* Phones: only the current language, so the header still fits. */
	@media (max-width: 420px) {
		.opt:not(.on) {
			display: none;
		}
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
