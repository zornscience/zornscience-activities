// Reusable, in-memory lab questions. Activities supply localized data and a setup callback.
(function () {
  "use strict";
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }
  function shuffled(choices) {
    var out = choices.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), old = out[i]; out[i] = out[j]; out[j] = old;
    }
    return out;
  }
  function create(root, options) {
    var ui = options.labels, questions = options.questions, codes;
    root.dispatchEvent(new CustomEvent("zsa:request-codes", {detail: {receive: function (api) { codes = api; }}}));
    var section = node("details", "zsa-labcheck"), summary = node("summary");
    var caption = node("span", "", ui.title), progress = node("span", "zsa-labcheck-progress");
    summary.append(caption, progress); section.appendChild(summary);
    var body = node("div", "zsa-labcheck-body"), live = node("p", "zsa-sr-only");
    live.setAttribute("role", "status"); live.setAttribute("aria-atomic", "true");
    section.append(body, live); options.mount.appendChild(section);
    var index = 0, entries, completion = null;
    function reset() {
      entries = questions.map(function () { return {tries: 0, done: false, shown: false, choice: null, feedback: ""}; });
      index = 0; completion = null;
    }
    function button(text, action) {
      var b = node("button", "zsa-btn", text); b.type = "button"; b.addEventListener("click", action); return b;
    }
    function announce(text) { live.textContent = text; }
    function updateProgress() { progress.textContent = fill(ui.progress, {current: index + 1, total: questions.length}); }
    function result() {
      if (!entries.every(function (e) { return e.done; })) return null;
      var totals = {}, results = {}, score = 0, show = 0;
      questions.forEach(function (q, i) {
        var e = entries[i], first = !e.shown && e.tries === 1;
        totals[q.id] = 1; results[q.id] = first ? 1 : 0; score += results[q.id]; if (e.shown) show++;
      });
      if (!completion) completion = {score: score, code: codes && codes.encode({activity: options.activity, version: options.version,
        day: codes.dayNumber(new Date()), items: questions.length, totals: totals, results: results, show: show, hints: 0})};
      return completion;
    }
    function render(focus) {
      updateProgress(); body.replaceChildren();
      if (!section.open) return;
      var q = questions[index], e = entries[index];
      var title = node("h2", "", q.title); title.tabIndex = -1;
      body.append(title, button(ui.setupButton, function () { options.setup(q); announce(ui.setupDone); }));
      var field = node("fieldset", "zsa-labcheck-choices"), legend = node("legend", "", q.question);
      field.appendChild(legend);
      var order = shuffled(q.choices), selected = null;
      order.forEach(function (choice, i) {
        var label = node("label", "zsa-labcheck-choice"), radio = node("input");
        radio.type = "radio"; radio.name = options.activity + "-question"; radio.value = String(i); radio.disabled = e.done;
        radio.checked = e.done && choice[0] === e.choice;
        radio.addEventListener("change", function () { selected = choice; check.disabled = false; });
        label.append(radio, node("span", "", choice[1]));
        if (e.done && choice[2] === null) label.appendChild(node("strong", "", ui.correctChoice));
        field.appendChild(label);
      });
      body.appendChild(field);
      var feedback = node("p", "zsa-labcheck-feedback", e.feedback);
      feedback.setAttribute("role", "status"); feedback.setAttribute("aria-atomic", "true");
      var check = button(ui.check, function () {
        if (!selected || e.done) return;
        e.tries++; e.choice = selected[0];
        if (selected[2] === null) {
          e.done = true; e.feedback = fill(ui.correct, {explanation: q.explanation}); render(true); announce(e.feedback);
        } else {
          e.feedback = fill(ui.retry, {feedback: q.feedback[selected[2]]}); feedback.textContent = e.feedback;
          show.hidden = e.tries < 2;
        }
      });
      check.disabled = true; check.hidden = e.done;
      var show = button(ui.show, function () {
        if (e.done || e.tries < 2) return;
        e.done = true; e.shown = true; e.choice = q.choices.filter(function (c) { return c[2] === null; })[0][0];
        e.feedback = fill(ui.shown, {explanation: q.explanation}); render(true); announce(e.feedback);
      });
      show.hidden = e.done || e.tries < 2;
      var actions = node("div", "zsa-labcheck-actions"); actions.append(check, show);
      body.append(actions, feedback);
      var nav = node("div", "zsa-labcheck-actions");
      var previous = button(ui.previous, function () { index--; render(true); announce(progress.textContent); }); previous.disabled = index === 0;
      var next = button(ui.next, function () { index++; render(true); announce(progress.textContent); }); next.disabled = index === questions.length - 1;
      nav.append(previous, next, button(ui.restart, function () { reset(); render(true); announce(ui.restarted); })); body.appendChild(nav);
      var complete = result();
      if (complete) {
        var output = node("section", "zsa-labcheck-completion");
        output.setAttribute("aria-label", ui.completion);
        output.appendChild(node("p", "", fill(ui.score, {score: complete.score, total: questions.length})));
        if (complete.code) {
          var label = node("label", "", ui.completion), input = node("input", "zsa-labcheck-code");
          input.id = options.activity + "-code"; input.readOnly = true; input.value = complete.code; input.spellcheck = false;
          input.setAttribute("aria-label", ui.completion); label.htmlFor = input.id;
          input.addEventListener("focus", function () { input.select(); }); output.append(label, input, node("p", "", ui.codeNote));
        }
        body.appendChild(output);
      }
      if (focus) title.focus();
    }
    reset(); updateProgress();
    section.addEventListener("toggle", function () { render(false); });
    section.open = !!options.open;
    return {section: section};
  }
  document.querySelectorAll("[data-zsa-activity]").forEach(function (root) {
    root.addEventListener("zsa:request-labcheck", function (event) { event.detail.receive({create: create}); });
  });
}());
