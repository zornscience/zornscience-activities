// The Projectile Motion Vector Lab check (PRLC): opening, setups that leave the launch to the student, the readouts each
// question asks about (flights run on the same fake clock as projectile-lab.spec.js), wrong and right answers, Show me,
// the completion code in the teacher checker, Start over, keyboard use, axe, Mexican Spanish, embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("projectile-lab/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["17.32 m/s", "24.70 m", "35.35 m", "2.86 s", "19.80 m/s"];
var WRONGS = ["17.95 m/s", "9.70 m", "40.82 m", "1.43 s", "9.80 m/s"];
var WRONG_LABELS = [
  {speed: "17.95 m/s", launch: "20.00 m/s", vy: "4.70 m/s"},
  {gain: "9.70 m", ledge: "15.00 m", noHalf: "34.40 m"},
  {max: "40.82 m", double: "70.70 m", half: "17.67 m"},
  {half: "1.43 s", double: "5.71 s", root: "2.02 s"},
  {one: "9.80 m/s", vx: "10.00 m/s", speed: "22.18 m/s"}
];
// The start of each question: h0, angle and speed outputs, the scenario select, Pause at the top and the launch line.
var START = [
  {h0: "0 m", angle: "30°", scenario: "custom", pausetop: false, parts: "At launch: vx = 17.32 m/s, vy = 10.00 m/s.", h: 0, a: 30, v: 20},
  {h0: "15 m", angle: "50°", scenario: "ledge", pausetop: true, parts: "At launch: vx = 11.57 m/s, vy = 13.79 m/s.", h: 15, a: 50, v: 18},
  {h0: "0 m", angle: "30°", scenario: "custom", pausetop: false, parts: "At launch: vx = 17.32 m/s, vy = 10.00 m/s.", h: 0, a: 30, v: 20},
  {h0: "40 m", angle: "0°", scenario: "cliff", pausetop: false, parts: "At launch: vx = 12.00 m/s, vy = 0.00 m/s.", h: 40, a: 0, v: 12},
  {h0: "20 m", angle: "0°", scenario: "custom", pausetop: false, parts: "At launch: vx = 10.00 m/s, vy = 0.00 m/s.", h: 20, a: 0, v: 10}
];
var clocked = new WeakSet();
// Pages on the fake clock (as in projectile-lab.spec.js), so a flight does not take real seconds.
async function open(page, query, opts) {
  opts = opts || {};
  await page.addInitScript(seedRandom, 42);
  if (opts.clock !== false) {
    clocked.add(page);
    await page.clock.install({time: new Date("2026-11-17T12:00:00")});
    await page.clock.pauseAt(new Date("2026-11-17T12:00:01"));
  }
  await page.goto("/projectile-lab/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-pj-labcheck"); }
function radio(page, label) { return check(page).getByRole("radio", typeof label === "string" ? {name: label, exact: true} : {name: label}); }
async function tick(page, ms) { if (clocked.has(page)) await page.clock.runFor(ms); }
async function pick(page, label, button) {
  await radio(page, label).check();
  await check(page).getByRole("button", {name: button || "Check", exact: true}).click();
  await tick(page, 100);
}
async function next(page) { await check(page).getByRole("button", {name: "Next", exact: true}).click(); await tick(page, 100); }
async function setUp(page) { await check(page).getByRole("button", {name: "Set up the lab"}).click(); await tick(page, 100); }
async function audit(page) {
  await page.evaluate(AXE);
  var out = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(out.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)}))).toEqual([]);
}
function readout(page, id) { return page.locator("#zsa-pj-" + id + "-value"); }
function result(page, id) { return page.locator("#zsa-pj-r-" + id); }
// The lab is at the start of question i: the controls, the readouts at t = 0, results blank and nothing launched.
async function expectStart(page, i) {
  var s = START[i];
  await expect(page.locator("#zsa-pj-h0")).toHaveValue(String(s.h)); await expect(page.locator("#zsa-pj-angle")).toHaveValue(String(s.a)); await expect(page.locator("#zsa-pj-speed")).toHaveValue(String(s.v));
  await expect(page.locator("#zsa-pj-h0-out")).toHaveText(s.h + " m"); await expect(page.locator("#zsa-pj-angle-out")).toHaveText(s.a + "°"); await expect(page.locator("#zsa-pj-speed-out")).toHaveText(s.v.toFixed(1) + " m/s");
  await expect(page.locator("#zsa-pj-scenario")).toHaveValue(s.scenario);
  if (s.pausetop) await expect(page.locator("#zsa-pj-pausetop")).toBeChecked(); else await expect(page.locator("#zsa-pj-pausetop")).not.toBeChecked();
  await expect(page.locator("#zsa-pj-slow")).not.toBeChecked();
  await expect(page.locator("#zsa-pj-launch-parts")).toHaveText(s.parts);
  await expect(readout(page, "t")).toHaveText("0.00 s"); await expect(page.locator("#zsa-pj-time")).toHaveValue("0");
  await expect(page.locator("#zsa-pj-play")).toHaveText("Launch");
  ["time", "height", "range", "landing"].forEach(async id => { await expect(result(page, id)).toHaveText("?"); });
}
async function launchAndWait(page, ms) {
  await page.locator("#zsa-pj-play").click();
  await page.clock.runFor(ms);
}

test("projectile lab check: closed by default, opens with ?check=1, sits between Flight results and Check your thinking", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-pj-labcheck");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className, document.querySelector(".zsa-pj-settings .zsa-eyebrow").textContent, document.querySelector(".zsa-pj-quiz .zsa-eyebrow").textContent];
  })).toEqual(["zsa-card zsa-pj-results", "zsa-card zsa-pj-quiz", "1. Aim the cannon", "4. Check your thinking"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question.replace("{t}", "1.50"));
  // The lab's own five questions stay.
  await expect(page.locator("#zsa-pj-questions fieldset")).toHaveCount(5);
  await page.goto("/projectile-lab/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("projectile lab check: a setup restores the start, stops a run and leaves the Show on the ball toggles alone", async ({page, problems}) => {
  void problems; await open(page);
  // The student has changed everything and started a run: setup puts question 1 back, without launching.
  await page.locator("#zsa-pj-show-c").uncheck(); await page.locator("#zsa-pj-show-a").check();
  await page.locator("#zsa-pj-slow").check(); await page.locator("#zsa-pj-pausetop").check();
  await page.locator("#zsa-pj-scenario").selectOption("cliff");
  await page.locator("#zsa-pj-play").click(); await page.clock.runFor(500);
  expect(parseFloat(await readout(page, "t").textContent())).toBeGreaterThan(0.05); // a quarter speed, so 0.5 s of clock is about 0.13 s of flight
  await page.clock.runFor(100);
  var announced = await page.locator("#zsa-pj-live").textContent();
  expect(announced).toContain("Launched at");
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expectStart(page, 0);
  await expect(page.locator("#zsa-pj-show-c")).not.toBeChecked(); await expect(page.locator("#zsa-pj-show-a")).toBeChecked();
  await expect(page.locator("#zsa-pj-show-v")).toBeChecked(); await expect(page.locator("#zsa-pj-show-s")).not.toBeChecked();
  // Nothing moves until the student presses Launch, and setup said nothing in the lab's own live region.
  await page.clock.runFor(1000);
  await expect(readout(page, "t")).toHaveText("0.00 s");
  await expect(page.locator("#zsa-pj-live")).toHaveText(announced);
  for (var i = 1; i < 5; i++) { await next(page); await setUp(page); await expectStart(page, i); }
  // Question 2 turned Pause at the top on; every other question turns it off again.
  await check(page).getByRole("button", {name: "Previous", exact: true}).click(); await setUp(page); await expectStart(page, 3);
  await expect(page.locator("#zsa-pj-scenario option:checked")).toHaveText("Horizontal launch from a cliff");
  await check(page).getByRole("button", {name: "Previous", exact: true}).click(); await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await setUp(page); await expectStart(page, 1);
  await expect(page.locator("#zsa-pj-scenario option:checked")).toHaveText("Launch from a ledge");
});

test("projectile lab check: question 1, drag the Time slider to 1.50 s, vx 17.32 m/s right, Speed 17.95 m/s, vy 4.70 m/s down", async ({page, problems}) => {
  void problems; await open(page);
  await setUp(page);
  await page.locator("#zsa-pj-time").focus();
  await page.keyboard.press("End");
  await expect(page.locator("#zsa-pj-time")).toHaveValue("2.05");
  for (var n = 0; n < 11; n++) await page.keyboard.press("ArrowLeft");
  await expect(readout(page, "t")).toHaveText("1.50 s");
  await expect(readout(page, "vx")).toHaveText("17.32 m/s right");
  await expect(readout(page, "speed")).toHaveText("17.95 m/s");
  await expect(readout(page, "vy")).toHaveText("4.70 m/s down");
  // vx never changes along the flight: the launch line says 17.32 too.
  await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft");
  await expect(readout(page, "t")).toHaveText("1.40 s");
  await expect(readout(page, "vx")).toHaveText("17.32 m/s right");
});

test("projectile lab check: question 2, Launch stops at the top: Height 24.70 m, Time 1.41 s, vy 0.00 m/s", async ({page, problems}) => {
  void problems; await open(page);
  await next(page); await setUp(page); await expectStart(page, 1);
  await launchAndWait(page, 2500);
  await expect(page.getByRole("button", {name: "Resume"})).toBeVisible();
  await expect(readout(page, "y")).toHaveText("24.70 m");
  await expect(readout(page, "t")).toHaveText("1.41 s");
  await expect(readout(page, "vy")).toHaveText("0.00 m/s");
  await expect(readout(page, "x")).toHaveText("16.28 m");
  await expect(readout(page, "vx")).toHaveText("11.57 m/s right");
  await expect(page.locator("#zsa-pj-insight")).toContainText("At the top: vy is zero");
  // Flight results stay blank until the ball lands.
  await expect(result(page, "range")).toHaveText("?");
});

test("projectile lab check: question 3, range 35.35 m at 30° and again at 60°, and ? right after the angle changes", async ({page, problems}) => {
  void problems; await open(page);
  await next(page); await next(page); await setUp(page); await expectStart(page, 2);
  await launchAndWait(page, 3000);
  await expect(result(page, "time")).toHaveText("2.04 s");
  await expect(result(page, "range")).toHaveText("35.35 m");
  await expect(result(page, "height")).toHaveText("5.10 m at 1.02 s");
  await page.locator("#zsa-pj-angle").fill("60");
  await expect(page.locator("#zsa-pj-angle-out")).toHaveText("60°");
  await expect(page.locator("#zsa-pj-scenario")).toHaveValue("custom");
  await expect(result(page, "range")).toHaveText("?");
  await launchAndWait(page, 4500);
  await expect(result(page, "time")).toHaveText("3.53 s");
  await expect(result(page, "range")).toHaveText("35.35 m");
  await expect(result(page, "height")).toHaveText("15.31 m at 1.77 s");
});

test("projectile lab check: question 4, time in the air 2.86 s at 12 m/s and at 24 m/s, range 34.29 m and 68.57 m", async ({page, problems}) => {
  void problems; await open(page);
  for (var n = 0; n < 3; n++) await next(page);
  await setUp(page); await expectStart(page, 3);
  await launchAndWait(page, 3500);
  await expect(result(page, "time")).toHaveText("2.86 s");
  await expect(result(page, "range")).toHaveText("34.29 m");
  await expect(result(page, "height")).toHaveText("40.00 m (the launch point)");
  await page.locator("#zsa-pj-speed").fill("24");
  await expect(page.locator("#zsa-pj-speed-out")).toHaveText("24.0 m/s");
  await expect(result(page, "time")).toHaveText("?");
  await launchAndWait(page, 3500);
  await expect(result(page, "time")).toHaveText("2.86 s");
  await expect(result(page, "range")).toHaveText("68.57 m");
  await expect(readout(page, "vy")).toHaveText("28.00 m/s down");
});

test("projectile lab check: question 5, after landing vy reads 19.80 m/s down (by waiting, and by dragging the Time slider to its end)", async ({page, problems}) => {
  void problems; await open(page);
  for (var n = 0; n < 4; n++) await next(page);
  await setUp(page); await expectStart(page, 4);
  await launchAndWait(page, 3000);
  await expect(readout(page, "t")).toHaveText("2.02 s");
  await expect(readout(page, "x")).toHaveText("20.20 m");
  await expect(readout(page, "y")).toHaveText("0.00 m");
  await expect(readout(page, "speed")).toHaveText("22.18 m/s");
  await expect(readout(page, "vx")).toHaveText("10.00 m/s right");
  await expect(readout(page, "vy")).toHaveText("19.80 m/s down");
  await expect(readout(page, "dir")).toContainText("63°");
  await expect(result(page, "time")).toHaveText("2.02 s"); await expect(result(page, "range")).toHaveText("20.20 m");
  // The same readouts from the Time slider at its end.
  await setUp(page);
  await page.locator("#zsa-pj-time").focus(); await page.keyboard.press("End");
  await expect(readout(page, "vy")).toHaveText("19.80 m/s down");
  await expect(result(page, "time")).toHaveText("2.02 s");
});

test("projectile lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[i][choice[2]]);
      var expected = questions[i].feedback[choice[2]].replace(/\{angle\}/g, "30").replace(/\{angle2\}/g, "60").replace("{h0}", "40").replace("{speed2}", "24");
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

test("projectile lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. Only gravity acts on the ball, and it pulls straight down, so vx never changes.");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("It stays at 20.00 × cos 30° = 17.32 m/s the whole flight.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^24\.70 m ?Correct answer$/)).toBeChecked();
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Answer shown. At the top vy = 0.");
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Then vy = 9.8 × 2.02 = 19.80 m/s down. The speed is 22.18 m/s because vx is still 10.00 m/s.");
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^PRLC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Projectile Motion Vector Lab (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Sideways velocity: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Height at the top: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Predict, then launch: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("projectile lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "", {clock: false});
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-pj-angle")).toHaveValue("30"); await expect(page.locator("#zsa-pj-scenario")).toHaveValue("custom");
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
  test("projectile lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1", {clock: false});
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Velocidad horizontal");
      await expect(check(page).locator("legend")).toContainText("Arrastra el control deslizante Tiempo a 1.50 s. El proyectil está en el aire. ¿Qué indica la lectura de vx?");
      await pick(page, "17.95 m/s", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Esa es la lectura Rapidez, |v|, que incluye la parte vertical. Busca la fila marcada vx y lee esa. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("projectile lab check: Spanish setup, a flight and the readouts", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("El laboratorio está listo. Sigue la pregunta y usa los controles del laboratorio.");
  await expect(page.locator("#zsa-pj-angle-out")).toHaveText("30°");
  await page.locator("#zsa-pj-time").focus(); await page.keyboard.press("End");
  for (var n = 0; n < 11; n++) await page.keyboard.press("ArrowLeft");
  await expect(readout(page, "vx")).toHaveText("17.32 m/s hacia la derecha");
  await expect(readout(page, "vy")).toHaveText("4.70 m/s hacia abajo");
});

test("projectile lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es", {clock: false});
  for (var i = 0; i < 5; i++) {
    await pick(page, RIGHTS[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Entonces vy = 9.8 × 2.02 = 19.80 m/s hacia abajo.");
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
