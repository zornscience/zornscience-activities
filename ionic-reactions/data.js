// Curated ionic-compound reactions. Neutral atom blocks build elemental products.
(function () {
  "use strict";
  var tokens = {};
  function token(id, formula, charge, name, polyatomic, atoms) {
    tokens[id] = {id: id, formula: formula, charge: charge, name: name, polyatomic: polyatomic, atoms: atoms};
  }
  token("mg", "Mg", 2, "magnesium ion", false, {Mg: 1});
  token("ca", "Ca", 2, "calcium ion", false, {Ca: 1});
  token("ba", "Ba", 2, "barium ion", false, {Ba: 1});
  token("zn", "Zn", 2, "zinc ion", false, {Zn: 1});
  token("al", "Al", 3, "aluminum ion", false, {Al: 1});
  token("na", "Na", 1, "sodium ion", false, {Na: 1});
  token("k", "K", 1, "potassium ion", false, {K: 1});
  token("li", "Li", 1, "lithium ion", false, {Li: 1});
  token("ag", "Ag", 1, "silver ion", false, {Ag: 1});
  token("fe", "Fe", 2, "iron(II) ion", false, {Fe: 1});
  token("fe3", "Fe", 3, "iron(III) ion", false, {Fe: 1});
  token("cu", "Cu", 2, "copper(II) ion", false, {Cu: 1});
  token("nh4", "NH4", 1, "ammonium", true, {N: 1, H: 4});
  token("cl", "Cl", -1, "chloride", false, {Cl: 1});
  token("br", "Br", -1, "bromide", false, {Br: 1});
  token("f", "F", -1, "fluoride", false, {F: 1});
  token("i", "I", -1, "iodide", false, {I: 1});
  token("n", "N", -3, "nitride", false, {N: 1});
  token("o", "O", -2, "oxide", false, {O: 1});
  token("s", "S", -2, "sulfide", false, {S: 1});
  token("oh", "OH", -1, "hydroxide", true, {O: 1, H: 1});
  token("no3", "NO3", -1, "nitrate", true, {N: 1, O: 3});
  token("no2", "NO2", -1, "nitrite", true, {N: 1, O: 2});
  token("io3", "IO3", -1, "iodate", true, {I: 1, O: 3});
  token("so3", "SO3", -2, "sulfite", true, {S: 1, O: 3});
  token("so4", "SO4", -2, "sulfate", true, {S: 1, O: 4});
  token("co3", "CO3", -2, "carbonate", true, {C: 1, O: 3});
  token("po4", "PO4", -3, "phosphate", true, {P: 1, O: 4});
  [["Mg", "magnesium"], ["Ca", "calcium"], ["Al", "aluminum"], ["Na", "sodium"], ["K", "potassium"], ["Li", "lithium"], ["Zn", "zinc"],
    ["Fe", "iron"], ["Cu", "copper"], ["Ag", "silver"], ["O", "oxygen"], ["N", "nitrogen"], ["S", "sulfur"],
    ["Cl", "chlorine"], ["Br", "bromine"], ["I", "iodine"]].forEach(function (entry) {
    var atoms = {}; atoms[entry[0]] = 1;
    token(entry[0].toLowerCase() + "_atom", entry[0], 0, entry[1] + " atom", false, atoms);
  });
  function part(id, count) { return {token: id, count: count || 1}; }
  function species(parts, kind) {
    var atoms = {}, formula = "";
    parts.forEach(function (p) {
      var t = tokens[p.token];
      formula += (t.polyatomic && p.count > 1 ? "(" + t.formula + ")" : t.formula) + (p.count > 1 ? p.count : "");
      Object.keys(t.atoms).forEach(function (symbol) { atoms[symbol] = (atoms[symbol] || 0) + t.atoms[symbol] * p.count; });
    });
    return {formula: formula, parts: parts, atoms: atoms, kind: kind};
  }
  function gcd(a, b) { while (b) { var n = a % b; a = b; b = n; } return a; }
  function salt(cation, anion) {
    var a = tokens[cation].charge, b = -tokens[anion].charge, g = gcd(a, b);
    return species([part(cation, b / g), part(anion, a / g)], "ionic");
  }
  function atom(id, count) { return species([part(id + "_atom", count)], "element"); }
  var types = [
    {id: "synthesis", label: "Synthesis"},
    {id: "decomposition", label: "Decomposition"},
    {id: "single-replacement", label: "Single Replacement"},
    {id: "double-replacement", label: "Double Replacement"}
  ];
  var reactions = [];
  function reaction(id, type, label, reactants, products, coefficients, condition, hint, note) {
    var bank = [];
    products.forEach(function (product) { product.parts.forEach(function (p) { if (bank.indexOf(p.token) < 0) bank.push(p.token); }); });
    reactions.push({id: id, type: type, label: label, reactants: reactants, products: products, coefficients: coefficients,
      bank: bank, condition: condition || "", hint: hint, note: note || ""});
  }
  var synthesisHint = "Combine the elements into one neutral ionic compound. Use the ion charges to find its subscripts.";
  var decompositionHint = "Use the stated energy source to split the ionic compound into elements. Free oxygen and halogens are diatomic.";
  var singleHint = "Use the activity series: the more reactive element replaces the less reactive element. Keep any polyatomic anion intact.";
  var doubleHint = "Swap ionic partners. Each product must be neutral, and every polyatomic ion keeps its internal formula.";
  reaction("magnesium-oxygen", "synthesis", "Magnesium and oxygen", [atom("mg"), atom("o", 2)], [salt("mg", "o")], [2, 1, 2], "Ignition in oxygen", synthesisHint, "Magnesium burns in oxygen to form ionic magnesium oxide.");
  reaction("calcium-oxygen", "synthesis", "Calcium and oxygen", [atom("ca"), atom("o", 2)], [salt("ca", "o")], [2, 1, 2], "Ignition in oxygen", synthesisHint, "Calcium combines with oxygen to form calcium oxide.");
  reaction("aluminum-oxygen", "synthesis", "Aluminum and oxygen", [atom("al"), atom("o", 2)], [salt("al", "o")], [4, 3, 2], "Ignition in oxygen", synthesisHint, "Aluminum oxide needs two aluminum ions for every three oxide ions.");
  reaction("sodium-chlorine", "synthesis", "Sodium and chlorine", [atom("na"), atom("cl", 2)], [salt("na", "cl")], [2, 1, 2], "Controlled reaction", synthesisHint, "Free chlorine is Cl2; chloride in sodium chloride is Cl−.");
  reaction("lithium-oxygen", "synthesis", "Lithium and oxygen", [atom("li"), atom("o", 2)], [salt("li", "o")], [4, 1, 2], "Controlled reaction in oxygen", synthesisHint, "Lithium forms the normal oxide Li2O, requiring two lithium ions per oxide ion.");
  reaction("lithium-nitrogen", "synthesis", "Lithium and nitrogen", [atom("li"), atom("n", 2)], [salt("li", "n")], [6, 1, 2], "Dry nitrogen", synthesisHint, "Lithium nitride contains Li+ and N3− in a 3:1 ratio.");
  reaction("magnesium-nitrogen", "synthesis", "Magnesium and nitrogen", [atom("mg"), atom("n", 2)], [salt("mg", "n")], [3, 1, 1], "Heat in dry nitrogen", synthesisHint, "Magnesium nitride contains Mg2+ and N3− in a 3:2 ratio.");
  reaction("calcium-nitrogen", "synthesis", "Calcium and nitrogen", [atom("ca"), atom("n", 2)], [salt("ca", "n")], [3, 1, 1], "Heat in dry nitrogen", synthesisHint, "Calcium nitride contains Ca2+ and N3− in a 3:2 ratio.");
  reaction("aluminum-sulfur", "synthesis", "Aluminum and sulfur", [atom("al"), atom("s", 8)], [salt("al", "s")], [16, 3, 8], "Heat under dry, oxygen-free conditions", synthesisHint, "Elemental sulfur is represented as S8. Aluminum sulfide needs a 2:3 ion ratio and reacts with moisture.");
  reaction("sodium-bromine", "synthesis", "Sodium and bromine", [atom("na"), atom("br", 2)], [salt("na", "br")], [2, 1, 2], "Controlled reaction", synthesisHint, "Bromine is diatomic; the product contains sodium ions and bromide ions.");
  reaction("silver-oxide-breakdown", "decomposition", "Silver oxide decomposes", [salt("ag", "o")], [atom("ag"), atom("o", 2)], [2, 4, 1], "Heat", decompositionHint, "Silver(I) oxide decomposes into silver metal and oxygen gas.");
  reaction("aluminum-oxide-electrolysis", "decomposition", "Aluminum oxide is electrolyzed", [salt("al", "o")], [atom("al"), atom("o", 2)], [2, 4, 3], "Electrolysis in molten cryolite with inert anodes", decompositionHint, "Inert anodes produce oxygen. Conventional carbon anodes would instead form carbon oxides.");
  reaction("iron-oxide-electrolysis", "decomposition", "Iron(III) oxide is electrolyzed", [salt("fe3", "o")], [atom("fe"), atom("o", 2)], [2, 4, 3], "Molten-oxide electrolysis with inert anodes", decompositionHint, "Electrical energy reduces iron(III) oxide to iron metal while oxygen forms at the inert anode.");
  reaction("lithium-chloride-electrolysis", "decomposition", "Lithium chloride is electrolyzed", [salt("li", "cl")], [atom("li"), atom("cl", 2)], [2, 2, 1], "Electrolysis of molten lithium chloride", decompositionHint, "The molten salt yields lithium metal and chlorine gas; an aqueous solution would not yield lithium metal.");
  reaction("sodium-chloride-electrolysis", "decomposition", "Sodium chloride is electrolyzed", [salt("na", "cl")], [atom("na"), atom("cl", 2)], [2, 2, 1], "Electrolysis of molten sodium chloride", decompositionHint, "The molten salt yields sodium metal and chlorine gas; aqueous brine would not yield sodium metal.");
  reaction("potassium-chloride-electrolysis", "decomposition", "Potassium chloride is electrolyzed", [salt("k", "cl")], [atom("k"), atom("cl", 2)], [2, 2, 1], "Electrolysis of molten potassium chloride", decompositionHint, "The molten salt yields potassium metal and diatomic chlorine.");
  reaction("lithium-bromide-electrolysis", "decomposition", "Lithium bromide is electrolyzed", [salt("li", "br")], [atom("li"), atom("br", 2)], [2, 2, 1], "Electrolysis of molten lithium bromide", decompositionHint, "Lithium forms as neutral metal and bromine is released as Br2.");
  reaction("sodium-bromide-electrolysis", "decomposition", "Sodium bromide is electrolyzed", [salt("na", "br")], [atom("na"), atom("br", 2)], [2, 2, 1], "Electrolysis of molten sodium bromide", decompositionHint, "The molten salt yields sodium metal and bromine, Br2.");
  reaction("potassium-bromide-electrolysis", "decomposition", "Potassium bromide is electrolyzed", [salt("k", "br")], [atom("k"), atom("br", 2)], [2, 2, 1], "Electrolysis of molten potassium bromide", decompositionHint, "Potassium is a neutral metal product and bromine is diatomic.");
  reaction("sodium-iodide-electrolysis", "decomposition", "Sodium iodide is electrolyzed", [salt("na", "i")], [atom("na"), atom("i", 2)], [2, 2, 1], "Electrolysis of molten sodium iodide", decompositionHint, "The molten salt yields sodium metal and diatomic iodine, I2.");
  reaction("aluminum-copper-sulfate", "single-replacement", "Aluminum and copper(II) sulfate", [atom("al"), salt("cu", "so4")], [salt("al", "so4"), atom("cu")], [2, 3, 1, 3], "Aqueous solution; aluminum oxide coating removed", singleHint, "Aluminum replaces copper. Three sulfate ions are needed for every two aluminum ions.");
  reaction("aluminum-zinc-sulfate", "single-replacement", "Aluminum and zinc sulfate", [atom("al"), salt("zn", "so4")], [salt("al", "so4"), atom("zn")], [2, 3, 1, 3], "Aqueous solution; aluminum oxide coating removed", singleHint, "Aluminum is more reactive than zinc. The oxide coating must be removed for the displacement to proceed.");
  reaction("aluminum-iron-sulfate", "single-replacement", "Aluminum and iron(II) sulfate", [atom("al"), salt("fe", "so4")], [salt("al", "so4"), atom("fe")], [2, 3, 1, 3], "Aqueous solution; aluminum oxide coating removed", singleHint, "Aluminum replaces iron(II), while sulfate remains intact.");
  reaction("zinc-iron-iii-sulfate", "single-replacement", "Zinc and iron(III) sulfate", [atom("zn"), salt("fe3", "so4")], [salt("zn", "so4"), atom("fe")], [3, 1, 3, 2], "Aqueous solution; enough zinc for complete reduction to iron", singleHint, "Iron(III) reduces first to iron(II), then to iron metal when enough zinc is available. This equation represents the complete reduction.");
  reaction("copper-silver-nitrate", "single-replacement", "Copper and silver nitrate", [atom("cu"), salt("ag", "no3")], [salt("cu", "no3"), atom("ag")], [1, 2, 1, 2], "Aqueous silver nitrate", singleHint, "Copper replaces silver, forming copper(II) nitrate and silver metal.");
  reaction("zinc-silver-nitrate", "single-replacement", "Zinc and silver nitrate", [atom("zn"), salt("ag", "no3")], [salt("zn", "no3"), atom("ag")], [1, 2, 1, 2], "Aqueous silver nitrate", singleHint, "Zinc replaces silver; nitrate stays intact as the compound's anion.");
  reaction("magnesium-silver-fluoride", "single-replacement", "Magnesium and silver fluoride", [atom("mg"), salt("ag", "f")], [salt("mg", "f"), atom("ag")], [1, 2, 1, 2], "Clean magnesium in aqueous silver fluoride", singleHint, "Silver fluoride is soluble. Magnesium displaces silver and forms sparingly soluble magnesium fluoride.");
  reaction("chlorine-bromide", "single-replacement", "Chlorine and potassium bromide", [atom("cl", 2), salt("k", "br")], [salt("k", "cl"), atom("br", 2)], [1, 2, 2, 1], "Aqueous potassium bromide", singleHint, "Chlorine is more reactive than bromine and replaces bromide. The free bromine product is Br2.");
  reaction("chlorine-sodium-iodide", "single-replacement", "Chlorine and sodium iodide", [atom("cl", 2), salt("na", "i")], [salt("na", "cl"), atom("i", 2)], [1, 2, 2, 1], "Aqueous sodium iodide; no excess chlorine", singleHint, "Chlorine displaces iodide to form iodine. Avoid excess chlorine, which can further oxidize iodine species.");
  reaction("bromine-potassium-iodide", "single-replacement", "Bromine and potassium iodide", [atom("br", 2), salt("k", "i")], [salt("k", "br"), atom("i", 2)], [1, 2, 2, 1], "Aqueous potassium iodide", singleHint, "Bromine is more reactive than iodine and displaces iodide. Both free halogens are diatomic.");
  reaction("silver-carbonate", "double-replacement", "Silver nitrate and sodium carbonate", [salt("ag", "no3"), salt("na", "co3")], [salt("ag", "co3"), salt("na", "no3")], [2, 1, 1, 2], "Aqueous solutions at room temperature", doubleHint, "Silver carbonate precipitates. Two silver ions are needed for each carbonate ion.");
  reaction("magnesium-nitrite-hydroxide", "double-replacement", "Magnesium nitrite and sodium hydroxide", [salt("mg", "no2"), salt("na", "oh")], [salt("mg", "oh"), salt("na", "no2")], [1, 2, 1, 2], "Aqueous solutions", doubleHint, "Magnesium hydroxide precipitates. Nitrite keeps its NO2− formula.");
  reaction("barium-iodate", "double-replacement", "Barium chloride and potassium iodate", [salt("ba", "cl"), salt("k", "io3")], [salt("ba", "io3"), salt("k", "cl")], [1, 2, 1, 2], "Concentrated aqueous solutions", doubleHint, "Sparingly soluble barium iodate precipitates. Two whole iodate ions are needed per barium ion.");
  reaction("silver-sulfite", "double-replacement", "Silver fluoride and sodium sulfite", [salt("ag", "f"), salt("na", "so3")], [salt("ag", "so3"), salt("na", "f")], [2, 1, 1, 2], "Stoichiometric aqueous solutions at room temperature", doubleHint, "Silver sulfite precipitates. Excess sulfite can form soluble silver complexes; heating or strong light can decompose the precipitate.");
  reaction("ammonium-calcium-phosphate", "double-replacement", "Calcium chloride and ammonium phosphate", [salt("ca", "cl"), salt("nh4", "po4")], [salt("ca", "po4"), salt("nh4", "cl")], [3, 2, 1, 6], "Aqueous solutions", doubleHint, "Calcium phosphate precipitates. Ammonium is a positive polyatomic ion and stays intact.");
  reaction("barium-sulfate", "double-replacement", "Barium chloride and sodium sulfate", [salt("ba", "cl"), salt("na", "so4")], [salt("ba", "so4"), salt("na", "cl")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Barium sulfate precipitates. Sulfate is SO4 with a 2− charge.");
  reaction("calcium-nitrite-carbonate", "double-replacement", "Calcium nitrite and sodium carbonate", [salt("ca", "no2"), salt("na", "co3")], [salt("ca", "co3"), salt("na", "no2")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Calcium carbonate precipitates; nitrite retains the formula NO2−.");
  reaction("aluminum-hydroxide", "double-replacement", "Aluminum sulfate and potassium hydroxide", [salt("al", "so4"), salt("k", "oh")], [salt("al", "oh"), salt("k", "so4")], [1, 6, 2, 3], "Stoichiometric aqueous solutions; no excess hydroxide", doubleHint, "Aluminum hydroxide precipitates. Excess hydroxide would redissolve this amphoteric hydroxide.");
  reaction("iron-hydroxide", "double-replacement", "Iron(III) sulfate and sodium hydroxide", [salt("fe3", "so4"), salt("na", "oh")], [salt("fe3", "oh"), salt("na", "so4")], [1, 6, 2, 3], "Aqueous solutions", doubleHint, "Iron(III) hydroxide precipitates. Each iron(III) ion needs three hydroxide ions.");
  reaction("copper-phosphate", "double-replacement", "Copper(II) sulfate and sodium phosphate", [salt("cu", "so4"), salt("na", "po4")], [salt("cu", "po4"), salt("na", "so4")], [3, 2, 1, 3], "Aqueous solutions", doubleHint, "Copper(II) phosphate precipitates, with a 3:2 ratio of copper ions to phosphate ions.");
  // Mexican Spanish for every student-facing string. Keys are the exact English text or full sentence templates.
  var SPANISH = {
    "Ionic Reaction Builder": "Constructor de reacciones iónicas",
    "ZornScience home": "Inicio de ZornScience",
    "Activity links": "Enlaces de la actividad",
    "Instructions": "Instrucciones",
    "Share activity": "Compartir actividad",
    "Share": "Compartir",
    "Enter fullscreen": "Entrar a pantalla completa",
    "Exit fullscreen": "Salir de pantalla completa",
    "Fullscreen could not close. Try pressing Escape.": "No se pudo cerrar la pantalla completa. Intenta presionar Escape.",
    "Fullscreen is unavailable here. You can use your browser's fullscreen controls.": "La pantalla completa no está disponible aquí. Puedes usar los controles de pantalla completa de tu navegador.",
    "Share this activity": "Compartir esta actividad",
    "Close share options": "Cerrar opciones para compartir",
    "Send someone a fresh practice round. Your answers and results are not included.": "Envía una ronda de práctica nueva. No se incluyen tus respuestas ni tus resultados.",
    "Share link": "Enlace para compartir",
    "Copy link": "Copiar enlace",
    "Email": "Correo electrónico",
    "(opens in a new tab)": "(se abre en una pestaña nueva)",
    "More share options": "Más opciones para compartir",
    "Link copied.": "Enlace copiado.",
    "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
    "Share options opened.": "Se abrieron las opciones para compartir.",
    "Use Copy link, email, or one of the social links instead.": "Usa Copiar enlace, correo electrónico o uno de los enlaces de redes sociales.",
    "Choose from four reaction types, predict the products, and balance chemical equations with ZornScience.": "Elige entre cuatro tipos de reacción, predice los productos y balancea ecuaciones químicas con ZornScience.",
    "How to use Ionic Reaction Builder": "Cómo usar el Constructor de reacciones iónicas",
    "Close instructions": "Cerrar instrucciones",
    "Predict the products first, then balance the equation. Here is a double replacement example.": "Primero predice los productos y luego balancea la ecuación. Aquí tienes un ejemplo de sustitución doble.",
    "Choose your practice.": "Elige tu práctica.",
    "Select at least one reaction type, then choose Start practice.": "Selecciona al menos un tipo de reacción y luego elige Iniciar práctica.",
    "Build the products. For CuSO4 + Na3PO4, pair Cu2+ with PO43−. Use the subscript arrows to set 3 copper ions and 2 phosphate ions, making Cu3(PO4)2. Pair Na+ with SO42− and set 2 sodium ions to make Na2SO4. Leave a subscript blank for 1.":
      "<strong>Construye los productos.</strong> Para CuSO<sub>4</sub> + Na<sub>3</sub>PO<sub>4</sub>, junta Cu<sup>2+</sup> con PO<sub>4</sub><sup>3−</sup>. Usa las flechas del subíndice para poner 3 iones de cobre y 2 iones fosfato, y así formar Cu<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>. Junta Na<sup>+</sup> con SO<sub>4</sub><sup>2−</sup> y pon 2 iones de sodio para formar Na<sub>2</sub>SO<sub>4</sub>. Deja un subíndice en blanco para indicar 1.",
    "Check your products.": "Revisa tus productos.",
    "Drag blocks into the spaces, or select a block and then its space. Either product order is accepted. Check products opens balancing when the formulas are correct.": "Arrastra los bloques a los espacios, o selecciona un bloque y luego su espacio. Los productos se aceptan en cualquier orden. Revisar productos abre el balanceo cuando las fórmulas son correctas.",
    "Balance with coefficients.": "Balancea con coeficientes.",
    "Set the coefficients to 3, 2, 1 and 3 in the order shown below. Keep the subscripts fixed. The live table shows a green check when the counts on the two sides are equal. The green Balanced confirmation appears automatically at the smallest whole-number ratio, and Next reaction becomes available.": "Pon los coeficientes 3, 2, 1 y 3 en el orden que se muestra abajo. No cambies los subíndices. La tabla en vivo muestra una marca verde cuando los conteos de los dos lados son iguales. Al llegar a la relación más pequeña de números enteros, aparece automáticamente la confirmación verde de ecuación balanceada y se activa Siguiente reacción.",
    "Products predicted": "Productos predichos",
    "Balanced equation": "Ecuación balanceada",
    "Check balance gives feedback whenever you need it. Skip problem advances without finishing it. The summary reviews missed and skipped problems; a problem counts only once.": "Revisar balanceo te da retroalimentación cuando la necesites. Saltar problema avanza sin terminarlo. El resumen repasa los problemas con errores y los omitidos; cada problema cuenta solo una vez.",
    "Choose your practice": "Elige tu práctica",
    "What would you like to work on?": "¿Qué te gustaría practicar?",
    "Choose at least one reaction type. You can include all four in your round.": "Elige al menos un tipo de reacción. Puedes incluir los cuatro en tu ronda.",
    "Choose reaction types": "Elige los tipos de reacción",
    "Synthesis": "Síntesis",
    "Decomposition": "Descomposición",
    "Single Replacement": "Sustitución simple",
    "Double Replacement": "Sustitución doble",
    "Choose at least one reaction type to start.": "Elige al menos un tipo de reacción para empezar.",
    "Choose at least one reaction type before starting.": "Elige al menos un tipo de reacción antes de empezar.",
    "Choose at least one reaction type, then start practice.": "Elige al menos un tipo de reacción y luego inicia la práctica.",
    "Start practice": "Iniciar práctica",
    "Problem 1 of 10": "Problema 1 de 10",
    "0 of 10 completed": "0 de 10 completados",
    "Round progress": "Progreso de la ronda",
    "0 of 10": "0 de 10",
    "What are the products?": "¿Cuáles son los productos?",
    "Mixed reaction practice": "Práctica de reacciones mixtas",
    "Reactants": "Reactivos",
    "Build the products": "Construye los productos",
    "Building blocks": "Bloques",
    "+ Cations": "+ Cationes",
    "− Anions": "− Aniones",
    "Atoms": "Átomos",
    "Drag a building block into a product space, or select it and then select its space. The same block can be used again.": "Arrastra un bloque a un espacio de producto, o selecciónalo y luego selecciona su espacio. Puedes usar el mismo bloque otra vez.",
    "Choose a building block to place.": "Elige un bloque para colocarlo.",
    "Subscripts count atoms or whole ions in one formula. Leave blank for 1. Keep the formula inside a polyatomic ion unchanged. Leave an unused second space empty. Select a filled space without choosing a block to clear it.": "Los subíndices cuentan átomos o iones completos en una fórmula. Déjalo en blanco para indicar 1. No cambies la fórmula dentro de un ion poliatómico. Deja vacío el segundo espacio si no lo usas. Para vaciar un espacio lleno, selecciónalo sin elegir un bloque.",
    "Check products": "Revisar productos",
    "Hint": "Pista",
    "Balance the equation": "Balancea la ecuación",
    "Use the ▲ and ▼ buttons, type a coefficient, or use the up and down arrow keys. Use the smallest whole-number ratio. The formulas stay fixed.": "Usa los botones ▲ y ▼, escribe un coeficiente o usa las flechas hacia arriba y hacia abajo del teclado. Usa la relación más pequeña de números enteros. Las fórmulas no cambian.",
    "Equation coefficients": "Coeficientes de la ecuación",
    "Count": "Contar",
    "Whole ions": "Iones completos",
    "Atom count on each side. Every row must match.": "Conteo de átomos en cada lado. Cada fila debe coincidir.",
    "Atom": "Átomo",
    "Ion": "Ion",
    "Products": "Productos",
    "Balanced?": "¿Balanceados?",
    "Check balance": "Revisar balanceo",
    "Skip problem": "Saltar problema",
    "Next reaction": "Siguiente reacción",
    "View summary": "Ver resumen",
    "Your practice": "Tu práctica",
    "Practice complete": "Práctica terminada",
    "Missed means a problem had an incorrect check or was skipped. Each problem counts once. Skipped problems are included in missed. Hints do not count as a miss.": "Con errores significa que un problema tuvo una revisión incorrecta o que lo saltaste. Cada problema cuenta una vez. Los problemas omitidos se incluyen en los que tienen errores. Las pistas no cuentan como error.",
    "By reaction type": "Por tipo de reacción",
    "Review your practice": "Repasa tu práctica",
    "Start a new round": "Iniciar una ronda nueva",
    "Change reaction types": "Cambiar los tipos de reacción",
    "Your progress stays in this tab. A new round starts fresh.": "Tu progreso se queda en esta pestaña. Una ronda nueva empieza desde cero.",
    "Practice with purpose. Nothing you enter leaves this tab.": "Practica con un propósito. Nada de lo que escribes sale de esta pestaña.",
    "First part": "Primera parte",
    "Second part": "Segunda parte",
    "Subscript": "Subíndice",
    "Balanced": "Balanceados",
    "Not balanced": "No balanceados",
    "Enter whole-number coefficients": "Escribe coeficientes enteros",
    "Correct first try": "Correctos al primer intento",
    "Missed (includes skips)": "Con errores (incluye omitidos)",
    "Skipped": "Omitidos",
    "Every problem was correct on the first check. Nice work!": "Todos los problemas fueron correctos en la primera revisión. ¡Buen trabajo!",
    "Products are set. Change only the coefficients below.": "Los productos ya quedaron. Cambia solo los coeficientes de abajo.",
    "Correct formulas are locked. Change coefficients to balance the equation.": "Las fórmulas correctas quedan fijas. Cambia los coeficientes para balancear la ecuación.",
    "Predict the products first, then balance the equation. Skip a problem to return to its answer in the summary.": "Primero predice los productos y luego balancea la ecuación. Si saltas un problema, verás su respuesta en el resumen.",
    "Fill the first space in each product and use whole-number subscripts from 1 to 9. Leave the second space empty for a one-part product. A blank subscript means 1.": "Llena el primer espacio de cada producto y usa subíndices enteros del 1 al 9. Deja vacío el segundo espacio si el producto tiene una sola parte. Un subíndice en blanco significa 1.",
    "Use each different product once. Two identical product cards leave another product missing.": "Usa cada producto diferente una sola vez. Si dos tarjetas de producto son iguales, falta otro producto.",
    "Check the subscripts. Use the simplest neutral formula, and remember the 2 in diatomic elements such as O2 and Cl2. Keep polyatomic ions together.": "Revisa los subíndices. Usa la fórmula neutra más simple y recuerda el 2 de los elementos diatómicos como O2 y Cl2. Mantén juntos los iones poliatómicos.",
    "Check the products for this reaction type. Put positive ions before negative ions in ionic formulas. Use atom blocks for free elements, and put each different product in its own card.": "Revisa los productos para este tipo de reacción. En las fórmulas iónicas, escribe los iones positivos antes que los negativos. Usa bloques de átomos para los elementos libres y pon cada producto diferente en su propia tarjeta.",
    "Correct products! Now conserve every atom by changing coefficients. Keep the formulas fixed.": "¡Productos correctos! Ahora conserva cada átomo cambiando los coeficientes. No cambies las fórmulas.",
    "Whole ions are unchanged in this partner swap. Every row must match.": "Los iones completos no cambian en este intercambio de pareja. Cada fila debe coincidir.",
    "Atoms are conserved in every reaction type. Every row must match.": "Los átomos se conservan en todos los tipos de reacción. Cada fila debe coincidir.",
    "Coefficients must be whole numbers from 1 to 99.": "Los coeficientes deben ser números enteros del 1 al 99.",
    "Balanced! Every atom is conserved and the coefficients are in the smallest whole-number ratio.": "¡Ecuación balanceada! Cada átomo se conserva y los coeficientes están en la relación más pequeña de números enteros.",
    "Enter whole numbers from 1 to 99 for every coefficient.": "Escribe números enteros del 1 al 99 en cada coeficiente.",
    "The counts match. Reduce all coefficients to the smallest whole-number ratio.": "Los conteos coinciden. Reduce todos los coeficientes a la relación más pequeña de números enteros.",
    "Counts updated. Keep adjusting coefficients until every row matches.": "Se actualizaron los conteos. Sigue ajustando los coeficientes hasta que cada fila coincida.",
    "Not balanced yet. Compare each row in the table, then change coefficients to conserve the atoms on both sides.": "Todavía no está balanceada. Compara cada fila de la tabla y luego cambia los coeficientes para conservar los átomos en los dos lados.",
    "The counts match! Now reduce all coefficients to the smallest whole-number ratio.": "¡Los conteos coinciden! Ahora reduce todos los coeficientes a la relación más pequeña de números enteros.",
    "Synthesis combines simpler reactants into one product. If it is ionic, make its positive and negative charges cancel.": "La síntesis combina reactivos más simples en un solo producto. Si es iónico, haz que sus cargas positivas y negativas se cancelen.",
    "Decomposition breaks one compound into simpler substances. Use the reaction conditions and remember diatomic gases.": "La descomposición separa un compuesto en sustancias más simples. Usa las condiciones de la reacción y recuerda los gases diatómicos.",
    "A more reactive element replaces another element in a compound. The displaced element is an uncombined element, not an ion.": "Un elemento más reactivo sustituye a otro elemento en un compuesto. El elemento desplazado queda como elemento libre, no como ion.",
    "Swap the ion partners. Keep cations first and use the smallest subscripts that make each product neutral.": "Intercambia las parejas de iones. Escribe primero los cationes y usa los subíndices más pequeños que hagan neutro cada producto.",
    "Use the available blocks to build the remaining product, if any. Put each different product in its own card.": "Usa los bloques disponibles para construir el otro producto, si lo hay. Pon cada producto diferente en su propia tarjeta.",
    "All counts match. If needed, divide every coefficient by their greatest common factor.": "Todos los conteos coinciden. Si hace falta, divide cada coeficiente entre su máximo común divisor.",
    "Combine the elements into one neutral ionic compound. Use the ion charges to find its subscripts.": "Combina los elementos en un solo compuesto iónico neutro. Usa las cargas de los iones para encontrar sus subíndices.",
    "Use the stated energy source to split the ionic compound into elements. Free oxygen and halogens are diatomic.": "Usa la fuente de energía indicada para separar el compuesto iónico en sus elementos. El oxígeno y los halógenos libres son diatómicos.",
    "Use the activity series: the more reactive element replaces the less reactive element. Keep any polyatomic anion intact.": "Usa la serie de actividad: el elemento más reactivo sustituye al menos reactivo. Mantén completo cualquier anión poliatómico.",
    "Swap ionic partners. Each product must be neutral, and every polyatomic ion keeps its internal formula.": "Intercambia las parejas iónicas. Cada producto debe ser neutro y cada ion poliatómico conserva su fórmula interna.",
    // Full sentence templates. Values are filled in, so word order stays natural in each language.
    "{finished} of {total} finished": "{finished} de {total} terminados",
    "Problem {number} of {total}": "Problema {number} de {total}",
    "Problem {number} of {total}. {type}. Predict the products.": "Problema {number} de {total}. {type}. Predice los productos.",
    "{name} selected. Choose a product space.": "Seleccionaste {name}. Elige un espacio de producto.",
    "Choose another block, or select a filled space to clear it.": "Elige otro bloque o selecciona un espacio lleno para vaciarlo.",
    "{name} placed in product {product}, component {part}.": "Colocaste {name} en el producto {product}, componente {part}.",
    "Product {product} component {part} cleared.": "Se vació el componente {part} del producto {product}.",
    "Product {product} component {part}: {content}": "Producto {product}, componente {part}: {content}",
    "Product {product} component {part}: {formula} {name}": "Producto {product}, componente {part}: {formula} {name}",
    "Product {product}": "Producto {product}",
    "Product {product} component {part} subscript": "Subíndice del producto {product}, componente {part}",
    "Increase product {product} component {part} subscript": "Aumentar el subíndice del producto {product}, componente {part}",
    "Decrease product {product} component {part} subscript": "Disminuir el subíndice del producto {product}, componente {part}",
    "Product {product} formula preview": "Vista previa de la fórmula del producto {product}",
    "Coefficient for {formula}": "Coeficiente de {formula}",
    "Increase coefficient for {formula}": "Aumentar el coeficiente de {formula}",
    "Decrease coefficient for {formula}": "Disminuir el coeficiente de {formula}",
    "{symbol}: {left} on reactants, {right} on products": "{symbol}: {left} en los reactivos, {right} en los productos",
    "One product is {formula}. {hint}": "Un producto es {formula}. {hint}",
    "Start with {symbol}: {left} on the reactant side and {right} on the product side. A coefficient multiplies the entire formula.": "Empieza con {symbol}: {left} en el lado de los reactivos y {right} en el lado de los productos. Un coeficiente multiplica toda la fórmula.",
    "You finished {total} problems. You missed {missed}, including {skipped} skipped.": "Terminaste {total} problemas. Tuviste errores en {missed}; de esos, omitiste {skipped}.",
    "{type} · Skipped": "{type} · Omitido",
    "{type} · Needed another try": "{type} · Necesitó otro intento",
    "{type}: {correct} of {total} correct first try": "{type}: {correct} de {total} correctos al primer intento",
    "Practice complete. {missed} problems missed, including {skipped} skipped.": "Práctica terminada. Tuviste errores en {missed}; de esos, omitiste {skipped}.",
    // Building blocks
    "magnesium ion": "ion de magnesio",
    "calcium ion": "ion de calcio",
    "barium ion": "ion de bario",
    "zinc ion": "ion de zinc",
    "aluminum ion": "ion de aluminio",
    "sodium ion": "ion de sodio",
    "potassium ion": "ion de potasio",
    "lithium ion": "ion de litio",
    "silver ion": "ion de plata",
    "iron(II) ion": "ion de hierro(II)",
    "iron(III) ion": "ion de hierro(III)",
    "copper(II) ion": "ion de cobre(II)",
    "ammonium": "amonio",
    "chloride": "cloruro",
    "bromide": "bromuro",
    "fluoride": "fluoruro",
    "iodide": "yoduro",
    "nitride": "nitruro",
    "oxide": "óxido",
    "sulfide": "sulfuro",
    "hydroxide": "hidróxido",
    "nitrate": "nitrato",
    "nitrite": "nitrito",
    "iodate": "yodato",
    "sulfite": "sulfito",
    "sulfate": "sulfato",
    "carbonate": "carbonato",
    "phosphate": "fosfato",
    "magnesium atom": "átomo de magnesio",
    "calcium atom": "átomo de calcio",
    "aluminum atom": "átomo de aluminio",
    "sodium atom": "átomo de sodio",
    "potassium atom": "átomo de potasio",
    "lithium atom": "átomo de litio",
    "zinc atom": "átomo de zinc",
    "iron atom": "átomo de hierro",
    "copper atom": "átomo de cobre",
    "silver atom": "átomo de plata",
    "oxygen atom": "átomo de oxígeno",
    "nitrogen atom": "átomo de nitrógeno",
    "sulfur atom": "átomo de azufre",
    "chlorine atom": "átomo de cloro",
    "bromine atom": "átomo de bromo",
    "iodine atom": "átomo de yodo",
    // Reaction conditions
    "Ignition in oxygen": "Ignición en oxígeno",
    "Controlled reaction": "Reacción controlada",
    "Controlled reaction in oxygen": "Reacción controlada en oxígeno",
    "Dry nitrogen": "Nitrógeno seco",
    "Heat in dry nitrogen": "Calor en nitrógeno seco",
    "Heat under dry, oxygen-free conditions": "Calor en condiciones secas y sin oxígeno",
    "Heat": "Calor",
    "Electrolysis in molten cryolite with inert anodes": "Electrólisis en criolita fundida con ánodos inertes",
    "Molten-oxide electrolysis with inert anodes": "Electrólisis del óxido fundido con ánodos inertes",
    "Electrolysis of molten lithium chloride": "Electrólisis de cloruro de litio fundido",
    "Electrolysis of molten sodium chloride": "Electrólisis de cloruro de sodio fundido",
    "Electrolysis of molten potassium chloride": "Electrólisis de cloruro de potasio fundido",
    "Electrolysis of molten lithium bromide": "Electrólisis de bromuro de litio fundido",
    "Electrolysis of molten sodium bromide": "Electrólisis de bromuro de sodio fundido",
    "Electrolysis of molten potassium bromide": "Electrólisis de bromuro de potasio fundido",
    "Electrolysis of molten sodium iodide": "Electrólisis de yoduro de sodio fundido",
    "Aqueous solution; aluminum oxide coating removed": "Solución acuosa; sin la capa de óxido de aluminio",
    "Aqueous solution; enough zinc for complete reduction to iron": "Solución acuosa; suficiente zinc para la reducción completa a hierro",
    "Aqueous silver nitrate": "Nitrato de plata acuoso",
    "Clean magnesium in aqueous silver fluoride": "Magnesio limpio en fluoruro de plata acuoso",
    "Aqueous potassium bromide": "Bromuro de potasio acuoso",
    "Aqueous sodium iodide; no excess chlorine": "Yoduro de sodio acuoso; sin exceso de cloro",
    "Aqueous potassium iodide": "Yoduro de potasio acuoso",
    "Aqueous solutions at room temperature": "Soluciones acuosas a temperatura ambiente",
    "Aqueous solutions": "Soluciones acuosas",
    "Concentrated aqueous solutions": "Soluciones acuosas concentradas",
    "Stoichiometric aqueous solutions at room temperature": "Soluciones acuosas estequiométricas a temperatura ambiente",
    "Stoichiometric aqueous solutions; no excess hydroxide": "Soluciones acuosas estequiométricas; sin exceso de hidróxido",
    // Explanations shown after correct products
    "Magnesium burns in oxygen to form ionic magnesium oxide.": "El magnesio arde en oxígeno y forma óxido de magnesio, un compuesto iónico.",
    "Calcium combines with oxygen to form calcium oxide.": "El calcio se combina con el oxígeno y forma óxido de calcio.",
    "Aluminum oxide needs two aluminum ions for every three oxide ions.": "El óxido de aluminio necesita dos iones de aluminio por cada tres iones óxido.",
    "Free chlorine is Cl2; chloride in sodium chloride is Cl−.": "El cloro libre es Cl2; el cloruro en el cloruro de sodio es Cl−.",
    "Lithium forms the normal oxide Li2O, requiring two lithium ions per oxide ion.": "El litio forma el óxido normal Li2O, que necesita dos iones de litio por cada ion óxido.",
    "Lithium nitride contains Li+ and N3− in a 3:1 ratio.": "El nitruro de litio contiene Li+ y N3− en una relación 3:1.",
    "Magnesium nitride contains Mg2+ and N3− in a 3:2 ratio.": "El nitruro de magnesio contiene Mg2+ y N3− en una relación 3:2.",
    "Calcium nitride contains Ca2+ and N3− in a 3:2 ratio.": "El nitruro de calcio contiene Ca2+ y N3− en una relación 3:2.",
    "Elemental sulfur is represented as S8. Aluminum sulfide needs a 2:3 ion ratio and reacts with moisture.": "El azufre elemental se representa como S8. El sulfuro de aluminio necesita una relación de iones 2:3 y reacciona con la humedad.",
    "Bromine is diatomic; the product contains sodium ions and bromide ions.": "El bromo es diatómico; el producto contiene iones de sodio e iones bromuro.",
    "Silver(I) oxide decomposes into silver metal and oxygen gas.": "El óxido de plata(I) se descompone en plata metálica y oxígeno gaseoso.",
    "Inert anodes produce oxygen. Conventional carbon anodes would instead form carbon oxides.": "Los ánodos inertes producen oxígeno. Los ánodos comunes de carbono formarían óxidos de carbono.",
    "Electrical energy reduces iron(III) oxide to iron metal while oxygen forms at the inert anode.": "La energía eléctrica reduce el óxido de hierro(III) a hierro metálico mientras se forma oxígeno en el ánodo inerte.",
    "The molten salt yields lithium metal and chlorine gas; an aqueous solution would not yield lithium metal.": "La sal fundida produce litio metálico y cloro gaseoso; una solución acuosa no produciría litio metálico.",
    "The molten salt yields sodium metal and chlorine gas; aqueous brine would not yield sodium metal.": "La sal fundida produce sodio metálico y cloro gaseoso; la salmuera acuosa no produciría sodio metálico.",
    "The molten salt yields potassium metal and diatomic chlorine.": "La sal fundida produce potasio metálico y cloro diatómico.",
    "Lithium forms as neutral metal and bromine is released as Br2.": "El litio se forma como metal neutro y el bromo se libera como Br2.",
    "The molten salt yields sodium metal and bromine, Br2.": "La sal fundida produce sodio metálico y bromo, Br2.",
    "Potassium is a neutral metal product and bromine is diatomic.": "El potasio es un producto metálico neutro y el bromo es diatómico.",
    "The molten salt yields sodium metal and diatomic iodine, I2.": "La sal fundida produce sodio metálico y yodo diatómico, I2.",
    "Aluminum replaces copper. Three sulfate ions are needed for every two aluminum ions.": "El aluminio sustituye al cobre. Se necesitan tres iones sulfato por cada dos iones de aluminio.",
    "Aluminum is more reactive than zinc. The oxide coating must be removed for the displacement to proceed.": "El aluminio es más reactivo que el zinc. Hay que quitar la capa de óxido para que ocurra el desplazamiento.",
    "Aluminum replaces iron(II), while sulfate remains intact.": "El aluminio sustituye al hierro(II), mientras el sulfato se mantiene completo.",
    "Iron(III) reduces first to iron(II), then to iron metal when enough zinc is available. This equation represents the complete reduction.": "El hierro(III) se reduce primero a hierro(II) y luego a hierro metálico cuando hay suficiente zinc. Esta ecuación representa la reducción completa.",
    "Copper replaces silver, forming copper(II) nitrate and silver metal.": "El cobre sustituye a la plata y forma nitrato de cobre(II) y plata metálica.",
    "Zinc replaces silver; nitrate stays intact as the compound's anion.": "El zinc sustituye a la plata; el nitrato se mantiene completo como el anión del compuesto.",
    "Silver fluoride is soluble. Magnesium displaces silver and forms sparingly soluble magnesium fluoride.": "El fluoruro de plata es soluble. El magnesio desplaza a la plata y forma fluoruro de magnesio, que es poco soluble.",
    "Chlorine is more reactive than bromine and replaces bromide. The free bromine product is Br2.": "El cloro es más reactivo que el bromo y sustituye al bromuro. El bromo libre que se produce es Br2.",
    "Chlorine displaces iodide to form iodine. Avoid excess chlorine, which can further oxidize iodine species.": "El cloro desplaza al yoduro y forma yodo. Evita el exceso de cloro, que puede oxidar todavía más las especies de yodo.",
    "Bromine is more reactive than iodine and displaces iodide. Both free halogens are diatomic.": "El bromo es más reactivo que el yodo y desplaza al yoduro. Los dos halógenos libres son diatómicos.",
    "Silver carbonate precipitates. Two silver ions are needed for each carbonate ion.": "El carbonato de plata precipita. Se necesitan dos iones de plata por cada ion carbonato.",
    "Magnesium hydroxide precipitates. Nitrite keeps its NO2− formula.": "El hidróxido de magnesio precipita. El nitrito conserva su fórmula NO2−.",
    "Sparingly soluble barium iodate precipitates. Two whole iodate ions are needed per barium ion.": "El yodato de bario, poco soluble, precipita. Se necesitan dos iones yodato completos por cada ion de bario.",
    "Silver sulfite precipitates. Excess sulfite can form soluble silver complexes; heating or strong light can decompose the precipitate.": "El sulfito de plata precipita. El exceso de sulfito puede formar complejos de plata solubles; el calor o la luz intensa pueden descomponer el precipitado.",
    "Calcium phosphate precipitates. Ammonium is a positive polyatomic ion and stays intact.": "El fosfato de calcio precipita. El amonio es un ion poliatómico positivo y se mantiene completo.",
    "Barium sulfate precipitates. Sulfate is SO4 with a 2− charge.": "El sulfato de bario precipita. El sulfato es SO4 con carga 2−.",
    "Calcium carbonate precipitates; nitrite retains the formula NO2−.": "El carbonato de calcio precipita; el nitrito conserva la fórmula NO2−.",
    "Aluminum hydroxide precipitates. Excess hydroxide would redissolve this amphoteric hydroxide.": "El hidróxido de aluminio precipita. Un exceso de hidróxido volvería a disolver este hidróxido anfótero.",
    "Iron(III) hydroxide precipitates. Each iron(III) ion needs three hydroxide ions.": "El hidróxido de hierro(III) precipita. Cada ion de hierro(III) necesita tres iones hidróxido.",
    "Copper(II) phosphate precipitates, with a 3:2 ratio of copper ions to phosphate ions.": "El fosfato de cobre(II) precipita, con una relación 3:2 de iones de cobre a iones fosfato."
  };
  var api = {tokens: tokens, ions: tokens, reactions: reactions, types: types, roundSize: 10};
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="ionic-reactions"]');
    if (root) {
      root.addEventListener("zsa:request-ir-data", function (event) { event.detail.receive(api); });
      var i18n;
      root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (value) { i18n = value; }}}));
      if (i18n) {
        var copy = {title: "Ionic Reaction Builder", es: SPANISH};
        // Instruction steps that mix formulas with prose are translated as one whole step, never word by word.
        // The key is the step's English text; the Spanish value keeps its subscripts and superscripts.
        if (i18n.lang === "es") root.querySelectorAll(".zsa-ir-instructions-steps li").forEach(function (item) {
          var spanish = SPANISH[item.textContent];
          if (!spanish) return;
          var doc = new DOMParser().parseFromString(spanish, "text/html");
          item.replaceChildren.apply(item, Array.from(doc.body.childNodes));
        });
        i18n.configure(copy);
      }
    }
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
