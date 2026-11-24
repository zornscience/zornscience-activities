// The Snell's Law & Refraction lab check (SLC): opening, setups that put the bench in each question's starting state,
// the readouts each question asks about (the right choice equals the readout), wrong and right answers, Show me, the
// completion code in the teacher checker, Start over, keyboard use, axe, Mexican Spanish, embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("snells-law-lab/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["28.1°", "15.4°", "45.0°", "41.8°", "No transmitted ray"];
var RIGHTS_ES = ["28.1°", "15.4°", "45.0°", "41.8°", "No hay rayo transmitido"];
var WRONGS = ["45.0°", "25.4°", "28.1°", "48.6°", "62.7°"];
var WRONG_LABELS = [
  {same: "45.0°", surface: "61.9°", divide: "30.0°"},
  {glass: "25.4°", divide: "16.5°", same: "40.0°"},
  {bends: "28.1°", zero: "0.0°", half: "22.5°"},
  {refraction: "48.6°", complement: "48.2°", atan: "33.7°"},
  {critical: "62.7°", grazing: "90.0°", airCritical: "41.8°"}
];
var ANGLE = ["45.0°", "40.0°", "45.0°", "30.0°", "70.0°"];
// The start of each question: block geometry, Optical block, Surrounding medium, the angle, and the readouts it asks about.
var START = [
  {mode: "slab", block: "glass", surrounding: "air", angle: 45, refraction: "28.1°", critical: "None"},
  {mode: "slab", block: "diamond", surrounding: "air", angle: 40, refraction: "15.4°", critical: "None"},
  {mode: "slab", block: "glass", surrounding: "glass", angle: 45, refraction: "45.0°", critical: "None"},
  {mode: "tir", block: "glass", surrounding: "air", angle: 30, refraction: "48.6°", critical: "41.8°"},
  {mode: "tir", block: "glass", surrounding: "water", angle: 70, refraction: "No transmitted ray", critical: "62.7°"}
];
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/snells-law-lab/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-sl-check"); }
function radio(page, label) { return check(page).getByRole("radio", typeof label === "string" ? {name: label, exact: true} : {name: label}); }
async function pick(page, label, button) {
  await radio(page, label).check();
  await check(page).getByRole("button", {name: button || "Check", exact: true}).click();
}
async function next(page) { await check(page).getByRole("button", {name: "Next", exact: true}).click(); }
async function setUp(page) { await check(page).getByRole("button", {name: "Set up the lab"}).click(); }
async function audit(page) {
  await page.evaluate(AXE);
  var out = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(out.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}))).toEqual([]);
}
// The bench is at the start of question i: the controls, the readouts, the laser on and the protractor snapped to the normal.
async function expectStart(page, i) {
  var s = START[i];
  await expect(page.locator("#slab-mode")).toHaveAttribute("aria-pressed", String(s.mode === "slab"));
  await expect(page.locator("#tir-mode")).toHaveAttribute("aria-pressed", String(s.mode === "tir"));
  await expect(page.locator("#block")).toHaveValue(s.block); await expect(page.locator("#surrounding")).toHaveValue(s.surrounding);
  await expect(page.locator("#block-custom")).toBeHidden(); await expect(page.locator("#surrounding-custom")).toBeHidden();
  await expect(page.locator("#angle")).toHaveValue(String(s.angle)); await expect(page.locator("#incidence")).toHaveText(s.angle.toFixed(1) + "°");
  await expect(page.locator("#laser-power")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#show-values")).toBeChecked(); await expect(page.locator("#show-protractor")).toBeChecked();
  await expect(page.locator("#protractor")).toHaveAttribute("transform", "translate(480 300)");
  await expect(page.locator("#zoom")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#refraction")).toHaveText(s.refraction); await expect(page.locator("#critical-reading")).toHaveText(s.critical);
}

test("snell lab check: closed by default, opens with ?check=1, sits above the physics note", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-sl-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className];
  })).toEqual(["workspace", "model-note"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question.replace("{angle}", "45.0°"));
  await page.goto("/snells-law-lab/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("snell lab check: a setup restores the start, turns the laser on and leaves the investigation prompt alone", async ({page, problems}) => {
  void problems; await open(page);
  // The student has changed everything: setup puts question 1 back.
  await page.locator("#tir-mode").click(); await page.locator("#block").selectOption("custom"); await page.locator("#surrounding").selectOption("water");
  await page.locator("#laser-power").click(); await page.locator("#show-values").uncheck(); await page.locator("#zoom").click();
  await page.locator("#angle").fill("12");
  await page.locator(".investigation summary").click(); await page.locator("#investigate-materials").click();
  var prompt = await page.locator("#investigation-prompt").textContent();
  await page.locator("#laser-power").click(); await page.locator("#block").selectOption("custom");
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expectStart(page, 0);
  await expect(page.locator("#investigation-prompt")).toHaveText(prompt);
  await expect(page.locator("#investigate-materials")).toHaveAttribute("aria-pressed", "true");
  for (var i = 1; i < 5; i++) { await next(page); await setUp(page); await expectStart(page, i); }
});

for (var q = 0; q < 5; q++) {
  (function (i) {
    test("snell lab check: question " + (i + 1) + " reads " + START[i].refraction + " (Refraction) and the right choice equals the readout", async ({page, problems}) => {
      void problems; await open(page);
      for (var n = 0; n < i; n++) await next(page);
      await setUp(page);
      await expectStart(page, i);
      // The right choice is the readout the question names: Refraction for questions 1, 2, 3 and 5, Critical angle for 4.
      var readout = i === 3 ? await page.locator("#critical-reading").textContent() : await page.locator("#refraction").textContent();
      expect(readout).toBe(RIGHTS[i]);
      await pick(page, readout);
      await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct.");
    });
  })(q);
}

test("snell lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[i][choice[2]]);
      var expected = questions[i].feedback[choice[2]].replace(/\{angle\}/g, ANGLE[i]).replace("{n1}", "1.500").replace("{n2}", "1.000");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText(expected + " Try again.");
      // Feedback never gives away the answer.
      await expect(check(page).locator(".zsa-labcheck-feedback")).not.toContainText(RIGHTS[i]);
    }
    await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
    if (i < 4) await next(page);
  }
  await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
});

test("snell lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. Light slows down in glass (n = 1.500) and bends toward the normal.");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("θ₂ = 28.1°, smaller than the incidence angle.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^15\.4° ?Correct answer$/)).toBeChecked();
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Answer shown. Diamond has n = 2.417, so light travels slowest in it (v = c / n = 1.24 × 10⁸ m/s)");
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Glass to air has a smaller critical angle, 41.8°");
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^SLC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Snell’s Law & Refraction (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Air into glass: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Glass in water: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("snell lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#angle")).toHaveValue("45"); await expect(page.locator("#block")).toHaveValue("glass");
  await page.keyboard.press("Tab"); await page.keyboard.press("Space");
  await expect(check(page).getByRole("radio").first()).toBeChecked();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Check", exact: true})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(check(page).locator(".zsa-labcheck-feedback")).not.toBeEmpty();
  for (var i = 0; i < 8; i++) {
    if (await check(page).getByRole("button", {name: "Next", exact: true}).evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(check(page).getByRole("button", {name: "Next", exact: true})).toBeFocused(); await page.keyboard.press("Enter");
  await expect(summary).toContainText("Question 2 of 5");
  await expect(check(page).locator("h2")).toBeFocused();
  for (var j = 0; j < 10; j++) {
    if (await check(page).getByRole("button", {name: "Start over", exact: true}).evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(check(page).getByRole("button", {name: "Start over", exact: true})).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(summary).toContainText("Question 1 of 5");
  await page.keyboard.press("Shift+Tab"); await expect(summary).toBeFocused();
  await page.keyboard.press("Enter"); await expect(check(page).locator("fieldset")).toHaveCount(0);
});

for (var lang of ["en", "es"]) for (var size of [[1366, 657], [390, 664]]) {
  test("snell lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Del aire al vidrio");
      await expect(check(page).locator("legend")).toContainText("Prepara el laboratorio. El láser entra al bloque de vidrio a 45.0°. ¿Qué indica la lectura Refracción θ₂?");
      await pick(page, "45.0°", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("La luz sí se desvía al pasar del aire al vidrio, porque el vidrio tiene un índice mayor. Lee la lectura Refracción θ₂. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("snell lab check: Spanish setup and the readouts", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("El laboratorio está listo. Sigue la pregunta y usa los controles del laboratorio.");
  await expect(page.locator("#refraction")).toHaveText("28.1°");
  for (var n = 0; n < 4; n++) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(page.locator("#refraction")).toHaveText("No hay rayo transmitido");
  await expect(page.locator("#critical-reading")).toHaveText("62.7°");
});

test("snell lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  for (var i = 0; i < 5; i++) {
    await pick(page, RIGHTS_ES[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Del vidrio al aire el ángulo crítico es menor, 41.8°");
  await expect(check(page).getByText("5 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue();
  expect(codes.decode(code, 8191).stats.map(s => s.correct)).toEqual([1, 1, 1, 1, 1]);
  await audit(page);
  await check(page).getByRole("button", {name: "Empezar de nuevo", exact: true}).click();
  for (var j = 0; j < 5; j++) {
    await pick(page, WRONGS[j], "Comprobar"); await pick(page, WRONGS[j], "Comprobar");
    await check(page).getByRole("button", {name: "Muéstrame", exact: true}).click();
    if (j < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var decoded = codes.decode(await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue(), 8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 0, 0, 0]);
});
