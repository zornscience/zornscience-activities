(function () {
  "use strict";
  // Dimensional Analysis Practice: generated questions for the Quantitative Skills lesson on zornscience.org. Every
  // set has new numbers. As in the lesson: map the path first, one factor per step, and chain the factors so each unit
  // cancels. Rates convert one unit at a time (hours on the bottom of km/h go on top of their factor). Squared and
  // cubed units square or cube the whole factor, numbers and units: (100 cm / 1 m)³. 1 cm³ = 1 mL exactly. All the
  // factors are exact, so answers keep the measurement's significant figures (a note, not a score), in scientific
  // notation when zeros at the end would be unclear (3.60 × 10³ min).
  var SLUG = "qs-dimensional-analysis-practice";
  function build(M) {
    function p(en, es) { return {en:en, es:es}; }
    function fill(pair, values) {
      return p(pair.en.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.en : v; }),
        pair.es.replace(/\{(\w+)\}/g, function (_, k) { var v = values[k]; return v && typeof v === "object" ? v.es : v; }));
    }
    function join(parts) { return p(parts.map(function (x) { return x.en; }).join(" "), parts.map(function (x) { return x.es; }).join(" ")); }
    var int = M.int, pick = M.pick, show = M.pretty, figs = M.figures;
    var POW = {1:"", 2:"²", 3:"³"};

    // Exact equalities, 1 big = k small.
    var EQ = {
      dh:{big:"d", small:"h", k:"24"}, hmin:{big:"h", small:"min", k:"60"}, mins:{big:"min", small:"s", k:"60"}, hs:{big:"h", small:"s", k:"3600"},
      kmm:{big:"km", small:"m", k:"1000"}, mcm:{big:"m", small:"cm", k:"100"}, cmmm:{big:"cm", small:"mm", k:"10"}, mmm:{big:"m", small:"mm", k:"1000"},
      kgg:{big:"kg", small:"g", k:"1000"}, gmg:{big:"g", small:"mg", k:"1000"},
      LmL:{big:"L", small:"mL", k:"1000"}, mLcc:{big:"mL", small:"cm³", k:"1"}
    };
    // A problem: from and to units, the factors in order and realistic starting amounts. A step is
    // [equality, unit it converts from, "num" or "den" (top or bottom of the starting unit), power].
    var ITEMS = {
      // Chains of time, length, mass and volume.
      "d>s":{from:"d", to:"s", steps:[["dh", "d"], ["hmin", "h"], ["mins", "min"]], range:[0.5, 30]},
      "d>min":{from:"d", to:"min", steps:[["dh", "d"], ["hmin", "h"]], range:[0.5, 20]},
      "h>s":{from:"h", to:"s", steps:[["hmin", "h"], ["mins", "min"]], range:[0.2, 24]},
      "s>h":{from:"s", to:"h", steps:[["mins", "s"], ["hmin", "min"]], range:[500, 90000]},
      "min>d":{from:"min", to:"d", steps:[["hmin", "min"], ["dh", "h"]], range:[500, 90000]},
      "s>d":{from:"s", to:"d", steps:[["mins", "s"], ["hmin", "min"], ["dh", "h"]], range:[20000, 900000]},
      "km>cm":{from:"km", to:"cm", steps:[["kmm", "km"], ["mcm", "m"]], range:[0.2, 50]},
      "km>mm":{from:"km", to:"mm", steps:[["kmm", "km"], ["mmm", "m"]], range:[0.01, 5]},
      "cm>km":{from:"cm", to:"km", steps:[["mcm", "cm"], ["kmm", "m"]], range:[100, 900000]},
      "mm>km":{from:"mm", to:"km", steps:[["mmm", "mm"], ["kmm", "m"]], range:[1000, 9000000]},
      "kg>mg":{from:"kg", to:"mg", steps:[["kgg", "kg"], ["gmg", "g"]], range:[0.002, 5]},
      "mg>kg":{from:"mg", to:"kg", steps:[["gmg", "mg"], ["kgg", "g"]], range:[50, 900000]},
      "L>cc":{from:"L", to:"cm³", steps:[["LmL", "L"], ["mLcc", "mL"]], range:[0.1, 5]},
      "cc>L":{from:"cm³", to:"L", steps:[["mLcc", "cm³"], ["LmL", "mL"]], range:[50, 5000]},
      // Rates and densities: the top unit, then the bottom unit.
      "kmh>ms":{from:"km/h", to:"m/s", steps:[["kmm", "km"], ["hs", "h", "den"]], range:[20, 150]},
      "ms>kmh":{from:"m/s", to:"km/h", steps:[["kmm", "m"], ["hs", "s", "den"]], range:[2, 400]},
      "kmh>mmin":{from:"km/h", to:"m/min", steps:[["kmm", "km"], ["hmin", "h", "den"]], range:[3, 120]},
      "mmin>kmh":{from:"m/min", to:"km/h", steps:[["kmm", "m"], ["hmin", "min", "den"]], range:[10, 3000]},
      "cms>mmin":{from:"cm/s", to:"m/min", steps:[["mcm", "cm"], ["mins", "s", "den"]], range:[1, 90]},
      "Lmin>mLs":{from:"L/min", to:"mL/s", steps:[["LmL", "L"], ["mins", "min", "den"]], range:[0.5, 30]},
      "mLs>Lh":{from:"mL/s", to:"L/h", steps:[["LmL", "mL"], ["hs", "s", "den"]], range:[0.2, 50]},
      "gmL>kgL":{from:"g/mL", to:"kg/L", steps:[["kgg", "g"], ["LmL", "mL", "den"]], range:[0.6, 13.6]},
      "mgmL>gL":{from:"mg/mL", to:"g/L", steps:[["gmg", "mg"], ["LmL", "mL", "den"]], range:[0.1, 50]},
      "gmin>kgh":{from:"g/min", to:"kg/h", steps:[["kgg", "g"], ["hmin", "min", "den"]], range:[5, 900]},
      // Squared and cubed units.
      "m2>cm2":{from:"m²", to:"cm²", steps:[["mcm", "m", "num", 2]], range:[0.02, 9]},
      "cm2>m2":{from:"cm²", to:"m²", steps:[["mcm", "cm", "num", 2]], range:[50, 9000]},
      "km2>m2":{from:"km²", to:"m²", steps:[["kmm", "km", "num", 2]], range:[0.5, 50]},
      "m3>cm3":{from:"m³", to:"cm³", steps:[["mcm", "m", "num", 3]], range:[0.002, 2]},
      "cm3>m3":{from:"cm³", to:"m³", steps:[["mcm", "cm", "num", 3]], range:[50, 9000]},
      "cm3>mm3":{from:"cm³", to:"mm³", steps:[["cmmm", "cm", "num", 3]], range:[0.5, 50]},
      "m3>L":{from:"m³", to:"L", steps:[["mcm", "m", "num", 3], ["mLcc", "cm³"], ["LmL", "mL"]], range:[0.05, 5]},
      "gcc>kgm3":{from:"g/cm³", to:"kg/m³", steps:[["kgg", "g"], ["mcm", "cm", "den", 3]], range:[0.5, 20]},
      "kgm3>gcc":{from:"kg/m³", to:"g/cm³", steps:[["kgg", "kg"], ["mcm", "m", "den", 3]], range:[500, 20000]}
    };
    var CHAINS = ["d>s", "d>min", "h>s", "s>h", "min>d", "s>d", "km>cm", "km>mm", "cm>km", "mm>km", "kg>mg", "mg>kg", "L>cc", "cc>L"];
    var RATES = ["kmh>ms", "ms>kmh", "kmh>mmin", "mmin>kmh", "cms>mmin", "Lmin>mLs", "mLs>Lh", "gmL>kgL", "mgmL>gL", "gmin>kgh"];
    var POWERS = ["m2>cm2", "cm2>m2", "km2>m2", "m3>cm3", "cm3>m3", "cm3>mm3", "m3>L", "gcc>kgm3", "kgm3>gcc"];
    var TWO = CHAINS.concat(RATES).filter(function (k) { return ITEMS[k].steps.length === 2; });
    // Every spelling of each answer unit: symbols (², ³, ^2, ^3 and 2, 3 are alike) and English and Spanish names.
    var ACCEPT = {
      "s":["s", "sec", "secs", "seconds", "second", "segundos", "segundo"], "min":["min", "mins", "minutes", "minute", "minutos", "minuto"],
      "h":["h", "hr", "hrs", "hours", "hour", "horas", "hora"], "d":["d", "day", "days", "días", "día", "dias", "dia"],
      "cm":["cm", "centimeters", "centimeter", "centimetres", "centímetros", "centímetro", "centimetros"],
      "mm":["mm", "millimeters", "millimeter", "millimetres", "milímetros", "milímetro", "milimetros"],
      "km":["km", "kilometers", "kilometer", "kilometres", "kilómetros", "kilómetro", "kilometros"],
      "kg":["kg", "kilograms", "kilogram", "kilogramos", "kilogramo"], "mg":["mg", "milligrams", "milligram", "miligramos", "miligramo"],
      "L":["L", "l", "liters", "liter", "litres", "litros", "litro"],
      "cm³":["cm³", "cc", "cubic centimeters", "cubic centimeter", "centímetros cúbicos", "centímetro cúbico", "centimetros cubicos"],
      "m/s":["m/s", "m s^-1", "meters per second", "metros por segundo"],
      "km/h":["km/h", "km/hr", "kph", "kilometers per hour", "kilómetros por hora", "kilometros por hora"],
      "m/min":["m/min", "meters per minute", "metros por minuto"], "mL/s":["mL/s", "ml/s", "milliliters per second", "mililitros por segundo"],
      "L/h":["L/h", "l/h", "L/hr", "liters per hour", "litros por hora"], "kg/L":["kg/L", "kg/l", "kilograms per liter", "kilogramos por litro"],
      "g/L":["g/L", "g/l", "grams per liter", "gramos por litro"], "kg/h":["kg/h", "kg/hr", "kilograms per hour", "kilogramos por hora"],
      "cm²":["cm²", "square centimeters", "centímetros cuadrados"], "m²":["m²", "square meters", "metros cuadrados"],
      "mm³":["mm³", "cubic millimeters", "milímetros cúbicos"], "m³":["m³", "cubic meters", "metros cúbicos"],
      "kg/m³":["kg/m³", "kilograms per cubic meter", "kilogramos por metro cúbico"], "g/cm³":["g/cm³", "g/cc", "grams per cubic centimeter", "gramos por centímetro cúbico"]
    };

    // One step as a factor: the unit it converts from goes on the bottom (or on top when it was on the bottom of a
    // rate), and the whole factor is raised to the step's power.
    function factor(step) {
      var e = EQ[step[0]], from = step[1], den = step[2] === "den", power = step[3] || 1;
      var smallTop = den ? from === e.small : from === e.big;
      var small = show(e.k) + " " + e.small, big = "1 " + e.big, top = smallTop ? small : big, bottom = smallTop ? big : small;
      var k = M.exact(e.k), value = smallTop ? k : M.div("1", k), raised = "1";
      for (var i = 0; i < power; i++) raised = M.mul(raised, value);
      return {text:"(" + top + " / " + bottom + ")" + POW[power], flipText:"(" + bottom + " / " + top + ")" + POW[power], value:raised, flat:value,
        from:from, den:den, power:power, e:e, smallTop:smallTop};
    }
    function steps(key) { return ITEMS[key].steps.map(factor); }
    function product(x, list, change) {
      return list.reduce(function (v, f, i) { var m = change ? change(f, i) : f.value; return m === null ? v : M.mul(v, m); }, M.exact(x));
    }
    function sf(text) { return M.read(text).sf; }
    function digits(random, n, lastNonzero) {
      var s = String(int(random, 1, 9));
      for (var i = 1; i < n; i++) s += i === n - 1 && lastNonzero ? int(random, 1, 9) : random() < 0.25 ? "0" : int(random, 0, 9);
      return s;
    }
    // A measurement between lo and hi with n significant figures: standard notation when it fits, or scientific
    // notation when a whole number would need zeros that do not count (4.32 × 10⁵ s, never 432000 s).
    function measure(random, n, lo, hi) {
      var low = Math.floor(Math.log10(lo)), high = Math.floor(Math.log10(hi));
      for (;;) {
        var mag = int(random, low, low > n - 1 ? high : Math.min(high, n - 1)), d = digits(random, n, mag === n - 1), x;
        if (mag > n - 1) x = (n === 1 ? d : d[0] + "." + d.slice(1)) + "e" + mag;
        else x = mag < 0 ? "0." + "0".repeat(-mag - 1) + d : mag === n - 1 ? d : d.slice(0, mag + 1) + "." + d.slice(mag + 1);
        if (Number(x) >= lo && Number(x) <= hi) return x;
      }
    }
    // How an answer is written: standard notation when it shows the significant figures plainly, otherwise
    // scientific notation (very large or small numbers, and zeros at the end that would be unclear).
    function written(value, n) {
      var r = M.rounded(value, {sf:n}).value, plain = M.write(value, {sf:n}, "plain"), mag = M.magnitude(r);
      var unclear = !/\./.test(plain) && /0$/.test(plain) && M.cmp(r, value) !== 0;
      return mag < -3 || mag > 4 || sf(plain) !== n || unclear ? M.write(value, {sf:n}, "sci") : plain;
    }
    function calc(value) {
      for (var k = 0; k <= 12; k++) if (M.cmp(M.roundAt(value, -k), value) === 0) return show(M.fixed(value, -k));
      return show(M.write(value, {sf:10}, "plain").replace(/0+$/, "").replace(/\.$/, ""));
    }
    function typed(unit) { return unit.replace("²", "^2").replace("³", "^3"); }
    function setupText(x, from, list, flip) {
      return show(x) + " " + from + list.map(function (f, i) { return " × " + (flip && flip(i) ? f.flipText : f.text); }).join("");
    }

    // Known mistakes: one factor upside down, a step left out, and a squared or cubed factor whose number was not.
    function traps(key, x, list) {
      var item = ITEMS[key], n = sf(x), out = [], seen = [product(x, list)];
      function add(value, note) {
        if (seen.some(function (v) { return M.cmp(v, value) === 0; })) return;
        seen.push(value); out.push({answer:M.write(value, {sf:n}, "sci"), note:note});
      }
      list.forEach(function (f, i) {
        if (list.length === 1 && f.power > 1) return;
        add(product(x, list, function (g, j) { return j === i ? M.div("1", g.value) : g.value; }), f.den ?
          fill(p("One factor is upside down: {u} is on the bottom of {from}, so it goes on top of {f} to cancel.", "Un factor está al revés: {u} está abajo en {from}, así que va arriba en {f} para cancelarse."), {u:f.from, from:item.from, f:f.text}) :
          fill(p("One factor is upside down: {u} goes on the bottom of {f} so it cancels.", "Un factor está al revés: {u} va abajo en {f} para que se cancele."), {u:f.from, f:f.text}));
      });
      if (list.length === 1) add(product(x, list, function (g) { return M.div("1", g.value); }), fill(p("The factor is upside down: {u} must cancel.", "El factor está al revés: {u} debe cancelarse."), {u:list[0].from + POW[list[0].power]}));
      if (RATES.indexOf(key) >= 0 || /\//.test(item.from)) list.forEach(function (f, i) {
        add(product(x, list, function (g, j) { return j === i ? null : g.value; }), fill(p("Convert both parts of {from}: {a} and {b} each need a factor.", "Convierte las dos partes de {from}: {a} y {b} necesitan un factor cada una."),
          {from:item.from, a:list[0].from + POW[list[0].power], b:list[1].from + POW[list[1].power]}));
      });
      else if (list.length > 1) add(product(x, list, function (g, j) { return j === list.length - 1 ? null : g.value; }),
        fill(p("Follow the path to the end: you still need the step to {to}.", "Sigue el camino hasta el final: todavía falta el paso a {to}."), {to:item.to}));
      list.forEach(function (f, i) {
        if (f.power < 2) return;
        add(product(x, list, function (g, j) { return j === i ? g.flat : g.value; }), whole(f));
        if (f.power === 3) add(product(x, list, function (g, j) { return j === i ? M.mul(g.flat, g.flat) : g.value; }),
          p("Cubic units need the factor cubed, not squared.", "Las unidades cúbicas necesitan el factor al cubo, no al cuadrado."));
      });
      return out;
    }
    function powerOf(k, n) { var v = M.exact("1"); for (var i = 0; i < n; i++) v = M.mul(v, k); return v; }
    // "Cube the whole factor, numbers and units: 1 m³ = (100 cm)³ = 1,000,000 cm³."
    function whole(f) {
      return fill(f.power === 3 ? p("Cube the whole factor, numbers and units: {eq}.", "Eleva al cubo todo el factor, números y unidades: {eq}.") :
        p("Square the whole factor, numbers and units: {eq}.", "Eleva al cuadrado todo el factor, números y unidades: {eq}."),
        {eq:"1 " + f.e.big + POW[f.power] + " = (" + show(f.e.k) + " " + f.e.small + ")" + POW[f.power] + " = " + show(M.fixed(powerOf(f.e.k, f.power), 0)) + " " + f.e.small + POW[f.power]});
    }

    function conversion(params) {
      var key = params[0], x = params[1], item = ITEMS[key], list = steps(key), n = sf(x), y = product(x, list), answer = written(y, n), setup = setupText(x, item.from, list);
      var lead;
      if (CHAINS.indexOf(key) >= 0) lead = fill(p("Path: {path}.", "Camino: {path}."), {path:[item.from].concat(list.map(function (f, i) { return i < list.length - 1 ? list[i + 1].from : item.to; })).join(" → ")});
      else if (RATES.indexOf(key) >= 0) {
        var den = list.filter(function (f) { return f.den; })[0];
        lead = fill(p("Convert one unit at a time. The unit {u} is on the bottom of {from}, so {u} goes on top of its factor.", "Convierte una unidad a la vez. La unidad {u} está abajo en {from}, así que {u} va arriba en su factor."), {u:den.from, from:item.from});
      } else lead = whole(list.filter(function (g) { return g.power > 1; })[0]);
      return {type:"numeric", answer:y.n + "/" + y.d, precision:{sf:n}, unit:item.to, accept:ACCEPT[item.to], check:{sf:"advice", unit:"optional"},
        display:answer + " " + typed(item.to), answerText:p(show(answer) + " " + item.to, show(answer) + " " + item.to), traps:traps(key, x, list),
        instruction:fill(p("Keep {n}.", "Conserva {n}."), {n:figs(n)}),
        prompt:fill(p("Convert {x} {from} to {to}.", "Convierte {x} {from} a {to}."), {x:show(x), from:item.from, to:item.to}),
        explanation:join([lead, fill(p("{setup} = {raw} {to}. The factors are exact, so keep the measurement's {n}: {y} {to}.", "{setup} = {raw} {to}. Los factores son exactos, así que conserva las {n} de la medición: {y} {to}."),
          {setup:setup, raw:calc(y), to:item.to, n:figs(n), y:show(answer)})])};
    }
    function make(random, list) { var key = pick(random, list); return [key, measure(random, int(random, 2, 4), ITEMS[key].range[0], ITEMS[key].range[1])]; }

    // What unit does a setup give: the right unit first, then the units from three common slips.
    var RESULT = {
      vt:{a:["m/s", 1.5, 40], b:["s", 2, 60], op:"×", key:"m", explanation:p("m/s × s: the s cancels, leaving m.", "m/s × s: la s se cancela y queda m."), wrong:[
        ["m/s²", p("That is what dividing by s gives. Multiplying by s cancels the s on the bottom.", "Eso da dividir entre s. Multiplicar por s cancela la s de abajo.")],
        ["m·s", p("The s you multiply by cancels the s on the bottom of m/s.", "La s por la que multiplicas cancela la s de abajo de m/s.")],
        ["s", p("Only s cancels; the m stays.", "Solo se cancela la s; la m se queda.")]]},
      dv:{a:["m", 10, 900], b:["m/s", 1.5, 40], op:"÷", key:"s", explanation:p("Dividing by m/s is multiplying by s/m: m × s/m = s.", "Dividir entre m/s es multiplicar por s/m: m × s/m = s."), wrong:[
        ["m²/s", p("That comes from multiplying. Dividing by m/s cancels m and moves s to the top.", "Eso sale de multiplicar. Dividir entre m/s cancela m y pasa s arriba.")],
        ["m/s", p("Dividing by m/s cancels the m, so m does not stay.", "Dividir entre m/s cancela la m, así que la m no se queda.")],
        ["1/s", p("Dividing by m/s moves s to the top, not the bottom.", "Dividir entre m/s pasa s arriba, no abajo.")]]},
      va:{a:["m/s", 1.5, 40], b:["s", 2, 60], op:"÷", key:"m/s²", explanation:p("Dividing by s adds an s on the bottom: m/s ÷ s = m/s².", "Dividir entre s agrega una s abajo: m/s ÷ s = m/s²."), wrong:[
        ["m", p("That comes from multiplying by s. Dividing by s puts a second s on the bottom.", "Eso sale de multiplicar por s. Dividir entre s pone una segunda s abajo.")],
        ["m/s", p("Dividing by s changes the unit: it adds an s on the bottom.", "Dividir entre s cambia la unidad: agrega una s abajo.")],
        ["m·s", p("Dividing by s puts s on the bottom, not on top.", "Dividir entre s pone s abajo, no arriba.")]]},
      dV:{a:["g/mL", 0.7, 13.6], b:["mL", 5, 500], op:"×", key:"g", explanation:p("g/mL × mL: the mL cancels, leaving g.", "g/mL × mL: el mL se cancela y queda g."), wrong:[
        ["g/mL²", p("That is what dividing by mL gives. Multiplying by mL cancels the mL on the bottom.", "Eso da dividir entre mL. Multiplicar por mL cancela el mL de abajo.")],
        ["g·mL", p("The mL you multiply by cancels the mL on the bottom of g/mL.", "El mL por el que multiplicas cancela el mL de abajo de g/mL.")],
        ["mL", p("Only mL cancels; the g stays.", "Solo se cancela el mL; el g se queda.")]]},
      md:{a:["g", 2, 900], b:["g/mL", 0.7, 13.6], op:"÷", key:"mL", explanation:p("Dividing by g/mL is multiplying by mL/g: g × mL/g = mL.", "Dividir entre g/mL es multiplicar por mL/g: g × mL/g = mL."), wrong:[
        ["g²/mL", p("That comes from multiplying. Dividing by g/mL cancels g and moves mL to the top.", "Eso sale de multiplicar. Dividir entre g/mL cancela g y pasa mL arriba.")],
        ["g/mL", p("Dividing by g/mL cancels the g, so g does not stay.", "Dividir entre g/mL cancela el g, así que el g no se queda.")],
        ["1/mL", p("Dividing by g/mL moves mL to the top, not the bottom.", "Dividir entre g/mL pasa mL arriba, no abajo.")]]},
      mV:{a:["g", 2, 900], b:["cm³", 1, 500], op:"÷", key:"g/cm³", explanation:p("Nothing cancels: g ÷ cm³ = g/cm³, a density.", "Nada se cancela: g ÷ cm³ = g/cm³, una densidad."), wrong:[
        ["g·cm³", p("That comes from multiplying. Dividing by cm³ puts cm³ on the bottom.", "Eso sale de multiplicar. Dividir entre cm³ pone cm³ abajo.")],
        ["cm³/g", p("That is upside down: the mass is on top and the volume on the bottom.", "Eso está al revés: la masa va arriba y el volumen abajo.")],
        ["g", p("Nothing cancels here, so cm³ stays on the bottom.", "Aquí nada se cancela, así que cm³ se queda abajo.")]]},
      rt:{a:["L/min", 0.5, 20], b:["min", 1, 60], op:"×", key:"L", explanation:p("L/min × min: the min cancels, leaving L.", "L/min × min: los min se cancelan y queda L."), wrong:[
        ["L/min²", p("That is what dividing by min gives. Multiplying by min cancels the min on the bottom.", "Eso da dividir entre min. Multiplicar por min cancela los min de abajo.")],
        ["L·min", p("The min you multiply by cancels the min on the bottom of L/min.", "Los min por los que multiplicas cancelan los min de abajo de L/min.")],
        ["min", p("Only min cancels; the L stays.", "Solo se cancelan los min; los L se quedan.")]]}
    };

    var topics = [
      {id:"chain", title:p("Chains of factors", "Cadenas de factores")},
      {id:"rate", title:p("Rates and densities", "Razones de cambio y densidades")},
      {id:"power", title:p("Squared and cubed units", "Unidades al cuadrado y al cubo")},
      {id:"result", title:p("Units of the result", "Unidades del resultado")}
    ];
    var generators = [
      // Chains: time (d, h, min, s), then length, mass and volume.
      {key:"ct", topic:"chain", make:function (r) { return make(r, CHAINS.slice(0, 6)); }, build:conversion},
      {key:"cl", topic:"chain", make:function (r) { return make(r, CHAINS.slice(6)); }, build:conversion},
      // Rates: speeds, then flow rates and densities.
      {key:"sp", topic:"rate", make:function (r) { return make(r, RATES.slice(0, 5)); }, build:conversion},
      {key:"fd", topic:"rate", make:function (r) { return make(r, RATES.slice(5)); }, build:conversion},
      // Squared units, cubed volume units, and densities with a cubed factor.
      {key:"sq", topic:"power", make:function (r) { return make(r, POWERS.slice(0, 3)); }, build:conversion},
      {key:"cu", topic:"power", make:function (r) { return make(r, POWERS.slice(3, 7)); }, build:conversion},
      {key:"dc", topic:"power", make:function (r) { return make(r, POWERS.slice(7)); }, build:conversion},
      // The unit of a result: m/s × s gives m, but m/s ÷ s gives m/s².
      {key:"ur", topic:"result", make:function (r) {
        var key = pick(r, Object.keys(RESULT)), c = RESULT[key];
        return [key, measure(r, int(r, 2, 3), c.a[1], c.a[2]), measure(r, int(r, 2, 3), c.b[1], c.b[2])];
      }, build:function (params) {
        var c = RESULT[params[0]], expr = show(params[1]) + " " + c.a[0] + " " + c.op + " " + show(params[2]) + " " + c.b[0];
        return {type:"mc", answer:0, prompt:fill(p("What unit does {expr} give?", "¿Qué unidad da {expr}?"), {expr:expr}),
          choices:[{text:p(c.key, c.key), why:p("", "")}].concat(c.wrong.map(function (w) { return {text:p(w[0], w[0]), why:w[1]}; })), explanation:c.explanation};
      }},
      // Which chain works: the units check it. One or both factors flipped do not cancel.
      {key:"uk", topic:"result", make:function (r) { return make(r, TWO); }, build:function (params) {
        var key = params[0], x = params[1], item = ITEMS[key], list = steps(key);
        var u = list.map(function (f) { return f.from; });
        function wrong(i) {
          return fill(p("In {f}, {u} is on the wrong side, so it does not cancel.", "En {f}, {u} está del lado equivocado, así que no se cancela."), {f:list[i].flipText, u:u[i]});
        }
        return {type:"mc", answer:0, prompt:fill(p("Which setup converts {x} {from} to {to}?", "¿Qué planteamiento convierte {x} {from} a {to}?"), {x:show(x), from:item.from, to:item.to}),
          choices:[{text:p(setupText(x, item.from, list), setupText(x, item.from, list)), why:p("", "")},
            {text:p(setupText(x, item.from, list, function (i) { return i === 0; }), setupText(x, item.from, list, function (i) { return i === 0; })), why:wrong(0)},
            {text:p(setupText(x, item.from, list, function (i) { return i === 1; }), setupText(x, item.from, list, function (i) { return i === 1; })), why:wrong(1)},
            {text:p(setupText(x, item.from, list, function () { return true; }), setupText(x, item.from, list, function () { return true; })),
              why:fill(p("Neither factor cancels its unit: {a} and {b} are on the wrong side.", "Ningún factor cancela su unidad: {a} y {b} están del lado equivocado."), {a:u[0], b:u[1]})}],
          explanation:fill(p("Each factor cancels one unit: {a} in {f} and {b} in {g}, leaving {to}.", "Cada factor cancela una unidad: {a} en {f} y {b} en {g}, y queda {to}."),
            {a:u[0], b:u[1], f:list[0].text, g:list[1].text, to:item.to})};
      }}
    ];
    return M.generatedBank({topics:topics, generators:generators, perTopic:8, mixedSize:12,
      lesson:"https://zornscience.org/science/quantitative-skills/units/dimensional-analysis/",
      copy:{title:"Dimensional Analysis Practice", es:{
        "Dimensional Analysis Practice":"Práctica de análisis dimensional",
        "Quantitative Skills · Units":"Habilidades cuantitativas · Unidades",
        "New numbers every set.":"Números nuevos en cada serie.",
        "Choose one skill for 8 questions, or Mixed review for 12. Every set has new numbers.":"Elige una habilidad para 8 preguntas o Repaso mixto para 12. Cada serie tiene números nuevos.",
        "No timer. Use scratch paper and a calculator. The method from the lesson is below.":"Sin límite de tiempo. Usa papel y calculadora. El método de la lección está abajo.",
        "Choose a skill, then start. Mixed review includes all four skills.":"Elige una habilidad y comienza. El repaso mixto incluye las cuatro habilidades.",
        "Type your answer. A unit after the number is optional; type m^3 or m3 for m³.":"Escribe tu respuesta. La unidad después del número es opcional; escribe m^3 o m3 para m³.",
        "Keep the measurement's significant figures, and use scientific notation when zeros at the end would be unclear, like 3.60 x 10^3. A different number of significant figures still counts, with a note.":"Conserva las cifras significativas de la medición y usa notación científica cuando los ceros al final no serían claros, como 3.60 x 10^3. Un número distinto de cifras significativas también cuenta, con una nota.",
        "Submit once per question and read the feedback. Try again gives you new numbers.":"Envía una respuesta por pregunta y lee la retroalimentación. Intentar de nuevo te da números nuevos.",
        "Type a number such as 25.0 or 6.93 x 10^5. You may add the unit after it.":"Escribe un número como 25.0 o 6.93 x 10^5. Puedes agregar la unidad después.",
        "Unit":"Unidad", "Reference":"Consulta", "Dimensional analysis":"Análisis dimensional",
        "Map the path first: write the starting unit and the goal, with one factor per step.":"Primero traza el camino: escribe la unidad inicial y la meta, con un factor por paso.",
        "Chain the factors so each bottom unit cancels the top unit before it: 1.5 h × (60 min / 1 h) × (60 s / 1 min) = 5400 s.":"Encadena los factores para que cada unidad de abajo cancele la unidad de arriba anterior: 1.5 h × (60 min / 1 h) × (60 s / 1 min) = 5400 s.",
        "Rates: convert one unit at a time. Hours are on the bottom of km/h, so h goes on top: 90.0 km/h × (1000 m / 1 km) × (1 h / 3600 s) = 25.0 m/s.":"Razones de cambio: convierte una unidad a la vez. Las horas están abajo en km/h, así que h va arriba: 90.0 km/h × (1000 m / 1 km) × (1 h / 3600 s) = 25.0 m/s.",
        "Squared and cubed units: square or cube the whole factor, numbers and units. (100 cm / 1 m)³ gives 1 m³ = 1,000,000 cm³, and 1 m² = 10,000 cm².":"Unidades al cuadrado y al cubo: eleva al cuadrado o al cubo todo el factor, números y unidades. (100 cm / 1 m)³ da 1 m³ = 1,000,000 cm³, y 1 m² = 10,000 cm².",
        "1 cm³ = 1 mL exactly: 0.355 L = 355 mL = 355 cm³.":"1 cm³ = 1 mL exactamente: 0.355 L = 355 mL = 355 cm³.",
        "Let the units check the setup: m/s × s gives m, but m/s ÷ s gives m/s², so that setup is wrong.":"Deja que las unidades revisen el planteamiento: m/s × s da m, pero m/s ÷ s da m/s², así que ese planteamiento está mal.",
        "The factors are exact, so the answer keeps the measurement's significant figures. When zeros at the end would be unclear, use scientific notation: 2.50 d = 3.60 × 10":"Los factores son exactos, así que la respuesta conserva las cifras significativas de la medición. Cuando los ceros al final no serían claros, usa notación científica: 2.50 d = 3.60 × 10",
        "Practice for the Dimensional Analysis lesson in Quantitative Skills. Original ZornScience questions.":"Práctica para la lección Análisis dimensional de Habilidades cuantitativas. Preguntas originales de ZornScience."
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
