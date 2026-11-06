// Search engine tags (shared/zsa-seo.js, tools/build-seo.js): every indexed page is registered and written from the
// registry, descriptions fit a search result, bilingual pages carry hreflang and no static canonical, English-only
// pages carry a static one, and sitemap.xml and robots.txt agree with the pages.
"use strict";
var test = require("node:test");
var assert = require("node:assert");
var fs = require("fs");
var path = require("path");
var seo = require("../../shared/zsa-seo.js");
var build = require("../../tools/build-seo.js");
var about = require("../../shared/zsa-about.js");

var ROOT = path.join(__dirname, "..", "..");
function read(folder) { return fs.readFileSync(path.join(ROOT, folder, "index.html"), "utf8"); }

test("the registry covers the landing page, every activity and the checker, and each page is written from it", function () {
  var expected = [""].concat(about.activities, ["check"]).sort();
  assert.deepEqual(Object.keys(seo.pages).sort(), expected);
  Object.keys(seo.pages).forEach(function (folder) {
    var html = read(folder);
    assert.equal(build.build(html, folder), html, (folder || "index.html") + " is up to date (node tools/build-seo.js)");
  });
  assert.equal(fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8"), build.sitemap(), "sitemap.xml is up to date");
});

test("descriptions fit a search result in both languages", function () {
  Object.keys(seo.pages).forEach(function (folder) {
    ["en", "es"].forEach(function (lang) {
      var d = seo.pages[folder][lang];
      if (lang === "es" && !d) return;
      assert.ok(d.length >= 100 && d.length <= 160, folder + " " + lang + " is " + d.length + " characters");
      assert.doesNotMatch(d, /[–—]/, folder + " " + lang);
    });
  });
});

test("bilingual pages have hreflang and no static canonical; English-only pages have a static canonical", function () {
  Object.keys(seo.pages).forEach(function (folder) {
    var html = read(folder), name = folder || "index.html";
    var canonicals = html.match(/<link rel="canonical"[^>]*>/g) || [];
    var alternates = html.match(/<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g) || [];
    // A page with Spanish loads the shared i18n (the landing page through home.js) and is registered with a description.
    var spanish = /zsa-i18n\.js/.test(html);
    if (seo.bilingual(folder)) {
      assert.ok(spanish, name + " has Spanish");
      assert.deepEqual(canonicals, [], name + " has no static canonical");
      assert.deepEqual(alternates, [
        '<link rel="alternate" hreflang="en" href="' + seo.url(folder, "en") + '">',
        '<link rel="alternate" hreflang="es" href="' + seo.url(folder, "es") + '">',
        '<link rel="alternate" hreflang="x-default" href="' + seo.url(folder, "en") + '">'], name);
      assert.match(html, /<script src="(\.\.\/)?shared\/zsa-seo\.js\?v=[\d.]+" defer><\/script>/, name + " loads zsa-seo.js");
    } else {
      assert.deepEqual(canonicals, ['<link rel="canonical" href="' + seo.url(folder, "en") + '">'], name);
      assert.deepEqual(alternates, [], name + " has no hreflang");
    }
  });
});

test("sitemap.xml lists each indexed page once per language, and robots.txt points to it", function () {
  var xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  var locs = (xml.match(/<loc>[^<]+<\/loc>/g) || []).map(function (l) { return l.slice(5, -6); });
  var expected = [];
  Object.keys(seo.pages).forEach(function (folder) {
    expected.push(seo.url(folder, "en"));
    if (seo.bilingual(folder)) expected.push(seo.url(folder, "es"));
  });
  assert.deepEqual(locs, expected);
  assert.equal(new Set(locs).size, locs.length, "no duplicates");
  // Redirects, the lab chooser and the starter template are not listed.
  ["act-science", "ionic-formula-builder", "equilibrium-thermo-lab", "templates"].forEach(function (f) {
    assert.ok(!locs.some(function (l) { return l.indexOf("/" + f + "/") >= 0; }), f);
  });
  var robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
  assert.match(robots, /^Sitemap: https:\/\/activities\.zornscience\.org\/sitemap\.xml$/m);
  assert.match(robots, /^User-agent: \*$/m);
  assert.doesNotMatch(robots, /^Disallow: \/\s*$/m, "the site itself stays crawlable");
});
