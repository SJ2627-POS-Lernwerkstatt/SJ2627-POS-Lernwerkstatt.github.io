<script lang="ts">
	let { value, max, label }: { value: number; max: number; label: string } = $props();
	const pct = $derived(max > 0 ? Math.min(100, (100 * value) / max) : 0);
</script>

<div class="bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
	<span style:width="{pct}%"></span>
</div>

<style>
	.bar {
		height: 8px;
		margin: 6px 0;
		border-radius: 999px;
		background: var(--surface-alt);
		overflow: hidden;
	}
	span {
		display: block;
		height: 100%;
		background: var(--success);
	}
</style>
