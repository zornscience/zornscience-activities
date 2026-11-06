// Writes the search engine tags of every indexed page from shared/zsa-seo.js, and sitemap.xml.
// Run from the repository root:   node tools/build-seo.js
// Check only (used by the tests): node tools/build-seo.js --check
// In each page: the English meta description; then, just after it, between <!-- zsa-seo --> and <!-- /zsa-seo -->,
// the hreflang links and zsa-seo.js (pages with Spanish) or a static canonical (English-only pages). Any other
// canonical tag is removed: on bilingual pages zsa-seo.js sets it, so Spanish keeps its own URL.
// Edit the descriptions in shared/zsa-seo.js, never in the pages. Node only, no dependencies.
"use strict";
var fs = require("fs");
var path = require("path");
var seo = require("../shared/zsa-seo.js");

var ROOT = path.join(__dirname, "..");
var START = "<!-- zsa-seo -->", END = "<!-- /zsa-seo -->";
// The landing page has no zsa-version; its copy of zsa-seo.js is versioned on its own.
var LANDING_VERSION = "1.0.0";

function escape(text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function file(folder) { return path.join(ROOT, folder, "index.html"); }

function tags(folder, version) {
  if (!seo.bilingual(folder)) return '<link rel="canonical" href="' + seo.url(folder, "en") + '">';
  var prefix = folder ? "../" : "";
  return '<link rel="alternate" hreflang="en" href="' + seo.url(folder, "en") + '">' +
    '<link rel="alternate" hreflang="es" href="' + seo.url(folder, "es") + '">' +
    '<link rel="alternate" hreflang="x-default" href="' + seo.url(folder, "en") + '">' +
    '<script src="' + prefix + "shared/zsa-seo.js?v=" + version + '" defer></script>';
}

function build(html, folder) {
  var version = (html.match(/<meta name="zsa-version" content="([\d.]+)">/) || [])[1] || (folder ? null : LANDING_VERSION);
  if (!version) throw new Error(folder + ": no zsa-version");
  var out = html;
  var s = out.indexOf(START);
  if (s >= 0) {
    var e = out.indexOf(END, s);
    if (e < 0) throw new Error(folder + ": unclosed seo block");
    out = out.slice(0, s) + out.slice(e + END.length);
  }
  out = out.replace(/<link rel="canonical" href="[^"]*">\n?/g, "");
  var meta = /<meta name="description" content="[^"]*">/;
  if (!meta.test(out)) throw new Error(folder + ": no meta description");
  return out.replace(meta, '<meta name="description" content="' + escape(seo.pages[folder].en) + '">' + START + tags(folder, version) + END);
}

// Every indexed page; a bilingual page is listed in both languages, each with its alternates.
function sitemap() {
  var urls = [];
  Object.keys(seo.pages).forEach(function (folder) {
    var langs = seo.bilingual(folder) ? ["en", "es"] : ["en"];
    var alternates = seo.bilingual(folder) ? [["en", "en"], ["es", "es"], ["x-default", "en"]].map(function (a) {
      return '    <xhtml:link rel="alternate" hreflang="' + a[0] + '" href="' + seo.url(folder, a[1]) + '"/>\n';
    }).join("") : "";
    langs.forEach(function (lang) { urls.push("  <url>\n    <loc>" + seo.url(folder, lang) + "</loc>\n" + alternates + "  </url>\n"); });
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls.join("") + "</urlset>\n";
}

module.exports = {build: build, sitemap: sitemap};

if (require.main === module) {
  var check = process.argv.indexOf("--check") >= 0, stale = [];
  Object.keys(seo.pages).forEach(function (folder) {
    var html = fs.readFileSync(file(folder), "utf8"), next = build(html, folder);
    if (next === html) return;
    if (check) stale.push(folder || "index.html");
    else { fs.writeFileSync(file(folder), next); console.log("updated " + (folder || "index.html")); }
  });
  var map = path.join(ROOT, "sitemap.xml"), xml = sitemap();
  if (!fs.existsSync(map) || fs.readFileSync(map, "utf8") !== xml) {
    if (check) stale.push("sitemap.xml");
    else { fs.writeFileSync(map, xml); console.log("updated sitemap.xml"); }
  }
  if (stale.length) { console.error("Out of date, run node tools/build-seo.js: " + stale.join(", ")); process.exit(1); }
}
