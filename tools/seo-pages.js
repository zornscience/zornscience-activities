// Search engine data for every page on activities.zornscience.org: the meta description in English and, for pages
// with a Mexican Spanish version (?lang=es), in Spanish. tools/build-seo.js writes these into each page's head with
// the canonical and hreflang links, and builds sitemap.xml and robots.txt. Edit descriptions here, never in the pages.
// Descriptions are 110 to 160 characters, plain and student-facing, and name the topic and what the student does.
// Keys are folder names; "" is the landing page. es: null = English only. sitemap: false = left out of sitemap.xml.
// spanishPending: true = the page has Spanish text that is not yet proofread, so it is listed as English only for now.
"use strict";
module.exports = {
  "osmosis-lab": {
    en: "Soak potato cores in sucrose solutions, weigh them, graph percent change in mass and find the isotonic point in this grade 9 Biology lab.",
    es: "Remoja cilindros de papa en soluciones de sacarosa, pésalos, grafica el cambio porcentual de masa y encuentra el punto isotónico."
  },
  "population-sampling-lab": {
    en: "Estimate hidden plant and fish populations with quadrats and mark and recapture. Compare random samples, sample sizes and bias in this Biology lab.",
    es: "Estima poblaciones ocultas de plantas y peces con cuadrantes y captura y recaptura. Compara muestras al azar, tamaños y sesgo en este laboratorio."
  },
  "mitosis-lab": {
    en: "Find dividing cells in an onion root tip under a virtual microscope. Tally the phases of mitosis and turn your counts into time in this Biology lab.",
    // English only until the Spanish in mitosis-lab/data.js is proofread (FLAGS.spanishToggle).
    es: null,
    spanishPending: true
  },
  "enzyme-lab": {
    en: "Test what makes the enzyme catalase work best. Run a fair test of temperature or pH, measure foam, graph the optimum and see the active site denature.",
    es: null
  },
  // Spanish is written in data.js but not proofread yet, so the page is English only here until SPANISH_PUBLISHED.
  "fruit-fly-genetics-lab": {
    en: "Breed virtual fruit flies, build Punnett squares and compare predicted ratios with real offspring counts in a free Biology genetics lab.",
    es: null
  },
  "leaf-disk-lab": {
    en: "Explore photosynthesis with floating spinach leaf disks. Compare light, temperature and bicarbonate in a bilingual Biology lab from ZornScience.",
    es: "Explora la fotosíntesis con discos de espinaca que flotan. Compara luz, temperatura y bicarbonato en un laboratorio bilingüe de ZornScience."
  },
  "yeast-fermentation-lab": {
    en: "Feed yeast glucose, table sugar, sweetener and starch, measure the balloons, and graph where fermentation levels off in this Biology virtual lab.",
    es: null
  },
  "": {
    en: "Free interactive chemistry and physics activities from ZornScience: virtual labs, simulations, AP Chemistry review and ACT practice, no login needed.",
    es: "Actividades interactivas gratuitas de química y física de ZornScience: laboratorios virtuales, simulaciones, repaso de Química AP y práctica para el ACT."
  },
  "act": {
    en: "Free ACT practice with original English, Math, Reading and Science questions, score estimates and tips for the skills you missed, from ZornScience.",
    es: null
  },
  "act-question-generator": {
    en: "Practice one ACT-style question at a time. Choose English, Math, or Science from 1,200 original questions, with answers and explanations.",
    es: null
  },
  "apchem-unit1-practice": {
    en: "Catch up on AP Chemistry Unit 1 with 48 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 1 de Química AP: 48 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit2-practice": {
    en: "Catch up on AP Chemistry Unit 2 with 42 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 2 de Química AP: 42 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit3-practice": {
    en: "Catch up on AP Chemistry Unit 3 with 78 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 3 de Química AP: 78 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit4-practice": {
    en: "Catch up on AP Chemistry Unit 4 with 54 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 4 de Química AP: 54 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit5-practice": {
    en: "Catch up on AP Chemistry Unit 5 with 66 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 5 de Química AP: 66 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit6-practice": {
    en: "Catch up on AP Chemistry Unit 6 with 54 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 6 de Química AP: 54 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit7-practice": {
    en: "Catch up on AP Chemistry Unit 7 with 72 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 7 de Química AP: 72 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit8-practice": {
    en: "Catch up on AP Chemistry Unit 8 with 66 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 8 de Química AP: 66 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "apchem-unit9-practice": {
    en: "Catch up on AP Chemistry Unit 9 with 66 original questions, instant explanations, and English or Spanish practice from ZornScience.",
    es: "Ponte al corriente con la unidad 9 de Química AP: 66 preguntas originales con explicaciones inmediatas, en español o inglés, de ZornScience."
  },
  "atwood-machine": {
    en: "Explore Newton’s second law with a realistic ideal Atwood machine, adjustable brass masses and live force and acceleration vectors.",
    es: "Explora la segunda ley de Newton con una máquina de Atwood ideal y realista, masas de latón ajustables y vectores de fuerza y aceleración en vivo."
  },
  "beers-law-lab": {
    en: "Measure standards with a virtual spectrophotometer, build a Beer's law calibration curve, and find the concentration of a random unknown, from ZornScience.",
    es: "Mide estándares con un espectrofotómetro virtual, construye una curva de calibración de la ley de Beer y calcula la concentración de una muestra desconocida."
  },
  "calorimetry-lab": {
    en: "Measure heat transfer with heated metals and acid-base neutralization, live temperature traces, and energy-balance calculations.",
    es: "Mide la transferencia de calor con metales calientes y neutralización ácido-base, curvas de temperatura en vivo y cálculos de balance de energía."
  },
  "check": {
    en: "Check the completion codes students paste into Google Classroom. Runs in your browser; nothing is sent anywhere.",
    es: null
  },
  "chemical-bonding-lab": {
    en: "Investigate four unknown solids with realistic lab equipment. Compare conductivity, melting, solubility and malleability to explore chemical bonding.",
    es: "Investiga cuatro sólidos desconocidos con equipo de laboratorio realista. Compara conductividad, fusión, solubilidad y maleabilidad para inferir el enlace."
  },
  "circuit-builder": {
    en: "Build circuits with batteries, wires, resistors, switches and bulbs, then probe voltage and current with a multimeter, from ZornScience.",
    es: "Construye circuitos con baterías, cables, resistencias, interruptores y focos, y luego mide el voltaje y la corriente con un multímetro."
  },
  "collision-carts": {
    en: "Explore conservation of momentum with realistic dynamics carts, elastic and inelastic collisions, and live velocity and momentum vectors.",
    es: "Explora la conservación del momento con carritos dinámicos realistas, choques elásticos e inelásticos y vectores de velocidad y momento en vivo."
  },
  "electrochemistry-lab": {
    en: "Build galvanic and electrolytic cells from metal half-cells, trace electron flow through the circuit, and calculate standard cell potentials.",
    es: "Construye celdas galvánicas y electrolíticas con semiceldas metálicas, sigue el flujo de electrones y calcula potenciales estándar de celda."
  },
  "equilibrium-k-lab": {
    en: "Write K expressions, compare Q with K to predict the shift, solve ICE tables, and explore molar solubility and the common-ion effect with Ksp.",
    es: "Escribe expresiones de K, compara Q con K para predecir el desplazamiento, resuelve tablas ICE y explora la solubilidad molar y el ion común con Ksp."
  },
  "equilibrium-lab": {
    en: "Explore Le Chatelier’s principle with concentration, volume and temperature changes, live concentration graphs, and Kc and Qc.",
    es: "Explora el principio de Le Châtelier con cambios de concentración, volumen y temperatura, gráficas de concentración en vivo, Kc y Qc."
  },
  "equilibrium-thermo-lab": {
    en: "Choose a ZornScience chemistry lab: the Equilibrium Sandbox for Le Chatelier’s principle, or the Calorimetry and Enthalpy Lab for heat transfer.",
    es: "Elige un laboratorio de química de ZornScience: el Explorador del equilibrio o el Laboratorio de calorimetría y entalpía para la transferencia de calor.",
    sitemap: false
  },
  "equipotential-lab": {
    en: "Explore electric potential with movable point charges, a virtual voltmeter, smooth equipotential lines and electric field vectors.",
    es: "Explora el potencial eléctrico con cargas puntuales móviles, un voltímetro virtual, líneas equipotenciales suaves y vectores de campo eléctrico."
  },
  "faraday-lab": {
    en: "Drop a neodymium magnet through copper and plastic tubes, reveal eddy currents and induced magnetic fields, and see Lenz’s law slow the fall.",
    es: "Deja caer un imán de neodimio por tubos de cobre y de plástico, muestra las corrientes de Foucault y los campos inducidos, y ve cómo Lenz frena la caída."
  },
  "flame-test-lab": {
    en: "Explore the flame colors of eight metal salts and a mystery sample in the ZornScience virtual flame test lab, then identify the unknown metal.",
    es: "Explora los colores de llama de ocho sales metálicas y una muestra desconocida en el laboratorio virtual de prueba de llama e identifica el metal."
  },
  "free-energy-lab": {
    en: "Predict entropy changes, explore Gibbs free energy and temperature, link ΔG° with K, and compare kinetic control, dissolving and coupled reactions.",
    es: "Predice cambios de entropía, explora la energía libre de Gibbs y la temperatura, relaciona ΔG° con K y compara el control cinético y las reacciones acopladas."
  },
  "gas-lab": {
    en: "Move a piston, heat and add gas, and watch particles hit the walls. Graph the gas laws, compare speed distributions, and test real gases.",
    es: "Mueve un pistón, calienta y agrega gas, y observa cómo las partículas chocan con las paredes. Grafica las leyes de los gases y prueba gases reales."
  },
  "gas-laws": {
    en: "Explore Boyle’s, Charles’s, Gay-Lussac’s and Avogadro’s laws with a particle model, locked variables and a live graph, from ZornScience.",
    es: "Explora las leyes de Boyle, Charles, Gay-Lussac y Avogadro con un modelo de partículas, variables fijas y una gráfica en vivo, de ZornScience."
  },
  "gravimetric-lab": {
    en: "Identify an unknown metal carbonate in a virtual gravimetric analysis lab: precipitate, filter, wash and dry calcium carbonate to constant mass.",
    es: "Identifica un carbonato metálico desconocido en un análisis gravimétrico virtual: precipita, filtra, lava y seca el carbonato de calcio a masa constante."
  },
  "hookes-law-lab": {
    en: "Explore spring extension and simple harmonic motion with slotted masses, a virtual ruler, and a live position graph.",
    es: "Explora el estiramiento de un resorte y el movimiento armónico simple con masas ranuradas, una regla virtual y una gráfica de posición en vivo."
  },
  "inclined-plane": {
    en: "Raise a wooden ramp until the block slips. Explore static and kinetic friction with realistic apparatus and a live free body diagram.",
    es: "Levanta una rampa de madera hasta que el bloque se deslice. Explora la fricción estática y cinética con un diagrama de cuerpo libre en vivo."
  },
  "iodine-clock-lab": {
    en: "Prepare and mix an iodine clock reaction. Explore concentration, temperature, and a 20-second challenge on a realistic virtual lab bench.",
    es: "Prepara y mezcla una reacción de reloj de yodo. Explora la concentración, la temperatura y un reto de 20 segundos en una mesa de laboratorio virtual."
  },
  "ion-charge-trainer": {
    en: "Practice predicting the charges of common ions: find valence electrons, decide what changes, and check your reasoning with hints and feedback.",
    es: "Practica cómo predecir la carga de los iones comunes: encuentra los electrones de valencia, decide qué cambia y revisa tu razonamiento con pistas."
  },
  "ionic-reactions": {
    en: "Choose synthesis, decomposition, single replacement or double replacement practice, then predict products and balance equations, from ZornScience.",
    es: "Elige práctica de síntesis, descomposición, sustitución simple o sustitución doble, y luego predice los productos y balancea las ecuaciones."
  },
  "kinetics-lab": {
    en: "Watch particles collide in a box. Change temperature, concentration and activation energy, add a catalyst, and see the reaction rate respond.",
    es: "Observa cómo chocan las partículas en una caja. Cambia la temperatura, la concentración y la energía de activación, agrega un catalizador y ve la velocidad."
  },
  "lewis-vsepr": {
    en: "Build Lewis structures step by step and predict molecular shape, bond angle and polarity with hints and feedback.",
    es: "Construye estructuras de Lewis paso a paso y predice la forma molecular, el ángulo de enlace y la polaridad con pistas y retroalimentación."
  },
  "limiting-reactant": {
    en: "Pick starting moles of two reactants, watch molecules pair up into products, and see the excess reactant left over when the limiting one runs out.",
    es: "Elige los moles iniciales de dos reactivos, observa cómo forman productos y ve qué reactivo sobra cuando se acaba el reactivo limitante."
  },
  "metals-lab": {
    en: "Investigate three unknown solids with realistic lab equipment. Explore luster, malleability, conductivity, and reactions with hydrochloric acid.",
    es: "Investiga tres sólidos desconocidos con equipo de laboratorio realista. Explora su brillo, maleabilidad, conductividad y reacción con ácido clorhídrico."
  },
  "net-ionic-lab": {
    en: "Mix ten pairs of reagents on a virtual lab bench and observe precipitates, metal displacement and mixtures with no visible reaction.",
    es: "Mezcla diez pares de reactivos en una mesa de laboratorio virtual y observa precipitados, desplazamiento de metales y mezclas sin reacción visible."
  },
  "pendulum-lab": {
    en: "Explore oscillations and energy with a realistic pendulum apparatus on Earth, the Moon, Jupiter and in zero gravity.",
    es: "Explora las oscilaciones y la energía con un péndulo realista en la Tierra, la Luna, Júpiter y en gravedad cero, con energía cinética y potencial."
  },
  "periodic-table": {
    en: "An interactive periodic table of all 118 elements with heatmaps for atomic radius, electronegativity and ionization energy, from ZornScience.",
    es: "Una tabla periódica interactiva de los 118 elementos con mapas de color del radio atómico, la electronegatividad y la energía de ionización."
  },
  "periodic-trends": {
    en: "Practice periodic trends: compare atomic radius, electronegativity and first ionization energy for pairs of elements, from ZornScience.",
    es: "Practica las tendencias periódicas: compara el radio atómico, la electronegatividad y la primera energía de ionización de pares de elementos."
  },
  "ph-buffer-lab": {
    en: "Explore pH, design buffers from conjugate pairs, and compare buffer capacity with water using a live graph in the ZornScience pH and Buffer Lab.",
    es: "Explora el pH, prepara amortiguadores con pares conjugados y compara su capacidad con la del agua en una gráfica en vivo, de ZornScience."
  },
  "physics-graphing-lab": {
    en: "Predict, observe and explain one-dimensional motion with a moving cart and linked position, velocity and acceleration graphs, from ZornScience.",
    es: "Predice, observa y explica el movimiento en una dimensión con un carrito y gráficas enlazadas de posición, velocidad y aceleración, de ZornScience."
  },
  "polyatomic-ion-trainer": {
    en: "Learn polyatomic ion names, formulas and charges. Flip flashcards or race a five-minute multiple-choice challenge, then review your misses.",
    es: "Aprende los nombres, las fórmulas y las cargas de los iones poliatómicos. Usa tarjetas o un reto de cinco minutos y luego repasa tus errores."
  },
  "projectile-lab": {
    en: "Fire a cannon from any height, angle and speed, and watch live velocity and acceleration vectors on the projectile, from ZornScience.",
    es: "Dispara un cañón desde cualquier altura, ángulo y rapidez, y observa los vectores de velocidad y aceleración del proyectil en vivo, de ZornScience."
  },
  "qs-dimensional-analysis-practice": {
    en: "Practice dimensional analysis with new numbers every set: chain factors, convert rates and densities, and cube units, with feedback in English or Spanish.",
    es: "Practica el análisis dimensional con números nuevos en cada serie: encadena factores, convierte razones de cambio y densidades, y eleva unidades al cubo."
  },
  "qs-direct-and-inverse-relationships-practice": {
    en: "Practice direct and inverse relationships with new data every set: classify tables, use the ratio and product tests, and predict values, in English or Spanish.",
    es: "Practica relaciones directas e inversas con datos nuevos en cada serie: clasifica tablas, encuentra la constante y predice valores, con retroalimentación."
  },
  "qs-exponents-and-logarithms-practice": {
    en: "Practice exponents and logarithms with new numbers every set: exponent rules, scientific notation, logs of powers of ten and pH, with instant feedback.",
    es: "Practica exponentes y logaritmos con números nuevos en cada serie: reglas de exponentes, notación científica, logaritmos y pH, con retroalimentación inmediata."
  },
  "qs-metric-prefixes-practice": {
    en: "Practice metric prefixes from mega to nano with new numbers every set: meanings, the prefix ladder and conversions, with feedback in English or Spanish.",
    es: "Practica los prefijos métricos de mega a nano con números nuevos en cada serie: significados, escalera de prefijos y conversiones, con retroalimentación."
  },
  "qs-percent-error-and-percent-change-practice": {
    en: "Practice percent error and percent change with new numbers every set: accepted value on the bottom, sign kept, instant feedback in English or Spanish.",
    es: "Practica el porcentaje de error y el cambio porcentual con números nuevos en cada serie: el valor aceptado va abajo y el signo se conserva."
  },
  "qs-percents-practice": {
    en: "Practice percents with new numbers every set: decimals, percent of a whole, percent composition and percent yield, with instant feedback in English or Spanish.",
    es: "Practica porcentajes con números nuevos en cada serie: decimales, porcentaje de un total, composición porcentual y rendimiento porcentual."
  },
  "qs-ratios-and-proportions-practice": {
    en: "Practice ratios and proportions with new numbers every set: write and simplify ratios, solve proportions and use mole ratios, with instant feedback.",
    es: "Practica relaciones y proporciones con números nuevos en cada serie: escribe y simplifica relaciones, resuelve proporciones y usa relaciones molares."
  },
  "qs-reading-formulas-practice": {
    en: "Practice reading science formulas: what each letter means, implied multiplication, constants, subscripts and Δ as final minus initial, with instant feedback.",
    es: "Practica la lectura de fórmulas: qué significa cada letra, la multiplicación implícita, las constantes, los subíndices y Δ como final menos inicial."
  },
  "qs-rearranging-equations-practice": {
    en: "Practice solving formulas for one variable: opposite operations on both sides, steps undone in reverse order, then substitute and calculate.",
    es: "Practica el despeje de fórmulas: operaciones opuestas en ambos lados, pasos deshechos en orden inverso, y luego sustituye y calcula con retroalimentación."
  },
  "qs-scientific-notation-practice": {
    en: "Practice scientific notation with new numbers every set: convert big and small numbers both ways and read the exponent. Instant feedback in English or Spanish.",
    es: "Practica la notación científica con números nuevos en cada serie: convierte números grandes y pequeños en ambos sentidos e interpreta el exponente."
  },
  "qs-significant-figures-practice": {
    en: "Practice significant figures with new numbers every set: count them, round, and use the rules for calculations, with instant feedback in English or Spanish.",
    es: "Practica cifras significativas con números nuevos en cada serie: cuéntalas, redondea y usa las reglas de los cálculos, con retroalimentación inmediata."
  },
  "qs-substituting-with-units-practice": {
    en: "Practice substituting with units: units that cancel, converting to kg, m and s first, named units N and J, and kelvin for gases, with new numbers every set.",
    es: "Practica la sustitución con unidades: unidades que se cancelan, conversión a kg, m y s, las unidades N y J, y kelvin para los gases, con números nuevos."
  },
  "qs-trigonometry-basics-practice": {
    en: "Practice right triangle trigonometry with new numbers every set: name the sides, use SOH CAH TOA, and find sides and angles, with instant feedback.",
    es: "Practica trigonometría del triángulo rectángulo con números nuevos en cada serie: identifica los lados, usa SOH CAH TOA y calcula lados y ángulos."
  },
  "qs-unit-conversions-practice": {
    en: "Practice unit conversions with one exact factor: choose it, set it up so units cancel, and keep significant figures, with feedback in English or Spanish.",
    es: "Practica conversiones de unidades con un factor exacto: elígelo, plantéalo para que las unidades se cancelen y conserva las cifras significativas."
  },
  "qs-vectors-practice": {
    en: "Practice vectors with new numbers every set: scalars and vectors, adding in a line and at right angles, and components, with instant feedback.",
    es: "Practica vectores con números nuevos en cada serie: escalares y vectores, suma en una línea y perpendicular, y componentes, con retroalimentación inmediata."
  },
  "reaction-energy-lab": {
    en: "Build energy diagrams, explore heating and cooling curves, and calculate reaction enthalpy with stoichiometry, bonds, formation data and Hess's law.",
    es: "Construye diagramas de energía, explora curvas de calentamiento y enfriamiento y calcula la entalpía de reacción con enlaces, formación y la ley de Hess."
  },
  "redox-coach": {
    en: "Balance redox half-reactions one step at a time in acidic or basic media with manual atom balancing, electron transfer and cancellation.",
    es: "Balancea semirreacciones redox paso a paso en medio ácido o básico, con balanceo manual de átomos, transferencia de electrones y cancelación."
  },
  "scientific-calculator": {
    en: "Build calculator confidence with a free scientific calculator and six guided exercises on scientific notation, order of operations and more.",
    es: "Gana confianza con una calculadora científica gratuita y seis ejercicios guiados sobre notación científica, orden de las operaciones y más."
  },
  "snells-law-lab": {
    en: "Explore Snell’s law with a realistic laser, optical blocks, a snapping protractor, and total internal reflection.",
    es: "Explora la ley de Snell con un láser realista, bloques ópticos, un transportador con ajuste automático y la reflexión interna total."
  },
  "solutions-lab": {
    en: "Make solutions in a volumetric flask, dilute stock solutions with a pipet, and read solubility curves to compare saturated and unsaturated solutions.",
    es: "Prepara soluciones en un matraz aforado, diluye soluciones concentradas con una pipeta y lee curvas de solubilidad para comparar soluciones."
  },
  "standing-waves-lab": {
    en: "Create harmonics on a vibrating string, change its tension, and use a synchronized strobe and ruler to measure node spacing and wavelength.",
    es: "Crea armónicos en una cuerda que vibra, cambia su tensión y usa una luz estroboscópica y una regla para medir la distancia entre nodos."
  },
  "stoichiometry-coach": {
    en: "Build conversion factors, cancel units and solve stoichiometry problems from grams to moles to grams with guided feedback, from ZornScience.",
    es: "Construye factores de conversión, cancela unidades y resuelve problemas de estequiometría de gramos a moles a gramos con retroalimentación guiada."
  },
  "titration-lab": {
    en: "Titrate strong and weak acids and bases with a virtual burette and indicators, then connect the pH curve to the equivalence point and pKa.",
    es: "Titula ácidos y bases fuertes y débiles con una bureta virtual e indicadores, y relaciona la curva de pH con el punto de equivalencia y el pKa."
  },
  "virtual-lab-graphing": {
    en: "Turn your lab data into a scatter plot with a line of best fit. Label axes, explore slope, and download a graph for your lab write-up.",
    es: "Convierte tus datos de laboratorio en una gráfica de dispersión con línea de mejor ajuste. Rotula los ejes, explora la pendiente y descarga tu gráfica."
  }
};
