import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.PIFE_BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.PIFE_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 5173 --strictPort",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
      },
});
