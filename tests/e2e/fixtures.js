// Shared setup for the browser tests: open an activity (optionally with a seeded Math.random so rounds repeat
// exactly), install the in-page helpers, and fail the test on console errors or CSP violations.
"use strict";
var base = require("@playwright/test");
var {activities, install} = require("../support/activities");

// mulberry32: a small seeded generator that replaces Math.random before any activity script runs.
function seedRandom(seed) {
  var a = seed >>> 0;
  Math.random = function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

var test = base.test.extend({
  problems: async ({page}, use) => {
    var problems = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") problems.push("console " + m.type() + ": " + m.text()); });
    page.on("pageerror", (e) => problems.push("page error: " + e.message));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => console.error("CSP violation: " + e.violatedDirective + " " + e.blockedURI));
    });
    await use(problems);
    base.expect(problems, "console errors, page errors or CSP violations").toEqual([]);
  },
  // open(activity, {seed, query}) returns the activity config after the page has loaded.
  open: async ({page, problems}, use) => {
    void problems;
    await use(async (slug, opts) => {
      opts = opts || {};
      var cfg = activities[slug];
      if (opts.seed !== undefined) await page.addInitScript(seedRandom, opts.seed);
      await page.goto(cfg.path + (opts.query || ""));
      await page.waitForFunction((id) => !!document.getElementById(id) && !!document.getElementById(id).querySelector("table"), cfg.ids.table);
      await page.evaluate(install, cfg.ids);
      return cfg;
    });
  }
});

async function state(page) { return page.evaluate(() => window.__zsa.state()); }

module.exports = {test: test, expect: base.expect, state: state, activities: activities, seedRandom: seedRandom, install: install};
