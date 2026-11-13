(function () {
  "use strict";
  // Genetics Lab: Crossing Fruit Flies. The page: steps, drawings, the Punnett square and the copy panel.
  // The genetics lives in model.js and every student-facing word in data.js; both arrive through one-use events.
  const root = document.querySelector('[data-zsa-activity="fruit-fly-genetics-lab"]');
  if (!root) return;
  let model, data;
  root.dispatchEvent(new CustomEvent("fruit-fly-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("fruit-fly-data", {detail: {receive: api => { data = api; }}}));
  if (!model || !data) return;

  const params = new URLSearchParams(location.search);
  // ?lang=es always renders Spanish so it can be proofread in place. The EN / ES toggle, the only link students
  // would follow, appears only once data.SPANISH_PUBLISHED is true.
  const lang = params.get("lang") === "es" ? "es" : "en";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pinned = model.normalizeSeed(params.get("seed"));
  const seed = pinned !== null ? pinned : crypto.getRandomValues(new Uint32Array(1))[0];
  const $ = id => root.querySelector("#zsa-ff-" + id);

  function t(key, values) {
    const table = data.I18N[lang];
    let text = Object.hasOwn(table, key) ? table[key] : data.I18N.en[key];
    if (text === undefined) { console.error("fruit-fly-genetics-lab: missing text " + key); text = key; }
    return text.replace(/\{(\w+)\}/g, (match, name) => values && values[name] !== undefined ? String(values[name]) : match);
  }
  function el(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    });
    kids.flat(Infinity).forEach(kid => { if (kid !== null && kid !== undefined && kid !== false) node.append(kid); });
    return node;
  }
  function svg(tag, attrs, parent, text) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  // Percentages to one decimal place (62.5%), so two shares add to 100.
  const pct = x => String(Math.round(1000 * x) / 10);
  function announce(text) {
    const live = $("live");
    live.textContent = "";
    requestAnimationFrame(() => { live.textContent = text; });
  }

  // ---------- Words for genetics ----------
  const T = model.TRAITS;
  const traitName = key => t("trait." + key);
  const phenWords = p => t("phen." + p);
  function phenotypeText(genotype) {
    const p = model.phenotype(genotype);
    return model.traitsOf(genotype).map(k => phenWords(p[k])).join(", ");
  }
  function phenKeyText(key) { return key.split("|").map(phenWords).join(", "); }
  function zygosityText(pair) { return t("zyg." + model.zygosity(pair).replace(" ", "-")); }
  function genotypeSpoken(genotype) { return genotype.split("").map(a => a === a.toUpperCase() ? t("spoken.capital", {a}) : t("spoken.lower", {a})).join(" "); }
  // A ratio in lowest terms with its phenotypes: "3 : 1 (normal wings : vestigial wings)".
  function ratioText(exp) { return t("ratio.text", {ratio: exp.ratio.join(" : "), names: exp.keys.map(phenKeyText).join(" : ")}); }
  function fullPhen(genotype) {
    const p = Object.assign({wings: "normal", eyes: "red"}, model.phenotype(genotype));
    return p.wings + "-" + p.eyes;
  }

  // ---------- State ----------
  function crossState(trait, p1, p2) {
    return {trait, p1, p2, placed: emptyCells(2), tries: 0, solved: false, shown: false, prediction: null, predictionRight: false,
      runs: {}, runIndex: 0, latest: null, animate: false, reflection: null};
  }
  function emptyCells(n) { return Array.from({length: n}, () => Array.from({length: n}, () => [null, null])); }
  function fresh() {
    return {
      step: 0, selected: null,
      hook: {choice: null},
      // The builder starts at NNRR, so each goal takes a change. The starting fly counts as seen.
      traits: {alleles: ["N", "N", "R", "R"], seen: {"normal|red": {NNRR: true}}, goals: {vestigial: false, hetRed: false, same: false}},
      cross1: crossState("wings", "Nn", "nn"),
      f2: crossState("wings", "Nn", "Nn"),
      mystery: {flies: model.mysteryFlies(seed), current: 0, tests: [0, 1, 2].map(() => ({batches: 0, offspring: [], choice: null, solved: false, animate: false}))},
      checks: {answers: [null, null, null, null]},
      di: Object.assign(crossState("both", "NnRr", "NnRr"), {top: [null, null, null, null], side: [null, null, null, null]}),
      copied: false
    };
  }
  let state = fresh();

  // ---------- Fly drawings ----------
  const EYE = {red: "#c81e1e", sepia: "#4a2410"};
  function flyShape(parent, phen) {
    const [wings, eyes] = phen.split("-");
    const g = svg("g", {}, parent);
    svg("path", {d: "M45 42L28 33M44 50L25 52M45 58L29 71M55 42L72 33M56 50L75 52M55 58L71 71", fill: "none", stroke: "#3b2a1a", "stroke-width": 2.4, "stroke-linecap": "round"}, g);
    [false, true].forEach(mirror => {
      const side = svg("g", mirror ? {transform: "translate(100 0) scale(-1 1)"} : {}, g);
      if (wings === "vestigial") {
        svg("path", {d: "M46 41C40 40 34 44 35 50C37 49 38 53 41 51C41 55 44 55 45 52C47 49 47 45 46 41Z", fill: "#dbe7f3", stroke: "#4b6480", "stroke-width": 1.5}, side);
      } else {
        svg("path", {d: "M46 39C33 39 17 61 21 84C24 95 38 89 44 70C46 60 47 49 46 39Z", fill: "#e3eef9", "fill-opacity": .9, stroke: "#4b6480", "stroke-width": 1.5}, side);
        svg("path", {d: "M45 46C38 58 31 71 27 83M45 52C41 64 37 76 36 87", fill: "none", stroke: "#7d93ab", "stroke-width": 1}, side);
      }
    });
    svg("ellipse", {cx: 50, cy: 66, rx: 11, ry: 17, fill: "#d9a441", stroke: "#5b3b12", "stroke-width": 1.6}, g);
    svg("path", {d: "M40 60Q50 64 60 60M39.5 67Q50 71 60.5 67M41 74Q50 78 59 74", fill: "none", stroke: "#5b3b12", "stroke-width": 2.6}, g);
    svg("ellipse", {cx: 50, cy: 44, rx: 10, ry: 10, fill: "#b07a2e", stroke: "#5b3b12", "stroke-width": 1.6}, g);
    svg("path", {d: "M47 20L42 12M53 20L58 12", fill: "none", stroke: "#3b2a1a", "stroke-width": 2, "stroke-linecap": "round"}, g);
    svg("ellipse", {cx: 50, cy: 27, rx: 9, ry: 8, fill: "#c58b3a", stroke: "#5b3b12", "stroke-width": 1.6}, g);
    [42.5, 57.5].forEach(cx => svg("ellipse", {cx, cy: 25.5, rx: 5.2, ry: 6.6, fill: EYE[eyes], stroke: "#22110a", "stroke-width": 1.2}, g));
    return g;
  }
  // One sprite of the four looks, so a vial of 400 flies is 400 <use> elements.
  function buildSprite() {
    const sprite = svg("svg", {class: "zsa-ff-sprite", "aria-hidden": "true", focusable: "false", width: 0, height: 0});
    ["normal-red", "normal-sepia", "vestigial-red", "vestigial-sepia"].forEach(p => {
      const symbol = svg("symbol", {id: "zsa-ff-fly-" + p, viewBox: "0 0 100 100"}, sprite);
      flyShape(symbol, p);
    });
    root.append(sprite);
  }
  function flyPicture(genotype, label, size) {
    const node = svg("svg", {viewBox: "0 0 100 100", role: "img", "aria-label": label, class: "zsa-ff-fly" + (size ? " zsa-ff-fly--" + size : "")});
    svg("title", {}, node, label);
    flyShape(node, fullPhen(genotype));
    return node;
  }
  function flyCard(heading, genotype, opts = {}) {
    const words = phenotypeText(genotype);
    const label = opts.hideGenotype ? words : t("fly.label", {phenotype: words, genotype});
    return el("figure", {class: "zsa-ff-flycard"},
      flyPicture(genotype, label, opts.size),
      el("figcaption", {}, el("strong", {text: heading}), el("span", {text: words}),
        opts.hideGenotype ? el("span", {class: "zsa-ff-mono", text: opts.genotypeText || ""}) : el("span", {class: "zsa-ff-mono", text: t("fly.genotype", {genotype})})));
  }

  // A vial with its flies. New flies appear in small batches unless reduced motion is on.
  let vialFrame = 0;
  function vial(offspring, label, animate) {
    const W = 420, H = 300, x0 = 34, y0 = 50, w = 352, h = 208;
    const node = svg("svg", {viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": label, class: "zsa-ff-vial"});
    svg("title", {}, node, label);
    svg("rect", {x: 20, y: 34, width: 380, height: 260, rx: 30, fill: "#f4fbff", stroke: "#6c8aa3", "stroke-width": 3}, node);
    svg("rect", {x: 23, y: 262, width: 374, height: 29, rx: 14, fill: "#e8cf8c", stroke: "#b69149", "stroke-width": 1.5}, node);
    svg("rect", {x: 140, y: 6, width: 140, height: 36, rx: 10, fill: "#f2efe6", stroke: "#a39b84", "stroke-width": 2}, node);
    svg("path", {d: "M154 16H266M154 26H266", stroke: "#c9c1aa", "stroke-width": 2}, node);
    const n = offspring.length, flies = svg("g", {}, node);
    if (!n) return node;
    // The largest fly size (up to 60) whose rows still fit above the food.
    let size = 60;
    while (size > 10 && Math.ceil(n / Math.max(1, Math.floor(w / size))) * size > h) size--;
    const cols = Math.max(1, Math.floor(w / size));
    const uses = offspring.map((g, i) => {
      const cx = x0 + (w - cols * size) / 2 + (i % cols) * size + size / 2;
      const cy = y0 + Math.floor(i / cols) * size + size / 2;
      const turn = ((i * 47) % 50) - 25;
      return svg("use", {href: "#zsa-ff-fly-" + fullPhen(g), x: -size / 2, y: -size / 2, width: size, height: size,
        transform: "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ") rotate(" + turn + ")"});
    });
    cancelAnimationFrame(vialFrame);
    if (!animate || reduced) { uses.forEach(u => flies.append(u)); return node; }
    const start = performance.now(), duration = Math.min(1200, 150 + n * 6);
    let shown = 0;
    function step(now) {
      const target = Math.min(n, Math.ceil(n * Math.min(1, (now - start) / duration)));
      while (shown < target) flies.append(uses[shown++]);
      if (shown < n && node.isConnected) vialFrame = requestAnimationFrame(step);
    }
    vialFrame = requestAnimationFrame(step);
    return node;
  }

  // 100% stacked bars: the prediction first, then each sample. Patterns and labels, not color alone, tell
  // the phenotypes apart; the table next to it is the exact text alternative.
  const FILLS = [["#1f6f43", ""], ["#f3c74a", "hatch"], ["#2d5fa8", "dots"], ["#ffffff", "cross"]];
  function chart(host, keys, bars, title) {
    host.replaceChildren();
    const width = Math.max(300, Math.min(720, host.clientWidth || 600)), height = 300;
    const node = svg("svg", {viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": title, class: "zsa-ff-chart"}, host);
    svg("title", {}, node, title);
    const defs = svg("defs", {}, node);
    const ids = {};
    FILLS.forEach(([color, pattern], i) => {
      if (!pattern) return;
      const id = "zsa-ff-pat-" + i + "-" + host.id;
      ids[i] = id;
      const p = svg("pattern", {id, width: 8, height: 8, patternUnits: "userSpaceOnUse"}, defs);
      svg("rect", {width: 8, height: 8, fill: color}, p);
      if (pattern === "hatch") svg("path", {d: "M-2 2L2 -2M0 8L8 0M6 10L10 6", stroke: "#5c4600", "stroke-width": 1.6}, p);
      if (pattern === "dots") svg("circle", {cx: 4, cy: 4, r: 1.6, fill: "#ffffff"}, p);
      if (pattern === "cross") svg("path", {d: "M0 0L8 8M8 0L0 8", stroke: "#334155", "stroke-width": 1.2}, p);
    });
    const left = 44, top = 16, plotH = 200, right = width - 8;
    const slot = (right - left) / bars.length, barW = Math.min(64, slot * 0.6);
    [0, 25, 50, 75, 100].forEach(v => {
      const y = top + plotH - v / 100 * plotH;
      svg("path", {d: "M" + left + " " + y + "H" + right, stroke: v ? "#d6e2f5" : "#334155", "stroke-width": v ? 1 : 1.5}, node);
      svg("text", {x: left - 6, y: y + 4, "text-anchor": "end", class: "zsa-ff-chart-text"}, node, v + "%");
    });
    bars.forEach((bar, b) => {
      const x = left + slot * b + (slot - barW) / 2;
      let y = top + plotH;
      keys.forEach((key, i) => {
        const share = bar.total ? bar.counts[key] / bar.total : 0, hgt = share * plotH;
        if (hgt <= 0) return;
        y -= hgt;
        svg("rect", {x, y, width: barW, height: hgt, fill: ids[i] ? "url(#" + ids[i] + ")" : FILLS[i][0], stroke: "#1e293b", "stroke-width": 1, "stroke-dasharray": bar.predicted ? "5 3" : "0"}, node);
        if (hgt >= 18) {
          const label = svg("text", {x: x + barW / 2, y: y + hgt / 2 + 5, "text-anchor": "middle", class: "zsa-ff-chart-value"}, node, pct(share) + "%");
          // White text on the solid fills; dark text with a white halo on the patterned ones.
          if (i === 0 || i === 2) label.setAttribute("fill", "#ffffff");
          else { label.setAttribute("fill", "#1e293b"); label.setAttribute("stroke", "#ffffff"); label.setAttribute("stroke-width", "4"); label.setAttribute("paint-order", "stroke"); }
        }
      });
      svg("text", {x: x + barW / 2, y: top + plotH + 22, "text-anchor": "middle", class: "zsa-ff-chart-text zsa-ff-chart-strong"}, node, bar.label);
      if (bar.sub) svg("text", {x: x + barW / 2, y: top + plotH + 40, "text-anchor": "middle", class: "zsa-ff-chart-text"}, node, bar.sub);
    });
    // Legend: swatch and words for each phenotype.
    const legend = el("ul", {class: "zsa-ff-legend"});
    keys.forEach((key, i) => {
      const sw = svg("svg", {viewBox: "0 0 20 20", width: 20, height: 20, "aria-hidden": "true", focusable: "false"});
      svg("rect", {x: 1, y: 1, width: 18, height: 18, fill: ids[i] ? "url(#" + ids[i] + ")" : FILLS[i][0], stroke: "#1e293b"}, sw);
      legend.append(el("li", {}, sw, el("span", {text: phenKeyText(key)})));
    });
    legend.append(el("li", {class: "zsa-ff-legend-note", text: t("chart.dashed")}));
    host.append(legend);
  }

  // ---------- Choices (native radios styled as cards) ----------
  let groupCount = 0;
  function choiceGroup(legend, options, value, onPick, opts = {}) {
    const name = "zsa-ff-choice-" + (++groupCount);
    const field = el("fieldset", {class: "zsa-ff-choices" + (opts.compact ? " zsa-ff-choices--compact" : "")}, el("legend", {text: legend}));
    options.forEach(o => {
      const input = el("input", {type: "radio", name, value: o.value, "data-key": (opts.key || name) + ":" + o.value, disabled: o.disabled});
      input.checked = o.value === value;
      input.addEventListener("change", () => onPick(o.value));
      const mark = o.mark ? el("span", {class: "zsa-ff-mark", text: o.mark}) : null;
      field.append(el("label", {class: "zsa-ff-choice" + (o.status ? " zsa-ff-choice--" + o.status : "")}, input, el("span", {text: o.label}), mark));
    });
    return field;
  }
  function feedback(kind, text) {
    if (!text) return null;
    return el("p", {class: "zsa-ff-feedback zsa-ff-feedback--" + kind}, el("span", {class: "zsa-ff-feedback-mark", "aria-hidden": "true", text: kind === "good" ? "✓" : kind === "info" ? "i" : "↻"}), el("span", {text}));
  }
  function button(text, onclick, opts = {}) {
    const node = el("button", {type: "button", class: "zsa-btn" + (opts.primary ? " zsa-btn--primary" : "") + (opts.cls ? " " + opts.cls : ""), "data-key": opts.key || text, disabled: opts.disabled}, text);
    node.addEventListener("click", onclick);
    return node;
  }

  // ---------- Steps ----------
  const STEPS = [
    {id: "hook", render: renderHook, done: () => state.hook.choice !== null},
    {id: "traits", render: renderTraits, done: () => Object.values(state.traits.goals).every(Boolean)},
    {id: "punnett", render: renderPunnett, done: () => state.cross1.solved && state.cross1.predictionRight},
    {id: "run", render: renderRun, done: () => model.SAMPLE_SIZES.every(n => state.cross1.runs[n]) && state.cross1.reflection === "closer"},
    {id: "f2", render: renderF2, done: () => state.f2.predictionRight && !!state.f2.runs[200]},
    {id: "mystery", render: renderMystery, done: () => state.mystery.tests.every(x => x.solved)},
    {id: "checks", render: renderChecks, done: () => checksDone()},
    {id: "bonus", render: renderBonus, done: () => !!state.di.runs[model.DIHYBRID_SIZES[2]], optional: true, locked: () => !checksDone()},
    {id: "copy", render: renderCopy, done: () => state.copied}
  ];
  function stepTitle(i) { return t("step." + STEPS[i].id); }

  function renderNav() {
    const list = $("step-list");
    list.replaceChildren();
    STEPS.forEach((s, i) => {
      const locked = s.locked && s.locked(), done = s.done();
      const status = locked ? t("nav.locked") : done ? t("nav.done") : "";
      const name = (s.optional ? t("nav.bonus") : t("nav.step", {n: i + 1})) + ": " + stepTitle(i) + (status ? " (" + status + ")" : "");
      const b = el("button", {type: "button", class: "zsa-ff-chip", "aria-label": name, title: name, "data-key": "nav:" + i,
        "aria-current": i === state.step ? "step" : null, "aria-disabled": locked ? "true" : null},
      el("span", {"aria-hidden": "true", text: s.optional ? "★" : String(i + 1)}),
      done ? el("span", {class: "zsa-ff-chip-done", "aria-hidden": "true", text: "✓"}) : null,
      locked ? el("span", {class: "zsa-ff-chip-lock", "aria-hidden": "true", text: "·"}) : null);
      b.addEventListener("click", () => {
        if (locked) { announce(t("nav.lockedNote")); return; }
        go(i);
      });
      list.append(el("li", {}, b));
    });
  }
  function nextIndex(from) {
    for (let i = from + 1; i < STEPS.length; i++) if (!(STEPS[i].locked && STEPS[i].locked())) return i;
    return -1;
  }
  function prevIndex(from) {
    for (let i = from - 1; i >= 0; i--) if (!(STEPS[i].locked && STEPS[i].locked())) return i;
    return -1;
  }
  function go(i, quiet) {
    state.step = i; state.selected = null;
    render(false);
    if (!quiet) {
      $("step-title").focus();
      $("stage").scrollIntoView({block: "start", behavior: reduced ? "auto" : "smooth"});
    }
  }
  // Re-render everything, keeping keyboard focus on the same control when it still exists.
  function render(keepFocus = true) {
    const active = document.activeElement, key = keepFocus && active && root.contains(active) ? active.getAttribute("data-key") : null;
    renderNav();
    const i = state.step, s = STEPS[i];
    $("step-count").textContent = s.optional ? t("nav.bonusCount") : t("nav.count", {n: i + 1, total: STEPS.length});
    $("step-title").textContent = stepTitle(i);
    const body = $("step-body");
    body.replaceChildren();
    s.render(body);
    const back = prevIndex(i), next = nextIndex(i);
    $("prev").hidden = back < 0;
    $("next").hidden = next < 0;
    if (next >= 0) $("next").textContent = t("nav.next", {title: stepTitle(next)});
    if (key) {
      const again = root.querySelector('[data-key="' + CSS.escape(key) + '"]');
      if (again && !again.disabled) again.focus({preventScroll: true});
    }
    document.querySelectorAll("[data-zsa-ff-chart]").forEach(drawChartFor);
  }

  // Step 1: the hook.
  function renderHook(body) {
    body.append(el("p", {text: t("hook.intro")}));
    body.append(el("div", {class: "zsa-ff-parents"},
      flyCard(t("hook.parentA"), "NN", {hideGenotype: true, genotypeText: t("hook.trueBreeding")}),
      el("p", {class: "zsa-ff-times", "aria-hidden": "true", text: "×"}),
      flyCard(t("hook.parentB"), "nn", {hideGenotype: true, genotypeText: t("hook.trueBreeding")})));
    const kids = Array.from({length: 12}, () => "Nn");
    body.append(el("figure", {class: "zsa-ff-vialbox"}, vial(kids, t("hook.vialLabel"), false), el("figcaption", {text: t("hook.vialCaption")})));
    const options = ["lost", "hidden", "stronger", "notPassed"].map(v => ({value: v, label: t("hook.option." + v)}));
    body.append(choiceGroup(t("hook.question"), options, state.hook.choice, v => {
      state.hook.choice = v; render(); announce(t("hook.saved"));
    }, {key: "hook"}));
    if (state.hook.choice) body.append(feedback("info", t("hook.saved")));
    body.append(redo(() => { state.hook.choice = null; }));
  }

  // Step 2: meet the traits.
  function renderTraits(body) {
    const tr = state.traits;
    body.append(el("p", {text: t("traits.intro")}));
    body.append(el("div", {class: "zsa-ff-traitkey"},
      ["wings", "eyes"].map(k => el("div", {class: "zsa-ff-traitcard"},
        el("h3", {text: traitName(k)}),
        el("ul", {},
          el("li", {}, el("span", {class: "zsa-ff-allele", text: T[k].dominant}), el("span", {text: t("traits.dominantLine", {phenotype: phenWords(T[k].dominantPhenotype)})})),
          el("li", {}, el("span", {class: "zsa-ff-allele", text: T[k].recessive}), el("span", {text: t("traits.recessiveLine", {phenotype: phenWords(T[k].recessivePhenotype)})})))))));
    const genotype = model.normalize(tr.alleles.join(""));
    const pairs = model.genes(genotype);
    const builder = el("div", {class: "zsa-ff-builder"});
    const cards = el("div", {class: "zsa-ff-allelecards"}, el("h3", {text: t("traits.buildTitle")}), el("p", {class: "zsa-ff-small", text: t("traits.buildHelp")}));
    [["wings", 0], ["eyes", 2]].forEach(([k, offset]) => {
      const row = el("div", {class: "zsa-ff-allelerow", role: "group", "aria-label": t("traits.geneGroup", {trait: traitName(k)})}, el("span", {class: "zsa-ff-rowlabel", text: traitName(k)}));
      [0, 1].forEach(j => {
        const allele = tr.alleles[offset + j], dom = allele === T[k].dominant;
        // The name is the visible text with the gene in front ("Wing shape: N from parent 1 dominant"), so speech
        // input users can say what they see.
        const b = el("button", {type: "button", class: "zsa-ff-allelecard" + (dom ? " zsa-ff-allelecard--dom" : ""), "data-key": "allele:" + (offset + j)},
        el("span", {class: "zsa-ff-sr", text: t("traits.cardPrefix", {trait: traitName(k)}) + " "}),
        el("span", {class: "zsa-ff-allele-big", text: allele}),
        el("span", {class: "zsa-ff-small", text: t("traits.fromParent", {n: j + 1})}),
        el("span", {class: "zsa-ff-small", text: dom ? t("word.dominant") : t("word.recessive")}));
        b.addEventListener("click", () => {
          tr.alleles[offset + j] = dom ? T[k].recessive : T[k].dominant;
          const g = model.normalize(tr.alleles.join(""));
          const ph = phenotypeText(g), key = model.phenotypeKey(g);
          tr.seen[key] = tr.seen[key] || {};
          tr.seen[key][g] = true;
          const before = Object.assign({}, tr.goals);
          const gs = model.genes(g);
          if (gs[0] === "nn") tr.goals.vestigial = true;
          if (gs[1] === "Rr") tr.goals.hetRed = true;
          if (Object.values(tr.seen).some(set => Object.keys(set).length >= 2)) tr.goals.same = true;
          render();
          const won = Object.keys(tr.goals).filter(x => tr.goals[x] && !before[x]).map(x => t("traits.goal." + x));
          announce(t("traits.now", {genotype: genotypeSpoken(g), phenotype: ph}) + (won.length ? " " + t("traits.goalDone", {goal: won.join(" ")}) : ""));
        });
        row.append(b);
      });
      cards.append(row);
    });
    builder.append(cards);
    const p = model.phenotype(genotype);
    builder.append(el("div", {class: "zsa-ff-result"},
      flyPicture(genotype, t("fly.label", {phenotype: phenotypeText(genotype), genotype}), "large"),
      el("dl", {class: "zsa-ff-readout"},
        el("dt", {text: t("term.genotype")}), el("dd", {class: "zsa-ff-mono", text: pairs.join(" ")}),
        el("dt", {text: t("term.phenotype")}), el("dd", {text: phenotypeText(genotype)}),
        pairs.map((g, i) => [el("dt", {text: traitName(model.ORDER[i])}), el("dd", {text: t("traits.pairLine", {pair: g, zygosity: zygosityText(g), phenotype: phenWords(p[model.ORDER[i]])})})]))));
    body.append(builder);
    const goals = el("ul", {class: "zsa-ff-goals"});
    ["vestigial", "hetRed", "same"].forEach(x => goals.append(el("li", {class: tr.goals[x] ? "zsa-ff-goal--done" : ""},
      el("span", {class: "zsa-ff-goalmark", "aria-hidden": "true", text: tr.goals[x] ? "✓" : "○"}),
      el("span", {text: t("traits.goal." + x)}), el("span", {class: "zsa-ff-sr", text: tr.goals[x] ? t("word.doneParen") : t("word.notYetParen")}))));
    body.append(el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-goals-h"}, el("h3", {id: "zsa-ff-goals-h", text: t("traits.goalsTitle")}), goals));
    const terms = ["allele", "dominant", "recessive", "genotype", "phenotype", "homozygous", "heterozygous"];
    const dl = el("dl", {class: "zsa-ff-glossary"});
    terms.forEach(term => dl.append(el("div", {}, el("dt", {text: t("term." + term)}), el("dd", {text: t("def." + term)}))));
    body.append(el("details", {class: "zsa-ff-panel"}, el("summary", {text: t("traits.glossary")}), dl));
    body.append(redo(() => { state.traits = fresh().traits; }));
  }

  // Shared parts of a cross: parent pickers, the square, the prediction and the runs.
  function genotypeOptions(trait) {
    const d = T[trait].dominant, r = T[trait].recessive;
    return [d + d, d + r, r + r].map(g => ({value: g, label: t("cross.genotypeOption", {genotype: g, zygosity: zygosityText(g), phenotype: phenotypeText(g)})}));
  }
  function squareSection(cross, heading) {
    const square = model.punnett(cross.p1, cross.p2);
    const trait = model.traitOf(cross.p1[0]);
    const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-sq-h"}, el("h3", {id: "zsa-ff-sq-h", text: heading}));
    box.append(el("p", {class: "zsa-ff-small", text: t("square.help", {p1: cross.p1, p2: cross.p2})}));
    if (!cross.solved) {
      const bank = el("div", {class: "zsa-ff-bank", role: "group", "aria-label": t("square.bank")}, el("span", {class: "zsa-ff-rowlabel", text: t("square.bank")}));
      [T[trait].dominant, T[trait].recessive].forEach(a => bank.append(tokenButton(a, "allele")));
      box.append(bank);
    }
    const checks = cross.tries > 0 && !cross.solved ? model.checkCells(cross.p1, cross.p2, cross.placed) : null;
    const grid = el("div", {class: "zsa-ff-grid zsa-ff-grid--2", role: "group", "aria-label": t("square.gridLabel")});
    grid.append(el("div", {class: "zsa-ff-corner", "aria-hidden": "true"}, el("span", {text: cross.p1}), el("span", {text: cross.p2})));
    square.cols.forEach((g, c) => grid.append(el("div", {class: "zsa-ff-head zsa-ff-head--top"}, el("span", {class: "zsa-ff-sr", text: t("square.colHead", {n: c + 1})}), el("span", {text: g}))));
    square.rows.forEach((rg, r) => {
      grid.append(el("div", {class: "zsa-ff-head zsa-ff-head--side"}, el("span", {class: "zsa-ff-sr", text: t("square.rowHead", {n: r + 1})}), el("span", {text: rg})));
      square.cols.forEach((cg, c) => {
        const cell = el("div", {class: "zsa-ff-cell" + (checks ? (checks[r][c] ? " zsa-ff-cell--right" : " zsa-ff-cell--wrong") : "") + (cross.solved ? " zsa-ff-cell--solved" : "")});
        if (cross.solved) {
          const g = square.cells[r][c];
          cell.append(el("span", {class: "zsa-ff-cellgeno", text: g}), el("span", {class: "zsa-ff-cellphen", text: phenotypeText(g)}));
        } else {
          [0, 1].forEach(k => {
            const value = cross.placed[r][c][k];
            const label = t("square.slot", {row: r + 1, col: c + 1, n: k + 1, value: value ? genotypeSpoken(value) : t("word.empty")}) +
              (checks ? " " + (checks[r][c] ? t("square.cellRight") : t("square.cellWrong")) : "");
            const slot = el("button", {type: "button", class: "zsa-ff-slot" + (value ? " zsa-ff-slot--full" : ""), "data-key": "slot:" + r + ":" + c + ":" + k,
              "data-slot": r + ":" + c + ":" + k, "aria-label": label}, value || "");
            slot.addEventListener("click", () => {
              if (consumeDragClick()) return;
              placeAllele(cross, r, c, k, state.selected && state.selected.kind === "allele" ? state.selected.value : null);
            });
            cell.append(slot);
          });
          if (checks) cell.append(el("span", {class: "zsa-ff-cellmark", "aria-hidden": "true", text: checks[r][c] ? "✓" : "✗"}));
        }
        grid.append(cell);
      });
    });
    box.append(grid);
    if (!cross.solved) {
      const tools = el("div", {class: "zsa-ff-row"});
      tools.append(button(t("square.check"), () => {
        cross.tries++;
        const result = model.checkCells(cross.p1, cross.p2, cross.placed), right = result.flat().filter(Boolean).length;
        if (right === 4) { cross.solved = true; state.selected = null; render(); announce(t("square.solved")); return; }
        render();
        announce(t("square.someRight", {right, total: 4}));
      }, {primary: true, key: "check:" + heading}));
      tools.append(button(t("square.clear"), () => { cross.placed = emptyCells(2); cross.tries = 0; render(); announce(t("square.cleared")); }, {key: "clear:" + heading}));
      if (cross.tries >= 2) tools.append(button(t("square.showMe"), () => {
        cross.placed = square.cells.map(row => row.map(g => [g[0], g[1]]));
        cross.solved = true; cross.shown = true; state.selected = null; render(); announce(t("square.shownNote"));
      }, {key: "show:" + heading}));
      box.append(tools);
      if (checks) {
        const right = checks.flat().filter(Boolean).length;
        box.append(feedback("retry", t("square.someRight", {right, total: 4}) + " " + t("square.hint")));
      }
    } else {
      box.append(feedback("good", cross.shown ? t("square.shownNote") : t("square.solved")));
    }
    return box;
  }
  function predictionSection(cross) {
    const exp = model.expected(cross.p1, cross.p2), domKey = exp.keys[0];
    const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-pred-h"}, el("h3", {id: "zsa-ff-pred-h", text: t("predict.title")}));
    const options = [0, 1, 2, 3, 4].map(n => ({value: String(n), label: t("predict.option", {n})}));
    box.append(choiceGroup(t("predict.question", {phenotype: phenKeyText(domKey)}), options, cross.prediction, v => {
      cross.prediction = v;
      cross.predictionRight = Number(v) === exp.counts[domKey];
      render();
      announce(predictionMessage(cross, exp));
    }, {compact: true, key: "pred"}));
    if (cross.prediction !== null) box.append(feedback(cross.predictionRight ? "good" : "retry", predictionMessage(cross, exp)));
    return box;
  }
  function predictionMessage(cross, exp) {
    const domKey = exp.keys[0], recKey = exp.keys[1];
    if (cross.predictionRight) return t("predict.right", {dom: exp.counts[domKey], rec: exp.counts[recKey], domWords: phenKeyText(domKey), recWords: phenKeyText(recKey), percent: pct(exp.fractions[domKey])});
    return t("predict.retry", {allele: T[model.traitOf(cross.p1[0])].dominant, phenotype: phenKeyText(domKey)});
  }

  function renderPunnett(body) {
    const c = state.cross1;
    body.append(el("p", {text: t("cross.intro")}));
    const pickers = el("div", {class: "zsa-ff-pickers"});
    pickers.append(choiceGroup(t("cross.traitLegend"), ["wings", "eyes"].map(k => ({value: k, label: traitName(k)})), c.trait, v => {
      const d = T[v].dominant, r = T[v].recessive;
      state.cross1 = crossState(v, d + r, r + r); state.selected = null; render(); announce(t("cross.changed"));
    }, {key: "trait"}));
    [["p1", t("cross.parent1")], ["p2", t("cross.parent2")]].forEach(([which, legend]) => {
      pickers.append(choiceGroup(legend, genotypeOptions(c.trait), c[which], v => {
        const next = crossState(c.trait, which === "p1" ? v : c.p1, which === "p2" ? v : c.p2);
        state.cross1 = next; state.selected = null; render(); announce(t("cross.changed"));
      }, {key: which}));
    });
    body.append(pickers);
    body.append(el("div", {class: "zsa-ff-parents"},
      flyCard(t("cross.parent1"), c.p1, {size: "small"}), el("p", {class: "zsa-ff-times", "aria-hidden": "true", text: "×"}), flyCard(t("cross.parent2"), c.p2, {size: "small"})));
    if (c.runIndex) body.append(el("p", {class: "zsa-ff-small", text: t("cross.changeWarning")}));
    body.append(squareSection(c, t("square.title")));
    if (c.solved) body.append(predictionSection(c));
    body.append(redo(() => { state.cross1 = crossState(c.trait, c.p1, c.p2); }));
  }

  // The runs: one button per sample size, unlocked in order; "Raise again" gives a fresh sample at that size.
  function runSection(cross, sizes, label, opts = {}) {
    const keys = model.phenotypeKeys(model.traitsOf(cross.p1));
    const exp = model.expected(cross.p1, cross.p2);
    const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-run-h-" + label}, el("h3", {id: "zsa-ff-run-h-" + label, text: t("run.title")}));
    box.append(el("p", {class: "zsa-ff-small", text: t("run.help", {a: sizes[0], b: sizes[1], c: sizes[2]})}));
    const row = el("div", {class: "zsa-ff-row"});
    sizes.forEach((n, i) => {
      const ready = i === 0 || !!cross.runs[sizes[i - 1]];
      const again = !!cross.runs[n];
      row.append(button(again ? t("run.again", {n}) : t("run.raise", {n}), () => {
        cross.runIndex++;
        const offspring = model.sample(cross.p1, cross.p2, n, model.streamSeed(seed, label + "|" + cross.p1 + "|" + cross.p2 + "|" + n + "|" + cross.runIndex));
        cross.runs[n] = {n, offspring, tally: model.tally(offspring, model.traitsOf(cross.p1)), run: cross.runIndex};
        cross.latest = n; cross.animate = true;
        render();
        announce(runSentence(cross.runs[n], exp));
      }, {primary: !again, disabled: !ready, key: "run:" + label + ":" + n}));
    });
    box.append(row);
    const latest = cross.latest && cross.runs[cross.latest];
    if (latest) {
      box.append(el("figure", {class: "zsa-ff-vialbox"}, vial(latest.offspring, t("run.vialLabel", {sentence: runSentence(latest, exp)}), cross.animate),
        el("figcaption", {class: "zsa-ff-strong", text: runSentence(latest, exp)})));
      cross.animate = false;
    } else {
      box.append(el("figure", {class: "zsa-ff-vialbox"}, vial([], t("run.emptyVial"), false), el("figcaption", {text: t("run.emptyVial")})));
    }
    // Table: exact numbers, the text alternative for the chart.
    const table = el("table", {class: "zsa-ff-table"}, el("caption", {text: t("run.tableCaption")}));
    const head = el("tr", {}, el("th", {scope: "col", text: t("run.colSample")}));
    keys.forEach(k => head.append(el("th", {scope: "col", text: phenKeyText(k)})));
    head.append(el("th", {scope: "col", text: t("run.colOff")}));
    table.append(el("thead", {}, head));
    const tbody = el("tbody", {});
    const predRow = el("tr", {class: "zsa-ff-predrow"}, el("th", {scope: "row", text: t("run.predicted")}));
    keys.forEach(k => predRow.append(el("td", {text: pct(exp.fractions[k]) + "%", "data-label": phenKeyText(k)})));
    predRow.append(el("td", {text: "0", "data-label": t("run.colOff")}));
    tbody.append(predRow);
    sizes.forEach(n => {
      const r = cross.runs[n];
      const tr = el("tr", {}, el("th", {scope: "row", text: t("run.rowSample", {n})}));
      keys.forEach(k => tr.append(el("td", {text: r ? t("run.cell", {count: r.tally.counts[k], percent: pct(r.tally.counts[k] / n)}) : t("run.notYet"), "data-label": phenKeyText(k)})));
      tr.append(el("td", {text: r ? t("run.points", {n: Math.round(model.largestGap(r.tally, exp))}) : t("run.notYet"), "data-label": t("run.colOff")}));
      tbody.append(tr);
    });
    table.append(tbody);
    box.append(el("div", {class: "zsa-ff-tablewrap"}, table));
    const chartHost = el("div", {class: "zsa-ff-charthost", id: "zsa-ff-chart-" + label, "data-zsa-ff-chart": label});
    chartSpecs[label] = {keys, bars: [{label: t("chart.predicted"), sub: "", counts: exp.counts, total: exp.total, predicted: true}]
      .concat(sizes.filter(n => cross.runs[n]).map(n => ({label: String(n), sub: t("chart.flies"), counts: cross.runs[n].tally.counts, total: n}))),
    title: t("chart.title", {summary: sizes.filter(n => cross.runs[n]).map(n => runSentence(cross.runs[n], exp)).join(" ") || t("run.emptyVial")})};
    box.append(el("h4", {class: "zsa-ff-charttitle", text: t("chart.heading")}), chartHost);
    if (opts.after) opts.after(box, exp);
    return box;
  }
  const chartSpecs = {};
  function drawChartFor(host) {
    const spec = chartSpecs[host.getAttribute("data-zsa-ff-chart")];
    if (spec) chart(host, spec.keys, spec.bars, spec.title);
  }
  function runSentence(r, exp) {
    const parts = exp.keys.map(k => t("run.part", {count: r.tally.counts[k], phenotype: phenKeyText(k)}));
    return t("run.sentence", {n: r.n, parts: parts.join(", "), off: Math.round(model.largestGap(r.tally, exp))});
  }

  function needs(body, text, target) {
    body.append(feedback("info", text));
    body.append(button(t("nav.goTo", {title: stepTitle(target)}), () => go(target), {primary: true, key: "needs"}));
  }
  function renderRun(body) {
    const c = state.cross1;
    if (!(c.solved && c.predictionRight)) { needs(body, t("run.needsSquare"), 2); return; }
    const exp = model.expected(c.p1, c.p2);
    body.append(el("p", {text: t("run.intro", {p1: c.p1, p2: c.p2, ratio: ratioText(exp)})}));
    body.append(runSection(c, model.SAMPLE_SIZES, "cross1"));
    if (model.SAMPLE_SIZES.every(n => c.runs[n])) {
      const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-reflect-h"}, el("h3", {id: "zsa-ff-reflect-h", text: t("reflect.title")}));
      const options = ["closer", "exact", "nothing", "small"].map(v => ({value: v, label: t("reflect.option." + v)}));
      box.append(choiceGroup(t("reflect.question"), options, c.reflection, v => {
        c.reflection = v; render(); announce(reflectMessage(c, exp));
      }, {key: "reflect"}));
      if (c.reflection) box.append(feedback(c.reflection === "closer" ? "good" : "retry", reflectMessage(c, exp)));
      body.append(box);
    }
    body.append(redo(() => { Object.assign(c, {runs: {}, latest: null, reflection: null}); }));
  }
  function reflectMessage(c, exp) {
    const small = Math.round(model.largestGap(c.runs[8].tally, exp)), big = Math.round(model.largestGap(c.runs[200].tally, exp));
    const yours = t(big < small ? "reflect.yoursCloser" : big === small ? "reflect.yoursSame" : "reflect.yoursFurther", {small, big});
    return t("reflect.msg." + c.reflection) + " " + yours;
  }

  function renderF2(body) {
    const c = state.f2;
    body.append(el("p", {text: t("f2.intro")}));
    body.append(el("div", {class: "zsa-ff-parents"},
      flyCard(t("f2.pParent"), "NN", {size: "small"}), el("p", {class: "zsa-ff-times", "aria-hidden": "true", text: "×"}), flyCard(t("f2.pParent"), "nn", {size: "small"}),
      el("p", {class: "zsa-ff-times", "aria-hidden": "true", text: "→"}), flyCard(t("f2.f1"), "Nn", {size: "small"})));
    body.append(el("p", {text: t("f2.f1Explain")}));
    body.append(squareSection(c, t("f2.squareTitle")));
    if (c.solved) body.append(predictionSection(c));
    if (c.solved && c.predictionRight) {
      body.append(runSection(c, model.SAMPLE_SIZES, "f2"));
      const r = c.runs[200] || c.runs[40] || c.runs[8];
      if (r) {
        const n = r.tally.counts.normal, v = r.tally.counts.vestigial;
        const ratio = v ? t("f2.ratio", {x: (n / v).toFixed(1)}) : t("f2.noRecessive");
        const hook = state.hook.choice ? t("f2.hookYours", {idea: t("hook.option." + state.hook.choice)}) + " " : "";
        body.append(feedback(c.runs[200] ? "good" : "info", t("f2.compare", {n: r.n, ratio}) + " " + (c.runs[200] ? hook + t("f2.hookAnswer") : t("f2.keepGoing"))));
      }
    }
    body.append(redo(() => { state.f2 = crossState("wings", "Nn", "Nn"); }));
  }

  // Step 6: mystery parents and test crosses.
  const BATCH = 10, MAX_BATCHES = 4;
  function renderMystery(body) {
    const m = state.mystery;
    body.append(el("p", {text: t("mystery.intro")}));
    body.append(choiceGroup(t("mystery.pick"), m.flies.map((f, i) => ({value: String(i), label: t("mystery.flyName", {letter: "ABC"[i]}) + ": " + phenWords(T[f.trait].dominantPhenotype),
      mark: m.tests[i].solved ? "✓" : "", status: m.tests[i].solved ? "done" : ""})), String(m.current), v => { m.current = Number(v); render(); }, {compact: true, key: "mfly"}));
    const fly = m.flies[m.current], test = m.tests[m.current], tr = T[fly.trait];
    const mate = model.recessiveHomozygote(fly.trait);
    const letter = "ABC"[m.current];
    body.append(el("div", {class: "zsa-ff-parents"},
      flyCard(t("mystery.flyName", {letter}), fly.genotype, {hideGenotype: true, genotypeText: t("mystery.unknown", {allele: tr.dominant})}),
      el("p", {class: "zsa-ff-times", "aria-hidden": "true", text: "×"}),
      flyCard(t("mystery.mate"), mate, {size: ""})));
    body.append(el("div", {class: "zsa-ff-ifs"},
      el("div", {class: "zsa-ff-if"}, el("h3", {text: t("mystery.ifHomoTitle", {g: tr.dominant + tr.dominant})}), el("p", {text: t("mystery.ifHomo", {d: tr.dominant, words: phenWords(tr.dominantPhenotype)})})),
      el("div", {class: "zsa-ff-if"}, el("h3", {text: t("mystery.ifHetTitle", {g: tr.dominant + tr.recessive})}), el("p", {text: t("mystery.ifHet", {r: tr.recessive, words: phenWords(tr.recessivePhenotype)})}))));
    const row = el("div", {class: "zsa-ff-row"});
    row.append(button(test.batches ? t("mystery.more", {n: BATCH}) : t("mystery.run", {n: BATCH}), () => {
      const more = model.sample(fly.genotype, mate, BATCH, model.streamSeed(seed, "mystery|" + m.current + "|" + test.batches));
      test.batches++; test.offspring = test.offspring.concat(more); test.animate = true;
      if (test.choice && !test.solved) test.choice = null;
      render();
      announce(mysterySentence(fly, test));
    }, {primary: !test.batches, disabled: test.batches >= MAX_BATCHES, key: "mrun"}));
    body.append(row);
    if (test.batches >= MAX_BATCHES) body.append(el("p", {class: "zsa-ff-small", text: t("mystery.max", {n: BATCH * MAX_BATCHES})}));
    body.append(el("figure", {class: "zsa-ff-vialbox"}, vial(test.offspring, test.offspring.length ? mysterySentence(fly, test) : t("run.emptyVial"), test.animate),
      el("figcaption", {class: "zsa-ff-strong", text: test.offspring.length ? mysterySentence(fly, test) : t("mystery.noneYet")})));
    test.animate = false;
    if (test.offspring.length) {
      const options = [tr.dominant + tr.dominant, tr.dominant + tr.recessive].map(g => ({value: g, label: t("mystery.verdictOption", {g, zygosity: zygosityText(g)})}));
      body.append(choiceGroup(t("mystery.verdict", {letter}), options, test.choice, v => {
        test.choice = v;
        const msg = mysteryFeedback(fly, test);
        test.solved = msg.solved;
        render(); announce(msg.text);
      }, {key: "verdict"}));
      if (test.choice) { const msg = mysteryFeedback(fly, test); body.append(feedback(msg.kind, msg.text)); }
    }
    body.append(redo(() => { m.tests[m.current] = {batches: 0, offspring: [], choice: null, solved: false, animate: false}; }));
  }
  function mysteryCounts(fly, test) {
    const tl = model.tally(test.offspring, [fly.trait]);
    return {dom: tl.counts[T[fly.trait].dominantPhenotype], rec: tl.counts[T[fly.trait].recessivePhenotype], n: tl.total};
  }
  function mysterySentence(fly, test) {
    const c = mysteryCounts(fly, test), tr = T[fly.trait];
    return t("mystery.sentence", {n: c.n, dom: c.dom, rec: c.rec, domWords: phenWords(tr.dominantPhenotype), recWords: phenWords(tr.recessivePhenotype)});
  }
  function mysteryFeedback(fly, test) {
    const c = mysteryCounts(fly, test), tr = T[fly.trait], verdict = model.testCrossVerdict(c.dom, c.rec);
    const het = tr.dominant + tr.recessive, homo = tr.dominant + tr.dominant;
    const picked = test.choice;
    if (verdict.verdict === "heterozygous") {
      if (picked === het) return {solved: true, kind: "good", text: t("mystery.fb.hetRight", {rec: c.rec, recWords: phenWords(tr.recessivePhenotype), r: tr.recessive, g: het})};
      return {solved: false, kind: "retry", text: t("mystery.fb.hetWrong", {rec: c.rec, recWords: phenWords(tr.recessivePhenotype), r: tr.recessive})};
    }
    const odds = Math.round(1 / verdict.chanceIfHeterozygous).toLocaleString(lang === "es" ? "es-MX" : "en-US");
    if (picked === het) return {solved: false, kind: "retry", text: t("mystery.fb.homoWrong", {n: c.n, words: phenWords(tr.dominantPhenotype), recWords: phenWords(tr.recessivePhenotype)})};
    if (fly.genotype === homo) return {solved: true, kind: "good", text: t("mystery.fb.homoRight", {n: c.n, words: phenWords(tr.dominantPhenotype), odds, g: homo})};
    return {solved: true, kind: "info", text: t("mystery.fb.surprise", {n: c.n, odds, g: het})};
  }

  // Step 7: check questions.
  const QUESTIONS = [
    {id: "q1", options: ["a", "b", "c", "d"], answer: "a"},
    {id: "q2", options: ["a", "b", "c", "d"], answer: "a"},
    {id: "q3", options: ["a", "b", "c", "d"], answer: "a"},
    {id: "q4", options: ["a", "b", "c", "d"], answer: "a"}
  ];
  // Answer order on screen is fixed per question but not always first.
  const ORDERS = [["b", "a", "c", "d"], ["c", "d", "a", "b"], ["b", "c", "a", "d"], ["d", "a", "b", "c"]];
  function checksDone() { return QUESTIONS.every((q, i) => state.checks.answers[i] === q.answer); }
  function renderChecks(body) {
    const right = QUESTIONS.filter((q, i) => state.checks.answers[i] === q.answer).length;
    body.append(el("p", {text: t("checks.intro")}));
    body.append(el("p", {class: "zsa-ff-strong", text: t("checks.progress", {n: right, total: QUESTIONS.length})}));
    QUESTIONS.forEach((q, i) => {
      const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-" + q.id + "-h"}, el("h3", {id: "zsa-ff-" + q.id + "-h", text: t("checks.number", {n: i + 1, total: QUESTIONS.length})}));
      const a = state.checks.answers[i];
      box.append(choiceGroup(t("checks." + q.id + ".question"), ORDERS[i].map(v => ({value: v, label: t("checks." + q.id + "." + v)})), a, v => {
        const was = checksDone();
        state.checks.answers[i] = v; render();
        announce((v === q.answer ? t("checks.right") : t("checks.notYet")) + " " + t("checks." + q.id + ".fb." + v) + (!was && checksDone() ? " " + t("checks.unlocked") : ""));
      }, {key: q.id}));
      if (a) box.append(feedback(a === q.answer ? "good" : "retry", (a === q.answer ? t("checks.right") : t("checks.notYet")) + " " + t("checks." + q.id + ".fb." + a)));
      body.append(box);
    });
    if (checksDone()) body.append(feedback("good", t("checks.allDone")));
    body.append(redo(() => { state.checks.answers = [null, null, null, null]; }));
  }

  // Bonus: two traits at once (optional).
  const GAMETE_TOKENS = ["NR", "Nr", "nR", "nr"];
  const RATIO_CHOICES = [[9, 3, 3, 1], [4, 4, 4, 4], [12, 4, 0, 0], [12, 0, 4, 0], [16, 0, 0, 0], [6, 2, 6, 2], [6, 6, 2, 2], [8, 8, 0, 0], [8, 0, 8, 0], [3, 9, 1, 3], [1, 3, 3, 9]];
  function renderBonus(body) {
    if (!checksDone()) { needs(body, t("nav.lockedNote"), 6); return; }
    const d = state.di;
    body.append(feedback("info", t("bonus.optional")));
    body.append(el("p", {text: t("bonus.intro")}));
    const pickers = el("div", {class: "zsa-ff-pickers zsa-ff-pickers--4"});
    [["p1", t("cross.parent1")], ["p2", t("cross.parent2")]].forEach(([which, who]) => {
      const genes = model.genes(d[which]);
      ["wings", "eyes"].forEach((k, gi) => {
        pickers.append(choiceGroup(t("bonus.pickLegend", {parent: who, trait: traitName(k)}), genotypeOptions(k), genes[gi], v => {
          const next = genes.slice(); next[gi] = v;
          const p = next.join("");
          state.di = Object.assign(crossState("both", which === "p1" ? p : d.p1, which === "p2" ? p : d.p2), {top: [null, null, null, null], side: [null, null, null, null]});
          state.selected = null; render(); announce(t("cross.changed"));
        }, {key: which + k, compact: true}));
      });
    });
    body.append(pickers);
    body.append(el("div", {class: "zsa-ff-parents"},
      flyCard(t("cross.parent1"), d.p1, {size: "small"}), el("p", {class: "zsa-ff-times", "aria-hidden": "true", text: "×"}), flyCard(t("cross.parent2"), d.p2, {size: "small"})));
    body.append(dihybridSquare(d));
    if (d.solved) {
      const exp = model.expected(d.p1, d.p2);
      const correct = exp.keys.map(k => exp.counts[k]);
      const pool = [correct].concat(RATIO_CHOICES.filter(r => r.join() !== correct.join()).slice(0, 3));
      const order = [2, 0, 3, 1].map(i => pool[i]);
      const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-dpred-h"}, el("h3", {id: "zsa-ff-dpred-h", text: t("predict.title")}));
      box.append(el("p", {class: "zsa-ff-small", text: t("bonus.order", {order: exp.keys.map(phenKeyText).join(" : ")})}));
      box.append(choiceGroup(t("bonus.predictQuestion"), order.map(r => ({value: r.join("-"), label: r.join(" : ")})), d.prediction, v => {
        d.prediction = v; d.predictionRight = v === correct.join("-"); render();
        announce(d.predictionRight ? t("bonus.predictRight", {ratio: correct.join(" : ")}) : t("bonus.predictRetry"));
      }, {key: "dpred"}));
      if (d.prediction) box.append(feedback(d.predictionRight ? "good" : "retry", d.predictionRight ? t("bonus.predictRight", {ratio: correct.join(" : ")}) : t("bonus.predictRetry")));
      body.append(box);
      if (d.predictionRight) body.append(runSection(d, model.DIHYBRID_SIZES, "di"));
    }
    body.append(redo(() => { state.di = Object.assign(crossState("both", d.p1, d.p2), {top: [null, null, null, null], side: [null, null, null, null]}); }));
  }
  function dihybridSquare(d) {
    const box = el("section", {class: "zsa-ff-panel", "aria-labelledby": "zsa-ff-dsq-h"}, el("h3", {id: "zsa-ff-dsq-h", text: t("bonus.squareTitle")}));
    box.append(el("p", {class: "zsa-ff-small", text: t("bonus.squareHelp", {p1: d.p1, p2: d.p2})}));
    const headerChecks = d.tries > 0 && !d.solved ? {top: model.checkHeaders(d.p1, d.top), side: model.checkHeaders(d.p2, d.side)} : null;
    if (!d.solved) {
      const bank = el("div", {class: "zsa-ff-bank", role: "group", "aria-label": t("bonus.bank")}, el("span", {class: "zsa-ff-rowlabel", text: t("bonus.bank")}));
      GAMETE_TOKENS.forEach(g => bank.append(tokenButton(g, "gamete")));
      box.append(bank);
    }
    const cells = d.solved ? model.cellsFrom(d.top, d.side) : null;
    const grid = el("div", {class: "zsa-ff-grid zsa-ff-grid--4", role: "group", "aria-label": t("square.gridLabel")});
    grid.append(el("div", {class: "zsa-ff-corner", "aria-hidden": "true"}, el("span", {text: d.p1}), el("span", {text: d.p2})));
    const headSlot = (which, i) => {
      const value = d[which][i];
      const wrong = headerChecks && !headerChecks[which];
      const label = t(which === "top" ? "bonus.topSlot" : "bonus.sideSlot", {n: i + 1, value: value ? genotypeSpoken(value) : t("word.empty")}) + (headerChecks ? " " + (wrong ? t("square.cellWrong") : t("square.cellRight")) : "");
      if (d.solved) return el("div", {class: "zsa-ff-head zsa-ff-head--" + which}, el("span", {class: "zsa-ff-sr", text: label}), el("span", {"aria-hidden": "true", text: value}));
      const b = el("button", {type: "button", class: "zsa-ff-slot zsa-ff-slot--gamete" + (value ? " zsa-ff-slot--full" : "") + (headerChecks ? (wrong ? " zsa-ff-slot--wrong" : " zsa-ff-slot--right") : ""),
        "data-key": "head:" + which + ":" + i, "data-slot": "head:" + which + ":" + i, "aria-label": label}, value || "");
      b.addEventListener("click", () => {
        if (consumeDragClick()) return;
        placeGamete(d, which, i, state.selected && state.selected.kind === "gamete" ? state.selected.value : null);
      });
      return el("div", {class: "zsa-ff-head zsa-ff-head--" + which}, b);
    };
    [0, 1, 2, 3].forEach(i => grid.append(headSlot("top", i)));
    [0, 1, 2, 3].forEach(r => {
      grid.append(headSlot("side", r));
      [0, 1, 2, 3].forEach(c => {
        const cell = el("div", {class: "zsa-ff-cell zsa-ff-cell--small" + (cells ? " zsa-ff-cell--solved" : "")});
        if (cells) {
          // Genotype and a small fly; the phenotype words are there for screen readers and as a tooltip.
          const g = cells[r][c];
          const icon = svg("svg", {viewBox: "0 0 100 100", class: "zsa-ff-minifly", "aria-hidden": "true", focusable: "false"});
          svg("use", {href: "#zsa-ff-fly-" + fullPhen(g)}, icon);
          cell.setAttribute("title", phenotypeText(g));
          cell.append(el("span", {class: "zsa-ff-cellgeno", text: g}), icon, el("span", {class: "zsa-ff-sr", text: phenotypeText(g)}));
        } else cell.append(el("span", {class: "zsa-ff-sr", text: t("bonus.cellWaiting")}));
        grid.append(cell);
      });
    });
    box.append(el("div", {class: "zsa-ff-gridwrap"}, grid));
    if (!d.solved) {
      const tools = el("div", {class: "zsa-ff-row"});
      tools.append(button(t("bonus.checkGametes"), () => {
        d.tries++;
        if (model.checkHeaders(d.p1, d.top) && model.checkHeaders(d.p2, d.side)) { d.solved = true; state.selected = null; render(); announce(t("bonus.gametesRight")); return; }
        render(); announce(bonusHeaderMessage(d));
      }, {primary: true, key: "dcheck"}));
      tools.append(button(t("square.clear"), () => { d.top = [null, null, null, null]; d.side = [null, null, null, null]; d.tries = 0; render(); announce(t("square.cleared")); }, {key: "dclear"}));
      if (d.tries >= 2) tools.append(button(t("square.showMe"), () => {
        d.top = model.gametes(d.p1); d.side = model.gametes(d.p2); d.solved = true; d.shown = true; state.selected = null; render(); announce(t("bonus.shown"));
      }, {key: "dshow"}));
      box.append(tools);
      if (headerChecks) box.append(feedback("retry", bonusHeaderMessage(d)));
    } else box.append(feedback("good", d.shown ? t("bonus.shown") : t("bonus.gametesRight")));
    return box;
  }
  function bonusHeaderMessage(d) {
    const top = model.checkHeaders(d.p1, d.top), side = model.checkHeaders(d.p2, d.side);
    return t("bonus.headerCheck", {top: top ? t("word.right") : t("word.notYet"), side: side ? t("word.right") : t("word.notYet")}) + " " + t("bonus.hint");
  }

  // Step 9: copy my data, as tab-separated rows for a spreadsheet or document.
  function crossRows(name, cross, sizes) {
    const exp = model.expected(cross.p1, cross.p2), keys = exp.keys;
    const rows = [[t("copy.cross"), name], [t("copy.parents"), cross.p1 + " × " + cross.p2], [t("copy.predicted"), ratioText(exp)]];
    rows.push([t("run.colSample")].concat(keys.map(k => phenKeyText(k)), keys.map(k => t("copy.percent", {phenotype: phenKeyText(k)}))));
    rows.push([t("run.predicted")].concat(keys.map(k => String(exp.counts[k])), keys.map(k => pct(exp.fractions[k]) + "%")));
    sizes.forEach(n => {
      const r = cross.runs[n];
      rows.push([String(n)].concat(r ? keys.map(k => String(r.tally.counts[k])) : keys.map(() => t("copy.notRun")), r ? keys.map(k => pct(r.tally.counts[k] / n) + "%") : keys.map(() => "")));
    });
    rows.push([]);
    return rows;
  }
  function copyRows() {
    const rows = [[t("title")], [t("copy.seed"), String(seed)], []];
    if (state.cross1.solved) rows.push(...crossRows(t("copy.cross1", {trait: traitName(state.cross1.trait)}), state.cross1, model.SAMPLE_SIZES));
    if (state.f2.solved) rows.push(...crossRows(t("copy.f2"), state.f2, model.SAMPLE_SIZES));
    rows.push([t("copy.mystery"), t("copy.trait"), t("copy.domOffspring"), t("copy.recOffspring"), t("copy.myAnswer"), t("copy.actual")]);
    state.mystery.flies.forEach((f, i) => {
      const test = state.mystery.tests[i], c = mysteryCounts(f, test);
      rows.push([t("mystery.flyName", {letter: "ABC"[i]}), traitName(f.trait), String(c.dom), String(c.rec), test.choice || t("copy.none"), test.solved ? f.genotype : t("copy.hidden")]);
    });
    rows.push([]);
    if (state.di.solved && state.di.predictionRight) rows.push(...crossRows(t("copy.bonus"), state.di, model.DIHYBRID_SIZES));
    rows.push([t("copy.startersTitle")]);
    [1, 2, 3].forEach(n => rows.push([t("copy.starter" + n)]));
    return rows;
  }
  function renderCopy(body) {
    body.append(el("p", {text: t("copy.intro")}));
    const rows = copyRows();
    const text = rows.map(r => r.join("\t")).join("\n");
    const status = el("p", {class: "zsa-ff-copystatus", id: "zsa-ff-copy-status"});
    const pre = el("pre", {class: "zsa-ff-copytext", id: "zsa-ff-copy-text", tabindex: "0", "aria-label": t("copy.previewLabel")}, text);
    const copy = button(t("copy.button"), async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("no clipboard");
        await navigator.clipboard.writeText(text);
        state.copied = true; renderNav();
        status.textContent = t("copy.done"); announce(t("copy.done"));
      } catch (error) {
        const range = document.createRange(); range.selectNodeContents(pre);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
        pre.focus();
        state.copied = true; renderNav();
        status.textContent = t("copy.fallback"); announce(t("copy.fallback"));
      }
    }, {primary: true, key: "copy"});
    body.append(el("div", {class: "zsa-ff-row"}, copy), status);
    const missing = [];
    if (!state.cross1.solved) missing.push(stepTitle(2));
    if (!model.SAMPLE_SIZES.every(n => state.cross1.runs[n])) missing.push(stepTitle(3));
    if (!state.f2.runs[200]) missing.push(stepTitle(4));
    if (!state.mystery.tests.every(x => x.solved)) missing.push(stepTitle(5));
    if (missing.length) body.append(feedback("info", t("copy.missing", {steps: missing.join(", ")})));
    body.append(el("h3", {text: t("copy.previewTitle")}), pre);
    body.append(el("h3", {text: t("copy.startersTitle")}), el("ol", {class: "zsa-ff-starters"}, [1, 2, 3].map(n => el("li", {text: t("copy.starter" + n)}))));
  }

  function redo(clear) {
    return el("div", {class: "zsa-ff-redo"}, button(t("nav.redo"), () => { clear(); state.selected = null; render(false); $("step-title").focus(); announce(t("nav.redone")); }, {key: "redo", cls: "zsa-ff-redobtn"}));
  }

  // ---------- Tokens: tap to choose, then tap a slot; or drag a token onto a slot ----------
  function tokenButton(value, kind) {
    const on = state.selected && state.selected.kind === kind && state.selected.value === value;
    const b = el("button", {type: "button", class: "zsa-ff-token", "aria-pressed": on ? "true" : "false", "data-key": "token:" + kind + ":" + value,
      "aria-label": t(kind === "allele" ? "token.allele" : "token.gamete", {value: genotypeSpoken(value)})}, value);
    b.addEventListener("click", () => {
      if (consumeDragClick()) return;
      state.selected = on ? null : {kind, value};
      render();
      announce(on ? t("token.dropped") : t("token.picked", {value: genotypeSpoken(value)}));
    });
    b.addEventListener("pointerdown", e => startDrag(e, b, kind, value));
    return b;
  }
  function placeAllele(cross, r, c, k, value) {
    const slot = cross.placed[r][c];
    if (!value) {
      if (slot[k]) { slot[k] = null; render(); announce(t("square.removed")); }
      else announce(t("square.pickFirst"));
      return;
    }
    slot[k] = value;
    render();
    announce(t("square.placed", {value: genotypeSpoken(value), row: r + 1, col: c + 1}));
  }
  function placeGamete(d, which, i, value) {
    if (!value) {
      if (d[which][i]) { d[which][i] = null; render(); announce(t("square.removed")); }
      else announce(t("bonus.pickFirst"));
      return;
    }
    d[which][i] = value;
    render();
    announce(t(which === "top" ? "bonus.placedTop" : "bonus.placedSide", {value: genotypeSpoken(value), n: i + 1}));
  }
  let drag = null, suppressClick = false;
  function consumeDragClick() { const s = suppressClick; suppressClick = false; return s; }
  function startDrag(e, button, kind, value) {
    if (e.button !== 0) return;
    drag = {kind, value, x: e.clientX, y: e.clientY, moved: false, ghost: null, over: null, id: e.pointerId};
    // Capture keeps the moves coming to the tile; a pointer the browser no longer tracks cannot be captured.
    try { button.setPointerCapture(e.pointerId); } catch (error) { /* The tile still gets its own events. */ }
    button.addEventListener("pointermove", moveDrag);
    button.addEventListener("pointerup", endDrag);
    button.addEventListener("pointercancel", cancelDrag);
  }
  function moveDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.ghost = el("div", {class: "zsa-ff-ghost", "aria-hidden": "true"}, drag.value);
      root.append(drag.ghost);
    }
    drag.ghost.style.setProperty("left", e.clientX + "px");
    drag.ghost.style.setProperty("top", e.clientY + "px");
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const slot = target && target.closest ? target.closest("[data-slot]") : null;
    if (drag.over && drag.over !== slot) drag.over.classList.remove("zsa-ff-slot--over");
    drag.over = slot;
    if (slot) slot.classList.add("zsa-ff-slot--over");
  }
  function finishDrag(e) {
    e.currentTarget.removeEventListener("pointermove", moveDrag);
    e.currentTarget.removeEventListener("pointerup", endDrag);
    e.currentTarget.removeEventListener("pointercancel", cancelDrag);
    if (drag && drag.ghost) drag.ghost.remove();
    if (drag && drag.over) drag.over.classList.remove("zsa-ff-slot--over");
  }
  function endDrag(e) {
    if (!drag) return;
    const d = drag;
    finishDrag(e);
    drag = null;
    if (!d.moved) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    if (!d.over) { announce(t("token.missed")); return; }
    const parts = d.over.getAttribute("data-slot").split(":");
    if (parts[0] === "head") { if (d.kind === "gamete") placeGamete(state.di, parts[1], Number(parts[2]), d.value); return; }
    if (d.kind !== "allele") return;
    const cross = STEPS[state.step].id === "f2" ? state.f2 : state.cross1;
    placeAllele(cross, Number(parts[0]), Number(parts[1]), Number(parts[2]), d.value);
  }
  function cancelDrag(e) { finishDrag(e); drag = null; }

  // ---------- Page setup ----------
  function translateStatic() {
    document.documentElement.lang = lang === "es" ? "es-MX" : "en";
    document.title = t("title") + " | ZornScience";
    root.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = t(node.getAttribute("data-i18n")); });
    root.querySelectorAll("[data-i18n-label]").forEach(node => { node.setAttribute("aria-label", t(node.getAttribute("data-i18n-label"))); });
    if (data.SPANISH_PUBLISHED) {
      const nav = el("nav", {class: "zsa-languages", "data-zsa-chrome": "", "aria-label": "Idioma / Language"});
      ["en", "es"].forEach(code => {
        const url = new URL(location.href);
        if (code === "es") url.searchParams.set("lang", "es"); else url.searchParams.delete("lang");
        nav.append(el("a", {class: "zsa-btn", lang: code === "es" ? "es-MX" : "en", href: url.href, "aria-label": code === "es" ? "ES Español" : "EN English", "aria-current": code === lang ? "true" : null}, code.toUpperCase()));
      });
      nav.hidden = root.classList.contains("zsa--embedded");
      root.querySelector("[data-zsa-header-tools]").append(nav);
    }
  }
  function setBackLink() {
    const back = $("back"), from = params.get("from");
    if (from) {
      try {
        const url = new URL(from);
        if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) back.href = url.href;
      } catch (error) { /* Keep the default link. */ }
    } else if (lang === "es") back.href = back.href.replace("zornscience.org/", "zornscience.org/es/");
  }
  function boot() {
    translateStatic(); setBackLink(); buildSprite();
    $("prev").addEventListener("click", () => { const i = prevIndex(state.step); if (i >= 0) go(i); });
    $("next").addEventListener("click", () => { const i = nextIndex(state.step); if (i >= 0) go(i); });
    const dialog = $("reset-dialog");
    $("reset").addEventListener("click", () => dialog.showModal());
    $("reset-cancel").addEventListener("click", () => dialog.close());
    $("reset-confirm").addEventListener("click", () => {
      dialog.close(); state = fresh(); render(false); $("step-title").focus(); announce(t("nav.resetDone"));
    });
    root.querySelector("#zsa-th-instructions-open").addEventListener("click", () => root.querySelector("#instructions").showModal());
    root.querySelector("#close-instructions").addEventListener("click", () => root.querySelector("#instructions").close());
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && state.selected && !document.querySelector("dialog[open]")) { state.selected = null; render(); announce(t("token.dropped")); }
    });
    let frame = 0;
    window.addEventListener("resize", () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => root.querySelectorAll("[data-zsa-ff-chart]").forEach(drawChartFor)); });
    render(false);
  }
  boot();
}());
