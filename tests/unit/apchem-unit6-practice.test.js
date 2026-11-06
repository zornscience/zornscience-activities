"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const bank=require("../../apchem-unit6-practice/data.js");
const M=require("../../shared/zsa-practice-model.js");
const byId=id=>bank.questions.find(q=>q.id===id);
const raw=q=>q.display.replace(/−/g,"-");

test("54 original bilingual questions give six per exact supplied CED topic",()=>{
  const en=["Endothermic and Exothermic Processes","Energy Diagrams","Heat Transfer and Thermal Equilibrium","Heat Capacity and Calorimetry","Energy of Phase Changes","Introduction to Enthalpy of Reaction","Bond Enthalpies","Enthalpy of Formation","Hess's Law"];
  const es=["Procesos endotérmicos y exotérmicos","Diagramas de energía","Transferencia de calor y equilibrio térmico","Capacidad calorífica y calorimetría","Energía de los cambios de fase","Introducción a la entalpía de reacción","Entalpías de enlace","Entalpía de formación","Ley de Hess"];
  assert.deepEqual(bank.topics,en.map((t,i)=>({id:`6.${i+1}`,title:{en:`6.${i+1} ${t}`,es:`6.${i+1} ${es[i]}`}})));
  assert.equal(bank.questions.length,54);
  assert.equal(new Set(bank.questions.map(q=>q.id)).size,54);
  for(const lang of ["en","es"]) assert.equal(new Set(bank.questions.map(q=>q.prompt[lang])).size,54);
  for(const topic of bank.topics){
    const set=M.makeSet(bank.questions,topic.id,()=>0).map(e=>e.question);
    assert.equal(set.length,6); assert.ok(set.every(q=>q.topic===topic.id));
    assert.equal(set.filter(q=>q.type==="mc").length,4); assert.equal(set.filter(q=>q.type==="numeric").length,2);
  }
});

test("all 108 distractors have distinct bilingual feedback and notation matches",()=>{
  function parity(pair,id){
    assert.ok(pair.en && pair.es,id);
    for(const text of [pair.en,pair.es]){
      assert.doesNotMatch(text,/[\u2013\u2014]|\b(?:H2O|CO2|NH3|O2|N2)\b/,id);
      assert.equal((text.match(/<sub>/g)||[]).length,(text.match(/<\/sub>/g)||[]).length,id);
      assert.equal((text.match(/<sup>/g)||[]).length,(text.match(/<\/sup>/g)||[]).length,id);
      assert.doesNotMatch(text.replace(/<\/?su[bp]>/g,""),/<[^>]*>/,id);
    }
    assert.deepEqual(pair.en.match(/<su[bp]>.*?<\/su[bp]>/g),pair.es.match(/<su[bp]>.*?<\/su[bp]>/g),id+" markup");
    assert.deepEqual(pair.en.match(/\d+(?:\.\d+)?/g),pair.es.match(/\d+(?:\.\d+)?/g),id+" numbers");
  }
  let wrong=0;
  for(const q of bank.questions){
    parity(q.prompt,q.id);parity(q.explanation,q.id);
    if(q.type!=="mc")continue;
    assert.equal(q.choices.length,4);
    for(const lang of ["en","es"]){
      assert.equal(new Set(q.choices.map(c=>c.text[lang])).size,4,q.id);
      assert.equal(new Set(q.choices.filter((_,i)=>i!==q.answer).map(c=>c.why[lang])).size,3,q.id);
    }
    q.choices.forEach((c,i)=>{parity(c.text,q.id);if(i!==q.answer){parity(c.why,q.id);wrong++;}});
  }
  assert.equal(wrong,108);
});

test("18 numeric answers agree with independent energy balances and Hess calculations",()=>{
  const expected={
    "6.1-5":[-(-850),"J",{sf:3}],"6.1-6":[-(1.25),"kJ",{sf:3}],
    "6.2-5":[10-40,"kJ/mol",{decimals:1}],"6.2-6":[45-15,"kJ/mol",{decimals:1}],
    "6.3-5":[(50*80+100*20)/(50+100),"°C",{decimals:1}],
    "6.3-6":[25*4.18*(20-30),"J",{sf:3}],
    "6.4-5":[-(100*4.18*5)/1000/0.025,"kJ/mol",{sf:3}],
    "6.4-6":[50*4.18*(24-30),"J",{sf:3}],
    "6.5-5":[0.25*6.01,"kJ",{sf:3}],"6.5-6":[0.1*(-40.7),"kJ",{sf:3}],
    "6.6-5":[0.3/2*(-92.2),"kJ",{sf:3}],"6.6-6":[-0.5*(-92.2),"kJ/mol",{sf:3}],
    "6.7-5":[436+0.5*498-2*463,"kJ/mol",{sf:3}],
    "6.7-6":[945+3*436-6*391,"kJ/mol",{sf:2}],
    "6.8-5":[(-393.5+2*(-285.8))-(-74.8),"kJ/mol",{decimals:1}],
    "6.8-6":[(-635.1-393.5)-(-1206.9),"kJ/mol",{decimals:1}],
    "6.9-5":[-393.5-(-283),"kJ/mol",{decimals:1}],
    "6.9-6":[180.6-114.2,"kJ/mol",{decimals:1}]
  };
  assert.equal(bank.questions.filter(q=>q.type==="numeric").length,18);
  assert.equal(Object.keys(expected).length,18);
  for(const [id,[value,unit,precision]] of Object.entries(expected)){
    const q=byId(id);
    assert.ok(Math.abs(q.value-value)<=Math.abs(value)*1e-12,id);
    assert.equal(q.unit,unit,id);assert.deepEqual(q.precision,precision,id);
    assert.ok(M.inspect(q,raw(q),unit).correct,id+" display value");
    assert.ok(M.inspect(q,raw(q),unit).precisionOK,id+" precision");
    assert.ok(M.inspect(q,String(value),unit).correct,id+" unrounded");
    assert.equal(M.inspect(q,raw(q),"wrong").correct,false,id+" wrong unit");
    assert.equal(M.inspect(q,"0",unit).correct,false,id+" zero");
    for(const sign of [-1,1]){
      assert.ok(M.inspect(q,String(value+sign*q.tolerance*0.99),unit).correct,id+" inside tolerance");
      assert.equal(M.inspect(q,String(value+sign*q.tolerance*1.01),unit).correct,false,id+" outside tolerance");
    }
    if(unit!=="°C"){
      assert.match(q.display,/^[+−]/,id);
      assert.equal(M.inspect(q,String(-value),unit).correct,false,id+" wrong sign");
      assert.equal(M.inspect(q,String(value*1000),unit).correct,false,id+" no implicit conversion");
      assert.match(q.explanation.en,/The sign must be [−+]/,id);
      assert.match(q.explanation.es,/El signo debe ser [−+]/,id);
      assert.ok(q.explanation.en.includes(value>0?"The sign must be +":"The sign must be −"),id);
    }
  }
  assert.ok(M.inspect(byId("6.1-6"),"-1.25 kJ","kJ").correct);
  assert.equal(M.inspect(byId("6.1-6"),"-1.25 J","kJ").correct,false);
  assert.equal(M.inspect(byId("6.2-6"),"+30.00","kJ/mol").precisionOK,false);
});

test("36 multiple-choice keys match the independently worked thermochemistry audit",()=>{
  const expected=[
    ["The water and glass vial","Endothermic: q(system) > 0 and ΔH > 0","q(system) = −q(surroundings)","ΔH has a − sign, even if the thermostat holds the system temperature constant"],
    ["−30 kJ/mol, exothermic","+30 kJ/mol, endothermic","It remains −30 kJ/mol","It cools as the reaction absorbs heat"],
    ["From the hotter sample to the colder sample","Temperature","Between 20 °C and 40 °C","40 °C"],
    ["C is per sample, c is per gram, and molar heat capacity is per mole","−2.09 kJ","−41.8 kJ/mol","It is less negative than the true value"],
    ["B-C","Potential energy increases while temperature stays constant","Vaporization","−6.01 kJ/mol"],
    ["q at constant pressure equals the enthalpy change","+92.2 kJ/mol","−184.4 kJ/mol of the doubled reaction","Enthalpy is a state function"],
    ["Breaking bonds absorbs energy; forming bonds releases energy","−183 kJ/mol","Average gas-phase values vary with molecular environment","Vaporization separates intact molecules instead of breaking O-H bonds"],
    ["O<sub>2</sub>(g)","C(s, graphite) + O<sub>2</sub>(g) → CO<sub>2</sub>(g)","Use the value for the physical state in the equation","Sum coefficient-weighted products, then subtract coefficient-weighted reactants"],
    ["A(g) → C(g), ΔH = −23 kJ/mol","+28 kJ/mol","Equal amounts of the same species in the same physical state appear on opposite sides","Enthalpy is a state function, so intermediate states cancel"]
  ];
  assert.equal(bank.questions.filter(q=>q.type==="mc").length,36);
  expected.forEach((row,i)=>row.forEach((answer,j)=>{const q=byId(`6.${i+1}-${j+1}`);assert.equal(q.choices[q.answer].text.en,answer,q.id);}));
});

test("page keeps the shared two-runtime-file contract and all model text is translated",()=>{
  const html=fs.readFileSync("apchem-unit6-practice/index.html","utf8");
  assert.match(html,/data-zsa-activity="apchem-unit6-practice" data-zsa-practice="zsa-u6"/);
  assert.deepEqual([...html.matchAll(/<script src="([^?]+)[^"]*" defer>/g)].map(m=>m[1]),["../shared/zsa-embed.js","../shared/zsa-i18n.js","data.js","../shared/zsa-practice-model.js","../shared/zsa-practice.js","../shared/zsa-header.js","../shared/zsa-about.js"]);
  assert.deepEqual(fs.readdirSync("apchem-unit6-practice").sort(),["README.md","TESTING.md","data.js","diagrams.css","index.html"]);
  const flags={exo:["6.2-1","6.2-2","6.2-3","6.2-5"],endo:["6.2-4","6.2-6"],curve:["6.5-1","6.5-2"]};
  for(const [flag,ids] of Object.entries(flags)){
    assert.deepEqual(bank.questions.filter(q=>q[flag]).map(q=>q.id),ids);
    assert.match(html,new RegExp('data-zsa-practice-visual="'+flag+'" hidden'));
    const fig=html.match(new RegExp('<figure id="zsa-u6-'+flag+'"[\\s\\S]*?</figure>'))[0];
    assert.match(fig,/role="img" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
    for(const m of fig.matchAll(/<(?:title|desc|figcaption)(?: id="[^"]+")?>([^<]+)</g))assert.ok(bank.copy.es[m[1]],m[1]);
  }
  for(const formula of ["q = mcΔT","4.18 J/(g·°C)","ΔH°<sub>rxn</sub> = Σ ΔH°<sub>f</sub>(products) − Σ ΔH°<sub>f</sub>(reactants)","ΔH = Σ bonds broken − Σ bonds formed"]){assert.ok(html.includes(formula),formula);}
  const bondRows=[["H-H",436],["Cl-Cl",243],["H-Cl",431],["O=O",498],["O-H",463],["N≡N",945],["N-H",391]];
  for(const [bond,value] of bondRows)assert.ok(html.includes(`<td>${bond}</td><td>${value}</td>`),bond);
  const formationRows=[["CH<sub>4</sub>(g)","−74.8"],["CO<sub>2</sub>(g)","−393.5"],["H<sub>2</sub>O(l)","−285.8"],["H<sub>2</sub>O(g)","−241.8"],["CaCO<sub>3</sub>(s)","−1206.9"],["CaO(s)","−635.1"]];
  for(const [species,value] of formationRows)assert.ok(html.includes(`<td>${species}</td><td>${value}</td>`),species);
  assert.ok(html.includes("The standard enthalpy of formation of an element in its standard state is 0."));
  assert.ok(html.includes("+6.01 kJ/mol") && html.includes("+40.7 kJ/mol"));
});

test("AP Spanish glossary and original worked records cover the complete bank",()=>{
  const spanish=JSON.stringify(bank.questions.map(q=>[q.prompt.es,q.explanation.es,...(q.choices||[]).flatMap(c=>[c.text.es,c.why.es])])).toLowerCase();
  for(const term of ["sistema","alrededores","calor","temperatura","energía térmica","equilibrio térmico","capacidad calorífica","capacidad calorífica específica (calor específico)","capacidad calorífica molar","calorímetro de vaso de espuma","calor de fusión (entalpía de fusión)","calor de vaporización (entalpía de vaporización)","tramo inclinado","tramo plano","entalpía de reacción","entalpía de enlace","entalpía de formación","entalpía estándar de formación","estado estándar","función de estado","diagrama de energía","primera ley de la termodinámica","endotérmico","exotérmico"])assert.ok(spanish.includes(term),term);
  assert.doesNotMatch(spanish,/julios|\(ac\)|usted|vosotros/);
  const worked=fs.readFileSync("apchem-unit6-practice/TESTING.md","utf8");
  for(const q of bank.questions)assert.match(worked,new RegExp('^'+q.id.replace('.','\\.')+' \\|','m'),q.id);
});
