'use strict';
const {test, expect} = require('@playwright/test');
test('select subjects, reveal without answering, check choices, and reset feedback', async ({page}) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/act-question-generator/');
  await expect(page.locator('#welcome')).toBeVisible();
  for (const subject of ['english', 'math', 'science']) {
    await page.locator(`[data-subject="${subject}"]`).click();
    await expect(page.locator('#progress')).toHaveText('1 of 200 seen');
    await expect(page.locator('#answer')).toBeHidden();
    await expect(page.locator('#check')).toBeDisabled();
    await expect(page.getByRole('radio')).toHaveCount(4);
    await page.getByRole('button', {name: 'Show answer', exact: true}).click();
    await expect(page.locator('#answer')).toBeVisible();
    await expect(page.locator('#answer')).toContainText('Answer');
    await expect(page.locator('#reveal')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#next').click();
    await expect(page.locator('#answer')).toBeHidden();
    await expect(page.locator('#progress')).toHaveText('2 of 200 seen');
    const correct = await page.evaluate(() => {
      const q = window.ZSA_GENERATOR_BANK[document.querySelector('[aria-pressed="true"]').dataset.subject].find(q => q.id.toUpperCase() === document.querySelector('#question-id').textContent);
      return q.answer;
    });
    await page.getByRole('radio').nth((correct+1)%4).check();
    await page.locator('#check').click();
    await expect(page.locator('#answer')).toContainText('Keep going');
    await expect(page.locator('.choice.incorrect')).toHaveCount(1);
    await expect(page.locator('.choice.correct')).toHaveCount(1);
    await page.locator('#next').click();
    const nextCorrect = await page.evaluate(() => window.ZSA_GENERATOR_BANK[document.querySelector('[aria-pressed="true"]').dataset.subject].find(q => q.id.toUpperCase() === document.querySelector('#question-id').textContent).answer);
    await page.getByRole('radio').nth(nextCorrect).check();
    await page.locator('#check').click();
    await expect(page.locator('#answer')).toContainText('Correct');
  }
  await page.locator('[data-subject="english"]').click();
  await expect(page.locator('#progress')).toHaveText('4 of 200 seen');
  await expect(page.locator('#answer')).toBeHidden();
  expect(errors).toEqual([]);
});
test('keyboard, mobile layout, iframe mode, and accessibility', async ({page}) => {
  await page.setViewportSize({width: 375, height: 812});
  await page.goto('/act-question-generator/?embed=1');
  await expect(page.locator('.site-header')).toBeHidden();
  await page.locator('[data-subject="science"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#question-title')).toBeFocused();
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#check')).toBeEnabled();
  await page.locator('#reveal').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#answer')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.addScriptTag({url: '/node_modules/axe-core/axe.min.js'});
  const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('main'), {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)})));
  expect(violations).toEqual([]);
});
