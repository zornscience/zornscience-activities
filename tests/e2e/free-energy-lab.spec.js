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
  await expect(page.locator("#panel-dg")).not.toContainText(
    "not thermodynamically favored",
  );
  await page.locator("#dg-answer").fill("26.9");
  await page.locator("#check-dg").click();
  await expect(page.locator("#panel-dg")).toContainText(
    "not thermodynamically favored",
  );
  await page.locator("#formation-answer").fill("-141.8");
  await page.locator("#check-formation").click();
  await expect(page.locator("#formation-feedback")).toContainText("Correct.");
  await page.goto("/free-energy-lab/?mode=dg&rxn=caco3&course=chem");
  await expect(page.locator("#panel-dg")).not.toContainText("not spontaneous");
  await page.locator("#dg-answer").fill("130");
  await page.locator("#check-dg").click();
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
  await expect(page.locator("#panel-k")).not.toContainText("5.8 × 10⁵");
  await page.locator("#k-answer").fill("5.8 × 10⁵");
  await page.locator("#check-k").click();
  await expect(page.locator("#k-feedback")).toHaveText("Correct answer.");
  await page.locator("#k-case").selectOption("acetic");
  await expect(page.locator("#panel-k")).not.toContainText("27");
  await page.locator("#k-answer").fill("27");
  await page.locator("#check-k").click();
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
  baseURL,
}) => {
  const outside = [],
    errors = [];
  page.on("request", (r) => {
    if (!r.url().startsWith(new URL(baseURL).origin + "/")) outside.push(r.url());
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
    }, testInfo) => {
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
        path: testInfo.outputPath(mode + "-" + lang + ".png"),
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

// Read the lesson links from the README so every documented preset stays covered.
const lessonPresets = [
  ...fs
    .readFileSync("free-energy-lab/README.md", "utf8")
    .split("## Lesson presets")[1]
    .split("Additional examples:")[0]
    .matchAll(/\| ([^|]+) \| `(\?[^`]+)` \|/g),
].map((match) => ({ lesson: match[1].trim(), query: match[2] }));
expect(lessonPresets).toHaveLength(8);
for (const lang of ["en", "es"]) {
  for (const { lesson, query } of lessonPresets) {
    test(`${lesson} ${lang}: commit before answers, no console errors`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto("/free-energy-lab/" + query + "&lang=" + lang);
      const mode = new URLSearchParams(query).get("mode");
      const panel = page.locator("#panel-" + mode);
      const table = page.locator("#data-table");
      await expect(panel).toBeVisible();
      await expect(panel.locator(".zsa-fe-readout")).toHaveText(
        await panel
          .locator(".zsa-fe-readout")
          .evaluateAll((nodes) => nodes.map(() => "")),
      );
      const initialText = (await panel.locator("p").allTextContents()).join(
        "\n",
      );
      expect(initialText).not.toMatch(
        /^(?:not )?(?:thermodynamically favored|spontaneous)$|^(?:termodinámicamente (?:no )?favorecida|(?:no )?espontánea)$|K = exp|Chain K =|K de la secuencia =|T = ΔH|TΔS°? =/m,
      );
      await expect(panel.locator('[id^="show-"]:visible')).toHaveCount(0);
      await expect(table).not.toContainText(
        /Exponent|Exponente|log₁₀ K|Chain|Secuencia/,
      );
      await expect(page.locator("#live")).not.toContainText(
        /ΔG|K =|favored|favorecida|spontaneous|espontánea/,
      );
      if (mode === "dg") {
        await expect(table.locator("thead th")).toHaveText([
          lang === "es" ? "Temperatura (K)" : "Temperature (K)",
        ]);
        await expect(panel).not.toContainText(
          /Crossover temperature|Temperatura de cruce|−33\.0|130\./,
        );
        await page
          .locator("#dg-answer")
          .fill(lesson.startsWith("Chemistry") ? "130" : "−33.0");
        await page.locator("#check-dg").click();
        await expect(table.locator("thead th")).toHaveCount(2);
        await expect(panel).toContainText(
          lang === "es" ? "Temperatura de cruce" : "Crossover temperature",
        );
        await expect(panel).not.toContainText("−141.8");
      } else if (mode === "k") {
        await expect(table.locator("tbody tr")).toHaveCount(2);
        await expect(panel.locator("svg circle")).toHaveCount(0);
        await expect(panel).not.toContainText("5.8 × 10⁵");
        await page.locator("#k-answer").fill("5.8 × 10⁵");
        await page.locator("#check-k").click();
        await expect(panel.locator("svg circle")).toHaveCount(1);
        await expect(table).not.toContainText(/Chain|Secuencia/);
        await page.locator("#chain-dg-answer").fill("−33.0");
        await page.locator("#chain-k-answer").fill("6.0 × 10⁵");
        await page.locator("#check-chain").click();
        await expect(page.locator("#chain-feedback")).toHaveText(
          lang === "es" ? "Respuesta correcta." : "Correct answer.",
        );
        await expect(panel).toContainText(
          lang === "es" ? "por el redondeo" : "because of rounding",
        );
        const dimensionless = await table
          .locator("tbody tr")
          .evaluateAll((rows) =>
            rows
              .filter((r) =>
                /^(?:K|Exponent|Exponente|log₁₀ K|Chain K|K de la secuencia)$/.test(
                  r.cells[0].textContent,
                ),
              )
              .map((r) => r.cells[2].textContent),
          );
        expect(dimensionless.length).toBeGreaterThan(0);
        expect(dimensionless.every((unit) => unit === "")).toBe(true);
      } else if (mode === "control") {
        await expect(panel).not.toContainText(
          /No observable reaction on this timescale|No hay reacción observable/,
        );
        await expect(table.locator("tbody tr")).toHaveCount(2);
        await page.locator("#control-prediction").selectOption("kinetic");
        await page.locator("#check-control").click();
        await expect(panel).toContainText(
          lang === "es"
            ? "No hay reacción observable"
            : "No observable reaction on this timescale",
        );
      } else if (mode === "coupled" && query.includes("nh4no3")) {
        await expect(table.locator("tbody tr")).toHaveCount(2);
        await expect(table).toContainText("28.1");
        await expect(table).toContainText("108.7");
        await expect(panel).not.toContainText(/−4\.3|TΔS°? =/);
        await page.locator("#driving").selectOption("entropy");
        await page.locator("#check-driving").click();
        await expect(table).toContainText("−4.3");
        await expect(panel).toContainText("TΔS° = 32.4");
      } else if (mode === "coupled") {
        await expect(table.locator("tbody tr")).toHaveText([
          (lang === "es" ? "Reacción no favorecida" : "Unfavored reaction") +
            "+1484.4",
          (lang === "es"
            ? "Reacción favorecida para acoplar"
            : "Favored partner") + "−1543.2",
        ]);
        await expect(panel).not.toContainText("−58.8");
      } else if (mode === "ds") {
        await expect(table).not.toContainText("−242.8");
        await expect(panel).not.toContainText("−242.8");
      }
      expect(await page.locator("main").innerText()).not.toContain("\u2014");
      expect(errors).toEqual([]);
    });
  }
}

test("wrong checks enable solution help, changed data hide answers, checks stay independent", async ({
  page,
}) => {
  await page.goto("/free-energy-lab/?mode=dg&rxn=haber");
  await page.locator("#check-dg").click();
  await expect(page.locator("#show-dg")).toBeHidden();
  await page.locator("#dg-answer").fill("0");
  await page.locator("#check-dg").click();
  await expect(page.locator("#show-dg")).toBeVisible();
  await expect(page.locator("#panel-dg")).not.toContainText("−33.0");
  await expect(page.locator("#data-table thead th")).toHaveCount(1);
  await page.locator("#show-dg").click();
  await expect(page.locator("#panel-dg")).toContainText("−33.0");
  await expect(page.locator("#panel-dg")).not.toContainText("−141.8");
  await expect(page.locator("#panel-dg svg tspan")).toHaveText(["rxn"]);
  await expect(page.locator('label[for="dh"] sub')).toHaveText("rxn");
  await page.locator("#temperature-number").fill("320");
  await page.locator("#temperature-number").press("Tab");
  await expect(page.locator("#show-dg")).toBeHidden();
  await expect(page.locator("#data-table thead th")).toHaveCount(1);
  await expect(page.locator("#data-table")).toContainText("320");
  await expect(page.locator("#live")).not.toContainText("ΔG");
  await page.locator("#check-formation").click();
  await expect(page.locator("#formation-feedback")).not.toContainText("−141.8");
  await page.locator("#formation-answer").fill("−141.8");
  await page.locator("#check-formation").click();
  await expect(page.locator("#formation-feedback")).toContainText("−141.8");
  await expect(page.locator("#data-table thead th")).toHaveCount(1);

  await page.goto("/free-energy-lab/?mode=k&case=haber");
  await page.locator("#k-answer").fill("1");
  await page.locator("#check-k").click();
  await expect(page.locator("#show-k")).toBeVisible();
  await expect(page.locator("#panel-k svg circle")).toHaveCount(0);
  await page.locator("#show-k").click();
  await expect(page.locator("#panel-k svg circle")).toHaveCount(1);
  await expect(page.locator("#data-table")).not.toContainText("Chain");
  await page.locator("#chain-dg-answer").fill("0");
  await page.locator("#chain-k-answer").fill("1");
  await page.locator("#check-chain").click();
  await expect(page.locator("#show-chain")).toBeVisible();
  await expect(page.locator("#data-table")).not.toContainText("Chain");
  await page.locator("#show-chain").click();
  await expect(page.locator("#data-table")).toContainText("Chain");
  await page.locator("#k-case").selectOption("acetic");
  await expect(page.locator("#data-table tbody tr")).toHaveCount(2);
  await expect(page.locator("#data-table")).not.toContainText("27");
  await expect(page.locator("#k-slider")).toBeHidden();
  await page.locator("#k-answer").fill("27");
  await page.locator("#check-k").click();
  await expect(page.locator("#data-table")).toContainText("27");
});

test("reference precision, lesson precision and displayed exports", async ({
  page,
}) => {
  for (const [id, values] of [
    ["iron", ["+1484.4", "−1543.2"]],
    ["mercury", ["+50.6", "−300.2"]],
  ]) {
    await page.goto("/free-energy-lab/?mode=coupled&case=" + id);
    for (const value of values)
      await expect(page.locator("#data-table")).toContainText(value);
  }
  await page.goto("/free-energy-lab/?mode=control&case=sucrose");
  await expect(page.locator("#data-table")).toContainText("320");
  await expect(page.locator("#data-table")).not.toContainText("320.0");
  await page.goto("/free-energy-lab/?mode=dg&dh=0.9&ds=7.2&t=298");
  await page.locator("#dg-answer").fill("0");
  await page.locator("#check-dg").click();
  await page.locator("#show-dg").click();
  await expect(page.locator("main")).not.toContainText(/0\.9000|7\.200|298\.0/);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.locator("#copy-data").click();
  const copied = await page.locator("#copy-fallback").inputValue();
  const displayed = await page
    .locator("#data-table tr")
    .evaluateAll((rows) =>
      rows
        .map((row) => [...row.cells].map((cell) => cell.textContent).join("\t"))
        .join("\n"),
    );
  expect(copied).toBe(displayed);
});
// Lab bench (1.1.0). These tests set reduced motion with page.emulateMedia; test.use({reducedMotion}) is not a
// Playwright test option and has no effect.
test("phase chamber shows solid, liquid and gas with temperature", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/free-energy-lab/");
  const slider = page.locator("#phase-temperature"),
    state = page.locator("#phase-state"),
    chamber = page.locator("#phase-chamber"),
    meter = page.locator("#phase-entropy");
  await expect(page.getByRole("slider", { name: "Chamber temperature (K)" })).toHaveValue("298");
  await expect(state).toHaveText("298 K. Liquid: molecules slide past their neighbors.");
  await expect(page.locator("#phase-motion")).toBeHidden();
  const levels = [];
  for (const [value, words, label] of [
    ["200", "200 K. Solid: molecules vibrate in a fixed lattice.", "200 K, solid"],
    ["273", "273 K. 273 K: solid and liquid together while the ice melts.", "273 K, melting"],
    ["330", "330 K. Liquid: molecules slide past their neighbors.", "330 K, liquid"],
    ["373", "373 K. 373 K: liquid and gas together while the water boils.", "373 K, boiling"],
    ["450", "450 K. Gas: molecules spread through the whole chamber.", "450 K, gas"],
  ]) {
    await slider.fill(value);
    await expect(state).toHaveText(words);
    await expect(slider).toHaveAttribute("aria-valuetext", label);
    levels.push(await meter.evaluate((m) => m.value));
  }
  // Entropy rises with temperature, with a bigger jump for boiling than for melting.
  for (let i = 1; i < levels.length; i++) expect(levels[i]).toBeGreaterThan(levels[i - 1]);
  await expect(chamber).toHaveAttribute("aria-label", "Phase chamber at 450 K. Gas: molecules spread through the whole chamber. Entropy is high.");
  // In the gas, the molecules fill the chamber; in the solid, they sit in rows at the bottom.
  const spread = async () => chamber.locator("g g").evaluateAll((gs) => {
    const ys = gs.map((g) => Number(g.getAttribute("transform").match(/translate\([\d.]+ ([\d.]+)\)/)[1]));
    return Math.max(...ys) - Math.min(...ys);
  });
  expect(await spread()).toBeGreaterThan(120);
  await slider.fill("200");
  expect(await spread()).toBeLessThan(60);
  // Changing the process keeps the chamber and its temperature.
  await page.locator("#entropy-case").selectOption("melting");
  await expect(slider).toHaveValue("200");
});
test("phase chamber molecules move only after the student acts, and motion pauses", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/free-energy-lab/");
  const first = page.locator("#phase-chamber g g").first();
  const before = await first.getAttribute("transform");
  await page.waitForTimeout(300);
  expect(await first.getAttribute("transform"), "still at load").toBe(before);
  await page.locator("#phase-temperature").fill("420");
  await page.waitForTimeout(300);
  expect(await first.getAttribute("transform"), "moving after a change").not.toBe(before);
  const motion = page.locator("#phase-motion");
  await expect(motion).toHaveText("Pause motion");
  await motion.click();
  await expect(motion).toHaveAttribute("aria-pressed", "true");
  await expect(motion).toHaveText("Play motion");
  await page.waitForTimeout(100);
  const paused = await first.getAttribute("transform");
  await page.waitForTimeout(300);
  expect(await first.getAttribute("transform"), "still while paused").toBe(paused);
  expect(errors).toEqual([]);
});
test("ΔG versus T chart shades both zones and moves its marker to the temperature", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/free-energy-lab/?mode=dg&rxn=haber");
  const chart = page.locator("#panel-dg svg.zsa-fe-chart-dark");
  await expect(chart).toContainText("Not favored: ΔG° > 0");
  await expect(chart).toContainText("Favored: ΔG° < 0");
  await expect(chart).toContainText("T = 298 K");
  const marker = async () => Number(await chart.locator("circle").getAttribute("cx"));
  const at298 = await marker();
  await page.locator("#temperature-number").fill("1500");
  await page.locator("#temperature-number").press("Tab");
  await expect(chart).toContainText("T = 1500 K");
  expect(await marker()).toBeGreaterThan(at298 + 200);
  // The marker sits on the line: above the zero line (in the red zone) at 1500 K for the Haber reaction.
  const zero = await chart.locator("line[stroke-dasharray='6 4']").getAttribute("y1");
  expect(Number(await chart.locator("circle").getAttribute("cy"))).toBeLessThan(Number(zero));
  await page.goto("/free-energy-lab/?mode=dg&rxn=caco3&course=chem");
  await expect(page.locator("#panel-dg svg.zsa-fe-chart-dark")).toContainText("Nonspontaneous: ΔG > 0");
  await expect(page.locator("#panel-dg svg.zsa-fe-chart-dark")).toContainText("Spontaneous: ΔG < 0");
});
test("ΔG° and K link reveals the equilibrium mixture only after a correct check", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/free-energy-lab/?mode=k&case=n2o4");
  const energy = page.locator("#k-energy"), mix = page.locator("#k-mixture");
  await expect(energy).toHaveAttribute("aria-label", "Products sit below reactants: ΔG° = −4.8 kJ/mol.");
  await expect(mix).toHaveAttribute("aria-label", "The mixture is hidden until you check your answer.");
  await expect(page.locator("#panel-k")).not.toContainText("35 of 40");
  await page.locator("#k-answer").fill("6.9");
  await page.locator("#check-k").click();
  await expect(page.locator("#k-feedback")).toHaveText("Correct answer.");
  // K = 6.9, so B is 6.9 / 7.9 of the mixture: 35 of 40.
  await expect(mix).toHaveAttribute("aria-label", "Equilibrium mixture for A ⇌ B: A: 5 of 40. B: 35 of 40.");
  await expect(mix.locator("rect[transform='rotate(45)'][opacity='1']")).toHaveCount(35);
  // K given: the mixture shows and ΔG° waits for the check.
  await page.goto("/free-energy-lab/?mode=k&case=acetic");
  await expect(mix).toHaveAttribute("aria-label", "Equilibrium mixture for A ⇌ B: B: fewer than 1 of 40");
  await expect(energy).toHaveAttribute("aria-label", "ΔG° is hidden until you check your answer.");
  await expect(page.locator("#panel-k")).not.toContainText("27");
  await page.locator("#k-answer").fill("27");
  await page.locator("#check-k").click();
  await expect(energy).toHaveAttribute("aria-label", /^Products sit above reactants: ΔG° = 27/);
});
test("bench text in Mexican Spanish", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/free-energy-lab/?lang=es");
  await expect(page.locator(".zsa-fe-bench-caption")).toHaveText("Cámara de fases: agua a 1 atm");
  await expect(page.locator("#phase-state")).toHaveText("298 K. Líquido: las moléculas se deslizan entre sus vecinas.");
  await expect(page.locator(".zsa-fe-bench")).not.toContainText(/Phase|Liquid|Melts|Entropy|Chamber/);
  await page.goto("/free-energy-lab/?lang=es&mode=k&case=n2o4");
  await expect(page.locator(".zsa-fe-bench")).toContainText("Mezcla en equilibrio, A ⇌ B");
  await expect(page.locator("#k-mixture")).toHaveAttribute("aria-label", "La mezcla está oculta hasta que verifiques tu respuesta.");
  await expect(page.locator(".zsa-fe-bench")).not.toContainText(/Reactants|Products|Squares|Check your/);
  await page.goto("/free-energy-lab/?lang=es&mode=dg");
  await expect(page.locator("#panel-dg svg.zsa-fe-chart-dark")).toContainText("No favorecida: ΔG° > 0");
});
