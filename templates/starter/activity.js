// Starter activity logic: the steps, the misconception rules and the strip. Everything else (rounds, review,
// tap to check, hints, Show me, the answer trail, summaries, the table, keyboard and focus) is the engine's.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="starter"]');
  if (!root) return;
  var data, zsa;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail: {receive: function (value) { zsa = value; }}}));
  if (!data || !zsa) return;
  var ui = data.ui, node = zsa.node;

  // Slots for one element's text.
  function slots(e) {
    var kind = e.metal ? "metal" : "nonmetal", change = e.metal ? "loses" : "gains";
    return {name: e.name, group: String(e.group), moved: String(e.moved), kind: kind, change: change,
      electrons: e.moved + (e.moved === 1 ? " electron" : " electrons")};
  }
  function text(template, e) { return zsa.fill(template, slots(e)); }

  // Misconception rules: null when right, otherwise the feedback keys and the parts to clear.
  function classify(entry, s, picks) {
    var e = entry.item;
    if (s === 0) return picks.kind === (e.metal ? "metal" : "nonmetal") ? null : {keys: ["side"], wrong: ["kind"]};
    var rightDirection = picks.direction === (e.metal ? "loses" : "gains"), rightCount = picks.count === e.moved;
    if (rightDirection && rightCount) return null;
    if (!rightDirection && rightCount) return {keys: ["direction"], wrong: ["direction"]};
    if (rightDirection) return {keys: ["number"], wrong: ["count"]};
    return {keys: ["direction", "number"], wrong: ["direction", "count"]};
  }
  function step(entry, s) {
    if (s === 0) return {question: ui.questions[0], parts: [{name: "kind", values: ui.kinds, modifier: "two"}], hintGroups: [entry.item.group]};
    return {question: ui.questions[1], parts: [
      {name: "direction", values: ui.directions, modifier: "two"},
      {name: "count", values: [[1, "1"], [2, "2"], [3, "3"]], modifier: "three", legend: ui.countLegend}
    ]};
  }
  function renderStrip(entry, strip) {
    var heading = node("h2", "zsa-sta-title", zsa.cap(entry.item.name));
    heading.id = "zsa-sta-heading"; heading.tabIndex = -1;
    var caption = node("p", "zsa-sta-caption", zsa.speak(text(ui.caption, entry.item)));
    var progress = node("p", "zsa-progress"); progress.id = "zsa-sta-progress";
    strip.appendChild(heading); strip.appendChild(caption); strip.appendChild(progress);
    return {heading: heading, progress: progress};
  }

  var activity = zsa.create(root, {
    prefix: "zsa-sta", strip: "zsa-sta-strip", labels: ui.labels,
    pool: data.items, key: function (e) { return e.symbol; },
    // 6 different elements: at least 2 metals and 2 nonmetals.
    round: {quotas: [{test: function (e) { return e.metal; }, min: 2}, {test: function (e) { return !e.metal; }, min: 2}], size: 6},
    table: {groups: data.groups, rows: data.table},
    marks: function (entry) { return {marked: [entry.item.symbol]}; },
    renderStrip: renderStrip, steps: 2, step: step, classify: classify,
    message: function (entry, key) { return text(ui.feedback[key], entry.item); },
    hint: function (entry, s, level) { return text(ui.hints[s][level], entry.item); },
    trail: function (entry, s) { return text(ui.trail[s], entry.item); },
    explain: function (entry, s) { return text(ui.explain[s], entry.item); },
    summary: function (entry) { return [zsa.render(node("p"), text(ui.summary, entry.item))]; },
    stats: ui.stats.map(function (label, i) { return [String(i), label]; }),
    reminder: function (e) { return text(ui.explain[1], e); },
    // Practice my misses: the missed elements, then others on the same side of the table, up to 6.
    missesRound: function (missed) {
      var sides = new Set(missed.map(function (e) { return e.metal; }));
      var others = zsa.shuffle(data.items.filter(function (e) { return sides.has(e.metal) && missed.indexOf(e) < 0; }));
      return zsa.shuffle(missed.concat(others.slice(0, Math.max(0, 6 - missed.length)))).map(function (e) { return {item: e}; });
    }
  });

  var select = root.querySelector("#zsa-sta-select");
  data.items.forEach(function (e) { var opt = node("option", "", zsa.cap(e.name)); opt.value = e.symbol; select.appendChild(opt); });
  root.querySelector("#zsa-sta-new").addEventListener("click", function () { activity.start(activity.mixed(), "mixed"); });
  root.querySelector("#zsa-sta-pick").addEventListener("click", function () {
    activity.start([{item: data.items.find(function (e) { return e.symbol === select.value; })}], "single");
  });
  activity.start(activity.mixed(), "mixed", true);
}());
