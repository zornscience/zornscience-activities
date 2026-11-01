// Equilibrium Sandbox: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
// English is the default and the fallback. Sentences with numbers, formulas or units are full templates with
// {placeholders}, so each language keeps its own word order. Formulas, units, numbers and decimal points stay unchanged.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="equilibrium-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Equilibrium Sandbox", es:{
  // Header, share panel and footer
  "Equilibrium Sandbox": "Explorador del equilibrio",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share activity": "Compartir actividad",
  "Share": "Compartir",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Share a fresh lab. Your experiment settings and data are not included.": "Comparte el laboratorio desde cero. No se incluyen los ajustes ni los datos de tu experimento.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore Le Chatelier’s principle with concentration, volume and temperature changes, live concentration graphs, and Kc and Qc.": "Explora el principio de Le Châtelier con cambios de concentración, volumen y temperatura, gráficas de concentración en tiempo real, y Kc y Qc.",
  "← All activities": "← Todas las actividades",
  "This lab requires JavaScript to run the simulation.": "Este laboratorio necesita JavaScript para ejecutar la simulación.",
  "ZornScience · Idealized models for learning": "ZornScience · Modelos idealizados para aprender",
  "Download lab data (CSV)": "Descargar datos del laboratorio (CSV)",
  "Print lab": "Imprimir laboratorio",
  // Instructions dialog
  "How to use this lab": "Cómo usar este laboratorio",
  "Close instructions": "Cerrar instrucciones",
  "Start at equilibrium, predict a shift, then change one condition and watch the system respond.": "Empieza en equilibrio, predice un desplazamiento y luego cambia una condición y observa cómo responde el sistema.",
  "Disturb the equilibrium and use the live concentrations to explain the shift.": "Perturba el equilibrio y usa las concentraciones en tiempo real para explicar el desplazamiento.",
  "Disturb the reaction.": "Perturba la reacción.",
  "Add or remove N₂O₄ or NO₂. Watch the concentrations jump and then settle to a new equilibrium.": "Agrega o quita N₂O₄ o NO₂. Observa cómo las concentraciones cambian de golpe y luego se estabilizan en un nuevo equilibrio.",
  "Change the volume.": "Cambia el volumen.",
  "Compress or expand the vessel. Predict which direction is favored by the number of gas molecules.": "Comprime o expande el recipiente. Predice qué dirección se favorece según el número de moléculas de gas.",
  "Change the temperature.": "Cambia la temperatura.",
  "The forward reaction is endothermic. Compare the new Kc with the value at 298 K.": "La reacción directa es endotérmica. Compara la nueva Kc con el valor a 298 K.",
  "Explain the evidence.": "Explica la evidencia.",
  "Compare Qc with Kc and use the live graph. Pause to inspect a change; Reset experiment starts fresh.": "Compara Qc con Kc y usa la gráfica en tiempo real. Pausa para examinar un cambio. Reiniciar experimento empieza desde cero.",
  "Try a compression": "Prueba una compresión",
  "Reduce the volume from 5 L to 2 L. Both concentrations rise immediately, then the reaction shifts toward N₂O₄, the side with fewer gas molecules.": "Reduce el volumen de 5 L a 2 L. Ambas concentraciones aumentan de inmediato y luego la reacción se desplaza hacia el N₂O₄, el lado con menos moléculas de gas.",
  "Download your data as CSV or print the lab. This idealized model uses accelerated time for learning.": "Descarga tus datos en CSV o imprime el laboratorio. Este modelo idealizado usa tiempo acelerado para aprender.",
  // Controls
  "Reset experiment": "Reiniciar experimento",
  "Change the conditions": "Cambia las condiciones",
  "Temperature": "Temperatura",
  "Volume": "Volumen",
  "Volume changes pressure; temperature changes Kc.": "El volumen cambia la presión. La temperatura cambia Kc.",
  "Add or remove substance": "Agregar o quitar sustancia",
  "N₂O₄ · reactant": "N₂O₄ · reactivo",
  "NO₂ · product": "NO₂ · producto",
  "Closed between disturbances. Substance buttons briefly open the system.": "Cerrado entre perturbaciones. Los botones de sustancia abren el sistema por un momento.",
  "Pause": "Pausar",
  "Resume": "Reanudar",
  "Advance 1 s": "Avanzar 1 s",
  "Time is accelerated. Advance pauses the run for inspection.": "El tiempo está acelerado. Avanzar pausa la simulación para que la examines.",
  // Reaction vessel and rates
  "02 / OBSERVE THE SYSTEM": "02 / OBSERVA EL SISTEMA",
  "The reaction vessel": "El recipiente de reacción",
  "VARIABLE-VOLUME REACTOR": "REACTOR DE VOLUMEN VARIABLE",
  "IDEAL GAS MODEL": "MODELO DE GAS IDEAL",
  "Molecular illustration of reactant and product in a variable-volume vessel": "Ilustración molecular del reactivo y el producto en un recipiente de volumen variable",
  "Blue atoms: N · amber atoms: O   /   Schematic molecule counts": "Átomos azules: N · átomos ámbar: O   /   Número esquemático de moléculas",
  "Empty vessel": "Recipiente vacío",
  "At equilibrium": "En equilibrio",
  "Shifting right →": "Desplazamiento a la derecha →",
  "← Shifting left": "← Desplazamiento a la izquierda",
  "Kc · Qc = {q}": "Kc · Qc = {q}",
  "undefined": "indefinido",
  "Pressure": "Presión",
  "Dynamic equilibrium": "Equilibrio dinámico",
  "Equal rates do not require equal concentrations. Bars compare the two directions at this instant and are scaled to the faster rate. Use the numbers to compare across times.": "Velocidades iguales no requieren concentraciones iguales. Las barras comparan las dos direcciones en este instante y se escalan a la velocidad mayor. Usa los números para comparar entre distintos momentos.",
  "Forward →": "Directa →",
  "← Reverse": "← Inversa",
  "Relative forward reaction rate": "Velocidad relativa de la reacción directa",
  "Relative reverse reaction rate": "Velocidad relativa de la reacción inversa",
  "Both reactions continue at equilibrium. Rate indicators use an illustrative reversible rate law.": "Ambas reacciones continúan en el equilibrio. Los indicadores de velocidad usan una ley de velocidad reversible ilustrativa.",
  "No molecules: neither reaction can occur. Add substance to begin.": "No hay moléculas: ninguna de las dos reacciones puede ocurrir. Agrega sustancia para empezar.",
  "Nearly equal, nonzero rates: both reactions continue while concentrations are stable. Equilibrium is detected when Qc is within 0.5% of Kc. Values are illustrative mol/(L·simulated s), not experimental kinetics.": "Velocidades casi iguales y distintas de cero: ambas reacciones continúan mientras las concentraciones se mantienen estables. Se detecta el equilibrio cuando Qc está a menos de 0.5% de Kc. Los valores son ilustrativos en mol/(L·s simulado), no cinética experimental.",
  "The faster direction changes the composition. Rate indicators are illustrative mol/(L·simulated s); compare their sizes.": "La dirección más rápida cambia la composición. Los indicadores de velocidad son ilustrativos en mol/(L·s simulado). Compara sus tamaños.",
  // Graph
  "03 / FOLLOW THE RESPONSE": "03 / SIGUE LA RESPUESTA",
  "Concentration vs. time": "Concentración en función del tiempo",
  "Live concentrations of N2O4 and NO2 in mol per liter": "Concentraciones en tiempo real de N2O4 y NO2 en mol por litro",
  "· vertical dotted lines mark disturbances. Concentration (mol/L); time in simulated seconds.": "· las líneas verticales punteadas marcan las perturbaciones. Concentración (mol/L). Tiempo en segundos simulados.",
  "Concentration (mol/L) versus time; blue N2O4, dashed brown NO2.": "Concentración (mol/L) en función del tiempo. N2O4 en azul, NO2 en café discontinuo.",
  "Simulated time (s)": "Tiempo simulado (s)",
  // Explanations
  "Start at equilibrium. Make one change and compare Qc with Kc as the system responds.": "Empieza en equilibrio. Haz un cambio y compara Qc con Kc mientras el sistema responde.",
  "Heating favors the endothermic forward reaction. Kc increases; the system produces more NO₂.": "Calentar favorece la reacción directa endotérmica. Kc aumenta y el sistema produce más NO₂.",
  "Cooling favors the exothermic reverse reaction. Kc decreases; the system produces more N₂O₄.": "Enfriar favorece la reacción inversa exotérmica. Kc disminuye y el sistema produce más N₂O₄.",
  "Compression instantly raises both concentrations. The reaction then shifts left toward fewer gas molecules. Kc stays constant.": "La compresión aumenta al instante ambas concentraciones. Luego la reacción se desplaza a la izquierda, hacia menos moléculas de gas. Kc se mantiene constante.",
  "Expansion instantly lowers both concentrations. The reaction then shifts right toward more gas molecules. Kc stays constant.": "La expansión disminuye al instante ambas concentraciones. Luego la reacción se desplaza a la derecha, hacia más moléculas de gas. Kc se mantiene constante.",
  "Added {amount} mol {species}. The reaction shifts right toward products. Kc stays constant.": "Agregaste {amount} mol de {species}. La reacción se desplaza a la derecha, hacia los productos. Kc se mantiene constante.",
  "Added {amount} mol {species}. The reaction shifts left toward reactants. Kc stays constant.": "Agregaste {amount} mol de {species}. La reacción se desplaza a la izquierda, hacia los reactivos. Kc se mantiene constante.",
  "Removed {amount} mol {species}. The reaction shifts right toward products. Kc stays constant.": "Quitaste {amount} mol de {species}. La reacción se desplaza a la derecha, hacia los productos. Kc se mantiene constante.",
  "Removed {amount} mol {species}. The reaction shifts left toward reactants. Kc stays constant.": "Quitaste {amount} mol de {species}. La reacción se desplaza a la izquierda, hacia los reactivos. Kc se mantiene constante.",
  "This run has reached its recording limit. Reset experiment to start a new graph.": "Esta simulación llegó a su límite de registro. Usa Reiniciar experimento para empezar una gráfica nueva.",
  // About the model
  "About the model": "Acerca del modelo",
  "Kc = [NO₂]²/[N₂O₄]. Qc uses the current concentrations. Qc < Kc favors products; Qc > Kc favors reactants. Equilibrium means equal forward and reverse rates, not equal concentrations.": "Kc = [NO₂]²/[N₂O₄]. Qc usa las concentraciones actuales. Si Qc < Kc, se favorecen los productos. Si Qc > Kc, se favorecen los reactivos. Equilibrio significa velocidades directa e inversa iguales, no concentraciones iguales.",
  "Ideal-gas, reversible mass-action teaching model. Kc = 0.150 at 298 K; van ’t Hoff temperature dependence uses constant ΔH°. The illustrative rates are rforward = 0.25 Kc[N₂O₄] and rreverse = 0.25[NO₂]²; they are not measured kinetics. The rate law models one reversible elementary step, not a rule for all reactions. Simulated seconds are accelerated. Pressure uses P = nRT/V.": "Modelo didáctico de gas ideal basado en la ley de acción de masas para una reacción reversible. Kc = 0.150 a 298 K. La dependencia de la temperatura de van ’t Hoff usa un ΔH° constante. Las velocidades ilustrativas son rdirecta = 0.25 Kc[N₂O₄] y rinversa = 0.25[NO₂]². No son cinética medida. La ley de velocidad modela un solo paso elemental reversible, no una regla para todas las reacciones. Los segundos simulados están acelerados. La presión usa P = nRT/V.",
  // CSV header row (column names students download)
  "time_s,N2O4_M,NO2_M,temperature_K,volume_L,Kc,Qc,forward_rate_M_per_sim_s,reverse_rate_M_per_sim_s": "tiempo_s,N2O4_M,NO2_M,temperatura_K,volumen_L,Kc,Qc,velocidad_directa_M_por_s_sim,velocidad_inversa_M_por_s_sim"
  }};
  // configure() rewrites link hrefs as absolute URLs. Keep the relative "All activities" link as it was, with
  // ?lang=es added in Spanish, so the English page markup stays unchanged.
  var back = root.querySelector(".zsa-back"), backHref = back && back.getAttribute("href");
  i18n.configure(copy);
  if (back && backHref === "../") back.setAttribute("href", i18n.lang === "es" ? "../?lang=es" : "../");
}());
