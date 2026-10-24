(function(root){
'use strict';
function collide(m1,m2,u1,u2,mode){if(mode==='inelastic'){const v=(m1*u1+m2*u2)/(m1+m2);return [v,v];}return [((m1-m2)*u1+2*m2*u2)/(m1+m2),((m2-m1)*u2+2*m1*u1)/(m1+m2)];}
function advance(s,dt){let remaining=dt;let event=null;for(let n=0;n<3&&remaining>1e-10;n++){let hit=Infinity;if(!s.collided&&s.v[0]>s.v[1])hit=Math.max(0,(s.x[1]-s.x[0]-.44)/(s.v[0]-s.v[1]));let wall=Infinity;for(let i=0;i<2;i++){if(s.v[i]>0)wall=Math.min(wall,(3.76-s.x[i])/s.v[i]);if(s.v[i]<0)wall=Math.min(wall,(.24-s.x[i])/s.v[i]);}wall=Math.max(0,wall);let t=Math.min(remaining,hit,wall);s.x=s.x.map((x,i)=>x+s.v[i]*t);s.t+=t;remaining-=t;if(wall<=t+1e-10){s.ended=true;return 'end';}if(hit<=t+1e-10){s.v=collide(...s.m,...s.v,s.mode);s.collided=true;event='collision';}else break;}return event;}
const api={collide,advance};if(typeof module!=='undefined')module.exports=api;else root.CartPhysics=api;
})(typeof window==='undefined'?globalThis:window);
