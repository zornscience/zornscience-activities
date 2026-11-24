// Lab bench drawings for the Free Energy Lab (1.1.0): a phase chamber whose water molecules are solid, liquid or gas
// with temperature, the ΔG versus T chart with shaded zones and a moving marker, and the link between ΔG° and K.
// They draw what lab.js gives them and never change a calculation. lab.js asks for them with zsa-fe:request-bench.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="free-energy-lab"]');
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
  // The shared bench frame: a caption line, a stage and a bottom line.
  function frame(host, caption) {
    var card = html("div", "zsa-fe-bench"), top = html("div", "zsa-fe-bench-top"), stage = html("div", "zsa-fe-bench-stage"), bottom = html("div", "zsa-fe-bench-bottom");
    top.appendChild(html("span", "zsa-fe-bench-caption", caption));
    card.appendChild(top);
    card.appendChild(stage);
    card.appendChild(bottom);
    host.appendChild(card);
    return {card: card, top: top, stage: stage, bottom: bottom};
  }

  // Water at 1 atm: melts at 273 K and boils at 373 K. The entropy meter is relative and schematic, with a larger jump
  // for boiling than for melting (about 109 versus 22 J/(mol·K) for water).
  var MELT = 273, BOIL = 373, TMIN = 150, TMAX = 500;
  function phase(temp) { return temp < MELT ? "solid" : temp === MELT ? "melting" : temp < BOIL ? "liquid" : temp === BOIL ? "boiling" : "gas"; }
  function entropyLevel(temp) {
    if (temp < MELT) return 0.06 + 0.16 * (temp - TMIN) / (MELT - TMIN);
    if (temp < BOIL) return 0.3 + 0.12 * (temp - MELT) / (BOIL - MELT);
    return 0.8 + 0.12 * (temp - BOIL) / (TMAX - BOIL);
  }
  function phaseChamber(host, options) {
    var t = options.text, temp = 298, N = 27, W = 420, H = 260, box = {x: 30, y: 24, w: 300, h: 210}, rand = random(4242);
    var motion = true, until = 0, raf = 0, last = 0;
    var parts = frame(host, t("Phase chamber: water at 1 atm"));
    var pause = html("button", "zsa-btn zsa-fe-bench-motion");
    pause.type = "button";
    pause.id = "phase-motion";
    parts.top.appendChild(pause);
    var drawing = svg("svg", {viewBox: "0 0 " + W + " " + H, role: "img", id: "phase-chamber", class: "zsa-fe-bench-svg"});
    parts.stage.appendChild(drawing);
    drawing.appendChild(svg("rect", {x: box.x - 6, y: box.y - 6, width: box.w + 12, height: box.h + 12, rx: 16, fill: "#9fd3ea", "fill-opacity": ".07", stroke: "#b9d9e8", "stroke-opacity": ".6", "stroke-width": 3}));
    var surface = svg("line", {x1: box.x, x2: box.x + box.w, stroke: "#7cc6f0", "stroke-width": 2, "stroke-dasharray": "6 5", opacity: 0});
    drawing.appendChild(surface);
    var layer = svg("g");
    drawing.appendChild(layer);
    // Thermometer and entropy meter on the right.
    var th = {x: 356, top: 30, bottom: 206};
    drawing.appendChild(svg("rect", {x: th.x - 7, y: th.top, width: 14, height: th.bottom - th.top, rx: 7, fill: "#e7f1f6", stroke: "#8fa7b6"}));
    var mercury = svg("rect", {x: th.x - 3.5, width: 7, rx: 3.5, fill: "#ef6f5c"});
    drawing.appendChild(mercury);
    drawing.appendChild(svg("circle", {cx: th.x, cy: th.bottom + 10, r: 13, fill: "#ef6f5c", stroke: "#8fa7b6"}));
    [[MELT, "273 K"], [BOIL, "373 K"]].forEach(function (m) {
      var y = th.bottom - (m[0] - TMIN) / (TMAX - TMIN) * (th.bottom - th.top);
      drawing.appendChild(svg("line", {x1: th.x + 8, x2: th.x + 16, y1: y, y2: y, stroke: "#c3d8e4"}));
      drawing.appendChild(svg("text", {x: th.x + 19, y: y + 4, class: "zsa-fe-bench-small"}, m[1]));
    });
    var molecules = [];
    for (var i = 0; i < N; i++) {
      var g = svg("g");
      g.appendChild(svg("circle", {cx: -5, cy: -4, r: 3.4, fill: "#f4f7fa"}));
      g.appendChild(svg("circle", {cx: 5, cy: -4, r: 3.4, fill: "#f4f7fa"}));
      g.appendChild(svg("circle", {r: 6.5, fill: "#ef6f5c", stroke: "#0b1f2e", "stroke-width": 1}));
      layer.appendChild(g);
      var col = i % 9, row = Math.floor(i / 9);
      molecules.push({g: g, hx: box.x + 40 + col * 27 + (row % 2) * 13, hy: box.y + box.h - 18 - row * 23, x: 0, y: 0, vx: 0, vy: 0, a: rand() * 360, spin: (rand() - 0.5) * 200, phase: rand() * 6.28, seedX: rand(), seedY: rand()});
    }
    // Where each molecule rests in a still picture of the state.
    function still(m, i, state) {
      var liquidTop = box.y + box.h * 0.5;
      if (state === "solid" || (state === "melting" && i < N / 2)) return [m.hx, m.hy];
      if (state === "gas" || (state === "boiling" && i >= N / 2)) return [box.x + 14 + m.seedX * (box.w - 28), box.y + 14 + m.seedY * (box.h - 28)];
      return [box.x + 12 + m.seedX * (box.w - 24), liquidTop + 10 + m.seedY * (box.y + box.h - liquidTop - 22)];
    }
    function regime(i) {
      var s = phase(temp);
      if (s === "melting") return i < N / 2 ? "solid" : "liquid";
      if (s === "boiling") return i < N / 2 ? "liquid" : "gas";
      return s;
    }
    function put(m) { m.g.setAttribute("transform", "translate(" + m.x.toFixed(1) + " " + m.y.toFixed(1) + ") rotate(" + m.a.toFixed(0) + ")"); }
    function settleStill() {
      var s = phase(temp);
      molecules.forEach(function (m, i) { var p = still(m, i, s); m.x = p[0]; m.y = p[1]; m.a = regime(i) === "solid" ? 0 : m.seedX * 360; put(m); });
    }
    function tick(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - (last || now)) / 1000), liquidTop = box.y + box.h * 0.5, floor = box.y + box.h;
      last = now;
      molecules.forEach(function (m, i) {
        var r = regime(i);
        if (r === "solid") {
          var amp = 0.8 + 2.6 * (Math.min(temp, MELT) - TMIN) / (MELT - TMIN);
          var tx = m.hx + Math.sin(now / 90 + m.phase) * amp, ty = m.hy + Math.cos(now / 110 + m.phase) * amp;
          m.x += (tx - m.x) * Math.min(1, dt * 6);
          m.y += (ty - m.y) * Math.min(1, dt * 6);
          m.a = ((m.a % 360) + 540) % 360 - 180;
          m.a -= m.a * Math.min(1, dt * 4);
        } else {
          var speed = r === "gas" ? 110 * Math.sqrt(temp / BOIL) : 28 * Math.sqrt(temp / 300);
          m.vx += (Math.random() - 0.5) * speed * (r === "gas" ? 0.6 : 3) * dt * 6;
          m.vy += (Math.random() - 0.5) * speed * (r === "gas" ? 0.6 : 3) * dt * 6;
          var v = Math.hypot(m.vx, m.vy) || 1;
          m.vx = m.vx / v * speed;
          m.vy = m.vy / v * speed;
          var top = r === "gas" ? box.y + 9 : liquidTop + 9;
          if (r === "liquid" && m.y < top) m.vy = Math.abs(m.vy) + 60;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          if (m.x < box.x + 9 || m.x > box.x + box.w - 9) { m.vx = -m.vx; m.x = Math.min(box.x + box.w - 9, Math.max(box.x + 9, m.x)); }
          if (m.y > floor - 9 || (m.y < top && r === "gas")) { m.vy = -m.vy; m.y = Math.min(floor - 9, Math.max(top, m.y)); }
          m.a += m.spin * dt * (r === "gas" ? 2 : 1);
        }
        put(m);
      });
      if (motion && now < until) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function wake(ms) {
      if (reduced() || !motion) { settleStill(); return; }
      until = Math.max(until, performance.now() + ms);
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function label() {
      pause.textContent = t(motion ? "Pause motion" : "Play motion");
      pause.setAttribute("aria-pressed", String(!motion));
      pause.hidden = reduced();
    }
    pause.onclick = function () { motion = !motion; label(); if (motion) wake(15000); };

    // The temperature control, the state and the entropy meter.
    var controls = html("div", "zsa-fe-bench-controls");
    var sliderLabel = html("label", "", t("Chamber temperature (K)"));
    sliderLabel.htmlFor = "phase-temperature";
    var slider = html("input");
    slider.type = "range";
    slider.id = "phase-temperature";
    slider.min = TMIN;
    slider.max = TMAX;
    slider.step = 1;
    slider.value = temp;
    controls.appendChild(sliderLabel);
    controls.appendChild(slider);
    var readout = html("p", "zsa-fe-bench-state");
    readout.id = "phase-state";
    controls.appendChild(readout);
    var meter = html("div", "zsa-fe-bench-meter");
    var meterLabel = html("span", "", t("Entropy (relative, schematic)"));
    meterLabel.id = "phase-entropy-label";
    var bar = html("meter");
    bar.id = "phase-entropy";
    bar.min = 0;
    bar.max = 1;
    bar.setAttribute("aria-labelledby", "phase-entropy-label");
    meter.appendChild(meterLabel);
    meter.appendChild(bar);
    controls.appendChild(meter);
    parts.stage.appendChild(controls);
    parts.bottom.appendChild(html("span", "", t("Melts at 273 K and boils at 373 K at 1 atm.")));

    var STATE = {solid: "Solid: molecules vibrate in a fixed lattice.", melting: "273 K: solid and liquid together while the ice melts.", liquid: "Liquid: molecules slide past their neighbors.", boiling: "373 K: liquid and gas together while the water boils.", gas: "Gas: molecules spread through the whole chamber."};
    function show(animate) {
      var s = phase(temp), y = th.bottom - (temp - TMIN) / (TMAX - TMIN) * (th.bottom - th.top);
      mercury.setAttribute("y", y.toFixed(1));
      mercury.setAttribute("height", (th.bottom + 4 - y).toFixed(1));
      surface.setAttribute("opacity", s === "liquid" || s === "boiling" || s === "melting" ? 0.7 : 0);
      surface.setAttribute("y1", box.y + box.h * 0.5);
      surface.setAttribute("y2", box.y + box.h * 0.5);
      readout.textContent = temp + " K. " + t(STATE[s]);
      bar.value = entropyLevel(temp);
      bar.textContent = t(entropyLevel(temp) < 0.25 ? "low" : entropyLevel(temp) < 0.5 ? "medium" : "high");
      slider.setAttribute("aria-valuetext", t("{t} K, {state}", {t: temp, state: t(s === "melting" ? "melting" : s === "boiling" ? "boiling" : s)}));
      drawing.setAttribute("aria-label", t("Phase chamber at {t} K.", {t: temp}) + " " + t(STATE[s]) + " " + t("Entropy is {level}.", {level: bar.textContent}));
      if (animate) wake(10000);
      else settleStill();
    }
    slider.oninput = function () { temp = Number(this.value); show(true); };
    label();
    show(false);
    return {destroy: function () { if (raf) cancelAnimationFrame(raf); raf = 0; until = 0; }};
  }

  // The ΔG versus T chart: ΔG < 0 and ΔG > 0 zones, the line, and a marker that glides to the chosen temperature.
  var lastMarker = null;
  function gibbsChart(host, o) {
    // The drawing is as wide as its card (at least 320), so its text keeps its size on a phone.
    var t = o.text, W = Math.round(Math.max(320, Math.min(620, host.clientWidth || 620))), R = W - 40, s = svg("svg", {viewBox: "0 0 " + W + " 310", role: "img", "aria-label": o.label, class: "zsa-fe-chart zsa-fe-chart-dark"});
    host.appendChild(s);
    var top = o.top, x = function (v) { return 70 + ((v - 100) / 1900) * (R - 70); }, y = function (v) { return 145 - (v / top) * 110; };
    s.appendChild(svg("rect", {x: 0, y: 0, width: W, height: 310, rx: 12, fill: "#183448"}));
    s.appendChild(svg("rect", {x: 70, y: 35, width: R - 70, height: 110, fill: "#e8596b", "fill-opacity": ".2"}));
    s.appendChild(svg("rect", {x: 70, y: 145, width: R - 70, height: 110, fill: "#3ccf8e", "fill-opacity": ".22"}));
    s.appendChild(svg("text", {x: R - 6, y: 54, "text-anchor": "end", class: "zsa-fe-zone zsa-fe-zone-up"}, o.upLabel));
    s.appendChild(svg("text", {x: R - 6, y: 246, "text-anchor": "end", class: "zsa-fe-zone zsa-fe-zone-down"}, o.downLabel));
    o.ticks.forEach(function (v) {
      s.appendChild(svg("line", {x1: 70, y1: y(v), x2: R, y2: y(v), stroke: v === 0 ? "#e7f1f6" : "#3d5e73", "stroke-width": v === 0 ? 2 : 1, "stroke-dasharray": v === 0 ? "6 4" : "none"}));
      s.appendChild(svg("text", {x: 5, y: y(v) + 4}, o.tick(v)));
    });
    [500, 1000, 1500, 2000].forEach(function (v) {
      s.appendChild(svg("line", {x1: x(v), y1: 35, x2: x(v), y2: 255, stroke: "#2f5269"}));
      s.appendChild(svg("text", {x: x(v), y: 277, "text-anchor": v === 2000 ? "end" : "middle"}, o.tick(v)));
    });
    s.appendChild(svg("line", {x1: 70, y1: 35, x2: 70, y2: 255, stroke: "#8fa7b6", "stroke-width": 2}));
    s.appendChild(svg("polyline", {points: x(100) + "," + y(o.g(100)) + " " + x(2000) + "," + y(o.g(2000)), fill: "none", stroke: "#7cb8ff", "stroke-width": 3.5}));
    var yTitle = svg("text", {x: 70, y: 20});
    o.content(yTitle, o.yTitle);
    s.appendChild(yTitle);
    s.appendChild(svg("text", {x: (70 + R) / 2, y: 303, "text-anchor": "middle"}, t("Temperature (K)")));
    var drop = svg("line", {stroke: "#ffd27a", "stroke-width": 1.5, "stroke-dasharray": "4 4", y2: 255});
    var dot = svg("circle", {r: 8, fill: "#ffd27a", stroke: "#0b1f2e", "stroke-width": 2});
    var tag = svg("text", {class: "zsa-fe-marker-label", "text-anchor": "middle"});
    s.appendChild(drop);
    s.appendChild(dot);
    s.appendChild(tag);
    function place(temp) {
      var cx = x(temp), cy = Math.max(30, Math.min(260, y(o.g(temp))));
      drop.setAttribute("x1", cx); drop.setAttribute("x2", cx); drop.setAttribute("y1", cy);
      dot.setAttribute("cx", cx.toFixed(1)); dot.setAttribute("cy", cy.toFixed(1));
      tag.setAttribute("x", Math.min(R - 50, Math.max(110, cx)).toFixed(1));
      tag.setAttribute("y", (cy < 70 ? cy + 26 : cy - 14).toFixed(1));
      tag.textContent = "T = " + o.tick(Math.round(temp)) + " K";
    }
    var from = lastMarker !== null && lastMarker.key === o.key ? lastMarker.temp : o.temp;
    lastMarker = {key: o.key, temp: o.temp};
    if (reduced() || from === o.temp) { place(o.temp); return s; }
    var start = performance.now();
    place(from);
    requestAnimationFrame(function step(now) {
      if (!s.isConnected) return;
      var k = Math.min(1, (now - start) / 350), e = 1 - Math.pow(1 - k, 3);
      place(from + (o.temp - from) * e);
      if (k < 1) requestAnimationFrame(step);
      else place(o.temp);
    });
    return s;
  }

  // ΔG° and K: energy levels on the left, the equilibrium mixture of a simple A ⇌ B reaction on the right.
  // No circles are drawn here: the K panel's log scale marker is its only circle.
  function kLink(host, options) {
    var t = options.text, N = 40, rand = random(77), shown = null, raf = 0;
    var parts = frame(host, t("Linking ΔG° and K"));
    parts.stage.classList.add("zsa-fe-link-stage");
    // Energy levels.
    var s = svg("svg", {viewBox: "-20 0 270 250", role: "img", id: "k-energy", class: "zsa-fe-bench-svg zsa-fe-link-part"});
    parts.stage.appendChild(s);
    s.appendChild(svg("text", {x: 115, y: 24, "text-anchor": "middle", class: "zsa-fe-bench-title"}, t("Standard free energy")));
    var reactBar = svg("rect", {x: 30, width: 70, height: 6, rx: 3, fill: "#7cb8ff"}), prodBar = svg("rect", {x: 130, width: 70, height: 6, rx: 3, fill: "#ffa25c"});
    var reactText = svg("text", {x: 65, "text-anchor": "middle", class: "zsa-fe-bench-small"}, t("Reactants")), prodText = svg("text", {x: 165, "text-anchor": "middle", class: "zsa-fe-bench-small"}, t("Products"));
    var gap = svg("path", {fill: "none", stroke: "#ffd27a", "stroke-width": 2.5, "stroke-linecap": "round"}), gapText = svg("text", {x: 115, "text-anchor": "middle", class: "zsa-fe-bench-value"});
    var hideLeft = svg("text", {x: 115, y: 140, "text-anchor": "middle", class: "zsa-fe-bench-mystery"}, "?");
    [reactBar, prodBar, reactText, prodText, gap, gapText, hideLeft].forEach(function (n) { s.appendChild(n); });
    // The link between them.
    var bridge = html("div", "zsa-fe-link-bridge");
    bridge.appendChild(html("span", "zsa-fe-link-formula", t("K = e^(−ΔG°/RT)")));
    var arrowMark = html("span", "zsa-fe-link-arrow");
    arrowMark.setAttribute("aria-hidden", "true");
    bridge.appendChild(arrowMark);
    var tempText = html("span", "zsa-fe-link-temp");
    bridge.appendChild(tempText);
    parts.stage.appendChild(bridge);
    // The mixture.
    var mix = svg("svg", {viewBox: "0 0 270 250", role: "img", id: "k-mixture", class: "zsa-fe-bench-svg zsa-fe-link-part"});
    parts.stage.appendChild(mix);
    mix.appendChild(svg("text", {x: 135, y: 24, "text-anchor": "middle", class: "zsa-fe-bench-title"}, t("Equilibrium mixture, A ⇌ B")));
    mix.appendChild(svg("rect", {x: 12, y: 36, width: 246, height: 176, rx: 14, fill: "#9fd3ea", "fill-opacity": ".07", stroke: "#b9d9e8", "stroke-opacity": ".6", "stroke-width": 3}));
    var tokens = [];
    for (var i = 0; i < N; i++) {
      var g = svg("g", {transform: "translate(" + (32 + (i % 8) * 29 + (rand() - 0.5) * 8).toFixed(1) + " " + (58 + Math.floor(i / 8) * 33 + (rand() - 0.5) * 8).toFixed(1) + ")"});
      var a = svg("rect", {x: -8, y: -8, width: 16, height: 16, rx: 4, fill: "#7cb8ff", stroke: "#0b1f2e"}), b = svg("rect", {x: -7, y: -7, width: 14, height: 14, fill: "#ffa25c", stroke: "#0b1f2e", transform: "rotate(45)"});
      g.appendChild(a);
      g.appendChild(b);
      mix.appendChild(g);
      tokens.push({a: a, b: b});
    }
    var hideRight = svg("text", {x: 135, y: 140, "text-anchor": "middle", class: "zsa-fe-bench-mystery"}, "?");
    mix.appendChild(hideRight);
    var mixText = svg("text", {x: 135, y: 236, "text-anchor": "middle", class: "zsa-fe-bench-small"});
    mix.appendChild(mixText);
    var key = html("p", "zsa-fe-bench-keyline", t("Squares: A (reactant). Diamonds: B (product). 40 particles in all."));
    parts.bottom.appendChild(key);
    function paint(count, visible) {
      tokens.forEach(function (tok, i) {
        var isB = i < count;
        tok.a.setAttribute("opacity", !visible ? 0.18 : isB ? 0 : 1);
        tok.b.setAttribute("opacity", !visible ? 0 : isB ? 1 : 0);
      });
    }
    function update(o) {
      var dgVisible = o.direction === "forward" || o.open, kVisible = o.direction === "reverse" || o.open;
      // Lower is lower free energy: a negative ΔG° puts the products below the reactants.
      var drop = -Math.max(-60, Math.min(60, o.dg)) * 1.35, base = 120 - drop / 2;
      reactBar.setAttribute("y", base); prodBar.setAttribute("y", base + drop);
      reactText.setAttribute("y", base - 8); prodText.setAttribute("y", base + drop - 8);
      [reactBar, prodBar, reactText, prodText, gap, gapText].forEach(function (n) { n.setAttribute("opacity", dgVisible ? 1 : 0); });
      gap.setAttribute("d", "M 115 " + (base + 3) + " V " + (base + drop + 3) + (Math.abs(drop) > 10 ? " l -5 " + (drop > 0 ? -7 : 7) + " M 115 " + (base + drop + 3) + " l 5 " + (drop > 0 ? -7 : 7) : ""));
      gapText.setAttribute("y", Math.max(base, base + drop) + 40);
      options.content(gapText, dgVisible ? o.dgLabel : "");
      hideLeft.setAttribute("opacity", dgVisible ? 0 : 1);
      hideRight.setAttribute("opacity", kVisible ? 0 : 1);
      tempText.textContent = "T = " + o.temp + " K";
      // K can overflow to Infinity (or underflow to 0) for an extreme ΔG°; the product fraction stays between 0 and 1.
      // A real K is never exactly infinite or zero, so a full or empty box still says the other species is present.
      var fraction = o.k === Infinity ? 1 : o.k > 0 ? o.k / (1 + o.k) : 0, count = Math.round(N * fraction),
        words = count === 0 ? t("B: fewer than 1 of 40") : count === N ? t("A: fewer than 1 of 40") : t("A: {a} of 40. B: {b} of 40.", {a: N - count, b: count});
      mixText.textContent = kVisible ? words : t("Check your answer to see the mixture.");
      s.setAttribute("aria-label", dgVisible ? t("Products sit {d} reactants: {g}.", {d: t(o.dg < 0 ? "below" : o.dg > 0 ? "above" : "level with"), g: o.dgPlain}) : t("ΔG° is hidden until you check your answer."));
      mix.setAttribute("aria-label", kVisible ? t("Equilibrium mixture for A ⇌ B: {w}", {w: words}) : t("The mixture is hidden until you check your answer."));
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (!kVisible) { shown = null; paint(0, false); return; }
      if (shown === null || reduced()) { shown = reduced() || shown !== null ? count : 0; }
      if (shown === count) { paint(count, true); return; }
      var startCount = shown, start = performance.now();
      raf = requestAnimationFrame(function step(now) {
        var k = Math.min(1, (now - start) / 1200);
        shown = Math.round(startCount + (count - startCount) * k);
        paint(shown, true);
        raf = k < 1 && s.isConnected ? requestAnimationFrame(step) : 0;
      });
    }
    return {node: parts.card, update: update, destroy: function () { if (raf) cancelAnimationFrame(raf); raf = 0; }};
  }

  root.addEventListener("zsa-fe:request-bench", function (e) { e.detail.receive({phaseChamber: phaseChamber, gibbsChart: gibbsChart, kLink: kLink}); });
}());
