import { diagnosticViews } from '#lib/server/diagnostic/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ items: await diagnosticViews() });
