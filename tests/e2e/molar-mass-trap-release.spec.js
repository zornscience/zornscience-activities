"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";
const station = (page, key) => page.locator(`[data-station="${key}"]`);
const waxRow = (page, code) => page.locator(`#liquid-${code}`).locator("..");
const shotRow = (page, code) => page.locator(`[data-shot-card="${code}"]`);
const mixRow = (page, number) => page.locator(`[data-mix-entry="${number}"]`);
const slot = (page, number) => page.locator(`[data-mix-tube="${number}"]`);
const wax = {W: [10, "tall"], G: [12, "tall"], O: [20, "flat"], M: [22, "flat"]};
const shotMs = {W: 270, G: 6400, O: 980, M: 2250};
const mixes = {
  1: {pair: [["W", 1], ["G", 1]], layers: "1", dye: "An even blue tint."},
  2: {pair: [["M", 1], ["W", 1]], layers: "2", dye: "Red above blue."},
  3: {pair: [["W", 1], ["O", 0.5]], layers: "2", dye: "Azul abajo y una franja transparente arriba."},
  4: {pair: [["O", 0.5], ["M", 1]], layers: "1", dye: "An even red tint."},
  5: {pair: [["M", 1], ["G", 1]], layers: "2", dye: "Red above clear liquid."}
};

async function openLab(page, query = "") {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.clock.install();
  await page.goto(LAB + query);
}

async function measureWax(page, code) {
  const [diameter, profile] = wax[code];
  await page.locator(`[data-bottle="${code}"]`).click();
  for (let drop = 0; drop < 3; drop++) {
    await page.locator("#dispense").click();
    await page.clock.fastForward(280);
  }
  await page.locator("#advance").click();
  const ruler = page.locator("#ruler-position");
  await ruler.focus();
  const steps = (Number(await ruler.inputValue()) + diameter / 2) / -0.5;
  for (let i = 0; i < steps; i++) await page.keyboard.press("ArrowRight");
  await page.locator("#read-edges").click();
  await expect(page.locator("#edge-reading")).toHaveText(new RegExp(`0 mm.*${diameter} mm`));
  const row = waxRow(page, code);
  await row.getByRole("textbox").fill(String(diameter));
  await row.getByRole("combobox").selectOption(profile);
}

async function timeShot(page, code) {
  await page.locator(`[data-shot-tube="${code}"]`).click();
  const operate = page.locator("#shot-operate");
  if (code !== "W") await page.locator("#shot-mode-event").click();
  await operate.click();
  await page.clock.fastForward(750);
  await operate.click();
  await page.clock.fastForward(shotMs[code] + 570);
  await page.locator(code === "W" ? "#shot-record-below" : "#shot-record").click();

  await operate.click();
  await page.clock.fastForward(720);
  if (code === "W") await page.locator("#shot-mode-event").click();
  await operate.click();
  await page.clock.fastForward(shotMs[code] + 250);
  await expect(page.locator("#shot-time")).toHaveText(code === "W" ? "<0.5 s" : (shotMs[code] / 1000).toFixed(2) + " s");
  await page.locator("#shot-record").click();
}

async function prepareMixture(page, number) {
  await slot(page, number).click();
  const action = page.locator("#mix-action");
  for (const [code, ml] of mixes[number].pair) {
    await page.locator("#mix-liquid").selectOption(code);
    await page.locator("#mix-amount").selectOption(String(ml));
    await action.click();
    await page.clock.fastForward(455);
  }
  await action.click();
  for (let turn = 0; turn < 5; turn++) {
    await action.click();
    await page.clock.fastForward(755);
  }
  await page.locator("#mix-stand").click();
  await page.clock.fastForward(310);
}

async function recordMixture(page, number, layers = mixes[number].layers) {
  await slot(page, number).click();
  const advance = page.locator("#mix-advance");
  if (await advance.isVisible()) await advance.click();
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
  await page.locator("#mix-read").click();
  await expect(page.locator("#mix-observation")).not.toHaveText("");
  await mixRow(page, number).getByRole("combobox").selectOption(layers);
  await mixRow(page, number).getByRole("textbox").fill(mixes[number].dye);
}

const orders = [
  ["wax", "shot", "mixing"], ["wax", "mixing", "shot"], ["shot", "wax", "mixing"],
  ["shot", "mixing", "wax"], ["mixing", "wax", "shot"], ["mixing", "shot", "wax"]
];

for (const order of orders) {
  test(`classroom station order ${order.join(", ")} retains evidence from each test`, async ({page}) => {
    await openLab(page);
    for (const key of order) {
      await station(page, key).click();
      if (key === "wax") await measureWax(page, "W");
      else if (key === "shot") await timeShot(page, "W");
      else {
        await prepareMixture(page, 3);
        await recordMixture(page, 3);
      }
    }
    await expect(waxRow(page, "W").getByRole("textbox")).toHaveValue("10");
    await station(page, "mixing").click();
    await expect(mixRow(page, 3).getByRole("combobox")).toHaveValue("2");
    await expect(mixRow(page, 3).getByRole("textbox")).toHaveValue(mixes[3].dye);
    await station(page, "shot").click();
    await expect(shotRow(page, "W").getByRole("textbox").nth(0)).toHaveValue("<0.5");
    await expect(shotRow(page, "W").getByRole("textbox").nth(1)).toHaveValue("<0.5");
  });
}

test("the entire interleaved classroom walkthrough prints and reopens with browser storage disabled", async ({page}, testInfo) => {
  await page.setViewportSize({width: 360, height: 740});
  await page.addInitScript(() => {
    for (const name of ["localStorage", "sessionStorage", "indexedDB"]) {
      Object.defineProperty(window, name, {get() { throw new DOMException("Storage disabled", "SecurityError"); }});
    }
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openLab(page, "?lang=es");
  await page.locator("#predictions summary").click();
  await page.locator("#predict-spread").selectOption("W");
  await page.locator("#predict-slowest").selectOption("G");
  await page.locator("#predict-mix-3").selectOption("1");
  await page.locator("#predictions summary").click();

  await station(page, "mixing").click();
  await prepareMixture(page, 3);
  await station(page, "wax").click();
  await measureWax(page, "W");
  await page.clock.fastForward(60000);
  await station(page, "mixing").click();
  await expect(page.locator("#mix-elapsed")).toHaveText("60 / 60 s");
  await recordMixture(page, 3, "1");
  await expect(page.locator("#mix-observation")).toHaveText("Una franja transparente más delgada sobre una franja azul.");
  await expect(mixRow(page, 3).getByRole("status")).toHaveText("Coincide con tu predicción");

  await station(page, "shot").click();
  await timeShot(page, "W");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  for (const code of ["M", "O", "G"]) await timeShot(page, code);
  await page.locator("#shot-check-averages").click();
  const means = ["<0.5 s", "6.40 s", "0.98 s", "2.25 s"].map((value) => "Lab's average: " + value);
  await expect(page.locator("#shot-entries .zsa-mmt-shot-result")).toHaveText(means);
  await station(page, "wax").click();
  for (const code of ["G", "M", "O"]) await measureWax(page, code);
  await station(page, "mixing").click();
  for (const number of [5, 1, 4, 2]) {
    await prepareMixture(page, number);
    await recordMixture(page, number);
    await page.locator("#mix-empty").click();
  }
  await slot(page, 3).click();
  await expect(mixRow(page, 3).getByRole("combobox")).toHaveValue("1");
  await mixRow(page, 3).getByRole("combobox").selectOption("2");
  await expect(mixRow(page, 3).getByRole("status")).toHaveText("Prediction differed");
  await page.locator("#mix-empty").click();
  await expect(page.locator("#mix-volume")).toHaveText("0.0 mL total");

  const revisit = "I expected one layer in tube 3. A clear band stayed above the blue water.";
  const first = "Water formed a tall bead that measured 10 mm across on wax paper.";
  const second = "Water was too fast to time manually. The glycerin fall took 6.40 s.";
  const explanation = "Spreading on wax depends on cohesion and adhesion. In the sealed tube, the falling shot compares resistance to flow, with density and drag also affecting its speed.";
  await page.getByRole("link", {name: "Go to debrief"}).click();
  await page.locator("#debrief-revisit").fill(revisit);
  await page.locator("#debrief-test-1").selectOption("wax");
  await page.locator("#debrief-test-2").selectOption("wax");
  await page.locator("#debrief-evidence-1").fill(first);
  await page.locator("#debrief-evidence-2").fill(second);
  await page.locator("#debrief-explanation").fill(explanation);
  await page.locator("#check-debrief").click();
  await expect(page.locator("#debrief-status")).toHaveText(/Choose two different tests/);
  await page.locator("#debrief-test-2").selectOption("shot");
  await page.locator("#check-debrief").click();
  await expect(page.locator("#debrief-status")).toHaveText(/You cited two different tests/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

  await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printRequested = "true"; }; });
  await page.locator("#print-notebook").click();
  await expect(page.locator("html")).toHaveAttribute("data-print-requested", "true");
  await page.emulateMedia({media: "print"});
  for (const [code, [diameter, profile]] of Object.entries(wax)) {
    await expect(waxRow(page, code).getByText(String(diameter), {exact: true})).toBeVisible();
    await expect(waxRow(page, code).getByText(profile === "tall" ? "Tall bead" : "Flat puddle", {exact: true}).last()).toBeVisible();
    const values = shotRow(page, code).locator("td .zsa-mmt-print-only");
    const time = (shotMs[code] / 1000).toFixed(2);
    await expect(values.nth(0)).toHaveText(code === "W" ? "<0.5" : time);
    await expect(values.nth(1)).toHaveText(code === "W" ? "<0.5" : time);
  }
  await expect(page.locator("#shot-entries .zsa-mmt-shot-result")).toHaveText(means);
  for (const [number, {layers, dye}] of Object.entries(mixes)) {
    await expect(mixRow(page, number).getByText(layers === "1" ? "One layer" : "Two layers", {exact: true}).last()).toBeVisible();
    await expect(mixRow(page, number).getByText(dye, {exact: true})).toBeVisible();
  }
  await expect(page.getByRole("columnheader", {name: "Prediction correct?"})).toBeVisible();
  await expect(mixRow(page, 3).getByRole("cell", {name: "No", exact: true})).toBeVisible();
  await expect(page.locator("#print-prediction-entries")).toContainText("W Water");
  for (const [id, value] of Object.entries({revisit, "evidence-1": first, "evidence-2": second, explanation})) {
    await expect(page.locator(`#debrief-${id}-print`)).toHaveText(value);
    await expect(page.locator(`#debrief-${id}-print`)).toBeVisible();
  }
  await page.pdf({path: testInfo.outputPath("classroom-notebook.pdf"), format: "Letter",
    margin: {top: "0.35in", bottom: "0.35in", left: "0.35in", right: "0.35in"}});

  await page.emulateMedia({media: "screen"});
  await page.locator("#open-notebook-open").click();
  await page.locator("#notebook-file").setInputFiles({name: "other.json", mimeType: "application/json", buffer: Buffer.from("{}")});
  await page.locator("#open-notebook-confirm").click();
  await expect(page.locator("#open-notebook-status")).toHaveText("Choose a notebook file saved by this lab.");
  await page.keyboard.press("Escape");
  await expect(page.locator("#debrief-explanation")).toHaveValue(explanation);
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#save-notebook").click()]);
  // The local date and time keep files apart on a shared laptop.
  expect(download.suggestedFilename()).toMatch(/^molar-mass-trap-notebook-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
  const saved = testInfo.outputPath("classroom-notebook.json");
  await download.saveAs(saved);
  await page.reload();
  await expect(waxRow(page, "W").getByRole("textbox")).toHaveValue("");
  await page.locator("#open-notebook-open").click();
  await page.locator("#notebook-file").setInputFiles(saved);
  await page.locator("#open-notebook-confirm").click();
  await expect(page.locator("#notebook-file-status")).toHaveText("Notebook entries reopened.");
  await expect(page.locator("#debrief-explanation")).toHaveValue(explanation);
  await station(page, "mixing").click();
  await expect(mixRow(page, 3).getByRole("textbox")).toHaveValue(mixes[3].dye);
  await expect(mixRow(page, 3).getByRole("status")).toHaveText("Prediction differed");
  await station(page, "shot").click();
  await expect(page.locator("#shot-entries .zsa-mmt-shot-result")).toHaveText(means);
  await expect(shotRow(page, "G").getByRole("textbox").nth(1)).toHaveAccessibleDescription("Instrument-timed");
  await page.locator("#restart-open").click();
  await page.locator("#restart-confirm").click();
  await expect(waxRow(page, "W").getByRole("textbox")).toHaveValue("");
  await expect(page.locator("#debrief-explanation")).toHaveValue("");
  expect(errors).toEqual([]);
});

test("Spanish predictions, debrief and notebook dialog fit and pass axe at phone width", async ({page}) => {
  await page.setViewportSize({width: 360, height: 740});
  await openLab(page, "?lang=es");
  await page.locator("#predictions summary").click();
  await expect(page.getByLabel("¿Qué líquido se extenderá más sobre el papel encerado?")).toBeVisible();
  await expect(page.getByRole("heading", {name: "Reflexión final"})).toBeVisible();
  const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.evaluate(axe);
  async function audit() {
    const violations = await page.evaluate(async () => (await window.axe.run({runOnly: {type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}})).violations.map((v) => [v.id, v.nodes.map((n) => n.target)]));
    expect(violations).toEqual([]);
  }
  await audit();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.locator("#open-notebook-open").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", {name: "Abrir un cuaderno guardado"})).toBeVisible();
  await audit();
  await page.keyboard.press("Escape");
  await expect(page.locator("#open-notebook-open")).toBeFocused();
});

test("the chemistry directory opens the lab with the matching language and canonical URL", async ({page}) => {
  for (const [query, lang, title] of [["", "en", "The Molar Mass Trap Lab"], ["?lang=es", "es-MX", "Laboratorio virtual de la trampa de la masa molar"]]) {
    await page.goto("/" + query);
    await page.locator("#labs").getByRole("link", {name: title, exact: true}).click();
    await expect(page).toHaveURL(LAB + query);
    await expect(page.getByRole("heading", {level: 1})).toHaveText(title);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://activities.zornscience.org" + LAB + query);
    await expect(page.locator('link[hreflang="es"]')).toHaveAttribute("href", "https://activities.zornscience.org" + LAB + "?lang=es");
  }
});

test("leaving the page asks first only while notebook entries are unsaved", async ({page}) => {
  const prompts = [];
  page.on("dialog", async (dialog) => {
    prompts.push(dialog.type());
    await dialog.dismiss();
  });
  // A dismissed prompt cancels the reload, so allow a short timeout in that case.
  const reload = () => page.reload({timeout: 2000}).catch(() => {});
  const diameter = () => waxRow(page, "W").getByRole("textbox");

  await page.goto(LAB);
  await station(page, "shot").click();
  await reload();
  expect(prompts).toEqual([]);

  // Browsers only ask after a real user gesture, so type the entry.
  await diameter().click();
  await page.keyboard.type("10");
  await reload();
  expect(prompts).toEqual(["beforeunload"]);
  await expect(diameter()).toHaveValue("10");

  await Promise.all([page.waitForEvent("download"), page.locator("#save-notebook").click()]);
  await reload();
  expect(prompts).toEqual(["beforeunload"]);
  await expect(diameter()).toHaveValue("");

  await diameter().click();
  await page.keyboard.type("12");
  await page.locator("#restart-open").click();
  await page.locator("#restart-confirm").click();
  await reload();
  expect(prompts).toEqual(["beforeunload"]);
});
