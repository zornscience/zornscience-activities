// Genetics Lab: Crossing Fruit Flies in the browser: the whole flow by tapping, dragging and keyboard, the copied
// data, seeds, layout at 360x640 and 1366x768, reduced motion, the unpublished Spanish, sharing and back links.
"use strict";
const {test, expect} = require("@playwright/test");
const m = require("../../fruit-fly-genetics-lab/model.js");
const {I18N} = require("../../fruit-fly-genetics-lab/data.js");
const AXE = require("fs").readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const URL = "/fruit-fly-genetics-lab/?seed=7";
const en = I18N.en;

// Fail on console errors or warnings, page errors and CSP violations; record every request.
async function open(page, query = "", opts = {}) {
  const problems = [], requests = [];
  page.on("console", msg => { if (["error", "warning"].includes(msg.type())) problems.push(msg.type() + ": " + msg.text()); });
  page.on("pageerror", e => problems.push("page error: " + e.message));
  page.on("request", r => requests.push(r.url()));
  await page.addInitScript(() => document.addEventListener("securitypolicyviolation", e => console.error("CSP " + e.violatedDirective)));
  if (opts.noClipboard) await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", {value: undefined}); });
  await page.goto(URL + query);
  await expect(page.locator("#zsa-ff-step-title")).toHaveText(opts.title || en["step.hook"]);
  return {problems, requests};
}
const next = page => page.locator("#zsa-ff-next").click();
const live = page => page.locator("#zsa-ff-live");
async function pick(page, kind, value) {
  const tile = page.locator(`[data-key="token:${kind}:${value}"]`);
  if (await tile.getAttribute("aria-pressed") !== "true") await tile.click();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
}
async function fill(page, cells) {
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) for (let k = 0; k < 2; k++) {
    await pick(page, "allele", cells[r][c][k]);
    await page.locator(`[data-key="slot:${r}:${c}:${k}"]`).click();
  }
}
const square = (p1, p2) => m.punnett(p1, p2).cells.map(row => row.map(g => [g[0], g[1]]));
async function runSizes(page, label, sizes) {
  for (const n of sizes) {
    const b = page.locator(`[data-key="run:${label}:${n}"]`);
    await expect(b).toBeEnabled();
    await b.click();
    await expect(live(page)).toContainText(n + " offspring");
  }
}
async function solveMystery(page, seed) {
  const flies = m.mysteryFlies(seed);
  for (let i = 0; i < 3; i++) {
    await page.locator(`input[data-key="mfly:${i}"]`).check();
    await page.locator('[data-key="mrun"]').click();
    await page.locator('[data-key="mrun"]').click();
    const text = await page.locator("figcaption.zsa-ff-strong").textContent();
    const rec = Number(text.match(/, (\d+) with/)[1]);
    const tr = m.TRAITS[flies[i].trait];
    // Decide from the evidence, as a student would.
    const answer = rec > 0 ? tr.dominant + tr.recessive : tr.dominant + tr.dominant;
    await page.locator(`input[data-key="verdict:${answer}"]`).check();
    await expect(page.locator(".zsa-ff-feedback").last()).toContainText(rec > 0 || flies[i].kind === "homozygous" ? "Correct." : "Good reasoning.");
  }
}

test("fruit-fly-genetics-lab: the whole lab by tapping, with the copied data", async ({page, context}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const {problems, requests} = await open(page);
  await expect(page).toHaveTitle(en.title + " | ZornScience");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  // No language toggle while the Spanish is unpublished, and focus has not moved on load.
  await expect(page.locator(".zsa-languages")).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  // 9 step chips; the bonus is locked.
  await expect(page.locator(".zsa-ff-chip")).toHaveCount(9);
  await expect(page.getByRole("button", {name: /^Bonus: Two traits at once \(locked\)/})).toHaveAttribute("aria-disabled", "true");

  // 1. Hook: 12 offspring, all normal; the choice is saved, not graded.
  await expect(page.getByRole("img", {name: en["hook.vialLabel"]})).toBeVisible();
  await page.getByRole("radio", {name: en["hook.option.hidden"]}).check();
  await expect(live(page)).toHaveText(en["hook.saved"]);
  await next(page);

  // 2. Traits: switch alleles until all three goals are done.
  await expect(page.locator("#zsa-ff-step-title")).toBeFocused();
  await expect(page.locator(".zsa-ff-goal--done")).toHaveCount(0);
  await page.locator('[data-key="allele:1"]').click(); // NnRR looks the same as the starting NNRR
  await expect(page.locator(".zsa-ff-readout")).toContainText("Nn: heterozygous, so normal wings");
  await expect(live(page)).toContainText("Goal done: " + en["traits.goal.same"]);
  await page.locator('[data-key="allele:0"]').click(); // nnRR
  await expect(page.locator(".zsa-ff-readout")).toContainText("vestigial wings");
  await page.locator('[data-key="allele:3"]').click(); // Rr
  await expect(page.getByRole("img", {name: "Fruit fly with vestigial wings, red eyes. Genotype nnRr."})).toBeVisible();
  await expect(page.locator(".zsa-ff-goal--done")).toHaveCount(3);
  await expect(page.getByRole("button", {name: /^Step 2: Meet the traits \(done\)/})).toBeVisible();
  await next(page);

  // 3. Punnett square: one wrong box, the check, then right; a wrong prediction, then right.
  await expect(page.getByRole("radio", {name: /^Nn: heterozygous/}).first()).toBeChecked();
  const nn = square("Nn", "nn");
  nn[0][0] = ["N", "N"];
  await fill(page, nn);
  await page.getByRole("button", {name: en["square.check"]}).click();
  await expect(live(page)).toHaveText("3 of 4 boxes are right.");
  await expect(page.locator('[data-key="slot:0:0:1"]')).toHaveAttribute("aria-label", /not right yet/);
  await pick(page, "allele", "n");
  await page.locator('[data-key="slot:0:0:1"]').click();
  await page.getByRole("button", {name: en["square.check"]}).click();
  await expect(live(page)).toHaveText(en["square.solved"]);
  await page.getByRole("radio", {name: "3 of 4"}).check();
  await expect(page.locator(".zsa-ff-feedback--retry")).toContainText("Count again.");
  await page.getByRole("radio", {name: "2 of 4"}).check();
  await expect(page.locator(".zsa-ff-feedback--good").last()).toContainText("about 50% of the offspring will have normal wings");
  await next(page);

  // 4. Run the cross: sizes unlock in order; counts are the seeded sample for this visit.
  await expect(page.locator('[data-key="run:cross1:40"]')).toBeDisabled();
  await runSizes(page, "cross1", [8, 40, 200]);
  const rows = await page.locator(".zsa-ff-table tbody tr").allTextContents();
  expect(rows).toHaveLength(4);
  const counts = {};
  [8, 40, 200].forEach((n, i) => {
    const numbers = rows[i + 1].match(/(\d+) \(/g).map(x => Number(x.slice(0, -2)));
    expect(numbers[0] + numbers[1]).toBe(n);
    counts[n] = numbers;
    const expected = m.tally(m.sample("Nn", "nn", n, m.streamSeed(7, "cross1|Nn|nn|" + n + "|" + (i + 1))), ["wings"]).counts;
    expect(numbers).toEqual([expected.normal, expected.vestigial]);
  });
  await expect(page.getByRole("img", {name: /^Bar chart of offspring percentages/})).toBeVisible();
  await expect(page.locator(".zsa-ff-vial use")).toHaveCount(200);
  await page.getByRole("radio", {name: en["reflect.option.exact"]}).check();
  await expect(page.locator(".zsa-ff-feedback--retry")).toContainText("Not quite.");
  await page.getByRole("radio", {name: en["reflect.option.closer"]}).check();
  await expect(page.locator(".zsa-ff-feedback--good")).toContainText("In your data, 8 flies");
  await next(page);

  // 5. F1 to F2.
  await fill(page, square("Nn", "Nn"));
  await page.getByRole("button", {name: en["square.check"]}).click();
  await page.getByRole("radio", {name: "3 of 4"}).check();
  await runSizes(page, "f2", [8, 40, 200]);
  await expect(page.locator(".zsa-ff-feedback").last()).toContainText("Your Punnett square predicted 3 : 1.");
  await expect(page.locator(".zsa-ff-feedback").last()).toContainText("In step 1 you chose: \"" + en["hook.option.hidden"] + "\"");
  await next(page);

  // 6. Mystery parents: a wrong verdict first, then decided from the evidence.
  const flies = m.mysteryFlies(7);
  await page.locator('[data-key="mrun"]').click();
  const tr0 = m.TRAITS[flies[0].trait];
  const wrong = flies[0].kind === "homozygous" ? tr0.dominant + tr0.recessive : tr0.dominant + tr0.dominant;
  await page.locator(`input[data-key="verdict:${wrong}"]`).check();
  await expect(page.locator(".zsa-ff-feedback--retry")).toBeVisible();
  await page.getByRole("button", {name: en["nav.redo"]}).click();
  await expect(page.locator('[data-key="mrun"]')).toHaveText("Run a test cross (10 offspring)");
  await solveMystery(page, 7);
  await expect(page.getByRole("button", {name: /^Step 6: Mystery parents \(done\)/})).toBeVisible();
  await next(page);

  // 7. Checks: wrong answers give their own feedback; all right unlocks the bonus.
  await page.locator('input[data-key="q2:b"]').check();
  await expect(page.locator(".zsa-ff-feedback--retry")).toContainText(en["checks.q2.fb.b"]);
  for (const q of ["q1", "q2", "q3", "q4"]) await page.locator(`input[data-key="${q}:a"]`).check();
  await expect(live(page)).toContainText(en["checks.unlocked"]);
  await expect(page.getByText("4 of 4 correct")).toBeVisible();
  await next(page);

  // Bonus: gametes in the headers (any order), the 4 x 4 square, the ratio and the runs.
  await expect(page.locator("#zsa-ff-step-count")).toHaveText(en["nav.bonusCount"]);
  for (const [which, gs] of [["top", ["NR", "Nr", "nR", "nR"]], ["side", ["nr", "nR", "Nr", "NR"]]]) for (let i = 0; i < 4; i++) {
    await pick(page, "gamete", gs[i]);
    await page.locator(`[data-key="head:${which}:${i}"]`).click();
  }
  await page.locator('[data-key="dcheck"]').click();
  await expect(live(page)).toHaveText("Parent 1 gametes: not right yet. Parent 2 gametes: right. " + en["bonus.hint"]);
  await pick(page, "gamete", "nr");
  await page.locator('[data-key="head:top:3"]').click();
  await page.locator('[data-key="dcheck"]').click();
  await expect(page.locator(".zsa-ff-grid--4 .zsa-ff-cellgeno")).toHaveCount(16);
  await page.locator('input[data-key="dpred:4-4-4-4"]').check();
  await page.locator('input[data-key="dpred:9-3-3-1"]').check();
  await runSizes(page, "di", [16, 80, 400]);
  await next(page);

  // 9. Copy my data.
  await page.getByRole("button", {name: en["copy.button"], exact: true}).click();
  await expect(live(page)).toHaveText(en["copy.done"]);
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toBe(await page.locator("#zsa-ff-copy-text").textContent());
  const lines = text.split("\n");
  expect(lines[0]).toBe(en.title);
  expect(lines[1]).toBe("Lab seed\t7");
  expect(text).toContain("Parents\tNn × nn\nPredicted ratio\t1 : 1 (normal wings : vestigial wings)");
  [8, 40, 200].forEach(n => expect(text).toContain("\n" + n + "\t" + counts[n][0] + "\t" + counts[n][1] + "\t"));
  expect(text).toContain("Parents\tNn × Nn\nPredicted ratio\t3 : 1 (normal wings : vestigial wings)");
  expect(text).toContain("Predicted ratio\t9 : 3 : 3 : 1 (");
  flies.forEach((f, i) => expect(text).toMatch(new RegExp("Mystery fly " + "ABC"[i] + "\\t[^\\n]*\\t" + f.genotype + "$", "m")));
  [1, 2, 3].forEach(n => expect(text).toContain(en["copy.starter" + n]));
  expect(text).not.toMatch(/[–—]/);
  expect(lines.filter(l => l.includes("\t")).length).toBeGreaterThan(20);
  await expect(page.getByRole("button", {name: /^Step 9: Copy my data \(done\)/})).toBeVisible();
  expect(requests.every(u => u.startsWith("http://127.0.0.1:"))).toBe(true);
  requests.filter(u => /\.(js|css|png)\?/.test(u)).forEach(u => expect(u).toMatch(/\?v=1\.0\.0$/));
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: drag tiles into the square with a mouse and with touch", async ({page}) => {
  const {problems} = await open(page);
  await page.locator('[data-key="nav:2"]').click();
  const cells = square("Nn", "nn");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) for (let k = 0; k < 2; k++) {
    await page.locator(`[data-key="token:allele:${cells[r][c][k]}"]`).dragTo(page.locator(`[data-key="slot:${r}:${c}:${k}"]`));
    await expect(page.locator(`[data-key="slot:${r}:${c}:${k}"]`)).toHaveText(cells[r][c][k]);
  }
  // A drag that ends outside every box places nothing.
  await page.locator('[data-key="slot:1:1:1"]').click(); // empties it (no tile chosen)
  await expect(page.locator('[data-key="slot:1:1:1"]')).toHaveText("");
  await page.locator('[data-key="token:allele:n"]').dragTo(page.locator("#zsa-ff-step-title"));
  await expect(live(page)).toHaveText(en["token.missed"]);
  // Touch: pointer events with pointerType touch.
  await page.locator(".zsa-ff-bank").evaluate(e => e.scrollIntoView({block: "start"}));
  const from = await page.locator('[data-key="token:allele:n"]').boundingBox(), to = await page.locator('[data-key="slot:1:1:1"]').boundingBox();
  await page.locator('[data-key="token:allele:n"]').dispatchEvent("pointerdown", {pointerId: 5, pointerType: "touch", button: 0, clientX: from.x + 10, clientY: from.y + 10, bubbles: true});
  for (const f of [0.3, 0.7, 1]) await page.locator('[data-key="token:allele:n"]').dispatchEvent("pointermove", {pointerId: 5, pointerType: "touch", clientX: from.x + 10 + (to.x - from.x) * f, clientY: from.y + 10 + (to.y - from.y) * f, bubbles: true});
  await page.locator('[data-key="token:allele:n"]').dispatchEvent("pointerup", {pointerId: 5, pointerType: "touch", button: 0, clientX: to.x + 10, clientY: to.y + 10, bubbles: true});
  await expect(page.locator('[data-key="slot:1:1:1"]')).toHaveText("n");
  await page.getByRole("button", {name: en["square.check"]}).click();
  await expect(live(page)).toHaveText(en["square.solved"]);
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: the Punnett square and choices by keyboard only", async ({page}) => {
  const {problems} = await open(page);
  await page.locator('[data-key="nav:2"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-ff-step-title")).toBeFocused();
  const cells = square("Nn", "nn");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) for (let k = 0; k < 2; k++) {
    const tile = page.locator(`[data-key="token:allele:${cells[r][c][k]}"]`);
    if (await tile.getAttribute("aria-pressed") !== "true") {
      await tile.focus(); await page.keyboard.press("Enter");
      await expect(tile).toBeFocused(); // focus survives the re-render
    }
    const slot = page.locator(`[data-key="slot:${r}:${c}:${k}"]`);
    await slot.focus();
    await page.keyboard.press(r + c + k === 0 ? "Space" : "Enter");
    await expect(slot).toBeFocused();
    await expect(slot).toHaveAttribute("aria-label", new RegExp("Row " + (r + 1) + ", column " + (c + 1) + ", allele " + (k + 1) + ": (capital|lowercase) " + cells[r][c][k]));
  }
  // Escape puts the chosen tile back.
  await page.keyboard.press("Escape");
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page.getByRole("button", {name: en["square.check"]}).focus();
  await page.keyboard.press("Enter");
  await expect(live(page)).toHaveText(en["square.solved"]);
  // Radio choices with arrow keys.
  await page.getByRole("radio", {name: "0 of 4"}).focus();
  for (let i = 0; i < 2; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", {name: "2 of 4"})).toBeChecked();
  await expect(page.locator(".zsa-ff-feedback--good").last()).toBeVisible();
  // Start over: the dialog, Cancel, then confirm.
  await page.locator("#zsa-ff-reset").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#zsa-ff-reset-dialog")).toBeVisible();
  await expect(page.locator("#zsa-ff-reset-cancel")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#zsa-ff-step-title")).toHaveText(en["step.punnett"]);
  await page.locator("#zsa-ff-reset").click();
  await page.locator("#zsa-ff-reset-confirm").click();
  await expect(page.locator("#zsa-ff-step-title")).toHaveText(en["step.hook"]);
  await expect(page.locator(".zsa-ff-chip-done")).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: Show me, Redo, the bonus lock and the same flies for the same seed", async ({page}) => {
  const {problems} = await open(page);
  await page.getByRole("button", {name: /^Bonus/}).click({force: true}); // aria-disabled, but still answers a click
  await expect(live(page)).toHaveText(en["nav.lockedNote"]);
  await expect(page.locator("#zsa-ff-step-title")).toHaveText(en["step.hook"]);
  await page.locator('[data-key="nav:3"]').click();
  await expect(page.locator(".zsa-ff-feedback--info")).toHaveText(/First finish your Punnett square/);
  await page.getByRole("button", {name: "Go to Build a Punnett square"}).click();
  await page.getByRole("radio", {name: "Eye color"}).check();
  await expect(page.getByRole("radio", {name: /^Rr: heterozygous, red eyes/}).first()).toBeChecked();
  for (let i = 0; i < 2; i++) await page.getByRole("button", {name: en["square.check"]}).click();
  await page.getByRole("button", {name: en["square.showMe"]}).click();
  await expect(page.locator(".zsa-ff-cellgeno")).toHaveText(["Rr", "rr", "Rr", "rr"]);
  await page.getByRole("button", {name: en["nav.redo"]}).click();
  await expect(page.locator(".zsa-ff-slot")).toHaveCount(8);
  // Reload with the same seed: the same mystery flies and the same 8 offspring.
  const flies = m.mysteryFlies(7).map(f => m.TRAITS[f.trait].dominantPhenotype);
  await page.locator('[data-key="nav:5"]').click();
  await expect(page.locator(".zsa-ff-choices--compact .zsa-ff-choice")).toHaveText(flies.map((p, i) => "Mystery fly " + "ABC"[i] + ": " + en["phen." + p]));
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: every step fits 360x640 and 1366x768 with 44 px targets", async ({page}) => {
  const {problems} = await open(page);
  // Reach every step with content in it: solve the square so later steps render fully.
  await page.locator('[data-key="nav:2"]').click();
  await fill(page, square("Nn", "nn"));
  await page.getByRole("button", {name: en["square.check"]}).click();
  await page.getByRole("radio", {name: "2 of 4"}).check();
  await page.locator('[data-key="nav:3"]').click();
  await runSizes(page, "cross1", [8, 40, 200]);
  await page.locator('[data-key="nav:6"]').click();
  for (const q of ["q1", "q2", "q3", "q4"]) await page.locator(`input[data-key="${q}:a"]`).check();
  for (const vp of [{width: 360, height: 640}, {width: 1366, height: 768}]) {
    await page.setViewportSize(vp);
    for (let i = 0; i < 9; i++) {
      await page.locator(`[data-key="nav:${i}"]`).click();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), "step " + (i + 1) + " at " + vp.width).toBeLessThanOrEqual(0);
      const small = await page.evaluate(() => [...document.querySelectorAll("main button, main label.zsa-ff-choice, main a.zsa-back")]
        .filter(e => e.offsetParent && !e.closest("dialog") && !e.closest(".zsa-about"))
        .map(e => { const r = e.getBoundingClientRect(); return {key: e.getAttribute("data-key") || e.id || e.textContent.trim().slice(0, 30), w: r.width, h: r.height}; })
        .filter(b => b.w < 44 || b.h < 44));
      expect(small, "step " + (i + 1) + " at " + vp.width).toEqual([]);
    }
  }
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: axe finds no violations in any step, with results showing, at 360x640 and 1366x768", async ({page}) => {
  const {problems} = await open(page, "", {});
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.locator('[data-key="nav:2"]').click();
  await fill(page, square("Nn", "nn"));
  await page.keyboard.press("Escape");
  await page.locator('[data-key="slot:0:0:1"]').click(); // with no tile chosen this empties a box, so the check marks show
  await page.getByRole("button", {name: en["square.check"]}).click();
  await page.evaluate(AXE);
  const audit = async label => {
    const result = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
    return result.violations.map(v => label + ": " + v.id + " " + v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(", "));
  };
  let found = await audit("square with marks");
  await page.locator('[data-key="token:allele:n"]').click();
  await page.locator('[data-key="slot:0:0:1"]').click();
  await page.getByRole("button", {name: en["square.check"]}).click();
  await page.getByRole("radio", {name: "2 of 4"}).check();
  await page.locator('[data-key="nav:3"]').click();
  await runSizes(page, "cross1", [8, 40, 200]);
  await page.getByRole("radio", {name: en["reflect.option.closer"]}).check();
  await page.locator('[data-key="nav:5"]').click();
  await page.locator('[data-key="mrun"]').click();
  await page.locator('input[data-key^="verdict:"]').first().check();
  await page.locator('[data-key="nav:6"]').click();
  for (const q of ["q1", "q2", "q3"]) await page.locator(`input[data-key="${q}:a"]`).check();
  await page.locator('input[data-key="q4:b"]').check();
  found = found.concat(await audit("checks with feedback"));
  await page.locator('input[data-key="q4:a"]').check();
  await page.locator('[data-key="nav:7"]').click();
  for (const [which, gs] of [["top", ["NR", "Nr", "nR", "nr"]], ["side", ["NR", "Nr", "nR", "nr"]]]) for (let i = 0; i < 4; i++) {
    await pick(page, "gamete", gs[i]);
    await page.locator(`[data-key="head:${which}:${i}"]`).click();
  }
  await page.locator('[data-key="dcheck"]').click();
  await page.locator('input[data-key="dpred:9-3-3-1"]').check();
  await runSizes(page, "di", [16]);
  for (const vp of [{width: 360, height: 640}, {width: 1366, height: 768}]) {
    await page.setViewportSize(vp);
    for (let i = 0; i < 9; i++) {
      await page.locator(`[data-key="nav:${i}"]`).click();
      found = found.concat(await audit("step " + (i + 1) + " at " + vp.width));
    }
  }
  expect(found).toEqual([]);
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: reduced motion shows all flies at once; normal motion adds them over about a second", async ({browser}) => {
  for (const motion of ["reduce", "no-preference"]) {
    const context = await browser.newContext({reducedMotion: motion});
    const page = await context.newPage();
    const {problems} = await open(page);
    await page.locator('[data-key="nav:2"]').click();
    await fill(page, square("Nn", "nn"));
    await page.getByRole("button", {name: en["square.check"]}).click();
    await page.getByRole("radio", {name: "2 of 4"}).check();
    await page.locator('[data-key="nav:3"]').click();
    await runSizes(page, "cross1", [8, 40]);
    await page.locator('[data-key="run:cross1:200"]').click();
    const right = await page.locator(".zsa-ff-vial use").count();
    if (motion === "reduce") expect(right).toBe(200);
    else expect(right).toBeLessThan(200);
    await expect(page.locator(".zsa-ff-vial use")).toHaveCount(200);
    expect(problems).toEqual([]);
    await context.close();
  }
});

test("fruit-fly-genetics-lab: ?lang=es previews the unproofread Spanish without a toggle", async ({page}) => {
  const {problems} = await open(page, "&lang=es", {title: I18N.es["step.hook"]});
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle(I18N.es.title + " | ZornScience");
  await expect(page.locator("h1")).toHaveText(I18N.es.title);
  await expect(page.locator(".zsa-languages")).toHaveCount(0);
  await expect(page.locator("#zsa-ff-back")).toHaveAttribute("href", "https://zornscience.org/es/science/biology/");
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/fruit-fly-genetics-lab/");
  await page.locator('[data-key="nav:2"]').click();
  await fill(page, square("Nn", "nn"));
  await page.getByRole("button", {name: I18N.es["square.check"]}).click();
  await expect(live(page)).toHaveText(I18N.es["square.solved"]);
  for (let i = 0; i < 9; i++) {
    if (i === 7) continue;
    await page.locator(`[data-key="nav:${i}"]`).click();
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/\b(?:offspring|Parent|Raise|wings|eyes|Check my|Redo this step|Next:|Step \d)\b/);
    expect(text).not.toMatch(/[–—]/);
  }
  expect(problems).toEqual([]);
});

test("fruit-fly-genetics-lab: copy fallback, clean sharing and safe back links", async ({page}) => {
  const {problems} = await open(page, "", {noClipboard: true});
  await page.locator('[data-key="nav:8"]').click();
  await expect(page.locator(".zsa-ff-feedback--info")).toContainText("Not finished yet:");
  await page.getByRole("button", {name: en["copy.button"], exact: true}).click();
  await expect(live(page)).toHaveText(en["copy.fallback"]);
  await expect(page.locator("#zsa-ff-copy-text")).toBeFocused();
  expect(await page.evaluate(() => getSelection().toString())).toContain("Lab seed\t7");
  // Share: a clean address, without the seed.
  await page.getByRole("button", {name: "Share activity"}).click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/fruit-fly-genetics-lab/");
  await expect(page.locator("#zsa-th-share-email")).not.toHaveAttribute("href", /seed/);
  await page.keyboard.press("Escape");
  for (const value of ["https://evil.example/a", "http://zornscience.org/a", "https://zornscience.org.evil.example/a", "https://user@zornscience.org/a", "https://zornscience.org:444/a", "javascript:alert(1)"]) {
    await page.goto(URL + "&from=" + encodeURIComponent(value));
    await expect(page.locator("#zsa-ff-back")).toHaveAttribute("href", "https://zornscience.org/science/biology/");
  }
  await page.goto(URL + "&from=" + encodeURIComponent("https://zornscience.org/science/biology/unit-5/"));
  await expect(page.locator("#zsa-ff-back")).toHaveAttribute("href", "https://zornscience.org/science/biology/unit-5/");
  await page.goto(URL + "&embed=1");
  await expect(page.locator("#zsa-ff-back")).toBeHidden();
  await expect(page.locator("#zsa-ff-step-title")).toBeVisible();
  expect(problems).toEqual([]);
});
