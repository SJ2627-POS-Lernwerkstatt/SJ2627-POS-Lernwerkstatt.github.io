export const HINT_KEY = 'lernwerkstatt:install-hint';

type Env = { userAgent: string; platform?: string; maxTouchPoints?: number; standalone?: boolean };

/** iOS (or iPadOS, which reports as a Mac) Safari. Other iOS browsers cannot add to the home screen the same way. */
export function isIosSafari({ userAgent: ua, platform, maxTouchPoints }: Env): boolean {
	const ios = /iPhone|iPad|iPod/.test(ua) || (platform === 'MacIntel' && (maxTouchPoints ?? 0) > 1);
	return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
}

/** True when the installed app is running (iOS: navigator.standalone, elsewhere: display-mode media query). */
export function isStandalone(): boolean {
	try {
		return (navigator as { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches;
	} catch {
		return false;
	}
}

export function hintDismissed(): boolean {
	try {
		return localStorage.getItem(HINT_KEY) === 'dismissed';
	} catch {
		return false;
	}
}

export function dismissHint() {
	try {
		localStorage.setItem(HINT_KEY, 'dismissed');
	} catch {
		// private mode: the hint comes back next visit
	}
}

export function shouldShowHint(): boolean {
	return isIosSafari(navigator) && !isStandalone() && !hintDismissed();
}
