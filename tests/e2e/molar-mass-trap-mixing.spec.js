"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";
const station = (page, name) => page.locator(`[data-station="${name}"]`);
const slot = (page, number) => page.locator(`[data-mix-tube="${number}"]`);
const action = (page) => page.locator("#mix-action");
const stand = (page) => page.locator("#mix-stand");
const advance = (page) => page.locator("#mix-advance");

async function openRack(page) {
  await page.clock.install();
  await page.goto(LAB);
  await page.locator("#intro-start").click();
  await station(page, "mixing").click();
}

// The pipette always adds 1.0 mL, so students only choose the liquid.
async function dispense(page, code) {
  await page.locator("#mix-liquid").selectOption(code);
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
  await expect(stand(page)).toBeEnabled();
  await stand(page).click();
  await page.clock.fastForward(300);
}

test("a denser aliquot settles below the lighter one before inversion, whatever the pour order", async ({page}) => {
  await openRack(page);
  const bands = () => page.locator("#mix-active-tube [data-mix-band]").evaluateAll((shapes) => shapes
    .filter((shape) => shape.getAttribute("visibility") !== "hidden").map((shape) => shape.dataset.tint));
  for (const [number, first, second, expected] of [[2, "M", "W", ["blue", "red"]], [5, "M", "G", ["clear", "red"]]]) {
    await slot(page, number).click();
    await dispense(page, first);
    await dispense(page, second);
    // Bands are listed bottom to top.
    expect(await bands()).toEqual(expected);
    await action(page).click();
    await expect(action(page)).toHaveText("Gently invert");
    expect(await bands()).toEqual(expected);
    await page.locator("#mix-read").click();
    await expect(page.locator("#mix-observation")).toHaveText(`Before inversion, a red band sits above a ${expected[0]} band.`);
  }
});

test("repeated clicks at one position cannot set the tube upright or advance its clock", async ({page}) => {
  await openRack(page);
  await dispense(page, "W");
  await dispense(page, "G");
  await action(page).click();

  async function clickThrough(button, count) {
    await button.scrollIntoViewIfNeeded();
    const {x, y, width, height} = await button.boundingBox();
    for (let i = 0; i < count; i++) {
      await page.mouse.click(x + width / 2, y + height / 2);
      await page.clock.fastForward(100);
    }
  }

  await clickThrough(action(page), 50);
  await expect(page.locator("#mix-inversions")).toHaveText("5 / 5 inversions");
  await expect(action(page)).toBeDisabled();
  await expect(stand(page)).toBeEnabled();
  await expect(page.locator("#mix-elapsed")).toBeHidden();

  await clickThrough(stand(page), 13);
  await expect(advance(page)).toBeVisible();
  await expect(page.locator("#mix-elapsed")).not.toHaveText("60 / 60 s");
  await advance(page).click();
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
});

test("students choose any two liquids and the settled layers respond to what they mixed", async ({page}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openRack(page);
  await expect(page.locator("#mix-rack button")).toHaveCount(5);
  // No recipe is shown and no volume choice is offered.
  await expect(page.locator("#mix-amount")).toHaveCount(0);
  await expect(page.locator("#mix-amount-note")).toHaveText("The pipette adds 1.0 mL each time.");
  await expect(page.locator("#mix-recipe")).toHaveText("Tube 1 · Empty");
  await expect(page.locator("#mix-action-label")).toHaveText("Dispense liquid");
  await expect(page.locator("#mix-action-icon")).toBeVisible();
  const mixtures = [
    {number: 1, liquids: ["M", "G"], tints: ["clear", "red"], note: "A red band above a clear band."},
    {number: 2, liquids: ["W", "M"], tints: ["blue", "red"], note: "A red band above a blue band."},
    {number: 3, liquids: ["G", "W"], tints: ["blue"], note: "One uniform blue-tinted layer."},
    {number: 4, liquids: ["O", "M"], tints: ["red"], note: "One uniform red-tinted layer."},
    {number: 5, liquids: ["W", "O"], tints: ["blue", "clear"], note: "A clear band above a blue band."}
  ];
  const names = {W: "W Water", G: "G Glycerin", O: "O 1-octanol", M: "M Mineral oil"};
  for (const {number, liquids} of mixtures) {
    await slot(page, number).click();
    for (const code of liquids) await dispense(page, code);
    await expect(page.locator("#mix-recipe")).toHaveText(`Tube ${number} · ${names[liquids[0]]} 1.0 mL + ${names[liquids[1]]} 1.0 mL`);
    await expect(page.locator("#mix-volume")).toHaveText("2.0 mL total");
    await expect(action(page)).toHaveText("Add stopper");
    await expect(page.locator("#mix-action-icon")).toBeHidden();
    await action(page).click();
    await invert(page, 5);
    await placeInRack(page);
  }

  const glass = page.locator("#mix-active-tube");
  async function check({number, tints, note}) {
    await slot(page, number).click();
    if (await advance(page).isVisible()) await advance(page).click();
    await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
    await page.locator("#mix-read").click();
    await expect(page.locator("#mix-observation")).toHaveText(note);
    const steadyBands = glass.locator('[data-mix-band][visibility="visible"]');
    await expect(steadyBands).toHaveCount(tints.length);
    for (let i = 0; i < tints.length; i++) await expect(steadyBands.nth(i)).toHaveAttribute("data-tint", tints[i]);
    await expect(glass.locator("[data-mix-meniscus]")).toHaveAttribute("d", "M-14 -12Q0 -8 14 -12");
    const boundary = glass.locator("[data-mix-interface]");
    await expect(boundary).toHaveAttribute("visibility", tints.length === 2 ? "visible" : "hidden");
    if (tints.length === 2) await expect(boundary).toHaveAttribute("d", "M-14 26H14");
    await expect(glass.locator(".zsa-mmt-mix-refraction")).toHaveAttribute("visibility", tints.includes("clear") ? "visible" : "hidden");
  }
  for (const mixture of mixtures) await check(mixture);

  // Pairs outside the worksheet also respond: two clear layers, and one liquid twice.
  const extra = [
    {number: 1, liquids: ["O", "G"], tints: ["clear", "clear"], note: "A clear band above a clear band."},
    {number: 2, liquids: ["W", "W"], tints: ["blue"], note: "One uniform blue-tinted layer."}
  ];
  for (const {number, liquids} of extra) {
    await slot(page, number).click();
    await page.getByRole("button", {name: "Pour into waste"}).click();
    for (const code of liquids) await dispense(page, code);
    await action(page).click();
    await invert(page, 5);
    await placeInRack(page);
  }
  for (const mixture of extra) await check(mixture);
  expect(errors).toEqual([]);
});

test("the 60 s stand runs on its own in 10 s of real time", async ({page}) => {
  await openRack(page);
  await dispense(page, "M");
  await dispense(page, "W");
  await action(page).click();
  await invert(page, 5);
  await placeInRack(page);
  await expect(page.locator("#mix-elapsed")).toHaveText("0 / 60 s");
  await page.clock.runFor(5000);
  await expect(page.locator("#mix-elapsed")).toHaveText(/^(29|30) \/ 60 s$/);
  await page.clock.runFor(5100);
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
  await expect(advance(page)).toBeHidden();
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText("A red band above a blue band.");
});

test("four inversions and an early read leave the timer gated while other tubes can be corrected", async ({page}) => {
  await openRack(page);
  await slot(page, 3).click();
  await dispense(page, "O");
  await dispense(page, "W");
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
  await expect(stand(page)).toBeHidden();
  await expect(page.locator("#mix-elapsed")).toBeHidden();
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText(/Streaks are visible in the tube/);
  await action(page).click();
  await station(page, "wax").click();
  await page.clock.fastForward(740);
  await station(page, "mixing").click();
  await expect(page.locator("#mix-inversions")).toHaveText("5 / 5 inversions");
  await placeInRack(page);
  await expect(page.locator("#mix-elapsed")).toHaveText("0 / 60 s");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText(/Streaks are visible in the tube/);
  await page.clock.fastForward(5100);
  await expect(page.locator("#mix-observation")).toHaveText(/The boundary between the bands is becoming clearer/);

  // A partly filled tube can be emptied and started again.
  await slot(page, 5).click();
  await dispense(page, "M");
  await expect(page.locator("#mix-recipe")).toHaveText("Tube 5 · M Mineral oil 1.0 mL");
  await page.locator("#mix-empty").click();
  await expect(page.locator("#mix-volume")).toHaveText("0.0 mL total");
  await expect(page.locator("#mix-waste-fill")).toHaveAttribute("visibility", "visible");
  await dispense(page, "M");
  await expect(page.locator("#mix-volume")).toHaveText("1.0 mL total");
  await station(page, "shot").click();
  await page.clock.fastForward(60000);
  await station(page, "mixing").click();
  await expect(slot(page, 5)).toHaveAttribute("aria-pressed", "true");
  await slot(page, 3).click();
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText("A clear band above a blue band.");
  await page.getByRole("button", {name: "Pour into waste"}).click();
  await expect(page.locator("#bench-instruction")).toHaveText(/Tube 3 is empty/);
  await dispense(page, "W");
  await expect(page.locator("#mix-volume")).toHaveText("1.0 mL total");
  await slot(page, 5).click();
  await expect(page.locator("#mix-volume")).toHaveText("1.0 mL total");
  await dispense(page, "G");
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
  await tabTo(page, page.getByRole("button", {name: "Empezar el laboratorio"}));
  await page.keyboard.press("Enter");
  await tabTo(page, station(page, "mixing"));
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByRole("button", {name: "Tubo 3", exact: true}));
  await page.keyboard.press("Enter");
  await expect(page.locator("#mix-recipe")).toHaveText("Tubo 3 · Vacío");
  await page.locator("#mix-inspection").evaluate((scene) => scene.scrollIntoView({block: "start"}));
  const closeUpAndControlsFit = await page.evaluate(() => {
    const scene = document.getElementById("mix-inspection").getBoundingClientRect();
    const controls = document.getElementById("mix-action").getBoundingClientRect();
    return scene.top >= -1 && controls.bottom <= innerHeight;
  });
  expect(closeUpAndControlsFit).toBe(true);
  // The pipette select resets after each pour: one step down is water, three steps is 1-octanol.
  for (const [liquidSteps, key] of [[1, "Tab"], [3, "Shift+Tab"]]) {
    await tabTo(page, page.getByLabel("Líquido en la pipeta"), key);
    for (let i = 0; i < liquidSteps; i++) await page.keyboard.press("ArrowDown");
    await tabTo(page, action(page));
    await expect(action(page)).toHaveText("Agregar líquido");
    await page.keyboard.press("Enter");
    await page.clock.fastForward(450);
  }
  await expect(page.locator("#mix-recipe")).toHaveText("Tubo 3 · W Agua 1.0 mL + O 1-octanol 1.0 mL");
  await expect(action(page)).toHaveText("Poner el tapón");
  await page.keyboard.press("Enter");
  for (let i = 0; i < 5; i++) {
    await expect(action(page)).toHaveText("Invertir con cuidado");
    await page.keyboard.press("Enter");
    await page.clock.fastForward(750);
  }
  await expect(action(page)).toBeDisabled();
  await page.keyboard.press("Tab");
  await expect(stand(page)).toBeFocused();
  await expect(stand(page)).toHaveText("Colocar en vertical");
  await page.keyboard.press("Enter");
  await page.clock.fastForward(300);
  await expect(page.locator("#mix-elapsed")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(advance(page)).toBeFocused();
  await expect(advance(page)).toHaveText("Avanzar a 60 s");
  await page.keyboard.press("Enter");
  const read = page.getByRole("button", {name: "Leer las capas"});
  await expect(read).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#mix-observation")).toHaveText("Una franja transparente sobre una franja azul.");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
  await expect(page.locator("#mix-liquid option").first()).toHaveText("Choose liquid");
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page.locator("#mix-liquid option").first()).toHaveText("Elige el líquido");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("the working rack passes axe at desktop and Spanish phone widths", async ({page}) => {
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
