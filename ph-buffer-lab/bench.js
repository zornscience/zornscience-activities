// Lab bench drawings for the pH & Buffer Lab (1.1.0): an Explorer beaker whose universal indicator color follows pH,
// with H₃O⁺ and OH⁻ ions that change with concentration, and Stress Test beakers that take the titrant drop by drop
// while a pH scale marker moves. They draw what lab.js gives them and never change a calculation. lab.js asks for
// them with the zsa-pb:request-bench event.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ph-buffer-lab"]');
  if (!root) return;
  var NS = "http://www.w3.org/2000/svg";
  function reduced() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function svg(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function html(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function random(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Approximate universal indicator colors: red (strong acid), orange, yellow, green (neutral), blue, violet.
  var STOPS = [[0, [204, 32, 50]], [2, [232, 76, 40]], [3, [242, 128, 30]], [4, [247, 170, 40]], [5, [240, 214, 40]], [6, [170, 205, 45]], [7, [60, 170, 80]], [8, [32, 160, 150]], [9, [40, 120, 210]], [10, [60, 80, 190]], [12, [100, 50, 150]], [14, [80, 30, 115]]];
  function indicator(pH) {
    var p = Math.max(0, Math.min(14, pH));
    for (var i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i], k = (p - a[0]) / (b[0] - a[0]);
        return "rgb(" + a[1].map(function (c, j) { return Math.round(c + (b[1][j] - c) * k); }).join(",") + ")";
      }
    }
    return "rgb(80,30,115)";
  }
  function colorName(pH) {
    return pH < 2.5 ? "red" : pH < 4.5 ? "orange" : pH < 5.8 ? "yellow" : pH < 6.6 ? "yellow green" : pH < 7.6 ? "green" : pH < 8.6 ? "blue green" : pH < 10.5 ? "blue" : "violet";
  }
  function frame(host, caption) {
    var card = html("div", "zsa-pb-bench"), top = html("div", "zsa-pb-bench-top"), stage = html("div", "zsa-pb-bench-stage"), bottom = html("div", "zsa-pb-bench-bottom");
    top.appendChild(html("span", "zsa-pb-bench-caption", caption));
    card.appendChild(top);
    card.appendChild(stage);
    card.appendChild(bottom);
    host.appendChild(card);
    return {card: card, top: top, stage: stage, bottom: bottom};
  }
  // A pH strip with a moving marker, drawn inside an SVG at (x, y) with width w.
  function strip(parent, x, y, w) {
    var g = svg("g");
    for (var i = 0; i < 28; i++) g.appendChild(svg("rect", {x: x + i * w / 28, y: y, width: w / 28 + 0.6, height: 10, fill: indicator(i / 2 + 0.25)}));
    [0, 7, 14].forEach(function (v) { g.appendChild(svg("text", {x: x + v / 14 * w, y: y + 26, "text-anchor": v === 0 ? "start" : v === 14 ? "end" : "middle", class: "zsa-pb-bench-small"}, String(v))); });
    var marker = svg("path", {fill: "#ffffff", stroke: "#0b1f2e", "stroke-width": 1.2});
    g.appendChild(marker);
    parent.appendChild(g);
    return function (pH) {
      var mx = x + Math.max(0, Math.min(14, pH)) / 14 * w;
      marker.setAttribute("d", "M " + (mx - 6).toFixed(1) + " " + (y - 9) + " L " + (mx + 6).toFixed(1) + " " + (y - 9) + " L " + mx.toFixed(1) + " " + (y - 1) + " Z");
    };
  }

  // 1. pH Explorer: one beaker with universal indicator, a pH meter, and ions on a log scale.
  function explorer(host, options) {
    var t = options.text, rand = random(31), parts = frame(host, t("Beaker with universal indicator"));
    var pause = html("button", "zsa-btn zsa-pb-bench-motion");
    pause.type = "button";
    pause.id = "explore-motion";
    parts.top.appendChild(pause);
    var g = svg("svg", {viewBox: "0 0 400 300", role: "img", id: "explore-beaker", class: "zsa-pb-bench-svg"});
    parts.stage.appendChild(g);
    var liquid = svg("path", {d: "M 72 92 L 268 92 L 268 236 Q 268 248 256 248 L 84 248 Q 72 248 72 236 Z"});
    g.appendChild(liquid);
    g.appendChild(svg("rect", {x: 78, y: 92, width: 8, height: 140, rx: 4, fill: "#ffffff", "fill-opacity": ".14"}));
    var ions = svg("g");
    g.appendChild(ions);
    g.appendChild(svg("path", {d: "M 60 40 L 72 40 L 72 236 Q 72 250 86 250 L 254 250 Q 268 250 268 236 L 268 40 L 282 36", fill: "none", stroke: "#c9e4f0", "stroke-width": 3}));
    [110, 150, 190, 230].forEach(function (y) { g.appendChild(svg("line", {x1: 72, x2: 86, y1: y, y2: y, stroke: "#c9e4f0", "stroke-opacity": ".7"})); });
    // pH meter and probe.
    g.appendChild(svg("path", {d: "M 330 120 C 330 70 240 60 236 110", fill: "none", stroke: "#8fa7b6", "stroke-width": 3}));
    g.appendChild(svg("rect", {x: 228, y: 104, width: 16, height: 120, rx: 6, fill: "#d7e3ea", stroke: "#0b1f2e"}));
    g.appendChild(svg("rect", {x: 296, y: 120, width: 92, height: 64, rx: 10, fill: "#0e1d29", stroke: "#8fa7b6", "stroke-width": 2}));
    var meter = svg("text", {x: 342, y: 162, "text-anchor": "middle", class: "zsa-pb-bench-meter"});
    g.appendChild(meter);
    g.appendChild(svg("text", {x: 342, y: 140, "text-anchor": "middle", class: "zsa-pb-bench-small"}, "pH"));
    var mark = strip(g, 40, 262, 330);
    var key = html("p", "zsa-pb-bench-key");
    parts.stage.appendChild(key);
    var bottom = html("p", "zsa-pb-bench-status");
    bottom.id = "explore-bench-status";
    parts.bottom.appendChild(bottom);
    var list = [], raf = 0, until = 0, last = 0, motion = true;
    function count(c) { return Math.max(0, Math.min(32, Math.round(4 * (Math.log10(Math.max(c, 1e-30)) + 8)))); }
    function ion(kind) {
      var n = svg("g"), x = 92 + rand() * 128, y = 106 + rand() * 128;
      if (kind === "h") {
        n.appendChild(svg("circle", {r: 8, fill: "#ffd27a", stroke: "#0b1f2e"}));
        n.appendChild(svg("text", {y: 4, "text-anchor": "middle", class: "zsa-pb-ion"}, "+"));
      } else {
        n.appendChild(svg("rect", {x: -7.5, y: -7.5, width: 15, height: 15, rx: 3, fill: "#9fd8ff", stroke: "#0b1f2e"}));
        n.appendChild(svg("text", {y: 4, "text-anchor": "middle", class: "zsa-pb-ion"}, "−"));
      }
      ions.appendChild(n);
      var p = {kind: kind, n: n, x: x, y: y, vx: (rand() - 0.5) * 50, vy: (rand() - 0.5) * 50};
      place(p);
      return p;
    }
    function place(p) { p.n.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")"); }
    function tick(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      list.forEach(function (p) {
        p.vx += (Math.random() - 0.5) * 80 * dt;
        p.vy += (Math.random() - 0.5) * 80 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 88 || p.x > 222) { p.vx = -p.vx; p.x = Math.max(88, Math.min(222, p.x)); }
        if (p.y < 102 || p.y > 238) { p.vy = -p.vy; p.y = Math.max(102, Math.min(238, p.y)); }
        place(p);
      });
      if (motion && now < until) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function wake(ms) {
      if (reduced() || !motion) return;
      until = Math.max(until, performance.now() + ms);
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function label() {
      pause.textContent = t(motion ? "Pause motion" : "Play motion");
      pause.setAttribute("aria-pressed", String(!motion));
      pause.hidden = reduced();
    }
    pause.onclick = function () { motion = !motion; label(); if (motion) wake(12000); };
    label();
    var first = true, lastKey = "";
    function update(o) {
      liquid.setAttribute("fill", indicator(o.pH));
      liquid.setAttribute("fill-opacity", ".82");
      meter.textContent = o.pHText;
      mark(o.pH);
      var want = {h: count(o.h), oh: count(o.oh)};
      ["h", "oh"].forEach(function (kind) {
        var have = list.filter(function (p) { return p.kind === kind; });
        for (var i = have.length; i < want[kind]; i++) list.push(ion(kind));
        for (var j = want[kind]; j < have.length; j++) { have[j].n.remove(); list.splice(list.indexOf(have[j]), 1); }
      });
      var color = t(colorName(o.pH));
      key.textContent = t("Circles: H₃O⁺ ({h} drawn). Squares: OH⁻ ({oh} drawn). The ions are drawn on a log scale: 4 more for every 10 times the concentration.", {h: want.h, oh: want.oh});
      bottom.textContent = t("Indicator color: {color}. pH meter: {pH}.", {color: color, pH: o.pHText});
      g.setAttribute("aria-label", t("Beaker of {solute} at pH {pH}. Universal indicator is {color}. {h} H₃O⁺ and {oh} OH⁻ drawn on a log scale.", {solute: o.solute, pH: o.pHText, color: color, h: want.h, oh: want.oh}));
      // Only a real change (not a redraw after a resize) wakes the motion, and never the first drawing.
      var key2 = o.pHText + "|" + want.h + "|" + want.oh + "|" + o.solute;
      if (!first && key2 !== lastKey) wake(8000);
      first = false;
      lastKey = key2;
    }
    return {update: update, destroy: function () { if (raf) cancelAnimationFrame(raf); raf = 0; }};
  }

  // 2. Stress Test: the two beakers take the same drops. Each has a dropper, indicator color and a pH strip.
  function stressBeaker(el, options) {
    var t = options.text, titleNode = el.querySelector("title");
    el.replaceChildren(titleNode);
    el.setAttribute("viewBox", "0 0 230 250");
    el.classList.add("zsa-pb-bench-beaker");
    el.appendChild(svg("rect", {x: 0, y: 0, width: 230, height: 250, rx: 12, fill: "#183448"}));
    // Dropper.
    el.appendChild(svg("rect", {x: 106, y: 6, width: 18, height: 34, rx: 5, fill: "#d7e3ea", stroke: "#0b1f2e"}));
    el.appendChild(svg("path", {d: "M 109 40 L 121 40 L 117 56 L 113 56 Z", fill: "#d7e3ea", stroke: "#0b1f2e"}));
    var reagent = svg("text", {x: 12, y: 22, class: "zsa-pb-bench-small"}), reagentName = svg("text", {x: 12, y: 40, class: "zsa-pb-bench-small"});
    el.appendChild(reagent);
    el.appendChild(reagentName);
    var liquid = svg("rect", {x: 37, width: 156, rx: 4});
    el.appendChild(liquid);
    var drops = svg("g");
    el.appendChild(drops);
    el.appendChild(svg("path", {d: "M 30 70 L 35 70 L 35 183 Q 35 192 44 192 L 186 192 Q 195 192 195 183 L 195 70 L 204 67", fill: "none", stroke: "#c9e4f0", "stroke-width": 2.5}));
    var volumeText = svg("text", {x: 115, y: 176, "text-anchor": "middle", class: "zsa-pb-bench-volume"});
    el.appendChild(volumeText);
    var mark = strip(el, 20, 214, 190);
    var shown = null, cancel = 0, target = null;
    function level(volume) { return 191 - Math.min(1, volume / 135) * 108; }
    function paint(pH, volume) {
      var top = level(volume);
      liquid.setAttribute("y", top.toFixed(1));
      liquid.setAttribute("height", (191 - top).toFixed(1));
      liquid.setAttribute("fill", indicator(pH));
      liquid.setAttribute("fill-opacity", ".85");
      mark(pH);
      shown = {pH: pH, volume: volume};
    }
    function update(o) {
      titleNode.textContent = t("Volume {v} mL, pH {pH}. Universal indicator is {color}.", {v: o.volume.toFixed(1), pH: o.pH.toFixed(2), color: t(colorName(o.pH))});
      volumeText.textContent = o.volume.toFixed(1) + " mL";
      // A redraw of the same state (for example after a resize) lets a running drop animation finish.
      var same = target && target.pH === o.pH && target.volume === o.volume;
      if (!(o.path && o.path.length) && same) { if (!cancel) paint(o.pH, o.volume); return; }
      target = {pH: o.pH, volume: o.volume};
      if (cancel) { cancelAnimationFrame(cancel); cancel = 0; }
      drops.replaceChildren();
      var path = o.path || [];
      reagent.textContent = o.dropLabel ? o.dropLabel[0] : "";
      reagentName.textContent = o.dropLabel ? o.dropLabel[1] : "";
      if (!path.length || reduced() || !shown) { paint(o.pH, o.volume); return; }
      // Drops fall one after another; the color and the marker follow the pH after each drop.
      var start = performance.now(), each = Math.max(18, Math.min(260, 1800 / path.length)), fall = 260, startVolume = shown.volume;
      function frame(now) {
        cancel = 0;
        var elapsed = now - start, landed = Math.min(path.length, Math.floor(elapsed / each)), active = elapsed < path.length * each + fall;
        drops.replaceChildren();
        for (var i = landed; i < path.length && i < landed + 3; i++) {
          var k = (elapsed - i * each) / fall;
          if (k < 0 || k > 1) continue;
          drops.appendChild(svg("path", {d: "M 115 " + (58 + k * (level(startVolume) - 60)).toFixed(1) + " q 4 7 0 9 q -4 -2 0 -9 Z", fill: "#e7f1f6"}));
        }
        var done = Math.min(path.length, Math.floor(Math.max(0, elapsed - fall) / each) + (elapsed >= fall ? 1 : 0));
        paint(done ? path[done - 1] : shown.pH, startVolume + (o.volume - startVolume) * done / path.length);
        if (active) cancel = requestAnimationFrame(frame);
        else { drops.replaceChildren(); paint(o.pH, o.volume); }
      }
      cancel = requestAnimationFrame(frame);
    }
    return {update: update};
  }

  root.addEventListener("zsa-pb:request-bench", function (e) { e.detail.receive({explorer: explorer, stressBeaker: stressBeaker, indicator: indicator}); });
}());
