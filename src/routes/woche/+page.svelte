<script lang="ts">
	import { onMount } from 'svelte';
	import { siteHref } from '#lib/quests/href.ts';
	import Badge from '#lib/components/Badge.svelte';
	import LoginGate from '#lib/components/LoginGate.svelte';
	import Bar from '#lib/components/quest/Bar.svelte';
	import { formatRange } from '#lib/quests/format.ts';
	import { questState as q } from '#lib/sync/quest.svelte.ts';
	import { session } from '#lib/sync/session.svelte.ts';

	// Load once logged in, and again whenever the tab becomes visible (the server may know more by then).
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

	const quest = $derived(q.quest);
	const byId = $derived(new Map((quest?.items ?? []).map((i) => [i.itemId, i])));
	const s = $derived(q.summary);
</script>

<svelte:head>
	<title>Diese Woche · POS Lernwerkstatt</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Diese Woche</h1>

<LoginGate>
	{#if q.error}
		<p class="note error" role="alert">{q.error}</p>
	{/if}

	{#if !quest && q.loading}
		<p class="meta">Lade …</p>
	{:else if quest && !quest.quest}
		<p>Für diese Woche gibt es keine Aufgaben. Lerne frei weiter oder wiederhole im Üben-Modus.</p>
	{:else if quest?.quest}
		{@const w = quest.quest}
		<p class="lead"><strong>{w.title}</strong> · {formatRange(w.start, w.end)}</p>
		{#if w.holiday}
			<p class="note">Diese Woche sind Ferien. Alles ist freiwillig.</p>
		{/if}

		<section aria-labelledby="goal">
			<h2 id="goal">Wochenziel</h2>
			<p class:done={quest.goalMet}>
				{#if quest.goalMet}
					{quest.myDone} von {quest.goal} – Wochenziel geschafft!
				{:else}
					{quest.myDone} von {quest.goal} erledigt
				{/if}
			</p>
			<Bar value={Math.min(quest.myDone, quest.goal)} max={quest.goal} label="Fortschritt zum Wochenziel" />
		</section>

		<section aria-labelledby="items">
			<h2 id="items">Aufgaben</h2>
			<ul class="items">
				{#each w.items as item (item.itemId)}
					{@const st = byId.get(item.itemId)}
					<li class:done={st?.done}>
						{#if st?.done && st.source !== 'mark'}
							<span class="tick" role="img" aria-label="erledigt">✓</span>
						{:else}
							<input
								type="checkbox"
								aria-label="{item.title} in der Stunde erledigt"
								checked={st?.done ?? false}
								onchange={(e) => q.setMark(item.itemId, e.currentTarget.checked)}
							/>
						{/if}
						<div class="body">
							<a href={siteHref(item.href)}>{item.title}</a>
							<span class="meta">
								{item.minutes} min
								{#if item.laptop}<Badge tone="warn">Laptop</Badge>{/if}
								{#if st?.source === 'mark'}<Badge>in der Stunde</Badge>{/if}
							</span>
						</div>
						<span class="class" title="so viele aus der Klasse haben das erledigt">
							{st?.classDone ?? 0}/{quest.classTotal} erledigt
						</span>
					</li>
				{/each}
			</ul>
		</section>

		{#if quest.catchUp.length}
			<section aria-labelledby="catchup">
				<h2 id="catchup">Für dich</h2>
				<ul class="items">
					{#each quest.catchUp as item (item.itemId)}
						<li>
							<div class="body">
								<a href={siteHref(item.href)}>{item.title}</a>
								<span class="meta">
									{item.minutes} min · {item.reason === 'due-review' ? 'Zeit zum Wiederholen' : 'noch offen'}
									{#if item.laptop}<Badge tone="warn">Laptop</Badge>{/if}
								</span>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<div class="cards">
			{#if s}
				<section class="card" aria-labelledby="me">
					<h2 id="me">Du</h2>
					<p class="big">Level {s.level} · {s.rank}</p>
					<Bar
						value={s.nextLevelXp === null ? 1 : s.xp - s.levelStartXp}
						max={s.nextLevelXp === null ? 1 : s.nextLevelXp - s.levelStartXp}
						label="Erfahrungspunkte bis zum nächsten Level"
					/>
					<p class="meta">
						{s.xp} XP{s.nextLevelXp === null ? ' · höchstes Level' : ` · noch ${s.nextLevelXp - s.xp} bis Level ${s.level + 1}`}
					</p>
					<p class="meta">
						Wochen-Serie: {s.streak.weeks}
						{s.streak.weeks === 1 ? 'Woche' : 'Wochen'} · Joker: {s.streak.jokersLeft}
					</p>
				</section>
			{/if}
			<section class="card" aria-labelledby="class">
				<h2 id="class">Klasse</h2>
				<Bar value={quest.classGoalMet} max={quest.classTotal} label="Klasse: Wochenziel geschafft" />
				<p class="meta">{quest.classGoalMet} von {quest.classTotal} haben das Wochenziel geschafft</p>
				{#if quest.classGoal}
					<p class="meta">
						Klassenziel: {quest.classGoal.minStudents} Personen {quest.classGoal.weeks}
						{quest.classGoal.weeks === 1 ? 'Woche' : 'Wochen'} in Folge – Belohnung: {quest.classGoal.reward}.
						Bisher {quest.classGoal.weeksInRow} von {quest.classGoal.weeks}.
					</p>
				{/if}
			</section>
		</div>
	{/if}
</LoginGate>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 0 0 8px;
		font-size: 20px;
	}
	section {
		margin-top: 28px;
	}
	.lead {
		margin: 0 0 8px;
		color: var(--text-muted);
	}
	.lead strong {
		color: var(--text);
	}
	p {
		margin: 0 0 4px;
	}
	.done {
		color: var(--success);
		font-weight: 600;
	}
	.items {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.items li {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.items li.done {
		background: var(--success-soft);
		font-weight: 400;
	}
	.items input[type='checkbox'] {
		flex: none;
		width: 22px;
		height: 22px;
		margin: 1px 0 0;
		accent-color: var(--success);
	}
	.tick {
		flex: none;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--success);
		color: var(--text-inverse);
		font-size: 14px;
		line-height: 22px;
		text-align: center;
	}
	.body {
		display: grid;
		flex: 1;
		min-width: 0;
		gap: 2px;
	}
	.body a {
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.body a:hover {
		color: var(--primary);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.class {
		flex: none;
		font-size: 12px;
		color: var(--text-muted);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 12px;
		margin-top: 28px;
	}
	.card {
		margin: 0;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.big {
		font-weight: 600;
	}
	.note {
		margin: 12px 0;
		padding: 10px 14px;
		border-radius: var(--radius);
		background: var(--surface-alt);
	}
	.error {
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
