(function () {
  "use strict";
  // Collision Carts: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="collision-carts"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  var copy = {title:"Collision Carts", es:{
  // Header, instructions and share
  "Collision Carts": "Carritos de colisión",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share a fresh lab. Each link opens a fresh track.": "Comparte el laboratorio desde cero. Cada enlace abre una pista nueva.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore conservation of momentum with two colliding carts.": "Explora la conservación de la cantidad de movimiento con dos carritos que chocan.",
  "Explore conservation of momentum": "Exploración de la conservación de la cantidad de movimiento",
  "Choose magnetic bumpers for a perfectly elastic collision or hook-and-loop pads for a perfectly inelastic collision.": "Elige parachoques magnéticos para una colisión perfectamente elástica o almohadillas de velcro para una colisión perfectamente inelástica.",
  "Set each cart’s total mass and starting velocity. Positive velocity points right; negative velocity points left.": "Ajusta la masa total y la velocidad inicial de cada carrito. La velocidad positiva apunta a la derecha; la velocidad negativa apunta a la izquierda.",
  "Launch the carts. Pause, advance one frame, or use slow motion to inspect the collision.": "Lanza los carritos. Pausa, avanza un cuadro o usa la cámara lenta para examinar la colisión.",
  "Turn on velocity and momentum vectors. Arrow direction shows the sign; length shows magnitude. Momentum depends on both mass and velocity.": "Activa los vectores de velocidad y de cantidad de movimiento. La dirección de la flecha muestra el signo; su longitud muestra la magnitud. La cantidad de movimiento depende tanto de la masa como de la velocidad.",
  "Reset to replay. Changing the setup also resets the track. Try the same setup in both collision modes.": "Reinicia para repetir. Cambiar la configuración también reinicia la pista. Prueba la misma configuración en los dos modos de colisión.",
  "Total momentum stays constant during the cart-to-cart collision. Kinetic energy stays constant only in the elastic mode. A zero-length vector appears as a dot.": "La cantidad de movimiento total se mantiene constante durante la colisión entre los carritos. La energía cinética se mantiene constante solo en el modo elástico. Un vector de longitud cero aparece como un punto.",
  "Ideal model: level frictionless track, one-dimensional motion, instantaneous collision. The run pauses before either cart reaches an end stop, where an external impulse would change the carts’ total momentum.": "Modelo ideal: pista nivelada sin fricción, movimiento en una dimensión y colisión instantánea. La corrida se pausa antes de que cualquiera de los carritos llegue a un tope, donde un impulso externo cambiaría la cantidad de movimiento total de los carritos.",
  "This simulation needs JavaScript.": "Esta simulación necesita JavaScript.",
  // Setup
  "01 / SET UP THE COLLISION": "01 / PREPARA LA COLISIÓN",
  "At the track": "En la pista",
  "Bumper type": "Tipo de parachoques",
  "Perfectly elastic · magnetic": "Perfectamente elástica · imanes",
  "Perfectly inelastic · hook & loop": "Perfectamente inelástica · velcro",
  "Carts rebound. Momentum and kinetic energy are conserved.": "Los carritos rebotan. Se conservan la cantidad de movimiento y la energía cinética.",
  "Carts stick together. Momentum is conserved; kinetic energy can decrease.": "Los carritos se quedan unidos. Se conserva la cantidad de movimiento; la energía cinética puede disminuir.",
  "Cart A": "Carrito A",
  "Cart B": "Carrito B",
  "Total mass": "Masa total",
  "Starting velocity": "Velocidad inicial",
  "Try a setup": "Prueba una configuración",
  "Equal masses · one at rest": "Masas iguales · uno en reposo",
  "Head-on · equal and opposite": "De frente · velocidades iguales y opuestas",
  "Heavy cart meets light cart": "Un carrito pesado choca con uno ligero",
  "Catch-up collision": "Colisión por alcance",
  "Mass includes the 250 g cart and its slotted steel masses.": "La masa incluye el carrito de 250 g y sus pesas ranuradas de acero.",
  // Bench and track
  "02 / OBSERVE THE MOTION": "02 / OBSERVA EL MOVIMIENTO",
  "Low-friction dynamics track": "Pista de dinámica de baja fricción",
  "MAGNETIC BUMPERS": "PARACHOQUES MAGNÉTICOS",
  "HOOK & LOOP PADS": "ALMOHADILLAS DE VELCRO",
  "LEVEL TRACK / 4.0 m": "PISTA NIVELADA / 4.0 m",
  "+ RIGHT →": "+ DERECHA →",
  "Two dynamics carts on an aluminum laboratory track": "Dos carritos de dinámica sobre una pista de laboratorio de aluminio",
  "A blue cart and an orange cart carry removable steel masses. Optional arrows show their current velocities and momenta.": "Un carrito azul y un carrito naranja llevan pesas de acero removibles. Las flechas opcionales muestran sus velocidades y cantidades de movimiento actuales.",
  "ALUMINUM DYNAMICS TRACK · ADJUSTABLE LEVELING FEET": "PISTA DE DINÁMICA DE ALUMINIO · PATAS NIVELADORAS AJUSTABLES",
  "CART {letter}": "CARRITO {letter}",
  "READY TO LAUNCH": "LISTO PARA LANZAR",
  "CARTS IN MOTION": "CARRITOS EN MOVIMIENTO",
  "PAUSED": "EN PAUSA",
  "AFTER COLLISION / REBOUND": "DESPUÉS DE LA COLISIÓN / REBOTE",
  "AFTER COLLISION / JOINED": "DESPUÉS DE LA COLISIÓN / UNIDOS",
  "PAUSED BEFORE END STOP": "EN PAUSA ANTES DEL TOPE",
  // Transport and vectors
  "▶ Launch": "▶ Lanzar",
  "Ⅱ Pause": "Ⅱ Pausar",
  "▶ Resume": "▶ Reanudar",
  "Run complete": "Corrida completa",
  "Step +0.02 s": "Avanzar +0.02 s",
  "↺ Reset": "↺ Reiniciar",
  "Playback": "Reproducción",
  "¼× slow motion": "¼× cámara lenta",
  "¹⁄₁₀× slow motion": "¹⁄₁₀× cámara lenta",
  "SHOW VECTORS": "MOSTRAR VECTORES",
  "Velocity": "Velocidad",
  "Momentum": "Cantidad de movimiento",
  "Separate scales · p = mv": "Escalas separadas · p = mv",
  // Readouts and observations
  "Cart A velocity": "Velocidad del carrito A",
  "Cart B velocity": "Velocidad del carrito B",
  "Total momentum": "Cantidad de movimiento total",
  "Kinetic energy": "Energía cinética",
  "Set up the carts, then launch. Watch how motion transfers from one cart to the other.": "Prepara los carritos y luego lánzalos. Observa cómo se transfiere el movimiento de un carrito al otro.",
  "Set up the carts, then launch. Positive velocity is to the right; negative velocity is to the left.": "Prepara los carritos y luego lánzalos. La velocidad positiva es hacia la derecha; la velocidad negativa es hacia la izquierda.",
  "The carts have rebounded. Total momentum and kinetic energy are unchanged. Compare each cart’s new velocity and momentum arrows.": "Los carritos rebotaron. La cantidad de movimiento total y la energía cinética no cambian. Compara las nuevas flechas de velocidad y de cantidad de movimiento de cada carrito.",
  "The hook-and-loop pads have joined the carts. Both now have the same velocity. Total momentum is unchanged; some kinetic energy becomes internal energy.": "Las almohadillas de velcro unieron los carritos. Ahora los dos tienen la misma velocidad. La cantidad de movimiento total no cambia; parte de la energía cinética se convierte en energía interna.",
  "The run paused before an end stop. An end-stop impact would exert an external impulse on the two-cart system. Reset to try another collision.": "La corrida se pausó antes de un tope. Un impacto contra el tope ejercería un impulso externo sobre el sistema de dos carritos. Reinicia para probar otra colisión.",
  // Model note and footer
  "Physics behind the simulation": "La física detrás de la simulación",
  "For elastic collisions, v′A = [(mA − mB)vA + 2mBvB] / (mA + mB), with the corresponding expression for B. For perfectly inelastic collisions both carts move together at (mAvA + mBvB) / (mA + mB). Total momentum is signed; kinetic energy is ½mv² summed over both carts.": "Para las colisiones elásticas, v′A = [(mA − mB)vA + 2mBvB] / (mA + mB), con la expresión correspondiente para B. En las colisiones perfectamente inelásticas, los dos carritos se mueven juntos a (mAvA + mBvB) / (mA + mB). La cantidad de movimiento total tiene signo; la energía cinética es ½mv² sumada sobre los dos carritos.",
  "The magnetic bumpers model a perfectly elastic interaction; hook-and-loop pads model sticking. Real equipment has rolling resistance and some energy loss. The collision is instantaneous in this ideal model; vector lengths change immediately at impact. The run ends before end-stop contact.": "Los parachoques magnéticos modelan una interacción perfectamente elástica; las almohadillas de velcro modelan carritos que se quedan pegados. El equipo real tiene resistencia a la rodadura y algo de pérdida de energía. En este modelo ideal la colisión es instantánea; la longitud de los vectores cambia de inmediato en el impacto. La corrida termina antes de tocar un tope.",
  "ZornScience · Explore. Observe. Explain.": "ZornScience · Explora. Observa. Explica.",
  "Conservation of momentum": "Conservación de la cantidad de movimiento",
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
  "Equal masses, one at rest": "Masas iguales, uno en reposo",
  "Launch the carts. After the collision, what does the Cart B velocity readout show?": "Lanza los carritos. Después de la colisión, ¿qué indica la lectura Velocidad del carrito B?",
  "That would happen if the carts stuck together. Check which bumper type you set up, then read the Cart B velocity readout after the collision.": "Eso pasaría si los carritos se pegaran. Revisa qué tipo de parachoques preparaste y luego lee la lectura Velocidad del carrito B después de la colisión.",
  "Cart B starts at rest, but it does not have to end at rest. Launch the carts and read the Cart B velocity readout after the hit.": "El carrito B empieza en reposo, pero no tiene que quedar en reposo. Lanza los carritos y lee la lectura Velocidad del carrito B después del golpe.",
  "Compare the total momentum readout before and after the collision. It does not change. Check whether your choice keeps it the same.": "Compara la lectura Cantidad de movimiento total antes y después de la colisión. No cambia. Revisa si tu opción la mantiene igual.",
  "With equal masses in an elastic collision, the carts swap velocities. Cart A stops ({a} m/s) and Cart B moves off at {right} m/s. Total momentum is {p} kg·m/s before and after, and kinetic energy stays {ke0} J.": "Con masas iguales en una colisión elástica, los carritos intercambian velocidades. El carrito A se detiene ({a} m/s) y el carrito B sale a {right} m/s. La cantidad de movimiento total es de {p} kg·m/s antes y después, y la energía cinética se mantiene en {ke0} J.",
  // Lab check, question 2
  "Carts that stick": "Carritos que se pegan",
  "Launch the carts. After the carts stick together, what does the kinetic energy readout show?": "Lanza los carritos. Después de que los carritos se peguen, ¿qué indica la lectura Energía cinética?",
  "That is the kinetic energy before the collision. Hook-and-loop pads are not the same as magnetic bumpers. Read the readout after the carts stick.": "Esa es la energía cinética antes de la colisión. Las almohadillas de velcro no son lo mismo que los parachoques magnéticos. Lee la lectura después de que los carritos se peguen.",
  "Kinetic energy adds for both carts. After the carts stick, both are moving.": "La energía cinética se suma para los dos carritos. Después de que se pegan, los dos se mueven.",
  "The carts keep moving after they stick, so they still have kinetic energy. Read the readout after the collision.": "Los carritos siguen moviéndose después de pegarse, así que todavía tienen energía cinética. Lee la lectura después de la colisión.",
  "Momentum is conserved, so the stuck carts move at ({mA} × {uA}) / {M} = {v} m/s, and total momentum is still {p} kg·m/s. But kinetic energy falls from {ke0} J to {right} J. Half of it turned into internal energy in the pads.": "Se conserva la cantidad de movimiento, así que los carritos pegados se mueven a ({mA} × {uA}) / {M} = {v} m/s, y la cantidad de movimiento total sigue siendo de {p} kg·m/s. Pero la energía cinética baja de {ke0} J a {right} J. La mitad se convirtió en energía interna en las almohadillas.",
  // Lab check, question 3 (its title, "Heavy cart meets light cart", is the Try a setup option above)
  "Launch the carts. After the collision, what does the Cart A velocity readout show?": "Lanza los carritos. Después de la colisión, ¿qué indica la lectura Velocidad del carrito A?",
  "Only equal masses make the moving cart stop. Here the moving cart is heavier than the cart it hits. Read the Cart A velocity readout after the collision.": "Solo las masas iguales hacen que el carrito en movimiento se detenga. Aquí el carrito en movimiento es más pesado que el que golpea. Lee la lectura Velocidad del carrito A después de la colisión.",
  "Cart B gets pushed forward, so it gains momentum. Total momentum stays the same, so Cart A cannot keep all of its own. Read the readout after the collision.": "El carrito B sale empujado hacia delante, así que gana cantidad de movimiento. La cantidad de movimiento total se mantiene igual, así que el carrito A no puede conservar toda la suya. Lee la lectura después de la colisión.",
  "A heavy cart that hits a light cart keeps going the same way. Check the sign of the Cart A velocity readout after the collision.": "Un carrito pesado que golpea a uno ligero sigue avanzando en el mismo sentido. Revisa el signo de la lectura Velocidad del carrito A después de la colisión.",
  "In an elastic collision, a heavy cart hitting a light one keeps going, only slower. Cart A moves on at {right} m/s and the light Cart B shoots ahead at {b} m/s. Check the momentum: {mA} × {right} + {mB} × {b} = {pAfter} kg·m/s, the same as the start.": "En una colisión elástica, un carrito pesado que golpea a uno ligero sigue avanzando, solo que más despacio. El carrito A sigue a {right} m/s y el carrito B, que es ligero, sale disparado a {b} m/s. Comprueba la cantidad de movimiento: {mA} × {right} + {mB} × {b} = {pAfter} kg·m/s, igual que al inicio.",
  // Lab check, question 4 (its title is close to the Try a setup option above)
  "Head-on, equal and opposite": "De frente, velocidades iguales y opuestas",
  "Launch the carts. After the carts stick, what does the total momentum readout show?": "Lanza los carritos. Después de que los carritos se peguen, ¿qué indica la lectura Cantidad de movimiento total?",
  "That is the momentum of one cart before the collision. Total momentum adds both carts, and Cart B moves left.": "Esa es la cantidad de movimiento de un carrito antes de la colisión. La cantidad de movimiento total suma los dos carritos, y el carrito B se mueve a la izquierda.",
  "Momentum has a direction. Cart B moves left, so its momentum is negative. Add the signs, not just the sizes.": "La cantidad de movimiento tiene dirección. El carrito B se mueve a la izquierda, así que su cantidad de movimiento es negativa. Suma con los signos, no solo los tamaños.",
  "That number is the starting kinetic energy, and it is in joules. Total momentum is in kg·m/s. Read the Total momentum readout.": "Ese número es la energía cinética inicial, y está en joules. La cantidad de movimiento total está en kg·m/s. Lee la lectura Cantidad de movimiento total.",
  "The two momenta are equal and opposite, {p1} and {p2} kg·m/s, so the total is {right} kg·m/s before the collision. Momentum is conserved, so it is still {right} kg·m/s after. The carts stop at {v} m/s, and all {energy} J of kinetic energy becomes internal energy.": "Las dos cantidades de movimiento son iguales y opuestas, {p1} y {p2} kg·m/s, así que el total es de {right} kg·m/s antes de la colisión. Se conserva la cantidad de movimiento, así que sigue siendo de {right} kg·m/s después. Los carritos se detienen a {v} m/s, y los {energy} J de energía cinética se convierten en energía interna.",
  // Lab check, question 5
  "Predict, then launch": "Predice y luego lanza",
  "Before you launch, use conservation of momentum to predict the velocity of the stuck carts. Then launch and read the Cart A velocity. What does it show?": "Antes de lanzar, usa la conservación de la cantidad de movimiento para predecir la velocidad de los carritos pegados. Luego lanza y lee la velocidad del carrito A. ¿Qué indica?",
  "The heavier cart counts more than the lighter one. Use momentum, mass times velocity, not a plain average.": "El carrito más pesado cuenta más que el más ligero. Usa la cantidad de movimiento, masa por velocidad, no un promedio simple.",
  "{momentum} is the total momentum, and it is in kg·m/s. The question asks for velocity. Think about how many kilograms are moving after the carts stick.": "{momentum} es la cantidad de movimiento total, y está en kg·m/s. La pregunta pide la velocidad. Piensa cuántos kilogramos se mueven después de que los carritos se pegan.",
  "Cart B moves left, so its momentum is negative. Check the sign of each momentum before you add them.": "El carrito B se mueve a la izquierda, así que su cantidad de movimiento es negativa. Revisa el signo de cada cantidad de movimiento antes de sumarlas.",
  "Total momentum before is {mA} × {uA} + {mB} × ({uB}) = {momentum} kg·m/s. It stays {momentum} kg·m/s after, now carried by {M} kg moving together: v = {momentum} / {M} = {right} m/s. Kinetic energy falls from {ke0} J to {ke1} J.": "La cantidad de movimiento total antes es {mA} × {uA} + {mB} × ({uB}) = {momentum} kg·m/s. Sigue siendo de {momentum} kg·m/s después, ahora con {M} kg moviéndose juntos: v = {momentum} / {M} = {right} m/s. La energía cinética baja de {ke0} J a {ke1} J."
}};
  if (i18n) i18n.configure(copy);
  // Lab check (labcheck.js and ../shared/zsa-labcheck.js). Each choice is [value, label, feedback key]; the right
  // choice has a null key. Every number in braces is filled in by labcheck.js from the lab's own collision physics
  // and its readout formatter, so no answer is written here. setup is the starting state: mode, the Bumper type
  // option value (elastic or inelastic); mass, the Total mass of Cart A and Cart B in kg; velocity, their Starting
  // velocity in m/s (negative is to the left).
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
      {id: "transfer", title: "Equal masses, one at rest", setup: {mode: "elastic", mass: [0.5, 0.5], velocity: [0.8, 0]},
        question: "Launch the carts. After the collision, what does the Cart B velocity readout show?",
        choices: [["right", "{right} m/s", null], ["half", "{half} m/s", "half"], ["stays", "{stays} m/s", "stays"], ["double", "{double} m/s", "double"]],
        feedback: {
          half: "That would happen if the carts stuck together. Check which bumper type you set up, then read the Cart B velocity readout after the collision.",
          stays: "Cart B starts at rest, but it does not have to end at rest. Launch the carts and read the Cart B velocity readout after the hit.",
          double: "Compare the total momentum readout before and after the collision. It does not change. Check whether your choice keeps it the same."
        },
        explanation: "With equal masses in an elastic collision, the carts swap velocities. Cart A stops ({a} m/s) and Cart B moves off at {right} m/s. Total momentum is {p} kg·m/s before and after, and kinetic energy stays {ke0} J."},
      {id: "stick", title: "Carts that stick", setup: {mode: "inelastic", mass: [0.5, 0.5], velocity: [0.8, 0]},
        question: "Launch the carts. After the carts stick together, what does the kinetic energy readout show?",
        choices: [["right", "{right} J", null], ["same", "{same} J", "same"], ["oneCart", "{oneCart} J", "oneCart"], ["zero", "{zero} J", "zero"]],
        feedback: {
          same: "That is the kinetic energy before the collision. Hook-and-loop pads are not the same as magnetic bumpers. Read the readout after the carts stick.",
          oneCart: "Kinetic energy adds for both carts. After the carts stick, both are moving.",
          zero: "The carts keep moving after they stick, so they still have kinetic energy. Read the readout after the collision."
        },
        explanation: "Momentum is conserved, so the stuck carts move at ({mA} × {uA}) / {M} = {v} m/s, and total momentum is still {p} kg·m/s. But kinetic energy falls from {ke0} J to {right} J. Half of it turned into internal energy in the pads."},
      {id: "heavy", title: "Heavy cart meets light cart", setup: {mode: "elastic", mass: [1, 0.25], velocity: [0.8, 0]},
        question: "Launch the carts. After the collision, what does the Cart A velocity readout show?",
        choices: [["right", "{right} m/s", null], ["stops", "{stops} m/s", "stops"], ["same", "{same} m/s", "same"], ["reverses", "{reverses} m/s", "reverses"]],
        feedback: {
          stops: "Only equal masses make the moving cart stop. Here the moving cart is heavier than the cart it hits. Read the Cart A velocity readout after the collision.",
          same: "Cart B gets pushed forward, so it gains momentum. Total momentum stays the same, so Cart A cannot keep all of its own. Read the readout after the collision.",
          reverses: "A heavy cart that hits a light cart keeps going the same way. Check the sign of the Cart A velocity readout after the collision."
        },
        explanation: "In an elastic collision, a heavy cart hitting a light one keeps going, only slower. Cart A moves on at {right} m/s and the light Cart B shoots ahead at {b} m/s. Check the momentum: {mA} × {right} + {mB} × {b} = {pAfter} kg·m/s, the same as the start."},
      {id: "headon", title: "Head-on, equal and opposite", setup: {mode: "inelastic", mass: [0.5, 0.5], velocity: [0.8, -0.8]},
        question: "Launch the carts. After the carts stick, what does the total momentum readout show?",
        choices: [["right", "{right} kg·m/s", null], ["oneCart", "{oneCart} kg·m/s", "oneCart"], ["sum", "{sum} kg·m/s", "sum"], ["energy", "{energy} kg·m/s", "energy"]],
        feedback: {
          oneCart: "That is the momentum of one cart before the collision. Total momentum adds both carts, and Cart B moves left.",
          sum: "Momentum has a direction. Cart B moves left, so its momentum is negative. Add the signs, not just the sizes.",
          energy: "That number is the starting kinetic energy, and it is in joules. Total momentum is in kg·m/s. Read the Total momentum readout."
        },
        explanation: "The two momenta are equal and opposite, {p1} and {p2} kg·m/s, so the total is {right} kg·m/s before the collision. Momentum is conserved, so it is still {right} kg·m/s after. The carts stop at {v} m/s, and all {energy} J of kinetic energy becomes internal energy."},
      {id: "predict", title: "Predict, then launch", setup: {mode: "inelastic", mass: [1, 0.5], velocity: [1, -0.6]},
        question: "Before you launch, use conservation of momentum to predict the velocity of the stuck carts. Then launch and read the Cart A velocity. What does it show?",
        choices: [["right", "{right} m/s", null], ["avg", "{avg} m/s", "avg"], ["momentum", "{momentum} m/s", "momentum"], ["ignoreSign", "{ignoreSign} m/s", "ignoreSign"]],
        feedback: {
          avg: "The heavier cart counts more than the lighter one. Use momentum, mass times velocity, not a plain average.",
          momentum: "{momentum} is the total momentum, and it is in kg·m/s. The question asks for velocity. Think about how many kilograms are moving after the carts stick.",
          ignoreSign: "Cart B moves left, so its momentum is negative. Check the sign of each momentum before you add them."
        },
        explanation: "Total momentum before is {mA} × {uA} + {mB} × ({uB}) = {momentum} kg·m/s. It stays {momentum} kg·m/s after, now carried by {M} kg moving together: v = {momentum} / {M} = {right} m/s. Kinetic energy falls from {ke0} J to {ke1} J."}
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
