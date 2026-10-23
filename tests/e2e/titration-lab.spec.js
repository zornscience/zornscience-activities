// Virtual Titration Simulator (titration-lab/): the default setup and readouts against the model, single drops, the
// stopcock with a fake clock (flow rates, one animation loop however fast it is opened and closed), color changes,
// an empty burette and refilling, setup changes, an unknown concentration, the endpoint, checking answers, key
// points, CSV export, printing, layout and 44 px targets, axe-core at two sizes, deep links, embed mode, network and
// storage, and the landing page link. Selects by role, label, id and text, and fails on console errors or CSP
// violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var M = require("../../titration-lab/chem.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/ap-chemistry/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "titration-lab", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];
var DEFAULT = {analyte: "acetic", ca: 0.1, va: 25, titrant: "naoh", ct: 0.1};

async function go(page, query) {
  await page.goto("/titration-lab/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Virtual Titration Simulator"})).toBeVisible();
}
function live(page) { return page.locator("#zsa-ti-live"); }
function readout(page, id) { return page.locator("#zsa-ti-" + id + "-value"); }
async function added(page) { return parseFloat(await readout(page, "v").textContent()); }
function flow(page, name) { return page.getByRole("button", {name: name, exact: true}); }
function graph(page) { return page.getByRole("img", {name: /^pH versus volume of titrant graph/}); }
async function fakeClock(page) {
  await page.clock.install({time: new Date("2026-10-18T12:00:00")});
  await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("opens with 25.00 mL of 0.100 M acetic acid, 0.100 M NaOH and phenolphthalein", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page.getByLabel("Analyte", {exact: true})).toHaveValue("acetic");
  await expect(page.getByLabel("Titrant", {exact: true})).toHaveValue("naoh");
  await expect(page.getByLabel("Indicator", {exact: true})).toHaveValue("phenolphthalein");
  await expect(page.locator("#zsa-ti-titrant option")).toHaveText(["Sodium hydroxide, NaOH (strong base)", "Ammonia, NH₃ (weak base)"]);
  await expect(page.locator("#zsa-ti-reaction")).toHaveText("Reaction: HC₂H₃O₂ + OH⁻ → C₂H₃O₂⁻ + H₂O");
  await expect(page.locator("#zsa-ti-indicator-text")).toHaveText("Phenolphthalein is colorless below pH 8.2 and pink above pH 10.0.");
  await expect(readout(page, "ph")).toHaveText(M.fmt(M.pH(DEFAULT, 0)));
  await expect(readout(page, "ph")).toHaveText("2.88");
  await expect(readout(page, "v")).toHaveText("0.00 mL");
  await expect(readout(page, "reading")).toHaveText("0.00 mL");
  await expect(readout(page, "color")).toHaveText("colorless");
  await expect(flow(page, "Closed")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", {name: "Refill burette"})).toBeDisabled();
  await expect(graph(page)).toHaveAccessibleName(/0 to 50 mL, pH 0 to 14\. No data yet/);
  await expect(page.getByRole("img", {name: /^Burette reading 0\.00 mL, stopcock closed\. The flask holds 25\.00 mL of colorless solution\. The pH meter reads 2\.88\.$/})).toBeVisible();
  await expect(page.getByLabel("Equivalence point volume (mL)")).toBeVisible();
  await expect(page.getByLabel("pKa of HC₂H₃O₂, from the half-equivalence point")).toBeVisible();
  await expect(page.locator("#zsa-ti-questions input")).toHaveCount(2);
});

test("single drops: 0.05 mL each, readouts, the curve and announcements", async ({page, problems}) => {
  void problems;
  await go(page);
  var drop = page.getByRole("button", {name: "Add one drop"});
  for (var i = 0; i < 3; i++) await drop.click();
  await expect(readout(page, "v")).toHaveText("0.15 mL");
  await expect(readout(page, "reading")).toHaveText("0.15 mL");
  await expect(readout(page, "ph")).toHaveText(M.fmt(M.pH(DEFAULT, 0.15)));
  await expect(live(page)).toHaveText("One drop. 0.15 mL added, pH " + M.fmt(M.pH(DEFAULT, 0.15)) + ", colorless.");
  await expect(page.locator("#zsa-ti-graph .zsa-ti-data-dot")).toHaveCount(4);
  await expect(graph(page)).toHaveAccessibleName(/Your data: 4 points from 0\.00 to 0\.15 mL/);
  await expect(page.getByRole("button", {name: "Refill burette"})).toBeEnabled();
});

test("the stopcock: flow rates in real time, color changes, closing and one animation loop", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => {
    var raf = window.requestAnimationFrame.bind(window);
    window.__rafCalls = 0;
    window.requestAnimationFrame = function (cb) { window.__rafCalls++; return raf(cb); };
  });
  await fakeClock(page);
  await go(page);
  await flow(page, "Slow stream").click();
  await expect(flow(page, "Slow stream")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#zsa-ti-status")).toHaveText("Stopcock open: slow stream.");
  await page.clock.runFor(2000);
  var v1 = await added(page);
  expect(v1).toBeGreaterThan(0.9);
  expect(v1).toBeLessThanOrEqual(1.0);
  await flow(page, "Closed").click();
  await page.clock.runFor(100);
  await expect(live(page)).toHaveText(new RegExp("^Stopcock closed at " + v1.toFixed(2) + " mL added, pH "));
  await page.clock.runFor(1000);
  expect(await added(page)).toBe(v1);
  // Twelve quick changes in one task (no frame between them) end open in a fast stream: one second later the
  // volume has grown by 2 mL, and about one callback ran per frame.
  await page.evaluate(() => {
    var b = Array.from(document.querySelectorAll("[data-flow]"));
    for (var i = 0; i < 12; i++) b[i % 2 ? 3 : 0].click();
  });
  await expect(flow(page, "Fast stream")).toHaveAttribute("aria-pressed", "true");
  var calls = await page.evaluate(() => window.__rafCalls);
  await page.clock.runFor(1000);
  var v2 = await added(page);
  expect(v2 - v1).toBeGreaterThan(1.9);
  expect(v2 - v1).toBeLessThanOrEqual(2.0);
  var per = await page.evaluate((c) => window.__rafCalls - c, calls);
  expect(per).toBeLessThanOrEqual(70);
  // Fast to 23 mL, then drop by drop through the color change.
  await page.clock.runFor(Math.ceil((23 - v2) / 2 * 1000));
  await flow(page, "Drop by drop").click();
  await page.clock.runFor(1000);
  var v3 = await added(page);
  expect(v3).toBeGreaterThan(23);
  await expect(readout(page, "color")).toHaveText("colorless");
  await page.clock.runFor(Math.ceil((25.3 - v3) / 0.15 * 1000));
  await expect(live(page)).toHaveText(/^The solution turned (pale pink|pink) at 2[45]\.\d\d mL\.$/);
  await flow(page, "Closed").click();
  var v4 = await added(page);
  expect(v4).toBeGreaterThan(25);
  // The readout shows the volume to 0.01 mL, but the page works from the exact volume. Just past the equivalence
  // point the curve is steep enough that 0.005 mL moves the pH by several hundredths, so the expected values are
  // the ones at either end of the volume's rounding range.
  var low = M.pH(DEFAULT, v4 - 0.005), high = M.pH(DEFAULT, v4 + 0.005);
  expect([M.color("phenolphthalein", low).name, M.color("phenolphthalein", high).name]).toContain(await readout(page, "color").textContent());
  var shownPH = Number(await readout(page, "ph").textContent());
  expect(shownPH).toBeGreaterThanOrEqual(Number(M.fmt(low)));
  expect(shownPH).toBeLessThanOrEqual(Number(M.fmt(high)));
  // The drops between 23 mL and the close are 0.05 mL apart in the data.
  await expect(graph(page)).toHaveAccessibleName(/Steepest change between 2[45]\.\d\d and 2[45]\.\d\d mL/);
  // Start over empties the flask and keeps the setup.
  await page.getByRole("button", {name: "Start over"}).click();
  await expect(readout(page, "v")).toHaveText("0.00 mL");
  await expect(page.getByLabel("Analyte", {exact: true})).toHaveValue("acetic");
  await page.clock.runFor(1000);
  await expect(readout(page, "v")).toHaveText("0.00 mL");
});

test("an empty burette closes the stopcock; refilling keeps the total", async ({page, problems}) => {
  void problems;
  await fakeClock(page);
  await go(page, "?analyte=hcl&ca=0.2&ct=0.05");
  await flow(page, "Fast stream").click();
  await page.clock.runFor(30000);
  await expect(readout(page, "reading")).toHaveText("50.00 mL");
  await expect(readout(page, "v")).toHaveText("50.00 mL");
  await expect(flow(page, "Closed")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#zsa-ti-status")).toHaveText("The burette is empty. Refill it to keep going.");
  await expect(live(page)).toHaveText("The burette is empty at 50.00 mL added. Refill it to keep going.");
  await page.getByRole("button", {name: "Add one drop"}).click();
  await page.clock.runFor(100);
  await expect(live(page)).toHaveText("The burette is empty. Refill it first.");
  await flow(page, "Slow stream").click();
  await expect(flow(page, "Closed")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", {name: "Refill burette"}).click();
  await page.clock.runFor(100);
  await expect(readout(page, "reading")).toHaveText("0.00 mL");
  await expect(live(page)).toHaveText("Burette refilled to 0.00 mL. 50.00 mL added so far.");
  await page.getByRole("button", {name: "Add one drop"}).click();
  await expect(readout(page, "v")).toHaveText("50.05 mL");
  await expect(readout(page, "reading")).toHaveText("0.05 mL");
  await expect(graph(page)).toHaveAccessibleName(/0 to 100 mL/);
  await expect(readout(page, "ph")).toHaveText(M.fmt(M.pH({analyte: "hcl", ca: 0.2, va: 25, titrant: "naoh", ct: 0.05}, 50.05)));
});

test("setup changes: titrants follow the analyte, a new setup starts over, the indicator keeps the data", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("button", {name: "Add one drop"}).click();
  await page.getByLabel("Indicator", {exact: true}).selectOption("methylorange");
  await expect(readout(page, "v")).toHaveText("0.05 mL");
  await expect(live(page)).toHaveText("Methyl orange is red below pH 3.1 and yellow above pH 4.4.");
  await expect(readout(page, "color")).toHaveText(M.color("methylorange", M.pH(DEFAULT, 0.05)).name);
  await page.getByLabel("Analyte", {exact: true}).selectOption("ammonia");
  await expect(readout(page, "v")).toHaveText("0.00 mL");
  await expect(page.locator("#zsa-ti-titrant option")).toHaveText(["Hydrochloric acid, HCl (strong acid)", "Acetic acid, HC₂H₃O₂ (weak acid)"]);
  await expect(page.getByLabel("Titrant", {exact: true})).toHaveValue("hcl");
  await expect(page.locator("#zsa-ti-reaction")).toHaveText("Reaction: H₃O⁺ + NH₃ → NH₄⁺ + H₂O");
  await expect(live(page)).toHaveText("New titration: 25.00 mL of 0.100 M ammonia with 0.100 M hydrochloric acid, methyl orange. The burette is full and nothing has been added.");
  await expect(readout(page, "ph")).toHaveText(M.fmt(M.pH({analyte: "ammonia", ca: 0.1, va: 25, titrant: "hcl", ct: 0.1}, 0)));
  await expect(page.getByLabel("pKa of NH₄⁺, from the half-equivalence point")).toBeVisible();
  await page.getByLabel("Volume", {exact: true}).selectOption("10");
  await page.getByLabel("Concentration").nth(1).selectOption("0.2");
  await expect(graph(page)).toHaveAccessibleName(/No data yet/);
  await page.getByRole("button", {name: "Show key points"}).click();
  await expect(page.locator("#zsa-ti-keypoints")).toContainText("Equivalence point5.00 mL, pH " + M.fmt(M.pH({analyte: "ammonia", ca: 0.1, va: 10, titrant: "hcl", ct: 0.2}, 5)));
  await page.getByLabel("Analyte", {exact: true}).selectOption("hcl");
  await expect(page.getByLabel("Titrant", {exact: true})).toHaveValue("naoh");
  await expect(page.locator("#zsa-ti-keypoints")).toBeHidden();
  await expect(page.getByRole("button", {name: "Show key points"})).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByLabel("pH at the equivalence point")).toBeVisible();
});

test("endpoint, checking answers and key points", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("button", {name: "Record endpoint"}).click();
  await expect(page.locator("#zsa-ti-endpoint-text")).toHaveText("Add titrant before you record an endpoint.");
  // Blank and wrong answers, then right ones.
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-ti-feedback")).toContainText("Equivalence point volume: enter a value.");
  await expect(live(page)).toHaveText(/^0 of 2 correct\./);
  await page.getByLabel("Equivalence point volume (mL)").fill("12.5");
  await page.getByLabel("pKa of HC₂H₃O₂, from the half-equivalence point").fill("8.7");
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-ti-feedback .zsa-ti-notyet")).toHaveCount(2);
  await expect(page.locator("#zsa-ti-feedback")).toContainText("Not yet. Find the middle of the steepest part of the curve");
  await page.getByLabel("Equivalence point volume (mL)").fill("25.1");
  await page.getByLabel("pKa of HC₂H₃O₂, from the half-equivalence point").fill("4.75");
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-ti-feedback .zsa-ti-ok")).toHaveCount(2);
  await expect(live(page)).toHaveText(/^2 of 2 correct\./);
  // An endpoint, drawn on the graph.
  for (var i = 0; i < 4; i++) await page.getByRole("button", {name: "Add one drop"}).click();
  await page.getByRole("button", {name: "Record endpoint"}).click();
  var p = M.pH(DEFAULT, 0.2);
  await expect(page.locator("#zsa-ti-endpoint-text")).toHaveText("Endpoint recorded at 0.20 mL (pH " + M.fmt(p) + ", colorless).");
  await expect(page.locator("#zsa-ti-graph .zsa-ti-endline")).toHaveCount(1);
  // Key points: markers, the list, the indicator verdict and the insight.
  var show = page.locator("#zsa-ti-show");
  await show.click();
  await expect(show).toHaveAttribute("aria-pressed", "true");
  await expect(show).toHaveText("Hide key points");
  var kp = page.locator("#zsa-ti-keypoints");
  await expect(kp).toContainText("Equivalence point25.00 mL, pH 8.72");
  await expect(kp).toContainText("Half-equivalence point12.50 mL, pH " + M.fmt(M.pH(DEFAULT, 12.5)) + " (pKa = 4.74)");
  await expect(kp).toContainText("Your endpoint0.20 mL, 24.80 mL before the equivalence point");
  await expect(kp).toContainText(M.judgeIndicator(DEFAULT, "phenolphthalein").text);
  await expect(kp).toContainText(M.insight(DEFAULT));
  await expect(page.locator("#zsa-ti-graph .zsa-ti-key-point")).toHaveCount(2);
  await expect(graph(page)).toHaveAccessibleName(/Equivalence point at 25\.00 mL, pH 8\.72\. Half-equivalence point at 12\.50 mL/);
  await expect(live(page)).toHaveText("Key points shown. Equivalence at 25.00 mL, pH 8.72. Half-equivalence at 12.50 mL, pH " + M.fmt(M.pH(DEFAULT, 12.5)) + ".");
  await show.click();
  await expect(kp).toBeHidden();
  await expect(page.locator("#zsa-ti-graph .zsa-ti-key-point")).toHaveCount(0);
});

test("an unknown concentration: hidden, asked for, checked and shown with the key points", async ({page, problems}) => {
  void problems;
  await page.addInitScript(seedRandom, 7);
  await go(page, "?ca=unknown");
  await expect(page.getByLabel("Concentration").first()).toHaveValue("unknown");
  await expect(page.getByLabel("Concentration of the acetic acid (M)")).toBeVisible();
  await page.getByRole("button", {name: "Show key points"}).click();
  var text = await page.locator("#zsa-ti-keypoints").textContent();
  var ca = parseFloat(text.match(/Analyte concentration([\d.]+) M/)[1]), veq = parseFloat(text.match(/Equivalence point([\d.]+) mL/)[1]);
  expect(ca).toBeGreaterThanOrEqual(0.08);
  expect(ca).toBeLessThanOrEqual(0.18);
  expect(veq).toBeCloseTo(ca * 25 / 0.1, 1);
  await expect(readout(page, "ph")).toHaveText(M.fmt(M.pH({analyte: "acetic", ca: ca, va: 25, titrant: "naoh", ct: 0.1}, 0)));
  await page.getByLabel("Equivalence point volume (mL)").fill(String(veq));
  await page.getByLabel(/pKa of/).fill("4.74");
  await page.getByLabel("Concentration of the acetic acid (M)").fill(String(veq * 0.1 / 25));
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(live(page)).toHaveText(/^3 of 3 correct\./);
  // Start over keeps the same sample; a new setup draws a new one.
  await page.getByRole("button", {name: "Start over"}).click();
  await page.getByRole("button", {name: "Show key points"}).click();
  await expect(page.locator("#zsa-ti-keypoints")).toContainText("Analyte concentration" + ca.toFixed(3) + " M");
  await expect(page.locator("#zsa-ti-print-summary")).toContainText("an unknown concentration of acetic acid");
});

test("CSV export and printing", async ({page, problems}) => {
  void problems;
  await go(page);
  for (var i = 0; i < 2; i++) await page.getByRole("button", {name: "Add one drop"}).click();
  var [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", {name: "Download titration data (CSV)"}).click()]);
  expect(download.suggestedFilename()).toBe("zornscience-titration-data.csv");
  var body = fs.readFileSync(await download.path(), "utf8");
  expect(body).toBe(M.csv([[0, M.pH(DEFAULT, 0)], [0.05, M.pH(DEFAULT, 0.05)], [0.1, M.pH(DEFAULT, 0.1)]]));
  await expect(live(page)).toHaveText("Titration data downloaded as zornscience-titration-data.csv: 3 readings of volume and pH.");
  var long = Array.from({length: 30}, (_, k) => "Line " + (k + 1) + " of my explanation.").join("\n");
  await page.getByLabel("Explain using evidence from your curve.").fill(long);
  await page.getByRole("button", {name: "Record endpoint"}).click();
  await page.emulateMedia({media: "print"});
  await expect(page.locator("#zsa-ti-print-summary")).toHaveText("Titration: 25.00 mL of 0.100 M acetic acid with 0.100 M sodium hydroxide, phenolphthalein. Titrant added: 0.10 mL, pH " + M.fmt(M.pH(DEFAULT, 0.1)) + ". Endpoint: 0.10 mL.");
  await expect(page.locator("#zsa-ti-print-reflection")).toHaveText(long);
  await expect(page.locator("#zsa-ti-print-reflection")).toBeVisible();
  await expect(page.getByLabel("Explain using evidence from your curve.")).toBeHidden();
  await expect(page.locator("#zsa-ti-flows")).toBeHidden();
  await expect(graph(page)).toBeVisible();
  await page.emulateMedia({media: "screen"});
  await page.evaluate(() => { window.print = () => document.body.setAttribute("data-printed", "yes"); });
  await page.getByRole("button", {name: "Print lab"}).click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
});

test("layout: no sideways scrolling from 320 to 1920 px and at 200% zoom; 44 px targets; readable labels", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1024, 768], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?analyte=ammonia&indicator=methylred");
    for (var i = 0; i < 3; i++) await page.getByRole("button", {name: "Add one drop"}).click();
    await page.getByRole("button", {name: "Record endpoint"}).click();
    await page.getByRole("button", {name: "Check my answers"}).click();
    await page.getByRole("button", {name: "Show key points"}).click();
    var sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, w + " px").toBeLessThanOrEqual(w);
    var small = await page.locator("main button:visible, main select:visible, main input:visible").evaluateAll((els) =>
      els.map((e) => { var r = e.getBoundingClientRect(); return {name: e.textContent.trim() || e.id, w: r.width, h: r.height}; })
        .filter((r) => r.w < 44 || r.h < 44));
    expect(small, w + " px").toEqual([]);
    // Queried and measured in one script, so a redraw from the graph's resize observer cannot detach them midway.
    var ticks = await page.evaluate(() => Math.min(...Array.from(document.querySelectorAll(".zsa-ti-tick, .zsa-ti-grad-label")).map((e) => e.getBoundingClientRect().height)));
    expect(ticks, w + " px label height").toBeGreaterThanOrEqual(9);
    // Key point labels stay inside the graph.
    var out = await page.locator("#zsa-ti-graph").evaluate((g) => {
      var b = g.getBoundingClientRect();
      return Array.from(g.querySelectorAll(".zsa-ti-key-label, .zsa-ti-end-label")).filter((t) => { var r = t.getBoundingClientRect(); return r.left < b.left - 1 || r.right > b.right + 1; }).map((t) => t.textContent);
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
    for (var i = 0; i < 3; i++) await page.getByRole("button", {name: "Add one drop"}).click();
    await page.getByRole("button", {name: "Record endpoint"}).click();
    await page.getByLabel("Equivalence point volume (mL)").fill("20");
    await page.getByRole("button", {name: "Check my answers"}).click();
    await page.getByRole("button", {name: "Show key points"}).click();
    await page.getByLabel("Explain using evidence from your curve.").fill("The curve is steepest at 25 mL.");
    await audit(page, w + " analyzed");
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
  requests.filter((u) => /titration-lab\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  await page.getByRole("button", {name: "Add one drop"}).click();
  await page.getByLabel("Explain using evidence from your curve.").fill("Notes");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.reload();
  await expect(page.getByLabel("Explain using evidence from your curve.")).toHaveValue("");
  await expect(readout(page, "v")).toHaveText("0.00 mL");

  await go(page, "?analyte=methylamine&titrant=acetic&ca=0.2&va=10&ct=0.05&indicator=bromothymol");
  await expect(page.getByLabel("Analyte", {exact: true})).toHaveValue("methylamine");
  await expect(page.getByLabel("Titrant", {exact: true})).toHaveValue("acetic");
  await expect(page.getByLabel("Concentration").first()).toHaveValue("0.2");
  await expect(page.getByLabel("Volume", {exact: true})).toHaveValue("10");
  await expect(page.getByLabel("Concentration").nth(1)).toHaveValue("0.05");
  await expect(page.getByLabel("Indicator", {exact: true})).toHaveValue("bromothymol");
  // A titrant that does not suit the analyte, and unknown values, are ignored.
  await go(page, "?analyte=hcl&titrant=hcl&ca=0.3&va=7&ct=x&indicator=nope");
  await expect(page.getByLabel("Analyte", {exact: true})).toHaveValue("hcl");
  await expect(page.getByLabel("Titrant", {exact: true})).toHaveValue("naoh");
  await expect(page.getByLabel("Concentration").first()).toHaveValue("0.1");
  await expect(page.getByLabel("Volume", {exact: true})).toHaveValue("25");
  await expect(page.getByLabel("Indicator", {exact: true})).toHaveValue("phenolphthalein");

  var lesson = "https://zornscience.org/science/ap-chemistry/unit-8-acids-and-bases/";
  await go(page, "?from=" + encodeURIComponent(lesson));
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", lesson);
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: "← Back to the lesson"}), bad).toHaveAttribute("href", DEFAULT_BACK);
  }
  await go(page, "?embed=1&analyte=ammonia&from=" + encodeURIComponent(lesson));
  await expect(page.locator("#zsa-ti-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByLabel("Analyte", {exact: true})).toHaveValue("ammonia");
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
});

test("landing page links to the Virtual Titration Simulator", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Virtual Titration Simulator"}).click();
  await expect(page).toHaveTitle("Virtual Titration Simulator | ZornScience");
});
