// Limiting Reactant Visualizer (limiting-reactant/): the defaults, React all on a fake clock with predictions that
// lock and are checked, React once and Pause, Start over, the steppers, typed amounts and the reaction menu, reduced
// motion, the exact ratio and a missing reactant, one animation loop, the questions, printing, layout and 44 px
// targets, axe-core at two sizes, deep links, embed mode, network and storage, and the landing page link. Selects by
// role, label, id and text, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/chemistry/unit-6-stoichiometry/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "limiting-reactant", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

// Pages on the fake clock: the live region fills 50 ms after an announcement, so heard() moves the clock on first.
var clocked = new WeakSet();
async function go(page, query, opts) {
  opts = opts || {};
  await page.addInitScript(seedRandom, 5);
  if (opts.reduce) await page.emulateMedia({reducedMotion: "reduce"});
  if (opts.clock !== false) {
    clocked.add(page);
    await page.clock.install({time: new Date("2026-10-18T12:00:00")});
    await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
  }
  await page.goto("/limiting-reactant/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Limiting Reactant Visualizer"})).toBeVisible();
}
function live(page) { return page.locator("#zsa-lr-live"); }
async function heard(page, text) {
  if (clocked.has(page)) await page.clock.runFor(100);
  await expect(live(page)).toHaveText(text);
}
function status(page) { return page.locator("#zsa-lr-status"); }
function box(page) { return page.locator("#zsa-lr-canvas"); }
function row(page, name) { return page.locator("#zsa-lr-tbody tr").filter({has: page.getByRole("rowheader", {name: name, exact: true})}).locator("td"); }
function amount(page, i) { return page.getByRole("spinbutton", {name: "Starting moles of " + i}); }
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("opens on 2 H₂ + O₂ → 2 H₂O with 6 mol H₂ and 5 mol O₂, ready to react", async ({page, problems}) => {
  void problems;
  await go(page);
  await expect(page.getByLabel("Reaction", {exact: true})).toHaveValue("water");
  await expect(page.locator("#zsa-lr-rxn option")).toHaveText(["Water from hydrogen and oxygen", "Ammonia from nitrogen and hydrogen", "Hydrogen chloride from hydrogen and chlorine", "Carbon dioxide from carbon monoxide and oxygen"]);
  await expect(page.locator("#zsa-lr-equation")).toHaveText("2 H₂ + O₂ → 2 H₂O");
  await expect(amount(page, "H₂")).toHaveValue("6");
  await expect(amount(page, "O₂")).toHaveValue("5");
  await expect(page.locator("#zsa-lr-scale")).toHaveText("Each molecule in the box stands for 1/2 mol. Molecules are drawn flat, not to scale.");
  await expect(page.getByRole("radio", {name: "H₂", exact: true})).toBeEnabled();
  await expect(page.getByRole("radio", {name: "Both at the same time"})).toBeVisible();
  await expect(page.getByRole("textbox", {name: "How many mol of H₂O will form?"})).toHaveValue("");
  await expect(status(page)).toHaveText("Ready: 12 H₂ and 10 O₂ molecules. Predict, then press React all or React once.");
  await expect(box(page)).toHaveAttribute("aria-label", "Reaction box for 2 H₂ + O₂ → 2 H₂O. Reactant side: 12 H₂ molecules and 10 O₂ molecules. Product side: 0 H₂O molecules. Each molecule in the box stands for 1/2 mol.");
  await expect(page.locator("#zsa-lr-thead th")).toHaveText(["H₂", "O₂", "H₂Oproduct"]);
  await expect(row(page, "Before")).toHaveText(["6", "5", "0"]);
  await expect(row(page, "Change")).toHaveText(["0", "0", "0"]);
  await expect(row(page, "After")).toHaveText(["6", "5", "0"]);
  await expect(row(page, "Molecules in the box")).toHaveText(["12", "10", "0"]);
  await expect(page.locator("#zsa-lr-legend")).toHaveText(/H hydrogen.*O oxygen.*Left over \(excess\)/);
  await expect(page.locator("#zsa-lr-why-body")).toHaveText(/^React to find out\./);
  await expect(page.getByRole("button", {name: "1 mol more O₂"})).toHaveAttribute("aria-disabled", "false");
  await expect(page.locator("#zsa-lr-questions fieldset")).toHaveCount(4);
});

test("React all pairs the molecules up on a fake clock, locks and checks the predictions, and strands the excess", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("radio", {name: "H₂", exact: true}).check();
  await page.getByRole("textbox", {name: "How many mol of H₂O will form?"}).fill("6");
  await page.getByRole("button", {name: "React all"}).click();
  await heard(page, "Reacting.");
  await expect(page.getByRole("button", {name: "Pause"})).toBeVisible();
  await expect(page.getByRole("radio", {name: "H₂", exact: true})).toBeDisabled();
  await expect(page.getByRole("textbox", {name: "How many mol of H₂O will form?"})).toBeDisabled();
  await expect(page.getByRole("button", {name: "React once"})).toHaveAttribute("aria-disabled", "true");
  // A reaction every 0.5 s, each 0.6 s after it starts: 2 done by 1.2 s.
  await page.clock.runFor(1100);
  await expect(status(page)).toHaveText("Reacting: 2 of 6 reactions.");
  await expect(row(page, "After")).toHaveText(["4", "4", "2"]);
  await expect(row(page, "Change")).toHaveText(["−2", "−1", "+2"]);
  await page.clock.runFor(3000);
  await expect(status(page)).toHaveText("Stopped. 6 mol H₂O made. H₂ is the limiting reactant; 2 mol O₂ is in excess.");
  await heard(page, /^The reaction stopped\. 6 mol H₂O made\. .* The 4 O₂ molecules left \(2 mol\) have no H₂ to react with, so they are stranded\..* ✓ You predicted that H₂ would run out first\. Right\. ✓ You predicted 6 mol H₂O\. The reaction made 6 mol\.$/);
  await expect(row(page, "After")).toHaveText(["0", "2", "6"]);
  await expect(row(page, "Molecules in the box")).toHaveText(["0", "4", "12"]);
  await expect(page.locator("#zsa-lr-tbody .zsa-lr-left")).toHaveText(["2"]);
  await expect(page.locator("#zsa-lr-thead th")).toHaveText(["H₂limiting", "O₂excess", "H₂Oproduct"]);
  await expect(box(page)).toHaveAttribute("aria-label", /Reactant side: 0 H₂ molecules and 4 O₂ molecules\. Product side: 12 H₂O molecules\..* 4 O₂ molecules are stranded with nothing to react with\.$/);
  var why = page.locator("#zsa-lr-why-body p");
  await expect(why).toHaveText([
    "6 mol H₂O made. H₂ is the limiting reactant; 2 mol O₂ is in excess.",
    /^The reaction stopped because every H₂ molecule has reacted\./,
    /^The equation needs 2 H₂ for every 1 O₂\. To use all 6 mol H₂ you need 3 mol O₂\./,
    "✓ You predicted that H₂ would run out first. Right.",
    "✓ You predicted 6 mol H₂O. The reaction made 6 mol."
  ]);
  await expect(page.getByRole("button", {name: "React all"})).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("button", {name: "React once"})).toHaveAttribute("aria-disabled", "true");
  // Start over keeps the predictions and unlocks them.
  await page.getByRole("button", {name: "Start over"}).click();
  await heard(page, "Started over. 6 mol H₂ and 5 mol O₂: 12 H₂ and 10 O₂ molecules in the box.");
  await expect(page.getByRole("radio", {name: "H₂", exact: true})).toBeChecked();
  await expect(page.getByRole("radio", {name: "H₂", exact: true})).toBeEnabled();
  await expect(row(page, "After")).toHaveText(["6", "5", "0"]);
  await expect(page.locator("#zsa-lr-thead th")).toHaveText(["H₂", "O₂", "H₂Oproduct"]);
});

test("React once, Pause, and a wrong prediction", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("radio", {name: "O₂", exact: true}).check();
  await page.getByRole("textbox", {name: "How many mol of H₂O will form?"}).fill("10");
  await page.getByRole("button", {name: "React once"}).click();
  await heard(page, "Reaction 1 of 6: 2 H₂ and 1 O₂ make 2 H₂O.");
  await page.clock.runFor(700);
  await expect(row(page, "After")).toHaveText(["5", "4.5", "1"]);
  await expect(status(page)).toHaveText("1 of 6 reactions done. Keep reacting to see where it stops.");
  await expect(page.locator("#zsa-lr-why-body")).toHaveText("1 of 6 reactions so far. The explanation appears when the reaction stops.");
  await page.getByRole("button", {name: "React all"}).click();
  await page.clock.runFor(600);
  await page.getByRole("button", {name: "Pause"}).click();
  await heard(page, /^Paused after [23] of 6 reactions\.$/);
  var after = await row(page, "After").allTextContents();
  await page.clock.runFor(3000);
  // Reactions already gathering finish; no new ones start.
  expect(Number((await row(page, "After").allTextContents())[0])).toBeGreaterThan(0);
  expect(Number((await row(page, "After").allTextContents())[0])).toBeGreaterThanOrEqual(Number(after[0]) - 1);
  for (var i = 0; i < 6; i++) {
    if (await page.getByRole("button", {name: "React once"}).getAttribute("aria-disabled") === "true") break;
    await page.getByRole("button", {name: "React once"}).click();
    await page.clock.runFor(700);
  }
  await expect(status(page)).toHaveText(/^Stopped\./);
  await expect(page.locator("#zsa-lr-why-body .zsa-lr-notyet")).toHaveText([
    "You predicted that O₂ would run out first. In fact H₂ ran out first.",
    "You predicted 10 mol H₂O. The reaction made 6 mol. The amount of product is set by the limiting reactant, not by the reactant you have more of."
  ]);
});

test("the steppers, typed amounts and the reaction menu start over and clear the predictions", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("radio", {name: "H₂", exact: true}).check();
  await page.getByRole("button", {name: "1 mol more O₂"}).click();
  await expect(amount(page, "O₂")).toHaveValue("6");
  await expect(page.getByRole("radio", {name: "H₂", exact: true})).not.toBeChecked();
  await expect(row(page, "Before")).toHaveText(["6", "6", "0"]);
  await page.clock.runFor(500);
  await heard(page, "6 mol H₂ and 6 mol O₂: 12 H₂ and 12 O₂ molecules in the box.");
  // At the ends of the range the buttons stay focusable but do nothing.
  await amount(page, "H₂").fill("10");
  await expect(row(page, "Before")).toHaveText(["10", "6", "0"]);
  var up = page.getByRole("button", {name: "1 mol more H₂"});
  await expect(up).toHaveAttribute("aria-disabled", "true");
  await up.click({force: true});
  await expect(amount(page, "H₂")).toHaveValue("10");
  await expect(up).toBeFocused();
  // A value that is not a whole number from 0 to 10 is not used, and goes back when the field is left.
  await amount(page, "H₂").fill("12");
  await amount(page, "H₂").blur();
  await expect(amount(page, "H₂")).toHaveValue("10");
  await amount(page, "H₂").fill("2.5");
  await amount(page, "H₂").blur();
  await expect(amount(page, "H₂")).toHaveValue("10");
  await expect(row(page, "Before")).toHaveText(["10", "6", "0"]);
  await page.getByLabel("Reaction", {exact: true}).selectOption("ammonia");
  await expect(page.locator("#zsa-lr-equation")).toHaveText("N₂ + 3 H₂ → 2 NH₃");
  await expect(page.locator("#zsa-lr-scale")).toHaveText(/^Each molecule in the box stands for 1\/3 mol\./);
  await expect(amount(page, "N₂")).toHaveValue("10");
  await expect(amount(page, "H₂")).toHaveValue("6");
  await expect(page.getByRole("radio", {name: "N₂", exact: true})).toBeVisible();
  await expect(page.getByRole("textbox", {name: "How many mol of NH₃ will form?"})).toBeVisible();
  await expect(row(page, "Molecules in the box")).toHaveText(["30", "18", "0"]);
  await expect(page.locator("#zsa-lr-legend")).toHaveText(/N nitrogen.*H hydrogen/);
});

test("reduced motion: nothing drifts, and React all and React once happen at once", async ({page, problems}) => {
  void problems;
  await go(page, "?rxn=ammonia&a=3&b=7", {reduce: true, clock: false});
  await page.getByRole("button", {name: "React once"}).click();
  await expect(row(page, "Molecules in the box")).toHaveText(["8", "18", "2"]);
  await page.getByRole("button", {name: "React all"}).click();
  await expect(status(page)).toHaveText("Stopped. 4.67 mol NH₃ made. H₂ is the limiting reactant; 0.67 mol N₂ is in excess.");
  await expect(row(page, "After")).toHaveText(["0.67", "0", "4.67"]);
  await expect(row(page, "Change")).toHaveText(["−2.33", "−7", "+4.67"]);
  await expect(page.locator("#zsa-lr-thead th")).toHaveText(["N₂excess", "H₂limiting", "NH₃product"]);
  await expect(page.locator("#zsa-lr-why-body p").nth(3)).toHaveText("You did not make a prediction this time. Change the amounts and predict before you react.");
});

test("the exact ratio leaves nothing over, and a missing reactant means no reaction", async ({page, problems}) => {
  void problems;
  await go(page, "?rxn=hcl&a=4&b=4", {reduce: true, clock: false});
  await page.getByRole("radio", {name: "Both at the same time"}).check();
  await page.getByRole("button", {name: "React all"}).click();
  await expect(status(page)).toHaveText("Stopped. 8 mol HCl made. Neither reactant is in excess.");
  await expect(page.locator("#zsa-lr-thead th")).toHaveText(["H₂limiting", "Cl₂limiting", "HClproduct"]);
  await expect(page.locator("#zsa-lr-tbody .zsa-lr-left")).toHaveCount(0);
  await expect(page.locator("#zsa-lr-why-body .zsa-lr-ok")).toHaveText(["✓ You predicted that both would run out together. Right."]);
  await expect(box(page)).toHaveAttribute("aria-label", /The reaction has stopped with nothing left over\.$/);

  await page.goto("/limiting-reactant/?rxn=co2&a=0&b=4");
  await page.getByRole("button", {name: "React once"}).click();
  await expect(status(page)).toHaveText("Stopped. No CO₂ made: CO is missing.");
  await expect(page.locator("#zsa-lr-why-body p").nth(1)).toHaveText(/^The reaction could not start: there is no CO\. The 8 O₂ molecules left \(4 mol\)/);

  await page.goto("/limiting-reactant/?a=0&b=0");
  await page.getByRole("button", {name: "React all"}).click();
  await expect(status(page)).toHaveText("Stopped. Nothing in the box, so nothing made.");
  await expect(page.locator("#zsa-lr-why-body p").nth(1)).toHaveText("There is nothing in the box. Add some of each reactant.");
});

test("one animation loop however fast the buttons are pressed", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => {
    var raf = window.requestAnimationFrame.bind(window);
    window.__rafCalls = 0;
    window.requestAnimationFrame = function (cb) { window.__rafCalls++; return raf(cb); };
  });
  await go(page);
  await page.evaluate(() => {
    for (var i = 0; i < 6; i++) {
      document.getElementById("zsa-lr-once").click();
      document.getElementById("zsa-lr-reset").click();
      document.getElementById("zsa-lr-play").click();
      document.getElementById("zsa-lr-play").click();
    }
    window.__rafCalls = 0;
  });
  await page.clock.runFor(1000);
  expect(await page.evaluate(() => window.__rafCalls)).toBeLessThanOrEqual(70);
});

test("check your thinking: blanks, wrong and right answers", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-lr-feedback p")).toHaveText(["1. No answer yet.", "2. No answer yet.", "3. No answer yet.", "4. No answer yet."]);
  await heard(page, /^0 of 4 correct\./);
  await page.getByRole("radio", {name: "the limiting reactant is used up."}).check();
  await page.getByRole("radio", {name: "neither, because the amounts are equal."}).check();
  await page.getByRole("radio", {name: "H₂, even though there is more of it."}).check();
  await page.getByRole("radio", {name: "more H₂O."}).check();
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-lr-feedback .zsa-lr-ok")).toHaveText([/^1\. ✓ Yes\./, /^3\. ✓ Yes\./]);
  await expect(page.locator("#zsa-lr-feedback .zsa-lr-notyet")).toHaveText([/^2\. Not quite\. Equal moles/, /^4\. Not quite\. H₂ already runs out first/]);
  await heard(page, /^2 of 4 correct\./);
});

test("printing shows the set up line, the box, the table and the whole reflection, without the controls", async ({page, problems}) => {
  void problems;
  await go(page, "", {reduce: true, clock: false});
  await page.getByRole("button", {name: "React all"}).click();
  var text = Array.from({length: 30}, (_, i) => "Line " + (i + 1)).join("\n");
  await page.getByLabel("Explain using what you saw in the box.").fill(text);
  await page.emulateMedia({media: "print", reducedMotion: "reduce"});
  await expect(page.locator("#zsa-lr-print-summary")).toHaveText("2 H₂ + O₂ → 2 H₂O, starting with 6 mol H₂ and 5 mol O₂. 6 mol H₂O made. H₂ is the limiting reactant; 2 mol O₂ is in excess.");
  await expect(page.locator("#zsa-lr-print-reflection")).toBeVisible();
  await expect(page.locator("#zsa-lr-print-reflection")).toContainText("Line 30");
  await expect(box(page)).toBeVisible();
  await expect(page.locator("#zsa-lr-table")).toBeVisible();
  for (var id of ["play", "print", "reflection", "rxn"]) await expect(page.locator("#zsa-lr-" + id)).toBeHidden();
  await page.emulateMedia({media: "screen", reducedMotion: "reduce"});
  await page.evaluate(() => { window.__printed = 0; window.print = function () { window.__printed++; }; });
  await page.getByRole("button", {name: "Print"}).click();
  expect(await page.evaluate(() => window.__printed)).toBe(1);
});

test("layout: no sideways scrolling and 44 px targets at nine sizes", async ({page, problems}) => {
  void problems;
  await go(page, "", {clock: false});
  await page.getByRole("button", {name: "React all"}).click();
  await page.waitForTimeout(4500);
  await expect(status(page)).toHaveText(/^Stopped\./);
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

test("axe-core finds nothing at two sizes, before and after reacting", async ({page, problems}) => {
  void problems;
  await go(page, "", {clock: false});
  await audit(page, "1366 start");
  await page.getByRole("radio", {name: "O₂", exact: true}).check();
  await page.getByRole("button", {name: "React all"}).click();
  await page.waitForTimeout(4500);
  await expect(status(page)).toHaveText(/^Stopped\./);
  await page.getByRole("button", {name: "Check my answers"}).click();
  await audit(page, "1366 stopped");
  await page.setViewportSize({width: 390, height: 664});
  await audit(page, "390");
});

test("deep links, the back link, embed mode, network and storage", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page, "?rxn=co2&a=7&b=2&from=" + encodeURIComponent("https://zornscience.org/science/chemistry/unit-6-stoichiometry/limiting-reactants/"));
  await expect(page.locator("#zsa-lr-equation")).toHaveText("2 CO + O₂ → 2 CO₂");
  await expect(amount(page, "CO")).toHaveValue("7");
  await expect(amount(page, "O₂")).toHaveValue("2");
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", "https://zornscience.org/science/chemistry/unit-6-stoichiometry/limiting-reactants/");
  expect(requests.every((u) => u.startsWith("http://127.0.0.1:"))).toBe(true);
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);

  for (var q of ["?rxn=soap", "?a=11", "?a=2.5", "?b=-1", "?a=", "?b=abc"]) {
    await page.goto("/limiting-reactant/" + q);
    await expect(page.locator("#zsa-lr-equation")).toHaveText("2 H₂ + O₂ → 2 H₂O");
    await expect(amount(page, "H₂")).toHaveValue("6");
    await expect(amount(page, "O₂")).toHaveValue("5");
  }
  for (var bad of ["https://evil.example/", "http://zornscience.org/x", "https://zornscience.org.evil.example/", "https://user@zornscience.org/", "https://zornscience.org:8443/", "javascript:alert(1)", "not a url", "//zornscience.org/"]) {
    await page.goto("/limiting-reactant/?from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", DEFAULT_BACK);
  }
  await page.goto("/limiting-reactant/?embed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
});

test("the landing page links to the visualizer", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Limiting Reactant Visualizer"}).click();
  await expect(page).toHaveURL(/\/limiting-reactant\/$/);
  await expect(page.getByRole("heading", {level: 1, name: "Limiting Reactant Visualizer"})).toBeVisible();
});
