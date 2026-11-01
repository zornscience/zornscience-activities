"use strict";
const {test, expect} = require("@playwright/test");
const activities = {
  "gas-laws":"Explorador de las leyes de los gases",
  "ion-charge-trainer":"Práctica de predicción de la carga de iones",
  "periodic-table":"Tabla periódica",
  "polyatomic-ion-trainer":"Práctica de iones poliatómicos"
};
const english = /\b(?:ZornScience home|Practice|Reference|Feedback|Results|Start|Finish|Help|Options|Time|Show|Incorrect|Wrong|Recall|Cards|Card|Points|Streak|Selected|Unknown|Period|Group|Symbol|Block|Element|Copied|the|your|Choose|You|Hint|Another hint|Both hints|Correct|Not yet|No data|Across a period|Down a group|Common ion|Next question|End session|Time remaining|points|recalled|Question|Answer|Instructions|Share|Close|Copy link|Practice options|Valence electrons|Next element|Completion code|Ion name|Formula \+ charge|Show answer|Still learning|Start flashcards|Quiz game|Session complete|Element details|Atomic number|Color by|Find an element|Full screen|Gas Laws Sandbox|Particle model|Gas controls|Reset|Pause motion|Live graph)\b/i;
async function noEnglish(page) {
  const strings = await page.locator("body").evaluate(body => {
    const result = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.parentElement.closest("script, style, noscript")) result.push(n.textContent);
    }
    body.querySelectorAll("[aria-label], [placeholder], [title], [alt]").forEach(el => {
      for (const attr of ["aria-label", "placeholder", "title", "alt"]) if (el.hasAttribute(attr)) result.push(el.getAttribute(attr));
    });
    return result.join("\n");
  });
  expect(strings).not.toMatch(english);
}
for (const [slug, title] of Object.entries(activities)) {
  test(slug + " opens in Mexican Spanish with translated interface and toggle", async ({page}) => {
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto("/" + slug + "/?lang=es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
    await expect(page).toHaveTitle(title + " | ZornScience");
    await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
    await noEnglish(page);
    if (slug === "gas-laws") {
      await page.locator("#law").selectOption("charles");
      await page.getByRole("button", {name:"Pausar movimiento"}).click();
      await noEnglish(page);
      await page.getByRole("link", {name:"EN English", exact:true}).click();
      await expect(page.locator("#law")).toHaveValue("charles");
      await expect(page.getByRole("button", {name:"Resume motion"})).toBeVisible();
      await page.getByRole("button", {name:"Reset", exact:true}).click();
      await page.getByRole("link", {name:"ES Español", exact:true}).click();
      await expect(page.locator("#status")).toHaveText("Se restablecieron las condiciones estándar.");
      await noEnglish(page);
    } else if (slug === "periodic-table") {
      await page.locator("#zsa-pt-query").fill("sodio");
      await page.locator("#zsa-pt-find").click();
      await page.locator("#zsa-pt-el-11").press("Enter");
      await expect(page.locator("#zsa-pt-details-title")).toHaveText("Sodio");
      for (const mode of ["radius", "electronegativity", "ionization", "block"]) {
        await page.locator('input[value="' + mode + '"]').check();
        await noEnglish(page);
      }
      await page.locator("#zsa-pt-share-toggle").click();
      await expect(page.locator("#zsa-pt-share-url")).toHaveValue(/lang=es/);
    } else if (slug === "polyatomic-ion-trainer") {
      await page.locator("#study-options summary").click();
      await page.locator("#set").selectOption("ends");
      await page.locator("#start").click();
      await expect(page.locator("#number")).toHaveText("2 tarjetas restantes");
      await page.locator("#card").click();
      await noEnglish(page);
      await page.locator("#known").click();
      await expect(page.locator("#number")).toHaveText("1 tarjeta restante");
      await page.locator("#end").click();
      await noEnglish(page);
      await page.locator("#restart").click();
      await page.locator("#quiz-mode").click();
      await page.locator("#start").click();
      await page.locator("#choices button").first().click();
      await noEnglish(page);
      await page.locator("#end").click();
      await noEnglish(page);
    } else {
      await page.getByRole("button", {name:"Pista", exact:true}).click();
      await noEnglish(page);
      await page.getByRole("button", {name:"Otra pista", exact:true}).click();
      await noEnglish(page);
      await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
      await noEnglish(page);
    }
    expect(errors).toEqual([]);
  });
}

test("Spanish ion round translates hints, feedback, review and completion codes", async ({page}) => {
  await page.goto("/ion-charge-trainer/?lang=es");
  const work = page.locator("#zsa-ict-work");
  for (let action = 0; action < 350; action++) {
    if (await work.getByRole("heading", {name:"Ronda terminada", exact:true}).count()) break;
    const step = work.locator(":scope > fieldset");
    if (!await step.count()) {
      await work.getByRole("button", {name:/Siguiente elemento|Ver resumen de la ronda/}).click();
      continue;
    }
    const show = step.getByRole("button", {name:"Muéstrame", exact:true});
    if (await show.isVisible()) { await show.click(); await noEnglish(page); continue; }
    const hint = step.getByRole("button", {name:"Pista", exact:true});
    if (await hint.count()) {
      await hint.click();
      await step.getByRole("button", {name:"Otra pista", exact:true}).click();
      await noEnglish(page);
    }
    const id = await step.getAttribute("id");
    const parts = await step.locator("[data-zsa-part]").count();
    for (let part = 0; part < parts; part++) {
      if (!await step.count() || await step.getAttribute("id") !== id) break;
      const group = step.locator("[data-zsa-part]").nth(part);
      await group.locator('button:not([aria-disabled="true"])').first().click();
    }
    await noEnglish(page);
  }
  await expect(work.getByRole("heading", {name:"Ronda terminada", exact:true})).toBeVisible();
  await expect(work.getByText("Código de finalización", {exact:true})).toBeVisible();
  await expect(work.getByRole("button", {name:"Copiar código", exact:true})).toBeVisible();
  await expect(work.getByText("Pega este código en tu tarea de Google Classroom.", {exact:true})).toBeVisible();
  await noEnglish(page);
});

test("Spanish follows links between activities and English is the fallback", async ({page}) => {
  // The current trainer has no cross-activity link. Add a test-only link to its initial markup.
  await page.route(/\/ion-charge-trainer\/\?lang=es$/, async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace('<div class="zsa-layout">', '<div class="zsa-layout"><a id="activity-link" href="../periodic-table/?el=Na#details">Na</a>');
    await route.fulfill({response, body});
  });
  await page.goto("/ion-charge-trainer/?lang=es");
  await expect(page.locator("#activity-link")).toHaveAttribute("href", /el=Na&lang=es#details$/);
  await page.locator("#activity-link").click();
  await expect(page).toHaveTitle("Tabla periódica | ZornScience");
  await expect(page.locator("#zsa-pt-details-title")).toHaveText("Sodio");
  await page.goto("/ion-charge-trainer/?lang=fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Predicting Ion Charge Trainer | ZornScience");
});

test("Spanish activity headers fit narrow screens", async ({page}) => {
  for (const slug of Object.keys(activities)) {
    for (const width of [320, 390]) {
      await page.setViewportSize({width, height:844});
      await page.goto("/" + slug + "/?lang=es");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), slug + " at " + width).toBeLessThanOrEqual(0);
      const toggle = page.getByRole("link", {name:"ES Español", exact:true});
      const box = await toggle.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
