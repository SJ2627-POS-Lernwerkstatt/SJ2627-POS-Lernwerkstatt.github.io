import { json } from '@sveltejs/kit';
import { contentIndexFile } from '#lib/server/quests/index.js';
import type { RequestHandler } from './$types';

export const prerender = true;

/** Published as /data/content-index.json; the Advent-of-Matura backend fetches it. Types: src/lib/quests/types.ts. */
export const GET: RequestHandler = () => json(contentIndexFile);
