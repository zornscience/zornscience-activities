(function () {
  "use strict";
  // Hooke's Law & Harmonic Motion: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, equations, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="hookes-law-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Hooke’s Law & Harmonic Motion", es:{
  // Header, instructions and share
  "Hooke’s Law & Harmonic Motion": "Ley de Hooke y movimiento armónico",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share a fresh lab. Each link opens a fresh bench.": "Comparte el laboratorio desde cero. Cada enlace abre una mesa nueva.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore spring extension and simple harmonic motion on a virtual lab bench.": "Explora la elongación de un resorte y el movimiento armónico simple en una mesa de laboratorio virtual.",
  "Explore a spring in motion": "Exploración de un resorte en movimiento",
  "Determine k from the slope of force against extension. Then test how mass and amplitude affect the period.": "Determina k a partir de la pendiente de la fuerza contra la elongación. Luego prueba cómo la masa y la amplitud afectan el periodo.",
  "Choose a spring and add slotted masses. Total mass includes the 50 g hanger.": "Elige un resorte y agrega pesas ranuradas. La masa total incluye el portapesas de 50 g.",
  "Pause to inspect a moment, step forward 0.02 s, or choose slow motion. The graph shows displacement from equilibrium, positive downward. The graph shows roughly four cycles. After two complete cycles, a bracket measures the time between successive peaks. Compare this measured period with T = 2π√(m/k).": "Pausa para observar un instante, avanza 0.02 s o elige cámara lenta. La gráfica muestra el desplazamiento desde el equilibrio, positivo hacia abajo. La gráfica muestra unos cuatro ciclos. Después de dos ciclos completos, un corchete mide el tiempo entre picos sucesivos. Compara este periodo medido con T = 2π√(m/k).",
  "Try damping, change the mass, or compare springs. Show the spring constant when ready to check your reasoning.": "Prueba el amortiguamiento, cambia la masa o compara resortes. Muestra la constante del resorte cuando quieras revisar tu razonamiento.",
  "Share opens a fresh lab. There are no worksheets, data-entry areas, or saved observations.": "Compartir abre el laboratorio desde cero. No hay hojas de trabajo, áreas para registrar datos ni observaciones guardadas.",
  // Two instruction steps name a button in bold. Each is one full Spanish sentence template; **text** marks the bold button name.
  "Use **Settle at equilibrium** to stop motion. The force-extension graph shows the equilibrium relationship; the dot follows your selected mass. Read extension from the unloaded reference line to the pointer. At equilibrium, mg = kΔL, so k = mg/ΔL. Convert centimeters to meters.": "Usa **Llevar al equilibrio** para detener el movimiento. La gráfica de fuerza contra elongación muestra la relación en equilibrio; el punto sigue la masa que elegiste. Mide la elongación desde la línea de referencia sin carga hasta el indicador. En equilibrio, mg = kΔL, así que k = mg/ΔL. Convierte los centímetros a metros.",
  "Choose a displacement, then press **Pull & release**, or drag the hanger and let go. Arrow keys on the hanger also adjust its displacement; Enter releases it.": "Elige un desplazamiento y luego presiona **Jalar y soltar**, o arrastra el portapesas y suéltalo. Las flechas del teclado sobre el portapesas también ajustan su desplazamiento; Enter lo suelta.",
  // Setup panels
  "01 / BUILD YOUR SYSTEM": "01 / ARMA TU SISTEMA",
  "Spring & masses": "Resorte y masas",
  "Extension spring": "Resorte de extensión",
  "Spring A · soft": "Resorte A · suave",
  "Spring B · medium": "Resorte B · medio",
  "Spring C · firm": "Resorte C · rígido",
  "Slotted masses": "Pesas ranuradas",
  "50 g hanger + slotted masses": "Portapesas de 50 g + pesas ranuradas",
  "{g} g total suspended mass": "{g} g de masa suspendida en total",
  "Settle at equilibrium": "Llevar al equilibrio",
  "02 / SET IT IN MOTION": "02 / PONLO EN MOVIMIENTO",
  "Release displacement": "Desplazamiento al soltar",
  "Pull & release": "Jalar y soltar",
  "Damping": "Amortiguamiento",
  "None · ideal spring": "Ninguno · resorte ideal",
  "Light · air resistance": "Ligero · resistencia del aire",
  "Strong · damped motion": "Fuerte · movimiento amortiguado",
  "Show forces": "Mostrar fuerzas",
  "Show spring constant": "Mostrar la constante del resorte",
  "k = {f} N / {x} m = {k} N/m. Ideal T = {period} s (no damping).": "k = {f} N / {x} m = {k} N/m. T ideal = {period} s (sin amortiguamiento).",
  // Bench and apparatus
  "THE EXPERIMENT": "EL EXPERIMENTO",
  "Mass-spring system": "Sistema masa-resorte",
  "AT EQUILIBRIUM": "EN EQUILIBRIO",
  "OSCILLATING": "OSCILANDO",
  "HELD": "SUJETA",
  "PAUSED": "EN PAUSA",
  "RETORT STAND / HELICAL SPRING / SLOTTED MASSES": "SOPORTE UNIVERSAL / RESORTE HELICOIDAL / PESAS RANURADAS",
  "EARTH · 9.81 m/s²": "TIERRA · 9.81 m/s²",
  "Spring and hanging masses on a laboratory stand": "Resorte y masas colgantes en un soporte de laboratorio",
  "A calibrated ruler measures spring extension. Drag the mass hanger to displace the spring.": "Una regla calibrada mide la elongación del resorte. Arrastra el portapesas para desplazar el resorte.",
  "Unloaded end": "Extremo sin carga",
  "Equilibrium": "Equilibrio",
  "Mass displacement, centimeters from equilibrium": "Desplazamiento de la masa, en centímetros desde el equilibrio",
  "{cm} centimeters from equilibrium, positive downward": "{cm} centímetros desde el equilibrio, positivo hacia abajo",
  "DRAG HANGER TO PULL & RELEASE": "ARRASTRA EL PORTAPESAS PARA JALAR Y SOLTAR",
  "CAST IRON RETORT STAND": "SOPORTE UNIVERSAL DE HIERRO FUNDIDO",
  "SIMULATION TIME / s": "TIEMPO SIMULADO / s",
  "DIGITAL TIMER": "CRONÓMETRO DIGITAL",
  "{g} g total": "{g} g en total",
  "Spring": "Resorte",
  // Transport and readouts
  "▶ Resume": "▶ Reanudar",
  "Ⅱ Pause": "Ⅱ Pausar",
  "Step 0.02 s": "Avanzar 0.02 s",
  "Time speed": "Ritmo de la simulación",
  "1× real time": "1× tiempo real",
  "¼× slow motion": "¼× cámara lenta",
  "⅒× slow motion": "⅒× cámara lenta",
  "Reset lab": "Reiniciar laboratorio",
  "Total mass": "Masa total",
  "Equilibrium extension": "Elongación en equilibrio",
  "Weight, mg": "Peso, mg",
  "Displacement ↓": "Desplazamiento ↓",
  // Forces (each a full sentence; the lab joins whole sentences with spaces)
  "Weight: {w} N down.": "Peso: {w} N hacia abajo.",
  "Spring force: {s} N up.": "Fuerza del resorte: {s} N hacia arriba.",
  "Spring force: {s} N down.": "Fuerza del resorte: {s} N hacia abajo.",
  "Net force: {n} N (balanced).": "Fuerza neta: {n} N (equilibrada).",
  "Net force: {n} N (balanced) (includes damping).": "Fuerza neta: {n} N (equilibrada) (incluye el amortiguamiento).",
  "Net force: {n} N down.": "Fuerza neta: {n} N hacia abajo.",
  "Net force: {n} N down (includes damping).": "Fuerza neta: {n} N hacia abajo (incluye el amortiguamiento).",
  "Net force: {n} N up.": "Fuerza neta: {n} N hacia arriba.",
  "Net force: {n} N up (includes damping).": "Fuerza neta: {n} N hacia arriba (incluye el amortiguamiento).",
  // Status messages
  "At equilibrium. Add mass to stretch the spring, or pull and release to start oscillating.": "En equilibrio. Agrega masa para estirar el resorte, o jala y suelta para que empiece a oscilar.",
  "New setup at equilibrium. Pull and release to compare its motion.": "Configuración nueva en equilibrio. Jala y suelta para comparar su movimiento.",
  "Released. Compare peaks in the graph, or pause to inspect the spring.": "Se soltó la masa. Compara los picos en la gráfica o pausa para observar el resorte.",
  "Zero displacement: the mass stays at equilibrium. Choose a nonzero pull to start oscillating.": "Desplazamiento cero: la masa se queda en equilibrio. Elige un jalón distinto de cero para que empiece a oscilar.",
  "At equilibrium: spring force equals weight. Use k = mg / extension (in meters).": "En equilibrio: la fuerza del resorte es igual al peso. Usa k = mg / elongación (en metros).",
  "The mass is at rest. Use Pull & release to start an oscillation.": "La masa está en reposo. Usa Jalar y soltar para iniciar una oscilación.",
  "Fresh lab. Add mass or pull and release to begin.": "Laboratorio desde cero. Agrega masa o jala y suelta para empezar.",
  // Graph panel
  "WATCH THE PATTERN": "OBSERVA EL PATRÓN",
  "Force vs. extension": "Fuerza contra elongación",
  "Position vs. time": "Posición contra tiempo",
  "At equilibrium": "En equilibrio",
  "About four cycles": "Unos cuatro ciclos",
  "Investigate": "Investiga",
  "Find the spring constant": "Obtención de la constante del resorte",
  "Mass and period": "Masa y periodo",
  "Amplitude and period": "Amplitud y periodo",
  "Damping and motion": "Amortiguamiento y movimiento",
  "What to look for": "Qué observar",
  "Choose graph": "Elige la gráfica",
  "Force & extension": "Fuerza y elongación",
  "Position & time": "Posición y tiempo",
  "Live displacement from equilibrium versus time": "Desplazamiento desde el equilibrio contra tiempo, en vivo",
  "Positive displacement is downward. An ideal oscillation traces a sine wave.": "El desplazamiento positivo es hacia abajo. Una oscilación ideal traza una onda senoidal.",
  "Displacement from equilibrium versus time": "Desplazamiento desde el equilibrio contra tiempo",
  "Equilibrium force versus extension": "Fuerza en equilibrio contra elongación",
  "Positive displacement is downward. Brackets mark time between measured peaks.": "El desplazamiento positivo es hacia abajo. Los corchetes marcan el tiempo entre los picos medidos.",
  "A straight line through the origin represents Hooke’s law. The dot marks the selected mass at rest.": "Una línea recta que pasa por el origen representa la ley de Hooke. El punto marca la masa elegida en reposo.",
  "Zero is the equilibrium position. Positive displacement is downward on the apparatus and above zero on this graph. Pause freezes both views.": "El cero es la posición de equilibrio. El desplazamiento positivo es hacia abajo en el aparato y arriba del cero en esta gráfica. Pausar congela ambas vistas.",
  "The line shows the ideal equilibrium relationship, F = kΔL. The dot marks this load at rest, even while the mass oscillates. Slope = force / extension in meters.": "La línea muestra la relación ideal en equilibrio, F = kΔL. El punto marca esta carga en reposo, aunque la masa esté oscilando. Pendiente = fuerza / elongación en metros.",
  "Force (N)": "Fuerza (N)",
  "Extension (m)": "Elongación (m)",
  "Displacement (cm), + downward": "Desplazamiento (cm), + hacia abajo",
  "Time (s)": "Tiempo (s)",
  "This load: {f} N at {x} m extension.": "Esta carga: {f} N con una elongación de {x} m.",
  "Measured period: {period} s (successive positive peaks).": "Periodo medido: {period} s (picos positivos sucesivos).",
  "Watch for two positive peaks to measure one full cycle.": "Espera dos picos positivos para medir un ciclo completo.",
  "Pull and release to see the wave and measure its period.": "Jala y suelta para ver la onda y medir su periodo.",
  // Investigation prompts and hints
  "Keep the same spring. Add 50 g at a time. What happens to extension when the total weight doubles?": "Usa el mismo resorte. Agrega 50 g a la vez. ¿Qué le pasa a la elongación cuando el peso total se duplica?",
  "At rest, spring force equals weight. Find k = weight / extension in meters, or use the slope of the force-extension graph. A steeper line means a stiffer spring.": "En reposo, la fuerza del resorte es igual al peso. Calcula k = peso / elongación en metros, o usa la pendiente de la gráfica de fuerza contra elongación. Una línea más inclinada significa un resorte más rígido.",
  "Predict first: does a heavier mass oscillate faster or slower? Keep spring and release displacement fixed, then change only the mass.": "Primero predice: ¿una masa más grande oscila más rápido o más lento? Mantén fijos el resorte y el desplazamiento al soltar, y cambia solo la masa.",
  "Release each setup and wait for the measured period. Period is one full cycle, from a peak to the next peak. Compare total mass, including the hanger.": "Suelta cada configuración y espera el periodo medido. El periodo es un ciclo completo, de un pico al siguiente. Compara la masa total, incluido el portapesas.",
  "Predict first: will a larger pull change the period? Keep spring and mass fixed. Compare releases from 2 cm and 4 cm with no damping.": "Primero predice: ¿un jalón más grande cambiará el periodo? Mantén fijos el resorte y la masa. Compara soltar desde 2 cm y desde 4 cm sin amortiguamiento.",
  "A larger displacement makes a taller wave. For this ideal spring, the period stays the same. Changing amplitude changes the maximum speed, not the cycle time.": "Un desplazamiento mayor produce una onda más alta. En este resorte ideal, el periodo no cambia. Cambiar la amplitud cambia la rapidez máxima, no el tiempo de cada ciclo.",
  "Keep mass, spring and release displacement fixed. Compare no damping with light or strong damping.": "Mantén fijos la masa, el resorte y el desplazamiento al soltar. Compara el caso sin amortiguamiento con un amortiguamiento ligero o fuerte.",
  "Damping removes mechanical energy. The peaks shrink toward equilibrium. Use no damping when testing the ideal period formula.": "El amortiguamiento quita energía mecánica. Los picos se reducen hacia el equilibrio. Usa la opción sin amortiguamiento cuando pruebes la fórmula ideal del periodo.",
  // Model note and footer
  "Physics behind the bench": "La física del experimento",
  "At equilibrium: mg = kΔL. During motion: mÿ + bẏ + ky = 0, where y is displacement from equilibrium. With no damping, T = 2π√(m/k). Reveal the spring constant to check a value you determine from force and extension. The spring can both stretch and compress in this ideal model. The massless spring is ideal and stays elastic throughout this lab’s range. The hanger contributes 50 g. Real springs have mass and an elastic limit; excessive loading can permanently deform them.": "En equilibrio: mg = kΔL. Durante el movimiento: mÿ + bẏ + ky = 0, donde y es el desplazamiento desde el equilibrio. Sin amortiguamiento, T = 2π√(m/k). Revela la constante del resorte para comprobar el valor que determines a partir de la fuerza y la elongación. En este modelo ideal, el resorte puede estirarse y comprimirse. El resorte sin masa es ideal y se mantiene elástico en todo el rango de este laboratorio. El portapesas aporta 50 g. Los resortes reales tienen masa y un límite elástico; una carga excesiva puede deformarlos de forma permanente.",
  "The ruler’s zero aligns with the unloaded spring end; its pointer tracks the loaded end. Equipment is illustrated to scale along the motion axis; weights are enlarged for visibility. Changing spring, mass, or damping starts a fresh motion trace. No measurements are stored.": "El cero de la regla coincide con el extremo del resorte sin carga; su indicador sigue el extremo con carga. El equipo está dibujado a escala a lo largo del eje del movimiento; las pesas se agrandaron para que se vean mejor. Cambiar el resorte, la masa o el amortiguamiento inicia un trazo de movimiento nuevo. No se guarda ninguna medición.",
  "ZornScience · Explore. Observe. Explain.": "ZornScience · Explora. Observa. Explica."
}};
  // The two instruction steps with a bold button name are rebuilt from one full template each, so Spanish keeps its own word order.
  // Read their English before configure() translates the pieces.
  var rich = Array.from(root.querySelectorAll("#zsa-th-instructions li")).filter(function (li) { return li.querySelector("strong"); }).map(function (li) {
    return [li, Array.from(li.childNodes).map(function (n) { return n.nodeType === 1 ? "**" + n.textContent + "**" : n.textContent; }).join("")];
  });
  i18n.configure(copy);
  rich.forEach(function (item) {
    var li = item[0], text = i18n.text(item[1]);
    if (text === item[1]) return;
    li.replaceChildren();
    text.split("**").forEach(function (part, i) {
      if (!part) return;
      if (i % 2) { var b = document.createElement("strong"); b.textContent = part; li.appendChild(b); }
      else li.appendChild(document.createTextNode(part));
    });
  });
}());
