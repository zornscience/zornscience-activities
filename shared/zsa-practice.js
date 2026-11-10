(function () {
  "use strict";
  document.querySelectorAll("[data-zsa-practice]").forEach(create);
  function create(root) {
    var prefix = root.getAttribute("data-zsa-practice");
    var bank, M, i18n;
    root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (api) { bank = api; }}}));
    root.dispatchEvent(new CustomEvent("zsa:request-model", {detail:{receive:function (api) { M = api; }}}));
    root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
    if (!bank || !M || !i18n) return;
    var t = i18n.text, set = [], index = 0, records = [], answered = false, activeTopic = bank.topics[0].id;
    // A bank with generate(topic, model, random) makes new questions for every set (the Quantitative Skills sets).
    // Its questions carry a check object and are judged by M.judge; fixed banks keep M.inspect and the unit menu.
    var generated = typeof bank.generate === "function";
    function $(id) { return root.querySelector("#" + prefix + "-" + id); }
    function local(pair) { return pair[i18n.lang]; }
    function node(tag, text, cls) {
      var el = document.createElement(tag);
      if (text !== undefined) el.textContent = text;
      if (cls) el.className = cls;
      return el;
    }
    // Only sub and sup in authored content become elements. Everything else stays text.
    function chemistry(el, text) {
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
    function topicName(id) { return local(bank.topics.find(function (topic) { return topic.id === id; }).title); }
    function unitName(id) { return local(bank.units.find(function (unit) { return unit.id === id; }).label); }
    function answerText(q) {
      if (q.answerText) return local(q.answerText);
      if (q.type === "mc") return local(q.choices[q.answer].text);
      var number = q.display.replace(/e([+-]?\d+)/i, " × 10<sup>$1</sup>");
      return number + (q.unit === "count" || q.unit === "ratio" ? "" : " " + unitName(q.unit));
    }
    function correctAnswer(q) { return chemistry(node("p"), t("Correct answer: ") + answerText(q)); }
    function show(view) {
      ["setup", "play", "results"].forEach(function (name) { $(name).hidden = name !== view; });
    }
    var mixed = node("option", t("Mixed review") + " · " + t("{n} questions", {n:generated ? bank.mixedSize : bank.questions.length}));
    mixed.value = "mixed"; $("topic").appendChild(mixed);
    bank.topics.forEach(function (topic) {
      var option = node("option", local(topic.title)); option.value = topic.id; $("topic").appendChild(option);
    });
    $("topic").value = activeTopic;
    var blankUnit = node("option", t("Choose a unit")); blankUnit.value = ""; $("unit").appendChild(blankUnit);
    (bank.units || []).forEach(function (unit) {
      var option = node("option", local(unit.label)); option.value = unit.id; $("unit").appendChild(option);
    });
    $("back").href = M.lessonLink(new URLSearchParams(location.search).get("from"), i18n.lang, bank.lesson);
    function start() {
      activeTopic = $("topic").value;
      set = generated ? M.makeSet(bank.generate(activeTopic, M, Math.random), "mixed") : M.makeSet(bank.questions, activeTopic);
      index = 0; records = [];
      $("results").hidden = true; show("play"); render();
    }
    function render() {
      var item = set[index], q = item.question;
      answered = false;
      $("play").setAttribute("data-question-id", q.id);
      $("position").textContent = t("Question {n} of {total}", {n:index + 1, total:set.length});
      $("score").textContent = t("{n} of {total} correct", {n:records.filter(function (r) { return r.correct; }).length, total:set.length});
      $("progress").max = set.length; $("progress").value = index;
      $("topic-name").textContent = topicName(q.topic);
      root.querySelectorAll("[data-zsa-practice-visual]").forEach(function (visual) {
        visual.hidden = !q[visual.getAttribute("data-zsa-practice-visual")];
      });
      $("question").replaceChildren(); chemistry($("question"), local(q.prompt));
      $("feedback").hidden = true; $("feedback").replaceChildren();
      $("error").textContent = "";
      $("next").hidden = true; $("check").disabled = false;
      $("choices").hidden = q.type !== "mc"; $("choices").disabled = false;
      $("numeric").hidden = q.type !== "numeric";
      $("value").value = ""; $("value").disabled = false; $("value").removeAttribute("aria-invalid");
      $("unit").value = ""; $("unit").disabled = false; $("unit").removeAttribute("aria-invalid");
      $("options").replaceChildren();
      if (q.type === "mc") {
        item.order.forEach(function (choiceIndex, displayIndex) {
          var input = node("input"); input.type = "radio"; input.name = "answer"; input.value = String(choiceIndex);
          input.id = prefix + "-option-" + displayIndex;
          var label = node("label", undefined, prefix + "-option zsa-practice-option"); label.htmlFor = input.id;
          label.appendChild(input); label.appendChild(chemistry(node("span"), local(q.choices[choiceIndex].text)));
          $("options").appendChild(label);
        });
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
      var q = set[index].question, result, chosen;
      $("error").textContent = "";
      if (q.type === "mc") {
        chosen = $("options").querySelector("input:checked");
        if (!chosen) { $("error").textContent = t("Select an answer first."); $("options").querySelector("input").focus(); return; }
        result = {correct:Number(chosen.value) === q.answer};
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
      $("check").disabled = true; $("choices").disabled = true; $("value").disabled = true; $("unit").disabled = true;
      var message = result.correct ? "Correct." : "Incorrect.";
      if (q.type === "numeric" && result.correct && !result.precisionOK) message = q.precision.sf ? "Correct value; check significant figures." : "Correct value; check decimal places.";
      $("feedback").className = "zsa-panel zsa-practice-feedback " + (result.correct ? "is-correct" : "is-wrong");
      $("feedback").appendChild(node("p", t(message)));
      if (q.type === "mc") {
        if (!result.correct) $("feedback").appendChild(chemistry(node("p"), local(q.choices[Number(chosen.value)].why)));
        $("options").querySelectorAll("input").forEach(function (input) {
          if (Number(input.value) === q.answer) input.parentNode.classList.add("is-correct");
          else if (input.checked) input.parentNode.classList.add("is-wrong");
        });
      } else if (q.check) {
        result.notes.forEach(function (note) { $("feedback").appendChild(chemistry(node("p"), local(note))); });
      } else {
        if (!result.unitOK) {
          if (result.valueOK) $("feedback").appendChild(node("p", t("Your value is within tolerance, but the unit is incorrect.")));
          $("feedback").appendChild(node("p", t("The unit is incorrect. Use {unit}.", {unit:unitName(q.unit)})));
        }
        if (!result.precisionOK && !q.precision.exact) $("feedback").appendChild(node("p", q.precision.sf ? t("Use {n} significant figures in your final answer.", {n:q.precision.sf}) : t("Round your final answer to {n} decimal places.", {n:q.precision.decimals})));
      }
      $("feedback").appendChild(correctAnswer(q));
      $("feedback").appendChild(chemistry(node("p"), local(q.explanation)));
      $("feedback").hidden = false;
      $("progress").value = index + 1;
      $("score").textContent = t("{n} of {total} correct", {n:records.filter(function (r) { return r.correct; }).length, total:set.length});
      $("next").textContent = t(index + 1 === set.length ? "See results" : "Next question");
      $("next").hidden = false; $("next").focus();
    });
    function finish() {
      show("results");
      var score = records.filter(function (r) { return r.correct; }).length;
      $("total").textContent = t("{score} of {total} correct ({percent}%).", {score:score, total:set.length, percent:Math.round(score / set.length * 100)});
      $("breakdown").replaceChildren();
      bank.topics.forEach(function (topic) {
        var group = records.filter(function (r) { return r.question.topic === topic.id; });
        if (!group.length) return;
        $("breakdown").appendChild(node("li", local(topic.title) + ": " + group.filter(function (r) { return r.correct; }).length + "/" + group.length));
      });
      $("review").replaceChildren();
      var missed = records.filter(function (r) { return !r.correct; });
      if (missed.length) {
        $("review").appendChild(node("h3", t("Review these questions")));
        missed.forEach(function (record) {
          var q = record.question, details = node("details", undefined, prefix + "-review-item zsa-practice-review-item");
          details.appendChild(chemistry(node("summary"), local(q.prompt)));
          details.appendChild(correctAnswer(q)); details.appendChild(chemistry(node("p"), local(q.explanation)));
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
    $("choose").addEventListener("click", function () { show("setup"); $("topic").focus(); });
  }
}());
