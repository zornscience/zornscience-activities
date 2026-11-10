(function () {
  "use strict";
  // Trigonometry Basics Practice: generated questions for the Quantitative Skills lesson. Every set has new numbers.
  // The rules follow the lesson on zornscience.org: in a right triangle the hypotenuse is across from the 90° angle
  // and is the longest side; opposite and adjacent depend on which acute angle is θ, and they swap when the angle
  // changes; SOH CAH TOA gives sin, cos and tan; a side comes from the ratio that uses the known and wanted sides, and
  // an angle from sin⁻¹, cos⁻¹ or tan⁻¹, always in degree mode. Lengths and ratios round to 2 significant figures and
  // angles to the nearest degree. Rounding is advice here, not the skill, so a right value with extra digits counts.
  // Answers from trigonometry are kept as 17-digit decimal strings, and a value within 1e-9 (relative) of a rounding
  // tie is drawn again, so floating point never decides a rounding.
  var SLUG = "qs-trigonometry-basics-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    function cap(pair) { return p(pair.en.charAt(0).toUpperCase() + pair.en.slice(1), pair.es.charAt(0).toUpperCase() + pair.es.slice(1)); }
    function same(text) { return p(text, text); }
    var int = M.int, pick = M.pick, show = M.pretty, DEG = Math.PI / 180, INV = "⁻¹", SF2 = {sf:2};
    var ROUND = p("Round to 2 significant figures.", "Redondea a 2 cifras significativas.");
    var NEAREST = p("Round to the nearest degree.", "Redondea al grado más cercano.");
    var UNITS = {
      m:["m", "meters", "meter", "metres", "metre", "metros", "metro"],
      cm:["cm", "centimeters", "centimeter", "centimetres", "centímetros", "centímetro"],
      "°":["°", "deg", "degree", "degrees", "grado", "grados"]
    };

    // Rounding trigonometry safely. x is within 1e-9 (relative) of a tie when rounded to n significant figures.
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
    // A positive answer to 2 significant figures, or null when the rounding is unsafe (a near tie) or unclear (zeros
    // at the end that would have to count, like 40 or 120).
    function two(x) {
      if (!isFinite(x) || x <= 0 || nearTie(x, 2) || rerounds(x)) return null;
      var text = x.toPrecision(17), shown = M.write(text, SF2, "plain");
      return M.read(shown).sf === 2 ? {text:text, shown:shown} : null;
    }
    // An angle answer: two figures, 11° to 88°, and not 45° (where θ and the other angle are the same).
    function angle(x) {
      var a = two(x);
      return a && Number(a.shown) >= 11 && Number(a.shown) <= 88 && a.shown !== "45" ? a : null;
    }
    function round2(x) { return M.write(x.toPrecision(17), SF2, "plain"); }
    // Known mistakes, kept only when they round differently from the answer.
    function traps(answer, list) {
      var key = M.rounded(answer, SF2).value;
      // A mistake's value near a rounding tie is dropped too, since its note could miss either rounding.
      return list.filter(function (t) { return isFinite(t.value) && t.value !== 0 && !nearTie(t.value, 2) && M.cmp(M.rounded(t.value.toPrecision(17), SF2).value, key) !== 0; })
        .map(function (t) { return {answer:t.value.toPrecision(17), note:t.note}; });
    }
    // A measured length with 2 or 3 significant figures, written so the count is clear (no zeros at the end of a whole number).
    function length(r, lo, hi) {
      for (;;) {
        var x = lo + r() * (hi - lo), n = x < 10 ? 2 : pick(r, [2, 3]), text = M.write(x.toFixed(6), {sf:n}, "plain");
        if (M.read(text).sf === n && Number(text) >= lo && Number(text) <= hi) return text;
      }
    }
    function measure(x, n) { var text = M.write(x.toFixed(6), {sf:n}, "plain"); return M.read(text).sf === n && Number(text) >= 1 ? text : null; }
    function given(r, range) {
      return range[2] ? (int(r, range[0] * 10, range[1] * 10) / 10).toFixed(1) : String(int(r, range[0], range[1]));
    }
    function amount(text, unit) { return show(text) + " " + unit; }

    var FN = {sin:p("sin", "sen"), cos:same("cos"), tan:same("tan")};
    var FNAME = {sin:p("sine", "el seno"), cos:p("cosine", "el coseno"), tan:p("tangent", "la tangente")};
    var MATH = {sin:Math.sin, cos:Math.cos, tan:Math.tan}, ARC = {sin:Math.asin, cos:Math.acos, tan:Math.atan};
    var WORDS = {sin:p("opposite/hypotenuse", "opuesto/hipotenusa"), cos:p("adjacent/hypotenuse", "adyacente/hipotenusa"), tan:p("opposite/adjacent", "opuesto/adyacente")};
    var TAG = {sin:"SOH", cos:"CAH", tan:"TOA"};
    var LETTERS = {sin:["a", "c"], cos:["b", "c"], tan:["a", "b"]};
    function inv(f) { return p(FN[f].en + INV, FN[f].es + INV); }
    function at(f, t) { return p(FN[f].en + " " + t + "°", FN[f].es + " " + t + "°"); }
    // (10.0 m)(sin 35°) or 0.75 m ÷ tan 4.8°
    function expr(op, known, f, t) {
      var a = at(f, t);
      return op === "mul" ? p("(" + known + ")(" + a.en + ")", "(" + known + ")(" + a.es + ")") : p(known + " ÷ " + a.en, known + " ÷ " + a.es);
    }
    function apply(op, k, f, t, radians) { var v = MATH[f](radians ? t : t * DEG); return op === "mul" ? k * v : k / v; }
    var RADIAN = p("Check that your calculator is in degree mode: sin(30) should give 0.5. If it gives −0.988, it is in radian mode.",
      "Revisa que tu calculadora esté en modo de grados: SIN(30) debe dar 0.5. Si da −0.988, está en modo de radianes.");
    var RADIAN_ANGLE = p("That angle is in radians. Set your calculator to degree mode and find the angle again.",
      "Ese ángulo está en radianes. Pon tu calculadora en modo de grados y calcula el ángulo otra vez.");

    // The triangle on the page: θ at the bottom left, the 90° angle at the bottom right. Side a is opposite θ (the
    // vertical side), side b is adjacent to θ (the bottom side) and side c is the hypotenuse.
    var SIDE = {a:p("side a", "el lado a"), b:p("side b", "el lado b"), c:p("side c", "el lado c")};
    var ROLE = {a:p("opposite θ", "opuesto a θ"), b:p("adjacent to θ", "adyacente a θ"), c:p("the hypotenuse", "la hipotenusa")};
    function roles(x, y) {
      return fill(p("Side {x} is {rx} and side {y} is {ry}", "El lado {x} es {rx} y el lado {y} es {ry}"), {x:x, y:y, rx:ROLE[x], ry:ROLE[y]});
    }
    function triangleIntro(values, unit) {
      var keys = Object.keys(values), parts = keys.map(function (k) { return k + " = " + (k === "θ" ? values[k] + "°" : amount(values[k], unit)); });
      var last = parts.pop();
      return p("In the triangle, " + parts.join(", ") + " and " + last + ".", "En el triángulo, " + parts.join(", ") + " y " + last + ".");
    }

    // Naming the sides. A triangle is given by its three sides (scaled Pythagorean triples), its lengths with one decimal place.
    var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61],
      [16, 63, 65], [33, 56, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97]];
    var SCALES = [0.1, 0.2, 0.3, 0.5, 1, 1.5, 2, 2.5, 3];
    function sides(r) {
      for (;;) {
        var t = pick(r, TRIPLES), k = pick(r, SCALES), flip = r() < 0.5;
        var s = [t[flip ? 1 : 0], t[flip ? 0 : 1], t[2]].map(function (n) { return (n * k).toFixed(1); });
        if (Number(s[0]) >= 1 && Number(s[1]) >= 1 && Number(s[2]) <= 99.9) return s;
      }
    }
    // Which side is asked for: the key (the role it plays), the wrong sides, and a fourth choice that names a misconception.
    // opp, adj and hyp are the sides for θ; for the other acute angle opposite and adjacent swap.
    var ASKS = {
      hyp:{key:"hyp", ask:p("Which side is the hypotenuse?", "¿Qué lado es la hipotenusa?"),
        other:p("It depends on which angle is θ.", "Depende de cuál ángulo es θ."),
        otherWhy:p("The hypotenuse never changes. It is always across from the 90° angle.", "La hipotenusa nunca cambia. Siempre está frente al ángulo de 90°."),
        why:{opp:p("{Opp} is a leg, across from θ. The hypotenuse is across from the 90° angle.", "{Opp} es un cateto, frente a θ. La hipotenusa está frente al ángulo de 90°."),
          adj:p("{Adj} is a leg, next to θ. The hypotenuse is across from the 90° angle.", "{Adj} es un cateto, junto a θ. La hipotenusa está frente al ángulo de 90°.")},
        explain:p("The hypotenuse is across from the 90° angle, so it is {hyp}. It is also the longest side.", "La hipotenusa está frente al ángulo de 90°, así que es {hyp}. También es el lado más largo.")},
      oppT:{key:"opp", ask:p("Which side is opposite θ?", "¿Qué lado es opuesto a θ?"),
        other:p("It depends on which side is longest.", "Depende de cuál lado es más largo."),
        otherWhy:p("Length does not decide it. The opposite side is the one across from θ.", "La longitud no lo decide. El lado opuesto es el que está frente a θ."),
        why:{adj:p("{Adj} touches θ, so it is the adjacent side, not the opposite side.", "{Adj} toca θ, así que es el lado adyacente, no el opuesto."),
          hyp:p("{Hyp} is across from the 90° angle, so it is the hypotenuse.", "{Hyp} está frente al ángulo de 90°, así que es la hipotenusa.")},
        explain:p("{Opp} is across from θ, so it is the opposite side. {Adj} touches θ, so it is the adjacent side.", "{Opp} está frente a θ, así que es el lado opuesto. {Adj} toca θ, así que es el lado adyacente.")},
      adjT:{key:"adj", ask:p("Which side is adjacent to θ?", "¿Qué lado es adyacente a θ?"),
        other:p("Both sides that touch θ", "Los dos lados que tocan θ"),
        otherWhy:p("Only one of them is adjacent. The hypotenuse touches θ too, but it is never called adjacent.", "Solo uno de ellos es adyacente. La hipotenusa también toca θ, pero nunca se llama adyacente."),
        why:{opp:p("{Opp} is across from θ, so it is the side opposite θ.", "{Opp} está frente a θ, así que es el lado opuesto a θ."),
          hyp:p("{Hyp} touches θ, but it is the hypotenuse. The adjacent side is the leg next to θ.", "{Hyp} toca θ, pero es la hipotenusa. El lado adyacente es el cateto junto a θ.")},
        explain:p("{Adj} touches θ and is not the hypotenuse, so it is the adjacent side. {Hyp} touches θ too, but it is the hypotenuse.", "{Adj} toca θ y no es la hipotenusa, así que es el lado adyacente. {Hyp} también toca θ, pero es la hipotenusa.")},
      oppTop:{key:"adj", top:true, ask:p("Which side is opposite that angle?", "¿Qué lado es opuesto a ese ángulo?"),
        other:p("There is none. Only θ has an opposite side.", "Ninguno. Solo θ tiene un lado opuesto."),
        otherWhy:p("Each acute angle has its own opposite side, the one across from it.", "Cada ángulo agudo tiene su propio lado opuesto, el que está frente a él."),
        why:{opp:p("{Opp} is the side opposite θ, but it touches the other angle. When you change the angle, opposite and adjacent swap.", "{Opp} es el lado opuesto a θ, pero toca el otro ángulo. Cuando cambias de ángulo, opuesto y adyacente se intercambian."),
          hyp:p("{Hyp} is the hypotenuse for both acute angles.", "{Hyp} es la hipotenusa para los dos ángulos agudos.")},
        explain:p("{Adj} is across from the other angle, so it is opposite that angle. When you change the angle, opposite and adjacent swap, and the hypotenuse stays the same.", "{Adj} está frente al otro ángulo, así que es el lado opuesto a ese ángulo. Cuando cambias de ángulo, opuesto y adyacente se intercambian, y la hipotenusa no cambia.")},
      adjTop:{key:"opp", top:true, ask:p("Which side is adjacent to that angle?", "¿Qué lado es adyacente a ese ángulo?"),
        other:p("Both sides that touch that angle", "Los dos lados que tocan ese ángulo"),
        otherWhy:p("Only one of them is adjacent. The hypotenuse touches that angle too, but it is never called adjacent.", "Solo uno de ellos es adyacente. La hipotenusa también toca ese ángulo, pero nunca se llama adyacente."),
        why:{adj:p("{Adj} is across from the other angle, so it is the side opposite that angle.", "{Adj} está frente al otro ángulo, así que es el lado opuesto a ese ángulo."),
          hyp:p("{Hyp} touches that angle, but it is the hypotenuse.", "{Hyp} toca ese ángulo, pero es la hipotenusa.")},
        explain:p("{Opp} touches the other angle and is not the hypotenuse, so it is adjacent to that angle. Opposite and adjacent swap when you change the angle.", "{Opp} toca el otro ángulo y no es la hipotenusa, así que es el lado adyacente a ese ángulo. Opuesto y adyacente se intercambian cuando cambias de ángulo.")}
    };
    function namingQuestion(askKey, names, intro, theta, topAngle) {
      var a = ASKS[askKey], order = ["opp", "adj", "hyp"].filter(function (k) { return k !== a.key; });
      var values = {Opp:cap(names.opp), Adj:cap(names.adj), Hyp:cap(names.hyp), opp:names.opp, adj:names.adj, hyp:names.hyp};
      var prompt = [intro];
      if (theta) prompt.push(theta);
      if (a.top) prompt.push(fill(p("Now mark {top} instead of θ.", "Ahora marca {top} en lugar de θ."), {top:topAngle}));
      prompt.push(a.ask);
      var choices = [{text:cap(names[a.key]), why:p("", "")}].concat(order.map(function (k) { return {text:cap(names[k]), why:fill(a.why[k], values)}; }));
      choices.push({text:a.other, why:a.otherWhy});
      return {type:"mc", answer:0, prompt:join(prompt), choices:choices, explanation:fill(a.explain, values)};
    }
    var LETTER_NAMES = {opp:SIDE.a, adj:SIDE.b, hyp:SIDE.c};
    var TOP = p("the other acute angle, at the top of the triangle,", "el otro ángulo agudo, en la parte de arriba del triángulo,");
    // Context naming: θ is at the ground in every case, so the vertical side is opposite θ.
    var SCENES = {
      ladder:{setup:p("A {L} ladder leans against a wall. Its base is {d} from the wall.", "Una escalera de {L} se apoya en una pared. Su base está a {d} de la pared."), L:[3, 9], d:[0.8, 2.5],
        theta:p("θ is the angle between the ladder and the ground.", "θ es el ángulo entre la escalera y el suelo."),
        top:p("the angle between the ladder and the wall", "el ángulo entre la escalera y la pared"),
        hyp:p("the ladder", "la escalera"), opp:p("the height up the wall", "la altura en la pared"), adj:p("the distance from the wall to the base", "la distancia de la pared a la base")},
      ramp:{setup:p("A ramp {L} long rises {d}.", "Una rampa de {L} de largo sube {d}."), L:[2, 9], d:[0.2, 1.5],
        theta:p("θ is the angle between the ramp and the ground.", "θ es el ángulo entre la rampa y el suelo."),
        top:p("the angle at the top of the ramp, between the ramp and the vertical,", "el ángulo en la parte de arriba de la rampa, entre la rampa y la vertical,"),
        hyp:p("the ramp", "la rampa"), opp:p("the height of the ramp", "la altura de la rampa"), adj:p("the horizontal distance under the ramp", "la distancia horizontal debajo de la rampa")},
      tree:{setup:p("You stand {L} from a tree that is {d} tall and look up at its top.", "Estás a {L} de un árbol de {d} de alto y miras hacia su punta."), L:[10, 60], d:[5, 30],
        theta:p("θ is the angle between the ground and your line of sight.", "θ es el ángulo entre el suelo y tu línea de visión."),
        top:p("the angle at the top of the tree, between the tree and your line of sight,", "el ángulo en la punta del árbol, entre el árbol y tu línea de visión,"),
        hyp:p("your line of sight to the top", "tu línea de visión hasta la punta"), opp:p("the height of the tree", "la altura del árbol"), adj:p("the distance from you to the tree", "la distancia de ti al árbol")},
      kite:{setup:p("A kite flies on a string {L} long, {d} above the ground.", "Un papalote vuela con un hilo de {L}, a {d} sobre el suelo."), L:[20, 90], d:[10, 60],
        theta:p("θ is the angle between the string and the ground.", "θ es el ángulo entre el hilo y el suelo."),
        top:p("the angle at the kite, between the string and the vertical,", "el ángulo en el papalote, entre el hilo y la vertical,"),
        hyp:p("the string", "el hilo"), opp:p("the height of the kite", "la altura del papalote"), adj:p("the distance along the ground to the point under the kite", "la distancia por el suelo hasta el punto debajo del papalote")}
    };

    // SOH CAH TOA with the triangle's letters: which ratio, and its value.
    function ratioText(x, y) { return same(show(x) + "/" + show(y)); }
    var RATIO_SIDES = {a:0, b:1, c:2};
    function sidesOf(params) { return {a:params[1], b:params[2], c:params[3]}; }
    function ratioQuestion(params) {
      var f = params[0], s = sidesOf(params), unit = params[4], key = LETTERS[f];
      var others = ["sin", "cos", "tan"].filter(function (g) { return g !== f; });
      var choices = [{text:ratioText(s[key[0]], s[key[1]]), why:p("", "")}].concat(others.map(function (g) {
        return {text:ratioText(s[LETTERS[g][0]], s[LETTERS[g][1]]), why:fill(p("That is {g} θ, {gw}. {f} θ is {fw}.", "Eso es {g} θ, {gw}. {f} θ es {fw}."), {g:FN[g], gw:WORDS[g], f:FN[f], fw:WORDS[f]})};
      }));
      choices.push({text:ratioText(s[key[1]], s[key[0]]), why:fill(f === "tan" ? p("That ratio is upside down. {f} θ is {fw}, with the adjacent side on the bottom.", "Esa relación está invertida. {f} θ es {fw}, con el lado adyacente en el denominador.") :
        p("That ratio is upside down. {f} θ is {fw}, with the hypotenuse on the bottom.", "Esa relación está invertida. {f} θ es {fw}, con la hipotenusa en el denominador."), {f:FN[f], fw:WORDS[f]})});
      return {type:"mc", answer:0, triangle:true,
        prompt:join([triangleIntro(s, unit), fill(p("Which ratio equals {f} θ?", "¿Qué relación es igual a {f} θ?"), {f:FN[f]})]),
        choices:choices,
        explanation:fill(p("{roles}, so {f} θ = {fw} = {r} ({tag}).", "{roles}, así que {f} θ = {fw} = {r} ({tag})."), {roles:roles(key[0], key[1]), f:FN[f], fw:WORDS[f], r:ratioText(s[key[0]], s[key[1]]), tag:TAG[f]})};
    }
    function exactTwo(value) {
      var shown = M.write(value, SF2, "plain");
      return nearTie(M.toNumber(value), 2) || rerounds(M.toNumber(value)) || M.read(shown).sf !== 2 ? null : shown;
    }
    function valueQuestion(params) {
      var f = params[0], s = sidesOf(params), unit = params[4], key = LETTERS[f], value = M.div(s[key[0]], s[key[1]]), shown = exactTwo(value);
      var list = [{value:M.div(s[key[1]], s[key[0]]), note:fill(p("That ratio is upside down. {f} θ = {fw}.", "Esa relación está invertida. {f} θ = {fw}."), {f:FN[f], fw:WORDS[f]})}];
      ["sin", "cos", "tan"].filter(function (g) { return g !== f; }).forEach(function (g) {
        list.push({value:M.div(s[LETTERS[g][0]], s[LETTERS[g][1]]), note:fill(p("That is {g} θ. {f} θ = {fw}.", "Eso es {g} θ. {f} θ = {fw}."), {g:FN[g], f:FN[f], fw:WORDS[f]})});
      });
      var key2 = M.rounded(value, SF2).value;
      var trapList = list.filter(function (t) { return M.cmp(M.rounded(t.value, SF2).value, key2) !== 0; }).map(function (t) { return {answer:t.value.n + "/" + t.value.d, note:t.note}; });
      return {type:"numeric", triangle:true, answer:value.n + "/" + value.d, precision:SF2, unit:null, accept:[], check:{sf:"advice"},
        display:shown, answerText:same(show(shown)), traps:trapList, instruction:ROUND,
        prompt:join([triangleIntro(s, unit), fill(p("What is {f} θ?", "¿Cuánto vale {f} θ?"), {f:FN[f]})]),
        explanation:fill(p("{roles}, so {f} θ = {x}/{y} = {r}/{s} = {ans} ({tag}).", "{roles}, así que {f} θ = {x}/{y} = {r}/{s} = {ans} ({tag})."),
          {roles:roles(key[0], key[1]), f:FN[f], x:key[0], y:key[1], r:show(s[key[0]]), s:show(s[key[1]]), ans:show(shown), tag:TAG[f]})};
    }
    function makeRatio(r, needValue) {
      for (;;) {
        var f = pick(r, ["sin", "cos", "tan"]), s = sides(r), params = [f].concat(s, [pick(r, ["cm", "m"])]);
        if (!needValue || exactTwo(M.div(s[RATIO_SIDES[LETTERS[f][0]]], s[RATIO_SIDES[LETTERS[f][1]]]))) return params;
      }
    }

    // Finding a side. Each case: the side known, the side wanted, the ratio and whether to multiply or divide.
    // Mistakes, in this order: the wrong function, then the other operation (multiplying when the wanted side is on the bottom).
    var MULTIPLY = p("The side you want is on top of the ratio, so multiply. A leg is always shorter than the hypotenuse.", "El lado que buscas está en el numerador de la relación, así que multiplica. Un cateto siempre es más corto que la hipotenusa.");
    var DIVIDE = p("The hypotenuse is on the bottom of the ratio, so divide. The hypotenuse must be the longest side.", "La hipotenusa está en el denominador de la relación, así que divide. La hipotenusa debe ser el lado más largo.");
    var CASES = {
      ca:{known:"c", want:"a", f:"sin", op:"mul", mistakes:[
        {f:"cos", op:"mul", note:p("The side you want is opposite the angle, so use sine: sin θ = opposite/hypotenuse.", "El lado que buscas es opuesto al ángulo, así que usa el seno: sen θ = opuesto/hipotenusa.")},
        {f:"sin", op:"div", note:MULTIPLY}]},
      cb:{known:"c", want:"b", f:"cos", op:"mul", mistakes:[
        {f:"sin", op:"mul", note:p("The side you want is adjacent to the angle, so use cosine: cos θ = adjacent/hypotenuse.", "El lado que buscas es adyacente al ángulo, así que usa el coseno: cos θ = adyacente/hipotenusa.")},
        {f:"cos", op:"div", note:MULTIPLY}]},
      ac:{known:"a", want:"c", f:"sin", op:"div", mistakes:[
        {f:"cos", op:"div", note:p("The side you know is opposite the angle, so use sine: sin θ = opposite/hypotenuse.", "El lado que conoces es opuesto al ángulo, así que usa el seno: sen θ = opuesto/hipotenusa.")},
        {f:"sin", op:"mul", note:DIVIDE}]},
      bc:{known:"b", want:"c", f:"cos", op:"div", mistakes:[
        {f:"sin", op:"div", note:p("The side you know is adjacent to the angle, so use cosine: cos θ = adjacent/hypotenuse.", "El lado que conoces es adyacente al ángulo, así que usa el coseno: cos θ = adyacente/hipotenusa.")},
        {f:"cos", op:"mul", note:DIVIDE}]},
      ba:{known:"b", want:"a", f:"tan", op:"mul", mistakes:[
        {f:"sin", op:"mul", note:p("Neither side is the hypotenuse, so use tangent: tan θ = opposite/adjacent.", "Ninguno de los dos lados es la hipotenusa, así que usa la tangente: tan θ = opuesto/adyacente.")},
        {f:"tan", op:"div", note:p("The side you want is on top of tan θ = opposite/adjacent, so multiply.", "El lado que buscas está en el numerador de tan θ = opuesto/adyacente, así que multiplica.")}]},
      ab:{known:"a", want:"b", f:"tan", op:"div", mistakes:[
        {f:"sin", op:"div", note:p("That is the hypotenuse. For the adjacent side, use tangent: tan θ = opposite/adjacent.", "Esa es la hipotenusa. Para el lado adyacente, usa la tangente: tan θ = opuesto/adyacente.")},
        {f:"tan", op:"mul", note:p("The side you want is on the bottom of tan θ = opposite/adjacent, so divide.", "El lado que buscas está en el denominador de tan θ = opuesto/adyacente, así que divide.")}]}
    };
    function sideAnswer(c, t, k) { return two(apply(CASES[c].op, Number(k), CASES[c].f, Number(t))); }
    function sideTraps(c, t, k, answer) {
      var C = CASES[c], list = C.mistakes.map(function (m) { return {value:apply(m.op, Number(k), m.f, Number(t)), note:m.note}; });
      list.push({value:apply(C.op, Number(k), C.f, Number(t), true), note:RADIAN});
      return traps(answer, list);
    }
    function numeric(answer, unit, prompt, explanation, list, instruction) {
      var deg = unit === "°", display = answer.shown + (unit ? (deg ? "°" : " " + unit) : "");
      return {type:"numeric", answer:answer.text, precision:SF2, unit:unit, accept:unit ? UNITS[unit] : [], check:{sf:"advice", unit:"optional"},
        display:display, answerText:same(show(answer.shown) + (unit ? (deg ? "°" : " " + unit) : "")), traps:list, instruction:instruction,
        prompt:prompt, explanation:explanation};
    }
    function letterSide(params) {
      var c = params[0], t = params[1], k = params[2], u = params[3], C = CASES[c], ans = sideAnswer(c, t, k), values = {θ:t};
      values[C.known] = k;
      var q = numeric(ans, u, join([triangleIntro(values, u), fill(p("How long is side {w}?", "¿Cuánto mide el lado {w}?"), {w:C.want})]),
        fill(p("{roles}, so use {fname}: {at} = {ratio}. {w} = {expr} = {ans}.", "{roles}, así que usa {fname}: {at} = {ratio}. {w} = {expr} = {ans}."),
          {roles:roles(C.want, C.known), fname:FNAME[C.f], at:at(C.f, t), ratio:LETTERS[C.f].join("/"), w:C.want, expr:expr(C.op, amount(k, u), C.f, t), ans:amount(ans.shown, u)}),
        sideTraps(c, t, k, ans.text), ROUND);
      q.triangle = true;
      return q;
    }
    // Context problems, with θ at the ground. range t: [lo, hi, decimal places]; k: the known length in meters.
    var SITUATIONS = {
      rampHeight:{c:"ca", t:[5, 30, 0], k:[2, 8], setup:p("A ramp {k} long makes an angle of {t} with the ground.", "Una rampa de {k} de largo forma un ángulo de {t} con el suelo."),
        ask:p("How high does it rise?", "¿Qué altura alcanza?"), known:p("the ramp", "la rampa"), want:p("the height", "la altura")},
      rampRun:{c:"ab", t:[2, 7, 1], k:[0.2, 0.9], setup:p("A wheelchair ramp rises {k} at an angle of {t} with the ground.", "Una rampa para silla de ruedas sube {k} con un ángulo de {t} con el suelo."),
        ask:p("What horizontal distance does it cover?", "¿Qué distancia horizontal cubre?"), known:p("the rise", "la subida"), want:p("the horizontal distance", "la distancia horizontal")},
      rampLength:{c:"ac", t:[4, 15, 0], k:[0.3, 1.5], setup:p("A ramp must rise {k} at an angle of {t} with the ground.", "Una rampa debe subir {k} con un ángulo de {t} con el suelo."),
        ask:p("How long must the ramp be?", "¿Qué largo debe tener la rampa?"), known:p("the rise", "la subida"), want:p("the length of the ramp", "el largo de la rampa")},
      ladderHeight:{c:"ca", t:[60, 80, 0], k:[3, 9], setup:p("A {k} ladder leans against a wall at an angle of {t} with the ground.", "Una escalera de {k} se apoya en una pared y forma un ángulo de {t} con el suelo."),
        ask:p("How high up the wall does it reach?", "¿Qué altura alcanza en la pared?"), known:p("the ladder", "la escalera"), want:p("the height on the wall", "la altura en la pared")},
      ladderBase:{c:"cb", t:[60, 80, 0], k:[3, 9], setup:p("A {k} ladder leans against a wall at an angle of {t} with the ground.", "Una escalera de {k} se apoya en una pared y forma un ángulo de {t} con el suelo."),
        ask:p("How far is its base from the wall?", "¿A qué distancia de la pared está su base?"), known:p("the ladder", "la escalera"), want:p("the distance from the wall", "la distancia a la pared")},
      ladderLength:{c:"bc", t:[60, 78, 0], k:[0.8, 2.5], setup:p("The base of a ladder must be {k} from a wall, and the ladder must make an angle of {t} with the ground.", "La base de una escalera debe estar a {k} de una pared, y la escalera debe formar un ángulo de {t} con el suelo."),
        ask:p("How long must the ladder be?", "¿Qué largo debe tener la escalera?"), known:p("the distance from the wall", "la distancia a la pared"), want:p("the length of the ladder", "el largo de la escalera")},
      tree:{c:"ba", t:[20, 60, 0], k:[10, 60], setup:p("You stand {k} from the base of a tree. The angle from the ground up to the top of the tree is {t}.", "Estás a {k} de la base de un árbol. El ángulo desde el suelo hasta la punta del árbol es de {t}."),
        ask:p("How tall is the tree?", "¿Qué altura tiene el árbol?"), known:p("the distance along the ground", "la distancia por el suelo"), want:p("the height of the tree", "la altura del árbol")},
      kite:{c:"ca", t:[30, 70, 0], k:[20, 90], setup:p("A kite string {k} long makes an angle of {t} with the ground.", "El hilo de un papalote mide {k} y forma un ángulo de {t} con el suelo."),
        ask:p("How high is the kite?", "¿A qué altura está el papalote?"), known:p("the string", "el hilo"), want:p("the height of the kite", "la altura del papalote")}
    };
    function placeRole(letter, t) {
      return fill({a:p("the side opposite the {t} angle", "el lado opuesto al ángulo de {t}"), b:p("the side adjacent to the {t} angle", "el lado adyacente al ángulo de {t}"),
        c:p("the hypotenuse", "la hipotenusa")}[letter], {t:t + "°"});
    }
    function situationSetup(s, t, k) { return fill(s.setup, {k:amount(k, "m"), t:t + "°"}); }
    function makeSituation(r, extra) {
      for (;;) {
        var key = pick(r, Object.keys(SITUATIONS)), s = SITUATIONS[key], t = given(r, s.t), k = length(r, s.k[0], s.k[1]);
        var ans = sideAnswer(s.c, t, k);
        if (ans && Number(ans.shown) < 100 && (!extra || extra(s, t, k))) return [key, t, k];
      }
    }
    function situationSide(params) {
      var s = SITUATIONS[params[0]], t = params[1], k = params[2], C = CASES[s.c], ans = sideAnswer(s.c, t, k);
      return numeric(ans, "m", join([situationSetup(s, t, k), s.ask]),
        fill(p("{Want} is {rw}, and {known} is {rk}, so use {fname}: {expr} = {ans}.", "{Want} es {rw}, y {known} es {rk}, así que usa {fname}: {expr} = {ans}."),
          {Want:cap(s.want), known:s.known, rw:placeRole(C.want, t), rk:placeRole(C.known, t), fname:FNAME[C.f], expr:expr(C.op, amount(k, "m"), C.f, t), ans:amount(ans.shown, "m")}),
        sideTraps(s.c, t, k, ans.text), ROUND);
    }
    // Radian mode: a student's negative length, and what went wrong.
    function radianWrong(s, t, k) { var C = CASES[s.c]; return apply(C.op, Number(k), C.f, Number(t), true); }
    function radianOK(s, t, k) {
      var C = CASES[s.c], wrong = radianWrong(s, t, k), raw = MATH[C.f](Number(t)), other = C.mistakes[1];
      var fnWrong = two(apply(C.mistakes[0].op, Number(k), C.mistakes[0].f, Number(t))), opWrong = two(apply(other.op, Number(k), other.f, Number(t)));
      return wrong < 0 && Math.abs(wrong) >= 0.1 && Math.abs(wrong) < 1000 && Math.abs(raw) >= 0.01 && !nearTie(wrong, 2) && !nearTie(raw, 2) && fnWrong && opWrong &&
        fnWrong.shown !== sideAnswer(s.c, t, k).shown && opWrong.shown !== sideAnswer(s.c, t, k).shown;
    }
    function radianQuestion(params) {
      var s = SITUATIONS[params[0]], t = params[1], k = params[2], C = CASES[s.c], ans = sideAnswer(s.c, t, k);
      var wrong = amount(round2(radianWrong(s, t, k)), "m"), m0 = C.mistakes[0], m1 = C.mistakes[1];
      var fnValue = amount(two(apply(m0.op, Number(k), m0.f, Number(t))).shown, "m"), opValue = amount(two(apply(m1.op, Number(k), m1.f, Number(t))).shown, "m");
      var raw = show(round2(MATH[C.f](Number(t))));
      return {type:"mc", answer:0,
        prompt:join([situationSetup(s, t, k), fill(p("A student calculates {want} and gets {wrong}. What went wrong?", "Un estudiante calcula {want} y obtiene {wrong}. ¿Qué salió mal?"), {want:s.want, wrong:wrong})]),
        choices:[
          {text:p("The calculator is in radian mode.", "La calculadora está en modo de radianes."), why:p("", "")},
          {text:p("The student used the wrong trig function.", "El estudiante usó la función trigonométrica equivocada."),
            why:fill(p("The other function gives {v}. {Fname} is the right function here, and in degree mode it gives {ans}.", "La otra función da {v}. {Fname} es la función correcta aquí, y en modo de grados da {ans}."), {v:fnValue, Fname:cap(FNAME[C.f]), ans:amount(ans.shown, "m")})},
          {text:C.op === "mul" ? p("The student should have divided.", "El estudiante debió dividir.") : p("The student should have multiplied.", "El estudiante debió multiplicar."),
            why:fill(p("That gives {v}. The setup is right; the calculator is in radian mode.", "Eso da {v}. El planteamiento es correcto; la calculadora está en modo de radianes."), {v:opValue})},
          {text:p("Nothing. A length can be negative.", "Nada. Una longitud puede ser negativa."),
            why:p("A length is never negative. Check the mode: sin(30) should give 0.5.", "Una longitud nunca es negativa. Revisa el modo: SIN(30) debe dar 0.5.")}],
        explanation:fill(p("In radian mode, {key}({t}) gives {raw}, so the result is negative. In degree mode, {expr} = {ans}.", "En modo de radianes, {key}({t}) da {raw}, así que el resultado es negativo. En modo de grados, {expr} = {ans}."),
          {key:p(C.f, C.f.toUpperCase()), t:show(t), raw:raw, expr:expr(C.op, amount(k, "m"), C.f, t), ans:amount(ans.shown, "m")})};
    }

    // Finding an angle with an inverse function. Mistakes: the other acute angle (wrong function or upside-down ratio),
    // tangent with the hypotenuse or sine without it, and radian mode.
    var PAIRS = {
      ac:{f:"sin", x:"a", y:"c", mistakes:[
        {f:"cos", flip:false, note:p("That is the other acute angle. With the side opposite the angle and the hypotenuse, use sin⁻¹.", "Ese es el otro ángulo agudo. Con el lado opuesto al ángulo y la hipotenusa, usa sen⁻¹.")},
        {f:"tan", flip:false, note:p("Tangent is opposite over adjacent. With the hypotenuse, use sin⁻¹ or cos⁻¹.", "La tangente es opuesto entre adyacente. Con la hipotenusa, usa sen⁻¹ o cos⁻¹.")}]},
      bc:{f:"cos", x:"b", y:"c", mistakes:[
        {f:"sin", flip:false, note:p("That is the other acute angle. With the side adjacent to the angle and the hypotenuse, use cos⁻¹.", "Ese es el otro ángulo agudo. Con el lado adyacente al ángulo y la hipotenusa, usa cos⁻¹.")},
        {f:"tan", flip:false, note:p("Tangent is opposite over adjacent. With the hypotenuse, use sin⁻¹ or cos⁻¹.", "La tangente es opuesto entre adyacente. Con la hipotenusa, usa sen⁻¹ o cos⁻¹.")}]},
      ab:{f:"tan", x:"a", y:"b", mistakes:[
        {f:"tan", flip:true, note:p("That ratio is upside down, so you found the other acute angle. Use tan⁻¹(opposite/adjacent).", "Esa relación está invertida, así que encontraste el otro ángulo agudo. Usa tan⁻¹(opuesto/adyacente).")},
        {f:"sin", flip:false, note:p("Sine needs the hypotenuse. With the opposite and adjacent sides, use tan⁻¹.", "El seno necesita la hipotenusa. Con los lados opuesto y adyacente, usa tan⁻¹.")}]}
    };
    function angleOf(f, x, y) { return ARC[f](Number(x) / Number(y)) / DEG; }
    function angleTraps(pair, x, y, answer) {
      var P = PAIRS[pair], list = P.mistakes.map(function (m) {
        var ratio = m.flip ? Number(y) / Number(x) : Number(x) / Number(y);
        return {value:m.f !== "tan" && ratio > 1 ? NaN : ARC[m.f](ratio) / DEG, note:m.note};
      });
      list.push({value:ARC[P.f](Number(x) / Number(y)), note:RADIAN_ANGLE});
      return traps(answer, list);
    }
    // Two sides of a right triangle measured from a hypotenuse and an angle, each with 2 or 3 significant figures.
    function makePair(r) {
      for (;;) {
        var pair = pick(r, Object.keys(PAIRS)), P = PAIRS[pair], c = 2 + r() * 58, t0 = (12 + r() * 66) * DEG;
        var raw = {a:c * Math.sin(t0), b:c * Math.cos(t0), c:c}, x = measure(raw[P.x], pick(r, [2, 3])), y = measure(raw[P.y], pick(r, [2, 3]));
        if (x && y && (P.f === "tan" || Number(x) < Number(y)) && angle(angleOf(P.f, x, y))) return [pair, x, y, pick(r, ["cm", "m"])];
      }
    }
    function pairValues(P, x, y) { var v = {}; v[P.x] = x; v[P.y] = y; return v; }
    function pairExplain(P, x, y, ans) {
      return fill(p("{roles}, so {f} θ = {x}/{y}. θ = {inv}({x}/{y}) = {ans}°.", "{roles}, así que {f} θ = {x}/{y}. θ = {inv}({x}/{y}) = {ans}°."),
        {roles:roles(P.x, P.y), f:FN[P.f], inv:inv(P.f), x:show(x), y:show(y), ans:show(ans.shown)});
    }
    function letterAngle(params) {
      var P = PAIRS[params[0]], x = params[1], y = params[2], u = params[3], ans = angle(angleOf(P.f, x, y));
      var q = numeric(ans, "°", join([triangleIntro(pairValues(P, x, y), u), p("What is θ?", "¿Cuánto mide θ?")]), pairExplain(P, x, y, ans),
        angleTraps(params[0], x, y, ans.text), NEAREST);
      q.triangle = true;
      return q;
    }
    // Context angles: x and y are the two known lengths in meters (x/y is the ratio of the inverse function).
    var SLOPES = {
      ladder:{pair:"bc", x:[0.8, 2.5], y:[3, 9], text:p("A {y} ladder leans against a wall with its base {x} from the wall. What angle does the ladder make with the ground?", "Una escalera de {y} se apoya en una pared con su base a {x} de la pared. ¿Qué ángulo forma la escalera con el suelo?"),
        xName:p("the distance from the wall", "la distancia a la pared"), yName:p("the ladder", "la escalera")},
      ramp:{pair:"ac", x:[0.4, 1.5], y:[2, 6], text:p("A ramp {y} long rises {x}. What angle does it make with the ground?", "Una rampa de {y} de largo sube {x}. ¿Qué ángulo forma con el suelo?"),
        xName:p("the rise", "la subida"), yName:p("the ramp", "la rampa")},
      roof:{pair:"ab", x:[1, 4], y:[3, 8], text:p("A roof rises {x} over a horizontal distance of {y}. What angle does the roof make with the horizontal?", "Un techo sube {x} en una distancia horizontal de {y}. ¿Qué ángulo forma el techo con la horizontal?"),
        xName:p("the rise", "la subida"), yName:p("the horizontal distance", "la distancia horizontal")},
      tree:{pair:"ab", x:[5, 30], y:[10, 60], text:p("A tree is {x} tall. You stand {y} from its base. What is the angle from the ground up to the top of the tree?", "Un árbol mide {x} de alto. Estás a {y} de su base. ¿Cuál es el ángulo desde el suelo hasta la punta del árbol?"),
        xName:p("the height of the tree", "la altura del árbol"), yName:p("the distance along the ground", "la distancia por el suelo")},
      kite:{pair:"ac", x:[10, 60], y:[30, 90], text:p("A kite flies {x} above the ground on a string {y} long. What angle does the string make with the ground?", "Un papalote vuela a {x} sobre el suelo con un hilo de {y}. ¿Qué ángulo forma el hilo con el suelo?"),
        xName:p("the height of the kite", "la altura del papalote"), yName:p("the string", "el hilo")}
    };
    var ANGLE_ROLE = {a:p("the side opposite the angle", "el lado opuesto al ángulo"), b:p("the side adjacent to the angle", "el lado adyacente al ángulo"), c:p("the hypotenuse", "la hipotenusa")};
    function situationAngle(params) {
      var s = SLOPES[params[0]], P = PAIRS[s.pair], x = params[1], y = params[2], ans = angle(angleOf(P.f, x, y));
      return numeric(ans, "°", fill(s.text, {x:amount(x, "m"), y:amount(y, "m")}),
        fill(p("{X} is {rx}, and {y} is {ry}, so use {inv}. The angle is {inv}({xv}/{yv}) = {ans}°.", "{X} es {rx}, y {y} es {ry}, así que usa {inv}. El ángulo es {inv}({xv}/{yv}) = {ans}°."),
          {X:cap(s.xName), y:s.yName, rx:ANGLE_ROLE[P.x], ry:ANGLE_ROLE[P.y], inv:inv(P.f), xv:show(x), yv:show(y), ans:show(ans.shown)}),
        angleTraps(s.pair, x, y, ans.text), NEAREST);
    }
    // Which expression gives θ: the inverse function, not 1 over the ratio's function.
    function inverseQuestion(params) {
      var P = PAIRS[params[0]], x = params[1], y = params[2], u = params[3], ans = angle(angleOf(P.f, x, y));
      var r = show(x) + "/" + show(y), back = show(y) + "/" + show(x), F = FN[P.f], I = inv(P.f);
      var fourth = P.f === "tan" ? {text:p(I.en + "(" + back + ")", I.es + "(" + back + ")"), why:p("That ratio is upside down. It gives the other acute angle, not θ.", "Esa relación está invertida. Da el otro ángulo agudo, no θ.")} :
        P.f === "sin" ? {text:p("cos" + INV + "(" + r + ")", "cos" + INV + "(" + r + ")"), why:p("cos⁻¹ needs the adjacent side. Side a is opposite θ, so use sin⁻¹.", "cos⁻¹ necesita el lado adyacente. El lado a es opuesto a θ, así que usa sen⁻¹.")} :
          {text:p("sin" + INV + "(" + r + ")", "sen" + INV + "(" + r + ")"), why:p("sin⁻¹ needs the opposite side. Side b is adjacent to θ, so use cos⁻¹.", "sen⁻¹ necesita el lado opuesto. El lado b es adyacente a θ, así que usa cos⁻¹.")};
      return {type:"mc", answer:0, triangle:true,
        prompt:join([triangleIntro(pairValues(P, x, y), u), p("Which expression gives θ?", "¿Qué expresión da el valor de θ?")]),
        choices:[
          {text:p(I.en + "(" + r + ")", I.es + "(" + r + ")"), why:p("", "")},
          {text:p("1/" + F.en + "(" + r + ")", "1/" + F.es + "(" + r + ")"), why:fill(p("The −1 in {inv} means undo, not 1 over.", "El −1 en {inv} significa deshacer, no 1 entre."), {inv:I})},
          {text:p(F.en + "(" + r + ")", F.es + "(" + r + ")"), why:fill(p("{f} takes an angle and gives a ratio. To go from a ratio back to the angle, use {inv}.", "{f} toma un ángulo y da una relación. Para ir de una relación al ángulo, usa {inv}."), {f:F, inv:I})},
          fourth],
        explanation:pairExplain(P, x, y, ans)};
    }

    var topics = [
      {id:"name", title:p("Naming the sides", "Identificación de los lados")},
      {id:"ratio", title:p("SOH CAH TOA", "SOH CAH TOA")},
      {id:"side", title:p("Finding a side", "Cálculo de un lado")},
      {id:"angle", title:p("Finding an angle", "Cálculo de un ángulo")}
    ];
    var generators = [
      {key:"sn", topic:"name", make:function (r) { return [pick(r, Object.keys(ASKS))].concat(sides(r), [pick(r, ["cm", "m"])]); },
        build:function (params) {
          var s = sidesOf(params), q = namingQuestion(params[0], LETTER_NAMES, triangleIntro(s, params[4]), null, TOP);
          q.triangle = true;
          return q;
        }},
      {key:"sc", topic:"name", make:function (r) {
        var key = pick(r, Object.keys(SCENES)), s = SCENES[key];
        for (;;) {
          var L = length(r, s.L[0], s.L[1]), d = length(r, s.d[0], s.d[1]);
          if (Number(d) < Number(L) * 0.9) return [pick(r, Object.keys(ASKS)), key, L, d];
        }
      }, build:function (params) {
        var s = SCENES[params[1]];
        return namingQuestion(params[0], s, fill(s.setup, {L:amount(params[2], "m"), d:amount(params[3], "m")}), s.theta, s.top);
      }},
      {key:"sr", topic:"ratio", make:function (r) { return makeRatio(r, false); }, build:ratioQuestion},
      {key:"rv", topic:"ratio", make:function (r) { return makeRatio(r, true); }, build:valueQuestion},
      {key:"fs", topic:"side", make:function (r) {
        for (;;) {
          var c = pick(r, Object.keys(CASES)), t = String(int(r, 12, 78)), k = length(r, 1, 60), ans = sideAnswer(c, t, k);
          if (ans && Number(ans.shown) < 100) return [c, t, k, pick(r, ["cm", "m"])];
        }
      }, build:letterSide},
      {key:"fc", topic:"side", make:function (r) { return makeSituation(r); }, build:situationSide},
      {key:"fm", topic:"side", make:function (r) { return makeSituation(r, radianOK); }, build:radianQuestion},
      {key:"fa", topic:"angle", make:makePair, build:letterAngle},
      {key:"fx", topic:"angle", make:function (r) {
        for (;;) {
          var key = pick(r, Object.keys(SLOPES)), s = SLOPES[key], P = PAIRS[s.pair], x = length(r, s.x[0], s.x[1]), y = length(r, s.y[0], s.y[1]);
          if ((P.f === "tan" || Number(x) < Number(y)) && angle(angleOf(P.f, x, y))) return [key, x, y];
        }
      }, build:situationAngle},
      {key:"ak", topic:"angle", make:makePair, build:inverseQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/advanced-tools/trigonometry-basics/",
      copy:{title:"Trigonometry Basics Practice", es:{
        "Trigonometry Basics Practice":"Práctica de conceptos básicos de trigonometría",
        "Quantitative Skills · Advanced Tools":"Habilidades cuantitativas · Herramientas avanzadas",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator in degree mode. The rules from the lesson are below.":"Sin límite de tiempo. Usa papel y una calculadora en modo de grados. Las reglas de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type your answer as a number. A unit after it is optional, like 5.7 m or 37°.":"Escribe tu respuesta como un número. La unidad después es opcional, como 5.7 m o 37°.",
        "Round lengths and ratios to 2 significant figures and angles to the nearest degree. Keep your calculator in degree mode.":"Redondea longitudes y relaciones a 2 cifras significativas, y ángulos al grado más cercano. Mantén tu calculadora en modo de grados.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 5.7 or 37. You may add the unit after it.":"Escribe un número como 5.7 o 37. Puedes agregar la unidad después.",
        "Right triangle":"Triángulo rectángulo",
        "θ is at the bottom left corner and the right angle is at the bottom right corner. Side a is the vertical side on the right. Side b is the bottom side. Side c is the slanted side from the bottom left corner to the top. The other acute angle is at the top.":"θ está en la esquina inferior izquierda y el ángulo recto está en la esquina inferior derecha. El lado a es el lado vertical de la derecha. El lado b es el lado de abajo. El lado c es el lado inclinado que va de la esquina inferior izquierda hasta arriba. El otro ángulo agudo está arriba.",
        "Not to scale.":"No está a escala.",
        "Reference":"Consulta", "Right triangle rules":"Reglas del triángulo rectángulo",
        "The hypotenuse is across from the 90° angle. It is the longest side, and it never changes.":"La hipotenusa está frente al ángulo de 90°. Es el lado más largo, y nunca cambia.",
        "Mark θ first. The opposite side is across from θ, and the adjacent side is the leg next to θ. If you change the angle, they swap.":"Marca θ primero. El lado opuesto está frente a θ, y el lado adyacente es el cateto junto a θ. Si cambias de ángulo, se intercambian.",
        "Memory aid:":"Para recordar (en inglés):",
        "sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.":"sen θ = opuesto/hipotenusa, cos θ = adyacente/hipotenusa, tan θ = opuesto/adyacente.",
        "Finding a side: label the side you know and the side you want, pick the ratio that uses both, then solve. A leg is always shorter than the hypotenuse.":"Cálculo de un lado: marca el lado que conoces y el lado que buscas, elige la relación que usa los dos y despeja. Un cateto siempre es más corto que la hipotenusa.",
        "Finding an angle: use sin⁻¹, cos⁻¹ or tan⁻¹ (2nd, then SIN, COS or TAN). The −1 means undo, not 1 over.":"Cálculo de un ángulo: usa sen⁻¹, cos⁻¹ o tan⁻¹ (2nd y luego SIN, COS o TAN). El −1 significa deshacer, no 1 entre.",
        "Use degree mode. Check it: sin(30) should give 0.5. If you get −0.988, the calculator is in radian mode.":"Usa el modo de grados. Compruébalo: SIN(30) debe dar 0.5. Si obtienes −0.988, la calculadora está en modo de radianes.",
        "Practice for the Trigonometry Basics lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Conceptos básicos de trigonometría de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
