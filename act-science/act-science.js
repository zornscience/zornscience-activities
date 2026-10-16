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
  var app = root.querySelector("#zsa-act-app"), clock = root.querySelector("#zsa-act-clock");
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
  function minutesFor(passages) { return passages.reduce(function (n, p) { return n + p.questions.length; }, 0); }

  function intro(focusIt) {
    stopClock();
    var grid = node("div", "zsa-act-intro");
    var left = grid.appendChild(node("div"));
    left.appendChild(node("p", "zsa-eyebrow", ui.eyebrow));
    var h1 = left.appendChild(heading("h1", ui.title));
    left.appendChild(node("p", "zsa-act-lede", ui.lede));
    var modes = left.appendChild(node("div", "zsa-act-modes"));
    var sample = mixedSet();
    [[ui.modeOne, ui.modeOneText, function () { start([shuffle(bank)[0]], "one"); }],
      [ui.modeMixed, fill(ui.modeMixedText, {passages: sample.length, minutes: minutesFor(sample)}), function () { start(mixedSet(), "mixed"); }]
    ].forEach(function (m) {
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

  function start(passages, mode) {
    var n = 0;
    var items = passages.map(function (p) {
      return {p: p, qs: p.questions.map(function (q) { n += 1; return Object.assign({}, q, {n: n}); })};
    });
    S = {items: items, mode: mode, page: 0, answers: {}, total: n, t0: Date.now()};
    startClock();
    renderPage();
  }

  function startClock() {
    stopClock();
    clock.replaceChildren();
    var el = node("b", null, "0:00");
    var a = clock.appendChild(node("span", null, ui.time + " "));
    a.appendChild(el);
    clock.appendChild(node("span", null, ui.pace + " ")).appendChild(node("b", null, fmt(S.total * 60)));
    clock.hidden = false;
    function tick() { el.textContent = fmt(Math.floor((Date.now() - S.t0) / 1000)); }
    tick();
    timer = setInterval(tick, 1000);
  }
  function stopClock() { if (timer) clearInterval(timer); timer = null; clock.hidden = true; }

  function renderPage() {
    var it = S.items[S.page], p = it.p;
    var last = S.page === S.items.length - 1;
    var head = node("div", "zsa-act-test-head");
    var titles = head.appendChild(node("div"));
    titles.appendChild(node("p", "zsa-act-kind", fill(ui.passageLabel, {roman: ROMAN[S.page], type: p.type})));
    var h1 = titles.appendChild(heading("h1", p.title));
    var prog = head.appendChild(node("div", "zsa-act-progress"));
    var pips = prog.appendChild(node("span", "zsa-act-pips"));
    pips.setAttribute("aria-hidden", "true");
    S.items.forEach(function (x, i) { pips.appendChild(node("i", i <= S.page ? "zsa-act-on" : "")); });
    prog.appendChild(node("span", null, fill(ui.passageOf, {n: S.page + 1, total: S.items.length})));

    var split = node("div", "zsa-act-split");
    var art = split.appendChild(node("article", "zsa-act-passage"));
    art.setAttribute("aria-label", ui.passageRegion);
    art.tabIndex = 0; // it scrolls on its own, so it must be reachable by keyboard
    renderBody(p).forEach(function (el) { art.appendChild(el); });

    var qs = split.appendChild(node("section", "zsa-act-qs"));
    qs.setAttribute("aria-label", p.title);
    it.qs.forEach(function (q) {
      var fs = qs.appendChild(node("fieldset", "zsa-act-q"));
      var lg = fs.appendChild(node("legend", "zsa-act-q-stem"));
      lg.appendChild(node("span", "zsa-act-q-num", q.n + "."));
      rich(lg.appendChild(node("span")), q.stem);
      var list = fs.appendChild(node("div", "zsa-act-choices"));
      q.choices.forEach(function (c, i) {
        var id = "zsa-act-q" + q.n + "-" + i;
        var lab = list.appendChild(node("label", "zsa-act-choice"));
        lab.htmlFor = id;
        var input = lab.appendChild(node("input"));
        input.type = "radio"; input.name = "zsa-act-q" + q.n; input.id = id; input.value = String(i);
        input.checked = S.answers[q.n] === i;
        input.addEventListener("change", function () { S.answers[q.n] = i; });
        lab.appendChild(node("span", "zsa-act-letter", letters(q.n)[i])).setAttribute("aria-hidden", "true");
        var txt = lab.appendChild(node("span"));
        txt.appendChild(node("span", "zsa-sr-only", letters(q.n)[i] + ". "));
        rich(txt, c);
      });
    });
    var nav = qs.appendChild(node("div", "zsa-act-nav"));
    var warn = node("div");
    nav.appendChild(button(S.page ? ui.previous : ui.quit, "", function () {
      if (S.page) { S.page -= 1; renderPage(); } else intro(true);
    }));
    nav.appendChild(button(last ? ui.score : ui.next, "zsa-btn--primary", function () {
      if (!last) { S.page += 1; renderPage(); return; }
      var blank = S.total - Object.keys(S.answers).length;
      if (!blank) { results(); return; }
      var box = node("div", "zsa-act-warn");
      box.setAttribute("role", "alert");
      var msg = box.appendChild(node("p"));
      msg.appendChild(node("strong", null, fill(ui.blank, {count: blank, questions: blank > 1 ? "questions" : "question"})));
      msg.appendChild(document.createTextNode(" " + ui.blankAdvice));
      var row = box.appendChild(node("div", "zsa-act-row"));
      row.appendChild(button(ui.keepWorking, "", function () { warn.replaceChildren(); }));
      row.appendChild(button(ui.scoreAnyway, "zsa-btn--primary", results));
      warn.replaceChildren(box);
    }));
    qs.appendChild(warn);
    show([head, split], h1);
  }

  function scaleSvg(lo, hi, est) {
    // Percentage x positions keep the text its real size at any width.
    function pos(v) { return ((v - 1) / 35 * 100).toFixed(2) + "%"; }
    function anchor(v) { return v < 5 ? "start" : v > 32 ? "end" : "middle"; }
    var s = svg("svg", {width: "100%", height: 96, "class": "zsa-act-scale", "aria-hidden": "true", focusable: "false"});
    svg("rect", {x: 0, y: 42, width: "100%", height: 12, rx: 6, "class": "zsa-act-scale-bar"}, s);
    svg("rect", {x: pos(lo), y: 38, width: ((hi - lo) / 35 * 100).toFixed(2) + "%", height: 20, rx: 10, "class": "zsa-act-scale-range"}, s);
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

  function results() {
    var secs = Math.floor((Date.now() - S.t0) / 1000);
    stopClock();
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
    if (S.mode === "mixed" && all.length >= cfg.minForEstimate) {
      var raw = Math.round(pct * 40);
      var est = cfg.conv[raw], lo = cfg.conv[Math.max(0, raw - cfg.rangeRaw)], hi = cfg.conv[Math.min(40, raw + cfg.rangeRaw)];
      var pr = cfg.rank[est] || 1;
      var cmp = est > cfg.natAvg + 0.5 ? ui.above : est < cfg.natAvg - 0.5 ? ui.below : ui.about;
      box.appendChild(node("h2", null, fill(ui.estimateTitle, {lo: lo, hi: hi})));
      var txt = rich(node("p"), fill(ui.estimateText, {cmp: cmp, avg: cfg.natAvg, est: est, pr: pr + ordinal(pr), prNum: pr}));
      txt.appendChild(document.createTextNode(" " + fill(est >= cfg.benchmark ? ui.meetsBenchmark : ui.benchmarkIs, ctx)));
      box.appendChild(txt);
      box.appendChild(scaleSvg(lo, hi, est));
      box.appendChild(node("p", "zsa-act-small", fill(ui.disclaimer, {rankYear: cfg.rankYear, count: all.length})));
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
    });
    out.push(rv);

    var nav = node("div", "zsa-act-nav");
    nav.appendChild(button(ui.home, "", function () { intro(true); }));
    nav.appendChild(button(ui.again, "zsa-btn--primary", function () {
      if (S.mode === "mixed") start(mixedSet(), "mixed"); else start([shuffle(bank)[0]], "one");
    }));
    out.push(nav);
    show(out, h1);
  }

  intro(false);
}());
