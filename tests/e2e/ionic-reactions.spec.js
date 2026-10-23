// Reaction Builder: exercise a mixed round using independent chemistry anchors, then verify
// feedback accounting, accessible component placement, sharing, and responsive controls.
"use strict";
var fs = require("fs");
var {test, expect, seedRandom} = require("./fixtures");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var SHARE_URL = "https://activities.zornscience.org/ionic-reactions/";

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
  "calcium-carbonate-breakdown": reference(["CaCO3"], [product("CaO", [["ca", 1], ["o", 1]]), CARBON_DIOXIDE], [1, 1, 1]),
  "magnesium-carbonate-breakdown": reference(["MgCO3"], [product("MgO", [["mg", 1], ["o", 1]]), CARBON_DIOXIDE], [1, 1, 1]),
  "calcium-hydroxide-breakdown": reference(["Ca(OH)2"], [product("CaO", [["ca", 1], ["o", 1]]), WATER], [1, 1, 1]),
  "peroxide-breakdown": reference(["H2O2"], [WATER, product("O2", [["o_atom", 2]])], [2, 2, 1]),
  "water-electrolysis": reference(["H2O"], [product("H2", [["h_atom", 2]]), product("O2", [["o_atom", 2]])], [2, 2, 1]),
  "silver-oxide-breakdown": reference(["Ag2O"], [product("Ag", [["ag_atom", 1]]), product("O2", [["o_atom", 2]])], [2, 4, 1]),
  "ammonium-carbonate-breakdown": reference(["(NH4)2CO3"], [product("NH3", [["n_atom", 1], ["h_atom", 3]]), CARBON_DIOXIDE, WATER], [1, 2, 1, 1]),
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
  "hydrochloric-sodium-hydroxide": reference(["HCl", "NaOH"], [product("NaCl", [["na", 1], ["cl", 1]]), WATER], [1, 1, 1, 1]),
  "nitric-potassium-hydroxide": reference(["HNO3", "KOH"], [product("KNO3", [["k", 1], ["no3", 1]]), WATER], [1, 1, 1, 1]),
  "sulfuric-sodium-hydroxide": reference(["H2SO4", "NaOH"], [product("Na2SO4", [["na", 2], ["so4", 1]]), WATER], [1, 2, 1, 2]),
  "hydrochloric-calcium-hydroxide": reference(["HCl", "Ca(OH)2"], [product("CaCl2", [["ca", 1], ["cl", 2]]), WATER], [2, 1, 1, 2]),
  "nitric-magnesium-hydroxide": reference(["HNO3", "Mg(OH)2"], [product("Mg(NO3)2", [["mg", 1], ["no3", 2]]), WATER], [2, 1, 1, 2]),
  "phosphoric-potassium-hydroxide": reference(["H3PO4", "KOH"], [product("K3PO4", [["k", 3], ["po4", 1]]), WATER], [1, 3, 1, 3])
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

async function go(page, seed) {
  await page.addInitScript(seedRandom, seed === undefined ? 41 : seed);
  await page.goto("/ionic-reactions/");
  await expect(page.getByRole("heading", {level: 1, name: "Reaction Builder", exact: true})).toBeVisible();
  await expect(page.locator("#zsa-ir-bank button[data-token]").first()).toBeVisible();
}
async function current(page) {
  var id = await page.locator("main[data-zsa-activity]").getAttribute("data-reaction");
  expect(REFERENCES[id], "independent reference for " + id).toBeTruthy();
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

test("branding and randomized first problems appear without moving initial focus", async ({page, browser, problems}) => {
  void problems;
  await go(page);
  await expect(page.locator("#zsa-ir-round")).toHaveText("Problem 1 of 10");
  var logo = page.locator("img[src*='zornscience-logo']").first();
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator("#zsa-ir-balance")).toBeHidden();
  await expect(page.locator("#zsa-ir-next")).toBeDisabled();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
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
  expect(types).toEqual({synthesis: 2, decomposition: 2, "single-replacement": 2, "double-replacement": 2, "acid-base": 2});
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

test("three-product decomposition conserves atoms when the products are built in reverse order", async ({page, problems}) => {
  void problems;
  await go(page, 45);
  var active = await current(page);
  expect(active.id).toBe("ammonium-carbonate-breakdown");
  await expect(page.locator("#zsa-ir-products .zsa-ir-product")).toHaveCount(3);
  await solve(page, active.reference, {reverse: true, keyboard: true});
  expect(await counts(page, "N")).toEqual([2, 2]);
  expect(await counts(page, "H")).toEqual([8, 8]);
  expect(await counts(page, "C")).toEqual([1, 1]);
  expect(await counts(page, "O")).toEqual([3, 3]);
  await expect(page.locator("#zsa-ir-equation input")).toHaveCount(4);
});

test("components support HTML drag and drop, keyboard placement, and reject a malformed subscript", async ({page, problems}) => {
  void problems;
  await go(page);
  var ref = (await current(page)).reference, answer = ref.products[0].parts[0];
  var transfer = await page.evaluateHandle(() => new DataTransfer());
  await token(page, answer[0]).dispatchEvent("dragstart", {dataTransfer: transfer});
  await slot(page, 0, 0).dispatchEvent("dragover", {dataTransfer: transfer});
  await slot(page, 0, 0).dispatchEvent("drop", {dataTransfer: transfer});
  await expect(slot(page, 0, 0)).not.toHaveText(/First component/i);
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

test("share options expose encoded links, copy the canonical activity URL and close with Escape", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async (text) => { window.__copied = text; }}}));
  await go(page);
  await page.locator("#zsa-ir-share-toggle").click();
  await expect(page.locator("#zsa-ir-share-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#zsa-ir-share-panel")).toBeVisible();
  await expect(page.locator("#zsa-ir-share-url")).toHaveValue(SHARE_URL);
  expect(await page.locator("#zsa-ir-share-email").getAttribute("href")).toMatch(/^mailto:\?/);
  for (var [id, parameter] of [["facebook", "u"], ["x", "url"], ["linkedin", "url"]]) {
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
  await go(page);
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
  await go(page);
  for (var stage of ["prediction", "balancing", "summary"]) {
    if (stage === "balancing") await predict(page, (await current(page)).reference);
    if (stage === "summary") for (var i = 0; i < 10; i++) await page.locator("#zsa-ir-skip").click();
    for (var width of [320, 390, 768, 1366]) {
      await page.setViewportSize({width: width, height: 664});
      var layout = await page.evaluate(() => {
        var small = [];
        document.querySelectorAll("button,input,select,a").forEach((element) => {
          var rect = element.getBoundingClientRect();
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
