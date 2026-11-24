"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";
const station = (page, key) => page.locator(`[data-station="${key}"]`);
const slot = (page, number) => page.locator(`[data-mix-tube="${number}"]`);
const diameters = {W: 10, G: 12, O: 20, M: 22};
const shotMs = {W: 270, G: 6400, O: 980, M: 2250};
// The worksheet's five pairs. Students choose which tube gets which pair.
const mixes = {
  1: {pair: ["W", "G"], layers: "One uniform blue-tinted layer."},
  2: {pair: ["M", "W"], layers: "A red band above a blue band."},
  3: {pair: ["W", "O"], layers: "A smaller clear band above a blue band."},
  4: {pair: ["O", "M"], layers: "One uniform red-tinted layer."},
  5: {pair: ["M", "G"], layers: "A red band above a clear band."}
};

async function openLab(page, query = "") {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.clock.install();
  await page.goto(LAB + query);
  await page.locator("#intro-start").click();
}

// Students copy each reading to the lab worksheet, so these helpers check what the bench shows.
async function measureWax(page, code) {
  const diameter = diameters[code];
  await page.locator(`[data-bottle="${code}"]`).click();
  for (let drop = 0; drop < 3; drop++) {
    await page.locator("#dispense").click();
    await page.clock.fastForward(280);
  }
  // The puddle settles on its own: 30 s on the clock in 2.5 s of real time. runFor steps through every frame;
  // a single fastForward jump could let the settled frame draw before the page's clock caught up under load.
  await page.clock.runFor(2600);
  await expect(page.locator("#measure-tools")).toBeVisible();
  const ruler = page.locator("#ruler-position");
  await ruler.focus();
  const steps = (Number(await ruler.inputValue()) + diameter / 2) / -0.5;
  for (let i = 0; i < steps; i++) await page.keyboard.press("ArrowRight");
  await page.locator("#read-edges").click();
  await expect(page.locator("#edge-reading")).toHaveText(new RegExp(`0 mm.*${diameter} mm`));
}

// Two trials per liquid. The event-timed stopwatch reads water as "<0.5 s" both times.
async function timeShot(page, code) {
  await page.locator(`[data-shot-tube="${code}"]`).click();
  const operate = page.locator("#shot-operate");
  const reading = code === "W" ? "<0.5 s" : (shotMs[code] / 1000).toFixed(2) + " s";
  await operate.click();
  await page.clock.fastForward(750);
  await operate.click();
  await page.clock.fastForward(shotMs[code] + 570);
  await expect(page.locator("#shot-time")).toHaveText(reading);

  // Tilting the tube again clears the stopwatch and returns the shot to the stopper.
  await expect(operate).toHaveText(/^(Tilt tube|Inclinar tubo)$/);
  await operate.click();
  await expect(page.locator("#shot-time")).toHaveText("0.00 s");
  await page.clock.fastForward(750);
  await operate.click();
  await page.clock.fastForward(shotMs[code] + 570);
  await expect(page.locator("#shot-time")).toHaveText(reading);
}

async function prepareMixture(page, number) {
  await slot(page, number).click();
  const action = page.locator("#mix-action");
  for (const code of mixes[number].pair) {
    await page.locator("#mix-liquid").selectOption(code);
    await action.click();
    await page.clock.fastForward(455);
  }
  await action.click();
  for (let turn = 0; turn < 5; turn++) {
    await action.click();
    await page.clock.fastForward(755);
  }
  // The fifth inversion sets the tube upright on its own.
  await page.clock.fastForward(310);
}

async function readMixture(page, number) {
  await slot(page, number).click();
  const advance = page.locator("#mix-advance");
  if (await advance.isVisible()) await advance.click();
  await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).not.toHaveText("");
}

const orders = [
  ["wax", "shot", "mixing"], ["wax", "mixing", "shot"], ["shot", "wax", "mixing"],
  ["shot", "mixing", "wax"], ["mixing", "wax", "shot"], ["mixing", "shot", "wax"]
];

for (const order of orders) {
  test(`classroom station order ${order.join(", ")} keeps each station's result`, async ({page}) => {
    await openLab(page);
    for (const key of order) {
      await station(page, key).click();
      if (key === "wax") await measureWax(page, "W");
      else if (key === "shot") await timeShot(page, "W");
      else {
        await prepareMixture(page, 3);
        await readMixture(page, 3);
      }
    }
    await station(page, "wax").click();
    await expect(page.locator("#edge-reading")).toHaveText(/Left edge 0 mm. Right edge 10 mm/);
    await station(page, "mixing").click();
    await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
    await page.locator("#mix-read").click();
    await expect(page.locator("#mix-observation")).toHaveText(mixes[3].layers);
    await station(page, "shot").click();
    await expect(page.locator("#shot-time")).toHaveText("<0.5 s");
    await expect(page.locator("#shot-operate")).toHaveText("Tilt tube");
  });
}

test("the entire interleaved classroom walkthrough runs in both languages with browser storage disabled", async ({page}) => {
  await page.setViewportSize({width: 360, height: 740});
  await page.addInitScript(() => {
    for (const name of ["localStorage", "sessionStorage", "indexedDB"]) {
      Object.defineProperty(window, name, {get() { throw new DOMException("Storage disabled", "SecurityError"); }});
    }
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openLab(page, "?lang=es");

  await station(page, "mixing").click();
  await prepareMixture(page, 3);
  await station(page, "wax").click();
  await measureWax(page, "W");
  await page.clock.fastForward(10000);
  await station(page, "mixing").click();
  await expect(page.locator("#mix-elapsed")).toHaveText("1:00");
  await readMixture(page, 3);
  await expect(page.locator("#mix-observation")).toHaveText("Una franja transparente más pequeña sobre una franja azul.");

  await station(page, "shot").click();
  await timeShot(page, "W");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#shot-time")).toHaveText("<0.5 s");
  for (const code of ["M", "O", "G"]) await timeShot(page, code);
  await station(page, "wax").click();
  for (const code of ["G", "M", "O"]) await measureWax(page, code);
  await station(page, "mixing").click();
  for (const number of [5, 1, 4, 2]) {
    await prepareMixture(page, number);
    await readMixture(page, number);
    await expect(page.locator("#mix-observation")).toHaveText(mixes[number].layers);
    await page.locator("#mix-empty").click();
  }
  await slot(page, 3).click();
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).toHaveText(mixes[3].layers);
  await page.locator("#mix-empty").click();
  await expect(page.locator("#mix-volume")).toHaveText("0.0 mL total");
  await expect(page.locator("#mix-waste-fill")).toHaveAttribute("visibility", "visible");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

  await page.locator("#restart-open").click();
  await page.getByRole("button", {name: "Reset all stations"}).click();
  await station(page, "wax").click();
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(0);
  await station(page, "shot").click();
  await expect(page.locator("#shot-time")).toHaveText("0.00 s");
  expect(errors).toEqual([]);
});

test("the lab keeps no student entries, so a reload starts fresh without a leave-page prompt", async ({page}) => {
  const prompts = [];
  page.on("dialog", async (dialog) => {
    prompts.push(dialog.type());
    await dialog.dismiss();
  });
  await openLab(page);
  await measureWax(page, "W");
  await page.reload({timeout: 5000});
  expect(prompts).toEqual([]);
  await expect(page.locator("#intro")).toBeVisible();
  await expect(page.locator("#drop-count")).toHaveText("0 / 3 drops · 0.00 mL");
  await expect(page.locator("main").getByRole("textbox")).toHaveCount(0);
});

test("Spanish stations and the restart dialog fit and pass axe at phone width", async ({page}) => {
  await page.setViewportSize({width: 360, height: 740});
  await openLab(page, "?lang=es");
  const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.evaluate(axe);
  async function audit() {
    const violations = await page.evaluate(async () => (await window.axe.run({runOnly: {type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}})).violations.map((v) => [v.id, v.nodes.map((n) => n.target)]));
    expect(violations).toEqual([]);
  }
  for (const key of ["wax", "shot", "mixing"]) {
    await station(page, key).click();
    await audit();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  }
  await page.locator("#restart-open").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", {name: "¿Empezar de nuevo?"})).toBeVisible();
  await audit();
  await page.keyboard.press("Escape");
  await expect(page.locator("#restart-open")).toBeFocused();
});

test("the chemistry directory opens the lab with the matching language and canonical URL", async ({page}) => {
  for (const [query, lang, title] of [["", "en", "The Molar Mass Trap Lab"], ["?lang=es", "es-MX", "Laboratorio virtual de la trampa de la masa molar"]]) {
    await page.goto("/" + query);
    await page.locator("#labs").getByRole("link", {name: title, exact: true}).click();
    await expect(page).toHaveURL(LAB + query);
    await expect(page.getByRole("heading", {level: 1})).toHaveText(title);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://activities.zornscience.org" + LAB + query);
    await expect(page.locator('link[hreflang="es"]')).toHaveAttribute("href", "https://activities.zornscience.org" + LAB + "?lang=es");
  }
});
