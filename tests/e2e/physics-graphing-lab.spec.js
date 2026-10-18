// Physics Graphing Lab (physics-graphing-lab/): the six scenarios and the sliders, readouts and graph descriptions
// against the model, playback with a fake clock (one animation loop however fast Play and Pause are pressed), the
// time scrubber, predictions drawn with a mouse or touch and typed with the keyboard, values off the scale, reveal and
// compare, clearing, changes after a reveal, CSV export, printing a long reflection, layout and 44 px targets,
// axe-core at two sizes, deep links, embed mode, network and storage, and the landing page link. Selects by role,
// label, id and text, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect} = require("./fixtures");
var M = require("../../physics-graphing-lab/physics.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/physics/unit-1-linear-motion/velocity-time-graphs/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "physics-graphing-lab", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

async function go(page, query) {
  await page.goto("/physics-graphing-lab/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Physics Graphing Lab"})).toBeVisible();
}
function graph(page, name) { return page.getByRole("img", {name: new RegExp("^" + name + " versus time graph")}); }
function live(page) { return page.locator("#zsa-pg-live"); }
function readout(page, id) { return page.locator("#zsa-pg-" + id + "-value"); }
function scenario(id) { return M.SCENARIOS.filter(function (s) { return s.id === id; })[0]; }
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// A stroke across a graph from (t0, fraction of height) to (t1, fraction), in steps, with the mouse.
async function sketch(page, name, from, to) {
  var el = graph(page, name);
  await el.scrollIntoViewIfNeeded();
  var box = await el.boundingBox(), sx = box.width / 320, sy = box.height / 236;
  var px = function (t) { return box.x + (54 + t / 10 * 254) * sx; }, py = function (f) { return box.y + (192 - f * 178) * sy; };
  await page.mouse.move(px(from[0]), py(from[1]));
  await page.mouse.down();
  for (var i = 1; i <= 20; i++) await page.mouse.move(px(from[0] + (to[0] - from[0]) * i / 20), py(from[1] + (to[1] - from[1]) * i / 20));
  await page.mouse.up();
}
async function typePrediction(page, key, values) {
  var g = M.GRAPHS.filter((d) => d.key === key)[0];
  for (var i = 0; i < M.PREDICTION_TIMES.length; i++) {
    if (values[i] === null) continue;
    await page.getByLabel("Predicted " + g.name.toLowerCase() + " at " + M.PREDICTION_TIMES[i] + " s, in " + g.unit).fill(String(values[i]));
  }
}
async function openKeyboard(page) {
  var d = page.locator("#zsa-pg-keyboard");
  if (!(await d.evaluate((el) => el.open))) await page.getByText("Enter prediction values with a keyboard").click();
}

test("opens in Explore with Cruise to the right: readouts, model graphs, descriptions and insight", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page.getByRole("button", {name: "Explore"})).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("cruise");
  await expect(page.locator("#zsa-pg-scenario-text")).toHaveText(scenario("cruise").text);
  await expect(page.getByRole("slider", {name: "Initial velocity, v₀"})).toHaveAttribute("aria-valuetext", "2.0 m/s");
  await expect(readout(page, "t")).toHaveText("0.00 s");
  await expect(readout(page, "x")).toHaveText("0.00 m");
  await expect(readout(page, "v")).toHaveText("2.00 m/s");
  await expect(readout(page, "a")).toHaveText("0.00 m/s²");
  for (var g of M.GRAPHS) await expect(graph(page, g.name)).toHaveAccessibleName(new RegExp("Model: " + M.describe(0, 2, 0, g.key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
  await expect(page.locator("#zsa-pg-insight")).toHaveText(M.insight(0, 2, 0, true));
  await expect(page.getByRole("img", {name: "Cart at 0.00 m, moving right at 2.00 m/s, at 0.00 s."})).toBeVisible();
  await expect(page.locator("#zsa-pg-predictbar")).toBeHidden();
  await expect(page.locator("#zsa-pg-keyboard")).toBeHidden();
  await expect(page.locator("#zsa-pg-graphs polyline")).toHaveCount(3);
});

test("all six scenarios: settings, readouts at 0, 5 and 10 s, graph descriptions and insight", async ({page, problems}) => {
  void problems;
  await go(page);
  for (var s of M.SCENARIOS) {
    await page.getByLabel("Start with a scenario").selectOption(s.id);
    await expect(live(page)).toHaveText(s.label + ". " + s.text);
    await expect(page.locator("#zsa-pg-x0-out")).toHaveText(M.fmt(s.x0, 1) + " m");
    await expect(page.locator("#zsa-pg-v0-out")).toHaveText(M.fmt(s.v0, 1) + " m/s");
    await expect(page.locator("#zsa-pg-a-out")).toHaveText(M.fmt(s.a, 1) + " m/s²");
    for (var t of [0, 5, 10]) {
      await page.getByRole("slider", {name: "Time"}).fill(String(t));
      // Expected values from the kinematic equations written here, not from the model.
      var x = s.x0 + s.v0 * t + 0.5 * s.a * t * t, v = s.v0 + s.a * t;
      await expect(readout(page, "t"), s.id).toHaveText(t.toFixed(2) + " s");
      await expect(readout(page, "x"), s.id + " x at " + t).toHaveText(M.fmt(x) + " m");
      await expect(readout(page, "v"), s.id + " v at " + t).toHaveText(M.fmt(v) + " m/s");
    }
    for (var g of M.GRAPHS) await expect(graph(page, g.name)).toHaveAccessibleName(new RegExp(M.describe(s.x0, s.v0, s.a, g.key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
    await expect(page.locator("#zsa-pg-insight")).toHaveText(M.insight(s.x0, s.v0, s.a, true));
  }
  // The turn-around reverses at 5 s: the cart is at rest there and moving left after.
  await page.getByLabel("Start with a scenario").selectOption("turn");
  await expect(page.locator("#zsa-pg-insight")).toContainText("It reverses direction at 5.00 s, where velocity is zero.");
  await page.getByRole("slider", {name: "Time"}).fill("5");
  await expect(page.getByRole("img", {name: "Cart at 7.50 m, at rest, at 5.00 s."})).toBeVisible();
  await page.getByRole("slider", {name: "Time"}).fill("7");
  await expect(page.getByRole("img", {name: /^Cart at .* moving left at 1\.20 m\/s/})).toBeVisible();
  // Slowing to a stop has no reversal inside the run.
  await page.getByLabel("Start with a scenario").selectOption("stop");
  await expect(page.locator("#zsa-pg-insight")).not.toContainText("reverses");
});

test("sliders: keyboard changes make custom settings, and choosing a scenario again restores it", async ({page, problems}) => {
  void problems;
  await go(page, "?scenario=turn");
  var acc = page.getByRole("slider", {name: "Acceleration, a"});
  await acc.focus();
  await page.keyboard.press("ArrowRight");
  await expect(acc).toHaveAttribute("aria-valuetext", "−0.5 m/s²");
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("custom");
  await expect(page.locator("#zsa-pg-scenario-text")).toHaveText("Custom motion: use your settings to explain the graphs.");
  await expect(page.locator("#zsa-pg-insight")).toContainText("It reverses direction at 6.00 s");
  await page.getByRole("slider", {name: "Initial position, x₀"}).fill("-20");
  await expect(page.locator("#zsa-pg-x0-out")).toHaveText("−20.0 m");
  await expect(readout(page, "x")).toHaveText("−20.00 m");
  await page.getByRole("slider", {name: "Time"}).fill("10");
  await expect(readout(page, "x")).toHaveText(M.fmt(-20 + 30 - 25) + " m");
  // Choosing "Custom settings" itself keeps the settings; choosing the scenario again restores it and resets time.
  await page.getByLabel("Start with a scenario").selectOption("custom");
  await expect(page.locator("#zsa-pg-x0-out")).toHaveText("−20.0 m");
  await page.getByLabel("Start with a scenario").selectOption("turn");
  await expect(page.locator("#zsa-pg-x0-out")).toHaveText("0.0 m");
  await expect(acc).toHaveAttribute("aria-valuetext", "−0.6 m/s²");
  await expect(readout(page, "t")).toHaveText("0.00 s");
});

test("playback: real time, one loop however fast Play and Pause are pressed, Replay, Reset and the scrubber", async ({page, problems}) => {
  void problems;
  await page.clock.install({time: new Date("2026-10-18T12:00:00")});
  await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
  await go(page, "?scenario=speed");
  var play = page.locator("#zsa-pg-play");
  await expect(play).toHaveText("Run motion");
  await play.click();
  await expect(play).toHaveText("Pause");
  await page.clock.runFor(2000);
  var t1 = parseFloat(await readout(page, "t").textContent());
  expect(t1).toBeGreaterThan(1.9);
  expect(t1).toBeLessThanOrEqual(2);
  // Twelve quick presses end playing. One second later the time has moved one second, not two or more.
  for (var i = 0; i < 12; i++) await play.click();
  await expect(play).toHaveText("Pause");
  await page.clock.runFor(1000);
  var t2 = parseFloat(await readout(page, "t").textContent());
  expect(t2 - t1).toBeGreaterThan(0.95);
  expect(t2 - t1).toBeLessThan(1.05);
  // The readouts follow the model while running.
  await play.click();
  await expect(play).toHaveText("Run motion");
  var t = parseFloat(await readout(page, "t").textContent());
  // The time readout is rounded to 0.01 s, so position agrees to within 0.6 × 3 × 0.005 m plus its own rounding.
  expect(Math.abs(parseFloat(await readout(page, "x").textContent()) - M.stateAt(0, 0, 0.6, t).x)).toBeLessThanOrEqual(0.015);
  // Paused means paused.
  await page.clock.runFor(1500);
  await expect(readout(page, "t")).toHaveText(t.toFixed(2) + " s");
  // The run ends at exactly 10 s with Replay and an announcement; Replay starts again from 0.
  await play.click();
  await page.clock.runFor(12000);
  await expect(readout(page, "t")).toHaveText("10.00 s");
  await expect(readout(page, "x")).toHaveText("30.00 m");
  await expect(play).toHaveText("Replay");
  await expect(live(page)).toHaveText("The run is complete at 10 s. Position 30.00 m, velocity 6.00 m/s.");
  await play.click();
  await expect(play).toHaveText("Pause");
  await page.clock.runFor(500);
  expect(parseFloat(await readout(page, "t").textContent())).toBeLessThan(0.6);
  // The scrubber pauses the run; Reset goes back to 0.
  await page.getByRole("slider", {name: "Time"}).fill("4");
  await expect(play).toHaveText("Run motion");
  await page.clock.runFor(1000);
  await expect(readout(page, "t")).toHaveText("4.00 s");
  await expect(page.getByRole("slider", {name: "Time"})).toHaveAttribute("aria-valuetext", "4.0 seconds");
  await play.click();
  await page.clock.runFor(1000);
  await page.getByRole("button", {name: "Reset"}).click();
  await expect(readout(page, "t")).toHaveText("0.00 s");
  await expect(play).toHaveText("Run motion");
  await page.clock.runFor(1000);
  await expect(readout(page, "t")).toHaveText("0.00 s");
  // Changing a setting while running stops the run.
  await play.click();
  await page.clock.runFor(1000);
  await page.getByLabel("Start with a scenario").selectOption("left");
  await expect(play).toHaveText("Run motion");
  await page.clock.runFor(1000);
  await expect(readout(page, "t")).toHaveText("0.00 s");
});

test("rapid Play and Pause between two frames leave one animation loop", async ({page, problems}) => {
  void problems;
  // Count the animation callbacks that run on each frame.
  await page.addInitScript(() => {
    var raf = window.requestAnimationFrame.bind(window);
    window.__perFrame = {};
    window.requestAnimationFrame = (f) => raf((ts) => { window.__perFrame[ts] = (window.__perFrame[ts] || 0) + 1; f(ts); });
  });
  await go(page, "?scenario=speed");
  await page.getByRole("button", {name: "Run motion"}).click();
  await page.waitForTimeout(200);
  // Twelve presses in one task, so no frame runs between them (the handoff ended with 7 loops here).
  await page.locator("#zsa-pg-play").evaluate((b) => { for (var i = 0; i < 12; i++) b.click(); });
  await expect(page.locator("#zsa-pg-play")).toHaveText("Pause");
  await page.evaluate(() => { window.__perFrame = {}; });
  await page.waitForTimeout(700);
  var counts = await page.evaluate(() => Object.values(window.__perFrame));
  expect(counts.length).toBeGreaterThan(5);
  expect(Math.max(...counts)).toBe(1);
});

test("predict: model hidden, sketches by mouse and keyboard, reveal and compare, clear, and changes after a reveal", async ({page, problems}) => {
  void problems;
  await go(page, "?scenario=turn");
  await page.getByRole("button", {name: "Predict and compare"}).click();
  await expect(page.getByRole("button", {name: "Predict and compare"})).toHaveAttribute("aria-pressed", "true");
  await expect(live(page)).toHaveText(/^Predict and compare\./);
  await expect(page.locator("#zsa-pg-graphs polyline")).toHaveCount(0);
  for (var g of M.GRAPHS) await expect(graph(page, g.name)).toHaveAccessibleName(/The model is hidden until you reveal it\.$/);
  await expect(page.locator("#zsa-pg-insight")).toHaveText(M.insight(0, 3, -0.6, false));
  await expect(page.locator("#zsa-pg-graphs")).toHaveCSS("display", "grid");
  expect(await graph(page, "Position").evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");
  // The cart can still run before the reveal.
  await page.getByRole("slider", {name: "Time"}).fill("2");
  await expect(readout(page, "t")).toHaveText("2.00 s");

  // Position by mouse: a rising stroke across the whole run.
  await sketch(page, "Position", [0, 0.3], [10, 0.7]);
  await expect(graph(page, "Position")).toHaveAccessibleName(/Your prediction: \d+ points from 0\.0 to 10\.0 s\.$/);
  await expect(page.locator("#zsa-pg-graphs polyline")).toHaveCount(1);
  // Velocity by keyboard: the exact model values.
  await openKeyboard(page);
  await typePrediction(page, "v", M.PREDICTION_TIMES.map((t) => +(3 - 0.6 * t).toFixed(2)));
  await expect(graph(page, "Velocity")).toHaveAccessibleName(/Your prediction: 6 points from 0\.0 to 10\.0 s\.$/);
  await expect(page.locator("#zsa-pg-graphs circle")).toHaveCount(6);
  // Clearing a box removes its point.
  await page.getByLabel("Predicted velocity at 10 s, in m/s").fill("");
  await expect(graph(page, "Velocity")).toHaveAccessibleName(/Your prediction: 5 points from 0\.0 to 8\.0 s\.$/);
  await page.getByLabel("Predicted velocity at 10 s, in m/s").fill("-3");

  // Reveal: the model on every graph, feedback for each, focus on the feedback, inputs locked, no drawing.
  await page.getByRole("button", {name: "Reveal and compare"}).click();
  var fb = page.locator("#zsa-pg-feedback");
  await expect(fb).toBeFocused();
  await expect(fb.getByRole("heading", {name: "Compare your prediction with the model"})).toBeVisible();
  await expect(fb).toContainText("Position: Compare the starting value, sign and curvature with the model.");
  await expect(fb).toContainText("Velocity: Your drawn values closely follow the model.");
  await expect(fb).toContainText("Acceleration: add a sketch on your next attempt.");
  await expect(fb).toContainText("not a grade");
  await expect(live(page)).toHaveText(/^Model revealed\. Position: /);
  await expect(page.locator("#zsa-pg-graphs polyline.zsa-pg-model")).toHaveCount(3);
  await expect(page.getByRole("button", {name: "Reveal and compare"})).toBeDisabled();
  await expect(page.getByLabel("Predicted velocity at 0 s, in m/s")).toBeDisabled();
  await expect(page.locator("#zsa-pg-insight")).toHaveText(M.insight(0, 3, -0.6, true));
  expect(await graph(page, "Position").evaluate((el) => getComputedStyle(el).touchAction)).toBe("auto");
  var before = await graph(page, "Acceleration").getAttribute("aria-labelledby").then((id) => page.locator("#" + id).textContent());
  await sketch(page, "Acceleration", [0, 0.5], [10, 0.5]);
  expect(await page.locator("#zsa-pg-desc-a").textContent()).toBe(before);

  // Clear predictions hides the model again and empties everything.
  await page.getByRole("button", {name: "Clear predictions"}).click();
  await expect(live(page)).toHaveText("Predictions cleared. The model is hidden.");
  await expect(fb).toBeHidden();
  await expect(page.locator("#zsa-pg-graphs polyline")).toHaveCount(0);
  await expect(page.getByLabel("Predicted velocity at 0 s, in m/s")).toBeEnabled();
  await expect(page.getByLabel("Predicted velocity at 0 s, in m/s")).toHaveValue("");

  // A new scenario after a reveal starts a fresh prediction with the model hidden.
  await typePrediction(page, "a", [-0.6, -0.6, -0.6, -0.6, -0.6, -0.6]);
  await page.getByRole("button", {name: "Reveal and compare"}).click();
  await expect(fb).toContainText("Acceleration: Your drawn values closely follow the model.");
  await page.getByLabel("Start with a scenario").selectOption("speed");
  await expect(fb).toBeHidden();
  await expect(page.locator("#zsa-pg-graphs polyline")).toHaveCount(0);
  await expect(page.getByLabel("Predicted acceleration at 0 s, in m/s²")).toHaveValue("");
  await expect(page.getByLabel("Predicted acceleration at 0 s, in m/s²")).toBeEnabled();
  await expect(page.getByRole("button", {name: "Reveal and compare"})).toBeEnabled();
  // Explore again shows the model, with no prediction tools.
  await page.getByRole("button", {name: "Explore"}).click();
  await expect(page.locator("#zsa-pg-graphs polyline")).toHaveCount(3);
  await expect(page.locator("#zsa-pg-predictbar")).toBeHidden();
  expect(await graph(page, "Position").evaluate((el) => getComputedStyle(el).touchAction)).toBe("auto");
});

test("a drawn stroke replaces typed values it crosses; touch drawing works", async ({page, problems}) => {
  void problems;
  await go(page, "?mode=predict&scenario=cruise");
  await openKeyboard(page);
  await typePrediction(page, "x", [0, 4, 8, 12, 16, 20]);
  await sketch(page, "Position", [3, 0.5], [7, 0.5]);
  await expect(page.getByLabel("Predicted position at 4 s, in m")).toHaveValue("");
  await expect(page.getByLabel("Predicted position at 6 s, in m")).toHaveValue("");
  await expect(page.getByLabel("Predicted position at 2 s, in m")).toHaveValue("4");
  await expect(page.getByLabel("Predicted position at 8 s, in m")).toHaveValue("16");
  // Touch: pointer events with pointerType touch, as a finger sends them.
  var box = await graph(page, "Velocity").boundingBox();
  await graph(page, "Velocity").evaluate((el, b) => {
    var send = (type, f) => el.dispatchEvent(new PointerEvent(type, {bubbles: true, cancelable: true, pointerId: 7, pointerType: "touch", isPrimary: true, clientX: b.x + b.width * (0.2 + f * 0.7), clientY: b.y + b.height * 0.4}));
    send("pointerdown", 0);
    for (var i = 1; i <= 10; i++) send("pointermove", i / 10);
    send("pointerup", 1);
  }, box);
  await expect(graph(page, "Velocity")).toHaveAccessibleName(/Your prediction: \d+ points from /);
});

test("predictions off the scale: the scale stretches, values past the limit sit at the edge with a note", async ({page, problems}) => {
  void problems;
  await go(page, "?mode=predict&scenario=cruise");
  await openKeyboard(page);
  var before = await graph(page, "Velocity").getAttribute("aria-labelledby").then((id) => page.locator("#" + id).textContent());
  expect(before).toContain("m/s from −1 to 3.");
  await typePrediction(page, "v", [2, 2, 12, null, null, null]);
  await expect(graph(page, "Velocity")).toHaveAccessibleName(/m\/s from −5 to 15\./);
  await expect(page.getByText("The scale is stretched to show your prediction.")).toBeVisible();
  await typePrediction(page, "v", [null, null, null, 500, -1000, null]);
  await expect(page.getByText("Off the scale: 500 m/s at 6 s, −1000 m/s at 8 s. Shown at the edge.")).toBeVisible();
  await expect(page.locator(".zsa-pg-off")).toHaveCount(2);
  // Every mark stays inside the graph's plot area.
  var outside = await graph(page, "Velocity").evaluate((el) => [...el.querySelectorAll("polyline, circle, path")].flatMap((m) => {
    var b = m.getBBox();
    return b.y < 4 || b.y + b.height > 200 || b.x < 44 || b.x + b.width > 318 ? [m.getAttribute("class")] : [];
  }));
  expect(outside).toEqual([]);
  // After the reveal the model is still readable on the stretched scale, and the feedback still compares.
  await page.getByRole("button", {name: "Reveal and compare"}).click();
  await expect(page.locator("#zsa-pg-feedback")).toContainText("Velocity: Compare the starting value, sign and curvature with the model.");
  var model = await page.locator("polyline.zsa-pg-model-v").evaluate((el) => { var b = el.getBBox(); return {y: b.y, height: b.height}; });
  expect(model.y).toBeGreaterThan(4);
  expect(model.y + model.height).toBeLessThan(200);
  // Clearing the predictions returns the scale to the model's.
  await page.getByRole("button", {name: "Clear predictions"}).click();
  await expect(graph(page, "Velocity")).toHaveAccessibleName(/m\/s from −1 to 3\./);
  await expect(page.locator(".zsa-pg-scale-note:visible")).toHaveCount(0);
});

test("CSV export: the file holds the model every 0.1 s", async ({page, problems}) => {
  void problems;
  await go(page, "?scenario=left");
  var wait = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download motion data (CSV)"}).click();
  var download = await wait;
  expect(download.suggestedFilename()).toBe("zornscience-motion-data.csv");
  var text = fs.readFileSync(await download.path(), "utf8");
  var s = scenario("left");
  expect(text).toBe(M.csv(s.x0, s.v0, s.a));
  expect(text.split("\n")[101]).toBe("10.0,-25.0000,-6.0000,-0.5000");
  await expect(live(page)).toHaveText(/^Motion data downloaded/);
  // Custom settings export what is on screen.
  await page.getByRole("slider", {name: "Initial velocity, v₀"}).fill("2.5");
  wait = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download motion data (CSV)"}).click();
  text = fs.readFileSync(await (await wait).path(), "utf8");
  expect(text).toBe(M.csv(10, 2.5, -0.5));
});

test("printing: the experiment, graphs, feedback and a long reflection in full; no controls", async ({page, problems}) => {
  void problems;
  await go(page, "?mode=predict&scenario=turn");
  await openKeyboard(page);
  await typePrediction(page, "x", [0, 4.8, 7.2, 7.2, 4.8, 0]);
  await page.getByRole("button", {name: "Reveal and compare"}).click();
  var long = Array.from({length: 40}, (_, i) => "Line " + (i + 1) + ": the slope of the position graph is the velocity.").join("\n");
  await page.getByLabel("Explain using evidence from the graphs.").fill(long);
  await page.emulateMedia({media: "print"});
  await expect(page.locator("#zsa-pg-print-summary")).toBeVisible();
  await expect(page.locator("#zsa-pg-print-summary")).toHaveText("Experiment: Turn around. x₀ = 0.0 m, v₀ = 3.0 m/s, a = −0.6 m/s². Prediction compared with the model.");
  var mirror = page.locator("#zsa-pg-print-reflection");
  await expect(mirror).toBeVisible();
  expect(await mirror.evaluate((el) => el.textContent)).toBe(long);
  // The whole text is laid out, not cut at the box height.
  var box = await mirror.boundingBox();
  expect(box.height).toBeGreaterThan(40 * 20);
  await expect(page.getByLabel("Explain using evidence from the graphs.")).toBeHidden();
  for (var hidden of ["Run motion", "Print lab", "Reveal and compare", "Download motion data (CSV)", "Explore"]) await expect(page.getByRole("button", {name: hidden})).toBeHidden();
  await expect(page.locator("#zsa-pg-feedback")).toBeVisible();
  for (var g of M.GRAPHS) await expect(graph(page, g.name)).toBeVisible();
  // Three graphs side by side on the page.
  var tops = await page.locator(".zsa-pg-graph").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await page.emulateMedia({media: "screen"});
  await expect(page.locator("#zsa-pg-print-reflection")).toBeHidden();
  // The Print lab button opens the print dialog (stubbed here).
  await page.evaluate(() => { window.print = () => document.body.setAttribute("data-printed", "yes"); });
  await page.getByRole("button", {name: "Print lab"}).click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
});

test("layout: no sideways scrolling from 320 to 1920 px and at 200% zoom; 44 px targets; readable track labels", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1024, 768], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?mode=predict&scenario=left");
    await openKeyboard(page);
    await typePrediction(page, "x", [10, 5, -5, -20, -40, -1000]);
    await page.getByRole("button", {name: "Reveal and compare"}).click();
    var sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, w + " px").toBeLessThanOrEqual(w);
    var small = await page.locator("main button:visible, main select:visible, main input:visible, main summary:visible").evaluateAll((els) =>
      els.map((e) => { var r = e.getBoundingClientRect(); return {name: e.getAttribute("aria-label") || e.textContent.trim() || e.id, w: r.width, h: r.height}; })
        .filter((r) => r.w < 44 || r.h < 44));
    expect(small, w + " px").toEqual([]);
    // Track labels render at 12 px or more, and do not overlap.
    var labels = await page.locator(".zsa-pg-track-label").evaluateAll((els) => els.map((e) => { var r = e.getBoundingClientRect(); return {l: r.left, r: r.right, h: r.height}; }));
    labels.forEach((r) => expect(r.h, w + " px label height").toBeGreaterThanOrEqual(12));
    var axis = labels.slice(0, -1).sort((p, q) => p.l - q.l);
    axis.forEach((r, i) => { if (i) expect(r.l, w + " px labels overlap").toBeGreaterThan(axis[i - 1].r); });
    // Graph tick labels render at 9 px or more.
    var ticks = await page.locator(".zsa-pg-tick").evaluateAll((els) => Math.min(...els.map((e) => e.getBoundingClientRect().height)));
    expect(ticks, w + " px tick height").toBeGreaterThanOrEqual(9);
  }
});

test("axe-core: no violations in five states at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?scenario=turn");
    await audit(page, w + " explore");
    await page.getByRole("slider", {name: "Time"}).fill("6");
    await audit(page, w + " scrubbed");
    await page.getByRole("button", {name: "Predict and compare"}).click();
    await sketch(page, "Velocity", [0, 0.8], [10, 0.2]);
    await openKeyboard(page);
    await typePrediction(page, "x", [0, 500, null, null, null, null]);
    await audit(page, w + " predicting with keyboard open and a value off the scale");
    await page.getByRole("button", {name: "Reveal and compare"}).click();
    await page.getByLabel("Explain using evidence from the graphs.").fill("The velocity graph crosses zero at 5 s.");
    await audit(page, w + " revealed");
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
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u, u).toContain("?v="));
  requests.filter((u) => /physics-graphing-lab\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  await page.getByRole("button", {name: "Predict and compare"}).click();
  await sketch(page, "Position", [0, 0.5], [10, 0.6]);
  await page.getByLabel("Explain using evidence from the graphs.").fill("Notes");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  // A reload starts fresh: nothing was kept.
  await page.reload();
  await expect(page.getByLabel("Explain using evidence from the graphs.")).toHaveValue("");
  await expect(page.getByRole("button", {name: "Explore"})).toHaveAttribute("aria-pressed", "true");

  await go(page, "?scenario=rest&mode=predict");
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("rest");
  await expect(page.getByRole("button", {name: "Predict and compare"})).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#zsa-pg-predictbar")).toBeVisible();
  await go(page, "?scenario=nope&mode=nope");
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("cruise");
  await expect(page.getByRole("button", {name: "Explore"})).toHaveAttribute("aria-pressed", "true");

  var lesson = "https://zornscience.org/science/physics/unit-1-linear-motion/position-time-graphs/";
  await go(page, "?from=" + encodeURIComponent(lesson));
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", lesson);
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: "← Back to the lesson"}), bad).toHaveAttribute("href", DEFAULT_BACK);
  }
  await go(page, "?embed=1&scenario=stop&from=" + encodeURIComponent(lesson));
  await expect(page.locator("#zsa-pg-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("stop");
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
});

test("landing page links to the Physics Graphing Lab", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Physics Graphing Lab"}).click();
  await expect(page).toHaveTitle("Physics Graphing Lab | ZornScience");
});
