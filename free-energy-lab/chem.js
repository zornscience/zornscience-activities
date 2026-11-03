(function () {
  "use strict";
  function superscript(value) {
    return String(value)
      .split("")
      .map(function (c) {
        return (
          {
            "-": "⁻",
            0: "⁰",
            1: "¹",
            2: "²",
            3: "³",
            4: "⁴",
            5: "⁵",
            6: "⁶",
            7: "⁷",
            8: "⁸",
            9: "⁹",
          }[c] || c
        );
      })
      .join("");
  }
  function format(value, digits) {
    if (!Number.isFinite(value))
      return Number.isNaN(value) ? "undefined" : value < 0 ? "−∞" : "∞";
    if (value === 0) return "0";
    digits = digits || 3;
    var rounded = Number(value.toPrecision(digits)),
      magnitude = Math.abs(rounded),
      out;
    if (magnitude < 0.001 || magnitude >= 10000) {
      var parts = rounded.toExponential(digits - 1).split("e");
      out = parts[0] + " × 10" + superscript(Number(parts[1]));
    } else
      out = rounded.toFixed(
        Math.max(0, digits - 1 - Math.floor(Math.log10(magnitude))),
      );
    return out.replace(/^-/, "−");
  }
  function sigDigits(value) {
    var s = String(value)
      .trim()
      .split(/(?:[eE]|×)/)[0]
      .trim()
      .replace(/^[+\u2212-]/, "")
      .replace(".", "")
      .replace(/^0+/, "");
    return Math.max(1, Math.min(6, s.length));
  }
  // Only sums of numeric constants and multiples of x are accepted. No code execution.
  function parseLinear(value) {
    if (typeof value !== "string" || value.length > 160) return null;
    var sup = {
      "⁻": "-",
      "⁺": "+",
      "⁰": "0",
      "¹": "1",
      "²": "2",
      "³": "3",
      "⁴": "4",
      "⁵": "5",
      "⁶": "6",
      "⁷": "7",
      "⁸": "8",
      "⁹": "9",
    };
    var s = value
      .trim()
      .replace(/[\u2212\u002d]/g, "-")
      .replace(/\s*×\s*10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function (all, power) {
        return (
          "e" +
          power
            .split("")
            .map(function (c) {
              return sup[c];
            })
            .join("")
        );
      });
    if (!s) return null;
    var term =
      /([+-]?)\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?(?:\s*(?:[*·×]\s*)?([xX]))?|([xX]))/y;
    var pos = 0,
      count = 0,
      a = 0,
      b = 0;
    while (pos < s.length) {
      while (/\s/.test(s.charAt(pos)) && pos < s.length) pos++;
      term.lastIndex = pos;
      var m = term.exec(s);
      if (!m || (count > 0 && !m[1]) || ++count > 8) return null;
      var n =
        m[2] === undefined
          ? 1
          : Number(m[2] + (m[3] === undefined ? "" : "e" + m[3]));
      if (m[1] === "-") n = -n;
      if (!Number.isFinite(n)) return null;
      if (m[4] || m[5]) b += n;
      else a += n;
      pos = term.lastIndex;
      while (pos < s.length && /\s/.test(s.charAt(pos))) pos++;
    }
    return Number.isFinite(a) && Number.isFinite(b) ? { a: a, b: b } : null;
  }
  function parseNumber(value) {
    if (typeof value === "number") return value;
    var parsed = parseLinear(value);
    return parsed && parsed.b === 0 ? parsed.a : NaN;
  }
  function matchesNumber(value, expected, digits) {
    var n = parseNumber(value);
    if (!Number.isFinite(n) || !Number.isFinite(expected)) return false;
    var places =
        (digits || 3) - 1 - Math.floor(Math.log10(Math.abs(expected) || 1)),
      tolerance = expected === 0 ? 1e-12 : 0.5 * Math.pow(10, -places);
    return Math.abs(n - expected) <= tolerance + Math.abs(expected) * 1e-12;
  }
  function niceScale(maximum) {
    maximum = Number.isFinite(maximum) && maximum > 0 ? maximum : 1;
    var raw = maximum / 4,
      power = Math.pow(10, Math.floor(Math.log10(raw))),
      unit = raw / power,
      step = (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power,
      top = Math.ceil(maximum / step) * step,
      ticks = [];
    for (var i = 0; i <= Math.round(top / step); i++)
      ticks.push(Number((i * step).toPrecision(12)));
    return { max: top, step: step, ticks: ticks };
  }
  var R = 8.314;
  function finite(values) {
    if (
      values.some(function (v) {
        return !Number.isFinite(v);
      })
    )
      throw new RangeError("Finite inputs required");
  }
  function gibbs(dh, ds, t) {
    finite([dh, ds, t]);
    if (t <= 0) throw new RangeError("Positive kelvin required");
    return dh - (t * ds) / 1000;
  }
  // Round only the final subtraction. Input decimal places and the product's
  // significant figures set the displayed precision, while the model stays exact.
  function gibbsDisplay(dh, ds, t, places) {
    var value = gibbs(dh, ds, t),
      decimals =
        places === undefined ? (String(dh).split(".")[1] || "").length : places,
      product = Math.abs((t * ds) / 1000);
    if (product > 0) {
      var digits = Math.min(sigDigits(ds), sigDigits(t));
      decimals = Math.min(
        decimals,
        Math.max(0, digits - 1 - Math.floor(Math.log10(product))),
      );
    }
    var result = value.toFixed(Math.min(10, decimals));
    if (decimals === 0 && /0$/.test(result) && Number(result) !== 0)
      result += ".";
    return result.replace(/^-/, "−");
  }
  function crossover(dh, ds) {
    finite([dh, ds]);
    var t = dh / (ds / 1000);
    return ds !== 0 && t > 0 ? t : null;
  }
  function signCase(dh, ds) {
    return dh <= 0 && ds >= 0
      ? "all"
      : dh >= 0 && ds <= 0
        ? "never"
        : dh < 0
          ? "low"
          : "high";
  }
  function toK(dg, t) {
    finite([dg, t]);
    if (t <= 0) throw new RangeError("Positive kelvin required");
    var exponent = (-dg * 1000) / (R * t);
    return {
      exponent: exponent,
      k: Math.exp(exponent),
      log10: exponent / Math.LN10,
    };
  }
  function fromK(k, t) {
    finite([k, t]);
    if (k <= 0 || t <= 0)
      throw new RangeError("Positive K and kelvin required");
    return (-R * t * Math.log(k)) / 1000;
  }
  function forgottenConversion(answer, dh, ds, t) {
    return (
      matchesNumber(answer, dh - t * ds, 2) &&
      !matchesNumber(answer, gibbs(dh, ds, t), 2)
    );
  }
  var ENTROPY = {
    water: {
      label: "H₂O(l) → H₂O(g)",
      sign: 1,
      gas: [0, 1],
      view: "phase",
      why: "Matter becomes more dispersed. Moles of gas increase from 0 to 1.",
    },
    combustion: {
      label: "2H₂(g) + O₂(g) → 2H₂O(l)",
      sign: -1,
      gas: [3, 0],
      view: "reaction",
      why: "Matter becomes less dispersed. Moles of gas decrease from 3 to 0.",
    },
    caco3: {
      label: "CaCO₃(s) → CaO(s) + CO₂(g)",
      sign: 1,
      gas: [0, 1],
      view: "reaction",
      why: "Matter becomes more dispersed. Moles of gas increase from 0 to 1.",
    },
    argon: {
      label: "Argon cooled from 400 K to 300 K at constant volume",
      sign: -1,
      view: "temperature",
      why: "Cooling reduces the number of accessible microstates. Energy becomes less dispersed.",
    },
    haber: {
      label: "N₂(g) + 3H₂(g) → 2NH₃(g)",
      sign: -1,
      gas: [4, 2],
      view: "reaction",
      why: "Matter becomes less dispersed. Moles of gas decrease from 4 to 2.",
    },
    nacl: {
      label: "NaCl(s) → Na⁺(aq) + Cl⁻(aq)",
      sign: 1,
      view: "salt",
      why: "Matter becomes more dispersed. For NaCl, ion dispersal outweighs ordering of water around ions.",
    },
    expansion: {
      label: "A gas expanding into a vacuum",
      sign: 1,
      view: "volume",
      why: "Matter becomes more dispersed. More positions and microstates are available.",
    },
    melting: {
      label: "H₂O(s) → H₂O(l)",
      sign: 1,
      view: "phase",
      why: "Matter becomes more dispersed as the solid lattice becomes a liquid.",
    },
  };
  var S = {
    "CH₄(g)": 186.3,
    "O₂(g)": 205.0,
    "CO₂(g)": 213.7,
    "H₂O(l)": 69.9,
    "NH₄Cl(s)": 94.6,
    "NH₃(g)": 192.5,
    "HCl(g)": 186.9,
    "NO(g)": 210.8,
    "N₂(g)": 191.6,
    "H₂(g)": 130.7,
  };
  var DS = {
    ch4: {
      label: "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)",
      reactants: { "CH₄(g)": 1, "O₂(g)": 2 },
      products: { "CO₂(g)": 1, "H₂O(l)": 2 },
    },
    nh4cl: {
      label: "NH₄Cl(s) → NH₃(g) + HCl(g)",
      reactants: { "NH₄Cl(s)": 1 },
      products: { "NH₃(g)": 1, "HCl(g)": 1 },
    },
    no2: {
      label: "2NO(g) + O₂(g) → 2NO₂(g)",
      reactants: { "NO(g)": 2, "O₂(g)": 1 },
      products: { "NO₂(g)": 2 },
      unknown: true,
      ds: -146.4,
    },
    haber: {
      label: ENTROPY.haber.label,
      reactants: { "N₂(g)": 1, "H₂(g)": 3 },
      products: { "NH₃(g)": 2 },
    },
  };
  function entropyTable(chem) {
    return Object.assign({}, S, { "NH₃(g)": chem ? 192.8 : 192.5 });
  }
  function sum(species, values) {
    return Object.keys(species).reduce(function (total, id) {
      if (!Number.isFinite(values[id])) throw new RangeError("Unknown species");
      return total + species[id] * values[id];
    }, 0);
  }
  function entropy(id, chem) {
    var r = DS[id],
      s = entropyTable(chem);
    if (r.unknown)
      return {
        reactants: sum(r.reactants, s),
        products: sum(r.reactants, s) + r.ds,
        ds: r.ds,
        unknown: (sum(r.reactants, s) + r.ds) / 2,
      };
    var a = sum(r.reactants, s),
      b = sum(r.products, s);
    return { reactants: a, products: b, ds: b - a };
  }
  var THERMO = {
    haber: {
      label: ENTROPY.haber.label,
      dh: -92.2,
      ds: -198.8,
      chemDs: -198.1,
    },
    caco3: {
      label: ENTROPY.caco3.label,
      dh: 178.3,
      ds: 160.6,
      chemDh: 178,
      chemDs: 161,
    },
    n2o4: { label: "2NO₂(g) → N₂O₄(g)", dh: -57.2, ds: -175.9 },
    all: { label: "Illustrative exothermic dispersal", dh: -40, ds: 100 },
    never: { label: "Illustrative endothermic ordering", dh: 40, ds: -100 },
  };
  function thermo(id, chem) {
    var r = THERMO[id];
    return {
      label: r.label,
      dh: chem && r.chemDh !== undefined ? r.chemDh : r.dh,
      ds: chem && r.chemDs !== undefined ? r.chemDs : r.ds,
    };
  }
  var CONTROL = {
    sucrose: { label: "Sucrose + O₂", dg: -5796, ea: 320 },
    hcl: {
      label: "H₂(g) + Cl₂(g) → 2HCl(g), in the dark",
      dg: -190.6,
      ea: 180,
    },
    unfavored: { label: "Illustrative unfavored reaction", dg: 45, ea: 200 },
  };
  function control(id, catalyst, heated, light) {
    var r = CONTROL[id],
      ea = r.ea * (catalyst ? 0.3 : 1),
      fast = heated || catalyst || (id === "hcl" && light);
    return {
      dg: r.dg,
      ea: ea,
      rate: r.dg > 0 ? 0.02 : fast ? 0.85 : 0.002,
      classification: r.dg > 0 ? "unfavored" : fast ? "fast" : "kinetic",
    };
  }
  var KCASES = {
    haber: { label: "Haber", dg: -32.9 },
    acetic: { label: "Acetic acid", k: 1.8e-5 },
    n2o4: { label: THERMO.n2o4.label, dg: -4.8 },
    no: { label: "N₂(g) + O₂(g) → 2NO(g)", dg: 173.2 },
  };
  var SALTS = {
    nh4no3: { label: "NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)", dh: 28.1, ds: 108.7 },
    caco3: { label: "CaCO₃(s) → Ca²⁺(aq) + CO₃²⁻(aq)", dh: -13, ds: -202.9 },
  };
  function driving(dh, ds, t) {
    return gibbs(dh, ds, t) >= 0
      ? "unfavored"
      : dh > 0
        ? "entropy"
        : "enthalpy";
  }
  var COUPLING = {
    iron: {
      first: { "Fe₂O₃(s)": -2, "Fe(s)": 4, "O₂(g)": 3 },
      second: { "CO(g)": -6, "O₂(g)": -3, "CO₂(g)": 6 },
      dg: [1484.4, -1543.2],
    },
    mercury: {
      first: { "HgS(s)": -1, "Hg(l)": 1, "S(s)": 1 },
      second: { "S(s)": -1, "O₂(g)": -1, "SO₂(g)": 1 },
      dg: [50.6, -300.2],
    },
  };
  function combine(id, include) {
    var r = COUPLING[id],
      net = Object.assign({}, r.first),
      common = [];
    if (include)
      Object.keys(r.second).forEach(function (s) {
        if (net[s] && net[s] * r.second[s] < 0) common.push(s);
        net[s] = (net[s] || 0) + r.second[s];
        if (net[s] === 0) delete net[s];
      });
    return { net: net, common: common, dg: r.dg[0] + (include ? r.dg[1] : 0) };
  }
  // Safe constant arithmetic for coefficient-weighted sums, without code execution.
  function parseSum(value) {
    var s = String(value)
      .replace(/−/g, "-")
      .replace(/\s/g, "")
      .replace(/[×·]/g, "*");
    if (!/^[+\-\d.*]+$/.test(s) || s.length > 160) return NaN;
    var terms = s.match(/[+-]?[^+-]+/g);
    if (!terms || terms.join("") !== s) return NaN;
    var result = terms.reduce(function (a, term) {
      var sign = term[0] === "-" ? -1 : 1;
      term = term.replace(/^[+-]/, "");
      var parts = term.split("*");
      if (
        parts.length > 3 ||
        parts.some(function (p) {
          return !/^(\d+(\.\d*)?|\.\d+)$/.test(p);
        })
      )
        return NaN;
      return (
        a +
        sign *
          parts.reduce(function (a, p) {
            return a * Number(p);
          }, 1)
      );
    }, 0);
    return result;
  }
  function safeLesson(value, lang) {
    try {
      var u = new URL(value);
      if (
        u.protocol !== "https:" ||
        u.hostname !== "zornscience.org" ||
        u.port ||
        u.username ||
        u.password
      )
        return null;
      u.pathname = u.pathname.replace(/^\/es(?=\/|$)/, "") || "/";
      if (lang === "es") u.pathname = "/es" + u.pathname;
      return u.href;
    } catch (e) {
      return null;
    }
  }
  var api = {
    R: R,
    ENTROPY: ENTROPY,
    DS: DS,
    THERMO: THERMO,
    CONTROL: CONTROL,
    KCASES: KCASES,
    SALTS: SALTS,
    COUPLING: COUPLING,
    entropyTable: entropyTable,
    entropy: entropy,
    sum: sum,
    thermo: thermo,
    gibbs: gibbs,
    gibbsDisplay: gibbsDisplay,
    crossover: crossover,
    signCase: signCase,
    toK: toK,
    fromK: fromK,
    forgottenConversion: forgottenConversion,
    control: control,
    driving: driving,
    combine: combine,
    parseSum: parseSum,
    safeLesson: safeLesson,
    format: format,
    sigDigits: sigDigits,
    superscript: superscript,
    parseNumber: parseNumber,
    matchesNumber: matchesNumber,
    niceScale: niceScale,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="free-energy-lab"]');
    if (root)
      root.addEventListener("zsa-fe:request-model", function (e) {
        e.detail.receive(api);
      });
  }
})();
