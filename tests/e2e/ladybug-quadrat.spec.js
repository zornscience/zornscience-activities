"use strict";
const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const {es} = require("../../population-sampling-lab/data.js");
const {cells, drawCell, bugs, specimensIn, cellAt} = require("../../population-sampling-lab/ladybug-model.js");

const path = "/population-sampling-lab/";
const hash = "#ladybug-quadrat";
const publicUrl = "https://activities.zornscience.org" + path;
const lab = (page, id) => page.locator("#zsa-lb-" + id);
const ps = (page, id) => page.locator("#zsa-ps-" + id);
const art = (page, kind) => page.locator('[data-ladybug-scene="' + kind + '"]');
const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function audit(page) {
  await page.evaluate(axe);
  const violations = await page.evaluate(async () => (await window.axe.run({
    runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}
  })).violations.map(({id, nodes}) => [id, nodes.map(node => node.target)]));
  expect(violations).toEqual([]);
}

async function tabTo(page, locator) {
  for (let i = 0; i < 32; i++) {
    if (await locator.evaluate(node => node === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(locator).toBeFocused();
}

async function press(page, locator, key = "Enter") {
  await tabTo(page, locator);
  await page.keyboard.press(key);
}

async function ruler(page, extent, vertical, tick, t) {
  const overview = art(page, "measure");
  const endpoint = art(page, "endpoint");
  await expect(lab(page, "ruler-detail").locator("svg")).toBeVisible();
  const reading = t("The inside edge aligns with {value} cm.").replace("{value}", tick);
  await expect(lab(page, "ruler-detail").locator("..").locator(".zsa-sr-only")).toHaveText(reading);
  const geometry = await overview.evaluate((scene, {vertical, extent}) => {
    const plot = scene.querySelector("[data-plot]");
    const selection = scene.querySelector("[data-selected-cell] rect");
    const dimension = Number((selection || plot).getAttribute(vertical ? "height" : "width"));
    const guidePositions = [...scene.querySelectorAll("[data-edge-guide]")].map(guide => {
      const point = guide.getPointAtLength(0);
      return vertical ? point.y : point.x;
    });
    const tickPositions = [0, 1, extent].map(cm => {
      const point = scene.querySelector('[data-centimeter="' + cm + '"]').getPointAtLength(0);
      return vertical ? point.y : point.x;
    });
    return {dimension, guidePositions, tickPositions};
  }, {vertical, extent});
  expect(geometry).toEqual({dimension: extent, guidePositions: [0, extent], tickPositions: [0, 1, extent]});
  const detail = await endpoint.evaluate((scene, {tick, vertical}) => {
    const mark = scene.querySelector('[data-centimeter="' + tick + '"]').getPointAtLength(0);
    const guide = scene.querySelector('[data-edge-guide="' + tick + '"]').getPointAtLength(0);
    const label = [...scene.querySelectorAll("text")].find(node => node.textContent === String(tick));
    const box = scene.getBoundingClientRect();
    const labelBox = label.getBoundingClientRect();
    return {alignment: [mark.x, mark.y, guide.x, guide.y], size: labelBox.height,
      inside: labelBox.left >= box.left && labelBox.right <= box.right && labelBox.top >= box.top && labelBox.bottom <= box.bottom,
      axis: vertical ? mark.y : mark.x};
  }, {tick, vertical});
  expect(detail.alignment.slice(0, 2)).toEqual(detail.alignment.slice(2));
  expect(detail.axis).toBe(tick);
  expect(detail.inside).toBe(true);
  expect(detail.size).toBeGreaterThanOrEqual(16);
}

test.beforeEach(async ({page}) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    // Take the first available cell on each draw: A1, A2 and A3.
    Math.random = () => 0;
    const copies = [];
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async url => copies.push(url)}});
    document.addEventListener("securitypolicyviolation", event => window.labErrors.push(event.violatedDirective));
    window.labCopies = copies;
    window.labErrors = [];
  });
  page.labErrors = errors;
});
test.afterEach(async ({page}) => {
  expect(page.labErrors).toEqual([]);
  expect(await page.evaluate(() => window.labErrors)).toEqual([]);
});

for (const lang of ["en", "es"]) {
  test("paper workflow, ruler geometry, boundary counting and census in " + lang, async ({page}) => {
    const phone = lang === "es";
    const viewport = phone ? {width: 360, height: 780} : {width: 1366, height: 657};
    await page.setViewportSize(viewport);
    await page.emulateMedia({reducedMotion: "reduce"});
    const t = en => phone ? es[en] || en : en;
    const panel = ps(page, "panel-ladybug");
    const url = path + (phone ? "?lang=es" : "") + hash;
    const requests = [];
    page.on("request", req => requests.push(req));
    await page.goto(url);
    await expect(page.locator("html")).toHaveAttribute("lang", phone ? "es-MX" : "en");
    await expect(page.getByRole("tabpanel", {name: t("Ladybug Quadrat Lab")})).toBeVisible();
    await press(page, lab(page, "start-reef"));

    // Use only the diagram's scale and the observed species. No calculations come from the application.
    const reef = art(page, "reef");
    expect(await reef.locator("text").allTextContents()).toEqual([1, 2, 3].flatMap(n =>
      [t("Quadrat {number}").replace("{number}", n), "2 m"]).concat(["2 m", "6 m"]));
    const reefCounts = await reef.locator("[data-reef-quadrat]").evaluateAll(squares => squares.map(square =>
      ["star", "sand"].map(kind => square.querySelectorAll('[data-species="' + kind + '"]').length)));
    expect(reefCounts).toEqual([[2, 1], [3, 1], [1, 4]]);
    const stars = reefCounts.reduce((sum, [count]) => sum + count, 0);
    const reefDensity = stars / (6 * 2);
    expect([reefDensity, reefDensity * 30, reefDensity * 3600]).toEqual([0.5, 15, 1800]);
    const reefText = panel.getByText(t("Read the reef diagram"), {exact: true});
    await press(page, reefText);
    await expect(panel.locator("details li").filter({hasText: t("Five-armed sea star")})).toHaveCount(stars);
    await expect(panel.locator("details li").filter({hasText: t("Round sand dollar with a petal pattern")})).toHaveCount(6);
    await audit(page);
    await press(page, panel.getByRole("button", {name: t("Measure container"), exact: true}));

    await ruler(page, 30, false, 30, t);
    await press(page, lab(page, "zero-edge"));
    await ruler(page, 30, false, 0, t);
    await press(page, lab(page, "width"));
    await press(page, lab(page, "far-edge"));
    await ruler(page, 20, true, 20, t);
    await press(page, lab(page, "zero-edge"));
    await ruler(page, 20, true, 0, t);
    await press(page, panel.getByRole("button", {name: t("Next, measure one square"), exact: true}));
    await ruler(page, 5, false, 5, t);
    await press(page, lab(page, "zero-edge"));
    await ruler(page, 5, false, 0, t);
    await press(page, lab(page, "width"));
    await press(page, lab(page, "far-edge"));
    await ruler(page, 5, true, 5, t);
    await press(page, lab(page, "zero-edge"));
    await ruler(page, 5, true, 0, t);
    const plotArea = 30 * 20, squareArea = 5 * 5;
    expect([plotArea, squareArea, squareArea * 3]).toEqual([600, 25, 75]);
    await audit(page);

    await press(page, panel.getByRole("button", {name: t("Go to sampling"), exact: true}));
    const draw = lab(page, "draw"), reveal = lab(page, "reveal");
    const overview = art(page, "overview");
    const closeup = art(page, "closeup");
    const centers = closeup.locator('[data-center-in-square="true"]');
    const counts = [];
    const locations = [];
    const observe = async (index, count) => {
      const label = "A" + index;
      await expect(overview.locator("[data-selected-cell]")).toHaveAttribute("data-selected-cell", label);
      await expect(closeup.locator("[data-selected-cell]")).toHaveAttribute("data-selected-cell", label);
      await expect(lab(page, "sample-title")).toContainText(label);
      const location = panel.getByText(t("Read specimen locations"), {exact: true});
      if (!await location.locator("..").evaluate(node => node.open)) await press(page, location);
      const list = panel.locator("details li");
      await expect(list).toHaveCount(count);
      await tabTo(page, list.first());
      expect(await list.first().evaluate(node => getComputedStyle(node).outlineWidth)).not.toBe("0px");
      await expect(centers).toHaveCount(count);
      counts.push(await list.count());
      locations.push(await list.allTextContents());
    };

    await press(page, draw);
    await press(page, lab(page, "centers"), "Space");
    await observe(1, 2);
    // Both bodies cross the same vertical grid line, one from either side.
    const boundary = await closeup.evaluate(scene => ["A1-2", "A2-1"].map(id => {
      const bug = scene.querySelector('[data-bug-id="' + id + '"]');
      const box = bug.getBoundingClientRect();
      const line = scene.querySelector('[data-selected-cell] rect').getBoundingClientRect().right;
      return [box.left < line && box.right > line, bug.getAttribute("data-center-in-square")];
    }));
    expect(boundary).toEqual([[true, "true"], [true, "false"]]);
    await expect(reveal).toHaveCount(0);
    await press(page, draw);
    await observe(2, 4);
    await expect(reveal).toHaveCount(0);
    await press(page, draw);
    await observe(3, 3);
    await expect(draw).toHaveCount(0);
    await expect(lab(page, "census")).toHaveCount(0);
    await expect(panel.locator("input, textarea, form, [contenteditable]")).toHaveCount(0);
    for (const n of [1, 2, 3]) {
      await press(page, lab(page, "sample-" + n));
      await expect(panel.locator("details li")).toHaveText(locations[n - 1]);
    }

    const densities = counts.map(count => count / squareArea);
    const mean = densities.reduce((sum, density) => sum + density, 0) / densities.length;
    const estimate = mean * plotArea;
    expect(densities).toEqual([0.08, 0.16, 0.12]);
    expect([mean, estimate, mean * 3600, mean * 14400]).toEqual([0.12, 72, 432, 1728]);
    expect(Math.abs(estimate - 80) / 80 * 100).toBe(10);
    await press(page, lab(page, "review"));
    await expect(lab(page, "analysis")).toBeFocused();
    await press(page, reveal);
    const census = Number((await lab(page, "census").textContent()).match(/\d+/)[0]);
    const rendered = await overview.locator("[data-bug-id]").evaluateAll(nodes => nodes.map(node => {
      const point = node.transform.baseVal.getItem(0).matrix;
      return [node.dataset.bugId, point.e, point.f];
    }));
    const tally = Array(24).fill(0);
    for (const [, x, y] of rendered) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(30);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(20);
      expect(x % 5).not.toBe(0);
      expect(y % 5).not.toBe(0);
      tally[Math.floor(y / 5) * 6 + Math.floor(x / 5)]++;
    }
    expect(new Set(rendered.map(([id]) => id)).size).toBe(census);
    expect(tally.reduce((sum, count) => sum + count, 0)).toBe(census);
    expect(tally.slice(0, 4)).toEqual([2, 4, 3, 0]);
    expect(census).toBe(79);
    await audit(page);

    await press(page, lab(page, "reset"));
    const reset = page.getByRole("dialog", {name: t("Start a fresh run?")});
    await expect(reset.getByRole("button", {name: t("Keep this run")})).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(lab(page, "reset")).toBeFocused();
    await expect(lab(page, "census")).toBeVisible();
    await press(page, lab(page, "reset"));
    await press(page, reset.getByRole("button", {name: t("Start fresh run")}));
    await expect(lab(page, "start-reef")).toBeFocused();
    await expect(lab(page, "census")).toHaveCount(0);
    await press(page, lab(page, "start-measure"));
    await press(page, lab(page, "stage-sample"));
    await page.evaluate(() => { Math.random = () => 3.5 / 24; });
    await press(page, draw);
    await expect(lab(page, "sample-title")).toContainText("A4");
    await expect(panel.getByText(t("No ladybug centers are inside this square."))).toBeVisible();
    await expect(centers).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const small = await panel.locator("button:visible, summary:visible").evaluateAll(elements => elements
      .map(node => node.getBoundingClientRect()).filter(box => box.width < 44 || box.height < 44).length);
    expect(small).toBe(0);
    expect(requests.every(req => !["fetch", "xhr", "websocket", "eventsource"].includes(req.resourceType()) &&
      new URL(req.url()).hostname === "127.0.0.1")).toBe(true);
  });
}

test("both tabs keep progress, keyboard tabs and history work, and Share opens a fresh lab in either language", async ({page}) => {
  const requested = [];
  page.on("request", req => requested.push(req.url()));
  await page.goto(path + "?seed=1");
  const population = ps(page, "tab-population"), ladybug = ps(page, "tab-ladybug");
  await expect(population).toHaveAttribute("aria-selected", "true");
  expect(requested.some(url => /ladybug(?:-model|-art)?\.js/.test(url))).toBe(false);
  await page.locator('[data-ps-mode="quadrat"]').click();
  await page.locator('[data-cell="0"]').click();
  const meadow = await ps(page, "work").locator("table").first().innerText();
  await page.locator('[data-ps-mode="recapture"]').click();
  await ps(page, "net").click();
  await expect(ps(page, "net")).toContainText("Tag and release");
  await press(page, population, "End");
  await expect(ladybug).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#ladybug-quadrat$/);
  await expect(ladybug).toHaveAttribute("aria-selected", "true");
  await lab(page, "start-measure").click();
  await lab(page, "stage-sample").click();
  await lab(page, "draw").dblclick();
  await expect(lab(page, "sample-2")).toHaveCount(0);
  await expect(lab(page, "sample-1")).toContainText("A1");
  await page.waitForTimeout(500); // A separate intentional draw after the duplicate-activation guard.
  await lab(page, "draw").click();
  await expect(lab(page, "sample-2")).toContainText("A2");
  const specimens = await art(page, "closeup").locator("[data-bug-id]").evaluateAll(nodes => nodes.map(node => node.outerHTML));
  await population.click();
  await expect(ps(page, "net")).toContainText("Tag and release");
  await page.locator('[data-ps-mode="quadrat"]').click();
  await expect(ps(page, "work").locator("table").first()).toHaveText(meadow.replace(/\s+/g, " ").trim(), {useInnerText: true});
  await page.goBack();
  await expect(lab(page, "sample-title")).toContainText("A2");
  await page.goForward();
  await expect(population).toHaveAttribute("aria-selected", "true");
  await ladybug.click();
  await expect(lab(page, "sample-1")).toContainText("A1");
  await expect(lab(page, "sample-2")).toContainText("A2");
  expect(await art(page, "closeup").locator("[data-bug-id]").evaluateAll(nodes => nodes.map(node => node.outerHTML))).toEqual(specimens);

  await ps(page, "instructions-open").click();
  await expect(ps(page, "instructions-ladybug")).toBeVisible();
  await expect(ps(page, "instructions-population")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(ps(page, "instructions-open")).toBeFocused();
  await ps(page, "share-open").click();
  await ps(page, "share-copy").click();
  await page.keyboard.press("Escape");
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page).toHaveURL(/\?seed=1&lang=es#ladybug-quadrat$/);
  await expect(lab(page, "sample-title")).toHaveText("Muestra 2 de 3 · A2");
  await ps(page, "share-open").click();
  await ps(page, "share-copy").click();
  expect(await page.evaluate(() => window.labCopies)).toEqual([publicUrl + hash, publicUrl + "?lang=es" + hash]);
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(population).toHaveAttribute("aria-selected", "true");
  await expect(ps(page, "work")).toContainText("El prado");
  await page.goForward();
  await expect(lab(page, "sample-title")).toHaveText("Muestra 2 de 3 · A2");

  await page.reload();
  await expect(lab(page, "start-reef")).toHaveText(es["Inspect the reef"]);
  await expect(lab(page, "sample-title")).toHaveCount(0);
});

test.describe("touch viewport", () => {
  test.use({hasTouch: true, viewport: {width: 320, height: 720}});
  test("taps and rotation retain the same three independent close-ups", async ({page}) => {
    await page.goto(path + "?lang=es" + hash);
    await lab(page, "start-measure").tap();
    await ruler(page, 30, false, 30, en => es[en] || en);
    await lab(page, "width").tap();
    await ruler(page, 20, true, 20, en => es[en] || en);
    await lab(page, "stage-sample").tap();
    for (let i = 1; i <= 3; i++) {
      if (i > 1) await page.waitForTimeout(500);
      await lab(page, "draw").tap();
      await expect(lab(page, "sample-title")).toContainText("Muestra " + i + " de 3");
    }
    const samples = await Promise.all([1, 2, 3].map(n => lab(page, "sample-" + n).textContent()));
    expect(new Set(samples.map(text => text.split(" · ")[1])).size).toBe(3);
    await page.setViewportSize({width: 720, height: 320});
    await lab(page, "sample-1").tap();
    await expect(lab(page, "sample-title")).toContainText(samples[0].split(" · ")[1]);
    await page.setViewportSize({width: 320, height: 720});
    await lab(page, "sample-2").tap();
    await expect(lab(page, "sample-title")).toContainText(samples[1].split(" · ")[1]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(lab(page, "census")).toHaveCount(0);
  });
});

test("all cells are eligible without replacement and every specimen has one owner", async ({page}) => {
  await page.goto(path + hash);
  const eligible = eligibleCells => eligibleCells.map((_, index) => (index + 0.5) / eligibleCells.length);
  expect(eligible(cells).map(random => drawCell([], () => random))).toEqual(cells);
  const drawn = [cells[0], cells[10]];
  const remaining = cells.filter(cell => !drawn.includes(cell));
  expect(eligible(remaining).map(random => drawCell(drawn, () => random))).toEqual(remaining);
  expect(drawCell(cells.slice(0, -1), () => 0)).toBe(cells.at(-1));
  expect(new Set(cells.flatMap(cell => specimensIn(cell).map(bug => bug.id))).size).toBe(bugs.length);
  expect(bugs.every(bug => cells.filter(cell => specimensIn(cell).includes(bug)).length === 1)).toBe(true);
  expect(specimensIn(cells[3])).toEqual([]);
  expect([cellAt(4.82, 3.45).label, cellAt(5.16, 1.5).label]).toEqual(["A1", "A2"]);
});

test("lazy-loaded ladybug scripts use the page's cache-busting version", async ({page}) => {
  await page.goto(path + hash);
  await expect(lab(page, "start-reef")).toBeVisible();
  const version = await page.locator('meta[name="zsa-version"]').getAttribute("content");
  const sources = await page.locator('script[src^="ladybug"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("src")));
  expect(sources.sort()).toEqual(["ladybug-art.js", "ladybug-model.js", "ladybug.js"].map(file => file + "?v=" + version));
});

test("a language switch keeps both labs' progress, whichever tab was visited first", async ({page}) => {
  await page.goto(path);
  await ps(page, "tab-ladybug").click();
  await lab(page, "start-measure").click();
  await lab(page, "stage-sample").click();
  await lab(page, "draw").click();
  await ps(page, "tab-population").click();
  await page.locator(".zsa-ps-cell").first().click();
  await expect(ps(page, "progress")).toContainText("1 of 3");
  await page.evaluate(() => { window.__noReload = true; });
  await page.locator('.zsa-languages a[lang="es-MX"]').click();
  await expect(ps(page, "progress")).toContainText("1 de 3");
  expect(await page.evaluate(() => window.__noReload)).toBe(true);
  await ps(page, "tab-ladybug").click();
  await expect(lab(page, "sample-1")).toContainText("A1");
});
