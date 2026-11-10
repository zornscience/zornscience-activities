(function () {
  "use strict";
  // Direct and Inverse Relationships Practice: generated questions for the Quantitative Skills lesson. Every set has
  // new numbers. The lesson on zornscience.org: a direct relationship is a straight line through the origin, and y ÷ x
  // is the same in every row (the ratio test; that value is the constant). An inverse relationship is a curve that
  // drops steeply, flattens out and never touches the axes, and x × y is the same in every row (the product test,
  // Boyle's law PV = constant). A straight line that misses the origin is linear but not direct. A squared
  // relationship bends upward: double x and y is multiplied by 4, triple x and y is multiplied by 9. Test by doubling x.
  // The lesson does not cover inverse-square relationships, so no question uses one.
  var SLUG = "qs-direct-and-inverse-relationships-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    // Spanish contractions after a name is put in: "a el volumen" is "al volumen", "de el tiempo" is "del tiempo".
    function contract(s) { return s.replace(/\b([Aa]|[Dd]e) el\b/g, function (_, w) { return w + "l"; }); }
    function fill(pair, values) {
      function one(lang) {
        return pair[lang].replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v[lang] : v; });
      }
      return p(one("en"), contract(one("es")));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;

    // Exact decimal text with the fewest decimal places (at least min), or 10 significant figures when it does not end.
    function places(v) { for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(v, -k), v) === 0) return k; return -1; }
    function dec(text) { var i = String(text).indexOf("."); return i < 0 ? 0 : String(text).length - i - 1; }
    function txt(v, min) { var k = places(v); return M.fixed(v, -Math.max(k, min || 0)); }
    function calc(v) { var k = places(v); return k >= 0 ? M.fixed(v, -k) : M.write(v, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""); }
    function cap(s) { return s.length > 1 ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
    function withUnit(text, unit) { return show(text) + (unit ? " " + unit : ""); }
    function sfOf(text) { return M.read(text).sf; }

    // Quantities: the bare name for formulas (mass ÷ volume) and the name with its article for sentences.
    function noun(en, es, ena, esa) { return {en:en, es:es, ena:ena, esa:esa}; }
    var N = {
      // In Spanish sentences y is "la variable y", so it is never read as the word "y" (and); formulas keep y ÷ x.
      x:noun("x", "x", "x", "x"), y:noun("y", "y", "y", "la variable y"),
      volume:noun("volume", "volumen", "the volume", "el volumen"), mass:noun("mass", "masa", "the mass", "la masa"),
      kelvin:noun("kelvin temperature", "temperatura en kelvin", "the kelvin temperature", "la temperatura en kelvin"),
      time:noun("time", "tiempo", "the time", "el tiempo"), distance:noun("distance", "distancia", "the distance", "la distancia"),
      pressure:noun("pressure", "presión", "the pressure", "la presión"), speed:noun("speed", "rapidez", "the speed", "la rapidez"),
      ke:noun("kinetic energy", "energía cinética", "the kinetic energy", "la energía cinética"),
      fallen:noun("distance fallen", "distancia de caída", "the distance fallen", "la distancia de caída"),
      water:noun("volume of water", "volumen de agua", "the volume of water", "el volumen de agua"),
      total:noun("total mass", "masa total", "the total mass", "la masa total"),
      force:noun("force", "fuerza", "the force", "la fuerza"), length:noun("total length", "longitud total", "the total length", "la longitud total"),
      stretch:noun("stretch", "estiramiento", "the stretch", "el estiramiento")
    };
    function names(x, y) {
      return {x:p(x.en, x.es), y:p(y.en, y.es), xa:p(x.ena, x.esa), ya:p(y.ena, y.esa),
        Xa:p(cap(x.ena), cap(x.esa)), Ya:p(cap(y.ena), cap(y.esa))};
    }
    function extend(a, b) { return Object.assign({}, a, b); }

    // Relationship kinds: the choice label, the graph shape in the lesson's words, and the rule that names the shape.
    var KIND = {
      direct:{label:p("Direct relationship", "Relación directa"), a:p("a direct relationship", "una relación directa"),
        shape:p("A straight line through the origin", "Una recta que pasa por el origen"),
        rule:p("A direct relationship is a straight line through the origin.", "Una relación directa es una recta que pasa por el origen."),
        more:p("Doubling x doubles y.", "Si x se duplica, la variable y se duplica.")},
      inverse:{label:p("Inverse relationship", "Relación inversa"), a:p("an inverse relationship", "una relación inversa"),
        shape:p("A curve that drops steeply, then flattens out and never touches the axes", "Una curva que baja de forma pronunciada, luego se aplana y nunca toca los ejes"),
        rule:p("An inverse relationship is a curve that drops steeply, then flattens out and never touches the axes.", "Una relación inversa es una curva que baja de forma pronunciada, luego se aplana y nunca toca los ejes."),
        more:p("Doubling x halves y.", "Si x se duplica, la variable y se reduce a la mitad.")},
      squared:{label:p("Squared relationship", "Relación cuadrática"), a:p("a squared relationship", "una relación cuadrática"),
        shape:p("A curve that bends upward, rising faster and faster", "Una curva que se dobla hacia arriba y sube cada vez más rápido"),
        rule:p("A squared relationship is a curve that bends upward.", "Una relación cuadrática es una curva que se dobla hacia arriba."),
        more:p("Doubling x multiplies y by 4.", "Si x se duplica, la variable y se multiplica por 4.")},
      linear:{label:p("Linear, but not direct", "Lineal, pero no directa"), a:p("a linear relationship that is not direct", "una relación lineal que no es directa"),
        shape:p("A straight line that does not pass through the origin", "Una recta que no pasa por el origen"),
        rule:p("A linear relationship that is not direct is a straight line that misses the origin.", "Una relación lineal que no es directa es una recta que no pasa por el origen."),
        more:p("It starts above zero, like a beaker plus water that starts at 50 g.", "Empieza arriba del cero, como un vaso de precipitados con agua que empieza en 50 g.")}
    };
    var KINDS = ["direct", "inverse", "squared", "linear"];
    function lower(pair) { return p(pair.en.charAt(0).toLowerCase() + pair.en.slice(1), pair.es.charAt(0).toLowerCase() + pair.es.slice(1)); }

    // Data contexts. nums: the first x value (a), the constant (c, with b the starting value of a linear one).
    var CTX = {
      plain:{x:N.x, y:N.y, ux:"", uy:"", cu:"", ymin:0, cond:p("", ""),
        intro:p("A data table has these (x, y) pairs:", "Una tabla de datos tiene estos pares (x, y):"),
        nums:{direct:{a:["1", "2", "3", "4", "5"], c:["2", "3", "4", "5", "6", "8", "12", "15"]},
          inverse:{a:["1", "2", "3", "4", "5", "6"], c:["12", "24", "36", "48", "60", "72", "90", "120"]},
          squared:{a:["1", "2", "3"], c:["1", "2", "3", "5"]},
          linear:{a:["1", "2", "3", "4", "5"], c:["2", "3", "4", "5"], b:["3", "5", "8", "10", "12", "20"]}}},
      density:{kind:"direct", x:N.volume, y:N.mass, ux:"cm³", uy:"g", cu:"g/cm³", ymin:2,
        intro:p("Samples of one metal, as (volume, mass):", "Muestras de un mismo metal, como (volumen, masa):"),
        cond:p("For samples of one metal, ", "Para muestras de un mismo metal, "),
        nums:{a:["2.00", "4.00", "5.00", "10.0"], c:["2.70", "7.87", "8.96", "11.3", "19.3", "10.5"]}},
      charles:{kind:"direct", x:N.kelvin, y:N.volume, ux:"K", uy:"L", cu:"L/K", ymin:2,
        intro:p("A gas at constant pressure, as (kelvin temperature, volume):", "Un gas a presión constante, como (temperatura en kelvin, volumen):"),
        cond:p("For a gas at constant pressure, ", "Para un gas a presión constante, "),
        nums:{a:["100", "150", "200"], c:["0.0040", "0.0050", "0.0060", "0.0080", "0.010", "0.012"]}},
      speed:{kind:"direct", x:N.time, y:N.distance, ux:"s", uy:"m", cu:"m/s", ymin:1,
        intro:p("A cart at constant speed, as (time, distance):", "Un carrito con rapidez constante, como (tiempo, distancia):"),
        cond:p("For a cart at constant speed, ", "Para un carrito con rapidez constante, "),
        nums:{a:["1.0", "2.0", "4.0", "5.0"], c:["1.5", "2.5", "3.5", "1.2", "0.80", "4.5", "0.60"]}},
      boyle:{kind:"inverse", x:N.pressure, y:N.volume, ux:"kPa", uy:"L", cu:"kPa·L", ymin:1,
        intro:p("A gas at constant temperature, as (pressure, volume):", "Un gas a temperatura constante, como (presión, volumen):"),
        cond:p("For a gas at constant temperature, ", "Para un gas a temperatura constante, "),
        nums:{a:["40", "50", "60", "80", "100", "120"], c:["120", "180", "240", "300", "360", "480", "600"]}},
      trip:{kind:"inverse", x:N.speed, y:N.time, ux:"km/h", uy:"h", cu:"km", ymin:1,
        intro:p("The same trip at different speeds, as (speed, time):", "El mismo viaje a distintas rapideces, como (rapidez, tiempo):"),
        cond:p("For the same trip, ", "Para el mismo viaje, "),
        nums:{a:["20", "30", "40", "60"], c:["120", "180", "240", "360"]}},
      ke:{kind:"squared", x:N.speed, y:N.ke, ux:"m/s", uy:"J", ymin:1,
        intro:p("A cart at different speeds, as (speed, kinetic energy):", "Un carrito a distintas rapideces, como (rapidez, energía cinética):"),
        cond:p("For a moving cart, ", "Para un carrito en movimiento, "),
        nums:{a:["1.0", "2.0"], c:["0.50", "1.0", "1.5", "2.0", "2.5"]}},
      fall:{kind:"squared", x:N.time, y:N.fallen, ux:"s", uy:"m", ymin:1,
        intro:p("A ball dropped from rest, as (time, distance fallen):", "Una pelota que se suelta desde el reposo, como (tiempo, distancia de caída):"),
        cond:p("For a dropped ball, ", "Para una pelota que se suelta, "),
        nums:{a:["1.0", "2.0"], c:["4.9"]}},
      beaker:{kind:"linear", x:N.water, y:N.total, ux:"mL", uy:"g", ymin:1,
        intro:p("Water poured into a beaker, as (volume of water, total mass):", "Agua vertida en un vaso de precipitados, como (volumen de agua, masa total):"),
        cond:p("For water poured into a beaker, ", "Para agua vertida en un vaso de precipitados, "),
        nums:{a:["10.0", "20.0", "25.0"], c:["1.00"], b:["50.0", "62.5", "75.0", "48.2", "100.0"]}},
      spring:{kind:"linear", x:N.force, y:N.length, ux:"N", uy:"cm", ymin:1,
        intro:p("Weights hung on a spring, as (force, total length):", "Pesas colgadas de un resorte, como (fuerza, longitud total):"),
        cond:p("For a spring with weights, ", "Para un resorte con pesas, "),
        nums:{a:["1.0", "2.0"], c:["1.5", "2.0", "2.5", "3.0"], b:["8.0", "10.0", "12.0", "15.0"]}}
    };
    function contexts(kind) { return Object.keys(CTX).filter(function (k) { return CTX[k].kind === kind; }); }
    function numsOf(ctxKey, kind) { return ctxKey === "plain" ? CTX.plain.nums[kind] : CTX[ctxKey].nums; }

    function yOf(kind, c, b, x) {
      if (kind === "direct") return M.mul(c, x);
      if (kind === "inverse") return M.div(c, x);
      if (kind === "squared") return M.mul(c, M.mul(x, x));
      return M.add(b, M.mul(c, x));
    }
    // A data table: params [context, kind, first x, row multiples ("124" is a, 2a, 4a), constant, start].
    var PATTERNS = {direct:["123", "124", "1234", "234"], inverse:["123", "124", "1234"], squared:["123", "1234"], linear:["123", "1234"]};
    function table(params) {
      var ctx = CTX[params[0]], kind = params[1], a = params[2], c = params[4], b = params[5];
      var mult = params[3].split("").map(Number), xs = mult.map(function (i) { return M.mul(a, String(i)); });
      var ys = xs.map(function (x) { return yOf(kind, c, b, x); });
      var yd = Math.max(ctx.ymin, Math.max.apply(null, ys.map(places)));
      var t = {ctx:ctx, kind:kind, a:a, c:c, b:b, mult:mult, xs:xs, ys:ys,
        xt:xs.map(function (x) { return M.fixed(x, -dec(a)); }), yt:ys.map(function (y) { return M.fixed(y, -yd); }), yd:yd};
      // The first pair of rows where x doubles (every pattern has one).
      for (var i = 0; i < mult.length && t.dbl === undefined; i++) for (var j = i + 1; j < mult.length; j++) if (mult[j] === 2 * mult[i]) { t.dbl = [i, j]; break; }
      return t;
    }
    function tableOK(t) {
      return t.ys.every(function (y) { var k = places(y); return k >= 0 && k <= 2 && M.cmp(y, "0.1") >= 0 && M.cmp(y, "10000") < 0; });
    }
    function makeTable(r, ctxKey, kind, patterns) {
      var nums = numsOf(ctxKey, kind);
      for (;;) {
        var params = [ctxKey, kind, pick(r, nums.a), pick(r, patterns || PATTERNS[kind]), pick(r, nums.c), nums.b ? pick(r, nums.b) : ""];
        if (tableOK(table(params))) return params;
      }
    }
    function rowsText(t) {
      return t.xt.map(function (x, i) { return "(" + withUnit(x, t.ctx.ux) + ", " + withUnit(t.yt[i], t.ctx.uy) + ")"; }).join(", ");
    }
    // Fill-in values for a table: names, the constant, the doubling rows and the steps between rows.
    function tableValues(t) {
      var u = t.ctx.uy, v = names(t.ctx.x, t.ctx.y), d = t.dbl;
      var steps = t.ys.slice(1).map(function (y, i) { return withUnit(M.fixed(M.sub(y, t.ys[i]), -t.yd), u); });
      return extend(v, {c:withUnit(t.c, t.ctx.cu), x1:withUnit(t.xt[d[0]], t.ctx.ux), x2:withUnit(t.xt[d[1]], t.ctx.ux),
        y1:withUnit(t.yt[d[0]], u), y2:withUnit(t.yt[d[1]], u), d1:steps[0], d2:steps[1]});
    }

    // Identifying a relationship from a data table.
    var EXPLAIN = {
      direct:p("Ratio test: {y} ÷ {x} = {c} in every row, so the relationship is direct. Doubling {xa} doubles {ya}.",
        "{y} ÷ {x} = {c} en todas las filas, así que la relación es directa. Al duplicar {xa}, {ya} se duplica."),
      inverse:p("Product test: {x} × {y} = {c} in every row, so the relationship is inverse. Doubling {xa} halves {ya}.",
        "Prueba del producto: {x} × {y} = {c} en todas las filas, así que la relación es inversa. Al duplicar {xa}, {ya} se reduce a la mitad."),
      squared:p("When {xa} doubles from {x1} to {x2}, {ya} is multiplied by 4, from {y1} to {y2}. The relationship is squared: its graph is a curve that bends upward.",
        "Cuando {xa} se duplica de {x1} a {x2}, {ya} se multiplica por 4, de {y1} a {y2}. La relación es cuadrática: su gráfica es una curva que se dobla hacia arriba."),
      linear:p("{Ya} rises by the same amount, {d1}, at each step, so the graph is a straight line. But doubling {xa} does not double {ya} ({y1} to {y2}), so the line does not pass through the origin.",
        "{Ya} aumenta lo mismo, {d1}, en cada paso, así que la gráfica es una recta. Pero al duplicar {xa}, {ya} no se duplica (de {y1} a {y2}), así que la recta no pasa por el origen.")
    };
    var UP_TOGETHER = p("In an inverse relationship, one quantity goes down as the other goes up. Here {ya} goes up with {xa}.",
      "En una relación inversa, una cantidad baja cuando la otra sube. Aquí {ya} sube junto con {xa}.");
    // Why each wrong choice is wrong, for the true kind of the table.
    var WHY = {
      direct:{inverse:UP_TOGETHER,
        squared:p("Doubling {xa} only doubles {ya} here ({y1} to {y2}). A squared relationship would multiply it by 4.",
          "Aquí, al duplicar {xa}, {ya} solo se duplica (de {y1} a {y2}). En una relación cuadrática se multiplicaría por 4."),
        linear:p("{y} ÷ {x} = {c} in every row, so the line passes through the origin. That makes it direct.",
          "{y} ÷ {x} = {c} en todas las filas, así que la recta pasa por el origen. Por eso es directa.")},
      inverse:{direct:p("In a direct relationship, both quantities go up together. Here {ya} goes down as {xa} goes up.",
          "En una relación directa, las dos cantidades suben juntas. Aquí {ya} baja cuando {xa} sube."),
        squared:p("A squared relationship rises faster and faster. Here {ya} goes down.", "Una relación cuadrática sube cada vez más rápido. Aquí {ya} baja."),
        linear:p("A straight line would change by equal steps. Here {x} × {y} = {c} in every row, so the graph is a curve: an inverse relationship.",
          "Una recta cambiaría en pasos iguales. Aquí {x} × {y} = {c} en todas las filas, así que la gráfica es una curva: una relación inversa.")},
      squared:{direct:p("Doubling {xa} multiplies {ya} by 4 ({y1} to {y2}), not by 2, so {y} ÷ {x} is not constant.",
          "Al duplicar {xa}, {ya} se multiplica por 4 (de {y1} a {y2}), no por 2, así que {y} ÷ {x} no es constante."),
        inverse:UP_TOGETHER,
        linear:p("The steps grow ({d1}, then {d2}), so the graph is a curve that bends upward, not a straight line.",
          "Los pasos crecen ({d1} y luego {d2}), así que la gráfica es una curva que se dobla hacia arriba, no una recta.")},
      linear:{direct:p("Doubling {xa} does not double {ya} ({y1} to {y2}). A direct relationship passes through the origin; this line does not.",
          "Al duplicar {xa}, {ya} no se duplica (de {y1} a {y2}). Una relación directa pasa por el origen; esta recta no."),
        inverse:UP_TOGETHER,
        squared:p("{Ya} rises by the same amount, {d1}, at each step, so the graph is a straight line, not a curve.",
          "{Ya} aumenta lo mismo, {d1}, en cada paso, así que la gráfica es una recta, no una curva.")}
    };
    function classifyQuestion(params) {
      var t = table(params), v = tableValues(t), kind = t.kind;
      return {type:"mc", answer:0,
        prompt:fill(p("{intro} {rows}. What kind of relationship is this?", "{intro} {rows}. ¿Qué tipo de relación es?"), {intro:t.ctx.intro, rows:rowsText(t)}),
        choices:[kind].concat(KINDS.filter(function (k) { return k !== kind; })).map(function (k, i) {
          return {text:KIND[k].label, why:i ? fill(WHY[kind][k], v) : p("", "")};
        }),
        explanation:fill(EXPLAIN[kind], v)};
    }
    function makeClassify(r) {
      var kind = pick(r, KINDS), ctxKey = r() < 0.4 ? "plain" : pick(r, contexts(kind));
      return makeTable(r, ctxKey, kind);
    }

    // Graph shapes in words: which shape a kind has (mode s), or which kind a described graph shows (mode k).
    function shapeQuestion(params) {
      var mode = params[0], kind = params[1], others = KINDS.filter(function (k) { return k !== kind; });
      if (mode === "s") {
        return {type:"mc", answer:0, prompt:fill(p("Which graph shape shows {a}?", "¿Qué forma de gráfica muestra {a}?"), {a:KIND[kind].a}),
          choices:[{text:KIND[kind].shape, why:p("", "")}].concat(others.map(function (k) {
            return {text:KIND[k].shape, why:join([fill(p("That shape shows {a}.", "Esa forma muestra {a}."), {a:KIND[k].a}), KIND[kind].rule])};
          })),
          explanation:join([KIND[kind].rule, KIND[kind].more])};
      }
      var ctx = CTX[params[2]], v = names(ctx.x, ctx.y);
      return {type:"mc", answer:0,
        prompt:fill(p("{cond}a graph of {ya} against {xa} is {shape}. What kind of relationship is it?", "{cond}la gráfica de {ya} contra {xa} es {shape}. ¿Qué tipo de relación es?"),
          extend(v, {cond:ctx.cond, shape:lower(KIND[kind].shape)})),
        choices:[{text:KIND[kind].label, why:p("", "")}].concat(others.map(function (k) {
          return {text:KIND[k].label, why:fill(p("{A} would be {shape}.", "{A} sería {shape}."), {A:p(cap(KIND[k].a.en), cap(KIND[k].a.es)), shape:lower(KIND[k].shape)})};
        })),
        explanation:KIND[kind].rule};
    }
    function makeShape(r) {
      var kind = pick(r, KINDS);
      return r() < 0.35 ? ["s", kind, ""] : ["k", kind, pick(r, contexts(kind))];
    }

    // What happens to y when x is doubled, tripled or multiplied by 4, in words.
    var STATE = {
      direct:p("{Ya} is directly proportional to {xa}.", "{Ya} es directamente proporcional a {xa}."),
      inverse:p("{Ya} is inversely proportional to {xa}.", "{Ya} es inversamente proporcional a {xa}."),
      squared:p("{Ya} depends on {xa} squared.", "{Ya} depende del cuadrado de {xa}.")
    };
    // A statement after a condition starts with the name in lower case ("For the same trip, the time is ...").
    function statement(kind, ctx) {
      var v = names(ctx.x, ctx.y), s = fill(STATE[kind], v);
      return ctx.cond.en ? p(ctx.cond.en + s.en.charAt(0).toLowerCase() + s.en.slice(1), ctx.cond.es + s.es.charAt(0).toLowerCase() + s.es.slice(1)) : s;
    }
    var VERB = {2:p("doubled", "se duplica"), 3:p("tripled", "se triplica"), 4:p("multiplied by 4", "se multiplica por 4")};
    var PHRASE = {
      mult:function (k) { return k === 2 ? p("{Ya} doubles.", "{Ya} se duplica.") : k === 3 ? p("{Ya} triples.", "{Ya} se triplica.") : p("{Ya} is multiplied by " + k + ".", "{Ya} se multiplica por " + k + "."); },
      frac:function (k) { return {2:p("{Ya} is cut in half.", "{Ya} se reduce a la mitad."), 3:p("{Ya} becomes one third as large.", "{Ya} se reduce a la tercera parte."), 4:p("{Ya} becomes one fourth as large.", "{Ya} se reduce a la cuarta parte.")}[k]; },
      plus:function (k) { return p("{Ya} increases by " + k + ".", "{Ya} aumenta en " + k + "."); },
      minus:function (k) { return p("{Ya} decreases by " + k + ".", "{Ya} disminuye en " + k + "."); }
    };
    // The key and three distractors, each with why it is wrong.
    function scaleChoices(kind, k) {
      if (kind === "direct") return [["mult", k], ["frac", k, p("That would be an inverse relationship. Directly proportional means {ya} is multiplied by the same factor as {xa}.", "Eso sería una relación inversa. Directamente proporcional significa que {ya} se multiplica por el mismo factor que {xa}.")],
        ["mult", k * k, p("Multiplying by {k}<sup>2</sup> is for a squared relationship. Directly proportional means the same factor, {k}.", "Multiplicar por {k}<sup>2</sup> es para una relación cuadrática. Directamente proporcional significa el mismo factor, {k}.")],
        ["plus", k, p("Proportional changes multiply; they do not add. {Ya} is multiplied by {k}.", "Los cambios proporcionales multiplican; no suman. {Ya} se multiplica por {k}.")]];
      if (kind === "inverse") return [["frac", k], ["mult", k, p("That would be a direct relationship. In an inverse relationship, {ya} goes down when {xa} goes up.", "Eso sería una relación directa. En una relación inversa, {ya} baja cuando {xa} sube.")],
        ["minus", k, p("Inversely proportional means dividing by the factor, not subtracting it: {ya} is divided by {k}.", "Inversamente proporcional significa dividir entre el factor, no restarlo: {ya} se divide entre {k}.")],
        ["mult", k * k, p("Squaring the factor is for a squared relationship, where {ya} would go up. Here {ya} is divided by {k}.", "Elevar el factor al cuadrado es para una relación cuadrática, en la que {ya} aumentaría. Aquí {ya} se divide entre {k}.")]];
      return [["mult", k * k], ["mult", k, p("Square the factor: {k}<sup>2</sup> = {k2}, so {ya} is multiplied by {k2}.", "Eleva el factor al cuadrado: {k}<sup>2</sup> = {k2}, así que {ya} se multiplica por {k2}.")],
        k === 2 ? ["plus", 4, p("{Ya} is multiplied by 4, not increased by 4.", "{Ya} se multiplica por 4, no aumenta en 4.")] :
          ["mult", 2 * k, p("Squaring means {k} × {k}, not {k} × 2. {Ya} is multiplied by {k2}.", "Elevar al cuadrado es {k} × {k}, no {k} × 2. {Ya} se multiplica por {k2}.")],
        ["frac", k, p("That would be an inverse relationship. In a squared relationship, {ya} goes up when {xa} goes up.", "Eso sería una relación inversa. En una relación cuadrática, {ya} sube cuando {xa} sube.")]];
    }
    var SCALE_EXPLAIN = {
      direct:p("Directly proportional: {ya} is multiplied by the same factor as {xa}, {k}.", "Directamente proporcional: {ya} se multiplica por el mismo factor que {xa}, {k}."),
      inverse:p("Inversely proportional: when {xa} is multiplied by {k}, {ya} is divided by {k}.", "Inversamente proporcional: cuando {xa} se multiplica por {k}, {ya} se divide entre {k}."),
      squared:p("{Ya} depends on {xa} squared, so it is multiplied by {k}<sup>2</sup> = {k2}.", "{Ya} depende del cuadrado de {xa}, así que se multiplica por {k}<sup>2</sup> = {k2}.")
    };
    function scaleQuestion(params) {
      var ctx = CTX[params[0]], kind = params[1], k = Number(params[2]), v = extend(names(ctx.x, ctx.y), {k:String(k), k2:String(k * k)});
      var lead = statement(kind, ctx);
      return {type:"mc", answer:0,
        prompt:join([lead, fill(p("If {xa} is {verb}, what happens to {ya}?", "Si {xa} {verb}, ¿qué le pasa a {ya}?"), extend(v, {verb:VERB[k]}))]),
        choices:scaleChoices(kind, k).map(function (c, i) { return {text:fill(PHRASE[c[0]](c[1]), v), why:i ? fill(c[2], v) : p("", "")}; }),
        explanation:fill(SCALE_EXPLAIN[kind], v)};
    }
    function makeScale(r) {
      var kind = pick(r, ["direct", "inverse", "squared"]);
      return [r() < 0.4 ? "plain" : pick(r, contexts(kind)), kind, String(pick(r, [2, 2, 3, 3, 4]))];
    }

    // The doubling test with numbers: x is multiplied by k; by what number is y multiplied?
    function factorOf(kind, k) { return kind === "direct" ? String(k) : kind === "squared" ? String(k * k) : "1/" + k; }
    function factorRows(params) {
      var ctx = CTX[params[0]], kind = params[1], a = params[2], c = params[3], k = Number(params[4]);
      var x2 = M.mul(a, String(k)), y1 = yOf(kind, c, "", a), y2 = yOf(kind, c, "", x2);
      var yd = Math.max(ctx.ymin, places(y1), places(y2));
      return {ctx:ctx, kind:kind, k:k, x1:a, x2:M.fixed(x2, -dec(a)), y1v:y1, y2v:y2, y1:M.fixed(y1, -yd), y2:M.fixed(y2, -yd)};
    }
    var FACTOR_KIND = {
      direct:p("{Ya} changes by the same factor as {xa}: a direct relationship.", "{Ya} cambia por el mismo factor que {xa}: una relación directa."),
      inverse:p("{Ya} is divided by {k}: an inverse relationship.", "{Ya} se divide entre {k}: una relación inversa."),
      squared:p("{f} = {k}<sup>2</sup>: a squared relationship.", "{f} = {k}<sup>2</sup>: una relación cuadrática.")
    };
    function factorQuestion(params) {
      var f = factorRows(params), ctx = f.ctx, F = M.exact(factorOf(f.kind, f.k)), fText = txt(F);
      var v = extend(names(ctx.x, ctx.y), {verb:VERB[f.k], k:String(f.k), f:show(fText), x1:withUnit(f.x1, ctx.ux), x2:withUnit(f.x2, ctx.ux),
        y1:withUnit(f.y1, ctx.uy), y2:withUnit(f.y2, ctx.uy)});
      var lead = ctx.cond.en ? fill(p("{cond}when {xa} is {verb}, from {x1} to {x2}, {ya} goes from {y1} to {y2}.", "{cond}cuando {xa} {verb}, de {x1} a {x2}, {ya} pasa de {y1} a {y2}."), extend(v, {cond:ctx.cond})) :
        fill(p("When {xa} is {verb}, from {x1} to {x2}, {ya} goes from {y1} to {y2}.", "Cuando {xa} {verb}, de {x1} a {x2}, {ya} pasa de {y1} a {y2}."), v);
      var traps = [], seen = [F];
      function trap(value, note) {
        if (seen.some(function (s) { return M.cmp(s, value) === 0; })) return;
        seen.push(value); traps.push({answer:value.n + "/" + value.d, note:fill(note, v)});
      }
      trap(M.div(f.y1v, f.y2v), p("Divide the new value by the old one: {y2} ÷ {y1}.", "Divide el valor nuevo entre el anterior: {y2} ÷ {y1}."));
      trap(M.sub(f.y2v, f.y1v), p("Divide, do not subtract. The factor tells how many times as large {ya} became.", "Divide, no restes. El factor dice cuántas veces más grande se hizo {ya}."));
      var exactP = F.d === 1n, P = exactP ? {exact:true} : {decimals:places(F)};
      return {type:"numeric", answer:fText, precision:P, unit:null, accept:[], check:{}, display:fText, answerText:p(show(fText), show(fText)), traps:traps,
        instruction:p("Enter a whole number or a decimal.", "Escribe un número entero o un decimal."),
        prompt:join([lead, fill(p("By what number is {ya} multiplied?", "¿Por qué número se multiplica {ya}?"), v)]),
        explanation:join([fill(p("{y2} ÷ {y1} = {f}, so {ya} is multiplied by {f}.", "{y2} ÷ {y1} = {f}, así que {ya} se multiplica por {f}."), v), fill(FACTOR_KIND[f.kind], v)])};
    }
    function makeFactor(r) {
      var kind = pick(r, ["direct", "inverse", "squared"]), ctxKey = r() < 0.4 ? "plain" : pick(r, contexts(kind)), nums = numsOf(ctxKey, kind);
      for (;;) {
        var params = [ctxKey, kind, pick(r, nums.a), pick(r, nums.c), String(kind === "inverse" ? pick(r, [2, 4]) : pick(r, [2, 3]))], f = factorRows(params);
        if ([f.y1v, f.y2v].every(function (y) { var k = places(y); return k >= 0 && k <= 2 && M.cmp(y, "0.1") >= 0; })) return params;
      }
    }

    // The constant from the ratio test (direct) or the product test (inverse), with its unit.
    var UNITS = {
      "g":["g", "grams", "gram", "gramos", "gramo"], "L":["L", "l", "liters", "liter", "litres", "litre", "litros", "litro"],
      "m":["m", "meters", "meter", "metres", "metre", "metros", "metro"], "cm":["cm", "centimeters", "centimeter", "centímetros", "centímetro"],
      "h":["h", "hr", "hours", "hour", "horas", "hora"], "J":["J", "joules", "joule"], "km":["km", "kilometers", "kilometer", "kilómetros", "kilómetro"],
      "g/cm³":["g/cm³", "g/cm^3", "g/cm3", "g/cc", "g cm^-3", "grams per cubic centimeter", "gramos por centímetro cúbico"],
      "L/K":["L/K", "l/K", "L K^-1", "liters per kelvin", "litros por kelvin"], "m/s":["m/s", "m s^-1", "meters per second", "metros por segundo"],
      "kPa·L":["kPa·L", "L·kPa", "kPa L", "L kPa"]
    };
    function constantQuestion(params) {
      var t = table(params), ctx = t.ctx, v = tableValues(t), last = t.ys.length - 1, direct = t.kind === "direct";
      var C = M.exact(t.c), whole = C.d === 1n, P = whole ? {exact:true} : {sf:sfOf(t.c)}, unit = ctx.cu || null;
      var row = extend(v, {x1:withUnit(t.xt[0], ctx.ux), y1:withUnit(t.yt[0], ctx.uy)});
      var traps = [], seen = [C];
      function trap(value, note) {
        if (seen.some(function (s) { return M.cmp(s, value) === 0; })) return;
        seen.push(value); traps.push({answer:value.n + "/" + value.d, note:fill(note, v)});
      }
      if (direct) {
        trap(M.div(t.xs[0], t.ys[0]), p("Divide {y} by {x}, not {x} by {y}.", "Divide {y} entre {x}, no {x} entre {y}."));
        trap(M.mul(t.xs[last], t.ys[last]), p("This relationship is direct, so use {y} ÷ {x}. {x} × {y} changes from row to row.", "Esta relación es directa, así que usa {y} ÷ {x}. {x} × {y} cambia de una fila a otra."));
      } else {
        trap(M.div(t.ys[last], t.xs[last]), p("This relationship is inverse, so multiply: {x} × {y}. {y} ÷ {x} changes from row to row.", "Esta relación es inversa, así que multiplica: {x} × {y}. {y} ÷ {x} cambia de una fila a otra."));
        trap(M.div(t.xs[last], t.ys[last]), p("This relationship is inverse, so multiply: {x} × {y}. Dividing gives a value that changes from row to row.", "Esta relación es inversa, así que multiplica: {x} × {y}. Al dividir sale un valor que cambia de una fila a otra."));
      }
      // The unit is optional, but a typed unit is checked: the ratio's unit is y's over x's, the product's is both.
      var UNIT_LINE = p("You may add the unit; a wrong unit is marked incorrect.", "Puedes agregar la unidad; una unidad incorrecta se marca como incorrecta.");
      var instruction = !unit ? null : whole ? UNIT_LINE : join([fill(p("Round to {n}.", "Redondea a {n}."), {n:figs(P.sf)}), UNIT_LINE]);
      return {type:"numeric", answer:t.c, precision:P, unit:unit, accept:unit ? UNITS[unit] : [], check:{sf:"advice", unit:"optional"},
        display:t.c + (unit ? " " + unit : ""), answerText:p(withUnit(t.c, unit), withUnit(t.c, unit)), traps:traps, instruction:instruction,
        prompt:join([fill(p("{intro} {rows}.", "{intro} {rows}."), {intro:ctx.intro, rows:rowsText(t)}), fill(STATE[t.kind], v),
          p("What is the constant of this relationship?", "¿Cuál es la constante de esta relación?")]),
        explanation:fill(direct ? p("For a direct relationship, divide: {y} ÷ {x} = {y1} ÷ {x1} = {c}, the same in every row.", "En una relación directa, divide: {y} ÷ {x} = {y1} ÷ {x1} = {c}, el mismo valor en todas las filas.") :
          p("For an inverse relationship, multiply: {x} × {y} = {x1} × {y1} = {c}, the same in every row.", "En una relación inversa, multiplica: {x} × {y} = {x1} × {y1} = {c}, el mismo valor en todas las filas."), row)};
    }
    function makeConstant(r, kind) {
      var ctxKey = r() < 0.3 ? "plain" : pick(r, contexts(kind));
      return makeTable(r, ctxKey, kind);
    }

    // Predictions from one measurement: params [context, x1, y1, x2].
    var PRED = {
      liquid:{kind:"direct", x:N.volume, y:N.mass, ux:"mL", uy:"g", count:true, x1:["10.0", "20.0", "25.0", "40.0", "50.0"], k:[0.5, 1.5, 2, 2.5, 3, 4],
        text:p("A liquid sample of {x1} has a mass of {y1}. Mass is directly proportional to volume. What is the mass of {x2} of the same liquid?",
          "Una muestra de {x1} de un líquido tiene una masa de {y1}. La masa es directamente proporcional al volumen. ¿Cuál es la masa de {x2} del mismo líquido?")},
      charles:{kind:"direct", x:N.kelvin, y:N.volume, ux:"K", uy:"L", count:false, x1:["200", "250", "300", "400"], y1:["1.5", "2.0", "2.4", "3.0", "1.2", "0.80", "2.5"], k:[1.5, 2, 2.5, 3],
        text:p("A gas has a volume of {y1} at {x1}. At constant pressure, volume is directly proportional to kelvin temperature. What is its volume at {x2}?",
          "Un gas tiene un volumen de {y1} a {x1}. A presión constante, el volumen es directamente proporcional a la temperatura en kelvin. ¿Cuál es su volumen a {x2}?")},
      speed:{kind:"direct", x:N.time, y:N.distance, ux:"s", uy:"m", count:true, x1:["2.0", "3.0", "4.0", "5.0"], y1:["3.6", "5.0", "7.2", "12", "4.8", "6.4", "9.0"], k:[0.5, 1.5, 2, 2.5, 3, 4],
        text:p("A cart at constant speed travels {y1} in {x1}. Distance is directly proportional to time. How far does it travel in {x2}?",
          "Un carrito con rapidez constante recorre {y1} en {x1}. La distancia es directamente proporcional al tiempo. ¿Qué distancia recorre en {x2}?")},
      spring:{kind:"direct", x:N.force, y:N.stretch, ux:"N", uy:"cm", count:true, x1:["1.5", "2.0", "4.0", "5.0"], y1:["3.0", "2.4", "4.5", "1.8", "6.0", "3.6"], k:[0.5, 1.5, 2, 2.5, 3, 4],
        text:p("A spring stretches {y1} when it is pulled with a force of {x1}. The stretch is directly proportional to the force. How much does it stretch with a force of {x2}?",
          "Un resorte se estira {y1} cuando se jala con una fuerza de {x1}. El estiramiento es directamente proporcional a la fuerza. ¿Cuánto se estira con una fuerza de {x2}?")},
      boyle:{kind:"inverse", x:N.pressure, y:N.volume, ux:"kPa", uy:"L", cu:"kPa·L", count:false, x1:["50", "100", "150", "200", "250"], x2:["50", "75", "100", "125", "150", "200", "250", "300", "400"],
        y1:["6.0", "3.0", "4.0", "2.4", "1.8", "5.0", "8.0", "1.2"],
        text:p("A gas has a volume of {y1} at {x1}. At constant temperature, volume is inversely proportional to pressure. What is its volume at {x2}?",
          "Un gas tiene un volumen de {y1} a {x1}. A temperatura constante, el volumen es inversamente proporcional a la presión. ¿Cuál es su volumen a {x2}?")},
      trip:{kind:"inverse", x:N.speed, y:N.time, ux:"km/h", uy:"h", cu:"km", count:false, x1:["40", "50", "60", "80", "90", "100"], x2:["30", "40", "50", "60", "75", "80", "90", "100", "120"],
        y1:["3.0", "2.0", "1.5", "4.0", "2.5", "1.2"],
        text:p("A trip takes {y1} at an average speed of {x1}. For the same trip, time is inversely proportional to speed. How long does it take at {x2}?",
          "Un viaje dura {y1} a una rapidez promedio de {x1}. Para el mismo viaje, el tiempo es inversamente proporcional a la rapidez. ¿Cuánto dura a {x2}?")},
      ke:{kind:"squared", x:N.speed, y:N.ke, ux:"m/s", uy:"J", count:true, x1:["1.0", "2.0", "3.0", "4.0"], y1:["5.0", "2.5", "8.0", "12", "1.5", "4.0", "6.4", "3.2", "7.5", "9.6", "1.8"], k:[1.5, 2, 2.5, 3, 4],
        text:p("A cart has {y1} of kinetic energy at {x1}. Kinetic energy depends on speed squared. What is its kinetic energy at {x2}?",
          "Un carrito tiene {y1} de energía cinética a {x1}. La energía cinética depende del cuadrado de la rapidez. ¿Cuál es su energía cinética a {x2}?")},
      fall:{kind:"squared", x:N.time, y:N.fallen, ux:"s", uy:"m", count:true, x1:["1.00", "0.500", "2.00", "0.300", "0.400", "0.800", "1.50"], k:[1.5, 2, 2.5, 3, 4],
        text:p("A dropped ball falls {y1} in the first {x1}. The distance fallen depends on time squared. How far has it fallen after {x2}?",
          "Una pelota que se suelta cae {y1} en los primeros {x1}. La distancia de caída depende del cuadrado del tiempo. ¿Cuánto ha caído después de {x2}?")}
    };
    var LIQUID = ["0.80", "0.79", "0.92", "1.20", "1.26", "0.88", "1.10"];
    // The distance fallen in the first t seconds, 4.90 m/s² × t², to 3 significant figures.
    var FALL = {"1.00":"4.90", "0.500":"1.23", "2.00":"19.6", "0.300":"0.441", "0.400":"0.784", "0.800":"3.14", "1.50":"11.0"};
    function predictParts(params) {
      var c = PRED[params[0]], x1 = params[1], y1 = params[2], x2 = params[3], k = M.div(x2, x1);
      var y2 = c.kind === "direct" ? M.mul(y1, k) : c.kind === "inverse" ? M.div(M.mul(y1, x1), x2) : M.mul(y1, M.mul(k, k));
      var n = Math.min.apply(null, (c.count ? [x1, y1, x2] : [y1]).map(sfOf)), P = {sf:n};
      return {c:c, x1:x1, y1:y1, x2:x2, k:k, y2:y2, P:P, plain:M.write(y2, P, "plain")};
    }
    function predictQuestion(params) {
      var q = predictParts(params), c = q.c, ans = q.plain, raw = calc(q.y2), same = M.cmp(M.exact(raw), M.exact(ans)) === 0;
      var v = extend(names(c.x, c.y), {x1:withUnit(q.x1, c.ux), y1:withUnit(q.y1, c.uy), x2:withUnit(q.x2, c.ux), k:show(txt(q.k)),
        k2:show(txt(M.mul(q.k, q.k))), raw:withUnit(same ? ans : raw, c.uy), ans:withUnit(ans, c.uy)});
      v.round = same ? p("", "") : fill(p(", which rounds to {ans}", ", que se redondea a {ans}"), v);
      var traps = [], seen = [q.y2];
      function trap(value, note) {
        if (seen.some(function (s) { return M.cmp(M.rounded(s, q.P).value, M.rounded(value, q.P).value) === 0; })) return;
        seen.push(value); traps.push({answer:value.n + "/" + value.d, note:fill(note, v)});
      }
      var explanation;
      if (c.kind === "direct") {
        trap(M.div(q.y1, q.k), p("Directly proportional: {ya} is multiplied by the same factor as {xa}. Do not divide by the factor.", "Directamente proporcional: {ya} se multiplica por el mismo factor que {xa}. No dividas entre el factor."));
        trap(M.mul(q.y1, M.mul(q.k, q.k)), p("Directly proportional means the same factor, not the factor squared.", "Directamente proporcional significa el mismo factor, no el factor al cuadrado."));
        explanation = p("{Xa} is multiplied by {x2} ÷ {x1} = {k}, so {ya} is multiplied by {k} too: {y1} × {k} = {raw}{round}.",
          "{Xa} se multiplica por {x2} ÷ {x1} = {k}, así que {ya} también se multiplica por {k}: {y1} × {k} = {raw}{round}.");
      } else if (c.kind === "inverse") {
        v.c = withUnit(txt(M.mul(q.x1, q.y1)), c.cu);
        trap(M.mul(q.y1, q.k), p("Inversely proportional: when {xa} goes up, {ya} goes down. Keep {x} × {y} the same.", "Inversamente proporcional: cuando {xa} aumenta, {ya} disminuye. Mantén igual {x} × {y}."));
        explanation = p("Inverse relationship: {x} × {y} stays the same. {x1} × {y1} = {c}, so at {x2}, {y} = {c} ÷ {x2} = {raw}{round}.",
          "Relación inversa: {x} × {y} se mantiene igual. {x1} × {y1} = {c}, así que a {x2}, {y} = {c} ÷ {x2} = {raw}{round}.");
      } else {
        trap(M.mul(q.y1, q.k), p("{Ya} depends on {xa} squared, so square the factor: {k}<sup>2</sup> = {k2}.", "{Ya} depende del cuadrado de {xa}, así que eleva el factor al cuadrado: {k}<sup>2</sup> = {k2}."));
        trap(M.mul(q.y1, M.mul(q.k, "2")), p("Square the factor by multiplying it by itself: {k} × {k} = {k2}, not {k} × 2.", "Eleva el factor al cuadrado multiplicándolo por sí mismo: {k} × {k} = {k2}, no {k} × 2."));
        explanation = p("{Xa} is multiplied by {x2} ÷ {x1} = {k}, so {ya} is multiplied by {k}<sup>2</sup> = {k2}: {y1} × {k2} = {raw}{round}.",
          "{Xa} se multiplica por {x2} ÷ {x1} = {k}, así que {ya} se multiplica por {k}<sup>2</sup> = {k2}: {y1} × {k2} = {raw}{round}.");
      }
      return {type:"numeric", answer:q.y2.n + "/" + q.y2.d, precision:q.P, unit:c.uy, accept:UNITS[c.uy], check:{sf:"advice", unit:"optional"},
        display:ans + " " + c.uy, answerText:p(withUnit(ans, c.uy), withUnit(ans, c.uy)), traps:traps,
        instruction:fill(p("Round to {n}.", "Redondea a {n}."), {n:figs(q.P.sf)}),
        prompt:fill(c.text, v), explanation:fill(explanation, v)};
    }
    function makePredict(r, kind) {
      var keys = Object.keys(PRED).filter(function (k) { return PRED[k].kind === kind; });
      for (;;) {
        var key = pick(r, keys), c = PRED[key], x1 = pick(r, c.x1), x2, y1;
        if (key === "liquid") y1 = M.fixed(M.roundAt(M.mul(x1, pick(r, LIQUID)), -1), -1);
        else if (key === "fall") y1 = FALL[x1];
        else y1 = pick(r, c.y1);
        if (c.k) {
          var x2v = M.mul(x1, String(pick(r, c.k)));
          if (M.cmp(M.roundAt(x2v, -dec(x1)), x2v) !== 0) continue;
          x2 = M.fixed(x2v, -dec(x1));
        } else x2 = pick(r, c.x2);
        if (x2 === x1 || (key === "fall" && M.cmp(x2, "5") > 0) || (key === "ke" && M.cmp(x2, "12") > 0)) continue;
        var q = predictParts([key, x1, y1, x2]);
        if (M.read(q.plain).sf !== q.P.sf || M.cmp(q.y2, "0.1") < 0 || M.cmp(q.y2, "1000") >= 0) continue;
        return [key, x1, y1, x2];
      }
    }

    var topics = [
      {id:"classify", title:p("Identifying relationships", "Identificación de relaciones")},
      {id:"scale", title:p("Changing x", "Cambios en x")},
      {id:"constant", title:p("Finding the constant", "Cálculo de la constante")},
      {id:"predict", title:p("Predictions", "Predicciones")}
    ];
    var generators = [
      {key:"ct", topic:"classify", make:makeClassify, build:classifyQuestion},
      {key:"cg", topic:"classify", make:makeShape, build:shapeQuestion},
      {key:"sm", topic:"scale", make:makeScale, build:scaleQuestion},
      {key:"sn", topic:"scale", make:makeFactor, build:factorQuestion},
      {key:"kr", topic:"constant", make:function (r) { return makeConstant(r, "direct"); }, build:constantQuestion},
      {key:"kp", topic:"constant", make:function (r) { return makeConstant(r, "inverse"); }, build:constantQuestion},
      {key:"pd", topic:"predict", make:function (r) { return makePredict(r, "direct"); }, build:predictQuestion},
      {key:"pi", topic:"predict", make:function (r) { return makePredict(r, "inverse"); }, build:predictQuestion},
      {key:"ps", topic:"predict", make:function (r) { return makePredict(r, "squared"); }, build:predictQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/graphs-and-change/direct-and-inverse-relationships/",
      copy:{title:"Direct and Inverse Relationships Practice", es:{
        "Direct and Inverse Relationships Practice":"Práctica de relaciones directas e inversas",
        "Quantitative Skills · Graphs and Change":"Habilidades cuantitativas · Gráficas y cambio",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The tests from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Las pruebas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Data tables are written as (x, y) pairs. To identify a relationship, double x and see what happens to y.":"Las tablas de datos se escriben como pares (x, y). Para identificar una relación, duplica x y observa qué le pasa a y.",
        "Type numbers with a decimal point. A unit after the number is optional, but a wrong unit is marked incorrect.":"Escribe los números con punto decimal. La unidad después del número es opcional, pero una unidad incorrecta se marca como incorrecta.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 2.5 or 0.0050. You may add the unit after it.":"Escribe un número como 2.5 o 0.0050. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Tests for relationships":"Pruebas para identificar relaciones",
        "Direct: a straight line through the origin. Double x and y doubles; triple x and y triples.":"Directa: una recta que pasa por el origen. Si x se duplica, la variable y se duplica; si x se triplica, la variable y se triplica.",
        "Ratio test: y ÷ x is the same in every row, and that value is the constant (aluminum: 2.7 g/cm³).":"En una relación directa, y ÷ x da el mismo valor en todas las filas, y ese valor es la constante (aluminio: 2.7 g/cm³).",
        "Inverse: a curve that drops steeply, then flattens out and never touches the axes. Double x and y is cut in half.":"Inversa: una curva que baja de forma pronunciada, luego se aplana y nunca toca los ejes. Si x se duplica, la variable y se reduce a la mitad.",
        "Product test: x × y is the same in every row (Boyle's law: PV = 400 kPa·L).":"Prueba del producto: x × y da el mismo valor en todas las filas (ley de Boyle: PV = 400 kPa·L).",
        "Linear but not direct: a straight line that does not pass through the origin, like a beaker plus water that starts at 50 g.":"Lineal pero no directa: una recta que no pasa por el origen, como un vaso de precipitados con agua que empieza en 50 g.",
        "Squared: a curve that bends upward. Double x and y is multiplied by 4; triple x and y is multiplied by 9.":"Cuadrática: una curva que se dobla hacia arriba. Si x se duplica, la variable y se multiplica por 4; si x se triplica, la variable y se multiplica por 9.",
        "Test by doubling x: see what happens to y.":"Para identificar la relación, duplica x y observa qué le pasa a y.",
        "Practice for the Direct and Inverse Relationships lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Relaciones directas e inversas de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
