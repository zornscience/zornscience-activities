// The lab bench for Explore K and Q vs K: a sealed vessel whose particles convert as the run plays, and a Q versus K
// balance that tips toward the direction of shift. It draws only what lab.js tells it (the displayed mixture, Q and K)
// and never changes the chemistry. lab.js asks for it with the zsa-ek:request-bench event.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="equilibrium-k-lab"]');
  if (!root) return;
  var NS = "http://www.w3.org/2000/svg";
  // Bright versions of the curve colors (blue, orange, purple, green) that read on the dark bench.
  var GLOW = ["#7cb8ff", "#ffa25c", "#d2a2ff", "#5fe39a"];
  var W = 440, H = 300, BOX = {x: 26, y: 26, w: 388, h: 238};

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
  // A small seeded generator, so the starting arrangement is the same on every visit.
  function random(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Atoms in a formula such as N₂O₄ (6) or HI (2), for the particle size.
  function atoms(name) {
    var digits = "₀₁₂₃₄₅₆₇₈₉", total = 0, parts = name.match(/[A-Z][a-z]?[₀-₉]*/g) || [name];
    parts.forEach(function (part) {
      var n = part.replace(/^[A-Z][a-z]?/, "").split("").map(function (c) { return digits.indexOf(c); }).join("");
      total += n ? Number(n) : 1;
    });
    return Math.max(1, total);
  }
  // 1, 2 or 5 times a power of ten, so the largest mixture holds at most `most` particles.
  function particleUnit(total, most) {
    var raw = Math.max(total, 1e-12) / most, power = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 5, 10].map(function (m) { return m * power; }).find(function (u) { return u >= raw * (1 - 1e-9); });
  }
  // A species mark that does not depend on color: plain, center dot, ring, or bar.
  function glyph(group, i, radius, color) {
    group.appendChild(svg("circle", {r: radius, fill: color, stroke: "#0b1f2e", "stroke-width": 1.2}));
    if (i % 4 === 1) group.appendChild(svg("circle", {r: Math.max(1.6, radius * 0.3), fill: "#0b1f2e"}));
    if (i % 4 === 2) group.appendChild(svg("circle", {r: radius * 0.55, fill: "none", stroke: "#0b1f2e", "stroke-width": 1.6}));
    if (i % 4 === 3) group.appendChild(svg("rect", {x: -radius * 0.6, y: -1, width: radius * 1.2, height: 2, fill: "#0b1f2e"}));
  }

  function create(host, options) {
    var r = options.reaction, t = options.text, sf = options.format, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var activeIdx = r.species.map(function (s, i) { return i; }).filter(function (i) { return options.active(i); });
    var radii = r.species.map(function (s) { return 6 + 2.2 * Math.sqrt(atoms(s)); });
    var rand = random(20260 + r.species.join("").length), particles = [], unit = null, unitLabel = "", motion = !reduced, until = 0, frame = 0, last = 0, swapClock = 0, state = null, tilt = 0, tiltTarget = 0, first = true;

    var card = html("div", "zsa-ek-bench");
    var top = html("div", "zsa-ek-bench-top");
    var caption = html("span", "zsa-ek-bench-caption", t("Sealed reaction vessel"));
    var pause = html("button", "zsa-btn zsa-ek-bench-motion");
    pause.type = "button";
    pause.id = "bench-motion";
    top.appendChild(caption);
    top.appendChild(pause);
    card.appendChild(top);
    var stage = html("div", "zsa-ek-bench-stage");
    card.appendChild(stage);

    // The vessel.
    var vesselWrap = html("figure", "zsa-ek-bench-vessel");
    var vessel = svg("svg", {viewBox: "0 0 " + W + " " + H, role: "img", id: "bench-vessel"});
    var defs = svg("defs");
    var glass = svg("linearGradient", {id: "zsa-ek-glass", x1: 0, x2: 1, y1: 0, y2: 0});
    [["0", "#9fd3ea", ".28"], [".08", "#9fd3ea", ".06"], [".9", "#9fd3ea", ".04"], ["1", "#9fd3ea", ".24"]].forEach(function (s) {
      glass.appendChild(svg("stop", {offset: s[0], "stop-color": s[1], "stop-opacity": s[2]}));
    });
    defs.appendChild(glass);
    vessel.appendChild(defs);
    vessel.appendChild(svg("rect", {x: BOX.x - 8, y: BOX.y - 8, width: BOX.w + 16, height: BOX.h + 16, rx: 22, fill: "url(#zsa-ek-glass)", stroke: "#b9d9e8", "stroke-opacity": ".55", "stroke-width": 3}));
    vessel.appendChild(svg("rect", {x: BOX.x + 8, y: BOX.y, width: 6, height: BOX.h - 30, rx: 3, fill: "#ffffff", "fill-opacity": ".12"}));
    var solids = r.species.map(function (s, i) { return i; }).filter(function (i) { return !options.active(i); });
    if (solids.length) {
      var heap = svg("g", {"aria-hidden": "true"});
      var rs = random(99);
      for (var c = 0; c < 26; c++) {
        var cx = BOX.x + 30 + rs() * (BOX.w - 60), size = 7 + rs() * 7;
        heap.appendChild(svg("rect", {x: cx, y: BOX.y + BOX.h - size - rs() * 8, width: size, height: size, rx: 1.5, fill: c % 2 ? "#d8d2c4" : "#b9b2a3", stroke: "#6f6a5f", transform: "rotate(" + Math.round(rs() * 40 - 20) + " " + (cx + size / 2) + " " + (BOX.y + BOX.h - size / 2) + ")"}));
      }
      vessel.appendChild(heap);
      vessel.appendChild(svg("text", {x: W / 2, y: BOX.y + BOX.h - 30, "text-anchor": "middle", class: "zsa-ek-bench-solid"}, solids.map(function (i) { return r.species[i] + "(s)"; }).join(" + ") + ": " + t("excess solid")));
    }
    var layer = svg("g");
    vessel.appendChild(layer);
    vesselWrap.appendChild(vessel);
    var key = html("ul", "zsa-ek-bench-key");
    vesselWrap.appendChild(key);
    stage.appendChild(vesselWrap);

    // The balance: Q on the left pan, K on the right. The heavier side sinks, and the reaction shifts that way.
    var balanceWrap = html("figure", "zsa-ek-bench-balance");
    var balance = svg("svg", {viewBox: "0 0 300 260", role: "img", id: "bench-balance"});
    balance.appendChild(svg("text", {x: 150, y: 22, "text-anchor": "middle", class: "zsa-ek-bench-title"}, t("Q vs K balance")));
    balance.appendChild(svg("rect", {x: 144, y: 118, width: 12, height: 104, rx: 3, fill: "#8fa7b6"}));
    balance.appendChild(svg("path", {d: "M 92 236 L 208 236 L 196 220 L 104 220 Z", fill: "#6f8796"}));
    balance.appendChild(svg("text", {x: 12, y: 254, class: "zsa-ek-bench-side"}, "◀ " + t("Reactants")));
    balance.appendChild(svg("text", {x: 288, y: 254, "text-anchor": "end", class: "zsa-ek-bench-side"}, t("Products") + " ▶"));
    var beam = svg("g");
    beam.appendChild(svg("rect", {x: 36, y: 112, width: 228, height: 9, rx: 4.5, fill: "#d7e3ea"}));
    beam.appendChild(svg("circle", {cx: 150, cy: 116.5, r: 8, fill: "#25445a", stroke: "#d7e3ea", "stroke-width": 3}));
    balance.appendChild(beam);
    function pan(label, color) {
      var g = svg("g");
      g.appendChild(svg("path", {d: "M -26 0 L 0 -46 L 26 0", fill: "none", stroke: "#9fb6c4", "stroke-width": 1.5}));
      g.appendChild(svg("path", {d: "M -34 0 Q 0 16 34 0 Z", fill: "#9fb6c4"}));
      g.appendChild(svg("rect", {x: -22, y: -30, width: 44, height: 28, rx: 5, fill: color, stroke: "#0b1f2e", "stroke-width": 1.2}));
      var name = svg("text", {x: 0, y: -10, "text-anchor": "middle", class: "zsa-ek-bench-weight"}, label);
      g.appendChild(name);
      var value = svg("text", {x: 0, y: 34, "text-anchor": "middle", class: "zsa-ek-bench-value"});
      g.appendChild(value);
      balance.appendChild(g);
      return {g: g, value: value};
    }
    var qPan = pan("Q", "#ffa25c"), kPan = pan(options.constant, "#7cb8ff");
    var mystery = svg("text", {x: 150, y: 92, "text-anchor": "middle", class: "zsa-ek-bench-mystery"}, "?");
    balance.appendChild(mystery);
    var arrow = svg("path", {fill: "none", stroke: "#5fe39a", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round"});
    balance.appendChild(arrow);
    balanceWrap.appendChild(balance);
    var verdict = html("p", "zsa-ek-bench-verdict");
    balanceWrap.appendChild(verdict);
    balanceWrap.appendChild(html("p", "zsa-ek-bench-note", t("The balance tips toward the side the reaction shifts to.")));
    stage.appendChild(balanceWrap);

    var bottom = html("div", "zsa-ek-bench-bottom");
    var status = html("span", "zsa-ek-bench-status");
    var scale = html("span", "zsa-ek-bench-scale");
    bottom.appendChild(status);
    bottom.appendChild(scale);
    card.appendChild(bottom);
    host.appendChild(card);

    function motionLabel() {
      pause.textContent = t(motion ? "Pause motion" : "Play motion");
      pause.setAttribute("aria-pressed", String(!motion));
      pause.hidden = reduced;
    }
    pause.onclick = function () {
      motion = !motion;
      motionLabel();
      if (motion) wake(15000);
    };
    motionLabel();

    function place(p, x, y) {
      p.x = x;
      p.y = y;
      p.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
    }
    function spot(near) {
      var pad = 12;
      if (near) return [Math.min(BOX.x + BOX.w - pad, Math.max(BOX.x + pad, near.x + (rand() - 0.5) * 26)), Math.min(BOX.y + BOX.h - pad, Math.max(BOX.y + pad, near.y + (rand() - 0.5) * 26))];
      return [BOX.x + pad + rand() * (BOX.w - 2 * pad), BOX.y + pad + rand() * (BOX.h - 2 * pad - (solids.length ? 34 : 0))];
    }
    function draw(p) {
      p.g.replaceChildren();
      p.ring = svg("circle", {r: radii[p.sp] + 4, fill: "none", stroke: "#ffffff", "stroke-width": 2, opacity: 0});
      p.g.appendChild(p.ring);
      glyph(p.g, p.sp, radii[p.sp], GLOW[p.sp % GLOW.length]);
    }
    function add(sp, near) {
      var p = {sp: sp, g: svg("g"), flash: 0, vx: (rand() - 0.5) * 70, vy: (rand() - 0.5) * 70};
      draw(p);
      var xy = spot(near);
      place(p, xy[0], xy[1]);
      layer.appendChild(p.g);
      particles.push(p);
      return p;
    }
    function convert(p, sp) {
      p.sp = sp;
      draw(p);
      p.flash = reduced ? 0 : 1;
    }
    function counts() {
      return r.species.map(function (s, i) { return particles.filter(function (p) { return p.sp === i; }).length; });
    }
    // Move particles to the target counts: convert first (a reactant becomes a product, or back), then add or remove.
    function settle(target) {
      var have = counts(), surplus = [], deficit = [], made = [];
      activeIdx.forEach(function (i) {
        for (var n = target[i]; n < have[i]; n++) surplus.push(i);
        for (var m = have[i]; m < target[i]; m++) deficit.push(i);
      });
      while (surplus.length && deficit.length) {
        var from = surplus.shift(), to = deficit.shift(), pool = particles.filter(function (p) { return p.sp === from; });
        var picked = pool[Math.floor(rand() * pool.length)];
        convert(picked, to);
        made.push(picked);
      }
      surplus.forEach(function (i) {
        var pool = particles.filter(function (p) { return p.sp === i; }), gone = pool[Math.floor(rand() * pool.length)];
        gone.g.remove();
        particles.splice(particles.indexOf(gone), 1);
      });
      deficit.forEach(function (i, n) {
        var fresh = add(i, made.length ? made[n % made.length] : null);
        fresh.flash = reduced ? 0 : 1;
      });
      return made.length + surplus.length + deficit.length;
    }

    function step(now) {
      frame = 0;
      var dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      particles.forEach(function (p) {
        var rad = radii[p.sp], x = p.x + p.vx * dt, y = p.y + p.vy * dt, floor = BOX.y + BOX.h - (solids.length ? 34 : 0);
        if (x < BOX.x + rad || x > BOX.x + BOX.w - rad) { p.vx = -p.vx; x = Math.min(BOX.x + BOX.w - rad, Math.max(BOX.x + rad, x)); }
        if (y < BOX.y + rad || y > floor - rad) { p.vy = -p.vy; y = Math.min(floor - rad, Math.max(BOX.y + rad, y)); }
        place(p, x, y);
        if (p.flash > 0) {
          p.flash = Math.max(0, p.flash - dt * 1.8);
          p.ring.setAttribute("opacity", p.flash.toFixed(2));
          p.ring.setAttribute("r", (radii[p.sp] + 4 + (1 - p.flash) * 8).toFixed(1));
        }
      });
      // Dynamic equilibrium: at equilibrium one particle reacts forward while another reacts back, so the counts hold.
      if (state && state.equilibrium) {
        swapClock += dt;
        if (swapClock > 0.7) {
          swapClock = 0;
          var reactants = activeIdx.filter(function (i) { return r.nu[i] < 0; }), products = activeIdx.filter(function (i) { return r.nu[i] > 0; });
          var a = particles.filter(function (p) { return reactants.indexOf(p.sp) >= 0; }), b = particles.filter(function (p) { return products.indexOf(p.sp) >= 0; });
          if (a.length && b.length) {
            var pa = a[Math.floor(rand() * a.length)], pb = b[Math.floor(rand() * b.length)], sa = pa.sp;
            convert(pa, pb.sp);
            convert(pb, sa);
          }
        }
      }
      // The beam eases toward its angle.
      tilt += (tiltTarget - tilt) * Math.min(1, dt * 6);
      beamAt(tilt);
      if (motion && now < until) frame = requestAnimationFrame(step);
      else last = 0;
    }
    function wake(ms) {
      if (reduced || !motion) { beamAt(tiltTarget); return; }
      until = Math.max(until, performance.now() + ms);
      if (!frame) frame = requestAnimationFrame(step);
    }
    function beamAt(angle) {
      tilt = angle;
      var rad = angle * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
      beam.setAttribute("transform", "rotate(" + angle.toFixed(2) + " 150 116.5)");
      qPan.g.setAttribute("transform", "translate(" + (150 - 104 * cos).toFixed(1) + " " + (116.5 - 104 * sin + 52).toFixed(1) + ")");
      kPan.g.setAttribute("transform", "translate(" + (150 + 104 * cos).toFixed(1) + " " + (116.5 + 104 * sin + 52).toFixed(1) + ")");
    }

    function update(next) {
      state = next;
      var active = activeIdx.map(function (i) { return next.values[i]; });
      // The scale is set from the mixture and its endpoint before a run, and kept for the whole run.
      if (unit === null || next.endpoint) {
        var most = Math.max(active.reduce(function (a, b) { return a + b; }, 0), (next.endpoint || []).filter(function (v, i) { return options.active(i); }).reduce(function (a, b) { return a + b; }, 0));
        var fresh = most > 0 ? particleUnit(most, 48) : unit || 0.1;
        if (unit !== null && Math.abs(fresh / unit - 1) > 1e-9) { particles.forEach(function (p) { p.g.remove(); }); particles = []; }
        unit = fresh;
        unitLabel = options.unitFormat(unit) + " " + options.unit;
      }
      var target = next.values.map(function (v, i) { return options.active(i) ? Math.round(v / unit) : 0; });
      var changed = settle(target);
      // The first drawing is a still picture: nothing moves until the student runs or changes the mixture.
      if (first) { particles.forEach(function (p) { p.flash = 0; }); changed = 0; }
      // The key and the text alternative.
      key.replaceChildren();
      var parts = [];
      activeIdx.forEach(function (i) {
        var item = html("li"), mark = svg("svg", {viewBox: "-12 -12 24 24", "aria-hidden": "true", focusable: "false", class: "zsa-ek-bench-mark"}), g = svg("g");
        glyph(g, i, radii[i], GLOW[i % GLOW.length]);
        mark.appendChild(g);
        item.appendChild(mark);
        var count = target[i] === 0 && next.values[i] > 0 ? t("fewer than 1 particle") : target[i] === 1 ? t("1 particle") : t("{n} particles", {n: target[i]});
        item.appendChild(document.createTextNode(r.species[i] + ": " + count));
        key.appendChild(item);
        parts.push(r.species[i] + ": " + count);
      });
      vessel.setAttribute("aria-label", t("Reaction vessel: {list}. 1 particle = {unit}.", {list: parts.join("; "), unit: unitLabel}));
      scale.textContent = t("1 particle = {unit}", {unit: unitLabel});
      status.textContent = next.equilibrium && next.time ? t("Equilibrium reached. Forward and reverse reactions continue at equal rates.") : next.time ? t("Step {s} of 80", {s: next.time}) : t("Ready. Press Run.");
      // The balance.
      var direction = next.direction, show = next.revealed && direction !== "undefined";
      tiltTarget = !show || direction === "equal" ? 0 : Math.max(-1, Math.min(1, (Math.log10(next.k) - Math.log10(Math.max(next.q, 1e-300))) / 2)) * 16;
      if (show && direction !== "equal" && Math.abs(tiltTarget) < 1.5) tiltTarget = tiltTarget < 0 ? -1.5 : 1.5;
      qPan.value.textContent = Number.isNaN(next.q) ? "?" : sf(next.q);
      kPan.value.textContent = sf(next.k);
      mystery.setAttribute("opacity", show ? 0 : 1);
      arrow.setAttribute("d", !show || direction === "equal" ? "" : direction === "right" ? "M 176 70 H 236 l -9 -7 M 236 70 l -9 7" : "M 124 70 H 64 l 9 -7 M 64 70 l 9 7");
      var words = direction === "undefined" ? "Q is undefined for this empty mixture." : !next.revealed ? "Predict the shift, then reveal it." : direction === "equal" ? "Q = K: at equilibrium." : direction === "right" ? "Q < K: shift right." : "Q > K: shift left.";
      verdict.textContent = t(words);
      balance.setAttribute("aria-label", t("Q vs K balance: Q = {q}; {constant} = {k}. {verdict}", {q: Number.isNaN(next.q) ? "?" : sf(next.q), constant: options.constant, k: sf(next.k), verdict: t(words)}));
      if (reduced || !motion) {
        particles.forEach(function (p) { p.ring.setAttribute("opacity", 0); });
        beamAt(tiltTarget);
      } else if (first) beamAt(tiltTarget);
      else if (changed || next.running || tiltTarget !== tilt) wake(next.running ? 4000 : 8000);
      first = false;
    }
    function destroy() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      until = 0;
    }
    return {update: update, destroy: destroy};
  }

  root.addEventListener("zsa-ek:request-bench", function (e) { e.detail.receive({create: create}); });
}());
