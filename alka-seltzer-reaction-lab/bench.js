(function () {
  "use strict";

  const WIDTH = 560;
  const HEIGHT = 355;
  const SURFACE = 156;
  const BASE = 280;
  const CENTER = 297;
  const CONTACT_Y = {whole: 140, quarters: 145, powder: 140};
  const TABLET = "#fff9eb";
  const OUTLINE = "#7a776b";
  const BODY = new Path2D("M162 75 Q153 82 131 81 L150 263 Q153 283 173 286 H407 Q428 283 431 262 L448 76");
  const GLASS = new Path2D("M162 75 Q153 82 131 81 L150 263 Q153 283 173 286 H407 Q428 283 431 262 L448 76 Z");
  const RIM = new Path2D("M131 81 Q153 79 161 73 C170 46 421 40 448 71 C468 96 203 109 153 87 Z");
  const BUBBLES = Array.from({length: 38}, (_, i) => ({
    x: Math.sin(i * 18.71),
    cycle: 670 + 57 * (i % 11),
    offset: i * 793,
    radius: 1.4 + 0.34 * (i % 7),
    drift: 10 + 2 * (i % 5)
  }));

  function createBench(canvas, {settings, powderCount}) {
    const ctx = canvas.getContext("2d", {alpha: false});
    ctx.scale(canvas.width / WIDTH, canvas.height / HEIGHT);
    const grains = Array.from({length: powderCount}, (_, i) => ({
      x: i === 0 ? 0 : Math.sin(i * 13.77) * (0.31 + 0.69 * (i % 11) / 10),
      y: i === 0 ? 0 : Math.cos(i * 8.27) * (i % 7) / 7,
      radius: 4 + 1.4 * (i % 5) / 4
    }));
    const fullPowder = grains.map(() => 1);

    function gradient(x1, y1, x2, y2, stops) {
      const color = ctx.createLinearGradient(x1, y1, x2, y2);
      stops.forEach(([at, shade]) => color.addColorStop(at, shade));
      return color;
    }

    function paint(path, fill, stroke, weight = 1) {
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill(path);
      }
      if (stroke) {
        ctx.lineWidth = weight;
        ctx.strokeStyle = stroke;
        ctx.stroke(path);
      }
    }

    function ellipse(x, y, rx, ry, fill, stroke, weight) {
      const path = new Path2D();
      path.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      paint(path, fill, stroke, weight);
    }

    function shadow(x, y, rx, ry, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(rx, ry);
      const fade = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      fade.addColorStop(0, "rgba(41, 66, 81," + opacity + ")");
      fade.addColorStop(1, "rgba(41, 66, 81,0)");
      ellipse(0, 0, 1, 1, fade);
      ctx.restore();
    }

    function backdrop() {
      ctx.fillStyle = gradient(0, 0, 0, HEIGHT, [[0, "#e5edf2"], [0.66, "#f8fbfc"], [0.67, "#e2edf1"], [1, "#edf3f5"]]);
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      paint(new Path2D("M0 237 H560"), null, "#d6e2e7");
      const seams = new Path2D("M0 305 H560 M76 355 L192 237 M502 355 L391 237");
      paint(seams, null, "#dbe6eb");
      shadow(290, 291, 175, 25, 0.25);
      shadow(83, 317, 77, 15, 0.23);
    }

    function paper(fold = 0) {
      const sheet = new Path2D("M33 266 L96 254 L142 283 L129 312 L77 323 L23 298 Z");
      paint(sheet, gradient(30, 260, 127, 321, [[0, "#f7f1e3"], [0.52, "#fffdf7"], [1, "#e7dfcc"]]), "#baa992", 1);
      paint(new Path2D("M23 298 L77 309 L129 299 L129 312 L77 323 Z"), "#e5dbc6", "#bcac96");
      paint(new Path2D("M33 266 L76 279 L77 309 M76 279 L96 254"), null, "#d4c7af");
      if (fold) {
        const edge = 33 + 53 * fold;
        paint(new Path2D(`M33 266 L96 254 L${edge + 46} 283 L${edge} 303 L23 298 Z`), "#f6eedb", "#baa992");
      }
    }

    function tablet(x, y, size, worn = false) {
      if (!worn) {
        ellipse(x, y + size * 0.18, size, size * 0.68, "#dfd5be", OUTLINE, 1.2);
        ellipse(x, y, size, size * 0.62, TABLET, OUTLINE, 1.1);
        ellipse(x - size * 0.07, y - size * 0.06, size * 0.83, size * 0.48, null, "#e2d8c4");
        paint(new Path2D(`M${x - size * 0.35} ${y} h${size * 0.7}`), null, "#d4ccb8", 1);
        return;
      }
      const edge = new Path2D();
      for (let i = 0; i < 16; i += 1) {
        const angle = i * Math.PI / 8;
        const radius = size * (0.91 + 0.09 * Math.cos(i * 2.13));
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius * 0.72;
        if (i === 0) edge.moveTo(px, py);
        else edge.lineTo(px, py);
      }
      edge.closePath();
      paint(edge, TABLET, OUTLINE, 1.2);
    }

    function quarter(x, y, size, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.69);
      ctx.rotate(angle);
      const wedge = new Path2D();
      wedge.moveTo(0, 0);
      wedge.lineTo(size, 0);
      wedge.arc(0, 0, size, 0, Math.PI / 2);
      wedge.closePath();
      ctx.translate(-size * 0.32, -size * 0.32);
      paint(wedge, TABLET, OUTLINE, 1.5);
      ctx.restore();
    }

    function quarters(x, y, spread, sizes) {
      sizes.forEach((size, index) => {
        if (size <= 0) return;
        const offset = [-1, -0.34, 0.34, 1][index];
        const angle = [Math.PI, Math.PI / 2, 0, -Math.PI / 2][index];
        quarter(x + offset * spread, y - (index === 1 ? 6 : 0), 10 + 12 * Math.sqrt(size), angle);
      });
    }

    function powder(x, y, spread, lift, sizes) {
      grains.forEach((grain, index) => {
        const size = sizes[index];
        if (size <= 0) return;
        const radius = index === 0 ? 4.6 + 1.7 * size : 2 + (grain.radius - 2) * size;
        ellipse(x + grain.x * spread, y + grain.y * lift, radius, radius * 0.73, TABLET, OUTLINE, 1.1);
      });
    }

    function drySolid(form, x, y) {
      if (form === "quarters") {
        quarter(x - 11, y - 8, 22, Math.PI);
        quarter(x + 11, y - 8, 22, -Math.PI / 2);
        quarter(x - 11, y + 8, 22, Math.PI / 2);
        quarter(x + 11, y + 8, 22, 0);
      } else if (form === "powder") {
        powder(x, y, 26, 14, fullPowder);
      } else {
        tablet(x, y, 22);
      }
    }

    function spatula(progress) {
      ctx.save();
      ctx.translate(77, 276 - 10 * (1 - Math.sin(progress * Math.PI)));
      ctx.rotate(-0.56 - 0.48 * (1 - progress));
      const steel = gradient(0, -9, 0, 9, [[0, "#758a99"], [0.45, "#eef7fb"], [1, "#a0b4c0"]]);
      const blade = new Path2D("M-16 -8 H18 Q23 -8 28 -3 H87 Q93 -3 93 0 Q93 3 87 3 H28 Q23 8 18 8 H-16 Q-21 8 -21 0 Q-21 -8 -16 -8 Z");
      paint(blade, steel, "#637d8b", 1);
      ctx.restore();
    }

    function liquid(level, rgb) {
      const waterline = BASE - level * (BASE - SURFACE);
      const color = rgb.join(",");
      const fluid = new Path2D(`M134 ${waterline} Q290 ${waterline + 17} 447 ${waterline} V291 H134 Z`);
      const meniscus = new Path2D(`M134 ${waterline} Q291 ${waterline - 22} 447 ${waterline} Q290 ${waterline + 18} 134 ${waterline} Z`);
      ctx.save();
      ctx.clip(GLASS);
      paint(fluid, gradient(0, waterline, 0, BASE, [[0, `rgba(${color},0.73)`], [1, `rgb(${color})`]]));
      paint(meniscus, `rgba(${color},0.58)`, "#527e91a8", 1.3);
      ctx.restore();
    }

    function glassFront() {
      const shine = gradient(132, 0, 448, 0, [[0, "#c3d6e287"], [0.17, "#ffffff70"], [0.34, "#ffffff00"], [0.75, "#ffffff00"], [1, "#7396a738"]]);
      paint(GLASS, shine);
      paint(BODY, null, "#638493", 2);
      paint(new Path2D("M140 95 L159 261 Q160 274 176 278 H402 M437 98 L421 251"), null, "#ffffffbb", 2);
      paint(RIM, "#ffffff26", "#638493", 1.8);
      paint(new Path2D("M156 91 Q289 114 442 81"), null, "#ffffffb8", 1.5);
      const marks = new Path2D("M357 107 H382 M365 132 H382 M347 156 H382 M365 181 H382 M357 205 H382 M365 229 H382 M357 253 H382");
      paint(marks, null, "#486575", 1.5);
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.fillStyle = "#2c4a58";
      ctx.fillText(settings.water + " mL", 385, 160);
    }

    function dropper(count, fraction, reduced) {
      ctx.save();
      ctx.translate(248, 12);
      ctx.rotate(0.32);
      paint(new Path2D("M-7 8 Q-14 -3 0 -6 Q14 -3 7 8 L5 18 H-5 Z"), "#234b65", "#143b55");
      paint(new Path2D("M-5 18 H5 L4 48 L1.5 59 H-1.5 L-4 48 Z"), "#acd1e8", "#4f788c", 1.2);
      ctx.restore();
      if (reduced || count >= settings.drops) return;
      const path = new Path2D("M0 -6 Q-9 5 0 6 Q9 5 0 -6 Z");
      ctx.save();
      ctx.translate(230, 72 + fraction * (SURFACE - 75));
      paint(path, "#3389c2", "#23658e");
      ctx.restore();
    }

    function rod(elapsed, reduced) {
      const x = reduced ? 202 : 202 + 7 * Math.sin(elapsed / 430);
      const path = new Path2D(`M220 24 L${x} 254`);
      ctx.lineCap = "round";
      paint(path, null, "#5f8196a8", 6);
      paint(path, null, "#e5f6ffe0", 3);
      ctx.lineCap = "butt";
    }

    function bubbles(view, y, spread) {
      const count = Math.ceil(BUBBLES.length * view.fizz);
      for (let i = 0; i < count; i += 1) {
        const bubble = BUBBLES[i];
        const life = view.reduced ? (i * 0.117) % 1 : ((view.elapsed + bubble.offset) % bubble.cycle) / bubble.cycle;
        const source = view.form === "quarters" ? [-1, -0.34, 0.34, 1][i % 4] : bubble.x;
        const x = CENTER + source * spread * 0.85 + Math.sin(life * 6 + i) * life * bubble.drift;
        const height = y - life * (y - SURFACE - 3);
        const radius = bubble.radius * (0.7 + 0.3 * life);
        ellipse(x, height, radius, radius, "#ffffff60", "#4b7184aa", 0.8);
      }
    }

    function draw(view) {
      backdrop();
      const crushing = view.preparation !== null && view.form === "powder";
      const fold = crushing ? Math.sin(Math.PI * view.preparation) : 0;
      paper(fold);
      if (view.onPaper && fold < 0.5) drySolid(view.paperForm, 83, 282);
      if (crushing) spatula(view.preparation);
      paint(GLASS, "#ffffff32");
      if (view.level > 0) liquid(view.level, view.rgb);
      if (view.wet) {
        rod(view.elapsed, view.reduced);
        const descent = view.reduced ? 1 : Math.min(1, view.elapsed / 420);
        const contact = CONTACT_Y[view.form];
        const y = contact + (BASE - contact - 6) * descent;
        const spread = view.form === "whole" ? 15 : view.form === "quarters" ? 27 + 53 * descent : 26 + 89 * descent;
        bubbles(view, Math.max(SURFACE + 4, y), spread);
        if (view.form === "quarters") {
          quarters(CENTER, Math.min(y, BASE - 13), spread, view.pieces);
        } else if (view.form === "powder") {
          const lift = 6 + (view.reduced ? 0 : 20 * Math.max(0, 1 - view.elapsed / 1400));
          powder(CENTER, Math.min(y, BASE - 8), spread, lift, view.pieces);
        } else if (view.pieces[0] > 0) {
          const size = 6 + 16 * Math.sqrt(view.pieces[0]);
          tablet(CENTER, Math.min(y, BASE - size * 0.52), size, true);
        }
      }
      glassFront();
      if (view.dosing) dropper(view.drops, view.dropFraction, view.reduced);
      if (view.transfer !== null && !view.reduced) {
        const t = view.transfer;
        drySolid(view.form, 83 + (CENTER - 83) * t, 282 + (CONTACT_Y[view.form] - 282) * t - 147 * Math.sin(Math.PI * t));
      }
    }

    return draw;
  }

  const root = document.querySelector('[data-zsa-activity="alka-seltzer-reaction-lab"]');
  root.addEventListener("zsa:alka-bench", (event) => event.detail(createBench));
}());
