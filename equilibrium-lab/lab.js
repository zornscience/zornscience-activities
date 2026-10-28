(function () {
  "use strict";
const $=id=>document.getElementById(id);
let M;document.querySelector('.thermo').dispatchEvent(new CustomEvent('equilibrium-lab-model',{detail:{receive:api=>{M=api;}}}));
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
 if(id==='eq-graph') marks.forEach(t=>{out+='<path d="M'+x(t)+' 20V218" stroke="#94a3b8" stroke-dasharray="3 4"/>';});
 keys.forEach((k,i)=>{out+='<path fill="none" stroke="'+(i?'#964a20':'#1d4ed8')+'" stroke-width="3" '+(i?'stroke-dasharray="8 4"':'')+' d="'+rows.map((r,j)=>(j?'L':'M')+x(r[0]).toFixed(2)+' '+y(r[k]).toFixed(2)).join(' ')+'"/>';});
 put(svg,'<title>'+labels+'</title>'+out+'<text x="350" y="274" text-anchor="middle" font-size="12" fill="#334155">Simulated time (s)</text>');
}
let e,eh,marks=[],playing=true,trial=null,applyingGuide=false;
function record(){const a=e.a/e.v,b=e.b/e.v,r=M.rates(e);eh.push([e.time,a,b,e.t,e.v,M.K(e.t),a>1e-12?b*b/a:'',r.forward,r.reverse]);}
function renderEq(){
 $('temp-out').textContent=e.t+' K';$('volume-out').textContent=e.v.toFixed(1)+' L';
 let a=e.a/e.v,b=e.b/e.v,q=b*b/Math.max(a,1e-20),k=M.K(e.t),balanced=Math.abs(q/k-1)<.005,empty=e.a+e.b<1e-12;
 $('state').textContent=empty?'Empty vessel':balanced?'At equilibrium':q<k?'Shifting right →':'← Shifting left';
 put($('eq-metrics'),metric(a.toFixed(3)+' M','[N₂O₄]')+metric(b.toFixed(3)+' M','[NO₂]')+metric(k.toFixed(3),'Kc · Qc = '+(empty?'undefined':e.a<1e-12?'∞':q.toFixed(3)))+metric(((e.a+e.b)*.082057*e.t/e.v).toFixed(2)+' atm','Pressure')); 
 let width=220+e.v*30,left=(600-width)/2;
 let out='<defs><linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8ab7c7" stop-opacity=".12"/><stop offset="1" stop-color="#081f32" stop-opacity=".3"/></linearGradient><linearGradient id="steel"><stop stop-color="#a5bac6"/><stop offset=".5" stop-color="#e1eaf0"/><stop offset="1" stop-color="#6e8c9e"/></linearGradient></defs><path d="M'+(left+15)+' 151h'+(width-30)+'" stroke="#081c2d" stroke-width="7" stroke-linecap="round"/><rect x="'+left+'" y="23" width="'+width+'" height="122" rx="20" fill="url(#glass)" stroke="#91b6c7" stroke-width="2"/><path d="M'+(left+22)+' 32h'+(width-44)+'" stroke="#e7f7ff" stroke-opacity=".5" stroke-width="2"/><rect x="'+(left-7)+'" y="41" width="14" height="87" rx="4" fill="url(#steel)"/><rect x="'+(left+width-7)+'" y="41" width="14" height="87" rx="4" fill="url(#steel)"/>';
 let na=Math.max(0,Math.round(e.a*22)),nb=Math.max(0,Math.round(e.b*22));
 for(let i=0;i<Math.min(120,na+nb);i++){
  let px=left+25+((i*.61803398875)%1)*(width-50),py=44+((i*.41421356237)%1)*79;
  out+='<g class="molecule"><g transform="translate('+px+' '+py+') rotate('+((i*47)%180)+')">';
  if(i<na){out+='<path d="M-4 0H4M-4 0L-9 -6M-4 0L-9 6M4 0L9 -6M4 0L9 6" stroke="#bddcff" stroke-width="1.5"/><circle cx="-4" r="4" fill="#84b8ff"/><circle cx="4" r="4" fill="#84b8ff"/>';for(let x of [-9,9])for(let y of [-6,6])out+='<circle cx="'+x+'" cy="'+y+'" r="2.8" fill="#ffc48b"/>';}
  else out+='<path d="M-6 5L0 0L6 5" stroke="#edd4b7" stroke-width="1.5"/><circle r="4" fill="#84b8ff"/><circle cx="-6" cy="5" r="3" fill="#f2a665"/><circle cx="6" cy="5" r="3" fill="#f2a665"/>';
  out+='</g></g>';
 }
 const rates=M.rates(e),scale=Math.max(rates.forward,rates.reverse,1e-12);
 $('forward-rate').value=rates.forward/scale;$('reverse-rate').value=rates.reverse/scale;
 $('forward-value').textContent=(rates.forward>0&&rates.forward<.00001?rates.forward.toExponential(2):rates.forward.toFixed(5));$('reverse-value').textContent=(rates.reverse>0&&rates.reverse<.00001?rates.reverse.toExponential(2):rates.reverse.toFixed(5));
 $('rate-note').textContent=empty?'No molecules: neither reaction can occur. Add substance to begin.':balanced?'Nearly equal, nonzero rates: both reactions continue while concentrations are stable. Equilibrium is detected when Qc is within 0.5% of Kc. Values are illustrative mol/(L·simulated s), not experimental kinetics.':'The faster direction changes the composition. Rate indicators are illustrative mol/(L·simulated s); compare their sizes.';
 if(trial&&!trial.done&&trial.instant&&balanced){finishTrial();}
 put($('vessel'),out);graph('eq-graph',eh,[1,2],'Concentration (mol/L) versus time; blue N2O4, dashed brown NO2.');
}
function resetEq(){trial=null;$('evidence').hidden=true;$('try-investigation').disabled=false;$('investigation-feedback').textContent='Make a prediction, then compare the immediate change with the settled result.';e={...M.equilibrium(2,.2,5,298),v:5,t:298,time:0};eh=[];marks=[];record();$('temp').value=298;$('volume').value=5;playing=true;document.querySelector('.thermo').classList.remove('is-paused');$('pause').textContent='Pause';$('explanation').textContent='Start at equilibrium. Make one change and compare Qc with Kc as the system responds.';renderEq();}
function disturb(text){if(trial&&!applyingGuide){trial=null;$('evidence').hidden=true;$('investigation-feedback').textContent='You changed another condition. This is now free exploration; start a guided trial again for a controlled comparison.';$('try-investigation').disabled=false;}marks.push(e.time);record();$('explanation').textContent=text;renderEq();}
$('temp').oninput=()=>{let t=+$('temp').value,up=t>e.t;if(t===e.t)return;e.t=t;disturb(up?'Heating favors the endothermic forward reaction. Kc increases; the system produces more NO₂.':'Cooling favors the exothermic reverse reaction. Kc decreases; the system produces more N₂O₄.');};
$('volume').oninput=()=>{let v=+$('volume').value,compress=v<e.v;if(v===e.v)return;e.v=v;disturb(compress?'Compression instantly raises both concentrations. The reaction then shifts left toward fewer gas molecules. Kc stays constant.':'Expansion instantly lowers both concentrations. The reaction then shifts right toward more gas molecules. Kc stays constant.');};
function substance(sign){let key=$('species').value,before=e[key];e[key]=Math.max(0,e[key]+sign*.1);if(before===e[key])return;let right=(key==='a')===(sign>0);disturb((sign>0?'Added ':'Removed ')+(Math.abs(e[key]-before)).toFixed(2)+' mol '+(key==='a'?'N₂O₄':'NO₂')+'. The reaction shifts '+(right?'right toward products.':'left toward reactants.')+' Kc stays constant.');}
$('add').onclick=()=>substance(1);$('remove').onclick=()=>substance(-1);$('reset-eq').onclick=resetEq;$('pause').onclick=()=>{playing=!playing;document.querySelector('.thermo').classList.toggle('is-paused',!playing);$('pause').textContent=playing?'Pause':'Resume';};
$('csv').onclick=()=>{let rows=eh;let text='time_s,N2O4_M,NO2_M,temperature_K,volume_L,Kc,Qc,forward_rate_M_per_sim_s,reverse_rate_M_per_sim_s'+'\n'+rows.map(r=>r.join(',')).join('\n');let url=URL.createObjectURL(new Blob([text],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='equilibrium-lab.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('print').onclick=()=>window.print();
function snapshot(){const a=e.a/e.v,b=e.b/e.v;return {a,b,q:a>1e-12?b*b/a:Infinity,k:M.K(e.t)};}
function evidenceRows(){const rows=[['Before stress',trial.before],['Immediately after',trial.instant]];if(trial.after)rows.push(['Settled',trial.after]);put($('evidence-body'),rows.map(([name,s])=>'<tr><th scope="row">'+name+'</th><td>'+s.a.toFixed(4)+'</td><td>'+s.b.toFixed(4)+'</td><td>'+s.q.toFixed(4)+'</td><td>'+s.k.toFixed(4)+'</td></tr>').join(''));$('evidence').hidden=false;}
function finishTrial(){trial.done=true;trial.after=snapshot();evidenceRows();const correct={add:'right',compress:'left',heat:'right'}[trial.kind];const reason={add:'Adding reactant lowers Qc below Kc. Reactant is consumed and more NO₂ forms; Kc stays constant.',compress:'Both concentrations jump when volume decreases. Qc rises above Kc, then the reaction shifts left. The final NO₂ concentration can still exceed its original value: shift direction describes the reaction after the jump.',heat:'Heating raises Kc for this endothermic forward reaction. Concentrations do not jump instantly from a temperature change at fixed volume; the reaction then makes more NO₂.'}[trial.kind];$('investigation-feedback').textContent=(trial.prediction===correct?'Your prediction is supported. ':'Revise your prediction: the reaction shifted '+correct+'. ')+reason+' At the new equilibrium, Qc ≈ Kc and the forward and reverse rates match.';$('try-investigation').disabled=false;}
$('try-investigation').onclick=()=>{const prediction=$('prediction').value,kind=$('investigation').value;if(!prediction){$('investigation-feedback').textContent='Choose a prediction before applying the change.';$('prediction').focus();return;}resetEq();trial={kind,prediction,before:snapshot(),done:false};applyingGuide=true;
 if(kind==='add'){ $('species').value='a';substance(1); }
 if(kind==='compress'){ $('volume').value=2;$('volume').dispatchEvent(new Event('input')); }
 if(kind==='heat'){ $('temp').value=320;$('temp').dispatchEvent(new Event('input')); }
 applyingGuide=false;trial.instant=snapshot();evidenceRows();$('try-investigation').disabled=true;$('investigation-feedback').textContent='Observe the immediate change, then wait for the system to settle. Pause or advance time to inspect the evidence.';};
function tick(dt){e={...M.advance(e,dt),time:e.time+dt};record();renderEq();if(eh.length>=3600){playing=false;$('pause').textContent='Resume';$('explanation').textContent='This run has reached its recording limit. Reset experiment to start a new graph.';}}
$('eq-step').onclick=()=>{playing=false;document.querySelector('.thermo').classList.add('is-paused');$('pause').textContent='Resume';if(eh.length<3600)tick(1);};
resetEq();setInterval(()=>{if(document.hidden||!playing||eh.length>=3600)return;tick(.25);},250);
}());
