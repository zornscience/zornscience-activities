(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ionic-formula-builder"]');
  if (!root) return;
  var data, zsa;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (value) {data = value;}}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail:{receive:function (value) {zsa = value;}}}));
  if (!data || !zsa) return;
  var ui = data.ui, node = zsa.node, cap = zsa.cap, fill = zsa.fill, render = zsa.render, chargeLabel = zsa.chargeLabel;
  var select = root.querySelector("#zsa-ifb-select");
  var dirSelect = root.querySelector("#zsa-ifb-direction");
  var cations = {}, anions = {};
  data.cations.forEach(function (c) {cations[c.symbol] = c;});
  data.anions.forEach(function (a) {anions[a.symbol] = a;});
  // An entry's item is a compound; its variant is the direction: "n2f" (name to formula) or "f2n" (formula to name).
  function ionsOf(cp) {return {m:cations[cp.cation], x:anions[cp.anion]};}

  // The one formula helper: the visible formula is aria-hidden and the spoken form reads like "Al 2 O 3, aluminum oxide".
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
    return zsa.token(build, spoken.join(" ") + (withName ? ", " + cp.name : ""));
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
    return zsa.token(function () {return node("span", "zsa-ifb-sum", text);}, spoken);
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

  // Round building: 10 compounds, 6 name to formula and 4 formula to name in mixed order. At least 3 have equal
  // charges (2 of them need reducing and are asked name to formula) and at least 2 contain aluminum.
  function isEqual(cp) {return cations[cp.cation].charge === -anions[cp.anion].charge;}
  function needsReduce(cp) {return cp.crossed[0] !== cp.subscripts[0];}
  function hasAl(cp) {return cp.cation === "Al";}
  function randomDir() {return Math.random() < 0.5 ? "n2f" : "f2n";}

  // Which feedback applies to an answer. Returns null when right, otherwise {keys, wrong (the parts to clear), slots}.
  // Charges: picks are signed numbers. Subscripts: counts. Name: the chosen name.
  function classify(entry, s, picks) {
    var cp = entry.item, dir = entry.variant, ions = ionsOf(cp), c = ions.m.charge, q = -ions.x.charge, sub = cp.subscripts;
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
      return wrong.length ? {keys:keys, wrong:wrong, slots:{}} : null;
    }
    if (dir === "f2n") {
      var n = picks.name;
      if (n === cp.name) return null;
      return {keys:[n === cp.prefixName ? "prefix" : n === cp.elementName ? "noIde" : "reversed"], wrong:["name"], slots:{}};
    }
    var a = picks.msub, b = picks.xsub, x = sub[0], y = sub[1];
    if (a === x && b === y) return null;
    var key;
    if (a * c === b * q) key = "reduce"; // balanced but not the lowest ratio
    else if (a === 1 && b === 1) key = "oneEach";
    else if ((a === y && b === x) || (a === c && b === q)) key = "swap"; // swapped, or each ion's own charge as its own subscript
    else key = "sum";
    return {keys:[key], wrong:(a !== x ? ["msub"] : []).concat(b !== y ? ["xsub"] : []),
      slots:{a:String(a), b:String(b), x:String(x), y:String(y), tried:sumToken(c, q, a, b)}};
  }
  function step(entry, s) {
    var cp = entry.item, dir = entry.variant, ions = ionsOf(cp), ctx = context(cp);
    var legends = ui.partLegends[dir][s].map(function (l) {return zsa.speak(fill(l, ctx));});
    var question = ui.questions[dir][s];
    function counts(name, legend) {return {name:name, values:[1,2,3].map(function (n) {return [n, n];}), modifier:"n3", legend:legend};}
    if (s === 0) return {question:question, pair:true, hintGroups:[ions.m.group, ions.x.group], parts:[
      {name:"metal", values:[1,2,3].map(function (n) {return [n, chargeLabel(n)];}), modifier:"n3", legend:legends[0]},
      {name:"nonmetal", values:[-1,-2,-3].map(function (n) {return [n, chargeLabel(n)];}), modifier:"n3", legend:legends[1]}
    ]};
    if (dir === "n2f") {
      // The formula builds as the counts are picked, with a live check of the total charge.
      var box = node("div", "zsa-ifb-build");
      var build = {node:box, update:function (picks) {
        box.replaceChildren();
        box.appendChild(node("span", "zsa-sr-only", ui.buildLabel + ": "));
        render(box, [formulaToken(cp, [picks.msub, picks.xsub], false)]);
        render(box, [sumToken(ions.m.charge, -ions.x.charge, picks.msub, picks.xsub)]);
      }};
      return {question:question, pair:true, build:build, parts:[counts("msub", legends[0]), counts("xsub", legends[1])]};
    }
    return {question:question, parts:[{name:"name", modifier:"names",
      values:zsa.shuffle([cp.name, cp.prefixName, cp.elementName, cp.reversedName]).map(function (n) {return [n, n];})}]};
  }
  // "cross" when the charges differ, "one" for 1+ with 1−, "reduce" for equal charges above 1.
  function chargeType(cp) {
    var c = cations[cp.cation].charge, q = -anions[cp.anion].charge;
    return c !== q ? "cross" : c === 1 ? "one" : "reduce";
  }
  function hint(entry, s, level) {
    var h = ui.hints[entry.variant][s][level];
    if (typeof h !== "string") h = h[chargeType(entry.item)];
    return fill(h, context(entry.item));
  }
  function explain(entry, s) {
    var t = ui.correct[entry.variant][s], type = "";
    if (typeof t !== "string") {type = chargeType(entry.item); t = t[type];}
    var out = fill(t, context(entry.item));
    if (type === "cross" && entry.item.subscripts.indexOf(1) >= 0) out = zsa.join([out, [ui.noOne]]);
    return out;
  }
  function trail(entry, s) {
    return fill(ui.trail[s === 0 ? "charges" : entry.variant === "n2f" ? "formula" : "name"], context(entry.item));
  }
  function renderStrip(entry, strip) {
    var cp = entry.item, line = node("div", "zsa-ifb-compound-line"), heading = node("h2", "zsa-ifb-compound-title");
    // Name to formula shows the name; formula to name shows the formula without saying its name.
    if (entry.variant === "n2f") heading.textContent = cap(cp.name);
    else render(heading, [formulaToken(cp, cp.subscripts, false)]);
    heading.id = "zsa-ifb-compound-heading"; heading.tabIndex = -1; line.appendChild(heading);
    line.appendChild(node("p", "zsa-ifb-caption", ui.captions[entry.variant])); strip.appendChild(line);
    var progress = node("p", "zsa-progress"); progress.id = "zsa-ifb-progress"; strip.appendChild(progress);
    return {heading:heading, progress:progress};
  }
  function summary(entry) {
    var row = node("div", "zsa-summary-row");
    row.appendChild(render(node("p", "zsa-ifb-big"), [formulaToken(entry.item, entry.item.subscripts, false)]));
    row.appendChild(render(node("p"), fill(ui.summary, context(entry.item))));
    return [row];
  }
  // Practice my misses: every missed compound in the direction it was missed, then compounds with the same pair of
  // charges, up to 10 in all.
  function missesRound(missed, variantOf) {
    function pairKey(cp) {return cations[cp.cation].charge + ":" + anions[cp.anion].charge;}
    var pairs = new Set(missed.map(pairKey)), formulas = new Set(missed.map(function (cp) {return cp.formula;}));
    var others = zsa.shuffle(data.compounds.filter(function (cp) {return pairs.has(pairKey(cp)) && !formulas.has(cp.formula);}));
    var items = missed.map(function (cp) {return {item:cp, variant:variantOf(cp)};});
    others.slice(0, Math.max(0, 10 - missed.length)).forEach(function (cp) {items.push({item:cp, variant:randomDir()});});
    return zsa.shuffle(items);
  }

  var activity = zsa.create(root, {
    prefix:"zsa-ifb", strip:"zsa-ifb-compound",
    labels:{
      hint:ui.hint, hint2:ui.hint2, hintsDone:ui.hintsDone, show:ui.show, hintPrefix:ui.hintPrefix, correct:ui.correctPrefix,
      wrong:ui.wrong, revealed:ui.revealed, next:ui.next, finish:data.finishLabel, complete:ui.complete,
      roundComplete:ui.roundComplete, singleDone:ui.singleDone, firstTry:ui.firstTry, review:ui.review, none:ui.none,
      again:ui.again, misses:ui.misses, repeatNote:ui.repeatNote, itemLabel:ui.itemLabel, reviewLabel:ui.reviewLabel,
      singleLabel:ui.singleLabel, of:ui.of, stepLabel:ui.stepLabel, trailLabel:ui.trailLabel, correctMark:ui.correctMark,
      shownMark:ui.shownMark, triedMark:ui.triedMark, currentMark:ui.currentMark, hintMark:ui.hintMark,
      chargeMark:ui.chargeMark, tableCaption:data.tableCaption, periodLabel:data.periodLabel
    },
    pool:data.compounds, key:function (cp) {return cp.formula;},
    round:{
      quotas:[{test:needsReduce, min:2, variant:"n2f"}, {test:hasAl, min:2}, {test:isEqual, min:3}, {min:10}],
      variants:[["n2f", 6], ["f2n", 4]]
    },
    // Review fillers get a random direction; the repeat keeps the direction that was missed.
    fillerVariant:randomDir,
    // Both elements are always marked; once the charges step is done each ion's charge sits above its group column.
    table:{groups:data.groups, rows:data.table, charges:true},
    marks:function (entry, stepsDone) {
      var ions = ionsOf(entry.item), charges = {};
      if (stepsDone > 0) {charges[ions.m.group] = ions.m.charge; charges[ions.x.group] = ions.x.charge;}
      return {marked:[ions.m.symbol, ions.x.symbol], charges:charges};
    },
    renderStrip:renderStrip, steps:2, step:step, classify:classify,
    message:function (entry, key, result) {return fill(ui.feedback[key], context(entry.item, result.slots));},
    hint:hint, trail:trail, explain:explain, summary:summary,
    statKey:function (entry, s) {return entry.variant + s;},
    stats:ui.stepNames.map(function (e) {return [e[0] + e[1], e[2]];}),
    reminder:function (cp) {return fill(ui.reminder, context(cp));},
    missesRound:missesRound
  });
  data.compounds.forEach(function (cp, i) {var opt = node("option", "", cap(cp.name)); opt.value = String(i); select.appendChild(opt);});
  ["n2f", "f2n"].forEach(function (d) {var opt = node("option", "", ui.directions[d]); opt.value = d; dirSelect.appendChild(opt);});
  root.querySelector("#zsa-ifb-new").addEventListener("click", function () {activity.start(activity.mixed(), "mixed");});
  root.querySelector("#zsa-ifb-pick").addEventListener("click", function () {
    activity.start([{item:data.compounds[Number(select.value)], variant:dirSelect.value}], "single");
  });
  activity.start(activity.mixed(), "mixed", true);
}());
