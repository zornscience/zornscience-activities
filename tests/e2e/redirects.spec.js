// Retired activities: their old addresses send visitors to the activity that replaced them.
"use strict";
var {test, expect} = require("./fixtures");

test("the old Ionic Formula Builder address opens the Ionic Reaction Builder", async ({page, problems}) => {
  void problems;
  await page.goto("/ionic-formula-builder/");
  await page.waitForURL("**/ionic-reactions/");
  await expect(page).toHaveTitle("Ionic Reaction Builder | ZornScience");
});

test("the landing page links the Ionic Reaction Builder and shows the ZornScience favicon", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await expect(page.getByRole("link", {name: "Ionic Reaction Builder"})).toHaveAttribute("href", "ionic-reactions/");
  await expect(page.locator('a[href*="ionic-formula-builder"]')).toHaveCount(0);
  var icon = await page.evaluate(async () => {
    var href = document.querySelector('link[rel="icon"]').href;
    var img = new Image(); img.src = href; await img.decode();
    return {href: href, width: img.naturalWidth};
  });
  expect(icon.href).toMatch(/\/favicon\.png$/);
  expect(icon.width).toBeGreaterThan(0);
});
