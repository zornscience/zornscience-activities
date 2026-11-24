// The Standing Waves on a String lab check (STLC): opening, setups that put the lab in each question's starting state,
// the readouts each question asks about (the right choice equals the readout), wrong and right answers, Show me, the
// completion code in the teacher checker, Start over, keyboard use, axe, Mexican Spanish, embed mode and phone layout.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("standing-waves-lab/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["39.15 Hz", "0.800 m", "31.32 m/s", "18.46 Hz", "22.15 m/s"];
var WRONGS = ["16.05 Hz", "0.400 m", "62.64 m/s", "26.10 Hz", "31.32 m/s"];
var WRONG_LABELS = [
  {add: "16.05 Hz", h4: "52.20 Hz", div: "4.35 Hz"},
  {dx: "0.400 m", whole: "1.200 m", twoL: "2.400 m"},
  {double: "62.64 m/s", half: "15.66 m/s", hz: "52.20 m/s"},
  {double: "26.10 Hz", same: "13.05 Hz", half: "6.53 Hz"},
  {same: "31.32 m/s", faster: "44.29 m/s", half: "15.66 m/s"}
];
// The start of each question: generator frequency, hanging mass, length, string density and the readouts.
var START = [
  {frequency: "26.1", display: "26.10 Hz", mass: "200", length: "1.2", density: "0.002", fundamental: "13.05 Hz", velocity: "31.32 m/s", harmonic: "n = 2"},
  {frequency: "39.15", display: "39.15 Hz", mass: "200", length: "1.2", density: "0.002", fundamental: "13.05 Hz", velocity: "31.32 m/s", harmonic: "n = 3"},
  {frequency: "52.2", display: "52.20 Hz", mass: "200", length: "1.2", density: "0.002", fundamental: "13.05 Hz", velocity: "31.32 m/s", harmonic: "n = 4"},
  {frequency: "26.1", display: "26.10 Hz", mass: "400", length: "1.2", density: "0.002", fundamental: "18.46 Hz", velocity: "44.29 m/s", harmonic: "n = 1"},
  {frequency: "26.1", display: "26.10 Hz", mass: "200", length: "1.2", density: "0.004", fundamental: "9.23 Hz", velocity: "22.15 m/s", harmonic: "n = 3"}
];
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/standing-waves-lab/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-sw-check"); }
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
// The lab is at the start of question i: the controls, the oscillator on at 65% and the readouts before any change.
async function expectStart(page, i) {
  var s = START[i];
  await expect(page.locator("#frequency")).toHaveValue(s.frequency); await expect(page.locator("#display")).toHaveText(s.display);
  await expect(page.locator("#mass")).toHaveValue(s.mass); await expect(page.locator("#length")).toHaveValue(s.length);
  await expect(page.locator("#density")).toHaveValue(s.density); await expect(page.locator("#amplitude")).toHaveValue("65");
  await expect(page.locator("#power")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#fundamental")).toHaveText(s.fundamental); await expect(page.locator("#velocity")).toHaveText(s.velocity);
  await expect(page.locator("#harmonic")).toHaveText(s.harmonic);
}

test("standing waves lab check: closed by default, opens with ?check=1, sits above the model note", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  // The lab looks as it does today: oscillator off, nothing set up by the check on page load.
  await expect(page.locator("#power")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#frequency")).toHaveValue("26.1"); await expect(page.locator("#mass")).toHaveValue("200");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-sw-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className];
  })).toEqual(["workspace", "model-note"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question);
  await page.goto("/standing-waves-lab/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
  await expect(page.locator("#power")).toHaveAttribute("aria-pressed", "false");
});

test("standing waves lab check: a setup restores the start, turns the oscillator on and leaves strobe lock, cursors and investigation alone", async ({page, problems}) => {
  void problems; await open(page);
  // The student has changed everything: setup puts question 1 back.
  await page.locator("#mass").fill("500"); await page.locator("#length").fill("0.6"); await page.locator("#density").selectOption("0.004");
  await page.locator("#frequency").fill("100"); await page.locator("#amplitude").fill("10");
  await page.locator("#strobe").click(); await page.locator('[data-task="tension"]').click();
  await page.locator("#cursor-a").fill("0.2");
  var prompt = await page.locator("#task-prompt").textContent();
  await expect(page.locator("#strobe")).toHaveAttribute("aria-pressed", "true");
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expectStart(page, 0);
  await expect(page.locator("#strobe")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#task-prompt")).toHaveText(prompt);
  await expect(page.locator("#cursor-a")).toHaveValue("0.2");
  for (var i = 1; i < 5; i++) { await next(page); await setUp(page); await expectStart(page, i); }
  // Question 2 turns Label nodes & antinodes on.
  await check(page).getByRole("button", {name: "Previous", exact: true}).click(); await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await setUp(page); await expectStart(page, 1);
  await expect(page.locator("#nodes")).toBeChecked();
});

for (var q = 0; q < 5; q++) {
  (function (i) {
    var readout = ["#fundamental", "#measurement-feedback", "#velocity", "#fundamental", "#velocity"][i];
    test("standing waves lab check: question " + (i + 1) + " reads " + RIGHTS[i] + " and the right choice equals the readout", async ({page, problems}) => {
      void problems; await open(page);
      for (var n = 0; n < i; n++) await next(page);
      await setUp(page);
      await expectStart(page, i);
      if (i === 0) {
        // Harmonic 3 is 3 x f1: the 3 harmonic button tunes the generator to exactly the right choice.
        var f1 = parseFloat(await page.locator("#fundamental").textContent());
        expect((3 * f1).toFixed(2) + " Hz").toBe(RIGHTS[0]);
        await page.locator('[data-harmonic="3"]').click();
        await expect(page.locator("#display")).toHaveText(RIGHTS[0]); await expect(page.locator("#harmonic")).toHaveText("n = 3");
      } else if (i === 1) {
        await page.locator("#snap-nodes").click();
        await expect(page.locator("#measurement-feedback")).toContainText("Your measured wavelength is λ = 2Δx = " + RIGHTS[1]);
        await expect(page.locator("#measurement-feedback")).toContainText("Δx = 0.400 m");
      } else if (i === 2) {
        await page.locator('[data-harmonic="2"]').click();
        await expect(page.locator("#display")).toHaveText("26.10 Hz"); await expect(page.locator("#velocity")).toHaveText(RIGHTS[2]);
      } else await expect(page.locator(readout)).toHaveText(RIGHTS[i]);
      await pick(page, RIGHTS[i]);
      await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct.");
    });
  })(q);
}

test("standing waves lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[i][choice[2]]);
      var expected = questions[i].feedback[choice[2]].replace("{vMedium}", "31.32");
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

test("standing waves lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correct. Harmonic n has frequency fₙ = n × f₁.");
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("harmonic 3 is 3 × 13.05 = 39.15 Hz.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^0\.800 m ?Correct answer$/)).toBeChecked();
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Answer shown. Neighboring nodes are Δx = 0.400 m apart, half a wavelength.");
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("31.32 / √2 = 22.15 m/s.");
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^STLC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Standing Waves on a String (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Three loops: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("A heavier cord: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("standing waves lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#frequency")).toHaveValue("26.1"); await expect(page.locator("#power")).toHaveAttribute("aria-pressed", "true");
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
  test("standing waves lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Tres segmentos");
      await expect(check(page).locator("legend")).toContainText("¿Qué frecuencia del generador hace vibrar la cuerda en 3 segmentos (armónico 3)?");
      await pick(page, "16.05 Hz", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Los armónicos son múltiplos de f₁, no f₁ más un número. El armónico n está en n × f₁. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("standing waves lab check: Spanish setup and the readouts", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("El laboratorio está listo. Sigue la pregunta y usa los controles del laboratorio.");
  await expect(page.locator("#fundamental")).toHaveText("13.05 Hz");
  for (var n = 0; n < 4; n++) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  await check(page).getByRole("button", {name: "Preparar el laboratorio"}).click();
  await expect(page.locator("#velocity")).toHaveText("22.15 m/s");
});

test("standing waves lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  for (var i = 0; i < 5; i++) {
    await pick(page, RIGHTS[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("31.32 / √2 = 22.15 m/s.");
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
