// Stoichiometry Coach (stoichiometry-coach/): building, reordering and removing conversion factors with the mouse
// and the keyboard, unit cancellation, guided and independent modes, new problems, answer checking with
// significant figures, hints, the worked solution and the solved count; layout, 44 px targets, axe-core at two
// sizes, deep links, embed mode, network and storage, and the landing page link. Selects by role, label and text
// only, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var M = require("../../stoichiometry-coach/model.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/chemistry/unit-6-stoichiometry/3-step-conversions/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "stoichiometry-coach", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

async function go(page, query, seed) {
  if (seed !== undefined) await page.addInitScript(seedRandom, seed);
  await page.goto("/stoichiometry-coach/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Stoichiometry Coach"})).toBeVisible();
}
// The problem on screen, rebuilt from what the page shows (given value, type and reaction).
async function problem(page) {
  var type = await page.getByLabel("Problem type").inputValue();
  var index = Number(await page.getByLabel("Reaction").inputValue());
  var given = await page.locator("#zsa-sc-given").textContent();
  return M.makeProblem(type, index, Number(given.split(" ")[0]));
}
function spoken(f) { return f.n + " " + f.nu + " per " + f.d + " " + f.du; }
// A bank button is named by its factor in words, then "Add factor" (or "In your setup" once it is used).
function addButton(page, f) { return page.getByRole("button", {name: new RegExp("^" + spoken(f).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ", (Add factor|In your setup)$")}); }
function setup(page) { return page.getByRole("list", {name: "Your setup"}); }
function feedback(page) { return page.locator("#zsa-sc-feedback"); }
function result(page) { return page.locator("#zsa-sc-result"); }
function live(page) { return page.locator("#zsa-sc-live"); }
async function add(page, p, id) { await addButton(page, M.factor(p, id)).click(); }
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// Independent arithmetic: given / molar mass in × coefficient ratio × molar mass out, from the page's own masses.
async function expectedAnswer(page) {
  var masses = await page.locator("#zsa-sc-masses dd").allTextContents();
  var mf = parseFloat(masses[0]), mt = parseFloat(masses[1]);
  var eq = await page.locator("#zsa-sc-equation").textContent(), p = await problem(page);
  var coef = function (formula) {
    var m = eq.match(new RegExp("(?:^|[+→] )(\\d+ )?" + formula.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?= |$)"));
    return m && m[1] ? Number(m[1]) : 1;
  };
  var ratio = coef(p.r.to) / coef(p.r.from);
  var v = p.value;
  return {gm: v / mf, mm: v * ratio, gg: v / mf * ratio * mt}[p.type].toPrecision(3);
}

test("default problem: grams to grams, three steps, everything correct, solved once", async ({page, problems}) => {
  void problems;
  await go(page, "", 1);
  await expect(page.getByLabel("Problem type")).toHaveValue("gg");
  await expect(page.getByRole("button", {name: "Guided practice"})).toHaveAttribute("aria-pressed", "true");
  var p = await problem(page);
  await expect(page.locator("#zsa-sc-equation")).toHaveText(p.r.equation);
  await expect(page.getByRole("heading", {level: 2, name: M.question(p)})).toBeVisible();
  await expect(page.locator("#zsa-sc-route")).toHaveText("Grams → Moles → Moles → Grams");
  await expect(page.locator("#zsa-sc-masses")).toContainText(p.r.mf + " g/mol");
  await expect(page.getByRole("group", {name: "Choose a conversion factor"}).getByRole("button")).toHaveCount(8);
  await expect(feedback(page)).toBeHidden();

  await add(page, p, "mass-in");
  await expect(feedback(page)).toHaveText("Your setup ends in mol " + p.r.from + " so far. Continue until you reach " + p.target + ".");
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "mass-in")) + ". Fits: g " + p.r.from + " cancels.");
  await expect(addButton(page, M.factor(p, "mass-in"))).toBeDisabled();
  await add(page, p, "ratio");
  await add(page, p, "mass-out");
  await expect(feedback(page)).toHaveText("Your units and conversion factors are correct.");
  // Every bank button is disabled once the setup is full, and focus has gone to the answer box.
  await expect(page.getByRole("group", {name: "Choose a conversion factor"}).locator("button:not(:disabled)")).toHaveCount(0);
  await expect(page.getByLabel("Numerical answer")).toBeFocused();
  await expect(setup(page).getByRole("listitem")).toHaveCount(4); // the given value and three factors, no empty slot

  var answer = await expectedAnswer(page);
  expect(answer).toBe(p.answer.toPrecision(3));
  await page.getByLabel("Numerical answer").fill(answer);
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(result(page)).toHaveText("✓ Correct! Your conversion setup, value and three significant figures all agree. Solved this session: 1.");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("1");
  await expect(live(page)).toHaveText(/^Correct!/);
  // Checking again does not count twice.
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(result(page)).toHaveText("✓ Correct! Your conversion setup, value and three significant figures all agree.");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("1");
  // A new problem keeps the count, and a second solve adds one.
  await page.getByRole("button", {name: "Next problem"}).click();
  await expect(page.getByLabel("Numerical answer")).toHaveValue("");
  await expect(result(page)).toBeHidden();
  await expect(setup(page).getByRole("listitem")).toHaveCount(2);
  var q = await problem(page);
  expect(q.value).not.toBe(p.value);
  for (var id of q.expected) await add(page, q, id);
  await page.getByLabel("Numerical answer").fill(await expectedAnswer(page));
  await page.getByLabel("Numerical answer").press("Enter");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("2");
});

test("every reaction and problem type plays to a correct answer", async ({page, problems}) => {
  void problems;
  await go(page, "", 2);
  var solved = 0;
  for (var type of ["gm", "mm", "gg"]) {
    for (var i = 0; i < M.REACTIONS.length; i++) {
      await page.getByLabel("Problem type").selectOption(type);
      await page.getByLabel("Reaction").selectOption(String(i));
      var p = await problem(page);
      await expect(page.getByRole("heading", {level: 2, name: M.question(p)})).toBeVisible();
      await expect(page.locator("#zsa-sc-unit")).toHaveText(p.target);
      await expect(page.getByRole("group", {name: "Choose a conversion factor"}).getByRole("button")).toHaveCount(type === "gg" ? 8 : 3);
      for (var id of p.expected) await add(page, p, id);
      await expect(feedback(page)).toHaveText("Your units and conversion factors are correct.");
      var answer = await expectedAnswer(page);
      expect(answer, p.r.id + " " + type).toBe(p.answer.toPrecision(3));
      await page.getByLabel("Numerical answer").fill(answer);
      await page.getByRole("button", {name: "Check my work"}).click();
      solved++;
      await expect(page.locator("#zsa-sc-solved")).toHaveText(String(solved));
    }
  }
});

test("wrong factors: unit mismatch, wrong molar mass and wrong mole ratio, marked and explained", async ({page, problems}) => {
  void problems;
  await go(page, "?reaction=nh3", 3);
  var p = await problem(page);
  await add(page, p, "mass-in-reverse");
  await expect(feedback(page)).toHaveText("You have g N₂. Put g N₂ in the denominator of the next factor so it cancels.");
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "mass-in-reverse")) + ". Does not fit.");
  await page.getByRole("button", {name: "Remove factor 1"}).click();
  await add(page, p, "bad-mass");
  await expect(feedback(page)).toHaveText("Check the molar mass: N₂ has a molar mass of 28.014 g/mol. Units can cancel even when a number is wrong.");
  await page.getByRole("button", {name: "Remove factor 1"}).click();
  await add(page, p, "mass-in");
  await add(page, p, "bad-ratio");
  await expect(feedback(page)).toContainText("coefficients in the balanced equation");
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "mass-in")) + ". Fits");
  await expect(setup(page)).toContainText("Factor 2: " + spoken(M.factor(p, "bad-ratio")) + ". Does not fit.");
  // A wrong setup is reported by Check my work instead of judging the number.
  await add(page, p, "mass-out");
  await page.getByLabel("Numerical answer").fill(p.answer.toPrecision(3));
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(result(page)).toContainText("coefficients in the balanced equation");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("0");
  await page.getByRole("button", {name: "Start over"}).click();
  await expect(setup(page).getByRole("listitem")).toHaveCount(2);
  await expect(page.getByLabel("Numerical answer")).toHaveValue("");
  await expect(live(page)).toHaveText("Setup cleared. Choose your first factor.");
});

test("reordering and removing factors with the mouse", async ({page, problems}) => {
  void problems;
  await go(page, "?reaction=kclo3", 4);
  var p = await problem(page);
  await add(page, p, "ratio");
  await add(page, p, "mass-in");
  await add(page, p, "mass-out");
  await expect(feedback(page)).toHaveText("You have g KClO₃. Put g KClO₃ in the denominator of the next factor so it cancels.");
  await expect(page.getByRole("button", {name: "Move factor 1 left"})).toBeDisabled();
  await expect(page.getByRole("button", {name: "Move factor 3 right"})).toBeDisabled();
  await page.getByRole("button", {name: "Move factor 1 right"}).click();
  await expect(feedback(page)).toHaveText("Your units and conversion factors are correct.");
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "mass-in")));
  await expect(setup(page)).toContainText("Factor 2: " + spoken(M.factor(p, "ratio")));
  await page.getByRole("button", {name: "Move factor 3 left"}).click();
  await expect(setup(page)).toContainText("Factor 2: " + spoken(M.factor(p, "mass-out")) + ". Does not fit.");
  await page.getByRole("button", {name: "Remove factor 2"}).click();
  await expect(setup(page)).toContainText("Factor 2: " + spoken(M.factor(p, "ratio")));
  await expect(feedback(page)).toHaveText("Your setup ends in mol O₂ so far. Continue until you reach g O₂.");
  await expect(addButton(page, M.factor(p, "mass-out"))).toBeEnabled();
  await expect(page.getByText("Choose your next factor")).toBeVisible();
});

test("keyboard only: add, move and remove factors with focus kept in place, then answer", async ({page, problems}) => {
  void problems;
  await go(page, "?reaction=caco3", 5);
  var p = await problem(page);
  var bank = page.getByRole("group", {name: "Choose a conversion factor"});
  await bank.getByRole("button").first().focus();
  // The first bank factor is the reversed mole ratio. Add it with Enter; focus moves to the next enabled factor.
  await page.keyboard.press("Enter");
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "ratio-reverse")));
  await expect(addButton(page, M.factor(p, "mass-in"))).toBeFocused();
  await expect(live(page)).toContainText("Added " + spoken(M.factor(p, "ratio-reverse")) + ". Your setup has 1 of 3 factors.");
  await page.keyboard.press("Space");
  await expect(setup(page)).toContainText("Factor 2: " + spoken(M.factor(p, "mass-in")));
  // Move factor 2 left: focus follows the factor to position 1, where Move left is disabled, so it lands on Move right.
  await page.getByRole("button", {name: "Move factor 2 left"}).focus();
  await page.keyboard.press("Enter");
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "mass-in")));
  await expect(page.getByRole("button", {name: "Move factor 1 right"})).toBeFocused();
  await expect(live(page)).toContainText("Moved factor 2 to position 1.");
  // Remove the reversed ratio, now factor 2: focus goes to the remaining factor's Remove button.
  await page.getByRole("button", {name: "Remove factor 2"}).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", {name: "Remove factor 1"})).toBeFocused();
  await expect(live(page)).toContainText("Removed " + spoken(M.factor(p, "ratio-reverse")) + ".");
  for (var id of ["ratio", "mass-out"]) { await addButton(page, M.factor(p, id)).focus(); await page.keyboard.press("Enter"); }
  await expect(page.getByLabel("Numerical answer")).toBeFocused();
  await page.keyboard.type(p.answer.toPrecision(3));
  await page.keyboard.press("Enter");
  await expect(result(page)).toContainText("Correct!");
  // Tab order reaches the hint, solution and next buttons after Check my work.
  await page.getByRole("button", {name: "Check my work"}).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", {name: "Need a hint?"})).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", {name: "Show worked solution"})).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", {name: "Next problem"})).toBeFocused();
  // The mode buttons and the settings work from the keyboard too.
  await page.getByRole("button", {name: "Independent practice"}).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", {name: "Independent practice"})).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Problem type").focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByLabel("Problem type")).toHaveValue("mm");
});

test("independent mode: no feedback or hint until Check my work; switching modes keeps the problem and setup", async ({page, problems}) => {
  void problems;
  await go(page, "?reaction=al2o3", 6);
  var p = await problem(page);
  await add(page, p, "mass-in");
  await expect(feedback(page)).toBeVisible();
  await page.getByRole("button", {name: "Independent practice"}).click();
  await expect(page.getByRole("button", {name: "Independent practice"})).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", {name: "Guided practice"})).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Try the full problem before checking")).toBeVisible();
  await expect(feedback(page)).toBeHidden();
  await expect(page.getByRole("button", {name: "Need a hint?"})).toBeHidden();
  expect((await problem(page)).value).toBe(p.value);
  await expect(setup(page)).toContainText("Factor 1: " + spoken(M.factor(p, "mass-in")) + ".");
  await expect(setup(page)).not.toContainText("Fits");
  await add(page, p, "ratio-reverse");
  await add(page, p, "mass-out");
  await expect(feedback(page)).toBeHidden();
  await expect(setup(page)).not.toContainText("Does not fit");
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(result(page)).toHaveText("You have mol Al. Put mol Al in the denominator of the next factor so it cancels.");
  await expect(feedback(page)).toBeVisible();
  await expect(setup(page)).toContainText("Factor 2: " + spoken(M.factor(p, "ratio-reverse")) + ". Does not fit.");
  // Editing the setup hides the checked feedback again.
  await page.getByRole("button", {name: "Remove factor 3"}).click();
  await expect(feedback(page)).toBeHidden();
  await expect(result(page)).toBeHidden();
  await page.getByRole("button", {name: "Remove factor 2"}).click();
  await add(page, p, "ratio");
  await add(page, p, "mass-out");
  await page.getByLabel("Numerical answer").fill(p.answer.toPrecision(3));
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(result(page)).toContainText("Correct!");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("1");
  // Back to guided: same problem and setup, feedback shown, hint back.
  await page.getByRole("button", {name: "Guided practice"}).click();
  expect((await problem(page)).value).toBe(p.value);
  await expect(feedback(page)).toHaveText("Your units and conversion factors are correct.");
  await expect(page.getByRole("button", {name: "Need a hint?"})).toBeVisible();
  // ?mode=independent opens in independent mode.
  await go(page, "?mode=independent");
  await expect(page.getByRole("button", {name: "Independent practice"})).toHaveAttribute("aria-pressed", "true");
});

test("answers: significant figures, scientific notation, rounding, wrong values and bad input", async ({page, problems}) => {
  void problems;
  await go(page, "?type=mm&reaction=nh3", 7);
  var p = await problem(page), v = p.answer; // mol NH3 = 2 × given
  await add(page, p, "ratio");
  var input = page.getByLabel("Numerical answer"), check = page.getByRole("button", {name: "Check my work"});
  var cases = [
    ["", "Enter your numerical answer first."],
    ["abc", "Enter a number, such as 4.80 or 1.20e2. Leave the unit out; it is shown beside the box."],
    ["-" + v.toPrecision(3), "An amount of a substance is positive. Check the sign of your answer."],
    [(v * 1.5).toPrecision(3), "Recalculate: multiply the given value by every numerator and divide by every denominator. Keep extra digits until your final answer."],
    [v.toPrecision(5), "The value is right. Show three significant figures. Use a decimal point or scientific notation when needed (for example, 1.20e2)."]
  ];
  for (var c of cases) {
    await input.fill(c[0]);
    await check.click();
    await expect(result(page), c[0]).toHaveText(c[1]);
  }
  await expect(page.locator("#zsa-sc-solved")).toHaveText("0");
  // Typing hides the old result.
  await input.fill("1");
  await expect(result(page)).toBeHidden();
  var sci = Number(v.toPrecision(3)).toExponential(2).replace("e+", "e");
  await input.fill(sci);
  await check.click();
  await expect(result(page)).toContainText("Correct!");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("1");

  // Rounding: a value within half a percent that is not rounded to three figures, on a grams to moles problem.
  await page.getByLabel("Problem type").selectOption("gm");
  var q = await problem(page);
  await add(page, q, "mass-in");
  await input.fill((q.answer * 1.003).toPrecision(4));
  await check.click();
  await expect(result(page)).toHaveText("Your calculation is close. Round the final answer to three significant figures, keeping extra digits until the end.");
  var mant = Number(q.answer.toPrecision(3)), exp = Math.floor(Math.log10(mant));
  await input.fill((mant / Math.pow(10, exp)).toFixed(2) + " x 10^" + exp);
  await check.click();
  await expect(result(page)).toContainText("Correct!");
});

test("hints: guided only; a second hint names the next factor; a wrong setup gets its own hint", async ({page, problems}) => {
  void problems;
  await go(page, "?reaction=h2o", 8);
  var p = await problem(page), hint = page.getByRole("button", {name: "Need a hint?"}), box = page.locator("#zsa-sc-hintbox");
  await hint.click();
  await expect(box).toHaveText("Start with grams of H₂. Use its molar mass (2.016 g/mol), with grams in the denominator.");
  await expect(hint).toBeFocused();
  await hint.click();
  await expect(box).toHaveText("Start with grams of H₂. Use its molar mass (2.016 g/mol), with grams in the denominator. The next factor is 1 mol H₂ / 2.016 g H₂.");
  await expect(live(page)).toHaveText(/^Hint: /);
  await add(page, p, "mass-in");
  await expect(box).toBeHidden();
  await hint.click();
  await expect(box).toHaveText("Use the balanced equation: 2 mol H₂ corresponds to 2 mol H₂O. Put the substance you have in the denominator. The next factor is 2 mol H₂O / 2 mol H₂.");
  await add(page, p, "mass-out");
  await hint.click();
  await expect(box).toHaveText("You have mol H₂. Put mol H₂ in the denominator of the next factor so it cancels.");
  await page.getByRole("button", {name: "Remove factor 2"}).click();
  await add(page, p, "ratio");
  await add(page, p, "mass-out");
  await hint.click();
  await expect(box).toHaveText("Multiply the given value by every numerator and divide by every denominator. Round only once, to three significant figures.");
});

test("worked solution: shown and focused; solving afterwards does not add to the count; a new problem can", async ({page, problems}) => {
  void problems;
  await go(page, "?reaction=kclo3", 9);
  var p = await problem(page);
  await page.getByRole("button", {name: "Show worked solution"}).click();
  var box = page.locator("#zsa-sc-solutionbox");
  await expect(box).toBeFocused();
  await expect(box.getByRole("heading", {name: "Worked solution"})).toBeVisible();
  await expect(box).toContainText("Follow the units from " + p.start + " to " + p.target + ".");
  await expect(box.getByRole("listitem")).toHaveText([
    "Convert grams to moles of KClO₃ using its molar mass.",
    "Convert moles of KClO₃ to moles of O₂ using the balanced coefficients.",
    "Convert moles to grams of O₂ using its molar mass."]);
  await expect(box).toContainText("Unrounded: " + p.answer.toPrecision(9) + " g O₂. Final answer: " + p.answer.toPrecision(3) + " g O₂ (three significant figures).");
  await expect(box).toContainText(p.value.toPrecision(3) + " g KClO₃ × " + p.expected.map((id) => spoken(M.factor(p, id))).join(" × ") + " = " + p.answer.toPrecision(3) + " g O₂");
  for (var id of p.expected) await add(page, p, id);
  await page.getByLabel("Numerical answer").fill(p.answer.toPrecision(3));
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(result(page)).toHaveText("✓ Correct! Your conversion setup, value and three significant figures all agree. This problem was completed with the worked solution visible, so it does not add to your solved count.");
  await expect(page.locator("#zsa-sc-solved")).toHaveText("0");
  // Changing the reaction starts a new problem, which can be credited.
  await page.getByLabel("Reaction").selectOption("0");
  await expect(box).toBeHidden();
  var q = await problem(page);
  for (var id2 of q.expected) await add(page, q, id2);
  await page.getByLabel("Numerical answer").fill(q.answer.toPrecision(3));
  await page.getByRole("button", {name: "Check my work"}).click();
  await expect(page.locator("#zsa-sc-solved")).toHaveText("1");
});

test("settings: changing type or reaction starts a new problem; New problem changes the value", async ({page, problems}) => {
  void problems;
  await go(page, "", 10);
  var p = await problem(page);
  await add(page, p, "mass-in");
  await page.getByLabel("Problem type").selectOption("gm");
  await expect(setup(page).getByRole("listitem")).toHaveCount(2);
  await expect(page.locator("#zsa-sc-route")).toHaveText("Grams → Moles");
  await expect(page.getByText("No mole ratio is needed.")).toBeVisible();
  var a = await problem(page);
  await page.getByRole("button", {name: "New problem"}).click();
  await expect(page.getByRole("button", {name: "New problem"})).toBeFocused();
  var b = await problem(page);
  expect(b.value).not.toBe(a.value);
  expect(b.type).toBe("gm");
  await expect(live(page)).toHaveText("New problem. " + M.question(b));
  // Deep links pick the type and reaction; unknown values are ignored.
  await go(page, "?type=mm&reaction=caco3");
  await expect(page.getByLabel("Problem type")).toHaveValue("mm");
  await expect(page.getByLabel("Reaction")).toHaveValue("3");
  await go(page, "?type=zz&reaction=nope");
  await expect(page.getByLabel("Problem type")).toHaveValue("gg");
  await expect(page.getByLabel("Reaction")).toHaveValue("0");
  // Nothing persists after a reload.
  await page.reload();
  await expect(page.locator("#zsa-sc-solved")).toHaveText("0");
});

test("layout: no sideways scrolling from 320 to 1920 px and at 200% zoom; 44 px targets", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?reaction=al2o3", 11);
    var p = await problem(page);
    await add(page, p, "mass-in");
    await add(page, p, "ratio");
    await add(page, p, "mass-out");
    await page.getByRole("button", {name: "Show worked solution"}).click();
    var sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, w + " px").toBeLessThanOrEqual(w);
    var small = await page.locator("main button:visible, main select:visible, main input:visible").evaluateAll((els) =>
      els.map((e) => { var r = e.getBoundingClientRect(); return {name: e.getAttribute("aria-label") || e.textContent.trim() || e.id, w: r.width, h: r.height}; })
        .filter((r) => r.w < 44 || r.h < 44));
    expect(small, w + " px").toEqual([]);
  }
});

test("axe-core: no violations in six states at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?reaction=nh3", 12);
    var p = await problem(page);
    await audit(page, w + " start");
    await add(page, p, "mass-in");
    await add(page, p, "bad-ratio");
    await audit(page, w + " wrong factor");
    await page.getByRole("button", {name: "Need a hint?"}).click();
    await audit(page, w + " hint");
    await page.getByRole("button", {name: "Remove factor 2"}).click();
    await add(page, p, "ratio");
    await add(page, p, "mass-out");
    await page.getByLabel("Numerical answer").fill("1");
    await page.getByRole("button", {name: "Check my work"}).click();
    await audit(page, w + " wrong answer");
    await page.getByRole("button", {name: "Show worked solution"}).click();
    await audit(page, w + " solution");
    await page.getByRole("button", {name: "Independent practice"}).click();
    await page.locator("summary").click();
    await audit(page, w + " independent with tip open");
  }
});

test("back link, embed mode, network and storage", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page);
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", DEFAULT_BACK);
  var origin = new URL(page.url()).origin;
  requests.forEach((u) => expect(u.startsWith(origin), u).toBe(true));
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u, u).toContain("?v="));
  requests.filter((u) => /stoichiometry-coach\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  var p = await problem(page);
  await add(page, p, "mass-in");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);

  var lesson = "https://zornscience.org/science/chemistry/unit-6-stoichiometry/mole-ratios/";
  await go(page, "?from=" + encodeURIComponent(lesson));
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", lesson);
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: "← Back to the lesson"}), bad).toHaveAttribute("href", DEFAULT_BACK);
  }
  await go(page, "?embed=1&type=gm&from=" + encodeURIComponent(lesson));
  await expect(page.locator("#zsa-sc-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  await expect(page.getByLabel("Problem type")).toHaveValue("gm");
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
});

test("landing page links to the Stoichiometry Coach", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Stoichiometry Coach"}).click();
  await expect(page).toHaveTitle("Stoichiometry Coach | ZornScience");
});
