// Limiting Reactant Visualizer: the page. The reaction and starting moles, the predictions, the reaction box on a
// canvas (molecules drift, then gather in sets, react and move to the product side, and the excess is left stranded),
// the before, change and after table, the explanation, the questions, the reflection, printing, deep links and the
// live region. The model and the text are in model.js, reached through a "zsa-lr:request-model" event on the root
// (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="limiting-reactant"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-lr:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;

  function $(id) { return root.querySelector("#zsa-lr-" + id); }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function announce(text) {
    var live = $("live");
    live.textContent = "";
    // A fresh node after a tick, so the same words twice are still read.
    window.setTimeout(function () { live.textContent = text; }, 50);
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- The box ----------
  // In box units: the reactant side on the left, the product side on the right, an arrow between.
  var BOX = {w: 600, h: 400};
  var LEFT = {x0: 8, x1: 372, y0: 40, y1: 392}, RIGHT = {x0: 420, x1: 592, y0: 40, y1: 392};
  // Seconds: molecules gather for a reaction, products move to their places, a new reaction starts every INTERVAL
  // during React all, and a burst marks each reaction. With reduced motion everything happens at once.
  var GATHER = reduceMotion ? 0 : 0.6, MOVE = reduceMotion ? 0 : 0.7, INTERVAL = reduceMotion ? 0 : 0.5, FLASH = 0.5;
  var COLORS = {
    H: ["#f1f5f9", "#475569", "#0f172a"], O: ["#dc2626", "#7f1d1d", "#ffffff"], N: ["#2563eb", "#1e3a8a", "#ffffff"],
    C: ["#334155", "#0f172a", "#ffffff"], Cl: ["#16a34a", "#14532d", "#ffffff"], stranded: "#d97706", glow: "#fde68a", text: "#0b2a5b"
  };
  // How far each molecule reaches from its center, for the walls and spacing.
  var EXTENT = {};
  Object.keys(M.MOLECULES).forEach(function (f) {
    EXTENT[f] = Math.max.apply(null, M.MOLECULES[f].atoms.map(function (a) { return Math.sqrt(a[1] * a[1] + a[2] * a[2]) + M.ELEMENTS[a[0]].r; }));
  });

  // ---------- State ----------
  // settings: the reaction and the starting moles. p: the model's plan. done: reactions that have happened.
  // started: reactions begun (gathering or done). free: reactant molecules on the reactant side. groups: reactions
  // in progress. products: product molecules. now: animation time in seconds.
  var settings = {rxn: M.DEFAULTS.rxn, a: M.DEFAULTS.a, b: M.DEFAULTS.b};
  var p, done, started, free, groups, products, flashes, now = 0, playing = false, finished = false, nextAt = 0;

  function random(lo, hi) { return lo + Math.random() * (hi - lo); }
  function place(f, others) {
    var e = EXTENT[f], x, y;
    for (var tries = 0; tries < 400; tries++) {
      x = random(LEFT.x0 + e, LEFT.x1 - e);
      y = random(LEFT.y0 + e, LEFT.y1 - e);
      var ok = others.every(function (o) { var d = EXTENT[o.f] + e + 4; return (o.x - x) * (o.x - x) + (o.y - y) * (o.y - y) >= d * d; });
      if (ok) break;
    }
    var speed = reduceMotion ? 0 : random(10, 22), dir = random(0, 2 * Math.PI);
    return {f: f, side: f === p.rxn.reactants[0][0] ? 0 : 1, x: x, y: y, vx: speed * Math.cos(dir), vy: speed * Math.sin(dir),
      angle: random(0, 2 * Math.PI), spin: reduceMotion ? 0 : random(-0.5, 0.5)};
  }
  function reset() {
    p = M.plan(M.reaction(settings.rxn), settings.a, settings.b);
    done = 0; started = 0; groups = []; products = []; flashes = []; free = [];
    playing = false; finished = false;
    // The two reactants mixed, in random order so neither is drawn on top.
    var list = [];
    for (var i = 0; i < p.start[0]; i++) list.push(p.rxn.reactants[0][0]);
    for (i = 0; i < p.start[1]; i++) list.push(p.rxn.reactants[1][0]);
    for (i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = list[i]; list[i] = list[j]; list[j] = t; }
    list.forEach(function (f) { free.push(place(f, free)); });
    lockPredictions(false);
    show();
  }

  // A product's place on the product side: a grid of 3 columns, filled from the top.
  function slot(i) {
    var rows = Math.max(7, Math.ceil(p.sets * p.cp / 3)), cw = (RIGHT.x1 - RIGHT.x0) / 3, rh = (RIGHT.y1 - RIGHT.y0) / rows;
    return {x: RIGHT.x0 + cw * (i % 3 + 0.5), y: RIGHT.y0 + rh * (Math.floor(i / 3) + 0.5)};
  }
  // Starts one reaction: the molecule of the first reactant nearest the arrow, and the nearest others it needs.
  function startGroup() {
    var a = free.filter(function (m) { return m.side === 0; });
    var lead = a.reduce(function (best, m) { return !best || m.x > best.x ? m : best; }, null);
    var at = {x: Math.min(lead.x + 16, LEFT.x1 - 30), y: Math.max(LEFT.y0 + 30, Math.min(LEFT.y1 - 30, lead.y))};
    var members = [];
    [0, 1].forEach(function (side) {
      free.filter(function (m) { return m.side === side; })
        .sort(function (m, n) { return (m.x - at.x) * (m.x - at.x) + (m.y - at.y) * (m.y - at.y) - (n.x - at.x) * (n.x - at.x) - (n.y - at.y) * (n.y - at.y); })
        .slice(0, p.c[side]).forEach(function (m) { members.push(m); });
    });
    free = free.filter(function (m) { return members.indexOf(m) < 0; });
    members.forEach(function (m, i) {
      var ang = 2 * Math.PI * i / members.length;
      m.from = {x: m.x, y: m.y};
      m.to = {x: at.x + 15 * Math.cos(ang), y: at.y + 15 * Math.sin(ang)};
    });
    groups.push({t0: now, at: at, members: members});
    started++;
  }
  function react(g) {
    for (var i = 0; i < p.cp; i++) {
      var to = slot(products.length);
      products.push({f: p.rxn.product[0], x: g.at.x, y: g.at.y, from: {x: g.at.x + (i - (p.cp - 1) / 2) * 20, y: g.at.y}, to: to, t0: now, angle: 0});
    }
    flashes.push({x: g.at.x, y: g.at.y, t0: now});
    done++;
    showTable();
    showWhy();
    describeBox();
    printSummary();
  }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  // Moves everything on by dt seconds.
  function advance(dt) {
    now += dt;
    drift(dt);
    while (playing && started < p.sets && now >= nextAt) { startGroup(); nextAt = Math.max(nextAt + INTERVAL, now - INTERVAL); }
    groups = groups.filter(function (g) {
      var k = GATHER ? Math.min(1, (now - g.t0) / GATHER) : 1;
      g.members.forEach(function (m) { m.x = m.from.x + (m.to.x - m.from.x) * ease(k); m.y = m.from.y + (m.to.y - m.from.y) * ease(k); });
      if (k < 1) return true;
      react(g);
      return false;
    });
    products.forEach(function (q) {
      var k = MOVE ? Math.min(1, (now - q.t0) / MOVE) : 1;
      q.x = q.from.x + (q.to.x - q.from.x) * ease(k);
      q.y = q.from.y + (q.to.y - q.from.y) * ease(k);
    });
    flashes = flashes.filter(function (f) { return now - f.t0 < FLASH; });
    if (!finished && started === p.sets && !groups.length && (playing || done === p.sets && p.sets > 0)) finish();
  }
  // Free molecules drift, turn slowly, bounce off the walls of the reactant side and keep apart.
  function drift(dt) {
    if (!dt || reduceMotion) return;
    free.forEach(function (m) {
      var e = EXTENT[m.f];
      m.x += m.vx * dt; m.y += m.vy * dt; m.angle += m.spin * dt;
      if (m.x < LEFT.x0 + e) { m.x = LEFT.x0 + e; m.vx = Math.abs(m.vx); }
      if (m.x > LEFT.x1 - e) { m.x = LEFT.x1 - e; m.vx = -Math.abs(m.vx); }
      if (m.y < LEFT.y0 + e) { m.y = LEFT.y0 + e; m.vy = Math.abs(m.vy); }
      if (m.y > LEFT.y1 - e) { m.y = LEFT.y1 - e; m.vy = -Math.abs(m.vy); }
    });
    for (var i = 0; i < free.length; i++) {
      for (var j = i + 1; j < free.length; j++) {
        var m = free[i], n = free[j], dx = n.x - m.x, dy = n.y - m.y, d = Math.sqrt(dx * dx + dy * dy) || 1, min = EXTENT[m.f] + EXTENT[n.f];
        if (d >= min) continue;
        var ux = dx / d, uy = dy / d, push = (min - d) / 2;
        m.x -= ux * push; m.y -= uy * push; n.x += ux * push; n.y += uy * push;
        // Moving toward each other along the line between them: swap those parts of their velocities.
        var vm = m.vx * ux + m.vy * uy, vn = n.vx * ux + n.vy * uy;
        if (vm - vn > 0) { m.vx += (vn - vm) * ux; m.vy += (vn - vm) * uy; n.vx += (vm - vn) * ux; n.vy += (vm - vn) * uy; }
      }
    }
  }
  function finish() {
    finished = true;
    playing = false;
    lockPredictions(true);
    show();
    var pr = prediction();
    announce("The reaction stopped. " + M.resultText(p) + " " + M.stopText(p) + (pr.lines.length ? " " + pr.lines.join(" ") : ""));
  }

  // One animation loop at most: frameId is the pending frame, and a new frame is only requested when none is pending.
  // Without reduced motion it runs all the time, so the molecules keep drifting.
  var frameId = 0, last = 0;
  function loop() { if (!frameId) { last = 0; frameId = window.requestAnimationFrame(tick); } }
  function tick(t) {
    frameId = 0;
    // Real time, but at most 0.1 s per frame, so a stalled tab does not jump ahead.
    var dt = last ? Math.min(t - last, 100) / 1000 : 0;
    last = t;
    var before = done;
    advance(dt);
    draw();
    if (done !== before && !finished) showStatus();
    if (!reduceMotion) frameId = window.requestAnimationFrame(tick);
  }
  document.addEventListener("visibilitychange", function () { last = 0; });
  // With reduced motion there is no loop: each action moves everything on at once and draws.
  function nudge() { if (reduceMotion) { advance(0); draw(); show(); } else loop(); }

  // ---------- Drawing ----------
  var canvas = $("canvas"), ctx = canvas.getContext("2d"), view = {w: 0, h: 0, dpr: 1};
  function resize() {
    var rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!rect.width || !rect.height) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    view = {w: rect.width, h: rect.height, dpr: dpr};
    draw();
  }
  function molecule(c, s, m) {
    c.save();
    c.translate(m.x * s, m.y * s);
    c.rotate(m.angle || 0);
    M.MOLECULES[m.f].atoms.forEach(function (a) {
      var r = M.ELEMENTS[a[0]].r * s, col = COLORS[a[0]];
      c.beginPath();
      c.arc(a[1] * s, a[2] * s, r, 0, 2 * Math.PI);
      c.fillStyle = col[0];
      c.fill();
      c.lineWidth = Math.max(1, 1.5 * s);
      c.strokeStyle = col[1];
      c.stroke();
      if (r >= 5.5) {
        c.save();
        c.translate(a[1] * s, a[2] * s);
        c.rotate(-(m.angle || 0));
        c.fillStyle = col[2];
        c.font = "600 " + Math.round(r * (a[0].length > 1 ? 0.95 : 1.15)) + "px Inter, system-ui, sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(a[0], 0, r * 0.06);
        c.restore();
      }
    });
    c.restore();
  }
  function label(c, s, text, x, y, color, align) {
    c.font = "600 " + Math.max(11, Math.round(14 * s)) + "px Inter, system-ui, sans-serif";
    c.textAlign = align || "left";
    c.textBaseline = "alphabetic";
    c.lineWidth = 4;
    c.strokeStyle = "#ffffff";
    c.strokeText(text, x * s, y * s);
    c.fillStyle = color;
    c.fillText(text, x * s, y * s);
  }
  function draw() {
    if (!view.w || !p) return;
    var c = ctx, s = view.w / BOX.w;
    c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    c.clearRect(0, 0, view.w, view.h);
    // The product side's background, the arrow and the headings.
    c.fillStyle = "#f0fdf4";
    c.fillRect(RIGHT.x0 * s - 4 * s, 0, view.w - RIGHT.x0 * s + 4 * s, view.h);
    c.strokeStyle = "#64748b";
    c.fillStyle = "#64748b";
    c.lineWidth = Math.max(2, 3 * s);
    c.beginPath(); c.moveTo(380 * s, 210 * s); c.lineTo(408 * s, 210 * s); c.stroke();
    c.beginPath(); c.moveTo(412 * s, 210 * s); c.lineTo(402 * s, 202 * s); c.lineTo(402 * s, 218 * s); c.closePath(); c.fill();
    var excess = finished && p.limiting !== null && p.limiting !== "both" ? 1 - p.limiting : null;
    var left = excess === null ? 0 : free.filter(function (m) { return m.side === excess; }).length;
    label(c, s, finished && excess !== null && left ? "Left over: " + left + " " + M.name(p.rxn.reactants[excess][0]) + (s < 0.8 ? "" : ", nothing to react with") : "Reactants", 12, 26, finished && left ? "#92400e" : COLORS.text);
    label(c, s, "Products", 588, 26, COLORS.text, "right");
    // Bursts where molecules reacted, under everything.
    flashes.forEach(function (f) {
      var k = (now - f.t0) / FLASH;
      c.globalAlpha = 1 - k;
      c.beginPath();
      c.arc(f.x * s, f.y * s, (16 + 26 * k) * s, 0, 2 * Math.PI);
      c.fillStyle = COLORS.glow;
      c.fill();
      c.lineWidth = Math.max(2, 3 * s);
      c.strokeStyle = COLORS.stranded;
      c.stroke();
    });
    c.globalAlpha = 1;
    // Stranded molecules get a dashed amber ring once the reaction has stopped.
    if (excess !== null) {
      c.save();
      c.setLineDash([5 * s + 1, 4 * s + 1]);
      c.lineWidth = Math.max(2, 2.5 * s);
      c.strokeStyle = COLORS.stranded;
      c.globalAlpha = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(now * 4);
      free.forEach(function (m) {
        if (m.side !== excess) return;
        c.beginPath();
        c.arc(m.x * s, m.y * s, (EXTENT[m.f] + 6) * s, 0, 2 * Math.PI);
        c.stroke();
      });
      c.restore();
    }
    free.forEach(function (m) { molecule(c, s, m); });
    groups.forEach(function (g) { g.members.forEach(function (m) { molecule(c, s, m); }); });
    products.forEach(function (q) { molecule(c, s, q); });
  }
  function describeBox() { canvas.setAttribute("aria-label", M.describeBox(p, done)); }
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(canvas);

  // ---------- Set up ----------
  M.REACTIONS.forEach(function (r) {
    var o = node("option", "", r.title);
    o.value = r.id;
    $("rxn").appendChild(o);
  });
  ["a", "b"].forEach(function (k) {
    var input = $(k);
    input.min = String(M.MOLES.min);
    input.max = String(M.MOLES.max);
    input.step = String(M.MOLES.step);
  });
  function showSetup() {
    var r = M.reaction(settings.rxn);
    $("rxn").value = r.id;
    $("equation").textContent = M.equation(r);
    $("scale").textContent = M.scaleText(r) + " Molecules are drawn flat, not to scale.";
    ["a", "b"].forEach(function (k, i) {
      var f = M.name(r.reactants[i][0]), v = settings[k];
      $(k + "-label").textContent = "Starting moles of " + f;
      $(k).value = String(v);
      $(k + "-down").setAttribute("aria-label", "1 mol less " + f);
      $(k + "-up").setAttribute("aria-label", "1 mol more " + f);
      $(k + "-down").setAttribute("aria-disabled", String(v <= M.MOLES.min));
      $(k + "-up").setAttribute("aria-disabled", String(v >= M.MOLES.max));
      $("pick-" + i).textContent = f;
    });
    $("amount-label").textContent = "How many mol of " + M.name(r.product[0]) + " will form?";
    var legend = $("legend");
    clear(legend);
    var seen = {};
    r.reactants.concat([r.product]).forEach(function (sp) {
      M.MOLECULES[sp[0]].atoms.forEach(function (a) {
        if (seen[a[0]]) return;
        seen[a[0]] = true;
        legend.appendChild(node("span", "zsa-lr-key zsa-lr-key-" + a[0]));
        legend.appendChild(node("span", "zsa-lr-key-text", a[0] + " " + M.ELEMENTS[a[0]].name));
      });
    });
    legend.appendChild(node("span", "zsa-lr-key zsa-lr-key-stranded"));
    legend.appendChild(node("span", "zsa-lr-key-text", "Left over (excess)"));
  }
  var settleTimer = 0;
  function setUp(changes, clearPredictions) {
    var changed = false;
    Object.keys(changes).forEach(function (k) { if (settings[k] !== changes[k]) { settings[k] = changes[k]; changed = true; } });
    showSetup();
    if (!changed) return;
    if (clearPredictions) clearPrediction();
    reset();
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(function () { announce(M.setupText(p)); }, 400);
  }
  $("rxn").addEventListener("change", function () { setUp({rxn: $("rxn").value}, true); });
  ["a", "b"].forEach(function (k) {
    var input = $(k);
    function typed() {
      var raw = input.value.trim(), v = Number(raw);
      return raw !== "" && Number.isInteger(v) && v >= M.MOLES.min && v <= M.MOLES.max ? v : null;
    }
    input.addEventListener("input", function () {
      var v = typed(), c = {};
      if (v === null) return;
      c[k] = v;
      setUp(c, true);
    });
    // A value that is not a whole number from 0 to 10 goes back to the last good one when the field is left.
    input.addEventListener("change", function () { if (typed() === null) input.value = String(settings[k]); });
    [["down", -1], ["up", 1]].forEach(function (d) {
      $(k + "-" + d[0]).addEventListener("click", function () {
        var v = settings[k] + d[1], c = {};
        if (v < M.MOLES.min || v > M.MOLES.max) return;
        c[k] = v;
        setUp(c, true);
      });
    });
  });

  // ---------- Predictions ----------
  function picks() {
    var checked = root.querySelector('input[name="zsa-lr-pick"]:checked');
    return {pick: checked ? checked.value : "", amount: $("amount").value};
  }
  function prediction() { var x = picks(); return M.checkPrediction(p, x.pick, x.amount.trim()); }
  function lockPredictions(locked) {
    root.querySelectorAll('input[name="zsa-lr-pick"]').forEach(function (input) { input.disabled = locked; });
    $("amount").disabled = locked;
  }
  function clearPrediction() {
    root.querySelectorAll('input[name="zsa-lr-pick"]').forEach(function (input) { input.checked = false; });
    $("amount").value = "";
  }

  // ---------- Reacting ----------
  function begin() { if (started === 0) lockPredictions(true); }
  $("play").addEventListener("click", function () {
    if (finished) return;
    if (playing) {
      playing = false;
      show();
      announce("Paused after " + started + " of " + p.sets + " reactions.");
      return;
    }
    begin();
    if (p.sets === 0) { finish(); return; }
    playing = true;
    nextAt = now;
    show();
    announce("Reacting.");
    nudge();
  });
  $("once").addEventListener("click", function () {
    if (finished || playing) return;
    begin();
    if (p.sets === 0) { finish(); return; }
    if (started >= p.sets) return;
    startGroup();
    var n = started;
    show();
    if (n < p.sets) announce(M.setText(p, n));
    nudge();
  });
  $("reset").addEventListener("click", function () {
    reset();
    nudge();
    announce("Started over. " + M.setupText(p));
  });

  // ---------- Status, table and explanation ----------
  function showStatus() {
    var status;
    if (finished) status = "Stopped. " + M.resultText(p);
    else if (playing) status = "Reacting: " + done + " of " + p.sets + " reactions.";
    else if (started === 0) status = "Ready: " + p.start[0] + " " + M.name(p.rxn.reactants[0][0]) + " and " + p.start[1] + " " + M.name(p.rxn.reactants[1][0]) + " molecules. Predict, then press React all or React once.";
    else status = done + " of " + p.sets + " reactions done. Keep reacting to see where it stops.";
    $("status").textContent = status;
    $("play").textContent = playing ? "Pause" : "React all";
    $("play").setAttribute("aria-disabled", String(finished));
    $("once").setAttribute("aria-disabled", String(finished || playing || (p.sets > 0 && started >= p.sets)));
  }
  function showTable() {
    var t = M.table(p, done), head = $("thead"), body = $("tbody");
    clear(head);
    clear(body);
    head.appendChild(node("td"));
    t.species.forEach(function (f, i) {
      var th = node("th");
      th.scope = "col";
      th.appendChild(document.createTextNode(M.name(f)));
      var tag = finished && i < 2 && p.limiting !== null ? (p.limiting === "both" || p.limiting === i ? "limiting" : "excess") : i === 2 ? "product" : "";
      if (tag) th.appendChild(node("span", "zsa-lr-tag zsa-lr-tag-" + tag, tag));
      head.appendChild(th);
    });
    [["Before", t.before, M.num], ["Change", t.change, M.signed], ["After", t.after, M.num], ["Molecules in the box", t.particles, String]].forEach(function (row) {
      var tr = node("tr", row[0] === "Molecules in the box" ? "zsa-lr-count-row" : "");
      var th = node("th", "", row[0]);
      th.scope = "row";
      tr.appendChild(th);
      row[1].forEach(function (v, i) {
        var stranded = finished && row[0] === "After" && p.limiting !== null && p.limiting !== "both" && i === 1 - p.limiting && v > 0;
        tr.appendChild(node("td", stranded ? "zsa-lr-left" : "", row[2](v)));
      });
      body.appendChild(tr);
    });
  }
  function showWhy() {
    var box = $("why-body");
    clear(box);
    if (!finished) {
      box.appendChild(node("p", "zsa-lr-small", started === 0 ? "React to find out. When the reaction stops, look at which molecules are left and what they would need to react." :
        done + " of " + p.sets + " reactions so far. The explanation appears when the reaction stops."));
      return;
    }
    box.appendChild(node("p", "zsa-lr-result", M.resultText(p)));
    box.appendChild(node("p", "", M.stopText(p)));
    box.appendChild(node("p", "", M.ratioText(p)));
    var pr = prediction();
    if (p.limiting === null) return;
    if (!pr.lines.length) box.appendChild(node("p", "zsa-lr-small", "You did not make a prediction this time. Change the amounts and predict before you react."));
    pr.lines.forEach(function (line) { box.appendChild(node("p", /^✓/.test(line) ? "zsa-lr-ok" : "zsa-lr-notyet", line)); });
  }
  function show() {
    showStatus();
    showTable();
    showWhy();
    describeBox();
    printSummary();
    draw();
  }

  // ---------- Check your thinking ----------
  M.QUESTIONS.forEach(function (q, i) {
    var fs = node("fieldset", "zsa-lr-question");
    fs.appendChild(node("legend", "", (i + 1) + ". " + q.text + "..."));
    q.choices.forEach(function (ch) {
      var lab = node("label", "zsa-lr-choice"), input = node("input");
      input.type = "radio";
      input.name = "zsa-lr-q-" + q.id;
      input.value = ch.id;
      input.dataset.question = q.id;
      lab.appendChild(input);
      lab.appendChild(node("span", "", ch.text));
      fs.appendChild(lab);
    });
    $("questions").appendChild(fs);
  });
  $("check").addEventListener("click", function () {
    var answers = {};
    root.querySelectorAll("[data-question]:checked").forEach(function (input) { answers[input.dataset.question] = input.value; });
    var results = M.check(answers), box = $("feedback");
    clear(box);
    box.appendChild(node("h3", "", "Your answers"));
    results.forEach(function (r, i) { box.appendChild(node("p", r.ok ? "zsa-lr-ok" : "zsa-lr-notyet", (i + 1) + ". " + (r.ok ? "✓ " : "") + r.text)); });
    box.hidden = false;
    var right = results.filter(function (r) { return r.ok; }).length;
    announce(right + " of " + results.length + " correct. " + results.map(function (r, i) { return (i + 1) + ". " + r.text; }).join(" "));
  });

  // ---------- Reflection and printing ----------
  function printSummary() {
    if (!p) return;
    var r = p.rxn.reactants;
    $("print-summary").textContent = M.equation(p.rxn) + ", starting with " + M.mol(p.mol[0]) + " " + M.name(r[0][0]) + " and " + M.mol(p.mol[1]) + " " + M.name(r[1][0]) + ". " +
      (finished ? M.resultText(p) : done + " of " + p.sets + " reactions done.");
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  // ---------- Deep links and the back link ----------
  var params = new URLSearchParams(window.location.search);
  (function () {
    var raw = params.get("from");
    if (!raw) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      $("back").href = u.href;
    } catch (err) { /* not a URL: keep the default link */ }
  }());
  (function () {
    // Moles are used only if they are whole numbers from 0 to 10, and a reaction only if it is one of the four.
    function pick(name) {
      var raw = params.get(name);
      if (raw === null || !/^\d+$/.test(raw)) return null;
      var v = Number(raw);
      return v >= M.MOLES.min && v <= M.MOLES.max ? v : null;
    }
    if (M.reaction(params.get("rxn") || "")) settings.rxn = params.get("rxn");
    var a = pick("a"), b = pick("b");
    if (a !== null) settings.a = a;
    if (b !== null) settings.b = b;
  }());
  showSetup();
  reset();
  resize();
  nudge();
}());
