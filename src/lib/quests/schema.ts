import { z } from 'zod';
import { MODULE_SLUGS } from '#lib/content/modules.js';

const id = z.string().min(1);

/** Exactly one of the six kind keys, plus the optional `laptop` and `minutes`. */
const KIND_KEYS = ['unit', 'review', 'puzzle', 'group', 'theory', 'exercise'] as const;

export const questItem = z
	.strictObject({
		unit: id.optional(),
		review: z.strictObject({ module: z.enum(MODULE_SLUGS), cards: z.int().min(1).max(20) }).optional(),
		puzzle: id.optional(),
		group: id.optional(),
		theory: id.optional(),
		exercise: id.optional(),
		laptop: z.boolean().default(false),
		/** Overrides the minutes of the referenced content. */
		minutes: z.int().min(1).max(300).optional()
	})
	.superRefine((item, ctx) => {
		const keys = KIND_KEYS.filter((k) => item[k] !== undefined);
		if (keys.length !== 1) {
			ctx.addIssue({
				code: 'custom',
				message: `an item needs exactly one of ${KIND_KEYS.join(', ')} (found ${keys.length ? keys.join(' + ') : 'none'})`
			});
		}
	});
export type QuestItemInput = z.infer<typeof questItem>;

export const questFile = z
	.strictObject({
		week: z.string().regex(/^\d{4}-W\d{2}$/, 'expected an ISO week like "2027-W02"'),
		title: z.string().min(1),
		lesson: z
			.union([z.string(), z.date()])
			.transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
			.optional(),
		goal: z.int().min(1),
		holiday: z.boolean().default(false),
		items: z.array(questItem).min(1),
		classGoal: z
			.strictObject({ weeks: z.int().min(1), minStudents: z.int().min(1) })
			.optional()
	})
	.refine((q) => q.goal <= q.items.length, { path: ['goal'], message: 'goal must be between 1 and the number of items' });
export type QuestFile = z.infer<typeof questFile>;
