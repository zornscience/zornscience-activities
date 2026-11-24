// Lab bench drawings for the Reaction Energy Lab (1.1.0): a ball that travels along the energy diagram, atoms whose
// bonds break and form on the Bond Enthalpies tab, and a flask with a thermometer for the heating curve. They draw what
// lab.js gives them and never change a calculation. lab.js asks for them with the zsa-re:request-bench event.
(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="reaction-energy-lab"]');
  if (!root) return;
  const NS = "http://www.w3.org/2000/svg";
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function svg(tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k]));
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function html(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function frame(host, caption) {
    const card = html("div", "zsa-re-bench"), top = html("div", "zsa-re-bench-top"), stage = html("div", "zsa-re-bench-stage"), bottom = html("div", "zsa-re-bench-bottom");
    top.appendChild(html("span", "zsa-re-bench-caption", caption));
    card.append(top, stage, bottom);
    host.appendChild(card);
    return {card, top, stage, bottom};
  }
  function btn(host, label, id) {
    const n = html("button", "zsa-btn zsa-re-bench-button", label);
    n.type = "button";
    n.id = id;
    host.appendChild(n);
    return n;
  }
  // Animate fn(k) for k from 0 to 1 over ms; with reduced motion, jump to 1.
  function tween(ms, fn, done) {
    if (reduced()) { fn(1); if (done) done(); return () => {}; }
    let raf = 0;
    const start = performance.now();
    const step = now => {
      const k = Math.min(1, (now - start) / ms);
      fn(k);
      if (k < 1) raf = requestAnimationFrame(step);
      else { raf = 0; if (done) done(); }
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  }

  // 1. Energy diagram: a ball rides the reaction path. Progress is a slider, and Run reaction plays it.
  function diagramBench(host, options) {
    const t = options.text, parts = frame(host, t("Reaction pathway"));
    const run = btn(parts.top, t("Run reaction"), "run-reaction");
    const drawing = html("div", "zsa-re-bench-drawing");
    parts.stage.appendChild(drawing);
    const controls = html("div", "zsa-re-bench-controls");
    const label = html("label", "", t("Reaction progress (%)"));
    label.htmlFor = "reaction-progress";
    const slider = html("input");
    slider.type = "range";
    slider.id = "reaction-progress";
    slider.min = 0;
    slider.max = 100;
    slider.step = 1;
    slider.value = 0;
    controls.append(label, slider);
    parts.stage.appendChild(controls);
    const status = html("p", "zsa-re-bench-status");
    status.id = "reaction-stage";
    parts.bottom.appendChild(status);
    let progress = 0, ball = null, halo = null, path = null, cancel = () => {};
    function stageOf(x) {
      return x < 150 ? "Reactants: bonds intact." : x < 296 ? "Climbing the barrier: energy goes in as bonds stretch and break." : x <= 324 ? "Activated complex: the highest energy point." : x < 480 ? "Downhill: new bonds form." : "Products formed.";
    }
    function place() {
      if (!path || !ball) return;
      const len = path.getTotalLength(), pt = path.getPointAtLength(len * progress);
      ball.setAttribute("cx", pt.x.toFixed(1));
      ball.setAttribute("cy", (pt.y - 13).toFixed(1));
      halo.setAttribute("cx", pt.x.toFixed(1));
      halo.setAttribute("cy", (pt.y - 13).toFixed(1));
      const words = t(stageOf(pt.x));
      status.textContent = words;
      slider.setAttribute("aria-valuetext", Math.round(progress * 100) + "%. " + words);
      slider.value = Math.round(progress * 100);
    }
    // lab.js redraws the diagram; the ball is added to the new drawing on the chosen path.
    function attach(catalyst) {
      const g = drawing.querySelector("svg");
      path = g && (catalyst && g.querySelector(".zsa-re-path-cat") || g.querySelector(".zsa-re-path"));
      if (!path) return;
      halo = svg("circle", {r: 18, fill: "#ffd27a", "fill-opacity": ".22", class: "zsa-re-ball-halo"});
      ball = svg("circle", {r: 11, fill: "#ffd27a", stroke: "#0b1f2e", "stroke-width": 2, class: "zsa-re-ball"});
      g.append(halo, ball);
      place();
    }
    slider.oninput = () => { cancel(); progress = Number(slider.value) / 100; place(); };
    run.onclick = () => {
      cancel();
      const from = progress >= 1 ? 0 : progress;
      cancel = tween(3200 * (1 - from), k => { progress = from + (1 - from) * k; place(); }, () => { options.say(t(stageOf(path ? path.getPointAtLength(path.getTotalLength()).x : 650))); });
    };
    return {drawing, attach, destroy: () => cancel()};
  }

  // 2. Bond enthalpies: atoms with their bonds. Break bonds pulls the reactant atoms apart; Form bonds builds the products.
  const ATOM = {H: ["#f4f7fa", 10], Cl: ["#6fd38a", 15], C: ["#4b5563", 14], O: ["#ef6f5c", 13], N: ["#6f9cff", 13]};
  const SCENES = {
    hcl: {atoms: [["H", [60, 90], [230, 70], [420, 90]], ["H", [104, 90], [300, 120], [420, 160]], ["Cl", [60, 165], [250, 180], [474, 90]], ["Cl", [118, 165], [330, 200], [474, 160]]],
      before: [[0, 1, 1], [2, 3, 1]], after: [[0, 2, 1], [1, 3, 1]]},
    ch4: {atoms: [["C", [90, 120], [300, 120]], ["H", [90, 72], [255, 50]], ["H", [90, 168], [330, 205]], ["H", [42, 120], [225, 140]], ["H", [138, 120], [365, 85]], ["O", [205, 80], [285, 185]], ["O", [255, 80], [395, 155]], ["O", [205, 170], [245, 95]], ["O", [255, 170], [345, 40]]],
      product: [[470, 62], [392, 182], [448, 182], [492, 182], [548, 182], [420, 62], [520, 62], [420, 152], [520, 152]],
      before: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [5, 6, 2], [7, 8, 2]], after: [[5, 0, 2], [0, 6, 2], [7, 1, 1], [7, 2, 1], [8, 3, 1], [8, 4, 1]]},
    nh3: {atoms: [["N", [60, 70], [250, 60]], ["N", [108, 70], [330, 190]], ["H", [40, 140], [220, 130]], ["H", [80, 140], [280, 205]], ["H", [125, 140], [300, 100]], ["H", [165, 140], [360, 60]], ["H", [80, 200], [240, 200]], ["H", [120, 200], [385, 130]]],
      product: [[420, 70], [520, 140], [385, 100], [420, 117], [455, 100], [485, 170], [520, 187], [555, 170]],
      before: [[0, 1, 3], [2, 3, 1], [4, 5, 1], [6, 7, 1]], after: [[0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]]}
  };
  function bondBench(host, options) {
    const t = options.text, scene = SCENES[options.id], parts = frame(host, t("Bonds breaking and forming"));
    const breakBtn = btn(parts.top, t("Break bonds"), "break-bonds"), formBtn = btn(parts.top, t("Form bonds"), "form-bonds"), resetBtn = btn(parts.top, t("Reset"), "reset-bonds");
    // On a narrow card the model runs top to bottom, so the atoms keep a readable size.
    const narrow = (host.clientWidth || 600) < 480, P = p => narrow ? [p[1] + 34, p[0] + 6] : p;
    const g = svg("svg", {viewBox: narrow ? "0 0 300 610" : "0 0 600 270", role: "img", id: "bond-scene", class: "zsa-re-bench-svg zsa-re-bond-svg" + (narrow ? " zsa-re-bond-narrow" : "")});
    parts.stage.appendChild(g);
    [["Reactants", 100], ["Separate atoms", 300], ["Products", 470]].forEach(([words, x]) => {
      g.appendChild(narrow ? svg("text", {x: 0, y: 0, "text-anchor": "middle", class: "zsa-re-bench-small", transform: "translate(16 " + (x + 6) + ") rotate(-90)"}, t(words)) : svg("text", {x, y: 254, "text-anchor": "middle", class: "zsa-re-bench-small"}, t(words)));
    });
    const bondLayer = svg("g"), atomLayer = svg("g");
    g.append(bondLayer, atomLayer);
    const atoms = scene.atoms.map((a, i) => {
      const [fill, r] = ATOM[a[0]], node = svg("g");
      node.append(svg("circle", {r, fill, stroke: "#0b1f2e", "stroke-width": 1.5}), svg("text", {y: 4, "text-anchor": "middle", class: "zsa-re-atom-label"}, a[0]));
      atomLayer.appendChild(node);
      return {node, r, pos: P(a[1]), from: P(a[1]), apart: P(a[2]), to: P(scene.product ? scene.product[i] : a[3])};
    });
    // Energy meters: bars only, no numbers, so the bond tallies stay the student's work.
    const meters = html("div", "zsa-re-bench-meters");
    function meter(id, words) {
      const wrap = html("div", "zsa-re-bench-meter"), name = html("span", "", words), bar = html("meter");
      name.id = id + "-label";
      bar.id = id;
      bar.min = 0;
      bar.max = 1;
      bar.value = 0;
      bar.setAttribute("aria-labelledby", name.id);
      wrap.append(name, bar);
      meters.appendChild(wrap);
      return bar;
    }
    const scale = Math.max(options.broken, options.formed) || 1;
    const inMeter = meter("energy-in", t("Energy absorbed breaking bonds")), outMeter = meter("energy-out", t("Energy released forming bonds"));
    parts.stage.appendChild(meters);
    const status = html("p", "zsa-re-bench-status");
    status.id = "bond-stage";
    parts.bottom.appendChild(status);
    let stage = 0, cancel = () => {};
    function bonds(list, opacity, color) {
      list.forEach(([i, j, order]) => {
        const a = atoms[i].pos, b = atoms[j].pos, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len * 5, ny = dx / len * 5;
        for (let k = 0; k < order; k++) {
          const off = k - (order - 1) / 2;
          bondLayer.appendChild(svg("line", {x1: a[0] + nx * off, y1: a[1] + ny * off, x2: b[0] + nx * off, y2: b[1] + ny * off, stroke: color, "stroke-width": 3.5, "stroke-linecap": "round", opacity}));
        }
      });
    }
    function draw(phase, k) {
      bondLayer.replaceChildren();
      atoms.forEach(a => {
        const p = phase === 0 ? a.from : phase === 1 ? lerp(a.from, a.apart, k) : lerp(a.apart, a.to, k);
        a.pos = p;
        a.node.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
      });
      if (phase === 0) bonds(scene.before, 1, "#d7e3ea");
      if (phase === 1) bonds(scene.before, Math.max(0, 1 - k * 1.4), "#ff8a8a");
      if (phase === 2) bonds(scene.after, Math.min(1, k * 1.3), "#5fe39a");
      inMeter.value = phase === 0 ? 0 : (phase === 1 ? k : 1) * options.broken / scale;
      outMeter.value = phase === 2 ? k * options.formed / scale : 0;
      const words = t(phase === 0 ? "Reactant bonds are intact." : phase === 1 ? "Breaking bonds absorbs energy." : "Forming bonds releases energy.");
      status.textContent = words;
      g.setAttribute("aria-label", t("Bond model for {equation}.", {equation: options.equation}) + " " + words);
    }
    function lerp(a, b, k) { const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]; }
    function buttons() {
      breakBtn.disabled = stage !== 0;
      formBtn.disabled = stage !== 1;
      resetBtn.disabled = stage === 0;
    }
    breakBtn.onclick = () => { cancel(); stage = 1; buttons(); cancel = tween(1400, k => draw(1, k), () => options.say(t("Breaking bonds absorbs energy."))); formBtn.focus(); };
    formBtn.onclick = () => { cancel(); stage = 2; buttons(); cancel = tween(1600, k => draw(2, k), () => options.say(t("Forming bonds releases energy."))); resetBtn.focus(); };
    resetBtn.onclick = () => { cancel(); stage = 0; buttons(); draw(0, 0); breakBtn.focus(); };
    buttons();
    draw(0, 0);
    return {destroy: () => cancel()};
  }

  // 3. Heating curve: a flask on a hot plate (or a cold plate when cooling) with a thermometer, following the curve.
  function flaskBench(host, options) {
    const t = options.text, parts = frame(host, t("Flask and thermometer"));
    const g = svg("svg", {viewBox: "0 0 420 300", role: "img", id: "heating-flask", class: "zsa-re-bench-svg zsa-re-flask"});
    parts.stage.appendChild(g);
    const defs = svg("defs"), clip = svg("clipPath", {id: "zsa-re-flask-clip"});
    const flaskPath = "M 150 40 L 150 110 L 80 238 Q 74 254 92 256 L 268 256 Q 286 254 280 238 L 210 110 L 210 40 Z";
    clip.appendChild(svg("path", {d: flaskPath}));
    defs.appendChild(clip);
    g.appendChild(defs);
    // Plate.
    const plate = svg("rect", {x: 60, y: 262, width: 240, height: 18, rx: 5}), plateGlow = svg("rect", {x: 80, y: 258, width: 200, height: 5, rx: 2.5});
    g.append(plate, plateGlow);
    const inside = svg("g", {"clip-path": "url(#zsa-re-flask-clip)"});
    g.appendChild(inside);
    const liquid = svg("rect", {x: 60, width: 240, fill: "#4fa3e0", "fill-opacity": ".55"});
    const steam = svg("g");
    const ice = svg("g");
    const bubbles = svg("g");
    inside.append(steam, liquid, ice, bubbles);
    g.appendChild(svg("path", {d: flaskPath, fill: "#9fd3ea", "fill-opacity": ".08", stroke: "#c9e4f0", "stroke-width": 3}));
    g.appendChild(svg("rect", {x: 144, y: 28, width: 72, height: 18, rx: 4, fill: "#8a6a4a"}));
    // Thermometer through the stopper.
    g.appendChild(svg("rect", {x: 174, y: 8, width: 12, height: 222, rx: 6, fill: "#e7f1f6", stroke: "#8fa7b6"}));
    const column = svg("rect", {x: 177, width: 6, rx: 3, fill: "#ef6f5c"});
    g.append(column, svg("circle", {cx: 180, cy: 234, r: 10, fill: "#ef6f5c", stroke: "#8fa7b6"}));
    const ty = temp => 222 - (temp + 20) / 140 * 200;
    [-20, 0, 20, 40, 60, 80, 100, 120].forEach(v => g.appendChild(svg("line", {x1: 176, x2: v % 100 === 0 ? 184 : 180, y1: ty(v), y2: ty(v), stroke: "#53687a"})));
    const reading = svg("text", {x: 330, y: 60, "text-anchor": "middle", class: "zsa-re-bench-reading"});
    const phaseText = svg("text", {x: 330, y: 86, "text-anchor": "middle", class: "zsa-re-bench-small"});
    const heatText = html("p", "zsa-re-bench-status");
    heatText.id = "flask-heat";
    parts.bottom.appendChild(heatText);
    g.append(reading, phaseText);
    const cubes = [[112, 214], [150, 222], [190, 214], [228, 222], [130, 190], [205, 192], [168, 196]].map(([x, y], i) => {
      const c = svg("rect", {x: x - 14, y: y - 14, width: 28, height: 28, rx: 5, fill: "#e8f6ff", "fill-opacity": ".9", stroke: "#9fd3ea", transform: "rotate(" + (i * 13 % 30 - 15) + " " + x + " " + y + ")"});
      ice.appendChild(c);
      return c;
    });
    const wisps = [[120, 150], [200, 120], [160, 190], [230, 200], [180, 70], [130, 220]].map(([x, y]) => {
      const w = svg("path", {d: "M " + x + " " + y + " q 10 -12 0 -24 q -10 -12 0 -24", fill: "none", stroke: "#e7f1f6", "stroke-width": 3, "stroke-linecap": "round", opacity: 0});
      steam.appendChild(w);
      return w;
    });
    const bubbleList = Array.from({length: 9}, (_, i) => {
      const b = svg("circle", {cx: 110 + i * 17, cy: 240, r: 3 + (i % 3), fill: "none", stroke: "#e7f1f6", "stroke-width": 1.5, opacity: 0});
      bubbles.appendChild(b);
      return {b, seed: i * 0.37};
    });
    const PHASE = ["Ice warming", "Ice melting", "Liquid water warming", "Water boiling", "Steam warming"];
    const PHASE_COOL = ["Ice cooling", "Water freezing", "Liquid water cooling", "Steam condensing", "Steam cooling"];
    let state = null, raf = 0;
    function level(s) {
      // Liquid height in the flask: none for ice and steam, melting grows it, boiling shrinks it.
      const full = 0.62, f = s.cooling ? 1 - s.fraction : s.fraction;
      return s.index === 0 ? 0 : s.index === 1 ? full * f : s.index === 2 ? full : s.index === 3 ? full * (1 - f) : 0;
    }
    function draw(now) {
      raf = 0;
      const s = state;
      const top = 256 - level(s) * 216;
      liquid.setAttribute("y", top.toFixed(1));
      liquid.setAttribute("height", (256 - top).toFixed(1));
      const f = s.cooling ? 1 - s.fraction : s.fraction, iceShown = s.index === 0 ? 1 : s.index === 1 ? 1 - f : 0;
      cubes.forEach((c, i) => c.setAttribute("opacity", i < Math.ceil(iceShown * cubes.length) ? 1 : 0));
      const steamShown = s.index === 4 ? 1 : s.index === 3 ? f : 0;
      wisps.forEach((w, i) => w.setAttribute("opacity", i < Math.ceil(steamShown * wisps.length) ? 0.75 : 0));
      const boiling = s.index === 3 && !s.cooling;
      bubbleList.forEach(({b, seed}) => {
        const k = ((now || 0) / 1400 + seed) % 1;
        b.setAttribute("opacity", boiling ? (0.9 * (1 - k)).toFixed(2) : 0);
        b.setAttribute("cy", (250 - k * Math.max(10, 250 - top - 6)).toFixed(1));
      });
      column.setAttribute("y", ty(s.temperature).toFixed(1));
      column.setAttribute("height", (234 - ty(s.temperature)).toFixed(1));
      plate.setAttribute("fill", s.cooling ? "#2f6d9a" : "#6b4a3a");
      plateGlow.setAttribute("fill", s.cooling ? "#7cc6f0" : "#ff7a4d");
      plateGlow.setAttribute("opacity", s.running ? 1 : 0.35);
      if (s.running && !reduced()) raf = requestAnimationFrame(draw);
    }
    function update(s) {
      state = s;
      const words = t((s.cooling ? PHASE_COOL : PHASE)[s.index]);
      reading.textContent = s.temperatureText + " °C";
      phaseText.textContent = words;
      heatText.textContent = t(s.cooling ? "Cold plate: removing 500 J/s" : "Hot plate: adding 500 J/s");
      g.setAttribute("aria-label", t("Flask of water at {temp} °C. {phase}.", {temp: s.temperatureText, phase: words}));
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      draw(performance.now());
    }
    return {update, destroy: () => { if (raf) cancelAnimationFrame(raf); raf = 0; }};
  }

  root.addEventListener("zsa-re:request-bench", e => e.detail.receive({diagramBench, bondBench, flaskBench}));
}());
