(function () {
  "use strict";
  // Reading Formulas Practice: generated questions for the Quantitative Skills lesson Reading Formulas. The ideas
  // follow the lesson on zornscience.org: each letter is a measured quantity, a formula reads aloud as a sentence,
  // letters side by side mean multiply, constants such as g and R come from a reference sheet, subscripts i and f are
  // name tags, Δ means "change in" and is always final minus initial, and case matters (m and M, v and V).
  // Significant figures are not the skill here, so they are advice only, with the count named under the question.
  var SLUG = "qs-reading-formulas-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    function cap(pair) { return p(pair.en.charAt(0).toUpperCase() + pair.en.slice(1), pair.es.charAt(0).toUpperCase() + pair.es.slice(1)); }
    function same(text) { return p(text, text); }
    var int = M.int, pick = M.pick, show = M.pretty;

    // The quantities in the lesson's formulas: the symbol as shown, the English name, the Spanish name, and the
    // Spanish name with its article for sentences.
    var Q = {
      d:{sym:"d", name:p("distance", "distancia"), art:"la distancia"},
      v:{sym:"v", name:p("velocity", "velocidad"), art:"la velocidad"},
      t:{sym:"t", name:p("time", "tiempo"), art:"el tiempo"},
      F:{sym:"F", name:p("force", "fuerza"), art:"la fuerza"},
      m:{sym:"m", name:p("mass", "masa"), art:"la masa"},
      a:{sym:"a", name:p("acceleration", "aceleración"), art:"la aceleración"},
      W:{sym:"W", name:p("weight", "peso"), art:"el peso"},
      g:{sym:"g", name:p("acceleration due to gravity", "aceleración de la gravedad"), art:"la aceleración de la gravedad"},
      D:{sym:"D", name:p("density", "densidad"), art:"la densidad"},
      V:{sym:"V", name:p("volume", "volumen"), art:"el volumen"},
      P:{sym:"P", name:p("pressure", "presión"), art:"la presión"},
      n:{sym:"n", name:p("moles of gas", "moles de gas"), art:"los moles de gas"},
      R:{sym:"R", name:p("gas constant", "constante de los gases"), art:"la constante de los gases"},
      T:{sym:"T", name:p("temperature", "temperatura"), art:"la temperatura"},
      M:{sym:"M", name:p("molar mass", "masa molar"), art:"la masa molar"},
      vf:{sym:"v<sub>f</sub>", name:p("final velocity", "velocidad final"), art:"la velocidad final"},
      vi:{sym:"v<sub>i</sub>", name:p("initial velocity", "velocidad inicial"), art:"la velocidad inicial"}
    };
    function says(key) { return p(Q[key].name.en, Q[key].art); }
    // Case partners: the same letter in the other case is a different quantity.
    var TWIN = {d:"D", D:"d", v:"V", V:"v", t:"T", T:"t", m:"M"};
    var FORMULAS = {
      dvt:{f:"d = vt", syms:["d", "v", "t"], words:p("distance equals velocity times time", "la distancia es igual a la velocidad por el tiempo"),
        why:p("Letters side by side mean multiply, so vt is v × t.", "Las letras juntas significan multiplicar, así que vt es v × t.")},
      fma:{f:"F = ma", syms:["F", "m", "a"], words:p("force equals mass times acceleration", "la fuerza es igual a la masa por la aceleración"),
        why:p("Letters side by side mean multiply, so ma is m × a.", "Las letras juntas significan multiplicar, así que ma es m × a.")},
      wmg:{f:"W = mg", syms:["W", "m", "g"], words:p("weight equals mass times the acceleration due to gravity", "el peso es igual a la masa por la aceleración de la gravedad"),
        why:p("Here mg is m × g, and g is the acceleration due to gravity.", "Aquí mg es m × g, y g es la aceleración de la gravedad.")},
      dmv:{f:"D = m/V", syms:["D", "m", "V"], words:p("density equals mass divided by volume", "la densidad es igual a la masa entre el volumen"),
        why:p("The fraction bar means divide, with m on top.", "La barra de fracción significa dividir, con m arriba.")},
      vat:{f:"v<sub>f</sub> = v<sub>i</sub> + at", syms:["vf", "vi", "a", "t"], words:p("final velocity equals initial velocity plus acceleration times time", "la velocidad final es igual a la velocidad inicial más la aceleración por el tiempo"),
        why:p("Here at is a × t, and it is added to v<sub>i</sub>.", "Aquí at es a × t, y se suma a v<sub>i</sub>.")},
      pvt:{f:"PV = nRT", syms:["P", "V", "n", "R", "T"], words:p("pressure times volume equals moles times the gas constant times temperature", "la presión por el volumen es igual a los moles por la constante de los gases por la temperatura"),
        why:p("PV is P × V, and nRT is n × R × T.", "PV es P × V, y nRT es n × R × T.")}
    };
    function reads(key) { var F = FORMULAS[key]; return fill(p("{f} reads: {w}.", "{f} se lee: {w}."), {f:F.f, w:F.words}); }

    // What a symbol stands for. The wrong choices: the same letter in the other case, a look-alike the lesson warns
    // about, and the other quantities in the same formula.
    var LOOKALIKE = {
      F:{text:p("Final value", "Valor final"), why:p("A subscript f means final, as in v<sub>f</sub>. Capital F stands for force.", "Un subíndice f significa final, como en v<sub>f</sub>. La F mayúscula representa la fuerza.")},
      W:{text:p("Work", "Trabajo"), why:p("W can stand for work in other formulas, but in W = mg it is weight: mass times g.", "W puede representar el trabajo en otras fórmulas, pero en W = mg es el peso: la masa por g.")},
      g:{text:p("Grams", "Gramos"), why:p("Here g is a quantity, not the unit gram: it is the acceleration due to gravity, 9.8 m/s².", "Aquí g es una cantidad, no la unidad gramo: es la aceleración de la gravedad, 9.8 m/s².")},
      a:{text:p("Area", "Área"), why:p("In this formula, a is acceleration, in m/s². Area is not in it.", "En esta fórmula, a es la aceleración, en m/s². El área no aparece.")}
    };
    function caseWord(sym) { return sym === sym.toUpperCase() ? p("capital", "mayúscula") : p("lowercase", "minúscula"); }
    var SYMBOLS = [["dvt", "d"], ["dvt", "v"], ["dvt", "t"], ["fma", "F"], ["fma", "m"], ["fma", "a"], ["wmg", "W"], ["wmg", "m"], ["wmg", "g"],
      ["dmv", "D"], ["dmv", "m"], ["dmv", "V"], ["vat", "a"], ["vat", "t"], ["pvt", "P"], ["pvt", "V"], ["pvt", "n"], ["pvt", "R"], ["pvt", "T"]];
    function symbolQuestion(params) {
      var F = FORMULAS[params[0]], key = params[1], q = Q[key], wrong = [];
      if (TWIN[key]) {
        var twin = Q[TWIN[key]];
        wrong.push({text:cap(twin.name), why:fill(p("Case matters. {tc} {ts} is {tn}, and {kc} {ks} is {kn}.", "Las mayúsculas y minúsculas importan. La {ts} {tc} es {tn}, y la {ks} {kc} es {kn}."),
          {tc:p(cap(caseWord(twin.sym)).en, caseWord(twin.sym).es), ts:twin.sym, tn:says(TWIN[key]), kc:caseWord(q.sym), ks:q.sym, kn:says(key)})});
      }
      if (LOOKALIKE[key]) wrong.push(LOOKALIKE[key]);
      F.syms.forEach(function (other) {
        if (other !== key) wrong.push({text:cap(Q[other].name), why:fill(p("In {f}, {o} stands for {on}. {s} stands for {sn}.", "En {f}, {o} representa {on}. {s} representa {sn}."),
          {f:F.f, o:Q[other].sym, on:says(other), s:q.sym, sn:says(key)})});
      });
      return {type:"mc", answer:0, prompt:fill(p("In {f}, what does {s} stand for?", "En {f}, ¿qué representa {s}?"), {f:F.f, s:q.sym}),
        choices:[{text:cap(q.name), why:p("", "")}].concat(wrong.slice(0, 3)),
        explanation:join([fill(p("In {f}, {s} stands for {sn}.", "En {f}, {s} representa {sn}."), {f:F.f, s:q.sym, sn:says(key)}), reads(params[0])])};
    }

    // Subscripts are name tags, and Δ is final minus initial.
    var TAGGED = {v:{name:p("velocity", "velocidad")}, x:{name:p("position", "posición")}, T:{name:p("temperature", "temperatura")}};
    function tagQuestion(params) {
      var s = params[0], tag = params[1], v = {s:s, q:TAGGED[s].name};
      var initial = fill(p("The initial {q}", "La {q} inicial"), v), final = fill(p("The final {q}", "La {q} final"), v);
      var change = fill(p("The change in {q}", "El cambio en la {q}"), v);
      var deltaWhy = fill(p("The change in {q} is Δ{s} = {s}<sub>f</sub> − {s}<sub>i</sub>.", "El cambio en la {q} es Δ{s} = {s}<sub>f</sub> − {s}<sub>i</sub>."), v);
      if (tag === "d") {
        return {type:"mc", answer:0, prompt:fill(p("What does Δ{s} mean?", "¿Qué significa Δ{s}?"), v),
          choices:[{text:fill(p("The final {q} minus the initial {q}", "La {q} final menos la {q} inicial"), v), why:p("", "")},
            {text:fill(p("The initial {q} minus the final {q}", "La {q} inicial menos la {q} final"), v), why:p("Δ is always final minus initial, never initial minus final.", "Δ siempre es final menos inicial, nunca inicial menos final.")},
            {text:fill(p("The final {q} plus the initial {q}", "La {q} final más la {q} inicial"), v), why:p("Δ means “change in,” so subtract. Do not add the values.", "Δ significa “cambio en”, así que resta. No sumes los valores.")},
            {text:fill(p("Δ times {s}", "Δ por {s}"), v), why:fill(p("Δ is not a number to multiply. It means “change in,” so Δ{s} is the change in {q}.", "Δ no es un número para multiplicar. Significa “cambio en”, así que Δ{s} es el cambio en la {q}."), v)}],
          explanation:fill(p("Δ means “change in,” and it is always final minus initial: Δ{s} = {s}<sub>f</sub> − {s}<sub>i</sub>.", "Δ significa “cambio en”, y siempre es final menos inicial: Δ{s} = {s}<sub>f</sub> − {s}<sub>i</sub>."), v)};
      }
      var other = tag === "i" ? "f" : "i", key = tag === "i" ? initial : final;
      var times = fill(p("{s} times {t}", "{s} por {t}"), {s:s, t:tag});
      return {type:"mc", answer:0, prompt:fill(p("What does {s}<sub>{t}</sub> mean?", "¿Qué significa {s}<sub>{t}</sub>?"), {s:s, t:tag}),
        choices:[{text:key, why:p("", "")},
          {text:tag === "i" ? final : initial, why:fill(p("The subscript {o} marks the {on} value. {t} marks the {tn} value.", "El subíndice {o} marca el valor {on}. La {t} marca el valor {tn}."),
            {o:other, t:tag, on:other === "f" ? p("final", "final") : p("initial", "inicial"), tn:tag === "f" ? p("final", "final") : p("initial", "inicial")})},
          {text:times, why:fill(p("A subscript is a name tag, not a number to multiply. {s}<sub>{t}</sub> is one quantity.", "Un subíndice es una etiqueta con nombre, no un número para multiplicar. {s}<sub>{t}</sub> es una sola cantidad."), {s:s, t:tag})},
          {text:change, why:deltaWhy}],
        explanation:fill(tag === "i" ? p("The subscript i is a name tag for initial, so {s}<sub>i</sub> is the initial {q}, its value at the start.", "El subíndice i es una etiqueta con nombre para inicial, así que {s}<sub>i</sub> es la {q} inicial, su valor al principio.") :
          p("The subscript f is a name tag for final, so {s}<sub>f</sub> is the final {q}, its value at the end.", "El subíndice f es una etiqueta con nombre para final, así que {s}<sub>f</sub> es la {q} final, su valor al final."), v)};
    }

    // Reading a formula as a sentence, both ways. Each wrong choice is a mistake the lesson names.
    var SIDE = p("Letters side by side mean multiply, not add.", "Las letras juntas significan multiplicar, no sumar.");
    var NOBAR = p("There is no fraction bar, so nothing is divided. Letters side by side mean multiply.", "No hay barra de fracción, así que nada se divide. Las letras juntas significan multiplicar.");
    var READING = {
      dvt:{words:[[p("distance equals velocity plus time", "la distancia es igual a la velocidad más el tiempo"), SIDE],
        [p("distance equals velocity divided by time", "la distancia es igual a la velocidad entre el tiempo"), NOBAR],
        [p("distance equals volume times time", "la distancia es igual al volumen por el tiempo"), p("Case matters. Lowercase v is velocity; capital V is volume.", "Las mayúsculas y minúsculas importan. La v minúscula es la velocidad; la V mayúscula es el volumen.")]],
        forms:[["d = v + t", p("A plus sign means add. Times is shown by writing the letters side by side: vt.", "El signo más significa sumar. La multiplicación se indica al escribir las letras juntas: vt.")],
          ["d = v/t", p("v/t means v divided by t. Velocity times time is written vt.", "v/t significa v entre t. La velocidad por el tiempo se escribe vt.")],
          ["D = Vt", p("Case matters. Capital D is density and capital V is volume. Distance and velocity are lowercase.", "Las mayúsculas y minúsculas importan. La D mayúscula es la densidad y la V mayúscula es el volumen. La distancia y la velocidad van en minúscula.")]]},
      fma:{words:[[p("force equals mass plus acceleration", "la fuerza es igual a la masa más la aceleración"), SIDE],
        [p("force equals mass divided by acceleration", "la fuerza es igual a la masa entre la aceleración"), NOBAR],
        [p("force equals molar mass times acceleration", "la fuerza es igual a la masa molar por la aceleración"), p("Case matters. Lowercase m is mass; capital M is molar mass.", "Las mayúsculas y minúsculas importan. La m minúscula es la masa; la M mayúscula es la masa molar.")]],
        forms:[["F = m + a", p("A plus sign means add. Mass times acceleration is written ma.", "El signo más significa sumar. La masa por la aceleración se escribe ma.")],
          ["F = m/a", p("m/a means m divided by a. Mass times acceleration is written ma.", "m/a significa m entre a. La masa por la aceleración se escribe ma.")],
          ["F = Ma", p("Case matters. Capital M is molar mass. Mass is lowercase m.", "Las mayúsculas y minúsculas importan. La M mayúscula es la masa molar. La masa es la m minúscula.")]]},
      wmg:{words:[[p("weight equals mass plus the acceleration due to gravity", "el peso es igual a la masa más la aceleración de la gravedad"), SIDE],
        [p("weight equals mass divided by the acceleration due to gravity", "el peso es igual a la masa entre la aceleración de la gravedad"), NOBAR],
        [p("weight equals mass times grams", "el peso es igual a la masa por gramos"), p("Here g is the acceleration due to gravity, 9.8 m/s², not the unit gram.", "Aquí g es la aceleración de la gravedad, 9.8 m/s², no la unidad gramo.")]],
        forms:[["W = m + g", p("A plus sign means add. Mass times g is written mg.", "El signo más significa sumar. La masa por g se escribe mg.")],
          ["W = m/g", p("m/g means m divided by g. Mass times g is written mg.", "m/g significa m entre g. La masa por g se escribe mg.")],
          ["W = Mg", p("Case matters. Capital M is molar mass. Mass is lowercase m.", "Las mayúsculas y minúsculas importan. La M mayúscula es la masa molar. La masa es la m minúscula.")]]},
      dmv:{words:[[p("density equals mass times volume", "la densidad es igual a la masa por el volumen"), p("The fraction bar means divide: m/V is m ÷ V.", "La barra de fracción significa dividir: m/V es m ÷ V.")],
        [p("density equals volume divided by mass", "la densidad es igual al volumen entre la masa"), p("m is on top, so mass is divided by volume.", "m está arriba, así que la masa se divide entre el volumen.")],
        [p("distance equals mass divided by velocity", "la distancia es igual a la masa entre la velocidad"), p("Case matters. Capital D is density and capital V is volume.", "Las mayúsculas y minúsculas importan. La D mayúscula es la densidad y la V mayúscula es el volumen.")]],
        forms:[["D = mV", p("Letters side by side mean multiply. Density divides mass by volume: m/V.", "Las letras juntas significan multiplicar. La densidad divide la masa entre el volumen: m/V.")],
          ["D = V/m", p("This is upside down. Mass goes on top: m/V.", "Está al revés. La masa va arriba: m/V.")],
          ["d = m/v", p("Case matters. Lowercase d is distance and lowercase v is velocity. Density and volume are capital D and V.", "Las mayúsculas y minúsculas importan. La d minúscula es la distancia y la v minúscula es la velocidad. La densidad y el volumen son D y V mayúsculas.")]]},
      vat:{words:[[p("final velocity equals initial velocity plus acceleration plus time", "la velocidad final es igual a la velocidad inicial más la aceleración más el tiempo"), p("Letters side by side mean multiply: at is a × t, not a + t.", "Las letras juntas significan multiplicar: at es a × t, no a + t.")],
        [p("final velocity equals initial velocity plus acceleration divided by time", "la velocidad final es igual a la velocidad inicial más la aceleración entre el tiempo"), p("There is no fraction bar. The term at means a times t.", "No hay barra de fracción. El término at significa a por t.")],
        [p("initial velocity equals final velocity plus acceleration times time", "la velocidad inicial es igual a la velocidad final más la aceleración por el tiempo"), p("The subscripts are name tags: f is final and i is initial. v<sub>f</sub> is on the left.", "Los subíndices son etiquetas con nombre: f es final e i es inicial. v<sub>f</sub> está a la izquierda.")]],
        forms:[["v<sub>f</sub> = v<sub>i</sub> + a + t", p("Letters side by side mean multiply: at is a × t, not a + t.", "Las letras juntas significan multiplicar: at es a × t, no a + t.")],
          ["v<sub>i</sub> = v<sub>f</sub> + at", p("The subscripts are swapped. The final velocity, v<sub>f</sub>, is on the left.", "Los subíndices están intercambiados. La velocidad final, v<sub>f</sub>, está a la izquierda.")],
          ["v<sub>f</sub> = (v<sub>i</sub> + a)t", p("Only a is multiplied by t. These parentheses would multiply v<sub>i</sub> by t too.", "Solo a se multiplica por t. Estos paréntesis también multiplicarían v<sub>i</sub> por t.")]]},
      pvt:{words:[[p("pressure plus volume equals moles plus the gas constant plus temperature", "la presión más el volumen es igual a los moles más la constante de los gases más la temperatura"), p("Letters side by side mean multiply. PV is P × V, and nRT is n × R × T.", "Las letras juntas significan multiplicar. PV es P × V, y nRT es n × R × T.")],
        [p("pressure divided by volume equals moles times the gas constant times temperature", "la presión entre el volumen es igual a los moles por la constante de los gases por la temperatura"), p("There is no fraction bar. PV means P times V.", "No hay barra de fracción. PV significa P por V.")],
        [p("pressure times velocity equals moles times the gas constant times time", "la presión por la velocidad es igual a los moles por la constante de los gases por el tiempo"), p("Case matters. Capital V is volume and capital T is temperature.", "Las mayúsculas y minúsculas importan. La V mayúscula es el volumen y la T mayúscula es la temperatura.")]],
        forms:[["P + V = n + R + T", p("A plus sign means add. Times is shown by writing the letters side by side: PV and nRT.", "El signo más significa sumar. La multiplicación se indica al escribir las letras juntas: PV y nRT.")],
          ["P/V = nRT", p("P/V means P divided by V. Pressure times volume is written PV.", "P/V significa P entre V. La presión por el volumen se escribe PV.")],
          ["Pv = nRt", p("Case matters. Lowercase v is velocity and lowercase t is time.", "Las mayúsculas y minúsculas importan. La v minúscula es la velocidad y la t minúscula es el tiempo.")]]}
    };
    function sentence(pair) { return p(cap(pair).en + ".", cap(pair).es + "."); }
    function readQuestion(params) {
      var key = params[0], F = FORMULAS[key], R = READING[key], explanation = join([F.why, reads(key)]);
      if (params[1] === "w") return {type:"mc", answer:0, prompt:fill(p("How do you read {f} aloud?", "¿Cómo se lee {f} en voz alta?"), {f:F.f}),
        choices:[{text:sentence(F.words), why:p("", "")}].concat(R.words.map(function (w) { return {text:sentence(w[0]), why:w[1]}; })), explanation:explanation};
      return {type:"mc", answer:0, prompt:fill(p("Which formula says “{w}”?", "¿Qué fórmula dice “{w}”?"), {w:F.words}),
        choices:[{text:same(F.f), why:p("", "")}].concat(R.forms.map(function (w) { return {text:same(w[0]), why:w[1]}; })), explanation:explanation};
    }

    // Variables and constants: g and R are the same in every problem and come from a reference sheet.
    var G_EXPLAIN = p("g is a constant: 9.8 m/s² near Earth's surface, the same in every problem. W and m are variables.", "g es una constante: 9.8 m/s² cerca de la superficie de la Tierra, igual en todos los problemas. W y m son variables.");
    var R_EXPLAIN = p("R is the gas constant. It is the same in every problem, so you look up its value on a reference sheet. P, V, n and T are variables.", "R es la constante de los gases. Es igual en todos los problemas, así que buscas su valor en una hoja de referencia. P, V, n y T son variables.");
    function constantQuestion(params) {
      var kind = params[0];
      if (kind === "wc") return {type:"mc", answer:0, prompt:p("In W = mg, which letter is a constant?", "En W = mg, ¿qué letra es una constante?"),
        choices:[{text:same("g"), why:p("", "")},
          {text:same("W"), why:p("W is the weight. It changes when the mass changes, so it is a variable.", "W es el peso. Cambia cuando cambia la masa, así que es una variable.")},
          {text:same("m"), why:p("m is the mass of the object, a measured quantity. It is a variable.", "m es la masa del objeto, una cantidad medida. Es una variable.")},
          {text:p("None of them", "Ninguna"), why:p("g is a constant: it is 9.8 m/s² in every problem near Earth's surface.", "g es una constante: vale 9.8 m/s² en todos los problemas cerca de la superficie de la Tierra.")}],
        explanation:G_EXPLAIN};
      if (kind === "rc") return {type:"mc", answer:0, prompt:p("In PV = nRT, which letter is the constant?", "En PV = nRT, ¿qué letra es la constante?"),
        choices:[{text:same("R"), why:p("", "")}].concat(params.slice(1).map(function (s) {
          return {text:same(s), why:fill(p("{s} stands for {n}, a measured quantity that changes from problem to problem.", "{s} representa {a}, una cantidad medida que cambia de un problema a otro."), {s:s, n:Q[s].name.en, a:Q[s].art})};
        })), explanation:R_EXPLAIN};
      if (kind === "gv") return {type:"mc", answer:0, prompt:p("What is g in W = mg?", "¿Qué es g en W = mg?"),
        choices:[{text:p("A constant, 9.8 m/s², from a reference sheet", "Una constante, 9.8 m/s², de una hoja de referencia"), why:p("", "")},
          {text:p("The mass of the object", "La masa del objeto"), why:p("That is m. g is the acceleration due to gravity.", "Esa es m. g es la aceleración de la gravedad.")},
          {text:p("A value you measure in each problem", "Un valor que mides en cada problema"), why:p("g is a constant. You look it up instead of measuring it.", "g es una constante. La buscas en lugar de medirla.")},
          {text:p("9.8 grams", "9.8 gramos"), why:p("Here g is not the unit gram. It is the acceleration due to gravity, 9.8 m/s².", "Aquí g no es la unidad gramo. Es la aceleración de la gravedad, 9.8 m/s².")}],
        explanation:G_EXPLAIN};
      return {type:"mc", answer:0, prompt:p("Where does the value of R in PV = nRT come from?", "¿De dónde sale el valor de R en PV = nRT?"),
        choices:[{text:p("A reference sheet. R is the same in every problem.", "De una hoja de referencia. R es igual en todos los problemas."), why:p("", "")},
          {text:p("You measure it in each experiment.", "Lo mides en cada experimento."), why:p("R is a constant. Look it up instead of measuring it.", "R es una constante. Búscala en lugar de medirla.")},
          {text:p("It is the temperature of the gas.", "Es la temperatura del gas."), why:p("Temperature is T. R is the gas constant.", "La temperatura es T. R es la constante de los gases.")},
          {text:p("It changes with the pressure.", "Cambia con la presión."), why:p("R is a constant, so it does not change from problem to problem.", "R es una constante, así que no cambia de un problema a otro.")}],
        explanation:R_EXPLAIN};
    }

    // Δ calculations: always final minus initial, and the sign says whether the quantity went up or down.
    function tenth(k) { return Math.floor(k / 10) + "." + (k % 10); }
    var DELTA = {
      T:{unit:"°C", name:p("temperature", "temperatura"), accept:["°C", "ºC", "degrees C", "degrees Celsius", "grados C", "grados Celsius"],
        text:{w:p("A beaker of water warms from {i} to {f}. What is ΔT?", "El agua de un vaso de precipitados se calienta de {i} a {f}. ¿Cuál es el valor de ΔT?"),
          c:p("A cup of tea cools from {i} to {f}. What is ΔT?", "Una taza de té se enfría de {i} a {f}. ¿Cuál es el valor de ΔT?"),
          s:p("T<sub>i</sub> = {i} and T<sub>f</sub> = {f}. What is ΔT?", "T<sub>i</sub> = {i} y T<sub>f</sub> = {f}. ¿Cuál es el valor de ΔT?")}},
      v:{unit:"m/s", name:p("velocity", "velocidad"), accept:["m/s", "m s^-1", "m·s^-1", "meters per second", "metros por segundo"],
        text:{u:p("A car speeds up from {i} to {f}. What is Δv?", "Un auto acelera de {i} a {f}. ¿Cuál es el valor de Δv?"),
          d:p("A bike slows down from {i} to {f}. What is Δv?", "Una bicicleta frena de {i} a {f}. ¿Cuál es el valor de Δv?"),
          s:p("v<sub>i</sub> = {i} and v<sub>f</sub> = {f}. What is Δv?", "v<sub>i</sub> = {i} y v<sub>f</sub> = {f}. ¿Cuál es el valor de Δv?")}},
      x:{unit:"m", name:p("position", "posición"), accept:["m", "meters", "meter", "metros", "metro"],
        text:{c:p("A cart starts at x<sub>i</sub> = {i} and stops at x<sub>f</sub> = {f}. What is Δx?", "Un carrito parte de x<sub>i</sub> = {i} y se detiene en x<sub>f</sub> = {f}. ¿Cuál es el valor de Δx?"),
          s:p("x<sub>i</sub> = {i} and x<sub>f</sub> = {f}. What is Δx?", "x<sub>i</sub> = {i} y x<sub>f</sub> = {f}. ¿Cuál es el valor de Δx?")}}
    };
    // The direction each context needs: up, down, or either.
    var DIRECTION = {w:1, c:-1, u:1, d:-1, s:0};
    var RANGE = {T:[50, 950], v:[5, 300], x:[5, 500]};
    function makeDelta(random, s) {
      var c = DELTA[s], ctx = pick(random, Object.keys(c.text)), dir = s === "x" ? 0 : DIRECTION[ctx], lo = RANGE[s][0], hi = RANGE[s][1];
      if (!dir) dir = random() < 0.5 ? 1 : -1;
      for (;;) {
        var i = int(random, lo, hi), f = int(random, lo, hi);
        if ((f - i) * dir >= 10) return [ctx, tenth(i), tenth(f)];
      }
    }
    var KEEP = p("Keep 1 decimal place, and include the sign if it is negative.", "Conserva 1 lugar decimal e incluye el signo si es negativo.");
    function deltaQuestion(s, params) {
      var c = DELTA[s], i = params[1], f = params[2], P = {decimals:1}, change = M.sub(f, i), answer = M.write(change, P, "plain"), u = c.unit;
      var values = {i:show(i) + " " + u, f:show(f) + " " + u};
      return {type:"numeric", answer:answer, precision:P, unit:u, accept:c.accept, check:{sf:"advice", unit:"optional"},
        display:answer + " " + u, answerText:same(show(answer) + " " + u), instruction:KEEP,
        traps:[{answer:M.sub(i, f), note:p("Δ is final minus initial: subtract the starting value from the ending value.", "Δ es final menos inicial: resta el valor inicial del valor final.")},
          {answer:M.add(i, f), note:p("Δ means “change in,” so subtract. Do not add the two values.", "Δ significa “cambio en”, así que resta. No sumes los dos valores.")}],
        prompt:fill(c.text[params[0]], values),
        explanation:join([fill(p("Δ{s} = {s}<sub>f</sub> − {s}<sub>i</sub> = {f} − {i} = {d}.", "Δ{s} = {s}<sub>f</sub> − {s}<sub>i</sub> = {f} − {i} = {d}."), {s:s, f:values.f, i:values.i, d:show(answer) + " " + u}),
          fill(M.sign(change) > 0 ? p("The positive sign means the {q} increased.", "El signo positivo significa que la {q} aumentó.") : p("The negative sign means the {q} decreased.", "El signo negativo significa que la {q} disminuyó."), {q:c.name})])};
    }

    // One-step substitution: put each number in place of its letter, then multiply or divide.
    // A measurement with n significant figures between lo and hi, written so its count is clear (no whole-number zeros).
    function measure(random, n, lo, hi) {
      for (;;) {
        var text = M.write((lo + random() * (hi - lo)).toFixed(6), {sf:n}, "plain");
        if (M.read(text).sf === n && Number(text) >= lo && Number(text) <= hi) return text;
      }
    }
    function sfOf(text) { return M.read(text).sf; }
    // What a calculator shows: every digit of a terminating decimal, otherwise 10 significant figures.
    function calc(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return show(M.fixed(value, -k));
      return show(M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }
    var NEWTONS = ["N", "newton", "newtons", "kg·m/s²"];
    var SUB = {
      w:{unit:"N", accept:NEWTONS, formula:"W = mg", units:["kg", "m/s²"], op:"×"},
      d:{unit:"m", accept:["m", "meters", "meter", "metros", "metro"], formula:"d = vt", units:["m/s", "s"], op:"×",
        text:p("A car drives at {a} for {b}. Use d = vt to find the distance in meters.", "Un auto avanza a {a} durante {b}. Usa d = vt para encontrar la distancia en metros.")},
      f:{unit:"N", accept:NEWTONS, formula:"F = ma", units:["kg", "m/s²"], op:"×",
        text:p("A {a} cart accelerates at {b}. Use F = ma to find the net force in newtons.", "Un carrito de {a} acelera a {b}. Usa F = ma para encontrar la fuerza neta en newtons.")},
      D:{unit:"g/mL", accept:["g/mL", "g/ml", "g mL^-1", "grams per milliliter", "gramos por mililitro"], formula:"D = m/V", units:["g", "mL"], op:"÷",
        text:p("A sample has a mass of {a} and a volume of {b}. Use D = m/V to find its density in g/mL.", "Una muestra tiene una masa de {a} y un volumen de {b}. Usa D = m/V para encontrar su densidad en g/mL.")}
    };
    var OBJECTS = {
      bp:{range:[20, 120], text:p("A backpack has a mass of {m}.", "Una mochila tiene una masa de {m}.")},
      bx:{range:[50, 600], text:p("A box has a mass of {m}.", "Una caja tiene una masa de {m}.")},
      dg:{range:[15, 60], whole:true, text:p("A large dog has a mass of {m}.", "Un perro grande tiene una masa de {m}.")}
    };
    var TIMES = p("Letters side by side mean multiply. Do not divide.", "Las letras juntas significan multiplicar. No dividas.");
    var NOT_ADD = p("Letters side by side mean multiply, not add.", "Las letras juntas significan multiplicar, no sumar.");
    function substitution(key, a, b, prompt) {
      var c = SUB[key], divide = c.op === "÷", n = Math.min(sfOf(a), sfOf(b)), P = {sf:n};
      var exact = divide ? M.div(a, b) : M.mul(a, b), answer = M.write(exact, P, "plain"), u = c.unit;
      var traps = divide ? [{answer:M.div(b, a), note:p("m is on top: divide the mass by the volume, not the volume by the mass.", "m está arriba: divide la masa entre el volumen, no el volumen entre la masa.")},
        {answer:M.mul(a, b), note:p("The fraction bar means divide. Do not multiply.", "La barra de fracción significa dividir. No multipliques.")}] :
        [{answer:M.div(a, b), note:TIMES}, {answer:M.add(a, b), note:NOT_ADD}];
      var setup = divide ? "(" + show(a) + " " + c.units[0] + ")/(" + show(b) + " " + c.units[1] + ")" : "(" + show(a) + " " + c.units[0] + ")(" + show(b) + " " + c.units[1] + ")";
      return {type:"numeric", answer:exact.n + "/" + exact.d, precision:P, unit:u, accept:c.accept, check:{sf:"advice", unit:"optional"},
        display:answer + " " + u, answerText:same(show(answer) + " " + u), traps:traps,
        instruction:fill(p("Round to {n}.", "Redondea a {n}."), {n:M.figures(n)}), prompt:prompt,
        explanation:fill(p("{f} = {setup} = {raw} {u}. To {n}, that is {ans} {u}.", "{f} = {setup} = {raw} {u}. Con {n}, eso es {ans} {u}."),
          {f:c.formula, setup:setup, raw:calc(exact), u:u, ans:show(answer), n:M.figures(n)})};
    }
    // The answer must show its significant figures in standard notation, stay below 10,000, and differ from every trap.
    function usable(q) {
      var R = M.rounded(q.answer, q.precision), plain = M.write(q.answer, q.precision, "plain");
      if (q.precision.sf < 2 || M.read(plain).sf !== q.precision.sf || M.magnitude(q.answer) > 3 || M.magnitude(q.answer) < -2) return false;
      return q.traps.every(function (t) { return M.sign(t.answer) && M.cmp(M.rounded(t.answer, q.precision).value, R.value) !== 0; });
    }
    function weightQuestion(params) {
      var o = OBJECTS[params[0]], m = params[1];
      return substitution("w", m, "9.8", join([fill(o.text, {m:show(m) + " kg"}),
        p("Use W = mg with g = 9.8 m/s² to find its weight in newtons.", "Usa W = mg con g = 9.8 m/s² para encontrar su peso en newtons.")]));
    }
    function productQuestion(params) {
      var c = SUB[params[0]];
      return substitution(params[0], params[1], params[2], fill(c.text, {a:show(params[1]) + " " + c.units[0], b:show(params[2]) + " " + c.units[1]}));
    }
    function makeWeight(random) {
      for (;;) {
        var key = pick(random, Object.keys(OBJECTS)), o = OBJECTS[key], k = int(random, o.range[0], o.range[1]);
        var m = o.whole ? String(k) : tenth(k);
        if (o.whole && k % 10 === 0) continue;
        if (usable(weightQuestion([key, m]))) return [key, m];
      }
    }
    function makeProduct(random) {
      for (;;) {
        var key = pick(random, ["d", "f"]), params;
        if (key === "d") params = [key, measure(random, int(random, 2, 3), 5, 30), measure(random, int(random, 2, 3), 2, 60)];
        else params = [key, measure(random, int(random, 2, 3), 0.5, 25), measure(random, int(random, 2, 3), 0.5, 9.5)];
        if (usable(productQuestion(params))) return params;
      }
    }
    function makeDensity(random) {
      for (;;) {
        var n = int(random, 2, 3), V = measure(random, int(random, 2, 3), 1, 50);
        var m = M.write(M.mul(V, (0.7 + random() * 18.3).toFixed(3)), {sf:n}, "plain");
        if (sfOf(m) !== n) continue;
        var params = ["D", m, V];
        if (usable(productQuestion(params))) return params;
      }
    }

    var topics = [
      {id:"symbols", title:p("Symbols and subscripts", "Símbolos y subíndices")},
      {id:"words", title:p("Formulas in words", "Fórmulas en palabras")},
      {id:"change", title:p("Change: final minus initial", "Cambio: final menos inicial")},
      {id:"substitute", title:p("One-step substitution", "Sustitución de un paso")}
    ];
    var generators = [
      {key:"sy", topic:"symbols", make:function (r) { return pick(r, SYMBOLS).slice(); }, build:symbolQuestion},
      {key:"sb", topic:"symbols", make:function (r) { return [pick(r, ["v", "x", "T"]), pick(r, ["i", "f", "d"])]; }, build:tagQuestion},
      {key:"rw", topic:"words", make:function (r) { return [pick(r, Object.keys(FORMULAS)), pick(r, ["w", "s"])]; }, build:readQuestion},
      {key:"ct", topic:"words", make:function (r) {
        var kind = pick(r, ["wc", "rc", "rc", "gv", "rv"]);
        if (kind !== "rc") return [kind];
        var drop = int(r, 0, 3);
        return ["rc"].concat(["P", "V", "n", "T"].filter(function (_, i) { return i !== drop; }));
      }, build:constantQuestion},
      {key:"dt", topic:"change", make:function (r) { return makeDelta(r, "T"); }, build:function (params) { return deltaQuestion("T", params); }},
      {key:"dv", topic:"change", make:function (r) { return makeDelta(r, "v"); }, build:function (params) { return deltaQuestion("v", params); }},
      {key:"dx", topic:"change", make:function (r) { return makeDelta(r, "x"); }, build:function (params) { return deltaQuestion("x", params); }},
      {key:"wg", topic:"substitute", make:makeWeight, build:weightQuestion},
      {key:"pr", topic:"substitute", make:makeProduct, build:productQuestion},
      {key:"dn", topic:"substitute", make:makeDensity, build:productQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/equations/reading-formulas/",
      copy:{title:"Reading Formulas Practice", es:{
        "Reading Formulas Practice":"Práctica de lectura de fórmulas",
        "Quantitative Skills · Equations":"Habilidades cuantitativas · Ecuaciones",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set is new.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie es nueva.",
        "No timer. Use scratch paper and a calculator. The formulas from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las fórmulas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "For a number, type it with a decimal point. A negative change needs its minus sign. A unit after the number is optional.":"Para un número, escríbelo con punto decimal. Un cambio negativo necesita su signo menos. La unidad después del número es opcional.",
        "The line under each question says how to round. Significant figures are a reminder here, not part of the score.":"La línea debajo de cada pregunta indica cómo redondear. Aquí las cifras significativas son un recordatorio, no forman parte de la puntuación.",
        "Submit once per question and read the feedback. Try again gives you a new set.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da una serie nueva.",
        "Type a number such as 63.0 or −8.0. You may add the unit after it.":"Escribe un número como 63.0 o −8.0. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Reading formulas":"Lectura de fórmulas",
        "Each letter stands for a measured quantity. Read a formula as a sentence: d = vt reads “distance equals velocity times time.”":"Cada letra representa una cantidad medida. Lee una fórmula como una oración: d = vt se lee “la distancia es igual a la velocidad por el tiempo”.",
        "Letters side by side mean multiply: ma = m × a and PV = P × V. The × is left out so it is not confused with x.":"Las letras juntas significan multiplicar: ma = m × a y PV = P × V. El × se omite para no confundirlo con x.",
        "A constant has the same value in every problem and comes from a reference sheet, such as g = 9.8 m/s² and R in PV = nRT.":"Una constante tiene el mismo valor en todos los problemas y sale de una hoja de referencia, como g = 9.8 m/s² y R en PV = nRT.",
        "Subscripts are name tags: i is initial and f is final. v":"Los subíndices son etiquetas con nombre: i es inicial y f es final. v",
        "is the initial velocity, not v × i.":"es la velocidad inicial, no v × i.",
        "Δ means “change in,” and it is always final minus initial: Δv = v":"Δ significa “cambio en”, y siempre es final menos inicial: Δv = v",
        ". A negative Δ means the quantity decreased.":". Un Δ negativo significa que la cantidad disminuyó.",
        "Case matters: m is mass (g) and M is molar mass (g/mol); v is velocity (m/s) and V is volume (mL).":"Las mayúsculas y minúsculas importan: m es la masa (g) y M es la masa molar (g/mol); v es la velocidad (m/s) y V es el volumen (mL).",
        "Formulas in this practice: d = vt, F = ma, W = mg, D = m/V, v":"Fórmulas de esta práctica: d = vt, F = ma, W = mg, D = m/V, v",
        "Practice for the Reading Formulas lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Lectura de fórmulas de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
