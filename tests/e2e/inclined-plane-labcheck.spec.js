// The Inclined Plane & Friction lab check (ILC): opening, setups that leave the change to the student, the arrow or
// readout each question asks about, wrong and right answers, Show me, the completion code in the teacher checker, Start
// over, keyboard use, axe, Mexican Spanish, embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("inclined-plane/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["9.22 N", "5.03 N", "It stays at rest. The friction arrow reads 2.45 N.", "3.22 m/s²", "0.65"];
// The first wrong choice of each question, then every wrong choice by feedback key.
var WRONGS = ["9.66 N", "1.68 N", "It stays at rest. The friction arrow reads 2.76 N.", "9.65 m/s²", "0.55"];
var WRONG_LABELS = [
  {sameN: "9.66 N", weight: "9.81 N", downhill: "3.36 N"},
  {sameF: "1.68 N", maxStatic: "6.22 N", kinetic: "4.15 N"},
  {maxF: "It stays at rest. The friction arrow reads 2.76 N.", slowSlide: "It still slides, but more slowly. The acceleration reads 0.83 m/s².",
    sameSlide: "It still slides, with the same acceleration as on wood, 2.36 m/s²."},
  {triple: "9.65 m/s²", third: "1.07 m/s²", noFriction: "5.63 m/s²"},
  {useSin: "0.55", useCos: "0.84", inverse: "1.53"}
];
var RIGHTS_ES = [RIGHTS[0], RIGHTS[1], "Se queda en reposo. La flecha de fricción indica 2.45 N.", RIGHTS[3], RIGHTS[4]];
var WRONGS_ES = [WRONGS[0], WRONGS[1], "Se queda en reposo. La flecha de fricción indica 2.76 N.", WRONGS[3], WRONGS[4]];
// The start of each question: angle (degrees), surface, mass (kg) and Slow motion.
var START = [["10", "wood", "1", false], ["20", "wood", "0.5", false], ["30", "wood", "0.5", false], ["35", "wood", "0.5", true], ["25", "felt", "0.5", false]];
// By default the animation runs only when a test advances a fake clock, so every readout is exact. axe-core and the
// teacher checker need real timers, so those tests pass {real: true}.
// A date after the first completion day, so the completion code can be made under the fake clock.
var NOW = Date.parse("2026-11-16T12:00:00-06:00");
async function open(page, query, real) {
  await page.addInitScript(seedRandom, 42);
  if (!real) await page.clock.install({time: NOW});
  await page.goto("/inclined-plane/" + (query === undefined ? "?check=1" : query));
  if (!real) await page.clock.pauseAt(NOW + 1000);
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-ip-check"); }
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
// The lab is at the start of question i: its controls and the block at rest at the top.
async function expectStart(page, i) {
  var s = START[i];
  await expect(page.locator("#angle")).toHaveValue(s[0]); await expect(page.locator("#surface")).toHaveValue(s[1]);
  await expect(page.locator("#mass")).toHaveValue(s[2]);
  await expect(page.locator("#angle-value")).toHaveText(Number(s[0]).toFixed(1) + "°"); await expect(page.locator("#mass-value")).toHaveText(Number(s[2]).toFixed(2) + " kg");
  if (s[3]) await expect(page.locator("#slow")).toBeChecked(); else await expect(page.locator("#slow")).not.toBeChecked();
  await expect(page.locator("#forces")).toBeChecked(); await expect(page.locator("#components")).toBeChecked();
  await expect(page.locator("#pause")).toHaveText("Pause"); await expect(page.locator("#pause")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#distance")).toHaveText("0.00 m"); await expect(page.locator("#clock")).toHaveText("0.00 s"); await expect(page.locator("#speed")).toHaveText("0.00 m/s");
}
// Advance the fake clock in small steps until the block is sliding, so a slow first frame cannot make a test flaky.
async function untilSliding(page) {
  await expect.poll(async () => { await page.clock.runFor(100); return page.locator("#state").textContent(); }, {timeout: 10000}).toBe("KINETIC / SLIDING");
}
async function expectArrow(page, text) { await expect(page.locator("#vectors")).toContainText(text); }
async function change(page, id, value) { await page.locator(id).fill(value); }

test("inclined plane lab check: closed by default, opens with ?check=1, sits between the legend and the physics note", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-ip-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className, !!mount.closest(".controls")];
  })).toEqual(["workspace", "model-note", false]);
  expect(await page.evaluate(() => !!document.querySelector(".workspace .bench-card .legend") && document.querySelector(".workspace").contains(document.querySelector(".legend")))).toBe(true);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question);
  await page.goto("/inclined-plane/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("inclined plane lab check: the lab is unchanged without the check section open", async ({page, problems}) => {
  void problems; await open(page, "");
  await page.clock.runFor(200);
  await expect(page.locator("#angle")).toHaveValue("20"); await expect(page.locator("#state")).toHaveText("STATIC / AT REST");
  await expectArrow(page, "N 4.61 N"); await expectArrow(page, "mg 4.91 N"); await expectArrow(page, "fₛ 1.68 N");
  await expect(page.locator("#coefficients")).toHaveText("Wood on wood: μₛ = 0.45, μₖ = 0.30. Critical angle: 24.2°. g = 9.81 m/s².");
});

test("inclined plane lab check: a setup restores the start, clears Pause and Show/Resolve, and never makes the change", async ({page, problems}) => {
  void problems; await open(page);
  // The student has changed everything and left the lab paused: setup puts question 1 back.
  await change(page, "#angle", "45"); await page.locator("#surface").selectOption("plastic"); await change(page, "#mass", "1.5");
  await page.locator("#forces").uncheck(); await page.locator("#components").uncheck(); await page.locator("#slow").check();
  await page.clock.runFor(500);
  await expect(page.locator("#state")).toHaveText("KINETIC / SLIDING");
  await page.locator("#pause").click();
  await expect(page.locator("#pause")).toHaveText("Resume"); await expect(page.locator("#pause")).toHaveAttribute("aria-pressed", "true");
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expectStart(page, 0);
  await expect(page.locator("#state")).toHaveText("STATIC / AT REST");
  await expectArrow(page, "N 9.66 N"); await expectArrow(page, "mg 9.81 N"); await expectArrow(page, "fₛ 1.70 N");
  // The block did not move, and the angle is still the starting one: the student makes the change.
  await page.clock.runFor(500);
  await expect(page.locator("#clock")).toHaveText("0.00 s"); await expect(page.locator("#angle-value")).toHaveText("10.0°");
  for (var i = 1; i < 5; i++) { await next(page); await setUp(page); await expectStart(page, i); }
});

test("inclined plane lab check: question 1 reads N 9.22 N after the ramp is raised to 20.0°", async ({page, problems}) => {
  void problems; await open(page);
  await setUp(page); await expectStart(page, 0);
  await expectArrow(page, "N 9.66 N");
  await change(page, "#angle", "20");
  await expect(page.locator("#angle-value")).toHaveText("20.0°");
  await expect(page.locator("#state")).toHaveText("STATIC / AT REST");
  await expectArrow(page, "N 9.22 N"); await expectArrow(page, "mg 9.81 N");
});

test("inclined plane lab check: question 2 reads fₛ 5.03 N at 1.50 kg and stays at rest", async ({page, problems}) => {
  void problems; await open(page);
  await next(page); await setUp(page); await expectStart(page, 1);
  await expectArrow(page, "fₛ 1.68 N");
  await change(page, "#mass", "1.5");
  await expect(page.locator("#mass-value")).toHaveText("1.50 kg");
  await page.clock.runFor(500);
  await expect(page.locator("#state")).toHaveText("STATIC / AT REST");
  await expectArrow(page, "fₛ 5.03 N");
});

test("inclined plane lab check: question 3 slides on wood, then holds on felt with fₛ 2.45 N", async ({page, problems}) => {
  void problems; await open(page);
  await next(page); await next(page); await setUp(page); await expectStart(page, 2);
  await untilSliding(page);
  await expect(page.locator("#accel")).toHaveText("2.36 m/s²");
  await page.locator("#surface").selectOption("felt");
  await page.clock.runFor(1500);
  await expect(page.locator("#state")).toHaveText("STATIC / AT REST");
  await expectArrow(page, "fₛ 2.45 N");
  await expect(page.locator("#coefficients")).toContainText("Critical angle: 33.0°");
});

test("inclined plane lab check: question 4 reads 3.22 m/s² while sliding, before and after the mass change", async ({page, problems}) => {
  void problems; await open(page);
  for (var n = 0; n < 3; n++) await next(page);
  await setUp(page); await expectStart(page, 3);
  await untilSliding(page);
  await expect(page.locator("#accel")).toHaveText("3.22 m/s²");
  await change(page, "#mass", "1.5");
  await expect(page.locator("#mass-value")).toHaveText("1.50 kg");
  await untilSliding(page);
  await expect(page.locator("#accel")).toHaveText("3.22 m/s²");
  // Pausing freezes the readout the question asks for.
  await page.locator("#pause").click(); await page.clock.runFor(1000);
  await expect(page.locator("#accel")).toHaveText("3.22 m/s²"); await expect(page.locator("#state")).toHaveText("KINETIC / SLIDING");
  await page.locator("#pause").click();
  // At the end stop the lab itself sets the acceleration to 0.00 m/s² and hides the arrows (unchanged).
  await page.clock.runFor(6000);
  await expect(page.locator("#state")).toHaveText("END STOP"); await expect(page.locator("#accel")).toHaveText("0.00 m/s²");
  await expect(page.locator("#vectors")).toBeEmpty();
});

test("inclined plane lab check: question 5 on felt, 33.0° holds and 33.1° slips", async ({page, problems}) => {
  void problems; await open(page);
  for (var n = 0; n < 4; n++) await next(page);
  await setUp(page); await expectStart(page, 4);
  await change(page, "#angle", "33");
  await page.clock.runFor(1500);
  await expect(page.locator("#angle-value")).toHaveText("33.0°"); await expect(page.locator("#state")).toHaveText("STATIC / AT REST");
  await change(page, "#angle", "33.1");
  await page.clock.runFor(1500);
  await expect(page.locator("#angle-value")).toHaveText("33.1°"); await expect(page.locator("#state")).toHaveText(/^(KINETIC \/ SLIDING|END STOP)$/);
  // Slipping starts right away at 33.1°: the first frame already reads KINETIC / SLIDING.
  await change(page, "#angle", "33");
  await page.clock.runFor(100);
  await change(page, "#angle", "33.1"); await page.clock.runFor(50);
  await expect(page.locator("#state")).toHaveText("KINETIC / SLIDING");
});

test("inclined plane lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[i][choice[2]]);
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText(questions[i].feedback[choice[2]] + " Try again.");
      // Feedback never gives away the answer.
      await expect(check(page).locator(".zsa-labcheck-feedback")).not.toContainText(RIGHTS[i]);
    }
    await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
    if (i < 4) await next(page);
  }
  await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
});

test("inclined plane lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. The ramp pushes on the block perpendicular to its surface");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("At 10.0° it is 9.66 N.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^5\.03 N ?Correct answer$/)).toBeChecked();
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Answer shown. While the block is at rest, static friction is exactly as large");
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("region", {name: "Completion code"})).toHaveCount(0);
    await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("The first slip on felt shows at 33.1°, and tan 33.1° = 0.65.");
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^ILC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Inclined Plane & Friction (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Tilt the ramp: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Find the friction coefficient: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("inclined plane lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#angle")).toHaveValue("10"); await expect(page.locator("#mass")).toHaveValue("1");
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
  test("inclined plane lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1", true);
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Inclina la rampa");
      await expect(check(page).locator("legend")).toContainText("Sube el ángulo de la rampa a 20.0°. El bloque se queda en reposo. ¿Qué indica ahora la flecha de la fuerza normal?");
      await pick(page, "9.66 N", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Esa es la fuerza normal a 10.0°. Sube la rampa a 20.0° y vuelve a leer la flecha. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("inclined plane lab check: Spanish setup and the arrow after the change", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("El laboratorio está listo. Sigue la pregunta y usa los controles del laboratorio.");
  await expect(page.locator("#pause")).toHaveText("Pausar");
  await change(page, "#angle", "20");
  await expectArrow(page, "N 9.22 N");
  await expect(page.locator("#state")).toHaveText("ESTÁTICO / EN REPOSO");
});

test("inclined plane lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es", true);
  for (var i = 0; i < 5; i++) {
    await pick(page, RIGHTS_ES[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("el primer deslizamiento aparece a 33.1°, y tan 33.1° = 0.65.");
  await expect(check(page).getByText("5 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue();
  expect(codes.decode(code, 8191).stats.map(s => s.correct)).toEqual([1, 1, 1, 1, 1]);
  await audit(page);
  await check(page).getByRole("button", {name: "Empezar de nuevo", exact: true}).click();
  for (var j = 0; j < 5; j++) {
    await pick(page, WRONGS_ES[j], "Comprobar"); await pick(page, WRONGS_ES[j], "Comprobar");
    await check(page).getByRole("button", {name: "Muéstrame", exact: true}).click();
    if (j < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var decoded = codes.decode(await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue(), 8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 0, 0, 0]);
});
