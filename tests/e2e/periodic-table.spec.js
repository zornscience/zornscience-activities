// The Periodic Table reference (periodic-table/): layout at every target size, the keyboard grid, search, the
// details panel, every color mode, deep links, the back link, embed mode, network and axe-core. Like the other
// browser tests it selects by role, id, ARIA state and text, never by class name, and fails on any console error
// or CSP violation (the `problems` fixture).
"use strict";
var fs = require("fs");
var {test, expect} = require("./fixtures");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var SIZES = [[320, 568], [360, 640], [390, 664], [683, 384], [768, 1024], [1280, 617], [1366, 657], [1920, 960]];
var MODES = [["category", "Category"], ["block", "Block"], ["radius", "Atomic radius"], ["electronegativity", "Electronegativity"], ["ionization", "Ionization energy"]];

async function go(page, query) {
  await page.goto("/periodic-table/" + (query || ""));
  await page.waitForSelector("#zsa-pt-grid tbody");
}
function cell(page, symbol) { return page.getByRole("gridcell", {name: new RegExp("^[A-Z][a-z]+, " + symbol + ", atomic number ")}); }
async function focused(page) {
  return page.evaluate(() => {
    var el = document.activeElement;
    if (!el || el === document.body) return "body";
    if (el.getAttribute("role") === "gridcell") return "cell:" + el.querySelector("[aria-hidden] span:nth-child(2)").textContent;
    return el.id ? "#" + el.id : el.tagName.toLowerCase();
  });
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// Sizes of everything a student can press, and how the page and the table region scroll.
function measure() {
  var main = document.querySelector("main");
  function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  var targets = [].filter.call(main.querySelectorAll("button, a, summary, input[type=search], label:has(input), td[role=gridcell]"), visible).map(function (el) {
    var r = el.getBoundingClientRect();
    return {el: (el.textContent || el.id || el.tagName).trim().slice(0, 30), w: r.width, h: r.height};
  });
  var region = document.getElementById("zsa-pt-scroll"), grid = document.getElementById("zsa-pt-grid").getBoundingClientRect();
  var cells = [].map.call(main.querySelectorAll("td[role=gridcell]"), function (td) { return td.getBoundingClientRect(); });
  return {
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    regionOverflow: region.scrollWidth - region.clientWidth,
    small: targets.filter(function (t) { return t.w < 44 || t.h < 44; }),
    grid: {top: grid.top, bottom: grid.bottom, left: grid.left, right: grid.right},
    cellsOnScreen: cells.every(function (r) { return r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth; }),
    cue: getComputedStyle(main.querySelector("#zsa-pt-scroll").previousElementSibling).display !== "none",
    regionLabel: region.getAttribute("aria-label")
  };
}

test("periodic table: layout, scrolling and 44 px targets at every size", async ({page, problems}) => {
  void problems;
  for (var [w, h] of SIZES) {
    await page.setViewportSize({width: w, height: h});
    for (var [mode] of MODES) {
      await go(page, "?mode=" + mode);
      var m = await page.evaluate(measure);
      var where = w + "x" + h + " " + mode;
      expect(m.pageOverflow, where + " page scrolls sideways").toBeLessThanOrEqual(0);
      expect(m.small, where + " small targets").toEqual([]);
      if (w < 900) {
        expect(m.regionOverflow, where + " table scrolls in its region").toBeGreaterThan(0);
        expect(m.cue, where + " scroll cue").toBe(true);
        expect(m.regionLabel).toMatch(/Periodic table/);
      } else {
        expect(m.regionOverflow, where + " table fits the width").toBeLessThanOrEqual(0);
        expect(m.cue).toBe(false);
      }
      if (w === 1366 && h === 657) expect(m.cellsOnScreen, where + " whole table on screen").toBe(true);
    }
    // Details open (the panel is outside the scrolling region on phones).
    await go(page, "?mode=radius&el=Og");
    var d = await page.evaluate(measure);
    expect(d.pageOverflow, w + " details open").toBeLessThanOrEqual(0);
    expect(d.small, w + " details open small targets").toEqual([]);
  }
});

test("periodic table: keyboard grid with one Tab stop", async ({page, problems}) => {
  void problems;
  await go(page);
  expect(await focused(page)).toBe("body");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // Exactly one cell is in the Tab order, and Tab from the search reaches it.
  expect(await page.locator("#zsa-pt-grid [tabindex='0']").count()).toBe(1);
  await page.locator("#zsa-pt-find").focus();
  await page.keyboard.press("Tab");
  expect(await focused(page)).toBe("cell:H");
  await page.keyboard.press("Tab");
  expect(await focused(page)).not.toMatch(/^cell:/);
  await page.keyboard.press("Shift+Tab");
  expect(await focused(page)).toBe("cell:H");
  var moves = [
    ["ArrowRight", "He"], ["ArrowDown", "Ne"], ["ArrowLeft", "F"], ["Home", "Li"], ["ArrowUp", "H"], ["ArrowUp", "H"],
    ["ArrowDown", "Li"], ["ArrowRight", "Be"], ["ArrowRight", "B"], ["ArrowUp", "He"], ["ArrowDown", "Ne"],
    ["ArrowDown", "Ar"], ["ArrowDown", "Kr"], ["Home", "K"], ["End", "Kr"], ["ArrowLeft", "Br"],
    ["Home", "K"], ["ArrowRight", "Ca"], ["ArrowRight", "Sc"], ["ArrowUp", "Mg"], ["ArrowRight", "Al"],
    ["ArrowDown", "Ga"], ["ArrowDown", "In"], ["ArrowLeft", "Cd"], ["Home", "Rb"], ["ArrowRight", "Sr"], ["ArrowRight", "Y"],
    ["ArrowDown", "La"], ["ArrowUp", "Y"], ["ArrowDown", "La"], ["ArrowRight", "Ce"], ["ArrowUp", "Rf"], ["ArrowDown", "Ce"],
    ["End", "Lu"], ["ArrowDown", "Lr"], ["ArrowDown", "Lr"], ["Home", "Ac"], ["ArrowUp", "La"],
    ["Control+End", "Og"], ["ArrowDown", "Lu"], ["Control+Home", "H"]
  ];
  for (var [key, symbol] of moves) {
    await page.keyboard.press(key);
    expect(await focused(page), key + " to " + symbol).toBe("cell:" + symbol);
    expect(await page.locator("#zsa-pt-grid [tabindex='0']").count()).toBe(1);
  }
  // Arrows never open details.
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Element details");
  // Enter opens the details and moves focus to them; Escape closes them and returns to the element.
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowRight"); // Be
  await page.keyboard.press("Enter");
  expect(await focused(page)).toBe("#zsa-pt-details-title");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Beryllium");
  await expect(cell(page, "Be")).toHaveAttribute("aria-selected", "true");
  expect(page.url()).toContain("el=Be");
  await page.keyboard.press("Escape");
  expect(await focused(page)).toBe("cell:Be");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Element details");
  expect(await page.locator("#zsa-pt-grid [aria-selected]").count()).toBe(0);
  expect(page.url()).not.toContain("el=");
  // Space also opens; Escape from the close button closes.
  await page.keyboard.press("Space");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Beryllium");
  await page.getByRole("button", {name: "Close details"}).focus();
  await page.keyboard.press("Escape");
  expect(await focused(page)).toBe("cell:Be");
  // The close button returns focus too.
  await page.keyboard.press("Enter");
  await page.getByRole("button", {name: "Close details"}).click();
  expect(await focused(page)).toBe("cell:Be");
});

test("periodic table: details show every property", async ({page, problems}) => {
  void problems;
  await go(page);
  await cell(page, "Cu").click();
  var panel = page.locator("#zsa-pt-details");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Copper");
  var text = (await panel.innerText()).replace(/\s+/g, " ");
  ["Atomic number 29", "Symbol Cu", "Atomic mass 63.55", "Group 11", "Period 4", "Block d-block", "Type Metal",
    "State at room temperature Solid", "Electron configuration 1s2 2s2 2p6 3s2 3p6 4s1 3d10", "Noble-gas configuration [Ar] 4s1 3d10",
    "Common ion charges 2+ copper(II) ion, 1+ copper(I) ion", "Electronegativity (Pauling) 1.9", "Atomic radius (covalent) 112 pm",
    "First ionization energy 746 kJ/mol", "Exception: the filling order predicts [Ar] 4s2 3d9"].forEach(function (t) { expect(text).toContain(t); });
  await cell(page, "S").click();
  text = (await panel.innerText()).replace(/\s+/g, " ");
  ["Valence electrons 6", "Common ion charges 2− sulfide ion", "Atomic mass 32.06"].forEach(function (t) { expect(text).toContain(t); });
  await cell(page, "Og").click();
  text = (await panel.innerText()).replace(/\s+/g, " ");
  ["Atomic mass [294]", "Electronegativity (Pauling) No data", "First ionization energy No data", "State at room temperature Unknown",
    "No common simple ion", "predicted from calculations", "Brackets: mass number"].forEach(function (t) { expect(text).toContain(t); });
  await cell(page, "La").click();
  text = (await panel.innerText()).replace(/\s+/g, " ");
  expect(text).toContain("Group None (f-block row)");
  // No hyphen-minus used as a charge anywhere in any element's details.
  for (var z = 1; z <= 118; z += 1) {
    await page.locator("#zsa-pt-el-" + z).click();
    var ions = await panel.locator("dt:text('Common ion charges') + dd").innerText();
    expect(ions, "element " + z).not.toMatch(/\d-/);
  }
});

test("periodic table: every color mode, legend and screen reader names", async ({page, problems}) => {
  void problems;
  await go(page);
  var legend = page.locator("#zsa-pt-legend li");
  var expectations = {
    category: {legend: ["Metal", "Nonmetal", "Metalloid"], name: "Fluorine, F, atomic number 9, Nonmetal", shown: ""},
    block: {legend: ["s-block", "p-block", "d-block", "f-block"], name: "Fluorine, F, atomic number 9, p-block", shown: "p"},
    radius: {legend: ["30 to 60", "60 to 90", "90 to 120", "120 to 150", "150 to 180", "180 to 210", "210 to 240", "No data"], name: "Fluorine, F, atomic number 9, Atomic radius 64 picometers", shown: "64"},
    electronegativity: {legend: ["0.5 to 1.0", "1.0 to 1.5", "1.5 to 2.0", "2.0 to 2.5", "2.5 to 3.0", "3.0 to 3.5", "3.5 to 4.0", "No data"], name: "Fluorine, F, atomic number 9, Electronegativity 3.98", shown: "3.98"},
    ionization: {legend: ["300 to 600", "600 to 900", "900 to 1200", "1200 to 1500", "1500 to 1800", "1800 to 2100", "2100 to 2400", "No data"], name: "Fluorine, F, atomic number 9, First ionization energy 1681 kilojoules per mole", shown: "1681"}
  };
  for (var [mode, label] of MODES) {
    await page.getByRole("radio", {name: label}).check();
    var x = expectations[mode];
    expect(await legend.allInnerTexts()).toEqual(x.legend);
    await expect(page.getByRole("gridcell", {name: x.name, exact: true})).toHaveCount(1);
    expect((await cell(page, "F").locator("[aria-hidden]").innerText()).replace(/\s+/g, " ").trim()).toBe(("9 F " + x.shown).trim());
    expect(new URL(page.url()).searchParams.get("mode") || "category").toBe(mode);
    var heat = mode !== "category" && mode !== "block";
    await expect(page.locator("#zsa-pt-trends")).toBeVisible({visible: heat});
    await expect(page.locator("#zsa-pt-across")).toBeVisible({visible: heat});
    if (heat) {
      await expect(page.locator("#zsa-pt-key-title")).toContainText(mode === "radius" ? "(pm)" : mode === "ionization" ? "(kJ/mol)" : "(Pauling scale)");
      var sentences = await page.locator("#zsa-pt-trend-text p").allInnerTexts();
      expect(sentences.join(" ")).toMatch(/effective nuclear charge/);
      expect(sentences.join(" ")).toMatch(/energy level/);
      if (mode === "ionization") expect(sentences.join(" ")).toMatch(/group 2 to 13 and from group 15 to 16/);
      expect(await page.locator("#zsa-pt-across").innerText()).toBe("Across a period: " + (mode === "radius" ? "decreases" : "increases"));
      expect(await page.locator("#zsa-pt-down").innerText()).toBe("Down a group: " + (mode === "radius" ? "increases" : "decreases"));
    }
  }
  // Elements with no value are grayed, say "n/a" and are read as "no data".
  await page.getByRole("radio", {name: "Electronegativity"}).check();
  await expect(page.getByRole("gridcell", {name: "Neon, Ne, atomic number 10, Electronegativity: no data", exact: true})).toHaveCount(1);
  expect((await cell(page, "Ne").locator("[aria-hidden]").innerText()).replace(/\s+/g, " ").trim()).toBe("10 Ne n/a");
  // Trend arrows can be turned off and the choice is in the URL.
  await page.getByRole("checkbox", {name: "Show trend arrows"}).uncheck();
  await expect(page.locator("#zsa-pt-across")).toBeHidden();
  expect(await page.locator("#zsa-pt-trend-text p").count()).toBe(0);
  expect(new URL(page.url()).searchParams.get("trends")).toBe("0");
});

test("periodic table: search highlights the match and moves focus to it", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 390, height: 664});
  await go(page);
  var input = page.getByLabel("Find an element");
  var cases = [["iron", "Fe"], ["fe", "Fe"], ["26", "Fe"], ["Og", "Og"], ["118", "Og"], ["aluminium", "Al"], ["sulphur", "S"], ["Caesium", "Cs"],
    ["oxy", "O"], ["  CHLORINE ", "Cl"], ["n", "N"], ["lead", "Pb"], ["tung", "W"]];
  for (var [q, symbol] of cases) {
    await input.fill(q);
    await input.press("Enter");
    expect(await focused(page), q).toBe("cell:" + symbol);
    await expect(cell(page, symbol)).toHaveAttribute("aria-selected", "true");
    expect(await page.locator("#zsa-pt-grid [aria-selected]").count()).toBe(1);
    await expect(page.locator("#zsa-pt-status")).toContainText("Press Enter for details");
    // The match is scrolled into view inside the table region, and the page never scrolls sideways.
    var box = await cell(page, symbol).boundingBox();
    expect(box.x >= 0 && box.x + box.width <= 390, q + " visible").toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }
  // Enter on the match opens its details below the table without scrolling the table.
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Tungsten");
  var title = await page.locator("#zsa-pt-details-title").boundingBox();
  expect(title.y >= 0 && title.y < 664).toBe(true);
  for (var bad of ["xyz", "0", "119"]) {
    await input.fill(bad);
    await page.getByRole("button", {name: "Find"}).click();
    await expect(page.locator("#zsa-pt-status")).toContainText("No element matches");
    expect(await focused(page)).toBe("#zsa-pt-find");
  }
  await input.fill("");
  await input.press("Enter");
  await expect(page.locator("#zsa-pt-status")).toHaveText("Type a name, a symbol or an atomic number.");
});

test("periodic table: deep links and the back link", async ({page, problems}) => {
  void problems;
  await go(page, "?mode=electronegativity&el=F");
  await expect(page.getByRole("radio", {name: "Electronegativity"})).toBeChecked();
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Fluorine");
  await expect(cell(page, "F")).toHaveAttribute("aria-selected", "true");
  await expect(cell(page, "F")).toHaveAttribute("tabindex", "0");
  expect(await focused(page)).toBe("body"); // a deep link never moves focus on load
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await go(page, "?el=26&mode=radius");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Iron");
  await expect(page.getByRole("radio", {name: "Atomic radius"})).toBeChecked();
  await go(page, "?mode=ionization&el=xx");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Element details");
  await go(page, "?mode=nonsense");
  await expect(page.getByRole("radio", {name: "Category"})).toBeChecked();
  await go(page, "?mode=radius&trends=0");
  await expect(page.getByRole("checkbox", {name: "Show trend arrows"})).not.toBeChecked();
  await expect(page.locator("#zsa-pt-across")).toBeHidden();
  // A deep link on a phone scrolls the table region to the element, not the page.
  await page.setViewportSize({width: 360, height: 640});
  await go(page, "?mode=block&el=Kr");
  var box = await cell(page, "Kr").boundingBox();
  expect(box.x >= 0 && box.x + box.width <= 360).toBe(true);
  expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0]);
  await page.setViewportSize({width: 1366, height: 657});

  // The header: the ZornScience logo links home; no back link unless a lesson passes ?from=.
  var back = page.locator("#zsa-pt-back"), logo = page.getByRole("link", {name: "ZornScience home"});
  await go(page);
  await expect(logo).toHaveAttribute("href", "https://zornscience.org/");
  await expect(logo).toBeVisible();
  await expect(page.getByRole("heading", {level: 1})).toHaveText("Periodic Table");
  await expect(back).toBeHidden();
  await expect(page.getByText("ZornScience lessons")).toHaveCount(0);
  await expect(page.getByText("Chemistry · Reference")).toHaveCount(0);
  var lesson = "https://zornscience.org/science/chemistry/unit-2-quantum/periodic-trends-periods/";
  await go(page, "?from=" + encodeURIComponent(lesson) + "&mode=radius");
  await expect(back).toHaveAttribute("href", lesson);
  await expect(back).toHaveText("← Back to the lesson");
  await expect(back).toBeVisible();
  await expect(logo).toHaveAttribute("href", "https://zornscience.org/");
  for (var bad of ["https://example.com/", "http://zornscience.org/science/", "https://zornscience.org.example.com/", "https://www.zornscience.org/",
    "https://user@zornscience.org/", "https://zornscience.org:8443/", "javascript:alert(1)", "//zornscience.org/x", "/science/"]) {
    await go(page, "?from=" + encodeURIComponent(bad));
    await expect(back, bad).toBeHidden();
    await expect(back, bad).toHaveAttribute("href", "https://zornscience.org/science/");
  }
  // Changing the view keeps ?from.
  await go(page, "?from=" + encodeURIComponent(lesson));
  await page.getByRole("radio", {name: "Block"}).check();
  expect(new URL(page.url()).searchParams.get("from")).toBe(lesson);
});

test("periodic table: embed mode, local files only, no storage", async ({page, problems}) => {
  void problems;
  var urls = [];
  page.on("request", (r) => urls.push(r.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, "")));
  await go(page, "?embed=1&mode=radius");
  await page.evaluate(() => document.fonts.ready);
  urls.forEach((u) => expect(u.startsWith("/"), "outside request " + u).toBe(true));
  var version = await page.locator('meta[name="zsa-version"]').getAttribute("content");
  urls.filter((u) => /\.(css|js)/.test(u)).forEach((u) => expect(u).toMatch(new RegExp("\\?v=" + version.replace(/\./g, "\\.") + "$")));
  expect(urls.some((u) => u.endsWith("InterVariable.woff2"))).toBe(true);
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  for (var el of await page.locator("[data-zsa-chrome]").all()) await expect(el).toBeHidden();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  for (var a of await page.locator("main a").all()) expect(await a.getAttribute("target")).toBe("_top");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await cell(page, "Na").click();
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Sodium");
  // Embedded on a lesson page, neither the logo nor a back link shows, even with ?from=.
  await go(page, "?embed=1&from=" + encodeURIComponent("https://zornscience.org/science/chemistry/"));
  await expect(page.locator("#zsa-pt-back")).toBeHidden();
  await expect(page.getByRole("link", {name: "ZornScience home"})).toBeHidden();
});

test("periodic table: no axe violations in eight states", async ({page, problems}) => {
  void problems;
  await go(page);
  await audit(page, "category start");
  await page.getByRole("radio", {name: "Block"}).check();
  await audit(page, "block");
  await go(page, "?mode=ionization&el=N");
  await audit(page, "ionization heatmap with trends and details");
  await page.getByLabel("Find an element").fill("zz");
  await page.getByLabel("Find an element").press("Enter");
  await audit(page, "search with no match");
  await page.locator("#zsa-pt-sources > summary").click();
  await audit(page, "data sources open");
  await page.setViewportSize({width: 390, height: 664});
  await go(page, "?mode=radius");
  await audit(page, "phone radius heatmap");
  await go(page, "?mode=electronegativity&el=Ne");
  await audit(page, "phone electronegativity with details");
  await go(page, "?embed=1&mode=block");
  await audit(page, "embed mode");
});

test("landing page links to the Periodic Table and Periodic Trends Practice", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await expect(page.locator('a[href="periodic-table/"]')).toHaveText("Periodic Table");
  await expect(page.locator('a[href="periodic-trends/"]')).toHaveText("Periodic Trends Practice");
  await page.locator('a[href="periodic-trends/"]').click();
  await expect(page).toHaveTitle("Periodic Trends Practice | ZornScience");
  await page.goto("/");
  await page.locator('a[href="periodic-table/"]').click();
  await expect(page).toHaveTitle("Periodic Table | ZornScience");
});

// Full screen for presenting: the whole page fills the screen, the table still fits, and Esc or the button leaves.
async function fullscreenState(page) {
  return page.evaluate(() => {
    var cells = [].map.call(document.querySelectorAll("td[role=gridcell]"), (td) => td.getBoundingClientRect());
    var main = document.querySelector("main");
    function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
    var small = [].filter.call(main.querySelectorAll("button, a, input[type=search], label:has(input), td[role=gridcell]"), visible)
      .map((el) => el.getBoundingClientRect()).filter((r) => r.width < 44 || r.height < 44).length;
    return {
      element: document.fullscreenElement ? document.fullscreenElement.tagName : null,
      button: document.getElementById("zsa-pt-present").textContent.trim(),
      allOnScreen: cells.every((r) => r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth),
      chromeHidden: [].every.call(document.querySelectorAll("[data-zsa-chrome], #zsa-pt-sources"), (el) => !visible(el)),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      small: small
    };
  });
}

// Waits until the page has finished switching: the browser sets document.fullscreenElement first, and the page's
// fullscreenchange handler then applies the full-screen layout and relabels the button.
async function inFullscreen(page, on) {
  await page.waitForFunction((on) => !!document.fullscreenElement === on &&
    document.getElementById("zsa-pt-present").textContent.trim() === (on ? "Exit full screen" : "Full screen"), on);
}

test("periodic table: full screen for presenting, with Esc to leave", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1920, 1080], [1366, 768], [1280, 720], [1024, 768]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?mode=radius");
    var button = page.getByRole("button", {name: "Full screen"});
    await expect(button).toBeVisible();
    await button.click();
    await inFullscreen(page, true);
    for (var [mode, label] of MODES) {
      await page.getByRole("radio", {name: label}).check();
      var st = await fullscreenState(page);
      var where = w + "x" + h + " " + mode;
      expect(st.element, where).toBe("MAIN");
      expect(st.button).toBe("Exit full screen");
      expect(st.allOnScreen, where + " whole table on screen").toBe(true);
      expect(st.chromeHidden, where + " back link, footer and sources hidden").toBe(true);
      expect(st.overflow, where).toBeLessThanOrEqual(0);
      expect(st.small, where + " small targets").toBe(0);
    }
    // The table still works in full screen: search, keyboard, details.
    await page.getByLabel("Find an element").fill("Kr");
    await page.getByLabel("Find an element").press("Enter");
    expect(await focused(page)).toBe("cell:Kr");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    await expect(page.locator("#zsa-pt-details-title")).toHaveText("Bromine");
    // Esc leaves full screen first and keeps everything else as it was; a second Esc closes the details.
    await page.keyboard.press("Escape");
    await inFullscreen(page, false);
    await expect(page.getByRole("button", {name: "Full screen"})).toBeVisible();
    await expect(page.locator("#zsa-pt-details-title")).toHaveText("Bromine");
    await expect(page.getByRole("link", {name: "ZornScience home"})).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#zsa-pt-details-title")).toHaveText("Element details");
  }
  // The button leaves full screen too, and keeps focus.
  await page.getByRole("button", {name: "Full screen"}).click();
  await inFullscreen(page, true);
  await audit(page, "full screen");
  await page.getByRole("button", {name: "Exit full screen"}).click();
  await inFullscreen(page, false);
  expect(await focused(page)).toBe("#zsa-pt-present");
});

test("periodic table: the Full screen button appears only where full screen is allowed", async ({page, problems}) => {
  void problems;
  // Framed on a zornscience.org page: without allowfullscreen the button stays hidden; with it, it shows.
  var fs = require("fs"), path = require("path"), ROOT = path.join(__dirname, "..", "..");
  var TYPES = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2"};
  await page.route("https://activities.zornscience.org/**", (route) => {
    var file = path.join(ROOT, new URL(route.request().url()).pathname);
    if (file.endsWith("/")) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) return route.fulfill({status: 404, body: ""});
    return route.fulfill({status: 200, contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file)});
  });
  var src = "https://activities.zornscience.org/periodic-table/?embed=1";
  await page.route("https://zornscience.org/host", (route) => route.fulfill({status: 200, contentType: "text/html", body:
    "<!doctype html><title>Host</title><iframe id='a' title='Without' src='" + src + "' width='1000' height='700'></iframe>" +
    "<iframe id='b' title='With' src='" + src + "' width='1000' height='700' allowfullscreen></iframe>"}));
  await page.goto("https://zornscience.org/host");
  await expect(page.frameLocator("#a").locator("#zsa-pt-grid tbody")).toBeAttached();
  await expect(page.frameLocator("#b").locator("#zsa-pt-grid tbody")).toBeAttached();
  await expect(page.frameLocator("#a").locator("#zsa-pt-present")).toBeHidden();
  await expect(page.frameLocator("#b").locator("#zsa-pt-present")).toBeVisible();
});

test("periodic table: full screen still fits with a wider fallback font", async ({browser}) => {
  // If Inter has not loaded (or a browser substitutes a wider font), the toolbar must not push the table off the
  // screen. DejaVu Sans is wider than Inter; the style is injected for this test only, so CSP is bypassed here.
  for (var [w, h] of [[1280, 720], [1366, 768], [1024, 768]]) {
    var context = await browser.newContext({viewport: {width: w, height: h}, bypassCSP: true});
    var page = await context.newPage();
    await go(page, "?mode=radius");
    await page.addStyleTag({content: "main{--zsa-font:'DejaVu Sans';font-family:'DejaVu Sans'!important}"});
    await page.getByRole("button", {name: "Full screen"}).click();
    await inFullscreen(page, true);
    var st = await fullscreenState(page);
    expect(st.allOnScreen, w + "x" + h + " whole table on screen with DejaVu Sans").toBe(true);
    expect(st.small, w + "x" + h + " small targets").toBe(0);
    await context.close();
  }
});

// The selected element's ring is drawn outside the cell, so it must sit above the neighbouring cells. Reads the
// screenshot's pixels just outside each side of the cell (on the ring) and checks they are the ring's amber.
async function ringSides(page, symbol) {
  var box = await cell(page, symbol).boundingBox();
  var pad = 8, clip = {x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad};
  var png = (await page.screenshot({clip: clip})).toString("base64");
  return page.evaluate(([png, w, h, pad]) => new Promise((resolve) => {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      var ctx = c.getContext("2d", {willReadFrequently: true}); ctx.drawImage(img, 0, 0);
      var sx = img.width / (w + 2 * pad), sy = img.height / (h + 2 * pad);
      function amber(x, y) { var d = ctx.getImageData(Math.round(x * sx), Math.round(y * sy), 1, 1).data; return d[0] > 150 && d[1] < 120 && d[2] < 60; }
      // 4 px outside the cell, past the 2 px white gap, in the middle of each side.
      resolve({top: amber(pad + w / 2, pad - 4), right: amber(pad + w + 3.5, pad + h / 2), bottom: amber(pad + w / 2, pad + h + 3.5), left: amber(pad - 4, pad + h / 2)});
    };
    img.src = "data:image/png;base64," + png;
  }), [png, box.width, box.height, pad]);
}

test("periodic table: the selected element's ring is not hidden by its neighbours", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    for (var mode of ["category", "ionization"]) {
      // Boron has neighbours on the right (C) and below (Al); iron has neighbours on every side.
      for (var symbol of ["B", "Fe"]) {
        await go(page, "?mode=" + mode + "&el=" + symbol);
        await cell(page, symbol).scrollIntoViewIfNeeded();
        expect(await ringSides(page, symbol), w + "x" + h + " " + mode + " " + symbol).toEqual({top: true, right: true, bottom: true, left: true});
      }
    }
  }
});
