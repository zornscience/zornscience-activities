(function () {
  "use strict";
  var SVG = "http://www.w3.org/2000/svg";
  // Small line icons for the skill cards, drawn on a 24 by 24 grid with the current text color. Each entry is a list
  // of path data strings or [tag, attributes] pairs. They are decorative: every card names its skill in words.
  var ICONS = {
    mixed:["M3 7h3c4.5 0 6.5 10 11 10h3", "M3 17h3c4.5 0 6.5-10 11-10h3", "M17.5 4 20.5 7l-3 3", "M17.5 14l3 3-3 3"],
    flask:["M9 3h6", "M10 3v6l-5.2 9.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3", "M7.6 15h8.8"],
    percent:[["circle", {cx:"7", cy:"7", r:"2.6"}], ["circle", {cx:"17", cy:"17", r:"2.6"}], "M18.5 5.5 5.5 18.5"],
    vector:["M5 19 18 6", "M11 6h7v7", "M5 19h9"],
    triangle:["M5 19h14L5 5z", "M5 15h4v4"],
    graph:["M4 4v16h16", "M7 16l4-4 3 2 5-6"],
    curve:["M4 4v16h16", "M6.5 17.5C10 17 14 14 18.5 5.5"],
    digits:["M6 7v10", "M10 7v10", "M17 7v10", ["circle", {cx:"13.5", cy:"16.6", r:"0.6"}]],
    ruler:["M3 8h18v8H3z", "M7 8v3", "M11 8v4", "M15 8v3"],
    ratio:["M6 6v12", "M18 6v12", ["circle", {cx:"12", cy:"9", r:"1"}], ["circle", {cx:"12", cy:"15", r:"1"}]],
    balance:["M12 4v16", "M7 20h10", "M5 8h14", "M5 8 3 14h4z", "M19 8l-2 6h4z"],
    equation:["M4 9h7", "M4 15h7", "M15 6l4 6-4 6"],
    atom:[["ellipse", {cx:"12", cy:"12", rx:"9", ry:"3.6"}], ["ellipse", {cx:"12", cy:"12", rx:"9", ry:"3.6", transform:"rotate(60 12 12)"}],
      ["ellipse", {cx:"12", cy:"12", rx:"9", ry:"3.6", transform:"rotate(120 12 12)"}], ["circle", {cx:"12", cy:"12", r:"1.2"}]],
    molecule:[["circle", {cx:"6", cy:"7", r:"2.5"}], ["circle", {cx:"18", cy:"7", r:"2.5"}], ["circle", {cx:"12", cy:"17", r:"2.5"}], "M8.5 7h7", "M7.3 9.2l3.4 5.6", "M16.7 9.2l-3.4 5.6"],
    wave:["M3 12c1.5-5 3.5-5 5 0s3.5 5 5 0 3.5-5 5 0 2 4 3 3"],
    clock:[["circle", {cx:"12", cy:"12", r:"8.5"}], "M12 7.5V12l3 2"],
    flame:["M12 3c.8 3.4 5 5.4 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.7 1.8-5.6 1 1 1.6 1.8 2.6 2 .2-2.2-.6-4 .6-6.4z"],
    equilibrium:["M4 9h15", "M16 6l3 3", "M20 15H5", "M8 18l-3-3"],
    drop:["M12 3c3 4.6 6 7.8 6 11.6a6 6 0 0 1-12 0C6 10.8 9 7.6 12 3z", "M9.5 15a2.5 2.5 0 0 0 2.5 2.5"],
    bolt:["M13 2 5 14h6l-1 8 8-12h-6z"],
    particles:[["rect", {x:"4", y:"4", width:"16", height:"16", rx:"2.5"}], ["circle", {cx:"9", cy:"9", r:"1.3"}], ["circle", {cx:"15", cy:"11", r:"1.3"}], ["circle", {cx:"10", cy:"15.5", r:"1.3"}]],
    beaker:["M6 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4", "M4.5 4h15", "M6 12h12"],
    check:["M5 12.5l4.5 4.5L19 7.5"],
    cross:["M7 7l10 10", "M17 7 7 17"],
    spark:["M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z", "M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"],
    steps:["M9 6h11", "M9 12h11", "M9 18h11", ["circle", {cx:"5", cy:"6", r:"1"}], ["circle", {cx:"5", cy:"12", r:"1"}], ["circle", {cx:"5", cy:"18", r:"1"}]]
  };
  // The first rule that matches a skill's English title picks its icon; anything else gets the flask.
  var ICON_RULES = [
    [/composition/i, "balance"], [/yield/i, "beaker"], [/decimal/i, "digits"], [/percent change/i, "graph"], [/percent/i, "percent"], [/vector|scalar|perpendicular|direction|component/i, "vector"], [/sides|soh cah|angle|trig/i, "triangle"],
    [/electro|galvanic|cell potential|redox|oxidation|faraday/i, "bolt"], [/acid|base|\bph\b|pka|buffer|titrat|henderson/i, "drop"],
    [/entrop|enthalp|heat|thermo|energy|exotherm|endotherm|hess|phase change|calorimetr|coupled/i, "flame"],
    [/reaction rate|rate law|collision|mechanism|catalys|elementary|concentration changes/i, "clock"],
    [/equilibri|ch[aâ]telier|reversible|quotient|common-ion/i, "equilibrium"], [/photon|spectr|beer|electromagnetic/i, "wave"],
    [/\bgas|kinetic molecular/i, "particles"], [/atom|electron|periodic|valence/i, "atom"],
    [/bond|lewis|vsepr|resonance|structure|solid|metal|alloy|intermolecular|interparticle/i, "molecule"],
    [/solution|mixture|solubil|separation|dissolution/i, "beaker"], [/relationship|changing x|constant|prediction/i, "graph"],
    [/logarithm|exponent|notation/i, "curve"], [/significant|round|counting|multiplying|adding/i, "digits"],
    [/prefix|unit|conver|factor|squared|chain|rates and/i, "ruler"], [/ratio|proportion/i, "ratio"],
    [/mole|mass|stoichiometr|composition/i, "balance"], [/formula|equation|variable|step|rearrange|substitut|setup|symbol|word|final minus/i, "equation"]
  ];
  function svg(tag, attrs, parent) {
    var el = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    if (parent) parent.appendChild(el);
    return el;
  }
  function icon(name, cls) {
    var el = svg("svg", {viewBox:"0 0 24 24", "aria-hidden":"true", focusable:"false", "class":cls || "zsa-practice-icon"});
    ICONS[name].forEach(function (part) {
      if (typeof part === "string") svg("path", {d:part, pathLength:"1"}, el); else svg(part[0], part[1], el);
    });
    return el;
  }
  function iconFor(title) {
    var rule = ICON_RULES.find(function (r) { return r[0].test(title); });
    return rule ? rule[1] : "flask";
  }
  // A seeded generator for describing generated skills (which question kinds each one asks) without touching the
  // page's Math.random, so a student's sets are exactly as random as before.
  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  document.querySelectorAll("[data-zsa-practice]").forEach(create);
  function create(root) {
    var prefix = root.getAttribute("data-zsa-practice");
    var bank, M, i18n;
    root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (api) { bank = api; }}}));
    root.dispatchEvent(new CustomEvent("zsa:request-model", {detail:{receive:function (api) { M = api; }}}));
    root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
    if (!bank || !M || !i18n) return;
    // Only pages that load shared/zsa-formula.js can ask typed-equation questions (q.type "formula").
    var F;
    root.dispatchEvent(new CustomEvent("zsa:request-formula", {detail:{receive:function (api) { F = api; }}}));
    var set = [], index = 0, records = [], answered = false, activeTopic = bank.topics[0].id, streak = 0, best = 0;
    // A bank with generate(topic, model, random) makes new questions for every set (the Quantitative Skills sets).
    // Its questions carry a check object and are judged by M.judge; fixed banks keep M.inspect and the unit menu.
    var generated = typeof bank.generate === "function";
    // Interface words: the engine's own words for its cards, steps and results (M.engineEs), then the page's own
    // translation, then the shared Spanish (M.interfaceEs), so the fixed AP banks get the engine's words without a change
    // to their data files and keep their own wording for everything else.
    function t(text, values) {
      if (i18n.lang === "es" && Object.hasOwn(M.engineEs, text)) return i18n.text(M.engineEs[text], values);
      if (i18n.lang === "es" && i18n.text(text) === text && Object.hasOwn(M.interfaceEs, text)) return i18n.text(M.interfaceEs[text], values);
      return i18n.text(text, values);
    }
    function $(id) { return root.querySelector("#" + prefix + "-" + id); }
    function local(pair) { return pair[i18n.lang]; }
    function node(tag, text, cls) {
      var el = document.createElement(tag);
      if (text !== undefined) el.textContent = text;
      if (cls) el.className = cls;
      return el;
    }
    // Only sub and sup in authored content become elements. Everything else stays text.
    // Each word with a subscript, charge, power of ten or reaction arrow is wrapped as an image with its spoken form as
    // the name ("H sub 2 O", "10 to the power of negative 3"), since screen readers read the bare markup as "H2O" or "10 -3".
    function chemistry(el, text) {
      (String(text).match(/(?:<su[bp]>[^<]*<\/su[bp]>|\S)+|\s+/g) || []).forEach(function (word) {
        var say = word && M.spoken ? M.spoken(word, i18n.lang) : "";
        if (!say) { build(el, word); return; }
        var span = node("span"); span.className = "zsa-math"; span.setAttribute("role", "img"); span.setAttribute("aria-label", say);
        el.appendChild(build(span, word));
      });
      return el;
    }
    function build(el, text) {
      var current = el;
      String(text).split(/(<\/?(?:sub|sup)>)/g).forEach(function (part) {
        if (part === "<sub>" || part === "<sup>") {
          var child = node(part.slice(1, -1)); current.appendChild(child); current = child;
        } else if (part === "</sub>" || part === "</sup>") {
          if (current !== el) current = current.parentNode;
        } else current.appendChild(document.createTextNode(part));
      });
      return el;
    }
    function topicOf(id) { return bank.topics.find(function (topic) { return topic.id === id; }); }
    function topicName(id) { return local(topicOf(id).title); }
    function unitName(id) { return local(bank.units.find(function (unit) { return unit.id === id; }).label); }
    function answerText(q) {
      if (q.answerText) return local(q.answerText);
      if (q.type === "mc") return local(q.choices[q.answer].text);
      var number = q.display.replace(/e([+-]?\d+)/i, " × 10<sup>$1</sup>");
      return number + (q.unit === "count" || q.unit === "ratio" ? "" : " " + unitName(q.unit));
    }
    function correctAnswer(q) { return chemistry(node("p", undefined, "zsa-practice-answer"), t("Correct answer: ") + answerText(q)); }
    // The worked solution: the bank's explanation, one numbered step per sentence. A space between the steps keeps the
    // text exactly as authored for anything that reads the panel as one string.
    function steps(q) {
      var sentences = String(local(q.explanation)).split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡(])/);
      if (sentences.length < 2) return chemistry(node("p", undefined, "zsa-practice-step-text"), sentences[0] || "");
      var list = node("ol", undefined, "zsa-practice-step-list");
      sentences.forEach(function (sentence, i) {
        if (i) list.appendChild(document.createTextNode(" "));
        var li = node("li"); li.appendChild(chemistry(node("span"), sentence)); list.appendChild(li);
      });
      return list;
    }
    function stepsPanel(q, open, live) {
      var details = node("details", undefined, "zsa-practice-steps"), summary = node("summary");
      summary.appendChild(icon("steps", "zsa-practice-icon zsa-practice-steps-icon"));
      summary.appendChild(node("span", t("Show the steps")));
      details.appendChild(summary); details.appendChild(steps(q)); details.open = open;
      // Opening the panel inside the live feedback must not read the whole feedback again.
      if (live) summary.addEventListener("click", function () { live.setAttribute("aria-live", "off"); });
      return details;
    }
    function show(view) {
      ["setup", "play", "results"].forEach(function (name) { $(name).hidden = name !== view; });
    }

    // The start screen: one card per skill plus Mixed review, as real radio inputs in a fieldset.
    function kinds(questions) {
      var out = {mc:0, numeric:0, formula:0, units:false};
      questions.forEach(function (q) {
        out[q.type] = (out[q.type] || 0) + 1;
        if (q.type === "numeric" && (!q.check || q.check.unit === "required")) out.units = true;
      });
      return out;
    }
    // One line about each skill, from its data: an authored summary if the bank has one, otherwise the kinds of
    // question it asks (with counts for a fixed bank, whose questions never change).
    function describe(topic) {
      if (topic.summary) return local(topic.summary);
      var parts = [];
      if (!generated) {
        var k = kinds(bank.questions.filter(function (q) { return q.topic === topic.id; }));
        if (k.numeric) parts.push(t(k.numeric === 1 ? "1 typed answer" : "{n} typed answers", {n:k.numeric}));
        if (k.mc) parts.push(t("{n} multiple choice", {n:k.mc}));
        return parts.join(" · ");
      }
      var random = seeded(1), sample = [];
      bank.generators.filter(function (g) { return g.topic === topic.id; }).forEach(function (g) {
        for (var i = 0; i < 3; i++) sample.push(g.build(g.make(random)));
      });
      var g = kinds(sample);
      if (g.numeric) parts.push(t(g.units ? "Typed answers with units" : "Typed answers"));
      if (g.formula) parts.push(t("Typed equations"));
      if (g.mc) parts.push(t("Multiple choice"));
      return parts.join(" · ");
    }
    var picker = $("topic"), group = prefix + "-topic";
    var legend = picker.querySelector("legend") || picker.insertBefore(node("legend"), picker.firstChild);
    legend.textContent = t(generated ? "Choose a skill to practice" : "Choose a topic to practice");
    legend.classList.add("zsa-practice-legend");
    var grid = node("div", undefined, "zsa-practice-skill-grid");
    picker.appendChild(grid);
    function card(value, name, badge, description, count, iconName, wide) {
      var id = group + "-" + grid.children.length;
      var label = node("label", undefined, "zsa-practice-skill" + (wide ? " zsa-practice-skill--mixed" : ""));
      var input = node("input"); input.type = "radio"; input.name = group; input.value = value; input.id = id;
      var art = node("span", undefined, "zsa-practice-skill-art"); art.appendChild(icon(iconName));
      var text = node("span", undefined, "zsa-practice-skill-text"), title = node("span", undefined, "zsa-practice-skill-name");
      title.id = id + "-name";
      if (badge) { var b = node("span", badge, "zsa-practice-skill-badge"); title.appendChild(b); title.appendChild(document.createTextNode(" ")); }
      title.appendChild(chemistry(node("span"), name));
      var about = node("span", description, "zsa-practice-skill-about"); about.id = id + "-about";
      var size = node("span", t("{n} questions", {n:count}), "zsa-practice-skill-count"); size.id = id + "-count";
      input.setAttribute("aria-labelledby", title.id);
      input.setAttribute("aria-describedby", (description ? about.id + " " : "") + size.id);
      var meta = node("span", undefined, "zsa-practice-skill-meta");
      if (description) meta.appendChild(about);
      meta.appendChild(size);
      text.appendChild(title); text.appendChild(meta);
      label.appendChild(input); label.appendChild(art); label.appendChild(text);
      grid.appendChild(label);
      return input;
    }
    card("mixed", t("Mixed review"), "", t(generated ? "Every skill in one set" : "Every topic in one set"),
      generated ? bank.mixedSize : bank.questions.length, "mixed", true);
    bank.topics.forEach(function (topic) {
      var title = local(topic.title), split = title.match(/^(\d+\.\d+)\s+(.+)$/);
      card(topic.id, split ? split[2] : title, split ? split[1] : "", describe(topic),
        generated ? bank.perTopic : bank.questions.filter(function (q) { return q.topic === topic.id; }).length, iconFor(topic.title.en));
    });
    function chosen() { return picker.querySelector("input:checked"); }
    picker.querySelector('input[value="' + activeTopic + '"]').checked = true;

    var blankUnit = node("option", t("Choose a unit")); blankUnit.value = ""; $("unit").appendChild(blankUnit);
    (bank.units || []).forEach(function (unit) {
      var option = node("option", local(unit.label)); option.value = unit.id; $("unit").appendChild(option);
    });
    $("back").href = M.lessonLink(new URLSearchParams(location.search).get("from"), i18n.lang, bank.lesson);
    $("retry").textContent = t(generated ? "New numbers" : "Try again");
    $("choose").textContent = t(generated ? "Choose a skill" : "Choose a topic");
    $("misses").textContent = t("Practice my misses");
    if ($("breakdown-title")) $("breakdown-title").textContent = t(generated ? "Results by skill" : "Results by topic");

    function begin(questions) {
      set = questions; index = 0; records = []; streak = 0; best = 0;
      var track = $("progress");
      track.replaceChildren();
      track.classList.toggle("is-dense", set.length > 24);
      set.forEach(function () { track.appendChild(node("span", undefined, "zsa-practice-pip")); });
      $("streak").hidden = true;
      $("results").hidden = true; show("play"); render();
    }
    function start() {
      activeTopic = chosen().value;
      begin(generated ? M.makeSet(bank.generate(activeTopic, M, Math.random), "mixed") : M.makeSet(bank.questions, activeTopic));
    }
    function correctCount() { return records.filter(function (r) { return r.correct; }).length; }
    function status() {
      $("position").textContent = t("Question {n} of {total}", {n:index + 1, total:set.length});
      $("score").textContent = t("{n} of {total} correct", {n:correctCount(), total:set.length});
      $("count").textContent = (index + 1) + " / " + set.length;
      // Each pip says its state in data-state (styled from it, and read by the tests): current, correct, missed or empty.
      Array.from($("progress").children).forEach(function (pip, i) {
        var r = records[i];
        pip.setAttribute("data-state", r ? (r.correct ? "correct" : "missed") : i === index && !answered ? "current" : "");
      });
    }
    function render() {
      var item = set[index], q = item.question;
      answered = false;
      $("play").setAttribute("data-question-id", q.id);
      status();
      $("topic-name").textContent = topicName(q.topic);
      root.querySelectorAll("[data-zsa-practice-visual]").forEach(function (visual) {
        visual.hidden = !q[visual.getAttribute("data-zsa-practice-visual")];
      });
      var questionCard = $("question").closest(".zsa-card");
      if (questionCard) questionCard.classList.remove("is-correct", "is-wrong");
      $("question").replaceChildren(); chemistry($("question"), local(q.prompt));
      $("feedback").hidden = true; $("feedback").replaceChildren(); $("feedback").setAttribute("aria-live", "polite");
      $("error").textContent = "";
      $("next").hidden = true; $("check").disabled = false;
      $("choices").hidden = q.type !== "mc"; $("choices").disabled = false;
      $("numeric").hidden = q.type !== "numeric";
      $("numeric").classList.remove("is-correct", "is-wrong");
      $("value").value = ""; $("value").disabled = false; $("value").removeAttribute("aria-invalid");
      $("unit").value = ""; $("unit").disabled = false; $("unit").removeAttribute("aria-invalid");
      $("options").replaceChildren();
      if ($("formula")) {
        // The typed-equation block exists only on pages with a formula bank; its hint names the letters to use.
        $("formula").hidden = q.type !== "formula";
        $("formula").classList.remove("is-correct", "is-wrong");
        $("equation").value = ""; $("equation").disabled = false; $("equation").removeAttribute("aria-invalid");
        $("formula-hint").replaceChildren();
        if (q.type === "formula") chemistry($("formula-hint"), local(q.instruction));
      }
      if (q.type === "mc") {
        item.order.forEach(function (choiceIndex, displayIndex) {
          var input = node("input"); input.type = "radio"; input.name = "answer"; input.value = String(choiceIndex);
          input.id = prefix + "-option-" + displayIndex;
          var label = node("label", undefined, prefix + "-option zsa-practice-option"); label.htmlFor = input.id;
          label.appendChild(input); label.appendChild(chemistry(node("span"), local(q.choices[choiceIndex].text)));
          $("options").appendChild(label);
        });
      } else if (q.type === "formula") {
        $("unit").parentNode.hidden = true;
      } else if (q.check) {
        // Generated questions: the unit is typed with the number, and the line under the question is the bank's own
        // instruction, or nothing when deciding the precision is the skill being practiced.
        $("precision").textContent = q.instruction ? local(q.instruction) : "";
        $("precision").hidden = !q.instruction;
        $("unit").parentNode.hidden = true;
      } else {
        var precision = q.precision;
        $("precision").hidden = false; $("unit").parentNode.hidden = false;
        $("precision").textContent = precision.exact ? t("Enter an exact whole number.") : precision.sf ? t("Use {n} significant figures.", {n:precision.sf}) : precision.decimals === 1 ? t("Use 1 decimal place.") : t("Use {n} decimal places.", {n:precision.decimals});
      }
      $("question").focus();
    }
    $("answer").addEventListener("submit", function (event) {
      event.preventDefault();
      if (answered) return;
      var q = set[index].question, result, chosenChoice;
      $("error").textContent = "";
      if (q.type === "mc") {
        chosenChoice = $("options").querySelector("input:checked");
        if (!chosenChoice) { $("error").textContent = t("Select an answer first."); $("options").querySelector("input").focus(); return; }
        result = {correct:Number(chosenChoice.value) === q.answer};
      } else if (q.type === "formula") {
        $("equation").removeAttribute("aria-invalid");
        result = F.judge(q, $("equation").value);
        if (!result.valid) {
          $("error").textContent = t(F.messages[result.reason], result.values);
          $("equation").setAttribute("aria-invalid", "true"); $("equation").focus(); return;
        }
      } else if (q.check) {
        $("value").removeAttribute("aria-invalid");
        result = M.judge(q, $("value").value);
        if (!result.valid) {
          $("error").textContent = t({number:"Enter a number using a decimal point or scientific notation.", comma:"Use a decimal point, not a comma, like 3.5.",
            power:"Write the power of 10 with ^, like 3.2 x 10^4.", unit:"Type the unit after the number."}[result.reason]);
          $("value").setAttribute("aria-invalid", "true"); $("value").focus(); return;
        }
      } else {
        $("value").removeAttribute("aria-invalid"); $("unit").removeAttribute("aria-invalid");
        result = M.inspect(q, $("value").value, $("unit").value);
        if (!result.valid) {
          var target = result.reason === "number" ? "value" : "unit";
          $("error").textContent = t(target === "value" ? "Enter a number using a decimal point or scientific notation." : "Choose a unit first.");
          $(target).setAttribute("aria-invalid", "true"); $(target).focus(); return;
        }
      }
      answered = true; records.push({question:q, correct:result.correct});
      streak = result.correct ? streak + 1 : 0; best = Math.max(best, streak);
      $("check").disabled = true; $("choices").disabled = true; $("value").disabled = true; $("unit").disabled = true;
      if ($("equation")) $("equation").disabled = true;
      var state = result.correct ? "is-correct" : "is-wrong", feedback = $("feedback");
      var message = result.correct ? "Correct." : "Incorrect.";
      if (q.type === "numeric" && result.correct && !result.precisionOK) message = q.precision.sf ? "Correct value; check significant figures." : "Correct value; check decimal places.";
      feedback.className = "zsa-panel zsa-practice-feedback " + state;
      var verdict = node("p", undefined, "zsa-practice-verdict");
      verdict.appendChild(icon(result.correct ? "check" : "cross", "zsa-practice-verdict-icon"));
      verdict.appendChild(node("span", t(message)));
      feedback.appendChild(verdict);
      if (streak >= 2) feedback.appendChild(node("p", t("{n} correct in a row.", {n:streak}), "zsa-practice-streak-note"));
      if (q.type === "mc") {
        if (!result.correct) feedback.appendChild(chemistry(node("p"), local(q.choices[Number(chosenChoice.value)].why)));
        $("options").querySelectorAll("input").forEach(function (input) {
          if (Number(input.value) === q.answer) input.parentNode.classList.add("is-correct");
          else if (input.checked) input.parentNode.classList.add("is-wrong");
        });
      } else if (q.type === "formula") {
        $("formula").classList.add(state);
        result.notes.forEach(function (note) { feedback.appendChild(chemistry(node("p"), local(note))); });
      } else if (q.check) {
        $("numeric").classList.add(state);
        result.notes.forEach(function (note) { feedback.appendChild(chemistry(node("p"), local(note))); });
      } else {
        $("numeric").classList.add(state);
        if (!result.unitOK) {
          if (result.valueOK) feedback.appendChild(node("p", t("Your value is within tolerance, but the unit is incorrect.")));
          feedback.appendChild(node("p", t("The unit is incorrect. Use {unit}.", {unit:unitName(q.unit)})));
        }
        if (!result.precisionOK && !q.precision.exact) feedback.appendChild(node("p", q.precision.sf ? t("Use {n} significant figures in your final answer.", {n:q.precision.sf}) : t("Round your final answer to {n} decimal places.", {n:q.precision.decimals})));
      }
      feedback.appendChild(correctAnswer(q));
      // The steps open by themselves after a miss and stay one select away after a right answer.
      feedback.appendChild(stepsPanel(q, !result.correct, feedback));
      feedback.hidden = false;
      var questionCard = $("question").closest(".zsa-card");
      if (questionCard) questionCard.classList.add(state);
      status();
      $("streak").replaceChildren();
      if (streak >= 2) {
        $("streak").appendChild(icon("spark", "zsa-practice-icon"));
        $("streak").appendChild(node("span", t("{n} in a row", {n:streak})));
        // Restart the pop each time the streak grows.
        $("streak").classList.remove("is-new"); void $("streak").offsetWidth; $("streak").classList.add("is-new");
      }
      $("streak").hidden = streak < 2;
      $("next").textContent = t(index + 1 === set.length ? "See results" : "Next question");
      $("next").hidden = false; $("next").focus();
    });
    var missed = [];
    function ring(percent) {
      var size = 120, r = 52, c = 2 * Math.PI * r, el = $("ring");
      el.replaceChildren();
      var draw = svg("svg", {viewBox:"0 0 " + size + " " + size, "aria-hidden":"true", focusable:"false", "class":"zsa-practice-ring-art"}, el);
      svg("circle", {cx:"60", cy:"60", r:String(r), "class":"zsa-practice-ring-track"}, draw);
      // The arc starts at the top; its length is the score. CSS draws it in from zero unless motion is reduced.
      var arc = svg("circle", {cx:"60", cy:"60", r:String(r), "class":"zsa-practice-ring-arc" + (percent === 100 ? " is-full" : ""), transform:"rotate(-90 60 60)",
        "stroke-dasharray":c.toFixed(2) + " " + c.toFixed(2), "stroke-dashoffset":(c * (1 - percent / 100)).toFixed(2)}, draw);
      if (!percent) arc.setAttribute("hidden", "");
      var label = svg("text", {x:"60", y:"60", "class":"zsa-practice-ring-value", "text-anchor":"middle", "dominant-baseline":"central"}, draw);
      label.textContent = percent + "%";
    }
    function bar(right, total) {
      var art = svg("svg", {viewBox:"0 0 100 10", preserveAspectRatio:"none", "aria-hidden":"true", focusable:"false", "class":"zsa-practice-bar"});
      svg("rect", {x:"0", y:"0", width:"100", height:"10", rx:"5", "class":"zsa-practice-bar-track"}, art);
      if (right) svg("rect", {x:"0", y:"0", width:String(right / total * 100), height:"10", rx:"5", "class":"zsa-practice-bar-fill"}, art);
      return art;
    }
    function finish() {
      show("results");
      var score = correctCount(), percent = Math.round(score / set.length * 100);
      $("total").textContent = t("{score} of {total} correct ({percent}%).", {score:score, total:set.length, percent:percent});
      ring(percent);
      $("best").textContent = best >= 2 ? t("Best streak: {n} in a row", {n:best}) : "";
      $("best").hidden = best < 2;
      $("breakdown").replaceChildren();
      bank.topics.forEach(function (topic) {
        var group = records.filter(function (r) { return r.question.topic === topic.id; });
        if (!group.length) return;
        var right = group.filter(function (r) { return r.correct; }).length, li = node("li");
        li.appendChild(chemistry(node("span", undefined, "zsa-practice-breakdown-name"), local(topic.title)));
        li.appendChild(node("span", ": ", "zsa-sr-only"));
        li.appendChild(bar(right, group.length));
        li.appendChild(node("span", right + "/" + group.length, "zsa-practice-breakdown-score"));
        $("breakdown").appendChild(li);
      });
      $("review").replaceChildren();
      missed = records.filter(function (r) { return !r.correct; }).map(function (r) { return r.question; });
      $("misses").hidden = !missed.length;
      $("misses").classList.toggle("zsa-btn--primary", !!missed.length);
      $("retry").classList.toggle("zsa-btn--primary", !missed.length);
      if (missed.length) {
        $("review").appendChild(node("h3", t("Review these questions")));
        missed.forEach(function (q) {
          var details = node("details", undefined, prefix + "-review-item zsa-practice-review-item");
          // The prompt is one flex item beside the mark, so its words wrap as a paragraph.
          var summary = node("summary");
          summary.appendChild(icon("cross", "zsa-practice-icon zsa-practice-review-mark"));
          summary.appendChild(chemistry(node("span", undefined, "zsa-practice-review-prompt"), local(q.prompt)));
          details.appendChild(summary);
          var body = node("div", undefined, "zsa-practice-review-body");
          body.appendChild(correctAnswer(q));
          body.appendChild(node("p", t("Show the steps"), "zsa-practice-review-steps-title"));
          body.appendChild(steps(q));
          details.appendChild(body);
          $("review").appendChild(details);
        });
      } else $("review").appendChild(node("p", t("All correct. Try another topic when you are ready.")));
      $("results-title").focus();
    }
    $("next").addEventListener("click", function () {
      if (!answered) return;
      index++;
      if (index === set.length) finish(); else render();
    });
    $("start").addEventListener("click", start);
    $("retry").addEventListener("click", start);
    // The questions missed in this set again, in a new order, with the same numbers.
    $("misses").addEventListener("click", function () { begin(M.makeSet(missed, "mixed")); });
    $("choose").addEventListener("click", function () { show("setup"); chosen().focus(); });
  }
}());
