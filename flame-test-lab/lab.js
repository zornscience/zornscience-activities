(function () {
  "use strict";
const salts=[
{id:'li',name:'Lithium',symbol:'Li',formula:'LiCl',color:'#fa315a',observation:'Crimson red'},
{id:'na',name:'Sodium',symbol:'Na',formula:'NaCl',color:'#ffd332',observation:'Intense golden yellow'},
{id:'k',name:'Potassium',symbol:'K',formula:'KCl',color:'#c397ff',observation:'Pale lilac'},
{id:'ca',name:'Calcium',symbol:'Ca',formula:'CaCl₂',color:'#ff824e',observation:'Orange-red / brick red'},
{id:'sr',name:'Strontium',symbol:'Sr',formula:'SrCl₂',color:'#ff3440',observation:'Scarlet red'},
{id:'ba',name:'Barium',symbol:'Ba',formula:'BaCl₂',color:'#b5e75d',observation:'Apple green'},
{id:'cu',name:'Copper',symbol:'Cu',formula:'CuCl₂',color:'#37edbd',observation:'Blue-green'},
{id:'cs',name:'Cesium',symbol:'Cs',formula:'CsCl',color:'#6d8cff',observation:'Blue-violet'}];
const $=id=>document.getElementById(id);let unknown;const observed=new Set();
function bottle(s,id=s.id){const b=document.createElement('button');b.className='sample';b.dataset.sample=id;b.setAttribute('aria-label',`Test ${id==='unknown'?'unknown sample':s.name+' chloride'}`);const glass=document.createElement('span');glass.className='bottle';glass.setAttribute('aria-hidden','true');const symbol=document.createElement('span');symbol.textContent=s.symbol;glass.append(symbol);const text=document.createElement('span');const name=document.createElement('span');name.className='sample-name';name.textContent=s.name;const formula=document.createElement('span');formula.className='formula';formula.textContent=s.formula;text.append(name,formula);b.append(glass,text);b.addEventListener('click',()=>test(id));return b}
salts.forEach(s=>$('samples').append(bottle(s)));$('unknown-row').append(bottle({id:'unknown',name:'Unknown sample',symbol:'?',formula:'One of the eight known salts'},'unknown'));
function test(id){if(id!=='unknown'&&!salts.some(s=>s.id===id))return;const s=id==='unknown'?unknown:salts.find(s=>s.id===id);observed.add(id);$('dropzone').dataset.flame=s.id;$('dropzone').classList.add('testing');$('sample-label').textContent=id==='unknown'?'UNKNOWN SAMPLE · OBSERVING':`${s.name.toUpperCase()} CHLORIDE · ${s.formula}`;$('observation').textContent=s.observation+' flame';$('color-chip').dataset.flame=s.id;document.querySelectorAll('.sample').forEach(b=>{b.classList.toggle('selected',b.dataset.sample===id);b.classList.toggle('tested',observed.has(b.dataset.sample))});$('progress').textContent=`${[...observed.keys()].filter(k=>k!=='unknown').length} / 8 tested`}
function clearFlame(){delete $('dropzone').dataset.flame;$('dropzone').classList.remove('testing');$('sample-label').textContent='BUNSEN BURNER · READY';$('observation').textContent='A clean blue flame. Ready to explore?';delete $('color-chip').dataset.flame;document.querySelectorAll('.sample').forEach(b=>b.classList.remove('selected'))}
function reset(){unknown=salts[Math.floor(Math.random()*salts.length)];observed.clear();$('progress').textContent='0 / 8 tested';document.querySelectorAll('.sample').forEach(b=>b.classList.remove('tested'));clearFlame()}
$('clear').onclick=clearFlame;
$('new').onclick=reset;
reset();
})();
