<script lang="ts">
	import { onMount } from 'svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { speechBlocks } from '#lib/tts/blocks.js';
	import { germanVoices, RATES, Speaker } from '#lib/tts/speaker.svelte.js';
	import Button from './Button.svelte';

	/** Reads the given element aloud. `key` changes when the content changes (another unit). */
	let { target, key }: { target: () => HTMLElement | undefined; key: string } = $props();

	const speaker = new Speaker();
	let voices = $state<SpeechSynthesisVoice[]>([]);
	let supported = $state(true);
	let checked = $state(false);

	const voice = $derived(voices.find((v) => v.voiceURI === progress.data.settings.voice) ?? voices[0]);
	const rate = $derived(progress.data.settings.rate ?? 1);

	onMount(() => {
		if (typeof speechSynthesis === 'undefined') {
			supported = false;
			checked = true;
			return;
		}
		const load = () => {
			voices = germanVoices();
			checked = true;
		};
		load();
		speechSynthesis.addEventListener('voiceschanged', load);
		// Some browsers never fire voiceschanged when there are no voices at all.
		const timer = setTimeout(() => (checked = true), 1500);
		return () => {
			speechSynthesis.removeEventListener('voiceschanged', load);
			clearTimeout(timer);
			speaker.stop();
		};
	});

	// Stop when navigating to another unit.
	$effect(() => {
		void key;
		return () => speaker.stop();
	});

	function play() {
		const el = target();
		if (el) speaker.play(speechBlocks(el), voice, rate);
	}

	function setSetting(name: 'voice' | 'rate', value: string) {
		if (name === 'voice') progress.data.settings.voice = value;
		else progress.data.settings.rate = Number(value);
		progress.save();
		// Apply right away by restarting at the current block.
		if (speaker.state !== 'idle') {
			const el = target();
			if (el) speaker.play(speechBlocks(el), voice, rate, Math.max(0, speaker.current));
		}
	}
</script>

{#if checked && supported && voices.length > 0}
	<div class="read-aloud" role="group" aria-label="Vorlesen">
		{#if speaker.state === 'idle'}
			<Button variant="secondary" onclick={play}>▶ Vorlesen</Button>
		{:else}
			{#if speaker.state === 'playing'}
				<Button variant="secondary" onclick={() => speaker.pause()}>❚❚ Pause</Button>
			{:else}
				<Button variant="secondary" onclick={() => speaker.resume()}>▶ Weiter</Button>
			{/if}
			<Button variant="ghost" onclick={() => speaker.stop()}>■ Stopp</Button>
		{/if}
		<label>
			<span class="sr">Stimme</span>
			<select value={voice?.voiceURI} onchange={(e) => setSetting('voice', e.currentTarget.value)}>
				{#each voices as v (v.voiceURI)}
					<option value={v.voiceURI}>{v.name}</option>
				{/each}
			</select>
		</label>
		<label>
			<span class="sr">Geschwindigkeit</span>
			<select value={String(rate)} onchange={(e) => setSetting('rate', e.currentTarget.value)}>
				{#each RATES as r (r)}
					<option value={String(r)}>{r.toLocaleString('de-AT')}×</option>
				{/each}
			</select>
		</label>
	</div>
{:else if checked}
	<p class="no-voice">
		Vorlesen ist in diesem Browser nicht möglich, weil keine deutsche Stimme installiert ist. In Microsoft Edge
		und Safari funktioniert es meistens.
	</p>
{/if}

<style>
	.read-aloud {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
	}
	select {
		max-width: 220px;
		min-height: 40px;
		padding: 6px 8px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
	}
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	.no-voice {
		margin: 12px 0 0;
		font-size: 14px;
		color: var(--text-muted);
	}
</style>
