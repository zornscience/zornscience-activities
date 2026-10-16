// One item, step by step: tap to check, tried marking, partial answers, hints, Show me, the answer trail,
// the last explanation, live announcements, the item summary and the periodic table.
"use strict";
var {test, expect, state} = require("./fixtures");

function choice(page, part, value) { return page.locator('[data-zsa-part="' + part + '"] button[value="' + value + '"]'); }
async function single(page, value, dir) { await page.evaluate(([v, d]) => window.__zsa.single(v, d), [value, dir]); }
async function table(page) { return page.evaluate(() => window.__zsa.tableState()); }
function stepButton(page, name) { return page.locator("main fieldset").first().getByRole("button", {name: name, exact: true}); }

test("Ion Charge Trainer: one-part step checks on tap; wrong picks are locked", async ({page, open}) => {
  await open("ion-charge-trainer");
  await single(page, "O");
  var st = await state(page);
  expect(st.question).toBe("1. How many valence electrons does this atom have?");
  expect(st.progress).toBe("Chosen element 1 of 1 · Step 1 of 4");
  expect(await table(page)).toMatchObject({marked: ["O"], hinted: [], charges: {}});
  await choice(page, "valence", "2").click();
  st = await state(page);
  expect(st.feedback.text).toMatch(/^↻ Not yet\. That number is both oxygen's period/);
  expect(st.live).toBe(st.feedback.text);
  var tried = st.parts.valence.choices.find((c) => c.value === "2");
  expect(tried).toMatchObject({tried: true, pressed: false, label: "2", name: "2 (tried, not correct)"});
  expect(st.show).toBe(false);
  // Pressing a tried answer again does nothing and is not an attempt.
  await choice(page, "valence", "2").click({force: true});
  expect((await state(page)).show).toBe(false);
  await choice(page, "valence", "7").click();
  st = await state(page);
  expect(st.show).toBe(true);
  expect(st.feedback.text).toBe("↻ Not yet. Use a hint and try again.");
  await choice(page, "valence", "6").click();
  st = await state(page);
  expect(st.step).toBe(1);
  expect(st.trail).toEqual([{text: "✓ 6 valence electrons", spoken: "Correct: 6 valence electrons"}]);
  expect(st.trailLabel).toBe("Your answers so far");
  expect(st.last.text).toMatch(/^✓ Correct\. Oxygen has 6 valence electrons/);
  expect(st.live).toBe(st.last.text);
  expect(st.focus).toBe("choice:direction=loses");
  expect(st.progress).toBe("Chosen element 1 of 1 · Step 2 of 4");
});

test("Ion Charge Trainer: two-part step waits for both parts and clears only the wrong part", async ({page, open}) => {
  await open("ion-charge-trainer");
  await single(page, "Mg");
  await choice(page, "valence", "2").click();
  await choice(page, "count", "2").click();
  var st = await state(page);
  expect(st.feedback).toBeNull();
  expect(st.parts.count.choices.find((c) => c.value === "2").pressed).toBe(true);
  expect(st.parts.count.legend).toBe("How many electrons?");
  await choice(page, "direction", "gains").click();
  st = await state(page);
  expect(st.feedback.text).toContain("Magnesium is a metal.");
  expect(st.parts.count.choices.find((c) => c.value === "2").pressed).toBe(true);
  expect(st.parts.direction.choices.find((c) => c.value === "gains").tried).toBe(true);
  // The cleared part checks again on its next pick.
  await choice(page, "direction", "loses").click();
  st = await state(page);
  expect(st.step).toBe(2);
  expect(st.trail.map((t) => t.text)).toEqual(["✓ 2 valence electrons", "✓ Loses 2"]);
});

test("Ion Charge Trainer: hints, Show me, step 4 and the element summary", async ({page, open}) => {
  await open("ion-charge-trainer");
  await single(page, "Al");
  var hint = stepButton(page, "Hint");
  await hint.click();
  var st = await state(page);
  expect(st.hintText.text).toBe("Find aluminum on the periodic table. Which group, or column, is it in?");
  expect(st.live).toBe("Hint: " + st.hintText.text);
  expect(st.hint).toEqual({text: "Another hint", disabled: false});
  expect(await table(page)).toMatchObject({marked: ["Al"], hinted: [13]});
  await stepButton(page, "Another hint").click();
  st = await state(page);
  expect(st.hint).toEqual({text: "Both hints shown", disabled: true});
  expect(st.focus).toBe("button:Both hints shown");
  var before = st.hintText.text;
  await stepButton(page, "Both hints shown").click({force: true});
  expect((await state(page)).hintText.text).toBe(before);
  await choice(page, "valence", "1").click();
  await choice(page, "valence", "2").click();
  await stepButton(page, "Show me").click();
  st = await state(page);
  expect(st.trail).toEqual([{text: "→ 3 valence electrons", spoken: "Shown: 3 valence electrons"}]);
  expect(st.last.text).toMatch(/^→ Answer shown\. Aluminum has 3 valence electrons/);
  expect(await table(page)).toMatchObject({hinted: []});
  await choice(page, "direction", "loses").click();
  await choice(page, "count", "3").click();
  await choice(page, "charge", "3").click();
  st = await state(page);
  expect(st.question).toBe("4. Name the ion and the noble gas with the same number of electrons.");
  expect(st.parts.name.legend).toBe("Ion name");
  expect(st.parts.gas.legend).toBe("Same number of electrons as");
  await choice(page, "gas", "argon").click();
  await page.locator('[data-zsa-part="name"] button').filter({hasNotText: "aluminum ion"}).click();
  st = await state(page);
  expect(st.feedback.text).toContain("Only negative ions get the ‑ide ending.");
  expect(st.feedback.text).toContain("Aluminum lost its whole outer level");
  await choice(page, "name", "aluminum ion").click();
  await choice(page, "gas", "neon").click();
  st = await state(page);
  expect(st.summary.title).toBe("Element complete");
  expect(st.summary.button).toBe("See round summary");
  expect(st.focus).toBe("h3:Element complete");
  expect(st.trail.map((t) => t.text)).toEqual(["→ 3 valence electrons", "✓ Loses 3", "✓ Charge 3+", "✓ Aluminum ion, like neon"]);
  expect(st.progress).toBe("Chosen element 1 of 1 · Step 4 of 4");
  await page.getByRole("button", {name: "See round summary"}).click();
  st = await state(page);
  expect(st.finish.title).toBe("Chosen element complete");
  expect(st.focus).toBe("h2:Chosen element complete");
  expect(st.live).toBe("Round complete");
  expect(await table(page)).toMatchObject({marked: []});
  expect(st.finish.text).toContain("Aluminum loses 3 electrons");
});

test("Ionic Formula Builder: live formula, charge check, column charges and reduce feedback", async ({page, open}) => {
  await open("ionic-formula-builder");
  await single(page, "52", "n2f"); // calcium oxide
  var st = await state(page);
  expect(st.heading).toBe("Calcium oxide");
  expect(st.caption).toBe("Write the formula");
  expect(st.parts.metal.legend).toBe("Calcium ion");
  expect(st.parts.nonmetal.legend).toBe("Oxide ion");
  expect(await table(page)).toMatchObject({marked: ["O", "Ca"], charges: {}});
  await stepButton(page, "Hint").click();
  expect(await table(page)).toMatchObject({hinted: [2, 16]});
  await choice(page, "metal", "2").click();
  await choice(page, "nonmetal", "-2").click();
  st = await state(page);
  expect(st.step).toBe(1);
  expect(st.trail[0]).toEqual({text: "✓ Ca 2+, O 2−", spoken: "Correct: Ca 2+, O 2−"});
  expect(await table(page)).toMatchObject({hinted: [], charges: {"2": "2+", "16": "2−"}});
  var build = page.locator("main fieldset > div").first();
  await expect(build).toHaveText("Your formula so far: Ca?O?Ca not chosen O not chosen?(+2) + ?(−2)not chosen times plus 2, plus not chosen times minus 2");
  await choice(page, "msub", "2").click();
  await expect(build).toContainText("Ca2O?");
  await choice(page, "xsub", "2").click();
  st = await state(page);
  expect(st.feedback.text).toBe("↻ Not yet. 2 : 2 is the same ratio as 1 : 1. Reduce to the lowest ratio.");
  await expect(build).toContainText("2(+2) + 2(−2) = 0");
  await choice(page, "msub", "1").click();
  await choice(page, "xsub", "1").click();
  st = await state(page);
  expect(st.summary.title).toBe("Compound complete");
  expect(st.trail[1].spoken).toBe("Correct: Ca O, calcium oxide");
  expect(st.last).toBeNull();
  expect(st.summary.text).toContain("Calcium oxide. Check: (+2) + (−2) = 0, so total charge = 0.");
});

test("Ionic Formula Builder: formula to name never says the name early", async ({page, open}) => {
  await open("ionic-formula-builder");
  await single(page, "46", "f2n"); // magnesium nitride
  var st = await state(page);
  expect(st.heading).toBe("Mg 3 N 2");
  expect(st.headingVisual).toBe("Mg3N2");
  expect(st.caption).toBe("Name the compound");
  expect(st.parts.metal.legend).toBe("Mg ion");
  await choice(page, "metal", "3").click();
  await choice(page, "nonmetal", "-2").click();
  st = await state(page);
  expect(st.feedback.text).toBe("↻ Not yet. Subscripts count ions. Charges come from the group number.");
  expect(st.live).not.toContain("magnesium nitride");
  await choice(page, "metal", "2").click();
  await choice(page, "nonmetal", "-3").click();
  st = await state(page);
  expect(st.last.spoken).toBe("✓ Correct. Mg (group 2) is 2+, N (group 15) is 3−. Subscripts count ions: 3 times plus 2, plus 2 times minus 3, equals 0.");
  await page.getByRole("button", {name: "trimagnesium dinitride"}).click();
  st = await state(page);
  expect(st.feedback.text).toBe("↻ Not yet. Never use mono-, di-, or tri- for ionic compounds. The charges already set the ratio.");
  await page.getByRole("button", {name: "magnesium nitride", exact: true}).click();
  st = await state(page);
  expect(st.trail.map((t) => t.text)).toEqual(["✓ Mg 2+, N 3−", "✓ Magnesium nitride"]);
});
