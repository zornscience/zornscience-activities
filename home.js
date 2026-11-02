(function () {
  "use strict";
  // Landing page: every English string with its Mexican Spanish translation, for shared/zsa-i18n.js. English is the
  // default and the fallback. Activity names match each activity's own Spanish title, and topic names follow the
  // Style Kit's official lesson titles where one exists. The ACT activities stay in English, so in Spanish their
  // links are followed by " (en inglés)", as is the teacher-only code checker.
  var root = document.querySelector('[data-zsa-activity="home"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Practice Activities", es:{
  // Header and navigation
  "ZornScience home": "Inicio de ZornScience",
  "Practice Activities": "Actividades de práctica",
  "Each activity goes with a lesson on zornscience.org. No login needed, and nothing you enter leaves your device.": "Cada actividad acompaña una lección de zornscience.org. No necesitas iniciar sesión, y nada de lo que escribes sale de tu dispositivo.",
  "Jump to a subject": "Ir a un tema",
  "Atoms and bonding": "Átomos y enlaces",
  "Reactions": "Reacciones",
  "Chemistry labs": "Laboratorios de química",
  "Physics": "Física",
  "Test prep": "Preparación para exámenes",
  "Lab tools": "Herramientas de laboratorio",
  // Tags
  "Reference": "Consulta",
  "Practice": "Práctica",
  "Completion code": "Código de finalización",
  "Timed quiz": "Cuestionario cronometrado",
  "Simulation": "Simulación",
  "Virtual lab": "Laboratorio virtual",
  "Untimed": "Sin límite de tiempo",
  "1,200 questions": "1,200 preguntas",
  "Lab tool": "Herramienta de laboratorio",
  "Your own data": "Tus propios datos",
  // Atoms, ions and bonding
  "Atoms, ions and bonding": "Átomos, iones y enlaces",
  "Start with the periodic table, then predict ion charges and build Lewis structures.": "Empieza con la tabla periódica y luego predice las cargas de los iones y construye estructuras de Lewis.",
  "Periodic Table": "Tabla periódica",
  "Look up any element, and color the table by atomic radius, electronegativity or ionization energy to see the trends.": "Busca cualquier elemento y colorea la tabla por radio atómico, electronegatividad o energía de ionización para ver las tendencias.",
  "Periodic Trends": "Tendencias periódicas",
  "Periodic Trends Practice": "Práctica de tendencias periódicas",
  "Compare two elements and use the trend to decide which has the larger radius or the higher electronegativity or ionization energy.": "Compara dos elementos y usa la tendencia para decidir cuál tiene el mayor radio o la mayor electronegatividad o energía de ionización.",
  "Ionic Bonding": "Enlace iónico",
  "Predicting Ion Charge Trainer": "Práctica de predicción de la carga de iones",
  "Find valence electrons, decide what changes, and check your reasoning with hints and feedback.": "Encuentra los electrones de valencia, decide qué cambia y revisa tu razonamiento con pistas y retroalimentación.",
  "Polyatomic Ion Trainer": "Práctica de iones poliatómicos",
  "Race the five-minute clock to recall polyatomic ion names, formulas and charges. Revisit missed questions and review your results.": "Compite contra el reloj de cinco minutos para recordar los nombres, las fórmulas y las cargas de los iones poliatómicos. Vuelve a las preguntas que fallaste y revisa tus resultados.",
  "Covalent Bonding": "Enlace covalente",
  "Lewis Structure and VSEPR Builder": "Constructor de estructuras de Lewis y VSEPR",
  "Count valence electrons, build each Lewis structure, then predict its shape, bond angle and polarity.": "Cuenta los electrones de valencia, construye cada estructura de Lewis y luego predice su forma, su ángulo de enlace y su polaridad.",
  // Reactions and stoichiometry
  "Reactions and stoichiometry": "Reacciones y estequiometría",
  "Write and balance reactions, including redox, then follow the moles from reactants to products.": "Escribe y balancea reacciones, incluidas las redox, y luego sigue los moles de los reactivos a los productos.",
  "Chemical Reactions": "Reacciones químicas",
  "Ionic Reaction Builder": "Constructor de reacciones iónicas",
  "Choose synthesis, decomposition, single replacement, or double replacement, then build products, balance equations, and review your practice.": "Elige síntesis, descomposición, sustitución simple o sustitución doble, y luego construye los productos, balancea las ecuaciones y revisa tu práctica.",
  "Oxidation and Reduction": "Oxidación y reducción",
  "Redox Half-Reaction Balancer Coach": "Práctica de balanceo de semirreacciones redox",
  "Split a redox reaction, balance atoms and charge, equalize electrons, and cancel species one step at a time. Practice in acidic or basic media with feedback before each step unlocks.": "Separa una reacción redox, balancea los átomos y la carga, iguala los electrones y cancela especies paso a paso. Practica en medio ácido o básico con retroalimentación antes de que se desbloquee cada paso.",
  "Stoichiometry": "Estequiometría",
  "Stoichiometry Coach": "Práctica de estequiometría",
  "Build conversion factors, watch the units cancel, and solve grams and moles problems with hints and feedback.": "Arma factores de conversión, observa cómo se cancelan las unidades y resuelve problemas de gramos y moles con pistas y retroalimentación.",
  "Limiting Reactant Visualizer": "Visualizador del reactivo limitante",
  "Pick starting moles of two reactants, predict which runs out, and watch the molecules pair up into products. The excess is left stranded with nothing to react with.": "Elige los moles iniciales de dos reactivos, predice cuál se acaba primero y observa cómo las moléculas se unen para formar productos. El reactivo en exceso se queda sin nada con qué reaccionar.",
  // Chemistry labs
  "Virtual lab benches for gases, solutions, acids and bases, and reaction rates.": "Mesas de laboratorio virtuales para gases, soluciones, ácidos y bases, y velocidades de reacción.",
  "Chemical bonding": "Enlace químico",
  "Chemical Bonding Lab": "Laboratorio de enlace químico",
  "Investigate four unknown solids with realistic lab equipment. Compare appearance, conductivity, melting, solubility in water and cyclohexane, and malleability to infer bonding types.": "Investiga cuatro sólidos desconocidos con equipo de laboratorio realista. Compara su apariencia, conductividad, fusión, solubilidad en agua y en ciclohexano, y maleabilidad para deducir los tipos de enlace.",
  "Properties of elements": "Propiedades de los elementos",
  "Metals, Nonmetals & Metalloids Lab": "Metales, no metales y metaloides",
  "Investigate three unknown solids with a watch glass, mortar and pestle, conductivity tester, and dilute hydrochloric acid. Use physical and chemical evidence to classify each sample.": "Investiga tres sólidos desconocidos con un vidrio de reloj, un mortero con pistilo, un probador de conductividad y ácido clorhídrico diluido. Usa evidencia física y química para clasificar cada muestra.",
  "Reaction kinetics": "Cinética de reacción",
  "Iodine Clock Lab": "Laboratorio del reloj de yodo",
  "Measure and mix two clear solutions on a realistic lab bench. Explore concentration and temperature, watch the sudden blue endpoint, and try a 20-second challenge.": "Mide y mezcla dos soluciones incoloras en una mesa de laboratorio realista. Explora la concentración y la temperatura, observa el repentino punto final azul e intenta un reto de 20 segundos.",
  "Net ionic equations": "Ecuaciones iónicas netas",
  "Net Ionic Reactions Lab": "Laboratorio de reacciones iónicas netas",
  "Mix ten pairs of reagents in realistic glassware. Observe precipitates, a metal displacement reaction, and mixtures with no visible reaction.": "Mezcla diez pares de reactivos en material de vidrio realista. Observa precipitados, una reacción de desplazamiento de metales y mezclas sin reacción visible.",
  "Atomic emission": "Emisión atómica",
  "Virtual Flame Test Lab": "Laboratorio virtual de prueba de llama",
  "Click eight known metal salt samples and an unknown to compare their characteristic flame colors in a Bunsen burner.": "Haz clic en ocho muestras conocidas de sales metálicas y en una desconocida para comparar los colores característicos de su llama en un mechero Bunsen.",
  "Analytical chemistry": "Química analítica",
  "Gravimetric Analysis": "Análisis gravimétrico",
  "Identify an unknown carbonate with a realistic lab bench. Precipitate, filter, wash, and dry calcium carbonate to constant mass.": "Identifica un carbonato desconocido en una mesa de laboratorio realista. Precipita, filtra, lava y seca el carbonato de calcio hasta masa constante.",
  "Equilibrium": "Equilibrio",
  "Equilibrium Sandbox": "Explorador del equilibrio",
  "Stress a reversible reaction with concentration, volume and temperature changes. Compare Kc and Qc on a live concentration graph.": "Perturba una reacción reversible con cambios de concentración, volumen y temperatura. Compara Kc y Qc en una gráfica de concentración en vivo.",
  "Thermodynamics": "Termodinámica",
  "Calorimetry & Enthalpy Lab": "Laboratorio de calorimetría y entalpía",
  "Drop a heated metal into water or mix acid and base. Follow temperature changes and calculate specific heat or reaction enthalpy.": "Deja caer un metal caliente en agua o mezcla un ácido y una base. Sigue los cambios de temperatura y calcula el calor específico o la entalpía de reacción.",
  "AP Chemistry · Electrochemistry": "Química AP · Electroquímica",
  "Galvanic & Electrolytic Cell Builder": "Constructor de celdas electroquímicas",
  "Build metal half-cells, connect a salt bridge and voltmeter, follow electron flow, and calculate standard cell potentials. Apply power to drive the reverse reaction.": "Construye semiceldas metálicas, conecta un puente salino y un voltímetro, sigue el flujo de electrones y calcula potenciales estándar de celda. Aplica energía eléctrica para impulsar la reacción inversa.",
  "Beer's Law": "Ley de Beer",
  "Beer's Law Spectrophotometer Lab": "Laboratorio de la ley de Beer con espectrofotómetro",
  "Zero a spectrophotometer, measure standards to build a calibration curve, then measure a random unknown and calculate its concentration from your line.": "Calibra a cero un espectrofotómetro, mide estándares para construir una curva de calibración y luego mide una muestra desconocida al azar y calcula su concentración con tu línea.",
  "Gases": "Gases",
  "Gas Laws Sandbox": "Explorador de las leyes de los gases",
  "Explore Boyle’s, Charles’s, Gay-Lussac’s and Avogadro’s laws with locked variables, moving particles and a live graph. Switch between English and Spanish.": "Explora las leyes de Boyle, Charles, Gay-Lussac y Avogadro con variables fijas, partículas en movimiento y una gráfica en vivo. Cambia entre inglés y español.",
  "AP Chemistry · Gases": "Química AP · Gases",
  "Gas Laws and KMT Lab": "Laboratorio de leyes de los gases y TCM",
  "Move a piston, heat and add gas, and watch particles hit the walls. Graph the gas laws, compare speed distributions, mix gases and see when real gases stop acting ideal.": "Mueve un pistón, calienta y agrega gas, y observa cómo las partículas chocan con las paredes. Grafica las leyes de los gases, compara distribuciones de rapidez, mezcla gases y ve cuándo los gases reales dejan de comportarse como ideales.",
  "AP Chemistry · Acids and Bases": "Química AP · Ácidos y bases",
  "pH & Buffer Lab": "Laboratorio de pH y soluciones amortiguadoras",
  "Explore pH, build conjugate pairs, and add acid or base to water and a buffer. Compare buffer capacity with a live graph and downloadable data.": "Explora el pH, prepara pares conjugados y agrega ácido o base al agua y a un amortiguador. Compara la capacidad amortiguadora con una gráfica en vivo y datos descargables.",
  "Virtual Titration Simulator": "Simulador virtual de titulación",
  "Pick an analyte, a titrant and an indicator, then add titrant drop by drop and watch the pH curve grow. Find the equivalence point, and read the pKa at the half-equivalence point.": "Elige un analito, un titulante y un indicador, y luego agrega el titulante gota a gota y observa cómo crece la curva de pH. Encuentra el punto de equivalencia y lee el pKa en el punto de semiequivalencia.",
  "AP Chemistry · Kinetics": "Química AP · Cinética",
  "Kinetics and Collision Theory Sandbox": "Simulador de cinética y teoría de colisiones",
  "Watch A and B bounce around a box and react only when they hit hard enough. Change the temperature, the concentration and the activation energy, add a catalyst, and see the concentration graph respond.": "Observa cómo A y B rebotan en una caja y reaccionan solo cuando chocan con suficiente fuerza. Cambia la temperatura, la concentración y la energía de activación, agrega un catalizador y ve cómo responde la gráfica de concentración.",
  // Physics
  "Motion, forces, circuits and optics you can explore with virtual lab equipment.": "Movimiento, fuerzas, circuitos y óptica que puedes explorar con equipo de laboratorio virtual.",
  "Electromagnetic Induction": "Inducción electromagnética",
  "Faraday’s Law · Magnet Drop": "Ley de Faraday · Caída del imán",
  "Drop a neodymium magnet through copper, reveal eddy currents and induced magnetic fields, and compare intact copper, slotted copper and plastic.": "Deja caer un imán de neodimio a través de cobre, muestra las corrientes de Foucault y los campos magnéticos inducidos, y compara cobre entero, cobre ranurado y plástico.",
  "Electric Fields": "Campos eléctricos",
  "Equipotential & Electric Field Mapping": "Líneas equipotenciales y mapeo de campos eléctricos",
  "Arrange point charges and explore their voltage with a virtual probe, smooth equipotential lines and electric field vectors.": "Acomoda cargas puntuales y explora su voltaje con una punta virtual, líneas equipotenciales suaves y vectores de campo eléctrico.",
  "Waves and Resonance": "Ondas y resonancia",
  "Standing Waves on a String": "Ondas estacionarias en una cuerda",
  "Tune a mechanical oscillator to create harmonics, change string tension, and use a synchronized strobe and ruler to measure node spacing.": "Ajusta un oscilador mecánico para crear armónicos, cambia la tensión de la cuerda y usa una luz estroboscópica sincronizada y una regla para medir la separación entre nodos.",
  "Optics": "Óptica",
  "Snell’s Law & Refraction": "Ley de Snell y refracción",
  "Aim a laser through optical blocks, measure angles with a snapping protractor, and explore water, diamond and total internal reflection.": "Apunta un láser a través de bloques ópticos, mide ángulos con un transportador que se ajusta solo, y explora el agua, el diamante y la reflexión interna total.",
  "Forces and oscillations": "Fuerzas y oscilaciones",
  "Hooke’s Law & Harmonic Motion": "Ley de Hooke y movimiento armónico",
  "Load a realistic spring with slotted masses, measure extension with a ruler, and explore oscillations with pause, slow motion, and a live position graph.": "Carga un resorte realista con masas ranuradas, mide el alargamiento con una regla y explora las oscilaciones con pausa, cámara lenta y una gráfica de posición en vivo.",
  "Oscillations and Energy": "Oscilaciones y energía",
  "The Simple Pendulum": "El péndulo simple",
  "Release a brass pendulum bob, explore mass, length and gravity, and watch kinetic and potential energy exchange on Earth, the Moon and Jupiter.": "Suelta la masa de latón de un péndulo, explora la masa, la longitud y la gravedad, y observa el intercambio de energía cinética y potencial en la Tierra, la Luna y Júpiter.",
  "Forces and Friction": "Fuerzas y fricción",
  "Inclined Plane & Friction": "Plano inclinado y fricción",
  "Raise a wooden ramp until the block slips. Explore static and kinetic friction with realistic apparatus and a live free body diagram.": "Levanta una rampa de madera hasta que el bloque se deslice. Explora la fricción estática y la cinética con aparatos realistas y un diagrama de cuerpo libre en vivo.",
  "Conservation of Momentum": "Conservación de la cantidad de movimiento",
  "Collision Carts": "Carritos de colisión",
  "Collide realistic dynamics carts on a low-friction track. Switch between elastic and inelastic collisions, adjust masses and velocities, and reveal live velocity and momentum vectors.": "Haz chocar carritos dinámicos realistas en un riel de baja fricción. Cambia entre choques elásticos e inelásticos, ajusta las masas y las velocidades, y muestra los vectores de velocidad y cantidad de movimiento en vivo.",
  "Newton’s Second Law": "Segunda ley de Newton",
  "The Atwood Machine": "La máquina de Atwood",
  "Release two brass masses over an ideal pulley. Explore Newton’s second law with adjustable masses and live force and acceleration vectors.": "Suelta dos masas de latón sobre una polea ideal. Explora la segunda ley de Newton con masas ajustables y vectores de fuerza y aceleración en vivo.",
  "Linear Motion": "Movimiento lineal",
  "Physics Graphing Lab": "Laboratorio de gráficas de física",
  "Run a cart along a track and watch its position, velocity and acceleration graphs grow together. Sketch your prediction first, then compare it with the model.": "Mueve un carrito por un riel y observa cómo crecen juntas sus gráficas de posición, velocidad y aceleración. Primero dibuja tu predicción y luego compárala con el modelo.",
  "2D Dynamics": "Dinámica en 2D",
  "Projectile Motion Vector Lab": "Laboratorio de vectores del movimiento de proyectiles",
  "Fire a cannon from any height, angle and speed, and turn on live velocity and acceleration vectors. Watch the horizontal velocity stay the same while the vertical velocity shrinks, flips and grows.": "Dispara un cañón desde cualquier altura, ángulo y rapidez, y activa los vectores de velocidad y aceleración en vivo. Observa cómo la velocidad horizontal no cambia mientras la velocidad vertical disminuye, cambia de sentido y crece.",
  "Electric Circuits": "Circuitos eléctricos",
  "Circuit Builder": "Constructor de circuitos",
  "Drag batteries, wires, resistors, switches and bulbs onto a board and probe the circuit with a multimeter. Switch between series and parallel and see why the bulbs glow so differently.": "Arrastra pilas, cables, resistencias, interruptores y focos a un tablero y mide el circuito con un multímetro. Cambia entre serie y paralelo y descubre por qué los focos brillan tan distinto.",
  // Test prep
  "Build test-day skills with quick ACT questions, full ACT practice, and a scientific calculator.": "Desarrolla habilidades para el día del examen con preguntas rápidas del ACT, práctica completa del ACT y una calculadora científica.",
  "Practice questions, one section, or the full ACT with original English, Math, Reading and Science questions, then get estimated scores and tips for the skills you missed.": "Practica preguntas sueltas, una sección o el ACT completo con preguntas originales de inglés, matemáticas, lectura y ciencias, y luego recibe puntajes estimados y consejos para las habilidades que fallaste.",
  "Quick ACT practice": "Práctica rápida del ACT",
  "Choose English, Math, or Science for a random question from a separate bank of 1,200 original ACT-style questions. Reveal the answer and explanation whenever you need help.": "Elige inglés, matemáticas o ciencias para recibir una pregunta al azar de un banco aparte de 1,200 preguntas originales al estilo del ACT. Muestra la respuesta y la explicación cuando necesites ayuda.",
  "Calculator skills": "Habilidades con la calculadora",
  "Scientific Calculator Practice": "Práctica con la calculadora científica",
  "Learn a familiar scientific calculator keypad with fractions, powers, roots, trigonometry and six guided exercises. Build calculator confidence before test day.": "Aprende las teclas de una calculadora científica conocida con fracciones, potencias, raíces, trigonometría y seis ejercicios guiados. Gana confianza con la calculadora antes del día del examen.",
  // Lab tools
  "Lab tools and quantitative skills": "Herramientas de laboratorio y habilidades cuantitativas",
  "Work with your own measurements and make clear graphs for your lab write-ups.": "Trabaja con tus propias mediciones y haz gráficas claras para tus reportes de laboratorio.",
  "Reading Graphs": "Lectura de gráficas",
  "Virtual Lab Graphing Tool": "Herramienta de gráficas para el laboratorio virtual",
  "Enter or import your data, make a scatter plot with a linear best-fit line, and download your graph for a lab report. Explore slope, units and R².": "Escribe o importa tus datos, haz una gráfica de dispersión con una línea de mejor ajuste y descarga tu gráfica para un reporte de laboratorio. Explora la pendiente, las unidades y R².",
  // Teachers
  "For teachers": "Para docentes",
  "Activities marked with a completion code end a full round with a code that students can paste into Google Classroom.": "Las actividades marcadas con código de finalización terminan una ronda completa con un código que los estudiantes pueden pegar en Google Classroom.",
  "Check completion codes": "Revisar códigos de finalización (en inglés)"
}};
  // configure() rewrites every link as an absolute URL. The landing page keeps its links exactly as written, adding
  // only lang=es in Spanish, so English links are unchanged.
  var links = Array.from(root.querySelectorAll("a[href]")).map(function (a) { return [a, a.getAttribute("href")]; });
  i18n.configure(copy);
  links.forEach(function (pair) {
    var href = pair[1], local = !/^(?:[a-z]+:|\/\/|#)/i.test(href);
    pair[0].setAttribute("href", local && i18n.lang === "es" ? href + (href.indexOf("?") >= 0 ? "&" : "?") + "lang=es" : href);
  });
  if (i18n.lang !== "es") return;
  // The ACT activities have no Spanish version: their names stay in English, followed by " (en inglés)".
  root.querySelectorAll('.zsa-home-card h3 a[href^="act/"], .zsa-home-card h3 a[href^="act-question-generator/"]').forEach(function (a) {
    a.parentNode.appendChild(document.createTextNode(" (en inglés)"));
  });
}());
