'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const modes=['diagram','process','heating','stoich','bonds','formation','hess'];
const base='/reaction-energy-lab/';
test.use({reducedMotion:'reduce'});
test('diagram values, catalyst, read and sketch misconceptions',async({page})=>{
  await page.goto(base+'?r=120&p=180&peak=250');await expect(page.locator('#diagram-readout')).toContainText('ΔH = 60.0');await expect(page.locator('#diagram-readout')).toContainText('Ea = 130');
  await page.locator('#catalyst').check();await expect(page.locator('#diagram-readout')).toContainText('ΔH = 60.0');await expect(page.locator('#diagram-readout')).toContainText('Ea = 91.5');
  await page.locator('#read-dh').fill('130');await page.locator('#read-ea').fill('130');await page.locator('#check-diagram').click();await expect(page.locator('#diagram-feedback')).toContainText('peak gives Ea');
  await page.locator('#read-dh').fill('60');await page.locator('#check-diagram').click();await expect(page.locator('#diagram-feedback')).toHaveText('Correct.');
  await page.locator('#sketch-products').fill('75');await page.locator('#sketch-products').press('Tab');await page.locator('#check-sketch').click();await expect(page.locator('#sketch-feedback')).toHaveText('Correct.');
  await page.locator('#r').fill('280');await page.locator('#r').press('Tab');await expect(page.locator('#peak')).toHaveValue('280');
});
test('system, surroundings and every listed process',async({page})=>{
  await page.goto(base+'?mode=process&rxn=koh');await page.locator('#process-prediction').selectOption('exothermic');await page.locator('#start-process').click();await expect(page.locator('#panel-process')).toContainText('exothermic');await expect(page.locator('#panel-process')).toContainText('21.0 °C → 34.5 °C');await expect(page.locator('#panel-process')).toContainText('Your prediction matched.');
  for(const [id,type] of [['coldpack','endothermic'],['condensation','exothermic'],['frost','endothermic'],['ch4','exothermic']]){await page.locator('#reaction').selectOption(id);await page.locator('#process-prediction').selectOption('exothermic');await page.locator('#start-process').click();await expect(page.locator('#panel-process .zsa-re-result')).toHaveText(type);}
});
test('heating lesson example, plateau controls, particles, negative cooling and challenge',async({page})=>{
  await page.goto(base+'?mode=heating&mass=15&start=-10&end=40&course=chem');await expect(page.locator('#heat-total')).toHaveText('Total q = 7.83 kJ');await expect(page.locator('#data-table')).toContainText('5.01');await page.locator('#heat-progress').fill('20');await page.locator('#heat-progress').press('Tab');await expect(page.locator('#particle-text')).toContainText('Segment B');await expect(page.locator('#particle-text')).toContainText('KE stays constant');
  await page.locator('#melt-answer').fill('0');await page.locator('#boil-answer').fill('100');await page.locator('#phase-answer').selectOption('BD');await page.locator('#ke-answer').selectOption('BD');await page.locator('#check-heating').click();await expect(page.locator('#heating-feedback')).toHaveText('Correct.');
  await page.goto(base+'?mode=heating&mass=25&start=100&end=100&startPhase=steam&endPhase=liquid&course=chem');await expect(page.locator('#heat-total')).toHaveText('Total q = −56.5 kJ');await expect(page.locator('#data-table')).toContainText('−5.65 × 10⁴');
  await page.goto(base+'?mode=heating&mass=36&start=0&end=0&startPhase=ice&endPhase=liquid');await expect(page.locator('#heat-total')).toHaveText('Total q = 12.0 kJ');await page.locator('#play').click();await expect(page.locator('#play')).toHaveText('Pause');await page.locator('#reset-heat').click();await expect(page.locator('#heat-progress')).toHaveValue('0');
});
test('stoichiometry flags omitted coefficient and bond tallies flag three NH bonds',async({page})=>{
  await page.goto(base+'?mode=stoich&rxn=h2');await expect(page.locator('#panel-stoich')).toContainText('−1.42 × 10³ kJ');await page.locator('#stoich-answer').fill('-2.84 × 10³');await page.locator('#check-stoich').click();await expect(page.locator('#stoich-feedback')).toContainText('coefficient');await page.locator('#stoich-answer').fill('−1.42 × 10³');await page.locator('#check-stoich').click();await expect(page.locator('#stoich-feedback')).toHaveText('Correct.');
  await page.goto(base+'?mode=bonds&rxn=nh3');await page.locator('#broken-0').fill('1');await page.locator('#broken-1').fill('3');await page.locator('#formed-2').fill('3');await page.locator('#check-bonds').click();await expect(page.locator('#bonds-feedback')).toContainText('6 N-H');await page.locator('#formed-2').fill('6');await page.locator('#check-bonds').click();await expect(page.locator('#bonds-feedback')).toHaveText('Correct.');await expect(page.locator('#panel-bonds .zsa-re-result')).toContainText('−97');await expect(page.locator('#data-table tbody tr').nth(2).locator('td').nth(1)).toHaveText('6');await expect(page.locator('#panel-bonds .zsa-re-result sub')).toHaveText('rxn');
  await page.goto(base+'?mode=stoich&course=chem');await expect(page.locator('#panel-stoich')).not.toContainText('kJ/molrxn');
});
test('formation coefficient sums, water states and unknown ethanol',async({page})=>{
  await page.goto(base+'?mode=formation&rxn=ch4');await page.locator('#products-coeff-0').fill('1');await page.locator('#products-coeff-1').fill('2');await page.locator('#sum-1').fill('-965.1');await page.locator('#check-sum-1').click();await expect(page.locator('#sum-feedback-1')).toHaveText('Correct.');
  await page.locator('#reactants-coeff-0').fill('1');await page.locator('#reactants-coeff-1').fill('2');await page.locator('#sum--1').fill('-74.8');await page.locator('#check-sum--1').click();await expect(page.locator('#sum-feedback--1')).toHaveText('Correct.');await page.locator('#formation-answer').fill('-890.3');await page.locator('#check-formation').click();await expect(page.locator('#formation-feedback')).toHaveText('Correct.');
  await page.locator('#reaction').selectOption('ethanol');await page.locator('#unknown-answer').fill('-277.4');await page.locator('#check-unknown').click();await expect(page.locator('#unknown-feedback')).toHaveText('Correct.');
});
test('Hess cancellation, multipliers and reversal mistakes',async({page})=>{
  await page.goto(base+'?mode=hess&set=so3');await page.locator('#scale-0').fill('2');await page.locator('#scale-0').press('Tab');await page.locator('#hess-answer').fill('-494.6');await page.locator('#check-hess').click();await expect(page.locator('#hess-feedback')).toContainText('Multiply ΔH');await page.locator('#hess-answer').fill('-791.4');await page.locator('#check-hess').click();await expect(page.locator('#hess-feedback')).toHaveText('Target reaction and ΔH are correct.');
  await page.goto(base+'?mode=hess&set=h2o');await page.locator('#scale-0').fill('2');await page.locator('#reverse-0').check();await page.locator('#hess-answer').fill('-571.6');await page.locator('#check-hess').click();await expect(page.locator('#hess-feedback')).toContainText('sign');await page.locator('#hess-answer').fill('571.6');await page.locator('#check-hess').click();await expect(page.locator('#hess-feedback')).toContainText('correct');
});
test('invalid settings, safe links, preserved language settings, dialogs, embed and export',async({page})=>{
  await page.goto(base+'?mode=bad&r=NaN&p=Infinity&peak=-1&mass=0&rxn=constructor');await expect(page.locator('#r')).toHaveValue('120');await expect(page.locator('#p')).toHaveValue('180');
  for(const url of ['https://zornscience.org.evil.test/','https://user@zornscience.org/','https://zornscience.org:444/','http://zornscience.org/','javascript:alert(1)']){await page.goto(base+'?from='+encodeURIComponent(url));await expect(page.locator('#back')).toHaveAttribute('href','https://zornscience.org/science/ap-chemistry/');}
  await page.goto(base+'?mode=hess&set=h2o&course=chem&from='+encodeURIComponent('https://zornscience.org/science/chemistry/hess/#practice'));await page.locator('#scale-0').fill('2');await page.getByRole('link',{name:'ES Español'}).click();await expect(page.locator('h1')).toHaveText('Laboratorio virtual de energía de reacción');await expect(page.locator('#scale-0')).toHaveValue('1');expect(new URL(page.url()).searchParams.get('set')).toBe('h2o');await expect(page.locator('#back')).toHaveAttribute('href','https://zornscience.org/es/science/chemistry/hess/#practice');
  await page.getByRole('button',{name:'Compartir actividad'}).click();await expect(page.locator('#zsa-header-share-url')).toHaveValue('https://activities.zornscience.org/reaction-energy-lab/?lang=es');await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Compartir actividad'})).toBeFocused();
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));await page.locator('#copy-data').click();await expect(page.locator('#copy-fallback')).toBeFocused();const pending=page.waitForEvent('download');await page.locator('#download-data').click();const file=await pending;expect(fs.readFileSync(await file.path(),'utf8')).toContain('Paso');
  await page.goto(base+'?embed=1&lang=es');await expect(page.locator('footer')).toBeHidden();await expect(page.locator('.zsa-languages')).toBeHidden();
});
for(const lang of ['en','es'])test(lang+' all modes, offline behavior, accessibility, mobile and screenshots',async({page,context})=>{
  const errors=[],external=[],csp=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))external.push(r.url());});await page.addInitScript(()=>{window.cspErrors=[];document.addEventListener('securitypolicyviolation',e=>window.cspErrors.push(e.violatedDirective));});
  await page.goto(base+'?lang='+lang);await page.evaluate(()=>document.fonts.ready);await context.setOffline(true);await page.locator('#tab-diagram').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#tab-process')).toBeFocused();await page.keyboard.press('End');await expect(page.locator('#tab-hess')).toBeFocused();
  await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'));
  for(const width of [1366,360]){await page.setViewportSize({width,height:900});for(const mode of modes){await page.locator('#tab-'+mode).click();if(lang==='es'&&mode==='diagram'){await expect(page.locator('#panel-diagram')).toContainText('PEproductos');await expect(page.locator('#panel-diagram')).not.toContainText('EPproductos');}expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();const violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}));});expect(violations).toEqual([]);
    if(width===1366){if(mode==='process'){await page.locator('#process-prediction').selectOption('exothermic');await page.locator('#start-process').click();await expect(page.locator('#panel-process .zsa-re-result')).toHaveText(lang==='es'?'exotérmico':'exothermic');}if(mode==='heating'){await page.locator('#heat-progress').fill('35');await page.locator('#heat-progress').press('Tab');}const dir=process.env.ZSA_RE_SCREENSHOTS||'test-results/reaction-energy-screenshots';fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,mode+'-'+lang+'.png'),fullPage:true});}
  }}
  expect(errors).toEqual([]);expect(external).toEqual([]);expect(await page.evaluate(()=>window.cspErrors)).toEqual([]);expect(await page.locator('main').innerText()).not.toContain('\u2014');
  if(lang==='es'){await expect(page.locator('html')).toHaveAttribute('lang','es-MX');await expect(page.locator('#tab-heating')).toHaveText('Curva de calentamiento');await expect(page.locator('#panel-hess')).not.toContainText('Running sum');}
});

const M=require('../../reaction-energy-lab/chem.js');
for(const lang of ['en','es']){
  test(lang+' fresh bond, process and formation presets withhold answers and mirror entries',async({page})=>{
    for(const [id,rxn] of Object.entries(M.BOND_RXNS)){
      await page.goto(base+'?mode=bonds&rxn='+id+'&lang='+lang);
      const cells=page.locator('#data-table tbody td');await expect(cells).toHaveText(Array(Object.keys({...rxn.broken,...rxn.formed}).length*2).fill('0'));
      await expect(page.locator('#show-bond-answer')).toBeHidden();await expect(page.locator('#bonds-feedback')).toBeEmpty();
      await page.locator('#broken-0').fill('9');await expect(cells.first()).toHaveText('9');
      await page.locator('#check-bonds').click();await expect(page.locator('#show-bond-answer')).toBeVisible();
      await expect(page.locator('#panel-bonds')).toContainText(lang==='es'?'Fila incorrecta.':'Row incorrect.');
      await page.locator('#show-bond-answer').click();await expect(page.locator('#panel-bonds table').last().locator('tbody tr').first().locator('td').first()).toHaveText(String(Object.values(rxn.broken)[0]));
      await expect(cells.first()).toHaveText('9');
      await page.locator('#reaction').selectOption(id==='hcl'?'ch4':'hcl');await expect(page.locator('#show-bond-answer')).toBeHidden();
    }
    for(const [id,process] of Object.entries(M.PROCESSES)){
      await page.goto(base+'?mode=process&rxn='+id+'&lang='+lang);
      await expect(page.locator('#start-process')).toBeDisabled();await expect(page.locator('#data-table tbody td')).toHaveText([lang==='es'?'todavía no':'not yet',lang==='es'?'todavía no':'not yet']);
      await expect(page.locator('#panel-process .zsa-re-result')).toHaveText(lang==='es'?'Antes del proceso':'Before the process');
      await expect(page.locator('#panel-process')).not.toContainText('34.5');await expect(page.locator('#panel-process')).not.toContainText('−890');
      const initial=await page.locator('#panel-process svg').innerHTML();
      await page.locator('#process-prediction').selectOption(process.type==='exothermic'?'endothermic':'exothermic');await page.locator('#start-process').click();
      await expect(page.locator('#panel-process .zsa-re-result')).toHaveText(lang==='es'?'Proceso en curso':'Process running');await expect(page.locator('#data-table tbody td').first()).toHaveText(lang==='es'?'todavía no':'not yet');
      await expect(page.locator('#panel-process')).toContainText(lang==='es'?'Tu predicción no coincidió.':'Your prediction did not match.');
      await expect(page.locator('#panel-process .zsa-re-result')).toHaveText(lang==='es'?(process.type==='exothermic'?'exotérmico':'endotérmico'):process.type);expect(await page.locator('#panel-process svg').innerHTML()).not.toBe(initial);
    }
    for(const id of Object.keys(M.FORMATION)){
      await page.goto(base+'?mode=formation&rxn='+id+'&lang='+lang);
      const coefficients=page.locator('#data-table tbody tr td:nth-child(3)');await expect(coefficients).toHaveText(Object.keys(M.FORMATION[id].net).map(()=>''));
      for(const field of await page.locator('#panel-formation input[id*="coeff-"]').all())await expect(field).toHaveValue('');
      const field=page.locator('#panel-formation input[id*="coeff-"]').first();await field.fill('9');expect(await coefficients.allTextContents()).toContain('9');await field.fill('');await expect(coefficients).toHaveText(Object.keys(M.FORMATION[id].net).map(()=>''));
    }
  });
  test(lang+' every README preset loads without console errors or unsolicited answers',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const queries=[...fs.readFileSync(path.join(__dirname,'../../reaction-energy-lab/README.md'),'utf8').matchAll(/^\| [^|]+ \| (mode=[^ |]+) \|$/gm)].map(m=>m[1]);expect(queries.length).toBe(15);
    for(const query of queries){const params=new URLSearchParams(query);params.set('lang',lang);await page.goto(base+'?'+params);const mode=params.get('mode');await expect(page.locator('#panel-'+mode)).toBeVisible();await expect(page.locator('main')).not.toContainText('\u2014');
      expect(await page.locator('main').evaluate(main=>{const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);while(walker.nextNode())if(walker.currentNode.textContent.includes('molrxn'))return false;return true;})).toBeTruthy();
      if(mode==='heating'){
        await expect(page.locator('#melt-answer')).toHaveValue('');await expect(page.locator('#boil-answer')).toHaveValue('');await expect(page.locator('#heating-feedback')).toBeEmpty();
        await expect(page.locator('#panel-heating table')).toHaveCount(0);
        await expect(page.locator('#data-table thead')).not.toContainText(lang==='es'?'Fase':'Phase');
        await expect(page.locator('#data-table thead')).not.toContainText('(°C)');
        await expect(page.locator('#panel-heating h3')).toHaveText(lang==='es'?'Curva completa del agua (1.00 g)':'Complete water curve (1.00 g)');await expect(page.locator('#panel-heating .zsa-re-challenge-graph svg')).toHaveAttribute('aria-label',lang==='es'?'Curva completa del agua (1.00 g)':'Complete water curve (1.00 g)');
        expect(await page.locator('#data-table').innerText()).not.toMatch(/-\d/);
        const calculator=page.locator('#panel-heating > section').filter({has:page.locator('h2', {hasText:lang==='es'?'Calculadora de segmentos':'Segment calculator'})});
        for(const line of await calculator.locator('p').allTextContents())expect(line).toMatch(/ J$/);
        await page.locator('#check-heating').click();await expect(page.locator('#data-table thead')).toContainText('(°C)');expect(await page.locator('#data-table').innerText()).not.toMatch(/-\d/);
      }
      if(mode==='formation')for(const cell of await page.locator('#data-table tbody tr td:nth-child(3)').all())await expect(cell).toBeEmpty();
      if(mode==='bonds')await expect(page.locator('#show-bond-answer')).toBeHidden();
      if(mode==='process')await expect(page.locator('#start-process')).toBeDisabled();
    }expect(errors).toEqual([]);
  });
}
test('diagram labels stay inside both charts at desktop and phone sizes',async({page})=>{
  for(const width of [1366,360]){await page.setViewportSize({width,height:900});await page.goto(base+'?r=0&p=300&peak=300');
    for(const chart of await page.locator('#panel-diagram svg').all()){
      const labels=await chart.evaluate(g=>Array.from(g.querySelectorAll('text')).filter(n=>['ΔH','Ea'].includes(n.textContent)).map(n=>{const b=n.getBBox();return {text:n.textContent,x:b.x,right:b.x+b.width,y:b.y,bottom:b.y+b.height};}));
      expect(labels).toHaveLength(2);for(const label of labels){expect(label.x).toBeGreaterThanOrEqual(55);expect(label.right).toBeLessThanOrEqual(700);expect(label.y).toBeGreaterThanOrEqual(0);expect(label.bottom).toBeLessThanOrEqual(390);}expect(labels.find(n=>n.text==='Ea').right).toBeLessThanOrEqual(175);
    }
  }
});

test('switching processes cancels the pending reveal and resets prediction',async({page})=>{
  await page.goto(base+'?mode=process&rxn=koh');await page.locator('#process-prediction').selectOption('exothermic');await page.locator('#start-process').click();await page.locator('#reaction').selectOption('coldpack');
  await expect(page.locator('#process-prediction')).toHaveValue('');await expect(page.locator('#start-process')).toBeDisabled();
  await page.waitForTimeout(900);await expect(page.locator('#panel-process .zsa-re-result')).toHaveText('Before the process');await expect(page.locator('#data-table tbody td')).toHaveText(['not yet','not yet']);
});
// Lab bench (1.1.0). Reduced motion is set with page.emulateMedia.
test('the ball rides the energy diagram, over the lower barrier with a catalyst',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'?r=120&p=180&peak=250');
  const slider=page.locator('#reaction-progress'),status=page.locator('#reaction-stage'),ball=page.locator('#panel-diagram .zsa-re-ball');
  await expect(ball).toHaveCount(1);await expect(status).toHaveText('Reactants: bonds intact.');
  const highest=async()=>{let top=1e9,stages=new Set();for(let v=0;v<=100;v+=2){await slider.fill(String(v));top=Math.min(top,Number(await ball.getAttribute('cy')));stages.add(await status.textContent());}return {top,stages};};
  const plain=await highest();
  expect([...plain.stages]).toEqual(['Reactants: bonds intact.','Climbing the barrier: energy goes in as bonds stretch and break.','Activated complex: the highest energy point.','Downhill: new bonds form.','Products formed.']);
  // The ball sits on the path: at the top it is 13 units above the peak (y = 320 − 250/300 × 250).
  expect(plain.top).toBeCloseTo(320-250/300*250-13,0);
  await page.locator('#catalyst').check();const catalyzed=await highest();expect(catalyzed.top).toBeGreaterThan(plain.top+5);
  await slider.focus();await page.keyboard.press('Home');await expect(status).toHaveText('Reactants: bonds intact.');
  await page.locator('#run-reaction').click();await expect(slider).toHaveValue('100');await expect(status).toHaveText('Products formed.');await expect(page.locator('#live')).toHaveText('Products formed.');
  await expect(slider).toHaveAttribute('aria-valuetext','100%. Products formed.');
});
test('with motion, Run reaction moves the ball along the path',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base);
  const ball=page.locator('#panel-diagram .zsa-re-ball'),x0=await ball.getAttribute('cx');
  await page.locator('#run-reaction').click();await page.waitForTimeout(800);
  const x1=Number(await ball.getAttribute('cx'));expect(x1).toBeGreaterThan(Number(x0));
  await expect(page.locator('#reaction-stage')).toHaveText('Products formed.',{timeout:6000});expect(errors).toEqual([]);
});
test('bonds break then form, with energy bars and no tallies given away',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [id,before,after] of [['hcl',2,2],['ch4',8,8],['nh3',6,6]]){
    await page.goto(base+'?mode=bonds&rxn='+id);
    const scene=page.locator('#bond-scene'),lines=scene.locator('line'),status=page.locator('#bond-stage');
    await expect(status).toHaveText('Reactant bonds are intact.');await expect(lines).toHaveCount(before);
    await expect(page.locator('#form-bonds')).toBeDisabled();await expect(page.locator('#reset-bonds')).toBeDisabled();
    await page.locator('#break-bonds').click();await expect(status).toHaveText('Breaking bonds absorbs energy.');await expect(page.locator('#form-bonds')).toBeFocused();
    expect(await page.locator('#energy-in').evaluate(m=>m.value)).toBeGreaterThan(0);expect(await page.locator('#energy-out').evaluate(m=>m.value)).toBe(0);
    await page.locator('#form-bonds').click();await expect(status).toHaveText('Forming bonds releases energy.');await expect(lines).toHaveCount(after);
    // The bars compare the two sums (hcl: 678 in, 862 out), without numbers.
    const bars=await page.evaluate(()=>[document.getElementById('energy-in').value,document.getElementById('energy-out').value]);
    if(id==='hcl')expect(bars[0]/bars[1]).toBeCloseTo(678/862,3);
    await expect(page.locator('.zsa-re-bench')).not.toContainText(/\d/);
    await expect(page.locator('#data-table tbody td').first()).toHaveText('0');await expect(page.locator('#show-bond-answer')).toBeHidden();
    await expect(scene).toHaveAttribute('aria-label',/^Bond model for .+\. Forming bonds releases energy\.$/);
    await page.locator('#reset-bonds').click();await expect(status).toHaveText('Reactant bonds are intact.');await expect(lines).toHaveCount(before);await expect(page.locator('#break-bonds')).toBeFocused();
  }
});
test('the flask and thermometer follow the heating and cooling curve',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'?mode=heating&mass=15&start=-20&end=120');
  const flask=page.locator('#heating-flask'),time=page.locator('#heat-progress');
  await expect(flask).toHaveAttribute('aria-label',/^Flask of water at −20(\.0)? °C\. Ice warming\.$/);await expect(page.locator('#flask-heat')).toHaveText('Hot plate: adding 500 J/s');
  const seen=new Set();for(let v=0;v<=100;v+=1){await time.fill(String(v));seen.add((await flask.getAttribute('aria-label')).replace(/^.*°C\. /,''));}
  expect([...seen]).toEqual(['Ice warming.','Ice melting.','Liquid water warming.','Water boiling.','Steam warming.']);
  // The thermometer reads the same temperature as the particle text.
  await time.fill('50');const particle=await page.locator('#particle-text').textContent();const reading=(await flask.getAttribute('aria-label')).match(/at (.+?) °C/)[1];expect(particle).toContain(reading+' °C');
  await page.goto(base+'?mode=heating&mass=15&start=120&end=-20');await expect(page.locator('#flask-heat')).toHaveText('Cold plate: removing 500 J/s');await expect(flask).toHaveAttribute('aria-label',/Steam cooling\.$/);
  await time.fill('100');await expect(flask).toHaveAttribute('aria-label',/Ice cooling\.$/);
});
test('bench text in Mexican Spanish',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'?lang=es');
  await expect(page.locator('#run-reaction')).toHaveText('Iniciar reacción');await expect(page.locator('#reaction-stage')).toHaveText('Reactivos: enlaces intactos.');
  await page.goto(base+'?mode=bonds&rxn=hcl&lang=es');await page.locator('#break-bonds').click();await expect(page.locator('#bond-stage')).toHaveText('Romper enlaces absorbe energía.');
  await expect(page.locator('.zsa-re-bench')).not.toContainText(/Bonds|Energy|Reactants|Products|Separate/);
  await page.goto(base+'?mode=heating&lang=es');await expect(page.locator('#flask-heat')).toHaveText('Parrilla: agrega 500 J/s');await expect(page.locator('#heating-flask')).toHaveAttribute('aria-label',/^Matraz con agua a .+ °C\. Hielo que se calienta\.$/);
});
