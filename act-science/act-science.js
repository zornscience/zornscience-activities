// ACT Science Practice: start screen, passage pages (passage on the left, its questions on the right), and a score
// report with an estimated ACT Science score, a skill breakdown, tips and an answer review. Passages, skills and
// every word on the page come from data.js; scoring tables and national values from config.js. Both arrive through
// one-use events on the root. Figures are drawn here from the data as SVG and HTML tables.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act-science"]');
  if (!root) return;
  var data, cfg;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-config", {detail: {receive: function (value) { cfg = value; }}}));
  if (!data || !cfg) return;
  var ui = data.ui, SKILLS = data.skills;
  var bank = data.passages.filter(function (p) { return p.status === "reviewed"; });
  var app = root.querySelector("#zsa-act-app"), testbar = root.querySelector("#zsa-act-testbar"), bottom = root.querySelector("#zsa-act-bottom");
  var tools = root.querySelector("#zsa-act-tools"), dialog = root.querySelector("#zsa-act-dialog"), live = root.querySelector("#zsa-act-live"), alertBox = root.querySelector("#zsa-act-alert");
  var SVG = "http://www.w3.org/2000/svg";
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  var S = null, timer = null;

  // ---------- Small helpers ----------
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }
  function svg(tag, attrs, parent) {
    var el = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }
  function fill(template, ctx) { return String(template).replace(/\{(\w+)\}/g, function (m, k) { return ctx[k]; }); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function fmt(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  // Odd questions use A to D and even questions F to J, as on the ACT.
  function letters(n) { return n % 2 ? ["A", "B", "C", "D"] : ["F", "G", "H", "J"]; }
  function ordinal(n) { var s = n % 100; if (s >= 11 && s <= 13) return "th"; return ["th", "st", "nd", "rd"][n % 10] || "th"; }

  // Text from data.js may hold <sub>, <sup>, <em> and <strong>. Everything else is text, never markup.
  var TAG = /<(\/?)(sub|sup|em|strong)>/g;
  function rich(parent, markup) {
    var stack = [parent], last = 0, m;
    markup = String(markup);
    TAG.lastIndex = 0;
    while ((m = TAG.exec(markup))) {
      if (m.index > last) stack[stack.length - 1].appendChild(document.createTextNode(markup.slice(last, m.index)));
      if (m[1]) { if (stack.length > 1) stack.pop(); } else stack.push(stack[stack.length - 1].appendChild(document.createElement(m[2])));
      last = TAG.lastIndex;
    }
    if (last < markup.length) stack[stack.length - 1].appendChild(document.createTextNode(markup.slice(last)));
    return parent;
  }
  function plain(markup) { return String(markup).replace(TAG, ""); }
  // The same markup in SVG text: subscripts and superscripts become smaller, shifted tspans.
  function svgRich(textEl, markup, size) {
    var shift = 0, parts = String(markup).split(TAG);
    // split with two groups gives [text, slash, tag, text, slash, tag, ...]
    for (var i = 0; i < parts.length; i += 3) {
      var str = parts[i];
      if (str) {
        var t = svg("tspan", {}, textEl);
        t.textContent = str;
        var target = 0, open = parts[i - 1];
        if (i > 0 && !parts[i - 2] && open === "sub") target = size * 0.3;
        if (i > 0 && !parts[i - 2] && open === "sup") target = -size * 0.4;
        if (target) t.setAttribute("font-size", Math.round(size * 0.75));
        if (target !== shift) { t.setAttribute("dy", target - shift); shift = target; }
      }
    }
    return textEl;
  }

  // ---------- Figures ----------
  var SHAPES = ["circle", "square", "triangle", "diamond"];
  function marker(g, shape, x, y, cls) {
    if (shape === "circle") svg("circle", {cx: x, cy: y, r: 5, "class": cls}, g);
    else if (shape === "square") svg("rect", {x: x - 4.5, y: y - 4.5, width: 9, height: 9, "class": cls}, g);
    else if (shape === "triangle") svg("path", {d: "M" + x + " " + (y - 6) + " L" + (x + 6) + " " + (y + 5) + " L" + (x - 6) + " " + (y + 5) + " Z", "class": cls}, g);
    else svg("path", {d: "M" + x + " " + (y - 6) + " L" + (x + 6) + " " + y + " L" + x + " " + (y + 6) + " L" + (x - 6) + " " + y + " Z", "class": cls}, g);
  }
  function legendKey(shape, i) {
    var s = svg("svg", {viewBox: "0 0 28 16", width: 28, height: 16, "aria-hidden": "true", focusable: "false"});
    svg("line", {x1: 1, x2: 27, y1: 8, y2: 8, "class": "zsa-act-series zsa-act-s" + (i + 1)}, s);
    marker(s, shape, 14, 8, "zsa-act-dot zsa-act-s" + (i + 1));
    return s;
  }
  // A screen reader table with the values behind a graph, which itself is hidden from screen readers.
  function dataTable(b) {
    var t = node("table", "zsa-sr-only");
    var cap = node("caption");
    cap.textContent = fill(ui.figureData, {caption: b.caption});
    t.appendChild(cap);
    var head = t.appendChild(node("thead")).appendChild(node("tr"));
    rich(head.appendChild(node("th")), b.xLabel).setAttribute("scope", "col");
    b.series.forEach(function (s) { var th = head.appendChild(node("th", null, s.name)); th.setAttribute("scope", "col"); });
    var body = t.appendChild(node("tbody"));
    b.x.forEach(function (x, i) {
      var tr = body.appendChild(node("tr"));
      var th = tr.appendChild(node("th", null, String(x)));
      th.setAttribute("scope", "row");
      b.series.forEach(function (s) { tr.appendChild(node("td", null, String(s.values[i]))); });
    });
    return t;
  }
  function lineChart(b) {
    var fig = node("figure", "zsa-act-figure");
    var legend = node("ul", "zsa-act-legend");
    legend.setAttribute("aria-hidden", "true");
    b.series.forEach(function (s, i) {
      var li = legend.appendChild(node("li"));
      li.appendChild(legendKey(SHAPES[i % SHAPES.length], i));
      li.appendChild(node("span", null, s.name));
    });
    fig.appendChild(legend);
    var W = 480, H = 300, L = 58, R = 14, T = 14, B = 54, FS = 14;
    var chart = svg("svg", {viewBox: "0 0 " + W + " " + H, "class": "zsa-act-chart", "aria-hidden": "true", focusable: "false"});
    var x0 = b.x[0], x1 = b.x[b.x.length - 1];
    function sx(v) { return L + (v - x0) / (x1 - x0) * (W - L - R); }
    function sy(v) { return H - B - v / b.yMax * (H - T - B); }
    for (var v = 0; v <= b.yMax; v += b.yStep) {
      svg("line", {x1: L, x2: W - R, y1: sy(v), y2: sy(v), "class": "zsa-act-grid"}, chart);
      svg("text", {x: L - 8, y: sy(v) + 5, "text-anchor": "end", "font-size": FS}, chart).textContent = v;
    }
    b.x.forEach(function (xv) { svg("text", {x: sx(xv), y: H - B + 20, "text-anchor": "middle", "font-size": FS}, chart).textContent = xv; });
    svg("line", {x1: L, x2: W - R, y1: H - B, y2: H - B, "class": "zsa-act-axis"}, chart);
    svg("line", {x1: L, x2: L, y1: T, y2: H - B, "class": "zsa-act-axis"}, chart);
    svgRich(svg("text", {x: (L + W - R) / 2, y: H - 10, "text-anchor": "middle", "font-size": FS + 1, "font-weight": 700}, chart), b.xLabel, FS + 1);
    var my = (T + H - B) / 2;
    svgRich(svg("text", {x: 0, y: 0, "text-anchor": "middle", "font-size": FS + 1, "font-weight": 700, transform: "translate(18 " + my + ") rotate(-90)"}, chart), b.yLabel, FS + 1);
    b.series.forEach(function (s, i) {
      var g = svg("g", {}, chart), cls = "zsa-act-s" + (i + 1);
      svg("polyline", {points: b.x.map(function (xv, j) { return sx(xv) + "," + sy(s.values[j]); }).join(" "), "class": "zsa-act-series " + cls}, g);
      b.x.forEach(function (xv, j) { marker(g, SHAPES[i % SHAPES.length], sx(xv), sy(s.values[j]), "zsa-act-dot " + cls); });
    });
    fig.appendChild(chart);
    fig.appendChild(dataTable(b));
    fig.appendChild(node("figcaption", null, b.caption));
    return fig;
  }
  function table(b) {
    var wrap = node("div", "zsa-act-tbl");
    var t = wrap.appendChild(node("table"));
    t.appendChild(node("caption", null, b.caption));
    var head = t.appendChild(node("thead")).appendChild(node("tr"));
    b.headers.forEach(function (h) { rich(head.appendChild(node("th")), h).setAttribute("scope", "col"); });
    var body = t.appendChild(node("tbody"));
    b.rows.forEach(function (r) {
      var tr = body.appendChild(node("tr"));
      r.forEach(function (c) { rich(tr.appendChild(node("td")), c); });
    });
    return wrap;
  }
  // A labeled diagram from a list of shapes. Colors are named tones, drawn with classes so they follow dark mode.
  function diagram(b) {
    var fig = node("figure", "zsa-act-figure");
    var d = svg("svg", {viewBox: "0 0 " + b.viewBox[0] + " " + b.viewBox[1], "class": "zsa-act-diagram", role: "img", "aria-label": b.label}, fig);
    b.shapes.forEach(function (s) {
      var a = {"class": "zsa-act-f-" + (s.fill || "none") + (s.stroke ? " zsa-act-k-" + s.stroke : "")};
      if (s.width) a["stroke-width"] = s.width;
      if (s.shape === "path") a.d = s.d;
      if (s.shape === "rect") { a.x = s.x; a.y = s.y; a.width = s.w; a.height = s.h; }
      if (s.shape === "line") { a.x1 = s.x1; a.y1 = s.y1; a.x2 = s.x2; a.y2 = s.y2; }
      if (s.shape === "circle") { a.cx = s.cx; a.cy = s.cy; a.r = s.r; }
      if (s.shape === "text") {
        a = {x: s.x, y: s.y, "font-size": s.size || 13, "text-anchor": s.anchor || "start", "class": "zsa-act-f-ink"};
        svgRich(svg("text", a, d), s.text, s.size || 13);
        return;
      }
      svg(s.shape, a, d);
    });
    fig.appendChild(node("figcaption", null, b.caption));
    return fig;
  }
  function renderBody(p) {
    var out = [];
    p.body.forEach(function (b) {
      if (b.kind === "text") out.push(rich(node("p"), b.html));
      else if (b.kind === "heading") out.push(node("h2", null, b.text));
      else if (b.kind === "viewpoint") {
        var v = node("div", "zsa-act-view");
        v.appendChild(node("h2", null, b.label));
        v.appendChild(rich(node("p"), b.html));
        out.push(v);
      } else if (b.kind === "table") out.push(table(b));
      else if (b.kind === "lineChart") out.push(lineChart(b));
      else if (b.kind === "diagram") out.push(diagram(b));
    });
    return out;
  }

  // ---------- Screens ----------
  function show(children, focusEl) {
    app.replaceChildren.apply(app, children);
    window.scrollTo(0, 0);
    if (focusEl) focusEl.focus();
  }
  function button(text, cls, onClick) {
    var b = node("button", "zsa-btn" + (cls ? " " + cls : ""), text);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }
  function heading(tag, text) { var h = node(tag, null, text); h.tabIndex = -1; return h; }

  // Three passages, one of each type when the bank has them.
  function mixedSet() {
    var picked = [], rest = [];
    shuffle(bank).forEach(function (p) {
      if (!picked.some(function (q) { return q.type === p.type; })) picked.push(p); else rest.push(p);
    });
    return shuffle(picked.concat(rest.slice(0, Math.max(0, 3 - picked.length))));
  }
  // A full section: the configured mix of passage types (3, 3 and 1) adding up to exactly 40 questions.
  // Returns null until the reviewed bank can make one, which keeps the mode hidden.
  function choose(arr, k) {
    if (!k) return [[]];
    var out = [];
    arr.forEach(function (x, i) { choose(arr.slice(i + 1), k - 1).forEach(function (c) { out.push([x].concat(c)); }); });
    return out;
  }
  function fullSet() {
    var groups = Object.keys(cfg.fullMix).map(function (t) { return choose(shuffle(bank.filter(function (p) { return p.type === t; })), cfg.fullMix[t]); });
    var found = null;
    (function walk(gi, picked) {
      if (found) return;
      if (gi === groups.length) { if (minutesFor(picked) === cfg.fullQuestions) found = picked; return; }
      groups[gi].forEach(function (c) { walk(gi + 1, picked.concat(c)); });
    }(0, []));
    return found && shuffle(found);
  }
  function startMode(mode) {
    if (mode === "full") start(fullSet(), "full");
    else if (mode === "mixed") start(mixedSet(), "mixed");
    else start([shuffle(bank)[0]], "one");
  }
  function modeName(mode) { return {one: ui.modeOne, mixed: ui.modeMixed, full: ui.modeFull}[mode]; }
  function minutesFor(passages) { return passages.reduce(function (n, p) { return n + p.questions.length; }, 0); }

  function intro(focusIt) {
    if (S) leaveTest();
    S = null;
    var grid = node("div", "zsa-act-intro");
    var left = grid.appendChild(node("div"));
    left.appendChild(node("p", "zsa-eyebrow", ui.eyebrow));
    var h1 = left.appendChild(heading("h1", ui.title));
    left.appendChild(node("p", "zsa-act-lede", ui.lede));
    var modes = left.appendChild(node("div", "zsa-act-modes"));
    var sample = mixedSet();
    var modeList = [[ui.modeOne, ui.modeOneText, function () { startMode("one"); }],
      [ui.modeMixed, fill(ui.modeMixedText, {passages: sample.length, minutes: minutesFor(sample)}), function () { startMode("mixed"); }]];
    if (fullSet()) modeList.push([ui.modeFull, fill(ui.modeFullText, {count: cfg.fullQuestions}), function () { startMode("full"); }]);
    modeList.forEach(function (m) {
      var b = button("", "zsa-act-mode", m[2]);
      b.appendChild(node("strong", null, m[0]));
      b.appendChild(node("span", null, m[1]));
      modes.appendChild(b);
    });
    var aside = grid.appendChild(node("aside", "zsa-act-facts"));
    aside.setAttribute("aria-labelledby", "zsa-act-facts-title");
    aside.appendChild(node("h2", null, ui.factsTitle)).id = "zsa-act-facts-title";
    var ctx = {avg: cfg.natAvg, avgClass: cfg.avgClass, benchmark: cfg.benchmark};
    var dl = aside.appendChild(node("dl"));
    ui.facts.forEach(function (f) {
      var row = dl.appendChild(node("div", "zsa-act-fact"));
      row.appendChild(node("dt", null, fill(f[0], ctx)));
      row.appendChild(node("dd", null, fill(f[1], ctx)));
    });
    aside.appendChild(node("p", "zsa-act-note", ui.factsNote));
    show([grid], focusIt ? h1 : null);
  }

  // ---------- The section: directions, one question at a time, navigator, timer, review ----------
  function start(passages, mode) {
    var n = 0, qs = [];
    var items = passages.map(function (p, pi) {
      return {p: p, qs: p.questions.map(function (q) {
        n += 1;
        var item = Object.assign({}, q, {n: n, pi: pi});
        qs.push(item);
        return item;
      })};
    });
    S = {items: items, qs: qs, mode: mode, total: n, cur: 0, answers: {}, flags: {}, limit: mode === "one" ? null : n * 60,
      t0: null, elapsed: 0, hidden: false, warned: false, ended: false, timeUp: false, panes: {}};
    directionsScreen();
  }

  function directionsContent(parent, titleTag) {
    var h = parent.appendChild(heading(titleTag, ui.directionsTitle));
    var minutes = S.limit / 60;
    parent.appendChild(node("p", null, fill(ui.directionsIntro, {passages: S.items.length, passageWord: S.items.length > 1 ? "passages" : "passage", count: S.total})));
    parent.appendChild(node("p", null, S.limit ? fill(ui.directionsTimed, {minutes: minutes}) : ui.directionsUntimed));
    var ul = parent.appendChild(node("ul", "zsa-act-directions"));
    ui.directionsList.forEach(function (t) { ul.appendChild(node("li", null, t)); });
    return h;
  }
  function directionsScreen() {
    stopClock();
    var box = node("section", "zsa-act-dir-screen");
    box.appendChild(node("p", "zsa-eyebrow", modeName(S.mode)));
    var h1 = directionsContent(box, "h1");
    var row = box.appendChild(node("div", "zsa-act-row"));
    row.appendChild(button(ui.back, "", function () { intro(true); }));
    row.appendChild(button(ui.startSection, "zsa-btn--primary", beginSection));
    show([box], h1);
  }
  function openDirections() {
    dialog.replaceChildren();
    var h = directionsContent(dialog, "h2");
    h.id = "zsa-act-dialog-title";
    var row = dialog.appendChild(node("div", "zsa-act-row"));
    var closeBtn = row.appendChild(button(ui.close, "zsa-btn--primary", function () { dialog.close(); }));
    dialog.showModal();
    closeBtn.focus();
  }

  // ----- Timer: counts down in timed practice, up in untimed practice. Time comes from the clock, not from ticks.
  function elapsed() { return S.t0 === null ? S.elapsed : S.elapsed + Math.floor((Date.now() - S.t0) / 1000); }
  function stopClock() { if (timer) clearInterval(timer); timer = null; }
  var timeText = null;
  function tick() {
    var used = elapsed();
    if (S.limit && used >= S.limit) { endSection(true); return; }
    var shownSecs = S.limit ? S.limit - used : used;
    timeText.textContent = S.hidden ? ui.timerHidden : fmt(shownSecs);
    S.timerLabel.textContent = S.hidden ? "" : (S.limit ? ui.timeLeft : ui.timeUsedLabel) + " ";
    if (S.limit && !S.warned && S.limit > 300 && S.limit - used <= 300) {
      S.warned = true;
      var box = node("div", "zsa-act-notice");
      box.appendChild(node("p", null, ui.fiveLeft));
      box.appendChild(button(ui.dismiss, "", function () { alertBox.replaceChildren(); }));
      alertBox.replaceChildren(box);
    }
  }
  function buildTestbar() {
    testbar.replaceChildren();
    S.label = testbar.appendChild(node("p", "zsa-act-bar-label"));
    var clockBox = testbar.appendChild(node("p", "zsa-act-timer"));
    clockBox.setAttribute("role", "timer");
    S.timerLabel = clockBox.appendChild(node("span", "zsa-act-timer-label", (S.limit ? ui.timeLeft : ui.timeUsedLabel) + " "));
    timeText = clockBox.appendChild(node("b", "zsa-act-time"));
    var hide = testbar.appendChild(button(ui.hideTimer, "zsa-act-bar-btn", function () {
      S.hidden = !S.hidden;
      hide.textContent = S.hidden ? ui.showTimer : ui.hideTimer;
      tick();
    }));
    testbar.appendChild(button(ui.directions, "zsa-act-bar-btn", openDirections));
    testbar.hidden = false;
    root.classList.add("zsa-act--testing");
  }
  function leaveTest() {
    stopClock();
    testbar.hidden = true;
    bottom.hidden = true;
    tools.hidden = true;
    alertBox.replaceChildren();
    root.classList.remove("zsa-act--testing", "zsa-act--review", "zsa-act--answers", "zsa-act--hl", "zsa-act--erase", "zsa-act--elim", "zsa-act--mask");
    if (dialog.open) dialog.close();
  }
  function beginSection() {
    S.t0 = Date.now();
    S.qpanes = {};
    S.pwrap = node("div", "zsa-act-pwrap");
    S.pwrap.appendChild(node("div"));
    buildReader(S.pwrap);
    buildTestbar();
    buildTools();
    buildBottom();
    tick();
    timer = setInterval(tick, 250);
    renderTest(0, "heading");
  }

  // ---------- Tools: highlighter, line reader, answer eliminator, answer masking, zoom ----------
  // Tool state lasts for one section. Panes are built once per section, so highlights, eliminations and masks stay.
  var T = null, ZOOMS = [100, 125, 150, 200], toolBtns = {}, hlOpts = null, justHighlighted = false;
  function icon(paths) {
    var s = svg("svg", {viewBox: "0 0 20 20", width: 18, height: 18, "aria-hidden": "true", focusable: "false", "class": "zsa-act-icon"});
    paths.forEach(function (d) { svg("path", {d: d}, s); });
    return s;
  }
  var ICONS = {
    highlight: ["M4 16 L7 13 L13 7 L15 9 L9 15 L6 16 Z", "M13 7 L15 5 L17 7 L15 9", "M3 18 H17"],
    reader: ["M2 5 H18", "M2 15 H18", "M4 9 H16", "M4 11 H13"],
    elim: ["M4 4 L16 16", "M16 4 L4 16"],
    mask: ["M2 10 C5 5 15 5 18 10 C15 15 5 15 2 10 Z", "M3 17 L17 3"],
    zoomIn: ["M8.5 3 A5.5 5.5 0 1 1 8.5 14 A5.5 5.5 0 1 1 8.5 3 Z", "M12.5 12.5 L17.5 17.5", "M6 8.5 H11", "M8.5 6 V11"],
    zoomOut: ["M8.5 3 A5.5 5.5 0 1 1 8.5 14 A5.5 5.5 0 1 1 8.5 3 Z", "M12.5 12.5 L17.5 17.5", "M6 8.5 H11"],
    eye: ["M2 10 C5 5 15 5 18 10 C15 15 5 15 2 10 Z", "M10 7.5 A2.5 2.5 0 1 1 10 12.5 A2.5 2.5 0 1 1 10 7.5 Z"]
  };
  function toolButton(key, label, onClick, cls) {
    var b = button("", "zsa-act-tool" + (cls ? " " + cls : ""), onClick);
    if (ICONS[key]) b.appendChild(icon(ICONS[key]));
    b.appendChild(node("span", null, label));
    return b;
  }
  function pressed(b, on) { b.setAttribute("aria-pressed", String(!!on)); }
  function buildTools() {
    T = {hl: false, color: "yellow", erase: false, reader: false, elim: false, mask: false, zoom: 0, y: 40, h: 78, count: 0};
    tools.replaceChildren();
    tools.setAttribute("aria-label", ui.tools);
    var row = tools.appendChild(node("div", "zsa-act-wrap zsa-act-toolrow-inner"));
    toolBtns.hl = row.appendChild(toolButton("highlight", ui.toolHighlight, function () { T.hl = !T.hl; T.erase = false; syncTools(); }));
    hlOpts = row.appendChild(node("span", "zsa-act-hl-opts"));
    hlOpts.setAttribute("role", "group");
    hlOpts.setAttribute("aria-label", ui.hlColors);
    toolBtns.colors = [["yellow", ui.yellow], ["green", ui.green], ["blue", ui.blue]].map(function (c) {
      var b = hlOpts.appendChild(button("", "zsa-act-swatch", function () { T.color = c[0]; T.erase = false; syncTools(); }));
      b.classList.add("zsa-act-swatch--color");
      b.appendChild(node("span", "zsa-act-swatch-dot zsa-act-hl--" + c[0])).setAttribute("aria-hidden", "true");
      b.appendChild(node("span", "zsa-act-vh", c[1]));
      b.value = c[0];
      return b;
    });
    toolBtns.erase = hlOpts.appendChild(button(ui.erase, "zsa-act-swatch", function () { T.erase = !T.erase; syncTools(); }));
    var apply = hlOpts.appendChild(button(ui.hlApply, "zsa-act-swatch", function () { applySelection(); }));
    // Keep the text selection when this button is pressed with a mouse.
    apply.addEventListener("mousedown", function (e) { e.preventDefault(); });
    hlOpts.appendChild(button(ui.hlClear, "zsa-act-swatch", clearHighlights));
    toolBtns.reader = row.appendChild(toolButton("reader", ui.toolReader, function () { T.reader = !T.reader; syncTools(); if (T.reader) S.readerHandle.focus(); }));
    toolBtns.elim = row.appendChild(toolButton("elim", ui.toolElim, function () { T.elim = !T.elim; syncTools(); }));
    toolBtns.mask = row.appendChild(toolButton("mask", ui.toolMask, function () { T.mask = !T.mask; syncTools(); }));
    var zoom = row.appendChild(node("span", "zsa-act-zoom"));
    zoom.setAttribute("role", "group");
    zoom.setAttribute("aria-label", ui.zoomLabel);
    toolBtns.zoomOut = zoom.appendChild(toolButton("zoomOut", ui.zoomOut, function () { setZoom(T.zoom - 1); }, "zsa-act-tool--icon"));
    toolBtns.zoomVal = zoom.appendChild(node("span", "zsa-act-zoom-val"));
    toolBtns.zoomIn = zoom.appendChild(toolButton("zoomIn", ui.zoomIn, function () { setZoom(T.zoom + 1); }, "zsa-act-tool--icon"));
    tools.hidden = false;
    syncTools();
  }
  function setZoom(z) {
    T.zoom = Math.max(0, Math.min(ZOOMS.length - 1, z));
    syncTools();
    live.textContent = fill(ui.zoomAnnounce, {pct: ZOOMS[T.zoom]});
  }
  function syncTools() {
    pressed(toolBtns.hl, T.hl);
    hlOpts.hidden = !T.hl;
    toolBtns.colors.forEach(function (b) { pressed(b, !T.erase && T.color === b.value); });
    pressed(toolBtns.erase, T.erase);
    pressed(toolBtns.reader, T.reader);
    pressed(toolBtns.elim, T.elim);
    pressed(toolBtns.mask, T.mask);
    root.classList.toggle("zsa-act--hl", T.hl);
    root.classList.toggle("zsa-act--erase", T.hl && T.erase);
    root.classList.toggle("zsa-act--elim", T.elim);
    root.classList.toggle("zsa-act--mask", T.mask);
    toolBtns.zoomOut.disabled = T.zoom === 0;
    toolBtns.zoomIn.disabled = T.zoom === ZOOMS.length - 1;
    toolBtns.zoomVal.textContent = ZOOMS[T.zoom] + "%";
    ZOOMS.forEach(function (z, k) { S.pwrap.classList.toggle("zsa-act-z" + k, k === T.zoom && k > 0); });
    S.reader.toggleAttribute("hidden", !T.reader);
    drawReader();
  }

  // ----- Highlighter: wraps selected text (passage text, question stems and choices, never figures) in <mark>.
  function highlightable(t) {
    var el = t.parentNode;
    if (!el || !el.closest) return false;
    if (!el.closest(".zsa-act-passage, .zsa-act-q-stem, .zsa-act-choice-text")) return false;
    return !el.closest("svg, figure, .zsa-act-tbl, .zsa-sr-only, .zsa-act-kind") && /\S/.test(t.nodeValue);
  }
  function unwrap(mark) {
    var parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }
  function unwrapGroup(id) { [].slice.call(root.querySelectorAll('mark[data-hl="' + id + '"]')).forEach(unwrap); }
  function applySelection() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return false;
    var range = sel.getRangeAt(0), parts = [];
    var walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var t = walker.currentNode;
      if (!range.intersectsNode(t) || !highlightable(t)) continue;
      var s = t === range.startContainer ? range.startOffset : 0;
      var e = t === range.endContainer ? range.endOffset : t.nodeValue.length;
      if (e > s) parts.push([t, s, e]);
    }
    if (!parts.length) return false;
    T.count += 1;
    var id = "h" + T.count, changed = false;
    parts.forEach(function (p) {
      var t = p[0], old = t.parentNode.closest("mark.zsa-act-hl");
      if (T.erase) { if (old) { unwrapGroup(old.getAttribute("data-hl")); changed = true; } return; }
      if (old) { old.className = "zsa-act-hl zsa-act-hl--" + T.color; changed = true; return; }
      if (p[2] < t.nodeValue.length) t.splitText(p[2]);
      var mid = p[1] > 0 ? t.splitText(p[1]) : t;
      var m = document.createElement("mark");
      m.className = "zsa-act-hl zsa-act-hl--" + T.color;
      m.setAttribute("data-hl", id);
      mid.parentNode.replaceChild(m, mid);
      m.appendChild(mid);
      changed = true;
    });
    sel.removeAllRanges();
    if (changed) live.textContent = T.erase ? ui.hlRemoved : ui.hlAdded;
    return changed;
  }
  function clearHighlights() {
    var q = S.qpanes[S.cur], art = S.panes[S.qs[S.cur].pi];
    [art, q && q.pane].forEach(function (el) { if (el) [].slice.call(el.querySelectorAll("mark.zsa-act-hl")).forEach(unwrap); });
    live.textContent = ui.hlCleared;
  }
  // With the highlighter on, a mouse selection is highlighted when the button is released, and the click that
  // follows does not pick the answer under it. Erase mode removes a highlight with a click.
  app.addEventListener("mouseup", function () {
    if (S && T && T.hl && S.screen === "test") justHighlighted = applySelection();
  });
  app.addEventListener("click", function (e) {
    if (!S || !T || !T.hl || S.screen !== "test") return;
    var mark = e.target.closest && e.target.closest("mark.zsa-act-hl");
    if (justHighlighted || (T.erase && mark)) {
      e.preventDefault();
      if (!justHighlighted && mark) { unwrapGroup(mark.getAttribute("data-hl")); live.textContent = ui.hlRemoved; }
    }
    justHighlighted = false;
  }, true);

  // ----- Line reader: an SVG band over the passage pane. The text outside the band is covered; the pane still scrolls.
  var LINE = 26;
  function buildReader(wrap) {
    var r = svg("svg", {"class": "zsa-act-reader", width: "100%", height: "100%"}, wrap);
    r.setAttribute("hidden", "");
    var shadeTop = svg("rect", {x: 0, width: "100%", y: 0, "class": "zsa-act-reader-shade"}, r);
    var shadeBottom = svg("rect", {x: 0, width: "100%", height: 4000, "class": "zsa-act-reader-shade"}, r);
    var handle = svg("g", {tabindex: 0, role: "slider", "aria-label": ui.readerLabel, "aria-orientation": "vertical", "class": "zsa-act-reader-handle"}, r);
    var frame = svg("rect", {x: 1, width: "100%", rx: 4, "class": "zsa-act-reader-frame"}, handle);
    var grip = svg("rect", {width: 34, rx: 6, "class": "zsa-act-reader-grip"}, handle);
    var topEdge = svg("rect", {x: 0, width: "100%", height: 12, "class": "zsa-act-reader-edge"}, handle);
    var bottomEdge = svg("rect", {x: 0, width: "100%", height: 12, "class": "zsa-act-reader-edge"}, handle);
    S.reader = r;
    S.readerHandle = handle;
    S.readerParts = {shadeTop: shadeTop, shadeBottom: shadeBottom, frame: frame, grip: grip, topEdge: topEdge, bottomEdge: bottomEdge};
    function drag(el, mode) {
      el.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        var y0 = e.clientY, start = {y: T.y, h: T.h};
        function move(ev) {
          var d = ev.clientY - y0;
          if (mode === "move") T.y = start.y + d;
          if (mode === "top") { T.y = start.y + d; T.h = start.h - d; }
          if (mode === "bottom") T.h = start.h + d;
          drawReader();
        }
        function up() { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); }
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      });
    }
    drag(grip, "move");
    drag(topEdge, "top");
    drag(bottomEdge, "bottom");
    handle.addEventListener("keydown", function (e) {
      var step = {ArrowUp: -LINE, ArrowDown: LINE, PageUp: -4 * LINE, PageDown: 4 * LINE}[e.key];
      if (e.key === "Home") T.y = 0;
      else if (e.key === "End") T.y = 1e6;
      else if (step === undefined) return;
      else if (e.shiftKey && Math.abs(step) === LINE) T.h += step;
      else T.y += step;
      e.preventDefault();
      drawReader();
    });
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(drawReader).observe(wrap);
  }
  function drawReader() {
    if (!S || !S.reader || S.reader.hasAttribute("hidden") || !T) return;
    var H = S.pwrap.clientHeight, W = S.pwrap.clientWidth, p = S.readerParts;
    T.h = Math.max(LINE, Math.min(H, Math.round(T.h)));
    T.y = Math.max(0, Math.min(H - T.h, Math.round(T.y)));
    p.shadeTop.setAttribute("height", T.y);
    p.shadeBottom.setAttribute("y", T.y + T.h);
    p.frame.setAttribute("y", T.y);
    p.frame.setAttribute("height", T.h);
    p.frame.setAttribute("width", Math.max(0, W - 2));
    p.grip.setAttribute("x", Math.max(0, W - 40));
    p.grip.setAttribute("y", T.y + T.h / 2 - Math.min(22, T.h / 2 - 2));
    p.grip.setAttribute("height", Math.min(44, T.h - 4));
    p.topEdge.setAttribute("y", T.y - 6);
    p.bottomEdge.setAttribute("y", T.y + T.h - 6);
    var h = S.readerHandle, pct = function (v) { return Math.round(v / Math.max(1, H) * 100); };
    h.setAttribute("aria-valuemin", 0);
    h.setAttribute("aria-valuemax", Math.max(0, H - T.h));
    h.setAttribute("aria-valuenow", T.y);
    h.setAttribute("aria-valuetext", fill(ui.readerValue, {from: pct(T.y), to: pct(T.y + T.h)}));
  }

  // ----- Question view
  function passagePane(pi) {
    if (S.panes[pi]) return S.panes[pi];
    var p = S.items[pi].p;
    var art = node("article", "zsa-act-passage");
    art.setAttribute("aria-label", fill(ui.passageRegion, {roman: ROMAN[pi]}));
    art.tabIndex = 0; // it scrolls on its own, so it must be reachable by keyboard
    art.appendChild(node("p", "zsa-act-kind", fill(ui.passageLabel, {roman: ROMAN[pi], type: p.type})));
    art.appendChild(node("h1", null, p.title));
    renderBody(p).forEach(function (el) { art.appendChild(el); });
    S.panes[pi] = art;
    return art;
  }
  function questionPane(q) {
    var pane = node("section", "zsa-act-qpane");
    pane.setAttribute("aria-labelledby", "zsa-act-qtitle");
    var head = pane.appendChild(node("div", "zsa-act-qhead"));
    var h = head.appendChild(heading("h2", fill(ui.question, {n: q.n})));
    h.id = "zsa-act-qtitle";
    h.appendChild(node("span", "zsa-sr-only", fill(ui.ofTotal, {total: S.total})));
    var flag = head.appendChild(button("", "zsa-act-flag", function () {
      S.flags[q.n] = !S.flags[q.n];
      flag.setAttribute("aria-pressed", String(!!S.flags[q.n]));
      updateNav();
    }));
    flag.appendChild(flagIcon());
    flag.appendChild(node("span", null, ui.flag));
    flag.setAttribute("aria-pressed", String(!!S.flags[q.n]));
    var fs = pane.appendChild(node("fieldset", "zsa-act-q"));
    rich(fs.appendChild(node("legend", "zsa-act-q-stem")), q.stem);
    var list = fs.appendChild(node("div", "zsa-act-choices"));
    q.choices.forEach(function (c, i) {
      var id = "zsa-act-q" + q.n + "-" + i, letter = letters(q.n)[i];
      var row = list.appendChild(node("div", "zsa-act-choice-row"));
      var lab = row.appendChild(node("label", "zsa-act-choice"));
      lab.htmlFor = id;
      var input = lab.appendChild(node("input"));
      input.type = "radio"; input.name = "zsa-act-q" + q.n; input.id = id; input.value = String(i);
      input.checked = S.answers[q.n] === i;
      input.addEventListener("change", function () { S.answers[q.n] = i; updateNav(); });
      lab.appendChild(node("span", "zsa-act-letter", letter)).setAttribute("aria-hidden", "true");
      var body = lab.appendChild(node("span"));
      body.appendChild(node("span", "zsa-sr-only", letter + ". "));
      var txt = rich(body.appendChild(node("span", "zsa-act-choice-text")), c);
      var maskText = body.appendChild(node("span", "zsa-act-masked", ui.choiceHidden));
      maskText.hidden = true;
      var struck = body.appendChild(node("span", "zsa-sr-only", ui.eliminated));
      struck.hidden = true;
      var tools = row.appendChild(node("span", "zsa-act-choice-tools"));
      // A struck choice can still be picked. A hidden choice keeps its letter and its radio button.
      var x = tools.appendChild(button("", "zsa-act-elim-btn", function () {
        var on = x.getAttribute("aria-pressed") !== "true";
        pressed(x, on);
        lab.classList.toggle("zsa-act-struck", on);
        struck.hidden = !on;
      }));
      x.appendChild(icon(ICONS.elim));
      x.setAttribute("aria-label", fill(ui.eliminate, {letter: letter}));
      pressed(x, false);
      var m = tools.appendChild(button("", "zsa-act-mask-btn", function () {
        var on = m.getAttribute("aria-pressed") !== "true";
        pressed(m, on);
        lab.classList.toggle("zsa-act-is-masked", on);
        txt.hidden = on;
        maskText.hidden = !on;
        m.replaceChildren(icon(on ? ICONS.eye : ICONS.mask));
      }));
      m.appendChild(icon(ICONS.mask));
      m.setAttribute("aria-label", fill(ui.hideChoice, {letter: letter}));
      pressed(m, false);
    });
    return {pane: pane, heading: h};
  }
  function flagIcon() {
    var s = svg("svg", {viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": "true", focusable: "false", "class": "zsa-act-flag-icon"});
    svg("path", {d: "M3 1.5 V15", "class": "zsa-act-flag-pole"}, s);
    svg("path", {d: "M3.5 2 H13 L10.5 5.5 L13 9 H3.5 Z", "class": "zsa-act-flag-cloth"}, s);
    return s;
  }
  // focus: "heading" moves focus to the question heading; "keep" leaves it where it is (Previous and Next).
  function renderTest(i, focus) {
    if (S.ended) return;
    var narrow = window.matchMedia("(max-width: 900px)").matches;
    var prevPi = S.screen === "test" ? S.qs[S.cur].pi : -1;
    S.cur = i;
    S.screen = "test";
    root.classList.remove("zsa-act--review");
    bottom.hidden = false;
    tools.hidden = false;
    var q = S.qs[i];
    var built = S.qpanes[i] || (S.qpanes[i] = questionPane(q));
    placePanes(q, built.pane);
    S.label.textContent = fill(ui.barLabel, {n: q.pi + 1, total: S.items.length});
    updateNav();
    if (narrow) {
      if (q.pi !== prevPi) window.scrollTo(0, 0); else built.pane.scrollIntoView({block: "start"});
    } else window.scrollTo(0, 0);
    drawReader();
    if (focus === "heading") built.heading.focus();
    else live.textContent = fill(ui.announce, {n: q.n, total: S.total});
  }

  // ----- Bottom bar: Previous, the numbered navigator (one Tab stop, arrow keys move), Next
  var navButtons = [], prevBtn, nextBtn;
  function chevron(dir) {
    var s = svg("svg", {viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": "true", focusable: "false"});
    svg("path", {d: dir < 0 ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13", "class": "zsa-act-chev"}, s);
    return s;
  }
  function navState(q) {
    var parts = [S.answers[q.n] !== undefined ? ui.answered : ui.unanswered];
    if (S.flags[q.n]) parts.push(ui.flagged);
    return parts.join(", ");
  }
  function styleNavButton(b, q, current) {
    if (S.ended) {
      // Answer view: correct, missed or not answered instead of answered and flagged.
      var mine = S.answers[q.n], state = mine === q.answer ? ui.stateCorrect : mine === undefined ? ui.unanswered : ui.stateMissed;
      b.classList.remove("zsa-act-is-answered", "zsa-act-is-flagged");
      b.classList.toggle("zsa-act-is-correct", mine === q.answer);
      b.classList.toggle("zsa-act-is-missed", mine !== undefined && mine !== q.answer);
      if (current) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.setAttribute("aria-label", fill(ui.navItem, {n: q.n}) + ", " + state);
      return;
    }
    b.classList.toggle("zsa-act-is-answered", S.answers[q.n] !== undefined);
    b.classList.toggle("zsa-act-is-flagged", !!S.flags[q.n]);
    if (current) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    b.setAttribute("aria-label", fill(ui.navItem, {n: q.n}) + ", " + navState(q));
  }
  function buildBottom() {
    bottom.replaceChildren();
    bottom.setAttribute("aria-label", ui.navLabel);
    var row = bottom.appendChild(node("div", "zsa-act-wrap zsa-act-bottom-row"));
    prevBtn = row.appendChild(button("", "zsa-act-step", function () { if (S.cur > 0) openQuestion(S.cur - 1, "keep"); }));
    prevBtn.appendChild(chevron(-1));
    prevBtn.appendChild(node("span", "zsa-act-step-text", ui.previous));
    var strip = row.appendChild(node("div", "zsa-act-strip"));
    strip.setAttribute("role", "toolbar");
    strip.setAttribute("aria-label", ui.navLabel);
    navButtons = S.qs.map(function (q, i) {
      var b = strip.appendChild(button(String(q.n), "zsa-act-num" + (i && q.pi !== S.qs[i - 1].pi ? " zsa-act-num--first" : ""), function () { openQuestion(i, "heading"); }));
      b.addEventListener("keydown", function (e) {
        var to = {ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: navButtons.length - 1}[e.key];
        if (to === undefined) return;
        e.preventDefault();
        to = Math.max(0, Math.min(navButtons.length - 1, to));
        navButtons.forEach(function (x, k) { x.tabIndex = k === to ? 0 : -1; });
        navButtons[to].focus();
      });
      return b;
    });
    nextBtn = row.appendChild(button("", "zsa-act-step zsa-act-step--next", function () {
      if (S.cur < S.total - 1) openQuestion(S.cur + 1, "keep"); else if (S.ended) closeAnswers(); else reviewScreen();
    }));
    nextBtn.appendChild(node("span", "zsa-act-step-text"));
    nextBtn.appendChild(chevron(1));
  }
  function updateNav() {
    navButtons.forEach(function (b, i) {
      var onQ = S.screen === "test" || S.screen === "answers", cur = onQ && i === S.cur;
      styleNavButton(b, S.qs[i], cur);
      // The roving Tab stop follows the current question unless focus is inside the strip.
      if (!b.parentNode.contains(document.activeElement)) b.tabIndex = cur || (!onQ && !i) ? 0 : -1;
    });
    if (S.screen === "test" || S.screen === "answers") navButtons[S.cur].scrollIntoView({block: "nearest", inline: "nearest"});
    var first = S.cur === 0, last = S.cur === S.total - 1;
    if (first && document.activeElement === prevBtn) nextBtn.focus();
    prevBtn.disabled = first;
    prevBtn.setAttribute("aria-label", ui.previous);
    var lastLabel = S.ended ? ui.toReport : ui.toReview;
    nextBtn.querySelector(".zsa-act-step-text").textContent = last ? lastLabel : ui.next;
    nextBtn.setAttribute("aria-label", last ? lastLabel : ui.next);
  }

  // ----- Review screen and ending the section
  function numButton(q, onClick) {
    var b = button(String(q.n), "zsa-act-num", onClick);
    styleNavButton(b, q, false);
    return b;
  }
  function reviewScreen() {
    if (S.ended) return;
    S.screen = "review";
    root.classList.add("zsa-act--review");
    bottom.hidden = true;
    tools.hidden = true;
    S.label.textContent = ui.section + " · " + ui.reviewHeading;
    var answered = S.qs.filter(function (q) { return S.answers[q.n] !== undefined; });
    var blank = S.qs.filter(function (q) { return S.answers[q.n] === undefined; });
    var flagged = S.qs.filter(function (q) { return S.flags[q.n]; });
    var out = [];
    var h1 = heading("h1", ui.reviewHeading);
    out.push(h1);
    out.push(node("p", "zsa-act-review-counts", fill(ui.reviewCounts, {answered: answered.length, unanswered: blank.length, flagged: flagged.length, total: S.total})));
    out.push(node("p", "zsa-act-small", ui.reviewHint));
    var legend = node("ul", "zsa-act-legend-states");
    legend.setAttribute("aria-hidden", "true");
    [["", ui.legendUnanswered], ["zsa-act-is-answered", ui.legendAnswered], ["zsa-act-is-flagged", ui.legendFlagged]].forEach(function (l) {
      var li = legend.appendChild(node("li"));
      li.appendChild(node("span", "zsa-act-num zsa-act-num--sample " + l[0]));
      li.appendChild(node("span", null, l[1]));
    });
    out.push(legend);
    var groups = 0;
    function labelled(sec, h) { groups += 1; h.id = "zsa-act-rg" + groups; sec.setAttribute("aria-labelledby", h.id); }
    function group(title, list) {
      var sec = node("section", "zsa-act-review-group");
      labelled(sec, sec.appendChild(node("h2", null, title + " (" + list.length + ")")));
      if (!list.length) { sec.appendChild(node("p", "zsa-act-small", ui.reviewNone)); return sec; }
      var ul = sec.appendChild(node("ul", "zsa-act-num-list"));
      list.forEach(function (q) { ul.appendChild(node("li")).appendChild(numButton(q, function () { renderTest(S.qs.indexOf(q), "heading"); })); });
      return sec;
    }
    out.push(group(ui.reviewUnanswered, blank));
    out.push(group(ui.reviewFlagged, flagged));
    var all = node("section", "zsa-act-review-group");
    labelled(all, all.appendChild(node("h2", null, ui.reviewAll)));
    S.items.forEach(function (it, pi) {
      all.appendChild(node("h3", null, fill(ui.passageLabel, {roman: ROMAN[pi], type: it.p.type})));
      var ul = all.appendChild(node("ul", "zsa-act-num-list"));
      it.qs.forEach(function (q) { ul.appendChild(node("li")).appendChild(numButton(q, function () { renderTest(S.qs.indexOf(q), "heading"); })); });
    });
    out.push(all);
    var confirmBox = node("div");
    var row = node("div", "zsa-act-nav");
    row.appendChild(button(ui.returnToQuestions, "", function () { renderTest(S.cur, "heading"); }));
    row.appendChild(button(ui.endSection, "zsa-btn--primary", function () {
      var box = node("section", "zsa-act-confirm");
      box.setAttribute("aria-labelledby", "zsa-act-confirm-title");
      var h = box.appendChild(heading("h2", ui.endTitle));
      h.id = "zsa-act-confirm-title";
      box.appendChild(node("p", null, ui.endText));
      if (blank.length) box.appendChild(node("p", null, fill(ui.endBlank, {count: blank.length, questions: blank.length > 1 ? "questions" : "question"})));
      var r = box.appendChild(node("div", "zsa-act-row"));
      r.appendChild(button(ui.endNo, "", function () { confirmBox.replaceChildren(); h1.focus(); }));
      r.appendChild(button(ui.endYes, "zsa-btn--primary", function () { endSection(false); }));
      confirmBox.replaceChildren(box);
      h.focus();
    }));
    out.push(row);
    out.push(confirmBox);
    show(out, h1);
  }
  // ----- Answer view: after the section, any question opens read-only with its passage (and the student's highlights).
  function openQuestion(i, focus) { if (S.ended) renderAnswer(i, focus); else renderTest(i, focus); }
  function placePanes(q, pane) {
    var split = app.querySelector(".zsa-act-split");
    if (!split) {
      split = node("div", "zsa-act-split");
      split.appendChild(S.pwrap);
      app.replaceChildren(split);
    }
    var art = passagePane(q.pi);
    if (S.pwrap.firstChild !== art) S.pwrap.replaceChild(art, S.pwrap.firstChild);
    if (split.children[1]) split.replaceChild(pane, split.children[1]); else split.appendChild(pane);
  }
  function answerPane(q) {
    var L = letters(q.n), mine = S.answers[q.n], ok = mine === q.answer;
    var pane = node("section", "zsa-act-qpane zsa-act-apane");
    pane.setAttribute("aria-labelledby", "zsa-act-qtitle");
    var head = pane.appendChild(node("div", "zsa-act-qhead"));
    var h = head.appendChild(heading("h2", fill(ui.question, {n: q.n})));
    h.id = "zsa-act-qtitle";
    h.appendChild(node("span", "zsa-sr-only", fill(ui.ofTotal, {total: S.total})));
    var tag = head.appendChild(node("span", "zsa-act-tag " + (ok ? "zsa-act-ok" : "zsa-act-no"), ok ? ui.tagCorrect : mine === undefined ? ui.tagBlank : ui.tagMissed));
    void tag;
    pane.appendChild(rich(node("p", "zsa-act-q-stem"), q.stem));
    var list = pane.appendChild(node("ul", "zsa-act-alist"));
    list.setAttribute("aria-label", ui.choicesLabel);
    q.choices.forEach(function (c, i) {
      var li = list.appendChild(node("li", "zsa-act-achoice" + (i === q.answer ? " zsa-act-is-key" : "") + (i === mine && !ok ? " zsa-act-is-wrong" : "")));
      li.appendChild(node("span", "zsa-act-letter", L[i])).setAttribute("aria-hidden", "true");
      var body = li.appendChild(node("span"));
      body.appendChild(node("span", "zsa-sr-only", L[i] + ". "));
      rich(body, c);
      var marks = [];
      if (i === mine) marks.push(ui.yourAnswer);
      if (i === q.answer) marks.push(ui.correctAnswer);
      if (marks.length) li.appendChild(node("span", "zsa-act-badges", marks.join(" · ")));
    });
    if (mine === undefined) pane.appendChild(node("p", "zsa-act-small", ui.noAnswer));
    var ex = pane.appendChild(node("div", "zsa-act-explain"));
    ex.appendChild(node("h3", null, ui.explanation));
    ex.appendChild(rich(node("p"), q.explanation));
    ex.appendChild(node("p", "zsa-act-small", fill(ui.skillLine, {skill: SKILLS[q.skill].name})));
    return {pane: pane, heading: h};
  }
  function renderAnswer(i, focus) {
    var prevPi = S.screen === "answers" ? S.qs[S.cur].pi : -1;
    S.cur = i;
    S.screen = "answers";
    var q = S.qs[i];
    var built = answerPane(q);
    placePanes(q, built.pane);
    S.label.textContent = fill(ui.answersLabel, {n: q.pi + 1, total: S.items.length});
    updateNav();
    if (window.matchMedia("(max-width: 900px)").matches) {
      if (q.pi !== prevPi) window.scrollTo(0, 0); else built.pane.scrollIntoView({block: "start"});
    } else window.scrollTo(0, 0);
    if (focus === "heading") built.heading.focus();
    else live.textContent = fill(ui.announce, {n: q.n, total: S.total});
  }
  function openAnswers(i) {
    testbar.replaceChildren();
    S.label = testbar.appendChild(node("p", "zsa-act-bar-label"));
    testbar.appendChild(button(ui.backToReport, "zsa-act-bar-btn", closeAnswers));
    testbar.hidden = false;
    S.reader.setAttribute("hidden", "");
    root.classList.add("zsa-act--testing", "zsa-act--answers");
    root.classList.remove("zsa-act--review");
    bottom.hidden = false;
    app.replaceChildren();
    renderAnswer(i, "heading");
  }
  function closeAnswers() {
    var n = S.qs[S.cur].n;
    leaveTest();
    S.screen = "report";
    results(n);
  }
  function endSection(timeUp) {
    if (S.ended) return;
    S.elapsed = S.limit && timeUp ? S.limit : elapsed();
    S.t0 = null;
    S.ended = true;
    S.timeUp = timeUp;
    leaveTest();
    results();
  }

  function scaleSvg(lo, hi, est) {
    // Percentage x positions keep the text its real size at any width.
    function pos(v) { return ((v - 1) / 35 * 100).toFixed(2) + "%"; }
    function anchor(v) { return v < 5 ? "start" : v > 32 ? "end" : "middle"; }
    var s = svg("svg", {width: "100%", height: 96, "class": "zsa-act-scale", "aria-hidden": "true", focusable: "false"});
    svg("rect", {x: 0, y: 42, width: "100%", height: 12, rx: 6, "class": "zsa-act-scale-bar"}, s);
    if (hi > lo) svg("rect", {x: pos(lo), y: 38, width: ((hi - lo) / 35 * 100).toFixed(2) + "%", height: 20, rx: 10, "class": "zsa-act-scale-range"}, s);
    else svg("circle", {cx: pos(est), cy: 48, r: 10, "class": "zsa-act-scale-range"}, s);
    svg("text", {x: pos(est), y: 26, "text-anchor": anchor(est), "font-size": 14, "font-weight": 700}, s).textContent = fill(ui.scaleYou, {est: est});
    [[cfg.natAvg, ui.scaleAvg, "end"], [cfg.benchmark, ui.scaleBenchmark, "start"]].forEach(function (m) {
      svg("line", {x1: pos(m[0]), x2: pos(m[0]), y1: 32, y2: 64, "class": "zsa-act-scale-mark"}, s);
      svg("text", {x: pos(m[0]), y: 82, "text-anchor": m[2], "font-size": 13, "class": "zsa-act-muted"}, s)
        .textContent = fill(m[1], {avg: cfg.natAvg, benchmark: cfg.benchmark});
    });
    svg("text", {x: 0, y: 96, "font-size": 12, "class": "zsa-act-muted"}, s).textContent = "1";
    svg("text", {x: "100%", y: 96, "text-anchor": "end", "font-size": 12, "class": "zsa-act-muted"}, s).textContent = "36";
    return s;
  }
  function meter(p) {
    var s = svg("svg", {width: "100%", height: 12, "class": "zsa-act-meter", "aria-hidden": "true", focusable: "false"});
    svg("rect", {x: 0, y: 0, width: "100%", height: 12, rx: 6, "class": "zsa-act-meter-bg"}, s);
    if (p > 0) svg("rect", {x: 0, y: 0, width: Math.round(p * 100) + "%", height: 12, rx: 6, "class": p < 0.6 ? "zsa-act-meter-low" : "zsa-act-meter-fill"}, s);
    return s;
  }
  function tipCard(title, list) {
    var card = node("div", "zsa-act-tip");
    card.appendChild(node("h3", null, title));
    var ul = card.appendChild(node("ul"));
    list.forEach(function (t) { ul.appendChild(node("li", null, t)); });
    return card;
  }
  function section(title) {
    var sec = node("section", "zsa-act-section");
    sec.appendChild(node("h2", null, title));
    return sec;
  }

  // focusN: after the answer view, focus that question's button in the review list instead of the heading.
  function results(focusN) {
    var secs = S.elapsed;
    var all = [];
    S.items.forEach(function (it) { it.qs.forEach(function (q) { all.push(q); }); });
    var right = all.filter(function (q) { return S.answers[q.n] === q.answer; }).length;
    var pct = right / all.length;
    var by = {};
    all.forEach(function (q) {
      by[q.skill] = by[q.skill] || {r: 0, t: 0};
      by[q.skill].t += 1;
      if (S.answers[q.n] === q.answer) by[q.skill].r += 1;
    });
    var skillRows = Object.keys(SKILLS).filter(function (k) { return by[k]; }).map(function (k) { return {k: k, r: by[k].r, t: by[k].t, p: by[k].r / by[k].t}; });
    var weak = skillRows.filter(function (s) { return s.p < 1; }).sort(function (a, b) { return a.p - b.p || b.t - a.t; }).slice(0, 2);
    var paceSecs = all.length * 60;

    var out = [];
    var h1 = heading("h1", ui.reportTitle);
    out.push(h1);
    if (S.timeUp) out.push(node("p", "zsa-act-notice", ui.timeUp));
    var top = node("div", "zsa-act-res-top");
    out.push(top);
    var card = top.appendChild(node("div", "zsa-act-score-card"));
    var big = card.appendChild(node("p", "zsa-act-big"));
    big.appendChild(document.createTextNode(String(right)));
    big.appendChild(node("small", null, " / " + all.length));
    card.appendChild(node("p")).appendChild(node("strong", null, fill(ui.correct, {pct: Math.round(pct * 100)})));
    card.appendChild(node("p", "zsa-act-small", fill(ui.timeUsed, {time: fmt(secs), pace: secs <= paceSecs ? ui.onPace : ui.slowPace, paceTime: fmt(paceSecs), count: all.length})));

    var box = top.appendChild(node("div", "zsa-act-scale-box"));
    var ctx = {avg: cfg.natAvg, benchmark: cfg.benchmark};
    // One passage: no estimate. Mixed practice (15 or more questions): a range. Full section: one score.
    var single = S.mode === "full", ranged = S.mode === "mixed" && all.length >= cfg.minForEstimate;
    if (single || ranged) {
      var raw = Math.round(pct * 40);
      var est = cfg.conv[raw], lo = single ? est : cfg.conv[Math.max(0, raw - cfg.rangeRaw)], hi = single ? est : cfg.conv[Math.min(40, raw + cfg.rangeRaw)];
      var pr = cfg.rank[est] || 1;
      var cmp = est > cfg.natAvg + 0.5 ? ui.above : est < cfg.natAvg - 0.5 ? ui.below : ui.about;
      box.appendChild(node("h2", null, single ? fill(ui.estimateSingleTitle, {est: est}) : fill(ui.estimateTitle, {lo: lo, hi: hi})));
      var txt = rich(node("p"), fill(single ? ui.estimateSingleText : ui.estimateText, {cmp: cmp, avg: cfg.natAvg, est: est, pr: pr + ordinal(pr), prNum: pr}));
      txt.appendChild(document.createTextNode(" " + fill(est >= cfg.benchmark ? ui.meetsBenchmark : ui.benchmarkIs, ctx)));
      box.appendChild(txt);
      box.appendChild(scaleSvg(lo, hi, est));
      box.appendChild(node("p", "zsa-act-small", fill(single ? ui.disclaimerFull : ui.disclaimer, {rankYear: cfg.rankYear, count: all.length})));
    } else {
      box.appendChild(node("h2", null, ui.compareTitle));
      box.appendChild(node("p", null, fill(ui.compareText, ctx)));
      box.appendChild(node("p", "zsa-act-small", ui.compareMore));
    }

    var sk = section(ui.bySkill);
    var list = sk.appendChild(node("ul", "zsa-act-skills"));
    skillRows.forEach(function (s) {
      var li = list.appendChild(node("li", "zsa-act-skill"));
      li.appendChild(node("span", null, SKILLS[s.k].name));
      li.appendChild(meter(s.p));
      li.appendChild(node("span", "zsa-act-val", s.r + " / " + s.t));
    });
    out.push(sk);

    var tips = section(weak.length ? ui.workOn : ui.keepSharp);
    var grid = tips.appendChild(node("div", "zsa-act-tips"));
    (weak.length ? weak.map(function (w) { return tipCard(SKILLS[w.k].name, SKILLS[w.k].tips); }) : [tipCard(ui.allRight, ui.allRightTips)])
      .forEach(function (c) { grid.appendChild(c); });
    grid.appendChild(tipCard(ui.habits, ui.habitsTips));
    out.push(tips);

    var rv = section(ui.reviewTitle);
    var rl = rv.appendChild(node("ol", "zsa-act-review"));
    all.forEach(function (q) {
      var L = letters(q.n), mine = S.answers[q.n], ok = mine === q.answer;
      var li = rl.appendChild(node("li", "zsa-act-rv " + (ok ? "zsa-act-ok" : "zsa-act-no")));
      li.appendChild(node("span", "zsa-act-tag", (ok ? ui.tagCorrect : mine === undefined ? ui.tagBlank : ui.tagMissed) + " · " + SKILLS[q.skill].name));
      var stem = li.appendChild(node("p"));
      stem.appendChild(node("strong", null, q.n + ". "));
      rich(stem, q.stem);
      var ans = li.appendChild(node("p"));
      if (!ok) ans.appendChild(document.createTextNode((mine === undefined ? ui.noAnswer : fill(ui.youChose, {letter: L[mine]})) + " "));
      ans.appendChild(document.createTextNode(ui.answerIs + " "));
      ans.appendChild(node("strong", null, L[q.answer]));
      ans.appendChild(document.createTextNode(", "));
      rich(ans, q.choices[q.answer]);
      li.appendChild(rich(node("p", "zsa-act-small"), q.explanation));
      var open = li.appendChild(button("", "zsa-act-open", function () { openAnswers(S.qs.indexOf(q)); }));
      open.appendChild(node("span", null, ui.openInTest));
      open.appendChild(node("span", "zsa-sr-only", fill(ui.openInTestSr, {n: q.n})));
      open.setAttribute("data-n", q.n);
    });
    out.push(rv);

    var nav = node("div", "zsa-act-nav");
    nav.appendChild(button(ui.home, "", function () { intro(true); }));
    nav.appendChild(button(ui.again, "zsa-btn--primary", function () {
      startMode(S.mode);
    }));
    out.push(nav);
    show(out, h1);
    var back = focusN && app.querySelector('[data-n="' + focusN + '"]');
    if (back) { back.scrollIntoView({block: "center"}); back.focus(); }
  }

  intro(false);
}());
