"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";

function errorsFrom(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) errors.push(message.text());
  });
  return errors;
}

function station(page, key) { return page.locator('[data-station="' + key + '"]'); }
function selector(page, key) { return page.locator('[data-shot-tube="' + key + '"]'); }
function clock(page) { return page.locator("#shot-time"); }
function stopwatch(page) { return page.locator("#shot-stopwatch"); }

async function openShot(page, query = "") {
  await page.clock.install();
  await page.goto(LAB + query);
  await page.locator("#intro-start").click();
  await station(page, "shot").click();
}

async function tilt(page, uprightLabel = "Turn upright") {
  const action = page.locator("#shot-operate");
  await action.click();
  await page.clock.runFor(760);
  await expect(action).toHaveText(uprightLabel);
  await expect(action).toBeEnabled();
}

// Tilting the tube again returns the shot to the stopper and clears the stopwatch. There is no magnet.
async function retilt(page) {
  const action = page.locator("#shot-operate");
  await expect(action).toHaveText("Tilt tube");
  await expect(action).toBeEnabled();
  await action.click();
  await expect(clock(page)).toHaveText("0.00 s");
  await page.clock.runFor(760);
  await expect(action).toHaveText("Turn upright");
}

async function tabTo(page, target, key = "Tab") {
  for (let i = 0; i < 45; i++) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
}

test("water and glycerin share event timing at different frame cadences and replay without changing the reading", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await expect(page.locator("#shot-tubes button")).toHaveCount(4);
  // The stopwatch is a digital, event-timed display with no timing controls of its own.
  await expect(stopwatch(page).getByRole("heading", {name: "Stopwatch"})).toBeVisible();
  await expect(stopwatch(page)).toContainText("Starts when the shot leaves the stopper. Stops when it first touches the bottom.");
  await expect(stopwatch(page).getByRole("button")).toHaveCount(0);
  await expect(stopwatch(page)).toHaveAttribute("data-state", "ready");
  await expect(page.locator("#shot-magnet")).toHaveCount(0);
  // The stopwatch shows "<0.5" below the worksheet's reporting threshold.
  for (const [key, time, flight, stepped] of [["W", "<0.5", 270, false], ["G", "6.40", 6400, true]]) {
    await selector(page, key).click();
    const fill = page.locator("#shot-active-tube .zsa-mmt-shot-liquid");
    const uprightFill = await fill.getAttribute("d");
    await tilt(page);
    await expect(fill).not.toHaveAttribute("d", uprightFill);
    await expect(page.locator('#shot-rack-content [data-selected="true"] [visibility="hidden"]')).toHaveCount(1);
    const action = page.locator("#shot-operate");
    await action.evaluate((button) => {
      for (let i = 0; i < 5; i++) button.click();
    });
    await expect(action).toBeDisabled();
    if (stepped) {
      await page.clock.runFor(1800);
      await expect(page.locator("#bench-instruction")).toHaveText(/stopwatch is running/);
      await expect(stopwatch(page)).toHaveAttribute("data-state", "running");
      expect(Number.parseFloat(await clock(page).innerText())).toBeGreaterThan(0);
      await station(page, "wax").click();
      await station(page, "shot").click();
      await page.locator("#shot-resume").click();
      await expect(clock(page)).toBeFocused();
      await page.clock.runFor(flight);
    } else {
      // The running water timer describes its state. The censored reading appears at first contact.
      await page.clock.runFor(460 + 100);
      await expect(clock(page)).toHaveText("Timing");
      await page.clock.fastForward(flight + 540 - 560);
    }
    await expect(clock(page)).toHaveText(time + " s");
    await expect(stopwatch(page)).toHaveAttribute("data-state", "stopped");
    await expect(action).toHaveText("Tilt tube");
    await expect(page.locator("#bench-instruction")).toHaveText(/Record the time on your lab worksheet/);

    await page.locator("#shot-replay").click();
    const instruction = page.locator("#bench-instruction");
    await expect(instruction).toHaveText(key === "W" ? /Slow-motion replay/ : /Replay. The shot leaves the stopper/);
    await page.clock.fastForward(Math.max(flight, 1400) + 80);
    await expect(instruction).toHaveText(key === "W" ? /The original fall took less than 0\.5 s/ : /First contact came 6\.40 s/);
    await expect(clock(page)).toHaveText(time + " s");
    // Tilting again starts the next trial, so the stopwatch clears once the student has copied the reading.
    await retilt(page);
    await expect(stopwatch(page)).toHaveAttribute("data-state", "ready");
  }
  expect(errors).toEqual([]);
});

test("the stopwatch and shot freeze when the tab is hidden and when another station or tube opens", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await selector(page, "G").click();
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.runFor(1060);
  const ball = page.locator("#shot-active-tube circle");
  const runningAt = Number.parseFloat(await clock(page).innerText());
  expect(runningAt).toBeGreaterThan(.5);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {configurable: true, value: true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const frozenTime = await clock(page).innerText();
  const frozenY = await ball.getAttribute("cy");
  await page.clock.fastForward(10000);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {configurable: true, value: false});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(Number.parseFloat(frozenTime)).toBeGreaterThanOrEqual(runningAt);
  await expect(clock(page)).toHaveText(frozenTime);
  await expect(ball).toHaveAttribute("cy", frozenY);
  await expect(stopwatch(page)).toHaveAttribute("data-state", "paused");
  await expect(page.locator("#shot-resume")).toBeVisible();

  await station(page, "wax").click();
  await page.clock.fastForward(9000);
  await station(page, "shot").click();
  await expect(clock(page)).toHaveText(frozenTime);
  await expect(ball).toHaveAttribute("cy", frozenY);
  await selector(page, "W").click();
  await expect(clock(page)).toHaveText("0.00 s");
  await expect(page.locator("#shot-resume")).toBeHidden();
  await selector(page, "G").click();
  await expect(page.locator("#shot-resume")).toBeVisible();
  await page.locator("#shot-resume").click();
  await expect(clock(page)).toBeFocused();
  await page.clock.fastForward(6200);
  // The pause does not change the reading: it is still the full simulated fall time.
  await expect(clock(page)).toHaveText("6.40 s");
  await retilt(page);
  expect(errors).toEqual([]);
});

test("each trial gives the same event-timed reading and the worksheet prompt follows every fall", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await selector(page, "M").click();
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(460 + 2250 + 100);
  await expect(clock(page)).toHaveText("2.25 s");
  await expect(page.locator("#bench-instruction")).toHaveText(
    "The shot touched the bottom. Record the time on your lab worksheet, then tilt the tube for another trial."
  );
  await page.locator("#shot-replay").click();
  await page.clock.fastForward(2400);
  await expect(page.locator("#bench-instruction")).toHaveText("Replay complete. First contact came 2.25 s after departure.");
  await expect(clock(page)).toHaveText("2.25 s");
  await retilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(460 + 2250 + 100);
  await expect(clock(page)).toHaveText("2.25 s");
  await page.locator("#shot-reset").click();
  await expect(clock(page)).toHaveText("0.00 s");
  await expect(stopwatch(page)).toHaveAttribute("data-state", "ready");
  expect(errors).toEqual([]);
});

test("clicking a tube or its label in the rack selects it like the named buttons", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await expect(selector(page, "W")).toHaveAttribute("aria-pressed", "true");
  await page.locator('#shot-rack-content g[data-shot-rack-tube="G"]').click();
  await expect(selector(page, "G")).toHaveAttribute("aria-pressed", "true");
  await expect(selector(page, "W")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('#shot-rack-content g[data-shot-rack-tube="G"]')).toHaveAttribute("data-selected", "true");
  await page.locator('#shot-rack-content text[data-shot-rack-tube="M"]').click();
  await expect(selector(page, "M")).toHaveAttribute("aria-pressed", "true");
  // A tube in mid-trial keeps its reading when another rack tube is chosen and then chosen again.
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(460 + 2250 + 100);
  await expect(clock(page)).toHaveText("2.25 s");
  await page.locator('#shot-rack-content g[data-shot-rack-tube="O"]').click();
  await expect(clock(page)).toHaveText("0.00 s");
  await page.locator('#shot-rack-content g[data-shot-rack-tube="M"]').click();
  await expect(clock(page)).toHaveText("2.25 s");
  expect(errors).toEqual([]);
});

test("a slowed water replay reports a fall under 0.5 s in Spanish", async ({page}) => {
  await page.clock.install();
  await page.goto(LAB + "?lang=es");
  await page.locator("#intro-start").click();
  await station(page, "shot").click();
  const operate = page.locator("#shot-operate");
  await operate.click();
  await page.clock.runFor(750);
  await operate.click();
  await page.clock.fastForward(850);
  const instruction = page.locator("#bench-instruction");
  await page.locator("#shot-replay").click();
  await expect(instruction).toHaveText(/Repetición en cámara lenta/);
  await page.clock.fastForward(1500);
  await expect(instruction).toHaveText("Terminó la repetición en cámara lenta. La caída original duró menos de 0.5 s.");
  await expect(clock(page)).toHaveText("<0.5 s");
});

test("Mexican Spanish keyboard flow and reduced motion keep the reading through language and station changes", async ({page}) => {
  const errors = errorsFrom(page);
  await page.setViewportSize({width: 360, height: 740});
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.clock.install();
  await page.goto(LAB + "?lang=es");
  await tabTo(page, page.getByRole("button", {name: "Empezar el laboratorio"}));
  await page.keyboard.press("Enter");
  await tabTo(page, station(page, "shot"));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", {name: "Tubos sellados"})).toBeVisible();
  await expect(page.locator("#station-tag")).toHaveText("Tiempos simulados");
  await tabTo(page, selector(page, "O"));
  await page.keyboard.press("Enter");
  await tabTo(page, page.locator("#shot-operate"));
  await page.keyboard.press("Enter");
  await page.clock.runFor(760);
  await expect(page.locator("#shot-operate")).toHaveText("Poner en vertical");
  await page.keyboard.press("Enter");
  await page.clock.fastForward(1570);
  await expect(clock(page)).toHaveText("0.98 s");
  await expect(page.locator("#shot-operate")).toHaveText("Inclinar tubo");
  await expect(page.locator("#bench-instruction")).toHaveText(
    "El perdigón tocó el fondo. Anota el tiempo en tu hoja de trabajo del laboratorio y luego inclina el tubo para otro ensayo."
  );
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(clock(page)).toHaveText("0.98 s");
  await page.getByRole("link", {name: "ES Español"}).click();
  await page.getByRole("button", {name: "Instrucciones"}).click();
  await expect(page.getByRole("dialog", {name: "Carrera del perdigón de acero"}))
    .toContainText("El cronómetro arranca cuando el perdigón sale del tapón");
  await page.keyboard.press("Escape");
  await station(page, "mixing").click();
  await expect(page.locator("#station-tag")).toHaveText("Mezclas simuladas");
  await page.getByRole("button", {name: "Instrucciones"}).click();
  await expect(page.getByRole("dialog", {name: "¿Se mezclan o forman capas?"}))
    .toContainText("Invierte el tubo con cuidado cinco veces");
  await page.keyboard.press("Escape");
  await station(page, "shot").click();
  await expect(selector(page, "O")).toHaveAttribute("aria-pressed", "true");
  await expect(clock(page)).toHaveText("0.98 s");
  expect(errors).toEqual([]);
});

test("the shot bench passes axe at laptop and Spanish phone widths", async ({page}) => {
  await openShot(page);
  const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.evaluate(axe);
  async function audit() {
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}});
      return result.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]);
    });
    expect(violations).toEqual([]);
  }
  await audit();
  await page.setViewportSize({width: 360, height: 740});
  await page.getByRole("link", {name: "ES Español"}).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await audit();
});
