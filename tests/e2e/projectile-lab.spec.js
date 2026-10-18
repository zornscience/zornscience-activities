// Projectile Motion Vector Lab (projectile-lab/): the defaults, the scenarios and sliders against the model, the
// vector toggles, launching on a fake clock (one animation loop however fast Launch and Pause are pressed), slow
// motion, the pause at the top, landing and the results, the time scrubber, a launch with no flight, the questions,
// CSV export and printing, layout and 44 px targets, axe-core at two sizes, deep links, embed mode, network and
// storage, and the landing page link. Selects by role, label, id and text, and fails on console errors or CSP
// violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect} = require("./fixtures");
var M = require("../../projectile-lab/model.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/physics/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "projectile-lab", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

// Pages on the fake clock: the live region fills 50 ms after an announcement, so heard() moves the clock on first.
var clocked = new WeakSet();
async function go(page, query, opts) {
  opts = opts || {};
  if (opts.clock !== false) {
    clocked.add(page);
    await page.clock.install({time: new Date("2026-10-18T12:00:00")});
    await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
  }
  await page.goto("/projectile-lab/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Projectile Motion Vector Lab"})).toBeVisible();
}
function live(page) { return page.locator("#zsa-pj-live"); }
async function heard(page, text) {
  if (clocked.has(page)) await page.clock.runFor(100);
  await expect(live(page)).toHaveText(text);
}
function readout(page, id) { return page.locator("#zsa-pj-" + id + "-value"); }
async function seconds(page) { return parseFloat(await readout(page, "t").textContent()); }
function scene(page) { return page.locator("#zsa-pj-scene"); }
function graph(page) { return page.getByRole("img", {name: /^Velocity components versus time/}); }
function scenario(id) { return M.SCENARIOS.filter(function (s) { return s.id === id; })[0]; }
function signed(n, pos, neg) { return M.fmt(Math.abs(n)) + " m/s" + (Math.abs(n) < 0.005 ? "" : " " + (n > 0 ? pos : neg)); }
async function expectState(page, p, t) {
  var st = M.stateAt(p, t);
  await expect(readout(page, "t")).toHaveText(M.fmt(t) + " s");
  await expect(readout(page, "x")).toHaveText(M.fmt(st.x) + " m");
  await expect(readout(page, "y")).toHaveText(M.fmt(Math.max(0, st.y)) + " m");
  await expect(readout(page, "speed")).toHaveText(M.fmt(st.speed) + " m/s");
  await expect(readout(page, "vx")).toHaveText(signed(st.vx, "right", "left"));
  await expect(readout(page, "vy")).toHaveText(signed(st.vy, "up", "down"));
  await expect(readout(page, "a")).toHaveText("9.80 m/s² down");
  await expect(readout(page, "dir")).toHaveText(M.direction(st.vx, st.vy));
}
// Moves the time slider to a value (a range input cannot be typed into).
async function scrub(page, value) {
  await page.getByRole("slider", {name: "Time"}).evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event("input", {bubbles: true})); }, value);
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
var SHOW = {v: "Velocity, v", c: "Components, vx and vy", a: "Acceleration, a", s: "Snapshots along the path"};

test("opens with Launch from a ledge: settings, readouts, toggles, scene and graph descriptions, insight and results", async ({page, problems}) => {
  void problems;
  await go(page);
  var p = scenario("ledge");
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("ledge");
  await expect(page.locator("#zsa-pj-scenario-text")).toHaveText(p.text);
  await expect(page.getByRole("slider", {name: "Launch height, h₀"})).toHaveAttribute("aria-valuetext", "15 meters");
  await expect(page.getByRole("slider", {name: "Launch angle, θ"})).toHaveAttribute("aria-valuetext", "50 degrees above horizontal");
  await expect(page.getByRole("slider", {name: "Launch speed, v₀"})).toHaveAttribute("aria-valuetext", "18.0 meters per second");
  await expect(page.locator("#zsa-pj-launch-parts")).toHaveText("At launch: vx = 11.57 m/s, vy = 13.79 m/s.");
  await expectState(page, p, 0);
  await expect(page.getByRole("checkbox", {name: SHOW.v})).toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.c})).toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.a})).not.toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.s})).not.toBeChecked();
  await expect(page.getByRole("img", {name: M.describe(p, 0, {v: true, c: true})})).toBeVisible();
  await expect(graph(page)).toHaveAccessibleName(M.graphDescription(p));
  await expect(page.locator("#zsa-pj-insight")).toHaveText(M.insight(p, 0));
  await expect(page.locator("#zsa-pj-r-range")).toHaveText("?");
  await expect(page.getByRole("button", {name: "Launch", exact: true})).toBeEnabled();
  // The ball carries a velocity arrow and two component arrows; vy points up at launch.
  await expect(scene(page).locator("[class*=arrow-v] line")).toHaveCount(3);
});

test("vector toggles change the arrows and the spoken scene", async ({page, problems}) => {
  void problems;
  await go(page);
  var p = scenario("ledge");
  await page.getByRole("checkbox", {name: SHOW.v}).uncheck();
  await page.getByRole("checkbox", {name: SHOW.a}).check();
  await expect(page.getByRole("img", {name: M.describe(p, 0, {c: true, a: true})})).toBeVisible();
  await expect(scene(page).locator("[class*=arrow-v] line, [class*=arrow-a] line")).toHaveCount(3);
  await page.getByRole("checkbox", {name: SHOW.s}).check();
  await scrub(page, 2);
  // Snapshots every 0.5 s up to 2 s: 5 faded balls, each with two components and the acceleration.
  await expect(page.getByRole("img", {name: M.describe(p, 2, {c: true, a: true, s: true})})).toBeVisible();
  await expect(scene(page).locator("circle[class*=ghost]")).toHaveCount(5);
  await page.getByRole("checkbox", {name: SHOW.c}).uncheck();
  await page.getByRole("checkbox", {name: SHOW.a}).uncheck();
  await expect(scene(page).locator("[class*=arrow] line")).toHaveCount(0);
  await expect(scene(page).locator("circle[class*=ghost]")).toHaveCount(5);
});

test("launches in real time on a fake clock, pauses and resumes, with one animation loop", async ({page, problems}) => {
  void problems;
  await go(page);
  var p = scenario("ledge");
  await page.getByRole("button", {name: "Launch", exact: true}).click();
  await heard(page, "Launched at 18.0 m/s, 50° above horizontal, from 15 m. vx = 11.57 m/s, vy = 13.79 m/s.");
  await page.clock.runFor(900);
  await page.getByRole("button", {name: "Pause"}).click();
  var t = await seconds(page);
  expect(t).toBeGreaterThan(0.9);
  expect(t).toBeLessThan(1.05);
  // The readouts show t rounded, so compare them with the model within that rounding.
  var st = M.stateAt(p, t);
  expect(Math.abs(parseFloat(await readout(page, "x").textContent()) - st.x)).toBeLessThan(0.07);
  expect(Math.abs(parseFloat(await readout(page, "y").textContent()) - st.y)).toBeLessThan(0.07);
  expect(Math.abs(parseFloat(await readout(page, "vy").textContent()) - st.vy)).toBeLessThan(0.06);
  await expect(readout(page, "vx")).toHaveText("11.57 m/s right");
  await expect(page.locator("#zsa-pj-insight")).toHaveText(/^Rising: vy is positive/);
  await page.clock.runFor(1000);
  expect(await seconds(page)).toBe(t);
  // Rapid Launch and Pause leave one loop: count animation frame callbacks over 1 s.
  await page.evaluate(() => {
    var raf = window.requestAnimationFrame.bind(window);
    window.__frames = 0;
    window.requestAnimationFrame = function (cb) { return raf(function (n) { window.__frames++; cb(n); }); };
  });
  for (var i = 0; i < 11; i++) await page.locator("#zsa-pj-play").click();
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
  await page.clock.runFor(400);
  var frames = await page.evaluate(() => window.__frames);
  expect(frames).toBeLessThanOrEqual(30);
  var t2 = await seconds(page);
  expect(t2 - t).toBeGreaterThan(0.3);
  expect(t2 - t).toBeLessThan(0.45);
});

test("slow motion runs at a quarter speed; pause at the top stops with vy = 0; then it lands with results", async ({page, problems}) => {
  void problems;
  await go(page, "?scenario=ground");
  var p = scenario("ground"), top = M.topTime(p), T = M.flightTime(p), end = M.stateAt(p, T);
  await page.getByRole("checkbox", {name: "Slow motion (¼ speed)"}).check();
  await page.getByRole("checkbox", {name: "Pause at the top"}).check();
  await page.getByRole("button", {name: "Launch", exact: true}).click();
  await page.clock.runFor(2000);
  var t = await seconds(page);
  expect(t).toBeGreaterThan(0.45);
  expect(t).toBeLessThan(0.53);
  await page.getByRole("checkbox", {name: "Slow motion (¼ speed)"}).uncheck();
  await page.clock.runFor(1500);
  await heard(page, "Paused at the top. Top of the path at " + M.fmt(top) + " s, " + M.fmt(M.maxHeight(p)) + " m high. vy is 0 m/s; vx is still 14.14 m/s; the acceleration is still 9.80 m/s² down.");
  await expectState(page, p, top);
  await expect(readout(page, "vy")).toHaveText("0.00 m/s");
  await expect(readout(page, "dir")).toHaveText("horizontally to the right");
  await expect(page.locator("#zsa-pj-insight")).toHaveText(M.insight(p, top));
  await expect(page.getByRole("slider", {name: "Time"})).toHaveAttribute("aria-valuetext", M.fmt(top) + " seconds, top of the path");
  await expect(page.getByRole("button", {name: "Resume"})).toBeVisible();
  await page.getByRole("button", {name: "Resume"}).click();
  await page.clock.runFor(2000);
  await heard(page, "Landed at " + M.fmt(T) + " s, " + M.fmt(end.x) + " m away. vx = 14.14 m/s, the same as at launch. vy = −14.14 m/s.");
  await expectState(page, p, T);
  await expect(page.locator("#zsa-pj-r-time")).toHaveText(M.fmt(T) + " s");
  await expect(page.locator("#zsa-pj-r-height")).toHaveText(M.fmt(M.maxHeight(p)) + " m at " + M.fmt(top) + " s");
  await expect(page.locator("#zsa-pj-r-range")).toHaveText(M.fmt(end.x) + " m");
  await expect(page.locator("#zsa-pj-r-landing")).toHaveText("20.00 m/s, 45° below horizontal");
  await expect(page.locator("#zsa-pj-insight")).toHaveText(M.insight(p, T));
  await expect(page.getByRole("button", {name: "Launch again"})).toBeVisible();
  // Without the pause it flies straight through the top, saying so.
  await page.getByRole("checkbox", {name: "Pause at the top"}).uncheck();
  await page.getByRole("button", {name: "Launch again"}).click();
  await page.clock.runFor(1600);
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
  await heard(page, "Top of the path at " + M.fmt(top) + " s, " + M.fmt(M.maxHeight(p)) + " m high. vy is 0 m/s; vx is still 14.14 m/s; the acceleration is still 9.80 m/s² down.");
  await page.getByRole("button", {name: "Reset"}).click();
  await heard(page, "Reset to the launch.");
  await expectState(page, p, 0);
  await expect(page.getByRole("button", {name: "Launch", exact: true})).toBeVisible();
});

test("the time slider: keyboard, readouts, the graph and the end of the flight", async ({page, problems}) => {
  void problems;
  await go(page, "?scenario=cliff");
  var p = scenario("cliff"), T = M.flightTime(p);
  var slider = page.getByRole("slider", {name: "Time"});
  await slider.focus();
  for (var i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
  await expectState(page, p, 1);
  await expect(slider).toHaveAttribute("aria-valuetext", "1.00 seconds");
  await expect(page.locator("#zsa-pj-insight")).toHaveText(M.insight(p, 1));
  await page.keyboard.press("End");
  await expectState(page, p, T);
  await expect(slider).toHaveAttribute("aria-valuetext", M.fmt(T) + " seconds, landed");
  await expect(page.locator("#zsa-pj-r-height")).toHaveText("40.00 m (the launch point)");
  await expect(page.getByRole("button", {name: "Launch again"})).toBeVisible();
  // The vy line ends at the landing value; vx stays flat.
  var pts = await page.locator("#zsa-pj-graph polyline").evaluateAll((els) => els.map((e) => e.getAttribute("points").split(" ")));
  var ys = pts[0].map((pt) => pt.split(",")[1]);
  expect(new Set(ys).size).toBe(1);
  expect(pts[1].length).toBeGreaterThan(50);
});

test("scenarios, sliders and a launch with no flight", async ({page, problems}) => {
  void problems;
  await go(page);
  for (var s of M.SCENARIOS) {
    await page.getByLabel("Start with a scenario").selectOption(s.id);
    await heard(page, s.label + ". " + s.text);
    await expect(page.locator("#zsa-pj-h0-out")).toHaveText(s.h0 + " m");
    await expect(page.locator("#zsa-pj-angle-out")).toHaveText(s.angle + "°");
    await expect(page.locator("#zsa-pj-speed-out")).toHaveText(M.fmt(s.speed, 1) + " m/s");
    await expect(graph(page)).toHaveAccessibleName(M.graphDescription(s));
    await expectState(page, s, 0);
  }
  await page.getByRole("slider", {name: "Launch angle, θ"}).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("custom");
  await expect(page.locator("#zsa-pj-angle-out")).toHaveText("21°");
  var p = {h0: 0, angle: 21, speed: 26};
  await expect(graph(page)).toHaveAccessibleName(M.graphDescription(p));
  await expect(page.locator("#zsa-pj-launch-parts")).toHaveText("At launch: vx = " + M.fmt(M.launch(p).vx) + " m/s, vy = " + M.fmt(M.launch(p).vy) + " m/s.");
  // A change part way through a flight starts over.
  await scrub(page, 1);
  await page.getByRole("slider", {name: "Launch speed, v₀"}).focus();
  await page.keyboard.press("ArrowLeft");
  await expectState(page, {h0: 0, angle: 21, speed: 25}, 0);
  // Along the ground: no flight, Launch disabled, and a message.
  await page.getByRole("slider", {name: "Launch angle, θ"}).focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("button", {name: "Launch", exact: true})).toBeDisabled();
  await expect(page.locator("#zsa-pj-insight")).toHaveText(M.insight({h0: 0, angle: 0, speed: 25}, 0));
  await expect(page.locator("#zsa-pj-results-note")).toHaveText("No flight: raise the angle or the launch height.");
  await expect(scene(page)).toHaveAccessibleName(/The ball cannot leave the ground\.$/);
  await page.getByRole("slider", {name: "Launch height, h₀"}).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", {name: "Launch", exact: true})).toBeEnabled();
});

test("questions: blank, wrong and right answers with feedback", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-pj-feedback p")).toHaveCount(5);
  await expect(page.locator("#zsa-pj-feedback p").first()).toHaveText("1. No answer yet.");
  await heard(page, /^0 of 5 correct\./);
  for (var q of M.QUESTIONS) {
    var wrong = q.choices.filter((c) => c.id !== q.answer)[0];
    await page.getByRole("group", {name: new RegExp("^" + (M.QUESTIONS.indexOf(q) + 1) + "\\. ")}).getByRole("radio", {name: wrong.text}).check();
  }
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-pj-feedback p").nth(1)).toHaveText("2. " + M.QUESTIONS[1].choices.filter((c) => c.id !== M.QUESTIONS[1].answer)[0].feedback);
  await heard(page, /^0 of 5 correct\./);
  for (var q2 of M.QUESTIONS) {
    var right = q2.choices.filter((c) => c.id === q2.answer)[0];
    await page.getByRole("group", {name: new RegExp("^" + (M.QUESTIONS.indexOf(q2) + 1) + "\\. ")}).getByRole("radio", {name: right.text}).check();
  }
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-pj-feedback p").first()).toHaveText("1. ✓ " + M.QUESTIONS[0].choices.filter((c) => c.id === M.QUESTIONS[0].answer)[0].feedback);
  await heard(page, /^5 of 5 correct\./);
});

test("CSV download and printing a long reflection", async ({page, problems}) => {
  void problems;
  await go(page, "?scenario=ground", {clock: false});
  var download = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download flight data (CSV)"}).click();
  var file = await download;
  expect(file.suggestedFilename()).toBe("zornscience-projectile-data.csv");
  expect(fs.readFileSync(await file.path(), "utf8")).toBe(M.csv(scenario("ground")));
  await expect(live(page)).toHaveText(/^Flight data downloaded/);
  var long = Array.from({length: 30}, (_, i) => "Line " + (i + 1) + ": vx stays the same.").join("\n");
  await page.getByLabel("Explain using evidence from the vectors.").fill(long);
  await scrub(page, 3);
  await page.emulateMedia({media: "print"});
  await expect(page.locator("#zsa-pj-print-reflection")).toBeVisible();
  await expect(page.locator("#zsa-pj-print-reflection")).toHaveText(long, {useInnerText: true});
  await expect(page.locator("#zsa-pj-print-summary")).toContainText("Launch: Ground to ground at 45°. h₀ = 0 m, θ = 45°, v₀ = 20.0 m/s");
  await expect(page.locator("#zsa-pj-print-summary")).toContainText("range 40.82 m.");
  await expect(scene(page)).toBeVisible();
  await expect(page.getByRole("button", {name: "Launch again"})).toBeHidden();
  await expect(page.getByLabel("Start with a scenario")).toBeHidden();
  await page.emulateMedia({media: "screen"});
  await page.evaluate(() => { window.print = () => document.body.setAttribute("data-printed", "yes"); });
  await page.getByRole("button", {name: "Print lab"}).click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
});

test("layout: no sideways scrolling from 320 to 1920 px and at 200% zoom; 44 px targets; the scene fits its card", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1024, 768], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?scenario=cliff&show=v,c,a,s", {clock: false});
    await scrub(page, 2.5);
    await page.getByRole("button", {name: "Check my answers"}).click();
    var sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, w + " px").toBeLessThanOrEqual(w);
    // Buttons, selects and sliders, and the labels of checkboxes and radio buttons (the whole label is the target).
    var small = await page.locator("main button:visible, main select:visible, main input[type=range]:visible, main label:has(input[type=checkbox]):visible, main label:has(input[type=radio]):visible")
      .evaluateAll((els) => els.map((e) => { var r = e.getBoundingClientRect(); return {name: e.textContent.trim() || e.id, w: r.width, h: r.height}; }).filter((r) => r.w < 44 || r.h < 44));
    expect(small, w + " px").toEqual([]);
    var box = await scene(page).boundingBox(), card = await page.locator("#zsa-pj-scene").evaluate((el) => el.parentElement.getBoundingClientRect().width);
    expect(box.width, w + " px scene").toBeLessThanOrEqual(card);
    var ticks = await scene(page).locator("text").evaluateAll((els) => Math.min(...els.map((e) => e.getBoundingClientRect().height)));
    expect(ticks, w + " px scene text").toBeGreaterThanOrEqual(10);
  }
});

test("axe-core: no violations in three states at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "", {clock: false});
    await audit(page, w + " default");
    await page.getByRole("checkbox", {name: SHOW.a}).check();
    await page.getByRole("checkbox", {name: SHOW.s}).check();
    await scrub(page, 4);
    await page.getByRole("button", {name: "Check my answers"}).click();
    await page.getByLabel("Explain using evidence from the vectors.").fill("vx stays the same.");
    await audit(page, w + " landed with every arrow and checked answers");
    await page.emulateMedia({media: "print"});
    await audit(page, w + " print");
    await page.emulateMedia({media: "screen"});
  }
});

test("deep links, back link, embed mode, network and storage", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page, "", {clock: false});
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", DEFAULT_BACK);
  var origin = new URL(page.url()).origin;
  requests.forEach((u) => expect(u.startsWith(origin), u).toBe(true));
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u, u).toContain("?v="));
  requests.filter((u) => /projectile-lab\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  await page.getByRole("button", {name: "Launch", exact: true}).click();
  await page.getByLabel("Explain using evidence from the vectors.").fill("Notes");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.reload();
  await expect(page.getByLabel("Explain using evidence from the vectors.")).toHaveValue("");

  await go(page, "?scenario=steep&show=a,s&slow=1&pausetop=1", {clock: false});
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("steep");
  await expect(page.getByRole("checkbox", {name: SHOW.v})).not.toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.c})).not.toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.a})).toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.s})).toBeChecked();
  await expect(page.getByRole("checkbox", {name: "Slow motion (¼ speed)"})).toBeChecked();
  await expect(page.getByRole("checkbox", {name: "Pause at the top"})).toBeChecked();
  await go(page, "?h=30&angle=60&speed=25", {clock: false});
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("custom");
  await expect(page.locator("#zsa-pj-h0-out")).toHaveText("30 m");
  await expect(page.locator("#zsa-pj-angle-out")).toHaveText("60°");
  await expect(page.locator("#zsa-pj-speed-out")).toHaveText("25.0 m/s");
  await go(page, "?scenario=cliff&h=40", {clock: false});
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("cliff");
  // Off a slider, between steps, unknown or malformed: ignored.
  await go(page, "?scenario=nope&h=51&angle=12.5&speed=abc&show=v,x", {clock: false});
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("ledge");
  await expect(page.getByRole("checkbox", {name: SHOW.v})).toBeChecked();
  await expect(page.getByRole("checkbox", {name: SHOW.c})).toBeChecked();
  await go(page, "?show=none", {clock: false});
  for (var k of Object.keys(SHOW)) await expect(page.getByRole("checkbox", {name: SHOW[k]})).not.toBeChecked();

  var lesson = "https://zornscience.org/science/physics/unit-2-two-dimensional-motion/projectile-motion/";
  await go(page, "?from=" + encodeURIComponent(lesson), {clock: false});
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", lesson);
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad), {clock: false});
    await expect(page.getByRole("link", {name: "← Back to the lesson"}), bad).toHaveAttribute("href", DEFAULT_BACK);
  }
  await go(page, "?embed=1&scenario=low&from=" + encodeURIComponent(lesson), {clock: false});
  await expect(page.locator("#zsa-pj-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  await expect(page.getByLabel("Start with a scenario")).toHaveValue("low");
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
});

test("landing page links to the Projectile Motion Vector Lab", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Projectile Motion Vector Lab"}).click();
  await expect(page).toHaveTitle("Projectile Motion Vector Lab | ZornScience");
});
