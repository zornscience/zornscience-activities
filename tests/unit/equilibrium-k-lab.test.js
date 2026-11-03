'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const M=require('../../equilibrium-k-lab/chem.js'),R=M.REACTIONS;
function near(a,b,tol=1e-8){assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b}`);}
function relative(a,b,tol=.01){near(a/b,1,tol);}
test('7.7 exact H2/I2 equilibrium and equilibrium quotient',()=>{const e=M.solve(R.hi,[.2,.2,0],49);near(e.x,.1556,.00005);near(e.values[0],.0444,.00005);near(e.values[1],.0444,.00005);near(e.values[2],.311,.0005);near(M.quotient(R.hi,[.0222,.0222,.156]),49.4,.05);});
test('molarity, pressure and Chemistry equilibrium reference values',()=>{
 const moles=[.18,.04,.04];near(M.quotient(R.pcl5,moles.map(v=>v/2)),.00444,.000005);near(M.quotient(R.pcl5,moles),.00889,.000005);
 const reverse={...R.n2o4,nu:[1,-2]};near(M.quotient(reverse,[.420,.250]),6.72);
 near(M.quotient(R.n2o4,[.08,.04]),.0200);near(M.quotient(R.co,[.2,.2,.3,.3]),2.25);
 near(M.quotient(R.pcl5,[.2,.1,.1]),.05);near(M.quotient(R.nh3,[.25,.15,.05]),2.96,.005);
});
test('Q predictions and 7.10 species and volume stresses',()=>{
 const q=M.quotient(R.n2o4,[.2,.05]);near(q,.0125);assert.equal(M.shift(q,.0046),'left');
 near(M.quotient(R.hi,[.2,.1,.707]),25,.01);assert.equal(M.shift(M.quotient(R.hi,[.2,.1,.707]),50),'right');
 near(M.quotient(R.n2o4,[.2,.04]),.008);near(M.quotient(R.n2o4,[.4,.08]),.016);assert.equal(M.shift(.016,.008),'left');
});
test('7.7 shortcut is separate, percent uses x, strict less than 5, failure falls back to exact',()=>{
 const s=M.shortcut(R.no,[.8,.2,0],1e-5),e=M.solve(R.no,[.8,.2,0],1e-5);near(s.values[2],.0013,.00005);near(s.percent,.32,.005);assert.equal(s.valid,true);assert.equal(s.values[2].toPrecision(2),e.values[2].toPrecision(2));
 const fail=M.shortcut(R.n2o4,[.1,0],.02);assert.equal(fail.valid,false);near(M.solve(R.n2o4,[.1,0],.02).q,.02);
 const boundary=M.shortcut(R.ab,[1,0],.05);assert.equal(boundary.percent,5);assert.equal(boundary.valid,false);
});
test('7.6 reverse, scale, half power and multiply constants with cancellation',()=>{
 near(Math.pow(.06,-1),16.7,.05);near(Math.sqrt(250),15.8,.05);relative(2e-25*6.4e9,1.3e-15,.02);
 const c=M.combine([{net:{A:-1,B:1},k:6.8e-4,scale:2},{net:{C:-1,B:2},k:3.8e-6,scale:-1}]);assert.deepEqual(c.net,{A:-2,C:1});near(c.k,.12,.005);
});
test('7.8 particles retain mole scale and A/B nonzero products at small K',()=>{
 near(M.quotient(R.xy,[.2,.2,.6]),9);const e=M.solve(R.ab,[1,0],4);near(e.values[0]/.1,2);near(e.values[1]/.1,8);assert.ok(M.solve(R.ab,[1,0],1e-4).values[1]>0);
});
test('Ksp pure water and ion ratios',()=>{
 relative(M.solubility('agbr','',0).s,7.1e-7);relative(M.solubility('pbi2','',0).s,1.3e-3,.04);
 relative(4*Math.pow(2.1e-4,3),3.7e-11,.002);
 relative(M.solubility('ag2cro4','',0).s,6.5e-5);relative(M.solubility('agcl','',0).s,1.3e-5,.04);
 assert.ok(M.solubility('ag2cro4','',0).s>M.solubility('agcl','',0).s);
});
test('common ions exact solutions including calcium and chromate source counts',()=>{
 relative(M.solubility('agcl','nacl',.1).s,1.8e-9);relative(M.solubility('pbi2','nai',.05).s,3.9e-6);
 // Exact CaF2 root rounds to 2.1e-5 at two significant figures. Lesson gives 2.2e-5.
 relative(M.solubility('caf2','ca_no3_2',.02).s,2.2e-5,.03);
 near(M.solubility('ag2cro4','na2cro4',.1).initial[1],.1);
 for(const id of Object.keys(M.SALTS))for(const source of Object.keys(M.SOURCES))for(const c of [0,.02,.5]){const salt=M.SALTS[id],e=M.solubility(id,source,c);relative(e.values.reduce((q,v,i)=>q*Math.pow(v,salt.nu[i]),1),salt.k,1e-12);assert.ok(e.s<=M.solubility(id,'',0).s*(1+1e-12));}
});
test('all reaction extents conserve stoichiometry, endpoints obey mass action and rate equality',()=>{
 for(const r of Object.values(R))for(const k of [1e-4,r.k,1e4]){const c=r.initial,e=M.solve(r,c,k);assert.ok(e.values.every(v=>v>=0));relative(e.q,k,1e-8);e.values.forEach((v,i)=>{if(M.active(r,i))near(v,c[i]+r.nu[i]*e.x,1e-12);else near(v,c[i]);});const rates=M.rates(r,e.values,k);relative(rates[0],rates[1],1e-8);const trajectory=M.trajectory(r,c,k);assert.deepEqual(trajectory.at(-1).values,e.values);assert.deepEqual(trajectory[0].values,c);}
 near(M.solve(R.caco3,[.001,50,0],.22).values[2],.22);near(M.solve(R.caco3,[100,0,0],.22).values[2],.22);
 assert.equal(M.solve(R.hi,[0,0,0],49).empty,true);assert.equal(M.shift(NaN,1),'undefined');assert.throws(()=>M.solve(R.hi,[-1,0,0],1),RangeError);
});
test('temperature changes only K immediately and respects thermochemical direction',()=>{assert.ok(M.temperature(.0046,57.2,298.15,323.15)>.0046);assert.ok(M.temperature(250,-98.9,298.15,323.15)<250);near(M.temperature(M.temperature(1,57.2,298.15,323.15),57.2,323.15,298.15),1);});
test('safe linear parser accepts lesson algebra and rejects nonlinear or executable input',()=>{
 for(const [text,a,b] of [['-x',0,-1],['+x',0,1],['+2x',0,2],['-3x',0,-3],['0.100 - x',.1,-1],['0.050 + 2x',.05,2],['2x',0,2],['− x',0,-1],['\u2013x',0,-1],['+.050 + 2 · x',.05,2],['2*x + .1',.1,2],['x+x-x',0,1],['1.0 × 10⁻⁵',1e-5,0],['-1e-3 + x',-.001,1]])assert.deepEqual(M.parseLinear(text),{a,b},text);
 for(const text of ['', 'x*x','x²','x/2','sin(x)','2x(1+x)','x;alert(1)','constructor','2 3x','--x','0x10','Infinity','NaN','1e999','2*','x +','x y', 'x'.repeat(161)])assert.equal(M.parseLinear(text),null,text);
});
test('RICE N2O4 algebra, numeric alternatives, x and K use the lesson values',()=>{
 const initial=[.100,0],extent=.0200,nu=[-1,2];
 for(const [row,answers] of [['I',['0.100','0']],['C',['-x','+2x']],['E',['0.100 - x','2x']]])answers.forEach((answer,i)=>assert.ok(M.checkICECell(answer,row,initial[i],nu[i],extent,3),row+' '+answer));
 assert.ok(M.matchesNumber('.0200',extent,3));near(M.quotient(R.n2o4,M.at(R.n2o4,initial,extent)),.0200);
 assert.ok(M.checkICECell('-.0200','C',.1,-1,extent,3));assert.ok(M.checkICECell('.0800','E',.1,-1,extent,3));
 assert.equal(M.checkICECell('.120 - 2x','E',.1,-1,extent,3),false);assert.equal(M.checkICECell('.1005 - x','E',.1,-1,extent,3),false);
 assert.equal(M.checkICECell('+x','C',.1,-1,extent,3),false);
 assert.ok(M.checkICECell('+x','C',.2,-1,-.01,3));assert.ok(M.checkICECell('.2 + x','E',.2,-1,-.01,3));
});
test('scientific display keeps significant figures and never uses e notation',()=>{
 for(const [value,digits,expected] of [[1.8e-10,2,'1.8 × 10⁻¹⁰'],[1.341640786e-5,2,'1.3 × 10⁻⁵'],[1e-5,2,'1.0 × 10⁻⁵'],[.05,2,'0.050'],[.1,3,'0.100'],[.001,3,'0.00100'],[10000,3,'1.00 × 10⁴'],[9999,3,'1.00 × 10⁴'],[-.000002,3,'−2.00 × 10⁻⁶'],[0,3,'0']])assert.equal(M.format(value,digits),expected);
 for(const v of [.2,49,4.6e-3,1.8e-10,1e8])near(M.parseNumber(M.format(v,3)),Number(v.toPrecision(3)),Math.abs(v)*1e-12);
});
test('nice graph scales use round 1, 2, 5 steps and cover every value',()=>{
 assert.deepEqual(M.niceScale(.311*1.08).ticks,[0,.1,.2,.3,.4]);
 for(const max of [.00000013,.0049,.18,1.01,80,18000]){const scale=M.niceScale(max),mantissa=scale.step/Math.pow(10,Math.floor(Math.log10(scale.step)));assert.ok([1,2,5,10].some(n=>Math.abs(n-mantissa)<1e-9));assert.ok(scale.max>=max);assert.ok(scale.ticks.length<=6);}
});
test('common-ion shortcut includes stoichiometry and separately reports its 5 percent validity',()=>{
 const shortcut=M.solubilityShortcut('caf2','ca_no3_2',.020),exact=M.solubility('caf2','ca_no3_2',.020);
 assert.equal(M.format(shortcut.s,2),'2.2 × 10⁻⁵');assert.equal(M.format(exact.s,2),'2.1 × 10⁻⁵');assert.equal(shortcut.valid,true);near(shortcut.percent,100*shortcut.s/.020);
 assert.equal(M.solubilityShortcut('agcl','nacl',1e-7).valid,false);
 assert.equal(M.solubilityShortcut('agcl','nai',.1),null);assert.equal(M.solubilityShortcut('agcl','nacl',0),null);
 relative(M.solubilityShortcut('pbi2','nai',.05).s,3.92e-6,1e-12);
});
