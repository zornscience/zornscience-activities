// ZornScience trainer visuals: the progress track (one pip per question, one bar per step) and the small helpers the
// trainers share for their drawings and their animations on a right or a missed answer. Used by the Ion Charge
// Trainer, Periodic Trends Practice and the Lewis Structure and VSEPR Builder, next to shared/zsa-engine.js.
//
// No globals: a trainer asks for the API with a one-use "zsa:request-track" event on its root, as it asks for the
// engine. The engine itself is unchanged: the trainer passes it track.template as its progress label, so the engine
// writes the numbers into the track's sink, and the track writes the trainer's own progress sentence and the pips.
(function () {
  "use strict";
  // The SVG namespace is a name, not a link: nothing is fetched from it.
  var SVG_NS = "http://www.w3.org/2000/svg";
  // The engine fills this template; the parts are split on "|", which no progress label contains.
  var TEMPLATE = "{number}|{total}|{step}|{steps}|{label}";

  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function svg(tag, attrs, cls) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
    if (cls) el.setAttribute("class", cls);
    return el;
  }
  // SVG text with its words, for drawings that are hidden from screen readers (the page gives them a label).
  function label(attrs, text, cls) {
    var t = svg("text", attrs, cls);
    t.textContent = text;
    return t;
  }
  var motion = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(motion && motion.matches); }
  // Starts a CSS animation again: the class comes off, the layout is read so the browser notices, and it goes back on.
  // Every animation is decoration: the state it leads to is already drawn, so with reduced motion nothing is lost.
  function replay(target, cls) {
    if (!target) return;
    target.classList.remove(cls);
    void target.getBoundingClientRect();
    target.classList.add(cls);
  }
  // After the engine has finished its own changes for this answer (it runs right after the trainer's classify hook).
  function later(callback) { Promise.resolve().then(callback); }

  // The progress line and the track under it. options: {id, template}. id is the progress line's id, template the
  // trainer's own sentence ("{label} {number} of {total} · Step {step} of {steps}").
  function progress(options) {
    var box = node("div", "zsa-track");
    var text = node("p", "zsa-progress");
    text.id = options.id;
    // The pips repeat the sentence for the eye, so screen readers skip them. data-zsa-pip and data-zsa-step give each
    // one's state to the tests (done, missed, current or todo).
    var pips = node("div", "zsa-track-pips");
    pips.setAttribute("aria-hidden", "true"); pips.setAttribute("data-zsa-track", "");
    var items = node("span", "zsa-track-items"), steps = node("span", "zsa-track-steps");
    pips.appendChild(items); pips.appendChild(steps);
    box.appendChild(text); box.appendChild(pips);
    // status[i]: "clean" or "missed" for each question answered so far in this round.
    var status = [], originals = 0, now = null, loading = false, finished = false, lastStep = 0;

    function draw(fresh) {
      items.replaceChildren(); steps.replaceChildren();
      for (var i = 0; i < now.total; i++) {
        var state = i < now.number - 1 || (i === now.number - 1 && finished) ? (status[i] === "missed" ? "missed" : "done") : i === now.number - 1 ? "current" : "todo";
        var pip = node("span", "zsa-track-pip is-" + state + (i >= originals ? " is-review" : "") + (i === now.number - 1 && finished ? " is-fresh" : ""));
        pip.setAttribute("data-zsa-pip", state);
        if (i >= originals) pip.setAttribute("data-zsa-review", "");
        items.appendChild(pip);
      }
      for (var s = 1; s <= now.steps; s++) {
        var st = s < now.step || finished ? "done" : s === now.step ? "current" : "todo";
        var bar = node("span", "zsa-track-step is-" + st + (fresh === s ? " is-fresh" : ""));
        bar.setAttribute("data-zsa-step", st);
        steps.appendChild(bar);
      }
    }
    var sink = {};
    Object.defineProperty(sink, "textContent", {
      get: function () { return text.textContent; },
      set: function (value) {
        var p = String(value).split("|"), v = {number: Number(p[0]), total: Number(p[1]), step: Number(p[2]), steps: Number(p[3]), label: p.slice(4).join("|")};
        var fresh = null;
        if (loading) {
          // A new question: the first of a round starts the track again.
          if (v.number === 1 || !now || v.number < now.number) { status = []; originals = v.total; }
          status[v.number - 1] = "clean"; finished = false; loading = false; lastStep = v.step;
        } else if (now && v.step === lastStep + 1) fresh = lastStep;
        lastStep = v.step;
        now = v;
        text.textContent = options.template.replace(/\{(\w+)\}/g, function (m, k) { return String(v[k]); });
        draw(fresh);
      }
    });
    return {
      node: box, text: text, sink: sink, template: TEMPLATE,
      // renderStrip calls load() for each new question, before the engine writes its progress.
      load: function () { loading = true; },
      // A wrong answer or Show me on this question: its pip is amber once it is done.
      miss: function () { if (now) status[now.number - 1] = "missed"; },
      // The question is complete (its summary is showing): its pip and every step bar are filled.
      complete: function () { if (!now) return; finished = true; draw(now.steps); }
    };
  }

  var api = {svg: svg, label: label, node: node, reduced: reduced, replay: replay, later: later, progress: progress};
  if (typeof document !== "undefined") {
    document.querySelectorAll("[data-zsa-activity]").forEach(function (root) {
      root.addEventListener("zsa:request-track", function (event) { event.detail.receive(api); }, {once: true});
    });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
