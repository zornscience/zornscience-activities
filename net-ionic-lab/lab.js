(function () {
  "use strict";
// Markup is generated exclusively from the fixed reagent library below.
function setMarkup(target, markup) {
 const svg=target.namespaceURI==='http://www.w3.org/2000/svg';
 const parsed=new DOMParser().parseFromString(svg?'<svg xmlns="http://www.w3.org/2000/svg">'+markup+'</svg>':markup,svg?'image/svg+xml':'text/html');
 const source=svg?parsed.documentElement:parsed.body;
 target.replaceChildren(...Array.from(source.childNodes, node=>document.importNode(node,true)));
}
const reagents={nacl:['Sodium chloride','NaCl','1 M','#e2f3f5'],cu:['Copper(II) sulfate','CuSO₄','0.1 M','#309ed6'],pb:['Lead(II) nitrate','Pb(NO₃)₂','0.1 M','#e2f3f5'],ag:['Silver nitrate','AgNO₃','0.1 M','#e2f3f5'],ca:['Calcium chloride','CaCl₂','0.1 M','#e2f3f5'],fe:['Iron(III) nitrate','Fe(NO₃)₃','0.1 M','#e4bd56'],oh:['Sodium hydroxide','NaOH','1 M','#e2f3f5'],zn:['Zinc','Zn','solid','#a4adb5']};
const trials=[
['nacl','cu',null,'#65b9df','The mixture stays transparent and blue, paler than the original copper(II) sulfate solution. No precipitate appears.','No net ionic reaction.','The ions remain dissolved. The blue solution is diluted when mixed with colorless sodium chloride.'],
['zn','pb','metal','#e2f3f5','A dark gray, crystalline lead coating grows on the zinc. Some zinc dissolves; the solution remains colorless.','Zn(s) + Pb²⁺(aq) → Zn²⁺(aq) + Pb(s)','Zinc transfers electrons to lead(II) ions. Lead metal deposits on the zinc surface; no gas is expected.'],
['ag','nacl','white','#e2f3f5','A white, curdy cloud appears immediately. Silver chloride particles gather and settle, leaving a clearer liquid above.','Ag⁺(aq) + Cl⁻(aq) → AgCl(s)','Silver chloride has very low solubility. Sodium and nitrate ions remain in solution.'],
['ca','fe',null,'#e8cf88','The mixture remains transparent and pale yellow. No solid or gas appears.','No net ionic reaction.','The salts remain soluble. The iron(III) solution becomes paler through dilution.'],
['fe','oh','brown','#e2f3f5','A rust-brown, gelatinous precipitate forms and slowly settles into loose clumps.','Fe³⁺(aq) + 3 OH⁻(aq) → Fe(OH)₃(s)','Iron(III) hydroxide is insoluble. Hydroxide is in excess at these solution concentrations.'],
['nacl','fe',null,'#e8cf88','The mixture stays transparent and pale yellow. No precipitate appears.','No net ionic reaction.','The ions remain dissolved under these conditions. Dilution can change the intensity of the yellow color.'],
['cu','fe',null,'#83bfa5','The two transparent solutions combine into a blue-green mixture. No solid forms.','No net ionic reaction.','The combined blue and yellow colors do not by themselves indicate a chemical reaction. These salts remain dissolved.'],
['pb','cu','white','#65b9df','A fine white lead(II) sulfate precipitate forms in a pale blue solution. The blue liquid remains above the settling solid.','Pb²⁺(aq) + SO₄²⁻(aq) → PbSO₄(s)','Lead(II) sulfate is sparingly soluble. Copper(II) ions remain dissolved and give the liquid its blue color.'],
['pb','nacl','white','#e2f3f5','A white crystalline precipitate forms and settles. The liquid above it remains colorless.','Pb²⁺(aq) + 2 Cl⁻(aq) → PbCl₂(s)','At room temperature and these concentrations, lead(II) chloride precipitates. Its appearance differs from the curdy silver chloride solid.'],
['cu','oh','blue','#e2f3f5','A light blue, gelatinous precipitate forms. Fluffy clumps gradually collect beneath the clearer liquid.','Cu²⁺(aq) + 2 OH⁻(aq) → Cu(OH)₂(s)','Copper(II) hydroxide is insoluble. Hydroxide is in excess at these solution concentrations.']
];
const $=id=>document.getElementById(id);let selected=0,stage='ready',start=0,raf=0,settling=0;let scene={a:0,b:0,metal:0,reaction:0,active:null,time:0};const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const name=t=>reagents[t[0]][0]+' + '+reagents[t[1]][0];
setMarkup($('reactions'),trials.map((t,i)=>`<button type="button" data-trial="${i}" aria-pressed="${i===0}"><span class="number">${String(i+1).padStart(2,'0')}</span><span>${name(t)}</span></button>`).join(''));
$('reactions').addEventListener('click',e=>{const b=e.target.closest('button');if(b){selected=Number(b.dataset.trial);reset();}});
function reset(){cancelAnimationFrame(raf);stage='ready';settling=0;scene={a:0,b:0,metal:0,reaction:0,active:null,time:0};$('mix').disabled=false;$('chemistry').open=false;$('phase').textContent='Ready to mix';$('progress').textContent='The beaker is empty. Ready to add the reagents.';$('observation-title').textContent='Before mixing';const t=trials[selected];$('mixture-title').textContent=name(t);$('observation-text').textContent=t.slice(0,2).map(k=>`${reagents[k][0]}: ${k==='zn'?'a silvery gray metal strip':k==='cu'?'a transparent blue solution':k==='fe'?'a transparent yellow solution':'a clear, colorless solution'}`).join('. ')+'.';$('equation').textContent=t[5];$('explanation').textContent=t[6];document.querySelectorAll('[data-trial]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));draw();}
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
function bottle(k,x,slot){
 const r=reagents[k], active=scene.active&&scene.active.slot===slot;
 const q=active?scene.active.q:0;
 const lift=ease(q/.24)*(1-ease((q-.78)/.22));
 const angle=(slot==='a'?66:-66)*lift;
 const mx=x+55+(slot==='a'?430-x-55:550-x-55)*lift;
 const my=120-10*lift;
 const amount=scene[slot];
 const baseY=105+amount*17;
 return `<ellipse cx="${x+55}" cy="347" rx="58" ry="9" fill="#061a2a" opacity="${.45*(1-lift)}"/>
 <g data-bottle="${slot}" transform="translate(${mx} ${my}) rotate(${angle}) translate(-55 -25)">
 <clipPath id="bottle-${slot}"><path d="M30 25V49Q5 63 5 85V240Q5 250 18 250H92Q105 250 105 240V85Q105 63 80 49V25Z"/></clipPath>
 <path d="M30 25V49Q5 63 5 85V240Q5 250 18 250H92Q105 250 105 240V85Q105 63 80 49V25Z" fill="url(#glass)" stroke="#a1c1cf" stroke-width="2"/>
 <g clip-path="url(#bottle-${slot})"><g transform="rotate(${-angle} 55 160)"><rect x="-260" y="${baseY}" width="640" height="500" fill="${r[3]}" opacity=".72"/><path d="M-260 ${baseY}H380" stroke="${r[3]}" stroke-width="3" opacity=".9"/></g></g>
 <rect x="12" y="135" width="86" height="77" rx="3" fill="#f7f5ed"/><rect x="12" y="135" width="86" height="6" fill="${k==='cu'?'#1e90bc':k==='fe'?'#b88a28':'#3c7375'}"/>
 <text x="55" y="166" text-anchor="middle" fill="#16384e" font-size="14" font-weight="600">${r[1]}</text><text x="55" y="188" text-anchor="middle" fill="#53636a" font-size="11">${r[2]}</text><path d="M17 88V127M17 218V235" stroke="white" stroke-width="4" opacity=".35"/>
 ${active?'<ellipse cx="55" cy="25" rx="25" ry="5" fill="#132e40" stroke="#c2dce4"/>':'<rect x="27" y="0" width="56" height="25" rx="4" fill="#132434" stroke="#59707e"/>'}</g>
 ${active?`<rect x="${x+118}" y="332" width="40" height="15" rx="3" fill="#132434" stroke="#59707e"/>`:''}`;
}
function draw(){const t=trials[selected],p=scene.reaction,mixed=p>0,volume=10*(scene.a+scene.b),level=370-volume*4.5,liquid=mixed?t[3]:reagents[scene.a>0?t[0]:t[1]][3];$('apparatus').setAttribute('data-volume',volume.toFixed(3));$('apparatus').setAttribute('data-metal',scene.metal.toFixed(3));$('apparatus').setAttribute('data-settling',settling.toFixed(3));let particles='';const solid=t[2];if(mixed&&solid&&solid!=='metal'){const color=solid==='brown'?'#a14e21':solid==='blue'?'#75cafa':'#f3f4eb';for(let i=0;i<100;i++){const seed=(Math.sin(i*87.31)*43758.5453)%1;const frac=Math.abs(seed);const x=408+(i*37%158);const suspendedY=level+12+((i*19+Math.floor(p*25))%Math.max(15,350-level));const fall=ease(clamp((settling-frac*.16)/.84));const y=suspendedY+(365+frac*6-suspendedY)*fall;particles+=`<ellipse cx="${x}" cy="${y}" rx="${2+frac*5}" ry="${1+frac*3}" fill="${color}" opacity="${Math.min(1,p*2)*.85}"/>`;}}
let metal='';
if(t[0]==='zn'&&scene.metal>0){
 const drop=ease(scene.metal),y=175+drop*145;
 metal=`<g data-zinc-strip="true" transform="translate(0 ${y-320})"><path d="M472 320l18 -4 13 48 -18 4Z" fill="url(#zinc)" stroke="#c2cbd0"/>`;
 if(mixed){for(let i=0;i<50;i++)metal+=`<path d="M${474+i%5*4} ${325+Math.floor(i/5)*4}l4 -3 3 5 -5 2Z" fill="${i%2?'#525c65':'#8c969e'}" opacity="${p}"/>`;}
 metal+='</g>';
 if(drop<1)metal+=`<path d="M475 ${y-10}L458 ${y-85}M490 ${y-10}L458 ${y-85}" stroke="#b9c7cf" stroke-width="4" fill="none"/>`;
}
let stream='';
if(scene.active&&scene.active.q>.24&&scene.active.q<.78){
 const left=scene.active.slot==='a',sx=left?430:550,ex=left?455:525;
 const width=3.5+Math.sin(scene.time*35)*.35;
 const color=reagents[t[left?0:1]][3];
 stream=`<g data-pour-stream="true"><path d="M${sx} 110Q${sx+(left?9:-9)} 130 ${ex} ${level}" fill="none" stroke="${color}" stroke-width="${width+2}" opacity=".25"/><path d="M${sx} 110Q${sx+(left?9:-9)} 130 ${ex} ${level}" fill="none" stroke="${color}" stroke-width="${width}" opacity=".8"/><path d="M${sx-1} 112Q${sx+(left?7:-11)} 130 ${ex-1} ${level-3}" fill="none" stroke="#f0fbff" stroke-width="1" opacity=".5"/></g>`;
}
let fluid='';
if(volume>0){
 const ripple=scene.active?Math.sin(scene.time*23)*1.8:0;
 fluid=`<g data-beaker-liquid="true" clip-path="url(#cup)"><path d="M397 ${level}Q442 ${level+ripple} 489 ${level}T582 ${level}V375H397Z" fill="${liquid}" opacity=".65"/><ellipse cx="489" cy="${level}" rx="91" ry="4" fill="${liquid}" opacity=".72"/>${particles}`;
 if(stream){const impact=scene.active.slot==='a'?455:525;fluid+=`<ellipse cx="${impact}" cy="${level}" rx="${8+Math.abs(Math.sin(scene.time*12))*11}" ry="3" fill="none" stroke="#e9faff" opacity=".55"/><path d="M${impact-9} ${level-2}q-5 -8 -8 -5M${impact+7} ${level-1}q4 -9 8 -6" stroke="${liquid}" fill="none" opacity=".65"/>`;}
 fluid+='</g>';
}
setMarkup($('apparatus'),`<defs><linearGradient id="glass"><stop stop-color="#def5ff" stop-opacity=".25"/><stop offset=".2" stop-color="#fff" stop-opacity=".04"/><stop offset=".8" stop-color="#effaff" stop-opacity=".08"/><stop offset="1" stop-color="#b2d7e5" stop-opacity=".3"/></linearGradient><linearGradient id="zinc"><stop stop-color="#657682"/><stop offset=".4" stop-color="#d2d9db"/><stop offset="1" stop-color="#7f909a"/></linearGradient><linearGradient id="bench"><stop stop-color="#71828c"/><stop offset=".1" stop-color="#32434e"/><stop offset="1" stop-color="#1b303d"/></linearGradient><clipPath id="cup"><path d="M397 176H582V355Q582 375 560 375H419Q397 375 397 355Z"/></clipPath></defs><path d="M0 387H900V470H0Z" fill="url(#bench)"/><path d="M0 387H900" stroke="#9baeb6" stroke-opacity=".45"/><ellipse cx="489" cy="386" rx="133" ry="15" fill="#091c28" opacity=".5"/>${t[0]==='zn'?`<g opacity="${1-scene.metal}"><rect x="180" y="346" width="100" height="8" rx="2" fill="url(#zinc)" transform="rotate(-12 180 346)"/><text x="225" y="380" text-anchor="middle" fill="#c4dce7" font-size="12">Zn · metal strip</text></g>`:bottle(t[0],140,'a')}${bottle(t[1],665,'b')}${fluid}${metal}<path d="M393 168L382 159H583V355Q583 378 560 378H418Q394 378 394 355V170" fill="url(#glass)" stroke="#bbd5df" stroke-width="2.5"/><ellipse cx="486" cy="163" rx="99" ry="8" fill="none" stroke="#d8eaf0" stroke-width="2"/><path d="M407 183V343" stroke="#e7faff" stroke-width="5" opacity=".35"/><path d="M573 181V347" stroke="#e7faff" stroke-width="3" opacity=".2"/>${[190,235,280,325].map((y,i)=>`<path d="M535 ${y}h27" stroke="#d1e4eb" opacity=".7"/><text x="530" y="${y+4}" text-anchor="end" fill="#d1e4eb" font-size="10">${40-i*10}</text>`).join('')}<text x="475" y="205" text-anchor="middle" fill="#e0eff5" font-size="11">50 mL</text>${stream}<text x="489" y="420" text-anchor="middle" fill="#bed1dc" font-size="12" letter-spacing="2">REACTION BEAKER</text>`);}
function finish(){stage='mixed';scene={a:trials[selected][0]==='zn'?0:1,b:1,metal:trials[selected][0]==='zn'?1:0,reaction:1,active:null,time:8};draw();$('mix').disabled=true;$('phase').textContent='Mixed';$('observation-title').textContent='After mixing';$('observation-text').textContent=trials[selected][4];$('progress').textContent=trials[selected][2]==='metal'?'Reaction time accelerated: lead has deposited on the zinc.':'Observe the liquid and look for suspended solid.';if(trials[selected][2]&&trials[selected][2]!=='metal')scheduleSettling();}
function scheduleSettling(){
 const mixedAt=performance.now();
 function tick(now){
  const elapsed=now-mixedAt;
  if(elapsed>=5000){
   if(stage!=='settling'){stage='settling';$('phase').textContent='Settling…';$('progress').textContent='The precipitate is sinking, leaving clearer liquid above.';}
   settling=reduced.matches?1:clamp((elapsed-5000)/3500);draw();
   if(settling>=1){stage='settled';$('phase').textContent='Settled';$('progress').textContent='Solid has collected at the bottom of the beaker. Settling time is accelerated.';return;}
  }
  raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
}
function frame(seconds){
 const t=trials[selected],zinc=t[0]==='zn',first=zinc?'b':'a';
 const firstQ=clamp(seconds/2.8),secondQ=clamp((seconds-3)/2.8);
 const delivered=q=>clamp((q-.24)/.54);
 scene={a:zinc?0:delivered(firstQ),b:zinc?delivered(firstQ):delivered(secondQ),metal:zinc?ease((secondQ-.18)/.55):0,reaction:zinc?clamp((seconds-4.8)/2):delivered(secondQ),active:seconds<2.8?{slot:first,q:firstQ}:(!zinc&&seconds>=3&&seconds<5.8?{slot:'b',q:secondQ}:null),time:seconds};
 const label=seconds<2.8?'Adding '+reagents[t[zinc?1:0]][0]:seconds<3?'First addition complete':seconds<5.8?(zinc?'Lowering the zinc strip':'Adding '+reagents[t[1]][0]):'Observing the mixture';
 if($('phase').textContent!==label){$('phase').textContent=label;$('progress').textContent=label+'.';}
 draw();
}
$('mix').addEventListener('click',()=>{
 if(stage!=='ready')return;
 stage='mixing';$('mix').disabled=true;start=performance.now();
 // Reduced motion preserves the addition order with separate, static stages.
 const duration=reduced.matches?2400:7200;
 function tick(now){const elapsed=now-start;
 if(reduced.matches){frame(elapsed<800?2.8:elapsed<1600?5.8:7.2);}else frame(Math.min(7.2,elapsed/1000));
 if(elapsed<duration)raf=requestAnimationFrame(tick);else finish();
 }
 frame(0);raf=requestAnimationFrame(tick);
});
$('reset').addEventListener('click',reset);$('instructions').addEventListener('click',()=>$('help').showModal());$('share').addEventListener('click',()=>$('share-dialog').showModal());document.querySelectorAll('dialog .close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('share-url').value);$('share-status').textContent='Link copied.';}catch{$('share-url').select();$('share-status').textContent='Select and copy the activity link.';}});reset();

}());
