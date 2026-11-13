(function () {
  "use strict";
  // The Atwood Machine: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="atwood-machine"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  var copy = {title:"The Atwood Machine", es:{
  // Header, instructions and share
  "The Atwood Machine": "La máquina de Atwood",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share this simulation. Each link opens a fresh apparatus.": "Comparte esta simulación. Cada enlace abre el aparato desde cero.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore Newton’s second law with two masses over an ideal pulley.": "Explora la segunda ley de Newton con dos masas sobre una polea ideal.",
  "Explore Newton’s second law": "Exploración de la segunda ley de Newton",
  "Choose the total mass on each hanger. Each includes a 50 g hanger; the brass discs represent added mass.": "Elige la masa total de cada portapesas. Cada una incluye un portapesas de 50 g; los discos de latón representan la masa agregada.",
  "Predict which side will move down. Select {button} and watch both acceleration arrows.": "Predice qué lado va a bajar. Selecciona {button} y observa las dos flechas de aceleración.",
  "Release masses": "Soltar las masas",
  "Pause, reset, or swap the masses. Changing a mass returns both hangers to their starting positions.": "Pausa, reinicia o intercambia las masas. Al cambiar una masa, los dos portapesas regresan a su posición inicial.",
  "Try equal masses, then transfer mass from one side to the other while keeping the total fixed. Compare the net force and acceleration.": "Prueba con masas iguales y luego pasa masa de un lado al otro sin cambiar el total. Compara la fuerza neta y la aceleración.",
  "Turn on force arrows to compare gravity with string tension. Use slow motion to inspect the movement.": "Activa las flechas de fuerza para comparar la gravedad con la tensión de la cuerda. Usa la cámara lenta para examinar el movimiento.",
  "The ideal model assumes a massless, inextensible string and a massless, frictionless pulley. Gravity is 9.81 m/s². Motion stops at the apparatus travel limit; reset to repeat. There are no records or saved observations.": "El modelo ideal supone una cuerda sin masa e inextensible y una polea sin masa y sin fricción. La gravedad es 9.81 m/s². El movimiento se detiene en el límite de recorrido del aparato; reinicia para repetir. No hay registros ni observaciones guardadas.",
  // Controls
  "01 / LOAD THE HANGERS": "01 / CARGA LOS PORTAPESAS",
  "Set the masses": "Ajuste de las masas",
  "Total mass, including each 50 g hanger.": "Masa total, incluido cada portapesas de 50 g.",
  "Left hanger · m₁": "Portapesas izquierdo · m₁",
  "Right hanger · m₂": "Portapesas derecho · m₂",
  "⇄ Swap masses": "⇄ Intercambiar masas",
  "Equal masses": "Masas iguales",
  "Transfer 25 g →": "Pasar 25 g →",
  "02 / LOOK CLOSER": "02 / OBSERVA DE CERCA",
  "Acceleration arrows": "Flechas de aceleración",
  "Gravity & tension arrows": "Flechas de gravedad y tensión",
  "Playback speed": "Ritmo de reproducción",
  "Real time · 1×": "Tiempo real · 1×",
  "Slow motion · ¼×": "Cámara lenta · ¼×",
  "Playback changes viewing speed, not the physical acceleration.": "La reproducción cambia el ritmo al que ves el movimiento, no la aceleración física.",
  "← All ZornScience activities": "← Todas las actividades de ZornScience",
  // Apparatus
  "The Atwood apparatus": "El aparato de Atwood",
  "FRICTIONLESS PULLEY": "POLEA SIN FRICCIÓN",
  "BRASS MASSES / LOW-FRICTION PULLEY": "MASAS DE LATÓN / POLEA DE BAJA FRICCIÓN",
  "VIRTUAL LAB BENCH": "MESA DE LABORATORIO VIRTUAL",
  "Atwood machine with two suspended mass hangers": "Máquina de Atwood con dos portapesas colgantes",
  "Two brass mass hangers on a string over a pulley attached to a steel laboratory stand.": "Dos portapesas de latón en una cuerda que pasa por una polea sujeta a un soporte de laboratorio de acero.",
  "Left mass {m1} grams, right mass {m2} grams. {direction} {motion}": "Masa izquierda de {m1} gramos, masa derecha de {m2} gramos. {direction} {motion}",
  "Free motion ended.": "Terminó el movimiento libre.",
  "Acceleration {a} meters per second squared.": "Aceleración de {a} metros por segundo al cuadrado.",
  "Steel support stand": "Soporte de acero",
  "Massless string": "Cuerda sin masa",
  "ZORNSCIENCE / MECHANICS LAB": "ZORNSCIENCE / LABORATORIO DE MECÁNICA",
  "READY TO RELEASE": "LISTO PARA SOLTAR",
  "IN MOTION": "EN MOVIMIENTO",
  "PAUSED": "EN PAUSA",
  "TRAVEL LIMIT / RESET TO REPEAT": "LÍMITE DE RECORRIDO / REINICIA PARA REPETIR",
  // Run controls and readouts
  "▶ Release masses": "▶ Soltar las masas",
  "Ⅱ Pause": "Ⅱ Pausar",
  "▶ Resume": "▶ Reanudar",
  "Travel complete": "Recorrido completo",
  "↺ Reset position": "↺ Reiniciar posición",
  "Right side accelerates down.": "El lado derecho acelera hacia abajo.",
  "Left side accelerates down.": "El lado izquierdo acelera hacia abajo.",
  "Balanced: no acceleration.": "Equilibrado: no hay aceleración.",
  "Travel limit reached. Reset to repeat.": "Se alcanzó el límite de recorrido. Reinicia para repetir.",
  "ACCELERATION": "ACELERACIÓN",
  "NET DRIVING FORCE": "FUERZA NETA",
  "STRING TENSION": "TENSIÓN DE LA CUERDA",
  "SPEED": "RAPIDEZ",
  "n/a": "n/d",
  "NEWTON’S SECOND LAW / THE WHOLE SYSTEM": "SEGUNDA LEY DE NEWTON / TODO EL SISTEMA",
  "The weight difference drives the motion; both masses contribute inertia.": "La diferencia de pesos impulsa el movimiento; las dos masas aportan inercia.",
  "Equal weights balance. Released from rest, both hangers remain stationary.": "Los pesos iguales se equilibran. Si se sueltan desde el reposo, los dos portapesas se quedan quietos.",
  "Positive acceleration means the right hanger moves down. Readouts and force arrows describe free motion; they turn off at the travel limit.": "Una aceleración positiva significa que el portapesas derecho baja. Las lecturas y las flechas de fuerza describen el movimiento libre; se apagan en el límite de recorrido.",
  // Model note and footer
  "About the ideal model": "Acerca del modelo ideal",
  "The string remains taut and both masses have the same acceleration magnitude. Tension is equal on both sides: T = 2m₁m₂g / (m₁ + m₂). The displayed net force is the signed driving force on the whole system, (m₂ − m₁)g. Hanger sizes and discs are enlarged for visibility; disc thickness varies to represent the selected added mass. The 1.2 m scale marks the travel distance. Real apparatus has string mass, pulley inertia and friction. At a travel limit the simulation ends the free-motion model rather than simulating an impact.": "La cuerda se mantiene tensa y las dos masas tienen la misma magnitud de aceleración. La tensión es igual en ambos lados: T = 2m₁m₂g / (m₁ + m₂). La fuerza neta que se muestra es la fuerza impulsora con signo sobre todo el sistema, (m₂ − m₁)g. Los portapesas y los discos se muestran más grandes para que se vean mejor; el grosor de los discos cambia para representar la masa agregada que elegiste. La escala de 1.2 m marca la distancia de recorrido. Un aparato real tiene una cuerda con masa, una polea con inercia y fricción. En un límite de recorrido, la simulación termina el modelo de movimiento libre en lugar de simular un impacto.",
  "ZornScience · Explore. Observe. Explain.": "ZornScience · Explora. Observa. Explica.",
  "Virtual lab · No data entry or saving": "Laboratorio virtual · Sin captura ni guardado de datos",
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
  "Double the difference": "El doble de diferencia",
  "Press Transfer 25 g → two times, so m₁ = 100 g and m₂ = 300 g. What does the acceleration read now?": "Presiona Pasar 25 g → dos veces, para que m₁ = 100 g y m₂ = 300 g. ¿Qué indica ahora la aceleración?",
  "That is the starting acceleration. Moving mass from one side to the other changes the net force. Press Transfer twice and read the lab again.": "Esa es la aceleración inicial. Pasar masa de un lado al otro cambia la fuerza neta. Presiona Pasar 25 g → dos veces y vuelve a leer el laboratorio.",
  "The weight difference doubled. It was not squared. Compare the net driving force before and after you press Transfer.": "La diferencia de pesos se duplicó. No se elevó al cuadrado. Compara la fuerza neta antes y después de presionar Pasar 25 g →.",
  "The total mass did not change, so there is no extra mass slowing the system down. Look at what happened to the net driving force.": "La masa total no cambió, así que no hay masa extra que frene el sistema. Observa qué le pasó a la fuerza neta.",
  "Moving 25 g twice keeps the total at 400 g but doubles the weight difference from 100 g to 200 g. The net driving force doubles from {startForce} N to {force} N, and the mass being accelerated stays the same, so the acceleration doubles.": "Pasar 25 g dos veces mantiene el total en 400 g, pero duplica la diferencia de pesos de 100 g a 200 g. La fuerza neta se duplica de {startForce} N a {force} N, y la masa que se acelera es la misma, así que la aceleración se duplica.",
  // Lab check, question 2
  "Add mass to both sides": "Más masa en los dos lados",
  "Move m₁ to 275 g and m₂ to 375 g. The right side is still 100 g heavier. What does the acceleration read now?": "Cambia m₁ a 275 g y m₂ a 375 g. El lado derecho sigue teniendo 100 g más. ¿Qué indica ahora la aceleración?",
  "The net force is the same, but now there is more mass to speed up. Read the acceleration after you change both hangers.": "La fuerza neta es la misma, pero ahora hay más masa que acelerar. Lee la aceleración después de cambiar los dos portapesas.",
  "That number is the net driving force, in newtons. The question asks for the acceleration, in m/s².": "Ese número es la fuerza neta, en newtons. La pregunta pide la aceleración, en m/s².",
  "Both hangers speed up together, so the net force has to accelerate the mass of both hangers, not just the heavy one.": "Los dos portapesas aumentan su rapidez juntos, así que la fuerza neta tiene que acelerar la masa de los dos portapesas, no solo la del más pesado.",
  "The net driving force stays at {force} N because the difference is still 100 g. The total mass grew from 350 g to 650 g, so the same force gives a smaller acceleration: {force} N ÷ 0.650 kg = {right} m/s².": "La fuerza neta se mantiene en {force} N porque la diferencia sigue siendo de 100 g. La masa total aumentó de 350 g a 650 g, así que la misma fuerza produce una aceleración menor: {force} N ÷ 0.650 kg = {right} m/s².",
  // Lab check, question 3
  "Tension in the string": "La tensión de la cuerda",
  "Turn on Gravity and tension arrows and read the string tension. Which statement matches the lab?": "Activa Flechas de gravedad y tensión y lee la tensión de la cuerda. ¿Qué enunciado coincide con el laboratorio?",
  "T = {right} N. It is more than the light hanger's weight ({light} N) and less than the heavy hanger's weight ({heavy} N).": "T = {right} N. Es mayor que el peso del portapesas ligero ({light} N) y menor que el peso del portapesas pesado ({heavy} N).",
  "T = {heavyWeight} N. It equals the heavy hanger's weight.": "T = {heavyWeight} N. Es igual al peso del portapesas pesado.",
  "T = {lightWeight} N. It equals the light hanger's weight.": "T = {lightWeight} N. Es igual al peso del portapesas ligero.",
  "T = {difference} N. It equals the difference between the two weights.": "T = {difference} N. Es igual a la diferencia entre los dos pesos.",
  "If the string pulled up on the heavy hanger as hard as gravity pulls it down, the heavy hanger would not speed up. Read the tension readout.": "Si la cuerda jalara hacia arriba el portapesas pesado con la misma fuerza con la que la gravedad lo jala hacia abajo, el portapesas pesado no aumentaría su rapidez. Lee la lectura de la tensión.",
  "If the string pulled up on the light hanger only as hard as gravity pulls it down, the light hanger would not speed up. Read the tension readout.": "Si la cuerda jalara hacia arriba el portapesas ligero solo con la misma fuerza con la que la gravedad lo jala hacia abajo, el portapesas ligero no aumentaría su rapidez. Lee la lectura de la tensión.",
  "The difference of the weights is the net driving force on the whole system. Compare the tension readout with the net driving force readout.": "La diferencia de los pesos es la fuerza neta sobre todo el sistema. Compara la lectura de la tensión con la lectura de la fuerza neta.",
  "The light hanger speeds up going up, so the string must pull it up harder than gravity pulls it down: T is more than m₁g. The heavy hanger speeds up going down, so gravity must pull harder than the string: T is less than m₂g. One string means one tension on both sides.": "El portapesas ligero aumenta su rapidez al subir, así que la cuerda debe jalarlo hacia arriba con más fuerza que la gravedad hacia abajo: T es mayor que m₁g. El portapesas pesado aumenta su rapidez al bajar, así que la gravedad debe jalarlo con más fuerza que la cuerda: T es menor que m₂g. Una sola cuerda significa una sola tensión en los dos lados.",
  // Lab check, question 4
  "Press Equal masses, then press Release masses. What do the acceleration and the string tension read?": "Presiona Masas iguales y luego presiona Soltar las masas. ¿Qué indican la aceleración y la tensión de la cuerda?",
  "a = {zero} m/s² and T = {right} N, the weight of one hanger": "a = {zero} m/s² y T = {right} N, el peso de un portapesas",
  "a = {zero} m/s² and T = {none} N, because nothing moves": "a = {zero} m/s² y T = {none} N, porque nada se mueve",
  "a = {zero} m/s² and T = {both} N, the weight of both hangers": "a = {zero} m/s² y T = {both} N, el peso de los dos portapesas",
  "a = {free} m/s² and T = {none} N, because the hangers fall freely": "a = {free} m/s² y T = {none} N, porque los portapesas caen libremente",
  "The string is still holding up both hangers, even when they do not move. Read the tension after you press Equal masses.": "La cuerda sigue sosteniendo los dos portapesas, aunque no se muevan. Lee la tensión después de presionar Masas iguales.",
  "Each side of the string holds up one hanger, not both. Compare the tension with the weight of one hanger.": "Cada lado de la cuerda sostiene un portapesas, no los dos. Compara la tensión con el peso de un portapesas.",
  "The string and pulley connect the hangers, so they cannot fall freely. Check the acceleration readout after you release them.": "La cuerda y la polea conectan los portapesas, así que no pueden caer libremente. Revisa la lectura de la aceleración después de soltarlos.",
  "Equal masses make the weights equal, so the net force is zero and the acceleration is zero. The hangers stay at rest. Each hanger is balanced, so the string pulls up with exactly its weight: T = mg = (0.150 kg)(9.81 m/s²) = {weight} N. The string stays tight even though nothing moves.": "Con masas iguales, los pesos son iguales, así que la fuerza neta es cero y la aceleración es cero. Los portapesas se quedan en reposo. Cada portapesas está en equilibrio, así que la cuerda lo jala hacia arriba con exactamente su peso: T = mg = (0.150 kg)(9.81 m/s²) = {weight} N. La cuerda sigue tensa aunque nada se mueva.",
  // Lab check, question 5
  "Time the fall": "Mide el tiempo de la caída",
  "Each hanger moves 0.60 m from rest before the lab stops it. Press Release masses and wait until the lab says Travel complete. What does the clock read?": "Cada portapesas recorre 0.60 m desde el reposo antes de que el laboratorio lo detenga. Presiona Soltar las masas y espera hasta que el laboratorio indique Recorrido completo. ¿Qué indica el reloj?",
  "From rest, the distance is x = ½at², not at². Read the clock when the lab says Travel complete.": "Desde el reposo, la distancia es x = ½at², no at². Lee el reloj cuando el laboratorio indique Recorrido completo.",
  "Distance is not acceleration times time. The hangers start at rest and speed up, so x = ½at².": "La distancia no es la aceleración por el tiempo. Los portapesas empiezan en reposo y aumentan su rapidez, así que x = ½at².",
  "Each hanger moves 0.60 m, not the whole 1.2 m scale. Read the clock when the lab says Travel complete.": "Cada portapesas recorre 0.60 m, no toda la escala de 1.2 m. Lee el reloj cuando el laboratorio indique Recorrido completo.",
  "The acceleration is {a} m/s². From rest, x = ½at², so t = √(2x/a) = √(2 × 0.60 m ÷ {a} m/s²) = {right} s. The lab stops the clock at exactly that moment, and the readouts change to n/a. Slow motion changes how fast you watch it, not the clock.": "La aceleración es {a} m/s². Desde el reposo, x = ½at², así que t = √(2x/a) = √(2 × 0.60 m ÷ {a} m/s²) = {right} s. El laboratorio detiene el reloj exactamente en ese momento, y las lecturas cambian a n/d. La cámara lenta cambia qué tan rápido lo ves, no el reloj."
}};
  if (i18n) {
    i18n.configure(copy);
    // Step 2 of the instructions holds a bold button name inside one sentence. Rebuild it from one full template,
    // so Spanish keeps its own word order around the button name.
    var step = root.querySelector("#zsa-th-instructions li:nth-child(2)"), strong = step && step.querySelector("strong");
    if (i18n.lang === "es" && strong) {
      var parts = i18n.text("Predict which side will move down. Select {button} and watch both acceleration arrows.").split("{button}");
      step.replaceChildren(document.createTextNode(parts[0]), strong, document.createTextNode(parts[1] || ""));
    }
  }

  // Lab check (labcheck.js and ../shared/zsa-labcheck.js). Each choice is [value, label, feedback key]; the right
  // choice has a null key. Every number in braces is filled in by labcheck.js from physics.js and the lab's own
  // readout formatters, so no answer is written here. setup is the starting state ({m1, m2} in grams).
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
      {id: "force", title: "Double the difference", setup: {m1: 150, m2: 250},
        question: "Press Transfer 25 g → two times, so m₁ = 100 g and m₂ = 300 g. What does the acceleration read now?",
        choices: [["right", "{right} m/s²", null], ["sameA", "{start} m/s²", "sameA"], ["fourTimes", "{four} m/s²", "fourTimes"],
          ["halfA", "{half} m/s²", "halfA"]],
        feedback: {
          sameA: "That is the starting acceleration. Moving mass from one side to the other changes the net force. Press Transfer twice and read the lab again.",
          fourTimes: "The weight difference doubled. It was not squared. Compare the net driving force before and after you press Transfer.",
          halfA: "The total mass did not change, so there is no extra mass slowing the system down. Look at what happened to the net driving force."
        },
        explanation: "Moving 25 g twice keeps the total at 400 g but doubles the weight difference from 100 g to 200 g. The net driving force doubles from {startForce} N to {force} N, and the mass being accelerated stays the same, so the acceleration doubles."},
      {id: "mass", title: "Add mass to both sides", setup: {m1: 125, m2: 225},
        question: "Move m₁ to 275 g and m₂ to 375 g. The right side is still 100 g heavier. What does the acceleration read now?",
        choices: [["right", "{right} m/s²", null], ["sameF", "{start} m/s²", "sameF"], ["readForce", "{force} m/s²", "readForce"],
          ["heavyOnly", "{heavy} m/s²", "heavyOnly"]],
        feedback: {
          sameF: "The net force is the same, but now there is more mass to speed up. Read the acceleration after you change both hangers.",
          readForce: "That number is the net driving force, in newtons. The question asks for the acceleration, in m/s².",
          heavyOnly: "Both hangers speed up together, so the net force has to accelerate the mass of both hangers, not just the heavy one."
        },
        explanation: "The net driving force stays at {force} N because the difference is still 100 g. The total mass grew from 350 g to 650 g, so the same force gives a smaller acceleration: {force} N ÷ 0.650 kg = {right} m/s²."},
      {id: "tension", title: "Tension in the string", setup: {m1: 150, m2: 400},
        question: "Turn on Gravity and tension arrows and read the string tension. Which statement matches the lab?",
        choices: [["right", "T = {right} N. It is more than the light hanger's weight ({light} N) and less than the heavy hanger's weight ({heavy} N).", null],
          ["heavyWeight", "T = {heavyWeight} N. It equals the heavy hanger's weight.", "heavyWeight"],
          ["lightWeight", "T = {lightWeight} N. It equals the light hanger's weight.", "lightWeight"],
          ["diffWeights", "T = {difference} N. It equals the difference between the two weights.", "diffWeights"]],
        feedback: {
          heavyWeight: "If the string pulled up on the heavy hanger as hard as gravity pulls it down, the heavy hanger would not speed up. Read the tension readout.",
          lightWeight: "If the string pulled up on the light hanger only as hard as gravity pulls it down, the light hanger would not speed up. Read the tension readout.",
          diffWeights: "The difference of the weights is the net driving force on the whole system. Compare the tension readout with the net driving force readout."
        },
        explanation: "The light hanger speeds up going up, so the string must pull it up harder than gravity pulls it down: T is more than m₁g. The heavy hanger speeds up going down, so gravity must pull harder than the string: T is less than m₂g. One string means one tension on both sides."},
      {id: "balanced", title: "Equal masses", setup: {m1: 150, m2: 450},
        question: "Press Equal masses, then press Release masses. What do the acceleration and the string tension read?",
        choices: [["right", "a = {zero} m/s² and T = {right} N, the weight of one hanger", null],
          ["zeroT", "a = {zero} m/s² and T = {none} N, because nothing moves", "zeroT"],
          ["bothWeights", "a = {zero} m/s² and T = {both} N, the weight of both hangers", "bothWeights"],
          ["freeFall", "a = {free} m/s² and T = {none} N, because the hangers fall freely", "freeFall"]],
        feedback: {
          zeroT: "The string is still holding up both hangers, even when they do not move. Read the tension after you press Equal masses.",
          bothWeights: "Each side of the string holds up one hanger, not both. Compare the tension with the weight of one hanger.",
          freeFall: "The string and pulley connect the hangers, so they cannot fall freely. Check the acceleration readout after you release them."
        },
        explanation: "Equal masses make the weights equal, so the net force is zero and the acceleration is zero. The hangers stay at rest. Each hanger is balanced, so the string pulls up with exactly its weight: T = mg = (0.150 kg)(9.81 m/s²) = {weight} N. The string stays tight even though nothing moves."},
      {id: "time", title: "Time the fall", setup: {m1: 100, m2: 400},
        question: "Each hanger moves 0.60 m from rest before the lab stops it. Press Release masses and wait until the lab says Travel complete. What does the clock read?",
        choices: [["right", "{right} s", null], ["noHalf", "{noHalf} s", "noHalf"], ["linear", "{linear} s", "linear"], ["fullScale", "{fullScale} s", "fullScale"]],
        feedback: {
          noHalf: "From rest, the distance is x = ½at², not at². Read the clock when the lab says Travel complete.",
          linear: "Distance is not acceleration times time. The hangers start at rest and speed up, so x = ½at².",
          fullScale: "Each hanger moves 0.60 m, not the whole 1.2 m scale. Read the clock when the lab says Travel complete."
        },
        explanation: "The acceleration is {a} m/s². From rest, x = ½at², so t = √(2x/a) = √(2 × 0.60 m ÷ {a} m/s²) = {right} s. The lab stops the clock at exactly that moment, and the readouts change to n/a. Slow motion changes how fast you watch it, not the clock."}
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
