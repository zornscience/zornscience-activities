// Writes the "About this activity" section (intro and related lessons) into each activity page from the
// registry in shared/zsa-about.js, and makes sure the page loads zsa-about.css and zsa-about.js.
// Run from the repository root:   node tools/build-about.js
// Check only (used by the tests): node tools/build-about.js --check
// Edit the words and links in shared/zsa-about.js, never in the pages. Node only, no dependencies.
"use strict";
var fs = require("fs");
var path = require("path");
var registry = require("../shared/zsa-about.js");

var ROOT = path.join(__dirname, "..");
var START = "<!-- zsa-about -->", END = "<!-- /zsa-about -->";

function escape(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function section(slug) {
  var a = registry.about(slug, "en");
  var items = a.lessons.map(function (l) {
    return '<li data-zsa-lesson="' + l.key + '"><a href="' + l.href + '">' + escape(l.title) + '</a><span data-zsa-lesson-course>' + escape(l.course) + "</span></li>";
  }).join("");
  var html = '<section class="zsa-about" data-zsa-about="' + slug + '" data-zsa-chrome aria-labelledby="zsa-about-heading">' +
    '<h2 id="zsa-about-heading" data-zsa-about-heading>' + escape(a.heading) + "</h2>" +
    "<p data-zsa-about-intro>" + escape(a.intro) + "</p>" +
    '<p class="zsa-about-label" id="zsa-about-lessons" data-zsa-about-lessons-heading>' + escape(a.lessonsHeading) + "</p>" +
    '<ul aria-labelledby="zsa-about-lessons">' + items + "</ul></section>";
  return START + (a.wrap ? '<div class="' + a.wrap + '">' + html + "</div>" : html) + END;
}

// The section goes just above the page's last footer, or at the end of <main> on pages without one.
function build(html, slug) {
  var version = (html.match(/<meta name="zsa-version" content="([\d.]+)">/) || [])[1];
  if (!version) throw new Error(slug + ": no zsa-version");
  var out = html;
  var s = out.indexOf(START);
  if (s >= 0) {
    var e = out.indexOf(END, s);
    if (e < 0) throw new Error(slug + ": unclosed about section");
    out = out.slice(0, s) + out.slice(e + END.length);
  }
  var at = out.lastIndexOf("<footer");
  if (at < 0) at = out.lastIndexOf("</main>");
  if (at < 0) throw new Error(slug + ": no footer or </main>");
  out = out.slice(0, at) + section(slug) + out.slice(at);
  // Assets: one stylesheet and one deferred script, with the page's version.
  out = out.replace(/<link rel="stylesheet" href="\.\.\/shared\/zsa-about\.css\?v=[\d.]+">/g, "")
    .replace(/<script src="\.\.\/shared\/zsa-about\.js\?v=[\d.]+" defer><\/script>/g, "");
  var assets = '<link rel="stylesheet" href="../shared/zsa-about.css?v=' + version + '"><script src="../shared/zsa-about.js?v=' + version + '" defer></script>';
  var head = out.indexOf("</head>");
  if (head < 0) throw new Error(slug + ": no </head>");
  return out.slice(0, head) + assets + out.slice(head);
}

module.exports = {build: build, section: section};

if (require.main === module) {
  var check = process.argv.indexOf("--check") >= 0, stale = [];
  registry.activities.forEach(function (slug) {
    var file = path.join(ROOT, slug, "index.html");
    var html = fs.readFileSync(file, "utf8"), next = build(html, slug);
    if (next === html) return;
    if (check) stale.push(slug);
    else { fs.writeFileSync(file, next); console.log("updated " + slug); }
  });
  if (stale.length) { console.error("Out of date, run node tools/build-about.js: " + stale.join(", ")); process.exit(1); }
}
