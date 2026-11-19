<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import { session } from '#lib/sync/session.svelte.ts';

	let { children }: { children: Snippet } = $props();
</script>

{#if !session.enabled}
	<p class="note">Der Lernwerkstatt-Login ist hier nicht eingeschaltet.</p>
{:else if session.loaded && !session.loggedIn}
	<div class="gate">
		{#if session.expired}
			<p class="note warn" role="alert">Bitte melde dich neu an. Dein Fortschritt in diesem Browser bleibt erhalten.</p>
		{/if}
		<p>
			Diese Seite zeigt deine Wochenaufgaben und dein Klassenziel. Dafür musst du dich mit deiner Schul-E-Mail-Adresse
			anmelden.
		</p>
		<Button href={resolve('/anmelden')}>Anmelden</Button>
	</div>
{:else if session.loaded}
	{@render children()}
{/if}

<style>
	.gate {
		display: grid;
		justify-items: start;
		gap: 12px;
	}
	.gate p {
		margin: 0;
	}
	.note {
		padding: 10px 14px;
		border-radius: var(--radius);
		background: var(--surface-alt);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}
</style>
