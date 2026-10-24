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
