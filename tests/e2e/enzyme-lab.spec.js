// Enzyme Activity Lab: the full student flow for the temperature and pH paths, the fair test checker, measuring,
// graphing, the zoom view, the check questions and the Copy my data output, at a phone and a laptop size.
// Set ZSA_EZ_SHOTS=<folder> to also save screenshots of every step.
"use strict";
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const model = require("../../enzyme-lab/model.js");
const i18n = require("../../enzyme-lab/i18n.js");

const SEED = 4242;
const SHOTS = process.env.ZSA_EZ_SHOTS || "";
const VIEWPORTS = {phone: {width: 360, height: 640}, laptop: {width: 1366, height: 768}};
const $ = (page, id) => page.locator("#zsa-ez-" + id);
const en = key => i18n.STRINGS[key].en;

test.beforeEach(async ({page}) => {
  page.__errors = [];
  page.on("pageerror", e => page.__errors.push(e.message));
  page.on("console", m => { if (["warning", "error"].includes(m.type())) page.__errors.push(m.text()); });
  page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1")) page.__errors.push("network: " + r.url()); });
  await page.addInitScript(() => {
    window.__copies = [];
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async text => { window.__copies.push(text); }}});
    for (const method of ["getItem", "setItem", "removeItem", "clear"]) Storage.prototype[method] = () => { throw new Error("Storage used"); };
  });
});
test.afterEach(async ({page}) => {
  expect(page.__errors).toEqual([]);
  expect(await page.locator("main").getAttribute("data-zsa-ez-missing")).toBeNull();
});

async function shot(page, name) {
  if (!SHOTS) return;
  fs.mkdirSync(SHOTS, {recursive: true});
  const vp = page.viewportSize();
  await page.screenshot({path: path.join(SHOTS, name + "-" + vp.width + "x" + vp.height + ".png"), fullPage: true});
}
async function noSideScroll(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}
async function audit(page) {
  await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
  const issues = await page.evaluate(async () => (await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}}))
    .violations.map(v => v.id + " " + v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(", ")));
  expect(issues).toEqual([]);
}
async function setSlider(page, locator, value) {
  await locator.focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < Math.floor(value / 10); i++) await page.keyboard.press("PageUp");
  for (let i = 0; i < value % 10; i++) await page.keyboard.press("ArrowUp");
  await expect(locator).toHaveAttribute("aria-valuenow", String(value));
}
async function choose(page, id) { await page.locator("#zsa-ez-" + id).check(); }
async function tap(page, tube, times = 1) { for (let i = 0; i < times; i++) await $(page, "tube-" + tube).click(); }

// Builds the setup: every tube gets `ml` mL of both liquids, the tested variable takes each level once.
async function setUp(page, variable, {ml = 2, control = null} = {}) {
  await choose(page, "variable-" + variable);
  await choose(page, "tool-extract");
  for (let n = 1; n <= 5; n++) await tap(page, n, ml);
  await choose(page, "tool-peroxide");
  for (let n = 1; n <= 5; n++) await tap(page, n, ml);
  const levels = model.LEVELS[variable];
  await choose(page, variable === "temperature" ? "tool-bath" : "tool-buffer");
  for (let i = 0; i < 5; i++) {
    await choose(page, (variable === "temperature" ? "bath-" : "buffer-") + levels[i]);
    await tap(page, i + 1);
  }
  if (control !== null) {
    await choose(page, variable === "temperature" ? "tool-buffer" : "tool-bath");
    await choose(page, (variable === "temperature" ? "buffer-" : "bath-") + control);
    for (let n = 1; n <= 5; n++) await tap(page, n);
  }
  return levels.map(level => {
    const tube = {extract: ml, peroxide: ml, temperature: 20, ph: 7};
    tube[variable] = level;
    if (control !== null) tube[variable === "temperature" ? "ph" : "temperature"] = control;
    return tube;
  });
}

async function runAndMeasure(page, tubes, trials, label) {
  const session = model.session(SEED);
  const readings = [];
  for (let trial = 0; trial < trials; trial++) {
    await $(page, "start").click();
    await expect($(page, "skip")).toBeFocused();
    if (trial === 0) await shot(page, label + "-3-running");
    await $(page, "skip").click();
    await expect($(page, "clock")).toContainText("60 s of 60 s");
    const row = [];
    for (let i = 0; i < 5; i++) {
      const actual = model.foam(tubes[i], session, trial, i, "liver");
      await $(page, "measure-" + (i + 1)).click();
      // A reading that is far off is rejected kindly.
      if (i === 0 && trial === 0) {
        await setSlider(page, $(page, "marker"), Math.min(100, Math.round(actual) + 8));
        await $(page, "record").click();
        await expect($(page, "measure-feedback")).toContainText("A little high");
        await shot(page, label + "-3-measure");
      }
      const reading = Math.round(actual);
      await setSlider(page, $(page, "marker"), reading);
      await $(page, "record").click();
      await expect($(page, "live")).toContainText(reading + " mm recorded");
      row.push(reading);
    }
    readings.push(row);
    await expect($(page, "data-run").locator("tbody tr").first().locator("td").nth(trial)).toHaveText(String(readings[trial][0]));
  }
  await expect($(page, "start")).toHaveCount(0);
  await expect($(page, "panel").getByText(en("run-all-done"))).toBeVisible();
  return readings;
}

for (const [variable, control] of [["temperature", null], ["ph", 37]]) {
  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    test("enzyme-lab " + variable + " path, start to finish, at " + viewport.width + "x" + viewport.height, async ({page}) => {
      test.setTimeout(180000);
      const label = variable + "-" + size;
      await page.setViewportSize(viewport);
      await page.goto("/enzyme-lab/?seed=" + SEED);
      await expect(page).toHaveTitle("Enzyme Activity Lab | ZornScience");
      await expect(page.locator(".zsa-languages")).toHaveCount(0);
      await expect(page.locator("input[type=text], textarea, [contenteditable]")).toHaveCount(0);

      // 1. Hook
      await expect($(page, "next-bench")).toBeDisabled();
      await $(page, "pour").click();
      await expect($(page, "hook-observed")).toContainText("foams on the scrape");
      await choose(page, "hook-hook-choice-enzyme");
      await expect($(page, "panel").getByText(en("hook-science"))).toBeVisible();
      await shot(page, label + "-1-hook");
      await noSideScroll(page);
      await $(page, "next-bench").click();

      // 2. Bench, with the fair test checker catching problems first.
      await choose(page, "variable-" + variable);
      await $(page, "check-setup").click();
      await expect($(page, "fair-result")).toContainText("Not a fair test yet");
      await expect($(page, "fair-result")).toContainText("have no liver extract");
      const tubes = await setUp(page, variable, {control});
      // Unequal amounts: one extra drop in tube 2.
      await choose(page, "tool-extract"); await tap(page, 2);
      // Two variables: change the controlled variable in tube 4.
      await choose(page, variable === "temperature" ? "tool-buffer" : "tool-bath");
      await choose(page, variable === "temperature" ? "buffer-9" : "bath-55");
      await tap(page, 4);
      await $(page, "check-setup").click();
      const result = $(page, "fair-result");
      await expect(result).toContainText("The amounts of liver extract are different");
      await expect(result).toContainText(variable === "temperature" ? "The pH is not the same in every tube" : "The temperature is not the same in every tube");
      await expect(result).toContainText("If two things change, you cannot tell which one caused the difference.");
      await expect($(page, "next-run")).toBeDisabled();
      await shot(page, label + "-2-unfair");
      // Fix both problems.
      await choose(page, "tool-empty"); await tap(page, 2);
      await choose(page, "tool-extract"); await tap(page, 2, 2);
      await choose(page, "tool-peroxide"); await tap(page, 2, 2);
      await choose(page, variable === "temperature" ? "tool-buffer" : "tool-bath");
      await choose(page, variable === "temperature" ? "buffer-7" : "bath-" + (control || 20));
      await tap(page, 4);
      await $(page, "check-setup").click();
      await expect(result).toContainText("Fair test! Only the " + (variable === "temperature" ? "temperature" : "pH") + " changes.");
      await expect($(page, "next-run")).toBeDisabled();
      await choose(page, "predict-" + (variable === "temperature" ? 37 : 7));
      await expect($(page, "next-run")).toBeEnabled();
      await shot(page, label + "-2-fair");
      await noSideScroll(page);
      await $(page, "next-run").click();

      // 3 to 5. Run, measure three trials, and watch the table fill.
      const readings = await runAndMeasure(page, tubes, 3, label);
      const averages = [0, 1, 2, 3, 4].map(i => model.average(readings.map(r => r[i])));
      const rows = $(page, "data-run").locator("tbody tr");
      for (let i = 0; i < 5; i++) await expect(rows.nth(i).locator("td").last()).toHaveText(averages[i].toFixed(1));
      const best = model.LEVELS[variable][averages.indexOf(Math.max(...averages))];
      expect(best).toBe(variable === "temperature" ? 37 : 7);
      // Extreme heat or pH gives almost no foam; the cold end is low but not zero.
      if (variable === "temperature") { expect(averages[4]).toBeLessThan(3); expect(averages[0]).toBeGreaterThan(3); expect(averages[0]).toBeLessThan(averages[2] / 3); }
      else { expect(averages[0]).toBeLessThan(3); expect(averages[4]).toBeLessThan(3); }
      await shot(page, label + "-3-done");
      await noSideScroll(page);
      await $(page, "next-graph").click();

      // 6. Graph: place points, check them, choose the curve and mark the optimum.
      await setSlider(page, $(page, "point-0"), Math.round(averages[0]) + 9);
      for (let k = 1; k < 5; k++) await setSlider(page, $(page, "point-" + k), Math.round(averages[k]));
      await $(page, "graph-check").click();
      await expect($(page, "panel").getByText("4 of 5 points match")).toBeVisible();
      await setSlider(page, $(page, "point-0"), Math.round(averages[0]));
      await $(page, "graph-check").click();
      await expect($(page, "panel").getByText(en("graph-right"))).toBeVisible();
      await choose(page, "curve-straight");
      await expect($(page, "panel").getByText(en("curve-feedback-straight"))).toBeVisible();
      await choose(page, "curve-smooth");
      await expect(page.locator(".zsa-ez-graph path[stroke='#0f766e']")).toHaveCount(1);
      await choose(page, "optimum-" + model.LEVELS[variable][0]);
      await expect($(page, "panel").getByText("Look for the highest point")).toBeVisible();
      await choose(page, "optimum-" + best);
      await expect($(page, "panel").getByText("The optimum in your data is")).toBeVisible();
      await expect($(page, "panel").getByText("It matches your prediction")).toBeVisible();
      await expect(page.locator(".zsa-ez-graph").getByText("My prediction", {exact: true})).toBeVisible();
      await shot(page, label + "-4-graph");
      await noSideScroll(page);
      await $(page, "next-zoom").click();

      // 7. Zoom view: at the optimum, substrate binds and reacts; at an extreme the active site loses its shape.
      await expect.poll(async () => Number(((await $(page, "zoom-count").textContent()) || "").replace(/\D/g, "") || 0), {timeout: 20000}).toBeGreaterThan(0);
      await choose(page, "zoom-" + (variable === "temperature" ? "hot" : "acid"));
      await expect($(page, "zoom-caption")).toContainText(variable === "temperature" ? "Too much heat" : "Strong acid");
      await page.waitForTimeout(1500);
      await expect(page.locator(".zsa-ez-figure svg").getByText("Denatured")).toBeVisible();
      await shot(page, label + "-5-zoom");
      await $(page, "zoom-toggle").click();
      await expect($(page, "zoom-toggle")).toHaveText("Play animation");
      await noSideScroll(page);
      await $(page, "next-check").click();

      // 8. Check questions: a wrong answer, then the right ones.
      await choose(page, "q1-0");
      await expect($(page, "q1-feedback")).toContainText("Not yet");
      for (const [q, answer] of [["q1", 2], ["q2", 0], ["q3", 1], ["q4", 1]]) {
        await choose(page, q + "-" + answer);
        await expect($(page, q + "-feedback")).toContainText("Correct.");
      }
      await expect($(page, "score")).toHaveText("Correct so far: 4 of 4");
      await shot(page, label + "-6-check");
      await noSideScroll(page);
      await $(page, "next-copy").click();

      // 9. Copy my data.
      await $(page, "copy").click();
      await expect($(page, "copy-status")).toContainText("Copied");
      const copied = await page.evaluate(() => window.__copies[0]);
      const lines = copied.split("\n");
      expect(lines[0]).toBe("Enzyme Activity Lab: catalase and " + (variable === "temperature" ? "temperature" : "pH"));
      expect(lines).toContain("Variable tested\t" + (variable === "temperature" ? "Temperature (°C)" : "pH"));
      expect(lines).toContain("My hook prediction\t" + en("hook-choice-enzyme"));
      const unit = level => variable === "temperature" ? level + " °C" : "pH " + level;
      expect(lines).toContain("My predicted optimum\t" + unit(best));
      expect(lines).toContain("Optimum from my data\t" + unit(best));
      expect(lines).toContain((variable === "temperature" ? "Temperature (°C)" : "pH") + "\tTrial 1 (mm)\tTrial 2 (mm)\tTrial 3 (mm)\tAverage (mm)");
      model.LEVELS[variable].forEach((level, i) => {
        expect(lines).toContain([variable === "temperature" ? level + " °C" : "pH " + level].concat(readings.map(r => r[i]), [averages[i].toFixed(1)]).join("\t"));
      });
      expect(lines).toContain("Conclusion sentence starters");
      expect(lines.filter(l => /^[123]\. /.test(l))).toHaveLength(3);
      expect(copied).not.toMatch(/[–—]/);
      await shot(page, label + "-7-copy");
      await noSideScroll(page);
      if (size === "laptop") await audit(page);
    });
  }
}

test("enzyme-lab: repeated levels, the setup lock and reset are kind and lose nothing by accident", async ({page}) => {
  await page.goto("/enzyme-lab/?seed=" + SEED);
  await $(page, "step-bench").click();
  await setUp(page, "temperature");
  await choose(page, "tool-bath"); await choose(page, "bath-20"); await tap(page, 3);
  await $(page, "check-setup").click();
  await expect($(page, "fair-result")).toContainText("Tubes 2, 3 have the same temperature. Still missing: 37 °C.");
  await choose(page, "bath-37"); await tap(page, 3);
  await $(page, "check-setup").click();
  await choose(page, "predict-20");
  await $(page, "next-run").click();
  await $(page, "start").click(); await $(page, "skip").click();
  await $(page, "step-bench").click();
  await expect($(page, "tube-1")).toBeDisabled();
  await $(page, "change-setup").click();
  await $(page, "clear-no").click();
  await expect($(page, "tube-1")).toBeDisabled();
  await $(page, "change-setup").click();
  await $(page, "clear-yes").click();
  await expect($(page, "tube-1")).toBeEnabled();
  await $(page, "reset-open").click();
  await $(page, "reset-no").click();
  await expect($(page, "step-bench")).toHaveAttribute("aria-current", "step");
  await $(page, "reset-open").click();
  await $(page, "reset-yes").click();
  await expect($(page, "step-hook")).toHaveAttribute("aria-current", "step");
  await expect($(page, "next-bench")).toBeDisabled();
  await audit(page);
});

test("enzyme-lab: every step is reachable by keyboard and gated steps explain what to do", async ({page}) => {
  await page.goto("/enzyme-lab/?seed=" + SEED);
  for (const step of ["run", "graph", "copy"]) {
    await $(page, "step-" + step).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".zsa-ez-gate")).toBeVisible();
  }
  await $(page, "step-zoom").focus(); await page.keyboard.press("Enter");
  await expect($(page, "zoom-title")).toBeFocused();
  await $(page, "step-check").focus(); await page.keyboard.press("Enter");
  await $(page, "q2-0").focus(); await page.keyboard.press("Space");
  await expect($(page, "q2-feedback")).toContainText("Correct.");
});

test("enzyme-lab: reduced motion starts the zoom view paused and steps the foam", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/enzyme-lab/?seed=" + SEED);
  await $(page, "step-zoom").click();
  await expect($(page, "zoom-toggle")).toHaveText("Play animation");
  await expect($(page, "panel").getByText(en("zoom-reduced"))).toBeVisible();
  const before = await page.locator(".zsa-ez-figure svg").first().innerHTML();
  await page.waitForTimeout(600);
  expect(await page.locator(".zsa-ez-figure svg").first().innerHTML()).toBe(before);
  await choose(page, "zoom-hot");
  await expect(page.locator(".zsa-ez-figure svg").getByText("Does not fit")).toBeVisible();
});

test("enzyme-lab: Spanish is hidden behind the flag, complete and ready for review", async ({page}) => {
  expect(i18n.SPANISH_ENABLED).toBe(false);
  await page.goto("/enzyme-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("Enzyme Activity Lab");
  await page.goto("/enzyme-lab/?lang=es&es-review=1&seed=" + SEED);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.locator("h1")).toHaveText("Laboratorio de actividad enzimática");
  await expect(page.locator(".zsa-languages")).toHaveCount(0);
  for (const step of ["bench", "zoom", "check"]) {
    await $(page, "step-" + step).click();
    await expect($(page, step + "-title")).toHaveText(i18n.STRINGS[step === "bench" ? "bench-title" : step === "zoom" ? "zoom-title" : "check-title"].es);
  }
});

test("enzyme-lab: the clipboard fallback selects the data on the page", async ({page}) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {configurable: true, value: undefined}));
  await page.goto("/enzyme-lab/?seed=" + SEED);
  await $(page, "step-bench").click();
  await setUp(page, "temperature");
  await $(page, "check-setup").click();
  await choose(page, "predict-37");
  await $(page, "next-run").click();
  await $(page, "start").click(); await $(page, "skip").click();
  await $(page, "step-copy").click();
  await $(page, "copy").click();
  await expect($(page, "copy-text")).toBeVisible();
  await expect($(page, "copy-text")).toContainText("Temperature (°C)\tTrial 1 (mm)");
  expect(await page.evaluate(() => getSelection().toString())).toContain("Conclusion sentence starters");
});
