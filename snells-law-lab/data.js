(function () {
  "use strict";
  // Snell's Law & Refraction: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="snells-law-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  var copy = {title:"Snell’s Law & Refraction", es:{
  // Header, instructions and share
  "Snell’s Law & Refraction": "Ley de Snell y refracción",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share this optical bench. Each link opens a fresh simulation.": "Comparte este banco óptico. Cada enlace abre una simulación nueva.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Explore refraction and total internal reflection with a laser and optical blocks.": "Explora la refracción y la reflexión interna total con un láser y bloques ópticos.",
  "Follow the light": "El recorrido de la luz",
  "Start with the rectangular block.": "Empieza con el bloque rectangular.",
  "Drag the laser, or use the incidence slider, to aim at the center of the top face. Angles are measured from the dashed normal, perpendicular to the surface.": "Arrastra el láser, o usa el control deslizante de incidencia, para apuntar al centro de la cara superior. Los ángulos se miden desde la normal punteada, perpendicular a la superficie.",
  "Measure the bend.": "Mide la desviación.",
  "Drag the transparent protractor onto the point where the ray meets the block. It snaps into position with its zero line on the normal. The Snap to normal button does the same thing. Toggle angle labels to compare your measurements.": "Arrastra el transportador transparente al punto donde el rayo llega al bloque. Se acomoda en su lugar con la línea del cero sobre la normal. El botón Alinear con la normal hace lo mismo. Activa o desactiva las etiquetas de los ángulos para comparar tus mediciones.",
  "Change the materials.": "Cambia los materiales.",
  "Compare acrylic, glass, water and diamond, or choose a custom index. Watch both the entry and exit rays. Water represents a water-filled cell with ideal, optically negligible walls.": "Compara acrílico, vidrio, agua y diamante, o elige un índice personalizado. Observa el rayo de entrada y el de salida. El agua representa una celda llena de agua con paredes ideales y ópticamente despreciables.",
  "Find total internal reflection.": "Encuentra la reflexión interna total.",
  "Choose the semicircular block. The laser enters the curved face along a radius without bending and meets the flat face from inside. Select a block with a higher index than its surroundings and slowly increase the angle through the critical angle.": "Elige el bloque semicircular. El láser entra por la cara curva a lo largo de un radio sin desviarse y llega a la cara plana desde adentro. Selecciona un bloque con un índice mayor que el de su entorno y aumenta poco a poco el ángulo hasta pasar el ángulo crítico.",
  "Open {investigation} for short exploration prompts. Turn off {measurements} to use the protractor before revealing the calculated angles. Use {zoom} to read the protractor on a small screen. The dashed secondary ray is reflected light. Use {below} and {above} to compare the critical-angle boundary while keeping materials fixed.": "Abre {investigation} para ver indicaciones breves de exploración. Desactiva {measurements} para usar el transportador antes de mostrar los ángulos calculados. Usa {zoom} para leer el transportador en una pantalla pequeña. El rayo secundario punteado es luz reflejada. Usa {below} y {above} para comparar el límite del ángulo crítico sin cambiar los materiales.",
  "Try this:": "Prueba esto:",
  "Compare air → glass at 45° with glass → air at 45°. What happens to the transmitted beam?": "Compara aire → vidrio a 45° con vidrio → aire a 45°. ¿Qué le pasa al haz transmitido?",
  "Use the controls with a keyboard or drag the equipment with a mouse or touch. This simulation does not collect observations. In a real lab, never look into a laser beam or aim it toward anyone’s eyes.": "Usa los controles con el teclado o arrastra el equipo con el mouse o con el dedo. Esta simulación no recopila observaciones. En un laboratorio real, nunca mires directamente un haz láser ni lo apuntes hacia los ojos de nadie.",
  // Controls
  "Experiment controls": "Controles del experimento",
  "01 / THE APPARATUS": "01 / EL APARATO",
  "Block geometry": "Forma del bloque",
  "Rectangular block": "Bloque rectangular",
  "Refraction at two faces": "Refracción en dos caras",
  "Semicircular block": "Bloque semicircular",
  "Explore internal reflection": "Explora la reflexión interna",
  "02 / THE MATERIALS": "02 / LOS MATERIALES",
  "Optical block": "Bloque óptico",
  "Acrylic": "Acrílico",
  "Glass": "Vidrio",
  "Water": "Agua",
  "Diamond": "Diamante",
  "Air": "Aire",
  "Custom material": "Material personalizado",
  "Custom medium": "Medio personalizado",
  "Custom block index (1-3)": "Índice personalizado del bloque (1-3)",
  "Surrounding medium": "Medio que lo rodea",
  "Custom surrounding index (1-3)": "Índice personalizado del medio (1-3)",
  // Bench
  "LASER + OPTICAL BLOCK": "LÁSER + BLOQUE ÓPTICO",
  "The refraction bench": "El banco de refracción",
  "The internal reflection bench": "El banco de reflexión interna",
  "Laser on": "Láser encendido",
  "Laser off": "Láser apagado",
  "Try an investigation": "Prueba una investigación",
  "Investigation starting points": "Puntos de partida de las investigaciones",
  "1. Measure the bend": "1. Mide la desviación",
  "2. Compare materials": "2. Compara materiales",
  "3. Find the threshold": "3. Encuentra el umbral",
  "Choose a starting point, then explore freely. Predict what will happen before changing a control.": "Elige un punto de partida y luego explora libremente. Predice qué va a pasar antes de cambiar un control.",
  "Measure: which angle is smaller, θ₁ or θ₂? Read θ₂ from the normal with the protractor, then reveal measurements to check. What would you get if you measured from the surface instead?": "Mide: ¿qué ángulo es menor, θ₁ o θ₂? Lee θ₂ desde la normal con el transportador y luego muestra las mediciones para revisar. ¿Qué obtendrías si midieras desde la superficie?",
  "Predict: at the same incidence angle, will diamond bend light more or less than glass? Change only the block material and compare. Then match the two indices: does a visible boundary always bend light?": "Predice: con el mismo ángulo de incidencia, ¿el diamante desviará la luz más o menos que el vidrio? Cambia solo el material del bloque y compara. Luego iguala los dos índices: ¿una frontera visible siempre desvía la luz?",
  "Predict: as you increase the angle inside glass, what happens to the transmitted ray? Find the boundary, then reveal measurements and compare Just below with Just above. Would this happen from air into glass?": "Predice: al aumentar el ángulo dentro del vidrio, ¿qué le pasa al rayo transmitido? Encuentra el límite, luego muestra las mediciones y compara Justo por debajo con Justo por encima. ¿Pasaría esto del aire al vidrio?",
  "Change materials ↓": "Cambiar materiales ↓",
  "{from} → {to}": "{from} → {to}",
  "First flat surface: n₁ = {n1} (incident), n₂ = {n2} (other side)": "Primera superficie plana: n₁ = {n1} (incidente), n₂ = {n2} (otro lado)",
  "TOP VIEW / OPTICAL BREADBOARD": "VISTA SUPERIOR / MESA ÓPTICA",
  "RECTANGULAR BLOCK": "BLOQUE RECTANGULAR",
  "SEMICIRCULAR BLOCK": "BLOQUE SEMICIRCULAR",
  "Laser refraction apparatus": "Aparato de refracción con láser",
  "A laser aimed at a glass block on an optical breadboard.": "Un láser que apunta a un bloque de vidrio sobre una mesa óptica.",
  "Rectangular {block} block in {medium}. Incidence {angle} degrees. {result}": "Bloque rectangular de {block} en {medium}. Incidencia de {angle} grados. {result}",
  "Semicircular {block} block in {medium}. Incidence {angle} degrees. {result}": "Bloque semicircular de {block} en {medium}. Incidencia de {angle} grados. {result}",
  "Total internal reflection.": "Reflexión interna total.",
  "Refraction {angle} degrees.": "Refracción de {angle} grados.",
  "Use the protractor to measure refraction from the normal.": "Usa el transportador para medir la refracción desde la normal.",
  "Laser angle": "Ángulo del láser",
  "{angle} degrees from the normal": "{angle} grados desde la normal",
  "LASER": "LÁSER",
  "Virtual protractor: drag to the beam entry point, or press Enter to snap to normal": "Transportador virtual: arrástralo al punto de entrada del haz o presiona Enter para alinearlo con la normal",
  "VIRTUAL PROTRACTOR": "TRANSPORTADOR VIRTUAL",
  "ZORNSCIENCE / OPTICS": "ZORNSCIENCE / ÓPTICA",
  "Solid: incident & transmitted · Dashed: reflected · Arrows: light direction": "Continuo: incidente y transmitido · Punteado: reflejado · Flechas: dirección de la luz",
  "REFRACTION": "REFRACCIÓN",
  "TOTAL INTERNAL REFLECTION": "REFLEXIÓN INTERNA TOTAL",
  "AT THE CRITICAL ANGLE": "EN EL ÁNGULO CRÍTICO",
  "LASER OFF": "LÁSER APAGADO",
  "PROTRACTOR PARKED · DRAG TO THE ENTRY POINT": "TRANSPORTADOR GUARDADO · ARRÁSTRALO AL PUNTO DE ENTRADA",
  "PROTRACTOR SNAPPED · ZERO ALIGNED TO NORMAL": "TRANSPORTADOR ALINEADO · CERO SOBRE LA NORMAL",
  // Aiming and readings
  "AIM THE LASER · ANGLES FROM THE NORMAL": "APUNTA EL LÁSER · ÁNGULOS DESDE LA NORMAL",
  "Angle of incidence": "Ángulo de incidencia",
  "Set to critical angle": "Ir al ángulo crítico",
  "Explore the critical angle": "Explora el ángulo crítico",
  "Just below": "Justo por debajo",
  "Just above": "Justo por encima",
  "No critical angle in this direction: n₁ ≤ n₂.": "No hay ángulo crítico en esta dirección: n₁ ≤ n₂.",
  "Increase the angle slowly. Can you find when transmission stops?": "Aumenta el ángulo poco a poco. ¿Puedes encontrar cuándo deja de transmitirse la luz?",
  "Critical angle is above the 80° aiming range.": "El ángulo crítico está por encima del rango de 80° para apuntar.",
  "At {angle}°, the transmitted ray runs along the surface.": "A {angle}°, el rayo transmitido corre a lo largo de la superficie.",
  "Zoom to entry": "Acercar a la entrada",
  "Full bench": "Banco completo",
  "Snap to normal": "Alinear con la normal",
  "Protractor": "Transportador",
  "Angle guides": "Guías de ángulos",
  "Show measurements": "Mostrar mediciones",
  "Reset bench ↺": "Reiniciar banco ↺",
  "Measure first: center the protractor at the entry point and read from 0° on the dashed normal. Reveal measurements to check your reasoning.": "Mide primero: centra el transportador en el punto de entrada y lee desde 0° sobre la normal punteada. Muestra las mediciones para revisar tu razonamiento.",
  "Live ray measurements": "Mediciones del rayo en vivo",
  "INCIDENCE · θ₁": "INCIDENCIA · θ₁",
  "REFRACTION · θ₂": "REFRACCIÓN · θ₂",
  "CRITICAL ANGLE": "ÁNGULO CRÍTICO",
  "No transmitted ray": "No hay rayo transmitido",
  "Measure θ₂": "Mide θ₂",
  "None": "Ninguno",
  "Find θc": "Encuentra θc",
  "Connect the rays to Snell’s law": "Relaciona los rayos con la ley de Snell",
  "n is the refractive index: a larger n means a lower light speed (v = c/n). Angles use the normal, not the surface.": "n es el índice de refracción: una n mayor significa una menor rapidez de la luz (v = c/n). Los ángulos se miden desde la normal, no desde la superficie.",
  "Reveal measurements after using the protractor to see the numerical substitution.": "Muestra las mediciones después de usar el transportador para ver la sustitución numérica.",
  "Transmission would require sin θ₂ = {value} > 1. No real refracted angle exists: total internal reflection.": "La transmisión requeriría sin θ₂ = {value} > 1. No existe un ángulo refractado real: hay reflexión interna total.",
  "{n1} × sin({a1}°) = {n2} × sin({a2}°). Both sides ≈ {value} (using unrounded angles).": "{n1} × sin({a1}°) = {n2} × sin({a2}°). Ambos lados ≈ {value} (con ángulos sin redondear).",
  // Explanations
  "Beyond the critical angle, all light reflects back into the incident medium. No beam crosses the flat surface.": "Más allá del ángulo crítico, toda la luz se refleja de vuelta hacia el medio incidente. Ningún haz cruza la superficie plana.",
  "Matching indices: light crosses the boundary without bending.": "Índices iguales: la luz cruza la frontera sin desviarse.",
  "Along the normal, light changes speed but does not change direction.": "A lo largo de la normal, la luz cambia de rapidez pero no de dirección.",
  "At the critical angle, the transmitted ray grazes the surface. Increase the angle to see total internal reflection.": "En el ángulo crítico, el rayo transmitido roza la superficie. Aumenta el ángulo para ver la reflexión interna total.",
  "Light bends toward the normal as it enters the higher-index medium.": "La luz se acerca a la normal al entrar al medio de mayor índice.",
  "Light bends away from the normal as it enters the lower-index medium.": "La luz se aleja de la normal al entrar al medio de menor índice.",
  "Just below the critical angle, some light still transmits.": "Justo por debajo del ángulo crítico, todavía se transmite algo de luz.",
  "The curved face gives radial entry with no initial bend.": "La cara curva da una entrada radial sin desviación inicial.",
  "At the parallel exit face, the outgoing ray is parallel to the incoming ray.": "En la cara de salida paralela, el rayo saliente es paralelo al rayo entrante.",
  "The laser is off. Turn it on to trace the ray through the apparatus.": "El láser está apagado. Enciéndelo para seguir el rayo a través del aparato.",
  // Model note and footer
  "The physics behind the bench": "La física del banco",
  "Angles are measured from the normal at the first flat interface. Total internal reflection occurs only when n₁ > n₂ and θ₁ exceeds arcsin(n₂/n₁). At the critical angle, the refracted ray travels along the surface.": "Los ángulos se miden desde la normal en la primera interfaz plana. La reflexión interna total ocurre solo cuando n₁ > n₂ y θ₁ es mayor que arcsin(n₂/n₁). En el ángulo crítico, el rayo refractado viaja a lo largo de la superficie.",
  "The rectangular block traces the primary ray through each face, including side exits and internal reflections. A faint ray shows reflection at the first interface. The semicircular block uses radial entry so its curved face does not change the incidence angle at the flat face. Water is an ideal water cell; the same geometry is used for the virtual diamond block.": "El bloque rectangular sigue el rayo principal a través de cada cara, incluidas las salidas laterales y las reflexiones internas. Un rayo tenue muestra la reflexión en la primera interfaz. El bloque semicircular usa entrada radial, así que su cara curva no cambia el ángulo de incidencia en la cara plana. El agua es una celda de agua ideal; la misma forma se usa para el bloque virtual de diamante.",
  "Indices are approximate values for red light: air 1.000, water 1.333, acrylic 1.490, glass 1.500, diamond 2.417. The model uses uniform, lossless, isotropic materials and a fixed 650 nm laser. Beam width, brightness and equipment proportions are illustrative; secondary reflections, dispersion and evanescent fields are omitted. Arrowheads indicate propagation direction. The dashed secondary ray is reflected light; the solid outgoing ray is transmitted light. At the critical angle the surface ray shows the limiting direction, not transmitted power.": "Los índices son valores aproximados para luz roja: aire 1.000, agua 1.333, acrílico 1.490, vidrio 1.500, diamante 2.417. El modelo usa materiales uniformes, sin pérdidas e isótropos, y un láser fijo de 650 nm. El ancho del haz, el brillo y las proporciones del equipo son ilustrativos; se omiten las reflexiones secundarias, la dispersión y los campos evanescentes. Las puntas de flecha indican la dirección de propagación. El rayo secundario punteado es luz reflejada; el rayo saliente continuo es luz transmitida. En el ángulo crítico, el rayo sobre la superficie muestra la dirección límite, no la potencia transmitida.",
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
  "Air into glass": "Del aire al vidrio",
  "Set up the lab. The laser enters the glass block at {angle}. What does the Refraction θ₂ readout show?": "Prepara el laboratorio. El láser entra al bloque de vidrio a {angle}. ¿Qué indica la lectura Refracción θ₂?",
  "Light does bend when it goes from air into glass, because glass has a higher index. Read the Refraction θ₂ readout.": "La luz sí se desvía al pasar del aire al vidrio, porque el vidrio tiene un índice mayor. Lee la lectura Refracción θ₂.",
  "That angle is measured from the surface. Snell's law uses the angle from the dashed normal. Check where the zero line of the protractor sits.": "Ese ángulo se mide desde la superficie. La ley de Snell usa el ángulo desde la normal punteada. Revisa dónde queda la línea de cero del transportador.",
  "Snell's law uses the sines of the angles, not the angles themselves. Dividing {angle} by the index does not work.": "La ley de Snell usa los senos de los ángulos, no los ángulos mismos. Dividir {angle} entre el índice no funciona.",
  "Light slows down in glass (n = {n2}) and bends toward the normal. {n1} × sin {angle} = {n2} × sin θ₂ gives θ₂ = {refraction}, smaller than the incidence angle.": "La luz se frena en el vidrio (n = {n2}) y se desvía hacia la normal. {n1} × sen {angle} = {n2} × sen θ₂ da θ₂ = {refraction}, menor que el ángulo de incidencia.",
  // Lab check, question 2
  "Diamond bends the most": "El diamante desvía más",
  "Set up the lab with the diamond block. What does the Refraction θ₂ readout show?": "Prepara el laboratorio con el bloque de diamante. ¿Qué indica la lectura Refracción θ₂?",
  "That is the angle for a glass block at {angle}. Check that the Optical block menu says Diamond.": "Ese es el ángulo para un bloque de vidrio a {angle}. Revisa que el menú Bloque óptico diga Diamante.",
  "Snell's law uses the sines of the angles, not the angles themselves. Dividing {angle} by the index only comes close by luck.": "La ley de Snell usa los senos de los ángulos, no los ángulos mismos. Dividir {angle} entre el índice solo se acerca por casualidad.",
  "Diamond has a very high index, so it bends light a lot. Read the Refraction θ₂ readout.": "El diamante tiene un índice muy alto, así que desvía mucho la luz. Lee la lectura Refracción θ₂.",
  "Diamond has n = {n2}, so light travels slowest in it (v = c / n = {v}) and bends the most. {n1} × sin {angle} = {n2} × sin θ₂ gives θ₂ = {refraction}, compared with {glass} for glass.": "El diamante tiene n = {n2}, así que la luz viaja más despacio en él (v = c / n = {v}) y se desvía más. {n1} × sen {angle} = {n2} × sen θ₂ da θ₂ = {refraction}, frente a {glass} en el vidrio.",
  // Lab check, question 3
  "Matching indices": "Índices iguales",
  "Set up the lab. The glass block sits in glass surroundings. What does the Refraction θ₂ readout show?": "Prepara el laboratorio. El bloque de vidrio está rodeado de vidrio. ¿Qué indica la lectura Refracción θ₂?",
  "That is the angle for air into glass. Here the block and its surroundings are both glass. Check the Surrounding medium menu.": "Ese es el ángulo del aire al vidrio. Aquí el bloque y lo que lo rodea son los dos de vidrio. Revisa el menú Medio que lo rodea.",
  "A beam along the normal goes straight through, but this beam is not along the normal. Compare the two indices at the boundary, then read the Refraction θ₂ readout.": "Un haz a lo largo de la normal pasa derecho, pero este haz no va a lo largo de la normal. Compara los dos índices en la frontera y luego lee la lectura Refracción θ₂.",
  "Do not halve the angle. Snell's law uses sines: n₁ sin θ₁ = n₂ sin θ₂.": "No dividas el ángulo a la mitad. La ley de Snell usa senos: n₁ sen θ₁ = n₂ sen θ₂.",
  "The block and its surroundings are both glass, so n₁ = n₂ = {n1}, and sin θ₂ = sin θ₁. The beam does not bend: θ₂ = {refraction}. Light changes direction only when its speed changes at a boundary.": "El bloque y lo que lo rodea son los dos de vidrio, así que n₁ = n₂ = {n1} y sen θ₂ = sen θ₁. El haz no se desvía: θ₂ = {refraction}. La luz cambia de dirección solo cuando su rapidez cambia en una frontera.",
  // Lab check, question 4
  "Critical angle, glass to air": "Ángulo crítico, del vidrio al aire",
  "Set up the lab with the semicircular glass block. Which value does the Critical angle readout show?": "Prepara el laboratorio con el bloque semicircular de vidrio. ¿Qué valor indica la lectura Ángulo crítico?",
  "That is the Refraction θ₂ readout at {angle}. The question asks for the Critical angle readout.": "Esa es la lectura Refracción θ₂ a {angle}. La pregunta pide la lectura Ángulo crítico.",
  "The critical angle is not 90° minus the angle. Use sin θc = n₂ / n₁.": "El ángulo crítico no es 90° menos el ángulo. Usa sen θc = n₂ / n₁.",
  "sin θc = n₂ / n₁ = {n2} / {n1}. Take the inverse sine, not the inverse tangent.": "sen θc = n₂ / n₁ = {n2} / {n1}. Usa el seno inverso, no la tangente inversa.",
  "sin θc = n₂ / n₁ = {n2} / {n1}, so θc = {critical}. At {angle} the beam still leaves the glass, at {refraction}, bending away from the normal. Past {critical} all of the light reflects.": "sen θc = n₂ / n₁ = {n2} / {n1}, así que θc = {critical}. A {angle} el haz todavía sale del vidrio, a {refraction}, desviándose lejos de la normal. Después de {critical} toda la luz se refleja.",
  // Lab check, question 5
  "Glass in water": "Vidrio en agua",
  "Set up the lab. The glass is now surrounded by water, and the laser is at {angle}. What does the Refraction θ₂ readout show?": "Prepara el laboratorio. Ahora el vidrio está rodeado de agua y el láser está a {angle}. ¿Qué indica la lectura Refracción θ₂?",
  "That is the critical angle for glass to water, read from the other readout. The laser is at {angle}, which is past it.": "Ese es el ángulo crítico del vidrio al agua, leído en la otra lectura. El láser está a {angle}, que ya lo pasó.",
  "The ray runs along the surface only at exactly the critical angle. Past it, no ray crosses.": "El rayo corre a lo largo de la superficie solo en el ángulo crítico exacto. Después de él, ningún rayo cruza.",
  "That is the critical angle for glass to air. Water's index is closer to glass, so this critical angle is larger.": "Ese es el ángulo crítico del vidrio al aire. El índice del agua está más cerca del del vidrio, así que este ángulo crítico es mayor.",
  "From glass (n₁ = {n1}) into water (n₂ = {n2}), sin θc = {n2} / {n1}, so θc = {critical}. The laser at {angle} is past it, so all the light reflects. Glass to air has a smaller critical angle, {airCritical}, because air's index is further from glass.": "Del vidrio (n₁ = {n1}) al agua (n₂ = {n2}), sen θc = {n2} / {n1}, así que θc = {critical}. El láser a {angle} ya lo pasó, así que toda la luz se refleja. Del vidrio al aire el ángulo crítico es menor, {airCritical}, porque el índice del aire está más lejos del del vidrio."
}};
  if (i18n) i18n.configure(copy);
  // Lab check (labcheck.js and ../shared/zsa-labcheck.js). Each choice is [value, label, feedback key]; the right
  // choice has a null key. Every number in braces is filled in by labcheck.js from the lab's own physics (physics.js
  // interfaceRay and its indices), so no answer is written here. setup is the starting state: mode (slab, the
  // Rectangular block, or tir, the Semicircular block), block and surrounding (the Optical block and Surrounding
  // medium option values) and angle (the angle of incidence in degrees). The wrong choices are the slips named in the
  // feedback: the angle from the surface, dividing the angle by the index, the wrong block, or the wrong readout.
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
      {id: "bend", title: "Air into glass", setup: {mode: "slab", block: "glass", surrounding: "air", angle: 45},
        question: "Set up the lab. The laser enters the glass block at {angle}. What does the Refraction θ₂ readout show?",
        choices: [["right", "{refraction}", null], ["same", "{angle}", "same"], ["surface", "{surface}", "surface"], ["divide", "{divide}", "divide"]],
        feedback: {
          same: "Light does bend when it goes from air into glass, because glass has a higher index. Read the Refraction θ₂ readout.",
          surface: "That angle is measured from the surface. Snell's law uses the angle from the dashed normal. Check where the zero line of the protractor sits.",
          divide: "Snell's law uses the sines of the angles, not the angles themselves. Dividing {angle} by the index does not work."
        },
        explanation: "Light slows down in glass (n = {n2}) and bends toward the normal. {n1} × sin {angle} = {n2} × sin θ₂ gives θ₂ = {refraction}, smaller than the incidence angle."},
      {id: "diamond", title: "Diamond bends the most", setup: {mode: "slab", block: "diamond", surrounding: "air", angle: 40},
        question: "Set up the lab with the diamond block. What does the Refraction θ₂ readout show?",
        choices: [["right", "{refraction}", null], ["glass", "{glass}", "glass"], ["divide", "{divide}", "divide"], ["same", "{angle}", "same"]],
        feedback: {
          glass: "That is the angle for a glass block at {angle}. Check that the Optical block menu says Diamond.",
          divide: "Snell's law uses the sines of the angles, not the angles themselves. Dividing {angle} by the index only comes close by luck.",
          same: "Diamond has a very high index, so it bends light a lot. Read the Refraction θ₂ readout."
        },
        explanation: "Diamond has n = {n2}, so light travels slowest in it (v = c / n = {v}) and bends the most. {n1} × sin {angle} = {n2} × sin θ₂ gives θ₂ = {refraction}, compared with {glass} for glass."},
      {id: "match", title: "Matching indices", setup: {mode: "slab", block: "glass", surrounding: "glass", angle: 45},
        question: "Set up the lab. The glass block sits in glass surroundings. What does the Refraction θ₂ readout show?",
        choices: [["right", "{refraction}", null], ["bends", "{glass}", "bends"], ["zero", "0.0°", "zero"], ["half", "22.5°", "half"]],
        feedback: {
          bends: "That is the angle for air into glass. Here the block and its surroundings are both glass. Check the Surrounding medium menu.",
          zero: "A beam along the normal goes straight through, but this beam is not along the normal. Compare the two indices at the boundary, then read the Refraction θ₂ readout.",
          half: "Do not halve the angle. Snell's law uses sines: n₁ sin θ₁ = n₂ sin θ₂."
        },
        explanation: "The block and its surroundings are both glass, so n₁ = n₂ = {n1}, and sin θ₂ = sin θ₁. The beam does not bend: θ₂ = {refraction}. Light changes direction only when its speed changes at a boundary."},
      {id: "critical", title: "Critical angle, glass to air", setup: {mode: "tir", block: "glass", surrounding: "air", angle: 30},
        question: "Set up the lab with the semicircular glass block. Which value does the Critical angle readout show?",
        choices: [["right", "{critical}", null], ["refraction", "{refraction}", "refraction"], ["complement", "{complement}", "complement"], ["atan", "{atan}", "atan"]],
        feedback: {
          refraction: "That is the Refraction θ₂ readout at {angle}. The question asks for the Critical angle readout.",
          complement: "The critical angle is not 90° minus the angle. Use sin θc = n₂ / n₁.",
          atan: "sin θc = n₂ / n₁ = {n2} / {n1}. Take the inverse sine, not the inverse tangent."
        },
        explanation: "sin θc = n₂ / n₁ = {n2} / {n1}, so θc = {critical}. At {angle} the beam still leaves the glass, at {refraction}, bending away from the normal. Past {critical} all of the light reflects."},
      {id: "water", title: "Glass in water", setup: {mode: "tir", block: "glass", surrounding: "water", angle: 70},
        question: "Set up the lab. The glass is now surrounded by water, and the laser is at {angle}. What does the Refraction θ₂ readout show?",
        choices: [["right", "{refraction}", null], ["critical", "{critical}", "critical"], ["grazing", "90.0°", "grazing"], ["airCritical", "{airCritical}", "airCritical"]],
        feedback: {
          critical: "That is the critical angle for glass to water, read from the other readout. The laser is at {angle}, which is past it.",
          grazing: "The ray runs along the surface only at exactly the critical angle. Past it, no ray crosses.",
          airCritical: "That is the critical angle for glass to air. Water's index is closer to glass, so this critical angle is larger."
        },
        explanation: "From glass (n₁ = {n1}) into water (n₂ = {n2}), sin θc = {n2} / {n1}, so θc = {critical}. The laser at {angle} is past it, so all the light reflects. Glass to air has a smaller critical angle, {airCritical}, because air's index is further from glass."}
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
  if (!i18n || i18n.lang !== "es") return;
  // The instructions paragraph after the list holds five bold control names inside its sentences. Rebuild it from one
  // full template around those names, so Spanish keeps its own word order.
  var note = root.querySelector("#zsa-th-instructions ol + p"), bold = note ? note.querySelectorAll("strong") : [];
  if (bold.length === 5) {
    var keys = ["investigation", "measurements", "zoom", "below", "above"], nodes = [];
    i18n.text("Open {investigation} for short exploration prompts. Turn off {measurements} to use the protractor before revealing the calculated angles. Use {zoom} to read the protractor on a small screen. The dashed secondary ray is reflected light. Use {below} and {above} to compare the critical-angle boundary while keeping materials fixed.")
      .split(/\{(\w+)\}/).forEach(function (part, i) {
        if (i % 2) nodes.push(bold[keys.indexOf(part)]);
        else if (part) nodes.push(document.createTextNode(part));
      });
    note.replaceChildren.apply(note, nodes);
  }
}());
