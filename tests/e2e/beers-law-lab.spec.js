// Beer's Law Spectrophotometer Lab (beers-law-lab/): the default setup, zeroing with the blank, measuring standards
// against the model, the table and removing standards, the wavelength lock, the calibration curve and best-fit line,
// a random unknown (seeded), checking answers with hints, showing the answer, new unknowns, changing the solution,
// CSV export, printing, layout and 44 px targets, axe-core at two sizes, deep links, embed mode, network and storage,
// and the landing page link. Selects by role, label, id and text, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var M = require("../../beers-law-lab/model.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/ap-chemistry/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "beers-law-lab", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];
var CO = M.solution("cocl2");

async function go(page, query) {
  await page.goto("/beers-law-lab/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Beer's Law Spectrophotometer Lab"})).toBeVisible();
}
function live(page) { return page.locator("#zsa-bl-live"); }
function readout(page, id) { return page.locator("#zsa-bl-" + id + "-value"); }
function graph(page) { return page.getByRole("img", {name: /^Calibration curve, absorbance versus concentration/}); }
function button(page, name) { return page.getByRole("button", {name: name, exact: true}); }
async function zero(page) { await button(page, "Insert blank and zero").click(); }
async function standard(page, c) {
  await page.getByLabel("Standard concentration (M)").fill(String(c));
  await button(page, "Measure standard").click();
}
async function absorbance(page) { return parseFloat(await readout(page, "a").textContent()); }
// Within the noise: 4 standard deviations of 0.002 + 0.4% of A.
function noisy(value, ideal) { expect(Math.abs(value - ideal), value + " vs " + ideal).toBeLessThanOrEqual(4 * (0.002 + 0.004 * ideal) + 0.0005); }
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// The true unknown, read from the page after Show the answer.
async function reveal(page) {
  await button(page, "Show the answer").click();
  return parseFloat((await page.locator("#zsa-bl-feedback").textContent()).match(/The unknown is ([\d.]+) M/)[1]);
}

test("opens with cobalt(II) chloride at 510 nm, not zeroed, and no data", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page.getByLabel("Solution", {exact: true})).toHaveValue("cocl2");
  await expect(page.locator("#zsa-bl-solution option")).toHaveText(["Cobalt(II) chloride, CoCl₂", "Nickel(II) chloride, NiCl₂", "Copper(II) sulfate, CuSO₄"]);
  await expect(page.locator("#zsa-bl-solution-text")).toHaveText(M.solutionText(CO));
  await expect(page.getByLabel(/^Wavelength/)).toHaveValue("510");
  await expect(page.getByLabel(/^Wavelength/)).toBeEnabled();
  await expect(page.getByLabel(/^Wavelength/)).toHaveAttribute("aria-valuetext", "510 nm (green)");
  await expect(button(page, "Use λmax (510 nm)")).toBeEnabled();
  await expect(readout(page, "a")).toHaveText("Zero first");
  await expect(readout(page, "t")).toHaveText("-");
  await expect(readout(page, "nm")).toHaveText("510 nm (green)");
  await expect(readout(page, "cuvette")).toHaveText("Empty");
  await expect(page.locator("#zsa-bl-status")).toHaveText("Start by inserting the blank (distilled water) and zeroing the spectrophotometer.");
  await expect(page.getByRole("img", {name: "Spectrophotometer set to 510 nm (green light). Not zeroed yet. The sample holder is empty."})).toBeVisible();
  await expect(graph(page)).toHaveAccessibleName(/0 to 0\.350 M, absorbance 0 to 1\.0\. No standards yet\.$/);
  await expect(page.locator("#zsa-bl-rows")).toHaveText("No data yet. Measure a standard to start.");
  await expect(button(page, "Clear standards")).toBeDisabled();
  await expect(button(page, "Best-fit line")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#zsa-bl-equation")).toHaveText("Measure two or more standards at different concentrations to draw the best-fit line.");
  await expect(page.locator("#zsa-bl-task")).toContainText("A sample of cobalt(ii) chloride with an unknown concentration is ready.");
  await expect(page.locator("#zsa-bl-solved")).toHaveText("Unknowns found: 0. Each new unknown has a different random concentration.");
});

test("measuring needs the blank; zeroing reads 0.000 and 100.0%", async ({page, problems}) => {
  void problems;
  await go(page);
  await standard(page, 0.1);
  await expect(page.locator("#zsa-bl-status")).toHaveText("Zero the spectrophotometer with the blank first.");
  await expect(live(page)).toHaveText("Zero the spectrophotometer with the blank first.");
  await button(page, "Measure the unknown").click();
  await expect(page.locator("#zsa-bl-rows tr")).toHaveCount(1);
  await zero(page);
  await expect(readout(page, "a")).toHaveText("0.000");
  await expect(readout(page, "t")).toHaveText("100.0%");
  await expect(readout(page, "cuvette")).toHaveText("Blank (distilled water)");
  await expect(live(page)).toHaveText("Blank inserted and zeroed: absorbance 0.000, transmittance 100.0%. Now measure your standards.");
  await expect(button(page, "Insert blank and zero again")).toBeVisible();
  await expect(page.locator("#zsa-bl-instrument text").filter({hasText: /^A /})).toHaveText("A 0.000");
});

test("standards: readings follow Beer's law, fill the table and the graph, and draw the best-fit line", async ({page, problems}) => {
  void problems;
  await page.addInitScript(seedRandom, 21);
  await go(page);
  await zero(page);
  var values = [];
  for (var c of [0.05, 0.1, 0.15, 0.2]) {
    await standard(page, c);
    var a = await absorbance(page);
    noisy(a, M.reading(CO, c, 510));
    values.push([c, a]);
    await expect(readout(page, "t")).toHaveText(M.fmt(M.transmittance(a), 1) + "%");
  }
  await expect(readout(page, "cuvette")).toHaveText("Standard, 0.200 M (" + M.sampleColor(CO, 0.2).name + ")");
  await expect(live(page)).toHaveText("Standard 4: 0.200 M, absorbance " + values[3][1].toFixed(3) + ", transmittance " + M.fmt(M.transmittance(values[3][1]), 1) + "%. Added to the calibration curve.");
  var rows = page.locator("#zsa-bl-rows tr");
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(1)).toHaveText("Standard 20.100" + values[1][1].toFixed(3) + "Remove");
  await expect(page.locator("#zsa-bl-graph circle")).toHaveCount(4);
  var fit = M.fit(values);
  await expect(page.locator("#zsa-bl-equation")).toHaveText(M.equation(fit) + ", R² = " + M.fmt(fit.r2, 4) + " (c in M)");
  await expect(graph(page)).toHaveAccessibleName(new RegExp("4 standards from 0\\.050 to 0\\.200 M.*Best-fit line A = " + M.sig(fit.m, 4).replace(".", "\\.")));
  await expect(page.locator("#zsa-bl-insight")).toContainText("Your standards fall on a straight line");
  expect(Math.abs(fit.m - 4.8)).toBeLessThan(0.1);
  // The best-fit line toggle.
  await button(page, "Best-fit line").click();
  await expect(button(page, "Best-fit line")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#zsa-bl-equation")).toHaveText("Best-fit line hidden. Work out the slope from your data.");
  await expect(live(page)).toHaveText("Best-fit line hidden.");
  await expect(graph(page)).not.toHaveAccessibleName(/Best-fit line/);
  await button(page, "Best-fit line").click();
  await expect(live(page)).toHaveText("Best-fit line shown. " + M.equation(fit) + ", R² = " + M.fmt(fit.r2, 4) + ".");
});

test("invalid concentrations, the 12-standard limit, removing and clearing standards", async ({page, problems}) => {
  void problems;
  await go(page);
  await zero(page);
  for (var bad of ["", "-0.1", "0.4"]) {
    await standard(page, bad);
    await expect(page.locator("#zsa-bl-status")).toHaveText("Enter a standard concentration from 0 to 0.350 M.");
  }
  await standard(page, "0.0504");
  await expect(page.locator("#zsa-bl-rows tr").first()).toContainText("0.050");
  for (var i = 2; i <= 12; i++) await standard(page, (0.02 * i).toFixed(2));
  await standard(page, 0.3);
  await expect(page.locator("#zsa-bl-status")).toHaveText("You have 12 standards, the most this lab keeps. Remove one first.");
  await expect(page.locator("#zsa-bl-rows tr")).toHaveCount(12);
  // Removing the second standard renumbers the rest and moves focus to the next Remove button.
  await page.getByRole("button", {name: "Remove standard 2, 0.040 M"}).click();
  await expect(page.locator("#zsa-bl-rows tr")).toHaveCount(11);
  await expect(live(page)).toHaveText("Removed standard 2, 0.040 M. 11 standards left.");
  await expect(page.getByRole("button", {name: "Remove standard 2, 0.060 M"})).toBeFocused();
  await expect(page.getByLabel(/^Wavelength/)).toBeDisabled();
  await expect(page.locator("#zsa-bl-wavelength-note")).toHaveText(/^Clear your standards to change the wavelength\./);
  await button(page, "Clear standards").click();
  await expect(page.locator("#zsa-bl-rows")).toHaveText("No data yet. Measure a standard to start.");
  await expect(live(page)).toHaveText("Standards cleared. You can change the wavelength again.");
  await expect(page.getByLabel("Standard concentration (M)")).toBeFocused();
  await expect(page.getByLabel(/^Wavelength/)).toBeEnabled();
});

test("wavelength: the reading follows ε at each wavelength, the light changes color, and standards lock it", async ({page, problems}) => {
  void problems;
  await page.addInitScript(seedRandom, 4);
  await go(page);
  await zero(page);
  var slider = page.getByLabel(/^Wavelength/);
  await slider.fill("600");
  await expect(readout(page, "nm")).toHaveText("600 nm (orange)");
  await expect(readout(page, "a")).toHaveText("0.000");
  await standard(page, 0.3);
  noisy(await absorbance(page), M.reading(CO, 0.3, 600));
  await expect(slider).toBeDisabled();
  await expect(button(page, "Use λmax (510 nm)")).toBeDisabled();
  await expect(page.locator("#zsa-bl-graph")).toContainText("Absorbance at 600 nm");
  await page.getByRole("button", {name: /^Remove standard 1/}).click();
  await expect(slider).toBeEnabled();
  // Sweeping with a standard in the cuvette: the most absorbance is at λmax.
  await standard(page, 0.2);
  await page.getByRole("button", {name: /^Remove standard 1/}).click();
  await expect(readout(page, "cuvette")).toHaveText(/^Standard, 0\.200 M/);
  for (var nm of [450, 510, 560, 650]) {
    await slider.fill(String(nm));
    noisy(await absorbance(page), M.reading(CO, 0.2, nm));
  }
  await expect(live(page)).toHaveText(/^Wavelength 650 nm \(red\)\. Absorbance /);
  await expect(page.getByRole("img", {name: /^Spectrophotometer set to 650 nm \(red light\)\. The cuvette holds a 0\.200 M standard/})).toBeVisible();
  await button(page, "Use λmax (510 nm)").click();
  await expect(slider).toHaveValue("510");
  await button(page, "Use λmax (510 nm)").click();
  await expect(live(page)).toHaveText("Already at λmax, 510 nm.");
  // An unknown measured at another wavelength must be measured again.
  await button(page, "Measure the unknown").click();
  await expect(page.locator("#zsa-bl-rows tr")).toHaveCount(1);
  await slider.fill("520");
  await expect(live(page)).toHaveText(/Measure the unknown again at this wavelength\.$/);
  await expect(page.locator("#zsa-bl-rows")).toHaveText("No data yet. Measure a standard to start.");
  // Infrared light is drawn dashed.
  await slider.fill("900");
  await expect(readout(page, "nm")).toHaveText("900 nm (infrared, invisible)");
});

test("the unknown: random each time, checked with hints, shown, and replaced", async ({page, problems}) => {
  void problems;
  await page.addInitScript(seedRandom, 7);
  await go(page);
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText("Measure the unknown first, then use its absorbance.");
  await zero(page);
  var pts = [];
  for (var c of [0.05, 0.1, 0.2, 0.3]) { await standard(page, c); pts.push([c, await absorbance(page)]); }
  await button(page, "Measure the unknown").click();
  var a = await absorbance(page);
  await expect(readout(page, "cuvette")).toHaveText(/^Unknown \(/);
  await expect(live(page)).toHaveText("Unknown: absorbance " + a.toFixed(3) + ", transmittance " + M.fmt(M.transmittance(a), 1) + "%. Use your calibration curve to find its concentration.");
  await expect(page.locator("#zsa-bl-task")).toHaveText("The unknown's absorbance is " + a.toFixed(3) + " at 510 nm. Use your calibration curve to calculate its concentration.");
  await expect(page.locator("#zsa-bl-rows tr").last()).toHaveText("Unknown?" + a.toFixed(3));
  await expect(graph(page)).toHaveAccessibleName(new RegExp("The unknown's absorbance, " + a.toFixed(3).replace(".", "\\.") + ", is drawn as a horizontal line\\.$"));
  var answer = page.getByLabel("Concentration of the unknown (M)");
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText("Enter the unknown's concentration in M.");
  await answer.fill(String(a));
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback")).toContainText("That is the unknown's absorbance");
  var fit = M.fit(pts), mine = (a - fit.b) / fit.m;
  await answer.fill((mine * 1000).toFixed(1));
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback")).toContainText("Check the units");
  await expect(live(page)).toHaveText(/^Not yet\. Check the units/);
  // The right answer from the line on the page.
  await answer.fill(mine.toFixed(3));
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback .zsa-bl-ok")).toHaveText(/^✓ Correct\. The unknown is [\d.]+ M\. Your best-fit line gives c = \(A − b\) ÷ m = /);
  await expect(page.locator("#zsa-bl-solved")).toHaveText(/^Unknowns found: 1\./);
  var text = await page.locator("#zsa-bl-feedback").textContent(), truth = parseFloat(text.match(/The unknown is ([\d.]+) M/)[1]);
  expect(truth).toBeGreaterThanOrEqual(0.053);
  expect(truth).toBeLessThanOrEqual(0.297);
  noisy(a, M.reading(CO, truth, 510));
  await expect(page.locator("#zsa-bl-rows tr").last()).toHaveText("Unknown" + truth.toFixed(3) + a.toFixed(3));
  await expect(page.locator("#zsa-bl-graph .zsa-bl-unk-point")).toHaveCount(1);
  await expect(graph(page)).toHaveAccessibleName(new RegExp("The unknown is marked at " + truth.toFixed(3).replace(".", "\\.") + " M\\.$"));
  // Checking again does not count twice.
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-solved")).toHaveText(/^Unknowns found: 1\./);
  // A new unknown: a different concentration, the standards kept.
  await button(page, "New unknown").click();
  await expect(live(page)).toHaveText("New unknown cobalt(ii) chloride sample ready. Measure it, then find its concentration.");
  await expect(answer).toHaveValue("");
  await expect(page.locator("#zsa-bl-feedback")).toBeHidden();
  await expect(page.locator("#zsa-bl-rows tr")).toHaveCount(4);
  await expect(page.locator("#zsa-bl-graph .zsa-bl-unk-point")).toHaveCount(0);
  await button(page, "Measure the unknown").click();
  var next = await reveal(page);
  expect(Math.abs(next - truth)).toBeGreaterThanOrEqual(0.05 * CO.max - 1e-9);
  await expect(page.locator("#zsa-bl-feedback")).toContainText(/Your best-fit line gives c = .* from the actual value\./);
  // Found after it was shown does not count.
  await answer.fill(next.toFixed(3));
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback .zsa-bl-ok")).toBeVisible();
  await expect(page.locator("#zsa-bl-solved")).toHaveText(/^Unknowns found: 1\./);
});

test("a wrong answer with few standards, and showing the answer before measuring", async ({page, problems}) => {
  void problems;
  await page.addInitScript(seedRandom, 9);
  await go(page);
  await zero(page);
  await standard(page, 0.1);
  await button(page, "Measure the unknown").click();
  await page.getByLabel("Concentration of the unknown (M)").fill("0.9");
  await button(page, "Check my answer").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText("Not yet. Measure at least two standards to make a calibration curve, then find where the unknown's absorbance meets the line.");
  await expect(page.locator("#zsa-bl-insight")).toHaveText(/^One standard gives one point/);
  await button(page, "New unknown").click();
  await button(page, "Show the answer").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText(/^The unknown is [\d.]+ M\. Measure it to see what your calibration curve gives\.$/);
  await expect(page.locator("#zsa-bl-graph .zsa-bl-unk-line")).toHaveCount(1);
});

test("changing the solution clears the standards, sets λmax and draws a new unknown", async ({page, problems}) => {
  void problems;
  await go(page);
  await zero(page);
  await standard(page, 0.1);
  await page.getByLabel("Solution", {exact: true}).selectOption("cuso4");
  await expect(live(page)).toHaveText("New solution: copper(ii) sulfate, wavelength set to its λmax, 780 nm. Your standards were cleared and a new unknown is ready. The spectrophotometer is still zeroed.");
  await expect(page.locator("#zsa-bl-rows")).toHaveText("No data yet. Measure a standard to start.");
  await expect(page.getByLabel(/^Wavelength/)).toHaveValue("780");
  await expect(readout(page, "nm")).toHaveText("780 nm (deep red)");
  await expect(readout(page, "cuvette")).toHaveText("Empty");
  await expect(page.locator("#zsa-bl-conc-help")).toHaveText("From 0 to 0.150 M, to the nearest 0.001 M. Up to 12 standards.");
  await expect(graph(page)).toHaveAccessibleName(/0 to 0\.150 M/);
  await standard(page, 0.1);
  noisy(await absorbance(page), M.reading(M.solution("cuso4"), 0.1, 780));
  await standard(page, 0.2);
  await expect(page.locator("#zsa-bl-status")).toHaveText("Enter a standard concentration from 0 to 0.150 M.");
  var c = await reveal(page);
  expect(c).toBeGreaterThanOrEqual(0.022);
  expect(c).toBeLessThanOrEqual(0.128);
});

test("CSV export and printing", async ({page, problems}) => {
  void problems;
  await page.addInitScript(seedRandom, 2);
  await go(page);
  await zero(page);
  var pts = [];
  for (var c of [0.05, 0.15]) { await standard(page, c); pts.push([c, await absorbance(page)]); }
  await button(page, "Measure the unknown").click();
  var a = await absorbance(page);
  var [download] = await Promise.all([page.waitForEvent("download"), button(page, "Download data (CSV)").click()]);
  expect(download.suggestedFilename()).toBe("zornscience-beers-law-data.csv");
  expect(fs.readFileSync(await download.path(), "utf8")).toBe(M.csv({wavelength: 510, points: pts, unknownA: a}));
  await expect(live(page)).toHaveText("Data downloaded as zornscience-beers-law-data.csv: 2 standards and the unknown.");
  var long = Array.from({length: 30}, (_, k) => "Line " + (k + 1) + " of my explanation.").join("\n");
  await page.getByLabel("Explain using evidence from your data.").fill(long);
  await page.getByLabel("Concentration of the unknown (M)").fill("0.123");
  await page.emulateMedia({media: "print"});
  var fit = M.fit(pts);
  await expect(page.locator("#zsa-bl-print-summary")).toHaveText("Beer's law lab: cobalt(ii) chloride at 510 nm, 1.00 cm cuvette. 2 standards. Best-fit line: " + M.equation(fit) +
    " (R² = " + M.fmt(fit.r2, 4) + "). Unknown's absorbance: " + a.toFixed(3) + ". My answer: 0.123 M.");
  await expect(page.locator("#zsa-bl-print-reflection")).toHaveText(long);
  await expect(page.locator("#zsa-bl-print-reflection")).toBeVisible();
  await expect(page.getByLabel("Explain using evidence from your data.")).toBeHidden();
  await expect(button(page, "Measure standard")).toBeHidden();
  await expect(graph(page)).toBeVisible();
  await expect(page.locator("#zsa-bl-rows tr")).toHaveCount(3);
  await page.emulateMedia({media: "screen"});
  await page.evaluate(() => { window.print = () => document.body.setAttribute("data-printed", "yes"); });
  await button(page, "Print lab").click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
});

test("layout: no sideways scrolling from 320 to 1920 px and at 200% zoom; 44 px targets; readable labels", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1024, 768], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page);
    await zero(page);
    for (var c of [0.05, 0.1, 0.2, 0.3]) await standard(page, c);
    await button(page, "Measure the unknown").click();
    await page.getByLabel("Concentration of the unknown (M)").fill("0.1");
    await button(page, "Check my answer").click();
    await button(page, "Show the answer").click();
    var sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, w + " px").toBeLessThanOrEqual(w);
    var small = await page.locator("main button:visible, main select:visible, main input:visible").evaluateAll((els) =>
      els.map((e) => { var r = e.getBoundingClientRect(); return {name: e.textContent.trim() || e.id, w: r.width, h: r.height}; })
        .filter((r) => r.w < 44 || r.h < 44));
    expect(small, w + " px").toEqual([]);
    // Queried and measured in one script, so a redraw from the graph's resize observer cannot detach them midway.
    var labels = await page.evaluate(() => Math.min(...Array.from(document.querySelectorAll(".zsa-bl-tick, .zsa-bl-label, .zsa-bl-label-dark")).map((e) => e.getBoundingClientRect().height)));
    expect(labels, w + " px label height").toBeGreaterThanOrEqual(9);
    var out = await page.locator("#zsa-bl-graph").evaluate((g) => {
      var b = g.getBoundingClientRect();
      return Array.from(g.querySelectorAll(".zsa-bl-unk-label")).filter((t) => { var r = t.getBoundingClientRect(); return r.left < b.left - 1 || r.right > b.right + 1; }).map((t) => t.textContent);
    });
    expect(out, w + " px").toEqual([]);
  }
});

test("axe-core: no violations at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page);
    await audit(page, w + " start");
    await zero(page);
    for (var c of [0.05, 0.15, 0.25]) await standard(page, c);
    await button(page, "Measure the unknown").click();
    await page.getByLabel("Concentration of the unknown (M)").fill("0.2");
    await button(page, "Check my answer").click();
    await page.getByLabel("Explain using evidence from your data.").fill("The points make a line.");
    await audit(page, w + " measured");
    await button(page, "Show the answer").click();
    await audit(page, w + " shown");
    await page.emulateMedia({media: "print"});
    await audit(page, w + " print");
    await page.emulateMedia({media: "screen"});
  }
});

test("deep links, back link, embed mode, network and storage", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page);
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", DEFAULT_BACK);
  var origin = new URL(page.url()).origin;
  requests.forEach((u) => expect(u.startsWith(origin), u).toBe(true));
  requests.filter((u) => /beers-law-lab\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  await zero(page);
  await standard(page, 0.1);
  await page.getByLabel("Explain using evidence from your data.").fill("Notes");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.reload();
  await expect(page.getByLabel("Explain using evidence from your data.")).toHaveValue("");
  await expect(page.locator("#zsa-bl-rows")).toHaveText("No data yet. Measure a standard to start.");

  await go(page, "?solution=nicl2&wavelength=720&fit=0");
  await expect(page.getByLabel("Solution", {exact: true})).toHaveValue("nicl2");
  await expect(page.getByLabel(/^Wavelength/)).toHaveValue("720");
  await expect(button(page, "Best-fit line")).toHaveAttribute("aria-pressed", "false");
  await go(page, "?solution=nicl2");
  await expect(page.getByLabel(/^Wavelength/)).toHaveValue("395");
  await go(page, "?solution=kmno4&wavelength=1200&fit=no");
  await expect(page.getByLabel("Solution", {exact: true})).toHaveValue("cocl2");
  await expect(page.getByLabel(/^Wavelength/)).toHaveValue("510");
  await expect(button(page, "Best-fit line")).toHaveAttribute("aria-pressed", "true");
  await go(page, "?wavelength=5e2");
  await expect(page.getByLabel(/^Wavelength/)).toHaveValue("510");

  var lesson = "https://zornscience.org/science/ap-chemistry/unit-3-properties-of-substances-and-mixtures/";
  await go(page, "?from=" + encodeURIComponent(lesson));
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", lesson);
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: "← Back to the lesson"}), bad).toHaveAttribute("href", DEFAULT_BACK);
  }
  await go(page, "?embed=1&solution=cuso4&from=" + encodeURIComponent(lesson));
  await expect(page.locator("#zsa-bl-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByLabel("Solution", {exact: true})).toHaveValue("cuso4");
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
});

test("landing page links to the Beer's Law Spectrophotometer Lab", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Beer's Law Spectrophotometer Lab"}).click();
  await expect(page).toHaveTitle("Beer's Law Spectrophotometer Lab | ZornScience");
});
