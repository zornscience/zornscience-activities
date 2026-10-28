(function () {
  "use strict";
const $=id=>document.getElementById(id);
let M;document.querySelector('.thermo').dispatchEvent(new CustomEvent('calorimetry-lab-model',{detail:{receive:api=>{M=api;}}}));
// All markup is generated from fixed templates and numeric model values.
function put(el,markup){const svg=el.namespaceURI==='http://www.w3.org/2000/svg',tbody=el.tagName==='TBODY';const wrapped=svg?'<svg xmlns="http://www.w3.org/2000/svg">'+markup+'</svg>':tbody?'<table><tbody>'+markup+'</tbody></table>':'<body>'+markup+'</body>';const doc=new DOMParser().parseFromString(wrapped,'text/html'),source=svg?doc.querySelector('svg'):tbody?doc.querySelector('tbody'):doc.body;el.replaceChildren(...Array.from(source.childNodes).map(n=>document.importNode(n,true)));}
function metric(value,label){return '<div><strong>'+value+'</strong><span>'+label+'</span></div>';}
function graph(id,rows,keys,labels){
 const svg=$(id), W=640,H=260,L=62,R=18,T=20,B=42;
 let maxX=Math.max(30,...rows.map(r=>r[0])), vals=rows.flatMap(r=>keys.map(k=>r[k]));
 let lo=id==='cal-graph'?Math.floor(Math.min(...vals,22)-1):0,hi=id==='cal-graph'?Math.ceil(Math.max(...vals,23)+1):Math.max(.3,...vals)*1.15;
 const x=v=>L+v/maxX*(W-L-R),y=v=>H-B-(v-lo)/(hi-lo)*(H-T-B);
 let out='';for(let i=0;i<=4;i++){let v=lo+(hi-lo)*i/4,yy=y(v);out+='<path d="M'+L+' '+yy+'H'+(W-R)+'" stroke="#e2e8f0"/><text x="'+(L-8)+'" y="'+(yy+4)+'" text-anchor="end" font-size="12" fill="#334155">'+v.toFixed(2)+'</text>';}
 for(let i=0;i<=4;i++){let v=maxX*i/4;out+='<text x="'+x(v)+'" y="238" text-anchor="middle" font-size="12" fill="#334155">'+v.toFixed(0)+'</text>';}
 keys.forEach((k,i)=>{out+='<path fill="none" stroke="'+(i?'#964a20':'#1d4ed8')+'" stroke-width="3" '+(i?'stroke-dasharray="8 4"':'')+' d="'+rows.map((r,j)=>(j?'L':'M')+x(r[0]).toFixed(2)+' '+y(r[k]).toFixed(2)).join(' ')+'"/>';});
 put(svg,'<title>'+labels+'</title>'+out+'<text x="350" y="274" text-anchor="middle" font-size="12" fill="#334155">Simulated time (s)</text>');
}
let c=null,ch=[],calPlaying=true,trials=[],solution="";
function renderApparatus(){
 const metal=$('experiment').value==='metal',raw=c?c.temp:$('initial').valueAsNumber,temp=Number.isFinite(raw)?raw:22;
 const level=Math.max(0,Math.min(1,(temp-5)/95)),h=15+level*108;
 let out='<defs><linearGradient id="cup-shell"><stop stop-color="#a2b5c3"/><stop offset=".2" stop-color="#edf4f7"/><stop offset=".75" stop-color="#c7d7e1"/><stop offset="1" stop-color="#8da7b7"/></linearGradient><linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#75c5dd" stop-opacity=".85"/><stop offset="1" stop-color="#3d7ea3" stop-opacity=".8"/></linearGradient><linearGradient id="sample-fill"><stop stop-color="#ffca91"/><stop offset=".5" stop-color="#c77d51"/><stop offset="1" stop-color="#8d543b"/></linearGradient></defs>';
 out+='<ellipse cx="310" cy="216" rx="133" ry="10" fill="#081e2e" opacity=".6"/><path d="M201 70L218 199Q220 212 237 212H384Q400 212 403 199L420 70Z" fill="url(#cup-shell)"/><path d="M215 78L231 194Q232 199 241 199H380Q388 199 389 193L404 78Z" fill="#dcebf1"/><path d="M223 119L233 191Q235 196 243 196H377Q385 196 386 190L396 119Z" fill="url(#water-fill)"/><path d="M223 119Q250 112 277 119T333 119T396 119" stroke="#b8eff7" fill="none" stroke-width="2"/><path d="M229 81L242 184" stroke="#fff" stroke-width="4" opacity=".5"/><ellipse cx="310" cy="70" rx="112" ry="15" fill="#e7f0f4" stroke="#adbfcc" stroke-width="2"/><ellipse cx="310" cy="70" rx="92" ry="7" fill="#8ca9ba"/>';
 if(metal){let x=c?278:125,y=c?147:80;out+='<path d="M'+(x+15)+' '+y+'V48" stroke="#a8bdca" stroke-width="2" stroke-dasharray="4 3"/><rect x="'+x+'" y="'+y+'" width="31" height="35" rx="4" fill="url(#sample-fill)" stroke="#f5cd9e"/><path d="M'+(x+4)+' '+(y+5)+'h22" stroke="#ffe3bd" stroke-opacity=".7"/><text x="105" y="142" text-anchor="middle" fill="#d0e3ec" font-size="11">'+'METAL SAMPLE'+'</text><path d="M145 138L'+(x+10)+' '+(y+27)+'" fill="none" stroke="#7f9dab" stroke-width="1"/>';}
 else out+='<text x="101" y="95" text-anchor="middle" fill="#bce5e3" font-size="14">H⁺ + OH⁻</text><text x="101" y="117" text-anchor="middle" fill="#a7c5d6" font-size="11">→ H₂O + heat</text><path d="M130 133L234 150" stroke="#80adaf" stroke-dasharray="4 4"/>';
 out+='<rect x="348" y="21" width="13" height="155" rx="6" fill="#d9e8ec" stroke="#94adb9"/><rect x="353" y="30" width="3" height="138" rx="1.5" fill="#b9cbd0"/><rect x="353" y="'+(168-h)+'" width="3" height="'+h+'" rx="1.5" fill="#d36251"/><circle cx="354.5" cy="174" r="7" fill="#d36251" stroke="#dbe7e9" stroke-width="3"/>';
 for(let i=0;i<6;i++)out+='<path d="M361 '+(35+i*22)+'h6" stroke="#bdcfd8"/>';
 out+='<path d="M370 37H454" stroke="#7f9dab"/><text x="466" y="41" fill="#bed5e1" font-size="10">PROBE</text><path d="M399 178H453" stroke="#7f9dab"/><text x="465" y="181" fill="#bed5e1" font-size="10">INSULATION</text><text x="310" y="150" fill="#e6f7fc" text-anchor="middle" font-size="11">'+(metal?'WATER':'SOLUTION')+'</text>';
 put($('cal-apparatus'),out);
 $('cal-apparatus').setAttribute('aria-label',(metal?'Heated metal and water':'Acid-base solution')+' in an insulated calorimeter with a temperature probe reading '+temp.toFixed(2)+' degrees Celsius.');
 $('apparatus-caption').textContent=metal?(c?(Math.abs(c.final-c.initial)<1e-9?'The starting temperatures match: there is no net heat transfer.':c.tm>c.initial?'The warmer metal cools as the water warms. Total energy is conserved.':'The warmer water cools as the metal warms. Total energy is conserved.'):'Start the experiment to place the metal into the water. Heat flows from warmer to cooler.'):'Neutralization releases heat into the surrounding solution.';
}
function setupLocked(locked){$('cal').querySelector('aside').querySelectorAll('input,select').forEach(el=>{el.disabled=locked;});$('cal-pause').disabled=!locked;$('cal-finish').disabled=!locked;}
function resetCal(){c=null;ch=[];solution='';calPlaying=true;setupLocked(false);renderApparatus();const value=$('initial').valueAsNumber,safe=Number.isFinite(value)?value:22;$('thermometer').textContent=Number.isFinite(value)?value.toFixed(2)+' °C':'Enter temperature';$('cal-result').hidden=false;$('cal-result').textContent='Complete a run, use the measured temperatures, then check your calculation.';$('cal-measurements').textContent='';$('cal-practice').hidden=true;$('cal-prediction-feedback').hidden=true;$('cal-answer').value='';$('answer-feedback').textContent='';$('cal-status').textContent='Set up an experiment, then start the run.';$('cal-time').textContent='0.0 simulated s';$('cal-pause').textContent='Pause';$('start-cal').disabled=false;$('cal-error').textContent='';graph('cal-graph',[[0,safe]],[1],'Temperature (°C) versus time.');}
$('experiment').onchange=()=>{let metal=$('experiment').value==='metal';$('metal-fields').hidden=!metal;$('acid-fields').hidden=metal;$('start-cal').textContent=metal?'Place metal & start':'Mix solutions & start';resetCal();};
$('cal').querySelector('aside').querySelectorAll('input,select').forEach(el=>{if(el.id!=='experiment')el.addEventListener(el.tagName==='SELECT'?'change':'input',resetCal);});
$('start-cal').onclick=()=>{
 const ids=['initial',...($('experiment').value==='metal'?['mass','hot','water']:['av','ac','bv','bc'])];
 const invalid=ids.find(id=>!$(id).checkValidity()||$(id).value==='');
 if(invalid){$('cal-error').textContent='Enter valid values within the indicated input limits.';$(invalid).reportValidity();return;}
 resetCal();let tw=+$('initial').value;c={time:0,initial:tw,temp:tw,type:$('experiment').value,recorded:false,prediction:$('cal-prediction').value};
 if(c.type==='metal'){Object.assign(c,{m:+$('mass').value,cm:+$('metal').value,tm:+$('hot').value,w:+$('water').value,material:$('metal').selectedOptions[0].textContent});c.final=M.metal(c.m,c.cm,c.tm,c.w,tw);}
 else{Object.assign(c,{av:+$('av').value,ac:+$('ac').value,bv:+$('bv').value,bc:+$('bc').value});Object.assign(c,M.neutral(c.av,c.ac,c.bv,c.bc,tw));c.w=c.av+c.bv;}
 ch=[[0,tw]];setupLocked(true);$('start-cal').disabled=true;$('cal-result').textContent='Collecting temperature data. Settings are held constant during this run; Reset stops it.';$('cal-status').textContent='Run started. Watch the temperature change; pause or go directly to the final reading.';renderApparatus();
};
$('reset-cal').onclick=resetCal;
function compareTrials(){put($('comparison-body'),trials.length?trials.map((r,i)=>'<tr><th scope="row">'+(i+1)+'. '+r.setup+'</th><td>'+r.initial.toFixed(2)+'</td><td>'+r.final.toFixed(2)+'</td><td>'+r.delta.toFixed(3)+'</td></tr>').join(''):'<tr><td colspan="4">Complete a trial to collect evidence.</td></tr>');}
function finishCalculation(){
 let delta=c.final-c.initial,q=c.w*4.184*delta,metal=c.type==='metal',informative=!metal||Math.abs(delta)>1e-9;
 const observed=Math.abs(delta)<1e-9?'same':delta>0?'rise':'fall';$('cal-prediction-feedback').hidden=false;$('cal-prediction-feedback').textContent=(c.prediction?(c.prediction===observed?'Your prediction is supported. ':'Revise your prediction using the measurements. '):'Observed: ')+(observed==='same'?'No temperature change: the two materials began at the same temperature.':observed==='rise'?'The water / solution warmed as it gained energy.':'The water cooled as it transferred energy to the cooler metal.');
 const setup=metal?c.material+', '+c.m+' g metal at '+c.tm+' °C; '+c.w+' g water':c.av+' mL '+c.ac+' M HCl + '+c.bv+' mL '+c.bc+' M NaOH';
 trials.push({setup,initial:c.initial,final:c.final,delta});if(trials.length>4)trials.shift();compareTrials();
 put($('cal-measurements'),'<table><caption>Measured temperatures · °C</caption><thead><tr><th scope="col">Material</th><th scope="col">Initial</th><th scope="col">Final</th><th scope="col">ΔT</th></tr></thead><tbody><tr><th scope="row">'+(metal?'Water':'Solution')+'</th><td>'+c.initial.toFixed(3)+'</td><td>'+c.final.toFixed(3)+'</td><td>'+delta.toFixed(3)+'</td></tr>'+(metal?'<tr><th scope="row">Metal</th><td>'+c.tm.toFixed(3)+'</td><td>'+c.final.toFixed(3)+'</td><td>'+(c.final-c.tm).toFixed(3)+'</td></tr>':'')+'</tbody></table>');
 if(!informative){$('cal-result').hidden=false;$('cal-result').textContent='The initial temperatures are equal: ΔT = 0 and q = 0 for both materials. These data cannot determine specific heat (the calculation would divide 0 by 0). Choose different starting temperatures and run again.';$('cal-practice').hidden=true;return;}
 $('cal-practice').hidden=false;$('cal-result').hidden=true;$('cal-answer-label').textContent=metal?'Your calculated specific heat, J/(g·°C)':'Your calculated ΔH of neutralization, kJ/mol H₂O';
 $('answer-feedback').textContent=metal?'Use qwater = −qmetal. You can open the worked solution whenever you need it.':'Use the limiting reactant to find mol H₂O, and convert J to kJ. Include the reaction’s heat sign.';
 solution='<p>ΔT = '+delta.toFixed(3)+' °C · q'+(metal?'water':'solution')+' = '+q.toFixed(1)+' J</p>'+(metal?'<p>cmetal = '+c.w+' × 4.184 × '+delta.toFixed(3)+' / ['+c.m+' × ('+c.tm+' − '+c.final.toFixed(3)+')]</p><strong>Specific heat = '+c.cm.toFixed(3)+' J/(g·°C)</strong><p>qmetal = '+(-q).toFixed(1)+' J; qmetal + qwater = 0. Specific heat is positive even when the water cools.</p>':'<p>H₂O formed = '+c.n.toFixed(4)+' mol (limiting reactant).</p><strong>ΔH = −'+q.toFixed(1)+' / '+c.n.toFixed(4)+' = −57.3 kJ/mol</strong><p>The solution gains heat; the reaction loses heat. ΔHreaction is negative.</p>');
}
function renderCal(){let done=c.time>=40;c.temp=done?c.final:c.initial+(c.final-c.initial)*(1-Math.exp(-c.time/5));ch.push([c.time,c.temp]);renderApparatus();$('thermometer').textContent=c.temp.toFixed(2)+' °C';$('cal-time').textContent=c.time.toFixed(1)+' simulated s';graph('cal-graph',ch,[1],'Temperature (°C) versus time.');if(done&&!c.recorded){c.recorded=true;setupLocked(false);$('cal-status').textContent='Thermal equilibrium reached. Use the measured values to calculate, then compare another trial.';$('start-cal').disabled=false;finishCalculation();}}
$('cal-pause').onclick=()=>{if(!c)return;calPlaying=!calPlaying;$('cal-pause').textContent=calPlaying?'Pause':'Resume';$('cal-status').textContent=calPlaying?'Run resumed.':'Run paused. Inspect the temperature, resume, or go to the final reading.';};
$('cal-finish').onclick=()=>{if(!c)return;for(let time=c.time+.25;time<40;time+=.25){ch.push([time,c.initial+(c.final-c.initial)*(1-Math.exp(-time/5))]);}c.time=40;renderCal();};
$('show-solution').onclick=()=>{if(!solution)return;put($('cal-result'),solution);$('cal-result').hidden=false;};
$('check-answer').onclick=()=>{
 if(!c||!c.recorded)return;const value=$('cal-answer').valueAsNumber,metal=c.type==='metal',expected=metal?c.cm:-57.3;
 if(!Number.isFinite(value)){$('answer-feedback').textContent='Enter a numerical answer first.';$('cal-answer').focus();return;}
 if(Math.abs(value-expected)<=Math.abs(expected)*.02){$('answer-feedback').textContent='Your calculation matches the energy balance (within 2% for rounding). Explain the sign and compare the two materials’ temperature changes.';put($('cal-result'),solution);$('cal-result').hidden=false;}
 else if(metal&&value<0){$('answer-feedback').textContent='Specific heat is positive. The water and metal have opposite heat changes: qwater = −qmetal. Use each material’s own initial temperature.';}
 else if(!metal&&value>0){$('answer-feedback').textContent='Check the sign: the solution gains heat, so the reaction releases heat. ΔHreaction must be negative.';}
 else if(Math.abs(value-expected*1000)<Math.abs(expected)*20){$('answer-feedback').textContent='Check your units: specific heat uses J/(g·°C); molar enthalpy uses kJ/mol. A factor of 1000 may be missing.';}
 else{$('answer-feedback').textContent=metal?'Use the water mass and 4.184 to find qwater, then divide by mmetal × (Tmetal,initial − Tfinal). Keep extra digits until the last step.':'Use qsolution = total solution mass × 4.184 × ΔT. Divide −q by the smaller number of moles of HCl or NaOH, then convert J to kJ.';}
};
$('clear-trials').onclick=()=>{trials=[];compareTrials();};
$('csv').onclick=()=>{let rows=ch;if(!rows.length){$('cal-error').textContent='Run an experiment before downloading data.';return;}let text='time_s,temperature_C'+'\n'+rows.map(r=>r.join(',')).join('\n');let url=URL.createObjectURL(new Blob([text],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='calorimetry-lab.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('print').onclick=()=>window.print();
resetCal();setInterval(()=>{if(document.hidden||!calPlaying||!c||c.time>=40)return;c.time+=.25;renderCal();},250);
}());
