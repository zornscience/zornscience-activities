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
  await expect(page.locator("#zsa-bt-setup li")).toHaveCount(3);
  await expect($(page, "spinach-0")).toHaveCount(0);
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
test("btb: setup is fixed, predictions lock, and reset reloads", async ({page}) => {
  await page.goto(URL);
  await blowGreen(page);
  await $(page, "next").click();
  await expect(page.locator(".zsa-bt-panel:not([hidden]) select")).toHaveCount(0);
  await expect($(page, "setup")).toContainText("Tube 2: 2 spinach strips, Wrapped in foil (dark), Capped");
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
test("btb: the 24 hours play by themselves in about 10 seconds and results appear at the end", async ({page}) => {
  await page.goto(URL);
  await toPredict(page);
  await predictAndStart(page);
  await expect($(page, "play")).toHaveText("Pause");
  await expect($(page, "results")).toBeHidden();
  await expect($(page, "clock")).toHaveText(/^Hour \d+(\.\d)?$/);
  const began = Date.now();
  await expect($(page, "clock")).toHaveText("Hour 24", {timeout: 15000});
  const took = Date.now() - began;
  expect(took).toBeGreaterThan(5000);
  expect(took).toBeLessThan(12500);
  await expect($(page, "results")).toBeVisible();
  await expect($(page, "play")).toHaveText("Play");
  await expect(page.locator("#zsa-bt-table tbody tr")).toHaveCount(3);
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
  await $(page, "play").click();
  await $(page, "time").fill("0");
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
test("btb: questions show red and green feedback, a results summary, and a retry of missed ones", async ({page}) => {
  await page.goto(URL);
  await toPredict(page);
  await predictAndStart(page);
  await $(page, "next").click();
  const quiz = page.locator("#zsa-bt-quiz");
  const pick = (text) => quiz.locator("label", {hasText: text});
  await expect(quiz.locator("fieldset")).toHaveCount(1);
  await expect(quiz).toContainText("Question 1 of 4");
  await pick("The foil released an acid.").click();
  await expect(pick("The foil released an acid.")).toHaveClass(/is-wrong/);
  await expect(pick("The spinach respired and added CO2")).toHaveClass(/is-correct/);
  await expect(quiz.locator(".zsa-bt-callout")).toContainText("Not quite.");
  await expect(quiz.locator(".zsa-bt-callout")).toContainText("the spinach kept respiring");
  await expect(quiz.locator("input").first()).toBeDisabled();
  await expect($(page, "callout-title")).toBeFocused();
  await $(page, "next-question").click();
  await expect(quiz).toContainText("Question 2 of 4");
  await pick("It shows what happens to the BTB with no plant").click();
  await expect(quiz.locator(".zsa-bt-callout")).toContainText("Correct!");
  await $(page, "next-question").click();
  await pick("Photosynthesis used more CO2").click();
  await $(page, "next-question").click();
  await expect(quiz).toContainText("Question 4 of 4");
  await pick("Dissolved oxygen").click();
  await expect($(page, "next-question")).toHaveText("See results");
  await $(page, "next-question").click();
  await expect($(page, "summary")).toContainText("You got 2 of 4 correct.");
  await expect($(page, "summary").locator("li")).toHaveCount(2);
  await page.waitForTimeout(500);
  await audit(page);
  await $(page, "retry").click();
  await expect(quiz).toContainText("Question 1 of 2");
  await pick("The spinach respired and added CO2").click();
  await $(page, "next-question").click();
  await pick("Changes in CO2, through acidity").click();
  await $(page, "next-question").click();
  await expect($(page, "summary")).toContainText("You got 4 of 4 correct.");
  await expect($(page, "summary")).toContainText("On your first try: 2 of 4.");
  await expect($(page, "retry")).toHaveCount(0);
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
  await expect(page.locator(".zsa-bt-key").first()).toContainText("Clave de colores del AZB");
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
