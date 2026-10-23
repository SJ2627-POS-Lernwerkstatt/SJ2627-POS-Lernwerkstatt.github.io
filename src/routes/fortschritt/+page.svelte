<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import type { Progress } from '#lib/progress/schema.js';
	import { progress } from '#lib/progress/store.svelte.js';
	import { exportFileName, parseProgress } from '#lib/progress/storage.js';

	let pendingImport = $state<Progress | null>(null);
	let importError = $state('');
	let confirmReset = $state(false);
	let message = $state('');

	const summary = (p: Progress) => ({
		units: Object.keys(p.units).length,
		groups: Object.keys(p.groups).length,
		runs: p.runs.length
	});
	const current = $derived(summary(progress.data));

	function exportProgress() {
		const blob = new Blob([progress.exportText()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = exportFileName(new Date());
		a.click();
		URL.revokeObjectURL(url);
	}

	async function chooseFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		message = '';
		pendingImport = null;
		importError = '';
		if (!file) return;
		const result = parseProgress(await file.text());
		if (result.ok) pendingImport = result.progress;
		else importError = result.error;
	}

	function applyImport() {
		if (!pendingImport) return;
		progress.replace(pendingImport);
		pendingImport = null;
		message = 'Der Fortschritt wurde importiert.';
	}

	function reset() {
		progress.reset();
		confirmReset = false;
		message = 'Dein Fortschritt wurde gelöscht.';
	}
</script>

<svelte:head>
	<title>Mein Fortschritt · POS Lernwerkstatt</title>
</svelte:head>

<h1>Mein Fortschritt</h1>
<p class="lead">
	Dein Fortschritt wird nur in diesem Browser gespeichert. Mit einer Exportdatei kannst du ihn auf
	einen anderen Computer mitnehmen oder deiner Lehrkraft geben.
</p>

{#if progress.loaded && !progress.persistent}
	<p class="note warn">
		Dein Browser erlaubt dieser Seite nicht, Daten zu speichern (z. B. im privaten Modus). Dein
		Fortschritt geht verloren, wenn du den Tab schließt – exportiere ihn vorher.
	</p>
{/if}

{#if message}
	<p class="note ok" role="status">{message}</p>
{/if}

<section>
	<h2>Stand</h2>
	<dl class="stats">
		<div><dt>Gelesene Einheiten</dt><dd>{current.units}</dd></div>
		<div><dt>Geübte Fragengruppen</dt><dd>{current.groups}</dd></div>
		<div><dt>Übungsrunden</dt><dd>{current.runs}</dd></div>
	</dl>
</section>

<section>
	<h2>Exportieren</h2>
	<label class="field">
		<span>Name (optional, nur für die Exportdatei)</span>
		<input
			type="text"
			maxlength="100"
			autocomplete="name"
			value={progress.data.name ?? ''}
			onchange={(e) => {
				const name = e.currentTarget.value.trim();
				progress.data.name = name || undefined;
				progress.save();
			}}
		/>
	</label>
	<Button onclick={exportProgress}>Fortschritt als Datei speichern</Button>
</section>

<section>
	<h2>Importieren</h2>
	<p>Ersetzt den Fortschritt in diesem Browser durch den Inhalt einer Exportdatei.</p>
	<label class="file">
		<input type="file" accept="application/json,.json" onchange={chooseFile} />
	</label>
	{#if importError}
		<p class="note error" role="alert">{importError}</p>
	{/if}
	{#if pendingImport}
		{@const incoming = summary(pendingImport)}
		<div class="confirm">
			<p>
				Die Datei enthält {incoming.units} gelesene Einheiten, {incoming.groups} Fragengruppen und
				{incoming.runs} Übungsrunden{pendingImport.name ? ` von ${pendingImport.name}` : ''}. Dein
				aktueller Stand in diesem Browser wird dabei überschrieben.
			</p>
			<div class="actions">
				<Button onclick={applyImport}>Importieren</Button>
				<Button variant="secondary" onclick={() => (pendingImport = null)}>Abbrechen</Button>
			</div>
		</div>
	{/if}
</section>

<section>
	<h2>Zurücksetzen</h2>
	{#if confirmReset}
		<div class="confirm">
			<p>Wirklich alles löschen? Das kann nicht rückgängig gemacht werden.</p>
			<div class="actions">
				<Button variant="danger" onclick={reset}>Ja, löschen</Button>
				<Button variant="secondary" onclick={() => (confirmReset = false)}>Abbrechen</Button>
			</div>
		</div>
	{:else}
		<Button variant="danger" onclick={() => (confirmReset = true)}>Fortschritt löschen</Button>
	{/if}
</section>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 24px;
		color: var(--text-muted);
	}
	section {
		margin-top: 32px;
	}
	h2 {
		margin: 0 0 12px;
		font-size: 20px;
	}
	section p {
		margin: 0 0 12px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
	.field {
		display: grid;
		gap: 4px;
		max-width: 360px;
		margin-bottom: 12px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.field input {
		padding: 8px 10px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		font-size: 16px;
	}
	.confirm {
		margin-top: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.note {
		padding: 10px 14px;
		border-radius: var(--radius);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.ok {
		background: var(--success-soft);
		color: var(--success);
	}
	.error {
		margin-top: 12px;
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
