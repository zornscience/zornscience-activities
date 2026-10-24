(function () {
  "use strict";
function markup(node, html) {
 const doc=new DOMParser().parseFromString(html,"text/html");
 node.replaceChildren(...Array.from(doc.body.childNodes).map(n=>document.importNode(n,true)));
}

const M=Electrochem,$=id=>document.getElementById(id);
let selected='Zn',left=null,right=null,running=false;
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
 $('voltage').textContent=c&&meter?fmt(c.e)+' V':'No reading';
 $('meter-help').textContent=c&&meter?'E° for the reaction shown; not the applied supply voltage.':'Connect the voltmeter to measure.';
 $('salt').classList.toggle('connected',bridge);$('salt').textContent=bridge?'KNO₃ salt bridge connected':'Salt bridge not connected';
 $('flow').className='zsa-ec-flow'+(running?' active':'')+(c&&c.anode===right?' reverse':'');$('electron').textContent=c&&c.anode===right?'← e⁻':'e⁻ →';
 $('flow-help').textContent=c?'Electrons: '+c.anode+' → '+(mode==='electrolytic'?'power supply → ':'')+c.cathode+'. Salt bridge: NO₃⁻ → anode; K⁺ → cathode. No electrons cross the bridge.':'Electrons travel through wires; ions move through the salt bridge.';
 markup($('beakers'), ['left','right'].map(side=>{
 const s=side==='left'?left:right,an=c&&c.anode===s;
 const role=c?(an?'Anode · oxidation':'Cathode · reduction')+' · '+(mode==='galvanic'?(an?'−':'+'):(an?'+':'−')):'Place an electrode';
 return '<div class="zsa-ec-half" data-side="'+side+'"><div class="zsa-ec-role">'+role+'</div><div class="zsa-ec-vessel '+(s==='Cu'?'copper':'')+'">'+(s?'<div class="zsa-ec-rod metal-'+s+'">'+s+'</div>':'Empty beaker')+'</div><label for="solution-'+side+'">'+(side==='left'?'Left':'Right')+' solution (1 M)</label><select id="solution-'+side+'" data-solution="'+side+'"><option value="">Choose ionic solution</option>'+Object.keys(M.metals).map(m=>'<option value="'+m+'" '+(solutions[side]===m?'selected':'')+'>'+M.ion(m)+'(aq)</option>').join('')+'</select><button type="button" class="zsa-btn" data-place="'+side+'">Place selected metal</button><p class="small">'+(s?M.metals[s].name+' electrode'+(c?(an?' loses mass.':' gains mass.'):''):'Drop a metal here.')+'</p></div>';
 }).join(''));
 document.querySelectorAll('[data-side]').forEach(el=>{el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();const s=e.dataTransfer.getData('text/plain');if(M.metals[s])place(el.dataset.side,s);};});
 document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>place(b.dataset.place,selected));
 document.querySelectorAll('[data-solution]').forEach(el=>el.onchange=()=>{solutions[el.dataset.solution]=el.value;running=false;render();});
 const match=left&&right&&solutions.left===left&&solutions.right===right;
 if(c&&!match){running=false;$('run').disabled=true;$('flow').classList.remove('active');$('run').textContent='Run cell';$('status').textContent='Match each metal electrode to its own ionic solution before running. The displayed E° assumes matched standard half-cells.';}
 markup($('reactions'),c?'<div class="zsa-ec-rx"><div><strong>Oxidation at '+c.anode+'</strong><p>'+c.anode+'(s) → '+M.ion(c.anode)+'(aq) + '+M.metals[c.anode].n+'e⁻</p></div><div><strong>Reduction at '+c.cathode+'</strong><p>'+M.ion(c.cathode)+'(aq) + '+M.metals[c.cathode].n+'e⁻ → '+c.cathode+'(s)</p></div></div><p class="zsa-ec-equation">'+c.reaction+'</p><p>E°cell = E°cathode − E°anode = ('+fmt(M.metals[c.cathode].e)+') − ('+fmt(M.metals[c.anode].e)+') = <strong>'+fmt(c.e)+' V</strong></p><p class="small">'+c.n+' electrons transfer per balanced reaction. Never multiply electrode potentials by stoichiometric coefficients.</p>':'Choose two different electrodes to reveal their half-reactions.');
}
const solutions={left:'',right:''};
function place(side,s){if(side==='left')left=s;else right=s;running=false;render();}
['mode','bridge','meter','power'].forEach(id=>$(id).onchange=()=>{running=false;render();});
$('run').onclick=()=>{running=!running;render();};
$('reset').onclick=()=>{left=null;right=null;solutions.left='';solutions.right='';running=false;$('bridge').checked=false;$('meter').checked=false;$('mode').value='galvanic';$('power').value='2.0';$('feedback').textContent='';select('Zn');render();};
document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{$('feedback').textContent=b.dataset.answer==='Zn'?'Correct. Zinc oxidizes: Zn(s) → Zn²⁺(aq) + 2e⁻, so the zinc electrode loses mass.':'Try again. Copper ions gain electrons and deposit as copper metal. Which electrode supplies those electrons?';});
select('Zn');render();
})();
