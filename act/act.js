// ACT Practice: a home screen (the full ACT and the four sections), a start screen for each section, the section
// itself (passage on the left and one question on the right, or one question at a time in Math), a score report
// with an estimated ACT score, a skill breakdown, tips and an answer review, and the full ACT (English, Math, a
// break, Reading and the optional Science) with a composite score. Every word on the page comes from data.js,
// questions from the bank files, and scoring tables and national values from config.js. All arrive through one-use
// events on the root. Figures are drawn here from the data as SVG and HTML tables.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var data, cfg, banks = {};
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-config", {detail: {receive: function (value) { cfg = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-bank", {detail: {receive: function (value) { banks[value.section] = value; }}}));
  if (!data || !cfg) return;
  var SECTIONS = data.sections;
  // ?drafts=1 lists every passage and question, drafts included, and lets the practice modes use drafts, so a
  // teacher can try them before marking them reviewed.
  var preview = new URLSearchParams(window.location.search).get("drafts") === "1";
  // Practice codes (config.history): on when the plugin is set up, or with ?codes=1 for testing. The code and the
  // history loaded for it live only in this page; nothing is stored in the browser.
  var codesOn = !!(cfg.history && (cfg.history.enabled || new URLSearchParams(window.location.search).get("codes") === "1"));
  var CODE = null, SKIP = false, HIST = null;
  // The section on screen: K is its key, D its words and skills, C its timing and scoring. ui is the shared words
  // with the section's own words on top.
  var K = null, D = null, C = null, ui = data.ui, SKILLS = {};
  var brandSection = root.querySelector(".zsa-act-brand-section");
  var app = root.querySelector("#zsa-act-app"), testbar = root.querySelector("#zsa-act-testbar"), bottom = root.querySelector("#zsa-act-bottom");
  var tools = root.querySelector("#zsa-act-tools"), dialog = root.querySelector("#zsa-act-dialog"), live = root.querySelector("#zsa-act-live"), alertBox = root.querySelector("#zsa-act-alert");
  var SVG = "http://www.w3.org/2000/svg";
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  var S = null, timer = null, FULL = null;

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

  // Text from the data may hold <sub>, <sup>, <em> and <strong>; math may hold <frac>top|bottom</frac> and
  // <sqrt>...</sqrt>; English passages hold <u3>underlined part 3</u3> and <b3/> for boxed number 3 on its own.
  // Everything else is text, never markup.
  var TAG = /<(\/?)(sub|sup|em|strong)>/g;
  var RICH = /<(\/?)(sub|sup|em|strong|frac|sqrt|u(\d+))>|<b(\d+)\/>/g;
  // ctx.qn turns a passage's own question number (1, 2, 3) into the number in the set.
  function rich(parent, markup, ctx) {
    var stack = [{el: parent}], last = 0, m, re = new RegExp(RICH.source, "g");
    markup = String(markup);
    function top() { return stack[stack.length - 1]; }
    function text(str) {
      var f = top(), at = f.frac && !f.inDen ? str.indexOf("|") : -1;
      if (at >= 0) {
        if (at) f.el.appendChild(document.createTextNode(str.slice(0, at)));
        f.inDen = true;
        f.el = f.frac.den;
        str = str.slice(at + 1);
      }
      if (str) f.el.appendChild(document.createTextNode(str));
    }
    function qn(k) { return ctx && ctx.qn ? ctx.qn(k) : k; }
    while ((m = re.exec(markup))) {
      if (m.index > last) text(markup.slice(last, m.index));
      last = re.lastIndex;
      var host = top().el;
      if (m[4]) { qbox(host, qn(Number(m[4])), true); continue; }
      if (m[1]) { if (stack.length > 1) { var done = stack.pop(); if (done.frac) closeFrac(done.frac); } continue; }
      if (m[3]) {
        var n = qn(Number(m[3])), wrap = host.appendChild(node("span", "zsa-act-u"));
        wrap.setAttribute("data-q", n);
        qbox(wrap, n, false);
        stack.push({el: wrap.appendChild(document.createElement("u"))});
      } else if (m[2] === "frac") {
        // A stacked fraction. Screen readers hear "3 over 4", or "(x + 1) over (2x)" when a part has more than one term.
        var fr = host.appendChild(node("span", "zsa-act-frac"));
        var parts = {open: fr.appendChild(node("span", "zsa-sr-only")), num: fr.appendChild(node("span", "zsa-act-num-part")),
          mid: fr.appendChild(node("span", "zsa-sr-only")), den: fr.appendChild(node("span", "zsa-act-den-part")), close: fr.appendChild(node("span", "zsa-sr-only"))};
        stack.push({el: parts.num, frac: parts});
      } else if (m[2] === "sqrt") {
        var sq = host.appendChild(node("span", "zsa-act-sqrt"));
        sq.appendChild(node("span", "zsa-act-root", "√"));
        stack.push({el: sq.appendChild(node("span", "zsa-act-rad"))});
      } else stack.push({el: host.appendChild(document.createElement(m[2]))});
    }
    if (last < markup.length) text(markup.slice(last));
    return parent;
  }
  function grouped(s) { return /^[\w.,]+$/.test(s) ? s : "(" + s + ")"; }
  function closeFrac(f) {
    var a = f.num.textContent.trim(), b = f.den.textContent.trim(), wrapA = grouped(a) !== a, wrapB = grouped(b) !== b;
    f.open.textContent = wrapA ? " (" : " ";
    f.mid.textContent = (wrapA ? ")" : "") + ui.over + (wrapB ? "(" : "");
    f.close.textContent = wrapB ? ") " : " ";
  }
  // The boxed question number before an underlined part, or on its own for a question about a spot in the passage.
  function qbox(host, n, spot) {
    var box = host.appendChild(node("span", "zsa-act-qbox" + (spot ? " zsa-act-qbox--spot" : "")));
    box.appendChild(node("span", "zsa-sr-only", ui.questionBox));
    box.appendChild(document.createTextNode(String(n)));
    if (spot) box.setAttribute("data-q", n);
    return box;
  }
  // Markup as plain text, for short labels.
  function plain(markup) {
    return String(markup).replace(/<frac>([^|<]*)\|([^<]*)<\/frac>/g, "$1/$2").replace(/<sqrt>/g, "√").replace(/<b\d+\/>/g, "")
      .replace(/<\/?(sub|sup|em|strong|frac|sqrt|u\d+)>/g, "");
  }
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
  var SHAPES = ["circle", "square", "triangle", "diamond", "ring"];
  function marker(g, shape, x, y, cls) {
    if (shape === "circle") svg("circle", {cx: x, cy: y, r: 5, "class": cls}, g);
    else if (shape === "ring") svg("circle", {cx: x, cy: y, r: 5, "class": cls + " zsa-act-ring"}, g);
    else if (shape === "square") svg("rect", {x: x - 4.5, y: y - 4.5, width: 9, height: 9, "class": cls}, g);
    else if (shape === "triangle") svg("path", {d: "M" + x + " " + (y - 6) + " L" + (x + 6) + " " + (y + 5) + " L" + (x - 6) + " " + (y + 5) + " Z", "class": cls}, g);
    else svg("path", {d: "M" + x + " " + (y - 6) + " L" + (x + 6) + " " + y + " L" + x + " " + (y + 6) + " L" + (x - 6) + " " + y + " Z", "class": cls}, g);
  }
  function legendKey(shape, i, bar) {
    var s = svg("svg", {viewBox: "0 0 28 16", width: 28, height: 16, "aria-hidden": "true", focusable: "false"});
    if (bar) {
      svg("rect", {x: 6, y: 1, width: 16, height: 14, "class": "zsa-act-bar zsa-act-s" + (i + 1) + (i ? " zsa-act-bar--hatch" : "")}, s);
      if (i) hatch(s, 6, 1, 16, 14);
    } else {
      svg("line", {x1: 1, x2: 27, y1: 8, y2: 8, "class": "zsa-act-series zsa-act-s" + (i + 1)}, s);
      marker(s, shape, 14, 8, "zsa-act-dot zsa-act-s" + (i + 1));
    }
    return s;
  }
  // Diagonal stripes over a bar, drawn as clipped lines so they need no pattern ids or styles.
  function hatch(parent, x, y, w, h) {
    var g = svg("g", {"class": "zsa-act-hatch"}, parent);
    for (var k = -h; k < w; k += 6) {
      var x1 = x + Math.max(k, 0), y1 = y + h - Math.max(-k, 0);
      var len = Math.min(w - Math.max(k, 0), h - Math.max(-k, 0));
      svg("line", {x1: x1, y1: y1, x2: x1 + len, y2: y1 - len}, g);
    }
  }
  function legendFor(series, shapes, bar) {
    var legend = node("ul", "zsa-act-legend");
    legend.setAttribute("aria-hidden", "true");
    series.forEach(function (s, i) {
      var li = legend.appendChild(node("li"));
      li.appendChild(legendKey(shapes ? SHAPES[i % SHAPES.length] : null, i, bar));
      li.appendChild(node("span", null, s.name));
    });
    return legend;
  }
  // A screen reader table with the values behind a graph, which itself is hidden from screen readers.
  // The table sits in a visually hidden div: tables ignore the 1 px width, so the div does the clipping.
  function dataTable(caption, xLabel, names, rows) {
    var wrap = node("div", "zsa-sr-only");
    var t = wrap.appendChild(node("table"));
    t.appendChild(node("caption", null, fill(ui.figureData, {caption: caption})));
    var head = t.appendChild(node("thead")).appendChild(node("tr"));
    rich(head.appendChild(node("th")), xLabel).setAttribute("scope", "col");
    names.forEach(function (n) { rich(head.appendChild(node("th")), n).setAttribute("scope", "col"); });
    var body = t.appendChild(node("tbody"));
    rows.forEach(function (r) {
      var tr = body.appendChild(node("tr"));
      tr.appendChild(node("th", null, String(r[0]))).setAttribute("scope", "row");
      r.slice(1).forEach(function (v) { tr.appendChild(node("td", null, v === null || v === undefined ? "" : String(v))); });
    });
    return wrap;
  }
  // The shared frame of every graph: y grid and labels, x ticks, both axes and their titles.
  var GW = 480, GH = 300, GL = 58, GR = 14, GT = 14, GB = 54, FS = 14;
  function frame(b, xTicks, sx) {
    var chart = svg("svg", {viewBox: "0 0 " + GW + " " + GH, "class": "zsa-act-chart", "aria-hidden": "true", focusable: "false"});
    var y0 = b.yMin || 0;
    function sy(v) { return GH - GB - (v - y0) / (b.yMax - y0) * (GH - GT - GB); }
    for (var k = 0, v = y0; v <= b.yMax + 1e-9; k += 1, v = y0 + k * b.yStep) {
      svg("line", {x1: GL, x2: GW - GR, y1: sy(v), y2: sy(v), "class": "zsa-act-grid"}, chart);
      svg("text", {x: GL - 8, y: sy(v) + 5, "text-anchor": "end", "font-size": FS}, chart).textContent = Number(v.toFixed(6));
    }
    xTicks.forEach(function (t) { svg("text", {x: sx(t[0]), y: GH - GB + 20, "text-anchor": "middle", "font-size": FS}, chart).textContent = t[1]; });
    svg("line", {x1: GL, x2: GW - GR, y1: GH - GB, y2: GH - GB, "class": "zsa-act-axis"}, chart);
    svg("line", {x1: GL, x2: GL, y1: GT, y2: GH - GB, "class": "zsa-act-axis"}, chart);
    svgRich(svg("text", {x: (GL + GW - GR) / 2, y: GH - 10, "text-anchor": "middle", "font-size": FS + 1, "font-weight": 700}, chart), b.xLabel, FS + 1);
    var my = (GT + GH - GB) / 2;
    svgRich(svg("text", {x: 0, y: 0, "text-anchor": "middle", "font-size": FS + 1, "font-weight": 700, transform: "translate(18 " + my + ") rotate(-90)"}, chart), b.yLabel, FS + 1);
    return {chart: chart, sy: sy};
  }
  function figureOf(parts, b, table) {
    var fig = node("figure", "zsa-act-figure");
    parts.forEach(function (p) { if (p) fig.appendChild(p); });
    fig.appendChild(table);
    fig.appendChild(node("figcaption", null, b.caption));
    return fig;
  }
  function lineChart(b) {
    var x0 = b.x[0], x1 = b.x[b.x.length - 1];
    function sx(v) { return GL + (v - x0) / (x1 - x0) * (GW - GL - GR); }
    var f = frame(b, b.x.map(function (v) { return [v, v]; }), sx);
    b.series.forEach(function (s, i) {
      var g = svg("g", {}, f.chart), cls = "zsa-act-s" + (i + 1);
      svg("polyline", {points: b.x.map(function (xv, j) { return sx(xv) + "," + f.sy(s.values[j]); }).join(" "), "class": "zsa-act-series " + cls}, g);
      b.x.forEach(function (xv, j) { marker(g, SHAPES[i % SHAPES.length], sx(xv), f.sy(s.values[j]), "zsa-act-dot " + cls); });
    });
    var rows = b.x.map(function (x, j) { return [x].concat(b.series.map(function (s) { return s.values[j]; })); });
    return figureOf([legendFor(b.series, true), f.chart], b, dataTable(b.caption, b.xLabel, b.series.map(function (s) { return s.name; }), rows));
  }
  // Points only, no connecting line. Axes run from xMin to xMax and yMin to yMax.
  function scatter(b) {
    function sx(v) { return GL + (v - b.xMin) / (b.xMax - b.xMin) * (GW - GL - GR); }
    var ticks = [];
    for (var k = 0, v = b.xMin; v <= b.xMax + 1e-9; k += 1, v = b.xMin + k * b.xStep) ticks.push([v, Number(v.toFixed(6))]);
    var f = frame(b, ticks, sx), rows = [];
    b.series.forEach(function (s, i) {
      var g = svg("g", {}, f.chart);
      s.points.forEach(function (p) {
        marker(g, SHAPES[i % SHAPES.length], sx(p[0]), f.sy(p[1]), "zsa-act-dot zsa-act-s" + (i + 1));
        var row = [p[0]];
        b.series.forEach(function (x, k) { row.push(k === i ? p[1] : null); });
        rows.push(row);
      });
    });
    return figureOf([b.series.length > 1 ? legendFor(b.series, true) : null, f.chart], b, dataTable(b.caption, b.xLabel, b.series.map(function (s) { return s.name; }), rows));
  }
  // Grouped bars over named categories. Bars after the first series are striped, so series differ without color.
  function barChart(b) {
    var n = b.categories.length, band = (GW - GL - GR) / n, groupW = band * 0.7, barW = groupW / b.series.length;
    function sx(i) { return GL + band * (i + 0.5); }
    var f = frame(b, b.categories.map(function (c, i) { return [i, c]; }), sx);
    b.series.forEach(function (s, si) {
      var g = svg("g", {}, f.chart);
      s.values.forEach(function (v, i) {
        var x = sx(i) - groupW / 2 + si * barW, y = f.sy(v), h = f.sy(b.yMin || 0) - y;
        svg("rect", {x: x + 1, y: y, width: barW - 2, height: h, "class": "zsa-act-bar zsa-act-s" + (si + 1) + (si ? " zsa-act-bar--hatch" : "")}, g);
        if (si) hatch(g, x + 1, y, barW - 2, h);
      });
    });
    var rows = b.categories.map(function (c, i) { return [c].concat(b.series.map(function (s) { return s.values[i]; })); });
    return figureOf([b.series.length > 1 ? legendFor(b.series, false, true) : null, f.chart], b, dataTable(b.caption, b.xLabel, b.series.map(function (s) { return s.name; }), rows));
  }
  // A table that has to scroll sideways (narrow phones) becomes a labeled region in the Tab order so the keyboard can scroll it.
  var tableWatch = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(function (entries) {
    entries.forEach(function (en) {
      var w = en.target, scrolls = w.scrollWidth > w.clientWidth + 1;
      if (scrolls) { w.tabIndex = 0; w.setAttribute("role", "region"); w.setAttribute("aria-label", w.getAttribute("data-caption")); }
      else { w.removeAttribute("tabindex"); w.removeAttribute("role"); w.removeAttribute("aria-label"); }
    });
  });
  function table(b) {
    var wrap = node("div", "zsa-act-tbl");
    wrap.setAttribute("data-caption", b.caption);
    if (tableWatch) tableWatch.observe(wrap);
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
  // ctx: qn (see rich) and numbered (number the paragraphs, as in Reading).
  function renderBody(blocks, ctx) {
    var out = [], para = 0;
    blocks.forEach(function (b) {
      if (b.kind === "text" && ctx && ctx.numbered) {
        para += 1;
        var p = node("p", "zsa-act-para");
        var num = p.appendChild(node("span", "zsa-act-pnum"));
        num.appendChild(node("span", "zsa-sr-only", ui.paragraph));
        num.appendChild(document.createTextNode(String(para)));
        out.push(rich(p, b.html, ctx));
      } else if (b.kind === "text") out.push(rich(node("p"), b.html, ctx));
      else if (b.kind === "note") out.push(rich(node("p", "zsa-act-pnote"), b.html));
      else if (b.kind === "heading") out.push(node("h2", null, b.text));
      else if (b.kind === "viewpoint") {
        var v = node("div", "zsa-act-view");
        v.appendChild(node("h2", null, b.label));
        v.appendChild(rich(node("p"), b.html));
        out.push(v);
      } else if (b.kind === "table") out.push(table(b));
      else if (b.kind === "lineChart") out.push(lineChart(b));
      else if (b.kind === "scatter") out.push(scatter(b));
      else if (b.kind === "barChart") out.push(barChart(b));
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

  // ---------- Banks and sets ----------
  // Every section's bank as a list of units: passages with their questions, or (Math) one question each.
  var UNITS = {};
  Object.keys(SECTIONS).forEach(function (key) {
    var b = banks[key];
    UNITS[key] = !b ? [] : b.questions ? b.questions.map(function (q) {
      return {id: q.id, status: q.status, type: SECTIONS[key].skills[q.skill].name, solo: true, title: "", body: [], questions: [q]};
    }) : b.passages;
  });
  function pool(key) { return UNITS[key].filter(function (p) { return preview || p.status === "reviewed"; }); }
  function questionsIn(set) { return set.reduce(function (n, p) { return n + p.questions.length; }, 0); }
  // Math questions: easier ones first, as on the ACT.
  function byDifficulty(list) {
    return list.map(function (p, i) { return [p, i]; })
      .sort(function (a, b) { return a[0].questions[0].difficulty - b[0].questions[0].difficulty || a[1] - b[1]; })
      .map(function (x) { return x[0]; });
  }
  function someQuestions(key, n) { var list = pool(key); return list.length >= n ? byDifficulty(shuffle(list).slice(0, n)) : null; }
  function choose(arr, k) {
    if (!k) return [[]];
    var out = [];
    arr.forEach(function (x, i) { choose(arr.slice(i + 1), k - 1).forEach(function (c) { out.push([x].concat(c)); }); });
    return out;
  }
  // Practice: one random passage, or a handful of Math questions.
  function oneSet(key) {
    var c = cfg.sections[key], list = pool(key);
    if (!list.length) return null;
    return c.practiceCount ? byDifficulty(shuffle(list).slice(0, c.practiceCount)) : [shuffle(list)[0]];
  }
  // Mixed practice: a few passages, one of each type while the types last, or a set of Math questions.
  function mixedSet(key) {
    var c = cfg.sections[key];
    if (c.mixedCount) return someQuestions(key, c.mixedCount);
    var list = pool(key), picked = [], rest = [];
    if (list.length < 2) return null;
    shuffle(list).forEach(function (p) {
      if (!picked.some(function (q) { return q.type === p.type; })) picked.push(p); else rest.push(p);
    });
    return shuffle(picked.slice(0, c.mixedPassages).concat(rest.slice(0, Math.max(0, c.mixedPassages - picked.length))));
  }
  // A full section: the configured mix of passage types adding up to exactly the section's question count, or that
  // many Math questions. Returns null until the bank can make one, which keeps the mode hidden.
  function fullSet(key) {
    var c = cfg.sections[key];
    if (!c.mix) return someQuestions(key, c.count);
    var list = pool(key);
    var groups = Object.keys(c.mix).map(function (t) {
      return choose(shuffle(list.filter(function (p) { return t === "*" || p.type === t; })), c.mix[t]);
    });
    var found = null;
    (function walk(gi, picked) {
      if (found) return;
      if (gi === groups.length) { if (questionsIn(picked) === c.count) found = picked; return; }
      groups[gi].forEach(function (g) { walk(gi + 1, picked.concat(g)); });
    }(0, []));
    return found && shuffle(found);
  }
  // Timed practice runs at the section's ACT pace, rounded up to a whole minute.
  function limitFor(set) { return Math.ceil(questionsIn(set) * C.minutes / C.count) * 60; }
  function startMode(mode) {
    withCode(function () {
      if (mode === "full") start(fullSet(K), "full");
      else if (mode === "mixed") start(mixedSet(K), "mixed");
      else start(oneSet(K), "one");
    });
  }
  function modeName(mode) { return {one: ui.modeOne, mixed: ui.modeMixed, full: ui.modeFull}[mode]; }

  function useSection(key) {
    K = key; D = SECTIONS[key]; C = cfg.sections[key]; SKILLS = D.skills;
    ui = Object.assign({}, data.ui, D.ui);
    brandSection.textContent = D.brand;
  }
  function useHome() {
    K = null; D = null; C = null; SKILLS = {};
    ui = data.ui;
    brandSection.textContent = ui.brandHome;
  }
  // The address keeps the open section (#english), so a link can open it directly.
  function setHash(key) {
    if (window.history && window.history.replaceState) window.history.replaceState(null, "", window.location.pathname + window.location.search + (key ? "#" + key : ""));
  }
  function facts(parent, title, list, ctx, note) {
    var aside = parent.appendChild(node("aside", "zsa-act-facts"));
    aside.setAttribute("aria-labelledby", "zsa-act-facts-title");
    aside.appendChild(node("h2", null, title)).id = "zsa-act-facts-title";
    var dl = aside.appendChild(node("dl"));
    list.forEach(function (f) {
      var row = dl.appendChild(node("div", "zsa-act-fact"));
      row.appendChild(node("dt", null, fill(f[0], ctx)));
      row.appendChild(node("dd", null, fill(f[1], ctx)));
    });
    aside.appendChild(node("p", "zsa-act-note", note));
  }
  function modeButton(title, text, onClick) {
    var b = button("", "zsa-act-mode", onClick);
    b.appendChild(node("strong", null, title));
    b.appendChild(node("span", null, text));
    return b;
  }

  // ---------- Home: the full ACT and the four sections ----------
  function home(focusIt) {
    if (S) leaveTest();
    S = null;
    FULL = null;
    useHome();
    setHash("");
    var grid = node("div", "zsa-act-intro");
    var left = grid.appendChild(node("div"));
    left.appendChild(node("p", "zsa-eyebrow", ui.homeEyebrow));
    var h1 = left.appendChild(heading("h1", ui.homeTitle));
    left.appendChild(node("p", "zsa-act-lede", ui.homeLede + " " + (codesOn ? ui.privacyOn : ui.privacyOff)));
    codeBar(left, function () { home(true); });
    var full = left.appendChild(node("section", "zsa-act-fullcard"));
    full.setAttribute("aria-labelledby", "zsa-act-full-title");
    full.appendChild(node("h2", null, ui.fullTitle)).id = "zsa-act-full-title";
    full.appendChild(node("p", null, ui.fullText));
    var ready = cfg.composite.every(function (k) { return fullSet(k); });
    if (ready) {
      var check = null;
      if (fullSet("science")) {
        var lab = full.appendChild(node("label", "zsa-act-check"));
        check = lab.appendChild(node("input"));
        check.type = "checkbox";
        check.checked = true;
        lab.appendChild(node("span", null, ui.includeScience));
      }
      full.appendChild(node("div", "zsa-act-row")).appendChild(button(ui.fullStart, "zsa-btn--primary", function () { startFull(!!(check && check.checked)); }));
    } else full.appendChild(node("p", "zsa-act-small", ui.fullSoon));
    var secs = left.appendChild(node("section", "zsa-act-seclist"));
    secs.setAttribute("aria-labelledby", "zsa-act-secs-title");
    secs.appendChild(node("h2", null, ui.sectionsTitle)).id = "zsa-act-secs-title";
    var list = secs.appendChild(node("div", "zsa-act-modes"));
    cfg.order.forEach(function (k) {
      var c = cfg.sections[k];
      list.appendChild(modeButton(SECTIONS[k].name, fill(ui.sectionLine, {count: c.count, minutes: c.minutes}) + (SECTIONS[k].optional ? ui.sectionOptional : ""),
        function () { intro(k, true); }));
    });
    facts(grid, ui.homeFactsTitle, ui.homeFacts, {avg: cfg.compositeAvg, avgClass: cfg.avgClass}, ui.homeFactsNote);
    show([grid], focusIt ? h1 : null);
  }

  // ---------- A section's start screen ----------
  function intro(key, focusIt) {
    if (S) leaveTest();
    S = null;
    FULL = null;
    useSection(key);
    setHash(key);
    var grid = node("div", "zsa-act-intro");
    var left = grid.appendChild(node("div"));
    left.appendChild(node("p", "zsa-eyebrow", ui.eyebrow));
    var h1 = left.appendChild(heading("h1", ui.title));
    left.appendChild(node("p", "zsa-act-lede", ui.lede + " " + (codesOn ? ui.privacyOn : ui.privacyOff)));
    codeBar(left, function () { intro(key, true); });
    var modes = left.appendChild(node("div", "zsa-act-modes"));
    var one = oneSet(K), mixed = mixedSet(K), whole = fullSet(K);
    if (one) modes.appendChild(modeButton(ui.modeOne, fill(ui.modeOneText, {count: questionsIn(one)}), function () { startMode("one"); }));
    if (mixed) modes.appendChild(modeButton(ui.modeMixed, fill(ui.modeMixedText, {passages: mixed.length, count: questionsIn(mixed), minutes: limitFor(mixed) / 60}), function () { startMode("mixed"); }));
    if (whole) modes.appendChild(modeButton(ui.modeFull, fill(ui.modeFullText, {count: C.count, minutes: C.minutes, name: D.name}), function () { startMode("full"); }));
    if (!one) modes.appendChild(node("p", "zsa-act-panel-note", ui.noQuestions));
    var row = left.appendChild(node("div", "zsa-act-row zsa-act-homerow"));
    row.appendChild(button(ui.backHome, "", function () { home(true); }));
    facts(grid, fill(ui.factsTitle, {name: D.name}), ui.facts, {avg: C.natAvg, avgClass: cfg.avgClass, benchmark: C.benchmark}, ui.factsNote);
    if (preview) {
      var rev = left.appendChild(node("section", "zsa-act-drafts"));
      rev.setAttribute("aria-labelledby", "zsa-act-drafts-title");
      rev.appendChild(node("h2", null, ui.draftsTitle)).id = "zsa-act-drafts-title";
      rev.appendChild(node("p", "zsa-act-small", ui.draftsNote));
      var ul = rev.appendChild(node("ul", "zsa-act-draft-list"));
      UNITS[K].forEach(function (p) {
        var status = p.status === "reviewed" ? ui.statusReviewed : ui.statusDraft;
        var title = p.solo ? plain(p.questions[0].stem) : p.title;
        if (title.length > 90) title = title.slice(0, 88).replace(/\s+\S*$/, "") + "...";
        ul.appendChild(node("li")).appendChild(modeButton(title, p.solo ? fill(ui.draftLineOne, {type: p.type, status: status})
          : fill(ui.draftLine, {type: p.type, count: p.questions.length, status: status}), function () { withCode(function () { start([p], "one"); }); }));
      });
    }
    show([grid], focusIt ? h1 : null);
  }

  // ---------- The section: directions, one question at a time, navigator, timer, review ----------
  function start(passages, mode) {
    var n = 0, qs = [];
    var items = passages.map(function (p, pi) {
      return {p: p, qs: p.questions.map(function (q, k) {
        n += 1;
        var item = Object.assign({}, q, {n: n, pi: pi});
        // English: the underlined part as written, for the answer review.
        var under = new RegExp("<u" + (k + 1) + ">([\\s\\S]*?)</u" + (k + 1) + ">");
        p.body.some(function (b) { var m = b.html && b.html.match(under); if (m) item.orig = m[1]; return !!m; });
        qs.push(item);
        return item;
      })};
    });
    S = {key: K, items: items, qs: qs, mode: mode, total: n, cur: 0, answers: {}, flags: {}, limit: mode === "one" ? null : mode === "full" ? C.minutes * 60 : limitFor(passages),
      t0: null, elapsed: 0, hidden: false, warned: false, ended: false, timeUp: false, panes: {}, solo: !!D.solo, full: !!FULL};
    directionsScreen();
  }
  function stemOf(q) { return q.stem || fill(ui.underlineStem, {n: q.n}); }

  function directionsContent(parent, titleTag) {
    var h = parent.appendChild(heading(titleTag, fill(ui.directionsTitle, {name: D.name})));
    var minutes = S.limit / 60;
    parent.appendChild(node("p", null, S.solo ? fill(ui.directionsIntroSolo, {count: S.total, questionWord: S.total > 1 ? "questions" : "question"})
      : fill(ui.directionsIntro, {passages: S.items.length, passageWord: S.items.length > 1 ? "passages" : "passage", count: S.total})));
    parent.appendChild(node("p", null, S.limit ? fill(ui.directionsTimed, {minutes: minutes}) : fill(ui.directionsUntimed, {pace: ui.pace})));
    var ul = parent.appendChild(node("ul", "zsa-act-directions"));
    ui.directionsList.forEach(function (t) { ul.appendChild(node("li", null, t)); });
    return h;
  }
  function directionsScreen() {
    stopClock();
    var box = node("section", "zsa-act-dir-screen");
    box.appendChild(node("p", "zsa-eyebrow", FULL ? fill(ui.fullEyebrow, {n: FULL.i + 1, total: FULL.keys.length}) : modeName(S.mode)));
    if (FULL && FULL.note) box.appendChild(node("p", "zsa-act-notice", FULL.note));
    var h1 = directionsContent(box, "h1");
    var row = box.appendChild(node("div", "zsa-act-row"));
    if (!FULL) row.appendChild(button(ui.back, "", function () { intro(K, true); }));
    else if (!FULL.i) row.appendChild(button(ui.back, "", function () { home(true); }));
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
    root.classList.remove("zsa-act--testing", "zsa-act--review", "zsa-act--answers", "zsa-act--hl", "zsa-act--erase", "zsa-act--elim", "zsa-act--mask",
      "zsa-act-z1", "zsa-act-z2", "zsa-act-z3");
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
    // Math has no passage, so no line reader.
    toolBtns.reader = S.solo ? null : row.appendChild(toolButton("reader", ui.toolReader, function () { T.reader = !T.reader; syncTools(); if (T.reader) S.readerHandle.focus(); }));
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
    if (toolBtns.reader) pressed(toolBtns.reader, T.reader);
    pressed(toolBtns.elim, T.elim);
    pressed(toolBtns.mask, T.mask);
    root.classList.toggle("zsa-act--hl", T.hl);
    root.classList.toggle("zsa-act--erase", T.hl && T.erase);
    root.classList.toggle("zsa-act--elim", T.elim);
    root.classList.toggle("zsa-act--mask", T.mask);
    toolBtns.zoomOut.disabled = T.zoom === 0;
    toolBtns.zoomIn.disabled = T.zoom === ZOOMS.length - 1;
    toolBtns.zoomVal.textContent = ZOOMS[T.zoom] + "%";
    ZOOMS.forEach(function (z, k) { if (k) root.classList.toggle("zsa-act-z" + k, k === T.zoom); });
    S.reader.toggleAttribute("hidden", !T.reader);
    drawReader();
  }

  // ----- Highlighter: wraps selected text (passage text, question stems and choices, never figures) in <mark>.
  function highlightable(t) {
    var el = t.parentNode;
    if (!el || !el.closest) return false;
    if (!el.closest(".zsa-act-passage, .zsa-act-q-stem, .zsa-act-choice-text")) return false;
    return !el.closest("svg, figure, .zsa-act-tbl, .zsa-sr-only, .zsa-act-kind, .zsa-act-qbox, .zsa-act-pnum") && /\S/.test(t.nodeValue);
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
    var it = S.items[pi], p = it.p;
    var art = node("article", "zsa-act-passage");
    art.setAttribute("aria-label", fill(ui.passageRegion, {roman: ROMAN[pi]}));
    art.tabIndex = 0; // it scrolls on its own, so it must be reachable by keyboard
    art.appendChild(node("p", "zsa-act-kind", fill(ui.passageLabel, {roman: ROMAN[pi], type: p.type})));
    art.appendChild(node("h1", null, p.title));
    var ctx = {numbered: p.numbered, qn: function (k) { return it.qs[k - 1] ? it.qs[k - 1].n : k; }};
    renderBody(p.body, ctx).forEach(function (el) { art.appendChild(el); });
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
    rich(fs.appendChild(node("legend", "zsa-act-q-stem")), stemOf(q));
    if (q.figure) renderBody([q.figure]).forEach(function (el) { fs.appendChild(el); });
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
    S.label.textContent = fill(S.solo ? ui.barLabelSolo : ui.barLabel, {section: D.name, n: q.pi + 1, total: S.items.length});
    updateNav();
    markCurrent(q, narrow);
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
      var b = strip.appendChild(button(String(q.n), "zsa-act-num" + (i && !S.solo && q.pi !== S.qs[i - 1].pi ? " zsa-act-num--first" : ""), function () { openQuestion(i, "heading"); }));
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
    S.label.textContent = D.name + " · " + ui.reviewHeading;
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
    var allList = null;
    S.items.forEach(function (it, pi) {
      if (!S.solo) all.appendChild(node("h3", null, fill(ui.passageLabel, {roman: ROMAN[pi], type: it.p.type})));
      var ul = S.solo && allList ? allList : (allList = all.appendChild(node("ul", "zsa-act-num-list")));
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
  // Math (solo) shows the question alone, full width; the other sections put the passage beside it.
  function placePanes(q, pane) {
    var split = app.querySelector(".zsa-act-split");
    if (!split) {
      split = node("div", "zsa-act-split" + (S.solo ? " zsa-act-split--solo" : ""));
      if (!S.solo) split.appendChild(S.pwrap);
      app.replaceChildren(split);
    }
    // Math has no passage title, so the page heading is for screen readers only.
    if (S.solo) { split.replaceChildren(node("h1", "zsa-sr-only", fill(ui.soloHeading, {name: D.name})), pane); return; }
    var art = passagePane(q.pi);
    if (S.pwrap.firstChild !== art) S.pwrap.replaceChild(art, S.pwrap.firstChild);
    if (split.children[1]) split.replaceChild(pane, split.children[1]); else split.appendChild(pane);
  }
  // English: mark the current question's underlined part (or boxed number) and, beside the question, scroll the
  // passage pane so it shows. On narrow screens the page scrolls instead, so the pane is left alone.
  function markCurrent(q, narrow) {
    var art = S.panes[q.pi], target = null;
    if (!art) return;
    [].slice.call(art.querySelectorAll("[data-q]")).forEach(function (el) {
      var on = Number(el.getAttribute("data-q")) === q.n;
      el.classList.toggle("zsa-act-u--current", on);
      if (on) target = el;
    });
    if (!target || narrow) return;
    var r = target.getBoundingClientRect(), a = art.getBoundingClientRect();
    if (r.top < a.top + 8 || r.bottom > a.bottom - 8) art.scrollTop += r.top - a.top - a.height / 3;
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
    pane.appendChild(rich(node("p", "zsa-act-q-stem"), stemOf(q)));
    if (q.figure) renderBody([q.figure]).forEach(function (el) { pane.appendChild(el); });
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
    S.label.textContent = fill(S.solo ? ui.answersLabelSolo : ui.answersLabel, {section: D.name, n: q.pi + 1, total: S.items.length});
    updateNav();
    var narrow = window.matchMedia("(max-width: 900px)").matches;
    markCurrent(q, narrow);
    if (narrow) {
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
    if (S.full && FULL) nextInFull(timeUp);
    else {
      save(S, attemptOf(S));
      results();
    }
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
    // The lower of the two marks gets its label on the left, the higher on the right, so they never overlap.
    var avgLeft = C.natAvg <= C.benchmark;
    [[C.natAvg, ui.scaleAvg, avgLeft ? "end" : "start"], [C.benchmark, ui.scaleBenchmark, avgLeft ? "start" : "end"]].forEach(function (m) {
      svg("line", {x1: pos(m[0]), x2: pos(m[0]), y1: 32, y2: 64, "class": "zsa-act-scale-mark"}, s);
      svg("text", {x: pos(m[0]), y: 82, "text-anchor": m[2], "font-size": 13, "class": "zsa-act-muted"}, s)
        .textContent = fill(m[1], {avg: C.natAvg, benchmark: C.benchmark});
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
  var sectionCount = 0;
  function section(title) {
    var sec = node("section", "zsa-act-section");
    sectionCount += 1;
    sec.appendChild(node("h2", null, title)).id = "zsa-act-sec" + sectionCount;
    sec.setAttribute("aria-labelledby", "zsa-act-sec" + sectionCount);
    return sec;
  }

  // The estimated scale score for a finished section: one score for a full section, a range for mixed practice.
  function estimate(st) {
    var c = cfg.sections[st.key];
    var right = st.qs.filter(function (q) { return st.answers[q.n] === q.answer; }).length, pct = right / st.qs.length;
    var raw = Math.round(pct * c.count), spread = Math.round(c.count * cfg.rangeShare), est = c.conv[raw];
    return {right: right, pct: pct, est: est, lo: c.conv[Math.max(0, raw - spread)], hi: c.conv[Math.min(c.count, raw + spread)], pr: c.rank ? c.rank[est] || 1 : null};
  }
  function aOrAn(n) { return /^(8|11|18)$/.test(String(n)) ? "An" : "A"; }
  function compare(v, avg) { return v > avg + 0.5 ? ui.above : v < avg - 0.5 ? ui.below : ui.about; }

  // focusN: after the answer view, focus that question's button in the review list instead of the heading.
  function results(focusN) {
    var secs = S.elapsed;
    var all = S.qs;
    var e = estimate(S), right = e.right, pct = e.pct;
    var by = {};
    all.forEach(function (q) {
      by[q.skill] = by[q.skill] || {r: 0, t: 0};
      by[q.skill].t += 1;
      if (S.answers[q.n] === q.answer) by[q.skill].r += 1;
    });
    var skillRows = Object.keys(SKILLS).filter(function (k) { return by[k]; }).map(function (k) { return {k: k, r: by[k].r, t: by[k].t, p: by[k].r / by[k].t}; });
    var weak = skillRows.filter(function (s) { return s.p < 1; }).sort(function (a, b) { return a.p - b.p || b.t - a.t; }).slice(0, 2);
    var paceSecs = Math.round(all.length * C.minutes * 60 / C.count);

    var out = [];
    var h1 = heading("h1", ui.reportTitle);
    out.push(h1);
    if (S.timeUp) out.push(node("p", "zsa-act-notice", ui.timeUp));
    if (S.save) out.push(saveBox(S));
    var top = node("div", "zsa-act-res-top");
    out.push(top);
    var card = top.appendChild(node("div", "zsa-act-score-card"));
    var big = card.appendChild(node("p", "zsa-act-big"));
    big.appendChild(document.createTextNode(String(right)));
    big.appendChild(node("small", null, " / " + all.length));
    card.appendChild(node("p")).appendChild(node("strong", null, fill(ui.correct, {pct: Math.round(pct * 100)})));
    card.appendChild(node("p", "zsa-act-small", fill(ui.timeUsed, {time: fmt(secs), pace: secs <= paceSecs ? ui.onPace : ui.slowPace, paceTime: fmt(paceSecs), count: all.length})));

    var box = top.appendChild(node("div", "zsa-act-scale-box"));
    var ctx = {avg: C.natAvg, benchmark: C.benchmark, name: D.name, count: all.length};
    // Practice: no estimate. Mixed practice (15 or more questions): a range. Full section: one score.
    var single = S.mode === "full", ranged = S.mode === "mixed" && all.length >= cfg.minForEstimate;
    if (single || ranged) {
      var est = e.est, lo = single ? est : e.lo, hi = single ? est : e.hi;
      var tctx = {cmp: compare(est, C.natAvg), avg: C.natAvg, est: est, a: aOrAn(est), pr: e.pr + ordinal(e.pr), prNum: e.pr};
      box.appendChild(node("h2", null, fill(single ? ui.estimateSingleTitle : ui.estimateTitle, {name: D.name, est: est, lo: lo, hi: hi})));
      var txt = rich(node("p"), fill(single ? ui.estimateSingleText : ui.estimateText, tctx) + (e.pr ? fill(single ? ui.rankSingleText : ui.rankText, tctx) : ""));
      txt.appendChild(document.createTextNode(" " + fill(est >= C.benchmark ? ui.meetsBenchmark : ui.benchmarkIs, ctx)));
      box.appendChild(txt);
      box.appendChild(scaleSvg(lo, hi, est));
      var ranks = C.rank ? fill(single ? ui.ranksFull : ui.ranksMixed, {rankYear: cfg.rankYear}) : "";
      box.appendChild(node("p", "zsa-act-small", fill(single ? ui.disclaimerFull : ui.disclaimer, {ranks: ranks, full: C.count, count: all.length})));
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
      rich(stem, stemOf(q));
      if (q.orig !== undefined) {
        var orig = li.appendChild(node("p"));
        orig.appendChild(document.createTextNode(ui.underlined + " "));
        rich(orig.appendChild(node("u")), q.orig);
      }
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
    if (S.full) {
      var key = S.key;
      nav.appendChild(button(ui.home, "", function () { home(true); }));
      nav.appendChild(button(ui.backToFull, "zsa-btn--primary", function () { S = null; fullReport(key); }));
    } else {
      nav.appendChild(button(ui.home, "", function () { intro(K, true); }));
      nav.appendChild(button(ui.again, "zsa-btn--primary", function () { startMode(S.mode); }));
    }
    out.push(nav);
    show(out, h1);
    var back = focusN && app.querySelector('[data-n="' + focusN + '"]');
    if (back) { back.scrollIntoView({block: "center"}); back.focus(); }
  }

  // ---------- The full ACT: English, Math, a break, Reading, then Science if chosen ----------
  function startFull(withScience) {
    if (!CODE && !SKIP && codesOn) { withCode(function () { startFull(withScience); }); return; }
    var keys = cfg.order.filter(function (k) { return k !== "science" || withScience; }), sets = {};
    keys.forEach(function (k) { sets[k] = fullSet(k); });
    FULL = {keys: keys, sets: sets, i: 0, done: [], note: null, withScience: withScience};
    useSection(keys[0]);
    setHash("");
    start(sets[K], "full");
  }
  // After each section: straight on to the next section's directions, or the break, or the score report.
  function nextInFull(timeUp) {
    FULL.done.push(S);
    save(S, attemptOf(S));
    FULL.note = fill(timeUp ? ui.sectionDoneTime : ui.sectionDone, {name: D.name});
    var finished = FULL.keys[FULL.i];
    S = null;
    if (FULL.i + 1 >= FULL.keys.length) { fullReport(); return; }
    if (finished === cfg.breakAfter) { breakScreen(); return; }
    FULL.i += 1;
    useSection(FULL.keys[FULL.i]);
    start(FULL.sets[K], "full");
  }
  function breakScreen() {
    stopClock();
    var end = Date.now() + cfg.breakMinutes * 60000;
    var box = node("section", "zsa-act-dir-screen");
    box.appendChild(node("p", "zsa-eyebrow", ui.fullTitle));
    box.appendChild(node("p", "zsa-act-notice", FULL.note));
    var h1 = box.appendChild(heading("h1", ui.breakTitle));
    box.appendChild(node("p", null, ui.breakText));
    var clockBox = box.appendChild(node("p", "zsa-act-break"));
    clockBox.setAttribute("role", "timer");
    clockBox.appendChild(node("span", null, ui.breakLeft + " "));
    var time = clockBox.appendChild(node("b", "zsa-act-time"));
    function go() {
      stopClock();
      FULL.note = null;
      FULL.i += 1;
      useSection(FULL.keys[FULL.i]);
      start(FULL.sets[K], "full");
    }
    function t() {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      time.textContent = fmt(left);
      if (!left) go();
    }
    box.appendChild(node("div", "zsa-act-row")).appendChild(button(ui.breakEnd, "zsa-btn--primary", go));
    t();
    timer = setInterval(t, 250);
    show([box], h1);
  }
  // focusKey: coming back from a section report, focus that section's button.
  function fullReport(focusKey) {
    stopClock();
    useHome();
    var scores = {};
    FULL.done.forEach(function (st) { scores[st.key] = {st: st, e: estimate(st)}; });
    var composite = Math.round(cfg.composite.reduce(function (n, k) { return n + scores[k].e.est; }, 0) / cfg.composite.length);
    var out = [];
    var h1 = heading("h1", ui.fullReportTitle);
    out.push(h1);
    var top = node("div", "zsa-act-res-top");
    out.push(top);
    var card = top.appendChild(node("div", "zsa-act-score-card"));
    card.appendChild(node("p", "zsa-act-kind", ui.compositeLabel));
    var big = card.appendChild(node("p", "zsa-act-big"));
    big.appendChild(document.createTextNode(String(composite)));
    big.appendChild(node("small", null, " / 36"));
    function pct(table, v) { var r = table[v] || 1; return r + ordinal(r); }
    if (scores.science) {
      var stem = Math.round((scores.math.e.est + scores.science.e.est) / 2);
      card.appendChild(node("p", "zsa-act-small", fill(ui.stemLine, {stem: stem, pr: pct(cfg.stemRank, stem)})));
    }
    var box = top.appendChild(node("div", "zsa-act-scale-box"));
    box.appendChild(rich(node("p"), fill(ui.compositeText, {cmp: compare(composite, cfg.compositeAvg), avg: cfg.compositeAvg, avgClass: cfg.avgClass,
      a: aOrAn(composite), composite: composite, pr: pct(cfg.compositeRank, composite), prNum: cfg.compositeRank[composite] || 1})));
    box.appendChild(node("p", "zsa-act-small", fill(ui.fullDisclaimer, {rankYear: cfg.rankYear})));
    if (!FULL.save) {
      var sum = function (f) { return cfg.composite.reduce(function (n, k) { return n + f(scores[k]); }, 0); };
      save(FULL, {section: "composite", mode: "fullact", questions: sum(function (x) { return x.st.qs.length; }), correct: sum(function (x) { return x.e.right; }),
        score: composite, low: null, high: null, seconds: sum(function (x) { return x.st.elapsed; })});
    }
    if (FULL.save) card.appendChild(saveBox(FULL));
    var secs = section(ui.sectionScoresTitle);
    var list = secs.appendChild(node("ul", "zsa-act-secscores"));
    var focusBtn = null;
    FULL.keys.forEach(function (k) {
      var sc = scores[k], c = cfg.sections[k], name = SECTIONS[k].name;
      var li = list.appendChild(node("li", "zsa-act-secscore"));
      var h = li.appendChild(node("h3"));
      h.appendChild(document.createTextNode(name + " "));
      h.appendChild(node("span", "zsa-act-secscore-num", String(sc.e.est)));
      li.appendChild(meter(sc.e.est / 36));
      li.appendChild(node("p", "zsa-act-small", fill(ui.sectionScoreLine, {right: sc.e.right, count: sc.st.total, pr: pct(c.rank, sc.e.est),
        bench: fill(sc.e.est >= c.benchmark ? ui.benchMet : ui.benchNotMet, {benchmark: c.benchmark})})));
      var b = li.appendChild(button(fill(ui.seeReport, {name: name}), "zsa-act-open", function () {
        S = sc.st;
        useSection(k);
        results();
      }));
      if (k === focusKey) focusBtn = b;
    });
    out.push(secs);
    var nav = node("div", "zsa-act-nav");
    nav.appendChild(button(ui.home, "", function () { home(true); }));
    var withScience = FULL.withScience;
    nav.appendChild(button(ui.fullAgain, "zsa-btn--primary", function () { startFull(withScience); }));
    out.push(nav);
    show(out, h1);
    if (focusBtn) { focusBtn.scrollIntoView({block: "center"}); focusBtn.focus(); }
  }

  // ---------- Practice codes and history ----------
  function api(action, code, body, done) {
    root.dispatchEvent(new CustomEvent("zsa:history", {detail: {action: action, api: cfg.history.api, code: code, body: body, done: done}}));
  }
  // Before a practice starts: ask for a code once per visit, unless one is in use or the student chose not to save.
  function withCode(next) {
    if (!codesOn || CODE || SKIP) next(); else codeScreen(next, true, null);
  }
  // A line on the home and section screens: the code in use, or an offer to use one.
  function codeBar(parent, back) {
    if (!codesOn) return;
    var bar = parent.appendChild(node("div", "zsa-act-codebar"));
    var row = node("div", "zsa-act-row");
    if (CODE) {
      bar.appendChild(rich(node("p"), fill(ui.codeBar, {code: "<strong>" + CODE + "</strong>"})));
      row.appendChild(button(ui.codeHistory, "", function () { historyScreen(back); }));
      row.appendChild(button(ui.codeStop, "", function () { CODE = null; HIST = null; SKIP = false; back(); }));
    } else {
      bar.appendChild(node("p", null, ui.codeBarOff));
      row.appendChild(button(ui.codeUse, "", function () { codeScreen(null, false, back); }));
    }
    bar.appendChild(row);
  }
  function codeScreen(next, prompted, back) {
    var box = node("section", "zsa-act-dir-screen zsa-act-code-screen");
    var h1 = box.appendChild(heading("h1", ui.codeTitle));
    box.appendChild(node("p", null, ui.codeIntro));
    var field = box.appendChild(node("div", "zsa-act-code-field"));
    var lab = field.appendChild(node("label", null, ui.codeLabel));
    lab.htmlFor = "zsa-act-code-input";
    var input = field.appendChild(node("input", "zsa-act-code-input"));
    input.id = "zsa-act-code-input";
    input.type = "text";
    input.maxLength = 10;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("aria-describedby", "zsa-act-code-hint zsa-act-code-msg");
    field.appendChild(node("p", "zsa-act-small", ui.codeHint)).id = "zsa-act-code-hint";
    var openBtn = field.appendChild(button(ui.codeOpen, "zsa-btn--primary", open));
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); open(); } });
    var msg = box.appendChild(node("p", "zsa-act-code-msg"));
    msg.id = "zsa-act-code-msg";
    msg.setAttribute("role", "status");
    box.appendChild(node("h2", null, ui.codeNewTitle));
    var newBtn = box.appendChild(node("div", "zsa-act-row")).appendChild(button(ui.codeNew, "", make));
    var row = box.appendChild(node("div", "zsa-act-row zsa-act-homerow"));
    row.appendChild(button(prompted ? ui.codeSkip : ui.back, "", function () {
      if (prompted) { SKIP = true; next(); } else back();
    }));
    function busy(on, text) { openBtn.disabled = on; newBtn.disabled = on; msg.textContent = text || ""; }
    function fail(err) {
      busy(false, err.status === 404 ? ui.codeNotFound : err.status === 429 ? ui.codeBusy : ui.codeDown);
      if (err.status === 404) input.setAttribute("aria-invalid", "true");
    }
    function open() {
      var code = input.value.toUpperCase().replace(/[\s-]+/g, "");
      if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
        msg.textContent = ui.codeBadFormat;
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      busy(true, ui.codeChecking);
      api("history", code, null, function (err, res) {
        if (!app.contains(box)) return;
        if (err) { fail(err); return; }
        CODE = res.code; HIST = res; SKIP = false;
        if (prompted) next(); else historyScreen(back);
      });
    }
    function make() {
      busy(true, ui.codeMaking);
      api("new", null, null, function (err, res) {
        if (!app.contains(box)) return;
        if (err) { fail(err); return; }
        CODE = res.code; HIST = {code: res.code, attempts: []}; SKIP = false;
        newCodeScreen(prompted ? next : back);
      });
    }
    show([box], h1);
  }
  function newCodeScreen(next) {
    var box = node("section", "zsa-act-dir-screen zsa-act-code-screen");
    var h1 = box.appendChild(heading("h1", ui.codeNewHeading));
    var big = box.appendChild(node("p", "zsa-act-code-big"));
    big.appendChild(node("span", null, CODE)).setAttribute("aria-hidden", "true");
    big.appendChild(node("span", "zsa-sr-only", CODE.split("").join(" ")));
    box.appendChild(node("p", null, ui.codeNewText));
    box.appendChild(node("div", "zsa-act-row")).appendChild(button(ui.codeContinue, "zsa-btn--primary", next));
    show([box], h1);
  }
  // What one finished section saves: no names, only the section, the kind of practice, the counts and the estimate.
  function attemptOf(st) {
    var e = estimate(st), single = st.mode === "full", ranged = st.mode === "mixed" && st.qs.length >= cfg.minForEstimate;
    return {section: st.key, mode: st.full ? "fullact" : st.mode, questions: st.qs.length, correct: e.right,
      score: single ? e.est : null, low: ranged ? e.lo : null, high: ranged ? e.hi : null, seconds: st.elapsed};
  }
  // rec is a finished section (or the full ACT, for its composite); rec.save holds the state shown in its report.
  function save(rec, attempt) {
    if (!CODE) return;
    rec.save = {state: "saving", attempt: attempt, code: CODE};
    paintSave(rec);
    api("save", rec.save.code, attempt, function (err) {
      rec.save.state = err ? "error" : "saved";
      if (!err && HIST && HIST.code === rec.save.code) HIST.attempts.push(Object.assign({date: new Date().toISOString()}, attempt));
      paintSave(rec);
    });
  }
  function saveBox(rec) {
    var box = node("p", "zsa-act-save");
    box.setAttribute("role", "status");
    rec.saveBox = box;
    paintSave(rec);
    return box;
  }
  function paintSave(rec) {
    var b = rec.saveBox, st = rec.save;
    if (!b || !st) return;
    b.replaceChildren();
    b.classList.toggle("zsa-act-save--error", st.state === "error");
    if (st.state === "saving") b.textContent = ui.saving;
    else if (st.state === "saved") b.textContent = fill(ui.saved, {code: st.code});
    else {
      b.appendChild(document.createTextNode(ui.saveFailed + " "));
      b.appendChild(button(ui.saveRetry, "zsa-act-open", function () { save(rec, st.attempt); }));
    }
  }
  function historyScreen(back) {
    if (S) leaveTest();
    S = null;
    var box = node("section", "zsa-act-history");
    var h1 = box.appendChild(heading("h1", ui.historyTitle));
    box.appendChild(node("p", "zsa-act-kind", fill(ui.historyCode, {code: CODE})));
    var body = box.appendChild(node("div", "zsa-act-history-body"));
    body.appendChild(node("p", "zsa-act-small", ui.historyLoading));
    var nav = box.appendChild(node("div", "zsa-act-nav"));
    nav.appendChild(button(ui.back, "", back));
    nav.appendChild(button(ui.codeStop, "", function () { CODE = null; HIST = null; SKIP = false; back(); }));
    show([box], h1);
    var code = CODE;
    api("history", code, null, function (err, res) {
      if (!app.contains(box)) return;
      if (!err) HIST = res;
      renderHistory(body, HIST && HIST.code === code ? HIST : {code: code, attempts: []});
    });
  }
  function renderHistory(body, hist) {
    body.replaceChildren();
    var all = hist.attempts || [];
    if (!all.length) { body.appendChild(node("p", null, ui.historyEmpty)); return; }
    var keys = cfg.order.concat(["composite"]);
    function nameOf(k) { return SECTIONS[k] ? SECTIONS[k].name : ui.compositeName; }
    function valueOf(a) { return a.score !== null && a.score !== undefined ? a.score : a.low !== null && a.low !== undefined ? Math.round((a.low + a.high) / 2) : null; }
    var scored = all.filter(function (a) { return valueOf(a) !== null; });
    var sum = section(ui.historySummaryTitle);
    if (scored.length) {
      var ul = sum.appendChild(node("ul", "zsa-act-history-lines"));
      keys.forEach(function (k) {
        var mine = scored.filter(function (a) { return a.section === k; });
        if (!mine.length) return;
        var first = valueOf(mine[0]), latest = valueOf(mine[mine.length - 1]), d = latest - first;
        ul.appendChild(node("li", null, mine.length === 1 ? fill(ui.historyLineOne, {name: nameOf(k), latest: latest})
          : fill(ui.historyLine, {name: nameOf(k), n: mine.length, tries: "practices", first: first, latest: latest,
            change: d > 0 ? fill(ui.historyUp, {d: d}) : d < 0 ? fill(ui.historyDown, {d: -d}) : ui.historySame})));
      });
      var n = scored.length, step = n <= 10 ? 1 : Math.ceil(n / 10);
      var series = keys.map(function (k) {
        return {name: nameOf(k), points: scored.map(function (a, i) { return a.section === k ? [i + 1, valueOf(a)] : null; }).filter(Boolean)};
      }).filter(function (sr) { return sr.points.length; });
      sum.appendChild(scatter({caption: ui.historyChart, xLabel: ui.historyChartX, yLabel: ui.historyChartY, xMin: 0, xMax: step * Math.ceil((n + 1) / step), xStep: step,
        yMin: 0, yMax: 36, yStep: 6, series: series}));
    }
    sum.appendChild(node("p", "zsa-act-small", ui.historyEstimateNote));
    body.appendChild(sum);
    var list = section(ui.historyAllTitle);
    list.appendChild(table({caption: fill(ui.historyCaption, {code: hist.code}), headers: ui.historyCols,
      rows: all.slice().reverse().map(function (a) {
        var est = a.score !== null && a.score !== undefined ? String(a.score) : a.low !== null && a.low !== undefined ? a.low + " to " + a.high : "";
        return [new Date(a.date).toLocaleDateString(undefined, {year: "numeric", month: "short", day: "numeric"}), nameOf(a.section),
          ui.modeNames[a.mode] || a.mode, a.correct + " / " + a.questions, est, String(Math.round(a.seconds / 60))];
      })}));
    body.appendChild(list);
  }

  var opening = window.location.hash.slice(1);
  if (Object.prototype.hasOwnProperty.call(SECTIONS, opening)) intro(opening, false); else home(false);
}());
