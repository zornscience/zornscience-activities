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
// Virtual labs: each has its own test below, since the shared walk above clicks hints these labs do not have.
const labs = {
  "beers-law-lab":"Laboratorio de la ley de Beer con espectrofotómetro",
  "calorimetry-lab":"Laboratorio de calorimetría y entalpía",
  "chemical-bonding-lab":"Laboratorio de enlace químico",
  "electrochemistry-lab":"Constructor de celdas electroquímicas",
  "equilibrium-lab":"Explorador del equilibrio",
  "equilibrium-thermo-lab":"Selección de un laboratorio de química",
  "flame-test-lab":"Laboratorio virtual de prueba de llama",
  "gas-lab":"Laboratorio de leyes de los gases y TCM",
  "gravimetric-lab":"Análisis gravimétrico",
  "iodine-clock-lab":"Laboratorio del reloj de yodo",
  "kinetics-lab":"Simulador de cinética y teoría de colisiones",
  "metals-lab":"Metales, no metales y metaloides",
  "net-ionic-lab":"Laboratorio de reacciones iónicas netas",
  "redox-coach":"Práctica de balanceo de semirreacciones redox",
  "titration-lab":"Simulador virtual de titulación"
};
const english = /\b(?:ZornScience home|Practice|Reference|Feedback|Results|Start|Finish|Help|Options|Time|Show|Incorrect|Wrong|Recall|Cards|Card|Points|Streak|Selected|Unknown|Period|Group|Symbol|Block|Element|Copied|the|your|Choose|You|Hint|Another hint|Both hints|Correct|Not yet|No data|Across a period|Down a group|Common ion|Next question|End session|Time remaining|points|recalled|Question|Answer|Instructions|Share|Close|Copy link|Practice options|Valence electrons|Next element|Completion code|Ion name|Formula \+ charge|Show answer|Still learning|Start flashcards|Quiz game|Session complete|Element details|Atomic number|Color by|Find an element|Full screen|Gas Laws Sandbox|Particle model|Gas controls|Reset|Pause motion|Live graph|Absorbance|Transmittance|Wavelength|Spectrophotometer|Cuvette|Calibration|Standards|Blank|Measure|Concentration|Best-fit|Remove|Grating|Lamp|distilled|Calorimetry|Calorimeter|Experiment|Copper|Aluminum|Water|Heated|Simulated|Insulation|Probe|Trials|Measured|Specific heat|Neutralization|Prediction|Equilibrium Sandbox|Temperature|Pressure|vessel|Forward|Reverse|Advance|Resume|Download|shifts|Flame|Sample|Samples|Lithium|Sodium|Potassium|Strontium|Barium|Cesium|Chloride|Burner|Tested|Investigation|Tray|Volume|Speeds|Graphs|Investigations|Mixture|Container|piston|dots|Record point|Run sweep|Set up the lab|Make the change for me|Test in the lab|Solution|Playback|Stopped|Iodine|starch|beaker|endpoint|trial|challenge|Clock|Collision|Collisions|Catalyst|Activation|Successful|Running|Paused|Bounce|Earlier|Sandbox|Run|Energy|Titrant|Burette|Stopcock|Endpoint|Analyte|Equivalence|Refill|Indicator|Phenolphthalein|Hydrochloric|flask|drop|Bonding|Unknowns|Appearance|Conductivity|Melting|Malleability|cyclohexane|probes|scoopula|pestle|mortar|tongs|foil|Weigh|Stir|Lift|Immerse|rinse|Dispose|Load|Switch|plate|brittle|malleable|crystals|granules|solid|fresh|Repeat|Bench|Station|stations|watch glass|Copy|Link|simulation|portion|portions|Nonpolar|very high|Equipment|Heating|cooling|boat|Observation|cylinder|Sweep|luster|Flatten|fracture|Electrochemistry|Electrochemical|Cell Builder|cell|cells|Anode|Cathode|oxidation|reduction|electrode|electrodes|electrons|Galvanic|Electrolytic|spontaneous|half-cell|half-cells|Swap|salt bridge|voltmeter|circuit|Power supply|DC SUPPLY|OFF|STANDARD|Step once|Restart particles|Clear bench|Place|Silver|beakers|Run cell|Sample complete|Ready|Event|events|atoms|atom|deposited|transferred|lost|gains|loses|Slow|Fast|Animation|explanations|ions|bead|Observe|Explore|Particle key|Scope|agar gel|wires|meter|Calculated|Applied|Left|Right|Gravimetric|Gravimetry|Crucible|Desiccator|Oven|Weighing|Goggles|Filter paper|Funnel|Vacuum|Filtration|Precipitate|Supernatant|Sediment|Decant|Wash|Deionized|Carbonate|Moisture|Dry|Cool|Heat|Step|Reading|Reveal|Inspect|Evidence|Laboratory|lab|Prepare|Separate|Settle|overnight|Analysis|Analytical|Constant mass|Accelerated|Live|Identify|tester|waste|pipette|inspection|flattens|fractures|bubbles|solids|Nonmetal|Nonmetals|Metalloid|Metalloids|Strong|Weak|Open|Pour|Borosilicate|glass|acid|Reaction|Reagent|Reagents|mixing|Mixed|Settling|Settled|Glassware|Lead|Calcium|Iron|Nitrate|Sulfate|Hydroxide|colorless|Adding|Lowering|strip|Observing|replay|bottle|Reactants|Products|Half-Reaction|half-reactions|Balancer|Undo|Restart|species|multiplier|multiplied|Merge|Total charge|Cancel mode|medium|Acidic|Basic|Unassigned|Permanganate|iodide|yields|Selection|placed|Success|balanced|locked|current)\b/i;
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

test("beers-law-lab opens in Mexican Spanish and translates measuring, the curve and the answer", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/beers-law-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio de la ley de Beer con espectrofotómetro | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await noEnglish(page);
  await expect(page.locator("#zsa-bl-status")).toHaveText("Empieza por colocar el blanco (agua destilada) y ajustar a cero el espectrofotómetro.");
  await expect(page.locator("#zsa-bl-solution-text")).toHaveText("El cloruro de cobalto(II) (iones [Co(H₂O)₆]²⁺) es rosa porque absorbe con más fuerza la luz verde: λmax = 510 nm. Estándares de 0 a 0.350 M.");
  await page.locator("#zsa-bl-standard").click();
  await expect(page.locator("#zsa-bl-status")).toHaveText("Primero ajusta a cero el espectrofotómetro con el blanco.");
  await page.locator("#zsa-bl-zero").click();
  await expect(page.locator("#zsa-bl-status")).toHaveText("Blanco colocado y ajuste a cero listo: absorbancia 0.000, transmitancia 100.0%. Ahora mide tus estándares.");
  for (const c of ["0.05", "0.1", "0.2", "0.3"]) {
    await page.locator("#zsa-bl-conc").fill(c);
    await page.locator("#zsa-bl-standard").click();
  }
  await expect(page.locator("#zsa-bl-status")).toHaveText(/^Estándar 4: 0\.300 M, absorbancia [\d.]+, transmitancia [\d.]+%\. Se agregó a la curva de calibración\.$/);
  await noEnglish(page);
  await page.locator("#zsa-bl-check").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText("Primero mide la muestra desconocida y luego usa su absorbancia.");
  await page.locator("#zsa-bl-unknown").click();
  await expect(page.locator("#zsa-bl-task")).toHaveText(/^La absorbancia de la muestra desconocida es [\d.]+ a 510 nm\. Usa tu curva de calibración para calcular su concentración\.$/);
  await page.locator("#zsa-bl-answer").fill("99");
  await page.locator("#zsa-bl-check").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText(/^Todavía no\. /);
  await noEnglish(page);
  await page.locator("#zsa-bl-show").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText(/^La concentración de la muestra desconocida es [\d.]+ M\. Tu línea de mejor ajuste da c = \(A − b\) ÷ m = /);
  const c = (await page.locator("#zsa-bl-feedback").textContent()).match(/es ([\d.]+) M/)[1];
  await page.locator("#zsa-bl-new").click();
  await page.locator("#zsa-bl-unknown").click();
  await page.locator("#zsa-bl-show").click();
  const c2 = (await page.locator("#zsa-bl-feedback").textContent()).match(/es ([\d.]+) M/)[1];
  await page.locator("#zsa-bl-answer").fill(c2);
  await page.locator("#zsa-bl-check").click();
  await expect(page.locator("#zsa-bl-feedback")).toHaveText(new RegExp("^✓ Correcto\\. La concentración de la muestra desconocida es " + c2.replace(".", "\\.") + " M\\. "));
  expect(c).toMatch(/^\d/);
  await page.locator("#zsa-bl-fit").click();
  await expect(page.locator("#zsa-bl-equation")).toHaveText("Línea de mejor ajuste oculta. Calcula la pendiente con tus datos.");
  await page.locator("#zsa-bl-rows [data-remove]").first().click();
  await page.locator("#zsa-bl-solution").selectOption("cuso4");
  await expect(page.locator("#zsa-bl-rows")).toHaveText("Todavía no hay datos. Mide un estándar para empezar.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.locator("#zsa-header-instructions li").first()).toHaveText("Ajusta a cero el instrumento con un blanco y luego mide estándares de concentración conocida.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones", exact:true}).click();
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/beers-law-lab/?lang=es");
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("calorimetry-lab opens in Mexican Spanish and translates runs, feedback, solutions and sharing", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.clock.install();
  await page.goto("/calorimetry-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio de calorimetría y entalpía | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".zsa-back")).toHaveAttribute("href", "../?lang=es");
  await noEnglish(page);
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Guía para usar este laboratorio");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/calorimetry-lab/?lang=es");
  const email = decodeURIComponent(await page.locator("#zsa-th-share-email").getAttribute("href"));
  expect(email).toContain("subject=Laboratorio de calorimetría y entalpía | ZornScience");
  expect(email).toContain("https://activities.zornscience.org/calorimetry-lab/?lang=es");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  // Copper at 90 °C into 100 g of water at 22 °C, predicting a rise.
  await page.locator("#cal-prediction").selectOption("rise");
  await page.getByRole("button", {name:"Coloca el metal e inicia", exact:true}).click();
  await page.clock.runFor(1000);
  await page.getByRole("button", {name:"Pausar", exact:true}).click();
  await expect(page.locator("#cal-status")).toHaveText("Experimento en pausa. Revisa la temperatura, reanuda o ve a la lectura final.");
  await expect(page.locator("#cal-time")).toHaveText(/^\d+\.\d s simulados$/);
  await noEnglish(page);
  await page.getByRole("button", {name:"Ir a la lectura final", exact:true}).click();
  await expect(page.locator("#cal-status")).toHaveText("Se alcanzó el equilibrio térmico. Usa los valores medidos para calcular y luego compara otro ensayo.");
  await expect(page.locator("#cal-prediction-feedback")).toHaveText("Tu predicción se confirma. El agua / solución se calentó al ganar energía.");
  await expect(page.locator("#comparison-body th")).toHaveText("1. Cobre, 50 g de metal a 90 °C; 100 g de agua");
  await noEnglish(page);
  await page.locator("#cal-answer").fill("-0.385");
  await page.getByRole("button", {name:"Revisar cálculo", exact:true}).click();
  await expect(page.locator("#answer-feedback")).toHaveText("El calor específico es positivo. El agua y el metal tienen cambios de calor opuestos: qagua = −qmetal. Usa la temperatura inicial propia de cada material.");
  await noEnglish(page);
  await page.locator("#cal-answer").fill("0.385");
  await page.getByRole("button", {name:"Revisar cálculo", exact:true}).click();
  await expect(page.locator("#cal-result strong")).toHaveText("Calor específico = 0.385 J/(g·°C)");
  await noEnglish(page);
  // Equal starting temperatures give no information about specific heat.
  await page.locator("#hot").fill("22");
  await page.locator("#start-cal").click();
  await page.locator("#cal-finish").click();
  await expect(page.locator("#cal-result")).toContainText("Con estos datos no se puede determinar el calor específico");
  await noEnglish(page);
  // Neutralization with NaOH in excess, a wrong sign, then the worked solution.
  await page.locator("#experiment").selectOption("acid");
  await page.locator("#bv").fill("100");
  await page.getByRole("button", {name:"Mezcla las soluciones e inicia", exact:true}).click();
  await page.locator("#cal-finish").click();
  await page.locator("#cal-answer").fill("57.3");
  await page.getByRole("button", {name:"Revisar cálculo", exact:true}).click();
  await expect(page.locator("#answer-feedback")).toHaveText("Revisa el signo: la solución gana calor, así que la reacción libera calor. ΔHreacción debe ser negativo.");
  await page.getByRole("button", {name:"Mostrar la solución paso a paso", exact:true}).click();
  await expect(page.locator("#cal-result")).toContainText("H₂O formada = 0.0500 mol (reactivo limitante).");
  await expect(page.locator("#cal-result")).toContainText("ΔH = −2865.0 / 0.0500 = −57.3 kJ/mol");
  await noEnglish(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", {name:"Descargar datos del laboratorio (CSV)", exact:true}).click();
  const csv = await (await download).createReadStream();
  let text = ""; for await (const chunk of csv) text += chunk;
  expect(text.split("\n")[0]).toBe("tiempo_s,temperatura_C");
  await page.locator("#ac").fill("0");
  await page.locator("#start-cal").click();
  await expect(page.locator("#cal-error")).toHaveText("Ingresa valores válidos dentro de los límites indicados.");
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("equilibrium-lab opens in Mexican Spanish with translated interface and toggle", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.clock.install();
  await page.goto("/equilibrium-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Explorador del equilibrio | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#state")).toHaveText("En equilibrio");
  await expect(page.locator("#explanation")).toHaveText("Empieza en equilibrio. Haz un cambio y compara Qc con Kc mientras el sistema responde.");
  await noEnglish(page);
  await page.locator("#add").click();
  await expect(page.locator("#explanation")).toHaveText("Agregaste 0.10 mol de N₂O₄. La reacción se desplaza a la derecha, hacia los productos. Kc se mantiene constante.");
  await expect(page.locator("#state")).toHaveText("Desplazamiento a la derecha →");
  await noEnglish(page);
  await page.locator("#volume").evaluate(el => { el.value = "2"; el.dispatchEvent(new Event("input")); });
  await expect(page.locator("#explanation")).toHaveText("La compresión aumenta al instante ambas concentraciones. Luego la reacción se desplaza a la izquierda, hacia menos moléculas de gas. Kc se mantiene constante.");
  await page.clock.runFor(25000);
  await expect(page.locator("#state")).toHaveText("En equilibrio");
  await expect(page.locator("#rate-note")).toHaveText("Velocidades casi iguales y distintas de cero: ambas reacciones continúan mientras las concentraciones se mantienen estables. Se detecta el equilibrio cuando Qc está a menos de 0.5% de Kc. Los valores son ilustrativos en mol/(L·s simulado), no cinética experimental.");
  await noEnglish(page);
  await page.locator("#temp").evaluate(el => { el.value = "320"; el.dispatchEvent(new Event("input")); });
  await expect(page.locator("#explanation")).toHaveText("Calentar favorece la reacción directa endotérmica. Kc aumenta y el sistema produce más NO₂.");
  await page.locator("#eq-step").click();
  await expect(page.locator("#pause")).toHaveText("Reanudar");
  await noEnglish(page);
  const download = page.waitForEvent("download");
  await page.locator("#csv").click();
  const csv = await require("node:fs/promises").readFile(await (await download).path(), "utf8");
  expect(csv.split("\n")[0]).toBe("tiempo_s,N2O4_M,NO2_M,temperatura_K,volumen_L,Kc,Qc,velocidad_directa_M_por_s_sim,velocidad_inversa_M_por_s_sim");
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Guía para usar este laboratorio");
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones", exact:true}).click();
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/equilibrium-lab/?lang=es");
  const email = decodeURIComponent(await page.locator("#zsa-th-share-email").getAttribute("href"));
  expect(email).toContain("Explorador del equilibrio | ZornScience");
  expect(email).toContain("Explora el principio de Le Châtelier");
  expect(email).toContain("https://activities.zornscience.org/equilibrium-lab/?lang=es");
  await page.getByRole("button", {name:"Copiar enlace", exact:true}).click();
  await expect(page.locator("#zsa-th-share-status")).toHaveText(/^(Enlace copiado\.|Enlace seleccionado\. Presiona Ctrl\+C, o Command\+C en una Mac, para copiarlo\.)$/);
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("flame-test-lab opens in Mexican Spanish and translates every state", async ({page, context}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/flame-test-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio virtual de prueba de llama | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await noEnglish(page);
  await expect(page.locator("#observation")).toHaveText("Una llama azul y limpia. ¿Todo listo para explorar?");
  await expect(page.locator("#progress")).toHaveText("0 / 8 probadas");
  await page.getByRole("button", {name:"Prueba el cloruro de litio", exact:true}).click();
  await expect(page.locator("#sample-label")).toHaveText("CLORURO DE LITIO · LiCl");
  await expect(page.locator("#observation")).toHaveText("Llama de color rojo carmesí");
  await page.getByRole("button", {name:"Prueba el cloruro de calcio", exact:true}).click();
  await expect(page.locator("#sample-label")).toHaveText("CLORURO DE CALCIO · CaCl₂");
  await expect(page.locator("#progress")).toHaveText("2 / 8 probadas");
  await noEnglish(page);
  await page.getByRole("button", {name:"Prueba la muestra desconocida", exact:true}).click();
  await expect(page.locator("#sample-label")).toHaveText("MUESTRA DESCONOCIDA · EN OBSERVACIÓN");
  await expect(page.locator("#observation")).toHaveText(/^Llama de color /);
  await noEnglish(page);
  await page.getByRole("button", {name:"↺ Limpiar la llama"}).click();
  await expect(page.locator("#sample-label")).toHaveText("MECHERO BUNSEN · LISTO");
  await page.getByRole("button", {name:"↻ Nueva investigación"}).click();
  await expect(page.locator("#progress")).toHaveText("0 / 8 probadas");
  await noEnglish(page);
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.locator("#zsa-th-instructions-title")).toHaveText("Guía para usar este laboratorio");
  await expect(page.locator("#zsa-th-instructions-intro")).toHaveText("Haz clic en una muestra para comparar los colores característicos de la llama de ocho sales metálicas conocidas y una desconocida.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones"}).click();
  await page.getByRole("button", {name:"Compartir actividad"}).click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/flame-test-lab/?lang=es");
  await expect(page.locator("#zsa-th-share-email")).toHaveAttribute("href", /Laboratorio%20virtual%20de%20prueba%20de%20llama%20%7C%20ZornScience.*lang%3Des/);
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("gas-lab opens in Mexican Spanish and translates the lab, graphs, speeds and investigations", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/gas-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio de leyes de los gases y TCM | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#zsa-gl-note")).toHaveText("La temperatura se mantiene constante. Cambia el volumen o los moles y la presión responde.");
  await expect(page.locator("#zsa-gl-fit")).toHaveText("Todavía no hay puntos. Presiona Registrar punto o Hacer barrido.");
  await noEnglish(page);
  // Lab controls: hold pressure, a mixture, then real gas mode with condensation.
  await page.locator('input[name="zsa-gl-hold"][value="P"]').check();
  await page.locator("#zsa-gl-mix").check();
  await noEnglish(page);
  await page.goto("/gas-lab/?lang=es&mode=real&gas=Xe");
  await page.locator('input[name="zsa-gl-hold"][value="V"]').check();
  await page.fill("#zsa-gl-T-num", "200");
  await page.press("#zsa-gl-T-num", "Enter");
  await expect(page.locator("#zsa-gl-real-condensed")).toBeVisible();
  await noEnglish(page);
  // Graphs: a sweep, the data table and Copy data.
  await page.goto("/gas-lab/?lang=es&graph=vt");
  await page.getByRole("button", {name:"Hacer barrido", exact:true}).click();
  await expect(page.locator("#zsa-gl-graph-status")).toHaveText("Barrido terminado: 10 puntos.");
  await page.getByRole("button", {name:"Mostrar tabla de datos", exact:true}).click();
  await noEnglish(page);
  // Speeds: two comparisons.
  await page.getByRole("tab", {name:"Rapideces"}).click();
  await page.getByRole("button", {name:"He contra Ar", exact:true}).click();
  await noEnglish(page);
  await page.getByRole("button", {name:"300 K contra 600 K", exact:true}).click();
  await noEnglish(page);
  // Investigations: set up, a wrong pick, a hint, then the right answers and the summary.
  await page.goto("/gas-lab/?lang=es&task=boyle&tab=investigate");
  await expect(page.locator("#zsa-gl-inv-heading")).toHaveText("Compresión del gas");
  await page.getByRole("button", {name:"Preparar el laboratorio", exact:true}).click();
  await expect(page.locator("#zsa-gl-work .zsa-gl-setup p")).toHaveText("El laboratorio está listo: 0.50 mol de nitrógeno a 300 K en 6.0 L, con la temperatura constante.");
  await page.locator('#zsa-gl-work > fieldset [data-zsa-part] button[value="same"]').click();
  await expect(page.locator("#zsa-gl-work > fieldset > p").first()).toHaveText("↻ Todavía no. La rapidez no cambia, pero las partículas tienen menos espacio y chocan con las paredes más seguido.");
  await page.getByRole("button", {name:"Pista", exact:true}).click();
  await noEnglish(page);
  for (let guard = 0; guard < 20 && !(await page.locator("#zsa-gl-work section h3").count()); guard++) {
    await page.locator("#zsa-gl-work > fieldset [data-zsa-part] button:not([aria-disabled=true])").first().click();
    await noEnglish(page);
  }
  await expect(page.locator("#zsa-gl-work section h3")).toHaveText("Investigación terminada");
  await noEnglish(page);
  // Instructions and share.
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones"}).click();
  await page.getByRole("button", {name:"Compartir actividad"}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/gas-lab/?lang=es");
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("iodine-clock-lab opens in Mexican Spanish and runs every investigation in Spanish", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/iodine-clock-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio del reloj de yodo | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await noEnglish(page);
  const action = page.locator("#action");
  async function step(name) { await expect(action).toBeEnabled({timeout: 30000}); await expect(action).toHaveText(name); await action.click(); }
  // Concentration: one full trial at 4× playback.
  await page.locator("#speed").selectOption("4");
  await step("Medir KIO₃");
  await expect(page.locator("#observation")).toHaveText("Agrega 12.0 mL de agua desionizada para obtener 16.0 mL de solución A.");
  await noEnglish(page);
  await step("Agregar agua desionizada");
  await step("Agregar B e iniciar el reloj");
  await expect(page.locator("#pause")).toBeVisible({timeout: 30000});
  await page.locator("#pause").click();
  await expect(page.locator("#clock-state")).toHaveText("En pausa");
  await noEnglish(page);
  await page.locator("#pause").click();
  await expect(action).toHaveText("Preparar otro ensayo", {timeout: 30000});
  await expect(page.locator("#observation")).toHaveText("El reloj se detuvo a los 32.00 s. Ahora el yodo persiste y forma un complejo azul oscuro con el almidón.");
  await noEnglish(page);
  // Temperature: condition Solution A in the ice bath.
  await page.locator('[data-mode="temperature"]').click();
  await page.locator('[data-temp="5"]').click();
  await step("Medir KIO₃");
  await step("Agregar agua desionizada");
  await step("Acondicionar la solución A");
  await expect(page.locator("#status")).toHaveText("La solución A está a 5.0 °C.", {timeout: 30000});
  await noEnglish(page);
  // Challenge: a miss (too early), then the 20 s target.
  await page.locator('[data-mode="challenge"]').click();
  for (const [volume, status] of [["12", "Llegó 9.33 s antes. Ajusta tu siguiente mezcla."], ["6.4", "¡Reto cumplido! El reloj se puso azul cerca de los 20 s."]]) {
    await page.locator("#reset").click();
    await page.locator("#stock").fill(volume);
    await step("Medir KIO₃");
    await step("Agregar agua desionizada");
    await step("Agregar B e iniciar el reloj");
    await expect(page.locator("#status")).toHaveText(status, {timeout: 30000});
    await noEnglish(page);
  }
  await expect(page.locator("#observation")).toHaveText("El reloj se detuvo a los 20.00 s. Ahora el yodo persiste y forma un complejo azul oscuro con el almidón.");
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.locator("#instructions")).toBeVisible();
  await noEnglish(page);
  await page.locator("#close-instructions").click();
  await page.locator("#zsa-th-share-toggle").click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/iodine-clock-lab/?lang=es");
  await expect(page.locator("#zsa-th-share-email")).toHaveAttribute("href", /lang%3Des/);
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("kinetics-lab runs, pauses, compares runs and checks answers in Mexican Spanish", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.clock.install({time: new Date("2026-10-18T12:00:00")});
  await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
  await page.goto("/kinetics-lab/?lang=es&ea=2&conc=0.1&temp=600");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Simulador de cinética y teoría de colisiones | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#zsa-kn-status")).toHaveText("En marcha.");
  await noEnglish(page);
  // Instructions and the share panel, whose link keeps Spanish.
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await noEnglish(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/kinetics-lab/?lang=es");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  // Run to the end: full templates keep Spanish word order.
  for (let i = 0; i < 60 && !(await page.locator("#zsa-kn-status").textContent()).startsWith("Todo A"); i++) await page.clock.runFor(5000);
  await expect(page.locator("#zsa-kn-status")).toHaveText(/^Todo A ha reaccionado a los \d+\.\d s\. Presiona Reproducir para una corrida nueva\.$/);
  await expect(page.getByRole("img", {name:/^Gráfica de concentración contra tiempo, de 0 a \d+ s y de 0 a 0\.2 M\./})).toHaveAccessibleName(/La mitad de A se consumió a los \d+\.\d s\./);
  await noEnglish(page);
  // Play starts a new run and keeps the old one; add the catalyst, then pause.
  await page.getByRole("button", {name:"Reproducir", exact:true}).click();
  await expect(page.locator("#zsa-kn-runs li").first()).toHaveText(/^Corrida 1: 0\.10 M, 600 K, Ea 2\.0 kJ\/mol\. La mitad de A se consumió a los \d+\.\d s\.$/);
  await page.getByRole("button", {name:"Agregar un catalizador", exact:true}).click();
  await expect(page.locator("#zsa-kn-catalyst-text")).toHaveText("Hay un catalizador en la caja: la Ea baja de 2.0 a 1.0 kJ/mol.");
  await page.clock.runFor(1000);
  await page.getByRole("button", {name:"Pausar", exact:true}).click();
  await expect(page.locator("#zsa-kn-status")).toHaveText("En pausa.");
  await page.clock.runFor(100);
  await expect(page.locator("#zsa-kn-live")).toHaveText(/^En pausa a los \d+\.\d s\. \[A\] es 0\.\d\d M\. Han sido exitosas \d+ de \d+ colisiones A-B\. Recientemente, \d+ colisiones y \d+\.\d colisiones exitosas por segundo\.$/);
  await noEnglish(page);
  // Check your thinking: blank, wrong and right answers.
  await page.getByRole("button", {name:"Revisar mis respuestas", exact:true}).click();
  const fb = page.locator("#zsa-kn-feedback");
  await expect(fb.locator("p")).toHaveText(["1. Todavía no hay respuesta.", "2. Todavía no hay respuesta.", "3. Todavía no hay respuesta.", "4. Todavía no hay respuesta."]);
  await page.getByLabel("la energía de activación se hace más pequeña.").check();
  await page.getByLabel("cuatro veces más rápida.").check();
  await page.getByRole("button", {name:"Revisar mis respuestas", exact:true}).click();
  await expect(fb.locator("p").first()).toHaveText(/^1\. Todavía no\. La temperatura no cambia la Ea/);
  await expect(fb.locator("p").nth(1)).toHaveText(/^2\. ✓ Sí\. El doble de A/);
  await page.clock.runFor(100);
  await expect(page.locator("#zsa-kn-live")).toHaveText(/^Correctas: 1 de 4\./);
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("titration-lab opens in Mexican Spanish with translated interface and toggle", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/titration-lab/?lang=es&ca=0.05&va=10&ct=0.2");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Simulador virtual de titulación | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await noEnglish(page);
  await expect(page.locator("#zsa-ti-indicator-text")).toHaveText("Con fenolftaleína, la solución es incolora por debajo de pH 8.2 y rosa por encima de pH 10.0.");
  await page.locator("#zsa-ti-endpoint").click();
  await expect(page.locator("#zsa-ti-endpoint-text")).toHaveText("Agrega titulante antes de registrar un punto final.");
  await page.locator("#zsa-ti-check").click();
  await expect(page.locator("#zsa-ti-feedback p").first()).toHaveText("Volumen en el punto de equivalencia: escribe un valor.");
  await noEnglish(page);
  await page.locator("#zsa-ti-drop").click();
  await expect(page.locator("#zsa-ti-live")).toHaveText("Una gota. 0.05 mL agregados, pH 3.25, incolora.");
  await page.locator("[data-flow=drops]").click();
  await expect(page.locator("#zsa-ti-status")).toHaveText("Llave de paso abierta: gota a gota.");
  await page.locator("[data-flow=closed]").click();
  await noEnglish(page);
  await page.evaluate(() => { const b = document.querySelector("#zsa-ti-drop"); for (let i = 0; i < 70; i++) b.click(); });
  await page.locator("#zsa-ti-endpoint").click();
  await expect(page.locator("#zsa-ti-endpoint-text")).toHaveText(/^Punto final registrado a los \d+\.\d\d mL \(pH \d+\.\d\d, rosa\)\.$/);
  const inputs = page.locator("[data-question]");
  await inputs.nth(0).fill("1");
  await inputs.nth(1).fill("1");
  await page.locator("#zsa-ti-check").click();
  await expect(page.locator("#zsa-ti-feedback p").first()).toHaveText("Volumen en el punto de equivalencia: Todavía no. Busca la mitad de la parte más empinada de la curva, donde el pH cambia más con cada gota.");
  await noEnglish(page);
  await inputs.nth(0).fill("2.5");
  await inputs.nth(1).fill("4.74");
  await page.locator("#zsa-ti-check").click();
  await expect(page.locator("#zsa-ti-feedback p").nth(1)).toHaveText("pKa de HC₂H₃O₂, a partir del punto de semiequivalencia: ✓ Correcto, dentro de la precisión de la curva.");
  await page.locator("#zsa-ti-show").click();
  await expect(page.locator("#zsa-ti-show")).toHaveText("Ocultar puntos clave");
  await expect(page.locator("#zsa-ti-keypoints p").first()).toHaveText("Fenolftaleína (pH 8.2 a 10.0) cambia de color a unos 2.50 mL, a no más de 0.01 mL del punto de equivalencia, que está dentro de su intervalo. Es una buena elección.");
  await noEnglish(page);
  await page.locator("#zsa-ti-analyte").selectOption("ammonia");
  await expect(page.locator("#zsa-ti-live")).toHaveText("Nueva titulación: 10.00 mL de amoniaco 0.050 M con ácido clorhídrico 0.200 M, fenolftaleína. La bureta está llena y no se ha agregado nada.");
  await page.locator("#zsa-ti-ca").selectOption("unknown");
  await page.locator("#zsa-ti-show").click();
  await noEnglish(page);
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.locator("#zsa-header-instructions")).toBeVisible();
  await noEnglish(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/titration-lab/?lang=es");
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("chemical-bonding-lab opens in Mexican Spanish and translates every station, the instructions and sharing", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/chemical-bonding-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio de enlace químico | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("link", {name:"Todas las actividades", exact:true})).toHaveAttribute("href", "../?lang=es");
  await expect(page.locator("#station-title")).toHaveText("Apariencia");
  await expect(page.locator("#sample-badge")).toHaveText("MUESTRA DESCONOCIDA 1");
  await expect(page.locator("#observation")).toHaveText("Pasa la luz sobre el sólido. Observa el color, la textura y el brillo.");
  await noEnglish(page);
  await page.locator("#equipment-control").fill("80");
  await expect(page.locator("#observation")).toHaveText("Sólido brillante, gris plateado, con una superficie metálica reflectante.");
  await expect(page.locator("#scene-title")).toHaveText("Apariencia, muestra desconocida 1");

  // Solid conductivity: very high for Unknown 1, none for Unknown 2.
  await page.locator('[data-station="solid"]').click();
  await page.getByRole("button", {name:"Toca el sólido con las puntas", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Conductividad del sólido: muy alta. Ambas puntas tocan el sólido.");
  await expect(page.locator("#scene-content text.lcd")).toHaveText("MUY ALTA");
  await noEnglish(page);
  await page.getByRole("button", {name:"Levanta las puntas", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Las puntas están levantadas. ABIERTO significa que el circuito de prueba está incompleto.");
  await page.locator('[data-sample="2"]').click();
  await page.getByRole("button", {name:"Toca el sólido con las puntas", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Conductividad del sólido: nula. Ambas puntas tocan el sólido.");

  // In water, Unknown 2: high liquid conductivity.
  await page.locator('[data-station="water"]').click();
  for (const name of ["Pesa 0.10 g", "Mide 50.0 mL de agua", "Pasa al vaso de precipitados"]) await page.getByRole("button", {name, exact:true}).click();
  await page.getByRole("button", {name:"Agita con la varilla de vidrio", exact:true}).click();
  await page.getByRole("button", {name:"Sumerge la sonda de conductividad", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Los cristales blancos se disuelven por completo y dejan una solución transparente e incolora. Conductividad del líquido: alta. Los electrodos están sumergidos por encima de cualquier sólido sin disolver.");
  await expect(page.locator("#scene-desc")).toHaveText(/^BALANZA \/ PROBETA GRADUADA \/ VASO DE PRECIPITADOS\. Los cristales blancos/);
  await noEnglish(page);
  await page.getByRole("button", {name:"Levanta y enjuaga la sonda", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("La sonda se levantó y se enjuagó con agua desionizada. El vaso de precipitados todavía contiene la misma mezcla.");

  // In cyclohexane, Unknown 4: violet solution.
  await page.locator('[data-sample="4"]').click();
  await page.locator('[data-station="cyclohexane"]').click();
  await page.getByRole("button", {name:"Mide 5.0 mL de ciclohexano", exact:true}).click();
  await page.getByRole("button", {name:"Agrega el disolvente y una punta de espátula de sólido", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("El disolvente y una pequeña porción de la muestra desconocida 4, tomada con la punta de la espátula, están en el tubo de ensayo. Agita para mezclarlos.");
  await page.getByRole("button", {name:"Agita e inicia la observación", exact:true}).click();
  await expect(page.locator("#scene-detail")).toHaveText("Tiempo simulado a 30×");
  await noEnglish(page);
  await page.getByRole("button", {name:"Adelanta a 5:00", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Los cristales oscuros se disuelven y forman una solución violeta. Observación después de cinco minutos simulados.");
  await noEnglish(page);

  // Malleability: brittle Unknown 4, malleable Unknown 1.
  await page.locator('[data-station="malleability"]').click();
  await page.getByRole("button", {name:"Presiona con la espátula", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Los cristales oscuros se rompen en fragmentos pequeños. El sólido es quebradizo.", {timeout:5000});
  await page.locator('[data-sample="1"]').click();
  await page.getByRole("button", {name:"Presiona con el pistilo", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("El sólido se aplana en una pieza delgada en lugar de desmoronarse. Es maleable.", {timeout:5000});
  await noEnglish(page);

  // Melting: heat to 300 °C, lift, cool and dispose.
  await page.locator('[data-station="melting"]').click();
  await expect(page.locator("#sample-badge")).toHaveText("LAS CUATRO MUESTRAS DESCONOCIDAS");
  await page.getByRole("button", {name:"Coloca las cuatro porciones", exact:true}).click();
  await page.getByRole("button", {name:"Enciende la parrilla", exact:true}).click();
  await expect(page.locator("#scene-detail")).toHaveText("300 °C", {timeout:20000});
  await expect(page.locator("#observation")).toHaveText("La muestra desconocida 1 se funde cerca de 232 °C y forma un líquido brillante. La muestra desconocida 2 sigue sólida hasta 300 °C. La muestra desconocida 3 se puso café y se descompuso; la muestra desconocida 4 se fundió primero y luego se vaporizó. El papel aluminio sigue sólido. La parrilla se apagó; la charola sigue caliente.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Levanta la charola con las pinzas", exact:true}).click();
  await expect(page.locator("#scene-status")).toHaveText("La charola se enfría lejos de la parrilla");
  await expect(page.locator("#observation")).toHaveText("La charola ya se enfrió a temperatura ambiente. Desecha la charola usada para terminar esta prueba.", {timeout:20000});
  await noEnglish(page);
  await page.getByRole("button", {name:"Desecha la charola fría", exact:true}).click();
  await expect(page.locator("#observation")).toHaveText("Se desechó la charola fría. Coloca porciones nuevas para repetir la comparación.");
  await page.getByRole("button", {name:"↺ Reiniciar esta prueba", exact:true}).click();
  await page.locator(".model-note summary").click();
  await noEnglish(page);

  // Instructions and share dialogs.
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Investigación de cuatro sólidos desconocidos");
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones", exact:true}).click();
  await page.getByRole("button", {name:"Compartir", exact:true}).click();
  await expect(page.locator("#share-url")).toHaveValue("https://activities.zornscience.org/chemical-bonding-lab/?lang=es");
  await page.getByRole("button", {name:"Copiar enlace", exact:true}).click();
  await expect(page.locator("#share-status")).toHaveText(/^(Enlace copiado\.|Selecciona el enlace y cópialo con el comando para copiar de tu dispositivo\.)$/);
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar opciones para compartir", exact:true}).click();
  expect(errors).toEqual([]);
});

test("electrochemistry-lab opens in Mexican Spanish and translates the cell, playback, feedback and sharing", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/electrochemistry-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Constructor de celdas electroquímicas | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#status")).toHaveText("Lista. Avanza un paso para observar un evento de reacción balanceado, o inicia la muestra.");
  await expect(page.locator("#voltage")).toHaveText("+1.10 V");
  await expect(page.locator("#meter-help")).toHaveText("E° calculado para esta reacción: +1.10 V. Por la rama del medidor pasa una corriente despreciable; los electrones siguen el circuito de la carga o de la fuente de poder.");
  await expect(page.locator("#flow-help")).toHaveText("Electrones: Zn → carga → Cu. El K⁺ se mueve hacia el cátodo y el NO₃⁻ hacia el ánodo. Los electrones nunca cruzan el puente salino.");
  await expect(page.locator('[data-side="left"] .zsa-ec-role')).toHaveText("Ánodo · oxidación · −");
  await expect(page.locator(".zsa-ec-potential p.small em")).toHaveText("reducción");
  await noEnglish(page);
  // Instructions and share panel.
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Guía para armar tu celda");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-ec-share-url")).toHaveValue("https://activities.zornscience.org/electrochemistry-lab/?lang=es");
  const email = decodeURIComponent(await page.locator("#zsa-ec-share-email").getAttribute("href"));
  expect(email).toContain("subject=Constructor de celdas electroquímicas | ZornScience");
  expect(email).toContain("Arma celdas galvánicas y electrolíticas y explora el flujo de electrones con ZornScience.");
  expect(email).toContain("https://activities.zornscience.org/electrochemistry-lab/?lang=es");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  // One balanced event, then zinc/silver with its 1 : 2 atom ratio.
  await page.getByRole("button", {name:"Avanzar un paso", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Evento 1 de 12: se perdió 1 átomo de Zn, se depositó 1 átomo de Cu y se transfirieron 2 electrones. K⁺ y NO₃⁻ mantienen el balance de carga.");
  await expect(page.locator("#sample-counts")).toContainText("2 e⁻ transferidos");
  await expect(page.getByRole("button", {name:"Reanudar", exact:true})).toBeVisible();
  await noEnglish(page);
  await page.locator("#example").selectOption("Zn,Ag");
  await page.getByRole("button", {name:"Avanzar un paso", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Evento 1 de 12: se perdió 1 átomo de Zn, se depositaron 2 átomos de Ag y se transfirieron 2 electrones. K⁺ y NO₃⁻ mantienen el balance de carga.");
  await expect(page.locator("#sample-counts")).toContainText("2 átomos de Ag depositados");
  await page.getByRole("button", {name:"Reanudar", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Se está reproduciendo una muestra corta de partículas. Pausa para observarla, o usa Avanzar un paso.");
  await expect(page.getByRole("button", {name:"Pausar", exact:true})).toBeVisible();
  await noEnglish(page);
  await page.getByRole("button", {name:"Pausar", exact:true}).click();
  await page.getByRole("button", {name:"Reiniciar partículas", exact:true}).click();
  // Electrolytic mode: the reverse reaction needs enough applied voltage.
  await page.locator("#mode").selectOption("electrolytic");
  await expect(page.locator("#voltage")).toHaveText("−1.56 V");
  await expect(page.locator("#mode-help")).toHaveText("Impulsada en sentido inverso: energía eléctrica → química.");
  await page.locator("#power").fill("1.5"); await page.locator("#power").blur();
  await expect(page.locator("#status")).toHaveText("Ajusta el voltaje aplicado por encima de 1.56 V (hasta 10 V) para impulsar la reacción inversa.");
  await noEnglish(page);
  await page.locator("#power").fill("2"); await page.locator("#power").blur();
  await expect(page.locator("#meter-help")).toHaveText("E° calculado para esta reacción: −1.56 V. Voltaje aplicado por la fuente: 2.00 V. Por la rama del medidor pasa una corriente despreciable; los electrones siguen el circuito de la carga o de la fuente de poder.");
  await page.getByRole("button", {name:"Avanzar un paso", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Evento 1 de 12: se perdieron 2 átomos de Ag, se depositó 1 átomo de Zn y se transfirieron 2 electrones. K⁺ y NO₃⁻ mantienen el balance de carga.");
  await expect(page.locator("#flow-help")).toHaveText("Electrones: Ag → fuente de poder → Zn. El K⁺ se mueve hacia el cátodo y el NO₃⁻ hacia el ánodo. Los electrones nunca cruzan el puente salino.");
  await noEnglish(page);
  // Broken circuit feedback.
  await page.locator("#bridge").uncheck();
  await expect(page.locator("#status")).toHaveText("Puente salino desconectado: se acumularía carga y se detendría el flujo continuo de electrones. Agrega el puente para continuar.");
  await page.locator("#bridge").check();
  await page.locator("#meter").uncheck();
  await expect(page.locator("#status")).toHaveText("Completa el circuito externo para permitir el flujo de electrones. El voltímetro mide entre los dos electrodos.");
  await expect(page.locator("#voltage")).toHaveText("APAGADO");
  await noEnglish(page);
  // Build your own: clear the bench, place copper, mismatch a solution, then identical metals.
  await page.getByRole("button", {name:"Despejar la mesa", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Coloca dos metales diferentes y luego elige la solución iónica de cada uno.");
  await expect(page.locator("#sample-counts")).toHaveText("Elige semiceldas que coincidan para seguir una muestra de partículas.");
  await noEnglish(page);
  await page.locator('[data-metal="Cu"]').click();
  await expect(page.locator("#selected")).toHaveText("Metal seleccionado: cobre. Usa un botón Colocar o arrástralo a un vaso de precipitados.");
  await page.getByRole("button", {name:"Colocar Cu a la izquierda", exact:true}).click();
  await expect(page.locator('[data-side="left"] p.small')).toHaveText("Electrodo de cobre.");
  await page.getByRole("button", {name:"Colocar Cu a la derecha", exact:true}).click();
  await page.locator("#solution-left").selectOption("Cu");
  await page.locator("#solution-right").selectOption("Cu");
  await expect(page.locator("#status")).toHaveText("Dos semiceldas estándar idénticas tienen E° = 0.00 V. Elige metales diferentes para que ocurra una reacción.");
  await noEnglish(page);
  await page.locator('[data-metal="Zn"]').click();
  await page.getByRole("button", {name:"Colocar Zn a la izquierda", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Combina cada electrodo con la solución de su propio ion metálico. Este modelo no simula semiceldas que no coinciden.");
  await page.locator("#solution-left").selectOption("Zn");
  await page.locator("#bridge").check();
  await page.locator("#meter").check();
  await expect(page.locator('[data-side="left"] p.small')).toHaveText("El electrodo de zinc pierde átomos neutros; los iones pasan a la solución.");
  await expect(page.locator('[data-side="right"] p.small')).toHaveText("El electrodo de cobre gana átomos neutros; los iones salen de la solución.");
  for (let i = 0; i < 12; i++) await page.getByRole("button", {name:"Avanzar un paso", exact:true}).click();
  await expect(page.locator("#status")).toHaveText("Evento 12 de 12: se perdió 1 átomo de Zn, se depositó 1 átomo de Cu y se transfirieron 2 electrones. K⁺ y NO₃⁻ mantienen el balance de carga.");
  await expect(page.locator("#sample-counts")).toContainText("12 / 12 eventos");
  await expect(page.getByRole("button", {name:"Muestra completa", exact:true})).toBeDisabled();
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test("equilibrium-thermo-lab opens in Mexican Spanish and keeps students in Spanish on both labs", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/equilibrium-thermo-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Selección de un laboratorio de química | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("heading", {level:1})).toHaveText("Selección de tu laboratorio de química");
  await expect(page.getByRole("link", {name:"Explorador del equilibrio", exact:true})).toHaveAttribute("href", "../equilibrium-lab/?lang=es");
  await expect(page.getByRole("link", {name:"Laboratorio de calorimetría y entalpía", exact:true})).toHaveAttribute("href", "../calorimetry-lab/?lang=es");
  await expect(page.getByRole("link", {name:"← Todas las actividades", exact:true})).toHaveAttribute("href", "../?lang=es");
  await noEnglish(page);
  await page.getByRole("link", {name:"Laboratorio de calorimetría y entalpía", exact:true}).click();
  await expect(page).toHaveTitle("Laboratorio de calorimetría y entalpía | ZornScience");
  await page.goto("/equilibrium-thermo-lab/");
  await expect(page.getByRole("link", {name:"Equilibrium Sandbox", exact:true})).toHaveAttribute("href", "../equilibrium-lab/");
  expect(errors).toEqual([]);
});

test("gravimetric-lab opens in Mexican Spanish and translates every step, the result and sharing", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.clock.install();
  await page.goto("/gravimetric-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Análisis gravimétrico | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#sample")).toHaveText("Muestra desconocida A");
  await expect(page.locator("#step-counter")).toHaveText("PASO 01 / 23");
  await expect(page.locator("#step-title")).toHaveText("Preparación del crisol");
  await expect(page.locator("#scene-caption")).toHaveText("El crisol vacío está limpio, pero todavía no está seco.");
  await expect(page.locator("#bench-label")).toHaveText("Equipo de laboratorio");
  await noEnglish(page);
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.getByRole("dialog")).toContainText("Guía para usar este laboratorio");
  await expect(page.getByRole("dialog")).toContainText("Identifica la muestra desconocida: un mol de M₂CO₃ forma un mol de CaCO₃.");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/gravimetric-lab/?lang=es");
  const email = decodeURIComponent(await page.locator("#zsa-th-share-email").getAttribute("href"));
  expect(email).toContain("subject=Análisis gravimétrico | ZornScience");
  expect(email).toContain("Identifica un carbonato desconocido mediante precipitación, filtración al vacío y secado a masa constante.");
  expect(email).toContain("https://activities.zornscience.org/gravimetric-lab/?lang=es");
  await expect(page.locator("#zsa-th-share-panel")).toContainText("Comparte el laboratorio desde cero. Cada visitante empieza con una muestra desconocida nueva.");
  await noEnglish(page);
  await page.keyboard.press("Escape");
  for (let step = 0; step < 23; step++) {
    await page.locator("#action").click();
    await page.clock.fastForward(50);
    if (step === 0) {
      await expect(page.locator("#action")).toHaveText("En proceso…");
      await expect(page.locator("#observation")).toHaveText("3 minutos en el horno.");
      await expect(page.locator("#scene-caption")).toHaveText("Seca el crisol en el horno…");
    }
    await noEnglish(page);
    await page.clock.fastForward(2000);
    if (step === 7) {
      await expect(page.locator("#step-title")).toHaveText("Formación de un precipitado");
      await expect(page.locator("#bench-state")).toHaveText("PRECIPITACIÓN DE CaCO₃");
      await expect(page.locator("#step-detail")).toHaveText("Agrega 125 mL de cloruro de calcio 0.200 M. Los iones de calcio se unen a los iones carbonato y forman carbonato de calcio insoluble.");
    }
    if (step === 19) await expect(page.locator("#observation")).toHaveText("La primera pesada todavía puede incluir agua residual.");
    await noEnglish(page);
  }
  await expect(page.locator("#observation")).toHaveText("Masa constante confirmada. Usa la evidencia de la balanza para identificar la muestra desconocida.");
  await expect(page.locator("#result-text")).toContainText("Resta la masa del papel filtro (0.598 g) a la lectura final de la balanza");
  await expect(page.locator("#balance-display")).toHaveText("2.487 g");
  await page.getByRole("button", {name:"Revela la muestra desconocida", exact:true}).click();
  await expect(page.locator("#identity")).toHaveText("Carbonato de sodio (Na₂CO₃). El modelo produce 1.889 g de CaCO₃; la masa molar deducida es aproximadamente 105.99 g/mol.");
  await page.locator(".model-note summary").click();
  await expect(page.locator(".model-note")).toContainText("Se excluye el carbonato de litio");
  await noEnglish(page);
  expect(errors).toEqual([]);
});

test.describe("metals-lab with reduced motion", () => {
  test.use({reducedMotion:"reduce"});
  test("metals-lab opens in Mexican Spanish and translates every station, observation and sharing", async ({page}) => {
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.clock.install();
    await page.goto("/metals-lab/?lang=es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
    await expect(page).toHaveTitle("Metales, no metales y metaloides | ZornScience");
    await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
    await expect(page.locator("#sample-badge")).toHaveText("MUESTRA DESCONOCIDA A");
    await expect(page.locator("#scene-title")).toHaveText("Estación de apariencia, muestra desconocida A");
    await expect(page.locator("#observation")).toHaveText("Gris plateado, con un reflejo metálico brillante cuando la luz se mueve sobre la superficie.");
    await noEnglish(page);
    await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
    await expect(page.getByRole("dialog")).toContainText("Investigación de tres muestras desconocidas");
    await noEnglish(page);
    await page.keyboard.press("Escape");
    await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
    await expect(page.locator("#zsa-th-share-url")).toHaveValue("https://activities.zornscience.org/metals-lab/?lang=es");
    const email = decodeURIComponent(await page.locator("#zsa-th-share-email").getAttribute("href"));
    expect(email).toContain("subject=Laboratorio de metales, no metales y metaloides | ZornScience");
    expect(email).toContain("Explora tres sólidos desconocidos con cuatro pruebas de propiedades físicas y químicas.");
    expect(email).toContain("https://activities.zornscience.org/metals-lab/?lang=es");
    await noEnglish(page);
    await page.keyboard.press("Escape");
    // Unknown B: fracture, no current, no reaction.
    await page.locator("[data-sample=B]").click();
    await page.getByRole("button", {name:"Maleabilidad"}).click();
    await expect(page.locator("#observation")).toHaveText("Hay una porción nueva de la muestra desconocida B en el mortero. Presiona con el pistilo y observa si se aplana o se fractura.");
    await page.getByRole("button", {name:"Presiona con el pistilo", exact:true}).click();
    await page.clock.runFor(200);
    await expect(page.locator("#scene-state")).toHaveText("EL SÓLIDO SE FRACTURA");
    await expect(page.getByRole("button", {name:"Presiona otra vez", exact:true})).toBeVisible();
    await noEnglish(page);
    await page.getByRole("button", {name:"Conductividad"}).click();
    await expect(page.locator("#observation")).toHaveText("El circuito está abierto. Pon ambas puntas en contacto directo con la muestra desconocida B para probar el sólido mismo.");
    await expect(page.locator("#meter-value")).toHaveText("ABIERTO");
    await page.getByRole("button", {name:"Toca el sólido con las puntas", exact:true}).click();
    await expect(page.locator("#meter-value")).toHaveText("NULA");
    await expect(page.locator("#scene-state")).toHaveText("AMBAS PUNTAS TOCAN EL SÓLIDO");
    await noEnglish(page);
    await page.getByRole("button", {name:"Levanta las puntas", exact:true}).click();
    await expect(page.locator("#observation")).toHaveText("Las puntas están levantadas. El circuito está abierto y el conductímetro ya no detecta corriente.");
    // Unknown C: weak current.
    await page.locator("[data-sample=C]").click();
    await page.getByRole("button", {name:"Toca el sólido con las puntas", exact:true}).click();
    await expect(page.locator("#meter-value")).toHaveText("DÉBIL");
    await expect(page.locator("#observation")).toContainText("mucho menor que con la muestra desconocida A");
    await noEnglish(page);
    // Unknown A: acid, solid, pause, the full observation and the waste beaker.
    await page.locator("[data-sample=A]").click();
    await page.getByRole("button", {name:"Reacción con HCl"}).click();
    await expect(page.locator("#scene-title")).toHaveText("Estación de reacción con HCl, muestra desconocida A");
    await page.getByRole("button", {name:"1. Pipetea 3 mL de HCl", exact:true}).click();
    await expect(page.locator("#observation")).toHaveText("Pipeteando 3 mL de HCl 0.65 M en el tubo de ensayo.");
    await page.clock.runFor(200);
    await expect(page.locator("#observation")).toHaveText("El tubo de ensayo contiene 3 mL de HCl 0.65 M transparente. Agrega una porción pequeña y nueva de la muestra desconocida A.");
    await expect(page.locator("#scene-state")).toHaveText("3 mL DE HCl / LISTO PARA EL SÓLIDO");
    await page.getByRole("button", {name:"2. Agrega el sólido", exact:true}).click();
    await page.clock.runFor(200);
    await page.getByRole("button", {name:"Pausar observación", exact:true}).click();
    await expect(page.locator("#scene-state")).toHaveText("OBSERVACIÓN EN PAUSA");
    await expect(page.getByRole("button", {name:"Reanudar observación", exact:true})).toBeVisible();
    await noEnglish(page);
    await page.getByRole("button", {name:"Reanudar observación", exact:true}).click();
    await page.clock.runFor(4000);
    await expect(page.locator("#observation")).toHaveText("Se forman burbujas pequeñas en el sólido que suben por el líquido. La formación de gas es evidencia de una reacción química; el tubo empieza a calentarse.");
    await page.clock.runFor(14000);
    await expect(page.locator("#scene-state")).toHaveText("OBSERVACIÓN TERMINADA");
    await expect(page.locator("#temperature")).toHaveText("24.6 °C");
    await expect(page.locator("#observation")).toHaveText("Terminó la observación de cinco minutos. Del sólido, que se hace cada vez más pequeño, siguen subiendo burbujas de gas. La temperatura subió; el líquido sigue transparente, sin un precipitado nuevo. El sólido original no es un precipitado. Desecha la mezcla en Residuos de HCl.");
    await noEnglish(page);
    await page.getByRole("button", {name:"3. Vierte en Residuos de HCl", exact:true}).click();
    await page.clock.runFor(200);
    await expect(page.locator("#scene-state")).toHaveText("RESIDUOS RECOLECTADOS");
    await expect(page.locator("#observation")).toHaveText("El ácido y el sólido restante están en Residuos de HCl. El tubo está vacío. Puedes empezar con un tubo nuevo, elegir otra prueba o investigar otra muestra desconocida.");
    await noEnglish(page);
    await page.getByRole("button", {name:"Tubo nuevo", exact:true}).click();
    await expect(page.locator("#scene-state")).toHaveText("TUBO VACÍO");
    await page.locator(".model-note summary").click();
    await expect(page.locator(".model-note")).toContainText("Un sólido brillante no siempre es un metal");
    await noEnglish(page);
    expect(errors).toEqual([]);
  });
});

test("net-ionic-lab opens in Mexican Spanish and translates mixing, observations, the chemistry and sharing", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.clock.install();
  await page.goto("/net-ionic-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Laboratorio de reacciones iónicas netas | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#mixture-title")).toHaveText("Cloruro de sodio + Sulfato de cobre(II)");
  await expect(page.locator("#phase")).toHaveText("Listo para mezclar");
  await expect(page.locator("#progress")).toHaveText("El vaso de precipitados está vacío. Todo listo para agregar los reactivos.");
  await expect(page.locator("#observation-text")).toHaveText("Cloruro de sodio: una solución transparente e incolora. Sulfato de cobre(II): una solución azul transparente.");
  await expect(page.locator("#apparatus")).toContainText("VASO DE PRECIPITADOS PARA LA REACCIÓN");
  await noEnglish(page);
  // A mixture with no reaction.
  await page.getByRole("button", {name:"Mezclar reactivos", exact:true}).click();
  await page.clock.runFor(1000);
  await expect(page.locator("#phase")).toHaveText("Agregando cloruro de sodio");
  await expect(page.locator("#progress")).toHaveText("Agregando cloruro de sodio.");
  await noEnglish(page);
  await page.clock.runFor(3500);
  await expect(page.locator("#phase")).toHaveText("Agregando sulfato de cobre(II)");
  await page.clock.runFor(4000);
  await expect(page.locator("#phase")).toHaveText("Mezclado");
  await expect(page.locator("#observation-title")).toHaveText("Después de mezclar");
  await expect(page.locator("#observation-text")).toHaveText("La mezcla se mantiene transparente y azul, más pálida que la solución original de sulfato de cobre(II). No aparece ningún precipitado.");
  await page.locator("#chemistry summary").click();
  await expect(page.locator("#equation")).toHaveText("No hay reacción iónica neta.");
  await noEnglish(page);
  // The zinc trial: metal displacement.
  await page.locator('[data-trial="1"]').click();
  await expect(page.locator("#observation-text")).toHaveText("Zinc: una tira de metal gris plateado. Nitrato de plomo(II): una solución transparente e incolora.");
  await expect(page.locator("#apparatus")).toContainText("Zn · tira de metal");
  await page.getByRole("button", {name:"Mezclar reactivos", exact:true}).click();
  await page.clock.runFor(4000);
  await expect(page.locator("#phase")).toHaveText("Bajando la tira de zinc");
  await noEnglish(page);
  await page.clock.runFor(4000);
  await expect(page.locator("#progress")).toHaveText("Tiempo de reacción acelerado: el plomo se depositó sobre el zinc.");
  await expect(page.locator("#equation")).toHaveText("Zn(s) + Pb²⁺(aq) → Zn²⁺(aq) + Pb(s)");
  await noEnglish(page);
  // A precipitate that settles.
  await page.locator('[data-trial="2"]').click();
  await page.getByRole("button", {name:"Mezclar reactivos", exact:true}).click();
  await page.clock.runFor(8000);
  await expect(page.locator("#progress")).toHaveText("Observa el líquido y busca sólido en suspensión.");
  await page.clock.runFor(6000);
  await expect(page.locator("#phase")).toHaveText("Asentándose…");
  await expect(page.locator("#progress")).toHaveText("El precipitado se hunde y deja arriba un líquido más transparente.");
  await page.clock.runFor(4000);
  await expect(page.locator("#phase")).toHaveText("Asentado");
  await expect(page.locator("#progress")).toHaveText("El sólido se juntó en el fondo del vaso de precipitados. El tiempo de asentamiento está acelerado.");
  await page.locator("#chemistry summary").click();
  await expect(page.locator("#explanation")).toHaveText("El cloruro de plata tiene una solubilidad muy baja. Los iones de sodio y los iones nitrato permanecen en solución.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Reiniciar mezcla", exact:true}).click();
  await expect(page.locator("#phase")).toHaveText("Listo para mezclar");
  // Every mixture name and observation is translated.
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-trial="' + i + '"]').click();
    await page.getByRole("button", {name:"Mezclar reactivos", exact:true}).click();
    await page.clock.runFor(8000);
    await page.locator("#chemistry summary").click();
    await noEnglish(page);
  }
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.locator("#help")).toContainText("Guía para usar este laboratorio");
  await expect(page.locator("#help li").first()).toHaveText("Elige una reacción en Elige una mezcla.");
  await expect(page.locator("#help li strong").nth(1)).toHaveText("Mezclar reactivos");
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones", exact:true}).click();
  await page.getByRole("button", {name:"Compartir", exact:true}).click();
  await expect(page.locator("#share-url")).toHaveValue("https://activities.zornscience.org/net-ionic-lab/?lang=es");
  const email = decodeURIComponent(await page.locator("#email").getAttribute("href"));
  expect(email).toBe("mailto:?subject=Laboratorio de reacciones iónicas netas&body=https://activities.zornscience.org/net-ionic-lab/?lang=es");
  await expect(page.locator("#share-dialog")).toContainText("Comparte el laboratorio desde cero con tu grupo.");
  await page.getByRole("button", {name:"Copiar enlace", exact:true}).click();
  await expect(page.locator("#share-status")).toHaveText(/^(Enlace copiado\.|Selecciona y copia el enlace de la actividad\.)$/);
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar opciones para compartir", exact:true}).click();
  expect(errors).toEqual([]);
});

test("redox-coach opens in Mexican Spanish and translates every step, feedback, instructions and sharing", async ({page}) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const feedback = page.locator("#zsa-rx-feedback"), heading = page.locator("#zsa-rx-title");
  const check = () => page.getByRole("button", {name:"Revisar respuesta", exact:true}).click();
  const place = async (f, kind, type, where) => {
    await page.getByRole("button", {name:"Seleccionar el " + kind + " " + f, exact:true}).click();
    await page.getByRole("button", {name:"Colocar la especie seleccionada en los " + where + " de la " + type, exact:true}).click();
  };
  const add = async (group, f, n) => {
    for (let i = 0; i < n; i++) await page.getByRole("group", {name:group, exact:true}).getByRole("button", {name:"Agregar " + f, exact:true}).click();
  };
  await page.goto("/redox-coach/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle("Práctica de balanceo de semirreacciones redox | ZornScience");
  await expect(page.getByRole("link", {name:"ES Español", exact:true})).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("link", {name:"Todas las actividades", exact:true})).toHaveAttribute("href", "../?lang=es");
  await expect(page.locator("#zsa-rx-medium")).toHaveText("Medio ácido");
  await expect(page.locator("#zsa-rx-problem option").first()).toHaveText("Permanganato y hierro (ácido)");
  await expect(heading).toHaveText("Paso 1: Separación en semirreacciones");
  await noEnglish(page);

  // Step 1: wrong, then right.
  await check();
  await expect(feedback).toHaveText("Coloca cada reactivo y cada producto en una semirreacción.");
  await place("MnO4-", "reactivo", "oxidación", "reactivos");
  await expect(feedback).toHaveText("Colocaste la especie en los reactivos de la oxidación.");
  await place("Fe2+", "reactivo", "reducción", "reactivos");
  await place("Mn2+", "producto", "oxidación", "productos");
  await place("Fe3+", "producto", "reducción", "productos");
  await expect(page.locator("#zsa-rx-stage")).toContainText("Ya colocaste todas las especies. Revisa tus semirreacciones.");
  await check();
  await expect(feedback).toHaveText("Junta las especies del mismo elemento que cambia. Si el número de oxidación aumenta, hay oxidación.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Seleccionar el reactivo MnO4-", exact:true}).click();
  await expect(feedback).toHaveText("Seleccionaste MnO4-. Elige un destino.");
  await page.getByRole("button", {name:"Colocar la especie seleccionada en los reactivos de la reducción", exact:true}).click();
  await page.getByRole("button", {name:"Seleccionar el reactivo Fe2+", exact:true}).click();
  await page.getByRole("button", {name:"Colocar la especie seleccionada en los reactivos de la oxidación", exact:true}).click();
  await page.getByRole("button", {name:"Seleccionar el producto Mn2+", exact:true}).click();
  await page.getByRole("button", {name:"Colocar la especie seleccionada en los productos de la reducción", exact:true}).click();
  await page.getByRole("button", {name:"Seleccionar el producto Fe3+", exact:true}).click();
  await page.getByRole("button", {name:"Colocar la especie seleccionada en los productos de la oxidación", exact:true}).click();
  await check();
  await expect(feedback).toHaveText("Verificado. Sigue con el siguiente paso.");

  // Step 2: mass balance.
  await expect(heading).toHaveText("Paso 2: Balance de masa: O y H");
  await expect(page.getByRole("group", {name:"Reactivos de la reducción", exact:true})).toContainText("Átomos: Mn 1, O 4");
  await check();
  await expect(feedback).toHaveText("Revisa tus átomos de oxígeno en la semirreacción de reducción.");
  await noEnglish(page);
  await add("Productos de la reducción", "H2O", 4);
  await add("Productos de la reducción", "H+", 1);
  await check();
  await expect(feedback).toHaveText("Revisa tus átomos de hidrógeno en la semirreacción de reducción.");
  await page.getByRole("button", {name:"Deshacer la última acción", exact:true}).click();
  await expect(feedback).toHaveText("Se deshizo la última acción.");
  await add("Reactivos de la reducción", "H+", 8);
  await check();

  // Step 3: charge balance.
  await expect(heading).toHaveText("Paso 3: Balance de carga: electrones");
  await expect(page.getByRole("group", {name:"Reactivos de la reducción", exact:true})).toContainText("Carga total: +7");
  await check();
  await expect(feedback).toHaveText("La carga no está balanceada en la semirreacción de oxidación. Cada electrón aporta −1.");
  await noEnglish(page);
  await add("Productos de la oxidación", "e-", 1);
  await add("Reactivos de la reducción", "e-", 5);
  await check();

  // Step 4: multipliers.
  await expect(heading).toHaveText("Paso 4: Igualación de electrones");
  await page.getByLabel("Multiplicador de la oxidación", {exact:true}).fill("0");
  await expect(page.locator("#zsa-rx-stage")).toContainText("Escribe un número entero positivo.");
  await check();
  await expect(feedback).toHaveText("Usa multiplicadores enteros positivos del 1 al 10000.");
  await noEnglish(page);
  await page.getByLabel("Multiplicador de la oxidación", {exact:true}).fill("1");
  await check();
  await expect(feedback).toHaveText("El número de electrones debe coincidir. Prueba con su mínimo común múltiplo.");
  await page.getByLabel("Multiplicador de la oxidación", {exact:true}).fill("5");
  await check();

  // Step 5: cancel.
  await expect(heading).toHaveText("Paso 5: Suma y cancelación");
  await check();
  await expect(feedback).toHaveText("Cancela todos los electrones antes de continuar.");
  await page.getByRole("button", {name:"Modo cancelar: ACTIVADO", exact:true}).click();
  await page.getByRole("button", {name:"5 e- a la izquierda", exact:true}).click();
  await expect(feedback).toHaveText("Primero activa el modo cancelar.");
  await page.getByRole("button", {name:"Modo cancelar: DESACTIVADO", exact:true}).click();
  await noEnglish(page);
  await page.getByRole("button", {name:"5 e- a la izquierda", exact:true}).click();
  await expect(feedback).toHaveText("Seleccionaste un término. Elige su pareja.");
  await expect(page.locator("#zsa-rx-stage")).toContainText("Seleccionaste un término. Elige su pareja o selecciónalo otra vez para quitar la selección.");
  await page.getByRole("button", {name:"5 e- a la derecha", exact:true}).click();
  await expect(feedback).toHaveText("Cancelaste 5 e- de cada lado. Lo que sobra se queda en la ecuación.");
  await check();
  await expect(heading).toHaveText("¡Lo lograste! Balanceaste la reacción.");
  await expect(feedback).toHaveText("Todo está correcto. ¡Balanceaste la reacción!");
  await expect(page.locator("#zsa-rx-stage")).toContainText("Relación de números enteros más pequeños. Carga total: 17 en ambos lados. Completaste el método de semirreacciones.");
  await noEnglish(page);

  // Basic medium: step 6.
  await page.locator("#zsa-rx-problem").selectOption("1");
  await expect(page.locator("#zsa-rx-medium")).toHaveText("Medio básico");
  await place("MnO4-", "reactivo", "reducción", "reactivos");
  await place("I-", "reactivo", "oxidación", "reactivos");
  await place("MnO2", "producto", "reducción", "productos");
  await place("I2", "producto", "oxidación", "productos");
  await check();
  await add("Productos de la reducción", "H2O", 2);
  await add("Reactivos de la reducción", "H+", 4);
  await check();
  await add("Productos de la oxidación", "e-", 2);
  await add("Reactivos de la reducción", "e-", 3);
  await check();
  await page.getByLabel("Multiplicador de la oxidación", {exact:true}).fill("3");
  await page.getByLabel("Multiplicador de la reducción", {exact:true}).fill("2");
  await check();
  await page.getByRole("button", {name:"6 e- a la izquierda", exact:true}).click();
  await page.getByRole("button", {name:"6 e- a la derecha", exact:true}).click();
  await check();
  await expect(heading).toHaveText("Paso 6: Ajuste para medio básico");
  await expect(page.locator("#zsa-rx-instruction")).toHaveText("Agrega 8 OH⁻ a CADA lado y luego revisa. Así se conserva la carga.");
  await check();
  await expect(feedback).toHaveText("Agrega exactamente 8 OH⁻ a CADA lado.");
  await expect(page.getByRole("button", {name:"Agregar OH⁻ a la izquierda (0/8)", exact:true})).toBeVisible();
  await noEnglish(page);
  for (let i = 0; i < 8; i++) await page.getByRole("button", {name:/^Agregar OH⁻ a la izquierda/}).click();
  for (let i = 0; i < 8; i++) await page.getByRole("button", {name:/^Agregar OH⁻ a la derecha/}).click();
  await check();
  await expect(page.locator("#zsa-rx-instruction")).toHaveText("Selecciona H⁺ y OH⁻ del MISMO lado para formar H₂O y luego revisa.");
  await expect(page.locator("#zsa-rx-stage")).toContainText("Modo combinar: H⁺ + OH⁻ → H₂O");
  await page.getByRole("button", {name:"8 H+ a la izquierda", exact:true}).click();
  await page.getByRole("button", {name:"8 OH- a la derecha", exact:true}).click();
  await expect(feedback).toHaveText("Junta H⁺ con OH⁻ del MISMO lado.");
  await page.getByRole("button", {name:"8 OH- a la izquierda", exact:true}).click();
  await expect(feedback).toHaveText("Se formaron 8 H₂O a partir de H⁺ y OH⁻ a la izquierda.");
  await noEnglish(page);
  await check();
  await expect(page.locator("#zsa-rx-instruction")).toHaveText("Cancela el exceso de agua a ambos lados de la flecha y luego revisa la ecuación final.");
  await check();
  await expect(feedback).toHaveText("Cancela el agua o cualquier otra especie que esté en ambos lados.");
  await page.getByRole("button", {name:"8 H2O a la izquierda", exact:true}).click();
  await page.getByRole("button", {name:"4 H2O a la derecha", exact:true}).click();
  await check();
  await expect(page.locator("#zsa-rx-stage")).toContainText("Relación de números enteros más pequeños. Carga total: -8 en ambos lados. No queda H⁺ en esta ecuación en medio básico.");
  await noEnglish(page);

  // Instructions and share.
  await page.getByRole("button", {name:"Instrucciones", exact:true}).click();
  await expect(page.getByRole("dialog", {name:"Guía para usar la práctica de balanceo redox"})).toBeVisible();
  await expect(page.locator("#zsa-rx-instructions li").nth(3)).toHaveText("Multiplica semirreacciones completas para igualar los electrones.");
  await noEnglish(page);
  await page.getByRole("button", {name:"Cerrar instrucciones", exact:true}).click();
  await page.getByRole("button", {name:"Compartir actividad", exact:true}).click();
  await expect(page.locator("#zsa-rx-share-url")).toHaveValue("https://activities.zornscience.org/redox-coach/?lang=es");
  const email = decodeURIComponent(await page.locator("#zsa-rx-share-email").getAttribute("href"));
  expect(email).toContain("subject=Práctica de balanceo de semirreacciones redox | ZornScience");
  expect(email).toContain("Balancea semirreacciones redox paso a paso en medio ácido o básico con ZornScience.");
  expect(email).toContain("https://activities.zornscience.org/redox-coach/?lang=es");
  await expect(page.locator("#zsa-rx-share-facebook")).toHaveAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://activities.zornscience.org/redox-coach/?lang=es"));
  await noEnglish(page);
  expect(errors).toEqual([]);
});

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
  for (const slug of Object.keys(activities).concat(Object.keys(labs))) {
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
