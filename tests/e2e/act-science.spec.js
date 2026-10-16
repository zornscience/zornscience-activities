// ACT Science Practice (act-science/): both modes end to end, numbering and lettering across passages, the blank
// warning, the score report, answers kept across pages, keyboard start, layout, axe-core in light and dark mode,
// embed mode and network. Selects by role and text only, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var {loadData} = require("../support/load-data");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var data = loadData(path.join(__dirname, "..", "..", "act-science", "data.js"));
var reviewed = data.passages.filter((p) => p.status === "reviewed");
var byTitle = {};
reviewed.forEach((p) => { byTitle[p.title] = p; });
var plain = (s) => s.replace(/<\/?(sub|sup|em|strong)>/g, "");

async function go(page, seed, opts) {
  if (seed !== undefined) await page.addInitScript(seedRandom, seed);
  await page.goto("/act-science/" + ((opts && opts.query) || ""));
  await expect(page.getByRole("heading", {level: 1, name: "ACT Science Practice"})).toBeVisible();
}
async function passageOnScreen(page) {
  var title = await page.getByRole("heading", {level: 1}).textContent();
  expect(byTitle[title], "known passage " + title).toBeTruthy();
  return byTitle[title];
}
function group(page, n) { return page.getByRole("group", {name: new RegExp("^" + n + "\\.")}); }
// pick(q, n) returns the choice index to click for question q, numbered n, or null to leave it blank.
async function answerPage(page, pick, firstN) {
  var p = await passageOnScreen(page);
  for (var i = 0; i < p.questions.length; i++) {
    var n = firstN + i, idx = pick(p.questions[i], n);
    var letters = n % 2 ? ["A", "B", "C", "D"] : ["F", "G", "H", "J"];
    var g = group(page, n);
    await expect(g.getByRole("radio")).toHaveCount(4);
    for (var c = 0; c < 4; c++) await expect(g.getByRole("radio").nth(c)).toHaveAccessibleName(letters[c] + ". " + plain(p.questions[i].choices[c]));
    if (idx !== null) { await g.locator("label").nth(idx).click(); await expect(g.getByRole("radio").nth(idx)).toBeChecked(); }
  }
  return p;
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("one passage, all correct: score, no estimate, keep-it-sharp tips", async ({page, problems}) => {
  void problems;
  await go(page, 3);
  await page.getByRole("button", {name: /^One passage/}).click();
  await expect(page.getByRole("heading", {level: 1})).toBeFocused();
  await expect(page.getByText("Passage 1 of 1")).toBeVisible();
  var p = await answerPage(page, (q) => q.answer, 1);
  await page.getByRole("button", {name: "Score my answers"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
  await expect(page.getByText(p.questions.length + " / " + p.questions.length, {exact: true})).toBeVisible();
  await expect(page.getByText("100% correct")).toBeVisible();
  await expect(page.getByRole("heading", {name: "How this compares"})).toBeVisible();
  await expect(page.getByRole("heading", {name: /Estimated ACT Science score/})).toHaveCount(0);
  await expect(page.getByRole("heading", {name: "Keep it sharp"})).toBeVisible();
  await expect(page.getByRole("heading", {name: "Test-day habits"})).toBeVisible();
  await expect(page.getByRole("listitem").filter({hasText: /^Correct ·/})).toHaveCount(p.questions.length);
});

test("mixed practice: one passage per type, numbering, lettering, answers kept, blank warning, estimate", async ({page, problems}) => {
  void problems;
  await go(page, 11);
  await page.getByRole("button", {name: /^Mixed practice/}).click();
  var seen = [], n = 1;
  for (var i = 0; i < 3; i++) {
    await expect(page.getByText("Passage " + (i + 1) + " of 3")).toBeVisible();
    // Answer everything wrong except the last question of each passage, which stays blank.
    var cur = await passageOnScreen(page);
    var last = n + cur.questions.length - 1;
    await answerPage(page, (q, num) => num === last ? null : (q.answer + 1) % 4, n);
    seen.push(cur);
    n = last + 1;
    if (i < 2) await page.getByRole("button", {name: "Next passage"}).click();
  }
  expect(seen.map((p) => p.type).sort()).toEqual(data.types.slice().sort());
  var total = n - 1;
  // Back to the first passage: its answers are still selected.
  await page.getByRole("button", {name: "Previous passage"}).click();
  await page.getByRole("button", {name: "Previous passage"}).click();
  await expect(group(page, 1).getByRole("radio", {checked: true})).toHaveCount(1);
  await page.getByRole("button", {name: "Next passage"}).click();
  await page.getByRole("button", {name: "Next passage"}).click();
  await page.getByRole("button", {name: "Score my answers"}).click();
  var alert = page.getByRole("alert");
  await expect(alert).toContainText("You left 3 questions blank.");
  await alert.getByRole("button", {name: "Keep working"}).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", {name: "Score my answers"}).click();
  await page.getByRole("button", {name: "Score it anyway"}).click();
  await expect(page.getByText("0 / " + total, {exact: true})).toBeVisible();
  // 0 correct: raw 0, scale 1, range 1 to 6 (raw 0 to 4).
  await expect(page.getByRole("heading", {name: "Estimated ACT Science score: 1 to 6"})).toBeVisible();
  await expect(page.getByText(/This is a rough estimate/)).toBeVisible();
  await expect(page.getByRole("heading", {name: "What to work on"})).toBeVisible();
  await expect(page.getByRole("listitem").filter({hasText: /^Blank ·/})).toHaveCount(3);
  await expect(page.getByRole("listitem").filter({hasText: /^Missed ·/})).toHaveCount(total - 3);
});

test("mixed practice, all correct: range 31 to 36, 100th percentile", async ({page, problems}) => {
  void problems;
  await go(page, 5);
  await page.getByRole("button", {name: /^Mixed practice/}).click();
  var n = 1;
  for (var i = 0; i < 3; i++) {
    var p = await answerPage(page, (q) => q.answer, n);
    n += p.questions.length;
    await page.getByRole("button", {name: i < 2 ? "Next passage" : "Score my answers"}).click();
  }
  await expect(page.getByRole("heading", {name: "Estimated ACT Science score: 31 to 36"})).toBeVisible();
  await expect(page.getByText(/about the 100th percentile/)).toBeVisible();
  await expect(page.getByText(/meets ACT's college readiness benchmark of 23/)).toBeVisible();
});

test("keyboard: start a set and answer with arrow keys", async ({page, problems}) => {
  void problems;
  await go(page, 2);
  await expect(page.locator("body")).toBeFocused(); // nothing moves focus on first load
  var mode = page.getByRole("button", {name: /^One passage/});
  for (var i = 0; i < 10 && !(await mode.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", {level: 1})).toBeFocused();
  await page.keyboard.press("Tab"); // the passage region
  await page.keyboard.press("Tab"); // first choice of question 1
  await page.keyboard.press("ArrowDown");
  await expect(group(page, 1).getByRole("radio").nth(1)).toBeChecked();
});

for (var scheme of ["light", "dark"]) {
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    (function (scheme, w, h) {
      test("axe-core, " + scheme + " mode at " + w + "x" + h, async ({page, problems}) => {
        void problems;
        await page.emulateMedia({colorScheme: scheme});
        await page.setViewportSize({width: w, height: h});
        await go(page, 9);
        await audit(page, "intro");
        await page.getByRole("button", {name: /^Mixed practice/}).click();
        for (var i = 0; i < 3; i++) {
          await audit(page, "passage " + (i + 1));
          await page.getByRole("button", {name: i < 2 ? "Next passage" : "Score my answers"}).click();
        }
        await audit(page, "blank warning");
        await page.getByRole("button", {name: "Score it anyway"}).click();
        await audit(page, "score report");
      });
    })(scheme, w, h);
  }
}

test("no sideways scrolling from 320 to 1920 px and at 200% zoom", async ({page, problems}) => {
  void problems;
  async function check(label) {
    var over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, label).toBeLessThanOrEqual(0);
  }
  for (var [w, h] of [[320, 568], [360, 640], [400, 700], [768, 1024], [1280, 617], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, 4);
    await check(w + " intro");
    await page.getByRole("button", {name: /^Mixed practice/}).click();
    for (var i = 0; i < 3; i++) {
      await check(w + " passage " + (i + 1));
      await page.getByRole("button", {name: i < 2 ? "Next passage" : "Score my answers"}).click();
    }
    await page.getByRole("button", {name: "Score it anyway"}).click();
    await check(w + " results");
  }
});

test("only local files, no storage, footer notice, embed mode", async ({page, problems}) => {
  void problems;
  var urls = [];
  page.on("request", (r) => urls.push(r.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, "")));
  await go(page, 1, {query: "?embed=1"});
  await page.evaluate(() => document.fonts.ready);
  urls.forEach((u) => expect(u.startsWith("/"), "outside request " + u).toBe(true));
  expect(urls.some((u) => /AtkinsonHyperlegible-Regular\.woff2/.test(u))).toBe(true);
  await expect(page.getByRole("link", {name: "ZornScience home"})).toBeHidden();
  await expect(page.getByText("Practice tool by ZornScience. ACT is a registered trademark of ACT Education Corp. This tool is not affiliated with or endorsed by ACT.")).toBeVisible();
  for (var a of await page.locator("a").all()) expect(await a.getAttribute("target")).toBe("_top");
  await page.getByRole("button", {name: /^Mixed practice/}).click();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
});
