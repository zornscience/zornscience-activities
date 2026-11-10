// An independent reference for the Equations practice tests (Reading Formulas, Rearranging Equations, Substituting
// with Units). It does not use the activities' code: units are worked as maps of base-unit exponents, and decimal
// points are moved on the digit strings.
"use strict";

// Named units as base units, from the lessons: N = kg·m/s², J = N·m = kg·m²/s².
const NAMED = {N:{kg:1, m:1, s:-2}, J:{kg:1, m:2, s:-2}};
const POWERS = {"²":2, "³":3};

function add(map, symbol, k) {
  map[symbol] = (map[symbol] || 0) + k;
  if (!map[symbol]) delete map[symbol];
}
// "kg·m/s²" to {kg:1, m:1, s:-2}; "1/s" to {s:-1}; "L·atm/(mol·K)" to {L:1, atm:1, mol:-1, K:-1}. Named units stay
// as they are; base() expands them.
function parseUnit(text) {
  const out = {}, s = String(text).trim(), slash = s.indexOf("/");
  const top = slash < 0 ? s : s.slice(0, slash), bottom = slash < 0 ? "" : s.slice(slash + 1).replace(/^\((.*)\)$/, "$1");
  for (const [part, sign] of [[top, 1], [bottom, -1]]) {
    for (const token of part.split("·").filter(Boolean)) {
      const m = token.match(/^(.+?)([²³])?$/);
      if (m[1] !== "1") add(out, m[1], sign * (POWERS[m[2]] || 1));
    }
  }
  return out;
}
function base(map) {
  const out = {};
  for (const [symbol, k] of Object.entries(map)) {
    if (NAMED[symbol]) for (const [b, j] of Object.entries(NAMED[symbol])) add(out, b, j * k);
    else add(out, symbol, k);
  }
  return out;
}
// The unit of a product of [unit, power] factors, such as [["m/s", 1], ["s", 1]] for (m/s)(s).
function combine(factors) {
  const out = {};
  for (const [unit, power] of factors) for (const [symbol, k] of Object.entries(parseUnit(unit))) add(out, symbol, k * power);
  return out;
}
function sameUnit(a, b) {
  const x = base(typeof a === "string" ? parseUnit(a) : a), y = base(typeof b === "string" ? parseUnit(b) : b);
  const keys = new Set(Object.keys(x).concat(Object.keys(y)));
  for (const key of keys) if ((x[key] || 0) !== (y[key] || 0)) return false;
  return true;
}
// Move the decimal point k places left on the digits, keeping every written digit: "425" and 3 give "0.425",
// "85.0" and 2 give "0.850".
function shiftLeft(text, k) {
  const [whole, frac = ""] = String(text).split("."), digits = whole + frac, point = whole.length - k;
  const padded = point <= 0 ? "0".repeat(1 - point) + digits : digits, at = Math.max(point, 1);
  return (padded.slice(0, at) + "." + padded.slice(at)).replace(/^0+(?=\d)/, "");
}

module.exports = {parseUnit, base, combine, sameUnit, shiftLeft};
