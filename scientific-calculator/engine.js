// Independent real-number expression engine. No code evaluation.
(function () {
  "use strict";
function factorial(n){if(!Number.isInteger(n)||n<0||n>170)throw Error('DOMAIN');let v=1;for(let i=2;i<=n;i++)v*=i;return v}
function choose(n,r,perm=false){if(!Number.isInteger(n)||!Number.isInteger(r)||r<0||n<r)throw Error('DOMAIN');let v=1;for(let i=0;i<(perm?r:Math.min(r,n-r));i++)v*= (n-i)/(perm?1:i+1);return v}
function evaluate(source,{mode='DEG',ans=0,vars={}}={}){
source=source.replace(/(\d+(?:\.\d+)?)°(?:(\d+(?:\.\d+)?)′)?(?:(\d+(?:\.\d+)?)″)?/g,(_,d,m,sec)=>'('+ (+d+(+m||0)/60+(+sec||0)/3600)+')°');
const normalized=source.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/²/g,'^2').replace(/⁻¹/g,'^(-1)').replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/ᵀ/g,'');
let tokens=[],at=0;const pattern=/\s*(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|asinh|acosh|atanh|asin|acos|atan|sinh|cosh|tanh|sin|cos|tan|sqrt|log|ln|exp|abs|root|nPr|nCr|Ans|pi|[A-E]|[+\-*/^!%(),°rg]|_)/gy;
while(at<normalized.length){pattern.lastIndex=at;let m=pattern.exec(normalized);if(!m)throw Error('SYNTAX');tokens.push(m[1]);at=pattern.lastIndex}let i=0;
const scale=mode==='DEG'?Math.PI/180:mode==='GRAD'?Math.PI/200:1;
const funcs={sin:x=>Math.sin(x*scale),cos:x=>Math.cos(x*scale),tan:x=>{if(Math.abs(Math.cos(x*scale))<1e-14)throw Error('DOMAIN');return Math.tan(x*scale)},asin:x=>Math.asin(x)/scale,acos:x=>Math.acos(x)/scale,atan:x=>Math.atan(x)/scale,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,sqrt:Math.sqrt,ln:Math.log,log:Math.log10,exp:Math.exp,abs:Math.abs};
function atom(){let t=tokens[i++],v;if(t===undefined)throw Error('SYNTAX');if(t==='-'||t==='+')return (t==='-'?-1:1)*expr(35);if(t==='('){v=expr(0);if(tokens[i]===')')i++;else if(i<tokens.length)throw Error('SYNTAX')}
else if(funcs[t]){if(tokens[i]==='('){i++;v=expr(0);if(tokens[i]===')')i++;else if(i<tokens.length)throw Error('SYNTAX')}else v=expr(35);v=funcs[t](v)}else if(t==='pi')v=Math.PI;else if(t==='Ans')v=ans;else if(/^[A-E]$/.test(t))v=vars[t]||0;else if(/^(\d|\.)/.test(t)){v=Number(t);if(tokens[i]==='_'){i++;let a=Number(tokens[i++]);if(!Number.isFinite(a))throw Error('SYNTAX');if(tokens[i]==='_'){i++;let b=Number(tokens[i++]);if(!b)throw Error('DIVIDE BY 0');v+=a/b}else{if(!a)throw Error('DIVIDE BY 0');v/=a}}}else throw Error('SYNTAX');return v}
function expr(min){let a=atom();while(i<tokens.length){let op=tokens[i];if(['!','%','°','r','g'].includes(op)){if(50<min)break;i++;a=op==='!'?factorial(a):op==='%'?a/100:op==='°'?a*Math.PI/180/scale:op==='r'?a/scale:a*Math.PI/200/scale;continue}let precedence={'+':10,'-':10,'*':20,'/':20,nPr:30,nCr:30,'^':40,root:40}[op];let implicit=false;if(precedence===undefined&&op!==')'&&op!==','){if(op==='('||funcs[op]||op==='pi'||op==='Ans'||/^[A-E]$/.test(op)){precedence=20;op='*';implicit=true}else break}if(precedence===undefined||precedence<min)break;if(!implicit)i++;let b=expr(precedence+(op==='^'||op==='root'?0:1));if(op==='+')a+=b;else if(op==='-')a-=b;else if(op==='*')a*=b;else if(op==='/'){if(b===0)throw Error('DIVIDE BY 0');a/=b}else if(op==='^')a=Math.pow(a,b);else if(op==='root'){if(!a)throw Error('DOMAIN');a=b<0&&Number.isInteger(a)&&a%2? -Math.pow(-b,1/a):Math.pow(b,1/a)}else a=choose(a,b,op==='nPr') }return a}
let result=expr(0);if(i!==tokens.length)throw Error('SYNTAX');if(!Number.isFinite(result))throw Error('DOMAIN / OVERFLOW');return Math.abs(result)<1e-14?0:result;
}
function fraction(value,mixed=true){if(!Number.isFinite(value))return String(value);let sign=value<0?'-':'';value=Math.abs(value);let bestN=Math.round(value),bestD=1,found=false;for(let d=1;d<=10000;d++){let n=Math.round(value*d);if(Math.abs(n/d-value)<1e-10){bestN=n;bestD=d;found=true;break}}if(!found)return sign+String(+value.toPrecision(10));if(bestD===1)return sign+bestN;const whole=Math.floor(bestN/bestD),rem=bestN%bestD;return sign+(mixed&&whole?whole+' '+rem:bestN)+'/'+bestD}
var api={evaluate,fraction,factorial,choose};
if(typeof document!=="undefined") {var root=document.querySelector('[data-zsa-activity="scientific-calculator"]');if(root)root.addEventListener('zsa-calculator:request-engine',function(event){event.detail.receive(api);});}
if(typeof module==='object'&&module.exports)module.exports=api;
}());
