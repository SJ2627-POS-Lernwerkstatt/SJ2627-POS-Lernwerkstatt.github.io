<div class="logo">
	<span class="mark" aria-hidden="true">{'{ }'}</span>
	<span class="name">POS Lernwerkstatt</span>
</div>

<style>
	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 700;
		font-size: 17px;
		color: var(--text);
	}
	.mark {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: var(--primary);
		color: var(--on-primary);
		font: 700 13px var(--font-mono);
	}
	/* Phones: the mark alone, so the header fits (the link keeps its aria-label). */
	@media (max-width: 480px) {
		.name {
			display: none;
		}
	}
</style>
