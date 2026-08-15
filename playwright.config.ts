import { defineConfig, devices } from "@playwright/test";

const FRONTEND_PORT = 4141;
const BACKEND_PORT = 4142;

/**
 * Ports are deliberately not the dev ones (4041/4042): the box also runs the
 * imposter and Cahoots projects, and a test run must never collide with a live
 * server.
 */
export default defineConfig({
  testDir: "./e2e",
  // Two browser contexts share one room, so tests must not race each other.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `PORT=${BACKEND_PORT} CORS_ORIGINS=http://localhost:${FRONTEND_PORT} npm run start:prod`,
      cwd: "../backend",
      port: BACKEND_PORT,
      reuseExistingServer: !process.env.CI,
      stdout: "ignore",
    },
    {
      // The build step is not optional. NEXT_PUBLIC_* values are inlined at
      // build time, so passing the backend URL only to `start` leaves whatever
      // URL the last build baked in — the app then silently talks to the wrong
      // port and every test times out waiting for a socket that never connects.
      command:
        `NEXT_PUBLIC_BACKEND_URL=http://localhost:${BACKEND_PORT} npm run build && ` +
        `PORT=${FRONTEND_PORT} npm run start`,
      port: FRONTEND_PORT,
      // Always rebuild — a stale server from a differently-configured build is
      // exactly the failure this guards against.
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "ignore",
    },
  ],
});
