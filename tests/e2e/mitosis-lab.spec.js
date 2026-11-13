// Mitosis Detective in the browser: the whole flow (wrong zones, microscope, keyboard tally, analysis, drag and drop,
// questions, copy), phone and laptop layouts, axe-core, the Spanish preview behind its flag, reduced motion, frame rate
// under a 4x CPU slowdown, the tour, the cell guide, start over, embed mode and links. Expected values come from
// mitosis-lab/model.js with a pinned seed, and every step fails on any console error, outside request or storage use.
"use strict";
const fs = require("node:fs");
const {test, expect} = require("@playwright/test");
const model = require("../../mitosis-lab/model.js");
const data = require("../../mitosis-lab/data.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const SEED = 1, sample = model.sample(SEED), sum = model.summarize(sample.fields.map(f => f.counts));
const en = data.translator("en"), es = data.translator("es");
const pct = v => v.toFixed(1);

test.beforeEach(async ({page}) => {
  page.__problems = [];
  page.on("pageerror", e => page.__problems.push("page error: " + e.message));
  page.on("console", m => { if (["error", "warning"].includes(m.type())) page.__problems.push(m.type() + ": " + m.text()); });
  page.on("request", r => { const u = r.url(); if (!/^http:\/\/127\.0\.0\.1:\d+\//.test(u) && !u.startsWith("data:")) page.__problems.push("outside request: " + u); });
  await page.addInitScript(() => {
    window.__copies = [];
    document.addEventListener("securitypolicyviolation", e => console.error("CSP violation: " + e.violatedDirective));
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async text => { window.__copies.push(text); }, readText: () => { throw new Error("Clipboard read"); }}});
    for (const name of ["getItem", "setItem", "removeItem", "clear"]) Storage.prototype[name] = () => { throw new Error("Storage used"); };
  });
});
test.afterEach(async ({page}) => { expect(page.__problems).toEqual([]); });

async function open(page, query = "") { await page.goto("/mitosis-lab/?seed=" + SEED + "&tour=0" + query); }
const next = page => page.locator("#zsa-mt-next");
const title = page => page.locator("#zsa-mt-screen-title");
async function predict(page, t = en) {
  await page.getByRole("radio", {name: t("predict.a")}).check();
  await expect(next(page)).toHaveAttribute("aria-disabled", "false");
  await next(page).click();
}
async function chooseSample(page) {
  await page.locator('[data-zone="meristem"]').click();
  await next(page).click();
}
async function sharpen(page) {
  await page.locator("#zsa-mt-auto").click();
  await expect(page.locator("#zsa-mt-focus")).toHaveAttribute("aria-valuetext", /(Sharp|Nítido)$/);
}
async function highPower(page) {
  await sharpen(page);
  await page.locator('input[name="zsa-mt-power"][value="high"]').check();
  await sharpen(page);
  await expect(page.locator("[data-cell]").first()).toBeVisible();
}
async function closeSheet(page) {
  const close = page.locator("#zsa-mt-inspect").getByRole("button", {name: /^(Close cell view|Cerrar la vista de la célula)$/});
  if (await close.isVisible()) await close.click();
}
async function identify(page, id, phase) {
  await page.locator('[data-cell="' + id + '"]').click();
  await page.locator('#zsa-mt-inspect [data-phase="' + phase + '"]').click();
  await closeSheet(page);
}
function targets(field) {
  const dividing = field.countable.filter(id => field.cells[id].phase !== "interphase");
  const interphase = field.countable.filter(id => field.cells[id].phase === "interphase").slice(0, model.INTERPHASE_GOAL);
  return dividing.concat(interphase);
}
async function finishField(page, f) {
  const field = sample.fields[f];
  for (const id of targets(field)) await identify(page, id, field.cells[id].phase);
  await page.locator("#zsa-mt-rest").click();
}
async function finishScope(page) {
  await highPower(page);
  for (let f = 0; f < 3; f++) {
    await finishField(page, f);
    if (f < 2) { await page.locator("#zsa-mt-move").click(); await sharpen(page); }
  }
}
async function finishAnalysis(page) {
  await page.locator('[data-phase="interphase"]').first().click();
  await page.locator('fieldset').nth(1).locator('[data-phase="' + sum.least[0] + '"]').click();
  for (const p of model.DIVIDING) {
    const card = page.locator('[data-card="' + p + '"]');
    if (!(await card.count())) continue;
    if ((await card.getAttribute("aria-pressed")) !== "true") await card.click();
    const slot = page.locator('[data-target="' + p + '"]');
    await (await slot.count() ? slot : page.locator('[data-target="' + model.DIVIDING.find(q => q !== p && sum.minutes[q] === sum.minutes[p]) + '"]')).click();
  }
}
async function finishCheck(page) {
  for (let q = 0; q < data.QUIZ.length; q++) {
    await page.locator('[data-choice="' + data.QUIZ[q].correct + '"]').click();
    if (q < data.QUIZ.length - 1) await page.locator("#zsa-mt-quiz-next").click();
  }
}
function expectedCopy(t) {
  const rows = [[t("app.title")], [], [t("table.phase"), t("table.field", {n: 1}), t("table.field", {n: 2}), t("table.field", {n: 3}), t("table.total"), t("table.percent"), t("table.minutes")]];
  model.PHASES.forEach(p => rows.push([t("phase." + p), sample.fields[0].counts[p], sample.fields[1].counts[p], sample.fields[2].counts[p], sum.total[p], pct(sum.percent[p]) + "%", sum.minutes[p]]));
  rows.push([t("table.all"), ...sum.fieldTotals, sum.n, "100%", sum.minutesSum], [], [t("copy.cells"), sum.n], [t("copy.cycle"), t("copy.cycleValue")],
    [t("copy.prediction"), t("predict.a")], [t("copy.most"), t("phase.interphase")], [t("copy.least"), t("phase." + sum.least[0])], [], [t("copy.starters")],
    ["1. " + t("starter.1")], ["2. " + t("starter.2")], ["3. " + t("starter.3")]);
  return rows.map(r => r.join("\t")).join("\n");
}
async function audit(page, label) {
  await page.waitForTimeout(400); // let color transitions finish
  await page.evaluate(AXE);
  const result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map(v => label + ": " + v.id + " " + v.nodes.slice(0, 4).map(n => n.target.join(" ")).join(", "))).toEqual([]);
}
async function layoutCheck(page, label) {
  const report = await page.evaluate(() => {
    const out = [];
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth) out.push("sideways scroll " + (document.documentElement.scrollWidth - document.documentElement.clientWidth) + "px");
    document.querySelectorAll("#zsa-mt-bar button, #zsa-mt-screen button, #zsa-mt-screen label, #zsa-mt-screen summary, #zsa-mt-action button, #zsa-mt-inspect button").forEach(e => {
      // Cells are tiled tap areas checked separately; a range input's text label is not its target.
      if (e.matches("[data-cell]") || (e.control && e.control.type === "range")) return;
      const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      if (!r.width || s.visibility === "hidden") return;
      if (r.height < 43.5 || r.width < 43.5) out.push("small target " + (e.id || e.getAttribute("data-phase") || e.textContent.trim().slice(0, 30)) + " " + Math.round(r.width) + "x" + Math.round(r.height));
      if (r.right > document.documentElement.clientWidth + 1 || r.left < -1) out.push("off screen " + (e.id || e.textContent.trim().slice(0, 30)));
    });
    return out;
  });
  expect(report, label).toEqual([]);
}

test("mitosis: the whole lab in English, with wrong zones, a keyboard tally, drag and drop and the copied data", async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await open(page);
  await expect(page).toHaveTitle(en("app.title") + " | ZornScience");
  await expect(page.locator("#zsa-mt-tour")).toBeHidden();
  // Step 1: Next explains what is missing instead of moving on.
  await expect(title(page)).toHaveText(en("predict.title"));
  await expect(next(page)).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#zsa-mt-hint")).toHaveText(en("predict.need"));
  await next(page).focus();
  await page.keyboard.press("Enter");
  await expect(title(page)).toHaveText(en("predict.title"));
  await expect(page.locator("#zsa-mt-live")).toHaveText(en("predict.need"));
  await expect(page.getByRole("img", {name: en("predict.figure")})).toBeVisible();
  await predict(page);
  // Step 2: every wrong zone shows a field with almost no division and a kind way back.
  await expect(title(page)).toHaveText(en("sample.title"));
  for (const zone of ["cap", "elongation", "mature"]) {
    await page.locator('[data-zone="' + zone + '"]').click();
    const look = model.zoneField(SEED, zone), dividing = look.countable.length - look.counts.interphase;
    await expect(page.locator("#zsa-mt-look-result")).toHaveText(en("sampleResult." + zone));
    await expect(page.getByText(en("sample.count").replace("{count}", dividing).replace("{total}", look.countable.length))).toBeVisible();
    await expect(page.getByRole("img", {name: en("sample.lookLabel").replace("{zone}", en("zone." + zone))})).toBeVisible();
    await expect(page.getByRole("button", {name: en("sample.retry")})).toBeVisible();
    await expect(next(page)).toHaveAttribute("aria-disabled", "true");
    await expect(page.locator('[data-zone="' + zone + '"]')).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", {name: en("sample.retry")}).click();
  await expect(page.locator('[data-zone="meristem"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-mt-look-result")).toHaveText("✓ " + en("sampleResult.meristem"));
  const firstDividing = sample.fields[0].countable.length - sample.fields[0].counts.interphase;
  await expect(page.getByText("Cells with visible chromosomes: " + firstDividing + " of " + sample.fields[0].countable.length)).toBeVisible();
  await expect(next(page)).toHaveAttribute("aria-disabled", "false");
  await next(page).click();
  // Step 3: cells cannot be picked until the view is sharp at high power.
  await expect(title(page)).toHaveText(en("scope.title"));
  const slider = page.locator("#zsa-mt-focus");
  await expect(slider).toHaveAttribute("aria-valuetext", /Blurry$/);
  await expect(page.locator("[data-cell]").first()).toBeHidden();
  await page.getByRole("img", {name: /^Microscope view, field 1 of 3, low power/}).click();
  await expect(page.locator("#zsa-mt-live")).toHaveText(en("inspect.notSharp"));
  await sharpen(page);
  await expect(page.locator("#zsa-mt-scope-message")).toHaveText(en("scope.msgSwitch"));
  // Keyboard: arrow from low to high power, then focus with the arrow keys.
  await page.locator('input[name="zsa-mt-power"][value="low"]').focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('input[name="zsa-mt-power"][value="high"]')).toBeChecked();
  await expect(page.locator("#zsa-mt-scope-message")).toHaveText(en("scope.msgFocusHigh"));
  const target = model.focusTarget(SEED, 0, "high"), now = Number(await slider.inputValue());
  await slider.focus();
  for (let i = 0; i < Math.abs(target - now); i++) await page.keyboard.press(target > now ? "ArrowRight" : "ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuetext", target + " of 100, Sharp");
  await expect(page.locator("[data-cell]")).toHaveCount(sample.fields[0].countable.length);
  // One Tab stop for the cells, and the arrow keys move to the neighbor the model picks.
  const field = sample.fields[0], first = field.countable[0];
  await expect(page.locator('[data-cell][tabindex="0"]')).toHaveCount(1);
  await page.locator('[data-cell="' + first + '"]').focus();
  await page.keyboard.press("ArrowRight");
  const right = model.neighbor(field.cells, field.countable, first, "right");
  await expect(page.locator('[data-cell="' + right + '"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-cell="' + model.neighbor(field.cells, field.countable, right, "down") + '"]')).toBeFocused();
  // Field 1 by keyboard: two wrong answers on the first dividing cell bring hints and then Show me.
  const list = targets(field), tricky = list[0], actual = field.cells[tricky].phase;
  const wrong = model.PHASES.filter(p => p !== actual).slice(0, 2);
  await page.locator('[data-cell="' + tricky + '"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-mt-inspect-title")).toBeFocused();
  await expect(page.locator("#zsa-mt-inspect-title")).toHaveText("Cell " + (field.countable.indexOf(tricky) + 1));
  for (const pick of wrong) {
    await page.locator('#zsa-mt-inspect [data-phase="' + pick + '"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#zsa-mt-feedback")).toHaveText("Not quite. " + en("looks." + pick) + " " + en("lookFor." + actual));
    await expect(page.locator('#zsa-mt-inspect [data-phase="' + pick + '"]')).toHaveAttribute("aria-disabled", "true");
  }
  // Pressing a locked wrong pick again changes nothing.
  await page.locator('#zsa-mt-inspect [data-phase="' + wrong[0] + '"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-mt-feedback")).toContainText(en("looks." + wrong[1]));
  await page.getByRole("button", {name: en("inspect.showMe")}).click();
  await expect(page.locator("#zsa-mt-feedback")).toHaveText(en("inspect.shown").replace("{phase}", en("phase." + actual)).replace("{why}", en("why." + actual)));
  await expect(page.locator('[data-cell="' + tricky + '"]')).toHaveAttribute("aria-label", "Cell " + (field.countable.indexOf(tricky) + 1) + ", " + en("phase." + actual));
  for (const id of list.slice(1)) {
    await page.locator('[data-cell="' + id + '"]').focus();
    await page.keyboard.press("Enter");
    await page.locator('#zsa-mt-inspect [data-phase="' + field.cells[id].phase + '"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#zsa-mt-feedback")).toHaveText("✓ Correct: " + en("phase." + field.cells[id].phase) + ". " + en("why." + field.cells[id].phase));
  }
  await expect(page.getByText("Find all " + (field.countable.length - field.counts.interphase) + " dividing cells: " + (field.countable.length - field.counts.interphase) + " found")).toBeVisible();
  const rest = field.countable.length - list.length;
  await page.getByRole("button", {name: "Count the other " + rest + " cells as interphase"}).click();
  await expect(page.locator("#zsa-mt-live")).toHaveText(en("scope.restDone").replace("{n}", 1).replace("{count}", rest));
  for (const p of model.PHASES) {
    await expect(page.getByRole("table", {name: "My tally, field 1"}).getByRole("row", {name: new RegExp("^" + en("phase." + p))})).toHaveText(en("phase." + p) + field.counts[p] + field.counts[p]);
  }
  await expect(page.locator("#zsa-mt-move")).toBeFocused();
  // Fields 2 and 3 by mouse.
  for (let f = 1; f < 3; f++) {
    await page.locator("#zsa-mt-move").click();
    await expect(page.getByText("Field " + (f + 1) + " of 3", {exact: true})).toBeVisible();
    await sharpen(page);
    await finishField(page, f);
  }
  await expect(page.getByText(en("scope.allDone"))).toBeVisible();
  await expect(page.locator("#zsa-mt-hint")).toHaveText(en("scope.ready"));
  await next(page).click();
  // Step 4: the table, most and least, minutes and the wheel.
  await expect(title(page)).toHaveText(en("analyze.title"));
  const table = page.getByRole("table", {name: en("analyze.caption")});
  for (const p of model.PHASES) {
    const cells = table.getByRole("row", {name: new RegExp("^" + en("phase." + p))}).getByRole("cell");
    await expect(cells).toHaveText([String(sample.fields[0].counts[p]), String(sample.fields[1].counts[p]), String(sample.fields[2].counts[p]), String(sum.total[p]), pct(sum.percent[p]) + "%"]);
  }
  await expect(table.getByRole("row", {name: /^All phases/}).getByRole("cell")).toHaveText([...sum.fieldTotals.map(String), String(sum.n), "100%"]);
  const most = page.locator("fieldset").nth(0), least = page.locator("fieldset").nth(1);
  await most.locator('[data-phase="prophase"]').click();
  await expect(page.locator("#zsa-mt-live")).toHaveText(en("analyze.mostWrong"));
  await most.locator('[data-phase="interphase"]').click();
  await expect(page.locator("#zsa-mt-live")).toHaveText("✓ " + en("analyze.mostRight").replace("{phase}", "Interphase").replace("{percent}", pct(sum.percent.interphase)));
  await least.locator('[data-phase="' + sum.least[0] + '"]').click();
  await expect(page.getByText(en("time.example").replace("{phase}", "Interphase").replace(/\{percent\}/g, pct(sum.percent.interphase)).replace("{minutes}", model.groupDigits(sum.minutes.interphase)))).toBeVisible();
  // A real drag with the mouse places the prophase card.
  const card = page.locator('[data-card="prophase"]'), slot = page.locator('[data-target="prophase"]');
  await page.getByText(en("time.instructions")).evaluate(e => e.scrollIntoView({block: "start"}));
  await expect(card).toBeInViewport();
  await expect(slot).toBeInViewport();
  const a = await card.boundingBox(), b = await slot.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + 40, a.y + 30, {steps: 4});
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, {steps: 8});
  await page.mouse.up();
  await expect(page.locator('[data-card="prophase"]')).toHaveCount(0);
  await expect(page.locator("#zsa-mt-time-feedback")).toHaveText("✓ " + en("time.right").replace("{phase}", "Prophase").replace("{minutes}", String(sum.minutes.prophase)));
  // Tap, then a wrong phase: a hint, and the card stays picked up.
  await page.locator('[data-card="metaphase"]').click();
  await expect(page.locator('[data-card="metaphase"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('[data-target="anaphase"]').click();
  if (sum.minutes.metaphase !== sum.minutes.anaphase) {
    await expect(page.locator("#zsa-mt-time-feedback")).toHaveText(en("time.wrong").replace("{phase}", "Anaphase").replace("{percent}", pct(sum.percent.anaphase)));
    await expect(page.locator('[data-card="metaphase"]')).toHaveAttribute("aria-pressed", "true");
  }
  await expect(page.getByRole("img", {name: /^Cell cycle wheel/})).toHaveCount(0);
  await finishAnalysis(page);
  const wheel = page.getByRole("img", {name: /^Cell cycle wheel from your data/});
  await expect(wheel).toBeVisible();
  for (const p of model.PHASES) await expect(wheel).toHaveAccessibleName(new RegExp(en("phase." + p) + " " + model.groupDigits(sum.minutes[p]) + " minutes"));
  await expect(next(page)).toHaveAttribute("aria-disabled", "false");
  await next(page).click();
  // Step 5: five questions, a hint first, then the explanation.
  await expect(title(page)).toHaveText(en("check.title"));
  await expect(page.getByRole("img", {name: /^A cell from an onion root tip/})).toBeVisible();
  for (let q = 0; q < 5; q++) {
    const quiz = data.QUIZ[q], miss = quiz.correct === 0 ? 1 : 0;
    await expect(page.getByText("Question " + (q + 1) + " of 5")).toBeVisible();
    await page.locator('[data-choice="' + miss + '"]').click();
    await expect(page.locator("#zsa-mt-live")).toHaveText("Not quite. " + en(quiz.id + ".hint") + " Try another answer.");
    await page.locator('[data-choice="' + quiz.correct + '"]').click();
    await expect(page.locator("#zsa-mt-live")).toHaveText("✓ Correct. " + en(quiz.id + ".explanation"));
    if (q < 4) await page.locator("#zsa-mt-quiz-next").click();
  }
  await expect(page.getByText("✓ " + en("check.done"))).toBeVisible();
  await next(page).click();
  // Step 6: the copied text is the table, percents, minutes, prediction and three sentence starters, tab-separated.
  await expect(title(page)).toHaveText(en("copy.title"));
  await expect(next(page)).toBeHidden();
  await page.getByRole("button", {name: en("copy.button")}).click();
  await expect(page.locator("#zsa-mt-copy-status")).toHaveText("✓ " + en("copy.done"));
  expect(await page.evaluate(() => window.__copies)).toEqual([expectedCopy(en)]);
  // Every step is done and can be revisited from the tracker.
  const progress = page.getByRole("navigation", {name: en("nav.progress")});
  await expect(progress.getByText("✓")).toHaveCount(5);
  await progress.getByRole("button", {name: /^Microscope\s?, done$/}).click();
  await expect(title(page)).toHaveText(en("scope.title"));
  await expect(page.getByText(en("scope.allDone"))).toBeVisible();
});

test("mitosis: a phone walk-through fits 360 px, and the cell sheet keeps choices and feedback in view", async ({page}) => {
  await page.setViewportSize({width: 360, height: 640});
  await open(page);
  await layoutCheck(page, "predict");
  await predict(page);
  await page.locator('[data-zone="cap"]').click();
  // On a phone the quick look is below the root, so focus moves to it.
  await expect(page.locator("#zsa-mt-look-title")).toBeFocused();
  await expect(page.locator("#zsa-mt-look-title")).toBeInViewport();
  await layoutCheck(page, "sample");
  await page.locator('[data-zone="meristem"]').click();
  await next(page).click();
  await highPower(page);
  await layoutCheck(page, "microscope");
  const eye = await page.getByRole("img", {name: /^Microscope view/}).boundingBox();
  expect(eye.width).toBeGreaterThan(330);
  const sizes = await page.locator("[data-cell]").evaluateAll(cells => cells.map(c => { const r = c.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  test.info().annotations.push({type: "cell tiles at 360 px", description: "smallest " + Math.min(...sizes).toFixed(1) + " px, median " + sizes.sort((x, y) => x - y)[sizes.length >> 1].toFixed(1) + " px"});
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(24);
  const field = sample.fields[0], id = targets(field)[0], actual = field.cells[id].phase, wrong = model.PHASES.find(p => p !== actual);
  await page.locator('[data-cell="' + id + '"]').click();
  const sheet = page.locator("#zsa-mt-inspect");
  await expect(sheet).toBeVisible();
  for (const p of model.PHASES) await expect(sheet.locator('[data-phase="' + p + '"]')).toBeInViewport();
  await sheet.locator('[data-phase="' + wrong + '"]').click();
  await expect(page.locator("#zsa-mt-feedback")).toBeInViewport();
  await layoutCheck(page, "cell sheet");
  await sheet.locator('[data-phase="' + actual + '"]').click();
  // A correct answer closes the sheet by itself and returns focus to the cell.
  await expect(sheet).toBeHidden({timeout: 4000});
  await expect(page.locator('[data-cell="' + id + '"]')).toBeFocused();
  for (const cell of targets(field).slice(1)) await identify(page, cell, field.cells[cell].phase);
  await page.locator("#zsa-mt-rest").click();
  for (let f = 1; f < 3; f++) { await page.locator("#zsa-mt-move").click(); await sharpen(page); await finishField(page, f); }
  await next(page).click();
  await layoutCheck(page, "analyze");
  // The phone table keeps Total and Percent in view and lists the fields under each phase.
  await expect(page.getByText("Fields: " + sample.fields.map(f => f.counts.interphase).join(" + "))).toBeVisible();
  await finishAnalysis(page);
  await layoutCheck(page, "analyze done");
  await next(page).click();
  await layoutCheck(page, "check");
  await finishCheck(page);
  await next(page).click();
  await layoutCheck(page, "copy");
  await page.getByRole("button", {name: en("copy.button")}).click();
  expect(await page.evaluate(() => window.__copies)).toEqual([expectedCopy(en)]);
});

test("mitosis: laptop layout at 1366 by 768 on every step", async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await open(page);
  await layoutCheck(page, "predict");
  await predict(page);
  await page.locator('[data-zone="elongation"]').click();
  await layoutCheck(page, "sample");
  await chooseSample(page);
  await highPower(page);
  await page.locator("[data-cell]").first().click();
  await layoutCheck(page, "microscope");
  // On a laptop the eyepiece and the cell panel sit side by side.
  const eye = await page.getByRole("img", {name: /^Microscope view/}).boundingBox(), panel = await page.locator("#zsa-mt-inspect").boundingBox();
  expect(panel.x).toBeGreaterThan(eye.x + eye.width);
  await finishScopeFromHere(page);
  await layoutCheck(page, "analyze");
  await finishAnalysis(page);
  await next(page).click();
  await layoutCheck(page, "check");
  await finishCheck(page);
  await next(page).click();
  await layoutCheck(page, "copy");
});
async function finishScopeFromHere(page) {
  for (let f = 0; f < 3; f++) {
    await finishField(page, f);
    if (f < 2) { await page.locator("#zsa-mt-move").click(); await sharpen(page); }
  }
  await next(page).click();
}

for (const size of [{width: 1366, height: 768}, {width: 360, height: 640}]) {
  test("mitosis: axe finds no violations in each step at " + size.width + " px", async ({page}) => {
    await page.setViewportSize(size);
    await page.goto("/mitosis-lab/?seed=" + SEED);
    await audit(page, "tour");
    await page.getByRole("button", {name: en("tour.skip")}).click();
    await predict(page);
    await page.locator('[data-zone="cap"]').click();
    await audit(page, "wrong zone");
    await chooseSample(page);
    await audit(page, "low power");
    await highPower(page);
    await page.locator("[data-cell]").first().click();
    await audit(page, "cell view");
    await closeSheet(page);
    await finishScopeFromHere(page);
    await finishAnalysis(page);
    await audit(page, "analysis with wheel");
    await next(page).click();
    await page.locator('[data-choice="0"]').click();
    await audit(page, "question");
    await finishCheck(page);
    await next(page).click();
    await page.getByRole("button", {name: en("copy.button")}).click();
    await audit(page, "copy");
    await page.getByRole("button", {name: en("tools.guide")}).click();
    await audit(page, "cell guide");
    await page.keyboard.press("Escape");
    await page.getByRole("button", {name: en("tools.reset")}).click();
    await audit(page, "start over");
  });
}

test("mitosis: Spanish is written but hidden behind its flag, and ?lang=es previews it", async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await open(page);
  await expect(page.getByRole("link", {name: "ES Español"})).toBeHidden();
  await open(page, "&lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle(es("app.title") + " | ZornScience");
  await expect(page.getByRole("heading", {level: 1})).toHaveText(es("app.title"));
  // The toggle exists for the shared header but stays hidden until FLAGS.spanishToggle is true.
  await expect(page.getByRole("link", {name: "ES Español"})).toBeHidden();
  await expect(page.locator("#zsa-mt-back")).toHaveAttribute("href", "https://zornscience.org/es/science/biology/");
  const english = /\b(Next|Back|Cell guide|Start over|Predict|Sample|Microscope|Analyze|Check|Copy|Interphase|Prophase|Metaphase|Anaphase|Telophase|Field|Focus|Sharp|Blurry|Instructions|Share|Tip|Day|cells?|the|your)\b/;
  const visibleText = () => page.locator("main").evaluate(main => {
    const parts = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) { const n = walker.currentNode; if (!n.parentElement.closest("script, style, noscript, [hidden], dialog:not([open]), footer")) parts.push(n.textContent); }
    main.querySelectorAll("[aria-label], title").forEach(e => parts.push(e.getAttribute("aria-label") || e.textContent));
    return parts.join("\n").replace(/ZornScience|CC BY-NC-SA 4\.0/g, "");
  });
  expect(await visibleText()).not.toMatch(english);
  await predict(page, es);
  await page.locator('[data-zone="mature"]').click();
  await expect(page.locator("#zsa-mt-look-result")).toHaveText(es("sampleResult.mature"));
  await chooseSample(page);
  await highPower(page);
  const field = sample.fields[0], id = targets(field)[0];
  await page.locator('[data-cell="' + id + '"]').click();
  await page.locator('#zsa-mt-inspect [data-phase="' + field.cells[id].phase + '"]').click();
  await expect(page.locator("#zsa-mt-feedback")).toHaveText("✓ " + es("inspect.correct", {phase: es("phase." + field.cells[id].phase), why: es("why." + field.cells[id].phase)}));
  expect(await visibleText()).not.toMatch(english);
  for (const cell of targets(field).slice(1)) await identify(page, cell, field.cells[cell].phase);
  await page.locator("#zsa-mt-rest").click();
  for (let f = 1; f < 3; f++) { await page.locator("#zsa-mt-move").click(); await sharpen(page); await finishField(page, f); }
  await next(page).click();
  await finishAnalysis(page);
  expect(await visibleText()).not.toMatch(english);
  await next(page).click();
  await finishCheck(page);
  await next(page).click();
  await page.getByRole("button", {name: es("copy.button")}).click();
  expect(await page.evaluate(() => window.__copies)).toEqual([expectedCopy(es)]);
  expect(await visibleText()).not.toMatch(english);
});

test("mitosis: zoom and focus hold their frame rate on a 4x slower CPU", async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await open(page);
  await predict(page);
  await chooseSample(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 4});
  const measure = action => page.evaluate(action => new Promise(resolve => {
    const times = [];
    const slider = document.getElementById("zsa-mt-focus");
    let value = 0;
    function frame(time) {
      times.push(time);
      if (action === "sweep") { value = (value + 3) % 100; slider.value = String(value); slider.dispatchEvent(new Event("input", {bubbles: true})); }
      if (time - times[0] < 1200) requestAnimationFrame(frame);
      else {
        const gaps = times.slice(1).map((t, i) => t - times[i]);
        resolve({fps: gaps.length / ((times[times.length - 1] - times[0]) / 1000), worst: Math.max(...gaps)});
      }
    }
    requestAnimationFrame(t => {
      times.push(t);
      if (action === "zoom") document.querySelector('input[name="zsa-mt-power"][value="high"]').click();
      if (action === "zoomOut") document.querySelector('input[name="zsa-mt-power"][value="low"]').click();
      if (action === "auto") document.getElementById("zsa-mt-auto").click();
      requestAnimationFrame(frame);
    });
  }), action);
  const results = {};
  results.auto = await measure("auto");
  results.zoom = await measure("zoom");
  results.zoomOut = await measure("zoomOut");
  results.sweep = await measure("sweep");
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 1});
  test.info().annotations.push({type: "fps at 4x slowdown", description: Object.entries(results).map(([k, v]) => k + " " + v.fps.toFixed(1) + " fps, worst frame " + v.worst.toFixed(0) + " ms").join("; ")});
  Object.values(results).forEach(r => expect(r.fps).toBeGreaterThan(30));
});

test("mitosis: reduced motion makes changes instant and stops the moving marker", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.setViewportSize({width: 1366, height: 768});
  await open(page);
  await predict(page);
  await chooseSample(page);
  await page.locator('input[name="zsa-mt-power"][value="high"]').check();
  expect(await page.locator('input[name="zsa-mt-power"][value="high"]').evaluate(input => {
    const layer = input.closest("#zsa-mt-screen").querySelector("canvas").parentElement;
    return getComputedStyle(layer).transitionDuration.split(",").every(d => parseFloat(d) === 0);
  })).toBe(true);
  await page.locator('input[name="zsa-mt-power"][value="low"]').check();
  await highPower(page);
  await finishScopeFromHere(page);
  await finishAnalysis(page);
  await expect(page.getByRole("button", {name: en("wheel.replay")})).toBeHidden();
  await page.getByRole("button", {name: en("tools.guide")}).click();
  await expect(page.getByRole("button", {name: en("guide.play")})).toBeVisible();
  const before = await page.locator("#zsa-mt-guide-canvas").getAttribute("aria-label");
  await page.waitForTimeout(600);
  await expect(page.locator("#zsa-mt-guide-canvas")).toHaveAttribute("aria-label", before);
  await page.getByRole("button", {name: en("guide.next")}).click();
  await expect(page.locator("#zsa-mt-guide-canvas")).toHaveAttribute("aria-label", en("guide.canvas").replace("{phase}", "Prophase"));
});

test("mitosis: the tour, the cell guide, start over, embed mode and lesson links", async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await page.goto("/mitosis-lab/?seed=" + SEED);
  const tour = page.getByRole("complementary", {name: en("tour.1.title")});
  await expect(tour).toBeVisible();
  await expect(page.getByText("Tip 1 of 4")).toBeVisible();
  for (let n = 2; n <= 4; n++) {
    await page.getByRole("button", {name: en("tour.next")}).click();
    await expect(page.getByText("Tip " + n + " of 4")).toBeVisible();
    await expect(page.getByRole("complementary", {name: en("tour." + n + ".title")})).toBeVisible();
  }
  await page.getByRole("button", {name: en("tour.done")}).click();
  await expect(page.locator("#zsa-mt-tour")).toBeHidden();
  await expect(title(page)).toBeFocused();
  // The tour comes back from Instructions, and Escape closes it.
  await page.getByRole("button", {name: "Instructions", exact: true}).click();
  await page.getByRole("button", {name: en("help.tour")}).click();
  await expect(page.getByText("Tip 1 of 4")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#zsa-mt-tour")).toBeHidden();
  // The cell guide: five labeled diagrams and an animated cell, with focus returned on close.
  const guideButton = page.getByRole("button", {name: en("tools.guide")});
  await guideButton.click();
  const guide = page.getByRole("dialog", {name: en("guide.title")});
  await expect(guide).toBeVisible();
  for (const p of model.PHASES) {
    await expect(guide.getByRole("heading", {name: en("phase." + p), exact: true})).toBeVisible();
    await expect(guide.getByRole("img", {name: en("guide.diagram").replace("{phase}", en("phase." + p))})).toBeVisible();
  }
  await expect(guide.getByRole("button", {name: en("guide.pause")})).toBeVisible();
  await expect(page.locator("#zsa-mt-guide-canvas")).not.toHaveAttribute("aria-label", en("guide.canvas").replace("{phase}", "Interphase"), {timeout: 8000});
  await guide.getByRole("button", {name: en("guide.close")}).click();
  await expect(guideButton).toBeFocused();
  // Start over: Keep working changes nothing; Yes clears the prediction.
  await predict(page);
  await page.getByRole("button", {name: en("tools.reset")}).click();
  await page.getByRole("button", {name: en("reset.cancel")}).click();
  await expect(title(page)).toHaveText(en("sample.title"));
  await page.getByRole("button", {name: en("tools.reset")}).click();
  await page.getByRole("button", {name: en("reset.confirm")}).click();
  await expect(title(page)).toHaveText(en("predict.title"));
  await expect(page.getByRole("radio", {name: en("predict.a")})).not.toBeChecked();
  await expect(page.locator("#zsa-mt-live")).toHaveText(en("reset.done"));
  // Lesson links: the Biology course by default, a zornscience.org lesson from ?from=, nothing else.
  await expect(page.locator("#zsa-mt-back")).toHaveAttribute("href", "https://zornscience.org/science/biology/");
  await page.goto("/mitosis-lab/?from=" + encodeURIComponent("https://zornscience.org/science/biology/cells/"));
  await expect(page.locator("#zsa-mt-back")).toHaveAttribute("href", "https://zornscience.org/science/biology/cells/");
  for (const bad of ["https://evil.example/", "http://zornscience.org/x/", "javascript:alert(1)", "https://zornscience.org.evil.example/"]) {
    await page.goto("/mitosis-lab/?from=" + encodeURIComponent(bad));
    await expect(page.locator("#zsa-mt-back")).toHaveAttribute("href", "https://zornscience.org/science/biology/");
  }
  // Embed mode hides the site chrome and the tour.
  await page.goto("/mitosis-lab/?embed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  for (const el of await page.locator("[data-zsa-chrome]").all()) await expect(el).toBeHidden();
  await expect(page.locator("#zsa-mt-tour")).toBeHidden();
  await expect(title(page)).toHaveText(en("predict.title"));
});

test("mitosis: copying falls back to selected text, and the page has no typing fields", async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await open(page);
  expect(await page.locator("#zsa-mt-screen textarea, #zsa-mt-screen input[type=text], #zsa-mt-screen [contenteditable]").count()).toBe(0);
  await predict(page);
  await chooseSample(page);
  await highPower(page);
  await finishScopeFromHere(page);
  await finishAnalysis(page);
  await next(page).click();
  await finishCheck(page);
  await next(page).click();
  expect(await page.locator("textarea, [contenteditable]").count()).toBe(0);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: () => Promise.reject(new Error("blocked"))}}));
  await page.getByRole("button", {name: en("copy.button")}).click();
  await expect(page.locator("#zsa-mt-copy-status")).toHaveText(en("copy.selected"));
  expect(await page.evaluate(() => getSelection().toString())).toBe(expectedCopy(en));
});
