(function () {
  "use strict";
  // Unit Conversions Practice: generated questions for the Quantitative Skills lesson on zornscience.org. Every set
  // has new numbers. One conversion factor per problem, as in the lesson: a factor is an equality written as a
  // fraction, so it equals 1 and the amount does not change. The new unit goes on top and the starting unit on the
  // bottom, so the starting unit cancels; if nothing cancels, flip the factor. Defined equalities are exact and never
  // limit significant figures, so the answer keeps the measurement's. Significant figures get a note while converting
  // and are scored in the topic about exact factors, where choosing them is the skill.
  var SLUG = "qs-unit-conversions-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;

    // Exact equalities, 1 big = k small, from the lesson's units.
    var EQ = {
      ms:{big:"min", small:"s", k:"60"},
      hm:{big:"h", small:"min", k:"60"},
      dh:{big:"d", small:"h", k:"24"},
      yf:{big:"yd", small:"ft", k:"3"},
      fi:{big:"ft", small:"in", k:"12"},
      ic:{big:"in", small:"cm", k:"2.54"}
    };
    // The first topic stays with time, yards and feet (see README: the Spanish page check reads "in" as English).
    var FIRST = ["ms", "hm", "dh", "yf"], ALL = Object.keys(EQ);
    // Each unit's name for prompts and every spelling a student might type.
    var UNIT = {
      "s":{name:p("seconds", "segundos"), accept:["s", "sec", "secs", "seconds", "second", "segundos", "segundo"]},
      "min":{name:p("minutes", "minutos"), accept:["min", "mins", "minutes", "minute", "minutos", "minuto"]},
      "h":{name:p("hours", "horas"), accept:["h", "hr", "hrs", "hours", "hour", "horas", "hora"]},
      "d":{name:p("days", "días"), accept:["d", "day", "days", "días", "día", "dias", "dia"]},
      "yd":{name:p("yards", "yardas"), accept:["yd", "yds", "yards", "yard", "yardas", "yarda"]},
      "ft":{name:p("feet", "pies"), accept:["ft", "feet", "foot", "pies", "pie"]},
      "in":{name:p("inches", "pulgadas"), accept:["in", "inches", "inch", "pulgadas", "pulgada"]},
      "cm":{name:p("centimeters", "centímetros"), accept:["cm", "centimeters", "centimeter", "centimetres", "centimetre", "centímetros", "centímetro", "centimetros", "centimetro"]}
    };
    // Narrower ranges for the start of each conversion, so the amounts make sense (4.25 h, 245 s, 19.0 cm).
    var START = {"min>s":[0.5, 90], "s>min":[20, 900], "h>min":[0.25, 48], "min>h":[15, 600], "d>h":[1, 30], "h>d":[6, 500],
      "yd>ft":[1, 100], "ft>yd":[3, 300], "ft>in":[1, 40], "in>ft":[6, 400], "in>cm":[1, 60], "cm>in":[2, 200]};

    function digits(random, n, lastNonzero) {
      var s = String(int(random, 1, 9));
      for (var i = 1; i < n; i++) s += i === n - 1 && lastNonzero ? int(random, 1, 9) : random() < 0.25 ? "0" : int(random, 0, 9);
      return s;
    }
    // A measurement with n significant figures between lo and hi. A whole number ends in a nonzero digit, so its
    // significant figures are clear (no 250 s).
    function measure(random, n, lo, hi) {
      for (;;) {
        var mag = int(random, Math.floor(Math.log10(lo)), Math.floor(Math.log10(hi)));
        if (mag > n - 1) continue;
        var d = digits(random, n, mag === n - 1);
        var x = mag < 0 ? "0." + "0".repeat(-mag - 1) + d : mag === n - 1 ? d : d.slice(0, mag + 1) + "." + d.slice(mag + 1);
        if (Number(x) >= lo && Number(x) <= hi) return x;
      }
    }
    function sf(text) { return M.read(text).sf; }
    // An answer that standard notation shows clearly: its significant figures show, and rounding did not leave zeros
    // that only hold places (no 260 s for 258 s to 2 figures).
    function clean(value, n) {
      var r = M.rounded(value, {sf:n}).value, plain = M.write(value, {sf:n}, "plain"), mag = M.magnitude(r);
      return mag >= -3 && mag <= 4 && sf(plain) === n && !(!/\./.test(plain) && /0$/.test(plain) && M.cmp(r, value) !== 0);
    }
    // What a calculator shows: every digit of a terminating decimal, otherwise 10 significant figures.
    function calc(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return show(M.fixed(value, -k));
      return show(M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }

    // A conversion: params are [equality, "down" (big to small) or "up", measurement].
    function setup(params) {
      var e = EQ[params[0]], down = params[1] === "down", x = params[2], a = down ? e.big : e.small, b = down ? e.small : e.big, n = sf(x);
      var k = show(e.k), bigOne = "1 " + e.big, smallK = k + " " + e.small, bigK = k + " " + e.big, smallOne = "1 " + e.small;
      function frac(top, bottom) { return {text:"(" + top + " / " + bottom + ")", top:top, bottom:bottom}; }
      var y = down ? M.mul(x, e.k) : M.div(x, e.k);
      return {e:e, down:down, x:x, a:a, b:b, n:n, y:y, answer:M.write(y, {sf:n}, "plain"), raw:calc(y), equality:bigOne + " = " + smallK,
        // The right factor; flipped (the starting unit on top); swapped numbers (it cancels, but the equality is false); both.
        right:down ? frac(smallK, bigOne) : frac(bigOne, smallK), flip:down ? frac(bigOne, smallK) : frac(smallK, bigOne),
        swap:down ? frac(smallOne, bigK) : frac(bigK, smallOne), both:down ? frac(bigK, smallOne) : frac(smallOne, bigK)};
    }
    function makeSetup(random, list, way, nlo, nhi, test) {
      for (;;) {
        var key = pick(random, list), e = EQ[key], down = way ? way === "down" : random() < 0.5, range = START[down ? e.big + ">" + e.small : e.small + ">" + e.big];
        var x = measure(random, int(random, nlo, nhi), range[0], range[1]), params = [key, down ? "down" : "up", x], s = setup(params);
        if (clean(s.y, s.n) && (!test || test(s))) return params;
      }
    }
    function times(s, factor) { return show(s.x) + " " + s.a + " × " + factor.text; }
    // Rounded as if the factor's numbers were measurements: to 1 significant figure (the 1), or to k's figures.
    function limited(s) {
      var out = [], k = sf(s.e.k);
      [1, k].forEach(function (m) {
        if (m >= s.n) return;
        var v = M.rounded(s.y, {sf:m}).value;
        if (M.cmp(v, M.rounded(s.y, {sf:s.n}).value) !== 0 && !out.some(function (o) { return M.cmp(o.value, v) === 0; })) out.push({m:m, value:v});
      });
      return out;
    }
    function exactNote(s) {
      return fill(p("{eq} is an exact equality, so it does not limit significant figures. Keep the measurement's {n}.", "{eq} es una igualdad exacta, así que no limita las cifras significativas. Conserva las {n} de la medición."),
        {eq:s.equality, n:figs(s.n)});
    }
    function traps(s) {
      var wrong = s.down ? M.div(s.x, s.e.k) : M.mul(s.x, s.e.k), out = [{answer:wrong.n + "/" + wrong.d,
        note:fill(p("Your factor was upside down. Put the new unit, {b}, on top and the starting unit, {a}, on the bottom so {a} cancels.", "Tu factor estaba al revés. Pon la unidad nueva, {b}, arriba y la unidad inicial, {a}, abajo para que {a} se cancele."), {a:s.a, b:s.b})}];
      return out.concat(limited(s).map(function (l) { return {answer:l.value.n + "/" + l.value.d, note:exactNote(s)}; }));
    }
    function numeric(s, strict) {
      return {type:"numeric", answer:s.y.n + "/" + s.y.d, precision:{sf:s.n}, unit:s.b, accept:UNIT[s.b].accept,
        check:{sf:strict ? "strict" : "advice", unit:"optional"}, display:s.answer + " " + s.b, answerText:p(show(s.answer) + " " + s.b, show(s.answer) + " " + s.b),
        traps:traps(s), instruction:strict ? p("Significant figures count here.", "Aquí cuentan las cifras significativas.") : fill(p("Keep {n}.", "Conserva {n}."), {n:figs(s.n)}),
        prompt:fill(p("Convert {x} {a} to {name}.", "Convierte {x} {a} a {name}."), {x:show(s.x), a:s.a, name:UNIT[s.b].name})};
    }
    function convert(params) {
      var s = setup(params), q = numeric(s, false);
      q.explanation = fill(p("Put the new unit, {b}, on top and the starting unit, {a}, on the bottom so {a} cancels: {setup} = {raw} {b}. The factor is exact, so keep the measurement's {n}: {y} {b}.",
        "Pon la unidad nueva, {b}, arriba y la unidad inicial, {a}, abajo para que {a} se cancele: {setup} = {raw} {b}. El factor es exacto, así que conserva las {n} de la medición: {y} {b}."),
        {a:s.a, b:s.b, setup:times(s, s.right), raw:s.raw, n:figs(s.n), y:show(s.answer)});
      return q;
    }
    function exactQuestion(params) {
      var s = setup(params), q = numeric(s, true);
      q.explanation = fill(p("{eq} is an exact equality, so it does not limit significant figures. {setup} = {raw} {b}. {x} {a} has {n}, so the answer is {y} {b}.",
        "{eq} es una igualdad exacta, así que no limita las cifras significativas. {setup} = {raw} {b}. {x} {a} tiene {n}, así que la respuesta es {y} {b}."),
        {eq:s.equality, setup:times(s, s.right), raw:s.raw, b:s.b, x:show(s.x), a:s.a, n:figs(s.n), y:show(s.answer)});
      return q;
    }
    function result(s) { return times(s, s.right) + " = " + show(s.answer) + " " + s.b; }
    // [text, why] pairs, the key first. A text is a pair, or a string that reads the same in both languages.
    function choices(list) { return list.map(function (c, i) { return {text:typeof c[0] === "string" ? p(c[0], c[0]) : c[0], why:i ? c[1] : p("", "")}; }); }

    // The rounding choices for a calculator result: the right one first, then rounded by the factor's numbers, every
    // digit, one figure more and one figure less. Only answers that standard notation shows clearly.
    function roundings(s) {
      var right = s.answer, out = [[right, null]];
      function add(text, why) { if (text && !out.some(function (o) { return o[0] === text; })) out.push([text, why]); }
      function at(m) { var t = M.write(s.y, {sf:m}, "plain"); return sf(t) === m ? t : null; }
      limited(s).forEach(function (l) {
        add(at(l.m), l.m === 1 ? fill(p("This rounds to 1 significant figure, as if the 1 in 1 {big} limited the answer. Exact factors never limit significant figures.",
          "Esto redondea a 1 cifra significativa, como si el 1 de 1 {big} limitara la respuesta. Los factores exactos nunca limitan las cifras significativas."), {big:s.e.big}) :
          fill(p("This rounds to {m}, as if {k} {small} were a measurement. Exact factors never limit significant figures.",
            "Esto redondea a {m}, como si {k} {small} fuera una medición. Los factores exactos nunca limitan las cifras significativas."), {m:figs(l.m), k:show(s.e.k), small:s.e.small}));
      });
      var raw = s.raw.replace(/,/g, "");
      if (sf(raw) > s.n) add(raw, fill(p("This keeps every calculator digit. Round to the measurement's {n}.", "Esto conserva todos los dígitos de la calculadora. Redondea a las {n} de la medición."), {n:figs(s.n)}));
      add(at(s.n + 1), fill(p("This has {more}, but the measurement {x} {a} has only {n}.", "Esto tiene {more}, pero la medición {x} {a} solo tiene {n}."), {more:figs(s.n + 1), x:show(s.x), a:s.a, n:figs(s.n)}));
      if (s.n > 2) add(at(s.n - 1), fill(p("This is rounded too far. Keep the measurement's {n}.", "Esto está demasiado redondeado. Conserva las {n} de la medición."), {n:figs(s.n)}));
      return out.slice(0, 4).map(function (o) { return [show(o[0]) + " " + s.b, o[1]]; });
    }

    var topics = [
      {id:"factor", title:p("Conversion factors", "Factores de conversión")},
      {id:"convert", title:p("Setting up and converting", "Planteamiento y conversión")},
      {id:"exact", title:p("Exact factors and significant figures", "Factores exactos y cifras significativas")}
    ];
    var generators = [
      // Which factor: the four ways to write one equality as a fraction.
      {key:"fe", topic:"factor", make:function (r) { return makeSetup(r, FIRST, null, 2, 4); }, build:function (params) {
        var s = setup(params);
        return {type:"mc", answer:0, prompt:fill(p("To convert {x} {a} to {name}, which conversion factor do you multiply by?", "Para convertir {x} {a} a {name}, ¿por qué factor de conversión multiplicas?"),
          {x:show(s.x), a:s.a, name:UNIT[s.b].name}),
          choices:choices([[s.right.text], [s.flip.text, fill(p("{a} is on top here, so it does not cancel. Put the new unit on top and the starting unit on the bottom.", "Aquí {a} está arriba, así que no se cancela. Pon la unidad nueva arriba y la unidad inicial abajo."), {a:s.a})],
            [s.swap.text, fill(p("{a} cancels, but this factor says {t} = {u}, which is not true. Keep each number with its own unit.", "{a} se cancela, pero este factor dice que {t} = {u}, y eso no es cierto. Deja cada número con su propia unidad."), {a:s.a, t:s.swap.top, u:s.swap.bottom})],
            [s.both.text, fill(p("This factor says {t} = {u}, which is not true, and {a} is on top, so it does not cancel.", "Este factor dice que {t} = {u}, y eso no es cierto; además {a} está arriba, así que no se cancela."), {a:s.a, t:s.both.top, u:s.both.bottom})]]),
          explanation:fill(p("{eq}. Put the new unit, {b}, on top and the starting unit, {a}, on the bottom: {f}. Then {a} cancels: {result}.",
            "{eq}. Pon la unidad nueva, {b}, arriba y la unidad inicial, {a}, abajo: {f}. Así {a} se cancela: {result}."), {eq:s.equality, a:s.a, b:s.b, f:s.right.text, result:result(s)})};
      }},
      // A factor upside down gives a squared unit (s²/min): flip it.
      {key:"fl", topic:"factor", make:function (r) { return makeSetup(r, FIRST, null, 2, 4); }, build:function (params) {
        var s = setup(params), sq = s.a + "²/" + s.b;
        return {type:"mc", answer:0, prompt:fill(p("A student converts {x} {a} to {name} with {setup}. What went wrong?", "Un estudiante convierte {x} {a} a {name} con {setup}. ¿Qué salió mal?"),
          {x:show(s.x), a:s.a, name:UNIT[s.b].name, setup:times(s, s.flip)}),
          choices:choices([[fill(p("{a} does not cancel, so the units come out as {sq}. Flip the factor.", "{a} no se cancela, así que las unidades quedan como {sq}. Voltea el factor."), {a:s.a, sq:sq})],
            [fill(p("Nothing. The units cancel and the answer is in {b}.", "Nada. Las unidades se cancelan y la respuesta queda en {b}."), {b:s.b}),
              fill(p("{a} is on top in the factor and in {x} {a}, so it cannot cancel: the units are {sq}.", "{a} está arriba en el factor y en {x} {a}, así que no se puede cancelar: las unidades son {sq}."), {a:s.a, x:show(s.x), sq:sq})],
            [p("The factor does not equal 1, so the amount changes.", "El factor no es igual a 1, así que la cantidad cambia."),
              fill(p("The flipped factor still equals 1. The problem is that {a} does not cancel.", "El factor volteado sigue siendo igual a 1. El problema es que {a} no se cancela."), {a:s.a})],
            [p("The answer needs fewer significant figures.", "La respuesta necesita menos cifras significativas."),
              p("Significant figures cannot fix a setup whose units do not cancel. Flip the factor.", "Las cifras significativas no arreglan un planteamiento cuyas unidades no se cancelan. Voltea el factor.")]]),
          explanation:fill(p("{wrong} gives {sq}, so nothing cancels. Flip the factor: {result}.", "{wrong} da {sq}, así que nada se cancela. Voltea el factor: {result}."), {wrong:times(s, s.flip), sq:sq, result:result(s)})};
      }},
      // Why the amount does not change: the factor equals 1.
      {key:"f1", topic:"factor", make:function (r) { return makeSetup(r, FIRST, null, 2, 4); }, build:function (params) {
        var s = setup(params), y = show(s.answer) + " " + s.b;
        return {type:"mc", answer:0, prompt:fill(p("{result}. Why is {y} the same amount as {x} {a}?", "{result}. ¿Por qué {y} es la misma cantidad que {x} {a}?"), {result:result(s), y:y, x:show(s.x), a:s.a}),
          choices:choices([[fill(p("The factor equals 1: {t} and {u} are the same amount.", "El factor es igual a 1: {t} y {u} son la misma cantidad."), {t:s.right.top, u:s.right.bottom})],
            [p("The units cancel, so the number does not change.", "Las unidades se cancelan, así que el número no cambia."),
              fill(p("The number does change, from {x} to {y}. The amount stays the same because the factor equals 1.", "El número sí cambia, de {x} a {y}. La cantidad es la misma porque el factor es igual a 1."), {x:show(s.x), y:show(s.answer)})],
            [p("Exact factors do not count, so they change nothing.", "Los factores exactos no cuentan, así que no cambian nada."),
              p("Exact factors do not limit significant figures, but they still change the number. The amount stays the same because the factor equals 1.", "Los factores exactos no limitan las cifras significativas, pero sí cambian el número. La cantidad es la misma porque el factor es igual a 1.")],
            [p("A different unit always means the same amount.", "Una unidad distinta siempre significa la misma cantidad."),
              fill(p("Not always: {x} {b} would be a different amount. The amount stays the same only because the factor equals 1.", "No siempre: {x} {b} sería una cantidad distinta. La cantidad es la misma solo porque el factor es igual a 1."), {x:show(s.x), b:s.b})]]),
          explanation:fill(p("{t} and {u} are equal, so {f} equals 1. Multiplying by 1 changes the number and the unit, but not the amount.",
            "{t} y {u} son iguales, así que {f} es igual a 1. Multiplicar por 1 cambia el número y la unidad, pero no la cantidad."), {t:s.right.top, u:s.right.bottom, f:s.right.text})};
      }},
      // Choose the setup: written like 5.0 ft × (12 in / 1 ft).
      {key:"st", topic:"convert", make:function (r) { return makeSetup(r, ALL, null, 2, 4); }, build:function (params) {
        var s = setup(params);
        return {type:"mc", answer:0, prompt:fill(p("Which setup converts {x} {a} to {name}?", "¿Qué planteamiento convierte {x} {a} a {name}?"), {x:show(s.x), a:s.a, name:UNIT[s.b].name}),
          choices:choices([[times(s, s.right)],
            [times(s, s.flip), fill(p("{a} is on top in the factor, so it does not cancel. Flip the factor.", "{a} está arriba en el factor, así que no se cancela. Voltea el factor."), {a:s.a})],
            [times(s, s.swap), fill(p("{a} cancels, but this factor says {t} = {u}, which is not true.", "{a} se cancela, pero este factor dice que {t} = {u}, y eso no es cierto."), {a:s.a, t:s.swap.top, u:s.swap.bottom})],
            [show(s.x) + " " + s.a + " ÷ " + s.right.text, fill(p("Dividing by this factor is the same as multiplying by its flip, so {a} does not cancel.", "Dividir entre este factor es lo mismo que multiplicar por el factor volteado, así que {a} no se cancela."), {a:s.a})]]),
          explanation:fill(p("Put the new unit, {b}, on top and the starting unit, {a}, on the bottom, so {a} cancels: {result}.", "Pon la unidad nueva, {b}, arriba y la unidad inicial, {a}, abajo, para que {a} se cancele: {result}."),
            {a:s.a, b:s.b, result:result(s)})};
      }},
      // Converting to a smaller unit (multiply) and to a larger unit (divide), significant figures as advice.
      {key:"cm", topic:"convert", make:function (r) { return makeSetup(r, ALL, "down", 2, 4); }, build:convert},
      {key:"cd", topic:"convert", make:function (r) { return makeSetup(r, ALL, "up", 2, 4); }, build:convert},
      // Exact factors: the measurement alone sets the significant figures, which are scored here.
      {key:"es", topic:"exact", make:function (r) { return makeSetup(r, ALL, null, 3, 4, function (s) { return limited(s).length > 0; }); }, build:exactQuestion},
      {key:"em", topic:"exact", make:function (r) { return makeSetup(r, ALL, null, 3, 4, function (s) { return sf(s.raw.replace(/,/g, "")) > s.n && roundings(s).length === 4; }); }, build:function (params) {
        var s = setup(params);
        return {type:"mc", answer:0, prompt:fill(p("A calculator shows {setup} = {raw} {b}. What is the answer with the right number of significant figures?",
          "Una calculadora muestra {setup} = {raw} {b}. ¿Cuál es la respuesta con el número correcto de cifras significativas?"), {setup:times(s, s.right), raw:s.raw, b:s.b}),
          choices:choices(roundings(s)),
          explanation:fill(p("{eq} is an exact equality, so only the measurement limits significant figures. {x} {a} has {n}, so the answer is {y} {b}.",
            "{eq} es una igualdad exacta, así que solo la medición limita las cifras significativas. {x} {a} tiene {n}, así que la respuesta es {y} {b}."),
            {eq:s.equality, x:show(s.x), a:s.a, n:figs(s.n), y:show(s.answer), b:s.b})};
      }},
      {key:"ew", topic:"exact", make:function (r) { return makeSetup(r, ALL, null, 2, 4); }, build:function (params) {
        var s = setup(params), k = show(s.e.k);
        return {type:"mc", answer:0, prompt:fill(p("Which number limits the significant figures of {setup}?", "¿Qué número limita las cifras significativas de {setup}?"), {setup:times(s, s.right)}),
          choices:choices([[fill(p("Only the measurement, {x} {a}", "Solo la medición, {x} {a}"), {x:show(s.x), a:s.a})],
            [fill(p("The factor's {k} {small}", "Los {k} {small} del factor"), {k:k, small:s.e.small}),
              fill(p("{eq} is a defined equality, so {k} is exact. It has unlimited significant figures.", "{eq} es una igualdad definida, así que {k} es exacto. Tiene cifras significativas ilimitadas."), {eq:s.equality, k:k})],
            [fill(p("The 1 in 1 {big}", "El 1 de 1 {big}"), {big:s.e.big}),
              p("The 1 is part of the same exact equality, so it never limits the answer.", "El 1 es parte de la misma igualdad exacta, así que nunca limita la respuesta.")],
            [p("All three numbers, so keep the fewest significant figures", "Los tres números, así que conserva la menor cantidad de cifras significativas"),
              p("Only measured numbers limit significant figures. Both numbers in the factor are exact.", "Solo los números medidos limitan las cifras significativas. Los dos números del factor son exactos.")]]),
          explanation:fill(p("{eq} is an exact equality, so only the measurement counts. {x} {a} has {n}: {result}.", "{eq} es una igualdad exacta, así que solo cuenta la medición. {x} {a} tiene {n}: {result}."),
            {eq:s.equality, x:show(s.x), a:s.a, n:figs(s.n), result:result(s)})};
      }}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/units/unit-conversions/",
      copy:{title:"Unit Conversions Practice", es:{
        "Unit Conversions Practice":"Práctica de conversiones de unidades",
        "Quantitative Skills · Units":"Habilidades cuantitativas · Unidades",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The method and the exact equalities are below.":"Sin límite de tiempo. Usa papel y calculadora. El método y las igualdades exactas están abajo.",
        "Choose a skill, then start. Mixed review includes all three skills.":"Elige una habilidad y comienza. El repaso mixto incluye las tres habilidades.",
        "Type your answer. A unit after the number is optional.":"Escribe tu respuesta. La unidad después del número es opcional.",
        "Exact factors never limit significant figures. In Exact factors and significant figures, an answer with the wrong number of significant figures is marked incorrect; in the other skills it gets a note.":"Los factores exactos nunca limitan las cifras significativas. En Factores exactos y cifras significativas, una respuesta con un número incorrecto de cifras significativas se marca como incorrecta; en las otras habilidades recibe una nota.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 15.2. You may add the unit after it.":"Escribe un número como 15.2. Puedes agregar la unidad después.",
        "Unit":"Unidad", "Reference":"Consulta", "Using conversion factors":"Uso de los factores de conversión",
        "A conversion factor is an equality written as a fraction. It equals 1, so the amount does not change.":"Un factor de conversión es una igualdad escrita como fracción. Es igual a 1, así que la cantidad no cambia.",
        "Each equality gives two factors: 1 min = 60 s gives (60 s / 1 min) and (1 min / 60 s).":"Cada igualdad da dos factores: 1 min = 60 s da (60 s / 1 min) y (1 min / 60 s).",
        "Put the new unit on top and the starting unit on the bottom, then cross out the units that cancel: 3.25 min × (60 s / 1 min) = 195 s.":"Pon la unidad nueva arriba y la unidad inicial abajo, y tacha las unidades que se cancelan: 3.25 min × (60 s / 1 min) = 195 s.",
        "If nothing cancels (you get s²/min), flip the factor: 150 s × (1 min / 60 s) = 2.5 min.":"Si nada se cancela (te queda s²/min), voltea el factor: 150 s × (1 min / 60 s) = 2.5 min.",
        "Defined equalities are exact. They never limit significant figures, so the answer keeps the measurement's: 4.25 h × (60 min / 1 h) = 255 min.":"Las igualdades definidas son exactas. Nunca limitan las cifras significativas, así que la respuesta conserva las de la medición: 4.25 h × (60 min / 1 h) = 255 min.",
        "Exact equalities":"Igualdades exactas",
        "Time: 1 min = 60 s, 1 h = 60 min, 1 d = 24 h":"Tiempo: 1 min = 60 s, 1 h = 60 min, 1 d = 24 h",
        "Length: 1 yd = 3 ft, 1 ft = 12":"Longitud: 1 yd = 3 ft, 1 ft = 12",
        "Symbols: s seconds, min minutes, h hours, d days, yd yards, ft feet,":"Símbolos: s segundos, min minutos, h horas, d días, yd yardas, ft pies,",
        "inches, cm centimeters":"pulgadas, cm centímetros",
        "Practice for the Unit Conversions lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Conversiones de unidades de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
