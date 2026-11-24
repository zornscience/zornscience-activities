(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ion-charge-trainer"]');
  if (!root) return;
  var data, zsa, track;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (value) {data = value;}}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail:{receive:function (value) {zsa = value;}}}));
  root.dispatchEvent(new CustomEvent("zsa:request-track", {detail:{receive:function (value) {track = value;}}}));
  if (!data || !zsa || !track) return;
  var ui = data.ui, node = zsa.node, cap = zsa.cap, words = ui.visual, svg = track.svg;
  var namingBox = root.querySelector("#zsa-ict-naming");
  var select = root.querySelector("#zsa-ict-select");
  function isMetal(e) {return e.charge > 0;}
  function fill(template, values) {return template.replace(/\{(\w+)\}/g, function (m, k) {return values[k];});}

  // Which feedback applies to an answer (README "Misconception map and precedence"). A correct answer is always
  // checked first. Returns null when right, otherwise the feedback keys and the parts to clear.
  function classify(entry, s, picks) {
    var e = entry.item, key;
    if (s === 0) {
      var a = picks.valence;
      if (a === e.valence) return null;
      key = a === e.period && a === 8 - e.valence ? "combined" : a === e.period ? "period" : a === e.z ? "atomic" : a === 8 - e.valence ? "complement" : "general";
      return {keys:[key], wrong:["valence"]};
    }
    if (s === 1) {
      var d = picks.direction, n = picks.count;
      if (d === e.direction && n === e.moved) return null;
      if (d !== e.direction && n === 8 - e.moved) key = "long";
      else if (d !== e.direction && n === e.moved) key = "direction";
      else if (d === e.direction) key = "number";
      else key = "general";
      return {keys:[key], wrong:key === "direction" ? ["direction"] : key === "number" ? ["count"] : ["direction", "count"]};
    }
    if (s === 2) {
      var c = picks.charge;
      if (c === e.charge) return null;
      // A sign reversal takes precedence when the valence count equals magnitude.
      key = c === -e.charge ? "sign" : Math.abs(c) === e.valence ? "valence" : "size";
      return {keys:[key], wrong:["charge"]};
    }
    // Step 4: a key for each wrong part; both messages show together.
    var keys = [];
    if (picks.name !== e.ion) keys.push("nameRule");
    if (picks.gas !== e.gas) keys.push(picks.gas === e.trapGas ? "trapGas" : "gasCount");
    if (!keys.length) return null;
    return {keys:keys, wrong:(keys.indexOf("nameRule") >= 0 ? ["name"] : []).concat(keys.some(function (k) {return k !== "nameRule";}) ? ["gas"] : [])};
  }
  function numbers(list) {return list.map(function (n) {return [n, n];});}
  function step(entry, s) {
    var e = entry.item, q = ui.questions[s];
    if (s === 0) return {question:q, parts:[{name:"valence", values:numbers([1,2,3,4,5,6,7,8]), modifier:"n8"}], hintGroups:[e.group]};
    if (s === 1) return {question:q, parts:[
      {name:"direction", values:[["loses", ui.lose], ["gains", ui.gain]], modifier:"direction"},
      {name:"count", values:numbers([1,2,3,4,5,6,7]), modifier:"n7", legend:ui.count}
    ]};
    if (s === 2) {
      // The six common charges, plus the valence count as a charge when it is not one of them.
      var charges = [3,2,1,-1,-2,-3], distractor = e.charge < 0 ? -e.valence : e.valence;
      if (charges.indexOf(distractor) < 0) charges.push(distractor);
      return {question:q, parts:[{name:"charge", values:charges.map(function (n) {return [n, zsa.chargeLabel(n)];}), modifier:"n" + charges.length}]};
    }
    return {question:q, parts:[
      {name:"name", values:zsa.shuffle([e.ion, e.nameWrong]).map(function (n) {return [n, n];}), modifier:"direction", legend:ui.nameLegend},
      {name:"gas", values:data.gases.map(function (g) {return [g, cap(g)];}), modifier:"gas", legend:ui.gasLegend}
    ]};
  }
  function trail(entry, s) {
    var e = entry.item;
    // Full templates, so each language can order the words naturally.
    if (s === 0) return fill(e.valence === 1 ? ui.valenceOne : ui.valenceMany, {count:e.valence});
    if (s === 1) return fill(e.direction === "loses" ? ui.loses : ui.gains, {count:e.moved});
    if (s === 2) return fill(ui.chargeWord, {charge:e.chargeLabel});
    return fill(ui.likeWord, {ion:cap(e.ion), gas:e.gas});
  }
  // ---------- The element card and its Bohr model ----------
  // The card shows the element; the stage beside or under it draws the atom's energy levels. The outer level fills in
  // when step 1 is answered, electrons leave or join after step 2, the ion's charge appears after step 3, and the
  // noble gas it matches when the element is complete. Every state is drawn as it is, so reduced motion loses nothing.
  var progressTrack = track.progress({id:"zsa-ict-progress", template:ui.progress});
  var model = null; // {e, stage, svg, stage element, words}: the element on screen

  // Electrons in each energy level (Bohr shells by principal level), filled in the usual order. These 19 elements
  // follow it with no exceptions.
  var ORDER = [[1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6], [5, 2], [4, 10], [5, 6], [6, 2], [4, 14], [5, 10], [6, 6]];
  function levels(z) {
    var out = [], left = z;
    ORDER.forEach(function (o) {
      if (left <= 0) return;
      var n = Math.min(o[1], left); left -= n;
      while (out.length < o[0]) out.push(0);
      out[o[0] - 1] += n;
    });
    return out;
  }
  // The ion's levels: a metal's outer level is emptied; a nonmetal's is filled to 8.
  function ionLevels(e) {
    var l = levels(e.z).slice();
    if (e.direction === "loses") l.pop(); else l[l.length - 1] += e.moved;
    return l;
  }
  // Ring radii in a 200 by 200 drawing centered on (100, 100): 34 for the first level and 88 for the outer level,
  // with the levels between them evenly spaced.
  function radii(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(34 + i * 54 / (n - 1));
    return out;
  }
  // Places for n electrons on a ring, in degrees: one at the top, right, bottom and left first, then a second beside
  // each, as in a Lewis dot diagram, so electrons that join fill the gaps without moving the others. A first level of
  // 2 sits at the top and bottom.
  function spots(n, r, first) {
    if (first) return [-90, 90].slice(0, n);
    var sites = [-90, 0, 90, 180], half = 8.5 / r * 180 / Math.PI, out = [];
    for (var i = 0; i < n && i < 8; i++) out.push(sites[i % 4] + (i < 4 ? -half : half));
    return out;
  }
  // One electron at an angle on a ring. data-zsa-e names its kind for the tests: valence, gained, lost, leaving, full.
  function electron(angle, r, cls, delay) {
    var g = svg("g", {transform:"rotate(" + angle.toFixed(2) + " 100 100)"});
    var dot = svg("circle", {cx:(100 + r).toFixed(2), cy:100, r:7}, "zsa-ict-e " + cls + (delay ? " zsa-ict-d" + Math.min(delay, 8) : ""));
    dot.setAttribute("data-zsa-e", cls.split(" ")[0].replace("is-", ""));
    g.appendChild(dot);
    return g;
  }
  function stateWords(e, stage, done) {
    var v = words, w = {pill:v.neutral, good:false, electrons:e.z, levels:null, key:null};
    if (stage >= 1) { w.pill = fill(e.valence === 1 ? ui.valenceOne : ui.valenceMany, {count:e.valence}); w.levels = levels(e.z); }
    if (stage >= 2) { w.pill = fill(e.direction === "loses" ? ui.loses : ui.gains, {count:e.moved}); w.electrons = e.electrons; w.levels = ionLevels(e); w.key = e.direction === "loses" ? v.lostKey : v.gainedKey; }
    if (stage >= 3) w.pill = fill(ui.chargeWord, {charge:e.chargeLabel});
    if (done) { w.pill = fill(v.like, {gas:e.gas}); w.good = true; }
    return w;
  }
  // Draws the model for a stage (0: neutral atom, outer level not shown; 1: valence electrons; 2: after the transfer;
  // 3: the charge). done adds the noble gas. animate plays the change from the stage before.
  function drawModel(stage, done, animate) {
    var e = model.e, pic = model.svg, l = levels(e.z), r = radii(l.length), outer = r[r.length - 1];
    pic.replaceChildren();
    var rings = svg("g", {}, "zsa-ict-rings");
    r.forEach(function (radius, i) {
      var isOuter = i === r.length - 1, cls = "zsa-ict-ring";
      if (isOuter) cls += stage === 0 ? " is-unknown" : stage >= 2 && e.direction === "loses" ? " is-emptied" : " is-outer";
      if (stage >= 2 && e.direction === "loses" && i === r.length - 2) cls += " is-outer";
      rings.appendChild(svg("circle", {cx:100, cy:100, r:radius.toFixed(2)}, cls));
    });
    pic.appendChild(rings);
    var dots = svg("g", {}, "zsa-ict-dots");
    if (stage === 0) {
      dots.appendChild(track.label({x:100 + outer * 0.7071, y:100 - outer * 0.7071, "text-anchor":"middle", "dominant-baseline":"central"}, "?", "zsa-ict-ask"));
    } else if (stage === 1 || e.direction === "gains") {
      var n = stage >= 2 ? 8 : e.valence, at = spots(n, outer, false);
      at.forEach(function (a, i) {
        var joined = stage >= 2 && i >= e.valence;
        var cls = joined ? "is-gained" + (animate === 2 ? " is-join" : "") : "is-valence" + (animate === 1 ? " is-in" : "");
        dots.appendChild(electron(a, outer, cls, animate === 1 ? i + 1 : animate === 2 && joined ? i - e.valence + 1 : 0));
      });
      if (stage >= 2 && animate === 2) replayIonRing(dots, outer);
    } else {
      // A metal after step 2: the outer electrons have left (dashed circles mark where they were) and the level
      // inside is now the outer level, full.
      spots(e.valence, outer, false).forEach(function (a, i) {
        dots.appendChild(electron(a, outer, "is-lost", 0));
        if (animate === 2) dots.appendChild(electron(a, outer, "is-leaving", i + 1));
      });
      var inner = r[r.length - 2], full = l[l.length - 2];
      spots(full, inner, l.length - 1 === 1).forEach(function (a, i) {
        dots.appendChild(electron(a, inner, "is-full" + (animate === 2 ? " is-in" : ""), animate === 2 ? i + 3 : 0));
      });
    }
    pic.appendChild(dots);
    var nucleus = svg("g", {}, "zsa-ict-nucleus");
    nucleus.appendChild(svg("circle", {cx:100, cy:100, r:17}));
    nucleus.appendChild(track.label({x:100, y:100.5, "text-anchor":"middle", "dominant-baseline":"central"}, e.symbol, "zsa-ict-nucleus-symbol"));
    pic.appendChild(nucleus);
    if (stage >= 3) {
      // Square brackets and the charge, as an ion is written in a Lewis diagram.
      var ion = svg("g", {}, "zsa-ict-ion-mark" + (animate === 3 ? " is-in" : ""));
      ion.appendChild(svg("path", {d:"M14 6 H4 V194 H14 M186 6 H196 V194 H186"}, "zsa-ict-bracket"));
      ion.appendChild(track.label({x:199, y:0, "text-anchor":"start", "dominant-baseline":"central"}, e.chargeLabel, "zsa-ict-charge"));
      pic.appendChild(ion);
    }
    var w = stateWords(e, stage, done);
    model.pill.textContent = w.pill;
    model.pill.className = "zsa-stage-pill" + (w.good ? " is-good" : "");
    model.counts.textContent = fill(words.counts, {protons:e.z, electrons:w.electrons});
    model.levels.textContent = w.levels ? fill(words.levels, {list:w.levels.join(", ")}) : words.outerUnknown;
    model.key.textContent = w.key || "";
    model.key.hidden = !w.key;
    var said = [fill(words.model, {name:e.name, levels:l.length}), w.pill + ".", model.counts.textContent + ".", model.levels.textContent + (w.levels ? "." : "")];
    if (w.key) said.push(w.key + ".");
    model.stage.setAttribute("aria-label", said.join(" "));
  }
  // The ring that is now the outer level of a nonmetal ion lights up once as it fills.
  function replayIonRing(dots, outer) {
    dots.insertBefore(svg("circle", {cx:100, cy:100, r:outer.toFixed(2)}, "zsa-ict-ring-flash"), dots.firstChild);
  }
  function renderStrip(entry, strip) {
    var e = entry.item;
    var card = node("div", "zsa-ict-card");
    var tile = node("div", "zsa-ict-element-tile"); tile.setAttribute("aria-hidden", "true");
    tile.appendChild(node("span", "zsa-ict-atomic", e.z));
    tile.appendChild(node("span", "zsa-ict-symbol", e.symbol));
    tile.appendChild(node("span", "zsa-ict-tile-name", cap(e.name)));
    var text = node("div", "zsa-ict-element-text"), line = node("div", "zsa-ict-element-line");
    var heading = node("h2", "zsa-ict-element-title", cap(e.name));
    heading.id = "zsa-ict-element-heading"; heading.tabIndex = -1; line.appendChild(heading);
    line.appendChild(node("p", "zsa-ict-caption", data.atomicLabel + " " + e.z)); text.appendChild(line);
    progressTrack.load(); text.appendChild(progressTrack.node);
    card.appendChild(tile); card.appendChild(text);
    // The stage is one picture for screen readers, named with everything it shows.
    var stage = node("div", "zsa-stage zsa-ict-stage"); stage.setAttribute("role", "img");
    var pic = svg("svg", {viewBox:"-26 -20 252 240", "aria-hidden":"true", focusable:"false"}, "zsa-ict-model");
    var info = node("div", "zsa-ict-info"); info.setAttribute("aria-hidden", "true");
    var eyebrow = node("p", "zsa-stage-eyebrow", words.eyebrow), pill = node("p", "zsa-stage-pill");
    var counts = node("p", "zsa-stage-line"), lv = node("p", "zsa-stage-line"), key = node("p", "zsa-stage-line zsa-ict-key");
    info.appendChild(eyebrow); info.appendChild(pill); info.appendChild(counts); info.appendChild(lv); info.appendChild(key);
    stage.appendChild(pic); stage.appendChild(info);
    strip.appendChild(card); strip.appendChild(stage);
    model = {e:e, svg:pic, stage:stage, pill:pill, counts:counts, levels:lv, key:key, shown:0, done:false};
    lastRight = -1;
    drawModel(0, false, 0);
    return {heading:heading, progress:progressTrack.sink};
  }
  // The engine redraws the table after each finished step, with the number of steps done: the model follows it.
  var steps = 4, lastRight = -1;
  function showProgress(entry, done) {
    if (!model || model.e !== entry.item) return;
    var stage = Math.min(done, 3), complete = done >= steps;
    if (stage === model.shown && complete === model.done) return;
    var grew = stage > model.shown || complete && !model.done;
    // A step finished without a right answer was shown (Show me): no celebration, and the pip turns amber.
    if (grew && lastRight !== done - 1) progressTrack.miss();
    drawModel(stage, complete, grew && !track.reduced() ? (stage > model.shown ? stage : 0) : 0);
    if (grew && lastRight === done - 1) track.replay(model.stage, "is-cheer");
    model.shown = stage; model.done = complete;
  }
  // The ion as a symbol with its charge; the visual is hidden from screen readers, which get the spoken label.
  function ion(e) {
    var wrap = node("p", "zsa-ict-ion"), visual = node("span", "", e.symbol); visual.setAttribute("aria-hidden", "true");
    visual.appendChild(node("sup", "", (e.moved === 1 ? "" : e.moved) + (e.charge > 0 ? "+" : "−")));
    wrap.appendChild(visual); wrap.appendChild(node("span", "zsa-sr-only", e.spoken)); return wrap;
  }
  function summary(entry) {
    progressTrack.complete();
    var e = entry.item, row = node("div", "zsa-summary-row");
    row.appendChild(ion(e)); row.appendChild(node("p", "", e.summary));
    return e.symbol === "Li" ? [row, node("p", "", e.reminder)] : [row];
  }
  // Practice my misses: every missed element, then same-group elements not missed, up to 10 in all.
  function missesRound(missed) {
    var symbols = new Set(missed.map(function (e) {return e.symbol;}));
    var groups = new Set(missed.map(function (e) {return e.group;}));
    var others = zsa.shuffle(data.elements.filter(function (e) {return groups.has(e.group) && !symbols.has(e.symbol);}));
    return zsa.shuffle(missed.concat(others.slice(0, Math.max(0, 10 - missed.length)))).map(function (e) {return {item:e};});
  }

  var activity = zsa.create(root, {
    prefix:"zsa-ict", strip:"zsa-ict-element",
    labels:{
      hint:ui.hint, hint2:ui.hint2, hintsDone:ui.hintsDone, show:ui.show, hintPrefix:ui.hintPrefix, correct:ui.correct,
      wrong:ui.wrong, revealed:ui.revealed, next:ui.next, finish:data.finishLabel, complete:ui.complete,
      roundComplete:ui.roundComplete, singleDone:ui.singleDone, firstTry:ui.firstTry, review:ui.review, none:ui.none,
      again:ui.again, misses:ui.misses, repeatNote:ui.repeatNote, itemLabel:ui.elementLabel, reviewLabel:ui.reviewLabel,
      singleLabel:ui.singleLabel, progress:progressTrack.template, trailLabel:ui.trailLabel, correctMark:ui.correctMark,
      shownMark:ui.shownMark, triedMark:ui.triedMark, currentMark:ui.currentMark, hintMark:ui.hintMark,
      tableCaption:data.tableCaption, periodLabel:data.periodLabel,
      general:ui.general, chargeMark:ui.chargeMark, codeLabel:ui.codeLabel, copyCode:ui.copyCode,
      codeCopied:ui.codeCopied, codeReady:ui.codeReady, codeSelected:ui.codeSelected, codeNote:ui.codeNote
    },
    pool:data.elements, key:function (e) {return e.symbol;},
    // 10 different elements: at least 3 metals and 3 nonmetals.
    round:{quotas:[{test:isMetal, min:3}, {test:function (e) {return !isMetal(e);}, min:3}], size:10},
    table:{groups:data.groups, rows:data.table},
    marks:function (entry, done) {showProgress(entry, done); return {marked:[entry.item.symbol]};},
    renderStrip:renderStrip,
    // Step 4 (name the ion and match its noble gas) is on unless the setting is cleared; read once per element.
    stepCount:function () {steps = namingBox && !namingBox.checked ? 3 : 4; return steps;},
    step:step,
    // The rules decide; the picture reacts: a right answer is remembered for the model's next stage, a miss nudges it.
    classify:function (entry, s, picks) {
      var result = classify(entry, s, picks);
      if (!result) lastRight = s;
      else {
        progressTrack.miss();
        if (model) track.replay(model.stage, "is-nudge");
        track.later(function () { track.replay(root.querySelector("#zsa-ict-work .zsa-feedback--wrong"), "is-again"); });
      }
      return result;
    },
    message:function (entry, key) {return entry.item.feedback[key];},
    hint:function (entry, s, level) {return entry.item.hints[s][level];},
    trail:trail, explain:function (entry, s) {return entry.item.correct[s];},
    summary:summary,
    stats:ui.stepNames.map(function (label, i) {return [String(i), label];}),
    reminder:function (e) {return e.reminder;},
    missesRound:missesRound
  });
  data.elements.forEach(function (e) {var opt = node("option", "", cap(e.name) + " (" + e.symbol + ")"); opt.value = e.symbol; select.appendChild(opt);});
  root.querySelector("#zsa-ict-new").addEventListener("click", function () {activity.start(activity.mixed(), "mixed");});
  root.querySelector("#zsa-ict-pick").addEventListener("click", function () {
    activity.start([{item:data.elements.find(function (e) {return e.symbol === select.value;})}], "single");
  });
  activity.start(activity.mixed(), "mixed", true);
}());
