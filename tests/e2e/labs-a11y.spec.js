// Keyboard and screen reader checks that every virtual lab must pass, in English and Mexican Spanish.
// One spec for all labs, so a new lab is covered the moment it has a lab.js (or is listed in EXTRA).
//   - axe-core (WCAG 2.0, 2.1, 2.2 A and AA plus best practices) at a laptop and a phone size: zero violations.
//   - Tab visits every control once in a loop, with no positive tabindex, and every stop has an accessible name and a
//     visible focus indicator (the page looks different with focus than without, compared pixel by pixel).
//   - Every role="slider" has a name, tabindex 0, aria-valuemin, aria-valuemax and aria-valuenow, and the arrow keys move it.
//   - Every control built from a div, span or SVG shape (anything with a pointer-style cursor that is not a native control)
//     can be focused, and every ARIA button, radio, checkbox, tab or switch has a name and a state.
//   - Every large SVG or canvas has a text alternative (or is hidden from assistive technology).
//   - The page has a live region, and the Instructions dialog opens, traps focus and returns it.
"use strict";
var fs = require("fs");
var path = require("path");
var base = require("@playwright/test");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

var ROOT = path.resolve(__dirname, "../..");
var EXTRA = ["gas-lab", "virtual-lab-graphing", "circuit-builder"];
var LABS = fs.readdirSync(ROOT).filter(function (d) {
  return fs.existsSync(path.join(ROOT, d, "index.html")) && (fs.existsSync(path.join(ROOT, d, "lab.js")) || EXTRA.indexOf(d) >= 0);
}).sort();

var test = base.test, expect = base.expect;
test.describe.configure({mode: "parallel"});

async function open(page, slug, lang, vp) {
  var problems = [];
  page.on("pageerror", function (e) { problems.push("page error: " + e.message); });
  await page.setViewportSize(vp || {width: 1366, height: 900});
  await page.goto("/" + slug + "/" + (lang === "es" ? "?lang=es" : ""));
  await page.waitForLoadState("load");
  await page.waitForTimeout(400);
  return problems;
}

async function axeProblems(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(function () {
    return window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}});
  });
  return result.violations.map(function (v) {
    return label + ": " + v.id + " " + v.nodes.slice(0, 5).map(function (n) { return n.target.join(" "); }).join(", ");
  });
}

// Walk the Tab order and describe every stop.
async function tabWalk(page, maxStops) {
  await page.evaluate(function () { if (document.activeElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  var stops = [], seen = {};
  for (var i = 0; i < maxStops; i++) {
    await page.keyboard.press("Tab");
    var info = await page.evaluate(function () {
      var e = document.activeElement;
      if (!e || e === document.body) return null;
      var key = e.__zsaStop = e.__zsaStop || (++window.__zsaStopCount || (window.__zsaStopCount = 1));
      var s = getComputedStyle(e), r = e.getBoundingClientRect();
      var labelled = e.getAttribute("aria-labelledby");
      var name = e.getAttribute("aria-label") ||
        (labelled && labelled.split(/\s+/).map(function (id) { var n = document.getElementById(id); return n ? n.textContent : ""; }).join(" ")) ||
        (e.labels && e.labels.length && e.labels[0].textContent) ||
        (e.tagName === "svg" || e instanceof SVGElement ? (e.querySelector("title") || {}).textContent : "") ||
        e.textContent || e.getAttribute("title") || e.getAttribute("placeholder") || "";
      return {key: key, name: name.replace(/\s+/g, " ").trim(), tag: e.tagName.toLowerCase(), id: e.id, svg: e instanceof SVGElement,
        tabindex: e.getAttribute("tabindex"), rect: {x: r.x, y: r.y, width: r.width, height: r.height},
        outline: s.outlineStyle + " " + s.outlineWidth, sig: e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.getAttribute("aria-label") ? "[" + e.getAttribute("aria-label") + "]" : "")};
    });
    if (!info) continue;
    if (seen[info.key]) break;
    seen[info.key] = true;
    stops.push(info);
    // Focus indicator: the region looks different focused than blurred (and the blurred look is stable).
    var rect = await page.evaluate(function () {
      var e = document.activeElement;
      e.scrollIntoView({block: "nearest", inline: "nearest"});
      var r = e.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      var x = Math.max(0, Math.floor(r.x - 10)), y = Math.max(0, Math.floor(r.y - 10));
      return {x: x, y: y, width: Math.max(1, Math.min(vw - x, Math.ceil(r.width + 20))), height: Math.max(1, Math.min(vh - y, Math.ceil(r.height + 20)))};
    });
    var withFocus = await page.screenshot({clip: rect, animations: "disabled"});
    await page.evaluate(function () { window.__zsaRefocus = document.activeElement; document.activeElement.blur(); });
    var off1 = await page.screenshot({clip: rect, animations: "disabled"});
    var off2 = await page.screenshot({clip: rect, animations: "disabled"});
    info.stable = off1.equals(off2);
    info.indicator = !withFocus.equals(off1);
    await page.evaluate(function () { window.__zsaRefocus.focus(); });
  }
  return stops;
}

LABS.forEach(function (slug) {
  ["en", "es"].forEach(function (lang) {
    test(slug + " (" + lang + "): axe finds no violations at laptop and phone sizes", async function ({page}) {
      var problems = await open(page, slug, lang);
      var found = await axeProblems(page, "laptop");
      await page.setViewportSize({width: 390, height: 664});
      await page.waitForTimeout(200);
      found = found.concat(await axeProblems(page, "phone"));
      expect(found).toEqual([]);
      expect(problems).toEqual([]);
    });

    test(slug + " (" + lang + "): Tab reaches named controls with a visible focus indicator", async function ({page}) {
      await open(page, slug, lang);
      var stops = await tabWalk(page, 160);
      if (process.env.ZSA_DEBUG) console.log(stops.map(function (s, i) { return i + " " + s.sig + " stable=" + s.stable + " ind=" + s.indicator; }).join("\n"));
      expect(stops.length, "Tab stops").toBeGreaterThan(5);
      var problems = [];
      stops.forEach(function (s) {
        if (s.tabindex && Number(s.tabindex) > 0) problems.push("positive tabindex: " + s.sig);
        if (!s.name) problems.push("no accessible name: " + s.sig);
        if (s.stable && !s.indicator) problems.push("no visible focus indicator: " + s.sig + " (" + s.outline + ") at " + JSON.stringify(s.rect));
        if (!s.stable && !s.svg && /^none/.test(s.outline)) problems.push("outline none: " + s.sig);
      });
      expect(problems).toEqual([]);
    });
  });

  test(slug + ": sliders, custom controls and drawings expose roles, names, states and keys", async function ({page}) {
    await open(page, slug, "en");
    var report = await page.evaluate(function () {
      var out = [];
      function id(e) { return e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.getAttribute("aria-label") ? "[" + e.getAttribute("aria-label") + "]" : ""); }
      function visible(e) {
        var r = e.getBoundingClientRect(), s = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      }
      function nameOf(e) {
        var l = e.getAttribute("aria-labelledby");
        return e.getAttribute("aria-label") || (l && l.split(/\s+/).map(function (i) { var n = document.getElementById(i); return n ? n.textContent : ""; }).join("").trim()) || e.textContent.trim();
      }
      document.querySelectorAll("[role=slider]").forEach(function (e) {
        ["aria-valuenow", "aria-valuemin", "aria-valuemax"].forEach(function (a) { if (!e.hasAttribute(a)) out.push("slider " + id(e) + " lacks " + a); });
        if (!nameOf(e)) out.push("slider " + id(e) + " has no name");
        if (e.tabIndex < 0) out.push("slider " + id(e) + " is not focusable");
      });
      document.querySelectorAll("[role=button],[role=radio],[role=checkbox],[role=tab],[role=switch],[role=option]").forEach(function (e) {
        if (!visible(e)) return;
        var role = e.getAttribute("role");
        if (!nameOf(e)) out.push(role + " " + id(e) + " has no name");
        if ((role === "radio" || role === "checkbox" || role === "switch") && !e.hasAttribute("aria-checked")) out.push(role + " " + id(e) + " lacks aria-checked");
        if ((role === "tab" || role === "option") && !e.hasAttribute("aria-selected")) out.push(role + " " + id(e) + " lacks aria-selected");
        var group = e.closest("[role=radiogroup],[role=tablist],[role=listbox],[role=toolbar],[role=grid],[role=group]");
        if (e.tabIndex < 0 && !group) out.push(role + " " + id(e) + " is not focusable");
      });
      var pointer = ["pointer", "grab", "grabbing", "ew-resize", "ns-resize", "move", "crosshair", "col-resize", "row-resize", "nwse-resize"];
      var native = "a[href],button,input,select,textarea,summary,label,[tabindex],[role=button],[role=slider],[role=radio],[role=checkbox],[role=tab],[role=switch],[role=option],[role=menuitem],[role=spinbutton]";
      document.querySelectorAll("body *").forEach(function (e) {
        if (!(e instanceof SVGElement) && !visible(e)) return;
        var c = getComputedStyle(e).cursor;
        if (pointer.indexOf(c) < 0 || e.closest(native) || e.closest("[aria-hidden=true]")) return;
        var p = e.parentElement;
        if (p && getComputedStyle(p).cursor === c) return;
        out.push("not focusable although it shows a " + c + " cursor: " + id(e));
      });
      document.querySelectorAll("svg,canvas").forEach(function (e) {
        var isSvg = e.tagName.toLowerCase() === "svg";
        if (isSvg && e.parentElement.closest("svg")) return;
        if (!visible(e) || e.closest("[aria-hidden=true]")) return;
        var r = e.getBoundingClientRect();
        if (r.width < 40 && r.height < 40) return;
        var labelled = e.getAttribute("aria-label") || e.getAttribute("aria-labelledby") || e.querySelector(":scope > title");
        if (!labelled && e.getAttribute("role") !== "presentation" && e.getAttribute("role") !== "none") out.push((isSvg ? "svg" : "canvas") + " " + id(e) + " has no text alternative");
      });
      if (!document.querySelector("[aria-live]:not([aria-live=off]),[role=status],[role=alert],[role=log]")) out.push("no live region");
      return out;
    });
    expect(report).toEqual([]);
    // Arrow keys move every slider (one of Right, Up, Left, Down changes its value).
    var count = await page.locator("[role=slider]").count();
    var stuck = [];
    for (var i = 0; i < Math.min(count, 12); i++) {
      var slider = page.locator("[role=slider]").nth(i);
      if (!(await slider.isVisible())) continue;
      var before = await slider.getAttribute("aria-valuenow");
      await slider.focus();
      var moved = false;
      for (var key of ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"]) {
        await page.keyboard.press(key);
        if ((await slider.getAttribute("aria-valuenow")) !== before) { moved = true; break; }
      }
      if (!moved) stuck.push(await slider.evaluate(function (e) { return e.id || e.getAttribute("aria-label"); }));
    }
    expect(stuck, "sliders the arrow keys do not move").toEqual([]);
  });

  test(slug + ": the Instructions dialog opens from the keyboard, keeps focus inside and gives it back", async function ({page}) {
    await open(page, slug, "en");
    var button = page.locator("[aria-haspopup=dialog]").first();
    if ((await button.count()) === 0) test.skip(true, "no Instructions dialog");
    await button.focus();
    await page.keyboard.press("Enter");
    var dialog = page.locator("dialog[open], [role=dialog]:visible").first();
    await expect(dialog).toBeVisible();
    for (var i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      // A modal dialog may hand Tab to the browser's own controls (activeElement becomes body), never to the page behind it.
      expect(await page.evaluate(function () { var a = document.activeElement; return a === document.body || !!a.closest("dialog, [role=dialog]"); }), "focus stays in the dialog").toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await button.evaluate(function (e) { return e === document.activeElement; }), "focus returns to the button").toBe(true);
  });
});
