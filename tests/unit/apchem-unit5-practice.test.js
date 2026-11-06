"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../../apchem-unit5-practice/data.js");
const M = require("../../shared/zsa-practice-model.js");
const byId = id => bank.questions.find(q => q.id === id);

test("66 original bilingual questions cover all eleven CED topics with mixed response types", () => {
  assert.equal(bank.questions.length, 66);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 66);
  assert.equal(new Set(bank.questions.map(q => q.prompt.en)).size, 66);
  assert.equal(new Set(bank.questions.map(q => q.prompt.es)).size, 66);
  assert.deepEqual(bank.topics.map(t => t.id), Array.from({length:11}, (_, i) => "5." + (i + 1)));
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

test("22 numeric keys agree with independent calculations, units and precision", () => {
  const expected = {
    "5.1-5":[(0.800-0.500)/15.0,"M/s",{sf:3}], "5.1-6":[0.0400*3/2,"M/s",{sf:3}],
    "5.2-5":[0.008/((0.2)**2*0.1),"M^-2 s^-1",{sf:3}], "5.2-6":[3**0,"ratio",{exact:true}],
    "5.3-5":[0.693/0.0231,"s",{sf:3}], "5.3-6":[1/(1/0.5+0.2*10),"M",{sf:3}],
    "5.4-5":[0.5*0.2*0.3,"M/s",{sf:3}], "5.4-6":[1+2,"count",{exact:true}],
    "5.5-5":[200*0.3*0.2,"count",{exact:true}], "5.5-6":[4*0.025,"s^-1",{sf:3}],
    "5.6-5":[80-20,"kJ/mol",{sf:3}], "5.6-6":[35-10,"kJ/mol",{decimals:1}],
    "5.7-5":[1,"count",{exact:true}], "5.7-6":[2,"count",{exact:true}],
    "5.8-5":[0.4*0.25*0.2,"M/s",{sf:3}], "5.8-6":[2*2,"ratio",{exact:true}],
    "5.9-5":[4*0.1*0.2,"M",{sf:3}], "5.9-6":[0.5*0.08*0.2,"M/s",{sf:3}],
    "5.10-5":[100-40,"kJ/mol",{sf:3}], "5.10-6":[10-20,"kJ/mol",{decimals:1}],
    "5.11-5":[(90-20)-(55-20),"kJ/mol",{sf:3}], "5.11-6":[0-20,"kJ/mol",{decimals:1}]
  };
  assert.equal(bank.questions.filter(q=>q.type==="numeric").length,22);
  for (const [id,[value,unit,precision]] of Object.entries(expected)) {
    const q=byId(id);
    assert.ok(Math.abs(q.value-value) <= Math.abs(value)*1e-12,id);
    assert.equal(q.unit,unit,id); assert.deepEqual(q.precision,precision,id);
    assert.ok(bank.units.some(u=>u.id===unit),id);
    assert.ok(M.inspect(q,q.display,unit).correct,id+" rounded");
    assert.ok(M.inspect(q,q.display,unit).precisionOK,id+" precision");
    assert.ok(M.inspect(q,String(value),unit).correct,id+" unrounded");
    assert.equal(M.inspect(q,q.display,"wrong").correct,false,id);
    assert.equal(M.inspect(q,"0",unit).correct,false,id);
    if (precision.exact) assert.equal(M.inspect(q,String(value+1e-7),unit).correct,false,id);
    else for (const sign of [-1,1]) {
      assert.ok(M.inspect(q,String(value+sign*q.tolerance*0.99),unit).correct,id+" inside");
      assert.equal(M.inspect(q,String(value+sign*q.tolerance*1.01),unit).correct,false,id+" outside");
    }
  }
  assert.ok(M.inspect(byId("5.3-6"),"0.250 mol/L","M").correct);
  assert.ok(M.inspect(byId("5.1-5"),"2.00e-2 M/s","M/s").correct);
  assert.ok(M.inspect(byId("5.10-6"),"-10.0 kJ/mol","kJ/mol").correct);
  assert.equal(M.inspect(byId("5.10-6"),"-10.00","kJ/mol").precisionOK,false);
});

test("44 multiple-choice answers match the independent worked audit", () => {
  const answers = [
    ["−Δ[A]/Δt","Reverse the sign of the tangent slope at that instant.","It is half as large.","Reactant concentration falls, so fewer reactive encounters occur per unit volume and time."],
    ["rate = k[A]<sup>2</sup>[B]","3","M<sup>−2</sup> s<sup>−1</sup>","The rate law must be determined experimentally; coefficients alone are insufficient."],
    ["Zero order","ln[A] versus time","1/[A] versus time, slope +k","It is independent of the initial concentration."],
    ["Unimolecular","Bimolecular; rate = k[NO]<sup>2</sup>","rate = k[A][B]","Three particles must meet simultaneously with suitable energy and orientation."],
    ["Sufficient collision energy and a suitable orientation","A larger fraction of collisions has energy above the activation threshold.","Collisions occur more often per unit volume and time.","k increases."],
    ["A transition state (activated complex)","Exothermic; ΔH = −20 kJ/mol","80 kJ/mol","Progress of molecular rearrangement from reactants to products"],
    ["NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g)","NO<sub>3</sub>(g)","Cl(g)","Its steps sum to the overall reaction and its predicted rate law agrees with measurements."],
    ["rate = k[NO<sub>2</sub>]<sup>2</sup>","Zero order in CO","rate = k[A][B]","No; it predicts rate = k[A][B]."],
    ["[I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B]","rate = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A][B]<sup>2</sup>","The first step equilibrates much faster than the slow step consumes I.","It quadruples."],
    ["Two","An intermediate with a finite lifetime","Step 2, whose local forward barrier is 60 kJ/mol","Two transition states and one intermediate"],
    ["It provides an alternative pathway with a lower activation barrier.","The catalyzed path has a lower barrier and the same ΔH.","Equilibrium is reached sooner, but the equilibrium constant is unchanged.","More surface sites are available for heterogeneous catalysis."]
  ];
  assert.equal(bank.questions.filter(q=>q.type==="mc").length,44);
  answers.forEach((row,i)=>row.forEach((answer,j)=>{const q=byId(`5.${i+1}-${j+1}`);assert.equal(q.choices[q.answer].text.en,answer,q.id);}));
});

test("exact supplied topic titles, AP glossary and distinct topic keys are preserved", () => {
  const en=["Reaction Rates","Introduction to Rate Law","Concentration Changes Over Time","Elementary Reactions","Collision Model","Reaction Energy Profile","Introduction to Reaction Mechanisms","Reaction Mechanism and Rate Law","Pre-Equilibrium Approximation","Multistep Reaction Energy Profile","Catalysis"];
  const es=["Velocidades de reacción","Introducción a la ley de velocidad","Cambios de concentración con el tiempo","Reacciones elementales","Modelo de colisiones","Perfil de energía de una reacción","Introducción a los mecanismos de reacción","Mecanismo de reacción y ley de velocidad","Aproximación de preequilibrio","Perfil de energía de una reacción de varios pasos","Catálisis"];
  assert.deepEqual(bank.topics.map(t=>t.title),en.map((t,i)=>({en:`5.${i+1} ${t}`,es:`5.${i+1} ${es[i]}`})));
  for (const topic of ["5.1","5.10","5.11"]) {
    const set=M.makeSet(bank.questions,topic,()=>0);
    assert.equal(set.length,6);assert.ok(set.every(e=>e.question.topic===topic));
  }
  const spanish=JSON.stringify(bank.questions.map(q=>[q.prompt.es,q.explanation.es,...(q.choices||[]).flatMap(c=>[c.text.es,c.why.es])]));
  for (const term of ["ley de velocidad","constante de velocidad","orden de reacción","orden global","vida media","ley de velocidad integrada","velocidad inicial","método de las velocidades iniciales","velocidad promedio","velocidad instantánea","reacción elemental","mecanismo de reacción","reacción global","intermediario","catalizador","paso determinante de la velocidad","molecularidad","modelo de colisiones","colisión exitosa","energía de activación","complejo activado","estado de transición","coordenada de reacción","perfil de energía","aproximación de preequilibrio","ecuación de Arrhenius"]) assert.ok(spanish.includes(term),term);
  assert.doesNotMatch(spanish,/rapidez|paso limitante|\(ac\)|usted|vosotros/);
});

test("page follows the two-file contract with unit-owned translated models and kinetics reference", () => {
  const fs=require("node:fs");
  const html=fs.readFileSync("apchem-unit5-practice/index.html","utf8");
  assert.match(html,/data-zsa-activity="apchem-unit5-practice" data-zsa-practice="zsa-u5"/);
  assert.deepEqual([...html.matchAll(/<script src="([^?]+)[^"]*" defer>/g)].map(m=>m[1]),["../shared/zsa-embed.js","../shared/zsa-i18n.js","data.js","../shared/zsa-practice-model.js","../shared/zsa-practice.js","../shared/zsa-header.js","../shared/zsa-about.js"]);
  assert.deepEqual(fs.readdirSync("apchem-unit5-practice").sort(),["README.md","TESTING.md","data.js","diagrams.css","index.html"]);
  for (const flag of ["linear","single","multi","catalysis"]) {
    assert.match(html,new RegExp('data-zsa-practice-visual="'+flag+'" hidden'));
    assert.ok(bank.questions.some(q=>q[flag]));
    const fig=html.match(new RegExp('<figure id="zsa-u5-'+flag+'"[\\s\\S]*?</figure>'))[0];
    assert.match(fig,/role="img" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
    for (const m of fig.matchAll(/<(?:title|desc|figcaption)(?: id="[^"]+")?>([^<]+)</g)) assert.ok(bank.copy.es[m[1]],m[1]);
  }
  const ref=html.slice(html.indexOf('<details class="zsa-panel'));
  for (const formula of ["[A] = [A]<sub>0</sub> − kt","ln[A] = ln[A]<sub>0</sub> − kt","1/[A] = 1/[A]<sub>0</sub> + kt","t½ = 0.693/k","M<sup>1−(m+n)</sup> s<sup>−1</sup>"]) assert.ok(ref.includes(formula),formula);
});
