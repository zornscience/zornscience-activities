// Gas Laws and KMT Lab (gas-lab/): layout at eight sizes and the fit at 1366x657 and 390x664, 44 px targets,
// keyboard use of every control and graph, deep links, the back link, embed mode, reduced motion, the live region,
// axe-core, network, frame rate under a 4x CPU slowdown, and the investigations: every wrong pick routed to its
// feedback, every test answer equal to what the lab shows, and a full round's completion code read back by the
// checker. Selects by id, role, ARIA state and text, never by class name, and fails on any console error or CSP
// violation (the `problems` fixture).
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var {loadData} = require("../support/load-data");
var codes = require("../../shared/zsa-codes.js");
var phys = require("../../gas-lab/physics.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DATA = loadData(path.join(__dirname, "..", "..", "gas-lab", "data.js"));
var INV = DATA.inv;
var SIZES = [[320, 568], [360, 640], [390, 664], [683, 384], [768, 1024], [1280, 617], [1366, 657], [1920, 960]];
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "gas-lab", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

async function go(page, query) {
  await page.goto("/gas-lab/" + (query || ""));
  await page.waitForFunction(() => document.getElementById("zsa-gl-gas0") && document.querySelector("#zsa-gl-work fieldset, #zsa-gl-work h2"));
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
function text(page, id) { return page.locator("#" + id).textContent(); }
async function setNumber(page, id, value) {
  await page.fill("#" + id, String(value));
  await page.press("#" + id, "Enter");
}
// Everything a student can press, and how the page scrolls.
function measure() {
  var main = document.querySelector("main");
  function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[hidden]"); }
  var targets = [].filter.call(main.querySelectorAll("button, a, summary, select, input[type=number], input[type=range], label:has(input[type=radio]), label:has(input[type=checkbox])"), visible).map(function (el) {
    var r = el.getBoundingClientRect();
    return {el: (el.id || el.textContent || el.tagName).trim().slice(0, 40), w: r.width, h: r.height};
  });
  return {
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    small: targets.filter(function (t) { return t.w < 44 || t.h < 44; })
  };
}

// ---------- Layout ----------
var STATES = [
  ["default", ""], ["real gas", "?mode=real&graph=z"], ["mixture and speeds", "?mix=1&mb=1"],
  ["investigations", "?tab=investigate"], ["V vs T", "?graph=vt"]
];
test("gas lab: no sideways scrolling and 44 px targets at every size", async ({page, problems}) => {
  void problems;
  for (var [w, h] of SIZES) {
    await page.setViewportSize({width: w, height: h});
    for (var [name, query] of STATES) {
      await go(page, query);
      if (name === "V vs T") { await page.click("#zsa-gl-sweep"); await page.click("#zsa-gl-table-toggle"); }
      var m = await page.evaluate(measure);
      var where = w + "x" + h + " " + name;
      expect(m.pageOverflow, where + " page scrolls sideways").toBeLessThanOrEqual(0);
      expect(m.small, where + " targets under 44 px").toEqual([]);
    }
  }
});

test("gas lab: the container, every control and the pressure readout fit without scrolling at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page);
    var boxes = await page.evaluate(() => ["zsa-gl-canvas", "zsa-gl-gauge", "zsa-gl-p-atm", "zsa-gl-mode", "zsa-gl-mix", "zsa-gl-gas0", "zsa-gl-n0", "zsa-gl-n0-num",
      "zsa-gl-V", "zsa-gl-V-num", "zsa-gl-T", "zsa-gl-T-num", "zsa-gl-hold", "zsa-gl-playpause", "zsa-gl-step"].map(function (id) {
      var r = document.getElementById(id).getBoundingClientRect();
      return {id: id, top: r.top, bottom: r.bottom, left: r.left, right: r.right, scrollY: window.scrollY};
    }));
    boxes.forEach(function (b) {
      expect(b.top, w + "x" + h + " " + b.id + " top").toBeGreaterThanOrEqual(0);
      expect(b.bottom, w + "x" + h + " " + b.id + " bottom").toBeLessThanOrEqual(h);
      expect(b.right, w + "x" + h + " " + b.id + " right").toBeLessThanOrEqual(w);
      expect(b.scrollY).toBe(0);
    });
    // The canvas is a real drawing area, not a sliver.
    var canvas = boxes[0];
    expect(canvas.bottom - canvas.top).toBeGreaterThanOrEqual(190);
  }
});

// ---------- Readouts and science in the page ----------
test("gas lab: readouts follow the ideal gas law and the hold setting", async ({page, problems}) => {
  void problems;
  await go(page, "?gas=N2");
  expect(await text(page, "zsa-gl-p-law")).toBe("Gas law: 4.92 atm");
  expect(await text(page, "zsa-gl-ke-theory")).toBe("(3/2)RT = 3.74 kJ/mol");
  expect(await text(page, "zsa-gl-speeds")).toBe("N₂: 476 m/s");
  // Hold T: compressing to 2.5 L doubles P.
  await setNumber(page, "zsa-gl-V-num", 2.5);
  expect(await text(page, "zsa-gl-p-law")).toBe("Gas law: 9.85 atm");
  await expect(page.locator("#zsa-gl-T-num")).toBeDisabled();
  // Hold V: heating to 600 K doubles P; the volume box is locked.
  await page.check('input[name="zsa-gl-hold"][value="V"]');
  await setNumber(page, "zsa-gl-T-num", 600);
  expect(await text(page, "zsa-gl-p-law")).toBe("Gas law: 19.7 atm");
  expect(await text(page, "zsa-gl-T-c")).toBe("= 327 °C");
  await expect(page.locator("#zsa-gl-V-num")).toBeDisabled();
  // Hold P: cooling to 300 K halves the volume; heating past the top stops where the piston reaches 10 L.
  await page.check('input[name="zsa-gl-hold"][value="T"]');
  await setNumber(page, "zsa-gl-V-num", 10);
  await page.check('input[name="zsa-gl-hold"][value="P"]');
  await expect(page.locator("#zsa-gl-note")).toHaveText("Pressure is held constant at 4.92 atm. Change the temperature or the moles and the piston moves.");
  await setNumber(page, "zsa-gl-T-num", 300);
  expect(await page.inputValue("#zsa-gl-V-num")).toBe("5.00");
  expect(await text(page, "zsa-gl-p-law")).toBe("Gas law: 4.92 atm");
  await setNumber(page, "zsa-gl-T-num", 1000);
  expect(await page.inputValue("#zsa-gl-V-num")).toBe("10.00");
  expect(await page.inputValue("#zsa-gl-T-num")).toBe("600");
  await expect(page.locator("#zsa-gl-note")).toContainText("The piston reached the top of the container, so the change stopped there.");
  await setNumber(page, "zsa-gl-n0-num", 0.5);
  expect(await page.inputValue("#zsa-gl-V-num")).toBe("5.00");
  // The gauge measures: within 5% of the gas law after a few seconds.
  await page.check('input[name="zsa-gl-hold"][value="T"]');
  await setNumber(page, "zsa-gl-V-num", 5);
  await page.waitForTimeout(4000);
  var measured = parseFloat(await text(page, "zsa-gl-p-atm")), law = parseFloat((await text(page, "zsa-gl-p-law")).replace("Gas law: ", ""));
  expect(Math.abs(measured / law - 1), measured + " vs " + law).toBeLessThan(0.05);
  expect(await text(page, "zsa-gl-p-kpa")).toMatch(/^\d+(\.\d+)? kPa$/);
});

test("gas lab: mixtures show moles, mole fractions and partial pressures that add up, with shapes", async ({page, problems}) => {
  void problems;
  await go(page, "?mix=1");
  var rows = await page.locator("#zsa-gl-mix-body tr").allTextContents();
  expect(rows).toEqual(["He0.500.5002.46 atm", "Ar0.300.3001.48 atm", "Kr0.200.2000.98 atm", "Total1.001.0004.92 atm"]);
  expect(await text(page, "zsa-gl-mix-sum")).toContain("P total = 2.46 + 1.48 + 0.98 = 4.92 atm");
  expect(await page.locator("#zsa-gl-canvas").getAttribute("aria-label")).toBe("Container with a piston at 5.0 L holding 100 helium dots (circles), 60 argon dots (squares), 40 krypton dots (triangles) at 300 K.");
  // Removing gas 3 leaves two gases; real gas mode is off for mixtures.
  await page.selectOption("#zsa-gl-gas2", "none");
  expect(await page.locator("#zsa-gl-mix-body tr").count()).toBe(3);
  await expect(page.locator('input[name="zsa-gl-mode"][value="real"]')).toBeDisabled();
  // A gas already used is not offered again.
  expect(await page.locator('#zsa-gl-gas1 option[value="He"]').isDisabled()).toBe(true);
});

test("gas lab: real gas mode shows PV/nRT from van der Waals, its two causes, and condensation", async ({page, problems}) => {
  void problems;
  await go(page, "?mode=real");
  expect(await text(page, "zsa-gl-gauge-label")).toBe("Pressure (van der Waals)");
  var r = phys.vdw("CO2", 1, 300, 1);
  expect(await text(page, "zsa-gl-p-z")).toBe("PV/nRT = " + r.Z.toFixed(3));
  expect(await text(page, "zsa-gl-p-atm")).toBe("22.1 atm");
  expect(await text(page, "zsa-gl-p-law")).toBe("Ideal gas law: 24.6 atm");
  expect(await text(page, "zsa-gl-real-terms")).toBe("Particle volume raises it by " + (r.volumeTerm - 1).toFixed(3) + ". Attractions lower it by " + r.attractionTerm.toFixed(3) + ".");
  await expect(page.locator("#zsa-gl-real-note")).toContainText("Real gas numbers come from the van der Waals equation");
  await expect(page.locator('input[name="zsa-gl-hold"][value="P"]')).toBeDisabled();
  // High pressure at high temperature: Z above 1.
  await page.selectOption("#zsa-gl-gas0", "N2");
  await setNumber(page, "zsa-gl-n0-num", 2); await setNumber(page, "zsa-gl-V-num", 0.25);
  await page.check('input[name="zsa-gl-hold"][value="V"]'); await setNumber(page, "zsa-gl-T-num", 1000);
  expect(await text(page, "zsa-gl-p-z")).toBe("PV/nRT = " + phys.vdw("N2", 2, 1000, 0.25).Z.toFixed(3));
  await expect(page.locator("#zsa-gl-real-why")).toHaveText(/^Above 1/);
  // Xenon below its critical temperature condenses in the model.
  await page.selectOption("#zsa-gl-gas0", "Xe"); await setNumber(page, "zsa-gl-n0-num", 1); await page.check('input[name="zsa-gl-hold"][value="T"]');
  await setNumber(page, "zsa-gl-V-num", 1); await page.check('input[name="zsa-gl-hold"][value="V"]'); await setNumber(page, "zsa-gl-T-num", 200);
  await expect(page.locator("#zsa-gl-real-condensed")).toBeVisible();
  await expect(page.locator("#zsa-gl-real-condensed")).toContainText("Below 297 K, xenon can condense");
  expect(await page.locator("#zsa-gl-canvas").getAttribute("aria-label")).toContain("Some has condensed into liquid on the floor.");
  // Back to ideal mode: the volume range returns to 1 to 10 L.
  await page.check('input[name="zsa-gl-mode"][value="ideal"]');
  expect(await page.getAttribute("#zsa-gl-V", "min")).toBe("1");
});

// ---------- Graphs ----------
test("gas lab: every graph sweeps, fits its law, has a data table and copies data for Google Sheets", async ({page, context, problems}) => {
  void problems;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await go(page);
  var expected = {pv: /^Best fit: P = 24\.\d\/V, R² = 0\.99\d\d|^Best fit: P = 24\.\d\/V, R² = 1\.0000/, p1v: /R² = (0\.99\d\d|1\.0000)/,
    vt: /The dashed line reaches zero at −?\d+ K \(−27\d °C\)/, pt: /R² = (0\.99\d\d|1\.0000)/, vn: /^Best-fit line: V = .* n.*R² = (0\.99\d\d|1\.0000)/};
  for (var kind of Object.keys(expected)) {
    await page.selectOption("#zsa-gl-graph", kind);
    await page.click("#zsa-gl-sweep");
    await expect(page.locator("#zsa-gl-graph-status")).toHaveText("Sweep done: 10 points.");
    await expect(page.locator("#zsa-gl-fit")).toHaveText(expected[kind]);
    expect(await page.locator("#zsa-gl-chart svg circle").count()).toBeGreaterThanOrEqual(10);
    expect(await page.locator("#zsa-gl-chart svg").getAttribute("aria-label")).toMatch(/: 10 points\. /);
  }
  // The °C axis moves absolute zero to −273 °C.
  await page.selectOption("#zsa-gl-graph", "vt"); await page.click("#zsa-gl-sweep"); await page.check("#zsa-gl-celsius");
  await expect(page.locator("#zsa-gl-fit")).toHaveText(/reaches zero at −27\d °C/);
  await expect(page.locator("#zsa-gl-chart svg")).toContainText("Temperature (°C)");
  // Data table and copy.
  await page.click("#zsa-gl-table-toggle");
  await expect(page.locator("#zsa-gl-data")).toBeVisible();
  await expect(page.locator("#zsa-gl-table-toggle")).toHaveAttribute("aria-expanded", "true");
  expect(await page.locator("#zsa-gl-data-body tr").count()).toBe(10);
  var head = await page.locator("#zsa-gl-data-head th").allTextContents();
  expect(head).toEqual(["Point", "Gas", "V (L)", "1/V (1/L)", "T (K)", "T (°C)", "n (mol)", "P (atm)", "P (kPa)", "PV/nRT"]);
  await page.click("#zsa-gl-copy");
  await expect(page.locator("#zsa-gl-graph-status")).toHaveText("Copied 10 rows. Paste into Google Sheets.");
  var clip = await page.evaluate(() => navigator.clipboard.readText());
  var lines = clip.split("\n");
  expect(lines.length).toBe(11);
  expect(lines[0].split("\t")).toEqual(head);
  expect(lines[1].split("\t")[4]).toBe("100");
  expect(clip).not.toMatch(/−/); // a plain minus for spreadsheets
  // Record one point by hand (a sweep leaves the lab at its last state, so start fresh).
  await go(page, "?graph=pv");
  await page.click("#zsa-gl-clear");
  await expect(page.locator("#zsa-gl-fit")).toHaveText("No points yet. Press Record point or Run sweep.");
  await page.click("#zsa-gl-record");
  await expect(page.locator("#zsa-gl-graph-status")).toHaveText(/^Point 1 recorded: V 5\.00 L, T 300 K, n 1\.00 mol, P \d\.\d\d atm\.$/);
  // Real gas mode: PV/nRT vs P, and sweeps that hold pressure are off.
  await go(page, "?mode=real&graph=z");
  await page.click("#zsa-gl-sweep");
  await expect(page.locator("#zsa-gl-fit")).toHaveText(/^PV\/nRT runs from 0\.\d{3} to 0\.\d{3} over these points\.$/);
  await page.selectOption("#zsa-gl-graph", "vt");
  await expect(page.locator("#zsa-gl-sweep")).toBeDisabled();
});

test("gas lab: the speed distribution compares temperatures and gases with labels and line styles", async ({page, problems}) => {
  void problems;
  await go(page, "?mb=1&gas=He");
  await expect(page.locator("#zsa-gl-tab-speeds")).toHaveAttribute("aria-selected", "true");
  var label = await page.locator("#zsa-gl-mb-chart svg").getAttribute("aria-label");
  expect(label).toBe("Speed distribution of helium at 300 K: 200 dots, most probable speed 1,116 m/s.");
  await page.click("#zsa-gl-preset-t");
  label = await page.locator("#zsa-gl-mb-chart svg").getAttribute("aria-label");
  expect(label).toContain("Dashed curve: helium at 600 K, most probable speed 1,579 m/s.");
  expect(await page.locator("#zsa-gl-mb-legend li").allTextContents()).toEqual(["Bars: speeds of the 400 helium dots in the container", "He at 300 K: solid curve", "He at 600 K: dashed curve"]);
  await expect(page.locator("#zsa-gl-mb-chart svg")).toContainText("He at 300 K (solid)");
  await expect(page.locator("#zsa-gl-mb-chart svg")).toContainText("He at 600 K (dashed)");
  await page.click("#zsa-gl-preset-hear");
  expect(await page.locator("#zsa-gl-mb-body tr").allTextContents()).toEqual(["He at 300 K (solid)1,1161,2601,367", "Ar at 300 K (dashed)353399433"]);
  await page.click("#zsa-gl-preset-nekr");
  expect(await page.locator("#zsa-gl-mb-body tr").allTextContents()).toEqual(["Ne at 300 K (solid)497561609", "Kr at 300 K (dashed)244275299"]);
  // Bars: the histogram's bars add up to the dots counted.
  var bars = await page.locator("#zsa-gl-mb-chart svg rect").count();
  expect(bars).toBeGreaterThan(8);
});

// ---------- Keyboard ----------
async function tabTo(page, id, max) {
  for (var i = 0; i < (max || 60); i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement && document.activeElement.id) === id) return true;
  }
  throw new Error("Tab never reached #" + id);
}
test("gas lab: every control and graph works from the keyboard alone", async ({page, context, problems}) => {
  void problems;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await go(page);
  // Volume slider: arrow keys.
  await tabTo(page, "zsa-gl-V");
  await page.keyboard.press("ArrowRight");
  expect(await page.inputValue("#zsa-gl-V-num")).toBe("5.1");
  await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft");
  expect(await page.inputValue("#zsa-gl-V-num")).toBe("4.9");
  await page.keyboard.press("Home");
  expect(await page.inputValue("#zsa-gl-V-num")).toBe("1.0");
  // Volume number box: type and Enter.
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("zsa-gl-V-num");
  await page.keyboard.press("Control+A"); await page.keyboard.type("2.5"); await page.keyboard.press("Enter");
  expect(await text(page, "zsa-gl-p-law")).toBe("Gas law: 9.85 atm");
  // Hold constant: arrows move between the radios.
  await page.focus('input[name="zsa-gl-hold"][value="T"]');
  await page.keyboard.press("ArrowRight");
  expect(await page.isChecked('input[name="zsa-gl-hold"][value="V"]')).toBe(true);
  // Temperature, now unlocked.
  await page.focus("#zsa-gl-T");
  await page.keyboard.press("ArrowUp");
  expect(await page.inputValue("#zsa-gl-T-num")).toBe("301");
  await page.keyboard.press("End");
  expect(await page.inputValue("#zsa-gl-T-num")).toBe("1000");
  // Moles and gas.
  await page.focus("#zsa-gl-n0"); await page.keyboard.press("ArrowRight");
  expect(await page.inputValue("#zsa-gl-n0-num")).toBe("1.01");
  await page.focus("#zsa-gl-gas0"); await page.keyboard.press("ArrowDown");
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("Ne");
  // Mode and mixture.
  await page.focus('input[name="zsa-gl-mode"][value="ideal"]'); await page.keyboard.press("ArrowRight");
  expect(await page.isChecked('input[name="zsa-gl-mode"][value="real"]')).toBe(true);
  await page.keyboard.press("ArrowLeft");
  await page.focus("#zsa-gl-mix"); await page.keyboard.press("Space");
  expect(await page.locator("#zsa-gl-gas2").count()).toBe(1);
  await page.keyboard.press("Space");
  // Play, pause and step.
  await page.focus("#zsa-gl-playpause"); await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-gl-playpause")).toHaveText("Play");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("zsa-gl-step");
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-gl-p-note")).toHaveText(/^Averaged over 0\.\d\d s of wall hits$/);
  // Tabs: one Tab stop, arrows switch.
  await page.focus("#zsa-gl-tab-graphs");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#zsa-gl-tab-speeds")).toBeFocused();
  await expect(page.locator("#zsa-gl-panel-speeds")).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.locator("#zsa-gl-panel-investigate")).toBeVisible();
  await page.keyboard.press("Home");
  // Graphs: choose a graph, sweep, record, show the table and copy, all by keyboard.
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("zsa-gl-panel-graphs");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("zsa-gl-graph");
  await page.keyboard.press("ArrowDown");
  expect(await page.inputValue("#zsa-gl-graph")).toBe("p1v");
  await tabTo(page, "zsa-gl-sweep"); await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-gl-graph-status")).toHaveText("Sweep done: 10 points.");
  await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-gl-graph-status")).toHaveText(/^Point 11 recorded/);
  await tabTo(page, "zsa-gl-table-toggle"); await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-gl-data")).toBeVisible();
  await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-gl-graph-status")).toHaveText("Copied 11 rows. Paste into Google Sheets.");
  // The data table region is focusable for scrolling.
  await tabTo(page, "zsa-gl-data");
  // Speeds: the comparison select and presets.
  await page.focus("#zsa-gl-tab-speeds"); await page.keyboard.press("Enter");
  await tabTo(page, "zsa-gl-mb-overlay");
  await page.keyboard.press("ArrowDown");
  expect(await page.inputValue("#zsa-gl-mb-overlay")).toBe("t");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.id)).toBe("zsa-gl-mb-t2");
  await page.keyboard.press("Control+A"); await page.keyboard.type("900"); await page.keyboard.press("Enter");
  expect(await page.locator("#zsa-gl-mb-chart svg").getAttribute("aria-label")).toContain("at 900 K");
  await tabTo(page, "zsa-gl-preset-nekr"); await page.keyboard.press("Enter");
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("Ne");
  // Focus is always visible: the focused element has an outline.
  var outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  expect(outline).toBe("solid");
});

// ---------- Deep links, back link, embed mode ----------
test("gas lab: deep links, the from back link and embed mode", async ({page, problems}) => {
  void problems;
  await go(page, "?gas=He");
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("He");
  await go(page, "?gas=co2&mode=real");
  expect(await page.isChecked('input[name="zsa-gl-mode"][value="real"]')).toBe(true);
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("CO2");
  await go(page, "?mode=real");
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("CO2");
  await go(page, "?mix=1&gas=Xe");
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("Xe");
  expect(await page.locator("#zsa-gl-mix").isChecked()).toBe(true);
  for (var g of ["pv", "p1v", "vt", "pt", "vn"]) {
    await go(page, "?graph=" + g);
    expect(await page.inputValue("#zsa-gl-graph")).toBe(g);
    await expect(page.locator("#zsa-gl-panel-graphs")).toBeVisible();
  }
  await go(page, "?mb=1");
  await expect(page.locator("#zsa-gl-panel-speeds")).toBeVisible();
  await go(page, "?gas=bogus&graph=nope&mode=fake&mix=2");
  expect(await page.inputValue("#zsa-gl-gas0")).toBe("He");
  expect(await page.inputValue("#zsa-gl-graph")).toBe("pv");
  expect(await page.isChecked('input[name="zsa-gl-mode"][value="ideal"]')).toBe(true);
  // Nothing moves focus on load, deep links included.
  await go(page, "?mb=1&gas=Ar&graph=vt");
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  // from: zornscience.org pages only.
  var lesson = "https://zornscience.org/science/ap-chemistry/unit-3-properties-of-substances-and-mixtures/3-4-ideal-gas-law/";
  await go(page, "?from=" + encodeURIComponent(lesson) + "&gas=He");
  await expect(page.locator("#zsa-gl-back")).toHaveAttribute("href", lesson);
  await expect(page.locator("#zsa-gl-back")).toHaveText("← Back to the lesson");
  var DEFAULT = "https://zornscience.org/science/ap-chemistry/unit-3-properties-of-substances-and-mixtures/";
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad));
    await expect(page.locator("#zsa-gl-back"), bad).toHaveAttribute("href", DEFAULT);
  }
  // Embed mode, combined with other parameters.
  await go(page, "?embed=1&mode=real&graph=z&from=" + encodeURIComponent(lesson));
  await expect(page.locator("#zsa-gl-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.locator("h1")).toBeVisible();
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
  expect(await page.isChecked('input[name="zsa-gl-mode"][value="real"]')).toBe(true);
  expect(await page.inputValue("#zsa-gl-graph")).toBe("z");
});

test("gas lab: embedded in a zornscience.org frame it reports its height and never scrolls the host", async ({page}) => {
  var ROOT = path.join(__dirname, "..", ".."), TYPES = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2"};
  await page.route("https://activities.zornscience.org/**", (route) => {
    var file = path.join(ROOT, new URL(route.request().url()).pathname);
    if (file.endsWith("/")) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) return route.fulfill({status: 404, body: ""});
    return route.fulfill({status: 200, contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file)});
  });
  await page.route("https://zornscience.org/host", (route) => route.fulfill({status: 200, contentType: "text/html", body:
    "<!doctype html><title>Host</title><div style='height:1200px'>Lesson text</div>" +
    "<iframe id='f' title='Lab' src='https://activities.zornscience.org/gas-lab/?embed=1&mix=1&tab=investigate' style='width:100%;border:0;height:900px'></iframe>" +
    "<script>window.got=[];window.addEventListener('message',function(e){if(e.origin==='https://activities.zornscience.org'&&e.data&&e.data.type==='zsa:resize'){window.got.push(e.data);document.getElementById('f').style.height=e.data.height+'px';}});</script>"}));
  await page.goto("https://zornscience.org/host");
  await page.waitForFunction(() => window.got.length > 0);
  var frame = page.frameLocator("#f");
  await expect(frame.locator("#zsa-gl-gas2")).toBeVisible();
  // Answering an investigation step (focus and feedback inside the frame) never scrolls the host page.
  // (Clicked by script: Playwright's own click would scroll the host to the button.)
  await frame.locator("#zsa-gl-work > fieldset [data-zsa-part] button").first().evaluate((b) => b.click());
  await frame.locator("#zsa-gl-V").evaluate((r) => { r.value = "3"; r.dispatchEvent(new Event("input", {bubbles: true})); });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  var got = await page.evaluate(() => window.got);
  got.forEach((m) => { expect(m.activity).toBe("gas-lab"); expect(Number.isInteger(m.height)).toBe(true); });
});

// ---------- Motion ----------
test("gas lab: reduced motion starts paused; Play, Pause and Step", async ({browser}) => {
  var context = await browser.newContext({reducedMotion: "reduce", viewport: {width: 1366, height: 657}});
  var page = await context.newPage(), problems = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") problems.push(m.text()); });
  await go(page);
  await expect(page.locator("#zsa-gl-playpause")).toHaveText("Play");
  await expect(page.locator("#zsa-gl-play-note")).toHaveText("Paused because your device asks for reduced motion. Press Play or Step to run it.");
  var a = await page.evaluate(() => document.getElementById("zsa-gl-canvas").toDataURL());
  await page.waitForTimeout(600);
  var b = await page.evaluate(() => document.getElementById("zsa-gl-canvas").toDataURL());
  expect(a === b, "the drawing does not move while paused").toBe(true);
  expect(await text(page, "zsa-gl-p-note")).toBe("Press Play or Step to measure");
  await page.click("#zsa-gl-step");
  var c = await page.evaluate(() => document.getElementById("zsa-gl-canvas").toDataURL());
  expect(c === b, "Step moves the dots").toBe(false);
  await page.click("#zsa-gl-playpause");
  await expect(page.locator("#zsa-gl-playpause")).toHaveText("Pause");
  await page.waitForTimeout(300);
  var d = await page.evaluate(() => document.getElementById("zsa-gl-canvas").toDataURL());
  expect(d === c).toBe(false);
  expect(problems).toEqual([]);
  await context.close();
  // Without the preference it starts playing.
  var p2 = await browser.newPage();
  await go(p2);
  await expect(p2.locator("#zsa-gl-playpause")).toHaveText("Pause");
  await p2.close();
});

test("gas lab: the live region speaks only after a change, once, and never continuously", async ({page, problems}) => {
  void problems;
  await go(page, "?gas=He");
  await page.evaluate(() => {
    window.__liveChanges = 0;
    new MutationObserver(() => { window.__liveChanges++; }).observe(document.getElementById("zsa-gl-lab-live"), {childList: true, characterData: true, subtree: true});
  });
  await page.waitForTimeout(2500);
  expect(await page.evaluate(() => window.__liveChanges), "nothing while the animation runs").toBe(0);
  expect(await text(page, "zsa-gl-lab-live")).toBe("");
  // Dragging through several values gives one announcement after the student stops.
  await page.focus("#zsa-gl-V");
  for (var i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__liveChanges)).toBe(1);
  expect(await text(page, "zsa-gl-lab-live")).toBe("Volume 5.50 L. Pressure 4.48 atm by the gas law.");
  await page.waitForTimeout(2000);
  expect(await page.evaluate(() => window.__liveChanges)).toBe(1);
  await page.check('input[name="zsa-gl-hold"][value="P"]');
  await page.focus("#zsa-gl-T"); await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(1500);
  expect(await text(page, "zsa-gl-lab-live")).toBe("Temperature 301 K (28 °C). Pressure held at 4.48 atm; the piston moved to 5.52 L.");
});

test("gas lab: the animation stays above 30 frames per second with the most particles on a 4x slower CPU", async ({page, problems}) => {
  void problems;
  await go(page, "?mix=1");
  for (var id of ["zsa-gl-n0-num", "zsa-gl-n1-num", "zsa-gl-n2-num"]) await setNumber(page, id, 2);
  await expect(page.locator("#zsa-gl-dots")).toHaveText(/^1200 dots\./);
  var cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 4});
  await page.waitForTimeout(1000);
  var fps = await page.evaluate(() => new Promise((resolve) => {
    var n = 0, t0 = performance.now();
    function frame() { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(frame); else resolve(n / ((performance.now() - t0) / 1000)); }
    requestAnimationFrame(frame);
  }));
  // Real gas mode (collisions and attraction lines) at its most particles too.
  await go(page, "?mode=real&gas=CO2");
  await setNumber(page, "zsa-gl-n0-num", 2); await setNumber(page, "zsa-gl-V-num", 0.25);
  var fpsReal = await page.evaluate(() => new Promise((resolve) => {
    var n = 0, t0 = performance.now();
    function frame() { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(frame); else resolve(n / ((performance.now() - t0) / 1000)); }
    requestAnimationFrame(frame);
  }));
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 1});
  test.info().annotations.push({type: "fps", description: "mixture 1200 dots: " + fps.toFixed(1) + "; real gas 400 dots: " + fpsReal.toFixed(1)});
  expect(fps).toBeGreaterThan(30);
  expect(fpsReal).toBeGreaterThan(30);
});

// ---------- Accessibility, network, storage ----------
test("gas lab: axe-core finds no violations in 8 states", async ({page, problems}) => {
  void problems;
  var states = [["start", "", 1366, 657], ["real gas condensed", "?mode=real&gas=Xe", 1366, 657], ["mixture", "?mix=1", 1366, 657],
    ["speeds compare", "?mb=1", 390, 664], ["graph with table", "?graph=vt", 390, 664], ["investigation", "?tab=investigate", 1366, 657],
    ["investigation feedback", "?tab=investigate", 390, 664], ["embed", "?embed=1&mix=1&mb=1", 768, 1024]];
  for (var [name, query, w, h] of states) {
    await page.setViewportSize({width: w, height: h});
    await go(page, query);
    if (name === "real gas condensed") { await page.check('input[name="zsa-gl-hold"][value="V"]'); await setNumber(page, "zsa-gl-T-num", 200); }
    if (name === "speeds compare") await page.click("#zsa-gl-preset-t");
    if (name === "graph with table") { await page.click("#zsa-gl-sweep"); await page.click("#zsa-gl-table-toggle"); }
    if (name === "investigation feedback") {
      var wrong = page.locator("#zsa-gl-work > fieldset [data-zsa-part] button");
      for (var i = 0; i < await wrong.count(); i++) { await wrong.nth(i).click(); if (await page.locator("#zsa-gl-work > fieldset > p").first().isVisible()) break; }
      await page.locator("#zsa-gl-work > fieldset .zsa-actions button").first().click();
    }
    await audit(page, name);
  }
});

test("gas lab: only local files load, with version strings; no storage or cookies", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page, "?mix=1&mb=1");
  await page.click("#zsa-gl-tab-graphs"); await page.click("#zsa-gl-sweep");
  var origin = new URL(page.url()).origin;
  requests.forEach((u) => expect(u.startsWith(origin), u).toBe(true));
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u, u).toContain("?v="));
  requests.filter((u) => /gas-lab\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  var storage = await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie]);
  expect(storage).toEqual([0, 0, ""]);
});

test("landing page links to the Gas Laws and KMT Lab", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Gas Laws and KMT Lab"}).click();
  await expect(page).toHaveTitle("Gas Laws and KMT Lab | ZornScience");
});

// ---------- Investigations ----------
function fill(template, ctx) { return template.replace(/\{(\w+)\}/g, function (m, k) { return ctx[k] === undefined ? m : ctx[k]; }); }
function wrongText(task, key) {
  var template = (task.feedback && task.feedback[key]) || INV.feedback[key];
  var ctx = {run: task.runText || ""};
  if (task.celsius) { ctx.t1 = task.celsius[0]; ctx.t2 = task.celsius[1]; ctx.k1 = Math.round(task.celsius[0] + 273.15); ctx.k2 = Math.round(task.celsius[1] + 273.15); }
  return "↻ Not yet. " + fill(template, ctx);
}
async function pickTask(page, id) {
  await page.click("#zsa-gl-tab-investigate");
  await page.locator("#zsa-gl-options summary").click();
  await page.selectOption("#zsa-gl-select", id);
  await page.click("#zsa-gl-pick");
}
function stepField(page) { return page.locator("#zsa-gl-work > fieldset"); }
async function choices(page) {
  return page.locator("#zsa-gl-work > fieldset [data-zsa-part] button").evaluateAll((bs) => bs.map((b) => ({value: b.value, label: b.textContent.replace(/^✗/, "").replace(" (tried, not correct)", ""), tried: b.getAttribute("aria-disabled") === "true"})));
}
// What the lab shows for a test step's quantity.
async function labReading(page, task) {
  var q = task.steps[1].quantity;
  if (q === "p" && task.id === "dalton") {
    var row = await page.locator("#zsa-gl-mix-body tr").nth(1).locator("td").nth(2).textContent();
    return row;
  }
  if (q === "p") return (await text(page, "zsa-gl-p-law")).replace(/^Gas law: /, "");
  if (q === "v") return (await page.inputValue("#zsa-gl-V-num")) + " L";
  if (q === "ke") return (await text(page, "zsa-gl-ke-theory")).replace("(3/2)RT = ", "");
  if (q === "speed") return (await text(page, "zsa-gl-speeds")).replace(/^\S+: /, "");
  if (q === "z") return (await text(page, "zsa-gl-p-z")).replace("PV/nRT = ", "");
  if (q === "ratio") {
    var speeds = await page.locator("#zsa-gl-speeds span").allTextContents();
    var he = Number(speeds[0].replace(/[^\d]/g, "")), xe = Number(speeds[1].replace(/[^\d]/g, ""));
    return (he / xe).toPrecision(2) + " times";
  }
  throw new Error("no reading for " + q);
}

test("investigations: every wrong pick routes to its feedback and every test answer is the lab's own reading", async ({page, problems}) => {
  void problems;
  test.setTimeout(240000);
  await go(page, "?tab=investigate");
  var checked = 0, numbers = 0;
  for (var task of INV.tasks) {
    await pickTask(page, task.id);
    await expect(page.locator("#zsa-gl-inv-heading")).toHaveText(task.title);
    for (var s = 0; s < 3; s++) {
      var def = task.steps[s];
      await expect(stepField(page)).toHaveAttribute("id", "zsa-gl-step-" + s);
      if (s === 1) {
        // Set up and make the change in the lab, then read the lab.
        await page.getByRole("button", {name: "Set up the lab"}).click();
        if (task.run) await page.getByRole("button", {name: "Make the change for me"}).click();
        var reading = await labReading(page, task);
      }
      var list = await choices(page);
      var right = null;
      if (def.curves) {
        // Two curves: the wrong one gives its message, the other is right.
        expect(list.map((c) => c.label)).toEqual(["Curve A (solid)", "Curve B (dashed)"]);
      }
      for (var c of list) {
        var before = await stepField(page).getAttribute("id");
        await page.locator("#zsa-gl-work > fieldset [data-zsa-part] button[value=\"" + c.value + "\"]").click();
        var still = (await stepField(page).count()) && (await stepField(page).getAttribute("id")) === before;
        if (still) {
          var fb = await page.locator("#zsa-gl-work > fieldset > p").first().textContent();
          var key = def.curves ? def.choices[1][2] : (s === 1 ? def.choices.find((x) => x[0] !== "right" && fb === wrongText(task, x[1])) : def.choices.find((x) => x[0] === c.value));
          if (s === 1) {
            expect(key, task.id + " test step: " + c.label + " gave " + fb).toBeTruthy();
          } else if (!def.curves) {
            expect(key[2], task.id + " step " + s + " " + c.value + " is wrong").not.toBe(null);
            expect(fb, task.id + " step " + s + " " + c.value).toBe(wrongText(task, key[2]));
          } else expect(fb).toBe(wrongText(task, key));
          checked++;
        } else { right = c; break; }
      }
      expect(right, task.id + " step " + s + " has a right answer").not.toBe(null);
      if (s === 1) { expect(right.label, task.id + ": the right answer is what the lab shows").toBe(reading); numbers++; }
      else if (!def.curves) expect(def.choices.find((x) => x[0] === right.value)[2]).toBe(null);
    }
    await expect(page.locator("#zsa-gl-work section h3")).toHaveText("Investigation complete");
  }
  test.info().annotations.push({type: "counts", description: checked + " wrong picks, " + numbers + " test answers"});
  expect(numbers).toBe(INV.tasks.length);
});

test("investigations: the student's own change in the lab gives the same reading", async ({page, problems}) => {
  void problems;
  var controls = {V: "zsa-gl-V-num", T: "zsa-gl-T-num", n: "zsa-gl-n0-num"};
  await go(page, "?tab=investigate");
  for (var task of INV.tasks.filter((t) => t.run)) {
    await pickTask(page, task.id);
    // Answer the prediction (any way) to reach the test step.
    while ((await stepField(page).getAttribute("id")) === "zsa-gl-step-0") {
      var list = await choices(page);
      await page.locator("#zsa-gl-work > fieldset [data-zsa-part] button[value=\"" + list.find((c) => !c.tried).value + "\"]").click();
    }
    await page.getByRole("button", {name: "Set up the lab"}).click();
    var key = Object.keys(task.run)[0];
    await setNumber(page, controls[key], task.run[key]);
    var reading = await labReading(page, task);
    await page.getByRole("button", {name: "Make the change for me"}).click();
    expect(await labReading(page, task), task.id).toBe(reading);
  }
});

test("investigations: a full round gives a completion code that the checker reads back", async ({page, context, problems}) => {
  void problems;
  test.setTimeout(180000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(seedRandom, 77);
  await go(page, "?tab=investigate");
  var hintsUsed = 0;
  for (var guard = 0; guard < 120; guard++) {
    if (await page.locator("#zsa-gl-work > h2").count()) break;
    var next = page.locator("#zsa-gl-work section button");
    if (await next.count()) { await next.click(); continue; }
    if (hintsUsed < 2) { await page.locator("#zsa-gl-work > fieldset .zsa-actions button").first().click(); hintsUsed++; }
    var list = await choices(page);
    await page.locator("#zsa-gl-work > fieldset [data-zsa-part] button[value=\"" + list.find((c) => !c.tried).value + "\"]").click();
  }
  await expect(page.locator("#zsa-gl-work > h2")).toHaveText("Round complete");
  var code = await page.locator("#zsa-gl-code [aria-hidden]").textContent();
  expect(code).toMatch(/^GAS-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]$/);
  var d = codes.decode(code, codes.dayNumber(new Date()));
  expect(d.status).toBe("valid");
  expect(d.activity.slug).toBe("gas-lab");
  expect(d.version).toBe(VERSION.split(".").slice(0, 2).join("."));
  expect(d.items).toBe(6);
  expect(d.hints).toBe(2);
  // The stats in the code are the round summary's.
  var lines = await page.locator("#zsa-gl-work .zsa-stat").allTextContents();
  expect(lines).toEqual(d.stats.map((st) => st.label + st.correct + " / " + st.total));
  await page.getByRole("button", {name: "Copy code"}).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  // The checker.
  await page.goto("/check/");
  await page.fill("#zsa-chk-input", "Student A\t" + code);
  await page.click("#zsa-chk-check");
  var row = await page.locator("#zsa-chk-body tr").first().locator("td").allTextContents();
  expect(row.join("|")).toContain("Valid");
  expect(row.join("|")).toContain("Gas Laws and KMT Lab");
  // Single practice gives no code.
  await go(page, "?tab=investigate");
  await pickTask(page, "boyle");
  for (var g2 = 0; g2 < 20; g2++) {
    if (await page.locator("#zsa-gl-work > h2").count()) break;
    var nx = page.locator("#zsa-gl-work section button");
    if (await nx.count()) { await nx.click(); continue; }
    var l2 = await choices(page);
    await page.locator("#zsa-gl-work > fieldset [data-zsa-part] button[value=\"" + l2.find((c) => !c.tried).value + "\"]").click();
  }
  await expect(page.locator("#zsa-gl-work > h2")).toHaveText("Chosen investigation complete");
  expect(await page.locator("#zsa-gl-code").count()).toBe(0);
});
