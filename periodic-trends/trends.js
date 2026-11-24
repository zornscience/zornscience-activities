// Periodic Trends Practice: the steps, the misconception rules and the question strip. Everything else (rounds,
// review, tap to check, hints, Show me, the answer trail, summaries, the table, keyboard and focus) is the engine's.
// Questions and words come from data.js, which tools/build-data.js writes from the Periodic Table's data.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="periodic-trends"]');
  if (!root) return;
  var data, zsa, track;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail: {receive: function (value) { zsa = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-track", {detail: {receive: function (value) { track = value; }}}));
  if (!data || !zsa || !track) return;
  var ui = data.ui, node = zsa.node, els = data.elements, words = ui.visual, svg = track.svg;
  var byId = {};
  data.items.forEach(function (q) { byId[q.id] = q; });

  // What a question's text needs. A is always the element with the smaller atomic number (left of or above B).
  function info(q) {
    var p = ui.props[q.prop], a = els[q.a], b = els[q.b], win = els[q.answer];
    var direction = data.rule[q.prop][q.relation];
    function value(e) { var v = e[q.prop]; return v + p.unit; }
    return {
      p: p, a: a, b: b, win: win, direction: direction,
      slots: {nameA: a.name.toLowerCase(), nameB: b.name.toLowerCase(), symbolA: a.symbol, symbolB: b.symbol, groupA: String(a.group),
        groupB: String(b.group), periodA: String(a.period), periodB: String(b.period), label: p.label, higher: p.higher,
        winner: win.name.toLowerCase(), valueA: value(a), valueB: value(b), relation: q.relation, direction: ui.trailDirection[direction],
        where: ui.where[q.relation], think: ui.think[q.relation], toward: ui.toward[q.relation][direction], why: p.why[q.relation], confuse: p.confuse,
        place: zsa.fill(ui.place[q.relation], {group: String(a.group), period: String(a.period)}).join(""), positionA: ui.position[q.relation],
        // Spanish templates also use the label with its article, a gendered "a higher" phrase and the relation word.
        theLabel: p.the || p.label, aHigher: p.aHigher || "", relationWord: ui.relationWord ? ui.relationWord[q.relation] : q.relation}
    };
  }
  function text(template, q) { return zsa.fill(template, info(q).slots); }
  function plain(template, q) { return text(template, q).join(""); }
  function pick(t, q) { return typeof t === "string" ? t : t[q.relation]; }

  // Misconception rules: null when right, else the feedback keys and the parts to clear.
  function classify(entry, s, picks) {
    var q = entry.item, x = info(q);
    if (s === 0) {
      if (picks.relation === q.relation) return null;
      return {keys: [picks.relation === "neither" ? "neither" : "relation"], wrong: ["relation"]};
    }
    if (s === 1) {
      if (picks.direction === x.direction) return null;
      // "Stays the same", or the opposite direction: for radius and ionization energy that is the other property's
      // direction (they run opposite ways); for electronegativity it is the trend reversed.
      return {keys: [picks.direction === "same" ? "flat" : (q.prop === "en" ? "reverse" : "confuse")], wrong: ["direction"]};
    }
    if (picks.element === q.answer) return null;
    // A wrong element is either the one with the larger atomic number (judging by atomic number alone) or the one the
    // trend points away from (the direction applied backwards).
    var picked = els[picks.element], other = picked === x.a ? x.b : x.a;
    return {keys: [picked.z > other.z ? "atomicNumber" : "applyReverse"], wrong: ["element"]};
  }
  function message(entry, key) {
    var q = entry.item, f = ui.feedback;
    if (key === "relation") return text(f.relation, q);
    if (key === "neither") return text(f.neither, q);
    if (key === "flat") return text(pick(f.flat, q), q);
    if (key === "confuse" || key === "reverse") return text(f.reverse, q);
    if (key === "atomicNumber") return text(f.atomicNumber, q);
    if (key === "applyReverse") return text(f.applyReverse, q);
  }
  function step(entry, s) {
    var q = entry.item, x = info(q), groups = x.a.group === x.b.group ? [x.a.group] : [x.a.group, x.b.group];
    if (s === 0) return {question: plain(ui.questions[0], q), parts: [{name: "relation", values: ui.relations, modifier: "three"}], hintGroups: groups};
    if (s === 1) return {question: plain(ui.questions[1][q.relation], q), parts: [{name: "direction", values: ui.directions, modifier: "three"}], hintGroups: groups};
    return {question: x.p.question, parts: [{name: "element", values: [x.a, x.b].map(function (e) { return [e.symbol, e.name + " (" + e.symbol + ")"]; }), modifier: "two"}], hintGroups: groups};
  }
  function hint(entry, s, level) {
    var q = entry.item, h = ui.hints[s][level];
    return text(pick(h, q), q);
  }
  // ---------- The comparison: two element cards, and the relation and trend drawn on the table ----------
  // Before step 1 the cards show each element's symbol, name and atomic number. Step 1 adds group and period and
  // outlines the shared row or column on the table; step 2 lays a wedge over it that is thick where the property is
  // larger; step 3 fills a bar for the property and, for atomic radius, draws both atoms to scale. Each state is drawn as
  // it is, so with reduced motion nothing is lost.
  var progressTrack = track.progress({id: "zsa-ptr-progress", template: ui.labels.progress || zsa.LABELS.progress});
  var labels = {};
  Object.keys(ui.labels).forEach(function (k) { labels[k] = ui.labels[k]; });
  labels.progress = progressTrack.template;
  // Bars and atoms share one scale per property, so the drawings can be compared from question to question.
  var MAX = {radius: 220, en: 4, ie: 2400};
  var view = null; // {q, stage, cards, pill, shown}: the question on screen and the steps its drawings show
  var lastRight = -1;

  function card(e) {
    var box = node("div", "zsa-ptr-card");
    var atom = svg("svg", {viewBox: "0 0 60 60", "aria-hidden": "true", focusable: "false"}, "zsa-ptr-atom");
    var words1 = node("div", "zsa-ptr-card-text");
    var top = node("p", "zsa-ptr-card-top");
    top.appendChild(node("span", "zsa-ptr-card-symbol", e.symbol));
    top.appendChild(node("span", "zsa-ptr-card-z", String(e.z)));
    words1.appendChild(top);
    words1.appendChild(node("p", "zsa-ptr-card-name", e.name));
    var place = node("p", "zsa-ptr-card-place");
    words1.appendChild(place);
    var meter = node("div", "zsa-ptr-meter");
    var bar = svg("svg", {viewBox: "0 0 100 10", preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false"}, "zsa-ptr-bar");
    var value = node("p", "zsa-ptr-value");
    meter.appendChild(bar); meter.appendChild(value);
    box.appendChild(atom); box.appendChild(words1); box.appendChild(meter);
    return {e: e, box: box, atom: atom, place: place, bar: bar, value: value};
  }
  function valueText(q, e) { return String(e[q.prop]) + ui.props[q.prop].unit; }
  function drawCard(c, q, stage, animate) {
    var e = c.e, win = stage >= 3 && q.answer === e.symbol;
    c.box.className = "zsa-ptr-card" + (win ? " is-winner" : "");
    // Group and period may wrap onto two lines, but only at the dot between them.
    var place = stage >= 1 ? zsa.fill(words.place, {group: String(e.group), period: String(e.period)}).join("") : words.placeUnknown;
    c.place.textContent = place.split(" · ").map(function (part) { return part.replace(/ /g, "\u00a0"); }).join(" · ");
    // The atom: a dashed circle until step 3. Then, in an atomic radius question, a circle whose radius is the atomic
    // radius on one scale; in the other questions both stay the same size, so a circle's size never stands for them.
    c.atom.replaceChildren();
    var scaled = stage >= 3 && q.prop === "radius", r = scaled ? Math.max(4, 27 * e.radius / MAX.radius) : 15;
    c.atom.appendChild(svg("circle", {cx: 30, cy: 30, r: r.toFixed(2)}, "zsa-ptr-atom-body" + (stage >= 3 ? "" : " is-unknown") + (scaled && animate === 3 ? " is-grow" : "")));
    if (stage >= 3 && !scaled) c.atom.appendChild(track.label({x: 30, y: 30.5, "text-anchor": "middle", "dominant-baseline": "central"}, e.symbol, "zsa-ptr-atom-symbol"));
    c.atom.appendChild(svg("circle", {cx: 30, cy: 30, r: 2.5}, "zsa-ptr-atom-core"));
    // The bar: empty until step 3.
    c.bar.replaceChildren();
    c.bar.appendChild(svg("rect", {x: 0, y: 0, width: 100, height: 10, rx: 5}, "zsa-ptr-bar-track"));
    if (stage >= 3) {
      var w = Math.max(3, Math.min(100, 100 * e[q.prop] / MAX[q.prop]));
      c.bar.appendChild(svg("rect", {x: 0, y: 0, width: w.toFixed(2), height: 10, rx: 5}, "zsa-ptr-bar-fill" + (win ? " is-winner" : "") + (animate === 3 ? " is-grow" : "")));
    }
    c.value.textContent = stage >= 3 ? valueText(q, e) : "?";
  }
  function drawView(stage, animate) {
    var q = view.q, x = info(q);
    view.cards.forEach(function (c) { drawCard(c, q, stage, animate); });
    var pill = "";
    if (stage === 1) pill = zsa.cap(plain(ui.explain[0], q));
    if (stage === 2) pill = zsa.cap(plain(words.trend, q));
    if (stage >= 3) pill = zsa.cap(plain(words.winner, q));
    // The line is always there, so the stage never changes height; it is blank until step 1 is answered.
    view.pill.textContent = pill || "\u00a0";
    view.pill.className = "zsa-stage-pill" + (stage >= 3 ? " is-good" : "") + (pill ? "" : " is-empty");
    // One picture for screen readers, named with everything it shows.
    var said = [zsa.cap(plain(words.said, q))];
    [x.a, x.b].forEach(function (e) {
      var parts = [zsa.fill(words.card, {name: e.name, symbol: e.symbol, z: String(e.z)}).join("")];
      if (stage >= 1) parts.push(zsa.fill(words.cardPlace, {group: String(e.group), period: String(e.period)}).join(""));
      if (stage >= 3) parts.push(zsa.fill(words.cardValue, {label: x.p.label, theLabel: x.p.the || x.p.label, value: valueText(q, e)}).join(""));
      said.push(parts.join(", ") + ".");
    });
    if (pill) said.push(pill + ".");
    if (stage >= 3 && q.prop === "radius") said.push(words.scale + ".");
    view.stage.setAttribute("aria-label", said.join(" "));
    view.shown = stage;
  }

  // The table overlay: an outline around the shared row or column, then a wedge along it, thick where the property
  // is larger. It sits over the engine's table and is redrawn whenever the table is.
  var tableHolder = root.querySelector("#zsa-ptr-table"), tableWrap = tableHolder.parentNode, stripEl = root.querySelector("#zsa-ptr-pair");
  var overlay = svg("svg", {"aria-hidden": "true", focusable: "false"}, "zsa-ptr-overlay");
  tableWrap.appendChild(overlay);
  var overlayDrawn = 0;
  function drawOverlay(animate) {
    overlay.replaceChildren();
    var t = tableHolder.querySelector("table");
    if (!view || !t || !stripEl.firstChild || view.shown < 1) { overlayDrawn = 0; return; }
    var q = view.q, a = els[q.a], base = tableWrap.getBoundingClientRect();
    overlay.setAttribute("viewBox", "0 0 " + base.width.toFixed(1) + " " + base.height.toFixed(1));
    var rows = t.tBodies[0].rows, col = data.groups.indexOf(a.group) + 1, cells = [];
    if (q.relation === "period") [].forEach.call(rows[a.period - 1].cells, function (td, i) { if (i && td.textContent) cells.push(td); });
    else [].forEach.call(rows, function (tr) { var td = tr.cells[col]; if (td && td.firstChild) cells.push(td); });
    if (!cells.length) return;
    var box = {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity};
    cells.forEach(function (td) {
      var r = td.getBoundingClientRect();
      box.left = Math.min(box.left, r.left - base.left); box.top = Math.min(box.top, r.top - base.top);
      box.right = Math.max(box.right, r.right - base.left); box.bottom = Math.max(box.bottom, r.bottom - base.top);
    });
    var pad = 2.5, x0 = box.left - pad, y0 = box.top - pad, w = box.right - box.left + 2 * pad, h = box.bottom - box.top + 2 * pad;
    if (view.shown >= 2) {
      // The wedge: from a point at the low end to the full width of the band at the high end.
      var up = data.rule[q.prop][q.relation] === "increases", cx = x0 + w / 2, cy = y0 + h / 2, pts;
      if (q.relation === "period") pts = up ? [[x0 + 4, cy], [x0 + w - 3, y0 + 3], [x0 + w - 3, y0 + h - 3]] : [[x0 + 3, y0 + 3], [x0 + w - 4, cy], [x0 + 3, y0 + h - 3]];
      else pts = up ? [[cx, y0 + 4], [x0 + w - 3, y0 + h - 3], [x0 + 3, y0 + h - 3]] : [[x0 + 3, y0 + 3], [x0 + w - 3, y0 + 3], [cx, y0 + h - 4]];
      var growFrom = q.relation === "period" ? "is-across" : "is-down";
      overlay.appendChild(svg("polygon", {points: pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ")}, "zsa-ptr-wedge " + growFrom + (animate === 2 ? " is-grow" : "")));
    }
    overlay.appendChild(svg("rect", {x: x0.toFixed(1), y: y0.toFixed(1), width: w.toFixed(1), height: h.toFixed(1), rx: 8, pathLength: 100}, "zsa-ptr-band" + (animate === 1 ? " is-draw" : "")));
    overlayDrawn = view.shown;
  }
  var pendingAnimate = 0;
  new MutationObserver(function () { drawOverlay(pendingAnimate); pendingAnimate = 0; }).observe(tableHolder, {childList: true});
  if (typeof ResizeObserver === "function") new ResizeObserver(function () { drawOverlay(0); }).observe(tableWrap);

  function renderStrip(entry, strip) {
    var q = entry.item, x = info(q);
    var heading = node("h2", "zsa-ptr-title", zsa.cap(plain(ui.heading, q)));
    heading.id = "zsa-ptr-heading"; heading.tabIndex = -1;
    var caption = node("p", "zsa-ptr-caption", plain(ui.caption, q));
    caption.id = "zsa-ptr-caption";
    progressTrack.load();
    strip.appendChild(heading); strip.appendChild(caption); strip.appendChild(progressTrack.node);
    var stage = node("div", "zsa-stage zsa-ptr-stage"); stage.setAttribute("role", "img");
    var row = node("div", "zsa-ptr-cards"); row.setAttribute("aria-hidden", "true");
    var cards = [card(x.a), card(x.b)];
    row.appendChild(cards[0].box); row.appendChild(node("span", "zsa-ptr-vs", words.vs)); row.appendChild(cards[1].box);
    var pill = node("p", "zsa-stage-pill"); pill.setAttribute("aria-hidden", "true");
    stage.appendChild(row); stage.appendChild(pill);
    strip.appendChild(stage);
    view = {q: q, stage: stage, cards: cards, pill: pill, shown: 0};
    lastRight = -1;
    drawView(0, 0);
    return {heading: heading, progress: progressTrack.sink};
  }
  // The engine redraws the table after each finished step with the number of steps done; the drawings follow it.
  function marks(entry, done) {
    if (view && view.q === entry.item && done !== view.shown) {
      var grew = done > view.shown;
      if (grew && lastRight !== done - 1) progressTrack.miss();
      drawView(done, grew && !track.reduced() ? done : 0);
      if (grew && lastRight === done - 1) track.replay(view.stage, "is-cheer");
      // The engine draws the table right after this; the observer below then draws the overlay on it.
      pendingAnimate = grew && !track.reduced() ? done : 0;
    }
    return {marked: [entry.item.a, entry.item.b]};
  }
  function summary(entry) {
    progressTrack.complete();
    var q = entry.item, p = node("p"), x = info(q);
    zsa.render(p, zsa.cap(plain(ui.summary, q)));
    var link = node("a", "zsa-ptr-link", ui.tableLink);
    link.href = "../periodic-table/?mode=" + data.tableMode[q.prop] + "&el=" + x.win.symbol;
    var line = node("p"); line.appendChild(link);
    return [p, line];
  }

  // A round: 3 questions per trend, each trend with at least one same-group and one same-period pair.
  function trendRound(prop, count) {
    var mine = data.items.filter(function (q) { return q.prop === prop; });
    var groups = zsa.shuffle(mine.filter(function (q) { return q.relation === "group"; }));
    var periods = zsa.shuffle(mine.filter(function (q) { return q.relation === "period"; }));
    var chosen = [groups[0], periods[0]], rest = zsa.shuffle(groups.slice(1).concat(periods.slice(1)));
    while (chosen.length < count) chosen.push(rest.pop());
    return chosen;
  }
  function mixed() {
    var out = [];
    ["radius", "en", "ie"].forEach(function (p) { out = out.concat(trendRound(p, 3)); });
    return zsa.shuffle(out).map(function (q) { return {item: q}; });
  }

  var activity = zsa.create(root, {
    prefix: "zsa-ptr", strip: "zsa-ptr-pair", labels: labels,
    pool: data.items, key: function (q) { return q.id; },
    round: mixed,
    table: {groups: data.groups, rows: data.table},
    marks: marks,
    renderStrip: renderStrip, steps: 3, step: step, message: message, hint: hint,
    // The rules decide; the drawings react: a right answer is remembered for the next stage, a miss nudges the cards.
    classify: function (entry, s, picks) {
      var result = classify(entry, s, picks);
      if (!result) lastRight = s;
      else {
        progressTrack.miss();
        if (view) track.replay(view.stage, "is-nudge");
        track.later(function () { track.replay(root.querySelector("#zsa-ptr-work .zsa-feedback--wrong"), "is-again"); });
      }
      return result;
    },
    trail: function (entry, s) { var q = entry.item; return zsa.cap(plain(ui.trail[s], q)); },
    explain: function (entry, s) { var q = entry.item; return zsa.cap(plain(ui.explain[s], q)); },
    summary: summary,
    stats: ui.stats.map(function (label, i) { return [String(i), label]; }),
    reminder: function (q) { return zsa.cap(plain(ui.reminder, q)); },
    // Practice my misses: the missed questions, then others on the same trend and relation, up to 6.
    missesRound: function (missed) {
      var keys = new Set(missed.map(function (q) { return q.prop + q.relation; }));
      var others = zsa.shuffle(data.items.filter(function (q) { return keys.has(q.prop + q.relation) && missed.indexOf(q) < 0; }));
      return zsa.shuffle(missed.concat(others.slice(0, Math.max(0, 6 - missed.length)))).map(function (q) { return {item: q}; });
    }
  });

  var select = root.querySelector("#zsa-ptr-select");
  ui.practice.forEach(function (p) { if (p[0] === "mixed") return; var o = node("option", "", p[1]); o.value = p[0]; select.appendChild(o); });
  function trendStart(prop) { return zsa.shuffle(trendRound(prop, 6)).map(function (q) { return {item: q}; }); }
  // A round of one trend is not a full mixed round, so it gives no completion code (the engine gives one only to "mixed").
  root.querySelector("#zsa-ptr-new").addEventListener("click", function () { activity.start(mixed(), "mixed"); });
  root.querySelector("#zsa-ptr-pick").addEventListener("click", function () { activity.start(trendStart(select.value), "trend"); });

  // Links from a lesson: ?trend=radius (or en, ie) starts a round of one trend; ?q=<question id> one question.
  var params = new URLSearchParams(window.location.search);
  // "Back to the lesson" follows ?from= only for an https page on the zornscience.org host itself.
  var from = params.get("from");
  if (from) {
    try {
      var url = new URL(from);
      if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) root.querySelector("#zsa-ptr-back").href = url.href;
    } catch (e) { /* not a URL: keep the default link */ }
  }
  if (byId[params.get("q")]) activity.start([{item: byId[params.get("q")]}], "single", true);
  else if (ui.props[params.get("trend")]) { select.value = params.get("trend"); activity.start(trendStart(params.get("trend")), "trend", true); }
  else activity.start(mixed(), "mixed", true);
}());
