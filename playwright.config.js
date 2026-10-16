// Browser tests. Run with `npm run test:browser` (or `npx playwright test tests/e2e/keyboard.spec.js` for one file).
"use strict";
var {defineConfig} = require("@playwright/test");
var PORT = Number(process.env.ZSA_PORT || 4173);

module.exports = defineConfig({
  testDir: "tests/e2e",
  timeout: 120000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {baseURL: "http://127.0.0.1:" + PORT, browserName: "chromium", viewport: {width: 1366, height: 657}},
  webServer: {command: "node tests/support/server.js " + PORT, url: "http://127.0.0.1:" + PORT + "/", reuseExistingServer: !process.env.CI}
});
