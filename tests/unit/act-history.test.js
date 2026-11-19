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

// The PDF encoding in the history test needs iconv (UTF-8 to Windows-1252); the database stand-in needs pdo_sqlite.
// Without them the test used to fail deep inside PHP on accented letters and curly quotes, so check up front.
test("the PHP extensions this suite needs are loaded: ctype, iconv, pdo, pdo_sqlite", function () {
  var loaded = execFileSync("php", ["-m"], {encoding: "utf8"}).toLowerCase().split(/\r?\n/);
  var missing = ["ctype", "iconv", "pdo", "pdo_sqlite"].filter(function (m) { return loaded.indexOf(m) < 0; });
  assert.deepEqual(missing, [], "enable these PHP extensions (see TESTING.md, PHP requirements): " + missing.join(", "));
});

test("codes, history, saving, validation, rate limits, allowed sites and cleanup", function () {
  var out = execFileSync("php", [path.join(ROOT, "tests", "php", "act-history-test.php")], {encoding: "utf8"});
  assert.match(out, /^OK \d+/);
});
