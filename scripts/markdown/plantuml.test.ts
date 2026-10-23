import { describe, expect, it } from 'vitest';
import { errorMessage, renderPlantUml, wrapSource } from './plantuml.ts';

describe('wrapSource', () => {
	it('adds @startuml/@enduml around a bare body', () => {
		expect(wrapSource('A --> B\n')).toBe('@startuml\nA --> B\n@enduml\n');
	});
	it('keeps a complete diagram as is', () => {
		expect(wrapSource('@startuml\nA --> B\n@enduml')).toBe('@startuml\nA --> B\n@enduml\n');
	});
});

describe('errorMessage', () => {
	it('reads the line and message from PlantUML output', () => {
		expect(errorMessage('ERROR\n3\nSyntax Error?\n<svg', '')).toBe('line 3: Syntax Error?');
	});
});

// Needs plantuml (local) or PLANTUML_JAR (CI).
describe('renderPlantUml', () => {
	it('renders a class diagram to SVG', async () => {
		const svg = await renderPlantUml('class Department <<(E) Entity>> {\n - name : String {nn}\n}');
		expect(svg.startsWith('<svg')).toBe(true);
		expect(svg).toContain('Department');
	}, 30_000);

	it('rejects a broken diagram with the line number', async () => {
		await expect(renderPlantUml('@startuml\nclass A {\n@enduml')).rejects.toThrow(/PlantUML line \d+/);
	}, 30_000);
});
