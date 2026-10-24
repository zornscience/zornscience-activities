const {test, expect} = require('@playwright/test');
test('gravimetric lab follows the procedure for both unknowns and resets safely', async ({page}) => {
  await page.clock.install();
  await page.goto('/gravimetric-lab/');
  await page.locator('#zsa-th-instructions-open').click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#zsa-th-instructions-open')).toBeFocused();
  await page.locator('#zsa-th-share-toggle').click();
  await expect(page.locator('#zsa-th-share-url')).toHaveValue('https://activities.zornscience.org/gravimetric-lab/');
  await page.keyboard.press('Escape');
  for (const name of ['Sodium carbonate', 'Potassium carbonate']) {
    const readings = [];
    for (let step = 0; step < 23; step++) {
      await page.locator('#action').click();
      await page.clock.fastForward(2000);
      if ([2,6,10,19,20,21].includes(step)) readings.push(await page.locator('#balance-reading').textContent());
      if (step === 8) await expect(page.locator('#cloud')).toHaveAttribute('visibility','visible');
      if (step === 9) await expect(page.locator('#sediment')).toHaveAttribute('visibility','visible');
      if (step === 13) await expect(page.locator('#filter-cake')).toHaveAttribute('visibility','visible');
    }
    expect(readings.slice(0,3)).toEqual(['18.642 g','20.642 g','0.598 g']);
    expect(readings[3]).not.toBe(readings[4]);
    expect(readings[4]).toBe(readings[5]);
    await page.locator('#reveal').click();
    await expect(page.locator('#identity')).toContainText(name);
    await page.locator('#reset').click();
  }
  await page.locator('#action').click();
  await page.locator('#reset').click();
  await page.clock.fastForward(3000);
  await expect(page.locator('#step-counter')).toHaveText('STEP 01 / 23');
  await expect(page.locator('#balance-reading')).toHaveText('0.000 g');
  await expect(page.locator('input:not([readonly]),textarea')).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
