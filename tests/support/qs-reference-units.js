// An independent reference for the Units practice tests (Metric Prefixes, Unit Conversions, Dimensional Analysis).
// Written from the lessons on zornscience.org, not from the activities' code: the prefix ladder and the exact
// equalities are typed again here, conversions run on decimal strings with tests/support/qs-reference.js, and unit
// algebra on written setups ("5.0 ft × (12 in / 1 ft)") checks that the units cancel to the goal.
"use strict";
const REF = require("./qs-reference.js");

// The lesson's ladder: six prefixes and the base unit, by the letters the activity uses in its question ids.
const LADDER = {M:["M", 6], k:["k", 3], b:["", 0], c:["c", -2], m:["m", -3], u:["μ", -6], n:["n", -9]};
const ORDER = ["M", "k", "b", "c", "m", "u", "n"];

// x × 10^k on decimal strings.
function shift(x, k) {
  const d = REF.dec(x);
  return k >= 0 ? REF.text({i: d.i * 10n ** BigInt(k), s: d.s}) : REF.text({i: d.i, s: d.s - k});
}
// x × (product of mul) ÷ (product of div), to 40 decimal places.
function convert(x, mul, div) {
  const top = mul.reduce((v, k) => REF.times(v, k), x), bottom = div.reduce((v, k) => REF.times(v, k), "1");
  return REF.quotient(top, bottom, 40).text;
}
// The rounded value {digits, exponent} of an exact (or long) decimal to n significant figures.
function round(value, n) { return REF.roundDigits(value, n); }
// The first n significant digits with no rounding, as a calculator shows them (12.84478 to 6 is 12.8447).
function cut(value, n) {
  const t = String(value).replace(/^-/, ""), point = t.indexOf("."), all = t.replace(".", ""), lead = all.search(/[1-9]/);
  return {digits: all.slice(lead, lead + n).padEnd(n, "0"), exponent: (point < 0 ? t.length : point) - 1 - lead - n + 1, negative: false};
}
// A typed answer's number part ("5.32e-7", "1500") equals the rounded value and shows n significant figures.
function shows(typed, r, n) {
  const num = typed.split(" ")[0];
  return REF.sameNumber(num, REF.plainOf(r)) && REF.countSf(num) === n;
}

// Exponents of a written unit: "g/cm³" is {g:1, cm:-3}, "m·s" is {m:1, s:1}, "1/s" is {s:-1}.
function unit(text) {
  const out = {};
  const [top, ...rest] = String(text).trim().split("/");
  const add = (part, sign) => part.split("·").map(s => s.trim()).filter(s => s && s !== "1").forEach(s => {
    const m = s.match(/^(.+?)([²³])?$/), p = m[2] === "²" ? 2 : m[2] === "³" ? 3 : 1;
    out[m[1]] = (out[m[1]] || 0) + sign * p;
  });
  add(top, 1);
  rest.forEach(part => add(part, -1));
  return clean(out);
}
function clean(u) { const out = {}; Object.keys(u).sort().forEach(k => { if (u[k]) out[k] = u[k]; }); return out; }
function combine(a, b, sign) {
  const out = Object.assign({}, a);
  Object.keys(b).forEach(k => { out[k] = (out[k] || 0) + sign * b[k]; });
  return clean(out);
}
// A written setup: "x U", then " × (a A / b B)" or " ÷ (…)" factors, each possibly squared or cubed, or "× y V".
// Returns the unit it gives and its value (as a decimal string to 40 places).
function setup(text) {
  const s = String(text).replace(/<sup>(.*?)<\/sup>/g, "e$1").replace(/ × 10e/g, "e").replace(/−/g, "-").replace(/,/g, "");
  const first = s.match(/^([\d.]+(?:e-?\d+)?) ([^×÷(]+?)(?= [×÷]|$)/);
  if (!first) throw new Error("not a setup: " + text);
  let units = unit(first[2]), top = [first[1]], bottom = [];
  const re = / ([×÷]) (?:\(([\d.]+) ([^/]+?) \/ ([\d.]+) ([^)]+?)\)([²³])?|([\d.]+(?:e-?\d+)?) ([^×÷]+?)(?= [×÷]|$))/g;
  let m, used = first[0].length;
  while ((m = re.exec(s))) {
    if (m.index !== used) throw new Error("cannot read setup at " + used + ": " + text);
    used = m.index + m[0].length;
    const sign = m[1] === "×" ? 1 : -1;
    if (m[2] !== undefined) {
      const p = m[6] === "²" ? 2 : m[6] === "³" ? 3 : 1;
      let f = combine(unit(m[3]), unit(m[5]), -1);
      for (let i = 0; i < p; i++) {
        units = combine(units, f, sign);
        (sign > 0 ? top : bottom).push(m[2]); (sign > 0 ? bottom : top).push(m[4]);
      }
    } else {
      units = combine(units, unit(m[8]), sign);
      (sign > 0 ? top : bottom).push(m[7]);
    }
  }
  if (used !== s.length) throw new Error("cannot read setup end: " + text);
  const num = top.reduce((v, k) => REF.times(v, k), "1"), den = bottom.reduce((v, k) => REF.times(v, k), "1");
  return {units, value: REF.quotient(num, den, 40).text};
}
function same(a, b) { return JSON.stringify(clean(a)) === JSON.stringify(clean(b)); }

module.exports = {LADDER, ORDER, shift, convert, round, cut, shows, unit, setup, same};
