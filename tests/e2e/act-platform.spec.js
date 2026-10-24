// ACT Practice (act/): the home screen, the section start screens and the old ACT Science address; English
// (numbered underlined parts), Math (one question at a time, fractions, roots and figures) and Reading (numbered
// paragraphs) from their draft samples; and the full ACT (English, Math, the break, Reading and Science, then a
// composite) with full banks built from the samples. The Science section's own tests are in act.spec.js.
// Selects by role, tag and text only, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var {loadData} = require("../support/load-data");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DIR = path.join(__dirname, "..", "..", "act");
var words = loadData(path.join(DIR, "data.js"));
var cfg = loadData(path.join(DIR, "config.js"));
var bank = {};
["english", "math", "reading", "science"].forEach((k) => { bank[k] = loadData(path.join(DIR, "bank-" + k + ".js")); });
// The accessible name of rich text: tags dropped, a fraction read as "top over bottom" (with a part of more than
// one term in parentheses), a root as the √ sign.
function spoken(s) {
  var g = (x) => /^[\w.,]+$/.test(x) ? x : "( " + x + " )";
  return s.replace(/<frac>([\s\S]*?)<\/frac>/g, (m, f) => {
    var parts = f.replace(/<\/?\w+>/g, "").split("|");
    return " " + g(parts[0]) + " over " + g(parts[1]) + " ";
  }).replace(/<sqrt>/g, "√").replace(/<\/?\w+>/g, "").replace(/\s+/g, " ").trim();
}

async function go(page, hash, opts) {
  opts = opts || {};
  if (opts.clock) await page.clock.install();
  if (opts.seed !== undefined) await page.addInitScript(seedRandom, opts.seed);
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto("/act/" + (opts.query || "") + (hash ? "#" + hash : ""));
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
async function auditBoth(page, label) {
  for (var scheme of ["light", "dark"]) {
    // Reduced motion, so color transitions finish before axe-core checks contrast.
    await page.emulateMedia({colorScheme: scheme, reducedMotion: "reduce"});
    await audit(page, label + " " + scheme);
  }
  await page.emulateMedia({colorScheme: "light"});
}
async function noSideScroll(page, label) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), label).toBeLessThanOrEqual(0);
}
function next(page) { return page.getByRole("button", {name: "Next", exact: true}); }
function nav(page) { return page.getByRole("toolbar", {name: "Questions"}); }
async function startSection(page, name) {
  await expect(page.getByRole("heading", {level: 1, name: name + " test directions"})).toBeFocused();
  await page.getByRole("button", {name: "Start the section"}).click();
  await expect(page.getByRole("heading", {level: 2, name: /^Question 1 of \d+$/})).toBeFocused();
}
// Goes to the last question and ends the section from the review screen.
async function endNow(page) {
  await nav(page).getByRole("button").last().click();
  await page.getByRole("button", {name: "Review", exact: true}).click();
  await page.getByRole("button", {name: "End section"}).click();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
}
// Plays every question with Next, choosing pick(n) (an index, or null for blank).
async function playAll(page, total, pick) {
  for (var n = 1; n <= total; n++) {
    await expect(page.getByRole("heading", {level: 2, name: "Question " + n + " of " + total})).toBeVisible();
    var idx = pick(n);
    if (idx !== null) await page.locator("fieldset label").nth(idx).click();
    if (n < total) await next(page).click();
  }
  await page.getByRole("button", {name: "Review", exact: true}).click();
  await page.getByRole("button", {name: "End section"}).click();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
}
function bankScript(b) {
  return "(function () {\n  \"use strict\";\n  var root = document.querySelector('[data-zsa-activity=\"act\"]');\n  if (!root) return;\n  var bank = " + JSON.stringify(b) +
    ";\n  root.addEventListener(\"zsa:request-bank\", function (event) { event.detail.receive(bank); }, {once: true});\n}());\n";
}
async function serve(page, section, b) {
  await page.route("**/act/bank-" + section + ".js*", (route) => route.fulfill({status: 200, contentType: "text/javascript", body: bankScript(b)}));
}
function clone(x) { return JSON.parse(JSON.stringify(x)); }
// Full banks for the full ACT, built from the draft samples and marked reviewed.
function fullBanks() {
  var en = bank.english.passages[0], rd = bank.reading.passages[0];
  return {
    english: {section: "english", passages: [1, 2, 3, 4, 5].map((i) => Object.assign(clone(en), {id: "en-" + i, title: en.title + " " + i, status: "reviewed"}))},
    math: {section: "math", questions: Array.from({length: 45}, (x, i) => Object.assign(clone(bank.math.questions[i % bank.math.questions.length]), {id: "m-" + i, status: "reviewed"}))},
    reading: {section: "reading", passages: words.sections.reading.types.map((t, i) => Object.assign(clone(rd), {id: "rd-" + i, title: rd.title + " " + (i + 1), type: t, status: "reviewed"}))}
  };
}

// ---------- Home and section start screens ----------
test("home: full ACT waits for full banks, four sections open their start screens and back", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page).toHaveTitle("ACT Practice | ZornScience");
  await expect(page.getByRole("heading", {level: 1, name: "ACT Practice"})).toBeVisible();
  var full = page.getByRole("region", {name: "Full ACT"});
  await expect(full.getByText(/opens when every section has a full set of reviewed questions/)).toBeVisible();
  await expect(full.getByRole("button")).toHaveCount(0);
  var expected = {English: "50 questions in 35 minutes", Math: "45 questions in 50 minutes", Reading: "36 questions in 40 minutes", Science: "40 questions in 40 minutes (optional)"};
  for (var name of Object.keys(expected)) {
    await expect(page.getByRole("button", {name: name + " " + expected[name], exact: true})).toBeVisible();
  }
  for (var key of ["english", "math", "reading", "science"]) {
    var s = words.sections[key];
    await page.getByRole("button", {name: new RegExp("^" + s.name + " ")}).click();
    await expect(page.getByRole("heading", {level: 1, name: s.ui.title})).toBeFocused();
    expect(new URL(page.url()).hash).toBe("#" + key);
    await expect(page.getByRole("heading", {level: 2, name: "The ACT " + s.name + " test"})).toBeVisible();
    // English, Math and Reading have only drafts so far, so students see a note instead of modes.
    if (key === "science") await expect(page.getByRole("button", {name: /^Full section/})).toBeVisible();
    else {
      await expect(page.getByText("Questions for this section are being written and reviewed. Check back soon.")).toBeVisible();
      await expect(page.getByRole("button", {name: /^(One passage|Practice questions|Mixed practice)/})).toHaveCount(0);
    }
    await page.getByRole("button", {name: "All sections"}).click();
    await expect(page.getByRole("heading", {level: 1, name: "ACT Practice"})).toBeFocused();
    expect(new URL(page.url()).hash).toBe("");
  }
});

test("a #section address opens that section, and the old ACT Science address redirects to it", async ({page, problems}) => {
  void problems;
  await go(page, "reading");
  await expect(page.getByRole("heading", {level: 1, name: "ACT Reading Practice"})).toBeVisible();
  await page.goto("/act-science/");
  await page.waitForURL("**/act/#science");
  await expect(page.getByRole("heading", {level: 1, name: "ACT Science Practice"})).toBeVisible();
});

for (var [hw, hh] of [[1366, 657], [390, 664], [320, 568]]) {
  (function (w, h) {
    test("home and section screens: axe-core and no sideways scroll at " + w + "x" + h, async ({page, problems}) => {
      void problems;
      await page.setViewportSize({width: w, height: h});
      await go(page, null, {query: "?drafts=1"});
      await noSideScroll(page, "home");
      await auditBoth(page, "home");
      for (var key of ["english", "math", "reading"]) {
        await go(page, key, {query: "?drafts=1"});
        await noSideScroll(page, key);
        await auditBoth(page, key + " start");
      }
    });
  })(hw, hh);
}

// ---------- English ----------
test("English: numbered underlined parts follow the question, NO CHANGE first, all correct scores 10 / 10", async ({page, problems}) => {
  void problems;
  var p = bank.english.passages[0];
  await go(page, "english", {query: "?drafts=1", seed: 3});
  var list = page.getByRole("region", {name: "Review drafts"});
  await expect(list.getByRole("button", {name: p.title + " Informative · 10 questions · Draft", exact: true})).toBeVisible();
  await list.getByRole("button", {name: new RegExp("^" + p.title)}).click();
  await startSection(page, "English");
  var art = page.getByRole("article");
  // Every underlined part and boxed spot carries its question number, read as "Question n".
  var underlined = art.locator("u");
  await expect(underlined).toHaveCount(8);
  await expect(art.getByText("Question 1", {exact: true})).toHaveCount(1);
  await expect(underlined.first()).toHaveText("lends seeds, it");
  for (var n = 1; n <= 10; n++) {
    var q = p.questions[n - 1];
    var stem = q.stem || "Choose the best version of underlined part " + n + ". If the original is best, choose NO CHANGE.";
    await expect(page.getByRole("group", {name: stem})).toBeVisible();
    var letters = n % 2 ? ["A", "B", "C", "D"] : ["F", "G", "H", "J"];
    for (var k = 0; k < 4; k++) await expect(page.getByRole("radio").nth(k)).toHaveAccessibleName(letters[k] + ". " + spoken(q.choices[k]));
    // The current part is marked in the passage, and only that one.
    var marked = art.locator(".zsa-act-u--current");
    var hasMark = new RegExp("<u" + n + ">|<b" + n + "/>").test(p.body.map((b) => b.html).join(""));
    await expect(marked).toHaveCount(hasMark ? 1 : 0);
    if (hasMark) await expect(marked).toBeInViewport();
    await page.locator("fieldset label").nth(q.answer).click();
    if (n < 10) await next(page).click();
  }
  await page.getByRole("button", {name: "Review", exact: true}).click();
  await page.getByRole("button", {name: "End section"}).click();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
  await expect(page.getByText("10 / 10", {exact: true})).toBeVisible();
  await expect(page.getByRole("heading", {name: "How this compares"})).toBeVisible();
  // The answer review quotes each underlined part as written.
  await expect(page.getByText("Underlined part: lends seeds, it")).toBeVisible();
  for (var sk of new Set(p.questions.map((x) => x.skill))) await expect(page.getByText(words.sections.english.skills[sk].name, {exact: true}).first()).toBeVisible();
  await auditBoth(page, "english report");
  await page.getByRole("button", {name: "Show with passage (question 2)"}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 2 of 10"})).toBeFocused();
  await expect(art.locator(".zsa-act-u--current")).toHaveText(/are labeled/);
  await auditBoth(page, "english answer view");
});

// Every English passage: its numbered parts match its questions, every choice reads with its letter, axe-core finds
// nothing in light or dark mode, and all correct scores 10 / 10.
for (var ep of bank.english.passages) {
  (function (p) {
    test("every English passage plays through all correct: " + p.title, async ({page, problems}) => {
      void problems;
      await go(page, "english", {query: "?drafts=1"});
      await page.getByRole("region", {name: "Review drafts"}).getByRole("button", {name: new RegExp("^" + p.title + " " + p.type)}).click();
      await startSection(page, "English");
      var text = p.body.map((b) => b.html || "").join(" ");
      var art = page.getByRole("article");
      await expect(art.locator("u")).toHaveCount((text.match(/<u\d+>/g) || []).length);
      for (var n = 1; n <= 10; n++) {
        var q = p.questions[n - 1];
        await expect(page.getByRole("group", {name: q.stem || "Choose the best version of underlined part " + n + ". If the original is best, choose NO CHANGE."})).toBeVisible();
        var letters = n % 2 ? ["A", "B", "C", "D"] : ["F", "G", "H", "J"];
        for (var k = 0; k < 4; k++) await expect(page.getByRole("radio").nth(k)).toHaveAccessibleName(letters[k] + ". " + spoken(q.choices[k]));
        var under = text.match(new RegExp("<u" + n + ">([^<]*)</u" + n + ">"));
        if (under) await expect(art.locator(".zsa-act-u--current u")).toHaveText(under[1]);
        if (n === 1) await auditBoth(page, p.id);
        await page.locator("fieldset label").nth(q.answer).click();
        if (n < 10) await next(page).click();
      }
      await page.getByRole("button", {name: "Review", exact: true}).click();
      await page.getByRole("button", {name: "End section"}).click();
      await page.getByRole("button", {name: "Yes, end the section"}).click();
      await expect(page.getByText("10 / 10", {exact: true})).toBeVisible();
      await expect(page.getByText("100% correct")).toBeVisible();
    });
  })(ep);
}

test("English with the drafts: mixed practice is 2 passages in 14 minutes, the full section 5 passages in 35 minutes", async ({page, problems}) => {
  void problems;
  await go(page, "english", {query: "?drafts=1", clock: true});
  await expect(page.getByRole("button", {name: /^Mixed practice 2 passages timed at ACT pace \(14 minutes\)/})).toBeVisible();
  await page.getByRole("button", {name: /^Full section/}).click();
  await expect(page.getByText("This section has 5 passages and 50 questions.", {exact: false})).toBeVisible();
  await startSection(page, "English");
  await expect(page.getByRole("timer")).toHaveText("Time left 35:00");
  await expect(nav(page).getByRole("button")).toHaveCount(50);
  // Question 50 is the last question of the fifth passage, and its numbered part is numbered 50 in the passage.
  await nav(page).getByRole("button", {name: /^Question 41,/}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 41 of 50"})).toBeFocused();
  await expect(page.getByRole("article").getByText("Question 41", {exact: true}).first()).toBeVisible();
  for (var [w, h] of [[1366, 657], [390, 664], [320, 568]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "english full " + w);
  }
});

// ---------- Math ----------
test("Math: one question at a time with no passage or line reader; fractions, roots and figures read well", async ({page, problems}) => {
  void problems;
  var qs = bank.math.questions;
  await go(page, "math", {query: "?drafts=1", seed: 5});
  await page.getByRole("button", {name: /^Practice questions/}).click();
  await startSection(page, "Math");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("group", {name: "Tools"}).getByRole("button", {name: "Line reader"})).toHaveCount(0);
  // 10 questions from the bank, each once, easier ones first.
  var seen = [], total = 10;
  for (var n = 1; n <= total; n++) {
    var stemText = await page.locator("legend").textContent();
    var q = qs.find((x) => spoken(x.stem) === stemText.replace(/\s+/g, " ").trim());
    expect(q, "known question: " + stemText).toBeTruthy();
    seen.push(q);
    for (var k = 0; k < 4; k++) await expect(page.getByRole("radio").nth(k)).toHaveAccessibleName((n % 2 ? "ABCD" : "FGHJ")[k] + ". " + spoken(q.choices[k]));
    if (q.figure) await expect(page.getByRole("img", {name: q.figure.label})).toBeVisible();
    await page.locator("fieldset label").nth(q.answer).click();
    if (n < total) await next(page).click();
  }
  seen.forEach((q, i) => { if (i) expect(q.difficulty).toBeGreaterThanOrEqual(seen[i - 1].difficulty); });
  expect(new Set(seen.map((q) => q.id)).size).toBe(total);
  await page.getByRole("button", {name: "Review", exact: true}).click();
  await expect(page.getByRole("heading", {level: 3})).toHaveCount(0);
  await page.getByRole("button", {name: "End section"}).click();
  await page.getByRole("button", {name: "Yes, end the section"}).click();
  await expect(page.getByText(total + " / " + total, {exact: true})).toBeVisible();
  await auditBoth(page, "math report");
  await page.getByRole("button", {name: "Show question (question 1)"}).click();
  await expect(page.getByRole("heading", {level: 2, name: "Question 1 of " + total})).toBeFocused();
  await expect(page.getByRole("article")).toHaveCount(0);
  await auditBoth(page, "math answer view");
});

test("Math: the fraction question is read aloud as fractions, and zoom enlarges the whole question", async ({page, problems}) => {
  void problems;
  await go(page, "math", {query: "?drafts=1"});
  await page.getByRole("region", {name: "Review drafts"}).getByRole("button", {name: /^Which of the following expressions is equivalent to x\/2/}).click();
  await startSection(page, "Math");
  await expect(page.getByRole("group", {name: "Which of the following expressions is equivalent to x over 2 + x over 3 ?"})).toBeVisible();
  await expect(page.getByRole("radio").nth(3)).toHaveAccessibleName("D. 5x over 6");
  var before = await page.locator("legend").boundingBox();
  await page.getByRole("button", {name: "Zoom in"}).click();
  await page.getByRole("button", {name: "Zoom in"}).click();
  await expect(page.locator("#zsa-act-live")).toHaveText("Question zoom 150%");
  var after = await page.locator("legend").boundingBox();
  expect(after.height).toBeGreaterThan(before.height * 1.3);
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "math zoom " + w);
    await auditBoth(page, "math question " + w);
  }
});

// Every Math question, started on its own from the drafts list: its stem and choices read correctly (fractions as
// "over"), its figure is there, and the marked answer scores 1 / 1. axe-core checks every question with a figure.
test("every Math question plays from the drafts list, reads well, and its marked answer is scored correct", async ({page, problems}) => {
  test.setTimeout(300000);
  void problems;
  var qs = bank.math.questions;
  for (var i = 0; i < qs.length; i++) {
    var q = qs[i];
    await go(page, "math", {query: "?drafts=1"});
    await page.getByRole("region", {name: "Review drafts"}).getByRole("button").nth(i).click();
    await startSection(page, "Math");
    await expect(page.getByRole("group", {name: spoken(q.stem)}), q.id).toBeVisible();
    for (var k = 0; k < 4; k++) await expect(page.getByRole("radio").nth(k), q.id).toHaveAccessibleName("ABCD"[k] + ". " + spoken(q.choices[k]));
    if (q.figure && q.figure.kind === "diagram") await expect(page.getByRole("img", {name: q.figure.label})).toBeVisible();
    if (q.figure && q.figure.kind === "table") await expect(page.getByRole("table", {name: q.figure.caption})).toBeVisible();
    if (q.figure && /Chart|scatter/.test(q.figure.kind)) await expect(page.getByRole("table", {name: "Data in " + q.figure.caption, includeHidden: true})).toHaveCount(1);
    if (q.figure) {
      await auditBoth(page, q.id);
      await noSideScroll(page, q.id);
    }
    await page.locator("fieldset label").nth(q.answer).click();
    await page.getByRole("button", {name: "Review", exact: true}).click();
    await page.getByRole("button", {name: "End section"}).click();
    await page.getByRole("button", {name: "Yes, end the section"}).click();
    await expect(page.getByText("100% correct"), q.id).toBeVisible();
  }
});

test("Math with the drafts: mixed practice is 15 questions in 17 minutes, the full section 45 in 50 minutes, easier first", async ({page, problems}) => {
  void problems;
  await go(page, "math", {query: "?drafts=1", clock: true, seed: 12});
  await expect(page.getByRole("button", {name: /^Mixed practice 15 questions timed at ACT pace \(17 minutes\)/})).toBeVisible();
  await page.getByRole("button", {name: /^Full section 45 questions in 50 minutes/}).click();
  await startSection(page, "Math");
  await expect(page.getByRole("timer")).toHaveText("Time left 50:00");
  await expect(nav(page).getByRole("button")).toHaveCount(45);
  var diffs = [];
  for (var n = 1; n <= 45; n += 4) {
    await nav(page).getByRole("button", {name: new RegExp("^Question " + n + ",")}).click();
    var stemText = (await page.locator("legend").textContent()).replace(/\s+/g, " ").trim();
    var q = bank.math.questions.find((x) => spoken(x.stem) === stemText);
    expect(q, stemText).toBeTruthy();
    diffs.push(q.difficulty);
  }
  diffs.forEach((d, i) => { if (i) expect(d).toBeGreaterThanOrEqual(diffs[i - 1]); });
  expect(diffs[0]).toBe(1);
  expect(diffs[diffs.length - 1]).toBe(3);
});

// ---------- Reading ----------
// Every Reading passage: its note and numbered paragraphs (straight through Passage A and Passage B in a paired set),
// every question and choice read correctly, axe-core in light and dark mode, and all correct scores 9 / 9.
for (var rp of bank.reading.passages) {
  (function (p) {
    test("every Reading passage plays through all correct: " + p.title, async ({page, problems}) => {
      void problems;
      await go(page, "reading", {query: "?drafts=1"});
      var list = page.getByRole("region", {name: "Review drafts"});
      await expect(list.getByRole("button", {name: p.title + " " + p.type + " · 9 questions · Draft", exact: true})).toBeVisible();
      await list.getByRole("button", {name: new RegExp("^" + p.title.replace("?", "\\?") + " ")}).click();
      await startSection(page, "Reading");
      var art = page.getByRole("article");
      await expect(art.getByRole("heading", {level: 1})).toHaveText(p.title);
      var note = p.body.find((b) => b.kind === "note");
      await expect(art.getByText(note.html)).toBeVisible();
      var paras = p.body.filter((b) => b.kind === "text").length;
      for (var i = 1; i <= paras; i++) await expect(art.locator("p").filter({hasText: new RegExp("^Paragraph " + i + "\\s*\\S")})).toHaveCount(1);
      await expect(art.locator("p").filter({hasText: new RegExp("^Paragraph " + (paras + 1) + "\\D")})).toHaveCount(0);
      for (var h of p.body.filter((b) => b.kind === "heading")) await expect(art.getByRole("heading", {level: 2, name: h.text})).toBeVisible();
      await auditBoth(page, p.id);
      for (var n = 1; n <= 9; n++) {
        var q = p.questions[n - 1];
        await expect(page.getByRole("group", {name: spoken(q.stem)})).toBeVisible();
        var letters = n % 2 ? ["A", "B", "C", "D"] : ["F", "G", "H", "J"];
        for (var k = 0; k < 4; k++) await expect(page.getByRole("radio").nth(k)).toHaveAccessibleName(letters[k] + ". " + spoken(q.choices[k]));
        await page.locator("fieldset label").nth(q.answer).click();
        if (n < 9) await next(page).click();
      }
      await page.getByRole("button", {name: "Review", exact: true}).click();
      await page.getByRole("button", {name: "End section"}).click();
      await page.getByRole("button", {name: "Yes, end the section"}).click();
      await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
      await expect(page.getByText("100% correct")).toBeVisible();
    });
  })(rp);
}

test("Reading with the drafts: the full section has one passage of each type, 36 questions in 40 minutes", async ({page, problems}) => {
  void problems;
  await go(page, "reading", {query: "?drafts=1", clock: true, seed: 4});
  await expect(page.getByRole("button", {name: /^Mixed practice 2 passages timed at ACT pace \(20 minutes\)/})).toBeVisible();
  await page.getByRole("button", {name: /^Full section 36 questions in 40 minutes/}).click();
  await expect(page.getByText("This section has 4 passages and 36 questions.", {exact: false})).toBeVisible();
  await startSection(page, "Reading");
  await expect(page.getByRole("timer")).toHaveText("Time left 40:00");
  await expect(nav(page).getByRole("button")).toHaveCount(36);
  var types = [];
  for (var n of [1, 10, 19, 28]) {
    await nav(page).getByRole("button", {name: new RegExp("^Question " + n + ",")}).click();
    var kind = await page.getByRole("article").getByText(/^Passage [IV]+ · /).textContent();
    types.push(kind.replace(/^Passage [IV]+ · /, ""));
  }
  expect(types.slice().sort()).toEqual(words.sections.reading.types.slice().sort());
  for (var [w, h] of [[1366, 657], [390, 664], [320, 568]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "reading full " + w);
  }
});

test("with every section's drafts, the full ACT can be tried from the home page", async ({page, problems}) => {
  void problems;
  await go(page, null, {query: "?drafts=1"});
  var full = page.getByRole("region", {name: "Full ACT"});
  await expect(full.getByRole("checkbox", {name: "Include the optional Science section"})).toBeChecked();
  await full.getByRole("button", {name: "Start the full ACT"}).click();
  await expect(page.getByText("Full ACT · Section 1 of 4")).toBeVisible();
  await expect(page.getByText("This section has 5 passages and 50 questions.", {exact: false})).toBeVisible();
});

// ---------- The full ACT ----------
test("full ACT: English, Math, the break, Reading and Science, then a composite and section reports", async ({page, problems}) => {
  test.setTimeout(120000);
  void problems;
  var b = fullBanks();
  for (var k of ["english", "math", "reading"]) await serve(page, k, b[k]);
  await go(page, null, {clock: true, seed: 9});
  var full = page.getByRole("region", {name: "Full ACT"});
  await expect(full.getByRole("checkbox", {name: "Include the optional Science section"})).toBeChecked();
  await full.getByRole("button", {name: "Start the full ACT"}).click();
  await expect(page.getByText("Full ACT · Section 1 of 4")).toBeVisible();
  await expect(page.getByRole("button", {name: "Back"})).toBeVisible();
  await startSection(page, "English");
  await expect(page.getByRole("timer")).toHaveText("Time left 35:00");
  await expect(nav(page).getByRole("button")).toHaveCount(50);
  // All 5 English passages are copies of the sample, so question n's answer is the sample's question (n - 1) % 10 + 1.
  await playAll(page, 50, (n) => bank.english.passages[0].questions[(n - 1) % 10].answer);
  // After English comes Math's directions, not a report, and there is no going back.
  await expect(page.getByText("Full ACT · Section 2 of 4")).toBeVisible();
  await expect(page.getByText("The English section is done.", {exact: false})).toBeVisible();
  await expect(page.getByRole("button", {name: "Back"})).toHaveCount(0);
  await startSection(page, "Math");
  await expect(page.getByRole("timer")).toHaveText("Time left 50:00");
  // Math runs out of time with nothing answered.
  await page.clock.fastForward(50 * 60 * 1000);
  await expect(page.getByRole("heading", {level: 1, name: "Break"})).toBeFocused();
  await expect(page.getByText("Time ran out on the Math section.", {exact: false})).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText("Break time left 10:00");
  await auditBoth(page, "break");
  // The break ends on its own after 10 minutes.
  await page.clock.fastForward(10 * 60 * 1000);
  await expect(page.getByText("Full ACT · Section 3 of 4")).toBeVisible();
  await startSection(page, "Reading");
  await endNow(page);
  await expect(page.getByText("Full ACT · Section 4 of 4")).toBeVisible();
  await startSection(page, "Science");
  await endNow(page);
  // Composite: English 36, Math 1, Reading 1, so (36 + 1 + 1) / 3 rounds to 13. STEM: (1 + 1) / 2 = 1.
  await expect(page.getByRole("heading", {level: 1, name: "Full ACT score report"})).toBeFocused();
  await expect(page.getByText("13 / 36", {exact: true})).toBeVisible();
  await expect(page.getByText(/below the national average composite of 19\.4/)).toBeVisible();
  await expect(page.getByText("STEM score (the average of Math and Science): 1")).toBeVisible();
  var scores = page.getByRole("region", {name: "Section scores"});
  await expect(scores.getByRole("heading", {level: 3})).toHaveText(["English 36", "Math 1", "Reading 1", "Science 1"]);
  await expect(scores.getByText("50 of 50 correct. Meets the benchmark of 18.")).toBeVisible();
  await auditBoth(page, "full report");
  for (var [w, h] of [[390, 664], [320, 568]]) {
    await page.setViewportSize({width: w, height: h});
    await noSideScroll(page, "full report " + w);
  }
  await page.setViewportSize({width: 1366, height: 657});
  // Each section's own report, and back.
  await page.getByRole("button", {name: "See the English report"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "Score report"})).toBeFocused();
  await expect(page.getByRole("heading", {name: "Estimated ACT English score: 36"})).toBeVisible();
  await expect(page.getByRole("button", {name: "Try another set"})).toHaveCount(0);
  await page.getByRole("button", {name: "Back to full ACT report"}).click();
  await expect(page.getByRole("button", {name: "See the English report"})).toBeFocused();
  await page.getByRole("button", {name: "See the Math report"}).click();
  await expect(page.getByText(/Time is up\./)).toBeVisible();
  await expect(page.getByText("0 / 45", {exact: true})).toBeVisible();
  await page.getByRole("button", {name: "Back to full ACT report"}).click();
  await page.getByRole("button", {name: "Back to start"}).click();
  await expect(page.getByRole("heading", {level: 1, name: "ACT Practice"})).toBeFocused();
});

test("full ACT without Science: three sections, no STEM score", async ({page, problems}) => {
  void problems;
  var b = fullBanks();
  for (var k of ["english", "math", "reading"]) await serve(page, k, b[k]);
  await go(page, null, {clock: true});
  var full = page.getByRole("region", {name: "Full ACT"});
  await full.getByRole("checkbox", {name: "Include the optional Science section"}).uncheck();
  await full.getByRole("button", {name: "Start the full ACT"}).click();
  await expect(page.getByText("Full ACT · Section 1 of 3")).toBeVisible();
  await startSection(page, "English");
  await endNow(page);
  await startSection(page, "Math");
  await endNow(page);
  await page.getByRole("button", {name: "End the break"}).click();
  await expect(page.getByText("Full ACT · Section 3 of 3")).toBeVisible();
  await startSection(page, "Reading");
  await endNow(page);
  await expect(page.getByText("1 / 36", {exact: true})).toBeVisible();
  await expect(page.getByText(/STEM score/)).toHaveCount(0);
  await expect(page.getByRole("region", {name: "Section scores"}).getByRole("heading", {level: 3})).toHaveText(["English 1", "Math 1", "Reading 1"]);
});

test("full ACT stays hidden when one required section cannot make a full set", async ({page, problems}) => {
  void problems;
  var b = fullBanks();
  b.reading.passages.pop();
  for (var k of ["english", "math", "reading"]) await serve(page, k, b[k]);
  await go(page);
  await expect(page.getByRole("region", {name: "Full ACT"}).getByRole("button")).toHaveCount(0);
  // English and Math can, so their own Full section modes appear.
  await go(page, "english");
  await expect(page.getByRole("button", {name: /^Full section 50 questions in 35 minutes/})).toBeVisible();
  await go(page, "math");
  await expect(page.getByRole("button", {name: /^Mixed practice 15 questions/})).toBeVisible();
  await expect(page.getByRole("button", {name: /^Full section 45 questions in 50 minutes/})).toBeVisible();
});
