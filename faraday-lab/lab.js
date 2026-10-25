(function () {
  "use strict";
const $=id=>document.getElementById(id), canvas=$('apparatus'), c=canvas.getContext('2d');
let y=0,v=0,fy=0,fv=0,phase='ready',north=1,last=0,clock=0;
const top=135,scale=350,end=1.13;
function dragAt(pos){const k=$('material').value==='copper'?34:$('material').value==='slotted'?0.65:0;return k*Number($('strength').value)**2*Math.max(0,Math.min(1,(pos+.025)/.07,(1.025-pos)/.07));}
function reset(){y=fy=v=fv=clock=0;phase='ready';$('release').disabled=false;$('release').textContent='Release magnets';$('pause').disabled=true;$('pause').textContent='Pause';$('state').textContent='READY TO RELEASE';$('observation').textContent='Two identical magnets, one release height. Release them together and compare their motion.';draw();}
function step(dt){for(let t=0;t<dt;t+=.002){let h=Math.min(.002,dt-t);if(y<end){v+=h*(9.81-dragAt(y)*v);y=Math.min(end,y+h*v);if(y===end)v=0;}if(fy<end){fv+=h*9.81;fy=Math.min(end,fy+h*fv);if(fy===end)fv=0;}clock+=h;}if(y===end&&fy===end){phase='done';$('pause').disabled=true;$('release').disabled=false;$('release').textContent='Release again';$('state').textContent='BOTH MAGNETS CAUGHT';$('observation').textContent=$('material').value==='copper'?'The copper slowed the magnet without touching it. Eddy currents opposed its motion and transferred gravitational energy into heat. Reverse the poles or try the slotted tube.':$('material').value==='slotted'?'The lengthwise slot interrupted the large current loops. Much weaker braking let the magnet fall almost as quickly as the free-fall comparison.':'Plastic cannot sustain eddy currents. Both magnets fell together under gravity.';}}
function grad(x,w,colors){let g=c.createLinearGradient(x,0,x+w,0);colors.forEach(([s,col])=>g.addColorStop(s,col));return g;}
function box(x,y,w,h,fill,r=0){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function ellipse(x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function line(x,y,xx,yy,color,w=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
function arrow(x,y,xx,yy,color,w=3){line(x,y,xx,yy,color,w);let a=Math.atan2(yy-y,xx-x);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-10*Math.cos(a-.45),yy-10*Math.sin(a-.45));c.lineTo(xx-10*Math.cos(a+.45),yy-10*Math.sin(a+.45));c.closePath();c.fillStyle=color;c.fill();}
function text(s,x,y,size=14,col='#bdd3df',align='left'){c.fillStyle=col;c.font=`${size}px Inter, sans-serif`;c.textAlign=align;c.fillText(s,x,y);}
function magnet(x,pos){const yy=top+pos*scale;box(x-18,yy-19,36,38,grad(x-18,36,[[0,'#6e7d87'],[.22,'#eef6f8'],[.48,'#a7b7c2'],[.7,'#f4fbff'],[1,'#607580']]),4);ellipse(x,yy-18,18,5,'#dae5e9','#81949c');line(x-17,yy,x+17,yy,'#586b78',1);text(north===1?'S':'N',x,yy-5,11,north===1?'#244578':'#8d2e2e','center');text(north===1?'N':'S',x,yy+13,11,north===1?'#8d2e2e':'#244578','center');}
function ring(cy,sign,alpha){c.save();c.globalAlpha=alpha;ellipse(400,cy,63,16,null,'#69e4f4');const a=clock*sign*6;const x=400+63*Math.cos(a),yy=cy+16*Math.sin(a);const tx=-63*Math.sin(a)*sign,ty=16*Math.cos(a)*sign,mag=Math.hypot(tx,ty);arrow(x-tx/mag*13,yy-ty/mag*13,x,yy,'#80f0ff',2.5);c.restore();}
function draw(){c.clearRect(0,0,1000,640);let bg=c.createLinearGradient(0,0,0,640);bg.addColorStop(0,'#213e52');bg.addColorStop(1,'#112b3e');box(0,0,1000,640,bg);box(0,540,1000,100,'#253d49');line(0,540,1000,540,'#536b76');
// Retort stand, heavy base, steel rods and boss heads.
ellipse(375,568,182,26,'#102330');box(209,532,292,29,grad(209,292,[[0,'#344b59'],[.5,'#80909a'],[1,'#263e4d']]),8);box(250,63,14,472,grad(250,14,[[0,'#4d697b'],[.4,'#e3edf0'],[.6,'#92a7b4'],[1,'#3e5668']]),5);ellipse(257,63,7,4,'#cfdee3');
for(const yy of [190,420]){box(241,yy-16,32,32,'#5b7181',4);line(268,yy,354,yy,'#91a6b2',10);box(234,yy-5,17,10,'#233e50',3);line(234,yy-13,234,yy+13,'#b8c8ce',4);ellipse(400,yy,54,13,null,'#b7bfc1');}
// Ruler.
box(541,144,25,350,'#d5bd84',2);for(let i=0;i<=50;i++){let yy=144+i*7;line(542,yy,542+(i%5===0?14:7),yy,'#51482f',1);if(i%10===0)text(String(100-i*2),579,yy+4,11,'#bbced7');}text('cm',557,125,12,'#d3dfe4','center');
let plastic=$('material').value==='plastic';let copper=grad(351,98,plastic?[[0,'#b0c0ce'],[.23,'#edf4f8'],[.55,'#95aebe'],[1,'#506a80']]:[[0,'#6a3927'],[.16,'#b4744d'],[.34,'#f0bd86'],[.5,'#bf8056'],[.76,'#915133'],[1,'#4d2b22']]);
box(351,144,98,350,copper);ellipse(400,494,49,13,copper,'#8f664d');
if($('cutaway').checked){box(373,144,54,350,'#132c3c');box(374,144,5,350,'#684831');box(422,144,5,350,'#d09c6a');}
if($('material').value==='slotted'){box(437,144,5,350,'#0a2232');}
// Magnets: hidden by intact opaque wall unless cutaway is enabled.
if($('cutaway').checked||y<.025||y>1.06)magnet(400,y);magnet(745,fy);
ellipse(400,144,49,13,copper,'#d8a576');ellipse(400,144,35,8,'#0b2130','#6e4937');
// Catch pads and a free-fall guide reference.
for(const x of [400,745]){ellipse(x,554,71,17,'#0b202d');box(x-62,535,124,17,'#6b8790',5);ellipse(x,535,62,12,'#a0b7b8');ellipse(x,535,49,8,'#405b62');}
c.setLineDash([4,9]);line(745,158,745,508,'#668394',1);c.setLineDash([]);if(fy===end)magnet(745,fy);if(y===end)magnet(400,y);
const active=y>.03&&y<.99&&v>.001, alpha=Math.min(1,dragAt(y)*v/9.81);
if(active&&!plastic){const yy=top+y*scale;for(const d of [-65,-43,43,65]){const cy=yy+d;if(cy<155||cy>482)continue;const sign=(d<0?1:-1)*north;if($('currents').checked)ring(cy,sign,Math.max(.18,alpha));if($('fields').checked){const dir=(d<0?1:-1)*north;c.save();c.globalAlpha=Math.max(.2,alpha);for(let xx of [387,413])arrow(xx,cy-dir*13,xx,cy+dir*13,'#ffd584',3);c.restore();}}}
if($('forces').checked&&y<end&&phase!=='ready'){const yy=top+y*scale;arrow(475,yy,475,yy+62,'#e4eaf0');text('weight',492,yy+51,12);if(active&&!plastic){arrow(320,yy,320,yy-62*alpha,'#ffd584');text('braking',305,yy-18,12,'#ffd584','right');}}
text(plastic?'PLASTIC TUBE':$('material').value==='slotted'?'SLOTTED COPPER':'COPPER TUBE',400,38,17,'#e0ebf0','center');text('IDENTICAL MAGNET',745,38,17,'#e0ebf0','center');text('Held in two retort clamps',400,61,12,'#abc3d0','center');text('Free-fall comparison',745,61,12,'#abc3d0','center');text('SOFT CATCH TRAYS',575,604,12,'#bdd1db','center');
if($('currents').checked){line(45,593,70,593,'#69e4f4',3);text('Eddy current',80,598,12);}if($('fields').checked){arrow(45,615,70,615,'#ffd584',2);text('Induced field',80,620,12);}
}
function frame(now){let dt=last?Math.min((now-last)/1000,.05):0;last=now;if(phase==='running'){step(dt*($('slow').checked?.25:1));draw();}requestAnimationFrame(frame);}
$('release').onclick=()=>{reset();phase='running';$('release').disabled=true;$('pause').disabled=false;$('state').textContent='MAGNETS FALLING';$('observation').textContent=$('material').value==='copper'?'As the magnet descends, flux changes through the copper. Opposite current directions form above and below it; both contribute to an upward braking force.':$('material').value==='slotted'?'The slot breaks the large circular conducting paths. Small local currents can remain, but braking is greatly reduced.':'The insulating plastic carries no eddy currents, so there is no magnetic braking.';};
$('pause').onclick=()=>{phase=phase==='running'?'paused':'running';$('pause').textContent=phase==='paused'?'Resume':'Pause';$('state').textContent=phase==='paused'?'PAUSED · INSPECT THE FIELDS':'MAGNETS FALLING';draw();};
$('reset').onclick=reset;
$('flip').onclick=()=>{north*=-1;$('flip').textContent='Reverse poles · '+(north===1?'N':'S')+' down';reset();};
$('material').onchange=()=>{$('material-note').textContent=$('material').value==='copper'?'Closed conducting loops allow strong eddy currents.':$('material').value==='slotted'?'A lengthwise slot interrupts the large current loops.':'An insulator cannot carry eddy currents.';reset();};
$('strength').oninput=()=>{$('strength-value').textContent=Number($('strength').value).toFixed(1)+'×';reset();};
for(const id of ['cutaway','currents','fields','forces'])$(id).onchange=draw;
$('slow').onchange=()=>{$('speed').textContent=$('slow').checked?'¼ SPEED':'REAL TIME';};
reset();requestAnimationFrame(frame);
}());
