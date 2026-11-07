"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const bank=require("../../apchem-unit9-practice/data.js"),M=require("../../shared/zsa-practice-model.js");
const byId=id=>bank.questions.find(q=>q.id===id),raw=q=>q.display.replace(/−/g,"-");
test("66 original bilingual questions preserve eleven exact CED titles and distinct decimal IDs",()=>{
 const en=["Introduction to Entropy","Absolute Entropy and Entropy Change","Gibbs Free Energy and Thermodynamic Favorability","Thermodynamic and Kinetic Control","Free Energy and Equilibrium","Free Energy of Dissolution","Coupled Reactions","Galvanic (Voltaic) and Electrolytic Cells","Cell Potential and Free Energy","Cell Potential Under Nonstandard Conditions","Electrolysis and Faraday's Law"];
 const es=["Introducción a la entropía","Entropía absoluta y cambio de entropía","Energía libre de Gibbs y favorabilidad termodinámica","Control termodinámico y control cinético","Energía libre y equilibrio","Energía libre de disolución","Reacciones acopladas","Celdas galvánicas (voltaicas) y electrolíticas","Potencial de celda y energía libre","Potencial de celda en condiciones no estándar","Electrólisis y ley de Faraday"];
 assert.deepEqual(bank.topics,en.map((t,i)=>({id:`9.${i+1}`,title:{en:`9.${i+1} ${t}`,es:`9.${i+1} ${es[i]}`}})));
 assert.equal(bank.questions.length,66);assert.equal(new Set(bank.questions.map(q=>q.id)).size,66);
 for(const lang of ["en","es"])assert.equal(new Set(bank.questions.map(q=>q.prompt[lang])).size,66);
 for(const t of bank.topics){const qs=M.makeSet(bank.questions,t.id,()=>0).map(e=>e.question);assert.equal(qs.length,6);assert.ok(qs.every(q=>q.topic===t.id));assert.equal(qs.filter(q=>q.type==="mc").length,4);assert.equal(qs.filter(q=>q.type==="numeric").length,2);}
 assert.equal(M.makeSet(bank.questions,"mixed",()=>0).length,66);
});
test("132 distractors have individual bilingual explanations with formula, sign and number parity",()=>{
 function pair(p,id){assert.ok(p.en&&p.es,id);for(const t of [p.en,p.es]){assert.doesNotMatch(t,/[\u2013\u2014]|[₀-₉⁰¹²³⁴⁵⁶⁷⁸⁹]|<(?!(?:\/?su[bp])>)[a-z]/i,id);for(const tag of ["sub","sup"])assert.equal((t.match(new RegExp(`<${tag}>`,"g"))||[]).length,(t.match(new RegExp(`</${tag}>`,"g"))||[]).length,id);}
 assert.deepEqual(p.en.match(/<su[bp]>.*?<\/su[bp]>/g),p.es.match(/<su[bp]>.*?<\/su[bp]>/g),id+" formulas");
 assert.deepEqual((p.en.match(/[+−-]?\d+(?:\.\d+)?/g)||[]).sort(),(p.es.match(/[+−-]?\d+(?:\.\d+)?/g)||[]).sort(),id+" signed numbers");}
 let wrong=0;for(const q of bank.questions){pair(q.prompt,q.id);pair(q.explanation,q.id);if(q.type!=="mc")continue;assert.equal(q.choices.length,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);for(const lang of ["en","es"]){assert.equal(new Set(q.choices.map(c=>c.text[lang])).size,4,q.id);assert.equal(new Set(q.choices.filter((_,i)=>i!==q.answer).map(c=>c.why[lang])).size,3,q.id);}q.choices.forEach((c,i)=>{pair(c.text,q.id);if(i!==q.answer){pair(c.why,q.id);wrong++;}});}assert.equal(wrong,132);
});
test("22 numeric keys independently solve entropy, Gibbs, equilibrium, cell and electrolysis calculations",()=>{
 const expected={
 "9.1-5":[188.8-69.9,"J/(mol·K)",{decimals:1}],"9.1-6":[160.7-282.7,"J/(mol·K)",{decimals:1}],
 "9.2-5":[2*192.8-(191.6+3*130.7),"J/(mol·K)",{decimals:1}],"9.2-6":[2*69.9-(2*130.7+205),"J/(mol·K)",{decimals:1}],
 "9.3-5":[60-298*100/1000,"kJ/mol",{decimals:1}],"9.3-6":[60000/100,"K",{sf:3}],
 "9.4-5":[2*(-46.1)-298*(2*192.8-191.6-3*130.7)/1000,"kJ/mol",{decimals:1}],"9.4-6":[80-45,"kJ/mol",{decimals:1}],
 "9.5-5":[-8.314*298*Math.log(25)/1000,"kJ/mol",{sf:3}],"9.5-6":[Math.exp(5000/(8.314*298)),"ratio",{sf:3}],
 "9.6-5":[15-298*80/1000,"kJ/mol",{decimals:1}],"9.6-6":[-30-500*(-50)/1000,"kJ/mol",{decimals:1}],
 "9.7-5":[25-40,"kJ/mol",{decimals:1}],"9.7-6":[32-2*20,"kJ/mol",{decimals:1}],
 "9.8-5":[.0100*2,"mol",{sf:3}],"9.8-6":[.34-(-.76),"V",{decimals:2}],
 "9.9-5":[-2*96485*1.10/1000,"kJ/mol",{sf:3}],"9.9-6":[-.76-(+.34),"V",{decimals:2}],
 "9.10-5":[1.10-(8.314*298/(2*96485))*Math.log(100),"V",{decimals:2}],"9.10-6":[1.10-(8.314*298/(2*96485))*Math.log(.0100),"V",{decimals:2}],
 "9.11-5":[(2*1930/96485)/2*63.55,"g",{sf:3}],"9.11-6":[(1.08/107.87)*96485/.500,"s",{sf:3}]};
 assert.equal(Object.keys(expected).length,22);assert.equal(bank.questions.filter(q=>q.type==="numeric").length,22);
 let signs=0;for(const [id,[value,unit,precision]] of Object.entries(expected)){const q=byId(id);assert.ok(Math.abs(q.value-value)<=Math.abs(value)*1e-12,id);assert.equal(q.unit,unit,id);assert.deepEqual(q.precision,precision,id);assert.ok(M.inspect(q,raw(q),unit).correct,id+" display");assert.ok(M.inspect(q,raw(q),unit).precisionOK,id+" precision");assert.ok(M.inspect(q,String(value),unit).correct,id+" exact");assert.equal(M.inspect(q,raw(q),"wrong").correct,false,id+" unit");assert.equal(M.inspect(q,"0",unit).correct,false,id+" zero");assert.equal(M.inspect(q,String(-value),unit).correct,false,id+" wrong sign");for(const sign of [-1,1]){assert.ok(M.inspect(q,String(value+sign*q.tolerance*.99),unit).correct,id+" inside");assert.equal(M.inspect(q,String(value+sign*q.tolerance*1.01),unit).correct,false,id+" outside");}
 if(q.explanation.en.includes("Required sign:")){signs++;assert.match(q.display,/^[+−]/,id);assert.ok(q.explanation.en.includes(`Required sign: ${value>0?"+":"−"}.`));assert.match(q.explanation.en,/The opposite sign is incorrect/);assert.match(q.explanation.es,/El signo opuesto es incorrecto/);}}
 assert.equal(signs,16);assert.equal(bank.questions.filter(q=>q.topic==="9.10"&&q.type==="numeric").length,2);
 for(const id of ["9.3-5","9.4-5","9.5-5","9.6-5","9.6-6","9.9-5"]){const q=byId(id);assert.equal(M.inspect(q,String(q.value*1000),q.unit).correct,false,id);assert.match(q.explanation.en,/J\/kJ check/);assert.match(q.explanation.es,/Comprobación de J\/kJ/);}
});
test("44 multiple-choice keys agree with the independent thermodynamics and electrochemistry audit",()=>{
 const expected=[
 ["ΔS: +","ΔS: −","More energy microstates become accessible.","It increases."],
 ["S° is not defined as zero; ΔH°f is defined as zero.","A perfect crystal at 0 K","Coefficient-weighted product sum minus reactant sum","+198.1 J/(mol·K)"],
 ["At all positive temperatures","At no positive temperature under this approximation","Sufficiently low temperature","−20.0 kJ/mol; thermodynamically favorable"],
 ["It is thermodynamically favorable but has a high activation barrier.","The approach to equilibrium is faster, with the same ΔG° and K.","The product formed through the faster pathway","The more thermodynamically stable product is favored."],
 ["K > 1","0 < K < 1","ΔG = 0; there is no net driving force.","The reverse direction; forward ΔG has a + sign."],
 ["A positive entropy contribution can outweigh the positive enthalpy.","Gas dissolution can have ΔS° with a − sign.","ΔS° can have a − sign despite ion dispersal.","ΔG° has a − sign; the rate is not determined."],
 ["Add the ΔG° values for the equations as combined.","The processes need a physical coupling mechanism.","External energy can drive the chemical process.","−24.0 kJ/mol"],
 ["Anode: oxidation; cathode: reduction","From the zinc anode to the copper cathode","Anions toward the anode; cations toward the cathode","Galvanic produces electrical work; electrolytic requires external electrical work."],
 ["E° remains unchanged.","ΔG°: −","+1.56 V","ΔG° has a + sign; external work is required to drive that direction."],
 ["E < E°","E > E°","+0.00 V","E decreases."],
 ["2.00 A","0.100 mol","Negative cathode","1.80 × 10<sup>2</sup> C"]];
 expected.forEach((row,i)=>row.forEach((a,j)=>{const q=byId(`9.${i+1}-${j+1}`);assert.equal(q.choices[q.answer].text.en,a,q.id);}));
 const coefficient=byId("9.9-3").choices.find(c=>c.text.en==="+2.36 V");assert.match(coefficient.why.en,/Coefficient error: do not multiply/);assert.match(coefficient.why.es,/Error de coeficiente/);
 assert.match(byId("9.3-4").choices.find(c=>c.text.en.startsWith("−79940")).why.en,/J\/kJ error/);
});
test("sign boundaries, Gibbs-equilibrium consistency and Faraday stoichiometry hold",()=>{
 assert.ok(60-500*.1>0);assert.ok(60-700*.1<0);assert.equal(60-600*.1,0);
 assert.ok(byId("9.5-6").value>1);assert.ok(byId("9.5-5").value<0);
 const q=byId("9.9-5");assert.ok(Math.abs(q.value*1000+2*96485*byId("9.8-6").value)<1e-9);
 assert.ok(byId("9.10-5").value<1.10);assert.ok(byId("9.10-6").value>1.10);
 const eqK=Math.exp(2*96485*1.10/(8.314*298));assert.ok(Math.abs(1.10-(8.314*298/(2*96485))*Math.log(eqK))<1e-14);
 assert.ok(Math.abs(byId("9.11-5").value/63.55*2*96485-2*1930)<1e-9);
});
test("new units, reference values and scoped models preserve the shared engine contract",()=>{
 assert.deepEqual(bank.units.map(u=>u.id),["J/(mol·K)","kJ/mol","K","V","C","A","s","g","mol","ratio"]);
 assert.deepEqual(bank.units.find(u=>u.id==="ratio").label,{en:"no units",es:"sin unidades"});
 const html=fs.readFileSync("apchem-unit9-practice/index.html","utf8");assert.match(html,/data-zsa-activity="apchem-unit9-practice" data-zsa-practice="zsa-u9"/);
 assert.deepEqual([...html.matchAll(/<script src="([^?]+)[^"]*" defer>/g)].map(m=>m[1]),["../shared/zsa-embed.js","../shared/zsa-i18n.js","data.js","../shared/zsa-practice-model.js","../shared/zsa-practice.js","../shared/zsa-header.js","../shared/zsa-about.js"]);
 for(const flag of ["free","cell"]){assert.match(html,new RegExp(`data-zsa-practice-visual="${flag}" hidden`));assert.ok(bank.questions.some(q=>q[flag]));}
 for(const term of ["ΔS°rxn = Σ S°(products) − Σ S°(reactants)","ΔG° = ΔH° − TΔS°","ΔG° = −RT ln K","ΔG° = −nFE°","E°cell = E°(cathode) − E°(anode)","E = E° − (RT/nF) ln Q","I = q/t","8.314 J/(mol·K)","96,485 C/mol e<sup>−</sup>","not zero, unlike ΔH°f","69.9","188.8","160.7","282.7","191.6","130.7","205.0","192.8","−46.1","−0.76","+0.34","+0.80","63.55","107.87"])assert.ok(html.includes(term),term);
 const css=fs.readFileSync("apchem-unit9-practice/diagrams.css","utf8");for(const line of css.split("\n").filter(l=>l.trim()&&!l.startsWith("/*")))assert.ok(line.startsWith(".zsa-u9 "),line);
 const audit=fs.readFileSync("apchem-unit9-practice/TESTING.md","utf8");for(const q of bank.questions)assert.ok(audit.includes(q.id+" |"),q.id);
});
