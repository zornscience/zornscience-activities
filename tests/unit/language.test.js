// The ZornScience Language WordPress plugin (wordpress/zornscience-language/): PHP syntax, and its behavior with
// stand-ins for WordPress (tests/php/language-test.php) on a Spanish lesson, English lessons with and without a
// Spanish twin, and the front page.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var path = require("path");
var {execFileSync} = require("child_process");

var ROOT = path.join(__dirname, "..", "..");
var PLUGIN = path.join(ROOT, "wordpress", "zornscience-language");
var SCRIPT = path.join(ROOT, "tests", "php", "language-test.php");

test("the plugin's PHP has no syntax errors", function () {
  var out = execFileSync("php", ["-l", path.join(PLUGIN, "zornscience-language.php")], {encoding: "utf8"});
  assert.match(out, /No syntax errors/);
});

[
  ["a Spanish lesson: toggle, links, fallbacks, interface text, label, sidebar, lang and hreflang", []],
  ["an English lesson with a published Spanish twin", ["500"]],
  ["an English lesson without a Spanish twin", ["502"]],
  ["the front page", ["7"]]
].forEach(function (c) {
  test(c[0], function () {
    var out = execFileSync("php", [SCRIPT].concat(c[1]), {encoding: "utf8"});
    assert.match(out, /^OK \d+/);
  });
});
