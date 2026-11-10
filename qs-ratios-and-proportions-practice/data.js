(function () {
  "use strict";
  // Ratios and Proportions Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The rules follow the lesson on zornscience.org: a ratio is written 3 : 2, 3 to 2 or 3/2, the first quantity named
  // goes first, simplify by dividing both numbers by the same factor, change to the same units first, and in a balanced
  // equation the coefficients give the mole ratio. A proportion is two equal ratios with the same units in the same
  // spots; cross-multiply, then divide. Significant figures are advice here: the line under each question says how many.
  var SLUG = "qs-ratios-and-proportions-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    // Spanish contractions: "de el" is "del" and "a el" is "al" ("la relación del volumen del matraz al volumen...").
    function contract(pair) { return p(pair.en, pair.es.replace(/\bde el\b/g, "del").replace(/\ba el\b/g, "al")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;
    function sfOf(text) { return M.read(text).sf; }
    // Every digit of a terminating decimal ("126", "0.375"), or null when it does not end.
    function full(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return M.fixed(value, -k);
      return null;
    }
    // A ratio in simplest form from two amounts in the same units: ratio("12", "8") is "3 : 2".
    function ratio(a, b) { var f = M.div(a, b); return f.n + " : " + f.d; }
    function gcd(a, b) { while (b) { var r = a % b; a = b; b = r; } return a; }
    // A measurement between lo and hi with exactly n significant figures that standard notation can show.
    function amount(random, lo, hi, n) {
      for (;;) {
        var text = M.write(String(lo + random() * (hi - lo)), {sf:n}, "plain");
        if (sfOf(text) === n && M.sign(text) > 0) return text;
      }
    }
    function round(n) { return fill(p("Round to {n}.", "Redondea a {n}."), {n:figs(n)}); }
    // A usable numeric question: standard notation shows the answer's significant figures, and the size is realistic.
    function usable(q) { var a = q.display.split(" ")[0]; return sfOf(a) === q.precision.sf && M.magnitude(a) >= -2 && M.magnitude(a) <= 3; }
    var ACCEPT = {
      km:["km", "kilometers", "kilometer", "kilometres", "kilómetros", "kilómetro"],
      cm:["cm", "centimeters", "centimeter", "centimetres", "centímetros", "centímetro"],
      g:["g", "grams", "gram", "gramos", "gramo"],
      mL:["mL", "ml", "milliliters", "milliliter", "millilitres", "mililitros", "mililitro"],
      min:["min", "minutes", "minute", "minutos", "minuto"],
      N:["N", "newtons", "newton"]
    };
    // Shuffled choices are checked for repeats by the caller; the key is always first.
    function distinct(texts) { return new Set(texts).size === texts.length; }

    // Writing ratios from counts. Order matters: the first quantity named goes first.
    function item(en, es, the) { return {en:en, es:es, the:the}; }
    var COUNTS = {
      marbles:{text:p("A bag holds {a} red marbles and {b} blue marbles.", "Una bolsa tiene {a} canicas rojas y {b} canicas azules."),
        a:item("red marbles", "canicas rojas", "las canicas rojas"), b:item("blue marbles", "canicas azules", "las canicas azules"), all:p("marbles", "canicas")},
      plants:{text:p("In a pea plant cross, {a} plants are tall and {b} plants are short.", "En una cruza de plantas de chícharo, {a} plantas son altas y {b} plantas son bajas."),
        a:item("tall plants", "plantas altas", "las plantas altas"), b:item("short plants", "plantas bajas", "las plantas bajas"), all:p("plants", "plantas")},
      glassware:{text:p("A lab shelf holds {a} beakers and {b} flasks.", "Un estante del laboratorio tiene {a} vasos de precipitados y {b} matraces."),
        a:item("beakers", "vasos de precipitados", "los vasos de precipitados"), b:item("flasks", "matraces", "los matraces"), all:p("pieces of glassware", "piezas de vidrio")}
    };
    function countQuestion(params) {
      var c = COUNTS[params[0]], a = params[1], b = params[2], flip = params[3] === "ba";
      var first = flip ? c.b : c.a, second = flip ? c.a : c.b, f = flip ? b : a, s = flip ? a : b, g = gcd(Number(f), Number(s)), total = String(Number(a) + Number(b));
      var key = ratio(f, s), reverse = ratio(s, f), raw = f + " : " + s, whole = ratio(f, total);
      var the = function (x) { return p("the " + x.en, x.the); };
      return {type:"mc", answer:0,
        prompt:join([fill(c.text, {a:a, b:b}), fill(p("What is the ratio of {x} to {y}, in simplest form?", "¿Cuál es la relación de {x} a {y} en su forma más simple?"), {x:first, y:second})]),
        choices:[
          {text:p(key, key), why:p("", "")},
          {text:p(reverse, reverse), why:fill(p("This is the reverse order. The ratio of {x} to {y} puts {thex} first.", "Este es el orden inverso. La relación de {x} a {y} pone primero {thex}."), {x:first, y:second, thex:the(first)})},
          {text:p(raw, raw), why:fill(p("The order is right, but this is not in simplest form. Divide both numbers by {g}.", "El orden es correcto, pero no está en su forma más simple. Divide ambos números entre {g}."), {g:String(g)})},
          {text:p(whole, whole), why:fill(p("This compares {thex} to all {n} {all}, not to {they}.", "Esto compara {thex} con el total de {n} {all}, no con {they}."), {thex:the(first), they:the(second), n:total, all:c.all})}
        ],
        explanation:fill(p("The {x} come first: {f} : {s}. Both numbers divide by {g}, so the ratio is {key}.", "Primero van {thex}: {f} : {s}. Ambos números se dividen entre {g}, así que la relación es {key}."),
          {x:first.en, thex:first.the, f:f, s:s, g:String(g), key:key})};
    }
    function makeCount(random) {
      var key = pick(random, Object.keys(COUNTS));
      for (;;) {
        var x = int(random, 1, 9), y = int(random, 1, 9), k = int(random, 2, 7);
        if (x === y || gcd(x, y) !== 1 || k * Math.max(x, y) > 60) continue;
        return [key, String(k * x), String(k * y), random() < 0.5 ? "ab" : "ba"];
      }
    }

    // Writing ratios with units that must match first (50 cm : 2 m is 50 cm : 200 cm, or 1 : 4).
    var UNITS = {
      length:{small:"cm", big:"m", factor:100, a:[20, 90], b:["1", "1.2", "1.5", "1.8", "2", "2.4", "2.5", "3", "4"],
        text:p("A string is {a} long, and a rope is {b} long.", "Un hilo mide {a} de largo y una cuerda mide {b} de largo."),
        qa:p("the string's length", "la longitud del hilo"), qb:p("the rope's length", "la longitud de la cuerda")},
      mass:{small:"g", big:"kg", factor:1000, a:[50, 800], b:["1", "1.5", "2", "2.5", "3", "4", "5"],
        text:p("A scoop of salt has a mass of {a}, and the whole bag has a mass of {b}.", "Una porción de sal tiene una masa de {a}, y la bolsa completa tiene una masa de {b}."),
        qa:p("the scoop's mass", "la masa de la porción"), qb:p("the bag's mass", "la masa de la bolsa")},
      volume:{small:"mL", big:"L", factor:1000, a:[50, 800], b:["1", "1.5", "2", "2.5", "3", "4"],
        text:p("A flask holds {a} of water, and a bottle holds {b}.", "Un matraz contiene {a} de agua y una botella contiene {b}."),
        qa:p("the flask's volume", "el volumen del matraz"), qb:p("the bottle's volume", "el volumen de la botella")},
      time:{small:"min", big:"h", factor:60, a:[10, 55], b:["1", "1.5", "2", "2.5", "3"],
        text:p("A reaction takes {a} to finish, and a second reaction takes {b}.", "Una reacción tarda {a} en terminar y una segunda reacción tarda {b}."),
        qa:p("the first reaction's time", "el tiempo de la primera reacción"), qb:p("the second reaction's time", "el tiempo de la segunda reacción")}
    };
    // The amounts in the small unit, and the four choices in the order asked: key, reverse, units not matched, not simplified.
    function unitParts(params) {
      var c = UNITS[params[0]], a = params[1], b = params[2], flip = params[3] === "ba", B = M.fixed(M.mul(b, String(c.factor)), 0);
      var f = flip ? B : a, s = flip ? a : B;
      return {c:c, a:a, b:b, B:B, flip:flip, f:f, s:s, g:gcd(Number(f), Number(s)),
        texts:[ratio(f, s), ratio(s, f), flip ? ratio(b, a) : ratio(a, b), f + " : " + s]};
    }
    function unitQuestion(params) {
      var u = unitParts(params), c = u.c, first = u.flip ? c.qb : c.qa, second = u.flip ? c.qa : c.qb;
      var bText = show(u.b) + " " + c.big, BText = show(u.B) + " " + c.small;
      return {type:"mc", answer:0,
        prompt:contract(join([fill(c.text, {a:show(u.a) + " " + c.small, b:bText}), fill(p("What is the ratio of {x} to {y}, in simplest form?", "¿Cuál es la relación de {x} a {y} en su forma más simple?"), {x:first, y:second})])),
        choices:[
          {text:p(u.texts[0], u.texts[0]), why:p("", "")},
          {text:p(u.texts[1], u.texts[1]), why:fill(p("This is the reverse order. Write {x} first.", "Este es el orden inverso. Escribe primero {x}."), {x:first})},
          {text:p(u.texts[2], u.texts[2]), why:fill(p("The units do not match. Change {b} to {B} first.", "Las unidades no coinciden. Primero cambia {b} a {B}."), {b:bText, B:BText})},
          {text:p(u.texts[3], u.texts[3]), why:fill(p("The units match and the order is right, but this is not in simplest form. Divide both numbers by {g}.", "Las unidades coinciden y el orden es correcto, pero no está en su forma más simple. Divide ambos números entre {g}."), {g:String(u.g)})}
        ],
        explanation:fill(p("Change to the same units: {b} = {B}. In order, that is {f} : {s}, and dividing both by {g} gives {key}.", "Cambia a las mismas unidades: {b} = {B}. En orden queda {f} : {s}, y al dividir ambos entre {g} queda {key}."),
          {b:bText, B:BText, f:show(u.f), s:show(u.s), g:String(u.g), key:u.texts[0]})};
    }
    function makeUnit(random) {
      var key = pick(random, Object.keys(UNITS)), c = UNITS[key];
      for (;;) {
        var a = String(int(random, c.a[0], c.a[1])), b = pick(random, c.b), params = [key, a, b, random() < 0.5 ? "ab" : "ba"], u = unitParts(params);
        var terms = u.texts[0].split(" : ").map(Number);
        if (Number(u.B) <= Number(a) || u.g < 2 || Math.max.apply(null, terms) > 40 || !distinct(u.texts)) continue;
        return params;
      }
    }

    // Proportions: q V / p U = x V / c U, so p · x = q · c and x = q · c ÷ p. Same units in the same spots.
    function proportion(o) {
      var x = M.div(M.mul(o.q, o.c), o.p), P = {sf:o.n}, answer = M.write(x, P, "plain"), product = full(M.mul(o.q, o.c));
      var exactly = full(x) !== null && M.cmp(M.rounded(x, P).value, x) === 0;
      var traps = [], seen = [answer];
      [[M.div(M.mul(o.p, o.c), o.q), p("Keep the same units in the same spots: {V} on top on both sides.", "Mantén las mismas unidades en los mismos lugares: {V} arriba en ambos lados.")],
        [M.mul(o.q, o.c), p("After you cross-multiply, divide by {p}.", "Después de multiplicar en cruz, divide entre {p}.")]].forEach(function (t) {
        var w = M.write(t[0], P, "plain");
        if (seen.indexOf(w) < 0) { seen.push(w); traps.push({answer:t[0].n + "/" + t[0].d, note:fill(t[1], {V:o.V, p:show(o.p)})}); }
      });
      return {type:"numeric", answer:x.n + "/" + x.d, precision:P, unit:o.V, accept:ACCEPT[o.V], check:{sf:"advice", unit:"optional"},
        display:answer + " " + o.V, answerText:p(show(answer) + " " + o.V, show(answer) + " " + o.V), traps:traps, instruction:round(o.n), prompt:o.prompt,
        explanation:fill(p("Keep the same units in the same spots: {q} {V} / {p} {U} = x {V} / {c} {U}. Cross-multiply: {p} · x = {q} · {c} = {prod}. Divide by {p}: x {eq} {ans} {V}.",
          "Mantén las mismas unidades en los mismos lugares: {q} {V} / {p} {U} = x {V} / {c} {U}. Multiplica en cruz: {p} · x = {q} · {c} = {prod}. Divide entre {p}: x {eq} {ans} {V}."),
          {q:show(o.q), p:show(o.p), c:show(o.c), U:o.U, V:o.V, prod:show(product), eq:exactly ? "=" : "≈", ans:show(answer)})};
    }
    // A map scale A cm = B km is exact, so only the measured distance sets the significant figures.
    var SCALES = [["2", "15"], ["2", "25"], ["4", "25"], ["5", "20"], ["2", "5"], ["4", "10"], ["5", "40"], ["2", "35"], ["4", "15"]];
    function mapQuestion(params) {
      var A = params[1], B = params[2], C = params[3], back = params[0] === "b";
      var scale = p("On a map, " + A + " cm = " + B + " km.", "En un mapa, " + A + " cm = " + B + " km.");
      var ask = back ? fill(p("Two towns are {c} km apart. How many centimeters apart are they on the map?", "Dos pueblos están a {c} km de distancia. ¿A cuántos centímetros están en el mapa?"), {c:show(C)}) :
        fill(p("Two towns are {c} cm apart on the map. How many kilometers apart are they?", "Dos pueblos están a {c} cm en el mapa. ¿A cuántos kilómetros están en realidad?"), {c:show(C)});
      return proportion(back ? {p:B, U:"km", q:A, V:"cm", c:C, n:sfOf(C), prompt:join([scale, ask])} : {p:A, U:"cm", q:B, V:"km", c:C, n:sfOf(C), prompt:join([scale, ask])});
    }
    function makeMap(random) {
      var s = pick(random, SCALES), back = random() < 0.4, n = int(random, 2, 3), kmPerCm = Number(s[1]) / Number(s[0]);
      for (;;) {
        var C = back ? amount(random, 1.5 * kmPerCm, 20 * kmPerCm, n) : amount(random, 1.5, 20, n), params = [back ? "b" : "f", s[0], s[1], C];
        if (usable(mapQuestion(params))) return params;
      }
    }
    // Concentrations: grams of a solute in a volume of solution.
    var SOLUTES = {salt:p("salt", "sal"), sugar:p("sugar", "azúcar"), soda:p("baking soda", "bicarbonato de sodio")};
    function mixQuestion(params) {
      var s = SOLUTES[params[1]], A = params[2], B = params[3], C = params[4], back = params[0] === "b", n = Math.min(sfOf(A), sfOf(B), sfOf(C));
      var known = fill(p("A solution has {b} g of {s} in {a} mL.", "Una solución tiene {b} g de {s} en {a} mL."), {a:show(A), b:show(B), s:s});
      if (back) return proportion({p:B, U:"g", q:A, V:"mL", c:C, n:n,
        prompt:join([known, fill(p("What volume of this solution, in milliliters, holds {c} g of {s}?", "¿Qué volumen de esta solución, en mililitros, contiene {c} g de {s}?"), {c:show(C), s:s})])});
      return proportion({p:A, U:"mL", q:B, V:"g", c:C, n:n,
        prompt:join([known, fill(p("How many grams of {s} are in {c} mL of this solution?", "¿Cuántos gramos de {s} hay en {c} mL de esta solución?"), {c:show(C), s:s})])});
    }
    function makeMix(random) {
      var key = pick(random, Object.keys(SOLUTES)), back = random() < 0.4;
      for (;;) {
        var A = amount(random, 50, 500, int(random, 2, 3)), B = amount(random, Number(A) * 0.01, Number(A) * 0.3, int(random, 2, 3));
        var C = back ? amount(random, Number(B) * 0.1, Number(B) * 3, int(random, 2, 3)) : amount(random, 10, 900, int(random, 2, 3));
        var params = [back ? "b" : "f", key, A, B, C];
        if (M.cmp(C, back ? B : A) !== 0 && usable(mixQuestion(params))) return params;
      }
    }
    // Rates: a train's distance and time, and a spring's force and stretch.
    function rateQuestion(params) {
      var A = params[2], B = params[3], C = params[4], back = params[1] === "b", n = Math.min(sfOf(A), sfOf(B), sfOf(C));
      if (params[0] === "train") {
        var trip = fill(p("A train travels {b} km in {a} min.", "Un tren recorre {b} km en {a} min."), {a:show(A), b:show(B)});
        if (back) return proportion({p:B, U:"km", q:A, V:"min", c:C, n:n,
          prompt:join([trip, fill(p("At the same speed, how many minutes does it take to travel {c} km?", "A la misma rapidez, ¿cuántos minutos tarda en recorrer {c} km?"), {c:show(C)})])});
        return proportion({p:A, U:"min", q:B, V:"km", c:C, n:n,
          prompt:join([trip, fill(p("At the same speed, how many kilometers does it travel in {c} min?", "A la misma rapidez, ¿cuántos kilómetros recorre en {c} min?"), {c:show(C)})])});
      }
      var pull = fill(p("A force of {a} N stretches a spring {b} cm.", "Una fuerza de {a} N estira un resorte {b} cm."), {a:show(A), b:show(B)});
      if (back) return proportion({p:A, U:"N", q:B, V:"cm", c:C, n:n,
        prompt:join([pull, fill(p("How many centimeters does a force of {c} N stretch it?", "¿Cuántos centímetros lo estira una fuerza de {c} N?"), {c:show(C)})])});
      return proportion({p:B, U:"cm", q:A, V:"N", c:C, n:n,
        prompt:join([pull, fill(p("How many newtons of force stretch it {c} cm?", "¿Cuántos newtons de fuerza lo estiran {c} cm?"), {c:show(C)})])});
    }
    function makeRate(random) {
      var train = random() < 0.5, back = random() < 0.4;
      for (;;) {
        var A, B, C;
        if (train) { A = amount(random, 12, 60, int(random, 2, 3)); B = amount(random, Number(A) * 0.5, Number(A) * 1.6, int(random, 2, 3)); }
        else { A = amount(random, 1, 12, int(random, 2, 3)); B = amount(random, 1, 15, int(random, 2, 3)); }
        var base = back ? (train ? B : A) : (train ? A : B);
        C = amount(random, Number(base) * 0.3, Number(base) * 3, int(random, 2, 3));
        var params = [train ? "train" : "spring", back ? "b" : "f", A, B, C];
        if (M.cmp(C, base) !== 0 && usable(rateQuestion(params))) return params;
      }
    }

    // Balanced equations. Written "2 H2 + O2 = 2 H2O"; shown with subscripts and an arrow.
    var EQUATIONS = ["2 H2 + O2 = 2 H2O", "N2 + 3 H2 = 2 NH3", "4 Fe + 3 O2 = 2 Fe2O3", "CH4 + 2 O2 = CO2 + 2 H2O", "2 Mg + O2 = 2 MgO",
      "2 Na + Cl2 = 2 NaCl", "4 Al + 3 O2 = 2 Al2O3", "C3H8 + 5 O2 = 3 CO2 + 4 H2O", "2 KClO3 = 2 KCl + 3 O2", "2 H2O2 = 2 H2O + O2",
      "2 SO2 + O2 = 2 SO3", "Fe2O3 + 3 CO = 2 Fe + 3 CO2", "2 C2H6 + 7 O2 = 4 CO2 + 6 H2O", "Zn + 2 HCl = ZnCl2 + H2", "P4 + 5 O2 = P4O10",
      "N2 + 2 O2 = 2 NO2", "2 Al + 3 Cl2 = 2 AlCl3", "C6H12O6 + 6 O2 = 6 CO2 + 6 H2O"];
    function sub(formula) { return formula.replace(/(\d+)/g, "<sub>$1</sub>"); }
    var SUBS = "₀₁₂₃₄₅₆₇₈₉";
    function equation(index) {
      var sides = EQUATIONS[index].split(" = "), species = [];
      sides.forEach(function (side, s) {
        side.split(" + ").forEach(function (term) {
          var m = term.match(/^(?:(\d+) )?(\S+)$/);
          species.push({c:Number(m[1] || 1), t:m[2], f:sub(m[2]), product:s === 1});
        });
      });
      var text = sides.map(function (side) { return side.split(" + ").map(function (term) { return term.replace(/^(\d+ )?(\S+)$/, function (_, c, f) { return (c || "") + sub(f); }); }).join(" + "); }).join(" → ");
      return {species:species, text:text};
    }
    function moleUnits(t) {
      var plain = t, fancy = t.replace(/\d/g, function (d) { return SUBS[Number(d)]; }), out = ["mol", "mole", "moles"];
      [plain, fancy].forEach(function (f) { ["mol ", "moles ", "mol of ", "moles of ", "mol de ", "moles de "].forEach(function (w) { out.push(w + f); }); });
      return out;
    }
    function ratioQuestion(params) {
      var e = equation(Number(params[0])), X = e.species[Number(params[1])], Y = e.species[Number(params[2])], Z = e.species[Number(params[3])];
      var key = X.c + " : " + Y.c, parts = [fill(p("The coefficients give the mole ratio: {cx} for {x} and {cy} for {y}, so {x} : {y} = {key}.", "Los coeficientes dan la relación molar: {cx} para {x} y {cy} para {y}, así que {x} : {y} = {key}."),
        {cx:String(X.c), cy:String(Y.c), x:X.f, y:Y.f, key:key})];
      if (X.c === 1 || Y.c === 1) parts.push(p("A formula with no number in front has a coefficient of 1.", "Una fórmula sin número al frente tiene coeficiente 1."));
      return {type:"mc", answer:0,
        prompt:fill(p("In the balanced equation {eq}, what is the mole ratio of {x} to {y}?", "En la ecuación balanceada {eq}, ¿cuál es la relación molar de {x} a {y}?"), {eq:e.text, x:X.f, y:Y.f}),
        choices:[
          {text:p(key, key), why:p("", "")},
          {text:p(Y.c + " : " + X.c, Y.c + " : " + X.c), why:fill(p("This is the reverse order. {x} comes first, so its coefficient, {cx}, goes first.", "Este es el orden inverso. {x} va primero, así que su coeficiente, {cx}, va primero."), {x:X.f, cx:String(X.c)})},
          {text:p(X.c + " : " + Z.c, X.c + " : " + Z.c), why:fill(p("This uses the coefficient of {z}, not {y}.", "Esto usa el coeficiente de {z}, no el de {y}."), {z:Z.f, y:Y.f})},
          {text:p("1 : 1", "1 : 1"), why:fill(p("The coefficients give the mole ratio. {x} has {cx} and {y} has {cy}, so it is not 1 : 1.", "Los coeficientes dan la relación molar. {x} tiene {cx} y {y} tiene {cy}, así que no es 1 : 1."), {x:X.f, y:Y.f, cx:String(X.c), cy:String(Y.c)})}
        ],
        explanation:join(parts)};
    }
    function makeRatio(random) {
      for (;;) {
        var i = int(random, 0, EQUATIONS.length - 1), s = equation(i).species, x = int(random, 0, s.length - 1), y = int(random, 0, s.length - 1);
        if (x === y || s[x].c === s[y].c || gcd(s[x].c, s[y].c) !== 1) continue;
        var others = [];
        s.forEach(function (z, k) { if (k !== x && k !== y && z.c !== s[y].c && !(s[x].c === 1 && z.c === 1)) others.push(k); });
        if (!others.length) continue;
        return [String(i), String(x), String(y), String(pick(random, others))];
      }
    }
    // Moles from moles: cX mol X / cY mol Y = G mol X / x, so cX · x = cY · G.
    function molesQuestion(params) {
      var e = equation(Number(params[0])), X = e.species[Number(params[1])], Y = e.species[Number(params[2])], G = params[3], n = sfOf(G), P = {sf:n};
      var x = M.div(M.mul(G, String(Y.c)), String(X.c)), answer = M.write(x, P, "plain"), exactly = full(x) !== null && M.cmp(M.rounded(x, P).value, x) === 0;
      var ask = !X.product && Y.product ? p("how many moles of {y} form from {g} mol of {x}?", "¿cuántos moles de {y} se forman a partir de {g} mol de {x}?") :
        !X.product ? p("how many moles of {y} react with {g} mol of {x}?", "¿cuántos moles de {y} reaccionan con {g} mol de {x}?") :
        p("how many moles of {y} are needed to make {g} mol of {x}?", "¿cuántos moles de {y} se necesitan para producir {g} mol de {x}?");
      var traps = [], seen = [answer];
      [[M.div(M.mul(G, String(X.c)), String(Y.c)), p("The ratio is upside down. Put the coefficient of {y}, {cy}, on top.", "La relación está invertida. Pon arriba el coeficiente de {y}, {cy}.")],
        [M.exact(G), p("Use the mole ratio from the coefficients. It is {cy} : {cx}, not 1 : 1.", "Usa la relación molar de los coeficientes. Es {cy} : {cx}, no 1 : 1.")]].forEach(function (t) {
        var w = M.write(t[0], P, "plain");
        if (seen.indexOf(w) < 0) { seen.push(w); traps.push({answer:t[0].n + "/" + t[0].d, note:fill(t[1], {y:Y.f, cy:String(Y.c), cx:String(X.c)})}); }
      });
      return {type:"numeric", answer:x.n + "/" + x.d, precision:P, unit:"mol", accept:moleUnits(Y.t), check:{sf:"advice", unit:"optional"},
        display:answer + " mol", answerText:p(show(answer) + " mol " + Y.f, show(answer) + " mol de " + Y.f), traps:traps, instruction:round(n),
        prompt:fill(p("In the reaction {eq}, " + ask.en, "En la reacción {eq}, " + ask.es), {eq:e.text, x:X.f, y:Y.f, g:show(G)}),
        explanation:fill(p("Set up a proportion with the coefficients: {cx} mol {x} / {cy} mol {y} = {g} mol {x} / x. Cross-multiply: {cx} · x = {cy} · {g}, so x {eq} {ans} mol {y}.",
          "Plantea una proporción con los coeficientes: {cx} mol {x} / {cy} mol {y} = {g} mol {x} / x. Multiplica en cruz: {cx} · x = {cy} · {g}, así que x {eq} {ans} mol de {y}."),
          {cx:String(X.c), cy:String(Y.c), x:X.f, y:Y.f, g:show(G), eq:exactly ? "=" : "≈", ans:show(answer)})};
    }
    // product: true for a reactant to a product; false for two reactants, or a product back to a reactant.
    function makeMoles(random, product) {
      for (;;) {
        var i = int(random, 0, EQUATIONS.length - 1), s = equation(i).species, x = int(random, 0, s.length - 1), y = int(random, 0, s.length - 1);
        if (x === y || s[x].c === s[y].c) continue;
        if (product ? (s[x].product || !s[y].product) : s[y].product) continue;
        var n = int(random, 2, 3), G = amount(random, 0.2, 15, n), ans = M.write(M.div(M.mul(G, String(s[y].c)), String(s[x].c)), {sf:n}, "plain");
        if (sfOf(ans) !== n) continue;
        return [String(i), String(x), String(y), G];
      }
    }

    var topics = [
      {id:"write", title:p("Writing and simplifying ratios", "Escritura y simplificación de relaciones")},
      {id:"proportion", title:p("Solving proportions", "Resolución de proporciones")},
      {id:"moles", title:p("Mole ratios", "Relaciones molares")}
    ];
    var generators = [
      {key:"rc", topic:"write", make:makeCount, build:countQuestion},
      {key:"ru", topic:"write", make:makeUnit, build:unitQuestion},
      {key:"pm", topic:"proportion", make:makeMap, build:mapQuestion},
      {key:"pc", topic:"proportion", make:makeMix, build:mixQuestion},
      {key:"pr", topic:"proportion", make:makeRate, build:rateQuestion},
      {key:"mr", topic:"moles", make:makeRatio, build:ratioQuestion},
      {key:"mp", topic:"moles", make:function (r) { return makeMoles(r, true); }, build:molesQuestion},
      {key:"mn", topic:"moles", make:function (r) { return makeMoles(r, false); }, build:molesQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/ratios-and-percents/ratios-and-proportions/",
      copy:{title:"Ratios and Proportions Practice", es:{
        "Ratios and Proportions Practice":"Práctica de razones y proporciones",
        "Quantitative Skills · Ratios and Percents":"Habilidades cuantitativas · Razones y porcentajes",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all three skills.":"Elige una habilidad y comienza. El repaso mixto incluye las tres habilidades.",
        "To write a ratio, choose the answer with the first quantity named first, in simplest form.":"Para escribir una relación, elige la respuesta que pone primero la cantidad que se menciona primero, en su forma más simple.",
        "For a calculation, type the number. A unit after it is optional. The line under the question gives the significant figures to keep, as advice.":"En un cálculo, escribe el número. La unidad después es opcional. La línea debajo de la pregunta indica las cifras significativas que debes conservar, como sugerencia.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 63 or 3.0. You may add the unit after it.":"Escribe un número como 63 o 3.0. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Ratio and proportion rules":"Reglas de relaciones y proporciones",
        "Write a ratio as 3 : 2, 3 to 2, or 3/2. The first quantity named goes first.":"Escribe una relación como 3 : 2, 3 a 2 o 3/2. La cantidad que se menciona primero va primero.",
        "Simplify by dividing both numbers by the same factor: 12 : 8 = 3 : 2.":"Simplifica dividiendo ambos números entre el mismo factor: 12 : 8 = 3 : 2.",
        "Change to the same units first: 50 cm : 2 m = 50 cm : 200 cm = 1 : 4.":"Primero cambia a las mismas unidades: 50 cm : 2 m = 50 cm : 200 cm = 1 : 4.",
        "In a balanced equation, the coefficients give the mole ratio:":"En una ecuación balanceada, los coeficientes dan la relación molar:",
        "A proportion is two equal ratios. Keep the same units in the same spots and use x for the unknown:":"Una proporción son dos relaciones iguales. Mantén las mismas unidades en los mismos lugares y usa x para la incógnita:",
        "Cross-multiply, then divide:":"Multiplica en cruz y luego divide:",
        "Practice for the Ratios and Proportions lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Razones y proporciones de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
