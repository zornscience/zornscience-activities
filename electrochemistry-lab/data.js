(function () {
  "use strict";
  // Electrochemistry Cell Builder: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Formulas, symbols, charges, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="electrochemistry-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Electrochemistry Cell Builder", es:{
  // Header, instructions and share
  "Electrochemistry Cell Builder": "Constructor de celdas electroquímicas",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share a fresh lab. Your cell setup and answers are not included.": "Comparte el laboratorio desde cero. No se incluyen el montaje de tu celda ni tus respuestas.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link, email, or one of the social links instead.": "Usa Copiar enlace, el correo electrónico o una de las redes sociales.",
  "Build galvanic and electrolytic cells and explore electron flow with ZornScience.": "Arma celdas galvánicas y electrolíticas y explora el flujo de electrones con ZornScience.",
  "How to build your cell": "Guía para armar tu celda",
  "Explore how electrode choice controls energy and electron transfer. A zinc/copper cell is ready to run when you open the lab.": "Explora cómo la elección de los electrodos controla la energía y la transferencia de electrones. Al abrir el laboratorio, una celda de zinc/cobre ya está lista para funcionar.",
  "Observe one event.": "Observa un evento.",
  "Press Step once. Notice which electrode loses atoms and which gains them. Oxidation is always at the anode; reduction is always at the cathode.": "Presiona Avanzar un paso. Fíjate qué electrodo pierde átomos y cuál los gana. La oxidación siempre ocurre en el ánodo; la reducción siempre ocurre en el cátodo.",
  "Compare one change at a time.": "Compara un cambio a la vez.",
  "Choose zinc/silver, or swap left and right. Does moving a metal change its role or E°? Use the calculation drawer to connect the voltage to standard reduction potentials.": "Elige zinc/plata, o intercambia izquierda y derecha. ¿Mover un metal cambia su papel o su E°? Usa la sección del cálculo para relacionar el voltaje con los potenciales estándar de reducción.",
  "Reverse the reaction.": "Invierte la reacción.",
  "Choose electrolytic mode. The cell potential becomes negative, and the applied supply must exceed its magnitude. Anode and cathode signs reverse; their oxidation/reduction definitions do not.": "Elige el modo electrolítico. El potencial de celda se vuelve negativo, y el voltaje aplicado por la fuente debe superar su magnitud. Los signos del ánodo y del cátodo se invierten; sus definiciones de oxidación/reducción no cambian.",
  "Test the circuit.": "Pon a prueba el circuito.",
  "Disconnect the salt bridge. Why does sustained electron flow stop? Reconnect it and follow K⁺ toward the cathode and NO₃⁻ toward the anode.": "Desconecta el puente salino. ¿Por qué se detiene el flujo continuo de electrones? Vuelve a conectarlo y sigue al K⁺ hacia el cátodo y al NO₃⁻ hacia el ánodo.",
  "Build your own.": "Arma tu propia celda.",
  "Select a metal and tap its Place button, or drag it to a beaker. Match each electrode to its ionic solution. Clear bench removes the setup; Restart particles keeps it.": "Selecciona un metal y toca su botón Colocar, o arrástralo a un vaso de precipitados. Combina cada electrodo con su solución iónica. Despejar la mesa quita el montaje; Reiniciar partículas lo conserva.",
  "Run plays a short 12-event sample. Pause freezes it; Step once works without motion. Slow speed and the ion/explanation switches help you focus. Your device’s reduced-motion setting stops traveling markers; the event counts and particle changes remain available.": "Iniciar la celda reproduce una muestra corta de 12 eventos. Pausar la congela; Avanzar un paso funciona sin movimiento. La velocidad lenta y los interruptores de iones y explicaciones te ayudan a concentrarte. Si tu dispositivo pide menos movimiento, los marcadores dejan de desplazarse; los conteos de eventos y los cambios de las partículas siguen disponibles.",
  "Particle key": "Simbología de las partículas",
  "Small green circles marked e⁻ are electrons. Charged circles in solution are ions; unlabeled solid beads on the electrode are neutral metal atoms. Yellow circles labeled NO₃⁻ are nitrate ions; green K⁺ circles are potassium ions.": "Los círculos verdes pequeños marcados con e⁻ son electrones. Los círculos con carga en la solución son iones; las esferas sólidas sin etiqueta sobre el electrodo son átomos metálicos neutros. Los círculos amarillos con la etiqueta NO₃⁻ son iones nitrato; los círculos verdes con K⁺ son iones de potasio.",
  "Scope: selected metal/ion couples at 25 °C and unit ion activity (approximately 1 M). The powered mode excludes competing water reactions, resistance and overpotential. The voltmeter reports calculated E° for the selected reaction, not terminal voltage under load. The load and meter branch are schematic.": "Alcance: pares metal/ion seleccionados a 25 °C y actividad iónica unitaria (aproximadamente 1 M). El modo con fuente de poder excluye las reacciones competidoras del agua, la resistencia y el sobrepotencial. El voltímetro muestra el E° calculado para la reacción seleccionada, no el voltaje en las terminales bajo carga. La carga y la rama del medidor son esquemáticas.",
  // Controls
  "01 / Explore": "01 / Explora",
  "Start with an example": "Empieza con un ejemplo",
  "Zinc / copper · 1.10 V": "Zinc / cobre · 1.10 V",
  "Zinc / silver · 1.56 V": "Zinc / plata · 1.56 V",
  "Copper / silver · 0.46 V": "Cobre / plata · 0.46 V",
  "Build your own": "Arma tu propia celda",
  "Swap left and right": "Intercambiar izquierda y derecha",
  "Cell type": "Tipo de celda",
  "Galvanic · spontaneous": "Galvánica · espontánea",
  "Electrolytic · driven by power": "Electrolítica · con fuente",
  "Chemical energy becomes electrical energy.": "La energía química se convierte en energía eléctrica.",
  "Spontaneous: chemical → electrical energy.": "Espontánea: energía química → eléctrica.",
  "Driven in reverse: electrical → chemical energy.": "Impulsada en sentido inverso: energía eléctrica → química.",
  "Build your own cell": "Arma tu propia celda",
  "Drag a metal to a beaker, or select a metal and press a beaker’s “Place” button.": "Arrastra un metal a un vaso de precipitados, o selecciona un metal y presiona el botón “Colocar” de un vaso.",
  "Zinc": "Zinc",
  "Copper": "Cobre",
  "Silver": "Plata",
  "{metal} selected. Use a Place button or drag to a beaker.": "Metal seleccionado: {metalLower}. Usa un botón Colocar o arrástralo a un vaso de precipitados.",
  "Place {metal} left": "Colocar {metal} a la izquierda",
  "Place {metal} right": "Colocar {metal} a la derecha",
  "Add KNO₃ salt bridge": "Agregar puente salino de KNO₃",
  "Connect circuit + voltmeter": "Conectar circuito + voltímetro",
  "Power supply / V": "Fuente de poder / V",
  "Clear bench": "Despejar la mesa",
  // Cell and playback
  "02 / Observe": "02 / Observa",
  "Your electrochemical cell": "Tu celda electroquímica",
  "Animation controls": "Controles de la animación",
  "Run cell": "Iniciar la celda",
  "Pause": "Pausar",
  "Resume": "Reanudar",
  "Sample complete": "Muestra completa",
  "Step once": "Avanzar un paso",
  "Restart particles": "Reiniciar partículas",
  "Show ions": "Mostrar iones",
  "Show explanations": "Mostrar explicaciones",
  "Animation speed": "Velocidad de la animación",
  "Slow": "Lenta",
  "Normal": "Normal",
  "Fast": "Rápida",
  "e⁻ = electron": "e⁻ = electrón",
  "Charged circle = ion": "Círculo con carga = ion",
  "Solid bead = neutral atom": "Esfera sólida = átomo neutro",
  "Use standard *reduction* potentials for both electrodes. Do not multiply potentials when balancing electrons.": "Usa los potenciales estándar de *reducción* de ambos electrodos. No multipliques los potenciales al balancear los electrones.",
  "How is E° calculated?": "Cálculo de E°",
  "Particle sample counts": "Conteos de la muestra de partículas",
  "Each step is one balanced reaction event. These enlarged particles illustrate ratios, not moles, elapsed time, or reaction rate. Only the tracked ions are drawn; the surrounding solution is not shown. The 12-step sample holds the voltage at standard conditions.": "Cada paso es un evento de reacción balanceado. Estas partículas ampliadas ilustran proporciones, no moles, tiempo transcurrido ni velocidad de reacción. Solo se dibujan los iones que se siguen; no se muestra el resto de la solución. La muestra de 12 pasos mantiene el voltaje en condiciones estándar.",
  "Electrons travel through wires; ions move through the salt bridge.": "Los electrones viajan por los cables; los iones se mueven por el puente salino.",
  "Idealized standard-state model. Animation shows direction, not reaction rate.": "Modelo idealizado en estado estándar. La animación muestra la dirección, no la velocidad de reacción.",
  "Electrolytic mode models only the selected metal/ion couples; competing water reactions, resistance and overpotential are excluded.": "El modo electrolítico modela solo los pares metal/ion seleccionados; se excluyen las reacciones competidoras del agua, la resistencia y el sobrepotencial.",
  // Status messages
  "Place two different metals, then choose their matching ionic solutions.": "Coloca dos metales diferentes y luego elige la solución iónica de cada uno.",
  "Identical standard half-cells have E° = 0.00 V. Choose different metals to drive a reaction.": "Dos semiceldas estándar idénticas tienen E° = 0.00 V. Elige metales diferentes para que ocurra una reacción.",
  "Match each electrode with its own metal-ion solution. This model does not simulate mismatched half-cells.": "Combina cada electrodo con la solución de su propio ion metálico. Este modelo no simula semiceldas que no coinciden.",
  "Salt bridge disconnected: charge would build up, stopping sustained electron flow. Add the bridge to continue.": "Puente salino desconectado: se acumularía carga y se detendría el flujo continuo de electrones. Agrega el puente para continuar.",
  "Complete the external circuit to allow electron flow. The voltmeter measures across the two electrodes.": "Completa el circuito externo para permitir el flujo de electrones. El voltímetro mide entre los dos electrodos.",
  "Set the applied voltage above {v} V (up to 10 V) to drive the reverse reaction.": "Ajusta el voltaje aplicado por encima de {v} V (hasta 10 V) para impulsar la reacción inversa.",
  "Sample complete: 12 balanced events. Restart particles to repeat or change the setup.": "Muestra completa: 12 eventos balanceados. Usa Reiniciar partículas para repetirla o cambia el montaje.",
  "Running a short particle sample. Pause to inspect, or use Step once.": "Se está reproduciendo una muestra corta de partículas. Pausa para observarla, o usa Avanzar un paso.",
  "Ready. Step once to observe a balanced reaction event, or run the sample.": "Lista. Avanza un paso para observar un evento de reacción balanceado, o inicia la muestra.",
  "Event {events} of 12: {a} {anode} atom lost, {c} {cathode} atom deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.": "Evento {events} de 12: se perdió {a} átomo de {anode}, se depositó {c} átomo de {cathode} y se transfirieron {n} electrones. K⁺ y NO₃⁻ mantienen el balance de carga.",
  "Event {events} of 12: {a} {anode} atom lost, {c} {cathode} atoms deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.": "Evento {events} de 12: se perdió {a} átomo de {anode}, se depositaron {c} átomos de {cathode} y se transfirieron {n} electrones. K⁺ y NO₃⁻ mantienen el balance de carga.",
  "Event {events} of 12: {a} {anode} atoms lost, {c} {cathode} atom deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.": "Evento {events} de 12: se perdieron {a} átomos de {anode}, se depositó {c} átomo de {cathode} y se transfirieron {n} electrones. K⁺ y NO₃⁻ mantienen el balance de carga.",
  "Event {events} of 12: {a} {anode} atoms lost, {c} {cathode} atoms deposited, {n} electrons transferred. K⁺ and NO₃⁻ maintain charge balance.": "Evento {events} de 12: se perdieron {a} átomos de {anode}, se depositaron {c} átomos de {cathode} y se transfirieron {n} electrones. K⁺ y NO₃⁻ mantienen el balance de carga.",
  // Meter, flow and calculation
  "Calculated E° for this reaction: {e} V. The meter branch carries negligible current; electrons follow the load or power-supply circuit.": "E° calculado para esta reacción: {e} V. Por la rama del medidor pasa una corriente despreciable; los electrones siguen el circuito de la carga o de la fuente de poder.",
  "Calculated E° for this reaction: {e} V. Applied supply: {p} V. The meter branch carries negligible current; electrons follow the load or power-supply circuit.": "E° calculado para esta reacción: {e} V. Voltaje aplicado por la fuente: {p} V. Por la rama del medidor pasa una corriente despreciable; los electrones siguen el circuito de la carga o de la fuente de poder.",
  "Choose matching standard half-cells to calculate E°.": "Elige semiceldas estándar que coincidan para calcular E°.",
  "Electrons: {anode} → load → {cathode}. K⁺ moves toward the cathode; NO₃⁻ toward the anode. Electrons never cross the salt bridge.": "Electrones: {anode} → carga → {cathode}. El K⁺ se mueve hacia el cátodo y el NO₃⁻ hacia el ánodo. Los electrones nunca cruzan el puente salino.",
  "Electrons: {anode} → power supply → {cathode}. K⁺ moves toward the cathode; NO₃⁻ toward the anode. Electrons never cross the salt bridge.": "Electrones: {anode} → fuente de poder → {cathode}. El K⁺ se mueve hacia el cátodo y el NO₃⁻ hacia el ánodo. Los electrones nunca cruzan el puente salino.",
  "Electron flow requires a complete circuit and a salt bridge for charge balance.": "El flujo de electrones requiere un circuito completo y un puente salino para el balance de carga.",
  "E°cell = E°cathode − E°anode": "E°celda = E°cátodo − E°ánodo",
  "Choose two different metals and match their solutions.": "Elige dos metales diferentes y combina cada uno con su solución.",
  // Half-cells
  "Anode · oxidation · {sign}": "Ánodo · oxidación · {sign}",
  "Cathode · reduction · {sign}": "Cátodo · reducción · {sign}",
  "Left half-cell": "Semicelda izquierda",
  "Right half-cell": "Semicelda derecha",
  // A no-break space keeps "(1 M)" together on narrow screens.
  "Left solution (1 M)": "Solución izquierda (1\u00a0M)",
  "Right solution (1 M)": "Solución derecha (1\u00a0M)",
  "Choose ionic solution": "Elige la solución",
  "{metal} loses neutral atoms; ions enter solution.": "El electrodo de {metalLower} pierde átomos neutros; los iones pasan a la solución.",
  "{metal} gains neutral atoms; ions leave solution.": "El electrodo de {metalLower} gana átomos neutros; los iones salen de la solución.",
  "{metal} electrode.": "Electrodo de {metalLower}.",
  "Choose or drop an electrode.": "Elige o suelta un electrodo.",
  // Drawing
  "Electrochemical cell apparatus": "Montaje de la celda electroquímica",
  "Electrons travel from {anode} to {cathode}. Metal ions gain electrons at the cathode and deposit as neutral atoms. Anode metal dissolves into ions.": "Los electrones viajan de {anode} a {cathode}. Los iones metálicos ganan electrones en el cátodo y se depositan como átomos neutros. El metal del ánodo se disuelve en forma de iones.",
  "Two beakers with electrodes connected by a salt bridge and insulated meter leads.": "Dos vasos de precipitados con electrodos, conectados por un puente salino y por los cables aislados del medidor.",
  "LOAD": "CARGA",
  "DC SUPPLY": "FUENTE CD",
  "Choose a solution below": "Elige una solución abajo",
  "KNO₃ · agar gel": "KNO₃ · gel de agar",
  "STANDARD E° / V": "E° ESTÁNDAR / V",
  "OFF": "APAGADO",
  // Sample counts
  "Choose matching half-cells to follow a particle sample.": "Elige semiceldas que coincidan para seguir una muestra de partículas.",
  "<strong>{events} / 12</strong> events": "<strong>{events} / 12</strong> eventos",
  "<strong>{n}</strong> e⁻ transferred": "<strong>{n}</strong> e⁻ transferidos",
  "<strong>{n}</strong> {metal} atoms lost": "<strong>{n}</strong> átomos de {metal} perdidos",
  "<strong>{n}</strong> {metal} atoms deposited": "<strong>{n}</strong> átomos de {metal} depositados"
}};
  i18n.configure(copy);
  // One sentence with emphasis inside: after configure, Spanish replaces it whole, with *marks* around the emphasized word.
  var note = root.querySelector(".zsa-ec-potential p.small");
  if (note && i18n.lang === "es") {
    var parts = i18n.text("Use standard *reduction* potentials for both electrodes. Do not multiply potentials when balancing electrons.").split("*");
    note.replaceChildren.apply(note, parts.map(function (part, index) {
      if (index % 2 === 0) return document.createTextNode(part);
      var em = document.createElement("em"); em.textContent = part; return em;
    }));
  }
}());
