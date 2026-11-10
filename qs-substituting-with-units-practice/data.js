(function () {
  "use strict";
  // Substituting with Units Practice: generated questions for the Quantitative Skills lesson Substituting with Units.
  // The ideas follow the lesson on zornscience.org: substitute each value with its unit; units multiply, divide and
  // cancel like letters; N = kg·m/s² and J = N·m (= kg·m²/s²); convert to kg, m and s before substituting
  // (425 g × (1 kg / 1000 g), 85 cm × (1 m / 100 cm)); predict the answer's unit, then check it (t = d/v gives s,
  // t = v/d gives 1/s, a wrong setup); and K = °C + 273. The unit is part of the skill, so it must be typed on the
  // calculation questions. Significant figures are advice only, with the count named under the question.
  var SLUG = "qs-substituting-with-units-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    function same(text) { return p(text, text); }
    var int = M.int, pick = M.pick, show = M.pretty;
    var BLANK = p("", "");
    var R = "0.0821 L·atm/(mol·K)";
    // Kinetic energy is KE in English and EC (energía cinética) in Spanish.
    var KE = p("KE", "EC");

    function tenth(k) { return Math.floor(k / 10) + "." + (k % 10); }
    // A measurement with n significant figures between lo and hi, written so its count is clear (no whole-number zeros).
    function measure(random, n, lo, hi) {
      for (;;) {
        var text = M.write((lo + random() * (hi - lo)).toFixed(6), {sf:n}, "plain");
        if (M.read(text).sf === n && Number(text) >= lo && Number(text) <= hi) return text;
      }
    }
    // A whole number of grams with 3 significant figures (its last digit is not zero).
    function grams(random, lo, hi) { for (;;) { var k = int(random, lo, hi); if (k % 10) return String(k); } }
    // A Celsius reading written with .0 and its kelvin value, K = °C + 273 (never a multiple of 10, so its figures are clear).
    function celsius(random) { for (;;) { var c = int(random, 5, 100); if ((c + 273) % 10) return c + ".0"; } }
    function kelvin(c) { return String(Math.round(Number(c)) + 273); }
    function sfOf(text) { return M.read(text).sf; }
    function decimalsOf(text) { var i = text.indexOf("."); return i < 0 ? 0 : text.length - i - 1; }
    // g to kg and cm to m, keeping every significant figure: 425 g is 0.425 kg, 85.0 cm is 0.850 m.
    function toKg(g) { return M.fixed(M.div(g, "1000"), -(decimalsOf(g) + 3)); }
    function toM(cm) { return M.fixed(M.div(cm, "100"), -(decimalsOf(cm) + 2)); }
    function calc(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return show(M.fixed(value, -k));
      return show(M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }

    // The unit a substitution leaves. Each wrong choice is a slip in multiplying, dividing or cancelling units.
    var LEFT = {
      dt:{setup:function (a, b) { return same("d = vt = (" + a + " m/s)(" + b + " s)"); }, key:same("m"),
        wrong:[[same("m/s"), p("Multiplying by s cancels the s on the bottom of m/s.", "Al multiplicar por s se cancela la s que está abajo en m/s.")],
          [same("m·s"), p("The s in m/s is on the bottom, so it cancels the s you multiply by. It does not stay.", "La s de m/s está abajo, así que se cancela con la s que multiplicas. No se queda.")],
          [same("s"), p("The m stays on top. It is the s that cancels.", "La m se queda arriba. La que se cancela es la s.")]],
        why:p("The s on the bottom of m/s cancels the s on top: (m/s)(s) = m.", "La s de abajo en m/s se cancela con la s de arriba: (m/s)(s) = m.")},
      vd:{setup:function (a, b) { return same("v = d/t = (" + a + " m)/(" + b + " s)"); }, key:same("m/s"),
        wrong:[[same("s/m"), p("Distance is on top, so m is on top and s is on the bottom.", "La distancia va arriba, así que m queda arriba y s abajo.")],
          [same("m·s"), p("Dividing by s puts s on the bottom: m/s.", "Dividir entre s pone la s abajo: m/s.")],
          [same("m"), p("Nothing cancels the s, so it stays on the bottom: m/s.", "Nada cancela la s, así que se queda abajo: m/s.")]],
        why:p("m is on top and s is on the bottom, and nothing cancels, so the unit is m/s.", "m queda arriba y s abajo, y nada se cancela, así que la unidad es m/s.")},
      fa:{setup:function (a, b) { return same("F = ma = (" + a + " kg)(" + b + " m/s²)"); }, key:p("kg·m/s², which is a newton (N)", "kg·m/s², que es un newton (N)"),
        wrong:[[same("kg·m/s"), p("The s² in m/s² stays squared: kg × m/s² = kg·m/s².", "La s² de m/s² sigue al cuadrado: kg × m/s² = kg·m/s².")],
          [same("kg/s²"), p("Keep the m: kg × m/s² = kg·m/s².", "Conserva la m: kg × m/s² = kg·m/s².")],
          [p("kg·m²/s², which is a joule (J)", "kg·m²/s², que es un joule (J)"), p("There is only one m here. A joule is N·m, which is kg·m²/s².", "Aquí solo hay una m. Un joule es N·m, que es kg·m²/s².")]],
        why:p("The units multiply: kg × m/s² = kg·m/s², which is the newton (N).", "Las unidades se multiplican: kg × m/s² = kg·m/s², que es el newton (N).")},
      wf:{setup:function (a, b) { return same("W = Fd = (" + a + " N)(" + b + " m)"); }, key:p("N·m, which is a joule (J)", "N·m, que es un joule (J)"),
        wrong:[[same("N/m"), p("W = Fd multiplies, so the units multiply: N × m = N·m.", "W = Fd multiplica, así que las unidades se multiplican: N × m = N·m.")],
          [same("N"), p("The m does not cancel. N × m = N·m.", "La m no se cancela. N × m = N·m.")],
          [p("kg·m/s², which is a newton (N)", "kg·m/s², que es un newton (N)"), p("That is the unit of force alone. Multiplying by m gives N·m, a joule.", "Esa es solo la unidad de fuerza. Al multiplicar por m da N·m, un joule.")]],
        why:p("The units multiply: N × m = N·m, which is the joule (J).", "Las unidades se multiplican: N × m = N·m, que es el joule (J).")},
      dm:{setup:function (a, b) { return same("D = m/V = (" + a + " g)/(" + b + " mL)"); }, key:same("g/mL"),
        wrong:[[same("mL/g"), p("This is upside down. Mass is on top, so g is on top: g/mL.", "Está al revés. La masa va arriba, así que g queda arriba: g/mL.")],
          [same("g·mL"), p("The fraction bar means divide: g ÷ mL = g/mL.", "La barra de fracción significa dividir: g ÷ mL = g/mL.")],
          [same("g"), p("mL does not cancel. It stays on the bottom: g/mL.", "mL no se cancela. Se queda abajo: g/mL.")]],
        why:p("g is on top and mL is on the bottom, so the unit is g/mL.", "g queda arriba y mL abajo, así que la unidad es g/mL.")},
      md:{setup:function (a, b) { return same("m = DV = (" + a + " g/mL)(" + b + " mL)"); }, key:same("g"),
        wrong:[[same("g/mL"), p("Multiplying by mL cancels the mL on the bottom of g/mL.", "Al multiplicar por mL se cancela el mL de abajo en g/mL.")],
          [same("g·mL"), p("The mL in g/mL is on the bottom, so it cancels the mL on top.", "El mL de g/mL está abajo, así que se cancela con el mL de arriba.")],
          [same("mL"), p("The g stays. It is the mL that cancels.", "La g se queda. El que se cancela es el mL.")]],
        why:p("The mL on top cancels the mL on the bottom of g/mL, so only g is left.", "El mL de arriba se cancela con el mL de abajo en g/mL, así que solo queda g.")},
      ke:{setup:function (a, b) { return fill(p("{k} = ½mv<sup>2</sup> = ½({a} kg)({b} m/s)<sup>2</sup>", "{k} = ½mv<sup>2</sup> = ½({a} kg)({b} m/s)<sup>2</sup>"), {k:KE, a:a, b:b}); },
        key:p("kg·m²/s², which is a joule (J)", "kg·m²/s², que es un joule (J)"),
        wrong:[[same("kg·m/s"), p("Square the whole unit: (m/s)² = m²/s².", "Eleva al cuadrado toda la unidad: (m/s)² = m²/s².")],
          [same("kg·m²/s"), p("The s is squared too: (m/s)² = m²/s².", "La s también se eleva al cuadrado: (m/s)² = m²/s².")],
          [p("kg·m/s², which is a newton (N)", "kg·m/s², que es un newton (N)"), p("(m/s)² squares the m as well: m²/s², not m/s².", "(m/s)² también eleva al cuadrado la m: m²/s², no m/s².")]],
        why:p("Square the whole unit: (m/s)² = m²/s². Then kg × m²/s² = kg·m²/s², which is the joule (J).", "Eleva al cuadrado toda la unidad: (m/s)² = m²/s². Luego kg × m²/s² = kg·m²/s², que es el joule (J).")},
      gp:{setup:function (a, b, c) { return same("P = nRT/V = (" + a + " mol)(" + R + ")(" + b + " K)/(" + c + " L)"); }, key:same("atm"),
        wrong:[[same("L·atm"), p("Dividing by V in L cancels the L in R.", "Dividir entre V en L cancela la L de R.")],
          [same("atm/K"), p("The K in T cancels the K in R.", "La K de T cancela la K de R.")],
          [same("mol·atm"), p("The mol in n cancels the mol in R.", "El mol de n cancela el mol de R.")]],
        why:p("mol cancels mol, K cancels K, and L cancels L, so only atm is left.", "mol se cancela con mol, K con K y L con L, así que solo queda atm.")}
    };
    var LEFT_NUMBERS = {
      dt:function (r) { return [measure(r, 2, 1.5, 30), measure(r, 2, 2, 60)]; },
      vd:function (r) { return [measure(r, 3, 10, 500), measure(r, 3, 2, 90)]; },
      fa:function (r) { return [measure(r, 2, 0.5, 25), measure(r, 2, 0.5, 9.5)]; },
      wf:function (r) { return [measure(r, 3, 1, 50), measure(r, 3, 0.2, 9.9)]; },
      dm:function (r) { return [measure(r, 3, 5, 300), measure(r, 3, 2, 90)]; },
      md:function (r) { return [measure(r, 3, 0.7, 19), measure(r, 3, 2, 90)]; },
      ke:function (r) { return [measure(r, 3, 0.05, 2), measure(r, 3, 2, 40)]; },
      gp:function (r) { return [measure(r, 3, 0.1, 2), kelvin(celsius(r)), measure(r, 3, 1, 50)]; }
    };
    function leftQuestion(params) {
      var L = LEFT[params[0]];
      return {type:"mc", answer:0, prompt:join([p("What unit does this substitution leave?", "¿Qué unidad deja esta sustitución?"), L.setup(show(params[1]), show(params[2]), params[3] && show(params[3]))]),
        choices:[{text:L.key, why:BLANK}].concat(L.wrong.map(function (w) { return {text:w[0], why:w[1]}; })), explanation:L.why};
    }

    // Named units, and the kelvin step before a gas law.
    var NAMED = {
      n1:{prompt:p("kg·m/s² is the same as which unit?", "¿A qué unidad equivale kg·m/s²?"), key:same("N (newton)"),
        wrong:[[same("J (joule)"), p("A joule is N·m = kg·m²/s², with m².", "Un joule es N·m = kg·m²/s², con m².")],
          [p("kg (kilogram)", "kg (kilogramo)"), p("kg is mass. Mass times m/s² is a force, the newton.", "kg es masa. La masa por m/s² es una fuerza, el newton.")],
          [p("m/s² (acceleration)", "m/s² (aceleración)"), p("m/s² is acceleration. Multiplying it by kg makes a force, the newton.", "m/s² es aceleración. Al multiplicarla por kg se obtiene una fuerza, el newton.")]],
        why:p("A newton is the force that gives 1 kg an acceleration of 1 m/s², so N = kg·m/s².", "Un newton es la fuerza que le da a 1 kg una aceleración de 1 m/s², así que N = kg·m/s².")},
      n2:{prompt:p("N·m is the same as which unit?", "¿A qué unidad equivale N·m?"), key:same("J (joule)"),
        wrong:[[same("N (newton)"), p("N·m is a newton times a meter, which is a joule.", "N·m es un newton por un metro, que es un joule.")],
          [same("kg·m/s²"), p("kg·m/s² is a newton. N·m is a joule, kg·m²/s².", "kg·m/s² es un newton. N·m es un joule, kg·m²/s².")],
          [p("m (meter)", "m (metro)"), p("The N does not cancel. N·m is a joule.", "El N no se cancela. N·m es un joule.")]],
        why:p("Work is force times distance, so J = N·m.", "El trabajo es fuerza por distancia, así que J = N·m.")},
      n3:{prompt:p("kg·m²/s² is the same as which unit?", "¿A qué unidad equivale kg·m²/s²?"), key:same("J (joule)"),
        wrong:[[same("N (newton)"), p("A newton is kg·m/s², with only one m.", "Un newton es kg·m/s², con una sola m.")],
          [same("N/m"), p("kg·m²/s² is N × m, not N ÷ m.", "kg·m²/s² es N × m, no N ÷ m.")],
          [same("m²/s²"), p("The kg is still there: kg·m²/s² is a joule.", "El kg sigue ahí: kg·m²/s² es un joule.")]],
        why:p("kg·m²/s² is (kg·m/s²) × m, which is N·m, the joule (J).", "kg·m²/s² es (kg·m/s²) × m, que es N·m, el joule (J).")},
      n4:{prompt:p("A newton (N) is the same as which units?", "¿A qué unidades equivale un newton (N)?"), key:same("kg·m/s²"),
        wrong:[[same("kg·m²/s²"), p("That is a joule, N·m.", "Eso es un joule, N·m.")],
          [same("kg·m/s"), p("The s is squared: N = kg·m/s².", "La s va al cuadrado: N = kg·m/s².")],
          [same("kg·s²/m"), p("m is on top and s² is on the bottom: kg·m/s².", "m va arriba y s² abajo: kg·m/s².")]],
        why:p("F = ma, so a newton is kg × m/s² = kg·m/s².", "F = ma, así que un newton es kg × m/s² = kg·m/s².")},
      n5:{prompt:p("A joule (J) is the same as which units?", "¿A qué unidades equivale un joule (J)?"), key:same("N·m"),
        wrong:[[same("N/m"), p("J = N × m, not N ÷ m.", "J = N × m, no N ÷ m.")],
          [same("kg·m/s²"), p("That is a newton, a force. A joule is N·m.", "Eso es un newton, una fuerza. Un joule es N·m.")],
          [same("N·s"), p("Work is force times distance, so J = N·m.", "El trabajo es fuerza por distancia, así que J = N·m.")]],
        why:p("W = Fd, so a joule is N × m = N·m.", "W = Fd, así que un joule es N × m = N·m.")}
    };
    function namedQuestion(params) {
      if (params[0] === "k") {
        var c = params[1], K = kelvin(c), whole = String(Math.round(Number(c)));
        return {type:"mc", answer:0, prompt:fill(p("A gas is at {t}. Before you substitute into PV = nRT, what do you do with the temperature?", "Un gas está a {t}. Antes de sustituir en PV = nRT, ¿qué haces con la temperatura?"), {t:show(c) + " °C"}),
          choices:[{text:fill(p("Change it to kelvin: {c} + 273 = {k} K", "Cámbiala a kelvin: {c} + 273 = {k} K"), {c:show(c), k:K}), why:BLANK},
            {text:fill(p("Use it as it is: {c} °C", "Úsala tal como está: {c} °C"), {c:show(c)}), why:p("R uses kelvin, so °C would not cancel the K in R. K = °C + 273.", "R usa kelvin, así que °C no cancelaría la K de R. K = °C + 273.")},
            {text:fill(p("Change it to kelvin: {c} − 273 = {k} K", "Cámbiala a kelvin: {c} − 273 = {k} K"), {c:show(c), k:show(String(Number(whole) - 273))}), why:p("K = °C + 273, so add 273. A kelvin temperature is never negative.", "K = °C + 273, así que suma 273. Una temperatura en kelvin nunca es negativa.")},
            {text:fill(p("Change it to kelvin: {c} × 273 = {k} K", "Cámbiala a kelvin: {c} × 273 = {k} K"), {c:show(c), k:show(String(Number(whole) * 273))}), why:p("K = °C + 273: add 273, do not multiply.", "K = °C + 273: suma 273, no multipliques.")}],
          explanation:fill(p("R = 0.0821 L·atm/(mol·K) uses kelvin, so change the temperature first: K = °C + 273 = {c} + 273 = {k} K.", "R = 0.0821 L·atm/(mol·K) usa kelvin, así que primero cambia la temperatura: K = °C + 273 = {c} + 273 = {k} K."), {c:show(c), k:K})};
      }
      var N = NAMED[params[0]];
      return {type:"mc", answer:0, prompt:N.prompt, choices:[{text:N.key, why:BLANK}].concat(N.wrong.map(function (w) { return {text:w[0], why:w[1]}; })), explanation:N.why};
    }

    // The conversion factor to use before substituting: the unit to cancel goes on the bottom.
    function factorQuestion(params) {
      var kind = params[0], v = params[1];
      if (kind === "g") return {type:"mc", answer:0, prompt:fill(p("Which factor changes {v} to kilograms before you substitute?", "¿Qué factor convierte {v} a kilogramos antes de sustituir?"), {v:show(v) + " g"}),
        choices:[{text:same("(1 kg / 1000 g)"), why:BLANK},
          {text:same("(1000 g / 1 kg)"), why:p("This is upside down. The g must be on the bottom to cancel the g you start with.", "Está al revés. Los g deben ir abajo para cancelar los g con los que empiezas.")},
          {text:same("(1 kg / 100 g)"), why:p("1 kg = 1000 g, not 100 g.", "1 kg = 1000 g, no 100 g.")},
          {text:same("(1000 kg / 1 g)"), why:p("This factor is not true: 1 kg = 1000 g.", "Este factor no es verdadero: 1 kg = 1000 g.")}],
        explanation:fill(p("{v} g × (1 kg / 1000 g) = {k} kg. The g cancels, leaving kg.", "{v} g × (1 kg / 1000 g) = {k} kg. Los g se cancelan y queda kg."), {v:show(v), k:toKg(v)})};
      return {type:"mc", answer:0, prompt:fill(p("Which factor changes {v} to meters before you substitute?", "¿Qué factor convierte {v} a metros antes de sustituir?"), {v:show(v) + " cm"}),
        choices:[{text:same("(1 m / 100 cm)"), why:BLANK},
          {text:same("(100 cm / 1 m)"), why:p("This is upside down. The cm must be on the bottom to cancel the cm you start with.", "Está al revés. Los cm deben ir abajo para cancelar los cm con los que empiezas.")},
          {text:same("(1 m / 1000 cm)"), why:p("1 m = 100 cm, not 1000 cm.", "1 m = 100 cm, no 1000 cm.")},
          {text:same("(100 m / 1 cm)"), why:p("This factor is not true: 1 m = 100 cm.", "Este factor no es verdadero: 1 m = 100 cm.")}],
        explanation:fill(p("{v} cm × (1 m / 100 cm) = {m} m. The cm cancels, leaving m.", "{v} cm × (1 m / 100 cm) = {m} m. Los cm se cancelan y queda m."), {v:show(v), m:toM(v)})};
    }

    // Which setup gives the target unit: the right one converts first and puts each value in its place.
    function setupQuestion(params) {
      var kind = params[0], a = params[1], b = params[2], prompt, key, wrong, why;
      var NOT_CONVERTED = function (unit, from, to) {
        return fill(p("This gives {u}. Convert {f} to {t} before you substitute.", "Esto da {u}. Convierte {f} a {t} antes de sustituir."), {u:unit, f:from, t:to});
      };
      if (kind === "v") {
        var dm = toM(a), d = show(a) + " cm", t = show(b) + " s";
        prompt = fill(p("A toy car rolls {d} in {t}. Which setup gives its average speed in m/s?", "Un carrito de juguete recorre {d} en {t}. ¿Qué planteamiento da su rapidez promedio en m/s?"), {d:d, t:t});
        key = "v = (" + show(dm) + " m)/(" + t + ")";
        wrong = [["v = (" + d + ")/(" + t + ")", NOT_CONVERTED("cm/s", d, show(dm) + " m")],
          ["v = (" + t + ")/(" + show(dm) + " m)", p("This leaves s/m. Distance goes on top: v = d/t.", "Esto deja s/m. La distancia va arriba: v = d/t.")],
          ["v = (" + show(dm) + " m)(" + t + ")", p("This leaves m·s. Divide distance by time.", "Esto deja m·s. Divide la distancia entre el tiempo.")]];
        why = fill(p("Convert first: {d} × (1 m / 100 cm) = {m} m. Then v = d/t = {k} leaves m/s.", "Convierte primero: {d} × (1 m / 100 cm) = {m} m. Luego v = d/t = {k} deja m/s."), {d:d, m:show(dm), k:key.slice(4)});
      } else if (kind === "t") {
        var dm2 = toM(a), d2 = show(a) + " cm", v = show(b) + " m/s";
        prompt = fill(p("A ball rolls {d} at {v}. Which setup gives the time in seconds?", "Una pelota rueda {d} a {v}. ¿Qué planteamiento da el tiempo en segundos?"), {d:d2, v:v});
        key = "t = (" + show(dm2) + " m)/(" + v + ")";
        wrong = [["t = (" + d2 + ")/(" + v + ")", p("cm and m do not cancel. Convert " + d2 + " to " + show(dm2) + " m first.", "cm y m no se cancelan. Primero convierte " + d2 + " a " + show(dm2) + " m.")],
          ["t = (" + v + ")/(" + show(dm2) + " m)", p("This leaves 1/s, not s. Distance goes on top: t = d/v.", "Esto deja 1/s, no s. La distancia va arriba: t = d/v.")],
          ["t = (" + show(dm2) + " m)(" + v + ")", p("This leaves m²/s, not s. Divide distance by velocity.", "Esto deja m²/s, no s. Divide la distancia entre la velocidad.")]];
        why = fill(p("Convert first: {d} × (1 m / 100 cm) = {m} m. Then t = d/v = {k} gives m ÷ (m/s) = s.", "Convierte primero: {d} × (1 m / 100 cm) = {m} m. Luego t = d/v = {k} da m ÷ (m/s) = s."), {d:d2, m:show(dm2), k:key.slice(4)});
      } else if (kind === "f") {
        var kg = toKg(a), g = show(a) + " g", acc = show(b) + " m/s²";
        prompt = fill(p("A {m} cart accelerates at {a}. Which setup gives the net force in newtons?", "Un carrito de {m} acelera a {a}. ¿Qué planteamiento da la fuerza neta en newtons?"), {m:g, a:acc});
        key = "F = (" + show(kg) + " kg)(" + acc + ")";
        wrong = [["F = (" + g + ")(" + acc + ")", p("This gives g·m/s², not N. A newton uses kg, so convert " + g + " to " + show(kg) + " kg first.", "Esto da g·m/s², no N. Un newton usa kg, así que primero convierte " + g + " a " + show(kg) + " kg.")],
          ["F = (" + show(kg) + " kg)/(" + acc + ")", p("This leaves kg·s²/m. F = ma multiplies.", "Esto deja kg·s²/m. F = ma multiplica.")],
          ["F = (" + acc + ")/(" + show(kg) + " kg)", p("This leaves m/(kg·s²). F = ma multiplies mass by acceleration.", "Esto deja m/(kg·s²). F = ma multiplica la masa por la aceleración.")]];
        why = fill(p("Convert first: {g} × (1 kg / 1000 g) = {kg} kg. Then F = ma = {k} leaves kg·m/s², which is N.", "Convierte primero: {g} × (1 kg / 1000 g) = {kg} kg. Luego F = ma = {k} deja kg·m/s², que es N."), {g:g, kg:show(kg), k:key.slice(4)});
      } else if (kind === "w") {
        var dm3 = toM(b), F = show(a) + " N", d3 = show(b) + " cm";
        prompt = fill(p("A {F} force pushes a box {d}. Which setup gives the work in joules?", "Una fuerza de {F} empuja una caja {d}. ¿Qué planteamiento da el trabajo en joules?"), {F:F, d:d3});
        key = "W = (" + F + ")(" + show(dm3) + " m)";
        wrong = [["W = (" + F + ")(" + d3 + ")", p("This gives N·cm, not J. A joule is N·m, so convert " + d3 + " to " + show(dm3) + " m first.", "Esto da N·cm, no J. Un joule es N·m, así que primero convierte " + d3 + " a " + show(dm3) + " m.")],
          ["W = (" + F + ")/(" + show(dm3) + " m)", p("This leaves N/m. W = Fd multiplies.", "Esto deja N/m. W = Fd multiplica.")],
          ["W = (" + show(dm3) + " m)/(" + F + ")", p("This leaves m/N. W = Fd multiplies force by distance.", "Esto deja m/N. W = Fd multiplica la fuerza por la distancia.")]];
        why = fill(p("Convert first: {d} × (1 m / 100 cm) = {m} m. Then W = Fd = {k} leaves N·m, which is J.", "Convierte primero: {d} × (1 m / 100 cm) = {m} m. Luego W = Fd = {k} deja N·m, que es J."), {d:d3, m:show(dm3), k:key.slice(4)});
      } else if (kind === "k") {
        var kg2 = toKg(a), g2 = show(a) + " g", sp = show(b) + " m/s";
        var right = "½(" + show(kg2) + " kg)(" + sp + ")<sup>2</sup>";
        prompt = fill(p("A {m} ball moves at {v}. Which setup gives its kinetic energy in joules?", "Una pelota de {m} se mueve a {v}. ¿Qué planteamiento da su energía cinética en joules?"), {m:g2, v:sp});
        var eq = function (text) { return fill(p("{k} = " + text, "{k} = " + text), {k:KE}); };
        return {type:"mc", answer:0, prompt:prompt,
          choices:[{text:eq(right), why:BLANK},
            {text:eq("½(" + g2 + ")(" + sp + ")<sup>2</sup>"), why:p("This gives g·m²/s², not J. Convert " + g2 + " to " + show(kg2) + " kg first.", "Esto da g·m²/s², no J. Primero convierte " + g2 + " a " + show(kg2) + " kg.")},
            {text:eq("½(" + show(kg2) + " kg)(" + sp + ")"), why:p("This leaves kg·m/s. Square the speed: (m/s)² = m²/s².", "Esto deja kg·m/s. Eleva al cuadrado la rapidez: (m/s)² = m²/s².")},
            {text:eq("½(" + show(kg2) + " kg)<sup>2</sup>(" + sp + ")"), why:p("This leaves kg²·m/s. Only v is squared.", "Esto deja kg²·m/s. Solo v se eleva al cuadrado.")}],
          explanation:fill(p("Convert first: {g} × (1 kg / 1000 g) = {kg} kg. Then {k} = ½mv<sup>2</sup> = {r} leaves kg·m²/s², which is J.", "Convierte primero: {g} × (1 kg / 1000 g) = {kg} kg. Luego {k} = ½mv<sup>2</sup> = {r} deja kg·m²/s², que es J."), {g:g2, kg:show(kg2), k:KE, r:right})};
      } else {
        var c = params[3], K = kelvin(c), n = show(a) + " mol", V = show(b) + " L", nR = "(" + n + ")(" + R + ")";
        prompt = fill(p("A {V} container holds {n} of gas at {T}. Which setup gives the pressure in atm? Use R = {R}.", "Un recipiente de {V} contiene {n} de gas a {T}. ¿Qué planteamiento da la presión en atm? Usa R = {R}."), {V:V, n:n, T:show(c) + " °C", R:R});
        key = "P = " + nR + "(" + K + " K)/(" + V + ")";
        wrong = [["P = " + nR + "(" + show(c) + " °C)/(" + V + ")", p("°C does not cancel the K in R. Change to kelvin first: K = °C + 273.", "°C no cancela la K de R. Primero cambia a kelvin: K = °C + 273.")],
          ["P = (" + V + ")/[" + nR + "(" + K + " K)]", p("This leaves 1/atm. V goes on the bottom: P = nRT/V.", "Esto deja 1/atm. V va abajo: P = nRT/V.")],
          ["P = " + nR + "(" + K + " K)(" + V + ")", p("This leaves L²·atm. Divide by V.", "Esto deja L²·atm. Divide entre V.")]];
        why = fill(p("Change to kelvin first: {c} + 273 = {k} K. Then in P = nRT/V, mol, K and L cancel, leaving atm.", "Primero cambia a kelvin: {c} + 273 = {k} K. Luego en P = nRT/V, mol, K y L se cancelan, y queda atm."), {c:show(c), k:K});
      }
      return {type:"mc", answer:0, prompt:prompt, choices:[{text:same(key), why:BLANK}].concat(wrong.map(function (w) { return {text:same(w[0]), why:w[1]}; })), explanation:why};
    }
    function makeSetup(random) {
      var kind = pick(random, ["v", "t", "f", "w", "k", "p"]);
      if (kind === "v") return [kind, tenth(int(random, 100, 999)), measure(random, 3, 1, 9.9)];
      if (kind === "t") return [kind, tenth(int(random, 100, 999)), measure(random, 3, 0.2, 2)];
      if (kind === "f") return [kind, grams(random, 105, 995), measure(random, 3, 0.5, 9.9)];
      if (kind === "w") return [kind, measure(random, 3, 1, 50), tenth(int(random, 100, 999))];
      if (kind === "k") return [kind, grams(random, 105, 995), measure(random, 3, 2, 40)];
      return [kind, measure(random, 3, 0.1, 2), measure(random, 3, 1, 50), celsius(random)];
    }

    // Predict the unit, then check the setup (t = d/v gives s; t = v/d gives 1/s, a wrong setup).
    var CHECKS = {
      td:{qty:p("time", "tiempo"), want:p("the time", "el tiempo"), wantUnit:"s", f:"t = d/v", units:["m", "m/s"], R:"s", O:"1/s", right:true, work:"m ÷ (m/s) = m × s/m = s"},
      tv:{qty:p("time", "tiempo"), want:p("the time", "el tiempo"), wantUnit:"s", f:"t = v/d", units:["m/s", "m"], R:"1/s", O:"s", right:false, work:"(m/s) ÷ m = 1/s", fix:"t = d/v"},
      vd:{qty:p("speed", "rapidez"), want:p("the average speed", "la rapidez promedio"), wantUnit:"m/s", f:"v = d/t", units:["m", "s"], R:"m/s", O:"s/m", right:true, work:"m ÷ s = m/s"},
      vt:{qty:p("speed", "rapidez"), want:p("the average speed", "la rapidez promedio"), wantUnit:"m/s", f:"v = t/d", units:["s", "m"], R:"s/m", O:"m/s", right:false, work:"s ÷ m = s/m", fix:"v = d/t"},
      dm:{qty:p("density", "densidad"), want:p("the density", "la densidad"), wantUnit:"g/mL", f:"D = m/V", units:["g", "mL"], R:"g/mL", O:"mL/g", right:true, work:"g ÷ mL = g/mL"},
      dv:{qty:p("density", "densidad"), want:p("the density", "la densidad"), wantUnit:"g/mL", f:"D = V/m", units:["mL", "g"], R:"mL/g", O:"g/mL", right:false, work:"mL ÷ g = mL/g", fix:"D = m/V"}
    };
    function verdict(unit, right) { return fill(right ? p("{u}, so the setup is right", "{u}, así que el planteamiento es correcto") : p("{u}, so the setup is wrong", "{u}, así que el planteamiento es incorrecto"), {u:unit}); }
    function checkQuestion(params) {
      var C = CHECKS[params[0]], setup = C.f + " = (" + show(params[1]) + " " + C.units[0] + ")/(" + show(params[2]) + " " + C.units[1] + ")";
      var v = {qty:C.qty, R:C.R, W:C.wantUnit, work:C.work};
      return {type:"mc", answer:0,
        prompt:fill(p("To find {want}, a student writes {s}. Predict the unit. Is the setup right?", "Para encontrar {want}, un estudiante escribe {s}. Predice la unidad. ¿Es correcto el planteamiento?"), {want:C.want, s:setup}),
        choices:[{text:verdict(C.R, C.right), why:BLANK},
          {text:verdict(C.R, !C.right), why:fill(C.right ? p("{R} is the unit of {qty}, so the setup checks out.", "{R} es la unidad de {qty}, así que el planteamiento es correcto.") :
            p("{R} is not a unit of {qty}, which needs {W}, so the setup is wrong.", "{R} no es una unidad de {qty}, que necesita {W}, así que el planteamiento es incorrecto."), v)},
          {text:verdict(C.O, C.right), why:fill(p("Work the units: {work}, not {O}.", "Calcula las unidades: {work}, no {O}."), {work:C.work, O:C.O})},
          {text:verdict(C.O, !C.right), why:fill(p("Work the units: {work}. Then compare it with {W}, the unit of {qty}.", "Calcula las unidades: {work}. Luego compara el resultado con {W}, la unidad de {qty}."), v)}],
        explanation:fill(C.right ? p("Predict the unit: {work}. That is the unit of {qty}, so the setup is right.", "Predice la unidad: {work}. Esa es la unidad de {qty}, así que el planteamiento es correcto.") :
          p("Predict the unit: {work}. The unit of {qty} is {W}, so the setup is wrong. Use {fix}.", "Predice la unidad: {work}. La unidad de {qty} es {W}, así que el planteamiento es incorrecto. Usa {fix}."),
          {work:C.work, qty:C.qty, W:C.wantUnit, fix:C.fix})};
    }

    // Numeric answers with the unit typed. Each value goes in with its unit; units cancel like letters.
    var UNITS = {
      "m/s":["m/s", "m s^-1", "m·s^-1", "meters per second", "metros por segundo"],
      m:["m", "meters", "meter", "metres", "metros", "metro"],
      "g/mL":["g/mL", "g/ml", "g mL^-1", "g/cm³", "grams per milliliter", "gramos por mililitro"],
      N:["N", "newton", "newtons", "kg·m/s²"],
      J:["J", "joule", "joules", "N·m", "Nm", "kg·m²/s²"],
      atm:["atm", "atmosphere", "atmospheres", "atmósfera", "atmósferas"]
    };
    var TYPE_UNIT = p("Type the unit after the number.", "Escribe la unidad después del número.");
    function withUnit(o) {
      var P = {sf:o.n}, answer = M.write(o.exact, P, "plain");
      return {type:"numeric", answer:o.exact.n + "/" + o.exact.d, precision:P, unit:o.unit, accept:UNITS[o.unit], check:{sf:"advice", unit:"required"},
        display:answer + " " + o.unit, answerText:same(show(answer) + " " + o.unit), traps:o.traps,
        instruction:join([fill(p("Round to {n}.", "Redondea a {n}."), {n:M.figures(o.n)}), TYPE_UNIT]), prompt:o.prompt,
        explanation:join(o.first.concat([fill(o.first.length ? p("Then {sub} = {raw} {u}.", "Luego {sub} = {raw} {u}.") : p("{sub} = {raw} {u}.", "{sub} = {raw} {u}."), {sub:o.sub, raw:calc(o.exact), u:o.unit}),
          o.units, fill(p("To {n}, that is {ans} {u}.", "Con {n}, eso es {ans} {u}."), {n:M.figures(o.n), ans:show(answer), u:o.unit})]))};
    }
    function usable(q) {
      var R0 = M.rounded(q.answer, q.precision), plain = M.write(q.answer, q.precision, "plain");
      if (q.precision.sf < 2 || M.read(plain).sf !== q.precision.sf || M.magnitude(q.answer) > 3 || M.magnitude(q.answer) < -2) return false;
      return q.traps.every(function (t) { return M.sign(t.answer) && M.cmp(M.rounded(t.answer, q.precision).value, R0.value) !== 0; });
    }
    function attempt(random, make, buildIt) {
      for (;;) { var params = make(random); if (usable(buildIt(params))) return params; }
    }
    var MULTIPLY = p("Letters side by side mean multiply. Do not divide.", "Las letras juntas significan multiplicar. No dividas.");
    var SUBS = {
      v:{unit:"m/s", divide:true, f:"v = d/t", units:["m", "s"], work:p("The units: m ÷ s = m/s.", "Las unidades: m ÷ s = m/s."),
        prompt:p("A runner covers {a} in {b}. Find the average speed with v = d/t.", "Un corredor recorre {a} en {b}. Encuentra la rapidez promedio con v = d/t."),
        inverted:p("Distance goes on top: v = d/t.", "La distancia va arriba: v = d/t."), times:p("v = d/t divides distance by time. Do not multiply.", "v = d/t divide la distancia entre el tiempo. No multipliques.")},
      D:{unit:"g/mL", divide:true, f:"D = m/V", units:["g", "mL"], work:p("The units: g ÷ mL = g/mL.", "Las unidades: g ÷ mL = g/mL."),
        prompt:p("A sample has a mass of {a} and a volume of {b}. Find its density with D = m/V.", "Una muestra tiene una masa de {a} y un volumen de {b}. Encuentra su densidad con D = m/V."),
        inverted:p("Mass goes on top: D = m/V.", "La masa va arriba: D = m/V."), times:p("D = m/V divides mass by volume. Do not multiply.", "D = m/V divide la masa entre el volumen. No multipliques.")},
      d:{unit:"m", f:"d = vt", units:["m/s", "s"], work:p("The units: (m/s)(s) = m, because the s cancels.", "Las unidades: (m/s)(s) = m, porque la s se cancela."),
        prompt:p("A car moves at {a} for {b}. Find the distance with d = vt.", "Un auto avanza a {a} durante {b}. Encuentra la distancia con d = vt.")},
      F:{unit:"N", f:"F = ma", units:["kg", "m/s²"], work:p("The units: kg × m/s² = kg·m/s², which is N.", "Las unidades: kg × m/s² = kg·m/s², que es N."),
        prompt:p("A {a} cart accelerates at {b}. Find the net force with F = ma.", "Un carrito de {a} acelera a {b}. Encuentra la fuerza neta con F = ma.")},
      W:{unit:"J", f:"W = Fd", units:["N", "m"], work:p("The units: N × m = N·m, which is J.", "Las unidades: N × m = N·m, que es J."),
        prompt:p("A {a} force pushes a box {b}. Find the work with W = Fd.", "Una fuerza de {a} empuja una caja {b}. Encuentra el trabajo con W = Fd.")}
    };
    function substituteQuestion(params) {
      var S = SUBS[params[0]], a = params[1], b = params[2], at = show(a) + " " + S.units[0], bt = show(b) + " " + S.units[1];
      var traps = S.divide ? [{answer:M.div(b, a), note:S.inverted}, {answer:M.mul(a, b), note:S.times}] : [{answer:M.div(a, b), note:MULTIPLY}, {answer:M.div(b, a), note:MULTIPLY}];
      return withUnit({n:Math.min(sfOf(a), sfOf(b)), exact:S.divide ? M.div(a, b) : M.mul(a, b), unit:S.unit, traps:traps,
        prompt:fill(S.prompt, {a:at, b:bt}), first:[], sub:S.f + " = " + (S.divide ? "(" + at + ")/(" + bt + ")" : "(" + at + ")(" + bt + ")"), units:S.work});
    }
    var SUB_NUMBERS = {
      v:function (r) { return [measure(r, 3, 10, 400), measure(r, 3, 2, 90)]; },
      D:function (r) { var V = measure(r, 3, 2, 90), n = int(r, 2, 3); return [M.write(M.mul(V, (0.7 + r() * 18.3).toFixed(3)), {sf:n}, "plain"), V]; },
      d:function (r) { return [measure(r, int(r, 2, 3), 5, 30), measure(r, int(r, 2, 3), 2, 60)]; },
      F:function (r) { return [measure(r, int(r, 2, 3), 0.5, 25), measure(r, int(r, 2, 3), 0.5, 9.5)]; },
      W:function (r) { return [measure(r, 3, 1, 90), measure(r, 3, 0.5, 20)]; }
    };
    function makeSubstitute(keys) {
      return function (random) {
        return attempt(random, function (r) { var k = pick(r, keys); return [k].concat(SUB_NUMBERS[k](r)); }, substituteQuestion);
      };
    }

    // Convert, then substitute: grams to kilograms, centimeters to meters, Celsius to kelvin.
    function massQuestion(params) {
      var kind = params[0], g = params[1], kg = toKg(g), b = params[2], gt = show(g) + " g", kgt = show(kg) + " kg";
      var first = [fill(p("Convert first: {g} × (1 kg / 1000 g) = {kg}.", "Convierte primero: {g} × (1 kg / 1000 g) = {kg}."), {g:gt, kg:kgt})];
      var convert = fill(p("Convert grams to kilograms first: {g} = {kg}.", "Primero convierte los gramos a kilogramos: {g} = {kg}."), {g:gt, kg:kgt});
      if (kind === "F") {
        var at = show(b) + " m/s²";
        return withUnit({n:Math.min(sfOf(g), sfOf(b)), exact:M.mul(kg, b), unit:"N",
          traps:[{answer:M.mul(g, b), note:join([convert, p("A newton uses kg.", "Un newton usa kg.")])},
            {answer:M.div(kg, b), note:p("F = ma multiplies mass by acceleration. Do not divide.", "F = ma multiplica la masa por la aceleración. No dividas.")}],
          prompt:fill(p("A {g} cart accelerates at {a}. Find the net force with F = ma.", "Un carrito de {g} acelera a {a}. Encuentra la fuerza neta con F = ma."), {g:gt, a:at}),
          first:first, sub:"F = ma = (" + kgt + ")(" + at + ")", units:p("The units: kg × m/s² = kg·m/s², which is N.", "Las unidades: kg × m/s² = kg·m/s², que es N.")});
      }
      var vt = show(b) + " m/s", v2 = M.mul(b, b);
      return withUnit({n:Math.min(sfOf(g), sfOf(b)), exact:M.mul("0.5", M.mul(kg, v2)), unit:"J",
        traps:[{answer:M.mul("0.5", M.mul(g, v2)), note:join([convert, p("A joule uses kg.", "Un joule usa kg.")])},
          {answer:M.mul("0.5", M.mul(kg, b)), note:p("Square the speed first: v² is v × v.", "Primero eleva al cuadrado la rapidez: v² es v × v.")},
          {answer:M.mul(kg, v2), note:fill(p("Remember the ½: {k} = ½mv².", "Recuerda el ½: {k} = ½mv²."), {k:KE})}],
        prompt:fill(p("A {g} ball moves at {v}. Find its kinetic energy with {k} = ½mv<sup>2</sup>.", "Una pelota de {g} se mueve a {v}. Encuentra su energía cinética con {k} = ½mv<sup>2</sup>."), {g:gt, v:vt, k:KE}),
        first:first, sub:fill(p("{k} = ½mv<sup>2</sup> = ½({m})({v})<sup>2</sup>", "{k} = ½mv<sup>2</sup> = ½({m})({v})<sup>2</sup>"), {k:KE, m:kgt, v:vt}),
        units:p("The units: kg × (m/s)² = kg·m²/s², which is J.", "Las unidades: kg × (m/s)² = kg·m²/s², que es J.")});
    }
    function workQuestion(params) {
      var F = params[1], cm = params[2], dm = toM(cm), Ft = show(F) + " N", cmt = show(cm) + " cm", mt = show(dm) + " m";
      return withUnit({n:Math.min(sfOf(F), sfOf(cm)), exact:M.mul(F, dm), unit:"J",
        traps:[{answer:M.mul(F, M.div(cm, "1000")), note:p("1 m = 100 cm, so divide by 100, not 1000.", "1 m = 100 cm, así que divide entre 100, no entre 1000.")},
          {answer:M.mul(F, cm), note:fill(p("Convert cm to m first: {cm} = {m}. A joule is N·m.", "Primero convierte cm a m: {cm} = {m}. Un joule es N·m."), {cm:cmt, m:mt})}],
        prompt:fill(p("A {F} force pushes a box {d}. Find the work with W = Fd.", "Una fuerza de {F} empuja una caja {d}. Encuentra el trabajo con W = Fd."), {F:Ft, d:cmt}),
        first:[fill(p("Convert first: {cm} × (1 m / 100 cm) = {m}.", "Convierte primero: {cm} × (1 m / 100 cm) = {m}."), {cm:cmt, m:mt})],
        sub:"W = Fd = (" + Ft + ")(" + mt + ")", units:p("The units: N × m = N·m, which is J.", "Las unidades: N × m = N·m, que es J.")});
    }
    function gasQuestion(params) {
      var n = params[1], V = params[2], c = params[3], K = kelvin(c), nt = show(n) + " mol", Vt = show(V) + " L", ct = show(c) + " °C";
      var exact = M.div(M.mul(n, M.mul("0.0821", K)), V);
      return withUnit({n:Math.min(sfOf(n), sfOf(V), 3), exact:exact, unit:"atm",
        traps:[{answer:M.div(M.mul(n, M.mul("0.0821", c)), V), note:p("Change °C to kelvin first: K = °C + 273.", "Primero cambia °C a kelvin: K = °C + 273.")},
          {answer:M.mul(n, M.mul("0.0821", K)), note:p("Divide by V: P = nRT/V.", "Divide entre V: P = nRT/V.")}],
        prompt:fill(p("A {V} container holds {n} of gas at {c}. Find the pressure with P = nRT/V, where R = {R}.", "Un recipiente de {V} contiene {n} de gas a {c}. Encuentra la presión con P = nRT/V, donde R = {R}."), {V:Vt, n:nt, c:ct, R:R}),
        first:[fill(p("Change to kelvin first: K = {c} + 273 = {k} K.", "Primero cambia a kelvin: K = {c} + 273 = {k} K."), {c:show(c), k:K})],
        sub:"P = nRT/V = (" + nt + ")(" + R + ")(" + K + " K)/(" + Vt + ")", units:p("The units: mol, K and L cancel, leaving atm.", "Las unidades: mol, K y L se cancelan, y queda atm.")});
    }

    var topics = [
      {id:"units", title:p("Units in a substitution", "Unidades en una sustitución")},
      {id:"setup", title:p("Choosing the setup", "Elección del planteamiento")},
      {id:"answers", title:p("Answers with units", "Respuestas con unidades")},
      {id:"convert", title:p("Convert, then substitute", "Conversión antes de sustituir")}
    ];
    var generators = [
      {key:"ul", topic:"units", make:function (r) { var k = pick(r, Object.keys(LEFT)); return [k].concat(LEFT_NUMBERS[k](r)); }, build:leftQuestion},
      {key:"nu", topic:"units", make:function (r) { var k = pick(r, Object.keys(NAMED).concat(["k", "k"])); return k === "k" ? ["k", celsius(r)] : [k]; }, build:namedQuestion},
      {key:"cf", topic:"units", make:function (r) { return r() < 0.5 ? ["g", grams(r, 105, 995)] : ["cm", tenth(int(r, 100, 999))]; }, build:factorQuestion},
      {key:"st", topic:"setup", make:makeSetup, build:setupQuestion},
      {key:"pu", topic:"setup", make:function (r) { return [pick(r, Object.keys(CHECKS)), measure(r, 2, 10, 95), measure(r, 2, 1.5, 9.5)]; }, build:checkQuestion},
      {key:"qu", topic:"answers", make:makeSubstitute(["v", "D"]), build:substituteQuestion},
      {key:"pd", topic:"answers", make:makeSubstitute(["d", "F", "W"]), build:substituteQuestion},
      {key:"fc", topic:"convert", make:function (r) {
        return attempt(r, function (x) { var k = pick(x, ["F", "KE"]); return [k, grams(x, 105, 995), k === "F" ? measure(x, 3, 0.5, 9.9) : measure(x, 3, 2, 40)]; }, massQuestion);
      }, build:massQuestion},
      {key:"wk", topic:"convert", make:function (r) {
        return attempt(r, function (x) { return ["W", measure(x, 3, 1, 50), tenth(int(x, 100, 999))]; }, workQuestion);
      }, build:workQuestion},
      {key:"gp", topic:"convert", make:function (r) {
        return attempt(r, function (x) { return ["P", measure(x, 3, 0.1, 2), measure(x, 3, 1, 50), celsius(x)]; }, gasQuestion);
      }, build:gasQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/equations/substituting-with-units/",
      copy:{title:"Substituting with Units Practice", es:{
        "Substituting with Units Practice":"Práctica de sustitución con unidades",
        "Quantitative Skills · Equations":"Habilidades cuantitativas · Ecuaciones",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The units from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las unidades de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type the number, a space, and the unit, such as 1.46 N or 8.00 m/s. The unit is part of the answer here.":"Escribe el número, un espacio y la unidad, como 1.46 N o 8.00 m/s. Aquí la unidad es parte de la respuesta.",
        "Named units and their base units both count: N or kg·m/s², J or N·m. Significant figures are a reminder, not part of the score.":"Cuentan tanto las unidades con nombre como sus unidades base: N o kg·m/s², J o N·m. Las cifras significativas son un recordatorio, no forman parte de la puntuación.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number and its unit, such as 1.46 N or 8.00 m/s. Write m/s² as m/s^2 if you like.":"Escribe un número y su unidad, como 1.46 N o 8.00 m/s. Si quieres, escribe m/s² como m/s^2.",
        "Reference":"Consulta", "Substituting with units":"Sustitución con unidades",
        "Substitute each value with its unit. Units multiply, divide and cancel like letters: (12 m/s)(4.0 s) = 48 m.":"Sustituye cada valor con su unidad. Las unidades se multiplican, se dividen y se cancelan como letras: (12 m/s)(4.0 s) = 48 m.",
        "Named units: N = kg·m/s² and J = N·m = kg·m²/s².":"Unidades con nombre: N = kg·m/s² y J = N·m = kg·m²/s².",
        "Convert to kg, m and s before you substitute: 425 g × (1 kg / 1000 g) = 0.425 kg, and 85 cm × (1 m / 100 cm) = 0.85 m.":"Convierte a kg, m y s antes de sustituir: 425 g × (1 kg / 1000 g) = 0.425 kg, y 85 cm × (1 m / 100 cm) = 0.85 m.",
        "Predict the answer's unit, then check it: t = d/v gives s, so it is right; t = v/d gives 1/s, so the setup is wrong.":"Predice la unidad de la respuesta y luego compruébala: t = d/v da s, así que es correcto; t = v/d da 1/s, así que el planteamiento es incorrecto.",
        "Gas laws use kelvin: K = °C + 273, with R = 0.0821 L·atm/(mol·K).":"Las leyes de los gases usan kelvin: K = °C + 273, con R = 0.0821 L·atm/(mol·K).",
        "Formulas: D = m/V, d = vt, v = d/t, F = ma, W = Fd, KE = ½mv":"Fórmulas: D = m/V, d = vt, v = d/t, F = ma, W = Fd, EC = ½mv",
        ", P = nRT/V.":", P = nRT/V.",
        "Practice for the Substituting with Units lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Sustitución con unidades de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
