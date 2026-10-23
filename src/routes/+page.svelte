<script lang="ts">
	const modules = [
		{ title: 'Unit Testing', note: 'Auffrischung' },
		{ title: 'Stream API', note: 'Auffrischung' },
		{ title: 'Spring Data JPA', note: 'Aufgabe 1' },
		{ title: 'Service-Schicht', note: 'Aufgabe 2' },
		{ title: 'REST-Controller', note: 'Aufgabe 3' },
		{ title: 'Probeprüfungen', note: 'alles zusammen' }
	];
</script>

<svelte:head>
	<title>POS Lernwerkstatt</title>
</svelte:head>

<h1>POS Lernwerkstatt</h1>
<p class="lead">
	Kleine Lerneinheiten, Übungsfragen und Programmieraufgaben zur Vorbereitung auf die
	Reife- und Diplomprüfung in POS.
</p>

<ol class="modules">
	{#each modules as m (m.title)}
		<li>
			<span class="title">{m.title}</span>
			<span class="note">{m.note}</span>
		</li>
	{/each}
</ol>

<p class="soon">Die ersten Module erscheinen Anfang Dezember.</p>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 32px;
		color: var(--text-muted);
	}
	.modules {
		display: grid;
		gap: 8px;
		margin: 0 0 24px;
		padding: 0;
		list-style: none;
		counter-reset: module;
	}
	.modules li {
		display: flex;
		align-items: baseline;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		counter-increment: module;
	}
	.modules li::before {
		content: counter(module);
		font: 600 14px var(--font-mono);
		color: var(--text-muted);
	}
	.title {
		font-weight: 600;
	}
	.note {
		margin-left: auto;
		font-size: 14px;
		color: var(--text-muted);
	}
	.soon {
		color: var(--text-muted);
		font-size: 14px;
	}
</style>
