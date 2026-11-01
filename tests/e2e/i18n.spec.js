"use strict";
const {test, expect} = require("@playwright/test");
const activities = {
  "gas-laws":"Explorador de las leyes de los gases",
  "ion-charge-trainer":"Práctica de predicción de la carga de iones",
  "ionic-reactions":"Constructor de reacciones iónicas",
  "lewis-vsepr":"Constructor de estructuras de Lewis y VSEPR",
  "limiting-reactant":"Visualizador del reactivo limitante",
  "periodic-table":"Tabla periódica",
  "periodic-trends":"Práctica de tendencias periódicas",
  "polyatomic-ion-trainer":"Práctica de iones poliatómicos",
  "stoichiometry-coach":"Práctica de estequiometría"
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
      // Spoken headers are one full phrase in Spanish word order.
      await expect(page.getByRole("columnheader", {name:"grupo 18", exact:true})).toHaveCount(1);
      await expect(page.getByRole("rowheader", {name:"periodo 3", exact:true})).toHaveCount(1);
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
      // Full templates keep natural Spanish word order.
      await expect(page.locator("#number")).toHaveText(/^Pregunta 1 de \d+$/);
      await page.locator("#choices button").first().click();
      await expect(page.locator("#score")).toHaveText(/^\d+ puntos · racha de [01]$/);
      await expect(page.locator("#feedback")).toHaveText(/^(✓ Correcto|Todavía no)\. .+ = .+\./);
      await noEnglish(page);
      await page.locator("#end").click();
      await expect(page.locator("#result-note")).toHaveText(/^Acertaste [01] de 1 preguntas respondidas\. Las preguntas sin responder no cuentan\./);
      await noEnglish(page);
    } else if (slug === "ionic-reactions") {
      await page.locator("#zsa-ir-start").click();
      // Full templates keep natural Spanish word order.
      await expect(page.locator("#zsa-ir-round")).toHaveText("Problema 1 de 10");
      await expect(page.locator("#zsa-ir-progress")).toHaveText("0 de 10 terminados");
      await page.locator("#zsa-ir-bank button").first().click();
      await expect(page.locator("#zsa-ir-selection")).toHaveText(/^Seleccionaste .+\. Elige un espacio de producto\.$/);
      await page.locator('#zsa-ir-products [data-product="0"][data-part="0"]').click();
      await expect(page.locator("#zsa-ir-live")).toHaveText(/^Colocaste .+ en el producto 1, componente 1\.$/);
      await noEnglish(page);
      await page.getByRole("button", {name:"Pista", exact:true}).first().click();
      await page.getByRole("button", {name:"Pista", exact:true}).first().click();
      await expect(page.locator("#zsa-ir-feedback")).toHaveText(/^Un producto es \S+\. /);
      await page.locator("#zsa-ir-check-products").click();
      await noEnglish(page);
      for (let i = 0; i < 10; i++) await page.locator("#zsa-ir-skip").click();
      await expect(page.locator("#zsa-ir-summary-lede")).toHaveText("Terminaste 10 problemas. Tuviste errores en 10; de esos, omitiste 10.");
      await noEnglish(page);
      await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
      await expect(page.locator("#zsa-ir-instructions li").nth(1)).toContainText("Construye los productos. Para CuSO4 + Na3PO4");
      await noEnglish(page);
      await page.locator("#zsa-ir-instructions-close").click();
      await page.locator("#zsa-ir-share-toggle").click();
      await expect(page.locator("#zsa-ir-share-url")).toHaveValue("https://activities.zornscience.org/ionic-reactions/?lang=es");
      await noEnglish(page);
    } else if (slug === "periodic-trends") {
      // Full templates keep natural Spanish word order, with articles before element names.
      await expect(page.locator("#zsa-ptr-progress")).toHaveText(/^Pregunta 1 de 9 · Paso 1 de 3$/);
      await page.goto("/periodic-trends/?lang=es&q=radius-Na-Cl");
      await expect(page.locator("#zsa-ptr-heading")).toHaveText("Sodio (Na) y cloro (Cl)");
      const step = page.locator("#zsa-ptr-work > fieldset");
      await expect(step.locator("legend")).toHaveText("1. ¿El sodio y el cloro están en el mismo grupo o en el mismo periodo?");
      await step.getByRole("button", {name:"Pista", exact:true}).click();
      await step.getByRole("button", {name:"Otra pista", exact:true}).click();
      await expect(page.locator("#zsa-ptr-work")).toContainText("Sodio: grupo 1, periodo 3. Cloro: grupo 17, periodo 3.");
      await step.getByRole("button", {name:/^Mismo grupo/}).click();
      await expect(page.locator("#zsa-ptr-work")).toContainText("↻ Todavía no. El sodio está en el grupo 1, periodo 3; el cloro está en el grupo 17, periodo 3.");
      await step.getByRole("button", {name:/^Ninguno/}).click();
      await step.getByRole("button", {name:"Muéstrame", exact:true}).click();
      await expect(page.locator("#zsa-ptr-work")).toContainText("→ Respuesta mostrada. Ambos están en el periodo 3.");
      await noEnglish(page);
      await page.getByRole("button", {name:"Disminuye", exact:true}).click();
      await page.getByRole("button", {name:"Sodio (Na)", exact:true}).click();
      await expect(page.locator("#zsa-ptr-work")).toContainText("El sodio tiene un mayor radio atómico. Na: 155 pm. Cl: 99 pm.");
      await noEnglish(page);
      await page.locator("#zsa-ptr-options summary").click();
      await page.locator("#zsa-ptr-select").selectOption("en");
      await page.getByRole("button", {name:"Practicar esta tendencia", exact:true}).click();
      await expect(page.locator("#zsa-ptr-caption")).toHaveText("Compara: la electronegatividad");
      await noEnglish(page);
      await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
      await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/periodic-trends/?lang=es");
    } else if (slug === "lewis-vsepr") {
      // Full templates keep natural Spanish word order in the progress line and the editor status.
      await expect(page.locator("#zsa-lv-progress")).toHaveText(/^Estructura 1 de 6 · Paso 1 de \d$/);
      await page.getByRole("button", {name:"Pista", exact:true}).click();
      await page.getByRole("button", {name:"Otra pista", exact:true}).click();
      await noEnglish(page);
      await page.locator("#zsa-lv-en").click();
      await expect(page.locator("#zsa-lv-en")).toHaveText("Ocultar electronegatividad");
      await page.locator("#zsa-lv-options summary").click();
      await page.locator("#zsa-lv-select").selectOption("H2O");
      await page.locator("#zsa-lv-pick").click();
      await expect(page.locator("#zsa-lv-strip p").first()).toHaveText("agua");
      await page.locator('[data-zsa-part="total"] button[value="7"]').click();
      await expect(page.locator("#zsa-lv-work [role=alert], #zsa-lv-work p").filter({hasText:"Todavía no"}).first()).toBeVisible();
      await noEnglish(page);
      await page.locator('[data-zsa-part="total"] button[value="8"]').click();
      await page.locator('[data-zsa-part="center"] button[value="O"]').click();
      const status = page.locator('[data-zsa-part="lv-build"] [aria-live]');
      await expect(status).toHaveText("Colocados: 0 de 8. Define todos los enlaces: faltan 2. Faltan 8 electrones por colocar.");
      await page.getByRole("group", {name:/^Átomos de la estructura/}).getByRole("button").first().click();
      await page.getByRole("group", {name:"Enlace entre el H de la izquierda y O"}).getByRole("button", {name:"Simple"}).click();
      await expect(status).toHaveText("Colocados: 2 de 8. Define todos los enlaces: falta 1. Faltan 6 electrones por colocar.");
      await noEnglish(page);
      await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
      await noEnglish(page);
    } else if (slug === "stoichiometry-coach") {
      await page.locator("#zsa-sc-type").selectOption("gg");
      await page.locator("#zsa-sc-reaction").selectOption("1");
      await expect(page.locator("#zsa-sc-question")).toHaveText(/^¿Cuántos gramos de NH₃ se forman a partir de \d+\.?\d* g N₂\?$/);
      await expect(page.locator("#zsa-sc-context")).toHaveText("El nitrógeno reacciona con hidrógeno en exceso.");
      // A wrong factor, then the correct three-step setup, with guided feedback after each step.
      await page.getByRole("button", {name:/^28\.014 g N₂ por 1 mol N₂, Agregar factor$/}).click();
      await expect(page.locator("#zsa-sc-feedback")).toHaveText("Tienes g N₂. Pon g N₂ en el denominador del siguiente factor para que se cancele.");
      await noEnglish(page);
      await page.locator("#zsa-sc-clear").click();
      await page.locator("#zsa-sc-hint").click();
      await expect(page.locator("#zsa-sc-hintbox")).toHaveText("Comienza con los gramos de N₂. Usa su masa molar (28.014 g/mol), con los gramos en el denominador.");
      await page.locator("#zsa-sc-hint").click();
      await expect(page.locator("#zsa-sc-hintbox")).toHaveText(/ El siguiente factor es 1 mol N₂ \/ 28\.014 g N₂\.$/);
      for (const name of [/^1 mol N₂ por 28\.014 g N₂, /, /^2 mol NH₃ por 1 mol N₂, /, /^17\.031 g NH₃ por 1 mol NH₃, /]) await page.getByRole("button", {name}).click();
      await expect(page.locator("#zsa-sc-feedback")).toHaveText("Tus unidades y factores de conversión son correctos.");
      await expect(page.locator("#zsa-sc-chain")).toContainText("Factor 3: 17.031 g NH₃ por 1 mol NH₃. Encaja: mol NH₃ se cancela.");
      await page.locator("#zsa-sc-input").fill("1");
      await page.locator("#zsa-sc-check").click();
      await expect(page.locator("#zsa-sc-result")).toHaveText(/^Vuelve a calcular/);
      const value = Number((await page.locator("#zsa-sc-given").textContent()).split(" ")[0]);
      await page.locator("#zsa-sc-input").fill((value / 28.014 * 2 * 17.031).toPrecision(3));
      await page.locator("#zsa-sc-check").click();
      await expect(page.locator("#zsa-sc-result")).toHaveText(/^✓ ¡Correcto! .+ Problemas resueltos en esta sesión: 1\.$/);
      await expect(page.locator(".zsa-sc-solved")).toHaveText("Resueltos en esta sesión: 1");
      await noEnglish(page);
      await page.locator("#zsa-sc-solution").click();
      await expect(page.locator("#zsa-sc-solutionbox")).toContainText(/Sin redondear: \d+\.\d+ g NH₃\. Respuesta final: \d+\.?\d* g NH₃ \(tres cifras significativas\)\./);
      await noEnglish(page);
      await page.locator("#zsa-sc-independent").click();
      await page.locator("#zsa-sc-type").selectOption("gm");
      await page.locator("#zsa-sc-check").click();
      await expect(page.locator("#zsa-sc-result")).toHaveText(/^Primero arma tu planteamiento\. Elige un factor cuyo denominador sea g N₂\.$/);
      await noEnglish(page);
      await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
      await noEnglish(page);
      await page.getByRole("button", {name:"Cerrar instrucciones", exact:true}).click();
      await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
      await expect(page.locator("#zsa-header-share-url")).toHaveValue(/lang=es/);
      await noEnglish(page);
    } else if (slug === "limiting-reactant") {
      await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
      await noEnglish(page);
      await page.keyboard.press("Escape");
      // Ammonia, 2 mol N₂ and 5 mol H₂: a wrong pick and a wrong amount, then react all.
      await page.locator("#zsa-lr-rxn").selectOption("ammonia");
      await page.locator("#zsa-lr-a").fill("2");
      await page.locator("#zsa-lr-b").fill("5");
      await expect(page.locator("#zsa-lr-status")).toHaveText("Listo. Moléculas: 6 de N₂ y 15 de H₂. Predice y luego presiona Reaccionar todo o Reaccionar una vez.");
      await page.locator('input[name="zsa-lr-pick"][value="0"]').check();
      await page.locator("#zsa-lr-amount").fill("4");
      await page.locator("#zsa-lr-once").click();
      await expect(page.locator("#zsa-lr-status")).toHaveText(/^Reacciones completadas: 1 de 5\. Sigue reaccionando para ver dónde se detiene\.$/);
      await noEnglish(page);
      await page.getByRole("button", {name:"Reaccionar todo", exact:true}).click();
      // Full templates keep natural Spanish word order.
      await expect(page.locator("#zsa-lr-status")).toHaveText(/^Reacción detenida\. La reacción formó 3\.33 mol de NH₃\. H₂ es el reactivo limitante y hay 0\.33 mol de N₂ en exceso\.$/, {timeout:15000});
      await expect(page.locator("#zsa-lr-why-body")).toContainText("Predijiste que N₂ se acabaría primero. En realidad, H₂ se acabó primero.");
      await expect(page.locator("#zsa-lr-why-body")).toContainText("La única molécula de N₂ que sobra (0.33 mol) no tiene H₂ con qué reaccionar, así que se queda sin reaccionar.");
      await expect(page.locator("#zsa-lr-canvas")).toHaveAttribute("aria-label", /La reacción se detuvo: ya no queda H₂\. Queda 1 molécula de N₂ sin nada con qué reaccionar\.$/);
      await expect(page.locator("#zsa-lr-thead")).toContainText("limitante");
      await noEnglish(page);
      await page.locator('input[name="zsa-lr-q-equal"][value="o2"]').check();
      await page.getByRole("button", {name:"Revisar mis respuestas", exact:true}).click();
      await expect(page.locator("#zsa-lr-feedback")).toContainText("2. Todavía no. Cada O₂ necesita 2 H₂.");
      await noEnglish(page);
      await page.getByRole("button", {name:"Empezar de nuevo", exact:true}).click();
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
  await expect(page.locator("#zsa-ict-progress")).toHaveText(/^Elemento 1 de 10 · Paso 1 de [34]$/);
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
