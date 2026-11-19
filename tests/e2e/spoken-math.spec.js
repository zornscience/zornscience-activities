// Subscripts, charges, powers of ten and arrows in the shared practice engine carry a spoken name, in both languages,
// and the page stays axe-clean with a question showing.
"use strict";
var fs = require("fs");
var {test, expect} = require("./fixtures");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

for (var lang of ["en", "es"]) {
  test("qs scientific notation practice has spoken names for powers of ten, " + lang, async function ({page}) {
    await page.goto("/qs-scientific-notation-practice/?lang=" + lang);
    await page.locator("#zsa-qsn-start").click();
    var names = [];
    for (var i = 0; i < 12 && !names.length; i++) {
      names = await page.locator("#zsa-qsn-play .zsa-math[role=img]").evaluateAll(function (els) { return els.map(function (e) { return e.getAttribute("aria-label"); }); });
      if (!names.length) {
        await page.locator("#zsa-qsn-play input[type=radio], #zsa-qsn-value").first().focus().catch(function () {});
        var skip = page.locator("#zsa-qsn-check");
        if (await skip.isVisible()) { await page.locator("#zsa-qsn-value").fill("1").catch(function () {}); await skip.click().catch(function () {}); }
        var next = page.locator("#zsa-qsn-next");
        if (await next.isVisible()) await next.click();
      }
    }
    expect(names.length).toBeGreaterThan(0);
    names.forEach(function (n) { expect(n).toMatch(lang === "en" ? /to the power of/ : /a la potencia/); expect(n).not.toMatch(/<|>|undefined/); });
    await page.evaluate(AXE);
    var v = await page.evaluate(async function () { var r = await axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"]}}); return r.violations.map(function (x) { return x.id; }); });
    expect(v).toEqual([]);
  });
}
