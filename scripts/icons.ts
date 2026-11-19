// Renders the PWA icons (PNG) from static/icons/*.svg. Run: npx tsx scripts/icons.ts (or node scripts/icons.ts)
// The PNGs are committed; rerun only when the SVGs change.
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const dir = new URL('../static/icons/', import.meta.url);
const any = await readFile(new URL('icon.svg', dir));
const maskable = await readFile(new URL('icon-maskable.svg', dir));

const jobs: [Buffer, number, string][] = [
	[any, 192, 'icon-192.png'],
	[any, 512, 'icon-512.png'],
	[maskable, 512, 'icon-maskable-512.png'],
	// iOS rounds the corners itself, so it gets the full-bleed square.
	[maskable, 180, 'apple-touch-icon.png']
];
for (const [svg, size, name] of jobs) {
	await sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(new URL(name, dir).pathname);
	console.log(name);
}
