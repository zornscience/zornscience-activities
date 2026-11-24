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
    // The pips repeat the sentence for the eye, so screen readers skip them. They are the question-set practice engine's
    // pips (shared/zsa-practice.js): the same shape, states and motion. Each says its state in data-state, which the
    // stylesheet and the tests read: a question pip is current, correct, missed or empty; a step bar is current, done or
    // empty. data-zsa-review marks a review item.
    var pips = node("div", "zsa-track-pips");
    pips.setAttribute("aria-hidden", "true"); pips.setAttribute("data-zsa-track", "");
    var items = node("span", "zsa-track-items"), steps = node("span", "zsa-track-steps");
    pips.appendChild(items); pips.appendChild(steps);
    box.appendChild(text); box.appendChild(pips);
    // status[i]: "correct" or "missed" for each question answered so far in this round.
    var status = [], originals = 0, now = null, loading = false, finished = false;

    // The pips stay in place and only their data-state changes, so a pip fills with the stylesheet's transition, as in
    // the practice engine. Pips are added or removed only when the round's length changes.
    function count(holder, n, cls) {
      while (holder.children.length > n) holder.removeChild(holder.lastChild);
      while (holder.children.length < n) holder.appendChild(node("span", cls));
      return [].slice.call(holder.children);
    }
    function draw() {
      count(items, now.total, "zsa-track-pip").forEach(function (pip, i) {
        var done = i < now.number - 1 || (i === now.number - 1 && finished);
        pip.setAttribute("data-state", done ? status[i] : i === now.number - 1 ? "current" : "");
        if (i >= originals) pip.setAttribute("data-zsa-review", ""); else pip.removeAttribute("data-zsa-review");
      });
      count(steps, now.steps, "zsa-track-step").forEach(function (bar, k) {
        var s = k + 1;
        bar.setAttribute("data-state", s < now.step || finished ? "done" : s === now.step ? "current" : "");
      });
    }
    var sink = {};
    Object.defineProperty(sink, "textContent", {
      get: function () { return text.textContent; },
      set: function (value) {
        var p = String(value).split("|"), v = {number: Number(p[0]), total: Number(p[1]), step: Number(p[2]), steps: Number(p[3]), label: p.slice(4).join("|")};
        if (loading) {
          // A new question: the first of a round starts the track again.
          if (v.number === 1 || !now || v.number < now.number) { status = []; originals = v.total; }
          status[v.number - 1] = "correct"; finished = false; loading = false;
        }
        now = v;
        text.textContent = options.template.replace(/\{(\w+)\}/g, function (m, k) { return String(v[k]); });
        draw();
      }
    });
    return {
      node: box, text: text, sink: sink, template: TEMPLATE,
      // renderStrip calls load() for each new question, before the engine writes its progress.
      load: function () { loading = true; },
      // A wrong answer or Show me on this question: its pip is striped red once it is done.
      miss: function () { if (now) status[now.number - 1] = "missed"; },
      // The question is complete (its summary is showing): its pip and every step bar are filled.
      complete: function () { if (!now) return; finished = true; draw(); }
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
