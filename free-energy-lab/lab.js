(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="free-energy-lab"]'),
    M,
    I;
  root.dispatchEvent(
    new CustomEvent("zsa-fe:request-model", {
      detail: {
        receive: function (a) {
          M = a;
        },
      },
    }),
  );
  root.dispatchEvent(
    new CustomEvent("zsa:request-i18n", {
      detail: {
        receive: function (a) {
          I = a;
        },
      },
    }),
  );
  function t(s, v) {
    var courseCopy = {
      "Favored and fast": "Spontaneous and fast",
      "Thermodynamically unfavored": "Not spontaneous",
      "Not favored": "Not spontaneous",
      "Correct. The coupled reaction is thermodynamically favored.":
        "Correct. The coupled reaction is spontaneous.",
    };
    var text = I.text(chem && courseCopy[s] ? courseCopy[s] : s, v || {});
    return chem ? text.replace(/ΔG°/g, "ΔG") : text;
  }
  function $(id) {
    return document.getElementById(id);
  }
  function f(n, d) {
    return M.format(n, d || 3)
      .replace(/\.0+(?= |$)/, "")
      .replace(/(\.\d*?[1-9])0+(?= |$)/, "$1");
  }
  function given(n) {
    return f(n, M.sigDigits(n));
  }
  function tick(n) {
    return f(n)
      .replace(/\.0+(?= |$)/, "")
      .replace(/(\.\d*?[1-9])0+(?= |$)/, "$1");
  }
  function content(n, text) {
    var parts = String(text).split("molrxn");
    n.replaceChildren();
    parts.forEach(function (part, i) {
      if (i) {
        n.appendChild(document.createTextNode("mol"));
        var sub = document.createElementNS(
          n.namespaceURI,
          n.namespaceURI === "http://www.w3.org/2000/svg" ? "tspan" : "sub",
        );
        if (sub.localName === "tspan") {
          sub.setAttribute("baseline-shift", "sub");
          sub.setAttribute("font-size", "75%");
        }
        sub.textContent = "rxn";
        n.appendChild(sub);
      }
      n.appendChild(document.createTextNode(part));
    });
  }
  // Each exercise owns its reveal state. A wrong committed answer enables help.
  function solution(h, id, update) {
    var open = false;
    var show = button(
      h,
      "Show solution",
      function () {
        open = true;
        show.hidden = true;
        update();
      },
      "show-" + id,
    );
    show.hidden = true;
    return {
      get open() {
        return open;
      },
      check: function (ok) {
        open = ok;
        show.hidden = ok;
        update();
      },
      reset: function () {
        open = false;
        show.hidden = true;
      },
    };
  }
  function el(tag, text, cls) {
    var n = document.createElement(tag);
    if (text !== undefined) content(n, text);
    if (cls) n.className = cls;
    return n;
  }
  function add(h, tag, text, cls) {
    var n = el(tag, text, cls);
    h.appendChild(n);
    return n;
  }
  function p(h, s, v, cls) {
    return add(h, "p", t(s, v), cls);
  }
  function title(h, s) {
    return add(h, "h2", t(s));
  }
  function button(h, s, fn, id) {
    var n = add(h, "button", t(s), "zsa-btn");
    n.type = "button";
    if (id) n.id = id;
    n.onclick = fn;
    return n;
  }
  function field(h, label, value, id, fn) {
    var l = add(h, "label", t(label)),
      n = add(h, "input");
    l.htmlFor = id;
    n.id = id;
    n.type = "text";
    n.inputMode = "decimal";
    n.value = String(value).replace(/^-/, "−");
    n.onchange = fn || function () {};
    return n;
  }
  function select(h, label, options, value, id, fn) {
    var l = add(h, "label", t(label)),
      n = add(h, "select");
    l.htmlFor = id;
    n.id = id;
    options.forEach(function (o) {
      var a = add(n, "option", t(o[1]));
      a.value = o[0];
    });
    n.value = value;
    n.onchange = fn;
    return n;
  }
  function options(obj) {
    return Object.keys(obj).map(function (id) {
      return [id, obj[id].label];
    });
  }
  function feedback(h, id) {
    var n = p(h, "", {}, "zsa-fe-readout zsa-fe-feedback");
    n.id = id;
    n.setAttribute("role", "status");
    n.setAttribute("aria-live", "polite");
    return n;
  }
  function say(n, s, v) {
    content(n, t(s, v));
    content($("live"), n.textContent);
  }
  function table(h, heads, rows, caption) {
    var wrap = add(h, "div", undefined, "zsa-fe-scroll");
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", t(caption || "Data table"));
    var tab = add(wrap, "table");
    add(tab, "caption", t(caption || "Data table"));
    var tr = add(add(tab, "thead"), "tr");
    heads.forEach(function (s) {
      var th = add(tr, "th", t(s));
      th.scope = "col";
    });
    var body = add(tab, "tbody");
    rows.forEach(function (row) {
      var tr = add(body, "tr");
      row.forEach(function (s) {
        add(tr, "td", typeof s === "number" ? given(s) : t(String(s)));
      });
    });
    return tab;
  }
  function svg(h, label) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 620 310");
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", t(label));
    s.classList.add("zsa-fe-chart");
    h.appendChild(s);
    return s;
  }
  function shape(s, tag, attrs, text) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(function (k) {
      n.setAttribute(k, attrs[k]);
    });
    if (text !== undefined) content(n, text);
    s.appendChild(n);
    return n;
  }
  function line(s, x, y, x2, y2, color, dash) {
    return shape(s, "line", {
      x1: x,
      y1: y,
      x2: x2,
      y2: y2,
      stroke: color || "#64748b",
      "stroke-width": 2,
      "stroke-dasharray": dash || "none",
    });
  }
  function label(s, x, y, text) {
    return shape(s, "text", { x: x, y: y }, text);
  }
  function layout(mode) {
    $("live").textContent = "";
    var host = $("panel-" + mode);
    host.replaceChildren();
    var grid = add(host, "div", undefined, "zsa-fe-layout"),
      a = add(grid, "div", undefined, "zsa-card"),
      b = add(grid, "div", undefined, "zsa-card");
    return [a, b];
  }
  var params = new URLSearchParams(location.search),
    modes = ["entropy", "ds", "dg", "control", "k", "coupled"],
    mode = modes.includes(params.get("mode")) ? params.get("mode") : "entropy",
    chem = params.get("course") === "chem",
    G = chem ? "ΔG" : "ΔG°",
    H = chem ? "ΔH" : "ΔH°",
    S = chem ? "ΔS" : "ΔS°",
    gu = chem ? "kJ" : "kJ/molrxn",
    su = chem ? "J/K" : "J/(molrxn·K)",
    exportHeads = [],
    exportRows = [],
    displayRows = [];
  function chosen(obj, fallback) {
    var value = params.get("rxn") || params.get("case");
    return Object.hasOwn(obj, value) ? value : fallback;
  }
  function valid(s, lo, hi, fallback) {
    var n = M.parseNumber(s || "");
    return Number.isFinite(n) && n >= lo && n <= hi ? n : fallback;
  }
  function data(heads, rows, displayed) {
    exportHeads = heads;
    exportRows = rows;
    displayRows = displayed || rows;
    $("copy-fallback").hidden = true;
    $("copy-fallback").value = "";
    $("export-status").textContent = "";
    $("data-table").replaceChildren();
    table($("data-table"), heads, displayRows);
  }
  function favored(dg) {
    return t(
      dg < 0
        ? chem
          ? "spontaneous"
          : "thermodynamically favored"
        : dg > 0
          ? chem
            ? "not spontaneous"
            : "not thermodynamically favored"
          : "at equilibrium in the standard state",
    );
  }
  function work(h, dh, ds, temp, places, revealed) {
    p(
      h,
      "Entropy conversion: {s} ÷ 1000 = {converted} {unit}",
      {
        s: given(ds) + " " + su,
        converted: f(ds / 1000, M.sigDigits(ds)),
        unit: chem ? "kJ/K" : "kJ/(molrxn·K)",
      },
      "zsa-fe-formula",
    );
    p(h, "{g} = {h} − T{s}", { g: G, h: H, s: S }, "zsa-fe-formula");
    if (!revealed) return;
    p(
      h,
      "{g} = {h} − ({t})({s}) = {value} {unit}",
      {
        g: G,
        h:
          places === undefined
            ? given(dh)
            : dh.toFixed(places).replace("-", "−"),
        t: tick(temp) + " K",
        s: f(ds / 1000, M.sigDigits(ds)),
        value: M.gibbsDisplay(dh, ds, temp, places),
        unit: gu,
      },
      "zsa-fe-readout",
    );
    p(h, "{status}", { status: favored(M.gibbs(dh, ds, temp)) });
    content(
      $("live"),
      t("T = {t} K; {g} = {value} {unit}; {status}", {
        t: tick(temp),
        g: G,
        value: M.gibbsDisplay(dh, ds, temp, places),
        unit: gu,
        status: favored(M.gibbs(dh, ds, temp)),
      }),
    );
  }
  function particleBox(s, x, y, w, labelText, state, count) {
    shape(s, "rect", {
      x: x,
      y: y,
      width: w,
      height: 130,
      rx: 8,
      fill: "#fff",
      stroke: "#64748b",
    });
    label(s, x, y - 9, t(labelText));
    for (var i = 0; i < count; i++) {
      var px =
          state === "gas"
            ? x + 12 + ((i * 71 + 13) % (w - 24))
            : x + w / 2 - 35 + (i % 4) * 21,
        py =
          state === "gas"
            ? y + 12 + ((i * 43 + 17) % 106)
            : state === "solid"
              ? y + 55 + Math.floor(i / 4) * 21
              : y + 55 + Math.floor(i / 4) * 18 + (i % 3) * 4;
      shape(s, "circle", { cx: px, cy: py, r: 6, fill: "#1d4ed8" });
    }
  }
  function entropyView(h, id) {
    var r = M.ENTROPY[id];
    title(h, "Particle view");
    var s = svg(h, "Particle comparison. See the description and Data table.");
    if (r.view === "phase") {
      particleBox(s, 20, 45, 170, "Solid", "solid", 12);
      particleBox(s, 220, 45, 170, "Liquid", "liquid", 12);
      particleBox(s, 420, 45, 170, "Gas", "gas", 12);
      p(
        h,
        "Solid: fixed lattice. Liquid: mobile neighbors. Gas: widely dispersed particles. More accessible microstates mean greater entropy.",
      );
      data(
        ["State", "Particle arrangement"],
        [
          ["Solid", "Fixed lattice"],
          ["Liquid", "Mobile neighbors"],
          ["Gas", "Widely dispersed"],
        ],
      );
    } else if (r.view === "volume") {
      particleBox(s, 25, 45, 130, "Small volume", "gas", 12);
      particleBox(s, 250, 45, 330, "Large volume", "gas", 12);
      p(
        h,
        "The same 12 particles occupy a larger volume after expansion into a vacuum.",
      );
      data(
        ["Volume", "Particles"],
        [
          ["Small volume", 12],
          ["Large volume", 12],
        ],
      );
    } else if (r.view === "temperature") {
      particleBox(s, 20, 45, 260, "300 K", "gas", 12);
      particleBox(s, 330, 45, 260, "400 K", "gas", 12);
      p(
        h,
        "At higher temperature, particles have a wider range of speeds. Cooling from 400 K to 300 K decreases entropy.",
      );
      mb(h);
    } else if (r.view === "salt") {
      particleBox(s, 20, 45, 230, "NaCl(s)", "solid", 12);
      particleBox(s, 330, 45, 260, "Na⁺(aq) + Cl⁻(aq)", "gas", 12);
      p(
        h,
        "The lattice separates into hydrated ions. Water orders around each ion. For NaCl, total entropy increases.",
      );
      data(["Before", "After"], [["NaCl(s)", "Na⁺(aq) + Cl⁻(aq)"]]);
    } else {
      particleBox(
        s,
        20,
        45,
        260,
        "Reactants",
        r.gas[0] ? "gas" : "solid",
        Math.max(4, r.gas[0] * 4),
      );
      particleBox(
        s,
        330,
        45,
        260,
        "Products",
        r.gas[1] ? "gas" : "liquid",
        Math.max(4, r.gas[1] * 4),
      );
      p(
        h,
        "Particle counts are schematic. Use the stoichiometric gas amounts below.",
      );
      table(
        h,
        ["Side", "Moles of gas"],
        [
          ["Reactants", r.gas[0]],
          ["Products", r.gas[1]],
        ],
      );
      data(
        ["Side", "Moles of gas"],
        [
          ["Reactants", r.gas[0]],
          ["Products", r.gas[1]],
        ],
      );
    }
  }
  function mb(h) {
    var s = svg(
      h,
      "Maxwell-Boltzmann style curves: 300 K is taller and narrower than 400 K.",
    );
    var rows = [],
      max = 0,
      curves = [[], []];
    for (var v = 0; v <= 1200; v += 20) {
      var row = [v];
      [300, 400].forEach(function (temp, j) {
        var a = Math.sqrt((2 * 8.314 * temp) / 0.039948),
          density =
            (((4 / Math.sqrt(Math.PI)) * v * v) / Math.pow(a, 3)) *
            Math.exp((-v * v) / (a * a));
        row.push(density);
        max = Math.max(max, density);
        curves[j].push([v, density]);
      });
      rows.push(row);
    }
    line(s, 65, 255, 580, 255);
    line(s, 65, 30, 65, 255);
    M.niceScale(1200).ticks.forEach(function (v) {
      label(s, 65 + (v / 1500) * 515, 275, tick(v));
    });
    var scale = M.niceScale(max);
    scale.ticks.forEach(function (v) {
      var y = 255 - (v / scale.max) * 210;
      line(s, 60, y, 580, y, "#e2e8f0");
      label(s, 1, y + 4, tick(v));
    });
    curves.forEach(function (points, j) {
      shape(s, "polyline", {
        points: points
          .map(function (v) {
            return (
              65 + (v[0] / 1500) * 515 + "," + (255 - (v[1] / scale.max) * 210)
            );
          })
          .join(" "),
        fill: "none",
        stroke: j ? "#7e22ce" : "#1d4ed8",
        "stroke-width": 3,
        "stroke-dasharray": j ? "7 4" : "none",
      });
    });
    label(s, 210, 303, t("Speed (m/s)"));
    label(s, 70, 20, t("Relative density"));
    p(
      h,
      "300 K: solid line (blue). 400 K: dashed line (purple). Equal areas represent the same number of particles.",
    );
    data(
      ["Speed (m/s)", "300 K density", "400 K density"],
      rows,
      rows.map(function (row) {
        return [given(row[0]), f(row[1], 4), f(row[2], 4)];
      }),
    );
  }
  function entropyMode() {
    var pair = layout("entropy"),
      a = pair[0],
      b = pair[1],
      id = chosen(M.ENTROPY, "water");
    title(a, "Entropy Explorer");
    select(a, "Process", options(M.ENTROPY), id, "entropy-case", function () {
      id = this.value;
      render();
    });
    var view = add(b, "div");
    var pred = select(
        a,
        "Predict ΔS",
        [
          ["", "Choose a sign"],
          ["1", "ΔS > 0"],
          ["-1", "ΔS < 0"],
          ["0", "ΔS = 0"],
        ],
        "",
        "prediction",
        function () {},
      ),
      out = feedback(a, "entropy-feedback");
    button(
      a,
      "Check",
      function () {
        if (!pred.value) {
          say(out, "Choose a prediction first.");
          return;
        }
        say(out, "{result} {reason}", {
          result: t(
            Number(pred.value) === M.ENTROPY[id].sign
              ? "Correct."
              : "Try again.",
          ),
          reason: t(M.ENTROPY[id].why),
        });
      },
      "check-entropy",
    );
    function render() {
      view.replaceChildren();
      out.textContent = "";
      pred.value = "";
      entropyView(view, id);
    }
    render();
  }
  function dsMode() {
    var pair = layout("ds"),
      a = pair[0],
      b = pair[1],
      id = chosen(M.DS, "ch4");
    title(a, chem ? "ΔS Calculator" : "ΔS° Calculator");
    select(a, "Reaction", options(M.DS), id, "ds-rxn", function () {
      id = this.value;
      render();
    });
    var controls = add(a, "div");
    function render() {
      $("live").textContent = "";
      controls.replaceChildren();
      b.replaceChildren();
      var r = M.DS[id],
        v = M.entropy(id, chem),
        values = M.entropyTable(chem);
      p(controls, r.label);
      p(
        controls,
        "Use coefficients: sum n × S° for each side. You may enter an arithmetic sum.",
      );
      if (r.unknown) p(controls, "Given ΔS° = −146.4. Find S°(NO₂).");
      var ins = [],
        outs = [],
        unknownSolved = false;
      function recordData() {
        if (
          ins.length === 2 &&
          ins.every(function (n) {
            return n.dataset.checked === "yes";
          })
        ) {
          var rows = [
            ["ΣnS°(products)", v.products, su],
            ["ΣnS°(reactants)", v.reactants, su],
            [S, v.ds, su],
          ];
          if (unknownSolved) rows.push(["S°(NO₂)", v.unknown, "J/(mol·K)"]);
          data(
            ["Quantity", "Value", "Unit"],
            rows,
            rows.map(function (row) {
              return [row[0], f(row[1], 4), row[2]];
            }),
          );
        } else {
          var reference = [];
          ["reactants", "products"].forEach(function (side) {
            Object.keys(r[side]).forEach(function (species) {
              var entropy =
                values[species] === undefined
                  ? unknownSolved
                    ? v.unknown.toFixed(1)
                    : "?"
                  : values[species].toFixed(1);
              reference.push([
                side === "products" ? "Products" : "Reactants",
                species,
                String(r[side][species]),
                entropy,
              ]);
            });
          });
          data(["Side", "Species", "Coefficient", "S° (J/(mol·K))"], reference);
        }
      }
      ["products", "reactants"].forEach(function (side, i) {
        ins[i] = field(
          controls,
          i === 0 ? "ΣnS°(products)" : "ΣnS°(reactants)",
          "",
          "sum-" + side,
        );
        button(
          controls,
          i === 0 ? "Check products" : "Check reactants",
          function () {
            var n = M.parseSum(ins[i].value),
              ok = M.matchesNumber(n, v[side], 4);
            say(
              outs[i],
              ok ? "Correct sum." : "Try again. Include every coefficient.",
            );
            ins[i].setAttribute("aria-invalid", String(!ok));
            ins[i].dataset.checked = ok ? "yes" : "no";
            if (
              ins.every(function (n) {
                return n.dataset.checked === "yes";
              })
            ) {
              result.replaceChildren();
              p(result, "{s} = {p} − {r} = {value} {unit}", {
                s: S,
                p: f(v.products, 4),
                r: f(v.reactants, 4),
                value: f(v.ds, 4),
                unit: su,
              });
            }
            recordData();
          },
          "check-" + side,
        );
        outs[i] = feedback(controls, "feedback-" + side);
        ins[i].oninput = function () {
          ins[i].dataset.checked = "no";
          result.replaceChildren();
          recordData();
        };
      });
      var result = add(controls, "div");
      result.setAttribute("aria-live", "polite");
      if (r.unknown) {
        var unknown = field(
          controls,
          "Unknown S°(NO₂), J/(mol·K)",
          "",
          "unknown-s",
        );
        var note = feedback(controls, "unknown-feedback");
        button(
          controls,
          "Check",
          function () {
            unknownSolved = M.matchesNumber(unknown.value, v.unknown, 4);
            say(
              note,
              unknownSolved
                ? "Correct. S°(NO₂) = 240.1 J/(mol·K)."
                : "Use 2S°(NO₂) − [2S°(NO) + S°(O₂)] = −146.4.",
            );
            recordData();
          },
          "check-unknown",
        );
        unknown.oninput = function () {
          unknownSolved = false;
          recordData();
        };
      }
      title(b, "S° table");
      p(b, "Elements do not have S° = 0. This differs from ΔH°f and ΔG°f.");
      table(
        b,
        ["Species", "S° (J/(mol·K))"],
        Object.keys(values).map(function (s) {
          return [s, values[s].toFixed(1)];
        }),
        "S° table",
      );
      recordData();
    }
    render();
  }
  function dgGraph(h, dh, ds, temp, revealed) {
    title(h, "ΔG vs T graph");
    var s = svg(
      h,
      "Gibbs free energy versus temperature. Shading marks negative Gibbs free energy. See Data table.",
    );
    var vals = [M.gibbs(dh, ds, 100), M.gibbs(dh, ds, 2000), 0],
      scale = M.niceScale(Math.max(1, ...vals.map(Math.abs))),
      top = scale.max,
      x = function (v) {
        return 70 + ((v - 100) / 1900) * 510;
      },
      y = function (v) {
        return 145 - (v / top) * 110;
      };
    shape(s, "rect", {
      x: 70,
      y: 145,
      width: 510,
      height: 110,
      fill: "#dcfce7",
    });
    scale.ticks
      .concat(
        scale.ticks.slice(1).map(function (v) {
          return -v;
        }),
      )
      .forEach(function (v) {
        line(s, 70, y(v), 580, y(v), "#cbd5e1", v === 0 ? "6 4" : undefined);
        label(s, 5, y(v) + 4, tick(v));
      });
    [500, 1000, 1500, 2000].forEach(function (v) {
      line(s, x(v), 35, x(v), 255, "#e2e8f0");
      label(s, x(v) - 12, 277, tick(v));
    });
    line(s, 70, 35, 70, 255);
    shape(s, "polyline", {
      points: x(100) + "," + y(vals[0]) + " " + x(2000) + "," + y(vals[1]),
      fill: "none",
      stroke: "#1d4ed8",
      "stroke-width": 3,
    });
    shape(s, "circle", {
      cx: x(temp),
      cy: y(M.gibbs(dh, ds, temp)),
      r: 6,
      fill: "#7e22ce",
    });
    label(s, 70, 20, G + " (" + gu + ")");
    label(s, 240, 303, t("Temperature (K)"));
    p(
      h,
      "Blue solid line: Gibbs free energy. Dashed line: zero. Green shading: negative Gibbs free energy.",
    );
    var cross = M.crossover(dh, ds);
    if (revealed) {
      p(h, "Crossover temperature");
      p(
        h,
        cross
          ? "T = ΔH ÷ (ΔS ÷ 1000) = {t} K"
          : "No positive crossover temperature.",
        {
          t: cross
            ? cross >= 1000 && cross < 10000
              ? f(cross / 1000) + " × 10³"
              : f(cross)
            : "",
        },
        "zsa-fe-readout",
      );
      if (cross && (cross < 100 || cross > 2000))
        p(h, "The crossover is outside the plotted interval.");
      if (dh === 0 && ds === 0)
        p(h, "Gibbs free energy is zero at every temperature.");
    }
    var rows = [];
    for (var tt = 100; tt <= 2000; tt += 100)
      rows.push([tt, M.gibbs(dh, ds, tt)]);
    rows.push([temp, M.gibbs(dh, ds, temp)]);
    if (revealed && cross) rows.push([cross, 0]);
    rows.sort(function (a, b) {
      return a[0] - b[0];
    });
    data(
      revealed ? ["Temperature (K)", G + " (" + gu + ")"] : ["Temperature (K)"],
      rows.map(function (row) {
        return revealed ? row : [row[0]];
      }),
      rows.map(function (row) {
        return revealed
          ? [
              row[0] === cross ? f(cross) : given(row[0]),
              row[1] === 0 ? "0" : M.gibbsDisplay(dh, ds, row[0]),
            ]
          : [given(row[0])];
      }),
    );
  }
  function dgMode(override) {
    var dgOptions = Object.assign({}, M.THERMO, {
        so3: { label: "2SO₂(g) + O₂(g) → 2SO₃(g)" },
      }),
      id = override || chosen(dgOptions, "haber");
    if (id === "so3") {
      dgFormationMode(dgOptions);
      return;
    }
    var pair = layout("dg"),
      a = pair[0],
      b = pair[1],
      r = M.thermo(id, chem),
      dh = valid(params.get("dh"), -10000, 10000, r.dh),
      ds = valid(params.get("ds"), -10000, 10000, r.ds),
      temp = valid(params.get("t"), 100, 2000, 298);
    title(a, "ΔG and Temperature");
    select(a, "Reaction", options(dgOptions), id, "dg-rxn", function () {
      id = this.value;
      if (id === "so3") {
        dgMode("so3");
        return;
      }
      r = M.thermo(id, chem);
      dh = r.dh;
      ds = r.ds;
      hi.value = given(dh);
      si.value = given(ds);
      answer.value = "";
      result.textContent = "";
      render();
    });
    var hi = field(a, H + " (" + gu + ")", dh, "dh", function () {
        dh = valid(this.value, -10000, 10000, dh);
        this.value = given(dh);
        render();
      }),
      si = field(a, S + " (" + su + ")", ds, "ds", function () {
        ds = valid(this.value, -10000, 10000, ds);
        this.value = given(ds);
        render();
      });
    var l = add(a, "label", t("Temperature (K)"));
    l.htmlFor = "temperature";
    var slider = add(a, "input");
    slider.type = "range";
    slider.id = "temperature";
    slider.min = 100;
    slider.max = 2000;
    slider.step = 1;
    slider.value = temp;
    var tf = field(
      a,
      "Temperature, numeric (K)",
      temp,
      "temperature-number",
      function () {
        temp = valid(this.value, 100, 2000, temp);
        this.value = temp;
        slider.value = temp;
        render();
      },
    );
    slider.oninput = function () {
      temp = Number(this.value);
      tf.value = temp;
      render();
    };
    p(a, "25 °C = 298 K. Use kelvin in every equation.");
    if (chem) p(a, "Spontaneous does not mean fast.");
    var answer = field(
        a,
        "Your Gibbs free energy (" + gu + ")",
        "",
        "dg-answer",
      ),
      result = feedback(a, "dg-feedback");
    button(
      a,
      "Check",
      function () {
        if (!Number.isFinite(M.parseNumber(answer.value))) return;
        var ok = M.matchesNumber(
          answer.value,
          M.gibbs(dh, ds, temp),
          M.sigDigits(M.gibbsDisplay(dh, ds, temp)),
        );
        gate.check(ok);
        say(
          result,
          M.forgottenConversion(answer.value, dh, ds, temp)
            ? "Forgot to convert J to kJ. Divide ΔS by 1000 first."
            : M.matchesNumber(
                  answer.value,
                  M.gibbs(dh, ds, temp),
                  M.sigDigits(M.gibbsDisplay(dh, ds, temp)),
                )
              ? "Correct answer."
              : "Try again. Convert ΔS to kJ and keep the minus sign.",
        );
      },
      "check-dg",
    );
    var gate = solution(a, "dg", update);
    var readout = add(a, "div"),
      gridHost = add(a, "div");
    title(gridHost, "Four-case sign grid");
    p(gridHost, "Choose the temperature pattern for the current ΔH and ΔS.");
    var grid = add(gridHost, "div", undefined, "zsa-fe-grid"),
      gridOut = feedback(gridHost, "grid-feedback");
    [
      ["all", "ΔH − / ΔS +: all T"],
      ["never", "ΔH + / ΔS −: never"],
      ["low", "ΔH − / ΔS −: low T only"],
      ["high", "ΔH + / ΔS +: high T only"],
    ].forEach(function (o) {
      button(
        grid,
        o[1],
        function () {
          say(
            gridOut,
            M.signCase(dh, ds) === o[0]
              ? "Correct pattern."
              : "Try again. Compare the signs of ΔH and ΔS.",
          );
        },
        "sign-" + o[0],
      );
    });
    p(gridHost, "The four cases assume nonzero ΔH and ΔS and T > 0.");
    formation(a);
    function update() {
      readout.replaceChildren();
      work(readout, dh, ds, temp, undefined, gate.open);
      b.replaceChildren();
      dgGraph(b, dh, ds, temp, gate.open);
    }
    function render() {
      gate.reset();
      result.textContent = "";
      gridOut.textContent = "";
      content($("live"), t("T = {t} K", { t: given(temp) }));
      update();
    }
    render();
  }
  function dgFormationMode(opts) {
    var pair = layout("dg");
    title(pair[0], "ΔG and Temperature");
    select(pair[0], "Reaction", options(opts), "so3", "dg-rxn", function () {
      dgMode(this.value);
    });
    formation(pair[0]);
    title(pair[1], "Gibbs free energy of formation");
    p(
      pair[1],
      "Formation data determine Gibbs free energy at 298 K. No ΔH or ΔS is supplied for a temperature graph.",
    );
    p(pair[1], "2SO₂(g) + O₂(g) → 2SO₃(g)");
    data(
      ["Species", "ΔG°f (kJ/mol)"],
      [
        ["SO₂(g)", -300.2],
        ["SO₃(g)", -371.1],
        ["O₂(g)", 0],
      ],
    );
  }
  function formation(h) {
    title(h, "Gibbs free energy of formation");
    p(h, "2SO₂(g) + O₂(g) → 2SO₃(g)");
    p(
      h,
      "ΔG°rxn = ΣnΔG°f(products) − ΣnΔG°f(reactants). Elements in their standard states have ΔG°f = 0.",
    );
    table(
      h,
      ["Species", "ΔG°f (kJ/mol)"],
      [
        ["SO₂(g)", "−300.2"],
        ["SO₃(g)", "−371.1"],
        ["O₂(g)", "0"],
      ],
      "Formation data",
    );
    var input = field(
        h,
        "Your formation-method result (" + gu + ")",
        "",
        "formation-answer",
      ),
      out = feedback(h, "formation-feedback");
    button(
      h,
      "Check",
      function () {
        say(
          out,
          M.matchesNumber(input.value, -141.8, 4)
            ? "Correct. 2(−371.1) − [2(−300.2) + 0] = −141.8."
            : "Try again. Apply coefficients before subtracting.",
        );
      },
      "check-formation",
    );
  }
  function controlMode() {
    var pair = layout("control"),
      a = pair[0],
      b = pair[1],
      id = chosen(M.CONTROL, "sucrose"),
      cat = false,
      heat = false,
      light = false;
    title(a, "Kinetic control");
    select(a, "Case", options(M.CONTROL), id, "control-case", function () {
      id = this.value;
      cat = heat = light = false;
      render();
    });
    p(
      a,
      "Thermodynamic favorability does not determine rate. A slow reaction may be far from equilibrium.",
    );
    p(
      a,
      chem
        ? "Spontaneous does not mean fast."
        : "Thermodynamically favored does not mean fast.",
    );
    var tools = add(a, "div", undefined, "zsa-fe-actions");
    var cb = button(
        tools,
        "Add a catalyst",
        function () {
          cat = !cat;
          render();
        },
        "catalyst",
      ),
      hb = button(
        tools,
        "Raise T",
        function () {
          heat = !heat;
          render();
        },
        "heat",
      ),
      lb = button(
        tools,
        "Add light",
        function () {
          light = !light;
          render();
        },
        "light",
      );
    button(
      tools,
      "Reset",
      function () {
        cat = heat = light = false;
        render();
      },
      "reset-control",
    );
    var pred = select(
        a,
        "Classification",
        [
          ["", "Choose a classification"],
          ["kinetic", "Under kinetic control"],
          ["unfavored", "Thermodynamically unfavored"],
          ["fast", "Favored and fast"],
        ],
        "",
        "control-prediction",
        function () {},
      ),
      out = feedback(a, "control-feedback");
    button(
      a,
      "Check",
      function () {
        if (!pred.value) return;
        checked = true;
        update();
        say(
          out,
          pred.value === M.control(id, cat, heat, light).classification
            ? "Correct classification."
            : "Try again. Compare the sign of ΔG with the observed rate.",
        );
      },
      "check-control",
    );
    var checked = false;
    function render() {
      checked = false;
      pred.value = "";
      out.textContent = "";
      $("live").textContent = "";
      update();
    }
    function update() {
      b.replaceChildren();
      cb.setAttribute("aria-pressed", String(cat));
      hb.setAttribute("aria-pressed", String(heat));
      lb.setAttribute("aria-pressed", String(light));
      lb.disabled = id !== "hcl";
      var r = M.CONTROL[id],
        v = M.control(id, cat, heat, light);
      title(b, "Energy diagram");
      var s = svg(
        b,
        "Schematic energy diagram. Activation barrier and Gibbs energy are listed in the Data table.",
      );
      line(s, 55, 260, 580, 260);
      line(s, 55, 35, 55, 260);
      var end = r.dg < 0 ? 225 : 110,
        peak = cat ? 85 : 45;
      shape(s, "path", {
        d:
          "M 65 170 C 160 170 165 " +
          peak +
          " 290 " +
          peak +
          " S 420 " +
          end +
          " 570 " +
          end,
        fill: "none",
        stroke: "#1d4ed8",
        "stroke-width": 3,
      });
      line(s, 290, 170, 290, peak, "#7e22ce", "6 4");
      line(s, 530, 170, 530, end, "#15803d");
      label(s, 300, 90, "Ea");
      label(s, 535, 155, G);
      label(s, 80, 155, t("Reactants"));
      label(s, 465, end + 22, t("Products"));
      label(s, 200, 300, t("Reaction progress"));
      p(
        b,
        "Solid line: energy pathway. Dashed line: activation barrier. Diagram is schematic, not to scale.",
      );
      p(b, "{g} = {value} {unit}; Ea = {ea} kJ/mol", {
        g: G,
        value: given(r.dg),
        unit: gu,
        ea: given(v.ea),
      });
      if (checked) p(b, "{status}", { status: favored(r.dg) });
      var ml = add(b, "label", t("Observed rate"));
      ml.htmlFor = "rate-meter";
      var meter = add(b, "meter");
      meter.id = "rate-meter";
      meter.min = 0;
      meter.max = 1;
      meter.value = v.rate;
      if (checked)
        p(
          b,
          v.rate > 0.1
            ? "Observable reaction (illustrative)."
            : "No observable reaction on this timescale.",
        );
      p(
        b,
        "Catalysts lower Ea, not ΔG. Light initiates H₂ + Cl₂. Heating increases the fraction that surmounts Ea.",
      );
      p(
        b,
        "Heating here changes only the kinetic comparison. ΔG stays at its reference value; real ΔG may also change with temperature. Rates and Ea are illustrative.",
      );
      if (checked)
        content(
          $("live"),
          t("Observed rate: {rate}; {g} = {value} {unit}.", {
            rate: t(
              v.rate > 0.1
                ? "Observable reaction (illustrative)."
                : "No observable reaction on this timescale.",
            ),
            g: G,
            value: given(r.dg),
            unit: gu,
          }),
        );
      data(
        ["Quantity", "Value", "Unit"],
        [
          [G, r.dg, gu],
          ["Ea", v.ea, "kJ/mol"],
        ].concat(
          checked ? [["Relative observed rate", v.rate, "Illustrative"]] : [],
        ),
      );
    }
    render();
  }
  function kMode() {
    var pair = layout("k"),
      a = pair[0],
      b = pair[1],
      id = chosen(M.KCASES, "haber"),
      temp = 298,
      dg = M.KCASES[id].dg || M.fromK(M.KCASES[id].k, temp),
      direction = M.KCASES[id].k ? "reverse" : "forward";
    title(a, "ΔG° and K");
    select(a, "Case", options(M.KCASES), id, "k-case", function () {
      id = this.value;
      var r = M.KCASES[id];
      dg = r.k ? M.fromK(r.k, temp) : r.dg;
      direction = r.k ? "reverse" : "forward";
      dir.value = direction;
      input.value = r.k ? f(r.k, 2) : given(dg);
      slider.value = Math.max(-60, Math.min(60, dg));
      render();
    });
    var dir = select(
      a,
      "Calculation",
      [
        ["forward", "ΔG to K"],
        ["reverse", "K to ΔG"],
      ],
      direction,
      "k-direction",
      function () {
        direction = this.value;
        input.value =
          direction === "forward" ? given(dg) : f(M.toK(dg, temp).k, 4);
        input.onchange();
      },
    );
    var input = field(
      a,
      "Given value",
      direction === "reverse" ? f(M.KCASES[id].k, 2) : dg,
      "k-given",
      function () {
        var n = M.parseNumber(this.value);
        if (
          Number.isFinite(n) &&
          (direction === "forward" ? Math.abs(n) <= 10000 : n > 0 && n <= 1e100)
        ) {
          dg = direction === "forward" ? n : M.fromK(n, temp);
          slider.value = Math.max(-60, Math.min(60, dg));
          render();
        } else {
          this.setAttribute("aria-invalid", "true");
          say(out, "Enter a valid value. K must be positive.");
        }
      },
    );
    field(a, "Temperature (K)", temp, "k-temperature", function () {
      temp = valid(this.value, 100, 2000, temp);
      this.value = temp;
      input.onchange();
    });
    var sl = add(a, "label", t("ΔG slider (−60 to +60 kJ)"));
    sl.htmlFor = "k-slider";
    var slider = add(a, "input");
    slider.id = "k-slider";
    slider.type = "range";
    slider.min = -60;
    slider.max = 60;
    slider.step = 0.1;
    slider.value = Math.max(-60, Math.min(60, dg));
    slider.oninput = function () {
      dg = Number(this.value);
      direction = "forward";
      dir.value = direction;
      input.value = given(dg);
      render();
    };
    var ans = field(a, "Your result", "", "k-answer"),
      out = feedback(a, "k-feedback");
    button(
      a,
      "Check",
      function () {
        if (!Number.isFinite(M.parseNumber(ans.value))) return;
        var ok = M.matchesNumber(
          ans.value,
          direction === "forward" ? M.toK(dg, temp).k : dg,
          2,
        );
        gate.check(ok);
        say(
          out,
          ok
            ? "Correct answer."
            : "Try again. Use kelvin and convert ΔG from kJ to J.",
        );
      },
      "check-k",
    );
    var gate = solution(a, "k", update);
    title(a, "ΔH, ΔS → ΔG → K");
    var chain = select(
      a,
      "Chain reaction",
      options(M.THERMO),
      "haber",
      "chain-rxn",
      function () {
        chainGate.reset();
        chainG.value = chainK.value = "";
        chainOut.textContent = "";
        $("live").textContent = "";
        update();
      },
    );
    var chainGiven = add(a, "div"),
      chainG = field(a, "Chain " + G + " (" + gu + ")", "", "chain-dg-answer"),
      chainK = field(a, "Chain K", "", "chain-k-answer"),
      chainOut = feedback(a, "chain-feedback");
    button(
      a,
      "Check chain",
      function () {
        if (
          !Number.isFinite(M.parseNumber(chainG.value)) ||
          !Number.isFinite(M.parseNumber(chainK.value))
        )
          return;
        var r = M.thermo(chain.value, chem),
          g = M.gibbs(r.dh, r.ds, temp),
          ok =
            M.matchesNumber(
              chainG.value,
              g,
              M.sigDigits(M.gibbsDisplay(r.dh, r.ds, temp)),
            ) && M.matchesNumber(chainK.value, M.toK(g, temp).k, 2);
        chainGate.check(ok);
        say(
          chainOut,
          ok
            ? "Correct answer."
            : "Try again. Use kelvin and convert ΔG from kJ to J.",
        );
      },
      "check-chain",
    );
    var chainGate = solution(a, "chain", update);
    function render() {
      gate.reset();
      chainGate.reset();
      ans.value = chainG.value = chainK.value = "";
      out.textContent = chainOut.textContent = "";
      $("live").textContent = "";
      input.removeAttribute("aria-invalid");
      update();
    }
    function update() {
      b.replaceChildren();
      var v = M.toK(dg, temp),
        r = M.thermo(chain.value, chem),
        g = M.gibbs(r.dh, r.ds, temp),
        chainValue = M.toK(g, temp).k;
      sl.hidden = slider.hidden = direction === "reverse" && !gate.open;
      chainGiven.replaceChildren();
      p(chainGiven, "{h} = {dh} {hu}; {s} = {ds} {su}", {
        h: H,
        dh: given(r.dh),
        hu: gu,
        s: S,
        ds: given(r.ds),
        su: su,
      });
      title(b, "ΔG° and K");
      p(
        b,
        "R = 8.314 J/(mol·K). Keep the exponent unrounded. Rounding it early changes K.",
      );
      if (gate.open) {
        if (direction === "forward")
          p(b, "Gibbs conversion: {value} kJ × 1000 = {j} J", {
            value: given(dg),
            j: f(dg * 1000, M.sigDigits(dg)),
          });
        if (direction === "reverse")
          p(b, "{g} = −RT ln K = −({r})({t}) ln({k}) ÷ 1000 = {value} {unit}", {
            g: G,
            r: "8.314",
            t: temp,
            k: f(v.k, 2),
            value: f(dg, 2),
            unit: gu,
          });
        else
          p(
            b,
            "K = exp[−({j}) ÷ (8.314 × {t})] = exp({exponent}) = {k}",
            {
              j: f(dg * 1000, 5),
              t: temp,
              exponent: f(v.exponent, 5),
              k: f(v.k, 2),
            },
            "zsa-fe-readout",
          );
        p(
          b,
          Math.abs(v.log10) < 0.01
            ? "K ≈ 1"
            : v.k > 1
              ? "K > 1: products favored"
              : "K < 1: reactants favored",
        );
      }
      var s = svg(b, "K on a logarithmic scale. See Data table.");
      line(s, 55, 140, 570, 140);
      line(s, 312.5, 110, 312.5, 165, "#64748b", "5 4");
      for (var i = -12; i <= 12; i += 4) {
        var xx = 55 + ((i + 12) / 24) * 515;
        line(s, xx, 130, xx, 150);
        label(s, xx - 12, 175, "10" + M.superscript(i));
      }
      if (gate.open) {
        var pos = 55 + ((Math.max(-12, Math.min(12, v.log10)) + 12) / 24) * 515;
        shape(s, "circle", { cx: pos, cy: 140, r: 9, fill: "#1d4ed8" });
        p(
          b,
          "Solid line: logarithmic K scale. Dashed line: K = 1. Blue marker: current K.",
        );
        p(
          b,
          "The marker is clamped at the graph ends. The numerical K is not clamped.",
        );
      }
      label(s, 220, 225, t("K (log scale)"));
      if (chainGate.open) {
        work(b, r.dh, r.ds, temp, undefined, true);
        p(b, "Chain K = {k}", { k: f(chainValue, 2) });
        if (
          chain.value === id &&
          temp === 298 &&
          M.KCASES[id].dg === dg &&
          Math.abs(g - dg) > 1e-9
        )
          p(b, "The chain ΔG° differs from the given ΔG° because of rounding.");
      }
      var rows = [
          [
            direction === "forward" ? G : "K",
            direction === "forward" ? dg : M.parseNumber(input.value),
            direction === "forward" ? gu : "",
          ],
          ["Temperature (K)", temp, "K"],
        ],
        displayed = rows.map(function (row) {
          return [row[0], given(row[1]), row[2]];
        });
      if (gate.open) {
        if (direction === "reverse") {
          rows.push([G, dg, gu]);
          displayed.push([G, f(dg, 2), gu]);
        }
        rows.push(
          ["Exponent", v.exponent, ""],
          ["K", v.k, ""],
          ["log₁₀ K", v.log10, ""],
        );
        displayed.push(
          ["Exponent", f(v.exponent, 5), ""],
          ["K", f(v.k, 2), ""],
          ["log₁₀ K", f(v.log10, 4), ""],
        );
      }
      if (chainGate.open) {
        rows.push(["Chain " + G, g, gu], ["Chain K", chainValue, ""]);
        displayed.push(
          ["Chain " + G, M.gibbsDisplay(r.dh, r.ds, temp), gu],
          ["Chain K", f(chainValue, 2), ""],
        );
      }
      data(["Quantity", "Value", "Unit"], rows, displayed);
    }
    render();
  }
  function equation(net) {
    function side(sign) {
      return Object.keys(net)
        .filter(function (s) {
          return Math.sign(net[s]) === sign;
        })
        .map(function (s) {
          return (Math.abs(net[s]) === 1 ? "" : Math.abs(net[s])) + s;
        })
        .join(" + ");
    }
    return side(-1) + " → " + side(1);
  }
  function hydration(h) {
    title(h, "Ion-dipole attractions");
    var s = svg(
      h,
      "Water oxygen ends face cations. Hydrogen ends face anions. Hydration orders nearby water.",
    );
    [170, 450].forEach(function (x, j) {
      shape(s, "circle", {
        cx: x,
        cy: 145,
        r: 26,
        fill: j ? "#7e22ce" : "#1d4ed8",
      });
      shape(
        s,
        "text",
        { x: x - 7, y: 151, class: "zsa-fe-ionmark" },
        j ? "−" : "+",
      );
      for (var i = 0; i < 6; i++) {
        var angle = (i * Math.PI) / 3,
          ox = x + Math.cos(angle) * (j ? 85 : 65),
          oy = 145 + Math.sin(angle) * (j ? 85 : 65),
          hx = x + Math.cos(angle) * (j ? 65 : 85),
          hy = 145 + Math.sin(angle) * (j ? 65 : 85);
        // Two hydrogen atoms form a bent water molecule. Its oxygen end
        // faces the cation; its hydrogen ends face the anion.
        [-0.912, 0.912].forEach(function (offset) {
          var direction = angle + (j ? Math.PI : 0) + offset,
            hydrogenX = ox + Math.cos(direction) * 20,
            hydrogenY = oy + Math.sin(direction) * 20;
          line(s, ox, oy, hydrogenX, hydrogenY, "#64748b");
          shape(s, "circle", {
            cx: hydrogenX,
            cy: hydrogenY,
            r: 5,
            fill: "#64748b",
          });
        });
        shape(s, "circle", { cx: ox, cy: oy, r: 9, fill: "#b91c1c" });
        line(
          s,
          x + Math.cos(angle) * 30,
          145 + Math.sin(angle) * 30,
          j ? hx : ox,
          j ? hy : oy,
          "#15803d",
          "4 4",
        );
      }
      label(s, x - 45, 285, t(j ? "Anion" : "Cation"));
    });
    p(
      h,
      "Red oxygen (δ−) faces the cation. Gray hydrogen (δ+) faces the anion. Dashed lines show ion-dipole attractions.",
    );
    p(h, "Each water molecule has one red oxygen and two gray hydrogens.");
    p(
      h,
      "Ion dispersal raises entropy; ordering of water can lower it. The total ΔS determines the result.",
    );
  }
  function coupledMode() {
    var pair = layout("coupled"),
      a = pair[0],
      b = pair[1],
      all = Object.assign({}, M.SALTS, {
        iron: { label: "Iron extraction" },
        mercury: { label: "Mercury extraction" },
      }),
      id = chosen(all, "nh4no3");
    title(a, "Dissolving and Coupled Reactions");
    select(a, "Case", options(all), id, "coupled-case", function () {
      id = this.value;
      render();
    });
    var controls = add(a, "div");
    function render() {
      $("live").textContent = "";
      controls.replaceChildren();
      b.replaceChildren();
      if (M.SALTS[id]) {
        var r = M.SALTS[id];
        p(controls, r.label);
        var pred = select(
            controls,
            "Driving factor",
            [
              ["", "Choose a classification"],
              ["entropy", "Entropy-driven"],
              ["enthalpy", "Enthalpy-driven"],
              ["unfavored", "Not favored"],
            ],
            "",
            "driving",
            function () {},
          ),
          out = feedback(controls, "driving-feedback");
        button(
          controls,
          "Check",
          function () {
            if (!pred.value) return;
            worked.replaceChildren();
            work(worked, r.dh, r.ds, 298, 1, true);
            p(worked, "T{s} = {value} {unit}", {
              s: S,
              value: f((298 * r.ds) / 1000, 3),
              unit: gu,
            });
            saltData(true);
            say(
              out,
              pred.value === M.driving(r.dh, r.ds, 298)
                ? "Correct classification."
                : "Try again. Compare ΔH and −TΔS, then the sign of ΔG.",
            );
          },
          "check-driving",
        );
        p(controls, "{h} = {dh} {hu}; {s} = {ds} {su}", {
          h: H,
          dh: given(r.dh),
          hu: gu,
          s: S,
          ds: given(r.ds),
          su: su,
        });
        var worked = add(controls, "div");
        hydration(b);
        function saltData(checked) {
          var rows = [
            [H, r.dh, gu],
            [S, r.ds, su],
          ];
          var displayed = [
            [H, given(r.dh), gu],
            [S, given(r.ds), su],
          ];
          if (checked) {
            rows.push([G, M.gibbs(r.dh, r.ds, 298), gu]);
            displayed.push([G, M.gibbsDisplay(r.dh, r.ds, 298, 1), gu]);
          }
          data(["Quantity", "Value", "Unit"], rows, displayed);
        }
        saltData(false);
      } else {
        var r = M.COUPLING[id],
          net = M.combine(id, true);
        p(controls, "Unfavored step: {equation}; {g} = +{value} {unit}", {
          equation: equation(r.first),
          g: G,
          value: given(r.dg[0]),
          unit: gu,
        });
        p(controls, "Favored partner: {equation}; {g} = {value} {unit}", {
          equation: equation(r.second),
          g: G,
          value: given(r.dg[1]),
          unit: gu,
        });
        var second = select(
          controls,
          "Favored partner",
          [
            ["", "No partner"],
            ["add", equation(r.second)],
          ],
          "",
          "coupling-partner",
          function () {
            output.replaceChildren();
          },
        );
        var ans = field(
            controls,
            "Combined Gibbs free energy (" + gu + ")",
            "",
            "coupling-answer",
          ),
          out = feedback(controls, "coupling-feedback"),
          output = add(b, "div");
        title(b, "Coupled reactions");
        p(
          b,
          "Choose a partner with the keyboard or pointer. Opposite coefficients cancel the common intermediate.",
        );
        button(
          controls,
          "Check",
          function () {
            if (!second.value) {
              say(out, "Choose a favored partner to cancel the intermediate.");
              return;
            }
            if (!Number.isFinite(M.parseNumber(ans.value))) return;
            output.replaceChildren();
            var v = M.combine(id, second.value === "add");
            p(output, "Common intermediate");
            p(output, v.common.join(", ") || "No common intermediate");
            p(output, equation(v.net), {}, "zsa-fe-formula");
            p(output, "{g} = {a} + ({b}) = {value} {unit}", {
              g: G,
              a: given(r.dg[0]),
              b: second.value ? given(r.dg[1]) : "0",
              value: v.dg.toFixed(1).replace("-", "−"),
              unit: gu,
            });
            p(output, "{status}", { status: favored(v.dg) });
            say(
              out,
              !second.value
                ? "Choose a favored partner to cancel the intermediate."
                : M.matchesNumber(ans.value, v.dg, M.sigDigits(v.dg.toFixed(1)))
                  ? "Correct. The coupled reaction is thermodynamically favored."
                  : "Try again. Add the Gibbs energies with their signs.",
            );
            data(
              ["Species", "Net coefficient"],
              Object.keys(v.net)
                .map(function (s) {
                  return [s, v.net[s]];
                })
                .concat([
                  [G, v.dg.toFixed(1).replace("-", "−")],
                  ["Common intermediate", v.common.join(", ")],
                ]),
            );
          },
          "check-coupling",
        );
        table(
          b,
          ["Step", G + " (" + gu + ")"],
          [
            ["Unfavored reaction", "+" + given(r.dg[0])],
            ["Favored partner", given(r.dg[1])],
          ],
          "Coupling steps",
        );
        data(
          ["Step", G + " (" + gu + ")"],
          [
            ["Unfavored reaction", "+" + given(r.dg[0])],
            ["Favored partner", given(r.dg[1])],
          ],
        );
      }
    }
    render();
  }
  function activate(value, focus) {
    mode = value;
    modes.forEach(function (m) {
      var active = m === mode;
      $("tab-" + m).setAttribute("aria-selected", String(active));
      $("tab-" + m).tabIndex = active ? 0 : -1;
      $("panel-" + m).hidden = !active;
    });
    ({
      entropy: entropyMode,
      ds: dsMode,
      dg: dgMode,
      control: controlMode,
      k: kMode,
      coupled: coupledMode,
    })[mode]();
    if (focus) $("tab-" + mode).focus();
  }
  modes.forEach(function (m, i) {
    $("tab-" + m).onclick = function () {
      activate(m);
    };
    $("tab-" + m).onkeydown = function (e) {
      var next =
        e.key === "ArrowRight"
          ? (i + 1) % 6
          : e.key === "ArrowLeft"
            ? (i + 5) % 6
            : e.key === "Home"
              ? 0
              : e.key === "End"
                ? 5
                : null;
      if (next !== null) {
        e.preventDefault();
        activate(modes[next], true);
      }
    };
  });
  var source = M.safeLesson(params.get("from"), I.lang),
    fallback =
      "https://zornscience.org/science/" +
      (chem ? "chemistry/" : "ap-chemistry/");
  $("back").href = source || M.safeLesson(fallback, I.lang);
  if (source) {
    params.set("from", source);
    history.replaceState(null, "", "?" + params.toString());
  }
  root.querySelector("[data-zsa-header-brand]").href = M.safeLesson(
    "https://zornscience.org/",
    I.lang,
  );
  function csv() {
    return [exportHeads]
      .concat(exportRows)
      .map(function (row) {
        return row
          .map(function (value) {
            return (
              '"' +
              String(
                typeof value === "number" ? f(value, 15) : t(String(value)),
              ).replace(/"/g, '""') +
              '"'
            );
          })
          .join(",");
      })
      .join("\r\n");
  }
  $("copy-data").onclick = function () {
    var content = [exportHeads]
      .concat(displayRows)
      .map(function (row) {
        return row
          .map(function (v) {
            return typeof v === "number" ? given(v) : t(String(v));
          })
          .join("\t");
      })
      .join("\n");
    function fallback() {
      var n = $("copy-fallback");
      n.hidden = false;
      n.value = content;
      n.focus();
      n.select();
      $("export-status").textContent = t(
        "Data selected. Copy with Ctrl+C or Command+C.",
      );
    }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(content).then(function () {
        $("export-status").textContent = t("Data copied.");
      }, fallback);
    else fallback();
  };
  $("download-data").onclick = function () {
    var url = URL.createObjectURL(
        new Blob([csv()], { type: "text/csv;charset=utf-8" }),
      ),
      a = el("a");
    a.href = url;
    a.download = "zornscience-free-energy-data.csv";
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    $("export-status").textContent = t("CSV downloaded.");
  };
  if (chem) {
    $("tab-k").textContent = t("ΔG° and K");
  }
  activate(mode);
})();
