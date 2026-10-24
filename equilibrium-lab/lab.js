(function () {
  "use strict";
const $=id=>document.getElementById(id);
let M;document.querySelector('.thermo').dispatchEvent(new CustomEvent('equilibrium-lab-model',{detail:{receive:api=>{M=api;}}}));
// All markup is generated from fixed templates and numeric model values.
function put(el,markup){let svg=el.namespaceURI==='http://www.w3.org/2000/svg';let doc=new DOMParser().parseFromString(svg?'<svg xmlns="http://www.w3.org/2000/svg">'+markup+'</svg>':'<body>'+markup+'</body>','text/html');let source=svg?doc.querySelector('svg'):doc.body;el.replaceChildren(...Array.from(source.childNodes).map(n=>document.importNode(n,true)));}
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
 put(svg,'<title>'+labels+'</title>'+out+'<text x="350" y="258" text-anchor="middle" font-size="12" fill="#334155">Simulated time (s)</text>');
}
let e,eh,marks=[],playing=true;
function record(){eh.push([e.time,e.a/e.v,e.b/e.v]);}
function renderEq(){
 $('temp-out').textContent=e.t+' K';$('volume-out').textContent=e.v.toFixed(1)+' L';
 let a=e.a/e.v,b=e.b/e.v,q=b*b/Math.max(a,1e-20),k=M.K(e.t),balanced=Math.abs(q/k-1)<.005;
 $('state').textContent=balanced?'At equilibrium':q<k?'Shifting right →':'← Shifting left';
 put($('eq-metrics'),metric(a.toFixed(3)+' M','[N₂O₄]')+metric(b.toFixed(3)+' M','[NO₂]')+metric(k.toFixed(3),'Kc · Qc = '+q.toFixed(3))+metric(((e.a+e.b)*.082057*e.t/e.v).toFixed(2)+' atm','Pressure')); 
 let width=170+e.v*35,left=(600-width)/2,out='<rect x="'+left+'" y="8" width="'+width+'" height="150" rx="18" fill="#fff8f2" stroke="#a8b8cc" stroke-width="3"/>';
 let na=Math.max(1,Math.round(e.a*35)),nb=Math.max(1,Math.round(e.b*35));
 for(let i=0;i<Math.min(180,na+nb);i++){let px=left+15+((i*.61803398875)%1)*(width-30),py=24+((i*.41421356237)%1)*115;out+='<circle cx="'+px+'" cy="'+py+'" r="'+(i<na?6:4)+'" fill="'+(i<na?'#fff':'#964a20')+'" stroke="'+(i<na?'#1d4ed8':'#964a20')+'" stroke-width="2"/>';}
 put($('vessel'),out);graph('eq-graph',eh,[1,2],'Concentration (mol/L) versus time; blue N2O4, dashed brown NO2.');
}
function resetEq(){e={...M.equilibrium(1,.2,5,298),v:5,t:298,time:0};eh=[];marks=[];record();$('temp').value=298;$('volume').value=5;playing=true;$('pause').textContent='Pause';$('explanation').textContent='Start at equilibrium. Make one change and compare Qc with Kc as the system responds.';renderEq();}
function disturb(text){marks.push(e.time);record();$('explanation').textContent=text;renderEq();}
$('temp').oninput=()=>{let t=+$('temp').value,up=t>e.t;e.t=t;disturb(up?'Heating favors the endothermic forward reaction. Kc increases; the system produces more NO₂.':'Cooling favors the exothermic reverse reaction. Kc decreases; the system produces more N₂O₄.');};
$('volume').oninput=()=>{let v=+$('volume').value,compress=v<e.v;e.v=v;disturb(compress?'Compression instantly raises both concentrations. The reaction then shifts left toward fewer gas molecules. Kc stays constant.':'Expansion instantly lowers both concentrations. The reaction then shifts right toward more gas molecules. Kc stays constant.');};
function substance(sign){let key=$('species').value,before=e[key];e[key]=Math.max(0,e[key]+sign*.1);if(before===e[key])return;let right=(key==='a')===(sign>0);disturb((sign>0?'Added ':'Removed ')+(Math.abs(e[key]-before)).toFixed(2)+' mol '+(key==='a'?'N₂O₄':'NO₂')+'. The reaction shifts '+(right?'right toward products.':'left toward reactants.')+' Kc stays constant.');}
$('add').onclick=()=>substance(1);$('remove').onclick=()=>substance(-1);$('reset-eq').onclick=resetEq;$('pause').onclick=()=>{playing=!playing;$('pause').textContent=playing?'Pause':'Resume';};
$('csv').onclick=()=>{let rows=eh;let text='time_s,N2O4_M,NO2_M'+'\n'+rows.map(r=>r.join(',')).join('\n');let url=URL.createObjectURL(new Blob([text],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='equilibrium-lab.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('print').onclick=()=>window.print();
resetEq();setInterval(()=>{if(document.hidden||!playing||eh.length>=3600)return;let target=M.equilibrium(e.a,e.b,e.v,e.t),f=1-Math.exp(-.25/3);e.a+=(target.a-e.a)*f;e.b+=(target.b-e.b)*f;e.time+=.25;record();renderEq();},250);
}());
