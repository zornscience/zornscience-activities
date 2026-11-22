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
function card(page, key) { return page.locator('[data-shot-card="' + key + '"]'); }
function extra(page, key) { return page.locator('[data-shot-extra="' + key + '"]'); }
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

test("water and glycerin share event timing at different frame cadences and replay without adding a trial", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await expect(page.locator("#shot-tubes button")).toHaveCount(4);
  for (const [key, time, flight, stepped] of [["W", "0.27", 270, false], ["G", "6.40", 6400, true]]) {
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
      await page.clock.fastForward(flight + 540);
    }
    await expect(clock(page)).toHaveText(time + " s");
    await expect(action).toHaveText("Use magnet");
    await page.locator("#shot-record").evaluate((button) => { button.click(); button.click(); });
    const first = card(page, key).getByRole("textbox", {name: "Fall time, trial 1 (s)"});
    await expect(first).toHaveValue(time);
    await expect(first).toHaveAccessibleDescription("Instrument-timed");
    await expect(card(page, key).getByRole("textbox", {name: "Fall time, trial 2 (s)"})).toHaveValue("");

    await page.locator("#shot-replay").click();
    await expect(page.locator("#bench-instruction")).toHaveText(/Replay. The shot leaves the stopper/);
    await page.clock.fastForward(Math.max(flight, 1400) + 80);
    await expect(page.locator("#bench-instruction")).toHaveText(new RegExp("First contact came " + time + " s"));
    await expect(clock(page)).toHaveText(time + " s");
    await expect(card(page, key).getByRole("textbox", {name: "Fall time, trial 2 (s)"})).toHaveValue("");
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
  // A flagged late stop is not saved for the student.
  await expect(card(page, "G").getByRole("textbox", {name: "Fall time, trial 1 (s)"})).toHaveValue("");
  expect(errors).toEqual([]);
});

test("a manual replay hides the interval, and the magnet or a reset saves an unrecorded reading", async ({page}) => {
  const errors = errorsFrom(page);
  await openShot(page);
  await selector(page, "G").click();
  const glycerin = card(page, "G");
  const trial = (number) => glycerin.getByRole("textbox", {name: "Fall time, trial " + number + " (s)"});
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

  await page.locator("#shot-replay").click();
  await page.clock.fastForward(6500);
  await expect(page.locator("#bench-instruction")).toHaveText(/Replay complete. Compare the marked departure/);
  await expect(page.locator("#bench-instruction")).not.toHaveText(/\d\.\d+ s/);
  await expect(trial(1)).toHaveValue("");

  await magnet(page);
  await expect(trial(1)).toHaveValue(first);
  await expect(page.locator("#shot-feedback")).toHaveText("Reading " + first + " s saved as trial 1.");

  // An untimed manual fall lets the student choose <0.5, whatever the liquid.
  await page.locator("#shot-operate").click();
  await page.clock.runFor(6700);
  await expect(page.locator("#shot-feedback")).toHaveText(/too fast to time/);
  await expect(page.locator("#shot-record-below")).toBeEnabled();

  await magnet(page);
  await page.locator("#shot-operate").click();
  await page.clock.runFor(200);
  await page.locator("#shot-stopwatch").click();
  await page.clock.runFor(6450);
  await page.locator("#shot-stopwatch").click();
  const second = (await clock(page).innerText()).replace(" s", "");
  await expect(page.locator("#shot-feedback")).toHaveText("");
  await page.locator("#shot-reset").click();
  await expect(trial(2)).toHaveValue(second);
  await expect(page.locator("#shot-feedback")).toHaveText("Reading " + second + " s saved as trial 2.");
  await expect(clock(page)).toHaveText("0.00 s");
  expect(errors).toEqual([]);
});

test("an early manual stop keeps the measured value and a magnet retry creates a distinct result", async ({page}) => {
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
  await page.locator("#shot-record").click();
  await expect(card(page, "M").getByRole("textbox", {name: "Fall time, trial 1 (s)"})).toHaveValue(first.replace(" s", ""));
  await magnet(page);
  await page.locator("#shot-mode-event").click();
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(2600);
  await expect(clock(page)).toHaveText("2.25 s");
  await page.locator("#shot-record").click();
  await expect(card(page, "M").getByRole("textbox", {name: "Fall time, trial 2 (s)"})).toHaveValue("2.25");
});

test("two too-fast trials produce a below-threshold mean and an extra measurable trial clears a bound", async ({page}) => {
  await openShot(page);
  await tilt(page);
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(820);
  await page.locator("#shot-record-below").click();
  await magnet(page);
  await page.locator("#shot-operate").click();
  await page.clock.fastForward(540);
  await page.locator("#shot-record-below").click();
  const water = card(page, "W");
  const first = water.getByRole("textbox", {name: "Fall time, trial 1 (s)"});
  const second = water.getByRole("textbox", {name: "Fall time, trial 2 (s)"});
  await expect(first).toHaveValue("<0.5");
  await expect(second).toHaveValue("<0.5");
  await page.getByRole("button", {name: "Check averages"}).click();
  await expect(extra(page, "W").getByText("The average of trials 1 and 2 is less than 0.5 s.")).toBeVisible();
  await second.fill("0.28");
  await page.getByRole("button", {name: "Check averages"}).click();
  await expect(extra(page, "W").getByText(/at least 0.14 s and less than 0.39 s/)).toBeVisible();
  await extra(page, "W").getByRole("button", {name: "Add trial"}).click();
  const third = extra(page, "W").getByRole("textbox", {name: "Fall time, trial 3 (s)"});
  await expect(third).toBeFocused();
  await third.fill("0.32");
  await water.getByRole("textbox", {name: "Average fall time (s)"}).fill("0.30");
  await page.getByRole("button", {name: "Check averages"}).click();
  await expect(extra(page, "W").getByText("Trials 2 and 3 give an average of 0.30 s. Your average matches.")).toBeVisible();
  await expect(first).toHaveValue("<0.5");
  await page.locator("#shot-reset").click();
  await expect(second).toHaveValue("0.28");
});

test("Mexican Spanish keyboard flow, reduced motion and the printable notebook retain both tests", async ({page}) => {
  const errors = errorsFrom(page);
  await page.setViewportSize({width: 360, height: 740});
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.clock.install();
  await page.goto(LAB + "?lang=es");
  const waxWater = page.locator("#liquid-W").locator("..").getByRole("textbox");
  await waxWater.fill("10");
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
  await tabTo(page, page.getByRole("button", {name: "Anotar lectura"}));
  await page.keyboard.press("Enter");
  const octanol = card(page, "O");
  await expect(octanol.getByRole("textbox", {name: "Tiempo de caída, ensayo 1 (s)"})).toHaveValue("0.98");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(octanol.getByRole("textbox", {name: "Fall time, trial 1 (s)"})).toHaveValue("0.98");
  await page.getByRole("link", {name: "ES Español"}).click();
  await station(page, "mixing").click();
  await expect(page.locator("#station-tag")).toHaveText("Vista previa");
  await page.getByRole("button", {name: "Instrucciones"}).click();
  await expect(page.getByRole("dialog", {name: "¿Se mezclan o forman capas?"}))
    .toContainText("La gradilla de mezclas es una vista previa.");
  await page.keyboard.press("Escape");
  await station(page, "shot").click();
  await expect(octanol.getByRole("textbox", {name: "Tiempo de caída, ensayo 1 (s)"})).toHaveValue("0.98");
  await page.emulateMedia({media: "print"});
  await expect(octanol.getByText("0.98", {exact: true})).toBeVisible();
  await expect(page.locator("#liquid-W").locator("..").getByText("10", {exact: true})).toBeVisible();
  await expect(card(page, "M")).toBeVisible();
  expect(errors).toEqual([]);
});

test("all four averages stay visible alongside the wax notebook and respect the precision of the readings", async ({page}) => {
  await page.goto(LAB);
  const diameter = page.locator("#liquid-W").locator("..").getByRole("textbox");
  await diameter.fill("10");
  await station(page, "shot").click();
  await expect(diameter).toBeVisible();
  await expect(diameter).toHaveValue("10");
  await expect(page.locator("#shot-notebook").getByRole("columnheader")).toHaveText(
    ["Liquid", "Fall time, trial 1 (s)", "Fall time, trial 2 (s)", "Average fall time (s)"]
  );
  for (const [key, first, second] of [["W", "<0.5", "<0.5"], ["G", "6.31", "6.52"], ["O", "0.88", "1.12"], ["M", "2.20", "2.30"]]) {
    const row = card(page, key);
    await expect(row).toBeVisible();
    await row.getByRole("textbox", {name: "Fall time, trial 1 (s)"}).fill(first);
    await row.getByRole("textbox", {name: "Fall time, trial 2 (s)"}).fill(second);
  }
  await selector(page, "G").click();
  const glycerin = card(page, "G");
  await glycerin.getByRole("textbox", {name: "Average fall time (s)"}).fill("6.4");
  const check = page.getByRole("button", {name: "Check averages"});
  await check.click();
  await expect(page.locator("#shot-entries .zsa-mmt-shot-result")).toHaveText(["<0.5 s", "6.42 s", "1.00 s", "2.25 s"]);
  await expect(extra(page, "G")).toContainText("Your average matches.");
  await glycerin.getByRole("textbox", {name: "Fall time, trial 1 (s)"}).fill("6,31");
  await check.click();
  await expect(extra(page, "G")).toContainText("with a decimal point");
});

test("the shot bench and trial notebook pass axe at laptop and Spanish phone widths", async ({page}) => {
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
