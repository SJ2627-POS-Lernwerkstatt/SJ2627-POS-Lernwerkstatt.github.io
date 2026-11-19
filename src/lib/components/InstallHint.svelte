<script lang="ts">
	import { onMount } from 'svelte';
	import { dismissHint, shouldShowHint } from '#lib/pwa.ts';

	// Hidden until mounted: the decision depends on the browser and on localStorage.
	let show = $state(false);
	onMount(() => (show = shouldShowHint()));
</script>

{#if show}
	<aside class="hint" aria-label="Tipp">
		<p>
			Tipp: Teilen → Zum Home-Bildschirm – dann ist die Lernwerkstatt wie eine App auf deinem Handy. Melde dich dort mit
			dem Code aus der Mail an.
		</p>
		<button
			type="button"
			class="close"
			aria-label="Tipp ausblenden"
			onclick={() => {
				dismissHint();
				show = false;
			}}>×</button
		>
	</aside>
{/if}

<style>
	.hint {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin: 0 0 20px;
		padding: 12px 14px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--primary-soft);
	}
	p {
		flex: 1;
		margin: 0;
		font-size: 15px;
	}
	.close {
		flex: none;
		width: 32px;
		height: 32px;
		border: 0;
		border-radius: var(--radius);
		background: transparent;
		color: var(--text-muted);
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
	}
	.close:hover {
		color: var(--primary);
	}
</style>
