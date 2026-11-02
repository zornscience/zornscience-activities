(function () {
  "use strict";
  // The Atwood Machine: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="atwood-machine"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
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
  "Virtual lab · No data entry or saving": "Laboratorio virtual · Sin captura ni guardado de datos"
}};
  i18n.configure(copy);
  // Step 2 of the instructions holds a bold button name inside one sentence. Rebuild it from one full template,
  // so Spanish keeps its own word order around the button name.
  var step = root.querySelector("#zsa-th-instructions li:nth-child(2)"), strong = step && step.querySelector("strong");
  if (i18n.lang === "es" && strong) {
    var parts = i18n.text("Predict which side will move down. Select {button} and watch both acceleration arrows.").split("{button}");
    step.replaceChildren(document.createTextNode(parts[0]), strong, document.createTextNode(parts[1] || ""));
  }
}());
