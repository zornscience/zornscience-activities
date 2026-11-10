(function () {
  "use strict";
  // "About this activity": a short intro and links to the zornscience.org lessons each activity supports.
  // This file is the single source. tools/build-about.js writes the English section into each page
  // (so it is readable without JavaScript), and the browser part below switches it to Mexican Spanish.
  // Lesson titles are the page titles on zornscience.org (Style Kit Appendix A for Spanish).
  var HOST = "https://zornscience.org";
  var COURSES = {
    chem: {en: "Chemistry", es: "Química", path: "/science/chemistry/"},
    ap: {en: "AP Chemistry", es: "Química AP", path: "/science/ap-chemistry/"},
    phys: {en: "Physics", es: "Física", path: "/science/physics/"},
    qs: {en: "Quantitative Skills", es: "Habilidades cuantitativas", path: "/science/quantitative-skills/"},
    students: {en: "Students", es: "Estudiantes", path: "/students/"},
    labs: {en: "Physical Labs", es: "Laboratorios presenciales", path: "/teaching/physical-labs/"}
  };
  // key: [course, path below the course, English title, Spanish title]
  var LESSONS = {
    "act-prep": ["students", "act/", "ACT Prep", "Preparación para el ACT"],
    "ap-unit-1": ["ap", "unit-1-atomic-structure-and-properties/", "Unit 1: Atomic Structure and Properties", "Unidad 1: Estructura atómica y propiedades"],
    "ap-unit-2": ["ap", "unit-2-compound-structure-and-properties/", "Unit 2: Compound Structure and Properties", "Unidad 2: Estructura y propiedades de los compuestos"],
    "ap-unit-3": ["ap", "unit-3-properties-of-substances-and-mixtures/", "Unit 3: Properties of Substances and Mixtures", "Unidad 3: Propiedades de sustancias y mezclas"],
    "ap-unit-4": ["ap", "unit-4-chemical-reactions/", "Unit 4: Chemical Reactions", "Unidad 4: Reacciones químicas"],
    "ap-unit-5": ["ap", "unit-5-kinetics/", "Unit 5: Kinetics", "Unidad 5: Cinética"],
    "ap-unit-6": ["ap", "unit-6-thermochemistry/", "Unit 6: Thermochemistry", "Unidad 6: Termoquímica"],
    "ap-unit-7": ["ap", "unit-7-equilibrium/", "Unit 7: Equilibrium", "Unidad 7: Equilibrio"],
    "ap-unit-8": ["ap", "unit-8-acids-and-bases/", "Unit 8: Acids and Bases", "Unidad 8: Ácidos y bases"],
    "ap-unit-9": ["ap", "unit-9-thermodynamics-and-electrochemistry/", "Unit 9: Thermodynamics and Electrochemistry", "Unidad 9: Termodinámica y electroquímica"],
    "ap-1.7": ["ap", "unit-1-atomic-structure-and-properties/1-7-periodic-trends/", "1.7 Periodic Trends", "1.7 Tendencias periódicas"],
    "ap-1.8": ["ap", "unit-1-atomic-structure-and-properties/1-8-valence-electrons-and-ionic-compounds/", "1.8 Valence Electrons and Ionic Compounds", "1.8 Electrones de valencia y compuestos iónicos"],
    "ap-2.1": ["ap", "unit-2-compound-structure-and-properties/2-1-types-of-chemical-bonds/", "2.1 Types of Chemical Bonds", "2.1 Tipos de enlaces químicos"],
    "ap-2.7": ["ap", "unit-2-compound-structure-and-properties/2-7-vsepr-and-hybridization/", "2.7 VSEPR and Hybridization", "2.7 VSEPR e hibridación"],
    "ap-3.4": ["ap", "unit-3-properties-of-substances-and-mixtures/3-4-ideal-gas-law/", "3.4 Ideal Gas Law", "3.4 Ley de los gases ideales"],
    "ap-3.5": ["ap", "unit-3-properties-of-substances-and-mixtures/3-5-kinetic-molecular-theory/", "3.5 Kinetic Molecular Theory", "3.5 Teoría cinético-molecular"],
    "ap-3.13": ["ap", "unit-3-properties-of-substances-and-mixtures/3-13-beer-lambert-law/", "3.13 Beer-Lambert Law", "3.13 Ley de Beer-Lambert"],
    "ap-4.5": ["ap", "unit-4-chemical-reactions/4-5-stoichiometry/", "4.5 Stoichiometry", "4.5 Estequiometría"],
    "ap-4.9": ["ap", "unit-4-chemical-reactions/4-9-oxidation-reduction-redox-reactions/", "4.9 Oxidation-Reduction (Redox) Reactions", "4.9 Reacciones de oxidación-reducción (redox)"],
    "ap-5.2": ["ap", "unit-5-kinetics/5-2-introduction-to-rate-law/", "5.2 Introduction to Rate Law", "5.2 Introducción a la ley de velocidad"],
    "ap-5.5": ["ap", "unit-5-kinetics/5-5-collision-model/", "5.5 Collision Model", "5.5 Modelo de colisiones"],
    "ap-5.11": ["ap", "unit-5-kinetics/5-11-catalysis/", "5.11 Catalysis", "5.11 Catálisis"],
    "ap-6.2": ["ap", "unit-6-thermochemistry/6-2-energy-diagrams/", "6.2 Energy Diagrams", "6.2 Diagramas de energía"],
    "ap-6.4": ["ap", "unit-6-thermochemistry/6-4-heat-capacity-and-calorimetry/", "6.4 Heat Capacity and Calorimetry", "6.4 Capacidad calorífica y calorimetría"],
    "ap-6.9": ["ap", "unit-6-thermochemistry/6-9-hesss-law/", "6.9 Hess's Law", "6.9 Ley de Hess"],
    "ap-7.3": ["ap", "unit-7-equilibrium/7-3-reaction-quotient-and-equilibrium-constant/", "7.3 Reaction Quotient and Equilibrium Constant", "7.3 Cociente de reacción y constante de equilibrio"],
    "ap-7.7": ["ap", "unit-7-equilibrium/7-7-calculating-equilibrium-concentrations/", "7.7 Calculating Equilibrium Concentrations", "7.7 Cálculo de concentraciones en el equilibrio"],
    "ap-7.9": ["ap", "unit-7-equilibrium/7-9-introduction-to-le-chateliers-principle/", "7.9 Introduction to Le Châtelier's Principle", "7.9 Introducción al principio de Le Châtelier"],
    "ap-7.11": ["ap", "unit-7-equilibrium/7-11-introduction-to-solubility-equilibria/", "7.11 Introduction to Solubility Equilibria", "7.11 Introducción a los equilibrios de solubilidad"],
    "ap-8.5": ["ap", "unit-8-acids-and-bases/8-5-acid-base-titrations/", "8.5 Acid-Base Titrations", "8.5 Titulaciones ácido-base"],
    "ap-8.8": ["ap", "unit-8-acids-and-bases/8-8-properties-of-buffers/", "8.8 Properties of Buffers", "8.8 Propiedades de los amortiguadores"],
    "ap-9.3": ["ap", "unit-9-thermodynamics-and-electrochemistry/9-3-gibbs-free-energy-and-thermodynamic-favorability/", "9.3 Gibbs Free Energy and Thermodynamic Favorability", "9.3 Energía libre de Gibbs y favorabilidad termodinámica"],
    "ap-9.5": ["ap", "unit-9-thermodynamics-and-electrochemistry/9-5-free-energy-and-equilibrium/", "9.5 Free Energy and Equilibrium", "9.5 Energía libre y equilibrio"],
    "ap-9.8": ["ap", "unit-9-thermodynamics-and-electrochemistry/9-8-galvanic-voltaic-and-electrolytic-cells/", "9.8 Galvanic (Voltaic) and Electrolytic Cells", "9.8 Celdas galvánicas (voltaicas) y electrolíticas"],
    "ap-9.9": ["ap", "unit-9-thermodynamics-and-electrochemistry/9-9-cell-potential-and-free-energy/", "9.9 Cell Potential and Free Energy", "9.9 Potencial de celda y energía libre"],
    "chem-metals": ["chem", "unit-1-atomic-structure/metals-nonmetals-and-metalloids/", "Metals, Nonmetals & Metalloids", "Metales, no metales y metaloides"],
    "chem-trends-periods": ["chem", "unit-2-quantum/periodic-trends-periods/", "Periodic Trends (Periods)", "Tendencias periódicas (periodos)"],
    "chem-trends-groups": ["chem", "unit-2-quantum/periodic-trends-groups/", "Periodic Trends (Groups)", "Tendencias periódicas (grupos)"],
    "chem-emission": ["chem", "unit-2-quantum/emissions-spectra/", "Emission Spectra", "Espectros de emisión"],
    "chem-charge": ["chem", "unit-3-ionic-bonding/valence-electrons-and-predicting-charge/", "Predicting Charge", "Predicción de la carga"],
    "chem-ionic-properties": ["chem", "unit-3-ionic-bonding/properties-of-ionic-compounds/", "Properties of Ionic Compounds", "Propiedades de los compuestos iónicos"],
    "chem-ternary": ["chem", "unit-3-ionic-bonding/ternary-compounds/", "Ternary Compounds", "Compuestos ternarios"],
    "chem-balancing": ["chem", "unit-3-ionic-bonding/balancing-and-classifying/", "Balancing and Classifying", "Balanceo y clasificación"],
    "chem-single": ["chem", "unit-3-ionic-bonding/single-replacement-reactions/", "Single-Replacement Reactions", "Reacciones de sustitución simple"],
    "chem-double": ["chem", "unit-3-ionic-bonding/double-replacement-reactions/", "Double-Replacement Reactions", "Reacciones de sustitución doble"],
    "chem-nie-double": ["chem", "unit-3-ionic-bonding/net-ionic-equations-double/", "Net Ionic Equations (Double)", "Ecuaciones iónicas netas (doble)"],
    "chem-nie-single": ["chem", "unit-3-ionic-bonding/net-ionic-equations-single/", "Net Ionic Equations (Single)", "Ecuaciones iónicas netas (simple)"],
    "chem-lewis": ["chem", "unit-4-covalent-bonding/lewis-structures/", "Lewis Structures", "Estructuras de Lewis"],
    "chem-vsepr": ["chem", "unit-4-covalent-bonding/vsepr/", "VSEPR", "VSEPR"],
    "chem-bond-properties": ["chem", "unit-4-covalent-bonding/bond-properties/", "Bond Properties", "Propiedades de los enlaces"],
    "chem-redox-balancing": ["chem", "unit-5-reactions/balancing-redox-reactions/", "Balancing Redox Reactions", "Balanceo de reacciones redox"],
    "chem-gravimetric": ["chem", "unit-6-stoichiometry/gravimetric-analysis/", "Gravimetric Analysis", "Análisis gravimétrico"],
    "chem-mole-ratios": ["chem", "unit-6-stoichiometry/mole-ratios/", "Mole Ratios", "Relaciones molares"],
    "chem-3-step": ["chem", "unit-6-stoichiometry/3-step-conversions/", "3-Step Conversions", "Conversiones de 3 pasos"],
    "chem-limiting": ["chem", "unit-6-stoichiometry/limiting-and-excess-reactants/", "Limiting & Excess Reactants", "Reactivo limitante y en exceso"],
    "chem-solubility-curves": ["chem", "unit-7-solutions/solubility-curves/", "Solubility Curves", "Curvas de solubilidad"],
    "chem-molarity": ["chem", "unit-7-solutions/molarity-calculations/", "Molarity Calculations", "Cálculos de molaridad"],
    "chem-dilutions": ["chem", "unit-7-solutions/dilutions/", "Dilutions", "Diluciones"],
    "chem-titrations": ["chem", "unit-7-solutions/titrations/", "Titrations", "Titulaciones"],
    "chem-beers-law": ["chem", "unit-7-solutions/beers-law/", "Beer's Law", "Ley de Beer"],
    "chem-rate-factors": ["chem", "unit-8-kinetics/factors-affecting-reaction-rate/", "Factors Affecting Reaction Rate", "Factores que afectan la velocidad de reacción"],
    "chem-le-chatelier": ["chem", "unit-8-kinetics/le-chateliers-principle/", "Le Châtelier's Principle", "Principio de Le Châtelier"],
    "chem-ph": ["chem", "unit-8-kinetics/ph-calculations/", "pH Calculations", "Cálculos de pH"],
    "chem-buffers": ["chem", "unit-8-kinetics/buffers/", "Buffers", "Soluciones amortiguadoras"],
    "chem-pe-diagrams": ["chem", "unit-9-thermochemistry/pe-diagrams/", "PE Diagrams", "Diagramas de energía potencial"],
    "chem-calorimetry": ["chem", "unit-9-thermochemistry/calorimetry/", "Calorimetry", "Calorimetría"],
    "chem-gibbs": ["chem", "unit-9-thermochemistry/entropy-enthalpy-and-gibbs-energy/", "Entropy, Enthalpy & Gibbs Energy", "Entropía, entalpía y energía de Gibbs"],
    "phys-position-graphs": ["phys", "unit-1-linear-motion/position-time-graphs/", "Position-Time Graphs", "Gráficas de posición contra tiempo"],
    "phys-velocity-graphs": ["phys", "unit-1-linear-motion/velocity-time-graphs/", "Velocity-Time Graphs", "Gráficas de velocidad contra tiempo"],
    "phys-acceleration": ["phys", "unit-1-linear-motion/acceleration/", "Acceleration", "Aceleración"],
    "phys-types-of-forces": ["phys", "unit-2-forces-and-newtons-laws/types-of-forces/", "Types of Forces", "Tipos de fuerzas"],
    "phys-free-body": ["phys", "unit-2-forces-and-newtons-laws/free-body-diagrams/", "Free-Body Diagrams", "Diagramas de cuerpo libre"],
    "phys-net-force": ["phys", "unit-2-forces-and-newtons-laws/net-force/", "Net Force", "Fuerza neta"],
    "phys-second-law": ["phys", "unit-2-forces-and-newtons-laws/newtons-second-law/", "Newton's Second Law", "Segunda ley de Newton"],
    "phys-vector-components": ["phys", "unit-3-2d-dynamics/vector-components/", "Vector Components", "Componentes de vectores"],
    "phys-horizontal-projectiles": ["phys", "unit-3-2d-dynamics/horizontal-projectiles/", "Horizontal Projectiles", "Proyectiles horizontales"],
    "phys-angled-projectiles": ["phys", "unit-3-2d-dynamics/angled-projectiles/", "Angled Projectiles", "Proyectiles con ángulo"],
    "phys-momentum-conservation": ["phys", "unit-4-impulse-and-momentum/conservation-of-momentum/", "Conservation of Momentum", "Conservación de la cantidad de movimiento"],
    "phys-collisions": ["phys", "unit-4-impulse-and-momentum/collisions/", "Collisions", "Colisiones"],
    "phys-gpe": ["phys", "unit-5-energy/gravitational-potential-energy/", "Gravitational Potential Energy", "Energía potencial gravitacional"],
    "phys-epe": ["phys", "unit-5-energy/elastic-potential-energy/", "Elastic Potential Energy", "Energía potencial elástica"],
    "phys-energy-conservation": ["phys", "unit-5-energy/conservation-of-energy/", "Conservation of Energy", "Conservación de la energía"],
    "phys-electric-fields": ["phys", "unit-6-fields/electric-fields/", "Electric Fields", "Campos eléctricos"],
    "phys-circuit-basics": ["phys", "unit-7-electric-circuits/circuit-basics/", "Circuit Basics", "Conceptos básicos de circuitos"],
    "phys-ohms-law": ["phys", "unit-7-electric-circuits/ohms-law/", "Ohm's Law", "Ley de Ohm"],
    "phys-series-circuits": ["phys", "unit-7-electric-circuits/series-circuits/", "Series Circuits", "Circuitos en serie"],
    "phys-induction": ["phys", "unit-8-electromagnetism/electromagnetic-induction/", "Electromagnetic Induction", "Inducción electromagnética"],
    "phys-standing-waves": ["phys", "unit-9-waves/standing-waves/", "Standing Waves", "Ondas estacionarias"],
    "phys-refraction": ["phys", "unit-9-waves/refraction/", "Refraction", "Refracción"],
    "qs-scientific-notation": ["qs", "numbers/scientific-notation/", "Scientific Notation", "Notación científica"],
    "qs-significant-figures": ["qs", "numbers/significant-figures/", "Significant Figures", "Cifras significativas"],
    "qs-calculator": ["qs", "numbers/calculator-skills/", "Calculator Skills", "Habilidades con la calculadora"],
    "qs-ratios-and-proportions": ["qs", "ratios-and-percents/ratios-and-proportions/", "Ratios and Proportions", "Razones y proporciones"],
    "qs-percents": ["qs", "ratios-and-percents/percents/", "Percents", "Porcentajes"],
    "qs-percent-error-and-percent-change": ["qs", "ratios-and-percents/percent-error-and-percent-change/", "Percent Error and Percent Change", "Error porcentual y cambio porcentual"],
    "qs-reading-graphs": ["qs", "graphs-and-change/reading-graphs/", "Reading Graphs", "Lectura de gráficas"],
    "qs-slope": ["qs", "graphs-and-change/slope-and-rate-of-change/", "Slope and Rate of Change", "Pendiente y razón de cambio"],
    "lab-flame-test": ["labs", "flame-test-forensics/", "Flame Test Forensics", "Análisis forense con la prueba de la llama"],
    "lab-net-ionic": ["labs", "net-ionic-equations-lab/", "Net Ionic Equations Lab", "Laboratorio de ecuaciones iónicas netas"]
  };
  function apUnit(n, topics, en, es) {
    return {lessons: ["ap-unit-" + n],
      en: "Review AP Chemistry Unit " + n + ", " + en + ", with " + topics + " original questions. Each answer gets an explanation right away, and your score is broken down by topic.",
      es: "Repasa la unidad " + n + " de Química AP, " + es + ", con " + topics + " preguntas originales. Cada respuesta recibe una explicación al instante, y tu puntuación se desglosa por tema."};
  }
  // Activity folder: intro (one or two short sentences) and its lessons, most specific first. On pages whose
  // root has no side padding, wrap names the class that lines the section up with the page's footer.
  var ACTIVITIES = {
    "act": {lessons: ["act-prep"], wrap: "zsa-act-wrap",
      en: "Practice the English, Math, Reading and Science sections of the ACT, or take a full practice test. You get a score estimate and tips for the skills you missed.",
      es: "Practica las secciones de inglés, matemáticas, lectura y ciencias del ACT, o haz un examen completo de práctica. Recibes una estimación de tu puntuación y consejos para las habilidades que fallaste."},
    "act-question-generator": {lessons: ["act-prep"],
      en: "Warm up for the ACT one question at a time. Pick English, Math or Science, answer, then reveal the correct answer and explanation.",
      es: "Prepárate para el ACT una pregunta a la vez. Elige inglés, matemáticas o ciencias, responde y luego revela la respuesta correcta y su explicación."},
    "apchem-unit1-practice": apUnit(1, 48, "Atomic Structure and Properties", "Estructura atómica y propiedades"),
    "apchem-unit2-practice": apUnit(2, 42, "Compound Structure and Properties", "Estructura y propiedades de los compuestos"),
    "apchem-unit3-practice": apUnit(3, 78, "Properties of Substances and Mixtures", "Propiedades de sustancias y mezclas"),
    "apchem-unit4-practice": apUnit(4, 54, "Chemical Reactions", "Reacciones químicas"),
    "apchem-unit5-practice": apUnit(5, 66, "Kinetics", "Cinética"),
    "apchem-unit6-practice": apUnit(6, 54, "Thermochemistry", "Termoquímica"),
    "apchem-unit7-practice": apUnit(7, 72, "Equilibrium", "Equilibrio"),
    "apchem-unit8-practice": apUnit(8, 66, "Acids and Bases", "Ácidos y bases"),
    "apchem-unit9-practice": apUnit(9, 66, "Thermodynamics and Electrochemistry", "Termodinámica y electroquímica"),
    "atwood-machine": {lessons: ["phys-second-law", "phys-net-force"],
      en: "Hang two masses over a pulley and predict which way they will move. Compare the net force, the acceleration and the string tension to see Newton's second law at work.",
      es: "Cuelga dos masas sobre una polea y predice hacia dónde se moverán. Compara la fuerza neta, la aceleración y la tensión de la cuerda para ver la segunda ley de Newton en acción."},
    "beers-law-lab": {lessons: ["chem-beers-law", "ap-3.13"],
      en: "Use a virtual spectrophotometer to measure solutions of known concentration and build a calibration curve. Then use the curve to find the concentration of an unknown.",
      es: "Usa un espectrofotómetro virtual para medir soluciones de concentración conocida y construir una curva de calibración. Luego usa la curva para encontrar la concentración de una muestra desconocida."},
    "calorimetry-lab": {lessons: ["chem-calorimetry", "ap-6.4"],
      en: "Drop heated metals into water and mix acids with bases in a calorimeter. Track the temperature and use the energy balance to calculate specific heat and enthalpy.",
      es: "Sumerge metales calientes en agua y mezcla ácidos con bases en un calorímetro. Sigue la temperatura y usa el balance de energía para calcular el calor específico y la entalpía."},
    "chemical-bonding-lab": {lessons: ["chem-ionic-properties", "chem-bond-properties", "ap-2.1"],
      en: "Test four unknown solids for conductivity, melting point, solubility and malleability. Use the evidence to decide whether each one is ionic, covalent or metallic.",
      es: "Prueba cuatro sólidos desconocidos para medir su conductividad, punto de fusión, solubilidad y maleabilidad. Usa la evidencia para decidir si cada uno es iónico, covalente o metálico."},
    "circuit-builder": {lessons: ["phys-circuit-basics", "phys-ohms-law", "phys-series-circuits"],
      en: "Build circuits from batteries, wires, resistors, switches and bulbs. Probe voltage and current with a multimeter and see how each change affects the bulbs.",
      es: "Construye circuitos con baterías, cables, resistencias, interruptores y focos. Mide el voltaje y la corriente con un multímetro y observa cómo cada cambio afecta a los focos."},
    "collision-carts": {lessons: ["phys-collisions", "phys-momentum-conservation"],
      en: "Crash two carts together in elastic and inelastic collisions. Watch the velocity and momentum vectors to see that total momentum stays the same.",
      es: "Haz chocar dos carritos en colisiones elásticas e inelásticas. Observa los vectores de velocidad y de cantidad de movimiento para comprobar que la cantidad de movimiento total se conserva."},
    "electrochemistry-lab": {lessons: ["ap-9.8", "ap-9.9"],
      en: "Build galvanic and electrolytic cells from metals and solutions. Trace the electrons, label the anode and cathode, and calculate the standard cell potential.",
      es: "Construye celdas galvánicas y electrolíticas con metales y soluciones. Sigue el flujo de electrones, identifica el ánodo y el cátodo, y calcula el potencial estándar de celda."},
    "equilibrium-k-lab": {lessons: ["ap-7.3", "ap-7.7", "ap-7.11"],
      en: "Write equilibrium expressions, compare Q with K, and fill in equilibrium tables step by step. Then use Ksp to explore molar solubility.",
      es: "Escribe expresiones de equilibrio, compara Q con K y completa tablas de equilibrio paso a paso. Luego usa Ksp para explorar la solubilidad molar."},
    "equilibrium-lab": {lessons: ["chem-le-chatelier", "ap-7.9"],
      en: "Stress a reaction at equilibrium by changing concentration, volume or temperature. Watch the live concentration graph and compare Qc with Kc to predict which way the reaction shifts.",
      es: "Altera una reacción en equilibrio cambiando la concentración, el volumen o la temperatura. Observa la gráfica de concentración en vivo y compara Qc con Kc para predecir hacia dónde se desplaza la reacción."},
    "equipotential-lab": {lessons: ["phys-electric-fields"],
      en: "Place point charges and use a virtual voltmeter to map electric potential. Draw equipotential lines and compare them with the electric field vectors.",
      es: "Coloca cargas puntuales y usa un voltímetro virtual para mapear el potencial eléctrico. Traza líneas equipotenciales y compáralas con los vectores del campo eléctrico."},
    "faraday-lab": {lessons: ["phys-induction"],
      en: "Drop a strong magnet through a copper tube and compare it with free fall. See how the moving magnet induces eddy currents that push back and slow it down.",
      es: "Deja caer un imán potente por un tubo de cobre y compáralo con la caída libre. Observa cómo el imán en movimiento induce corrientes parásitas que se oponen a su caída y lo frenan."},
    "flame-test-lab": {lessons: ["chem-emission", "lab-flame-test"],
      en: "Hold eight metal salts in a flame and record the color each one gives off. Use what you see to identify a mystery sample.",
      es: "Coloca ocho sales metálicas en una llama y registra el color que produce cada una. Usa lo que observas para identificar una muestra misteriosa."},
    "free-energy-lab": {lessons: ["chem-gibbs", "ap-9.3", "ap-9.5"],
      en: "Explore how enthalpy, entropy and temperature decide whether a process is favorable. Connect Gibbs free energy to K, dissolving and coupled reactions.",
      es: "Explora cómo la entalpía, la entropía y la temperatura determinan si un proceso es favorable. Relaciona la energía libre de Gibbs con K, la disolución y las reacciones acopladas."},
    "gas-lab": {lessons: ["ap-3.4", "ap-3.5"],
      en: "Move a piston and heat a box of gas particles while you watch the pressure. Graph the gas laws, read speed distributions, and compare ideal and real gases.",
      es: "Mueve un pistón y calienta una caja de partículas de gas mientras observas la presión. Grafica las leyes de los gases, interpreta distribuciones de rapidez y compara gases ideales y reales."},
    "gas-laws": {lessons: ["ap-3.4", "ap-3.5"], wrap: "zsa-about-wrap",
      en: "Lock one variable, change another, and watch the particles and the graph respond. Explore Boyle's, Charles's, Gay-Lussac's and Avogadro's laws.",
      es: "Fija una variable, cambia otra y observa cómo responden las partículas y la gráfica. Explora las leyes de Boyle, Charles, Gay-Lussac y Avogadro."},
    "gravimetric-lab": {lessons: ["chem-gravimetric"],
      en: "Dissolve an unknown metal carbonate, form a precipitate, then filter, dry and weigh it. Use the mass of the precipitate to identify the metal.",
      es: "Disuelve un carbonato metálico desconocido, forma un precipitado y luego fíltralo, sécalo y pésalo. Usa la masa del precipitado para identificar el metal."},
    "hookes-law-lab": {lessons: ["phys-epe"],
      en: "Hang slotted masses on a spring and measure how far it stretches. Find the spring constant, then set the spring bouncing and watch its position graph.",
      es: "Cuelga pesas ranuradas de un resorte y mide cuánto se estira. Encuentra la constante del resorte y luego hazlo oscilar y observa su gráfica de posición."},
    "inclined-plane": {lessons: ["phys-types-of-forces", "phys-free-body"],
      en: "Tilt a ramp until a block starts to slide. Compare gravity, the normal force and friction to see the difference between static and kinetic friction.",
      es: "Inclina una rampa hasta que un bloque empiece a deslizarse. Compara la gravedad, la fuerza normal y la fricción para ver la diferencia entre la fricción estática y la cinética."},
    "iodine-clock-lab": {lessons: ["chem-rate-factors", "ap-5.2"],
      en: "Mix the solutions for an iodine clock reaction and time the sudden color change. Change the concentration and temperature to see how they affect the rate.",
      es: "Mezcla las soluciones de una reacción de reloj de yodo y mide el tiempo hasta el cambio repentino de color. Cambia la concentración y la temperatura para ver cómo afectan la velocidad."},
    "ion-charge-trainer": {lessons: ["chem-charge", "ap-1.8"],
      en: "Use valence electrons to predict the charge each element forms as an ion. Step-by-step hints help when you get stuck.",
      es: "Usa los electrones de valencia para predecir la carga del ion que forma cada elemento. Las pistas paso a paso te ayudan cuando te atoras."},
    "ionic-reactions": {lessons: ["chem-balancing", "chem-single", "chem-double"],
      en: "Predict the products of synthesis, decomposition, single replacement and double replacement reactions. Write correct ionic formulas, then balance each equation.",
      es: "Predice los productos de reacciones de síntesis, descomposición, sustitución simple y sustitución doble. Escribe fórmulas iónicas correctas y luego balancea cada ecuación."},
    "kinetics-lab": {lessons: ["chem-rate-factors", "ap-5.5", "ap-5.11"],
      en: "Watch reactant particles collide and react in a box. Change the temperature, concentration and activation energy, or add a catalyst, and see how the rate changes.",
      es: "Observa cómo las partículas de los reactivos chocan y reaccionan en una caja. Cambia la temperatura, la concentración y la energía de activación, o agrega un catalizador, y observa cómo cambia la velocidad."},
    "lewis-vsepr": {lessons: ["chem-lewis", "chem-vsepr", "ap-2.7"],
      en: "Build Lewis structures step by step, then predict each molecule's shape, bond angle and polarity. Hints and feedback guide you at every step.",
      es: "Construye estructuras de Lewis paso a paso y luego predice la geometría, el ángulo de enlace y la polaridad de cada molécula. Las pistas y la retroalimentación te guían en cada paso."},
    "limiting-reactant": {lessons: ["chem-limiting", "ap-4.5"],
      en: "Choose starting amounts of two reactants and watch the molecules pair up into products. See which reactant runs out first and how much of the other is left over.",
      es: "Elige las cantidades iniciales de dos reactivos y observa cómo las moléculas se combinan para formar productos. Ve qué reactivo se agota primero y cuánto sobra del otro."},
    "metals-lab": {lessons: ["chem-metals"],
      en: "Test three unknown solids for luster, malleability, conductivity and reaction with acid. Use the results to classify each one as a metal, nonmetal or metalloid.",
      es: "Prueba tres sólidos desconocidos para observar su brillo, maleabilidad, conductividad y reacción con ácido. Usa los resultados para clasificar cada uno como metal, no metal o metaloide."},
    "net-ionic-lab": {lessons: ["chem-nie-double", "chem-nie-single", "lab-net-ionic"],
      en: "Mix pairs of solutions on a virtual lab bench and look for precipitates, metal displacement or no reaction. Use your observations to write net ionic equations.",
      es: "Mezcla pares de soluciones en una mesa de laboratorio virtual y busca precipitados, desplazamiento de metales o ausencia de reacción. Usa tus observaciones para escribir ecuaciones iónicas netas."},
    "pendulum-lab": {lessons: ["phys-energy-conservation", "phys-gpe"],
      en: "Swing a pendulum on Earth, the Moon or Jupiter and time its period. Watch kinetic and potential energy trade back and forth as it swings.",
      es: "Haz oscilar un péndulo en la Tierra, la Luna o Júpiter y mide su periodo. Observa cómo la energía cinética y la potencial se intercambian mientras oscila."},
    "periodic-table": {lessons: ["chem-trends-periods", "chem-trends-groups", "ap-1.7"],
      en: "Look up any of the 118 elements. Color the table by atomic radius, electronegativity or ionization energy to see the periodic trends.",
      es: "Consulta cualquiera de los 118 elementos. Colorea la tabla por radio atómico, electronegatividad o energía de ionización para ver las tendencias periódicas."},
    "periodic-trends": {lessons: ["chem-trends-periods", "chem-trends-groups", "ap-1.7"],
      en: "Compare pairs of elements by atomic radius, electronegativity and first ionization energy. Explain each answer with the trend across a period or down a group.",
      es: "Compara pares de elementos por su radio atómico, electronegatividad y primera energía de ionización. Explica cada respuesta con la tendencia a lo largo de un periodo o de un grupo."},
    "ph-buffer-lab": {lessons: ["chem-ph", "chem-buffers", "ap-8.8"],
      en: "Measure the pH of acids and bases, then design a buffer. Add acid or base to compare how well your buffer and plain water resist a change in pH.",
      es: "Mide el pH de ácidos y bases y luego diseña una solución amortiguadora. Agrega ácido o base para comparar qué tan bien resisten el cambio de pH tu amortiguador y el agua sola."},
    "physics-graphing-lab": {lessons: ["phys-position-graphs", "phys-velocity-graphs", "phys-acceleration"],
      en: "Predict how a moving cart's graphs will look, then run it and check. Connect the position, velocity and acceleration graphs to the motion you see.",
      es: "Predice cómo serán las gráficas de un carrito en movimiento y luego ponlo en marcha para comprobarlo. Relaciona las gráficas de posición, velocidad y aceleración con el movimiento que observas."},
    "polyatomic-ion-trainer": {lessons: ["chem-ternary"],
      en: "Learn the names, formulas and charges of common polyatomic ions. Study with flashcards, then test yourself with a multiple-choice challenge.",
      es: "Aprende los nombres, las fórmulas y las cargas de los iones poliatómicos comunes. Estudia con tarjetas de estudio y luego ponte a prueba con un reto de opción múltiple."},
    "projectile-lab": {lessons: ["phys-horizontal-projectiles", "phys-angled-projectiles", "phys-vector-components"],
      en: "Launch a projectile from any height, angle and speed. Watch its velocity components and acceleration as vectors to see why horizontal and vertical motion are independent.",
      es: "Lanza un proyectil desde cualquier altura, ángulo y rapidez. Observa sus componentes de velocidad y su aceleración como vectores para ver por qué el movimiento horizontal y el vertical son independientes."},
    "qs-percent-error-and-percent-change-practice": {lessons: ["qs-percent-error-and-percent-change"],
      en: "Find percent error from measured and accepted values, and percent change with its sign. Check which value goes on the bottom and what a sign means.",
      es: "Encuentra el porcentaje de error a partir de valores medidos y aceptados, y el cambio porcentual con su signo. Comprueba qué valor va abajo y qué significa un signo."},
    "qs-percents-practice": {lessons: ["qs-percents"],
      en: "Change percents to decimals and back, find a percent or a part of a whole, and work out percent composition and percent yield. Every set has new numbers.",
      es: "Cambia porcentajes a decimales y viceversa, encuentra un porcentaje o una parte de un total, y calcula la composición porcentual y el rendimiento porcentual. Cada serie tiene números nuevos."},
    "qs-ratios-and-proportions-practice": {lessons: ["qs-ratios-and-proportions", "chem-mole-ratios"],
      en: "Write ratios in order and in simplest form, solve proportions for maps, solutions, speeds and springs, and use mole ratios from balanced equations. Every set has new numbers.",
      es: "Escribe relaciones en orden y en su forma más simple, resuelve proporciones de mapas, soluciones, rapidez y resortes, y usa relaciones molares de ecuaciones balanceadas. Cada serie tiene números nuevos."},
    "qs-scientific-notation-practice": {lessons: ["qs-scientific-notation", "qs-calculator"],
      en: "Write numbers in scientific notation and back in standard notation, and read what the exponent says. Every set has new numbers, and each answer gets feedback right away.",
      es: "Escribe números en notación científica y de vuelta en notación estándar, e interpreta lo que dice el exponente. Cada serie tiene números nuevos, y cada respuesta recibe retroalimentación al instante."},
    "qs-significant-figures-practice": {lessons: ["qs-significant-figures"],
      en: "Count significant figures, round, and use the rules for multiplying, dividing, adding and subtracting. Every set has new numbers, and each answer gets feedback right away.",
      es: "Cuenta cifras significativas, redondea y usa las reglas para multiplicar, dividir, sumar y restar. Cada serie tiene números nuevos, y cada respuesta recibe retroalimentación al instante."},
    "reaction-energy-lab": {lessons: ["chem-pe-diagrams", "ap-6.2", "ap-6.9"],
      en: "Build energy diagrams for reactions and phase changes. Calculate reaction enthalpy from bond energies, enthalpies of formation and Hess's law.",
      es: "Construye diagramas de energía para reacciones y cambios de fase. Calcula la entalpía de reacción a partir de energías de enlace, entalpías de formación y la ley de Hess."},
    "redox-coach": {lessons: ["chem-redox-balancing", "ap-4.9"],
      en: "Balance redox half-reactions one step at a time in acidic or basic solution. Balance the atoms, add electrons, then combine and cancel to get the full equation.",
      es: "Balancea semirreacciones redox paso a paso en medio ácido o básico. Balancea los átomos, agrega electrones y luego combina y cancela para obtener la ecuación completa."},
    "scientific-calculator": {lessons: ["qs-calculator", "qs-scientific-notation"],
      en: "Practice the calculator skills science classes use, like scientific notation, exponents and order of operations. Six guided exercises check each step.",
      es: "Practica las habilidades con la calculadora que se usan en las clases de ciencias, como la notación científica, los exponentes y el orden de las operaciones. Seis ejercicios guiados revisan cada paso."},
    "snells-law-lab": {lessons: ["phys-refraction"],
      en: "Aim a laser into glass and plastic blocks and measure the angles with a protractor. Use Snell's law to find the index of refraction and explore total internal reflection.",
      es: "Apunta un láser hacia bloques de vidrio y de plástico y mide los ángulos con un transportador. Usa la ley de Snell para encontrar el índice de refracción y explora la reflexión interna total."},
    "solutions-lab": {lessons: ["chem-molarity", "chem-dilutions", "chem-solubility-curves"],
      en: "Make solutions of a given molarity, dilute stock solutions, and read solubility curves. Check each calculation against what happens in the beaker.",
      es: "Prepara soluciones de una molaridad dada, diluye soluciones concentradas e interpreta curvas de solubilidad. Comprueba cada cálculo con lo que pasa en el vaso de precipitados."},
    "standing-waves-lab": {lessons: ["phys-standing-waves"],
      en: "Vibrate a string to create harmonics and freeze the motion with a strobe. Measure the spacing between nodes to find the wavelength.",
      es: "Haz vibrar una cuerda para crear armónicos y congela el movimiento con una luz estroboscópica. Mide la distancia entre los nodos para encontrar la longitud de onda."},
    "stoichiometry-coach": {lessons: ["chem-mole-ratios", "chem-3-step", "ap-4.5"],
      en: "Set up conversion factors, cancel units and solve stoichiometry problems one step at a time. Feedback points out the step that went wrong.",
      es: "Plantea factores de conversión, cancela unidades y resuelve problemas de estequiometría paso a paso. La retroalimentación señala el paso en el que hubo un error."},
    "titration-lab": {lessons: ["chem-titrations", "ap-8.5"],
      en: "Titrate strong and weak acids and bases with a virtual burette, pH meter and indicators. Read the pH curve to find the equivalence point and the pKa.",
      es: "Titula ácidos y bases fuertes y débiles con una bureta virtual, un medidor de pH e indicadores. Interpreta la curva de pH para encontrar el punto de equivalencia y el pKa."},
    "virtual-lab-graphing": {lessons: ["qs-reading-graphs", "qs-slope"],
      en: "Enter your lab data to make a scatter plot with a line of best fit. Label the axes, find the slope, and download the graph for your lab report.",
      es: "Ingresa tus datos de laboratorio para hacer una gráfica de dispersión con una línea de mejor ajuste. Rotula los ejes, encuentra la pendiente y descarga la gráfica para tu reporte de laboratorio."}
  };
  var TEXT = {
    heading: {en: "About this activity", es: "Acerca de esta actividad"},
    lessons: {en: "Related lessons", es: "Lecciones relacionadas"}
  };
  function lesson(key, lang) {
    var l = LESSONS[key], course = COURSES[l[0]];
    return {key: key, href: HOST + (lang === "es" ? "/es" : "") + course.path + l[1], title: lang === "es" ? l[3] : l[2], course: course[lang]};
  }
  function about(slug, lang) {
    var a = ACTIVITIES[slug];
    if (!a) return null;
    lang = lang === "es" ? "es" : "en";
    return {heading: TEXT.heading[lang], intro: a[lang], lessonsHeading: TEXT.lessons[lang], wrap: a.wrap || "",
      lessons: a.lessons.map(function (key) { return lesson(key, lang); })};
  }
  var api = {about: about, activities: Object.keys(ACTIVITIES), lessons: LESSONS, courses: COURSES, host: HOST};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  var section = document.querySelector("[data-zsa-about]");
  if (!section) return;
  var params = new URLSearchParams(window.location.search);
  // Embedded in a zornscience.org lesson, the host page already introduces the activity.
  if (params.get("embed") === "1") { section.hidden = true; return; }
  var slug = section.getAttribute("data-zsa-about"), shown = "en";
  function render(lang) {
    var copy = about(slug, lang);
    if (!copy || lang === shown) return;
    shown = lang;
    section.lang = lang === "es" ? "es-MX" : "en";
    section.querySelector("[data-zsa-about-heading]").textContent = copy.heading;
    section.querySelector("[data-zsa-about-intro]").textContent = copy.intro;
    section.querySelector("[data-zsa-about-lessons-heading]").textContent = copy.lessonsHeading;
    copy.lessons.forEach(function (l) {
      var item = section.querySelector('[data-zsa-lesson="' + l.key + '"]');
      if (!item) return;
      var link = item.querySelector("a");
      link.href = l.href; link.textContent = l.title;
      item.querySelector("[data-zsa-lesson-course]").textContent = l.course;
    });
  }
  // Follow the page language. Activities set it from ?lang=es and when they switch language in place;
  // pages without Spanish keep lang="en", so the section stays in English with them.
  function current() { return /^es\b/.test(document.documentElement.lang) ? "es" : "en"; }
  render(current());
  new MutationObserver(function () { render(current()); }).observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
}());
