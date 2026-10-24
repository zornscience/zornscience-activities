const {test,expect}=require('@playwright/test');
test('equilibrium and both calorimetry experiments work',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('/equilibrium-thermo-lab/');
 await expect(page.locator('#state')).toHaveText('At equilibrium');await page.locator('#add').click();await expect(page.locator('#explanation')).toContainText('shifts right');
 await page.locator('#pause').click();await expect(page.locator('#pause')).toHaveText('Resume');await page.locator('#reset-eq').click();
 await page.locator('#cal-tab').click();await page.locator('#start-cal').click();await page.clock.runFor(41000);await expect(page.locator('#cal-result')).toContainText('0.385 J/(g·°C)');
 await page.locator('#experiment').selectOption('acid');await page.locator('#start-cal').click();await page.clock.runFor(41000);await expect(page.locator('#cal-result')).toContainText('−57.3 kJ/mol');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
});
