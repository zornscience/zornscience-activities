// ACT Practice (act/), Science section: the section shell (directions, one question at a time, Previous and Next across
// passages, the numbered navigator, flags, the review screen and ending the section), the countdown and count-up
// timers with page.clock, the score report, keyboard, layout, axe-core in light and dark mode, embed mode and network.
// Selects by role, tag and text only, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var {loadData} = require("../support/load-data");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var data = loadData(path.join(__dirname, "..", "..", "act", "bank-science.js"));
var words = loadData(path.join(__dirname, "..", "..", "act", "data.js"));
data.skills = words.sections.science.skills;
data.types = words.sections.science.types;
var byTitle = {};
data.passages.forEach((p) => { byTitle[p.title] = p; });
var plain = (s) => s.replace(/<\/?(sub|sup|em|strong)>/g, "");

async function go(page, seed, opts) {
  if (opts && opts.clock) await page.clock.install();
  if (seed !== undefined) await page.addInitScript(seedRandom, seed);
  // A new load each time: going to the same address with only a #section would not reload the page.
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto("/act/" + ((opts && opts.query) || "") + "#science");
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
  await expect(page.getByText(/A 1, the middle of your range,/)).toBeVisible();
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

// ---------- Tools (milestone 3) ----------
function tool(page, name) { return page.getByRole("group", {name: "Tools"}).getByRole("button", {name: name, exact: true}); }
async function selectText(page, locator, from, to) {
  // Select characters [from, to) of the element's first text node, as a keyboard or caret-browsing user would.
  await locator.evaluate((el, r) => {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var t = walker.nextNode();
    var range = document.createRange();
    range.setStart(t, r[0]);
    range.setEnd(t, Math.min(r[1], t.nodeValue.length));
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [from, to]);
}
function marks(page) { return page.locator("main mark"); }
async function bg(loc) { return loc.evaluate((m) => getComputedStyle(m).backgroundColor); }

test("highlighter: colors, keyboard and mouse, erase, clear, never on figures, kept across questions", async ({page, problems}) => {
  void problems;
  await go(page, 21);
  await begin(page, "Mixed practice");
  await expect(page.getByRole("button", {name: "Highlight selection"})).toBeHidden();
  await tool(page, "Highlighter").click();
  await expect(tool(page, "Highlighter")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", {name: "Yellow"})).toHaveAttribute("aria-pressed", "true");
  // Keyboard path: a selection, then Highlight selection.
  var firstP = page.getByRole("article").locator("p").nth(1);
  await selectText(page, firstP, 0, 12);
  await page.getByRole("button", {name: "Highlight selection"}).click();
  await expect(marks(page)).toHaveCount(1);
  var first = (await firstP.textContent()).slice(0, 12);
  await expect(marks(page).first()).toHaveText(first);
  await expect(page.locator("#zsa-act-live")).toHaveText("Highlighted.");
  var yellow = await bg(marks(page).first());
  // Mouse path on a choice: the highlight is made and the answer under it is not picked.
  await page.getByRole("button", {name: "Green"}).click();
  var choice = page.locator("fieldset label").nth(2);
  var box = await choice.boundingBox();
  await page.mouse.move(box.x + 60, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + box.height / 2, {steps: 4});
  await page.mouse.up();
  await expect(marks(page)).toHaveCount(2);
  await expect(page.getByRole("radio", {checked: true})).toHaveCount(0);
  expect(await bg(marks(page).nth(1))).not.toBe(yellow);
  // Whole passage selected: text is marked, figures and tables are not.
  await page.getByRole("article").evaluate((a) => { var r = document.createRange(); r.selectNodeContents(a); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.getByRole("button", {name: "Highlight selection"}).click();
  expect(await page.getByRole("article").locator("figure mark, table mark, svg mark").count()).toBe(0);
  expect(await page.getByRole("article").locator("mark").count()).toBeGreaterThan(2);
  // Kept across Next, Previous and the review screen.
  var before = await marks(page).count();
  await next(page).click();
  await prev(page).click();
  await expect(marks(page)).toHaveCount(before);
  var total = (await current(page)).total;
  await navButton(page, total).click();
  await reviewBtn(page).click();
  await page.getByRole("button", {name: "Return to questions"}).click();
  await navButton(page, 1).click();
  await expect(marks(page)).toHaveCount(before);
  // Erase: clicking a highlight removes it (and does not pick an answer).
  await page.getByRole("button", {name: "Erase"}).click();
  await expect(page.getByRole("button", {name: "Erase"})).toHaveAttribute("aria-pressed", "true");
  await page.locator("fieldset mark").first().click();
  await expect(page.locator("fieldset mark")).toHaveCount(0);
  await expect(page.getByRole("radio", {checked: true})).toHaveCount(0);
  // Clear removes the rest on this question and its passage.
  await page.getByRole("button", {name: "Clear"}).click();
  await expect(marks(page)).toHaveCount(0);
  // Turning the highlighter off: dragging over a choice no longer highlights.
  await tool(page, "Highlighter").click();
  await selectText(page, page.getByRole("article").locator("p").nth(1), 0, 8);
  await page.mouse.click(5, 300);
  await expect(marks(page)).toHaveCount(0);
});

test("answer eliminator and masking: toggles, still selectable, kept across questions", async ({page, problems}) => {
  void problems;
  await go(page, 22);
  await begin(page, "Mixed practice");
  await expect(page.getByRole("button", {name: "Eliminate choice B"})).toBeHidden();
  await expect(page.getByRole("button", {name: "Hide choice D"})).toBeHidden();
  await tool(page, "Eliminator").click();
  var x = page.getByRole("button", {name: "Eliminate choice B"});
  await x.click();
  await expect(x).toHaveAttribute("aria-pressed", "true");
  var radioB = page.getByRole("radio").nth(1);
  await expect(radioB).toHaveAccessibleName(/^B\. .* \(eliminated\)$/);
  await page.locator("fieldset label").nth(1).click();
  await expect(radioB).toBeChecked();
  await tool(page, "Eliminator").click();
  await expect(x).toBeHidden();
  await expect(radioB).toHaveAccessibleName(/\(eliminated\)$/);
  await tool(page, "Masking").click();
  var hide = page.getByRole("button", {name: "Hide choice D"});
  await hide.click();
  await expect(hide).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("radio").nth(3)).toHaveAccessibleName("D. Choice hidden");
  await tool(page, "Masking").click();
  await expect(hide).toBeVisible(); // a hidden choice can always be shown again
  await next(page).click();
  await expect(page.getByRole("button", {name: "Hide choice J"})).toBeHidden();
  await prev(page).click();
  await expect(page.getByRole("radio").nth(3)).toHaveAccessibleName("D. Choice hidden");
  await expect(radioB).toHaveAccessibleName(/\(eliminated\)$/);
  await expect(radioB).toBeChecked();
  await hide.click();
  await expect(page.getByRole("radio").nth(3)).not.toHaveAccessibleName("D. Choice hidden");
  // Eliminating again from the keyboard restores the choice.
  await tool(page, "Eliminator").click();
  await x.focus();
  await page.keyboard.press("Enter");
  await expect(x).toHaveAttribute("aria-pressed", "false");
  await expect(radioB).not.toHaveAccessibleName(/\(eliminated\)$/);
});

test("line reader: toggles, keyboard moves and resizes, drags with the mouse, stays on across questions", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 1366, height: 657});
  await go(page, 23);
  await begin(page, "Mixed practice");
  var reader = page.getByRole("slider", {name: /^Line reader/});
  await expect(reader).toHaveCount(0);
  await tool(page, "Line reader").click();
  await expect(reader).toBeFocused();
  var now = async () => Number(await reader.getAttribute("aria-valuenow"));
  var max = async () => Number(await reader.getAttribute("aria-valuemax"));
  var y0 = await now();
  await page.keyboard.press("ArrowDown");
  expect(await now()).toBe(y0 + 26);
  var max0 = await max();
  await page.keyboard.press("Shift+ArrowDown");
  expect(await max()).toBe(max0 - 26); // taller band, less room to move
  await expect(reader).toHaveAttribute("aria-valuetext", /^Showing \d+% to \d+% of the passage area$/);
  await page.keyboard.press("End");
  expect(await now()).toBe(await max());
  await page.keyboard.press("Home");
  expect(await now()).toBe(0);
  // Drag the grip down with the mouse.
  var grip = await reader.locator("rect").nth(1).boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2 + 100, {steps: 5});
  await page.mouse.up();
  expect(await now()).toBeGreaterThan(90);
  var kept = await now();
  await next(page).click();
  await expect(reader).toBeVisible();
  expect(await now()).toBe(kept);
  // The passage still scrolls under the band.
  await page.getByRole("article").hover();
  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.getByRole("article").evaluate((a) => a.scrollTop)).toBeGreaterThan(0);
  await tool(page, "Line reader").click();
  await expect(reader).toHaveCount(0);
});

test("zoom: 100 to 200 percent on the passage and its figures, announced, kept across passages", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 1366, height: 657});
  await go(page, 24);
  await begin(page, "Mixed practice");
  var zin = page.getByRole("button", {name: "Zoom in"}), zout = page.getByRole("button", {name: "Zoom out"});
  await expect(zout).toBeDisabled();
  var size = () => page.getByRole("article").evaluate((a) => parseFloat(getComputedStyle(a).fontSize));
  var figWidth = () => page.getByRole("article").evaluate((a) => { var f = a.querySelector("figure"); return f ? f.getBoundingClientRect().width : 0; });
  var s0 = await size(), f0 = await figWidth();
  await zin.click();
  await expect(page.locator("#zsa-act-live")).toHaveText("Passage zoom 125%");
  expect(await size()).toBeCloseTo(s0 * 1.25, 0);
  if (f0) expect(await figWidth()).toBeGreaterThan(f0 * 1.2);
  await zin.click();
  await zin.click();
  await expect(page.locator("#zsa-act-live")).toHaveText("Passage zoom 200%");
  await expect(zin).toBeDisabled();
  expect(await size()).toBeCloseTo(s0 * 2, 0);
  var total = (await current(page)).total;
  await navButton(page, total).click();
  expect(await size()).toBeCloseTo(s0 * 2, 0);
  await zout.click();
  expect(await size()).toBeCloseTo(s0 * 1.5, 0);
});

for (var [tw, th] of [[1366, 657], [390, 664]]) {
  (function (w, h) {
    test("tools: axe-core with every tool on, light and dark, and no sideways scroll at " + w + "x" + h, async ({page, problems}) => {
      void problems;
      await page.setViewportSize({width: w, height: h});
      await go(page, 25);
      await begin(page, "Mixed practice");
      await tool(page, "Highlighter").click();
      await selectText(page, page.getByRole("article").locator("p").nth(1), 0, 15);
      await page.getByRole("button", {name: "Highlight selection"}).click();
      await tool(page, "Line reader").click();
      await tool(page, "Eliminator").click();
      await tool(page, "Masking").click();
      await page.getByRole("button", {name: "Eliminate choice A"}).click();
      await page.getByRole("button", {name: "Hide choice C"}).click();
      for (var k = 0; k < 3; k++) await page.getByRole("button", {name: "Zoom in"}).click();
      for (var scheme of ["light", "dark"]) {
        await page.emulateMedia({colorScheme: scheme});
        await audit(page, "all tools " + scheme);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      var small = await page.getByRole("group", {name: "Tools"}).locator("button").evaluateAll((bs) => bs.filter((b) => b.getClientRects().length && (b.getBoundingClientRect().width < 44 || b.getBoundingClientRect().height < 44)).map((b) => b.textContent));
      expect(small).toEqual([]);
    });
  })(tw, th);
}

// ---------- Score report and answer view (milestone 4) ----------
test("answer view: each question opens read-only beside its passage, with highlights kept, and returns to the report", async ({page, problems}) => {
  void problems;
  await go(page, 31);
  await begin(page, "One passage");
  var c = await current(page);
  var p = c.p, n = p.questions.length;
  // Highlight something in the passage, answer question 1 wrong and question 2 right, leave the rest blank.
  await tool(page, "Highlighter").click();
  await selectText(page, page.getByRole("article").locator("p").nth(1), 0, 10);
  await page.getByRole("button", {name: "Highlight selection"}).click();
  await page.locator("fieldset label").nth((p.questions[0].answer + 1) % 4).click();
  await next(page).click();
  await page.locator("fieldset label").nth(p.questions[1].answer).click();
  await navButton(page, n).click();
  await endSection(page);
  await expect(page.getByRole("button", {name: /^Show with passage \(question \d+\)$/})).toHaveCount(n);
  await page.getByRole("button", {name: "Show with passage (question 1)"}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 1 of " + n})).toBeFocused();
  await expect(page.getByRole("article").getByRole("heading", {level: 1})).toHaveText(p.title);
  await expect(page.getByRole("article").locator("mark")).toHaveCount(1);
  // Read-only: no radio buttons, no tools, no timer; the student's answer and the key are marked.
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByRole("group", {name: "Tools"})).toBeHidden();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.getByText("Missed", {exact: true})).toBeVisible();
  var items = page.getByRole("list", {name: "Answer choices"}).getByRole("listitem");
  await expect(items).toHaveCount(4);
  await expect(items.nth((p.questions[0].answer + 1) % 4)).toContainText("Your answer");
  await expect(items.nth(p.questions[0].answer)).toContainText("Correct answer");
  await expect(page.getByRole("heading", {name: "Explanation"})).toBeVisible();
  await expect(page.getByText(plain(p.questions[0].explanation))).toBeVisible();
  // The navigator shows results instead of answered and flagged.
  await expect(navButton(page, 1)).toHaveAccessibleName("Question 1, missed");
  await expect(navButton(page, 2)).toHaveAccessibleName("Question 2, correct");
  await expect(navButton(page, 3)).toHaveAccessibleName("Question 3, not answered");
  await next(page).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 2 of " + n})).toBeVisible();
  await expect(items.nth(p.questions[1].answer)).toContainText("Your answer · Correct answer");
  await navButton(page, 3).click();
  await expect(page.getByText("No answer.")).toBeVisible();
  // Back to the report: focus returns to that question's button.
  await page.getByRole("button", {name: "Back to score report"}).click();
  await expect(page.getByRole("button", {name: "Show with passage (question 3)"})).toBeFocused();
  await expect(nav(page)).toBeHidden();
  // Next on the last question also returns to the report.
  await page.getByRole("button", {name: "Show with passage (question " + n + ")"}).click();
  await page.getByRole("button", {name: "Score report", exact: true}).click();
  await expect(page.getByRole("button", {name: "Show with passage (question " + n + ")"})).toBeFocused();
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeVisible();
});

for (var [aw, ah] of [[1366, 657], [390, 664]]) {
  (function (w, h) {
    test("answer view: axe-core in light and dark mode at " + w + "x" + h, async ({page, problems}) => {
      void problems;
      await page.setViewportSize({width: w, height: h});
      await go(page, 32);
      await begin(page, "Mixed practice");
      await page.locator("fieldset label").first().click();
      var total = (await current(page)).total;
      await navButton(page, total).click();
      await endSection(page);
      await page.getByRole("button", {name: "Show with passage (question 1)"}).click();
      for (var scheme of ["light", "dark"]) {
        await page.emulateMedia({colorScheme: scheme});
        await audit(page, "answer view " + scheme);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  })(aw, ah);
}

// A bank file's source for a bank object, served in place of the real file.
function bankScript(bank) {
  return "(function () {\n  \"use strict\";\n  var root = document.querySelector('[data-zsa-activity=\"act\"]');\n  if (!root) return;\n  var bank = " + JSON.stringify(bank) +
    ";\n  root.addEventListener(\"zsa:request-bank\", function (event) { event.detail.receive(bank); }, {once: true});\n}());\n";
}
// Serves a changed copy of the Science bank in place of bank-science.js. change(bank) edits the parsed copy.
async function serveBank(page, change) {
  var bank = JSON.parse(JSON.stringify({section: "science", passages: data.passages}));
  change(bank);
  await page.route("**/act/bank-science.js*", (route) => route.fulfill({status: 200, contentType: "text/javascript", body: bankScript(bank)}));
  return bank;
}

// ---------- Full section, enabled by the reviewed bank (milestone 6) ----------
test("full section is hidden when the reviewed bank cannot make one", async ({page, problems}) => {
  void problems;
  // One passage back in draft: only 6 reviewed.
  await serveBank(page, (b) => { b.passages[0].status = "draft"; });
  await go(page, 51);
  await expect(page.getByRole("button", {name: /^Mixed practice/})).toBeVisible();
  await expect(page.getByRole("button", {name: /^Full section/})).toHaveCount(0);
  // All reviewed, but one question removed: 39 questions, never exactly 40.
  await page.unroute("**/act/bank-science.js*");
  await serveBank(page, (b) => { b.passages.find((p) => p.type === "Conflicting Viewpoints").questions.pop(); });
  await go(page, 52);
  await expect(page.getByRole("button", {name: /^Mixed practice/})).toBeVisible();
  await expect(page.getByRole("button", {name: /^Full section/})).toHaveCount(0);
});

test("full section, real bank: 40 questions in 40 minutes, every passage once, all correct scores 36", async ({page, problems}) => {
  void problems;
  await go(page, 52, {clock: true});
  await expect(page.getByRole("button", {name: /^Full section/})).toContainText("40 questions in 40 minutes");
  await page.getByRole("button", {name: /^Full section/}).click();
  await expect(page.getByText("This section has 7 passages and 40 questions.")).toBeVisible();
  await expect(page.getByText(/You have 40 minutes\./)).toBeVisible();
  await page.getByRole("button", {name: "Start the section"}).click();
  await expect(page.getByRole("timer")).toHaveText("Time left 40:00");
  await expect(nav(page).getByRole("button")).toHaveCount(40);
  var seen = await playAll(page, (q) => q.answer);
  // Students get reviewed passages only; the second section's drafts never appear.
  expect(seen.map((p) => p.title).sort()).toEqual(data.passages.filter((p) => p.status === "reviewed").map((p) => p.title).sort());
  await endSection(page);
  await expect(page.getByText("40 / 40", {exact: true})).toBeVisible();
  await expect(page.getByRole("heading", {name: "Estimated ACT Science score: 36"})).toBeVisible();
  await expect(page.getByText(/A 36 is about the 100th percentile/)).toBeVisible();
  await expect(page.getByRole("listitem").filter({hasText: /^Correct ·/})).toHaveCount(40);
  // Every skill appears in the breakdown.
  for (var k of Object.keys(data.skills)) await expect(page.getByText(data.skills[k].name, {exact: true}).first()).toBeVisible();
});

test("full section, half right: 20 of 40 is an estimated 19, the 54th percentile (2026-2027 ranks)", async ({page, problems}) => {
  void problems;
  await go(page, 53);
  await begin(page, "Full section");
  var count = 0;
  await playAll(page, (q) => { count += 1; return count <= 20 ? q.answer : (q.answer + 1) % 4; });
  await endSection(page);
  await expect(page.getByText("20 / 40", {exact: true})).toBeVisible();
  await expect(page.getByText("50% correct")).toBeVisible();
  await expect(page.getByRole("heading", {name: "Estimated ACT Science score: 19"})).toBeVisible();
  await expect(page.getByText(/That is below the national average of 19\.6\. A 19 is about the 54th percentile/)).toBeVisible();
  await expect(page.getByText(/ACT's college readiness benchmark is 23\./)).toBeVisible();
});

test("full section: warns at 5 minutes and ends cleanly at 40:00 with blanks counted", async ({page, problems}) => {
  void problems;
  await go(page, 54, {clock: true});
  await begin(page, "Full section");
  for (var i = 0; i < 10; i++) {
    await page.locator("fieldset label").first().click();
    await next(page).click();
  }
  await page.clock.fastForward(35 * 60 * 1000 + 1000);
  await expect(page.getByRole("alert", {includeHidden: true})).toContainText("5 minutes left.");
  await page.clock.fastForward(5 * 60 * 1000);
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeVisible();
  await expect(page.getByText(/Time is up\./)).toBeVisible();
  await expect(page.getByText("Time 40:00, on ACT pace (40:00 for 40 questions).")).toBeVisible();
  await expect(page.getByRole("listitem").filter({hasText: /^Blank ·/})).toHaveCount(30);
  await expect(page.getByRole("heading", {name: /^Estimated ACT Science score: \d+$/})).toBeVisible();
});

for (var [fw, fh] of [[1366, 657], [390, 664], [320, 568]]) {
  (function (w, h) {
    test("full section layout and axe-core at " + w + "x" + h + ": 40-number navigator, review, report", async ({page, problems}) => {
      void problems;
      await page.setViewportSize({width: w, height: h});
      await go(page, 55);
      await begin(page, "Full section");
      async function noSideways(label) { expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), label).toBeLessThanOrEqual(0); }
      await noSideways("question 1");
      // The navigator scrolls inside the bar to keep the current number in view.
      await navButton(page, 40).click();
      await expect(navButton(page, 40)).toBeInViewport();
      await expect(page.getByRole("heading", {level: 2, name: "Question 40 of 40"})).toBeFocused();
      await noSideways("question 40");
      for (var scheme of ["light", "dark"]) {
        await page.emulateMedia({colorScheme: scheme});
        await audit(page, "full question 40 " + scheme);
      }
      await reviewBtn(page).click();
      await expect(page.getByText("0 answered, 40 not answered, 0 flagged, out of 40 questions.")).toBeVisible();
      await expect(page.getByRole("region", {name: "All questions"}).getByRole("button")).toHaveCount(40);
      await noSideways("review");
      await audit(page, "full review");
      await page.getByRole("button", {name: "End section"}).click();
      await page.getByRole("button", {name: "Yes, end the section"}).click();
      await noSideways("report");
      for (var s2 of ["light", "dark"]) {
        await page.emulateMedia({colorScheme: s2});
        await audit(page, "full report " + s2);
      }
    });
  })(fw, fh);
}

// ---------- Draft passages and the review list ----------
test("students never see a draft passage; ?drafts=1 lists every passage with its status", async ({page, problems}) => {
  void problems;
  var bank = await serveBank(page, (b) => { b.passages[1].status = "draft"; });
  var draft = bank.passages[1];
  await go(page, 41);
  await expect(page.getByRole("heading", {name: "Review drafts"})).toHaveCount(0);
  await expect(page.getByRole("button", {name: /^Full section/})).toHaveCount(0);
  for (var i = 0; i < 8; i++) {
    await page.getByRole("button", {name: /^One passage/}).click();
    await page.getByRole("button", {name: "Start the section"}).click();
    var title = await page.getByRole("article").getByRole("heading", {level: 1}).textContent();
    expect(title).not.toBe(draft.title);
    await navButton(page, (await current(page)).total).click();
    await reviewBtn(page).click();
    await page.getByRole("button", {name: "End section"}).click();
    await page.getByRole("button", {name: "Yes, end the section"}).click();
    await page.getByRole("button", {name: "Back to start"}).click();
  }
  await go(page, 42, {query: "?drafts=1"});
  var list = page.getByRole("region", {name: "Review drafts"});
  for (var p of bank.passages) {
    await expect(list.getByRole("button", {name: new RegExp("^" + p.title.replace(/[()]/g, "\\$&") + " " + p.type + " · " + p.questions.length + " questions · " + (p.status === "draft" ? "Draft" : "Reviewed") + "$")})).toBeVisible();
  }
  await audit(page, "review list");
  // A draft can be played from the list.
  await list.getByRole("button", {name: new RegExp("^" + draft.title)}).click();
  await page.getByRole("button", {name: "Start the section"}).click();
  await expect(page.getByRole("article").getByRole("heading", {level: 1})).toHaveText(draft.title);
});

for (var dp of data.passages) {
  (function (p) {
    test("every passage plays through all correct, with readable figures: " + p.title, async ({page, problems}) => {
      void problems;
      await go(page, 43, {query: "?drafts=1"});
      await page.getByRole("region", {name: "Review drafts"}).getByRole("button", {name: new RegExp("^" + p.title)}).click();
      await page.getByRole("button", {name: "Start the section"}).click();
      // Every graph has a screen reader data table with the same values.
      var graphs = p.body.filter((b) => /Chart|scatter/.test(b.kind));
      for (var g of graphs) await expect(page.getByRole("table", {name: "Data in " + g.caption, includeHidden: true})).toHaveCount(1);
      for (var scheme of ["light", "dark"]) {
        await page.emulateMedia({colorScheme: scheme});
        await audit(page, p.id + " " + scheme);
      }
      var seen = await playAll(page, (q) => q.answer);
      expect(seen.map((x) => x.title)).toEqual([p.title]);
      await endSection(page);
      var n = p.questions.length;
      await expect(page.getByText(n + " / " + n, {exact: true})).toBeVisible();
      await expect(page.getByText("100% correct")).toBeVisible();
    });
  })(dp);
}
