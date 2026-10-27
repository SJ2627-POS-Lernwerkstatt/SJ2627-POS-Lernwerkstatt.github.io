export const MODULE_SLUGS = ['modern-java', 'testing', 'streams', 'jpa', 'service', 'rest', 'pruefungen'] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

export type Module = {
	slug: ModuleSlug;
	title: string;
	/** Short label next to the title, e.g. which exam task the module prepares. */
	note: string;
};

/** The seven modules in their suggested order. */
export const MODULES: readonly Module[] = [
	{ slug: 'modern-java', title: 'Moderne Java Features', note: 'Grundlagen' },
	{ slug: 'testing', title: 'Unit Testing', note: 'Auffrischung' },
	{ slug: 'streams', title: 'Stream API', note: 'Auffrischung' },
	{ slug: 'jpa', title: 'Spring Data JPA', note: 'Aufgabe 1' },
	{ slug: 'service', title: 'Service-Schicht', note: 'Aufgabe 2' },
	{ slug: 'rest', title: 'REST-Controller', note: 'Aufgabe 3' },
	{ slug: 'pruefungen', title: 'Probeprüfungen', note: 'alles zusammen' }
];

export function isModuleSlug(value: string): value is ModuleSlug {
	return (MODULE_SLUGS as readonly string[]).includes(value);
}
