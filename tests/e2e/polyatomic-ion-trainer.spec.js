const {test,expect}=require('@playwright/test');
test('flashcard recall, repeat queue, completion and missed review',async({page})=>{await page.goto('/polyatomic-ion-trainer/');await page.locator('#study-options summary').click();await page.locator('#set').selectOption('ends');await page.locator('#start').click();await page.locator('#card').click();await expect(page.locator('#flash-actions')).toBeVisible();await page.locator('#again').click();await expect(page.locator('#number')).toContainText('2 cards left');for(let j=0;j<2;j++){await page.locator('#card').click();await page.locator('#known').click();}await expect(page.locator('#results')).toBeVisible();await page.locator('#review').click();await expect(page.locator('#number')).toContainText('Review');await page.locator('#end').click();await page.locator('#restart').click();await expect(page.locator('#setup')).toBeVisible();});
for(const direction of ['name','formula'])test('quiz coverage, scoring lock and keyboard: '+direction,async({page})=>{await page.goto('/polyatomic-ion-trainer/');await page.locator('#study-options summary').click();await page.locator('#quiz-mode').click();await page.locator('#direction').selectOption(direction);await page.locator('#set').selectOption('ends');await page.locator('#start').click();await expect(page.locator('#choices button')).toHaveCount(4);await page.keyboard.press('1');await expect(page.locator('#choices button:disabled')).toHaveCount(4);await expect(page.locator('#feedback')).not.toBeEmpty();await page.locator('#next').click();await page.keyboard.press('2');await page.locator('#next').click();await expect(page.locator('#results')).toBeVisible();await expect(page.locator('#result-note')).toContainText('out of 2 answered');});
test('timed questions expire once and wait for Next',async({page})=>{await page.clock.install();await page.goto('/polyatomic-ion-trainer/');await page.locator('#study-options summary').click();await page.locator('#quiz-mode').click();await page.locator('#timing').selectOption('20');await page.locator('#start').click();await page.clock.fastForward(21000);await expect(page.locator('#feedback')).toContainText('Time’s up');await expect(page.locator('#choices button:disabled')).toHaveCount(4);await page.clock.fastForward(60000);await expect(page.locator('#number')).toContainText('Question 1 of 17');await page.locator('#next').click();await expect(page.locator('#time')).toHaveText('20');});
for(const width of [320,375,768])test('phone layout '+width,async({page})=>{await page.setViewportSize({width,height:812});await page.goto('/polyatomic-ion-trainer/');await page.locator('#study-options summary').click();await page.locator('#start').click();await page.locator('#card').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#end').click();await page.locator('#restart').click();await page.locator('#quiz-mode').click();await page.locator('#start').click();for(const button of await page.locator('.choice').all()){const box=await button.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);}expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});

test('options default closed and expand with keyboard on mobile',async({page})=>{await page.setViewportSize({width:320,height:812});await page.goto('/polyatomic-ion-trainer/');await expect(page.locator('#direction')).not.toBeVisible();await expect(page.locator('#start')).toBeVisible();const toggle=page.locator('#study-options summary');await toggle.focus();await page.keyboard.press('Enter');await expect(page.locator('#direction')).toBeVisible();await page.locator('#direction').selectOption('formula');await page.locator('#quiz-mode').click();await expect(page.locator('#timing')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const box=await toggle.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);await toggle.click();await expect(page.locator('#timing')).not.toBeVisible();await page.locator('#start').click();await expect(page.locator('#kind')).toHaveText('Recall the formula + charge');});

test('flashcard reveal keeps context and gates recall controls on a phone',async({page},testInfo)=>{await page.setViewportSize({width:375,height:812});await page.goto('/polyatomic-ion-trainer/');await page.locator('#study-options summary').click();await page.locator('#direction').selectOption('formula');await page.locator('#start').click();await expect(page.locator('#card-side')).toHaveText('Question');await expect(page.locator('#known')).toBeDisabled();await expect(page.locator('#again')).toBeDisabled();const prompt=await page.locator('#card-content').textContent();await page.screenshot({path:testInfo.outputPath('flash-front.png'),fullPage:true});await page.locator('#card').focus();await page.keyboard.press('Enter');await expect(page.locator('#card-side')).toHaveText('Answer');await expect(page.locator('#card-context')).toHaveText(prompt);await expect(page.locator('#known')).toBeEnabled();await expect(page.locator('#again')).toBeEnabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('flash-back.png'),fullPage:true});await page.keyboard.press('Space');await expect(page.locator('#known')).toBeDisabled();await page.locator('#card').click();await page.locator('#known').click();await expect(page.locator('#score')).toContainText('1 of 17 recalled');await expect(page.locator('#meter')).toHaveAttribute('value','1');await expect(page.locator('#card-side')).toHaveText('Question');await expect(page.locator('#card')).toBeFocused();});

for (const lang of ['', 'en', 'es', 'fr']) {
  test('share links preserve only Spanish language: ' + (lang || 'default'), async ({page}) => {
    const url = 'https://activities.zornscience.org/polyatomic-ion-trainer/' + (lang === 'es' ? '?lang=es' : '');
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{
        writeText: async text => { window.copiedShareUrl = text; }
      }});
      Object.defineProperty(navigator, 'share', {configurable:true, value:async data => {
        window.deviceShareUrl = data.url;
      }});
    });
    await page.goto('/polyatomic-ion-trainer/index.html?from=lesson&session=example&utm_source=test' + (lang ? '&lang=' + lang : '') + '#results');
    const share = page.getByRole('button', {name:'Share activity', exact:true});
    await share.click();
    await expect(page.locator('#zsa-ir-share-url')).toHaveValue(url);
    const email = new URL(await page.locator('#zsa-ir-share-email').getAttribute('href'));
    expect(email.searchParams.get('body').split('\n\n').pop()).toBe(url);
    const facebook = new URL(await page.locator('#zsa-ir-share-facebook').getAttribute('href'));
    expect(facebook.searchParams.get('u')).toBe(url);
    const x = new URL(await page.locator('#zsa-ir-share-x').getAttribute('href'));
    expect(x.searchParams.get('url')).toBe(url);
    await page.getByRole('button', {name:'Copy link', exact:true}).click();
    await expect.poll(() => page.evaluate(() => window.copiedShareUrl)).toBe(url);
    await page.getByRole('button', {name:'More share options', exact:true}).click();
    await expect.poll(() => page.evaluate(() => window.deviceShareUrl)).toBe(url);
    await page.keyboard.press('Escape');
    await expect(share).toBeFocused();
  });
}
