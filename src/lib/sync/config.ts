import { PUBLIC_API_URL } from '$app/env/public';

/**
 * Base URL of the Advent-of-Matura backend (see src/env.ts). Unset/empty: the whole login feature is off and
 * the site behaves as before. "mock": an in-browser fake of the API (see mock.ts).
 */
export const API_URL = PUBLIC_API_URL.replace(/\/+$/, '');
export const SYNC_ENABLED = API_URL !== '';
export const SYNC_MOCK = API_URL === 'mock';
