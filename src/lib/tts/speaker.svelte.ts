import type { SpeechBlock } from './blocks.ts';

export const RATES = [0.8, 0.9, 1, 1.1, 1.25, 1.5] as const;

/** German voices of this browser, best first (local voices before network voices). */
export function germanVoices(): SpeechSynthesisVoice[] {
	if (typeof speechSynthesis === 'undefined') return [];
	return speechSynthesis
		.getVoices()
		.filter((v) => v.lang.toLowerCase().startsWith('de'))
		.sort((a, b) => Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name));
}

/**
 * Reads blocks one after another with the Web Speech API. One utterance per block keeps
 * Chrome from cutting off long texts and lets us highlight what is being read.
 */
export class Speaker {
	state = $state<'idle' | 'playing' | 'paused'>('idle');
	current = $state(-1);

	#blocks: SpeechBlock[] = [];
	#voice: SpeechSynthesisVoice | undefined;
	#rate = 1;
	#token = 0;

	play(blocks: SpeechBlock[], voice: SpeechSynthesisVoice | undefined, rate: number, from = 0) {
		this.stop();
		this.#blocks = blocks;
		this.#voice = voice;
		this.#rate = rate;
		this.state = 'playing';
		this.#speak(from, ++this.#token);
	}

	#speak(i: number, token: number) {
		if (token !== this.#token) return;
		this.#highlight(i);
		const block = this.#blocks[i];
		if (!block) {
			this.state = 'idle';
			return;
		}
		block.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		const u = new SpeechSynthesisUtterance(block.text);
		u.lang = this.#voice?.lang ?? 'de-AT';
		if (this.#voice) u.voice = this.#voice;
		u.rate = this.#rate;
		u.onend = () => this.#speak(i + 1, token);
		u.onerror = (e) => {
			// "interrupted"/"canceled" happen on stop; anything else ends reading.
			if (e.error !== 'interrupted' && e.error !== 'canceled' && token === this.#token) this.stop();
		};
		speechSynthesis.speak(u);
	}

	#highlight(i: number) {
		this.#blocks[this.current]?.el.classList.remove('tts-active');
		this.current = i;
		this.#blocks[i]?.el.classList.add('tts-active');
	}

	pause() {
		if (this.state !== 'playing') return;
		speechSynthesis.pause();
		this.state = 'paused';
	}

	resume() {
		if (this.state !== 'paused') return;
		speechSynthesis.resume();
		this.state = 'playing';
	}

	stop() {
		this.#token++;
		if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
		this.#highlight(-1);
		this.state = 'idle';
	}
}
