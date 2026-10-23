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
  function charge(ion) { return (Math.abs(ion.charge) === 1 ? "" : Math.abs(ion.charge)) + (ion.charge > 0 ? "+" : "−"); }
  function ionVisual(id) {
    var ion = data.ions[id], n = formula(ion.formula);
    n.appendChild(node("sup", "", charge(ion)));
    return n;
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
  var reaction, problem = 0, completed = 0, counted = false, deck = [], selected = null, stage = "products";
  var products, fields, previews, slots, coefficientInputs, hintLevel = 0;
  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }
  function nextReaction() {
    if (!reaction) return data.reactions[0];
    if (!deck.length) deck = shuffle(data.reactions.filter(function (r) { return r.id !== reaction.id; }));
    return deck.pop();
  }
  function setSelected(id) {
    selected = selected === id ? null : id;
    el("bank").querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.ion === selected)); });
    var text = selected ? data.ions[selected].name + " selected. Choose a matching product space." : "Choose an ion to place.";
    el("selection").textContent = text;
    say(text);
  }
  function preview(index) {
    var p = products[index], text = "";
    ["cation", "anion"].forEach(function (part) {
      var id = p[part], value = fields[index][part].value;
      if (!id) { text += "?"; return; }
      var ion = data.ions[id], count = value === "" ? 1 : Number(value);
      var repeated = Number.isInteger(count) && count > 1;
      text += (repeated && ion.polyatomic ? "(" + ion.formula + ")" : ion.formula) + (repeated ? count : "");
    });
    previews[index].replaceChildren(formula(text));
  }
  function place(index, part, id) {
    if (stage !== "products") return;
    if (!id) {
      products[index][part] = null;
      slots[index][part].textContent = part === "cation" ? "+ Cation" : "− Anion";
      slots[index][part].setAttribute("aria-label", "Product " + (index + 1) + " " + part);
      preview(index);
      say("Product " + (index + 1) + " " + part + " cleared.");
      return;
    }
    if (!data.ions[id] || !bankIds().includes(id)) return;
    var ion = data.ions[id];
    if ((part === "cation") !== (ion.charge > 0)) {
      feedback("Place positive cations in cation spaces and negative anions in anion spaces.", "error");
      return;
    }
    products[index][part] = id;
    slots[index][part].replaceChildren(ionVisual(id), node("span", "zsa-ir-slot-name", ion.name));
    slots[index][part].setAttribute("aria-label", "Product " + (index + 1) + " " + part + ": " + ion.formula + charge(ion) + " " + ion.name);
    preview(index);
    selected = null;
    el("bank").querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    el("selection").textContent = "Choose another ion, or select a filled space to clear it.";
    say(ion.name + " placed in product " + (index + 1) + " " + part + ".");
  }
  function bankIds() {
    return reaction.reactants.reduce(function (ids, r) { return ids.concat(r.cation, r.anion); }, []);
  }
  function buildBank() {
    el("bank").replaceChildren();
    shuffle(bankIds()).forEach(function (id) {
      var ion = data.ions[id];
      var button = node("button", "zsa-ir-ion zsa-ir-ion--" + (ion.charge > 0 ? "cation" : "anion"));
      button.type = "button"; button.draggable = true; button.dataset.ion = id;
      button.setAttribute("aria-pressed", "false");
      button.append(ionVisual(id), node("span", "zsa-ir-ion-name", ion.name));
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
      var card = node("fieldset", "zsa-ir-product");
      card.appendChild(node("legend", "", "Product " + (index + 1)));
      var parts = node("div", "zsa-ir-parts"); fields[index] = {}; slots[index] = {};
      ["cation", "anion"].forEach(function (part) {
        var group = node("div", "zsa-ir-compound");
        var slot = node("button", "zsa-ir-slot zsa-ir-slot--" + part, part === "cation" ? "+ Cation" : "− Anion");
        slot.type = "button"; slot.dataset.product = String(index); slot.dataset.part = part;
        slot.setAttribute("aria-label", "Product " + (index + 1) + " " + part);
        slot.addEventListener("click", function () { place(index, part, selected); });
        slot.addEventListener("dragover", function (event) { if (stage === "products") { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; } });
        slot.addEventListener("drop", function (event) { event.preventDefault(); place(index, part, event.dataTransfer.getData("text/plain")); });
        var label = node("label", "zsa-ir-subscript-label", "Subscript");
        var input = node("input", "zsa-ir-subscript");
        input.type = "number"; input.min = "1"; input.max = "9"; input.step = "1"; input.inputMode = "numeric"; input.placeholder = "1";
        input.id = "zsa-ir-sub-" + index + "-" + part;
        input.setAttribute("aria-label", "Product " + (index + 1) + " " + part + " subscript");
        input.setAttribute("aria-describedby", "zsa-ir-subscript-help");
        label.htmlFor = input.id;
        input.addEventListener("input", function () { preview(index); });
        fields[index][part] = input; slots[index][part] = slot;
        label.appendChild(input);
        group.append(slot, label); parts.appendChild(group);
      });
      var result = node("p", "zsa-ir-preview");
      result.setAttribute("aria-label", "Product " + (index + 1) + " formula preview");
      previews[index] = result;
      card.append(parts, result); el("products").appendChild(card); preview(index);
    });
  }
  function readSubscript(index, part) {
    var input = fields[index][part], value = input.value;
    if (input.validity.badInput) return null;
    return value === "" ? 1 : /^[1-9]$/.test(value) ? Number(value) : null;
  }
  function checkProducts() {
    if (stage !== "products") return;
    if (products.some(function (p) { return !p.cation || !p.anion; })) {
      feedback("Place a cation and an anion in each product before checking.", "error"); return;
    }
    var expected = [
      {cation: reaction.reactants[0].cation, anion: reaction.reactants[1].anion},
      {cation: reaction.reactants[1].cation, anion: reaction.reactants[0].anion}
    ];
    var matches = products.map(function (p) { return expected.findIndex(function (e) { return e.cation === p.cation && e.anion === p.anion; }); });
    if (matches.includes(-1) || matches[0] === matches[1]) {
      feedback("Swap partners: pair each reactant's cation with the other reactant's anion. Use each ion in one of the two products.", "error"); return;
    }
    for (var i = 0; i < 2; i++) {
      var c = model.compound(products[i].cation, products[i].anion);
      if (readSubscript(i, "cation") !== c.cationCount || readSubscript(i, "anion") !== c.anionCount) {
        feedback("Check the subscripts in product " + (i + 1) + ". Its positive and negative charges must cancel, using the smallest whole-number ratio. Keep polyatomic ions together.", "error"); return;
      }
    }
    stage = "balance"; hintLevel = 0;
    el("bank").querySelectorAll("button").forEach(function (b) { b.disabled = true; b.draggable = false; });
    el("products").querySelectorAll("button, input").forEach(function (b) { b.disabled = true; });
    el("check-products").disabled = true;
    el("selection").textContent = "Products are set. Change only the coefficients below.";
    el("balance").hidden = false;
    el("stage").textContent = "Step 2 of 2 · Balance the equation";
    buildEquation();
    feedback("Correct products! Now change coefficients until each ion has the same count on both sides. Keep the formulas fixed.", "correct");
    el("balance-title").focus();
  }
  function compounds() { return reaction.reactants.concat(products).map(function (p) { return model.compound(p.cation, p.anion); }); }
  function readCoefficients() {
    return coefficientInputs.map(function (input) { return /^[1-9]\d?$/.test(input.value) ? Number(input.value) : null; });
  }
  function canonicalCoefficients() {
    var values = readCoefficients();
    if (products[0].cation !== reaction.reactants[0].cation) { var t = values[2]; values[2] = values[3]; values[3] = t; }
    return values;
  }
  function buildEquation() {
    el("equation").replaceChildren(); coefficientInputs = [];
    compounds().forEach(function (c, i) {
      if (i) el("equation").appendChild(node("span", "zsa-ir-symbol", i === 2 ? "→" : "+"));
      var term = node("label", "zsa-ir-term");
      var input = node("input", "zsa-ir-coefficient");
      input.type = "number"; input.min = "1"; input.max = "99"; input.step = "1"; input.inputMode = "numeric"; input.value = "1";
      input.setAttribute("aria-label", "Coefficient for " + c.formula);
      input.setAttribute("aria-describedby", "zsa-ir-coefficient-help");
      input.addEventListener("input", function () {
        if (stage === "complete") { stage = "balance"; el("stage").textContent = "Step 2 of 2 · Balance the equation"; }
        el("next").disabled = true;
        updateCounts();
        el("feedback").textContent = "Counts updated. Check the balance when both sides match.";
        el("feedback").dataset.kind = "hint";
      });
      coefficientInputs.push(input); term.append(input, formula(c.formula)); el("equation").appendChild(term);
    });
    updateCounts();
  }
  function updateCounts() {
    var coefficients = canonicalCoefficients(), valid = coefficients.every(function (n) { return n !== null; });
    var counts = model.ionCounts(reaction, valid ? coefficients : [1, 1, 1, 1]);
    el("counts").replaceChildren();
    var spoken = [];
    counts.forEach(function (row) {
      var tr = node("tr"), th = node("th"); th.scope = "row"; th.appendChild(ionVisual(row.ion));
      var equal = valid && row.left === row.right;
      tr.append(th, node("td", "", valid ? String(row.left) : "?"), node("td", "", valid ? String(row.right) : "?"),
        node("td", "zsa-ir-match" + (equal ? " zsa-ir-match--yes" : ""), !valid ? "Enter whole numbers" : equal ? "Equal" : "Not equal"));
      el("counts").appendChild(tr);
      spoken.push(data.ions[row.ion].name + ": " + row.left + " on reactants, " + row.right + " on products");
    });
    if (stage === "balance") say(valid ? spoken.join(". ") + "." : "Coefficients must be whole numbers from 1 to 99.");
  }
  function checkBalance() {
    var values = canonicalCoefficients();
    if (values.some(function (n) { return n === null; })) { feedback("Enter whole numbers from 1 to 99 for every coefficient.", "error"); return; }
    if (!model.isBalanced(reaction, values)) { feedback("Not balanced yet. Compare each row in the ion table, then change coefficients to make both sides equal.", "error"); return; }
    if (!model.isLowest(reaction, values)) { feedback("The ions match! Now reduce all coefficients to the smallest whole-number ratio.", "error"); return; }
    if (!counted) { completed++; counted = true; }
    stage = "complete";
    el("stage").textContent = "Both steps complete";
    el("progress").textContent = completed + " reaction" + (completed === 1 ? "" : "s") + " balanced";
    el("next").disabled = false;
    feedback("Balanced! Every ion is conserved and the coefficients are in the smallest whole-number ratio. Ready for the next reaction.", "correct");
  }
  function hint() {
    hintLevel++;
    if (stage === "products") {
      var text = hintLevel === 1 ? "Swap the anions, keeping cations first. Choose subscripts so each product has total charge zero." :
        "For product 1, try " + data.ions[reaction.reactants[0].cation].name + " with " + data.ions[reaction.reactants[1].anion].name + ". A 2+ ion needs two 1− ions, or one 2− ion. Do not change the formula inside a polyatomic ion.";
      feedback(text, "hint");
    } else {
      var rows = model.ionCounts(reaction, canonicalCoefficients().map(function (n) { return n || 1; }));
      var mismatch = rows.find(function (row) { return row.left !== row.right; });
      feedback(mismatch ? "Start with " + data.ions[mismatch.ion].name + ": there are " + mismatch.left + " on the reactant side and " + mismatch.right + " on the product side. A coefficient multiplies every ion in its formula." : "All ion counts match. If needed, divide every coefficient by their greatest common factor.", "hint");
    }
  }
  function start(quiet) {
    reaction = nextReaction(); problem++; stage = "products"; counted = false; selected = null; hintLevel = 0;
    products = [{cation: null, anion: null}, {cation: null, anion: null}];
    el("round").textContent = "Problem " + problem;
    el("progress").textContent = completed + " reaction" + (completed === 1 ? "" : "s") + " balanced";
    el("stage").textContent = "Step 1 of 2 · Predict the products";
    el("selection").textContent = "Choose an ion to place.";
    el("note").textContent = reaction.note || "Practice the ion-exchange pattern and conserve each ion. Predicting a precipitate or a net ionic reaction is a separate step.";
    el("reactants").replaceChildren();
    reaction.reactants.forEach(function (r, i) {
      if (i) el("reactants").appendChild(node("span", "zsa-ir-symbol", "+"));
      el("reactants").appendChild(formula(model.compound(r.cation, r.anion).formula));
    });
    buildBank(); buildProducts();
    el("balance").hidden = true;
    el("check-products").closest("section").after(el("feedback"));
    el("check-products").disabled = false; el("next").disabled = true;
    el("feedback").textContent = ""; el("feedback").hidden = true; el("feedback").removeAttribute("data-kind");
    if (!quiet) { el("round").focus(); say("Problem " + problem + ". Predict the products."); }
  }
  el("check-products").addEventListener("click", checkProducts);
  el("check-balance").addEventListener("click", checkBalance);
  el("hint").addEventListener("click", hint);
  el("next").addEventListener("click", function () { if (stage === "complete") start(false); });
  start(true);
}());
