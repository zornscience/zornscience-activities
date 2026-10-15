(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ionic-formula-builder"]');
  if (!root) return;
  var data;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (value) {data = value;}}}));
  if (!data) return;
  var ui = data.ui;
  var work = root.querySelector("#zsa-ifb-work");
  var strip = root.querySelector("#zsa-ifb-compound");
  var live = root.querySelector("#zsa-ifb-live");
  var select = root.querySelector("#zsa-ifb-select");
  var dirSelect = root.querySelector("#zsa-ifb-direction");
  var options = root.querySelector("#zsa-ifb-options");
  var cations = {}, anions = {};
  data.cations.forEach(function (c) {cations[c.symbol] = c;});
  data.anions.forEach(function (a) {anions[a.symbol] = a;});
  // queue items: {compound, dir: "n2f" (name to formula) or "f2n" (formula to name), review}
  var queue = [], position = 0, originalCount = 10, extra = 0, roundType = "mixed";
  var item, current, step, mistakes, hints, attempts, results, totals, misses, missDirs, scheduled;
  // trail: one entry per finished step of the current compound; lastFeedback: the explanation for the step just finished.
  // chargesKnown: the charges step is done, so the table shows both charges above their group columns.
  var trail = [], lastFeedback = null, chargesKnown = false;
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function button(text, callback, primary) {
    var el = node("button", "zsa-btn" + (primary ? " zsa-btn--primary" : ""), text);
    el.type = "button";
    el.addEventListener("click", callback);
    return el;
  }
  function cap(s) {return s.charAt(0).toUpperCase() + s.slice(1);}
  function announce(text) {live.textContent = text;}
  function shuffle(items) {
    var list = items.slice();
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var value = list[i]; list[i] = list[j]; list[j] = value;
    }
    return list;
  }
  // Charges are written number first with a true minus sign: 2+, 3−.
  function chargeLabel(n) {return Math.abs(n) + (n > 0 ? "+" : "−");}
  function ionsOf(cp) {return {m:cations[cp.cation], x:anions[cp.anion]};}

  // Rich text: templates hold {key} slots. A slot is plain text or a token {visual(), spoken} that shows
  // one thing (a formula with real subscripts, a charge sum) and gives screen readers a spoken version.
  function visualToken(build, spoken) {return {visual:build, spoken:spoken};}
  // The one formula helper: visible formula is aria-hidden, the spoken form reads like "Al 2 O 3, aluminum oxide".
  // A null subscript shows as "?" while the student is still building the formula.
  function formulaToken(cp, sub, withName) {
    var spoken = [], parts = cp.parts;
    function build() {
      var f = node("span", "zsa-ifb-formula");
      parts.forEach(function (symbol, i) {
        f.appendChild(document.createTextNode(symbol));
        if (sub[i] === null) f.appendChild(node("sub", "zsa-ifb-unknown", ui.unknown));
        else if (sub[i] > 1) f.appendChild(node("sub", "", String(sub[i])));
      });
      return f;
    }
    parts.forEach(function (symbol, i) {
      spoken.push(symbol);
      if (sub[i] === null) spoken.push(ui.unknownSpoken);
      else if (sub[i] > 1) spoken.push(String(sub[i]));
    });
    return visualToken(build, spoken.join(" ") + (withName ? ", " + cp.name : ""));
  }
  // Charge sum such as "2(+3) + 3(−2) = 0" or "(+2) + (−1) = +1, not 0". Leaves off the total while a count is missing.
  function sumToken(c, q, a, b) {
    function term(n, charge) {return (n === null ? ui.unknown : n === 1 ? "" : n) + "(" + (charge > 0 ? "+" : "−") + Math.abs(charge) + ")";}
    function say(n, charge) {return (n === null ? ui.unknownSpoken + " " + ui.spokenTimes + " " : n === 1 ? "" : n + " " + ui.spokenTimes + " ") + (charge > 0 ? ui.spokenPlus : ui.spokenMinus) + " " + Math.abs(charge);}
    var text = term(a, c) + " + " + term(b, -q), spoken = say(a, c) + ", " + ui.spokenPlus + " " + say(b, -q);
    if (a !== null && b !== null) {
      var total = a * c - b * q;
      text += " = " + (total === 0 ? "0" : (total > 0 ? "+" : "−") + Math.abs(total) + ", " + ui.notZero);
      spoken += ", " + ui.spokenEquals + " " + (total === 0 ? "0" : (total > 0 ? ui.spokenPlus : ui.spokenMinus) + " " + Math.abs(total) + ", " + ui.notZero);
    }
    return visualToken(function () {return node("span", "zsa-ifb-sum", text);}, spoken);
  }
  function plural(n) {return n + " " + (n === 1 ? ui.electron : ui.electrons);}
  // Every slot a template can use for one compound.
  function context(cp, extra) {
    var ions = ionsOf(cp), c = ions.m.charge, q = -ions.x.charge;
    var ctx = {
      M:ions.m.symbol, X:ions.x.symbol, metal:ions.m.name, nonmetal:ions.x.element, ion:ions.x.name, root:ions.x.root,
      mg:String(ions.m.group), xg:String(ions.x.group), c:String(c), q:String(q),
      cLabel:chargeLabel(c), qLabel:chargeLabel(-q), cElectrons:plural(c), qElectrons:plural(q), name:cp.name,
      formula:formulaToken(cp, cp.subscripts, false), formulaNamed:formulaToken(cp, cp.subscripts, true),
      crossed:formulaToken(cp, cp.crossed, false), sum:sumToken(c, q, cp.subscripts[0], cp.subscripts[1])
    };
    if (extra) Object.keys(extra).forEach(function (k) {ctx[k] = extra[k];});
    return ctx;
  }
  // Fill a template into a list of strings and tokens. {Metal} is the {metal} slot with a capital letter.
  function fill(template, ctx) {
    var out = [];
    template.split(/(\{\w+\})/).forEach(function (piece) {
      var m = /^\{(\w+)\}$/.exec(piece);
      if (!m) {if (piece) out.push(piece); return;}
      var key = m[1], value = ctx[key];
      if (value === undefined) value = cap(ctx[key.charAt(0).toLowerCase() + key.slice(1)]);
      out.push(value);
    });
    return out;
  }
  function join(lists) {
    var out = [];
    lists.forEach(function (list, i) {if (i) out.push(" "); out.push.apply(out, list);});
    return out;
  }
  function render(el, segments) {
    segments.forEach(function (seg) {
      if (typeof seg === "string") {el.appendChild(document.createTextNode(seg)); return;}
      var wrap = node("span", "zsa-ifb-token"), visual = seg.visual();
      visual.setAttribute("aria-hidden", "true");
      wrap.appendChild(visual); wrap.appendChild(node("span", "zsa-sr-only", seg.spoken));
      el.appendChild(wrap);
    });
    return el;
  }
  function speak(segments) {return segments.map(function (seg) {return typeof seg === "string" ? seg : seg.spoken;}).join("");}

  // Round building: 10 compounds, 6 name to formula and 4 formula to name in mixed order. At least 3 have equal
  // charges (2 of them need reducing and are asked name to formula) and at least 2 contain aluminum.
  function isEqual(cp) {return cations[cp.cation].charge === -anions[cp.anion].charge;}
  function needsReduce(cp) {return cp.crossed[0] !== cp.subscripts[0];}
  function mixed() {
    var chosen = [];
    function has(cp) {return chosen.some(function (it) {return it.compound === cp;});}
    function add(test, n, dir) {
      shuffle(data.compounds.filter(function (cp) {return test(cp) && !has(cp);})).slice(0, n).forEach(function (cp) {chosen.push({compound:cp, dir:dir});});
    }
    function count(test) {return chosen.filter(function (it) {return test(it.compound);}).length;}
    function hasAl(cp) {return cp.cation === "Al";}
    add(needsReduce, 2, "n2f");
    add(hasAl, Math.max(0, 2 - count(hasAl)), null);
    add(isEqual, Math.max(0, 3 - count(isEqual)), null);
    add(function () {return true;}, 10 - chosen.length, null);
    var open = shuffle(chosen.filter(function (it) {return !it.dir;}));
    var n2f = 6 - chosen.filter(function (it) {return it.dir === "n2f";}).length;
    open.forEach(function (it, i) {it.dir = i < n2f ? "n2f" : "f2n";});
    return shuffle(chosen);
  }
  function start(items, type, quiet) {
    queue = items.map(function (it) {return {compound:it.compound, dir:it.dir, review:false};});
    originalCount = items.length; position = 0; extra = 0; roundType = type;
    results = {n2f:[0,0], f2n:[0,0]}; totals = {n2f:0, f2n:0};
    items.forEach(function (it) {totals[it.dir]++;});
    misses = new Set(); missDirs = {}; scheduled = new Set();
    if (options) options.open = false;
    load(quiet);
  }
  function remember() {misses.add(current.formula); missDirs[current.formula] = item.dir;}
  function schedule() {
    remember();
    if (roundType === "single" || item.review || extra >= 3 || scheduled.has(current.formula)) return;
    // At least two intervening compounds, including for misses near the round's end.
    var target = Math.max(queue.length, position + 3);
    if (target - queue.length + 1 > 3 - extra) return;
    var used = new Set(queue.map(function (q) {return q.compound.formula;}));
    var fillers = shuffle(data.compounds.filter(function (cp) {return !used.has(cp.formula);}));
    while (queue.length < target) {queue.push({compound:fillers.pop(), dir:Math.random() < 0.5 ? "n2f" : "f2n", review:true}); extra++;}
    queue.push({compound:current, dir:item.dir, review:true}); extra++; scheduled.add(current.formula);
  }

  // The table is always shown. Both elements of the compound are always marked; a charges hint also highlights
  // their group columns, and once the charges step is done each ion's charge sits above its group column.
  function table(hintGroups) {
    var holder = root.querySelector("#zsa-ifb-table"); holder.replaceChildren();
    var ions = current ? ionsOf(current) : null;
    var marked = ions ? [ions.m.symbol, ions.x.symbol] : [];
    var charges = {};
    if (ions && chargesKnown) {charges[ions.m.group] = ions.m.charge; charges[ions.x.group] = ions.x.charge;}
    var lit = hintGroups || [];
    var t = node("table", "zsa-ifb-table");
    t.setAttribute("aria-describedby", "zsa-ifb-table-note");
    t.appendChild(node("caption", "", data.tableCaption));
    var head = node("thead"), row = node("tr");
    var period = node("th", "", data.periodLabel); period.scope = "col"; row.appendChild(period);
    data.groups.forEach(function (g) {
      var th = node("th", lit.indexOf(g) >= 0 ? "zsa-ifb-highlight" : ""); th.scope = "col";
      // The charge line is always there (empty until known) so the table never changes height.
      var mark = node("span", "zsa-ifb-colcharge", charges[g] ? chargeLabel(charges[g]) : "");
      mark.setAttribute("aria-hidden", "true");
      th.appendChild(mark); th.appendChild(document.createTextNode(String(g)));
      if (charges[g]) th.appendChild(node("span", "zsa-sr-only", ", " + ui.chargeMark + " " + chargeLabel(charges[g])));
      if (lit.indexOf(g) >= 0) th.appendChild(node("span", "zsa-sr-only", ui.hintMark));
      row.appendChild(th);
    });
    head.appendChild(row); t.appendChild(head);
    var body = node("tbody");
    data.table.forEach(function (symbols, index) {
      var r = node("tr"), th = node("th", "", String(index + 1)); th.scope = "row"; r.appendChild(th);
      symbols.forEach(function (symbol, col) {
        var cls = lit.indexOf(data.groups[col]) >= 0 ? "zsa-ifb-highlight" : "";
        var isCurrent = symbol && marked.indexOf(symbol) >= 0;
        if (isCurrent) cls += " zsa-ifb-current";
        var td = node("td", cls.trim(), symbol);
        if (isCurrent) td.appendChild(node("span", "zsa-sr-only", ui.currentMark));
        r.appendChild(td);
      });
      body.appendChild(r);
    });
    t.appendChild(body); holder.appendChild(t);
  }
  function load(quiet) {
    if (position >= queue.length) {finish(); return;}
    item = queue[position]; current = item.compound; step = 0;
    mistakes = [0,0]; hints = [0,0]; attempts = [0,0];
    trail = []; lastFeedback = null; chargesKnown = false;
    announce("");
    strip.replaceChildren();
    var line = node("div", "zsa-ifb-compound-line");
    var heading = node("h2", "zsa-ifb-compound-title");
    // Name to formula shows the name; formula to name shows the formula without saying its name.
    if (item.dir === "n2f") heading.textContent = cap(current.name);
    else render(heading, [formulaToken(current, current.subscripts, false)]);
    heading.id = "zsa-ifb-compound-heading"; heading.tabIndex = -1; line.appendChild(heading);
    line.appendChild(node("p", "zsa-ifb-caption", ui.captions[item.dir])); strip.appendChild(line);
    var progress = node("p", "zsa-ifb-progress"); progress.id = "zsa-ifb-progress"; strip.appendChild(progress);
    table(); renderStep();
    // No focus move on the first automatic load: it would skip the page title and, when embedded, scroll the host page.
    if (!quiet) {anchor(); heading.focus({preventScroll:true});}
  }
  // On narrow screens, line the compound strip up with the top of the screen when the step would not fit,
  // so the table and the whole step stay in view without manual scrolling. Never in embed mode (it would scroll the host page).
  var narrow = window.matchMedia("(max-width: 899px)");
  function anchor() {
    if (!narrow.matches || root.classList.contains("zsa--embedded")) return;
    var main = work.querySelector(".zsa-ifb-step .zsa-ifb-actions, .zsa-ifb-summary .zsa-btn");
    var stripTop = strip.getBoundingClientRect().top;
    if (stripTop < 0 || (main && main.getBoundingClientRect().bottom > window.innerHeight)) strip.scrollIntoView({block:"start"});
  }
  function progressText() {
    var prefix = roundType === "single" ? ui.singleLabel : (item.review ? ui.reviewLabel : ui.itemLabel);
    return prefix + " " + (position + 1) + " " + ui.of + " " + queue.length + " · " + ui.stepLabel + " " + Math.min(step + 1, 2) + " " + ui.of + " 2";
  }
  function trailSegments(s) {
    var key = s === 0 ? "charges" : item.dir === "n2f" ? "formula" : "name";
    return fill(ui.trail[key], context(current));
  }
  // Progress (in the compound strip), the answers already given for this compound, and the explanation for the last step.
  function header(showLast) {
    root.querySelector("#zsa-ifb-progress").textContent = progressText();
    if (trail.length) {
      var list = node("ul", "zsa-ifb-trail"); list.setAttribute("aria-label", ui.trailLabel);
      trail.forEach(function (t) {
        var li = node("li", t.reveal ? "zsa-ifb-trail--shown" : "");
        var icon = node("span", "", t.reveal ? "→ " : "✓ "); icon.setAttribute("aria-hidden", "true");
        li.appendChild(icon); li.appendChild(node("span", "zsa-sr-only", t.reveal ? ui.shownMark : ui.correctMark));
        render(li, t.segments); list.appendChild(li);
      });
      work.appendChild(list);
    }
    if (showLast && lastFeedback) {
      work.appendChild(render(node("p", "zsa-ifb-feedback zsa-ifb-last " + (lastFeedback.reveal ? "zsa-ifb-feedback--shown" : "zsa-ifb-feedback--correct")), lastFeedback.segments));
    }
  }
  // Answer choices are buttons: a click, tap, Enter or Space picks one and the step checks itself as soon as
  // every part is picked. Arrow keys, Home and End only move focus within the group (one Tab stop per group),
  // so moving through the choices never submits an answer by accident.
  function choices(field, values, name, modifier, onPick) {
    var grid = node("div", "zsa-ifb-choices zsa-ifb-choices--" + modifier);
    grid.setAttribute("data-zsa-part", name);
    values.forEach(function (pair, i) {
      var b = node("button", "zsa-ifb-choice", String(pair[1]));
      b.type = "button"; b.id = "zsa-ifb-" + name + "-" + i; b.value = String(pair[0]); b.tabIndex = i === 0 ? 0 : -1;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {if (b.getAttribute("aria-disabled") !== "true") onPick(name, b);});
      grid.appendChild(b);
    });
    grid.addEventListener("keydown", function (ev) {
      var list = [].slice.call(grid.querySelectorAll(".zsa-ifb-choice")), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      var n = {ArrowRight:i + 1, ArrowDown:i + 1, ArrowLeft:i - 1, ArrowUp:i - 1, Home:0, End:list.length - 1}[ev.key];
      if (n === undefined) return;
      ev.preventDefault(); n = (n + list.length) % list.length;
      list.forEach(function (x, k) {x.tabIndex = k === n ? 0 : -1;}); list[n].focus();
    });
    field.appendChild(grid);
  }
  function sub(field, legend) {
    var f = node("fieldset", "zsa-ifb-sub"); f.appendChild(node("legend", "", legend)); field.appendChild(f); return f;
  }
  // Which feedback applies to an answer. Returns null when right, otherwise {keys, wrong (the parts to clear), extra slots}.
  // Charges: picks are signed numbers. Subscripts: counts. Name: the chosen name.
  function classify(cp, dir, s, picks) {
    var ions = ionsOf(cp), c = ions.m.charge, q = -ions.x.charge, sub = cp.subscripts;
    if (s === 0) {
      var keys = [], wrong = [];
      [["metal", c, 0, "metalCharge"], ["nonmetal", -q, 1, "nonmetalCharge"]].forEach(function (p) {
        var v = picks[p[0]];
        if (v === p[1]) return;
        wrong.push(p[0]);
        // Formula to name: a charge equal to that ion's own subscript means the subscript was read as a charge.
        if (dir === "f2n" && Math.abs(v) === sub[p[2]]) {
          if (keys.indexOf("misread") < 0) keys.push("misread");
          if (sub[p[2]] === 1 && keys.indexOf("misreadOne") < 0) keys.push("misreadOne");
        } else keys.push(p[3]);
      });
      // Order: misread, its missing-subscript note, then the group messages. The group rule is stated once,
      // and not at all when the misread message (which already says it) is shown.
      var order = ["misread", "misreadOne", "metalCharge", "nonmetalCharge"];
      keys.sort(function (a, b) {return order.indexOf(a) - order.indexOf(b);});
      if (keys[0] !== "misread") keys.unshift("groupRule");
      return wrong.length ? {keys:keys, wrong:wrong, extra:{}} : null;
    }
    if (dir === "f2n") {
      var n = picks.name;
      if (n === cp.name) return null;
      return {keys:[n === cp.prefixName ? "prefix" : n === cp.elementName ? "noIde" : "reversed"], wrong:["name"], extra:{}};
    }
    var a = picks.msub, b = picks.xsub, x = sub[0], y = sub[1];
    if (a === x && b === y) return null;
    var key;
    if (a * c === b * q) key = "reduce"; // balanced but not the lowest ratio
    else if (a === 1 && b === 1) key = "oneEach";
    else if ((a === y && b === x) || (a === c && b === q)) key = "swap"; // swapped, or each ion's own charge as its own subscript
    else key = "sum";
    return {keys:[key], wrong:(a !== x ? ["msub"] : []).concat(b !== y ? ["xsub"] : []),
      extra:{a:String(a), b:String(b), x:String(x), y:String(y), tried:sumToken(c, q, a, b)}};
  }
  function renderStep() {
    var s = step, dir = item.dir, ions = ionsOf(current);
    work.replaceChildren(); header(true);
    var field = node("fieldset", "zsa-ifb-step"); field.id = "zsa-ifb-step-" + s;
    // The question itself is the group's label, which saves a line over a separate step title.
    field.appendChild(node("legend", "", (s + 1) + ". " + ui.questions[dir][s]));
    var ctx = context(current), legends = ui.partLegends[dir][s].map(function (l) {return speak(fill(l, ctx));});
    // Parts that must be picked before the step checks itself.
    var parts = s === 0 ? ["metal", "nonmetal"] : dir === "n2f" ? ["msub", "xsub"] : ["name"], picked = {};
    var build = null;
    function onPick(name, btn) {
      [].forEach.call(btn.parentNode.querySelectorAll(".zsa-ifb-choice"), function (x) {x.setAttribute("aria-pressed", String(x === btn));});
      picked[name] = btn;
      if (build) showBuild(value("msub"), value("xsub"));
      if (parts.every(function (p) {return picked[p];})) evaluate();
    }
    function value(p) {return picked[p] ? Number(picked[p].value) : null;}
    if (s === 0) {
      var pair = node("div", "zsa-ifb-pair"); field.appendChild(pair);
      choices(sub(pair, legends[0]), [1,2,3].map(function (n) {return [n, chargeLabel(n)];}), "metal", "n3", onPick);
      choices(sub(pair, legends[1]), [-1,-2,-3].map(function (n) {return [n, chargeLabel(n)];}), "nonmetal", "n3", onPick);
    } else if (dir === "n2f") {
      // The formula builds as the counts are picked, with a live check of the total charge.
      build = node("div", "zsa-ifb-build"); field.appendChild(build);
      var pair2 = node("div", "zsa-ifb-pair"); field.appendChild(pair2);
      choices(sub(pair2, legends[0]), [1,2,3].map(function (n) {return [n, n];}), "msub", "n3", onPick);
      choices(sub(pair2, legends[1]), [1,2,3].map(function (n) {return [n, n];}), "xsub", "n3", onPick);
    } else {
      choices(field, shuffle([current.name, current.prefixName, current.elementName, current.reversedName]).map(function (n) {return [n, n];}), "name", "names", onPick);
    }
    function showBuild(a, b) {
      build.replaceChildren();
      build.appendChild(node("span", "zsa-sr-only", ui.buildLabel + ": "));
      render(build, [formulaToken(current, [a, b], false)]);
      render(build, [sumToken(ions.m.charge, -ions.x.charge, a, b)]);
    }
    if (build) showBuild(null, null);
    // Hint and Show me sit right under the choices; feedback and hints appear below them.
    var actions = node("div", "zsa-ifb-actions");
    var feedback = node("p", "zsa-ifb-feedback"); feedback.hidden = true;
    var hintBox = node("p", "zsa-panel zsa-ifb-hint"); hintBox.hidden = true;
    function evaluate() {
      var picks = {};
      parts.forEach(function (p) {picks[p] = p === "name" ? picked[p].value : Number(picked[p].value);});
      attempts[s]++;
      var result = classify(current, dir, s, picks);
      if (!result) {complete(false); return;}
      // Keep the tried formula and its charge sum on screen until the next pick.
      if (build) showBuild(picks.msub, picks.xsub);
      // Mark each wrong pick as tried (it can't be picked again) and clear it; a right part stays picked.
      result.wrong.forEach(function (p) {
        var x = picked[p]; x.classList.add("zsa-ifb-tried"); x.setAttribute("aria-pressed", "false"); x.setAttribute("aria-disabled", "true");
        x.appendChild(node("span", "zsa-sr-only", ui.triedMark)); delete picked[p];
      });
      remember(); mistakes[s]++; if (mistakes[s] >= 2) {show.hidden = false; schedule();}
      var ctx2 = context(current, result.extra);
      showFeedback([ui.wrong].concat(join(result.keys.map(function (k) {return fill(ui.feedback[k], ctx2);}))));
    }
    var hint = button(ui.hint, function () {
      if (hint.getAttribute("aria-disabled") === "true") return;
      var h = ui.hints[dir][s][hints[s]];
      if (typeof h !== "string") h = h[chargeType()];
      hintBox.hidden = false; hintBox.replaceChildren(); render(hintBox, fill(h, ctx));
      announce(ui.hintPrefix + speak(fill(h, ctx))); hints[s]++;
      if (s === 0) table([ions.m.group, ions.x.group]);
      // aria-disabled keeps keyboard focus on the button; a disabled button would drop focus to the page.
      hint.textContent = hints[s] === 1 ? ui.hint2 : ui.hintsDone; if (hints[s] >= 2) hint.setAttribute("aria-disabled", "true");
      bringIntoView(hintBox); // last, after every change that can shift the layout
    });
    var show = button(ui.show, function () {complete(true);}); show.hidden = true;
    actions.appendChild(hint); actions.appendChild(show);
    field.appendChild(actions); field.appendChild(feedback); field.appendChild(hintBox); work.appendChild(field);
    function showFeedback(segments) {
      feedback.hidden = false; feedback.className = "zsa-ifb-feedback zsa-ifb-feedback--wrong";
      feedback.replaceChildren(); render(feedback, segments); announce(speak(segments)); bringIntoView(feedback);
    }
    function complete(reveal) {
      if (!reveal && attempts[s] === 1 && !item.review) results[dir][s]++;
      if (reveal) schedule();
      trail.push({segments:trailSegments(s), reveal:reveal});
      lastFeedback = {segments:[reveal ? ui.revealed : ui.correctPrefix].concat(correctSegments(s)), reveal:reveal};
      announce(speak(lastFeedback.segments));
      if (s === 0) {chargesKnown = true; table();} // clear the hint columns and show both charges
      step++;
      if (step < 2) {renderStep(); anchor(); work.querySelector("#zsa-ifb-step-" + step + " .zsa-ifb-choice").focus({preventScroll:true});}
      else summary();
    }
  }
  // "cross" when the charges differ, "one" for 1+ with 1−, "reduce" for equal charges above 1.
  function chargeType() {
    var c = cations[current.cation].charge, q = -anions[current.anion].charge;
    return c !== q ? "cross" : c === 1 ? "one" : "reduce";
  }
  function correctSegments(s) {
    var t = ui.correct[item.dir][s], type = "";
    if (typeof t !== "string") {type = chargeType(); t = t[type];}
    var out = fill(t, context(current));
    if (type === "cross" && current.subscripts.indexOf(1) >= 0) out = join([out, [ui.noOne]]);
    return out;
  }
  function summary() {
    work.replaceChildren(); header(false);
    var card = node("section", "zsa-card zsa-ifb-summary"); var title = node("h3", "", ui.complete); title.tabIndex = -1; card.appendChild(title);
    var row = node("div", "zsa-ifb-summary-row");
    row.appendChild(render(node("p", "zsa-ifb-big"), [formulaToken(current, current.subscripts, false)]));
    row.appendChild(render(node("p"), fill(ui.summary, context(current)))); card.appendChild(row);
    card.appendChild(button(position + 1 === queue.length ? data.finishLabel : ui.next, function () {position++; load();}, true));
    work.appendChild(card); anchor(); title.focus({preventScroll:true});
  }
  // Bring new feedback or a hint into view if it landed below the bottom of the screen (no-op in embed mode).
  function bringIntoView(el) {
    if (root.classList.contains("zsa--embedded")) return;
    if (el.getBoundingClientRect().bottom > window.innerHeight) el.scrollIntoView({block:"nearest"});
  }
  function finish() {
    current = null; strip.replaceChildren(); chargesKnown = false; table();
    work.replaceChildren(); var heading = node("h2", "zsa-ifb-finish-title", roundType === "single" ? ui.singleDone : ui.roundComplete); heading.tabIndex = -1; work.appendChild(heading);
    work.appendChild(node("p", "zsa-ifb-note", ui.firstTry));
    ui.stepNames.forEach(function (entry) {
      var total = totals[entry[0]]; if (!total) return; // only directions that were in the round
      var line = node("div", "zsa-ifb-stat"); line.appendChild(node("span", "", entry[2])); line.appendChild(node("strong", "", results[entry[0]][entry[1]] + " / " + total)); work.appendChild(line);
    });
    work.appendChild(node("p", "zsa-ifb-note", ui.repeatNote));
    var missed = data.compounds.filter(function (cp) {return misses.has(cp.formula);});
    if (missed.length) {
      work.appendChild(node("h3", "", ui.review)); var list = node("ul", "zsa-ifb-review");
      missed.forEach(function (cp) {list.appendChild(render(node("li"), fill(ui.reminder, context(cp))));}); work.appendChild(list);
    } else work.appendChild(node("p", "zsa-panel", ui.none));
    var actions = node("div", "zsa-ifb-actions"); actions.appendChild(button(ui.again, function () {start(mixed(), "mixed");}, true));
    if (missed.length) actions.appendChild(button(ui.misses, function () {
      // Every missed compound in the direction it was missed, then compounds with the same pair of charges.
      function pairKey(cp) {return cations[cp.cation].charge + ":" + anions[cp.anion].charge;}
      var pairs = new Set(missed.map(pairKey));
      var others = shuffle(data.compounds.filter(function (cp) {return pairs.has(pairKey(cp)) && !misses.has(cp.formula);}));
      var items = missed.map(function (cp) {return {compound:cp, dir:missDirs[cp.formula]};});
      others.slice(0, Math.max(0, 10 - missed.length)).forEach(function (cp) {items.push({compound:cp, dir:Math.random() < 0.5 ? "n2f" : "f2n"});});
      start(shuffle(items), "misses");
    }));
    work.appendChild(actions); heading.focus(); announce(ui.roundComplete);
  }
  data.compounds.forEach(function (cp, i) {var opt = node("option", "", cap(cp.name)); opt.value = String(i); select.appendChild(opt);});
  ["n2f", "f2n"].forEach(function (d) {var opt = node("option", "", ui.directions[d]); opt.value = d; dirSelect.appendChild(opt);});
  root.querySelector("#zsa-ifb-new").addEventListener("click", function () {start(mixed(), "mixed");});
  root.querySelector("#zsa-ifb-pick").addEventListener("click", function () {start([{compound:data.compounds[Number(select.value)], dir:dirSelect.value}], "single");});
  start(mixed(), "mixed", true);
}());
