(function () {
  "use strict";
  // Exponents and Logarithms Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The lesson on zornscience.org: multiplying powers of ten adds the exponents, dividing subtracts them (top minus
  // bottom), a power of a power multiplies them, 10^0 = 1, and a negative exponent means a number between 0 and 1. In
  // scientific notation, multiply or divide the coefficients, then adjust. log asks "10 to what power?" (base 10 only).
  // pH = −log[H+] and [H+] = 10^(−pH), and the significant figures in [H+] equal the decimal places in the pH, so the
  // pH questions score precision. Logs are irrational: answers are stored as 17-digit decimal strings, and a value
  // within 1e-9 of a rounding tie is drawn again.
  var SLUG = "qs-exponents-and-logarithms-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures, dp = M.places;
    function pm(n) { return n < 0 ? "−" + Math.abs(n) : String(n); }
    function signed(n) { return n < 0 ? "(" + pm(n) + ")" : String(n); }
    function ten(n) { return "10<sup>" + pm(n) + "</sup>"; }
    function nonzero(r, lo, hi) { for (;;) { var n = int(r, lo, hi); if (n) return n; } }
    function places(v) { for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(v, -k), v) === 0) return k; return -1; }
    function calc(v) { var k = places(v); return k >= 0 ? M.fixed(v, -k) : M.write(v, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""); }
    function sfOf(text) { return M.read(text).sf; }
    // A coefficient with n significant figures, at least 1.1 (2 figures: "4.5", 3 figures: "6.02").
    function coef(r, n) { var d = String(int(r, Math.pow(10, n - 1) + 1, Math.pow(10, n) - 1)); return d[0] + "." + d.slice(1); }
    function frac(v) { return v.n + "/" + v.d; }
    // Traps, each kept only when its value differs from the answer and from the traps before it.
    function trapList(answer, P) {
      var list = [], seen = [M.exact(answer)];
      function same(a, b) { return M.cmp(P ? M.rounded(a, P).value : a, P ? M.rounded(b, P).value : b) === 0; }
      return {list:list, add:function (value, note) {
        value = M.exact(value);
        if (seen.some(function (s) { return same(s, value); })) return;
        seen.push(value); list.push({answer:frac(value), note:note});
      }};
    }

    // Exponent rules: the answer is the exponent of the single power of ten.
    var ONLY = p("Enter only the exponent, not the whole power of ten.", "Escribe solo el exponente, no toda la potencia de diez.");
    var EXP_ONLY = p("Enter only the exponent, like 7 or −3.", "Escribe solo el exponente, como 7 o −3.");
    function exponentQuestion(r, prompt, explanation, traps) {
      var t = trapList(String(r));
      t.add("1e" + r, ONLY);
      traps.forEach(function (x) { t.add(String(x[0]), x[1]); });
      return {type:"numeric", answer:String(r), precision:{exact:true}, unit:null, accept:[], check:{}, display:String(r),
        answerText:p(pm(r), pm(r)), traps:t.list, instruction:EXP_ONLY, prompt:prompt, explanation:explanation};
    }
    function multiplyRule(params) {
      var a = Number(params[0]), b = Number(params[1]), r = a + b, v = {a:pm(a), b:signed(b), r:pm(r), A:ten(a), B:ten(b), R:ten(r)}, traps = [];
      traps.push([a * b, p("When you multiply powers of ten, add the exponents; do not multiply them.", "Al multiplicar potencias de diez, suma los exponentes; no los multipliques.")]);
      if (a < 0 || b < 0) traps.push([Math.abs(a) + Math.abs(b), p("Watch the sign: adding a negative exponent makes the result smaller.", "Fíjate en el signo: sumar un exponente negativo hace más pequeño el resultado.")]);
      return exponentQuestion(r, fill(p("Write {A} × {B} as one power of ten. What is the exponent?", "Escribe {A} × {B} como una sola potencia de diez. ¿Cuál es el exponente?"), v),
        fill(p("Multiplying powers of ten adds the exponents: {a} + {b} = {r}. So {A} × {B} = {R}.", "Al multiplicar potencias de diez, se suman los exponentes: {a} + {b} = {r}. Así, {A} × {B} = {R}."), v), traps);
    }
    function divideRule(params) {
      var a = Number(params[0]), b = Number(params[1]), r = a - b, v = {a:pm(a), b:signed(b), r:pm(r), A:ten(a), B:ten(b), R:ten(r)}, traps = [];
      traps.push([b - a, fill(p("Subtract top minus bottom: {a} − {b}.", "Resta el de arriba menos el de abajo: {a} − {b}."), v)]);
      traps.push([a + b, p("Dividing powers of ten subtracts the exponents; it does not add them.", "Al dividir potencias de diez, se restan los exponentes; no se suman.")]);
      if (Math.abs(b) > 1 && a % b === 0) traps.push([a / b, p("Dividing powers of ten subtracts the exponents; it does not divide them.", "Al dividir potencias de diez, se restan los exponentes; no se dividen.")]);
      var parts = [fill(p("Dividing subtracts the exponents, top minus bottom: {a} − {b} = {r}. So {A} ÷ {B} = {R}.", "Al dividir, se restan los exponentes, el de arriba menos el de abajo: {a} − {b} = {r}. Así, {A} ÷ {B} = {R}."), v)];
      if (r === 0) parts.push(p("A power of ten with a zero exponent equals 1: 10<sup>0</sup> = 1.", "Una potencia de diez con exponente cero vale 1: 10<sup>0</sup> = 1."));
      return exponentQuestion(r, fill(p("Write {A} ÷ {B} as one power of ten. What is the exponent?", "Escribe {A} ÷ {B} como una sola potencia de diez. ¿Cuál es el exponente?"), v), join(parts), traps);
    }
    var POWER = {
      plain:p("Write ({A})<sup>{b}</sup> as one power of ten. What is the exponent?", "Escribe ({A})<sup>{b}</sup> como una sola potencia de diez. ¿Cuál es el exponente?"),
      area:p("A square is {A} m on each side, so its area is ({A} m)<sup>2</sup>. Write the area as a power of ten in m<sup>2</sup>. What is the exponent?",
        "Un cuadrado mide {A} m por lado, así que su área es ({A} m)<sup>2</sup>. Escribe el área como potencia de diez en m<sup>2</sup>. ¿Cuál es el exponente?"),
      volume:p("A cube is {A} m on each side, so its volume is ({A} m)<sup>3</sup>. Write the volume as a power of ten in m<sup>3</sup>. What is the exponent?",
        "Un cubo mide {A} m por lado, así que su volumen es ({A} m)<sup>3</sup>. Escribe el volumen como potencia de diez en m<sup>3</sup>. ¿Cuál es el exponente?")
    };
    function powerRule(params) {
      var ctx = params[0], a = Number(params[1]), b = Number(params[2]), r = a * b, traps = [];
      var v = {a:signed(a), b:String(b), r:pm(r), A:ten(a), R:ten(r), m:ctx === "plain" ? "" : " m", mb:ctx === "plain" ? "" : " m<sup>" + b + "</sup>"};
      traps.push([a + b, p("A power of a power multiplies the exponents; do not add them.", "En una potencia de una potencia, se multiplican los exponentes; no se suman.")]);
      var raised = Math.pow(a, b);
      if (Math.abs(raised) <= 1000) traps.push([raised, p("Multiply the exponents; do not raise one to the power of the other.", "Multiplica los exponentes; no eleves uno a la potencia del otro.")]);
      return exponentQuestion(r, fill(POWER[ctx], v),
        fill(p("A power of a power multiplies the exponents: {a} × {b} = {r}. So ({A}{m})<sup>{b}</sup> = {R}{mb}.", "En una potencia de una potencia, se multiplican los exponentes: {a} × {b} = {r}. Así, ({A}{m})<sup>{b}</sup> = {R}{mb}."), v), traps);
    }

    // Scientific notation: multiply or divide the coefficients, add or subtract the exponents, then adjust.
    var UNITS = {m:["m", "meters", "meter", "metres", "metre", "metros", "metro"], s:["s", "sec", "seconds", "second", "segundos", "segundo"]};
    var LIGHT = "3.0 × " + ten(8) + " m/s";
    function sciParts(params, divide) {
      var a = params[1], m = Number(params[2]), b = params[3], n = Number(params[4]), q = divide ? M.div(a, b) : M.mul(a, b), s = divide ? m - n : m + n;
      var A = M.mul(q, M.scale(s)), P = {sf:Math.min(sfOf(a), sfOf(b))};
      return {ctx:params[0], a:a, m:m, b:b, n:n, q:q, s:s, A:A, P:P, ans:M.write(A, P, "sci")};
    }
    function sciQuestion(params, divide) {
      var x = sciParts(params, divide), unit = x.ctx === "plain" ? null : divide ? "s" : "m", ans = show(x.ans) + (unit ? " " + unit : "");
      var v = {a:x.a, b:x.b, m:pm(x.m), n:signed(x.n), s:pm(x.s), q:show(calc(x.q)), M:ten(x.m), N:ten(x.n), S:ten(x.s), figs:figs(x.P.sf), ans:ans};
      var t = trapList(x.A, x.P), parts = [];
      if (divide) {
        t.add(M.mul(x.q, M.scale(x.m + x.n)), p("Dividing subtracts the exponents: top minus bottom.", "Al dividir, se restan los exponentes: el de arriba menos el de abajo."));
        t.add(M.mul(x.q, M.scale(x.n - x.m)), fill(p("Subtract top minus bottom: {m} − {n}.", "Resta el de arriba menos el de abajo: {m} − {n}."), v));
        parts.push(fill(p("Divide the coefficients: {a} ÷ {b} = {q}. Subtract the exponents, top minus bottom: {m} − {n} = {s}.",
          "Divide los coeficientes: {a} ÷ {b} = {q}. Resta los exponentes, el de arriba menos el de abajo: {m} − {n} = {s}."), v));
        if (M.cmp(x.q, 1) < 0) {
          t.add(M.mul(x.A, 100), p("When the coefficient is less than 1, move the decimal point one place right and subtract 1 from the exponent.",
            "Cuando el coeficiente es menor que 1, mueve el punto decimal un lugar a la derecha y resta 1 al exponente."));
          parts.push(fill(p("Adjust: {q} × {S} = {q2} × {S2}.", "Ajusta: {q} × {S} = {q2} × {S2}."), {q:v.q, S:v.S, q2:show(calc(M.mul(x.q, 10))), S2:ten(x.s - 1)}));
        }
      } else {
        t.add(M.mul(x.q, M.scale(x.m * x.n)), p("Multiply the coefficients, but add the exponents.", "Multiplica los coeficientes, pero suma los exponentes."));
        t.add(M.mul(M.add(x.a, x.b), M.scale(x.s)), p("Multiply the coefficients; do not add them.", "Multiplica los coeficientes; no los sumes."));
        parts.push(fill(p("Multiply the coefficients: {a} × {b} = {q}. Add the exponents: {m} + {n} = {s}.",
          "Multiplica los coeficientes: {a} × {b} = {q}. Suma los exponentes: {m} + {n} = {s}."), v));
        if (M.cmp(x.q, 10) >= 0) {
          t.add(M.div(x.A, 100), p("When the coefficient is 10 or more, move the decimal point one place left and add 1 to the exponent.",
            "Cuando el coeficiente es 10 o más, mueve el punto decimal un lugar a la izquierda y suma 1 al exponente."));
          parts.push(fill(p("Adjust: {q} × {S} = {q2} × {S2}.", "Ajusta: {q} × {S} = {q2} × {S2}."), {q:v.q, S:v.S, q2:show(calc(M.div(x.q, 10))), S2:ten(x.s + 1)}));
        }
      }
      parts.push(fill(p("With {figs}, the answer is {ans}.", "Con {figs}, la respuesta es {ans}."), v));
      var prompt = x.ctx === "plain" ? fill(divide ? p("Divide: ({a} × {M}) ÷ ({b} × {N}).", "Divide: ({a} × {M}) ÷ ({b} × {N}).") : p("Multiply: ({a} × {M}) × ({b} × {N}).", "Multiplica: ({a} × {M}) × ({b} × {N})."), v) :
        divide ? fill(p("Light travels at {c}. How long does it take to travel {a} × {M} m? (time = distance ÷ speed)", "La luz viaja a {c}. ¿Cuánto tarda en recorrer {a} × {M} m? (tiempo = distancia ÷ rapidez)"), {c:LIGHT, a:x.a, M:v.M}) :
          fill(p("Light travels at {c}. How far does it travel in {b} × {N} s? (distance = speed × time)", "La luz viaja a {c}. ¿Qué distancia recorre en {b} × {N} s? (distancia = rapidez × tiempo)"), {c:LIGHT, b:x.b, N:ten(x.n)});
      return {type:"numeric", answer:frac(x.A), precision:x.P, unit:unit, accept:unit ? UNITS[unit] : [], check:{sf:"advice", form:"sci", unit:"optional"},
        display:x.ans + (unit ? " " + unit : ""), answerText:p(ans, ans), traps:t.list,
        instruction:fill(p("Write the answer in scientific notation. Round to {n}.", "Escribe la respuesta en notación científica. Redondea a {n}."), {n:figs(x.P.sf)}),
        prompt:prompt, explanation:join(parts)};
    }
    // The answer's power of ten after adjusting is never 0, so it always needs scientific notation.
    function makeSci(r, divide) {
      for (;;) {
        var light = r() < 0.3, params;
        if (light) params = divide ? ["light", coef(r, 2), String(int(r, 3, 13)), "3.0", "8"] : ["light", "3.0", "8", coef(r, 2), String(nonzero(r, -6, 3))];
        else params = ["plain", coef(r, pick(r, [2, 2, 3])), String(nonzero(r, -9, 12)), coef(r, pick(r, [2, 2, 3])), String(nonzero(r, -9, 12))];
        var x = sciParts(params, divide), e = M.magnitude(M.rounded(x.A, x.P).value);
        if (!e || Math.abs(e) > 20) continue;
        // Most products need the coefficient adjusted; about half the quotients do.
        if (!light && (divide ? M.cmp(x.q, 1) >= 0 : M.cmp(x.q, 10) < 0) && r() < (divide ? 0.5 : 0.6)) continue;
        return params;
      }
    }

    // What a power of ten means: which number equals c × 10^n, for n from 0 down to −6.
    function placesWord(k) { return k === 1 ? p("1 place", "1 lugar") : p(k + " places", k + " lugares"); }
    function standardQuestion(params) {
      var c = params[0], n = Number(params[1]), k = Math.abs(n), key = M.fixed(M.mul(c, M.scale(n)), n - 1);
      var v = {c:c, n:pm(n), k:placesWord(k), k1:placesWord(k + 1), m:String(k), key:show(key), T:ten(n)}, choices;
      if (n === 0) {
        var same = p("10<sup>0</sup> = 1, so the number does not change.", "10<sup>0</sup> = 1, así que el número no cambia.");
        choices = [[key, null], ["0", p("10<sup>0</sup> = 1, not 0, so the number does not change.", "10<sup>0</sup> = 1, no 0, así que el número no cambia.")],
          [M.fixed(M.mul(c, 10), 0), join([fill(p("That is {c} × 10<sup>1</sup>.", "Ese número es {c} × 10<sup>1</sup>."), v), same])],
          [M.fixed(M.div(c, 10), -2), join([fill(p("That is {c} × 10<sup>−1</sup>.", "Ese número es {c} × 10<sup>−1</sup>."), v), same])]];
      } else {
        var big = M.fixed(M.mul(c, M.scale(k)), k - 1);
        choices = [[key, null], ["-" + big, p("A negative exponent gives a number between 0 and 1, not a negative number.", "Un exponente negativo da un número entre 0 y 1, no un número negativo.")],
          [big, fill(p("That is {c} × 10<sup>{m}</sup>. A negative exponent moves the decimal point to the left.", "Ese número es {c} × 10<sup>{m}</sup>. Un exponente negativo mueve el punto decimal a la izquierda."), v)],
          [M.fixed(M.mul(c, M.scale(n - 1)), n - 2), fill(p("That moves the decimal point {k1} to the left. For {T}, move it {k}.", "Eso mueve el punto decimal {k1} a la izquierda. Para {T}, muévelo {k}."), v)]];
      }
      return {type:"mc", answer:0, prompt:fill(p("Which number equals {c} × {T}?", "¿Qué número es igual a {c} × {T}?"), v),
        choices:choices.map(function (x) { return {text:p(show(x[0]), show(x[0])), why:x[1] || p("", "")}; }),
        explanation:fill(n === 0 ? p("10<sup>0</sup> = 1, so {c} × 10<sup>0</sup> = {c} × 1 = {c}.", "10<sup>0</sup> = 1, así que {c} × 10<sup>0</sup> = {c} × 1 = {c}.") :
          p("A negative exponent means a number between 0 and 1: move the decimal point {k} to the left. {c} × {T} = {key}.",
            "Un exponente negativo significa un número entre 0 y 1: mueve el punto decimal {k} a la izquierda. {c} × {T} = {key}."), v)};
    }

    // Logarithms (base 10 only): log asks "10 to what power?"
    var NEG_LOG = p("Numbers below 1 have negative logs.", "Los números menores que 1 tienen logaritmos negativos.");
    function standard(n) { return show(M.fixed(M.scale(n), Math.min(n, 0))); }
    function logQuestion(params) {
      var form = params[0], n = Number(params[1]), x = form === "pow" ? ten(n) : standard(n), v = {x:x, n:pm(n), T:ten(n)};
      var t = trapList(String(n)), parts = [];
      if (n < 0) t.add(String(-n), NEG_LOG);
      else t.add(String(-n), p("Numbers greater than 1 have positive logs.", "Los números mayores que 1 tienen logaritmos positivos."));
      if (form === "std") t.add(String(n + 1), fill(n > 0 ? p("Count the zeros, not the digits: {x} = {T}.", "Cuenta los ceros, no los dígitos: {x} = {T}.") :
        p("Count the places the decimal point moves, not the zeros: {x} = {T}.", "Cuenta los lugares que se mueve el punto decimal, no los ceros: {x} = {T}."), v));
      parts.push(fill(form === "pow" ? p("The log of a power of ten is its exponent: log({x}) = {n}.", "El log de una potencia de diez es su exponente: log({x}) = {n}.") :
        p("log asks: 10 to what power gives {x}? {x} = {T}, so log({x}) = {n}.", "El log pregunta: ¿10 elevado a qué potencia da {x}? {x} = {T}, así que log({x}) = {n}."), v));
      if (n < 0) parts.push(NEG_LOG);
      return {type:"numeric", answer:String(n), precision:{exact:true}, unit:null, accept:[], check:{}, display:String(n), answerText:p(pm(n), pm(n)),
        traps:t.list, instruction:p("Enter a whole number.", "Escribe un número entero."),
        prompt:fill(p("What is log({x})?", "¿Cuánto es log({x})?"), v), explanation:join(parts)};
    }
    function bracketQuestion(params) {
      var c = params[0], e = Number(params[1]), value = M.mul(c, M.scale(e));
      var x = Math.abs(e) <= 5 ? show(M.fixed(value, e - 1)) : show(c + "e" + e), v = {x:x, e:pm(e), e1:pm(e + 1)};
      function between(lo, hi) { return fill(p("Between {lo} and {hi}", "Entre {lo} y {hi}"), {lo:pm(lo), hi:pm(hi)}); }
      var choices = [[between(e, e + 1), null],
        [between(e + 1, e + 2), fill(p("{x} is less than 10<sup>{e1}</sup>, so its log is less than {e1}.", "{x} es menor que 10<sup>{e1}</sup>, así que su log es menor que {e1}."), v)],
        [between(e - 1, e), fill(p("{x} is more than 10<sup>{e}</sup>, so its log is more than {e}.", "{x} es mayor que 10<sup>{e}</sup>, así que su log es mayor que {e}."), v)],
        [between(-e - 1, -e), e < 0 ? NEG_LOG : fill(p("Only numbers below 1 have negative logs, and {x} is more than 1.", "Solo los números menores que 1 tienen logaritmos negativos, y {x} es mayor que 1."), v)]];
      var parts = [fill(p("{x} is between 10<sup>{e}</sup> and 10<sup>{e1}</sup>, so log({x}) is between {e} and {e1}.", "{x} está entre 10<sup>{e}</sup> y 10<sup>{e1}</sup>, así que log({x}) está entre {e} y {e1}."), v)];
      if (e < 0) parts.push(NEG_LOG);
      return {type:"mc", answer:0, prompt:fill(p("log({x}) is between which two whole numbers?", "¿Entre qué dos números enteros está log({x})?"), v),
        choices:choices.map(function (x) { return {text:x[0], why:x[1] || p("", "")}; }), explanation:join(parts)};
    }
    function undoQuestion(params) {
      var n = Number(params[0]), v = {n:pm(n), T:ten(n), std:Math.abs(n) <= 6 ? " = " + standard(n) : ""};
      var t = trapList("1e" + n, {sf:1}), parts = [fill(p("Undo the log: if log(x) = {n}, then x = {T}{std}.", "Deshaz el log: si log(x) = {n}, entonces x = {T}{std}."), v)];
      if (n < 0) {
        t.add("-1e" + (-n), p("A negative log means a number between 0 and 1, not a negative number.", "Un log negativo significa un número entre 0 y 1, no un número negativo."));
        parts.push(p("A negative log means a number between 0 and 1.", "Un log negativo significa un número entre 0 y 1."));
      }
      t.add("1e" + (-n), fill(p("Keep the sign of the exponent: x = {T}.", "Conserva el signo del exponente: x = {T}."), v));
      t.add(String(n), fill(p("x is the number, not its log: x = {T}.", "x es el número, no su log: x = {T}."), v));
      return {type:"numeric", answer:"1e" + n, precision:{sf:1}, unit:null, accept:[], check:{sf:"advice"}, display:"10^" + n,
        answerText:p(ten(n), ten(n)), traps:t.list,
        instruction:p("Type a power of ten with ^ after the 10, or type the number.", "Escribe una potencia de diez con ^ después del 10, o escribe el número."),
        prompt:fill(p("If log(x) = {n}, what is x?", "Si log(x) = {n}, ¿cuánto vale x?"), v), explanation:join(parts)};
    }

    // pH = −log[H+] and [H+] = 10^(−pH). Significant figures in [H+] equal decimal places in the pH, and that is
    // scored here. The rule is named under the question, but not the count.
    var RULE = p("Use the lesson's rule: significant figures in [H⁺] = decimal places in the pH.", "Usa la regla de la lección: cifras significativas de [H⁺] = lugares decimales del pH.");
    var M_UNITS = ["M", "mol/L", "mol/l", "mol L^-1", "molar"];
    function phValue(c, e) { return e - Math.log10(Number(c)); }
    function nearTie(x, k) { var s = x * Math.pow(10, k); return Math.abs(s - Math.floor(s) - 0.5) < 1e-9 * Math.pow(10, k); }
    function phQuestion(params) {
      var c = params[0], e = Number(params[1]), n = sfOf(c), P = {decimals:n}, ph = phValue(c, e), answer = ph.toPrecision(17);
      var ans = M.write(answer, P, "plain"), h = c + " × " + ten(-e);
      var v = {h:h, raw:calc(M.rounded(answer, {sf:10}).value), figs:figs(n), dp:dp(n), ans:ans, E:ten(-e), E1:ten(-(e - 1)), lo:String(e - 1), e:String(e)};
      var t = trapList(answer, P);
      t.add(String(e), p("The pH is not just the exponent. Take −log of the whole concentration, coefficient included.", "El pH no es solo el exponente. Calcula −log de toda la concentración, con el coeficiente."));
      t.add((ph * Math.LN10).toPrecision(17), p("Use the LOG key (base 10), not LN.", "Usa la tecla LOG (base 10), no LN."));
      return {type:"numeric", answer:answer, precision:P, unit:null, accept:["pH"], check:{sf:"strict"}, display:ans, answerText:p(ans, ans), traps:t.list,
        instruction:RULE, prompt:fill(p("A solution has [H<sup>+</sup>] = {h} M. What is its pH?", "Una solución tiene [H<sup>+</sup>] = {h} M. ¿Cuál es su pH?"), v),
        explanation:fill(p("pH = −log[H<sup>+</sup>] = −log({h}) = {raw}. [H<sup>+</sup>] has {figs}, so the pH keeps {dp}: {ans}. Check: [H<sup>+</sup>] is between {E} and {E1}, so the pH is between {lo} and {e}.",
          "pH = −log[H<sup>+</sup>] = −log({h}) = {raw}. [H<sup>+</sup>] tiene {figs}, así que el pH conserva {dp}: {ans}. Comprobación: [H<sup>+</sup>] está entre {E} y {E1}, así que el pH está entre {lo} y {e}."), v)};
    }
    function makePh(r) {
      for (;;) {
        var c = coef(r, pick(r, [2, 2, 2, 3])), e = int(r, 2, 12);
        if (!nearTie(phValue(c, e), sfOf(c))) return [c, String(e)];
      }
    }
    // [H+] from a pH with n decimal places: coefficient 10^(e − pH) times 10^(−e), with e the pH rounded up.
    function hParts(pH) {
      var x = Number(pH), e = Math.ceil(x), n = pH.split(".")[1].length, k = Math.pow(10, e - x);
      return {x:x, e:e, n:n, k:k, answer:k.toPrecision(17) + "e-" + e};
    }
    function hQuestion(params) {
      var pH = params[0], h = hParts(pH), P = {sf:h.n}, sci = M.write(h.answer, P, "sci"), ans = show(sci) + " M";
      var v = {pH:pH, raw:show(M.write(h.answer, {sf:10}, "sci")), figs:figs(h.n), dp:dp(h.n), ans:ans};
      var t = trapList(h.answer, P);
      t.add(Math.pow(10, h.x).toPrecision(17), p("Use a negative exponent: [H<sup>+</sup>] = 10<sup>−pH</sup>.", "Usa un exponente negativo: [H<sup>+</sup>] = 10<sup>−pH</sup>."));
      t.add((-Math.log10(h.x)).toPrecision(17), p("Undo the log with 10<sup>x</sup> (2nd, LOG), not with LOG again.", "Deshaz el log con 10<sup>x</sup> (segunda función: 2nd, LOG), no con LOG otra vez."));
      return {type:"numeric", answer:h.answer, precision:P, unit:"M", accept:M_UNITS, check:{sf:"strict", unit:"optional"},
        display:sci + " M", answerText:p(ans, ans), traps:t.list, instruction:RULE,
        prompt:fill(p("A solution has a pH of {pH}. What is its hydrogen ion concentration, [H<sup>+</sup>], in M?", "Una solución tiene un pH de {pH}. ¿Cuál es su concentración de iones de hidrógeno, [H<sup>+</sup>], en M?"), v),
        explanation:fill(p("Undo the log: [H<sup>+</sup>] = 10<sup>−{pH}</sup> (2nd, LOG) = {raw} M. The pH has {dp}, so [H<sup>+</sup>] keeps {figs}: {ans}.",
          "Deshaz el log: [H<sup>+</sup>] = 10<sup>−{pH}</sup> (segunda función: 2nd, LOG) = {raw} M. El pH tiene {dp}, así que [H<sup>+</sup>] conserva {figs}: {ans}."), v)};
    }
    function makeH(r) {
      for (;;) {
        var n = pick(r, [1, 2, 2, 2, 3]), digits = "";
        for (var i = 0; i < n; i++) digits += int(r, 0, 9);
        if (!/[1-9]/.test(digits)) continue;
        var pH = int(r, 1, 12) + "." + digits, h = hParts(pH), s = h.k * Math.pow(10, n - 1);
        // No rounding ties, and no coefficient that rounds up to 10.
        if (nearTie(h.k, n - 1) || Math.round(s) >= Math.pow(10, n)) continue;
        return [pH];
      }
    }

    var topics = [
      {id:"rules", title:p("Exponent rules", "Reglas de los exponentes")},
      {id:"sci", title:p("Scientific notation", "Notación científica")},
      {id:"logs", title:p("Logarithms", "Logaritmos")},
      {id:"ph", title:p("pH", "pH")}
    ];
    var generators = [
      {key:"rm", topic:"rules", make:function (r) {
        for (;;) { var a = nonzero(r, -9, 12), b = r() < 0.5 ? nonzero(r, 1, 12) : nonzero(r, -9, 12); if (a + b) return [String(a), String(b)]; }
      }, build:multiplyRule},
      {key:"rd", topic:"rules", make:function (r) {
        var a = nonzero(r, -8, 12);
        return [String(a), String(r() < 0.125 ? a : nonzero(r, -8, 12))];
      }, build:divideRule},
      {key:"rp", topic:"rules", make:function (r) {
        var ctx = pick(r, ["plain", "plain", "plain", "area", "volume"]);
        if (ctx === "plain") return [ctx, String(nonzero(r, -6, 6)), String(int(r, 2, 4))];
        return [ctx, String(pick(r, [-4, -3, -2, -1, 1, 2, 3])), ctx === "area" ? "2" : "3"];
      }, build:powerRule},
      {key:"sm", topic:"sci", make:function (r) { return makeSci(r, false); }, build:function (params) { return sciQuestion(params, false); }},
      {key:"sd", topic:"sci", make:function (r) { return makeSci(r, true); }, build:function (params) { return sciQuestion(params, true); }},
      {key:"sz", topic:"sci", make:function (r) { return [coef(r, 2), String(r() < 0.15 ? 0 : -int(r, 1, 6))]; }, build:standardQuestion},
      {key:"lp", topic:"logs", make:function (r) { return r() < 0.4 ? ["pow", String(nonzero(r, -9, 12))] : ["std", String(nonzero(r, -6, 6))]; }, build:logQuestion},
      {key:"lb", topic:"logs", make:function (r) { return [coef(r, 2), String(r() < 0.5 ? int(r, 1, 6) : -int(r, 2, 6))]; }, build:bracketQuestion},
      {key:"lu", topic:"logs", make:function (r) { return [String(nonzero(r, -8, 8))]; }, build:undoQuestion},
      {key:"ph", topic:"ph", make:makePh, build:phQuestion},
      {key:"hc", topic:"ph", make:makeH, build:hQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/advanced-tools/exponents-and-logarithms/",
      copy:{title:"Exponents and Logarithms Practice", es:{
        "Exponents and Logarithms Practice":"Práctica de exponentes y logaritmos",
        "Quantitative Skills · Advanced Tools":"Habilidades cuantitativas · Herramientas avanzadas",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator with LOG and 10ˣ keys. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y una calculadora con las teclas LOG y 10ˣ. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type your answer. Write a power of ten as 10^-3 and scientific notation as 4.2 x 10^8 or 4.2e8. A unit after the number is optional.":"Escribe tu respuesta. Escribe una potencia de diez como 10^-3 y la notación científica como 4.2 x 10^8 o 4.2e8. La unidad después del número es opcional.",
        "In the pH questions, precision counts: use the rule from the lesson to decide how many digits to keep.":"En las preguntas de pH, la precisión cuenta: usa la regla de la lección para decidir cuántos dígitos conservar.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 4.20, 10^-3 or 2.0 x 10^-3. You may add the unit after it.":"Escribe un número como 4.20, 10^-3 o 2.0 x 10^-3. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Exponent and log rules":"Reglas de exponentes y logaritmos",
        "Multiplying powers of ten adds the exponents:":"Al multiplicar potencias de diez, se suman los exponentes:",
        "Dividing subtracts them, top minus bottom:":"Al dividir, se restan, el de arriba menos el de abajo:",
        "A power of a power multiplies them:":"En una potencia de una potencia, se multiplican:",
        "A negative exponent means a number between 0 and 1, not a negative number.":"Un exponente negativo significa un número entre 0 y 1, no un número negativo.",
        "Scientific notation: multiply or divide the coefficients, add or subtract the exponents, then adjust so the coefficient is at least 1 and less than 10.":"Notación científica: multiplica o divide los coeficientes, suma o resta los exponentes y luego ajusta para que el coeficiente sea al menos 1 y menor que 10.",
        "log asks: 10 to what power? The log of a power of ten is its exponent, and numbers below 1 have negative logs:":"El log pregunta: ¿10 elevado a qué potencia? El log de una potencia de diez es su exponente, y los números menores que 1 tienen logaritmos negativos:",
        "Undo the log with 10ˣ (2nd, LOG):":"Deshaz el log con 10ˣ (segunda función: 2nd, LOG):",
        "Significant figures in [H⁺] = decimal places in the pH.":"Cifras significativas de [H⁺] = lugares decimales del pH.",
        "Practice for the Exponents and Logarithms lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Exponentes y logaritmos de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
