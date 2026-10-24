"use strict";
const {test,expect}=require('@playwright/test');
const sequences=[
['1','A b/c','2','+','3','A b/c','4','ENTER'],
['2nd','x²','1','4','4',')','ENTER'],
['SIN','3','0',')','ENTER'],
['6','×','(','4','+','3',')','ENTER'],
['5','PRB','right','ENTER','2','ENTER'],
['LOG','1','0','0','0',')','ENTER']
];
async function key(page,k){await page.locator('[data-key]').evaluateAll((elements,k)=>elements.find(e=>e.dataset.key===k).click(),k);}
test('calculator supports all guided exercises under the site CSP',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/scientific-calculator/');
 for(let i=0;i<sequences.length;i++){
   await page.locator('.lesson').nth(i).click();
   for(const k of sequences[i])await key(page,k);
   await expect(page.locator('#lesson-detail')).toContainText('Nice work');
 }
 await expect(page.locator('#history-list button')).toHaveCount(6);
 expect(errors).toEqual([]);
});
test('calculator supports memory, statistics, keyboard input and mobile navigation',async({page})=>{
 await page.goto('/scientific-calculator/');
 await page.keyboard.type('2+3*4');await page.keyboard.press('Enter');
 await expect(page.locator('#answer')).toHaveText('14');
 for(const k of ['STO►','ENTER','CLEAR','MEMVAR','ENTER','x²','ENTER'])await key(page,k);
 await expect(page.locator('#answer')).toHaveText('196');
 await page.locator('#reset').click();
 for(const k of ['2nd','DATA','ENTER','DATA'])await key(page,k);
 await page.locator('#dataset').fill('2\n4\n6');await page.locator('#save-data').click();
 for(const k of ['STATVAR','right','ENTER'])await key(page,k);
 await expect(page.locator('#answer')).toHaveText('4');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Instructions'}).click();
 await expect(page.locator('#modal')).toBeVisible();
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.goto('/');await page.getByRole('link',{name:'Scientific Calculator Practice',exact:true}).click();
 await expect(page).toHaveURL(/scientific-calculator\/$/);
});

test('ZornScience branding and sharing match the activity shell',async({page})=>{
 await page.goto('/scientific-calculator/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Scientific Calculator Practice');
 await expect(page.getByRole('link',{name:'ZornScience home'}).locator('img')).toHaveAttribute('src','../ionic-reactions/zornscience-logo.png');
 await expect(page.locator('.calc-top')).toContainText('ZornScience');
 await page.getByRole('button',{name:'Share',exact:true}).click();
 await expect(page.locator('#share-url')).toHaveValue('https://activities.zornscience.org/scientific-calculator/');
});
for(const size of [{width:390,height:844},{width:360,height:640},{width:844,height:390}]){
 test('fullscreen fits all keys and preserves the calculation at '+size.width+'x'+size.height,async({page})=>{
  await page.setViewportSize(size);
  await page.goto('/scientific-calculator/');
  await page.keyboard.type('7*8');await page.keyboard.press('Enter');
  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
  await expect(page.locator('body')).toHaveClass(/calculator-fullscreen/);
  await expect(page.locator('.right')).toBeHidden();
  await expect(page.locator('#answer')).toHaveText('56');
  const bounds=await page.locator('[data-key],#exit-fullscreen,.lcd').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {key:el.dataset.key||el.id||'lcd',x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}));
  for(const r of bounds){expect(r.x,r.key).toBeGreaterThanOrEqual(0);expect(r.y,r.key).toBeGreaterThanOrEqual(0);expect(r.right,r.key).toBeLessThanOrEqual(size.width+1);expect(r.bottom,r.key).toBeLessThanOrEqual(size.height+1);expect(r.height,r.key).toBeGreaterThan(8);}
  for(const k of ['+','1','ENTER'])await key(page,k);
  await expect(page.locator('#answer')).toHaveText('57');
  await page.getByRole('button',{name:'Exit fullscreen calculator'}).click();
  await expect(page.locator('body')).not.toHaveClass(/calculator-fullscreen/);
  await expect(page.locator('.right')).toBeVisible();
  await expect(page.locator('#answer')).toHaveText('57');
 });
}
test('fullscreen fallback works when the native API is unavailable',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(document.documentElement,'requestFullscreen',{value:undefined,configurable:true});});
 await page.setViewportSize({width:390,height:664});
 await page.goto('/scientific-calculator/');
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
 await expect(page.locator('body')).toHaveClass(/calculator-fullscreen/);
 await page.keyboard.type('12+3');await page.keyboard.press('Enter');
 await expect(page.locator('#answer')).toHaveText('15');
 await page.keyboard.press('Escape');
 await expect(page.locator('body')).not.toHaveClass(/calculator-fullscreen/);
 await expect(page.locator('#answer')).toHaveText('15');
});

test('native fullscreen exit and denied fullscreen both restore usable controls',async({page})=>{
 await page.goto('/scientific-calculator/');
 await page.getByRole('button',{name:'Fullscreen',exact:true}).focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('body')).toHaveClass(/calculator-fullscreen/);
 const native=await page.evaluate(()=>Boolean(document.fullscreenElement));
 if(native){await page.evaluate(()=>document.exitFullscreen());await expect(page.locator('body')).not.toHaveClass(/calculator-fullscreen/);}
 else await page.getByRole('button',{name:'Exit fullscreen calculator'}).click();
 await page.evaluate(()=>{Object.defineProperty(document.documentElement,'requestFullscreen',{value:()=>Promise.reject(new Error('Not allowed')),configurable:true});});
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
 await expect(page.locator('body')).toHaveClass(/calculator-fullscreen/);
 await page.keyboard.type('9*9');await page.keyboard.press('Enter');
 await expect(page.locator('#answer')).toHaveText('81');
 await page.keyboard.press('Escape');
 await expect(page.locator('body')).not.toHaveClass(/calculator-fullscreen/);
});
