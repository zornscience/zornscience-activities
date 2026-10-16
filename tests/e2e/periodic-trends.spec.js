// Periodic Trends Practice (periodic-trends/): every wrong pick in all 426 questions routes to the intended
// feedback, round rules, the flow (hints, Show me, trail, review, summaries, Practice my misses, trend picker),
// keyboard, layout fit, axe-core, embed mode and network. Expected answers and feedback rules are worked out here
// from the Periodic Table's data and the lessons' trends, not from the activity's code. Selects by role, id, ARIA
// state and text only, and fails on console errors or CSP violations (the `problems` fixture).
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var {install} = require("../support/activities");
var {loadData} = require("../support/load-data");

var ROOT = path.join(__dirname, "..", "..");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var IDS = {work: "zsa-ptr-work", strip: "zsa-ptr-pair", heading: "zsa-ptr-heading", progress: "zsa-ptr-progress", live: "zsa-ptr-live",
  options: "zsa-ptr-options", newRound: "zsa-ptr-new", pick: "zsa-ptr-pick", select: "zsa-ptr-select", table: "zsa-ptr-table"};
var table = loadData(path.join(ROOT, "periodic-table/data.js"));
var items = loadData(path.join(ROOT, "periodic-trends/data.js")).items;
var RULE = {radius: {period: "decreases", group: "increases"}, en: {period: "increases", group: "decreases"}, ie: {period: "increases", group: "decreases"}};
var LABEL = {radius: "atomic radius", en: "electronegativity", ie: "first ionization energy"};
function el(symbol) { return table.elements.find(function (e) { return e.symbol === symbol; }); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// The right answers for one question, from the data and the rule.
function answers(q) {
  var a = el(q.a), b = el(q.b), relation = a.group === b.group ? "group" : "period";
  var key = {radius: "radius", en: "en", ie: "ie"}[q.prop];
  var winner = a[key] > b[key] ? a : b;
  expect(winner.symbol, q.id + " data agrees with the rule").toBe(RULE[q.prop][relation] === "increases" ? b.symbol : a.symbol);
  return [{relation: relation}, {direction: RULE[q.prop][relation]}, {element: winner.symbol}];
}
// Which feedback rule a wrong pick should fire, and a phrase that identifies it.
function expectedFeedback(q, step, value) {
  var a = el(q.a), b = el(q.b);
  if (step === 0) return value === "neither" ? ["neither", "They do share a row or a column."] : ["relation", cap(a.name.toLowerCase()) + " is in group " + a.group + ", period " + a.period + "; " + b.name.toLowerCase() + " is in group " + b.group];
  if (step === 1) {
    if (value === "same") return ["stays the same", "It does change."];
    return {radius: ["radius confused with ionization energy", "That is the ionization energy trend."], en: ["direction reversed", "That is backwards."], ie: ["ionization energy confused with radius", "That is the atomic radius trend."]}[q.prop];
  }
  var other = value === a.symbol ? b : a, picked = el(value);
  return picked.z > other.z ? ["atomic number alone", "A larger atomic number does not always mean"] : ["trend applied backwards", "Use the direction you found"];
}
// The question on screen, from its heading and caption.
function onScreen(st) {
  var q = items.find(function (x) {
    return st.heading === cap(el(x.a).name.toLowerCase()) + " (" + x.a + ") and " + el(x.b).name.toLowerCase() + " (" + x.b + ")" && st.caption === "Compare: " + LABEL[x.prop];
  });
  if (!q) throw new Error("unknown question " + st.heading + " " + st.caption);
  return q;
}
async function open(page, query, seed) {
  if (seed !== undefined) await page.addInitScript(seedRandom, seed);
  await page.goto("/periodic-trends/" + (query || ""));
  await page.waitForFunction(() => !!document.querySelector("#zsa-ptr-table table"));
  await page.evaluate(install, IDS);
}
async function state(page) { return page.evaluate(() => window.__zsa.state()); }
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// Plays the round in the page with the right answers; plans[i][step] lists "wrong", "hint" or "show" actions first.
async function play(page, plans) {
  var key = {};
  items.forEach(function (q) {
    var st = {heading: cap(el(q.a).name.toLowerCase()) + " (" + q.a + ") and " + el(q.b).name.toLowerCase() + " (" + q.b + ")", caption: "Compare: " + LABEL[q.prop]};
    key[st.heading + "|" + st.caption] = answers(q);
  });
  return page.evaluate(([key, plans]) => {
    var z = window.__zsa, out = [];
    for (var guard = 0; guard < 40; guard++) {
      var st = z.state();
      if (st.finish) return {items: out, finish: st};
      var a = key[st.heading + "|" + st.caption], plan = plans[out.length] || {};
      while (st.step !== null) {
        var s = st.step, part = Object.keys(a[s])[0];
        (plan[s] || []).forEach(function (act) {
          if (act === "hint") z.hint();
          else if (act === "show") z.show();
          else z.choose(part, z.state().parts[part].choices.find(function (c) { return c.value !== String(a[s][part]) && !c.tried; }).value);
        });
        if (z.state().step === s) z.choose(part, a[s][part]);
        st = z.state();
      }
      out.push({heading: st.heading, caption: st.caption, progress: st.progress, summary: st.summary});
      z.next();
    }
    throw new Error("round did not finish");
  }, [key, plans || {}]);
}

for (var prop of ["radius", "en", "ie"]) {
  (function (prop) {
    test("periodic trends: every wrong pick routes to its feedback (" + prop + ")", async ({page, problems}) => {
      void problems;
      var mine = items.filter(function (q) { return q.prop === prop; }), counts = {};
      for (var q of mine) {
        await open(page, "?q=" + q.id);
        var right = answers(q), st = await state(page);
        expect(st.progress).toBe("Question 1 of 1 · Step 1 of 3");
        for (var s = 0; s < 3; s++) {
          st = await state(page);
          var part = Object.keys(right[s])[0];
          var wrongs = st.parts[part].choices.map((c) => c.value).filter((v) => v !== String(right[s][part]));
          expect(wrongs.length, q.id + " step " + s).toBe(s === 2 ? 1 : 2);
          for (var w of wrongs) {
            await page.evaluate(([p, v]) => window.__zsa.choose(p, v), [part, w]);
            st = await state(page);
            var [rule, phrase] = expectedFeedback(q, s, w);
            expect(st.feedback && st.feedback.text, q.id + " step " + s + " " + w).toMatch(/^↻ Not yet\. /);
            expect(st.feedback.text, q.id + " step " + s + " " + w).toContain(phrase);
            expect(st.step).toBe(s);
            counts[rule] = (counts[rule] || 0) + 1;
          }
          await page.evaluate(([p, v]) => window.__zsa.choose(p, v), [part, String(right[s][part])]);
        }
        st = await state(page);
        var win = el(right[2].element);
        expect(st.summary.text).toContain(win.name + " has the " + (prop === "radius" ? "larger" : "higher") + " " + LABEL[prop] + ".");
        expect(st.trail.map((t) => t.text)).toEqual(["✓ Same " + right[0].relation, "✓ " + cap(LABEL[prop]) + " " + right[1].direction, "✓ " + win.name]);
        var href = await page.getByRole("link", {name: "See this trend on the Periodic Table"}).getAttribute("href");
        expect(href).toBe("../periodic-table/?mode=" + {radius: "radius", en: "electronegativity", ie: "ionization"}[prop] + "&el=" + win.symbol);
      }
      // Every question gives each wrong pick exactly one rule.
      var total = Object.values(counts).reduce((t, n) => t + n, 0);
      expect(total).toBe(mine.length * 5);
      console.log(prop + " feedback counts " + JSON.stringify(counts)); // recorded in TESTING.md
    });
  })(prop);
}

test("periodic trends: 40 seeded rounds follow the round rules", async ({page, problems}) => {
  void problems;
  await open(page, "", 101);
  var seen = new Set();
  for (var r = 0; r < 40; r++) {
    var run = await play(page);
    expect(run.items).toHaveLength(9);
    var qs = run.items.map(onScreen);
    expect(new Set(qs.map((q) => q.id)).size).toBe(9);
    for (var p of ["radius", "en", "ie"]) {
      var mine = qs.filter((q) => q.prop === p);
      expect(mine).toHaveLength(3);
      expect(mine.some((q) => el(q.a).group === el(q.b).group)).toBe(true);
      expect(mine.some((q) => el(q.a).period === el(q.b).period)).toBe(true);
    }
    qs.forEach((q) => seen.add(q.id));
    expect(run.items.map((i) => i.progress)).toEqual(Array.from({length: 9}, (x, i) => "Question " + (i + 1) + " of 9 · Step 3 of 3"));
    expect(run.finish.finish.text).toContain("Same group or period9 / 9");
    expect(run.finish.finish.text).toContain("Trend direction9 / 9");
    expect(run.finish.finish.text).toContain("Which element9 / 9");
    await page.evaluate(() => window.__zsa.finishButton("Practice again"));
  }
  expect(seen.size).toBeGreaterThan(200);
});

test("periodic trends: hints, Show me, trail, review, summaries, misses and the trend picker", async ({page, problems}) => {
  void problems;
  await open(page, "?q=radius-Na-Cl");
  var st = await state(page);
  expect(st.heading).toBe("Sodium (Na) and chlorine (Cl)");
  expect(st.caption).toBe("Compare: atomic radius");
  expect(st.question).toBe("1. Are sodium and chlorine in the same group or the same period?");
  expect(st.focus).toBe("body");
  expect(await page.evaluate(() => [].filter.call(document.querySelectorAll("#zsa-ptr-table td"), (td) => /\(in this question\)/.test(td.textContent)).map((td) => window.__zsa.visual(td).trim()))).toEqual(["Na", "Cl"]);
  await page.evaluate(() => window.__zsa.hint());
  st = await state(page);
  expect(st.hintText.text).toBe("Find both elements on the table. A group is a column; a period is a row.");
  expect((await page.evaluate(() => window.__zsa.tableState())).hinted).toEqual([1, 17]);
  await page.evaluate(() => window.__zsa.hint());
  st = await state(page);
  expect(st.hintText.text).toBe("Sodium: group 1, period 3. Chlorine: group 17, period 3.");
  expect(st.hint).toEqual({text: "Both hints shown", disabled: true});
  expect(st.show).toBe(false);
  await page.evaluate(() => window.__zsa.choose("relation", "group"));
  await page.evaluate(() => window.__zsa.choose("relation", "neither"));
  st = await state(page);
  expect(st.show).toBe(true);
  expect(st.feedback.text).toBe("↻ Not yet. They do share a row or a column. Find both on the table: a group is a column, a period is a row.");
  await page.evaluate(() => window.__zsa.show());
  st = await state(page);
  expect(st.trail.map((t) => t.text)).toEqual(["→ Same period"]);
  expect(st.last.text).toBe("→ Answer shown. Both are in period 3.");
  expect(st.question).toBe("2. Across a period (left to right), how does atomic radius change?");
  expect(st.focus).toBe("choice:direction=increases");
  await page.evaluate(() => window.__zsa.choose("direction", "increases"));
  st = await state(page);
  expect(st.feedback.text).toBe("↻ Not yet. That is the ionization energy trend. Atomic radius goes the opposite way. Think about effective nuclear charge.");
  await page.evaluate(() => window.__zsa.choose("direction", "decreases"));
  st = await state(page);
  expect(st.last.text).toContain("✓ Correct. Across a period, atomic radius decreases");
  expect(st.parts.element.choices.map((c) => c.label)).toEqual(["Sodium (Na)", "Chlorine (Cl)"]);
  await page.evaluate(() => window.__zsa.choose("element", "Cl"));
  st = await state(page);
  expect(st.feedback.text).toBe("↻ Not yet. A larger atomic number does not always mean a larger atomic radius. Use the trend: atomic radius decreases from left to right.");
  await page.evaluate(() => window.__zsa.choose("element", "Na"));
  st = await state(page);
  expect(st.summary.title).toBe("Question complete");
  expect(st.summary.text).toContain("Sodium has the larger atomic radius. Na: 155 pm. Cl: 99 pm.");
  expect(st.trail.map((t) => t.text)).toEqual(["→ Same period", "✓ Atomic radius decreases", "✓ Sodium"]);
  expect(st.focus).toBe("h3:Question complete");
  await page.evaluate(() => window.__zsa.next());
  st = await state(page);
  expect(st.finish.title).toBe("Trend practice complete");
  expect(st.finish.text).toContain("Same group or period0 / 1");
  expect(st.finish.text).toContain("Keep practicing");
  expect(st.finish.text).toContain("Sodium and chlorine: atomic radius. Sodium is larger.");
  // Practice my misses: the miss plus same-trend, same-relation questions, up to 6.
  await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
  st = await state(page);
  expect(st.progress).toBe("Question 1 of 6 · Step 1 of 3");
  // Applying the direction backwards (smaller atomic number picked when the larger is right).
  await open(page, "?q=ie-Na-Cl");
  for (var [p, v] of [["relation", "period"], ["direction", "increases"], ["element", "Na"]]) await page.evaluate(([p, v]) => window.__zsa.choose(p, v), [p, v]);
  st = await state(page);
  expect(st.feedback.text).toBe("↻ Not yet. Use the direction you found: first ionization energy increases from left to right, so the element farther right has the higher value.");
  // A step answered wrong twice in a mixed round schedules a review item.
  await open(page, "", 7);
  var run = await play(page, {0: {0: ["wrong", "wrong"]}});
  expect(run.items.length).toBe(10);
  expect(run.items[9].progress).toMatch(/^Review 10 of 10/);
  expect(run.items[9].heading).toBe(run.items[0].heading);
  expect(run.finish.finish.text).toContain("Same group or period8 / 9");
  // The trend picker and ?trend= start a round of one trend.
  await page.locator("#zsa-ptr-options > summary").click();
  await page.getByLabel("Choose a trend").selectOption("en");
  await page.getByRole("button", {name: "Practice this trend"}).click();
  run = await play(page);
  expect(run.items).toHaveLength(6);
  run.items.forEach((i) => expect(i.caption).toBe("Compare: electronegativity"));
  await open(page, "?trend=ie");
  run = await play(page);
  expect(run.items).toHaveLength(6);
  run.items.forEach((i) => expect(i.caption).toBe("Compare: first ionization energy"));
  await open(page, "?q=nonsense");
  expect((await state(page)).progress).toBe("Question 1 of 9 · Step 1 of 3");
});

test("periodic trends: keyboard only, with one Tab stop per answer group", async ({page, problems}) => {
  void problems;
  await open(page, "?q=en-Li-F");
  var guard = 0;
  while (!(await state(page)).focus.startsWith("choice:")) { await page.keyboard.press("Tab"); if (++guard > 20) throw new Error("no choice reached"); }
  expect((await state(page)).focus).toBe("choice:relation=group");
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("End"); await page.keyboard.press("Home");
  var st = await state(page);
  expect(st.feedback).toBeNull();
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
  st = await state(page);
  expect(st.step).toBe(1);
  expect(st.focus).toBe("choice:direction=increases");
  await page.keyboard.press("Space");
  expect((await state(page)).focus).toBe("choice:element=Li");
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
  st = await state(page);
  expect(st.focus).toBe("h3:Question complete");
  await page.keyboard.press("Tab");
  expect((await state(page)).focus).toBe("a:See this trend on the Periodic Table");
});

function measure() {
  var vw = document.documentElement.clientWidth, vh = window.innerHeight, main = document.querySelector("main"), work = document.getElementById("zsa-ptr-work");
  function box(el) { var r = el.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, width: r.width, height: r.height}; }
  function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  var targets = [].filter.call(main.querySelectorAll("button, a, select, summary"), visible).map((el) => ({el: el.textContent.trim().slice(0, 30), box: box(el)}));
  var field = work.querySelector(":scope > fieldset");
  var must = field ? [].filter.call(field.querySelectorAll("button, :scope > p"), visible) : [].filter.call(work.querySelectorAll("section button"), visible);
  return {
    overflow: document.documentElement.scrollWidth - vw,
    small: targets.filter((t) => t.box.width < 44 || t.box.height < 44),
    offscreen: must.map((el) => ({el: el.textContent.trim().slice(0, 40), box: box(el)})).filter((t) => t.box.top < 0 || t.box.bottom > vh + 0.5),
    table: box(document.querySelector("#zsa-ptr-table table")), strip: box(document.getElementById("zsa-ptr-pair")), vh: vh
  };
}
// The longest questions on screen: long names and both kinds of step 2 wording.
var FIT_ITEMS = ["ie-Mg-P", "radius-Be-Sr", "en-Rb-Te"].map((id) => items.find((q) => q.id === id));
async function walk(page, q, check) {
  await open(page, "?q=" + q.id);
  var right = answers(q);
  async function choose(s, value) { await page.evaluate(([p, v]) => window.__zsa.choose(p, v), [Object.keys(right[s])[0], value]); }
  async function wrong(s) { var st = await state(page), part = Object.keys(right[s])[0]; await choose(s, st.parts[part].choices.find((c) => c.value !== String(right[s][part]) && !c.tried).value); }
  await check("step 1");
  await wrong(0); await check("wrong answer");
  await page.evaluate(() => window.__zsa.hint()); await check("hint");
  await page.evaluate(() => window.__zsa.hint()); await check("second hint");
  await wrong(0); await check("Show me offered");
  await choose(0, right[0].relation); await check("step 2");
  await wrong(1); await check("step 2 wrong");
  await page.evaluate(() => window.__zsa.hint()); await check("step 2 hint");
  await choose(1, right[1].direction); await check("step 3");
  await wrong(2); await check("step 3 wrong");
  await choose(2, right[2].element); await check("question complete");
}

test("periodic trends: no sideways scrolling and 44 px targets at every size", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [683, 384], [768, 1024], [1280, 617], [1366, 657], [1920, 960]]) {
    await page.setViewportSize({width: w, height: h});
    await walk(page, FIT_ITEMS[0], async (label) => {
      var m = await page.evaluate(measure);
      expect(m.overflow, w + "x" + h + " " + label).toBeLessThanOrEqual(0);
      expect(m.small, w + "x" + h + " " + label + " small targets").toEqual([]);
    });
    await page.evaluate(() => { document.querySelector("main details").open = true; });
    expect((await page.evaluate(measure)).small, w + " options open").toEqual([]);
  }
});

test("periodic trends: each step fits on screen at 360x640, 390x664, 1280x617 and 1366x657", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[360, 640], [390, 664], [1280, 617], [1366, 657]]) {
    await page.setViewportSize({width: w, height: h});
    for (var q of FIT_ITEMS) {
      await walk(page, q, async (label) => {
        var m = await page.evaluate(measure), where = w + "x" + h + " " + q.id + " " + label;
        expect(m.offscreen, where + " off screen").toEqual([]);
        expect(m.table.top >= 0 && m.table.bottom <= m.vh, where + " table in view").toBe(true);
        // The question strip is in view whenever a step starts and when the question is complete.
        if (/^step \d$|complete/.test(label)) expect(m.strip.top >= 0, where + " question strip in view").toBe(true);
      });
    }
  }
});

test("periodic trends: no axe violations at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var vp of [{width: 1366, height: 657}, {width: 390, height: 664}]) {
    await page.setViewportSize(vp);
    var where = vp.width + "x" + vp.height + " ";
    await open(page, "?q=ie-Li-Ne");
    await audit(page, where + "start");
    await walk(page, items.find((q) => q.id === "ie-Li-Ne"), async (label) => {
      if (["wrong answer", "hint", "Show me offered", "step 3", "question complete"].indexOf(label) >= 0) await audit(page, where + label);
    });
    await open(page, "", 3);
    await play(page, {0: {0: ["wrong"]}});
    await audit(page, where + "round summary");
    await page.locator("#zsa-ptr-options > summary").click();
    await audit(page, where + "practice options open");
    await open(page, "?embed=1");
    await audit(page, where + "embed mode");
  }
});

test("periodic trends: embed mode and local files only", async ({page, problems}) => {
  void problems;
  var urls = [];
  page.on("request", (r) => urls.push(r.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, "")));
  await page.addInitScript(() => { window.__posted = []; var orig = window.postMessage; window.postMessage = function (m) { window.__posted.push(m); return orig.apply(this, arguments); }; });
  await open(page, "?embed=1");
  await page.evaluate(() => document.fonts.ready);
  urls.forEach((u) => expect(u.startsWith("/"), "outside request " + u).toBe(true));
  urls.filter((u) => /\.(css|js)/.test(u)).forEach((u) => expect(u).toMatch(/\?v=1\.0\.0$/));
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  for (var x of await page.locator("[data-zsa-chrome]").all()) await expect(x).toBeHidden();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  for (var a of await page.locator("main a").all()) expect(await a.getAttribute("target")).toBe("_top");
  expect(await page.evaluate(() => window.__posted)).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
});
