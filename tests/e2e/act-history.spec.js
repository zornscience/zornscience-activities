// ACT Practice codes and history (act/history-api.js and the code screens in act/act.js), with a fake ACT Practice
// History plugin served by page.route in place of https://zornscience.org/wp-json/zsa-act/v1/. Codes are on only
// with ?codes=1 until the plugin is installed. Selects by role and text only, and fails on console errors or CSP
// violations.
"use strict";
var fs = require("fs");
var {test, expect, seedRandom} = require("./fixtures");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var API = "https://zornscience.org/wp-json/zsa-act/v1";

// A fake plugin. db.codes maps a code to its attempts; db.calls records every request. opts.fail(call) can return a
// status (or "abort") to make that request fail.
async function fakeApi(page, opts) {
  opts = opts || {};
  var db = {codes: Object.assign({}, opts.codes || {}), calls: [], next: opts.next || ["K7M2QX", "P3W8ZD"]};
  await page.route(API + "/**", async (route) => {
    var req = route.request(), headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json"};
    if (req.method() === "OPTIONS") { await route.fulfill({status: 204, headers: headers}); return; }
    var url = new URL(req.url()), path = url.pathname.replace("/wp-json/zsa-act/v1", "");
    var call = {method: req.method(), path: path, query: url.search, body: req.postData() ? JSON.parse(req.postData()) : null, credentials: req.headers()["cookie"] || ""};
    db.calls.push(call);
    var failure = opts.fail && opts.fail(call, db);
    if (failure === "abort") { await route.abort(); return; }
    function reply(status, body) { return route.fulfill({status: status, headers: headers, body: JSON.stringify(body)}); }
    if (failure) { await reply(failure, {code: "x", message: "fail"}); return; }
    var m;
    if (req.method() === "POST" && path === "/codes") {
      var code = db.next.shift();
      db.codes[code] = [];
      await reply(201, {code: code});
    } else if (req.method() === "GET" && (m = path.match(/^\/codes\/([A-Z0-9]{6})$/))) {
      if (!db.codes[m[1]]) await reply(404, {code: "zsa_act_unknown", message: "No history was found for that code."});
      else await reply(200, {code: m[1], created: "2026-09-01T12:00:00Z", attempts: db.codes[m[1]]});
    } else if (req.method() === "POST" && (m = path.match(/^\/codes\/([A-Z0-9]{6})\/attempts$/))) {
      if (!db.codes[m[1]]) { await reply(404, {}); return; }
      db.codes[m[1]].push(Object.assign({date: "2026-10-24T15:00:00Z"}, call.body));
      await reply(201, {saved: true});
    } else await reply(404, {});
  });
  return db;
}
async function go(page, hash, query, opts) {
  opts = opts || {};
  if (opts.clock) await page.clock.install();
  if (opts.seed !== undefined) await page.addInitScript(seedRandom, opts.seed);
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto("/act/" + (query === undefined ? "?codes=1" : query) + (hash ? "#" + hash : ""));
}
async function audit(page, label) {
  for (var scheme of ["light", "dark"]) {
    await page.emulateMedia({colorScheme: scheme, reducedMotion: "reduce"});
    await page.evaluate(AXE);
    var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
    expect(result.violations.map((v) => label + " " + scheme + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
  }
  await page.emulateMedia({colorScheme: "light"});
}
async function noSideScroll(page, label) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), label).toBeLessThanOrEqual(0);
}
function nav(page) { return page.getByRole("toolbar", {name: "Questions"}); }
// From any question: go to the last one and end the section from the review screen.
async function endNow(page) {
  await nav(page).getByRole("button").last().click();
  await page.getByRole("button", {name: "Review", exact: true}).click();
  await page.getByRole("button", {name: "End section"}).click();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
}
async function startSection(page, name) {
  await expect(page.getByRole("heading", {level: 1, name: name + " test directions"})).toBeFocused();
  await page.getByRole("button", {name: "Start the section"}).click();
}
// The browser logs a failed request as a console error. Tests that make requests fail on purpose remove exactly
// those messages (and nothing else) before the fixture checks for problems.
function allowFailedRequests(problems, statuses) {
  var re = new RegExp("^console error: Failed to load resource: (the server responded with a status of (" + statuses.join("|") + ") |net::ERR_FAILED$)");
  var keep = problems.filter((p) => !re.test(p));
  problems.splice(0, problems.length, ...keep);
}
var codeHeading = (page) => page.getByRole("heading", {level: 1, name: "Your practice code"});

test("codes are off until the plugin is set up: no prompt, no code panel, no requests to zornscience.org", async ({page, problems}) => {
  void problems;
  var outside = [];
  page.on("request", (r) => { if (/zornscience\.org/.test(r.url())) outside.push(r.url()); });
  await go(page, "science", "");
  await expect(page.getByText("Nothing is saved or sent anywhere.")).toBeVisible();
  await expect(page.getByRole("button", {name: "Use a practice code"})).toHaveCount(0);
  await page.getByRole("button", {name: /^One passage/}).click();
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
  await expect(page.getByText(/Saved to your history|Saving to your history/)).toHaveCount(0);
  expect(outside).toEqual([]);
});

test("students are asked for a code before practicing; practicing without saving asks only once", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page);
  await go(page, "science");
  await expect(page.getByText("Scores are saved only if you use a practice code, and the code is never linked to your name.")).toBeVisible();
  await page.getByRole("button", {name: /^One passage/}).click();
  await expect(codeHeading(page)).toBeFocused();
  await audit(page, "code screen");
  await page.getByRole("button", {name: "Practice without saving"}).click();
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
  await expect(page.getByText(/Saved to your history/)).toHaveCount(0);
  await page.getByRole("button", {name: "Try another set"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Science test directions"})).toBeFocused();
  expect(db.calls).toEqual([]);
});

test("a new code: shown once to write down, then each finished section is saved under it and appears in the history", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page);
  await go(page, "science", "?codes=1", {seed: 2});
  await page.getByRole("button", {name: /^One passage/}).click();
  await page.getByRole("button", {name: "Get a new code"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Your new practice code"})).toBeFocused();
  await expect(page.getByText("K 7 M 2 Q X")).toHaveCount(1);
  await expect(page.getByText("K7M2QX", {exact: true})).toBeVisible();
  await expect(page.getByText(/It is the only way to get back to your history/)).toBeVisible();
  await audit(page, "new code");
  await page.getByRole("button", {name: "Continue"}).click();
  await startSection(page, "Science");
  var total = Number((await page.getByRole("heading", {level: 2, name: /^Question 1 of \d+$/}).textContent()).match(/of (\d+)/)[1]);
  await page.locator("fieldset label").first().click();
  await endNow(page);
  await expect(page.getByRole("status").filter({hasText: "Saved to your history for practice code K7M2QX."})).toBeVisible();
  var save = db.calls.find((c) => c.method === "POST" && /attempts$/.test(c.path));
  expect(save.path).toBe("/codes/K7M2QX/attempts");
  expect(save.credentials).toBe("");
  expect(Object.keys(save.body).sort()).toEqual(["correct", "high", "low", "mode", "questions", "score", "seconds", "section"]);
  expect(save.body).toMatchObject({section: "science", mode: "one", questions: total, score: null, low: null, high: null});
  expect(save.body.correct === 0 || save.body.correct === 1).toBe(true);
  await page.getByRole("button", {name: "Back to start"}).click();
  await expect(page.getByText("Practice code K7M2QX. Finished sections are saved to your history.")).toBeVisible();
  await page.getByRole("button", {name: "View my history"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Your practice history"})).toBeFocused();
  var table = page.getByRole("table", {name: "Saved practice for code K7M2QX"});
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(table.getByRole("row").nth(1)).toContainText("Science");
  await expect(table.getByRole("row").nth(1)).toContainText("Practice");
  await expect(table.getByRole("row").nth(1)).toContainText(save.body.correct + " / " + total);
  // A history request never comes from a cache.
  var gets = db.calls.filter((c) => c.method === "GET");
  expect(gets.length).toBeGreaterThan(0);
  gets.forEach((c) => expect(c.query).toMatch(/^\?t=\d+$/));
  await page.getByRole("button", {name: "Stop using this code"}).click();
  await expect(page.getByRole("button", {name: "Use a practice code"})).toBeVisible();
});

var history = {
  H4RD2Q: [
    {date: "2026-09-02T15:00:00Z", section: "english", mode: "full", questions: 50, correct: 27, score: 17, low: null, high: null, seconds: 2100},
    {date: "2026-09-09T15:00:00Z", section: "english", mode: "mixed", questions: 20, correct: 13, score: null, low: 18, high: 24, seconds: 840},
    {date: "2026-09-16T15:00:00Z", section: "math", mode: "full", questions: 45, correct: 28, score: 20, low: null, high: null, seconds: 3000},
    {date: "2026-09-16T16:00:00Z", section: "science", mode: "one", questions: 6, correct: 5, score: null, low: null, high: null, seconds: 300},
    {date: "2026-09-30T15:00:00Z", section: "composite", mode: "fullact", questions: 131, correct: 80, score: 19, low: null, high: null, seconds: 7200},
    {date: "2026-10-07T15:00:00Z", section: "english", mode: "full", questions: 50, correct: 40, score: 23, low: null, high: null, seconds: 2050}
  ]
};

test("an existing code opens its history: score changes by section, a chart, and every saved practice", async ({page, problems}) => {
  void problems;
  await fakeApi(page, {codes: history});
  await go(page);
  await page.getByRole("button", {name: "Use a practice code"}).click();
  await expect(codeHeading(page)).toBeFocused();
  await page.getByLabel("Enter your practice code").fill(" h4rd-2q ");
  await page.getByLabel("Enter your practice code").press("Enter");
  await expect(page.getByRole("heading", {level: 1, name: "Your practice history"})).toBeFocused();
  await expect(page.getByText("Practice code H4RD2Q")).toBeVisible();
  var lines = page.getByRole("region", {name: "Your scores over time"}).getByRole("listitem");
  await expect(lines).toHaveText(["English: 3 scored practices. First 17, latest 23, up 6.", "Math: 1 scored practice, 20.", "Composite: 1 scored practice, 19."]);
  // The chart: one point per scored practice, a range at its middle, with the values in a screen reader table.
  var data = page.getByRole("table", {name: "Data in Estimated scores", includeHidden: true});
  await expect(data).toHaveCount(1);
  await expect(data.getByRole("row", {includeHidden: true})).toHaveCount(6);
  var table = page.getByRole("table", {name: "Saved practice for code H4RD2Q"});
  await expect(table.getByRole("row")).toHaveCount(7);
  await expect(table.getByRole("row").nth(1)).toContainText("Oct 7, 2026");
  await expect(table.getByRole("row").nth(1)).toContainText("40 / 50");
  await expect(table.getByRole("row").nth(5)).toContainText("18 to 24");
  await expect(table.getByRole("row").nth(2)).toContainText("Full ACT");
  await audit(page, "history");
  for (var [w, h] of [[390, 664], [320, 568]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "history " + w);
  }
  await page.getByRole("button", {name: "Back", exact: true}).click();
  await expect(page.getByRole("heading", {level: 1, name: "ACT Practice"})).toBeFocused();
  await expect(page.getByText("Practice code H4RD2Q. Finished sections are saved to your history.")).toBeVisible();
});

test("code problems: a mistyped code, an unknown code, too many tries, and no connection each say what to do", async ({page, problems}) => {
  var mode = null;
  var db = await fakeApi(page, {codes: history, fail: () => mode});
  await go(page, "math", "?codes=1&drafts=1");
  await page.getByRole("button", {name: /^Practice questions/}).click();
  var input = page.getByLabel("Enter your practice code"), status = page.getByRole("status").filter({hasText: /\S/});
  await input.fill("ABC1");
  await page.getByRole("button", {name: "Open my history"}).click();
  await expect(status).toHaveText("A practice code has 6 letters and numbers. Check it and try again.");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  expect(db.calls).toEqual([]);
  await input.fill("ZZZZZZ");
  await page.getByRole("button", {name: "Open my history"}).click();
  await expect(status).toHaveText("We could not find that code. Check each letter and number, or get a new code.");
  mode = 429;
  await page.getByRole("button", {name: "Open my history"}).click();
  await expect(status).toHaveText("Too many tries from this network. Wait a while and try again.");
  mode = "abort";
  await page.getByRole("button", {name: "Get a new code"}).click();
  await expect(status).toHaveText("Practice codes are not working right now. You can still practice without saving.");
  await audit(page, "code error");
  mode = null;
  await input.fill("h4rd2q");
  await page.getByRole("button", {name: "Open my history"}).click();
  // Opening a code from the prompt goes straight on to the practice.
  await startSection(page, "Math");
  allowFailedRequests(problems, [404, 429]);
});

test("a failed save says so and can be tried again", async ({page, problems}) => {
  var failSaves = 1;
  var db = await fakeApi(page, {codes: {H4RD2Q: []}, fail: (call) => (call.method === "POST" && /attempts$/.test(call.path) && failSaves-- > 0 ? 500 : null)});
  await go(page, "science");
  await page.getByRole("button", {name: /^One passage/}).click();
  await page.getByLabel("Enter your practice code").fill("H4RD2Q");
  await page.getByRole("button", {name: "Open my history"}).click();
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("status").filter({hasText: "This score could not be saved to your history. It is still shown here."})).toBeVisible();
  await audit(page, "save failed");
  await page.getByRole("button", {name: "Try saving again"}).click();
  await expect(page.getByRole("status").filter({hasText: "Saved to your history for practice code H4RD2Q."})).toBeVisible();
  expect(db.codes.H4RD2Q.length).toBe(1);
  allowFailedRequests(problems, [500]);
});

test("the full ACT saves each section and the composite under the code", async ({page, problems}) => {
  test.setTimeout(90000);
  void problems;
  var db = await fakeApi(page, {codes: {H4RD2Q: []}});
  await go(page, null, "?codes=1&drafts=1", {clock: true, seed: 5});
  await page.getByRole("region", {name: "Full ACT"}).getByRole("button", {name: "Start the full ACT"}).click();
  await expect(codeHeading(page)).toBeFocused();
  await page.getByLabel("Enter your practice code").fill("H4RD2Q");
  await page.getByRole("button", {name: "Open my history"}).click();
  await startSection(page, "English");
  await endNow(page);
  await startSection(page, "Math");
  await endNow(page);
  await page.getByRole("button", {name: "End the break"}).click();
  await startSection(page, "Reading");
  await endNow(page);
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("heading", {level: 1, name: "Full ACT score report"})).toBeFocused();
  await expect(page.getByRole("status").filter({hasText: "Saved to your history for practice code H4RD2Q."})).toBeVisible();
  var saved = db.codes.H4RD2Q;
  expect(saved.map((a) => a.section + " " + a.mode)).toEqual(["english fullact", "math fullact", "reading fullact", "science fullact", "composite fullact"]);
  expect(saved[0]).toMatchObject({questions: 50, correct: 0, score: 1});
  expect(saved[4]).toMatchObject({questions: 131, correct: 0, score: 1, low: null, high: null});
  // A section's own report shows its save; going back to the full report does not save the composite again.
  await page.getByRole("button", {name: "See the Math report"}).click();
  await expect(page.getByRole("status").filter({hasText: "Saved to your history for practice code H4RD2Q."})).toBeVisible();
  await page.getByRole("button", {name: "Back to full ACT report"}).click();
  expect(db.codes.H4RD2Q.length).toBe(5);
});
