// Periodic Trends Practice: the steps, the misconception rules and the question strip. Everything else (rounds,
// review, tap to check, hints, Show me, the answer trail, summaries, the table, keyboard and focus) is the engine's.
// Questions and words come from data.js, which tools/build-data.js writes from the Periodic Table's data.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="periodic-trends"]');
  if (!root) return;
  var data, zsa;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail: {receive: function (value) { zsa = value; }}}));
  if (!data || !zsa) return;
  var ui = data.ui, node = zsa.node, els = data.elements;
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
        place: zsa.fill(ui.place[q.relation], {group: String(a.group), period: String(a.period)}).join(""), positionA: ui.position[q.relation]}
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
  function renderStrip(entry, strip) {
    var q = entry.item;
    var heading = node("h2", "zsa-ptr-title", zsa.cap(plain(ui.heading, q)));
    heading.id = "zsa-ptr-heading"; heading.tabIndex = -1;
    var caption = node("p", "zsa-ptr-caption", plain(ui.caption, q));
    caption.id = "zsa-ptr-caption";
    var progress = node("p", "zsa-progress"); progress.id = "zsa-ptr-progress";
    strip.appendChild(heading); strip.appendChild(caption); strip.appendChild(progress);
    return {heading: heading, progress: progress};
  }
  function summary(entry) {
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
    prefix: "zsa-ptr", strip: "zsa-ptr-pair", labels: ui.labels,
    pool: data.items, key: function (q) { return q.id; },
    round: mixed,
    table: {groups: data.groups, rows: data.table},
    marks: function (entry) { return {marked: [entry.item.a, entry.item.b]}; },
    renderStrip: renderStrip, steps: 3, step: step, classify: classify, message: message, hint: hint,
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
