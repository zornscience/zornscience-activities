"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../../apchem-unit4-practice/data.js");
const M = require("../../shared/zsa-practice-model.js");
const byId = id => bank.questions.find(q => q.id === id);

test("54 original bilingual questions cover all nine CED topics with mixed response types", () => {
  assert.equal(bank.questions.length, 54);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 54);
  assert.equal(new Set(bank.questions.map(q => q.prompt.en)).size, 54);
  assert.equal(new Set(bank.questions.map(q => q.prompt.es)).size, 54);
  assert.deepEqual(bank.topics.map(t => t.id), Array.from({length:9}, (_, i) => "4." + (i + 1)));
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

test("18 numeric keys agree with independently solved quantities, units and precision", () => {
  const expected = {
    "4.1-6":0.300/2, "4.2-6":2+2, "4.3-5":Math.min(3,6/3)*2, "4.3-6":5-2*2,
    "4.4-6":2*2,
    "4.5-2":4.862/24.31*(24.31+16.00),
    "4.5-3":Math.min(0.250*2,0.600*2/3),
    "4.5-4":2.698/26.98*(26.98+3*35.45),
    "4.5-5":8.10/9.00*100,
    "4.5-6":10.009/(40.08+12.01+3*16.00)*(40.08+16.00)*0.800,
    "4.6-3":0.1000*30.00/25.00, "4.6-4":20.00*0.1500*2/0.2000,
    "4.6-5":24.86-1.24, "4.6-6":0.1000*25.50/25.00,
    "4.7-6":0.0200, "4.8-6":0.0150, "4.9-5":-2-4*(-2), "4.9-6":2*3
  };
  assert.equal(Object.keys(expected).length, 18);
  assert.equal(bank.questions.filter(q => q.type === "numeric").length, 18);
  for (const [id, value] of Object.entries(expected)) {
    const q = byId(id);
    assert.ok(Math.abs(q.value-value) <= Math.abs(value)*1e-12, id);
    assert.ok(bank.units.some(u => u.id === q.unit), id);
    assert.ok(M.inspect(q, q.display, q.unit).correct, id+" display");
    assert.ok(M.inspect(q, q.display, q.unit).precisionOK, id+" precision");
    assert.ok(M.inspect(q, String(value), q.unit).correct, id+" unrounded");
    assert.equal(M.inspect(q, q.display, "wrong").correct, false, id);
    assert.equal(M.inspect(q, "0", q.unit).correct, false, id);
    if (q.precision.exact) assert.equal(M.inspect(q, String(value+1e-7), q.unit).correct, false, id);
    else for (const sign of [-1,1]) {
      assert.ok(M.inspect(q, String(value+sign*q.tolerance*0.99), q.unit).correct, id+" inside");
      assert.equal(M.inspect(q, String(value+sign*q.tolerance*1.01), q.unit).correct, false, id+" outside");
    }
  }
  assert.ok(M.inspect(byId("4.6-3"), "0.1200 mol/L", "M").correct);
  assert.ok(M.inspect(byId("4.6-5"), "23.620", "mL").correct);
  assert.equal(M.inspect(byId("4.6-5"), "23.620", "mL").precisionOK, false);
  assert.ok(M.inspect(byId("4.9-5"), "+6", "ratio").correct);
});

test("36 multiple-choice answers match the independent science audit", () => {
  const expected = {
    "4.1-1":"A new insoluble solid appears.", "4.1-2":"Bubbles alone do not prove that a chemical reaction occurred.",
    "4.1-3":"It stays constant.", "4.1-4":"The number of atoms of each element", "4.1-5":"A reaction occurred and released energy to the surroundings.",
    "4.2-1":"Ca<sup>2+</sup>(aq) + CO<sub>3</sub><sup>2−</sup>(aq) → CaCO<sub>3</sub>(s)",
    "4.2-2":"Na<sup>+</sup>(aq) and Cl<sup>−</sup>(aq)",
    "4.2-3":"Separate soluble aqueous strong electrolytes into ions; keep the solid intact.",
    "4.2-4":"CH<sub>3</sub>COOH(aq) + OH<sup>−</sup>(aq) → CH<sub>3</sub>COO<sup>−</sup>(aq) + H<sub>2</sub>O(l)",
    "4.2-5":"No net ionic reaction occurs.",
    "4.3-1":"4 H<sub>2</sub>O molecules and 1 O<sub>2</sub> molecule", "4.3-2":"CO, because six CO consume only three O<sub>2</sub>",
    "4.3-3":"2 CaCO<sub>3</sub> units in a solid, with 4 Na<sup>+</sup> and 4 Cl<sup>−</sup> dispersed in solution",
    "4.3-4":"1 nitrogen pair plus 3 hydrogen pairs form 2 molecules, each with 1 N and 3 H.",
    "4.4-1":"Intermolecular attractions are overcome while the molecules remain intact.",
    "4.4-2":"Covalent bonds are broken and formed, producing different substances.",
    "4.4-3":"A physical change because the chemical composition stays the same", "4.4-4":"Intact sugar molecules disperse and form attractions with water.",
    "4.4-5":"Electrolysis changes chemical identity; boiling retains water molecules.",
    "4.5-1":"2 mol NH<sub>3</sub> / 3 mol H<sub>2</sub>",
    "4.6-1":"Equivalence is the stoichiometric condition; the endpoint is the observed indicator signal.",
    "4.6-2":"NaOH is the titrant; HCl is the analyte; the buret measures delivered volume.",
    "4.7-1":"Precipitation reaction", "4.7-2":"Acid-base reaction", "4.7-3":"Zn changes from 0 to +2 and Cu changes from +2 to 0.",
    "4.7-4":"An acid-base reaction produces gas while carbon stays at +4.", "4.7-5":"Carbon goes from −4 to +4 and oxygen from 0 to −2.",
    "4.8-1":"A Brønsted-Lowry base because it accepts a proton", "4.8-2":"HCl donates a proton; Cl<sup>−</sup> is its conjugate base.",
    "4.8-3":"NH<sub>4</sub><sup>+</sup>(aq) and NH<sub>3</sub>(aq)",
    "4.8-4":"CH<sub>3</sub>COO<sup>−</sup> is the conjugate base; NH<sub>4</sub><sup>+</sup> is the conjugate acid.",
    "4.8-5":"The extent of ionization: essentially complete for the strong acid, partial for the weak acid",
    "4.9-1":"Zn is oxidized; Cu<sup>2+</sup> is reduced.", "4.9-2":"Cu<sup>2+</sup>(aq), because it accepts electrons",
    "4.9-3":"Zn(s), because it donates electrons", "4.9-4":"Fe<sup>3+</sup>(aq) + e<sup>−</sup> → Fe<sup>2+</sup>(aq)"
  };
  assert.equal(Object.keys(expected).length, 36);
  assert.equal(bank.questions.filter(q => q.type === "mc").length, 36);
  for (const [id, answer] of Object.entries(expected)) assert.equal(byId(id).choices[byId(id).answer].text.en, answer, id);
});

test("page uses Unit 1 markup and shared assets without local engine files", () => {
  const fs = require("node:fs");
  const html = fs.readFileSync("apchem-unit4-practice/index.html", "utf8");
  const u1 = fs.readFileSync("apchem-unit1-practice/index.html", "utf8");
  const grid = /<dl class="zsa-u[14]-masses">(.*?)<\/dl>/;
  assert.equal(html.match(grid)[1], u1.match(grid)[1]);
  assert.match(html, /data-zsa-activity="apchem-unit4-practice" data-zsa-practice="zsa-u4"/);
  const scripts = [...html.matchAll(/<script src="([^?]+)[^"]*" defer>/g)].map(m => m[1]);
  assert.deepEqual(scripts, ["../shared/zsa-embed.js", "../shared/zsa-i18n.js", "data.js", "../shared/zsa-practice-model.js", "../shared/zsa-practice.js", "../shared/zsa-header.js", "../shared/zsa-about.js"]);
  assert.deepEqual(fs.readdirSync("apchem-unit4-practice").sort(), ["README.md","TESTING.md","data.js","diagrams.css","index.html"]);
  assert.match(html, /data-zsa-practice-visual="particles" hidden/);
  assert.deepEqual(bank.questions.filter(q => q.particles).map(q => q.id), ["4.3-1"]);
  assert.match(html, /role="img" aria-labelledby="zsa-u4-particles-title" aria-describedby="zsa-u4-particles-desc"/);
  for (const m of html.slice(html.indexOf('<figure id="zsa-u4-particles"')).matchAll(/<(?:title|desc|figcaption)(?: id="zsa-u4-particles-[^"]+")?>([^<]+)</g)) assert.ok(bank.copy.es[m[1]], m[1]);
  // The initial particle model contains exactly eight H atoms and six O atoms.
  const svg = html.match(/<svg viewBox="0 0 200 260"[\s\S]*?<\/svg>/)[0];
  assert.equal([...svg.matchAll(/<circle[^>]*r="7"/g)].length, 8);
  assert.equal([...svg.matchAll(/<circle[^>]*r="11"/g)].length, 6);
});

test("exact topic titles and requested AP Spanish terminology are preserved", () => {
  const en = ["Introduction for Reactions","Net Ionic Equations","Representations of Reactions","Physical and Chemical Changes","Stoichiometry","Introduction to Titration","Types of Chemical Reactions","Introduction to Acid-Base Reactions","Oxidation-Reduction (Redox) Reactions"];
  const es = ["Introducción a las reacciones","Ecuaciones iónicas netas","Representaciones de las reacciones","Cambios físicos y químicos","Estequiometría","Introducción a la titulación","Tipos de reacciones químicas","Introducción a las reacciones ácido-base","Reacciones de oxidación-reducción (redox)"];
  assert.deepEqual(bank.topics.map(t => t.title), en.map((title,i) => ({en:`4.${i+1} ${title}`, es:`4.${i+1} ${es[i]}`})));
  const spanish = JSON.stringify(bank.questions.map(q => [q.prompt.es,q.explanation.es,...(q.choices || []).flatMap(c => [c.text.es,c.why.es])]));
  for (const term of ["ecuación iónica neta","ecuación iónica completa","ecuación molecular","ion espectador","reactivo limitante","rendimiento teórico","rendimiento real","rendimiento porcentual","razón molar","estequiometría","bureta","titulante","analito","punto de equivalencia","punto final","electrolito fuerte","electrolito débil","reacción de precipitación","ácido de Brønsted-Lowry","base de Brønsted-Lowry","ácido conjugado","base conjugada","número de oxidación","agente oxidante","agente reductor","semirreacción","cambio físico","cambio químico","evidencia de una reacción"]) assert.ok(spanish.includes(term), term);
  assert.doesNotMatch(spanish, /estado de oxidación|\(ac\)|usted|vosotros/);
});
