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
    ["2.1", "2.1 Types of Chemical Bonds", "2.1 Tipos de enlaces químicos"],
    ["2.2", "2.2 Intramolecular Force and Potential Energy", "2.2 Fuerza intramolecular y energía potencial"],
    ["2.3", "2.3 Structure of Ionic Solids", "2.3 Estructura de los sólidos iónicos"],
    ["2.4", "2.4 Structure of Metals and Alloys", "2.4 Estructura de los metales y las aleaciones"],
    ["2.5", "2.5 Lewis Diagrams", "2.5 Diagramas de Lewis"],
    ["2.6", "2.6 Resonance and Formal Charge", "2.6 Resonancia y carga formal"],
    ["2.7", "2.7 VSEPR and Hybridization", "2.7 VSEPR e hibridación"]
  ].map(function (row) { return {id:row[0], title:p(row[1], row[2])}; });

  mc("2.1-1", "Which interaction holds the particles together in solid NaCl?", "¿Qué interacción mantiene unidas las partículas en NaCl sólido?", [
    o("Electrostatic attraction between Na<sup>+</sup> and Cl<sup>−</sup> ions", "Atracción electrostática entre iones Na<sup>+</sup> y Cl<sup>−</sup>", "", ""),
    o("Equal sharing of an electron pair between neutral atoms", "Compartición equitativa de un par de electrones entre átomos neutros", "Equal sharing describes a nonpolar covalent bond. The particles in solid NaCl are ions.", "La compartición equitativa describe un enlace covalente no polar. Las partículas del NaCl sólido son iones."),
    o("Attraction between separate NaCl molecules", "Atracción entre moléculas separadas de NaCl", "Solid NaCl forms an extended ionic lattice rather than separate molecules.", "El NaCl sólido forma una red cristalina iónica extendida en lugar de moléculas separadas."),
    o("A sea of electrons surrounding metal atoms", "Un mar de electrones que rodea átomos metálicos", "A sea of electrons models metallic bonding. NaCl contains oppositely charged ions.", "Un mar de electrones representa el enlace metálico. El NaCl contiene iones de cargas opuestas.")],
    "NaCl is ionic. Electron transfer accounts for ion formation; attraction between opposite charges holds the solid together.",
    "El NaCl es iónico. La transferencia de electrones explica la formación de iones; la atracción entre cargas opuestas mantiene unido el sólido.");
  mc("2.1-2", "Cl is more electronegative than H. Which description best models the bond within an HCl molecule?", "Cl es más electronegativo que H. ¿Qué descripción representa mejor el enlace dentro de una molécula de HCl?", [
    o("Polar covalent, with shared electrons drawn closer to Cl", "Covalente polar, con los electrones compartidos más cerca de Cl", "", ""),
    o("Nonpolar covalent, with equal electron sharing", "Covalente no polar, con compartición equitativa de electrones", "Different electronegativities make the electron distribution unequal in this bond.", "Las electronegatividades diferentes hacen que la distribución electrónica sea desigual en este enlace."),
    o("Ionic, with complete electron transfer in the molecule", "Iónico, con transferencia completa de electrones en la molécula", "The bond within a gaseous HCl molecule is described by unequal sharing, not complete transfer.", "El enlace dentro de una molécula gaseosa de HCl se describe por compartición desigual, no por transferencia completa."),
    o("Metallic, with electrons free to move through a lattice", "Metálico, con electrones libres para moverse por una red cristalina", "HCl is a molecule of nonmetals. It does not have the extended electron sea of a metal.", "El HCl es una molécula de no metales. No tiene el mar de electrones extendido de un metal.")],
    "Both nuclei attract the shared electrons, but Cl attracts them more strongly. This creates partial charges and a polar covalent bond.",
    "Ambos núcleos atraen los electrones compartidos, pero Cl los atrae con más fuerza. Esto crea cargas parciales y un enlace covalente polar.");
  mc("2.1-3", "Why is the bond in Cl<sub>2</sub> nonpolar covalent?", "¿Por qué el enlace en Cl<sub>2</sub> es covalente no polar?", [
    o("The identical atoms attract the shared electrons equally.", "Los átomos idénticos atraen por igual los electrones compartidos.", "", ""),
    o("Each atom transfers an electron completely to the other.", "Cada átomo transfiere un electrón por completo al otro.", "Complete transfer does not describe this bond. The atoms share a pair of electrons.", "La transferencia completa no describe este enlace. Los átomos comparten un par de electrones."),
    o("Chlorine has no valence electrons to share.", "El cloro no tiene electrones de valencia para compartir.", "Each Cl atom has seven valence electrons and contributes to a shared pair.", "Cada átomo de Cl tiene siete electrones de valencia y contribuye a un par compartido."),
    o("The molecule contains a mobile sea of electrons.", "La molécula contiene un mar de electrones móvil.", "An electron sea describes metallic bonding in an extended solid, not this diatomic molecule.", "Un mar de electrones describe el enlace metálico en un sólido extendido, no esta molécula diatómica.")],
    "The electronegativity difference is zero for identical atoms. Neither end of the bond is favored, so the sharing is nonpolar.",
    "La diferencia de electronegatividad es cero para átomos idénticos. Ningún extremo del enlace se favorece, así que la compartición es no polar.");
  num("2.1-4", "On the Pauling scale, H has electronegativity 2.20 and F has 3.98. What is the magnitude of the electronegativity difference for H−F?", "En la escala de Pauling, H tiene electronegatividad de 2.20 y F de 3.98. ¿Cuál es la magnitud de la diferencia de electronegatividad para H−F?",
    3.98 - 2.20, "1.78", "ratio", {sf:3},
    "Subtract the smaller value from the larger: 3.98 − 2.20 = 1.78, with no units. This difference indicates unequal electron sharing; no single sharp cutoff classifies every bond.",
    "Resta el valor menor del mayor: 3.98 − 2.20 = 1.78, sin unidades. Esta diferencia indica compartición desigual de electrones; ningún límite único clasifica todos los enlaces.");
  mc("2.1-5", "Diamond consists of C atoms covalently bonded throughout a continuous three-dimensional structure. Which bonding model fits?", "El diamante consta de átomos de C unidos por enlaces covalentes en una estructura tridimensional continua. ¿Qué modelo de enlace corresponde?", [
    o("Network covalent solid", "Sólido covalente de red", "", ""),
    o("Molecular solid of separate C molecules", "Sólido molecular de moléculas separadas de C", "The prompt describes a continuous network, not separate molecules held by intermolecular forces.", "El enunciado describe una red continua, no moléculas separadas unidas por fuerzas intermoleculares."),
    o("Ionic lattice of positive and negative carbon ions", "Red cristalina iónica de iones positivos y negativos de carbono", "The connections are shared-electron covalent bonds, not attractions between opposite ions.", "Las conexiones son enlaces covalentes de electrones compartidos, no atracciones entre iones opuestos."),
    o("Metallic lattice with a mobile electron sea", "Red cristalina metálica con un mar de electrones móvil", "The electrons in this model form covalent bonds rather than a mobile metallic electron sea.", "Los electrones de este modelo forman enlaces covalentes en lugar de un mar de electrones metálico móvil.")],
    "Covalent bonds connect atoms across the entire solid. This is a network covalent solid, rather than a collection of discrete molecules.",
    "Los enlaces covalentes conectan átomos por todo el sólido. Es un sólido covalente de red, en lugar de un conjunto de moléculas discretas.");
  mc("2.1-6", "Which description correctly distinguishes the bonding in solid NH<sub>4</sub>Cl?", "¿Qué descripción distingue correctamente los enlaces en NH<sub>4</sub>Cl sólido?", [
    o("Covalent N−H bonds within NH<sub>4</sub><sup>+</sup> and ionic attraction to Cl<sup>−</sup>", "Enlaces N−H covalentes dentro de NH<sub>4</sub><sup>+</sup> y atracción iónica hacia Cl<sup>−</sup>", "", ""),
    o("Ionic N−H bonds within NH<sub>4</sub><sup>+</sup> and covalent attraction to Cl<sup>−</sup>", "Enlaces N−H iónicos dentro de NH<sub>4</sub><sup>+</sup> y atracción covalente hacia Cl<sup>−</sup>", "This reverses the roles: electrons are shared within ammonium, while opposite ions attract in the lattice.", "Esto invierte las funciones: los electrones se comparten dentro del amonio, mientras que los iones opuestos se atraen en la red cristalina."),
    o("Only ionic bonding, because the whole compound is an ionic solid", "Solo enlace iónico, porque todo el compuesto es un sólido iónico", "The solid is ionic overall, but a polyatomic ion retains covalent bonds within it.", "El sólido es iónico en conjunto, pero un ion poliatómico conserva enlaces covalentes en su interior."),
    o("Only metallic bonding, because charged particles are present", "Solo enlace metálico, porque hay partículas cargadas", "Charged particles alone do not imply metallic bonding. There is no metallic electron sea here.", "Las partículas cargadas por sí solas no implican enlace metálico. Aquí no hay un mar de electrones metálico.")],
    "A polyatomic ion can contain covalent bonds while participating in an ionic lattice. Distinguish bonding within the ion from attraction between ions.",
    "Un ion poliatómico puede contener enlaces covalentes y participar en una red cristalina iónica. Distingue los enlaces dentro del ion de la atracción entre iones.");

  num("2.2-1", "A model potential energy curve has its minimum at 154 pm and −350 kJ/mol, with separated atoms at 0 kJ/mol. What is the equilibrium bond length?", "Una curva modelo de energía potencial tiene su mínimo en 154 pm y −350 kJ/mol, con los átomos separados en 0 kJ/mol. ¿Cuál es la longitud de enlace de equilibrio?",
    154, "154", "pm", {sf:3},
    "Read the horizontal coordinate of the minimum: 154 pm. At this separation, attractive and repulsive forces balance, so the net force is zero.",
    "Lee la coordenada horizontal del mínimo: 154 pm. A esta separación, las fuerzas de atracción y repulsión se equilibran, así que la fuerza neta es cero.");
  num("2.2-2", "A model bond has minimum potential energy −350 kJ/mol at 154 pm. Separated atoms have energy 0 kJ/mol. How much energy per mole is needed to break these bonds from the minimum?", "Un enlace modelo tiene energía potencial mínima de −350 kJ/mol a 154 pm. Los átomos separados tienen energía de 0 kJ/mol. ¿Cuánta energía por mol se necesita para romper estos enlaces desde el mínimo?",
    0 - (-350), "350.", "kJ/mol", {sf:3},
    "Bond dissociation requires energy input: ΔE = 0 − (−350) = +350 kJ/mol. The well depth is a positive energy magnitude, not the negative potential energy at the minimum.",
    "La disociación del enlace requiere un aporte de energía: ΔE = 0 − (−350) = +350 kJ/mol. La profundidad del pozo es una magnitud de energía positiva, no la energía potencial negativa del mínimo.");
  num("2.2-3", "For a model bond with minimum −350 kJ/mol at 154 pm and separated-atom energy 0 kJ/mol, what energy is needed to dissociate 0.250 mol of bonds?", "Para un enlace modelo con mínimo de −350 kJ/mol a 154 pm y energía de los átomos separados de 0 kJ/mol, ¿qué energía se necesita para disociar 0.250 mol de enlaces?",
    0.250 * 350, "87.5", "kJ", {sf:3},
    "The dissociation energy is 350 kJ/mol. Multiply by the amount of bonds: 0.250 mol × 350 kJ/mol = 87.5 kJ. The requested unit is energy, not energy per mole.",
    "La energía de disociación es 350 kJ/mol. Multiplica por la cantidad de enlaces: 0.250 mol × 350 kJ/mol = 87.5 kJ. La unidad solicitada es energía, no energía por mol.");
  questions.forEach(function (q) { if (["2.2-1", "2.2-2", "2.2-3"].indexOf(q.id) >= 0) q.curve = true; });
  mc("2.2-4", "Two bonded atoms are pushed to a separation much shorter than their equilibrium bond length. What is the direction of the net force?", "Dos átomos enlazados se acercan a una separación mucho menor que su longitud de enlace de equilibrio. ¿Cuál es la dirección de la fuerza neta?", [
    o("It pushes the atoms apart because repulsion dominates.", "Separa los átomos porque predomina la repulsión.", "", ""),
    o("It pulls the atoms closer because attraction always increases as distance decreases.", "Acerca los átomos porque la atracción siempre aumenta al disminuir la distancia.", "At very short separation, repulsive interactions dominate. Attraction alone cannot explain the steep energy rise.", "A separaciones muy cortas, predominan las interacciones repulsivas. La atracción sola no explica el aumento pronunciado de energía."),
    o("It is zero because the atoms are still bonded.", "Es cero porque los átomos siguen enlazados.", "Zero net force occurs at the equilibrium minimum, not at every separation within a bond.", "La fuerza neta es cero en el mínimo de equilibrio, no en cada separación dentro de un enlace."),
    o("It changes the identity of the atoms.", "Cambia la identidad de los átomos.", "Bond compression changes electronic interactions and potential energy, not the proton counts that identify the elements.", "Comprimir el enlace cambia las interacciones electrónicas y la energía potencial, no el número de protones que identifica los elementos.")],
    "The short-distance side of a bond potential curve rises steeply. Repulsion between overlapping electron distributions and between nuclei produces a net force toward greater separation.",
    "El lado de distancias cortas de una curva de energía potencial del enlace sube rápidamente. La repulsión entre distribuciones electrónicas superpuestas y entre núcleos produce una fuerza neta hacia una mayor separación.");
  mc("2.2-5", "Compare typical C−C, C=C, and C≡C bonds. Relative to C−C, where is the potential energy minimum for C≡C?", "Compara enlaces típicos C−C, C=C y C≡C. Con respecto a C−C, ¿dónde está el mínimo de energía potencial de C≡C?", [
    o("At a shorter distance and in a deeper well", "A una distancia menor y en un pozo más profundo", "", ""),
    o("At a longer distance and in a deeper well", "A una distancia mayor y en un pozo más profundo", "The triple bond is generally stronger, but it is also shorter, so its minimum shifts to smaller distance.", "El enlace triple suele ser más fuerte, pero también es más corto, así que su mínimo se desplaza a una distancia menor."),
    o("At a shorter distance and in a shallower well", "A una distancia menor y en un pozo menos profundo", "A shorter triple bond has a greater dissociation energy. A shallower well would indicate a weaker bond.", "Un enlace triple más corto tiene mayor energía de disociación. Un pozo menos profundo indicaría un enlace más débil."),
    o("At the same distance and depth because the atoms are all carbon", "A la misma distancia y profundidad porque todos los átomos son de carbono", "Bond order affects both bond length and bond strength even when the element pair is unchanged.", "El orden de enlace afecta tanto la longitud como la fuerza del enlace aun cuando el par de elementos no cambia.")],
    "For the same atom pair, increasing bond order generally shortens and strengthens the bond. A stronger bond has a greater well depth measured from separated atoms.",
    "Para el mismo par de átomos, aumentar el orden de enlace suele acortar y fortalecer el enlace. Un enlace más fuerte tiene una mayor profundidad del pozo medida desde los átomos separados.");
  mc("2.2-6", "I is larger than F. When comparing H−I with H−F, which change in the potential energy minimum is expected from atomic size?", "I es más grande que F. Al comparar H−I con H−F, ¿qué cambio en el mínimo de energía potencial se espera por el tamaño atómico?", [
    o("The H−I minimum lies at a greater internuclear distance.", "El mínimo de H−I está a una distancia internuclear mayor.", "", ""),
    o("The H−I minimum lies at a smaller internuclear distance.", "El mínimo de H−I está a una distancia internuclear menor.", "The larger iodine atom generally produces a longer bond, not a shorter one.", "El átomo de yodo más grande suele producir un enlace más largo, no más corto."),
    o("The H−I minimum must be at zero distance.", "El mínimo de H−I debe estar a distancia cero.", "Nuclear and electron repulsions prevent the stable bond minimum from occurring at zero separation.", "Las repulsiones nucleares y electrónicas impiden que el mínimo estable del enlace ocurra a separación cero."),
    o("The minima must occur at the same distance because both bonds contain H.", "Los mínimos deben estar a la misma distancia porque ambos enlaces contienen H.", "Bond length depends on both atoms. Changing the size of the other atom changes the equilibrium distance.", "La longitud de enlace depende de ambos átomos. Cambiar el tamaño del otro átomo cambia la distancia de equilibrio.")],
    "A larger bonded atom generally increases equilibrium bond length. The horizontal shift follows atomic size; size alone does not determine the exact well depth.",
    "Un átomo enlazado más grande suele aumentar la longitud de enlace de equilibrio. El desplazamiento horizontal sigue el tamaño atómico; el tamaño solo no determina la profundidad exacta del pozo.");

  mc("2.3-1", "Assume equal nearest-neighbor ion distances in model MgO and NaF lattices. Which ion pair has the stronger attraction by Coulomb's law?", "Supón distancias iguales entre iones vecinos más cercanos en redes cristalinas modelo de MgO y NaF. ¿Qué par de iones tiene mayor atracción según la ley de Coulomb?", [
    o("Mg<sup>2+</sup> and O<sup>2−</sup>, because their charge product has greater magnitude", "Mg<sup>2+</sup> y O<sup>2−</sup>, porque su producto de cargas tiene mayor magnitud", "", ""),
    o("Na<sup>+</sup> and F<sup>−</sup>, because smaller charge magnitudes strengthen attraction", "Na<sup>+</sup> y F<sup>−</sup>, porque las cargas de menor magnitud aumentan la atracción", "At equal distance, greater charge magnitudes increase electrostatic attraction.", "A la misma distancia, las cargas de mayor magnitud aumentan la atracción electrostática."),
    o("Both equally, because each formula has equal numbers of cations and anions", "Ambos por igual, porque cada fórmula tiene igual número de cationes y aniones", "Equal ion ratios ensure neutrality but do not make the individual ionic charges equal.", "Las relaciones iguales de iones aseguran neutralidad, pero no hacen iguales las cargas iónicas individuales."),
    o("Neither, because a neutral lattice has no internal electrostatic attractions", "Ninguno, porque una red cristalina neutra no tiene atracciones electrostáticas internas", "Overall neutrality does not remove attractions between neighboring opposite ions.", "La neutralidad total no elimina las atracciones entre iones vecinos de cargas opuestas.")],
    "At equal distance, the force magnitude scales with the charge product. MgO has charge-product magnitude 4, while NaF has 1, so the model MgO pair attracts more strongly.",
    "A la misma distancia, la magnitud de la fuerza depende del producto de las cargas. MgO tiene magnitud del producto de cargas de 4, mientras que NaF tiene 1, así que el par modelo de MgO se atrae con mayor fuerza.");
  mc("2.3-2", "LiF and LiI have the same ionic charge magnitudes, but F<sup>−</sup> is smaller than I<sup>−</sup>. Which prediction is best supported?", "LiF y LiI tienen las mismas magnitudes de carga iónica, pero F<sup>−</sup> es más pequeño que I<sup>−</sup>. ¿Qué predicción está mejor fundamentada?", [
    o("LiF has stronger ionic attractions and is expected to have a higher melting temperature.", "LiF tiene atracciones iónicas más fuertes y se espera que tenga mayor temperatura de fusión.", "", ""),
    o("LiI has stronger attractions because larger ions always attract more strongly.", "LiI tiene atracciones más fuertes porque los iones más grandes siempre se atraen con más fuerza.", "With the same charges, a larger separation weakens Coulomb attraction rather than strengthening it.", "Con las mismas cargas, una separación mayor debilita la atracción de Coulomb en lugar de fortalecerla."),
    o("Both have identical attractions because their charges match.", "Ambos tienen atracciones idénticas porque sus cargas coinciden.", "Distance also matters in Coulomb's law. Equal charges alone do not imply equal attraction.", "La distancia también importa en la ley de Coulomb. Las cargas iguales por sí solas no implican igual atracción."),
    o("LiF should melt more easily because shorter distances weaken attractions.", "LiF debe fundirse más fácilmente porque las distancias menores debilitan las atracciones.", "Shorter ion distances increase attraction, so disrupting the lattice generally requires more energy.", "Las distancias menores entre iones aumentan la atracción, así que deshacer la red cristalina suele requerir más energía.")],
    "Smaller ions permit shorter distances between opposite charges. Stronger attractions generally require more thermal energy to disrupt the crystal lattice, supporting a higher melting temperature for LiF.",
    "Los iones más pequeños permiten distancias menores entre cargas opuestas. Las atracciones más fuertes suelen requerir más energía térmica para deshacer la red cristalina, lo que apoya una mayor temperatura de fusión para LiF.");
  mc("2.3-3", "Why does molten NaCl conduct electricity while solid NaCl does not conduct appreciably under ordinary classroom conditions?", "¿Por qué el NaCl fundido conduce electricidad mientras que el NaCl sólido no conduce de forma apreciable en condiciones normales del aula?", [
    o("Ions can move through the melt, but are fixed in the solid lattice.", "Los iones pueden moverse por el líquido, pero están fijos en la red cristalina sólida.", "", ""),
    o("Melting creates a sea of metallic electrons.", "La fusión crea un mar de electrones metálico.", "Molten salt conducts by mobile ions. Melting does not turn ionic bonding into metallic bonding.", "La sal fundida conduce mediante iones móviles. La fusión no convierte el enlace iónico en enlace metálico."),
    o("Solid NaCl contains no charged particles.", "El NaCl sólido no contiene partículas cargadas.", "The solid already contains ions. Their restricted motion prevents substantial charge transport.", "El sólido ya contiene iones. Su movimiento restringido impide un transporte considerable de carga."),
    o("Protons leave the nuclei and move when the solid melts.", "Los protones salen de los núcleos y se mueven cuando el sólido se funde.", "Melting changes particle arrangement and mobility, not the composition of nuclei.", "La fusión cambia la distribución y movilidad de las partículas, no la composición de los núcleos.")],
    "Electrical conduction requires mobile charge carriers. The ions remain charged in both states, but become free to move over long distances in the molten state.",
    "La conducción eléctrica requiere portadores de carga móviles. Los iones conservan su carga en ambos estados, pero quedan libres para desplazarse largas distancias en el estado fundido.");
  mc("2.3-4", "An ionic crystal fractures when planes of ions are shifted by an applied force. Which particle-level explanation fits its brittleness?", "Un cristal iónico se fractura cuando una fuerza aplicada desplaza planos de iones. ¿Qué explicación a nivel de partículas corresponde a su carácter quebradizo?", [
    o("The shift brings like charges next to each other, producing repulsion.", "El desplazamiento acerca cargas iguales entre sí y produce repulsión.", "", ""),
    o("All ions become neutral during the shift.", "Todos los iones se vuelven neutros durante el desplazamiento.", "Displacing ion planes changes their neighbors, not their electron counts or charges.", "Desplazar planos de iones cambia sus vecinos, no su número de electrones ni sus cargas."),
    o("A sea of electrons preserves bonding as the layers slide.", "Un mar de electrones conserva los enlaces cuando las capas se deslizan.", "That is a model for metallic malleability. An ionic crystal instead places like charges together after certain shifts.", "Ese es un modelo de maleabilidad metálica. Un cristal iónico, en cambio, junta cargas iguales después de ciertos desplazamientos."),
    o("Covalent bonds between separate salt molecules stretch indefinitely.", "Los enlaces covalentes entre moléculas separadas de sal se estiran indefinidamente.", "This is an ionic lattice rather than separate covalent salt molecules. Repulsion explains the fracture.", "Es una red cristalina iónica en lugar de moléculas covalentes separadas de sal. La repulsión explica la fractura.")],
    "An ordered ionic lattice alternates opposite charges. A shift can align ions of the same charge; their repulsion drives planes apart and the crystal cracks.",
    "Una red cristalina iónica ordenada alterna cargas opuestas. Un desplazamiento puede alinear iones de la misma carga; su repulsión separa los planos y el cristal se rompe.");
  num("2.3-5", "At the same separation, compare attraction magnitudes for a model ion pair with charges +2e and −2e and a pair with +1e and −1e. What is the ratio F(doubly charged)/F(singly charged)?", "A la misma separación, compara magnitudes de atracción de un par modelo con cargas +2e y −2e y un par con +1e y −1e. ¿Cuál es la relación F(carga doble)/F(carga simple)?",
    4, "4", "ratio", {exact:true},
    "The common distance factor cancels. Divide the charge-product magnitudes: (2 × 2)/(1 × 1) = 4. Charge numbers are exact, and this ratio has no units.",
    "El factor de distancia común se cancela. Divide las magnitudes de los productos de cargas: (2 × 2)/(1 × 1) = 4. Los números de carga son exactos y esta relación no tiene unidades.");
  num("2.3-6", "The separation of a model pair of oppositely charged ions doubles while both charges stay fixed. What is the ratio of the new attractive force magnitude to the original magnitude?", "La separación de un par modelo de iones de cargas opuestas se duplica y ambas cargas permanecen fijas. ¿Cuál es la relación entre la nueva magnitud de la fuerza de atracción y la original?",
    1 / 4, "0.250", "ratio", {sf:3},
    "Coulomb's law gives F proportional to 1/r<sup>2</sup>. Doubling r gives F(new)/F(original) = 1/2<sup>2</sup> = 0.250. The inverse-distance rule without a square applies to potential energy, not force.",
    "La ley de Coulomb da F proporcional a 1/r<sup>2</sup>. Duplicar r da F(nueva)/F(original) = 1/2<sup>2</sup> = 0.250. La regla de distancia inversa sin cuadrado se aplica a la energía potencial, no a la fuerza.");

  mc("2.4-1", "Which particles primarily carry electric current through a solid copper wire?", "¿Qué partículas transportan principalmente la corriente eléctrica por un alambre sólido de cobre?", [
    o("Delocalized electrons that can move through the metal", "Electrones deslocalizados que pueden moverse por el metal", "", ""),
    o("Copper nuclei moving the full length of the wire", "Núcleos de cobre que recorren todo el alambre", "The nuclei remain near lattice sites. Current does not require them to travel through the wire.", "Los núcleos permanecen cerca de sus sitios en la red cristalina. La corriente no requiere que recorran el alambre."),
    o("Protons detached from copper nuclei", "Protones desprendidos de los núcleos de cobre", "Ordinary electrical conduction does not remove protons from nuclei.", "La conducción eléctrica ordinaria no extrae protones de los núcleos."),
    o("Neutral copper atoms moving through empty channels", "Átomos neutros de cobre que se mueven por canales vacíos", "Neutral-atom motion is not the charge transport mechanism of a solid metal.", "El movimiento de átomos neutros no es el mecanismo de transporte de carga de un metal sólido.")],
    "Metallic bonding is modeled as positive metal cores attracted to a mobile sea of electrons. Delocalized electrons carry charge through the solid.",
    "El enlace metálico se representa como centros metálicos positivos atraídos por un mar de electrones móvil. Los electrones deslocalizados transportan carga por el sólido.");
  mc("2.4-2", "Why can many pure metals be hammered into sheets without shattering?", "¿Por qué muchos metales puros pueden martillarse para formar láminas sin romperse?", [
    o("Layers can slide while metal cores remain attracted to the electron sea.", "Las capas pueden deslizarse mientras los centros metálicos siguen atraídos por el mar de electrones.", "", ""),
    o("The metal contains no attractive interactions.", "El metal no contiene interacciones de atracción.", "Without attractive interactions, the solid would not hold together. Metallic bonding remains as layers shift.", "Sin interacciones de atracción, el sólido no se mantendría unido. El enlace metálico permanece cuando las capas se desplazan."),
    o("Alternating positive and negative ion layers always remain aligned.", "Las capas alternadas de iones positivos y negativos siempre permanecen alineadas.", "An alternating ionic lattice is not the metallic model and often fractures when like charges are aligned.", "Una red cristalina iónica alternada no es el modelo metálico y suele fracturarse cuando se alinean cargas iguales."),
    o("Every metal core is connected to only one neighbor by a fixed covalent bond.", "Cada centro metálico está conectado con un solo vecino por un enlace covalente fijo.", "Metallic attraction extends among many cores and delocalized electrons, not fixed pairs of bonded atoms.", "La atracción metálica se extiende entre muchos centros y electrones deslocalizados, no entre pares fijos de átomos enlazados.")],
    "The electron sea can continue attracting metal cores after layers shift. This flexible arrangement helps explain malleability and ductility.",
    "El mar de electrones puede seguir atrayendo los centros metálicos después de que las capas se desplazan. Esta distribución flexible ayuda a explicar la maleabilidad y la ductilidad.");
  mc("2.4-3", "In a model of steel, small C atoms occupy gaps between larger Fe atoms. Which classification fits this arrangement?", "En un modelo de acero, los átomos pequeños de C ocupan huecos entre átomos más grandes de Fe. ¿Qué clasificación corresponde a esta distribución?", [
    o("Interstitial alloy", "Aleación intersticial", "", ""),
    o("Substitutional alloy", "Aleación sustitucional", "Substitutional atoms replace host atoms at lattice sites. These C atoms occupy gaps instead.", "Los átomos sustitucionales reemplazan átomos del metal base en sitios de la red cristalina. Estos átomos de C ocupan huecos."),
    o("Pure elemental iron", "Hierro elemental puro", "The model contains both Fe and C, so it is not a pure element.", "El modelo contiene Fe y C, así que no es un elemento puro."),
    o("Ionic crystal of separate carbon anions and iron cations", "Cristal iónico de aniones de carbono y cationes de hierro separados", "The prompt describes small atoms in a metal lattice, not a salt with an alternating ionic lattice.", "El enunciado describe átomos pequeños en una red cristalina metálica, no una sal con una red cristalina iónica alternada.")],
    "In an interstitial alloy, smaller atoms fit into spaces between host metal atoms. Carbon in the gaps of an iron lattice is a standard model of this arrangement.",
    "En una aleación intersticial, los átomos más pequeños caben en los espacios entre átomos del metal base. El carbono en los huecos de una red cristalina de hierro es un modelo típico de esta distribución.");
  mc("2.4-4", "In a model of brass, Zn atoms of similar size replace some Cu atoms at regular lattice sites. Which classification fits?", "En un modelo de latón, átomos de Zn de tamaño similar reemplazan algunos átomos de Cu en sitios regulares de la red cristalina. ¿Qué clasificación corresponde?", [
    o("Substitutional alloy", "Aleación sustitucional", "", ""),
    o("Interstitial alloy", "Aleación intersticial", "Interstitial atoms occupy gaps. Here Zn atoms replace Cu at regular lattice positions.", "Los átomos intersticiales ocupan huecos. Aquí los átomos de Zn reemplazan a Cu en posiciones regulares de la red cristalina."),
    o("Pure copper", "Cobre puro", "The presence of Zn means that the sample is not pure copper.", "La presencia de Zn significa que la muestra no es cobre puro."),
    o("Molecular solid of separate CuZn molecules", "Sólido molecular de moléculas separadas de CuZn", "Brass has a metallic lattice rather than discrete molecules with a fixed CuZn formula.", "El latón tiene una red cristalina metálica en lugar de moléculas discretas con una fórmula fija CuZn.")],
    "Similar-sized atoms can substitute for host atoms at lattice sites. This arrangement is substitutional; the metallic bonding model still applies.",
    "Los átomos de tamaño similar pueden sustituir átomos del metal base en sitios de la red cristalina. Esta distribución es sustitucional; el modelo de enlace metálico sigue siendo válido.");
  mc("2.4-5", "A metal becomes harder after small amounts of a different-sized atom are added. Which explanation best links alloy structure to hardness?", "Un metal se vuelve más duro después de añadir pequeñas cantidades de un átomo de tamaño diferente. ¿Qué explicación relaciona mejor la estructura de la aleación con la dureza?", [
    o("The added atoms distort the lattice and hinder the sliding of layers.", "Los átomos añadidos deforman la red cristalina y dificultan el deslizamiento de las capas.", "", ""),
    o("The added atoms remove all attractions between metal cores and electrons.", "Los átomos añadidos eliminan toda atracción entre centros metálicos y electrones.", "Removing the attractions would destroy cohesion, not explain a harder metallic solid.", "Eliminar las atracciones destruiría la cohesión, no explicaría un sólido metálico más duro."),
    o("Every alloy has exactly the same ordered lattice as the pure metal.", "Toda aleación tiene exactamente la misma red cristalina ordenada que el metal puro.", "Different-sized atoms disrupt the regular arrangement. This disruption helps explain resistance to deformation.", "Los átomos de tamaño diferente alteran la distribución regular. Esta alteración ayuda a explicar la resistencia a la deformación."),
    o("Adding any element must create an alternating ionic lattice.", "Añadir cualquier elemento debe crear una red cristalina iónica alternada.", "Alloying does not necessarily produce ions or a salt. The model remains a metal with a modified lattice.", "Formar una aleación no produce necesariamente iones ni una sal. El modelo sigue siendo un metal con una red cristalina modificada.")],
    "Changes in atom size can make layer motion more difficult and increase hardness. Alloy properties depend on composition and structure; this is not a claim that every alloy is harder.",
    "Los cambios de tamaño atómico pueden dificultar el movimiento de las capas y aumentar la dureza. Las propiedades de una aleación dependen de su composición y estructura; esto no afirma que toda aleación sea más dura.");
  num("2.4-6", "A simplified metallic bonding model contains 12 Al atoms, each contributing 3 valence electrons to the shared electron sea. How many delocalized electrons does this model contain?", "Un modelo simplificado de enlace metálico contiene 12 átomos de Al, cada uno de los cuales aporta 3 electrones de valencia al mar de electrones compartido. ¿Cuántos electrones deslocalizados contiene este modelo?",
    12 * 3, "36", "count", {exact:true},
    "Count only the explicitly modeled valence electrons: 12 atoms × 3 electrons per atom = 36 electrons. Core electrons are not included in this simplified sea.",
    "Cuenta solo los electrones de valencia representados explícitamente: 12 átomos × 3 electrones por átomo = 36 electrones. Los electrones internos no se incluyen en este mar simplificado.");

  num("2.5-1", "How many total valence electrons belong in a Lewis diagram of CO<sub>3</sub><sup>2−</sup>?", "¿Cuántos electrones de valencia totales corresponden a un diagrama de Lewis de CO<sub>3</sub><sup>2−</sup>?",
    4 + 3 * 6 + 2, "24", "count", {exact:true},
    "C contributes 4 and the three O atoms contribute 3 × 6 = 18. Add 2 for the negative charge: 4 + 18 + 2 = 24 valence electrons.",
    "C aporta 4 y los tres átomos de O aportan 3 × 6 = 18. Añade 2 por la carga negativa: 4 + 18 + 2 = 24 electrones de valencia.");
  num("2.5-2", "In the usual Lewis diagram of NH<sub>3</sub> with three N−H single bonds, how many lone pairs are on N?", "En el diagrama de Lewis usual de NH<sub>3</sub> con tres enlaces simples N−H, ¿cuántos pares libres hay en N?",
    1, "1", "count", {exact:true},
    "There are 5 + 3 = 8 valence electrons. The three bonds use 6 electrons, leaving 2 electrons on N as 1 lone pair. Count pairs, not individual nonbonding electrons.",
    "Hay 5 + 3 = 8 electrones de valencia. Los tres enlaces usan 6 electrones y dejan 2 electrones en N como 1 par libre. Cuenta pares, no electrones no enlazantes individuales.");
  num("2.5-3", "The preferred Lewis diagram of CO<sub>2</sub> is O=C=O. How many bonding electron pairs are present in the entire molecule?", "El diagrama de Lewis preferido de CO<sub>2</sub> es O=C=O. ¿Cuántos pares de electrones de enlace hay en toda la molécula?",
    2 * 2, "4", "count", {exact:true},
    "Each double bond contains 2 shared electron pairs. Two double bonds contain 2 × 2 = 4 bonding pairs. For VSEPR, those same bonds count as only 2 electron domains around C.",
    "Cada enlace doble contiene 2 pares de electrones compartidos. Dos enlaces dobles contienen 2 × 2 = 4 pares de enlace. Para VSEPR, esos mismos enlaces cuentan como solo 2 dominios electrónicos alrededor de C.");
  mc("2.5-4", "Which Lewis diagram description for HCN gives H a duet, C and N octets, and zero formal charge on every atom?", "¿Qué descripción del diagrama de Lewis de HCN da un dueto a H, octetos a C y N y carga formal cero en cada átomo?", [
    o("H−C≡N, with one lone pair on N", "H−C≡N, con un par libre en N", "", ""),
    o("H−C−N, with three lone pairs on N and none on C", "H−C−N, con tres pares libres en N y ninguno en C", "This uses the valence electron total, but leaves C with only four surrounding electrons and a positive formal charge.", "Esto usa el total de electrones de valencia, pero deja a C con solo cuatro electrones a su alrededor y una carga formal positiva."),
    o("H=C=N, with two lone pairs on N", "H=C=N, con dos pares libres en N", "Hydrogen cannot have a double bond in a valid duet model. This also does not give the required electron arrangement.", "El hidrógeno no puede tener un enlace doble en un modelo válido de dueto. Esto tampoco da la distribución electrónica requerida."),
    o("C−H−N, with H as the central atom", "C−H−N, con H como átomo central", "Two bonds put four electrons around H. Hydrogen satisfies a duet with one bond and cannot be this central atom.", "Dos enlaces ponen cuatro electrones alrededor de H. El hidrógeno satisface un dueto con un enlace y no puede ser este átomo central.")],
    "HCN has 1 + 4 + 5 = 10 valence electrons. One single bond, one triple bond, and one lone pair use all 10, complete the appropriate shells, and give zero formal charges.",
    "HCN tiene 1 + 4 + 5 = 10 electrones de valencia. Un enlace simple, un enlace triple y un par libre usan los 10, completan los niveles apropiados y dan cargas formales cero.");
  mc("2.5-5", "The usual Lewis diagram of BF<sub>3</sub> has three B−F single bonds and three lone pairs on each F. Which statement about B is correct?", "El diagrama de Lewis usual de BF<sub>3</sub> tiene tres enlaces simples B−F y tres pares libres en cada F. ¿Qué afirmación sobre B es correcta?", [
    o("B has six surrounding electrons, an accepted incomplete octet.", "B tiene seis electrones a su alrededor, un octeto incompleto aceptado.", "", ""),
    o("B has eight surrounding electrons because every atom must have an octet.", "B tiene ocho electrones a su alrededor porque todo átomo debe tener un octeto.", "Three single bonds place six electrons around B. Boron is a common exception to the octet rule.", "Tres enlaces simples ponen seis electrones alrededor de B. El boro es una excepción común a la regla del octeto."),
    o("B has a lone pair that is not counted in the valence electron total.", "B tiene un par libre que no se cuenta en el total de electrones de valencia.", "All valence electrons must be counted. The bonds and F lone pairs already use the available total.", "Todos los electrones de valencia deben contarse. Los enlaces y los pares libres de F ya usan el total disponible."),
    o("B must form a fourth B−F single bond without adding an atom or electrons.", "B debe formar un cuarto enlace simple B−F sin añadir un átomo ni electrones.", "There are only three F atoms and no additional electron pair. Adding a bond cannot be done by inventing electrons.", "Solo hay tres átomos de F y ningún par electrónico adicional. No se puede añadir un enlace inventando electrones.")],
    "The total is 3 + 3 × 7 = 24 electrons. Three bonds use 6 and F lone pairs use 18. B has six surrounding electrons and zero formal charge; an octet is not mandatory for B here.",
    "El total es 3 + 3 × 7 = 24 electrones. Tres enlaces usan 6 y los pares libres de F usan 18. B tiene seis electrones a su alrededor y carga formal cero; aquí el octeto no es obligatorio para B.");
  mc("2.5-6", "Which arrangement around N uses the correct valence electron total in a Lewis diagram of NH<sub>4</sub><sup>+</sup>?", "¿Qué distribución alrededor de N usa el total correcto de electrones de valencia en un diagrama de Lewis de NH<sub>4</sub><sup>+</sup>?", [
    o("Four N−H single bonds and no lone pairs on N", "Cuatro enlaces simples N−H y ningún par libre en N", "", ""),
    o("Four N−H single bonds and one lone pair on N", "Cuatro enlaces simples N−H y un par libre en N", "This requires ten electrons and exceeds the octet on N. The ion has only eight valence electrons.", "Esto requiere diez electrones y excede el octeto en N. El ion tiene solo ocho electrones de valencia."),
    o("Three N−H single bonds and one lone pair on N, with one H unconnected", "Tres enlaces simples N−H y un par libre en N, con un H sin conectar", "This leaves one H outside the bonded ion. All four H atoms must be connected in ammonium.", "Esto deja un H fuera del ion enlazado. Los cuatro átomos de H deben estar conectados en el amonio."),
    o("Four N−H double bonds and no lone pairs on N", "Cuatro enlaces dobles N−H y ningún par libre en N", "This exceeds both the available electron count and the duet limit for each H atom.", "Esto excede tanto el número de electrones disponibles como el límite de dueto de cada átomo de H.")],
    "Add neutral-atom valence electrons and subtract one for the positive charge: 5 + 4 − 1 = 8. Four single bonds use all eight, leaving no lone pair on N.",
    "Suma los electrones de valencia de los átomos neutros y resta uno por la carga positiva: 5 + 4 − 1 = 8. Cuatro enlaces simples usan los ocho y no dejan ningún par libre en N.");

  num("2.6-1", "In NH<sub>4</sub><sup>+</sup>, N has four single bonds and no lone pairs. What is the formal charge on N, in units of e?", "En NH<sub>4</sub><sup>+</sup>, N tiene cuatro enlaces simples y ningún par libre. ¿Cuál es la carga formal en N, en unidades de e?",
    5 - 0 - 8 / 2, "+1", "e", {exact:true},
    "Formal charge = valence electrons − nonbonding electrons − half the bonding electrons. For N: 5 − 0 − 8/2 = +1. The formal charges sum to the ion charge.",
    "Carga formal = electrones de valencia − electrones no enlazantes − la mitad de los electrones de enlace. Para N: 5 − 0 − 8/2 = +1. Las cargas formales suman la carga del ion.");
  num("2.6-2", "In one nitrate Lewis diagram, a named O atom has one single bond to N and three lone pairs. What is the formal charge on that O, in units of e?", "En un diagrama de Lewis del nitrato, un átomo de O indicado tiene un enlace simple con N y tres pares libres. ¿Cuál es la carga formal en ese O, en unidades de e?",
    6 - 6 - 2 / 2, "-1", "e", {exact:true},
    "O has 6 valence electrons, 6 nonbonding electrons, and 2 bonding electrons. Formal charge = 6 − 6 − 2/2 = −1. Assign half of a bond's electrons to each atom.",
    "O tiene 6 electrones de valencia, 6 electrones no enlazantes y 2 electrones de enlace. Carga formal = 6 − 6 − 2/2 = −1. Asigna la mitad de los electrones de un enlace a cada átomo.");
  num("2.6-3", "CO<sub>3</sub><sup>2−</sup> has three equivalent resonance contributors, each with one C=O bond and two C−O single bonds. What average bond order does this model predict for each C−O bond?", "CO<sub>3</sub><sup>2−</sup> tiene tres contribuyentes de resonancia equivalentes, cada uno con un enlace C=O y dos enlaces simples C−O. ¿Qué orden de enlace promedio predice este modelo para cada enlace C−O?",
    (2 + 1 + 1) / 3, "1.33", "ratio", {sf:3},
    "A named C−O connection has order 2 in one contributor and order 1 in the other two. Its average is (2 + 1 + 1)/3 = 4/3, or 1.33. Bond order has no units.",
    "Una conexión C−O indicada tiene orden 2 en un contribuyente y orden 1 en los otros dos. Su promedio es (2 + 1 + 1)/3 = 4/3, es decir, 1.33. El orden de enlace no tiene unidades.");
  mc("2.6-4", "All N−O bonds in nitrate have the same measured length. Which interpretation of its resonance diagrams is correct?", "Todos los enlaces N−O en el nitrato tienen la misma longitud medida. ¿Qué interpretación de sus diagramas de resonancia es correcta?", [
    o("The real ion has delocalized bonding represented by a resonance hybrid.", "El ion real tiene enlaces deslocalizados representados por un híbrido de resonancia.", "", ""),
    o("The ion rapidly switches between one long-lived double bond and two long-lived single bonds.", "El ion cambia rápidamente entre un enlace doble duradero y dos enlaces simples duraderos.", "Contributors are representations, not separate structures the ion takes turns occupying. The bonding is delocalized.", "Los contribuyentes son representaciones, no estructuras separadas que el ion ocupa por turnos. Los enlaces están deslocalizados."),
    o("O atoms exchange positions with N to make the bonds equal.", "Los átomos de O intercambian posiciones con N para igualar los enlaces.", "Resonance changes electron placement in diagrams while keeping atom connectivity fixed.", "La resonancia cambia la ubicación de electrones en los diagramas y conserva la conectividad de los átomos."),
    o("The double bond must always stay on one O, so its length is different.", "El enlace doble debe permanecer siempre en un O, así que su longitud es diferente.", "This predicts unequal lengths and conflicts with the observation. Equivalent contributors account for equal bonds.", "Esto predice longitudes desiguales y contradice la observación. Los contribuyentes equivalentes explican enlaces iguales.")],
    "Equivalent resonance contributors have the same atom positions and differ in electron placement. The real nitrate ion has equivalent bonds with character between single and double bonds.",
    "Los contribuyentes de resonancia equivalentes tienen las mismas posiciones atómicas y difieren en la ubicación de electrones. El ion nitrato real tiene enlaces equivalentes con carácter intermedio entre enlaces simples y dobles.");
  mc("2.6-5", "Both O=C=O and O−C≡O can be completed with octets and the correct total electron count for CO<sub>2</sub>. Why is O=C=O preferred?", "Tanto O=C=O como O−C≡O pueden completarse con octetos y el total correcto de electrones para CO<sub>2</sub>. ¿Por qué se prefiere O=C=O?", [
    o("All atoms have zero formal charge, minimizing charge separation.", "Todos los átomos tienen carga formal cero, lo que minimiza la separación de cargas.", "", ""),
    o("It places a positive formal charge on the central C.", "Coloca una carga formal positiva en el C central.", "C has four bonding pairs and no lone pairs in this diagram, so its formal charge is zero.", "C tiene cuatro pares de enlace y ningún par libre en este diagrama, así que su carga formal es cero."),
    o("A triple bond is never allowed in a Lewis diagram.", "Nunca se permite un enlace triple en un diagrama de Lewis.", "Triple bonds are allowed. The issue here is the unfavorable formal charges on the O atoms in the alternative.", "Los enlaces triples se permiten. El problema aquí son las cargas formales desfavorables en los átomos de O de la alternativa."),
    o("It gives carbon more than eight surrounding electrons.", "Da al carbono más de ocho electrones a su alrededor.", "Two double bonds give C exactly eight surrounding electrons. Carbon cannot expand its octet here.", "Dos enlaces dobles dan a C exactamente ocho electrones a su alrededor. El carbono no puede expandir su octeto aquí.")],
    "In O=C=O, all formal charges are 0. In O−C≡O, the singly bonded O is −1 and the triply bonded O is +1. With octets satisfied in both, minimizing formal charge favors O=C=O.",
    "En O=C=O, todas las cargas formales son 0. En O−C≡O, el O con enlace simple tiene −1 y el O con enlace triple tiene +1. Con los octetos satisfechos en ambos, minimizar la carga formal favorece O=C=O.");
  mc("2.6-6", "Two cyanate resonance contributors satisfy all octets: O−C≡N has negative formal charge on O, while O=C=N has negative formal charge on N. All other formal charges are zero. Which contributor is favored by electronegativity?", "Dos contribuyentes de resonancia del cianato satisfacen todos los octetos: O−C≡N tiene carga formal negativa en O, mientras que O=C=N tiene carga formal negativa en N. Todas las otras cargas formales son cero. ¿Qué contribuyente se favorece por electronegatividad?", [
    o("O−C≡N, because O is more electronegative than N", "O−C≡N, porque O es más electronegativo que N", "", ""),
    o("O=C=N, because negative charge is favored on the less electronegative atom", "O=C=N, porque la carga negativa se favorece en el átomo menos electronegativo", "When octets and charge magnitudes are comparable, negative formal charge is generally favored on the more electronegative atom.", "Cuando los octetos y las magnitudes de carga son comparables, la carga formal negativa suele favorecerse en el átomo más electronegativo."),
    o("Both contribute equally because they have the same connectivity.", "Ambos contribuyen por igual porque tienen la misma conectividad.", "The same connectivity is required for resonance but does not require equal contributions. Charge placement matters.", "La misma conectividad se requiere para la resonancia, pero no exige contribuciones iguales. La ubicación de las cargas importa."),
    o("Neither is a resonance contributor because the bond orders differ.", "Ninguno es un contribuyente de resonancia porque los órdenes de enlace difieren.", "Changing electron placement and bond order without moving atoms is exactly what resonance diagrams can represent.", "Cambiar la ubicación de electrones y el orden de enlace sin mover átomos es precisamente lo que pueden representar los diagramas de resonancia.")],
    "Both diagrams satisfy octets and have one negative formal charge. O is more electronegative than N, so placing the negative charge on O favors O−C≡N. The less favored contributor still contributes to the hybrid.",
    "Ambos diagramas satisfacen octetos y tienen una carga formal negativa. O es más electronegativo que N, así que colocar la carga negativa en O favorece O−C≡N. El contribuyente menos favorecido sigue contribuyendo al híbrido.");

  num("2.7-1", "For VSEPR, how many electron domains surround the central C in O=C=O?", "Para VSEPR, ¿cuántos dominios electrónicos rodean al C central en O=C=O?",
    2, "2", "count", {exact:true},
    "Each double bond is one electron domain. C has two double bonds and no lone pairs, giving 2 domains, even though the bonds contain four shared pairs.",
    "Cada enlace doble es un dominio electrónico. C tiene dos enlaces dobles y ningún par libre, lo que da 2 dominios, aunque los enlaces contienen cuatro pares compartidos.");
  num("2.7-2", "What ideal H−C−H bond angle does VSEPR predict for CH<sub>4</sub>, in degrees?", "¿Qué ángulo de enlace ideal H−C−H predice VSEPR para CH<sub>4</sub>, en grados?",
    109.5, "109.5", "degrees", {decimals:1},
    "Four bonding domains and no lone pairs give tetrahedral electron and molecular geometry. The ideal tetrahedral bond angle is 109.5 degrees.",
    "Cuatro dominios de enlace y ningún par libre dan geometría electrónica y geometría molecular tetraédricas. El ángulo de enlace tetraédrico ideal es 109.5 grados.");
  num("2.7-3", "Ethene, C<sub>2</sub>H<sub>4</sub>, has one C=C double bond and four C−H single bonds. How many pi bonds are in the entire molecule?", "El eteno, C<sub>2</sub>H<sub>4</sub>, tiene un enlace doble C=C y cuatro enlaces simples C−H. ¿Cuántos enlaces pi hay en toda la molécula?",
    1, "1", "count", {exact:true},
    "A double bond contains one sigma bond and one pi bond. The C−H bonds are sigma bonds, so there is 1 pi bond total. It comes from side-by-side overlap of unhybridized p orbitals on the two C atoms.",
    "Un enlace doble contiene un enlace sigma y un enlace pi. Los enlaces C−H son enlaces sigma, así que hay 1 enlace pi en total. Proviene de la superposición lateral de orbitales p no hibridados en los dos átomos de C.");
  mc("2.7-4", "NH<sub>3</sub> has three N−H bonds and one lone pair on N. Which pair of geometries is correct?", "NH<sub>3</sub> tiene tres enlaces N−H y un par libre en N. ¿Qué par de geometrías es correcto?", [
    o("Tetrahedral electron geometry; trigonal pyramidal molecular geometry", "Geometría electrónica tetraédrica; geometría molecular piramidal trigonal", "", ""),
    o("Trigonal planar electron geometry; trigonal planar molecular geometry", "Geometría electrónica trigonal plana; geometría molecular trigonal plana", "This ignores the lone pair. Four electron domains require a tetrahedral electron arrangement.", "Esto ignora el par libre. Cuatro dominios electrónicos requieren una distribución electrónica tetraédrica."),
    o("Tetrahedral electron geometry; tetrahedral molecular geometry", "Geometría electrónica tetraédrica; geometría molecular tetraédrica", "Molecular geometry describes atom positions only. One of the four domains is a lone pair rather than an atom.", "La geometría molecular describe solo las posiciones atómicas. Uno de los cuatro dominios es un par libre en lugar de un átomo."),
    o("Linear electron geometry; angular molecular geometry", "Geometría electrónica lineal; geometría molecular angular", "A linear electron arrangement has two domains. N has four domains and three bonded atoms.", "Una distribución electrónica lineal tiene dos dominios. N tiene cuatro dominios y tres átomos enlazados.")],
    "Count the lone pair for electron geometry: four domains give tetrahedral. Count only the bonded atom positions for molecular geometry: the three H atoms form a trigonal pyramid.",
    "Cuenta el par libre para la geometría electrónica: cuatro dominios dan tetraédrica. Cuenta solo las posiciones de los átomos enlazados para la geometría molecular: los tres átomos de H forman una pirámide trigonal.");
  mc("2.7-5", "Which combination matches the usual localized bonding model for B in BF<sub>3</sub>, which has three bonds and no lone pairs on B?", "¿Qué combinación corresponde al modelo usual de enlaces localizados para B en BF<sub>3</sub>, que tiene tres enlaces y ningún par libre en B?", [
    o("Trigonal planar, 120°, sp<sup>2</sup>", "Trigonal plana, 120°, sp<sup>2</sup>", "", ""),
    o("Trigonal pyramidal, 107°, sp<sup>3</sup>", "Piramidal trigonal, 107°, sp<sup>3</sup>", "This describes a common three-bond, one-lone-pair arrangement. B has no lone pair in this model.", "Esto describe una distribución común de tres enlaces y un par libre. B no tiene ningún par libre en este modelo."),
    o("Linear, 180°, sp", "Lineal, 180°, sp", "Linear sp bonding corresponds to two electron domains, not the three around B.", "Los enlaces sp lineales corresponden a dos dominios electrónicos, no a los tres alrededor de B."),
    o("Tetrahedral, 109.5°, sp<sup>3</sup>", "Tetraédrica, 109.5°, sp<sup>3</sup>", "A tetrahedral arrangement requires four electron domains. Three domains give trigonal planar geometry.", "Una distribución tetraédrica requiere cuatro dominios electrónicos. Tres dominios dan geometría trigonal plana.")],
    "Three electron domains lie in a plane 120° apart. The corresponding localized hybridization model uses three sp<sup>2</sup> orbitals for the sigma bonds.",
    "Tres dominios electrónicos están en un plano separados por 120°. El modelo correspondiente de hibridación localizada usa tres orbitales sp<sup>2</sup> para los enlaces sigma.");
  mc("2.7-6", "Which molecular geometry and central-atom hybridization describe CO<sub>2</sub> in the usual localized bonding model?", "¿Qué geometría molecular e hibridación del átomo central describen CO<sub>2</sub> en el modelo usual de enlaces localizados?", [
    o("Linear, sp", "Lineal, sp", "", ""),
    o("Trigonal planar, sp<sup>2</sup>", "Trigonal plana, sp<sup>2</sup>", "A double bond does not by itself imply this hybridization. Count domains around C: there are only two.", "Un enlace doble por sí solo no implica esta hibridación. Cuenta los dominios alrededor de C: solo hay dos."),
    o("Tetrahedral, sp<sup>3</sup>", "Tetraédrica, sp<sup>3</sup>", "Four shared electron pairs are present, but each double bond is only one domain. C has two domains, not four.", "Hay cuatro pares de electrones compartidos, pero cada enlace doble es solo un dominio. C tiene dos dominios, no cuatro."),
    o("Angular, sp<sup>3</sup>", "Angular, sp<sup>3</sup>", "An angular shape with this hybridization would require lone pairs on the central atom. C has no lone pairs in O=C=O.", "Una forma angular con esta hibridación requeriría pares libres en el átomo central. C no tiene pares libres en O=C=O.")],
    "C has two bonding domains and no lone pairs. They point in opposite directions, giving a linear molecule with a 180° angle and sp hybridization for the sigma framework.",
    "C tiene dos dominios de enlace y ningún par libre. Apuntan en direcciones opuestas y dan una molécula lineal con un ángulo de 180° e hibridación sp para el armazón sigma.");

  var units = [
    ["pm", "pm", "pm"], ["kJ/mol", "kJ/mol", "kJ/mol"], ["kJ", "kJ", "kJ"],
    ["e", "e", "e"], ["degrees", "degrees", "grados"],
    ["count", "count", "cantidad"], ["ratio", "no units", "sin unidades"]
  ].map(function (row) { return {id:row[0], label:p(row[1], row[2])}; });
  var copy = {title:"AP Chemistry Unit 2 Practice", es:{
    "Bonding reference":"Consulta sobre enlaces",
    "Valence electrons: H 1, B 3, C 4, N 5, O 6, F 7, Cl 7. Add one electron for each negative charge; subtract one for each positive charge.":"Electrones de valencia: H 1, B 3, C 4, N 5, O 6, F 7, Cl 7. Añade un electrón por cada carga negativa; resta uno por cada carga positiva.",
    "Formal charge = valence electrons − nonbonding electrons − half the bonding electrons. Report formal charge in units of e, the elementary charge.":"Carga formal = electrones de valencia − electrones no enlazantes − la mitad de los electrones de enlace. Expresa la carga formal en unidades de e, la carga elemental.",
    "Coulomb's law: attraction magnitude is proportional to the charge product divided by distance squared. A potential energy curve has its equilibrium bond length at the minimum.":"Ley de Coulomb: la magnitud de la atracción es proporcional al producto de las cargas dividido entre la distancia al cuadrado. Una curva de energía potencial tiene su longitud de enlace de equilibrio en el mínimo.",
    "Each single, double, or triple bond counts as one electron domain. Include lone pairs when finding electron geometry.":"Cada enlace simple, doble o triple cuenta como un dominio electrónico. Incluye los pares libres al determinar la geometría electrónica.",
    "Model bond potential energy curve":"Curva modelo de energía potencial del enlace",
    "Potential energy versus internuclear distance. The minimum is at 154 pm and −350 kJ/mol. At large separation, energy approaches 0 kJ/mol. At shorter distances, energy rises steeply.":"Energía potencial contra distancia internuclear. El mínimo está en 154 pm y −350 kJ/mol. A gran separación, la energía se acerca a 0 kJ/mol. A distancias menores, la energía aumenta rápidamente.",
    "Potential energy (kJ/mol)":"Energía potencial (kJ/mol)",
    "Internuclear distance (pm)":"Distancia internuclear (pm)",
    "AP Chemistry · Unit 2":"Química AP · Unidad 2",
    "AP Chemistry Unit 2 Practice":"Práctica de la unidad 2 de Química AP",
    "ZornScience home":"Inicio de ZornScience", "Activity tools":"Herramientas de la actividad",
    "Instructions":"Instrucciones", "Close":"Cerrar", "Close instructions":"Cerrar instrucciones",
    "Share":"Compartir", "Share activity":"Compartir actividad", "Share this activity":"Compartir esta actividad",
    "Close share options":"Cerrar opciones para compartir", "Share link":"Enlace para compartir", "Copy link":"Copiar enlace", "Email":"Correo electrónico",
    "Link copied.":"Enlace copiado.", "Link selected. Copy it with Ctrl+C or Command+C.":"Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
    "Share a fresh activity. Your answers and results are not included.":"Comparte una actividad nueva. Tus respuestas y resultados no se incluyen.",
    "Catch up at your own pace.":"Ponte al corriente a tu ritmo.",
    "Choose one topic for six questions, or Mixed review for all 42. Read the feedback after each answer.":"Elige un tema para seis preguntas o Repaso mixto para las 42. Lee la retroalimentación después de cada respuesta.",
    "Topic":"Tema", "Mixed review":"Repaso mixto", "Start practice":"Comenzar práctica", "Choose a topic":"Selección de un tema",
    "No timer. Use scratch paper and a calculator. Bonding reference values are below.":"Sin límite de tiempo. Usa papel y calculadora. Los valores de consulta sobre enlaces están abajo.",
    "Choose a topic, then start. Mixed review includes all seven topics.":"Elige un tema y comienza. El repaso mixto incluye los siete temas.",
    "Select one answer, or enter a number and choose its unit. For a count, choose count; for a ratio, choose no units.":"Selecciona una respuesta o escribe un número y elige su unidad. Para un conteo, elige cantidad; para una relación, elige sin unidades.",
    "Submit once per question. Read the explanation, then continue. Your score counts correct answers; a significant figure note does not remove a point.":"Envía una respuesta por pregunta. Lee la explicación y continúa. Tu puntaje cuenta las respuestas correctas; una nota sobre cifras significativas no quita un punto.",
    "At the end, Try again shuffles the questions and answer choices. Choose another topic to build a new set.":"Al terminar, Intentar de nuevo cambia el orden de las preguntas y las opciones. Elige otro tema para crear una serie nueva.",
    "Reference":"Consulta",
    "Scientific notation: you may type 1.51e23 in the number field.":"Notación científica: puedes escribir 1.51e23 en el campo numérico.",
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
    "Aligned practice for AP Chemistry CED topics 2.1 to 2.7. Original ZornScience questions.":"Práctica alineada con los temas 2.1 a 2.7 del CED de Química AP. Preguntas originales de ZornScience."
  }};
  var bank = {topics:topics, questions:questions, units:units, copy:copy};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit2-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
