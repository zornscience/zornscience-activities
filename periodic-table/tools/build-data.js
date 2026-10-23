// Builds periodic-table/data.js from the mendeleev snapshot in sources/ plus the tables below (classification,
// common ions, the few documented overrides) and the page's words. Run from the repository root:
//   node periodic-table/tools/build-data.js
// Do not edit data.js by hand. Node only, no dependencies. To refresh the snapshot, see extract-mendeleev.py.
"use strict";
var fs = require("fs");
var path = require("path");

var SOURCE = path.join(__dirname, "sources", "mendeleev-1.3.0.json");
var TARGET = path.join(__dirname, "..", "data.js");
var src = JSON.parse(fs.readFileSync(SOURCE, "utf8"));

// ---------- Classification (decisions for the teacher are listed in README.md) ----------
// The lesson's metalloids. Everything else is a metal unless it is listed as a nonmetal.
var METALLOIDS = ["B", "Si", "Ge", "As", "Sb", "Te"];
var NONMETALS = ["H", "He", "C", "N", "O", "F", "Ne", "P", "S", "Cl", "Ar", "Se", "Br", "Kr", "I", "Xe", "At", "Rn", "Ts", "Og"];
var CATEGORY_NOTES = {
  H: "Hydrogen sits in group 1 but is a nonmetal.",
  Se: "Some tables call selenium a metalloid.",
  Po: "Borderline: some tables call polonium a metalloid. Shown here as a metal.",
  At: "Borderline: some tables call astatine a metalloid or a metal. Shown here as a nonmetal, like the other halogens.",
  Cn: "Predicted: only a few atoms have ever been made, so this is based on its place in the table.",
  Nh: "Predicted: only a few atoms have ever been made, so this is based on its place in the table.",
  Fl: "Predicted: only a few atoms have ever been made, so this is based on its place in the table.",
  Mc: "Predicted: only a few atoms have ever been made, so this is based on its place in the table.",
  Lv: "Predicted: only a few atoms have ever been made, so this is based on its place in the table.",
  Ts: "Predicted: only a few atoms have ever been made, so this is based on its place in the table.",
  Og: "Predicted: only a few atoms have ever been made, so this is based on its place in the table."
};

// ---------- Atomic mass ----------
// Elements with no standard atomic weight from IUPAC (no stable isotope and no typical natural mix): shown as the
// mass number of the longest-lived isotope in brackets. Th, Pa and U have no stable isotope but do have standard
// atomic weights, so they are shown as numbers like most school tables (a decision listed in README.md).
var NO_STANDARD_WEIGHT = [43, 61].concat(range(84, 89), range(93, 118));
function range(a, b) { var out = []; for (var i = a; i <= b; i++) out.push(i); return out; }
// Round to 2 decimal places, or fewer when the standard value itself has fewer (207.2 stays 207.2).
function massLabel(e) {
  if (NO_STANDARD_WEIGHT.indexOf(e.z) >= 0) return "[" + Math.round(e.atomicWeight) + "]";
  // Rounded half up on the decimal digits, so 24.305 is 24.31 (toFixed would give 24.30 from the binary value).
  var text = String(e.atomicWeight), decimals = Math.min(2, (text.split(".")[1] || "").length);
  return (Math.round(Number(text + "e" + decimals)) / Math.pow(10, decimals)).toFixed(decimals);
}

// ---------- Electron configurations ----------
// Subshells are written in filling order (n + l, then n), the order students fill them: [Ar] 4s2 3d10 4p5.
var L = {s: 0, p: 1, d: 2, f: 3}, CAP = {s: 2, p: 6, d: 10, f: 14};
var MADELUNG = [];
for (var n = 1; n <= 7; n++) "spdf".split("").forEach(function (l) { if (L[l] < n) MADELUNG.push(n + l); });
MADELUNG.sort(function (a, b) {
  var na = Number(a[0]), nb = Number(b[0]), sa = na + L[a[1]], sb = nb + L[b[1]];
  return sa - sb || na - nb;
});
var CORES = {He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54, Rn: 86};
function aufbau(count) {
  var out = [];
  MADELUNG.forEach(function (sub) {
    if (count <= 0) return;
    var take = Math.min(count, CAP[sub[1]]);
    out.push([sub, take]); count -= take;
  });
  return out;
}
function parse(econf) {
  var core = null, subs = [];
  econf.split(" ").forEach(function (tok) {
    var m = /^\[(\w+)\]$/.exec(tok);
    if (m) { core = m[1]; return; }
    m = /^(\d[spdf])(\d*)$/.exec(tok);
    if (!m) throw new Error("bad configuration token " + tok);
    subs.push([m[1], m[2] ? Number(m[2]) : 1]);
  });
  var full = core ? aufbau(CORES[core]) : [];
  full = full.concat(subs);
  full.sort(function (a, b) { return MADELUNG.indexOf(a[0]) - MADELUNG.indexOf(b[0]); });
  subs.sort(function (a, b) { return MADELUNG.indexOf(a[0]) - MADELUNG.indexOf(b[0]); });
  return {core: core, outer: subs, full: full};
}
function write(subs) { return subs.map(function (s) { return s[0] + s[1]; }).join(" "); }
function nobleOf(subs) {
  // The largest noble-gas core the configuration contains, then the rest in filling order.
  var count = subs.reduce(function (t, s) { return t + s[1]; }, 0), best = null;
  Object.keys(CORES).forEach(function (g) { if (CORES[g] < count) best = g; });
  if (!best) return write(subs);
  var core = aufbau(CORES[best]).map(function (s) { return s[0]; });
  return "[" + best + "] " + write(subs.filter(function (s) { return core.indexOf(s[0]) < 0; }));
}

// ---------- Common ions ----------
// Main groups follow the lesson's rule: groups 1, 2 and 13 lose 1, 2 and 3 electrons; nonmetals and metalloids in
// groups 15, 16 and 17 gain 3, 2 and 1. Other main-group elements and every transition metal are listed by hand.
var ANION_NAMES = {H: "hydride", F: "fluoride", Cl: "chloride", Br: "bromide", I: "iodide", At: "astatide", O: "oxide",
  S: "sulfide", Se: "selenide", Te: "telluride", N: "nitride", P: "phosphide", As: "arsenide", Sb: "antimonide"};
var ION_TABLE = {
  H: [1, -1], Tl: [1, 3], Sn: [2, 4], Pb: [2, 4], Bi: [3], Po: [2, 4],
  Sc: [3], Ti: [4, 3], V: [5, 3], Cr: [3, 2], Mn: [2, 4], Fe: [2, 3], Co: [2, 3], Ni: [2], Cu: [2, 1], Zn: [2],
  Y: [3], Zr: [4], Nb: [5], Mo: [6, 4], Tc: [7, 4], Ru: [3, 4], Rh: [3], Pd: [2, 4], Ag: [1], Cd: [2],
  Hf: [4], Ta: [5], W: [6, 4], Re: [7, 4], Os: [4], Ir: [3, 4], Pt: [2, 4], Au: [3, 1], Hg: [2, 1],
  Ce: [3, 4], Eu: [3, 2], Ac: [3], Th: [4], Pa: [5], U: [6, 4], Np: [5], Pu: [4], No: [2, 3]
};
var ION_NOTES = {
  B: "Boron shares electrons in covalent bonds instead of forming a simple ion.",
  C: "Carbon shares electrons in covalent bonds instead of forming a simple ion.",
  Si: "Silicon shares electrons in covalent bonds instead of forming a simple ion.",
  Ge: "Germanium usually shares electrons in covalent bonds.",
  Hg: "Mercury(I) is found as a pair of atoms, Hg2, with a total charge of 2+."
};
var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
function mainGroupCharge(e, group, category) {
  if (e.symbol === "H") return null;
  if (group === 1 || group === 2) return group;
  if (group === 13 && category === "metal" && e.z <= 49) return 3;
  if (category !== "metal" && group >= 15 && group <= 17) return group - 18;
  return null;
}
function ions(e, group, category) {
  var charges = ION_TABLE[e.symbol];
  if (!charges) {
    // Lanthanides and actinides not in the table form 3+ ions; nothing is known for the superheavy elements.
    var c = e.z > 103 ? null : (group === null ? 3 : mainGroupCharge(e, group, category));
    charges = c === null ? [] : [c];
  }
  var lower = e.name.toLowerCase(), positive = charges.filter(function (q) { return q > 0; }).length;
  return charges.map(function (q) {
    if (q < 0) return [q, ANION_NAMES[e.symbol] + " ion"];
    return [q, positive > 1 ? lower + "(" + ROMAN[q] + ") ion" : lower + " ion"];
  });
}

// ---------- State at room temperature (25 °C, 298.15 K) ----------
// From the melting and boiling points. Francium's melting point is only estimated (mendeleev 294 K, about 21 °C;
// other sources about 300 K); most school tables show it as a solid, so it is shown as a solid with a note.
var STATE_OVERRIDES = {Fr: "solid"};
function state(e) {
  if (STATE_OVERRIDES[e.symbol]) return STATE_OVERRIDES[e.symbol];
  var T = 298.15, mp = e.meltingPointK, bp = e.boilingPointK;
  if (mp === null && bp === null) return "unknown";
  if (bp !== null && bp <= T) return "gas";
  if (mp !== null && mp <= T) return "liquid";
  return "solid";
}
var STATE_NOTES = {Fr: "Its melting point is only estimated, near room temperature, so some tables list it as a liquid."};

// ---------- Assemble ----------
var elements = src.map(function (e) {
  var fRow = (e.z >= 57 && e.z <= 71) || (e.z >= 89 && e.z <= 103);
  // The 30 elements in the two rows under the table are shown as f-block with no group number (README.md).
  var group = fRow ? null : e.group, block = fRow ? "f" : e.block;
  var category = METALLOIDS.indexOf(e.symbol) >= 0 ? "metalloid" : NONMETALS.indexOf(e.symbol) >= 0 ? "nonmetal" : "metal";
  var conf = parse(e.econf), predicted = write(aufbau(e.z)), actual = write(conf.full);
  var notes = [];
  if (CATEGORY_NOTES[e.symbol]) notes.push(CATEGORY_NOTES[e.symbol]);
  if (actual !== predicted) notes.push("Exception: the filling order predicts " + nobleOf(aufbau(e.z)) + ", but the measured ground state is " + nobleOf(conf.full) + ".");
  if (e.z >= 104) notes.push("The electron configuration is predicted from calculations, not measured.");
  if (STATE_NOTES[e.symbol]) notes.push(STATE_NOTES[e.symbol]);
  if (ION_NOTES[e.symbol]) notes.push(ION_NOTES[e.symbol]);
  var rec = {
    z: e.z, symbol: e.symbol, name: e.name, mass: massLabel(e), group: group, period: e.period, block: block,
    row: fRow ? (e.z <= 71 ? 8 : 9) : e.period, col: fRow ? 3 + e.z - (e.z <= 71 ? 57 : 89) : e.group,
    category: category, state: state(e), config: actual, noble: nobleOf(conf.full), exception: actual !== predicted,
    valence: group === null || block === "d" ? null : (group <= 2 ? group : (e.symbol === "He" ? 2 : group - 10)),
    ions: ions(e, group, category),
    en: e.enPauling, radius: e.covalentRadiusPyykko === null ? null : Math.round(e.covalentRadiusPyykko),
    ie: e.ie1kJ === null ? null : Math.round(e.ie1kJ), notes: notes
  };
  return rec;
});

// ---------- Page words ----------
var ui = {
  modes: [
    {id: "category", label: "Metal, nonmetal, metalloid", short: "Category"},
    {id: "block", label: "Block (s, p, d, f)", short: "Block"},
    {id: "radius", label: "Atomic radius", short: "Atomic radius", key: "radius", unit: "pm", spokenUnit: "picometers",
      bins: [30, 60, 90, 120, 150, 180, 210, 240],
      across: "decreases", down: "increases",
      acrossText: "Across a period, radius decreases: more protons pull on the same energy level (greater effective nuclear charge), so electrons are held closer.",
      downText: "Down a group, radius increases: each period adds an energy level, so the outer electrons are farther from the nucleus."},
    {id: "electronegativity", label: "Electronegativity", short: "Electronegativity", key: "en", unit: "", spokenUnit: "",
      bins: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
      across: "increases", down: "decreases",
      acrossText: "Across a period, electronegativity increases: a greater effective nuclear charge pulls bonding electrons more strongly.",
      downText: "Down a group, electronegativity decreases: more energy levels put bonding electrons farther from the nucleus.",
      extra: "Gray: most noble gases have no value because they rarely form bonds."},
    {id: "ionization", label: "First ionization energy", short: "Ionization energy", key: "ie", unit: "kJ/mol", spokenUnit: "kilojoules per mole",
      bins: [300, 600, 900, 1200, 1500, 1800, 2100, 2400],
      across: "increases", down: "decreases",
      acrossText: "Across a period, ionization energy increases: a greater effective nuclear charge holds the outer electrons more tightly.",
      downText: "Down a group, ionization energy decreases: with more energy levels, the outer electron is farther away and easier to remove.",
      extra: "Small dips: it drops slightly from group 2 to 13 and from group 15 to 16."}
  ],
  categories: [["metal", "Metal"], ["nonmetal", "Nonmetal"], ["metalloid", "Metalloid"]],
  blocks: [["s", "s-block"], ["p", "p-block"], ["d", "d-block"], ["f", "f-block"]],
  states: {solid: "Solid", liquid: "Liquid", gas: "Gas", unknown: "Unknown"},
  backToLesson: "\u2190 Back to the lesson",
  share: {
    url: "https://activities.zornscience.org/periodic-table/",
    title: "Periodic Table | ZornScience",
    text: "Explore all 118 elements and see periodic trends as heatmaps with ZornScience.",
    facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    x: "https://x.com/intent/tweet?text=",
    copied: "Link copied.",
    selected: "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.",
    opened: "Share options opened.",
    failed: "Use Copy link, email, or one of the social links instead."
  },
  fullscreen: "Full screen",
  exitFullscreen: "Exit full screen",
  paulingScale: "Pauling scale",
  range: "{low} to {high}",
  noData: "No data",
  noDataSpoken: "no data",
  across: "Across a period",
  down: "Down a group",
  trendWord: {increases: "increases", decreases: "decreases"},
  gridLabel: "Periodic table of the elements",
  lanthanides: "Lanthanides",
  actinides: "Actinides",
  placeholder: {6: ["57-71", "Lanthanides, atomic numbers 57 to 71, in the first row below the table"], 7: ["89-103", "Actinides, atomic numbers 89 to 103, in the second row below the table"]},
  atomicNumber: "atomic number",
  selected: "selected",
  match: "search match",
  found: "Found {name}. Press Enter for details.",
  notFound: "No element matches “{query}”. Try a name, a symbol or an atomic number from 1 to 118.",
  empty: "Type a name, a symbol or an atomic number.",
  details: {
    z: "Atomic number", symbol: "Symbol", mass: "Atomic mass", group: "Group", period: "Period", block: "Block",
    category: "Type", state: "State at room temperature", config: "Electron configuration",
    noble: "Noble-gas configuration", valence: "Valence electrons", ions: "Common ion charges",
    en: "Electronegativity (Pauling)", radius: "Atomic radius (covalent)", ie: "First ionization energy",
    noGroup: "None (f-block row)", noValence: "Not counted this way for d- and f-block elements",
    noIons: "No common simple ion", massNote: "Brackets: mass number of the longest-lived isotope (no stable isotope)",
    close: "Close details", title: "Element details",
    empty: "Select an element to see its atomic mass, electron configuration, common ions and trend values."
  },
  categoryName: {metal: "Metal", nonmetal: "Nonmetal", metalloid: "Metalloid"}
};

function line(e) { return "    " + JSON.stringify(e); }
var out = [
  "// Generated by tools/build-data.js from tools/sources/mendeleev-1.3.0.json. Do not edit by hand.",
  "// Sources and licenses: README.md. One element per line.",
  "(function () {",
  "  \"use strict\";",
  "  var root = document.querySelector('[data-zsa-activity=\"periodic-table\"]');",
  "  if (!root) return;",
  "  var data = {",
  "  elements: [",
  elements.map(line).join(",\n"),
  "  ],",
  "  ui: " + JSON.stringify(ui, null, 2).split("\n").join("\n  "),
  "  };",
  "  root.addEventListener(\"zsa:request-data\", function (event) { event.detail.receive(data); }, {once: true});",
  "}());",
  ""
].join("\n");
fs.writeFileSync(TARGET, out);
console.log("wrote " + elements.length + " elements to " + path.relative(process.cwd(), TARGET));
