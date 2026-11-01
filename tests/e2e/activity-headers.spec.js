"use strict";
const {test, expect} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const slugs = fs.readdirSync(root).filter(slug => {
  const file = path.join(root, slug, 'index.html');
  // Gas Laws retains its existing standalone header; i18n.spec.js checks its shared language controls.
  return !slug.startsWith('act') && slug !== 'periodic-table' && slug !== 'gas-laws' && fs.existsSync(file) &&
    /data-zsa-activity=/.test(fs.readFileSync(file, 'utf8'));
});

for (const slug of slugs) {
  test(slug + ' has consistent responsive branding and working header controls', async ({page}) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/' + slug + '/');
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('[data-zsa-header]');
    await expect(header.locator('h1')).toBeVisible();
    const logo = header.locator('[data-zsa-header-brand] img');
    expect(await logo.evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
    await expect(logo).toHaveCSS('width', '34px');
    await expect(header.locator('.brand-name')).toHaveCount(0);
    const instructions = header.getByRole('button', {name:'Instructions', exact:true});
    const share = header.getByRole('button', {name:/^Share(?: activity)?$/});
    for (const width of [1366, 390, 320]) {
      await page.setViewportSize({width, height:844});
      const logoBox = await logo.boundingBox();
      const titleBox = await header.locator('h1').boundingBox();
      expect(logoBox.x + logoBox.width).toBeLessThanOrEqual(titleBox.x);
      for (const button of await header.locator('button:visible').all()) {
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      await instructions.click();
      await expect(page.locator('dialog[open]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(instructions).toBeFocused();
      await share.click();
      const input = page.locator('input[readonly]:visible');
      await expect(input).toHaveCount(1);
      await expect(input).toHaveValue('https://activities.zornscience.org/' + slug + '/');
      await page.keyboard.press('Escape');
      await expect(share).toBeFocused();
    }
    expect(errors).toEqual([]);
  });
}

test('intro banners are removed while lab controls and quiz start remain available', async ({page}) => {
  for (const slug of ['equilibrium-lab', 'calorimetry-lab', 'polyatomic-ion-trainer']) {
    await page.goto('/' + slug + '/');
    await expect(page.locator('.intro, #setup .features, #setup h2')).toHaveCount(0);
    if (slug === 'equilibrium-lab') await expect(page.locator('#reset-eq')).toBeVisible();
    if (slug === 'calorimetry-lab') await expect(page.locator('#start-cal')).toBeVisible();
    if (slug === 'polyatomic-ion-trainer') {
      await page.locator('#start').click();
      await expect(page.locator('#play')).toBeVisible();
    }
  }
});

test('shared dialogs support clean links, copy fallback, keyboard focus and embed mode', async ({page}) => {
  await page.goto('/ion-charge-trainer/?embed=1&from=https%3A%2F%2Fzornscience.org%2Fscience%2F');
  await expect(page.locator('[data-zsa-header-brand]')).toBeHidden();
  await expect(page.locator('[data-zsa-dialog-open="zsa-header-share"]')).toBeHidden();
  const instructions = page.getByRole('button', {name:'Instructions', exact:true});
  await instructions.click();
  await expect(page.locator('#zsa-header-instructions')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(instructions).toBeFocused();
  await page.goto('/ion-charge-trainer/?from=https%3A%2F%2Fzornscience.org%2Fscience%2F');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable:true, value:{writeText:() => Promise.reject(new Error('Clipboard unavailable'))}
  }));
  const share = page.getByRole('button', {name:'Share activity', exact:true});
  await share.click();
  const input = page.locator('#zsa-header-share-url');
  await expect(input).toHaveValue('https://activities.zornscience.org/ion-charge-trainer/');
  await expect(page.locator('[data-zsa-share-email]')).toHaveAttribute('href', /ion-charge-trainer%2F$/);
  await page.getByRole('button', {name:'Copy link', exact:true}).click();
  await expect(input).toBeFocused();
  expect(await input.evaluate(el => el.selectionEnd - el.selectionStart)).toBe((await input.inputValue()).length);
  await expect(page.locator('[data-zsa-share-status]')).toContainText('Link selected');
  await page.keyboard.press('Escape');
  await expect(share).toBeFocused();
});
