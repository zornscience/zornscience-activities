'use strict';
const {test,expect}=require('@playwright/test');
test('probe reads Coulomb potential and charges can be moved and removed',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/equipotential-lab/');
  await expect(page.locator('#voltage')).toHaveText('0.00');await page.locator('#preset').selectOption('single');
  await page.locator('#probe').focus();for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');
  await expect(page.locator('#voltage')).toHaveText('17.98');
  await page.locator('#add-negative').click();await expect(page.locator('.field-charge')).toHaveCount(2);
  await page.locator('.field-charge').last().focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Delete');await expect(page.locator('.field-charge')).toHaveCount(1);
  await page.locator('#vectors').check();await page.locator('#heat').check();await page.locator('#reset').click();await expect(page.locator('#voltage')).toHaveText('0.00');await expect(page.locator('#vectors')).not.toBeChecked();expect(errors).toEqual([]);
});
test('header instructions and share work without a data form',async({page})=>{
  await page.goto('/equipotential-lab/');await page.getByRole('button',{name:'Instructions',exact:true}).click();await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();await page.getByRole('button',{name:'Share activity'}).click();await expect(page.locator('#zsa-th-share-url')).toHaveValue('https://activities.zornscience.org/equipotential-lab/');await expect(page.locator('input[type=text]:not([readonly]),textarea,.intro')).toHaveCount(0);
});
test('phone layout fits and probe remains keyboard operable',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/equipotential-lab/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#probe').focus();await page.keyboard.press('ArrowLeft');expect(Number(await page.locator('#voltage').textContent())).toBeGreaterThan(0);
});
