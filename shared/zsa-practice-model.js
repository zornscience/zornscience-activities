(function () {
  "use strict";
  function shuffle(items, random) {
    var result = items.slice(), rng = random || Math.random;
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), old = result[i];
      result[i] = result[j]; result[j] = old;
    }
    return result;
  }
  function makeSet(bank, topic, random) {
    return shuffle(bank.filter(function (q) { return topic === "mixed" || q.topic === topic; }), random).map(function (q) {
      return {question:q, order:q.type === "mc" ? shuffle(q.choices.map(function (_, i) { return i; }), random) : []};
    });
  }
  function parse(raw) {
    // No partial parsing: reject commas, arithmetic, non-finite values, and trailing junk.
    var match = String(raw).trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:\s+([\p{L}%/]+))?$/u);
    if (!match) return null;
    var value = Number(match[1]);
    if (!Number.isFinite(value)) return null;
    var mantissa = match[1].split(/[eE]/)[0].replace(/^[+-]/, "");
    var digits = mantissa.replace(".", "").replace(/^0+/, "");
    if (mantissa.indexOf(".") < 0) digits = digits.replace(/0+$/, "");
    var decimals = Math.max(0, (mantissa.split(".")[1] || "").length - Number((match[1].split(/[eE]/)[1] || "0")));
    return {value:value, sf:digits.length || 1, decimals:decimals, suffix:match[2] || ""};
  }
  function unitMatches(raw, expected) {
    var aliases = {M:["M", "mol/L"], K:["K", "kelvin"], atoms:["atoms", "atom", "átomos", "átomo"], count:["count", "cantidad", "electrons", "electrones"], ratio:["ratio"], degrees:["degrees", "degree", "grados", "grado"]};
    return raw === expected || !!(aliases[expected] && aliases[expected].indexOf(raw) >= 0);
  }
  function inspect(q, raw, unit) {
    var parsed = parse(raw);
    if (!parsed) return {valid:false, reason:"number"};
    if (!unit) return {valid:false, reason:"unit"};
    var valueOK = q.precision.exact ? parsed.value === q.value : Math.abs(parsed.value - q.value) <= q.tolerance + Math.abs(q.value) * Number.EPSILON * 4;
    var unitOK = unit === q.unit && (!parsed.suffix || unitMatches(parsed.suffix, q.unit));
    var precisionOK = q.precision.exact ? Number.isInteger(parsed.value) : q.precision.sf ? parsed.sf === q.precision.sf : parsed.decimals === q.precision.decimals;
    return {valid:true, correct:valueOK && unitOK, valueOK:valueOK, unitOK:unitOK, precisionOK:precisionOK};
  }
  // home: the bank's own lesson, used when from= is missing or not a zornscience.org page (AP Chemistry by default).
  function lessonLink(raw, lang, home) {
    var fallback = home || "https://zornscience.org/science/ap-chemistry/";
    function twin(href) {
      var url = new URL(href);
      if (lang === "es" && !url.pathname.startsWith("/es/")) url.pathname = "/es" + url.pathname;
      if (lang !== "es" && url.pathname.startsWith("/es/")) url.pathname = url.pathname.slice(3);
      return url.href;
    }
    try {
      var url = new URL(raw || fallback);
      if (url.origin !== "https://zornscience.org" || url.username || url.password) url = new URL(fallback);
      return twin(url.href);
    } catch (_) { return twin(fallback); }
  }

  // Generated practice (the Quantitative Skills sets). Everything below is used only by questions with a
  // `check` object, from banks with a `generate` function; the fixed AP banks above never reach it.
  //
  // Exact numbers are reduced fractions {n, d} of BigInts with d > 0, so decimal data stays exact and rounding never
  // meets a binary floating point tie: 1.15 × 3.0 is exactly 3.45 and rounds half up to 3.5.
  function gcd(a, b) {
    if (a < 0n) a = -a;
    if (b < 0n) b = -b;
    while (b) { var r = a % b; a = b; b = r; }
    return a;
  }
  function frac(n, d) {
    if (d === undefined) d = 1n;
    if (d === 0n) throw new RangeError("division by zero");
    if (d < 0n) { n = -n; d = -d; }
    var g = gcd(n, d);
    return g > 1n ? {n:n / g, d:d / g} : {n:n, d:d};
  }
  function pow10(k) { return 10n ** BigInt(Math.abs(k)); }
  function scale(k) { return k >= 0 ? frac(pow10(k)) : frac(1n, pow10(k)); }
  // A decimal or E-notation string ("-0.0250", "6.02e23"), a fraction string ("1/3"), a finite number (read from
  // its shortest decimal form) or an exact value.
  function exact(x) {
    if (x && typeof x === "object" && typeof x.n === "bigint") return x;
    var s = typeof x === "number" ? (Number.isFinite(x) ? String(x) : "") : String(x).trim();
    var f = s.match(/^([+-]?\d+)\/(\d+)$/);
    if (f) return frac(BigInt(f[1]), BigInt(f[2]));
    var m = s.match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
    if (!m || !(m[2] || m[3])) throw new TypeError("not an exact decimal: " + s);
    var digits = BigInt((m[2] || "") + (m[3] || "")), e = Number(m[4] || 0) - (m[3] || "").length;
    return mul(frac(m[1] === "-" ? -digits : digits), scale(e));
  }
  function add(a, b) { a = exact(a); b = exact(b); return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
  function neg(a) { a = exact(a); return {n:-a.n, d:a.d}; }
  function sub(a, b) { return add(a, neg(b)); }
  function mul(a, b) { a = exact(a); b = exact(b); return frac(a.n * b.n, a.d * b.d); }
  function div(a, b) { a = exact(a); b = exact(b); return frac(a.n * b.d, a.d * b.n); }
  function cmp(a, b) { a = exact(a); b = exact(b); var l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : l > r ? 1 : 0; }
  function abs(a) { a = exact(a); return a.n < 0n ? neg(a) : a; }
  function sign(a) { a = exact(a); return a.n < 0n ? -1 : a.n > 0n ? 1 : 0; }
  function toNumber(a) { a = exact(a); return Number(a.n) / Number(a.d); }
  // The power of ten of the leading digit: 10^k <= |a| < 10^(k+1). Not defined for zero.
  function magnitude(a) {
    a = abs(a);
    var k = a.n.toString().length - a.d.toString().length;
    while (cmp(a, scale(k)) < 0) k--;
    while (cmp(a, scale(k + 1)) >= 0) k++;
    return k;
  }
  // Round to a multiple of 10^place with the lessons' rule: 5 or more rounds up (away from zero).
  function roundAt(a, place) {
    a = exact(a);
    var q = div(abs(a), scale(place)), r = (2n * q.n + q.d) / (2n * q.d);
    return mul(frac(a.n < 0n ? -r : r), scale(place));
  }
  // precision is {sf:n}, {decimals:n} or {exact:true}. place is the power of ten of the last kept digit.
  function rounded(a, precision) {
    a = exact(a);
    if (precision.exact) return {value:a, place:0};
    if (precision.decimals !== undefined) return {value:roundAt(a, -precision.decimals), place:-precision.decimals};
    if (!sign(a)) return {value:a, place:1 - precision.sf};
    var place = magnitude(a) - precision.sf + 1, value = roundAt(a, place);
    if (sign(value) && magnitude(value) > place + precision.sf - 1) place++; // 9.996 to 3 figures is 10.0
    return {value:value, place:place};
  }
  // Standard notation for a multiple of 10^place: fixed(0.025, -4) is "0.0250".
  function fixed(a, place) {
    a = exact(a);
    var q = div(abs(a), scale(Math.min(place, 0))), digits = (q.n / q.d).toString();
    if (place < 0) {
      digits = digits.padStart(1 - place, "0");
      digits = digits.slice(0, place) + "." + digits.slice(place);
    }
    return (a.n < 0n ? "-" : "") + digits;
  }
  // The text of a rounded answer: E notation ("2.50e-2") for form "sci", otherwise standard notation.
  function write(a, precision, form) {
    var r = rounded(a, precision);
    if (form !== "sci") return fixed(r.value, r.place);
    var e = sign(r.value) ? magnitude(r.value) : 0;
    return fixed(div(r.value, scale(e)), r.place - e) + "e" + e;
  }
  // For prompts and answers: a true minus sign, commas in numbers of five or more digits, and × 10 with a superscript.
  function pretty(text) {
    var m = String(text).match(/^([+-]?)(\d+)(\.\d+)?(?:e([+-]?\d+))?$/i);
    if (!m) return String(text);
    var whole = m[4] === undefined && m[2].length > 4 ? m[2].replace(/\B(?=(\d{3})+(?!\d))/g, ",") : m[2];
    var out = (m[1] === "-" ? "\u2212" : m[1]) + whole + (m[3] || "");
    if (m[4] !== undefined) out += " × 10<sup>" + (Number(m[4]) < 0 ? "\u2212" : "") + Math.abs(Number(m[4])) + "</sup>";
    return out;
  }

  // Reading what students type. Accepted: 0.0045, .5, 45,000 (comma thousands), 4.5e-3, 4.5 x 10^-3, 4.5×10^(−3) with a true minus,
  // 4.5 * 10**-3, 4.5x10-3, 4.5 × 10⁻³ (superscripts), 10^-6, a leading = and a unit with or without a space (12.5g, 3.0 cm³).
  // Rejected with a reason: a decimal comma (1,25) and a power of ten without its exponent (3 x 10 4).
  var SUPER = {"\u2070":"0", "\u00B9":"1", "\u00B2":"2", "\u00B3":"3", "\u2074":"4", "\u2075":"5", "\u2076":"6",
    "\u2077":"7", "\u2078":"8", "\u2079":"9", "\u207B":"-", "\u207A":"+"};
  var SUPERS = /[\u2070\u00B9\u00B2\u00B3\u2074-\u2079\u207B\u207A]/g;
  function unsuper(s) { return s.replace(SUPERS, function (c) { return SUPER[c]; }); }
  function read(raw) {
    var s = String(raw).replace(/[\u2212\u2010-\u2015\uFE63\uFF0D]/g, "-").replace(/[\s\u00A0\u202F]+/g, " ").trim();
    s = s.replace(/^=\s*/, "").replace(/10\s*([\u207A\u207B]?[\u2070\u00B9\u00B2\u00B3\u2074-\u2079]+)/g, function (_, e) { return "10^" + unsuper(e); });
    s = unsuper(s);
    if (!s) return null;
    var m = /^([+-]?)\s*/.exec(s), negative = m[1] === "-", mant, expo = 0, form = "plain";
    s = s.slice(m[0].length);
    if ((m = /^10\s*(?:\^|\*\*)\s*(?:\(\s*([+-]?\d+)\s*\)|([+-]?\d+))(?![\d.,])/.exec(s))) {
      mant = "1"; expo = Number(m[1] || m[2]); form = "pow";
    } else {
      m = /^(?:(\d{1,3}(?:,\d{3})+)(\.\d*)?|(\d+)(\.\d*)?|(\.\d+))(?![\d,])/.exec(s);
      if (!m) return /^\d[\d,]*,\d/.test(s) ? {issue:"comma"} : null;
      mant = m[1] ? m[1].replace(/,/g, "") + (m[2] || "") : m[3] !== undefined ? m[3] + (m[4] || "") : m[5];
      s = s.slice(m[0].length);
      var e = /^\s*[eE]\s*([+-]?\d+)(?![\d.,])/.exec(s);
      var t = /^\s*(?:[x×X*·]|\\times)\s*10\s*(?:(?:\^|\*\*)\s*(?:\(\s*([+-]?\d+)\s*\)|([+-]?\d+))|([+-]\d+))(?![\d.,])/.exec(s);
      if (e) { expo = Number(e[1]); form = "e"; m = e; }
      else if (t) { expo = Number(t[1] || t[2] || t[3]); form = "times"; m = t; }
      else if (/^\s*(?:[x×X*·]|\\times)\s*10(?!\d)/.test(s)) return {issue:"power"};
      else m = [""];
    }
    var unit = s.slice(m[0].length).trim();
    if (unit && !/^[A-Za-z\u00B5\u03BC\u00B0\u00BA%(\u00C0-\u024F]/.test(unit)) return null;
    var point = mant.indexOf("."), digits = mant.replace(".", "").replace(/^0+/, ""), trailing = 0;
    if (point < 0 && digits) { trailing = digits.length - digits.replace(/0+$/, "").length; digits = digits.slice(0, digits.length - trailing); }
    var coef = exact(mant), value = mul(coef, scale(expo));
    if (negative) { coef = neg(coef); value = neg(value); }
    return {value:value, number:toNumber(value), sf:digits.length || 1, form:form, coef:coef, unit:unit,
      place:point < 0 ? expo + trailing : expo - (mant.length - point - 1)};
  }
  // Units: the micro sign and Greek mu are the same, º typed for ° is a degree sign, a dot, star or space between
  // symbols is a product, and cm3, cm^3 and cm³ are the same. Symbols keep their case (mL is not ML); spelled-out
  // names ("meters", "metros") do not.
  function unitKey(raw) {
    return unsuper(String(raw).normalize("NFC")).trim().replace(/\.$/, "").replace(/\u03BC/g, "\u00B5").replace(/\u00BA/g, "\u00B0")
      .replace(/\u00B0\s+/g, "\u00B0").replace(/\*\*/g, "^").replace(/\s*\^\s*/g, "^")
      .replace(/\s*([/·*×.])\s*/g, function (_, c) { return c === "/" ? "/" : "·"; })
      .replace(/([A-Za-z\u00B5\u00B0)])(-?\d)/g, "$1^$2").replace(/\s+/g, "·");
  }
  function unitSame(typed, alias) {
    if (unitKey(typed) === unitKey(alias)) return true;
    var word = function (s) { return String(s).normalize("NFC").trim().replace(/\.$/, "").replace(/\s+/g, " ").toLowerCase(); };
    // Only names (five or more letters, or two words) ignore case: short symbols such as mmol and Mmol differ.
    return /^[a-z\u00C0-\u024F]+(?: [a-z\u00C0-\u024F]+)*$/i.test(alias) && (alias.length >= 5 || / /.test(alias)) && word(typed) === word(alias);
  }

  function figures(n) { return {en:n === 1 ? "1 significant figure" : n + " significant figures", es:n === 1 ? "1 cifra significativa" : n + " cifras significativas"}; }
  function places(n) { return {en:n === 1 ? "1 decimal place" : n + " decimal places", es:n === 1 ? "1 lugar decimal" : n + " lugares decimales"}; }
  var NOTES = {
    unit:{en:"Check the unit. This answer is in {unit}.", es:"Revisa la unidad. Esta respuesta va en {unit}."},
    noUnit:{en:"This answer has no unit.", es:"Esta respuesta no lleva unidad."},
    sci:{en:"Write the answer in scientific notation: a number from 1 to less than 10, times a power of 10.", es:"Escribe la respuesta en notación científica: un número de 1 a menos de 10, por una potencia de 10."},
    coef:{en:"In scientific notation, the first number must be at least 1 and less than 10.", es:"En notación científica, el primer número debe ser al menos 1 y menor que 10."},
    plain:{en:"Write the answer in standard notation, without a power of 10.", es:"Escribe la respuesta en notación estándar, sin potencia de 10."},
    sign:{en:"Check the sign.", es:"Revisa el signo."},
    many:{en:"Round to {figures}.", es:"Redondea a {figures}."},
    few:{en:"Your answer is rounded too far. Keep {figures}.", es:"Tu respuesta está demasiado redondeada. Conserva {figures}."},
    kept:{en:"Keep {figures}. A zero at the end after the decimal point counts.", es:"Conserva {figures}. Un cero al final después del punto decimal sí cuenta."},
    zeros:{en:"Zeros at the end of a number with no decimal point do not count, so your answer shows only {shown}. Write {sci} to show {figures}.", es:"Los ceros al final de un número sin punto decimal no cuentan, así que tu respuesta muestra solo {shown}. Escribe {sci} para mostrar {figures}."},
    whole:{en:"Enter a whole number.", es:"Escribe un número entero."}
  };
  function note(key, values) {
    var out = {};
    ["en", "es"].forEach(function (lang) {
      out[lang] = NOTES[key][lang].replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v[lang] : v; });
    });
    return out;
  }
  // v (typed, its last digit at 10^place) agrees with a: |v - a| <= half of 10^place.
  function agrees(v, place, a) { return cmp(mul(abs(sub(v, a)), 2), scale(place)) <= 0; }
  // Checks one answer to a generated numeric question:
  //   answer      the exact value (any form exact() reads); precision {sf}, {decimals} or {exact:true}
  //   unit        the unit symbol shown in the answer, or null; accept: every spelling of it (symbols and names)
  //   check       {sf:"strict" | "advice", form:"sci" | "plain" | "any", unit:"required" | "optional"}
  //   traps       [{answer, note:{en, es}}]: wrong values from known mistakes, each with its own feedback
  // A value is right when it equals the correctly rounded answer, or has more digits than asked that are either the
  // exact answer correctly rounded at their last digit, or within one unit of it and round to the right answer. Fewer digits that are the exact answer rounded there are "rounded too far".
  // With sf "strict" the precision must also match.
  function judge(q, raw) {
    var r = read(raw), check = q.check || {}, notes = [], P = q.precision || {exact:true};
    if (!r) return {valid:false, reason:"number"};
    if (r.issue) return {valid:false, reason:r.issue};
    if (check.unit === "required" && q.unit && !r.unit) return {valid:false, reason:"unit"};
    var unitOK = !r.unit || (q.accept || []).some(function (alias) { return unitSame(r.unit, alias); });
    if (!unitOK) notes.push(q.unit ? note("unit", {unit:q.unit}) : note("noUnit", {}));
    var formOK = true;
    if (check.form === "sci") {
      if (r.form === "plain") { formOK = false; notes.push(note("sci", {})); }
      else if (cmp(abs(r.coef), 1) < 0 || cmp(abs(r.coef), 10) >= 0) { formOK = false; notes.push(note("coef", {})); }
    } else if (check.form === "plain" && r.form !== "plain") { formOK = false; notes.push(note("plain", {})); }
    var A = exact(q.answer), v = r.value, valueOK, precisionOK, R = rounded(A, P);
    if (P.exact) {
      valueOK = cmp(v, A) === 0; precisionOK = v.d === 1n;
      if (valueOK && !precisionOK) notes.push(note("whole", {}));
    } else {
      // Right: the correctly rounded answer, or more digits that are the exact answer correctly rounded there (255 for
      // 254.79 when two figures were asked: rounding 255 again would give 260), or more digits within one unit of their
      // last one that round to it (a cut-off calculator value).
      // Rounded too far: fewer digits, but the exact answer rounded half up at that digit (9.5 to one figure is 10, not 9).
      var equal = cmp(v, R.value) === 0, want = P.sf ? figures(P.sf) : places(P.decimals);
      var finer = P.sf ? r.sf > P.sf : r.place < -P.decimals, coarser = P.sf ? r.sf < P.sf : r.place > -P.decimals;
      valueOK = equal || (finer && (cmp(roundAt(A, r.place), v) === 0 || (cmp(abs(sub(v, A)), scale(r.place)) <= 0 && cmp(rounded(v, P).value, R.value) === 0)));
      precisionOK = P.sf ? r.sf === P.sf : r.place === -P.decimals;
      if (valueOK && !precisionOK) {
        if (finer) notes.push(note("many", {figures:want}));
        else if (r.form === "plain" && r.place > 0 && P.sf) notes.push(note("zeros", {shown:figures(r.sf), figures:want, sci:pretty(write(A, P, "sci"))}));
        else notes.push(note("kept", {figures:want}));
      } else if (!valueOK && sign(v) && coarser && cmp(roundAt(A, r.place), v) === 0) notes.push(note("few", {figures:want}));
    }
    if (!valueOK && sign(A) && sign(v) && (cmp(neg(v), R.value) === 0 || agrees(neg(v), r.place, A))) notes.push(note("sign", {}));
    if (!valueOK) (q.traps || []).some(function (trap) {
      var T = exact(trap.answer);
      if (cmp(v, rounded(T, P).value) === 0 || (r.sf >= 2 && agrees(v, r.place, T))) { notes.push(trap.note); return true; }
      return false;
    });
    var correct = valueOK && unitOK && formOK && (check.sf !== "strict" || precisionOK);
    return {valid:true, correct:correct, valueOK:valueOK, unitOK:unitOK, formOK:formOK, precisionOK:precisionOK, notes:notes};
  }
  function int(random, lo, hi) { return lo + Math.floor(random() * (hi - lo + 1)); }
  function pick(random, list) { return list[Math.floor(random() * list.length)]; }
  // A generated bank from {topics, generators, perTopic, mixedSize, lesson, copy}. A generator is {key, topic,
  // make(random) -> params, build(params) -> question fields}; params are strings, so a question's id
  // ("key|param|param") rebuilds it exactly. Sets cycle through each topic's generators and never repeat an id.
  function generatedBank(spec) {
    var byKey = {};
    spec.generators.forEach(function (g) { byKey[g.key] = g; });
    function build(g, params) { return Object.assign({id:[g.key].concat(params).join("|"), topic:g.topic}, g.build(params)); }
    function generate(topic, _model, random) {
      random = random || Math.random;
      var topics = topic === "mixed" ? spec.topics.map(function (t) { return t.id; }) : [topic], out = [], seen = {};
      topics.forEach(function (id, i) {
        var count = topic === "mixed" ? Math.floor(spec.mixedSize / topics.length) + (i < spec.mixedSize % topics.length ? 1 : 0) : spec.perTopic;
        var gens = shuffle(spec.generators.filter(function (g) { return g.topic === id; }), random);
        for (var k = 0; k < count; k++) {
          var g = gens[k % gens.length], q = null;
          for (var tries = 0; tries < 60 && (!q || seen[q.id]); tries++) q = build(g, g.make(random));
          seen[q.id] = true; out.push(q);
        }
      });
      return out;
    }
    function rebuild(id) { var parts = String(id).split("|"); return build(byKey[parts[0]], parts.slice(1)); }
    var copy = {title:spec.copy.title, es:Object.assign({}, interfaceEs, spec.copy.es)};
    return {topics:spec.topics, generators:spec.generators, perTopic:spec.perTopic, mixedSize:spec.mixedSize, lesson:spec.lesson,
      copy:copy, generate:generate, rebuild:rebuild};
  }

  // Spanish for the engine's own words on generated-practice pages (each page adds its own).
  var interfaceEs = {
    "ZornScience home":"Inicio de ZornScience", "Activity tools":"Herramientas de la actividad",
    "Instructions":"Instrucciones", "Close":"Cerrar", "Close instructions":"Cerrar instrucciones",
    "Share":"Compartir", "Share activity":"Compartir actividad", "Share this activity":"Compartir esta actividad",
    "Close share options":"Cerrar opciones para compartir", "Share link":"Enlace para compartir", "Copy link":"Copiar enlace", "Email":"Correo electrónico",
    "Link copied.":"Enlace copiado.", "Link selected. Copy it with Ctrl+C or Command+C.":"Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
    "Share a fresh activity. Your answers and results are not included.":"Comparte una actividad nueva. Tus respuestas y resultados no se incluyen.",
    "Your answers stay in this tab. No account needed.":"Tus respuestas se quedan en esta pestaña. No necesitas una cuenta.",
    "← Back to the lesson":"← Volver a la lección", "Topic":"Tema", "Mixed review":"Repaso mixto", "Start practice":"Comenzar práctica",
    "Check answer":"Comprobar respuesta", "Next question":"Siguiente pregunta", "See results":"Ver resultados",
    "Question {n} of {total}":"Pregunta {n} de {total}", "{n} of {total} correct":"{n} de {total} correctas", "Set progress":"Avance de la serie",
    "Your answer":"Tu respuesta", "Choose one answer.":"Elige una respuesta.", "Select an answer first.":"Primero selecciona una respuesta.",
    "Enter a number using a decimal point or scientific notation.":"Escribe un número con punto decimal o notación científica.",
    "Use a decimal point, not a comma, like 3.5.":"Usa punto decimal, no coma, como en 3.5.",
    "Write the power of 10 with ^, like 3.2 x 10^4.":"Escribe la potencia de 10 con ^, como en 3.2 x 10^4.",
    "Type the unit after the number.":"Escribe la unidad después del número.",
    "Correct.":"Correcto.", "Incorrect.":"Incorrecto.", "Correct value; check significant figures.":"Valor correcto; revisa las cifras significativas.",
    "Correct value; check decimal places.":"Valor correcto; revisa los lugares decimales.",
    "Correct answer: ":"Respuesta correcta: ", "Your set is complete":"Tu serie está completa", "Try again":"Intentar de nuevo", "Choose another topic":"Elegir otro tema",
    "Results by topic":"Resultados por tema", "Review these questions":"Repaso de estas preguntas", "All correct. Try another topic when you are ready.":"Todo correcto. Intenta otro tema cuando quieras.",
    "{score} of {total} correct ({percent}%).":"{score} de {total} correctas ({percent}%).", "{n} questions":"{n} preguntas"
  };

  var api = {shuffle:shuffle, makeSet:makeSet, parse:parse, inspect:inspect, lessonLink:lessonLink,
    exact:exact, add:add, sub:sub, mul:mul, div:div, neg:neg, abs:abs, cmp:cmp, sign:sign, toNumber:toNumber, scale:scale,
    magnitude:magnitude, roundAt:roundAt, rounded:rounded, fixed:fixed, write:write, pretty:pretty,
    read:read, unitKey:unitKey, unitSame:unitSame, judge:judge, figures:figures, places:places, interfaceEs:interfaceEs,
    int:int, pick:pick, generatedBank:generatedBank};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-zsa-practice]").forEach(function (root) {
    root.addEventListener("zsa:request-model", function (event) { event.detail.receive(api); });
  });
}());
