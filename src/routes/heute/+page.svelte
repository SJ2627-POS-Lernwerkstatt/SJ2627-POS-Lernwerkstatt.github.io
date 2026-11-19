<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { siteHref } from '#lib/quests/href.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import LoginGate from '#lib/components/LoginGate.svelte';
	import { todaySuggestion } from '#lib/quests/today.ts';
	import { questState as q } from '#lib/sync/quest.svelte.ts';
	import { session } from '#lib/sync/session.svelte.ts';

	$effect(() => {
		if (session.loggedIn) void q.load();
	});
	onMount(() => {
		const onVisible = () => {
			if (document.visibilityState === 'visible' && session.loggedIn) void q.load();
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	});

	const suggestion = $derived(q.quest ? todaySuggestion(q.quest) : null);
</script>

<svelte:head>
	<title>Heute · POS Lernwerkstatt</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Heute</h1>

<LoginGate>
	{#if q.error}
		<p class="note error" role="alert">{q.error}</p>
	{/if}

	{#if !q.quest}
		{#if q.loading}<p class="meta">Lade …</p>{/if}
	{:else if suggestion}
		<p class="lead">Mach als Nächstes:</p>
		<div class="card">
			<p class="title" data-testid="suggestion">{suggestion.item.title}</p>
			<p class="meta">
				{suggestion.item.minutes} min
				{#if suggestion.from === 'catchUp'}<Badge tone="primary">Für dich</Badge>{/if}
			</p>
			<Button block href={siteHref(suggestion.item.href)}>Los geht's</Button>
		</div>
		<p class="more"><a href={resolve('/woche')}>Ganze Woche ansehen</a></p>
	{:else}
		<div class="card">
			<p class="title">Alles erledigt 🎉</p>
			<p class="meta">Für heute gibt es nichts mehr zu tun. Du kannst im Üben-Modus wiederholen.</p>
			<Button block variant="secondary" href={resolve('/ueben')}>Üben</Button>
		</div>
		<p class="more"><a href={resolve('/woche')}>Ganze Woche ansehen</a></p>
	{/if}
</LoginGate>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 12px;
		color: var(--text-muted);
	}
	.card {
		display: grid;
		gap: 12px;
		padding: 20px 18px;
		background: var(--surface);
		border: 1px solid var(--primary);
		border-radius: var(--radius-lg);
	}
	.card p {
		margin: 0;
	}
	.title {
		font-size: 22px;
		font-weight: 700;
		overflow-wrap: anywhere;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		color: var(--text-muted);
	}
	.card :global(.btn) {
		min-height: 52px;
		font-size: 18px;
	}
	.more {
		margin: 16px 0 0;
	}
	.note {
		padding: 10px 14px;
		border-radius: var(--radius);
	}
	.error {
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
