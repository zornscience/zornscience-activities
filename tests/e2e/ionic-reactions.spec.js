// Reaction Builder: selectable practice families, independent chemistry anchors, equation layout,
// accessible controls, feedback accounting, sharing and responsive behavior.
"use strict";
var fs = require("fs");
var {test, expect, seedRandom} = require("./fixtures");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var SHARE_URL = "https://activities.zornscience.org/ionic-reactions/";
var TYPES = ["synthesis", "decomposition", "single-replacement", "double-replacement"];

// Filled from independently written formula and balancing references, never the application's solver.
function product(formula, parts) { return {formula: formula, parts: parts}; }
function reference(reactants, products, coefficients) { return {reactants: reactants, products: products, coefficients: coefficients}; }
var WATER = product("H2O", [["h_atom", 2], ["o_atom", 1]]);
var CARBON_DIOXIDE = product("CO2", [["c_atom", 1], ["o_atom", 2]]);
var REFERENCES = {
  "magnesium-oxygen": reference(["Mg", "O2"], [product("MgO", [["mg", 1], ["o", 1]])], [2, 1, 2]),
  "calcium-oxygen": reference(["Ca", "O2"], [product("CaO", [["ca", 1], ["o", 1]])], [2, 1, 2]),
  "aluminum-oxygen": reference(["Al", "O2"], [product("Al2O3", [["al", 2], ["o", 3]])], [4, 3, 2]),
  "sodium-chlorine": reference(["Na", "Cl2"], [product("NaCl", [["na", 1], ["cl", 1]])], [2, 1, 2]),
  "hydrogen-oxygen": reference(["H2", "O2"], [WATER], [2, 1, 2]),
  "iron-sulfur": reference(["Fe", "S"], [product("FeS", [["fe", 1], ["s", 1]])], [1, 1, 1]),
  "peroxide-breakdown": reference(["H2O2"], [WATER, product("O2", [["o_atom", 2]])], [2, 2, 1]),
  "water-electrolysis": reference(["H2O"], [product("H2", [["h_atom", 2]]), product("O2", [["o_atom", 2]])], [2, 2, 1]),
  "silver-oxide-breakdown": reference(["Ag2O"], [product("Ag", [["ag_atom", 1]]), product("O2", [["o_atom", 2]])], [2, 4, 1]),
  "zinc-hydrochloric": reference(["Zn", "HCl"], [product("ZnCl2", [["zn", 1], ["cl", 2]]), product("H2", [["h_atom", 2]])], [1, 2, 1, 1]),
  "magnesium-hydrochloric": reference(["Mg", "HCl"], [product("MgCl2", [["mg", 1], ["cl", 2]]), product("H2", [["h_atom", 2]])], [1, 2, 1, 1]),
  "iron-copper-sulfate": reference(["Fe", "CuSO4"], [product("FeSO4", [["fe", 1], ["so4", 1]]), product("Cu", [["cu_atom", 1]])], [1, 1, 1, 1]),
  "copper-silver-nitrate": reference(["Cu", "AgNO3"], [product("Cu(NO3)2", [["cu", 1], ["no3", 2]]), product("Ag", [["ag_atom", 1]])], [1, 2, 1, 2]),
  "chlorine-bromide": reference(["Cl2", "KBr"], [product("KCl", [["k", 1], ["cl", 1]]), product("Br2", [["br_atom", 2]])], [1, 2, 2, 1]),
  "zinc-copper-sulfate": reference(["Zn", "CuSO4"], [product("ZnSO4", [["zn", 1], ["so4", 1]]), product("Cu", [["cu_atom", 1]])], [1, 1, 1, 1]),
  "calcium-carbonate": reference(["CaCl2", "Na2CO3"], [product("CaCO3", [["ca", 1], ["co3", 1]]), product("NaCl", [["na", 1], ["cl", 1]])], [1, 1, 1, 2]),
  "silver-chloride": reference(["AgNO3", "NaCl"], [product("AgCl", [["ag", 1], ["cl", 1]]), product("NaNO3", [["na", 1], ["no3", 1]])], [1, 1, 1, 1]),
  "magnesium-hydroxide": reference(["Mg(NO3)2", "KOH"], [product("Mg(OH)2", [["mg", 1], ["oh", 2]]), product("KNO3", [["k", 1], ["no3", 1]])], [1, 2, 1, 2]),
  "silver-iodate": reference(["AgNO3", "NaIO3"], [product("AgIO3", [["ag", 1], ["io3", 1]]), product("NaNO3", [["na", 1], ["no3", 1]])], [1, 1, 1, 1]),
  "calcium-sulfite": reference(["Ca(NO3)2", "Na2SO3"], [product("CaSO3", [["ca", 1], ["so3", 1]]), product("NaNO3", [["na", 1], ["no3", 1]])], [1, 1, 1, 2]),
  "calcium-phosphate": reference(["CaCl2", "Na3PO4"], [product("Ca3(PO4)2", [["ca", 3], ["po4", 2]]), product("NaCl", [["na", 1], ["cl", 1]])], [3, 2, 1, 6]),
  "calcium-nitrite-carbonate": reference(["Ca(NO2)2", "Na2CO3"], [product("CaCO3", [["ca", 1], ["co3", 1]]), product("NaNO2", [["na", 1], ["no2", 1]])], [1, 1, 1, 2]),
  "ammonium-calcium-phosphate": reference(["(NH4)3PO4", "CaCl2"], [product("NH4Cl", [["nh4", 1], ["cl", 1]]), product("Ca3(PO4)2", [["ca", 3], ["po4", 2]])], [2, 3, 6, 1]),
  "barium-sulfate": reference(["BaCl2", "Na2SO4"], [product("BaSO4", [["ba", 1], ["so4", 1]]), product("NaCl", [["na", 1], ["cl", 1]])], [1, 1, 1, 2]),
  "calcium-phosphite": reference(["CaCl2", "Na3PO3"], [product("Ca3(PO3)2", [["ca", 3], ["po3", 2]]), product("NaCl", [["na", 1], ["cl", 1]])], [3, 2, 1, 6]),
  "magnesium-chlorine": reference(["Mg", "Cl2"], [product("MgCl2", [["mg", 1], ["cl", 2]])], [1, 1, 1]),
  "aluminum-chlorine": reference(["Al", "Cl2"], [product("AlCl3", [["al", 1], ["cl", 3]])], [2, 3, 2]),
  "carbon-oxygen": reference(["C", "O2"], [CARBON_DIOXIDE], [1, 1, 1]),
  "nitrogen-hydrogen": reference(["N2", "H2"], [product("NH3", [["n_atom", 1], ["h_atom", 3]])], [1, 3, 2]),
  "sodium-chloride-electrolysis": reference(["NaCl"], [product("Na", [["na_atom", 1]]), product("Cl2", [["cl_atom", 2]])], [2, 2, 1]),
  "magnesium-chloride-electrolysis": reference(["MgCl2"], [product("Mg", [["mg_atom", 1]]), product("Cl2", [["cl_atom", 2]])], [1, 1, 1]),
  "calcium-chloride-electrolysis": reference(["CaCl2"], [product("Ca", [["ca_atom", 1]]), product("Cl2", [["cl_atom", 2]])], [1, 1, 1]),
  "zinc-chloride-electrolysis": reference(["ZnCl2"], [product("Zn", [["zn_atom", 1]]), product("Cl2", [["cl_atom", 2]])], [1, 1, 1]),
  "copper-chloride-electrolysis": reference(["CuCl2"], [product("Cu", [["cu_atom", 1]]), product("Cl2", [["cl_atom", 2]])], [1, 1, 1]),
  "sodium-bromide-electrolysis": reference(["NaBr"], [product("Na", [["na_atom", 1]]), product("Br2", [["br_atom", 2]])], [2, 2, 1]),
  "potassium-bromide-electrolysis": reference(["KBr"], [product("K", [["k_atom", 1]]), product("Br2", [["br_atom", 2]])], [2, 2, 1]),
  "magnesium-copper-sulfate": reference(["Mg", "CuSO4"], [product("MgSO4", [["mg", 1], ["so4", 1]]), product("Cu", [["cu_atom", 1]])], [1, 1, 1, 1]),
  "zinc-silver-nitrate": reference(["Zn", "AgNO3"], [product("Zn(NO3)2", [["zn", 1], ["no3", 2]]), product("Ag", [["ag_atom", 1]])], [1, 2, 1, 2]),
  "iron-hydrochloric": reference(["Fe", "HCl"], [product("FeCl2", [["fe", 1], ["cl", 2]]), product("H2", [["h_atom", 2]])], [1, 2, 1, 1]),
  "magnesium-zinc-sulfate": reference(["Mg", "ZnSO4"], [product("MgSO4", [["mg", 1], ["so4", 1]]), product("Zn", [["zn_atom", 1]])], [1, 1, 1, 1]),
};

function atomTotals(reference) {
  var total = {};
  reference.reactants.forEach(function (formula, term) {
    var tokens = formula.match(/[A-Z][a-z]?|\d+|[()]/g), position = 0;
    function group() {
      var result = {};
      while (position < tokens.length && tokens[position] !== ")") {
        var token = tokens[position++], part = {};
        if (token === "(") { part = group(); expect(tokens[position++]).toBe(")"); }
        else part[token] = 1;
        var multiplier = /^\d+$/.test(tokens[position] || "") ? Number(tokens[position++]) : 1;
        Object.keys(part).forEach(function (symbol) { result[symbol] = (result[symbol] || 0) + part[symbol] * multiplier; });
      }
      return result;
    }
    var atoms = group();
    Object.keys(atoms).forEach(function (symbol) { total[symbol] = (total[symbol] || 0) + atoms[symbol] * reference.coefficients[term]; });
  });
  return total;
}

async function open(page, seed) {
  await page.addInitScript(seedRandom, seed === undefined ? 41 : seed);
  await page.goto("/ionic-reactions/");
  await expect(page.getByRole("heading", {level: 1, name: "Ionic Reaction Builder", exact: true})).toBeVisible();
  await expect(page).toHaveTitle("Ionic Reaction Builder | ZornScience");
  await expect(page.locator("#zsa-ir-setup")).toBeVisible();
  await expect(page.locator("#zsa-ir-practice")).toBeHidden();
}
async function chooseTypes(page, selected) {
  for (var type of TYPES) await page.locator("input[name='reaction-type'][value='" + type + "']").setChecked(selected.includes(type));
}
async function go(page, seed, selected) {
  await open(page, seed);
  if (selected) await chooseTypes(page, selected);
  await page.locator("#zsa-ir-start").click();
  await expect(page.locator("#zsa-ir-setup")).toBeHidden();
  await expect(page.locator("#zsa-ir-bank button[data-token]").first()).toBeVisible();
}
async function current(page) {
  var id = await page.locator("main[data-zsa-activity]").getAttribute("data-reaction");
  expect(REFERENCES[id], "independent reference for " + id).toBeTruthy();
  var expectedTokens = [...new Set(REFERENCES[id].products.flatMap((product) => product.parts.map((part) => part[0])))].sort();
  var offeredTokens = await page.locator("#zsa-ir-bank button[data-token]").evaluateAll((buttons) => buttons.map((button) => button.dataset.token).sort());
  expect(offeredTokens, "only relevant building blocks for " + id).toEqual(expectedTokens);
  return {id: id, reference: REFERENCES[id]};
}
function token(page, id) { return page.locator("#zsa-ir-bank button[data-token='" + id + "']"); }
function slot(page, product, part) {
  return page.locator("#zsa-ir-products button[data-product='" + product + "'][data-part='" + part + "']");
}
function subscript(page, product, part) {
  return page.getByLabel("Product " + (product + 1) + " component " + (part + 1) + " subscript", {exact: true});
}
function coefficient(page, formula) { return page.getByLabel("Coefficient for " + formula, {exact: true}); }
async function place(page, id, product, part, keyboard) {
  if (keyboard) {
    await token(page, id).focus(); await page.keyboard.press("Enter");
    await slot(page, product, part).focus(); await page.keyboard.press("Space");
  } else {
    await token(page, id).click(); await slot(page, product, part).click();
  }
}
async function predict(page, reference, options) {
  options = options || {};
  var order = reference.products.map((_, i) => i);
  if (options.reverse) order.reverse();
  for (var [display, index] of order.entries()) {
    var product = reference.products[index];
    for (var [part, answer] of product.parts.entries()) {
      await place(page, answer[0], display, part, options.keyboard);
      await subscript(page, display, part).fill(String(answer[1]));
    }
    await expect(page.locator("#zsa-ir-products .zsa-ir-preview").nth(display)).toHaveText(product.formula);
  }
  await page.locator("#zsa-ir-check-products").click();
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
  await expect(page.locator("#zsa-ir-predict")).toBeHidden();
  await expect(page.locator("#zsa-ir-bank")).toBeHidden();
  await expect(page.locator("#zsa-ir-balance-title")).toBeFocused();
  var type = await page.locator("main[data-zsa-activity]").getAttribute("data-reaction-type");
  if (type === "double-replacement") {
    await expect(page.locator("#zsa-ir-count-mode")).toBeVisible();
    await expect(page.locator("#zsa-ir-count-mode")).toHaveValue("ions");
    await expect(page.locator("#zsa-ir-count-label")).toHaveText("Ion");
  } else {
    await expect(page.locator("#zsa-ir-count-mode")).toBeHidden();
    await expect(page.locator("#zsa-ir-count-label")).toHaveText("Atom");
  }
  return order;
}
async function setBalance(page, reference, order, factor) {
  order = order || reference.products.map((_, i) => i); factor = factor || 1;
  var formulas = reference.reactants.concat(order.map((i) => reference.products[i].formula));
  var values = reference.coefficients.slice(0, reference.reactants.length).concat(order.map((i) => reference.coefficients[reference.reactants.length + i]));
  for (var [i, formula] of formulas.entries()) await coefficient(page, formula).fill(String(values[i] * factor));
}
async function solve(page, reference, options) {
  var order = await predict(page, reference, options);
  await setBalance(page, reference, order);
  var expectedCounts = atomTotals(reference);
  for (var symbol of Object.keys(expectedCounts)) expect(await counts(page, symbol)).toEqual([expectedCounts[symbol], expectedCounts[symbol]]);
  await page.locator("#zsa-ir-check-balance").click();
  await expect(page.locator("#zsa-ir-next")).toBeEnabled();
}
async function atomMode(page) {
  if (await page.locator("#zsa-ir-count-mode").isVisible()) await page.locator("#zsa-ir-count-mode").selectOption("atoms");
  await expect(page.locator("#zsa-ir-count-label")).toHaveText("Atom");
}
async function counts(page, symbol) {
  await atomMode(page);
  var row = page.locator("#zsa-ir-counts tr").filter({has: page.getByRole("rowheader", {name: symbol, exact: true})});
  await expect(row).toHaveCount(1);
  return (await row.locator("td").allTextContents()).slice(0, 2).map(Number);
}
async function skipRound(page) {
  for (var i = 0; i < 10; i++) await page.locator("#zsa-ir-skip").click();
  await expect(page.locator("#zsa-ir-summary")).toBeVisible();
}
async function stat(page, name, value) {
  await expect(page.locator("#zsa-ir-summary [data-stat='" + name + "'] strong")).toHaveText(String(value));
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("practice requires at least one selected family before any problem appears", async ({page, problems}) => {
  void problems;
  await open(page);
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await expect(page.locator("input[name='reaction-type']")).toHaveCount(4);
  for (var name of ["Synthesis", "Decomposition", "Single Replacement", "Double Replacement"]) await expect(page.getByRole("checkbox", {name: name, exact: true})).toBeChecked();
  await expect(page.locator("#zsa-ir-bank")).toBeHidden();
  await chooseTypes(page, []);
  await page.locator("#zsa-ir-start").click();
  await expect(page.locator("#zsa-ir-setup-error")).toContainText(/at least one/i);
  await expect(page.locator("#zsa-ir-practice")).toBeHidden();
  await expect(page.locator("main[data-zsa-activity]")).not.toHaveAttribute("data-reaction", /.+/);
  await page.getByRole("checkbox", {name: "Synthesis", exact: true}).check();
  await page.locator("#zsa-ir-start").click();
  await expect(page.locator("#zsa-ir-practice")).toBeVisible();
  await expect(page.locator("main[data-zsa-activity]")).toHaveAttribute("data-reaction-type", "synthesis");
});

test("single-family rounds have ten distinct problems and replay preserves the chosen family", async ({page, problems}) => {
  void problems;
  for (var family of TYPES) {
    await go(page, 22, [family]);
    var ids = new Set();
    for (var index = 0; index < 10; index++) {
      await expect(page.locator("main[data-zsa-activity]")).toHaveAttribute("data-reaction-type", family);
      var active = await current(page);
      expect(ids.has(active.id)).toBe(false); ids.add(active.id);
      await page.locator("#zsa-ir-skip").click();
    }
    expect(ids.size).toBe(10);
    await expect(page.locator("#zsa-ir-summary-types > *")).toHaveCount(1);
    await page.locator("#zsa-ir-restart").click();
    await expect(page.locator("main[data-zsa-activity]")).toHaveAttribute("data-reaction-type", family);
    await skipRound(page);
    await page.locator("#zsa-ir-change-types").click();
    await expect(page.locator("#zsa-ir-setup")).toBeVisible();
    for (var type of TYPES) expect(await page.locator("input[name='reaction-type'][value='" + type + "']").isChecked()).toBe(type === family);
  }
});

test("a selected two-family round includes only those families in an even mix", async ({page, problems}) => {
  void problems;
  await go(page, 73, ["decomposition", "double-replacement"]);
  var types = {};
  for (var i = 0; i < 10; i++) {
    var type = await page.locator("main[data-zsa-activity]").getAttribute("data-reaction-type");
    types[type] = (types[type] || 0) + 1;
    await page.locator("#zsa-ir-skip").click();
  }
  expect(types).toEqual({decomposition: 5, "double-replacement": 5});
});

test("product subscript arrows have large targets, update previews, clamp values and lock after checking", async ({page, problems}) => {
  void problems;
  await go(page, 41, ["synthesis"]);
  var ref = (await current(page)).reference, answer = ref.products[0].parts[0];
  await place(page, answer[0], 0, 0);
  var input = subscript(page, 0, 0);
  var increase = page.getByRole("button", {name: "Increase product 1 component 1 subscript", exact: true});
  var decrease = page.getByRole("button", {name: "Decrease product 1 component 1 subscript", exact: true});
  for (var button of await page.locator(".zsa-ir-sub-step").all()) {
    var box = await button.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  }
  var before = await page.locator("#zsa-ir-products .zsa-ir-preview").first().textContent();
  await increase.click(); await expect(input).toHaveValue("2");
  expect(await page.locator("#zsa-ir-products .zsa-ir-preview").first().textContent()).not.toBe(before);
  await decrease.focus(); await page.keyboard.press("Space"); await expect(input).toHaveValue("1");
  await decrease.click(); await expect(input).toHaveValue("1");
  await input.fill("9"); await increase.click(); await expect(input).toHaveValue("9");
  await input.fill(""); await increase.focus(); await page.keyboard.press("Enter"); await expect(input).toHaveValue("2");
  await predict(page, ref);
  for (var button of await page.locator(".zsa-ir-sub-step").all()) await expect(button).toBeDisabled();
});

test("the equation places reactants left, the arrow between, products right and the bank below", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 1366, height: 900});
  await go(page);
  var reactants = await page.locator("#zsa-ir-reactants").boundingBox();
  var arrow = await page.locator("#zsa-ir-reaction-arrow").boundingBox();
  var products = await page.locator("#zsa-ir-products").boundingBox();
  var bank = await page.locator("#zsa-ir-bank").boundingBox();
  expect(reactants.x + reactants.width).toBeLessThanOrEqual(arrow.x);
  expect(arrow.x + arrow.width).toBeLessThanOrEqual(products.x);
  expect(bank.y).toBeGreaterThan(Math.max(reactants.y + reactants.height, products.y + products.height));
  var heading = page.locator(".zsa-ir-product-side > h3");
  await expect(heading).toHaveCSS("text-align", "center");
  var title = await heading.boundingBox();
  expect(Math.abs(title.x + title.width / 2 - products.x - products.width / 2)).toBeLessThanOrEqual(1);
});

test("the simplified header opens worked instructions without changing the current problem", async ({page, problems}) => {
  void problems;
  await open(page);
  var opener = page.locator("#zsa-ir-instructions-open"), dialog = page.locator("#zsa-ir-instructions");
  await expect(page.locator(".zsa-ir-title-row")).not.toContainText("Find the products. Make every atom count.");
  await expect(page.locator(".zsa-ir-title-row")).not.toContainText("Choose your reaction types, then build and balance ten problems.");
  await expect(page.locator("#zsa-ir-stage")).toHaveCount(0);
  await expect(dialog).toBeHidden();
  await opener.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(dialog).toHaveAccessibleName("How to use Ionic Reaction Builder");
  await expect(page.locator("#zsa-ir-instructions-close")).toBeFocused();
  await audit(page, "desktop instructions");
  var example = (await dialog.textContent()).replace(/\s+/g, " ");
  expect(example).toContain("CaCl2");
  expect(example).toContain("Na2CO3");
  expect(example).toContain("CaCO3");
  expect(example).toMatch(/2\s*NaCl/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(page.locator("#zsa-ir-setup")).toBeVisible();
  await opener.click();
  await page.mouse.click(1, 1);
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await page.locator("#zsa-ir-start").click();
  var active = await current(page), first = active.reference.products[0].parts[0];
  await place(page, first[0], 0, 0);
  await subscript(page, 0, 0).fill("2");
  var preview = await page.locator("#zsa-ir-products .zsa-ir-preview").first().textContent();
  await opener.click();
  await expect(dialog).toBeVisible();
  await page.locator("#zsa-ir-instructions-close").click();
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(page.locator("main[data-zsa-activity]")).toHaveAttribute("data-reaction", active.id);
  await expect(subscript(page, 0, 0)).toHaveValue("2");
  await expect(page.locator("#zsa-ir-products .zsa-ir-preview").first()).toHaveText(preview);
  await expect(page.locator("#zsa-ir-predict")).toBeVisible();
  await page.setViewportSize({width: 320, height: 664});
  await opener.click();
  await audit(page, "phone instructions");
  expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await audit(page, "phone after instructions");
});

test("balancing formulas are larger and coefficient boxes have a clear border on desktop and phone", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 1366, height: 900});
  await go(page);
  var badge = await page.locator("#zsa-ir-type").evaluate((element) => getComputedStyle(element).backgroundColor.match(/\d+/g).slice(0, 3).map(Number));
  expect(badge[0]).toBeGreaterThan(badge[2]);
  expect(badge[1]).toBeGreaterThan(badge[2]);
  await predict(page, (await current(page)).reference);
  for (var [width, minimumSize] of [[1366, 32], [390, 28], [320, 28]]) {
    await page.setViewportSize({width: width, height: 900});
    var formulas = await page.locator("#zsa-ir-equation .zsa-ir-formula").evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
    expect(formulas.length).toBeGreaterThan(0);
    for (var size of formulas) expect(size, "equation font at " + width).toBeGreaterThanOrEqual(minimumSize);
    var borders = await page.locator("#zsa-ir-equation input").evaluateAll((inputs) => inputs.map((input) => {
      var style = getComputedStyle(input);
      return {width: parseFloat(style.borderTopWidth), color: style.borderTopColor, background: style.backgroundColor};
    }));
    for (var border of borders) {
      expect(border.width, "coefficient border at " + width).toBeGreaterThanOrEqual(3);
      expect(border.color).not.toBe(border.background);
      expect(border.color).not.toBe("rgba(0, 0, 0, 0)");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  }
});

test("branding and randomized first problems appear after starting selected practice", async ({page, browser, problems}) => {
  void problems;
  await go(page);
  await expect(page.locator("#zsa-ir-round")).toHaveText("Problem 1 of 10");
  var logo = page.locator("img[src*='zornscience-logo']").first();
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await expect(page.locator("#zsa-ir-next")).toBeDisabled();
  await expect(page.locator("#zsa-ir-round")).toBeFocused();
  var first = new Set([await page.locator("main[data-zsa-activity]").getAttribute("data-reaction")]);
  var origin = new URL(page.url()).origin;
  for (var seed of [2, 11, 89]) {
    var other = await browser.newPage({baseURL: origin});
    await go(other, seed);
    first.add(await other.locator("main[data-zsa-activity]").getAttribute("data-reaction"));
    await other.close();
  }
  expect(first.size).toBeGreaterThan(1);
});

test("a ten-problem mixed round counts each missed problem once and includes skips in the summary", async ({page, problems}) => {
  void problems;
  await go(page);
  var ids = new Set(), types = {};
  for (var i = 0; i < 10; i++) {
    var active = await current(page), kind = await page.locator("main[data-zsa-activity]").getAttribute("data-reaction-type");
    expect(ids.has(active.id)).toBe(false); ids.add(active.id); types[kind] = (types[kind] || 0) + 1;
    await expect(page.locator("#zsa-ir-round")).toHaveText("Problem " + (i + 1) + " of 10");
    if (i === 0 || i === 1) {
      await page.locator("#zsa-ir-check-products").click();
      await page.locator("#zsa-ir-check-products").click();
      await expect(page.locator("#zsa-ir-balance")).toBeHidden();
    }
    if (i === 1) { await page.locator("#zsa-ir-skip").click(); continue; }
    if (i === 2) await page.locator("#zsa-ir-hint").click();
    await solve(page, active.reference, {reverse: i % 2 === 0, keyboard: i === 0});
    await page.locator("#zsa-ir-next").click();
  }
  expect(Object.keys(types).sort()).toEqual(TYPES.slice().sort());
  expect(Object.values(types).sort()).toEqual([2, 2, 3, 3]);
  await expect(page.locator("#zsa-ir-practice")).toBeHidden();
  await expect(page.locator("#zsa-ir-summary")).toBeVisible();
  await expect(page.locator("#zsa-ir-summary-title")).toBeFocused();
  await stat(page, "missed", 2); await stat(page, "skipped", 1); await stat(page, "first-try", 8); await stat(page, "balanced", 9);
  await expect(page.locator("#zsa-ir-summary-review .zsa-ir-review-item")).toHaveCount(2);
  await expect(page.locator("#zsa-ir-summary-lede")).toContainText(/skip/i);
});

test("skipping works before and after product prediction, and replay resets the whole round", async ({page, problems}) => {
  void problems;
  await go(page);
  var first = await current(page);
  await predict(page, first.reference);
  await expect(page.locator("#zsa-ir-next")).toBeDisabled();
  await page.locator("#zsa-ir-skip").click();
  await expect(page.locator("#zsa-ir-round")).toHaveText("Problem 2 of 10");
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  for (var i = 1; i < 10; i++) await page.locator("#zsa-ir-skip").click();
  await stat(page, "missed", 10); await stat(page, "skipped", 10); await stat(page, "first-try", 0); await stat(page, "balanced", 0);
  await expect(page.locator("#zsa-ir-summary-review .zsa-ir-review-item")).toHaveCount(10);
  await page.locator("#zsa-ir-restart").click();
  await expect(page.locator("#zsa-ir-summary")).toBeHidden();
  await expect(page.locator("#zsa-ir-practice")).toBeVisible();
  await expect(page.locator("#zsa-ir-round")).toHaveText("Problem 1 of 10");
  await expect(page.locator("#zsa-ir-round")).toBeFocused();
  await expect(page.locator("#zsa-ir-next")).toBeDisabled();
});

test("components support HTML drag and drop, keyboard placement, and reject a malformed subscript", async ({page, problems}) => {
  void problems;
  await go(page);
  var ref = (await current(page)).reference, answer = ref.products[0].parts[0];
  var transfer = await page.evaluateHandle(() => new DataTransfer());
  await token(page, answer[0]).dispatchEvent("dragstart", {dataTransfer: transfer});
  await slot(page, 0, 0).dispatchEvent("dragover", {dataTransfer: transfer});
  await slot(page, 0, 0).dispatchEvent("drop", {dataTransfer: transfer});
  await expect(slot(page, 0, 0)).not.toHaveText(/First part/i);
  await transfer.dispose();
  for (var [product, expected] of ref.products.entries()) {
    for (var [part, component] of expected.parts.entries()) {
      await place(page, component[0], product, part, true);
      await subscript(page, product, part).fill(String(component[1]));
    }
  }
  var input = subscript(page, 0, 0);
  await input.fill(""); await input.focus(); await page.keyboard.press("-");
  expect(await input.evaluate((element) => element.validity.badInput)).toBe(true);
  await page.locator("#zsa-ir-check-products").click();
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await input.fill(String(answer[1]));
  await page.locator("#zsa-ir-check-products").click();
  await expect(page.locator("#zsa-ir-balance")).toBeVisible();
});

test("large coefficient controls update atom counts, reject invalid or nonminimal balance, and relock after edits", async ({page, problems}) => {
  void problems;
  await go(page);
  var ref = (await current(page)).reference;
  var order = await predict(page, ref, {reverse: true});
  var formula = ref.reactants[0], input = coefficient(page, formula);
  var increase = page.getByRole("button", {name: "Increase coefficient for " + formula, exact: true});
  var decrease = page.getByRole("button", {name: "Decrease coefficient for " + formula, exact: true});
  var before = await page.locator("#zsa-ir-counts").textContent();
  for (var button of await page.locator(".zsa-ir-step").all()) {
    var bounds = await button.boundingBox(); expect(bounds.width).toBeGreaterThanOrEqual(48); expect(bounds.height).toBeGreaterThanOrEqual(48);
  }
  await increase.click(); await expect(input).toHaveValue("2");
  expect(await page.locator("#zsa-ir-counts").textContent()).not.toBe(before);
  await decrease.focus(); await page.keyboard.press("Space"); await expect(input).toHaveValue("1");
  await input.fill("99"); await increase.click(); await expect(input).toHaveValue("99");
  await input.fill(""); await decrease.click(); await expect(input).toHaveValue("1");
  for (var invalid of ["0", "-1", "1.5"]) {
    await input.fill(invalid); await page.locator("#zsa-ir-check-balance").click();
    await expect(page.locator("#zsa-ir-next")).toBeDisabled();
    await expect(page.locator("#zsa-ir-feedback")).toContainText(/whole numbers/i);
  }
  await setBalance(page, ref, order, 2); await page.locator("#zsa-ir-check-balance").click();
  await expect(page.locator("#zsa-ir-next")).toBeDisabled();
  await expect(page.locator("#zsa-ir-feedback")).toContainText(/smallest/i);
  await setBalance(page, ref, order); await page.locator("#zsa-ir-check-balance").click();
  await expect(page.locator("#zsa-ir-next")).toBeEnabled();
  await increase.click(); await expect(page.locator("#zsa-ir-next")).toBeDisabled();
});

test("balancing replaces prediction in the same space and restores prediction for the next problem", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 1366, height: 900});
  await go(page);
  var predictionTop = await page.locator("#zsa-ir-predict").evaluate((element) => element.getBoundingClientRect().top + scrollY);
  var ref = (await current(page)).reference;
  var order = await predict(page, ref);
  var balanceTop = await page.locator("#zsa-ir-balance").evaluate((element) => element.getBoundingClientRect().top + scrollY);
  expect(Math.abs(balanceTop - predictionTop)).toBeLessThanOrEqual(24);
  await expect(page.locator("#zsa-ir-check-products")).toBeHidden();
  await expect(page.locator("#zsa-ir-balance-hint")).toBeVisible();
  await page.locator("#zsa-ir-balance-hint").click();
  await expect(page.locator("#zsa-ir-feedback")).toBeVisible();
  await setBalance(page, ref, order);
  await page.locator("#zsa-ir-check-balance").click();
  await page.locator("#zsa-ir-next").click();
  await expect(page.locator("#zsa-ir-predict")).toBeVisible();
  await expect(page.locator("#zsa-ir-bank")).toBeVisible();
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  var next = (await current(page)).reference;
  await predict(page, next);
  await page.locator("#zsa-ir-skip").click();
  await expect(page.locator("#zsa-ir-predict")).toBeVisible();
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
});

test("vertical balancing arrows update green checks while unequal and invalid rows remain blank", async ({page, problems}) => {
  void problems;
  await go(page);
  var ref = (await current(page)).reference, order = await predict(page, ref);
  await expect(page.getByRole("columnheader", {name: "Balanced?", exact: true})).toBeVisible();
  var formula = ref.reactants[0], input = coefficient(page, formula);
  var increase = page.getByRole("button", {name: "Increase coefficient for " + formula, exact: true});
  var decrease = page.getByRole("button", {name: "Decrease coefficient for " + formula, exact: true});
  var up = await increase.boundingBox(), down = await decrease.boundingBox(), field = await input.boundingBox();
  expect(Math.abs(up.x - down.x)).toBeLessThanOrEqual(1);
  expect(up.y + up.height).toBeLessThanOrEqual(down.y);
  expect(field.x + field.width).toBeLessThanOrEqual(up.x + 1);
  for (var arrow of [up, down]) { expect(arrow.width).toBeGreaterThanOrEqual(48); expect(arrow.height).toBeGreaterThanOrEqual(48); }
  await setBalance(page, ref, order);
  var cells = page.locator("#zsa-ir-counts tr td:last-child");
  expect(await cells.count()).toBeGreaterThan(0);
  await expect(cells).toHaveText(Array(await cells.count()).fill("✓"));
  var colors = await cells.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color.match(/\d+/g).slice(0, 3).map(Number)));
  for (var color of colors) { expect(color[1]).toBeGreaterThan(color[0]); expect(color[1]).toBeGreaterThan(color[2]); }
  await increase.click();
  await expect(input).toHaveValue(String(ref.coefficients[0] + 1));
  expect((await cells.allTextContents()).some((text) => text === "")).toBe(true);
  expect((await cells.allTextContents()).every((text) => text === "" || text === "✓")).toBe(true);
  await decrease.focus(); await page.keyboard.press("Space");
  await expect(input).toHaveValue(String(ref.coefficients[0]));
  await expect(cells).toHaveText(Array(await cells.count()).fill("✓"));
  await input.fill("0");
  await expect(cells).toHaveText(Array(await cells.count()).fill(""));
});

test("share options expose encoded links, copy the canonical activity URL and close with Escape", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async (text) => { window.__copied = text; }}}));
  await go(page);
  await page.locator("#zsa-ir-share-toggle").click();
  await expect(page.locator("#zsa-ir-share-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#zsa-ir-share-panel")).toBeVisible();
  await expect(page.locator("#zsa-ir-share-url")).toHaveValue(SHARE_URL);
  expect(await page.locator("#zsa-ir-share-email").getAttribute("href")).toMatch(/^mailto:\?/);
  for (var [id, label] of [["email", "Email"], ["facebook", "Facebook"], ["x", "X"]]) {
    var icon = page.locator("#zsa-ir-share-" + id + " svg");
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#zsa-ir-share-" + id + " > span").first()).toHaveText(label);
  }
  await expect(page.locator("#zsa-ir-share-linkedin")).toHaveCount(0);
  for (var [id, parameter] of [["facebook", "u"], ["x", "url"]]) {
    var link = page.locator("#zsa-ir-share-" + id), url = new URL(await link.getAttribute("href"));
    expect(url.searchParams.get(parameter)).toBe(SHARE_URL);
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  await page.locator("#zsa-ir-share-copy").click();
  expect(await page.evaluate(() => window.__copied)).toBe(SHARE_URL);
  await expect(page.locator("#zsa-ir-share-status")).toContainText(/copied/i);
  await page.keyboard.press("Escape");
  await expect(page.locator("#zsa-ir-share-panel")).toBeHidden();
  await expect(page.locator("#zsa-ir-share-toggle")).toBeFocused();
  await page.locator("#zsa-ir-share-toggle").click();
  await page.getByRole("heading", {level: 1}).click();
  await expect(page.locator("#zsa-ir-share-panel")).toBeHidden();
});

test("copy failure keeps a manually selectable link and native sharing stays user initiated", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async () => { throw new Error("clipboard unavailable"); }}});
    Object.defineProperty(navigator, "share", {configurable: true, value: async (details) => { window.__shared = details; }});
  });
  await go(page);
  expect(await page.evaluate(() => window.__shared)).toBeUndefined();
  await page.locator("#zsa-ir-share-toggle").click();
  await page.locator("#zsa-ir-share-copy").click();
  await expect(page.locator("#zsa-ir-share-url")).toBeFocused();
  expect(await page.locator("#zsa-ir-share-url").evaluate((input) => input.selectionEnd - input.selectionStart)).toBe(SHARE_URL.length);
  await page.locator("#zsa-ir-share-device").click();
  expect((await page.evaluate(() => window.__shared)).url).toBe(SHARE_URL);
});

test("prediction, balancing, share options and summary pass axe accessibility at desktop and phone sizes", async ({page, problems}) => {
  void problems;
  await open(page);
  await audit(page, "setup");
  await page.locator("#zsa-ir-start").click();
  await audit(page, "prediction");
  await page.locator("#zsa-ir-share-toggle").click(); await audit(page, "share options");
  await page.keyboard.press("Escape");
  await predict(page, (await current(page)).reference); await audit(page, "balancing");
  await page.setViewportSize({width: 390, height: 664}); await audit(page, "phone balancing");
  for (var i = 0; i < 10; i++) await page.locator("#zsa-ir-skip").click();
  await audit(page, "phone summary");
});

test("all controls retain usable targets without overflow, and activity loads only local resources", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await open(page);
  for (var stage of ["setup", "prediction", "balancing", "summary"]) {
    if (stage === "prediction") await page.locator("#zsa-ir-start").click();
    if (stage === "balancing") await predict(page, (await current(page)).reference);
    if (stage === "summary") for (var i = 0; i < 10; i++) await page.locator("#zsa-ir-skip").click();
    for (var width of [320, 390, 768, 1366]) {
      await page.setViewportSize({width: width, height: 664});
      var layout = await page.evaluate(() => {
        var small = [];
        document.querySelectorAll("button,input,select,a").forEach((element) => {
          var target = element.matches("input[type=checkbox]") ? element.closest("label") : element;
          var rect = target.getBoundingClientRect();
          if (!rect.width || !rect.height || element.closest("[hidden]")) return;
          if (rect.width < 43.5 || rect.height < 43.5) small.push((element.id || element.getAttribute("aria-label") || element.tagName) + " " + Math.round(rect.width) + "x" + Math.round(rect.height));
        });
        return {overflow: document.documentElement.scrollWidth - innerWidth, small: small};
      });
      expect(layout.overflow, stage + " at " + width).toBeLessThanOrEqual(0);
      expect(layout.small, stage + " targets at " + width).toEqual([]);
    }
  }
  expect(requests.every((url) => url.startsWith("http://127.0.0.1:"))).toBe(true);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.goto("/ionic-reactions/?embed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect(page.locator("footer")).toBeHidden();
});
