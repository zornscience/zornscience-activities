// ACT Science Practice (act-science/): the section shell (directions, one question at a time, Previous and Next across
// passages, the numbered navigator, flags, the review screen and ending the section), the countdown and count-up
// timers with page.clock, the score report, keyboard, layout, axe-core in light and dark mode, embed mode and network.
// Selects by role, tag and text only, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var {loadData} = require("../support/load-data");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var data = loadData(path.join(__dirname, "..", "..", "act-science", "data.js"));
var byTitle = {};
data.passages.filter((p) => p.status === "reviewed").forEach((p) => { byTitle[p.title] = p; });
var plain = (s) => s.replace(/<\/?(sub|sup|em|strong)>/g, "");

async function go(page, seed, opts) {
  if (opts && opts.clock) await page.clock.install();
  if (seed !== undefined) await page.addInitScript(seedRandom, seed);
  await page.goto("/act-science/" + ((opts && opts.query) || ""));
  await expect(page.getByRole("heading", {level: 1, name: "ACT Science Practice"})).toBeVisible();
}
async function begin(page, mode) {
  await page.getByRole("button", {name: new RegExp("^" + mode)}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Science test directions"})).toBeFocused();
  await page.getByRole("button", {name: "Start the section"}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 1 of"})).toBeFocused();
}
function nav(page) { return page.getByRole("toolbar", {name: "Questions"}); }
function navButton(page, n) { return nav(page).getByRole("button", {name: new RegExp("^Question " + n + ",")}); }
function next(page) { return page.getByRole("button", {name: "Next", exact: true}); }
function prev(page) { return page.getByRole("button", {name: "Previous", exact: true}); }
function reviewBtn(page) { return page.getByRole("button", {name: "Review", exact: true}); }
// The question on screen: its number and its data, found from the passage title.
async function current(page) {
  var h = await page.getByRole("heading", {level: 2, name: /^Question \d+ of \d+$/}).textContent();
  var m = h.match(/^Question (\d+) of (\d+)$/);
  var title = await page.getByRole("article").getByRole("heading", {level: 1}).textContent();
  var p = byTitle[title];
  expect(p, "known passage " + title).toBeTruthy();
  return {n: Number(m[1]), total: Number(m[2]), p: p};
}
// Plays the whole section with Next. pick(q, n) gives the choice to click, or null for blank. Checks letters on the way.
async function playAll(page, pick, onEach) {
  var seen = [], localIndex = 0, lastTitle = null;
  for (;;) {
    var c = await current(page);
    if (c.p.title !== lastTitle) { seen.push(c.p); localIndex = 0; lastTitle = c.p.title; }
    var q = c.p.questions[localIndex];
    await expect(page.getByRole("group", {name: plain(q.stem)})).toBeVisible();
    var letters = c.n % 2 ? ["A", "B", "C", "D"] : ["F", "G", "H", "J"];
    var radios = page.getByRole("radio");
    await expect(radios).toHaveCount(4);
    for (var k = 0; k < 4; k++) await expect(radios.nth(k)).toHaveAccessibleName(letters[k] + ". " + plain(q.choices[k]));
    var idx = pick(q, c.n);
    if (idx !== null) { await page.locator("fieldset label").nth(idx).click(); await expect(radios.nth(idx)).toBeChecked(); }
    if (onEach) await onEach(c, q);
    localIndex += 1;
    if (c.n === c.total) break;
    await next(page).click();
  }
  return seen;
}
async function endSection(page) {
  await reviewBtn(page).click();
  await expect(page.getByRole("heading", {level: 1, name: "Section review"})).toBeFocused();
  await page.getByRole("button", {name: "End section"}).click();
  await expect(page.getByRole("heading", {name: "End the section?"})).toBeFocused();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("one passage, all correct: count-up clock, Next to Review, end, score without estimate", async ({page, problems}) => {
  void problems;
  await go(page, 3);
  await begin(page, "One passage");
  await expect(page.getByText("Time used")).toBeVisible();
  await expect(prev(page)).toBeDisabled();
  var seen = await playAll(page, (q) => q.answer);
  expect(seen.length).toBe(1);
  await expect(reviewBtn(page)).toBeVisible();
  var n = seen[0].questions.length;
  await reviewBtn(page).click();
  await expect(page.getByText(n + " answered, 0 not answered, 0 flagged, out of " + n + " questions.")).toBeVisible();
  await page.getByRole("button", {name: "End section"}).click();
  await expect(page.getByText("There is no penalty for guessing.")).toHaveCount(0);
  await page.getByRole("button", {name: "Yes, end the section"}).click();
  await expect(page.getByText(n + " / " + n, {exact: true})).toBeVisible();
  await expect(page.getByText("100% correct")).toBeVisible();
  await expect(page.getByRole("heading", {name: "How this compares"})).toBeVisible();
  await expect(page.getByRole("heading", {name: /Estimated ACT Science score/})).toHaveCount(0);
  await expect(page.getByRole("listitem").filter({hasText: /^Correct ·/})).toHaveCount(n);
  await expect(nav(page)).toBeHidden();
});

test("mixed practice: crosses passages both ways, keeps answers and flags, review links, end with blanks", async ({page, problems}) => {
  void problems;
  await go(page, 11);
  await begin(page, "Mixed practice");
  // Answer everything wrong and flag question 2 on the way.
  var seen = await playAll(page, (q) => (q.answer + 1) % 4, async (c) => {
    if (c.n === 2) await page.getByRole("button", {name: "Flag for review"}).click();
  });
  expect(seen.map((p) => p.type).sort()).toEqual(data.types.slice().sort());
  var total = (await current(page)).total;
  // Numbering ran across passages; Previous crosses back into the previous passage.
  var firstLen = seen[0].questions.length;
  await navButton(page, firstLen + 1).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question " + (firstLen + 1) + " of " + total})).toBeFocused();
  await prev(page).click();
  await expect(page.getByRole("article").getByRole("heading", {level: 1})).toHaveText(seen[0].title);
  await expect(page.getByRole("heading", {level: 2, name: "Question " + firstLen + " of " + total})).toBeVisible();
  await expect(page.getByRole("radio", {checked: true})).toHaveCount(1);
  // The flag shows in the navigator and stays on the question.
  await expect(navButton(page, 2)).toHaveAccessibleName("Question 2, answered, flagged");
  await expect(navButton(page, 3)).toHaveAccessibleName("Question 3, answered");
  await navButton(page, 2).click();
  await expect(page.getByRole("button", {name: "Flag for review"})).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("radio", {checked: true})).toHaveCount(1);
  // Review screen: everything answered, one flagged; a flagged link goes back to the question.
  await navButton(page, total).click();
  await reviewBtn(page).click();
  await expect(page.getByText(total + " answered, 0 not answered, 1 flagged, out of " + total + " questions.")).toBeVisible();
  await page.getByRole("region", {name: "Flagged (1)"}).getByRole("button", {name: /^Question 2,/}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 2 of " + total})).toBeFocused();
  // Unflag it; review again, then cancel ending once.
  await page.getByRole("button", {name: "Flag for review"}).click();
  await navButton(page, total).click();
  await reviewBtn(page).click();
  await expect(page.getByText(total + " answered, 0 not answered, 0 flagged")).toBeVisible();
  await page.getByRole("button", {name: "End section"}).click();
  await page.getByRole("button", {name: "No, keep working"}).click();
  await expect(page.getByRole("heading", {name: "End the section?"})).toHaveCount(0);
  await page.getByRole("button", {name: "Return to questions"}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question " + total + " of " + total})).toBeFocused();
  await endSection(page);
  await expect(page.getByText("0 / " + total, {exact: true})).toBeVisible();
  await expect(page.getByRole("heading", {name: "Estimated ACT Science score: 1 to 6"})).toBeVisible();
  await expect(page.getByRole("listitem").filter({hasText: /^Missed ·/})).toHaveCount(total);
});

test("mixed practice with blanks: review lists them and ending warns about guessing", async ({page, problems}) => {
  void problems;
  await go(page, 12);
  await begin(page, "Mixed practice");
  var total = (await current(page)).total;
  await page.locator("fieldset label").first().click();
  await navButton(page, total).click();
  await reviewBtn(page).click();
  await expect(page.getByText("1 answered, " + (total - 1) + " not answered, 0 flagged")).toBeVisible();
  await expect(page.getByRole("heading", {name: "Not answered (" + (total - 1) + ")"})).toBeVisible();
  await page.getByRole("button", {name: "End section"}).click();
  await expect(page.getByText("You have " + (total - 1) + " questions not answered. There is no penalty for guessing.")).toBeVisible();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
  await expect(page.getByRole("listitem").filter({hasText: /^Blank ·/})).toHaveCount(total - 1);
});

test("mixed practice, all correct: range 31 to 36, 100th percentile", async ({page, problems}) => {
  void problems;
  await go(page, 5);
  await begin(page, "Mixed practice");
  await playAll(page, (q) => q.answer);
  await endSection(page);
  await expect(page.getByRole("heading", {name: "Estimated ACT Science score: 31 to 36"})).toBeVisible();
  await expect(page.getByText(/about the 100th percentile/)).toBeVisible();
});

test("timed: counts down, hides and shows, warns at 5 minutes, ends cleanly at 0", async ({page, problems}) => {
  void problems;
  await go(page, 6, {clock: true});
  await begin(page, "Mixed practice");
  var total = (await current(page)).total;
  var timer = page.getByRole("timer");
  await expect(timer).toHaveText("Time left " + total + ":00");
  await page.getByRole("button", {name: "Hide timer"}).click();
  await expect(timer).toHaveText("Timer hidden");
  await page.getByRole("button", {name: "Show timer"}).click();
  await page.clock.fastForward((total - 5) * 60 * 1000 - 2000);
  await expect(page.getByRole("alert", {includeHidden: true})).toHaveText("");
  await page.clock.fastForward(3000);
  await expect(page.getByRole("alert", {includeHidden: true})).toContainText("5 minutes left.");
  await expect(timer).toHaveText(/^Time left 4:5\d$/);
  await page.getByRole("button", {name: "OK"}).click();
  await expect(page.getByRole("alert", {includeHidden: true})).toHaveText("");
  // The warning fires once only.
  await page.clock.fastForward(60 * 1000);
  await expect(page.getByRole("alert", {includeHidden: true})).toHaveText("");
  // Directions open while time runs out: the section still ends.
  await page.getByRole("button", {name: "Directions"}).click();
  await page.clock.fastForward(5 * 60 * 1000);
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText(/Time is up\./)).toBeVisible();
  await expect(page.getByText("Time " + total + ":00, on ACT pace")).toBeVisible();
  await expect(page.getByRole("button", {name: "Hide timer"})).toBeHidden();
});

test("untimed: counts up and never ends the section", async ({page, problems}) => {
  void problems;
  await go(page, 7, {clock: true});
  await begin(page, "One passage");
  await expect(page.getByRole("timer")).toHaveText("Time used 0:00");
  await page.clock.fastForward(30 * 60 * 1000 + 5000);
  await expect(page.getByRole("timer")).toHaveText("Time used 30:05");
  await expect(page.getByRole("heading", {level: 2, name: /^Question 1 of/})).toBeVisible();
  await expect(page.getByRole("alert", {includeHidden: true})).toHaveText("");
});

test("directions reopen in a dialog; Escape and Close return focus", async ({page, problems}) => {
  void problems;
  await go(page, 8);
  await begin(page, "Mixed practice");
  var btn = page.getByRole("button", {name: "Directions"});
  await btn.click();
  var dlg = page.getByRole("dialog", {name: "Science test directions"});
  await expect(dlg).toBeVisible();
  await expect(dlg.getByRole("button", {name: "Close"})).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect(btn).toBeFocused();
  await btn.click();
  await dlg.getByRole("button", {name: "Close"}).click();
  await expect(btn).toBeFocused();
});

test("keyboard: start, answer, Next keeps focus, navigator is one Tab stop with arrow keys", async ({page, problems}) => {
  void problems;
  await go(page, 2);
  await expect(page.locator("body")).toBeFocused(); // nothing moves focus on first load
  var mode = page.getByRole("button", {name: /^Mixed practice/});
  for (var i = 0; i < 10 && !(await mode.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", {name: "Back", exact: true})).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", {name: "Start the section"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", {level: 2, name: /^Question 1 of/})).toBeFocused();
  await page.keyboard.press("Tab"); // Flag for review
  await page.keyboard.press("Tab"); // first choice
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await next(page).focus();
  await page.keyboard.press("Enter");
  await expect(next(page)).toBeFocused();
  await expect(page.getByText("Question 2 of", {exact: false}).first()).toBeAttached();
  await expect(navButton(page, 1)).toHaveAccessibleName("Question 1, answered");
  // One Tab stop in the navigator: Shift+Tab from Next lands on the current question's number.
  await page.keyboard.press("Shift+Tab");
  await expect(navButton(page, 2)).toBeFocused();
  await expect(navButton(page, 2)).toHaveAttribute("aria-current", "step");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(navButton(page, 4)).toBeFocused();
  await page.keyboard.press("End");
  var total = (await nav(page).getByRole("button").count());
  await expect(navButton(page, total)).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", {level: 2, name: /^Question 3 of/})).toBeFocused();
  expect(await nav(page).getByRole("button").evaluateAll((bs) => bs.filter((b) => b.tabIndex === 0).length)).toBe(1);
});

for (var scheme of ["light", "dark"]) {
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    (function (scheme, w, h) {
      test("axe-core, " + scheme + " mode at " + w + "x" + h, async ({page, problems}) => {
        void problems;
        await page.emulateMedia({colorScheme: scheme});
        await page.setViewportSize({width: w, height: h});
        await go(page, 9, {clock: true});
        await audit(page, "intro");
        await page.getByRole("button", {name: /^Mixed practice/}).click();
        await audit(page, "directions");
        await page.getByRole("button", {name: "Start the section"}).click();
        await page.locator("fieldset label").first().click();
        await page.getByRole("button", {name: "Flag for review"}).click();
        await audit(page, "question");
        var total = (await current(page)).total;
        await page.clock.fastForward((total - 5) * 60 * 1000 + 1000);
        await expect(page.getByRole("alert", {includeHidden: true})).toContainText("5 minutes left.");
        await audit(page, "five minute notice");
        await page.getByRole("button", {name: "Directions"}).click();
        await audit(page, "directions dialog");
        await page.getByRole("button", {name: "Close"}).click();
        await navButton(page, total).click();
        await reviewBtn(page).click();
        await page.getByRole("button", {name: "End section"}).click();
        await audit(page, "review and confirm");
        await page.getByRole("button", {name: "Yes, end the section"}).click();
        await audit(page, "score report");
      });
    })(scheme, w, h);
  }
}

test("layout: no sideways scrolling, 44 px bottom bar targets, bar on screen, passage pane scrolls on its own", async ({page, problems}) => {
  void problems;
  async function check(label) {
    var r = await page.evaluate(() => {
      var bar = document.querySelector("nav:not([hidden])");
      var small = bar ? [].filter.call(bar.querySelectorAll("button"), (b) => b.getClientRects().length && (b.getBoundingClientRect().width < 44 || b.getBoundingClientRect().height < 44)).map((b) => b.textContent) : [];
      return {over: document.documentElement.scrollWidth - document.documentElement.clientWidth, small: small,
        barBottom: bar ? Math.round(bar.getBoundingClientRect().bottom) : null, vh: window.innerHeight};
    });
    expect(r.over, label + " sideways scroll").toBeLessThanOrEqual(0);
    expect(r.small, label + " small targets").toEqual([]);
    if (r.barBottom !== null) expect(r.barBottom, label + " bar at the bottom").toBe(r.vh);
  }
  for (var [w, h] of [[320, 568], [360, 640], [400, 700], [768, 1024], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, 4);
    await check(w + " intro");
    await page.getByRole("button", {name: /^Mixed practice/}).click();
    await check(w + " directions");
    await page.getByRole("button", {name: "Start the section"}).click();
    await check(w + " question 1");
    var total = (await current(page)).total;
    await navButton(page, total).click();
    await check(w + " last question");
    if (w >= 1280) {
      // Wide screens: the page itself does not scroll to reach the question; the passage pane scrolls instead.
      var pane = await page.getByRole("article").evaluate((a) => ({scrolls: a.scrollHeight > a.clientHeight, overflow: getComputedStyle(a).overflowY}));
      expect(pane.overflow).toBe("auto");
    }
    await reviewBtn(page).click();
    await check(w + " review");
    await page.getByRole("button", {name: "End section"}).click();
    await page.getByRole("button", {name: "Yes, end the section"}).click();
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
  await begin(page, "Mixed practice");
  await page.locator("fieldset label").first().click();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
});
