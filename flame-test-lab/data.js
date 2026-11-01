(function () {
  "use strict";
  // Virtual Flame Test Lab: every English string with its Mexican Spanish translation. English is the default and
  // the fallback. Formulas, symbols and numbers stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="flame-test-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Virtual Flame Test Lab", es:{
  // Header and share panel
  "Virtual Flame Test Lab": "Laboratorio virtual de prueba de llama",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Share a fresh investigation. Your unknown sample and tested samples are not included.": "Comparte una investigación nueva. No se incluyen tu muestra desconocida ni las muestras que probaste.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Compare eight known metal salts and identify an unknown sample in the ZornScience virtual flame test lab.": "Compara ocho sales metálicas conocidas e identifica una muestra desconocida en el laboratorio virtual de prueba de llama de ZornScience.",
  // Workbench
  "Virtual laboratory": "Laboratorio virtual",
  "LIVE EXPERIMENT": "EXPERIMENTO EN VIVO",
  "↺ Clear flame": "↺ Limpiar la llama",
  "Bunsen burner showing the flame color of the selected sample": "Mechero Bunsen que muestra el color de la llama de la muestra seleccionada",
  "THE OBSERVATION CHAMBER": "LA CÁMARA DE OBSERVACIÓN",
  "Look closely. What do you notice?": "Observa con atención. ¿Qué notas?",
  "BUNSEN BURNER · READY": "MECHERO BUNSEN · LISTO",
  "A clean blue flame. Ready to explore?": "Una llama azul y limpia. ¿Todo listo para explorar?",
  "UNKNOWN SAMPLE · OBSERVING": "MUESTRA DESCONOCIDA · EN OBSERVACIÓN",
  // Sample tray
  "Your sample tray": "Tu charola de muestras",
  "{count} / 8 tested": "{count} / 8 probadas",
  "Click or tap a sample to test it in the flame.": "Haz clic o toca una muestra para probarla en la llama.",
  "↻ New investigation": "↻ Nueva investigación",
  "Unknown sample": "Muestra desconocida",
  "One of the eight known salts": "Una de las ocho sales conocidas",
  "Test unknown sample": "Prueba la muestra desconocida",
  "Lithium": "Litio",
  "Sodium": "Sodio",
  "Potassium": "Potasio",
  "Calcium": "Calcio",
  "Strontium": "Estroncio",
  "Barium": "Bario",
  "Copper": "Cobre",
  "Cesium": "Cesio",
  "Test Lithium chloride": "Prueba el cloruro de litio",
  "Test Sodium chloride": "Prueba el cloruro de sodio",
  "Test Potassium chloride": "Prueba el cloruro de potasio",
  "Test Calcium chloride": "Prueba el cloruro de calcio",
  "Test Strontium chloride": "Prueba el cloruro de estroncio",
  "Test Barium chloride": "Prueba el cloruro de bario",
  "Test Copper chloride": "Prueba el cloruro de cobre",
  "Test Cesium chloride": "Prueba el cloruro de cesio",
  "LITHIUM CHLORIDE · {formula}": "CLORURO DE LITIO · {formula}",
  "SODIUM CHLORIDE · {formula}": "CLORURO DE SODIO · {formula}",
  "POTASSIUM CHLORIDE · {formula}": "CLORURO DE POTASIO · {formula}",
  "CALCIUM CHLORIDE · {formula}": "CLORURO DE CALCIO · {formula}",
  "STRONTIUM CHLORIDE · {formula}": "CLORURO DE ESTRONCIO · {formula}",
  "BARIUM CHLORIDE · {formula}": "CLORURO DE BARIO · {formula}",
  "COPPER CHLORIDE · {formula}": "CLORURO DE COBRE · {formula}",
  "CESIUM CHLORIDE · {formula}": "CLORURO DE CESIO · {formula}",
  "Crimson red flame": "Llama de color rojo carmesí",
  "Intense golden yellow flame": "Llama de color amarillo dorado intenso",
  "Pale lilac flame": "Llama de color lila pálido",
  "Orange-red / brick red flame": "Llama de color rojo anaranjado / rojo ladrillo",
  "Scarlet red flame": "Llama de color rojo escarlata",
  "Apple green flame": "Llama de color verde manzana",
  "Blue-green flame": "Llama de color verde azulado",
  "Blue-violet flame": "Llama de color violeta azulado",
  // Footer
  "Chemistry, brought to life.": "La química cobra vida.",
  "Idealized flame colors · Real observations can vary": "Colores de llama idealizados · Las observaciones reales pueden variar",
  // Instructions dialog
  "How to use this lab": "Guía para usar este laboratorio",
  "Close instructions": "Cerrar instrucciones",
  "Click a sample to compare the characteristic flame colors of eight known metal salts and one unknown.": "Haz clic en una muestra para comparar los colores característicos de la llama de ocho sales metálicas conocidas y una desconocida.",
  "Explore the known samples.": "Explora las muestras conocidas.",
  "Click or tap a sample bottle to place its sample in the flame. With a keyboard, focus a bottle and press Enter or Space.": "Haz clic o toca un frasco para poner su muestra en la llama. Con el teclado, selecciona un frasco y presiona Enter o la barra espaciadora.",
  "Observe and compare.": "Observa y compara.",
  "Watch how the flame color changes. Click different samples to compare them. The virtual wire loop is automatically cleaned between tests.": "Observa cómo cambia el color de la llama. Haz clic en distintas muestras para compararlas. El asa de alambre virtual se limpia automáticamente entre una prueba y otra.",
  "Investigate the unknown.": "Investiga la muestra desconocida.",
  "Its identity is one of the eight known salts. Compare its flame color with the known samples. Use New investigation to start again with a randomly selected unknown.": "Es una de las ocho sales conocidas. Compara el color de su llama con el de las muestras conocidas. Usa Nueva investigación para empezar otra vez con una muestra desconocida elegida al azar.",
  "Heating excites atoms and ions in the sample. As electrons return to lower energy levels, they emit characteristic wavelengths of light. Flame tests provide clues; similar colors may need another method to confirm an identity.": "Al calentar la muestra, sus átomos e iones se excitan. Cuando los electrones regresan a niveles de energía más bajos, emiten luz con longitudes de onda características. Las pruebas de llama dan pistas. Si dos colores se parecen, quizá necesites otro método para confirmar la identidad.",
  "This simulation uses separate, pure samples and idealized colors. Sodium contamination can mask other colors in a real lab. Follow your teacher’s safety instructions for physical experiments.": "Esta simulación usa muestras puras y separadas, y colores idealizados. En un laboratorio real, la contaminación con sodio puede ocultar otros colores. Sigue las instrucciones de seguridad de tu maestro o maestra en los experimentos reales."
}};
  i18n.configure(copy);
}());
