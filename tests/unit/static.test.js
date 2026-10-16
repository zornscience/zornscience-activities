// Static checks on the published files: the house rules from the READMEs (no HTML injection, storage, network
// calls or globals; no inline scripts or styles; one CSP; no en or em dashes), version numbers that agree, and a
// generated data file that matches its build script.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.join(__dirname, "..", "..");
var SKIP = ["node_modules", ".git", "tests", ".github", "test-results", "playwright-report"];
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(function (e) {
    if (SKIP.indexOf(e.name) >= 0) return [];
    var p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
var files = walk(ROOT).map(function (f) { return path.relative(ROOT, f); });
// Files the pages load (tools/ scripts run in Node only).
var siteJs = files.filter(function (f) { return f.endsWith(".js") && f.indexOf("tools" + path.sep) < 0 && !/^(playwright\.config)/.test(f); });
var pages = files.filter(function (f) { return f.endsWith(".html"); });
// Every page with a version (the activities and the starter template), by folder.
var activities = pages.filter(function (f) { return /<meta name="zsa-version"/.test(fs.readFileSync(path.join(ROOT, f), "utf8")); }).map(path.dirname);
function read(f) { return fs.readFileSync(path.join(ROOT, f), "utf8"); }

test("site JavaScript parses and follows the house rules", function () {
  assert.ok(siteJs.length >= 5, "found " + siteJs.join(", "));
  var forbidden = [/\.innerHTML\b/, /\.outerHTML\s*=/, /insertAdjacentHTML/, /document\.write/, /\beval\s*\(/, /new Function\b/,
    /localStorage|sessionStorage|indexedDB/, /document\.cookie/, /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/,
    /\bwindow\.\w+\s*=[^=]/, /\bglobalThis\b/, /\bsetAttribute\(\s*["']style["']/, /\.style\.\w+\s*=/];
  siteJs.forEach(function (f) {
    var src = read(f);
    new vm.Script(src, {filename: f}); // syntax check
    assert.match(src.replace(/^(\/\/[^\n]*\n)*/, ""), /^\(function \(\) \{\n {2}"use strict";/, f + " is a strict IIFE");
    forbidden.forEach(function (re) { assert.doesNotMatch(src, re, f + " uses " + re); });
  });
});

test("pages have one CSP, no inline scripts or styles, and only the expected outside links", function () {
  var csp = null;
  pages.forEach(function (f) {
    var html = read(f);
    var m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
    assert.ok(m, f + " CSP");
    if (csp === null) csp = m[1];
    assert.equal(m[1], csp, f + " CSP matches the others");
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/, f + " inline script");
    assert.doesNotMatch(html, /\sstyle=|<style/, f + " inline style");
    assert.doesNotMatch(html, /\son[a-z]+=/, f + " inline event handler");
  });
  assert.equal(csp, "default-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'");
  var allowed = /^https:\/\/((activities\.)?zornscience\.org(\/[\w\-\/]*)?|creativecommons\.org\/licenses\/by-nc-sa\/4\.0\/)$/;
  pages.concat(siteJs).forEach(function (f) {
    (read(f).match(/https?:\/\/[^\s"'<>)]+/g) || []).forEach(function (url) { assert.match(url, allowed, f + " links to " + url); });
  });
});

test("no en or em dashes in published text", function () {
  files.filter(function (f) { return /\.(html|js|css|md)$/.test(f); }).forEach(function (f) {
    assert.doesNotMatch(read(f), /[–—]/, f);
  });
});

test("each activity's version agrees across its page, assets and docs", function () {
  assert.ok(activities.length >= 3, activities.join());
  activities.forEach(function (a) {
    var html = read(path.join(a, "index.html"));
    var version = html.match(/<meta name="zsa-version" content="([\d.]+)">/)[1];
    var queries = html.match(/\?v=[\d.]+/g);
    assert.ok(queries.length >= 4, a + " assets");
    queries.forEach(function (q) { assert.equal(q, "?v=" + version, a + " " + q); });
    [path.join(a, "README.md"), path.join(a, "TESTING.md")].forEach(function (doc) {
      if (fs.existsSync(path.join(ROOT, doc))) assert.match(read(doc), new RegExp("^Version: " + version.replace(/\./g, "\\.") + "$", "m"), doc);
    });
  });
});

test("Ionic Formula Builder data.js is exactly what tools/build-data.js writes", function () {
  var written = null;
  var script = read("ionic-formula-builder/tools/build-data.js");
  var fakeFs = {writeFileSync: function (file, out) { written = out; }};
  vm.runInNewContext(script, {require: function (m) { return m === "fs" ? fakeFs : require(m); }, __dirname: path.join(ROOT, "ionic-formula-builder", "tools"), console: console});
  assert.equal(written, read("ionic-formula-builder/data.js"));
});
