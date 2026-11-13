(function () {
  "use strict";
  // Procedural, stylized onion root tip cells on canvas. One routine draws every cell at a point t on the cycle
  // (0 interphase, 1 prophase, 2 metaphase, 2.4 to 2.8 anaphase, 3.5 telophase, 4 two daughter cells), so the
  // microscope field, the zoomed cell, the phase icons and the cell guide animation always look the same.
  // Colors stay fixed across the lab: pink cytoplasm, magenta walls, lavender nuclei, deep indigo chromosomes.
  const COLORS = Object.freeze({
    field: "#fdf4f8", fieldEdge: "#f6dbe8", tissue: "#f7d3e3", cytoLight: "#fbd9e8", cyto: "#efa6c8", cytoEdge: "#e48ab5",
    vacuole: "#fcecf3", wall: "#a3306a", nucleus: "#bba8ee", nucleusRim: "#6f53c4", chromosome: "#25136b",
    highlight: "#7a63e0", spindle: "rgba(72, 52, 160, 0.32)", plate: "#a3306a", starch: "#7f6fb8"
  });
  const K = 6; // chromosome pairs drawn per cell: fewer than an onion's 16, so each one stays readable
  function rng(seedValue) {
    let state = seedValue >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  function smooth(a, b, v) { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); }
  function ease(u) { u = clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; }
  function mix(p, q, u) { return [lerp(p[0], q[0], u), lerp(p[1], q[1], u)]; }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  // Chromosome layout for one cell: lengths, prophase tangles and metaphase slots, all from the cell's own seed.
  function chromosomes(cell, hw, hh, L, nucleus) {
    const r = rng(cell.detail ^ 0x5bd1e995), order = [0, 1, 2, 3, 4, 5];
    for (let i = K - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const spread = Math.min(hw * 0.7, L * 0.95);
    return order.map((slot, j) => {
      const arm = L * (0.2 + r() * 0.12), angle = r() * Math.PI * 2, reach = nucleus.r * 0.5 * Math.sqrt((j + r()) / K);
      const ca = (j + r() * 0.8) / K * Math.PI * 2;
      return {arm, angle, bend: (r() - 0.5) * arm * 1.4, wave: (r() - 0.5) * arm * 1.2, home: [nucleus.x, nucleus.y], homeR: nucleus.r,
        pro: [nucleus.x + Math.cos(ca) * reach, nucleus.y + Math.sin(ca) * reach],
        x: -spread + 2 * spread * (slot + 0.5) / K + (r() - 0.5) * L * 0.05, jy: (r() - 0.5) * L * 0.05,
        curlA: r() * Math.PI * 2, curlB: r() * Math.PI * 2, lag: 0.75 + r() * 0.2, j};
    });
  }
  // One chromatid (half of a duplicated chromosome) as three points: arm end, centromere, arm end.
  // side -1 heads to the top pole, +1 to the bottom pole.
  function chromatid(c, side, t, hw, hh, L) {
    const sister = L * 0.045, rot = (x, y) => [x * Math.cos(c.angle) - y * Math.sin(c.angle), x * Math.sin(c.angle) + y * Math.cos(c.angle)];
    // Prophase: loose, wavy threads that stay inside the old nucleus.
    const pro = () => {
      const long = c.arm * 0.95, o = rot(0, side * sister * 0.6), p0 = rot(-long, c.bend), p1 = rot(long, c.wave);
      const pts = [[c.pro[0] + p0[0] + o[0], c.pro[1] + p0[1] + o[1]], [c.pro[0] + o[0], c.pro[1] + o[1]], [c.pro[0] + p1[0] + o[0], c.pro[1] + p1[1] + o[1]]];
      return pts.map(([x, y]) => {
        const dx = x - c.home[0], dy = y - c.home[1], d = Math.hypot(dx, dy), max = c.homeR * 0.86;
        return d > max ? [c.home[0] + dx * max / d, c.home[1] + dy * max / d] : [x, y];
      });
    };
    const meta = () => {
      const cy = c.jy + side * L * 0.04, ey = cy + side * c.arm * 0.9;
      return [[c.x - c.arm * 0.48, ey], [c.x, cy], [c.x + c.arm * 0.48, ey]];
    };
    const ana = u => {
      const lead = ease(u), trail = ease(u * c.lag), x = c.x * (1 - 0.22 * lead);
      const cy = lerp(c.jy + side * L * 0.04, side * hh * 0.6, lead);
      const ends = lerp(c.jy + side * c.arm * 0.9 + side * L * 0.04, side * hh * 0.6 - side * c.arm * 0.85, trail);
      const open = lerp(0.48, 0.3, trail);
      return [[x - c.arm * open, ends], [x, cy], [x + c.arm * open, ends]];
    };
    const telo = u => {
      const k = ease(u), base = ana(1), cx = lerp(base[1][0], c.x * 0.55, k), cy = lerp(base[1][1], side * hh * 0.64, k);
      const curl = side < 0 ? c.curlA : c.curlB, len = c.arm * lerp(0.95, 0.5, k);
      const e0 = [cx + Math.cos(curl) * len, cy + Math.sin(curl) * len * 0.6], e1 = [cx + Math.cos(curl + 2.2) * len, cy + Math.sin(curl + 2.2) * len * 0.6];
      return [mix(base[0], e0, k), [cx, cy], mix(base[2], e1, k)];
    };
    if (t <= 1) return pro();
    if (t < 2) { const u = ease(t - 1), a = pro(), b = meta(); return a.map((p, i) => mix(p, b[i], u)); }
    if (t <= 2.08) return meta();
    if (t < 3) return ana((t - 2.08) / 0.92);
    return telo(t - 3);
  }
  function nucleusOf(cell, hw, hh, L) {
    const r = cell.nr * L;
    return {r, x: clamp(cell.nx * hw, -hw + r * 1.05, hw - r * 1.05), y: clamp(cell.ny * hh, -hh + r * 1.05, hh - r * 1.05)};
  }
  function speckles(ctx, r, x, y, radius, alpha, count) {
    if (alpha <= 0.01) return;
    ctx.fillStyle = COLORS.chromosome;
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2, d = radius * 0.82 * Math.sqrt(r()), s = radius * (0.05 + r() * 0.05);
      ctx.globalAlpha = alpha * (0.35 + r() * 0.3);
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(0.6, s), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function interphaseNucleus(ctx, cell, x, y, radius, alpha, seedShift, chromatin = 1) {
    if (alpha <= 0.01) return;
    const r = rng(cell.detail ^ seedShift);
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
    g.addColorStop(0, "#d8cbf7"); g.addColorStop(1, COLORS.nucleus);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, radius, radius * 0.93, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = Math.max(1, radius * 0.07); ctx.strokeStyle = COLORS.nucleusRim; ctx.stroke();
    ctx.globalAlpha = 1;
    speckles(ctx, r, x, y, radius, alpha * chromatin, 16);
    ctx.globalAlpha = alpha * 0.9 * chromatin; ctx.fillStyle = COLORS.chromosome;
    ctx.beginPath(); ctx.arc(x + radius * 0.22, y - radius * 0.12, radius * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Draw one cell centered at (px, py) in canvas pixels; scale is pixels per field unit.
  function drawCell(ctx, cell, px, py, scale, t, opts = {}) {
    const gap = Math.max(0.6, scale * 0.006), hw = cell.w * scale / 2 - gap, hh = cell.h * scale / 2 - gap, L = Math.min(hw, hh);
    if (hw < 1 || hh < 1) return;
    const r = rng(cell.detail);
    ctx.save();
    ctx.translate(px, py); ctx.rotate(cell.rot);
    // Cytoplasm and wall. Older cells are mostly vacuole, with a thin rim of cytoplasm.
    roundRect(ctx, -hw, -hh, hw * 2, hh * 2, L * cell.round);
    const tone = 0.9 + r() * 0.1, g = ctx.createRadialGradient(0, -hh * 0.2, L * 0.1, 0, 0, Math.hypot(hw, hh));
    g.addColorStop(0, COLORS.cytoLight); g.addColorStop(0.65, COLORS.cyto); g.addColorStop(1, COLORS.cytoEdge);
    ctx.globalAlpha = tone; ctx.fillStyle = g; ctx.fill(); ctx.globalAlpha = 1;
    if (cell.vacuole > 0) {
      roundRect(ctx, -hw * (1 - 0.25 * (1 - cell.vacuole)) + L * 0.18, -hh + L * 0.22, hw * 2 * (1 - 0.25 * (1 - cell.vacuole)) - L * 0.36, hh * 2 - L * 0.44, L * 0.3);
      ctx.globalAlpha = 0.55 + cell.vacuole * 0.4; ctx.fillStyle = COLORS.vacuole; ctx.fill(); ctx.globalAlpha = 1;
    }
    roundRect(ctx, -hw, -hh, hw * 2, hh * 2, L * cell.round);
    ctx.lineWidth = Math.max(1, scale * 0.0085); ctx.strokeStyle = COLORS.wall; ctx.stroke();
    if (cell.region === "cap") {
      // Root cap cells hold starch grains that settle to the lower side.
      ctx.fillStyle = COLORS.starch;
      for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc((r() - 0.5) * hw * 1.2, hh * (0.55 + r() * 0.25), Math.max(0.8, L * 0.07), 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    // The spindle runs along the root axis, tilted a little from cell to cell.
    ctx.rotate(cell.tilt * smooth(0.6, 1.4, t) * (1 - smooth(3.3, 3.9, t)));
    const nucleus = nucleusOf(cell, hw, hh, L);
    if (cell.vacuole > 0 && t < 0.5) { nucleus.x = clamp(nucleus.x * 2.4, -hw + nucleus.r * 1.05, hw - nucleus.r * 1.05); }
    // Interphase nucleus fades as chromosomes condense.
    if (t < 1.6) {
      const fill = 1 - smooth(0.9, 1.55, t), rim = 1 - smooth(0.95, 1.5, t);
      if (t < 0.75) interphaseNucleus(ctx, cell, nucleus.x, nucleus.y, nucleus.r, 1, 0x2545f491, 1 - smooth(0.3, 0.72, t));
      else {
        ctx.globalAlpha = 0.55 * fill; ctx.fillStyle = COLORS.nucleus;
        ctx.beginPath(); ctx.ellipse(nucleus.x, nucleus.y, nucleus.r, nucleus.r * 0.93, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = rim; ctx.setLineDash([Math.max(2, nucleus.r * 0.22), Math.max(2, nucleus.r * 0.18)]);
        ctx.lineWidth = Math.max(1, nucleus.r * 0.07); ctx.strokeStyle = COLORS.nucleusRim; ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }
    const list = chromosomes(cell, hw, hh, L, nucleus);
    // Spindle fibers from the poles to each centromere.
    const spindle = smooth(1.3, 1.9, t) * (1 - smooth(2.9, 3.4, t));
    if (spindle > 0.02) {
      ctx.globalAlpha = spindle; ctx.strokeStyle = COLORS.spindle; ctx.lineWidth = Math.max(0.6, L * 0.02);
      list.forEach(c => [-1, 1].forEach(side => {
        const p = chromatid(c, side, t, hw, hh, L)[1];
        ctx.beginPath(); ctx.moveTo(0, side * hh * 0.93); ctx.lineTo(p[0], p[1]); ctx.stroke();
      }));
      ctx.globalAlpha = 1;
    }
    // Telophase: new nuclear envelopes around each set, and a cell plate growing across the middle.
    const envelope = smooth(3.2, 3.7, t);
    if (envelope > 0.02) {
      [-1, 1].forEach(side => {
        const ny = side * hh * 0.62, rx = Math.min(hw * 0.62, L * 0.7), ry = Math.min(hh * 0.3, L * 0.5);
        if (t > 3.82) interphaseNucleus(ctx, cell, 0, ny, Math.min(rx, ry * 1.25), smooth(3.82, 3.98, t), side < 0 ? 0x68e31da4 : 0x1b873593);
        ctx.globalAlpha = envelope * (1 - smooth(3.86, 3.98, t)) * 0.55; ctx.fillStyle = COLORS.nucleus;
        ctx.beginPath(); ctx.ellipse(0, ny, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = envelope * (1 - smooth(3.86, 3.98, t)); ctx.lineWidth = Math.max(1, L * 0.035); ctx.strokeStyle = COLORS.nucleusRim; ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }
    const plate = smooth(3.25, 3.85, t);
    if (plate > 0.02) {
      ctx.strokeStyle = COLORS.plate; ctx.lineWidth = Math.max(1.2, scale * 0.011); ctx.lineCap = "round";
      ctx.setLineDash(plate < 0.98 ? [Math.max(2, L * 0.1), Math.max(1.5, L * 0.05)] : []);
      ctx.beginPath(); ctx.moveTo(-hw * plate, 0); ctx.lineTo(hw * plate, 0); ctx.stroke(); ctx.setLineDash([]);
    }
    // Chromosomes: always the same deep indigo, thick enough to read in a small cell.
    const visible = smooth(0.32, 0.8, t) * (1 - smooth(3.78, 3.92, t));
    if (visible > 0.02) {
      const width = Math.max(1.6, L * 0.095) * (t <= 1 ? lerp(0.45, 0.72, smooth(0.32, 1, t)) : lerp(0.72, 1, smooth(1, 1.6, t)));
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      const paths = [];
      list.forEach(c => [-1, 1].forEach(side => paths.push(chromatid(c, side, t, hw, hh, L))));
      ctx.globalAlpha = visible; ctx.strokeStyle = COLORS.chromosome; ctx.lineWidth = width;
      paths.forEach(([p0, c, p1]) => {
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]);
        ctx.quadraticCurveTo(lerp(p0[0], c[0], 0.5) + (c[1] - p0[1]) * 0.12, lerp(p0[1], c[1], 0.5), c[0], c[1]);
        ctx.quadraticCurveTo(lerp(c[0], p1[0], 0.5) - (p1[1] - c[1]) * 0.12, lerp(c[1], p1[1], 0.5), p1[0], p1[1]);
        ctx.stroke();
      });
      if (L > 26 && !opts.flat) {
        ctx.globalAlpha = visible * 0.45; ctx.strokeStyle = COLORS.highlight; ctx.lineWidth = Math.max(0.8, width * 0.28);
        paths.forEach(([p0, c, p1]) => { ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); });
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  // Low power: thousands of tiny cells, so only walls, a nucleus dot and dark dividing chromosomes.
  function drawTinyCell(ctx, cell, px, py, scale) {
    const hw = cell.w * scale / 2 - 0.3, hh = cell.h * scale / 2 - 0.3, cap = cell.region === "cap";
    ctx.fillStyle = cap ? "#f7cfe0" : COLORS.cyto;
    roundRect(ctx, px - hw, py - hh, hw * 2, hh * 2, Math.min(hw, hh) * (cap ? 0.7 : 0.25));
    ctx.fill(); ctx.globalAlpha = cap ? 0.35 : 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    const L = Math.min(hw, hh);
    if (cell.phase === "interphase") {
      ctx.fillStyle = cap ? "#c9b8ee" : "#9d86e0"; ctx.beginPath(); ctx.arc(px + cell.nx * hw * 0.5, py + cell.ny * hh * 0.5, L * (cap ? 0.32 : 0.46), 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = COLORS.chromosome;
      if (cell.phase === "metaphase") ctx.fillRect(px - L * 0.6, py - L * 0.15, L * 1.2, L * 0.3);
      else if (cell.phase === "prophase") { ctx.beginPath(); ctx.arc(px, py, L * 0.5, 0, Math.PI * 2); ctx.fill(); }
      else { const d = cell.phase === "anaphase" ? 0.4 : 0.6; ctx.fillRect(px - L * 0.45, py - hh * d - L * 0.12, L * 0.9, L * 0.24); ctx.fillRect(px - L * 0.45, py + hh * d - L * 0.12, L * 0.9, L * 0.24); }
    }
  }
  // view: {size (canvas pixels), center [x, y] in field units, scale (pixels per field unit)}.
  function drawField(ctx, field, view, opts = {}) {
    const {size, scale} = view, [vx, vy] = view.center || [0, 0];
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.72);
    g.addColorStop(0, COLORS.field); g.addColorStop(1, COLORS.fieldEdge);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    const half = size / 2 / scale + 0.5, tiny = !!opts.tiny;
    const toX = x => size / 2 + (x - vx) * scale, toY = y => size / 2 + (y - vy) * scale;
    if (opts.root) {
      // The root's outline on the slide, with its cap at the bottom.
      const [ox, oy] = field.spot, half = opts.root;
      ctx.beginPath();
      for (let y = -6; y <= 3.5 - oy + 0.01; y += 0.05) ctx.lineTo(toX(-ox - half(y + oy)), toY(y));
      for (let y = 3.5 - oy; y >= -6; y -= 0.05) ctx.lineTo(toX(-ox + half(y + oy)), toY(y));
      ctx.closePath(); ctx.fillStyle = COLORS.tissue; ctx.fill();
      ctx.lineWidth = Math.max(1.5, scale * 0.03); ctx.strokeStyle = COLORS.wall; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = COLORS.wall; ctx.lineWidth = Math.max(0.5, scale * 0.012);
    field.cells.forEach(cell => {
      if (Math.abs(cell.cx - vx) > half || Math.abs(cell.cy - vy) > half) return;
      if (tiny) drawTinyCell(ctx, cell, toX(cell.cx), toY(cell.cy), scale);
      else drawCell(ctx, cell, toX(cell.cx), toY(cell.cy), scale, cell.t, opts);
    });
  }
  // A blurred copy, made once by shrinking and growing the image (cheap, and works in every browser).
  function blurred(source, factor, target) {
    const w = source.width, h = source.height, out = target || document.createElement("canvas");
    out.width = w; out.height = h;
    let current = source, cw = w, ch = h;
    const steps = [];
    while (cw / 2 >= w / factor) { cw = Math.max(1, Math.round(cw / 2)); ch = Math.max(1, Math.round(ch / 2)); steps.push([cw, ch]); }
    steps.forEach(([sw, sh]) => {
      const c = document.createElement("canvas"); c.width = sw; c.height = sh;
      const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(current, 0, 0, sw, sh); current = c;
    });
    const ctx = out.getContext("2d"); ctx.imageSmoothingQuality = "high"; ctx.drawImage(current, 0, 0, w, h);
    return out;
  }
  // The same textbook cell for icons, the guide and the check questions.
  const SAMPLE_CELL = Object.freeze({w: 0.25, h: 0.27, rot: 0, tilt: 0, nx: -0.05, ny: 0.04, nr: 0.6, vacuole: 0, round: 0.24, detail: 2654435761, region: "meristem"});
  const ICON_T = Object.freeze({interphase: 0.05, prophase: 1, metaphase: 2, anaphase: 2.62, telophase: 3.62});
  function drawSample(ctx, size, t, cell) {
    const c = cell || SAMPLE_CELL, scale = size * 0.9 / Math.max(c.w, c.h);
    ctx.clearRect(0, 0, size, size);
    drawCell(ctx, c, size / 2, size / 2, scale, t);
  }
  function icon(phase, size, ratio) {
    const canvas = document.createElement("canvas"), px = Math.round(size * (ratio || 2));
    canvas.width = px; canvas.height = px;
    drawSample(canvas.getContext("2d"), px, ICON_T[phase]);
    return canvas;
  }
  const api = {COLORS, drawCell, drawField, blurred, drawSample, icon, ICON_T, ease, smooth};
  const root = document.querySelector('[data-zsa-activity="mitosis-lab"]');
  if (root) root.addEventListener("mitosis-cells", event => event.detail.receive(api));
}());
