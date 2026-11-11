"use strict";
const {test, expect} = require("@playwright/test");
const model = require("../../natural-selection-lab/model.js");
const base = "/natural-selection-lab/";
const id = name => "#zsa-nsl-" + name;
async function open(page, lang = "en", seed = 1) {
  await page.goto(base + "?lang=" + lang + "&seed=" + seed);
}
async function predict(page, value = 0) {
  await page.locator(id("prediction") + ' input[value="' + value + '"]').check();
}
async function finish(page) {
  await page.locator(id("start")).click();
  await page.locator(id("finish")).click();
}
async function nav(page, index) {
  await page.locator(id("steps") + " button").nth(index).click();
}
async function clipboard(page, blocked = false) {
  await page.addInitScript(blocked => {
    window.__writes = [];
    Object.defineProperty(navigator, "clipboard", {value: {writeText: async text => {
      if (blocked) throw new Error("blocked");
      window.__writes.push(text);
    }}});
  }, blocked);
}
async function assertRows(page, runIndex, expected) {
  const table = page.locator(id("tables") + ' table[data-run="' + (runIndex + 1) + '"]');
  const rows = await table.locator("tbody tr").evaluateAll(rows => rows.map(r => Array.from(r.cells).map(c => Number(c.textContent))));
  expect(rows).toEqual(expected.history.map(r => [r.generation, r.dark, r.light, r.percentDark]));
}
for (const lang of ["en", "es"]) {
  test("natural selection: full guided flow and worksheet export in " + lang, async ({page}) => {
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    await clipboard(page);
    await open(page, lang);
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "es" ? "es-MX" : "en");
    await expect(page.locator(id("start"))).toBeDisabled();
    await expect(page.locator("input:not([type=radio]), textarea, [contenteditable]")).toHaveCount(0);
    await predict(page);
    await page.locator(id("start")).click();
    await expect(page.locator(id("prediction") + " input").first()).toBeDisabled();
    await assertRows(page, 0, model.createRun({}, 1));
    await expect(page.locator(id("graph") + " [data-generation]")).toHaveCount(1);
    await page.locator(id("next")).click();
    await expect(page.locator(id("tables") + " tbody tr")).toHaveCount(2);
    await expect(page.locator(id("graph") + " [data-generation]")).toHaveCount(2);
    await page.locator(id("finish")).click();
    await assertRows(page, 0, model.runTo(model.createRun({}, 1), 15));
    await expect(page.locator(id("next"))).toBeDisabled();
    await page.locator(id("copy")).click();
    let text = await page.evaluate(() => window.__writes.at(-1));
    expect(text).toContain(lang === "es" ? "Generación\tEscarabajos oscuros\tEscarabajos claros\tPorcentaje de oscuros" : "Generation\tDark beetles\tLight beetles\tPercent dark");
    expect(text).toContain("0\t50\t50\t50\n");
    expect(text).toContain(lang === "es" ? "Responde estas preguntas en tu documento\n1A." : "Answer these in your document\n1A.");
    for (const n of ["1A", "1B", "1C"]) expect(text).toContain(n + ".");
    await nav(page, 1);
    await expect(page.locator(id("event"))).toContainText(lang === "es" ? "En la generación 10" : "At generation 10");
    await expect(page.locator('[data-event-generation="10"]')).toHaveCount(1);
    await predict(page, 1); await page.locator(id("start")).click();
    for (let i = 0; i < 10; i++) await page.locator(id("next")).click();
    await expect(page.locator(id("event"))).toContainText(lang === "es" ? "ahora es claro" : "now light");
    await expect(page.locator(id("tables") + " tbody tr")).toHaveCount(11);
    expect(await page.locator(id("graph") + " [data-generation]").evaluateAll(nodes => Math.max(...nodes.map(n => Number(n.dataset.generation))))).toBe(10);
    await page.locator(id("finish")).click();
    await assertRows(page, 0, model.runTo(model.createRun({changeAt: 10}, 1, 2), 30));
    await page.locator(id("copy")).click();
    expect(await page.evaluate(() => window.__writes.at(-1))).toContain("2C.");
    await nav(page, 2); await predict(page);
    const settings = [[100, 0.5], [100, 0], [10, 0.5], [50, 0.5], [200, 0.5], [50, 0.9]];
    for (const [index, [size, startDark]] of settings.entries()) {
      await page.locator(id("size")).selectOption(String(size));
      await page.locator(id("start-dark")).selectOption(String(startDark));
      await page.locator(id("start")).click();
      await expect(page.locator(id("size"))).toBeDisabled();
      await expect(page.locator(id("start-dark"))).toBeDisabled();
      await page.locator(id("finish")).click();
      await assertRows(page, index, model.runTo(model.createRun({size, startDark}, 1, 3, index), 20));
    }
    await expect(page.locator(id("start"))).toBeDisabled();
    await expect(page.locator(id("guide"))).not.toContainText(lang === "es" ? "Pendiente" : "To do");
    await expect(page.locator(id("tables") + " table")).toHaveCount(6);
    await expect(page.locator(id("graph") + " [data-run]")).toHaveCount(6);
    expect(new Set(await page.locator(id("graph") + " .zsa-nsl-curve").evaluateAll(nodes => nodes.map(n => n.getAttribute("stroke-dasharray")))).size).toBe(6);
    await page.locator(id("copy")).click();
    text = await page.evaluate(() => window.__writes.at(-1));
    expect(text.match(/\n\n/g).length).toBe(7);
    expect(text).toContain(lang === "es" ? "Predicción: Las poblaciones pequeñas" : "Prediction: Small populations");
    for (const n of ["3A", "3B", "3C"]) expect(text).toContain(n + ".");
    await nav(page, 3);
    for (const [q, correct] of [0, 1, 2].entries()) {
      const field = page.locator(id("questions") + " fieldset").nth(q);
      await field.locator("input").nth((correct + 1) % 3).check();
      await expect(field.locator('[role="status"]')).toContainText(lang === "es" ? "Inténtalo de nuevo" : "Try again");
      await field.locator("input").nth(correct).check();
      await expect(field.locator('[role="status"]')).toContainText(lang === "es" ? "Correcto." : "Correct.");
    }
    await nav(page, 0);
    await expect(page.locator(id("tables") + " tbody tr")).toHaveCount(16);
    expect(errors).toEqual([]);
  });
}

test("natural selection: keyboard controls, modal Escape and focus return", async ({page}) => {
  await open(page);
  async function tabTo(target) {
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      if (await page.locator(target).evaluate(e => e === document.activeElement)) return;
    }
    throw new Error("Tab did not reach " + target);
  }
  await tabTo(id("instructions-open")); await page.keyboard.press("Enter");
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(id("instructions-open"))).toBeFocused();
  await tabTo(id("prediction") + " input[value='0']"); await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await tabTo(id("start")); await page.keyboard.press("Enter");
  await expect(page.locator(id("next"))).toBeFocused();
  await page.keyboard.press("Space");
  await tabTo(id("finish")); await page.keyboard.press("Enter");
  await expect(page.locator(id("copy"))).toBeFocused();
  await tabTo(id("steps") + " button:nth-child(3)"); await page.keyboard.press("Enter");
  await tabTo(id("prediction") + " input[value='0']"); await page.keyboard.press("Space");
  await tabTo(id("start-dark")); await page.keyboard.press("End");
  await tabTo(id("size")); await page.keyboard.press("Home");
  await tabTo(id("start")); await page.keyboard.press("Enter");
  await tabTo(id("finish")); await page.keyboard.press("Enter");
  await expect(page.locator(id("tables") + " caption")).toContainText("N = 10, start 0% dark");
});

test("natural selection: clipboard denial uses a selected read-only panel, never a text input", async ({page}) => {
  await clipboard(page, true); await open(page);
  await predict(page); await finish(page);
  await page.locator(id("copy")).click();
  await expect(page.locator(id("copy-text"))).toBeVisible();
  const selected = await page.evaluate(() => getSelection().toString());
  expect(selected).toContain("Generation\tDark beetles\tLight beetles\tPercent dark");
  expect(selected).toContain("Answer these in your document\n1A.");
  await expect(page.locator("input:not([type=radio]), textarea, [contenteditable]")).toHaveCount(0);
  await page.locator(id("share-toggle")).click(); await page.locator(id("share-copy")).click();
  expect(await page.evaluate(() => getSelection().toString())).toBe("https://activities.zornscience.org/natural-selection-lab/");
});

test("natural selection: determinism between loads and step/run paths, reload clears work, language reload", async ({page}) => {
  await open(page, "en", 0); await predict(page); await finish(page);
  const first = await page.locator(id("tables")).innerText();
  await page.reload();
  await expect(page.locator(id("tables") + " table")).toHaveCount(0);
  await expect(page.locator(id("prediction") + " input:checked")).toHaveCount(0);
  await predict(page); await page.locator(id("start")).click();
  for (let i = 0; i < 15; i++) await page.locator(id("next")).click();
  expect(await page.locator(id("tables")).innerText()).toBe(first);
  await page.getByRole("link", {name: "ES Español", exact: true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.locator(id("tables") + " table")).toHaveCount(0);
});

test("natural selection: reduced motion and hidden documents preserve deterministic results", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"}); await open(page);
  await predict(page); await page.locator(id("start")).click();
  await page.evaluate(() => { Object.defineProperty(document, "hidden", {value: true}); document.dispatchEvent(new Event("visibilitychange")); });
  await page.locator(id("finish")).click();
  await assertRows(page, 0, model.runTo(model.createRun({}, 1), 15));
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("natural selection: no runtime requests or storage, clean Spanish Share and embed/back links", async ({page}) => {
  const requests = [];
  page.on("request", request => requests.push(request.url()));
  await page.addInitScript(() => {
    for (const key of ["localStorage", "sessionStorage", "indexedDB"]) Object.defineProperty(window, key, {get: () => { throw new Error("Storage forbidden"); }});
  });
  await clipboard(page); await open(page, "es");
  await page.waitForLoadState("networkidle");
  expect(requests.every(url => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  const count = requests.length;
  await predict(page); await finish(page); await page.locator(id("copy")).click();
  await page.locator(id("share-toggle")).click();
  await expect(page.locator(id("share-url"))).toHaveText("https://activities.zornscience.org/natural-selection-lab/?lang=es");
  await page.locator(id("share-copy")).click();
  expect(requests.length).toBe(count);
  await expect(page.locator(id("back"))).toHaveAttribute("href", "https://zornscience.org/es/science/biology/unit-4-evolution-and-natural-selection/natural-selection/");
  await page.goto(base + "?embed=1&from=https://zornscience.org/science/biology/");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect(page.locator(id("back"))).toBeHidden();
  await expect(page.locator(id("back"))).toHaveAttribute("href", "https://zornscience.org/science/biology/");
  for (const from of ["https://zornscience.org.evil.com/", "http://zornscience.org/", "https://name@zornscience.org/"]) {
    await page.goto(base + "?from=" + encodeURIComponent(from));
    await expect(page.locator(id("back"))).toHaveAttribute("href", "https://zornscience.org/science/biology/unit-4-evolution-and-natural-selection/natural-selection/");
  }
});

test("natural selection: 360 px layout and at least 44 px targets in both languages", async ({page}) => {
  await page.setViewportSize({width: 360, height: 740});
  for (const lang of ["en", "es"]) {
    await open(page, lang); await predict(page); await finish(page);
    for (const i of [0, 1, 2, 3]) {
      await nav(page, i);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const small = await page.locator("button:visible, select:visible, label:visible, .zsa-languages a:visible").evaluateAll(nodes => nodes.filter(n => { const r = n.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map(n => n.textContent));
      expect(small).toEqual([]);
    }
    await page.locator(id("share-toggle")).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("natural selection: natural extinction message, graph, tables and copied data", async ({page}) => {
  await clipboard(page); await open(page, "en", 148); await nav(page, 2); await predict(page);
  await page.locator(id("size")).selectOption("10"); await page.locator(id("start-dark")).selectOption("0"); await finish(page);
  await expect(page.locator(id("status"))).toHaveText("No beetles survived, so there is no next generation.");
  await expect(page.locator(id("tables") + " tbody tr")).toHaveCount(5);
  await expect(page.locator(id("graph") + " [data-generation]")).toHaveCount(5);
  await expect(page.locator(id("next"))).toBeDisabled();
  await page.locator(id("copy")).click();
  expect(await page.evaluate(() => window.__writes.at(-1))).toContain("No beetles survived, so there is no next generation.");
  await expect(page.locator(id("start"))).toBeEnabled();
});
