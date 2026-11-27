<script lang="ts">
	/**
	 * Text in German and, if translated, English. Both are rendered; CSS shows the chosen language
	 * (`.bi-de`/`.bi-en` in app.css). Without a translation the German text is shown in both.
	 */
	interface Props {
		de: string;
		en?: string;
		/** de/en are HTML (rendered Markdown), not plain text. */
		html?: boolean;
		/** Wrap in a div (for block HTML like paragraphs or code) instead of a span. */
		block?: boolean;
	}
	let { de, en, html = false, block = false }: Props = $props();
</script>

{#if en === undefined}
	{#if html}{@html de}{:else}{de}{/if}
{:else if block}
	<div class="bi-de" lang="de">{#if html}{@html de}{:else}{de}{/if}</div>
	<div class="bi-en" lang="en">{#if html}{@html en}{:else}{en}{/if}</div>
{:else}
	<span class="bi-de" lang="de">{#if html}{@html de}{:else}{de}{/if}</span><span class="bi-en" lang="en"
		>{#if html}{@html en}{:else}{en}{/if}</span
	>
{/if}
