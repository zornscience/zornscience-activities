"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";
const station = (page, name) => page.locator(`[data-station="${name}"]`);
const slot = (page, number) => page.locator(`[data-mix-tube="${number}"]`);
const action = (page) => page.locator("#mix-action");
const advance = (page) => page.locator("#mix-advance");

async function openRack(page) {
  await page.clock.install();
  await page.goto(LAB);
  await page.locator("#intro-start").click();
  await station(page, "mixing").click();
}

// The pipette adds 0.5 mL of 1-octanol and 1.0 mL of the others, so students only choose the liquid.
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

// The fifth inversion sets the tube upright on its own. Wait for it to reach the rack.
async function placeInRack(page) {
  await page.clock.fastForward(300);
  await expect(page.locator("#mix-stopwatch")).toHaveAttribute("data-state", "running");
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

test("repeated clicks at one position stop at five inversions and cannot advance the clock", async ({page}) => {
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

  await expect(page.locator("#mix-stand")).toHaveCount(0);
  await expect(page.locator("#mix-elapsed")).toHaveText("0:00");
  await expect(page.locator("#mix-stopwatch")).toHaveAttribute("data-state", "ready");
  await clickThrough(action(page), 50);
  await expect(page.locator("#mix-inversions")).toHaveText("5 / 5 inversions");
  await expect(action(page)).toBeDisabled();
  // The tube went back upright on its own and the stopwatch is running, short of 1:00.
  await expect(page.locator("#mix-stopwatch")).toHaveAttribute("data-state", "running");
  await expect(page.locator("#mix-elapsed")).toHaveText(/^0:[01]\d$/);
  await expect(advance(page)).toBeVisible();
  await advance(page).click();
  await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
  await expect(page.locator("#mix-stopwatch")).toHaveAttribute("data-state", "stopped");
});

test("students choose any two liquids and the settled layers respond to what they mixed", async ({page}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openRack(page);
  await expect(page.locator("#mix-rack button")).toHaveCount(5);
  // No recipe is shown and no volume choice is offered. 1-octanol's half portion is called out.
  await expect(page.locator("#mix-amount")).toHaveCount(0);
  const note = page.locator("#mix-amount-note");
  await expect(note).toHaveText("The pipette adds 1.0 mL of each liquid, except 0.5 mL of 1-octanol.");
  await expect(note).toHaveAttribute("data-emphasis", "false");
  await expect(page.locator("#mix-liquid option")).toHaveText(["Choose liquid", "W Water · 1.0 mL", "G Glycerin · 1.0 mL", "O 1-octanol · 0.5 mL", "M Mineral oil · 1.0 mL"]);
  await page.locator("#mix-liquid").selectOption("O");
  await expect(note).toHaveText("1-octanol: the pipette adds only 0.5 mL.");
  await expect(note).toHaveAttribute("data-emphasis", "true");
  await page.locator("#mix-liquid").selectOption("W");
  await expect(note).toHaveAttribute("data-emphasis", "false");
  await expect(page.locator("#mix-recipe")).toHaveText("Tube 1 · Empty");
  await expect(page.locator("#mix-action-label")).toHaveText("Dispense liquid");
  await expect(page.locator("#mix-action-icon")).toBeVisible();
  const mixtures = [
    {number: 1, liquids: ["M", "G"], tints: ["clear", "red"], note: "A red band above a clear band."},
    {number: 2, liquids: ["W", "M"], tints: ["blue", "red"], note: "A red band above a blue band."},
    {number: 3, liquids: ["G", "W"], tints: ["blue"], note: "One uniform blue-tinted layer."},
    {number: 4, liquids: ["O", "M"], tints: ["red"], note: "One uniform red-tinted layer."},
    {number: 5, liquids: ["W", "O"], tints: ["blue", "clear"], note: "A smaller clear band above a blue band."}
  ];
  const names = {W: "W Water", G: "G Glycerin", O: "O 1-octanol", M: "M Mineral oil"};
  const ml = (code) => code === "O" ? 0.5 : 1;
  const total = (liquids) => liquids.reduce((sum, code) => sum + ml(code), 0);
  for (const {number, liquids} of mixtures) {
    await slot(page, number).click();
    for (const code of liquids) await dispense(page, code);
    await expect(page.locator("#mix-recipe")).toHaveText(
      `Tube ${number} · ${names[liquids[0]]} ${ml(liquids[0]).toFixed(1)} mL + ${names[liquids[1]]} ${ml(liquids[1]).toFixed(1)} mL`);
    await expect(page.locator("#mix-volume")).toHaveText(total(liquids).toFixed(1) + " mL total");
    await expect(action(page)).toHaveText("Add stopper");
    await expect(page.locator("#mix-action-icon")).toBeHidden();
    await action(page).click();
    await invert(page, 5);
    await placeInRack(page);
  }

  const glass = page.locator("#mix-active-tube");
  async function check({number, liquids, tints, note}) {
    await slot(page, number).click();
    if (await advance(page).isVisible()) await advance(page).click();
    await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
    await page.locator("#mix-read").click();
    await expect(page.locator("#mix-observation")).toHaveText(note);
    // A settled tube needs no more inversions, so the icon button is hidden and out of the tab order.
    await expect(action(page)).toBeHidden();
    const steadyBands = glass.locator('[data-mix-band][visibility="visible"]');
    await expect(steadyBands).toHaveCount(tints.length);
    for (let i = 0; i < tints.length; i++) await expect(steadyBands.nth(i)).toHaveAttribute("data-tint", tints[i]);
    // Every tube uses one scale, so a 1.5 mL tube fills lower than a 2.0 mL tube.
    const air = 64 - total(liquids) * 38;
    await expect(glass.locator("[data-mix-meniscus]")).toHaveAttribute("d", `M-14 ${air}Q0 ${air + 4} 14 ${air}`);
    const boundary = glass.locator("[data-mix-interface]");
    await expect(boundary).toHaveAttribute("visibility", tints.length === 2 ? "visible" : "hidden");
    if (tints.length === 2) await expect(boundary).toHaveAttribute("d", "M-14 26H14");
    await expect(glass.locator(".zsa-mmt-mix-refraction")).toHaveAttribute("visibility", tints.includes("clear") ? "visible" : "hidden");
  }
  for (const mixture of mixtures) await check(mixture);

  // Pairs outside the worksheet also respond: two clear layers, and one liquid twice.
  const extra = [
    {number: 1, liquids: ["O", "G"], tints: ["clear", "clear"], note: "A smaller clear band above a clear band."},
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
  await expect(page.locator("#mix-elapsed")).toHaveText(/^0:0[0-2]$/);
  await page.clock.runFor(5000);
  await expect(page.locator("#mix-elapsed")).toHaveText(/^0:(29|3[0-2])$/);
  await page.clock.runFor(5100);
  await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
  await expect(page.locator("#mix-stopwatch")).toHaveAttribute("data-state", "stopped");
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
  // The stopwatch waits at 0:00 until the fifth inversion puts the tube back upright.
  await expect(page.locator("#mix-elapsed")).toHaveText("0:00");
  await expect(page.locator("#mix-stopwatch")).toHaveAttribute("data-state", "ready");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText(/Streaks are visible in the tube/);
  await action(page).click();
  await station(page, "wax").click();
  await page.clock.fastForward(740);
  await station(page, "mixing").click();
  await expect(page.locator("#mix-inversions")).toHaveText("5 / 5 inversions");
  await placeInRack(page);
  await expect(page.locator("#mix-elapsed")).toHaveText(/^0:0[0-2]$/);
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
  await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText("A smaller clear band above a blue band.");
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
    if (liquidSteps === 3) {
      await expect(page.locator("#mix-amount-note")).toHaveText("1-octanol: la pipeta agrega solo 0.5 mL.");
      await expect(page.locator("#mix-liquid option").nth(3)).toHaveText("O 1-octanol · 0.5 mL");
    }
    await tabTo(page, action(page));
    await expect(action(page)).toHaveText("Agregar líquido");
    await page.keyboard.press("Enter");
    await page.clock.fastForward(450);
  }
  await expect(page.locator("#mix-recipe")).toHaveText("Tubo 3 · W Agua 1.0 mL + O 1-octanol 0.5 mL");
  await expect(action(page)).toHaveText("Poner el tapón");
  await page.keyboard.press("Enter");
  for (let i = 0; i < 5; i++) {
    await expect(action(page)).toHaveText("Invertir con cuidado");
    await page.keyboard.press("Enter");
    await page.clock.fastForward(750);
  }
  // The tube goes back upright on its own and focus moves to the running stopwatch.
  await page.clock.fastForward(300);
  await expect(page.locator("#mix-elapsed")).toBeFocused();
  await expect(page.locator("#mix-elapsed")).toHaveAccessibleName("Tiempo de reposo");
  await page.keyboard.press("Tab");
  await expect(advance(page)).toBeFocused();
  await expect(advance(page)).toHaveText("Avanzar a 60 s");
  await page.keyboard.press("Enter");
  const read = page.getByRole("button", {name: "Leer las capas"});
  await expect(read).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#mix-observation")).toHaveText("Una franja transparente más pequeña sobre una franja azul.");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
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
