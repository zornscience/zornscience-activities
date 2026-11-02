'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
async function slide(page,id,value){await page.locator('#'+id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);}
test('URL presets, safe lesson links, dilute acid, weak solutes and direct method',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/ph-buffer-lab/?mode=explore&solute=hcl&concentration=0.0000001&method=1&from='+encodeURIComponent('https://zornscience.org/science/chemistry/ph/'));
 await expect(page.locator('#explore-ph')).toHaveText('6.79');await expect(page.locator('#method')).toContainText('Water autoionization');
 await expect(page.locator('.zsa-back')).toHaveAttribute('href','https://zornscience.org/science/chemistry/ph/');
 await page.locator('#solute').selectOption('baoh2');await slide(page,'concentration',-2);await expect(page.locator('#explore-ph')).toHaveText('12.30');
 await expect(page.locator('#method')).toContainText('2 × C');await page.locator('#solute').selectOption('acetic');await expect(page.locator('#method')).toContainText('x/C × 100');
 await expect(page.locator('#ionized')).not.toHaveText('Ionized: 100.00%');
 for(const bad of ['javascript:alert(1)','https://example.org/','https://zornscience.org.evil.test/','https://a@zornscience.org/','https://zornscience.org:444/']){
  await page.goto('/ph-buffer-lab/?from='+encodeURIComponent(bad));await expect(page.locator('.zsa-back')).toHaveAttribute('href','https://zornscience.org/science/ap-chemistry/');
 }
 await page.goto('/ph-buffer-lab/?mode=invalid&pair=constructor&solute=__proto__&capacity=NaN&concentration=Infinity');await expect(page.locator('#explore-ph')).toHaveText('1.00');await page.locator('#tab-stress').click();await expect(page.locator('#stress-pair')).toHaveValue('acetate');
 expect(errors).toEqual([]);
});
test('builder has HH fraction, effective range and nonbuffer explanations',async({page})=>{
 await page.goto('/ph-buffer-lab/?mode=buffer&pair=phosphate');await expect(page.locator('#builder-pair')).toHaveValue('phosphate');
 await expect(page.locator('#builder-hh')).toHaveText('7.21');await slide(page,'a',-2);await expect(page.locator('#builder-hh')).toHaveText('6.21');
 await expect(page.locator('.zsa-pb-fraction span').first()).toHaveText('[A⁻]');await expect(page.locator('#buffer-range')).toContainText('6.21 to 8.21');
 await page.locator('#nonbuffer').selectOption('naoh');await expect(page.locator('#nonbuffer-why')).toContainText('no weak conjugate acid');
 await page.locator('#use-stress').click();await expect(page.locator('#panel-stress')).toBeVisible();await expect(page.locator('#stress-pair')).toHaveValue('phosphate');
});
test('stress reference, stoichiometry, depletion, reversal, data and reset',async({page})=>{
 await page.goto('/ph-buffer-lab/?mode=stress&pair=acetate&capacity=0.20');await expect(page.locator('#buffer-ph')).toHaveText('pH 4.74');await page.locator('#acid-large').click();
 await expect(page.locator('#water-ph')).toHaveText('pH 3.00');await expect(page.locator('#buffer-ph')).toHaveText('pH 4.73');await expect(page.locator('#stress-reaction')).toContainText('A⁻ + H₃O⁺ → HA + H₂O');
 await slide(page,'capacity',-2);await expect(page.locator('#data-body tr')).toHaveCount(1);
 await page.locator('#acid-large').evaluate(el=>{for(let i=0;i<8;i++)el.click();});await expect(page.locator('#stress-status')).toContainText('nearly exhausted');
 expect(Number((await page.locator('#buffer-ph').innerText()).slice(3))).toBeLessThan(3);
 await page.locator('#base-small').click();await expect(page.locator('#stress-reaction')).toContainText('Excess strong reagent reacts first');
 await page.locator('#base-large').evaluate(el=>{for(let i=0;i<8;i++)el.click();});await expect(page.locator('#stress-reaction')).toContainText('HA + OH⁻');
 await expect(page.locator('#data-body tr')).toHaveCount(18);
 const download=page.waitForEvent('download');await page.locator('#download-data').click();const file=await download;
 expect(file.suggestedFilename()).toBe('zornscience-ph-buffer-data.csv');const csv=fs.readFileSync(await file.path(),'utf8');expect(csv).toContain('Volume added (mL),HCl total (mL)');expect(csv.trim().split('\n')).toHaveLength(19);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));await page.locator('#copy-data').click();await expect(page.locator('#copy-fallback')).toBeVisible();await expect(page.locator('#copy-fallback')).toBeFocused();
 await page.locator('#stress-reset').click();await expect(page.locator('#data-body tr')).toHaveCount(1);await expect(page.locator('#water-ph')).toHaveText('pH 7.00');
});
test('all challenges give immediate explanatory feedback',async({page})=>{
 await page.goto('/ph-buffer-lab/?mode=challenge');await page.locator('#challenge-ratio').fill('0.57544');await page.locator('#check-design').click();await expect(page.locator('#design-feedback')).toContainText('Correct.');
 await page.locator('#challenge-pair').selectOption('ammonium');await expect(page.locator('#design-feedback')).toContainText('within 1');
 await slide(page,'blood-ratio',11.2);await expect(page.locator('#blood-feedback')).toContainText('In range: pH 7.40');
 await page.locator('#indicator').selectOption('phenolphthalein');await expect(page.locator('#indicator-feedback')).toContainText('Correct.');await expect(page.locator('#indicator-feedback')).toContainText('colorless to pink');
});
for(const lang of ['en','es'])test(lang+' mobile modes, keyboard tabs, offline operation and accessibility',async({page,context})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))external.push(r.url());});
 await page.goto('/ph-buffer-lab/?mode=stress&pair=acetate'+(lang==='es'?'&lang=es':''));await page.evaluate(()=>document.fonts.ready);
 await context.setOffline(true);await page.locator('#acid-large').click();await expect(page.locator('#water-ph')).toHaveText('pH 3.00');
 for(const width of [1366,390,320]){await page.setViewportSize({width,height:844});for(const mode of ['explore','buffer','stress','challenge']){
  await page.locator('#tab-'+mode).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  for(const n of await page.locator('[role="tabpanel"]:visible button').all()){const box=await n.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.x+box.width).toBeLessThanOrEqual(width+1);}
 }}
 await page.locator('#tab-explore').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#tab-buffer')).toBeFocused();await expect(page.locator('#panel-buffer')).toBeVisible();
 if(lang==='es'){await expect(page.locator('html')).toHaveAttribute('lang','es-MX');await expect(page.locator('h1')).toHaveText('Laboratorio de pH y soluciones amortiguadoras');await expect(page.locator('#nonbuffer-why')).toContainText('no es amortiguador');}
 await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'));
 for(const mode of ['explore','buffer','stress','challenge']){await page.locator('#tab-'+mode).click();const violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}));});expect(violations).toEqual([]);}
 expect(errors).toEqual([]);expect(external).toEqual([]);
});
test('Spanish dynamic feedback, CSV, share dialog, embed mode and index card',async({page})=>{
 await page.goto('/ph-buffer-lab/?lang=es&mode=challenge');await page.locator('#challenge-ratio').fill('0.57544');await page.locator('#check-design').click();await expect(page.locator('#design-feedback')).toContainText('Correcto.');
 await page.locator('#indicator').selectOption('phenolphthalein');await expect(page.locator('#indicator-feedback')).toContainText('incoloro a rosa');
 await page.locator('#tab-stress').click();await page.locator('#acid-large').click();await expect(page.locator('#stress-reaction')).toContainText('Reacción del amortiguador');
 const download=page.waitForEvent('download');await page.locator('#download-data').click();expect(fs.readFileSync(await(await download).path(),'utf8')).toContain('pH del agua');
 await page.getByRole('button',{name:'Compartir actividad'}).click();await expect(page.locator('#zsa-header-share-url')).toHaveValue('https://activities.zornscience.org/ph-buffer-lab/?lang=es');await page.keyboard.press('Escape');
 await page.goto('/ph-buffer-lab/?embed=1');await expect(page.locator('.zsa-back')).toBeHidden();await expect(page.locator('footer')).toBeHidden();
 await page.goto('/?lang=es');await expect(page.getByRole('link',{name:'Laboratorio de pH y soluciones amortiguadoras'})).toHaveAttribute('href',/ph-buffer-lab\/\?lang=es/);
});
test('shortcut accepts the acetic acid lesson and the 5 percent boundary in both languages',async({page})=>{
 for(const lang of ['en','es']){
  for(const [c,percent,accepted]of [['0.10','1.34',true],['0.0072','5.00',true],['0.0069','5.11',false]]){
   await page.goto('/ph-buffer-lab/?mode=explore&solute=acetic&concentration='+c+'&method=1&lang='+lang);
   await expect(page.locator('#method-content')).toContainText(percent+'%');
   await expect(page.locator('#method-content')).toContainText(lang==='en'?(accepted?'Yes, close enough. The shortcut and the exact pH agree within about 0.01.':'No. The shortcut is unreliable here. Use the exact equilibrium result.'):(accepted?'Sí, es suficientemente cercano.':'No. La aproximación no es confiable aquí.'));
   if(c==='0.10')await expect(page.locator('#method-content')).toContainText(lang==='en'?'Student pH = 2.87; exact pH = 2.88.':'2.87');
   await expect(page.locator('#explore-ph')).toHaveText(/\d+\.\d{2}/);
  }
 }
});
test('default 0.020 M buffer exhausts at 10 mL, with six addition buttons and integer graph ticks',async({page})=>{
 for(const lang of ['en','es']){
  await page.goto('/ph-buffer-lab/?mode=stress&pair=acetate&lang='+lang);
  await expect(page.locator('#capacity-value')).toHaveText('2.0 × 10⁻² M');
  await expect(page.locator('#capacity-note')).toContainText('10.00 mL');
  await expect(page.locator('.zsa-pb-additions button')).toHaveCount(6);
  await expect(page.locator('#acid-bulk')).toHaveText(lang==='en'?'Add 5.0 mL HCl':'Agregar 5.0 mL de HCl');
  await expect(page.locator('#base-bulk')).toHaveText(lang==='en'?'Add 5.0 mL NaOH':'Agregar 5.0 mL de NaOH');
  for(const direction of ['acid','base']){
   await page.locator('#stress-reset').click();
   await page.locator('#'+direction+'-bulk').click();await page.locator('#'+direction+'-bulk').click();
   await expect(page.locator('#data-body tr').last().locator('td').nth(1)).toHaveText('10.00');
   await expect(page.locator('#stress-status')).toContainText(lang==='en'?'nearly exhausted':'casi agotado');
   await page.locator('#'+direction+'-bulk').click();
   await expect(page.locator('#data-body tr').last().locator('td').nth(1)).toHaveText('15.00');
   const labels=await page.locator('#stress-graph text[y="288"]').allTextContents();
   expect(labels).toEqual(['0','5','10','15']);
  }
 }
});
