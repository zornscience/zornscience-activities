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

async function openShot(page, query = "") {
  await page.clock.install();
  await page.goto(LAB + query);
  await station(page, "shot").click();
}

async function tilt(page, uprightLabel = "Turn upright") {
  const action = page.locator("#shot-operate");
  await action.click();
  await page.clock.runFor(760);
  await expect(action).toHaveText(uprightLabel);
  await expect(action).toBeEnabled();
}

async function magnet(page, releaseLabel = "Release shot") {
  const action = page.locator("#shot-operate");
  await expect(action).toBeEnabled();
  await action.click();
  await page.clock.runFor(720);
  await expect(action).toHaveText(releaseLabel);
  await expect(page.locator("#shot-magnet")).toHaveAttribute("transform", /^translate\(240 /);
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
  // Event timing shows "<0.5" below the hand-held threshold, as the worksheet asks.
  for (const [key, time, flight, stepped] of [["W", "<0.5", 270, false], ["G", "6.40", 6400, true]]) {
    await selector(page, key).click();
    await page.locator("#shot-mode-event").click();
    const fill = page.locator("#shot-active-tube .zsa-mmt-shot-liquid");
    const uprightFill = await fill.getAttribute("d");
    await tilt(page);
    await expect(fill).not.toHaveAttribute("d", uprightFill);
    await expect(page.locator('#shot-rack-content [data-selected="true"] [visibility="hidden"]')).toHaveCount(1);
    const action = page.locator("#shot-operate");
    await action.evaluate((button) => {
      for (let i = 0; i < 5; i++) button.click();
    });
    await expect(page.locator("#shot-stopwatch")).toBeDisabled();
    await expect(action).toBeDisabled();
    if (stepped) {
      await page.clock.runFor(1800);
      await expect(page.locator("#bench-instruction")).toHaveText(/stopwatch is running/);
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
    await expect(action).toHaveText("Use magnet");
    await expect(page.locator("#bench-instruction")).toHaveText(/Record the time on your lab worksheet/);

    await page.locator("#shot-replay").click();
    const instruction = page.locator("#bench-instruction");
    await expect(instruction).toHaveText(key === "W" ? /Slow-motion replay/ : /Replay. The shot leaves the stopper/);
    await page.clock.fastForward(Math.max(flight, 1400) + 80);
    await expect(instruction).toHaveText(key === "W" ? /The original fall took less than 0\.5 s/ : /First contact came 6\.40 s/);
    await expect(clock(page)).toHaveText(time + " s");
    // The magnet starts the next trial, so the stopwatch clears once the student has copied the reading.
    await magnet(page);
    await expect(clock(page)).toHaveText("0.00 s");
  }
  expect(errors).toEqual([]);
});

test("manual clock and shot freeze when the tab is hidden and when another station or tube opens", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await selector(page, "G").click();
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.runFor(510);
  await page.locator("#shot-stopwatch").click();
  await page.clock.runFor(550);
  const ball = page.locator("#shot-active-tube circle");
  const stoppedAt = await clock(page).innerText();
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
  expect(Number.parseFloat(frozenTime)).toBeGreaterThanOrEqual(Number.parseFloat(stoppedAt));
  await expect(clock(page)).toHaveText(frozenTime);
  await expect(ball).toHaveAttribute("cy", frozenY);
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
  await expect(page.locator("#shot-stopwatch")).toBeFocused();
  await page.clock.fastForward(6200);
  await expect(page.locator("#bench-instruction")).toHaveText(/Stop timing/);
  await page.locator("#shot-stopwatch").click();
  expect(Number.parseFloat(await clock(page).innerText())).toBeLessThan(8);
  await expect(page.locator("#shot-feedback")).toHaveText(/after first contact/);
  await magnet(page);
  await expect(clock(page)).toHaveText("0.00 s");
  expect(errors).toEqual([]);
});

test("a manual replay hides the interval and the worksheet prompts replace saved readings", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await selector(page, "G").click();
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.runFor(500);
  await page.locator("#shot-stopwatch").click();
  await page.clock.runFor(6400);
  await page.locator("#shot-stopwatch").click();
  const first = (await clock(page).innerText()).replace(" s", "");
  expect(Number.parseFloat(first)).toBeGreaterThan(6.3);
  expect(Number.parseFloat(first)).toBeLessThan(6.6);
  await expect(page.locator("#shot-feedback")).toHaveText("");
  await expect(page.locator("#bench-instruction")).toHaveText(
    "The shot touched the bottom. Record the time on your lab worksheet, then use the magnet for another trial."
  );

  await page.locator("#shot-replay").click();
  await page.clock.fastForward(6500);
  await expect(page.locator("#bench-instruction")).toHaveText(/Replay complete. Compare the marked departure/);
  await expect(page.locator("#bench-instruction")).not.toHaveText(/\d\.\d+ s/);
  await expect(clock(page)).toHaveText(first + " s");

  await magnet(page);
  await expect(clock(page)).toHaveText("0.00 s");
  await expect(page.locator("#shot-feedback")).toHaveText("");

  // An untimed manual fall leaves the too-fast judgment to the student, whatever the liquid.
  await page.locator("#shot-operate").click();
  await page.clock.runFor(6700);
  await expect(page.locator("#shot-feedback")).toHaveText("Too fast to time? Record less than 0.5 s on your lab worksheet.");
  await page.locator("#shot-reset").click();
  await expect(clock(page)).toHaveText("0.00 s");
  await expect(page.locator("#shot-feedback")).toHaveText("");
  expect(errors).toEqual([]);
});

test("a slowed manual replay gives event cues and no interval in Spanish", async ({page}) => {
  await page.clock.install();
  await page.goto(LAB + "?lang=es");
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
  await expect(instruction).toHaveText(/Terminó la repetición en cámara lenta.*iniciar y detener el cronómetro/);
  await expect(instruction).not.toHaveText(/\d\.\d+ s/);
});

test("an early manual stop keeps the measured value and a magnet retry gives a distinct result", async ({page}) => {
  await openShot(page);
  await selector(page, "M").click();
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.runFor(500);
  await page.locator("#shot-stopwatch").click();
  await page.clock.runFor(400);
  await page.locator("#shot-stopwatch").click();
  const first = await clock(page).innerText();
  expect(Number.parseFloat(first)).toBeGreaterThan(.35);
  expect(Number.parseFloat(first)).toBeLessThan(1);
  await expect(page.locator("#shot-feedback")).toHaveText(/stopped before contact/);
  await page.clock.fastForward(2200);
  await expect(clock(page)).toHaveText(first);
  await magnet(page);
  await page.locator("#shot-mode-event").click();
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(2600);
  await expect(clock(page)).toHaveText("2.25 s");
});

test("Mexican Spanish keyboard flow and reduced motion keep the reading through language and station changes", async ({page}) => {
  const errors = errorsFrom(page);
  await page.setViewportSize({width: 360, height: 740});
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.clock.install();
  await page.goto(LAB + "?lang=es");
  await tabTo(page, station(page, "shot"));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", {name: "Tubos sellados"})).toBeVisible();
  await expect(page.locator("#station-tag")).toHaveText("Tiempos simulados");
  await tabTo(page, selector(page, "O"));
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByRole("button", {name: "Automático"}));
  await page.keyboard.press("Space");
  await tabTo(page, page.locator("#shot-operate"), "Shift+Tab");
  await page.keyboard.press("Enter");
  await page.clock.runFor(760);
  await expect(page.locator("#shot-operate")).toHaveText("Poner en vertical");
  await page.keyboard.press("Enter");
  await page.clock.fastForward(1570);
  await expect(clock(page)).toHaveText("0.98 s");
  await expect(page.locator("#bench-instruction")).toHaveText(
    "El perdigón tocó el fondo. Anota el tiempo en tu hoja de trabajo del laboratorio y luego usa el imán para otro ensayo."
  );
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(clock(page)).toHaveText("0.98 s");
  await page.getByRole("link", {name: "ES Español"}).click();
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
