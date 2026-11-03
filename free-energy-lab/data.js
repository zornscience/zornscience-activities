(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="free-energy-lab"]'),
    I;
  root.dispatchEvent(
    new CustomEvent("zsa:request-i18n", {
      detail: {
        receive: function (a) {
          I = a;
        },
      },
    }),
  );
  I.configure({
    title: "Free Energy Lab",
    es: {
      Reaction: "Reacción",
      "Choose a prediction": "Elige una predicción",
      Species: "Especie",
      View: "Vista",
      "Particle view": "Vista de partículas",
      Reset: "Reiniciar",
      "reactants favored": "se favorecen los reactivos",
      "products favored": "se favorecen los productos",
      solid: "continua",
      dashed: "discontinua",
      particles: "partículas",
      undefined: "no definido",
      Row: "Fila",
      "Correct answer.": "Respuesta correcta.",
      Step: "Paso",
      "Net coefficient": "Coeficiente neto",
      "Data table": "Tabla de datos",
      "Copy data": "Copiar datos",
      "Download CSV": "Descargar CSV",
      "Data to copy": "Datos para copiar",
      "Experiment data": "Datos del experimento",
      "Explore. Compare. Explain. Nothing you enter leaves this tab.":
        "Explora. Compara. Explica. Nada de lo que ingresas sale de esta pestaña.",
      "← Back to the lesson": "← Volver a la lección",
      "This lab needs JavaScript.": "Este laboratorio necesita JavaScript.",
      "Data selected. Copy with Ctrl+C or Command+C.":
        "Datos seleccionados. Copia con Ctrl+C o Command+C.",
      "Data copied.": "Datos copiados.",
      "CSV downloaded.": "CSV descargado.",
      "ZornScience home": "Inicio de ZornScience",
      "Activity tools": "Herramientas de la actividad",
      Instructions: "Instrucciones",
      Share: "Compartir",
      "Share activity": "Compartir actividad",
      Close: "Cerrar",
      "Close instructions": "Cerrar instrucciones",
      "Close share options": "Cerrar opciones para compartir",
      "Share this activity": "Compartir esta actividad",
      "Share a fresh activity. Your answers and experiment data are not included.":
        "Comparte la actividad desde cero. No se incluyen tus respuestas ni los datos de tu experimento.",
      "Share link": "Enlace para compartir",
      "Copy link": "Copiar enlace",
      Email: "Correo electrónico",
      "Lab modes": "Modos del laboratorio",
      "solid line": "línea continua",
      "dashed line": "línea discontinua",
      "Formation data": "Datos de formación",
      "Coupling steps": "Etapas del acoplamiento",
      "Link copied.": "Enlace copiado.",
      "Link selected. Copy it with Ctrl+C or Command+C.":
        "Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
      "Spontaneous and fast": "Espontánea y rápida",
      "Not spontaneous": "No espontánea",
      "Correct. The coupled reaction is spontaneous.":
        "Correcto. La reacción acoplada es espontánea.",
      "Favored partner: {equation}; {g} = {value} {unit}":
        "Reacción favorecida para acoplar: {equation}; {g} = {value} {unit}",
      "300 K density": "Densidad a 300 K",
      "400 K density": "Densidad a 400 K",
      "Observed rate: {rate}; {g} = {value} {unit}.":
        "Velocidad de reacción observada: {rate}; {g} = {value} {unit}.",
      "Each water molecule has one red oxygen and two gray hydrogens.":
        "Cada molécula de agua tiene un oxígeno rojo y dos hidrógenos grises.",
      "Solid line: logarithmic K scale. Dashed line: K = 1. Blue marker: current K.":
        "Línea continua: escala logarítmica de K. Línea discontinua: K = 1. Marcador azul: K actual.",
      Coefficient: "Coeficiente",
      "Free Energy Lab": "Laboratorio virtual de entropía y energía libre",
      "Predict. Calculate. Explain. Entropy connects particle dispersal with thermodynamic favorability.":
        "Predice. Calcula. Explica. La entropía conecta la dispersión de partículas con la favorabilidad termodinámica.",
      "Connect particle dispersal, entropy and Gibbs free energy. Predict before checking your answer.":
        "Relaciona la dispersión de partículas, la entropía y la energía libre de Gibbs. Predice antes de verificar tu respuesta.",
      "Choose a mode and a reaction or process.":
        "Elige un modo y una reacción o proceso.",
      "Predict a sign or enter a calculation, then press Check.":
        "Predice un signo o escribe un cálculo y luego presiona Verificar.",
      "Convert entropy from J to kJ before using ΔG = ΔH − TΔS.":
        "Convierte la entropía de J a kJ antes de usar ΔG = ΔH − TΔS.",
      "Compare diagrams with the Data table. Copy or download your data.":
        "Compara los diagramas con la tabla de datos. Copia o descarga tus datos.",
      "Entropy Explorer": "Exploración de la entropía",
      "ΔS° Calculator": "Cálculo de ΔS°",
      "ΔS Calculator": "Cálculo de ΔS",
      "ΔG and Temperature": "ΔG y temperatura",
      "Kinetic vs Thermodynamic Control": "Control cinético y termodinámico",
      "ΔG° and K": "ΔG° y K",
      "Dissolving and Coupled Reactions": "Disolución y reacciones acopladas",
      "thermodynamically favored": "termodinámicamente favorecida",
      "not thermodynamically favored": "termodinámicamente no favorecida",
      spontaneous: "espontánea",
      "not spontaneous": "no espontánea",
      "at equilibrium in the standard state":
        "en equilibrio en el estado estándar",
      "Entropy conversion: {s} ÷ 1000 = {converted} {unit}":
        "Conversión de entropía: {s} ÷ 1000 = {converted} {unit}",
      "Particle comparison. See the description and Data table.":
        "Comparación de partículas. Consulta la descripción y la tabla de datos.",
      Solid: "Sólido",
      Liquid: "Líquido",
      Gas: "Gas",
      "Solid: fixed lattice. Liquid: mobile neighbors. Gas: widely dispersed particles. More accessible microstates mean greater entropy.":
        "Sólido: red fija. Líquido: partículas vecinas móviles. Gas: partículas muy dispersas. Más microestados accesibles significan mayor entropía.",
      State: "Estado",
      "Particle arrangement": "Distribución de partículas",
      "Fixed lattice": "Red fija",
      "Mobile neighbors": "Partículas vecinas móviles",
      "Widely dispersed": "Muy dispersas",
      "Small volume": "Volumen pequeño",
      "Large volume": "Volumen grande",
      "The same 12 particles occupy a larger volume after expansion into a vacuum.":
        "Las mismas 12 partículas ocupan un volumen mayor después de expandirse al vacío.",
      Volume: "Volumen",
      Particles: "Partículas",
      "At higher temperature, particles have a wider range of speeds. Cooling from 400 K to 300 K decreases entropy.":
        "A mayor temperatura, las partículas tienen un intervalo más amplio de rapideces. El enfriamiento de 400 K a 300 K disminuye la entropía.",
      "The lattice separates into hydrated ions. Water orders around each ion. For NaCl, total entropy increases.":
        "La red se separa en iones hidratados. El agua se ordena alrededor de cada ion. Para NaCl, la entropía total aumenta.",
      Before: "Antes",
      After: "Después",
      Reactants: "Reactivos",
      Products: "Productos",
      "Particle counts are schematic. Use the stoichiometric gas amounts below.":
        "Las cantidades de partículas son esquemáticas. Usa las cantidades estequiométricas de gas que se muestran abajo.",
      Side: "Lado",
      "Moles of gas": "Moles de gas",
      "Maxwell-Boltzmann style curves: 300 K is taller and narrower than 400 K.":
        "Curvas de tipo Maxwell-Boltzmann: la de 300 K es más alta y estrecha que la de 400 K.",
      "Speed (m/s)": "Rapidez (m/s)",
      "Relative density": "Densidad relativa",
      "300 K: solid line (blue). 400 K: dashed line (purple). Equal areas represent the same number of particles.":
        "300 K: línea continua (azul). 400 K: línea discontinua (morada). Las áreas iguales representan el mismo número de partículas.",
      Process: "Proceso",
      "Predict ΔS": "Predicción de ΔS",
      "Choose a sign": "Elige un signo",
      Check: "Verificar",
      "Choose a prediction first.": "Primero elige una predicción.",
      "Correct.": "Correcto.",
      "Try again.": "Inténtalo de nuevo.",
      "Use coefficients: sum n × S° for each side. You may enter an arithmetic sum.":
        "Usa los coeficientes: suma n × S° para cada lado. Puedes escribir una suma aritmética.",
      "Given ΔS° = −146.4. Find S°(NO₂).":
        "ΔS° dada = −146.4. Calcula S°(NO₂).",
      "ΣnS°(products)": "ΣnS°(productos)",
      "ΣnS°(reactants)": "ΣnS°(reactivos)",
      "Check products": "Verificar productos",
      "Check reactants": "Verificar reactivos",
      "Correct sum.": "Suma correcta.",
      "Try again. Include every coefficient.":
        "Inténtalo de nuevo. Incluye cada coeficiente.",
      "Unknown S°(NO₂), J/(mol·K)": "S°(NO₂) desconocida, J/(mol·K)",
      "Correct. S°(NO₂) = 240.1 J/(mol·K).":
        "Correcto. S°(NO₂) = 240.1 J/(mol·K).",
      "Use 2S°(NO₂) − [2S°(NO) + S°(O₂)] = −146.4.":
        "Usa 2S°(NO₂) − [2S°(NO) + S°(O₂)] = −146.4.",
      "S° table": "Tabla de S°",
      "Elements do not have S° = 0. This differs from ΔH°f and ΔG°f.":
        "Los elementos no tienen S° = 0. Esto es diferente de ΔH°f y ΔG°f.",
      Quantity: "Cantidad",
      Value: "Valor",
      Unit: "Unidad",
      "ΔG vs T graph": "Gráfica de ΔG contra T",
      "Gibbs free energy versus temperature. Shading marks negative Gibbs free energy. See Data table.":
        "Energía libre de Gibbs contra temperatura. El sombreado indica energía libre de Gibbs negativa. Consulta la tabla de datos.",
      "Temperature (K)": "Temperatura (K)",
      "Blue solid line: Gibbs free energy. Dashed line: zero. Green shading: negative Gibbs free energy.":
        "Línea continua azul: energía libre de Gibbs. Línea discontinua: cero. Sombreado verde: energía libre de Gibbs negativa.",
      "Crossover temperature": "Temperatura de cruce",
      "No positive crossover temperature.":
        "No hay temperatura de cruce positiva.",
      "The crossover is outside the plotted interval.":
        "La temperatura de cruce está fuera del intervalo de la gráfica.",
      "Gibbs free energy is zero at every temperature.":
        "La energía libre de Gibbs es cero a cualquier temperatura.",
      "Temperature, numeric (K)": "Temperatura numérica (K)",
      "25 °C = 298 K. Use kelvin in every equation.":
        "25 °C = 298 K. Usa kelvin en cada ecuación.",
      "Forgot to convert J to kJ. Divide ΔS by 1000 first.":
        "Olvidaste convertir J a kJ. Primero divide ΔS entre 1000.",
      "Try again. Convert ΔS to kJ and keep the minus sign.":
        "Inténtalo de nuevo. Convierte ΔS a kJ y conserva el signo menos.",
      "Four-case sign grid": "Cuadro de los cuatro casos de signos",
      "Choose the temperature pattern for the current ΔH and ΔS.":
        "Elige el patrón de temperatura para los valores actuales de ΔH y ΔS.",
      "ΔH − / ΔS +: all T": "ΔH − / ΔS +: cualquier T",
      "ΔH + / ΔS −: never": "ΔH + / ΔS −: nunca",
      "ΔH − / ΔS −: low T only": "ΔH − / ΔS −: solo T baja",
      "ΔH + / ΔS +: high T only": "ΔH + / ΔS +: solo T alta",
      "Correct pattern.": "Patrón correcto.",
      "Try again. Compare the signs of ΔH and ΔS.":
        "Inténtalo de nuevo. Compara los signos de ΔH y ΔS.",
      "The four cases assume nonzero ΔH and ΔS and T > 0.":
        "Los cuatro casos suponen ΔH y ΔS distintos de cero y T > 0.",
      "Gibbs free energy of formation": "Energía libre de Gibbs de formación",
      "ΔG°rxn = ΣnΔG°f(products) − ΣnΔG°f(reactants). Elements in their standard states have ΔG°f = 0.":
        "ΔG°rxn = ΣnΔG°f(productos) − ΣnΔG°f(reactivos). Los elementos en sus estados estándar tienen ΔG°f = 0.",
      "Correct. 2(−371.1) − [2(−300.2) + 0] = −141.8.":
        "Correcto. 2(−371.1) − [2(−300.2) + 0] = −141.8.",
      "Try again. Apply coefficients before subtracting.":
        "Inténtalo de nuevo. Aplica los coeficientes antes de restar.",
      "Kinetic control": "Control cinético",
      Case: "Caso",
      "Thermodynamic favorability does not determine rate. A slow reaction may be far from equilibrium.":
        "La favorabilidad termodinámica no determina la velocidad de reacción. Una reacción lenta puede estar lejos del equilibrio.",
      "Spontaneous does not mean fast.": "Espontáneo no significa rápido.",
      "Add a catalyst": "Agregar un catalizador",
      "Raise T": "Aumentar T",
      "Add light": "Agregar luz",
      Classification: "Clasificación",
      "Choose a classification": "Elige una clasificación",
      "Under kinetic control": "Bajo control cinético",
      "Thermodynamically unfavored": "Termodinámicamente no favorecida",
      "Favored and fast": "Favorecida y rápida",
      "Correct classification.": "Clasificación correcta.",
      "Try again. Compare the sign of ΔG with the observed rate.":
        "Inténtalo de nuevo. Compara el signo de ΔG con la velocidad de reacción observada.",
      "Energy diagram": "Diagrama de energía",
      "Schematic energy diagram. Activation barrier and Gibbs energy are listed in the Data table.":
        "Diagrama esquemático de energía. La barrera de activación y la energía de Gibbs están en la tabla de datos.",
      "Reaction progress": "Avance de la reacción",
      "Solid line: energy pathway. Dashed line: activation barrier. Diagram is schematic, not to scale.":
        "Línea continua: trayectoria de energía. Línea discontinua: barrera de activación. El diagrama es esquemático, no está a escala.",
      "Observed rate": "Velocidad de reacción observada",
      "Observable reaction (illustrative).":
        "Reacción observable (ilustrativa).",
      "No observable reaction on this timescale.":
        "No hay reacción observable en esta escala de tiempo.",
      "Catalysts lower Ea, not ΔG. Light initiates H₂ + Cl₂. Heating increases the fraction that surmounts Ea.":
        "Los catalizadores reducen Ea, no ΔG. La luz inicia H₂ + Cl₂. El calentamiento aumenta la fracción que supera Ea.",
      "Heating here changes only the kinetic comparison. ΔG stays at its reference value; real ΔG may also change with temperature. Rates and Ea are illustrative.":
        "Aquí el calentamiento solo cambia la comparación cinética. ΔG conserva su valor de referencia; la ΔG real también puede cambiar con la temperatura. Las velocidades de reacción y Ea son ilustrativas.",
      "Relative observed rate": "Velocidad de reacción observada relativa",
      Illustrative: "Ilustrativa",
      Calculation: "Cálculo",
      "ΔG to K": "De ΔG a K",
      "K to ΔG": "De K a ΔG",
      "Given value": "Valor dado",
      "Enter a valid value. K must be positive.":
        "Escribe un valor válido. K debe ser positiva.",
      "ΔG slider (−60 to +60 kJ)": "Control de ΔG (−60 a +60 kJ)",
      "Your result": "Tu resultado",
      "Try again. Use kelvin and convert ΔG from kJ to J.":
        "Inténtalo de nuevo. Usa kelvin y convierte ΔG de kJ a J.",
      "ΔH, ΔS → ΔG → K": "ΔH, ΔS → ΔG → K",
      "Chain reaction": "Reacción para la secuencia",
      "R = 8.314 J/(mol·K). Keep the exponent unrounded. Rounding it early changes K.":
        "R = 8.314 J/(mol·K). Conserva el exponente sin redondear. Redondearlo antes cambia K.",
      "Gibbs conversion: {value} kJ × 1000 = {j} J":
        "Conversión de Gibbs: {value} kJ × 1000 = {j} J",
      "K > 1: products favored": "K > 1: se favorecen los productos",
      "K < 1: reactants favored": "K < 1: se favorecen los reactivos",
      "K on a logarithmic scale. See Data table.":
        "K en escala logarítmica. Consulta la tabla de datos.",
      "K (log scale)": "K (escala logarítmica)",
      "The marker is clamped at the graph ends. The numerical K is not clamped.":
        "El marcador se limita a los extremos de la gráfica. El valor numérico de K no se limita.",
      "Chain K = {k}": "K de la secuencia = {k}",
      Exponent: "Exponente",
      "Show solution": "Mostrar solución",
      "Check chain": "Verificar secuencia",
      "The chain ΔG° differs from the given ΔG° because of rounding.":
        "La ΔG° de la secuencia difiere de la ΔG° dada por el redondeo.",
      "Chain ΔG (kJ)": "ΔG de la secuencia (kJ)",
      "Chain ΔG° (kJ/molrxn)": "ΔG° de la secuencia (kJ/molrxn)",
      "Chain K": "K de la secuencia",
      "Ion-dipole attractions": "Atracciones ion-dipolo",
      "Water oxygen ends face cations. Hydrogen ends face anions. Hydration orders nearby water.":
        "Los extremos de oxígeno del agua apuntan hacia los cationes. Los de hidrógeno apuntan hacia los aniones. La hidratación ordena el agua cercana.",
      Anion: "Anión",
      Cation: "Catión",
      "Red oxygen (δ−) faces the cation. Gray hydrogen (δ+) faces the anion. Dashed lines show ion-dipole attractions.":
        "El oxígeno rojo (δ−) apunta hacia el catión. El hidrógeno gris (δ+) apunta hacia el anión. Las líneas discontinuas muestran atracciones ion-dipolo.",
      "Ion dispersal raises entropy; ordering of water can lower it. The total ΔS determines the result.":
        "La dispersión de iones aumenta la entropía; el ordenamiento del agua puede disminuirla. La ΔS total determina el resultado.",
      "Iron extraction": "Extracción de hierro",
      "Mercury extraction": "Extracción de mercurio",
      "Driving factor": "Factor impulsor",
      "Entropy-driven": "Impulsada por la entropía",
      "Enthalpy-driven": "Impulsada por la entalpía",
      "Not favored": "No favorecida",
      "Try again. Compare ΔH and −TΔS, then the sign of ΔG.":
        "Inténtalo de nuevo. Compara ΔH y −TΔS y luego el signo de ΔG.",
      "Unfavored step: {equation}; {g} = +{value} {unit}":
        "Etapa no favorecida: {equation}; {g} = +{value} {unit}",
      "Favored partner": "Reacción favorecida para acoplar",
      "No partner": "Sin reacción para acoplar",
      "Coupled reactions": "Reacciones acopladas",
      "Choose a partner with the keyboard or pointer. Opposite coefficients cancel the common intermediate.":
        "Elige una reacción con el teclado o el puntero. Los coeficientes opuestos cancelan el intermediario común.",
      "Common intermediate": "Intermediario común",
      "No common intermediate": "Sin intermediario común",
      "Choose a favored partner to cancel the intermediate.":
        "Elige una reacción favorecida para cancelar el intermediario.",
      "Correct. The coupled reaction is thermodynamically favored.":
        "Correcto. La reacción acoplada está termodinámicamente favorecida.",
      "Try again. Add the Gibbs energies with their signs.":
        "Inténtalo de nuevo. Suma las energías de Gibbs con sus signos.",
      "Unfavored reaction": "Reacción no favorecida",
      "Matter becomes more dispersed. Moles of gas increase from 0 to 1.":
        "La materia se dispersa más. Los moles de gas aumentan de 0 a 1.",
      "Matter becomes less dispersed. Moles of gas decrease from 3 to 0.":
        "La materia se dispersa menos. Los moles de gas disminuyen de 3 a 0.",
      "Argon cooled from 400 K to 300 K at constant volume":
        "Argón enfriado de 400 K a 300 K a volumen constante",
      "Cooling reduces the number of accessible microstates. Energy becomes less dispersed.":
        "El enfriamiento reduce el número de microestados accesibles. La energía se dispersa menos.",
      "Matter becomes less dispersed. Moles of gas decrease from 4 to 2.":
        "La materia se dispersa menos. Los moles de gas disminuyen de 4 a 2.",
      "Matter becomes more dispersed. For NaCl, ion dispersal outweighs ordering of water around ions.":
        "La materia se dispersa más. Para NaCl, la dispersión de iones supera el ordenamiento del agua alrededor de los iones.",
      "A gas expanding into a vacuum": "Un gas que se expande al vacío",
      "Matter becomes more dispersed. More positions and microstates are available.":
        "La materia se dispersa más. Hay más posiciones y microestados disponibles.",
      "Matter becomes more dispersed as the solid lattice becomes a liquid.":
        "La materia se dispersa más al pasar de la red sólida a un líquido.",
      "Illustrative exothermic dispersal": "Dispersión exotérmica ilustrativa",
      "Illustrative endothermic ordering":
        "Ordenamiento endotérmico ilustrativo",
      "Sucrose + O₂": "Sacarosa + O₂",
      "H₂(g) + Cl₂(g) → 2HCl(g), in the dark":
        "H₂(g) + Cl₂(g) → 2HCl(g), en la oscuridad",
      "Illustrative unfavored reaction": "Reacción no favorecida ilustrativa",
      "Acetic acid": "Ácido acético",
      "Your Gibbs free energy (kJ)": "Tu energía libre de Gibbs (kJ)",
      "Your formation-method result (kJ)":
        "Tu resultado por el método de formación (kJ)",
      "Combined Gibbs free energy (kJ)":
        "Energía libre de Gibbs combinada (kJ)",
      "Your Gibbs free energy (kJ/molrxn)":
        "Tu energía libre de Gibbs (kJ/molrxn)",
      "Your formation-method result (kJ/molrxn)":
        "Tu resultado por el método de formación (kJ/molrxn)",
      "Combined Gibbs free energy (kJ/molrxn)":
        "Energía libre de Gibbs combinada (kJ/molrxn)",
      "Chain ΔG": "Secuencia ΔG",
      "Chain ΔG°": "Secuencia ΔG°",
      "Thermodynamically favored does not mean fast.":
        "Termodinámicamente favorecido no significa rápido.",
      "Formation data determine Gibbs free energy at 298 K. No ΔH or ΔS is supplied for a temperature graph.":
        "Los datos de formación determinan la energía libre de Gibbs a 298 K. No se proporcionan ΔH ni ΔS para una gráfica de temperatura.",
    },
  });
})();
