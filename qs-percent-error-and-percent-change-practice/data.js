(function () {
  "use strict";
  // Percent Error and Percent Change Practice: generated questions for the Quantitative Skills lesson. Every set has new
  // numbers. The rules follow the lesson on zornscience.org: percent error = |measured − accepted| ÷ accepted × 100, with
  // the accepted value always on the bottom and an absolute value, so it is never negative; percent change = (new −
  // original) ÷ original × 100, with the original always on the bottom and the sign kept (+ for an increase, − for a
  // decrease). Significant figures follow the difference: the subtraction keeps the fewest decimal places, then the
  // division keeps the fewest significant figures. The lesson shows this without stating it, so each question names the
  // number of significant figures and they are scored as advice.
  var SLUG = "qs-percent-error-and-percent-change-practice";
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
    function decimalsOf(text) { var i = text.indexOf("."); return i < 0 ? 0 : text.length - i - 1; }
    function full(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return M.fixed(value, -k);
      return null;
    }
    // What a calculator shows: every digit of a terminating decimal, otherwise 10 significant figures.
    function calc(value) {
      var t = full(value);
      return show(t !== null ? t : M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }
    // "= 35" for a value that ends, "≈ 2.455357143" for one a calculator cuts off.
    function equals(value) { return (full(value) !== null ? "= " : "≈ ") + calc(value); }
    // Why the answer keeps n significant figures: the difference against the value on the bottom.
    function keeps(d, nd, bottom, nb, ans, isError) {
      var n = Math.min(nd, nb), b = isError ? p("the accepted value", "el valor aceptado") : p("the original value", "el valor original");
      if (nd < nb) return fill(p("The difference, {d}, has only {n}, so the answer keeps {n}: {ans}%.", "La diferencia, {d}, solo tiene {n}, así que la respuesta conserva {n}: {ans}%."), {d:show(d), n:figs(n), ans:ans});
      if (nd > nb) return fill(p("The original value, {b}, has only {n}, so the answer keeps {n}: {ans}%.", "El valor original, {b}, solo tiene {n}, así que la respuesta conserva {n}: {ans}%."), {b:show(bottom), n:figs(n), ans:ans});
      return fill(p("The difference, {d}, and {w} both have {n}, so the answer keeps {n}: {ans}%.", "La diferencia, {d}, y {w} tienen {n} cada uno, así que la respuesta conserva {n}: {ans}%."), {d:show(d), w:b, n:figs(n), ans:ans});
    }
    var PCT = ["%", "percent", "per cent", "pct", "por ciento", "porciento"];
    function trapsFor(answer, P, list) {
      var seen = [M.write(answer, P, "plain")], out = [];
      list.forEach(function (t) {
        var w = M.write(t[0], P, "plain");
        if (M.sign(t[0]) && seen.indexOf(w) < 0) { seen.push(w); out.push({answer:frac(M.exact(t[0])), note:t[1]}); }
      });
      return out;
    }
    var NO100 = p("Multiply by 100 to write the answer as a percent.", "Multiplica por 100 para escribir la respuesta como porcentaje.");
    // Two values with the same decimal places, as one instrument reads them. The difference must show at least two
    // significant figures (with no zeros at the end of a whole number), so its precision is clear.
    function nearby(random, base, lo, hi, up) {
      var d = decimalsOf(base);
      for (;;) {
        var f = lo + random() * (hi - lo), v = M.fixed(M.roundAt(String(Number(base) * (up ? 1 + f : 1 - f)), -d), -d), diff = M.fixed(M.abs(M.sub(v, base)), -d);
        if (M.sign(v) > 0 && sfOf(diff) >= 2 && !(d === 0 && /0$/.test(diff))) return v;
      }
    }

    // Percent error. The accepted value is the true value scientists agree on.
    var ERRORS = {
      boil:{a:"100.0", unit:"°C", text:p("A student measures the boiling point of water as {m}.", "Un estudiante mide el punto de ebullición del agua y obtiene {m}.")},
      gravity:{a:"9.81", unit:"m/s²", text:p("A pendulum lab gives {m} for the acceleration due to gravity, g.", "Un laboratorio con un péndulo da {m} para la aceleración debida a la gravedad, g.")},
      aluminum:{a:"2.70", unit:"g/cm³", text:p("A student finds the density of an aluminum block to be {m}.", "Un estudiante encuentra que la densidad de un bloque de aluminio es {m}.")},
      copper:{a:"8.96", unit:"g/cm³", text:p("A student finds the density of a copper sample to be {m}.", "Un estudiante encuentra que la densidad de una muestra de cobre es {m}.")},
      sound:{a:"343", unit:"m/s", text:p("A student measures the speed of sound in air as {m}.", "Un estudiante mide la rapidez del sonido en el aire y obtiene {m}.")},
      heat:{a:"4.18", unit:"J/(g·°C)", text:p("A calorimetry lab gives {m} for the specific heat of water.", "Un laboratorio de calorimetría da {m} para el calor específico del agua.")},
      balance:{a:"50.00", unit:"g", text:p("A balance reads {m} for a standard mass.", "Una balanza marca {m} para una pesa patrón.")},
      rod:{a:"1.000", unit:"m", text:p("A student measures a standard rod as {m} long.", "Un estudiante mide una barra patrón y obtiene {m} de largo.")},
      co2:{a:"44.01", unit:"g/mol", text:p("An experiment gives a molar mass of {m} for carbon dioxide.", "Un experimento da una masa molar de {m} para el dióxido de carbono.")},
      butane:{a:"58.12", unit:"g/mol", text:p("An experiment gives a molar mass of {m} for butane.", "Un experimento da una masa molar de {m} para el butano.")}
    };
    var CONSTANTS = ["boil", "gravity", "aluminum", "copper", "sound", "heat"], STANDARDS = ["balance", "rod", "co2", "butane"];
    function errorPrompt(c, m, a, ask) {
      return join([fill(c.text, {m:show(m) + " " + c.unit}), fill(p("The accepted value is {a}.", "El valor aceptado es {a}."), {a:show(a) + " " + c.unit}), ask]);
    }
    function errorQuestion(params) {
      var c = ERRORS[params[0]], m = params[1], a = params[2], d = M.fixed(M.abs(M.sub(m, a)), -decimalsOf(a)), n = Math.min(sfOf(d), sfOf(a)), P = {sf:n};
      var x = M.mul(M.div(d, a), "100"), answer = M.write(x, P, "plain");
      return {type:"numeric", answer:frac(x), precision:P, unit:"%", accept:PCT, check:{sf:"advice", unit:"optional"},
        display:answer + " %", answerText:p(show(answer) + "%", show(answer) + "%"),
        traps:trapsFor(x, P, [[M.mul(M.div(d, m), "100"), p("The accepted value goes on the bottom, not the measured value.", "El valor aceptado va abajo, no el valor medido.")],
          [M.mul(M.div(m, a), "100"), p("Subtract first. Percent error divides the difference by the accepted value.", "Primero resta. El porcentaje de error divide la diferencia entre el valor aceptado.")],
          [M.div(d, a), NO100],
          [M.neg(x), p("Percent error uses the absolute value, so it is never negative.", "El porcentaje de error usa el valor absoluto, así que nunca es negativo.")]]),
        instruction:fill(p("Round to {n}.", "Redondea a {n}."), {n:figs(n)}),
        prompt:errorPrompt(c, m, a, p("What is the percent error?", "¿Cuál es el porcentaje de error?")),
        explanation:join([fill(p("Percent error = |measured − accepted| ÷ accepted × 100 = |{m} − {a}| ÷ {a} × 100 = {d} ÷ {a} × 100 {calc}%.",
          "Porcentaje de error = |valor medido − valor aceptado| ÷ valor aceptado × 100 = |{m} − {a}| ÷ {a} × 100 = {d} ÷ {a} × 100 {calc}%."),
          {m:show(m), a:show(a), d:show(d), calc:equals(x)}),
          keeps(d, sfOf(d), a, sfOf(a), show(answer), true)])};
    }
    function makeError(random, keys) {
      var key = pick(random, keys), a = ERRORS[key].a;
      for (;;) {
        var params = [key, nearby(random, a, 0.005, 0.12, random() < 0.5), a], q = errorQuestion(params);
        if (sfOf(q.display.split(" ")[0]) === q.precision.sf) return params;
      }
    }

    // Percent change. The original value goes on the bottom, and the sign shows an increase or a decrease.
    var CHANGES = {
      plant:{o:[10, 60], d:1, unit:"cm", subject:p("The height of a plant", "La altura de una planta"), noun:p("height", "la altura")},
      gas:{o:[1, 5], d:2, unit:"L", subject:p("The volume of a gas", "El volumen de un gas"), noun:p("volume", "el volumen")},
      cart:{o:[0.5, 5], d:2, unit:"m/s", subject:p("The speed of a cart", "La rapidez de un carrito"), noun:p("speed", "la rapidez")},
      pendulum:{o:[1, 3], d:2, unit:"s", subject:p("The period of a pendulum", "El periodo de un péndulo"), noun:p("period", "el periodo")},
      sample:{o:[20, 90], d:1, unit:"g", subject:p("The mass of a sample", "La masa de una muestra"), noun:p("mass", "la masa")},
      spring:{o:[10, 30], d:1, unit:"cm", subject:p("The length of a spring", "La longitud de un resorte"), noun:p("length", "la longitud")},
      solution:{o:[0.1, 0.9], d:3, unit:"M", subject:p("The concentration of a solution", "La concentración de una solución"), noun:p("concentration", "la concentración")}
    };
    function changeParts(params) {
      var c = CHANGES[params[0]], o = params[1], nw = params[2], d = M.fixed(M.sub(nw, o), -c.d), n = Math.min(sfOf(d), sfOf(o)), P = {sf:n};
      var x = M.mul(M.div(d, o), "100"), answer = M.write(x, P, "plain"), up = M.sign(x) > 0;
      return {c:c, o:o, nw:nw, d:d, n:n, P:P, x:x, answer:answer, up:up, typed:(up ? "+" : "") + answer, shown:(up ? "+" : "") + show(answer)};
    }
    function changeText(c, o, nw) { return fill(p("{s} changes from {o} to {n}.", "{s} cambia de {o} a {n}."), {s:c.subject, o:show(o) + " " + c.unit, n:show(nw) + " " + c.unit}); }
    function changeQuestion(params) {
      var k = changeParts(params), c = k.c;
      return {type:"numeric", answer:frac(k.x), precision:k.P, unit:"%", accept:PCT, check:{sf:"advice", unit:"optional"},
        display:k.typed + " %", answerText:p(k.shown + "%", k.shown + "%"),
        traps:trapsFor(k.x, k.P, [[M.mul(M.div(k.d, k.nw), "100"), p("Divide by the original value, not the new value.", "Divide entre el valor original, no entre el nuevo.")],
          [M.neg(k.x), k.up ? p("Subtract new minus original. The value went up, so the percent change is positive.", "Resta nuevo menos original. El valor aumentó, así que el cambio porcentual es positivo.") :
            p("Keep the sign. The value went down, so the percent change is negative.", "Conserva el signo. El valor disminuyó, así que el cambio porcentual es negativo.")],
          [M.mul(M.div(k.nw, k.o), "100"), p("Subtract first: new minus original, then divide by the original.", "Primero resta: nuevo menos original, y luego divide entre el original.")],
          [M.div(k.d, k.o), NO100]]),
        instruction:fill(p("Round to {n}. A decrease needs a negative sign.", "Redondea a {n}. Una disminución lleva signo negativo."), {n:figs(k.n)}),
        prompt:join([changeText(c, k.o, k.nw), p("What is the percent change?", "¿Cuál es el cambio porcentual?")]),
        explanation:join([fill(p("Percent change = (new − original) ÷ original × 100 = ({n} − {o}) ÷ {o} × 100 {calc}%.",
          "Cambio porcentual = (nuevo − original) ÷ original × 100 = ({n} − {o}) ÷ {o} × 100 {calc}%."), {n:show(k.nw), o:show(k.o), calc:equals(k.x)}),
          keeps(k.d, sfOf(k.d), k.o, sfOf(k.o), k.shown, false),
          fill(k.up ? p("It is positive, so {q} increased.", "Es positivo, así que {q} aumentó.") : p("It is negative, so {q} decreased.", "Es negativo, así que {q} disminuyó."),
            {q:p("the " + c.noun.en, c.noun.es)})])};
    }
    function changeValues(random, key, up) {
      var c = CHANGES[key];
      for (;;) {
        var o = M.fixed(M.roundAt(String(c.o[0] + random() * (c.o[1] - c.o[0])), -c.d), -c.d);
        var params = [key, o, nearby(random, o, up ? 0.05 : 0.05, up ? 2 : 0.6, up)], k = changeParts(params);
        if (sfOf(o) >= 2 && sfOf(k.answer) === k.n) return params;
      }
    }
    function makeChange(random, up) { return changeValues(random, pick(random, Object.keys(CHANGES)), up); }

    // Setups: which value goes on the bottom, and where the absolute value and the sign belong.
    function setupQuestion(params) {
      if (params[0] === "e") {
        var c = ERRORS[params[1]], m = params[2], a = params[3], M_ = show(m), A_ = show(a), q = errorQuestion([params[1], m, a]);
        var key = "|" + M_ + " − " + A_ + "| ÷ " + A_ + " × 100", signed = M.cmp(m, a) > 0 ? "(" + A_ + " − " + M_ + ") ÷ " + A_ + " × 100" : "(" + M_ + " − " + A_ + ") ÷ " + A_ + " × 100";
        return {type:"mc", answer:0, prompt:errorPrompt(c, m, a, p("Which calculation gives the percent error?", "¿Qué cálculo da el porcentaje de error?")),
          choices:[
            {text:p(key, key), why:p("", "")},
            {text:p("|" + M_ + " − " + A_ + "| ÷ " + M_ + " × 100", "|" + M_ + " − " + A_ + "| ÷ " + M_ + " × 100"), why:p("This divides by the measured value. The accepted value always goes on the bottom.", "Esto divide entre el valor medido. El valor aceptado siempre va abajo.")},
            {text:p(M_ + " ÷ " + A_ + " × 100", M_ + " ÷ " + A_ + " × 100"), why:p("This skips the subtraction. Percent error divides the difference by the accepted value.", "Esto omite la resta. El porcentaje de error divide la diferencia entre el valor aceptado.")},
            {text:p(signed, signed), why:p("Without the absolute value, this gives a negative number. Percent error is never negative.", "Sin el valor absoluto, esto da un número negativo. El porcentaje de error nunca es negativo.")}
          ],
          explanation:fill(p("The accepted value, {a}, goes on the bottom, and the absolute value keeps the answer positive: {key} {calc}%.", "El valor aceptado, {a}, va abajo, y el valor absoluto hace que la respuesta sea positiva: {key} {calc}%."),
            {a:A_, key:key, calc:equals(M.exact(q.answer))})};
      }
      var k = changeParts([params[1], params[2], params[3]]), O = show(k.o), N = show(k.nw);
      var ckey = "(" + N + " − " + O + ") ÷ " + O + " × 100";
      return {type:"mc", answer:0, prompt:join([changeText(k.c, k.o, k.nw), p("Which calculation gives the percent change?", "¿Qué cálculo da el cambio porcentual?")]),
        choices:[
          {text:p(ckey, ckey), why:p("", "")},
          {text:p("(" + N + " − " + O + ") ÷ " + N + " × 100", "(" + N + " − " + O + ") ÷ " + N + " × 100"), why:p("This divides by the new value. The original value always goes on the bottom.", "Esto divide entre el valor nuevo. El valor original siempre va abajo.")},
          {text:p("(" + O + " − " + N + ") ÷ " + O + " × 100", "(" + O + " − " + N + ") ÷ " + O + " × 100"), why:p("This subtracts in the wrong order, so the sign is flipped. Always use new minus original.", "Esto resta en el orden incorrecto, así que el signo queda invertido. Siempre usa nuevo menos original.")},
          {text:p("|" + N + " − " + O + "| ÷ " + O + " × 100", "|" + N + " − " + O + "| ÷ " + O + " × 100"), why:p("Percent change uses no absolute value. Its sign shows whether the value went up or down.", "El cambio porcentual no usa valor absoluto. Su signo muestra si el valor aumentó o disminuyó.")}
        ],
        explanation:fill(p("The original value, {o}, goes on the bottom, and new minus original keeps the sign: {key} {calc}%.", "El valor original, {o}, va abajo, y nuevo menos original conserva el signo: {key} {calc}%."),
          {o:O, key:ckey, calc:equals(k.x)})};
    }
    function makeSetup(random) {
      if (random() < 0.5) {
        var e = makeError(random, CONSTANTS.concat(STANDARDS));
        return ["e"].concat(e);
      }
      return ["c"].concat(makeChange(random, random() < 0.5));
    }
    // What a sign means.
    var SAMPLES = {
      mass:{unit:"g", en:{subject:"The mass of a sample", cap:"The mass", noun:"mass"}, es:{subject:"La masa de una muestra", cap:"La masa", newCap:"La nueva masa", orig:"la masa original", rel:"respecto a la masa original", ofOrig:"de la original"}},
      volume:{unit:"mL", en:{subject:"The volume of a gas", cap:"The volume", noun:"volume"}, es:{subject:"El volumen de un gas", cap:"El volumen", newCap:"El nuevo volumen", orig:"el volumen original", rel:"respecto al volumen original", ofOrig:"del original"}},
      length:{unit:"cm", en:{subject:"The length of a spring", cap:"The length", noun:"length"}, es:{subject:"La longitud de un resorte", cap:"La longitud", newCap:"La nueva longitud", orig:"la longitud original", rel:"respecto a la longitud original", ofOrig:"de la original"}}
    };
    function signQuestion(params) {
      var s = SAMPLES[params[0]], v = params[1], up = params[2] === "+", sign = up ? "+" : "−", left = String(up ? 100 + Number(v) : 100 - Number(v));
      var en = s.en, es = s.es, origEn = "the original " + en.noun;
      var rise = p(en.cap + " increased by " + v + "% of " + origEn + ".", es.cap + " aumentó " + v + "% " + es.rel + ".");
      var fall = p(en.cap + " decreased by " + v + "% of " + origEn + ".", es.cap + " disminuyó " + v + "% " + es.rel + ".");
      return {type:"mc", answer:0,
        prompt:p(en.subject + " has a percent change of " + sign + v + "%. What does this mean?", es.subject + " tiene un cambio porcentual de " + sign + v + "%. ¿Qué significa esto?"),
        choices:[
          {text:up ? rise : fall, why:p("", "")},
          {text:up ? fall : rise, why:up ? p("A positive percent change means an increase.", "Un cambio porcentual positivo significa un aumento.") : p("A negative percent change means a decrease.", "Un cambio porcentual negativo significa una disminución.")},
          {text:p(en.cap + (up ? " increased by " : " decreased by ") + v + " " + s.unit + ".", es.cap + (up ? " aumentó " : " disminuyó ") + v + " " + s.unit + "."),
            why:p("Percent change compares the change to the original value. The change is " + v + "% of " + origEn + ", not " + v + " " + s.unit + ".",
              "El cambio porcentual compara el cambio con el valor original. El cambio es de " + v + "% " + es.rel + ", no " + v + " " + s.unit + ".")},
          {text:p("The new " + en.noun + " is " + v + "% of " + origEn + ".", es.newCap + " es " + v + "% " + es.ofOrig + "."),
            why:p("A change of " + sign + v + "% means the new " + en.noun + " is " + left + "% of " + origEn + ".", "Un cambio de " + sign + v + "% significa que " + es.newCap.toLowerCase() + " es " + left + "% " + es.ofOrig + ".")}
        ],
        explanation:p("The sign shows the direction: " + (up ? "positive means an increase" : "negative means a decrease") + ". The change is " + v + "% of " + origEn + ", so the new " + en.noun + " is " + left + "% of " + origEn + ".",
          "El signo muestra la dirección: " + (up ? "positivo significa un aumento" : "negativo significa una disminución") + ". El cambio es de " + v + "% " + es.rel + ", así que " + es.newCap.toLowerCase() + " es " + left + "% " + es.ofOrig + ".")};
    }
    // Is the percent change positive or negative?
    function directionQuestion(params) {
      var k = changeParts(params), c = k.c, q = p("the " + c.noun.en, c.noun.es);
      var sentence = function (positive, rose) {
        return fill(p((positive ? "Positive" : "Negative") + ": {q} " + (rose ? "increased" : "decreased") + ".", (positive ? "Positivo" : "Negativo") + ": {q} " + (rose ? "aumentó" : "disminuyó") + "."), {q:q});
      };
      var O = show(k.o) + " " + c.unit, N = show(k.nw) + " " + c.unit;
      return {type:"mc", answer:0, prompt:join([changeText(c, k.o, k.nw), p("Which is true about the percent change?", "¿Qué es cierto sobre el cambio porcentual?")]),
        choices:[
          {text:sentence(k.up, k.up), why:p("", "")},
          {text:sentence(!k.up, k.up), why:k.up ? p("An increase gives a positive percent change, because new minus original is positive.", "Un aumento da un cambio porcentual positivo, porque nuevo menos original es positivo.") :
            p("A decrease gives a negative percent change, because new minus original is negative.", "Una disminución da un cambio porcentual negativo, porque nuevo menos original es negativo.")},
          {text:sentence(!k.up, !k.up), why:fill(k.up ? p("The new value, {n}, is larger than the original, {o}, so {q} increased.", "El valor nuevo, {n}, es mayor que el original, {o}, así que {q} aumentó.") :
            p("The new value, {n}, is smaller than the original, {o}, so {q} decreased.", "El valor nuevo, {n}, es menor que el original, {o}, así que {q} disminuyó."), {n:N, o:O, q:q})},
          {text:p("It cannot be found without an accepted value.", "No se puede saber sin un valor aceptado."), why:p("Percent change needs only the original and new values. An accepted value is for percent error.", "El cambio porcentual solo necesita los valores original y nuevo. El valor aceptado es para el porcentaje de error.")}
        ],
        explanation:fill(p("New minus original is {n} − {o} = {d}, so the percent change is {sign} and {q} {verb}.", "Nuevo menos original es {n} − {o} = {d}, así que el cambio porcentual es {sign} y {q} {verb}."),
          {n:show(k.nw), o:show(k.o), d:show(k.d), q:q, sign:k.up ? p("positive", "positivo") : p("negative", "negativo"), verb:k.up ? p("increased", "aumentó") : p("decreased", "disminuyó")})};
    }

    var topics = [
      {id:"error", title:p("Percent error", "Porcentaje de error")},
      {id:"change", title:p("Percent change", "Cambio porcentual")},
      {id:"setup", title:p("Setups and signs", "Planteamientos y signos")}
    ];
    var generators = [
      {key:"ec", topic:"error", make:function (r) { return makeError(r, CONSTANTS); }, build:errorQuestion},
      {key:"es", topic:"error", make:function (r) { return makeError(r, STANDARDS); }, build:errorQuestion},
      {key:"ci", topic:"change", make:function (r) { return makeChange(r, true); }, build:changeQuestion},
      {key:"cd", topic:"change", make:function (r) { return makeChange(r, false); }, build:changeQuestion},
      {key:"sb", topic:"setup", make:makeSetup, build:setupQuestion},
      {key:"sm", topic:"setup", make:function (r) { return [pick(r, Object.keys(SAMPLES)), String(int(r, 3, 60)), r() < 0.5 ? "+" : "-"]; }, build:signQuestion},
      {key:"sd", topic:"setup", make:function (r) { return makeChange(r, r() < 0.5); }, build:directionQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/ratios-and-percents/percent-error-and-percent-change/",
      copy:{title:"Percent Error and Percent Change Practice", es:{
        "Percent Error and Percent Change Practice":"Práctica de error porcentual y cambio porcentual",
        "Quantitative Skills · Ratios and Percents":"Habilidades cuantitativas · Razones y porcentajes",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all three skills.":"Elige una habilidad y comienza. El repaso mixto incluye las tres habilidades.",
        "Type your answer. The % sign is optional. For a percent change, type a negative sign for a decrease; a plus sign for an increase is optional.":"Escribe tu respuesta. El signo % es opcional. En un cambio porcentual, escribe un signo negativo para una disminución; el signo más para un aumento es opcional.",
        "The line under each question says how many significant figures to keep. They are advice here, not scored.":"La línea debajo de cada pregunta indica cuántas cifras significativas debes conservar. Aquí son una sugerencia y no cuentan en la puntuación.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 4.1, +35 or -25.0.":"Escribe un número como 4.1, +35 o -25.0.",
        "Reference":"Consulta", "Percent error and percent change":"Porcentaje de error y cambio porcentual",
        "Percent error = |measured − accepted| ÷ accepted × 100.":"Porcentaje de error = |valor medido − valor aceptado| ÷ valor aceptado × 100.",
        "The accepted value is the true value scientists agree on. It always goes on the bottom.":"El valor aceptado es el valor verdadero en el que coinciden los científicos. Siempre va abajo.",
        "The absolute value bars make percent error positive. It is never negative.":"Las barras de valor absoluto hacen que el porcentaje de error sea positivo. Nunca es negativo.",
        "Percent change = (new − original) ÷ original × 100. The original value always goes on the bottom.":"Cambio porcentual = (nuevo − original) ÷ original × 100. El valor original siempre va abajo.",
        "Keep the sign: positive means an increase (+35%), negative means a decrease (−25.0%). Always subtract new minus original.":"Conserva el signo: positivo significa un aumento (+35%) y negativo significa una disminución (−25.0%). Siempre resta nuevo menos original.",
        "Practice for the Percent Error and Percent Change lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Error porcentual y cambio porcentual de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
