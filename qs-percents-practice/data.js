(function () {
  "use strict";
  // Percents Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The rules follow the lesson on zornscience.org: 35% = 35/100 = 0.35, so a percent becomes a decimal by moving the
  // decimal point 2 places left; percent = part ÷ whole × 100 with the whole always on the bottom; part = (percent ÷ 100)
  // × whole, in the whole's units; percent composition = element mass ÷ compound mass × 100; percent yield = actual ÷
  // theoretical × 100. Significant figures are advice here: the line under each question says how to round.
  var SLUG = "qs-percents-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;
    function sfOf(text) { return M.read(text).sf; }
    function frac(x) { return x.n + "/" + x.d; }
    function full(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return M.fixed(value, -k);
      return null;
    }
    // "=" when the rounded answer is the exact value, otherwise "≈".
    function eq(x, P) { return full(x) !== null && M.cmp(M.rounded(x, P).value, x) === 0 ? "=" : "≈"; }
    function amount(random, lo, hi, n) {
      for (;;) {
        var text = M.write(String(lo + random() * (hi - lo)), {sf:n}, "plain");
        if (sfOf(text) === n && M.sign(text) > 0) return text;
      }
    }
    var PCT = ["%", "percent", "per cent", "pct", "por ciento", "porciento"];
    var ACCEPT = {
      g:["g", "grams", "gram", "gramos", "gramo"], kg:["kg", "kilograms", "kilogram", "kilogramos", "kilogramo"],
      L:["L", "l", "liters", "liter", "litres", "litros", "litro"], mL:["mL", "ml", "milliliters", "milliliter", "millilitres", "mililitros", "mililitro"]
    };
    function rounding(P) { return P.sf ? figs(P.sf) : M.places(P.decimals); }
    // Wrong values from known mistakes, kept only when they round to something other than the answer and each other.
    function trapsFor(answer, P, list) {
      var seen = [M.write(answer, P, "plain")], out = [];
      list.forEach(function (t) {
        var w = M.write(t[0], P, "plain");
        if (M.sign(t[0]) && seen.indexOf(w) < 0) { seen.push(w); out.push({answer:frac(M.exact(t[0])), note:t[1]}); }
      });
      return out;
    }
    // A numeric percent answer: the % sign is optional and significant figures are advice.
    function percentQuestion(x, P, prompt, explanation, traps, instruction) {
      var answer = M.write(x, P, "plain");
      return {type:"numeric", answer:frac(x), precision:P, unit:"%", accept:PCT, check:{sf:"advice", unit:"optional"},
        display:answer + " %", answerText:p(show(answer) + "%", show(answer) + "%"), traps:trapsFor(x, P, traps),
        instruction:instruction || fill(p("Round to {n}.", "Redondea a {n}."), {n:rounding(P)}), prompt:prompt, explanation:explanation};
    }
    var NO100 = p("Multiply by 100 to change the decimal to a percent.", "Multiplica por 100 para cambiar el decimal a porcentaje.");

    // Percents and decimals. A percent with no zeros at the end of a whole number, so its significant figures are clear.
    function percentText(random) {
      for (;;) {
        var kind = int(random, 0, 3), t;
        if (kind === 0) t = String(int(random, 1, 99));
        else if (kind === 1) t = int(random, 0, 99) + "." + int(random, 1, 9);
        else if (kind === 2) t = String(int(random, 101, 400));
        else t = "0." + (random() < 0.5 ? int(random, 1, 9) : "0" + int(random, 1, 9));
        if (/^\d*[1-9]\d*0$/.test(t) && t.indexOf(".") < 0) continue;
        return t;
      }
    }
    function toDecimal(params) {
      var pct = params[0], P = {sf:sfOf(pct)}, x = M.div(pct, "100"), dec = M.write(x, P, "plain");
      return {type:"numeric", answer:frac(x), precision:P, unit:null, accept:[], check:{sf:"advice"},
        display:dec, answerText:p(show(dec), show(dec)),
        traps:trapsFor(x, P, [[M.exact(pct), p("Divide by 100 to change a percent to a decimal: move the decimal point 2 places left.", "Divide entre 100 para cambiar un porcentaje a decimal: mueve el punto decimal 2 lugares a la izquierda.")],
          [M.div(pct, "10"), p("Move the decimal point 2 places, not 1.", "Mueve el punto decimal 2 lugares, no 1.")],
          [M.mul(pct, "100"), p("Move the decimal point to the left, not to the right.", "Mueve el punto decimal a la izquierda, no a la derecha.")]]),
        instruction:p("Write the answer as a decimal.", "Escribe la respuesta como decimal."),
        prompt:fill(p("Write {pct}% as a decimal.", "Escribe {pct}% como decimal."), {pct:show(pct)}),
        explanation:fill(p("{pct}% = {pct}/100. Move the decimal point 2 places left: {pct}% = {dec}.", "{pct}% = {pct}/100. Mueve el punto decimal 2 lugares a la izquierda: {pct}% = {dec}."), {pct:show(pct), dec:show(dec)})};
    }
    function toPercent(params) {
      var dec = params[0], P = {sf:sfOf(dec)}, x = M.mul(dec, "100"), pct = M.write(x, P, "plain");
      var q = percentQuestion(x, P, fill(p("Write {dec} as a percent.", "Escribe {dec} como porcentaje."), {dec:show(dec)}),
        fill(p("Multiply by 100: move the decimal point 2 places right. {dec} = {pct}%.", "Multiplica por 100: mueve el punto decimal 2 lugares a la derecha. {dec} = {pct}%."), {dec:show(dec), pct:show(pct)}),
        [[M.exact(dec), p("Multiply by 100 to change a decimal to a percent: move the decimal point 2 places right.", "Multiplica por 100 para cambiar un decimal a porcentaje: mueve el punto decimal 2 lugares a la derecha.")],
          [M.mul(dec, "10"), p("Move the decimal point 2 places, not 1.", "Mueve el punto decimal 2 lugares, no 1.")],
          [M.div(dec, "100"), p("Move the decimal point to the right, not to the left.", "Mueve el punto decimal a la derecha, no a la izquierda.")]],
        p("Write the answer as a percent.", "Escribe la respuesta como porcentaje."));
      return q;
    }

    // Percent of a whole: percent = part ÷ whole × 100, and the whole always goes on the bottom.
    var WHOLES = {
      soil:{unit:"g", whole:[10, 80], share:[0.05, 0.4], text:p("A {w} soil sample contains {p} of water. What percent of the sample's mass is water?", "Una muestra de suelo de {w} contiene {p} de agua. ¿Qué porcentaje de la masa de la muestra es agua?")},
      brass:{unit:"g", whole:[5, 30], share:[0.25, 0.45], text:p("A {w} brass key contains {p} of zinc. What percent of the key's mass is zinc?", "Una llave de latón de {w} contiene {p} de zinc. ¿Qué porcentaje de la masa de la llave es zinc?")},
      ethanol:{unit:"mL", whole:[50, 500], share:[0.05, 0.7], text:p("A {w} solution contains {p} of ethanol. What percent of the volume is ethanol?", "Una solución de {w} contiene {p} de etanol. ¿Qué porcentaje del volumen es etanol?")}
    };
    function percentOfWhole(params) {
      var c = WHOLES[params[0]], part = params[1], whole = params[2], P = {sf:Math.min(sfOf(part), sfOf(whole))}, x = M.mul(M.div(part, whole), "100");
      var u = " " + c.unit;
      return percentQuestion(x, P, fill(c.text, {w:show(whole) + u, p:show(part) + u}),
        fill(p("percent = part ÷ whole × 100 = {p} ÷ {w} × 100 {eq} {ans}%.", "porcentaje = parte ÷ total × 100 = {p} ÷ {w} × 100 {eq} {ans}%."),
          {p:show(part), w:show(whole), eq:eq(x, P), ans:show(M.write(x, P, "plain"))}),
        [[M.mul(M.div(whole, part), "100"), p("The whole always goes on the bottom: part ÷ whole. A part cannot be more than 100% of its whole.", "El total siempre va abajo: parte ÷ total. Una parte no puede ser más del 100% de su total.")],
          [M.div(part, whole), NO100]]);
    }
    function makeWhole(random) {
      var key = pick(random, Object.keys(WHOLES)), c = WHOLES[key];
      for (;;) {
        var whole = amount(random, c.whole[0], c.whole[1], int(random, 2, 3)), part = amount(random, Number(whole) * c.share[0], Number(whole) * c.share[1], int(random, 2, 3));
        var params = [key, part, whole], q = percentOfWhole(params);
        if (M.cmp(part, whole) < 0 && sfOf(q.display.split(" ")[0]) === q.precision.sf) return params;
      }
    }
    // The part from a percent: part = (percent ÷ 100) × whole, in the whole's units.
    var PARTS = {
      sea:{units:["g", "kg"], whole:[[200, 5000], [1, 50]], pct:[3, 3.9], text:p("Seawater is {pct}% salt by mass. How many {un} of salt are in {w} of seawater?", "El agua de mar tiene {pct}% de sal en masa. ¿Cuántos {un} de sal hay en {w} de agua de mar?")},
      fertilizer:{units:["kg"], whole:[[2, 25]], pct:[5, 30], text:p("A {w} bag of fertilizer is {pct}% nitrogen by mass. How many {un} of nitrogen does it contain?", "Un costal de fertilizante de {w} tiene {pct}% de nitrógeno en masa. ¿Cuántos {un} de nitrógeno contiene?")},
      air:{units:["L", "mL"], whole:[[1, 60], [100, 900]], pct:[20.9, 21], text:p("Air is {pct}% oxygen by volume. How many {un} of oxygen are in {w} of air?", "El aire tiene {pct}% de oxígeno en volumen. ¿Cuántos {un} de oxígeno hay en {w} de aire?")},
      vinegar:{units:["mL", "L"], whole:[[100, 950], [1, 4]], pct:[4, 8], text:p("Vinegar is {pct}% acetic acid by volume. How many {un} of acetic acid are in {w} of vinegar?", "El vinagre tiene {pct}% de ácido acético en volumen. ¿Cuántos {un} de ácido acético hay en {w} de vinagre?")}
    };
    var UNIT_NAMES = {g:p("grams", "gramos"), kg:p("kilograms", "kilogramos"), L:p("liters", "litros"), mL:p("milliliters", "mililitros")};
    function partOfWhole(params) {
      var c = PARTS[params[0]], pct = params[1], whole = params[2], unit = params[3], P = {sf:Math.min(sfOf(pct), sfOf(whole))};
      var dec = M.div(pct, "100"), x = M.mul(dec, whole), answer = M.write(x, P, "plain");
      return {type:"numeric", answer:frac(x), precision:P, unit:unit, accept:ACCEPT[unit], check:{sf:"advice", unit:"optional"},
        display:answer + " " + unit, answerText:p(show(answer) + " " + unit, show(answer) + " " + unit),
        traps:trapsFor(x, P, [[M.mul(pct, whole), fill(p("Change the percent to a decimal first: {pct}% = {dec}.", "Primero cambia el porcentaje a decimal: {pct}% = {dec}."), {pct:show(pct), dec:show(full(dec))})],
          [M.div(whole, dec), p("Multiply by the decimal, do not divide. The part is smaller than the whole.", "Multiplica por el decimal, no dividas. La parte es menor que el total.")]]),
        instruction:fill(p("Round to {n}.", "Redondea a {n}."), {n:figs(P.sf)}),
        prompt:fill(c.text, {pct:show(pct), w:show(whole) + " " + unit, un:UNIT_NAMES[unit]}),
        explanation:fill(p("part = (percent ÷ 100) × whole = {dec} × {w} {eq} {ans} {u}. The part keeps the whole's units.", "parte = (porcentaje ÷ 100) × total = {dec} × {w} {eq} {ans} {u}. La parte conserva las unidades del total."),
          {dec:show(full(dec)), w:show(whole), eq:eq(x, P), ans:show(answer), u:unit})};
    }
    function makePart(random) {
      var key = pick(random, Object.keys(PARTS)), c = PARTS[key], k = int(random, 0, c.units.length - 1);
      for (;;) {
        var pct = key === "air" ? pick(random, ["21", "20.9"]) : amount(random, c.pct[0], c.pct[1], 2);
        var whole = amount(random, c.whole[k][0], c.whole[k][1], int(random, 2, 3)), params = [key, pct, whole, c.units[k]], q = partOfWhole(params);
        var a = q.display.split(" ")[0];
        if (sfOf(a) === q.precision.sf && M.magnitude(a) >= -2) return params;
      }
    }
    // Which setup gives the percent? Counts, with a percent that ends after at most one decimal place.
    var COUNTS = {
      seeds:{text:p("{n} of {N} seeds sprouted.", "{n} de {N} semillas germinaron."), ask:p("the percent of seeds that sprouted", "el porcentaje de semillas que germinaron"),
        rest:p("the percent of seeds that did not sprout", "el porcentaje de semillas que no germinaron")},
      absent:{text:p("{n} of the {N} students in a class are absent.", "{n} de los {N} estudiantes de un grupo faltaron."), ask:p("the percent of students who are absent", "el porcentaje de estudiantes que faltaron"),
        rest:p("the percent of students who are present", "el porcentaje de estudiantes que asistieron")},
      trials:{text:p("A reaction worked in {n} of {N} trials.", "Una reacción funcionó en {n} de {N} intentos."), ask:p("the percent of trials that worked", "el porcentaje de intentos que funcionaron"),
        rest:p("the percent of trials that did not work", "el porcentaje de intentos que no funcionaron")}
    };
    function setupQuestion(params) {
      var c = COUNTS[params[0]], n = params[1], N = params[2], pct = full(M.mul(M.div(n, N), "100"));
      var key = n + " ÷ " + N + " × 100";
      return {type:"mc", answer:0,
        prompt:join([fill(c.text, {n:n, N:N}), fill(p("Which calculation gives {ask}?", "¿Qué cálculo da {ask}?"), {ask:c.ask})]),
        choices:[
          {text:p(key, key), why:p("", "")},
          {text:p(N + " ÷ " + n + " × 100", N + " ÷ " + n + " × 100"), why:fill(p("This puts the whole on top. The whole, {N}, always goes on the bottom.", "Esto pone el total arriba. El total, {N}, siempre va abajo."), {N:N})},
          {text:p(n + " ÷ " + N, n + " ÷ " + N), why:NO100},
          {text:p("(" + N + " − " + n + ") ÷ " + N + " × 100", "(" + N + " − " + n + ") ÷ " + N + " × 100"), why:fill(p("This gives {rest}.", "Esto da {rest}."), {rest:c.rest})}
        ],
        explanation:fill(p("The whole is {N}, so it goes on the bottom: {n} ÷ {N} × 100 = {pct}%.", "El total es {N}, así que va abajo: {n} ÷ {N} × 100 = {pct}%."), {n:n, N:N, pct:show(pct)})};
    }
    function makeSetup(random) {
      var key = pick(random, Object.keys(COUNTS));
      for (;;) {
        var N = int(random, 12, 60), n = int(random, 1, N - 1), pct = full(M.mul(M.div(String(n), String(N)), "100"));
        if (pct !== null && (pct.split(".")[1] || "").length <= 1 && 2 * n !== N) return [key, String(n), String(N)];
      }
    }

    // Percent composition, from atomic masses (the lesson's values, and others given in the question) or from masses.
    var MASSES = {H:"1.01", C:"12.01", N:"14.01", O:"16.00", Na:"22.99", Mg:"24.31", Al:"26.98", S:"32.07", Cl:"35.45", K:"39.10", Ca:"40.08", Fe:"55.85", Cu:"63.55"};
    var NAMES = {H:p("hydrogen", "hidrógeno"), C:p("carbon", "carbono"), N:p("nitrogen", "nitrógeno"), O:p("oxygen", "oxígeno"), Na:p("sodium", "sodio"),
      Mg:p("magnesium", "magnesio"), Al:p("aluminum", "aluminio"), S:p("sulfur", "azufre"), Cl:p("chlorine", "cloro"), K:p("potassium", "potasio"),
      Ca:p("calcium", "calcio"), Fe:p("iron", "hierro"), Cu:p("copper", "cobre")};
    var FORMULAS = ["H2O", "CO2", "CH4", "NH3", "NO2", "N2O", "C2H6", "C3H8", "C6H12O6", "HNO3", "H2SO4", "NaCl", "MgO", "CaCO3", "Al2O3", "Fe2O3", "SO2", "KCl", "CuO", "CO",
      "MgCl2", "CaCl2", "KNO3", "Na2CO3", "NaHCO3", "Na2SO4"];
    function atoms(formula) {
      var out = [];
      formula.replace(/([A-Z][a-z]?)(\d*)/g, function (_, el, n) { out.push([el, Number(n || 1)]); return ""; });
      return out;
    }
    function sub(formula) { return formula.replace(/(\d+)/g, "<sub>$1</sub>"); }
    function list(items) {
      return items.length === 1 ? p(items[0], items[0]) : p(items.slice(0, -1).join(", ") + " and " + items[items.length - 1], items.slice(0, -1).join(", ") + " y " + items[items.length - 1]);
    }
    function compositionFromAtoms(params) {
      var f = params[0], el = params[1], parts = atoms(f), P = {decimals:2};
      var term = function (a) { return a[1] === 1 ? MASSES[a[0]] : a[1] + " × " + MASSES[a[0]]; };
      var molar = parts.reduce(function (s, a) { return M.add(s, M.mul(String(a[1]), MASSES[a[0]])); }, "0");
      var mine = parts.filter(function (a) { return a[0] === el; })[0], part = M.mul(String(mine[1]), MASSES[el]), x = M.mul(M.div(part, molar), "100");
      var molarText = M.fixed(molar, -2), partText = M.fixed(part, -2), name = NAMES[el], traps = [];
      if (mine[1] > 1) traps.push([M.mul(M.div(MASSES[el], molar), "100"), fill(p("Multiply the atomic mass by the subscript: {n} × {m} = {part}.", "Multiplica la masa atómica por el subíndice: {n} × {m} = {part}."), {n:String(mine[1]), m:MASSES[el], part:partText})]);
      if (parts.length === 2) traps.push([M.mul(M.div(part, M.sub(molar, part)), "100"), p("Divide by the molar mass of the whole compound, not by the other element.", "Divide entre la masa molar de todo el compuesto, no entre el otro elemento.")]);
      traps.push([M.div(part, molar), NO100]);
      return percentQuestion(x, P,
        fill(p("What is the percent by mass of {el} in {f}? Use {list}.", "¿Cuál es el porcentaje en masa de {el} en {f}? Usa {list}."),
          {el:name, f:sub(f), list:list(parts.map(function (a) { return a[0] + " = " + MASSES[a[0]]; }))}),
        join([fill(p("Molar mass of {f} = {sum} = {molar} g/mol.", "Masa molar de {f} = {sum} = {molar} g/mol."), {f:sub(f), sum:parts.map(term).join(" + "), molar:molarText}),
          mine[1] === 1 ? fill(p("Mass of {el}: {part} g/mol.", "Masa de {el}: {part} g/mol."), {el:name, part:partText}) :
            fill(p("Mass of {el}: {term} = {part} g/mol.", "Masa de {el}: {term} = {part} g/mol."), {el:name, term:term(mine), part:partText}),
          fill(p("Percent {el} = {part} ÷ {molar} × 100 {eq} {ans}%.", "Porcentaje de {el} = {part} ÷ {molar} × 100 {eq} {ans}%."), {el:name, part:partText, molar:molarText, eq:eq(x, P), ans:show(M.write(x, P, "plain"))})]),
        traps);
    }
    function makeAtoms(random) {
      var f = pick(random, FORMULAS);
      return [f, pick(random, atoms(f))[0]];
    }
    // From measured masses: a sample's mass and one element's mass, or the masses of both elements.
    var BINARY = ["H2O", "MgO", "NaCl", "CuO", "Fe2O3", "Al2O3", "CO2", "SO2", "KCl", "CaO"];
    function compositionFromMasses(params) {
      var f = params[1], els = atoms(f).map(function (a) { return a[0]; }), first = params[2] === "0" ? 0 : 1, el = els[first], other = els[1 - first];
      var E = params[3], whole, sumText, n;
      if (params[0] === "e") {
        var E2 = params[4], sum = M.add(E, E2), d = Math.max((E.split(".")[1] || "").length, (E2.split(".")[1] || "").length);
        sumText = M.fixed(sum, -d); whole = sumText; n = Math.min(sfOf(E), sfOf(sumText));
      } else { whole = params[4]; n = Math.min(sfOf(E), sfOf(whole)); }
      var P = {sf:n}, x = M.mul(M.div(E, whole), "100"), ans = M.write(x, P, "plain"), rest = M.fixed(M.sub("100", M.rounded(x, P).value), M.rounded(x, P).place);
      var traps = [[M.mul(M.div(whole, E), "100"), p("The compound's mass goes on the bottom: element ÷ compound. A part cannot be more than 100% of the whole.", "La masa del compuesto va abajo: elemento ÷ compuesto. Una parte no puede ser más del 100% del total.")]];
      if (params[0] === "e") traps.push([M.mul(M.div(E, params[4]), "100"), fill(p("Divide by the mass of the whole compound: {a} + {b} = {s} g.", "Divide entre la masa de todo el compuesto: {a} + {b} = {s} g."), {a:show(E), b:show(params[4]), s:show(sumText)})]);
      traps.push([M.div(E, whole), NO100]);
      var prompt = params[0] === "e" ?
        fill(p("A sample of {f} breaks down into {a} g of {el} and {b} g of {other}. What is the percent {el} by mass?", "Una muestra de {f} se descompone en {a} g de {el} y {b} g de {other}. ¿Cuál es el porcentaje en masa de {el}?"),
          {f:sub(f), a:show(E), b:show(params[4]), el:NAMES[el], other:NAMES[other]}) :
        fill(p("A {s} g sample of {f} contains {a} g of {el}. What is the percent {el} by mass?", "Una muestra de {s} g de {f} contiene {a} g de {el}. ¿Cuál es el porcentaje en masa de {el}?"),
          {f:sub(f), s:show(whole), a:show(E), el:NAMES[el]});
      var steps = [];
      if (params[0] === "e") steps.push(fill(p("The compound's mass is {a} + {b} = {s} g.", "La masa del compuesto es {a} + {b} = {s} g."), {a:show(E), b:show(params[4]), s:show(sumText)}));
      steps.push(fill(p("Percent {el} = {a} ÷ {s} × 100 {eq} {ans}%.", "Porcentaje de {el} = {a} ÷ {s} × 100 {eq} {ans}%."), {el:NAMES[el], a:show(E), s:show(whole), eq:eq(x, P), ans:show(ans)}));
      steps.push(fill(p("The rest, {rest}%, is {other}, so the percents add up to 100%.", "El resto, {rest}%, es {other}, así que los porcentajes suman 100%."), {rest:show(rest), other:NAMES[other]}));
      return percentQuestion(x, P, prompt, join(steps), traps);
    }
    function makeMasses(random) {
      for (;;) {
        var f = pick(random, BINARY), parts = atoms(f), first = int(random, 0, 1), both = random() < 0.5;
        var molar = parts.reduce(function (s, a) { return M.add(s, M.mul(String(a[1]), MASSES[a[0]])); }, "0");
        var share = M.toNumber(M.div(M.mul(String(parts[first][1]), MASSES[parts[first][0]]), molar)), params;
        if (both) {
          var total = 2 + random() * 28, a = M.fixed(M.roundAt(String(total * share), -2), -2), b = M.fixed(M.roundAt(String(total * (1 - share)), -2), -2);
          params = ["e", f, String(first), a, b];
        } else {
          var s = amount(random, 2, 60, 3);
          params = ["s", f, String(first), M.write(String(Number(s) * share), {sf:3}, "plain"), s];
        }
        var q = compositionFromMasses(params);
        if (M.sign(params[3]) > 0 && M.sign(params[4]) > 0 && sfOf(params[3]) >= 2 && sfOf(q.display.split(" ")[0]) === q.precision.sf) return params;
      }
    }

    // Percent yield = actual yield ÷ theoretical yield × 100.
    var PRODUCTS = ["MgO", "NaCl", "CaCO3", "Cu", "Ag", "PbI2", "BaSO4", "Fe2O3", "ZnO", "CuO"];
    function yieldQuestion(params) {
      var f = params[0], T = params[1], A = params[2], P = {sf:Math.min(sfOf(T), sfOf(A))}, x = M.mul(M.div(A, T), "100");
      return percentQuestion(x, P,
        fill(p("The theoretical yield of a reaction is {t} g of {f}. You collect {a} g. What is the percent yield?", "El rendimiento teórico de una reacción es de {t} g de {f}. Obtienes {a} g. ¿Cuál es el rendimiento porcentual?"), {t:show(T), a:show(A), f:sub(f)}),
        fill(p("Percent yield = actual yield ÷ theoretical yield × 100 = {a} ÷ {t} × 100 {eq} {ans}%.", "Rendimiento porcentual = rendimiento real ÷ rendimiento teórico × 100 = {a} ÷ {t} × 100 {eq} {ans}%."),
          {a:show(A), t:show(T), eq:eq(x, P), ans:show(M.write(x, P, "plain"))}),
        [[M.mul(M.div(T, A), "100"), p("The theoretical yield goes on the bottom: actual ÷ theoretical. A percent yield over 100% means the values are switched.", "El rendimiento teórico va abajo: real ÷ teórico. Un rendimiento porcentual mayor que 100% indica que los valores están invertidos.")],
          [M.div(A, T), NO100]]);
    }
    function makeYield(random) {
      for (;;) {
        var T = amount(random, 5, 80, int(random, 2, 3)), A = amount(random, Number(T) * 0.5, Number(T) * 0.98, int(random, 2, 3)), params = [pick(random, PRODUCTS), T, A];
        var q = yieldQuestion(params);
        if (M.cmp(A, T) < 0 && sfOf(q.display.split(" ")[0]) === q.precision.sf) return params;
      }
    }
    function yieldSetup(params) {
      var T = params[0], A = params[1], P = {sf:Math.min(sfOf(T), sfOf(A))}, x = M.mul(M.div(A, T), "100");
      var key = show(A) + " ÷ " + show(T) + " × 100";
      return {type:"mc", answer:0,
        prompt:fill(p("A reaction has a theoretical yield of {t} g. You collect {a} g. Which calculation gives the percent yield?", "Una reacción tiene un rendimiento teórico de {t} g. Obtienes {a} g. ¿Qué cálculo da el rendimiento porcentual?"), {t:show(T), a:show(A)}),
        choices:[
          {text:p(key, key), why:p("", "")},
          {text:p(show(T) + " ÷ " + show(A) + " × 100", show(T) + " ÷ " + show(A) + " × 100"), why:p("This puts the theoretical yield on top, so it gives more than 100%. The actual yield goes on top.", "Esto pone el rendimiento teórico arriba, así que da más de 100%. El rendimiento real va arriba.")},
          {text:p(show(A) + " ÷ " + show(T), show(A) + " ÷ " + show(T)), why:NO100},
          {text:p("(" + show(T) + " − " + show(A) + ") ÷ " + show(T) + " × 100", "(" + show(T) + " − " + show(A) + ") ÷ " + show(T) + " × 100"), why:p("This is the percent of the product that was lost, not the percent yield.", "Este es el porcentaje del producto que se perdió, no el rendimiento porcentual.")}
        ],
        explanation:fill(p("Percent yield = actual yield ÷ theoretical yield × 100 = {key} {eq} {ans}%.", "Rendimiento porcentual = rendimiento real ÷ rendimiento teórico × 100 = {key} {eq} {ans}%."),
          {key:key, eq:eq(x, P), ans:show(M.write(x, P, "plain"))})};
    }
    function makeYieldSetup(random) {
      var params = makeYield(random);
      return [params[1], params[2]];
    }

    var topics = [
      {id:"convert", title:p("Percents and decimals", "Porcentajes y decimales")},
      {id:"whole", title:p("Percent of a whole", "Porcentaje de un total")},
      {id:"composition", title:p("Percent composition", "Composición porcentual")},
      {id:"yield", title:p("Percent yield", "Rendimiento porcentual")}
    ];
    var generators = [
      {key:"cd", topic:"convert", make:function (r) { return [percentText(r)]; }, build:toDecimal},
      {key:"cp", topic:"convert", make:function (r) { return [M.fixed(M.div(percentText(r), "100"), -12).replace(/0+$/, "")]; }, build:toPercent},
      {key:"wp", topic:"whole", make:makeWhole, build:percentOfWhole},
      {key:"wa", topic:"whole", make:makePart, build:partOfWhole},
      {key:"ws", topic:"whole", make:function (r) { return makeSetup(r); }, build:setupQuestion},
      {key:"ca", topic:"composition", make:makeAtoms, build:compositionFromAtoms},
      {key:"cm", topic:"composition", make:makeMasses, build:compositionFromMasses},
      {key:"yp", topic:"yield", make:makeYield, build:yieldQuestion},
      {key:"ys", topic:"yield", make:makeYieldSetup, build:yieldSetup}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/ratios-and-percents/percents/",
      copy:{title:"Percents Practice", es:{
        "Percents Practice":"Práctica de porcentajes",
        "Quantitative Skills · Ratios and Percents":"Habilidades cuantitativas · Razones y porcentajes",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type your answer. The % sign is optional. When the answer is an amount, type its unit after the number.":"Escribe tu respuesta. El signo % es opcional. Cuando la respuesta es una cantidad, escribe su unidad después del número.",
        "Round as the line under the question says. Significant figures are advice here, not scored.":"Redondea como indica la línea debajo de la pregunta. Aquí las cifras significativas son una sugerencia y no cuentan en la puntuación.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 0.35, 84.0 or 0.38 kg.":"Escribe un número como 0.35, 84.0 o 0.38 kg.",
        "Reference":"Consulta", "Percent rules":"Reglas de los porcentajes",
        "Percent means per hundred: 35% = 35/100 = 0.35.":"Porcentaje significa por cada cien: 35% = 35/100 = 0.35.",
        "Percent to decimal: move the decimal point 2 places left (4.5% = 0.045). Decimal to percent: move it 2 places right.":"De porcentaje a decimal: mueve el punto decimal 2 lugares a la izquierda (4.5% = 0.045). De decimal a porcentaje: muévelo 2 lugares a la derecha.",
        "percent = part ÷ whole × 100. The whole always goes on the bottom.":"porcentaje = parte ÷ total × 100. El total siempre va abajo.",
        "part = (percent ÷ 100) × whole. The part has the same units as the whole.":"parte = (porcentaje ÷ 100) × total. La parte tiene las mismas unidades que el total.",
        "Percent composition = mass of the element ÷ mass of the compound × 100. All the percents add up to about 100%.":"Composición porcentual = masa del elemento ÷ masa del compuesto × 100. Todos los porcentajes suman cerca de 100%.",
        "Percent yield = actual yield ÷ theoretical yield × 100.":"Rendimiento porcentual = rendimiento real ÷ rendimiento teórico × 100.",
        "Atomic masses from the lesson: H = 1.01, C = 12.01, N = 14.01, O = 16.00. Questions give any others.":"Masas atómicas de la lección: H = 1.01, C = 12.01, N = 14.01, O = 16.00. Las preguntas dan las demás.",
        "Practice for the Percents lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Porcentajes de Habilidades cuantitativas. Preguntas originales de ZornScience."
      }}});
  }
  if (typeof module === "object" && module.exports) { module.exports = build; return; }
  var root = document.querySelector('[data-zsa-activity="' + SLUG + '"]'), M = null;
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-model", {detail:{receive:function (api) { M = api; }}}));
  if (!M) return;
  var bank = build(M);
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
