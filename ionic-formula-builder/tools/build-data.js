// Builds ../data.js for the Ionic Formula Builder. Run from the repository root:
//   node ionic-formula-builder/tools/build-data.js
// The 80 compounds are written out as an explicit table (one compound per line) so they can be checked
// line by line. Edit the ions or the text here and rerun; do not edit data.js by hand.
"use strict";
var fs = require("fs");
var path = require("path");

var cations = [
  {symbol: "Li", name: "lithium", group: 1, charge: 1},
  {symbol: "Na", name: "sodium", group: 1, charge: 1},
  {symbol: "K", name: "potassium", group: 1, charge: 1},
  {symbol: "Rb", name: "rubidium", group: 1, charge: 1},
  {symbol: "Cs", name: "cesium", group: 1, charge: 1},
  {symbol: "Mg", name: "magnesium", group: 2, charge: 2},
  {symbol: "Ca", name: "calcium", group: 2, charge: 2},
  {symbol: "Sr", name: "strontium", group: 2, charge: 2},
  {symbol: "Ba", name: "barium", group: 2, charge: 2},
  {symbol: "Al", name: "aluminum", group: 13, charge: 3}
];
// name: the ion name the lesson uses; element: the nonmetal's own name; root: the part kept before -ide.
var anions = [
  {symbol: "F", name: "fluoride", element: "fluorine", root: "fluor", group: 17, charge: -1},
  {symbol: "Cl", name: "chloride", element: "chlorine", root: "chlor", group: 17, charge: -1},
  {symbol: "Br", name: "bromide", element: "bromine", root: "brom", group: 17, charge: -1},
  {symbol: "I", name: "iodide", element: "iodine", root: "iod", group: 17, charge: -1},
  {symbol: "O", name: "oxide", element: "oxygen", root: "ox", group: 16, charge: -2},
  {symbol: "S", name: "sulfide", element: "sulfur", root: "sulf", group: 16, charge: -2},
  {symbol: "N", name: "nitride", element: "nitrogen", root: "nitr", group: 15, charge: -3},
  {symbol: "P", name: "phosphide", element: "phosphorus", root: "phosph", group: 15, charge: -3}
];

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
var prefixes = {1: "mono", 2: "di", 3: "tri"};
// Covalent-style prefix name, used only as the wrong "prefix" choice. The first element gets no mono-.
function prefixName(cation, anion, sub) {
  var first = (sub[0] > 1 ? prefixes[sub[0]] : "") + cation.name;
  var second = prefixes[sub[1]] + anion.name;
  if (second.indexOf("monoo") === 0) second = "mon" + second.slice(4); // mono + oxide = monoxide
  return first + " " + second;
}

var compounds = [];
cations.forEach(function (c) {
  anions.forEach(function (a) {
    var q = -a.charge;
    // Criss-cross: the cation's charge becomes the anion's subscript and the other way round.
    var crossed = [q, c.charge];
    var d = gcd(crossed[0], crossed[1]);
    var sub = [crossed[0] / d, crossed[1] / d];
    var formula = c.symbol + (sub[0] > 1 ? sub[0] : "") + a.symbol + (sub[1] > 1 ? sub[1] : "");
    compounds.push({
      name: c.name + " " + a.name,
      formula: formula,
      parts: [c.symbol, a.symbol],
      subscripts: sub,
      crossed: crossed,
      cation: c.symbol,
      anion: a.symbol,
      prefixName: prefixName(c, a, sub),
      elementName: c.name + " " + a.element,
      reversedName: a.name + " " + c.name
    });
  });
});
if (compounds.length !== 80) throw new Error("expected 80 compounds, got " + compounds.length);

var ui = {
  "questions": {
    "n2f": ["What charge does each ion have?", "How many of each ion?"],
    "f2n": ["Which ions are in this compound?", "What is the compound's name?"]
  },
  "captions": {"n2f": "Write the formula", "f2n": "Name the compound"},
  "partLegends": {
    "n2f": [["{Metal} ion", "{Ion} ion"], ["{Metal} ions", "{Ion} ions"]],
    "f2n": [["{M} ion", "{X} ion"], ["Name"]]
  },
  "stepNames": [
    ["n2f", 0, "Name to formula: ion charges"],
    ["n2f", 1, "Name to formula: subscripts"],
    ["f2n", 0, "Formula to name: which ions"],
    ["f2n", 1, "Formula to name: name it"]
  ],
  "hints": {
    "n2f": [
      [
        "Find both elements on the table. Metals lose electrons and form positive ions. Nonmetals gain electrons to reach 8 and form negative ions. The group number tells you how many.",
        "{Metal} is in group {mg}, so it loses {cElectrons}. {Nonmetal} is in group {xg}, so it gains {qElectrons}."
      ],
      [
        "Charges add to 0. Criss-cross the charges: the charge of one ion becomes the subscript of the other ion. Then reduce to the lowest ratio.",
        {
          "cross": "{M} is {cLabel} and {X} is {qLabel}. The {c} goes under {X} and the {q} goes under {M}.",
          "one": "{M} is {cLabel} and {X} is {qLabel}. One of each already adds to 0.",
          "reduce": "{M} is {cLabel} and {X} is {qLabel}. Criss-crossing gives {c} : {q}. What is the lowest ratio?"
        }
      ]
    ],
    "f2n": [
      [
        "Subscripts count ions. Charges come from the group number: find each element on the table.",
        "{M} is in group {mg}, so it loses {cElectrons}. {X} is in group {xg}, so it gains {qElectrons}."
      ],
      [
        "Binary ionic = metal + nonmetal. The metal keeps its name. The nonmetal is named with its root + ide. No prefixes for ionic names.",
        "{M} is {metal}. For {X}, take the root of {nonmetal} ({root}) and add ide."
      ]
    ]
  },
  "correct": {
    "n2f": [
      "{Metal} (group {mg}) loses {c}: {M} {cLabel}. {Nonmetal} (group {xg}) gains {q}: {X} {qLabel}.",
      {
        "cross": "Criss-cross the charges: {formula}. Check: {sum}.",
        "one": "One of each: {formula}. Check: {sum}. Never write a subscript of 1.",
        "reduce": "Criss-crossing gives {crossed}. Reduce to the lowest ratio, 1 : 1: {formula}. Check: {sum}."
      }
    ],
    "f2n": [
      "{M} (group {mg}) is {cLabel}, {X} (group {xg}) is {qLabel}. Subscripts count ions: {sum}.",
      "The metal keeps its name and {nonmetal} becomes {ion}: {name}. No prefixes for ionic names."
    ]
  },
  "feedback": {
    "groupRule": "Charges come from the group number.",
    "metalCharge": "{Metal} is a metal in group {mg}. How many electrons does it lose?",
    "nonmetalCharge": "{Nonmetal} is a nonmetal in group {xg}. How many electrons does it gain to reach 8?",
    "misread": "Subscripts count ions. Charges come from the group number.",
    "misreadOne": "A missing subscript means 1 ion, not a charge of 1.",
    "reduce": "{a} : {b} is the same ratio as {x} : {y}. Reduce to the lowest ratio.",
    "oneEach": "{tried}. One of each works only when the charges are equal.",
    "swap": "{tried}. The charge of one ion becomes the subscript of the other ion.",
    "sum": "{tried}. Criss-cross the charges so the total charge is 0.",
    "prefix": "Never use mono-, di-, or tri- for ionic compounds. The charges already set the ratio.",
    "noIde": "The nonmetal's name changes: nonmetal root + ide.",
    "reversed": "Name the metal first. The metal keeps its name, then the nonmetal root + ide."
  },
  "noOne": "Never write a subscript of 1.",
  "trail": {"charges": "{M} {cLabel}, {X} {qLabel}", "formula": "{formulaNamed}", "name": "{Name}"},
  "summary": "{Name}. Check: {sum}, so total charge = 0.",
  "reminder": "{Name} is {formula}: {sum}.",
  "notZero": "not 0",
  "electron": "electron",
  "electrons": "electrons",
  "metalWord": "metal",
  "hint": "Hint",
  "hint2": "Another hint",
  "hintsDone": "Both hints shown",
  "show": "Show me",
  "next": "Next compound",
  "correctPrefix": "✓ Correct. ",
  "wrong": "↻ Not yet. ",
  "revealed": "→ Answer shown. ",
  "complete": "Compound complete",
  "roundComplete": "Round complete",
  "singleDone": "Chosen compound complete",
  "firstTry": "First-try correct on original compounds",
  "review": "Keep practicing",
  "none": "You completed every original step on the first try.",
  "again": "Practice again",
  "misses": "Practice my misses",
  "reviewLabel": "Review",
  "singleLabel": "Chosen compound",
  "itemLabel": "Compound",
  "of": "of",
  "stepLabel": "Step",
  "repeatNote": "Review items do not change the first-try counts.",
  "hintPrefix": "Hint: ",
  "trailLabel": "Your answers so far",
  "correctMark": "Correct: ",
  "shownMark": "Shown: ",
  "currentMark": " (in this compound)",
  "hintMark": " (hint)",
  "triedMark": " (tried, not correct)",
  "chargeMark": "ion charge",
  "buildLabel": "Your formula so far",
  "unknown": "?",
  "unknownSpoken": "not chosen",
  "spokenTimes": "times",
  "spokenPlus": "plus",
  "spokenMinus": "minus",
  "spokenEquals": "equals",
  "directions": {"n2f": "Name to formula", "f2n": "Formula to name"}
};

var table = [
  ["H", "", "", "", "", "", "", "He"],
  ["Li", "Be", "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "In", "Sn", "Sb", "Te", "I", "Xe"],
  ["Cs", "Ba", "Tl", "Pb", "Bi", "Po", "At", "Rn"]
];

function block(name, rows) {
  return '  "' + name + '": [\n' + rows.map(function (r) { return "    " + JSON.stringify(r); }).join(",\n") + "\n  ]";
}
function indent(value) { return JSON.stringify(value, null, 2).replace(/\n/g, "\n  "); }

var body = [
  block("cations", cations),
  block("anions", anions),
  block("compounds", compounds),
  '  "ui": ' + indent(ui),
  '  "tableCaption": "Main-group elements by group (column) and period (row)"',
  '  "periodLabel": "Period"',
  '  "finishLabel": "See round summary"',
  '  "groups": ' + JSON.stringify([1, 2, 13, 14, 15, 16, 17, 18]),
  block("table", table)
].join(",\n");

var out = "// Generated by tools/build-data.js. Edit that script and rerun it instead of editing this file.\n" +
  "(function () {\n" +
  "  \"use strict\";\n" +
  "  var root = document.querySelector('[data-zsa-activity=\"ionic-formula-builder\"]');\n" +
  "  if (!root) return;\n" +
  "  var data = {\n" + body + "\n};\n" +
  "  root.addEventListener(\"zsa:request-data\", function (event) { event.detail.receive(data); }, {once: true});\n" +
  "}());\n";
fs.writeFileSync(path.join(__dirname, "..", "data.js"), out);
console.log("Wrote data.js with " + compounds.length + " compounds.");
