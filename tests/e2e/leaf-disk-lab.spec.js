"use strict";
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");
const model = require("../../leaf-disk-lab/model.js");
const URL = "/leaf-disk-lab/?seed=42";
const $ = (page, id) => page.locator("#zsa-ld-" + id);
async function mode(page, key) { await $(page, "investigation").selectOption(key); }
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
      await $(page, "prediction").locator("select").selectOption({index: 1});
      for (const value of values) {
        await $(page, "condition").selectOption(value); await run(page);
        await expect($(page, "prediction").locator("select")).toBeDisabled();
        if (key === "temperature" && ["5", "45"].includes(value)) {
          await expect($(page, "result")).toContainText(lang === "es" ?
            "El frío frena demasiado la fotosíntesis a 5 °C y el calor la detiene a 45 °C, así que la respiración consume más oxígeno del que se produce y no se acumula oxígeno." :
            "Cold slows photosynthesis too much at 5 °C and heat stops it at 45 °C, so respiration uses more oxygen than photosynthesis makes and oxygen cannot build up.");
        }
      }
      await expect($(page, "table").locator("tbody tr")).toHaveCount(values.length);
      await expect($(page, "result")).toContainText(lang === "es" ? "más rápida observada" : "Fastest observed");
      const last = $(page, "table").locator("tbody tr").last();
      if (key !== "why") await expect(last).toContainText(lang === "es" ? "ninguno a los 45 min" : "none by 45 min");
      expect(await $(page, "line").locator("svg > title").textContent()).toBe(lang === "es" ? "Discos que flotan contra minutos" : "Disks floating versus minutes");
      await expect($(page, "curve-table").locator("tbody tr")).toHaveCount(46);
    }
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({width, height: 900});
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await $(page, "graph-details").locator("summary").click();
    await audit(page);
    await page.locator("#zsa-th-share-toggle").click();
    await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/leaf-disk-lab/" + (lang === "es" ? "?lang=es" : ""));
    await page.keyboard.press("Escape");
    await page.locator("#zsa-th-instructions-open").click(); await page.keyboard.press("Escape");
  });

  test("leaf-disk-lab " + lang + ": custom settings and exactly eight trials", async ({page}) => {
    await page.goto(URL + "&lang=" + lang); await mode(page, "own");
    await $(page, "color").selectOption("blue"); await $(page, "distance").selectOption("30");
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
    await expect($(page, "investigation")).toHaveValue("color");
  });
}

test("leaf-disk-lab: playback speed, pause and skip preserve the same seeded result", async ({page}) => {
  // Freeze automatic clock advancement before advancing animation frames explicitly.
  await page.clock.install({time: new Date("2026-01-01T12:00:00Z")}); await page.goto(URL);
  await page.clock.pauseAt(new Date("2026-01-01T12:00:10Z")); await mode(page, "own");
  await expect($(page, "speed")).toHaveValue("15");
  expect(await $(page, "speed").locator("option").evaluateAll(options => options.map(o => o.value))).toEqual(["5", "15", "60"]);
  await $(page, "run").click(); await page.clock.fastForward(60000);
  await expect($(page, "clock")).toContainText("15.0 min");
  await $(page, "pause").click(); const before = await $(page, "clock").textContent();
  await page.clock.fastForward(120000); await expect($(page, "clock")).toHaveText(before);
  await $(page, "speed").selectOption("5"); await $(page, "pause").click(); await page.clock.fastForward(60000);
  await expect($(page, "clock")).toContainText("20.0 min");
  await $(page, "speed").selectOption("60"); await page.clock.fastForward(10000);
  await expect($(page, "clock")).toContainText("30.0 min");
  await $(page, "skip").click();
  for (const [speed, duration] of [["15", 180000], ["5", 540000], ["60", 45000]]) {
    await $(page, "speed").selectOption(speed); await $(page, "run").click();
    await page.clock.fastForward(duration); await page.clock.runFor(50);
    await expect($(page, "clock")).toContainText("45.0 min");
    await expect($(page, "pause")).toBeDisabled();
  }
  const rows = $(page, "table").locator("tbody tr");
  const results = await rows.evaluateAll(trials => trials.map(row => row.querySelector("td:last-child").textContent));
  expect(results).toHaveLength(4);
  expect(new Set(results).size).toBe(1);
  expect(results[0]).toBe(model.trial({}, 42).fiveTime.toFixed(1) + " min");
});

test("leaf-disk-lab: switching steps cancels preparation and unfinished runs", async ({page}) => {
  await page.goto(URL); await $(page, "preparation").locator("button").click();
  await mode(page, "own"); await $(page, "run").click();
  await mode(page, "color"); await mode(page, "own");
  await expect($(page, "table").locator("tbody tr")).toHaveCount(0);
  await expect($(page, "run")).toBeEnabled();
  await mode(page, "meet"); await expect($(page, "preparation").locator("button")).toHaveText("Remove the air");
});

test("leaf-disk-lab: compact navigation, worksheet workflow and resetting only the current investigation", async ({page}) => {
  await page.goto(URL);
  await expect(page.locator("textarea")).toHaveCount(0);
  await expect(page.getByRole("button", {name: "Copy my answers"})).toHaveCount(0);
  await expect($(page, "data-title")).toBeHidden();
  await $(page, "next").click();
  await expect($(page, "investigation")).toHaveValue("why");
  await $(page, "prediction").locator("select").selectOption("1"); await run(page);
  await mode(page, "own"); await run(page);
  await expect($(page, "data-title")).toBeVisible();
  await expect($(page, "line")).toBeHidden();
  await $(page, "graph-details").locator("summary").click();
  await expect($(page, "line")).toBeVisible();
  await page.getByRole("button", {name: "Reset investigation", exact: true}).click();
  await expect($(page, "data-title")).toBeHidden();
  await expect($(page, "progress")).toHaveJSProperty("value", 0);
  await mode(page, "why");
  await expect($(page, "table").locator("tbody tr")).toHaveCount(1);
  await mode(page, "own"); await $(page, "run").click();
  await page.getByRole("button", {name: "Reset investigation", exact: true}).click();
  await expect($(page, "table").locator("tbody tr")).toHaveCount(0);
  await expect($(page, "skip")).toBeDisabled();
  await expect($(page, "run")).toBeEnabled();
  await mode(page, "meet");
  await page.getByRole("button", {name: "Reset investigation", exact: true}).click();
  await expect($(page, "preparation").locator("button")).toHaveText("Remove the air");
});

test("leaf-disk-lab: language links reload and clear trial data", async ({page}) => {
  await page.goto(URL); await mode(page, "own"); await run(page);
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await mode(page, "own");
  await expect($(page, "table").locator("tbody tr")).toHaveCount(0);
  await expect(page.locator("textarea")).toHaveCount(0);
  await expect(page).toHaveTitle("Laboratorio de discos de hoja | ZornScience");
});

test("leaf-disk-lab: safe lesson links, clean sharing, embed and local versioned assets", async ({page}) => {
  const requests = []; page.on("request", request => requests.push(request.url()));
  await page.goto(URL + "&embed=1&lang=es");
  for (const node of await page.locator("[data-zsa-chrome]").all()) await expect(node).toBeHidden();
  for (const a of await page.locator("main a").all()) await expect(a).toHaveAttribute("target", "_top");
  expect(await $(page, "back").getAttribute("href")).toContain("https://zornscience.org/es/science/biology/");
  expect(requests.every(url => url.startsWith("http://127.0.0.1:"))).toBe(true);
  requests.filter(url => /\.(js|css|png)\?/.test(url)).forEach(url => expect(url).toMatch(/\?v=1\.1\.0$/));
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
      for (const width of [320, 390, 1366]) {
        await page.setViewportSize({width, height: 900});
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  }
});
