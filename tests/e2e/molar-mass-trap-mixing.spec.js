"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";
const station = (page, name) => page.locator(`[data-station="${name}"]`);
const slot = (page, number) => page.locator(`[data-mix-tube="${number}"]`);
const entry = (page, number) => page.locator(`[data-mix-entry="${number}"]`);
const action = (page) => page.locator("#mix-action");

async function openRack(page) {
  await page.clock.install();
  await page.goto(LAB);
  await station(page, "mixing").click();
}

async function dispense(page, code, ml) {
  await page.locator("#mix-liquid").selectOption(code);
  await page.locator("#mix-amount").selectOption(String(ml));
  await action(page).click();
  await page.clock.fastForward(440);
}

async function invert(page, count) {
  for (let i = 0; i < count; i++) {
    await action(page).click();
    await page.clock.fastForward(740);
  }
}

async function placeInRack(page) {
  await expect(action(page)).toHaveText("Set upright");
  await action(page).click();
  await page.clock.fastForward(300);
}

test("all five recipes keep their volumes, colors and layer positions and can be recorded together", async ({page}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openRack(page);
  await expect(page.locator("#mix-rack button")).toHaveCount(5);
  const recipes = [
    {number: 5, liquids: [["M", 1], ["G", 1]], total: 2, tints: ["clear", "red"], note: "A red band above a clear band."},
    {number: 2, liquids: [["W", 1], ["M", 1]], total: 2, tints: ["blue", "red"], note: "A red band above a blue band."},
    {number: 1, liquids: [["G", 1], ["W", 1]], total: 2, tints: ["blue"], note: "One uniform blue-tinted layer."},
    {number: 4, liquids: [["O", 0.5], ["M", 1]], total: 1.5, tints: ["red"], note: "One uniform red-tinted layer."},
    {number: 3, liquids: [["W", 1], ["O", 0.5]], total: 1.5, tints: ["blue", "clear"], note: "A smaller clear band above a blue band."}
  ];
  for (const {number, liquids, total} of recipes) {
    await slot(page, number).click();
    await expect(page.locator("#mix-recipe")).toHaveText(new RegExp(`^Tube ${number} .*${total === 2 ? "1\\.0" : "0\\.5"} mL$`));
    for (const [code, ml] of liquids) await dispense(page, code, ml);
    await expect(page.locator("#mix-volume")).toHaveText(total.toFixed(1) + " mL total");
    await expect(action(page)).toHaveText("Add stopper");
    await action(page).click();
    await invert(page, 5);
    await placeInRack(page);
  }

  const glass = page.locator("#mix-active-tube");
  for (const {number, total, tints, note} of recipes) {
    await slot(page, number).click();
    await expect(action(page)).toHaveText("Advance to 60 s");
    await action(page).click();
    await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
    await page.locator("#mix-read").click();
    await expect(page.locator("#mix-observation")).toHaveText(note);
    const steadyBands = glass.locator('[data-mix-band][visibility="visible"]');
    await expect(steadyBands).toHaveCount(tints.length);
    for (let i = 0; i < tints.length; i++) await expect(steadyBands.nth(i)).toHaveAttribute("data-tint", tints[i]);
    const height = total === 2 ? -12 : 7;
    await expect(glass.locator("[data-mix-meniscus]")).toHaveAttribute("d", `M-14 ${height}Q0 ${height + 4} 14 ${height}`);
    const boundary = glass.locator("[data-mix-interface]");
    await expect(boundary).toHaveAttribute("visibility", tints.length === 2 ? "visible" : "hidden");
    if (tints.length === 2) await expect(boundary).toHaveAttribute("d", "M-14 26H14");
    await entry(page, number).getByRole("combobox", {name: `Number of layers Tube ${number}`}).selectOption(String(tints.length));
    await entry(page, number).getByRole("textbox", {name: `Where did the dye go? Tube ${number}`}).fill(note);
  }
  await station(page, "wax").click();
  await page.emulateMedia({media: "print"});
  for (const {number, tints, note} of recipes) {
    await expect(entry(page, number).getByText(tints.length === 1 ? "One layer" : "Two layers", {exact: true}).last()).toBeVisible();
    await expect(entry(page, number).getByText(note, {exact: true})).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("four inversions and an early read leave the timer gated while other tubes can be corrected", async ({page}) => {
  await openRack(page);
  await slot(page, 3).click();
  await dispense(page, "O", 0.5);
  await dispense(page, "W", 1);
  await action(page).click();
  // A rapid second input must not count another inversion.
  await action(page).evaluate((button) => { button.click(); button.click(); });
  await page.clock.runFor(220);
  await expect(action(page)).toBeDisabled();
  await expect(page.locator("#mix-active-tube")).not.toHaveAttribute("transform", "translate(128 111) rotate(-12)");
  await expect(page.locator("#mix-inversions")).toHaveText("0 / 5 inversions");
  await page.clock.runFor(520);
  await invert(page, 3);
  await expect(page.locator("#mix-inversions")).toHaveText("4 / 5 inversions");
  await expect(action(page)).toHaveText("Gently invert");
  await expect(page.locator("#mix-elapsed")).toBeHidden();
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText(/after five inversions and a full 60 s upright/);
  const evidence = entry(page, 3);
  await evidence.getByRole("combobox").selectOption("1");
  await evidence.getByRole("textbox").fill("I first saw a blue band.");
  await action(page).click();
  await station(page, "wax").click();
  await page.clock.fastForward(740);
  await station(page, "mixing").click();
  await expect(page.locator("#mix-inversions")).toHaveText("5 / 5 inversions");
  await placeInRack(page);
  await expect(page.locator("#mix-elapsed")).toHaveText("0 / 60 s");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText(/after five inversions and a full 60 s upright/);

  await slot(page, 5).click();
  await dispense(page, "M", 0.5);
  await expect(page.locator("#bench-instruction")).toHaveText(/differ from this recipe/);
  await expect(action(page)).toBeHidden();
  await page.locator("#mix-empty").click();
  await expect(page.locator("#mix-volume")).toHaveText("0.0 mL total");
  await expect(page.locator("#mix-waste-fill")).toHaveAttribute("visibility", "visible");
  await dispense(page, "M", 1);
  await expect(page.locator("#mix-volume")).toHaveText("1.0 mL total");
  await station(page, "shot").click();
  await page.clock.fastForward(60000);
  await station(page, "mixing").click();
  await expect(slot(page, 5)).toHaveAttribute("aria-pressed", "true");
  await slot(page, 3).click();
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText("A smaller clear band above a blue band.");
  await page.getByRole("button", {name: "Pour into waste"}).click();
  await expect(evidence.getByRole("combobox")).toHaveValue("1");
  await expect(evidence.getByRole("textbox")).toHaveValue("I first saw a blue band.");
  await dispense(page, "W", 1);
  await expect(page.locator("#mix-volume")).toHaveText("1.0 mL total");
  await slot(page, 5).click();
  await expect(page.locator("#mix-volume")).toHaveText("1.0 mL total");
  await dispense(page, "G", 1);
  await expect(action(page)).toHaveText("Add stopper");
});

async function tabTo(page, locator, key = "Tab") {
  for (let i = 0; i < 30; i++) {
    if (await locator.evaluate((node) => node === document.activeElement)) return;
    await page.keyboard.press(key);
  }
  await expect(locator).toBeFocused();
}

test("Spanish keyboard controls and reduced motion give equivalent readings at phone width", async ({page}) => {
  await page.setViewportSize({width: 360, height: 740});
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.clock.install();
  await page.goto(LAB + "?lang=es");
  await tabTo(page, station(page, "mixing"));
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByRole("button", {name: "Tubo 3", exact: true}));
  await page.keyboard.press("Enter");
  await expect(page.locator("#mix-recipe")).toHaveText("Tubo 3 · W Agua 1.0 mL + O 1-octanol 0.5 mL");
  for (const [liquidSteps, volumeSteps] of [[1, 2], [3, 1]]) {
    await tabTo(page, page.getByLabel("Líquido en la pipeta"), liquidSteps === 1 ? "Tab" : "Shift+Tab");
    for (let i = 0; i < liquidSteps; i++) await page.keyboard.press("ArrowDown");
    await tabTo(page, page.getByLabel("Volumen de la pipeta"));
    for (let i = 0; i < volumeSteps; i++) await page.keyboard.press("ArrowDown");
    await tabTo(page, action(page));
    await expect(action(page)).toHaveText("Agregar alícuota");
    await page.keyboard.press("Enter");
    await page.clock.fastForward(450);
  }
  await expect(action(page)).toHaveText("Poner el tapón");
  await page.keyboard.press("Enter");
  for (let i = 0; i < 5; i++) {
    await expect(action(page)).toHaveText("Invertir con cuidado");
    await page.keyboard.press("Enter");
    await page.clock.fastForward(750);
  }
  await expect(action(page)).toHaveText("Colocar en vertical");
  await page.keyboard.press("Enter");
  await page.clock.fastForward(300);
  await expect(action(page)).toHaveText("Avanzar a 60 s");
  await page.keyboard.press("Enter");
  const read = page.getByRole("button", {name: "Leer las capas"});
  await expect(read).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#mix-observation")).toHaveText("Una franja transparente más delgada sobre una franja azul.");
  const row = entry(page, 3);
  await tabTo(page, row.getByRole("combobox", {name: "Número de capas Tubo 3"}));
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const note = row.getByRole("textbox", {name: "¿Dónde quedó el colorante? Tubo 3"});
  await tabTo(page, note);
  await page.keyboard.type("Azul abajo");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(row.getByRole("combobox")).toHaveValue("2");
  await expect(row.getByRole("textbox")).toHaveValue("Azul abajo");
  await page.getByRole("link", {name: "ES Español"}).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.emulateMedia({media: "print"});
  await expect(row.getByText("Dos capas", {exact: true}).last()).toBeVisible();
  await expect(row.getByText("Azul abajo", {exact: true})).toBeVisible();
});

test("the working rack and editable mixing notebook pass axe at desktop and Spanish phone widths", async ({page}) => {
  await openRack(page);
  await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
  async function audit() {
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}});
      return result.violations.map((rule) => [rule.id, rule.nodes.map((node) => node.target)]);
    });
    expect(violations).toEqual([]);
  }
  await audit();
  await page.setViewportSize({width: 360, height: 740});
  await page.getByRole("link", {name: "ES Español"}).click();
  await audit();
});
