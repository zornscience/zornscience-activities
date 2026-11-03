"use strict";
const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const modes = ["entropy", "ds", "dg", "control", "k", "coupled"];
test.use({ reducedMotion: "reduce" });
test("entropy predictions and temperature distribution", async ({ page }) => {
  await page.goto("/free-energy-lab/");
  await page.locator("#entropy-case").selectOption("combustion");
  await page.locator("#prediction").selectOption("-1");
  await page.locator("#check-entropy").click();
  await expect(page.locator("#entropy-feedback")).toContainText(
    "Correct. Matter becomes less dispersed",
  );
  await page.locator("#entropy-case").selectOption("argon");
  await expect(page.getByRole("img", { name: /Maxwell/ })).toBeVisible();
  await expect(page.locator("#data-table tbody tr")).toHaveCount(61);
});
test("coefficient-weighted entropy sums and unknown S", async ({ page }) => {
  await page.goto("/free-energy-lab/?mode=ds&rxn=ch4");
  await expect(page.locator("#data-table")).not.toContainText("−242.8");
  await page.locator("#sum-products").fill("354");
  await page.locator("#check-products").click();
  await expect(page.locator("#feedback-products")).toContainText("Try again.");
  await page.locator("#sum-products").fill("213.7 + 2 × 69.9");
  await page.locator("#check-products").click();
  await page.locator("#sum-reactants").fill("186.3 + 2*205.0");
  await page.locator("#check-reactants").click();
  await expect(page.locator("#panel-ds")).toContainText("−242.8");
  await expect(page.locator("#data-table")).toContainText("−242.8");
  await page.locator("#ds-rxn").selectOption("no2");
  await expect(page.locator("#data-table")).not.toContainText("240.1");
  await page.locator("#unknown-s").fill("240.1");
  await page.locator("#check-unknown").click();
  await expect(page.locator("#unknown-feedback")).toContainText("Correct.");
});
test("Gibbs conversion misconception, sign grid, temperature, formation, courses", async ({
  page,
}) => {
  await page.goto("/free-energy-lab/?mode=dg&rxn=haber");
  await page.locator("#dg-answer").fill("5.9 × 10⁴");
  await page.locator("#check-dg").click();
  await expect(page.locator("#dg-feedback")).toContainText("Forgot to convert");
  await page.locator("#dg-answer").fill("-33.0");
  await page.locator("#check-dg").click();
  await expect(page.locator("#dg-feedback")).toHaveText("Correct answer.");
  await page.locator("#dg-rxn").selectOption("n2o4");
  await page.locator("#dg-answer").fill("−4.8");
  await page.locator("#check-dg").click();
  await expect(page.locator("#dg-feedback")).toHaveText("Correct answer.");
  await page.locator("#dg-rxn").selectOption("haber");
  await page.locator("#sign-low").click();
  await expect(page.locator("#grid-feedback")).toHaveText("Correct pattern.");
  await page.locator("#temperature-number").fill("600");
  await page.locator("#temperature-number").press("Tab");
  await expect(page.locator("#live")).toContainText("600");
  await expect(page.locator("#panel-dg")).toContainText(
    "not thermodynamically favored",
  );
  await page.locator("#formation-answer").fill("-141.8");
  await page.locator("#check-formation").click();
  await expect(page.locator("#formation-feedback")).toContainText("Correct.");
  await page.goto("/free-energy-lab/?mode=dg&rxn=caco3&course=chem");
  await expect(page.locator("#panel-dg")).toContainText("130");
  await expect(page.locator("#panel-dg")).toContainText("not spontaneous");
});
test("kinetic control interventions and light", async ({ page }) => {
  await page.goto("/free-energy-lab/?mode=control&case=sucrose");
  await page.locator("#control-prediction").selectOption("kinetic");
  await page.locator("#check-control").click();
  await expect(page.locator("#control-feedback")).toHaveText(
    "Correct classification.",
  );
  await page.locator("#catalyst").click();
  await expect(page.locator("#rate-meter")).toHaveJSProperty("value", 0.85);
  await expect(page.locator("#panel-control")).toContainText("−5796");
  await page.locator("#control-case").selectOption("hcl");
  await page.locator("#light").click();
  await expect(page.locator("#rate-meter")).toHaveJSProperty("value", 0.85);
  await page.locator("#control-case").selectOption("unfavored");
  await page.locator("#heat").click();
  await page.locator("#control-prediction").selectOption("unfavored");
  await page.locator("#check-control").click();
  await expect(page.locator("#control-feedback")).toHaveText(
    "Correct classification.",
  );
});
test("K both ways and salt and coupling cases", async ({ page }) => {
  await page.goto("/free-energy-lab/?mode=k&case=haber");
  await expect(page.locator("#panel-k")).toContainText("5.8 × 10⁵");
  await page.locator("#k-answer").fill("5.8 × 10⁵");
  await page.locator("#check-k").click();
  await expect(page.locator("#k-feedback")).toHaveText("Correct answer.");
  await page.locator("#k-case").selectOption("acetic");
  await expect(page.locator("#panel-k")).toContainText("27");
  await page.goto("/free-energy-lab/?mode=coupled&case=nh4no3");
  await page.locator("#driving").selectOption("entropy");
  await page.locator("#check-driving").click();
  await expect(page.locator("#driving-feedback")).toHaveText(
    "Correct classification.",
  );
  await page.locator("#coupled-case").selectOption("iron");
  await page.locator("#coupling-partner").selectOption("add");
  await page.locator("#coupling-answer").fill("-58.8");
  await page.locator("#check-coupling").click();
  await expect(page.locator("#coupling-feedback")).toContainText("Correct.");
  await expect(page.locator("#panel-coupled")).toContainText(
    "2Fe₂O₃(s) + 6CO(g) → 4Fe(s) + 6CO₂(g)",
  );
  await expect(page.locator("#data-table")).toContainText("O₂(g)");
});
test("keyboard, safe URLs, language reset, dialogs, embed, exports and no outside requests", async ({
  page,
}) => {
  const outside = [],
    errors = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:4173/")) outside.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    "/free-energy-lab/?mode=ds&rxn=ch4&course=chem&from=https%3A%2F%2Fzornscience.org.evil.test%2F",
  );
  await expect(page.locator("#back")).toHaveAttribute(
    "href",
    "https://zornscience.org/science/chemistry/",
  );
  await page.locator("#tab-ds").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-dg")).toBeFocused();
  await page
    .getByRole("button", { name: "Share activity", exact: true })
    .click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue(
    "https://activities.zornscience.org/free-energy-lab/",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "ES Español" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.locator(".zsa-fe-note")).toContainText(
    "Predice. Calcula. Explica.",
  );
  await expect(page.locator("#zsa-header-instructions")).toContainText(
    "Relaciona la dispersión",
  );
  await expect(page.locator("#zsa-header-share")).toContainText(
    "Comparte la actividad desde cero.",
  );
  expect(page.url()).toContain("rxn=ch4");
  await expect(page.locator("#sum-products")).toHaveValue("");
  await expect(page.locator("h1")).toHaveText(
    "Laboratorio virtual de entropía y energía libre",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.locator("#copy-data").click();
  await expect(page.locator("#copy-fallback")).toBeFocused();
  const dl = page.waitForEvent("download");
  await page.locator("#download-data").click();
  expect(fs.readFileSync(await (await dl).path(), "utf8")).toContain("Especie");
  await page.goto("/free-energy-lab/?embed=1&lang=es&mode=k");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  expect(outside).toEqual([]);
  expect(errors).toEqual([]);
});
for (const lang of ["en", "es"])
  for (const mode of modes)
    test(`${mode} ${lang}: accessible at 360 px, local assets, screenshot`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto("/free-energy-lab/?mode=" + mode + "&lang=" + lang);
      await page.addScriptTag({ url: "/node_modules/axe-core/axe.min.js" });
      const axe = await page.evaluate(async () => {
        return (
          await axe.run(document.querySelector("main"), {
            rules: { "color-contrast": { enabled: true } },
          })
        ).violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        }));
      });
      expect(axe).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.screenshot({
        path: "free-energy-lab/screenshots/" + mode + "-" + lang + ".png",
        fullPage: true,
      });
    });
test("invalid parameters, custom values, formation preset, and offline interaction", async ({
  page,
  context,
}) => {
  await page.goto("/free-energy-lab/?mode=bad&rxn=bad&lang=bad");
  await expect(page.locator("#tab-entropy")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.goto("/free-energy-lab/?mode=dg&dh=20&ds=100&t=400");
  await expect(page.locator("#dh")).toHaveValue("20");
  await expect(page.locator("#ds")).toHaveValue("100");
  await expect(page.locator("#temperature-number")).toHaveValue("400");
  await page.goto("/free-energy-lab/?mode=dg&rxn=so3");
  await expect(page.locator("#formation-answer")).toBeVisible();
  await expect(page.locator("#temperature")).toHaveCount(0);
  await page.locator("#dg-rxn").selectOption("haber");
  await context.setOffline(true);
  for (const mode of modes) {
    await page.locator("#tab-" + mode).click();
    await expect(page.locator("#panel-" + mode)).toBeVisible();
  }
  await context.setOffline(false);
});

test("mercury coupling keeps the lesson precision in both languages", async ({
  page,
}) => {
  for (const lang of ["en", "es"]) {
    await page.goto("/free-energy-lab/?mode=coupled&case=mercury&lang=" + lang);
    await page.locator("#coupling-partner").selectOption("add");
    await page.locator("#coupling-answer").fill("−249.6");
    await page.locator("#check-coupling").click();
    await expect(page.locator("#panel-coupled")).toContainText("−249.6");
    await expect(page.locator("#panel-coupled")).toContainText(
      "HgS(s) + O₂(g) → Hg(l) + SO₂(g)",
    );
    await expect(page.locator("#coupling-feedback")).toContainText(
      lang === "es" ? "Correcto." : "Correct.",
    );
  }
});
