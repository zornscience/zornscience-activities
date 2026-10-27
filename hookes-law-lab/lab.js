(function () {
  "use strict";
const $ = id => document.getElementById(id), ns = 'http://www.w3.org/2000/svg';
let m=.2,k=20,b=0,y=0,v=0,t=0,running=false,dragging=false,points=[[0,0]],last=0,sample=0;
const scale=350,zero=190;
let plot='static',peaks=[],lastPeak=null,grabOffset=0;
const tasks={
 spring:['Keep the same spring. Add 50 g at a time. What happens to extension when the total weight doubles?', 'At rest, spring force equals weight. Find k = weight / extension in meters, or use the slope of the force-extension graph. A steeper line means a stiffer spring.'],
 mass:['Predict first: does a heavier mass oscillate faster or slower? Keep spring and release displacement fixed, then change only the mass.', 'Release each setup and wait for the measured period. Period is one full cycle, from a peak to the next peak. Compare total mass, including the hanger.'],
 amplitude:['Predict first: will a larger pull change the period? Keep spring and mass fixed. Compare releases from 2 cm and 4 cm with no damping.', 'A larger displacement makes a taller wave. For this ideal spring, the period stays the same. Changing amplitude changes the maximum speed, not the cycle time.'],
 damping:['Keep mass, spring and release displacement fixed. Compare no damping with light or strong damping.', 'Damping removes mechanical energy. The peaks shrink toward equilibrium. Use no damping when testing the ideal period formula.']
};
function message(id,value){if($(id).textContent!==value)$(id).textContent=value;}
function task(){const a=tasks[$('investigation').value];$('prompt').textContent=a[0];$('hint').textContent=a[1];}
function selectPlot(value){plot=value;$('plot-static').setAttribute('aria-pressed',String(plot==='static'));$('plot-motion').setAttribute('aria-pressed',String(plot==='motion'));graph();}
$('investigation').onchange=task;
$('plot-static').onclick=()=>selectPlot('static');$('plot-motion').onclick=()=>selectPlot('motion');
$('show-forces').onchange=()=>render();

function svg(tag,attrs,parent,text){const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([a,z])=>n.setAttribute(a,z));if(text!==undefined)n.textContent=text;parent.append(n);return n;}
for(let i=0;i<=60;i++){let yy=zero+i*3.5;svg('path',{d:`M568 ${yy}h${i%10===0?23:i%5===0?16:8}`,stroke:'#615c48','stroke-width':i%10===0?1.5:.7},$('ticks'));if(i%10===0)svg('text',{x:598,y:yy+4,'font-size':10,fill:'#534f40','text-anchor':'middle'},$('ticks'),i);}
function graph(){
const grid=$('grid'),markers=$('period-markers');grid.replaceChildren();markers.replaceChildren();
const motion=plot==='motion',span=4*2*Math.PI*Math.sqrt(m/k),start=Math.max(0,t-span);
$('plot-title').textContent=motion?'Position vs. time':'Force vs. extension';
$('plot-scale').textContent=motion?'About four cycles':'At equilibrium';
$('graph-title').textContent=motion?'Displacement from equilibrium versus time':'Equilibrium force versus extension';
$('graph-desc').textContent=motion?'Positive displacement is downward. Brackets mark time between measured peaks.':'A straight line through the origin represents Hooke’s law. The dot marks the selected mass at rest.';
$('plot-note').textContent=motion?'Zero is the equilibrium position. Positive displacement is downward on the apparatus and above zero on this graph. Pause freezes both views.':'The line shows the ideal equilibrium relationship, F = kΔL. The dot marks this load at rest, even while the mass oscillates. Slope = force / extension in meters.';
if(!motion){
 for(let i=0;i<=6;i++){const yy=174-i*24;svg('path',{d:`M70 ${yy}H765`,stroke:'#e2eaf0'},grid);svg('text',{x:55,y:yy+4,'text-anchor':'end',fill:'#405b70','font-size':13},grid,i);const xx=70+i/6*695;svg('text',{x:xx,y:196,'text-anchor':'middle',fill:'#405b70','font-size':13},grid,(i/10).toFixed(1));}
 svg('text',{x:70,y:16,fill:'#405b70','font-size':14},grid,'Force (N)');svg('text',{x:765,y:218,'text-anchor':'end',fill:'#405b70','font-size':14},grid,'Extension (m)');
 const limit=Math.min(.6,6/k);$('trace').setAttribute('d',`M70 174L${70+limit/.6*695} ${174-k*limit*24}`);
 $('graph-dot').setAttribute('cx',70+(m*9.81/k)/.6*695);$('graph-dot').setAttribute('cy',174-m*9.81*24);
 message('period-read',`This load: ${(m*9.81).toFixed(3)} N at ${(m*9.81/k).toFixed(4)} m extension.`);return;
}
for(let i=-6;i<=6;i+=2){const yy=104-i*12;svg('path',{d:`M70 ${yy}H765`,stroke:i===0?'#a6b9c7':'#e5edf1'},grid);svg('text',{x:55,y:yy+4,'text-anchor':'end',fill:'#405b70','font-size':13},grid,i);}
for(let i=0;i<=4;i++){const xx=70+i/4*695;svg('text',{x:xx,y:200,'text-anchor':'middle',fill:'#405b70','font-size':13},grid,(start+i/4*span).toFixed(2));}
svg('text',{x:70,y:16,fill:'#405b70','font-size':14},grid,'Displacement (cm), + downward');svg('text',{x:765,y:220,'text-anchor':'end',fill:'#405b70','font-size':14},grid,'Time (s)');
$('trace').setAttribute('d',points.filter(p=>p[0]>=start).map((p,i)=>`${i?'L':'M'}${70+(p[0]-start)/span*695} ${104-p[1]*1200}`).join(' '));
$('graph-dot').setAttribute('cx',70+(t-start)/span*695);$('graph-dot').setAttribute('cy',104-y*1200);
if(peaks.length>=2){const a=peaks[peaks.length-2],c=peaks[peaks.length-1];if(a>=start){const x1=70+(a-start)/span*695,x2=70+(c-start)/span*695;svg('path',{d:`M${x1} 26V34H${x2}V26`,fill:'none',stroke:'#80561c','stroke-width':2},markers);svg('text',{x:(x1+x2)/2,y:52,'text-anchor':'middle',fill:'#80561c','font-size':13},markers,`T = ${(c-a).toFixed(3)} s`);}
message('period-read',`Measured period: ${(c-a).toFixed(3)} s (successive positive peaks).`);
}else message('period-read',t>0?'Watch for two positive peaks to measure one full cycle.':'Pull and release to see the wave and measure its period.');
}
function forces(end){
const g=$('force-arrows');g.replaceChildren();const show=$('show-forces').checked;$('force-description').hidden=!show;if(!show)return;
const weight=m*9.81,spring=k*(m*9.81/k+y),net=-k*y-b*v;
const arrow=(x,value,label,color)=>{const length=Math.abs(value)*15,dir=Math.sign(value),bottom=end+45,tip=bottom+dir*length;svg('path',{d:`M${x} ${bottom}V${tip}m-5 ${-dir*8} 5 ${dir*8} 5 ${-dir*8}`,fill:'none',stroke:color,'stroke-width':3},g);svg('text',{x:x+10,y:tip+4,fill:color,'font-size':13},g,label);};
arrow(690,weight,'mg','#f5d081');arrow(690,-spring,'Spring','#aadff8');
$('force-description').textContent=`Weight: ${weight.toFixed(3)} N down. Spring force: ${Math.abs(spring).toFixed(3)} N ${spring>=0?'up':'down'}. Net force: ${Math.abs(net).toFixed(3)} N ${Math.abs(net)<.0005?'(balanced)':net>0?'down':'up'}${b>0?' (includes damping)':''}.`;
}
function render(){const eq=zero+m*9.81/k*scale,end=eq+y*scale;let d='M465 120L465 128';for(let i=0;i<=96;i++){const f=i/96;d+=`L${465+18*Math.sin(f*12*Math.PI)} ${128+(end-138)*f}`;}d+=`L465 ${end}`;$('coil').setAttribute('d',d);$('hanger').setAttribute('transform',`translate(0 ${end})`);$('hanger').setAttribute('aria-valuenow',(y*100).toFixed(1));$('hanger').setAttribute('aria-valuetext',`${(y*100).toFixed(1)} centimeters from equilibrium, positive downward`);$('equilibrium').setAttribute('d',`M400 ${eq}H625`);$('eq-label').setAttribute('y',eq+4);$('clock').textContent=t.toFixed(2);$('position').textContent=(y*100).toFixed(2)+' cm';$('state').textContent=dragging?'HELD':running?'OSCILLATING':Math.abs(y)<.00001&&Math.abs(v)<.00001?'AT EQUILIBRIUM':'PAUSED';$('pause').textContent=running?'Ⅱ Pause':'▶ Resume';$('pause').setAttribute('aria-pressed',String(!running));$('step').disabled=running||dragging;forces(end);graph();}
function weights(){const g=$('weights');g.replaceChildren();const count=Math.round((m-.05)/.05);for(let i=0;i<count;i++){const yy=68-i*4;svg('path',{d:`M436 ${yy}Q465 ${yy-10} 494 ${yy}V${yy+4}Q465 ${yy+14} 436 ${yy+4}Z`,fill:'url(#brass)',stroke:'#bca56b','stroke-width':.6},g);svg('path',{d:`M466 ${yy-5}L476 ${yy-3}`,stroke:'#453c29','stroke-width':2},g);}svg('text',{x:465,y:64-count*4,'text-anchor':'middle',fill:'#e2c78a','font-size':10},g,`${Math.round(m*1000)} g total`);}
function fresh(){t=0;sample=0;points=[[0,y]];peaks=[];lastPeak=null;}
function configure(){dragging=false;m=(Number($('mass').value)+50)/1000;k=Number($('spring').value);b=Number($('damping').value);y=0;v=0;running=false;fresh();$('mass-label').textContent=$('mass').value+' g';$('total').textContent=`${Math.round(m*1000)} g total suspended mass`;$('mass-read').textContent=Math.round(m*1000)+' g';$('extension').textContent=(m*9.81/k*100).toFixed(2)+' cm';$('extension-m').textContent=(m*9.81/k).toFixed(4)+' m';$('force').textContent=(m*9.81).toFixed(3)+' N';$('constant').textContent=`k = ${(m*9.81).toFixed(3)} N / ${(m*9.81/k).toFixed(4)} m = ${k} N/m. Ideal T = ${(2*Math.PI*Math.sqrt(m/k)).toFixed(3)} s (no damping).`;$('remove').disabled=+$('mass').value===0;$('add').disabled=+$('mass').value===500;selectPlot('static');weights();render();}
function advance(dt){let remaining=dt;while(remaining>1e-9){const h=Math.min(.001,remaining); // Velocity Verlet with symmetric damping; stable across all supported masses.
const oldV=v,oldT=t;const decay=Math.exp(-b*h/(2*m));v*=decay;v-=k/m*y*h/2;y+=v*h;v-=k/m*y*h/2;v*=decay;t+=h;
if(oldV>0&&v<=0&&y>.0001){const peak=oldT+h*oldV/(oldV-v);if(lastPeak===null||peak-lastPeak>.1){peaks.push(peak);lastPeak=peak;peaks=peaks.slice(-4);}}
sample+=h;remaining-=h;if(sample>=.01){points.push([t,y]);sample=0;}}
points=points.filter(p=>p[0]>=t-8.1);render();}
['mass','spring','damping'].forEach(id=>$(id).addEventListener('input',()=>{configure();$('status').textContent='New setup at equilibrium. Pull and release to compare its motion.';}));
$('add').onclick=()=>{$('mass').value=Math.min(500,+$('mass').value+50);configure();};$('remove').onclick=()=>{$('mass').value=Math.max(0,+$('mass').value-50);configure();};
function amp(){ $('amp-label').textContent=(+$('amplitude').value).toFixed(1)+' cm';} $('amplitude').oninput=amp;
function release(){if(!dragging)y=+$('amplitude').value/100;v=0;dragging=false;fresh();selectPlot('motion');running=Math.abs(y)>.00001;$('status').textContent=running?'Released. Compare peaks in the graph, or pause to inspect the spring.':'Zero displacement: the mass stays at equilibrium. Choose a nonzero pull to start oscillating.';render();}
$('release').onclick=release;$('settle').onclick=()=>{y=0;v=0;running=false;fresh();render();$('status').textContent='At equilibrium: spring force equals weight. Use k = mg / extension (in meters).';};$('pause').onclick=()=>{if(Math.abs(y)<.00001&&Math.abs(v)<.00001){$('status').textContent='The mass is at rest. Use Pull & release to start an oscillation.';return;}running=!running;selectPlot('motion');render();};$('step').onclick=()=>advance(.02);$('reveal').onchange=()=>{$('constant').hidden=!$('reveal').checked;};$('reset').onclick=()=>{$('mass').value=150;$('spring').value=20;$('damping').value=0;$('speed').value=1;$('amplitude').value=4;$('reveal').checked=false;$('constant').hidden=true;$('show-forces').checked=false;$('investigation').value='spring';task();amp();configure();$('status').textContent='Fresh lab. Add mass or pull and release to begin.';};
const hanger=$('hanger'),apparatus=$('apparatus');function pointerY(e){const p=apparatus.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(apparatus.getScreenCTM().inverse());return q.y;}
function move(e){y=Math.max(-.05,Math.min(.05,(pointerY(e)-grabOffset-zero-m*9.81/k*scale)/scale));v=0;render();}
hanger.addEventListener('pointerdown',e=>{grabOffset=pointerY(e)-(zero+m*9.81/k*scale+y*scale);dragging=true;running=false;hanger.setPointerCapture(e.pointerId);selectPlot('motion');render();});hanger.addEventListener('pointermove',e=>{if(dragging)move(e);});hanger.addEventListener('pointerup',()=>{if(dragging){v=0;fresh();dragging=false;selectPlot('motion');running=true;render();}});hanger.addEventListener('pointercancel',()=>{dragging=false;running=false;render();});hanger.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();running=false;y=Math.max(-.05,Math.min(.05,y+(e.key==='ArrowDown'?.005:-.005)));v=0;fresh();render();}if(e.key==='Enter'||e.key===' '){e.preventDefault();v=0;fresh();selectPlot('motion');running=true;render();}});
document.addEventListener('visibilitychange',()=>{last=0;});function frame(now){if(last&&running&&!dragging)advance(Math.min(.05,(now-last)/1000)*Number($('speed').value));last=now;requestAnimationFrame(frame);}task();amp();configure();requestAnimationFrame(frame);
}());
