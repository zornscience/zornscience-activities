// Writes the search engine tags into every page's head from tools/seo-pages.js, and builds sitemap.xml and
// robots.txt at the repository root.
//   Head of each page: the meta description, a canonical link to the clean address (no state, from= or embed=
//   parameters; GitHub Pages also serves /index.html copies, which this covers), and, for pages with Mexican
//   Spanish, hreflang links for en, es (?lang=es) and x-default. The Spanish description rides on the meta tag as
//   data-zsa-es; shared/zsa-i18n.js swaps it in, and points the canonical link at ?lang=es, when the page is Spanish.
//   sitemap.xml: every listed page (both languages), each with its hreflang alternates.
// Run from the repository root:   node tools/build-seo.js
// Check only (used by the tests): node tools/build-seo.js --check
// Node only, no dependencies.
"use strict";
var fs = require("fs");
var path = require("path");
var pages = require("./seo-pages.js");

var ROOT = path.join(__dirname, "..");
var ORIGIN = "https://activities.zornscience.org";

function attr(text) {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function address(slug) { return ORIGIN + "/" + (slug ? slug + "/" : ""); }
function file(slug) { return path.join(ROOT, slug, "index.html"); }

function tags(slug) {
  var p = pages[slug], url = address(slug);
  var out = ['<meta name="description" content="' + attr(p.en) + '"' + (p.es ? ' data-zsa-es="' + attr(p.es) + '"' : "") + ">",
    '<link rel="canonical" href="' + url + '">'];
  if (p.es) out.push('<link rel="alternate" hreflang="en" href="' + url + '">',
    '<link rel="alternate" hreflang="es" href="' + url + '?lang=es">',
    '<link rel="alternate" hreflang="x-default" href="' + url + '">');
  return out;
}

// Old tags come out wherever they are; the new ones go right after <title>, one per line when the head is written
// one tag per line (the landing page) and run together otherwise.
function build(html, slug) {
  var out = html.replace(/<meta name="description"[^>]*>\n?/g, "")
    .replace(/<link rel="canonical"[^>]*>\n?/g, "")
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/g, "");
  var at = out.indexOf("</title>");
  if (at < 0) throw new Error((slug || "landing page") + ": no <title>");
  at += "</title>".length;
  var multiline = out[at] === "\n";
  var block = multiline ? "\n" + tags(slug).join("\n") : tags(slug).join("");
  return out.slice(0, at) + block + out.slice(at);
}

function sitemap() {
  var urls = [];
  Object.keys(pages).forEach(function (slug) {
    var p = pages[slug];
    if (p.sitemap === false) return;
    var url = address(slug);
    var versions = p.es ? [url, url + "?lang=es"] : [url];
    versions.forEach(function (loc) {
      var lines = ["  <url>", "    <loc>" + attr(loc) + "</loc>"];
      if (p.es) {
        lines.push('    <xhtml:link rel="alternate" hreflang="en" href="' + attr(url) + '"/>',
          '    <xhtml:link rel="alternate" hreflang="es" href="' + attr(url + "?lang=es") + '"/>',
          '    <xhtml:link rel="alternate" hreflang="x-default" href="' + attr(url) + '"/>');
      }
      lines.push("  </url>");
      urls.push(lines.join("\n"));
    });
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join("\n") + "\n</urlset>\n";
}

// Crawlers may fetch everything the pages load (shared/ scripts, styles and fonts); development folders are off limits.
function robots() {
  return ["User-agent: *", "Disallow: /tests/", "Disallow: /templates/", "Disallow: /tools/", "Disallow: /wordpress/", "",
    "Sitemap: " + ORIGIN + "/sitemap.xml", ""].join("\n");
}

module.exports = {build: build, tags: tags, sitemap: sitemap, robots: robots, address: address};

if (require.main === module) {
  var check = process.argv.indexOf("--check") >= 0, stale = [];
  var outputs = Object.keys(pages).map(function (slug) {
    var f = file(slug);
    return [f, build(fs.readFileSync(f, "utf8"), slug)];
  });
  outputs.push([path.join(ROOT, "sitemap.xml"), sitemap()], [path.join(ROOT, "robots.txt"), robots()]);
  outputs.forEach(function (o) {
    var current = fs.existsSync(o[0]) ? fs.readFileSync(o[0], "utf8") : null;
    if (current === o[1]) return;
    stale.push(path.relative(ROOT, o[0]));
    if (!check) fs.writeFileSync(o[0], o[1]);
  });
  if (check && stale.length) { console.error("Out of date (run node tools/build-seo.js): " + stale.join(", ")); process.exit(1); }
  console.log(check ? "Search engine tags, sitemap.xml and robots.txt are up to date." : "Updated " + stale.length + " files.");
}
