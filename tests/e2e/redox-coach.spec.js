"use strict";
const fs = require("fs");
const {test, expect} = require("./fixtures");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const heading = page => page.locator("#zsa-rx-title");
const feedback = page => page.locator("#zsa-rx-feedback");
const check = page => page.getByRole("button", {name: "Check Answer", exact: true}).click();
async function audit(page) {
  await page.evaluate(AXE);
  const errors = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(errors.violations.map(v => v.id + ": " + v.nodes.map(n => n.target.join(" ")).join(", "))).toEqual([]);
}
async function place(page, f, type, side) {
  await page.getByRole("button", {name: "Select " + f + " " + (side === "left" ? "reactant" : "product"), exact: true}).click();
  await page.getByRole("button", {name: "Place selected species in " + type + " " + (side === "left" ? "reactants" : "products"), exact: true}).click();
}
async function split(page, basic = false) {
  await place(page, "MnO4-", "reduction", "left");
  await place(page, basic ? "I-" : "Fe2+", "oxidation", "left");
  await place(page, basic ? "MnO2" : "Mn2+", "reduction", "right");
  await place(page, basic ? "I2" : "Fe3+", "oxidation", "right");
  await check(page);
}
async function add(page, half, side, f, n) {
  const group = page.getByRole("group", {name: half + " " + (side === "left" ? "reactants" : "products"), exact: true});
  for (let i = 0; i < n; i++) await group.getByRole("button", {name: "Add " + f, exact: true}).click();
}
async function cancel(page, f, n) {
  await page.getByRole("button", {name: n + " " + f + " on left", exact: true}).click();
  await page.getByRole("button", {name: n + " " + f + " on right", exact: true}).click();
}

test("acidic: rejected work, drag and keyboard placement, undo, locked phases, and full manual solve", async ({page, problems}) => {
  void problems;
  await page.goto("/redox-coach/");
  await audit(page);
  await check(page); await expect(feedback(page)).toContainText("Place every");
  await page.getByRole("button", {name: "Select MnO4- reactant", exact: true}).dragTo(page.getByRole("button", {name: "Place selected species in oxidation reactants", exact: true}));
  await place(page, "Fe2+", "oxidation", "left"); await place(page, "Mn2+", "reduction", "right"); await place(page, "Fe3+", "oxidation", "right");
  await check(page); await expect(heading(page)).toContainText("Step 1");
  await expect(feedback(page)).toContainText("Pair the same changing element");
  // Move the misplaced token using keyboard activation only.
  await page.getByRole("button", {name: "Select MnO4- reactant", exact: true}).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("button", {name: "Select MnO4- reactant", exact: true})).toBeFocused();
  await page.getByRole("button", {name: "Place selected species in reduction reactants", exact: true}).focus(); await page.keyboard.press("Space");
  await check(page); await expect(heading(page)).toContainText("Step 2"); await expect(heading(page)).toBeFocused();
  await expect(page.getByRole("button", {name: "Undo last action"})).toBeDisabled();
  await audit(page); await check(page); await expect(feedback(page)).toContainText("oxygen");
  await add(page, "Reduction", "right", "H2O", 4);
  await add(page, "Reduction", "right", "H+", 1); await check(page); await expect(feedback(page)).toContainText("hydrogen");
  await page.getByRole("button", {name: "Undo last action"}).click();
  await add(page, "Reduction", "left", "H+", 8); await check(page);
  await expect(heading(page)).toContainText("Step 3"); await audit(page);
  await expect(page.getByRole("group", {name: "Reduction reactants", exact: true})).toContainText("Total charge: +7");
  await add(page, "Oxidation", "right", "e-", 1); await add(page, "Reduction", "left", "e-", 5); await check(page);
  await audit(page); await page.getByLabel("Oxidation multiplier", {exact: true}).fill("0"); await check(page);
  await expect(feedback(page)).toContainText("positive whole-number");
  await page.getByLabel("Oxidation multiplier", {exact: true}).fill("5"); await check(page);
  await expect(heading(page)).toContainText("Step 5"); await audit(page); await check(page); await expect(feedback(page)).toContainText("Cancel all electrons");
  await cancel(page, "e-", 5); await expect(page.getByRole("button", {name: "5 e- on left", exact: true})).toHaveCount(0);
  // Cancellation itself is reversible, but earlier steps remain locked.
  await page.getByRole("button", {name: "Undo last action"}).click(); await cancel(page, "e-", 5);
  await check(page); await expect(heading(page)).toContainText("Success!"); await expect(heading(page)).toBeFocused();
  await expect(page.locator("#zsa-rx-stage")).toContainText("Total charge: 17 on both sides");
  await expect(page.getByRole("button", {name: "Check Answer", exact: true})).toBeHidden(); await audit(page);
});

test("basic: all six phases and checked substeps, same-side merging and partial water cancellation", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 390, height: 844});
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/redox-coach/?media=basic"); await audit(page);
  await split(page, true); await audit(page);
  await add(page, "Reduction", "right", "H2O", 2); await add(page, "Reduction", "left", "H+", 4); await check(page); await audit(page);
  await add(page, "Oxidation", "right", "e-", 2); await add(page, "Reduction", "left", "e-", 3); await check(page); await audit(page);
  await page.getByLabel("Oxidation multiplier", {exact: true}).fill("3"); await page.getByLabel("Reduction multiplier", {exact: true}).fill("2"); await check(page); await audit(page);
  await cancel(page, "e-", 6); await check(page); await expect(heading(page)).toContainText("Step 6"); await audit(page);
  await check(page); await expect(feedback(page)).toContainText("exactly 8");
  for (let i = 0; i < 8; i++) await page.getByRole("button", {name: /^Add OH⁻ to left/}).click();
  await check(page); await expect(feedback(page)).toContainText("EACH side");
  for (let i = 0; i < 8; i++) await page.getByRole("button", {name: /^Add OH⁻ to right/}).click();
  await check(page); await expect(page.locator("#zsa-rx-instruction")).toContainText("SAME side"); await audit(page);
  await page.getByRole("button", {name: "8 H+ on left", exact: true}).click(); await page.getByRole("button", {name: "8 OH- on right", exact: true}).click();
  await expect(feedback(page)).toContainText("SAME side");
  await page.getByRole("button", {name: "8 OH- on left", exact: true}).click(); await check(page); await audit(page);
  await check(page); await expect(feedback(page)).toContainText("Cancel water");
  await page.getByRole("button", {name: "8 H2O on left", exact: true}).click(); await page.getByRole("button", {name: "4 H2O on right", exact: true}).click();
  await expect(page.getByRole("button", {name: "4 H2O on left", exact: true})).toBeVisible();
  await expect(page.getByRole("button", {name: "4 H2O on right", exact: true})).toHaveCount(0);
  await check(page); await expect(heading(page)).toContainText("Success!"); await audit(page);
  await expect(page.locator("#zsa-rx-stage")).toContainText("Total charge: -8 on both sides");
});

test("landing link, problem deep link, mobile targets, local assets and embed mode", async ({page, problems}) => {
  void problems;
  const outside = [];
  page.on("request", request => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outside.push(request.url()); });
  await page.goto("/"); await page.getByRole("link", {name: "Redox Half-Reaction Balancer Coach", exact: true}).click();
  for (const width of [320, 360, 390, 768, 1366, 1920]) {
    await page.setViewportSize({width, height: 900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), String(width)).toBe(true);
    const heights = await page.locator("button:visible, select:visible").evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().height));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  }
  await page.goto("/redox-coach/?problem=2&embed=1");
  await expect(page.getByLabel("Practice problem")).toHaveValue("1");
  await expect(page.getByRole("link", {name: "All activities"})).toBeHidden();
  await expect(page.locator("#zsa-rx-medium")).toHaveText("Basic medium");
  await page.getByLabel("Practice problem").selectOption("0"); await split(page);
  await page.getByRole("button", {name: "Restart problem"}).click(); await expect(heading(page)).toContainText("Step 1");
  expect(outside).toEqual([]);
});

for (const width of [390, 1366]) {
  test("header instructions and sharing preserve work at " + width + "px", async ({page, problems}) => {
    void problems;
    const requests = [];
    page.on("request", request => requests.push(request.url()));
    await page.setViewportSize({width, height: 900});
    await page.goto("/redox-coach/?problem=2");
    const logo = page.getByRole("link", {name: "ZornScience home", exact: true});
    const title = page.getByRole("heading", {level: 1});
    const a = await logo.boundingBox(), b = await title.boundingBox();
    expect(a.x + a.width).toBeLessThan(b.x);
    expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(1);
    const species = page.getByRole("button", {name: "Select MnO4- reactant", exact: true});
    await species.click();
    const before = await page.locator("#zsa-rx-stage").textContent();
    await page.getByRole("button", {name: "Instructions", exact: true}).click();
    const dialog = page.getByRole("dialog", {name: "How to use Redox Balancer Coach"});
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", {name: "Close instructions", exact: true})).toBeFocused();
    await audit(page);
    await page.keyboard.press("Escape"); await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", {name: "Instructions", exact: true})).toBeFocused();
    await expect(species).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator("#zsa-rx-stage").textContent()).toBe(before);
    await page.getByRole("button", {name: "Instructions", exact: true}).click();
    await page.getByRole("button", {name: "Close instructions", exact: true}).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", {name: "Share activity", exact: true}).click();
    await expect(page.getByRole("button", {name: "Share activity", exact: true})).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", {name: "Copy link", exact: true})).toBeFocused();
    await expect(page.getByLabel("Share link", {exact: true})).toHaveValue("https://activities.zornscience.org/redox-coach/");
    await expect(page.getByRole("link", {name: "Email", exact: true})).toHaveAttribute("href", /^mailto:\?subject=/);
    await expect(page.getByRole("link", {name: /^Facebook/})).toHaveAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Factivities.zornscience.org%2Fredox-coach%2F");
    await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", {name: "Share activity", exact: true})).toBeFocused();
    expect(await page.locator("#zsa-rx-stage").textContent()).toBe(before);
    expect(requests.every(url => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
    await page.goto("/redox-coach/?embed=1");
    await expect(logo).toBeHidden();
    await expect(page.getByRole("button", {name: "Share activity", exact: true})).toBeHidden();
    await expect(page.getByRole("button", {name: "Instructions", exact: true})).toBeVisible();
  });
}

test("share copies the canonical link and offers a manual-copy fallback", async ({page, context, problems}) => {
  void problems;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/redox-coach/?media=basic");
  await page.getByRole("button", {name: "Share activity", exact: true}).click();
  await page.getByRole("button", {name: "Copy link", exact: true}).click();
  await expect(page.locator("#zsa-rx-share-status")).toHaveText("Link copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://activities.zornscience.org/redox-coach/");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: () => Promise.reject(new Error("Unavailable"))}}));
  await page.getByRole("button", {name: "Copy link", exact: true}).click();
  await expect(page.locator("#zsa-rx-share-status")).toContainText("Link selected");
  await expect(page.getByLabel("Share link", {exact: true})).toBeFocused();
  expect(await page.getByLabel("Share link", {exact: true}).evaluate(input => input.selectionEnd - input.selectionStart)).toBe("https://activities.zornscience.org/redox-coach/".length);
});
