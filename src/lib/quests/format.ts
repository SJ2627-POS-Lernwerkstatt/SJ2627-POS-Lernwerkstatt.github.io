const MONTHS = [
	'Januar',
	'Februar',
	'März',
	'April',
	'Mai',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'Dezember'
];

/** "2026-12-14", "2026-12-20" → "14.–20. Dezember 2026"; across months "28. Dez. – 3. Jan. 2027". */
export function formatRange(start: string, end: string): string {
	const [sy, sm, sd] = start.split('-').map(Number);
	const [ey, em, ed] = end.split('-').map(Number);
	if (sy === ey && sm === em) return `${sd}.–${ed}. ${MONTHS[em - 1]} ${ey}`;
	const short = (m: number) => `${MONTHS[m - 1].slice(0, 3)}.`;
	if (sy === ey) return `${sd}. ${short(sm)} – ${ed}. ${short(em)} ${ey}`;
	return `${sd}. ${short(sm)} ${sy} – ${ed}. ${short(em)} ${ey}`;
}
