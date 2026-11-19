<script lang="ts">
	import { onMount } from 'svelte';

	let waiting = $state<ServiceWorker | null>(null);
	let requested = false;

	onMount(() => {
		if (!('serviceWorker' in navigator)) return;
		// The first install also fires controllerchange (clients.claim); only reload after the user asked for the update.
		const onController = () => {
			if (!requested) return;
			requested = false;
			location.reload();
		};
		const watch = (reg: ServiceWorkerRegistration) => {
			if (reg.waiting && navigator.serviceWorker.controller) waiting = reg.waiting;
			reg.addEventListener('updatefound', () => {
				const next = reg.installing;
				next?.addEventListener('statechange', () => {
					// "installed" with an active controller means an update, not the first install.
					if (next.state === 'installed' && navigator.serviceWorker.controller) waiting = next;
				});
			});
		};
		void navigator.serviceWorker.getRegistration().then((reg) => reg && watch(reg));
		navigator.serviceWorker.addEventListener('controllerchange', onController);
		return () => navigator.serviceWorker.removeEventListener('controllerchange', onController);
	});

	function reload() {
		requested = true;
		waiting?.postMessage({ type: 'SKIP_WAITING' });
	}
</script>

{#if waiting}
	<div class="toast" role="status">
		<span>Neue Version verfügbar</span>
		<button type="button" onclick={reload}>neu laden</button>
		<button type="button" class="close" aria-label="Hinweis ausblenden" onclick={() => (waiting = null)}>×</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		z-index: 40;
		left: 50%;
		bottom: max(16px, env(safe-area-inset-bottom));
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px 10px 16px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
		font-size: 15px;
	}
	button {
		border: 0;
		border-radius: var(--radius);
		background: var(--primary);
		color: var(--on-primary);
		padding: 6px 12px;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	button:hover {
		background: var(--primary-hover);
	}
	.close {
		padding: 4px 8px;
		background: transparent;
		color: var(--text-muted);
	}
	.close:hover {
		background: transparent;
		color: var(--primary);
	}
</style>
