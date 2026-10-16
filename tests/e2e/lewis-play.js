// Helpers for the Lewis Structure and VSEPR Builder tests. Answers come from tests/support/lewis-reference.js; data.js
// is read only to map what the strip shows (the item's name) to an item and its outer-atom order on screen.
"use strict";
var ref = require("../support/lewis-reference");
var {loadData} = require("../support/load-data");
var {install, activities} = require("../support/activities");

var data = loadData("lewis-vsepr/data.js");
var IDS = activities["lewis-vsepr"].ids;
function item(id) { return data.items.find(function (x) { return x.id === id; }); }
function byName(name) { return data.items.find(function (x) { return x.name === name; }); }
function refFor(it) { var r = ref.items.find(function (x) { return x.id === it.id; }); return Object.assign({}, r, {outer: it.outer}); }
function accepted(it, ap) { var r = refFor(it); return ap || r.ap ? ref.acceptedAp(r) : ref.acceptedStd(r); }
// The right answer to every step of an item.
function answers(it, ap) {
  var r = refFor(it), out = {total: r.total, center: r.center, build: accepted(it, ap)[0]};
  if (it.fc) {
    var scores = it.fc.cands.map(function (f) { return ref.score(r, {c: f[0], o: f.slice(1)}); });
    out.fc = scores.reduce(function (b, s, i) { return s[0] < scores[b][0] || (s[0] === scores[b][0] && s[1] < scores[b][1]) ? i : b; }, 0);
  }
  if (r.domains) {
    out.domains = r.domains; out.eg = r.eg; out.mg = r.mg;
    out.angle = Object.keys(data.ui.angles).find(function (k) { return data.ui.angles[k] === r.angle; });
  }
  if (r.polar !== null) { out.claim = r.polar ? "polar" : "nonpolar"; out.reason = ref.reasonsFor(r)[0]; }
  return out;
}
function kindsOf(it, ap) {
  var r = refFor(it), k = ["total"];
  if (it.outer.length > 1 && new Set([r.center].concat(r.outer)).size > 1) k.push("center");
  k.push("build");
  if (ap && it.fc) k.push("fc");
  if (r.domains) k.push("domains", "shape");
  if (r.polar !== null) k.push("polarity");
  return k;
}
// A structure with every electron placed that is not accepted.
function wrongBuild(it, ap) {
  var r = refFor(it);
  return ref.enumerate(r).find(function (st) { return ref.buildKey(r, st, ap) !== null; });
}
// Every drawing of a structure: identical outer atoms in any order.
function arrangementsOf(it, st) {
  var seen = {}, out = [], n = st.o.length;
  (function perm(order, rest) {
    if (!rest.length) {
      if (!order.every(function (j, i) { return it.outer[j] === it.outer[i]; })) return;
      var o = order.map(function (j) { return st.o[j]; }), k = JSON.stringify(o);
      if (!seen[k]) { seen[k] = 1; out.push({c: st.c, o: o}); }
      return;
    }
    rest.forEach(function (j, k) { perm(order.concat([j]), rest.slice(0, k).concat(rest.slice(k + 1))); });
  })([], Array.from({length: n}, function (x, i) { return i; }));
  return out;
}

// Installed in the page: drives the activity through roles, ARIA labels, ids and data-zsa-part only.
function lvInstall() {
  function q(sel, el) { return (el || document).querySelector(sel); }
  function qa(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }
  function field() { return q("#zsa-lv-work > fieldset"); }
  function kind() {
    var f = field();
    if (!f) return null;
    var parts = qa("[data-zsa-part]", f).map(function (g) { return g.getAttribute("data-zsa-part"); });
    if (parts.indexOf("lv-build") >= 0) return "build";
    return {total: "total", center: "center", fc: "fc", domains: "domains", mg: "shape", claim: "polarity"}[parts[0]];
  }
  function atoms() { return qa('[role="group"][aria-label^="Atoms in the structure"] button'); }
  function group(prefix) { return q('[role="group"][aria-label^="' + prefix + '"]'); }
  function choose(part, value) {
    var b = q('[data-zsa-part="' + part + '"] button[value="' + String(value) + '"]', field());
    if (!b) throw new Error("no choice " + part + "=" + value);
    if (b.getAttribute("aria-pressed") !== "true") b.click();
  }
  function setLP(i, n) { atoms()[i].click(); group("Lone pairs on").querySelector('button[value="' + n + '"]').click(); }
  function setBond(i, n) { atoms()[i].click(); group("Bond between").querySelector('button[value="' + n + '"]').click(); }
  // Lone pairs first: no check can fire while a bond is not set. The last bond set checks the structure.
  function build(st) {
    var n = st.o.length;
    st.o.forEach(function (p, i) { setLP(i, p[1]); });
    setLP(n, st.c);
    st.o.forEach(function (p, i) { if (kind() === "build") setBond(i, p[0]); });
  }
  function answer(ans) {
    var k = kind();
    if (k === "total") choose("total", ans.total);
    else if (k === "center") choose("center", ans.center);
    else if (k === "build") build(ans.build);
    else if (k === "fc") choose("fc", ans.fc);
    else if (k === "domains") { choose("domains", ans.domains); if (kind() === "domains") choose("eg", ans.eg); }
    else if (k === "shape") { choose("mg", ans.mg); if (kind() === "shape") choose("angle", ans.angle); }
    else if (k === "polarity") { choose("claim", ans.claim); if (kind() === "polarity") choose("reason", ans.reason); }
  }
  function single(id, ap) {
    q("#zsa-lv-ap").checked = !!ap;
    q("#zsa-lv-select").value = id;
    q("#zsa-lv-pick").click();
  }
  function buildState() {
    var box = q('[data-zsa-part="lv-build"]', field());
    if (!box) return null;
    return {status: q("[aria-live]", box).textContent, title: box.querySelector("p").textContent,
      atoms: atoms().map(function (b) { return {name: b.textContent.replace(/\d+(\/\d+)?$/, "").trim(), pressed: b.getAttribute("aria-pressed") === "true"}; })};
  }
  function stripStructure() {
    var s = q("#zsa-lv-strip");
    var p = qa("p", s).find(function (x) { return /^Lewis structure:/.test(x.textContent); });
    return p && p.getClientRects().length ? p.textContent : (p && p.closest("[hidden]") ? null : p ? p.textContent : null);
  }
  function caption() { var p = q("#zsa-lv-strip p"); return p ? p.textContent : null; }
  // Routing: for each plan, start the item fresh, answer the steps before plan.kind, then make the picks (or build).
  function run(plans) {
    return plans.map(function (plan) {
      single(plan.id, plan.ap);
      for (var guard = 0; kind() !== plan.kind && guard < 10; guard++) answer(plan.ans);
      var before = window.__zsa.state();
      if (plan.build) build(plan.build);
      else Object.keys(plan.picks).forEach(function (p) { if (kind() === plan.kind) choose(p, plan.picks[p]); });
      return {before: before, after: window.__zsa.state(), kind: kind()};
    });
  }
  // The choices offered in each part of the step plan.kind.
  function offered(plan) {
    single(plan.id, plan.ap);
    for (var guard = 0; kind() !== plan.kind && guard < 10; guard++) answer(plan.ans);
    var out = {};
    qa("[data-zsa-part]", field()).forEach(function (g) {
      var name = g.getAttribute("data-zsa-part");
      if (name === "lv-build" || name === "structure") return;
      out[name] = qa("button", g).map(function (b) { return b.value; });
    });
    return out;
  }
  // Plays the item on screen to the end, answering every step right.
  function finishItem(ans) { for (var guard = 0; kind() && guard < 12; guard++) answer(ans); }
  window.__lv = {kind: kind, atoms: atoms, group: group, choose: choose, build: build, answer: answer, single: single, setLP: setLP, setBond: setBond,
    buildState: buildState, stripStructure: stripStructure, caption: caption, run: run, offered: offered, finishItem: finishItem};
}

// Opens the activity and installs both helper sets. Returns nothing; use page.evaluate with window.__lv.
async function openLv(page, open, opts) {
  await open("lewis-vsepr", opts);
  await page.evaluate(lvInstall);
}
// Answers for the item on screen, found from its name in the strip.
async function current(page, ap) {
  var name = await page.evaluate(function () { return window.__lv.caption(); });
  var it = byName(name);
  if (!it) throw new Error("unknown item " + name);
  return {item: it, ans: answers(it, ap)};
}
// Plays a whole round, every step right except where plan(index) says otherwise ({kind: ["wrong", "show", "hint"]}).
async function playRound(page, ap, plans) {
  var out = [];
  for (var guard = 0; guard < 20; guard++) {
    var fin = await page.evaluate(function () { return !!document.querySelector("#zsa-lv-work > h2"); });
    if (fin) break;
    var c = await current(page, ap), plan = (plans || {})[out.length] || {};
    var progress = await page.evaluate(function () { return window.__zsa.state().progress; });
    await page.evaluate(function (args) {
      var z = window.__lv, ans = args.ans, plan = args.plan;
      for (var g = 0; z.kind() && g < 12; g++) {
        var k = z.kind(), acts = plan[k] || [];
        acts.forEach(function (act) {
          if (z.kind() !== k) return;
          if (act === "hint") window.__zsa.hint();
          else if (act === "show") window.__zsa.show();
          else if (act === "wrong") {
            if (k === "build") {
              // A wrong structure with every electron placed; a second wrong attempt changes one lone pair away and
              // back, which places every electron again in the same wrong way.
              var w = args.wrong, opts = window.__lv.group("Bond between") || window.__lv.group("Lone pairs on");
              var fresh = window.__lv.atoms()[0].textContent.indexOf("bond not set") >= 0;
              void opts;
              if (!w) return; // CH4, SiH4, NH4+: single bonds use every electron, so no wrong structure can be checked
              if (fresh) z.build(w);
              else { var lp = w.o[0][1]; z.setLP(0, lp > 0 ? lp - 1 : lp + 1); z.setLP(0, lp); }
            } else {
              var f = document.querySelector("#zsa-lv-work > fieldset");
              var part = f.querySelector("[data-zsa-part]:not([data-zsa-part=lv-build]):not([data-zsa-part=structure])");
              var right = {total: ans.total, center: ans.center, fc: ans.fc, domains: ans.domains, mg: ans.mg, claim: ans.claim}[part.getAttribute("data-zsa-part")];
              var b = [].find.call(part.querySelectorAll("button"), function (x) { return x.value !== String(right) && x.getAttribute("aria-disabled") !== "true"; });
              b.click();
              // A second part, if any, is answered right so the step checks.
              var parts = f.querySelectorAll("[data-zsa-part]");
              if (parts.length > 1 && z.kind() === k) {
                var second = parts[1].getAttribute("data-zsa-part"), val = {eg: ans.eg, angle: ans.angle, reason: ans.reason}[second];
                if (val !== undefined && !parts[1].querySelector('[aria-pressed="true"]')) z.choose(second, val);
              }
            }
          }
        });
        if (z.kind() === k) z.answer(ans);
      }
    }, {ans: c.ans, plan: plan, wrong: wrongBuild(c.item, ap)});
    var summary = await page.evaluate(function () { return window.__zsa.state().summary; });
    out.push({id: c.item.id, progress: progress, summary: summary});
    await page.evaluate(function () { window.__zsa.next(); });
  }
  return {items: out, finish: await page.evaluate(function () { return window.__zsa.state(); })};
}

module.exports = {data: data, IDS: IDS, item: item, byName: byName, refFor: refFor, accepted: accepted, answers: answers, kindsOf: kindsOf,
  arrangementsOf: arrangementsOf, wrongBuild: wrongBuild, lvInstall: lvInstall, openLv: openLv, current: current, playRound: playRound, install: install};
