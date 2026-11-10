// An independent reference for the trigonometry-based Quantitative Skills practice tests (Trigonometry Basics and
// Vectors). It does not use shared/zsa-practice-model.js or the activities' code: values come from Math in the test,
// and rounding to 2 significant figures goes digit by digit on a fixed decimal string (tests/support/qs-reference.js).
// A tie check makes sure floating point could not decide a rounding.
"use strict";
const REF = require("./qs-reference.js");

const RAD = Math.PI / 180;
const sin = t => Math.sin(t * RAD), cos = t => Math.cos(t * RAD), tan = t => Math.tan(t * RAD);
const asin = x => Math.asin(x) / RAD, acos = x => Math.acos(x) / RAD, atan = x => Math.atan(x) / RAD;

// The decimal text of x with 15 places, for digit rounding (x is a few thousand at most).
function fixed(x) { return x.toFixed(15); }
// x rounded to 2 significant figures, as a decimal string ("5.7", "0.42", "-0.53").
function two(x) { return REF.plainOf(REF.roundDigits(fixed(x), 2)); }
function twoSci(x) { return REF.sciOf(REF.roundDigits(fixed(x), 2)); }
// True when nudging x by one part in a billion either way gives the same 2-figure rounding: no tie is near.
function safe(x) { return two(x * (1 + 1e-9)) === two(x * (1 - 1e-9)); }
// The 2-figure text shows exactly 2 significant figures (no zeros at the end of a whole number such as 40 or 120).
function clear(text) { return REF.countSf(text) === 2; }

module.exports = {RAD, sin, cos, tan, asin, acos, atan, two, twoSci, safe, clear};
