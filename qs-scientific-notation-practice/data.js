(function () {
  "use strict";
  // Scientific Notation Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The rules follow the lesson on zornscience.org: the first number (coefficient) is at least 1 and less than 10, the
  // base is 10, and the exponent counts the places the decimal point moved: positive for numbers bigger than 1,
  // negative for numbers less than 1. Going back, a positive exponent moves the point right and a negative one moves
  // it left, filling empty places with zeros. The coefficient keeps the number's own digits (300,000,000 is 3 × 10⁸).
  var SLUG = "qs-scientific-notation-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    var int = M.int, pick = M.pick, show = M.pretty;
    var UNITS = {"m":["m", "meters", "meter", "metros", "metro"], "g":["g", "grams", "gram", "gramos", "gramo"], "s":["s", "seconds", "second", "segundos", "segundo"],
      "L":["L", "l", "liters", "liter", "litros", "litro"], "m/s":["m/s"], "km":["km", "kilometers", "kilómetros"], "kg":["kg", "kilograms", "kilogramos"], "":[]};
    var UNIT_KEYS = Object.keys(UNITS);
    function withUnit(text, unit) { return unit ? text + " " + unit : text; }
    function places(n) { return n === 1 ? p("1 place", "1 lugar") : p(n + " places", n + " lugares"); }

    // Significant digits: the first is 1 to 9; the last may be forced nonzero so no zero at the end has to count.
    function digits(random, n, lastNonzero) {
      var s = String(int(random, 1, 9));
      for (var i = 1; i < n; i++) s += i === n - 1 && lastNonzero ? int(random, 1, 9) : random() < 0.25 ? "0" : int(random, 0, 9);
      return s;
    }
    // The number (a decimal string) whose scientific notation is digits[0].digits[1..] × 10^e.
    function standard(d, e) { return M.fixed(M.mul(d[0] + (d.length > 1 ? "." + d.slice(1) : ""), M.scale(e)), Math.min(0, e - d.length + 1)); }
    function sciText(d, e) { return (d.length > 1 ? d[0] + "." + d.slice(1) : d) + "e" + e; }
    function sfOf(text) { return M.read(text).sf; }

    // To scientific notation. The answer keeps the original's significant figures.
    function toSci(params) {
      var text = params[0], unit = params[1], n = sfOf(text), e = M.magnitude(text), P = {sf:n};
      var answer = M.write(text, P, "sci"), coef = answer.split("e")[0], big = e > 0, k = Math.abs(e);
      var traps = [{answer:M.fixed(M.mul(coef, M.scale(-e)), Math.min(0, -e - n + 1)),
        note:big ? p("A number bigger than 1 has a positive exponent.", "Un número mayor que 1 tiene exponente positivo.") : p("A number less than 1 has a negative exponent.", "Un número menor que 1 tiene exponente negativo.")}];
      [e - 1, e + 1].forEach(function (wrong) { traps.push({answer:M.fixed(M.mul(coef, M.scale(wrong)), Math.min(0, wrong - n + 1)), note:p("The exponent counts the places the decimal point moved.", "El exponente cuenta los lugares que se movió el punto decimal.")}); });
      return {type:"numeric", answer:text, precision:P, unit:unit || null, accept:UNITS[unit], check:{form:"sci", unit:"optional"},
        display:withUnit(coef + " x 10^" + e, unit), answerText:p(withUnit(show(answer), unit), withUnit(show(answer), unit)), traps:traps, instruction:null,
        prompt:fill(p("Write {x} in scientific notation.", "Escribe {x} en notación científica."), {x:withUnit(show(text), unit)}),
        explanation:fill(big ? p("Move the decimal point {k} to the left, so one nonzero digit is in front: {c}. The number is bigger than 1, so the exponent is positive: {a}.",
          "Mueve el punto decimal {k} a la izquierda, para que quede un dígito distinto de cero adelante: {c}. El número es mayor que 1, así que el exponente es positivo: {a}.") :
          p("Move the decimal point {k} to the right, to just after the first nonzero digit: {c}. The number is less than 1, so the exponent is negative: {a}.",
          "Mueve el punto decimal {k} a la derecha, hasta justo después del primer dígito distinto de cero: {c}. El número es menor que 1, así que el exponente es negativo: {a}."),
          {k:places(k), c:coef, a:withUnit(show(answer), unit)})};
    }

    // To standard notation. A positive exponent moves the point right, a negative one moves it left.
    function toStandard(params) {
      var d = params[0], e = Number(params[1]), unit = params[2], n = d.length, P = {sf:n}, sci = sciText(d, e);
      var answer = standard(d, e), k = Math.abs(e), big = e > 0;
      var traps = [{answer:standard(d, -e), note:big ? p("A positive exponent makes the number bigger: move the decimal point to the right.", "Un exponente positivo hace el número más grande: mueve el punto decimal a la derecha.") :
        p("A negative exponent makes the number less than 1: move the decimal point to the left.", "Un exponente negativo hace el número menor que 1: mueve el punto decimal a la izquierda.")}];
      [e - 1, e + 1].forEach(function (wrong) { traps.push({answer:standard(d, wrong), note:fill(p("The exponent is {e}, so move the decimal point exactly {k}.", "El exponente es {e}, así que mueve el punto decimal exactamente {k}."), {e:show(String(e)), k:places(k)})}); });
      return {type:"numeric", answer:answer, precision:P, unit:unit || null, accept:UNITS[unit], check:{form:"plain", unit:"optional"},
        display:withUnit(answer, unit), answerText:p(withUnit(show(answer), unit), withUnit(show(answer), unit)), traps:traps, instruction:null,
        prompt:fill(p("Write {x} in standard notation.", "Escribe {x} en notación estándar."), {x:withUnit(show(sci), unit)}),
        // The lesson's step "fill the empty places with zeros" is named only when zeros are added.
        explanation:fill(e > n - 1 || e <= -2 ? (big ? p("The exponent is {e}, so move the decimal point {k} to the right and fill the empty places with zeros: {a}.",
          "El exponente es {e}, así que mueve el punto decimal {k} a la derecha y llena los lugares vacíos con ceros: {a}.") :
          p("The exponent is {e}, so move the decimal point {k} to the left and fill the empty places with zeros: {a}.",
          "El exponente es {e}, así que mueve el punto decimal {k} a la izquierda y llena los lugares vacíos con ceros: {a}.")) :
          (big ? p("The exponent is {e}, so move the decimal point {k} to the right: {a}.", "El exponente es {e}, así que mueve el punto decimal {k} a la derecha: {a}.") :
          p("The exponent is {e}, so move the decimal point {k} to the left: {a}.", "El exponente es {e}, así que mueve el punto decimal {k} a la izquierda: {a}.")),
          {e:show(String(e)), k:places(k), a:withUnit(show(answer), unit)})};
    }

    // Reading scientific notation (multiple choice).
    function properForm(params) {
      var d = params[0], e = Number(params[1]), value = standard(d, e);
      function shown(coefDigits, point, exp) { return show(coefDigits.slice(0, point) + (point < coefDigits.length ? "." + coefDigits.slice(point) : "") + "e" + exp); }
      var right = shown(d, 1, e), ten = shown(d, 2, e - 1), tenth = "0." + d + " × 10<sup>" + (e + 1 < 0 ? "−" : "") + Math.abs(e + 1) + "</sup>";
      var hundred = shown(d.padEnd(3, "0"), 3, e - 2);
      var coefWords = function (c, why) { return fill(why, {c:c}); };
      return {type:"mc", answer:0,
        prompt:fill(p("Which is {x} written in correct scientific notation?", "¿Cuál es {x} escrito en notación científica correcta?"), {x:show(value)}),
        choices:[
          {text:p(right, right), why:p("", "")},
          {text:p(ten, ten), why:coefWords(p("The value is the same, but {c} is not less than 10.", "El valor es el mismo, pero {c} no es menor que 10."), {en:d.slice(0, 2) + (d.length > 2 ? "." + d.slice(2) : ""), es:d.slice(0, 2) + (d.length > 2 ? "." + d.slice(2) : "")})},
          {text:p(tenth, tenth), why:coefWords(p("The value is the same, but {c} is less than 1.", "El valor es el mismo, pero {c} es menor que 1."), {en:"0." + d, es:"0." + d})},
          {text:p(hundred, hundred), why:coefWords(p("The value is the same, but {c} is not less than 10.", "El valor es el mismo, pero {c} no es menor que 10."), {en:d.padEnd(3, "0").slice(0, 3) + (d.length > 3 ? "." + d.slice(3) : ""), es:d.padEnd(3, "0").slice(0, 3) + (d.length > 3 ? "." + d.slice(3) : "")})}],
        explanation:fill(p("The first number must be at least 1 and less than 10. Only {r} has one nonzero digit before the decimal point.", "El primer número debe ser al menos 1 y menor que 10. Solo {r} tiene un dígito distinto de cero antes del punto decimal."), {r:right})};
    }
    function meaning(params) {
      var d = params[0], e = Number(params[1]), k = Math.abs(e), big = e > 0, sci = show(sciText(d, e));
      var dir = function (right, size) {
        var where = right ? p("to the right", "a la derecha") : p("to the left", "a la izquierda");
        var what = right ? p("bigger than 1", "mayor que 1") : p("less than 1", "menor que 1");
        return fill(p("It is {w}: move the decimal point {k} {d}.", "Es {w}: mueve el punto decimal {k} {d}."), {w:what, k:places(size), d:where});
      };
      var other = k === 1 ? k + 1 : (k % 2 ? k + 1 : k - 1);
      return {type:"mc", answer:0,
        prompt:fill(p("What does the exponent in {x} tell you about the number in standard notation?", "¿Qué te dice el exponente de {x} sobre el número en notación estándar?"), {x:sci}),
        choices:[
          {text:dir(big, k), why:p("", "")},
          {text:dir(!big, k), why:big ? p("A positive exponent means the number is bigger than 1, so the decimal point moves right.", "Un exponente positivo significa que el número es mayor que 1, así que el punto decimal se mueve a la derecha.") :
            p("A negative exponent means the number is less than 1, so the decimal point moves left.", "Un exponente negativo significa que el número es menor que 1, así que el punto decimal se mueve a la izquierda.")},
          {text:dir(big, other), why:fill(p("The decimal point moves as many places as the exponent shows: {k}.", "El punto decimal se mueve tantos lugares como indica el exponente: {k}."), {k:places(k)})},
          big ? {text:fill(p("Multiply the first number by {k}.", "Multiplica el primer número por {k}."), {k:String(k)}),
            why:fill(p("The exponent is a power of 10, not a multiplier: multiply by 10 a total of {k} times.", "El exponente es una potencia de 10, no un multiplicador: multiplica por 10 un total de {k} veces."), {k:String(k)})} :
          {text:p("The number is negative.", "El número es negativo."),
            why:p("A negative exponent does not make the number negative. It makes it less than 1.", "Un exponente negativo no hace negativo el número. Lo hace menor que 1.")}],
        explanation:dir(big, k)};
    }

    var topics = [
      {id:"to-sci", title:p("To scientific notation", "A notación científica")},
      {id:"to-standard", title:p("To standard notation", "A notación estándar")},
      {id:"read", title:p("Reading scientific notation", "Lectura de la notación científica")}
    ];
    var generators = [
      // Big numbers: 2 to 4 digits followed by zeros (150,000,000,000), or with a decimal part (6,350.2).
      {key:"sb", topic:"to-sci", make:function (r) {
        var n = int(r, 1, 4), d = digits(r, n, true), e = int(r, Math.max(n, 3), 11);
        if (r() < 0.25 && n >= 3) e = int(r, 1, n - 2);
        return [standard(d, e), pick(r, UNIT_KEYS)];
      }, build:toSci},
      // Numbers less than 1: 0.0000075, 0.000000000275.
      {key:"ss", topic:"to-sci", make:function (r) {
        var n = int(r, 1, 4), d = digits(r, n, false), e = -int(r, 1, 10);
        return [standard(d, e), pick(r, UNIT_KEYS)];
      }, build:toSci},
      // Positive exponents: 7.1 × 10³ is 7,100. The last digit is not zero, so the zeros only hold places.
      {key:"pb", topic:"to-standard", make:function (r) {
        var n = int(r, 1, 4), d = digits(r, n, true), e = int(r, 1, 8);
        return [d, String(e), pick(r, UNIT_KEYS)];
      }, build:toStandard},
      // Negative exponents: 4.06 × 10⁻⁴ is 0.000406.
      {key:"ps", topic:"to-standard", make:function (r) {
        var n = int(r, 1, 4), d = digits(r, n, false), e = -int(r, 1, 8);
        return [d, String(e), pick(r, UNIT_KEYS)];
      }, build:toStandard},
      {key:"rf", topic:"read", make:function (r) {
        var n = int(r, 2, 3), d = digits(r, n, true), e = int(r, -9, 9);
        if (e >= -1 && e <= 2) e = pick(r, [-4, 4, 5, -6]);
        return [d, String(e)];
      }, build:properForm},
      {key:"rm", topic:"read", make:function (r) {
        var n = int(r, 1, 3), e = int(r, 2, 9) * (r() < 0.5 ? -1 : 1);
        return [digits(r, n, false), String(e)];
      }, build:meaning}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/numbers/scientific-notation/",
      copy:{title:"Scientific Notation Practice", es:{
        "Scientific Notation Practice":"Práctica de notación científica",
        "Quantitative Skills · Numbers":"Habilidades cuantitativas · Números",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Work it out on paper first. The rules from the lesson are below.":"Sin límite de tiempo. Primero resuélvelo en papel. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all three skills.":"Elige una habilidad y comienza. El repaso mixto incluye las tres habilidades.",
        "Type scientific notation as 4.5 x 10^4 (or 4.5e4), and standard notation as 45,000 or 45000. A unit after the number is optional.":"Escribe la notación científica como 4.5 x 10^4 (o 4.5e4) y la notación estándar como 45,000 o 45000. La unidad después del número es opcional.",
        "When a question asks for scientific notation, the first number must be at least 1 and less than 10.":"Cuando una pregunta pide notación científica, el primer número debe ser al menos 1 y menor que 10.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Your answer":"Tu respuesta",
        "Type 4.5 x 10^-3 for scientific notation, or 0.0045 for standard notation.":"Escribe 4.5 x 10^-3 para notación científica o 0.0045 para notación estándar.",
        "Reference":"Consulta", "Scientific notation rules":"Reglas de la notación científica",
        "The first number is at least 1 and less than 10. The base is always 10.":"El primer número es al menos 1 y menor que 10. La base siempre es 10.",
        "The exponent is how many places the decimal point moved.":"El exponente es cuántos lugares se movió el punto decimal.",
        "Numbers bigger than 1 have a positive exponent:":"Los números mayores que 1 tienen exponente positivo:",
        "Numbers less than 1 have a negative exponent:":"Los números menores que 1 tienen exponente negativo:",
        "Back to standard notation: a positive exponent moves the decimal point right, a negative one moves it left. Fill empty places with zeros.":"De vuelta a notación estándar: un exponente positivo mueve el punto decimal a la derecha y uno negativo lo mueve a la izquierda. Llena los lugares vacíos con ceros.",
        "Practice for the Scientific Notation lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Notación científica de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
