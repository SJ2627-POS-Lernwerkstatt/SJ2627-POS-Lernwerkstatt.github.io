import { defineConfig, devices } from '@playwright/test';

// Smoke test against the prerendered site. Run `npm run build` first.
// The login flow needs a build with PUBLIC_API_URL=mock: `npm run test:e2e:mock` builds that and runs only e2e/login.test.ts.
const mock = !!process.env.E2E_MOCK;
// E2E_PORT lets parallel checkouts (worktrees) run side by side.
const port = process.env.E2E_PORT ?? '4173';
export default defineConfig({
	testDir: 'e2e',
	testMatch: mock ? 'login.test.ts' : undefined,
	testIgnore: mock ? undefined : 'login.test.ts',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `npm run preview -- --port ${port} --strictPort`,
		url: `http://localhost:${port}`,
		reuseExistingServer: !process.env.CI
	}
});
