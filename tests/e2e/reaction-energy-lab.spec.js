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
  await page.goto(base+'?mode=process&rxn=koh');await page.locator('#start-process').click();await expect(page.locator('#panel-process')).toContainText('exothermic');await expect(page.locator('#panel-process')).toContainText('21.0 °C → 34.5 °C');
  for(const [id,type] of [['coldpack','endothermic'],['condensation','exothermic'],['frost','endothermic'],['ch4','exothermic']]){await page.locator('#reaction').selectOption(id);await page.locator('#start-process').click();await expect(page.locator('#panel-process .zsa-re-result')).toHaveText(type);}
});
test('heating lesson example, plateau controls, particles, negative cooling and challenge',async({page})=>{
  await page.goto(base+'?mode=heating&mass=15&start=-10&end=40&course=chem');await expect(page.locator('#heat-total')).toHaveText('Total q = 7.83 kJ');await expect(page.locator('#data-table')).toContainText('5.01');await page.locator('#heat-progress').fill('20');await page.locator('#heat-progress').press('Tab');await expect(page.locator('#particle-text')).toContainText('Segment B');await expect(page.locator('#particle-text')).toContainText('KE stays constant');
  await page.locator('#melt-answer').fill('0');await page.locator('#boil-answer').fill('100');await page.locator('#phase-answer').selectOption('BD');await page.locator('#ke-answer').selectOption('BD');await page.locator('#check-heating').click();await expect(page.locator('#heating-feedback')).toHaveText('Correct.');
  await page.goto(base+'?mode=heating&mass=25&start=100&end=100&startPhase=steam&endPhase=liquid&course=chem');await expect(page.locator('#heat-total')).toHaveText('Total q = −56.5 kJ');await expect(page.locator('#data-table')).toContainText('−5.65 × 10⁴');
  await page.goto(base+'?mode=heating&mass=36&start=0&end=0&startPhase=ice&endPhase=liquid');await expect(page.locator('#heat-total')).toHaveText('Total q = 12.0 kJ');await page.locator('#play').click();await expect(page.locator('#play')).toHaveText('Pause');await page.locator('#reset-heat').click();await expect(page.locator('#heat-progress')).toHaveValue('0');
});
test('stoichiometry flags omitted coefficient and bond tallies flag three NH bonds',async({page})=>{
  await page.goto(base+'?mode=stoich&rxn=h2');await expect(page.locator('#panel-stoich')).toContainText('−1.42 × 10³ kJ');await page.locator('#stoich-answer').fill('-2.84 × 10³');await page.locator('#check-stoich').click();await expect(page.locator('#stoich-feedback')).toContainText('coefficient');await page.locator('#stoich-answer').fill('−1.42 × 10³');await page.locator('#check-stoich').click();await expect(page.locator('#stoich-feedback')).toHaveText('Correct.');
  await page.goto(base+'?mode=bonds&rxn=nh3');await page.locator('#broken-0').fill('1');await page.locator('#broken-1').fill('3');await page.locator('#formed-2').fill('3');await page.locator('#check-bonds').click();await expect(page.locator('#bonds-feedback')).toContainText('6 N-H');await page.locator('#formed-2').fill('6');await page.locator('#check-bonds').click();await expect(page.locator('#bonds-feedback')).toHaveText('Correct.');await expect(page.locator('#data-table')).toContainText('−97');
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
    if(width===1366){if(mode==='process')await page.locator('#start-process').click();if(mode==='heating'){await page.locator('#heat-progress').fill('35');await page.locator('#heat-progress').press('Tab');}const dir=process.env.ZSA_RE_SCREENSHOTS||'test-results/reaction-energy-screenshots';fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,mode+'-'+lang+'.png'),fullPage:true});}
  }}
  expect(errors).toEqual([]);expect(external).toEqual([]);expect(await page.evaluate(()=>window.cspErrors)).toEqual([]);expect(await page.locator('main').innerText()).not.toContain('\u2014');
  if(lang==='es'){await expect(page.locator('html')).toHaveAttribute('lang','es-MX');await expect(page.locator('#tab-heating')).toHaveText('Curva de calentamiento');await expect(page.locator('#panel-hess')).not.toContainText('Running sum');}
});
