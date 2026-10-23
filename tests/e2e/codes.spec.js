// Completion codes and the teacher code checker: a full mixed round played by keyboard ends with a code, the code is
// copied and checked on /check/ and every field matches the round, no code for single practice or Practice my
// misses, a bulk paste of mixed lines, Copy results, the copy fallback, axe-core, layout and network.
"use strict";
var {test, expect, state, activities} = require("./fixtures");
var {answerKey, play} = require("./play");
var {audit, results, check, readable} = require("./checker");
var codes = require("../../shared/zsa-codes.js");

var VERSION = {"ion-charge-trainer": "1.4"};
// Focus as the activity helpers describe it, or on the checker page "#id" (or the tag name).
async function focusOf(page) {
  return page.evaluate(() => {
    if (window.__zsa) return window.__zsa.state().focus;
    var a = document.activeElement;
    return a.id ? "#" + a.id : a.tagName.toLowerCase();
  });
}
// Press Tab (or Shift+Tab) until the focused element matches.
async function tabTo(page, match, back) {
  for (var i = 0; i < 40; i++) {
    var f = await focusOf(page);
    if (match(f)) return f;
    await page.keyboard.press(back ? "Shift+Tab" : "Tab");
  }
  throw new Error("focus never reached the target; it is on " + (await focusOf(page)));
}
// Choose a value in one answer group from the keyboard: Tab into the group, Home, arrows, then Enter.
async function choose(page, part, value) {
  await tabTo(page, (f) => f.startsWith("choice:" + part + "="));
  var values = (await state(page)).parts[part].choices.map((c) => c.value);
  await page.keyboard.press("Home");
  for (var i = 0; i < values.indexOf(String(value)); i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
}
async function wrongValue(page, part, right) {
  return (await state(page)).parts[part].choices.find((c) => c.value !== String(right) && !c.tried).value;
}

// A full mixed round from the keyboard only. On the first item both hints are read; on the first later item with a
// one-part step, two wrong answers and then Show me; on the next one, one wrong answer. Returns what was used.
async function keyboardRound(page, slug) {
  var key = answerKey(slug), used = {hints: 0, show: 0, wrong: 0}, item = 0, plan = {hint: false, show: false, wrong: false};
  for (var guard = 0; guard < 20; guard++) {
    var st = await state(page);
    if (st.finish) return used;
    var answers = key[(slug === "ion-charge-trainer" ? "" : (/formula/i.test(st.caption) ? "n2f|" : "f2n|")) + st.heading];
    var review = /^Review/.test(st.progress);
    await tabTo(page, (f) => f.startsWith("choice:"));
    while ((st = await state(page)).step !== null) {
      var right = answers[st.step], parts = Object.keys(right);
      if (!plan.hint) {
        await tabTo(page, (f) => f.startsWith("button:Hint"));
        await page.keyboard.press("Enter"); await page.keyboard.press("Enter");
        expect((await state(page)).hint).toEqual({text: "Both hints shown", disabled: true});
        used.hints += 2; plan.hint = true;
        await tabTo(page, (f) => f.startsWith("choice:" + parts[0] + "="), true);
      }
      if (parts.length === 1 && !review && item >= 1 && (!plan.show || (!plan.wrong && item >= 2))) {
        var part = parts[0];
        await choose(page, part, await wrongValue(page, part, right[part]));
        used.wrong++;
        if (!plan.show) {
          await choose(page, part, await wrongValue(page, part, right[part]));
          used.wrong++;
          await tabTo(page, (f) => f === "button:Show me");
          await page.keyboard.press("Enter");
          used.show++; plan.show = true;
          continue;
        }
        plan.wrong = true;
      }
      for (var p of parts) {
        var now = await state(page);
        if (now.step !== st.step) break;
        if (!now.parts[p].choices.find((c) => c.value === String(right[p])).pressed) await choose(page, p, right[p]);
      }
    }
    expect(await focusOf(page)).toMatch(/^h3:/);
    await tabTo(page, (f) => /^button:(Next|See round summary)/.test(f));
    await page.keyboard.press("Enter");
    item++;
  }
  throw new Error("round did not finish");
}

// The round summary as shown: first-try lines, and the completion code (seen and spoken).
async function summaryOf(page, cfg) {
  return page.evaluate((ids) => {
    var work = document.getElementById(ids.work), z = window.__zsa;
    var stats = [].filter.call(work.querySelectorAll(":scope > div"), (d) => d.querySelector("strong") && !d.getAttribute("role"))
      .map((d) => d.querySelector("span").textContent + ": " + d.querySelector("strong").textContent);
    var group = work.querySelector('[role="group"]');
    var value = group && document.getElementById(group.getAttribute("aria-labelledby").replace(/-label$/, ""));
    return {stats: stats, groupName: group && z.spoken(document.getElementById(group.getAttribute("aria-labelledby"))),
      code: value && z.visual(value).trim(), spoken: value && z.spoken(value).trim(), text: z.visual(work), live: z.state().live};
  }, cfg.ids);
}
// The two activities played here from the shared answer key. Periodic Trends Practice and the Lewis and VSEPR Builder
// have their own code tests (periodic-trends.spec.js, lewis-codes.spec.js); activities without codes have none.
for (var slug of Object.keys(activities).filter((s) => codes.activity(s) && activities[s].answer)) {
  (function (slug) {
    var cfg = activities[slug], spec = codes.activity(slug);
    test(slug + ": a full keyboard round gives a code that the checker reads back exactly", async ({page, open, context}) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      var outside = [];
      page.on("request", (r) => { if (!r.url().startsWith("http://127.0.0.1:")) outside.push(r.url()); });
      await open(slug, {seed: 41});
      // No code while the round is under way.
      await expect(page.getByRole("group", {name: "Completion code"})).toHaveCount(0);
      var used = await keyboardRound(page, slug);
      var today = codes.isoDate(codes.dayNumber(new Date()));
      var sum = await summaryOf(page, cfg);
      expect(await focusOf(page)).toBe("h2:Round complete");
      expect(sum.live).toBe("Round complete. Completion code ready.");
      expect(sum.groupName).toBe("Completion code");
      expect(sum.code).toMatch(new RegExp("^" + spec.prefix + "(-[0-9A-HJKMNP-TV-Z]{4}){3}-[0-9A-HJKMNP-TV-Z]{2}$"));
      expect(sum.spoken, "read one character at a time").toBe(codes.spoken(sum.code));
      expect(sum.text).toContain("Paste this code into your Google Classroom assignment.");
      // The round really had the misses the plan made: two first tries lost, one Show me, both hints once.
      expect(used).toEqual({hints: 2, show: 1, wrong: 3});
      var lost = sum.stats.reduce((n, line) => { var m = line.match(/(\d+) \/ (\d+)$/); return n + Number(m[2]) - Number(m[1]); }, 0);
      expect(lost).toBe(2);
      await audit(page, "round summary with a code");

      // Copy code from the keyboard: the next Tab stop after the heading.
      await page.keyboard.press("Tab");
      expect(await focusOf(page)).toBe("button:Copy code");
      await page.keyboard.press("Enter");
      await expect(page.getByRole("group", {name: "Completion code"}).getByText("Code copied.", {exact: true})).toBeVisible();
      expect((await state(page)).live).toBe("Code copied.");
      var copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toBe(sum.code);

      // Paste it into the checker.
      await page.goto("/check/");
      await page.locator("#zsa-chk-input").focus();
      await page.keyboard.insertText(copied);
      await tabTo(page, (f) => f === "#zsa-chk-check");
      await page.keyboard.press("Enter");
      var rows = await results(page);
      expect(rows).toEqual([{
        "Line": "1", "Code": sum.code, "Activity": spec.name, "Version": VERSION[slug], "Date completed": readable(today), "Items": "10",
        "First-try correct": sum.stats, "Show me uses": String(used.show), "Hints used": String(used.hints), "Status": "Valid"
      }]);
      await expect(page.locator("#zsa-chk-live")).toHaveText("Checked 1 line: 1 valid.");
      await audit(page, "checker with a result");
      expect(outside, "requests outside the site").toEqual([]);
    });

    test(slug + ": no code for Practice my misses or single practice", async ({page, open}) => {
      await open(slug, {seed: 42});
      var run = await play(page, slug, {0: {0: ["wrong"]}});
      expect(run.finish.finishButtons).toContain("Copy code");
      await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
      run = await play(page, slug);
      expect(run.finish.finish.title).toBe("Round complete");
      expect(run.finish.finishButtons).not.toContain("Copy code");
      expect(run.finish.finish.text).not.toContain("Completion code");
      expect(run.finish.live).toBe("Round complete");
      await expect(page.getByRole("group", {name: "Completion code"})).toHaveCount(0);
      await page.evaluate((v) => window.__zsa.single(v[0], v[1]), slug === "ion-charge-trainer" ? ["Na"] : ["10", "f2n"]);
      run = await play(page, slug);
      expect(run.finish.finish.title).toMatch(/^Chosen .* complete$/);
      expect(run.finish.finishButtons).not.toContain("Copy code");
      expect(run.finish.finish.text).not.toContain("Completion code");
      // Practice again starts a full mixed round, which gives a code again.
      await page.evaluate(() => window.__zsa.finishButton("Practice again"));
      run = await play(page, slug);
      expect(run.finish.finishButtons[0]).toBe("Copy code");
    });
  })(slug);
}

test("Ion Charge Trainer: with step 4 off, the code leaves out Name the ion", async ({page, open}) => {
  await open("ion-charge-trainer", {seed: 43});
  await page.evaluate(() => { document.getElementById("zsa-ict-naming").checked = false; window.__zsa.newRound(); });
  await play(page, "ion-charge-trainer");
  var sum = await summaryOf(page, activities["ion-charge-trainer"]);
  expect(sum.stats).toEqual(["Valence electrons: 10 / 10", "Gain or lose: 10 / 10", "Ion charge: 10 / 10"]);
  await page.goto("/check/");
  await check(page, sum.code);
  var rows = await results(page);
  expect(rows[0]["First-try correct"]).toEqual(sum.stats);
  expect(rows[0].Status).toBe("Valid");
});

test("Copy code falls back to selecting the code when the Clipboard API fails", async ({page, open}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {value: {writeText: () => Promise.reject(new Error("blocked"))}});
  });
  await open("ion-charge-trainer", {seed: 44});
  await play(page, "ion-charge-trainer");
  var sum = await summaryOf(page, activities["ion-charge-trainer"]);
  await page.getByRole("button", {name: "Copy code"}).click();
  await expect.poll(() => page.evaluate(() => String(window.getSelection()))).toBe(sum.code);
  var status = (await state(page)).live;
  expect(["Code copied.", "The code is selected. Press Ctrl+C, or Command+C on a Mac, to copy it."]).toContain(status);
  await expect(page.getByRole("group", {name: "Completion code"}).getByText(status, {exact: true})).toBeVisible();
});

// 30 lines as a teacher might paste them: valid codes among other text, typos, unknown activities, future dates
// and lines with no code.
function bulkLines() {
  var today = codes.dayNumber(new Date()), lines = [];
  function result(slug, day, n) {
    var ict = slug === "ion-charge-trainer";
    var totals = ict ? {"0": 10, "1": 10, "2": 10, "3": 10} : {n2f0: 6, n2f1: 6, f2n0: 4, f2n1: 4};
    var results = {};
    Object.keys(totals).forEach((k, i) => { results[k] = Math.max(0, totals[k] - ((n + i) % 3)); });
    return {activity: slug, version: ict ? "1.4.0" : "1.1.0", day: day, items: 10, totals: totals, results: results, show: n % 4, hints: n};
  }
  function code(slug, day, n) { return codes.encode(result(slug, day, n)); }
  var other = {id: 7, prefix: "BEQ", slug: "balancing", name: "Balancing", maxItems: 8, stats: [["0", "Balance"]], totals: [["0"]], items: [0]};
  function unknown(n) { return codes.encode({version: "1.0.0", day: today - n, items: 8, totals: {"0": 8}, results: {"0": n}, show: 0, hints: 0}, other); }
  function typo(c, at) { var ch = c[at] === "7" ? "8" : "7"; return c.slice(0, at) + ch + c.slice(at + 1); }
  // Swap the first two different neighbors from `at` on, neither of them a hyphen.
  function swap(c, at) {
    while (c[at] === c[at + 1] || c[at] === "-" || c[at + 1] === "-") at++;
    return c.slice(0, at) + c[at + 1] + c[at] + c.slice(at + 2);
  }
  var slugs = ["ion-charge-trainer", "ionic-formula-builder"];
  var add = (text, status) => lines.push({text: text, status: status});
  add("Last name\tFirst name\tPrivate comment", "No code found");
  for (var i = 0; i < 11; i++) {
    var c = code(slugs[i % 2], today - i * 3, i);
    add(["Student " + i + "\t" + c, c, c.toLowerCase(), "Name, " + c + ", 100", c.replace(/-/g, "")][i % 5], "Valid");
  }
  var t1 = code(slugs[0], today - 1, 20), t2 = code(slugs[1], today - 2, 21), t3 = code(slugs[0], today - 5, 22);
  add("Ana\t" + typo(t1, 6), "Typo or edited");
  add(swap(t2, 9), "Typo or edited");
  add(t3.slice(0, -1), "Typo or edited");
  add(typo(t2, t2.length - 1), "Typo or edited");
  add("Jo " + swap(t1, 15), "Typo or edited");
  add(t3.replace(/^ICT/, "IFB"), "Typo or edited");
  add(unknown(1), "Unknown activity");
  add("Sam\t" + unknown(2), "Unknown activity");
  add(code(slugs[0], today + 1, 3), "Future date");
  add("Kai " + code(slugs[1], today + 40, 4), "Future date");
  add("", "No code found");
  add("I finished it!", "No code found");
  add("2026-10-08", "No code found");
  add("re-do-it later", "No code found");
  add("ICT", "No code found");
  add(code(slugs[1], 0, 5), "Valid");
  add(code(slugs[0], today, 6), "Valid");
  add(code(slugs[1], today - 100, 7), "Valid");
  return lines;
}

test("checker: a bulk paste of 30 mixed lines, Copy results, axe and the copy fallback", async ({page, context, problems}) => {
  void problems;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  var outside = [];
  page.on("request", (r) => { if (!r.url().startsWith("http://127.0.0.1:")) outside.push(r.url()); });
  var lines = bulkLines();
  expect(lines).toHaveLength(30);
  await page.goto("/check/");
  await audit(page, "checker empty");
  await page.locator("#zsa-chk-check").click();
  await expect(page.locator("#zsa-chk-message")).toHaveText("Nothing to check. Paste at least one code.");
  await check(page, lines.map((l) => l.text).join("\n"));
  var rows = await results(page);
  expect(rows.map((r) => r.Status)).toEqual(lines.map((l) => l.status));
  expect(rows.map((r) => r.Line)).toEqual(lines.map((l, i) => String(i + 1)));
  var count = {}; lines.forEach((l) => { count[l.status] = (count[l.status] || 0) + 1; });
  var expected = "Checked 30 lines: " + ["Valid", "Typo or edited", "Unknown activity", "Future date", "No code found"]
    .map((s) => count[s] + " " + s.toLowerCase()).join(", ") + ".";
  await expect(page.locator("#zsa-chk-count")).toHaveText(expected);
  await expect(page.locator("#zsa-chk-live")).toHaveText(expected);
  // Valid and future rows show their fields; the others show none.
  rows.forEach((r, i) => {
    var ok = r.Status === "Valid" || r.Status === "Future date";
    expect(r.Activity !== "", "line " + (i + 1) + " activity").toBe(ok);
    expect(Array.isArray(r["First-try correct"]), "line " + (i + 1) + " steps").toBe(ok);
  });
  await audit(page, "checker with mixed results");
  for (var vp of [{width: 390, height: 664}, {width: 320, height: 640}]) {
    await page.setViewportSize(vp);
    await audit(page, "checker at " + vp.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), "sideways scroll at " + vp.width).toBeLessThanOrEqual(0);
  }
  await page.setViewportSize({width: 1366, height: 657});

  // Copy results: tab-separated, a header row, then one row per line.
  await page.getByRole("button", {name: "Copy results"}).click();
  await expect(page.locator("#zsa-chk-copy-status")).toHaveText("Results copied. Paste them into Google Sheets.");
  var tsv = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\n$/, "").split("\n").map((l) => l.split("\t"));
  expect(tsv).toHaveLength(31);
  expect(tsv[0]).toEqual(["Line", "Code", "Status", "Activity", "Version", "Date completed", "Items", "First-try correct", "Show me uses", "Hints used"]);
  tsv.slice(1).forEach((cells, i) => {
    expect(cells, "row " + (i + 1)).toHaveLength(10);
    expect(cells[2]).toBe(lines[i].status);
    expect(cells[1]).toBe(rows[i].Code);
    if (lines[i].status === "Valid") {
      expect(cells[5]).toMatch(/^\d{4}-\d\d-\d\d$/);
      expect(readable(cells[5])).toBe(rows[i]["Date completed"]);
      expect(cells[7]).toBe(rows[i]["First-try correct"].join("; "));
    }
  });
  // Clear empties the box and hides the results.
  await page.getByRole("button", {name: "Clear"}).click();
  await expect(page.locator("#zsa-chk-results")).toBeHidden();
  await expect(page.locator("#zsa-chk-input")).toBeFocused();
  expect(outside, "requests outside the site").toEqual([]);
});

test("checker: Copy results falls back to the browser's copy command", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {value: {writeText: () => Promise.reject(new Error("blocked"))}});
  });
  await page.goto("/check/");
  await check(page, bulkLines().map((l) => l.text).join("\n"));
  await page.getByRole("button", {name: "Copy results"}).click();
  await expect(page.locator("#zsa-chk-copy-status")).toHaveText(/^(Results copied\. Paste them into Google Sheets\.|Copying did not work in this browser\. Select the table and copy it instead\.)$/);
  await expect(page.getByRole("button", {name: "Copy results"})).toBeFocused();
});

test("checker: no sideways scrolling and 44 px buttons from 320 to 1920 px", async ({page, problems}) => {
  void problems;
  await page.goto("/check/");
  await check(page, bulkLines().map((l) => l.text).join("\n"));
  for (var w of [320, 360, 390, 768, 1280, 1366, 1920]) {
    await page.setViewportSize({width: w, height: 800});
    var m = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      small: [].filter.call(document.querySelectorAll("main button, main > a, footer a"), (b) => { var r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map((b) => b.textContent)
    }));
    expect(m.overflow, w + "px sideways scroll").toBeLessThanOrEqual(0);
    expect(m.small, w + "px small targets").toEqual([]);
  }
});

test("landing page links to the checker under For teachers; activity pages do not", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  var section = page.getByRole("region", {name: "For teachers"});
  await expect(section.getByRole("link", {name: "Check completion codes"})).toHaveAttribute("href", "check/");
  await section.getByRole("link", {name: "Check completion codes"}).click();
  await expect(page).toHaveTitle("Completion Code Checker | ZornScience");
  for (var slug of Object.keys(activities)) {
    await page.goto(activities[slug].path);
    await expect(page.locator('a[href*="check"]')).toHaveCount(0);
  }
});
