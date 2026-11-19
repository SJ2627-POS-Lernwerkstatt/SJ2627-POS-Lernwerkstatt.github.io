import { describe, expect, it, vi } from 'vitest';
import { ApiError, createClient } from './client.ts';

const json = (status: number, body?: unknown) =>
	new Response(body === undefined ? null : JSON.stringify(body), { status });

function make(res: () => Response | Promise<Response>, token: string | null = 'tok') {
	const fetch = vi.fn(async (_url: string, _init?: RequestInit) => res());
	const onUnauthorized = vi.fn();
	const api = createClient({ baseUrl: 'https://x.test/api', fetch, getToken: () => token, onUnauthorized });
	return { api, fetch, onUnauthorized };
}

describe('api client', () => {
	it('sends the bearer token and JSON', async () => {
		const { api, fetch } = make(() => json(204));
		await api.mark('unit:jpa/entity');
		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe('https://x.test/api/quest/marks');
		expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer tok');
		expect(init!.body).toBe('{"itemId":"unit:jpa/entity"}');
	});

	it('url-encodes the item id when removing a mark', async () => {
		const { api, fetch } = make(() => json(204));
		await api.unmark('unit:jpa/entity');
		expect(fetch.mock.calls[0][0]).toBe('https://x.test/api/quest/marks/unit%3Ajpa%2Fentity');
	});

	it('401 on an authenticated route drops the session', async () => {
		const { api, onUnauthorized } = make(() => json(401, { error: 'UNAUTHORIZED', message: 'Bitte melde dich neu an' }));
		await expect(api.summary()).rejects.toMatchObject({ status: 401 });
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it('401 on redeem is a wrong code, not a logout, and sends no token', async () => {
		const { api, fetch, onUnauthorized } = make(() => json(401, { error: 'INVALID', message: 'Code falsch' }));
		await expect(api.redeem({ email: 'a@b.at', code: '1' })).rejects.toThrow('Code falsch');
		expect(onUnauthorized).not.toHaveBeenCalled();
		expect((fetch.mock.calls[0][1]!.headers as Record<string, string>).Authorization).toBeUndefined();
	});

	it('without a token it does not call the network', async () => {
		const { api, fetch, onUnauthorized } = make(() => json(200, {}), null);
		await expect(api.summary()).rejects.toBeInstanceOf(ApiError);
		expect(fetch).not.toHaveBeenCalled();
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it('maps network failures and missing messages', async () => {
		const down = make(() => Promise.reject(new TypeError('fail')));
		await expect(down.api.summary()).rejects.toMatchObject({ status: 0, code: 'NETWORK' });
		const limited = make(() => json(429, {}));
		await expect(limited.api.requestCode('a@b.at')).rejects.toThrow(/Zu viele Versuche/);
	});
});
