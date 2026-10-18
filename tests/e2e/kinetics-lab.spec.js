// Kinetics and Collision Theory Sandbox (kinetics-lab/): the defaults, running and pausing on a fake clock (one
// animation loop however fast Play and Pause are pressed), the readouts against the model, the sliders by keyboard,
// the catalyst, marks on the graph, new runs kept for comparison, the energy charts, the questions, CSV export,
// printing, reduced motion, layout and 44 px targets, axe-core at two sizes, deep links, embed mode, network and
// storage, and the landing page link. Selects by role, label, id and text, and fails on console errors or CSP
// violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var M = require("../../kinetics-lab/sim.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/ap-chemistry/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "kinetics-lab", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

// Pages on the fake clock: the live region fills 50 ms after an announcement, so heard() moves the clock on first.
var clocked = new WeakSet();
async function fakeClock(page) {
  clocked.add(page);
  await page.clock.install({time: new Date("2026-10-18T12:00:00")});
  await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
}
async function go(page, query, opts) {
  opts = opts || {};
  await page.addInitScript(seedRandom, opts.seed === undefined ? 5 : opts.seed);
  if (opts.clock !== false) await fakeClock(page);
  await page.goto("/kinetics-lab/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Kinetics and Collision Theory Sandbox"})).toBeVisible();
}
function live(page) { return page.locator("#zsa-kn-live"); }
async function heard(page, text) {
  if (clocked.has(page)) await page.clock.runFor(100);
  await expect(live(page)).toHaveText(text);
}
function readout(page, id) { return page.locator("#zsa-kn-" + id + "-value"); }
async function seconds(page) { return parseFloat(await readout(page, "time").textContent()); }
function graph(page) { return page.getByRole("img", {name: /^Concentration versus time graph/}); }
function box(page) { return page.locator("#zsa-kn-canvas"); }
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("opens at 0.50 M, 300 K and Ea 8.0 kJ/mol, running, with the readouts and charts", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page.getByLabel(/^Temperature/)).toHaveValue("300");
  await expect(page.getByLabel(/^Concentration of A and B/)).toHaveValue("0.5");
  await expect(page.getByLabel(/^Activation energy/)).toHaveValue("8");
  await expect(page.locator("#zsa-kn-temp-out")).toHaveText("300 K");
  await expect(page.locator("#zsa-kn-conc-out")).toHaveText("0.50 M");
  await expect(page.locator("#zsa-kn-ea-out")).toHaveText("8.0 kJ/mol");
  await expect(page.getByLabel(/^Temperature/)).toHaveAttribute("aria-valuetext", "300 kelvin");
  await expect(page.getByLabel(/^Concentration of A and B/)).toHaveAttribute("aria-valuetext", "0.50 molar, 50 particles each of A and B");
  await expect(page.getByRole("button", {name: "Add a catalyst"})).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
  await expect(page.locator("#zsa-kn-status")).toHaveText("Running.");
  await expect(readout(page, "time")).toHaveText("0.0 s");
  await expect(readout(page, "a")).toHaveText("0.50 M");
  await expect(readout(page, "pct")).toHaveText("none yet");
  await expect(box(page)).toHaveAttribute("aria-label", /^Box at 300 K after 0\.0 s: 50 A and 50 B particles, 0 C and 0 D particles\./);
  await expect(graph(page)).toHaveAccessibleName("Concentration versus time graph, 0 to 30 s, 0 to 0.6 M. No data yet.");
  await expect(page.locator("#zsa-kn-energy-text")).toHaveText("At 300 K, the average collision energy (RT) is 2.49 kJ/mol. Collision theory predicts that 4.0% of A-B collisions have at least Ea = 8.0 kJ/mol.");
  await expect(page.getByRole("img", {name: /^Energy profile\. The reactants A \+ B climb a barrier of 8\.0 kJ\/mol and end as C \+ D, 10 kJ\/mol lower\.$/})).toBeVisible();
  await expect(page.getByRole("img", {name: /^Collision energies at 300 K: .* The share at or above Ea = 8\.0 kJ\/mol is shaded: 4\.0%\. Bars: 0 A-B collisions/})).toBeVisible();
  await expect(page.locator("#zsa-kn-questions fieldset")).toHaveCount(4);
  await expect(page.locator("#zsa-kn-earlier")).toBeHidden();
});

test("runs in real time on a fake clock, pauses and plays, and the readouts agree with the counts", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.clock.runFor(3000);
  var t = await seconds(page);
  expect(t).toBeGreaterThan(2.8);
  expect(t).toBeLessThan(3.1);
  await page.getByRole("button", {name: "Pause"}).click();
  await expect(page.getByRole("button", {name: "Play"})).toBeVisible();
  await expect(page.locator("#zsa-kn-status")).toHaveText("Paused.");
  await heard(page, /^Paused at \d+\.\d s\. \[A\] is 0\.\d\d M\. \d+ of \d+ A-B collisions have been successful\./);
  var paused = await readout(page, "time").textContent();
  await page.clock.runFor(2000);
  await expect(readout(page, "time")).toHaveText(paused);
  // The readouts and descriptions from the live run.
  var text = await live(page).textContent();
  var m = text.match(/\[A\] is (0\.\d\d) M\. (\d+) of (\d+)/);
  await expect(readout(page, "a")).toHaveText(m[1] + " M");
  expect(Number(m[1])).toBeCloseTo(0.5 - Number(m[2]) * 0.01, 5);
  await expect(page.locator("#zsa-kn-energy-text")).toContainText("So far this run, " + m[2] + " of " + m[3] + " A-B collisions");
  await expect(graph(page)).toHaveAccessibleName(new RegExp("\\[A\\] falls from 0\\.50 to " + m[1].replace(".", "\\.") + " M"));
  await expect(box(page)).toHaveAttribute("aria-label", new RegExp("^Box at 300 K after " + paused.replace(" s", "").replace(".", "\\.") + " s: " + Math.round(Number(m[1]) * 100) + " A"));
  await page.getByRole("button", {name: "Play"}).click();
  await heard(page, "Running.");
  await page.clock.runFor(1000);
  expect(await seconds(page)).toBeGreaterThan(parseFloat(paused) + 0.9);
  // Line points: the [A] and [C] lines and a marker for now.
  await expect(page.locator("#zsa-kn-graph .zsa-kn-line-a")).toHaveCount(1);
  await expect(page.locator("#zsa-kn-graph .zsa-kn-line-c")).toHaveCount(1);
  await expect(page.locator("#zsa-kn-dist .zsa-kn-bar").first()).toBeVisible();
});

test("one animation loop however fast Play and Pause are pressed", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => {
    var raf = window.requestAnimationFrame.bind(window);
    window.__rafCalls = 0;
    window.requestAnimationFrame = function (cb) { window.__rafCalls++; return raf(cb); };
  });
  await go(page);
  await page.evaluate(() => {
    var b = document.getElementById("zsa-kn-play");
    for (var i = 0; i < 12; i++) b.click();
    window.__rafCalls = 0;
  });
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
  var before = await seconds(page);
  await page.clock.runFor(1000);
  var after = await seconds(page);
  expect(after - before).toBeGreaterThan(0.9);
  expect(after - before).toBeLessThan(1.1);
  expect(await page.evaluate(() => window.__rafCalls)).toBeLessThanOrEqual(70);
});

test("the sliders by keyboard: temperature and Ea apply at once and mark the graph", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.clock.runFor(2000);
  var temp = page.getByLabel(/^Temperature/);
  await temp.focus();
  for (var i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(temp).toHaveValue("400");
  await expect(temp).toHaveAttribute("aria-valuetext", "400 kelvin");
  await expect(page.locator("#zsa-kn-temp-out")).toHaveText("400 K");
  var f = M.percent(M.fractionAbove(8, 400));
  await expect(page.locator("#zsa-kn-energy-text")).toContainText("At 400 K, the average collision energy (RT) is 3.33 kJ/mol. Collision theory predicts that " + f);
  await page.clock.runFor(500);
  await heard(page, "Temperature 400 K. " + f + " of collisions have enough energy to react.");
  await expect(page.locator("#zsa-kn-graph .zsa-kn-mark-label")).toHaveText(["400 K"]);
  await expect(graph(page)).toHaveAccessibleName(/Changes: 400 K at 2\.\d s\./);
  var ea = page.getByLabel(/^Activation energy/);
  await ea.focus();
  await page.clock.runFor(1500);
  await page.keyboard.press("Home");
  await expect(ea).toHaveValue("2");
  await expect(page.locator("#zsa-kn-ea-out")).toHaveText("2.0 kJ/mol");
  await expect(page.locator("#zsa-kn-graph .zsa-kn-mark-label")).toHaveText(["400 K", "Ea 2.0"]);
  await expect(page.getByRole("img", {name: /^Energy profile\. The reactants A \+ B climb a barrier of 2\.0 kJ\/mol/})).toBeVisible();
});

test("the catalyst halves Ea, shows the second path and the threshold, and is marked", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.clock.runFor(1500);
  await page.getByRole("button", {name: "Add a catalyst"}).click();
  var cat = page.getByRole("button", {name: "Remove the catalyst"});
  await expect(cat).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#zsa-kn-catalyst-text")).toHaveText("Catalyst in the box: Ea is lowered from 8.0 to 4.0 kJ/mol.");
  await heard(page, "Catalyst added. Ea is now 4.0 kJ/mol, so 20% of collisions have enough energy.");
  await expect(page.locator("#zsa-kn-profile .zsa-kn-curve-cat")).toHaveCount(1);
  await expect(page.locator("#zsa-kn-dist .zsa-kn-ealine-old")).toHaveCount(1);
  await expect(page.getByRole("img", {name: /or 4\.0 kJ\/mol by the catalyst's pathway/})).toBeVisible();
  await expect(page.locator("#zsa-kn-energy-text")).toContainText("predicts that 20% of A-B collisions have at least Ea = 4.0 kJ/mol");
  await expect(page.locator("#zsa-kn-graph .zsa-kn-mark-label")).toHaveText(["Catalyst added"]);
  await page.clock.runFor(1500);
  await cat.click();
  await expect(page.getByRole("button", {name: "Add a catalyst"})).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#zsa-kn-profile .zsa-kn-curve-cat")).toHaveCount(0);
  await expect(page.locator("#zsa-kn-graph .zsa-kn-mark-label")).toHaveText(["Catalyst added", "Catalyst removed"]);
});

test("a new concentration starts a new run; earlier runs stay on the graph (up to 3) until cleared", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.clock.runFor(4000);
  var conc = page.getByLabel(/^Concentration of A and B/);
  await conc.focus();
  for (var i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(conc).toHaveValue("1");
  await expect(readout(page, "a")).not.toHaveText("1.00 M", {timeout: 100});
  // The new run starts once the value settles.
  await page.clock.runFor(400);
  await expect(readout(page, "a")).toHaveText(/^(1\.00|0\.9\d) M$/);
  await expect(readout(page, "time")).toHaveText(/^0\.\d s$/);
  await expect(page.locator("#zsa-kn-runs li")).toHaveCount(1);
  await expect(page.locator("#zsa-kn-runs li").first()).toHaveText(/^Run 1: 0\.50 M, 300 K, Ea 8\.0 kJ\/mol\. /);
  await heard(page, "New run 2: 1.00 M, 300 K, Ea 8.0 kJ/mol, 100 A and 100 B particles. Run 1 is kept on the graph.");
  await expect(page.locator("#zsa-kn-graph .zsa-kn-old")).toHaveCount(1);
  await expect(graph(page)).toHaveAccessibleName(/0 to 1\.0 M\. .*Earlier run 1 \(0\.50 M, 300 K, Ea 8\.0 kJ\/mol\)/);
  await expect(box(page)).toHaveAttribute("aria-label", /^Box at 300 K after 0\.\d s: (100|9\d) A and (100|9\d) B particles/);
  // New run keeps up to 3 earlier runs, numbered, oldest dropped. A run under 1 s is not kept.
  for (var k = 0; k < 3; k++) {
    await page.clock.runFor(1500);
    await page.getByRole("button", {name: "New run"}).click();
  }
  await page.getByRole("button", {name: "New run"}).click();
  await expect(page.locator("#zsa-kn-runs li")).toHaveCount(3);
  await expect(page.locator("#zsa-kn-runs li").first()).toHaveText(/^Run \d+: 1\.00 M/);
  await expect(page.locator("#zsa-kn-graph .zsa-kn-old-label")).toHaveCount(3);
  await page.getByRole("button", {name: "Clear earlier runs"}).click();
  await expect(page.locator("#zsa-kn-earlier")).toBeHidden();
  await expect(page.locator("#zsa-kn-graph .zsa-kn-old")).toHaveCount(0);
  await heard(page, "Earlier runs cleared from the graph.");
  await expect(page.getByRole("button", {name: "New run"})).toBeFocused();
});

test("half of A is announced, and a finished run offers Play for a new run", async ({page, problems}) => {
  void problems;
  await go(page, "?ea=2&conc=0.1&temp=600");
  for (var i = 0; i < 60 && !(await page.locator("#zsa-kn-status").textContent()).startsWith("All of A"); i++) await page.clock.runFor(5000);
  await expect(page.locator("#zsa-kn-status")).toHaveText(/^All of A has reacted at \d+\.\d s\. Press Play for a new run\.$/);
  await heard(page, /^All of A has reacted at \d+\.\d s\.$/);
  await expect(readout(page, "a")).toHaveText("0.00 M");
  await expect(graph(page)).toHaveAccessibleName(/Half of A was used up at \d+\.\d s\./);
  await page.getByRole("button", {name: "Play"}).click();
  await expect(readout(page, "a")).toHaveText("0.10 M");
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
  await expect(page.locator("#zsa-kn-runs li")).toHaveCount(1);
});

test("check your thinking: blanks, wrong and right answers", async ({page, problems}) => {
  void problems;
  await go(page, "", {clock: false});
  await page.getByRole("button", {name: "Check my answers"}).click();
  var fb = page.locator("#zsa-kn-feedback");
  await expect(fb.locator("p")).toHaveText(["1. No answer yet.", "2. No answer yet.", "3. No answer yet.", "4. No answer yet."]);
  await heard(page, /^0 of 4 correct\./);
  await page.getByRole("group", {name: /^1\. Raising the temperature/}).getByLabel("the activation energy gets smaller.").check();
  await page.getByRole("group", {name: /^2\. If you double/}).getByLabel("four times as fast.").check();
  await page.getByRole("group", {name: /^3\. A catalyst/}).getByLabel("offers a pathway with a lower activation energy.").check();
  await page.getByRole("group", {name: /^4\. As the reaction goes on/}).getByLabel("fewer A and B particles are left to collide.").check();
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(fb.locator("p").first()).toHaveText(/^1\. Not quite\. Temperature does not change Ea/);
  await expect(fb.locator("p.zsa-kn-ok")).toHaveCount(3);
  await expect(fb.locator("p").nth(1)).toHaveText(/^2\. ✓ Yes\. Twice as many A/);
  await heard(page, /^3 of 4 correct\./);
  await page.getByLabel("a larger fraction of collisions have at least the activation energy.").check();
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(fb.locator("p.zsa-kn-ok")).toHaveCount(4);
});

test("CSV download and printing", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.clock.runFor(2000);
  await page.getByRole("button", {name: "Pause"}).click();
  var [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", {name: "Download run data (CSV)"}).click()]);
  expect(download.suggestedFilename()).toBe("zornscience-kinetics-data.csv");
  var csv = fs.readFileSync(await download.path(), "utf8").trim().split("\n");
  expect(csv[0]).toBe("Time (s),[A] (M),[B] (M),[C] (M),[D] (M),A-B collisions,Successful collisions");
  expect(csv[1]).toBe("0.00,0.50,0.50,0.00,0.00,0,0");
  expect(csv[2]).toMatch(/^0\.25,0\.\d\d,0\.\d\d,0\.\d\d,0\.\d\d,\d+,\d+$/);
  expect(csv.length).toBeGreaterThanOrEqual(9);
  await heard(page, /^Run data downloaded as zornscience-kinetics-data\.csv: \d+ rows/);
  var long = Array.from({length: 30}, (_, i) => "Line " + (i + 1) + " of my reflection.").join("\n");
  await page.getByLabel("Explain using evidence from your runs.").fill(long);
  await page.emulateMedia({media: "print"});
  await expect(page.locator("#zsa-kn-print-summary")).toHaveText(/^Run 1: 0\.50 M, 300 K, Ea 8\.0 kJ\/mol\. After \d+\.\d s, \[A\] = 0\.\d\d M; \d+ of \d+ A-B collisions were successful\./);
  await expect(page.locator("#zsa-kn-print-reflection")).toHaveText(long, {useInnerText: true});
  await expect(page.locator("#zsa-kn-print-reflection")).toBeVisible();
  for (var id of ["zsa-kn-play", "zsa-kn-reflection", "zsa-kn-csv", "zsa-kn-print"]) await expect(page.locator("#" + id)).toBeHidden();
  await expect(graph(page)).toBeVisible();
  await expect(box(page)).toBeVisible();
  await page.emulateMedia({media: "screen"});
  await page.evaluate(() => { window.print = () => document.body.setAttribute("data-printed", "yes"); });
  await page.getByRole("button", {name: "Print lab"}).click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
});

test("reduced motion starts paused until Play", async ({page, problems}) => {
  void problems;
  await page.emulateMedia({reducedMotion: "reduce"});
  await go(page);
  await expect(page.getByRole("button", {name: "Play"})).toBeVisible();
  await expect(page.locator("#zsa-kn-status")).toHaveText("Paused because your device asks for less motion. Press Play to run.");
  await page.clock.runFor(1000);
  await expect(readout(page, "time")).toHaveText("0.0 s");
  await page.getByRole("button", {name: "Play"}).click();
  await page.clock.runFor(1000);
  expect(await seconds(page)).toBeGreaterThan(0.9);
});

test("layout: no sideways scrolling and 44 px targets at nine sizes", async ({page, problems}) => {
  void problems;
  await go(page, "", {clock: false});
  await page.waitForTimeout(2500);
  await page.getByRole("button", {name: "Add a catalyst"}).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", {name: "New run"}).click();
  await page.getByRole("button", {name: "Check my answers"}).click();
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1024, 768], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await page.waitForTimeout(200);
    var r = await page.evaluate(() => {
      var small = [];
      document.querySelectorAll("button, input, select, textarea, a").forEach((el) => {
        var b = el.getBoundingClientRect();
        if (!b.width || el.closest("[hidden]")) return;
        var target = el.type === "radio" ? el.closest("label").getBoundingClientRect() : b;
        if (target.height < 43.5 || (el.type !== "radio" && target.width < 43.5)) small.push((el.id || el.type || el.tagName) + " " + Math.round(target.width) + "x" + Math.round(target.height));
      });
      return {scroll: document.documentElement.scrollWidth - window.innerWidth, small: small};
    });
    expect(r.scroll, w + "x" + h + " sideways scroll").toBeLessThanOrEqual(0);
    expect(r.small, w + "x" + h + " small targets").toEqual([]);
  }
});

test("axe-core finds nothing at two sizes, running and after answers", async ({page, problems}) => {
  void problems;
  await go(page, "", {clock: false});
  await page.waitForTimeout(2000);
  await audit(page, "1366 start");
  await page.getByRole("button", {name: "Add a catalyst"}).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", {name: "New run"}).click();
  await page.getByRole("button", {name: "Check my answers"}).click();
  await audit(page, "1366 compared");
  await page.setViewportSize({width: 390, height: 664});
  await audit(page, "390");
});

test("deep links, the back link, embed mode, network and storage", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page, "?temp=450&conc=0.25&ea=12.5&catalyst=1&from=" + encodeURIComponent("https://zornscience.org/science/ap-chemistry/kinetics/"));
  await expect(page.locator("#zsa-kn-temp-out")).toHaveText("450 K");
  await expect(page.locator("#zsa-kn-conc-out")).toHaveText("0.25 M");
  await expect(page.locator("#zsa-kn-ea-out")).toHaveText("12.5 kJ/mol");
  await expect(page.getByRole("button", {name: "Remove the catalyst"})).toHaveAttribute("aria-pressed", "true");
  await expect(readout(page, "a")).toHaveText("0.25 M");
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", "https://zornscience.org/science/ap-chemistry/kinetics/");
  expect(requests.every((u) => u.startsWith("http://127.0.0.1:"))).toBe(true);
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);

  for (var q of ["?temp=455", "?temp=900", "?conc=0.12", "?ea=abc", "?ea=", "?catalyst=yes"]) {
    await page.goto("/kinetics-lab/" + q);
    await expect(page.locator("#zsa-kn-temp-out")).toHaveText("300 K");
    await expect(page.locator("#zsa-kn-conc-out")).toHaveText("0.50 M");
    await expect(page.locator("#zsa-kn-ea-out")).toHaveText("8.0 kJ/mol");
    await expect(page.getByRole("button", {name: "Add a catalyst"})).toBeVisible();
  }
  for (var bad of ["https://evil.example/", "http://zornscience.org/x", "https://zornscience.org.evil.example/", "https://user@zornscience.org/", "https://zornscience.org:8443/", "javascript:alert(1)", "not a url", "//zornscience.org/"]) {
    await page.goto("/kinetics-lab/?from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", DEFAULT_BACK);
  }
  await page.goto("/kinetics-lab/?embed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
});

test("the landing page links to the sandbox", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Kinetics and Collision Theory Sandbox"}).click();
  await expect(page).toHaveURL(/\/kinetics-lab\/$/);
  await expect(page.getByRole("heading", {level: 1, name: "Kinetics and Collision Theory Sandbox"})).toBeVisible();
});
