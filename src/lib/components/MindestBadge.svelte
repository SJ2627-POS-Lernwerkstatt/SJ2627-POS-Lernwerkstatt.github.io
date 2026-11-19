<!-- Tag for content that is needed for a Genügend. The word carries the meaning, the colour only supports it. -->
<span class="mindest" data-testid="mindest"
	><span class="long">Mindestanforderung</span><span class="short" aria-hidden="true">Mindest</span></span
>

<style>
	.mindest {
		display: inline-block;
		padding: 1px 8px;
		border: 1px solid var(--success);
		border-radius: 999px;
		background: var(--success-soft);
		color: var(--text);
		font-size: 12px;
		font-weight: 600;
		line-height: 18px;
		white-space: nowrap;
	}
	.short {
		display: none;
	}
	@media (max-width: 399px) {
		.long {
			display: none;
		}
		.short {
			display: inline;
		}
	}
</style>
