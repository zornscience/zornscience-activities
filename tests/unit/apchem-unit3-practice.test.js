"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../../apchem-unit3-practice/data.js");
const M = require("../../shared/zsa-practice-model.js");
const byId = id => bank.questions.find(q => q.id === id);

test("all 27 numeric answers match independently worked calculations and tolerance boundaries", () => {
  const expected = {
    "3.1-6":0.250 * 40.7,
    "3.2-6":0.125 * 6.022e23,
    "3.3-5":6.40 / 4.00, "3.3-6":8 * 3,
    "3.4-1":0.500 * 0.08206 * 300 / 1.25,
    "3.4-2":0.200 * 0.08206 * 310 / 2.00,
    "3.4-3":0.300 / 0.500, "3.4-4":2.40 * 0.250,
    "3.5-5":3 * 8.314 * 300 / 2, "3.5-6":Math.sqrt(2),
    "3.6-6":2.20 / 2.00,
    "3.7-1":0.150 / 0.600, "3.7-2":5.844 / 58.44 / 0.500, "3.7-3":0.120 * 0.0250 / 0.1000,
    "3.8-5":4 + 12, "3.8-6":0.150 * 2,
    "3.9-1":2.40 / 6.00, "3.9-2":0.100 * 0.200 * 58.44,
    "3.10-6":75.0 * 20.0 / 100,
    "3.11-6":3.00e8 / (10.0 * 1e-6),
    "3.12-1":6.626e-34 * 5.00e14, "3.12-2":3.00e8 / 6.00e14,
    "3.12-3":6.626e-34 * (3.00e8 / (400 * 1e-9)) * 6.022e23 * 1e-3,
    "3.12-4":1.33e-19 / 6.626e-34,
    "3.13-1":150 * 1.00 * 0.00200, "3.13-2":0.450 / 2250 / 1.00,
    "3.13-3":(0.380 - 0.020) / 1200
  };
  assert.equal(Object.keys(expected).length, 27);
  assert.equal(bank.questions.filter(q => q.type === "numeric").length, 27);
  for (const [id, value] of Object.entries(expected)) {
    const q = byId(id);
    assert.ok(Math.abs(q.value - value) <= Math.abs(value) * 1e-12, id);
    assert.ok(bank.units.some(u => u.id === q.unit), id + " dropdown");
    const checked = M.inspect(q, q.display, q.unit);
    assert.ok(checked.correct && checked.precisionOK, id + " rounded answer");
    assert.ok(M.inspect(q, String(value), q.unit).correct, id + " unrounded");
    assert.equal(M.inspect(q, q.display, "wrong-unit").correct, false, id);
    assert.equal(M.inspect(q, String(value * 1.02 + 1), q.unit).correct, false, id);
    if (q.precision.exact) assert.equal(M.inspect(q, String(value + 1e-7), q.unit).correct, false, id + " exact");
    else {
      assert.ok(M.inspect(q, String(value + q.tolerance * 0.95), q.unit).correct, id + " inside");
      assert.equal(M.inspect(q, String(value + q.tolerance * 1.05), q.unit).correct, false, id + " outside");
      assert.equal(M.inspect(q, "0", q.unit).correct, false, id + " zero rejected, including photon energy");
    }
  }
});

test("all 51 multiple-choice keys match the independent science audit", () => {
  const expected = {
    "3.1-1":"Its larger electron distribution gives stronger London dispersion forces.",
    "3.1-2":"HF has H directly bonded to F and neighboring F lone pairs.",
    "3.1-3":"London dispersion and dipole-dipole attractions", "3.1-4":"Ion-dipole attraction",
    "3.1-5":"CH<sub>4</sub> < NH<sub>3</sub> < H<sub>2</sub>O",
    "3.2-1":"Molecular solid", "3.2-2":"Very hard, high melting temperature, poor electrical conduction",
    "3.2-3":"It conducts along sheets and layers can slide easily.",
    "3.2-4":"Its ions can move in the melt but are fixed in the solid lattice.",
    "3.2-5":"Metal cores stay attracted to delocalized electrons as layers shift.",
    "3.3-1":"Liquid", "3.3-2":"A gas has much more empty space between particles.",
    "3.3-3":"Potential energy increases as attractions are overcome.",
    "3.3-4":"Intact H<sub>2</sub>O molecules become much farther apart.",
    "3.4-5":"736.2 mmHg", "3.4-6":"It doubles.",
    "3.5-1":"They are equal.",
    "3.5-2":"The peak becomes lower and broader, typical speed increases, and total area stays equal.",
    "3.5-3":"He, because its atoms have less mass",
    "3.5-4":"Elastic collisions, negligible particle volume, and negligible interparticle attractions",
    "3.6-1":"High pressure and low temperature",
    "3.6-2":"Lower, because attractions reduce momentum transfer to the walls",
    "3.6-3":"Pressure above the ideal value because less volume is available for motion",
    "3.6-4":"NH<sub>3</sub>, because it has stronger intermolecular attractions",
    "3.6-5":"Lower pressure and raise temperature",
    "3.7-4":"Homogeneous mixture",
    "3.7-5":"Dissolve the solute, then add solvent to the final volume mark.",
    "3.7-6":"Moles of solute",
    "3.8-1":"3 separate Na<sup>+</sup> ions and 3 separate Cl<sup>−</sup> ions dispersed throughout",
    "3.8-2":"2 Ca<sup>2+</sup> and 4 Cl<sup>−</sup>",
    "3.8-3":"The partially positive H ends face the ion.",
    "3.8-4":"Intact neutral sucrose molecules dispersed among water molecules",
    "3.9-3":"It decreases.", "3.9-4":"Silica is the stationary phase; solvent is the mobile phase.",
    "3.9-5":"The more volatile component with the lower boiling point",
    "3.9-6":"Sand, while dissolved salt passes through with water",
    "3.10-1":"Ethanol's hydroxyl group can hydrogen bond with water.",
    "3.10-2":"Oil-water attractions do not adequately replace water's hydrogen bonding network.",
    "3.10-3":"Ion-dipole hydration competes with lattice and solvent attractions; the overall balance matters.",
    "3.10-4":"It increases.", "3.10-5":"Equilibrium gas solubility decreases.",
    "3.11-1":"Rotational", "3.11-2":"Molecular vibration", "3.11-3":"Electronic energy levels",
    "3.11-4":"Ultraviolet > visible > infrared > microwave",
    "3.11-5":"The photon matches an allowed vibrational energy gap.",
    "3.12-5":"It doubles.", "3.12-6":"Equal, because E = hν uses a universal constant",
    "3.13-4":"Absorbance doubles.",
    "3.13-5":"The same solvent without solute in a matching clean cell",
    "3.13-6":"Wavelength and cell path length"
  };
  assert.equal(Object.keys(expected).length, 51);
  assert.equal(bank.questions.filter(q => q.type === "mc").length, 51);
  for (const [id, answer] of Object.entries(expected)) {
    const q = byId(id);
    assert.equal(q.choices[q.answer].text.en, answer, id);
    assert.equal(q.choices.filter(c => c.text.en === answer).length, 1, id);
  }
});

test("numeric checking preserves units, precision, malformed-input handling and tiny energy accuracy", () => {
  const q = byId("3.12-1");
  assert.equal(M.inspect(q, "3.31e-19 J", "J").correct, true);
  assert.equal(M.inspect(q, "3.3100e-19", "J").precisionOK, false);
  assert.equal(M.inspect(q, "3.31e-19 kJ", "J").unitOK, false);
  assert.equal(M.inspect(q, "3.31e-19 J", "kJ").correct, false);
  assert.equal(M.inspect(q, "3.31e-19", "").valid, false);
  assert.equal(M.inspect(q, "0", "J").correct, false);
  assert.equal(M.inspect(q, "3.31e-18", "J").correct, false);
  assert.equal(M.inspect(byId("3.7-1"), "0.250 mol/L", "M").correct, true);
  assert.equal(M.inspect(byId("3.7-1"), "0.25", "M").precisionOK, false);
  assert.equal(M.inspect(byId("3.3-6"), "24.0000001", "count").correct, false);
  assert.equal(M.inspect(byId("3.3-6"), "24 cantidad", "count").correct, true);
  assert.equal(M.inspect(byId("3.13-1"), "0.300", "ratio").correct, true);
  assert.equal(M.inspect(byId("3.13-1"), "0.300", "M").correct, false);
  for (const raw of ["", " ", "11,0", "11.0garbage", "Infinity", "NaN", "1e999", "11+0", "0xB", "<script>"]) assert.equal(M.parse(raw), null, raw);
});

test("topic titles, Spanish AP glossary, reference values and model curve are consistent", () => {
  const fs = require("node:fs"), path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "../../apchem-unit3-practice/index.html"), "utf8");
  const old = fs.readFileSync(path.join(__dirname, "../../apchem-unit1-practice/index.html"), "utf8");
  const masses = /<dl class="zsa-u\d-masses">(.*?)<\/dl>/;
  assert.equal(html.match(masses)[1], old.match(masses)[1]);
  for (const constant of ["0.08206 L·atm/(mol·K)", "8.314 J/(mol·K)", "1 atm = 760 mmHg = 101.3 kPa", "6.626 × 10<sup>−34</sup> J·s", "3.00 × 10<sup>8</sup> m/s", "6.022 × 10<sup>23</sup> mol<sup>−1</sup>"]) assert.ok(html.includes(constant), constant);
  assert.match(html, /temperatures in kelvin/);
  const titles = [
    ["Intermolecular and Interparticle Forces", "Fuerzas intermoleculares e interpartículas"],
    ["Properties of Solids", "Propiedades de los sólidos"], ["Solids, Liquids, and Gases", "Sólidos, líquidos y gases"],
    ["Ideal Gas Law", "Ley de los gases ideales"], ["Kinetic Molecular Theory", "Teoría cinético-molecular"],
    ["Deviation from Ideal Gas Law", "Desviación de la ley de los gases ideales"], ["Solutions and Mixtures", "Soluciones y mezclas"],
    ["Representations of Solutions", "Representaciones de soluciones"], ["Separation of Solutions and Mixtures", "Separación de soluciones y mezclas"],
    ["Solubility", "Solubilidad"], ["Spectroscopy and the Electromagnetic Spectrum", "Espectroscopía y el espectro electromagnético"],
    ["Properties of Photons", "Propiedades de los fotones"], ["Beer-Lambert Law", "Ley de Beer-Lambert"]
  ];
  assert.deepEqual(bank.topics.map(t => t.title), titles.map((t, i) => ({en:"3." + (i + 1) + " " + t[0], es:"3." + (i + 1) + " " + t[1]})));
  const spanish = JSON.stringify(bank.questions.map(q => ({prompt:q.prompt.es, explanation:q.explanation.es, choices:q.choices?.map(c => c.text.es)})));
  for (const term of ["fuerzas de dispersión de London (FDL)", "puente de hidrógeno", "presión parcial", "fracción molar", "teoría cinético-molecular", "distribución de Maxwell-Boltzmann", "rapidez", "molaridad", "miscible", "inmiscible", "cromatografía", "fase estacionaria", "fase móvil", "factor de retención", "longitud de onda", "frecuencia", "fotón", "constante de Planck", "absorbancia", "longitud de trayectoria", "absortividad molar", "curva de calibración", "celda", "kelvin"]) assert.ok(spanish.includes(term), term);
  assert.doesNotMatch(spanish, /enlace de hidrógeno|velocidad de partículas|Kelvin/);
  assert.match(html, /role="img" aria-labelledby="zsa-u3-curve-title" aria-describedby="zsa-u3-curve-desc"/);
  for (const match of html.matchAll(/<(?:title|desc) id="zsa-u3-curve-[^"]+">([^<]+)</g)) assert.ok(bank.copy.es[match[1]], match[1]);
  assert.deepEqual(bank.questions.filter(q => q.curve).map(q => q.id), ["3.5-2"]);
  // The two schematic densities preserve area and show the expected peak shift.
  const curves = ["cool-curve", "bond-curve"].map(cls => {
    const d = html.match(new RegExp('class="zsa-u3-' + cls + '" d="([^"]+)"'))[1];
    const points = [...d.matchAll(/([\d.]+) ([\d.]+)/g)].map(m => [+m[1], 230 - +m[2]]);
    return {area:points.slice(1).reduce((a, p, i) => a + (p[0] - points[i][0]) * (p[1] + points[i][1]) / 2, 0), peak:points.reduce((a, p) => p[1] > a[1] ? p : a)};
  });
  assert.ok(Math.abs(curves[0].area - curves[1].area) < 0.01);
  assert.ok(curves[1].peak[0] > curves[0].peak[0] && curves[1].peak[1] < curves[0].peak[1]);
});

test("78 original bilingual questions cover all thirteen CED topics with mixed response types", () => {
  assert.equal(bank.questions.length, 78);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 78);
  assert.equal(new Set(bank.questions.map(q => q.prompt.en)).size, 78);
  assert.equal(new Set(bank.questions.map(q => q.prompt.es)).size, 78);
  assert.deepEqual(bank.topics.map(t => t.id), ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13"]);
  bank.topics.forEach(topic => {
    const questions = bank.questions.filter(q => q.topic === topic.id);
    assert.equal(questions.length, 6, topic.id);
    assert.ok(questions.some(q => q.type === "numeric"), topic.id);
    assert.ok(questions.some(q => q.type === "mc"), topic.id);
  });
});

test("every distractor has specific feedback and bilingual chemistry and numbers match", () => {
  function parity(pair, id) {
    assert.ok(pair.en && pair.es, id);
    for (const text of [pair.en, pair.es]) {
      assert.doesNotMatch(text, /[\u2013\u2014]|\b(?:H2O|CO2|Ca2\+|Mg2\+|Na\+|Cl-)\b/, id);
      assert.equal((text.match(/<sub>/g) || []).length, (text.match(/<\/sub>/g) || []).length, id);
      assert.equal((text.match(/<sup>/g) || []).length, (text.match(/<\/sup>/g) || []).length, id);
    }
    assert.deepEqual(pair.en.match(/<su[bp]>.*?<\/su[bp]>/g), pair.es.match(/<su[bp]>.*?<\/su[bp]>/g), id + " notation");
    assert.deepEqual(pair.en.match(/\d+(?:\.\d+)?/g), pair.es.match(/\d+(?:\.\d+)?/g), id + " numbers");
  }
  bank.questions.forEach(q => {
    parity(q.prompt, q.id); parity(q.explanation, q.id);
    if (q.type !== "mc") return;
    assert.equal(q.choices.length, 4, q.id);
    for (const lang of ["en", "es"]) assert.equal(new Set(q.choices.map(c => c.text[lang])).size, 4, q.id);
    q.choices.forEach((choice, i) => {
      parity(choice.text, q.id);
      if (i !== q.answer) parity(choice.why, q.id);
    });
    for (const lang of ["en", "es"]) assert.equal(new Set(q.choices.filter((_, i) => i !== q.answer).map(c => c.why[lang])).size, 3, q.id);
  });
});

test("shuffles preserve complete sets, answer identity, and the original bank", () => {
  const before = JSON.stringify(bank);
  const first = M.makeSet(bank.questions, "mixed", () => 0.1);
  const second = M.makeSet(bank.questions, "mixed", () => 0.8);
  assert.equal(first.length, 78);
  assert.equal(new Set(first.map(item => item.question.id)).size, 78);
  assert.notDeepEqual(first.map(item => item.question.id), second.map(item => item.question.id));
  first.forEach(item => {
    if (item.question.type !== "mc") return;
    assert.deepEqual(item.order.slice().sort(), [0, 1, 2, 3]);
    assert.notDeepEqual(item.order, second.find(x => x.question.id === item.question.id).order);
  });
  for (const topic of bank.topics) assert.equal(M.makeSet(bank.questions, topic.id).length, 6);
  assert.equal(JSON.stringify(bank), before);
});

test("backlinks validate exact origin and select the lesson language", () => {
  const lesson = "https://zornscience.org/science/ap-chemistry/unit-3/?section=2#practice";
  assert.equal(M.lessonLink(lesson, "es"), "https://zornscience.org/es/science/ap-chemistry/unit-3/?section=2#practice");
  assert.equal(M.lessonLink("https://zornscience.org/es/science/ap-chemistry/", "es"), "https://zornscience.org/es/science/ap-chemistry/");
  assert.equal(M.lessonLink("https://zornscience.org/es/science/ap-chemistry/", "en"), "https://zornscience.org/science/ap-chemistry/");
  for (const raw of [null, "javascript:alert(1)", "//evil.example", "https://zornscience.org.evil.example/", "http://zornscience.org/", "https://user:pass@zornscience.org/", "https://zornscience.org:444/"]) {
    assert.equal(M.lessonLink(raw, "en"), "https://zornscience.org/science/ap-chemistry/", raw);
    assert.equal(M.lessonLink(raw, "es"), "https://zornscience.org/es/science/ap-chemistry/", raw);
  }
});

