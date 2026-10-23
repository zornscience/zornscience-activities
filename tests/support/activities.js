// What the tests need to know about each activity: its URL, the element ids it keeps stable, and how to find the
// correct answer for whatever item is on screen (from the independent reference, not from the activity's data).
"use strict";
var ref = require("./reference");

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

var activities = {
  "ion-charge-trainer": {
    slug: "ion-charge-trainer", code: "ict", path: "/ion-charge-trainer/",
    ids: {work: "zsa-ict-work", strip: "zsa-ict-element", heading: "zsa-ict-element-heading", progress: "zsa-ict-progress",
      live: "zsa-ict-live", options: "zsa-ict-options", newRound: "zsa-ict-new", pick: "zsa-ict-pick", select: "zsa-ict-select",
      table: "zsa-ict-table", note: "zsa-ict-table-note", naming: "zsa-ict-naming"},
    itemCount: 19, roundSize: 10, currentMark: "(this element)",
    // Picker values: the element symbols.
    pickValues: function () { return ref.elements.map(function (e) { return {value: e.symbol}; }); },
    identify: function (st) {
      var e = ref.elements.find(function (x) { return cap(x.name) === st.heading; });
      if (!e) throw new Error("unknown element heading " + JSON.stringify(st.heading));
      return {item: e, key: e.symbol};
    },
    answer: function (id, step) {
      var e = id.item;
      return [{valence: e.valence}, {direction: e.direction, count: e.moved}, {charge: e.charge}, {name: e.ion, gas: e.gas}][step];
    },
    marked: function (id) { return [id.item.symbol]; }
  },
  // Its steps differ per item (a structure editor, an AP formal charge step), so its own tests drive it:
  // tests/e2e/lewis-*.spec.js with the answers from tests/support/lewis-reference.js.
  "lewis-vsepr": {
    slug: "lewis-vsepr", code: "lv", path: "/lewis-vsepr/",
    ids: {work: "zsa-lv-work", strip: "zsa-lv-strip", heading: "zsa-lv-heading", progress: "zsa-lv-progress",
      live: "zsa-lv-live", options: "zsa-lv-options", newRound: "zsa-lv-new", pick: "zsa-lv-pick", select: "zsa-lv-select",
      table: "zsa-lv-table", note: "zsa-lv-table-note"},
    itemCount: 37, roundSize: 6, currentMark: "(in this structure)"
  }
};

// Installed in the page with page.evaluate(install, ids). Reads state through roles, ids, ARIA and text only,
// so the same helpers work on any version of an activity whatever its class names.
function install(ids) {
  function byId(id) { return document.getElementById(id); }
  function hiddenVisually(el) {
    var s = getComputedStyle(el);
    return s.position === "absolute" && el.getBoundingClientRect().width <= 1 && s.overflow === "hidden";
  }
  // Text as a screen reader gets it: aria-hidden subtrees left out.
  function spoken(el) {
    if (!el) return null;
    var out = "";
    (function walk(n) {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      if (n.nodeType !== 1 || n.getAttribute("aria-hidden") === "true") return;
      n.childNodes.forEach(walk);
    })(el);
    return out;
  }
  // Text as it is seen: visually hidden text left out.
  function visual(el) {
    if (!el) return null;
    var out = "";
    (function walk(n) {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      if (n.nodeType !== 1 || hiddenVisually(n)) return;
      n.childNodes.forEach(walk);
    })(el);
    return out;
  }
  function shown(el) { return !!el && !el.hidden && el.getClientRects().length > 0; }
  function stepField() { var w = byId(ids.work); return w && w.querySelector(":scope > fieldset"); }
  function actionButtons() {
    var f = stepField();
    if (!f) return [];
    return [].filter.call(f.querySelectorAll("button"), function (b) { return !b.closest("[data-zsa-part]"); });
  }
  function hintButton() { return actionButtons()[0] || null; }
  function showButton() { return actionButtons()[1] || null; }
  function partGroup(name) { var f = stepField(); return f && f.querySelector('[data-zsa-part="' + name + '"]'); }
  function choice(name, value) {
    var g = partGroup(name);
    var b = g && g.querySelector('button[value="' + String(value).replace(/"/g, '\\"') + '"]');
    if (!b) throw new Error("no choice " + name + "=" + value);
    return b;
  }
  function describe(el) {
    if (!el || el === document.body) return "body";
    var part = el.closest("[data-zsa-part]");
    if (part) return "choice:" + part.getAttribute("data-zsa-part") + "=" + el.value;
    if (el.id) return "#" + el.id;
    return el.tagName.toLowerCase() + ":" + (visual(el) || "").trim().slice(0, 40);
  }
  function state() {
    var work = byId(ids.work), f = stepField(), strip = byId(ids.strip);
    var parts = {};
    if (f) f.querySelectorAll("[data-zsa-part]").forEach(function (g) {
      var sub = g.parentNode.tagName === "FIELDSET" && g.parentNode !== f ? g.parentNode.querySelector("legend") : null;
      parts[g.getAttribute("data-zsa-part")] = {
        legend: sub ? sub.textContent : null,
        choices: [].map.call(g.querySelectorAll("button"), function (b) {
          return {value: b.value, label: visual(b).replace(/^✗/, "").trim(), name: spoken(b).trim(), pressed: b.getAttribute("aria-pressed") === "true",
            tried: b.getAttribute("aria-disabled") === "true", tabIndex: b.tabIndex};
        })
      };
    });
    var ps = f ? f.querySelectorAll(":scope > p") : [];
    var trail = work && work.querySelector(":scope > ul");
    var last = work && work.querySelector(":scope > p");
    var summary = work && work.querySelector(":scope > section");
    var finish = work && work.querySelector(":scope > h2");
    var hint = hintButton(), show = showButton();
    var caption = strip && strip.querySelector("p");
    return {
      heading: byId(ids.heading) ? spoken(byId(ids.heading)).trim() : null,
      headingVisual: byId(ids.heading) ? visual(byId(ids.heading)).trim() : null,
      caption: caption ? caption.textContent : null,
      progress: byId(ids.progress) ? byId(ids.progress).textContent : null,
      step: f ? Number(f.id.split("-").pop()) : null,
      question: f ? f.querySelector("legend").textContent : null,
      parts: parts,
      hint: hint ? {text: hint.textContent, disabled: hint.getAttribute("aria-disabled") === "true"} : null,
      show: show ? shown(show) : false,
      feedback: ps[0] && shown(ps[0]) ? {text: visual(ps[0]), spoken: spoken(ps[0])} : null,
      hintText: ps[1] && shown(ps[1]) ? {text: visual(ps[1]), spoken: spoken(ps[1])} : null,
      trail: trail ? [].map.call(trail.children, function (li) { return {text: visual(li).trim(), spoken: spoken(li).trim()}; }) : [],
      trailLabel: trail ? trail.getAttribute("aria-label") : null,
      last: last ? {text: visual(last), spoken: spoken(last)} : null,
      summary: summary ? {title: summary.querySelector("h3").textContent, text: visual(summary), button: summary.querySelector("button").textContent} : null,
      finish: finish ? {title: finish.textContent, text: visual(work)} : null,
      finishButtons: finish ? [].map.call(work.querySelectorAll("button"), function (b) { return b.textContent; }) : [],
      live: byId(ids.live).textContent,
      focus: describe(document.activeElement)
    };
  }
  function tableState() {
    var t = byId(ids.table).querySelector("table");
    var marked = [], hinted = [], charges = {};
    t.querySelectorAll("thead th").forEach(function (th, i) {
      if (!i) return;
      var g = visual(th).match(/\d+$/)[0];
      if (/\(hint\)/.test(spoken(th))) hinted.push(Number(g));
      var m = spoken(th).match(/ion charge (\S+)/);
      if (m) charges[g] = m[1];
    });
    t.querySelectorAll("tbody td").forEach(function (td) { if (/\(this element\)|\(in this compound\)/.test(td.textContent)) marked.push(visual(td).trim()); });
    return {marked: marked, hinted: hinted, charges: charges, caption: t.caption.textContent, rows: t.tBodies[0].rows.length};
  }
  function click(el) { el.click(); }
  window.__zsa = {
    state: state, tableState: tableState, spoken: spoken, visual: visual,
    choose: function (name, value) { click(choice(name, value)); },
    choice: choice,
    hint: function () { click(hintButton()); },
    show: function () { click(showButton()); },
    next: function () { click(byId(ids.work).querySelector(":scope > section button")); },
    finishButton: function (text) {
      var b = [].find.call(byId(ids.work).querySelectorAll("button"), function (x) { return x.textContent === text; });
      if (!b) throw new Error("no button " + text);
      click(b);
    },
    // Practice one item from the picker (dir only for the Ionic Formula Builder).
    single: function (value, dir) {
      byId(ids.select).value = value;
      if (dir) byId(ids.direction).value = dir;
      click(byId(ids.pick));
    },
    newRound: function () { click(byId(ids.newRound)); }
  };
}

module.exports = {activities: activities, install: install};
