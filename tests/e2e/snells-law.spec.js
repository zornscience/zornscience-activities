'use strict';
const {test,expect}=require('@playwright/test');
test('refraction, total internal reflection, critical angle and matching indices',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/snells-law-lab/');
 await expect(page.locator('#refraction')).toHaveText('28.1°');
 await page.locator('#tir-mode').click();
 await expect(page.locator('#refraction')).toHaveText('No transmitted ray');
 await expect(page.locator('#scene-state')).toHaveText('TOTAL INTERNAL REFLECTION');
 await page.locator('#critical').click();
 await expect(page.locator('#refraction')).toHaveText('90.0°');
 await page.locator('#surrounding').selectOption('glass');
 await expect(page.locator('#critical')).toBeDisabled();
 await expect(page.locator('#explanation')).toContainText('Matching indices');
 await page.locator('#block').selectOption('custom');
 await page.locator('#block-index').fill('2.5');await page.locator('#block-index').press('Tab');
 await expect(page.locator('#block-n')).toHaveText('n = 2.500');
 await page.locator('#laser-power').click();await expect(page.locator('#beams path')).toHaveCount(0);
 await page.locator('#reset').click();await expect(page.locator('#refraction')).toHaveText('28.1°');
 expect(errors).toEqual([]);
});
test('snapping, dragging, keyboard controls, dialog, share and mobile fit',async({page})=>{
 await page.goto('/snells-law-lab/');
 await page.locator('#snap').click();await expect(page.locator('#protractor')).toHaveAttribute('transform','translate(480 300)');
 await page.locator('#show-protractor').uncheck();await expect(page.locator('#protractor')).toBeHidden();
 await page.locator('#show-normal').uncheck();await expect(page.locator('#normal-lines')).toBeHidden();
 await page.locator('#laser').focus();await page.keyboard.press('Home');await expect(page.locator('#incidence')).toHaveText('0.0°');
 await page.keyboard.press('ArrowRight');await expect(page.locator('#incidence')).toHaveText('1.0°');
 await page.locator('#reset').click();
 await page.locator('#laser').scrollIntoViewIfNeeded();
 const svg=await page.locator('#bench').boundingBox();
 const point=(x,y)=>({x:svg.x+x*svg.width/960,y:svg.y+y*svg.height/620});
 let p=point(285,105);await page.mouse.move(p.x,p.y);await page.mouse.down();p=point(276,182);await page.mouse.move(p.x,p.y,{steps:5});await page.mouse.up();
 expect(parseFloat(await page.locator('#incidence').textContent())).toBeGreaterThan(50);
 await page.locator('#zsa-th-instructions-open').click();await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#zsa-th-instructions-open')).toBeFocused();
 await page.locator('#zsa-th-share-toggle').click();await expect(page.locator('#zsa-th-share-url')).toHaveValue('https://activities.zornscience.org/snells-law-lab/');await page.keyboard.press('Escape');
 for(const width of [390,320]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('protractor drag snaps and accessibility scan has no serious violations',async({page})=>{
 await page.goto('/snells-law-lab/');
 const box=await page.locator('#bench').boundingBox();const xy=(x,y)=>[box.x+x*box.width/960,box.y+y*box.height/620];
 await page.mouse.move(...xy(770,155));await page.mouse.down();await page.mouse.move(...xy(480,300),{steps:10});await page.mouse.up();
 await expect(page.locator('#protractor')).toHaveAttribute('transform','translate(480 300)');
 await page.addScriptTag({url:'/node_modules/axe-core/axe.min.js'});
 const issues=await page.evaluate(async()=> (await axe.run()).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
 expect(issues).toEqual([]);
});
