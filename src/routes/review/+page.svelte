<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';

	let { data } = $props();

	const units = $derived(data.modules.flatMap((m) => m.units));
	const exercises = $derived(data.modules.flatMap((m) => m.exercises));
	const count = <T,>(items: T[], test: (item: T) => boolean) => items.filter(test).length;
</script>

<svelte:head>
	<title>Review · POS Lernwerkstatt</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Review</h1>
<p class="lead">
	Alle Inhalte mit ihrem Status. Diese Seite ist nicht verlinkt und für die Durchsicht durch die
	Lehrkraft gedacht.
</p>

<dl class="stats">
	<div><dt>Einheiten</dt><dd>{units.length}</dd></div>
	<div><dt>davon Entwurf</dt><dd>{count(units, (u) => u.status === 'draft')}</dd></div>
	<div><dt>Fragengruppen</dt><dd>{units.reduce((n, u) => n + u.groups, 0)}</dd></div>
	<div><dt>Aufgaben</dt><dd>{exercises.length}</dd></div>
</dl>

{#snippet status(s: 'draft' | 'reviewed')}
	{#if s === 'draft'}<Badge tone="warn">Entwurf</Badge>{:else}<Badge>geprüft</Badge>{/if}
{/snippet}

{#each data.modules as m (m.slug)}
	<section>
		<h2>{m.title}</h2>
		{#if m.units.length === 0 && m.exercises.length === 0}
			<p class="empty">Noch keine Inhalte.</p>
		{/if}
		{#if m.units.length}
			<table>
				<thead>
					<tr>
						<th scope="col">Einheit</th>
						<th scope="col">Status</th>
						<th scope="col" class="num">Gruppen</th>
						<th scope="col" class="num">Fragen</th>
					</tr>
				</thead>
				<tbody>
					{#each m.units as u (u.id)}
						<tr>
							<td>
								<a href={resolve('/[module]/[unit]', { module: m.slug, unit: u.slug })}>{u.title}</a>
								<span class="id">{u.id}{u.core ? '' : ' · Vertiefung'} · {u.minutes} min</span>
							</td>
							<td>{@render status(u.status)}</td>
							<td class="num" class:zero={u.groups === 0}>{u.groups}</td>
							<td class="num">{u.questions}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		{#if m.exercises.length}
			<table>
				<thead>
					<tr>
						<th scope="col">Aufgabe</th>
						<th scope="col">Status</th>
						<th scope="col">Bewertung</th>
						<th scope="col">Classroom50</th>
					</tr>
				</thead>
				<tbody>
					{#each m.exercises as x (x.id)}
						<tr>
							<td>
								{x.title}
								<span class="id">{x.id} · {x.minutes} min</span>
							</td>
							<td>{@render status(x.status)}</td>
							<td>{x.grading === 'auto' ? 'automatisch' : 'Lehrkraft'}</td>
							<td class:zero={!x.hasClassroom}>{x.hasClassroom ? 'verlinkt' : 'fehlt'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
{/each}

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead,
	.empty {
		color: var(--text-muted);
	}
	h2 {
		margin: 32px 0 12px;
		font-size: 20px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 8px;
		margin: 0;
	}
	.stats div {
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.stats dt {
		font-size: 14px;
		color: var(--text-muted);
	}
	.stats dd {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
	}
	table {
		width: 100%;
		margin-bottom: 16px;
		border-collapse: collapse;
		font-size: 15px;
	}
	th {
		font-size: 13px;
		font-weight: 600;
		text-align: left;
		color: var(--text-muted);
	}
	th,
	td {
		padding: 8px 8px 8px 0;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}
	td a {
		font-weight: 600;
	}
	.id {
		display: block;
		font: 13px var(--font-mono);
		color: var(--text-muted);
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.zero {
		color: var(--danger);
		font-weight: 600;
	}
</style>
