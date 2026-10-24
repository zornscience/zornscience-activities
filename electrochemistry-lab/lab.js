(function () {
  "use strict";
function markup(node, html) {
 const doc=new DOMParser().parseFromString(html,"text/html");
 node.replaceChildren(...Array.from(doc.body.childNodes).map(n=>document.importNode(n,true)));
}

const M=Electrochem,$=id=>document.getElementById(id);
let selected='Zn',left=null,right=null,running=false,deposits=0;
const fmt=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(2);
markup($('metals'),Object.keys(M.metals).map(s=>'<button type="button" draggable="true" data-metal="'+s+'" aria-pressed="false"><b>'+s+'</b>'+M.metals[s].name+'</button>').join(''));
function select(s){selected=s;document.querySelectorAll('[data-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.metal===s)));$('selected').textContent=M.metals[s].name+' selected. Choose a beaker.';}
document.querySelectorAll('[data-metal]').forEach(b=>{b.onclick=()=>select(b.dataset.metal);b.ondragstart=e=>{select(b.dataset.metal);e.dataTransfer.setData('text/plain',b.dataset.metal);};});
function render(){
 const mode=$('mode').value,c=M.cell(left,right,mode),bridge=$('bridge').checked,meter=$('meter').checked;
 const power=Number($('power').value),powered=mode==='galvanic'||(Number.isFinite(power)&&power>Math.abs(c?.e||0));
 const ready=Boolean(c&&bridge&&meter&&powered);
 if(!ready)running=false;
 $('power-label').hidden=mode!=='electrolytic';
 $('mode-help').textContent=mode==='galvanic'?'Chemical energy becomes electrical energy.':'Electrical energy drives the reverse reaction in this ideal metal/ion model.';
 $('run').disabled=!ready;$('run').textContent=running?'Pause animation':'Run cell';
 $('status').textContent=!left||!right?'Place two different metals, then connect the salt bridge and voltmeter.':left===right?'Choose different metals. Identical half-cells at standard conditions have E° = 0.00 V.':!bridge?'Connect the salt bridge to maintain charge balance.':!meter?'Connect the voltmeter and external wires.':!powered?'Increase applied voltage above '+Math.abs(c.e).toFixed(2)+' V to drive this ideal reverse reaction.':running?'Cell running. Follow the electron and ion directions below.':'Cell assembled. Predict the electron direction, then run.';
 
 $('meter-help').textContent=c&&meter?'E° for the reaction shown; not the applied supply voltage.':'Connect the voltmeter to measure.';
 $('flow-help').textContent=c?'Electrons: '+c.anode+' → '+(mode==='electrolytic'?'power supply → ':'')+c.cathode+'. Salt bridge: NO₃⁻ → anode; K⁺ → cathode. No electrons cross the bridge.':'Electrons travel through wires; ions move through the salt bridge.';
 markup($('beakers'), ['left','right'].map(side=>{
 const s=side==='left'?left:right,an=c&&c.anode===s;
 const role=c?(an?'Anode · oxidation':'Cathode · reduction')+' · '+(mode==='galvanic'?(an?'−':'+'):(an?'+':'−')):'Place an electrode';
 return '<div class="zsa-ec-half" data-side="'+side+'"><div class="zsa-ec-role">'+role+'</div><label for="solution-'+side+'">'+(side==='left'?'Left':'Right')+' solution (1 M)</label><select id="solution-'+side+'" data-solution="'+side+'"><option value="">Choose ionic solution</option>'+Object.keys(M.metals).map(m=>'<option value="'+m+'" '+(solutions[side]===m?'selected':'')+'>'+M.ion(m)+'(aq)</option>').join('')+'</select><button type="button" class="zsa-btn" data-place="'+side+'">Place selected metal</button><p class="small">'+(s?M.metals[s].name+' electrode'+(c?(an?' loses mass.':' gains mass.'):''):'Drop a metal here.')+'</p></div>';
 }).join(''));
 document.querySelectorAll('[data-side]').forEach(el=>{el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();const s=e.dataTransfer.getData('text/plain');if(M.metals[s])place(el.dataset.side,s);};});
 document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>place(b.dataset.place,selected));
 document.querySelectorAll('[data-solution]').forEach(el=>el.onchange=()=>{solutions[el.dataset.solution]=el.value;running=false;deposits=0;render();});
 const match=left&&right&&solutions.left===left&&solutions.right===right;
 if(c&&!match){running=false;$('run').disabled=true;$('run').textContent='Run cell';$('status').textContent='Match each metal electrode to its own ionic solution before running. The displayed E° assumes matched standard half-cells.';}
 draw(c,bridge,meter,mode);

}
const solutions={left:'',right:''};
function place(side,s){deposits=0;if(side==='left')left=s;else right=s;running=false;render();}
['mode','bridge','meter','power'].forEach(id=>$(id).onchange=()=>{running=false;deposits=0;render();});
$('run').onclick=()=>{running=!running; $('run').textContent=running?'Pause animation':'Run cell'; $('status').textContent=running?'Cell running. Electrons flow through the wires; ions exchange with the electrodes.':'Animation paused.'; syncMotion();};
$('reset').onclick=()=>{left=null;right=null;solutions.left='';solutions.right='';running=false;$('bridge').checked=false;$('meter').checked=false;$('mode').value='galvanic';$('power').value='2.0';deposits=0;select('Zn');render();};
function draw(c,bridge,meter,mode){
 const leftAnode=c&&c.anode===left, cathodeX=leftAnode?565:155;
 const wireLeft='M155 271 C110 245 65 200 80 133 C88 95 215 190 288 151';
 const wireRight='M432 151 C510 195 638 75 645 134 C655 200 600 248 565 271';
 const motion=(path,delay,kind,label)=>'<g class="'+kind+'"><circle r="'+(kind==='electron-dot'?7:12)+'"/><text text-anchor="middle" dy="4">'+label+'</text><animateMotion dur="3s" begin="'+delay+'s" repeatCount="indefinite" path="'+path+'"/></g>';
 let particles='';
 if(c&&meter){for(let i=0;i<5;i++){
 particles+=motion(leftAnode?wireLeft:'M288 151 C215 190 88 95 80 133 C65 200 110 245 155 271',-i*.6,'electron-dot','−');
 particles+=motion(leftAnode?wireRight:'M565 271 C600 248 655 200 645 134 C638 75 510 195 432 151',-i*.6,'electron-dot','−');
 }}
 const bridgePath='M265 370 V269 Q265 242 292 242 H428 Q455 242 455 269 V370';
 let bridgeIons='';if(bridge&&c){for(let i=0;i<4;i++)bridgeIons+=motion(leftAnode?bridgePath:'M455 370 V269 Q455 242 428 242 H292 Q265 242 265 269 V370',-i*.75,'bridge-ion','K⁺')+motion(leftAnode?'M455 370 V269 Q455 242 428 242 H292 Q265 242 265 269 V370':bridgePath,-i*.75,'bridge-anion','−');}
 let vessels='';
 ['left','right'].forEach((side,index)=>{
 const x=index?565:155,s=side==='left'?left:right,an=c&&c.anode===s,sol=solutions[side],fill=sol==='Cu'?'url(#copper-liquid)':'url(#clear-liquid)';
 let ions='';
 if(sol){for(let i=0;i<7;i++){const ix=x-82+(i%3)*76,iy=345+Math.floor(i/3)*40;ions+='<g class="solution-ion"><circle cx="'+ix+'" cy="'+iy+'" r="17"/><text x="'+ix+'" y="'+(iy+4)+'" text-anchor="middle">'+M.ion(sol)+'</text></g>';}}
 if(c&&s&&sol===s){const path=an?'M'+(x+25)+' 368 Q'+(x+60)+' 360 '+(x+90)+' 413':'M'+(x-90)+' 413 Q'+(x-60)+' 360 '+(x-25)+' 368';ions+=motion(path,0,an?'dissolving-ion':'depositing-ion',M.ion(s));}
 vessels+='<g data-scene-side="'+side+'"><path d="M'+(x-117)+' 298 V454 Q'+(x-117)+' 477 '+(x-94)+' 477 H'+(x+94)+' Q'+(x+117)+' 477 '+(x+117)+' 454 V298" fill="url(#glass)" stroke="#8aa6bb" stroke-width="3"/><path d="M'+(x-114)+' 328 H'+(x+114)+' V452 Q'+(x+114)+' 474 '+(x+92)+' 474 H'+(x-92)+' Q'+(x-114)+' 474 '+(x-114)+' 452Z" fill="'+fill+'"/><ellipse cx="'+x+'" cy="328" rx="114" ry="7" fill="#d7edf4" opacity=".7"/>';
 if(s)vessels+='<rect x="'+(x-23)+'" y="268" width="46" height="177" rx="4" fill="url(#metal-'+s+')" stroke="#677e8c" stroke-width="2"/><rect x="'+(x-18)+'" y="273" width="5" height="166" rx="2" fill="white" opacity=".3"/><text x="'+x+'" y="300" text-anchor="middle" class="metal-label">'+s+'</text>';
 vessels+=ions+'<path d="M'+(x-104)+' 341 V442" stroke="white" stroke-width="6" opacity=".7" stroke-linecap="round"/>';
 for(let k=0;k<4;k++)vessels+='<path d="M'+(x+92)+' '+(350+k*28)+' h18" stroke="#6d95aa" opacity=".7"/>';
 vessels+='<text x="'+x+'" y="505" text-anchor="middle" class="vessel-caption">'+(sol?'1 M '+M.ion(sol)+'(aq)':'Choose a solution below')+'</text></g>';
 });
 markup($('apparatus'),'<svg id="cell-scene" viewBox="0 0 720 535" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Electrochemical cell apparatus</title><desc id="scene-desc">'+(c?'Electrons travel from '+c.anode+' to '+c.cathode+'. Metal ions gain electrons at the cathode and deposit as neutral atoms. Anode metal dissolves into ions.':'Two beakers with electrodes connected by a salt bridge and insulated meter leads.')+'</desc><defs><linearGradient id="glass"><stop stop-color="#edf8fd" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#cbdde7" stop-opacity=".3"/></linearGradient><linearGradient id="clear-liquid" x2="0" y2="1"><stop stop-color="#e8f3f7" stop-opacity=".65"/><stop offset="1" stop-color="#b5d5e4" stop-opacity=".75"/></linearGradient><linearGradient id="copper-liquid" x2="0" y2="1"><stop stop-color="#9ad9ed" stop-opacity=".6"/><stop offset="1" stop-color="#55a9d3" stop-opacity=".65"/></linearGradient>'+Object.keys(M.metals).map(s=>'<linearGradient id="metal-'+s+'"><stop stop-color="'+M.metals[s].color+'"/><stop offset=".4" stop-color="'+(s==='Cu'?'#e6b58b':'#e9edf1')+'"/><stop offset="1" stop-color="'+M.metals[s].color+'"/></linearGradient>').join('')+'</defs><ellipse cx="360" cy="485" rx="335" ry="13" fill="#d7e3ec" opacity=".45"/>'+vessels+'<g class="wire-set '+(meter?'':'disconnected')+'"><path d="'+wireLeft+'" class="lead-shadow"/><path d="'+wireRight+'" class="lead-shadow"/><path d="'+wireLeft+'" class="black-lead"/><path d="'+wireRight+'" class="red-lead"/><path d="M143 263 h24 v16 h-24z M553 263 h24 v16 h-24z" fill="#687d8b" stroke="#2f4251"/>'+particles+'</g><g class="bridge-tube '+(bridge?'':'disconnected')+'"><path d="'+bridgePath+'" fill="none" stroke="#88a5b4" stroke-width="28" stroke-linecap="round"/><path d="'+bridgePath+'" fill="none" stroke="#dfedf0" stroke-width="23" stroke-linecap="round"/><path d="'+bridgePath+'" fill="none" stroke="#b5d5c5" stroke-width="13" stroke-linecap="round" stroke-dasharray="2 4"/><path d="M255 363 h20 v17 h-20z M445 363 h20 v17 h-20z" fill="#d6cbb2" stroke="#a69a80" stroke-dasharray="2 2"/>'+bridgeIons+'<rect x="302" y="208" width="116" height="24" rx="6" fill="#f1faf5" stroke="#b7d4c2"/><text x="360" y="224" text-anchor="middle" class="bridge-caption">KNO₃ · agar gel</text></g><g class="instrument"><rect x="266" y="24" width="188" height="163" rx="18" fill="#162a40" stroke="#071a2c" stroke-width="4"/><rect x="275" y="32" width="170" height="146" rx="12" fill="#2e465d"/><text x="360" y="51" text-anchor="middle" class="meter-brand">'+(mode==='electrolytic'?'DC POWER / E° MONITOR':'DIGITAL VOLTMETER')+'</text><rect x="284" y="61" width="152" height="53" rx="5" fill="#d2e4ce" stroke="#142b3c" stroke-width="3"/><text id="voltage" x="360" y="96" text-anchor="middle" class="meter-digits">'+(c&&meter?fmt(c.e)+' V':'OFF')+'</text><circle cx="360" cy="145" r="21" fill="#172e44" stroke="#7e95a7" stroke-width="2"/><path d="M360 145 l8 -15" stroke="#edf2f5" stroke-width="4" stroke-linecap="round"/><text x="361" y="124" text-anchor="middle" class="dial-label">V ⎓</text><circle cx="288" cy="151" r="8" fill="#0b1726" stroke="#9fadb8" stroke-width="2"/><circle cx="432" cy="151" r="8" fill="#b9423f" stroke="#e89a91" stroke-width="2"/><text x="288" y="172" text-anchor="middle" class="dial-label">COM</text><text x="432" y="172" text-anchor="middle" class="dial-label">V</text></g><g id="deposited-atoms" data-x="'+cathodeX+'" data-metal="'+(c?c.cathode:'')+'"></g></svg>');
 document.querySelectorAll('[data-scene-side]').forEach(el=>{el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();const s=e.dataTransfer.getData('text/plain');if(M.metals[s])place(el.dataset.sceneSide,s);};});
 syncMotion();paintDeposits();
}
function syncMotion(){const svg=$('cell-scene');if(!svg)return; if(running&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)svg.unpauseAnimations();else svg.pauseAnimations();if(running)svg.classList.add('is-running');}
function paintDeposits(){const group=$('deposited-atoms');if(!group||!group.dataset.metal)return;const x=Number(group.dataset.x),s=group.dataset.metal;markupSvg(group,Array.from({length:deposits},(_,i)=>'<circle cx="'+(x+(i%2?26:-26)+Math.floor(i/12)*5*(i%2?1:-1))+'" cy="'+(350+Math.floor((i%12)/2)*15)+'" r="5" fill="'+M.metals[s].color+'" stroke="#667c8d" stroke-width="1"/>').join(''));}
function markupSvg(node,content){const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+content+'</svg>','image/svg+xml');node.replaceChildren(...Array.from(doc.documentElement.childNodes).map(n=>document.importNode(n,true)));}
setInterval(()=>{if(running){deposits=Math.min(36,deposits+1);paintDeposits();}},900);
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncMotion);

select('Zn');render();
})();
