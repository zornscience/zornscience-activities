(function () {
  "use strict";
  // Metric Prefixes Practice: generated questions for the Quantitative Skills lesson on zornscience.org. Every set has
  // new numbers. The lesson's prefix ladder has six prefixes and the base unit: mega (M) 10^6, kilo (k) 10^3, the base
  // unit 10^0, centi (c) 10^-2, milli (m) 10^-3, micro (μ) 10^-6 and nano (n) 10^-9. The number of places between two
  // rungs is the difference of their exponents. Going down to a smaller unit moves the decimal point right (smaller
  // unit, bigger number); going up moves it left. Zeros at the end stay, so an answer keeps the measurement's
  // significant figures. Moving the decimal point is the skill here, so significant figures get a note, not a score.
  var SLUG = "qs-metric-prefixes-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    function cap(pair) { return p(pair.en.charAt(0).toUpperCase() + pair.en.slice(1), pair.es.charAt(0).toUpperCase() + pair.es.slice(1)); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;

    // The ladder, top to bottom. Keys are plain letters so question ids stay simple: "b" is the base unit, "u" micro.
    var RUNGS = ["M", "k", "b", "c", "m", "u", "n"], PREFIXES = ["M", "k", "c", "m", "u", "n"];
    var RUNG = {
      M:{sym:"M", e:6, name:p("mega", "mega"), accent:"megá"},
      k:{sym:"k", e:3, name:p("kilo", "kilo"), accent:"kiló"},
      b:{sym:"", e:0, name:p("the base unit", "la unidad base")},
      c:{sym:"c", e:-2, name:p("centi", "centi"), accent:"centí"},
      m:{sym:"m", e:-3, name:p("milli", "mili"), accent:"milí"},
      u:{sym:"μ", e:-6, name:p("micro", "micro"), accent:"micró"},
      n:{sym:"n", e:-9, name:p("nano", "nano"), accent:"nanó"}
    };
    // Base units: Spanish names of meters take an accent after a prefix (kilómetros); grams and liters do not.
    var BASE = {
      m:{name:p("meters", "metros"), en:["meters", "meter", "metres", "metre"], es:["metros", "metro"], accent:true},
      g:{name:p("grams", "gramos"), en:["grams", "gram"], es:["gramos", "gramo"]},
      L:{name:p("liters", "litros"), en:["liters", "liter", "litres", "litre"], es:["litros", "litro"]}
    };
    var BASES = ["m", "g", "L"];
    function symbol(k, base) { return RUNG[k].sym + base; }
    function name(k, base) {
      if (k === "b") return BASE[base].name;
      return p(RUNG[k].name.en + BASE[base].name.en, (BASE[base].accent ? RUNG[k].accent : RUNG[k].name.es) + BASE[base].name.es);
    }
    // Every reasonable spelling: the symbol (with l for L, and u for μ), and English and Spanish names with or without accents.
    function accept(k, base) {
      var s = RUNG[k].sym, out = [s + base];
      if (base === "L") out.push(s + "l");
      if (k === "u") out.push("u" + base, base === "L" ? "ul" : "u" + base);
      if (k === "b") return out.concat(BASE[base].en, BASE[base].es);
      BASE[base].en.forEach(function (n) { out.push(RUNG[k].name.en + n); });
      BASE[base].es.forEach(function (n) { out.push(RUNG[k].name.es + n); if (BASE[base].accent) out.push(RUNG[k].accent + n); });
      return out.filter(function (x, i) { return out.indexOf(x) === i; });
    }
    function power(e) { return "10<sup>" + (e < 0 ? "−" : "") + Math.abs(e) + "</sup>"; }
    function label(k) { return k === "b" ? RUNG.b.name : p(RUNG[k].name.en + " (" + RUNG[k].sym + ")", RUNG[k].name.es + " (" + RUNG[k].sym + ")"); }
    function placesText(n) { return p(n === 1 ? "1 place" : n + " places", n === 1 ? "1 lugar" : n + " lugares"); }
    var MEGA_MILLI = p("Capital M is mega; lowercase m is milli.", "La M mayúscula es mega; la m minúscula es mili.");
    function confused(a, b) { return (a === "M" && b === "m") || (a === "m" && b === "M"); }

    // n significant digits; the first is 1 to 9. A whole number ends in a nonzero digit, so the zeros after it never count.
    function digits(random, n, lastNonzero) {
      var s = String(int(random, 1, 9));
      for (var i = 1; i < n; i++) s += i === n - 1 && lastNonzero ? int(random, 1, 9) : random() < 0.25 ? "0" : int(random, 0, 9);
      return s;
    }
    // A measurement with n significant figures whose first digit is at 10^mag, in standard notation (4500, 25.0, 0.075).
    function written(random, n, mag) {
      var d = digits(random, n, mag >= n - 1);
      if (mag < 0) return "0." + "0".repeat(-mag - 1) + d;
      if (mag >= n - 1) return d + "0".repeat(mag - n + 1);
      return d.slice(0, mag + 1) + "." + d.slice(mag + 1);
    }
    function sf(text) { return M.read(text).sf; }
    function shift(x, places) { return M.mul(x, M.scale(places)); }
    // Answers are in standard notation from 0.001 up to 99,999 and in scientific notation outside that range.
    function form(value) { var mag = M.magnitude(value); return mag >= -3 && mag <= 4 ? "plain" : "sci"; }
    function text(value, n) { return M.write(value, {sf:n}, form(value)); }
    // Standard notation shows the significant figures (1500 shows 2, so 1.50 km is not asked in m).
    function shows(value, n) { return sf(M.write(value, {sf:n}, "plain")) === n; }
    function steps(a, b) { return Math.abs(RUNGS.indexOf(a) - RUNGS.indexOf(b)); }
    // A wrong number of places from the ladder: one place per rung, or three places for every rung.
    function wrongPlaces(a, b) { var s = steps(a, b), d = Math.abs(RUNG[a].e - RUNG[b].e); return s !== d ? s : 3 * s; }
    function exponent(e) { return e < 0 ? "(−" + -e + ")" : String(e); }
    function signed(e) { return (e < 0 ? "−" : "") + Math.abs(e); }

    // One sentence on the ladder, one on the direction, then the result.
    function ladder(a, b) {
      return fill(p("On the ladder, {a} is {ea} and {b} is {eb}, so they are {k} apart.", "En la escalera, {a} es {ea} y {b} es {eb}, así que están a {k} de distancia."),
        {a:label(a), b:label(b), ea:power(RUNG[a].e), eb:power(RUNG[b].e), k:placesText(Math.abs(RUNG[a].e - RUNG[b].e))});
    }
    function direction(a, b, base) {
      var d = RUNG[a].e - RUNG[b].e, k = placesText(Math.abs(d)), u = symbol(b, base);
      return d > 0 ? fill(p("The new unit, {u}, is smaller, so the number gets bigger: move the decimal point {k} to the right.", "La unidad nueva, {u}, es más pequeña, así que el número se hace más grande: mueve el punto decimal {k} a la derecha."), {u:u, k:k}) :
        fill(p("The new unit, {u}, is larger, so the number gets smaller: move the decimal point {k} to the left.", "La unidad nueva, {u}, es más grande, así que el número se hace más pequeño: mueve el punto decimal {k} a la izquierda."), {u:u, k:k});
    }
    function result(x, a, b, base) {
      var n = sf(x), y = shift(x, RUNG[a].e - RUNG[b].e), ua = symbol(a, base), ub = symbol(b, base), parts = [];
      var both = form(y) === "sci" && shows(y, n);
      parts.push(fill(both ? p("{x} {ua} = {plain} {ub} = {y} {ub}.", "{x} {ua} = {plain} {ub} = {y} {ub}.") : p("{x} {ua} = {y} {ub}.", "{x} {ua} = {y} {ub}."),
        {x:show(x), ua:ua, ub:ub, y:show(text(y, n)), plain:show(M.write(y, {sf:n}, "plain"))}));
      var zeros = /\./.test(x) ? x.match(/0*$/)[0].length : 0;
      if (zeros) parts.push(fill(zeros === 1 ? p("The zero at the end stays, so the answer keeps {n}.", "El cero al final se queda, así que la respuesta conserva {n}.") :
        p("The zeros at the end stay, so the answer keeps {n}.", "Los ceros al final se quedan, así que la respuesta conserva {n}."), {n:figs(n)}));
      return parts;
    }
    function explain(x, a, b, base) { return join([ladder(a, b), direction(a, b, base)].concat(result(x, a, b, base))); }

    // Known mistakes, each with its own note: the wrong direction, one place per rung or three per rung, and M for m.
    function traps(x, a, b) {
      var d = RUNG[a].e - RUNG[b].e, s = steps(a, b), n = sf(x), sign = d > 0 ? 1 : -1, out = [], seen = [M.exact("0"), shift(x, d)];
      function add(places, note) {
        var value = shift(x, places);
        if (seen.some(function (v) { return M.cmp(v, value) === 0; })) return;
        seen.push(value); out.push({answer:M.write(value, {sf:n}, "sci"), note:note});
      }
      var k = placesText(Math.abs(d));
      add(-d, d > 0 ? p("Going down the ladder to a smaller unit makes the number bigger. Move the decimal point to the right.", "Al bajar por la escalera a una unidad más pequeña, el número se hace más grande. Mueve el punto decimal a la derecha.") :
        p("Going up the ladder to a larger unit makes the number smaller. Move the decimal point to the left.", "Al subir por la escalera a una unidad más grande, el número se hace más pequeño. Mueve el punto decimal a la izquierda."));
      if (s !== Math.abs(d)) add(sign * s, fill(p("Count places, not rungs. The exponents differ by {d}, so move the decimal point {k}.", "Cuenta lugares, no peldaños. Los exponentes difieren en {d}, así que mueve el punto decimal {k}."), {d:String(Math.abs(d)), k:k}));
      if (3 * s !== Math.abs(d)) add(sign * 3 * s, fill(p("Not every rung is 3 places apart. The exponents differ by {d}, so move the decimal point {k}.", "No todos los peldaños están a 3 lugares. Los exponentes difieren en {d}, así que mueve el punto decimal {k}."), {d:String(Math.abs(d)), k:k}));
      var swap = {M:-3, m:6}, ea = swap[a] === undefined ? RUNG[a].e : swap[a], eb = swap[b] === undefined ? RUNG[b].e : swap[b];
      if (ea - eb !== d) add(ea - eb, p("Capital M is mega (10<sup>6</sup>); lowercase m is milli (10<sup>−3</sup>).", "La M mayúscula es mega (10<sup>6</sup>); la m minúscula es mili (10<sup>−3</sup>)."));
      return out;
    }

    // Converting: the prompt names the new unit, so the unit is optional; significant figures get a note.
    function conversion(params) {
      var x = params[0], a = params[1], b = params[2], base = params[3], n = sf(x), y = shift(x, RUNG[a].e - RUNG[b].e), answer = text(y, n);
      var ua = symbol(a, base), ub = symbol(b, base);
      return {type:"numeric", answer:M.write(y, {sf:n}, "sci"), precision:{sf:n}, unit:ub, accept:accept(b, base), check:{sf:"advice", unit:"optional"},
        display:answer + " " + ub, answerText:p(show(answer) + " " + ub, show(answer) + " " + ub), traps:traps(x, a, b),
        instruction:fill(p("Keep {n}.", "Conserva {n}."), {n:figs(n)}),
        prompt:fill(p("Convert {x} {ua} to {ub}.", "Convierte {x} {ua} a {ub}."), {x:show(x), ua:ua, ub:ub}),
        explanation:explain(x, a, b, base)};
    }
    // near: at most 6 places and an answer in standard notation that shows its figures; far: at least 6 places and an
    // answer that needs scientific notation (532 nm is 5.32 × 10^-7 m).
    function makeConversion(random, way) {
      for (;;) {
        var a = pick(random, RUNGS), b = pick(random, RUNGS), d = RUNG[a].e - RUNG[b].e, far = way === "far";
        if (a === b || (far ? Math.abs(d) < 6 : Math.abs(d) > 6) || (way === "down" && d < 0) || (way === "up" && d > 0)) continue;
        var n = int(random, 2, 4), mag = far ? int(random, -2, 3) : int(random, -3, 4) - d;
        if (mag < -3 || mag > 4) continue;
        var x = written(random, n, mag), y = shift(x, d);
        if (far ? form(y) !== "sci" : form(y) !== "plain" || !shows(y, n)) continue;
        return [x, a, b, pick(random, BASES)];
      }
    }

    // Meanings. Each wrong choice is another prefix: the M or m look-alike when there is one, then two others.
    var PARTNER = {M:"m", m:"M", k:"m", c:"m", u:"m", n:"u"};
    function others(random, k) {
      return [PARTNER[k]].concat(M.shuffle(PREFIXES.filter(function (x) { return x !== k && x !== PARTNER[k]; }), random).slice(0, 2));
    }
    function why(k, wrong, pair) { return confused(k, wrong) ? join([pair, MEGA_MILLI]) : pair; }
    function measurement(random) { var n = int(random, 2, 3); return written(random, n, int(random, -1, 2)); }

    var topics = [
      {id:"meaning", title:p("Prefix meanings", "Significado de los prefijos")},
      {id:"ladder", title:p("The prefix ladder", "La escalera de prefijos")},
      {id:"convert", title:p("Converting", "Conversiones")}
    ];
    var generators = [
      // Symbol to power of ten: "In 4.5 mg, what power of ten does the prefix stand for?"
      {key:"pw", topic:"meaning", make:function (r) { var k = pick(r, PREFIXES); return [measurement(r), k, pick(r, BASES)].concat(others(r, k)); },
        build:function (params) {
          var x = params[0], k = params[1], base = params[2], u = symbol(k, base), list = [k].concat(params.slice(3));
          return {type:"mc", answer:0, prompt:fill(p("In {x} {u}, what power of ten does the prefix stand for?", "En {x} {u}, ¿qué potencia de diez representa el prefijo?"), {x:show(x), u:u}),
            choices:list.map(function (w, i) {
              return {text:p(power(RUNG[w].e), power(RUNG[w].e)), why:i ? why(k, w, fill(p("{p} is {name}.", "{p} es {name}."), {p:power(RUNG[w].e), name:label(w)})) : p("", "")};
            }),
            explanation:fill(p("The prefix {s} is {name}, which means {p}: 1 {u} = {p} {base}.", "El prefijo {s} es {name}, que significa {p}: 1 {u} = {p} {base}."),
              {s:RUNG[k].sym, name:RUNG[k].name, p:power(RUNG[k].e), u:u, base:base})};
        }},
      // Power of ten to prefix: "Which prefix means 10^-6?"
      {key:"pp", topic:"meaning", make:function (r) { var k = pick(r, PREFIXES); return [k, pick(r, BASES)].concat(others(r, k)); },
        build:function (params) {
          var k = params[0], base = params[1], list = [k].concat(params.slice(2));
          return {type:"mc", answer:0, prompt:fill(p("Which prefix means {p}?", "¿Qué prefijo significa {p}?"), {p:power(RUNG[k].e)}),
            choices:list.map(function (w, i) {
              return {text:label(w), why:i ? why(k, w, fill(p("{name} means {p}.", "{name} significa {p}."), {name:cap(label(w)), p:power(RUNG[w].e)})) : p("", "")};
            }),
            explanation:fill(p("{name} means {p}, so 1 {u} = {p} {base}.", "{name} significa {p}, así que 1 {u} = {p} {base}."), {name:cap(label(k)), p:power(RUNG[k].e), u:symbol(k, base), base:base})};
        }},
      // Name to symbol, where case matters: "How do you write 4.5 milligrams with a symbol?"
      {key:"sy", topic:"meaning", make:function (r) { var k = pick(r, PREFIXES); return [measurement(r), k, pick(r, BASES)].concat(others(r, k)); },
        build:function (params) {
          var x = params[0], k = params[1], base = params[2], list = [k].concat(params.slice(3));
          return {type:"mc", answer:0, prompt:fill(p("How do you write {x} {name} with a symbol?", "¿Cómo escribes {x} {name} con símbolo?"), {x:show(x), name:name(k, base)}),
            choices:list.map(function (w, i) {
              var t = show(x) + " " + symbol(w, base);
              return {text:p(t, t), why:i ? why(k, w, fill(p("{t} is {x} {name}.", "{t} es {x} {name}."), {t:t, x:show(x), name:name(w, base)})) : p("", "")};
            }),
            explanation:fill(p("The symbol for {pre} is {s}, so {x} {name} is {x} {u}.", "El símbolo de {pre} es {s}, así que {x} {name} es {x} {u}."),
              {pre:RUNG[k].name, s:RUNG[k].sym, x:show(x), name:name(k, base), u:symbol(k, base)})};
        }},
      // Places on the ladder: the difference of the exponents.
      {key:"pl", topic:"ladder", make:function (r) {
        var a, b;
        do { a = pick(r, RUNGS); b = pick(r, RUNGS); } while (a === b);
        return [measurement(r), a, b, pick(r, BASES)];
      }, build:function (params) {
        var x = params[0], a = params[1], b = params[2], base = params[3], d = Math.abs(RUNG[a].e - RUNG[b].e), hi = Math.max(RUNG[a].e, RUNG[b].e), lo = Math.min(RUNG[a].e, RUNG[b].e);
        var s = steps(a, b), k = placesText(d), trap = [];
        var note = function (pair) { return fill(pair, {d:String(d), k:k}); };
        if (s !== d) trap.push({answer:String(s), note:note(p("Count places, not rungs. The exponents differ by {d}, so move the decimal point {k}.", "Cuenta lugares, no peldaños. Los exponentes difieren en {d}, así que mueve el punto decimal {k}."))});
        if (3 * s !== d) trap.push({answer:String(3 * s), note:note(p("Not every rung is 3 places apart. The exponents differ by {d}, so move the decimal point {k}.", "No todos los peldaños están a 3 lugares. Los exponentes difieren en {d}, así que mueve el punto decimal {k}."))});
        return {type:"numeric", answer:String(d), precision:{exact:true}, unit:null, accept:["places", "place", "lugares", "lugar"], check:{}, display:String(d),
          answerText:p(placesText(d).en, placesText(d).es), traps:trap, instruction:p("Enter a whole number.", "Escribe un número entero."),
          prompt:fill(p("To convert {x} {ua} to {ub}, how many places do you move the decimal point?", "Para convertir {x} {ua} a {ub}, ¿cuántos lugares mueves el punto decimal?"),
            {x:show(x), ua:symbol(a, base), ub:symbol(b, base)}),
          explanation:join([fill(p("On the ladder, {a} is {ea} and {b} is {eb}. The exponents differ by {hi} − {lo} = {d}, so move the decimal point {k}.",
            "En la escalera, {a} es {ea} y {b} es {eb}. Los exponentes difieren en {hi} − {lo} = {d}, así que mueve el punto decimal {k}."),
            {a:label(a), b:label(b), ea:power(RUNG[a].e), eb:power(RUNG[b].e), hi:signed(hi), lo:exponent(lo), d:String(d), k:k})].concat(result(x, a, b, base)))};
      }},
      // Which way and how far: the right count and direction against the wrong direction and the wrong count.
      {key:"dr", topic:"ladder", make:function (r) {
        var a, b;
        do { a = pick(r, RUNGS); b = pick(r, RUNGS); } while (a === b || Math.abs(RUNG[a].e - RUNG[b].e) > 9);
        return [measurement(r), a, b, pick(r, BASES)];
      }, build:function (params) {
        var x = params[0], a = params[1], b = params[2], base = params[3], d = RUNG[a].e - RUNG[b].e, w = wrongPlaces(a, b);
        var right = p("to the right", "a la derecha"), left = p("to the left", "a la izquierda"), good = d > 0 ? right : left, bad = d > 0 ? left : right;
        function choice(n, side) { return fill(p("{k} {side}", "{k} {side}"), {k:placesText(n), side:side}); }
        var wayWrong = d > 0 ? p("The new unit is smaller, so the number gets bigger: the point moves right.", "La unidad nueva es más pequeña, así que el número se hace más grande: el punto se mueve a la derecha.") :
          p("The new unit is larger, so the number gets smaller: the point moves left.", "La unidad nueva es más grande, así que el número se hace más pequeño: el punto se mueve a la izquierda.");
        var countWrong = fill(w === steps(a, b) ? p("That counts rungs, not places. The exponents differ by {d}.", "Eso cuenta peldaños, no lugares. Los exponentes difieren en {d}.") :
          p("Not every rung is 3 places apart. The exponents differ by {d}.", "No todos los peldaños están a 3 lugares. Los exponentes difieren en {d}."), {d:String(Math.abs(d))});
        return {type:"mc", answer:0,
          prompt:fill(p("To convert {x} {ua} to {ub}, how do you move the decimal point?", "Para convertir {x} {ua} a {ub}, ¿cómo mueves el punto decimal?"), {x:show(x), ua:symbol(a, base), ub:symbol(b, base)}),
          choices:[{text:choice(Math.abs(d), good), why:p("", "")}, {text:choice(Math.abs(d), bad), why:wayWrong},
            {text:choice(w, good), why:countWrong}, {text:choice(w, bad), why:join([wayWrong, countWrong])}],
          explanation:explain(x, a, b, base)};
      }},
      // Which measurement is the same: the right value against the same mistakes as numbers.
      {key:"eq", topic:"ladder", make:function (r) {
        for (;;) {
          var a = pick(r, RUNGS), b = pick(r, RUNGS), d = RUNG[a].e - RUNG[b].e, n = int(r, 2, 3), mag = int(r, -2, 3) - d;
          if (a === b || Math.abs(d) > 6 || mag < -2 || mag > 3) continue;
          var x = written(r, n, mag), y = shift(x, d);
          if (form(y) === "plain" && shows(y, n)) return [x, a, b, pick(r, BASES)];
        }
      }, build:function (params) {
        var x = params[0], a = params[1], b = params[2], base = params[3], n = sf(x), d = RUNG[a].e - RUNG[b].e, w = (d > 0 ? 1 : -1) * wrongPlaces(a, b), ub = symbol(b, base);
        function value(places) { var t = show(text(shift(x, places), n)) + " " + ub; return p(t, t); }
        var wayWrong = d > 0 ? p("This moves the point the wrong way. The new unit is smaller, so the number gets bigger.", "Aquí el punto se mueve hacia el lado equivocado. La unidad nueva es más pequeña, así que el número se hace más grande.") :
          p("This moves the point the wrong way. The new unit is larger, so the number gets smaller.", "Aquí el punto se mueve hacia el lado equivocado. La unidad nueva es más grande, así que el número se hace más pequeño.");
        var countWrong = fill(Math.abs(w) === steps(a, b) ? p("This counts rungs, not places. The exponents differ by {d}.", "Aquí se cuentan peldaños, no lugares. Los exponentes difieren en {d}.") :
          p("This moves 3 places for every rung. The exponents differ by {d}.", "Aquí se mueven 3 lugares por cada peldaño. Los exponentes difieren en {d}."), {d:String(Math.abs(d))});
        return {type:"mc", answer:0, prompt:fill(p("Which measurement is equal to {x} {ua}?", "¿Qué medición es igual a {x} {ua}?"), {x:show(x), ua:symbol(a, base)}),
          choices:[{text:value(d), why:p("", "")}, {text:value(-d), why:wayWrong}, {text:value(w), why:countWrong}, {text:value(-w), why:join([wayWrong, countWrong])}],
          explanation:explain(x, a, b, base)};
      }},
      {key:"dn", topic:"convert", make:function (r) { return makeConversion(r, "down"); }, build:conversion},
      {key:"up", topic:"convert", make:function (r) { return makeConversion(r, "up"); }, build:conversion},
      {key:"sc", topic:"convert", make:function (r) { return makeConversion(r, "far"); }, build:conversion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/units/metric-prefixes/",
      copy:{title:"Metric Prefixes Practice", es:{
        "Metric Prefixes Practice":"Práctica de prefijos métricos",
        "Quantitative Skills · Units":"Habilidades cuantitativas · Unidades",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper. The prefix ladder from the lesson is below.":"Sin límite de tiempo. Usa papel. La escalera de prefijos de la lección está abajo.",
        "Choose a skill, then start. Mixed review includes all three skills.":"Elige una habilidad y comienza. El repaso mixto incluye las tres habilidades.",
        "Type your answer. A unit after the number is optional. Write very large or very small numbers in scientific notation, like 5.32 x 10^-7 or 5.32e-7.":"Escribe tu respuesta. La unidad después del número es opcional. Escribe los números muy grandes o muy pequeños en notación científica, como 5.32 x 10^-7 o 5.32e-7.",
        "Case matters: capital M is mega and lowercase m is milli. If you cannot type μ, type u (75 um for 75 μm).":"Las mayúsculas importan: la M mayúscula es mega y la m minúscula es mili. Si no puedes escribir μ, escribe u (75 um para 75 μm).",
        "Keep the measurement's significant figures. A different number of significant figures still counts, with a note.":"Conserva las cifras significativas de la medición. Un número distinto de cifras significativas también cuenta, con una nota.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 0.0250 or 5.32 x 10^-7. You may add the unit after it.":"Escribe un número como 0.0250 o 5.32 x 10^-7. Puedes agregar la unidad después.",
        "Unit":"Unidad", "Reference":"Consulta", "The prefix ladder":"La escalera de prefijos",
        "Rungs from top to bottom":"Peldaños de arriba hacia abajo",
        "Base unit (m, g or L): 10":"Unidad base (m, g o L): 10",
        "m, milli: 10":"m, mili: 10",
        "Moving the decimal point":"Movimiento del punto decimal",
        "The number of places between two rungs is the difference of their exponents. Kilo to centi is 3 − (−2) = 5 places.":"El número de lugares entre dos peldaños es la diferencia de sus exponentes. De kilo a centi hay 3 − (−2) = 5 lugares.",
        "Down the ladder to a smaller unit, move the decimal point right. Smaller unit, bigger number: 1.5 km = 1500 m.":"Al bajar a una unidad más pequeña, mueve el punto decimal a la derecha. Unidad más pequeña, número más grande: 1.5 km = 1500 m.",
        "Up the ladder to a larger unit, move it left: 325 mg = 0.325 g.":"Al subir a una unidad más grande, muévelo a la izquierda: 325 mg = 0.325 g.",
        "Keep the zeros at the end, so the significant figures stay the same: 25.0 mL = 0.0250 L.":"Conserva los ceros al final, para que las cifras significativas no cambien: 25.0 mL = 0.0250 L.",
        "Capital M is mega; lowercase m is milli. μ is the Greek letter mu.":"La M mayúscula es mega; la m minúscula es mili. μ es la letra griega mu.",
        "Practice for the Metric Prefixes lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Prefijos métricos de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
