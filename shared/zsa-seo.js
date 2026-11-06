(function () {
  "use strict";
  // Search engine tags for activities.zornscience.org: the meta description of every indexed page in English and,
  // for pages with Mexican Spanish, in Spanish. This file is the single source. tools/build-seo.js writes into each
  // page the English description, the hreflang links (en, es = ?lang=es, x-default) and, on English-only pages, a
  // static canonical; it also writes sitemap.xml. The browser part below sets the canonical on bilingual pages
  // (the clean URL, plus ?lang=es in Spanish, never state, embed or from= parameters) and the Spanish description.
  // Both languages are one HTML file, so a static canonical would point the Spanish page at the English one.
  var ORIGIN = "https://activities.zornscience.org/";
  // Folder ("" is the landing page): en, and es when the page has Spanish. 100 to 160 characters each.
  var PAGES = {
    "": {
      en: "Free chemistry and physics practice from ZornScience: virtual labs, simulations, AP Chemistry and ACT practice, in English and Spanish.",
      es: "Práctica gratuita de química y física de ZornScience: laboratorios virtuales, simulaciones y práctica de Química AP, en inglés y español."},
    "act": {
      en: "Free ACT practice with original English, Math, Reading and Science questions, score estimates and tips for the skills you missed, from ZornScience."},
    "act-question-generator": {
      en: "Practice one ACT-style question at a time. Choose English, Math, or Science from 1,200 original questions, with answers and explanations."},
    "check": {
      en: "Check the completion codes students paste into Google Classroom. Runs in your browser; nothing is sent anywhere."},
    "apchem-unit1-practice": {
      en: "Catch up on AP Chemistry Unit 1 with 48 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 1 de Química AP con 48 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "apchem-unit2-practice": {
      en: "Catch up on AP Chemistry Unit 2 with 42 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 2 de Química AP con 42 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "apchem-unit3-practice": {
      en: "Catch up on AP Chemistry Unit 3 with 78 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 3 de Química AP con 78 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "apchem-unit4-practice": {
      en: "Catch up on AP Chemistry Unit 4 with 54 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 4 de Química AP con 54 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "apchem-unit5-practice": {
      en: "Catch up on AP Chemistry Unit 5 with 66 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 5 de Química AP con 66 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "apchem-unit6-practice": {
      en: "Catch up on AP Chemistry Unit 6 with 54 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 6 de Química AP con 54 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "apchem-unit7-practice": {
      en: "Catch up on AP Chemistry Unit 7 with 72 original questions, instant explanations, and English or Spanish practice from ZornScience.",
      es: "Ponte al día en la unidad 7 de Química AP con 72 preguntas originales, explicaciones al instante y práctica en inglés o español de ZornScience."},
    "atwood-machine": {
      en: "Explore Newton’s second law with a realistic ideal Atwood machine, adjustable brass masses and live vectors.",
      es: "Explora la segunda ley de Newton con una máquina de Atwood ideal y realista, masas de latón ajustables y vectores en vivo."},
    "beers-law-lab": {
      en: "Measure standards with a virtual spectrophotometer, build a Beer's law calibration curve, and find the concentration of a random unknown, from ZornScience.",
      es: "Mide estándares con un espectrofotómetro virtual, construye una curva de calibración de la ley de Beer y encuentra la concentración de una muestra desconocida."},
    "calorimetry-lab": {
      en: "Measure heat transfer with heated metals and acid-base neutralization, live temperature traces, and energy-balance calculations.",
      es: "Mide la transferencia de calor con metales calientes y neutralización ácido-base, curvas de temperatura en vivo y cálculos de balance de energía."},
    "chemical-bonding-lab": {
      en: "Investigate four unknown solids with realistic lab equipment. Compare conductivity, melting, solubility and malleability to explore chemical bonding.",
      es: "Investiga cuatro sólidos desconocidos con equipo de laboratorio. Compara conductividad, fusión, solubilidad y maleabilidad para explorar el enlace químico."},
    "circuit-builder": {
      en: "Build circuits with batteries, wires, resistors, switches and bulbs, then probe voltage and current with a multimeter, from ZornScience.",
      es: "Construye circuitos con baterías, cables, resistencias, interruptores y focos, y luego mide el voltaje y la corriente con un multímetro, de ZornScience."},
    "collision-carts": {
      en: "Explore conservation of momentum with realistic dynamics carts, elastic and inelastic collisions, and live vectors.",
      es: "Explora la conservación de la cantidad de movimiento con carritos de dinámica realistas, colisiones elásticas e inelásticas y vectores en vivo."},
    "electrochemistry-lab": {
      en: "Build galvanic and electrolytic cells, trace electron flow from anode to cathode, and calculate standard cell potentials in a free virtual lab.",
      es: "Construye celdas galvánicas y electrolíticas, sigue los electrones del ánodo al cátodo y calcula potenciales estándar de celda en un laboratorio virtual."},
    "equilibrium-k-lab": {
      en: "Write equilibrium expressions, compare Q with K, build equilibrium tables step by step, and use Ksp to explore molar solubility in a free virtual lab.",
      es: "Escribe expresiones de equilibrio, compara Q con K, construye tablas de equilibrio paso a paso y usa Ksp para explorar la solubilidad molar."},
    "equilibrium-lab": {
      en: "Explore Le Chatelier’s principle with concentration, volume and temperature changes, live concentration graphs, and Kc and Qc.",
      es: "Explora el principio de Le Châtelier con cambios de concentración, volumen y temperatura, gráficas de concentración en vivo, y Kc y Qc."},
    "equipotential-lab": {
      en: "Explore electric potential with movable point charges, a virtual voltmeter, smooth equipotential lines and electric field vectors.",
      es: "Explora el potencial eléctrico con cargas puntuales móviles, un voltímetro virtual, líneas equipotenciales y vectores del campo eléctrico."},
    "faraday-lab": {
      en: "Drop a neodymium magnet through a copper tube, compare it with free fall, and see the eddy currents and induced magnetic fields that slow it down.",
      es: "Deja caer un imán de neodimio por un tubo de cobre, compáralo con la caída libre y observa las corrientes parásitas y los campos inducidos que lo frenan."},
    "flame-test-lab": {
      en: "Explore the flame colors of eight metal salts and a mystery sample in the ZornScience virtual flame test lab.",
      es: "Explora los colores de la llama de ocho sales metálicas y una muestra misteriosa en el laboratorio virtual de prueba de la llama de ZornScience."},
    "free-energy-lab": {
      en: "Explore how enthalpy, entropy and temperature set Gibbs free energy, then connect it to K, dissolving and coupled reactions in a free virtual lab.",
      es: "Explora cómo la entalpía, la entropía y la temperatura determinan la energía libre de Gibbs, y relaciónala con K, la disolución y las reacciones acopladas."},
    "gas-lab": {
      en: "A gas particle simulation with a movable piston, live pressure, gas law graphs, Maxwell-Boltzmann speed distributions, mixtures and real gases.",
      es: "Simulación de partículas de gas con un pistón móvil, presión en vivo, gráficas de las leyes de los gases, distribuciones de rapidez, mezclas y gases reales."},
    "gas-laws": {
      en: "Explore four gas laws with a particle model, locked variables and a live graph. An English and Spanish ZornScience activity.",
      es: "Explora cuatro leyes de los gases con un modelo de partículas, variables fijas y una gráfica en vivo. Una actividad de ZornScience en inglés y español."},
    "gravimetric-lab": {
      en: "Identify an unknown metal carbonate in a virtual gravimetric analysis lab: form a precipitate, filter, dry and weigh it, then calculate the metal.",
      es: "Identifica un carbonato metálico desconocido en un laboratorio virtual de análisis gravimétrico: forma un precipitado, fíltralo, sécalo, pésalo y calcula."},
    "hookes-law-lab": {
      en: "Explore spring extension and simple harmonic motion with slotted masses, a virtual ruler, and a live position graph.",
      es: "Explora el estiramiento de un resorte y el movimiento armónico simple con pesas ranuradas, una regla virtual y una gráfica de posición en vivo."},
    "inclined-plane": {
      en: "Tilt an adjustable ramp, watch live force vectors, and find where static friction gives way to kinetic friction in a free virtual physics lab.",
      es: "Inclina una rampa ajustable, observa los vectores de fuerza en vivo y encuentra dónde la fricción estática da paso a la cinética en un laboratorio virtual."},
    "iodine-clock-lab": {
      en: "Prepare and mix an iodine clock reaction. Explore concentration, temperature, and a 20-second challenge on a realistic virtual lab bench.",
      es: "Prepara y mezcla una reacción de reloj de yodo. Explora la concentración, la temperatura y un reto de 20 segundos en una mesa de laboratorio virtual."},
    "ion-charge-trainer": {
      en: "Practice predicting the charge of the ion each element forms from its valence electrons, with step-by-step hints and feedback after every answer.",
      es: "Practica cómo predecir la carga del ion que forma cada elemento a partir de sus electrones de valencia, con pistas paso a paso y retroalimentación."},
    "ionic-reactions": {
      en: "Choose synthesis, decomposition, single replacement or double replacement practice, then predict products and balance equations, from ZornScience.",
      es: "Elige práctica de síntesis, descomposición, sustitución simple o sustitución doble, y luego predice los productos y balancea las ecuaciones, de ZornScience."},
    "kinetics-lab": {
      en: "Watch particles collide in a box, change temperature, concentration and activation energy, add a catalyst, and follow the reaction rate live.",
      es: "Observa partículas que chocan en una caja, cambia la temperatura, la concentración y la energía de activación, agrega un catalizador y sigue la velocidad."},
    "lewis-vsepr": {
      en: "Build Lewis structures step by step and predict molecular shape, bond angle and polarity with hints and feedback.",
      es: "Construye estructuras de Lewis paso a paso y predice la geometría molecular, el ángulo de enlace y la polaridad con pistas y retroalimentación."},
    "limiting-reactant": {
      en: "Pick starting moles of two reactants, watch the molecules pair up into products, and see which reactant runs out and how much is left over.",
      es: "Elige los moles iniciales de dos reactivos, observa cómo las moléculas forman productos y ve qué reactivo se agota primero y cuánto sobra del otro."},
    "metals-lab": {
      en: "Investigate three unknown solids with realistic lab equipment. Explore luster, malleability, conductivity, and reactions with hydrochloric acid.",
      es: "Investiga tres sólidos desconocidos con equipo de laboratorio. Explora el brillo, la maleabilidad, la conductividad y la reacción con ácido clorhídrico."},
    "net-ionic-lab": {
      en: "Mix ten pairs of reagents on a virtual lab bench and observe precipitates, metal displacement and mixtures with no visible reaction.",
      es: "Mezcla diez pares de reactivos en una mesa de laboratorio virtual y observa precipitados, desplazamiento de metales y mezclas sin reacción visible."},
    "pendulum-lab": {
      en: "Explore oscillations and energy with a realistic pendulum apparatus on Earth, the Moon, Jupiter and in zero gravity.",
      es: "Explora las oscilaciones y la energía con un péndulo realista en la Tierra, la Luna, Júpiter y en gravedad cero."},
    "periodic-table": {
      en: "An interactive periodic table of all 118 elements with heatmaps for atomic radius, electronegativity and ionization energy, from ZornScience.",
      es: "Una tabla periódica interactiva de los 118 elementos con mapas de color para el radio atómico, la electronegatividad y la energía de ionización."},
    "periodic-trends": {
      en: "Practice periodic trends: compare atomic radius, electronegativity and first ionization energy for pairs of elements, from ZornScience.",
      es: "Practica las tendencias periódicas: compara el radio atómico, la electronegatividad y la primera energía de ionización de pares de elementos."},
    "ph-buffer-lab": {
      en: "Explore pH, design buffers and compare buffer capacity with water in the interactive ZornScience pH and Buffer Lab.",
      es: "Explora el pH, diseña soluciones amortiguadoras y compara su capacidad amortiguadora con la del agua en el laboratorio interactivo de ZornScience."},
    "physics-graphing-lab": {
      en: "Predict, observe and explain one-dimensional motion with a moving cart and linked position, velocity and acceleration graphs, from ZornScience.",
      es: "Predice, observa y explica el movimiento en una dimensión con un carrito y gráficas enlazadas de posición, velocidad y aceleración, de ZornScience."},
    "polyatomic-ion-trainer": {
      en: "Flip flashcards or play a multiple-choice challenge using the 17 shaded ions from your classroom chart.",
      es: "Voltea tarjetas de estudio o juega un reto de opción múltiple con los 17 iones sombreados de la tabla de tu salón."},
    "projectile-lab": {
      en: "Fire a cannon from any height, angle and speed, and watch live velocity and acceleration vectors on the projectile, from ZornScience.",
      es: "Dispara un cañón desde cualquier altura, ángulo y rapidez, y observa los vectores de velocidad y aceleración del proyectil en vivo, de ZornScience."},
    "reaction-energy-lab": {
      en: "Build energy diagrams, explore phase changes, and calculate reaction enthalpy from bond energies, enthalpies of formation and Hess's law.",
      es: "Construye diagramas de energía, explora cambios de fase y calcula la entalpía de reacción con energías de enlace, entalpías de formación y la ley de Hess."},
    "redox-coach": {
      en: "Balance redox half-reactions one step at a time in acidic or basic media with manual atom balancing, electron transfer and cancellation.",
      es: "Balancea semirreacciones redox paso a paso en medio ácido o básico, con balanceo manual de átomos, transferencia de electrones y cancelación."},
    "scientific-calculator": {
      en: "Build calculator confidence with a free scientific calculator and six guided exercises on exponents, roots, logarithms and order of operations.",
      es: "Gana confianza con una calculadora científica gratuita y seis ejercicios guiados de exponentes, raíces, logaritmos y orden de las operaciones."},
    "snells-law-lab": {
      en: "Explore Snell’s law with a realistic laser, optical blocks, a snapping protractor, and total internal reflection.",
      es: "Explora la ley de Snell con un láser realista, bloques ópticos, un transportador que se alinea solo y la reflexión interna total."},
    "solutions-lab": {
      en: "Make solutions, dilute stock solutions and explore solubility curves in the ZornScience Solutions Lab.",
      es: "Prepara soluciones, diluye soluciones concentradas y explora curvas de solubilidad en el laboratorio de soluciones de ZornScience."},
    "standing-waves-lab": {
      en: "Create harmonics on a vibrating string, freeze them with a synchronized strobe, and measure node spacing to find the wavelength and wave speed.",
      es: "Crea armónicos en una cuerda que vibra, congélalos con una luz estroboscópica sincronizada y mide la distancia entre nodos para hallar la longitud de onda."},
    "stoichiometry-coach": {
      en: "Build conversion factors, cancel units and solve stoichiometry problems with guided feedback, from ZornScience.",
      es: "Plantea factores de conversión, cancela unidades y resuelve problemas de estequiometría con retroalimentación guiada, de ZornScience."},
    "titration-lab": {
      en: "Titrate strong and weak acids and bases with a virtual burette, pH meter and indicators, then find the equivalence point and pKa on the pH curve.",
      es: "Titula ácidos y bases fuertes y débiles con una bureta virtual, un medidor de pH e indicadores, y encuentra el punto de equivalencia y el pKa."},
    "virtual-lab-graphing": {
      en: "Turn your lab data into a scatter plot with a line of best fit. Label axes, explore slope, and download a graph for your lab write-up.",
      es: "Convierte tus datos de laboratorio en una gráfica de dispersión con línea de mejor ajuste. Rotula los ejes, explora la pendiente y descarga la gráfica."}
  };
  function url(folder, lang) { return ORIGIN + (folder ? folder + "/" : "") + (lang === "es" ? "?lang=es" : ""); }
  var api = {pages: PAGES, url: url, origin: ORIGIN, bilingual: function (folder) { return !!(PAGES[folder] && PAGES[folder].es); }};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  var folder = window.location.pathname.split("/")[1] || "", page = PAGES[folder];
  if (folder === "index.html") folder = "", page = PAGES[""];
  if (!page || !page.es) return; // English-only pages carry a static canonical
  var canonical = document.createElement("link");
  canonical.rel = "canonical";
  document.head.appendChild(canonical);
  var description = document.querySelector('meta[name="description"]');
  function render(lang) {
    canonical.href = url(folder, lang);
    if (description) description.setAttribute("content", page[lang]);
  }
  // Bilingual pages open in Spanish with ?lang=es, and switching language in place changes the page language.
  render(new URLSearchParams(window.location.search).get("lang") === "es" ? "es" : "en");
  new MutationObserver(function () { render(/^es\b/.test(document.documentElement.lang) ? "es" : "en"); })
    .observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
}());
