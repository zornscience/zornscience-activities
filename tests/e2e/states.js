// Named page states used by the accessibility and layout tests. Clicks go through element.click() in the page,
// as a tap would, so Playwright's own scrolling never changes what is measured.
"use strict";
var {answerKey} = require("./play");

// Starts one item from the picker (value, dir) and returns helpers that move it through its states.
async function stateRunner(page, slug, value, dir) {
  var key = answerKey(slug);
  await page.evaluate(([v, d]) => window.__zsa.single(v, d), [value, dir]);
  async function answers() {
    var st = await page.evaluate(() => window.__zsa.state());
    var k = slug === "ion-charge-trainer" ? st.heading : (/formula/i.test(st.caption) ? "n2f|" : "f2n|") + st.heading;
    return {st: st, right: key[k][st.step]};
  }
  return {
    wrong: async function () {
      var {st, right} = await answers(), parts = Object.keys(right);
      await page.evaluate(([parts, right, st]) => {
        var z = window.__zsa;
        function wrongIn(p) { return st.parts[p].choices.find((x) => x.value !== String(right[p]) && !x.tried); }
        var target = parts.find(wrongIn);
        z.choose(target, wrongIn(target).value);
        parts.forEach((p) => {
          if (p === target) return;
          var now = z.state();
          if (now.step !== st.step || now.parts[p].choices.some((c) => c.pressed)) return;
          z.choose(p, right[p]);
        });
      }, [parts, right, st]);
    },
    right: async function () {
      var {right} = await answers();
      await page.evaluate((right) => Object.keys(right).forEach((p) => {
        var st = window.__zsa.state();
        if (st.step === null || !st.parts[p]) return;
        var c = st.parts[p].choices.find((x) => x.value === String(right[p]));
        if (!c.pressed) window.__zsa.choose(p, right[p]);
      }), right);
    },
    hint: async function () { await page.evaluate(() => window.__zsa.hint()); },
    show: async function () { await page.evaluate(() => window.__zsa.show()); },
    next: async function () { await page.evaluate(() => window.__zsa.next()); }
  };
}

module.exports = {stateRunner: stateRunner};
