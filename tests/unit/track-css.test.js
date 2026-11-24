// The trainers' progress pips (shared/zsa-track.css and .js) are the question-set practice engine's pips
// (shared/zsa-practice.css and .js): the same shape, states, stripes, ring and motion, with only the accent color
// taken from the page. This test reads both stylesheets and both scripts so the two cannot drift apart.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..", "..");
function read(f) { return fs.readFileSync(path.join(ROOT, f), "utf8"); }
var practice = read("shared/zsa-practice.css"), track = read("shared/zsa-track.css");

// The declarations of the first rule whose selector contains `selector`, as {property: value}, with the page's own
// color variables written as one placeholder so the two families compare by shape, not by color.
function rule(css, selector) {
  var at = css.indexOf(selector);
  assert.ok(at >= 0, "no rule for " + selector);
  var open = css.indexOf("{", at), close = css.indexOf("}", open), out = {};
  css.slice(open + 1, close).split(";").forEach(function (d) {
    var i = d.indexOf(":");
    if (i < 0) return;
    out[d.slice(0, i).trim()] = d.slice(i + 1).trim().replace(/var\(--z(p|sa-track)-[\w-]+\)/g, "COLOR").replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
  });
  return out;
}
function pick(o, keys) { var r = {}; keys.forEach(function (k) { r[k] = o[k]; }); return r; }

test("trainer pips and practice pips have the same shape, fill, ring, stripes and motion", function () {
  var p = ".zsa-practice .zsa-practice-pip", t = ".zsa-track-pip";
  assert.deepEqual(pick(rule(track, t + ", .zsa-track-step {"), ["position", "height", "border-radius", "background", "overflow"]),
    pick(rule(practice, p + " {"), ["position", "height", "border-radius", "background", "overflow"]));
  assert.deepEqual(rule(track, t + "::after"), rule(practice, p + "::after"));
  assert.deepEqual(rule(track, t + '[data-state="current"]'), Object.assign(rule(practice, p + '[data-state="current"]'), {animation: "zsa-track-breathe 1.6s ease-in-out infinite"}));
  assert.match(rule(practice, p + '[data-state="current"]').animation, /^zp-breathe 1\.6s ease-in-out infinite$/);
  assert.deepEqual(rule(track, t + '[data-state="correct"]::after'), rule(practice, p + '[data-state="correct"]::after'));
  assert.deepEqual(rule(track, t + '[data-state="missed"]::after'), rule(practice, p + '[data-state="missed"]::after'));
  assert.deepEqual(pick(rule(track, ".zsa-track-items {"), ["display", "grid-template-columns", "align-items", "gap"]),
    pick(rule(practice, ".zsa-practice .zsa-practice-track {"), ["display", "grid-template-columns", "align-items", "gap"]));
});

test("the trainers' pip colors are the practice engine's, except the accent", function () {
  var root = /--zp-track:(#[0-9a-f]+)/.exec(practice)[1], red = /--zp-red:(#[0-9a-f]+)/.exec(practice)[1];
  assert.match(track, new RegExp("--zsa-track-empty:" + root + ";"));
  assert.match(track, new RegExp("--zsa-track-red:" + red + ";"));
  assert.match(practice, /repeating-linear-gradient\(135deg,var\(--zp-red\) 0 3px,#e0605f 3px 6px\)/);
});

test("with reduced motion both stop the pips' fill, which is a ::after", function () {
  assert.match(practice, /prefers-reduced-motion:reduce\) \{\s*\.zsa-practice \*,\.zsa-practice \*::before,\.zsa-practice \*::after \{animation:none!important; transition:none!important;\}/);
  assert.match(track, /prefers-reduced-motion:reduce\) \{\s*\.zsa-tracked \*::before, \.zsa-tracked \*::after \{animation:none!important;transition:none!important;\}/);
});

test("both scripts give a pip the same states in data-state", function () {
  var ps = read("shared/zsa-practice.js"), ts = read("shared/zsa-track.js");
  assert.match(ps, /setAttribute\("data-state", r \? \(r\.correct \? "correct" : "missed"\) : i === index && !answered \? "current" : ""\)/);
  ["current", "correct", "missed"].forEach(function (state) { assert.ok(ts.indexOf('"' + state + '"') >= 0, "zsa-track.js uses " + state); });
  assert.match(ts, /pip\.setAttribute\("data-state", done \? status\[i\] : i === now\.number - 1 \? "current" : ""\)/);
});
