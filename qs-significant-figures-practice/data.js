(function () {
  "use strict";
  // Significant Figures Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The rules follow the lesson on zornscience.org: nonzero digits and zeros between them count, leading zeros never
  // count, zeros at the end count only with a decimal point, scientific notation counts the first number's digits,
  // 5 or more rounds up, multiplying and dividing keep the fewest significant figures, and adding and subtracting keep
  // the fewest decimal places. Significant figures are the skill here, so they are scored, not just noted.
  var SLUG = "qs-significant-figures-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;
    var WORDS = ["sig fig", "sig figs", "significant figure", "significant figures", "sf", "s.f.", "cifra significativa", "cifras significativas", "cifras"];
    var COUNT_UNITS = ["g", "m", "L", "s", "cm", "mL", "kg", "km"];

    // n significant digits: the first is 1 to 9, zeros are common so captive and trailing zeros come up often.
    function digits(random, n, lastNonzero) {
      var s = String(int(random, 1, 9));
      for (var i = 1; i < n; i++) s += i === n - 1 && lastNonzero ? int(random, 1, 9) : random() < 0.3 ? "0" : int(random, 0, 9);
      return s;
    }
    // A written number with exactly n significant figures, in one of three styles.
    function withPoint(random, n) {
      var d = digits(random, n, false);
      if (n === 1 || random() < 0.45) return "0." + "0".repeat(int(random, 0, 3)) + d;
      var whole = int(random, 1, n - 1);
      return d.slice(0, whole) + "." + d.slice(whole);
    }
    function whole(random, n) {
      return digits(random, n, true) + "0".repeat(random() < 0.2 ? 0 : int(random, 1, 3));
    }
    function scientific(random, n) {
      var d = digits(random, n, false), e = int(random, -9, 8);
      if (e >= 0) e++;
      return (n === 1 ? d : d[0] + "." + d.slice(1)) + "e" + e;
    }
    function anyStyle(random, n) { return pick(random, [withPoint, whole, scientific])(random, n); }
    function sfOf(text) { return M.read(text).sf; }

    // Why a written number has the count it has, one short sentence per rule that applies.
    var RULE = {
      nonzero:p("Every nonzero digit counts.", "Todos los dígitos distintos de cero cuentan."),
      leading:p("Leading zeros never count.", "Los ceros al inicio nunca cuentan."),
      captive:p("Zeros between nonzero digits always count.", "Los ceros entre dígitos distintos de cero siempre cuentan."),
      pointZeros:p("Zeros at the end count because the number has a decimal point.", "Los ceros al final cuentan porque el número tiene punto decimal."),
      wholeZeros:p("Zeros at the end do not count, because there is no decimal point.", "Los ceros al final no cuentan, porque no hay punto decimal."),
      sci:p("In scientific notation, count only the digits of the first number.", "En notación científica, cuenta solo los dígitos del primer número.")
    };
    function reasons(text) {
      var out = [], sci = /e/.test(text), coef = text.split("e")[0], point = coef.indexOf(".") >= 0;
      var core = coef.replace(".", "").replace(/^0+/, "");
      if (sci) out.push(RULE.sci);
      if (!sci && /^0/.test(coef)) out.push(RULE.leading);
      var kept = point ? core : core.replace(/0+$/, "");
      if (/[1-9]0+[1-9]/.test(kept)) out.push(RULE.captive);
      if (point && /0$/.test(core)) out.push(RULE.pointZeros);
      if (!point && /0$/.test(core)) out.push(RULE.wholeZeros);
      if (!out.length) out.push(RULE.nonzero);
      return out;
    }
    function has(text, unit) { return fill(p("{x} has {n}.", "{x} tiene {n}."), {x:show(text) + " " + unit, n:figs(sfOf(text))}); }

    function countQuestion(params) {
      var text = params[0], unit = params[1], n = sfOf(text);
      return {type:"numeric", answer:String(n), precision:{exact:true}, unit:null, accept:WORDS, check:{}, display:String(n), answerText:p(String(n), String(n)),
        instruction:p("Enter a whole number.", "Escribe un número entero."),
        prompt:fill(p("How many significant figures are in {x}?", "¿Cuántas cifras significativas tiene {x}?"), {x:show(text) + " " + unit}),
        explanation:join([has(text, unit)].concat(reasons(text)))};
    }

    // Rounding. The lesson's rule: look at the first digit you drop; 5 or more rounds the last kept digit up.
    function firstDropped(text, n) {
      var all = text.replace(".", "").replace(/^0+/, "");
      return all.length > n ? Number(all[n]) : 0;
    }
    function roundQuestion(params) {
      var text = params[0], n = Number(params[1]), P = {sf:n}, r = M.rounded(text, P);
      var plain = M.write(text, P, "plain"), plainShows = M.read(plain).sf === n, answer = plainShows ? plain : M.write(text, P, "sci");
      // The place being rounded (before a carry such as 9.96 to 10), and the value cut off there without rounding.
      var dropped = firstDropped(text, n), at = M.magnitude(text) - n + 1;
      var truncated = M.roundAt(M.sub(text, M.mul(M.scale(at), "0.5")), at), traps = [];
      if (dropped >= 5) traps.push({answer:M.fixed(truncated, at), note:p("The first digit you drop is 5 or more, so round the last kept digit up.", "El primer dígito que quitas es 5 o más, así que redondea hacia arriba el último dígito que conservas.")});
      else traps.push({answer:M.fixed(M.add(truncated, M.scale(at)), at), note:p("The first digit you drop is less than 5, so the last kept digit stays the same.", "El primer dígito que quitas es menor que 5, así que el último dígito que conservas se queda igual.")});
      if (M.cmp(M.abs(text), 1) < 0) {
        var byPlaces = M.rounded(text, {decimals:n}).value;
        if (M.cmp(byPlaces, r.value) !== 0 && M.sign(byPlaces)) traps.push({answer:M.fixed(byPlaces, -n), note:p("Leading zeros do not count. Start counting at the first nonzero digit.", "Los ceros al inicio no cuentan. Empieza a contar en el primer dígito distinto de cero.")});
      }
      if (r.place > 0) traps.push({answer:M.fixed(M.div(r.value, M.scale(r.place)), 0), note:p("Keep the zeros that hold the places, so the number keeps its size.", "Conserva los ceros que ocupan los lugares, para que el número mantenga su tamaño.")});
      var parts = [fill(p("Keep {n}. The first digit you drop is {d}, so {action}.", "Conserva {n}. El primer dígito que quitas es {d}, así que {action}."),
        {n:figs(n), d:String(dropped), action:dropped >= 5 ? p("round the last kept digit up", "redondea hacia arriba el último dígito que conservas") : p("the last kept digit stays the same", "el último dígito que conservas se queda igual")})];
      if (r.place > 0 && plainShows) parts.push(p("Zeros hold the places up to the decimal point.", "Los ceros ocupan los lugares hasta el punto decimal."));
      if (!plainShows) parts.push(fill(p("The zeros at the end must count, so write it in scientific notation: {sci}.", "Los ceros al final deben contar, así que escríbelo en notación científica: {sci}."), {sci:show(answer)}));
      parts.push(fill(p("{x} rounds to {y}.", "{x} se redondea a {y}."), {x:show(text), y:show(answer)}));
      return {type:"numeric", answer:text, precision:P, unit:null, accept:[], check:{sf:"strict"}, display:answer, answerText:p(show(answer), show(answer)), traps:traps,
        instruction:p("Use scientific notation when zeros at the end must count.", "Usa notación científica cuando los ceros al final deban contar."),
        prompt:fill(p("Round {x} to {n}.", "Redondea {x} a {n}."), {x:show(text), n:figs(n)}),
        explanation:join(parts)};
    }

    // Measurements for calculations: n significant figures, written so the count is clear (no whole-number zeros).
    function measure(random, n, lo, hi) {
      var mag = int(random, lo, Math.min(hi, n - 1)), d = digits(random, n, mag === n - 1);
      if (mag < 0) return "0." + "0".repeat(-mag - 1) + d;
      return mag === n - 1 ? d : d.slice(0, mag + 1) + "." + d.slice(mag + 1);
    }
    function decimalsOf(text) { var i = text.indexOf("."); return i < 0 ? 0 : text.length - i - 1; }
    // What a calculator shows: every digit of a terminating decimal, otherwise 10 significant figures.
    function calc(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return show(M.fixed(value, -k));
      return show(M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }
    function units(symbol) {
      var names = {"cm²":["cm²", "cm^2", "cm2", "square centimeters", "centímetros cuadrados"], "m":["m", "meters", "meter", "metros", "metro"],
        "g":["g", "grams", "gram", "gramos", "gramo"], "g/cm³":["g/cm³", "g/cm^3", "g/cm3", "g/cc"], "m/s":["m/s", "m s^-1"],
        "mL":["mL", "ml", "milliliters", "mililitros"], "cm":["cm", "centimeters", "centímetros"], "°C":["°C", "ºC", "degrees C", "grados C"]};
      return names[symbol];
    }
    var MUL = {
      area:{a:[0, 2], b:[0, 1], ua:"cm", ub:"cm", unit:"cm²", text:p("A rectangle measures {a} by {b}. What is its area?", "Un rectángulo mide {a} por {b}. ¿Cuál es su área?")},
      distance:{a:[0, 1], b:[0, 2], ua:"m/s", ub:"s", unit:"m", text:p("A cart moves at {a} for {b}. How far does it go? (distance = speed × time)", "Un carrito se mueve a {a} durante {b}. ¿Qué distancia recorre? (distancia = rapidez × tiempo)")},
      mass:{a:[-1, 0], b:[0, 2], ua:"g/mL", ub:"mL", unit:"g", text:p("A liquid has a density of {a}. What is the mass of {b} of it? (mass = density × volume)", "Un líquido tiene una densidad de {a}. ¿Cuál es la masa de {b} del líquido? (masa = densidad × volumen)")}
    };
    // For division the second measurement is made first and the first comes from a realistic rate (rate in a..b).
    var DIV = {
      density:{rate:[0.7, 19], b:[0, 2], ua:"g", ub:"cm³", unit:"g/cm³", text:p("A sample has a mass of {a} and a volume of {b}. What is its density? (density = mass ÷ volume)", "Una muestra tiene una masa de {a} y un volumen de {b}. ¿Cuál es su densidad? (densidad = masa ÷ volumen)")},
      speed:{rate:[1.5, 11], b:[0, 2], ua:"m", ub:"s", unit:"m/s", text:p("A runner covers {a} in {b}. What is the average speed? (speed = distance ÷ time)", "Un corredor recorre {a} en {b}. ¿Cuál es su rapidez promedio? (rapidez = distancia ÷ tiempo)")}
    };
    var RULE_WORDS = p("Round your answer with the significant figure rules.", "Redondea tu respuesta con las reglas de cifras significativas.");
    function productQuestion(params, divide) {
      var c = (divide ? DIV : MUL)[params[0]], a = params[1], b = params[2], na = sfOf(a), nb = sfOf(b), n = Math.min(na, nb), P = {sf:n};
      var exact = divide ? M.div(a, b) : M.mul(a, b), answer = M.write(exact, P, "plain");
      var traps = [], byPlaces = M.rounded(exact, {decimals:Math.min(decimalsOf(a), decimalsOf(b))}).value;
      if (M.cmp(byPlaces, M.rounded(exact, P).value) !== 0 && M.sign(byPlaces)) traps.push({answer:M.fixed(byPlaces, -Math.min(decimalsOf(a), decimalsOf(b))),
        note:p("When you multiply or divide, count significant figures, not decimal places.", "Al multiplicar o dividir, cuenta cifras significativas, no lugares decimales.")});
      return {type:"numeric", answer:exact.n + "/" + exact.d, precision:P, unit:c.unit, accept:units(c.unit),
        check:{sf:"strict", unit:"optional"}, display:answer + " " + c.unit, answerText:p(show(answer) + " " + c.unit, show(answer) + " " + c.unit),
        traps:traps, instruction:RULE_WORDS,
        prompt:fill(c.text, {a:show(a) + " " + c.ua, b:show(b) + " " + c.ub}),
        explanation:fill(p("{a} has {na} and {b} has {nb}, so the answer keeps {n}. {a} {op} {b} = {raw} {u}, which rounds to {ans} {u}.",
          "{a} tiene {na} y {b} tiene {nb}, así que la respuesta conserva {n}. {a} {op} {b} = {raw} {u}, que se redondea a {ans} {u}."),
          {a:show(a) + " " + c.ua, b:show(b) + " " + c.ub, na:figs(na), nb:figs(nb), n:figs(n), op:divide ? "÷" : "×", raw:calc(exact), u:c.unit, ans:show(answer)})};
    }
    // The exact answer must keep its significant figures in standard notation, and rounding should usually matter.
    function makeProduct(random, divide) {
      var key = pick(random, Object.keys(divide ? DIV : MUL)), c = (divide ? DIV : MUL)[key];
      for (;;) {
        var na = int(random, 2, 4), nb = int(random, 2, 4);
        if (na === nb && random() < 0.7) continue;
        var b = measure(random, nb, c.b[0], c.b[1]), a;
        if (divide) {
          a = M.write(M.mul(b, (c.rate[0] + random() * (c.rate[1] - c.rate[0])).toFixed(3)), {sf:na}, "plain");
          if (M.read(a).sf !== na) continue;
        } else a = measure(random, na, c.a[0], c.a[1]);
        var exact = divide ? M.div(a, b) : M.mul(a, b), P = {sf:Math.min(na, nb)}, plain = M.write(exact, P, "plain");
        if (M.read(plain).sf !== P.sf || M.magnitude(exact) > 4 || M.magnitude(exact) < -3) continue;
        return [key, a, b];
      }
    }

    // Adding and subtracting: the answer keeps the fewest decimal places.
    function decimalMeasure(random, places, lo, hi) {
      var whole = String(int(random, lo, hi));
      if (!places) return /0$/.test(whole) ? whole.slice(0, -1) + int(random, 1, 9) : whole;
      var frac = "";
      for (var i = 0; i < places; i++) frac += int(random, 0, 9);
      return whole + "." + frac;
    }
    var ADD = {
      mass:{unit:"g", text:p("Find the total mass: {list}.", "Encuentra la masa total: {list}.")},
      volume:{unit:"mL", text:p("Find the total volume: {list}.", "Encuentra el volumen total: {list}.")},
      length:{unit:"cm", text:p("Find the total length: {list}.", "Encuentra la longitud total: {list}.")}
    };
    var SUB = {
      water:{unit:"g", text:p("A beaker with water has a mass of {a}. The empty beaker has a mass of {b}. What is the mass of the water?", "Un vaso de precipitados con agua tiene una masa de {a}. El vaso vacío tiene una masa de {b}. ¿Cuál es la masa del agua?")},
      warm:{unit:"°C", text:p("The temperature rose from {b} to {a}. By how much did it change?", "La temperatura subió de {b} a {a}. ¿Cuánto cambió?")},
      cut:{unit:"cm", text:p("A board is {a} long. You cut off {b}. How long is the piece that is left?", "Una tabla mide {a} de largo. Cortas {b}. ¿Cuánto mide el pedazo que queda?")}
    };
    function sumQuestion(params, subtract) {
      var c = (subtract ? SUB : ADD)[params[0]], terms = params.slice(1), d = Math.min.apply(null, terms.map(decimalsOf)), P = {decimals:d};
      var exact = subtract ? M.sub(terms[0], terms[1]) : terms.reduce(function (s, x) { return M.add(s, x); }, "0");
      var answer = M.write(exact, P, "plain"), raw = M.fixed(exact, -Math.max.apply(null, terms.map(decimalsOf)));
      var least = terms.filter(function (x) { return decimalsOf(x) === d; })[0], traps = [];
      var bySf = M.rounded(exact, {sf:Math.min.apply(null, terms.map(sfOf))});
      if (M.cmp(bySf.value, M.rounded(exact, P).value) !== 0) traps.push({answer:M.fixed(bySf.value, Math.min(0, bySf.place)),
        note:p("When you add or subtract, count decimal places, not significant figures.", "Al sumar o restar, cuenta lugares decimales, no cifras significativas.")});
      var list = terms.map(function (x) { return show(x) + " " + c.unit; });
      var prompt = subtract ? fill(c.text, {a:list[0], b:list[1]}) : fill(c.text, {list:list.join(" + ")});
      return {type:"numeric", answer:raw, precision:P, unit:c.unit, accept:units(c.unit), check:{sf:"strict", unit:"optional"},
        display:answer + " " + c.unit, answerText:p(show(answer) + " " + c.unit, show(answer) + " " + c.unit), traps:traps, instruction:RULE_WORDS, prompt:prompt,
        explanation:fill(d === 0 ? p("Line up the decimal points. {least} has no decimal places, so the answer has none. {calc} = {raw} {u}, which rounds to {ans} {u}.",
          "Alinea los puntos decimales. {least} no tiene lugares decimales, así que la respuesta tampoco. {calc} = {raw} {u}, que se redondea a {ans} {u}.") :
          p("Line up the decimal points. {least} has the fewest decimal places, {places}. {calc} = {raw} {u}, which rounds to {ans} {u}.",
          "Alinea los puntos decimales. {least} tiene la menor cantidad de lugares decimales, {places}. {calc} = {raw} {u}, que se redondea a {ans} {u}."),
          {least:show(least) + " " + c.unit, places:M.places(d), calc:terms.map(show).join(subtract ? " − " : " + "), raw:show(raw), u:c.unit, ans:show(answer)})};
    }
    function makeSum(random, subtract) {
      var key = pick(random, Object.keys(subtract ? SUB : ADD));
      for (;;) {
        var count = subtract ? 2 : int(random, 2, 3), places = [];
        for (var i = 0; i < count; i++) places.push(int(random, 0, 3));
        if (new Set(places).size === 1) continue;
        var terms = places.map(function (k, i) { return decimalMeasure(random, k, subtract && i === 1 ? 1 : 10, subtract && i === 1 ? 90 : 250); });
        var exact = subtract ? M.sub(terms[0], terms[1]) : terms.reduce(function (s, x) { return M.add(s, x); }, "0");
        var d = Math.min.apply(null, places), answer = M.write(exact, {decimals:d}, "plain");
        if (M.sign(exact) <= 0 || (d === 0 && /0$/.test(answer))) continue;
        return [key].concat(terms);
      }
    }

    var topics = [
      {id:"count", title:p("Counting significant figures", "Conteo de cifras significativas")},
      {id:"round", title:p("Rounding", "Redondeo")},
      {id:"multiply", title:p("Multiplying and dividing", "Multiplicación y división")},
      {id:"add", title:p("Adding and subtracting", "Suma y resta")}
    ];
    var generators = [
      {key:"cd", topic:"count", make:function (r) { return [withPoint(r, int(r, 1, 5)), pick(r, COUNT_UNITS)]; }, build:countQuestion},
      {key:"cw", topic:"count", make:function (r) { return [whole(r, int(r, 1, 4)), pick(r, COUNT_UNITS)]; }, build:countQuestion},
      {key:"cs", topic:"count", make:function (r) { return [scientific(r, int(r, 1, 4)), pick(r, COUNT_UNITS)]; }, build:countQuestion},
      {key:"cc", topic:"count", make:function (r) {
        var n = int(r, 2, 4), counts = [n].concat(M.shuffle([1, 2, 3, 4, 5].filter(function (k) { return k !== n; }), r).slice(0, 3)), texts = [];
        counts.forEach(function (k) { var t; do t = anyStyle(r, k); while (texts.indexOf(t) >= 0); texts.push(t); });
        return texts.concat([pick(r, COUNT_UNITS)]);
      }, build:function (params) {
        var unit = params[4], texts = params.slice(0, 4), n = sfOf(texts[0]);
        return {type:"mc", answer:0, prompt:fill(p("Which measurement has exactly {n}?", "¿Qué medición tiene exactamente {n}?"), {n:figs(n)}),
          choices:texts.map(function (t, i) { return {text:p(show(t) + " " + unit, show(t) + " " + unit), why:i ? join([has(t, unit)].concat(reasons(t))) : p("", "")}; }),
          explanation:join([has(texts[0], unit)].concat(reasons(texts[0])))};
      }},
      {key:"rs", topic:"round", make:function (r) {
        var n = int(r, 1, 3);
        return ["0." + "0".repeat(int(r, 1, 3)) + digits(r, n + int(r, 1, 3), true), String(n)];
      }, build:roundQuestion},
      {key:"rl", topic:"round", make:function (r) {
        var size = int(r, 3, 6), n = int(r, 1, Math.min(3, size - 1)), places = r() < 0.3 ? int(r, 1, 2) : 0, d = digits(r, size + places, true);
        return [d.slice(0, size) + (places ? "." + d.slice(size) : ""), String(n)];
      }, build:roundQuestion},
      {key:"rh", topic:"round", make:function (r) {
        var n = int(r, 1, 3), all = digits(r, n, false) + pick(r, [5, 5, 4]) + (r() < 0.5 ? "" : digits(r, int(r, 1, 2), false).replace(/^./, String(int(r, 0, 9))));
        var at = int(r, -1, Math.min(3, all.length - 1));
        var text = at <= 0 ? "0." + "0".repeat(-at) + all : at >= all.length ? all : all.slice(0, at) + "." + all.slice(at);
        if (!/\./.test(text) && /0$/.test(text)) text += "1";
        return [text, String(n)];
      }, build:roundQuestion},
      {key:"mu", topic:"multiply", make:function (r) { return makeProduct(r, false); }, build:function (params) { return productQuestion(params, false); }},
      {key:"dv", topic:"multiply", make:function (r) { return makeProduct(r, true); }, build:function (params) { return productQuestion(params, true); }},
      {key:"ad", topic:"add", make:function (r) { return makeSum(r, false); }, build:function (params) { return sumQuestion(params, false); }},
      {key:"sb", topic:"add", make:function (r) { return makeSum(r, true); }, build:function (params) { return sumQuestion(params, true); }}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/numbers/significant-figures/",
      copy:{title:"Significant Figures Practice", es:{
        "Significant Figures Practice":"Práctica de cifras significativas",
        "Quantitative Skills · Numbers":"Habilidades cuantitativas · Números",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type your answer. A unit after the number is optional, and you can write scientific notation as 4.50 x 10^3 or 4.50e3.":"Escribe tu respuesta. La unidad después del número es opcional, y puedes escribir la notación científica como 4.50 x 10^3 o 4.50e3.",
        "Significant figures count here: a value with the wrong number of significant figures is marked incorrect.":"Aquí las cifras significativas cuentan: un valor con un número incorrecto de cifras significativas se marca como incorrecto.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Your answer":"Tu respuesta",
        "Type a number such as 0.0250 or 2.50 x 10^-2. You may add the unit after it.":"Escribe un número como 0.0250 o 2.50 x 10^-2. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Significant figure rules":"Reglas de las cifras significativas",
        "Nonzero digits always count.":"Los dígitos distintos de cero siempre cuentan.",
        "Zeros between nonzero digits always count: 4007 m has 4.":"Los ceros entre dígitos distintos de cero siempre cuentan: 4007 m tiene 4.",
        "Leading zeros never count: 0.0052 g has 2.":"Los ceros al inicio nunca cuentan: 0.0052 g tiene 2.",
        "Zeros at the end count only when there is a decimal point: 2.50 g has 3, but 2500 g has 2.":"Los ceros al final solo cuentan cuando hay punto decimal: 2.50 g tiene 3, pero 2500 g tiene 2.",
        "In scientific notation, count only the digits of the first number:":"En notación científica, cuenta solo los dígitos del primer número:",
        "has 4.":"tiene 4.",
        "Rounding: if the first digit you drop is 5 or more, round the last kept digit up.":"Redondeo: si el primer dígito que quitas es 5 o más, redondea hacia arriba el último dígito que conservas.",
        "Multiplying or dividing: keep the fewest significant figures.":"Al multiplicar o dividir: conserva la menor cantidad de cifras significativas.",
        "Adding or subtracting: keep the fewest decimal places.":"Al sumar o restar: conserva la menor cantidad de lugares decimales.",
        "Practice for the Significant Figures lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Cifras significativas de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
