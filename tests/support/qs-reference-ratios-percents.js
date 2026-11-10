// An independent reference for the Ratios and Percents practice tests (ratios, proportions, percents, percent error
// and percent change). It is written from the lessons on zornscience.org, not from the activities or
// shared/zsa-practice-model.js: decimals are scaled BigInt integers and quotients come from the long division and digit
// rounding in qs-reference.js. Atomic masses are typed again here from the lesson (H, C, N, O) and a periodic table.
"use strict";
const REF = require("./qs-reference.js");

function gcd(a, b) {
  a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  while (b) { const r = a % b; a = b; b = r; }
  return a;
}
// Two decimals as whole numbers with the same scale.
function scaled(a, b) {
  const x = REF.dec(a), y = REF.dec(b), s = Math.max(x.s, y.s);
  return [x.i * 10n ** BigInt(s - x.s), y.i * 10n ** BigInt(s - y.s), s];
}
// The simplest whole-number ratio: ratio("30", "150") is "1 : 5" and ratio("30", "1.5") is "20 : 1".
function ratio(a, b) {
  const [i, j] = scaled(a, b), g = gcd(i, j);
  return (i / g) + " : " + (j / g);
}
// A difference that keeps its decimal places: fixedMinus("48.0", "50.0") is "-2.0".
function fixedMinus(a, b) {
  const [i, j, s] = scaled(a, b), d = i - j, neg = d < 0n, digits = (neg ? -d : d).toString().padStart(s + 1, "0");
  return (neg ? "-" : "") + (s ? digits.slice(0, -s) + "." + digits.slice(-s) : digits);
}
// Significant figures in a difference written with its decimal places (no zeros at the end of a whole number).
function sfOfDifference(text) { return REF.countSf(text.replace(/^-/, "")); }
// a × b ÷ c, rounded half up to n significant figures, as standard notation.
function mulDiv(a, b, c, n) { return REF.plainOf(REF.roundDigits(REF.quotient(REF.times(a, b), c, 40).text, n)); }
// a × b ÷ c, rounded half up to d decimal places.
function mulDivPlaces(a, b, c, d) { return REF.plainOf(REF.roundDecimals(REF.quotient(REF.times(a, b), c, 40).text, d)); }
// Moving the decimal point: shift("4.5", -2) is "0.045" and shift("0.35", 2) is "35".
function shift(text, places) {
  const d = REF.dec(text);
  return places >= 0 ? REF.text({i: d.i * 10n ** BigInt(places), s: d.s}) : REF.text({i: d.i, s: d.s - places});
}
// Atoms in a formula, shown with <sub> or typed plain: atoms("Fe<sub>2</sub>O<sub>3</sub>") is {Fe: 2, O: 3}.
function atoms(formula) {
  const out = {}, t = String(formula).replace(/<\/?sub>/g, "");
  if (!/^(?:[A-Z][a-z]?\d*)+$/.test(t)) throw new Error("not a simple formula: " + formula);
  for (const m of t.matchAll(/([A-Z][a-z]?)(\d*)/g)) out[m[1]] = (out[m[1]] || 0) + Number(m[2] || 1);
  return out;
}
// An equation as shown ("4 Fe + 3 O<sub>2</sub> → 2 Fe<sub>2</sub>O<sub>3</sub>"): its species and whether every
// element has the same number of atoms on both sides.
function equation(html) {
  const sides = html.split(" → ");
  if (sides.length !== 2) throw new Error("no arrow: " + html);
  const parse = side => side.split(" + ").map(term => {
    const m = term.match(/^(?:(\d+) )?(\S+)$/);
    return {c: Number(m[1] || 1), formula: m[2]};
  });
  const left = parse(sides[0]), right = parse(sides[1]);
  const count = list => {
    const out = {};
    list.forEach(s => { const a = atoms(s.formula); for (const el in a) out[el] = (out[el] || 0) + s.c * a[el]; });
    return out;
  };
  const l = count(left), r = count(right), els = new Set(Object.keys(l).concat(Object.keys(r)));
  return {reactants: left, products: right, all: left.concat(right), balanced: [...els].every(el => l[el] === r[el])};
}
// Atomic masses: the lesson's values for H, C, N and O, and two-decimal values from a periodic table for the rest.
const ATOMIC = {H: "1.01", C: "12.01", N: "14.01", O: "16.00", Na: "22.99", Mg: "24.31", Al: "26.98", S: "32.07",
  Cl: "35.45", K: "39.10", Ca: "40.08", Fe: "55.85", Cu: "63.55"};
function molarMass(formula) {
  const a = atoms(formula);
  return Object.keys(a).reduce((sum, el) => REF.plus(sum, REF.times(String(a[el]), ATOMIC[el])), "0");
}

module.exports = {gcd, ratio, fixedMinus, sfOfDifference, mulDiv, mulDivPlaces, shift, atoms, equation, ATOMIC, molarMass};
