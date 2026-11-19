<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import type { RedeemRequest } from '#lib/sync/api.ts';
	import { sanitizeNext } from '#lib/sync/next.ts';
	import { ApiError } from '#lib/sync/client.ts';
	import { logout } from '#lib/sync/runtime.svelte.ts';
	import { api, session } from '#lib/sync/session.svelte.ts';

	type Step = 'email' | 'code' | 'link';

	let step = $state<Step>('email');
	let email = $state('');
	let code = $state('');
	let linkToken = $state('');
	let nextPath = $state('/woche');
	let redirected = false;
	let busy = $state(false);
	let error = $state('');
	let info = $state('');

	onMount(() => {
		// The mail link opens /anmelden?t=<token>. It is only redeemed by the button (Safe Links would burn it).
		const params = new URLSearchParams(location.search);
		nextPath = sanitizeNext(params.get('next'));
		const t = params.get('t');
		if (t) {
			linkToken = t;
			step = 'link';
		}
	});

	// Already logged in and opened a mail link: no button needed, go straight to the target.
	$effect(() => {
		if (linkToken && session.loaded && session.loggedIn && !redirected) {
			redirected = true;
			void goto(nextPath as '/');
		}
	});

	/** Clear German texts for the errors a student can run into. */
	function describe(e: unknown, context: 'request' | 'redeem'): string {
		if (!(e instanceof ApiError)) return 'Das hat nicht geklappt. Versuche es noch einmal.';
		if (e.status === 0) return 'Keine Verbindung zum Server. Prüfe dein Internet und versuche es noch einmal.';
		if (e.status === 401) return 'Der Code stimmt nicht oder ist abgelaufen. Prüfe die Ziffern oder fordere einen neuen Code an.';
		if (e.status === 403) return 'Dein Zugang ist gesperrt. Melde dich bei deiner Lehrkraft.';
		if (e.status === 429) return 'Zu viele Versuche. Warte ein paar Minuten und versuche es dann noch einmal.';
		return context === 'request' ? 'Wir konnten keinen Code senden. Versuche es später noch einmal.' : e.message;
	}

	async function requestCode(event: SubmitEvent) {
		event.preventDefault();
		error = info = '';
		busy = true;
		try {
			await api.requestCode(email.trim());
			step = 'code';
			code = '';
			info = 'Wenn die Adresse bei uns bekannt ist, haben wir dir einen Code und einen Link geschickt.';
		} catch (e) {
			error = describe(e, 'request');
		} finally {
			busy = false;
		}
	}

	async function redeem(body: RedeemRequest) {
		error = info = '';
		busy = true;
		try {
			const res = await api.redeem(body);
			session.login(res.token, res.student);
			redirected = true;
			await goto(nextPath as '/');
		} catch (e) {
			error = describe(e, 'redeem');
		} finally {
			busy = false;
		}
	}

	function submitCode(event: SubmitEvent) {
		event.preventDefault();
		void redeem({ email: email.trim(), code: code.trim() });
	}
</script>

<svelte:head>
	<title>Anmelden · POS Lernwerkstatt</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Anmelden</h1>

{#if !session.enabled}
	<p>Der Lernwerkstatt-Login ist hier nicht eingeschaltet. Du kannst die Lernwerkstatt ohne Anmeldung nutzen.</p>
{:else if session.loaded && session.loggedIn}
	<p>Du bist angemeldet{session.student ? ` als ${session.student.displayName}` : ''}.</p>
	<div class="actions">
		<Button href={resolve('/woche')}>Zur Woche</Button>
		<Button variant="secondary" onclick={logout}>Abmelden</Button>
	</div>
{:else}
	{#if session.expired}
		<p class="note warn" role="alert">Bitte melde dich neu an.</p>
	{/if}

	{#if step === 'link'}
		<p class="lead">Du hast den Link aus der E-Mail geöffnet. Tippe auf „Anmelden“, um fortzufahren.</p>
		<Button loading={busy} onclick={() => redeem({ token: linkToken })}>Anmelden</Button>
	{:else if step === 'email'}
		<p class="lead">Melde dich mit deiner Schul-E-Mail-Adresse an. Wir schicken dir einen Code.</p>
		<form onsubmit={requestCode}>
			<label class="field">
				<span>E-Mail-Adresse</span>
				<input type="email" name="email" autocomplete="email" inputmode="email" required bind:value={email} />
			</label>
			<Button type="submit" loading={busy}>Code senden</Button>
		</form>
	{:else}
		<p class="lead">Gib den 6-stelligen Code aus der E-Mail an {email} ein.</p>
		<form onsubmit={submitCode}>
			<label class="field">
				<span>Code</span>
				<input
					class="code"
					name="code"
					type="text"
					inputmode="numeric"
					pattern="[0-9]*"
					maxlength="6"
					autocomplete="one-time-code"
					required
					bind:value={code}
				/>
			</label>
			<div class="actions">
				<Button type="submit" loading={busy}>Anmelden</Button>
				<Button variant="ghost" onclick={() => ((step = 'email'), (error = info = ''))}>Andere Adresse</Button>
			</div>
		</form>
	{/if}

	{#if info}
		<p class="note ok" role="status">{info}</p>
	{/if}
	{#if error}
		<p class="note error" role="alert">{error}</p>
	{/if}

	<p class="small">
		Auf dem iPhone: Wenn du die Seite als App auf dem Home-Bildschirm nutzt, gib den Code dort ein – der Link öffnet
		Safari.
	</p>
{/if}

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 20px;
		color: var(--text-muted);
	}
	form {
		display: grid;
		justify-items: start;
		gap: 12px;
	}
	.field {
		display: grid;
		gap: 4px;
		width: 100%;
		max-width: 360px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.field input {
		padding: 10px 12px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		font-size: 16px;
	}
	.code {
		font-family: var(--font-mono);
		font-size: 24px;
		letter-spacing: 0.3em;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.note {
		margin: 16px 0 0;
		padding: 10px 14px;
		border-radius: var(--radius);
	}
	.ok {
		background: var(--success-soft);
		color: var(--success);
	}
	.error {
		background: var(--danger-soft);
		color: var(--danger);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.small {
		margin-top: 24px;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
