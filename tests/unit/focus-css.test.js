// Keyboard focus must always be visible: no stylesheet may remove the outline (outline: none, outline: 0) unless the rule
// is listed here together with what shows focus instead. A new removal fails this test until its replacement is named,
// and tests/e2e/labs-a11y.spec.js then checks in a browser that focus really looks different on every Tab stop of every lab.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..", "..");
var SKIP = ["node_modules", ".git", "tests", ".github", "test-results", "playwright-report"];
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(function (e) {
    if (SKIP.indexOf(e.name) >= 0) return [];
    var p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

// "file | selector" of every rule that removes the outline, with the replacement that shows focus.
var ALLOWED = {
  "act/act.css | .zsa-act :focus": "ACT draws its own focus styles for each control (act.css, .zsa-act ...:focus-visible rules)",
  "act/act.css | .zsa-act [tabindex=\"-1\"]:focus-visible": "script-focused headings and panels, not controls",
  "act/act.css | .zsa-act-main:focus": "the main landmark receives script focus only",
  "act/act.css | .zsa-act-reader-handle": "decorative drag handle; its keyboard control has its own ring",
  "circuit-builder/lab.css | .zsa-cb-spot": "the shared ring from zsa-base.css, plus the board's own highlight rectangle",
  "gas-lab/gas-lab.css | .zsa-gl-pill input:focus-visible": "the pill (label) takes the ring through :has(input:focus-visible)",
  "home.css | .zsa-home-card h3 a:focus-visible": "the whole card takes the ring through :focus-within",
  "hookes-law-lab/lab.css | #hanger:focus": "#hanger:focus-visible > rect gets a thick yellow stroke (SVG shapes do not paint outlines in every browser)",
  "periodic-table/periodic-table.css | .zsa-pt-mode input:focus-visible, .zsa-pt-check input:focus-visible": "the label takes the ring through :has(input:focus-visible)",
  "snells-law-lab/lab.css | #laser,#protractor": "#laser:focus-visible and #protractor:focus-visible stroke their shapes white",
  "wordpress/zornscience-tutor/assets/chat.css | .zst-chat .zst-input:focus": "the same rule gives the text box a blue border and a blue glow (border-color and box-shadow) while it has focus",
  "standing-waves-lab/lab.css | #cursors [role=slider]": "the .focus-ring rectangles inside each cursor (white and dark) show on :focus-visible"
};

function removals() {
  var found = [];
  walk(ROOT).filter(function (f) { return f.endsWith(".css"); }).forEach(function (file) {
    var css = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    var rule = /([^{}]*)\{([^{}]*)\}/g, m;
    while ((m = rule.exec(css))) {
      if (/outline\s*:\s*(none|0)(?![\d.])|outline-style\s*:\s*none/.test(m[2])) {
        found.push(path.relative(ROOT, file).split(path.sep).join("/") + " | " + m[1].trim().replace(/\s+/g, " ").slice(-110));
      }
    }
  });
  return found;
}

test("no stylesheet removes the focus outline without a listed replacement", function () {
  var unlisted = removals().filter(function (r) { return !Object.prototype.hasOwnProperty.call(ALLOWED, r); });
  assert.deepEqual(unlisted, [], "outline removed without a replacement listed in tests/unit/focus-css.test.js");
});

test("every listed outline removal still exists (the list stays honest)", function () {
  var present = removals();
  Object.keys(ALLOWED).forEach(function (key) { assert.ok(present.indexOf(key) >= 0, "no longer in the CSS, remove it from ALLOWED: " + key); });
});

test("the shared lab stylesheet gives every kind of focusable element a visible ring", function () {
  var css = fs.readFileSync(path.join(ROOT, "shared", "zsa-lab-a11y.css"), "utf8");
  ["summary", "textarea", "[role=\"slider\"]", "[role=\"button\"]", "[role=\"radio\"]", "[role=\"tab\"]", "[tabindex]"].forEach(function (sel) {
    assert.ok(css.indexOf(sel) >= 0, "zsa-lab-a11y.css must style :focus-visible for " + sel);
  });
  assert.match(css, /:focus-visible\s*\{[^}]*outline:var\(--zsa-focus-ring\)/);
  assert.match(css, /forced-colors:\s*active/, "high contrast mode keeps a focus ring");
});

test("every virtual lab loads the shared lab stylesheet, after zsa-base.css and with the lab's version", function () {
  var labs = fs.readdirSync(ROOT).filter(function (d) {
    return fs.existsSync(path.join(ROOT, d, "index.html")) && fs.existsSync(path.join(ROOT, d, "lab.js"));
  }).concat(["gas-lab", "virtual-lab-graphing", "circuit-builder"]);
  assert.ok(labs.length >= 30);
  labs.forEach(function (lab) {
    var html = fs.readFileSync(path.join(ROOT, lab, "index.html"), "utf8");
    var version = html.match(/<meta name="zsa-version" content="([\d.]+)">/)[1];
    var base = html.indexOf("../shared/zsa-base.css?v=" + version), mine = html.indexOf("../shared/zsa-lab-a11y.css?v=" + version);
    assert.ok(base >= 0 && mine > base, lab + " must load zsa-lab-a11y.css after zsa-base.css");
  });
});
