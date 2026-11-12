"use strict";
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const model = require("../../population-sampling-lab/model.js");
const data = require("../../population-sampling-lab/data.js");
const $ = (page, id) => page.locator("#zsa-ps-" + id);
const mode = (page, key) => page.locator('[data-ps-mode="' + key + '"]').click();
const cell = (page, index) => page.locator('[data-cell="' + index + '"]');
async function open(page, lang = "en", seed = 1) { await page.goto("/population-sampling-lab/?seed=" + seed + "&lang=" + lang); }
async function guess(page, id, value) { await $(page, id).fill(String(value)); await $(page, "reveal").click(); }
async function catchTrial(page) {
  const text = await $(page, "net").textContent();
  if (/Next|Siguiente/.test(text)) await $(page, "net").click();
  for (let i = 0; i < 3; i++) await $(page, "net").click();
}
async function audit(page) {
  await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
  const issues = await page.evaluate(async () => (await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}})).violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)})));
  expect(issues).toEqual([]);
}
test.beforeEach(async ({page}) => {
  page.__samplingErrors = [];
  page.on("pageerror", e => page.__samplingErrors.push(e.message));
  page.on("console", message => { if (["warning", "error"].includes(message.type())) page.__samplingErrors.push(message.text()); });
  await page.addInitScript(() => {
    window.__samplingMissing = []; window.__samplingCopies = [];
    document.addEventListener("securitypolicyviolation", e => window.__samplingMissing.push("CSP: " + e.violatedDirective));
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async text => { window.__samplingCopies.push(text); }, readText: () => { throw new Error("Clipboard read"); }}});
    for (const method of ["getItem", "setItem", "removeItem", "clear"]) Storage.prototype[method] = () => { throw new Error("Storage used"); };
  });
  await page.route("**/shared/zsa-i18n.js*", route => {
    const source = fs.readFileSync(require.resolve("../../shared/zsa-i18n.js"), "utf8");
    const instrument = `strings = copy.es || {};
      const originalText = api.text;
      api.text = function(text, values) {
        if (/[A-Za-z]{2}/.test(text) && !Object.hasOwn(strings, text) && !/^(ZornScience|About this activity|Related lessons|Estimate hidden meadow and pond populations|Population Sampling$|Biology$)/.test(text)) window.__samplingMissing.push(text);
        return originalText(text, values);
      };`;
    return route.fulfill({contentType: "text/javascript", body: source.replace("strings = copy.es || {};", instrument)});
  });
});
test.afterEach(async ({page}) => {
  expect(page.__samplingErrors).toEqual([]);
  expect(await page.evaluate(() => window.__samplingMissing || [])).toEqual([]);
});

for (const lang of ["en", "es"]) {
  const t = value => lang === "es" ? data.es[value] || value : value;
  test("population sampling " + lang + ": both full 3, 10, 20 quadrat series and worksheet export", async ({page}) => {
    await open(page, lang);
    await expect(page).toHaveTitle(t("Population Sampling Lab") + " | ZornScience");
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "es" ? "es-MX" : "en");
    const field = model.meadow(1);
    await expect($(page, "work")).not.toContainText(t("The real total is") + " " + field.total);
    expect(await page.locator('[data-cell] svg path').count()).toBe(0);
    for (const method of ["chosen", "random"]) {
      await $(page, "method").selectOption(method);
      const used = [];
      for (const target of [3, 10, 20]) {
        while (used.length < target) {
          const index = method === "chosen" ? used.length : model.randomQuadrat(1, used, used.length);
          if (method === "chosen") await cell(page, index).click(); else await $(page, "random").click();
          used.push(index);
        }
        const rows = $(page, "work").locator("table").first().locator("tbody tr");
        await expect(rows).toHaveCount(target);
        const last = rows.last();
        await expect(last).toContainText(t(method === "chosen" ? "I choose" : "Random"));
        await expect(last.locator("td").last()).toHaveText(String(field.counts[used[used.length - 1]]));
        const estimate = Math.round(model.quadratEstimate(used.map(i => field.counts[i])));
        await guess(page, "estimate", estimate);
        await expect($(page, "quad-result")).toContainText(String(field.total));
        await expect($(page, "quad-result")).toContainText(model.percentError(estimate, field.total) + "%");
        if (target < 20) await $(page, "next-size").click();
      }
    }
    await expect($(page, "work").locator("table").last().locator("tbody tr")).toHaveCount(6);
    await expect($(page, "work").locator("table").last().locator("tbody tr").first()).toContainText(String(field.total));
    await page.setViewportSize({width: 360, height: 780});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await audit(page);
  });

  test("population sampling " + lang + ": ten guided recapture trials, reveal gates and exact tables", async ({page}) => {
    await open(page, lang); await mode(page, "recapture");
    for (const [series, size] of [["small", 20], ["large", 40]]) {
      await $(page, "series").selectOption(series);
      for (let trial = 0; trial < 5; trial++) {
        await catchTrial(page);
        const r = model.capture(1, {M: size, C: size, trial});
        const row = $(page, "work").locator("table").first().locator("tbody tr").last();
        expect(await row.locator("td").allTextContents()).toEqual([String(trial + 1), String(size), String(size), String(r.R), String(r.estimate === null ? t("No estimate") : r.estimate), t("Hidden")]);
        await expect(page.locator(".zsa-ps-plot").first().locator("line")).toHaveCount(0);
      }
      await guess(page, "best", 300);
      await expect($(page, "true-result")).toContainText(String(model.pond(1)));
      await expect(page.locator(".zsa-ps-plot").first().locator("line")).toHaveCount(1);
      await expect($(page, "net")).toBeDisabled();
      const r = model.capture(1, {M: size, C: size});
      await expect($(page, "work").locator("table").first().locator("tbody tr").first().locator("td").last()).toHaveText(model.percentError(r.estimate, model.pond(1)) + "%");
    }
    await expect($(page, "work")).toContainText(t("Small catches (20 fish)"));
    await expect($(page, "work")).toContainText(t("Large catches (40 fish)"));
    await audit(page);
  });

  test("population sampling " + lang + ": both problems off and on with predictions and five trials each", async ({page}) => {
    await open(page, lang); await mode(page, "problems");
    for (const problem of ["wear", "avoid"]) {
      await $(page, "problem").selectOption(problem);
      for (const setting of ["off", "on"]) {
        await $(page, "setting").selectOption(setting);
        await expect($(page, "net")).toBeDisabled();
        await page.locator('input[name="prediction"][value="higher"]').check();
        for (let trial = 0; trial < 5; trial++) {
          await catchTrial(page);
          const r = model.capture(1, {M: 30, C: 30, trial, condition: setting === "on" ? problem : "off", stream: 100});
          await expect($(page, "pond-result")).toContainText(r.R === 0 ? t("You tagged {M} fish. Your second catch had {C} fish, but none were tagged, so there is no estimate.").replace("{M}", "30").replace("{C}", "30") : (lang === "es" ? r.R + " estaban etiquetados" : r.R + " were tagged"));
        }
        await expect(page.locator('input[name="prediction"]').first()).toBeDisabled();
        await guess(page, "best", 300);
      }
    }
    for (const key of ["wear-off", "wear-on", "avoid-off", "avoid-on"]) await expect($(page, "work")).toContainText(t(data.content.series[key]));
    await audit(page);
  });

  test("population sampling " + lang + ": keyboard-only quadrats, duplicate protection and Instructions focus", async ({page}) => {
    await open(page, lang);
    await cell(page, 0).focus(); await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect($(page, "work").locator("table").first().locator("tbody tr")).toHaveCount(1);
    await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
    await expect($(page, "work").locator("table").first().locator("tbody tr")).toHaveCount(3);
    expect(await $(page, "work").locator("table").first().locator("tbody tr td:nth-child(2)").allTextContents()).toEqual(["A1", "A2", "B2"]);
    await expect($(page, "estimate")).toBeFocused(); await $(page, "estimate").fill("600"); await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
    await expect($(page, "estimate")).toHaveValue("610");
    await $(page, "instructions-open").focus(); await page.keyboard.press("Enter");
    await expect(page.locator("dialog")).toBeVisible();
    for (let i = 0; i < 5; i++) { await page.keyboard.press("Tab"); expect(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest("dialog"))).toBe(true); }
    await page.keyboard.press("Escape"); await expect($(page, "instructions-open")).toBeFocused();
    await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
    await expect($(page, "share-panel")).toBeVisible();
    await $(page, "instructions-open").focus(); await page.keyboard.press("Enter");
    await expect($(page, "share-panel")).toBeHidden();
    await page.keyboard.press("Escape"); await expect(page.locator("dialog")).toBeHidden();
    await expect($(page, "instructions-open")).toBeFocused();
    await audit(page);
  });
}

test("population sampling: Share copies a clean link and falls back to selected text", async ({page}) => {
  await open(page);
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("Blocked"); }; });
  await expect(page.locator('textarea,input[type=text],[contenteditable]')).toHaveCount(0);
  await $(page, "share-open").click(); await $(page, "share-copy").click();
  expect(await page.evaluate(() => getSelection().toString())).toBe("https://activities.zornscience.org/population-sampling-lab/");
});

test("population sampling: reload and language reload clear work, same seed repeats and Share is clean", async ({page}) => {
  await open(page, "en", 0); await $(page, "method").selectOption("random");
  for (let i = 0; i < 3; i++) await $(page, "random").click();
  const first = await $(page, "work").locator("table").first().innerText();
  await guess(page, "estimate", 600);
  await page.reload();
  await expect($(page, "work").locator("table").first().locator("tbody tr")).toHaveCount(0);
  await $(page, "method").selectOption("random"); for (let i = 0; i < 3; i++) await $(page, "random").click();
  expect(await $(page, "work").locator("table").first().innerText()).toBe(first);
  await page.getByRole("link", {name: "ES Español", exact: true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect($(page, "work").locator("table").first().locator("tbody tr")).toHaveCount(0);
  await $(page, "share-open").click();
  await expect($(page, "share-link")).toHaveAttribute("href", "https://activities.zornscience.org/population-sampling-lab/?lang=es");
  await $(page, "share-copy").click(); expect(await page.evaluate(() => window.__samplingCopies)).toEqual(["https://activities.zornscience.org/population-sampling-lab/?lang=es"]);
  await page.keyboard.press("Escape"); await expect($(page, "share-open")).toBeFocused();
});

test("population sampling: R zero is recorded, next trial is fresh, each series caps at eight", async ({page}) => {
  await open(page, "en", 0); await mode(page, "recapture");
  for (let trial = 0; trial < 8; trial++) {
    await catchTrial(page);
    const r = model.capture(0, {trial});
    if (r.R === 0) await expect($(page, "work")).toContainText("This happens by chance. You cannot divide by zero, so just run another trial.");
  }
  await expect($(page, "work").locator("table").first().locator("tbody tr")).toHaveCount(8);
  await expect($(page, "net")).toBeDisabled();
  await guess(page, "best", 250);
  await $(page, "series").selectOption("large"); await expect($(page, "net")).toBeEnabled();
  await expect($(page, "work").locator("table").first().locator("tbody tr")).toHaveCount(0);
});

test("population sampling: no runtime network, no writing fields, reduced motion, seed parity and embed", async ({page, context}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  const requests = []; page.on("request", req => requests.push({url: req.url(), type: req.resourceType()}));
  await open(page);
  await cell(page, 0).click(); await mode(page, "recapture"); await catchTrial(page);
  const record = await $(page, "work").locator("table").first().innerText();
  const second = await context.newPage(); await open(second); await mode(second, "recapture"); await catchTrial(second);
  expect(await $(second, "work").locator("table").first().innerText()).toBe(record); await second.close();
  expect(requests.every(r => r.url.startsWith("http://127.0.0.1:4173/") && !["fetch", "xhr", "websocket", "eventsource"].includes(r.type))).toBe(true);
  await expect(page.locator('textarea,input[type=text],[contenteditable]')).toHaveCount(0);
  expect(await page.locator("input[type=number]").count()).toBeLessThanOrEqual(1);
  await page.goto("/population-sampling-lab/?embed=1&seed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect($(page, "back")).toBeHidden(); await expect(page.locator("[data-zsa-about]")).toBeHidden();
});

test("population sampling: phone layout, 44px placement targets and exact clean lesson handling", async ({page}) => {
  await page.setViewportSize({width: 360, height: 780}); await open(page, "es");
  for (const key of ["quadrat", "recapture", "problems"]) {
    await mode(page, key);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const small = await page.locator("button:visible,select:visible,input[type=number]:visible").evaluateAll(nodes => nodes.map(n => ({name: n.textContent, width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height})).filter(n => n.width < 44 || n.height < 44));
    expect(small).toEqual([]);
  }
  await expect($(page, "back")).toHaveAttribute("href", "https://zornscience.org/es/science/biology/unit-2-populations/population-sampling/");
  for (const from of ["https://example.com/", "javascript:alert(1)", "https://zornscience.org.evil.test/", "https://user@zornscience.org/"]) {
    await page.goto("/population-sampling-lab/?from=" + encodeURIComponent(from));
    await expect($(page, "back")).toHaveAttribute("href", "https://zornscience.org/science/biology/unit-2-populations/population-sampling/");
  }
  await page.goto("/population-sampling-lab/?from=" + encodeURIComponent("https://zornscience.org/science/biology/"));
  await expect($(page, "back")).toHaveAttribute("href", "https://zornscience.org/science/biology/");
});
