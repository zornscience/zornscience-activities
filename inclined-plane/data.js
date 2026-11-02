(function () {
  "use strict";
  // Inclined Plane & Friction: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="inclined-plane"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
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
  "Ideal dry friction · No data saved": "Fricción seca ideal · No se guardan datos"
}};
  i18n.configure(copy);
}());
