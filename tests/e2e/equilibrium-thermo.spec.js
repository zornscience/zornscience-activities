'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');

async function checkHeader(page,slug,title){
  await expect(page.getByRole('heading',{level:1,name:title})).toBeVisible();
  await expect(page.locator('[data-zsa-header-brand]')).toHaveAttribute('aria-label','ZornScience home');
  await expect(page.getByRole('link',{name:'ZornScience home'})).toBeVisible();
  expect(await page.locator('.zsa-th-brand img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
  const instructions=page.getByRole('button',{name:'Instructions',exact:true});
  await instructions.click();await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('How to use this lab');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(instructions).toBeFocused();
  await instructions.click();await page.getByRole('button',{name:'Close instructions',exact:true}).click();await expect(instructions).toBeFocused();
  await page.getByRole('button',{name:'Share activity'}).click();
  const url='https://activities.zornscience.org/'+slug+'/';
  await expect(page.locator('#zsa-th-share-url')).toHaveValue(url);
  const email=await page.locator('#zsa-th-share-email').getAttribute('href');expect(decodeURIComponent(email)).toContain(url);
  await page.getByRole('button',{name:'Copy link',exact:true}).click();
  await expect(page.locator('#zsa-th-share-status')).toContainText(/Link copied|Link selected/);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Share activity'})).toBeFocused();
}
async function checkMobile(page){
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.getByRole('button',{name:'Share activity'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.keyboard.press('Escape');
}

test('equilibrium has its own branded page, instructions, sharing and working simulation',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
  await page.goto('/equilibrium-lab/');await checkHeader(page,'equilibrium-lab','Equilibrium Sandbox');
  await expect(page.locator('#cal')).toHaveCount(0);await expect(page.locator('#eq-tab')).toHaveCount(0);
  await expect(page.locator('#state')).toHaveText('At equilibrium');await page.locator('#add').click();await expect(page.locator('#explanation')).toContainText('shifts right');
  await page.locator('#pause').click();await expect(page.locator('#pause')).toHaveText('Resume');await page.locator('#reset-eq').click();
  await page.locator('#volume').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('input'));});await expect(page.locator('#explanation')).toContainText('Compression');
  await page.clock.runFor(25000);await expect(page.locator('#state')).toHaveText('At equilibrium');
  const download=page.waitForEvent('download');await page.locator('#csv').click();const file=await download;expect(file.suggestedFilename()).toBe('equilibrium-lab.csv');
  expect(await fs.readFile(await file.path(),'utf8')).toContain('time_s,N2O4_M,NO2_M');
  await checkMobile(page);expect(errors).toEqual([]);
});

test('calorimetry has its own branded page and both experiments work',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
  await page.goto('/calorimetry-lab/');await checkHeader(page,'calorimetry-lab','Calorimetry & Enthalpy Lab');
  await expect(page.locator('#eq')).toHaveCount(0);await page.locator('#start-cal').click();await page.clock.runFor(41000);await expect(page.locator('#cal-practice')).toBeVisible();await expect(page.locator('#cal-result')).not.toBeVisible();await page.locator('#cal-answer').fill('-0.385');await page.locator('#check-answer').click();await expect(page.locator('#answer-feedback')).toContainText('Specific heat is positive');await page.locator('#cal-answer').fill('0.385');await page.locator('#check-answer').click();await expect(page.locator('#cal-result')).toContainText('0.385 J/(g·°C)');
  await page.locator('#experiment').selectOption('acid');await page.locator('#bv').fill('100');await page.locator('#start-cal').click();await page.clock.runFor(41000);await page.locator('#cal-answer').fill('57.3');await page.locator('#check-answer').click();await expect(page.locator('#answer-feedback')).toContainText('must be negative');await page.locator('#cal-answer').fill('-57.3');await page.locator('#check-answer').click();await expect(page.locator('#cal-result')).toContainText('−57.3 kJ/mol');await expect(page.locator('#cal-result')).toContainText('0.0500 mol');
  const download=page.waitForEvent('download');await page.locator('#csv').click();const file=await download;expect(file.suggestedFilename()).toBe('calorimetry-lab.csv');expect(await fs.readFile(await file.path(),'utf8')).toContain('time_s,temperature_C');
  await page.locator('#ac').fill('0');await page.locator('#start-cal').click();await expect(page.locator('#cal-error')).toContainText('Enter valid values');
  await checkMobile(page);expect(errors).toEqual([]);
});

test('homepage and previous combined URL link to both standalone labs',async({page})=>{
  for(const path of ['/','/equilibrium-thermo-lab/']){
    await page.goto(path);await expect(page.locator('a[href="'+(path==='/'?'':'../')+'equilibrium-lab/"]')).toHaveCount(1);await expect(page.locator('a[href="'+(path==='/'?'':'../')+'calorimetry-lab/"]')).toHaveCount(1);
  }
});


test('guided equilibrium trials capture before, immediate and settled evidence without revealing a prediction first',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/equilibrium-lab/');await page.locator('.investigation summary').click();
 await page.locator('#try-investigation').click();await expect(page.locator('#investigation-feedback')).toContainText('Choose a prediction');
 for(const [kind,prediction] of [['compress','left'],['heat','right'],['add','right']]){
  await page.locator('#investigation').selectOption(kind);await page.locator('#prediction').selectOption(prediction);await page.locator('#try-investigation').click();
  await expect(page.locator('#evidence-body tr')).toHaveCount(2);await page.clock.runFor(40000);
  await expect(page.locator('#investigation-feedback')).toContainText('prediction is supported');await expect(page.locator('#evidence-body tr')).toHaveCount(3);
 }
 await page.locator('#eq-step').click();await expect(page.locator('#pause')).toHaveText('Resume');
 const forward=+(await page.locator('#forward-value').textContent()),reverse=+(await page.locator('#reverse-value').textContent());expect(forward).toBeGreaterThan(0);expect(Math.abs(forward-reverse)).toBeLessThan(.0001);
 await page.locator('#investigation').selectOption('compress');await page.locator('#prediction').selectOption('right');await page.locator('#try-investigation').click();await page.locator('#add').click();await expect(page.locator('#investigation-feedback')).toContainText('free exploration');await expect(page.locator('#evidence')).not.toBeVisible();
 await checkMobile(page);expect(errors).toEqual([]);
});

test('calorimetry supports controlled cold-metal trials, pause, comparisons and zero heat',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/calorimetry-lab/');
 await page.locator('#hot').fill('10');await page.locator('#initial').fill('30');await page.locator('#cal-prediction').selectOption('fall');await page.locator('#start-cal').click();await expect(page.locator('#mass')).toBeDisabled();
 await page.clock.runFor(1000);await page.locator('#cal-pause').click();const temperature=await page.locator('#thermometer').textContent();await page.clock.runFor(10000);await expect(page.locator('#thermometer')).toHaveText(temperature);
 await page.locator('#cal-finish').click();await expect(page.locator('#apparatus-caption')).toContainText('water cools');await expect(page.locator('#cal-prediction-feedback')).toContainText('prediction is supported');await expect(page.locator('#cal-measurements')).toContainText('-0.');
 const trace=page.waitForEvent('download');await page.locator('#csv').click();const traceFile=await trace;expect((await fs.readFile(await traceFile.path(),'utf8')).trim().split('\n').length).toBeGreaterThan(100);await page.locator('#show-solution').click();await expect(page.locator('#cal-result')).toContainText('Specific heat = 0.385');await expect(page.locator('#comparison-body tr')).toHaveCount(1);
 await page.locator('#hot').fill('22');await page.locator('#initial').fill('22');await page.locator('#start-cal').click();await page.locator('#cal-finish').click();await expect(page.locator('#cal-result')).toContainText('cannot determine specific heat');await expect(page.locator('#comparison-body tr')).toHaveCount(2);
 await page.locator('#clear-trials').click();await expect(page.locator('#comparison-body')).toContainText('Complete a trial');
 await page.locator('#initial').fill('');await page.locator('#start-cal').click();await expect(page.locator('#cal-error')).toContainText('Enter valid values');expect(errors).toEqual([]);
});
