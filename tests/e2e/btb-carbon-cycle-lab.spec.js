"use strict";
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const URL = "/btb-carbon-cycle-lab/?seed=42";
const $ = (page, id) => page.locator("#zsa-bt-" + id);
async function audit(page) {
  await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
  const violations = await page.evaluate(async () => (await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}})).violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target.join(" ")).slice(0, 3)})));
  expect(violations).toEqual([]);
}
async function blowGreen(page, n = 7) { for (let i = 0; i < n; i++) await $(page, "blow").click(); }
async function toPredict(page) { await blowGreen(page); await $(page, "next").click(); await $(page, "next").click(); }
async function predictAndStart(page, colors = ["blue", "yellow", "green"]) {
  for (let i = 0; i < 3; i++) await $(page, "predict-" + i).selectOption(colors[i]);
  await $(page, "start").click();
}
test.beforeEach(async ({page}) => {
  const errors = [], requests = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1") && !r.url().startsWith("data:")) requests.push(r.url()); });
  page.__errors = errors; page.__requests = requests;
});
test.afterEach(async ({page}) => {
  expect(page.__errors).toEqual([]);
  expect(page.__requests).toEqual([]);
});
test("btb: the guided path gives blue, yellow and green with matching predictions", async ({page}) => {
  await page.goto(URL);
  await expect(page.locator("h1")).toHaveText("BTB Carbon Cycle Lab");
  await expect($(page, "next")).toBeDisabled();
  await blowGreen(page);
  await expect(page.locator(".zsa-bt-note").first()).toContainText("green");
  await $(page, "next").click();
  await expect($(page, "step-title")).toHaveText("2. Set up three tubes");
  await expect(page.getByText("Your setup is a fair test.")).toBeVisible();
  await $(page, "next").click();
  await expect($(page, "next")).toBeDisabled();
  await $(page, "start").click();
  await expect($(page, "status")).toContainText("Choose a color");
  await predictAndStart(page);
  await expect($(page, "step-title")).toHaveText("4. Watch 24 hours");
  await $(page, "jump").click();
  const rows = page.locator("#zsa-bt-table tbody tr");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("Blue");
  await expect(rows.nth(1)).toContainText("Yellow");
  await expect(rows.nth(2)).toContainText("Green");
  await expect(rows.nth(0)).toContainText("Matches");
  await expect($(page, "readouts")).toContainText("Tube 2: yellow. CO2: high");
  await audit(page);
});
test("btb: setup mistakes are named, predictions lock, and reset reloads", async ({page}) => {
  await page.goto(URL);
  await blowGreen(page);
  await $(page, "next").click();
  await $(page, "spinach-2").selectOption("1");
  await expect(page.getByText("No tube without spinach")).toBeVisible();
  await $(page, "cap-0").selectOption("0");
  await expect(page.getByText("A tube is open")).toBeVisible();
  await $(page, "next").click();
  await predictAndStart(page, ["yellow", "blue", "green"]);
  await $(page, "prev").click();
  await expect($(page, "start")).toBeDisabled();
  await expect($(page, "predict-0")).toBeDisabled();
  await expect(page.locator(".zsa-bt-note", {hasText: "Predictions are locked."})).toBeVisible();
  await $(page, "next").click();
  await $(page, "jump").click();
  await expect(page.getByText("Did not match").first()).toBeVisible();
  await $(page, "reset").click();
  await expect($(page, "step-title")).toHaveText("1. Prepare the indicator");
  await expect($(page, "blow")).toBeEnabled();
});
test("btb: a yellow start is allowed and explained", async ({page}) => {
  await page.goto(URL);
  await blowGreen(page, 16);
  await expect(page.locator(".zsa-bt-note").first()).toContainText("lot of CO2");
  await $(page, "fresh").click();
  await expect(page.locator(".zsa-bt-note").first()).toContainText("very little CO2");
  await blowGreen(page, 16);
  await $(page, "next").click();
  await $(page, "next").click();
  await predictAndStart(page, ["blue", "yellow", "green"]);
  await $(page, "jump").click();
  await expect(page.getByText("started yellow-green")).toBeVisible();
});
test("btb: time slider, pattern aid, play and keyboard", async ({page}) => {
  await page.goto(URL);
  await toPredict(page);
  await predictAndStart(page);
  await expect($(page, "clock")).toHaveText("Hour 0");
  await $(page, "time").focus();
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowRight");
  await expect($(page, "clock")).toHaveText("Hour 4");
  await expect($(page, "time")).toHaveAttribute("aria-valuetext", "Hour 4");
  await $(page, "pattern").check();
  await expect(page.locator('#zsa-bt-scene [fill^="url(#zsa-bt-pat-"]').first()).toBeVisible();
  await $(page, "pattern").uncheck();
  await $(page, "play").click();
  await expect($(page, "play")).toHaveText("Pause");
  await $(page, "play").click();
  await expect($(page, "play")).toHaveText("Play");
  await $(page, "jump").click();
  await $(page, "next").click();
  await expect($(page, "step-title")).toHaveText("5. Check your understanding");
  await audit(page);
});
test("btb: the four checking questions give immediate feedback", async ({page}) => {
  await page.goto(URL);
  await toPredict(page);
  await predictAndStart(page);
  await $(page, "next").click();
  const sets = page.locator(".zsa-bt-panel:not([hidden]) fieldset");
  await expect(sets).toHaveCount(4);
  await sets.nth(2).locator("label", {hasText: "Photosynthesis used more CO2"}).click();
  await expect(sets.nth(2).locator(".zsa-bt-feedback")).toContainText("Correct.");
  await sets.nth(3).locator("label", {hasText: "Dissolved oxygen"}).click();
  await expect(sets.nth(3).locator(".zsa-bt-feedback")).toContainText("Not quite.");
});
test("btb es: Spanish on every step and the language reloads", async ({page}) => {
  await page.goto(URL + "&lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.locator("h1")).toContainText("azul de bromotimol");
  await toPredict(page);
  await expect($(page, "step-title")).toHaveText("3. Predecir");
  await predictAndStart(page);
  await $(page, "jump").click();
  await expect($(page, "readouts")).toContainText("Tubo 2: amarillo. CO2: alto");
  await expect(page.locator("#zsa-bt-table")).toContainText("Coincide");
  await audit(page);
});
test("btb: clean share link, safe lesson link and embed", async ({page}) => {
  await page.goto(URL);
  await expect($(page, "back")).toHaveAttribute("href", /^https:\/\/zornscience\.org\//);
  await page.locator("#zsa-th-share-toggle").click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/btb-carbon-cycle-lab/");
  await page.goto(URL + "&embed=1&lang=es");
  for (const node of await page.locator("[data-zsa-chrome]").all()) await expect(node).toBeHidden();
  for (const a of await page.locator("main a").all()) await expect(a).toHaveAttribute("target", "_top");
  expect(await $(page, "back").getAttribute("href")).toContain("https://zornscience.org/es/science/biology/");
  for (const value of ["https://evil.example/a", "http://zornscience.org/a", "https://user@zornscience.org/a", "javascript:alert(1)"]) {
    await page.goto(URL + "&from=" + encodeURIComponent(value));
    await expect($(page, "back")).toHaveAttribute("href", "https://zornscience.org/science/biology/unit-8-photosynthesis-and-respiration/rates-of-photosynthesis/");
  }
});
test("btb: layout has no sideways scroll from 320 to 1920 px on every step", async ({page}) => {
  for (const lang of ["", "&lang=es"]) {
    for (const width of [320, 390, 768, 1366, 1920]) {
      await page.setViewportSize({width, height: 800});
      await page.goto(URL + lang);
      await blowGreen(page);
      const check = async label => {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, width + " px " + lang + " " + label).toBeLessThanOrEqual(0);
      };
      await check("step 1");
      await $(page, "next").click(); await check("step 2");
      await $(page, "next").click(); await check("step 3");
      await predictAndStart(page); await check("step 4 start");
      await $(page, "jump").click(); await check("step 4 end");
      await $(page, "next").click(); await check("step 5");
    }
  }
});
