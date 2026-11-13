// Search engine tags, sitemap.xml and robots.txt: built from tools/seo-pages.js by tools/build-seo.js.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var seo = require("../../tools/build-seo.js");
var pages = require("../../tools/seo-pages.js");

var ROOT = path.join(__dirname, "..", "..");
function read(f) { return fs.readFileSync(path.join(ROOT, f), "utf8"); }
function page(slug) { return read(path.join(slug, "index.html")); }
// Folders with a page that search engines should not see as their own page: redirects (canonical to the target)
// and the starter template (not published).
var REDIRECTS = ["act-science", "ionic-formula-builder"];
var folders = fs.readdirSync(ROOT, {withFileTypes: true}).filter(function (e) {
  return e.isDirectory() && !/^(node_modules|templates|tests|test-results|\.)/.test(e.name) && fs.existsSync(path.join(ROOT, e.name, "index.html"));
}).map(function (e) { return e.name; });

test("every published page has an entry, and the pages, sitemap.xml and robots.txt are up to date", function () {
  folders.forEach(function (slug) {
    if (REDIRECTS.indexOf(slug) >= 0) assert.ok(!pages[slug], slug + " is a redirect");
    else assert.ok(pages[slug], slug + " needs an entry in tools/seo-pages.js");
  });
  Object.keys(pages).forEach(function (slug) {
    assert.ok(slug === "" || folders.indexOf(slug) >= 0, slug + " has no page");
    assert.equal(page(slug), seo.build(page(slug), slug), slug + " (run node tools/build-seo.js)");
  });
  assert.equal(read("sitemap.xml"), seo.sitemap(), "sitemap.xml (run node tools/build-seo.js)");
  assert.equal(read("robots.txt"), seo.robots(), "robots.txt (run node tools/build-seo.js)");
});

test("descriptions are 110 to 160 characters, unique, and Spanish exactly where the page has Spanish", function () {
  var seen = {};
  Object.keys(pages).forEach(function (slug) {
    var p = pages[slug];
    // A page whose Spanish is written but not yet proofread (spanishPending) stays English only in search results.
    var spanish = /zsa-i18n\.js/.test(page(slug)) && !p.spanishPending;
    assert.equal(!!p.es, spanish, slug + (spanish ? " has Spanish, so it needs es" : " is English only, so es is null"));
    ["en", "es"].forEach(function (lang) {
      if (!p[lang]) return;
      assert.ok(p[lang].length >= 110 && p[lang].length <= 160, slug + " " + lang + " is " + p[lang].length + " characters");
      assert.ok(!seen[p[lang]], slug + " " + lang + " repeats " + seen[p[lang]]);
      seen[p[lang]] = slug;
    });
  });
});

test("each page has one description and one canonical link to its clean address, plus hreflang when it has Spanish", function () {
  Object.keys(pages).forEach(function (slug) {
    var html = page(slug), url = seo.address(slug);
    assert.equal((html.match(/<meta name="description"/g) || []).length, 1, slug + " descriptions");
    assert.deepEqual(html.match(/<link rel="canonical" href="([^"]+)">/g), ['<link rel="canonical" href="' + url + '">'], slug + " canonical");
    var alternates = (html.match(/<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g) || []).join("\n");
    if (pages[slug].es) assert.equal(alternates, ['<link rel="alternate" hreflang="en" href="' + url + '">',
      '<link rel="alternate" hreflang="es" href="' + url + '?lang=es">', '<link rel="alternate" hreflang="x-default" href="' + url + '">'].join("\n"), slug);
    else assert.equal(alternates, "", slug + " is English only");
    // The tags sit in the head, before any script runs.
    assert.ok(html.indexOf('rel="canonical"') < html.indexOf("</head>"), slug + " canonical in the head");
  });
  // Redirects keep pointing search engines at the page they send visitors to.
  assert.match(page("act-science"), /<link rel="canonical" href="https:\/\/activities\.zornscience\.org\/act\/">/);
  assert.match(page("ionic-formula-builder"), /<link rel="canonical" href="https:\/\/activities\.zornscience\.org\/ionic-reactions\/">/);
});

test("the sitemap lists every page on the landing page, in each language, and nothing else", function () {
  var xml = read("sitemap.xml");
  var locs = (xml.match(/<loc>[^<]+<\/loc>/g) || []).map(function (l) { return l.slice(5, -6); });
  assert.equal(new Set(locs).size, locs.length, "no duplicates");
  var landing = read("index.html");
  var linked = (landing.match(/href="[\w-]+\/"/g) || []).map(function (h) { return h.slice(6, -2); });
  var expected = [""].concat(linked);
  expected.forEach(function (slug) {
    var url = seo.address(slug);
    assert.ok(locs.indexOf(url) >= 0, url);
    if (pages[slug].es) assert.ok(locs.indexOf(url + "?lang=es") >= 0, url + "?lang=es");
    else assert.ok(locs.indexOf(url + "?lang=es") < 0, url + " has no Spanish");
  });
  locs.forEach(function (loc) {
    var slug = loc.replace("https://activities.zornscience.org/", "").replace(/\/?(\?lang=es)?$/, "");
    assert.ok(expected.indexOf(slug) >= 0, loc + " is not on the landing page");
  });
  assert.ok(locs.indexOf(seo.address("equilibrium-thermo-lab")) < 0, "the chooser stays out of the sitemap");
  assert.match(read("robots.txt"), /^Sitemap: https:\/\/activities\.zornscience\.org\/sitemap\.xml$/m);
  assert.doesNotMatch(read("robots.txt"), /Disallow: \/(shared|$)/m, "crawlers can load the shared scripts and styles");
});

test("the Spanish glossary is not empty", function () {
  var terms = read("SPANISH_TERMS.md");
  assert.ok(terms.split("\n").length > 2000, "SPANISH_TERMS.md has " + terms.split("\n").length + " lines");
  ["## Solutions Lab", "## Equilibrium Constant Lab", "## AP Chemistry Unit 7 Practice", "## About this activity"].forEach(function (h) {
    assert.ok(terms.indexOf(h) >= 0, h);
  });
});
