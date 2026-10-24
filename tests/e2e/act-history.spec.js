// ACT Practice codes and PINs (act/history-api.js and the code screens in act/act.js), with a fake ACT Practice
// History plugin served by page.route in place of https://zornscience.org/wp-json/zsa-act/v1/. Codes are on in
// config.js; these tests also pass ?codes=1, and ?codes=0 turns them off. Selects by role and text only, and fails on console errors or
// CSP violations.
"use strict";
var fs = require("fs");
var {test, expect, seedRandom} = require("./fixtures");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var API = "https://zornscience.org/wp-json/zsa-act/v1";

// A fake plugin. db.codes maps a code to {pin, attempts}; db.calls records every request. opts.fail(call) can return
// a status (or "abort") to make that request fail. Like the real plugin, a wrong PIN and an unknown code both get 403.
async function fakeApi(page, opts) {
  opts = opts || {};
  var db = {codes: JSON.parse(JSON.stringify(opts.codes || {})), calls: [], next: opts.next || [["K7M2QX", "0427"], ["P3W8ZD", "9150"]]};
  await page.route(API + "/**", async (route) => {
    var req = route.request(), headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json"};
    if (req.method() === "OPTIONS") { await route.fulfill({status: 204, headers: headers}); return; }
    var url = new URL(req.url()), path = url.pathname.replace("/wp-json/zsa-act/v1", "");
    var call = {method: req.method(), path: path, query: url.search, body: req.postData() ? JSON.parse(req.postData()) : null, cookie: req.headers()["cookie"] || ""};
    db.calls.push(call);
    var failure = opts.fail && opts.fail(call, db);
    if (failure === "abort") { await route.abort(); return; }
    function reply(status, body) { return route.fulfill({status: status, headers: headers, body: JSON.stringify(body)}); }
    if (failure && typeof failure === "object") { await reply(failure.status, {code: failure.code, message: "fail", data: {status: failure.status, max: failure.max}}); return; }
    if (failure) { await reply(failure, {code: "x", message: "fail"}); return; }
    var m = path.match(/^\/codes\/([A-Z0-9]{6})\/(open|attempts|progress)$/);
    if (req.method() === "POST" && path === "/codes") {
      var made = db.next.shift();
      db.codes[made[0]] = {pin: made[1], attempts: []};
      await reply(201, {code: made[0], pin: made[1]});
    } else if (req.method() === "POST" && path === "/class-lists") {
      var rows = CLASS_SET.slice(0, call.body.count);
      rows.forEach((r) => { db.codes[r.code] = {pin: r.pin, attempts: []}; });
      await reply(201, {codes: rows, csv: "Code,PIN\r\n" + rows.map((r) => r.code + "," + r.pin + "\r\n").join(""),
        pdf: Buffer.from("%PDF-1.4\nfake class set for " + call.body.name + "\n%%EOF\n").toString("base64"), file: "act-class-codes-period-3-chemistry-2026-10-24"});
    } else if (req.method() === "POST" && m) {
      var entry = db.codes[m[1]];
      if (!entry || !call.body || call.body.pin !== entry.pin) { await reply(403, {code: "zsa_act_mismatch", message: "That code and PIN do not match."}); return; }
      if (m[2] === "open") await reply(200, {code: m[1], created: "2026-09-01T12:00:00Z", attempts: entry.attempts, progress: entry.progress ? Object.assign({saved: "2026-10-24T15:05:00Z"}, entry.progress) : null});
      else if (m[2] === "progress") {
        entry.progress = call.body.progress;
        await reply(200, {saved: !!entry.progress});
      } else {
        var saved = Object.assign({}, call.body);
        delete saved.pin;
        entry.attempts.push(Object.assign({date: "2026-10-24T15:00:00Z"}, saved));
        await reply(201, {saved: true});
      }
    } else await reply(404, {});
  });
  return db;
}
var CLASS_SET = [{code: "B4KQ7N", pin: "4821"}, {code: "T9HXM3", pin: "1376"}, {code: "W2RP8D", pin: "9054"}];
// The browser logs a failed request as a console error. Tests that make requests fail on purpose remove exactly
// those messages (and nothing else) before the fixture checks for problems.
function allowFailedRequests(problems, statuses) {
  var re = new RegExp("^console error: Failed to load resource: (the server responded with a status of (" + statuses.join("|") + ") |net::ERR_FAILED$)");
  var keep = problems.filter((p) => !re.test(p));
  problems.splice(0, problems.length, ...keep);
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
var codeHeading = (page) => page.getByRole("heading", {level: 1, name: "Do you have a practice code and PIN?"});
async function enter(page, code, pin, button) {
  await page.getByLabel("Practice code").fill(code);
  await page.getByLabel("PIN", {exact: true}).fill(pin);
  await page.getByRole("button", {name: button || "Continue", exact: true}).click();
}
var history = {
  H4RD2Q: {pin: "3814", attempts: [
    {date: "2026-09-02T15:00:00Z", section: "english", mode: "full", questions: 50, correct: 27, score: 17, low: null, high: null, seconds: 2100},
    {date: "2026-09-09T15:00:00Z", section: "english", mode: "mixed", questions: 20, correct: 13, score: null, low: 18, high: 24, seconds: 840},
    {date: "2026-09-16T15:00:00Z", section: "math", mode: "full", questions: 45, correct: 28, score: 20, low: null, high: null, seconds: 3000},
    {date: "2026-09-16T16:00:00Z", section: "science", mode: "one", questions: 6, correct: 5, score: null, low: null, high: null, seconds: 300},
    {date: "2026-09-30T15:00:00Z", section: "composite", mode: "fullact", questions: 131, correct: 80, score: 19, low: null, high: null, seconds: 7200},
    {date: "2026-10-07T15:00:00Z", section: "english", mode: "full", questions: 50, correct: 40, score: 23, low: null, high: null, seconds: 2050}
  ]},
  M9TQ4C: {pin: "0072", attempts: []}
};

test("codes are on by default; with ?codes=0 there is no prompt, no code line and no request to zornscience.org", async ({page, problems}) => {
  void problems;
  var outside = [];
  page.on("request", (r) => { if (/zornscience\.org/.test(r.url())) outside.push(r.url()); });
  await go(page, "", "");
  await expect(page.getByText("Scores are saved only if you use a practice code and PIN")).toBeVisible();
  await expect(page.getByRole("region", {name: "For teachers"})).toBeVisible();
  await go(page, "science", "?codes=0");
  await expect(page.getByText("Nothing is saved or sent anywhere.")).toBeVisible();
  await expect(page.getByRole("button", {name: "Use a practice code"})).toHaveCount(0);
  await page.getByRole("button", {name: /^One passage/}).click();
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
  await expect(page.getByText(/Saved to your history|Not saved/)).toHaveCount(0);
  expect(outside).toEqual([]);
});

test("before practicing, students are asked for a code and PIN, with three choices", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page);
  await go(page, "science");
  await expect(page.getByText("Scores are saved only if you use a practice code and PIN, and they are never linked to your name.")).toBeVisible();
  await page.getByRole("button", {name: /^One passage/}).click();
  await expect(codeHeading(page)).toBeFocused();
  await expect(page.getByRole("region", {name: "Yes, I have a code and PIN"})).toBeVisible();
  await expect(page.getByRole("region", {name: "No, I need a code"}).getByRole("button", {name: "Give me a code and PIN"})).toBeVisible();
  var skip = page.getByRole("region", {name: "Practice without a code"});
  await expect(skip.getByText("Your scores will not be saved. They stay in this window only until you close it.")).toBeVisible();
  await expect(page.getByLabel("PIN", {exact: true})).toHaveAttribute("inputmode", "numeric");
  await audit(page, "code question");
  for (var [w, h] of [[390, 664], [320, 568]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "code question " + w);
  }
  expect(db.calls).toEqual([]);
});

test("a new code and PIN are shown once, with the warning, and every finished section is saved under them", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page);
  await go(page, "science", "?codes=1", {seed: 2});
  await page.getByRole("button", {name: /^One passage/}).click();
  await page.getByRole("button", {name: "Give me a code and PIN"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Your practice code and PIN"})).toBeFocused();
  await expect(page.getByText("Write these down somewhere safe or take a picture of them now. They will not be shown again.")).toBeVisible();
  await expect(page.getByText("K7M2QX", {exact: true})).toBeVisible();
  await expect(page.getByText("0427", {exact: true})).toBeVisible();
  await expect(page.getByText("K 7 M 2 Q X")).toHaveCount(1);
  await expect(page.getByText("0 4 2 7")).toHaveCount(1);
  await audit(page, "new code");
  await page.getByRole("button", {name: "I wrote them down. Continue."}).click();
  await startSection(page, "Science");
  var total = Number((await page.getByRole("heading", {level: 2, name: /^Question 1 of \d+$/}).textContent()).match(/of (\d+)/)[1]);
  await endNow(page);
  await expect(page.getByRole("status").filter({hasText: "Saved to your history."})).toBeVisible();
  var save = db.calls.find((c) => /attempts$/.test(c.path));
  expect(save.path).toBe("/codes/K7M2QX/attempts");
  expect(save.cookie).toBe("");
  expect(save.query).toBe("");
  expect(Object.keys(save.body).sort()).toEqual(["correct", "high", "low", "mode", "pin", "questions", "score", "seconds", "section"]);
  expect(save.body).toMatchObject({pin: "0427", section: "science", mode: "one", questions: total, correct: 0, score: null, low: null, high: null});
  expect(db.codes.K7M2QX.attempts.length).toBe(1);
  // The code and PIN are never shown again: not on the report, the home screen or the history.
  await expect(page.getByText(/K7M2QX|0427/)).toHaveCount(0);
  await page.getByRole("button", {name: "Back to start"}).click();
  await expect(page.getByText("You are using a practice code. Finished sections are saved to your history.")).toBeVisible();
  await expect(page.getByText(/K7M2QX|0427/)).toHaveCount(0);
  await page.getByRole("button", {name: "View my history"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Your practice history"})).toBeFocused();
  var table = page.getByRole("table", {name: "Saved practice"});
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(table.getByRole("row").nth(1)).toContainText("0 / " + total);
  await expect(page.getByText(/K7M2QX|0427/)).toHaveCount(0);
  // Every request is a POST, and the PIN is only ever in a request body.
  db.calls.forEach((c) => { expect(c.method).toBe("POST"); expect(c.path + c.query).not.toContain("0427"); });
  await page.getByRole("button", {name: "Stop using this code"}).click();
  await expect(page.getByRole("button", {name: "Use a practice code"})).toBeVisible();
});

test("a code and PIN that match open the history: changes by section, a chart, and every saved practice", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page, {codes: history});
  await go(page);
  await page.getByRole("button", {name: "Use a practice code"}).click();
  await expect(codeHeading(page)).toBeFocused();
  // Opened from the home screen, there is no practice to start, so the choices are open the history or go back.
  await expect(page.getByRole("region", {name: "Practice without a code"})).toHaveCount(0);
  await enter(page, " h4rd-2q ", " 3814 ", "Open my history");
  await expect(page.getByRole("heading", {level: 1, name: "Your practice history"})).toBeFocused();
  expect(db.calls[0]).toMatchObject({path: "/codes/H4RD2Q/open", body: {pin: "3814"}});
  var lines = page.getByRole("region", {name: "Your scores over time"}).getByRole("listitem");
  await expect(lines).toHaveText(["English: 3 scored practices. First 17, latest 23, up 6.", "Math: 1 scored practice, 20.", "Composite: 1 scored practice, 19."]);
  var data = page.getByRole("table", {name: "Data in Estimated scores", includeHidden: true});
  await expect(data.getByRole("row", {includeHidden: true})).toHaveCount(6);
  var table = page.getByRole("table", {name: "Saved practice"});
  await expect(table.getByRole("row")).toHaveCount(7);
  await expect(table.getByRole("row").nth(1)).toContainText("Oct 7, 2026");
  await expect(table.getByRole("row").nth(1)).toContainText("40 / 50");
  await expect(table.getByRole("row").nth(5)).toContainText("18 to 24");
  await expect(table.getByRole("row").nth(2)).toContainText("Full ACT");
  await expect(page.getByText(/H4RD2Q|3814/)).toHaveCount(0);
  await audit(page, "history");
  for (var [w, h] of [[390, 664], [320, 568]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "history " + w);
  }
  await page.getByRole("button", {name: "Back", exact: true}).click();
  await expect(page.getByRole("heading", {level: 1, name: "ACT Practice"})).toBeFocused();
  await expect(page.getByText("You are using a practice code. Finished sections are saved to your history.")).toBeVisible();
});

test("a wrong code or PIN never starts the test or touches anyone's history", async ({page, problems}) => {
  var db = await fakeApi(page, {codes: history});
  await go(page, "math", "?codes=1&drafts=1");
  await page.getByRole("button", {name: /^Practice questions/}).click();
  var status = page.getByRole("status").filter({hasText: /\S/});
  var mismatch = "That code and PIN do not match. Check both and try again. You cannot start until they match, or you can practice without a code.";
  // Wrong PIN for a real code: stays on the question, both fields marked.
  await enter(page, "H4RD2Q", "3815");
  await expect(status).toHaveText(mismatch);
  await expect(codeHeading(page)).toBeVisible();
  await expect(page.getByLabel("Practice code")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("PIN", {exact: true})).toHaveAttribute("aria-invalid", "true");
  // Another student's code with this student's PIN (a typo in the code): same answer.
  await enter(page, "M9TQ4C", "3814");
  await expect(status).toHaveText(mismatch);
  // A code that does not exist: same answer, so no one learns which codes exist.
  await enter(page, "ZZZZZZ", "3814");
  await expect(status).toHaveText(mismatch);
  await audit(page, "mismatch");
  // Formats are checked before anything is sent.
  var sent = db.calls.length;
  await enter(page, "ABC1", "3814");
  await expect(status).toHaveText("Enter your 6-character practice code.");
  await expect(page.getByLabel("Practice code")).toBeFocused();
  await enter(page, "H4RD2Q", "38");
  await expect(status).toHaveText("Enter your 4-digit PIN.");
  await expect(page.getByLabel("PIN", {exact: true})).toBeFocused();
  expect(db.calls.length).toBe(sent);
  // Nothing was added anywhere, and the test never started.
  expect(db.codes.H4RD2Q.attempts.length).toBe(6);
  expect(db.codes.M9TQ4C.attempts.length).toBe(0);
  expect(db.calls.filter((c) => /attempts$/.test(c.path))).toEqual([]);
  await expect(page.getByRole("heading", {name: /test directions/})).toHaveCount(0);
  // The right pair starts the practice.
  await enter(page, "h4rd2q", "3814");
  await startSection(page, "Math");
  allowFailedRequests(problems, [403]);
});

test("too many tries and no connection say what to do", async ({page, problems}) => {
  var mode = null;
  await fakeApi(page, {codes: history, fail: () => mode});
  await go(page, "science");
  await page.getByRole("button", {name: /^One passage/}).click();
  var status = page.getByRole("status").filter({hasText: /\S/});
  mode = 429;
  await enter(page, "H4RD2Q", "3814");
  await expect(status).toHaveText("Too many tries. Wait an hour and try again, or practice without a code.");
  mode = "abort";
  await page.getByRole("button", {name: "Give me a code and PIN"}).click();
  await expect(status).toHaveText("Practice codes are not working right now. You can still practice without a code.");
  await expect(page.getByRole("heading", {name: /test directions/})).toHaveCount(0);
  allowFailedRequests(problems, [429]);
});

test("practicing without a code: warned, nothing is sent, and this visit's scores are kept only in the window", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page);
  await go(page, "science", "?codes=1", {seed: 4});
  await page.getByRole("button", {name: /^One passage/}).click();
  await page.getByRole("button", {name: "Practice without a code"}).click();
  await startSection(page, "Science");
  await page.locator("fieldset label").first().click();
  await endNow(page);
  await expect(page.getByRole("status").filter({hasText: "Not saved: you are practicing without a code, so this score stays in this window only until you close it."})).toBeVisible();
  await page.getByRole("button", {name: "Try another set"}).click();
  // Asked only once per visit.
  await startSection(page, "Science");
  await endNow(page);
  await page.getByRole("button", {name: "Back to start"}).click();
  await expect(page.getByText("You are practicing without a code. Your scores stay in this window only until you close it.")).toBeVisible();
  await page.getByRole("button", {name: "View this visit's scores"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Scores from this visit"})).toBeFocused();
  await expect(page.getByText("You are practicing without a code, so these scores are not saved. They will be gone when you close this window.")).toBeVisible();
  await expect(page.getByRole("table", {name: "Practice from this visit"}).getByRole("row")).toHaveCount(3);
  await audit(page, "visit scores");
  expect(db.calls).toEqual([]);
  // After a reload (like closing the window), the scores are gone and the question is asked again.
  await page.reload();
  await expect(page.getByRole("button", {name: "View this visit's scores"})).toHaveCount(0);
  await page.getByRole("button", {name: /^One passage/}).click();
  await expect(codeHeading(page)).toBeFocused();
});

test("a failed save says so and can be tried again with the same code and PIN", async ({page, problems}) => {
  var failSaves = 1;
  var db = await fakeApi(page, {codes: history, fail: (call) => (/attempts$/.test(call.path) && failSaves-- > 0 ? 500 : null)});
  await go(page, "science");
  await page.getByRole("button", {name: /^One passage/}).click();
  await enter(page, "M9TQ4C", "0072");
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("status").filter({hasText: "This score could not be saved to your history. It is still shown here."})).toBeVisible();
  await audit(page, "save failed");
  await page.getByRole("button", {name: "Try saving again"}).click();
  await expect(page.getByRole("status").filter({hasText: "Saved to your history."})).toBeVisible();
  expect(db.codes.M9TQ4C.attempts.length).toBe(1);
  expect(db.calls.filter((c) => /attempts$/.test(c.path)).map((c) => c.body.pin)).toEqual(["0072", "0072"]);
  allowFailedRequests(problems, [500]);
});

test("the full ACT asks first, then saves each section and the composite under the code", async ({page, problems}) => {
  test.setTimeout(90000);
  void problems;
  var db = await fakeApi(page, {codes: history});
  await go(page, null, "?codes=1&drafts=1", {clock: true, seed: 5});
  await page.getByRole("region", {name: "Full ACT"}).getByRole("button", {name: "Start the full ACT"}).click();
  await expect(codeHeading(page)).toBeFocused();
  await enter(page, "M9TQ4C", "0072");
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
  await expect(page.getByRole("status").filter({hasText: "Saved to your history."})).toBeVisible();
  var saved = db.codes.M9TQ4C.attempts;
  expect(saved.map((a) => a.section + " " + a.mode)).toEqual(["english fullact", "math fullact", "reading fullact", "science fullact", "composite fullact"]);
  expect(saved[4]).toMatchObject({questions: 131, correct: 0, score: 1, low: null, high: null});
  await page.getByRole("button", {name: "See the Math report"}).click();
  await expect(page.getByRole("status").filter({hasText: "Saved to your history."})).toBeVisible();
  await page.getByRole("button", {name: "Back to full ACT report"}).click();
  expect(db.codes.M9TQ4C.attempts.length).toBe(5);
});

test("teachers make a class set: the codes and PINs, a PDF to print and a CSV file, shown once", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page);
  await go(page, "");
  var teach = page.getByRole("region", {name: "For teachers"});
  await expect(teach).toContainText("Make a practice code and PIN for every student in a class");
  await teach.getByRole("button", {name: "Make class codes"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Class codes and PINs"})).toBeFocused();
  expect(new URL(page.url()).hash).toBe("#teachers");
  await audit(page, "class set form");
  var count = page.getByLabel("Number of students"), make = page.getByRole("button", {name: "Make class codes"});
  await expect(count).toHaveAccessibleDescription(/From 1 to 50\./);
  await make.click();
  await expect(page.getByRole("status").filter({hasText: "Enter a number of students from 1 to 50."})).toBeVisible();
  await expect(count).toHaveAttribute("aria-invalid", "true");
  await expect(count).toBeFocused();
  for (var bad of ["0", "51", "2.5"]) {
    await count.fill(bad);
    await make.click();
    await expect(page.getByText("Enter a number of students from 1 to 50.")).toBeVisible();
  }
  expect(db.calls).toEqual([]);
  await count.fill("3");
  await page.getByLabel("Class name (optional)").fill("Period 3 Chemistry");
  await page.getByLabel("Class name (optional)").press("Enter");
  var ready = page.getByRole("heading", {level: 2, name: "Your class set is ready: 3 codes and PINs"});
  await expect(ready).toBeFocused();
  expect(db.calls.map((c) => [c.method, c.path, c.query, c.body, c.cookie])).toEqual([["POST", "/class-lists", "", {count: 3, name: "Period 3 Chemistry"}, ""]]);
  await expect(page.getByLabel("Number of students")).toBeHidden();
  await expect(page.getByText("Download the PDF and the CSV file now. The PINs will not be shown again after you leave this page.")).toBeVisible();
  var tbl = page.getByRole("table", {name: "Codes and PINs for this class"});
  await expect(tbl.getByRole("row")).toHaveText([/Student\s*Practice code\s*PIN/, /1\s*B4KQ7N\s*4821/, /2\s*T9HXM3\s*1376/, /3\s*W2RP8D\s*9054/]);
  var [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", {name: "Download PDF to print"}).click()]);
  expect(pdf.suggestedFilename()).toBe("act-class-codes-period-3-chemistry-2026-10-24.pdf");
  expect(fs.readFileSync(await pdf.path(), "latin1")).toBe("%PDF-1.4\nfake class set for Period 3 Chemistry\n%%EOF\n");
  await expect(page.getByRole("status").filter({hasText: "Downloaded act-class-codes-period-3-chemistry-2026-10-24.pdf."})).toBeVisible();
  var [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", {name: "Download CSV file"}).click()]);
  expect(csv.suggestedFilename()).toBe("act-class-codes-period-3-chemistry-2026-10-24.csv");
  expect(fs.readFileSync(await csv.path(), "utf8")).toBe("Code,PIN\r\nB4KQ7N,4821\r\nT9HXM3,1376\r\nW2RP8D,9054\r\n");
  await audit(page, "class set ready");
  await page.setViewportSize({width: 400, height: 800});
  await noSideScroll(page, "class set at 400px");
  // A student types a code and PIN from the class set.
  await page.getByRole("button", {name: "Back to start"}).click();
  expect(new URL(page.url()).hash).toBe("");
  await page.getByRole("button", {name: /^Science/}).click();
  await page.getByRole("button", {name: /^One passage/}).click();
  await expect(codeHeading(page)).toBeFocused();
  await enter(page, "t9hxm3", "1376");
  await startSection(page, "Science");
  // Making another class set starts over with an empty form; the first set is not shown again.
  await page.goto("about:blank");
  await go(page, "teachers");
  await expect(page.getByRole("heading", {level: 1, name: "Class codes and PINs"})).toBeVisible();
  await expect(page.getByText("B4KQ7N")).toHaveCount(0);
  await expect(page.getByLabel("Number of students")).toHaveValue("");
});

test("class set limits and failures say what to do, and nothing is offered", async ({page, problems}) => {
  var replies = [{status: 429, code: "zsa_act_busy"}, {status: 429, code: "zsa_act_daily"}, {status: 503, code: "zsa_act_off"}, {status: 400, code: "zsa_act_count", max: 30}, "abort"];
  await fakeApi(page, {fail: (call) => call.path === "/class-lists" ? replies.shift() : null});
  await go(page, "teachers");
  await page.getByLabel("Number of students").fill("40");
  var make = page.getByRole("button", {name: "Make class codes"}), msg = page.getByRole("status");
  for (var text of ["This network has made as many class sets as it can for now. Try again in an hour.",
    "ZornScience has made as many new codes as it can for today. Try again tomorrow.",
    "Class codes are turned off right now.",
    "Enter a number of students from 1 to 30.",
    "Class codes are not working right now. Try again later."]) {
    await make.click();
    await expect(msg).toHaveText(text);
    await expect(make).toBeEnabled();
  }
  await expect(page.getByRole("button", {name: "Download PDF to print"})).toHaveCount(0);
  allowFailedRequests(problems, [400, 429, 503]);
});

test("with codes off there is no class set page", async ({page, problems}) => {
  void problems;
  await go(page, "teachers", "?codes=0");
  await expect(page.getByRole("heading", {level: 1, name: "ACT Practice"})).toBeVisible();
  await expect(page.getByRole("region", {name: "For teachers"})).toHaveCount(0);
});

// ---------- Picking up an unfinished practice ----------
// Hiding the page (closing the tab, switching away) saves the practice in progress at once.
async function hidePage(page) {
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {value: "hidden", configurable: true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
}
function lastProgress(db) { var c = db.calls.filter((x) => /\/progress$/.test(x.path)); return c.length ? c[c.length - 1].body : null; }

test("a practice closed partway is saved with the code and picked up where it was left", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page, {codes: history});
  await go(page, "science", "?codes=1", {seed: 4});
  await page.getByRole("button", {name: /^Mixed practice/}).click();
  await enter(page, "M9TQ4C", "0072");
  await startSection(page, "Science");
  // Saved as soon as the section begins.
  await expect.poll(() => lastProgress(db) && lastProgress(db).progress.section.cur).toBe(0);
  var first = lastProgress(db);
  expect(first.pin).toBe("0072");
  expect(Object.keys(first.progress).sort()).toEqual(["section", "v"]);
  expect(Object.keys(first.progress.section).sort()).toEqual(["answers", "cur", "elapsed", "flags", "key", "mode", "timeUp", "units", "warned"]);
  expect(first.progress.section).toMatchObject({key: "science", mode: "mixed", answers: {}, flags: [], cur: 0});
  var total = Number((await page.getByRole("heading", {level: 2, name: /^Question 1 of \d+$/}).textContent()).match(/of (\d+)/)[1]);
  await page.locator("fieldset label").nth(2).click();
  await page.getByRole("button", {name: "Next", exact: true}).click();
  await page.getByRole("button", {name: "Flag for review"}).click();
  await page.getByRole("button", {name: "Next", exact: true}).click();
  await page.locator("fieldset label").nth(1).click();
  await hidePage(page);
  await expect.poll(() => lastProgress(db).progress.section.cur).toBe(2);
  expect(lastProgress(db).progress.section).toMatchObject({answers: {1: 2, 3: 1}, flags: [2], cur: 2});
  // The practice code, PIN and saved progress are all that is sent: no names.
  expect(JSON.stringify(lastProgress(db))).not.toMatch(/name|email|school/i);
  // A new visit: the student logs in with the code and PIN and is offered the unfinished practice.
  await go(page, "science", "?codes=1", {seed: 9});
  await page.getByRole("button", {name: /^One passage/}).click();
  await enter(page, "M9TQ4C", "0072");
  await expect(page.getByRole("heading", {level: 1, name: "Pick up where you left off?"})).toBeFocused();
  await expect(page.getByText(new RegExp("^You have an unfinished Science practice \\(Mixed practice\\)\\. You were on question 3 of " + total + ", with \\d+:\\d\\d left\\.$"))).toBeVisible();
  await expect(page.getByText(/^Last saved /)).toBeVisible();
  await expect(page.getByText("Highlights and crossed-out or hidden choices are not.", {exact: false})).toBeVisible();
  await audit(page, "resume offer");
  await page.getByRole("button", {name: "Pick up where I left off"}).click();
  await expect(page.getByRole("heading", {level: 2, name: new RegExp("^Question 3 of " + total + "$")})).toBeFocused();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await expect(page.getByRole("timer")).toHaveText(/^Time left \d+:\d\d$/);
  await nav(page).getByRole("button").first().click();
  await expect(page.getByRole("radio").nth(2)).toBeChecked();
  await expect(nav(page).getByRole("button").nth(1)).toHaveAccessibleName(/flagged/);
  // Finishing the section saves the score and clears the saved progress.
  await endNow(page);
  await expect(page.getByRole("status").filter({hasText: "Saved to your history."})).toBeVisible();
  await expect.poll(() => lastProgress(db).progress).toBe(null);
  expect(db.codes.M9TQ4C.progress).toBe(null);
  var saved = db.codes.M9TQ4C.attempts;
  expect(saved[saved.length - 1]).toMatchObject({section: "science", mode: "mixed", questions: total});
  expect(saved[saved.length - 1].correct).toBeLessThanOrEqual(2);
});

test("the full ACT is picked up in the section under way, or at the next section after a finished one", async ({page, problems}) => {
  test.setTimeout(90000);
  void problems;
  var db = await fakeApi(page, {codes: history});
  await go(page, null, "?codes=1", {seed: 5});
  await page.getByRole("region", {name: "Full ACT"}).getByRole("button", {name: "Start the full ACT"}).click();
  await enter(page, "M9TQ4C", "0072");
  await startSection(page, "English");
  await page.locator("fieldset label").first().click();
  await hidePage(page);
  await expect.poll(() => lastProgress(db) && lastProgress(db).progress.full && lastProgress(db).progress.full.section && Object.keys(lastProgress(db).progress.full.section.answers).length).toBe(1);
  var full = lastProgress(db).progress.full;
  expect(full).toMatchObject({keys: ["english", "math", "reading", "science"], withScience: true, done: [], next: 0});
  expect(full.sets.english.length).toBe(5);
  expect(full.sets.math.length).toBe(45);
  // Back in the middle of English.
  await go(page, null, "?codes=1", {seed: 6});
  await page.getByRole("region", {name: "Full ACT"}).getByRole("button", {name: "Start the full ACT"}).click();
  await enter(page, "M9TQ4C", "0072");
  await expect(page.getByText(/^You have an unfinished full ACT\. You were on question 1 of 50 in the English section, with 3[45]:\d\d left\.$/)).toBeVisible();
  await page.getByRole("button", {name: "Pick up where I left off"}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 1 of 50"})).toBeFocused();
  await expect(page.getByRole("radio").first()).toBeChecked();
  await endNow(page);
  // English is finished and saved; Math's directions are next.
  await expect(page.getByRole("heading", {level: 1, name: "Math test directions"})).toBeFocused();
  await expect.poll(() => lastProgress(db).progress.full.done.length).toBe(1);
  expect(lastProgress(db).progress.full).toMatchObject({next: 1, section: null});
  expect(db.codes.M9TQ4C.attempts.filter((a) => a.mode === "fullact").map((a) => a.section)).toEqual(["english"]);
  // Back again: the full ACT goes on with Math, and English's answers are kept for the report.
  await go(page, null, "?codes=1", {seed: 7});
  await page.getByRole("region", {name: "Full ACT"}).getByRole("button", {name: "Start the full ACT"}).click();
  await enter(page, "M9TQ4C", "0072");
  await expect(page.getByText("You have an unfinished full ACT. The Math section is next.")).toBeVisible();
  await page.getByRole("button", {name: "Pick up where I left off"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Math test directions"})).toBeFocused();
  await expect(page.getByText("Welcome back. Your finished sections are kept, and the next section starts when you are ready.")).toBeVisible();
  await startSection(page, "Math");
  await endNow(page);
  await page.getByRole("button", {name: "End the break"}).click();
  await startSection(page, "Reading");
  await endNow(page);
  await startSection(page, "Science");
  await endNow(page);
  await expect(page.getByRole("heading", {level: 1, name: "Full ACT score report"})).toBeFocused();
  await expect.poll(() => lastProgress(db).progress).toBe(null);
  // English counted with its one answer: the composite saved once, with all four sections.
  var saved = db.codes.M9TQ4C.attempts.filter((a) => a.mode === "fullact");
  expect(saved.map((a) => a.section)).toEqual(["english", "math", "reading", "science", "composite"]);
  expect(saved[4].questions).toBe(131);
});

test("starting over deletes the unfinished practice; progress that no longer fits the banks is not offered", async ({page, problems}) => {
  void problems;
  var codes = JSON.parse(JSON.stringify(history));
  codes.M9TQ4C.progress = {v: 1, section: {key: "math", mode: "mixed", units: ["m-linear-1", "m-powers-1"], answers: {1: 0}, flags: [], cur: 1, elapsed: 30, warned: false, timeUp: false}};
  codes.H4RD2Q.progress = {v: 1, section: {key: "math", mode: "mixed", units: ["m-linear-1", "m-gone-99"], answers: {}, flags: [], cur: 0, elapsed: 0, warned: false, timeUp: false}};
  var db = await fakeApi(page, {codes: codes});
  await go(page, "math", "?codes=1", {seed: 3});
  await page.getByRole("button", {name: /^Practice questions/}).click();
  await enter(page, "M9TQ4C", "0072");
  await expect(page.getByText(/^You have an unfinished Math practice \(Mixed practice\)\. You were on question 2 of 2, with \d+:\d\d left\.$/)).toBeVisible();
  await page.getByRole("button", {name: "Start over"}).click();
  // The practice the student chose starts, and the saved one is deleted.
  await expect(page.getByRole("heading", {level: 1, name: "Math test directions"})).toBeFocused();
  await expect.poll(() => db.codes.M9TQ4C.progress).toBe(null);
  expect(lastProgress(db)).toEqual({pin: "0072", progress: null});
  // A saved practice with a question no longer in the bank goes straight on.
  await go(page, "math", "?codes=1", {seed: 3});
  await page.getByRole("button", {name: /^Practice questions/}).click();
  await enter(page, "H4RD2Q", "3814");
  await expect(page.getByRole("heading", {level: 1, name: "Math test directions"})).toBeFocused();
  await expect(page.getByRole("heading", {name: "Pick up where you left off?"})).toHaveCount(0);
});

test("the logo asks before leaving partway through a test: saved with a code, lost without one", async ({page, problems}) => {
  void problems;
  var db = await fakeApi(page, {codes: history});
  await page.route("https://zornscience.org/", (route) => route.fulfill({status: 200, contentType: "text/html", body: "<!doctype html><title>ZornScience</title><h1>ZornScience</h1>"}));
  var logo = page.getByRole("banner").getByRole("link", {name: "ZornScience home"});
  // Not in a test: the logo just goes.
  await go(page, "science", "?codes=0");
  await logo.click();
  await page.waitForURL("https://zornscience.org/");
  // Without a code, partway through: asked, and Stay keeps the test going.
  await go(page, "science", "?codes=0");
  await page.getByRole("button", {name: /^One passage/}).click();
  await startSection(page, "Science");
  await page.locator("fieldset label").first().click();
  await logo.click();
  var dlg = page.getByRole("dialog", {name: "Leave the test?"});
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText("Your answers in this test are not saved. If you leave, they will be lost.");
  await expect(dlg.getByRole("button", {name: "Stay in the test"})).toBeFocused();
  await audit(page, "leave without a code");
  await dlg.getByRole("button", {name: "Stay in the test"}).click();
  await expect(dlg).toBeHidden();
  await expect(logo).toBeFocused();
  await expect(page.getByRole("radio").first()).toBeChecked();
  expect(page.url()).toContain("/act/");
  // Escape stays too.
  await logo.click();
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  expect(page.url()).toContain("/act/");
  // With a code: the progress is saved before leaving, and can be picked up.
  await go(page, "science", "?codes=1");
  await page.getByRole("button", {name: /^One passage/}).click();
  await enter(page, "M9TQ4C", "0072");
  await startSection(page, "Science");
  await page.getByRole("button", {name: "Next", exact: true}).click();
  await logo.click();
  await expect(dlg).toContainText("Your progress is saved with your practice code. To pick up where you left off, come back and enter your code and PIN.");
  await dlg.getByRole("button", {name: "Leave"}).click();
  await page.waitForURL("https://zornscience.org/");
  await expect.poll(() => db.codes.M9TQ4C.progress && db.codes.M9TQ4C.progress.section.cur).toBe(1);
});
