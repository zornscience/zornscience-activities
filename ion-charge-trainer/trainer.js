(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ion-charge-trainer"]');
  if (!root) return;
  var data, zsa;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (value) {data = value;}}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail:{receive:function (value) {zsa = value;}}}));
  if (!data || !zsa) return;
  var ui = data.ui, node = zsa.node, cap = zsa.cap;
  var namingBox = root.querySelector("#zsa-ict-naming");
  var select = root.querySelector("#zsa-ict-select");
  function isMetal(e) {return e.charge > 0;}

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
    if (s === 0) return e.valence + " " + (e.valence === 1 ? ui.valenceOne : ui.valenceMany);
    if (s === 1) return (e.direction === "loses" ? ui.loses : ui.gains) + " " + e.moved;
    if (s === 2) return ui.chargeWord + " " + e.chargeLabel;
    return cap(e.ion) + ", " + ui.likeWord + " " + e.gas;
  }
  function renderStrip(entry, strip) {
    var e = entry.item;
    var tile = node("div", "zsa-ict-element-tile"); tile.setAttribute("aria-hidden", "true");
    tile.appendChild(node("span", "zsa-ict-atomic", e.z));
    tile.appendChild(node("span", "zsa-ict-symbol", e.symbol));
    var text = node("div", "zsa-ict-element-text"), line = node("div", "zsa-ict-element-line");
    var heading = node("h2", "zsa-ict-element-title", cap(e.name));
    heading.id = "zsa-ict-element-heading"; heading.tabIndex = -1; line.appendChild(heading);
    line.appendChild(node("p", "zsa-ict-caption", data.atomicLabel + " " + e.z)); text.appendChild(line);
    var progress = node("p", "zsa-progress"); progress.id = "zsa-ict-progress"; text.appendChild(progress);
    strip.appendChild(tile); strip.appendChild(text);
    return {heading:heading, progress:progress};
  }
  // The ion as a symbol with its charge; the visual is hidden from screen readers, which get the spoken label.
  function ion(e) {
    var wrap = node("p", "zsa-ict-ion"), visual = node("span", "", e.symbol); visual.setAttribute("aria-hidden", "true");
    visual.appendChild(node("sup", "", (e.moved === 1 ? "" : e.moved) + (e.charge > 0 ? "+" : "−")));
    wrap.appendChild(visual); wrap.appendChild(node("span", "zsa-sr-only", e.spoken)); return wrap;
  }
  function summary(entry) {
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
      singleLabel:ui.singleLabel, of:ui.of, stepLabel:ui.stepLabel, trailLabel:ui.trailLabel, correctMark:ui.correctMark,
      shownMark:ui.shownMark, triedMark:ui.triedMark, currentMark:ui.currentMark, hintMark:ui.hintMark,
      tableCaption:data.tableCaption, periodLabel:data.periodLabel,
      general:ui.general, chargeMark:ui.chargeMark, codeLabel:ui.codeLabel, copyCode:ui.copyCode,
      codeCopied:ui.codeCopied, codeReady:ui.codeReady, codeSelected:ui.codeSelected, codeNote:ui.codeNote
    },
    pool:data.elements, key:function (e) {return e.symbol;},
    // 10 different elements: at least 3 metals and 3 nonmetals.
    round:{quotas:[{test:isMetal, min:3}, {test:function (e) {return !isMetal(e);}, min:3}], size:10},
    table:{groups:data.groups, rows:data.table},
    marks:function (entry) {return {marked:[entry.item.symbol]};},
    renderStrip:renderStrip,
    // Step 4 (name the ion and match its noble gas) is on unless the setting is cleared; read once per element.
    stepCount:function () {return namingBox && !namingBox.checked ? 3 : 4;},
    step:step, classify:classify,
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
