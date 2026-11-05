(function () {
  "use strict";
  // Original questions. Paired strings keep chemistry identical in both languages.
  function p(en, es) { return {en:en, es:es}; }
  function o(en, es, whyEn, whyEs) { return {text:p(en, es), why:p(whyEn, whyEs)}; }
  var questions = [];
  function mc(id, en, es, choices, reasoningEn, reasoningEs) {
    questions.push({id:id, topic:id.slice(0, 3), type:"mc", prompt:p(en, es), choices:choices, answer:0, explanation:p(reasoningEn, reasoningEs)});
  }
  function num(id, en, es, value, display, unit, precision, reasoningEn, reasoningEs) {
    questions.push({id:id, topic:id.slice(0, 3), type:"numeric", prompt:p(en, es), value:value, display:display, unit:unit,
      precision:precision, tolerance:precision.exact ? 0 : 0.55 * Math.pow(10, precision.decimals !== undefined ? -precision.decimals : Math.floor(Math.log10(Math.abs(value))) - precision.sf + 1),
      explanation:p(reasoningEn, reasoningEs)});
  }
  var topics = [
    ["1.1", "1.1 Moles and Molar Mass", "1.1 Moles y masa molar"],
    ["1.2", "1.2 Mass Spectra of Elements", "1.2 Espectros de masas de los elementos"],
    ["1.3", "1.3 Elemental Composition of Pure Substances", "1.3 Composición elemental de las sustancias puras"],
    ["1.4", "1.4 Composition of Mixtures", "1.4 Composición de las mezclas"],
    ["1.5", "1.5 Atomic Structure and Electron Configuration", "1.5 Estructura atómica y configuración electrónica"],
    ["1.6", "1.6 Photoelectron Spectroscopy", "1.6 Espectroscopía de fotoelectrones"],
    ["1.7", "1.7 Periodic Trends", "1.7 Tendencias periódicas"],
    ["1.8", "1.8 Valence Electrons and Ionic Compounds", "1.8 Electrones de valencia y compuestos iónicos"]
  ].map(function (row) { return {id:row[0], title:p(row[1], row[2])}; });

  num("1.1-1", "How many moles are in 18.02 g of H<sub>2</sub>O?", "¿Cuántos moles hay en 18.02 g de H<sub>2</sub>O?",
    18.02 / 18.02, "1.000", "mol", {sf:4},
    "M(H<sub>2</sub>O) = 2(1.01) + 16.00 = 18.02 g/mol. Divide: 18.02 g ÷ 18.02 g/mol = 1.000 mol.",
    "M(H<sub>2</sub>O) = 2(1.01) + 16.00 = 18.02 g/mol. Divide: 18.02 g ÷ 18.02 g/mol = 1.000 mol.");
  num("1.1-2", "What mass is in 0.250 mol of CO<sub>2</sub>?", "¿Qué masa hay en 0.250 mol de CO<sub>2</sub>?",
    0.250 * 44.01, "11.0", "g", {sf:3},
    "M(CO<sub>2</sub>) = 12.01 + 2(16.00) = 44.01 g/mol. Multiply: 0.250 mol × 44.01 g/mol = 11.0025 g, or 11.0 g.",
    "M(CO<sub>2</sub>) = 12.01 + 2(16.00) = 44.01 g/mol. Multiplica: 0.250 mol × 44.01 g/mol = 11.0025 g, es decir, 11.0 g.");
  num("1.1-3", "How many N atoms are in 0.125 mol of N<sub>2</sub> molecules?", "¿Cuántos átomos de N hay en 0.125 mol de moléculas de N<sub>2</sub>?",
    0.125 * 6.022e23 * 2, "1.51e23", "atoms", {sf:3},
    "Each molecule has 2 N atoms. 0.125 mol × 6.022 × 10<sup>23</sup> molecules/mol × 2 atoms/molecule = 1.5055 × 10<sup>23</sup> atoms. Round to 1.51 × 10<sup>23</sup> atoms.",
    "Cada molécula tiene 2 átomos de N. 0.125 mol × 6.022 × 10<sup>23</sup> moléculas/mol × 2 átomos/molécula = 1.5055 × 10<sup>23</sup> átomos. Redondea a 1.51 × 10<sup>23</sup> átomos.");
  mc("1.1-4", "Separate 1.00 g samples of these pure gases are compared. Which sample contains the most molecules?", "Se comparan muestras separadas de 1.00 g de estos gases puros. ¿Cuál contiene más moléculas?", [
    o("CH<sub>4</sub>", "CH<sub>4</sub>", "", ""),
    o("NH<sub>3</sub>", "NH<sub>3</sub>", "Its molar mass is 17.04 g/mol, higher than that of methane. Equal mass gives fewer molecules.", "Su masa molar es 17.04 g/mol, mayor que la del metano. Con la misma masa, tiene menos moléculas."),
    o("H<sub>2</sub>O", "H<sub>2</sub>O", "Its molar mass is 18.02 g/mol. Counting atoms per molecule does not give the number of molecules in a gram.", "Su masa molar es 18.02 g/mol. Contar los átomos por molécula no da el número de moléculas en un gramo."),
    o("CO<sub>2</sub>", "CO<sub>2</sub>", "At 44.01 g/mol, this gas has the fewest moles and molecules per gram of these choices.", "Con 44.01 g/mol, este gas tiene la menor cantidad de moles y moléculas por gramo entre estas opciones.")],
    "For equal masses, n = m/M. CH<sub>4</sub> has the smallest molar mass, 16.05 g/mol, so it has the most moles and molecules.",
    "Para masas iguales, n = m/M. CH<sub>4</sub> tiene la menor masa molar, 16.05 g/mol, así que tiene más moles y moléculas.");
  mc("1.1-5", "Which is the molar mass of Ca(NO<sub>3</sub>)<sub>2</sub>?", "¿Cuál es la masa molar de Ca(NO<sub>3</sub>)<sub>2</sub>?", [
    o("164.10 g/mol", "164.10 g/mol", "", ""),
    o("102.09 g/mol", "102.09 g/mol", "This counts only one nitrate group. The subscript outside the parentheses multiplies both N and O.", "Este valor cuenta solo un grupo nitrato. El subíndice fuera del paréntesis multiplica tanto N como O."),
    o("116.10 g/mol", "116.10 g/mol", "This counts two N atoms but only three O atoms. There are six O atoms per formula unit.", "Este valor cuenta dos átomos de N, pero solo tres de O. Hay seis átomos de O por unidad fórmula."),
    o("204.18 g/mol", "204.18 g/mol", "This also doubles Ca. The outside subscript applies only to the nitrate group.", "Este valor también duplica Ca. El subíndice externo se aplica solo al grupo nitrato.")],
    "Count 1 Ca, 2 N, and 6 O: 40.08 + 2(14.01) + 6(16.00) = 164.10 g/mol.",
    "Cuenta 1 Ca, 2 N y 6 O: 40.08 + 2(14.01) + 6(16.00) = 164.10 g/mol.");
  mc("1.1-6", "How many moles of Cl<sup>−</sup> ions correspond to 1.00 mol of MgCl<sub>2</sub> formula units?", "¿Cuántos moles de iones Cl<sup>−</sup> corresponden a 1.00 mol de unidades fórmula de MgCl<sub>2</sub>?", [
    o("2.00 mol", "2.00 mol", "", ""),
    o("1.00 mol", "1.00 mol", "This is the amount of formula units or magnesium ions. Each formula unit contains two chloride ions.", "Esta es la cantidad de unidades fórmula o de iones de magnesio. Cada unidad fórmula contiene dos iones cloruro."),
    o("0.500 mol", "0.500 mol", "Dividing by two reverses the ratio. Multiply formula units by two to count chloride ions.", "Dividir entre dos invierte la relación. Multiplica las unidades fórmula por dos para contar los iones cloruro."),
    o("3.00 mol", "3.00 mol", "Three counts all the ions, including magnesium. The question asks only for chloride ions.", "Tres cuenta todos los iones, incluido el magnesio. La pregunta pide solo los iones cloruro.")],
    "The formula gives a ratio of 2 chloride ions per formula unit: 1.00 mol × 2 = 2.00 mol of Cl<sup>−</sup>.",
    "La fórmula da una relación de 2 iones cloruro por unidad fórmula: 1.00 mol × 2 = 2.00 mol de Cl<sup>−</sup>.");

  num("1.2-1", "A model element has only two isotopes: mass 62.00 u at 70.0% abundance and mass 64.00 u at 30.0%. What is its average atomic mass?", "Un elemento modelo tiene solo dos isótopos: masa de 62.00 u con abundancia de 70.0% y masa de 64.00 u con abundancia de 30.0%. ¿Cuál es su masa atómica promedio?",
    62 * 0.7 + 64 * 0.3, "62.60", "u", {decimals:2},
    "Weight each isotope by its fraction: 62.00(0.700) + 64.00(0.300) = 62.60 u. A simple midpoint would assume equal abundances.",
    "Multiplica cada masa isotópica por su fracción: 62.00(0.700) + 64.00(0.300) = 62.60 u. El punto medio supondría abundancias iguales.");
  num("1.2-2", "A model element has only isotopes of mass 10.00 u and 11.00 u. Its average atomic mass is 10.20 u. What is the percent abundance of the 10.00 u isotope?", "Un elemento modelo tiene solo isótopos de masa 10.00 u y 11.00 u. Su masa atómica promedio es 10.20 u. ¿Cuál es la abundancia porcentual del isótopo de 10.00 u?",
    80, "80.0", "%", {sf:3},
    "Let x be the fraction of the lighter isotope. 10.00x + 11.00(1 − x) = 10.20 gives x = 0.800, or 80.0%.",
    "Sea x la fracción del isótopo más ligero. 10.00x + 11.00(1 − x) = 10.20 da x = 0.800, es decir, 80.0%.");
  num("1.2-3", "A calibrated mass spectrum has only two atomic isotope peaks, with relative intensities 3.00 and 1.00. Assuming equal detection response, what is the percent abundance of the less intense peak?", "Un espectro de masas calibrado tiene solo dos picos de isótopos atómicos, con intensidades relativas de 3.00 y 1.00. Si la respuesta de detección es igual, ¿cuál es la abundancia porcentual del pico menos intenso?",
    25, "25.0", "%", {sf:3},
    "Normalize by the total intensity: 1.00 ÷ (3.00 + 1.00) × 100 = 25.0%. Relative intensity is not itself a percentage.",
    "Divide entre la intensidad total: 1.00 ÷ (3.00 + 1.00) × 100 = 25.0%. La intensidad relativa no es por sí sola un porcentaje.");
  mc("1.2-4", "A mass spectrum of atomic ions of one element, all with charge <sup>+1</sup>, shows isotope peaks near mass numbers 24, 25, and 26. What causes these different masses?", "Un espectro de masas de iones atómicos de un elemento, todos con carga <sup>+1</sup>, muestra picos isotópicos cerca de los números de masa 24, 25 y 26. ¿Qué causa estas masas diferentes?", [
    o("Different neutron counts", "Distintos números de neutrones", "", ""),
    o("Different proton counts", "Distintos números de protones", "Changing the number of protons changes the element. These peaks belong to one element.", "Cambiar el número de protones cambia el elemento. Estos picos pertenecen a un solo elemento."),
    o("Different ionic charges", "Distintas cargas iónicas", "The question specifies that all detected atomic ions have charge <sup>+1</sup>.", "La pregunta indica que todos los iones atómicos detectados tienen carga <sup>+1</sup>."),
    o("Different numbers of atoms in each ion", "Distintos números de átomos en cada ion", "These are atomic ions, each containing one atom, rather than molecular ions.", "Son iones atómicos, cada uno con un átomo, en lugar de iones moleculares.")],
    "Isotopes share a proton count but differ in neutron count. For the same ionic charge, their different masses produce separate peaks.",
    "Los isótopos tienen el mismo número de protones, pero distinto número de neutrones. Con la misma carga iónica, sus masas diferentes producen picos separados.");
  mc("1.2-5", "An element has only two isotopes, of mass 78.92 u and 80.92 u. Its average atomic mass is 79.90 u. Which statement follows?", "Un elemento tiene solo dos isótopos, de masa 78.92 u y 80.92 u. Su masa atómica promedio es 79.90 u. ¿Qué afirmación se deduce?", [
    o("The 78.92 u isotope is slightly more abundant.", "El isótopo de 78.92 u es ligeramente más abundante.", "", ""),
    o("The two isotopes are equally abundant.", "Los dos isótopos tienen la misma abundancia.", "Equal abundances would give the midpoint, 79.92 u, rather than 79.90 u.", "Abundancias iguales darían el punto medio, 79.92 u, en lugar de 79.90 u."),
    o("The 80.92 u isotope is slightly more abundant.", "El isótopo de 80.92 u es ligeramente más abundante.", "That would put the average above the midpoint, 79.92 u. This average lies below it.", "Eso pondría el promedio por encima del punto medio, 79.92 u. Este promedio está por debajo."),
    o("Each atom has mass 79.90 u.", "Cada átomo tiene una masa de 79.90 u.", "An average describes the sample. Individual atoms have the isotope masses given in the question.", "Un promedio describe la muestra. Los átomos individuales tienen las masas isotópicas dadas en la pregunta.")],
    "The average is closer to 78.92 u. Solving 78.92x + 80.92(1 − x) = 79.90 gives x = 0.510, so the lighter isotope is 51.0% abundant.",
    "El promedio está más cerca de 78.92 u. Al resolver 78.92x + 80.92(1 − x) = 79.90, obtienes x = 0.510, así que el isótopo más ligero tiene una abundancia de 51.0%.");
  mc("1.2-6", "Which property must be identical for two isotopes of the same element?", "¿Qué propiedad debe ser idéntica para dos isótopos del mismo elemento?", [
    o("Atomic number", "Número atómico", "", ""),
    o("Mass number", "Número de masa", "Isotopes have different neutron counts, so their mass numbers differ.", "Los isótopos tienen distintos números de neutrones, así que sus números de masa difieren."),
    o("Number of neutrons", "Número de neutrones", "A difference in neutron count is what distinguishes isotopes of one element.", "La diferencia en el número de neutrones distingue a los isótopos de un elemento."),
    o("Natural abundance", "Abundancia natural", "An element's isotopes do not have to occur in equal proportions.", "Los isótopos de un elemento no tienen que presentarse en proporciones iguales.")],
    "Atomic number is the proton count and identifies the element. Isotopes of the same element must have the same atomic number.",
    "El número atómico es el número de protones e identifica al elemento. Los isótopos del mismo elemento deben tener el mismo número atómico.");

  num("1.3-1", "What is the mass percent of oxygen in pure CO<sub>2</sub>?", "¿Cuál es el porcentaje en masa de oxígeno en CO<sub>2</sub> puro?",
    32 / 44.01 * 100, "72.7", "%", {sf:3},
    "One mole has 32.00 g of O in 44.01 g of CO<sub>2</sub>. Oxygen mass percent = (32.00 ÷ 44.01) × 100 = 72.7%.",
    "Un mol tiene 32.00 g de O en 44.01 g de CO<sub>2</sub>. Porcentaje en masa de oxígeno = (32.00 ÷ 44.01) × 100 = 72.7%.");
  mc("1.3-2", "A pure compound contains only 3.60 g of C and 4.80 g of O. Which empirical formula fits these data?", "Un compuesto puro contiene solo 3.60 g de C y 4.80 g de O. ¿Qué fórmula empírica corresponde a estos datos?", [
    o("CO", "CO", "", ""),
    o("CO<sub>2</sub>", "CO<sub>2</sub>", "This requires twice as many O atoms as C atoms. The measured mole amounts are nearly equal.", "Esta fórmula requiere el doble de átomos de O que de C. Las cantidades de moles medidas son casi iguales."),
    o("C<sub>3</sub>O<sub>4</sub>", "C<sub>3</sub>O<sub>4</sub>", "This uses a mass ratio as an atom ratio. Convert each element's mass to moles first.", "Esta fórmula usa una relación de masas como relación de átomos. Primero convierte la masa de cada elemento a moles."),
    o("C<sub>2</sub>O", "C<sub>2</sub>O", "This requires twice as many C atoms as O atoms, inconsistent with the nearly equal mole amounts.", "Esta fórmula requiere el doble de átomos de C que de O, lo cual no coincide con las cantidades de moles casi iguales.")],
    "n(C) = 3.60/12.01 ≈ 0.300 mol; n(O) = 4.80/16.00 = 0.300 mol. Their simplest whole-number ratio is 1:1, giving CO.",
    "n(C) = 3.60/12.01 ≈ 0.300 mol; n(O) = 4.80/16.00 = 0.300 mol. Su relación entera más sencilla es 1:1, lo que da CO.");
  mc("1.3-3", "A compound has empirical formula CH<sub>2</sub>O and molar mass 180.18 g/mol. What is its molecular formula?", "Un compuesto tiene fórmula empírica CH<sub>2</sub>O y masa molar de 180.18 g/mol. ¿Cuál es su fórmula molecular?", [
    o("C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", "", ""),
    o("CH<sub>2</sub>O", "CH<sub>2</sub>O", "This has molar mass 30.03 g/mol, only one sixth of the stated molecular molar mass.", "Esta fórmula tiene una masa molar de 30.03 g/mol, solo una sexta parte de la masa molar molecular indicada."),
    o("C<sub>6</sub>H<sub>2</sub>O", "C<sub>6</sub>H<sub>2</sub>O", "The multiplier must apply to every subscript, not just carbon.", "El multiplicador debe aplicarse a todos los subíndices, no solo al carbono."),
    o("C<sub>3</sub>H<sub>6</sub>O<sub>3</sub>", "C<sub>3</sub>H<sub>6</sub>O<sub>3</sub>", "This is a valid multiple of the empirical formula, but its molar mass is only 90.09 g/mol.", "Esta fórmula es un múltiplo válido de la fórmula empírica, pero su masa molar es solo 90.09 g/mol.")],
    "The empirical formula mass is 12.01 + 2(1.01) + 16.00 = 30.03 g/mol. The multiplier is 180.18/30.03 = 6. Multiply all subscripts by 6.",
    "La masa de la fórmula empírica es 12.01 + 2(1.01) + 16.00 = 30.03 g/mol. El multiplicador es 180.18/30.03 = 6. Multiplica todos los subíndices por 6.");
  num("1.3-4", "What mass of oxygen is contained in 0.100 mol of Al<sub>2</sub>O<sub>3</sub>?", "¿Qué masa de oxígeno contiene 0.100 mol de Al<sub>2</sub>O<sub>3</sub>?",
    0.100 * 3 * 16, "4.80", "g", {sf:3},
    "Each formula unit contains 3 O atoms. 0.100 mol × 3 × 16.00 g/mol = 4.80 g of oxygen. Do not use the molar mass of the entire compound.",
    "Cada unidad fórmula contiene 3 átomos de O. 0.100 mol × 3 × 16.00 g/mol = 4.80 g de oxígeno. No uses la masa molar del compuesto completo.");
  mc("1.3-5", "Two samples of pure MgO have different total masses. Which ratio must be the same in both?", "Dos muestras de MgO puro tienen masas totales diferentes. ¿Qué relación debe ser igual en ambas?", [
    o("Mass of Mg divided by mass of O", "Masa de Mg dividida entre masa de O", "", ""),
    o("Mass of Mg divided by sample volume", "Masa de Mg dividida entre el volumen de la muestra", "Volume can depend on sample packing and conditions. Fixed composition concerns the masses of the elements.", "El volumen puede depender del acomodo de la muestra y las condiciones. La composición fija se refiere a las masas de los elementos."),
    o("Mass of Mg in one sample divided by mass of Mg in the other", "Masa de Mg en una muestra dividida entre masa de Mg en la otra", "This ratio depends on the chosen sample sizes and does not describe each sample's elemental composition.", "Esta relación depende del tamaño de las muestras elegidas y no describe la composición elemental de cada muestra."),
    o("Total mass divided by the mass of one Mg atom", "Masa total dividida entre la masa de un átomo de Mg", "This changes with total sample mass. The samples have different total masses.", "Este valor cambia con la masa total de la muestra. Las muestras tienen masas totales diferentes.")],
    "A pure compound has a fixed elemental mass ratio. In MgO, m(Mg)/m(O) = 24.31/16.00 regardless of sample size.",
    "Un compuesto puro tiene una relación fija de masas elementales. En MgO, m(Mg)/m(O) = 24.31/16.00, sin importar el tamaño de la muestra.");
  num("1.3-6", "What mass of chlorine is contained in 0.200 mol of pure NaCl?", "¿Qué masa de cloro contiene 0.200 mol de NaCl puro?",
    0.200 * 35.45, "7.09", "g", {sf:3},
    "NaCl has 1 Cl per formula unit. 0.200 mol × 35.45 g/mol = 7.09 g of chlorine. Using 58.44 g/mol would give the mass of all the NaCl.",
    "NaCl tiene 1 Cl por unidad fórmula. 0.200 mol × 35.45 g/mol = 7.09 g de cloro. Usar 58.44 g/mol daría la masa de todo el NaCl.");

  num("1.4-1", "A mixture contains 6.00 g of NaCl and 14.00 g of water. What is the mass percent of NaCl?", "Una mezcla contiene 6.00 g de NaCl y 14.00 g de agua. ¿Cuál es el porcentaje en masa de NaCl?",
    6 / 20 * 100, "30.0", "%", {sf:3},
    "The total mixture mass is 20.00 g. Mass percent = 6.00 g ÷ 20.00 g × 100 = 30.0%. Use mixture mass, not just water mass, in the denominator.",
    "La masa total de la mezcla es 20.00 g. Porcentaje en masa = 6.00 g ÷ 20.00 g × 100 = 30.0%. Usa la masa de la mezcla, no solo la del agua, en el denominador.");
  num("1.4-2", "A 25.0 g mixture is 12.0% NaCl by mass. What mass of NaCl does it contain?", "Una mezcla de 25.0 g tiene 12.0% de NaCl en masa. ¿Qué masa de NaCl contiene?",
    25 * 0.12, "3.00", "g", {sf:3},
    "Convert the percent to a fraction: 12.0/100 = 0.120. NaCl mass = 25.0 g × 0.120 = 3.00 g.",
    "Convierte el porcentaje en fracción: 12.0/100 = 0.120. Masa de NaCl = 25.0 g × 0.120 = 3.00 g.");
  num("1.4-3", "A 10.00 g mixture contains only NaCl and KCl. It contains 4.00 g of NaCl. How many moles of KCl are present?", "Una mezcla de 10.00 g contiene solo NaCl y KCl. Tiene 4.00 g de NaCl. ¿Cuántos moles de KCl hay?",
    6 / 74.55, "0.0805", "mol", {sf:3},
    "KCl mass = 10.00 − 4.00 = 6.00 g. M(KCl) = 39.10 + 35.45 = 74.55 g/mol. n = 6.00/74.55 = 0.0805 mol.",
    "Masa de KCl = 10.00 − 4.00 = 6.00 g. M(KCl) = 39.10 + 35.45 = 74.55 g/mol. n = 6.00/74.55 = 0.0805 mol.");
  mc("1.4-4", "Sugar and salt dissolve together in water without reacting. Which statement best describes the resulting mixture?", "El azúcar y la sal se disuelven juntos en agua sin reaccionar. ¿Qué afirmación describe mejor la mezcla resultante?", [
    o("The components keep their chemical identities, and their proportions can vary.", "Los componentes conservan sus identidades químicas y sus proporciones pueden variar.", "", ""),
    o("The components form a new compound with a fixed formula.", "Los componentes forman un compuesto nuevo con una fórmula fija.", "Dissolving without a reaction does not form a new compound with a fixed sugar-to-salt ratio.", "Disolver sin una reacción no forma un compuesto nuevo con una relación fija entre azúcar y sal."),
    o("Every mixture must have equal masses of all components.", "Toda mezcla debe tener masas iguales de todos los componentes.", "A mixture can contain unequal amounts of its components.", "Una mezcla puede contener cantidades desiguales de sus componentes."),
    o("A uniform appearance proves the sample is a pure substance.", "Una apariencia uniforme demuestra que la muestra es una sustancia pura.", "A homogeneous mixture can look uniform while containing several substances.", "Una mezcla homogénea puede verse uniforme y contener varias sustancias.")],
    "A mixture combines substances in variable proportions. A homogeneous solution can contain sugar, salt, and water while preserving their chemical identities.",
    "Una mezcla combina sustancias en proporciones variables. Una solución homogénea puede contener azúcar, sal y agua y conservar sus identidades químicas.");
  mc("1.4-5", "Which observation distinguishes a mixture of iron and sulfur from pure FeS?", "¿Qué observación distingue una mezcla de hierro y azufre del FeS puro?", [
    o("The iron-to-sulfur mass ratio can vary in the mixture.", "La relación de masas de hierro y azufre puede variar en la mezcla.", "", ""),
    o("FeS can have any iron-to-sulfur atom ratio.", "FeS puede tener cualquier relación de átomos de hierro y azufre.", "Pure FeS has the fixed atom ratio 1:1.", "El FeS puro tiene la relación fija de átomos 1:1."),
    o("A mixture cannot contain elements.", "Una mezcla no puede contener elementos.", "Mixtures can contain elements, compounds, or both.", "Las mezclas pueden contener elementos, compuestos o ambos."),
    o("FeS and every iron-sulfur mixture have identical percent composition.", "FeS y toda mezcla de hierro y azufre tienen la misma composición porcentual.", "A mixture's composition depends on the amounts combined and need not match FeS.", "La composición de una mezcla depende de las cantidades combinadas y no tiene que coincidir con la de FeS.")],
    "FeS has a fixed formula and mass ratio, 55.85 g Fe per 32.06 g S. Unreacted mixtures can be prepared with other ratios.",
    "FeS tiene una fórmula y una relación de masas fijas, 55.85 g de Fe por 32.06 g de S. Las mezclas sin reaccionar pueden prepararse con otras relaciones.");
  mc("1.4-6", "Pure water is added to a salt solution. No salt is lost and no reaction occurs. What happens to the mass percent of salt?", "Se agrega agua pura a una solución de sal. No se pierde sal ni ocurre una reacción. ¿Qué pasa con el porcentaje en masa de sal?", [
    o("It decreases.", "Disminuye.", "", ""),
    o("It increases.", "Aumenta.", "Water adds to the denominator, not to the salt mass in the numerator.", "El agua aumenta el denominador, no la masa de sal del numerador."),
    o("It stays the same.", "Permanece igual.", "The salt mass stays the same, but the total solution mass increases.", "La masa de sal permanece igual, pero aumenta la masa total de la solución."),
    o("It becomes exactly zero.", "Se vuelve exactamente cero.", "The original salt is still present. Dilution reduces its mass fraction but does not remove it.", "La sal original sigue presente. La dilución reduce su fracción en masa, pero no la elimina.")],
    "Mass percent = salt mass ÷ total solution mass × 100. Adding water increases total mass while salt mass stays constant, so the percentage falls.",
    "Porcentaje en masa = masa de sal ÷ masa total de la solución × 100. Agregar agua aumenta la masa total mientras la masa de sal permanece constante, así que el porcentaje disminuye.");

  num("1.5-1", "How many electrons are in <sup>31</sup>P<sup>3−</sup>? Phosphorus has atomic number 15.", "¿Cuántos electrones hay en <sup>31</sup>P<sup>3−</sup>? El fósforo tiene número atómico 15.",
    18, "18", "count", {exact:true},
    "The atom has 15 protons. A charge of <sup>3−</sup> means three more electrons than protons: 15 + 3 = 18 electrons. The mass number 31 counts protons plus neutrons.",
    "El átomo tiene 15 protones. Una carga de <sup>3−</sup> significa tres electrones más que protones: 15 + 3 = 18 electrones. El número de masa 31 cuenta protones más neutrones.");
  num("1.5-2", "How many unpaired electrons are in a ground-state S atom with configuration [Ne]3s<sup>2</sup>3p<sup>4</sup>?", "¿Cuántos electrones desapareados tiene un átomo de S en estado fundamental con configuración [Ne]3s<sup>2</sup>3p<sup>4</sup>?",
    2, "2", "count", {exact:true},
    "Hund's rule puts one electron in each of the three 3p orbitals before pairing. Four 3p electrons give one pair and two unpaired electrons. All lower subshells are filled.",
    "La regla de Hund coloca un electrón en cada uno de los tres orbitales 3p antes de aparearlos. Cuatro electrones 3p dan un par y dos electrones desapareados. Todos los subniveles inferiores están llenos.");
  mc("1.5-3", "Fe has ground-state configuration [Ar]3d<sup>6</sup>4s<sup>2</sup>. Which is the ground-state configuration of Fe<sup>2+</sup>?", "Fe tiene configuración de estado fundamental [Ar]3d<sup>6</sup>4s<sup>2</sup>. ¿Cuál es la configuración de estado fundamental de Fe<sup>2+</sup>?", [
    o("[Ar]3d<sup>6</sup>", "[Ar]3d<sup>6</sup>", "", ""),
    o("[Ar]3d<sup>4</sup>4s<sup>2</sup>", "[Ar]3d<sup>4</sup>4s<sup>2</sup>", "This removes 3d electrons first. In forming this transition-metal cation, the occupied 4s electrons are removed first.", "Esta opción quita primero electrones 3d. Al formar este catión de un metal de transición, primero se quitan los electrones 4s ocupados."),
    o("[Ar]3d<sup>6</sup>4s<sup>4</sup>", "[Ar]3d<sup>6</sup>4s<sup>4</sup>", "A positive ion loses electrons, and an s subshell cannot hold four electrons.", "Un ion positivo pierde electrones y un subnivel s no puede contener cuatro electrones."),
    o("[Ar]3d<sup>5</sup>4s<sup>1</sup>", "[Ar]3d<sup>5</sup>4s<sup>1</sup>", "This removes one electron from each subshell. Both occupied 4s electrons are removed before a 3d electron here.", "Esta opción quita un electrón de cada subnivel. Aquí se quitan ambos electrones 4s ocupados antes de quitar uno de 3d.")],
    "Fe<sup>2+</sup> has lost two electrons. Remove them from the occupied level with the highest principal quantum number, 4s, leaving [Ar]3d<sup>6</sup>.",
    "Fe<sup>2+</sup> ha perdido dos electrones. Quítalos del nivel ocupado con el mayor número cuántico principal, 4s, y queda [Ar]3d<sup>6</sup>.");
  mc("1.5-4", "Which description of the three 2p electrons in a ground-state N atom follows Hund's rule?", "¿Qué descripción de los tres electrones 2p de un átomo de N en estado fundamental sigue la regla de Hund?", [
    o("One electron in each 2p orbital, with parallel spins", "Un electrón en cada orbital 2p, con espines paralelos", "", ""),
    o("A pair in one 2p orbital and a single electron in another", "Un par en un orbital 2p y un electrón en otro", "Pairing before all three equal-energy orbitals are singly occupied does not give the ground-state arrangement.", "Aparear antes de ocupar individualmente los tres orbitales de igual energía no da la distribución del estado fundamental."),
    o("All three electrons in a single 2p orbital", "Los tres electrones en un solo orbital 2p", "One orbital can hold at most two electrons, so this also violates the Pauli exclusion principle.", "Un orbital puede contener como máximo dos electrones, así que esta opción también viola el principio de exclusión de Pauli."),
    o("One in each orbital, with one spin opposite to the other two", "Uno en cada orbital, con un espín opuesto a los otros dos", "The ground-state arrangement in equal-energy orbitals has parallel spins before pairing.", "La distribución del estado fundamental en orbitales de igual energía tiene espines paralelos antes del apareamiento.")],
    "The 2p orbitals have equal energy in an isolated atom. Hund's rule gives three singly occupied orbitals with parallel spins for 2p<sup>3</sup>.",
    "Los orbitales 2p tienen igual energía en un átomo aislado. La regla de Hund da tres orbitales ocupados individualmente con espines paralelos para 2p<sup>3</sup>.");
  num("1.5-5", "What is the maximum total number of electrons in the n = 2 energy level?", "¿Cuál es el número total máximo de electrones en el nivel de energía n = 2?",
    8, "8", "count", {exact:true},
    "The n = 2 level contains one 2s orbital and three 2p orbitals. Each holds 2 electrons: (1 + 3) × 2 = 8. There is no 2d subshell.",
    "El nivel n = 2 contiene un orbital 2s y tres orbitales 2p. Cada uno contiene 2 electrones: (1 + 3) × 2 = 8. No existe un subnivel 2d.");
  mc("1.5-6", "Two electrons occupy the same atomic orbital. Which condition is required by the Pauli exclusion principle?", "Dos electrones ocupan el mismo orbital atómico. ¿Qué condición exige el principio de exclusión de Pauli?", [
    o("Their spins are opposite.", "Sus espines son opuestos.", "", ""),
    o("Their spins are parallel.", "Sus espines son paralelos.", "Parallel spins are allowed in different orbitals, but two electrons sharing an orbital must have opposite spins.", "Se permiten espines paralelos en orbitales distintos, pero dos electrones en un mismo orbital deben tener espines opuestos."),
    o("They have different principal quantum numbers.", "Tienen distintos números cuánticos principales.", "Electrons in the same orbital share the same principal quantum number.", "Los electrones del mismo orbital comparten el mismo número cuántico principal."),
    o("One must be a valence electron and the other a core electron.", "Uno debe ser un electrón de valencia y el otro un electrón interno.", "Core or valence status depends on the occupied level. It does not replace the opposite-spin requirement.", "La clasificación como interno o de valencia depende del nivel ocupado. No reemplaza el requisito de espines opuestos.")],
    "Electrons in one orbital share three quantum numbers. They must differ in spin quantum number, so their spins are opposite.",
    "Los electrones de un orbital comparten tres números cuánticos. Deben diferir en el número cuántico de espín, así que sus espines son opuestos.");

  mc("1.6-1", "A simplified PES of a neutral ground-state atom has four peaks, ordered from highest to lowest binding energy. Their relative integrated areas are 2:2:6:1. Assume area is proportional to electron count. Which atom fits?", "Un espectro simplificado de fotoelectrones de un átomo neutro en estado fundamental tiene cuatro picos, ordenados de mayor a menor energía de ligadura. Sus áreas integradas relativas son 2:2:6:1. Supón que el área es proporcional al número de electrones. ¿Qué átomo corresponde?", [
    o("Na", "Na", "", ""),
    o("Ne", "Ne", "Ne has 10 electrons and configuration 1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>. It lacks the final one-electron 3s peak.", "Ne tiene 10 electrones y configuración 1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>. Le falta el pico final de un electrón 3s."),
    o("Mg", "Mg", "Mg has 12 electrons. Its final 3s peak corresponds to two electrons, not one.", "Mg tiene 12 electrones. Su pico final 3s corresponde a dos electrones, no a uno."),
    o("Al", "Al", "Al has 13 electrons and an occupied 3p subshell in addition to 3s. This pattern totals only 11 electrons.", "Al tiene 13 electrones y un subnivel 3p ocupado además de 3s. Este patrón suma solo 11 electrones.")],
    "The peak areas count 2 + 2 + 6 + 1 = 11 electrons. A neutral atom with 11 electrons is Na, with configuration 1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>1</sup>.",
    "Las áreas de los picos cuentan 2 + 2 + 6 + 1 = 11 electrones. Un átomo neutro con 11 electrones es Na, con configuración 1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>1</sup>.");
  num("1.6-2", "In a gas-phase atomic PES experiment, a 125.0 eV photon ejects an electron with kinetic energy 40.0 eV. Neglect recoil. What is the electron's binding energy?", "En un experimento de espectroscopía de fotoelectrones con átomos en fase gaseosa, un fotón de 125.0 eV expulsa un electrón con energía cinética de 40.0 eV. Desprecia el retroceso. ¿Cuál es la energía de ligadura del electrón?",
    125 - 40, "85.0", "eV", {decimals:1},
    "Energy conservation gives photon energy = binding energy + kinetic energy. Binding energy = 125.0 − 40.0 = 85.0 eV. Subtraction preserves one decimal place.",
    "La conservación de la energía da energía del fotón = energía de ligadura + energía cinética. Energía de ligadura = 125.0 − 40.0 = 85.0 eV. La resta conserva un decimal.");
  mc("1.6-3", "Which occupied subshell produces the lowest-binding-energy PES peak for a ground-state Na atom?", "¿Qué subnivel ocupado produce el pico de menor energía de ligadura en el espectro de fotoelectrones de un átomo de Na en estado fundamental?", [
    o("3s", "3s", "", ""),
    o("1s", "1s", "The 1s electrons are closest to the nucleus and most tightly bound. They give the highest-binding-energy peak.", "Los electrones 1s están más cerca del núcleo y más fuertemente ligados. Dan el pico de mayor energía de ligadura."),
    o("2s", "2s", "The 2s electrons are core electrons. They are more tightly bound than the outer 3s electron.", "Los electrones 2s son electrones internos. Están más fuertemente ligados que el electrón externo 3s."),
    o("2p", "2p", "The 2p peak represents six core electrons. Its larger area does not mean lower binding energy than 3s.", "El pico 2p representa seis electrones internos. Su mayor área no significa que tenga menor energía de ligadura que 3s.")],
    "Na is [Ne]3s<sup>1</sup>. Its outer 3s electron is farther from the nucleus and shielded by core electrons, so it takes the least energy to remove.",
    "Na es [Ne]3s<sup>1</sup>. Su electrón externo 3s está más lejos del núcleo y apantallado por los electrones internos, así que requiere la menor energía para extraerlo.");
  mc("1.6-4", "Why is the 1s PES peak of Mg at higher binding energy than the 1s peak of Na?", "¿Por qué el pico 1s del espectro de fotoelectrones de Mg tiene mayor energía de ligadura que el pico 1s de Na?", [
    o("Mg has more protons, with similar shielding of its 1s electrons.", "Mg tiene más protones, con apantallamiento similar de sus electrones 1s.", "", ""),
    o("Mg has fewer protons.", "Mg tiene menos protones.", "Mg has atomic number 12; Na has atomic number 11. Mg has more protons.", "Mg tiene número atómico 12; Na tiene número atómico 11. Mg tiene más protones."),
    o("Mg has only one 1s electron.", "Mg tiene solo un electrón 1s.", "Both ground-state atoms have a filled 1s subshell with two electrons. Electron count controls area, not this shift.", "Ambos átomos en estado fundamental tienen el subnivel 1s lleno con dos electrones. El número de electrones determina el área, no este desplazamiento."),
    o("Mg's 1s electrons are in a higher principal energy level.", "Los electrones 1s de Mg están en un nivel principal de energía mayor.", "The label 1s means n = 1 for both atoms.", "La etiqueta 1s significa n = 1 para ambos átomos.")],
    "Mg's greater nuclear charge increases attraction to the 1s electrons. With similar shielding, removing a 1s electron requires more energy in Mg.",
    "La mayor carga nuclear de Mg aumenta la atracción sobre los electrones 1s. Con apantallamiento similar, extraer un electrón 1s requiere más energía en Mg.");
  num("1.6-5", "In a simplified, calibrated PES of Ne, integrated peak area is proportional to the number of electrons in a subshell. What is the ratio area(2p)/area(2s)? Enter an exact number.", "En un espectro simplificado y calibrado de fotoelectrones de Ne, el área integrada de un pico es proporcional al número de electrones del subnivel. ¿Cuál es la relación área(2p)/área(2s)? Escribe un número exacto.",
    3, "3", "ratio", {exact:true},
    "Ne has 2s<sup>2</sup>2p<sup>6</sup>. The integrated area ratio is 6/2 = 3. A peak's position shows binding energy; its integrated area counts electrons in this model.",
    "Ne tiene 2s<sup>2</sup>2p<sup>6</sup>. La relación de áreas integradas es 6/2 = 3. La posición de un pico indica la energía de ligadura; su área integrada cuenta electrones en este modelo.");
  mc("1.6-6", "A simplified PES of a neutral ground-state atom has three peaks, from highest to lowest binding energy, with relative integrated areas 2:2:4. Assume area is proportional to electron count. Which configuration fits?", "Un espectro simplificado de fotoelectrones de un átomo neutro en estado fundamental tiene tres picos, de mayor a menor energía de ligadura, con áreas integradas relativas de 2:2:4. Supón que el área es proporcional al número de electrones. ¿Qué configuración corresponde?", [
    o("1s<sup>2</sup>2s<sup>2</sup>2p<sup>4</sup>", "1s<sup>2</sup>2s<sup>2</sup>2p<sup>4</sup>", "", ""),
    o("1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>", "1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>", "This would give areas 2:2:6 and ten electrons, rather than the eight shown.", "Esta configuración daría áreas de 2:2:6 y diez electrones, en lugar de los ocho indicados."),
    o("1s<sup>2</sup>2s<sup>4</sup>2p<sup>2</sup>", "1s<sup>2</sup>2s<sup>4</sup>2p<sup>2</sup>", "An s subshell holds at most two electrons. The 2s area cannot represent four electrons.", "Un subnivel s contiene como máximo dos electrones. El área 2s no puede representar cuatro electrones."),
    o("1s<sup>2</sup>2s<sup>2</sup>3s<sup>4</sup>", "1s<sup>2</sup>2s<sup>2</sup>3s<sup>4</sup>", "A 3s subshell cannot contain four electrons, and ground-state filling occupies 2p before 3s here.", "Un subnivel 3s no puede contener cuatro electrones y aquí el llenado en estado fundamental ocupa 2p antes de 3s.")],
    "The peaks correspond to 1s, 2s, and 2p. Their areas give 1s<sup>2</sup>2s<sup>2</sup>2p<sup>4</sup>, the eight-electron configuration of O.",
    "Los picos corresponden a 1s, 2s y 2p. Sus áreas dan 1s<sup>2</sup>2s<sup>2</sup>2p<sup>4</sup>, la configuración de ocho electrones de O.");

  mc("1.7-1", "Which neutral atom has the largest atomic radius: Na, Mg, Si, or Cl?", "¿Qué átomo neutro tiene el mayor radio atómico: Na, Mg, Si o Cl?", [
    o("Na", "Na", "", ""),
    o("Mg", "Mg", "Mg is to the right of Na in the same period. Greater effective nuclear charge pulls its valence electrons closer.", "Mg está a la derecha de Na en el mismo periodo. La mayor carga nuclear efectiva atrae sus electrones de valencia más cerca."),
    o("Si", "Si", "Si has more protons than Na while its valence electrons still occupy the n = 3 level. Its radius is smaller.", "Si tiene más protones que Na y sus electrones de valencia siguen en el nivel n = 3. Su radio es menor."),
    o("Cl", "Cl", "Cl is farthest right among these period-3 elements. Its stronger effective nuclear attraction makes its radius smaller.", "Cl está más a la derecha entre estos elementos del periodo 3. Su mayor atracción nuclear efectiva hace que su radio sea menor.")],
    "Across period 3, effective nuclear charge generally increases while the valence energy level stays n = 3. Radius decreases from Na toward Cl, so Na is largest.",
    "A lo largo del periodo 3, la carga nuclear efectiva generalmente aumenta mientras el nivel de valencia sigue siendo n = 3. El radio disminuye de Na hacia Cl, así que Na es el mayor.");
  mc("1.7-2", "The first ionization energy of Al is lower than that of Mg. Which explanation best accounts for this exception to the general trend?", "La primera energía de ionización de Al es menor que la de Mg. ¿Qué explicación describe mejor esta excepción a la tendencia general?", [
    o("Al loses a higher-energy 3p electron; Mg loses a 3s electron.", "Al pierde un electrón 3p de mayor energía; Mg pierde un electrón 3s.", "", ""),
    o("Al has fewer protons than Mg.", "Al tiene menos protones que Mg.", "Al has 13 protons and Mg has 12. The exception is about subshell energy, not fewer protons.", "Al tiene 13 protones y Mg tiene 12. La excepción se debe a la energía del subnivel, no a menos protones."),
    o("Al's removed electron is in n = 4.", "El electrón extraído de Al está en n = 4.", "Al's outer configuration is 3s<sup>2</sup>3p<sup>1</sup>. Its removed electron has n = 3.", "La configuración externa de Al es 3s<sup>2</sup>3p<sup>1</sup>. Su electrón extraído tiene n = 3."),
    o("Mg's first ionization removes a core electron.", "La primera ionización de Mg extrae un electrón interno.", "Mg first loses a valence 3s electron, not a core electron.", "Mg pierde primero un electrón de valencia 3s, no un electrón interno.")],
    "Al's first 3p electron is higher in energy and more shielded than Mg's 3s electrons. It is easier to remove despite Al's greater nuclear charge.",
    "El primer electrón 3p de Al tiene mayor energía y más apantallamiento que los electrones 3s de Mg. Es más fácil extraerlo a pesar de la mayor carga nuclear de Al.");
  mc("1.7-3", "Why is the first ionization energy of O slightly lower than that of N?", "¿Por qué la primera energía de ionización de O es ligeramente menor que la de N?", [
    o("O has a paired 2p electron whose repulsion makes removal easier.", "O tiene un electrón 2p apareado cuya repulsión facilita su extracción.", "", ""),
    o("O has a lower nuclear charge than N.", "O tiene menor carga nuclear que N.", "O has 8 protons and N has 7. A lower nuclear charge is not the cause.", "O tiene 8 protones y N tiene 7. Una menor carga nuclear no es la causa."),
    o("N loses a 1s electron first.", "N pierde primero un electrón 1s.", "Both atoms first lose a valence 2p electron. A 1s electron is much more tightly bound.", "Ambos átomos pierden primero un electrón de valencia 2p. Un electrón 1s está mucho más fuertemente ligado."),
    o("O has a full 2p subshell.", "O tiene el subnivel 2p lleno.", "O has 2p<sup>4</sup>, not 2p<sup>6</sup>. One orbital has a pair and two have single electrons.", "O tiene 2p<sup>4</sup>, no 2p<sup>6</sup>. Un orbital tiene un par y dos tienen electrones individuales.")],
    "N has 2p<sup>3</sup>, with three singly occupied orbitals. O has 2p<sup>4</sup>, introducing a pair. Repulsion within that pair lowers the energy needed to remove one electron.",
    "N tiene 2p<sup>3</sup>, con tres orbitales ocupados individualmente. O tiene 2p<sup>4</sup>, lo que introduce un par. La repulsión dentro de ese par reduce la energía necesaria para extraer un electrón.");
  mc("1.7-4", "Which ion has the smallest ionic radius in this isoelectronic series?", "¿Qué ion tiene el menor radio iónico en esta serie isoelectrónica?", [
    o("Mg<sup>2+</sup>", "Mg<sup>2+</sup>", "", ""),
    o("Na<sup>+</sup>", "Na<sup>+</sup>", "It has the same 10 electrons as Mg<sup>2+</sup>, but fewer protons, so its attraction is weaker and radius is larger.", "Tiene los mismos 10 electrones que Mg<sup>2+</sup>, pero menos protones, así que su atracción es menor y su radio es mayor."),
    o("F<sup>−</sup>", "F<sup>−</sup>", "Its 9 protons attract the same 10 electrons less strongly than the 12 protons of Mg<sup>2+</sup>.", "Sus 9 protones atraen los mismos 10 electrones con menos fuerza que los 12 protones de Mg<sup>2+</sup>."),
    o("O<sup>2−</sup>", "O<sup>2−</sup>", "It has the fewest protons, 8, attracting 10 electrons. It is the largest ion in this series.", "Tiene la menor cantidad de protones, 8, que atraen a 10 electrones. Es el ion más grande de esta serie.")],
    "All four ions have 10 electrons. In an isoelectronic series, more protons pull the same electron distribution closer. Mg<sup>2+</sup> has the most protons, 12.",
    "Los cuatro iones tienen 10 electrones. En una serie isoelectrónica, más protones atraen la misma distribución electrónica más cerca. Mg<sup>2+</sup> tiene más protones, 12.");
  num("1.7-5", "A main-group element has successive ionization energies 590, 1145, 4912, and 6491 kJ/mol. How many valence electrons does its neutral atom have?", "Un elemento del grupo principal tiene energías de ionización sucesivas de 590, 1145, 4912 y 6491 kJ/mol. ¿Cuántos electrones de valencia tiene su átomo neutro?",
    2, "2", "count", {exact:true},
    "The largest jump is between the second and third ionizations, from 1145 to 4912 kJ/mol. Two valence electrons are removed before the much more tightly bound core electron.",
    "El mayor salto está entre la segunda y la tercera ionización, de 1145 a 4912 kJ/mol. Se extraen dos electrones de valencia antes del electrón interno, mucho más fuertemente ligado.");
  num("1.7-6", "Na<sup>+</sup> is much smaller than neutral Na. By how many electrons does the total electron count decrease when Na forms Na<sup>+</sup>?", "Na<sup>+</sup> es mucho más pequeño que Na neutro. ¿En cuántos electrones disminuye el número total de electrones cuando Na forma Na<sup>+</sup>?",
    1, "1", "count", {exact:true},
    "Na has 11 electrons, [Ne]3s<sup>1</sup>. Losing one gives Na<sup>+</sup> with 10 electrons, [Ne]. The n = 3 level becomes empty, helping explain the large decrease in radius.",
    "Na tiene 11 electrones, [Ne]3s<sup>1</sup>. Perder uno da Na<sup>+</sup> con 10 electrones, [Ne]. El nivel n = 3 queda vacío, lo que ayuda a explicar la gran disminución del radio.");

  mc("1.8-1", "What is the simplest neutral formula formed from Ca<sup>2+</sup> and N<sup>3−</sup>?", "¿Cuál es la fórmula neutra más sencilla formada por Ca<sup>2+</sup> y N<sup>3−</sup>?", [
    o("Ca<sub>3</sub>N<sub>2</sub>", "Ca<sub>3</sub>N<sub>2</sub>", "", ""),
    o("CaN", "CaN", "One of each ion gives net charge +2 − 3 = −1, not zero.", "Un ion de cada tipo da una carga neta de +2 − 3 = −1, no cero."),
    o("Ca<sub>2</sub>N<sub>3</sub>", "Ca<sub>2</sub>N<sub>3</sub>", "Two calcium ions and three nitride ions give +4 − 9 = −5. Subscripts must balance charge.", "Dos iones de calcio y tres iones nitruro dan +4 − 9 = −5. Los subíndices deben balancear la carga."),
    o("Ca<sub>3</sub>N", "Ca<sub>3</sub>N", "Three calcium ions and one nitride ion give +6 − 3 = +3, not zero.", "Tres iones de calcio y un ion nitruro dan +6 − 3 = +3, no cero.")],
    "The least common charge magnitude is 6. Three Ca<sup>2+</sup> ions give +6 and two N<sup>3−</sup> ions give −6, so Ca<sub>3</sub>N<sub>2</sub> is neutral.",
    "La menor magnitud de carga común es 6. Tres iones Ca<sup>2+</sup> dan +6 y dos iones N<sup>3−</sup> dan −6, así que Ca<sub>3</sub>N<sub>2</sub> es neutro.");
  num("1.8-2", "In the simplest neutral formula made from Al<sup>3+</sup> and SO<sub>4</sub><sup>2−</sup>, how many sulfate groups occur per formula unit?", "En la fórmula neutra más sencilla formada por Al<sup>3+</sup> y SO<sub>4</sub><sup>2−</sup>, ¿cuántos grupos sulfato hay por unidad fórmula?",
    3, "3", "count", {exact:true},
    "Two Al<sup>3+</sup> ions supply +6, balanced by three SO<sub>4</sub><sup>2−</sup> ions supplying −6. The formula is Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub>, with 3 sulfate groups.",
    "Dos iones Al<sup>3+</sup> aportan +6, balanceado por tres iones SO<sub>4</sub><sup>2−</sup> que aportan −6. La fórmula es Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub>, con 3 grupos sulfato.");
  num("1.8-3", "A sample contains 0.250 mol of MgCl<sub>2</sub> formula units. How many moles of Cl<sup>−</sup> ions does it contain?", "Una muestra contiene 0.250 mol de unidades fórmula de MgCl<sub>2</sub>. ¿Cuántos moles de iones Cl<sup>−</sup> contiene?",
    0.250 * 2, "0.500", "mol", {sf:3},
    "There are two chloride ions per formula unit: 0.250 mol × 2 = 0.500 mol of Cl<sup>−</sup>. The subscript counts ions; it does not change each chloride ion's charge.",
    "Hay dos iones cloruro por unidad fórmula: 0.250 mol × 2 = 0.500 mol de Cl<sup>−</sup>. El subíndice cuenta iones; no cambia la carga de cada ion cloruro.");
  mc("1.8-4", "A neutral Br atom forms the common monatomic ion Br<sup>−</sup>. Which electron change occurs?", "Un átomo neutro de Br forma el ion monoatómico común Br<sup>−</sup>. ¿Qué cambio de electrones ocurre?", [
    o("It gains 1 electron, going from 7 to 8 valence electrons.", "Gana 1 electrón y pasa de 7 a 8 electrones de valencia.", "", ""),
    o("It loses 1 electron, going from 7 to 6 valence electrons.", "Pierde 1 electrón y pasa de 7 a 6 electrones de valencia.", "Losing an electron would make the atom positively charged, not Br<sup>−</sup>.", "Perder un electrón haría que el átomo tuviera carga positiva, no Br<sup>−</sup>."),
    o("It gains 7 electrons to reach an octet.", "Gana 7 electrones para alcanzar un octeto.", "Br already has seven valence electrons. It needs only one more for eight.", "Br ya tiene siete electrones de valencia. Solo necesita uno más para tener ocho."),
    o("It loses 7 protons to become negatively charged.", "Pierde 7 protones para adquirir carga negativa.", "Forming a chemical ion changes electrons, not the nucleus. Removing protons would change the element.", "Formar un ion químico cambia los electrones, no el núcleo. Quitar protones cambiaría el elemento.")],
    "Br is in group 17 and has 7 valence electrons. Gaining one completes the valence level and gives a charge of <sup>1−</sup> without changing its proton count.",
    "Br está en el grupo 17 y tiene 7 electrones de valencia. Ganar uno completa el nivel de valencia y da una carga de <sup>1−</sup> sin cambiar el número de protones.");
  mc("1.8-5", "What does the formula NaCl describe in a solid sample of sodium chloride?", "¿Qué describe la fórmula NaCl en una muestra sólida de cloruro de sodio?", [
    o("A 1:1 ratio of Na<sup>+</sup> to Cl<sup>−</sup> in an extended ionic lattice", "Una relación 1:1 de Na<sup>+</sup> a Cl<sup>−</sup> en una red iónica extendida", "", ""),
    o("Separate molecules, each with one neutral Na and one neutral Cl atom", "Moléculas separadas, cada una con un átomo neutro de Na y uno neutro de Cl", "Solid NaCl is an ionic lattice. Its formula unit gives an ion ratio, not a discrete neutral-atom molecule.", "El NaCl sólido es una red iónica. Su unidad fórmula da una relación de iones, no una molécula discreta de átomos neutros."),
    o("An equal mass of sodium and chlorine", "Una masa igual de sodio y cloro", "A 1:1 ion ratio does not mean equal masses. Na and Cl have different atomic masses.", "Una relación 1:1 de iones no significa masas iguales. Na y Cl tienen masas atómicas diferentes."),
    o("A 2:1 ratio of Na<sup>+</sup> to Cl<sup>−</sup>", "Una relación 2:1 de Na<sup>+</sup> a Cl<sup>−</sup>", "Two sodium ions per chloride would give a positive net charge. The formula shows a 1:1 ratio.", "Dos iones de sodio por ion cloruro darían una carga neta positiva. La fórmula muestra una relación 1:1.")],
    "Oppositely charged ions form an extended lattice. One Na<sup>+</sup> balances one Cl<sup>−</sup>, so the simplest ratio is 1:1 and the formula is NaCl.",
    "Los iones de cargas opuestas forman una red extendida. Un Na<sup>+</sup> balancea un Cl<sup>−</sup>, así que la relación más sencilla es 1:1 y la fórmula es NaCl.");
  mc("1.8-6", "K has ground-state configuration [Ar]4s<sup>1</sup>. Which configuration results when it forms its common monatomic ion?", "K tiene configuración de estado fundamental [Ar]4s<sup>1</sup>. ¿Qué configuración resulta cuando forma su ion monoatómico común?", [
    o("K<sup>+</sup>: [Ar]", "K<sup>+</sup>: [Ar]", "", ""),
    o("K<sup>−</sup>: [Ar]4s<sup>2</sup>", "K<sup>−</sup>: [Ar]4s<sup>2</sup>", "Group-1 potassium commonly loses its one valence electron. Gaining one does not produce its common ion.", "El potasio del grupo 1 comúnmente pierde su único electrón de valencia. Ganar uno no produce su ion común."),
    o("K<sup>2+</sup>: [Ar]", "K<sup>2+</sup>: [Ar]", "Removing one electron reaches [Ar] and gives <sup>+1</sup>, not <sup>+2</sup>. A second removal would take a core electron.", "Quitar un electrón alcanza [Ar] y da <sup>+1</sup>, no <sup>+2</sup>. Una segunda extracción quitaría un electrón interno."),
    o("K<sup>+</sup>: [Ne]", "K<sup>+</sup>: [Ne]", "K has 19 electrons. Losing one leaves 18, the electron count of Ar, not the 10 of Ne.", "K tiene 19 electrones. Perder uno deja 18, el número de electrones de Ar, no los 10 de Ne.")],
    "Losing the outer 4s electron leaves the filled [Ar] configuration. K keeps 19 protons and now has 18 electrons, giving K<sup>+</sup>.",
    "Perder el electrón externo 4s deja la configuración llena [Ar]. K conserva 19 protones y ahora tiene 18 electrones, lo que da K<sup>+</sup>.");

  var units = [
    ["g", "g", "g"], ["mol", "mol", "mol"], ["g/mol", "g/mol", "g/mol"], ["%", "%", "%"],
    ["u", "u", "u"], ["eV", "eV", "eV"], ["kJ/mol", "kJ/mol", "kJ/mol"],
    ["atoms", "atoms", "átomos"], ["count", "count", "cantidad"], ["ratio", "no units", "sin unidades"]
  ].map(function (row) { return {id:row[0], label:p(row[1], row[2])}; });
  var copy = {title:"AP Chemistry Unit 1 Practice", es:{
    "AP Chemistry · Unit 1":"Química AP · Unidad 1",
    "AP Chemistry Unit 1 Practice":"Práctica de la unidad 1 de Química AP",
    "ZornScience home":"Inicio de ZornScience", "Activity tools":"Herramientas de la actividad",
    "Instructions":"Instrucciones", "Close":"Cerrar", "Close instructions":"Cerrar instrucciones",
    "Share":"Compartir", "Share activity":"Compartir actividad", "Share this activity":"Compartir esta actividad",
    "Close share options":"Cerrar opciones para compartir", "Share link":"Enlace para compartir", "Copy link":"Copiar enlace", "Email":"Correo electrónico",
    "Link copied.":"Enlace copiado.", "Link selected. Copy it with Ctrl+C or Command+C.":"Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
    "Share a fresh activity. Your answers and results are not included.":"Comparte una actividad nueva. Tus respuestas y resultados no se incluyen.",
    "Catch up at your own pace.":"Ponte al corriente a tu ritmo.",
    "Choose one topic for six questions, or Mixed review for all 48. Read the feedback after each answer.":"Elige un tema para seis preguntas o Repaso mixto para las 48. Lee la retroalimentación después de cada respuesta.",
    "Topic":"Tema", "Mixed review":"Repaso mixto", "Start practice":"Comenzar práctica", "Choose a topic":"Selección de un tema",
    "No timer. Use scratch paper and a calculator. All the atomic masses you need are below.":"Sin límite de tiempo. Usa papel y calculadora. Todas las masas atómicas que necesitas están abajo.",
    "Choose a topic, then start. Mixed review includes all eight topics.":"Elige un tema y comienza. El repaso mixto incluye los ocho temas.",
    "Select one answer, or enter a number and choose its unit. For a count, choose count; for a ratio, choose no units.":"Selecciona una respuesta o escribe un número y elige su unidad. Para un conteo, elige cantidad; para una relación, elige sin unidades.",
    "Submit once per question. Read the explanation, then continue. Your score counts correct answers; a significant figure note does not remove a point.":"Envía una respuesta por pregunta. Lee la explicación y continúa. Tu puntaje cuenta las respuestas correctas; una nota sobre cifras significativas no quita un punto.",
    "At the end, Try again shuffles the questions and answer choices. Choose another topic to build a new set.":"Al terminar, Intentar de nuevo cambia el orden de las preguntas y las opciones. Elige otro tema para crear una serie nueva.",
    "Reference":"Consulta", "Atomic masses (g/mol)":"Masas atómicas (g/mol)",
    "Use these values. Keep extra digits in your work and round only the final answer. Isotope masses in model questions are given in the prompt.":"Usa estos valores. Conserva dígitos adicionales en tus cálculos y redondea solo la respuesta final. Las masas isotópicas de las preguntas modelo se dan en el enunciado.",
    "Avogadro constant":"Constante de Avogadro", "Scientific notation: you may type 1.51e23 in the number field.":"Notación científica: puedes escribir 1.51e23 en el campo numérico.",
    "Your answers stay in this tab. No account needed.":"Tus respuestas se quedan en esta pestaña. No necesitas una cuenta.",
    "← Back to the lesson":"← Volver a la lección", "Check answer":"Comprobar respuesta", "Next question":"Siguiente pregunta", "See results":"Ver resultados",
    "Question {n} of {total}":"Pregunta {n} de {total}", "{n} of {total} correct":"{n} de {total} correctas", "Set progress":"Avance de la serie",
    "Numerical answer":"Respuesta numérica", "Unit":"Unidad", "Choose a unit":"Elige una unidad", "Choose one answer.":"Elige una respuesta.",
    "Use {n} significant figures.":"Usa {n} cifras significativas.", "Use {n} decimal places.":"Usa {n} decimales.", "Use 1 decimal place.":"Usa 1 decimal.",
    "Enter an exact whole number.":"Escribe un número entero exacto.", "Enter a number using a decimal point or scientific notation.":"Escribe un número con punto decimal o notación científica.",
    "Select an answer first.":"Primero selecciona una respuesta.", "Choose a unit first.":"Primero elige una unidad.",
    "Correct.":"Correcto.", "Incorrect.":"Incorrecto.", "Correct value; check significant figures.":"Valor correcto; revisa las cifras significativas.",
    "Correct value; check decimal places.":"Valor correcto; revisa los decimales.",
    "Your value is within tolerance, but the unit is incorrect.":"Tu valor está dentro de la tolerancia, pero la unidad es incorrecta.",
    "The unit is incorrect. Use {unit}.":"La unidad es incorrecta. Usa {unit}.",
    "Use {n} significant figures in your final answer.":"Usa {n} cifras significativas en tu respuesta final.",
    "Round your final answer to {n} decimal places.":"Redondea tu respuesta final a {n} decimales.",
    "Correct answer: ":"Respuesta correcta: ", "Your set is complete":"Tu serie está completa", "Try again":"Intentar de nuevo", "Choose another topic":"Elegir otro tema",
    "Results by topic":"Resultados por tema", "Review these questions":"Repaso de estas preguntas", "All correct. Try another topic when you are ready.":"Todo correcto. Intenta otro tema cuando quieras.",
    "{score} of {total} correct ({percent}%).":"{score} de {total} correctas ({percent}%).", "{n} questions":"{n} preguntas",
    "Aligned practice for AP Chemistry CED topics 1.1 to 1.8. Original ZornScience questions.":"Práctica alineada con los temas 1.1 a 1.8 del CED de Química AP. Preguntas originales de ZornScience."
  }};
  var bank = {topics:topics, questions:questions, units:units, copy:copy};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit1-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
