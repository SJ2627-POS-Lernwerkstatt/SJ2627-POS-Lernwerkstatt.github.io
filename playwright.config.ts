import { defineConfig, devices } from '@playwright/test';

// Smoke test against the prerendered site. Run `npm run build` first.
// The login flow needs a build with PUBLIC_API_URL=mock: `npm run test:e2e:mock` builds that and runs only e2e/login.test.ts.
const mock = !!process.env.E2E_MOCK;
export default defineConfig({
	testDir: 'e2e',
	testMatch: mock ? 'login.test.ts' : undefined,
	testIgnore: mock ? undefined : 'login.test.ts',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run preview -- --port 4173 --strictPort',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI
	}
});
