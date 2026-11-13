(function () {
  "use strict";
  // Feed the Yeast: the page. The simulation itself lives in model.js (pure functions) and every word in data.js.
  const root = document.querySelector('[data-zsa-activity="yeast-fermentation-lab"]');
  if (!root) return;
  let model = null, data = null;
  root.dispatchEvent(new CustomEvent("yeast-fermentation-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("yeast-fermentation-data", {detail: {receive: api => { data = api; }}}));
  if (!model || !data) return;

  const NS = "http://www.w3.org/2000/svg";
  const params = new URLSearchParams(location.search);
  const lang = params.get("lang") === "es" && (data.spanishReady || params.get("preview") === "1") ? "es" : "en";
  const strings = data[lang];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motion.matches;
  motion.addEventListener("change", event => { reduced = event.matches; });
  const pinned = model.normalizeSeed(params.get("seed"));
  const seed = pinned !== null ? pinned : crypto.getRandomValues(new Uint32Array(1))[0];
  const sess = model.session(seed);

  // ---------- Words ----------
  function t(key, values) {
    let text = Object.hasOwn(strings, key) ? strings[key] : data.en[key];
    if (text === undefined) text = key;
    text = text.replace(/\{(\w+)\}/g, (match, name) => (values && values[name] !== undefined ? String(values[name]) : match));
    // A number never wraps away from its unit.
    return text.replace(/(\d) (°C|g|cm|min|ATP)(?![\w])/g, "$1\u00a0$2");
  }
  const fmt = value => (typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "");
  const FOOD_KEY = {none: "None", glucose: "Glucose", sucrose: "Sucrose", sweetener: "Sweetener", starch: "Starch"};
  const foodName = food => t("food" + FOOD_KEY[food]);
  const shortName = food => t("short" + FOOD_KEY[food]);
  const cap = text => text.charAt(0).toUpperCase() + text.slice(1);
  const FIELD = {temperature: "fieldTemperature", yeast: "fieldYeast", amount: "fieldAmount"};
  const fieldValue = (field, value) => t(field === "temperature" ? "valueC" : "valueG", {value});

  // ---------- DOM helpers (no HTML strings, no inline styles) ----------
  function h(tag, attrs, children) {
    const node = document.createElement(tag);
    apply(node, attrs);
    add(node, children);
    return node;
  }
  function s(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    apply(node, attrs);
    if (parent) parent.appendChild(node);
    return node;
  }
  function apply(node, attrs) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (key) {
      const value = attrs[key];
      if (value === null || value === undefined || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "on") Object.keys(value).forEach(type => node.addEventListener(type, value[type]));
      else if (value === true) node.setAttribute(key, "");
      else node.setAttribute(key, value);
    });
  }
  function add(node, children) {
    if (children === null || children === undefined) return;
    (Array.isArray(children) ? children : [children]).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
  }
  const $ = id => root.querySelector("#zsa-fy-" + id);
  const live = $("live");
  let liveTimer = 0;
  function announce(message) {
    clearTimeout(liveTimer);
    live.textContent = "";
    liveTimer = setTimeout(() => { live.textContent = message; }, 60);
  }
  function setText(node, text) { if (node.textContent !== text) node.textContent = text; }
  // A check mark that draws itself (CSS), used for correct answers and finished tasks.
  function checkIcon() {
    const svg = s("svg", {viewBox: "0 0 24 24", class: "zsa-fy-check", "aria-hidden": "true", focusable: "false"});
    s("circle", {cx: 12, cy: 12, r: 11, class: "zsa-fy-check-disc"}, svg);
    s("path", {d: "M6.5 12.5l3.6 3.6 7.4-8", class: "zsa-fy-check-path", pathLength: 1}, svg);
    return svg;
  }
  function warnIcon() {
    const svg = s("svg", {viewBox: "0 0 24 24", class: "zsa-fy-warn", "aria-hidden": "true", focusable: "false"});
    s("path", {d: "M12 2.5L23 21.5H1Z", class: "zsa-fy-warn-tri"}, svg);
    s("path", {d: "M12 9v6M12 17.6v.4", class: "zsa-fy-warn-mark"}, svg);
    return svg;
  }
  function pop(node) {
    if (reduced || !node) return;
    node.classList.remove("zsa-fy-pop");
    void node.getBoundingClientRect();
    node.classList.add("zsa-fy-pop");
  }

  // ---------- Animation: one requestAnimationFrame loop, running only while something moves ----------
  const animators = new Set();
  let frame = 0;
  function loop(now) {
    frame = 0;
    animators.forEach(fn => { if (fn(now) === false) animators.delete(fn); });
    if (animators.size) frame = requestAnimationFrame(loop);
  }
  function animate(fn) {
    animators.add(fn);
    if (!frame) frame = requestAnimationFrame(loop);
    return () => animators.delete(fn);
  }
  const ease = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  function tween(duration, update, easing) {
    return new Promise(function (resolve) {
      if (reduced || duration <= 0) { update(1); resolve(); return; }
      let start = 0;
      animate(function (now) {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / duration);
        update((easing || ease)(p));
        if (p >= 1) { resolve(); return false; }
        return true;
      });
    });
  }
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  function reveal(node) {
    if (!node || !node.scrollIntoView) return;
    const r = node.getBoundingClientRect(), guideTop = $("guide").getBoundingClientRect().top;
    if (r.top >= 0 && r.bottom <= Math.min(innerHeight, guideTop)) return;
    node.scrollIntoView({behavior: reduced ? "auto" : "smooth", block: r.height > innerHeight * 0.7 ? "start" : "center"});
  }

  // ---------- State ----------
  const SCREENS = ["hook", "a", "b", "zoom", "check", "copy"];
  const STEP_KEYS = {hook: "stepHook", a: "stepA", b: "stepB", zoom: "stepZoom", check: "stepCheck", copy: "stepCopy"};
  const NEXT_KEYS = {hook: "nextA", a: "nextB", b: "nextZoom", zoom: "nextCheck", check: "nextCopy"};
  const empty5 = () => [null, null, null, null, null];
  function freshHook() { return {played: false, playing: false, prediction: null}; }
  function freshA() {
    return {prediction: null, bottles: model.partADraft(seed), selected: 0, checked: false, issues: [], tips: [],
      phase: "predict", results: null, start: empty5(), end: empty5(), plot: [0, 0, 0, 0, 0], minutes: 0};
  }
  function freshB() {
    return {prediction: null, phase: "predict", trial: 0, results: [], start: empty5(), end: empty5(),
      changes: [], plot: [0, 0, 0, 0, 0], mark: 0, markStatus: null, minutes: 0};
  }
  function freshZoom() { return {food: "glucose", oxygen: false, fermented: false, respired: false, others: false, atp: 0, co2: 0, ethanol: 0, water: 0, caption: ""}; }
  function freshCheck() { return {index: 0, answers: data.questions.map(() => ({tried: [], correct: false}))}; }
  const state = {screen: "hook", hook: freshHook(), a: freshA(), b: freshB(), zoom: freshZoom(), check: freshCheck(), copied: false, tour: 0};
  let busy = false;

  function done(screen) {
    if (screen === "hook") return state.hook.played && state.hook.prediction !== null;
    if (screen === "a") return state.a.phase === "done";
    if (screen === "b") return state.b.phase === "done";
    if (screen === "zoom") return state.zoom.fermented && state.zoom.respired;
    if (screen === "check") return state.check.answers.every(a => a.correct);
    return state.copied;
  }

  // ---------- Static text, language, links ----------
  document.title = t("title") + " | ZornScience";
  if (lang === "es") {
    document.documentElement.lang = "es-MX";
    root.querySelectorAll("[data-fy-t]").forEach(node => { node.textContent = t(node.getAttribute("data-fy-t")); });
    root.querySelectorAll("[data-fy-aria]").forEach(node => { node.setAttribute("aria-label", t(node.getAttribute("data-fy-aria"))); });
  }
  (function languages() {
    const group = $("languages");
    // Until the Spanish is proofread the toggle is not shown at all (a shared header rule would override [hidden]).
    if (!data.spanishReady || root.classList.contains("zsa--embedded")) { group.remove(); return; }
    group.hidden = false;
    ["en", "es"].forEach(function (code) {
      const link = $("lang-" + code), url = new URL(location.href);
      if (code === "es") url.searchParams.set("lang", "es"); else url.searchParams.delete("lang");
      url.searchParams.delete("preview");
      link.href = url.pathname + url.search;
      if (code === lang) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
    });
  }());
  (function backLink() {
    const back = $("back"), from = params.get("from");
    if (from) {
      try {
        const url = new URL(from);
        if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) { back.href = url.href; return; }
      } catch (error) { /* Keep the default lesson link. */ }
    }
    if (lang === "es") back.href = back.href.replace("https://zornscience.org/", "https://zornscience.org/es/");
  }());
  root.addEventListener("yeast-fermentation-i18n", event => event.detail.receive({lang, t}));

  // Instructions dialog: native modal, Escape closes it, focus returns to the button.
  const dialog = root.querySelector("#instructions"), opener = $("instructions-open");
  opener.addEventListener("click", () => dialog.showModal());
  $("instructions-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => opener.focus());

  // ---------- Progress tracker ----------
  const stepButtons = {};
  SCREENS.forEach(function (key, i) {
    const button = h("button", {type: "button", class: "zsa-fy-step", "data-step": key, on: {click: () => go(key, true)}}, [
      h("span", {class: "zsa-fy-step-dot"}, [h("span", {class: "zsa-fy-step-num", text: String(i + 1)}), checkIcon()]),
      " ",
      h("span", {class: "zsa-fy-step-label", text: t(STEP_KEYS[key])})
    ]);
    stepButtons[key] = button;
    $("steps").appendChild(h("li", null, button));
  });
  const progressNow = h("p", {class: "zsa-fy-progress-now", "aria-hidden": "true"});
  root.querySelector(".zsa-fy-progress").appendChild(progressNow);
  function renderSteps() {
    setText(progressNow, t("progressNow", {number: SCREENS.indexOf(state.screen) + 1, step: t(STEP_KEYS[state.screen])}));
    SCREENS.forEach(function (key) {
      const button = stepButtons[key], isDone = done(key);
      if (key === state.screen) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
      button.classList.toggle("zsa-fy-step--done", isDone);
      // The name always contains the visible text (WCAG label in name): "2 Part A", or "Part A, done" once the check replaces the number.
      button.setAttribute("aria-label", isDone ? t(STEP_KEYS[key]) + t("stepDoneSuffix") : (SCREENS.indexOf(key) + 1) + " " + t(STEP_KEYS[key]));
    });
  }

  // ---------- Guide bar: one instruction and at most one coral button ----------
  const guideText = $("guide-text"), action = $("action"), prev = $("prev");
  let actionRun = null, guideTarget = null;
  action.addEventListener("click", function () {
    if (action.getAttribute("aria-disabled") === "true" || !actionRun) return;
    actionRun();
  });
  prev.addEventListener("click", function () {
    const i = SCREENS.indexOf(state.screen);
    if (i > 0) go(SCREENS[i - 1], true);
  });
  function renderGuide() {
    const g = guides[state.screen]();
    setText(guideText, g.text);
    const hadFocus = document.activeElement === action;
    if (guideTarget) guideTarget.classList.remove("zsa-fy-target");
    guideTarget = g.target || null;
    if (guideTarget) guideTarget.classList.add("zsa-fy-target");
    $("guide").classList.toggle("zsa-fy-guide--noaction", !g.action);
    if (g.action) {
      action.hidden = false;
      setText(action, g.action.label);
      actionRun = g.action.run || null;
      if (g.action.busy) action.setAttribute("aria-disabled", "true"); else action.removeAttribute("aria-disabled");
    } else {
      actionRun = null;
      action.hidden = true;
      action.removeAttribute("aria-disabled");
      if (hadFocus) focusInside(guideTarget) || guideText.focus();
    }
    prev.hidden = state.screen === "hook";
  }
  // When the guide button goes away, focus moves to the heading of the area to work in (not into a control).
  function focusInside(node) {
    if (!node) return false;
    const target = node.matches("[tabindex='-1']") ? node : node.querySelector("[tabindex='-1']");
    if (!target) return false;
    target.focus({preventScroll: true});
    return true;
  }
  // A table too wide for the screen scrolls inside its box; that box becomes a named, focusable region so keyboard
  // users can scroll it too. Boxes that fit get no extra Tab stop.
  function scrollables() {
    root.querySelectorAll(".zsa-fy-table-wrap").forEach(function (wrap) {
      const table = wrap.querySelector("table");
      if (!table) return;
      if (wrap.scrollWidth > wrap.clientWidth + 1) {
        const caption = table.querySelector("caption"), labelled = table.getAttribute("aria-labelledby");
        const name = caption ? caption.textContent : labelled && root.querySelector("#" + labelled) ? root.querySelector("#" + labelled).textContent : "";
        wrap.setAttribute("tabindex", "0"); wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", name);
      } else {
        ["tabindex", "role", "aria-label"].forEach(a => wrap.removeAttribute(a));
      }
    });
  }
  let scrollFrame = 0;
  addEventListener("resize", () => { cancelAnimationFrame(scrollFrame); scrollFrame = requestAnimationFrame(scrollables); });
  function refresh() {
    renderSteps();
    renderGuide();
    scrollables();
    Object.keys(screens).forEach(k => { if (screens[k].showReset) screens[k].showReset(); });
  }

  // ---------- Screens ----------
  const screensHost = $("screens");
  const screens = {};
  function screenShell(key, eyebrow, title, intro) {
    const heading = h("h2", {id: "zsa-fy-title-" + key, tabindex: "-1", text: t(title)});
    const head = h("div", {class: "zsa-fy-screen-head"}, [
      h("div", {class: "zsa-fy-heading"}, [h("p", {class: "zsa-fy-eyebrow", text: t(eyebrow)}), heading, intro ? h("p", {class: "zsa-fy-intro", text: t(intro)}) : null])
    ]);
    const section = h("section", {class: "zsa-fy-screen", id: "zsa-fy-screen-" + key, "aria-labelledby": "zsa-fy-title-" + key, hidden: true}, head);
    screensHost.appendChild(section);
    return {section, head, heading};
  }
  function go(key, user) {
    if (busy && user && key !== state.screen) stopRunning();
    state.screen = key;
    SCREENS.forEach(k => { if (screens[k]) screens[k].section.hidden = k !== key; });
    if (!screens[key]) build[key]();
    screens[key].section.hidden = false;
    screens[key].sync();
    refresh();
    if (user) {
      $("stage").scrollIntoView({behavior: "auto", block: "start"});
      screens[key].heading.focus({preventScroll: true});
    }
  }
  function stopRunning() {
    animators.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    busy = false;
    if (state.hook.playing) { state.hook.playing = false; state.hook.played = true; }
    ["a", "b"].forEach(function (part) {
      if (state[part].phase === "running") { state[part].phase = "measureEnd"; state[part].minutes = model.MINUTES; }
    });
    Object.keys(screens).forEach(k => screens[k].sync());
  }

  // Undo for resets: a snapshot of the part, restored as it was.
  function resetBar(screen, label, doneKey, reset, hasWork) {
    const note = h("p", {class: "zsa-fy-reset-note", hidden: true});
    const button = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary", text: t(label)});
    let snapshot = null, timer = 0;
    const undo = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary", text: t("undo"), hidden: true, on: {click: function () {
      if (!snapshot) return;
      reset(snapshot);
      snapshot = null;
      note.hidden = true; undo.hidden = true;
      button.focus();
    }}});
    button.addEventListener("click", function () {
      if (busy) stopRunning();
      snapshot = reset(null);
      setText(note, t(doneKey));
      note.hidden = false; undo.hidden = false;
      announce(t(doneKey));
      clearTimeout(timer);
      timer = setTimeout(() => { note.hidden = true; undo.hidden = true; snapshot = null; }, 20000);
    });
    screen.head.appendChild(h("div", {class: "zsa-fy-reset"}, [button, note, undo]));
    screen.showReset = function () { button.hidden = !hasWork(); };
  }

  // A labeled group of radio buttons that look like cards. Native radios: arrow keys, one Tab stop.
  function choiceGroup(name, legendKey, options, onPick, extraClass) {
    const fieldset = h("fieldset", {class: "zsa-fy-card zsa-fy-choices " + (extraClass || ""), tabindex: "-1"});
    fieldset.appendChild(h("legend", {class: "zsa-fy-legend", text: t(legendKey)}));
    const list = h("div", {class: "zsa-fy-choice-list"});
    const inputs = options.map(function (option) {
      const input = h("input", {type: "radio", name: "zsa-fy-" + name, value: option.value, on: {change: () => onPick(option.value)}});
      list.appendChild(h("label", {class: "zsa-fy-choice"}, [input, option.icon || null, h("span", {class: "zsa-fy-choice-text", text: option.label})]));
      return input;
    });
    fieldset.appendChild(list);
    const note = h("p", {class: "zsa-fy-note", hidden: true});
    fieldset.appendChild(note);
    return {fieldset, inputs, note, set(value, locked) {
      inputs.forEach(input => { input.checked = input.value === value; input.disabled = !!locked && input.value !== value; });
    }};
  }

  // ---------- Drawings ----------
  const PX = 10;  // drawing units per cm of balloon radius
  const R0 = model.balloon(0).radius * PX;
  function balloonShape(parent) {
    const group = s("g", {class: "zsa-fy-balloon"}, parent);
    const body = s("g", {}, group);
    s("path", {d: "M0 0C-.32 -.12 -1 -.62 -1 -1.22A1 1.02 0 1 1 1 -1.22C1 -.62 .32 -.12 0 0Z", class: "zsa-fy-balloon-skin", "vector-effect": "non-scaling-stroke"}, body);
    s("path", {d: "M-.55 -1.55A.62 .62 0 0 1 -.12 -1.98", class: "zsa-fy-balloon-shine", "vector-effect": "non-scaling-stroke"}, body);
    s("path", {d: "M-.16 .02L0 -.1L.16 .02L.1 .12H-.1Z", class: "zsa-fy-balloon-knot", "vector-effect": "non-scaling-stroke"}, body);
    return {group, body};
  }
  function poseBalloon(b, radius, wobble, tilt) {
    const inflate = Math.max(0, Math.min(1, (radius - R0) / (R0 * 0.9)));
    const angle = (tilt === undefined ? -34 : tilt) * (1 - inflate);
    const w = wobble || 0;
    const sx = radius * (1 + w), sy = radius * (0.8 + 0.2 * inflate) * (1 - w * 0.8);
    b.body.setAttribute("transform", "rotate(" + angle.toFixed(2) + ") scale(" + sx.toFixed(2) + "," + sy.toFixed(2) + ")");
    return {angle, sx, sy};
  }
  function bottleShape(parent, x, base, scale, liquidTop) {
    const g = s("g", {transform: "translate(" + x + "," + base + ")" + (scale ? " scale(" + scale + ")" : "")}, parent);
    s("ellipse", {cx: 0, cy: 2, rx: 40, ry: 7, class: "zsa-fy-shadow"}, g);
    s("path", {d: "M-35 -10Q-35 0 -25 0H25Q35 0 35 -10V-118C35 -138 12 -140 12 -156V-178H-12V-156C-12 -140 -35 -138 -35 -118Z", class: "zsa-fy-glass-back"}, g);
    const liquid = s("path", {d: "M-31 -10Q-31 -4 -24 -4H24Q31 -4 31 -10V" + liquidTop + "H-31Z", class: "zsa-fy-liquid"}, g);
    s("ellipse", {cx: 0, cy: liquidTop, rx: 31, ry: 4, class: "zsa-fy-liquid-top"}, g);
    const bubbles = s("g", {class: "zsa-fy-bubbles"}, g);
    const foam = s("ellipse", {cx: 0, cy: liquidTop - 1, rx: 30, ry: 0, class: "zsa-fy-foam"}, g);
    s("path", {d: "M-35 -10Q-35 0 -25 0H25Q35 0 35 -10V-118C35 -138 12 -140 12 -156V-178H-12V-156C-12 -140 -35 -138 -35 -118Z", class: "zsa-fy-glass"}, g);
    s("path", {d: "M-26 -22V-104M-22 -128C-14 -137 -8 -138 -7 -150", class: "zsa-fy-glass-shine"}, g);
    s("rect", {x: -15, y: -184, width: 30, height: 8, rx: 3, class: "zsa-fy-lip"}, g);
    return {g, liquid, bubbles, foam};
  }

  // The bench: five bottles in a warm water bath. Used by Part A and Part B.
  function makeBench(titleKey, onBalloon) {
    const svg = s("svg", {viewBox: "0 0 600 330", class: "zsa-fy-bench", role: "img"});
    const title = s("title", {}, svg);
    const defs = s("defs", {}, svg);
    const dots = s("pattern", {id: "zsa-fy-dots-" + titleKey, width: 14, height: 14, patternUnits: "userSpaceOnUse"}, defs);
    s("circle", {cx: 3, cy: 3, r: 1.2, class: "zsa-fy-dot"}, dots);
    s("rect", {x: 0, y: 0, width: 600, height: 330, rx: 18, class: "zsa-fy-wall"}, svg);
    s("rect", {x: 0, y: 0, width: 600, height: 330, rx: 18, fill: "url(#zsa-fy-dots-" + titleKey + ")"}, svg);
    s("rect", {x: 8, y: 196, width: 584, height: 124, rx: 22, class: "zsa-fy-bath-back"}, svg);
    s("rect", {x: 18, y: 206, width: 564, height: 12, rx: 6, class: "zsa-fy-bath-rim"}, svg);
    const xs = [60, 180, 300, 420, 540], neckY = 300 - 186;
    const bottles = [], balloons = [], tapes = [], hits = [];
    xs.forEach(function (x, i) {
      const bottle = bottleShape(svg, x, 300, 0, -82);
      bottles.push(bottle);
      const holder = s("g", {transform: "translate(" + x + "," + (neckY + 2) + ")"}, svg);
      const b = balloonShape(holder);
      s("rect", {x: -14, y: -4, width: 28, height: 9, rx: 3, class: "zsa-fy-band"}, holder);
      balloons.push(Object.assign(b, {x, radius: R0, wobble: 0}));
      const label = s("g", {transform: "translate(" + x + ",246)"}, svg);
      s("rect", {x: -22, y: -14, width: 44, height: 28, rx: 7, class: "zsa-fy-label"}, label);
      s("text", {x: 0, y: 7, "text-anchor": "middle", class: "zsa-fy-label-num"}, label).textContent = String(i + 1);
    });
    s("rect", {x: 8, y: 218, width: 584, height: 102, rx: 18, class: "zsa-fy-bath-water"}, svg);
    s("path", {d: "M22 226Q60 220 98 226T174 226T250 226T326 226T402 226T478 226T554 226T578 226", class: "zsa-fy-bath-wave"}, svg);
    s("rect", {x: 8, y: 300, width: 584, height: 22, rx: 11, class: "zsa-fy-bath-front"}, svg);
    // Tape readings sit on top of everything.
    xs.forEach(function (x) {
      const g = s("g", {class: "zsa-fy-tape", hidden: true}, svg);
      const band = s("ellipse", {cx: x, cy: 0, rx: 10, ry: 4, class: "zsa-fy-tape-band", pathLength: 1}, g);
      const ticks = s("ellipse", {cx: x, cy: 0, rx: 10, ry: 4, class: "zsa-fy-tape-ticks"}, g);
      const tag = s("g", {}, g);
      s("rect", {x: -38, y: -15, width: 76, height: 30, rx: 9, class: "zsa-fy-tape-tag"}, tag);
      const text = s("text", {x: 0, y: 7, "text-anchor": "middle", class: "zsa-fy-tape-text"}, tag);
      tapes.push({g, band, ticks, tag, text});
    });
    // Pointer shortcut: tap a balloon to measure it. The accessible controls are the buttons under the drawing.
    const overlay = s("g", {"aria-hidden": "true"}, svg);
    xs.forEach(function (x, i) {
      hits.push(s("rect", {x: x - 56, y: 0, width: 112, height: 200, class: "zsa-fy-hit", on: {click: () => onBalloon(i)}}, overlay));
    });
    // Bubble pool: decorative, spawned at the rate the model gives.
    const pool = bottles.map(bottle => Array.from({length: 12}, () => ({node: s("circle", {r: 2.5, class: "zsa-fy-bubble", hidden: true}, bottle.bubbles), on: false, x: 0, y: 0, v: 0})));
    const acc = [0, 0, 0, 0, 0];
    function setTitle(text) { title.textContent = text; svg.setAttribute("aria-label", text); }
    function pose(i, radius, wobble) {
      const b = balloons[i];
      b.radius = radius;
      return poseBalloon(b, radius, wobble);
    }
    function setFoam(i, gas) { bottles[i].foam.setAttribute("ry", Math.min(8, gas / 40).toFixed(2)); }
    function bubbleStep(i, rate, dt) {
      acc[i] += rate * 0.55 * dt;
      while (acc[i] >= 1) {
        acc[i] -= 1;
        const free = pool[i].find(p => !p.on);
        if (!free) break;
        free.on = true; free.x = -24 + Math.random() * 48; free.y = -8; free.v = 70 + Math.random() * 50;
        free.node.setAttribute("r", (1.6 + Math.random() * 2.2).toFixed(1));
        free.node.removeAttribute("hidden");
      }
      pool[i].forEach(function (p) {
        if (!p.on) return;
        p.y -= p.v * dt;
        p.x += Math.sin(p.y / 9) * 0.25;
        if (p.y <= -80) { p.on = false; p.node.setAttribute("hidden", ""); return; }
        p.node.setAttribute("cx", p.x.toFixed(1));
        p.node.setAttribute("cy", p.y.toFixed(1));
      });
    }
    function clearBubbles() {
      pool.forEach(list => list.forEach(p => { p.on = false; p.node.setAttribute("hidden", ""); }));
      acc.fill(0);
    }
    function balloonBox(i) {
      const b = balloons[i];
      const inflate = Math.max(0, Math.min(1, (b.radius - R0) / (R0 * 0.9)));
      const sy = b.radius * (0.8 + 0.2 * inflate);
      return {x: b.x - (inflate < 1 ? (1 - inflate) * b.radius * 0.6 : 0), y: neckY + 2 - 1.22 * sy, rx: b.radius, ry: sy};
    }
    function showTape(i, value, animateIt) {
      const tape = tapes[i], box = balloonBox(i);
      tape.g.removeAttribute("hidden");
      [tape.band, tape.ticks].forEach(e => { e.setAttribute("cx", box.x.toFixed(1)); e.setAttribute("cy", box.y.toFixed(1)); e.setAttribute("rx", (box.rx + 3).toFixed(1)); e.setAttribute("ry", Math.max(4, box.rx * 0.3).toFixed(1)); });
      tape.tag.setAttribute("transform", "translate(" + balloons[i].x + "," + (neckY + 36) + ")");
      tape.text.textContent = fmt(value) + " cm";
      if (!animateIt || reduced) { tape.band.setAttribute("stroke-dashoffset", "0"); tape.tag.removeAttribute("opacity"); return Promise.resolve(); }
      tape.tag.setAttribute("opacity", "0");
      return tween(420, p => tape.band.setAttribute("stroke-dashoffset", (1 - p).toFixed(3)), easeInOut).then(function () {
        return tween(220, p => tape.tag.setAttribute("opacity", p.toFixed(2)));
      });
    }
    function hideTapes() { tapes.forEach(tape => tape.g.setAttribute("hidden", "")); }
    return {svg, setTitle, pose, setFoam, bubbleStep, clearBubbles, showTape, hideTapes, hits, balloons};
  }

  // Settle each balloon with a short, damped wobble after it changes size.
  function settle(bench, radii) {
    if (reduced) { radii.forEach((r, i) => bench.pose(i, r, 0)); return Promise.resolve(); }
    const from = bench.balloons.map(b => b.radius);
    return tween(700, function (p) {
      radii.forEach(function (r, i) {
        const radius = from[i] + (r - from[i]) * ease(p);
        bench.pose(i, radius, Math.abs(r - from[i]) > 1 ? 0.05 * Math.sin(p * 18 + i) * (1 - p) : 0);
      });
    }, x => x);
  }

  // A small clock face for the fast-forward.
  function makeClock() {
    const svg = s("svg", {viewBox: "0 0 40 40", class: "zsa-fy-clock", "aria-hidden": "true", focusable: "false"});
    s("circle", {cx: 20, cy: 20, r: 17, class: "zsa-fy-clock-face"}, svg);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      s("line", {x1: 20 + Math.sin(a) * 13, y1: 20 - Math.cos(a) * 13, x2: 20 + Math.sin(a) * 15, y2: 20 - Math.cos(a) * 15, class: "zsa-fy-clock-tick"}, svg);
    }
    const hand = s("line", {x1: 20, y1: 20, x2: 20, y2: 7, class: "zsa-fy-clock-hand"}, svg);
    s("circle", {cx: 20, cy: 20, r: 2.2, class: "zsa-fy-clock-pin"}, svg);
    return {svg, set(minutes) { hand.setAttribute("transform", "rotate(" + (minutes / 60 * 360).toFixed(1) + " 20 20)"); }};
  }

  // ---------- Graphs: bars or points the student drags (or moves with the arrow keys) ----------
  function makeGraph(opts) {
    const W = 360, H = 290, L = 50, R = 12, T = opts.kind === "line" ? 46 : 30, B = 252;
    const svg = s("svg", {viewBox: "0 0 " + W + " " + H, class: "zsa-fy-graph", role: "group"});
    s("title", {}, svg).textContent = t(opts.title);
    svg.setAttribute("aria-label", t(opts.title));
    let yMax = 20;
    const grid = s("g", {class: "zsa-fy-grid", "aria-hidden": "true"}, svg);
    const yTitle = s("text", {class: "zsa-fy-axis-title", "text-anchor": "middle", transform: "translate(13," + ((T + B) / 2) + ") rotate(-90)", "aria-hidden": "true"}, svg);
    yTitle.textContent = t(opts.yTitle);
    const xPos = opts.kind === "bar" ? i => L + (W - L - R) / 5 * (i + 0.5) : v => L + 10 + (W - L - R - 20) * v / 20;
    const yPos = v => B - (B - T) * v / yMax;
    const yVal = y => (B - y) / (B - T) * yMax;
    function drawGrid() {
      grid.replaceChildren();
      for (let v = 0; v <= yMax; v += 2) {
        s("line", {x1: L, x2: W - R, y1: yPos(v), y2: yPos(v), class: v === 0 ? "zsa-fy-axis" : "zsa-fy-gridline"}, grid);
        if (v % 4 === 0) s("text", {x: L - 7, y: yPos(v) + 5, "text-anchor": "end", class: "zsa-fy-tick"}, grid).textContent = String(v);
      }
      s("line", {x1: L, x2: L, y1: T - 6, y2: B, class: "zsa-fy-axis"}, grid);
      if (opts.kind === "line") model.DOSES.forEach(d => {
        s("line", {x1: xPos(d), x2: xPos(d), y1: B, y2: B + 6, class: "zsa-fy-axis"}, grid);
        s("text", {x: xPos(d), y: B + 24, "text-anchor": "middle", class: "zsa-fy-tick"}, grid).textContent = String(d);
      });
    }
    const line = opts.kind === "line" ? s("polyline", {class: "zsa-fy-plot-line", "aria-hidden": "true"}, svg) : null;
    const items = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const g = s("g", {class: "zsa-fy-slider", role: "slider", tabindex: "0", "aria-orientation": "vertical", "aria-valuemin": "0"}, svg);
      const column = s("rect", {class: "zsa-fy-column", y: T - 10, height: B - T + 10}, g);
      let bar = null, knob, check;
      const x = opts.kind === "bar" ? xPos(i) : xPos(model.DOSES[i]);
      if (opts.kind === "bar") {
        column.setAttribute("x", x - 30); column.setAttribute("width", 60);
        bar = s("rect", {x: x - 17, width: 34, rx: 4, class: "zsa-fy-bar zsa-fy-grab"}, g);
        knob = s("g", {class: "zsa-fy-knob zsa-fy-grab"}, g);
        s("rect", {x: -19, y: -7, width: 38, height: 14, rx: 7, class: "zsa-fy-knob-shape"}, knob);
        s("path", {d: "M-6 -2H6M-6 2H6", class: "zsa-fy-knob-grip"}, knob);
      } else {
        column.setAttribute("x", x - 15); column.setAttribute("width", 30);
        knob = s("g", {class: "zsa-fy-knob zsa-fy-grab"}, g);
        s("circle", {r: 16, class: "zsa-fy-knob-hit"}, knob);
        s("circle", {r: 8, class: "zsa-fy-point"}, knob);
      }
      const value = s("text", {x, "text-anchor": "middle", class: "zsa-fy-bar-value", "aria-hidden": "true"}, g);
      const hint = s("g", {class: "zsa-fy-hint", "aria-hidden": "true", hidden: true}, g);
      s("path", {d: "M-7 4L0 -3L7 4", class: "zsa-fy-hint-arrow"}, hint);
      check = s("g", {class: "zsa-fy-match", "aria-hidden": "true", hidden: true}, g);
      const checkInner = s("g", {}, check);
      s("circle", {r: 9, class: "zsa-fy-match-disc"}, checkInner);
      s("path", {d: "M-4 0l3 3 5-6", class: "zsa-fy-match-path"}, checkInner);
      items.push({g, column, bar, knob, value, check, checkInner, hint, x, v: 0});
    }
    let marker = null;
    if (opts.kind === "line") {
      const g = s("g", {class: "zsa-fy-slider zsa-fy-marker", role: "slider", tabindex: "0", "aria-orientation": "horizontal", "aria-valuemin": "0", "aria-valuemax": "20"}, svg);
      const track = s("rect", {x: L, y: 0, width: W - L - R, height: 30, class: "zsa-fy-column"}, g);
      const rule = s("line", {y1: 28, y2: B, class: "zsa-fy-marker-line"}, g);
      const handle = s("g", {class: "zsa-fy-grab"}, g);
      s("rect", {x: -40, y: 2, width: 80, height: 26, rx: 13, class: "zsa-fy-marker-tab"}, handle);
      s("text", {x: 0, y: 20, "text-anchor": "middle", class: "zsa-fy-marker-text"}, handle).textContent = t("markText");
      marker = {g, track, rule, handle, v: 0};
      g.setAttribute("aria-label", t("markLabel"));
      g.setAttribute("hidden", "");
    }
    function point(event) {
      const p = svg.createSVGPoint();
      p.x = event.clientX; p.y = event.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    function setValue(i, v, user) {
      const item = items[i];
      item.v = model.snap(v, 0.5, 0, yMax);
      paint(i);
      if (user) opts.onChange(i, item.v);
    }
    function paint(i) {
      const item = items[i], y = yPos(item.v), target = opts.target(i);
      const ok = model.plotMatches(item.v, target);
      if (item.bar) { item.bar.setAttribute("y", y.toFixed(1)); item.bar.setAttribute("height", Math.max(0, B - y).toFixed(1)); }
      item.knob.setAttribute("transform", "translate(" + item.x + "," + y.toFixed(1) + ")");
      if (opts.kind === "bar") {
        item.value.setAttribute("x", item.x);
        item.value.setAttribute("y", (y - 13).toFixed(1));
      } else {
        // Line graph: the value sits below and to the right of its point (left for the last point), above it near the axis.
        const last = i === items.length - 1, below = y + 22 < B - 6;
        item.value.setAttribute("x", (item.x + (last ? -13 : 13)).toFixed(1));
        item.value.setAttribute("y", (below ? y + 22 : y - 9).toFixed(1));
        item.value.setAttribute("text-anchor", last ? "end" : "start");
      }
      item.value.textContent = item.v.toFixed(1);
      item.check.setAttribute("transform", "translate(" + item.x + "," + (y - (opts.kind === "bar" ? 36 : 24)).toFixed(1) + ")");
      item.hint.setAttribute("transform", "translate(" + item.x + "," + (y - (opts.kind === "bar" ? 34 : 22)).toFixed(1) + ")");
      if (item.v === 0 && !opts.locked()) item.hint.removeAttribute("hidden"); else item.hint.setAttribute("hidden", "");
      const wasOk = !item.check.hasAttribute("hidden");
      if (ok) { item.check.removeAttribute("hidden"); if (!wasOk) pop(item.checkInner); } else item.check.setAttribute("hidden", "");
      item.g.classList.toggle("zsa-fy-slider--ok", ok);
      item.g.setAttribute("aria-valuenow", item.v.toFixed(1));
      item.g.setAttribute("aria-valuemax", String(yMax));
      item.g.setAttribute("aria-valuetext", t(ok ? "barMatch" : "barValue", {value: item.v.toFixed(1)}));
      if (line) line.setAttribute("points", items.map(it => it.x + "," + yPos(it.v).toFixed(1)).join(" "));
      if (opts.onPaint) opts.onPaint();
    }
    function setMarker(v, user) {
      marker.v = Math.max(0, Math.min(20, Math.round(v)));
      const x = xPos(marker.v);
      marker.rule.setAttribute("x1", x); marker.rule.setAttribute("x2", x);
      marker.handle.setAttribute("transform", "translate(" + Math.max(L + 40, Math.min(W - R - 40, x)) + ",0)");
      marker.g.setAttribute("aria-valuenow", String(marker.v));
      marker.g.setAttribute("aria-valuetext", t("markValue", {dose: marker.v}));
      if (user) opts.onMark(marker.v);
    }
    function keys(event, value, step, big, low, high) {
      const map = {ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big};
      if (Object.hasOwn(map, event.key)) return Math.max(low, Math.min(high, value + map[event.key]));
      if (event.key === "Home") return low;
      if (event.key === "End") return high;
      return null;
    }
    items.forEach(function (item, i) {
      item.g.addEventListener("keydown", function (event) {
        if (opts.locked()) return;
        const next = keys(event, item.v, 0.5, 2, 0, yMax);
        if (next === null) return;
        event.preventDefault();
        setValue(i, next, true);
      });
      let dragging = false;
      item.column.addEventListener("click", function (event) {
        if (opts.locked() || dragging) return;
        setValue(i, yVal(point(event).y), true);
        item.g.focus({preventScroll: true});
      });
      [item.bar, item.knob].forEach(function (grab) {
        if (!grab) return;
        grab.addEventListener("pointerdown", function (event) {
          if (opts.locked()) return;
          event.preventDefault();
          dragging = true;
          grab.setPointerCapture(event.pointerId);
          item.g.focus({preventScroll: true});
          setValue(i, yVal(point(event).y), true);
        });
        grab.addEventListener("pointermove", function (event) { if (dragging) setValue(i, yVal(point(event).y), true); });
        const end = function () { if (dragging) setTimeout(() => { dragging = false; }, 0); };
        grab.addEventListener("pointerup", end);
        grab.addEventListener("pointercancel", end);
      });
    });
    if (marker) {
      marker.g.addEventListener("keydown", function (event) {
        const next = keys(event, marker.v, 1, 5, 0, 20);
        if (next === null) return;
        event.preventDefault();
        setMarker(next, true);
      });
      const fromX = x => (x - L - 10) / (W - L - R - 20) * 20;
      let dragging = false;
      marker.track.addEventListener("click", function (event) { if (!dragging) { setMarker(fromX(point(event).x), true); marker.g.focus({preventScroll: true}); } });
      marker.handle.addEventListener("pointerdown", function (event) {
        event.preventDefault(); dragging = true;
        marker.handle.setPointerCapture(event.pointerId);
        marker.g.focus({preventScroll: true});
      });
      marker.handle.addEventListener("pointermove", function (event) { if (dragging) setMarker(fromX(point(event).x), true); });
      marker.handle.addEventListener("pointerup", () => setTimeout(() => { dragging = false; }, 0));
      marker.handle.addEventListener("pointercancel", () => { dragging = false; });
    }
    function setLabels(labels) { items.forEach((item, i) => item.g.setAttribute("aria-label", labels[i])); }
    function sync(values, max) {
      yMax = max;
      drawGrid();
      values.forEach((v, i) => { items[i].v = v; paint(i); });
    }
    return {svg, items, sync, paint, setLabels, setMarker, marker, xPos, L, R, W};
  }

  // Room above the tallest value for its label and check mark.
  function yMaxFor(values) {
    const top = Math.max.apply(null, values.map(v => (Number.isFinite(v) ? v : 0)));
    return Math.max(20, Math.ceil((top + 3) / 4) * 4);
  }
  // Beside each graph: the values to plot, ticked off as each one matches.
  function dataList() {
    const list = h("ul", {class: "zsa-fy-datalist"});
    const panel = h("div", {class: "zsa-fy-datapanel"}, [h("h4", {class: "zsa-fy-h4", text: t("yourData")}), list]);
    function update(rows) {
      if (list.children.length !== rows.length) {
        list.replaceChildren();
        rows.forEach(function () {
          list.appendChild(h("li", null, [h("span", {class: "zsa-fy-dl-name"}), h("span", {class: "zsa-fy-dl-value"}), h("span", {class: "zsa-fy-dl-mark"})]));
        });
      }
      rows.forEach(function (row, i) {
        const li = list.children[i];
        setText(li.querySelector(".zsa-fy-dl-name"), row.name);
        setText(li.querySelector(".zsa-fy-dl-value"), Number.isFinite(row.value) ? fmt(row.value) + " cm" : "");
        const mark = li.querySelector(".zsa-fy-dl-mark"), was = li.classList.contains("zsa-fy-dl--ok");
        li.classList.toggle("zsa-fy-dl--ok", row.ok);
        if (row.ok && !was) { mark.replaceChildren(checkIcon(), h("span", {class: "zsa-sr-only", text: t("plotted")})); pop(mark.firstChild); }
        if (!row.ok && was) mark.replaceChildren();
        if (!row.ok && !mark.children.length) mark.replaceChildren(h("span", {class: "zsa-fy-dl-todo", "aria-hidden": "true"}));
      });
    }
    return {panel, update};
  }
  // A data table built from rows of cells. The first cell of a row is a row header.
  function table(captionKey, headers, numeric) {
    const caption = h("caption", {text: t(captionKey)});
    const thead = h("thead", null, h("tr", null, headers.map(key => h("th", {scope: "col", text: key}))));
    const tbody = h("tbody");
    const node = h("table", {class: "zsa-fy-table" + (numeric ? " zsa-fy-table--numbers" : "")}, [caption, thead, tbody]);
    const wrap = h("div", {class: "zsa-fy-table-wrap"}, node);
    const cells = [];
    function rows(list) {
      if (cells.length !== list.length) {
        tbody.replaceChildren();
        cells.length = 0;
        list.forEach(function (row) {
          const tr = h("tr");
          const rowCells = row.map((value, j) => h(j === 0 ? "th" : "td", j === 0 ? {scope: "row", text: value} : {text: value}));
          rowCells.forEach(c => tr.appendChild(c));
          tbody.appendChild(tr);
          cells.push(rowCells);
        });
      }
      list.forEach(function (row, i) {
        row.forEach(function (value, j) {
          const cell = cells[i][j], text = value === null || value === undefined ? "" : String(value);
          if (cell.textContent !== text) {
            const fresh = cell.tagName === "TD" && cell.textContent === "" && text !== "";
            cell.textContent = text;
            if (fresh && !reduced) { cell.classList.remove("zsa-fy-fresh"); void cell.offsetWidth; cell.classList.add("zsa-fy-fresh"); }
          }
        });
      });
    }
    return {wrap, rows};
  }

  // ---------- Hook ----------
  const build = {};
  build.hook = function () {
    const shell = screenShell("hook", "hookEyebrow", "hookTitle", "hookIntro");
    const card = h("div", {class: "zsa-fy-card zsa-fy-scene-card"});
    const svg = s("svg", {viewBox: "0 0 480 300", class: "zsa-fy-hook-scene", role: "img"});
    const title = s("title", {}, svg);
    s("rect", {x: 0, y: 0, width: 480, height: 300, rx: 18, class: "zsa-fy-wall"}, svg);
    s("rect", {x: 0, y: 238, width: 480, height: 62, class: "zsa-fy-counter"}, svg);
    s("path", {d: "M0 238H480", class: "zsa-fy-counter-edge"}, svg);
    // Loaf pan with dough that rises.
    s("ellipse", {cx: 140, cy: 240, rx: 100, ry: 8, class: "zsa-fy-shadow"}, svg);
    const dough = s("g", {}, svg);
    s("path", {d: "M54 196C54 120 226 120 226 196Z", class: "zsa-fy-dough"}, dough);
    const holes = [[100, 178, 4], [150, 168, 3], [180, 184, 3.5], [126, 156, 2.5]].map(([cx, cy, r]) => s("circle", {cx, cy, r, class: "zsa-fy-dough-hole"}, dough));
    s("path", {d: "M44 192H236L222 238H58Z", class: "zsa-fy-pan"}, svg);
    s("path", {d: "M40 188H240V198H40Z", class: "zsa-fy-pan-rim"}, svg);
    // A bottle of yeast and sugar water with a balloon.
    const bottle = bottleShape(svg, 352, 238, 0.76, -82);
    const holder = s("g", {transform: "translate(352," + (238 - 186 * 0.76 + 2) + ") scale(0.76)"}, svg);
    const b = balloonShape(holder);
    s("rect", {x: -14, y: -4, width: 28, height: 9, rx: 3, class: "zsa-fy-band"}, holder);
    const clockText = s("text", {x: 24, y: 40, class: "zsa-fy-scene-clock"}, svg);
    s("text", {x: 140, y: 278, "text-anchor": "middle", class: "zsa-fy-scene-label"}, svg).textContent = t("hookDough");
    s("text", {x: 352, y: 278, "text-anchor": "middle", class: "zsa-fy-scene-label"}, svg).textContent = t("hookBottle");
    const replay = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary", text: t("hookReplay"), hidden: true, on: {click: () => playHook()}});
    const observed = h("p", {class: "zsa-fy-observed", hidden: true, text: t("hookObserved")});
    card.appendChild(svg);
    card.appendChild(h("div", {class: "zsa-fy-scene-foot"}, [observed, replay]));
    const choices = choiceGroup("hook", "hookQuestion", data.predictions.hook.map(v => ({value: v, label: t("predict" + cap(v))})), function (value) {
      state.hook.prediction = value;
      choices.note.hidden = false;
      setText(choices.note, t("predictionSaved"));
      announce(t("predictionSaved"));
      refresh();
    }, "zsa-fy-side");
    const layout = h("div", {class: "zsa-fy-cols"}, [h("div", {class: "zsa-fy-main"}, card), choices.fieldset]);
    shell.section.appendChild(layout);
    function draw(p) {
      const rise = 0.5 + 0.5 * p;
      dough.setAttribute("transform", "translate(140,196) scale(" + (0.94 + 0.08 * p).toFixed(3) + "," + rise.toFixed(3) + ") translate(-140,-196)");
      holes.forEach((hole, i) => hole.setAttribute("opacity", Math.max(0, Math.min(1, p * 3 - i * 0.4)).toFixed(2)));
      const gas = 300 * p;
      poseBalloon(b, model.balloon(gas).radius * PX, 0);
      bottle.foam.setAttribute("ry", Math.min(7, gas / 45).toFixed(1));
      clockText.textContent = t("hookClock", {minutes: Math.round(60 * p)});
      const text = t("hookScene", {state: t(p >= 1 ? "hookAfter" : "hookBefore")});
      title.textContent = text; svg.setAttribute("aria-label", text);
    }
    screens.hook = Object.assign(shell, {draw, choices, card, replay, observed, sync() {
      const hk = state.hook;
      if (!hk.playing) draw(hk.played ? 1 : 0);
      replay.hidden = !hk.played || hk.playing;
      observed.hidden = !hk.played;
      choices.set(hk.prediction, false);
      choices.note.hidden = !hk.prediction;
      setText(choices.note, t("predictionSaved"));
    }});
  };
  function playHook() {
    const scr = screens.hook, hk = state.hook;
    if (hk.playing) return;
    hk.playing = true; busy = true;
    scr.sync(); refresh();
    reveal(scr.card);
    tween(4200, p => scr.draw(p), easeInOut).then(function () {
      hk.playing = false; hk.played = true; busy = false;
      scr.sync();
      announce(t("hookObserved"));
      refresh();
      reveal(scr.choices.fieldset);
      if (document.activeElement === action || document.activeElement === document.body) focusInside(scr.choices.fieldset);
    });
  }

  // ---------- Part A ----------
  build.a = function () {
    const shell = screenShell("a", "aEyebrow", "aTitle", "aIntro");
    const a = () => state.a;
    resetBar(shell, "resetA", "resetADone", function (snapshot) {
      const old = JSON.parse(JSON.stringify(state.a));
      state.a = snapshot || freshA();
      screens.a.bench.hideTapes(); screens.a.bench.clearBubbles();
      screens.a.sync(); refresh();
      return old;
    }, () => state.a.prediction !== null || state.a.checked);
    const predict = choiceGroup("a", "aQuestion", model.FOODS.map(f => ({value: f, label: foodName(f)})), function (value) {
      a().prediction = value;
      if (a().phase === "predict") a().phase = "setup";
      announce(t("predictionSaved"));
      sync(); refresh();
    }, "zsa-fy-top");
    // Bench and bottle buttons.
    const clock = makeClock();
    const clockText = h("span", {class: "zsa-fy-clock-text"});
    const bench = makeBench("a", i => onBottle(i, true));
    const benchHead = h("div", {class: "zsa-fy-bench-head"}, [h("h3", {class: "zsa-fy-h3", tabindex: "-1", text: t("setupTitle")}), h("p", {class: "zsa-fy-clockbox"}, [clock.svg, clockText])]);
    const bottleButtons = model.FOODS.map(function (food, i) {
      const num = h("span", {class: "zsa-fy-bottle-num", text: String(i + 1)});
      const name = h("span", {class: "zsa-fy-bottle-name", text: shortName(food)});
      const reading = h("span", {class: "zsa-fy-bottle-reading"});
      const badge = h("span", {class: "zsa-fy-bottle-warn", "aria-hidden": "true", hidden: true}, warnIcon());
      // No aria-label: the name is the visible text ("1 No sugar Measure"), so it always matches what students see.
      const button = h("button", {type: "button", class: "zsa-fy-bottle", on: {click: () => onBottle(i, false)}}, [num, " ", name, " ", reading, badge]);
      return {button, reading, badge, name};
    });
    // The status line under each bottle name: Measure, a reading, or a warning from the fair test checker.
    function bottleStatus(b, i, value, measuring) {
      const st = a();
      if (measuring && value === null) { b.reading.replaceChildren(t("measureShort")); b.reading.className = "zsa-fy-bottle-reading zsa-fy-bottle-todo"; return; }
      if (value !== null) { setText(b.reading, fmt(value) + " cm"); b.reading.className = "zsa-fy-bottle-reading"; return; }
      if (flagged(i) && !locked() && st.phase === "setup") { b.reading.replaceChildren(t("warning")); b.reading.className = "zsa-fy-bottle-reading zsa-fy-bottle-flag"; return; }
      setText(b.reading, ""); b.reading.className = "zsa-fy-bottle-reading";
    }
    const benchCard = h("div", {class: "zsa-fy-card zsa-fy-bench-card"}, [benchHead, bench.svg, h("div", {class: "zsa-fy-bottles", role: "group", "aria-label": t("pickBottle")}, bottleButtons.map(b => b.button))]);
    // Recipe card for the selected bottle.
    const recipeTitle = h("h3", {class: "zsa-fy-h3", tabindex: "-1"});
    const steppers = {};
    const recipeBody = h("div", {class: "zsa-fy-recipe"});
    ["temperature", "yeast", "amount"].forEach(function (field) {
      const label = h("span", {class: "zsa-fy-field-label", text: t(FIELD[field])});
      const value = h("span", {class: "zsa-fy-field-value"});
      const warn = h("span", {class: "zsa-fy-field-warn", hidden: true}, [warnIcon(), h("span", {class: "zsa-sr-only", text: t("warning")})]);
      const lower = h("button", {type: "button", class: "zsa-fy-step-btn", on: {click: () => change(field, -1)}}, h("span", {"aria-hidden": "true", text: "−"}));
      const raise = h("button", {type: "button", class: "zsa-fy-step-btn", on: {click: () => change(field, 1)}}, h("span", {"aria-hidden": "true", text: "+"}));
      const row = h("div", {class: "zsa-fy-field"}, [h("div", {class: "zsa-fy-field-name"}, [label, warn]), h("div", {class: "zsa-fy-stepper"}, [lower, value, raise])]);
      steppers[field] = {row, value, lower, raise, warn};
      recipeBody.appendChild(row);
    });
    const controlNote = h("p", {class: "zsa-fy-note zsa-fy-control-note", text: t("controlNote")});
    const lockNote = h("p", {class: "zsa-fy-note", text: t("setupLocked"), hidden: true});
    const partner = h("p", {class: "zsa-fy-partner", text: t("partnerNote")});
    const setupCard = h("div", {class: "zsa-fy-card zsa-fy-setup"}, [partner, recipeTitle, recipeBody, controlNote, lockNote]);
    // Fair test checker.
    const checkerHead = h("h3", {class: "zsa-fy-h3", text: t("fairTitle")});
    const checkerText = h("p", {class: "zsa-fy-checker-text"});
    const checkerList = h("ul", {class: "zsa-fy-issues"});
    const checker = h("div", {class: "zsa-fy-card zsa-fy-checker", hidden: true}, [checkerHead, checkerText, checkerList]);
    // Data table and bar graph.
    const dataTable = table("tableATitle", [t("colBottle"), t("colFood"), t("colStart"), t("colEnd"), t("colChange")]);
    const tableCard = h("div", {class: "zsa-fy-card zsa-fy-data"}, [dataTable.wrap, h("p", {class: "zsa-fy-note", text: t("tableNote")})]);
    const graph = makeGraph({kind: "bar", title: "graphA", yTitle: "axisChange",
      target: i => (a().end[i] !== null && a().start[i] !== null ? model.round1(a().end[i] - a().start[i]) : null),
      locked: () => false,
      onChange: function (i, v) {
        a().plot[i] = v;
        const matched = matches();
        if (matched === 5 && a().phase === "graph") { a().phase = "done"; announce(t("graphADone") + " " + t("guideADone")); }
        refresh();
        graphStatus();
      }, onMark() {}});
    graph.setLabels(model.FOODS.map(f => t("barLabel", {food: foodName(f)})));
    const graphLabels = h("div", {class: "zsa-fy-graph-x", "aria-hidden": "true"}, model.FOODS.map((f, i) => h("span", null, [h("span", {class: "zsa-fy-x-num", text: String(i + 1)}), h("span", {class: "zsa-fy-x-name", text: shortName(f)})])));
    const graphStatusText = h("p", {class: "zsa-fy-graph-status"});
    const aData = dataList();
    const graphCard = h("div", {class: "zsa-fy-card zsa-fy-graph-card", hidden: true}, [h("h3", {class: "zsa-fy-h3", tabindex: "-1", text: t("graphATitle")}),
      h("div", {class: "zsa-fy-graph-layout"}, [h("div", {class: "zsa-fy-graph-wrap"}, [graph.svg, graphLabels, h("p", {class: "zsa-fy-graph-xtitle", text: t("axisFood")})]), aData.panel]), graphStatusText]);
    shell.section.appendChild(h("div", {class: "zsa-fy-cols"}, [predict.fieldset,
      h("div", {class: "zsa-fy-main"}, benchCard),
      h("div", {class: "zsa-fy-side"}, [setupCard, checker]),
      h("div", {class: "zsa-fy-low"}, tableCard)
    ]));
    shell.section.appendChild(graphCard);

    function matches() { return a().plot.filter((v, i) => model.plotMatches(v, graph.items.length ? changeOf(i) : null)).length; }
    function changeOf(i) { return a().end[i] !== null && a().start[i] !== null ? model.round1(a().end[i] - a().start[i]) : null; }
    function graphStatus() {
      aData.update(model.FOODS.map((f, i) => ({name: (i + 1) + " " + shortName(f), value: changeOf(i), ok: model.plotMatches(a().plot[i], changeOf(i))})));
      const n = matches();
      setText(graphStatusText, a().phase === "done" ? t("graphADone") : t("graphAHelp") + " " + t("matchCount", {done: n}));
      graphStatusText.classList.toggle("zsa-fy-ok", a().phase === "done");
    }
    function locked() { return ["measureStart", "ready", "running", "measureEnd", "graph", "done"].indexOf(a().phase) >= 0; }
    function change(field, direction) {
      const st = a(), bottle = st.bottles[st.selected];
      if (locked() || (field === "amount" && bottle.food === "none")) return;
      const lim = model.LIMITS[field];
      const next = Math.max(lim.min, Math.min(lim.max, bottle[field] + direction * lim.step));
      if (next === bottle[field]) return;
      bottle[field] = next;
      if (st.checked) { const res = model.fairTest(st.bottles); st.issues = res.issues; st.tips = res.tips; }
      announce(t(FIELD[field]) + ": " + fieldValue(field, next));
      sync(); refresh();
    }
    function onBottle(i, fromDrawing) {
      const st = a();
      if (st.phase === "measureStart" || st.phase === "measureEnd") { measure(i); return; }
      if (fromDrawing && locked()) return;
      st.selected = i;
      sync();
      if (!fromDrawing) bottleButtons[i].button.focus();
    }
    function issueText(issue) {
      const st = a();
      if (issue.empty) return t("issueEmpty");
      if (issue.bottle === null) {
        return t({temperature: "issueTemperatureMixed", yeast: "issueYeastMixed", amount: "issueAmountMixed"}[issue.field], {values: issue.values.join(", ")});
      }
      return t({temperature: "issueTemperature", yeast: "issueYeast", amount: "issueAmount"}[issue.field], {number: issue.bottle + 1, food: foodName(st.bottles[issue.bottle].food), value: issue.value, expected: issue.expected});
    }
    function flagged(i) { return a().checked && a().issues.some(issue => issue.bottle === i || (issue.bottle === null && (issue.bottles || []).indexOf(i) >= 0)); }
    function flaggedField(i, field) { return a().checked && a().issues.some(issue => issue.field === field && (issue.bottle === i || (issue.bottle === null && (issue.bottles || []).indexOf(i) >= 0))); }
    function renderChecker() {
      const st = a();
      checker.hidden = !st.checked;
      if (!st.checked) return;
      checkerList.replaceChildren();
      checker.classList.toggle("zsa-fy-checker--ok", locked());
      if (locked()) {
        checkerText.replaceChildren(checkIcon(), h("span", {text: t("fairOk")}));
        st.tips.forEach(tip => checkerList.appendChild(h("li", {class: "zsa-fy-tip", text: t(tip.kind === "cool" ? "tipCool" : "tipHot", {value: tip.value})})));
        return;
      }
      if (!st.issues.length) {
        checkerText.replaceChildren(checkIcon(), h("span", {text: t("fairReady")}));
        return;
      }
      checkerText.replaceChildren(h("span", {text: st.issues.length === 1 ? t("fairAlmost") : t("fairAlmostMany", {count: st.issues.length})}));
      st.issues.forEach(function (issue) {
        const li = h("li", null, [warnIcon(), h("span", {text: issueText(issue)})]);
        const target = issue.bottle !== null ? issue.bottle : (issue.bottles || [])[0];
        if (target !== undefined && target !== null) {
          li.appendChild(h("button", {type: "button", class: "zsa-fy-link-btn", text: t("fixBottle", {number: target + 1}), on: {click: function () {
            st.selected = target; sync();
            const stepper = steppers[issue.field];
            reveal(setupCard);
            (stepper.value.textContent && !stepper.raise.disabled ? stepper.raise : bottleButtons[target].button).focus();
          }}}));
        }
        checkerList.appendChild(li);
      });
    }
    function poseFromState(animateIt) {
      const st = a();
      const after = ["measureEnd", "graph", "done"].indexOf(st.phase) >= 0;
      const radii = st.bottles.map((bottle, i) => (after && st.results ? model.balloon(st.results[i].gas).radius * PX : R0));
      if (animateIt) return settle(bench, radii);
      radii.forEach((r, i) => bench.pose(i, r, 0));
      st.bottles.forEach((bottle, i) => bench.setFoam(i, after && st.results ? st.results[i].gas : 0));
      return Promise.resolve();
    }
    function benchTitle() {
      const st = a();
      const status = st.phase === "running" ? t("benchRunning", {minutes: Math.round(st.minutes)}) : ["measureEnd", "graph", "done"].indexOf(st.phase) >= 0 ? t("benchDone") : t("benchReady");
      bench.setTitle(t("benchA", {state: status}));
    }
    function sync() {
      const st = a();
      predict.set(st.prediction, ["running", "measureEnd", "graph", "done"].indexOf(st.phase) >= 0);
      predict.note.hidden = !st.prediction;
      setText(predict.note, ["running", "measureEnd", "graph", "done"].indexOf(st.phase) >= 0 ? t("predictionLocked") : t("predictionChangeable"));
      const bottle = st.bottles[st.selected];
      setText(recipeTitle, t("recipeTitle", {number: st.selected + 1, food: foodName(bottle.food)}));
      ["temperature", "yeast", "amount"].forEach(function (field) {
        const sp = steppers[field], lim = model.LIMITS[field], isControl = field === "amount" && bottle.food === "none";
        setText(sp.value, fieldValue(field, bottle[field]));
        sp.lower.disabled = locked() || isControl || bottle[field] <= lim.min;
        sp.raise.disabled = locked() || isControl || bottle[field] >= lim.max;
        sp.lower.setAttribute("aria-label", t("lower", {field: t(FIELD[field]).toLowerCase(), number: st.selected + 1}));
        sp.raise.setAttribute("aria-label", t("raise", {field: t(FIELD[field]).toLowerCase(), number: st.selected + 1}));
        sp.warn.hidden = !flaggedField(st.selected, field);
        sp.row.classList.toggle("zsa-fy-field--warn", flaggedField(st.selected, field));
      });
      controlNote.hidden = bottle.food !== "none";
      lockNote.hidden = !locked();
      partner.hidden = locked();
      bottleButtons.forEach(function (b, i) {
        const measuring = st.phase === "measureStart" || st.phase === "measureEnd";
        const value = st.phase === "measureStart" || st.phase === "ready" ? st.start[i] : ["measureEnd", "graph", "done"].indexOf(st.phase) >= 0 ? st.end[i] : null;
        bottleStatus(b, i, measuring ? (st.phase === "measureStart" ? st.start[i] : st.end[i]) : value, measuring);
        b.badge.hidden = !flagged(i) || locked();
        b.button.classList.toggle("zsa-fy-bottle--warn", flagged(i) && !locked());
        b.button.setAttribute("aria-pressed", String(!measuring && st.selected === i && !locked()));
      });
      renderChecker();
      setText(clockText, t("clock", {minutes: Math.round(st.minutes)}));
      clock.set(st.minutes);
      if (st.phase !== "running") poseFromState(false);
      benchTitle();
      const showAfter = ["measureEnd", "graph", "done"].indexOf(st.phase) >= 0;
      bench.hideTapes();
      model.FOODS.forEach(function (food, i) {
        const v = st.phase === "measureStart" || st.phase === "ready" ? st.start[i] : showAfter ? st.end[i] : null;
        if (v !== null) bench.showTape(i, v, false);
      });
      dataTable.rows(st.bottles.map((bottle, i) => [String(i + 1), foodName(bottle.food), fmt(st.start[i]), fmt(st.end[i]), st.start[i] !== null && st.end[i] !== null ? fmt(model.round1(st.end[i] - st.start[i])) : ""]));
      graphCard.hidden = ["graph", "done"].indexOf(st.phase) < 0;
      graph.sync(st.plot, yMaxFor(st.bottles.map((b, i) => changeOf(i))));
      graphStatus();
    }
    function measure(i) {
      const st = a();
      const list = st.phase === "measureStart" ? st.start : st.phase === "measureEnd" ? st.end : null;
      if (!list || list[i] !== null) return;
      list[i] = st.phase === "measureStart" ? st.results[i].start : st.results[i].end;
      announce(t("measured", {number: i + 1, value: fmt(list[i])}));
      reveal(bench.svg);
      bench.showTape(i, list[i], true);
      pop(bottleButtons[i].reading);
      if (list.every(v => v !== null)) {
        if (st.phase === "measureStart") st.phase = "ready";
        else { st.phase = "graph"; setTimeout(() => reveal(graphCard), 300); }
      }
      syncKeepTapes(); refresh();
    }
    // Re-render without redrawing the tape that is animating.
    function syncKeepTapes() {
      const st = a();
      dataTable.rows(st.bottles.map((bottle, i) => [String(i + 1), foodName(bottle.food), fmt(st.start[i]), fmt(st.end[i]), st.start[i] !== null && st.end[i] !== null ? fmt(model.round1(st.end[i] - st.start[i])) : ""]));
      bottleButtons.forEach(function (b, i) {
        const value = st.phase === "measureStart" || st.phase === "ready" ? st.start[i] : st.end[i];
        bottleStatus(b, i, value, st.phase === "measureStart" || st.phase === "measureEnd");
      });
      graphCard.hidden = ["graph", "done"].indexOf(st.phase) < 0;
      if (!graphCard.hidden) { graph.sync(st.plot, yMaxFor(st.bottles.map((b, i) => changeOf(i)))); graphStatus(); }
      predict.set(st.prediction, ["running", "measureEnd", "graph", "done"].indexOf(st.phase) >= 0);
    }
    function checkSetup() {
      const st = a();
      const res = model.fairTest(st.bottles);
      st.checked = true; st.issues = res.issues; st.tips = res.tips;
      if (res.fair) {
        st.phase = "measureStart";
        st.results = model.runTrial(sess, st.bottles, model.PART.a, 0);
        announce(t("fairOk") + " " + t("guideMeasureStart", {done: 0}));
      } else {
        announce((res.issues.length === 1 ? t("fairAlmost") : t("fairAlmostMany", {count: res.issues.length})) + " " + res.issues.map(issueText).join(" "));
        const first = res.issues[0];
        const target = first.bottle !== null && first.bottle !== undefined ? first.bottle : (first.bottles || [st.selected])[0];
        st.selected = target === undefined ? st.selected : target;
      }
      sync(); refresh();
      reveal(checker);
    }
    function nextUnmeasured() {
      const st = a(), list = st.phase === "measureStart" ? st.start : st.end;
      return list.findIndex(v => v === null);
    }
    function fastForward() {
      const st = a();
      if (st.phase !== "ready") return;
      st.phase = "running"; busy = true;
      bench.hideTapes();
      refresh(); syncKeepTapes();
      reveal(benchCard);
      const duration = reduced ? 0 : 4200;
      let last = 0, startTime = 0;
      const finish = function () {
        busy = false;
        bench.clearBubbles();
        st.phase = "measureEnd"; st.minutes = model.MINUTES;
        sync();
        announce(t("runDone"));
        refresh();
      };
      if (!duration) { finish(); return; }
      animate(function (now) {
        if (state.a !== st) return false;
        if (!startTime) { startTime = now; last = now; }
        const p = Math.min(1, (now - startTime) / duration), dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const minutes = model.MINUTES * easeInOut(p);
        st.minutes = minutes;
        st.bottles.forEach(function (bottle, i) {
          const gas = model.gasAt(bottle, sess, minutes, st.results[i].variation);
          const rate = model.rateAt(bottle, sess, minutes, st.results[i].variation);
          const r = model.balloon(gas).radius * PX;
          const growing = rate > 1 ? 1 : rate;
          bench.pose(i, r, 0.03 * growing * Math.sin(now / 90 + i * 1.7));
          bench.setFoam(i, gas);
          bench.bubbleStep(i, rate * 1.4, dt);
        });
        clock.set(minutes);
        setText(clockText, t("clock", {minutes: Math.round(minutes)}));
        if (Math.round(minutes) % 5 === 0) benchTitle();
        setText(guideText, t("guideRunning", {minutes: Math.round(minutes)}));
        if (p >= 1) {
          settle(bench, st.results.map(r => model.balloon(r.gas).radius * PX)).then(() => { if (state.a === st) finish(); });
          return false;
        }
        return true;
      });
    }
    screens.a = Object.assign(shell, {sync, bench, predict, setupCard, checker, graphCard, graph, benchCard, checkSetup, fastForward, nextUnmeasured, measure, tableCard});
  };

  // ---------- Part B ----------
  build.b = function () {
    const shell = screenShell("b", "bEyebrow", "bTitle", "bIntro");
    const b = () => state.b;
    const bottles = model.partBBottles();
    resetBar(shell, "resetB", "resetBDone", function (snapshot) {
      const old = JSON.parse(JSON.stringify(state.b));
      state.b = snapshot || freshB();
      screens.b.bench.hideTapes(); screens.b.bench.clearBubbles();
      screens.b.sync(); refresh();
      return old;
    }, () => state.b.prediction !== null);
    function sketch(points) {
      const svg = s("svg", {viewBox: "0 0 56 36", class: "zsa-fy-sketch", "aria-hidden": "true", focusable: "false"});
      s("path", {d: "M4 3V32H53", class: "zsa-fy-sketch-axis"}, svg);
      s("polyline", {points, class: "zsa-fy-sketch-line"}, svg);
      return svg;
    }
    const shapes = {straight: "6,30 50,6", levels: "6,30 18,15 30,9 50,7", down: "6,8 50,28", same: "6,18 50,18"};
    const predict = choiceGroup("b", "bQuestion", data.predictions.b.map(v => ({value: v, label: t("predict" + cap(v)), icon: sketch(shapes[v])})), function (value) {
      b().prediction = value;
      if (b().phase === "predict") b().phase = "measureStart";
      announce(t("predictionSaved"));
      sync(); refresh();
    }, "zsa-fy-sketch-choices zsa-fy-top");
    const clock = makeClock();
    const clockText = h("span", {class: "zsa-fy-clock-text"});
    const trialText = h("span", {class: "zsa-fy-trial-text"});
    const bench = makeBench("b", function (i) { if (b().phase === "measureStart" || b().phase === "measureEnd") measureAll(); void i; });
    const fair = h("p", {class: "zsa-fy-fair-line"}, [checkIcon(), h("span", {text: t("bFair")})]);
    const bottleLabels = h("div", {class: "zsa-fy-bottles zsa-fy-bottles--static"}, model.DOSES.map(function (dose, i) {
      return h("div", {class: "zsa-fy-bottle zsa-fy-bottle--static"}, [h("span", {class: "zsa-fy-bottle-num", text: String(i + 1)}), h("span", {class: "zsa-fy-bottle-name", text: t("doseLabel", {dose})}), h("span", {class: "zsa-fy-bottle-reading"})]);
    }));
    const benchCard = h("div", {class: "zsa-fy-card zsa-fy-bench-card"}, [h("div", {class: "zsa-fy-bench-head"}, [h("h3", {class: "zsa-fy-h3", tabindex: "-1"}, trialText), h("p", {class: "zsa-fy-clockbox"}, [clock.svg, clockText])]), bench.svg, bottleLabels, fair]);
    const dataTable = table("tableBTitle", [t("colGlucose"), t("colTrial", {number: 1}), t("colTrial", {number: 2}), t("colTrial", {number: 3}), t("colAverage")], true);
    const tableCard = h("div", {class: "zsa-fy-card zsa-fy-data"}, [dataTable.wrap, h("p", {class: "zsa-fy-note", text: t("tableBNote")})]);
    const graph = makeGraph({kind: "line", title: "graphB", yTitle: "axisAverage",
      target: i => averages()[i],
      locked: () => false,
      onChange: function (i, v) {
        b().plot[i] = v;
        if (matched() === 5 && b().phase === "graph") { b().phase = "mark"; announce(t("graphBDone") + " " + t("markQuestion")); graph.marker.g.removeAttribute("hidden"); }
        status(); refresh();
      },
      onMark: function (v) { b().mark = v; b().markStatus = null; status(); refresh(); }});
    graph.setLabels(model.DOSES.map(d => t("pointLabel", {dose: d})));
    const graphStatusText = h("p", {class: "zsa-fy-graph-status"});
    const markFeedback = h("p", {class: "zsa-fy-feedback", hidden: true});
    const bData = dataList();
    const graphCard = h("div", {class: "zsa-fy-card zsa-fy-graph-card", hidden: true}, [h("h3", {class: "zsa-fy-h3", tabindex: "-1", text: t("graphBTitle")}),
      h("div", {class: "zsa-fy-graph-layout"}, [h("div", {class: "zsa-fy-graph-wrap"}, [graph.svg, h("p", {class: "zsa-fy-graph-xtitle", text: t("axisGlucose")})]), bData.panel]), graphStatusText, markFeedback]);
    shell.section.appendChild(h("div", {class: "zsa-fy-cols"}, [predict.fieldset,
      h("div", {class: "zsa-fy-main"}, benchCard),
      h("div", {class: "zsa-fy-side"}, tableCard)
    ]));
    shell.section.appendChild(graphCard);

    function averages() {
      return model.DOSES.map((d, i) => model.average(b().changes.map(trial => trial[i])));
    }
    function matched() { const av = averages(); return b().plot.filter((v, i) => model.plotMatches(v, av[i])).length; }
    function status() {
      const st = b(), av = averages();
      bData.update(model.DOSES.map((d, i) => ({name: t("doseLabel", {dose: d}), value: av[i], ok: model.plotMatches(st.plot[i], av[i])})));
      const text = st.phase === "graph" ? t("graphBHelp") + " " + t("matchCount", {done: matched()}) : t("graphBDone") + " " + (st.phase === "done" ? "" : t("markQuestion"));
      setText(graphStatusText, text.trim());
      graphStatusText.classList.toggle("zsa-fy-ok", st.phase !== "graph");
      markFeedback.hidden = !st.markStatus;
      if (st.markStatus) {
        const pl = model.plateau(averages(), st.mark);
        const key = {ok: "markOk", early: "markEarly", late: "markLate", flat: "markFlat"}[st.markStatus];
        markFeedback.replaceChildren(st.markStatus === "ok" ? checkIcon() : warnIcon(), h("span", {text: t(key, {dose: pl.dose, mark: st.mark})}));
        markFeedback.classList.toggle("zsa-fy-feedback--ok", st.markStatus === "ok");
      }
    }
    function sync() {
      const st = b();
      const bLocked = st.phase !== "predict" && (st.trial > 0 || ["ready", "running", "measureEnd"].indexOf(st.phase) >= 0);
      predict.set(st.prediction, bLocked);
      predict.note.hidden = !st.prediction;
      setText(predict.note, t(bLocked ? "predictionLocked" : "predictionChangeable"));
      const trialNumber = st.phase === "between" ? st.trial : Math.min(3, st.trial + 1);
      setText(trialText, ["graph", "mark", "done"].indexOf(st.phase) >= 0 ? t("tableBTitle") : t("trialOf", {number: trialNumber}));
      setText(clockText, t("clock", {minutes: Math.round(st.minutes)}));
      clock.set(st.minutes);
      const current = st.phase === "between" ? st.results[st.trial - 1] : st.results[st.trial];
      const after = st.phase === "measureEnd" || st.phase === "between";
      if (st.phase !== "running") {
        bottles.forEach(function (bottle, i) {
          const gas = after && current ? current[i].gas : (["graph", "mark", "done"].indexOf(st.phase) >= 0 && st.results[2] ? st.results[2][i].gas : 0);
          bench.pose(i, model.balloon(gas).radius * PX, 0);
          bench.setFoam(i, gas);
        });
      }
      bench.hideTapes();
      const readings = bottles.map(function (bottle, i) {
        if (st.phase === "measureStart" || st.phase === "ready") return st.start[i];
        if (st.phase === "measureEnd" || st.phase === "between") return st.end[i];
        return null;
      });
      readings.forEach((v, i) => { if (v !== null) bench.showTape(i, v, false); });
      Array.from(bottleLabels.children).forEach((node, i) => setText(node.querySelector(".zsa-fy-bottle-reading"), readings[i] !== null ? fmt(readings[i]) + " cm" : ""));
      const status2 = st.phase === "running" ? t("benchRunning", {minutes: Math.round(st.minutes)}) : after || ["graph", "mark", "done"].indexOf(st.phase) >= 0 ? t("benchDone") : t("benchReady");
      bench.setTitle(t("benchB", {state: status2}));
      const av = averages();
      dataTable.rows(model.DOSES.map((d, i) => [String(d)].concat([0, 1, 2].map(k => (st.changes[k] ? fmt(st.changes[k][i]) : ""))).concat([st.changes.length === 3 ? fmt(av[i]) : ""])));
      graphCard.hidden = ["graph", "mark", "done"].indexOf(st.phase) < 0;
      graph.sync(st.plot, yMaxFor(av));
      if (["mark", "done"].indexOf(st.phase) >= 0) graph.marker.g.removeAttribute("hidden"); else graph.marker.g.setAttribute("hidden", "");
      graph.setMarker(st.mark, false);
      status();
    }
    function measureAll() {
      const st = b();
      if (st.phase !== "measureStart" && st.phase !== "measureEnd") return;
      if (st.phase === "measureStart" && !st.results[st.trial]) st.results[st.trial] = model.runTrial(sess, bottles, model.PART.b, st.trial);
      const res = st.results[st.trial], ending = st.phase === "measureEnd";
      busy = true; refresh();
      reveal(bench.svg);
      const list = ending ? st.end : st.start;
      let chain = Promise.resolve();
      bottles.forEach(function (bottle, i) {
        chain = chain.then(function () {
          if (state.b !== st) return null;
          list[i] = ending ? res[i].end : res[i].start;
          setText(bottleLabels.children[i].querySelector(".zsa-fy-bottle-reading"), fmt(list[i]) + " cm");
          return bench.showTape(i, list[i], true).then(() => (reduced ? null : wait(60)));
        });
      });
      chain.then(function () {
        if (state.b !== st) return;
        busy = false;
        if (!ending) { st.phase = "ready"; announce(t("guideBRun", {number: st.trial + 1})); }
        else {
          st.changes[st.trial] = res.map(r => r.change);
          st.trial += 1;
          announce(t("trialRecorded", {number: st.trial}));
          if (st.trial >= model.TRIALS) { st.phase = "graph"; st.trial = model.TRIALS - 1; setTimeout(() => reveal(graphCard), 300); }
          else st.phase = "between";
        }
        sync(); refresh();
      });
    }
    function nextTrial() {
      const st = b();
      if (st.phase !== "between") return;
      st.phase = "measureStart"; st.start = empty5(); st.end = empty5(); st.minutes = 0;
      busy = true;
      bench.hideTapes();
      settle(bench, bottles.map(() => R0)).then(function () {
        busy = false;
        bottles.forEach((bottle, i) => bench.setFoam(i, 0));
        sync(); refresh();
      });
      refresh();
    }
    function fastForward() {
      const st = b();
      if (st.phase !== "ready") return;
      st.phase = "running"; busy = true;
      bench.hideTapes();
      Array.from(bottleLabels.children).forEach(node => setText(node.querySelector(".zsa-fy-bottle-reading"), ""));
      refresh();
      const res = st.results[st.trial];
      const finish = function () {
        busy = false; bench.clearBubbles();
        st.phase = "measureEnd"; st.minutes = model.MINUTES;
        sync(); announce(t("runDone")); refresh();
      };
      if (reduced) { finish(); return; }
      let startTime = 0, last = 0;
      animate(function (now) {
        if (state.b !== st) return false;
        if (!startTime) { startTime = now; last = now; }
        const p = Math.min(1, (now - startTime) / 3400), dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const minutes = model.MINUTES * easeInOut(p);
        st.minutes = minutes;
        bottles.forEach(function (bottle, i) {
          const gas = model.gasAt(bottle, sess, minutes, res[i].variation), rate = model.rateAt(bottle, sess, minutes, res[i].variation);
          bench.pose(i, model.balloon(gas).radius * PX, 0.03 * Math.min(1, rate) * Math.sin(now / 90 + i * 1.7));
          bench.setFoam(i, gas);
          bench.bubbleStep(i, rate * 1.4, dt);
        });
        clock.set(minutes);
        setText(clockText, t("clock", {minutes: Math.round(minutes)}));
        setText(guideText, t("guideRunning", {minutes: Math.round(minutes)}));
        if (p >= 1) {
          settle(bench, res.map(r => model.balloon(r.gas).radius * PX)).then(() => { if (state.b === st) finish(); });
          return false;
        }
        return true;
      });
    }
    function checkMark() {
      const st = b();
      const pl = model.plateau(averages(), st.mark);
      st.markStatus = pl.status;
      if (pl.status === "ok") st.phase = "done";
      const key = {ok: "markOk", early: "markEarly", late: "markLate", flat: "markFlat"}[pl.status];
      announce(t(key, {dose: pl.dose, mark: st.mark}) + (pl.status === "ok" ? " " + t("guideBDone") : ""));
      status(); refresh();
      if (pl.status === "ok") pop(markFeedback.firstChild);
    }
    screens.b = Object.assign(shell, {sync, bench, predict, graphCard, graph, benchCard, measureAll, nextTrial, fastForward, checkMark, averages});
  };

  // ---------- Zoom: inside a yeast cell ----------
  build.zoom = function () {
    const shell = screenShell("zoom", "zEyebrow", "zTitle", "zIntro");
    const z = () => state.zoom;
    const svg = s("svg", {viewBox: "0 0 480 400", class: "zsa-fy-cell-scene", role: "img"});
    const title = s("title", {}, svg);
    s("rect", {x: 0, y: 0, width: 480, height: 400, rx: 18, class: "zsa-fy-broth"}, svg);
    [[30, 60], [440, 340], [60, 350], [420, 70], [24, 200], [460, 210]].forEach(([cx, cy]) => s("circle", {cx, cy, r: 3, class: "zsa-fy-speck"}, svg));
    s("ellipse", {cx: 250, cy: 205, rx: 172, ry: 148, class: "zsa-fy-cell-wall"}, svg);
    s("ellipse", {cx: 250, cy: 205, rx: 158, ry: 134, class: "zsa-fy-cytoplasm"}, svg);
    s("circle", {cx: 352, cy: 74, r: 9, class: "zsa-fy-bud"}, svg);
    s("circle", {cx: 178, cy: 120, r: 33, class: "zsa-fy-nucleus"}, svg);
    s("circle", {cx: 186, cy: 112, r: 9, class: "zsa-fy-nucleolus"}, svg);
    s("circle", {cx: 196, cy: 296, r: 30, class: "zsa-fy-vacuole"}, svg);
    const mitos = [[318, 122, -18], [326, 292, 14]].map(function ([x, y, r]) {
      const g = s("g", {transform: "translate(" + x + "," + y + ") rotate(" + r + ")", class: "zsa-fy-mito"}, svg);
      s("ellipse", {rx: 38, ry: 19, class: "zsa-fy-mito-out"}, g);
      s("path", {d: "M-28 0q5 -12 10 0t10 0t10 0t10 0t10 0", class: "zsa-fy-mito-in"}, g);
      return g;
    });
    // The transport protein: a channel in the membrane on the left.
    const door = s("g", {transform: "translate(84,205)"}, svg);
    s("rect", {x: -12, y: -26, width: 24, height: 16, rx: 5, class: "zsa-fy-door"}, door);
    s("rect", {x: -12, y: 10, width: 24, height: 16, rx: 5, class: "zsa-fy-door"}, door);
    const labels = s("g", {class: "zsa-fy-cell-labels", "aria-hidden": "true"}, svg);
    function label(x, y, key, minor, anchor) { s("text", {x, y, "text-anchor": anchor || "middle", class: "zsa-fy-cell-label" + (minor ? " zsa-fy-label-minor" : "")}, labels).textContent = t(key); }
    label(178, 172, "labelNucleus");
    label(196, 348, "labelVacuole", true);
    label(330, 334, "labelMito");
    label(14, 258, "labelDoor", false, "start");
    label(392, 386, "labelMembrane", true, "start");
    label(392, 26, "labelWall", true, "start");
    s("path", {d: "M398 32L386 66M396 372L372 326", class: "zsa-fy-leader zsa-fy-label-minor"}, labels);
    const layer = s("g", {class: "zsa-fy-molecules"}, svg);
    const fx = s("g", {class: "zsa-fy-fx"}, svg);
    // Panel: food, oxygen, counters.
    const food = choiceGroup("zfood", "foodLabel", ["glucose", "sucrose", "sweetener", "starch"].map(f => ({value: f, label: foodName(f)})), function (value) { z().food = value; refresh(); }, "zsa-fy-compact");
    const oxygen = choiceGroup("zoxy", "oxygenLabel", [{value: "off", label: t("oxygenOff")}, {value: "on", label: t("oxygenOn")}], function (value) { z().oxygen = value === "on"; sync(); refresh(); }, "zsa-fy-compact");
    const atpNum = h("span", {class: "zsa-fy-atp-num", text: "0"});
    const atpBox = h("div", {class: "zsa-fy-atp"}, [h("span", {class: "zsa-fy-atp-icon", "aria-hidden": "true"}, atpIcon()), h("span", {class: "zsa-fy-atp-label", text: t("atpMade")}), atpNum]);
    const tallies = {co2: h("dd"), ethanol: h("dd"), water: h("dd")};
    const tallyList = h("dl", {class: "zsa-fy-tallies"}, [h("dt", {text: t("tallyCO2")}), tallies.co2, h("dt", {text: t("tallyEthanol")}), tallies.ethanol, h("dt", {text: t("tallyWater")}), tallies.water]);
    const caption = h("p", {class: "zsa-fy-caption"});
    const feedAgain = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--secondary", text: t("feed"), hidden: true, on: {click: () => feed()}});
    const clear = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary", text: t("clearCell"), on: {click: function () {
      const zz = z(); zz.atp = 0; zz.co2 = 0; zz.ethanol = 0; zz.water = 0; zz.caption = "";
      layer.replaceChildren(); fx.replaceChildren(); sync();
    }}});
    const counterCard = h("div", {class: "zsa-fy-card zsa-fy-counter-card"}, [atpBox, h("p", {class: "zsa-fy-note", text: t("atpWhat")}), tallyList, h("div", {class: "zsa-fy-row"}, [feedAgain, clear])]);
    const sceneCard = h("div", {class: "zsa-fy-card zsa-fy-scene-card"}, [svg, caption]);
    const fermentLine = h("li", {class: "zsa-fy-eq", text: t("fermentEquation")});
    const respireLine = h("li", {class: "zsa-fy-eq", text: t("respireEquation")});
    const compare = h("div", {class: "zsa-fy-card zsa-fy-compare"}, [h("h3", {class: "zsa-fy-h3", text: t("compareTitle")}), h("ul", {class: "zsa-fy-eqs"}, [fermentLine, respireLine]), h("p", {text: t("compareNote")}), h("p", {class: "zsa-fy-note", text: t("bottleOxygen")})]);
    const revealText = h("p");
    const revealCard = h("div", {class: "zsa-fy-card zsa-fy-reveal", hidden: true}, [h("h3", {class: "zsa-fy-h3", text: t("revealTitle")}), revealText]);
    shell.section.appendChild(h("div", {class: "zsa-fy-cols"}, [
      h("div", {class: "zsa-fy-main"}, sceneCard),
      h("div", {class: "zsa-fy-side"}, [food.fieldset, oxygen.fieldset, counterCard]),
      h("div", {class: "zsa-fy-low"}, [revealCard, compare])
    ]));
    function atpIcon() {
      const icon = s("svg", {viewBox: "0 0 24 24", focusable: "false"});
      s("path", {d: "M13.5 2L5 13.5H11L9.5 22L19 9.5H12.5Z", class: "zsa-fy-bolt"}, icon);
      return icon;
    }
    function sync() {
      const zz = z();
      food.set(zz.food, false);
      oxygen.set(zz.oxygen ? "on" : "off", false);
      setText(atpNum, String(zz.atp));
      setText(tallies.co2, String(zz.co2)); setText(tallies.ethanol, String(zz.ethanol)); setText(tallies.water, String(zz.water));
      setText(caption, zz.caption || t("zSceneIdle"));
      const text = t("zScene", {state: zz.caption || t("zSceneIdle")});
      title.textContent = text; svg.setAttribute("aria-label", text);
      fermentLine.classList.toggle("zsa-fy-eq--on", !zz.oxygen);
      respireLine.classList.toggle("zsa-fy-eq--on", zz.oxygen);
      mitos.forEach(m => m.classList.toggle("zsa-fy-mito--on", zz.oxygen));
      feedAgain.hidden = !done("zoom");
      feedAgain.setAttribute("aria-disabled", String(busy));
      revealCard.hidden = !zz.fermented;
      const p = state.hook.prediction;
      setText(revealText, !p ? t("revealNone") : t(p === data.predictions.hookCorrect ? "revealRight" : "revealWrong", {answer: t("predict" + cap(p)).toLowerCase()}));
    }
    // Molecules: small SVG groups moved along straight segments.
    function hexagon(parent, key, cls) {
      const g = s("g", {class: "zsa-fy-mol " + (cls || "")}, parent);
      s("path", {d: "M0 -16L13.9 -8V8L0 16L-13.9 8V-8Z", class: "zsa-fy-hex"}, g);
      if (key) s("text", {x: 0, y: 34, "text-anchor": "middle", class: "zsa-fy-mol-label"}, g).textContent = t(key);
      return g;
    }
    function place(node, x, y, scale) { node.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")" + (scale ? " scale(" + scale.toFixed(3) + ")" : "")); }
    function move(node, from, to, duration, opts) {
      const o = opts || {};
      return tween(duration, function (p) {
        const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p;
        place(node, x + (o.wiggle ? Math.sin(p * 12) * o.wiggle : 0), y, o.scale ? o.scale[0] + (o.scale[1] - o.scale[0]) * p : 0);
        if (o.fade) node.setAttribute("opacity", (1 - p).toFixed(2));
      }, o.easing || easeInOut);
    }
    const beat = () => wait(reduced ? 900 : 120);
    function say(key) {
      z().caption = t(key);
      setText(caption, z().caption);
      const text = t("zScene", {state: z().caption});
      title.textContent = text; svg.setAttribute("aria-label", text);
      announce(z().caption);
    }
    function addAtp(n) {
      const zz = z(), from = zz.atp;
      zz.atp += n;
      const badge = s("g", {class: "zsa-fy-atp-float"}, fx);
      s("rect", {x: -30, y: -14, width: 60, height: 26, rx: 13, class: "zsa-fy-atp-chip"}, badge);
      s("text", {x: 0, y: 5, "text-anchor": "middle", class: "zsa-fy-atp-chip-text"}, badge).textContent = "+" + n + " " + t("labelATP");
      move(badge, [230, 200], [230, 150], 900, {fade: true, easing: ease}).then(() => badge.remove());
      return tween(n > 2 ? 900 : 300, p => setText(atpNum, String(Math.round(from + n * p)))).then(() => { setText(atpNum, String(zz.atp)); pop(atpBox); });
    }
    function bubble(x, y, labelKey, cls, to) {
      const g = s("g", {class: "zsa-fy-mol " + cls}, layer);
      if (cls === "zsa-fy-co2") s("circle", {r: 19, class: "zsa-fy-prod"}, g);
      else s("rect", {x: -38, y: -14, width: 76, height: 28, rx: 14, class: "zsa-fy-prod"}, g);
      s("text", {x: 0, y: 5, "text-anchor": "middle", class: "zsa-fy-prod-text"}, g).textContent = t(labelKey);
      place(g, x, y);
      return move(g, [x, y], to, 1300, {wiggle: cls === "zsa-fy-co2" ? 4 : 0, fade: true, easing: x2 => x2}).then(() => g.remove());
    }
    async function glucosePath(start, labelKey, first) {
      const zz = z();
      const mol = hexagon(layer, labelKey, "zsa-fy-glucose");
      place(mol, start[0], start[1]);
      if (first) say("capEnter");
      await move(mol, start, [62, 205], 700);
      await move(mol, [62, 205], [140, 205], 600);
      await beat();
      // Split into two 3-carbon pieces.
      mol.remove();
      if (first) say("capSplit");
      const pieces = [-1, 1].map(function () {
        const g = s("g", {class: "zsa-fy-mol zsa-fy-piece"}, layer);
        s("path", {d: "M0 -13L12 8H-12Z", class: "zsa-fy-tri"}, g);
        place(g, 150, 205);
        return g;
      });
      await Promise.all([move(pieces[0], [150, 205], [205, 180], 500), move(pieces[1], [150, 205], [205, 232], 500), addAtp(2)]);
      await beat();
      if (!zz.oxygen) {
        if (first) say("capFerment");
        await Promise.all([move(pieces[0], [205, 180], [372, 188], 900), move(pieces[1], [205, 232], [372, 224], 900)]);
        pieces.forEach(p => p.remove());
        zz.co2 += 2; zz.ethanol += 2;
        sync();
        await Promise.all([bubble(380, 186, "labelCO2", "zsa-fy-co2", [452, 40]), bubble(386, 228, "labelCO2", "zsa-fy-co2", [468, 70]),
          bubble(392, 198, "labelEthanol", "zsa-fy-ethanol", [470, 260]), bubble(392, 222, "labelEthanol", "zsa-fy-ethanol", [470, 300])]);
        zz.fermented = true;
      } else {
        if (first) say("capRespire");
        await Promise.all([move(pieces[0], [205, 180], [318, 122], 900), move(pieces[1], [205, 232], [326, 292], 900)]);
        pieces.forEach(p => p.remove());
        mitos.forEach(m => pop(m.firstChild));
        await addAtp(30);
        zz.co2 += 6; zz.water += 6;
        sync();
        const outs = [];
        for (let k = 0; k < 3; k++) {
          outs.push(bubble(340 + k * 8, 118, "labelCO2", "zsa-fy-co2", [440 + k * 10, 30 + k * 12]));
          outs.push(bubble(346 + k * 8, 292, "labelWater", "zsa-fy-water", [450 + k * 8, 380 - k * 6]));
        }
        await Promise.all(outs);
        zz.respired = true;
      }
    }
    async function feed() {
      if (busy) return;
      const zz = z();
      busy = true; refresh(); sync();
      const kind = zz.food;
      reveal(svg);
      try {
        if (kind === "glucose") await glucosePath([-30, 205], "labelGlucose", true);
        else if (kind === "sucrose") {
          say("capSucrose");
          const pair = s("g", {class: "zsa-fy-mol"}, layer);
          const left = hexagon(pair, "labelGlucose", "zsa-fy-glucose"), right = hexagon(pair, "labelFructose", "zsa-fy-fructose");
          place(left, -12, 0); place(right, 12, 0);
          place(pair, -30, 205);
          await move(pair, [-30, 205], [40, 205], 800);
          const enzyme = s("g", {class: "zsa-fy-mol zsa-fy-enzyme"}, layer);
          s("path", {d: "M0 0L14 -9A16 16 0 1 0 14 9Z", class: "zsa-fy-pac"}, enzyme);
          s("text", {x: 0, y: -22, "text-anchor": "middle", class: "zsa-fy-mol-label"}, enzyme).textContent = t("labelInvertase");
          await move(enzyme, [40, 120], [40, 186], 500);
          await beat();
          enzyme.remove();
          await Promise.all([move(left, [-12, 0], [-14, -26], 400), move(right, [12, 0], [14, 26], 400)]);
          pair.remove();
          zz.others = true;
          await glucosePath([26, 180], "labelGlucose", false);
          await glucosePath([54, 230], "labelFructose", false);
          say(zz.oxygen ? "capRespire" : "capFerment");
        } else if (kind === "sweetener") {
          say("capSweetener");
          const mol = s("g", {class: "zsa-fy-mol zsa-fy-sweet"}, layer);
          s("path", {d: "M0 -13L4 -4L13 -4L6 2L9 12L0 6L-9 12L-6 2L-13 -4L-4 -4Z", class: "zsa-fy-star"}, mol);
          s("text", {x: 0, y: 30, "text-anchor": "middle", class: "zsa-fy-mol-label"}, mol).textContent = t("labelSweetener");
          await move(mol, [-30, 205], [60, 205], 800);
          await move(mol, [60, 205], [30, 160], 500, {easing: ease});
          await move(mol, [30, 160], [-10, 120], 700, {fade: true});
          mol.remove();
          zz.others = true;
        } else {
          say("capStarch");
          const chain = s("g", {class: "zsa-fy-mol"}, layer);
          for (let k = 0; k < 6; k++) { const hx = hexagon(chain, null, "zsa-fy-starch"); place(hx, -k * 20, (k % 2) * 10 - 5, 0.75); }
          s("text", {x: -50, y: 34, "text-anchor": "middle", class: "zsa-fy-mol-label"}, chain).textContent = t("labelStarch");
          await move(chain, [-20, 205], [60, 205], 900);
          await move(chain, [60, 205], [44, 205], 300, {easing: ease});
          await wait(reduced ? 600 : 500);
          await move(chain, [44, 205], [20, 290], 900, {fade: true});
          chain.remove();
          zz.others = true;
        }
      } finally {
        busy = false;
        sync(); refresh();
      }
    }
    screens.zoom = Object.assign(shell, {sync, feed, food, oxygen, sceneCard});
  };

  // ---------- Check your understanding ----------
  build.check = function () {
    const shell = screenShell("check", "cEyebrow", "cTitle", "cIntro");
    const count = h("p", {class: "zsa-fy-qcount"});
    const dots = h("div", {class: "zsa-fy-qdots", "aria-hidden": "true"}, data.questions.map(() => h("span")));
    const prompt = h("h3", {class: "zsa-fy-question", tabindex: "-1"});
    const options = h("div", {class: "zsa-fy-options"});
    const feedback = h("div", {class: "zsa-fy-feedback", hidden: true});
    const finished = h("p", {class: "zsa-fy-feedback zsa-fy-feedback--ok", hidden: true}, [checkIcon(), h("span", {text: t("checkDone")})]);
    const card = h("div", {class: "zsa-fy-card zsa-fy-quiz"}, [h("div", {class: "zsa-fy-qhead"}, [count, dots]), prompt, options, finished]);
    shell.section.appendChild(card);
    let shown = -1;
    function sync() {
      const c = state.check, q = data.questions[c.index], ans = c.answers[c.index];
      setText(count, t("questionOf", {number: c.index + 1}));
      Array.from(dots.children).forEach((d, i) => { d.classList.toggle("zsa-fy-qdot--done", c.answers[i].correct); d.classList.toggle("zsa-fy-qdot--now", i === c.index); });
      setText(prompt, t(q.id));
      if (shown !== c.index) {
        shown = c.index;
        options.replaceChildren();
        feedback.hidden = true;
        q.options.forEach(function (key, i) {
          const mark = h("span", {class: "zsa-fy-opt-mark", "aria-hidden": "true"});
          const sr = h("span", {class: "zsa-sr-only"});
          options.appendChild(h("button", {type: "button", class: "zsa-fy-option", "data-option": String(i), on: {click: () => answer(i)}}, [mark, h("span", {class: "zsa-fy-opt-text", text: t(key)}), sr]));
        });
      }
      Array.from(options.querySelectorAll(".zsa-fy-option")).forEach(function (button, i) {
        const tried = ans.tried.indexOf(i) >= 0, right = ans.correct && i === q.correct;
        button.classList.toggle("zsa-fy-option--wrong", tried && i !== q.correct);
        button.classList.toggle("zsa-fy-option--right", right);
        if ((tried && i !== q.correct) || ans.correct) button.setAttribute("aria-disabled", "true"); else button.removeAttribute("aria-disabled");
        const mark = button.querySelector(".zsa-fy-opt-mark");
        mark.replaceChildren(right ? checkIcon() : tried ? h("span", {class: "zsa-fy-x", text: "✗"}) : h("span", {class: "zsa-fy-letter", text: "ABCD"[i]}));
        setText(button.querySelector(".zsa-sr-only"), right ? " (" + t("correct") + ")" : tried ? " (" + t("tried") + ")" : "");
      });
      const last = ans.tried.length ? ans.tried[ans.tried.length - 1] : null;
      feedback.hidden = last === null && !ans.correct;
      const anchor = ans.correct ? q.correct : last;
      if (anchor !== null && options.children[anchor]) options.insertBefore(feedback, options.children[anchor].nextSibling);
      if (!feedback.hidden) {
        const key = ans.correct ? q.options[q.correct] : q.options[last];
        feedback.className = "zsa-fy-feedback" + (ans.correct ? " zsa-fy-feedback--ok" : "");
        feedback.replaceChildren(ans.correct ? checkIcon() : warnIcon(), h("p", null, [h("strong", {text: t(ans.correct ? "correct" : "notQuite") + " "}), t(key + "Why")]));
      }
      finished.hidden = !done("check");
    }
    function answer(i) {
      const c = state.check, q = data.questions[c.index], ans = c.answers[c.index];
      if (ans.correct || ans.tried.indexOf(i) >= 0) return;
      ans.tried.push(i);
      if (i === q.correct) ans.correct = true;
      sync(); refresh();
      announce(t(ans.correct ? "correct" : "notQuite") + " " + t(q.options[i] + "Why"));
      if (ans.correct) pop(options.querySelectorAll(".zsa-fy-option")[i].querySelector(".zsa-fy-check"));
      if (ans.correct && done("check")) pop(finished);
      setTimeout(() => reveal(feedback), 30);
    }
    function next() {
      const c = state.check;
      if (c.index < data.questions.length - 1) {
        c.index += 1;
        sync(); refresh();
        prompt.focus({preventScroll: true});
        reveal(card);
      }
    }
    screens.check = Object.assign(shell, {sync, next, card, options});
  };

  // ---------- Copy my data ----------
  function record() {
    const a = state.a, b = state.b;
    const pred = (key, value) => (value ? t(key) : "");
    const avg = screens.b ? screens.b.averages() : model.DOSES.map((d, i) => model.average(b.changes.map(tr => tr[i])));
    return {
      predictions: [
        {question: t("predictionHookLabel"), answer: pred("predict" + cap(state.hook.prediction || "x"), state.hook.prediction)},
        {question: t("predictionALabel"), answer: a.prediction ? foodName(a.prediction) : ""},
        {question: t("predictionBLabel"), answer: pred("predict" + cap(b.prediction || "x"), b.prediction)}
      ],
      partA: a.bottles.map((bottle, i) => ({bottle: i + 1, food: foodName(bottle.food), temperature: bottle.temperature, yeast: bottle.yeast, amount: bottle.amount,
        start: a.start[i], end: a.end[i], change: a.start[i] !== null && a.end[i] !== null ? model.round1(a.end[i] - a.start[i]) : null})),
      partB: model.DOSES.map((dose, i) => ({dose, trials: [0, 1, 2].map(k => (b.changes[k] ? b.changes[k][i] : null)), average: b.changes.length === 3 ? avg[i] : null})),
      plateau: b.phase === "done" ? b.mark : null
    };
  }
  build.copy = function () {
    const shell = screenShell("copy", "copyEyebrow", "copyScreenTitle", "copyIntro");
    const preview = h("div", {class: "zsa-fy-card zsa-fy-preview", tabindex: "-1"});
    const status = h("p", {class: "zsa-fy-feedback", hidden: true});
    const startOver = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary", text: t("startOver")});
    let snapshot = null, timer = 0;
    const undo = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary", text: t("undo"), hidden: true});
    const resetNote = h("p", {class: "zsa-fy-reset-note", hidden: true, text: t("startOverDone")});
    startOver.addEventListener("click", function () {
      if (busy) stopRunning();
      snapshot = JSON.parse(JSON.stringify({hook: state.hook, a: state.a, b: state.b, zoom: state.zoom, check: state.check, copied: state.copied}));
      Object.assign(state, {hook: freshHook(), a: freshA(), b: freshB(), zoom: freshZoom(), check: freshCheck(), copied: false});
      rebuild();
      undo.hidden = false; resetNote.hidden = false;
      announce(t("startOverDone"));
      clearTimeout(timer);
      timer = setTimeout(() => { undo.hidden = true; resetNote.hidden = true; snapshot = null; }, 20000);
    });
    undo.addEventListener("click", function () {
      if (!snapshot) return;
      Object.assign(state, snapshot);
      snapshot = null;
      rebuild();
      undo.hidden = true; resetNote.hidden = true;
      startOver.focus();
    });
    shell.section.appendChild(preview);
    shell.section.appendChild(status);
    shell.section.appendChild(h("div", {class: "zsa-fy-reset zsa-fy-reset--end"}, [startOver, resetNote, undo]));
    let tableId = 0;
    function miniTable(caption, headers, rows, numeric) {
      const id = "zsa-fy-copy-table-" + (++tableId);
      return h("div", {class: "zsa-fy-copy-block"}, [h("h3", {class: "zsa-fy-h3", id, text: caption}), h("div", {class: "zsa-fy-table-wrap"}, h("table", {class: "zsa-fy-table" + (numeric ? " zsa-fy-table--numbers" : ""), "aria-labelledby": id}, [
        h("thead", null, h("tr", null, headers.map(x => h("th", {scope: "col", text: x})))),
        h("tbody", null, rows.map(r => h("tr", null, r.map((c, j) => h(j === 0 ? "th" : "td", j === 0 ? {scope: "row", text: c} : {text: c})))))]))]);
    }
    function sync() {
      tableId = 0;
      const r = record(), n = v => (typeof v === "number" ? fmt(v) : "");
      preview.replaceChildren(
        h("h3", {class: "zsa-fy-h3", text: t("previewPredictions")}),
        h("dl", {class: "zsa-fy-preds"}, r.predictions.flatMap(p => [h("dt", {text: p.question}), h("dd", {text: p.answer || t("copyNotAnswered")})])),
        miniTable(t("copyPartA"), [t("colBottle"), t("colFood"), t("colWater"), t("colYeast"), t("colFoodAmount"), t("colStart"), t("colEnd"), t("colChange")],
          r.partA.map(x => [String(x.bottle), x.food, String(x.temperature), String(x.yeast), String(x.amount), n(x.start), n(x.end), n(x.change)])),
        miniTable(t("copyPartB"), [t("colGlucose"), t("colTrial", {number: 1}), t("colTrial", {number: 2}), t("colTrial", {number: 3}), t("colAverage")],
          r.partB.map(x => [String(x.dose), n(x.trials[0]), n(x.trials[1]), n(x.trials[2]), n(x.average)]), true),
        h("h3", {class: "zsa-fy-h3", text: t("copyPlateau")}),
        h("p", {text: Number.isFinite(r.plateau) ? t("copyPlateauValue", {dose: r.plateau}) : t("copyNotAnswered")}),
        h("h3", {class: "zsa-fy-h3", text: t("previewStarters")}),
        h("ol", {class: "zsa-fy-starters"}, ["starter1", "starter2", "starter3"].map(k => h("li", {text: t(k)})))
      );
    }
    async function copy() {
      const text = model.copyText(record(), t);
      status.hidden = false;
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("no clipboard");
        await navigator.clipboard.writeText(text);
        state.copied = true;
        status.className = "zsa-fy-feedback zsa-fy-feedback--ok";
        status.replaceChildren(checkIcon(), h("span", {text: t("copied")}));
        announce(t("copied"));
        pop(status);
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(preview);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        state.copied = true;
        status.className = "zsa-fy-feedback";
        status.replaceChildren(h("span", {text: t("copySelected")}));
        announce(t("copySelected"));
      }
      refresh();
    }
    screens.copy = Object.assign(shell, {sync, copy, preview});
  };
  function rebuild() {
    animators.clear();
    busy = false;
    Object.keys(screens).forEach(function (key) { screens[key].section.remove(); delete screens[key]; });
    go(state.screen, false);
    screens[state.screen].heading.focus({preventScroll: true});
  }

  // ---------- What the guide bar says on each screen ----------
  const guides = {
    hook() {
      const hk = state.hook, scr = screens.hook;
      if (hk.playing) return {text: t("hookBefore"), action: {label: t("hookWatch"), busy: true}};
      if (!hk.played) return {text: t("guideHookWatch"), action: {label: t("hookWatch"), run: playHook}, target: scr.card};
      if (!hk.prediction) return {text: t("guideHookPredict"), target: scr.choices.fieldset};
      if (!hk.prediction) return {text: t("guideHookPredict"), target: scr.choices.fieldset};
      return {text: t("guideHookDone"), action: {label: t("nextA"), run: () => go("a", true)}};
    },
    a() {
      const st = state.a, scr = screens.a;
      switch (st.phase) {
        case "predict": return {text: t("guideAPredict"), target: scr.predict.fieldset};
        case "setup": return {text: st.checked && st.issues.length ? t("guideAFix") : t("guideASetup"), action: {label: t("checkSetup"), run: scr.checkSetup}, target: scr.setupCard};
        case "measureStart": return {text: t("guideMeasureStart", {done: st.start.filter(v => v !== null).length}), action: {label: t("measureNext"), run: () => scr.measure(scr.nextUnmeasured())}, target: scr.benchCard};
        case "ready": return {text: t("guideFastForward"), action: {label: t("fastForward"), run: scr.fastForward}, target: scr.benchCard};
        case "running": return {text: t("guideRunning", {minutes: Math.round(st.minutes)}), action: {label: t("fastForward"), busy: true}};
        case "measureEnd": return {text: t("guideMeasureEnd", {done: st.end.filter(v => v !== null).length}), action: {label: t("measureNext"), run: () => scr.measure(scr.nextUnmeasured())}, target: scr.benchCard};
        case "graph": return {text: t("guideGraphA", {done: st.plot.filter((v, i) => model.plotMatches(v, st.end[i] !== null ? model.round1(st.end[i] - st.start[i]) : null)).length}), target: scr.graphCard};
        default: return {text: t("guideADone"), action: {label: t("nextB"), run: () => go("b", true)}};
      }
    },
    b() {
      const st = state.b, scr = screens.b, n = st.trial + 1;
      switch (st.phase) {
        case "predict": return {text: t("guideBPredict"), target: scr.predict.fieldset};
        case "measureStart": return {text: t("guideBStart", {number: n}), action: {label: t("measureAllStart"), run: scr.measureAll, busy}, target: scr.benchCard};
        case "ready": return {text: t("guideBRun", {number: n}), action: {label: t("fastForward"), run: scr.fastForward}, target: scr.benchCard};
        case "running": return {text: t("guideRunning", {minutes: Math.round(st.minutes)}), action: {label: t("fastForward"), busy: true}};
        case "measureEnd": return {text: t("guideBEnd", {number: n}), action: {label: t("measureAllEnd"), run: scr.measureAll, busy}, target: scr.benchCard};
        case "between": return {text: t("guideBNext", {number: st.trial}), action: {label: t("startTrial", {number: st.trial + 1}), run: scr.nextTrial, busy}};
        case "graph": return {text: t("guideGraphB", {done: st.plot.filter((v, i) => model.plotMatches(v, scr.averages()[i])).length}), target: scr.graphCard};
        case "mark": return {text: t("guideMark"), action: {label: t("markCheck"), run: scr.checkMark}, target: scr.graphCard};
        default: return {text: t("guideBDone"), action: {label: t("nextZoom"), run: () => go("zoom", true)}};
      }
    },
    zoom() {
      const zz = state.zoom, scr = screens.zoom;
      if (done("zoom")) return {text: zz.others ? t("guideZoomDone") : t("guideZoomFoods"), action: {label: t("nextCheck"), run: () => go("check", true)}};
      const text = busy ? t("guideZoomBusy") : !zz.fermented ? t("guideZoomFeed") : t("guideZoomOxygen");
      return {text, action: {label: t("feed"), run: scr.feed, busy}, target: !zz.fermented ? scr.sceneCard : zz.oxygen ? scr.sceneCard : scr.oxygen.fieldset};
    },
    check() {
      const c = state.check, ans = c.answers[c.index], scr = screens.check;
      if (done("check")) return {text: t("guideCheckDone"), action: {label: t("nextCopy"), run: () => go("copy", true)}};
      if (ans.correct) return {text: t("guideCheckNext"), action: {label: t("nextQuestion"), run: scr.next}};
      return {text: t(ans.tried.length ? "guideCheckRetry" : "guideCheck"), target: scr.options};
    },
    copy() {
      const scr = screens.copy;
      return {text: t(state.copied ? "guideCopied" : "guideCopy"), action: {label: t("copyButton"), run: scr.copy}};
    }
  };

  // ---------- First-run tour (shown on every fresh visit: the house rules forbid storage) ----------
  const tour = h("aside", {class: "zsa-fy-tour", "aria-label": t("tourLabel")});
  const tourCount = h("p", {class: "zsa-fy-tour-count"});
  const tourText = h("p", {class: "zsa-fy-tour-text"});
  const tourSkip = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--ghost", text: t("tourSkip")});
  const tourNext = h("button", {type: "button", class: "zsa-fy-btn zsa-fy-btn--small zsa-fy-btn--secondary"});
  add(tour, [h("span", {class: "zsa-fy-tour-arrow", "aria-hidden": "true"}), tourCount, tourText, h("div", {class: "zsa-fy-row"}, [tourSkip, tourNext])]);
  let tourTarget = null;
  function placeTour() {
    if (tourTarget) tourTarget.classList.remove("zsa-fy-tour-target");
    if (!state.tour) { tour.remove(); tourTarget = null; return; }
    const n = state.tour;
    setText(tourCount, t("tourCount", {number: n}));
    setText(tourText, t("tour" + n));
    setText(tourNext, t(n === 3 ? "tourDone" : "tourNext"));
    tourSkip.hidden = n === 3;
    tour.className = "zsa-fy-tour zsa-fy-tour--" + n;
    if (n === 1) { $("stage").insertBefore(tour, $("screens")); tourTarget = root.querySelector(".zsa-fy-progress"); }
    if (n === 2) { $("guide").insertBefore(tour, $("guide").firstChild); tourTarget = $("guide"); }
    if (n === 3) { root.querySelector("[data-zsa-header]").after(tour); tourTarget = opener; }
    tourTarget.classList.add("zsa-fy-tour-target");
  }
  tourNext.addEventListener("click", function () {
    state.tour = state.tour >= 3 ? 0 : state.tour + 1;
    placeTour();
    if (state.tour) tourNext.focus(); else action.hidden ? screens[state.screen].heading.focus() : action.focus();
  });
  tourSkip.addEventListener("click", function () {
    state.tour = 0;
    placeTour();
    action.hidden ? screens[state.screen].heading.focus() : action.focus();
  });

  // ---------- Start ----------
  guideText.setAttribute("tabindex", "-1");
  state.tour = params.get("tour") === "0" || root.classList.contains("zsa--embedded") ? 0 : 1;
  go("hook", false);
  placeTour();
}());
