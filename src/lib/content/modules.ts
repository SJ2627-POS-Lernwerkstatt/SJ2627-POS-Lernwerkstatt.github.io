export const MODULE_SLUGS = ['fundament', 'modern-java', 'testing', 'streams', 'jpa', 'service', 'rest', 'theorie', 'pruefungen'] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

export type Module = {
	slug: ModuleSlug;
	title: string;
	/** Short label next to the title, e.g. which exam task the module prepares. */
	note: string;
	/** English title and note, for readers who switched the content to English. */
	titleEn: string;
	noteEn: string;
};

/** The nine modules in their suggested order. */
export const MODULES: readonly Module[] = [
	{ slug: 'fundament', title: 'Fundament', note: 'Grundlagen: Klassen, Interfaces, Vererbung', titleEn: 'Foundations', noteEn: 'Basics: classes, interfaces, inheritance' },
	{ slug: 'modern-java', title: 'Moderne Java Features', note: 'Grundlagen', titleEn: 'Modern Java features', noteEn: 'Basics' },
	{ slug: 'testing', title: 'Unit Testing', note: 'Auffrischung', titleEn: 'Unit testing', noteEn: 'Refresher' },
	{ slug: 'streams', title: 'Stream API', note: 'Auffrischung', titleEn: 'Stream API', noteEn: 'Refresher' },
	{ slug: 'jpa', title: 'Spring Data JPA', note: 'Aufgabe 1', titleEn: 'Spring Data JPA', noteEn: 'Task 1' },
	{ slug: 'service', title: 'Service-Schicht', note: 'Aufgabe 2', titleEn: 'Service layer', noteEn: 'Task 2' },
	{ slug: 'rest', title: 'REST-Controller', note: 'Aufgabe 3', titleEn: 'REST controllers', noteEn: 'Task 3' },
	{ slug: 'theorie', title: 'Theoriefragen', note: 'Zusatzaufgabe: leichte Bonuspunkte', titleEn: 'Theory questions', noteEn: 'Extra task: easy bonus points' },
	{ slug: 'pruefungen', title: 'Probeprüfungen', note: 'alles zusammen', titleEn: 'Mock exams', noteEn: 'everything together' }
];

export function isModuleSlug(value: string): value is ModuleSlug {
	return (MODULE_SLUGS as readonly string[]).includes(value);
}
