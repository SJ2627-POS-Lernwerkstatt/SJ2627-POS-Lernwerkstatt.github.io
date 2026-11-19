import { expect, test } from 'vitest';
import { isIosSafari } from './pwa.ts';

const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1';

test('iOS Safari is detected, other browsers are not', () => {
	expect(isIosSafari({ userAgent: SAFARI })).toBe(true);
	expect(isIosSafari({ userAgent: CHROME })).toBe(false);
	expect(isIosSafari({ userAgent: 'Mozilla/5.0 (Android 14) Chrome/130 Mobile Safari/537.36' })).toBe(false);
});

test('iPadOS Safari reports as a Mac with touch', () => {
	const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
	expect(isIosSafari({ userAgent: mac, platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
	expect(isIosSafari({ userAgent: mac, platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
});
