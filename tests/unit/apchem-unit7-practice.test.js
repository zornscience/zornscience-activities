"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const bank=require("../../apchem-unit7-practice/data.js");
const M=require("../../shared/zsa-practice-model.js");
const byId=id=>bank.questions.find(q=>q.id===id);

test("72 original bilingual questions preserve twelve exact CED topics and distinct decimal IDs",()=>{
  const en=["Introduction to Equilibrium","Direction of Reversible Reactions","Reaction Quotient and Equilibrium Constant","Calculating the Equilibrium Constant","Magnitude of the Equilibrium Constant","Properties of the Equilibrium Constant","Calculating Equilibrium Concentrations","Representations of Equilibrium","Introduction to Le Châtelier's Principle","Reaction Quotient and Le Châtelier's Principle","Introduction to Solubility Equilibria","Common-Ion Effect"];
  const es=["Introducción al equilibrio","Dirección de las reacciones reversibles","Cociente de reacción y constante de equilibrio","Cálculo de la constante de equilibrio","Magnitud de la constante de equilibrio","Propiedades de la constante de equilibrio","Cálculo de concentraciones en el equilibrio","Representaciones del equilibrio","Introducción al principio de Le Châtelier","Cociente de reacción y principio de Le Châtelier","Introducción a los equilibrios de solubilidad","Efecto del ion común"];
  assert.deepEqual(bank.topics,en.map((t,i)=>({id:`7.${i+1}`,title:{en:`7.${i+1} ${t}`,es:`7.${i+1} ${es[i]}`}})));
  assert.equal(bank.questions.length,72);
  assert.equal(new Set(bank.questions.map(q=>q.id)).size,72);
  for(const lang of ["en","es"])assert.equal(new Set(bank.questions.map(q=>q.prompt[lang])).size,72);
  for(const topic of bank.topics){
    const set=M.makeSet(bank.questions,topic.id,()=>0).map(e=>e.question);
    assert.equal(set.length,6,topic.id);assert.ok(set.every(q=>q.topic===topic.id));
    assert.equal(set.filter(q=>q.type==="mc").length,4);assert.equal(set.filter(q=>q.type==="numeric").length,2);
  }
  assert.equal(M.makeSet(bank.questions,"mixed",()=>0).length,72);
});

test("all 144 distractors have distinct bilingual feedback with matching notation and numbers",()=>{
  function parity(pair,id){
    assert.ok(pair.en && pair.es,id);
    for(const text of [pair.en,pair.es]){
      assert.doesNotMatch(text,/[\u2013\u2014]|[₀-₉⁰¹²³⁴⁵⁶⁷⁸⁹]|→|<(?!(?:\/?su[bp])>)[a-z]/i,id);
      assert.equal((text.match(/<sub>/g)||[]).length,(text.match(/<\/sub>/g)||[]).length,id);
      assert.equal((text.match(/<sup>/g)||[]).length,(text.match(/<\/sup>/g)||[]).length,id);
    }
    assert.deepEqual(pair.en.match(/<su[bp]>.*?<\/su[bp]>/g),pair.es.match(/<su[bp]>.*?<\/su[bp]>/g),id+" markup");
    assert.deepEqual(pair.en.match(/\d+(?:\.\d+)?/g),pair.es.match(/\d+(?:\.\d+)?/g),id+" numbers");
  }
  let wrong=0;
  for(const q of bank.questions){
    parity(q.prompt,q.id);parity(q.explanation,q.id);
    if(q.type!=="mc")continue;
    assert.equal(q.choices.length,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    for(const lang of ["en","es"]){
      assert.equal(new Set(q.choices.map(c=>c.text[lang])).size,4,q.id);
      assert.equal(new Set(q.choices.filter((_,i)=>i!==q.answer).map(c=>c.why[lang])).size,3,q.id);
    }
    q.choices.forEach((c,i)=>{parity(c.text,q.id);if(i!==q.answer){parity(c.why,q.id);wrong++;}});
  }
  assert.equal(wrong,144);
});

test("24 numeric keys independently solve mass action, ICE, gas and solubility calculations",()=>{
  const expected={
    "7.1-5":[0.0240,"M/s",3],"7.1-6":[0.400,"M",3],
    "7.2-5":[0.600**2/(0.200*0.300),"ratio",3],"7.2-6":[0.0400**2/0.0800,"ratio",3],
    "7.3-5":[0.200**2/(0.400*0.100),"ratio",3],"7.3-6":[0.500/(0.08206*400.0)**(1+3-2),"ratio",3],
    "7.4-5":[0.600**2/(0.200*0.200),"ratio",3],"7.4-6":[0.100**2/(0.500-0.100),"ratio",3],
    "7.5-5":[0.500*4.00/(1+4.00),"M",3],"7.5-6":[0.0200*0.500,"M",3],
    "7.6-5":[1/0.0400,"ratio",3],"7.6-6":[2.50*0.0400,"ratio",3],
    "7.7-5":[2*0.0100*0.100/(0.0100+Math.sqrt(0.0100**2+4*0.0100*0.100)),"M",3],
    "7.7-6":[Math.sqrt(2.00e-9*0.200),"M",3],
    "7.8-5":[(6*0.100)/(2*0.100),"ratio",3],"7.8-6":[(5-3)*2,"count",0],
    "7.9-5":[2.00*0.150,"M",3],"7.9-6":[9.00*2**2/(2*2),"ratio",3],
    "7.10-5":[0.200**2/0.100,"ratio",3],"7.10-6":[0.600/0.400,"ratio",3],
    "7.11-5":[Math.sqrt(1.80e-10),"M",3],"7.11-6":[Math.cbrt(3.20e-11/4),"M",3],
    "7.12-5":[1.80e-10/0.0100,"M",3],"7.12-6":[3.20e-11/0.100**2,"M",3]
  };
  assert.equal(bank.questions.filter(q=>q.type==="numeric").length,24);
  assert.equal(Object.keys(expected).length,24);
  for(const [id,[value,unit,sf]] of Object.entries(expected)){
    const q=byId(id);
    assert.ok(Math.abs(q.value-value)<=Math.abs(value)*1e-12,id);
    assert.equal(q.unit,unit,id);assert.deepEqual(q.precision,sf?{sf}:{exact:true},id);
    assert.ok(M.inspect(q,q.display,unit).correct,id+" display");
    assert.ok(M.inspect(q,q.display,unit).precisionOK,id+" precision");
    assert.ok(M.inspect(q,String(value),unit).correct,id+" unrounded");
    assert.equal(M.inspect(q,q.display,"wrong").correct,false,id+" wrong unit");
    assert.equal(M.inspect(q,"0",unit).correct,false,id+" zero");
    assert.equal(M.inspect(q,String(-value),unit).correct,false,id+" negative");
    if(sf)for(const sign of [-1,1]){
      assert.ok(M.inspect(q,String(value+sign*q.tolerance*0.99),unit).correct,id+" inside");
      assert.equal(M.inspect(q,String(value+sign*q.tolerance*1.01),unit).correct,false,id+" outside");
    }
    else assert.equal(M.inspect(q,"4.0001",unit).correct,false,id+" exact");
  }
  assert.ok(M.inspect(byId("7.1-5"),"0.0240 M/s","M/s").correct);
  assert.ok(M.inspect(byId("7.1-6"),"0.400 mol/L","M").correct);
  assert.equal(M.inspect(byId("7.2-5"),"6.000","ratio").precisionOK,false);
  assert.equal(M.inspect(byId("7.2-5"),"6.00 M","ratio").correct,false);
});

test("48 multiple-choice keys match the independent equilibrium answer audit",()=>{
  const expected=[
    ["The forward and reverse reactions continue at equal nonzero rates.","Both concentrations become constant, even though they are unequal.","When the rates become equal and remain equal","A changes to B while B changes to A at the same average rate."],
    ["To the right, producing B","The reverse reaction produces A.","B increases and A decreases.","There is dynamic equilibrium with no net shift."],
    ["Kc = [NH<sub>3</sub>]<sup>2</sup>/([N<sub>2</sub>][H<sub>2</sub>]<sup>3</sup>)","Kp = P(CO<sub>2</sub>)","[FeSCN<sup>2+</sup>]/([Fe<sup>3+</sup>][SCN<sup>−</sup>])","P(CO)P(H<sub>2</sub>)/P(H<sub>2</sub>O)"],
    ["Concentrations measured at equilibrium","0.0200","0.500","Kc = [H<sup>+</sup>][OH<sup>−</sup>]"],
    ["Products are favored at equilibrium, but the reaction speed is not given.","Reactants are favored at equilibrium; some products can still be present.","[B]<sup>2</sup> = [A]; the concentrations need not be equal.","Both remain unchanged."],
    ["4.00","2.00","A(g) ⇌ C(g), K = 15.0","25.0"],
    ["N<sub>2</sub>O<sub>4</sub>: −x; NO<sub>2</sub>: +2x","Yes; x is 2.0% of the initial concentration.","Reject the approximation and solve the full equilibrium equation.","Discard it because it gives a negative concentration."],
    ["One pair dissociates into two singles, conserving atoms.","Individual particles interconvert in both directions.","The average forward and reverse reaction rates","Right, because Qc = 0.100 < Kc"],
    ["B was added, causing a shift to the left.","It shifts right; K stays unchanged.","A shift left and a smaller K","Adding a catalyst or adding an inert gas"],
    ["Q > K, so the reaction shifts left.","Qp falls below Kp and the reaction shifts right.","Q decreases below K, causing a shift right.","Qp and Kp remain equal, so there is no shift."],
    ["Ksp = [Ag<sup>+</sup>][Cl<sup>−</sup>]","Ksp = s(2s)<sup>2</sup> = 4s<sup>3</sup>","A precipitate forms because Qsp > Ksp.","No precipitate forms; added salt could dissolve further."],
    ["AgCl molar solubility decreases while Ksp stays unchanged.","There is no common-ion decrease in AgCl solubility.","Ksp = s(0.100 + 2s)<sup>2</sup>","They stay unchanged, as does Ksp."]
  ];
  assert.equal(bank.questions.filter(q=>q.type==="mc").length,48);
  expected.forEach((row,i)=>row.forEach((answer,j)=>{const q=byId(`7.${i+1}-${j+1}`);assert.equal(q.choices[q.answer].text.en,answer,q.id);}));
});

test("ICE approximations pass independent checks and exact solutions round to accepted answers",()=>{
  const q=byId("7.7-5"),x=q.value;
  assert.ok(Math.abs(x*x/(.100-x)-.0100)<1e-14);
  assert.ok(Math.sqrt(.0100*.100)/.100>.05);
  const small=byId("7.7-6"),ks=2e-9,c=.2;
  const exact=2*ks*c/(ks+Math.sqrt(ks*ks+4*ks*c));
  assert.ok(small.value/c<.05);assert.ok(M.inspect(small,String(exact),"M").correct);
  const ag=byId("7.12-5"),k=1.8e-10,cl=.01;
  const agExact=2*k/(cl+Math.sqrt(cl*cl+4*k));
  assert.ok(ag.value/cl<.05);assert.ok(M.inspect(ag,String(agExact),"M").correct);
  const ca=byId("7.12-6");let lo=0,hi=1e-6;
  for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(mid*(.1+2*mid)**2>3.2e-11)hi=mid;else lo=mid;}
  assert.ok(2*ca.value/.1<.05);assert.ok(M.inspect(ca,String((lo+hi)/2),"M").correct);
  assert.ok(2e-5*1e-5>1.8e-10); // After-mixing ion product predicts precipitation.
  assert.ok(ag.value<byId("7.11-5").value);assert.ok(ca.value<byId("7.11-6").value);
});

test("page preserves the two-runtime-file contract with translated models and reference patterns",()=>{
  const html=fs.readFileSync("apchem-unit7-practice/index.html","utf8");
  assert.match(html,/data-zsa-activity="apchem-unit7-practice" data-zsa-practice="zsa-u7"/);
  assert.deepEqual([...html.matchAll(/<script src="([^?]+)[^"]*" defer>/g)].map(m=>m[1]),["../shared/zsa-seo.js","../shared/zsa-embed.js","../shared/zsa-i18n.js","data.js","../shared/zsa-practice-model.js","../shared/zsa-practice.js","../shared/zsa-header.js","../shared/zsa-about.js"]);
  assert.deepEqual(fs.readdirSync("apchem-unit7-practice").sort(),["README.md","TESTING.md","data.js","diagrams.css","index.html"]);
  const flags={curve:["7.1-2","7.1-6"],rates:["7.1-3"],stress:["7.9-1"],particles:["7.8-1"]};
  for(const [flag,ids] of Object.entries(flags)){
    assert.deepEqual(bank.questions.filter(q=>q[flag]).map(q=>q.id),ids);
    const figure=html.match(new RegExp('<figure id="zsa-u7-'+flag+'"[\\s\\S]*?</figure>'))[0];
    assert.match(figure,new RegExp('data-zsa-practice-visual="'+flag+'" hidden'));
    assert.match(figure,/role="img" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
    for(const m of figure.matchAll(/<(?:title|desc|figcaption)(?: id="[^"]+")?>([^<]+)</g))assert.ok(bank.copy.es[m[1]],m[1]);
  }
  const particles=html.match(/<figure id="zsa-u7-particles"[\s\S]*?<\/figure>/)[0];
  assert.equal([...particles.matchAll(/<circle /g)].length,10);
  for(const text of ["Kc = [C]<sup>c</sup>[D]<sup>d</sup> / ([A]<sup>a</sup>[B]<sup>b</sup>)","K′ = 1/K","K′ = K<sup>n</sup>","K = K<sub>1</sub> × K<sub>2</sub>","Kp = Kc(RT)<sup>Δn</sup>","0.08206 L·atm/(mol·K)","Ksp = [Ca<sup>2+</sup>][F<sup>−</sup>]<sup>2</sup> = 4s<sup>3</sup>"])
    assert.ok(html.includes(text),text);
  assert.equal(bank.units.find(u=>u.id==="ratio").label.es,"sin unidades");
});

test("AP Spanish glossary, notation and worked records cover the entire bank",()=>{
  const spanish=JSON.stringify(bank.questions.map(q=>[q.prompt.es,q.explanation.es,...(q.choices||[]).flatMap(c=>[c.text.es,c.why.es])])).toLowerCase();
  for(const term of ["equilibrio dinámico","reacción reversible","reacción directa","inversa","cociente de reacción (q)","constante de equilibrio (k)","kc","kp","ley de acción de masas","tabla ice (inicial, cambio, equilibrio)","desplazamiento","a la derecha","a la izquierda","perturbación","principio de le châtelier","producto de solubilidad (ksp)","solubilidad molar","efecto del ion común","solución saturada","se favorecen los productos","se favorecen los reactivos","precipitado"])assert.ok(spanish.includes(term),term);
  assert.doesNotMatch(spanish,/\brice\b|(?:^|[^\p{L}])ión(?:[^\p{L}]|$)|\(ac\)|usted|vosotros/u);
  const worked=fs.readFileSync("apchem-unit7-practice/TESTING.md","utf8");
  for(const q of bank.questions)assert.match(worked,new RegExp('^'+q.id.replace('.','\\.')+' \\|','m'),q.id);
});
