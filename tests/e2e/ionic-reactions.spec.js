// Ionic Reaction Builder: independently solve the introductory reaction, exercise both ways of placing ions,
// reject incorrect formulas and coefficients, count ions live, and check access on keyboard and small screens.
"use strict";
var fs = require("fs");
var {test, expect, seedRandom} = require("./fixtures");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function go(page, fixedRandom) {
  if (fixedRandom === undefined) await page.addInitScript(seedRandom, 5);
  else await page.addInitScript((value) => { Math.random = function () { return value; }; }, fixedRandom);
  await page.goto("/ionic-reactions/");
  await expect(page.getByRole("heading", {level: 1, name: "Ionic Reaction Builder"})).toBeVisible();
  await expect(page.locator("#zsa-ir-bank [data-ion]")).toHaveCount(4);
}
function ion(page, id) { return page.locator("#zsa-ir-bank [data-ion='" + id + "']"); }
function slot(page, product, part) {
  return page.locator("#zsa-ir-products [data-product='" + product + "'][data-part='" + part + "']");
}
function subscript(page, product, part) {
  return page.getByLabel("Product " + (product + 1) + " " + part + " subscript", {exact: true});
}
function coefficient(page, formula) { return page.getByLabel("Coefficient for " + formula, {exact: true}); }
async function place(page, id, product, part, keyboard) {
  if (keyboard) {
    await ion(page, id).focus();
    await page.keyboard.press("Enter");
    await slot(page, product, part).focus();
    await page.keyboard.press("Space");
  } else {
    await ion(page, id).click();
    await slot(page, product, part).click();
  }
}
async function products(page, reverse, keyboard) {
  var barium = reverse ? 1 : 0, sodium = reverse ? 0 : 1;
  await place(page, "ba", barium, "cation", keyboard);
  await place(page, "oh", barium, "anion", keyboard);
  await place(page, "na", sodium, "cation", keyboard);
  await place(page, "cl", sodium, "anion", keyboard);
  await subscript(page, barium, "anion").fill("2");
}
async function unlock(page, reverse) {
  await products(page, reverse);
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
}
async function balance(page) {
  await coefficient(page, "BaCl2").fill("1");
  await coefficient(page, "NaOH").fill("2");
  await coefficient(page, "Ba(OH)2").fill("1");
  await coefficient(page, "NaCl").fill("2");
}
async function counts(page, symbol) {
  var row = page.locator("#zsa-ir-counts tr").filter({has: page.getByRole("rowheader", {name: new RegExp("^" + symbol + "(?:[^a-z]|$)")})});
  await expect(row).toHaveCount(1);
  return (await row.locator("td").allTextContents()).slice(0, 2).map(Number);
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("starts with barium chloride and sodium hydroxide, with balancing gated behind products", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page.locator("#zsa-ir-round")).toHaveText("Problem 1");
  await expect(page.locator("#zsa-ir-reactants")).toContainText("BaCl2");
  await expect(page.locator("#zsa-ir-reactants")).toContainText("NaOH");
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await expect(page.locator("#zsa-ir-feedback")).not.toBeEmpty();
});

test("unchanged reactants and wrong subscripts do not unlock balancing; hydroxide stays one grouped ion", async ({page, problems}) => {
  void problems;
  await go(page);
  await place(page, "ba", 0, "cation");
  await place(page, "cl", 0, "anion");
  await place(page, "na", 1, "cation");
  await place(page, "oh", 1, "anion");
  await subscript(page, 0, "anion").fill("2");
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-feedback")).toContainText(/swap/i);
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await place(page, "oh", 0, "anion");
  await place(page, "cl", 1, "anion");
  await subscript(page, 0, "anion").fill("1");
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-feedback")).toContainText(/subscripts/i);
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await subscript(page, 0, "anion").fill("2");
  await expect(page.locator("#zsa-ir-products")).toContainText("Ba(OH)2");
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
});

test("keyboard placement accepts products in either order and balances the equation", async ({page, problems}) => {
  void problems;
  await go(page);
  await products(page, true, true);
  await page.getByRole("button", {name: "Check products", exact: true}).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
  await balance(page);
  await page.getByRole("button", {name: "Check balance", exact: true}).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
});

test("HTML drag and drop places ions, while the same ion remains available in the bank", async ({page, problems}) => {
  void problems;
  await go(page);
  var transfer = await page.evaluateHandle(() => new DataTransfer());
  await expect(ion(page, "ba")).toHaveAttribute("draggable", "true");
  await ion(page, "ba").dispatchEvent("dragstart", {dataTransfer: transfer});
  await slot(page, 0, "cation").dispatchEvent("dragover", {dataTransfer: transfer});
  await slot(page, 0, "cation").dispatchEvent("drop", {dataTransfer: transfer});
  await expect(slot(page, 0, "cation")).toContainText("Ba");
  await expect(ion(page, "ba")).toBeVisible();
  await transfer.dispose();
  await place(page, "oh", 0, "anion");
  await place(page, "na", 1, "cation");
  await place(page, "cl", 1, "anion");
  await subscript(page, 0, "anion").fill("2");
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
});

test("coefficient edits update whole-ion counts immediately and the smallest ratio unlocks the next problem", async ({page, problems}) => {
  void problems;
  await go(page);
  await unlock(page);
  expect(await counts(page, "Ba")).toEqual([1, 1]);
  expect(await counts(page, "Cl")).toEqual([2, 1]);
  expect(await counts(page, "Na")).toEqual([1, 1]);
  expect(await counts(page, "OH")).toEqual([1, 2]);
  await coefficient(page, "NaOH").fill("2");
  expect(await counts(page, "Na")).toEqual([2, 1]);
  expect(await counts(page, "OH")).toEqual([2, 2]);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  await coefficient(page, "NaCl").fill("2");
  expect(await counts(page, "Cl")).toEqual([2, 2]);
  expect(await counts(page, "Na")).toEqual([2, 2]);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
  await expect(page.locator("#zsa-ir-live")).not.toBeEmpty();
  // A previously checked equation must not stay complete after an unbalancing edit.
  await coefficient(page, "NaOH").fill("1");
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  await coefficient(page, "NaOH").fill("2");
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
  var previous = await page.locator("#zsa-ir-reactants").textContent();
  await page.getByRole("button", {name: "Next reaction", exact: true}).click();
  await expect(page.locator("#zsa-ir-round")).toHaveText("Problem 2");
  await expect(page.locator("#zsa-ir-reactants")).not.toHaveText(previous);
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  await expect(page.locator("#zsa-ir-round")).toBeFocused();
});

test("zero, negative and fractional coefficients cannot pass; balanced multiples must be reduced", async ({page, problems}) => {
  void problems;
  await go(page);
  await unlock(page);
  await balance(page);
  for (var value of ["0", "-1", "1.5"]) {
    await coefficient(page, "BaCl2").fill(value);
    await page.getByRole("button", {name: "Check balance", exact: true}).click();
    await expect(page.locator("#zsa-ir-feedback")).toContainText(/whole numbers/i);
    await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  }
  for (var pair of [["BaCl2", "2"], ["NaOH", "4"], ["Ba(OH)2", "2"], ["NaCl", "4"]]) await coefficient(page, pair[0]).fill(pair[1]);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.locator("#zsa-ir-feedback")).toContainText(/smallest/i);
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  await balance(page);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
});

test("large coefficient buttons update ion counts, work from the keyboard and respect the allowed range", async ({page, problems}) => {
  void problems;
  await go(page);
  await unlock(page);
  var increase = page.getByRole("button", {name: "Increase coefficient for NaOH", exact: true});
  var decrease = page.getByRole("button", {name: "Decrease coefficient for NaOH", exact: true});
  var input = coefficient(page, "NaOH");
  var buttons = page.getByRole("button", {name: /^(Increase|Decrease) coefficient for /});
  await expect(buttons).toHaveCount(8);
  for (var button of await buttons.all()) {
    var box = await button.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(48);
    expect(box.height).toBeGreaterThanOrEqual(48);
  }
  await increase.click();
  await expect(input).toHaveValue("2");
  expect(await counts(page, "Na")).toEqual([2, 1]);
  expect(await counts(page, "OH")).toEqual([2, 2]);
  await decrease.focus();
  await page.keyboard.press("Space");
  await expect(input).toHaveValue("1");
  expect(await counts(page, "OH")).toEqual([1, 2]);
  if (await decrease.isEnabled()) await decrease.click();
  await expect(input).toHaveValue("1");
  await increase.focus();
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("2");
  await input.fill("99");
  if (await increase.isEnabled()) await increase.click();
  await expect(input).toHaveValue("99");
  await decrease.click();
  await expect(input).toHaveValue("98");
  await input.fill("");
  await increase.click();
  await expect(input).toHaveValue("2");
  await input.fill("");
  await decrease.click();
  await expect(input).toHaveValue("1");
  await balance(page);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
  await page.getByRole("button", {name: "Decrease coefficient for BaCl2", exact: true}).click();
  await expect(coefficient(page, "BaCl2")).toHaveValue("1");
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
  await increase.click();
  await expect(input).toHaveValue("3");
  expect(await counts(page, "Na")).toEqual([3, 2]);
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeDisabled();
  await decrease.click();
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
});

test("an incomplete numeric subscript is rejected instead of being treated as the optional blank for one", async ({page, problems}) => {
  void problems;
  await go(page);
  await products(page);
  var input = subscript(page, 0, "cation");
  await input.focus();
  await page.keyboard.press("-");
  expect(await input.evaluate((element) => element.validity.badInput)).toBe(true);
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await expect(page.locator("#zsa-ir-feedback")).toContainText(/subscripts/i);
  await input.fill("");
  await page.getByRole("button", {name: "Check products", exact: true}).click();
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
});

test("a random sequence carries fresh formulas and ion counts through phosphate, sulfate and ammonium problems", async ({page, problems}) => {
  void problems;
  // A fixed random source selects known exercises without requesting any application answers.
  // Formula counts and coefficients below come from charge neutrality and atom conservation.
  await go(page, 0.2);
  var cases = [
    {reactants: ["BaCl2", "NaOH"], products: [["ba", "oh", 1, 2], ["na", "cl", 1, 1]], formulas: ["Ba(OH)2", "NaCl"], coefficients: [1, 2, 1, 2], counts: {Ba: 1, Cl: 2, Na: 2, OH: 2}},
    {reactants: ["CaCl2", "Na3PO4"], products: [["ca", "po4", 3, 2], ["na", "cl", 1, 1]], formulas: ["Ca3(PO4)2", "NaCl"], coefficients: [3, 2, 1, 6], counts: {Ca: 3, Cl: 6, Na: 6, PO4: 2}},
    {reactants: ["Al2(SO4)3", "CaCl2"], products: [["al", "cl", 1, 3], ["ca", "so4", 1, 1]], formulas: ["AlCl3", "CaSO4"], coefficients: [1, 3, 2, 3], counts: {Al: 2, SO4: 3, Ca: 3, Cl: 6}},
    {reactants: ["(NH4)2SO4", "BaCl2"], products: [["nh4", "cl", 1, 1], ["ba", "so4", 1, 1]], formulas: ["NH4Cl", "BaSO4"], coefficients: [1, 1, 2, 1], counts: {NH4: 2, SO4: 1, Ba: 1, Cl: 2}}
  ];
  for (var [index, example] of cases.entries()) {
    await expect(page.locator("#zsa-ir-round")).toHaveText("Problem " + (index + 1));
    for (var reactant of example.reactants) await expect(page.locator("#zsa-ir-reactants")).toContainText(reactant);
    for (var product = 0; product < 2; product++) {
      var answer = example.products[product];
      await place(page, answer[0], product, "cation");
      await place(page, answer[1], product, "anion");
      await subscript(page, product, "cation").fill(String(answer[2]));
      await subscript(page, product, "anion").fill(String(answer[3]));
      await expect(page.locator("#zsa-ir-products")).toContainText(example.formulas[product]);
    }
    await page.getByRole("button", {name: "Check products", exact: true}).click();
    await expect(page.locator("#zsa-ir-balance")).toBeVisible();
    var formulas = example.reactants.concat(example.formulas);
    for (var term = 0; term < 4; term++) await coefficient(page, formulas[term]).fill(String(example.coefficients[term]));
    for (var symbol of Object.keys(example.counts)) expect(await counts(page, symbol)).toEqual([example.counts[symbol], example.counts[symbol]]);
    await page.getByRole("button", {name: "Check balance", exact: true}).click();
    await expect(page.locator("#zsa-ir-progress")).toHaveText((index + 1) + " reaction" + (index ? "s" : "") + " balanced");
    await expect(page.getByRole("button", {name: "Next reaction", exact: true})).toBeEnabled();
    if (index < cases.length - 1) await page.getByRole("button", {name: "Next reaction", exact: true}).click();
  }
});

test("axe-core finds no violations before predicting and while balancing at desktop and phone sizes", async ({page, problems}) => {
  void problems;
  await go(page);
  await audit(page, "desktop prediction");
  await unlock(page);
  await audit(page, "desktop balancing");
  await page.setViewportSize({width: 390, height: 664});
  await audit(page, "phone balancing");
  await balance(page);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await audit(page, "phone balanced");
});

test("the prediction and balancing controls fit small screens and retain 44 px targets", async ({page, problems}) => {
  void problems;
  await go(page);
  for (var stage of ["prediction", "balancing"]) {
    if (stage === "balancing") await unlock(page);
    for (var [width, height] of [[320, 568], [390, 664], [768, 1024], [1366, 657]]) {
      await page.setViewportSize({width: width, height: height});
      var result = await page.evaluate(() => {
        var small = [];
        document.querySelectorAll("button, input, select, a").forEach((el) => {
          var r = el.getBoundingClientRect();
          if (!r.width || !r.height || el.closest("[hidden]")) return;
          if (r.width < 43.5 || r.height < 43.5) small.push((el.id || el.getAttribute("aria-label") || el.tagName) + " " + Math.round(r.width) + "x" + Math.round(r.height));
        });
        return {overflow: document.documentElement.scrollWidth - innerWidth, small: small};
      });
      expect(result.overflow, stage + " at " + width).toBeLessThanOrEqual(0);
      expect(result.small, stage + " targets at " + width).toEqual([]);
    }
  }
});

test("practice makes only local requests, writes no storage, and supports embed mode", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page);
  await unlock(page);
  await balance(page);
  await page.getByRole("button", {name: "Check balance", exact: true}).click();
  await page.getByRole("button", {name: "Next reaction", exact: true}).click();
  expect(requests.every((url) => url.startsWith("http://127.0.0.1:"))).toBe(true);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.goto("/ionic-reactions/?embed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect(page.locator("footer")).toBeHidden();
});
