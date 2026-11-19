"use strict";
const {test, expect} = require("./fixtures");

test("Beer-Lambert scoring needs distinct standards and accepts a concentration calculated from readings", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto("/beers-law-lab/");
  await page.getByRole("button", {name: "Insert blank and zero"}).click();
  await page.getByRole("button", {name: "Measure the unknown"}).click();
  const unknownAbsorbance = Number(await page.locator("#zsa-bl-a-value").textContent());
  const answer = page.getByLabel("Concentration of the unknown (M)");
  const feedback = page.locator("#zsa-bl-feedback");
  const count = page.locator("#zsa-bl-solved");
  const check = page.getByRole("button", {name: "Check my answer"});
  // Fixed draw: 0.35 × (0.15 + 0.70 × 0.5) = 0.175 M.
  await answer.fill("0.175");
  await check.click();
  await expect(feedback).toContainText("Measure at least two standards");
  await expect(count).toContainText("Unknowns found: 0.");

  async function measure(c) {
    await page.getByLabel("Standard concentration (M)").fill(String(c));
    await page.getByRole("button", {name: "Measure standard", exact: true}).click();
    return Number(await page.locator("#zsa-bl-a-value").textContent());
  }
  const low = await measure(0.05);
  await measure(0.05);
  await check.click();
  await expect(feedback).toContainText("Measure at least two standards");
  await expect(count).toContainText("Unknowns found: 0.");

  const high = await measure(0.25);
  const inferred = 0.05 + (unknownAbsorbance - low) * (0.25 - 0.05) / (high - low);
  await answer.fill(inferred.toFixed(3));
  await check.click();
  await expect(feedback).toContainText("Correct.");
  await expect(count).toContainText("Unknowns found: 1.");
});

test("osmosis descriptions teach no net water movement in both languages", async ({page, problems}) => {
  void problems;
  for (const [query, phrase] of [["", "no net movement of water"], ["?lang=es", "no hay movimiento neto de agua"]]) {
    await page.goto("/" + query);
    await expect(page.locator(".zsa-home-card").filter({has: page.locator('a[href^="osmosis-lab/"]')})).toContainText(phrase);
    await page.goto("/osmosis-lab/" + query);
    await expect(page.locator('[data-zsa-about="osmosis-lab"]')).toContainText(phrase);
  }
});

test("iodine clock identifies the inverse-time metric and distinguishes model concentrations from measurement precision", async ({page, problems}) => {
  void problems;
  for (const [query, metric, nominal] of [["", "relative clock rate", "nominal model values"], ["?lang=es", "velocidad relativa del reloj", "valores nominales del modelo"]]) {
    await page.goto("/iodine-clock-lab/" + query);
    await page.locator(".model-details summary").click();
    await expect(page.locator(".model-details")).toContainText(metric);
    await expect(page.locator(".model-details")).toContainText("s⁻¹");
    await expect(page.locator(".model-details")).toContainText(nominal);
    await page.getByRole("button", {name: "2.0 mL", exact: true}).click();
    await expect(page.locator("#conc-out")).toHaveText("0.0125 M");
    await page.getByRole("button", {name: "8.0 mL", exact: true}).click();
    await expect(page.locator("#conc-out")).toHaveText("0.0500 M");
  }
});

test("Beer-Lambert calibration prerequisite appears in Spanish on a phone", async ({page, problems}) => {
  void problems;
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/beers-law-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await page.getByRole("button", {name: "Colocar el blanco y ajustar a cero"}).click();
  await page.getByRole("button", {name: "Medir la muestra desconocida"}).click();
  await page.locator("#zsa-bl-answer").fill("0.175");
  await page.getByRole("button", {name: "Revisar mi respuesta"}).click();
  await expect(page.locator("#zsa-bl-feedback")).toContainText("Mide al menos dos estándares de concentraciones diferentes");
  await expect(page.locator("#zsa-bl-solved")).toContainText("Muestras desconocidas resueltas: 0.");
});
