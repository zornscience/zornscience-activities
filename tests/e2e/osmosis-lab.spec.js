"use strict";
// Osmosis lab: the whole student flow in the browser at a Chromebook and a phone size, with axe on every step,
// keyboard-only graphing, a real pointer drag, the blot hint, the clipboard text, reset, reduced motion, the hidden
// language toggle and the Spanish strings. labs-a11y.spec.js adds the shared tab-order and dialog checks.
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");
const model = require("../../osmosis-lab/model.js");
const {STRINGS} = require("../../osmosis-lab/data.js");
const SEED = 42;
const URL = "/osmosis-lab/?seed=" + SEED;
const $ = (page, id) => page.locator("#zsa-os-" + id);
const SIZES = [{width: 1366, height: 768}, {width: 360, height: 640}];

test.use({permissions: ["clipboard-read", "clipboard-write"]});
test.beforeEach(async ({page}) => {
  const problems = [];
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") problems.push(m.type() + ": " + m.text()); });
  page.on("pageerror", e => problems.push("page error: " + e.message));
  page.on("request", r => { if (!/^http:\/\/127\.0\.0\.1:\d+\//.test(r.url())) problems.push("outside request: " + r.url()); });
  page.__problems = problems;
});
test.afterEach(async ({page}) => { expect(page.__problems).toEqual([]); });

async function open(page, query) {
  await page.goto(URL + (query || ""));
  await expect(page.locator('[data-zsa-ready="true"]')).toHaveCount(1);
}
async function audit(page, label) {
  await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
  const violations = await page.evaluate(async () => (await window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}}))
    .violations.map(v => v.id + " " + v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(", ")));
  expect(violations, label).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), label + " horizontal scroll").toBeLessThanOrEqual(0);
}
async function waitHours(page) { await expect($(page, "hours")).toHaveText(/^24 /); }
// One trial by tapping. skip lists beakers whose core goes to the balance without blotting.
async function tapTrial(page, skip) {
  for (let i = 0; i < 6; i++) {
    await $(page, "core-" + i).click();
    await $(page, "balance").click();
    await $(page, "record").click();
    await $(page, "beaker-" + i).click();
  }
  await $(page, "ff").click();
  await waitHours(page);
  for (let i = 0; i < 6; i++) {
    await $(page, "beaker-" + i).click();
    if (!(skip || []).includes(i)) await $(page, "towel").click();
    await $(page, "balance").click();
    await $(page, "record").click();
  }
}
async function helperTrial(page, index) {
  await $(page, "trial-" + index).click();
  await $(page, "helper").click();
  await $(page, "ff").click();
  await waitHours(page);
  await $(page, "helper").click();
}
// The expected data, straight from the model, for trials done without redos and all blotted.
function expected(trials) {
  const iso = model.isotonicPoint(SEED), records = [];
  for (let t = 0; t < trials; t++) model.CONCENTRATIONS.forEach((c, slot) => {
    records.push({concentration: c, trial: t, initial: model.core(SEED, t, 0, slot).initial, final: model.finalMass(SEED, iso, t, 0, slot, c, true), blotted: true});
  });
  return {iso, records, summary: model.summarize(records)};
}
async function press(page, key, times) { for (let k = 0; k < times; k++) await page.keyboard.press(key); }

for (const size of SIZES) {
  test(`osmosis-lab ${size.width}x${size.height}: the full flow works start to finish`, async ({page}) => {
    await page.setViewportSize(size);
    await open(page);
    await expect(page.locator(".zsa-languages")).toHaveCount(0);
    await audit(page, "hook");
    // 1. Prediction
    await page.locator('input[name="zsa-os-pred-water"][value="gain"]').check();
    await page.locator('input[name="zsa-os-pred-sugar"][value="lose"]').check();
    await page.locator('input[name="zsa-os-pred-iso"][value="2-4"]').check();
    await expect($(page, "pred-status")).toContainText("Prediction saved.");
    // 2. Bench: rules first, then a full tapped trial with core F left unblotted.
    await $(page, "go-bench").click();
    await expect($(page, "helper")).toBeHidden();
    await $(page, "core-0").click();
    await $(page, "beaker-0").click();
    await expect($(page, "live")).toHaveText(STRINGS["move.weighFirst"].en);
    await $(page, "core-0").click();
    await audit(page, "bench start");
    await tapTrial(page, [5]);
    await expect($(page, "blot-hint")).toBeVisible();
    await expect($(page, "blot-text")).toContainText("core F went on the balance without blotting");
    await expect($(page, "table").getByText("⚠ not blotted")).toHaveCount(1);
    const iso = model.isotonicPoint(SEED);
    const wet = model.finalMass(SEED, iso, 0, 0, 5, 1.0, false), dry = model.finalMass(SEED, iso, 0, 0, 5, 1.0, true);
    expect(wet).toBeGreaterThan(dry);
    await expect($(page, "table").locator("tbody tr").nth(5)).toContainText(wet.toFixed(2));
    await audit(page, "bench blot hint");
    await $(page, "blot-fix").click();
    await expect($(page, "blot-hint")).toBeHidden();
    await expect($(page, "table").locator("tbody tr").nth(5)).toContainText(dry.toFixed(2));
    await expect($(page, "trial-0")).toHaveText("Trial 1 ✓ done");
    // Percent change is hidden until shown or auto-calculated.
    const first = expected(1).records[0];
    const pct = model.percentChange(first.initial, first.final);
    await $(page, "table").getByRole("button", {name: "Show percent change for 0.0 M, trial 1"}).click();
    await expect($(page, "table").locator("tbody tr").first()).toContainText((pct > 0 ? "+" : "") + pct.toFixed(1));
    await page.getByText("Show me the formula").click();
    await expect($(page, "example")).toContainText(first.final.toFixed(2) + " − " + first.initial.toFixed(2));
    await helperTrial(page, 1);
    await helperTrial(page, 2);
    await $(page, "auto").check();
    const want = expected(3);
    await expect($(page, "table").locator("tbody tr")).toHaveCount(18);
    for (let i = 0; i < 6; i++) {
      const avg = want.summary[i].average;
      await expect($(page, "averages").locator("tbody tr").nth(i).locator("td").first()).toHaveText((avg > 0 ? "+" : "") + avg.toFixed(1));
    }
    await audit(page, "bench done");
    // 3. Graph, keyboard only: points onto the averages, the line onto the best fit, the mark onto zero.
    await $(page, "go-graph").click();
    for (let i = 0; i < 6; i++) {
      await page.locator(`[data-handle="point"][data-index="${i}"]`).focus();
      const steps = Math.round(want.summary[i].average * 2);
      await press(page, steps > 0 ? "ArrowUp" : "ArrowDown", Math.abs(steps));
    }
    await expect($(page, "point-feedback").locator("li")).toHaveText(want.summary.map(r => "✓" + r.concentration.toFixed(1) + " M: on your data"));
    const best = model.fit(want.summary.map(r => ({x: r.concentration, y: r.average})));
    for (const [key, x, start] of [["y0", 0.1, 25], ["y1", 0.9, 15]]) {
      await page.locator(`[data-handle="${key}"]`).focus();
      const steps = Math.round((model.at(best, x) - start) * 2);
      await press(page, steps > 0 ? "ArrowUp" : "ArrowDown", Math.abs(steps));
    }
    await expect($(page, "line-feedback")).toContainText("great fit");
    await page.locator('[data-handle="mark"]').focus();
    await press(page, "ArrowLeft", Math.round((0.9 - best.xIntercept) * 100));
    await expect($(page, "mark-feedback")).toContainText("right where your data crosses zero");
    await expect($(page, "graph-live")).not.toBeEmpty();
    const mark = Number(await page.locator('[data-handle="mark"]').getAttribute("aria-valuenow"));
    expect(Math.abs(mark - iso)).toBeLessThan(0.04);
    await $(page, "best").click();
    await expect($(page, "best")).toHaveAttribute("aria-pressed", "true");
    await $(page, "reveal-iso").click();
    await expect($(page, "hidden-iso")).toContainText("is " + iso.toFixed(2) + " M");
    await audit(page, "graph");
    // 4. Zoom: net flow follows the gradient, both directions keep crossing.
    await $(page, "go-zoom").click();
    await expect(page.locator("#zsa-os-zoom-art")).toContainText("Net water flow: into the cell");
    await expect($(page, "zoom-explain")).toContainText("hypotonic");
    await $(page, "zoom-5").click();
    await expect(page.locator("#zsa-os-zoom-art")).toContainText("Net water flow: out of the cell");
    await expect($(page, "zoom-explain")).toContainText("hypertonic");
    await $(page, "zoom-6").click();
    await expect(page.locator("#zsa-os-zoom-art")).toContainText("No net flow");
    await expect($(page, "play")).toHaveText("Pause animation");
    await page.waitForFunction(() => /crossed: [1-9]/.test(document.querySelector("#zsa-os-counts").textContent) && /, [1-9]\d* out/.test(document.querySelector("#zsa-os-counts").textContent), null, {timeout: 15000});
    await $(page, "play").click();
    await expect($(page, "play")).toHaveText("Play animation");
    await audit(page, "zoom");
    // 5. Check questions: wrong, then right, with an explanation each time.
    await $(page, "go-check").click();
    await page.locator('input[name="zsa-os-q1"][value="0"]').check();
    await expect($(page, "q1-feedback")).toContainText("✗ Not quite.");
    for (const [q, a] of [[0, 0], [1, 1], [2, 0], [3, 2]]) {
      await page.locator(`input[name="zsa-os-q${q}"][value="${a}"]`).check();
      await expect($(page, "q" + q + "-feedback")).toContainText("✓ Correct.");
    }
    await expect($(page, "score")).toHaveText("4 of 4 correct so far.");
    await audit(page, "check");
    // 6. Copy: tab separated text with the prediction, every row, averages, the estimate and three starters.
    await $(page, "go-copy").click();
    await $(page, "copy").click();
    await expect($(page, "copy-status")).toHaveText(STRINGS["copy.done"].en);
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toBe(await $(page, "preview").textContent());
    const lines = text.split("\n");
    expect(lines).toContain("Core in pure water (0 M)\tIt gains mass");
    expect(lines).toContain("No change in mass near\t0.2 to 0.4 M");
    expect(lines).toContain("Sucrose (M)\tTrial\tStarting mass (g)\tFinal mass (g)\tPercent change (%)\tBlotted dry");
    want.records.forEach(r => expect(lines).toContain([r.concentration.toFixed(1), r.trial + 1, r.initial.toFixed(2), r.final.toFixed(2), model.percentChange(r.initial, r.final).toFixed(1), "yes"].join("\t")));
    want.summary.forEach(r => expect(lines).toContain([r.concentration.toFixed(1), r.average.toFixed(1), 3].join("\t")));
    expect(lines).toContain("My estimated isotonic point (M)\t" + mark.toFixed(2));
    ["copy.starter1", "copy.starter2", "copy.starter3"].forEach(key => expect(lines).toContain(STRINGS[key].en));
    expect(text).not.toMatch(/[–—]/);
    await audit(page, "copy");
  });
}

test("osmosis-lab: a core can be dragged with a pointer, and a drop on the wrong place explains why", async ({page}) => {
  // Tall enough that the tray, balance and beakers are all on screen at once.
  await page.setViewportSize({width: 1366, height: 1200});
  await open(page);
  await $(page, "go-bench").click();
  async function drag(from, to) {
    const a = await $(page, from).boundingBox(), b = await $(page, to).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + a.width / 2 + 20, a.y + a.height / 2 + 20, {steps: 3});
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, {steps: 6});
    await page.mouse.up();
  }
  await drag("core-2", "beaker-3");
  await expect($(page, "live")).toHaveText(STRINGS["move.weighFirst"].en);
  await drag("core-2", "balance");
  await expect($(page, "balance-label")).toHaveText("Balance with core C");
  await $(page, "record").click();
  await drag("balance", "beaker-3");
  await expect($(page, "beaker-3")).toContainText("Core C soaking");
  await expect($(page, "table").locator("tbody tr")).toHaveCount(1);
  await expect($(page, "table").locator("tbody tr")).toContainText(model.core(SEED, 0, 0, 2).initial.toFixed(2));
});

test("osmosis-lab: redo and start over clear work without penalty", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await open(page);
  await $(page, "go-bench").click();
  await tapTrial(page);
  // The helper unlocks after one trial by hand. It is offered on unfinished trials only.
  await expect($(page, "helper")).toBeHidden();
  await $(page, "trial-1").click();
  await expect($(page, "helper")).toBeVisible();
  await $(page, "trial-0").click();
  await $(page, "redo").click();
  await expect($(page, "trial-0")).toHaveText("Trial 1");
  await expect($(page, "table").locator("tbody tr")).toHaveCount(1);
  await expect($(page, "core-0")).toBeVisible();
  // A redo hands out fresh cores.
  await $(page, "core-0").click(); await $(page, "balance").click();
  await expect($(page, "reading")).toHaveText("Reading: " + model.core(SEED, 0, 1, 0).initial.toFixed(2) + " g");
  await $(page, "reset").click();
  await expect($(page, "reset")).toHaveText(STRINGS["reset.confirm"].en);
  await $(page, "reset").click();
  await expect($(page, "step-hook")).toBeVisible();
  await expect($(page, "go-hook")).toHaveAttribute("aria-current", "step");
  await $(page, "go-bench").click();
  await expect($(page, "table").locator("tbody tr")).toHaveText([STRINGS["data.empty"].en]);
  await expect($(page, "helper")).toBeHidden();
});

test("osmosis-lab: reduced motion skips the 24 hour animation and starts the zoom paused", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await open(page);
  await $(page, "go-zoom").click();
  await expect($(page, "play")).toHaveText("Play animation");
  await expect($(page, "step-zoom")).toContainText(STRINGS["zoom.reduced"].en);
  const before = await page.locator(".zsa-os-water").first().getAttribute("cx");
  await page.waitForTimeout(600);
  expect(await page.locator(".zsa-os-water").first().getAttribute("cx")).toBe(before);
  await $(page, "go-bench").click();
  for (let i = 0; i < 6; i++) { await $(page, "core-" + i).click(); await $(page, "balance").click(); await $(page, "record").click(); await $(page, "beaker-" + i).click(); }
  await $(page, "ff").click();
  await expect($(page, "hours")).toHaveText("24 of 24 hours");
});

test("osmosis-lab: Spanish is complete at ?lang=es, while the language toggle stays hidden", async ({page}) => {
  // Report any text the page asks for that has no Spanish.
  await page.route("**/shared/zsa-i18n.js*", route => {
    const source = fs.readFileSync(path.join(ROOT, "shared/zsa-i18n.js"), "utf8");
    return route.fulfill({contentType: "text/javascript", body: source.replace("strings = copy.es || {};", `strings = copy.es || {};
    var originalText = api.text;
    api.text = function (text, values) {
      if (/[A-Za-z]{2}/.test(text) && !Object.hasOwn(strings, text) && !/^(ZornScience|About this activity|Related lessons|Soak potato cores|Biology)/.test(text)) document.documentElement.setAttribute("data-missing", (document.documentElement.getAttribute("data-missing") || "") + "|" + text);
      return originalText(text, values);
    };`)});
  });
  await page.emulateMedia({reducedMotion: "reduce"});
  await open(page, "&lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.locator("h1")).toHaveText(STRINGS.title.es);
  await expect(page.locator(".zsa-languages")).toHaveCount(0);
  await $(page, "go-bench").click();
  await tapTrial(page, [0]);
  await expect($(page, "blot-hint")).toContainText("Pista:");
  await $(page, "auto").check();
  for (const step of ["graph", "zoom", "check", "copy"]) { await $(page, "go-" + step).click(); await audit(page, "es " + step); }
  await $(page, "copy").click();
  await expect($(page, "preview")).toContainText(STRINGS["copy.starter1"].es);
  expect(await page.locator("html").getAttribute("data-missing")).toBeNull();
});

test("osmosis-lab: the landing page lists it, and in Spanish it opens in English until the Spanish is proofread", async ({page}) => {
  await page.goto("/");
  await expect(page.locator('.zsa-home-card a[href="osmosis-lab/"]')).toHaveText("Osmosis: Potato Cores in Sucrose Solutions");
  await page.goto("/?lang=es");
  const card = page.locator('.zsa-home-card h3').filter({has: page.locator('a[href="osmosis-lab/"]')});
  await expect(card).toHaveText("Ósmosis: cilindros de papa en soluciones de sacarosa (en inglés)");
  await expect(page.locator(".zsa-home-card a[href^='leaf-disk-lab/']")).toHaveAttribute("href", "leaf-disk-lab/?lang=es");
});

test("osmosis-lab: every graph handle is reached by Tab and shows a visible focus ring", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await open(page);
  await $(page, "go-bench").click();
  await tapTrial(page);
  await $(page, "go-graph").click();
  const handles = page.locator("[data-handle]");
  await expect(handles).toHaveCount(9);
  await $(page, "go-graph").focus();
  const reached = new Set();
  for (let i = 0; i < 40 && reached.size < 9; i++) {
    await page.keyboard.press("Tab");
    const key = await page.evaluate(() => { const h = document.activeElement.closest && document.activeElement.closest("[data-handle]"); return h ? h.getAttribute("data-handle") + (h.getAttribute("data-index") || "") : null; });
    if (!key || reached.has(key)) continue;
    reached.add(key);
    const box = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return {x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: r.width + 12, height: r.height + 12}; });
    const focused = await page.screenshot({clip: box, animations: "disabled"});
    await page.evaluate(() => { window.__osFocus = document.activeElement; document.activeElement.blur(); });
    const blurred = await page.screenshot({clip: box, animations: "disabled"});
    expect(focused.equals(blurred), key + " shows focus").toBe(false);
    await page.evaluate(() => window.__osFocus.focus());
  }
  expect(reached.size).toBe(9);
});
