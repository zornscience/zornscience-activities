(function () {
  "use strict";
const $=id=>document.getElementById(id), canvas=$('apparatus'), c=canvas.getContext('2d');
let i18n;
const root=document.querySelector('[data-zsa-activity="faraday-lab"]');
if(root)root.dispatchEvent(new CustomEvent('zsa:request-i18n',{detail:{receive:api=>{i18n=api;}}}));
// Every sentence is one full template from data.js, filled with values, so each language keeps its word order.
function tr(s,values){values=values||{};return i18n?i18n.text(s,values):s.replace(/\{(\w+)\}/g,(m,k)=>values[k]===undefined?m:values[k]);}
let y=0,v=0,fy=0,fv=0,phase='ready',north=1,last=0,clock=0;
const top=135,scale=350,end=1.13;
function dragAt(pos){const k=$('material').value==='copper'?34:$('material').value==='slotted'?0.65:0;return k*Number($('strength').value)**2*Math.max(0,Math.min(1,(pos+.025)/.07,(1.025-pos)/.07));}
let replayFrames=[], duration=0;
function integrate(state,h){
  let [pos,vel,free,freeVel]=state;
  if(pos<end){vel+=h*(9.81-dragAt(pos)*vel);pos=Math.min(end,pos+h*vel);if(pos===end)vel=0;}
  if(free<end){freeVel+=h*9.81;free=Math.min(end,free+h*freeVel);if(free===end)freeVel=0;}
  return [pos,vel,free,freeVel];
}
function prepareReplay(){
  let state=[0,0,0,0];replayFrames=[state];
  for(let i=1;i<12000;i++){state=integrate(state,.002);replayFrames.push(state);if(state[0]===end&&state[2]===end)break;}
  duration=(replayFrames.length-1)*.002;
}
function sample(time){clock=Math.max(0,Math.min(duration,time));[y,v,fy,fv]=replayFrames[Math.min(replayFrames.length-1,Math.round(clock/.002))];}
function describe(){
  const material=$('material').value;
  if(phase==='ready')return tr('Predict first: which magnet will arrive first? Both magnets have the same mass and release height. Only one passes through the tube.');
  if(material==='plastic')return phase==='done'?tr('Plastic cannot sustain eddy currents. Both magnets fell together under gravity. A magnetic field alone does not create a braking force.'):tr('The insulating plastic carries no eddy currents. Both magnets accelerate together under gravity.');
  if(material==='slotted')return tr('The slot interrupts the large circular current paths. Small local currents can remain, so the braking is weak. Compare with intact copper at the same magnet strength.');
  if(phase==='done')return tr('The copper magnet arrived later. Its gravitational energy transferred into thermal energy in the tube. Copper is not ferromagnetic: changing flux and circulating currents caused the braking.');
  if(phase==='paused')return tr('Time is frozen for inspection. The currents shown belong to this instant of the falling motion. A magnet actually held still would induce no sustained eddy current.');
  if(y>.15&&y<.85)return tr('Inside copper, upward magnetic braking nearly balances downward weight. The magnet keeps moving at nearly constant terminal speed; balanced forces do not mean it stops.');
  return tr('As the magnet enters or leaves the copper, the changing flux drives currents. Their fields oppose the change and the resulting force opposes the fall.');
}
function updateReadout(){
  $('replay').value=duration?Math.round(clock/duration*1000):0;
  $('replay-time').textContent=phase==='ready'?tr('Ready'):clock.toFixed(2)+' s / '+duration.toFixed(2)+' s';
  $('replay').setAttribute('aria-valuetext',phase==='ready'?tr('Release magnets first'):tr('{t} seconds into the drop',{t:clock.toFixed(2)}));
  const delta=y-(320-top)/scale, moving=phase!=='ready'&&phase!=='done'&&v>0&&y<1.05;
  let info;
  if(!moving)info=phase==='ready'?tr('The magnet is held still. No changing flux through the ring, so there is no induced current.'):tr('The magnet is in the catch tray. No changing flux through the ring, so there is no induced current.');
  else if($('material').value==='plastic')info=tr('Flux changes as the magnet passes, but plastic is an insulator: no eddy current or induced field from the tube.');
  else if($('material').value==='slotted')info=tr('The changing flux can drive small local currents, but the slot interrupts a complete current loop around this ring. Braking is much weaker.');
  else if(Math.abs(delta)<.035)info=tr('At the ring: flux is near its maximum. Its rate of change passes through zero, and the current reverses as the magnet passes.');
  else {const approaching=delta<0, down=(approaching?north:-north)<0;
    info=(approaching?tr('Approaching the ring: flux is increasing.'):tr('Leaving the ring: flux is decreasing.'))+' ';
    if($('material').value==='plastic')info+=tr('Flux changes, but plastic is an insulator: no eddy current.');
    else info+=(down?tr('The induced field points down; conventional current is clockwise viewed from above.'):tr('The induced field points up; conventional current is counterclockwise viewed from above.'))+($('material').value==='slotted'?' '+tr('The slot prevents a complete current loop; local currents are much weaker.'):'');
  }
  $('flux-description').textContent=info;
  $('flux-title').textContent=$('material').value==='plastic'?tr('At the fixed plastic ring'):tr('At the fixed copper ring');
  canvas.setAttribute('aria-label',describe()+' '+(!$('flux-panel').hidden?info:''));
}
function reset(){
  prepareReplay();sample(0);phase='ready';$('release').disabled=false;$('release').textContent=tr('Release magnets');
  $('pause').disabled=true;$('pause').textContent=tr('Pause');$('replay').disabled=true;
  $('state').textContent=tr('READY TO RELEASE');$('observation').textContent=describe();draw();
}
function step(dt){
  sample(clock+dt);
  if(clock>=duration){phase='done';$('pause').disabled=true;$('release').disabled=false;$('release').textContent=tr('Release again');$('state').textContent=tr('BOTH MAGNETS CAUGHT');}
  const message=describe();if($('observation').textContent!==message)$('observation').textContent=message;
}
function grad(x,w,colors){let g=c.createLinearGradient(x,0,x+w,0);colors.forEach(([s,col])=>g.addColorStop(s,col));return g;}
function box(x,y,w,h,fill,r=0){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function ellipse(x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function line(x,y,xx,yy,color,w=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
function arrow(x,y,xx,yy,color,w=3){line(x,y,xx,yy,color,w);let a=Math.atan2(yy-y,xx-x);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-10*Math.cos(a-.45),yy-10*Math.sin(a-.45));c.lineTo(xx-10*Math.cos(a+.45),yy-10*Math.sin(a+.45));c.closePath();c.fillStyle=color;c.fill();}
function text(s,x,y,size=14,col='#bdd3df',align='left'){c.fillStyle=col;c.font=`${size}px Inter, sans-serif`;c.textAlign=align;c.fillText(s,x,y);}
function magnet(x,pos){const yy=top+pos*scale;box(x-18,yy-19,36,38,grad(x-18,36,[[0,'#6e7d87'],[.22,'#eef6f8'],[.48,'#a7b7c2'],[.7,'#f4fbff'],[1,'#607580']]),4);ellipse(x,yy-18,18,5,'#dae5e9','#81949c');line(x-17,yy,x+17,yy,'#586b78',1);text(north===1?'S':'N',x,yy-5,11,north===1?'#244578':'#8d2e2e','center');text(north===1?'N':'S',x,yy+13,11,north===1?'#8d2e2e':'#244578','center');}
function ring(cy,sign,alpha){c.save();c.globalAlpha=alpha;if($('material').value==='slotted'){c.setLineDash([5,12]);ellipse(400,cy,63,16,null,'#69e4f4');c.setLineDash([]);}else ellipse(400,cy,63,16,null,'#69e4f4');const a=clock*sign*6;const x=400+63*Math.cos(a),yy=cy+16*Math.sin(a);const tx=-63*Math.sin(a)*sign,ty=16*Math.cos(a)*sign,mag=Math.hypot(tx,ty);arrow(x-tx/mag*13,yy-ty/mag*13,x,yy,'#80f0ff',2.5);c.restore();}
function draw(){updateReadout();const compact=matchMedia('(max-width:850px)').matches;canvas.width=compact?820:1000;c.setTransform(1,0,0,1,compact?-180:0,0);c.clearRect(0,0,1000,640);let bg=c.createLinearGradient(0,0,0,640);bg.addColorStop(0,'#213e52');bg.addColorStop(1,'#112b3e');box(0,0,1000,640,bg);box(0,540,1000,100,'#253d49');line(0,540,1000,540,'#536b76');
// Retort stand, heavy base, steel rods and boss heads.
ellipse(375,568,182,26,'#102330');box(209,532,292,29,grad(209,292,[[0,'#344b59'],[.5,'#80909a'],[1,'#263e4d']]),8);box(250,63,14,472,grad(250,14,[[0,'#4d697b'],[.4,'#e3edf0'],[.6,'#92a7b4'],[1,'#3e5668']]),5);ellipse(257,63,7,4,'#cfdee3');
for(const yy of [190,420]){box(241,yy-16,32,32,'#5b7181',4);line(268,yy,354,yy,'#91a6b2',10);box(234,yy-5,17,10,'#233e50',3);line(234,yy-13,234,yy+13,'#b8c8ce',4);ellipse(400,yy,54,13,null,'#b7bfc1');}
// Ruler.
box(541,144,25,350,'#d5bd84',2);for(let i=0;i<=50;i++){let yy=144+i*7;line(542,yy,542+(i%5===0?14:7),yy,'#51482f',1);if(i%10===0)text(String(100-i*2),579,yy+4,11,'#bbced7');}text('cm',557,125,12,'#d3dfe4','center');
let plastic=$('material').value==='plastic';let copper=grad(351,98,plastic?[[0,'#b0c0ce'],[.23,'#edf4f8'],[.55,'#95aebe'],[1,'#506a80']]:[[0,'#6a3927'],[.16,'#b4744d'],[.34,'#f0bd86'],[.5,'#bf8056'],[.76,'#915133'],[1,'#4d2b22']]);
box(351,144,98,350,copper);ellipse(400,494,49,13,copper,'#8f664d');
if($('cutaway').checked){box(373,144,54,350,'#132c3c');box(374,144,5,350,'#684831');box(422,144,5,350,'#d09c6a');}
if($('material').value==='slotted'){box(435,144,9,350,'#0a2232');text(tr('SLOT'),482,476,14);line(443,466,476,471,'#c9dbe5',1);}
// Magnets: hidden by intact opaque wall unless cutaway is enabled.
if($('cutaway').checked||y<.025||y>1.06)magnet(400,y);magnet(745,fy);
ellipse(400,144,49,13,copper,'#d8a576');ellipse(400,144,35,8,'#0b2130','#6e4937');
// Catch pads and a free-fall guide reference.
for(const x of [400,745]){ellipse(x,554,71,17,'#0b202d');box(x-62,535,124,17,'#6b8790',5);ellipse(x,535,62,12,'#a0b7b8');ellipse(x,535,49,8,'#405b62');}
c.setLineDash([4,9]);line(745,158,745,508,'#668394',1);c.setLineDash([]);if(fy===end)magnet(745,fy);if(y===end)magnet(400,y);
if(!$('flux-panel').hidden){c.setLineDash([7,5]);ellipse(400,320,57,15,null,'#f3e6bb');c.setLineDash([]);text(tr('FIXED RING'),620,316,15,'#f3e6bb');line(456,320,605,320,'#f3e6bb',1);}
const active=y>.03&&y<.99&&v>.001, alpha=Math.min(1,dragAt(y)*v/9.81);
if(active&&!plastic){const yy=top+y*scale;for(const d of [-65,-43,43,65]){const cy=yy+d;if(cy<155||cy>482)continue;const sign=(d<0?1:-1)*north;if($('currents').checked)ring(cy,sign,Math.max(.18,alpha));if($('fields').checked){const dir=(d<0?1:-1)*north;c.save();c.globalAlpha=Math.max(.2,alpha);for(let xx of [387,413])arrow(xx,cy-dir*13,xx,cy+dir*13,'#ffd584',3);c.restore();}}}
if($('forces').checked&&y<end&&phase!=='ready'){const yy=top+y*scale;arrow(475,yy,475,yy+62,'#e4eaf0');text(tr('weight'),492,yy+51,12);if(active&&!plastic){arrow(320,yy,320,yy-62*Math.min(1.8,dragAt(y)*v/9.81),'#ffd584');text(tr('braking'),305,yy-18,12,'#ffd584','right');}}
text(tr(plastic?'PLASTIC TUBE':$('material').value==='slotted'?'SLOTTED COPPER':'COPPER TUBE'),400,38,17,'#e0ebf0','center');text(tr('IDENTICAL MAGNET'),745,38,17,'#e0ebf0','center');text(tr('Held in two retort clamps'),400,61,12,'#abc3d0','center');text(tr('Free-fall comparison'),745,61,12,'#abc3d0','center');text(tr('SOFT CATCH TRAYS'),575,604,12,'#bdd1db','center');
c.save();if(compact)c.translate(215,0);
if($('currents').checked){line(45,593,70,593,'#69e4f4',3);text(tr('Eddy current'),80,598,12);}if($('fields').checked){arrow(45,615,70,615,'#ffd584',2);text(tr('Induced field'),80,620,12);}
c.restore();
}
function frame(now){let dt=last?Math.min((now-last)/1000,.05):0;last=now;if(phase==='running'){step(dt*($('slow').checked?.25:1));draw();}requestAnimationFrame(frame);}
$('release').onclick=()=>{reset();phase='running';$('release').disabled=true;$('pause').disabled=false;$('replay').disabled=false;$('state').textContent=tr('MAGNETS FALLING');$('observation').textContent=describe();draw();};
$('pause').onclick=()=>{phase=phase==='running'?'paused':'running';$('pause').textContent=tr(phase==='paused'?'Resume':'Pause');$('state').textContent=tr(phase==='paused'?'PAUSED · SIMULATED TIME FROZEN':'MAGNETS FALLING');$('observation').textContent=describe();draw();};
$('replay').addEventListener('input',()=>{
  sample(Number($('replay').value)/1000*duration);phase='paused';
  $('pause').disabled=false;$('pause').textContent=tr('Resume');$('release').disabled=false;
  $('state').textContent=tr('PAUSED · SIMULATED TIME FROZEN');$('observation').textContent=describe();draw();
});
$('reset').onclick=reset;
$('flip').onclick=()=>{north*=-1;$('flip').textContent=tr('Reverse poles · {pole} down',{pole:north===1?'N':'S'});reset();};
$('material').onchange=()=>{$('challenge').textContent=tr('Predict: how will this tube compare with free fall? Keep magnet strength fixed while comparing materials.');$('material-note').textContent=$('material').value==='copper'?tr('Closed conducting loops allow strong eddy currents.'):$('material').value==='slotted'?tr('A lengthwise slot interrupts the large current loops.'):tr('An insulator cannot carry eddy currents.');reset();};
$('strength').oninput=()=>{$('strength-value').textContent=Number($('strength').value).toFixed(1)+'×';reset();};
function syncView(){
  const explain=$('currents').checked||$('fields').checked||$('forces').checked;
  $('flux-panel').hidden=!explain;$('observe-view').setAttribute('aria-pressed',String(!explain));$('explain-view').setAttribute('aria-pressed',String(explain));draw();
}
for(const id of ['cutaway','currents','fields','forces'])$(id).onchange=syncView;
$('observe-view').onclick=()=>{for(const id of ['currents','fields','forces'])$(id).checked=false;syncView();};
$('explain-view').onclick=()=>{for(const id of ['currents','fields','forces','cutaway'])$(id).checked=true;syncView();};
$('try-slot').onclick=()=>{$('material').value='slotted';$('material').onchange();$('challenge').textContent=tr('Predict: will breaking the circular path change the fall? Release again, then compare with intact copper using the same magnet strength.');};
$('try-poles').onclick=()=>{$('flip').click();$('challenge').textContent=tr('Predict: will reversing the poles reverse the braking force? Use Explain and compare current directions before and after the flip, keeping the material and strength unchanged.');};
$('slow').onchange=()=>{$('speed').textContent=tr($('slow').checked?'¼ SPEED':'REAL TIME');};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='running')$('pause').click();last=0;});
window.addEventListener('resize',draw);
reset();requestAnimationFrame(frame);
}());
