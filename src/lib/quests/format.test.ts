import { expect, it } from 'vitest';
import { formatRange } from './format.ts';

it('formats a week range', () => {
	expect(formatRange('2026-12-07', '2026-12-13')).toBe('7.–13. Dezember 2026');
	expect(formatRange('2026-11-30', '2026-12-06')).toBe('30. Nov. – 6. Dez. 2026');
	expect(formatRange('2026-12-28', '2027-01-03')).toBe('28. Dez. 2026 – 3. Jan. 2027');
});
