(function () {
  "use strict";
  // Net Ionic Reactions Lab: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Formulas, charges, state symbols, numbers and units stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="net-ionic-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  var copy = {title:"Net Ionic Reactions Lab", es:{
  // Header, instructions and share
  "Net Ionic Reactions Lab": "Laboratorio de reacciones iónicas netas",
  "ZornScience home": "Inicio de ZornScience",
  "Activity tools": "Herramientas de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "How to use this lab": "Guía para usar este laboratorio",
  "Close instructions": "Cerrar instrucciones",
  "Choose a reaction under {select}.": "Elige una reacción en {select}.",
  "Inspect the starting solutions, then choose {mix}. The beaker starts empty. Watch each 10 mL portion pour in and raise the liquid level; for the zinc trial, the solution goes in before the metal strip.": "Revisa las soluciones iniciales y luego elige {mix}. El vaso de precipitados empieza vacío. Observa cómo se vierte cada porción de 10 mL y cómo sube el nivel del líquido. En el ensayo con zinc, la solución se agrega antes que la tira de metal.",
  "For mixtures that form a precipitate, wait five seconds after mixing finishes. The solid then settles automatically, leaving clearer liquid above. For the zinc trial, observe the coating on the metal.": "En las mezclas que forman un precipitado, espera cinco segundos después de que termine la mezcla. Luego el sólido se asienta solo y deja arriba un líquido más transparente. En el ensayo con zinc, observa el recubrimiento sobre el metal.",
  "Reset to replay, or select another mixture. Open {reveal} after making your own observations.": "Reinicia para repetir o elige otra mezcla. Abre {reveal} después de hacer tus propias observaciones.",
  "The ten mixtures follow the attached lab’s observation table. Solution colors and precipitate textures are illustrative; actual appearance depends on lighting, concentration and time. Mixing colors alone does not establish a reaction.": "Las diez mezclas siguen la tabla de observaciones del laboratorio adjunto. Los colores de las soluciones y las texturas de los precipitados son ilustrativos; el aspecto real depende de la iluminación, la concentración y el tiempo. Que los colores se mezclen no demuestra por sí solo que haya una reacción.",
  "Virtual reagents only. In a real lab, use eye protection and your teacher’s handling and waste instructions, especially for lead and silver compounds and sodium hydroxide.": "Solo reactivos virtuales. En un laboratorio real, usa protección para los ojos y sigue las instrucciones de tu maestro o maestra para manejar y desechar los reactivos, sobre todo los compuestos de plomo y de plata y el hidróxido de sodio.",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Share a fresh lab with your class.": "Comparte el laboratorio desde cero con tu grupo.",
  "Activity link": "Enlace de la actividad",
  "Copy link": "Copiar enlace",
  "Share by email": "Compartir por correo electrónico",
  "Link copied.": "Enlace copiado.",
  "Select and copy the activity link.": "Selecciona y copia el enlace de la actividad.",
  "Enable JavaScript to use this simulation.": "Activa JavaScript para usar esta simulación.",
  // Mixture list and bench
  "Select a mixture": "Elige una mezcla",
  "Lab mixtures": "Mezclas del laboratorio",
  "Sodium chloride": "Cloruro de sodio",
  "Copper(II) sulfate": "Sulfato de cobre(II)",
  "Lead(II) nitrate": "Nitrato de plomo(II)",
  "Silver nitrate": "Nitrato de plata",
  "Calcium chloride": "Cloruro de calcio",
  "Iron(III) nitrate": "Nitrato de hierro(III)",
  "Sodium hydroxide": "Hidróxido de sodio",
  "Zinc": "Zinc",
  "solid": "sólido",
  "BOROSILICATE GLASSWARE": "MATERIAL DE VIDRIO DE BOROSILICATO",
  "ROOM TEMPERATURE · 22 °C": "TEMPERATURA AMBIENTE · 22 °C",
  "Two reagent bottles and a glass reaction beaker on a laboratory bench": "Dos frascos de reactivo y un vaso de precipitados de vidrio para la reacción sobre una mesa de laboratorio",
  "10 mL of each solution · zinc trial uses a small metal strip": "10 mL de cada solución · el ensayo con zinc usa una tira pequeña de metal",
  "Zn · metal strip": "Zn · tira de metal",
  "REACTION BEAKER": "VASO DE PRECIPITADOS PARA LA REACCIÓN",
  // Controls, phases and status
  "Mix reagents": "Mezclar reactivos",
  "Reset mixture": "Reiniciar mezcla",
  "Fresh glassware is ready.": "El material de vidrio limpio está listo.",
  "Ready to mix": "Listo para mezclar",
  "The beaker is empty. Ready to add the reagents.": "El vaso de precipitados está vacío. Todo listo para agregar los reactivos.",
  "Adding {reagent}": "Agregando {lower}",
  "Adding {reagent}.": "Agregando {lower}.",
  "First addition complete": "Primera adición completa",
  "First addition complete.": "Primera adición completa.",
  "Lowering the zinc strip": "Bajando la tira de zinc",
  "Lowering the zinc strip.": "Bajando la tira de zinc.",
  "Observing the mixture": "Observando la mezcla",
  "Observing the mixture.": "Observando la mezcla.",
  "Mixed": "Mezclado",
  "Reaction time accelerated: lead has deposited on the zinc.": "Tiempo de reacción acelerado: el plomo se depositó sobre el zinc.",
  "Observe the liquid and look for suspended solid.": "Observa el líquido y busca sólido en suspensión.",
  "Settling…": "Asentándose…",
  "The precipitate is sinking, leaving clearer liquid above.": "El precipitado se hunde y deja arriba un líquido más transparente.",
  "Settled": "Asentado",
  "Solid has collected at the bottom of the beaker. Settling time is accelerated.": "El sólido se juntó en el fondo del vaso de precipitados. El tiempo de asentamiento está acelerado.",
  // Observations
  "WHAT CAN YOU SEE?": "¿QUÉ PUEDES VER?",
  "Before mixing": "Antes de mezclar",
  "After mixing": "Después de mezclar",
  "{first}: {firstLook}. {second}: {secondLook}.": "{first}: {firstLook}. {second}: {secondLook}.",
  "a silvery gray metal strip": "una tira de metal gris plateado",
  "a transparent blue solution": "una solución azul transparente",
  "a transparent yellow solution": "una solución amarilla transparente",
  "a clear, colorless solution": "una solución transparente e incolora",
  "The mixture stays transparent and blue, paler than the original copper(II) sulfate solution. No precipitate appears.": "La mezcla se mantiene transparente y azul, más pálida que la solución original de sulfato de cobre(II). No aparece ningún precipitado.",
  "A dark gray, crystalline lead coating grows on the zinc. Some zinc dissolves; the solution remains colorless.": "Sobre el zinc crece un recubrimiento cristalino de plomo, de color gris oscuro. Parte del zinc se disuelve y la solución sigue incolora.",
  "A white, curdy cloud appears immediately. Silver chloride particles gather and settle, leaving a clearer liquid above.": "De inmediato aparece una nube blanca y grumosa. Las partículas de cloruro de plata se juntan y se asientan, y dejan arriba un líquido más transparente.",
  "The mixture remains transparent and pale yellow. No solid or gas appears.": "La mezcla sigue transparente y de color amarillo pálido. No aparece ningún sólido ni gas.",
  "A rust-brown, gelatinous precipitate forms and slowly settles into loose clumps.": "Se forma un precipitado gelatinoso de color café rojizo que se asienta poco a poco en grumos sueltos.",
  "The mixture stays transparent and pale yellow. No precipitate appears.": "La mezcla se mantiene transparente y de color amarillo pálido. No aparece ningún precipitado.",
  "The two transparent solutions combine into a blue-green mixture. No solid forms.": "Las dos soluciones transparentes se combinan en una mezcla verde azulada. No se forma ningún sólido.",
  "A fine white lead(II) sulfate precipitate forms in a pale blue solution. The blue liquid remains above the settling solid.": "Se forma un precipitado blanco y fino de sulfato de plomo(II) en una solución azul pálido. El líquido azul queda arriba del sólido que se asienta.",
  "A white crystalline precipitate forms and settles. The liquid above it remains colorless.": "Se forma un precipitado blanco y cristalino que se asienta. El líquido de arriba sigue incoloro.",
  "A light blue, gelatinous precipitate forms. Fluffy clumps gradually collect beneath the clearer liquid.": "Se forma un precipitado gelatinoso de color azul claro. Poco a poco se juntan grumos esponjosos debajo del líquido más transparente.",
  // The chemistry
  "Reveal the chemistry": "Mostrar la química",
  "No net ionic reaction.": "No hay reacción iónica neta.",
  "The ions remain dissolved. The blue solution is diluted when mixed with colorless sodium chloride.": "Los iones permanecen disueltos. La solución azul se diluye al mezclarse con el cloruro de sodio incoloro.",
  "Zinc transfers electrons to lead(II) ions. Lead metal deposits on the zinc surface; no gas is expected.": "El zinc transfiere electrones a los iones de plomo(II). El plomo metálico se deposita sobre la superficie del zinc; no se espera que se forme gas.",
  "Silver chloride has very low solubility. Sodium and nitrate ions remain in solution.": "El cloruro de plata tiene una solubilidad muy baja. Los iones de sodio y los iones nitrato permanecen en solución.",
  "The salts remain soluble. The iron(III) solution becomes paler through dilution.": "Las sales siguen siendo solubles. La solución de hierro(III) se vuelve más pálida por la dilución.",
  "Iron(III) hydroxide is insoluble. Hydroxide is in excess at these solution concentrations.": "El hidróxido de hierro(III) es insoluble. Con estas concentraciones de las soluciones, el hidróxido está en exceso.",
  "The ions remain dissolved under these conditions. Dilution can change the intensity of the yellow color.": "En estas condiciones, los iones permanecen disueltos. La dilución puede cambiar la intensidad del color amarillo.",
  "The combined blue and yellow colors do not by themselves indicate a chemical reaction. These salts remain dissolved.": "La combinación de los colores azul y amarillo no indica por sí sola una reacción química. Estas sales permanecen disueltas.",
  "Lead(II) sulfate is sparingly soluble. Copper(II) ions remain dissolved and give the liquid its blue color.": "El sulfato de plomo(II) es poco soluble. Los iones de cobre(II) permanecen disueltos y le dan al líquido su color azul.",
  "At room temperature and these concentrations, lead(II) chloride precipitates. Its appearance differs from the curdy silver chloride solid.": "A temperatura ambiente y con estas concentraciones, el cloruro de plomo(II) se precipita. Su aspecto es distinto al del sólido grumoso de cloruro de plata.",
  "Copper(II) hydroxide is insoluble. Hydroxide is in excess at these solution concentrations.": "El hidróxido de cobre(II) es insoluble. Con estas concentraciones de las soluciones, el hidróxido está en exceso.",
  // Footer
  "ZornScience · Idealized visual simulation · Reaction and settling times are accelerated.": "ZornScience · Simulación visual idealizada · Los tiempos de reacción y de asentamiento están acelerados."
}};
  i18n.configure(copy);
  // Three instruction steps name a control in bold. In Spanish each step is rebuilt from one full template,
  // with the translated control name in its own <strong>, so the sentence keeps Spanish word order.
  if (i18n.lang !== "es") return;
  var items = root.querySelectorAll("#help ol li");
  [[0, "Choose a reaction under {select}.", {select:"Select a mixture"}],
   [1, "Inspect the starting solutions, then choose {mix}. The beaker starts empty. Watch each 10 mL portion pour in and raise the liquid level; for the zinc trial, the solution goes in before the metal strip.", {mix:"Mix reagents"}],
   [3, "Reset to replay, or select another mixture. Open {reveal} after making your own observations.", {reveal:"Reveal the chemistry"}]
  ].forEach(function (step) {
    var li = items[step[0]];
    if (!li) return;
    li.replaceChildren.apply(li, i18n.text(step[1]).split(/\{(\w+)\}/).map(function (part, i) {
      if (i % 2 === 0) return document.createTextNode(part);
      var strong = document.createElement("strong");
      strong.textContent = i18n.text(step[2][part]);
      return strong;
    }));
  });
}());
