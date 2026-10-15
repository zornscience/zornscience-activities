// Independent reference for the tests. Written from the chemistry and the README rules, without reading the
// activities' code or data files, so a test that compares the two can catch a mistake in either.
"use strict";

var GASES = {2: "helium", 10: "neon", 18: "argon", 36: "krypton", 54: "xenon", 86: "radon"};
var PERIOD_GAS = {1: "helium", 2: "neon", 3: "argon", 4: "krypton", 5: "xenon", 6: "radon"};

// [name, symbol, atomic number, group, period, ion name for a nonmetal]
var ICT_ROWS = [
  ["lithium", "Li", 3, 1, 2], ["sodium", "Na", 11, 1, 3], ["potassium", "K", 19, 1, 4], ["rubidium", "Rb", 37, 1, 5],
  ["cesium", "Cs", 55, 1, 6], ["magnesium", "Mg", 12, 2, 3], ["calcium", "Ca", 20, 2, 4], ["strontium", "Sr", 38, 2, 5],
  ["barium", "Ba", 56, 2, 6], ["aluminum", "Al", 13, 13, 3],
  ["nitrogen", "N", 7, 15, 2, "nitride"], ["phosphorus", "P", 15, 15, 3, "phosphide"], ["oxygen", "O", 8, 16, 2, "oxide"],
  ["sulfur", "S", 16, 16, 3, "sulfide"], ["selenium", "Se", 34, 16, 4, "selenide"], ["fluorine", "F", 9, 17, 2, "fluoride"],
  ["chlorine", "Cl", 17, 17, 3, "chloride"], ["bromine", "Br", 35, 17, 4, "bromide"], ["iodine", "I", 53, 17, 5, "iodide"]
];

var elements = ICT_ROWS.map(function (r) {
  var group = r[3], valence = group <= 2 ? group : group - 10, metal = valence <= 3;
  var charge = metal ? valence : valence - 8, electrons = r[2] - charge;
  return {
    name: r[0], symbol: r[1], z: r[2], group: group, period: r[4], valence: valence, metal: metal,
    charge: charge, moved: Math.abs(charge), direction: metal ? "loses" : "gains", electrons: electrons,
    gas: GASES[electrons], ion: metal ? r[0] + " ion" : r[5],
    // The tempting wrong gas: a metal's own period, or the period before a nonmetal's.
    trapGas: metal ? PERIOD_GAS[r[4]] : PERIOD_GAS[r[4] - 1]
  };
});

var ICT_GASES = ["helium", "neon", "argon", "krypton", "xenon"];

// Expected misconception key for each Ion Charge Trainer step (README "Misconception map and precedence").
function ictKey(e, step, a, b) {
  if (step === 0) {
    if (a === e.valence) return null;
    if (a === e.period && a === 8 - e.valence) return "combined";
    if (a === e.period) return "period";
    if (a === e.z) return "atomic";
    if (a === 8 - e.valence) return "complement";
    return "general";
  }
  if (step === 1) {
    if (a === e.direction && b === e.moved) return null;
    if (a !== e.direction && b === 8 - e.moved) return "long";
    if (a !== e.direction && b === e.moved) return "direction";
    if (a === e.direction) return "number";
    return "general";
  }
  if (step === 2) {
    if (a === e.charge) return null;
    if (a === -e.charge) return "sign";
    if (Math.abs(a) === e.valence) return "valence";
    return "size";
  }
  var keys = [];
  if (a !== e.ion) keys.push("nameRule");
  if (b !== e.gas) keys.push(b === e.trapGas ? "trapGas" : "gasCount");
  return keys.length ? keys : null;
}
// A phrase that appears in every element's wording for that key.
var ICT_PHRASES = {
  period: /period, or row/, atomic: /total number of electrons in the neutral atom/, complement: /would need to reach 8/,
  combined: /is both .*period and how many electrons it needs/, long: /long path/,
  direction: /metals lose electrons and nonmetals gain them/, number: /Count again\./, valence: /valence electrons, not the charge/,
  sign: /so the charge is (positive|negative)/, size: /Check it with protons − electrons/, general: /Use a hint and try again/,
  nameRule: /ide ending|changes its ending to/, trapGas: /own period|own outer level/, gasCount: /protons minus the charge/
};

// Ionic Formula Builder ions.
var CATIONS = [["Li", "lithium", 1, 1], ["Na", "sodium", 1, 1], ["K", "potassium", 1, 1], ["Rb", "rubidium", 1, 1],
  ["Cs", "cesium", 1, 1], ["Mg", "magnesium", 2, 2], ["Ca", "calcium", 2, 2], ["Sr", "strontium", 2, 2],
  ["Ba", "barium", 2, 2], ["Al", "aluminum", 13, 3]].map(function (r) { return {symbol: r[0], name: r[1], group: r[2], charge: r[3]}; });
var ANIONS = [["F", "fluorine", "fluoride", 17], ["Cl", "chlorine", "chloride", 17], ["Br", "bromine", "bromide", 17],
  ["I", "iodine", "iodide", 17], ["O", "oxygen", "oxide", 16], ["S", "sulfur", "sulfide", 16], ["N", "nitrogen", "nitride", 15],
  ["P", "phosphorus", "phosphide", 15]].map(function (r) { return {symbol: r[0], element: r[1], name: r[2], group: r[3], charge: r[3] - 18}; });

function lcm(a, b) { var x = a, y = b; while (y) { var t = y; y = x % y; x = t; } return a * b / x; }
var NUMBER_PREFIX = {1: "mono", 2: "di", 3: "tri"};
var compounds = [];
CATIONS.forEach(function (m) {
  ANIONS.forEach(function (x) {
    var c = m.charge, q = -x.charge, l = lcm(c, q), sub = [l / c, l / q];
    var second = NUMBER_PREFIX[sub[1]] + x.name;
    if (second === "monooxide") second = "monoxide";
    compounds.push({
      metal: m, nonmetal: x, c: c, q: q, subscripts: sub, reduced: !(sub[0] === q && sub[1] === c),
      formula: m.symbol + (sub[0] > 1 ? sub[0] : "") + x.symbol + (sub[1] > 1 ? sub[1] : ""),
      spoken: [m.symbol].concat(sub[0] > 1 ? [String(sub[0])] : [], [x.symbol], sub[1] > 1 ? [String(sub[1])] : []).join(" "),
      name: m.name + " " + x.name,
      prefixName: (sub[0] > 1 ? NUMBER_PREFIX[sub[0]] : "") + m.name + " " + second,
      elementName: m.name + " " + x.element,
      reversedName: x.name + " " + m.name
    });
  });
});

// "(+2) + (−1) = +1, not 0" style charge sum (README).
function chargeSum(c, q, a, b) {
  function term(n, charge) { return (n === 1 ? "" : n) + "(" + (charge > 0 ? "+" : "−") + Math.abs(charge) + ")"; }
  var total = a * c - b * q;
  return term(a, c) + " + " + term(b, -q) + " = " + (total === 0 ? "0" : (total > 0 ? "+" : "−") + Math.abs(total) + ", not 0");
}

// Expected result of an Ionic Formula Builder answer: null when right, else {keys, wrong}.
function ifbResult(cp, dir, step, picks) {
  if (step === 0) {
    var keys = [], wrong = [];
    [["metal", cp.c, 0, "metalCharge"], ["nonmetal", -cp.q, 1, "nonmetalCharge"]].forEach(function (p) {
      var v = picks[p[0]];
      if (v === p[1]) return;
      wrong.push(p[0]);
      if (dir === "f2n" && Math.abs(v) === cp.subscripts[p[2]]) {
        if (keys.indexOf("misread") < 0) keys.push("misread");
        if (cp.subscripts[p[2]] === 1 && keys.indexOf("misreadOne") < 0) keys.push("misreadOne");
      } else keys.push(p[3]);
    });
    if (!wrong.length) return null;
    var order = ["misread", "misreadOne", "metalCharge", "nonmetalCharge"];
    keys.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    if (keys[0] !== "misread") keys.unshift("groupRule");
    return {keys: keys, wrong: wrong};
  }
  if (dir === "f2n") {
    var n = picks.name;
    if (n === cp.name) return null;
    return {keys: [n === cp.prefixName ? "prefix" : n === cp.elementName ? "noIde" : "reversed"], wrong: ["name"]};
  }
  var a = picks.msub, b = picks.xsub, x = cp.subscripts[0], y = cp.subscripts[1];
  if (a === x && b === y) return null;
  var key;
  if (a * cp.c === b * cp.q) key = "reduce";
  else if (a === 1 && b === 1) key = "oneEach";
  else if ((a === y && b === x) || (a === cp.c && b === cp.q)) key = "swap";
  else key = "sum";
  return {keys: [key], wrong: (a !== x ? ["msub"] : []).concat(b !== y ? ["xsub"] : [])};
}
var IFB_PHRASES = {
  groupRule: /Charges come from the group number\./, metalCharge: /is a metal in group \d+\. How many electrons does it lose\?/,
  nonmetalCharge: /is a nonmetal in group \d+\. How many electrons does it gain to reach 8\?/,
  misread: /Subscripts count ions\. Charges come from the group number\./, misreadOne: /A missing subscript means 1 ion, not a charge of 1\./,
  reduce: /is the same ratio as \d : \d\. Reduce to the lowest ratio\./, oneEach: /One of each works only when the charges are equal\./,
  swap: /The charge of one ion becomes the subscript of the other ion\./, sum: /Criss-cross the charges so the total charge is 0\./,
  prefix: /Never use mono-, di-, or tri- for ionic compounds\./, noIde: /The nonmetal's name changes: nonmetal root \+ ide\./,
  reversed: /Name the metal first\./
};

module.exports = {elements: elements, ICT_GASES: ICT_GASES, ictKey: ictKey, ICT_PHRASES: ICT_PHRASES,
  CATIONS: CATIONS, ANIONS: ANIONS, compounds: compounds, chargeSum: chargeSum, ifbResult: ifbResult, IFB_PHRASES: IFB_PHRASES};
