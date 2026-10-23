(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ionic-reactions"]');
  if (!root) return;
  var data, model;
  root.dispatchEvent(new CustomEvent("zsa:request-ir-data", {detail: {receive: function (api) { data = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-ir-model", {detail: {receive: function (api) { model = api; }}}));
  if (!data || !model) return;
  function el(id) { return root.querySelector("#zsa-ir-" + id); }
  function node(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function formula(text) {
    var n = node("span", "zsa-ir-formula");
    text.split(/(\d+)/).filter(Boolean).forEach(function (part) {
      n.appendChild(node(/^\d+$/.test(part) ? "sub" : "span", "", part));
    });
    return n;
  }
  function charge(token) {
    return token.charge ? (Math.abs(token.charge) === 1 ? "" : Math.abs(token.charge)) + (token.charge > 0 ? "+" : "−") : "";
  }
  function category(token) { return token.charge > 0 ? "cation" : token.charge < 0 ? "anion" : "neutral"; }
  function tokenVisual(id) {
    var token = data.tokens[id], n = formula(token.formula);
    if (token.charge) n.appendChild(node("sup", "", charge(token)));
    return n;
  }
  function typeLabel(type) {
    var entry = data.types.find(function (t) { return t.id === type; });
    return entry ? entry.label : type;
  }
  function say(text) { el("live").textContent = text; }
  function feedback(text, kind) {
    if (stage !== "products" && el("feedback").parentNode !== el("balance")) el("balance").appendChild(el("feedback"));
    el("feedback").hidden = false;
    el("feedback").textContent = text;
    el("feedback").dataset.kind = kind;
    say(text);
    if (!root.classList.contains("zsa--embedded")) el("feedback").scrollIntoView({block: "nearest"});
  }
  function incorrect(text) { record.missed = true; feedback(text, "error"); }
  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }
  var round, records, position, reaction, record, selected, stage = "setup", selectedTypes = [];
  var products, fields, previews, slots, coefficientInputs, productOrder, hintLevel;
  function progress() {
    var finished = position + (record.solved ? 1 : 0);
    el("meter").value = finished;
    el("progress").textContent = finished + " of " + round.length + " finished";
  }
  function setSelected(id) {
    selected = selected === id ? null : id;
    el("bank").querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.token === selected)); });
    var text = selected ? data.tokens[selected].name + " selected. Choose a product space." : "Choose a building block to place.";
    el("selection").textContent = text;
    say(text);
  }
  function readSubscript(index, part) {
    var input = fields[index][part], value = input.value;
    if (input.validity.badInput) return null;
    return value === "" ? 1 : /^[1-9]$/.test(value) ? Number(value) : null;
  }
  function readParts(index) {
    var parts = [];
    for (var part = 0; part < 2; part++) {
      var id = products[index][part], count = readSubscript(index, part);
      if (!id) {
        if (part === 0 || count !== 1) return null;
      } else {
        if (count === null) return null;
        parts.push({token: id, count: count});
      }
    }
    return parts;
  }
  function preview(index) {
    var parts = readParts(index);
    previews[index].replaceChildren(formula(parts ? model.speciesFormula(parts) : "?"));
  }
  function place(index, part, id) {
    if (stage !== "products") return;
    if (!id) {
      products[index][part] = null;
      slots[index][part].className = "zsa-ir-slot zsa-ir-slot--component";
      slots[index][part].textContent = part === 0 ? "First part" : "Second part";
      slots[index][part].setAttribute("aria-label", "Product " + (index + 1) + " component " + (part + 1) + ": " + (part === 0 ? "First part" : "Second part"));
      preview(index);
      say("Product " + (index + 1) + " component " + (part + 1) + " cleared.");
      return;
    }
    if (!data.tokens[id] || !reaction.bank.includes(id)) return;
    var token = data.tokens[id];
    products[index][part] = id;
    slots[index][part].className = "zsa-ir-slot zsa-ir-slot--" + category(token);
    slots[index][part].replaceChildren(tokenVisual(id), document.createTextNode(" "), node("span", "zsa-ir-slot-name", token.name));
    slots[index][part].setAttribute("aria-label", "Product " + (index + 1) + " component " + (part + 1) + ": " + token.formula + charge(token) + " " + token.name);
    preview(index);
    selected = null;
    el("bank").querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    el("selection").textContent = "Choose another block, or select a filled space to clear it.";
    say(token.name + " placed in product " + (index + 1) + ", component " + (part + 1) + ".");
  }
  function buildBank() {
    el("bank").replaceChildren();
    shuffle(reaction.bank).forEach(function (id) {
      var token = data.tokens[id], button = node("button", "zsa-ir-ion zsa-ir-ion--" + category(token));
      button.type = "button"; button.draggable = true; button.dataset.token = id;
      button.setAttribute("aria-pressed", "false");
      button.append(tokenVisual(id), document.createTextNode(" "), node("span", "zsa-ir-ion-name", token.name));
      button.addEventListener("click", function () { setSelected(id); });
      button.addEventListener("dragstart", function (event) {
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.effectAllowed = "copy";
      });
      el("bank").appendChild(button);
    });
  }
  function buildProducts() {
    el("products").replaceChildren(); fields = []; previews = []; slots = [];
    products.forEach(function (p, index) {
      if (index) {
        var plus = node("span", "zsa-ir-product-plus", "+"); plus.setAttribute("aria-hidden", "true"); el("products").appendChild(plus);
      }
      var card = node("fieldset", "zsa-ir-product");
      card.appendChild(node("legend", "", "Product " + (index + 1)));
      var parts = node("div", "zsa-ir-parts"); fields[index] = []; slots[index] = [];
      [0, 1].forEach(function (part) {
        var group = node("div", "zsa-ir-compound");
        var slot = node("button", "zsa-ir-slot zsa-ir-slot--component", part === 0 ? "First part" : "Second part");
        slot.type = "button"; slot.dataset.product = String(index); slot.dataset.part = String(part);
        slot.setAttribute("aria-label", "Product " + (index + 1) + " component " + (part + 1) + ": " + (part === 0 ? "First part" : "Second part"));
        slot.setAttribute("aria-describedby", "zsa-ir-subscript-help");
        slot.addEventListener("click", function () { place(index, part, selected); });
        slot.addEventListener("dragover", function (event) {
          if (stage === "products") { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }
        });
        slot.addEventListener("drop", function (event) { event.preventDefault(); place(index, part, event.dataTransfer.getData("text/plain")); });
        var label = node("label", "zsa-ir-subscript-label", "Subscript");
        var input = node("input", "zsa-ir-subscript");
        input.type = "number"; input.min = "1"; input.max = "9"; input.step = "1"; input.inputMode = "numeric"; input.placeholder = "1";
        input.id = "zsa-ir-sub-" + index + "-" + part;
        input.setAttribute("aria-label", "Product " + (index + 1) + " component " + (part + 1) + " subscript");
        input.setAttribute("aria-describedby", "zsa-ir-subscript-help");
        label.htmlFor = input.id;
        input.addEventListener("input", function () { preview(index); });
        fields[index][part] = input; slots[index][part] = slot;
        var subscriptField = node("div", "zsa-ir-subscript-field");
        var control = node("div", "zsa-ir-sub-control"), arrows = node("span", "zsa-ir-sub-arrows");
        function subscriptButton(delta) {
          var button = node("button", "zsa-ir-sub-step"); button.type = "button";
          button.setAttribute("aria-label", (delta > 0 ? "Increase" : "Decrease") + " product " + (index + 1) + " component " + (part + 1) + " subscript");
          var icon = node("span", "", delta > 0 ? "▲" : "▼"); icon.setAttribute("aria-hidden", "true"); button.appendChild(icon);
          button.addEventListener("click", function () {
            var current = readSubscript(index, part);
            if (current === null) current = 1;
            var value = String(Math.max(1, Math.min(9, current + delta)));
            if (input.value === value) return;
            input.value = value; input.dispatchEvent(new Event("input", {bubbles: true}));
          });
          return button;
        }
        arrows.append(subscriptButton(1), subscriptButton(-1)); control.append(input, arrows);
        subscriptField.append(label, control); group.append(slot, subscriptField); parts.appendChild(group);
      });
      var result = node("p", "zsa-ir-preview");
      result.setAttribute("aria-label", "Product " + (index + 1) + " formula preview");
      previews[index] = result;
      card.append(parts, result); el("products").appendChild(card); preview(index);
    });
  }
  function sameParts(a, b, counts) {
    return a.length === b.length && a.every(function (part, i) { return part.token === b[i].token && (!counts || part.count === b[i].count); });
  }
  function checkProducts() {
    if (stage !== "products") return;
    var parts = products.map(function (_, i) { return readParts(i); });
    if (parts.some(function (p) { return !p; })) {
      incorrect("Fill the first space in each product and use whole-number subscripts from 1 to 9. Leave the second space empty for a one-part product. A blank subscript means 1."); return;
    }
    var matches = parts.map(function (p) { return reaction.products.findIndex(function (expected) { return sameParts(p, expected.parts, true); }); });
    if (!matches.includes(-1) && new Set(matches).size !== matches.length) {
      incorrect("Use each different product once. Two identical product cards leave another product missing."); return;
    }
    if (matches.includes(-1) || new Set(matches).size !== matches.length) {
      var hasRightComponents = parts.every(function (p) { return reaction.products.some(function (expected) { return sameParts(p, expected.parts, false); }); });
      incorrect(hasRightComponents ? "Check the subscripts. Use the simplest neutral formula, and remember the 2 in diatomic elements such as H2 and O2. Keep polyatomic ions together." :
        "Check the products for this reaction type. Put positive ions before negative ions in ionic formulas. Molecular products use atom blocks, and each different product belongs in its own card.");
      return;
    }
    productOrder = matches; stage = "balance"; hintLevel = 0;
    el("bank").querySelectorAll("button").forEach(function (b) { b.disabled = true; b.draggable = false; });
    el("products").querySelectorAll("button, input").forEach(function (b) { b.disabled = true; });
    el("check-products").disabled = true;
    el("selection").textContent = "Products are set. Change only the coefficients below.";
    el("note").textContent = reaction.note || "Correct formulas are locked. Change coefficients to balance the equation.";
    el("balance").hidden = false;
    el("stage").textContent = "Step 2 of 2 · Balance the equation";
    var ones = reaction.reactants.concat(reaction.products).map(function () { return 1; });
    var canCountIons = !!model.ionCounts(reaction, ones, productOrder);
    el("count-controls").hidden = !canCountIons;
    el("count-mode").value = canCountIons ? "ions" : "atoms";
    buildEquation();
    feedback("Correct products! Now conserve every atom by changing coefficients. Keep the formulas fixed.", "correct");
    el("balance-title").focus();
  }
  function displayedSpecies() { return reaction.reactants.concat(productOrder.map(function (index) { return reaction.products[index]; })); }
  function readCoefficients() {
    return coefficientInputs.map(function (input) { return /^[1-9]\d?$/.test(input.value) ? Number(input.value) : null; });
  }
  function buildEquation() {
    el("equation").replaceChildren(); coefficientInputs = [];
    displayedSpecies().forEach(function (species, i) {
      if (i) el("equation").appendChild(node("span", "zsa-ir-symbol", i === reaction.reactants.length ? "→" : "+"));
      var term = node("div", "zsa-ir-term"), stepper = node("div", "zsa-ir-stepper");
      var input = node("input", "zsa-ir-coefficient");
      input.type = "number"; input.min = "1"; input.max = "99"; input.step = "1"; input.inputMode = "numeric"; input.value = "1";
      input.setAttribute("aria-label", "Coefficient for " + species.formula);
      input.setAttribute("aria-describedby", "zsa-ir-coefficient-help");
      input.addEventListener("input", function () {
        if (stage === "complete") { stage = "balance"; record.solved = false; el("stage").textContent = "Step 2 of 2 · Balance the equation"; progress(); }
        el("next").disabled = true; el("skip").disabled = false;
        updateCounts();
        el("feedback").textContent = "Counts updated. Check the balance when both sides match.";
        el("feedback").dataset.kind = "hint";
      });
      function stepButton(delta) {
        var button = node("button", "zsa-ir-step"); button.type = "button";
        button.setAttribute("aria-label", (delta < 0 ? "Decrease" : "Increase") + " coefficient for " + species.formula);
        var symbol = node("span", "", delta < 0 ? "−" : "+"); symbol.setAttribute("aria-hidden", "true"); button.appendChild(symbol);
        button.addEventListener("click", function () {
          var current = Number(input.value);
          if (!Number.isInteger(current) || current < 1 || current > 99) current = 1;
          var value = String(Math.max(1, Math.min(99, current + delta)));
          if (input.value === value) return;
          input.value = value; input.dispatchEvent(new Event("input", {bubbles: true}));
        });
        return button;
      }
      stepper.append(stepButton(-1), input, stepButton(1)); coefficientInputs.push(input);
      term.append(stepper, formula(species.formula)); el("equation").appendChild(term);
    });
    updateCounts();
  }
  function countRows(values) {
    return el("count-mode").value === "ions" ? model.ionCounts(reaction, values, productOrder) : model.atomCounts(reaction, values, productOrder);
  }
  function updateCounts() {
    var values = readCoefficients(), valid = values.every(function (n) { return n !== null; });
    var rows = countRows(valid ? values : values.map(function () { return 1; }));
    var ions = el("count-mode").value === "ions";
    el("count-label").textContent = ions ? "Ion" : "Atom";
    el("count-caption").textContent = ions ? "Whole ions are unchanged in this partner swap. Every row must match." : "Atoms are conserved in every reaction type. Every row must match.";
    el("counts").replaceChildren();
    var spoken = [];
    rows.forEach(function (row) {
      var tr = node("tr"), th = node("th"); th.scope = "row";
      th.appendChild(ions && row.token ? tokenVisual(row.token) : formula(row.symbol));
      var equal = valid && row.left === row.right;
      tr.append(th, node("td", "", valid ? String(row.left) : "?"), node("td", "", valid ? String(row.right) : "?"),
        node("td", "zsa-ir-match" + (equal ? " zsa-ir-match--yes" : ""), !valid ? "Enter whole numbers" : equal ? "Equal" : "Not equal"));
      el("counts").appendChild(tr);
      spoken.push(row.symbol + ": " + row.left + " on reactants, " + row.right + " on products");
    });
    if (stage === "balance") say(valid ? spoken.join(". ") + "." : "Coefficients must be whole numbers from 1 to 99.");
  }
  function checkBalance() {
    var values = readCoefficients();
    if (values.some(function (n) { return n === null; })) { incorrect("Enter whole numbers from 1 to 99 for every coefficient."); return; }
    if (!model.isBalanced(reaction, values, productOrder)) { incorrect("Not balanced yet. Compare each row in the table, then change coefficients to conserve the atoms on both sides."); return; }
    if (!model.isLowest(reaction, values, productOrder)) { incorrect("The counts match! Now reduce all coefficients to the smallest whole-number ratio."); return; }
    record.solved = true; stage = "complete";
    el("stage").textContent = "Both steps complete"; progress();
    el("next").disabled = false; el("skip").disabled = true;
    feedback("Balanced! Every atom is conserved and the coefficients are in the smallest whole-number ratio.", "correct");
  }
  function hint() {
    hintLevel++;
    if (stage === "products") {
      var hints = {
        synthesis: "Synthesis combines simpler reactants into one product. If it is ionic, make its positive and negative charges cancel.",
        decomposition: "Decomposition breaks one compound into simpler substances. Use the reaction conditions and remember diatomic gases.",
        "single-replacement": "A more reactive element replaces another element in a compound. The displaced element is an uncombined element, not an ion.",
        "double-replacement": "Swap the ion partners. Keep cations first and use the smallest subscripts that make each product neutral."
      };
      feedback(hintLevel === 1 ? hints[reaction.type] : "One product is " + reaction.products[0].formula + ". " + (reaction.hint || "Use the available blocks to build the remaining product, if any. Put each different product in its own card."), "hint");
    } else {
      var rows = countRows(readCoefficients().map(function (n) { return n || 1; }));
      var mismatch = rows.find(function (row) { return row.left !== row.right; });
      feedback(mismatch ? "Start with " + mismatch.symbol + ": " + mismatch.left + " on the reactant side and " + mismatch.right + " on the product side. A coefficient multiplies the entire formula." : "All counts match. If needed, divide every coefficient by their greatest common factor.", "hint");
    }
  }
  function loadProblem(quiet) {
    reaction = round[position]; record = {reaction: reaction, missed: false, skipped: false, solved: false}; records.push(record);
    stage = "products"; selected = null; hintLevel = 0; productOrder = [];
    products = reaction.products.map(function () { return [null, null]; });
    root.dataset.reaction = reaction.id; root.dataset.reactionType = reaction.type;
    el("round").textContent = "Problem " + (position + 1) + " of " + round.length;
    el("type").textContent = typeLabel(reaction.type); progress();
    el("stage").textContent = "Step 1 of 2 · Predict the products";
    el("selection").textContent = "Choose a building block to place.";
    el("note").textContent = "Predict the products first, then balance the equation. Skip a problem to return to its answer in the summary.";
    el("condition").textContent = reaction.condition || ""; el("condition").hidden = !reaction.condition;
    el("reactants").replaceChildren();
    reaction.reactants.forEach(function (species, i) {
      if (i) el("reactants").appendChild(node("span", "zsa-ir-symbol", "+"));
      el("reactants").appendChild(formula(species.formula));
    });
    buildBank(); buildProducts();
    el("balance").hidden = true;
    el("check-products").closest("section").after(el("feedback"));
    el("check-products").disabled = false; el("next").disabled = true; el("skip").disabled = false;
    el("next").textContent = position === round.length - 1 ? "View summary" : "Next reaction";
    el("feedback").textContent = ""; el("feedback").hidden = true; el("feedback").removeAttribute("data-kind");
    if (!quiet) { el("round").focus(); say("Problem " + (position + 1) + " of " + round.length + ". " + typeLabel(reaction.type) + ". Predict the products."); }
  }
  function balancedEquation(r) {
    var container = node("p", "zsa-ir-review-equation"), values = model.coefficients(r);
    r.reactants.concat(r.products).forEach(function (species, i) {
      if (i) container.appendChild(node("span", "zsa-ir-symbol", i === r.reactants.length ? "→" : "+"));
      var term = node("span", "zsa-ir-review-term");
      if (values[i] !== 1) term.appendChild(node("span", "", String(values[i])));
      term.appendChild(formula(species.formula)); container.appendChild(term);
    });
    return container;
  }
  function showSummary() {
    stage = "summary"; el("practice").hidden = true; el("summary").hidden = false;
    var missed = records.filter(function (r) { return r.missed || r.skipped; });
    var skipped = records.filter(function (r) { return r.skipped; }).length;
    var solved = records.filter(function (r) { return r.solved && !r.skipped; }).length;
    el("summary-lede").textContent = "You finished " + round.length + " problems. You missed " + missed.length + ", including " + skipped + " skipped.";
    el("summary-totals").replaceChildren();
    [["balanced", solved, "Balanced"], ["first-try", round.length - missed.length, "Correct first try"], ["missed", missed.length, "Missed (includes skips)"], ["skipped", skipped, "Skipped"]].forEach(function (stat) {
      var n = node("div", "zsa-ir-stat"); n.dataset.stat = stat[0]; n.append(node("strong", "", String(stat[1])), node("span", "", stat[2])); el("summary-totals").appendChild(n);
    });
    el("summary-review").replaceChildren();
    missed.forEach(function (r) {
      var item = node("li", "zsa-ir-review-item");
      item.append(node("p", "zsa-ir-review-status", typeLabel(r.reaction.type) + " · " + (r.skipped ? "Skipped" : "Needed another try")), balancedEquation(r.reaction));
      if (r.reaction.condition) item.appendChild(node("p", "zsa-ir-small", r.reaction.condition));
      el("summary-review").appendChild(item);
    });
    if (!missed.length) el("summary-review").appendChild(node("li", "zsa-ir-review-item", "Every problem was correct on the first check. Nice work!"));
    el("summary-types").replaceChildren();
    data.types.filter(function (type) { return selectedTypes.includes(type.id); }).forEach(function (type) {
      var entries = records.filter(function (r) { return r.reaction.type === type.id; });
      var misses = entries.filter(function (r) { return r.missed || r.skipped; }).length;
      el("summary-types").appendChild(node("p", "zsa-ir-type-result", type.label + ": " + (entries.length - misses) + " of " + entries.length + " correct first try"));
    });
    el("summary-title").focus(); say("Practice complete. " + missed.length + " problems missed, including " + skipped + " skipped.");
  }
  function advance() { position++; if (position === round.length) showSummary(); else loadProblem(false); }
  function startRound(quiet) {
    round = model.makeRound(Math.random, data.roundSize, selectedTypes); records = []; position = 0;
    el("setup").hidden = true;
    el("summary").hidden = true; el("practice").hidden = false; el("meter").max = round.length;
    loadProblem(quiet);
  }
  function showSetup(quiet) {
    stage = "setup"; el("setup").hidden = false; el("practice").hidden = true; el("summary").hidden = true;
    el("setup-error").hidden = true;
    delete root.dataset.reaction; delete root.dataset.reactionType;
    if (!quiet) { el("setup-title").focus(); say("Choose at least one reaction type, then start practice."); }
  }
  el("start").addEventListener("click", function () {
    var checked = Array.from(root.querySelectorAll('input[name="reaction-type"]:checked')).map(function (input) { return input.value; });
    if (!checked.length) {
      el("setup-error").textContent = "Choose at least one reaction type before starting.";
      el("setup-error").hidden = false;
      root.querySelector('input[name="reaction-type"]').focus();
      return;
    }
    selectedTypes = checked; el("setup-error").hidden = true; startRound(false);
  });
  root.querySelectorAll('input[name="reaction-type"]').forEach(function (input) {
    input.addEventListener("change", function () { if (input.checked) el("setup-error").hidden = true; });
  });
  el("check-products").addEventListener("click", checkProducts);
  el("check-balance").addEventListener("click", checkBalance);
  el("count-mode").addEventListener("change", updateCounts);
  el("hint").addEventListener("click", hint);
  el("next").addEventListener("click", function () { if (stage === "complete") advance(); });
  el("skip").addEventListener("click", function () {
    if (stage === "products" || stage === "balance") { record.skipped = true; record.solved = false; advance(); }
  });
  el("restart").addEventListener("click", function () { startRound(false); });
  el("change-types").addEventListener("click", function () { showSetup(false); });
  showSetup(true);
}());
