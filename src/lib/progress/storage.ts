import { emptyProgress, progressSchema, type Progress } from './schema.ts';

export type ParseResult = { ok: true; progress: Progress } | { ok: false; error: string };

/** Validates progress JSON (from localStorage or an imported file). */
export function parseProgress(text: string): ParseResult {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		return { ok: false, error: 'Die Datei ist keine gültige JSON-Datei.' };
	}
	if (typeof data === 'object' && data !== null && 'version' in data && data.version !== 1) {
		return { ok: false, error: 'Die Datei stammt aus einer anderen Version der Lernwerkstatt.' };
	}
	const parsed = progressSchema.safeParse(data);
	if (!parsed.success) return { ok: false, error: 'Die Datei ist kein Lernwerkstatt-Fortschritt.' };
	return { ok: true, progress: parsed.data };
}

/**
 * Reads the stored progress. Missing → empty. Broken → empty, and the broken text is
 * returned so the caller can keep a backup before it gets overwritten.
 */
export function loadProgress(raw: string | null): { progress: Progress; broken?: string } {
	if (raw === null || raw === '') return { progress: emptyProgress() };
	const result = parseProgress(raw);
	return result.ok ? { progress: result.progress } : { progress: emptyProgress(), broken: raw };
}

export function exportFileName(date: Date): string {
	return `lernwerkstatt-fortschritt-${date.toISOString().slice(0, 10)}.json`;
}

export function serialize(progress: Progress): string {
	return JSON.stringify(progress);
}
