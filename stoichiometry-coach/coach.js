// Stoichiometry Coach: the page. Settings, the problem, the conversion factor bank, the student's setup with unit
// cancellation, answer checking, hints, the worked solution, guided and independent modes, the solved count, deep
// links and the live region. The chemistry and the feedback text are in model.js, reached through a
// "zsa-sc:request-model" event on the root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="stoichiometry-coach"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-sc:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;

  function $(id) { return root.querySelector("#zsa-sc-" + id); }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  var mode = "guided", p = null, chain = [], solved = 0, credited = false, shown = false, checked = false, hints = 0;

  // ---------- Settings ----------
  Object.keys(M.TYPES).forEach(function (key) {
    var o = node("option", "", M.TYPES[key].label);
    o.value = key;
    $("type").appendChild(o);
  });
  M.REACTIONS.forEach(function (r, i) {
    var o = node("option", "", r.from + " → " + r.to);
    o.value = String(i);
    $("reaction").appendChild(o);
  });
  $("type").value = "gg";

  // ---------- Drawing factors ----------
  // A fraction: number and unit over number and unit. Cancelled units are struck through.
  function fraction(f, cancelN, cancelD) {
    var frac = node("span", "zsa-sc-frac");
    [[f.n, f.nu, cancelN], [f.d, f.du, cancelD]].forEach(function (part) {
      var row = node("span", "zsa-sc-frac-part");
      row.appendChild(document.createTextNode(part[0] + " "));
      row.appendChild(node("span", part[2] ? "zsa-sc-u zsa-sc-cancel" : "zsa-sc-u", part[1]));
      frac.appendChild(row);
    });
    return frac;
  }
  function spoken(f) { return f.n + " " + f.nu + " per " + f.d + " " + f.du; }
  function toolButton(text, label, data, disabled) {
    var b = node("button", "zsa-sc-tool", text);
    b.type = "button";
    b.setAttribute("aria-label", label);
    Object.keys(data).forEach(function (k) { b.dataset[k] = data[k]; });
    b.disabled = !!disabled;
    return b;
  }

  // ---------- Rendering ----------
  // focus says where keyboard focus goes after the setup and bank are rebuilt.
  function render(focus) {
    var status = M.inspect(p, chain), show = mode === "guided" || checked;
    var good = 0;
    while (good < status.steps.length && status.steps[good].valid) good++;

    var list = $("chain");
    clear(list);
    var given = node("li", "zsa-sc-given");
    var gv = node("span", "zsa-sc-givenvalue");
    gv.setAttribute("aria-hidden", "true");
    gv.appendChild(document.createTextNode(M.three(p.value) + " "));
    gv.appendChild(node("span", show && good > 0 ? "zsa-sc-u zsa-sc-cancel" : "zsa-sc-u", p.start));
    given.appendChild(gv);
    given.appendChild(node("span", "zsa-sr-only", "Given: " + M.three(p.value) + " " + p.start + (show && good > 0 ? ", " + p.start + " cancels" : "")));
    list.appendChild(given);

    chain.forEach(function (id, i) {
      var f = M.factor(p, id), ok = show && i < good, bad = show && !!status.steps[i] && !status.steps[i].valid;
      var li = node("li", "zsa-sc-factor" + (ok ? " zsa-sc-good" : bad ? " zsa-sc-bad" : ""));
      var times = node("span", "zsa-sc-times", "×");
      times.setAttribute("aria-hidden", "true");
      li.appendChild(times);
      var card = node("div", "zsa-sc-factorcard");
      var frac = fraction(f, show && i + 1 < good, ok);
      frac.setAttribute("aria-hidden", "true");
      card.appendChild(frac);
      card.appendChild(node("span", "zsa-sr-only", "Factor " + (i + 1) + ": " + spoken(f) + (ok ? ". Fits: " + f.du + " cancels." : bad ? ". Does not fit." : ".")));
      if (ok || bad) {
        var mark = node("span", "zsa-sc-mark", ok ? "✓" : "✗");
        mark.setAttribute("aria-hidden", "true");
        card.appendChild(mark);
      }
      var tools = node("div", "zsa-sc-tools");
      tools.appendChild(toolButton("←", "Move factor " + (i + 1) + " left", {move: i, dir: -1}, i === 0));
      tools.appendChild(toolButton("×", "Remove factor " + (i + 1), {remove: i}));
      tools.appendChild(toolButton("→", "Move factor " + (i + 1) + " right", {move: i, dir: 1}, i === chain.length - 1));
      card.appendChild(tools);
      li.appendChild(card);
      list.appendChild(li);
    });
    if (chain.length < p.expected.length) {
      var ph = node("li", "zsa-sc-placeholder");
      var t = node("span", "zsa-sc-times", "×");
      t.setAttribute("aria-hidden", "true");
      ph.appendChild(t);
      ph.appendChild(node("span", "zsa-sc-slot", chain.length ? "Choose your next factor" : "Choose your first factor"));
      list.appendChild(ph);
    }

    var bank = $("bank"), full = chain.length >= p.expected.length;
    clear(bank);
    p.factors.forEach(function (f) {
      var b = node("button", "zsa-sc-choice");
      b.type = "button";
      b.dataset.add = f.id;
      b.disabled = full || chain.indexOf(f.id) >= 0;
      // The name is the factor in words, then the visible "Add factor" or "In your setup".
      var fr = fraction(f);
      fr.setAttribute("aria-hidden", "true");
      b.appendChild(fr);
      b.appendChild(node("span", "zsa-sr-only", spoken(f) + ", "));
      b.appendChild(node("span", "zsa-sc-add", chain.indexOf(f.id) >= 0 ? "In your setup" : "Add factor"));
      bank.appendChild(b);
    });

    var fb = $("feedback");
    if (show && chain.length) {
      fb.hidden = false;
      fb.textContent = status.message;
      fb.className = "zsa-sc-feedback " + (status.valid ? (status.complete ? "zsa-sc-ok" : "zsa-sc-info") : "zsa-sc-error");
    } else fb.hidden = true;
    $("hint").hidden = mode === "independent";
    $("instruction").textContent = mode === "guided" ? "Choose a factor below. Its denominator should match the unit you have." : "Build the complete setup and enter your answer. Feedback appears when you check your work.";
    placeFocus(focus);
  }
  function placeFocus(focus) {
    if (!focus) return;
    var target = null;
    if (focus.kind === "bank") {
      var buttons = Array.prototype.slice.call($("bank").querySelectorAll("button"));
      var after = buttons.slice(focus.index).concat(buttons.slice(0, focus.index)).filter(function (b) { return !b.disabled; });
      target = after[0] || $("input");
    } else if (focus.kind === "move" || focus.kind === "remove") {
      var factors = $("chain").querySelectorAll(".zsa-sc-factor");
      var i = Math.min(focus.index, factors.length - 1);
      if (i >= 0) {
        var tools = factors[i].querySelectorAll("button");
        if (focus.kind === "remove") target = tools[1];
        else target = focus.dir < 0 ? (tools[0].disabled ? tools[2] : tools[0]) : (tools[2].disabled ? tools[0] : tools[2]);
      } else target = $("bank").querySelector("button:not(:disabled)");
    }
    if (target) target.focus();
  }
  function announce(text) {
    var live = $("live");
    live.textContent = "";
    // A fresh node after a tick, so the same words twice are still read.
    window.setTimeout(function () { live.textContent = text; }, 50);
  }
  function setupNews(prefix) {
    var status = M.inspect(p, chain), words = prefix + " Your setup has " + chain.length + " of " + p.expected.length + " factors.";
    if (mode === "guided" && chain.length) words += " " + status.message;
    announce(words);
  }

  // ---------- Problems ----------
  function newProblem() {
    var value = M.VALUES[Math.floor(Math.random() * M.VALUES.length)];
    if (p && value === p.value && p.type === $("type").value && p.index === Number($("reaction").value)) value = M.VALUES[(M.VALUES.indexOf(value) + 1) % M.VALUES.length];
    p = M.makeProblem($("type").value, Number($("reaction").value), value);
    chain = []; credited = false; shown = false; checked = false; hints = 0;
    $("input").value = "";
    ["feedback", "result", "hintbox", "solutionbox"].forEach(function (id) { $(id).hidden = true; });
    $("equation").textContent = p.r.equation;
    $("question").textContent = M.question(p);
    $("context").textContent = M.context(p);
    $("given").textContent = M.three(p.value) + " " + p.start;
    $("target").textContent = p.target;
    $("route").textContent = M.TYPES[p.type].route;
    $("unit").textContent = p.target;
    var dl = $("masses");
    clear(dl);
    [[p.r.from, p.r.mf], [p.r.to, p.r.mt]].forEach(function (m) {
      var row = node("div", "zsa-sc-mass");
      row.appendChild(node("dt", "", m[0]));
      row.appendChild(node("dd", "", m[1] + " g/mol"));
      dl.appendChild(row);
    });
    render();
  }
  function edited(focus) {
    checked = false;
    ["result", "hintbox", "solutionbox"].forEach(function (id) { $(id).hidden = true; });
    render(focus);
  }

  // ---------- Events ----------
  $("bank").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b || b.disabled) return;
    var index = Array.prototype.indexOf.call($("bank").children, b);
    chain.push(b.dataset.add);
    edited({kind: "bank", index: index});
    setupNews("Added " + spoken(M.factor(p, b.dataset.add)) + ".");
  });
  $("chain").addEventListener("click", function (e) {
    var rm = e.target.closest("[data-remove]"), mv = e.target.closest("[data-move]");
    if (rm) {
      var r = Number(rm.dataset.remove), gone = M.factor(p, chain[r]);
      chain.splice(r, 1);
      edited({kind: "remove", index: r});
      setupNews("Removed " + spoken(gone) + ".");
    } else if (mv && !mv.disabled) {
      var i = Number(mv.dataset.move), dir = Number(mv.dataset.dir), j = i + dir, tmp = chain[i];
      chain[i] = chain[j]; chain[j] = tmp;
      edited({kind: "move", index: j, dir: dir});
      setupNews("Moved factor " + (i + 1) + " to position " + (j + 1) + ".");
    }
  });
  $("clear").addEventListener("click", function () {
    chain = [];
    $("input").value = "";
    edited();
    announce("Setup cleared. Choose your first factor.");
  });
  $("type").addEventListener("change", newProblem);
  $("reaction").addEventListener("change", newProblem);
  ["new", "next"].forEach(function (id) {
    $(id).addEventListener("click", function () { newProblem(); announce("New problem. " + M.question(p)); });
  });

  function setMode(m) {
    mode = m;
    checked = false;
    ["guided", "independent"].forEach(function (id) { $(id).setAttribute("aria-pressed", String(id === m)); });
    $("mode-note").textContent = m === "guided" ? "Feedback after each step" : "Try the full problem before checking";
    $("hintbox").hidden = true;
    $("result").hidden = true;
    render();
  }
  $("guided").addEventListener("click", function () { setMode("guided"); announce("Guided practice. Feedback after each step."); });
  $("independent").addEventListener("click", function () { setMode("independent"); announce("Independent practice. Feedback appears when you check your work."); });

  function showResult(text, ok) {
    var box = $("result");
    box.hidden = false;
    box.textContent = (ok ? "✓ " : "") + text;
    box.className = "zsa-sc-feedback " + (ok ? "zsa-sc-ok" : "zsa-sc-error");
    announce(text);
  }
  $("check").addEventListener("click", function () {
    checked = true;
    render();
    var status = M.inspect(p, chain);
    if (!status.valid || !status.complete) { showResult(chain.length ? status.message : "Build your setup first. Choose a factor whose denominator is " + p.start + ".", false); return; }
    var result = M.checkAnswer(p, $("input").value);
    var text = result.message + (result.ok && shown ? " This problem was completed with the worked solution visible, so it does not add to your solved count." : "");
    if (result.ok && !credited && !shown) {
      solved++;
      credited = true;
      $("solved").textContent = String(solved);
      text += " Solved this session: " + solved + ".";
    }
    showResult(text, result.ok);
  });
  $("input").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("check").click(); } });
  $("input").addEventListener("input", function () { $("result").hidden = true; });

  $("hint").addEventListener("click", function () {
    hints++;
    var box = $("hintbox");
    box.textContent = M.hint(p, chain, hints);
    box.hidden = false;
    announce("Hint: " + box.textContent);
  });

  $("solution").addEventListener("click", function () {
    shown = true;
    var box = $("solutionbox"), fs = p.expected.map(function (id) { return M.factor(p, id); });
    clear(box);
    box.appendChild(node("h3", "", "Worked solution"));
    box.appendChild(node("p", "", "Follow the units from " + p.start + " to " + p.target + "."));
    var line = node("div", "zsa-sc-solution-chain");
    line.setAttribute("aria-hidden", "true");
    line.appendChild(node("strong", "", M.three(p.value) + " " + p.start));
    fs.forEach(function (f) { line.appendChild(node("span", "zsa-sc-times", "×")); line.appendChild(fraction(f)); });
    line.appendChild(node("span", "zsa-sc-times", "="));
    line.appendChild(node("strong", "", M.three(p.answer) + " " + p.target));
    box.appendChild(line);
    box.appendChild(node("p", "zsa-sr-only", M.three(p.value) + " " + p.start + " × " + fs.map(spoken).join(" × ") + " = " + M.three(p.answer) + " " + p.target));
    var ol = node("ol");
    M.solutionSteps(p).forEach(function (s) { ol.appendChild(node("li", "", s)); });
    box.appendChild(ol);
    var final = node("p", "", "Unrounded: " + p.answer.toPrecision(9) + " " + p.target + ". Final answer: ");
    final.appendChild(node("strong", "", M.three(p.answer) + " " + p.target));
    final.appendChild(document.createTextNode(" (three significant figures)."));
    box.appendChild(final);
    box.appendChild(node("p", "zsa-sc-small", "This is a learning example. It will not add to your solved count. Choose Next problem for a fresh attempt."));
    box.hidden = false;
    box.focus();
  });

  // ---------- Deep links and the back link ----------
  var params = new URLSearchParams(window.location.search);
  (function () {
    var raw = params.get("from");
    if (!raw) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      $("back").href = u.href;
    } catch (err) { /* not a URL: keep the default link */ }
  }());
  var linkType = params.get("type"), linkReaction = params.get("reaction");
  if (linkType && M.TYPES[linkType]) $("type").value = linkType;
  M.REACTIONS.forEach(function (r, i) { if (linkReaction === r.id) $("reaction").value = String(i); });
  newProblem();
  if (params.get("mode") === "independent") setMode("independent");
}());
