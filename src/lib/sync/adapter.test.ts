import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyProgress, type Progress } from '#lib/progress/schema.ts';
import { createSyncAdapter, DEBOUNCE_MS, RETRY_MS } from './adapter.ts';
import { ApiError } from './client.ts';

function setup() {
	let local: Progress = emptyProgress();
	const calls: { doc: Progress; keepalive: boolean }[] = [];
	const put = vi.fn(async (doc: Progress, keepalive: boolean) => {
		calls.push({ doc: structuredClone(doc), keepalive });
		return { progress: { ...doc, name: 'merged' } };
	});
	const adopt = vi.fn((p: Progress) => {
		local = p;
	});
	const sync = createSyncAdapter({ put, read: () => local, adopt });
	return {
		sync,
		put,
		adopt,
		calls,
		change: () => {
			local = { ...local, units: { ...local.units, [`u${Math.random()}`]: { readAt: '2026-12-01T10:00:00.000Z' } } };
			sync.notifyChange();
		},
		local: () => local
	};
}

describe('sync adapter', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('pushes the local document on start and adopts the merged answer', async () => {
		const s = setup();
		await s.sync.start();
		expect(s.put).toHaveBeenCalledTimes(1);
		expect(s.local().name).toBe('merged');
	});

	it('debounces changes by 5 s into one PUT', async () => {
		const s = setup();
		await s.sync.start();
		s.put.mockClear();
		s.change();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
		s.change();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
		expect(s.put).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		expect(s.put).toHaveBeenCalledTimes(1);
		expect(Object.keys(s.calls.at(-1)!.doc.units)).toHaveLength(2);
	});

	it('pushes immediately with keepalive when the page is hidden, but only if there is something new', async () => {
		const s = setup();
		await s.sync.start();
		s.put.mockClear();
		s.sync.hidden();
		expect(s.put).not.toHaveBeenCalled();
		s.change();
		s.sync.hidden();
		expect(s.put).toHaveBeenCalledTimes(1);
		expect(s.put.mock.calls[0][1]).toBe(true);
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS * 2);
		expect(s.put).toHaveBeenCalledTimes(1); // the debounce timer was cancelled
	});

	it('keeps local data and retries after a failed PUT', async () => {
		const s = setup();
		await s.sync.start();
		s.put.mockClear();
		s.put.mockRejectedValueOnce(new ApiError(0, 'NETWORK', 'offline'));
		s.change();
		const before = s.local();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(s.put).toHaveBeenCalledTimes(1);
		expect(s.sync.status).toBe('error');
		expect(s.local()).toBe(before); // nothing adopted, nothing lost
		await vi.advanceTimersByTimeAsync(RETRY_MS);
		expect(s.put).toHaveBeenCalledTimes(2);
		expect(s.sync.status).toBe('idle');
		expect(s.local().name).toBe('merged');
	});

	it('pushes again when the network comes back after an error', async () => {
		const s = setup();
		await s.sync.start();
		s.put.mockClear();
		s.put.mockRejectedValueOnce(new ApiError(500, 'ERROR', 'boom'));
		s.change();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		s.sync.online();
		await vi.advanceTimersByTimeAsync(0);
		expect(s.put).toHaveBeenCalledTimes(2);
	});

	it('does not overwrite local changes made while a PUT is in flight', async () => {
		const s = setup();
		await s.sync.start();
		s.put.mockClear();
		let release!: () => void;
		s.put.mockImplementationOnce(async (doc) => {
			await new Promise<void>((r) => (release = r));
			return { progress: { ...doc, name: 'merged' } };
		});
		s.change();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		const during = s.local();
		s.change(); // the student keeps working
		const newer = s.local();
		release();
		await vi.advanceTimersByTimeAsync(0);
		expect(s.local()).toBe(newer);
		expect(s.local()).not.toBe(during);
		expect(s.adopt).toHaveBeenCalledTimes(1); // only the one from start()
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(s.put).toHaveBeenCalledTimes(2);
		expect(s.local().name).toBe('merged');
	});

	it('stops on 401 and does not retry', async () => {
		const s = setup();
		s.put.mockRejectedValueOnce(new ApiError(401, 'UNAUTHORIZED', 'nope'));
		await s.sync.start();
		await vi.advanceTimersByTimeAsync(RETRY_MS * 3);
		expect(s.put).toHaveBeenCalledTimes(1);
		s.change();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS * 2);
		expect(s.put).toHaveBeenCalledTimes(1);
	});

	it('does nothing before start() and after stop()', async () => {
		const s = setup();
		s.change();
		s.sync.hidden();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS * 2);
		expect(s.put).not.toHaveBeenCalled();
		await s.sync.start();
		s.sync.stop();
		s.put.mockClear();
		s.change();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS * 2);
		expect(s.put).not.toHaveBeenCalled();
	});
});
