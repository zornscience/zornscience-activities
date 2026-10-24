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
 await page.getByRole('button',{name:'Keyboard shortcuts'}).click();
 await expect(page.locator('#modal')).toBeVisible();
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.goto('/');await page.getByRole('link',{name:'Scientific Calculator Practice',exact:true}).click();
 await expect(page).toHaveURL(/scientific-calculator\/$/);
});
