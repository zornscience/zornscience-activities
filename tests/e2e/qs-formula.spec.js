// Rearranging Equations Practice: the typed-equation questions in the browser, in English and Spanish. A typed question
// is found by playing the Solve topic with a seeded random generator; the expected verdicts come from the lesson's own
// rearrangements (typed again here), not from the page.
"use strict";
const fs = require("node:fs");
const {test, expect, seedRandom} = require("./fixtures");
const M = require("../../shared/zsa-practice-model.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const bank = require("../../qs-rearranging-equations-practice/data.js")(M);
const PATH = "/qs-rearranging-equations-practice/";
const strip = html => html.replace(/<\/?su[bp]>/g, "");

const el = (page, name) => page.locator("#zsa-qre-" + name);
const current = async page => bank.rebuild(await el(page, "play").getAttribute("data-question-id"));
async function audit(page) {
  await page.evaluate(AXE);
  const result = await page.evaluate(() => window.axe.run(document, {runOnly:{type:"tag", values:["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map(v => ({id:v.id, targets:v.nodes.map(n => n.target)}))).toEqual([]);
}
async function noOverflow(page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
// Start the Solve topic and answer multiple-choice questions until the typed one with this id prefix comes up.
async function reachTyped(page, lang, wanted) {
  await page.addInitScript(seedRandom, 4242);
  await page.goto(PATH + (lang === "es" ? "?lang=es" : ""));
  await el(page, "topic").selectOption("solve");
  await el(page, "start").click();
  for (let i = 0; i < 8; i++) {
    const q = await current(page);
    if (q.type === "formula" && (!wanted || q.id.startsWith(wanted))) return q;
    if (q.type === "mc") await page.locator('input[name="answer"][value="0"]').check();
    else await el(page, "equation").fill(q.formula.target + " = " + q.formula.answer);
    await el(page, "check").click();
    await el(page, "next").click();
  }
  throw new Error("no typed question in 8 questions");
}
// Every case and spelling is covered in tests/unit/zsa-formula.test.js; here each language gets the full interaction.

for (const lang of ["en", "es"]) {
  const L = lang === "es"
    ? {correct:"Correcto.", incorrect:"Incorrecto.", answer:"Respuesta correcta: ", label:"Tu ecuación", help:"Escríbela como t = d/v.", alone:/sola en un lado del signo igual/, letters:/La letra .* no está en este problema/, empty:"Primero escribe tu ecuación.", equals:"Escribe una ecuación con un solo signo igual, como t = d/v.", intro:"Escribe una ecuación con"}
    : {correct:"Correct.", incorrect:"Incorrect.", answer:"Correct answer: ", label:"Your equation", help:"Type it like t = d/v.", alone:/alone on one side of the equals sign/, letters:/The letter .* is not in this problem/, empty:"Type your equation first.", equals:"Write one equation with a single equals sign, like t = d/v.", intro:"Write an equation with"};

  test("a typed question: the field, its hint and help, unreadable answers do not count, an equivalent form is right, in " + lang, async ({page, problems}) => {
    void problems;
    const q = await reachTyped(page, lang);
    const f = q.formula, target = f.variables.find(v => v.name === f.target).spellings[0];
    const equation = el(page, "equation");
    // The question, the hint under it naming the letters, the labelled field with its help, and no number or choice controls.
    await expect(el(page, "question")).toHaveText(strip(q.prompt[lang]));
    await expect(el(page, "question")).toBeFocused();
    await expect(el(page, "formula-hint")).toHaveText(strip(q.instruction[lang]));
    await expect(el(page, "formula-hint")).toContainText(L.intro);
    await expect(page.getByLabel(L.label, {exact:true})).toBeVisible();
    await expect(el(page, "formula-help")).toContainText(L.help);
    await expect(el(page, "numeric")).toBeHidden();
    await expect(el(page, "choices")).toBeHidden();
    expect(await equation.getAttribute("aria-describedby")).toBe("zsa-qre-formula-hint zsa-qre-formula-help zsa-qre-error");
    await page.keyboard.press("Tab");
    await expect(equation).toBeFocused();
    const score = await el(page, "score").textContent();
    // Unreadable answers: an alert, aria-invalid, focus stays, nothing is scored and the question stays open.
    await el(page, "check").click();
    await expect(el(page, "error")).toHaveText(L.empty);
    await expect(equation).toBeFocused();
    await equation.fill(f.answer);
    await el(page, "check").click();
    await expect(el(page, "error")).toHaveText(L.equals);
    await expect(equation).toHaveAttribute("aria-invalid", "true");
    await equation.fill(target + " = " + f.answer + " = " + target);
    await el(page, "check").click();
    await expect(el(page, "error")).toHaveText(L.equals);
    await equation.fill(target + " = " + f.answer.replace(/[A-Za-z]/, "?"));
    await el(page, "check").click();
    await expect(el(page, "error")).not.toHaveText("");
    await audit(page);
    await noOverflow(page);
    const unsolved = f.variables.find(v => v.name !== f.target).spellings[0];
    await equation.fill(unsolved + " = " + f.answer);
    await el(page, "check").click();
    await expect(el(page, "error")).toHaveText(L.alone);
    await expect(el(page, "feedback")).toBeHidden();
    await expect(el(page, "check")).toBeEnabled();
    await expect(el(page, "score")).toHaveText(score);
    // The key turned around, with a different spelling of the operators, is right.
    const spelled = f.answer.replace(/\//g, " ÷ ").replace(/−/g, "-");
    await equation.fill(spelled + " = " + target);
    await page.keyboard.press("Enter");
    await expect(el(page, "feedback")).toContainText(L.correct);
    await expect(el(page, "feedback")).toContainText(L.answer + strip(q.answerText[lang]));
    await expect(el(page, "feedback")).toContainText(strip(q.explanation[lang]));
    await expect(el(page, "error")).toHaveText("");
    await expect(equation).toBeDisabled();
    await expect(el(page, "next")).toBeFocused();
    await expect(el(page, "score")).not.toHaveText(score);
    await audit(page);
    await noOverflow(page);
    await el(page, "next").click();
    await expect(equation).toBeEnabled();
  });

  test("a wrong typed answer is scored once, a known mistake shows its own note, in " + lang, async ({page, problems}) => {
    void problems;
    const q = await reachTyped(page, lang);
    const f = q.formula, target = f.variables.find(v => v.name === f.target).spellings[0], trap = f.traps[0];
    await el(page, "equation").fill(target + " = " + trap.expr);
    await el(page, "check").click();
    await expect(el(page, "feedback")).toContainText(L.incorrect);
    await expect(el(page, "feedback")).toContainText(strip(trap.note[lang]));
    await expect(el(page, "feedback")).toContainText(L.answer + strip(q.answerText[lang]));
    await expect(el(page, "equation")).toBeDisabled();
    await expect(el(page, "check")).toBeDisabled();
    await expect(el(page, "feedback").locator(".is-wrong, :scope.is-wrong").first()).toBeVisible();
    await audit(page);
    // A well-formed equation that matches no known mistake gets the general note.
    await el(page, "next").click();
    const q2 = await current(page);
    if (q2.type === "formula") {
      const t2 = q2.formula.variables.find(v => v.name === q2.formula.target).spellings[0];
      await el(page, "equation").fill(t2 + " = 987654321");
      await el(page, "check").click();
      await expect(el(page, "feedback")).toContainText(lang === "es" ? "mismo paso en ambos lados" : "same step to both sides");
    }
  });

  test("keyboard only: type, Enter to check, Enter for the next question, in " + lang, async ({page, problems}) => {
    void problems;
    const q = await reachTyped(page, lang);
    const target = q.formula.variables.find(v => v.name === q.formula.target).spellings[0];
    await page.keyboard.press("Tab");
    await expect(el(page, "equation")).toBeFocused();
    expect(await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2; })).toBe(true);
    await page.keyboard.type(target + " = " + q.formula.answer);
    await page.keyboard.press("Enter");
    await expect(el(page, "feedback")).toContainText(L.correct);
    await expect(el(page, "next")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(el(page, "question")).toBeFocused();
  });
}

test("the lesson's own examples, typed as a student would", async () => {
  // d = vt and d = tv, t = d/v and t = 1/v × d, v = d/t and v = d ÷ t are right; d = v/t is not.
  const F = require("../../shared/zsa-formula.js");
  const q = bank.rebuild("ty|dvt|t"), r = bank.rebuild("ty|dvt|v");
  for (const raw of ["t = d/v", "t = 1/v × d", "t = d ÷ v", "d/v = t"]) expect(F.judge(q, raw).correct, raw).toBe(true);
  for (const raw of ["v = d/t", "v = d ÷ t", "v = 1/t × d"]) expect(F.judge(r, raw).correct, raw).toBe(true);
  expect(F.judge(r, "v = t/d").correct).toBe(false);
  expect(F.judge(q, "t = v/d").correct).toBe(false);
});

test("a phone width: the typed question fits at 320 px and the field is a comfortable target", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width:320, height:740});
  await reachTyped(page, "en");
  await noOverflow(page);
  const box = await el(page, "equation").boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeLessThanOrEqual(320);
  await audit(page);
});
