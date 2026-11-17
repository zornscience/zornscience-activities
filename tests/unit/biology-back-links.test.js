"use strict";
// The "Back to the lesson" link of each Biology lab must go to a lesson page that links the lab, never the Biology hub
// or an unrelated lesson. Expected lessons come from the live lesson pages on zornscience.org (each embeds its lab).
var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..", "..");
var BIO = "https://zornscience.org/science/biology/";
var HUB = BIO;

// lab folder: [expected lesson path, back link element id]
var expected = {
  "mitosis-lab": ["unit-7-cell-division/mitosis/", "zsa-mt-back"],
  "yeast-fermentation-lab": ["unit-8-photosynthesis-and-respiration/fermentation/", "zsa-fy-back"],
  "leaf-disk-lab": ["unit-8-photosynthesis-and-respiration/rates-of-photosynthesis/", "zsa-ld-back"],
  "population-sampling-lab": ["unit-2-populations/population-sampling/", "zsa-ps-back"],
  // Still wrong on main (back link goes to the hub); reported separately and not fixed here, so they are todo.
  "osmosis-lab": ["unit-6-cells-and-homeostasis/passive-transport/", "zsa-os-back", true],
  "enzyme-lab": ["unit-5-molecules-of-life/enzymes/", "zsa-ez-back", true],
  "fruit-fly-genetics-lab": ["unit-10-heredity/punnett-squares/", "zsa-ff-back", true]
};

Object.keys(expected).forEach(function (lab) {
  var e = expected[lab];
  test(lab + " back link goes to its own lesson, not the hub", {todo: e[2] ? "back link still points to the Biology hub" : false}, function () {
    var html = fs.readFileSync(path.join(ROOT, lab, "index.html"), "utf8");
    var m = html.match(new RegExp('<a[^>]*id="' + e[1] + '"[^>]*href="([^"]+)"'));
    assert.ok(m, lab + " has a back link");
    assert.notEqual(m[1], HUB, lab + " must not link to the hub");
    assert.equal(m[1], BIO + e[0]);
  });
});
