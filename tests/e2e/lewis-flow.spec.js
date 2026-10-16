// Lewis Structure and VSEPR Builder: one item step by step (tap to check, locked wrong picks, hints, Show me, the
// trail, the last explanation, the live region, the summary), the build step's counters and checks, resonance and
// exception wording, the AP formal charge step, the table extras, deep links, ?from=, rounds and the review queue.
"use strict";
var {test, expect, state} = require("./fixtures");
var ref = require("../support/lewis-reference");
var lv = require("./lewis-play");

async function st(page) { return state(page); }
async function bs(page) { return page.evaluate(() => window.__lv.buildState()); }
async function to(page, id, ap, kind) {
  await page.evaluate((p) => { window.__lv.single(p.id, p.ap); for (var g = 0; window.__lv.kind() !== p.kind && g < 10; g++) window.__lv.answer(p.ans); },
    {id: id, ap: ap, kind: kind, ans: lv.answers(lv.item(id), ap)});
}

test("water: steps 1 and 2, tap to check, locked picks, hints and Show me", async ({page, open}) => {
  await lv.openLv(page, open);
  await page.evaluate(() => window.__lv.single("H2O", false));
  var s = await st(page);
  expect(s.heading).toBe("H 2 O");
  expect(s.headingVisual).toBe("H2O");
  expect(s.question).toBe("1. How many valence electrons are in the whole structure?");
  expect(s.progress).toBe("Chosen structure 1 of 1 · Step 1 of 6");
  expect(s.parts.total.choices.map((c) => c.value)).toEqual(["4", "6", "7", "8", "10", "12"]);
  // The atom count above the choices.
  await expect(page.locator("#zsa-lv-work fieldset").first()).toContainText("In this structure:2 H1 O");
  await page.locator('[data-zsa-part="total"] button[value="12"]').click();
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. That is how many electrons the atoms would need to be full (8 each, 2 for H). Count the valence electrons each atom brings instead.");
  expect(s.live).toBe(s.feedback.text);
  expect(s.parts.total.choices.find((c) => c.value === "12")).toMatchObject({tried: true, pressed: false, name: "12 (tried, not correct)"});
  await page.locator('[data-zsa-part="total"] button[value="12"]').click({force: true});
  expect((await st(page)).show).toBe(false);
  await page.locator('[data-zsa-part="total"] button[value="7"]').click();
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. Count every atom, not each element once: 2 H, 1 O.");
  expect(s.show).toBe(true);
  // Hints highlight the groups of the atoms in the table.
  await page.getByRole("button", {name: "Hint", exact: true}).click();
  s = await st(page);
  expect(s.hintText.text).toMatch(/^Find each element's group in the table/);
  var hinted = await page.evaluate(() => [].filter.call(document.querySelectorAll("#zsa-lv-table thead th"), (th) => /\(hint\)/.test(th.textContent)).length);
  expect(hinted).toBe(2);
  await page.getByRole("button", {name: "Another hint", exact: true}).click();
  expect((await st(page)).hintText.text).toBe("H: 2 × 1 = 2. O: 6. Add them up.");
  await page.getByRole("button", {name: "Show me", exact: true}).click();
  s = await st(page);
  expect(s.step).toBe(1);
  expect(s.trail).toEqual([{text: "→ 8 electrons", spoken: "Shown: 8 electrons"}]);
  expect(s.last.text).toBe("→ Answer shown. 2 × 1 (H) + 6 (O) = 8 valence electrons.");
  expect(s.focus).toBe("choice:center=H");
  // Step 2: the central atom.
  expect(s.question).toBe("2. Which atom goes in the center?");
  await page.locator('[data-zsa-part="center"] button[value="H"]').click();
  expect((await st(page)).feedback.text).toBe("↻ Not yet. H can form only one bond, so it is never the central atom.");
  // The first hint turns on electronegativity in the table.
  await page.getByRole("button", {name: "Hint", exact: true}).click();
  await expect(page.locator("#zsa-lv-en")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#zsa-lv-table td", {hasText: /^O \(in this/})).toContainText("3.44");
  await page.locator('[data-zsa-part="center"] button[value="O"]').click();
  s = await st(page);
  expect(s.last.text).toBe("✓ Correct. O goes in the center: it is the least electronegative atom (H is never central).");
  expect(s.trail.map((t) => t.text)).toEqual(["→ 8 electrons", "✓ O in the center"]);
  expect(s.focus).toBe("choice:lv-build=atom0");
});

test("water: the build step's counters, statuses and checks", async ({page, open}) => {
  await lv.openLv(page, open);
  await to(page, "H2O", false, "build");
  var b = await bs(page);
  expect(b.title).toBe("Left H: 0 of 2 electrons");
  expect(b.status).toBe("Placed 0 of 8. Set every bond: 2 bonds are not set yet. 8 electrons left to place.");
  expect(b.atoms.map((a) => a.name)).toEqual([
    "Left H, bond not set, no lone pairs, 0 of 2 electrons", "Right H, bond not set, no lone pairs, 0 of 2 electrons",
    "Center O, no lone pairs, 0 of 8 electrons"]);
  expect(b.atoms.map((a) => a.pressed)).toEqual([true, false, false]);
  await page.evaluate(() => window.__lv.setBond(0, 1));
  expect((await bs(page)).status).toBe("Placed 2 of 8. Set every bond: 1 bond is not set yet. 6 electrons left to place.");
  // Counting each bond as 1 electron: 2 bonds and 4 lone pairs on O would be "8" that way, really 12.
  await page.evaluate(() => { window.__lv.setLP(2, 4); window.__lv.setBond(1, 1); });
  expect((await bs(page)).status).toBe("Placed 12 of 8. That is 4 too many. Remove some.");
  await page.evaluate(() => window.__lv.setLP(2, 3));
  expect((await bs(page)).status).toBe("Placed 10 of 8. That is 2 too many. Each bond line is 2 electrons, not 1.");
  // Exactly 8 placed with every bond set checks the structure. One wrong way: a lone pair on H.
  await page.evaluate(() => { window.__lv.setLP(2, 1); window.__lv.setLP(0, 1); });
  var s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. H holds only 2 electrons: one single bond and no lone pairs.");
  expect(s.show).toBe(false);
  expect(s.live).toBe(s.feedback.text);
  // Changing it away and back to the same structure is a second attempt.
  await page.evaluate(() => { window.__lv.setLP(0, 0); window.__lv.setLP(0, 1); });
  expect((await st(page)).show).toBe(true);
  await page.evaluate(() => { window.__lv.setLP(0, 0); window.__lv.setLP(2, 2); });
  s = await st(page);
  expect(s.step).toBe(3);
  expect(s.last.text).toBe("✓ Correct. All 8 electrons are placed and every atom has 8, except H with 2.");
  expect(s.trail[2].text).toBe("✓ Lewis structure");
  // From here the finished structure is in the strip.
  expect(await page.evaluate(() => window.__lv.stripStructure())).toBe("Lewis structure: O in the center with 2 lone pairs. Left H: single bond, no lone pairs. Right H: single bond, no lone pairs.");
});

test("the build step: octet, exception, resonance and formal charge wording", async ({page, open}) => {
  await lv.openLv(page, open);
  async function tryBuild(id, ap, stc) {
    await to(page, id, ap, "build");
    await page.evaluate((s) => window.__lv.build(s), stc);
    return st(page);
  }
  var s = await tryBuild("SO4-2", false, {c: 0, o: [[2, 2], [2, 2], [1, 3], [1, 3]]});
  expect(s.feedback.text).toBe("↻ Not yet. S has 12 electrons around it. In this set the central atom keeps an octet, no more than 8. Expanded octets are in the AP setting.");
  s = await tryBuild("SO4-2", true, {c: 0, o: [[2, 2], [2, 2], [1, 3], [1, 3]]});
  expect(s.last.text).toBe("✓ Correct. All 32 electrons are placed and every outer atom has 8, while S has 12 electrons, an expanded octet. This is one of 6 resonance structures: the 2 double bonds can be on any 2 of the 4 O atoms.");
  s = await tryBuild("SO4-2", true, {c: 0, o: [[1, 3], [1, 3], [1, 3], [1, 3]]});
  expect(s.last.text).toBe("✓ Correct. All 32 electrons are placed and every atom has 8. The formal charge step compares it with other structures.");
  s = await tryBuild("SO4-2", true, {c: 0, o: [[2, 2], [1, 3], [1, 3], [1, 3]]});
  expect(s.feedback.text).toBe("↻ Not yet. Every electron is placed and every outer atom has 8, but the formal charges are +1 on S, −1 on the right O, −1 on the top O, −1 on the bottom O. Move the bonds so the formal charges are as close to 0 as possible.");
});

test("BF3, NO3− and the build Show me: exception and resonance wording, the shown structure in the strip", async ({page, open}) => {
  await lv.openLv(page, open);
  await to(page, "BF3", false, "build");
  await page.evaluate(() => window.__lv.build({c: 0, o: [[2, 2], [1, 3], [1, 3]]}));
  var s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. B is stable with only 6 electrons. A double bond would give F, the most electronegative atom, a +1 formal charge, so three single bonds are better.");
  await to(page, "BF3", false, "build");
  await page.evaluate(() => window.__lv.build({c: 0, o: [[1, 3], [1, 3], [1, 3]]}));
  expect((await st(page)).last.text).toBe("✓ Correct. All 24 electrons are placed and every outer atom has 8, while B has only 6 electrons, a common exception for boron.");
  await to(page, "NO3-", false, "build");
  await page.evaluate(() => window.__lv.build({c: 0, o: [[1, 3], [1, 3], [2, 2]]}));
  expect((await st(page)).last.text).toBe("✓ Correct. All 24 electrons are placed and every atom has 8. This is one of 3 resonance structures: the double bond can be on any of the 3 O atoms.");
  // Two wrong attempts, then Show me: the strip shows the accepted structure.
  await to(page, "CO2", false, "build");
  await page.evaluate(() => window.__lv.build({c: 0, o: [[1, 3], [1, 3]]}));
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. C has only 4 electrons. Turn a lone pair on an outer atom into another bond: a double or triple bond.");
  await page.evaluate(() => window.__lv.build({c: 0, o: [[3, 1], [1, 3]]}));
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. Every electron is placed and every outer atom has 8, but the formal charges are +1 on the left O, −1 on the right O. Move the bonds so the formal charges are as close to 0 as possible.");
  expect(s.show).toBe(true);
  await page.getByRole("button", {name: "Show me", exact: true}).click();
  s = await st(page);
  expect(s.trail[s.trail.length - 1]).toEqual({text: "→ Lewis structure", spoken: "Shown: Lewis structure"});
  expect(s.last.text).toMatch(/^→ Answer shown\. All 16 electrons are placed and every atom has 8\.$/);
  expect(await page.evaluate(() => window.__lv.stripStructure())).toBe("Lewis structure: C in the center with no lone pairs. Left O: double bond, 2 lone pairs. Right O: double bond, 2 lone pairs.");
});

test("water: domains, shape and polarity, then the summary", async ({page, open}) => {
  await lv.openLv(page, open);
  await to(page, "H2O", false, "domains");
  var s = await st(page);
  expect(s.question).toBe("4. How many electron domains are around O, and which electron geometry?");
  expect(s.parts.domains.legend).toBe("Electron domains");
  expect(s.parts.eg.choices.map((c) => c.value)).toEqual(["linear", "trigonal planar", "tetrahedral", "bent", "trigonal pyramidal"]);
  await page.evaluate(() => { window.__lv.choose("domains", 2); window.__lv.choose("eg", "linear"); });
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. Lone pairs on O count as electron domains too. Your electron geometry matches your domain count, so fix the count first.");
  await page.evaluate(() => { window.__lv.choose("domains", 4); window.__lv.choose("eg", "bent"); });
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. Bent is a molecular geometry: it describes the atoms only. Electron geometry includes the lone pairs.");
  expect(s.parts.domains.choices.find((c) => c.value === "4").pressed).toBe(true);
  await page.evaluate(() => window.__lv.choose("eg", "tetrahedral"));
  s = await st(page);
  expect(s.last.text).toBe("✓ Correct. O has 2 bonded atoms and 2 lone pairs: 4 domains, so tetrahedral electron geometry.");
  expect(s.parts.mg.choices.map((c) => c.value)).toEqual(["tetrahedral", "trigonal pyramidal", "bent", "trigonal planar"]);
  expect(s.parts.angle.choices.map((c) => c.label)).toEqual(["109.5°", "about 107°", "about 104.5°", "120°", "90°"]);
  await page.evaluate(() => { window.__lv.choose("mg", "tetrahedral"); window.__lv.choose("angle", "109.5"); });
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. Tetrahedral is the electron geometry. The molecular geometry names only where the atoms are, and the lone pairs on O are not part of the shape. Lone pairs take more room than bonds and squeeze the bond angle below the ideal 109.5°.");
  await page.evaluate(() => { window.__lv.choose("mg", "bent"); window.__lv.choose("angle", "104.5"); });
  s = await st(page);
  expect(s.last.text).toBe("✓ Correct. Bent, about 104.5°. 2 lone pairs take corners of the tetrahedral arrangement, so the atoms form a bent shape. Lone pairs squeeze the angle.");
  expect(s.question).toBe("6. Is it polar or nonpolar, and why?");
  await page.evaluate(() => { window.__lv.choose("claim", "nonpolar"); window.__lv.choose("reason", "sym"); });
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. The lone pairs on O make the bent shape lopsided, so the bond dipoles do not cancel. The bent shape with lone pairs on O is not symmetric, so the bond dipoles cannot cancel.");
  await page.evaluate(() => { window.__lv.choose("claim", "polar"); window.__lv.choose("reason", "asym"); });
  s = await st(page);
  expect(s.summary.title).toBe("Structure complete");
  expect(s.focus).toBe("h3:Structure complete");
  expect(s.trail.map((t) => t.text)).toEqual(["✓ 8 electrons", "✓ O in the center", "✓ Lewis structure", "✓ 4 domains, tetrahedral", "✓ Bent, about 104.5°", "✓ Polar"]);
  expect(s.live).toBe("✓ Correct. Polar: the bonds are polar (O 3.44 vs H 2.20) and the bent shape does not cancel them.");
  expect(s.summary.text).toContain("8 valence electrons, O in the center.Tetrahedral electron geometry; bent, about 104.5°.Polar.");
  expect(await page.evaluate(() => window.__lv.stripStructure())).toBeNull();
});

test("CO2 and CH2Cl2: polar bonds alone, symmetric shapes, mixed outer atoms", async ({page, open}) => {
  await lv.openLv(page, open);
  await to(page, "CO2", false, "polarity");
  await page.evaluate(() => { window.__lv.choose("claim", "polar"); window.__lv.choose("reason", "asym"); });
  var s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. Polar bonds alone do not make a molecule polar. In this linear shape the identical bonds pull evenly in every direction and cancel. The linear shape is symmetric, so identical polar bonds cancel.");
  await page.evaluate(() => { window.__lv.choose("claim", "nonpolar"); window.__lv.choose("reason", "nonpolarBonds"); });
  expect((await st(page)).feedback.text).toBe("↻ Not yet. The bonds are polar: C 2.55 vs O 3.44.");
  await to(page, "CH2Cl2", false, "polarity");
  await page.evaluate(() => { window.__lv.choose("claim", "nonpolar"); window.__lv.choose("reason", "sym"); });
  expect((await st(page)).feedback.text).toBe("↻ Not yet. The tetrahedral shape would cancel identical bonds, but the outer atoms are not all the same, so the bond dipoles are unequal and do not cancel.");
});

test("AP setting: the formal charge step for sulfate", async ({page, open}) => {
  await lv.openLv(page, open, {seed: 4});
  await to(page, "SO4-2", true, "fc");
  var s = await st(page);
  expect(s.question).toBe("4. Which structure is best by formal charge?");
  expect(s.progress).toBe("Chosen structure 1 of 1 · Step 4 of 6");
  expect(s.parts.fc.choices.map((c) => c.label)).toEqual(["A", "B", "C"]);
  // Each candidate is described for screen readers.
  var described = await page.evaluate(() => [].map.call(document.querySelectorAll("#zsa-lv-work fieldset p"), (p) => p.textContent).filter((t) => /^Structure [ABC]\./.test(t)));
  expect(described).toHaveLength(3);
  var fcChoices = s.parts.fc.choices, letter = (v) => fcChoices.find((c) => c.value === v).label;
  await page.evaluate(() => window.__lv.choose("fc", 0)); // all single bonds: S +2
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. In structure " + letter("0") + ", the formal charges are S +2, each O −1. Another structure has formal charges closer to 0.");
  await page.evaluate(() => window.__lv.choose("fc", 2)); // four double bonds: S −2
  s = await st(page);
  expect(s.feedback.text).toBe("↻ Not yet. In structure " + letter("2") + ", the formal charges are S −2. Another structure has formal charges closer to 0. A negative formal charge belongs on the more electronegative atom, not on S.");
  await page.getByRole("button", {name: "Hint", exact: true}).click();
  await page.getByRole("button", {name: "Another hint", exact: true}).click();
  expect((await st(page)).hintText.text).toMatch(/^Formal charges: A: .*\. B: .*\. C: .*\.$/);
  await page.evaluate(() => window.__lv.choose("fc", 1));
  s = await st(page);
  expect(s.last.text).toBe("✓ Correct. Structure " + letter("1") + " is best: S 0, two O −1. Its formal charges are closest to 0, with negative charges on O.");
  expect(s.trail[s.trail.length - 1].text).toBe("✓ S formal charge 0");
});

test("the periodic table: valence electrons under each group, electronegativity on demand", async ({page, open}) => {
  await lv.openLv(page, open);
  // Text that is drawn on screen: not display:none and not visually hidden.
  await page.evaluate(() => { window.shownText = (el) => [].map.call(el.childNodes, (n) => n.nodeType === 3 ? n.nodeValue : (n.getClientRects().length && n.getBoundingClientRect().width > 1 ? n.textContent : "")).join("").trim(); });
  await page.evaluate(() => window.__lv.single("PCl3", false));
  var heads = await page.evaluate(() => [].map.call(document.querySelectorAll("#zsa-lv-table thead th"), (th) => window.__zsa.spoken(th).trim()));
  expect(heads).toEqual(["Period", "1, 1 valence electrons", "2, 2 valence electrons", "13, 3 valence electrons", "14, 4 valence electrons",
    "15, 5 valence electrons", "16, 6 valence electrons", "17, 7 valence electrons", "18, 8 valence electrons"]);
  var marked = await page.evaluate(() => [].filter.call(document.querySelectorAll("#zsa-lv-table td"), (td) => /in this structure/.test(td.textContent)).map((td) => td.firstChild.nodeValue));
  expect(marked).toEqual(["P", "Cl"]);
  var cell = page.locator("#zsa-lv-table td", {hasText: /^P /});
  expect(await cell.evaluate((td) => window.shownText(td))).toBe("P");
  await page.getByRole("button", {name: "Show electronegativity"}).click();
  await expect(page.locator("#zsa-lv-en")).toHaveText("Hide electronegativity");
  expect(await cell.evaluate((td) => window.shownText(td))).toBe("P2.19");
  expect(await cell.evaluate((td) => window.__zsa.spoken(td))).toBe("P (in this structure), electronegativity 2.19");
  var noble = await page.evaluate(() => [].filter.call(document.querySelectorAll("#zsa-lv-table td"), (td) => /^(He|Ne|Ar)$/.test(td.textContent)).length);
  expect(noble).toBe(3);
  // The values survive the engine redrawing the table (a new step).
  await page.evaluate(() => window.__lv.answer({total: 26}));
  expect(await page.locator("#zsa-lv-table td", {hasText: /^Cl /}).evaluate((td) => window.shownText(td))).toBe("Cl3.16");
});

test("deep links: ?item, ?set=ap and ?from", async ({page, open}) => {
  async function go(query) { await lv.openLv(page, open, {query: query}); return st(page); }
  var cases = [["?item=H2O", "H 2 O"], ["?item=NH4+", "N H 4, plus"], ["?item=NH4%2B", "N H 4, plus"], ["?item=CO3%202-", "C O 3, 2 minus"],
    ["?item=CO32-", "C O 3, 2 minus"], ["?item=carbonate", "C O 3, 2 minus"], ["?item=no3%E2%88%92", "N O 3, minus"], ["?item=SO3", "S O 3"], ["?item=SO3-2", "S O 3, 2 minus"]];
  for (var [q, heading] of cases) {
    var s = await go(q);
    expect(s.heading, q).toBe(heading);
    expect(s.progress, q).toMatch(/^Chosen structure 1 of 1 · Step 1 of/);
    expect(s.focus, q + " no focus move on load").toBe("body");
  }
  var sf4 = await go("?item=SF4");
  expect(sf4.heading).toBe("S F 4");
  expect(await page.locator("#zsa-lv-ap").isChecked()).toBe(true);
  var none = await go("?item=nonsense");
  expect(none.progress).toBe("Structure 1 of 6 · Step 1 of " + none.progress.split(" of ").pop());
  await go("?set=ap");
  expect(await page.locator("#zsa-lv-ap").isChecked()).toBe(true);
  var back = page.locator("#zsa-lv-back");
  await go("");
  await expect(back).toHaveAttribute("href", "https://zornscience.org/science/chemistry/");
  await go("?from=" + encodeURIComponent("https://zornscience.org/science/chemistry/unit-4-covalent-bonding/lewis-structures/"));
  await expect(back).toHaveAttribute("href", "https://zornscience.org/science/chemistry/unit-4-covalent-bonding/lewis-structures/");
  for (var bad of ["http://zornscience.org/science/", "https://zornscience.org.example.com/", "https://example.com/?https://zornscience.org/",
    "javascript:alert(1)", "https://user@zornscience.org/", "https://zornscience.org:8443/", "//zornscience.org/x", "not a url"]) {
    await go("?from=" + encodeURIComponent(bad));
    await expect(back, bad).toHaveAttribute("href", "https://zornscience.org/science/chemistry/");
  }
});

test("rounds: 80 octet rounds and 120 AP rounds meet the round rules", async ({page, open}) => {
  test.setTimeout(480000);
  await lv.openLv(page, open, {seed: 31});
  for (var ap of [false, true]) {
    var seen = {};
    await page.evaluate((ap) => { document.getElementById("zsa-lv-ap").checked = ap; }, ap);
    for (var r = 0; r < (ap ? 120 : 80); r++) {
      await page.evaluate(() => window.__zsa.newRound());
      var run = await lv.playRound(page, ap);
      var items = run.items.map((x) => lv.item(x.id));
      expect(items).toHaveLength(6);
      expect(new Set(items.map((x) => x.id)).size).toBe(6);
      run.items.forEach((x, i) => expect(x.progress).toMatch(new RegExp("^Structure " + (i + 1) + " of 6 · Step 1 of " + lv.kindsOf(items[i], ap).length + "$")));
      if (ap) {
        expect(items.filter((x) => x.set === "ap").length).toBeGreaterThanOrEqual(3);
        expect(items.filter((x) => x.fc).length).toBeGreaterThanOrEqual(1);
      } else {
        expect(items.every((x) => x.set !== "ap")).toBe(true);
        expect(items.filter((x) => x.domains && x.forms[0][0] > 0).length).toBeGreaterThanOrEqual(2);
        expect(items.filter((x) => x.forms[0].slice(1).some((p) => p[0] > 1)).length).toBeGreaterThanOrEqual(1);
        expect(items.filter((x) => x.charge !== 0).length).toBeGreaterThanOrEqual(1);
        expect(items.filter((x) => x.polar === false).length).toBeGreaterThanOrEqual(1);
      }
      items.forEach((x) => { seen[x.id] = true; });
      expect(run.finish.finish.title).toBe("Round complete");
      expect(run.finish.finish.text).toContain("You completed every original step on the first try.");
    }
    expect(Object.keys(seen)).toHaveLength(ap ? 37 : 29);
  }
});

test("review queue, first-try counts and Practice my misses", async ({page, open}) => {
  await lv.openLv(page, open, {seed: 12});
  // Item 1: two wrong totals then Show me (a repeat is scheduled); item 3: one wrong center pick (listed, not repeated).
  var run = await lv.playRound(page, false, {0: {total: ["wrong", "wrong", "show"]}, 2: {build: ["hint"], total: ["wrong"]}});
  expect(run.items).toHaveLength(7);
  expect(run.items[6].id).toBe(run.items[0].id);
  expect(run.items[6].progress).toMatch(/^Review 7 of 7 · Step 1 of /);
  var text = run.finish.finish.text;
  expect(text).toContain("Total valence electrons4 / 6");
  expect(text).toContain("Lewis structure6 / 6");
  expect(text).toContain("Keep practicing");
  expect(run.finish.finishButtons).toEqual(["Practice again", "Practice my misses"]);
  var missed = [run.items[0].id, run.items[2].id];
  missed.forEach((id) => expect(text).toContain(lv.item(id).name));
  await page.evaluate(() => window.__zsa.finishButton("Practice my misses"));
  var again = await lv.playRound(page, false);
  var ids = again.items.map((x) => x.id);
  missed.forEach((id) => expect(ids).toContain(id));
  var shapes = new Set(missed.map((id) => lv.item(id).mg || "two"));
  ids.forEach((id) => expect(shapes.has(lv.item(id).mg || "two"), id + " shares a missed shape").toBe(true));
  expect(again.items[0].progress).toMatch(new RegExp("^Structure 1 of " + ids.length + " "));
});

test("every item, every step: the rendered text has no dashes or hyphen-minus charges", async ({page, open}) => {
  test.setTimeout(240000);
  await lv.openLv(page, open);
  for (var ap of [false, true]) {
    for (var it of lv.data.items.filter((x) => ap || x.set !== "ap")) {
      var texts = await page.evaluate((p) => {
        var z = window.__lv, out = [];
        function grab() {
          var main = document.querySelector("main");
          out.push(main.innerText);
          [].forEach.call(main.querySelectorAll("[aria-label]"), (el) => out.push(el.getAttribute("aria-label")));
          out.push(document.getElementById("zsa-lv-live").textContent);
        }
        z.single(p.id, p.ap);
        for (var g = 0; z.kind() && g < 12; g++) {
          grab();
          window.__zsa.hint(); window.__zsa.hint(); grab();
          z.answer(p.ans); grab();
        }
        grab();
        return out;
      }, {id: it.id, ap: ap, ans: lv.answers(it, ap)});
      texts.forEach((t) => {
        expect(t, it.id).not.toMatch(/[\u2013\u2014]/);
        expect(t, it.id + ": " + t.slice(0, 200)).not.toMatch(/(\d|\b[A-Z][a-z]?)-(?![\w(])/);
      });
    }
  }
});
