// Builds periodic-trends/data.js: every question from the Periodic Table's data (../periodic-table/data.js), checked
// against the trend rule, without near ties (values within 2%), plus the excluded pairs and every word a student
// sees. Run from the repository root:
//   node periodic-trends/tools/build-data.js
// Do not edit data.js by hand. Node only, no dependencies.
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var TARGET = path.join(__dirname, "..", "data.js");
// Read the Periodic Table's data.js the way the page does: it hands its data to a stand-in activity root.
var table;
(function () {
  var root = {dispatchEvent: function () {}, addEventListener: function (type, fn) { fn({detail: {receive: function (d) { table = d; }}}); }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "..", "periodic-table", "data.js"), "utf8"), {CustomEvent: function (type, options) { this.type = type; this.detail = options.detail; }, document: {querySelector: function () { return root; }}});
}());

var GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
var PERIODS = [2, 3, 4, 5];
// The three properties. `higher` names the bigger value; `rule` gives the trend direction for each relation.
var PROPS = [
  {id: "radius", key: "radius", label: "atomic radius", unit: " pm", higher: "larger", rule: {period: "decreases", group: "increases"}, nobleGases: true},
  {id: "en", key: "en", label: "electronegativity", unit: "", higher: "higher", rule: {period: "increases", group: "decreases"}, nobleGases: false},
  {id: "ie", key: "ie", label: "first ionization energy", unit: " kJ/mol", higher: "higher", rule: {period: "increases", group: "decreases"}, nobleGases: true}
];

var elements = {};
table.elements.forEach(function (e) {
  if (PERIODS.indexOf(e.period) < 0 || GROUPS.indexOf(e.group) < 0) return; // main groups, periods 2 to 5
  elements[e.symbol] = {symbol: e.symbol, name: e.name, z: e.z, group: e.group, period: e.period, radius: e.radius, en: e.en, ie: e.ie};
});
var pool = Object.keys(elements).map(function (s) { return elements[s]; }).sort(function (a, b) { return a.z - b.z; });

// The rule's prediction: across a period (left to right) and down a group, does the value go up with atomic number?
function ruleWinner(prop, a, b, relation) {
  var upWithZ = prop.rule[relation] === "increases";
  return upWithZ ? b : a; // a has the smaller atomic number
}
// Two values within 2% of the larger one are too close to call from the trend alone, so the pair is not asked.
var MIN_DIFFERENCE = 0.02;
function nearTie(va, vb) { return Math.abs(va - vb) <= MIN_DIFFERENCE * Math.max(Math.abs(va), Math.abs(vb)); }
var items = [], excluded = [];
PROPS.forEach(function (prop) {
  for (var i = 0; i < pool.length; i++) {
    for (var j = i + 1; j < pool.length; j++) {
      var a = pool[i], b = pool[j];
      var relation = a.group === b.group ? "group" : a.period === b.period ? "period" : null;
      if (!relation) continue;
      if (!prop.nobleGases && (a.group === 18 || b.group === 18)) continue;
      var va = a[prop.key], vb = b[prop.key], id = prop.id + "-" + a.symbol + "-" + b.symbol;
      var predicted = ruleWinner(prop, a, b, relation);
      if (va === null || vb === null) { excluded.push({id: id, prop: prop.id, a: a.symbol, b: b.symbol, relation: relation, values: [va, vb], reason: "no value"}); continue; }
      var actual = va === vb ? null : (va > vb ? a : b);
      if (actual === null) { excluded.push({id: id, prop: prop.id, a: a.symbol, b: b.symbol, relation: relation, values: [va, vb], reason: "equal"}); continue; }
      if (actual !== predicted) { excluded.push({id: id, prop: prop.id, a: a.symbol, b: b.symbol, relation: relation, values: [va, vb], reason: "against the trend"}); continue; }
      if (nearTie(va, vb)) { excluded.push({id: id, prop: prop.id, a: a.symbol, b: b.symbol, relation: relation, values: [va, vb], reason: "near tie"}); continue; }
      items.push({id: id, prop: prop.id, a: a.symbol, b: b.symbol, relation: relation, answer: actual.symbol});
    }
  }
});

// ---------- Words ----------
var ui = {
  props: {
    radius: {label: "atomic radius", Label: "Atomic radius", unit: " pm", higher: "larger", question: "Which has the larger atomic radius?",
      why: {period: "Across a period, atomic radius decreases: each element adds a proton to the same energy level, so a greater effective nuclear charge pulls the electrons closer.",
        group: "Down a group, atomic radius increases: each period adds an energy level, so the outer electrons are farther from the nucleus."},
      confuse: "That is the ionization energy trend. Atomic radius goes the opposite way."},
    en: {label: "electronegativity", Label: "Electronegativity", unit: "", higher: "higher", question: "Which has the higher electronegativity?",
      why: {period: "Across a period, electronegativity increases: a greater effective nuclear charge pulls bonding electrons more strongly.",
        group: "Down a group, electronegativity decreases: more energy levels put bonding electrons farther from the nucleus."},
      confuse: "That is backwards."},
    ie: {label: "first ionization energy", Label: "First ionization energy", unit: " kJ/mol", higher: "higher", question: "Which has the higher first ionization energy?",
      why: {period: "Across a period, first ionization energy increases: a greater effective nuclear charge holds the outer electrons more tightly.",
        group: "Down a group, first ionization energy decreases: more energy levels put the outer electron farther from the nucleus, so it is easier to remove."},
      confuse: "That is the atomic radius trend. Ionization energy goes the opposite way."}
  },
  questions: [
    "Are {nameA} and {nameB} in the same group or the same period?",
    {period: "Across a period (left to right), how does {label} change?", group: "Down a group (top to bottom), how does {label} change?"}
  ],
  relations: [["group", "Same group"], ["period", "Same period"], ["neither", "Neither"]],
  directions: [["increases", "Increases"], ["decreases", "Decreases"], ["same", "No change"]],
  place: {group: "group {group}", period: "period {period}"},
  feedback: {
    relation: "{NameA} is in group {groupA}, period {periodA}; {nameB} is in group {groupB}, period {periodB}. A group is a column; a period is a row.",
    neither: "They do share a row or a column. Find both on the table: a group is a column, a period is a row.",
    flat: {period: "It does change. Across a period every element adds a proton to the same energy level, and that changes the pull on the electrons.",
      group: "It does change. Down a group every period adds an energy level, and that changes how far the outer electrons are from the nucleus."},
    reverse: "{confuse} {think}",
    atomicNumber: "A larger atomic number does not always mean a {higher} {label}. Use the trend: {label} {direction} {where}.",
    applyReverse: "Use the direction you found: {label} {direction} {where}, so the element farther {toward} has the {higher} value."
  },
  where: {period: "from left to right", group: "from top to bottom"},
  think: {period: "Think about effective nuclear charge.", group: "Think about energy levels."},
  toward: {period: {increases: "right", decreases: "left"}, group: {increases: "down", decreases: "up"}},
  hints: [
    ["Find both elements on the table. A group is a column; a period is a row.", "{NameA}: group {groupA}, period {periodA}. {NameB}: group {groupB}, period {periodB}."],
    [{period: "Across a period, protons are added but the outer electrons stay in the same energy level.",
      group: "Down a group, each period adds an energy level."}, "{why}"],
    ["Use the direction from step 2 and where each element sits on the table.", "{Label} {direction} {where}. {NameA} is {positionA} {nameB}."]
  ],
  position: {period: "to the left of", group: "above"},
  trail: ["Same {relation}", "{Label} {direction}", "{Winner}"],
  trailDirection: {increases: "increases", decreases: "decreases"},
  explain: ["Both are in {place}.", "{why}", "{Winner} has the {higher} {label}: {symbolA} {valueA}, {symbolB} {valueB}."],
  summary: "{Winner} has the {higher} {label}. {SymbolA}: {valueA}. {SymbolB}: {valueB}.",
  tableLink: "See this trend on the Periodic Table",
  heading: "{NameA} ({symbolA}) and {nameB} ({symbolB})",
  caption: "Compare: {label}",
  reminder: "{NameA} and {nameB}: {label}. {Winner} is {higher}.",
  stats: ["Same group or period", "Trend direction", "Which element"],
  labels: {next: "Next question", complete: "Question complete", singleDone: "Trend practice complete", firstTry: "First-try correct on original questions",
    itemLabel: "Question", singleLabel: "Question", currentMark: " (in this question)", finish: "See round summary"},
  practice: [["mixed", "All three trends"], ["radius", "Atomic radius only"], ["en", "Electronegativity only"], ["ie", "First ionization energy only"]]
};

var mainTable = [1, 2, 3, 4, 5, 6].map(function (p) {
  return GROUPS.map(function (g) {
    var e = table.elements.find(function (x) { return x.period === p && x.group === g; });
    return e ? e.symbol : "";
  });
});

// Mexican Spanish: the words in tools/spanish.json, and element names from the Periodic Table's Spanish source.
var spanish = JSON.parse(fs.readFileSync(path.join(__dirname, "spanish.json"), "utf8"));
var tableSpanish = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "periodic-table", "tools", "spanish.json"), "utf8"));
var names = {};
Object.keys(elements).sort(function (x, y) { return elements[x].z - elements[y].z; }).forEach(function (s) {
  names[s] = tableSpanish[elements[s].name];
  if (!names[s]) throw new Error("no Spanish name for " + elements[s].name);
});

var rules = {};
PROPS.forEach(function (p) { rules[p.id] = p.rule; });
function line(x) { return "    " + JSON.stringify(x); }
var out = [
  "// Generated by tools/build-data.js from ../periodic-table/data.js. Do not edit by hand.",
  "// " + items.length + " questions and " + excluded.length + " excluded pairs (listed in README.md). One per line.",
  "(function () {",
  "  \"use strict\";",
  "  var root = document.querySelector('[data-zsa-activity=\"periodic-trends\"]');",
  "  if (!root) return;",
  "  var data = {",
  "  elements: {",
  Object.keys(elements).sort(function (x, y) { return elements[x].z - elements[y].z; }).map(function (s) { return "    " + JSON.stringify(s) + ": " + JSON.stringify(elements[s]); }).join(",\n"),
  "  },",
  "  items: [",
  items.map(line).join(",\n"),
  "  ],",
  "  excluded: [",
  excluded.map(line).join(",\n"),
  "  ],",
  "  rule: " + JSON.stringify(rules) + ",",
  "  tableMode: " + JSON.stringify({radius: "radius", en: "electronegativity", ie: "ionization"}) + ",",
  "  groups: " + JSON.stringify(GROUPS) + ",",
  "  table: " + JSON.stringify(mainTable) + ",",
  "  ui: " + JSON.stringify(ui, null, 2).split("\n").join("\n  "),
  "  };",
  "  var i18n;",
  "  root.dispatchEvent(new CustomEvent(\"zsa:request-i18n\", {detail:{receive:function (api) { i18n = api; }}}));",
  "  if (i18n) {",
  "    i18n.configure({title:\"Periodic Trends Practice\", es:" + JSON.stringify(spanish.es, null, 2).split("\n").join("\n    ") + "});",
  "    if (i18n.lang === \"es\") {",
  "      var names = " + JSON.stringify(names) + ";",
  "      Object.keys(data.elements).forEach(function (symbol) { data.elements[symbol].name = names[symbol]; });",
  "      data.ui = " + JSON.stringify(spanish.ui, null, 2).split("\n").join("\n      ") + ";",
  "    }",
  "  }",
  "  root.addEventListener(\"zsa:request-data\", function (event) { event.detail.receive(data); }, {once: true});",
  "}());",
  ""
].join("\n");
fs.writeFileSync(TARGET, out);
console.log("wrote " + items.length + " questions and " + excluded.length + " excluded pairs to " + path.relative(process.cwd(), TARGET));
