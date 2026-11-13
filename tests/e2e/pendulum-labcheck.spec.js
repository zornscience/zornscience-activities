// The Simple Pendulum lab check (PLC): opening, setups that leave the change to the student, the readouts each
// question asks about (including 10 presses of Step), wrong and right answers, Show me, the completion code in the
// teacher checker, Start over, keyboard use, axe, Mexican Spanish, embed mode and the phone settings panel.
"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("pendulum-lab/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = ["2.378 s", /^The model period stays 1\.808 s, and the total energy grows/, "3.495 s", "About 5.0% longer", "2.032 m/s"];
var WRONGS = ["1.189 s", /^The model period doubles/, "1.420 s", /^0%\./, "0.000 m/s"];
var WRONG_LABELS = {
  sameT: "1.189 s", linearL: "4.756 s", inverseL: "0.595 s",
  heavySlow: /^The model period doubles to 3\.616 s/, heavyFast: /^The model period drops to 0\.904 s/, sameEnergy: /stays 0\.047 J\.$/,
  sameG: "1.420 s", ratioG: "8.600 s", fasterMoon: "0.577 s",
  noChange: /^0%\./, decimal: "About 50% longer", shorter: "About 5.0% shorter",
  bottomStill: "0.000 m/s", fullHeight: "4.202 m/s", cosHeight: "3.678 m/s"
};
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/pendulum-lab/" + (query === undefined ? "?check=1" : query));
  await expect(check(page).locator("summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-pl-check"); }
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
async function expectStart(page, s) {
  await expect(page.locator("#length")).toHaveValue(String(s.L)); await expect(page.locator("#mass")).toHaveValue(String(s.m));
  await expect(page.locator("#angle")).toHaveValue(String(s.angle)); await expect(page.locator("#world")).toHaveValue(s.world);
  await expect(page.locator("#speed")).toHaveValue("1"); await expect(page.locator("#clock")).toHaveText("0.00 s");
  await expect(page.locator("#state")).toHaveText("READY TO RELEASE");
}

test("pendulum lab check: closed by default, opens with ?check=1, sits above the model note", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).locator("summary")).toContainText("Lab check");
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  expect(await page.evaluate(() => {
    var mount = document.getElementById("zsa-pl-check");
    return [mount.previousElementSibling.className, mount.nextElementSibling.className];
  })).toEqual(["workspace", "model-note"]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("legend")).toHaveText(questions[0].question);
  await page.goto("/pendulum-lab/?check=1");
  await expect(check(page).locator("legend")).toBeVisible();
});

test("pendulum lab check: each setup restores the start, leaves the change to the student, and the lab then reads the right answer", async ({page, problems}) => {
  void problems; await open(page);
  // Setup clears a comparison (as Free exploration does) and sets real-time playback.
  await page.locator("#compare-mass").click(); await page.locator("#speed").selectOption("0.25");
  await expect(page.locator("#reference")).not.toHaveAttribute("hidden", "");
  await setUp(page);
  await expect(check(page).locator(".zsa-sr-only[role=status]")).toHaveText("The lab is set up. Follow the question and use the lab controls.");
  await expect(page.locator("#reference")).toHaveAttribute("hidden", "");
  await expect(page.locator("#free-explore")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#comparison-result")).toBeHidden();
  await expectStart(page, {L: 0.35, m: 0.15, angle: 10, world: "9.81"});
  await expect(page.locator("#actual")).toHaveText("1.189 s");
  await page.locator("#length").fill("1.4");
  await expect(page.locator("#length-value")).toHaveText("1.40 m");
  await expect(page.locator("#actual")).toHaveText("2.378 s");
  await next(page);

  // Setup also resets a swing in progress and puts the bob back on the right (side 1).
  await page.locator("#release").click(); await page.waitForTimeout(150);
  await setUp(page);
  await expectStart(page, {L: 0.8, m: 0.1, angle: 20, world: "9.81"});
  await expect(page.locator("#theta")).toHaveText("20.0°");
  await expect(page.locator("#actual")).toHaveText("1.808 s"); await expect(page.locator("#total")).toHaveText("Total 0.047 J");
  await page.locator("#mass").fill("0.4");
  await expect(page.locator("#mass-value")).toHaveText("400 g");
  await expect(page.locator("#actual")).toHaveText("1.808 s"); await expect(page.locator("#total")).toHaveText("Total 0.189 J");
  await next(page);

  await setUp(page);
  await expectStart(page, {L: 0.5, m: 0.2, angle: 8, world: "9.81"});
  await expect(page.locator("#actual")).toHaveText("1.420 s");
  await page.locator("#world").selectOption("1.62");
  await expect(page.locator("#actual")).toHaveText("3.495 s");
  await next(page);

  await setUp(page);
  await expectStart(page, {L: 1.2, m: 0.25, angle: 10, world: "9.81"});
  await page.locator("#angle").fill("50");
  await expect(page.locator("#period")).toHaveText("2.198 s"); await expect(page.locator("#actual")).toHaveText("2.307 s");
  await next(page);

  await setUp(page);
  await expectStart(page, {L: 0.9, m: 0.3, angle: 40, world: "9.81"});
  await expect(page.locator("#velocity")).toHaveText("0.000 m/s");
  for (var i = 0; i < 10; i++) await page.locator("#step").click();
  await expect(page.locator("#clock")).toHaveText("0.50 s");
  await expect(page.locator("#theta")).toHaveText("-1.2°");
  await expect(page.locator("#velocity")).toHaveText("2.032 m/s");
  await expect(page.locator("#pe-value")).toHaveText("0.001 J"); await expect(page.locator("#ke-value")).toHaveText("0.619 J");
  await expect(page.locator("#total")).toHaveText("Total 0.620 J");
});

test("pendulum lab check: on a phone, setup opens the collapsed apparatus settings", async ({page, problems}) => {
  void problems; await page.setViewportSize({width: 390, height: 664}); await open(page);
  await expect(page.locator("#settings-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#length")).toBeHidden();
  await setUp(page);
  await expect(page.locator("#settings-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#settings-toggle")).toHaveText("Hide apparatus settings");
  await expect(page.locator("#length")).toBeVisible(); await expect(page.locator("#world")).toBeVisible();
  await page.locator("#length").fill("1.4");
  await expect(page.locator("#actual")).toHaveText("2.378 s");
  // An open panel stays open on the next setup.
  await next(page); await setUp(page);
  await expect(page.locator("#settings-toggle")).toHaveAttribute("aria-expanded", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("pendulum lab check: on a laptop, setup leaves the hidden settings toggle alone", async ({page, problems}) => {
  void problems; await open(page);
  await setUp(page);
  await expect(page.locator("#settings-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#length")).toBeVisible();
});

test("pendulum lab check: every wrong choice gives its own feedback, and retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      await pick(page, WRONG_LABELS[choice[2]]);
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText(questions[i].feedback[choice[2]] + " Try again.");
    }
    await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
    if (i < 4) await next(page);
  }
  await check(page).getByRole("button", {name: "Previous", exact: true}).click();
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeVisible();
});

test("pendulum lab check: wrong then right, Show me after two misses, the code only after all five, the checker and Start over", async ({page, problems}) => {
  void problems; await open(page);
  await pick(page, WRONGS[0]);
  await expect(check(page).getByRole("button", {name: "Show me", exact: true})).toBeHidden();
  await pick(page, RIGHTS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Correct. The period depends on the square root of the length. Four times the length gives √4 = 2 times the period: 1.189 s becomes 2.378 s.");
  await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await check(page).getByRole("button", {name: "Show me", exact: true}).click();
  await expect(radio(page, /^The model period stays 1\.808 s, and the total energy grows from 0\.047 J to 0\.189 J\. Correct answer$/)).toBeChecked();
  await next(page);
  for (var i = 2; i < 5; i++) {
    await expect(check(page).getByRole("region", {name: "Completion code"})).toHaveCount(0);
    await pick(page, RIGHTS[i]);
    if (i < 4) await next(page);
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("At 0.50 s the lab reads PE 0.001 J and KE 0.619 J, which add up to the 0.620 J total.");
  await expect(check(page).getByText("3 of 5 right on the first try.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Completion code"}).inputValue();
  expect(code).toMatch(/^PLC-/);
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1); expect(decoded.hints).toBe(0);
  expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 1, 1, 1]);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("The Simple Pendulum (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Four times the length: 0 / 1");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Speed at the bottom: 1 / 1");
  await teacher.close();
  await check(page).getByRole("button", {name: "Start over", exact: true}).click();
  await expect(check(page).locator("summary")).toContainText("Question 1 of 5");
  await expect(check(page).getByRole("textbox", {name: "Completion code"})).toHaveCount(0);
});

test("pendulum lab check: keyboard only, from the summary to an answer, Next and Start over", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name: "Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#length")).toHaveValue("0.35");
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
  test("pendulum lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width: size[0], height: size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var sizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => { var r = el.getBoundingClientRect(); return [r.width, r.height]; }));
    sizes.forEach(s => { expect(s[0]).toBeGreaterThanOrEqual(44); expect(s[1]).toBeGreaterThanOrEqual(44); });
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("h2")).toHaveText("Cuatro veces la longitud");
      await expect(check(page).locator("legend")).toContainText("Cambia la longitud a 1.40 m");
      await pick(page, "1.189 s", "Comprobar");
      await expect(check(page).locator(".zsa-labcheck-feedback")).toHaveText("Ese es el periodo inicial. La longitud sí cambia el periodo. Cambia la longitud a 1.40 m y vuelve a leer el laboratorio. Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await check(page).getByRole("button", {name: lang === "es" ? "Preparar el laboratorio" : "Set up the lab", exact: true}).click();
    // The phone layout opens the settings panel so the sliders can be reached.
    await expect(page.locator("#length")).toBeVisible();
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("pendulum lab check: a perfect Spanish run and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  var right = ["2.378 s", /^El periodo del modelo se mantiene en 1\.808 s, y la energía total aumenta/, "3.495 s", "Aproximadamente 5.0% más largo", "2.032 m/s"];
  for (var i = 0; i < 5; i++) {
    await pick(page, right[i], "Comprobar");
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("EP 0.001 J y EC 0.619 J");
  await expect(check(page).getByText("5 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var code = await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue();
  expect(codes.decode(code, 8191).stats.map(s => s.correct)).toEqual([1, 1, 1, 1, 1]);
  await audit(page);
  await check(page).getByRole("button", {name: "Empezar de nuevo", exact: true}).click();
  var wrong = ["1.189 s", /^El periodo del modelo se duplica/, "1.420 s", /^0%\./, "0.000 m/s"];
  for (var j = 0; j < 5; j++) {
    await pick(page, wrong[j], "Comprobar"); await pick(page, wrong[j], "Comprobar");
    await check(page).getByRole("button", {name: "Muéstrame", exact: true}).click();
    if (j < 4) await check(page).getByRole("button", {name: "Siguiente", exact: true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.", {exact: true})).toBeVisible();
  var decoded = codes.decode(await check(page).getByRole("textbox", {name: "Código de finalización"}).inputValue(), 8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s => s.correct)).toEqual([0, 0, 0, 0, 0]);
});
