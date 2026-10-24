"use strict";
var {test, expect} = require("@playwright/test");
test("all unknowns show consistent solid, solution, solvent and mechanical responses", async function ({page}) {
  var errors=[];page.on("pageerror",function(e){errors.push(e.message);});
  await page.goto("/chemical-bonding-lab/");
  for(var n=1;n<=4;n++) {
    await page.locator('[data-sample="'+n+'"]').click();
    await page.locator('[data-station="solid"]').click();
    await page.getByRole("button",{name:"Touch probes to solid",exact:true}).click();
    await expect(page.locator("#observation")).toContainText(n===1?"very high":"none");
    await page.locator('[data-station="water"]').click();
    for(var text of ["Weigh 0.10 g","Measure 50.0 mL water","Transfer to beaker","Stir with glass rod"]) await page.getByRole("button",{name:text,exact:true}).click();
    await page.getByRole("button",{name:"Immerse conductivity probe",exact:true}).click();
    await expect(page.locator("#observation")).toContainText("Liquid conductivity: "+(n===2?"high":"none"));
    await page.getByRole("button",{name:"Lift & rinse probe",exact:true}).click();
    await expect(page.locator("#observation")).toContainText("rinsed");
    await page.locator('[data-station="cyclohexane"]').click();
    for(var text2 of ["Measure 5.0 mL cyclohexane","Add solvent & spatula-tip solid","Stir & start observation","Advance to 5:00"]) await page.getByRole("button",{name:text2,exact:true}).click();
    await expect(page.locator("#observation")).toContainText(n===4?"violet solution":"remain");
    await page.locator('[data-station="malleability"]').click();
    await page.getByRole("button",{name:n===1?"Press with pestle":"Press with scoopula",exact:true}).click();
    await expect(page.locator("#observation")).toContainText(n===1?"malleable":"brittle",{timeout:5000});
  }
  expect(errors).toEqual([]);
  await expect(page.locator("svg parsererror")).toHaveCount(0);
  await expect(page.locator("textarea,input:not([readonly]):not([type=range])")).toHaveCount(0);
});
test("foil boat heating, cooling and interrupted experiments reset correctly", async function ({page}) {
  await page.goto("/chemical-bonding-lab/");
  await page.locator('[data-station="melting"]').click();
  await page.getByRole("button",{name:"Load all four portions",exact:true}).click();
  await page.getByRole("button",{name:"Switch on hot plate",exact:true}).click();
  await expect(page.getByRole("button",{name:"Lift boat with tongs",exact:true})).toBeDisabled();
  await expect(page.locator("#scene-detail")).toHaveText("300 °C",{timeout:20000});
  await expect(page.locator("#observation")).toContainText("Unknown 2 remains solid");
  await expect(page.locator("#observation")).toContainText("decomposed");
  await page.getByRole("button",{name:"Lift boat with tongs",exact:true}).click();
  await expect(page.getByRole("button",{name:"Dispose of cooled boat",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Dispose of cooled boat",exact:true}).click();
  await expect(page.getByRole("button",{name:"Load all four portions",exact:true})).toBeVisible();
  await page.locator('[data-station="cyclohexane"]').click();
  for(var text of ["Measure 5.0 mL cyclohexane","Add solvent & spatula-tip solid","Stir & start observation"]) await page.getByRole("button",{name:text,exact:true}).click();
  await page.locator('[data-station="appearance"]').click();
  await page.waitForTimeout(500);
  await expect(page.locator("#station-title")).toHaveText("Appearance");
  await expect(page.locator("#scene-content use").first()).toHaveAttribute("href","#dish");
});
test("header dialogs, keyboard, SVG and mobile layout", async function ({page}) {
  await page.goto("/chemical-bonding-lab/");
  await page.getByRole("button",{name:"Instructions",exact:true}).click();
  await expect(page.getByRole("dialog")).toBeVisible();await page.keyboard.press("Escape");
  await expect(page.getByRole("button",{name:"Instructions",exact:true})).toBeFocused();
  await page.getByRole("button",{name:"Share",exact:true}).click();
  await expect(page.locator("#share-url")).toHaveValue("https://activities.zornscience.org/chemical-bonding-lab/");
  await page.getByRole("button",{name:"Close share options",exact:true}).click();
  for(var width of [390,768,1366]) {
    await page.setViewportSize({width:width,height:850});
    for(var s of ["appearance","solid","melting","water","cyclohexane","malleability"]) {
      await page.locator('[data-station="'+s+'"]').click();
      expect(await page.evaluate(function(){return document.documentElement.scrollWidth<=innerWidth;})).toBe(true);
      await expect(page.locator("#scene-content")).not.toBeEmpty();
      expect(await page.locator("#scene-content").evaluate(function(el){return !el.querySelector("parsererror");})).toBe(true);
    }
  }
});
