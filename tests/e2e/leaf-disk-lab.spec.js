"use strict";
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");
const model = require("../../leaf-disk-lab/model.js");
const URL = "/leaf-disk-lab/?seed=42";
const $ = (page, id) => page.locator("#zsa-ld-" + id);
async function mode(page, key) { await page.locator('[data-ld-mode="' + key + '"]').click(); }
async function run(page) { await $(page, "run").click(); await $(page, "skip").click(); }
async function audit(page) {
  await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
  const violations = await page.evaluate(async () => (await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}})).violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)})));
  expect(violations).toEqual([]);
}
test.beforeEach(async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__leafMissing = [];
    document.addEventListener("securitypolicyviolation", e => window.__leafMissing.push("CSP: " + e.violatedDirective));
  });
  // Observe missing dictionary entries while exercising static text and dynamic states.
  await page.route("**/shared/zsa-i18n.js*", route => {
    const source = fs.readFileSync(path.join(ROOT, "shared/zsa-i18n.js"), "utf8");
    const instrument = `strings = copy.es || {};
    var originalText = api.text;
    api.text = function(text, values) {
      if (/[A-Za-z]{2}/.test(text) && !Object.hasOwn(strings, text) &&
          !/^(ZornScience|About this activity|Related lessons|Measure photosynthesis with|Rates of Photosynthesis|Biology)/.test(text)) window.__leafMissing.push(text);
      return originalText(text, values);
    };`;
    return route.fulfill({contentType: "text/javascript", body: source.replace("strings = copy.es || {};", instrument)});
  });
  page.__leafErrors = errors;
});
test.afterEach(async ({page}) => {
  expect(page.__leafErrors).toEqual([]);
  expect(await page.evaluate(() => window.__leafMissing || [])).toEqual([]);
});

for (const lang of ["en", "es"]) {
  test("leaf-disk-lab " + lang + ": every guided condition, prediction and graph", async ({page}) => {
    await page.emulateMedia({reducedMotion: "reduce"});
    await page.goto(URL + "&lang=" + lang);
    for (let step = 0; step < 3; step++) await $(page, "preparation").locator("button").click();
    await run(page);
    await expect($(page, "table").locator("tbody tr")).toHaveCount(1);
    const reference = model.trial({}, 42).fiveTime.toFixed(1);
    await expect($(page, "result")).toContainText(reference);
    for (const [key, values] of [["why", ["0", "1"]], ["color", ["red", "blue", "green", "white", "dark"]], ["distance", ["10", "20", "30", "40", "dark"]], ["temperature", ["5", "15", "25", "35", "45"]]]) {
      await mode(page, key);
      await expect($(page, "run")).toBeDisabled();
      await $(page, "prediction").locator("input").first().check();
      for (const value of values) {
        await $(page, "condition").selectOption(value); await run(page);
        await expect($(page, "prediction").locator("input").first()).toBeDisabled();
      }
      await expect($(page, "table").locator("tbody tr")).toHaveCount(values.length);
      await expect($(page, "result")).toContainText(lang === "es" ? "más rápida observada" : "Fastest observed");
      const last = $(page, "table").locator("tbody tr").last();
      if (key !== "why") await expect(last).toContainText(lang === "es" ? "ninguno a los 45 min" : "none by 45 min");
      expect(await $(page, "line").locator("svg > title").textContent()).toBe(lang === "es" ? "Discos que flotan contra minutos" : "Disks floating versus minutes");
      await expect($(page, "curve-table").locator("tbody tr")).toHaveCount(46);
    }
    await $(page, "answer-0").fill("<script>Mi afirmación</script>");
    await mode(page, "color"); await $(page, "answer-0").fill("Luz blanca");
    await mode(page, "temperature"); await expect($(page, "answer-0")).toHaveValue("<script>Mi afirmación</script>");
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({width, height: 900});
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await audit(page);
    await page.locator("#zsa-th-share-toggle").click();
    await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/leaf-disk-lab/" + (lang === "es" ? "?lang=es" : ""));
    await page.keyboard.press("Escape");
    await page.locator("#zsa-th-instructions-open").click(); await page.keyboard.press("Escape");
  });

  test("leaf-disk-lab " + lang + ": custom settings and exactly eight trials", async ({page}) => {
    await page.goto(URL + "&lang=" + lang); await mode(page, "own");
    await $(page, "color").selectOption("blue"); await $(page, "distance").selectOption("30");
    await $(page, "controls").locator("button").click();
    await $(page, "temperature").selectOption("35"); await $(page, "bicarbonate").selectOption("0.5");
    for (let i = 0; i < 8; i++) await run(page);
    await expect($(page, "run")).toBeDisabled();
    await expect($(page, "table").locator("tbody tr")).toHaveCount(8);
    await expect($(page, "table")).toContainText("30 cm, 35 °C");
    await expect($(page, "table")).toContainText("0.5%");
    await audit(page);
  });

  test("leaf-disk-lab " + lang + ": all three questions give immediate feedback", async ({page}) => {
    await page.goto(URL + "&lang=" + lang); await mode(page, "check");
    for (let i = 0; i < 3; i++) {
      const inputs = $(page, "check").locator("input");
      await inputs.nth((i + 1) % 3).check();
      await expect($(page, "check").locator("[role=status]")).toContainText(lang === "es" ? "Inténtalo" : "Try again");
      await inputs.nth(i).check();
      await expect($(page, "check").locator("[role=status]")).toContainText(lang === "es" ? "Correcto" : "Correct");
      await audit(page);
      await $(page, "check").locator("button").click();
    }
    await expect(page.locator('[data-ld-mode="color"]')).toHaveAttribute("aria-pressed", "true");
  });
}

test("leaf-disk-lab: playback speed, pause and skip preserve the same seeded result", async ({page}) => {
  await page.clock.install(); await page.goto(URL); await mode(page, "own");
  await $(page, "run").click(); await page.clock.fastForward(60000);
  await expect($(page, "clock")).toContainText("1.0 min");
  await $(page, "pause").click(); const before = await $(page, "clock").textContent();
  await page.clock.fastForward(120000); await expect($(page, "clock")).toHaveText(before);
  await $(page, "speed").selectOption("5"); await $(page, "pause").click(); await page.clock.fastForward(60000);
  await expect($(page, "clock")).toContainText("6.0 min");
  await $(page, "skip").click(); await run(page);
  const rows = $(page, "table").locator("tbody tr");
  expect(await rows.nth(0).locator("td").last().textContent()).toBe(await rows.nth(1).locator("td").last().textContent());
});

test("leaf-disk-lab: switching steps cancels preparation and unfinished runs", async ({page}) => {
  await page.goto(URL); await $(page, "preparation").locator("button").click();
  await mode(page, "own"); await $(page, "run").click();
  await mode(page, "color"); await mode(page, "own");
  await expect($(page, "table").locator("tbody tr")).toHaveCount(0);
  await expect($(page, "run")).toBeEnabled();
  await mode(page, "meet"); await expect($(page, "preparation").locator("button")).toHaveText("Remove the air");
});

test("leaf-disk-lab: copies all investigations and answers only on request", async ({page}) => {
  await page.addInitScript(() => {
    window.__leafWrites = [];
    Object.defineProperty(navigator, "clipboard", {value: {writeText: async text => { window.__leafWrites.push(text); }}});
  });
  await page.goto(URL); await mode(page, "own"); await run(page); await $(page, "answer-0").fill("My claim");
  await mode(page, "color"); await $(page, "prediction").locator("input").first().check(); await run(page);
  await $(page, "answer-1").fill("Five floated at 7 min");
  expect(await page.evaluate(() => window.__leafWrites)).toEqual([]);
  await page.getByRole("button", {name: "Copy my answers", exact: true}).click();
  const writes = await page.evaluate(() => window.__leafWrites);
  expect(writes).toHaveLength(1);
  expect(writes[0]).toContain("My claim"); expect(writes[0]).toContain("Five floated at 7 min");
  expect(writes[0]).toContain("Design your own test"); expect(writes[0]).toContain("1. Light color");
  expect(writes[0]).toContain("Minutes until 5 of 10 disks float");
});

test("leaf-disk-lab: blocked clipboard has a translated selectable fallback", async ({page}) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {value: {writeText: async () => { throw new Error("blocked"); }}}));
  await page.goto(URL + "&lang=es"); await $(page, "answer-0").fill("Mi afirmación");
  await page.getByRole("button", {name: "Copiar mis respuestas", exact: true}).click();
  await expect($(page, "copy-text")).toBeFocused();
  await expect($(page, "copy-text")).toHaveValue(/Mi afirmación/);
  expect(await $(page, "copy-text").evaluate(n => n.selectionStart === 0 && n.selectionEnd === n.value.length)).toBe(true);
  await expect($(page, "writing")).toContainText("No se permite copiar");
  await audit(page);
});

test("leaf-disk-lab: language links reload and clear answers", async ({page}) => {
  await page.goto(URL); await $(page, "answer-0").fill("Not persisted");
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect($(page, "answer-0")).toHaveValue("");
  await expect(page).toHaveTitle("Laboratorio de discos de hoja | ZornScience");
});

test("leaf-disk-lab: safe lesson links, clean sharing, embed and local versioned assets", async ({page}) => {
  const requests = []; page.on("request", request => requests.push(request.url()));
  await page.goto(URL + "&embed=1&lang=es");
  for (const node of await page.locator("[data-zsa-chrome]").all()) await expect(node).toBeHidden();
  for (const a of await page.locator("main a").all()) await expect(a).toHaveAttribute("target", "_top");
  expect(await $(page, "back").getAttribute("href")).toContain("https://zornscience.org/es/science/biology/");
  expect(requests.every(url => url.startsWith("http://127.0.0.1:"))).toBe(true);
  requests.filter(url => /\.(js|css|png)\?/.test(url)).forEach(url => expect(url).toMatch(/\?v=1\.0\.0$/));
  for (const value of ["https://evil.example/a", "http://zornscience.org/a", "https://zornscience.org.evil.example/a", "https://user@zornscience.org/a", "https://zornscience.org:444/a", "javascript:alert(1)"]) {
    await page.goto(URL + "&from=" + encodeURIComponent(value));
    await expect($(page, "back")).toHaveAttribute("href", "https://zornscience.org/science/biology/unit-8-photosynthesis-and-respiration/rates-of-photosynthesis/");
  }
  await page.goto(URL + "&from=" + encodeURIComponent("https://zornscience.org/science/biology/"));
  await expect($(page, "back")).toHaveAttribute("href", "https://zornscience.org/science/biology/");
});

test("leaf-disk-lab: layout at 320, 390 and 1366 px in every step and language", async ({page}) => {
  for (const lang of ["en", "es"]) {
    await page.goto(URL + "&lang=" + lang);
    for (const key of ["meet", "why", "color", "distance", "temperature", "own", "check"]) {
      await mode(page, key);
      if (key === "own") await $(page, "controls").locator("button").click();
      for (const width of [320, 390, 1366]) {
        await page.setViewportSize({width, height: 900});
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  }
});
