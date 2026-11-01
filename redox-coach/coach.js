// Student interface. Rendering uses DOM nodes and text, with no HTML injection.
(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="redox-coach"]');
  if (!root) return;
  let M;
  root.dispatchEvent(new CustomEvent("zsa-rx:request-model", {detail: {receive(api) { M = api; }}}));
  if (!M) return;
  const t = M.t;
  const $ = id => document.getElementById("zsa-rx-" + id);
  const TITLES = ["Split into half-reactions", "Mass balance: O and H", "Charge balance: electrons", "Equalize electrons", "Combine and cancel", "Basic media adjustment"];
  const INSTRUCTIONS = [
    "Select a species, then choose its destination. You can also drag it into a box. Select a placed species to move it.",
    "Balance oxygen with H₂O, then hydrogen with H⁺. Each click adds one molecule or ion. Use Undo for extra additions.",
    "Add electrons to balance the total charge in each half-reaction. Each electron contributes −1.",
    "Multiply each ENTIRE half-reaction by a positive whole number so both transfer the same number of electrons.",
    "Select the same species on opposite sides to cancel the shared amount. Every electron must disappear.",
    "Neutralize H⁺ with OH⁻, form water, then cancel excess water."
  ];
  // Labels for each half-reaction and side. Each is one full phrase, so Spanish keeps its own word order.
  const LABELS = {
    oxidation: {left: "oxidation reactants", right: "oxidation products", Left: "Oxidation reactants", Right: "Oxidation products",
      title: "Oxidation Half-Reaction", multiplier: "Oxidation multiplier", preview: "Oxidation multiplied preview",
      place: {left: "Place selected species in oxidation reactants", right: "Place selected species in oxidation products"},
      placed: {left: "Species placed in oxidation reactants.", right: "Species placed in oxidation products."}},
    reduction: {left: "reduction reactants", right: "reduction products", Left: "Reduction reactants", Right: "Reduction products",
      title: "Reduction Half-Reaction", multiplier: "Reduction multiplier", preview: "Reduction multiplied preview",
      place: {left: "Place selected species in reduction reactants", right: "Place selected species in reduction products"},
      placed: {left: "Species placed in reduction reactants.", right: "Species placed in reduction products."}}
  };
  // Fills node with a translated sentence, putting the element child where the placeholder key is.
  function slot(node, text, key, child) {
    const parts = text.split(key);
    if (parts[0]) node.append(parts[0]);
    node.append(child);
    if (parts[1]) node.append(parts[1]);
    return node;
  }
  let s, history = [];

  // Tiny DOM builder: strings are always text, never interpreted as markup.
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value === null || value === undefined) return;
      node.setAttribute(key, value === true ? "" : String(value));
    });
    children.flat(Infinity).forEach(child => { if (child !== null && child !== undefined) node.append(child); });
    return node;
  }
  function button(text, action, attrs = {}) {
    const node = el("button", {type: "button", class: "zsa-btn", ...attrs}, text);
    node.addEventListener("click", action);
    return node;
  }
  function formula(f) {
    const item = s.catalog[f], node = el("span", {class: "zsa-rx-formula"});
    item.core.split(/(\d+)/).filter(Boolean).forEach(part => node.append(/^\d+$/.test(part) ? el("sub", {}, part) : part));
    if (item.charge) node.append(el("sup", {}, (Math.abs(item.charge) === 1 ? "" : Math.abs(item.charge)) + (item.charge > 0 ? "+" : "−")));
    return node;
  }
  function term(f, n, interactive, side) {
    const attrs = {class: "zsa-rx-token"};
    let node;
    if (interactive) {
      const key = "term-" + side + "-" + f;
      node = button([], () => {
        const before = M.clone(s), result = M.select(s, side, f);
        if (result.changed) history.push(before);
        render(key);
        say(result.message, result.ok);
      }, {...attrs, "data-key": key, "aria-label": t(side === "left" ? "{n} {formula} on left" : "{n} {formula} on right", {n, formula: f}),
        "aria-pressed": String(s.selected?.side === side && s.selected?.f === f)});
    } else node = el("span", attrs);
    node.append(n === 1 ? "" : n + " ", formula(f));
    return node;
  }
  function terms(side, interactive, sideName) {
    const node = el("div", {class: "zsa-rx-tokens"});
    Object.entries(side).forEach(([f, n], i) => {
      if (i) node.append(el("span", {"aria-hidden": "true"}, "+"));
      node.append(term(f, n, interactive, sideName));
    });
    if (!Object.keys(side).length) node.append(t("No species"));
    return node;
  }
  function equation(eq, interactive = false) {
    const node = el("div", {class: "zsa-rx-equation"});
    ["left", "right"].forEach((side, i) => {
      if (i) node.append(el("div", {class: "zsa-rx-arrow", "aria-label": t("yields")}, "→"));
      node.append(el("div", {class: "zsa-rx-side"},
        el("span", {class: "zsa-rx-side-title"}, t(side === "left" ? "Reactants" : "Products")), terms(eq[side], interactive, side)));
    });
    return node;
  }
  function say(message, ok = false, target) {
    $("feedback").textContent = message;
    $("feedback").classList.toggle("zsa-rx-ok", ok);
    if (message && !ok) {
      const node = target || $("stage");
      node.classList.remove("zsa-rx-shake");
      void node.offsetWidth;
      node.classList.add("zsa-rx-shake");
    }
  }
  // Restore focus after replacing a phase's controls. If a cancelled token no
  // longer exists, Check Answer is the next useful keyboard destination.
  function restore(key) {
    if (!key) return;
    const found = [...root.querySelectorAll("[data-key]")].find(node => node.dataset.key === key && !node.disabled);
    (found || $("check")).focus();
  }
  function edit(action, key) {
    const before = M.clone(s);
    if (action() === false) return;
    history.push(before); s.cancelled = null;
    render(key); say("");
  }

  function start(index, focus = false) {
    s = M.create(index); history = [];
    $("problem").value = String(index);
    $("medium").textContent = t(s.problem.media === "basic" ? "Basic medium" : "Acidic medium");
    $("net").replaceChildren();
    [s.problem.reactants, s.problem.products].forEach((items, side) => {
      if (side) $("net").append(el("span", {"aria-label": t("yields")}, " → "));
      items.forEach((item, i) => {
        if (i) $("net").append(" + ");
        $("net").append(formula(item.formula));
      });
    });
    render(); say("");
    if (focus) $("title").focus();
  }
  function render(key) {
    const limit = s.problem.media === "basic" ? 6 : 5;
    $("progress").replaceChildren(...TITLES.slice(0, limit).map((title, i) =>
      el("li", {class: i + 1 < s.phase ? "zsa-rx-done" : "", "aria-current": i + 1 === s.phase ? "step" : null,
        "aria-label": t(i + 1 < s.phase ? "{number}. {title}, completed and locked" : i + 1 > s.phase ? "{number}. {title}, locked" : "{number}. {title}, current", {number: i + 1, title: t(title)})},
      (i + 1 < s.phase ? "✓ " : (i + 1) + " "), el("span", {}, t(title)))));
    $("title").textContent = s.phase === 7 ? t("Success! You balanced the reaction.") : t("Step {number}: {title}", {number: s.phase, title: t(TITLES[s.phase - 1])});
    $("instruction").textContent = t(s.phase === 7 ? "Atoms and charge are conserved. Every electron has been cancelled." : INSTRUCTIONS[s.phase - 1]);
    $("work").classList.toggle("zsa-rx-success", s.phase === 7);
    $("undo").disabled = !history.length;
    $("check").hidden = s.phase === 7;
    $("stage").replaceChildren();
    if (s.phase === 1) split();
    else if (s.phase <= 4) halves();
    else if (s.phase <= 6) combined();
    else {
      const eq = M.normalize(s.combined);
      $("stage").append(equation(eq), el("p", {class: "zsa-rx-hint"},
        t(s.problem.media === "basic" ? "Smallest whole-number ratio. Total charge: {charge} on both sides. No H⁺ remains in this basic equation."
          : "Smallest whole-number ratio. Total charge: {charge} on both sides. You completed the half-reaction method.", {charge: M.totals(eq.left, s.catalog).charge})));
    }
    restore(key);
  }

  function split() {
    const bank = el("div", {class: "zsa-rx-tokens", role: "group", "aria-label": t("Unassigned species")});
    const containers = {};
    $("stage").append(el("p", {class: "zsa-rx-hint"}, t("Oxidation loses electrons; reduction gains electrons.")), bank);
    s.pairs.forEach((pair, half) => {
      const eq = el("div", {class: "zsa-rx-equation"});
      ["left", "right"].forEach((side, i) => {
        if (i) eq.append(el("div", {class: "zsa-rx-arrow"}, "→"));
        const labels = LABELS[pair.type], label = t(labels[side]);
        function place(id) {
          const before = M.clone(s), message = M.assign(s, id, half, side);
          if (message) return say(message);
          history.push(before); render("drop-" + half + "-" + side); say(t(labels.placed[side]), true);
        }
        const drop = button(t(side === "left" ? "Reactants" : "Products"), () => place(s.selected),
          {class: "zsa-rx-drop", "data-key": "drop-" + half + "-" + side, "aria-label": t(labels.place[side])});
        drop.addEventListener("dragover", event => event.preventDefault());
        drop.addEventListener("drop", event => {
          event.preventDefault(); const raw = event.dataTransfer.getData("text/plain");
          if (/^\d+$/.test(raw)) place(Number(raw));
        });
        const tokens = el("div", {class: "zsa-rx-tokens"});
        containers[half + ":" + side] = tokens;
        eq.append(el("div", {class: "zsa-rx-side", role: "group", "aria-label": label}, drop, tokens));
      });
      $("stage").append(el("div", {class: "zsa-rx-half", id: "zsa-rx-half-" + half}, el("h3", {}, t(LABELS[pair.type].title)), eq));
    });
    s.pieces.forEach((piece, id) => {
      const assignment = s.assigned[id], key = "piece-" + id;
      const node = button(formula(piece.f), () => {
        s.selected = s.selected === id ? null : id;
        render(key); say(s.selected === null ? t("Selection cleared.") : t("{formula} selected. Choose a destination.", {formula: piece.f}), true);
      }, {class: "zsa-rx-token", draggable: "true", "data-key": key,
        "aria-pressed": String(s.selected === id), "aria-label": t(piece.side === "left" ? "Select {formula} reactant" : "Select {formula} product", {formula: piece.f})});
      node.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", String(id)); event.dataTransfer.effectAllowed = "move";
      });
      (assignment ? containers[assignment.half + ":" + assignment.side] : bank).append(node);
    });
    if (!bank.childElementCount) bank.append(t("All species placed. Check your half-reactions."));
  }

  function halves() {
    s.halves.forEach((eq, i) => {
      const labels = LABELS[s.pairs[i].type], card = el("div", {class: "zsa-rx-half", id: "zsa-rx-half-" + i}, el("h3", {}, t(labels.title)), equation(eq));
      if (s.phase < 4) {
        const tools = el("div", {class: "zsa-rx-equation"});
        ["left", "right"].forEach((side, j) => {
          if (j) tools.append(el("div"));
          const total = M.totals(eq[side], s.catalog), part = el("div", {role: "group", "aria-label": t(side === "left" ? labels.Left : labels.Right)});
          if (s.phase === 3) part.append(slot(el("p", {class: "zsa-rx-charge"}), t("Total charge: {charge}"), "{charge}", el("strong", {}, (total.charge > 0 ? "+" : "") + total.charge)));
          else part.append(el("p", {class: "zsa-rx-counts"}, t("Atoms: {counts}", {counts: Object.entries(total.atoms).map(([e, n]) => e + " " + n).join(", ")})));
          const buttons = el("div", {class: "zsa-rx-tools"});
          (s.phase === 2 ? ["H2O", "H+"] : ["e-"]).forEach(f => {
            const key = "add-" + i + "-" + side + "-" + f;
            buttons.append(slot(button([], () => edit(() => M.addHelper(s, i, side, f), key), {"data-key": key, "aria-label": t("Add {formula}", {formula: f})}), t("Add {formula}"), "{formula}", formula(f)));
          });
          part.append(buttons); tools.append(part);
        });
        card.append(tools);
      } else {
        const input = el("input", {id: "zsa-rx-mult-" + i, type: "number", min: "1", max: "10000", step: "1", inputmode: "numeric", "aria-label": t(labels.multiplier)});
        input.value = s.multipliers[i];
        const preview = el("div", {"aria-label": t(labels.preview)});
        function showPreview() { preview.replaceChildren(M.validMultiplier(s.multipliers[i]) ? equation(M.scale(eq, Number(s.multipliers[i]))) : el("p", {}, t("Enter a positive whole number."))); }
        input.addEventListener("input", () => {
          history.push(M.clone(s)); s.multipliers[i] = input.value; $("undo").disabled = false; showPreview(); say("");
        });
        card.append(slot(el("label", {class: "zsa-rx-multiplier", for: input.id}), t("Multiply entire reaction by {multiplier}"), "{multiplier}", input), preview);
        showPreview();
      }
      $("stage").append(card);
    });
  }

  function combined() {
    const basic = s.phase === 6, stage = s.basicStage;
    if (basic) $("instruction").textContent = stage === "add"
      ? t("Add {n} OH⁻ to EACH side, then check. This preserves charge.", {n: s.required})
      : t(stage === "merge" ? "Select H⁺ and OH⁻ on the SAME side to form H₂O, then check."
        : "Cancel excess water across the arrow, then check the final equation.");
    $("stage").append(el("div", {class: "zsa-rx-half"}, equation(s.combined, true)));
    if (s.cancelled) $("stage").append(el("div", {class: "zsa-rx-cancelled", "aria-hidden": "true"},
      el("s", {}, s.cancelled.n + " ", formula(s.cancelled.f)), " → ", el("s", {}, s.cancelled.n + " ", formula(s.cancelled.f))));
    const bar = el("div", {class: "zsa-rx-toolbar"});
    if (!basic || stage === "cancel") bar.append(button(t(s.cancel ? "Cancel mode: ON" : "Cancel mode: OFF"), () => {
      s.cancel = !s.cancel; s.selected = null; s.cancelled = null; render("cancel");
    }, {"aria-pressed": String(s.cancel), "data-key": "cancel"}));
    else if (stage === "add") ["left", "right"].forEach(side => {
      const key = "oh-" + side;
      bar.append(button(t(side === "left" ? "Add OH⁻ to left ({added}/{required})" : "Add OH⁻ to right ({added}/{required})", {added: s.added[side], required: s.required}), () => edit(() => M.addHelper(s, 0, side, "OH-"), key),
        {disabled: s.added[side] >= s.required, "data-key": key}));
    });
    else bar.append(el("p", {class: "zsa-rx-badge"}, t("Merge mode: H⁺ + OH⁻ → H₂O")));
    $("stage").append(bar, el("p", {class: "zsa-rx-small"}, t(s.selected ? "One term selected. Choose its partner, or select it again to deselect." : "Select a term to begin.")));
  }

  $("check").addEventListener("click", () => {
    const result = M.check(s);
    if (result.ok) { history = []; render(); $("title").focus(); }
    say(result.message, result.ok, result.half === undefined ? null : $("half-" + result.half));
  });
  $("undo").addEventListener("click", () => {
    if (!history.length) return;
    s = history.pop(); s.selected = null; s.cancelled = null; render();
    (history.length ? $("undo") : $("check")).focus(); say(t("Last action undone."), true);
  });
  $("restart").addEventListener("click", () => start(Number($("problem").value), true));
  $("problem").addEventListener("change", () => start(Number($("problem").value), true));
  M.PROBLEMS.forEach((p, i) => $("problem").append(el("option", {value: i}, t(p.media === "basic" ? "{title} (basic)" : "{title} (acidic)", {title: t(p.title)}))));
  const query = new URLSearchParams(location.search);
  let initial = M.PROBLEMS.findIndex(p => String(p.id) === query.get("problem"));
  if (initial < 0) initial = M.PROBLEMS.findIndex(p => p.media === query.get("media"));
  start(initial < 0 ? 0 : initial);
}());
