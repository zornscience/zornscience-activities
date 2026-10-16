// Playing through rounds quickly. The answer key comes from the independent reference; the clicking happens in the
// page so hundreds of rounds take seconds.
"use strict";
var ref = require("../support/reference");
var {activities} = require("../support/activities");

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Map from what the strip shows to the right answers for each step.
function answerKey(slug) {
  var cfg = activities[slug], key = {};
  if (slug === "ion-charge-trainer") {
    ref.elements.forEach(function (e) { key[cap(e.name)] = [0, 1, 2, 3].map(function (s) { return cfg.answer({item: e}, s); }); });
  } else {
    ref.compounds.forEach(function (cp) {
      key["n2f|" + cap(cp.name)] = [0, 1].map(function (s) { return cfg.answer({item: cp, dir: "n2f"}, s); });
      key["f2n|" + cp.spoken] = [0, 1].map(function (s) { return cfg.answer({item: cp, dir: "f2n"}, s); });
    });
  }
  return key;
}

// Runs in the page. plan(index) for each item played (0-based, in play order) may return a list of actions per
// step, e.g. {0: ["wrong", "wrong", "show"], 2: ["hint", "wrong"]}; anything else answers correctly.
// Returns one record per item and the final state.
function autoplay(args) {
  var z = window.__zsa, key = args.key, plans = args.plans || {}, out = [], guard = 0;
  function lookup(st) {
    var k = st.caption && /formula|compound/i.test(st.caption) ? (/formula/i.test(st.caption) ? "n2f|" : "f2n|") + st.heading : st.heading;
    var a = key[k];
    if (!a) throw new Error("no answer for " + k);
    return a;
  }
  function wrongValue(st, part, right) {
    var c = st.parts[part].choices.find(function (x) { return x.value !== String(right) && !x.tried; });
    return c ? c.value : null;
  }
  for (;;) {
    if (++guard > 60) throw new Error("round did not finish");
    var st = z.state();
    if (st.finish) break;
    var answers = lookup(st), rec = {heading: st.heading, caption: st.caption, progress: st.progress, steps: []};
    var plan = plans[out.length] || {};
    while (st.step !== null) {
      var s = st.step, right = answers[s], actions = plan[s] || [], log = [];
      actions.forEach(function (act) {
        var parts = Object.keys(right);
        if (act === "hint") z.hint();
        else if (act === "show") z.show();
        else if (act === "wrong") {
          // Wrong in the first part that still has an untried wrong choice, right in every other part not picked.
          var now = z.state(), target = parts.find(function (p) { return wrongValue(now, p, right[p]) !== null; });
          z.choose(target, wrongValue(now, target, right[target]));
          parts.forEach(function (p) {
            if (p === target || z.state().step !== s) return;
            var picked = z.state().parts[p].choices.some(function (c) { return c.pressed; });
            if (!picked) z.choose(p, right[p]);
          });
        }
        log.push(act);
      });
      st = z.state();
      if (st.step === s) {
        Object.keys(right).forEach(function (p) {
          var now = z.state();
          if (now.step !== s) return; // the step already checked itself
          var c = now.parts[p].choices.find(function (x) { return x.value === String(right[p]); });
          if (!c.pressed) z.choose(p, right[p]);
        });
      }
      rec.steps.push(log);
      st = z.state();
    }
    rec.summary = st.summary;
    out.push(rec);
    z.next();
  }
  return {items: out, finish: z.state()};
}

async function play(page, slug, plans) {
  return page.evaluate(autoplay, {key: answerKey(slug), plans: plans || {}});
}

module.exports = {play: play, answerKey: answerKey};
