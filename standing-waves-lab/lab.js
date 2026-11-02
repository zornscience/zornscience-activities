(function () {
  "use strict";
const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg';
const root=document.querySelector('[data-zsa-activity="standing-waves-lab"]');
let i18n;
if(root)root.dispatchEvent(new CustomEvent('zsa:request-i18n',{detail:{receive:api=>{i18n=api;}}}));
// Every sentence is one full template from data.js, filled with values, so each language keeps its own word order.
const tr=(text,values)=>i18n?i18n.text(text,values):text.replace(/\{(\w+)\}/g,(m,k)=>values&&values[k]!==undefined?values[k]:m);
const ids=['frequency','amplitude','mass','length','density','phase','cursor-a','cursor-b'];
let running=false,locked=false,time=0,last=0,drag=null;
let samples=[],task="harmonics";
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
locked=reduced;
function svg(tag,attrs,parent,text){const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;parent.appendChild(e);return e;}
function model(){const L=+$('length').value,T=+$('mass').value/1000*9.81,mu=+$('density').value,v=Math.sqrt(T/mu),f1=v/(2*L),f=+$('frequency').value,n=Math.max(1,Math.round(f/f1)),detune=Math.abs(f-n*f1)/(n*f1);return{L,T,v,f1,f,n,detune,resonant:detune<0.005};}
function response(m,x,phase){if(m.resonant)return Math.sin(m.n*Math.PI*x)*Math.sin(phase-Math.PI/2)/m.n;let y=0;for(let n=1;n<=Math.max(16,Math.ceil(m.f/m.f1)+4);n++){const r=m.f/(n*m.f1),d=1-r*r,b=2*0.018*r;const gain=0.036/(n*Math.sqrt(d*d+b*b));y+=gain*Math.sin(n*Math.PI*x)*Math.sin(phase-Math.atan2(b,d));}return y;}
// Spatial quadrature samples only change when the setup changes. Animation reuses them.
function prepareWave(){const m=model();samples=[];for(let i=0;i<=400;i++){const x=i/400;samples.push([response(m,x,0),response(m,x,Math.PI/2)]);}}
function displacement(sample,phase){return running?(sample[0]*Math.cos(phase)+sample[1]*Math.sin(phase))*72*(+$('amplitude').value/100):0;}
function draw(){const phase=locked?(+$('phase').value*Math.PI/180+Math.PI/2):2*Math.PI*model().f*time;
$('wave').setAttribute('d',samples.map((v,i)=>(i?'L':'M')+(326+514*i/400).toFixed(2)+' '+(180-displacement(v,phase)).toFixed(2)).join(''));
$('particle-dot').setAttribute('cy',(180-displacement(samples[100],phase)).toFixed(2));
}
function decorations(){const m=model();let env='';for(const sign of [-1,1])samples.forEach((v,i)=>{const h=running?Math.hypot(...v)*72*(+$('amplitude').value/100):0;env+=(i?'L':'M')+(326+514*i/400).toFixed(2)+' '+(180+sign*h).toFixed(2);});
$('envelope').setAttribute('d',env);$('envelope').setAttribute('display',$('ghost').checked?'inline':'none');
$('particle').setAttribute('display',$('track').checked?'inline':'none');
$('markers').replaceChildren();if($('nodes').checked&&m.resonant&&running&&+$('amplitude').value>0){for(let i=0;i<=m.n;i++){const x=326+514*i/m.n;svg('circle',{cx:x,cy:180,r:5,fill:'#79d8e0',stroke:'#112c3c'},$('markers'));if(m.n<=12)svg('text',{x,y:145,fill:'#a2e9ef','text-anchor':'middle','font-size':11},$('markers'),'N');}for(let i=0;i<m.n;i++){const x=326+514*(i+.5)/m.n;svg('path',{d:`M${x} 165v30`,stroke:'#e6b473','stroke-dasharray':'3 3'},$('markers'));if(m.n<=12)svg('text',{x,y:115,fill:'#f4cd95','text-anchor':'middle','font-size':11},$('markers'),'A');}}
$('snap-nodes').disabled=!(running&&m.resonant&&+$('amplitude').value>0);
const notes=[locked?tr('Strobe lock samples the same phase each cycle; the actual string still vibrates. Change phase to inspect another position.'):tr('Motion is shown at 1/40 speed. The generator reads the physical frequency, not the slowed display frequency.')];
if($('track').checked)notes.push(tr('The green point is one piece of string: its horizontal position stays fixed.'));
if($('nodes').checked&&!m.resonant)notes.push(tr('Tune to a resonance to reveal stationary nodes.'));
$('view-note').textContent=notes.join(' ');
}
function ruler(){const m=model();$('ruler').replaceChildren();svg('rect',{x:326,y:230,width:514,height:40,rx:3,fill:'#dbd5b6',stroke:'#857e60'},$('ruler'));const cm=Math.round(m.L*100);for(let i=0;i<=cm;i++){const x=326+514*i/cm;svg('path',{d:`M${x} 230v${i%10===0?17:i%5===0?12:6}`,stroke:'#4e5146','stroke-width':.8},$('ruler'));if(i%10===0)svg('text',{x,y:262,'text-anchor':i===0?'start':i===cm?'end':'middle',fill:'#343e39','font-size':10},$('ruler'),i);}svg('text',{x:845,y:263,fill:'#c0d4de','font-size':10},$('ruler'),'cm');}
function cursors(){const m=model();$('cursors').replaceChildren();['a','b'].forEach((k,i)=>{const val=+$('cursor-'+k).value,x=326+514*val/m.L,color=i?'#ecb677':'#77d8e3';const g=svg('g',{'data-cursor':k,role:'slider',tabindex:0,'aria-label':tr('Ruler cursor {letter}',{letter:k.toUpperCase()}),'aria-valuemin':0,'aria-valuemax':m.L,'aria-valuenow':val,'aria-valuetext':tr('{value} meters',{value:val.toFixed(3)})},$('cursors'));svg('path',{d:`M${x} 162V285`,stroke:color,'stroke-dasharray':'4 4'},g);svg('path',{d:`M${x-9} 281h18v24h-18z`,fill:color,stroke:'#173547'},g);svg('text',{x,y:298,'text-anchor':'middle',fill:'#163241','font-size':12,'pointer-events':'none'},g,k.toUpperCase());svg('rect',{x:x-15,y:272,width:30,height:44,fill:'transparent'},g);$('cursor-'+k+'-value').textContent=val.toFixed(3)+' m';});$('separation').textContent=Math.abs(+$('cursor-b').value-+$('cursor-a').value).toFixed(3)+' m';measurementFeedback();}
function update(rebuild=true){const m=model();for(const k of ['cursor-a','cursor-b']){$(k).max=m.L;if(+$(k).value>m.L)$(k).value=m.L;}
$('frequency-value').textContent=m.f.toFixed(2)+' Hz';$('display').textContent=m.f.toFixed(2)+' Hz';$('amplitude-value').textContent=$('amplitude').value+'%';$('mass-value').textContent=$('mass').value+' g';$('weight-label').textContent=$('mass').value+' g';$('length-value').textContent=m.L.toFixed(2)+' m';$('phase-value').textContent=$('phase').value+'°';$('tension').textContent=tr('TENSION {t} N',{t:m.T.toFixed(2)});$('velocity').textContent=m.v.toFixed(2)+' m/s';$('fundamental').textContent=m.f1.toFixed(2)+' Hz';$('harmonic').textContent='n = '+m.n;$('resonance').textContent=tr(m.resonant?'Tuned':'Detuned');$('badge').textContent=tr(!running?'OSCILLATOR OFF':locked?'STROBE LOCKED':'SLOW MOTION');$('state').textContent=!running?tr('READY TO DRIVE THE STRING'):m.resonant?tr(m.n===1?'HARMONIC {n} · {n} LOOP':'HARMONIC {n} · {n} LOOPS',{n:m.n}):tr('TUNE THE GENERATOR TO BUILD A STANDING WAVE');$('view-label').textContent=tr(locked?'STROBE · SYNCHRONIZED PHASE':'SLOW MOTION · 1/40 SPEED');$('power').textContent=tr(running?'■ Stop oscillator':'▶ Start oscillator');$('power').setAttribute('aria-pressed',running);$('strobe').textContent=tr(locked?'Strobe lock: on':'Strobe lock: off');$('strobe').setAttribute('aria-pressed',locked);$('phase').disabled=!locked;
$('insight').textContent=!running?tr('Start the oscillator, then tune the frequency to make the string resonate.'):+$('amplitude').value===0?tr('Drive amplitude is zero: the string is at rest.'):m.resonant?tr('Harmonic {n}: {nodes} nodes, {n} antinodes. Adjacent nodes are {spacing} m apart; wavelength is {wavelength} m.',{n:m.n,nodes:m.n+1,spacing:(m.L/m.n).toFixed(3),wavelength:(2*m.L/m.n).toFixed(3)}):tr('Between resonances: the response is smaller and interior points do not form exact stationary nodes. Try a harmonic preset or fine-tune the frequency.');
document.querySelectorAll('[data-harmonic]').forEach(b=>{let target=+b.dataset.harmonic*m.f1;b.disabled=target>180;b.setAttribute('aria-pressed',Math.abs(m.f-target)<.051);b.title=target.toFixed(2)+' Hz';});if(rebuild)ruler();prepareWave();decorations();cursors();learningFeedback();draw();}
ids.forEach(k=>$(k).addEventListener('input',()=>update(!k.startsWith('cursor')&&k!=='phase')));['nodes','ghost','track'].forEach(k=>$(k).addEventListener('change',()=>{decorations();draw();}));
document.querySelectorAll('[data-harmonic]').forEach(b=>b.addEventListener('click',()=>{$('frequency').value=(+b.dataset.harmonic*model().f1).toFixed(2);update();}));
$('power').addEventListener('click',()=>{running=!running;update(false);});$('strobe').addEventListener('click',()=>{locked=!locked;update(false);});$('reset').addEventListener('click',()=>{Object.entries({frequency:26.1,amplitude:65,mass:200,length:1.2,density:.002,phase:90,'cursor-a':0,'cursor-b':.4}).forEach(([k,v])=>$(k).value=v);running=false;locked=reduced;time=0;$('nodes').checked=false;$('ghost').checked=true;$('track').checked=false;task='harmonics';update();});

const investigations={
 harmonics:['Start the oscillator. Tune to harmonics 1, 2 and 3 using the generator controls. Before changing frequency, predict: how many loops will appear? What stays still?', 'At resonance, an integer number of half-wavelengths fits the string. Harmonic n has n loops, n antinodes and n + 1 nodes, including both ends. A loop is half a wavelength.'],
 measure:['Tune harmonic 3 and turn on Strobe lock. Place A and B at two neighboring nodes. Is that distance a whole wavelength or half? Change strobe phase: do the nodes move?', 'Neighboring nodes are half a wavelength apart, so wavelength λ = 2Δx. Neighboring crests are a full wavelength apart. The strobe changes the position you see within a cycle; it does not change wavelength or stop the actual vibration.'],
 tension:['Tune harmonic 2. Keep frequency, length and string density fixed, then increase the hanging mass. Will the same resonance remain? Find harmonic 2 again and compare the required frequency.', 'More mass increases tension (T = mg), so waves travel faster. At fixed length and harmonic number, the required frequency rises as √T. Doubling mass multiplies it by √2, not 2. Amplitude changes how far the string moves; it does not change the resonance frequency in this model.']
};
function learningFeedback(){const m=model(),target=m.n*m.f1,delta=target-m.f;
$('tuning-label').textContent=!running?tr('Oscillator off'):+$('amplitude').value===0?tr('No drive · string at rest'):m.resonant?tr('Resonance · harmonic {n}',{n:m.n}):tr('Between resonances');
$('tuning-hint').textContent=m.resonant?tr('Nearest resonance: {f} Hz · frequency ratio f/f₁ ≈ {n}',{f:target.toFixed(2),n:m.n}):tr(delta>0?'Nearest resonance: {f} Hz · increase by {delta} Hz':'Nearest resonance: {f} Hz · decrease by {delta} Hz',{f:target.toFixed(2),delta:Math.abs(delta).toFixed(2)});
$('task-prompt').textContent=tr(investigations[task][0]);$('task-explain').textContent=tr(investigations[task][1]);
document.querySelectorAll('[data-task]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.task===task));
const scene={f:m.f.toFixed(1),t:m.T.toFixed(2),L:m.L.toFixed(2),n:m.n,nodes:m.n+1};
$('scene-desc').textContent=!running?tr('Generator frequency {f} hertz; tension {t} newtons; vibrating length {L} meters. Oscillator off.',scene):m.resonant?tr('Generator frequency {f} hertz; tension {t} newtons; vibrating length {L} meters. Harmonic {n} with {nodes} stationary nodes and {n} antinodes.',scene):tr('Generator frequency {f} hertz; tension {t} newtons; vibrating length {L} meters. The string is driven between resonances.',scene);
}
function measurementFeedback(){const m=model(),a=+$('cursor-a').value,b=+$('cursor-b').value,spacing=m.L/m.n;
const valid=running&&+$('amplitude').value>0&&m.resonant;
const ia=Math.round(a/spacing),ib=Math.round(b/spacing);
const aligned=valid&&Math.abs(ia-ib)===1&&Math.abs(a-ia*spacing)<.0011&&Math.abs(b-ib*spacing)<.0011;
$('measurement-feedback').textContent=aligned?tr('Neighboring nodes: Δx = {dx} m = λ/2. Your measured wavelength is λ = 2Δx = {wavelength} m.',{dx:Math.abs(b-a).toFixed(3),wavelength:(2*Math.abs(b-a)).toFixed(3)}):!valid?tr('Start a nonzero drive and tune to resonance to measure stationary nodes.'):tr('Δx is the distance between your cursors. Place them at neighboring nodes before using λ = 2Δx.');
}
document.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>{task=b.dataset.task;document.querySelector('.investigation details').open=false;learningFeedback();}));
$('snap-nodes').addEventListener('click',()=>{const m=model();if($('snap-nodes').disabled)return;const index=Math.min(m.n-1,Math.max(0,Math.round(+$('cursor-a').value/(m.L/m.n))));$('cursor-a').value=(index*m.L/m.n).toFixed(3);$('cursor-b').value=((index+1)*m.L/m.n).toFixed(3);cursors();});
['down','up'].forEach(direction=>$('frequency-'+direction).addEventListener('click',()=>{$('frequency').value=+$('frequency').value+(direction==='up'?.1:-.1);update(false);}));
const apparatus=$('apparatus');function move(e){const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(apparatus.getScreenCTM().inverse());const m=model();$('cursor-'+drag).value=Math.max(0,Math.min(m.L,(pt.x-326)/514*m.L));cursors();}
apparatus.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-cursor]');if(!target)return;drag=target.dataset.cursor;apparatus.setPointerCapture(e.pointerId);move(e);});apparatus.addEventListener('pointermove',e=>{if(drag)move(e);});apparatus.addEventListener('pointerup',()=>drag=null);apparatus.addEventListener('pointercancel',()=>drag=null);
apparatus.addEventListener('keydown',e=>{const target=e.target.closest('[data-cursor]');if(!target)return;const k='cursor-'+target.dataset.cursor,step=e.shiftKey?.01:.001;if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();$(k).value=e.key==='Home'?0:e.key==='End'?model().L:+$(k).value+(['ArrowLeft','ArrowDown'].includes(e.key)?-step:step);const key=target.dataset.cursor;cursors();$('cursors').querySelector('[data-cursor="'+key+'"]').focus();}});
// Keep setup controls close to the apparatus without filling a phone screen.
const narrow=matchMedia('(max-width: 760px)'),setupControls=document.querySelector('.controls'),workspace=document.querySelector('.workspace');
function placeControls(){if(narrow.matches){$('mobile-controls').appendChild(setupControls);$('apparatus').setAttribute('viewBox','280 65 660 300');}else{workspace.insertBefore(setupControls,workspace.firstChild);$('apparatus').setAttribute('viewBox','0 0 1000 490');}}
narrow.addEventListener('change',placeControls);placeControls();
function frame(now){if(last&&!document.hidden&&running&&!locked)time+=Math.min((now-last)/1000,.05)/40;last=now;if(running&&!locked)draw();requestAnimationFrame(frame);}$('frequency').value=26.1;update();requestAnimationFrame(frame);
})();

