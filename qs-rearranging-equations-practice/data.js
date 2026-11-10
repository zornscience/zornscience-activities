(function () {
  "use strict";
  // Rearranging Equations Practice: generated questions for the Quantitative Skills lesson Rearranging Equations. The
  // ideas follow the lesson on zornscience.org: solve for the variable with letters first, then substitute numbers; an
  // equation is a balance, so do the same step to both sides with the opposite operation; undo steps in reverse order
  // (F = 1.8C + 32 becomes C = (F − 32)/1.8); a variable in the denominator comes up when you multiply both sides by
  // it; and the triangle shortcut works only for three-letter formulas like A = BC, only to check. The wrong choices
  // are the lesson's mistakes: an upside-down result, multiplying instead of dividing, and the wrong order of steps.
  // Significant figures are advice only here, with the count named under the question.
  var SLUG = "qs-rearranging-equations-practice";
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

    // Formulas whose two sides are products. D = m/V is kept as DV = m, the lesson's first step for it.
    var PRODUCTS = {
      dvt:{f:"d = vt", left:["d"], right:["v", "t"]},
      fma:{f:"F = ma", left:["F"], right:["m", "a"]},
      wmg:{f:"W = mg", left:["W"], right:["m", "g"]},
      dmv:{f:"D = m/V", left:["D", "V"], right:["m"]},
      qmc:{f:"q = mcΔT", left:["q"], right:["m", "c", "ΔT"]},
      pvt:{f:"PV = nRT", left:["P", "V"], right:["n", "R", "T"]}
    };
    var ONE_STEP = [["dvt", "t"], ["dvt", "v"], ["fma", "a"], ["fma", "m"], ["wmg", "m"], ["dmv", "V"], ["dmv", "m"],
      ["qmc", "c"], ["qmc", "m"], ["qmc", "ΔT"], ["pvt", "n"], ["pvt", "V"], ["pvt", "T"]];
    function product(list) { return list.join(""); }
    function over(num, den) { return product(num) + "/" + (den.length > 1 ? "(" + product(den) + ")" : den[0]); }
    // The pieces of solving a product formula for x: x = other/rest, where rest is what multiplies x on its side.
    function pieces(key, x) {
      var F = PRODUCTS[key], own = F.left.indexOf(x) >= 0 ? F.left : F.right, other = own === F.left ? F.right : F.left;
      var rest = own.filter(function (s) { return s !== x; });
      return {F:F, other:other, rest:rest, key:rest.length ? over(other, rest) : product(other)};
    }
    function oneStepExplanation(key, x) {
      var s = pieces(key, x);
      if (key === "dmv" && x === "V") return p("Multiply both sides by V: DV = m. Then divide both sides by D: V = m/D.", "Multiplica ambos lados por V: DV = m. Luego divide ambos lados entre D: V = m/D.");
      if (key === "dmv") return p("m is divided by V, so multiply both sides by V: m = DV.", "m está dividida entre V, así que multiplica ambos lados por V: m = DV.");
      return fill(p("Divide both sides by {r}: {x} = {k}.", "Divide ambos lados entre {r}: {x} = {k}."), {r:product(s.rest), x:x, k:s.key});
    }
    function solveOne(params) {
      var key = params[0], x = params[1], s = pieces(key, x), choices;
      var eq = function (expr) { return same(x + " = " + expr); };
      if (!s.rest.length) {
        choices = [{text:eq(s.key), why:BLANK},
          {text:eq("D/V"), why:p("m is divided by V, so undo it with the opposite operation: multiply both sides by V.", "m está dividida entre V, así que deshazlo con la operación opuesta: multiplica ambos lados por V.")},
          {text:eq("V/D"), why:p("Multiplying both sides by V undoes the division, so nothing is left on the bottom: m = DV.", "Al multiplicar ambos lados por V se deshace la división, así que no queda nada abajo: m = DV.")},
          {text:eq("D + V"), why:p("Undo dividing by multiplying, not adding: m = DV.", "La división se deshace multiplicando, no sumando: m = DV.")}];
      } else {
        var r = product(s.rest), o = product(s.other), v = {r:r, o:o, x:x, k:s.key};
        var upside = key === "dmv" ? p("This is upside down. From DV = m, divide both sides by {r}, so {o} stays on top: {x} = {k}.", "Esto está al revés. A partir de DV = m, divide ambos lados entre {r}, así que {o} queda arriba: {x} = {k}.") :
          p("This is upside down. Divide both sides by {r}, so {o} stays on top: {x} = {k}.", "Esto está al revés. Divide ambos lados entre {r}, así que {o} queda arriba: {x} = {k}.");
        choices = [{text:eq(s.key), why:BLANK},
          {text:eq(over(s.rest, s.other)), why:fill(upside, v)},
          {text:eq(o + r), why:fill(p("To undo multiplying by {r}, divide both sides by {r}. Do not multiply.", "Para deshacer la multiplicación por {r}, divide ambos lados entre {r}. No multipliques."), v)},
          {text:eq(o + " − " + r), why:p("Letters side by side mean multiply. Undo multiplying by dividing, not subtracting.", "Las letras juntas significan multiplicar. La multiplicación se deshace dividiendo, no restando.")}];
      }
      return {type:"mc", answer:0, prompt:fill(p("Solve {f} for {x}.", "Despeja {x} en {f}."), {f:s.F.f, x:x}), choices:choices, explanation:oneStepExplanation(key, x)};
    }

    // Two-step formulas: lhs = add + (coef)(x). Undo in reverse order: subtract first, then divide.
    var LINEAR = {
      vat:{f:"v<sub>f</sub> = v<sub>i</sub> + at", lhs:"v<sub>f</sub>", add:"v<sub>i</sub>", prod:"at", coef:{a:"t", t:"a"}},
      xvt:{f:"x<sub>f</sub> = x<sub>i</sub> + vt", lhs:"x<sub>f</sub>", add:"x<sub>i</sub>", prod:"vt", coef:{v:"t", t:"v"}},
      fc:{f:"F = 1.8C + 32", lhs:"F", add:"32", prod:"1.8C", coef:{C:"1.8"}}
    };
    var TWO_STEP = [["vat", "a"], ["vat", "t"], ["vat", "add"], ["xvt", "t"], ["xvt", "v"], ["xvt", "add"], ["fc", "C"]];
    function solveTwo(params) {
      var L = LINEAR[params[0]], x = params[1], v = {lhs:L.lhs, add:L.add, prod:L.prod};
      if (x === "add") {
        var eqa = function (expr) { return same(L.add + " = " + expr); };
        return {type:"mc", answer:0, prompt:fill(p("Solve {f} for {x}.", "Despeja {x} en {f}."), {f:L.f, x:L.add}),
          choices:[{text:eqa(L.lhs + " − " + L.prod), why:BLANK},
            {text:eqa(L.lhs + " + " + L.prod), why:fill(p("{prod} is added to {add}, so subtract it from both sides. Do not add it.", "{prod} se suma a {add}, así que réstalo en ambos lados. No lo sumes."), v)},
            {text:eqa(L.prod + " − " + L.lhs), why:fill(p("Subtract {prod} from both sides: {lhs} − {prod} = {add}. The order matters, so {lhs} comes first.", "Resta {prod} en ambos lados: {lhs} − {prod} = {add}. El orden importa, así que {lhs} va primero."), v)},
            {text:eqa(L.lhs + "/" + L.prod), why:fill(p("{prod} is added, not multiplied, so undo it by subtracting, not dividing.", "{prod} se suma, no se multiplica, así que se deshace restando, no dividiendo."), v)}],
          explanation:fill(p("{prod} is added to {add}, so subtract {prod} from both sides: {add} = {lhs} − {prod}.", "{prod} se suma a {add}, así que resta {prod} en ambos lados: {add} = {lhs} − {prod}."), v)};
      }
      var c = L.coef[x], key = "(" + L.lhs + " − " + L.add + ")/" + c, eq = function (expr) { return same(x + " = " + expr); };
      v.c = c; v.x = x; v.key = key;
      return {type:"mc", answer:0, prompt:fill(p("Solve {f} for {x}.", "Despeja {x} en {f}."), {f:L.f, x:x}),
        choices:[{text:eq(key), why:BLANK},
          {text:eq(L.lhs + "/" + c + " − " + L.add), why:fill(p("Undo steps in reverse order. {add} is added last, so subtract it first. Then divide by {c}.", "Deshaz los pasos en orden inverso. {add} se suma al final, así que réstalo primero. Luego divide entre {c}."), v)},
          {text:eq("(" + L.lhs + " + " + L.add + ")/" + c), why:fill(p("{add} is added, so use the opposite operation: subtract it from both sides.", "{add} se suma, así que usa la operación opuesta: réstalo en ambos lados."), v)},
          {text:eq(c + "/(" + L.lhs + " − " + L.add + ")"), why:fill(p("This is upside down. After you subtract, divide both sides by {c}, so {c} goes on the bottom.", "Esto está al revés. Después de restar, divide ambos lados entre {c}, así que {c} va abajo."), v)}],
        explanation:fill(p("Subtract {add} from both sides: {lhs} − {add} = {prod}. Then divide both sides by {c}: {x} = {key}.", "Resta {add} en ambos lados: {lhs} − {add} = {prod}. Luego divide ambos lados entre {c}: {x} = {key}."), v)};
    }

    // The first step: the opposite operation, on both sides, in reverse order.
    var BALANCE = p("An equation is a balance. Do the same step to both sides.", "Una ecuación es una balanza. Haz el mismo paso en ambos lados.");
    function firstStep(params) {
      var form = params[0], x = params[1], prompt, choices, explanation;
      if (PRODUCTS[form]) {
        var F = PRODUCTS[form];
        prompt = fill(p("You want to solve {f} for {x}. What is the first step?", "Quieres despejar {x} en {f}. ¿Cuál es el primer paso?"), {f:F.f, x:x});
        if (form === "dmv") {
          choices = [{text:p("Multiply both sides by V.", "Multiplica ambos lados por V."), why:BLANK},
            {text:p("Divide both sides by V.", "Divide ambos lados entre V."), why:x === "V" ? p("V is in the denominator. Multiply both sides by V to bring it up: DV = m.", "V está en el denominador. Multiplica ambos lados por V para subirla: DV = m.") :
              p("m is divided by V. Undo dividing with the opposite operation: multiply both sides by V.", "m está dividida entre V. Deshaz la división con la operación opuesta: multiplica ambos lados por V.")},
            {text:p("Multiply only the right side by V.", "Multiplica solo el lado derecho por V."), why:BALANCE},
            {text:p("Subtract V from both sides.", "Resta V en ambos lados."), why:p("m is divided by V. The opposite of dividing is multiplying, not subtracting.", "m está dividida entre V. Lo opuesto de dividir es multiplicar, no restar.")}];
          explanation = x === "V" ? p("V is in the denominator, so first multiply both sides by V: DV = m. Then divide both sides by D: V = m/D.", "V está en el denominador, así que primero multiplica ambos lados por V: DV = m. Luego divide ambos lados entre D: V = m/D.") :
            oneStepExplanation(form, x);
        } else {
          var r = product(pieces(form, x).rest), v = {r:r, x:x};
          choices = [{text:fill(p("Divide both sides by {r}.", "Divide ambos lados entre {r}."), v), why:BLANK},
            {text:fill(p("Multiply both sides by {r}.", "Multiplica ambos lados por {r}."), v), why:fill(p("{r} multiplies {x}, so use the opposite operation: divide.", "{r} multiplica a {x}, así que usa la operación opuesta: divide."), v)},
            {text:fill(p("Divide only the side with {x} by {r}.", "Divide entre {r} solo el lado donde está {x}."), v), why:BALANCE},
            {text:fill(p("Subtract {r} from both sides.", "Resta {r} en ambos lados."), v), why:fill(p("{r} multiplies {x}. The opposite of multiplying is dividing, not subtracting.", "{r} multiplica a {x}. Lo opuesto de multiplicar es dividir, no restar."), v)}];
          explanation = fill(p("{r} multiplies {x}, so divide both sides by {r}: {x} = {k}.", "{r} multiplica a {x}, así que divide ambos lados entre {r}: {x} = {k}."), {r:r, x:x, k:pieces(form, x).key});
        }
        return {type:"mc", answer:0, prompt:prompt, choices:choices, explanation:explanation};
      }
      var L = LINEAR[form], target = x === "add" ? L.add : x, w = {lhs:L.lhs, add:L.add, prod:L.prod, x:target, c:L.coef[x]};
      prompt = fill(p("You want to solve {f} for {x}. What is the first step?", "Quieres despejar {x} en {f}. ¿Cuál es el primer paso?"), {f:L.f, x:target});
      if (x === "add") {
        choices = [{text:fill(p("Subtract {prod} from both sides.", "Resta {prod} en ambos lados."), w), why:BLANK},
          {text:fill(p("Divide both sides by {prod}.", "Divide ambos lados entre {prod}."), w), why:fill(p("{prod} is added, so subtract it. Dividing undoes multiplying.", "{prod} se suma, así que réstalo. Dividir deshace una multiplicación."), w)},
          {text:fill(p("Add {prod} to both sides.", "Suma {prod} en ambos lados."), w), why:fill(p("{prod} is added, so use the opposite operation: subtract it.", "{prod} se suma, así que usa la operación opuesta: réstalo."), w)},
          {text:fill(p("Subtract {prod} from one side only.", "Resta {prod} solo en un lado."), w), why:BALANCE}];
        explanation = fill(p("{prod} is added to {x}, so subtract {prod} from both sides: {x} = {lhs} − {prod}.", "{prod} se suma a {x}, así que resta {prod} en ambos lados: {x} = {lhs} − {prod}."), w);
      } else {
        choices = [{text:fill(p("Subtract {add} from both sides.", "Resta {add} en ambos lados."), w), why:BLANK},
          {text:fill(p("Divide both sides by {c}.", "Divide ambos lados entre {c}."), w), why:fill(p("Undo steps in reverse order. {add} is added last, so subtract it first.", "Deshaz los pasos en orden inverso. {add} se suma al final, así que réstalo primero."), w)},
          {text:fill(p("Add {add} to both sides.", "Suma {add} en ambos lados."), w), why:fill(p("{add} is added, so use the opposite operation: subtract it.", "{add} se suma, así que usa la operación opuesta: réstalo."), w)},
          {text:fill(p("Subtract {add} from one side only.", "Resta {add} solo en un lado."), w), why:BALANCE}];
        explanation = fill(p("{x} is multiplied by {c}, then {add} is added. Undo in reverse order: first subtract {add} from both sides, then divide both sides by {c}.",
          "{x} se multiplica por {c} y luego se suma {add}. Deshaz en orden inverso: primero resta {add} en ambos lados y luego divide ambos lados entre {c}."), w);
      }
      return {type:"mc", answer:0, prompt:prompt, choices:choices, explanation:explanation};
    }

    // The triangle shortcut: only for three-letter formulas like A = BC, and only to check.
    var TRIANGLE_OK = {dvt:"d = vt", fma:"F = ma", wmg:"W = mg", mdv:"m = DV"};
    var TRIANGLE_NO = {
      vat:{f:"v<sub>f</sub> = v<sub>i</sub> + at", why:p("It has a plus sign, so solving it takes two steps. The triangle works only for A = BC.", "Tiene un signo más, así que despejarla toma dos pasos. El triángulo solo funciona con A = BC.")},
      fc:{f:"F = 1.8C + 32", why:p("It has + 32, so solving it takes two steps. The triangle works only for A = BC.", "Tiene + 32, así que despejarla toma dos pasos. El triángulo solo funciona con A = BC.")},
      qmc:{f:"q = mcΔT", why:p("It has four quantities. The triangle works only for three letters, A = BC.", "Tiene cuatro cantidades. El triángulo solo funciona con tres letras, A = BC.")},
      pvt:{f:"PV = nRT", why:p("It has five quantities. The triangle works only for three letters, A = BC.", "Tiene cinco cantidades. El triángulo solo funciona con tres letras, A = BC.")}
    };
    function triangle(params) {
      if (params[0] === "w") return {type:"mc", answer:0, prompt:p("What is the triangle shortcut good for?", "¿Para qué sirve el atajo del triángulo?"),
        choices:[{text:p("Checking a three-letter formula like A = BC after you solve it", "Comprobar una fórmula de tres letras como A = BC después de despejarla"), why:BLANK},
          {text:p("Solving any formula", "Despejar cualquier fórmula"), why:p("It works only for three-letter formulas like A = BC.", "Solo funciona con fórmulas de tres letras como A = BC.")},
          {text:p("Replacing the algebra steps", "Reemplazar los pasos de álgebra"), why:p("Use it only to check. Solve first by doing the same step to both sides.", "Úsalo solo para comprobar. Primero despeja haciendo el mismo paso en ambos lados.")},
          {text:p("Formulas with + or −, such as F = 1.8C + 32", "Fórmulas con + o −, como F = 1.8C + 32"), why:p("Those take two steps. The triangle works only for A = BC.", "Esas requieren dos pasos. El triángulo solo funciona con A = BC.")}],
        explanation:p("The triangle shortcut works only for three-letter formulas like A = BC, and only to check your algebra.", "El atajo del triángulo solo funciona con fórmulas de tres letras como A = BC, y solo para comprobar tu álgebra.")};
      var ok = TRIANGLE_OK[params[1]];
      return {type:"mc", answer:0, prompt:p("Which formula can you check with the triangle shortcut?", "¿Qué fórmula puedes comprobar con el atajo del triángulo?"),
        choices:[{text:same(ok), why:BLANK}].concat(params.slice(2).map(function (k) { return {text:same(TRIANGLE_NO[k].f), why:TRIANGLE_NO[k].why}; })),
        explanation:fill(p("{f} has three letters in the form A = BC, so the triangle works. Use it only to check your algebra.", "{f} tiene tres letras en la forma A = BC, así que el triángulo funciona. Úsalo solo para comprobar tu álgebra."), {f:ok})};
    }

    // Rearrange, then calculate. Letters first, then numbers with their units.
    function tenth(k) { return Math.floor(k / 10) + "." + (k % 10); }
    function measure(random, n, lo, hi) {
      for (;;) {
        var text = M.write((lo + random() * (hi - lo)).toFixed(6), {sf:n}, "plain");
        if (M.read(text).sf === n && Number(text) >= lo && Number(text) <= hi) return text;
      }
    }
    function sfOf(text) { return M.read(text).sf; }
    function calc(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return show(M.fixed(value, -k));
      return show(M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }
    var UNITS = {
      g:["g", "grams", "gram", "gramos", "gramo"],
      mL:["mL", "ml", "milliliters", "milliliter", "mililitros", "mililitro", "cm³"],
      c:["J/(g·°C)", "J/(g°C)", "J/g·°C", "J/g°C", "J/g/°C", "joules per gram degree Celsius", "joules por gramo grado Celsius"],
      a:["m/s²", "m s^-2", "m·s^-2", "m/s/s", "meters per second squared", "metros por segundo al cuadrado"],
      s:["s", "seconds", "second", "segundos", "segundo", "sec"],
      C:["°C", "ºC", "degrees C", "degrees Celsius", "grados C", "grados Celsius"]
    };
    function computed(o) {
      var P = {sf:o.n}, answer = M.write(o.exact, P, "plain");
      return {type:"numeric", answer:o.exact.n + "/" + o.exact.d, precision:P, unit:o.unit, accept:o.accept, check:{sf:"advice", unit:"optional"},
        display:answer + " " + o.unit, answerText:same(show(answer) + " " + o.unit), traps:o.traps,
        instruction:fill(p("Round to {n}.", "Redondea a {n}."), {n:M.figures(o.n)}), prompt:o.prompt,
        explanation:join([o.solve, fill(p("Then substitute: {sub} = {raw} {u}. To {n}, that is {ans} {u}.", "Luego sustituye: {sub} = {raw} {u}. Con {n}, eso es {ans} {u}."),
          {sub:o.sub, raw:calc(o.exact), u:o.unit, n:M.figures(o.n), ans:show(answer)})])};
    }
    // The answer must show its significant figures in standard notation, stay below 10,000, and differ from every trap.
    function usable(q) {
      var R = M.rounded(q.answer, q.precision), plain = M.write(q.answer, q.precision, "plain");
      if (q.precision.sf < 2 || M.read(plain).sf !== q.precision.sf || M.magnitude(q.answer) > 3 || M.magnitude(q.answer) < -3) return false;
      return q.traps.every(function (t) { return M.sign(t.answer) && M.cmp(M.rounded(t.answer, q.precision).value, R.value) !== 0; });
    }
    // make returns null for a draw it cannot use; the draw is repeated until the question is usable.
    function attempt(random, make, buildIt) {
      for (;;) { var params = make(random); if (params && usable(buildIt(params))) return params; }
    }

    var MATERIALS = {
      al:{D:"2.70", en:"aluminum", es:"aluminio", the:"El aluminio", of:"del aluminio"},
      cu:{D:"8.96", en:"copper", es:"cobre", the:"El cobre", of:"del cobre"},
      fe:{D:"7.87", en:"iron", es:"hierro", the:"El hierro", of:"del hierro"},
      pb:{D:"11.3", en:"lead", es:"plomo", the:"El plomo", of:"del plomo"},
      hg:{D:"13.6", en:"mercury", es:"mercurio", the:"El mercurio", of:"del mercurio"},
      au:{D:"19.3", en:"gold", es:"oro", the:"El oro", of:"del oro"},
      et:{D:"0.789", en:"ethanol", es:"etanol", the:"El etanol", of:"del etanol"},
      ag:{D:"10.5", en:"silver", es:"plata", the:"La plata", of:"de la plata"}
    };
    function densityQuestion(params) {
      var target = params[0], mat = MATERIALS[params[1]], D = mat.D, given = params[2], name = p(mat.en, mat.es);
      var Dt = show(D) + " g/mL", n = Math.min(sfOf(D), sfOf(given));
      if (target === "m") return computed({n:n, exact:M.mul(D, given), unit:"g", accept:UNITS.g,
        prompt:fill(p("{The} has a density of {D}. What is the mass of {V} of {name}, in grams? Solve D = m/V for m first.", "{The} tiene una densidad de {D}. ¿Cuál es la masa de {V} de {name}, en gramos? Primero despeja m en D = m/V."),
          {The:p(mat.en.charAt(0).toUpperCase() + mat.en.slice(1), mat.the), D:Dt, V:show(given) + " mL", name:name}),
        solve:p("Solve for m first: m = DV.", "Primero despeja m: m = DV."), sub:"m = (" + Dt + ")(" + show(given) + " mL)",
        traps:[{answer:M.div(D, given), note:p("Multiply both sides by V: m = DV. Do not divide.", "Multiplica ambos lados por V: m = DV. No dividas.")},
          {answer:M.div(given, D), note:p("m = DV: multiply the density by the volume.", "m = DV: multiplica la densidad por el volumen.")}]});
      return computed({n:n, exact:M.div(given, D), unit:"mL", accept:UNITS.mL,
        prompt:fill(p("A sample of {name} has a mass of {m}. The density of {name} is {D}. What is its volume, in mL? Solve D = m/V for V first.", "Una muestra de {name} tiene una masa de {m}. La densidad {of} es {D}. ¿Cuál es su volumen, en mL? Primero despeja V en D = m/V."),
          {name:name, m:show(given) + " g", of:mat.of, D:Dt}),
        solve:p("Solve for V first: DV = m, so V = m/D.", "Primero despeja V: DV = m, así que V = m/D."), sub:"V = (" + show(given) + " g)/(" + Dt + ")",
        traps:[{answer:M.div(D, given), note:p("This is upside down: V = m/D, so the mass goes on top.", "Está al revés: V = m/D, así que la masa va arriba.")},
          {answer:M.mul(given, D), note:p("To get V alone, divide m by D. Do not multiply.", "Para dejar sola V, divide m entre D. No multipliques.")}]});
    }
    function makeDensity(random) {
      return attempt(random, function (r) {
        var target = pick(r, ["m", "V"]), key = pick(r, Object.keys(MATERIALS));
        return [target, key, target === "m" ? measure(r, 3, 2, 60) : measure(r, 3, 5, 600)];
      }, densityQuestion);
    }

    // Specific heat, q = mcΔT, solved for c or for m. The heat q is made from a real c and rounded like a measurement.
    var METALS = ["0.897", "0.449", "0.385", "0.235", "0.129"];
    var HEATED = {
      w:{c:"4.18", en:"Water", es:"El agua", piece:p("A sample of water", "Una muestra de agua")},
      al:{c:"0.897", en:"Aluminum", es:"El aluminio", piece:p("A piece of aluminum", "Un trozo de aluminio")},
      fe:{c:"0.449", en:"Iron", es:"El hierro", piece:p("A piece of iron", "Un trozo de hierro")},
      cu:{c:"0.385", en:"Copper", es:"El cobre", piece:p("A piece of copper", "Un trozo de cobre")}
    };
    var CU = "J/(g·°C)";
    function heatQuestion(params) {
      var target = params[0], q = params[1], dT = params[2], qt = show(q) + " J", dTt = show(dT) + " °C";
      if (target === "c") {
        var m = params[3], n = Math.min(sfOf(q), sfOf(dT), sfOf(m));
        return computed({n:n, exact:M.div(q, M.mul(m, dT)), unit:CU, accept:UNITS.c,
          prompt:fill(p("A {m} piece of metal absorbs {q} of heat, and its temperature rises {dT}. Solve q = mcΔT for c, then find c in J/(g·°C).",
            "Un trozo de metal de {m} absorbe {q} de calor, y su temperatura sube {dT}. Despeja c en q = mcΔT y luego calcula c en J/(g·°C)."), {m:show(m) + " g", q:qt, dT:dTt}),
          solve:p("Solve for c first: c = q/(mΔT).", "Primero despeja c: c = q/(mΔT)."), sub:"c = " + qt + " / [(" + show(m) + " g)(" + dTt + ")]",
          traps:[{answer:M.div(M.mul(m, dT), q), note:p("This is upside down: c = q/(mΔT), so q goes on top.", "Está al revés: c = q/(mΔT), así que q va arriba.")},
            {answer:M.mul(M.div(q, m), dT), note:p("Divide q by the whole product mΔT. Without the parentheses, ΔT ends up on top.", "Divide q entre todo el producto mΔT. Sin los paréntesis, ΔT queda arriba.")},
            {answer:M.mul(q, M.mul(m, dT)), note:p("To undo multiplying by m and ΔT, divide. Do not multiply.", "Para deshacer la multiplicación por m y ΔT, divide. No multipliques.")}]});
      }
      var H = HEATED[params[3]], c = H.c, k = Math.min(sfOf(q), sfOf(dT), sfOf(c)), ct = c + " " + CU;
      return computed({n:k, exact:M.div(q, M.mul(c, dT)), unit:"g", accept:UNITS.g,
        prompt:join([fill(p("{The} has c = {c}.", "{The} tiene c = {c}."), {The:p(H.en, H.es), c:ct}),
          fill(p("{piece} absorbs {q} of heat and warms by {dT}. Solve q = mcΔT for m, then find the mass in grams.", "{piece} absorbe {q} de calor y se calienta {dT}. Despeja m en q = mcΔT y luego calcula la masa en gramos."), {piece:H.piece, q:qt, dT:dTt})]),
        solve:p("Solve for m first: m = q/(cΔT).", "Primero despeja m: m = q/(cΔT)."), sub:"m = " + qt + " / [(" + ct + ")(" + dTt + ")]",
        traps:[{answer:M.div(M.mul(c, dT), q), note:p("This is upside down: m = q/(cΔT), so q goes on top.", "Está al revés: m = q/(cΔT), así que q va arriba.")},
          {answer:M.mul(M.div(q, c), dT), note:p("Divide q by the whole product cΔT. Without the parentheses, ΔT ends up on top.", "Divide q entre todo el producto cΔT. Sin los paréntesis, ΔT queda arriba.")},
          {answer:M.mul(q, M.mul(c, dT)), note:p("To undo multiplying by c and ΔT, divide. Do not multiply.", "Para deshacer la multiplicación por c y ΔT, divide. No multipliques.")}]});
    }
    function makeHeat(random) {
      return attempt(random, function (r) {
        var target = pick(r, ["c", "m"]), m = measure(r, 3, 10, 99.9), dT = tenth(int(r, 100, 400));
        var c = target === "c" ? pick(r, METALS) : null, key = target === "m" ? pick(r, Object.keys(HEATED)) : null;
        if (key) c = HEATED[key].c;
        var q = M.write(M.mul(m, M.mul(c, dT)), {sf:3}, "plain");
        if (sfOf(q) !== 3) return null;
        return target === "c" ? ["c", q, dT, m] : ["m", q, dT, key];
      }, heatQuestion);
    }

    // Two steps: undo the addition, then the multiplication.
    function twoStepQuestion(params) {
      var kind = params[0];
      if (kind === "a") {
        var vi = params[1], vf = params[2], t = params[3], diff = M.sub(vf, vi), dt = M.write(diff, {decimals:1}, "plain");
        return computed({n:Math.min(sfOf(dt), sfOf(t)), exact:M.div(diff, t), unit:"m/s²", accept:UNITS.a,
          prompt:fill(p("A car speeds up from {vi} to {vf} in {t}. Solve v<sub>f</sub> = v<sub>i</sub> + at for a, then find a in m/s².", "Un auto acelera de {vi} a {vf} en {t}. Despeja a en v<sub>f</sub> = v<sub>i</sub> + at y luego calcula a en m/s²."),
            {vi:show(vi) + " m/s", vf:show(vf) + " m/s", t:show(t) + " s"}),
          solve:p("Solve for a first: a = (v<sub>f</sub> − v<sub>i</sub>)/t.", "Primero despeja a: a = (v<sub>f</sub> − v<sub>i</sub>)/t."),
          sub:"a = (" + show(vf) + " m/s − " + show(vi) + " m/s)/(" + show(t) + " s) = (" + show(dt) + " m/s)/(" + show(t) + " s)",
          traps:[{answer:M.sub(vf, M.div(vi, t)), note:p("Undo in reverse order: subtract v<sub>i</sub> first, then divide the whole difference by t.", "Deshaz en orden inverso: primero resta v<sub>i</sub> y luego divide toda la diferencia entre t.")},
            {answer:M.div(t, diff), note:p("This is upside down: a = (v<sub>f</sub> − v<sub>i</sub>)/t, so t goes on the bottom.", "Está al revés: a = (v<sub>f</sub> − v<sub>i</sub>)/t, así que t va abajo.")},
            {answer:M.div(M.add(vf, vi), t), note:p("v<sub>i</sub> is added, so subtract it from both sides. Do not add it.", "v<sub>i</sub> se suma, así que réstala en ambos lados. No la sumes.")}]});
      }
      if (kind === "t") {
        var xi = params[1], xf = params[2], v = params[3], dx = M.sub(xf, xi), dxt = M.write(dx, {decimals:1}, "plain");
        return computed({n:Math.min(sfOf(dxt), sfOf(v)), exact:M.div(dx, v), unit:"s", accept:UNITS.s,
          prompt:fill(p("A cart moves at a constant velocity of {v} from x<sub>i</sub> = {xi} to x<sub>f</sub> = {xf}. Solve x<sub>f</sub> = x<sub>i</sub> + vt for t, then find t in seconds.",
            "Un carrito se mueve con una velocidad constante de {v} de x<sub>i</sub> = {xi} a x<sub>f</sub> = {xf}. Despeja t en x<sub>f</sub> = x<sub>i</sub> + vt y luego calcula t en segundos."),
            {v:show(v) + " m/s", xi:show(xi) + " m", xf:show(xf) + " m"}),
          solve:p("Solve for t first: t = (x<sub>f</sub> − x<sub>i</sub>)/v.", "Primero despeja t: t = (x<sub>f</sub> − x<sub>i</sub>)/v."),
          sub:"t = (" + show(xf) + " m − " + show(xi) + " m)/(" + show(v) + " m/s) = (" + show(dxt) + " m)/(" + show(v) + " m/s)",
          traps:[{answer:M.sub(xf, M.div(xi, v)), note:p("Undo in reverse order: subtract x<sub>i</sub> first, then divide the whole difference by v.", "Deshaz en orden inverso: primero resta x<sub>i</sub> y luego divide toda la diferencia entre v.")},
            {answer:M.div(v, dx), note:p("This is upside down: t = (x<sub>f</sub> − x<sub>i</sub>)/v, so v goes on the bottom.", "Está al revés: t = (x<sub>f</sub> − x<sub>i</sub>)/v, así que v va abajo.")},
            {answer:M.div(M.add(xf, xi), v), note:p("x<sub>i</sub> is added, so subtract it from both sides. Do not add it.", "x<sub>i</sub> se suma, así que réstala en ambos lados. No la sumes.")}]});
      }
      var F = params[1], dF = M.sub(F, "32"), dFt = M.write(dF, {decimals:1}, "plain");
      return computed({n:sfOf(dFt), exact:M.div(dF, "1.8"), unit:"°C", accept:UNITS.C,
        prompt:fill(p("A thermometer reads {F}. Solve F = 1.8C + 32 for C, then find the temperature in °C.", "Un termómetro marca {F}. Despeja C en F = 1.8C + 32 y luego calcula la temperatura en °C."), {F:show(F) + " °F"}),
        solve:p("Solve for C first: subtract 32 and then divide by 1.8, so C = (F − 32)/1.8.", "Primero despeja C: resta 32 y luego divide entre 1.8, así que C = (F − 32)/1.8."),
        sub:"C = (" + show(F) + " − 32)/1.8 = " + show(dFt) + "/1.8",
        traps:[{answer:M.sub(M.div(F, "1.8"), "32"), note:p("Undo in reverse order: subtract 32 first, then divide by 1.8.", "Deshaz en orden inverso: primero resta 32 y luego divide entre 1.8.")},
          {answer:M.div(M.add(F, "32"), "1.8"), note:p("32 is added, so subtract it. Do not add it.", "32 se suma, así que réstalo. No lo sumes.")},
          {answer:M.add(M.mul("1.8", F), "32"), note:p("That uses the formula forward. Solve F = 1.8C + 32 for C first: C = (F − 32)/1.8.", "Eso usa la fórmula al derecho. Primero despeja C en F = 1.8C + 32: C = (F − 32)/1.8.")}]});
    }
    function makeTwoStep(random) {
      return attempt(random, function (r) {
        var kind = pick(r, ["a", "t", "C"]);
        if (kind === "a") { var i = int(r, 10, 150); return ["a", tenth(i), tenth(int(r, i + 50, 350)), measure(r, int(r, 2, 3), 2, 12)]; }
        if (kind === "t") { var j = int(r, 0, 200); return ["t", tenth(j), tenth(int(r, j + 50, 800)), measure(r, int(r, 2, 3), 0.5, 6)]; }
        return ["C", tenth(int(r, 500, 1319))];
      }, twoStepQuestion);
    }

    var topics = [
      {id:"solve", title:p("Solving for one variable", "Despeje de una variable")},
      {id:"steps", title:p("The first step", "El primer paso")},
      {id:"compute", title:p("Rearrange, then calculate", "Despeje y cálculo")}
    ];
    var FIRST = ONE_STEP.concat(TWO_STEP);
    var generators = [
      {key:"s1", topic:"solve", make:function (r) { return pick(r, ONE_STEP).slice(); }, build:solveOne},
      {key:"s2", topic:"solve", make:function (r) { return pick(r, TWO_STEP).slice(); }, build:solveTwo},
      {key:"fs", topic:"steps", make:function (r) { return pick(r, FIRST).slice(); }, build:firstStep},
      {key:"tr", topic:"steps", make:function (r) {
        if (r() < 0.15) return ["w"];
        var others = Object.keys(TRIANGLE_NO), drop = int(r, 0, others.length - 1);
        return ["k", pick(r, Object.keys(TRIANGLE_OK))].concat(others.filter(function (_, i) { return i !== drop; }));
      }, build:triangle},
      {key:"dn", topic:"compute", make:makeDensity, build:densityQuestion},
      {key:"sh", topic:"compute", make:makeHeat, build:heatQuestion},
      {key:"tw", topic:"compute", make:makeTwoStep, build:twoStepQuestion}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/equations/rearranging-equations/",
      copy:{title:"Rearranging Equations Practice", es:{
        "Rearranging Equations Practice":"Práctica de despeje de ecuaciones",
        "Quantitative Skills · Equations":"Habilidades cuantitativas · Ecuaciones",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set is new.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie es nueva.",
        "No timer. Use scratch paper and a calculator. The steps from the lesson are below.":"Sin límite de tiempo. Usa papel y calculadora. Los pasos de la lección están abajo.",
        "Choose a skill, then start. Mixed review includes all three skills.":"Elige una habilidad y comienza. El repaso mixto incluye las tres habilidades.",
        "Solve for the letter first, then put in the numbers. A unit after the number is optional.":"Primero despeja la letra y luego sustituye los números. La unidad después del número es opcional.",
        "The line under each question says how to round. Significant figures are a reminder here, not part of the score.":"La línea debajo de cada pregunta indica cómo redondear. Aquí las cifras significativas son un recordatorio, no forman parte de la puntuación.",
        "Submit once per question and read the feedback. Try again gives you a new set.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da una serie nueva.",
        "Type a number such as 16.7 or 0.448. You may add the unit after it.":"Escribe un número como 16.7 o 0.448. Puedes agregar la unidad después.",
        "Reference":"Consulta", "Rearranging equations":"Despeje de ecuaciones",
        "Solve for the variable with letters first. Substitute the numbers last.":"Primero despeja la variable con letras. Sustituye los números al final.",
        "An equation is a balance: do the same step to both sides, using the opposite operation.":"Una ecuación es una balanza: haz el mismo paso en ambos lados, con la operación opuesta.",
        "Undo steps in reverse order: F = 1.8C + 32 becomes C = (F − 32)/1.8.":"Deshaz los pasos en orden inverso: F = 1.8C + 32 se convierte en C = (F − 32)/1.8.",
        "A variable in the denominator: multiply both sides by it, then divide. D = m/V gives DV = m, so V = m/D.":"Una variable en el denominador: multiplica ambos lados por ella y luego divide. D = m/V da DV = m, así que V = m/D.",
        "The triangle shortcut works only for three-letter formulas like A = BC, and only to check your work.":"El atajo del triángulo solo funciona con fórmulas de tres letras como A = BC, y solo para comprobar tu trabajo.",
        "Rearranged formulas: t = d/v, a = F/m, m = DV, V = m/D, c = q/(mΔT), m = q/(cΔT), a = (v":"Fórmulas despejadas: t = d/v, a = F/m, m = DV, V = m/D, c = q/(mΔT), m = q/(cΔT), a = (v",
        "Practice for the Rearranging Equations lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Despeje de ecuaciones de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
