// The Test Policy Checker (test-policy-checker/): every state from the State list, the map and the small-state buttons
// opens its list with the same count as the data; search; the policy filter and the map counts; keyboard use of the
// map with a visible focus ring; deep links and the back link; phone layout and target sizes; Spanish; local files
// only and no storage; axe-core. Selects by role, id, ARIA state and text, and fails on any console error or CSP
// violation (the `problems` fixture).
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var {test, expect} = require("./fixtures");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DIR = path.join(__dirname, "..", "..", "test-policy-checker");
function load(file) {
  var value;
  var root = {addEventListener: function (name, handler) { handler({detail: {receive: function (v) { value = v; }}}); }};
  vm.runInNewContext(fs.readFileSync(path.join(DIR, file), "utf8"), {document: {querySelector: function () { return root; }}});
  return value;
}
var data = load("data.js"), map = load("map.js");
var COUNTS = {};
data.schools.forEach(function (s) { COUNTS[s[0]] = (COUNTS[s[0]] || 0) + 1; });
var SMALL = Object.keys(map.states).filter(function (c) { return map.states[c].small; });

async function go(page, query) {
  await page.goto("/test-policy-checker/" + (query || ""));
  await page.waitForSelector("#zsa-tpc-map svg g[data-state]");
}
function heading(page) { return page.locator("#zsa-tpc-results-title"); }
function cards(page) { return page.locator("#zsa-tpc-list > li"); }
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("every state from the State list shows all its schools, as many as the data has", async ({page, problems}) => {
  void problems;
  test.setTimeout(300000);
  await go(page);
  await expect(page.getByText("Policies change every admissions cycle. Confirm on the college's page before you apply.")).toBeVisible();
  var options = await page.locator("#zsa-tpc-state option").evaluateAll((os) => os.map((o) => o.value).filter(Boolean));
  expect(options.sort()).toEqual(Object.keys(data.states).sort());
  for (var code of options) {
    await page.selectOption("#zsa-tpc-state", code);
    var n = COUNTS[code], name = data.states[code][0];
    await expect(heading(page)).toHaveText(name + ": " + n + (n === 1 ? " public university" : " public universities"));
    await expect(cards(page)).toHaveCount(n);
    await expect(page).toHaveURL(new RegExp("[?&]state=" + code + "(&|$)"));
  }
  // Each card names its school, policy, tests or an explanation, and the page that was checked.
  await page.selectOption("#zsa-tpc-state", "IL");
  var first = cards(page).first();
  await expect(first.getByRole("heading", {level: 3})).toHaveText("Chicago State University");
  await expect(first.getByText("Test optional")).toBeVisible();
  await expect(first.getByText("Tests accepted:")).toBeVisible();
  var link = first.getByRole("link", {name: /Admissions testing page/});
  await expect(link).toHaveAttribute("href", /^https:\/\/(www\.)?csu\.edu\//);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAccessibleName("Admissions testing page (opens in a new tab)");
  await expect(first.getByText("Checked November 23, 2026")).toBeVisible();
});

test("every state on the map and every small-state button opens its list", async ({page, problems}) => {
  void problems;
  test.setTimeout(300000);
  await page.setViewportSize({width: 1366, height: 1000});
  await go(page);
  for (var code of Object.keys(map.states)) {
    if (SMALL.indexOf(code) >= 0) {
      await page.locator("#zsa-tpc-small button[data-state='" + code + "']").click();
    } else {
      // Click where the state's label is drawn, so the label point must lie on the state's own shape.
      await page.locator("#zsa-tpc-map svg").scrollIntoViewIfNeeded();
      var at = await page.evaluate(([c, x, y]) => {
        var svg = document.querySelector("#zsa-tpc-map svg"), pt = svg.createSVGPoint();
        pt.x = x; pt.y = y;
        var p = pt.matrixTransform(svg.getScreenCTM());
        var hit = document.elementFromPoint(p.x, p.y);
        return {x: p.x, y: p.y, hit: hit && hit.closest("g[data-state]") ? hit.closest("g[data-state]").getAttribute("data-state") : null, c: c};
      }, [code, map.states[code].label[0], map.states[code].label[1]]);
      expect(at.hit, code + " label point is on its own shape").toBe(code);
      await page.mouse.click(at.x, at.y);
    }
    await expect(cards(page)).toHaveCount(COUNTS[code]);
    await expect(page.locator("#zsa-tpc-state")).toHaveValue(code);
    await expect(page.locator("#zsa-tpc-map g[data-state='" + code + "']")).toHaveAttribute("aria-pressed", "true");
  }
  await expect(page.locator("#zsa-tpc-live")).toHaveText(/Wyoming: 1 public university/);
});

test("search finds schools in every state, and the policy filter narrows the list and labels the map", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByLabel("Search by school name").fill("purdue");
  await expect(heading(page)).toHaveText(/^\d+ schools match “purdue”$/);
  await expect(cards(page).first()).toContainText("Indiana");
  await page.getByLabel("Search by school name").fill("zzzz");
  await expect(heading(page)).toContainText("No school matches");
  await expect(cards(page)).toHaveCount(0);
  await page.getByLabel("Search by school name").fill("");

  await page.selectOption("#zsa-tpc-policy", "required");
  var required = data.schools.filter((s) => s[3] === "required");
  await expect(heading(page)).toHaveText(required.length + " schools in all states have this policy: Test required");
  await expect(cards(page)).toHaveCount(required.length);
  var fl = required.filter((s) => s[0] === "FL").length;
  await expect(page.locator("#zsa-tpc-map g[data-state='FL'] text")).toHaveText("FL " + fl);
  await expect(page.locator("#zsa-tpc-map g[data-state='FL']")).toHaveAttribute("aria-label", "FL " + fl + ", Florida, " + fl + " with this policy");
  await expect(page.locator("#zsa-tpc-shade-note")).toBeVisible();
  await page.selectOption("#zsa-tpc-state", "FL");
  await expect(cards(page)).toHaveCount(fl);
  await expect(page.locator("#zsa-tpc-results-status")).toHaveText(fl + " of " + COUNTS.FL + " have this policy: Test required.");
  await expect(page).toHaveURL(/state=FL&policy=required/);
  await page.selectOption("#zsa-tpc-policy", "all");
  await expect(cards(page)).toHaveCount(COUNTS.FL);
});

test("the map is one Tab stop that the arrow keys move around, with a visible focus ring", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByLabel("Policy").focus();
  await page.keyboard.press("Tab");
  var focused = () => page.evaluate(() => document.activeElement.getAttribute("data-state"));
  expect(await focused()).toBe("IL");
  var stroke = await page.locator("#zsa-tpc-map g[data-state='IL'] path").evaluate((p) => getComputedStyle(p).strokeWidth);
  expect(parseFloat(stroke)).toBeGreaterThanOrEqual(4);
  await page.keyboard.press("ArrowRight");
  expect(await focused()).toBe("IN");
  await page.keyboard.press("ArrowLeft");
  expect(await focused()).toBe("IL");
  await page.keyboard.press("ArrowUp");
  expect(await focused()).toBe("WI");
  await page.keyboard.press("Enter");
  await expect(heading(page)).toHaveText("Wisconsin: " + COUNTS.WI + " public universities");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.locator("#zsa-tpc-state")).not.toHaveValue("WI");
  // Only one state is in the Tab order, and Tab leaves the map for the small-state buttons.
  expect(await page.locator("#zsa-tpc-map g[tabindex='0']").count()).toBe(1);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement.closest("#zsa-tpc-small") !== null)).toBe(true);
});

test("deep links, the back link and the policy legend", async ({page, problems}) => {
  void problems;
  await go(page, "?state=tx&policy=optional&from=https%3A%2F%2Fzornscience.org%2Fstudents%2Fafter-high-school%2Ffour-year-colleges%2F");
  await expect(page.locator("#zsa-tpc-state")).toHaveValue("TX");
  await expect(page.locator("#zsa-tpc-policy")).toHaveValue("optional");
  await expect(cards(page)).toHaveCount(data.schools.filter((s) => s[0] === "TX" && s[3] === "optional").length);
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", "https://zornscience.org/students/after-high-school/four-year-colleges/");
  await go(page, "?q=Rutgers");
  await expect(heading(page)).toContainText("match “Rutgers”");
  await go(page, "?from=https%3A%2F%2Fevil.example%2F&state=ZZ");
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toBeHidden();
  await expect(cards(page)).toHaveCount(0);
  await page.getByText("What the policies mean").click();
  await expect(page.locator("#zsa-tpc-legend dt")).toHaveCount(7);
  await expect(page.locator("#zsa-tpc-legend")).toContainText("The college does not look at ACT or SAT scores for admission, even if you send them.");
});

test("unconfirmed and no-first-year schools say so instead of a policy", async ({page, problems}) => {
  void problems;
  await go(page, "?state=VA");
  var uva = cards(page).filter({hasText: "University of Virginia"}).first();
  await expect(uva.getByText("Not confirmed")).toBeVisible();
  await expect(uva).toContainText("We could not confirm this policy on the college's own page.");
  await go(page, "?q=Central%20Texas");
  await expect(cards(page).filter({hasText: "No first-year admission"})).toHaveCount(1);
});

test("phone layout: no sideways scroll, 44 px targets, results scroll into view", async ({page, problems}) => {
  void problems;
  for (var width of [320, 390]) {
    await page.setViewportSize({width: width, height: 760});
    await go(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (var el of await page.locator("#zsa-tpc-controls select, #zsa-tpc-controls input, #zsa-tpc-small button, summary").all()) {
      var box = await el.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.locator("#zsa-tpc-small button[data-state='RI']").click();
    await expect(heading(page)).toBeInViewport();
    await audit(page, "phone " + width);
  }
});

test("Spanish: interface, policies, exceptions and dates in Mexican Spanish; school names in English", async ({page, problems}) => {
  void problems;
  await go(page, "?lang=es&state=CA");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.getByRole("heading", {level: 1})).toHaveText("Verificador de políticas de exámenes");
  await expect(page.getByText("Las políticas cambian en cada ciclo de admisión. Confírmalas en la página de la universidad antes de solicitar.")).toBeVisible();
  await expect(heading(page)).toHaveText("California: " + COUNTS.CA + " universidades públicas");
  await expect(page.locator("#zsa-tpc-state option:checked")).toHaveText("California");
  var irvine = cards(page).filter({hasText: "University of California, Irvine"}).first();
  await expect(irvine.getByText("Sin examen")).toBeVisible();
  await expect(irvine.getByText("Exámenes aceptados:")).toBeVisible();
  await expect(irvine.getByRole("link")).toHaveAccessibleName("Página de exámenes de admisión (en inglés) (se abre en una pestaña nueva)");
  await expect(irvine.getByText("Revisado el 23 de noviembre de 2026")).toBeVisible();
  await page.selectOption("#zsa-tpc-state", "LA");
  await expect(heading(page)).toHaveText("Luisiana: " + COUNTS.LA + " universidades públicas");
  // Every exception shown is the Spanish one from the data.
  var es = data.schools.filter((s) => s[0] === "LA" && s[7]).map((s) => s[7]);
  for (var line of es) await expect(page.getByText(line, {exact: true}).first()).toBeVisible();
  // No English interface text is left in the results area.
  var text = await page.locator("#zsa-tpc-results").innerText();
  expect(text).not.toMatch(/Tests accepted|Checked |public universit|This page|Admissions testing|Test (optional|required|free|flexible)/);
  await audit(page, "Spanish");
});

test("local files only, nothing stored, and no axe violations at laptop size", async ({page, problems}) => {
  void problems;
  var urls = [];
  page.on("request", (r) => urls.push(r.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, "")));
  await go(page, "?state=NY");
  urls.forEach((u) => expect(u.startsWith("/"), "outside request " + u).toBe(true));
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await audit(page, "New York");
  await page.selectOption("#zsa-tpc-policy", "varies");
  await audit(page, "filter");
  await page.getByRole("button", {name: "Instructions", exact: true}).click();
  await audit(page, "instructions");
});
