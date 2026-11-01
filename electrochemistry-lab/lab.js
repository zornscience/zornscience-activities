(function () {
  "use strict";
function markup(node, html) {
 const doc=new DOMParser().parseFromString(html,'text/html');
 node.replaceChildren(...Array.from(doc.body.childNodes).map(n=>document.importNode(n,true)));
}
// Student text goes through t(): full templates from data.js, with English as the fallback.
let i18n;document.querySelector('.zsa-ec').dispatchEvent(new CustomEvent('zsa:request-i18n',{detail:{receive:api=>{i18n=api;}}}));
const t=(text,values)=>i18n?i18n.text(text,values):text.replace(/\{(\w+)\}/g,(m,k)=>values&&values[k]!==undefined?values[k]:m);
const metalName=s=>t(M.metals[s].name),metalValues=s=>({metal:metalName(s),metalLower:metalName(s).toLowerCase()});
const placeText=(side,s)=>t(side==='left'?'Place {metal} left':'Place {metal} right',{metal:s});
const M=Electrochem,$=id=>document.getElementById(id),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let selected='Zn',left=null,right=null,running=false,events=0,elapsed=0;
const solutions={left:'',right:''};
const fmt=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(2);
function assessment(){return M.assess({left,right,mode:$('mode').value,leftSolution:solutions.left,rightSolution:solutions.right,bridge:$('bridge').checked,meter:$('meter').checked,power:Number($('power').value)});}
function select(s){selected=s;document.querySelectorAll('[data-place]').forEach(b=>{b.textContent=placeText(b.dataset.place,s);});document.querySelectorAll('[data-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.metal===s)));$('selected').textContent=t('{metal} selected. Use a Place button or drag to a beaker.',metalValues(s));}
markup($('metals'),Object.keys(M.metals).map(s=>'<button type="button" draggable="true" data-metal="'+s+'" aria-pressed="false"><b>'+s+'</b>'+metalName(s)+'</button>').join(''));
document.querySelectorAll('[data-metal]').forEach(b=>{b.onclick=()=>select(b.dataset.metal);b.ondragstart=e=>{select(b.dataset.metal);e.dataTransfer.setData('text/plain',b.dataset.metal);};});
function stop(){running=false;elapsed=0;}
function clearSample(){stop();events=0;}
function statusText(a){
 const c=a.cell;
 const messages={electrodes:t('Place two different metals, then choose their matching ionic solutions.'),identical:t('Identical standard half-cells have E° = 0.00 V. Choose different metals to drive a reaction.'),solutions:t('Match each electrode with its own metal-ion solution. This model does not simulate mismatched half-cells.'),bridge:t('Salt bridge disconnected: charge would build up, stopping sustained electron flow. Add the bridge to continue.'),circuit:t('Complete the external circuit to allow electron flow. The voltmeter measures across the two electrodes.'),power:c?t('Set the applied voltage above {v} V (up to 10 V) to drive the reverse reaction.',{v:Math.abs(c.e).toFixed(2)}):''};
 return a.ready?t(events===12?'Sample complete: 12 balanced events. Restart particles to repeat or change the setup.':running?'Running a short particle sample. Pause to inspect, or use Step once.':'Ready. Step once to observe a balanced reaction event, or run the sample.'):messages[a.code];
}
function updateControls(){const a=assessment();$('run').disabled=!a.ready||events>=12;$('step').disabled=!a.ready||events>=12;$('restart').disabled=events===0&&!running;$('swap').disabled=!left||!right;$('run').textContent=t(running?'Pause':events?'Resume':'Run cell');if(events>=12)$('run').textContent=t('Sample complete');$('status').textContent=statusText(a);}
function render(){
 const focusId=document.activeElement&&document.activeElement.id;
 const a=assessment(),c=a.cell,mode=$('mode').value;
 if(!a.ready)stop();
 $('power-label').hidden=mode!=='electrolytic';if(mode==='electrolytic')$('builder').open=true;
 $('mode-help').textContent=t(mode==='galvanic'?'Spontaneous: chemical → electrical energy.':'Driven in reverse: electrical → chemical energy.');
 const valid=left&&right&&solutions.left===left&&solutions.right===right;
 $('meter-help').textContent=c&&valid?t(mode==='electrolytic'?'Calculated E° for this reaction: {e} V. Applied supply: {p} V. The meter branch carries negligible current; electrons follow the load or power-supply circuit.':'Calculated E° for this reaction: {e} V. The meter branch carries negligible current; electrons follow the load or power-supply circuit.',{e:fmt(c.e),p:Number($('power').value).toFixed(2)}):t('Choose matching standard half-cells to calculate E°.');
 $('flow-help').textContent=c&&valid?t(mode==='electrolytic'?'Electrons: {anode} → power supply → {cathode}. K⁺ moves toward the cathode; NO₃⁻ toward the anode. Electrons never cross the salt bridge.':'Electrons: {anode} → load → {cathode}. K⁺ moves toward the cathode; NO₃⁻ toward the anode. Electrons never cross the salt bridge.',{anode:c.anode,cathode:c.cathode}):t('Electron flow requires a complete circuit and a salt bridge for charge balance.');
 markup($('potential-math'),c&&valid?'<p>'+t('E°cell = E°cathode − E°anode')+'</p><p>('+fmt(M.metals[c.cathode].e)+') − ('+fmt(M.metals[c.anode].e)+') = <strong>'+fmt(c.e)+' V</strong></p><p class="small">Zn²⁺/Zn: −0.76 V · Cu²⁺/Cu: +0.34 V · Ag⁺/Ag: +0.80 V</p>':'<p>'+t('Choose two different metals and match their solutions.')+'</p>');
 markup($('beakers'),['left','right'].map(side=>{
  const s=side==='left'?left:right,an=c&&c.anode===s;
  const role=c?t(an?'Anode · oxidation · {sign}':'Cathode · reduction · {sign}',{sign:mode==='galvanic'?(an?'−':'+'):(an?'+':'−')}):t(side==='left'?'Left half-cell':'Right half-cell');
  const equation=c&&s?(an?s+' → '+M.ion(s)+' + '+M.metals[s].n+'e⁻':M.ion(s)+' + '+M.metals[s].n+'e⁻ → '+s):'';
  return '<div class="zsa-ec-half" data-side="'+side+'"><div class="zsa-ec-role">'+role+'</div><p class="zsa-ec-local-equation explanation">'+equation+'</p><label for="solution-'+side+'">'+t(side==='left'?'Left solution (1 M)':'Right solution (1 M)')+'</label><select id="solution-'+side+'" data-solution="'+side+'"><option value="">'+t('Choose ionic solution')+'</option>'+Object.keys(M.metals).map(m=>'<option value="'+m+'" '+(solutions[side]===m?'selected':'')+'>'+M.ion(m)+'(aq)</option>').join('')+'</select><button id="place-'+side+'" type="button" class="zsa-btn" data-place="'+side+'">'+placeText(side,selected)+'</button><p class="small explanation">'+(s?t(c?(an?'{metal} loses neutral atoms; ions enter solution.':'{metal} gains neutral atoms; ions leave solution.'):'{metal} electrode.',metalValues(s)):t('Choose or drop an electrode.'))+'</p></div>';
 }).join(''));
 document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>place(b.dataset.place,selected));
 document.querySelectorAll('[data-solution]').forEach(el=>el.onchange=()=>{solutions[el.dataset.solution]=el.value;custom();render();});
 bindDrops('[data-side]','side');
 draw(c,$('bridge').checked,$('meter').checked,mode);
 updateControls();updateView();updateSample(false);
 if(focusId&&$(focusId))$(focusId).focus({preventScroll:true});
}
function bindDrops(selector,key){document.querySelectorAll(selector).forEach(el=>{el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();const s=e.dataTransfer.getData('text/plain');if(M.metals[s])place(el.dataset[key],s);};});}
function custom(){clearSample();$('builder').open=true;$('example').value='custom';}
function place(side,s){if(side==='left')left=s;else right=s;custom();render();}
function loadExample(){const pair=$('example').value.split(',');if(pair.length!==2){$('builder').open=true;clearSample();render();return;}$('builder').open=false;[left,right]=pair;solutions.left=left;solutions.right=right;clearSample();$('bridge').checked=true;$('meter').checked=true;render();}
$('example').onchange=loadExample;
$('swap').onclick=()=>{[left,right]=[right,left];[solutions.left,solutions.right]=[solutions.right,solutions.left];clearSample();render();};
['mode','bridge','meter','power'].forEach(id=>$(id).onchange=()=>{clearSample();render();});
$('run').onclick=()=>{if(!assessment().ready||events>=12)return;running=!running;elapsed=0;updateControls();syncMotion();};
$('step').onclick=()=>{stop();advance(true);syncMotion();};
$('restart').onclick=()=>{clearSample();render();};
$('reset').onclick=()=>{left=null;right=null;solutions.left='';solutions.right='';clearSample();$('bridge').checked=false;$('meter').checked=false;$('mode').value='galvanic';$('power').value='2.0';$('example').value='custom';$('builder').open=true;select('Zn');render();};
function updateView(){const root=document.querySelector('.zsa-ec');root.classList.toggle('hide-ions',!$('show-ions').checked);root.classList.toggle('hide-explanations',!$('show-labels').checked);}
['show-ions','show-labels'].forEach(id=>$(id).onchange=updateView);
$('speed').onchange=()=>{const svg=$('cell-scene');if(svg)svg.querySelectorAll('animateMotion').forEach(el=>el.setAttribute('dur',(3/Number($('speed').value))+'s'));elapsed=0;};
function draw(c,bridge,meter,mode){
 const leftAnode=c&&c.anode===left, cathodeX=leftAnode?565:155;
 const wireLeft='M155 271 C110 245 65 200 80 163 C88 125 235 207 320 195';
 const wireRight='M400 195 C485 205 638 110 645 164 C655 220 600 248 565 271';
 const motion=(path,delay,kind,label)=>'<g class="'+kind+'"><circle r="'+(kind==='electron-dot'?7:12)+'"/><text text-anchor="middle" dy="4">'+label+'</text><animateMotion dur="'+(3/Number($('speed').value))+'s" begin="'+delay+'s" repeatCount="indefinite" path="'+path+'"/></g>';
 const component=mode==='galvanic'?'<path d="M320 195 l5 -9 10 18 10 -18 10 18 10 -18 10 18 10 -18 10 18 5 -9" fill="none" stroke="#344d65" stroke-width="3"/><text x="360" y="216" text-anchor="middle" class="circuit-caption">'+t('LOAD')+'</text>':'<rect x="319" y="188" width="82" height="36" rx="6" fill="#eff5fa" stroke="#526c82"/><text x="360" y="202" text-anchor="middle" class="circuit-caption">'+t('DC SUPPLY')+'</text><text x="360" y="217" text-anchor="middle" class="circuit-caption">'+Number($('power').value).toFixed(2)+' V</text>';
 let particles='';
 if(c&&meter){for(let i=0;i<5;i++){
 particles+=motion(leftAnode?wireLeft:'M320 195 C235 207 88 125 80 163 C65 200 110 245 155 271',-i*.6,'electron-dot','e⁻');
 particles+=motion(leftAnode?wireRight:'M565 271 C600 248 655 220 645 164 C638 110 485 205 400 195',-i*.6,'electron-dot','e⁻');
 }}
 const bridgePath='M265 370 V269 Q265 242 292 242 H428 Q455 242 455 269 V370';
 let bridgeIons='';if(bridge&&c){for(let i=0;i<4;i++)bridgeIons+=motion(leftAnode?bridgePath:'M455 370 V269 Q455 242 428 242 H292 Q265 242 265 269 V370',-i*.75,'bridge-ion','K⁺')+motion(leftAnode?'M455 370 V269 Q455 242 428 242 H292 Q265 242 265 269 V370':bridgePath,-i*.75,'bridge-anion','NO₃⁻');}
 let vessels='';
 ['left','right'].forEach((side,index)=>{
 const x=index?565:155,s=side==='left'?left:right,an=c&&c.anode===s,sol=solutions[side],fill=sol==='Cu'?'url(#copper-liquid)':'url(#clear-liquid)';
 let ions='';
 ions+='<g id="sample-ions-'+side+'"></g>';
 if(c&&s&&sol===s){const path=an?'M'+(x+25)+' 368 Q'+(x+60)+' 360 '+(x+90)+' 413':'M'+(x-90)+' 413 Q'+(x-60)+' 360 '+(x-25)+' 368';ions+=motion(path,0,an?'dissolving-ion':'depositing-ion',M.ion(s));}
 vessels+='<g data-scene-side="'+side+'"><path d="M'+(x-117)+' 298 V454 Q'+(x-117)+' 477 '+(x-94)+' 477 H'+(x+94)+' Q'+(x+117)+' 477 '+(x+117)+' 454 V298" fill="url(#glass)" stroke="#8aa6bb" stroke-width="3"/><path d="M'+(x-114)+' 328 H'+(x+114)+' V452 Q'+(x+114)+' 474 '+(x+92)+' 474 H'+(x-92)+' Q'+(x-114)+' 474 '+(x-114)+' 452Z" fill="'+fill+'"/><ellipse cx="'+x+'" cy="328" rx="114" ry="7" fill="#d7edf4" opacity=".7"/>';
 if(s)vessels+='<rect id="plate-'+side+'" x="'+(x-23)+'" y="268" width="46" height="177" rx="4" fill="url(#metal-'+s+')" stroke="#677e8c" stroke-width="2"/><rect x="'+(x-18)+'" y="273" width="5" height="166" rx="2" fill="white" opacity=".3"/><text x="'+x+'" y="300" text-anchor="middle" class="metal-label">'+s+'</text>';
 vessels+=ions+'<path d="M'+(x-104)+' 341 V442" stroke="white" stroke-width="6" opacity=".7" stroke-linecap="round"/>';
 for(let k=0;k<4;k++)vessels+='<path d="M'+(x+92)+' '+(350+k*28)+' h18" stroke="#6d95aa" opacity=".7"/>';
 vessels+='<text x="'+x+'" y="505" text-anchor="middle" class="vessel-caption">'+(sol?'1 M '+M.ion(sol)+'(aq)':t('Choose a solution below'))+'</text></g>';
 });
 markup($('apparatus'),'<svg id="cell-scene" viewBox="0 0 720 535" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">'+t('Electrochemical cell apparatus')+'</title><desc id="scene-desc">'+(c?t('Electrons travel from {anode} to {cathode}. Metal ions gain electrons at the cathode and deposit as neutral atoms. Anode metal dissolves into ions.',{anode:c.anode,cathode:c.cathode}):t('Two beakers with electrodes connected by a salt bridge and insulated meter leads.'))+'</desc><defs><linearGradient id="glass"><stop stop-color="#edf8fd" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#cbdde7" stop-opacity=".3"/></linearGradient><linearGradient id="clear-liquid" x2="0" y2="1"><stop stop-color="#e8f3f7" stop-opacity=".65"/><stop offset="1" stop-color="#b5d5e4" stop-opacity=".75"/></linearGradient><linearGradient id="copper-liquid" x2="0" y2="1"><stop stop-color="#9ad9ed" stop-opacity=".6"/><stop offset="1" stop-color="#55a9d3" stop-opacity=".65"/></linearGradient>'+Object.keys(M.metals).map(s=>'<linearGradient id="metal-'+s+'"><stop stop-color="'+M.metals[s].color+'"/><stop offset=".4" stop-color="'+(s==='Cu'?'#e6b58b':'#e9edf1')+'"/><stop offset="1" stop-color="'+M.metals[s].color+'"/></linearGradient>').join('')+'</defs><ellipse cx="360" cy="485" rx="335" ry="13" fill="#d7e3ec" opacity=".45"/>'+vessels+'<g class="wire-set '+(meter?'':'disconnected')+'"><path d="'+wireLeft+'" class="lead-shadow"/><path d="'+wireRight+'" class="lead-shadow"/><path d="'+wireLeft+'" class="'+(leftAnode?'black-lead':'red-lead')+'"/><path d="'+wireRight+'" class="'+(leftAnode?'red-lead':'black-lead')+'"/><path d="M143 263 h24 v16 h-24z M553 263 h24 v16 h-24z" fill="#687d8b" stroke="#2f4251"/>'+particles+component+'</g><g class="bridge-tube '+(bridge?'':'disconnected')+'"><path d="'+bridgePath+'" fill="none" stroke="#88a5b4" stroke-width="28" stroke-linecap="round"/><path d="'+bridgePath+'" fill="none" stroke="#dfedf0" stroke-width="23" stroke-linecap="round"/><path d="'+bridgePath+'" fill="none" stroke="#b5d5c5" stroke-width="13" stroke-linecap="round" stroke-dasharray="2 4"/><path d="M255 363 h20 v17 h-20z M445 363 h20 v17 h-20z" fill="#d6cbb2" stroke="#a69a80" stroke-dasharray="2 2"/>'+bridgeIons+'<rect x="302" y="270" width="116" height="24" rx="6" fill="#f1faf5" stroke="#b7d4c2"/><text x="360" y="286" text-anchor="middle" class="bridge-caption">'+t('KNO₃ · agar gel')+'</text></g><g class="instrument"><rect x="266" y="24" width="188" height="163" rx="18" fill="#162a40" stroke="#071a2c" stroke-width="4"/><rect x="275" y="32" width="170" height="146" rx="12" fill="#2e465d"/><text x="360" y="51" text-anchor="middle" class="meter-brand">'+t('STANDARD E° / V')+'</text><rect x="284" y="61" width="152" height="53" rx="5" fill="#d2e4ce" stroke="#142b3c" stroke-width="3"/><text id="voltage" x="360" y="96" text-anchor="middle" class="meter-digits">'+(meter&&left&&left===right&&solutions.left===left&&solutions.right===right?'+0.00 V':c&&meter&&solutions.left===left&&solutions.right===right?fmt(c.e)+' V':t('OFF'))+'</text><circle cx="360" cy="145" r="21" fill="#172e44" stroke="#7e95a7" stroke-width="2"/><path d="M360 145 l8 -15" stroke="#edf2f5" stroke-width="4" stroke-linecap="round"/><text x="361" y="124" text-anchor="middle" class="dial-label">V ⎓</text><circle cx="288" cy="151" r="8" fill="'+(leftAnode?'#0b1726':'#b9423f')+'" stroke="#9fadb8" stroke-width="2"/><circle cx="432" cy="151" r="8" fill="'+(leftAnode?'#b9423f':'#0b1726')+'" stroke="#e89a91" stroke-width="2"/><text x="288" y="172" text-anchor="middle" class="dial-label">'+(leftAnode?'COM':'V')+'</text><text x="432" y="172" text-anchor="middle" class="dial-label">'+(leftAnode?'V':'COM')+'</text></g><g class="meter-branch '+(meter?'':'disconnected')+'"><path d="M300 197 L254 197 V151 H280 M420 197 H466 V151 H440" fill="none" stroke="#8098aa" stroke-width="2" stroke-dasharray="4 3"/></g><g id="anode-loss"></g><g id="deposited-atoms" data-x="'+cathodeX+'" data-metal="'+(c?c.cathode:'')+'"></g></svg>');
 bindDrops('[data-scene-side]','sceneSide');
 syncMotion();
}
function syncMotion(){
 const svg=$('cell-scene');if(!svg)return;
 if(running&&!reduced.matches)svg.unpauseAnimations();else svg.pauseAnimations();
 if(running||events>0)svg.classList.add('is-running');
}
function markupSvg(node,content){
 const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+content+'</svg>','image/svg+xml');
 node.replaceChildren(...Array.from(doc.documentElement.childNodes).map(n=>document.importNode(n,true)));
}
function updateSample(announce){
 const a=assessment(),c=a.cell,valid=c&&solutions.left===left&&solutions.right===right;
 if(!valid){$('sample-counts').textContent=t('Choose matching half-cells to follow a particle sample.');return;}
 const sample=M.sample(c,events),max=M.sample(c,12);
 markup($('sample-counts'),'<span>'+t('<strong>{events} / 12</strong> events',{events})+'</span><span>'+t('<strong>{n}</strong> e⁻ transferred',{n:sample.electrons})+'</span><span>'+t('<strong>{n}</strong> {metal} atoms lost',{n:sample.dissolved,metal:c.anode})+'</span><span>'+t('<strong>{n}</strong> {metal} atoms deposited',{n:sample.deposited,metal:c.cathode})+'</span>');
 const cathodeX=c.cathode===left?155:565,anodeX=c.anode===left?155:565;
 const atom=(x,y,color)=>'<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+color+'" stroke="#536b7e" stroke-width="1"/>';
 markupSvg($('deposited-atoms'),Array.from({length:sample.deposited},(_,i)=>atom(cathodeX+(i%2?27:-27),345+Math.floor(i/2)*9,M.metals[c.cathode].color)).join(''));
 // Pale notches show which surface atoms left the anode; transferred ions appear in the solution.
 markupSvg($('anode-loss'),Array.from({length:sample.dissolved},(_,i)=>'<rect x="'+(anodeX+(i%2?16:-23))+'" y="'+(340+Math.floor(i/2)*9)+'" width="7" height="7" fill="#d3e9f2"/>').join(''));
 ['left','right'].forEach((side,index)=>{
 const s=side==='left'?left:right,an=s===c.anode,x=index?565:155;
 const count=an?sample.dissolved:max.deposited-sample.deposited;
 markupSvg($('sample-ions-'+side),Array.from({length:count},(_,i)=>{
 const ix=x+(i%2?48:-75)+(Math.floor(i/2)%2)*23,iy=346+Math.floor(i/4)*18;
 return '<g class="solution-ion"><circle cx="'+ix+'" cy="'+iy+'" r="11"/><text x="'+ix+'" y="'+(iy+3)+'" text-anchor="middle">'+M.ion(s)+'</text></g>';
 }).join(''));
 });
 if(announce)$('status').textContent=t(c.anodeAtoms===1?(c.cathodeAtoms===1?'Event {events} of 12: {a} {anode} atom lost, {c} {cathode} atom deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.':'Event {events} of 12: {a} {anode} atom lost, {c} {cathode} atoms deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.'):(c.cathodeAtoms===1?'Event {events} of 12: {a} {anode} atoms lost, {c} {cathode} atom deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.':'Event {events} of 12: {a} {anode} atoms lost, {c} {cathode} atoms deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.'),{events,a:c.anodeAtoms,anode:c.anode,c:c.cathodeAtoms,cathode:c.cathode,n:c.n});
}
function advance(announce){if(!assessment().ready||events>=12)return;events++;if(events>=12)stop();updateControls();updateSample(announce);syncMotion();}
setInterval(()=>{
 if(!running||document.hidden)return;
 elapsed+=100;
 if(elapsed>=1800/Number($('speed').value)){elapsed=0;advance(false);}
},100);
reduced.addEventListener('change',syncMotion);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){stop();updateControls();syncMotion();}});
select('Zn');loadExample();
}());
