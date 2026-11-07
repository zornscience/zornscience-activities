"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const bank = require("../../apchem-unit8-practice/data.js");
const M = require("../../shared/zsa-practice-model.js");
const byId = id => bank.questions.find(q => q.id === id);

test("66 bilingual questions preserve all eleven exact CED titles and separate decimal IDs", () => {
  const en = ["Introduction to Acids and Bases", "pH and pOH of Strong Acids and Bases", "Weak Acid and Base Equilibria", "Acid-Base Reactions and Buffers", "Acid-Base Titrations", "Molecular Structure of Acids and Bases", "pH and pKa", "Properties of Buffers", "Henderson-Hasselbalch Equation", "Buffer Capacity", "pH and Solubility"];
  const es = ["Introducción a los ácidos y las bases", "pH y pOH de ácidos y bases fuertes", "Equilibrios de ácidos y bases débiles", "Reacciones ácido-base y amortiguadores", "Titulaciones ácido-base", "Estructura molecular de ácidos y bases", "pH y pKa", "Propiedades de los amortiguadores", "Ecuación de Henderson-Hasselbalch", "Capacidad amortiguadora", "pH y solubilidad"];
  assert.deepEqual(bank.topics, en.map((t,i) => ({id:`8.${i+1}`,title:{en:`8.${i+1} ${t}`,es:`8.${i+1} ${es[i]}`}})));
  assert.equal(bank.questions.length,66);
  assert.equal(new Set(bank.questions.map(q=>q.id)).size,66);
  for (const lang of ["en","es"]) assert.equal(new Set(bank.questions.map(q=>q.prompt[lang])).size,66);
  for (const t of bank.topics) {
    const qs = M.makeSet(bank.questions,t.id,()=>0).map(e=>e.question);
    assert.equal(qs.length,6);assert.ok(qs.every(q=>q.topic===t.id));
    assert.equal(qs.filter(q=>q.type==="mc").length,4);assert.equal(qs.filter(q=>q.type==="numeric").length,2);
  }
  assert.equal(M.makeSet(bank.questions,"mixed",()=>0).length,66);
});

test("all 132 distractors have individual bilingual feedback with scientific notation parity", () => {
  function pair(p,id) {
    assert.ok(p.en && p.es,id);
    for (const text of [p.en,p.es]) {
      assert.doesNotMatch(text,/[\u2013\u2014]|[₀-₉⁰¹²³⁴⁵⁶⁷⁸⁹]|<(?!(?:\/?su[bp])>)[a-z]/i,id);
      for(const tag of ["sub","sup"]) assert.equal((text.match(new RegExp(`<${tag}>`,"g"))||[]).length,(text.match(new RegExp(`</${tag}>`,"g"))||[]).length,id);
    }
    assert.deepEqual(p.en.match(/<su[bp]>.*?<\/su[bp]>/g),p.es.match(/<su[bp]>.*?<\/su[bp]>/g),id+" notation");
    assert.deepEqual((p.en.match(/\d+(?:\.\d+)?/g)||[]).sort(),(p.es.match(/\d+(?:\.\d+)?/g)||[]).sort(),id+" numbers");
  }
  let wrong=0;
  for(const q of bank.questions) {
    pair(q.prompt,q.id);pair(q.explanation,q.id);
    if(q.type!=="mc") continue;
    assert.equal(q.choices.length,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    for(const lang of ["en","es"]) {
      assert.equal(new Set(q.choices.map(c=>c.text[lang])).size,4,q.id);
      assert.equal(new Set(q.choices.filter((_,i)=>i!==q.answer).map(c=>c.why[lang])).size,3,q.id);
    }
    q.choices.forEach((c,i)=>{pair(c.text,q.id);if(i!==q.answer){pair(c.why,q.id);wrong++;}});
  }
  assert.equal(wrong,132);
  assert.doesNotMatch(bank.questions.map(q=>q.prompt.es+q.explanation.es+(q.choices||[]).map(c=>c.text.es+c.why.es).join(" ")).join(" "),/\bbuffer\b|tampón|valoración|(?:^|\s)ión(?=\s|[.,])/i);
});

test("22 numeric keys independently solve logarithms, weak equilibria, neutralization, buffers and solubility", () => {
  // Independent quadratic root and mass-action expressions, not bank calculations.
  const root = (-1.8e-5+Math.sqrt((1.8e-5)**2+4*1.8e-5*.100))/2;
  const expected = {
    "8.1-5":[(2e-7)**2,"ratio",{sf:3}],"8.1-6":[-Math.log10(Math.sqrt(4e-14)),"ratio",{decimals:2}],
    "8.2-5":[-Math.log10(.00250),"ratio",{decimals:3}],"8.2-6":[-Math.log10(2*.015),"ratio",{decimals:2}],
    "8.3-5":[-Math.log10(root),"ratio",{decimals:2}],"8.3-6":[14+Math.log10(root),"ratio",{decimals:2}],
    "8.4-5":[-Math.log10((.0300*.100-.0200*.100)/.0500),"ratio",{decimals:3}],"8.4-6":[.0100-.00400,"mol",{sf:3}],
    "8.5-5":[-Math.log10(1.8e-5),"ratio",{decimals:2}],"8.5-6":[25*.100/.100,"mL",{sf:3}],
    "8.6-5":[-Math.log10(6.8e-4),"ratio",{decimals:2}],"8.6-6":[1e-14/1.8e-5,"ratio",{sf:2}],
    "8.7-5":[-Math.log10(1.80e-5),"ratio",{decimals:3}],"8.7-6":[10**(5.74-4.74),"ratio",{sf:2}],
    "8.8-5":[-Math.log10(1.8e-5*(.0200+.00500)/(.0300-.00500)),"ratio",{decimals:2}],"8.8-6":[1.8e-5*.100/.200,"M",{sf:2}],
    "8.9-5":[-Math.log10(1.8e-5*.100/.250),"ratio",{decimals:2}],"8.9-6":[1.8e-5/10**(-5),"ratio",{sf:2}],
    "8.10-5":[-Math.log10(1.8e-5*(.0100-.00200)/(.0100+.00200)),"ratio",{decimals:2}],"8.10-6":[.0200-.00500,"mol",{sf:3}],
    "8.11-5":[Math.cbrt(3.20e-11*(1+.0100/6.8e-4)**2/4),"M",{sf:2}],"8.11-6":[5.6e-12/(10**(-(14-10)))**2,"M",{sf:2}]
  };
  assert.equal(Object.keys(expected).length,22);assert.equal(bank.questions.filter(q=>q.type==="numeric").length,22);
  for(const [id,[value,unit,precision]] of Object.entries(expected)) {
    const q=byId(id);assert.ok(Math.abs(q.value-value)<=Math.abs(value)*1e-12,id);
    assert.equal(q.unit,unit,id);assert.deepEqual(q.precision,precision,id);
    assert.ok(M.inspect(q,q.display,unit).correct,id+" display");assert.ok(M.inspect(q,q.display,unit).precisionOK,id+" precision");
    assert.ok(M.inspect(q,String(value),unit).correct,id+" exact");
    assert.equal(M.inspect(q,q.display,"wrong").correct,false,id+" unit");
    assert.equal(M.inspect(q,"0",unit).correct,false,id+" zero");assert.equal(M.inspect(q,String(-value),unit).correct,false,id+" sign");
    for(const sign of [-1,1]) {
      assert.ok(M.inspect(q,String(value+sign*q.tolerance*.99),unit).correct,id+" inside");
      assert.equal(M.inspect(q,String(value+sign*q.tolerance*1.01),unit).correct,false,id+" outside");
    }
    if(precision.decimals) {
      assert.equal(q.unit,"ratio");assert.match(q.explanation.en,/Log rule:.*decimal places.*significant figures/);
      assert.match(q.explanation.es,/Regla de logaritmos:.*decimales.*cifras significativas/);
      const extra=q.display+"0";assert.ok(M.inspect(q,extra,unit).correct);assert.equal(M.inspect(q,extra,unit).precisionOK,false);
    }
  }
  assert.ok(M.inspect(byId("8.8-6"),"9.0e-6 mol/L","M").correct);
  assert.equal(M.inspect(byId("8.2-5"),"2.602 M","ratio").correct,false);
});

test("44 multiple-choice keys agree with the independent acid-base reasoning audit", () => {
  const expected=[
    ["NH<sub>4</sub><sup>+</sup>","NH<sub>4</sub><sup>+</sup> / NH<sub>3</sub>","Water is amphoteric.","Neutrality requires equal ion concentrations, while Kw depends on temperature."],
    ["HCl can be dilute and still ionize essentially completely.","0.0200 M","It increases by 1.00.","2.602"],
    ["Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA]","Kb = x<sup>2</sup>/(0.100 − x)","Hydronium concentration falls; percent ionization rises.","Reject the small-x approximation and solve the full equation."],
    ["Excess hydronium remains; the mixture is not a buffer.","HA and A<sup>−</sup>, forming a buffer","Mostly acetate; basic, without an appreciable buffer pair","No; there is no appreciable supply of the conjugate base."],
    ["The conjugate base reacts with water to produce hydroxide.","Acidic, because ammonium reacts with water","7.00","8.2 to 10.0; the endpoint"],
    ["The H-I bond is weaker, making proton donation easier.","Fluorine increases bond polarity and stabilizes the conjugate base better.","Nearby chlorine stabilizes the conjugate base by an inductive effect.","Resonance stabilizes the carboxylate conjugate base."],
    ["HA","A<sup>−</sup>","pH = pKa","X, because its Ka is larger"],
    ["It consumes added hydronium and becomes HA.","It consumes hydroxide and becomes the conjugate base.","pH is nearly unchanged, but capacity per volume decreases.","The acid-consuming component is finite and can be depleted."],
    ["pH = pKa + log([A<sup>−</sup>]/[HA])","Calculate the complete neutralization and use the resulting amounts.","The same final solution volume cancels.","No appreciable HA remains; use conjugate-base hydrolysis."],
    ["The more concentrated buffer","Equal concentrations of weak acid and conjugate base","The buffer rich in A<sup>−</sup>","Their buffer capacities can differ."],
    ["Hydronium consumes carbonate, favoring further dissolution.","Chloride is not appreciably protonated under these conditions.","Solubility increases; Ksp is unchanged.","Hydronium consumes hydroxide, favoring dissolution."]
  ];
  expected.forEach((row,i)=>row.forEach((answer,j)=>{const q=byId(`8.${i+1}-${j+1}`);assert.equal(q.choices[q.answer].text.en,answer,q.id);}));
});

test("equilibrium residuals and dilution, buffer and solubility trends are consistent", () => {
  const acid=byId("8.3-5"),h=10**(-acid.value);
  assert.ok(Math.abs(h*h/(.100-h)-1.8e-5)<1e-15);
  const oh=10**(-(14-byId("8.3-6").value));assert.ok(Math.abs(oh*oh/(.100-oh)-1.8e-5)<1e-15);
  const dilute=(-1.8e-5+Math.sqrt((1.8e-5)**2+4*1.8e-5*.0100))/2;
  assert.ok(dilute<h);assert.ok(dilute/.0100>h/.100);
  assert.ok(Math.sqrt(1e-3*.010)/.010>.05);
  const s=byId("8.11-5").value,freeF=2*s/(1+.0100/6.8e-4);
  assert.ok(Math.abs(s*freeF**2-3.2e-11)<1e-24);
  assert.ok(s>Math.cbrt(3.2e-11/4));
  assert.ok(byId("8.10-5").value>byId("8.8-5").value);
});

test("unit markup, models and reference preserve the shared engine contract", () => {
  const html=fs.readFileSync("apchem-unit8-practice/index.html","utf8");
  assert.match(html,/data-zsa-activity="apchem-unit8-practice" data-zsa-practice="zsa-u8"/);
  assert.deepEqual([...html.matchAll(/<script src="([^?]+)[^"]*" defer>/g)].map(m=>m[1]),["../shared/zsa-embed.js","../shared/zsa-i18n.js","data.js","../shared/zsa-practice-model.js","../shared/zsa-practice.js","../shared/zsa-header.js","../shared/zsa-about.js"]);
  for(const flag of ["curve","species"]) {assert.match(html,new RegExp(`data-zsa-practice-visual="${flag}" hidden`));assert.ok(bank.questions.some(q=>q[flag]));}
  for(const key of ["Kw =", "pH = −log", "pOH = −log", "pH + pOH = 14.00", "Ka × Kb = Kw", "pKa = −log Ka", "pH = pKa + log", "Percent ionization", "1.80 × 10<sup>−5</sup>", "6.8 × 10<sup>−4</sup>", "1.0 × 10<sup>−3</sup>","5.6 × 10<sup>−10</sup>"]) assert.ok(html.includes(key),key);
  const css=fs.readFileSync("apchem-unit8-practice/diagrams.css","utf8");
  for(const line of css.split("\n").filter(l=>l.trim()&&!l.startsWith("/*"))) assert.ok(line.startsWith(".zsa-u8 "),line);
  const audit=fs.readFileSync("apchem-unit8-practice/TESTING.md","utf8");
  for(const q of bank.questions) assert.ok(audit.includes(q.id+" |"),q.id+" worked audit");
});
