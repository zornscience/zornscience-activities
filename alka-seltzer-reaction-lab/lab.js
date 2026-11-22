(function () {
  "use strict";

  const root = document.querySelector(".zsa-as");
  const $ = (id) => document.getElementById(id);
  function request(name) {
    let value;
    root.dispatchEvent(new CustomEvent(name, {detail: (result) => { value = result; }}));
    return value;
  }
  const model = request("zsa:alka-model");
  const {settings, sample} = model;
  const createBench = request("zsa:alka-bench");
  const draw = createBench($("beaker"), model);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const i18n = (() => {
    let api;
    root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive(value) { api = value; }}}));
    return api;
  })();
  const t = i18n.text;
  const dialogs = Array.from(root.querySelectorAll("dialog"));
  const formNames = {
    whole: "Whole tablet",
    quarters: "Quartered tablet (all 4 pieces)",
    powder: "Crushed powder"
  };
  const forms = Object.keys(formNames);
  const prepareActions = {quarters: "Split into 4 pieces", powder: "Crush with spatula"};
  const prepareCues = {
    quarters: "Record the starting BTB color. Then split the tablet.",
    powder: "Record the starting BTB color. Then crush the tablet."
  };
  const onPaperNames = {
    whole: "Whole tablet on paper",
    quarters: "4 pieces on paper",
    powder: "Powder on paper"
  };
  const wetNames = {whole: "Tablet visible", quarters: "Pieces visible", powder: "Powder specks visible"};
  const actions = {
    empty: ["Add 50 mL water", "Make your prediction on your worksheet. Then prepare the beaker."],
    filling: ["Adding water…", "Watch the water reach the 50 mL mark."],
    water: ["Add BTB", "Add the indicator to the water."],
    dosing: ["Adding BTB…", "Watch the drops reach the water."],
    preparing: ["Preparing tablet…", "Prepare one tablet on the paper."],
    ready: ["Drop tablet and start timer", "Record the starting BTB color before you drop the tablet."],
    dropping: ["Dropping tablet…", "The timer starts when the tablet touches the water."],
    running: ["", "A partner stirs gently with a glass rod. Stop when the last solid disappears."],
    stopped: ["", "Record your time and final BTB color."]
  };
  const nextPhase = {filling: "water", dosing: "ready", preparing: "ready", dropping: "running"};
  const timedForms = new Set();
  let form = "whole";
  let phase = "empty";
  let prepared = true;
  let elapsed = 0;
  let startedAt = null;
  let interrupted = false;
  let frame = 0;
  let previous = {};
  let sceneKey = "";

  // The shared toggle sets the URL and language in place. Keep the original English
  // labels so the same nodes can be translated again without replacing controls.
  const dynamic = new Set(["tablet-form", "dose", "seconds", "clock-state", "action", "cue", "liquid", "solid", "bubbles", "observation-status", "share-status"]);
  const chrome = [root.querySelector("header"), ...dialogs, $("resume"), $("stop"), $("picker"),
    $("resume-early"), $("rinse"), $("repeat"), $("worksheet"), ...root.querySelectorAll(".zsa-as-clock p, .zsa-as-evidence, footer")];
  const staticText = [];
  const staticLabels = [];
  const labelAttributes = ["aria-label", "title", "alt"];
  for (const section of chrome) {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim() && !dynamic.has(node.parentElement.id)) {
        staticText.push([node, node.textContent]);
      }
    }
    for (const element of [section, ...section.querySelectorAll("[aria-label], [title], [alt]")]) {
      for (const attribute of labelAttributes) {
        if (element.hasAttribute(attribute)) staticLabels.push([element, attribute, element.getAttribute(attribute)]);
      }
    }
  }
  i18n.configure(request("zsa:alka-copy"));

  function write(id, value) {
    const node = $(id);
    if (node.textContent !== value) node.textContent = value;
  }

  function setPhase(next, now = null) {
    phase = next;
    elapsed = 0;
    startedAt = now;
  }

  function timeAt(now) {
    return startedAt === null ? elapsed : elapsed + Math.max(0, now - startedAt);
  }

  function requestFrame() {
    if (startedAt !== null && !frame) frame = requestAnimationFrame(update);
  }

  function advance(now) {
    const length = {
      filling: settings.fillTime,
      dosing: settings.drops * settings.dropInterval,
      preparing: settings.prepareTime[form],
      dropping: settings.transferTime
    }[phase];
    const activeTime = timeAt(now);
    if (length !== undefined && activeTime >= length) {
      if (phase === "preparing") prepared = true;
      const next = nextPhase[phase];
      // Preserve the time of contact even when the next animation frame is late.
      setPhase(next, next === "running" ? now - (activeTime - length) : null);
    }
  }

  function update() {
    frame = 0;
    const now = performance.now();
    if (document.hidden || dialogs.some((dialog) => dialog.open)) {
      interrupt(now);
      return;
    }
    const focusStop = phase === "dropping" && document.activeElement === $("action");
    advance(now);
    render(now);
    if (focusStop && phase === "running") $("stop").focus({preventScroll: true});
    requestFrame();
  }

  function scene(now, wet, observation, drops) {
    const reduced = motion.matches;
    const time = timeAt(now);
    const dosing = phase === "dosing";
    const filled = phase !== "empty" && phase !== "filling";
    const level = filled ? 1 : phase === "filling" && !reduced ? time / settings.fillTime : 0;
    const indicator = settings.clear.map((channel, i) => Math.round(channel + (settings.blue[i] - channel) * drops / settings.drops));
    const view = {
      form, wet, level, reduced, dosing, drops,
      rgb: observation?.rgb || indicator,
      onPaper: !wet && (phase !== "dropping" || reduced),
      paperForm: prepared ? form : "whole",
      preparation: phase === "preparing" && !reduced ? time / settings.prepareTime[form] : null,
      dropFraction: dosing && !reduced ? (time % settings.dropInterval) / settings.dropInterval : 0,
      transfer: phase === "dropping" && !reduced ? time / settings.transferTime : null,
      elapsed: wet && !reduced ? time : 0,
      fizz: observation?.fizz || 0,
      pieces: observation?.pieces
    };
    // At reduced motion, draw only when a static observation changes.
    const key = JSON.stringify(reduced && wet ? {
      ...view, fizz: Math.ceil(view.fizz * 38), pieces: view.pieces.map((part) => Math.ceil(part * 16))
    } : view);
    if (key !== sceneKey) {
      draw(view);
      sceneKey = key;
    }
  }

  function render(now = performance.now()) {
    const time = timeAt(now);
    const wet = phase === "running" || phase === "stopped";
    const observation = wet ? sample(form, time) : null;
    const dosing = phase === "dosing";
    const drops = dosing ? Math.min(settings.drops, Math.floor(time / settings.dropInterval)) : settings.drops;
    const doseVisible = dosing || ["ready", "preparing", "dropping"].includes(phase) || wet;
    const empty = phase === "empty" || phase === "filling" && motion.matches;
    const liquid = observation?.color || (empty ? "Empty" : phase === "filling" ? "Filling with water"
      : doseVisible && drops > 0 ? "Light blue" : "Clear");
    const solid = wet ? (observation.solid ? wetNames[form] : "No solid visible")
      : phase === "dropping" && !motion.matches ? "Sample in transfer" : onPaperNames[prepared ? form : "whole"];
    const bubbles = observation?.bubbles || "None visible";

    scene(now, wet, observation, doseVisible ? drops : 0);
    write("tablet-form", t(formNames[form]));
    write("dose", t("BTB drops {count}/{total}", {count: drops, total: settings.drops}));
    write("seconds", (Math.floor((wet ? time : 0) / 100) / 10).toFixed(1));
    write("clock-state", t(interrupted ? "Paused" : phase === "running" ? "Timing" : phase === "stopped" ? "Stopped" : "Ready"));
    write("liquid", t(liquid));
    write("solid", t(solid));
    write("bubbles", t(bubbles));

    let [action, cue] = actions[phase];
    if (phase === "ready" && !prepared) [action, cue] = [prepareActions[form], prepareCues[form]];
    if (phase === "ready" && prepared && form !== "whole") cue = "Transfer the entire sample into the water.";
    if (phase === "empty" && timedForms.size) cue = "Fill the rinsed beaker with fresh water.";
    if (interrupted) cue = "Resume to continue from the same instant.";
    write("action", t(action));
    write("cue", t(cue));
    const done = timedForms.size === forms.length;
    const phaseChanged = phase !== previous.phase || interrupted !== previous.interrupted;
    const changes = [];
    if (phaseChanged) {
      $("dose").hidden = !doseVisible;
      $("action").hidden = wet || interrupted;
      $("action").setAttribute("aria-disabled", String(startedAt !== null));
      $("stop").hidden = !wet || interrupted;
      $("stop").setAttribute("aria-disabled", String(phase !== "running"));
      $("resume").hidden = !interrupted;
      $("after-stop").hidden = phase !== "stopped";
      $("resume-early").hidden = !observation?.solid;
      $("picker").hidden = !(done && phase === "empty");
      $("worksheet").hidden = !done;
      $("worksheet-link").hidden = !(done && phase === "stopped");
      changes.push(t(cue));
    }
    if (solid !== previous.solid) changes.push(t(solid));
    if (liquid !== previous.liquid) changes.push(t("Liquid: {color}.", {color: t(liquid)}));
    if (bubbles !== previous.bubbles) changes.push(t("Bubbles: {state}.", {state: t(bubbles)}));
    if (done && !previous.done) changes.push(t("The graph and discussion are on your worksheet."));
    if (changes.length) write("observation-status", changes.join(" "));
    previous = {phase, interrupted, solid, liquid, bubbles, done};
  }

  function interrupt(now = performance.now()) {
    if (startedAt === null) return;
    advance(now);
    if (startedAt !== null) {
      elapsed = timeAt(now);
      startedAt = null;
      interrupted = true;
    }
    cancelAnimationFrame(frame);
    frame = 0;
    render(now);
  }

  $("action").addEventListener("click", () => {
    if (startedAt !== null || interrupted) return;
    const next = {empty: "filling", water: "dosing", ready: prepared ? "dropping" : "preparing"}[phase];
    if (!next) return;
    setPhase(next, performance.now());
    render();
    requestFrame();
  });

  $("stop").addEventListener("click", (event) => {
    if (phase !== "running" || interrupted || event.detail > 1) return;
    elapsed = timeAt(performance.now());
    startedAt = null;
    phase = "stopped";
    timedForms.add(form);
    cancelAnimationFrame(frame);
    frame = 0;
    render();
  });

  function resume(event) {
    if ((!interrupted && phase !== "stopped") || document.hidden || dialogs.some((dialog) => dialog.open)) return;
    if (phase === "stopped") phase = "running";
    interrupted = false;
    startedAt = performance.now();
    const moveFocus = document.activeElement === event.currentTarget;
    render(startedAt);
    if (moveFocus) (phase === "running" ? $("stop") : $("action")).focus({preventScroll: true});
    requestFrame();
  }

  function selectForm(next) {
    form = next;
    $("form").value = form;
    prepared = form === "whole";
  }

  $("resume").addEventListener("click", resume);
  $("resume-early").addEventListener("click", resume);
  for (const id of ["rinse", "repeat"]) {
    $(id).addEventListener("click", () => {
      if (phase !== "stopped") return;
      const next = id === "rinse" && timedForms.size < forms.length ? forms[forms.indexOf(form) + 1] : form;
      selectForm(next);
      setPhase("empty");
      render();
      (id === "rinse" && !$("picker").hidden ? $("form") : $("action")).focus({preventScroll: true});
    });
  }
  $("form").addEventListener("change", () => {
    if (phase !== "empty") return;
    selectForm($("form").value);
    render();
  });
  root.querySelector(".zsa-as-instruments").addEventListener("keydown", (event) => {
    if (event.repeat && event.target.matches("button") && (event.key === "Enter" || event.key === " ")) event.preventDefault();
  });
  for (const dialog of dialogs) dialog.addEventListener("focusin", () => interrupt());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) interrupt();
  });
  motion.addEventListener("change", () => render());

  const activityURL = "https://activities.zornscience.org/alka-seltzer-reaction-lab/";
  function updateLinks() {
    const spanish = i18n.lang === "es";
    const fallback = "https://zornscience.org" + (spanish ? "/es" : "") + "/science/biology/";
    const from = new URLSearchParams(location.search).get("from");
    try {
      const url = new URL(from);
      const path = url.pathname.replace(/^\/es(?=\/)/, "");
      const validPath = /^\/(science\/biology|teaching\/physical-labs)\//.test(path);
      $("back").href = url.origin === "https://zornscience.org" && validPath && !url.username && !url.password
        ? new URL((spanish ? "/es" : "") + path + url.search + url.hash, url.origin).href : fallback;
    } catch {
      $("back").href = fallback;
    }
    const share = i18n.url(activityURL);
    $("share-url").value = share;
    $("share-email").href = "mailto:?subject=" + encodeURIComponent(document.title) + "&body=" + encodeURIComponent(share);
  }

  $("share-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("share-url").value);
      write("share-status", t("Link copied."));
    } catch {
      $("share-url").focus();
      $("share-url").select();
      write("share-status", t("Link selected. Copy it with Ctrl+C or Command+C."));
    }
  });
  $("zsa-header-share").addEventListener("close", () => write("share-status", ""));
  i18n.onChange = () => {
    for (const [node, source] of staticText) node.textContent = source.replace(source.trim(), t(source.trim()));
    for (const [element, attribute, source] of staticLabels) element.setAttribute(attribute, t(source));
    write("observation-status", "");
    updateLinks();
    render();
  };

  updateLinks();
  render();
}());
