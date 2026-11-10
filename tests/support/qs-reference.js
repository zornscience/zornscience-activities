// An independent reference for the Quantitative Skills practice tests. It is written from the lesson rules on
// zornscience.org, not from shared/zsa-practice-model.js, and uses different methods on purpose: decimal strings as
// scaled BigInt integers (not fractions), digit-by-digit rounding on strings, and long division with the remainder kept
// to break ties. A mistake in either side shows up as a disagreement.
"use strict";

// A decimal is {i: BigInt, s: scale}, meaning i × 10^-s with s >= 0.
function dec(text) {
  var m = String(text).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);
  if (!m || !(m[2] || m[3])) throw new Error("not a decimal: " + text);
  var digits = (m[2] || "") + (m[3] || ""), s = (m[3] || "").length - Number(m[4] || 0), i = BigInt(digits || "0");
  if (s < 0) { i *= 10n ** BigInt(-s); s = 0; }
  return {i: m[1] === "-" ? -i : i, s: s};
}
function align(a, b) {
  var s = Math.max(a.s, b.s);
  return [a.i * 10n ** BigInt(s - a.s), b.i * 10n ** BigInt(s - b.s), s];
}
function plus(a, b) { var x = align(dec(a), dec(b)); return text({i: x[0] + x[1], s: x[2]}); }
function minus(a, b) { var x = align(dec(a), dec(b)); return text({i: x[0] - x[1], s: x[2]}); }
function times(a, b) { a = dec(a); b = dec(b); return text({i: a.i * b.i, s: a.s + b.s}); }
function text(d) {
  var neg = d.i < 0n, digits = (neg ? -d.i : d.i).toString().padStart(d.s + 1, "0");
  var out = d.s ? digits.slice(0, -d.s) + "." + digits.slice(-d.s) : digits;
  if (out.indexOf(".") >= 0) out = out.replace(/0+$/, "").replace(/\.$/, "");
  return (neg && /[1-9]/.test(out) ? "-" : "") + out;
}
// a ÷ b to `digits` digits after the point, plus whether anything was left over (for exact ties).
function quotient(a, b, digits) {
  a = dec(a); b = dec(b);
  var x = align(a, b), num = x[0] < 0n ? -x[0] : x[0], den = x[1] < 0n ? -x[1] : x[1];
  var negative = (x[0] < 0n) !== (x[1] < 0n), scaled = num * 10n ** BigInt(digits);
  return {text: text({i: (negative ? -1n : 1n) * (scaled / den), s: digits}), rest: scaled % den !== 0n, negative: negative};
}
// Significant figures in a written number, by the lesson rules: nonzero digits count, zeros between them count,
// leading zeros never count, zeros at the end count only when there is a decimal point. In scientific notation only
// the coefficient counts.
function countSf(written) {
  var t = String(written).replace(/,/g, "").replace(/\s/g, "").replace(/^[+-]/, "");
  var coef = t.split(/[eE]|×10|x10/)[0];
  var core = coef.replace(".", "").replace(/^0+/, "");
  if (coef.indexOf(".") < 0) core = core.replace(/0+$/, "");
  return core.length;
}
// Round a decimal string half up (5 or more rounds up, away from zero) to n significant figures, by digits.
// Returns {digits, exponent}: the n kept digits and the power of ten of the last one.
function roundDigits(value, n, rest) {
  var t = String(value).replace(/^-/, ""), negative = /^-/.test(String(value));
  var point = t.indexOf("."), all = t.replace(".", ""), lead = all.search(/[1-9]/);
  if (lead < 0) throw new Error("zero has no significant figures");
  var intLen = point < 0 ? t.length : point, firstPower = intLen - 1 - lead;
  var kept = all.slice(lead, lead + n).padEnd(n, "0"), next = all.slice(lead + n);
  var up = next.length > 0 && (next[0] >= "5");
  // A tie in a quotient's shown digits (…5000) is only a true tie when nothing was left over: either way 5 rounds up.
  void rest;
  var k = BigInt(kept) + (up ? 1n : 0n), power = firstPower - n + 1;
  if (k.toString().length > n) { k /= 10n; power += 1; }
  return {digits: k.toString(), exponent: power, negative: negative};
}
// The power of ten of a written number's first nonzero digit (0.0450 gives -2, 3867 gives 3).
function leadPower(value) {
  var t = String(value).replace(/^-/, ""), point = t.indexOf("."), all = t.replace(".", "");
  return (point < 0 ? t.length : point) - 1 - all.search(/[1-9]/);
}
function roundDecimals(value, d) {
  var t = String(value), negative = /^-/.test(t);
  t = t.replace(/^-/, "");
  var parts = t.split("."), frac = (parts[1] || "").padEnd(d + 1, "0");
  var kept = BigInt(parts[0] + frac.slice(0, d)), up = frac[d] >= "5";
  return {digits: (kept + (up ? 1n : 0n)).toString(), exponent: -d, negative: negative};
}
// The rounded value as a plain decimal string ("0.0250", "3900") and in E notation ("2.50e-2").
function plainOf(r) {
  var digits = r.digits, e = r.exponent, out;
  if (e >= 0) out = digits + "0".repeat(e);
  else {
    var padded = digits.padStart(-e + 1, "0");
    out = padded.slice(0, e) + "." + padded.slice(e);
  }
  return (r.negative && /[1-9]/.test(out) ? "-" : "") + out;
}
function sciOf(r) {
  var e = r.exponent + r.digits.length - 1;
  return (r.negative ? "-" : "") + r.digits[0] + (r.digits.length > 1 ? "." + r.digits.slice(1) : "") + "e" + e;
}
function sameNumber(a, b) {
  var x = align(dec(a), dec(b));
  return x[0] === x[1];
}

module.exports = {dec: dec, plus: plus, minus: minus, times: times, quotient: quotient, text: text, countSf: countSf,
  roundDigits: roundDigits, leadPower: leadPower, roundDecimals: roundDecimals, plainOf: plainOf, sciOf: sciOf, sameNumber: sameNumber};
