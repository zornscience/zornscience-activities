// The ACT Practice History WordPress plugin (wordpress/zornscience-act-history/): PHP syntax, and its behavior
// against a SQLite stand-in for the WordPress database (tests/php/act-history-test.php).
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var path = require("path");
var {execFileSync} = require("child_process");

var ROOT = path.join(__dirname, "..", "..");
var PLUGIN = path.join(ROOT, "wordpress", "zornscience-act-history");

test("the plugin's PHP files have no syntax errors", function () {
  ["zornscience-act-history.php", "uninstall.php"].forEach(function (f) {
    var out = execFileSync("php", ["-l", path.join(PLUGIN, f)], {encoding: "utf8"});
    assert.match(out, /No syntax errors/, f);
  });
});

test("codes, history, saving, validation, rate limits, allowed sites and cleanup", function () {
  var out = execFileSync("php", [path.join(ROOT, "tests", "php", "act-history-test.php")], {encoding: "utf8"});
  assert.match(out, /^OK \d+/);
});
