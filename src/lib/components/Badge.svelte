<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tone = 'neutral', children }: { tone?: 'neutral' | 'warn' | 'primary'; children: Snippet } = $props();
</script>

<span class="badge {tone}">{@render children()}</span>

<style>
	.badge {
		display: inline-block;
		padding: 1px 8px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 600;
		line-height: 20px;
		white-space: nowrap;
	}
	.neutral {
		background: var(--surface-alt);
		color: var(--text-muted);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.primary {
		background: var(--primary-soft);
		color: var(--primary-dark);
	}
</style>
