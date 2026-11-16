import type { ModuleSlug } from './modules.js';

export type PuzzleTopic = {
	slug: string;
	/** The module the topic belongs to; topics are grouped by it on the overview. */
	module: ModuleSlug;
	title: string;
	/** One sentence on the overview. */
	description: string;
};

/** Puzzle topics in course order. Each has a pool `src/content/puzzles/<slug>.yaml`. */
export const PUZZLE_TOPICS = [
	{
		slug: 'jpa-entity',
		module: 'jpa',
		title: 'Entity aus UML',
		description: 'Eine Klasse aus dem Diagramm als Entity schreiben: Annotationen, Felder, Konstruktoren.'
	},
	{
		slug: 'jpa-relation',
		module: 'jpa',
		title: 'Beziehungen',
		description: 'Zwei fertige Entities verbinden: 1:n, n:1, n:m und 1:1, ein- und beidseitig.'
	},
	{
		slug: 'jpa-repository',
		module: 'jpa',
		title: 'Repositories und Queries',
		description: 'Repository-Interfaces mit abgeleiteten Queries und JPQL.'
	},
	{
		slug: 'service-method',
		module: 'service',
		title: 'Service-Methoden',
		description: 'Eine Methode des Service aus der Angabe: Daten holen, prüfen, berechnen.'
	},
	{
		slug: 'unit-test',
		module: 'service',
		title: 'Unit-Tests',
		description: 'Einen JUnit-Test mit AssertJ schreiben: Arrange, Act, Assert.'
	},
	{
		slug: 'rest-endpoint',
		module: 'rest',
		title: 'REST-Endpunkte',
		description: 'Eine Controller-Methode mit dem richtigen Mapping, Parametern und Statuscode.'
	}
] as const satisfies readonly PuzzleTopic[];

export type PuzzleTopicSlug = (typeof PUZZLE_TOPICS)[number]['slug'];

export function puzzleTopic(slug: string): PuzzleTopic | undefined {
	return PUZZLE_TOPICS.find((t) => t.slug === slug);
}
