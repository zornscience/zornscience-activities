(function () {
  "use strict";
  // Faraday's Law · Magnet Drop: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, equations, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="faraday-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Faraday’s Law · Magnet Drop", es:{
  // Header, instructions and share
  "Faraday’s Law · Magnet Drop": "Ley de Faraday · Caída del imán",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share a fresh lab. Each link opens a fresh bench.": "Comparte el laboratorio desde cero. Cada enlace abre una mesa de trabajo nueva.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Drop a magnet through copper and reveal electromagnetic induction.": "Deja caer un imán por un tubo de cobre y descubre la inducción electromagnética.",
  "Explore the magnet drop": "Exploración de la caída del imán",
  "Your goal:": "Tu objetivo:",
  "{label} explain how changing magnetic flux creates a current and why that current slows a falling magnet.": "{label} explicar cómo un flujo magnético que cambia crea una corriente y por qué esa corriente frena a un imán que cae.",
  "Predict which magnet will arrive first. Select an intact copper, slotted copper, or plastic tube.": "Predice qué imán llegará primero. Elige un tubo de cobre intacto, uno de cobre con ranura o uno de plástico.",
  "Press {button}. An identical magnet drops freely beside the tube for comparison.": "Presiona {button}. Un imán idéntico cae libremente junto al tubo para comparar.",
  "Choose {button} to reveal eddy currents, induced fields and a fixed ring in the tube wall. Watch what changes as the magnet approaches and leaves that ring.": "Elige {button} para mostrar las corrientes parásitas, los campos inducidos y un anillo fijo en la pared del tubo. Observa qué cambia cuando el imán se acerca a ese anillo y cuando se aleja de él.",
  "Drag {button} to pause at any instant, or use slow motion to inspect the current loops above and below the moving magnet. Reverse the poles and repeat: the currents reverse, but the braking still points upward.": "Arrastra {button} para pausar en cualquier instante, o usa la cámara lenta para examinar las espiras de corriente arriba y abajo del imán en movimiento. Invierte los polos y repite: las corrientes se invierten, pero el frenado sigue apuntando hacia arriba.",
  "Copper is not ferromagnetic. Changing magnetic flux drives circulating currents; their magnetic fields oppose the change (Lenz’s law). A lengthwise slot interrupts the large current loops.": "El cobre no es ferromagnético. Un flujo magnético que cambia impulsa corrientes circulantes; sus campos magnéticos se oponen al cambio (ley de Lenz). Una ranura a lo largo del tubo interrumpe las espiras de corriente grandes.",
  "In a real lab, secure the tube and use a soft catch tray. Strong neodymium magnets can pinch fingers and damage electronics.": "En un laboratorio real, sujeta bien el tubo y usa una charola suave para atrapar el imán. Los imanes de neodimio fuertes pueden pellizcar los dedos y dañar aparatos electrónicos.",
  // Controls
  "Apparatus": "Aparato",
  "Tube material": "Material del tubo",
  "Copper · intact": "Cobre · intacto",
  "Copper · lengthwise slot": "Cobre · ranura a lo largo",
  "Plastic · insulating": "Plástico · aislante",
  "Closed conducting loops allow strong eddy currents.": "Las espiras conductoras cerradas permiten corrientes parásitas intensas.",
  "A lengthwise slot interrupts the large current loops.": "Una ranura a lo largo del tubo interrumpe las espiras de corriente grandes.",
  "An insulator cannot carry eddy currents.": "Un aislante no puede conducir corrientes parásitas.",
  "Magnet strength": "Intensidad del imán",
  "Reverse poles · N down": "Invertir polos · N abajo",
  "Reverse poles · {pole} down": "Invertir polos · {pole} abajo",
  "See the invisible": "Visualización de lo invisible",
  "Tube cutaway": "Corte del tubo",
  "A virtual window only. The tube still has a complete conducting wall.": "Es solo una ventana virtual. El tubo conserva su pared conductora completa.",
  "Eddy currents": "Corrientes parásitas",
  "Induced fields": "Campos inducidos",
  "Force arrows": "Flechas de fuerza",
  "Arrows show conventional current. Field arrows show the tube’s induced field, not the magnet’s own field.": "Las flechas muestran la corriente convencional. Las flechas de campo muestran el campo inducido del tubo, no el campo propio del imán.",
  // Bench
  "Magnet drop": "Caída del imán",
  "LENZ’S LAW IN ACTION": "LA LEY DE LENZ EN ACCIÓN",
  "Visualization presets": "Vistas predefinidas",
  "Observe": "Observar",
  "Explain": "Explicar",
  "NEODYMIUM MAGNET / 1 m TUBE": "IMÁN DE NEODIMIO / TUBO DE 1 m",
  "VIRTUAL LAB BENCH": "MESA DE LABORATORIO VIRTUAL",
  "A copper tube on a retort stand and an identical magnet falling freely beside it. Cyan loops show eddy currents above and below the magnet; gold arrows show the induced magnetic field.": "Un tubo de cobre en un soporte universal y un imán idéntico que cae libremente junto a él. Las espiras cian muestran las corrientes parásitas arriba y abajo del imán; las flechas doradas muestran el campo magnético inducido.",
  "READY TO RELEASE": "LISTO PARA SOLTAR",
  "MAGNETS FALLING": "IMANES EN CAÍDA",
  "PAUSED · SIMULATED TIME FROZEN": "EN PAUSA · TIEMPO SIMULADO DETENIDO",
  "BOTH MAGNETS CAUGHT": "AMBOS IMANES ATRAPADOS",
  "REAL TIME": "TIEMPO REAL",
  "¼ SPEED": "¼ DEL TIEMPO REAL",
  "Release magnets": "Soltar los imanes",
  "Release again": "Soltar de nuevo",
  "Pause": "Pausar",
  "Resume": "Reanudar",
  "Reset": "Reiniciar",
  "Slow motion · ¼ speed": "Cámara lenta · ¼ del tiempo real",
  "Inspect the drop": "Revisar la caída",
  "Ready": "Lista",
  "Release first. Then drag to pause at any instant; Resume continues from there.": "Primero suelta los imanes. Luego arrastra para pausar en cualquier instante; Reanudar continúa desde ahí.",
  "Release magnets first": "Primero suelta los imanes",
  "{t} seconds into the drop": "{t} segundos desde el inicio de la caída",
  // Canvas labels
  "SLOT": "RANURA",
  "FIXED RING": "ANILLO FIJO",
  "weight": "peso",
  "braking": "frenado",
  "PLASTIC TUBE": "TUBO DE PLÁSTICO",
  "SLOTTED COPPER": "COBRE CON RANURA",
  "COPPER TUBE": "TUBO DE COBRE",
  "IDENTICAL MAGNET": "IMÁN IDÉNTICO",
  "Held in two retort clamps": "Sujeto con dos pinzas al soporte",
  "Free-fall comparison": "Comparación en caída libre",
  "SOFT CATCH TRAYS": "CHAROLAS SUAVES PARA ATRAPAR",
  "Eddy current": "Corriente parásita",
  "Induced field": "Campo inducido",
  // The fixed ring
  "At the fixed copper ring": "En el anillo fijo de cobre",
  "At the fixed plastic ring": "En el anillo fijo de plástico",
  "The magnet is held still. Flux is present, but it is not changing: no induced current.": "El imán se mantiene quieto. Hay flujo, pero no está cambiando: no hay corriente inducida.",
  "The dashed ring marks one fixed slice of the wall. Cyan arrows are conventional current, viewed from above. Gold arrows show the induced field.": "El anillo punteado marca una sección fija de la pared. Las flechas cian son la corriente convencional, vista desde arriba. Las flechas doradas muestran el campo inducido.",
  "The magnet is held still. No changing flux through the ring, so there is no induced current.": "El imán se mantiene quieto. El flujo a través del anillo no cambia, así que no hay corriente inducida.",
  "The magnet is in the catch tray. No changing flux through the ring, so there is no induced current.": "El imán está en la charola. El flujo a través del anillo no cambia, así que no hay corriente inducida.",
  "Flux changes as the magnet passes, but plastic is an insulator: no eddy current or induced field from the tube.": "El flujo cambia cuando pasa el imán, pero el plástico es aislante: el tubo no tiene corriente parásita ni campo inducido.",
  "The changing flux can drive small local currents, but the slot interrupts a complete current loop around this ring. Braking is much weaker.": "El flujo que cambia puede impulsar pequeñas corrientes locales, pero la ranura interrumpe una espira de corriente completa alrededor de este anillo. El frenado es mucho más débil.",
  "At the ring: flux is near its maximum. Its rate of change passes through zero, and the current reverses as the magnet passes.": "En el anillo: el flujo está cerca de su máximo. Su razón de cambio pasa por cero y la corriente se invierte cuando pasa el imán.",
  "Approaching the ring: flux is increasing.": "El imán se acerca al anillo: el flujo aumenta.",
  "Leaving the ring: flux is decreasing.": "El imán se aleja del anillo: el flujo disminuye.",
  "Flux changes, but plastic is an insulator: no eddy current.": "El flujo cambia, pero el plástico es aislante: no hay corriente parásita.",
  "The induced field points down; conventional current is clockwise viewed from above.": "El campo inducido apunta hacia abajo; la corriente convencional va en el sentido de las manecillas del reloj, vista desde arriba.",
  "The induced field points up; conventional current is counterclockwise viewed from above.": "El campo inducido apunta hacia arriba; la corriente convencional va en sentido contrario al de las manecillas del reloj, vista desde arriba.",
  "The slot prevents a complete current loop; local currents are much weaker.": "La ranura impide una espira de corriente completa; las corrientes locales son mucho más débiles.",
  // Observations
  "OBSERVE & EXPLAIN": "OBSERVA Y EXPLICA",
  "Two identical magnets, one release height. Release them together and compare their motion.": "Dos imanes idénticos, una misma altura inicial. Suéltalos juntos y compara su movimiento.",
  "Predict first: which magnet will arrive first? Both magnets have the same mass and release height. Only one passes through the tube.": "Primero predice: ¿qué imán llegará primero? Los dos imanes tienen la misma masa y la misma altura inicial. Solo uno pasa por el tubo.",
  "Plastic cannot sustain eddy currents. Both magnets fell together under gravity. A magnetic field alone does not create a braking force.": "El plástico no puede mantener corrientes parásitas. Los dos imanes cayeron juntos por la gravedad. Un campo magnético por sí solo no crea una fuerza de frenado.",
  "The insulating plastic carries no eddy currents. Both magnets accelerate together under gravity.": "El plástico aislante no conduce corrientes parásitas. Los dos imanes aceleran juntos por la gravedad.",
  "The slot interrupts the large circular current paths. Small local currents can remain, so the braking is weak. Compare with intact copper at the same magnet strength.": "La ranura interrumpe las trayectorias circulares grandes de la corriente. Pueden quedar pequeñas corrientes locales, así que el frenado es débil. Compara con el cobre intacto con la misma intensidad del imán.",
  "The copper magnet arrived later. Its gravitational energy transferred into thermal energy in the tube. Copper is not ferromagnetic: changing flux and circulating currents caused the braking.": "El imán del tubo de cobre llegó después. Su energía gravitacional se transformó en energía térmica en el tubo. El cobre no es ferromagnético: el flujo que cambia y las corrientes circulantes causaron el frenado.",
  "Time is frozen for inspection. The currents shown belong to this instant of the falling motion. A magnet actually held still would induce no sustained eddy current.": "El tiempo está detenido para que lo examines. Las corrientes que se muestran corresponden a este instante de la caída. Un imán que de verdad estuviera quieto no induciría una corriente parásita sostenida.",
  "Inside copper, upward magnetic braking nearly balances downward weight. The magnet keeps moving at nearly constant terminal speed; balanced forces do not mean it stops.": "Dentro del cobre, el frenado magnético hacia arriba casi equilibra el peso hacia abajo. El imán sigue moviéndose con una rapidez terminal casi constante; que las fuerzas estén equilibradas no significa que se detenga.",
  "As the magnet enters or leaves the copper, the changing flux drives currents. Their fields oppose the change and the resulting force opposes the fall.": "Cuando el imán entra al cobre o sale de él, el flujo que cambia impulsa corrientes. Sus campos se oponen al cambio y la fuerza que producen se opone a la caída.",
  // Exploration prompts
  "TRY ONE CHANGE": "PRUEBA UN CAMBIO",
  "Exploration prompts": "Sugerencias para explorar",
  "Break the current loop": "Romper la espira de corriente",
  "Reverse the poles": "Invertir los polos",
  "Predict first: will the magnet in copper fall faster, slower, or at the same rate as the free magnet?": "Primero predice: ¿el imán en el cobre caerá más rápido, más lento o al mismo ritmo que el imán libre?",
  "Predict: how will this tube compare with free fall? Keep magnet strength fixed while comparing materials.": "Predice: ¿cómo se comparará este tubo con la caída libre? No cambies la intensidad del imán mientras comparas materiales.",
  "Predict: will breaking the circular path change the fall? Release again, then compare with intact copper using the same magnet strength.": "Predice: ¿romper la trayectoria circular cambiará la caída? Suelta de nuevo y luego compara con el cobre intacto con la misma intensidad del imán.",
  "Predict: will reversing the poles reverse the braking force? Use Explain and compare current directions before and after the flip, keeping the material and strength unchanged.": "Predice: ¿invertir los polos invertirá la fuerza de frenado? Usa Explicar y compara el sentido de las corrientes antes y después del cambio, sin cambiar el material ni la intensidad.",
  // Model note and footer
  "How the model works": "Funcionamiento del modelo",
  "Faraday’s law: ε = −dΦB/dt. A falling magnet changes magnetic flux through conducting loops in the tube. Above the magnet, the induced field tends to maintain the decreasing flux; below it, the induced field opposes the increasing flux. Both effects produce an upward force on the falling magnet. Gravitational potential energy becomes thermal energy in the copper.": "Ley de Faraday: ε = −dΦB/dt. Un imán que cae cambia el flujo magnético a través de las espiras conductoras del tubo. Arriba del imán, el campo inducido tiende a mantener el flujo que disminuye; abajo, el campo inducido se opone al flujo que aumenta. Los dos efectos producen una fuerza hacia arriba sobre el imán que cae. La energía potencial gravitacional se convierte en energía térmica en el cobre.",
  "This qualitative model integrates gravity and a speed-dependent magnetic drag, F = −kv, with k proportional to magnet strength squared. Inside the tube, drag can balance weight and produce terminal speed. Slotted copper has much weaker residual braking; plastic and the free-fall comparison have none. Entry and exit effects are smoothed. Air resistance is omitted. The replay slider reconstructs the same drop at the selected time. Pausing freezes simulated time; visible currents in a paused frame represent that instant of motion, not a physically held magnet. Current loops, fields, poles, force arrows, tube wall thickness and magnet size are enlarged or simplified; the cutaway is a visualization and does not physically cut the tube. Strength changes magnetic moment only, with mass fixed. Values illustrate behavior rather than predict a particular commercial magnet.": "Este modelo cualitativo integra la gravedad y un arrastre magnético que depende de la rapidez, F = −kv, con k proporcional al cuadrado de la intensidad del imán. Dentro del tubo, el arrastre puede equilibrar el peso y producir una rapidez terminal. El cobre con ranura tiene un frenado residual mucho más débil; el plástico y la comparación en caída libre no tienen frenado. Los efectos de entrada y salida están suavizados. Se omite la resistencia del aire. El control de revisión reconstruye la misma caída en el tiempo elegido. Pausar detiene el tiempo simulado; las corrientes visibles en un cuadro en pausa representan ese instante del movimiento, no un imán sostenido físicamente. Las espiras de corriente, los campos, los polos, las flechas de fuerza, el grosor de la pared del tubo y el tamaño del imán están agrandados o simplificados; el corte es una visualización y no corta el tubo físicamente. La intensidad cambia solo el momento magnético, con la masa fija. Los valores ilustran el comportamiento y no predicen un imán comercial en particular.",
  "ZornScience · Explore. Observe. Explain.": "ZornScience · Explora. Observa. Explica.",
  "Virtual lab · No data entry or saving": "Laboratorio virtual · Sin captura ni guardado de datos"
}};
  // Paragraphs with a bold label or button name are one full template each, read before the static text is translated,
  // so Spanish keeps its own word order around the bold words.
  var rebuilt = [
    {el:root.querySelector("#zsa-th-instructions > p:first-of-type"), key:"label", template:"{label} explain how changing magnetic flux creates a current and why that current slows a falling magnet."},
    {el:root.querySelector("#zsa-th-instructions li:nth-child(2)"), key:"button", template:"Press {button}. An identical magnet drops freely beside the tube for comparison."},
    {el:root.querySelector("#zsa-th-instructions li:nth-child(3)"), key:"button", template:"Choose {button} to reveal eddy currents, induced fields and a fixed ring in the tube wall. Watch what changes as the magnet approaches and leaves that ring."},
    {el:root.querySelector("#zsa-th-instructions li:nth-child(4)"), key:"button", template:"Drag {button} to pause at any instant, or use slow motion to inspect the current loops above and below the moving magnet. Reverse the poles and repeat: the currents reverse, but the braking still points upward."}
  ];
  i18n.configure(copy);
  if (i18n.lang !== "es") return;
  rebuilt.forEach(function (item) {
    var strong = item.el && item.el.querySelector("strong");
    if (!strong) return;
    var parts = i18n.text(item.template).split("{" + item.key + "}");
    item.el.replaceChildren(document.createTextNode(parts[0]), strong, document.createTextNode(parts[1] || ""));
  });
}());
