(function () {
  "use strict";
  // Inclined Plane & Friction: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="inclined-plane"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  var copy = {title:"Inclined Plane & Friction", es:{
  // Header, instructions and share
  "Inclined Plane & Friction": "Plano inclinado y fricción",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share a fresh lab. Each link opens a fresh ramp.": "Comparte el laboratorio desde cero. Cada enlace abre una rampa nueva.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore friction with an adjustable ramp and live force arrows.": "Explora la fricción con una rampa ajustable y flechas de fuerza en tiempo real.",
  "Find the tipping point": "Búsqueda del punto de deslizamiento",
  "Slowly raise the ramp angle. Static friction balances the downhill component of gravity until its maximum is exceeded.": "Sube poco a poco el ángulo de la rampa. La fricción estática equilibra la componente de la gravedad cuesta abajo hasta que se supera su valor máximo.",
  "Watch the block begin to slide. The friction arrow now represents kinetic friction.": "Observa cómo el bloque empieza a deslizarse. Ahora la flecha de fricción representa la fricción cinética.",
  "Return the block to the top to repeat. Compare surfaces or add mass. Pause to inspect the free body diagram.": "Regresa el bloque a la parte de arriba para repetir. Compara superficies o agrega masa. Pausa la simulación para revisar el diagrama de cuerpo libre.",
  "At the onset of sliding, μₛ = tan θ. While sliding downhill, μₖ = (g sin θ − a) / (g cos θ). Use the live angle and acceleration to explore these relationships.": "Justo cuando empieza el deslizamiento, μₛ = tan θ. Mientras el bloque se desliza cuesta abajo, μₖ = (g sin θ − a) / (g cos θ). Usa el ángulo y la aceleración en tiempo real para explorar estas relaciones.",
  "Dashed gravity components resolve the weight; they are not additional forces. Coefficients are illustrative, constant dry-friction values. Ramp adjustments reset the block; the hinge motor holds the chosen angle. No data are recorded.": "Las componentes punteadas de la gravedad descomponen el peso; no son fuerzas adicionales. Los coeficientes son valores ilustrativos y constantes de fricción seca. Al ajustar la rampa, el bloque regresa al inicio; el motor de la bisagra mantiene el ángulo elegido. No se registran datos.",
  // Controls
  "Set up the ramp": "Preparación de la rampa",
  "Ramp angle": "Ángulo de la rampa",
  "Contact surface": "Superficie de contacto",
  "Wood on wood": "Madera sobre madera",
  "Felt on wood": "Fieltro sobre madera",
  "Smooth plastic on wood": "Plástico liso sobre madera",
  "Block + added mass": "Bloque + masa agregada",
  "Return block to top": "Regresar el bloque arriba",
  "Pause": "Pausar",
  "Resume": "Reanudar",
  "Show force arrows": "Mostrar flechas de fuerza",
  "Resolve gravity": "Descomponer la gravedad",
  "Slow motion (¼ speed)": "Cámara lenta (¼ del tiempo real)",
  "Raise the angle in small steps to find the first slip. Changing the setup starts a new run.": "Sube el ángulo en pasos pequeños para encontrar el primer deslizamiento. Si cambias el montaje, empieza una corrida nueva.",
  // Bench, readings and legend
  "Ramp simulation": "Simulación de la rampa",
  "Adjustable inclined plane": "Plano inclinado ajustable",
  "STATIC / AT REST": "ESTÁTICO / EN REPOSO",
  "KINETIC / SLIDING": "CINÉTICO / EN DESLIZAMIENTO",
  "END STOP": "TOPE FINAL",
  "WOOD BLOCK · 1.20 m TRACK · ANGLE SCALE": "BLOQUE DE MADERA · RIEL DE 1.20 m · ESCALA DE ÁNGULOS",
  "LIVE APPARATUS": "MONTAJE EN VIVO",
  "Wooden block on an adjustable laboratory ramp": "Bloque de madera sobre una rampa de laboratorio ajustable",
  "A hinged wooden ramp, metal support, protractor, and moving wooden block with live force arrows.": "Una rampa de madera con bisagra, un soporte metálico, un transportador y un bloque de madera en movimiento con flechas de fuerza en tiempo real.",
  "ZORNSCIENCE / MECHANICS BENCH": "ZORNSCIENCE / MESA DE MECÁNICA",
  "Static friction balances downhill gravity.": "La fricción estática equilibra la gravedad cuesta abajo.",
  "Gravity overcomes kinetic friction. The block accelerates downhill.": "La gravedad supera la fricción cinética. El bloque acelera cuesta abajo.",
  "Return the block to the top to repeat.": "Regresa el bloque a la parte de arriba para repetir.",
  "ACCELERATION": "ACELERACIÓN",
  "SPEED": "RAPIDEZ",
  "DISTANCE": "DISTANCIA",
  "● Normal": "● Fuerza normal",
  "● Weight": "● Peso",
  "● Friction": "● Fricción",
  "┄ Gravity components": "┄ Componentes de la gravedad",
  // The physics note and footer
  "Explore the physics": "Explora la física",
  "{surface}: μₛ = {mus}, μₖ = {muk}. Critical angle: {angle}°. g = 9.81 m/s².": "{surface}: μₛ = {mus}, μₖ = {muk}. Ángulo crítico: {angle}°. g = 9.81 m/s².",
  "Adding mass increases all forces proportionally. It does not change the critical angle or sliding acceleration in this model. The block stops at a padded end stop; force arrows are hidden after impact because the stop adds a contact force.": "Agregar masa aumenta todas las fuerzas en la misma proporción. En este modelo no cambia el ángulo crítico ni la aceleración durante el deslizamiento. El bloque se detiene en un tope final acolchado; las flechas de fuerza se ocultan después del impacto porque el tope agrega una fuerza de contacto.",
  "ZornScience · Inclined Plane & Friction": "ZornScience · Plano inclinado y fricción",
  "Ideal dry friction · No data saved": "Fricción seca ideal · No se guardan datos",
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
  "Tilt the ramp": "Inclina la rampa",
  "Raise the ramp angle to 20.0°. The block stays at rest. What does the normal force arrow read now?": "Sube el ángulo de la rampa a 20.0°. El bloque se queda en reposo. ¿Qué indica ahora la flecha de la fuerza normal?",
  "That is the normal force at 10.0°. Raise the ramp to 20.0° and read the arrow again.": "Esa es la fuerza normal a 10.0°. Sube la rampa a 20.0° y vuelve a leer la flecha.",
  "The weight is a different arrow. The normal force is the push of the ramp, and it depends on the angle. Compare the two arrow labels.": "El peso es otra flecha. La fuerza normal es el empuje de la rampa y depende del ángulo. Compara las etiquetas de las dos flechas.",
  "That number is the downhill part of the weight, the dashed mg sin θ arrow. The normal force points away from the ramp surface. Read the arrow labeled N.": "Ese número es la parte del peso cuesta abajo, la flecha punteada mg sin θ. La fuerza normal se aleja de la superficie de la rampa. Lee la flecha con la etiqueta N.",
  "The ramp pushes on the block perpendicular to its surface, and that push balances the part of the weight that presses into the ramp: N = mg cos θ. At 10.0° it is {start} N. As the ramp tilts, cos θ gets smaller, so at 20.0° it falls to {right} N. The weight stays {weight} N.": "La rampa empuja el bloque perpendicular a su superficie, y ese empuje equilibra la parte del peso que presiona contra la rampa: N = mg cos θ. A 10.0° vale {start} N. Al inclinar la rampa, cos θ se hace más pequeño, así que a 20.0° baja a {right} N. El peso se mantiene en {weight} N.",
  // Lab check, question 2
  "Friction at rest": "Fricción en reposo",
  "Move the block + added mass to 1.50 kg. The ramp stays at 20.0° and the block stays at rest. What does the friction arrow read now?": "Cambia Bloque + masa agregada a 1.50 kg. La rampa se queda en 20.0° y el bloque se queda en reposo. ¿Qué indica ahora la flecha de fricción?",
  "That is the friction at 0.50 kg. Add the mass and read the friction arrow again.": "Esa es la fricción con 0.50 kg. Agrega la masa y vuelve a leer la flecha de fricción.",
  "That is the most static friction can supply, not what it supplies right now. The block is not about to slip. Look at what the friction arrow balances.": "Ese es el máximo que puede dar la fricción estática, no lo que da ahora. El bloque no está a punto de deslizarse. Fíjate en qué equilibra la flecha de fricción.",
  "Kinetic friction acts only while the block slides. This block is at rest, so the friction arrow is static friction.": "La fricción cinética actúa solo mientras el bloque se desliza. Este bloque está en reposo, así que la flecha de fricción es fricción estática.",
  "While the block is at rest, static friction is exactly as large as it needs to be to hold the block: it equals the downhill part of the weight, fₛ = mg sin θ. Three times the mass gives three times the downhill force, so the friction goes from {start} N to {right} N. It stays below its limit of μₛN = {maxStatic} N, so the block does not slip.": "Mientras el bloque está en reposo, la fricción estática es exactamente tan grande como hace falta para sostenerlo: es igual a la parte del peso cuesta abajo, fₛ = mg sin θ. Con el triple de masa, la fuerza cuesta abajo es el triple, así que la fricción pasa de {start} N a {right} N. Se mantiene por debajo de su límite, μₛN = {maxStatic} N, así que el bloque no se desliza.",
  // Lab check, question 3
  "Change the surface": "Cambia la superficie",
  "Change the contact surface to Felt on wood. The ramp stays at 30.0°. What happens?": "Cambia la superficie de contacto a Fieltro sobre madera. La rampa se queda en 30.0°. ¿Qué pasa?",
  "It stays at rest. The friction arrow reads {right} N.": "Se queda en reposo. La flecha de fricción indica {right} N.",
  "It stays at rest. The friction arrow reads {maxStatic} N.": "Se queda en reposo. La flecha de fricción indica {maxStatic} N.",
  "It still slides, but more slowly. The acceleration reads {slow} m/s².": "Sigue deslizándose, pero más despacio. La aceleración indica {slow} m/s².",
  "It still slides, with the same acceleration as on wood, {wood} m/s².": "Sigue deslizándose, con la misma aceleración que sobre madera, {wood} m/s².",
  "That is the most static friction felt can supply. The friction arrow shows what friction actually does at this angle. Read it after you change the surface.": "Ese es el máximo que puede dar la fricción estática del fieltro. La flecha de fricción muestra lo que la fricción realmente hace con este ángulo. Léela después de cambiar la superficie.",
  "A block slides only if the downhill part of its weight is bigger than the most static friction can supply. Check that first for felt at 30.0°.": "Un bloque se desliza solo si la parte de su peso cuesta abajo es mayor que el máximo que puede dar la fricción estática. Revisa eso primero para el fieltro a 30.0°.",
  "The surface changes the friction coefficients. Compare the critical angle for felt with the ramp angle. The note under Explore the physics lists it.": "La superficie cambia los coeficientes de fricción. Compara el ángulo crítico del fieltro con el ángulo de la rampa. La nota de Explora la física lo indica.",
  "Felt grips better than wood. Its μₛ is {mus}, so the block holds until the ramp passes {critical}°. At 30.0° the downhill part of the weight, mg sin θ = {right} N, is less than the most friction felt can supply (μₛN = {maxStatic} N). The block stays at rest and static friction matches {right} N. On wood the critical angle is only {woodCritical}°, so the block slid.": "El fieltro agarra mejor que la madera. Su μₛ es {mus}, así que el bloque se sostiene hasta que la rampa pasa de {critical}°. A 30.0°, la parte del peso cuesta abajo, mg sin θ = {right} N, es menor que el máximo que puede dar la fricción del fieltro (μₛN = {maxStatic} N). El bloque se queda en reposo y la fricción estática iguala {right} N. Sobre madera el ángulo crítico es solo de {woodCritical}°, así que el bloque se deslizó.",
  // Lab check, question 4
  "Add mass to a sliding block": "Agrega masa a un bloque que se desliza",
  "Press Pause or watch in slow motion to read the acceleration while the block slides. Then move the block + added mass to 1.50 kg and read the acceleration while it slides again. What does it read?": "Presiona Pausar o míralo en cámara lenta para leer la aceleración mientras el bloque se desliza. Luego cambia Bloque + masa agregada a 1.50 kg y lee otra vez la aceleración mientras se desliza. ¿Qué indica?",
  "The weight is three times as large, but so is the mass that has to speed up. Read the acceleration with the heavier block.": "El peso es tres veces mayor, pero también lo es la masa que debe acelerar. Lee la aceleración con el bloque más pesado.",
  "A heavier block does not speed up less. Compare the acceleration readout before and after the change.": "Un bloque más pesado no acelera menos. Compara la lectura de la aceleración antes y después del cambio.",
  "That is what the acceleration would be with no friction at all. Kinetic friction pulls back on the block. Read the acceleration while the block slides.": "Esa sería la aceleración sin nada de fricción. La fricción cinética jala el bloque hacia atrás. Lee la aceleración mientras el bloque se desliza.",
  "Adding mass multiplies both the downhill part of the weight and the kinetic friction by the same factor, so the mass cancels: a = g(sin θ − μₖ cos θ). The acceleration is {right} m/s² for 0.50 kg and for 1.50 kg. The block takes the same time to slide down.": "Agregar masa multiplica por el mismo factor la parte del peso cuesta abajo y la fricción cinética, así que la masa se cancela: a = g(sin θ − μₖ cos θ). La aceleración es de {right} m/s² con 0.50 kg y con 1.50 kg. El bloque tarda el mismo tiempo en deslizarse hasta abajo.",
  // Lab check, question 5
  "Find the friction coefficient": "Encuentra el coeficiente de fricción",
  "Raise the ramp angle in small steps until the block first slips. Use that angle to find μₛ with μₛ = tan θ. What value do you get?": "Sube el ángulo de la rampa en pasos pequeños hasta que el bloque se deslice por primera vez. Usa ese ángulo para hallar μₛ con μₛ = tan θ. ¿Qué valor obtienes?",
  "Check which function the question tells you to use, and use the angle where the block first slips.": "Revisa qué función indica la pregunta y usa el ángulo en el que el bloque se desliza por primera vez.",
  "Check that you used the function named in the question, and that your calculator is set to degrees.": "Revisa que hayas usado la función que nombra la pregunta y que tu calculadora esté en grados.",
  "Friction acts along the ramp, and the normal force acts across it. μₛ is friction divided by the normal force, so check which one goes on top.": "La fricción actúa a lo largo de la rampa y la fuerza normal actúa a través de ella. μₛ es la fricción dividida entre la fuerza normal, así que revisa cuál va arriba.",
  "At the first slip, friction has reached its limit, so μₛN = mg sin θ. With N = mg cos θ, the masses cancel and μₛ = sin θ ÷ cos θ = tan θ. The first slip on felt shows at {angle}°, and tan {angle}° = {right}. The lab's note under Explore the physics lists the same μₛ for felt.": "En el primer deslizamiento, la fricción llegó a su límite, así que μₛN = mg sin θ. Con N = mg cos θ, las masas se cancelan y μₛ = sin θ ÷ cos θ = tan θ. En el fieltro, el primer deslizamiento aparece a {angle}°, y tan {angle}° = {right}. La nota del laboratorio en Explora la física indica el mismo μₛ para el fieltro."
}};
  if (i18n) i18n.configure(copy);
  // Lab check (labcheck.js and ../shared/zsa-labcheck.js). Each choice is [value, label, feedback key]; the right
  // choice has a null key. Every number in braces is filled in by labcheck.js from the lab's formulas and its own
  // readout formatters, so no answer is written here. setup is the starting state: angle, the Ramp angle in degrees;
  // surface, the Contact surface option value; mass, the Block + added mass in kg; slow, Slow motion.
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
      {id: "normal", title: "Tilt the ramp", setup: {angle: 10, surface: "wood", mass: 1, slow: false},
        question: "Raise the ramp angle to 20.0°. The block stays at rest. What does the normal force arrow read now?",
        choices: [["right", "{right} N", null], ["sameN", "{start} N", "sameN"], ["weight", "{weight} N", "weight"], ["downhill", "{downhill} N", "downhill"]],
        feedback: {
          sameN: "That is the normal force at 10.0°. Raise the ramp to 20.0° and read the arrow again.",
          weight: "The weight is a different arrow. The normal force is the push of the ramp, and it depends on the angle. Compare the two arrow labels.",
          downhill: "That number is the downhill part of the weight, the dashed mg sin θ arrow. The normal force points away from the ramp surface. Read the arrow labeled N."
        },
        explanation: "The ramp pushes on the block perpendicular to its surface, and that push balances the part of the weight that presses into the ramp: N = mg cos θ. At 10.0° it is {start} N. As the ramp tilts, cos θ gets smaller, so at 20.0° it falls to {right} N. The weight stays {weight} N."},
      {id: "static", title: "Friction at rest", setup: {angle: 20, surface: "wood", mass: 0.5, slow: false},
        question: "Move the block + added mass to 1.50 kg. The ramp stays at 20.0° and the block stays at rest. What does the friction arrow read now?",
        choices: [["right", "{right} N", null], ["sameF", "{start} N", "sameF"], ["maxStatic", "{maxStatic} N", "maxStatic"], ["kinetic", "{kinetic} N", "kinetic"]],
        feedback: {
          sameF: "That is the friction at 0.50 kg. Add the mass and read the friction arrow again.",
          maxStatic: "That is the most static friction can supply, not what it supplies right now. The block is not about to slip. Look at what the friction arrow balances.",
          kinetic: "Kinetic friction acts only while the block slides. This block is at rest, so the friction arrow is static friction."
        },
        explanation: "While the block is at rest, static friction is exactly as large as it needs to be to hold the block: it equals the downhill part of the weight, fₛ = mg sin θ. Three times the mass gives three times the downhill force, so the friction goes from {start} N to {right} N. It stays below its limit of μₛN = {maxStatic} N, so the block does not slip."},
      {id: "surface", title: "Change the surface", setup: {angle: 30, surface: "wood", mass: 0.5, slow: false},
        question: "Change the contact surface to Felt on wood. The ramp stays at 30.0°. What happens?",
        choices: [["right", "It stays at rest. The friction arrow reads {right} N.", null], ["maxF", "It stays at rest. The friction arrow reads {maxStatic} N.", "maxF"],
          ["slowSlide", "It still slides, but more slowly. The acceleration reads {slow} m/s².", "slowSlide"],
          ["sameSlide", "It still slides, with the same acceleration as on wood, {wood} m/s².", "sameSlide"]],
        feedback: {
          maxF: "That is the most static friction felt can supply. The friction arrow shows what friction actually does at this angle. Read it after you change the surface.",
          slowSlide: "A block slides only if the downhill part of its weight is bigger than the most static friction can supply. Check that first for felt at 30.0°.",
          sameSlide: "The surface changes the friction coefficients. Compare the critical angle for felt with the ramp angle. The note under Explore the physics lists it."
        },
        explanation: "Felt grips better than wood. Its μₛ is {mus}, so the block holds until the ramp passes {critical}°. At 30.0° the downhill part of the weight, mg sin θ = {right} N, is less than the most friction felt can supply (μₛN = {maxStatic} N). The block stays at rest and static friction matches {right} N. On wood the critical angle is only {woodCritical}°, so the block slid."},
      {id: "slide", title: "Add mass to a sliding block", setup: {angle: 35, surface: "wood", mass: 0.5, slow: true},
        question: "Press Pause or watch in slow motion to read the acceleration while the block slides. Then move the block + added mass to 1.50 kg and read the acceleration while it slides again. What does it read?",
        choices: [["right", "{right} m/s²", null], ["triple", "{triple} m/s²", "triple"], ["third", "{third} m/s²", "third"], ["noFriction", "{noFriction} m/s²", "noFriction"]],
        feedback: {
          triple: "The weight is three times as large, but so is the mass that has to speed up. Read the acceleration with the heavier block.",
          third: "A heavier block does not speed up less. Compare the acceleration readout before and after the change.",
          noFriction: "That is what the acceleration would be with no friction at all. Kinetic friction pulls back on the block. Read the acceleration while the block slides."
        },
        explanation: "Adding mass multiplies both the downhill part of the weight and the kinetic friction by the same factor, so the mass cancels: a = g(sin θ − μₖ cos θ). The acceleration is {right} m/s² for 0.50 kg and for 1.50 kg. The block takes the same time to slide down."},
      {id: "mu", title: "Find the friction coefficient", setup: {angle: 25, surface: "felt", mass: 0.5, slow: false},
        question: "Raise the ramp angle in small steps until the block first slips. Use that angle to find μₛ with μₛ = tan θ. What value do you get?",
        choices: [["right", "{right}", null], ["useSin", "{sin}", "useSin"], ["useCos", "{cos}", "useCos"], ["inverse", "{inverse}", "inverse"]],
        feedback: {
          useSin: "Check which function the question tells you to use, and use the angle where the block first slips.",
          useCos: "Check that you used the function named in the question, and that your calculator is set to degrees.",
          inverse: "Friction acts along the ramp, and the normal force acts across it. μₛ is friction divided by the normal force, so check which one goes on top."
        },
        explanation: "At the first slip, friction has reached its limit, so μₛN = mg sin θ. With N = mg cos θ, the masses cancel and μₛ = sin θ ÷ cos θ = tan θ. The first slip on felt shows at {angle}°, and tan {angle}° = {right}. The lab's note under Explore the physics lists the same μₛ for felt."}
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
