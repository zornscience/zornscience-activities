'use strict';
const {test,expect}=require('@playwright/test');
test('pendulum controls, energy, gravity and header',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/pendulum-lab/');
 await expect(page.locator('#period')).toHaveText('2.006 s');
 await page.getByRole('button',{name:'Instructions',exact:true}).click();await expect(page.locator('dialog')).toBeVisible();await page.getByRole('button',{name:'Close instructions'}).click();
 await page.getByRole('button',{name:'Share activity'}).click();await expect(page.locator('#zsa-th-share-url')).toHaveValue('https://activities.zornscience.org/pendulum-lab/');await page.getByRole('button',{name:'Close share options'}).click();
 await page.locator('#release').click();await page.waitForTimeout(600);expect(await page.locator('#ke').evaluate(e=>e.value)).toBeGreaterThan(.01);await page.locator('#release').click();
 const energy=await page.evaluate(()=>({pe:document.querySelector('#pe').value,ke:document.querySelector('#ke').value,E:document.querySelector('#pe').max}));expect(energy.pe+energy.ke).toBeCloseTo(energy.E,5);
 await page.locator('#world').selectOption('0');await page.locator('#release').click();await expect(page.locator('#status')).toContainText('No restoring force');await expect(page.locator('#velocity')).toHaveText('0.000 m/s');
 await page.locator('#world').selectOption('1.62');await expect(page.locator('#period')).toHaveText('4.937 s');
 await page.locator('#world').selectOption('9.81');await page.locator('#mass').fill('0.5');await expect(page.locator('#period')).toHaveText('2.006 s');await page.locator('#length').fill('1.5');await expect(page.locator('#period')).toHaveText('2.457 s');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
});

test('controlled comparisons, cycle timing and paused inspection', async ({page}) => {
 await page.goto('/pendulum-lab/');
 await page.locator('#compare-mass').click();
 await expect(page.locator('#comparison-result')).toContainText('Predict:');
 const massPeriod = await page.locator('#actual').textContent();
 await page.locator('#step').click();
 await expect(page.locator('#clock')).toHaveText('0.05 s');
 await expect(page.locator('#comparison-result')).toContainText('Same period, twice the energy');
 const ref = await page.locator('#reference-bob').getAttribute('cx');
 const bob = await page.locator('#bob').getAttribute('transform');
 expect(bob).toContain('translate(' + ref + ' ');
 const energy = await page.evaluate(() => ({max:document.querySelector('#pe').max,pe:document.querySelector('#pe').value,ke:document.querySelector('#ke').value}));
 expect(energy.pe+energy.ke).toBeCloseTo(energy.max,7);
 await page.locator('#compare-length').click();
 expect(parseFloat(await page.locator('#actual').textContent()) / parseFloat(massPeriod)).toBeCloseTo(Math.SQRT2,2);
 await page.locator('#compare-moon').click();
 expect(parseFloat(await page.locator('#actual').textContent()) / parseFloat(massPeriod)).toBeCloseTo(Math.sqrt(9.81/1.62),2);
 await page.locator('#compare-mass').click();
 for (let i=0;i<32;i++) await page.locator('#step').click();
 await expect(page.locator('#cycles')).toHaveText('1 complete oscillation');
 await page.locator('#length').focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('#reference')).toBeHidden();await expect(page.locator('#clock')).toHaveText('0.00 s');
});

test('dragging left keeps release side and mobile controls fit', async ({page}) => {
 await page.goto('/pendulum-lab/');
 await page.locator('#bob').scrollIntoViewIfNeeded();
 const svg=page.locator('#apparatus'), b=await svg.boundingBox(), bob=await page.locator('#bob').boundingBox();
 await page.mouse.move(bob.x+bob.width/2,bob.y+bob.height/2);await page.mouse.down();
 await page.mouse.move(b.x+b.width*350/900,b.y+b.height*310/550);await page.mouse.up();
 expect(parseFloat(await page.locator('#theta').textContent())).toBeLessThan(0);
 await page.locator('#release').click();await page.locator('#release').click();
 expect(parseFloat(await page.locator('#theta').textContent())).toBeLessThan(0);
 await page.locator('#compare-length').click();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await expect(page.locator('#apparatus-settings')).toBeHidden();await page.locator('#settings-toggle').click();await expect(page.locator('#apparatus-settings')).toBeVisible();
});
