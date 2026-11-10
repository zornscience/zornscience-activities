(function () {
  "use strict";
  // Vectors Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The rules follow the lesson on zornscience.org: a scalar has a size only and a vector has a magnitude and a
  // direction; an arrow's length shows the magnitude with a scale and it points from tail to tip; vectors add tip to
  // tail; in the same direction the magnitudes add, in opposite directions they subtract and the resultant takes the
  // larger one's direction; perpendicular vectors give R = √(A² + B²) with the direction from tan⁻¹ in compass form
  // ("53° north of east"); components are R cos θ and R sin θ with θ from the horizontal, and sin and cos switch when
  // θ is measured from the vertical. Directions are compass words (east, west, north, south, upward, downward); there
  // are no signed components. Answers from trigonometry round to 2 significant figures and angles to the nearest
  // degree, as advice; they are kept as 17-digit decimal strings, and a value within 1e-9 (relative) of a rounding
  // tie is drawn again, so floating point never decides a rounding. Sums along a line are exact.
  var SLUG = "qs-vectors-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    function same(text) { return p(text, text); }
    var int = M.int, pick = M.pick, show = M.pretty, DEG = Math.PI / 180, INV = "⁻¹", SF2 = {sf:2};
    var ROUND = p("Round to 2 significant figures.", "Redondea a 2 cifras significativas.");
    var NEAREST = p("Round to the nearest degree.", "Redondea al grado más cercano.");
    var UNITS = {
      N:["N", "newtons", "newton"],
      m:["m", "meters", "meter", "metres", "metre", "metros", "metro"],
      km:["km", "kilometers", "kilometer", "kilometres", "kilómetros", "kilómetro"],
      "m/s":["m/s", "m s^-1", "m·s^-1", "meters per second", "metros por segundo"],
      "°":["°", "deg", "degree", "degrees", "grado", "grados"]
    };

    // Rounding trigonometry safely (as in Trigonometry Basics Practice).
    function nearTie(x, n) {
      var a = Math.abs(x), s = a / Math.pow(10, Math.floor(Math.log10(a)) - n + 1);
      return Math.abs(s - Math.floor(s) - 0.5) <= 1e-9 * s;
    }
    // Also drawn again: a value whose third significant figure rounds to a 5 (18.4977 is 18.5 to three figures), so
    // a student who keeps three figures and one who rounds once to two never get different answers (18.5 would round to 19).
    function rerounds(x) {
      var a = Math.abs(x), s = a / Math.pow(10, Math.floor(Math.log10(a)) - 1);
      return Math.abs(s - Math.floor(s) - 0.5) < 0.05;
    }
    function two(x) {
      if (!isFinite(x) || x <= 0 || nearTie(x, 2) || rerounds(x)) return null;
      var text = x.toPrecision(17), shown = M.write(text, SF2, "plain");
      return M.read(shown).sf === 2 ? {text:text, shown:shown} : null;
    }
    function angle(x) {
      var a = two(x);
      return a && Number(a.shown) >= 11 && Number(a.shown) <= 88 && a.shown !== "45" ? a : null;
    }
    function round2(x) { return M.write(x.toPrecision(17), SF2, "plain"); }
    function traps(answer, list) {
      var key = M.rounded(answer, SF2).value;
      // A value is a number from trigonometry (dropped near a rounding tie, where its note could miss) or an exact value.
      return list.filter(function (t) {
        if (typeof t.value !== "number") return M.sign(t.value) && M.cmp(M.rounded(t.value, SF2).value, key) !== 0;
        return isFinite(t.value) && t.value !== 0 && !nearTie(t.value, 2) && M.cmp(M.rounded(t.value.toPrecision(17), SF2).value, key) !== 0;
      }).map(function (t) { return {answer:typeof t.value === "number" ? t.value.toPrecision(17) : t.value.n + "/" + t.value.d, note:t.note}; });
    }
    function length(r, lo, hi) {
      for (;;) {
        var x = lo + r() * (hi - lo), n = x < 10 ? 2 : pick(r, [2, 3]), text = M.write(x.toFixed(6), {sf:n}, "plain");
        if (M.read(text).sf === n && Number(text) >= lo && Number(text) <= hi) return text;
      }
    }
    function amount(text, unit) { return unit === "°" ? show(text) + "°" : show(text) + " " + unit; }
    var RADIAN = p("Check that your calculator is in degree mode: sin(30) should give 0.5. If it gives −0.988, it is in radian mode.",
      "Revisa que tu calculadora esté en modo de grados: SIN(30) debe dar 0.5. Si da −0.988, está en modo de radianes.");
    var RADIAN_ANGLE = p("That angle is in radians. Set your calculator to degree mode and find the angle again.",
      "Ese ángulo está en radianes. Pon tu calculadora en modo de grados y calcula el ángulo otra vez.");
    function numeric(answer, unit, prompt, explanation, list, instruction, precision) {
      var display = unit === "°" ? answer.shown + "°" : answer.shown + " " + unit;
      return {type:"numeric", answer:answer.text, precision:precision || SF2, unit:unit, accept:UNITS[unit], check:{sf:"advice", unit:"optional"},
        display:display, answerText:same(amount(answer.shown, unit)), traps:list, instruction:instruction, prompt:prompt, explanation:explanation};
    }

    // Directions in compass words. at: "7 N east" / "7 N al este"; to: "points east" / "apunta hacia el este".
    var DIR = {
      east:{en:"east", at:"al este", to:"hacia el este", name:"este", opp:"west"},
      west:{en:"west", at:"al oeste", to:"hacia el oeste", name:"oeste", opp:"east"},
      north:{en:"north", at:"al norte", to:"hacia el norte", name:"norte", opp:"south"},
      south:{en:"south", at:"al sur", to:"hacia el sur", name:"sur", opp:"north"},
      up:{en:"upward", at:"hacia arriba", to:"hacia arriba", opp:"down"},
      down:{en:"downward", at:"hacia abajo", to:"hacia abajo", opp:"up"}
    };
    function vec(n, u, d) { return p(amount(n, u) + " " + DIR[d].en, amount(n, u) + " " + DIR[d].at); }
    function toward(d) { return p(DIR[d].en, DIR[d].to); }
    function ref(dy, dx) { return p(dy + " of " + dx, "al " + DIR[dy].name + " del " + DIR[dx].name); }

    // Scalars and vectors. One number for all four choices, so only the unit and the direction tell them apart.
    var VECTOR_KINDS = [{u:"N", d:"up"}, {u:"N", d:"down"}, {u:"m/s", d:"east"}, {u:"km/h", d:"north"}, {u:"km", d:"west"}, {u:"m", d:"south"}, {u:"m/s²", d:"down"}];
    var SCALAR_KINDS = [
      {u:"kg", why:p("Mass has a size only. It has no direction.", "La masa solo tiene magnitud. No tiene dirección.")},
      {u:"s", why:p("Time has a size only. It has no direction.", "El tiempo solo tiene magnitud. No tiene dirección.")},
      {u:"°C", why:p("Temperature has a size only. It has no direction.", "La temperatura solo tiene magnitud. No tiene dirección.")},
      {u:"J", why:p("Energy has a size only. It has no direction.", "La energía solo tiene magnitud. No tiene dirección.")},
      {u:"mL", why:p("Volume has a size only. It has no direction.", "El volumen solo tiene magnitud. No tiene dirección.")},
      {u:"m/s", why:p("With no direction, {x} is a speed, a scalar. A velocity also gives a direction.", "Sin dirección, {x} es una rapidez, un escalar. Una velocidad también indica una dirección.")},
      {u:"km", why:p("With no direction, {x} is a distance, a scalar. A displacement also gives a direction.", "Sin dirección, {x} es una distancia, un escalar. Un desplazamiento también indica una dirección.")}
    ];
    function vectorText(n, i) { return vec(n, VECTOR_KINDS[i].u, VECTOR_KINDS[i].d); }
    function scalarText(n, i) { return same(amount(n, SCALAR_KINDS[i].u)); }
    function kindQuestion(params) {
      var vector = params[0] === "vector", n = params[1], idx = params.slice(2).map(Number);
      var texts = idx.map(function (i, k) { return (k === 0) === vector ? vectorText(n, i) : scalarText(n, i); });
      var choices = texts.map(function (t, k) {
        if (!k) return {text:t, why:p("", "")};
        return {text:t, why:vector ? fill(SCALAR_KINDS[idx[k]].why, {x:t}) : fill(p("{x} has a magnitude and a direction, so it is a vector.", "{x} tiene magnitud y dirección, así que es un vector."), {x:t})};
      });
      return {type:"mc", answer:0, prompt:vector ? p("Which quantity is a vector?", "¿Qué cantidad es un vector?") : p("Which quantity is a scalar?", "¿Qué cantidad es un escalar?"),
        choices:choices,
        explanation:fill(vector ? p("{x} has a magnitude and a direction, so it is a vector. The other quantities have a size only.", "{x} tiene magnitud y dirección, así que es un vector. Las otras cantidades solo tienen magnitud.") :
          p("{x} has a size only, so it is a scalar. The other quantities give a direction too, so they are vectors.", "{x} solo tiene magnitud, así que es un escalar. Las otras cantidades también indican una dirección, así que son vectores."), {x:texts[0]})};
    }
    function makeKind(r) {
      var vector = r() < 0.5, n = String(int(r, 2, 95)), many = vector ? SCALAR_KINDS : VECTOR_KINDS, one = vector ? VECTOR_KINDS : SCALAR_KINDS;
      var rest = M.shuffle(many.map(function (_, i) { return i; }), r).slice(0, 3);
      return [vector ? "vector" : "scalar", n, String(int(r, 0, one.length - 1))].concat(rest.map(String));
    }
    // Arrows on a grid: length times the scale is the magnitude; the tip gives the direction.
    var ARROWS = [
      {u:"N", what:p("A force", "Una fuerza"), scales:[2, 5, 10, 20, 25, 50]},
      {u:"m/s", what:p("A velocity", "Una velocidad"), scales:[2, 4, 5, 10]},
      {u:"m", what:p("A displacement", "Un desplazamiento"), scales:[5, 10, 20, 50, 100]},
      {u:"km", what:p("A displacement", "Un desplazamiento"), scales:[2, 5, 10]}
    ];
    function arrowQuestion(params) {
      var a = ARROWS[Number(params[0])], n = Number(params[1]), s = Number(params[2]), d = params[3], u = a.u, ns = String(n * s);
      return {type:"mc", answer:0,
        prompt:fill(p("{what} is drawn as an arrow {n} squares long, with its tip pointing {dir}. The scale is 1 square = {s}. What does the arrow show?",
          "{what} se dibuja como una flecha de {n} cuadros, con la punta {dir}. La escala es 1 cuadro = {s}. ¿Qué muestra la flecha?"), {what:a.what, n:String(n), dir:toward(d), s:amount(String(s), u)}),
        choices:[
          {text:vec(ns, u, d), why:p("", "")},
          {text:vec(String(n), u, d), why:fill(p("Use the scale: each square is {s}, so {n} squares is {ns}.", "Usa la escala: cada cuadro es {s}, así que {n} cuadros son {ns}."), {s:amount(String(s), u), n:String(n), ns:amount(ns, u)})},
          {text:vec(String(n + s), u, d), why:fill(p("Multiply by the scale: {n} × {s} = {ns}. Do not add.", "Multiplica por la escala: {n} × {s} = {ns}. No sumes."), {n:String(n), s:amount(String(s), u), ns:amount(ns, u)})},
          {text:same(amount(ns, u)), why:fill(p("{what} is a vector, so give its direction too.", "{what} es un vector, así que también indica su dirección."), {what:a.what})}],
        explanation:fill(p("The length gives the magnitude: {n} squares × {s} = {ns}. The arrow points from its tail to its tip, so the direction is {dir}.",
          "La longitud da la magnitud: {n} cuadros × {s} = {ns}. La flecha va de la cola a la punta, así que la dirección es {dir}."),
          {n:String(n), s:amount(String(s), u), ns:amount(ns, u), dir:toward(d)})};
    }

    // Vectors in a line. Both magnitudes have the same decimal places, so sums and differences are exact.
    function magnitude(r, range) {
      return range[2] ? (int(r, range[0] * 10, range[1] * 10) / 10).toFixed(1) : String(int(r, range[0], range[1]));
    }
    function places(text) { var i = text.indexOf("."); return i < 0 ? 0 : text.length - i - 1; }
    function lineMath(a, b, sameWay) {
      var d = places(a), sum = M.fixed(M.add(a, b), -d), diff = M.fixed(M.abs(M.sub(a, b)), -d);
      return {d:d, sum:sum, diff:diff, big:M.cmp(a, b) >= 0 ? "a" : "b", value:sameWay ? sum : diff};
    }
    function lineExplain(params, u) {
      var a = params[1], da = params[2], b = params[3], db = params[4], L = lineMath(a, b, da === db);
      if (da === db) return fill(p("Both vectors point {dir}, so add: {a} + {b} = {sum}.", "Los dos vectores apuntan {dir}, así que suma: {a} + {b} = {sum}."),
        {dir:toward(da), a:amount(a, u), b:amount(b, u), sum:amount(L.sum, u)});
      var big = L.big === "a" ? a : b, small = L.big === "a" ? b : a, dir = L.big === "a" ? da : db;
      return fill(p("The vectors point in opposite directions, so subtract: {big} − {small} = {diff}. The resultant points {dir}, the direction of the larger one.",
        "Los vectores apuntan en direcciones opuestas, así que resta: {big} − {small} = {diff}. La resultante apunta {dir}, la dirección del mayor."),
        {big:amount(big, u), small:amount(small, u), diff:amount(L.diff, u), dir:toward(dir)});
    }
    var LINES = {
      box:{u:"N", axis:["east", "west"], range:[5, 60, 0], text:p("Two forces act on a box: {a} and {b}. What is the net force?", "Dos fuerzas actúan sobre una caja: {a} y {b}. ¿Cuál es la fuerza neta?")},
      walk:{u:"m", axis:["north", "south"], range:[3, 90, 0], text:p("A student walks {a}, then {b}. What is the student's displacement?", "Un estudiante camina {a} y luego {b}. ¿Cuál es su desplazamiento?")},
      boat:{u:"m/s", axis:["east", "west"], range:[0.5, 6.5, 1], text:p("A boat moves {a} relative to the water. The river flows {b}. What is the boat's velocity relative to the shore?", "Un bote se mueve {a} respecto al agua. El río fluye {b}. ¿Cuál es la velocidad del bote respecto a la orilla?")}
    };
    var SUMS = {
      tug:{u:"N", modes:["opp"], axis:["east", "west"], range:[150, 600, 0], text:p("In a tug of war, one team pulls with {a} and the other team pulls with {b}. What is the magnitude of the net force?", "En una competencia de jalar la cuerda, un equipo jala con {a} y el otro equipo jala con {b}. ¿Cuál es la magnitud de la fuerza neta?")},
      push:{u:"N", modes:["same"], axis:["east", "west"], range:[20, 300, 0], text:p("Two students push a cart. One pushes with {a} and the other with {b}. What is the magnitude of the net force?", "Dos estudiantes empujan un carrito. Uno empuja con {a} y el otro con {b}. ¿Cuál es la magnitud de la fuerza neta?")},
      dog:{u:"m", modes:["same", "opp"], axis:["north", "south"], range:[3, 90, 0], text:p("A dog runs {a}, then {b}. What is the magnitude of its displacement?", "Un perro corre {a} y luego {b}. ¿Cuál es la magnitud de su desplazamiento?")},
      hike:{u:"km", modes:["same", "opp"], axis:["east", "west"], range:[0.5, 9.5, 1], text:p("A hiker walks {a}, then {b}. What is the magnitude of the hiker's displacement?", "Un excursionista camina {a} y luego {b}. ¿Cuál es la magnitud de su desplazamiento?")},
      boat:{u:"m/s", modes:["same", "opp"], axis:["east", "west"], range:[0.5, 6.5, 1], text:p("A boat moves {a} relative to the water, and the river flows {b}. What is the magnitude of the boat's velocity relative to the shore?", "Un bote se mueve {a} respecto al agua, y el río fluye {b}. ¿Cuál es la magnitud de la velocidad del bote respecto a la orilla?")}
    };
    function makeLine(r, table) {
      var key = pick(r, Object.keys(table)), c = table[key], mode = pick(r, c.modes || ["same", "opp"]);
      for (;;) {
        var a = magnitude(r, c.range), b = magnitude(r, c.range), da = pick(r, c.axis);
        if (M.cmp(a, b) !== 0 && M.sign(a) && M.sign(b)) return [key, a, da, b, mode === "same" ? da : DIR[da].opp];
      }
    }
    function lineChoiceQuestion(params) {
      var c = LINES[params[0]], u = c.u, a = params[1], da = params[2], b = params[3], db = params[4], sameWay = da === db, L = lineMath(a, b, sameWay);
      var prompt = fill(c.text, {a:vec(a, u, da), b:vec(b, u, db)}), choices;
      var vectorWhy = p("This is a vector, so give its direction too.", "Es un vector, así que también indica su dirección.");
      if (sameWay) choices = [
        {text:vec(L.sum, u, da), why:p("", "")},
        {text:vec(L.diff, u, da), why:fill(p("Both vectors point {dir}, so add the magnitudes.", "Los dos vectores apuntan {dir}, así que suma las magnitudes."), {dir:toward(da)})},
        {text:vec(L.sum, u, DIR[da].opp), why:fill(p("Both vectors point {dir}, so the resultant points {dir} too.", "Los dos vectores apuntan {dir}, así que la resultante también apunta {dir}."), {dir:toward(da)})},
        {text:same(amount(L.sum, u)), why:vectorWhy}];
      else {
        var dir = L.big === "a" ? da : db;
        choices = [
          {text:vec(L.diff, u, dir), why:p("", "")},
          {text:vec(L.diff, u, DIR[dir].opp), why:fill(p("The resultant points {dir}, the direction of the larger vector.", "La resultante apunta {dir}, la dirección del vector mayor."), {dir:toward(dir)})},
          {text:vec(L.sum, u, dir), why:p("The vectors point in opposite directions, so subtract the magnitudes.", "Los vectores apuntan en direcciones opuestas, así que resta las magnitudes.")},
          {text:same(amount(L.diff, u)), why:vectorWhy}];
      }
      return {type:"mc", answer:0, prompt:prompt, choices:choices, explanation:lineExplain(params, u)};
    }
    function lineSumQuestion(params) {
      var c = SUMS[params[0]], u = c.u, a = params[1], da = params[2], b = params[3], db = params[4], sameWay = da === db, L = lineMath(a, b, sameWay);
      var precision = L.d ? {decimals:L.d} : {exact:true};
      var trap = sameWay ? {answer:L.diff, note:p("Both vectors point the same way, so add the magnitudes.", "Los dos vectores apuntan en la misma dirección, así que suma las magnitudes.")} :
        {answer:L.sum, note:p("The vectors point in opposite directions, so subtract the smaller magnitude from the larger one.", "Los vectores apuntan en direcciones opuestas, así que resta la magnitud menor de la mayor.")};
      var q = numeric({text:L.value, shown:L.value}, u, fill(c.text, {a:vec(a, u, da), b:vec(b, u, db)}), lineExplain(params, u), [trap], null, precision);
      return q;
    }

    // Perpendicular vectors: one along east or west, one along north or south, given in either order.
    var RIGHT = {
      walk:{u:"km", range:[0.5, 3], text:p("You walk {a}, then {b}.", "Caminas {a} y luego {b}."),
        far:p("How far are you from where you started?", "¿A qué distancia estás del punto de partida?"),
        way:p("How many degrees {ref} does your displacement point?", "¿Cuántos grados {ref} apunta tu desplazamiento?"),
        dir:p("What is the direction of your displacement?", "¿Cuál es la dirección de tu desplazamiento?")},
      boat:{u:"m/s", range:[0.8, 6], text:p("A boat moves {a} across a river. The current flows {b}.", "Un bote se mueve {a} a través de un río. La corriente fluye {b}."),
        far:p("What is the magnitude of the boat's velocity relative to the shore?", "¿Cuál es la magnitud de la velocidad del bote respecto a la orilla?"),
        way:p("How many degrees {ref} does the boat move?", "¿Cuántos grados {ref} se mueve el bote?"),
        dir:p("What is the direction of the boat's velocity?", "¿Cuál es la dirección de la velocidad del bote?")},
      ropes:{u:"N", range:[10, 60], text:p("Two ropes pull on a crate: {a} and {b}.", "Dos cuerdas jalan una caja: {a} y {b}."),
        far:p("What is the magnitude of the net force?", "¿Cuál es la magnitud de la fuerza neta?"),
        way:p("How many degrees {ref} does the net force point?", "¿Cuántos grados {ref} apunta la fuerza neta?"),
        dir:p("What is the direction of the net force?", "¿Cuál es la dirección de la fuerza neta?")},
      run:{u:"m", range:[12, 70], text:p("A runner jogs {a}, then {b}.", "Una corredora trota {a} y luego {b}."),
        far:p("What is the magnitude of the runner's displacement?", "¿Cuál es la magnitud del desplazamiento de la corredora?"),
        way:p("How many degrees {ref} does the runner's displacement point?", "¿Cuántos grados {ref} apunta el desplazamiento de la corredora?"),
        dir:p("What is the direction of the runner's displacement?", "¿Cuál es la dirección del desplazamiento de la corredora?")}
    };
    // params: [context, x (east or west magnitude), dx, y (north or south magnitude), dy, order "xy" or "yx"]
    function rightParts(params) {
      var c = RIGHT[params[0]], x = params[1], dx = params[2], y = params[3], dy = params[4], first = params[5] === "xy";
      var vx = vec(x, c.u, dx), vy = vec(y, c.u, dy);
      return {c:c, x:x, dx:dx, y:y, dy:dy, setup:fill(c.text, {a:first ? vx : vy, b:first ? vy : vx}), A:first ? x : y, B:first ? y : x};
    }
    function rightLength(x, y) { return two(Math.sqrt(Number(x) * Number(x) + Number(y) * Number(y))); }
    function rightAngle(x, y) { return angle(Math.atan(Number(y) / Number(x)) / DEG); }
    function makeRight(r, needAngle) {
      for (;;) {
        var key = pick(r, Object.keys(RIGHT)), c = RIGHT[key], x = length(r, c.range[0], c.range[1]), y = length(r, c.range[0], c.range[1]);
        var R = rightLength(x, y);
        if (R && Number(R.shown) < 100 && (!needAngle || rightAngle(x, y))) return [key, x, pick(r, ["east", "west"]), y, pick(r, ["north", "south"]), pick(r, ["xy", "yx"])];
      }
    }
    function rightMagnitude(params) {
      var s = rightParts(params), u = s.c.u, R = rightLength(s.x, s.y);
      return numeric(R, u, join([s.setup, s.c.far]),
        fill(p("The vectors are perpendicular, so use the Pythagorean theorem: R = √(({A})<sup>2</sup> + ({B})<sup>2</sup>) = {R}.",
          "Los vectores son perpendiculares, así que usa el teorema de Pitágoras: R = √(({A})<sup>2</sup> + ({B})<sup>2</sup>) = {R}."),
          {A:amount(s.A, u), B:amount(s.B, u), R:amount(R.shown, u)}),
        traps(R.text, [
          {value:M.add(s.A, s.B), note:p("The vectors are perpendicular, so do not add the magnitudes. Use R = √(A<sup>2</sup> + B<sup>2</sup>).", "Los vectores son perpendiculares, así que no sumes las magnitudes. Usa R = √(A<sup>2</sup> + B<sup>2</sup>).")},
          {value:M.add(M.mul(s.A, s.A), M.mul(s.B, s.B)), note:p("Take the square root at the end: R = √(A<sup>2</sup> + B<sup>2</sup>).", "Saca la raíz cuadrada al final: R = √(A<sup>2</sup> + B<sup>2</sup>).")}]),
        ROUND);
    }
    function directionExplain(s, ans) {
      return fill(p("Measure from {dx}, so tan θ = {y}/{x}, the {dy} vector over the {dx} vector. θ = tan" + INV + "({y}/{x}) = {ans}°, so the direction is {ans}° {ref}.",
        "Mide desde el {dxes}, así que tan θ = {y}/{x}, el vector al {dyes} entre el vector al {dxes}. θ = tan" + INV + "({y}/{x}) = {ans}°, así que la dirección es {ans}° {ref}."),
        {dx:s.dx, dy:s.dy, dxes:DIR[s.dx].name, dyes:DIR[s.dy].name, x:show(s.x), y:show(s.y), ans:show(ans.shown), ref:ref(s.dy, s.dx)});
    }
    function invertedNote(s) {
      return fill(p("That ratio is upside down. For an angle {ref}, tan θ = ({dy} vector)/({dx} vector).", "Esa relación está invertida. Para un ángulo {ref}, tan θ = (vector al {dyes})/(vector al {dxes})."),
        {ref:ref(s.dy, s.dx), dy:s.dy, dx:s.dx, dyes:DIR[s.dy].name, dxes:DIR[s.dx].name});
    }
    function rightDirection(params) {
      var s = rightParts(params), ans = rightAngle(s.x, s.y), x = Number(s.x), y = Number(s.y);
      return numeric(ans, "°", join([s.setup, fill(s.c.way, {ref:ref(s.dy, s.dx)})]), directionExplain(s, ans),
        traps(ans.text, [{value:Math.atan(x / y) / DEG, note:invertedNote(s)}, {value:Math.atan(y / x), note:RADIAN_ANGLE}]), NEAREST);
    }
    function rightWords(params) {
      var s = rightParts(params), ans = rightAngle(s.x, s.y), other = round2(Math.atan(Number(s.x) / Number(s.y)) / DEG), rad = round2(Math.atan(Number(s.y) / Number(s.x)));
      var flip = DIR[s.dy].opp;
      function dirText(deg, dy) { return p(show(deg) + "° " + dy + " of " + s.dx, show(deg) + "° al " + DIR[dy].name + " del " + DIR[s.dx].name); }
      return {type:"mc", answer:0, prompt:join([s.setup, s.c.dir]),
        choices:[
          {text:dirText(ans.shown, s.dy), why:p("", "")},
          {text:dirText(other, s.dy), why:invertedNote(s)},
          {text:dirText(ans.shown, flip), why:fill(p("The {dy} vector moves the resultant {dy}, so the direction is {dy} of {dx}.", "El vector al {dyes} mueve la resultante hacia el {dyes}, así que la dirección es al {dyes} del {dxes}."),
            {dy:s.dy, dx:s.dx, dyes:DIR[s.dy].name, dxes:DIR[s.dx].name})},
          {text:dirText(rad, s.dy), why:fill(p("{rad} is the angle in radians. In degree mode, tan" + INV + "({y}/{x}) = {ans}°.", "{rad} es el ángulo en radianes. En modo de grados, tan" + INV + "({y}/{x}) = {ans}°."),
            {rad:show(rad), y:show(s.y), x:show(s.x), ans:show(ans.shown)})}],
        explanation:directionExplain(s, ans)};
    }

    // Components. With θ from the horizontal (or from east), R_x = R cos θ and R_y = R sin θ; from the vertical (or
    // from north) they switch.
    var FRAMES = {
      h:{
        kick:{u:"m/s", s:"v", range:[8, 30], t:[15, 75], setup:p("A ball is kicked at {v} at {t} above the horizontal.", "Una pelota se patea a {v} con un ángulo de {t} sobre la horizontal."),
          from:p("from the horizontal", "desde la horizontal"), x:p("horizontal component of its velocity", "componente horizontal de su velocidad"), y:p("vertical component of its velocity", "componente vertical de su velocidad")},
        wagon:{u:"N", s:"F", range:[20, 90], t:[15, 60], setup:p("A rope pulls a wagon with a force of {v} at {t} above the horizontal.", "Una cuerda jala un carrito con una fuerza de {v} con un ángulo de {t} sobre la horizontal."),
          from:p("from the horizontal", "desde la horizontal"), x:p("horizontal component of the force", "componente horizontal de la fuerza"), y:p("vertical component of the force", "componente vertical de la fuerza")},
        hike:{u:"km", s:"R", range:[1, 9], t:[15, 75], setup:p("A hiker walks {v} at {t} north of east.", "Un excursionista camina {v} con un ángulo de {t} al norte del este."),
          from:p("from east", "desde el este"), x:p("east component of the displacement", "componente hacia el este del desplazamiento"), y:p("north component of the displacement", "componente hacia el norte del desplazamiento")}
      },
      v:{
        rope:{u:"N", s:"F", range:[20, 90], t:[10, 60], setup:p("A rope pulls on a crate with a force of {v} at {t} from the vertical.", "Una cuerda jala una caja con una fuerza de {v} con un ángulo de {t} respecto a la vertical."),
          from:p("from the vertical", "desde la vertical"), x:p("horizontal component of the force", "componente horizontal de la fuerza"), y:p("vertical component of the force", "componente vertical de la fuerza")},
        toss:{u:"m/s", s:"v", range:[8, 30], t:[10, 60], setup:p("A ball is thrown at {v} at {t} from the vertical.", "Una pelota se lanza a {v} con un ángulo de {t} respecto a la vertical."),
          from:p("from the vertical", "desde la vertical"), x:p("horizontal component of its velocity", "componente horizontal de su velocidad"), y:p("vertical component of its velocity", "componente vertical de su velocidad")},
        hike:{u:"km", s:"R", range:[1, 9], t:[15, 75], setup:p("A hiker walks {v} at {t} east of north.", "Un excursionista camina {v} con un ángulo de {t} al este del norte."),
          from:p("from north", "desde el norte"), x:p("east component of the displacement", "componente hacia el este del desplazamiento"), y:p("north component of the displacement", "componente hacia el norte del desplazamiento")}
      }
    };
    var FN = {sin:p("sin", "sen"), cos:same("cos"), tan:same("tan")}, FNAME = {sin:p("sine", "el seno"), cos:p("cosine", "el coseno")};
    var MATH = {sin:Math.sin, cos:Math.cos, tan:Math.tan};
    // The function for a component: from the horizontal, x uses cos and y uses sin; from the vertical they switch.
    function fnFor(frame, comp) { return (frame === "h") === (comp === "x") ? "cos" : "sin"; }
    function at(f, t) { return p(FN[f].en + " " + t + "°", FN[f].es + " " + t + "°"); }
    function product(v, f, t) { var a = at(f, t); return p("(" + v + ")(" + a.en + ")", "(" + v + ")(" + a.es + ")"); }
    function component(frame, comp, v, t) { return two(Number(v) * MATH[fnFor(frame, comp)](Number(t) * DEG)); }
    function componentExplain(frame, c, comp, v, t, ans) {
      var f = fnFor(frame, comp), sym = c.s + "<sub>" + comp + "</sub>", e = product(amount(v, c.u), f, t);
      return fill(frame === "h" ? p("The angle is measured {from}, so the {name} uses {fname}: {sym} = {e} = {ans}.", "El ángulo se mide {from}, así que la {name} usa {fname}: {sym} = {e} = {ans}.") :
        p("The angle is measured {from}, so sine and cosine switch: the {name} uses {fname}. {sym} = {e} = {ans}.", "El ángulo se mide {from}, así que el seno y el coseno se intercambian: la {name} usa {fname}. {sym} = {e} = {ans}."),
        {from:c.from, name:c[comp], fname:FNAME[f], sym:sym, e:e, ans:amount(ans.shown, c.u)});
    }
    function makeComponent(r, frame) {
      var F = frame || pick(r, ["h", "v"]), key = pick(r, Object.keys(FRAMES[F])), c = FRAMES[F][key];
      for (;;) {
        var comp = pick(r, ["x", "y"]), v = length(r, c.range[0], c.range[1]), t = String(int(r, c.t[0], c.t[1])), ans = component(F, comp, v, t);
        if (t !== "45" && ans && Number(ans.shown) < 100) return (frame ? [] : [F]).concat([key, comp, v, t]);
      }
    }
    function componentQuestion(frame, params) {
      var c = FRAMES[frame][params[0]], comp = params[1], v = params[2], t = params[3], f = fnFor(frame, comp), ans = component(frame, comp, v, t);
      var other = f === "cos" ? "sin" : "cos";
      var swapNote = fill(frame === "h" ? p("Sine and cosine are switched. With the angle measured {from}, the {name} uses {fname}.", "El seno y el coseno están intercambiados. Con el ángulo medido {from}, la {name} usa {fname}.") :
        p("The angle is measured {from}, so sine and cosine switch: the {name} uses {fname}.", "El ángulo se mide {from}, así que el seno y el coseno se intercambian: la {name} usa {fname}."), {from:c.from, name:c[comp], fname:FNAME[f]});
      return numeric(ans, c.u, join([fill(c.setup, {v:amount(v, c.u), t:t + "°"}), fill(p("What is the {name}?", "¿Cuál es la {name}?"), {name:c[comp]})]),
        componentExplain(frame, c, comp, v, t, ans),
        traps(ans.text, [{value:Number(v) * MATH[other](Number(t) * DEG), note:swapNote}, {value:Number(v) * MATH[f](Number(t)), note:RADIAN}]), ROUND);
    }
    function expressionQuestion(params) {
      var frame = params[0], c = FRAMES[frame][params[1]], comp = params[2], v = params[3], t = params[4], f = fnFor(frame, comp), ans = component(frame, comp, v, t);
      var other = f === "cos" ? "sin" : "cos", V = amount(v, c.u), d = at(f, t);
      var otherName = c[comp === "x" ? "y" : "x"];
      return {type:"mc", answer:0, prompt:join([fill(c.setup, {v:V, t:t + "°"}), fill(p("Which expression gives the {name}?", "¿Qué expresión da la {name}?"), {name:c[comp]})]),
        choices:[
          {text:product(V, f, t), why:p("", "")},
          {text:product(V, other, t), why:fill(p("That gives the {name}.", "Eso da la {name}."), {name:otherName})},
          {text:p(V + " ÷ " + d.en, V + " ÷ " + d.es), why:p("A component is never larger than the vector, so multiply. Do not divide.", "Una componente nunca es mayor que el vector, así que multiplica. No dividas.")},
          {text:product(V, "tan", t), why:p("Tangent compares the two components. To get a component from the vector, use sine or cosine.", "La tangente compara las dos componentes. Para obtener una componente a partir del vector, usa seno o coseno.")}],
        explanation:componentExplain(frame, c, comp, v, t, ans)};
    }

    var topics = [
      {id:"kind", title:p("Scalars and vectors", "Escalares y vectores")},
      {id:"line", title:p("Same and opposite directions", "Misma dirección y direcciones opuestas")},
      {id:"right", title:p("Perpendicular vectors", "Vectores perpendiculares")},
      {id:"comp", title:p("Components", "Componentes de vectores")}
    ];
    var generators = [
      {key:"sv", topic:"kind", make:makeKind, build:kindQuestion},
      {key:"sa", topic:"kind", make:function (r) {
        for (;;) {
          var i = int(r, 0, ARROWS.length - 1), n = int(r, 2, 15), s = pick(r, ARROWS[i].scales);
          if (n + s !== n * s) return [String(i), String(n), String(s), pick(r, Object.keys(DIR))];
        }
      }, build:arrowQuestion},
      {key:"ca", topic:"line", make:function (r) { return makeLine(r, LINES); }, build:lineChoiceQuestion},
      {key:"cn", topic:"line", make:function (r) { return makeLine(r, SUMS); }, build:lineSumQuestion},
      {key:"pm", topic:"right", make:function (r) { return makeRight(r, false); }, build:rightMagnitude},
      {key:"pd", topic:"right", make:function (r) { return makeRight(r, true); }, build:rightDirection},
      {key:"pw", topic:"right", make:function (r) { return makeRight(r, true); }, build:rightWords},
      {key:"kh", topic:"comp", make:function (r) { return makeComponent(r, "h"); }, build:function (params) { return componentQuestion("h", params); }},
      {key:"kv", topic:"comp", make:function (r) { return makeComponent(r, "v"); }, build:function (params) { return componentQuestion("v", params); }},
      {key:"ke", topic:"comp", make:function (r) { return makeComponent(r, null); }, build:expressionQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/advanced-tools/vectors/",
      copy:{title:"Vectors Practice", es:{
        "Vectors Practice":"Práctica de vectores",
        "Quantitative Skills · Advanced Tools":"Habilidades cuantitativas · Herramientas avanzadas",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator in degree mode. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y una calculadora en modo de grados. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type your answer as a number. A unit after it is optional, like 8.6 m/s or 37°.":"Escribe tu respuesta como un número. La unidad después es opcional, como 8.6 m/s o 37°.",
        "Round to 2 significant figures, or angles to the nearest degree, when a question says so. Keep your calculator in degree mode.":"Redondea a 2 cifras significativas, o los ángulos al grado más cercano, cuando la pregunta lo indique. Mantén tu calculadora en modo de grados.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 8.6 or 37. You may add the unit after it.":"Escribe un número como 8.6 o 37. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Vector rules":"Reglas de los vectores",
        "A scalar has a size only, like 15 kg or 15 m/s. A vector has a magnitude and a direction, like 15 N upward. Speed is a scalar, and velocity is a vector.":"Un escalar solo tiene magnitud, como 15 kg o 15 m/s. Un vector tiene magnitud y dirección, como 15 N hacia arriba. La rapidez es un escalar, y la velocidad es un vector.",
        "An arrow shows a vector. Its length shows the magnitude with a scale, like 1 square = 10 N, and it points from its tail to its tip.":"Una flecha representa un vector. Su longitud muestra la magnitud con una escala, como 1 cuadro = 10 N, y apunta de la cola a la punta.",
        "Tip to tail: the resultant R runs from the first vector's tail to the last vector's tip. The order does not matter.":"De punta a cola: la resultante R va de la cola del primer vector a la punta del último. El orden no importa.",
        "Same direction: add the magnitudes. Opposite directions: subtract, and use the direction of the larger one.":"Misma dirección: suma las magnitudes. Direcciones opuestas: resta, y usa la dirección del mayor.",
        "Perpendicular: R = √(A² + B²). Find the direction with tan⁻¹ and state it like 53° north of east.":"Perpendiculares: R = √(A² + B²). Calcula la dirección con tan⁻¹ y exprésala como 53° al norte del este.",
        "Components, with θ measured from the horizontal:":"Componentes, con θ medido desde la horizontal:",
        "and":"y", "= R sin θ":"= R sen θ",
        ". If θ is measured from the vertical, sin and cos switch.":". Si θ se mide desde la vertical, sen y cos se intercambian.",
        "Practice for the Vectors lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Vectores de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
