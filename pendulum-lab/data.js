(function () {
  "use strict";
  // The Simple Pendulum: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="pendulum-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  var copy = {title:"The Simple Pendulum", es:{
  // Header, instructions and share
  "The Simple Pendulum": "El péndulo simple",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share this simulation. Each link opens a fresh apparatus.": "Comparte esta simulación. Cada enlace abre un aparato nuevo.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore pendulum motion and energy on Earth, the Moon and Jupiter.": "Explora el movimiento y la energía de un péndulo en la Tierra, la Luna y Júpiter.",
  "Explore oscillations & energy": "Exploración de las oscilaciones y la energía",
  "Choose a one-variable comparison and make a prediction. The dashed outline is the original pendulum; the brass bob is the changed setup. Release both together to compare their motion.": "Elige una comparación de una sola variable y haz una predicción. El contorno punteado es el péndulo original; la esfera de latón es el montaje modificado. Suelta los dos al mismo tiempo para comparar su movimiento.",
  "Select {button}. Watch the energy move between potential energy at the ends and kinetic energy at the bottom.": "Selecciona {button}. Observa cómo la energía cambia entre energía potencial en los extremos y energía cinética en la parte más baja.",
  "Release bob": "Soltar la esfera",
  "Compare lengths while keeping the release angle fixed. Then change only the mass. What changes the period?": "Compara longitudes sin cambiar el ángulo de liberación. Luego cambia solo la masa. ¿Qué cambia el periodo?",
  "Transport the apparatus to the Moon or Jupiter. Try zero gravity: a bob released from rest stays still because there is no restoring force.": "Lleva el aparato a la Luna o a Júpiter. Prueba la gravedad cero: una esfera que se suelta desde el reposo se queda quieta porque no hay fuerza restauradora.",
  "Pause and use Step +0.05 s to inspect energy transfer. A complete oscillation returns to the starting side, not just the opposite side. In Free exploration, use the sliders or drag the bob. Sliders also work with keyboard arrow keys. Changing a setting resets the motion and clears the comparison.": "Pausa y usa Avanzar +0.05 s para examinar la transferencia de energía. Una oscilación completa regresa al lado inicial, no solo al lado opuesto. En Exploración libre, usa los controles deslizantes o arrastra la esfera. Los controles deslizantes también funcionan con las flechas del teclado. Al cambiar un ajuste, el movimiento se reinicia y se borra la comparación.",
  "The reference and changed pendulums are drawn over each other to compare their timing. In the mass comparison their paths overlap because mass does not change the period. The ideal model has no air resistance or pivot friction, a massless rigid suspension and a point-mass bob. Length is measured from the pivot to the bob’s center. Potential energy is zero at the lowest position. At zero gravity the ideal suspension keeps its geometry; a real string would be slack.": "El péndulo de referencia y el modificado se dibujan uno sobre otro para comparar sus tiempos. En la comparación de masas sus trayectorias coinciden porque la masa no cambia el periodo. El modelo ideal no tiene resistencia del aire ni fricción en el pivote, y usa una suspensión rígida sin masa y una esfera puntual. La longitud se mide desde el pivote hasta el centro de la esfera. La energía potencial es cero en la posición más baja. En gravedad cero, la suspensión ideal conserva su forma; un hilo real quedaría flojo.",
  // Comparisons
  "What changes the swing?": "¿Qué cambia la oscilación?",
  "Choose a comparison. Predict what will happen, then release both pendulums.": "Elige una comparación. Predice qué pasará y luego suelta los dos péndulos.",
  "Double the mass": "Duplicar la masa",
  "Double the length": "Duplicar la longitud",
  "Go to the Moon": "Ir a la Luna",
  "Free exploration": "Exploración libre",
  "Start with a comparison, or adjust the apparatus to explore on your own.": "Empieza con una comparación, o ajusta el aparato para explorar por tu cuenta.",
  "Free exploration: change one variable at a time. Predict, release, then compare.": "Exploración libre: cambia una variable a la vez. Predice, suelta y luego compara.",
  "Dashed outline: original Earth setup (0.60 m, 100 g, 15°). Brass bob: your changed setup. Both start together.": "Contorno punteado: montaje original en la Tierra (0.60 m, 100 g, 15°). Esfera de latón: tu montaje modificado. Los dos empiezan al mismo tiempo.",
  "Only mass changes: 100 g → 200 g. Length, gravity and angle match. Predict: will the heavier bob swing faster?": "Solo cambia la masa: 100 g → 200 g. La longitud, la gravedad y el ángulo son iguales. Predice: ¿la esfera más pesada oscilará más rápido?",
  "Only length changes: 0.60 m → 1.20 m. Mass, gravity and angle match. Predict: will doubling length double the period?": "Solo cambia la longitud: 0.60 m → 1.20 m. La masa, la gravedad y el ángulo son iguales. Predice: ¿duplicar la longitud duplicará el periodo?",
  "Only gravity changes: Earth → Moon. Mass, length and angle match. Predict: which pendulum will return first?": "Solo cambia la gravedad: Tierra → Luna. La masa, la longitud y el ángulo son iguales. Predice: ¿qué péndulo regresará primero?",
  "Same period, twice the energy. The dashed reference and brass bob stay together: extra mass increases both inertia and gravitational force.": "Mismo periodo, el doble de energía. La referencia punteada y la esfera de latón se mueven juntas: la masa adicional aumenta tanto la inercia como la fuerza de gravedad.",
  "Twice the length gives √2 ≈ 1.41 times the period. The longer brass pendulum takes longer to return.": "El doble de longitud da √2 ≈ 1.41 veces el periodo. El péndulo de latón más largo tarda más en regresar.",
  "The brass bob on the Moon has about 2.46 times Earth’s period. Weaker gravity gives a weaker restoring effect.": "La esfera de latón en la Luna tiene un periodo de aproximadamente 2.46 veces el de la Tierra. Una gravedad más débil produce un efecto restaurador más débil.",
  // Apparatus settings
  "Adjust apparatus": "Ajustar el aparato",
  "Hide apparatus settings": "Ocultar los ajustes del aparato",
  "01 / SET UP THE APPARATUS": "01 / PREPARA EL APARATO",
  "Your pendulum": "Tu péndulo",
  "Length": "Longitud",
  "Bob mass": "Masa de la esfera",
  "Release angle": "Ángulo de liberación",
  "Changing a setting returns the bob to rest. Drag the bob to choose an angle, then release it with the button.": "Al cambiar un ajuste, la esfera vuelve al reposo. Arrastra la esfera para elegir un ángulo y luego suéltala con el botón.",
  "02 / CHANGE YOUR WORLD": "02 / CAMBIA TU MUNDO",
  "Gravity": "Gravedad",
  "Earth · 9.81 m/s²": "Tierra · 9.81 m/s²",
  "Moon · 1.62 m/s²": "Luna · 1.62 m/s²",
  "Jupiter · 24.79 m/s²": "Júpiter · 24.79 m/s²",
  "Zero gravity · 0 m/s²": "Gravedad cero · 0 m/s²",
  "Playback speed": "Ritmo de reproducción",
  "Real time · 1×": "Tiempo real · 1×",
  "Slow motion · ¼×": "Cámara lenta · ¼×",
  "← All ZornScience activities": "← Todas las actividades de ZornScience",
  // Bench and scene
  "The pendulum apparatus": "El aparato del péndulo",
  "EARTH LABORATORY": "LABORATORIO EN LA TIERRA",
  "MOON LABORATORY": "LABORATORIO EN LA LUNA",
  "JUPITER LABORATORY": "LABORATORIO EN JÚPITER",
  "ZERO GRAVITY LABORATORY": "LABORATORIO SIN GRAVEDAD",
  "STEEL STAND / BRASS BOB": "SOPORTE DE ACERO / ESFERA DE LATÓN",
  "IDEAL MECHANICS LAB": "LABORATORIO DE MECÁNICA IDEAL",
  "Laboratory pendulum": "Péndulo de laboratorio",
  "A brass bob hangs from a clamp on a steel retort stand, next to a meter rule and an angle scale.": "Una esfera de latón cuelga de una pinza en un soporte universal de acero, junto a una regla de un metro y una escala de ángulos.",
  "Retort stand": "Soporte universal",
  "ZORNSCIENCE / OSCILLATIONS & ENERGY": "ZORNSCIENCE / OSCILACIONES Y ENERGÍA",
  "READY TO RELEASE": "LISTO PARA SOLTAR",
  "OSCILLATING": "OSCILANDO",
  "PAUSED": "EN PAUSA",
  // Energy
  "Energy in motion": "Energía en movimiento",
  "Potential (height)": "Potencial (altura)",
  "Kinetic (motion)": "Cinética (movimiento)",
  "Total {energy} J": "Total {energy} J",
  "Release the bob to follow the energy transfer.": "Suelta la esfera para seguir la transferencia de energía.",
  "Both bars use the same joule scale.": "Las dos barras usan la misma escala en joules.",
  "Both bars use the same joule scale. Total mechanical energy stays constant.": "Las dos barras usan la misma escala en joules. La energía mecánica total se mantiene constante.",
  "Same scale for both setups. Dashed reference total: {reference} J. Brass bob total: {total} J.": "Misma escala para los dos montajes. Total de la referencia punteada: {reference} J. Total de la esfera de latón: {total} J.",
  "Zero gravity: no gravitational potential energy and no motion from rest.": "Gravedad cero: no hay energía potencial gravitacional ni movimiento desde el reposo.",
  "At rest at the bottom: both energies are zero.": "En reposo en la parte más baja: las dos energías son cero.",
  "At a turning point: greatest height and potential energy; speed reaches zero.": "En un punto de retorno: la altura y la energía potencial son máximas; la rapidez llega a cero.",
  "At the bottom: lowest potential energy and greatest kinetic energy and speed.": "En la parte más baja: la energía potencial es mínima, y la energía cinética y la rapidez son máximas.",
  "Moving down: potential energy transfers to kinetic energy. The bob speeds up.": "Bajando: la energía potencial se transfiere a energía cinética. La esfera se acelera.",
  "Moving up: kinetic energy transfers to potential energy. The bob slows down.": "Subiendo: la energía cinética se transfiere a energía potencial. La esfera se frena.",
  // Run controls and status
  "▶ Release bob": "▶ Soltar la esfera",
  "Ⅱ Pause": "Ⅱ Pausar",
  "▶ Resume": "▶ Reanudar",
  "↺ Reset position": "↺ Reiniciar posición",
  "Step +0.05 s": "Avanzar +0.05 s",
  "Ready to explore.": "Listo para explorar.",
  "Ready to release. Settings changes restart the motion.": "Listo para soltar. Al cambiar los ajustes, el movimiento se reinicia.",
  "No restoring force in zero gravity. The bob remains at rest.": "En gravedad cero no hay fuerza restauradora. La esfera se queda en reposo.",
  "Choose an angle above 0° to make the bob swing.": "Elige un ángulo mayor que 0° para que la esfera oscile.",
  "Released. Watch for a complete return trip.": "La esfera se soltó. Observa un viaje completo de ida y vuelta.",
  "Motion paused. Step forward to inspect the swing.": "Movimiento en pausa. Avanza paso a paso para examinar la oscilación.",
  "Advanced 0.05 seconds of simulation time.": "Se avanzaron 0.05 segundos de tiempo de simulación.",
  "Returned to the starting position. Ready to repeat.": "La esfera volvió a la posición inicial. Lista para repetir.",
  "Paused while this tab was hidden. Resume when ready.": "Se pausó mientras esta pestaña estaba oculta. Reanuda cuando quieras.",
  // Cycle
  "0 complete oscillations": "0 oscilaciones completas",
  "{count} complete oscillation": "{count} oscilación completa",
  "{count} complete oscillations": "{count} oscilaciones completas",
  "Release to start": "Suelta la esfera para empezar",
  "No oscillation": "Sin oscilación",
  "Outbound: toward the opposite side": "Ida: hacia el lado opuesto",
  "Returning: toward the starting side": "Regreso: hacia el lado inicial",
  "Progress through one complete oscillation": "Avance en una oscilación completa",
  "A period is one full trip: starting side → opposite side → starting side. The clock shows simulation time.": "Un periodo es un viaje completo: lado inicial → lado opuesto → lado inicial. El reloj muestra el tiempo de simulación.",
  // Readouts and explanation
  "SMALL-ANGLE PERIOD": "PERIODO PARA ÁNGULOS PEQUEÑOS",
  "MODEL PERIOD": "PERIODO DEL MODELO",
  "BOB SPEED": "RAPIDEZ DE LA ESFERA",
  "CURRENT ANGLE": "ÁNGULO ACTUAL",
  "for small angles": "para ángulos pequeños",
  "Without gravity there is no restoring force. A bob released from rest stays where it is.": "Sin gravedad no hay fuerza restauradora. Una esfera que se suelta desde el reposo se queda donde está.",
  "The bob is at equilibrium. Choose a release angle to start an oscillation.": "La esfera está en equilibrio. Elige un ángulo de liberación para iniciar una oscilación.",
  "Length is measured from the pivot to the center of the bob. Watch how long a full return trip takes.": "La longitud se mide desde el pivote hasta el centro de la esfera. Observa cuánto tarda un viaje completo de ida y vuelta.",
  "The model period includes the release angle. The small-angle formula is a close approximation at 15° or less. Try a larger angle and compare.": "El periodo del modelo incluye el ángulo de liberación. La fórmula para ángulos pequeños es una buena aproximación a 15° o menos. Prueba un ángulo mayor y compara.",
  "About this model": "Acerca de este modelo",
  "Motion follows θ″ = −(g/L)sin θ using a fixed-step fourth-order Runge-Kutta integrator. The period uses the complete elliptic integral. At exactly zero amplitude there is no oscillation; the small-angle period is the limiting prediction. The stand is an ideal, anchored support in every environment.": "El movimiento sigue θ″ = −(g/L)sin θ con un integrador de Runge-Kutta de cuarto orden y paso fijo. El periodo usa la integral elíptica completa. Con una amplitud exactamente de cero no hay oscilación; el periodo para ángulos pequeños es la predicción límite. El soporte es ideal y está fijo en todos los entornos.",
  // Lab check: the shared labels, as in the Gas Laws and KMT Lab
  "Lab check": "Comprobación del laboratorio",
  "Question {current} of {total}": "Pregunta {current} de {total}",
  "Set up the lab": "Preparar el laboratorio",
  "The lab is set up. Follow the question and use the lab controls.": "El laboratorio está listo. Sigue la pregunta y usa los controles del laboratorio.",
  "Check": "Comprobar",
  "Show me": "Muéstrame",
  "Previous": "Anterior",
  "Next": "Siguiente",
  "Start over": "Empezar de nuevo",
  "Lab check started over. All answers are cleared.": "La comprobación del laboratorio empezó de nuevo. Se borraron todas las respuestas.",
  "Correct answer": "Respuesta correcta",
  "Correct. {explanation}": "Correcto. {explanation}",
  "{feedback} Try again.": "{feedback} Inténtalo de nuevo.",
  "Answer shown. {explanation}": "Respuesta mostrada. {explanation}",
  "{score} of {total} right on the first try.": "{score} de {total} correctas al primer intento.",
  "Completion code": "Código de finalización",
  "Paste this code into your Google Classroom assignment.": "Pega este código en tu tarea de Google Classroom.",
  // Lab check, question 1
  "Four times the length": "Cuatro veces la longitud",
  "Move the length to 1.40 m, four times as long. What does the model period read now?": "Cambia la longitud a 1.40 m, cuatro veces más larga. ¿Qué indica ahora el periodo del modelo?",
  "That is the starting period. Length does change the period. Move the length to 1.40 m and read the lab again.": "Ese es el periodo inicial. La longitud sí cambia el periodo. Cambia la longitud a 1.40 m y vuelve a leer el laboratorio.",
  "The period did not grow as fast as the length. Compare the two model periods and see how many times longer the new one is.": "El periodo no creció tan rápido como la longitud. Compara los dos periodos del modelo y observa cuántas veces más largo es el nuevo.",
  "A longer string makes each swing take longer, not shorter. Watch the model period as you drag the length slider.": "Una cuerda más larga hace que cada oscilación tarde más, no menos. Observa el periodo del modelo mientras mueves el control deslizante de la longitud.",
  "The period depends on the square root of the length. Four times the length gives √4 = 2 times the period: {start} s becomes {right} s.": "El periodo depende de la raíz cuadrada de la longitud. Cuatro veces la longitud da √4 = 2 veces el periodo: {start} s se convierte en {right} s.",
  // Lab check, question 2
  "A heavier bob": "Una esfera más pesada",
  "Move the mass to 400 g. What happens to the model period and the total energy?": "Cambia la masa a 400 g. ¿Qué pasa con el periodo del modelo y con la energía total?",
  "The model period stays {period} s, and the total energy grows from {energy} J to {heavyEnergy} J.": "El periodo del modelo se mantiene en {period} s, y la energía total aumenta de {energy} J a {heavyEnergy} J.",
  "The model period doubles to {double} s, and the total energy grows to {heavyEnergy} J.": "El periodo del modelo se duplica a {double} s, y la energía total aumenta a {heavyEnergy} J.",
  "The model period drops to {half} s, because the heavier bob swings faster.": "El periodo del modelo baja a {half} s, porque la esfera más pesada oscila más rápido.",
  "The model period stays {period} s, and the total energy stays {energy} J.": "El periodo del modelo se mantiene en {period} s, y la energía total se mantiene en {energy} J.",
  "Read the model period after you change the mass. Mass does not change how long a swing takes.": "Lee el periodo del modelo después de cambiar la masa. La masa no cambia cuánto tarda una oscilación.",
  "A heavier bob feels a bigger pull from gravity, but it also has more inertia. Read the model period again after the change.": "Sobre una esfera más pesada, la gravedad jala con más fuerza, pero la esfera también tiene más inercia. Vuelve a leer el periodo del modelo después del cambio.",
  "The period stays the same, but look at the Total energy readout. Lifting a heavier bob to the same height stores more energy.": "El periodo se mantiene igual, pero observa la lectura de la energía total. Subir una esfera más pesada a la misma altura almacena más energía.",
  "Four times the mass means four times the gravitational force, but also four times the inertia, so the acceleration and the period stay the same. The energy at the release point is mgh, so four times the mass stores about four times the energy: {energy} J becomes {heavyEnergy} J.": "Cuatro veces la masa significa cuatro veces la fuerza de gravedad, pero también cuatro veces la inercia, así que la aceleración y el periodo se mantienen iguales. La energía en el punto de liberación es mgh, así que cuatro veces la masa almacena unas cuatro veces la energía: {energy} J se convierte en {heavyEnergy} J.",
  // Lab check, question 3
  "Take it to the Moon": "Llévalo a la Luna",
  "Change Gravity to Moon (1.62 m/s²). What does the model period read now?": "Cambia la gravedad a Luna (1.62 m/s²). ¿Qué indica ahora el periodo del modelo?",
  "That is the Earth period. Change the Gravity setting to Moon and read the model period again.": "Ese es el periodo en la Tierra. Cambia el ajuste de gravedad a Luna y vuelve a leer el periodo del modelo.",
  "Gravity is about 6 times weaker on the Moon, but the period does not grow 6 times. Read the model period after the change.": "La gravedad en la Luna es unas 6 veces más débil, pero el periodo no crece 6 veces. Lee el periodo del modelo después del cambio.",
  "Weaker gravity gives a weaker pull back toward the bottom, so the swing gets slower, not faster.": "Una gravedad más débil jala la esfera con menos fuerza de regreso hacia la parte más baja, así que la oscilación se vuelve más lenta, no más rápida.",
  "The period depends on 1/√g. Moon gravity is 9.81 ÷ 1.62 ≈ 6.06 times weaker, so the period is √6.06 ≈ 2.46 times longer: {start} s becomes {right} s.": "El periodo depende de 1/√g. La gravedad de la Luna es 9.81 ÷ 1.62 ≈ 6.06 veces más débil, así que el periodo es √6.06 ≈ 2.46 veces más largo: {start} s se convierte en {right} s.",
  // Lab check, question 4
  "A big release angle": "Un ángulo de liberación grande",
  "Move the release angle to 50°. Compare the small-angle period with the model period. About how much longer is the model period?": "Cambia el ángulo de liberación a 50°. Compara el periodo para ángulos pequeños con el periodo del modelo. ¿Aproximadamente cuánto más largo es el periodo del modelo?",
  "About {percent}% longer": "Aproximadamente {percent}% más largo",
  "0%. The period does not depend on the release angle.": "0%. El periodo no depende del ángulo de liberación.",
  "About {decimal}% longer": "Aproximadamente {decimal}% más largo",
  "About {percent}% shorter": "Aproximadamente {percent}% más corto",
  "The small-angle formula ignores the angle, but the model period does not. Read both periods at 50°.": "La fórmula para ángulos pequeños no toma en cuenta el ángulo, pero el periodo del modelo sí. Lee los dos periodos a 50°.",
  "Check the subtraction and the division. Find the difference of the two periods, divide by the small-angle period, then multiply by 100.": "Revisa la resta y la división. Encuentra la diferencia de los dos periodos, divídela entre el periodo para ángulos pequeños y luego multiplica por 100.",
  "Read which period is bigger. At a large angle the model period is the larger one.": "Lee cuál periodo es mayor. Con un ángulo grande, el periodo del modelo es el mayor.",
  "At 50° the model period is {model} s and the small-angle formula gives {small} s, a difference of {difference} s, or about {percent}%. The formula T ≈ 2π√(L/g) works well only for small angles. At large angles the restoring force is weaker than the formula assumes, so the real swing takes longer.": "A 50°, el periodo del modelo es {model} s y la fórmula para ángulos pequeños da {small} s, una diferencia de {difference} s, o aproximadamente {percent}%. La fórmula T ≈ 2π√(L/g) funciona bien solo para ángulos pequeños. Con ángulos grandes, la fuerza restauradora es más débil de lo que supone la fórmula, así que la oscilación real tarda más.",
  // Lab check, question 5
  "Speed at the bottom": "Rapidez en la parte más baja",
  "Press Step 10 times, so the clock reads 0.50 s. The current angle is now close to 0°. What does the bob speed read?": "Presiona Avanzar 10 veces, para que el reloj indique 0.50 s. El ángulo actual ahora es cercano a 0°. ¿Qué indica la rapidez de la esfera?",
  "The bob stops at the turning points, not at the bottom. Read the bob speed after 10 Steps.": "La esfera se detiene en los puntos de retorno, no en la parte más baja. Lee la rapidez de la esfera después de presionar Avanzar 10 veces.",
  "The bob does not drop the whole length of the string. It drops only from its release height to the bottom of the arc.": "La esfera no baja toda la longitud de la cuerda. Solo baja desde su altura de liberación hasta la parte más baja del arco.",
  "Check the drop height. The bob starts L cos θ below the pivot, so it drops L(1 − cos θ).": "Revisa la altura de caída. La esfera empieza L cos θ por debajo del pivote, así que baja L(1 − cos θ).",
  "The bob drops h = L(1 − cos 40°) = 0.90 m × {drop} = {height} m. All of that potential energy becomes kinetic energy at the bottom, so v = √(2gh) = {speed} m/s. At {clock} s the lab reads PE {pe} J and KE {ke} J, which add up to the {total} J total.": "La esfera baja h = L(1 − cos 40°) = 0.90 m × {drop} = {height} m. Toda esa energía potencial se convierte en energía cinética en la parte más baja, así que v = √(2gh) = {speed} m/s. A {clock} s, el laboratorio indica EP {pe} J y EC {ke} J, que suman la energía total de {total} J."
}};
  if (i18n) {
    i18n.configure(copy);
    // Instruction step 2 holds the button name in bold. Spanish rebuilds it from one full template around that name.
    var step = root.querySelector("#zsa-th-instructions li:nth-child(2)"), strong = step && step.querySelector("strong");
    if (i18n.lang === "es" && strong) {
      var parts = i18n.text("Select {button}. Watch the energy move between potential energy at the ends and kinetic energy at the bottom.").split("{button}");
      step.replaceChildren(document.createTextNode(parts[0]), strong, document.createTextNode(parts[1] || ""));
    }
  }

  // Lab check (labcheck.js and ../shared/zsa-labcheck.js). Each choice is [value, label, feedback key]; the right
  // choice has a null key. Every number in braces is filled in by labcheck.js from physics.js and the lab's own
  // readout formatters, so no answer is written here. setup is the starting state: L in m, m in g, angle in
  // degrees and world, the Gravity option value.
  var check = {
    labels: {
      title: "Lab check",
      progress: "Question {current} of {total}",
      setupButton: "Set up the lab",
      setupDone: "The lab is set up. Follow the question and use the lab controls.",
      check: "Check",
      show: "Show me",
      previous: "Previous",
      next: "Next",
      restart: "Start over",
      restarted: "Lab check started over. All answers are cleared.",
      correctChoice: "Correct answer",
      correct: "Correct. {explanation}",
      retry: "{feedback} Try again.",
      shown: "Answer shown. {explanation}",
      score: "{score} of {total} right on the first try.",
      completion: "Completion code",
      codeNote: "Paste this code into your Google Classroom assignment."
    },
    questions: [
      {id: "length", title: "Four times the length", setup: {L: 0.35, m: 150, angle: 10, world: "9.81"},
        question: "Move the length to 1.40 m, four times as long. What does the model period read now?",
        choices: [["right", "{right} s", null], ["sameT", "{start} s", "sameT"], ["linearL", "{four} s", "linearL"], ["inverseL", "{half} s", "inverseL"]],
        feedback: {
          sameT: "That is the starting period. Length does change the period. Move the length to 1.40 m and read the lab again.",
          linearL: "The period did not grow as fast as the length. Compare the two model periods and see how many times longer the new one is.",
          inverseL: "A longer string makes each swing take longer, not shorter. Watch the model period as you drag the length slider."
        },
        explanation: "The period depends on the square root of the length. Four times the length gives √4 = 2 times the period: {start} s becomes {right} s."},
      {id: "mass", title: "A heavier bob", setup: {L: 0.80, m: 100, angle: 20, world: "9.81"},
        question: "Move the mass to 400 g. What happens to the model period and the total energy?",
        choices: [["right", "The model period stays {period} s, and the total energy grows from {energy} J to {heavyEnergy} J.", null],
          ["heavySlow", "The model period doubles to {double} s, and the total energy grows to {heavyEnergy} J.", "heavySlow"],
          ["heavyFast", "The model period drops to {half} s, because the heavier bob swings faster.", "heavyFast"],
          ["sameEnergy", "The model period stays {period} s, and the total energy stays {energy} J.", "sameEnergy"]],
        feedback: {
          heavySlow: "Read the model period after you change the mass. Mass does not change how long a swing takes.",
          heavyFast: "A heavier bob feels a bigger pull from gravity, but it also has more inertia. Read the model period again after the change.",
          sameEnergy: "The period stays the same, but look at the Total energy readout. Lifting a heavier bob to the same height stores more energy."
        },
        explanation: "Four times the mass means four times the gravitational force, but also four times the inertia, so the acceleration and the period stay the same. The energy at the release point is mgh, so four times the mass stores about four times the energy: {energy} J becomes {heavyEnergy} J."},
      {id: "moon", title: "Take it to the Moon", setup: {L: 0.50, m: 200, angle: 8, world: "9.81"},
        question: "Change Gravity to Moon (1.62 m/s²). What does the model period read now?",
        choices: [["right", "{right} s", null], ["sameG", "{start} s", "sameG"], ["ratioG", "{ratio} s", "ratioG"], ["fasterMoon", "{faster} s", "fasterMoon"]],
        feedback: {
          sameG: "That is the Earth period. Change the Gravity setting to Moon and read the model period again.",
          ratioG: "Gravity is about 6 times weaker on the Moon, but the period does not grow 6 times. Read the model period after the change.",
          fasterMoon: "Weaker gravity gives a weaker pull back toward the bottom, so the swing gets slower, not faster."
        },
        explanation: "The period depends on 1/√g. Moon gravity is 9.81 ÷ 1.62 ≈ 6.06 times weaker, so the period is √6.06 ≈ 2.46 times longer: {start} s becomes {right} s."},
      {id: "angle", title: "A big release angle", setup: {L: 1.20, m: 250, angle: 10, world: "9.81"},
        question: "Move the release angle to 50°. Compare the small-angle period with the model period. About how much longer is the model period?",
        choices: [["right", "About {percent}% longer", null], ["noChange", "0%. The period does not depend on the release angle.", "noChange"],
          ["decimal", "About {decimal}% longer", "decimal"], ["shorter", "About {percent}% shorter", "shorter"]],
        feedback: {
          noChange: "The small-angle formula ignores the angle, but the model period does not. Read both periods at 50°.",
          decimal: "Check the subtraction and the division. Find the difference of the two periods, divide by the small-angle period, then multiply by 100.",
          shorter: "Read which period is bigger. At a large angle the model period is the larger one."
        },
        explanation: "At 50° the model period is {model} s and the small-angle formula gives {small} s, a difference of {difference} s, or about {percent}%. The formula T ≈ 2π√(L/g) works well only for small angles. At large angles the restoring force is weaker than the formula assumes, so the real swing takes longer."},
      {id: "speed", title: "Speed at the bottom", setup: {L: 0.90, m: 300, angle: 40, world: "9.81"},
        question: "Press Step 10 times, so the clock reads 0.50 s. The current angle is now close to 0°. What does the bob speed read?",
        choices: [["right", "{right} m/s", null], ["bottomStill", "{still} m/s", "bottomStill"], ["fullHeight", "{full} m/s", "fullHeight"], ["cosHeight", "{cos} m/s", "cosHeight"]],
        feedback: {
          bottomStill: "The bob stops at the turning points, not at the bottom. Read the bob speed after 10 Steps.",
          fullHeight: "The bob does not drop the whole length of the string. It drops only from its release height to the bottom of the arc.",
          cosHeight: "Check the drop height. The bob starts L cos θ below the pivot, so it drops L(1 − cos θ)."
        },
        explanation: "The bob drops h = L(1 − cos 40°) = 0.90 m × {drop} = {height} m. All of that potential energy becomes kinetic energy at the bottom, so v = √(2gh) = {speed} m/s. At {clock} s the lab reads PE {pe} J and KE {ke} J, which add up to the {total} J total."}
    ]
  };
  // In Spanish only the words change: ids, setups, choice values and feedback keys stay as they are.
  var text = function (value) { return i18n ? i18n.text(value) : value; };
  var labels = {};
  Object.keys(check.labels).forEach(function (k) { labels[k] = text(check.labels[k]); });
  var localized = {labels: labels, questions: check.questions.map(function (q) {
    var feedback = {};
    Object.keys(q.feedback).forEach(function (k) { feedback[k] = text(q.feedback[k]); });
    return {id: q.id, title: text(q.title), setup: q.setup, question: text(q.question),
      choices: q.choices.map(function (c) { return [c[0], text(c[1]), c[2]]; }), feedback: feedback, explanation: text(q.explanation)};
  })};
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive({check: localized}); });
}());
