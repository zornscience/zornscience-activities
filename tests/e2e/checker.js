// Helpers for tests that paste completion codes into the teacher checker (check/): read its results table and
// check some text. Shared by codes.spec.js and the activities' own code tests.
"use strict";
var fs = require("fs");
var {expect} = require("@playwright/test");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function readable(iso) { var p = iso.split("-"); return MONTHS[Number(p[1]) - 1] + " " + Number(p[2]) + ", " + p[0]; }

async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// The checker's results table as text, one object per row keyed by column header.
async function results(page) {
  return page.evaluate(() => {
    var heads = [].map.call(document.querySelectorAll("#zsa-chk-table thead th"), (th) => th.textContent);
    return [].map.call(document.querySelectorAll("#zsa-chk-table tbody tr"), (tr) => {
      var row = {};
      [].forEach.call(tr.children, (cell, i) => {
        var items = cell.querySelectorAll("li");
        row[heads[i]] = items.length ? [].map.call(items, (li) => li.textContent) : cell.textContent;
      });
      return row;
    });
  });
}
async function check(page, text) {
  await page.locator("#zsa-chk-input").fill(text);
  await page.locator("#zsa-chk-check").click();
}

module.exports = {audit: audit, results: results, check: check, readable: readable};
