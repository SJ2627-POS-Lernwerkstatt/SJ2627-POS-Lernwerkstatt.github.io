const DAY = 86_400_000;

const utc = (iso: string) => {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d));
};
const fmt = (d: Date) => d.toISOString().slice(0, 10);

/** True for a real calendar date "YYYY-MM-DD". */
export function isDate(iso: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(iso) && fmt(utc(iso)) === iso;
}

/** ISO week of a date, e.g. "2027-W02". */
export function isoWeekOf(iso: string): string {
	const d = utc(iso);
	const dow = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dow); // Thursday of this week decides the year
	const year = d.getUTCFullYear();
	const week = Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / DAY + 1) / 7);
	return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Monday and Sunday of an ISO week "YYYY-Www", or undefined if that week does not exist. */
export function weekRange(week: string): { start: string; end: string } | undefined {
	const m = /^(\d{4})-W(\d{2})$/.exec(week);
	if (!m) return undefined;
	const jan4 = Date.UTC(Number(m[1]), 0, 4);
	const monday1 = jan4 - ((new Date(jan4).getUTCDay() || 7) - 1) * DAY;
	const start = new Date(monday1 + (Number(m[2]) - 1) * 7 * DAY);
	const end = new Date(start.getTime() + 6 * DAY);
	if (isoWeekOf(fmt(start)) !== week) return undefined;
	return { start: fmt(start), end: fmt(end) };
}
