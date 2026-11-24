// The trainers' drawings and progress track (shared/zsa-track.js): the Ion Charge Trainer's Bohr model, the Periodic
// Trends cards and table overlay, and the Lewis builder's stage and shape preview. Expected values come from the
// chemistry (tests/support/reference.js, the Periodic Table's data, tests/support/lewis-reference.js), not from the
// activities' code. Like the other tests, these select by role, id, ARIA and visible text; the drawings, which are
// hidden from screen readers, are read through their data-zsa-* attributes.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, seedRandom} = require("./fixtures");
var ref = require("../support/reference");
var {install} = require("../support/activities");
var {loadData} = require("../support/load-data");
var lv = require("./lewis-play");

var ROOT = path.join(__dirname, "..", "..");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- Ion Charge Trainer ----------

// Electrons in each principal energy level (Bohr shells), written out from the electron configurations.
var LEVELS = {Li: [2, 1], Na: [2, 8, 1], K: [2, 8, 8, 1], Rb: [2, 8, 18, 8, 1], Cs: [2, 8, 18, 18, 8, 1], Mg: [2, 8, 2], Ca: [2, 8, 8, 2],
  Sr: [2, 8, 18, 8, 2], Ba: [2, 8, 18, 18, 8, 2], Al: [2, 8, 3], N: [2, 5], P: [2, 8, 5], O: [2, 6], S: [2, 8, 6], Se: [2, 8, 18, 6],
  F: [2, 7], Cl: [2, 8, 7], Br: [2, 8, 18, 7], I: [2, 8, 18, 18, 7]};
async function model(page) {
  return page.evaluate(() => {
    var stage = document.querySelector('#zsa-ict-element [role="img"]'), count = {};
    stage.querySelectorAll("[data-zsa-e]").forEach((e) => { var k = e.getAttribute("data-zsa-e"); count[k] = (count[k] || 0) + 1; });
    return {label: stage.getAttribute("aria-label"), count: count};
  });
}
async function track(page, id) {
  return page.evaluate((id) => {
    var box = document.getElementById(id).parentNode.querySelector("[data-zsa-track]");
    return {hidden: box.getAttribute("aria-hidden"), pips: [].map.call(box.querySelectorAll("[data-zsa-pip]"), (p) => p.getAttribute("data-zsa-pip") + (p.hasAttribute("data-zsa-review") ? " review" : "")),
      steps: [].map.call(box.querySelectorAll("[data-zsa-step]"), (s) => s.getAttribute("data-zsa-step"))};
  }, id);
}
function ionAnswers(e) { return [{valence: e.valence}, {direction: e.direction, count: e.moved}, {charge: e.charge}, {name: e.ion, gas: e.gas}]; }
async function choose(page, picks) { await page.evaluate((picks) => Object.keys(picks).forEach((k) => window.__zsa.choose(k, picks[k])), picks); }

test("Ion Charge Trainer: the Bohr model of all 19 elements fills in, loses or gains electrons and shows the ion", async ({page, open}) => {
  await open("ion-charge-trainer");
  for (var e of ref.elements) {
    var levels = LEVELS[e.symbol];
    // The table above agrees with the reference: as many levels as the period, Z electrons, the valence count outside.
    expect(levels.length, e.symbol).toBe(e.period);
    expect(levels.reduce((a, b) => a + b, 0), e.symbol).toBe(e.z);
    expect(levels[levels.length - 1], e.symbol).toBe(e.valence);
    var ion = e.metal ? levels.slice(0, -1) : levels.slice(0, -1).concat([8]);
    await page.evaluate((v) => window.__zsa.single(v), e.symbol);
    var m = await model(page), a = ionAnswers(e);
    // Before step 1: the levels are drawn, but not the outer electrons, so the model does not give the answer away.
    expect(m.label).toBe("Bohr model of " + e.name + " with " + e.period + " energy levels. Neutral atom. " + e.z + " protons, " + e.z + " electrons. Outer level: ?");
    expect(m.count).toEqual({});
    await choose(page, a[0]);
    m = await model(page);
    expect(m.label).toBe("Bohr model of " + e.name + " with " + e.period + " energy levels. " + e.valence + " valence electron" + (e.valence === 1 ? "" : "s") + ". " + e.z + " protons, " + e.z + " electrons. Electrons by level: " + levels.join(", ") + ".");
    expect(m.count).toEqual({valence: e.valence});
    await choose(page, a[1]);
    m = await model(page);
    expect(m.label).toContain((e.metal ? "Loses " : "Gains ") + e.moved + ". " + e.z + " protons, " + e.electrons + " electrons. Electrons by level: " + ion.join(", ") + ".");
    expect(m.label).toContain(e.metal ? "Dashed circles: electrons lost." : "Open circles: electrons gained.");
    // A metal's outer electrons leave (dashed circles stay where they were) and the full level inside becomes the outer
    // level; a nonmetal's outer level fills to 8 with the electrons it gains.
    expect(m.count).toEqual(e.metal ? {lost: e.valence, leaving: e.valence, full: ion[ion.length - 1]} : {valence: e.valence, gained: e.moved});
    await choose(page, a[2]);
    expect((await model(page)).label).toContain(". Charge " + Math.abs(e.charge) + (e.charge > 0 ? "+" : "−") + ".");
    await choose(page, a[3]);
    m = await model(page);
    expect(m.label).toContain(". Like " + e.gas + ". " + e.z + " protons, " + e.electrons + " electrons.");
  }
});

test("Ion Charge Trainer: the track has a pip per element and a bar per step, and marks misses and review items", async ({page, open}) => {
  await open("ion-charge-trainer", {seed: 31});
  var t = await track(page, "zsa-ict-progress");
  expect(t.hidden).toBe("true");
  expect(t.pips).toEqual(["current"].concat(Array(9).fill("todo")));
  expect(t.steps).toEqual(["current", "todo", "todo", "todo"]);
  var st = await page.evaluate(() => window.__zsa.state());
  var e = ref.elements.find((x) => cap(x.name) === st.heading), a = ionAnswers(e);
  // Two wrong answers in step 1, then Show me: the element is missed and a review is added at the end.
  var wrongs = [1, 2, 3, 4, 5, 6, 7, 8].filter((n) => n !== e.valence && n !== e.period && n !== e.z && n !== 8 - e.valence);
  await choose(page, {valence: wrongs[0]}); await choose(page, {valence: wrongs[1]});
  await page.evaluate(() => window.__zsa.show());
  t = await track(page, "zsa-ict-progress");
  expect(t.steps).toEqual(["done", "current", "todo", "todo"]);
  expect(t.pips.length).toBe(11);
  expect(t.pips[10]).toBe("todo review");
  for (var s = 1; s < 4; s++) await choose(page, a[s]);
  t = await track(page, "zsa-ict-progress");
  expect(t.pips[0]).toBe("missed");
  expect(t.steps).toEqual(["done", "done", "done", "done"]);
  await page.evaluate(() => window.__zsa.next());
  st = await page.evaluate(() => window.__zsa.state());
  e = ref.elements.find((x) => cap(x.name) === st.heading); a = ionAnswers(e);
  for (s = 0; s < 4; s++) await choose(page, a[s]);
  await page.evaluate(() => window.__zsa.next());
  t = await track(page, "zsa-ict-progress");
  expect(t.pips.slice(0, 3)).toEqual(["missed", "done", "current"]);
  expect(await page.locator("#zsa-ict-progress").textContent()).toBe("Element 3 of 11 · Step 1 of 4");
});

test("Ion Charge Trainer: with reduced motion the model reaches the same states without animation", async ({page, open}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await open("ion-charge-trainer");
  var e = ref.elements.find((x) => x.symbol === "Mg"), a = ionAnswers(e);
  await page.evaluate(() => window.__zsa.single("Mg"));
  await choose(page, a[0]); await choose(page, a[1]);
  // The same picture as with motion, less the two electrons that fly away: the dashed circles show where they were.
  var m = await model(page);
  expect(m.count).toEqual({lost: 2, full: 8});
  expect(m.label).toContain("Loses 2. 12 protons, 10 electrons. Electrons by level: 2, 8. Dashed circles: electrons lost.");
  var motion = await page.evaluate(() => [].map.call(document.querySelectorAll('#zsa-ict-element [data-zsa-e], #zsa-ict-element [role="img"], #zsa-ict-work li'), (el) => getComputedStyle(el).animationName));
  expect(motion.length).toBeGreaterThan(10);
  expect(motion.every((n) => n === "none")).toBe(true);
});

test("Ion Charge Trainer: a leaving electron ends invisible, so the picture is right whether or not its animation plays", async ({page, open}) => {
  await open("ion-charge-trainer");
  await page.evaluate(() => window.__zsa.single("Mg"));
  var a = ionAnswers(ref.elements.find((x) => x.symbol === "Mg"));
  await choose(page, a[0]); await choose(page, a[1]);
  expect((await model(page)).count).toEqual({lost: 2, leaving: 2, full: 8});
  await page.waitForTimeout(1600);
  var leaving = await page.evaluate(() => [].map.call(document.querySelectorAll('[data-zsa-e="leaving"]'), (el) => getComputedStyle(el).opacity));
  expect(leaving).toEqual(["0", "0"]);
});

// ---------- Periodic Trends Practice ----------

var table = loadData(path.join(ROOT, "periodic-table/data.js"));
var RULE = {radius: {period: "decreases", group: "increases"}, en: {period: "increases", group: "decreases"}, ie: {period: "increases", group: "decreases"}};
var LABEL = {radius: "atomic radius", en: "electronegativity", ie: "first ionization energy"};
var UNIT = {radius: " pm", en: "", ie: " kJ/mol"};
var KEY = {radius: "radius", en: "en", ie: "ie"};
function el(symbol) { return table.elements.find(function (x) { return x.symbol === symbol; }); }
var PTR_IDS = {work: "zsa-ptr-work", strip: "zsa-ptr-pair", heading: "zsa-ptr-heading", progress: "zsa-ptr-progress", live: "zsa-ptr-live",
  options: "zsa-ptr-options", newRound: "zsa-ptr-new", pick: "zsa-ptr-pick", select: "zsa-ptr-select", table: "zsa-ptr-table"};
async function openTrends(page, query) {
  await page.goto("/periodic-trends/" + query);
  await page.waitForFunction(() => !!document.querySelector("#zsa-ptr-table table"));
  await page.evaluate(install, PTR_IDS);
}
// The overlay and the two marked cells, in the table wrapper's coordinates.
async function overlay(page) {
  return page.evaluate(() => {
    var wrap = document.getElementById("zsa-ptr-table").parentNode, base = wrap.getBoundingClientRect();
    function box(r) { return {left: r.left - base.left, top: r.top - base.top, right: r.right - base.left, bottom: r.bottom - base.top}; }
    var band = wrap.querySelector("[data-zsa-band]"), wedge = wrap.querySelector("[data-zsa-wedge]");
    var marked = [].filter.call(wrap.querySelectorAll("tbody td"), (td) => /\(in this question\)/.test(td.textContent)).map((td) => box(td.getBoundingClientRect()));
    return {band: band ? {relation: band.getAttribute("data-zsa-band"), box: box(band.getBoundingClientRect())} : null,
      wedge: wedge ? {kind: wedge.getAttribute("data-zsa-wedge"), points: wedge.getAttribute("points").split(" ").map((p) => p.split(",").map(Number))} : null, marked: marked};
  });
}
function stageLabel(page) { return page.locator('#zsa-ptr-pair [role="img"]').getAttribute("aria-label"); }

for (var [qid, relation] of [["radius-Na-Cl", "period"], ["ie-Be-Sr", "group"], ["en-Rb-Te", "period"], ["radius-Li-K", "group"]]) {
  (function (qid, relation) {
    test("Periodic Trends: the cards, the band and the trend wedge follow the steps (" + qid + ")", async ({page, problems}) => {
      void problems;
      var parts = qid.split("-"), prop = parts[0], a = el(parts[1]), b = el(parts[2]), dir = RULE[prop][relation];
      var winner = a[KEY[prop]] > b[KEY[prop]] ? a : b;
      await openTrends(page, "?q=" + qid);
      var said = "Comparison of " + a.name.toLowerCase() + " and " + b.name.toLowerCase() + ".";
      expect(await stageLabel(page)).toBe(said + " " + a.name + " (" + a.symbol + "), atomic number " + a.z + ". " + b.name + " (" + b.symbol + "), atomic number " + b.z + ".");
      expect((await overlay(page)).band).toBeNull();
      await page.evaluate((r) => window.__zsa.choose("relation", r), relation);
      expect(await stageLabel(page)).toContain(a.name + " (" + a.symbol + "), atomic number " + a.z + ", group " + a.group + ", period " + a.period + ".");
      var o = await overlay(page);
      // The band goes around the shared row or column, both marked elements inside it, and there is no wedge yet.
      expect(o.band.relation).toBe(relation);
      expect(o.marked.length).toBe(2);
      o.marked.forEach((m) => {
        expect(m.left).toBeGreaterThanOrEqual(o.band.box.left); expect(m.right).toBeLessThanOrEqual(o.band.box.right);
        expect(m.top).toBeGreaterThanOrEqual(o.band.box.top); expect(m.bottom).toBeLessThanOrEqual(o.band.box.bottom);
      });
      expect(o.wedge).toBeNull();
      await page.evaluate((d) => window.__zsa.choose("direction", d), dir);
      o = await overlay(page);
      expect(o.wedge.kind).toBe(relation + " " + dir);
      // The wedge is a triangle: its point is at the low end, its wide edge at the high end of the trend.
      var axis = relation === "period" ? 0 : 1, along = o.wedge.points.map((p) => p[axis]);
      var tip = o.wedge.points.find((p) => along.filter((v) => Math.abs(v - p[axis]) < 0.5).length === 1);
      expect(tip[axis] === Math.min.apply(null, along), qid + " tip at the start when the value increases").toBe(dir === "increases");
      expect(await stageLabel(page)).toContain(cap(LABEL[prop]) + " " + dir + " " + (relation === "period" ? "from left to right" : "from top to bottom") + ".");
      await page.evaluate((w) => window.__zsa.choose("element", w), winner.symbol);
      var label = await stageLabel(page);
      expect(label).toContain(", " + LABEL[prop] + " " + a[KEY[prop]] + UNIT[prop] + ".");
      expect(label).toContain(", " + LABEL[prop] + " " + b[KEY[prop]] + UNIT[prop] + ".");
      expect(label).toContain(winner.name + " has the " + (prop === "radius" ? "larger" : "higher") + " " + LABEL[prop] + ".");
      expect(label.endsWith("Circles drawn to scale by atomic radius.")).toBe(prop === "radius");
      var t = await track(page, "zsa-ptr-progress");
      expect(t.pips).toEqual(["done"]);
      expect(t.steps).toEqual(["done", "done", "done"]);
    });
  })(qid, relation);
}

test("Periodic Trends: the comparison in Mexican Spanish, and axe-core on it at two sizes", async ({page, problems}) => {
  void problems;
  for (var vp of [{width: 1366, height: 657}, {width: 390, height: 664}]) {
    await page.setViewportSize(vp);
    await openTrends(page, "?q=ie-Be-Sr&lang=es");
    await page.evaluate(() => { window.__zsa.choose("relation", "group"); window.__zsa.choose("direction", "decreases"); });
    await audit(page, vp.width + " step 3");
    await page.evaluate(() => window.__zsa.choose("element", "Be"));
    expect(await stageLabel(page)).toBe("Comparación entre el berilio y el estroncio. Berilio (Be), número atómico 4, grupo 2, periodo 2, primera energía de ionización de 900 kJ/mol. Estroncio (Sr), número atómico 38, grupo 2, periodo 5, primera energía de ionización de 550 kJ/mol. El berilio tiene una mayor primera energía de ionización.");
    await audit(page, vp.width + " complete");
  }
});

// ---------- Lewis Structure and VSEPR Builder ----------

async function lewisStage(page) {
  return page.evaluate(() => {
    var strip = document.getElementById("zsa-lv-strip"), shape = strip.querySelector("svg[data-zsa-dipoles]");
    var visible = (el) => !!el && el.getClientRects().length > 0 && !el.closest("[hidden]");
    var pill = [].find.call(strip.querySelectorAll("p"), (p) => /°/.test(p.textContent));
    var key = [].find.call(strip.querySelectorAll("p"), (p) => /dipole|Wedge/.test(p.textContent));
    return {shape: visible(shape) ? {dipoles: Number(shape.getAttribute("data-zsa-dipoles")), net: shape.getAttribute("data-zsa-net")} : null,
      pill: visible(pill) ? pill.textContent : null, key: visible(key) ? key.textContent : null};
  });
}
// item, the shape line, how many bond dipole arrows, whether a net dipole, and the key's last sentence.
var SHAPES = [
  ["H2O", "Bent, about 104.5°", 2, "yes", "Large arrow: net dipole."],
  ["CO2", "Linear, 180°", 2, "no", "The bond dipoles cancel: no net dipole."],
  ["CH4", "Tetrahedral, 109.5°", 0, "no", "The bonds are nearly nonpolar: no net dipole."],
  ["NH3", "Trigonal pyramidal, about 107°", 3, "yes", "Large arrow: net dipole."],
  ["CH2Cl2", "Tetrahedral, 109.5°", 4, "yes", "Large arrow: net dipole."],
  ["NH4+", "Tetrahedral, 109.5°", 0, "no", null]
];
for (var [lid, line, dipoles, net, keyEnd] of SHAPES) {
  (function (lid, line, dipoles, net, keyEnd) {
    test("Lewis builder: the stage shows the structure, then the shape and angle, then the dipoles (" + lid + ")", async ({page, open}) => {
      await lv.openLv(page, open, {});
      var it = lv.item(lid);
      var ans = lv.answers(it, false), kinds = lv.kindsOf(it, false);
      await page.evaluate((id) => window.__lv.single(id, false), it.id);
      expect(await page.evaluate(() => window.__lv.stripStructure())).toBeNull();
      for (var k of kinds) {
        var s = await lewisStage(page);
        var done = kinds.indexOf(k);
        // The shape (and its words) appear only once the shape step is done; the dipoles once polarity is done.
        expect(s.shape === null, lid + " before " + k).toBe(done <= kinds.indexOf("shape"));
        if (k === "polarity") expect(s.shape.dipoles).toBe(0);
        if (done > kinds.indexOf("build")) expect(await page.evaluate(() => window.__lv.stripStructure())).toMatch(/^Lewis structure: /);
        await page.evaluate((a) => window.__lv.answer(a), ans);
      }
      var s2 = await lewisStage(page);
      expect(s2.pill).toBe(line);
      expect(s2.shape).toEqual({dipoles: kinds.indexOf("polarity") >= 0 ? dipoles : 0, net: net});
      if (keyEnd) expect(s2.key.endsWith(keyEnd), s2.key).toBe(true);
      else expect(s2.key === null || !/dipole/.test(s2.key)).toBe(true);
      // The item summary shows the Lewis structure itself, so the strip keeps only the shape.
      expect(await page.evaluate(() => window.__lv.stripStructure())).toBeNull();
    });
  })(lid, line, dipoles, net, keyEnd);
}

test("Lewis builder: what the student adds in the editor is drawn with a short animation, and nothing else is", async ({page, open}) => {
  await lv.openLv(page, open, {});
  var it = lv.item("H2O"), ans = lv.answers(it, false);
  await page.evaluate((id) => window.__lv.single(id, false), it.id);
  while (await page.evaluate(() => window.__lv.kind()) !== "build") await page.evaluate((a) => window.__lv.answer(a), ans);
  function fresh() { return page.evaluate(() => document.querySelectorAll('#zsa-lv-work [data-zsa-part="lv-build"] svg [data-zsa-new]').length); }
  expect(await fresh()).toBe(0);
  await page.evaluate(() => window.__lv.setLP(2, 1));
  expect(await fresh()).toBe(2); // one lone pair: two dots
  await page.evaluate(() => window.__lv.setBond(0, 1));
  expect(await fresh()).toBe(1); // one bond line
  await page.evaluate(() => window.__lv.setBond(1, 2));
  expect(await fresh()).toBe(2); // a double bond: two lines
  await page.evaluate(() => window.__lv.setLP(2, 0));
  expect(await fresh()).toBe(0); // taking electrons away adds nothing new
});

test("Lewis builder: the stage in Mexican Spanish, and axe-core on the finished structure at two sizes", async ({page, open}) => {
  for (var vp of [{width: 1366, height: 657}, {width: 390, height: 664}]) {
    await page.setViewportSize(vp);
    await open("lewis-vsepr", {query: "?item=NH3&lang=es"});
    await page.evaluate(lv.lvInstall);
    var it = lv.item("NH3"), ans = lv.answers(it, false);
    // The Spanish page names its groups in Spanish, so the steps are answered through the engine's own parts.
    await page.evaluate((a) => {
      function part(n) { return document.querySelector('#zsa-lv-work [data-zsa-part="' + n + '"]'); }
      function pick(n, v) { part(n).querySelector('button[value="' + v + '"]').click(); }
      pick("total", a.total); pick("center", a.center);
      var editor = part("lv-build"), atoms = editor.querySelector('[role="group"]').children;
      a.build.o.forEach((p, i) => { atoms[i].click(); editor.querySelectorAll('[role="group"]')[2].querySelector('button[value="' + p[1] + '"]').click(); });
      atoms[atoms.length - 1].click(); editor.querySelectorAll('[role="group"]')[1].querySelector('button[value="' + a.build.c + '"]').click();
      a.build.o.forEach((p, i) => { atoms[i].click(); editor.querySelectorAll('[role="group"]')[1].querySelector('button[value="' + p[0] + '"]').click(); });
      pick("domains", a.domains); pick("eg", a.eg); pick("mg", a.mg); pick("angle", a.angle); pick("claim", a.claim); pick("reason", a.reason);
    }, ans);
    expect(await page.locator("#zsa-lv-work section h3").textContent()).toBe("Estructura terminada");
    var strip = await page.locator("#zsa-lv-strip").textContent();
    expect(strip).toContain("Piramidal trigonal, aproximadamente 107°");
    expect(strip).toContain("Flecha grande: dipolo neto.");
    await audit(page, vp.width + " NH3 complete in Spanish");
  }
});
