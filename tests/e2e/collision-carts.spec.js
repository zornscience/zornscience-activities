// Collision Carts in the browser: the carts and vectors drawn on the track, launch and pause, stepping through a
// collision, the readouts, presets, the end-stop pause and reset. Fails on console errors.
"use strict";
var {test, expect} = require("./fixtures");

test("the carts collide: drawing, vectors, readouts, presets, the end-stop pause and reset", async ({page, problems}) => {
  void problems;
  await page.goto("/collision-carts/");
  await expect(page.getByRole("heading", {level: 1, name: "Collision Carts"})).toBeVisible();
  var track = page.getByRole("img", {name: "Two dynamics carts on an aluminum laboratory track"});
  await expect(track.locator("text").filter({hasText: /^CART A$/})).toHaveCount(1);
  await expect(track.locator("text").filter({hasText: /^CART B$/})).toHaveCount(1);
  await expect(track.locator("#vectors text")).toHaveText(["vA 0.80", "vB = 0"]);
  await expect(page.locator("#momentum")).toHaveText("0.40 kg·m/s");
  await expect(page.locator("#energy")).toHaveText("0.16 J");
  await expect(page.locator("#phase")).toHaveText("READY TO LAUNCH");
  // Two 0.25 kg steel masses on each 0.5 kg cart (the cart itself is 0.25 kg).
  await expect(track.locator("#cart0 g[transform^='translate(0 ']")).toHaveCount(1);
  // Step to the collision (1.7 s): the velocities swap and the totals stay the same.
  var step = page.getByRole("button", {name: "Step +0.02 s"});
  for (var i = 0; i < 86; i++) await step.click();
  await expect(page.locator("#phase")).toHaveText("AFTER COLLISION / REBOUND");
  await expect(page.locator("#v0")).toHaveText("0.00 m/s");
  await expect(page.locator("#v1")).toHaveText("0.80 m/s");
  await expect(page.locator("#momentum")).toHaveText("0.40 kg·m/s");
  await expect(page.locator("#energy")).toHaveText("0.16 J");
  await expect(page.locator("#observation")).toContainText("The carts have rebounded.");
  await page.getByLabel("Momentum p").check();
  await expect(track.locator("#vectors text")).toHaveText(["vA = 0", "pA = 0", "vB 0.80", "pB 0.40"]);
  // Inelastic heavy-light preset: the carts join, momentum stays, energy drops.
  await page.getByLabel("Try a setup").selectOption("heavy");
  await page.getByLabel("Bumper type").selectOption("inelastic");
  await expect(page.locator("#badge")).toHaveText("HOOK & LOOP PADS");
  await expect(track.locator("#cart0 g[transform^='translate(0 ']")).toHaveCount(3);
  for (var j = 0; j < 90; j++) await step.click();
  await expect(page.locator("#phase")).toHaveText("AFTER COLLISION / JOINED");
  await expect(page.locator("#v0")).toHaveText("0.64 m/s");
  await expect(page.locator("#v1")).toHaveText("0.64 m/s");
  await expect(page.locator("#momentum")).toHaveText("0.80 kg·m/s");
  await expect(page.locator("#energy")).toHaveText("0.26 J");
  // Keep stepping: the run pauses before the end stop.
  for (var k = 0; k < 200 && await step.isEnabled(); k++) await step.click();
  await expect(page.locator("#phase")).toHaveText("PAUSED BEFORE END STOP");
  await expect(page.getByRole("button", {name: "Run complete"})).toBeDisabled();
  // Reset, then Launch runs in real time and Pause stops it.
  await page.getByRole("button", {name: "↺ Reset"}).click();
  await expect(page.locator("#phase")).toHaveText("READY TO LAUNCH");
  await page.getByRole("button", {name: "▶ Launch"}).click();
  await expect(page.locator("#phase")).toHaveText("CARTS IN MOTION");
  await expect(page.locator("#time")).not.toHaveText("0.00 s");
  await page.getByRole("button", {name: "Ⅱ Pause"}).click();
  await expect(page.locator("#phase")).toHaveText("PAUSED");
});
