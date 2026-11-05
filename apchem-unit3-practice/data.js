(function () {
  "use strict";
  // Original questions. Chemistry and numbers are paired across languages.
  function p(en, es) { return {en:en, es:es}; }
  function o(en, es, whyEn, whyEs) { return {text:p(en, es), why:p(whyEn, whyEs)}; }
  var questions = [];
  function mc(id, en, es, choices, reasoningEn, reasoningEs) {
    questions.push({id:id, topic:id.split("-")[0], type:"mc", prompt:p(en, es), choices:choices, answer:0, explanation:p(reasoningEn, reasoningEs)});
  }
  function num(id, en, es, value, display, unit, precision, reasoningEn, reasoningEs) {
    questions.push({id:id, topic:id.split("-")[0], type:"numeric", prompt:p(en, es), value:value, display:display, unit:unit, precision:precision,
      tolerance:precision.exact ? 0 : 0.55 * Math.pow(10, precision.decimals !== undefined ? -precision.decimals : Math.floor(Math.log10(Math.abs(value))) - precision.sf + 1),
      explanation:p(reasoningEn, reasoningEs)});
  }
  var topics = [
    ["3.1", "3.1 Intermolecular and Interparticle Forces", "3.1 Fuerzas intermoleculares e interpartículas"],
    ["3.2", "3.2 Properties of Solids", "3.2 Propiedades de los sólidos"],
    ["3.3", "3.3 Solids, Liquids, and Gases", "3.3 Sólidos, líquidos y gases"],
    ["3.4", "3.4 Ideal Gas Law", "3.4 Ley de los gases ideales"],
    ["3.5", "3.5 Kinetic Molecular Theory", "3.5 Teoría cinético-molecular"],
    ["3.6", "3.6 Deviation from Ideal Gas Law", "3.6 Desviación de la ley de los gases ideales"],
    ["3.7", "3.7 Solutions and Mixtures", "3.7 Soluciones y mezclas"],
    ["3.8", "3.8 Representations of Solutions", "3.8 Representaciones de soluciones"],
    ["3.9", "3.9 Separation of Solutions and Mixtures", "3.9 Separación de soluciones y mezclas"],
    ["3.10", "3.10 Solubility", "3.10 Solubilidad"],
    ["3.11", "3.11 Spectroscopy and the Electromagnetic Spectrum", "3.11 Espectroscopía y el espectro electromagnético"],
    ["3.12", "3.12 Properties of Photons", "3.12 Propiedades de los fotones"],
    ["3.13", "3.13 Beer-Lambert Law", "3.13 Ley de Beer-Lambert"]
  ].map(function (row) { return {id:row[0], title:p(row[1], row[2])}; });

  mc("3.1-1", "Both CH<sub>4</sub> and CCl<sub>4</sub> are nonpolar. Why does CCl<sub>4</sub> have a higher boiling point?", "Tanto CH<sub>4</sub> como CCl<sub>4</sub> son no polares. ¿Por qué CCl<sub>4</sub> tiene mayor punto de ebullición?", [
    o("Its larger electron distribution gives stronger London dispersion forces.", "Su distribución electrónica más grande produce fuerzas de dispersión de London más intensas.", "", ""),
    o("It forms hydrogen bonds between its molecules.", "Forma puentes de hidrógeno entre sus moléculas.", "CCl<sub>4</sub> has no H atoms, so it cannot donate hydrogen bonds.", "CCl<sub>4</sub> no tiene átomos de H, así que no puede donar puentes de hidrógeno."),
    o("Its molecules have a permanent dipole.", "Sus moléculas tienen un dipolo permanente.", "The symmetric tetrahedral molecule is nonpolar; its bond dipoles cancel.", "La molécula tetraédrica simétrica es no polar; sus dipolos de enlace se cancelan."),
    o("Boiling requires breaking all its C−Cl covalent bonds.", "La ebullición requiere romper todos sus enlaces covalentes C−Cl.", "Boiling separates molecules. It does not require atomizing them.", "La ebullición separa moléculas. No requiere separarlas en átomos.")],
    "London dispersion forces (LDF) occur in all molecules. The larger, more polarizable electron distribution of CCl<sub>4</sub> gives stronger attractions than in CH<sub>4</sub>.",
    "Las fuerzas de dispersión de London (FDL) actúan en todas las moléculas. La distribución electrónica más grande y polarizable de CCl<sub>4</sub> produce atracciones más intensas que en CH<sub>4</sub>.");
  mc("3.1-2", "Why can pure HF form hydrogen bonds while pure HCl does not form the usual strong hydrogen bonds?", "¿Por qué HF puro puede formar puentes de hidrógeno mientras que HCl puro no forma los puentes de hidrógeno fuertes usuales?", [
    o("HF has H directly bonded to F and neighboring F lone pairs.", "HF tiene H unido directamente a F y pares libres en los F vecinos.", "", ""),
    o("Any molecule containing H must form hydrogen bonds.", "Toda molécula que contiene H debe formar puentes de hidrógeno.", "A usual strong donor has H bonded directly to N, O or F, not just any H atom.", "Un donador fuerte usual tiene H unido directamente a N, O o F, no solo cualquier átomo de H."),
    o("HF is ionic, so its solid lattice persists in the liquid.", "HF es iónico, así que su red cristalina sólida persiste en el líquido.", "HF is molecular with a polar covalent bond. The attraction here is between molecules.", "HF es molecular con un enlace covalente polar. La atracción aquí ocurre entre moléculas."),
    o("HCl has no intermolecular attractions.", "HCl no tiene atracciones intermoleculares.", "HCl still has London dispersion and dipole-dipole attractions.", "HCl sí tiene atracciones de dispersión de London y dipolo-dipolo.")],
    "A hydrogen bond is an attraction involving H bonded to a very electronegative atom and a neighboring lone pair. HF meets this condition with F.",
    "Un puente de hidrógeno es una atracción que involucra H unido a un átomo muy electronegativo y un par libre vecino. HF cumple esta condición con F.");
  mc("3.1-3", "Which interactions occur between CH<sub>3</sub>F molecules in a pure liquid?", "¿Qué interacciones ocurren entre moléculas de CH<sub>3</sub>F en un líquido puro?", [
    o("London dispersion and dipole-dipole attractions", "Atracciones de dispersión de London y dipolo-dipolo", "", ""),
    o("Only London dispersion, because all covalent molecules are nonpolar", "Solo dispersión de London, porque todas las moléculas covalentes son no polares", "CH<sub>3</sub>F has a net molecular dipole and thus dipole-dipole attractions.", "CH<sub>3</sub>F tiene un dipolo molecular neto y por ello atracciones dipolo-dipolo."),
    o("Hydrogen bonds donated by its C−H groups", "Puentes de hidrógeno donados por sus grupos C−H", "Its H atoms are bonded to C, not directly to N, O or F.", "Sus átomos de H están unidos a C, no directamente a N, O o F."),
    o("Ion-dipole attractions between separate ions and molecules", "Atracciones ion-dipolo entre iones y moléculas separados", "A pure sample of CH<sub>3</sub>F contains neutral molecules, not dissolved ions.", "Una muestra pura de CH<sub>3</sub>F contiene moléculas neutras, no iones disueltos.")],
    "The molecule is polar, so permanent dipoles attract. London dispersion is also present. Having F alone does not make a molecule a hydrogen bond donor.",
    "La molécula es polar, así que sus dipolos permanentes se atraen. También hay dispersión de London. Tener F por sí solo no hace que una molécula sea donadora de puentes de hidrógeno.");
  mc("3.1-4", "A water molecule points its O end toward a dissolved Na<sup>+</sup> ion. What attraction explains this orientation?", "Una molécula de agua orienta su extremo O hacia un ion Na<sup>+</sup> disuelto. ¿Qué atracción explica esta orientación?", [
    o("Ion-dipole attraction", "Atracción ion-dipolo", "", ""),
    o("A nonpolar covalent Na−O bond", "Un enlace covalente no polar Na−O", "Hydration does not involve equal electron sharing between Na and O.", "La hidratación no implica compartición equitativa de electrones entre Na y O."),
    o("Only attraction between temporary dipoles", "Solo atracción entre dipolos temporales", "Dispersion exists but does not explain the orientation of water's permanent dipole around a full charge.", "La dispersión existe, pero no explica la orientación del dipolo permanente del agua alrededor de una carga completa."),
    o("Repulsion between Na<sup>+</sup> and the O end", "Repulsión entre Na<sup>+</sup> y el extremo O", "The O end is partially negative and is attracted to the positive ion.", "El extremo O es parcialmente negativo y es atraído por el ion positivo.")],
    "The full positive ionic charge attracts water's partial negative O end. This is an ion-dipole interaction, stronger than a comparable neutral dipole-dipole interaction.",
    "La carga iónica positiva completa atrae el extremo O parcialmente negativo del agua. Es una interacción ion-dipolo, más intensa que una interacción dipolo-dipolo neutra comparable.");
  mc("3.1-5", "Which order of increasing normal boiling point fits CH<sub>4</sub>, NH<sub>3</sub>, and H<sub>2</sub>O?", "¿Qué orden de punto de ebullición normal creciente corresponde a CH<sub>4</sub>, NH<sub>3</sub> y H<sub>2</sub>O?", [
    o("CH<sub>4</sub> < NH<sub>3</sub> < H<sub>2</sub>O", "CH<sub>4</sub> < NH<sub>3</sub> < H<sub>2</sub>O", "", ""),
    o("H<sub>2</sub>O < NH<sub>3</sub> < CH<sub>4</sub>", "H<sub>2</sub>O < NH<sub>3</sub> < CH<sub>4</sub>", "This puts the weakly attracting nonpolar methane above both hydrogen bonding substances.", "Esto coloca al metano no polar de atracciones débiles por encima de ambas sustancias con puentes de hidrógeno."),
    o("NH<sub>3</sub> < CH<sub>4</sub> < H<sub>2</sub>O", "NH<sub>3</sub> < CH<sub>4</sub> < H<sub>2</sub>O", "Ammonia's hydrogen bonding raises its boiling point above methane's.", "Los puentes de hidrógeno del amoniaco elevan su punto de ebullición por encima del metano."),
    o("CH<sub>4</sub> < H<sub>2</sub>O < NH<sub>3</sub>", "CH<sub>4</sub> < H<sub>2</sub>O < NH<sub>3</sub>", "Water forms a more extensive, stronger hydrogen bond network than ammonia under these conditions.", "El agua forma una red de puentes de hidrógeno más extensa e intensa que el amoniaco en estas condiciones.")],
    "Methane has only weak dispersion. Ammonia forms hydrogen bonds. Water's extensive hydrogen bond network requires still more energy to separate its molecules.",
    "El metano solo tiene dispersión débil. El amoniaco forma puentes de hidrógeno. La extensa red de puentes de hidrógeno del agua requiere aún más energía para separar sus moléculas.");
  num("3.1-6", "At its boiling point, water requires 40.7 kJ/mol to vaporize. What energy vaporizes 0.250 mol without changing temperature?", "En su punto de ebullición, el agua requiere 40.7 kJ/mol para vaporizarse. ¿Qué energía vaporiza 0.250 mol sin cambiar la temperatura?",
    40.7 * 0.250, "10.2", "kJ", {sf:3},
    "Multiply amount by energy per mole: 0.250 × 40.7 = 10.175 kJ, or 10.2 kJ. The energy overcomes intermolecular attractions rather than breaking O−H bonds.",
    "Multiplica la cantidad por la energía por mol: 0.250 × 40.7 = 10.175 kJ, es decir, 10.2 kJ. La energía vence atracciones intermoleculares en lugar de romper enlaces O−H.");

  mc("3.2-1", "Solid iodine contains discrete I<sub>2</sub> molecules held together mainly by dispersion. What type of solid is it?", "El yodo sólido contiene moléculas discretas de I<sub>2</sub> unidas principalmente por dispersión. ¿Qué tipo de sólido es?", [
    o("Molecular solid", "Sólido molecular", "", ""),
    o("Ionic solid", "Sólido iónico", "The described particles are neutral molecules, not alternating positive and negative ions.", "Las partículas descritas son moléculas neutras, no iones positivos y negativos alternados."),
    o("Metallic solid", "Sólido metálico", "The description has no metal cores or mobile electron sea.", "La descripción no tiene centros metálicos ni un mar de electrones móvil."),
    o("Network covalent solid", "Sólido covalente de red", "Covalent bonds stay within each molecule rather than extending throughout the crystal.", "Los enlaces covalentes permanecen dentro de cada molécula en lugar de extenderse por todo el cristal.")],
    "Classify the connections between particles. Dispersion holds separate iodine molecules together, so the solid is molecular.",
    "Clasifica las conexiones entre partículas. La dispersión mantiene unidas moléculas de yodo separadas, así que el sólido es molecular.");
  mc("3.2-2", "Diamond has a continuous three-dimensional covalent network with electrons localized in bonds. Which properties follow?", "El diamante tiene una red covalente tridimensional continua con electrones localizados en enlaces. ¿Qué propiedades se deducen?", [
    o("Very hard, high melting temperature, poor electrical conduction", "Muy duro, temperatura de fusión alta, mala conducción eléctrica", "", ""),
    o("Soft, low melting temperature, good electrical conduction", "Blando, temperatura de fusión baja, buena conducción eléctrica", "An extended strong covalent network resists deformation and does not supply mobile charge carriers.", "Una red covalente fuerte y extendida resiste la deformación y no aporta portadores móviles de carga."),
    o("Malleable with a freely moving electron sea", "Maleable con un mar de electrones de movimiento libre", "This describes metallic bonding rather than diamond's localized covalent bonds.", "Esto describe el enlace metálico en lugar de los enlaces covalentes localizados del diamante."),
    o("Conducting only because positive and negative ions move", "Conductor solo porque se mueven iones positivos y negativos", "Diamond's model consists of neutral covalently connected carbon atoms, not mobile ions.", "El modelo del diamante consta de átomos neutros de carbono conectados covalentemente, no de iones móviles.")],
    "Deforming or melting this network disrupts many strong covalent connections. Localized bond electrons do not move freely through the solid.",
    "Deformar o fundir esta red altera muchas conexiones covalentes fuertes. Los electrones localizados de enlace no se mueven libremente por el sólido.");
  mc("3.2-3", "Graphite has covalent sheets, delocalized electrons within sheets, and weak attractions between sheets. Which observation fits?", "El grafito tiene láminas covalentes, electrones deslocalizados dentro de las láminas y atracciones débiles entre ellas. ¿Qué observación corresponde?", [
    o("It conducts along sheets and layers can slide easily.", "Conduce a lo largo de las láminas y las capas se deslizan fácilmente.", "", ""),
    o("It cannot conduct because every network solid is an insulator.", "No puede conducir porque todo sólido de red es aislante.", "Graphite is an exception: its delocalized electrons carry charge within sheets.", "El grafito es una excepción: sus electrones deslocalizados transportan carga dentro de las láminas."),
    o("Sliding requires breaking every covalent bond in every sheet.", "Deslizar requiere romper todos los enlaces covalentes de cada lámina.", "Sliding mainly overcomes weak attractions between sheets while retaining their covalent networks.", "El deslizamiento vence principalmente atracciones débiles entre láminas y conserva sus redes covalentes."),
    o("Its conductivity proves it is an ionic solid.", "Su conductividad demuestra que es un sólido iónico.", "Mobile electrons can conduct without mobile ions. Graphite is a carbon network solid.", "Los electrones móviles pueden conducir sin iones móviles. El grafito es un sólido de red de carbono.")],
    "Structure explains both properties: mobile electrons allow conduction, and weak interlayer attractions allow easy sliding.",
    "La estructura explica ambas propiedades: los electrones móviles permiten la conducción y las atracciones débiles entre capas permiten el deslizamiento fácil.");
  mc("3.2-4", "Why does molten NaCl conduct electricity while solid NaCl does not conduct appreciably?", "¿Por qué NaCl fundido conduce electricidad mientras que NaCl sólido no conduce apreciablemente?", [
    o("Its ions can move in the melt but are fixed in the solid lattice.", "Sus iones pueden moverse en el material fundido, pero están fijos en la red cristalina sólida.", "", ""),
    o("Melting converts all ions into neutral atoms.", "La fusión convierte todos los iones en átomos neutros.", "The melt retains charged ions; neutralizing them would remove these charge carriers.", "El material fundido conserva iones cargados; neutralizarlos eliminaría estos portadores de carga."),
    o("Solid NaCl contains no charged particles.", "NaCl sólido no contiene partículas cargadas.", "The solid already contains ions, but they cannot travel through its fixed lattice.", "El sólido ya contiene iones, pero no pueden desplazarse por su red cristalina fija."),
    o("The melt gains a metallic sea of electrons.", "El material fundido adquiere un mar de electrones metálico.", "Ionic conduction is due to mobile ions, not a new metallic bonding model.", "La conducción iónica se debe a iones móviles, no a un nuevo modelo de enlace metálico.")],
    "Electrical conduction requires mobile charge. Melting frees the ions to move without changing their identities.",
    "La conducción eléctrica requiere carga móvil. La fusión libera los iones para moverse sin cambiar sus identidades.");
  mc("3.2-5", "A copper sheet bends without shattering. Which feature of metallic solids explains this behavior?", "Una lámina de cobre se dobla sin romperse en fragmentos. ¿Qué característica de los sólidos metálicos explica este comportamiento?", [
    o("Metal cores stay attracted to delocalized electrons as layers shift.", "Los centros metálicos siguen atraídos por electrones deslocalizados al desplazarse las capas.", "", ""),
    o("Alternating opposite ions become aligned like charges when bent.", "Los iones alternados de carga opuesta quedan alineados con cargas iguales al doblarse.", "That mechanism explains brittleness in many ionic crystals, not metal malleability.", "Ese mecanismo explica la fragilidad de muchos cristales iónicos, no la maleabilidad metálica."),
    o("Bending removes every attraction in the metal.", "Doblar elimina toda atracción en el metal.", "The sheet stays together because cohesive attractions remain.", "La lámina se mantiene unida porque persisten las atracciones de cohesión."),
    o("Copper consists of separate weakly attracted molecules.", "El cobre consta de moléculas separadas débilmente atraídas.", "Copper has an extended metallic structure rather than discrete molecules.", "El cobre tiene una estructura metálica extendida en lugar de moléculas discretas.")],
    "The electron sea can maintain attraction to metal cores after layers move. This explains malleability.",
    "El mar de electrones puede mantener la atracción hacia los centros metálicos después del movimiento de las capas. Esto explica la maleabilidad.");
  num("3.2-6", "How many formula units are present in 0.125 mol of solid NaCl? Choose count as the unit.", "¿Cuántas unidades fórmula hay en 0.125 mol de NaCl sólido? Elige cantidad como unidad.",
    0.125 * 6.022e23, "7.53e22", "count", {sf:3},
    "Multiply by the Avogadro constant: 0.125 mol × 6.022 × 10<sup>23</sup> mol<sup>−1</sup> = 7.5275 × 10<sup>22</sup> formula units. Round to 7.53 × 10<sup>22</sup>. These are formula units, not NaCl molecules.",
    "Multiplica por la constante de Avogadro: 0.125 mol × 6.022 × 10<sup>23</sup> mol<sup>−1</sup> = 7.5275 × 10<sup>22</sup> unidades fórmula. Redondea a 7.53 × 10<sup>22</sup>. Son unidades fórmula, no moléculas de NaCl.");

  mc("3.3-1", "A particle model has closely spaced particles in a disordered arrangement. They move past neighbors while keeping nearly constant volume. Which state is modeled?", "Un modelo de partículas tiene partículas cercanas en una distribución desordenada. Se mueven entre vecinas y mantienen un volumen casi constante. ¿Qué estado se representa?", [
    o("Liquid", "Líquido", "", ""),
    o("Crystalline solid", "Sólido cristalino", "A crystal has ordered sites with particles vibrating near fixed positions.", "Un cristal tiene sitios ordenados con partículas que vibran cerca de posiciones fijas."),
    o("Dilute gas", "Gas diluido", "A dilute gas has large separations and expands to fill its container.", "Un gas diluido tiene separaciones grandes y se expande para llenar su recipiente."),
    o("A collection of motionless particles", "Un conjunto de partículas inmóviles", "Particles remain in thermal motion in all ordinary phases, including liquids.", "Las partículas mantienen movimiento térmico en todas las fases ordinarias, incluidos los líquidos.")],
    "Liquids combine close spacing with the ability to flow. Disorder alone does not mean the particles are far apart.",
    "Los líquidos combinan partículas cercanas con la capacidad de fluir. El desorden por sí solo no significa que las partículas estén muy separadas.");
  mc("3.3-2", "Why is a gas generally much more compressible than a liquid?", "¿Por qué un gas suele ser mucho más compresible que un líquido?", [
    o("A gas has much more empty space between particles.", "Un gas tiene mucho más espacio vacío entre partículas.", "", ""),
    o("Each gas molecule shrinks greatly under ordinary compression.", "Cada molécula gaseosa se encoge mucho durante una compresión ordinaria.", "Compression mainly decreases distances between molecules, not their own sizes.", "La compresión disminuye principalmente las distancias entre moléculas, no sus propios tamaños."),
    o("Gas particles have no mass.", "Las partículas gaseosas no tienen masa.", "Gases have mass; spacing rather than absence of mass explains compressibility.", "Los gases tienen masa; la separación, no la ausencia de masa, explica la compresibilidad."),
    o("Liquid particles cannot move at all.", "Las partículas líquidas no pueden moverse en absoluto.", "Liquid particles move past one another, but they already occupy closely spaced positions.", "Las partículas líquidas se mueven entre sí, pero ya ocupan posiciones muy cercanas.")],
    "Pushing gas particles closer removes large gaps. Liquid particles are already close, leaving much less room to compress.",
    "Acercar las partículas gaseosas reduce huecos grandes. Las partículas líquidas ya están cercanas, dejando mucho menos espacio para comprimir.");
  mc("3.3-3", "A pure solid melts at constant pressure and constant temperature while absorbing heat. What mainly changes?", "Un sólido puro se funde a presión y temperatura constantes mientras absorbe calor. ¿Qué cambia principalmente?", [
    o("Potential energy increases as attractions are overcome.", "La energía potencial aumenta al vencer atracciones.", "", ""),
    o("Average particle kinetic energy steadily increases.", "La energía cinética promedio de las partículas aumenta continuamente.", "Average kinetic energy tracks temperature, which stays constant during this phase change.", "La energía cinética promedio sigue la temperatura, que permanece constante durante este cambio de fase."),
    o("All particle motion stops until melting finishes.", "Todo movimiento de partículas se detiene hasta terminar la fusión.", "Particles continue moving; constant temperature is not zero motion.", "Las partículas continúan moviéndose; temperatura constante no significa movimiento nulo."),
    o("Atoms change into different elements.", "Los átomos se convierten en elementos diferentes.", "Melting changes arrangement and attractions, not nuclear identities.", "La fusión cambia la distribución y las atracciones, no las identidades nucleares.")],
    "During the melting plateau, heat changes particle arrangement and potential energy. It does not raise temperature or average kinetic energy.",
    "Durante el tramo plano de fusión, el calor cambia la distribución de partículas y la energía potencial. No eleva la temperatura ni la energía cinética promedio.");
  mc("3.3-4", "Which particle description models liquid water becoming water vapor without a chemical reaction?", "¿Qué descripción de partículas representa agua líquida que se convierte en vapor de agua sin reacción química?", [
    o("Intact H<sub>2</sub>O molecules become much farther apart.", "Las moléculas intactas de H<sub>2</sub>O quedan mucho más separadas.", "", ""),
    o("Each H<sub>2</sub>O molecule splits into separate H and O atoms.", "Cada molécula de H<sub>2</sub>O se separa en átomos de H y O.", "That breaks covalent bonds and changes molecular identity; ordinary vaporization does not.", "Eso rompe enlaces covalentes y cambia la identidad molecular; la vaporización ordinaria no lo hace."),
    o("Water molecules become larger to fill the container.", "Las moléculas de agua aumentan de tamaño para llenar el recipiente.", "The gas fills space by increased separation, not by inflating individual molecules.", "El gas llena el espacio mediante mayor separación, no al inflar moléculas individuales."),
    o("The molecules form a more tightly packed fixed lattice.", "Las moléculas forman una red cristalina fija más compacta.", "That resembles solidification, whereas vaporization greatly increases separation.", "Eso se parece a la solidificación, mientras que la vaporización aumenta mucho la separación.")],
    "Physical vaporization preserves the H−O covalent bonds within each molecule while overcoming attractions between molecules.",
    "La vaporización física conserva los enlaces covalentes H−O dentro de cada molécula y vence atracciones entre moléculas.");
  num("3.3-5", "A gas sample has mass 6.40 g and volume 4.00 L. What is its density?", "Una muestra gaseosa tiene masa de 6.40 g y volumen de 4.00 L. ¿Cuál es su densidad?",
    6.40 / 4.00, "1.60", "g/L", {sf:3},
    "Density is mass divided by volume: 6.40 g / 4.00 L = 1.60 g/L. Large particle separation accounts for the relatively low mass per volume.",
    "La densidad es masa dividida entre volumen: 6.40 g / 4.00 L = 1.60 g/L. La gran separación de partículas explica la masa relativamente baja por volumen.");
  num("3.3-6", "A closed particle model contains 8 triatomic molecules. They evaporate intact. How many atoms remain in the container?", "Un modelo cerrado de partículas contiene 8 moléculas triatómicas. Se evaporan intactas. ¿Cuántos átomos quedan en el recipiente?",
    8 * 3, "24", "count", {exact:true},
    "There are 8 × 3 = 24 atoms before and after evaporation. A physical phase change in a closed container conserves both atoms and the intact molecules.",
    "Hay 8 × 3 = 24 átomos antes y después de la evaporación. Un cambio físico de fase en un recipiente cerrado conserva los átomos y las moléculas intactas.");

  num("3.4-1", "An ideal gas contains 0.500 mol at 300. K and 1.25 atm. What volume does it occupy?", "Un gas ideal contiene 0.500 mol a 300. K y 1.25 atm. ¿Qué volumen ocupa?",
    0.500 * 0.08206 * 300 / 1.25, "9.85", "L", {sf:3},
    "Use kelvin and the L·atm value of R: V = nRT/P = 0.500 × 0.08206 × 300. / 1.25 = 9.8472 L, or 9.85 L.",
    "Usa kelvin y el valor de R en L·atm: V = nRT/P = 0.500 × 0.08206 × 300. / 1.25 = 9.8472 L, es decir, 9.85 L.");
  num("3.4-2", "What pressure does 0.200 mol of an ideal gas exert in 2.00 L at 310. K?", "¿Qué presión ejerce 0.200 mol de un gas ideal en 2.00 L a 310. K?",
    0.200 * 0.08206 * 310 / 2.00, "2.54", "atm", {sf:3},
    "P = nRT/V = 0.200 × 0.08206 × 310. / 2.00 = 2.54386 atm. Use absolute temperature and round only at the end.",
    "P = nRT/V = 0.200 × 0.08206 × 310. / 2.00 = 2.54386 atm. Usa temperatura absoluta y redondea solo al final.");
  num("3.4-3", "A gas mixture contains 0.300 mol of N<sub>2</sub> and 0.200 mol of O<sub>2</sub>. What is the mole fraction of N<sub>2</sub>?", "Una mezcla gaseosa contiene 0.300 mol de N<sub>2</sub> y 0.200 mol de O<sub>2</sub>. ¿Cuál es la fracción molar de N<sub>2</sub>?",
    0.300 / (0.300 + 0.200), "0.600", "ratio", {sf:3},
    "Mole fraction divides the component amount by the total: 0.300 / (0.300 + 0.200) = 0.600. It has no units.",
    "La fracción molar divide la cantidad del componente entre el total: 0.300 / (0.300 + 0.200) = 0.600. No tiene unidades.");
  num("3.4-4", "An ideal gas mixture has total pressure 2.40 atm and an Ar mole fraction of 0.250. What is the partial pressure of Ar?", "Una mezcla de gases ideales tiene presión total de 2.40 atm y fracción molar de Ar de 0.250. ¿Cuál es la presión parcial de Ar?",
    2.40 * 0.250, "0.600", "atm", {sf:3},
    "Dalton's law gives partial pressure = mole fraction × total pressure = 0.250 × 2.40 = 0.600 atm. The fraction alone is not a pressure.",
    "La ley de Dalton da presión parcial = fracción molar × presión total = 0.250 × 2.40 = 0.600 atm. La fracción por sí sola no es una presión.");
  mc("3.4-5", "A gas collected over water has total pressure 760.0 mmHg. Water vapor contributes 23.8 mmHg. What is the dry gas pressure?", "Un gas recogido sobre agua tiene presión total de 760.0 mmHg. El vapor de agua aporta 23.8 mmHg. ¿Cuál es la presión del gas seco?", [
    o("736.2 mmHg", "736.2 mmHg", "", ""),
    o("783.8 mmHg", "783.8 mmHg", "Adding water vapor to the measured total counts its contribution twice.", "Sumar el vapor de agua al total medido cuenta su contribución dos veces."),
    o("760.0 mmHg", "760.0 mmHg", "The measured total includes water vapor and is not the dry gas pressure.", "El total medido incluye vapor de agua y no es la presión del gas seco."),
    o("23.8 mmHg", "23.8 mmHg", "This is the water vapor pressure, not the other gas's contribution.", "Esta es la presión del vapor de agua, no la contribución del otro gas.")],
    "The total is the sum of partial pressures. Subtract water vapor: 760.0 − 23.8 = 736.2 mmHg.",
    "El total es la suma de presiones parciales. Resta el vapor de agua: 760.0 − 23.8 = 736.2 mmHg.");
  mc("3.4-6", "A sealed rigid vessel of ideal gas warms from 300. K to 600. K. What happens to its pressure?", "Un recipiente rígido sellado con gas ideal se calienta de 300. K a 600. K. ¿Qué ocurre con su presión?", [
    o("It doubles.", "Se duplica.", "", ""),
    o("It halves.", "Se reduce a la mitad.", "At fixed amount and volume, pressure is directly proportional to kelvin temperature, not inversely proportional.", "Con cantidad y volumen fijos, la presión es directamente proporcional a la temperatura en kelvin, no inversamente proporcional."),
    o("It stays constant because volume is fixed.", "Permanece constante porque el volumen es fijo.", "Fixed volume prevents expansion, so greater collision momentum and rate raise pressure.", "El volumen fijo impide la expansión, así que el mayor impulso y frecuencia de colisiones elevan la presión."),
    o("It becomes zero because no gas is added.", "Se vuelve cero porque no se añade gas.", "Existing particles still collide with the walls and exert pressure.", "Las partículas existentes siguen chocando con las paredes y ejerciendo presión.")],
    "PV = nRT gives P proportional to T when n and V are constant. The ratio is 600./300. = 2, using kelvin.",
    "PV = nRT da P proporcional a T cuando n y V son constantes. La razón es 600./300. = 2, usando kelvin.");

  mc("3.5-1", "He and Xe gases are both at 300. K. Compare their average translational kinetic energies per particle.", "Los gases He y Xe están ambos a 300. K. Compara sus energías cinéticas de traslación promedio por partícula.", [
    o("They are equal.", "Son iguales.", "", ""),
    o("He has more because it moves faster on average.", "He tiene más porque se mueve más rápido en promedio.", "He has less mass. Its greater speed gives the same average kinetic energy at equal temperature.", "He tiene menor masa. Su mayor rapidez da la misma energía cinética promedio a igual temperatura."),
    o("Xe has more because each atom has more mass.", "Xe tiene más porque cada átomo tiene mayor masa.", "Xe moves more slowly on average, compensating for its greater mass.", "Xe se mueve más lentamente en promedio, compensando su mayor masa."),
    o("Both have zero because neither is being heated.", "Ambos tienen cero porque ninguno se está calentando.", "Thermal motion exists at this nonzero temperature even without ongoing heating.", "Hay movimiento térmico a esta temperatura distinta de cero aun sin calentamiento continuo.")],
    "Kinetic molecular theory ties average translational kinetic energy to absolute temperature alone. Equal temperature means equal average kinetic energy, not equal speed.",
    "La teoría cinético-molecular relaciona la energía cinética de traslación promedio solo con la temperatura absoluta. Igual temperatura significa igual energía cinética promedio, no igual rapidez.");
  mc("3.5-2", "For the same number of particles of one gas, how does its Maxwell-Boltzmann speed distribution change when temperature increases?", "Para el mismo número de partículas de un gas, ¿cómo cambia su distribución de Maxwell-Boltzmann de rapidez cuando aumenta la temperatura?", [
    o("The peak becomes lower and broader, typical speed increases, and total area stays equal.", "El máximo se vuelve más bajo y ancho, la rapidez típica aumenta y el área total sigue igual.", "", ""),
    o("The peak becomes taller and narrower at a lower speed.", "El máximo se vuelve más alto y estrecho a una rapidez menor.", "That trend corresponds to cooling rather than heating the same gas.", "Esa tendencia corresponde a enfriar en lugar de calentar el mismo gas."),
    o("Every particle acquires exactly the same speed.", "Cada partícula adquiere exactamente la misma rapidez.", "Collisions maintain a distribution of speeds rather than a single shared speed.", "Las colisiones mantienen una distribución de rapideces en lugar de una sola rapidez compartida."),
    o("The area doubles because heating creates new particles.", "El área se duplica porque calentar crea partículas nuevas.", "The particle number is fixed. Heating changes their energy distribution, not their number.", "El número de partículas es fijo. Calentar cambia su distribución de energía, no su número.")],
    "Heating spreads the distribution toward higher speeds. A lower peak is compatible with the same total number because the curve is broader. The schematic is a model.",
    "Calentar extiende la distribución hacia rapideces mayores. Un máximo más bajo es compatible con el mismo número total porque la curva es más ancha. El esquema es un modelo.");
  mc("3.5-3", "At the same temperature, which gas has greater typical particle speed, He or Xe?", "A la misma temperatura, ¿qué gas tiene mayor rapidez típica de partículas, He o Xe?", [
    o("He, because its atoms have less mass", "He, porque sus átomos tienen menor masa", "", ""),
    o("Xe, because its atoms have more mass", "Xe, porque sus átomos tienen mayor masa", "At equal average kinetic energy, greater mass requires smaller typical speed.", "A igual energía cinética promedio, mayor masa requiere menor rapidez típica."),
    o("Both, because equal temperature requires equal speeds", "Ambos, porque igual temperatura requiere igual rapidez", "Temperature fixes average kinetic energy, while speed also depends on particle mass.", "La temperatura fija la energía cinética promedio, mientras que la rapidez también depende de la masa de la partícula."),
    o("Neither, because noble gas atoms do not move", "Ninguno, porque los átomos de gases nobles no se mueven", "Chemical inertness does not eliminate thermal motion.", "La inercia química no elimina el movimiento térmico.")],
    "At fixed temperature, characteristic speed is inversely proportional to the square root of particle mass. The lighter He atoms move faster on average.",
    "A temperatura fija, la rapidez característica es inversamente proporcional a la raíz cuadrada de la masa de la partícula. Los átomos más ligeros de He se mueven más rápido en promedio.");
  mc("3.5-4", "Which assumptions belong to the ideal gas model in kinetic molecular theory?", "¿Qué supuestos pertenecen al modelo de gas ideal en la teoría cinético-molecular?", [
    o("Elastic collisions, negligible particle volume, and negligible interparticle attractions", "Colisiones elásticas, volumen de partículas despreciable y atracciones interpartículas despreciables", "", ""),
    o("Particles lose all kinetic energy in every wall collision", "Las partículas pierden toda su energía cinética en cada colisión con la pared", "Ideal collisions are elastic, so kinetic energy is conserved in the collision.", "Las colisiones ideales son elásticas, así que la energía cinética se conserva durante la colisión."),
    o("Particles remain motionless except when heated", "Las partículas permanecen inmóviles excepto al calentarse", "The model has continuous random particle motion at nonzero temperature.", "El modelo tiene movimiento aleatorio continuo de partículas a temperatura distinta de cero."),
    o("Strong attractions hold all particles at fixed sites", "Atracciones fuertes mantienen todas las partículas en sitios fijos", "Fixed sites describe a solid-like arrangement rather than an ideal gas.", "Los sitios fijos describen una distribución semejante a un sólido en lugar de un gas ideal.")],
    "The ideal model neglects volume and attractions and assumes elastic collisions. These approximations help connect molecular motion to PV = nRT.",
    "El modelo ideal desprecia el volumen y las atracciones y supone colisiones elásticas. Estas aproximaciones ayudan a relacionar el movimiento molecular con PV = nRT.");
  num("3.5-5", "The molar average translational kinetic energy of an ideal gas is (3/2)RT. What is it at 300. K, using R = 8.314 J/(mol·K)?", "La energía cinética de traslación promedio molar de un gas ideal es (3/2)RT. ¿Cuánto vale a 300. K, usando R = 8.314 J/(mol·K)?",
    1.5 * 8.314 * 300, "3.74e3", "J/mol", {sf:3},
    "Multiply (3/2) × 8.314 × 300. = 3741.3 J/mol. This is energy per mole, not the much smaller energy of a single particle.",
    "Multiplica (3/2) × 8.314 × 300. = 3741.3 J/mol. Es energía por mol, no la energía mucho menor de una sola partícula.");
  num("3.5-6", "For one gas, characteristic speed is proportional to the square root of kelvin temperature. What is the speed at 600. K divided by that at 300. K?", "Para un gas, la rapidez característica es proporcional a la raíz cuadrada de la temperatura en kelvin. ¿Cuál es la rapidez a 600. K dividida entre la rapidez a 300. K?",
    Math.sqrt(600 / 300), "1.41", "ratio", {sf:3},
    "The ratio is sqrt(600./300.) = sqrt(2) = 1.4142..., or 1.41. Doubling temperature does not double speed because kinetic energy depends on speed squared.",
    "La razón es sqrt(600./300.) = sqrt(2) = 1.4142..., es decir, 1.41. Duplicar la temperatura no duplica la rapidez porque la energía cinética depende de la rapidez al cuadrado.");

  mc("3.6-1", "Which conditions usually produce the greatest deviation from ideal gas behavior?", "¿Qué condiciones suelen producir la mayor desviación del comportamiento de gas ideal?", [
    o("High pressure and low temperature", "Presión alta y temperatura baja", "", ""),
    o("Low pressure and high temperature", "Presión baja y temperatura alta", "Widely separated, energetic particles make volume and attractions less important.", "Las partículas muy separadas y energéticas hacen menos importantes el volumen y las atracciones."),
    o("Low pressure alone, regardless of temperature", "Solo presión baja, sin importar la temperatura", "Lower pressure reduces crowding; low temperature can still make attractions significant.", "La presión menor reduce la aglomeración; la temperatura baja aún puede hacer significativas las atracciones."),
    o("Any conditions, because real particles have zero volume", "Cualquier condición, porque las partículas reales tienen volumen cero", "Zero particle volume is an ideal approximation, not a property of real particles.", "El volumen nulo de partículas es una aproximación ideal, no una propiedad de partículas reales.")],
    "High pressure crowds particles and makes their finite volume matter. Low temperature reduces kinetic energy, making attractive forces more influential.",
    "La presión alta acerca las partículas y hace importante su volumen finito. La temperatura baja reduce la energía cinética y aumenta la influencia de fuerzas atractivas.");
  mc("3.6-2", "At fixed amount, volume and temperature, attractions dominate a real gas's deviation. How does its pressure compare with the ideal prediction?", "Con cantidad, volumen y temperatura fijos, las atracciones dominan la desviación de un gas real. ¿Cómo se compara su presión con la predicción ideal?", [
    o("Lower, because attractions reduce momentum transfer to the walls", "Menor, porque las atracciones reducen la transferencia de impulso a las paredes", "", ""),
    o("Higher, because attraction pushes particles outward", "Mayor, porque la atracción empuja partículas hacia afuera", "Attraction pulls particles toward neighbors in the gas rather than pushing them toward walls.", "La atracción lleva las partículas hacia vecinas en el gas en lugar de empujarlas hacia las paredes."),
    o("Exactly equal, because attractions can never affect pressure", "Exactamente igual, porque las atracciones nunca pueden afectar la presión", "The ideal model omits attractions, which is precisely the assumption failing here.", "El modelo ideal omite atracciones, que es precisamente el supuesto que falla aquí."),
    o("Zero, because any attraction stops all motion", "Cero, porque cualquier atracción detiene todo movimiento", "Particles still move and collide. Attractions modify pressure without eliminating thermal motion.", "Las partículas siguen moviéndose y chocando. Las atracciones modifican la presión sin eliminar el movimiento térmico.")],
    "Attractions pull particles inward near a wall and reduce the momentum they deliver. When this effect dominates, measured pressure is below nRT/V.",
    "Las atracciones llevan partículas hacia adentro cerca de una pared y reducen el impulso que transfieren. Cuando este efecto domina, la presión medida es menor que nRT/V.");
  mc("3.6-3", "At very high pressure, excluded particle volume dominates a real gas's behavior. What is expected at fixed n, V and T?", "A presión muy alta, el volumen excluido de partículas domina el comportamiento de un gas real. ¿Qué se espera con n, V y T fijos?", [
    o("Pressure above the ideal value because less volume is available for motion", "Presión mayor que el valor ideal porque hay menos volumen disponible para el movimiento", "", ""),
    o("Pressure below ideal because particles occupy no space", "Presión menor que la ideal porque las partículas no ocupan espacio", "Real particles occupy space; the available volume is smaller than the container volume.", "Las partículas reales ocupan espacio; el volumen disponible es menor que el volumen del recipiente."),
    o("Pressure exactly ideal because finite volume only matters at low pressure", "Presión exactamente ideal porque el volumen finito solo importa a presión baja", "Finite volume matters most when particles are crowded at high pressure.", "El volumen finito importa más cuando las partículas están aglomeradas a presión alta."),
    o("Pressure must be zero because the container is rigid", "La presión debe ser cero porque el recipiente es rígido", "Rigid walls still receive collisions. Rigidity fixes volume, not pressure.", "Las paredes rígidas siguen recibiendo colisiones. La rigidez fija el volumen, no la presión.")],
    "Excluding space occupied by particles makes the freely available volume smaller. This raises pressure relative to a point-particle ideal model when that effect dominates.",
    "Excluir el espacio ocupado por partículas reduce el volumen libre disponible. Esto eleva la presión respecto al modelo ideal de partículas puntuales cuando ese efecto domina.");
  mc("3.6-4", "Compare dilute gaseous NH<sub>3</sub> and Ne at the same temperature and molar volume, where attractions are the main correction. Which should have the larger attractive deviation?", "Compara NH<sub>3</sub> y Ne gaseosos diluidos a la misma temperatura y volumen molar, donde las atracciones son la corrección principal. ¿Cuál debe tener la mayor desviación por atracciones?", [
    o("NH<sub>3</sub>, because it has stronger intermolecular attractions", "NH<sub>3</sub>, porque tiene atracciones intermoleculares más intensas", "", ""),
    o("Ne, because noble gases have permanent molecular dipoles", "Ne, porque los gases nobles tienen dipolos moleculares permanentes", "An isolated Ne atom has no permanent molecular dipole; its attractions are dispersion.", "Un átomo aislado de Ne no tiene un dipolo molecular permanente; sus atracciones son de dispersión."),
    o("Both exactly equally, because temperature alone sets attraction strength", "Ambos exactamente igual, porque solo la temperatura fija la intensidad de atracción", "Temperature sets average kinetic energy, but attractions also depend on particle identity.", "La temperatura fija la energía cinética promedio, pero las atracciones también dependen de la identidad de la partícula."),
    o("Neither, because a gas cannot have intermolecular forces", "Ninguno, porque un gas no puede tener fuerzas intermoleculares", "Real gas particles still interact; neglecting forces is an idealization.", "Las partículas de gases reales sí interactúan; despreciar fuerzas es una idealización.")],
    "NH<sub>3</sub> is polar and can hydrogen bond. Ne is monatomic with weaker dispersion. Stronger attractions generally increase attractive deviations under comparable dilute conditions.",
    "NH<sub>3</sub> es polar y puede formar puentes de hidrógeno. Ne es monoatómico con dispersión más débil. Las atracciones más intensas suelen aumentar las desviaciones atractivas en condiciones diluidas comparables.");
  mc("3.6-5", "Which change generally brings a real gas closer to ideal behavior while it remains gaseous?", "¿Qué cambio suele acercar un gas real al comportamiento ideal mientras permanece gaseoso?", [
    o("Lower pressure and raise temperature", "Bajar la presión y elevar la temperatura", "", ""),
    o("Raise pressure and lower temperature", "Elevar la presión y bajar la temperatura", "This increases crowding and the relative influence of attractions.", "Esto aumenta la aglomeración y la influencia relativa de las atracciones."),
    o("Cool until it condenses", "Enfriar hasta que se condense", "Condensation marks the failure of a gas-only ideal model.", "La condensación marca el fallo de un modelo ideal que solo describe un gas."),
    o("Compress until particle volume occupies most of the vessel", "Comprimir hasta que el volumen de partículas ocupe casi todo el recipiente", "Extreme crowding makes the negligible-volume assumption especially poor.", "La aglomeración extrema hace especialmente mala la suposición de volumen despreciable.")],
    "Lower pressure increases separation. Higher temperature makes kinetic energy large relative to attractions. Both favor the ideal approximation.",
    "La presión menor aumenta la separación. La temperatura mayor hace grande la energía cinética respecto a las atracciones. Ambas favorecen la aproximación ideal.");
  num("3.6-6", "For fixed n, V and T, the ideal pressure is 2.00 atm and the measured pressure is 2.20 atm. Find Z = P(measured)/P(ideal).", "Con n, V y T fijos, la presión ideal es 2.00 atm y la presión medida es 2.20 atm. Calcula Z = P(medida)/P(ideal).",
    2.20 / 2.00, "1.10", "ratio", {sf:3},
    "Z = 2.20/2.00 = 1.10, with no units. A value above unity is consistent with excluded-volume effects dominating the net deviation.",
    "Z = 2.20/2.00 = 1.10, sin unidades. Un valor mayor que la unidad es compatible con el predominio de efectos de volumen excluido en la desviación neta.");

  num("3.7-1", "A solution contains 0.150 mol of glucose in 0.600 L of solution. What is its molarity?", "Una solución contiene 0.150 mol de glucosa en 0.600 L de solución. ¿Cuál es su molaridad?",
    0.150 / 0.600, "0.250", "M", {sf:3},
    "Molarity is moles of solute per liter of solution: 0.150/0.600 = 0.250 M. Use the final solution volume.",
    "La molaridad es moles de soluto por litro de solución: 0.150/0.600 = 0.250 M. Usa el volumen final de la solución.");
  num("3.7-2", "Dissolve 5.844 g of NaCl and dilute to 0.500 L of solution. Using the reference atomic masses, what is the NaCl molarity?", "Disuelve 5.844 g de NaCl y diluye hasta 0.500 L de solución. Usando las masas atómicas de consulta, ¿cuál es la molaridad de NaCl?",
    (5.844 / (22.99 + 35.45)) / 0.500, "0.200", "M", {sf:3},
    "NaCl molar mass = 22.99 + 35.45 = 58.44 g/mol. Moles = 5.844/58.44 = 0.1000 mol. Molarity = 0.1000/0.500 = 0.200 M.",
    "Masa molar de NaCl = 22.99 + 35.45 = 58.44 g/mol. Moles = 5.844/58.44 = 0.1000 mol. Molaridad = 0.1000/0.500 = 0.200 M.");
  num("3.7-3", "Dilute 25.0 mL of 0.120 M solution to a final volume of 100.0 mL. What is the final molarity?", "Diluye 25.0 mL de solución 0.120 M hasta un volumen final de 100.0 mL. ¿Cuál es la molaridad final?",
    0.120 * 25.0 / 100.0, "0.0300", "M", {sf:3},
    "Conserve solute: M(initial)V(initial) = M(final)V(final). Thus M(final) = 0.120 × 25.0/100.0 = 0.0300 M. The equal volume units cancel.",
    "Conserva el soluto: M(inicial)V(inicial) = M(final)V(final). Así M(final) = 0.120 × 25.0/100.0 = 0.0300 M. Las unidades iguales de volumen se cancelan.");
  mc("3.7-4", "Salt is completely dissolved in water, forming a uniform single liquid phase. How is the sample classified?", "La sal está completamente disuelta en agua y forma una sola fase líquida uniforme. ¿Cómo se clasifica la muestra?", [
    o("Homogeneous mixture", "Mezcla homogénea", "", ""),
    o("Pure compound", "Compuesto puro", "The sample contains both salt and water with a variable composition.", "La muestra contiene sal y agua con una composición variable."),
    o("Heterogeneous mixture with separate salt crystals", "Mezcla heterogénea con cristales de sal separados", "The prompt states complete dissolution and a uniform single phase.", "El enunciado indica disolución completa y una sola fase uniforme."),
    o("A new element made from salt and water", "Un elemento nuevo formado por sal y agua", "Mixing does not change nuclei or create a new element.", "Mezclar no cambia núcleos ni crea un elemento nuevo.")],
    "A solution is homogeneous at the macroscopic scale. Its components are mixed uniformly without requiring a fixed chemical formula for the whole sample.",
    "Una solución es homogénea a escala macroscópica. Sus componentes están mezclados uniformemente sin requerir una fórmula química fija para toda la muestra.");
  mc("3.7-5", "How should a student prepare a solution with a specified final volume for an accurate molarity?", "¿Cómo debe un estudiante preparar una solución con un volumen final especificado para obtener una molaridad precisa?", [
    o("Dissolve the solute, then add solvent to the final volume mark.", "Disolver el soluto y después añadir disolvente hasta la marca del volumen final.", "", ""),
    o("Add the solid to the full target volume of solvent without checking final volume.", "Añadir el sólido al volumen objetivo completo de disolvente sin revisar el volumen final.", "Solute can change volume; molarity uses solution volume, not initial solvent volume.", "El soluto puede cambiar el volumen; la molaridad usa el volumen de solución, no el volumen inicial de disolvente."),
    o("Use solute mass in grams as though it were moles.", "Usar la masa de soluto en gramos como si fueran moles.", "Moles require dividing mass by molar mass before calculating molarity.", "Los moles requieren dividir la masa entre la masa molar antes de calcular la molaridad."),
    o("Ignore the volume because molarity depends only on solute identity.", "Ignorar el volumen porque la molaridad depende solo de la identidad del soluto.", "The same solute amount gives different molarities in different solution volumes.", "La misma cantidad de soluto da molaridades diferentes en volúmenes de solución diferentes.")],
    "Molarity divides solute moles by final solution volume. Dissolve first, then dilute to the specified mark and mix thoroughly.",
    "La molaridad divide los moles de soluto entre el volumen final de solución. Disuelve primero, diluye hasta la marca especificada y mezcla bien.");
  mc("3.7-6", "Water is added to a solution without spilling or reacting with the solute. Which quantity stays constant?", "Se añade agua a una solución sin derramar ni reaccionar con el soluto. ¿Qué cantidad permanece constante?", [
    o("Moles of solute", "Moles de soluto", "", ""),
    o("Molarity", "Molaridad", "Increasing solution volume at fixed solute amount decreases molarity.", "Aumentar el volumen de solución con cantidad fija de soluto disminuye la molaridad."),
    o("Total solution volume", "Volumen total de solución", "Adding water changes the volume; it does not keep it fixed.", "Añadir agua cambia el volumen; no lo mantiene fijo."),
    o("Solute particles per liter", "Partículas de soluto por litro", "The particles are spread through a larger volume, reducing their number per liter.", "Las partículas se distribuyen en un volumen mayor, reduciendo su número por litro.")],
    "Dilution adds solvent without adding or removing solute. Conserved moles explain the dilution relation.",
    "La dilución añade disolvente sin añadir ni retirar soluto. Los moles conservados explican la relación de dilución.");

  mc("3.8-1", "A particle model dissolves 3 NaCl formula units completely. Water molecules are omitted. Which description is correct?", "Un modelo de partículas disuelve completamente 3 unidades fórmula de NaCl. Se omiten las moléculas de agua. ¿Qué descripción es correcta?", [
    o("3 separate Na<sup>+</sup> ions and 3 separate Cl<sup>−</sup> ions dispersed throughout", "3 iones Na<sup>+</sup> separados y 3 iones Cl<sup>−</sup> separados distribuidos por todo el líquido", "", ""),
    o("3 intact neutral NaCl molecules floating together", "3 moléculas neutras intactas de NaCl flotando juntas", "A soluble ionic compound dissociates into ions in this model rather than remaining as molecules.", "Un compuesto iónico soluble se disocia en iones en este modelo en lugar de permanecer como moléculas."),
    o("3 Na<sup>+</sup> ions with no anions", "3 iones Na<sup>+</sup> sin aniones", "This loses chloride and violates the sample's charge balance.", "Esto pierde cloruro y viola el balance de carga de la muestra."),
    o("6 Na<sup>+</sup> ions and 3 Cl<sup>−</sup> ions", "6 iones Na<sup>+</sup> y 3 iones Cl<sup>−</sup>", "NaCl has equal counts of the two ions, not twice as many sodium ions.", "NaCl tiene cantidades iguales de ambos iones, no el doble de iones de sodio.")],
    "The formula gives equal sodium and chloride counts. Dissociation separates the ions, and their equal opposite charges keep the whole solution neutral.",
    "La fórmula da cantidades iguales de sodio y cloruro. La disociación separa los iones y sus cargas opuestas iguales mantienen neutra la solución completa.");
  mc("3.8-2", "A water-omitted particle model shows complete dissolution of 2 CaCl<sub>2</sub> formula units. Which ion counts and charges fit?", "Un modelo de partículas sin agua muestra la disolución completa de 2 unidades fórmula de CaCl<sub>2</sub>. ¿Qué cantidades y cargas de iones corresponden?", [
    o("2 Ca<sup>2+</sup> and 4 Cl<sup>−</sup>", "2 Ca<sup>2+</sup> y 4 Cl<sup>−</sup>", "", ""),
    o("2 Ca<sup>+</sup> and 2 Cl<sup>−</sup>", "2 Ca<sup>+</sup> y 2 Cl<sup>−</sup>", "This assigns calcium the wrong charge and loses half of the chloride ions.", "Esto asigna al calcio una carga incorrecta y pierde la mitad de los iones cloruro."),
    o("4 Ca<sup>2+</sup> and 2 Cl<sup>−</sup>", "4 Ca<sup>2+</sup> y 2 Cl<sup>−</sup>", "The formula requires twice as much chloride as calcium, not the reverse.", "La fórmula requiere el doble de cloruro que de calcio, no al revés."),
    o("2 Ca<sup>2+</sup> and 2 Cl<sup>2−</sup>", "2 Ca<sup>2+</sup> y 2 Cl<sup>2−</sup>", "The subscript counts chloride ions; it does not give each chloride a double negative charge.", "El subíndice cuenta iones cloruro; no da a cada cloruro una carga negativa doble.")],
    "Each formula unit produces one calcium ion and two chloride ions. The total positive and negative charges cancel.",
    "Cada unidad fórmula produce un ion calcio y dos iones cloruro. Las cargas positivas y negativas totales se cancelan.");
  mc("3.8-3", "In a hydration model around Cl<sup>−</sup>, which orientation of nearby water molecules is favored?", "En un modelo de hidratación alrededor de Cl<sup>−</sup>, ¿qué orientación de las moléculas de agua cercanas se favorece?", [
    o("The partially positive H ends face the ion.", "Los extremos H parcialmente positivos apuntan hacia el ion.", "", ""),
    o("The partially negative O ends face the ion.", "Los extremos O parcialmente negativos apuntan hacia el ion.", "Negative oxygen ends repel the negative chloride ion.", "Los extremos de oxígeno negativos repelen el ion cloruro negativo."),
    o("Every water molecule becomes nonpolar.", "Cada molécula de agua se vuelve no polar.", "Water retains its polar bonds and bent shape during ordinary hydration.", "El agua conserva sus enlaces polares y forma angular durante la hidratación ordinaria."),
    o("Cl<sup>−</sup> must lose its charge before water can approach.", "Cl<sup>−</sup> debe perder su carga antes de que el agua pueda acercarse.", "The ionic charge is what attracts the positive ends of the water dipoles.", "La carga iónica es lo que atrae los extremos positivos de los dipolos del agua.")],
    "Water's H ends are partially positive. They orient toward the anion through ion-dipole attraction; the O ends point generally away.",
    "Los extremos H del agua son parcialmente positivos. Se orientan hacia el anión por atracción ion-dipolo; los extremos O apuntan generalmente hacia afuera.");
  mc("3.8-4", "Sucrose is a molecular nonelectrolyte that dissolves without reacting. Which description fits its aqueous particle model?", "La sacarosa es un no electrolito molecular que se disuelve sin reaccionar. ¿Qué descripción corresponde a su modelo de partículas acuosas?", [
    o("Intact neutral sucrose molecules dispersed among water molecules", "Moléculas neutras intactas de sacarosa dispersas entre moléculas de agua", "", ""),
    o("Separate carbon, hydrogen and oxygen atoms", "Átomos separados de carbono, hidrógeno y oxígeno", "Dissolving does not require breaking sucrose into its constituent atoms.", "Disolver no requiere separar la sacarosa en sus átomos constituyentes."),
    o("Equal positive and negative sucrose ions", "Iones de sacarosa positivos y negativos en cantidades iguales", "A nonelectrolyte remains molecular rather than dissociating into ions.", "Un no electrolito permanece molecular en lugar de disociarse en iones."),
    o("Only water molecules, because dissolved sucrose disappears", "Solo moléculas de agua, porque la sacarosa disuelta desaparece", "The sucrose remains present even when individual molecules are invisible to the eye.", "La sacarosa sigue presente aunque las moléculas individuales sean invisibles al ojo.")],
    "Dissolution disperses intact sucrose molecules. A homogeneous appearance does not imply loss of solute or production of ions.",
    "La disolución dispersa moléculas intactas de sacarosa. Un aspecto homogéneo no implica pérdida de soluto ni producción de iones.");
  num("3.8-5", "In a simplified model, 4 AlCl<sub>3</sub> formula units dissociate completely into Al<sup>3+</sup> and Cl<sup>−</sup>. Ignoring hydration and hydrolysis, how many total solute ions are shown?", "En un modelo simplificado, 4 unidades fórmula de AlCl<sub>3</sub> se disocian completamente en Al<sup>3+</sup> y Cl<sup>−</sup>. Ignorando hidratación e hidrólisis, ¿cuántos iones de soluto totales se muestran?",
    4 * (1 + 3), "16", "count", {exact:true},
    "Each formula unit gives one cation plus three anions. Thus 4 × (1 + 3) = 16 total ions. Ion charge and ion count are different quantities.",
    "Cada unidad fórmula da un catión más tres aniones. Así 4 × (1 + 3) = 16 iones totales. La carga iónica y la cantidad de iones son cantidades diferentes.");
  num("3.8-6", "A model assumes complete dissociation of CaCl<sub>2</sub> at 0.150 M. What is the chloride ion molarity?", "Un modelo supone disociación completa de CaCl<sub>2</sub> 0.150 M. ¿Cuál es la molaridad de iones cloruro?",
    2 * 0.150, "0.300", "M", {sf:3},
    "Each CaCl<sub>2</sub> formula unit supplies two chloride ions. Chloride molarity is 2 × 0.150 = 0.300 M; calcium molarity remains 0.150 M.",
    "Cada unidad fórmula de CaCl<sub>2</sub> aporta dos iones cloruro. La molaridad de cloruro es 2 × 0.150 = 0.300 M; la molaridad de calcio sigue siendo 0.150 M.");

  num("3.9-1", "In chromatography, a solute spot moves 2.40 cm while the solvent front moves 6.00 cm from the same origin. What is its retention factor Rf?", "En cromatografía, una mancha de soluto recorre 2.40 cm mientras que el frente del disolvente recorre 6.00 cm desde el mismo origen. ¿Cuál es su factor de retención Rf?",
    2.40 / 6.00, "0.400", "ratio", {sf:3},
    "Rf = distance traveled by solute / distance traveled by solvent front = 2.40/6.00 = 0.400. Both distances start at the origin; the length units cancel.",
    "Rf = distancia recorrida por el soluto / distancia recorrida por el frente del disolvente = 2.40/6.00 = 0.400. Ambas distancias parten del origen; las unidades de longitud se cancelan.");
  num("3.9-2", "Evaporate all water from 0.100 L of 0.200 M NaCl, recovering all nonvolatile salt without decomposition. What mass of dry NaCl remains?", "Evapora toda el agua de 0.100 L de NaCl 0.200 M y recupera toda la sal no volátil sin descomposición. ¿Qué masa de NaCl seco queda?",
    0.100 * 0.200 * (22.99 + 35.45), "1.17", "g", {sf:3},
    "Moles = 0.100 × 0.200 = 0.0200 mol. Multiply by 58.44 g/mol: mass = 1.1688 g, or 1.17 g. Evaporation removes solvent, leaving the nonvolatile solute.",
    "Moles = 0.100 × 0.200 = 0.0200 mol. Multiplica por 58.44 g/mol: masa = 1.1688 g, es decir, 1.17 g. La evaporación retira disolvente y deja el soluto no volátil.");
  mc("3.9-3", "Using the same stationary and mobile phases, a solute is more strongly attracted to the stationary phase. How does its Rf generally change?", "Usando las mismas fases estacionaria y móvil, un soluto es atraído con más fuerza por la fase estacionaria. ¿Cómo suele cambiar su Rf?", [
    o("It decreases.", "Disminuye.", "", ""),
    o("It increases above the solvent front.", "Aumenta por encima del frente del disolvente.", "Stronger retention slows the solute instead of carrying it ahead of the solvent front.", "Una retención mayor frena el soluto en lugar de llevarlo por delante del frente del disolvente."),
    o("It must always become exactly unity.", "Siempre debe volverse exactamente igual a la unidad.", "Unity would mean the spot moves as far as the solvent front, inconsistent with stronger retention.", "La unidad significaría que la mancha avanza tanto como el frente del disolvente, contrario a una retención mayor."),
    o("It becomes negative because attraction reverses distance.", "Se vuelve negativo porque la atracción invierte la distancia.", "Retention reduces forward travel; the distance ratio is not a negative force value.", "La retención reduce el avance; la razón de distancias no es un valor negativo de fuerza.")],
    "A solute spending more time on the stationary phase travels less with the mobile phase. Its distance divided by the same solvent-front distance is smaller.",
    "Un soluto que pasa más tiempo en la fase estacionaria avanza menos con la fase móvil. Su distancia dividida entre la misma distancia del frente del disolvente es menor.");
  mc("3.9-4", "A thin-layer chromatography plate has a fixed silica coating and a solvent moving upward. Which phase assignment is correct?", "Una placa de cromatografía en capa fina tiene un recubrimiento fijo de sílice y un disolvente que sube. ¿Qué asignación de fases es correcta?", [
    o("Silica is the stationary phase; solvent is the mobile phase.", "La sílice es la fase estacionaria; el disolvente es la fase móvil.", "", ""),
    o("Silica is the mobile phase; solvent is the stationary phase.", "La sílice es la fase móvil; el disolvente es la fase estacionaria.", "This reverses the fixed coating and the flowing liquid.", "Esto invierte el recubrimiento fijo y el líquido que fluye."),
    o("Both phases are stationary because the plate does not move.", "Ambas fases son estacionarias porque la placa no se mueve.", "The solvent moves relative to the coating even when the plate stays fixed.", "El disolvente se mueve respecto al recubrimiento aunque la placa permanezca fija."),
    o("The solute spot is always the stationary phase.", "La mancha de soluto siempre es la fase estacionaria.", "The solute is separated by its interactions with both phases; it is not the fixed adsorbent.", "El soluto se separa por sus interacciones con ambas fases; no es el adsorbente fijo.")],
    "The stationary phase stays in place. The mobile phase carries solute past it, with different attractions producing different travel distances.",
    "La fase estacionaria permanece en su lugar. La fase móvil lleva soluto a través de ella y las atracciones diferentes producen distancias de recorrido distintas.");
  mc("3.9-5", "An ideal miscible liquid mixture is distilled away from any azeotrope. Which component is enriched in the first condensed vapor?", "Se destila una mezcla ideal de líquidos miscibles lejos de cualquier azeótropo. ¿Qué componente se concentra en el primer vapor condensado?", [
    o("The more volatile component with the lower boiling point", "El componente más volátil con menor punto de ebullición", "", ""),
    o("The less volatile component with the higher boiling point", "El componente menos volátil con mayor punto de ebullición", "The more volatile component contributes disproportionately to the vapor.", "El componente más volátil contribuye de manera desproporcionada al vapor."),
    o("Only the component with greater density", "Solo el componente de mayor densidad", "Distillation separates by volatility, not directly by density.", "La destilación separa por volatilidad, no directamente por densidad."),
    o("Both in exactly the liquid composition at every stage", "Ambos exactamente en la composición del líquido en cada etapa", "Different volatilities make vapor and liquid compositions differ in the stated ideal mixture.", "Las volatilidades diferentes hacen distintas las composiciones del vapor y el líquido en la mezcla ideal indicada.")],
    "Distillation uses vapor-liquid composition differences. The first distillate is enriched in the more volatile component, but need not be pure.",
    "La destilación usa diferencias de composición entre vapor y líquido. El primer destilado se concentra en el componente más volátil, pero no tiene que ser puro.");
  mc("3.9-6", "A mixture contains insoluble sand and dissolved NaCl in water. What can ordinary filtration remove?", "Una mezcla contiene arena insoluble y NaCl disuelto en agua. ¿Qué puede retirar la filtración ordinaria?", [
    o("Sand, while dissolved salt passes through with water", "Arena, mientras la sal disuelta pasa con el agua", "", ""),
    o("Dissolved NaCl, while all sand passes through", "NaCl disuelto, mientras toda la arena pasa", "The solid grains are retained; dissolved ions pass through ordinary filter pores.", "Los granos sólidos se retienen; los iones disueltos pasan por los poros de un filtro ordinario."),
    o("Both sand and dissolved salt completely", "Tanto arena como sal disuelta por completo", "An ordinary filter does not separate dissolved ions from water.", "Un filtro ordinario no separa los iones disueltos del agua."),
    o("Only water molecules, leaving all ions in the filter", "Solo moléculas de agua, dejando todos los iones en el filtro", "That would require a specialized membrane, not the ordinary filtration described.", "Eso requeriría una membrana especializada, no la filtración ordinaria descrita.")],
    "Filtration separates suspended solids by size. Recovering dissolved salt requires another method such as evaporation.",
    "La filtración separa sólidos suspendidos por tamaño. Recuperar la sal disuelta requiere otro método, como la evaporación.");

  mc("3.10-1", "Ethanol and water form a single liquid phase over their full composition range. Which explanation fits their miscibility?", "El etanol y el agua forman una sola fase líquida en todo su intervalo de composición. ¿Qué explicación corresponde a su miscibilidad?", [
    o("Ethanol's hydroxyl group can hydrogen bond with water.", "El grupo hidroxilo del etanol puede formar puentes de hidrógeno con el agua.", "", ""),
    o("Ethanol must become an ionic solid in water.", "El etanol debe volverse un sólido iónico en agua.", "The mixed liquid contains neutral molecules; miscibility does not require ion formation.", "El líquido mezclado contiene moléculas neutras; la miscibilidad no requiere formación de iones."),
    o("Water has no attractions that need to be replaced.", "El agua no tiene atracciones que deban reemplazarse.", "Water has strong hydrogen bonding. Favorable solute-solvent interactions help replace it.", "El agua tiene puentes de hidrógeno fuertes. Las interacciones favorables soluto-disolvente ayudan a reemplazarlos."),
    o("All substances with carbon are fully miscible with water.", "Todas las sustancias con carbono son totalmente miscibles con agua.", "Many carbon-containing substances are nonpolar and poorly soluble; the hydroxyl group matters here.", "Muchas sustancias con carbono son no polares y poco solubles; aquí importa el grupo hidroxilo.")],
    "Like dissolves like: compatible polar and hydrogen bonding interactions favor mixing. Ethanol and water are miscible.",
    "Lo semejante disuelve a lo semejante: las interacciones polares y de puente de hidrógeno compatibles favorecen la mezcla. El etanol y el agua son miscibles.");
  mc("3.10-2", "Why do nonpolar oil and water form separate liquid layers under ordinary conditions?", "¿Por qué el aceite no polar y el agua forman capas líquidas separadas en condiciones ordinarias?", [
    o("Oil-water attractions do not adequately replace water's hydrogen bonding network.", "Las atracciones aceite-agua no reemplazan adecuadamente la red de puentes de hidrógeno del agua.", "", ""),
    o("Oil has no London dispersion forces.", "El aceite no tiene fuerzas de dispersión de London.", "Oil has dispersion forces, but that alone does not make mixing with water favorable.", "El aceite tiene fuerzas de dispersión, pero eso por sí solo no hace favorable mezclarse con agua."),
    o("Separate layers prove that neither liquid's particles move.", "Las capas separadas demuestran que las partículas de ninguno de los líquidos se mueven.", "Both liquids have thermal particle motion despite their macroscopic separation.", "Ambos líquidos tienen movimiento térmico de partículas pese a su separación macroscópica."),
    o("Any two liquids of different densities must be immiscible.", "Cualesquiera dos líquidos de densidades diferentes deben ser inmiscibles.", "Different densities do not prevent miscibility when intermolecular interactions favor mixing.", "Las densidades diferentes no impiden la miscibilidad cuando las interacciones intermoleculares favorecen la mezcla.")],
    "Oil and water are immiscible. Solubility depends on the balance of attractions and dispersal, not simply on density or the presence of some attraction.",
    "El aceite y el agua son inmiscibles. La solubilidad depende del balance de atracciones y dispersión de partículas, no solo de la densidad ni de la presencia de alguna atracción.");
  mc("3.10-3", "Which statement best explains why water dissolves many ionic compounds but not every ionic compound?", "¿Qué afirmación explica mejor por qué el agua disuelve muchos compuestos iónicos, pero no todos?", [
    o("Ion-dipole hydration competes with lattice and solvent attractions; the overall balance matters.", "La hidratación ion-dipolo compite con atracciones de la red y del disolvente; importa el balance total.", "", ""),
    o("All ionic lattices require zero energy to separate.", "Todas las redes iónicas requieren energía nula para separarse.", "Separating oppositely charged ions requires overcoming their attractions.", "Separar iones de cargas opuestas requiere vencer sus atracciones."),
    o("Any ion-dipole attraction guarantees unlimited solubility.", "Cualquier atracción ion-dipolo garantiza solubilidad ilimitada.", "Hydration is only one contribution; strong lattice attractions can oppose dissolution.", "La hidratación es solo una contribución; las atracciones fuertes de la red pueden oponerse a la disolución."),
    o("Water dissolves ions only by changing them into neutral atoms.", "El agua disuelve iones solo al convertirlos en átomos neutros.", "Dissolved ions retain their charges and become surrounded by water molecules.", "Los iones disueltos conservan sus cargas y quedan rodeados de moléculas de agua.")],
    "Dissolution separates solute particles and solvent neighbors, then forms new interactions. The net energetic and dispersal effects determine how much dissolves.",
    "La disolución separa partículas de soluto y vecinas del disolvente y luego forma interacciones nuevas. Los efectos netos de energía y dispersión de partículas determinan cuánto se disuelve.");
  mc("3.10-4", "At fixed temperature, the partial pressure of a nonreacting gas above water increases. What usually happens to its equilibrium solubility?", "A temperatura fija, aumenta la presión parcial de un gas que no reacciona sobre agua. ¿Qué suele ocurrir con su solubilidad de equilibrio?", [
    o("It increases.", "Aumenta.", "", ""),
    o("It decreases because more gas always escapes.", "Disminuye porque siempre escapa más gas.", "Higher gas partial pressure favors more gas entering solution at equilibrium.", "La mayor presión parcial del gas favorece que entre más gas a la solución en equilibrio."),
    o("It becomes independent of pressure.", "Se vuelve independiente de la presión.", "Gas solubility commonly depends on its pressure above the liquid.", "La solubilidad de un gas suele depender de su presión sobre el líquido."),
    o("The gas must become a new element.", "El gas debe convertirse en un elemento nuevo.", "A physical pressure change does not change nuclear identities.", "Un cambio físico de presión no cambia las identidades nucleares.")],
    "For a dilute nonreacting gas at fixed temperature, dissolved concentration increases with its partial pressure, consistent with Henry's law.",
    "Para un gas diluido que no reacciona a temperatura fija, la concentración disuelta aumenta con su presión parcial, de acuerdo con la ley de Henry.");
  mc("3.10-5", "A gas dissolves exothermically in water. At fixed gas partial pressure, what is expected when the solution is warmed?", "Un gas se disuelve exotérmicamente en agua. A presión parcial fija del gas, ¿qué se espera al calentar la solución?", [
    o("Equilibrium gas solubility decreases.", "La solubilidad de equilibrio del gas disminuye.", "", ""),
    o("Gas solubility must increase because every solute dissolves better when warm.", "La solubilidad del gas debe aumentar porque todo soluto se disuelve mejor al calentarse.", "There is no universal increase with temperature; the stated gas dissolution releases heat.", "No hay un aumento universal con la temperatura; la disolución del gas indicado libera calor."),
    o("The gas partial pressure necessarily doubles.", "La presión parcial del gas necesariamente se duplica.", "The question holds gas partial pressure fixed while changing temperature.", "La pregunta mantiene fija la presión parcial del gas mientras cambia la temperatura."),
    o("All dissolved molecules must break their covalent bonds.", "Todas las moléculas disueltas deben romper sus enlaces covalentes.", "Changing physical solubility does not require decomposition of the gas molecules.", "Cambiar la solubilidad física no requiere descomponer las moléculas del gas.")],
    "For the stated exothermic dissolution, warming favors gas leaving the solution. The temperature trend for solids can differ and must be assessed separately.",
    "Para la disolución exotérmica indicada, calentar favorece que el gas salga de la solución. La tendencia con temperatura de los sólidos puede diferir y debe evaluarse por separado.");
  num("3.10-6", "At a specified temperature, a salt's solubility is 20.0 g per 100. g of water. What maximum salt mass dissolves in 75.0 g of water at that temperature?", "A una temperatura especificada, la solubilidad de una sal es 20.0 g por 100. g de agua. ¿Qué masa máxima de sal se disuelve en 75.0 g de agua a esa temperatura?",
    20.0 / 100 * 75.0, "15.0", "g", {sf:3},
    "Scale the solute-to-water mass ratio: (20.0/100.) × 75.0 = 15.0 g. The denominator is water mass, not total solution mass.",
    "Ajusta la razón de masa soluto-agua: (20.0/100.) × 75.0 = 15.0 g. El denominador es la masa del agua, no la masa total de solución.");

  mc("3.11-1", "Microwave absorption by a suitable polar gas molecule commonly changes which kind of energy level?", "La absorción de microondas por una molécula gaseosa polar adecuada suele cambiar ¿qué tipo de nivel de energía?", [
    o("Rotational", "Rotacional", "", ""),
    o("Nuclear composition", "Composición nuclear", "Microwave photons do not ordinarily change proton or neutron counts.", "Los fotones de microondas no cambian ordinariamente las cantidades de protones o neutrones."),
    o("Valence electronic levels typical of ultraviolet absorption", "Niveles electrónicos de valencia típicos de absorción ultravioleta", "Typical electronic gaps are much larger than microwave rotational gaps.", "Las separaciones electrónicas típicas son mucho mayores que las rotacionales de microondas."),
    o("Complete molecular ionization in every collision", "Ionización molecular completa en cada colisión", "Microwave photons are generally far too low in energy for molecular ionization.", "Los fotones de microondas generalmente tienen energía demasiado baja para la ionización molecular.")],
    "Microwaves commonly probe molecular rotations. Absorption requires an allowed transition with an energy gap matching the photon.",
    "Las microondas suelen estudiar rotaciones moleculares. La absorción requiere una transición permitida con una separación de energía que coincida con el fotón.");
  mc("3.11-2", "An infrared spectrum has a band associated with stretching a polar bond. Which motion is excited?", "Un espectro infrarrojo tiene una banda asociada con el estiramiento de un enlace polar. ¿Qué movimiento se excita?", [
    o("Molecular vibration", "Vibración molecular", "", ""),
    o("Conversion of a neutron into a proton", "Conversión de un neutrón en un protón", "Infrared spectroscopy probes molecular energy, not nuclear transmutation.", "La espectroscopía infrarroja estudia energía molecular, no transmutación nuclear."),
    o("Removal of every core electron", "Extracción de todos los electrones internos", "Removing core electrons requires much higher photon energies.", "Extraer electrones internos requiere energías de fotones mucho mayores."),
    o("A phase change required for every absorbed photon", "Un cambio de fase requerido por cada fotón absorbido", "A molecular vibrational transition can occur without changing the sample's phase.", "Una transición vibracional molecular puede ocurrir sin cambiar la fase de la muestra.")],
    "Infrared photons commonly match vibrational level gaps. Bond stretching changes internuclear distance around equilibrium without requiring bond rupture.",
    "Los fotones infrarrojos suelen coincidir con separaciones entre niveles vibracionales. El estiramiento cambia la distancia internuclear alrededor del equilibrio sin requerir ruptura del enlace.");
  mc("3.11-3", "Absorbing ultraviolet or visible light commonly promotes a molecule between which levels?", "Absorber luz ultravioleta o visible suele promover una molécula entre ¿qué niveles?", [
    o("Electronic energy levels", "Niveles de energía electrónica", "", ""),
    o("Only the lowest rotational levels", "Solo los niveles rotacionales más bajos", "Typical rotational transitions use lower-energy microwave photons.", "Las transiciones rotacionales típicas usan fotones de microondas de menor energía."),
    o("Different numbers of protons in the nucleus", "Diferentes números de protones en el núcleo", "Electronic excitation does not change element identity.", "La excitación electrónica no cambia la identidad del elemento."),
    o("Exactly the same energy level, with no energy change", "Exactamente el mismo nivel de energía, sin cambio energético", "Absorption transfers photon energy to the molecule, requiring a positive energy difference.", "La absorción transfiere energía del fotón a la molécula y requiere una diferencia de energía positiva.")],
    "UV-visible spectroscopy commonly probes electronic excitation. The photon energy equals the allowed level gap.",
    "La espectroscopía UV-visible suele estudiar excitación electrónica. La energía del fotón es igual a la separación entre niveles permitidos.");
  mc("3.11-4", "Which order lists electromagnetic regions from highest to lowest frequency?", "¿Qué orden enumera regiones electromagnéticas de mayor a menor frecuencia?", [
    o("Ultraviolet > visible > infrared > microwave", "Ultravioleta > visible > infrarrojo > microondas", "", ""),
    o("Microwave > infrared > visible > ultraviolet", "Microondas > infrarrojo > visible > ultravioleta", "That is the reverse order; microwaves have the lowest frequency among these regions.", "Ese es el orden inverso; las microondas tienen la menor frecuencia entre estas regiones."),
    o("Visible > ultraviolet > infrared > microwave", "Visible > ultravioleta > infrarrojo > microondas", "Ultraviolet has higher frequency than visible light.", "La luz ultravioleta tiene mayor frecuencia que la luz visible."),
    o("Ultraviolet > infrared > visible > microwave", "Ultravioleta > infrarrojo > visible > microondas", "Visible light has higher frequency than infrared radiation.", "La luz visible tiene mayor frecuencia que la radiación infrarroja.")],
    "In the electromagnetic spectrum, increasing frequency means decreasing wavelength and increasing photon energy. Ultraviolet is highest among the listed regions.",
    "En el espectro electromagnético, aumentar la frecuencia significa disminuir la longitud de onda y aumentar la energía del fotón. El ultravioleta es el mayor entre las regiones enumeradas.");
  mc("3.11-5", "A molecule absorbs a particular infrared frequency without dissociating. What explains its selective absorption?", "Una molécula absorbe una frecuencia infrarroja particular sin disociarse. ¿Qué explica su absorción selectiva?", [
    o("The photon matches an allowed vibrational energy gap.", "El fotón coincide con una separación de energía vibracional permitida.", "", ""),
    o("Any photon of any frequency gives the same molecular transition.", "Cualquier fotón de cualquier frecuencia da la misma transición molecular.", "Quantized levels require specific energy gaps, so absorption is selective.", "Los niveles cuantizados requieren separaciones de energía específicas, así que la absorción es selectiva."),
    o("Absorbing infrared always breaks every covalent bond.", "Absorber infrarrojo siempre rompe todos los enlaces covalentes.", "Vibrational excitation can occur below the energy needed for dissociation.", "La excitación vibracional puede ocurrir por debajo de la energía necesaria para la disociación."),
    o("The molecule loses energy when it absorbs the photon.", "La molécula pierde energía al absorber el fotón.", "Absorption raises molecular energy; emission lowers it.", "La absorción eleva la energía molecular; la emisión la disminuye.")],
    "Molecular energies are quantized. Matching an allowed vibrational gap explains the band; absorption need not break the molecule apart.",
    "Las energías moleculares están cuantizadas. Coincidir con una separación vibracional permitida explica la banda; la absorción no tiene que separar la molécula.");
  num("3.11-6", "Infrared radiation has wavelength 10.0 micrometers in vacuum. What is its frequency? One micrometer is 10<sup>−6</sup> m.", "La radiación infrarroja tiene longitud de onda de 10.0 micrómetros en el vacío. ¿Cuál es su frecuencia? Un micrómetro es 10<sup>−6</sup> m.",
    3.00e8 / (10.0e-6), "3.00e13", "Hz", {sf:3},
    "Convert wavelength to meters, then use ν = c/λ: (3.00 × 10<sup>8</sup>)/(10.0 × 10<sup>−6</sup>) = 3.00 × 10<sup>13</sup> Hz.",
    "Convierte la longitud de onda a metros y usa ν = c/λ: (3.00 × 10<sup>8</sup>)/(10.0 × 10<sup>−6</sup>) = 3.00 × 10<sup>13</sup> Hz.");

  num("3.12-1", "A photon has frequency 5.00 × 10<sup>14</sup> Hz. What is its energy?", "Un fotón tiene frecuencia de 5.00 × 10<sup>14</sup> Hz. ¿Cuál es su energía?",
    6.626e-34 * 5.00e14, "3.31e-19", "J", {sf:3},
    "Use Planck's constant: E = hν = (6.626 × 10<sup>−34</sup>)(5.00 × 10<sup>14</sup>) = 3.313 × 10<sup>−19</sup> J. Round to 3.31 × 10<sup>−19</sup> J per photon.",
    "Usa la constante de Planck: E = hν = (6.626 × 10<sup>−34</sup>)(5.00 × 10<sup>14</sup>) = 3.313 × 10<sup>−19</sup> J. Redondea a 3.31 × 10<sup>−19</sup> J por fotón.");
  num("3.12-2", "Light in vacuum has frequency 6.00 × 10<sup>14</sup> Hz. What is its wavelength in meters?", "La luz en el vacío tiene frecuencia de 6.00 × 10<sup>14</sup> Hz. ¿Cuál es su longitud de onda en metros?",
    3.00e8 / 6.00e14, "5.00e-7", "m", {sf:3},
    "Use c = λν, so λ = c/ν = (3.00 × 10<sup>8</sup>)/(6.00 × 10<sup>14</sup>) = 5.00 × 10<sup>−7</sup> m. Frequency and wavelength are inversely related.",
    "Usa c = λν, así λ = c/ν = (3.00 × 10<sup>8</sup>)/(6.00 × 10<sup>14</sup>) = 5.00 × 10<sup>−7</sup> m. La frecuencia y la longitud de onda son inversamente proporcionales.");
  num("3.12-3", "What energy in kJ/mol corresponds to one mole of photons with wavelength 400. nm in vacuum? One nm is 10<sup>−9</sup> m.", "¿Qué energía en kJ/mol corresponde a un mol de fotones con longitud de onda de 400. nm en el vacío? Un nm es 10<sup>−9</sup> m.",
    6.626e-34 * 3.00e8 * 6.022e23 / (400e-9) / 1000, "299", "kJ/mol", {sf:3},
    "Use E = hc/λ for one photon, multiply by 6.022 × 10<sup>23</sup> mol<sup>−1</sup>, then divide joules by 1000. With λ = 400. × 10<sup>−9</sup> m, the result is 299.26329 kJ/mol, or 299 kJ/mol.",
    "Usa E = hc/λ para un fotón, multiplica por 6.022 × 10<sup>23</sup> mol<sup>−1</sup> y divide los joules entre 1000. Con λ = 400. × 10<sup>−9</sup> m, el resultado es 299.26329 kJ/mol, es decir, 299 kJ/mol.");
  num("3.12-4", "A photon has energy 1.33 × 10<sup>−19</sup> J. What is its frequency?", "Un fotón tiene energía de 1.33 × 10<sup>−19</sup> J. ¿Cuál es su frecuencia?",
    1.33e-19 / 6.626e-34, "2.01e14", "Hz", {sf:3},
    "Rearrange E = hν: ν = E/h = (1.33 × 10<sup>−19</sup>)/(6.626 × 10<sup>−34</sup>) = 2.007244... × 10<sup>14</sup> Hz. Round to 2.01 × 10<sup>14</sup> Hz.",
    "Despeja en E = hν: ν = E/h = (1.33 × 10<sup>−19</sup>)/(6.626 × 10<sup>−34</sup>) = 2.007244... × 10<sup>14</sup> Hz. Redondea a 2.01 × 10<sup>14</sup> Hz.");
  mc("3.12-5", "A photon's wavelength in vacuum is halved. How does its energy change?", "La longitud de onda de un fotón en el vacío se reduce a la mitad. ¿Cómo cambia su energía?", [
    o("It doubles.", "Se duplica.", "", ""),
    o("It halves.", "Se reduce a la mitad.", "E = hc/λ is inverse in wavelength, so a shorter wavelength gives greater energy.", "E = hc/λ es inversa en longitud de onda, así que una longitud menor da mayor energía."),
    o("It stays the same because light speed is unchanged.", "Permanece igual porque la rapidez de la luz no cambia.", "Constant c still allows frequency and photon energy to increase as wavelength decreases.", "El valor constante de c aún permite que la frecuencia y la energía del fotón aumenten al disminuir la longitud de onda."),
    o("It becomes zero because the wave is shorter.", "Se vuelve cero porque la onda es más corta.", "A finite nonzero wavelength corresponds to positive photon energy.", "Una longitud de onda finita distinta de cero corresponde a energía positiva del fotón.")],
    "E = hc/λ. Dividing wavelength by a factor divides the denominator by that factor and increases energy by the same factor.",
    "E = hc/λ. Dividir la longitud de onda por un factor divide el denominador por ese factor y aumenta la energía por el mismo factor.");
  mc("3.12-6", "Two different substances emit photons of exactly the same frequency. Compare the photons' energies.", "Dos sustancias diferentes emiten fotones de exactamente la misma frecuencia. Compara las energías de los fotones.", [
    o("Equal, because E = hν uses a universal constant", "Iguales, porque E = hν usa una constante universal", "", ""),
    o("Greater for the substance with heavier atoms", "Mayor para la sustancia con átomos más pesados", "At fixed frequency, emitter mass does not appear in the photon energy relation.", "A frecuencia fija, la masa del emisor no aparece en la relación de energía del fotón."),
    o("Greater for the brighter source, for each individual photon", "Mayor para la fuente más brillante, para cada fotón individual", "Brightness can reflect more photons without greater energy per photon at this frequency.", "El brillo puede reflejar más fotones sin mayor energía por fotón a esta frecuencia."),
    o("Unrelated, because each substance has its own Planck constant", "Sin relación, porque cada sustancia tiene su propia constante de Planck", "Planck's constant is universal, not specific to an element or compound.", "La constante de Planck es universal, no específica de un elemento o compuesto.")],
    "For each photon, energy depends only on frequency and Planck's constant. Equal frequencies give equal photon energies regardless of the source.",
    "Para cada fotón, la energía depende solo de la frecuencia y la constante de Planck. Frecuencias iguales dan energías de fotón iguales sin importar la fuente.");

  num("3.13-1", "A solute has molar absorptivity 150. L/(mol·cm). With path length 1.00 cm and concentration 0.00200 M, what is its absorbance in the linear range?", "Un soluto tiene absortividad molar de 150. L/(mol·cm). Con longitud de trayectoria de 1.00 cm y concentración de 0.00200 M, ¿cuál es su absorbancia en el intervalo lineal?",
    150 * 1.00 * 0.00200, "0.300", "ratio", {sf:3},
    "Beer-Lambert law gives A = εbc = 150. × 1.00 × 0.00200 = 0.300. Absorbance is dimensionless because the units cancel.",
    "La ley de Beer-Lambert da A = εbc = 150. × 1.00 × 0.00200 = 0.300. La absorbancia no tiene dimensiones porque las unidades se cancelan.");
  num("3.13-2", "A solution's absorbance is 0.450 in a 1.00 cm cell. Its molar absorptivity is 2250. L/(mol·cm). What is its concentration?", "La absorbancia de una solución es 0.450 en una celda de 1.00 cm. Su absortividad molar es 2250. L/(mol·cm). ¿Cuál es su concentración?",
    0.450 / (2250 * 1.00), "2.00e-4", "M", {sf:3},
    "Rearrange A = εbc to c = A/(εb). Concentration = 0.450/(2250. × 1.00) = 0.000200 M. Divide by both absorptivity and path length.",
    "Despeja en A = εbc para obtener c = A/(εb). Concentración = 0.450/(2250. × 1.00) = 0.000200 M. Divide entre la absortividad y la longitud de trayectoria.");
  num("3.13-3", "A calibration curve has equation A = (1200. L/mol)c + 0.020, where c is in mol/L. An unknown in the calibration range has A = 0.380. What is c? Use three significant figures.", "Una curva de calibración tiene ecuación A = (1200. L/mol)c + 0.020, donde c está en mol/L. Una muestra desconocida dentro del intervalo de calibración tiene A = 0.380. ¿Cuál es c? Usa tres cifras significativas.",
    (0.380 - 0.020) / 1200, "3.00e-4", "M", {sf:3},
    "Subtract the intercept before dividing by the slope: c = (0.380 − 0.020)/1200. = 0.000300 M. Ignoring the intercept would overestimate concentration.",
    "Resta la ordenada al origen antes de dividir entre la pendiente: c = (0.380 − 0.020)/1200. = 0.000300 M. Ignorar la ordenada al origen sobreestimaría la concentración.");
  mc("3.13-4", "For a solution in the Beer-Lambert linear range at fixed wavelength and concentration, what happens when the cell path length doubles?", "Para una solución en el intervalo lineal de Beer-Lambert con longitud de onda y concentración fijas, ¿qué ocurre cuando se duplica la longitud de trayectoria de la celda?", [
    o("Absorbance doubles.", "La absorbancia se duplica.", "", ""),
    o("Absorbance halves.", "La absorbancia se reduce a la mitad.", "A = εbc makes absorbance directly proportional to path length, not inversely proportional.", "A = εbc hace la absorbancia directamente proporcional a la longitud de trayectoria, no inversamente proporcional."),
    o("Absorbance stays fixed because concentration is unchanged.", "La absorbancia permanece fija porque la concentración no cambia.", "Path length also appears in the law; more solution along the light path increases absorbance.", "La longitud de trayectoria también aparece en la ley; más solución a lo largo del trayecto de luz aumenta la absorbancia."),
    o("Molar absorptivity must double instead.", "La absortividad molar debe duplicarse en su lugar.", "At fixed wavelength and chemical conditions, changing path length does not itself change molar absorptivity.", "Con longitud de onda y condiciones químicas fijas, cambiar la longitud de trayectoria no cambia por sí solo la absortividad molar.")],
    "A = εbc is linear in b. Doubling the path length doubles absorbance while ε and c remain fixed.",
    "A = εbc es lineal en b. Duplicar la longitud de trayectoria duplica la absorbancia mientras ε y c permanecen fijos.");
  mc("3.13-5", "Before measuring a solute's absorbance, what blank helps correct for the solvent and the cell?", "Antes de medir la absorbancia de un soluto, ¿qué blanco ayuda a corregir la contribución del disolvente y la celda?", [
    o("The same solvent without solute in a matching clean cell", "El mismo disolvente sin soluto en una celda limpia equivalente", "", ""),
    o("The most concentrated solute standard as the blank", "El estándar de soluto más concentrado como blanco", "That would subtract the analyte's absorption along with the background.", "Eso restaría la absorción del analito junto con el fondo."),
    o("An opaque object blocking all light", "Un objeto opaco que bloquee toda la luz", "Blocking the beam does not represent the solvent and cell baseline.", "Bloquear el haz no representa la línea de base del disolvente y la celda."),
    o("A different colored solvent in a scratched cell", "Un disolvente de otro color en una celda rayada", "Different background absorption and scattering would introduce rather than remove error.", "La absorción de fondo y dispersión de luz diferentes introducirían error en lugar de eliminarlo.")],
    "A solvent blank in a matching cell measures background from those components. This helps isolate the solute's absorbance.",
    "Un blanco de disolvente en una celda equivalente mide el fondo de esos componentes. Esto ayuda a aislar la absorbancia del soluto.");
  mc("3.13-6", "An unknown concentration is determined from a straight absorbance-versus-concentration calibration curve. Which measurement conditions should match the standards?", "Se determina una concentración desconocida con una curva de calibración lineal de absorbancia contra concentración. ¿Qué condiciones de medición deben coincidir con las de los estándares?", [
    o("Wavelength and cell path length", "Longitud de onda y longitud de trayectoria de la celda", "", ""),
    o("Only the color of the cell holder", "Solo el color del soporte de la celda", "Holder color does not fix the absorptivity or path length controlling the calibration slope.", "El color del soporte no fija la absortividad ni la longitud de trayectoria que controlan la pendiente de calibración."),
    o("Any wavelength, because molar absorptivity is universal", "Cualquier longitud de onda, porque la absortividad molar es universal", "Molar absorptivity depends on wavelength and the absorbing species.", "La absortividad molar depende de la longitud de onda y de la especie que absorbe."),
    o("Any path length, because the calibration slope never changes", "Cualquier longitud de trayectoria, porque la pendiente de calibración nunca cambia", "The slope is εb, so changing path length changes the expected slope.", "La pendiente es εb, así que cambiar la longitud de trayectoria cambia la pendiente esperada.")],
    "For the same chemical system, the calibration slope is εb. Match wavelength and path length and work within the calibrated linear range.",
    "Para el mismo sistema químico, la pendiente de calibración es εb. Mantén iguales la longitud de onda y la longitud de trayectoria y trabaja dentro del intervalo lineal calibrado.");

  questions.forEach(function (q) { if (q.id === "3.5-2") q.curve = true; });

  var units = [
    ["L", "L", "L"], ["atm", "atm", "atm"], ["mmHg", "mmHg", "mmHg"], ["kPa", "kPa", "kPa"],
    ["K", "K", "K"], ["mol", "mol", "mol"], ["M", "M (mol/L)", "M (mol/L)"], ["g", "g", "g"], ["g/L", "g/L", "g/L"],
    ["J", "J", "J"], ["kJ", "kJ", "kJ"], ["J/mol", "J/mol", "J/mol"], ["kJ/mol", "kJ/mol", "kJ/mol"],
    ["Hz", "Hz", "Hz"], ["m", "m", "m"], ["nm", "nm", "nm"], ["cm", "cm", "cm"],
    ["count", "count", "cantidad"], ["ratio", "no units", "sin unidades"]
  ].map(function (row) { return {id:row[0], label:p(row[1], row[2])}; });
  var copy = {title:"AP Chemistry Unit 3 Practice", es:{
    "AP Chemistry · Unit 3":"Química AP · Unidad 3",
    "AP Chemistry Unit 3 Practice":"Práctica de la unidad 3 de Química AP",
    "ZornScience home":"Inicio de ZornScience", "Activity tools":"Herramientas de la actividad",
    "Instructions":"Instrucciones", "Close":"Cerrar", "Close instructions":"Cerrar instrucciones",
    "Share":"Compartir", "Share activity":"Compartir actividad", "Share this activity":"Compartir esta actividad",
    "Close share options":"Cerrar opciones para compartir", "Share link":"Enlace para compartir", "Copy link":"Copiar enlace", "Email":"Correo electrónico",
    "Link copied.":"Enlace copiado.", "Link selected. Copy it with Ctrl+C or Command+C.":"Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
    "Share a fresh activity. Your answers and results are not included.":"Comparte una actividad nueva. Tus respuestas y resultados no se incluyen.",
    "Catch up at your own pace.":"Ponte al corriente a tu ritmo.",
    "Choose one topic for six questions, or Mixed review for all 78. Read the feedback after each answer.":"Elige un tema para seis preguntas o Repaso mixto para las 78. Lee la retroalimentación después de cada respuesta.",
    "Topic":"Tema", "Mixed review":"Repaso mixto", "Start practice":"Comenzar práctica", "Choose a topic":"Selección de un tema",
    "No timer. Use scratch paper and a calculator. Reference values are below.":"Sin límite de tiempo. Usa papel y calculadora. Los valores de consulta están abajo.",
    "Choose a topic, then start. Mixed review includes all thirteen topics.":"Elige un tema y comienza. El repaso mixto incluye los trece temas.",
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
    "Aligned practice for AP Chemistry CED topics 3.1 to 3.13. Original ZornScience questions.":"Práctica alineada con los temas 3.1 a 3.13 del CED de Química AP. Preguntas originales de ZornScience.",
    "Gas, solution and light reference":"Consulta sobre gases, soluciones y luz",
    "Atomic masses (g/mol)":"Masas atómicas (g/mol)",
    "Avogadro constant":"Constante de Avogadro",
    "Planck constant":"Constante de Planck",
    "Speed of light in vacuum":"Rapidez de la luz en el vacío",
    "Use temperatures in kelvin for gas law calculations. Keep extra digits in your work and round only the final answer.":"Usa temperaturas en kelvin para los cálculos de leyes de los gases. Conserva dígitos adicionales en tu trabajo y redondea solo la respuesta final.",
    "Gas laws: PV = nRT. Partial pressure = mole fraction × total pressure. Molarity = moles of solute / liters of solution.":"Leyes de los gases: PV = nRT. Presión parcial = fracción molar × presión total. Molaridad = moles de soluto / litros de solución.",
    "Light: E = hν and c = λν. Beer-Lambert law: A = εbc. Absorbance and retention factor Rf have no units.":"Luz: E = hν y c = λν. Ley de Beer-Lambert: A = εbc. La absorbancia y el factor de retención Rf no tienen unidades.",
    "Model Maxwell-Boltzmann speed distributions":"Distribuciones modelo de Maxwell-Boltzmann de rapidez",
    "Schematic model for equal numbers of particles of the same gas. The warmer curve has a lower, broader peak at greater speed. Both curves represent the same total area. No numerical scale is implied.":"Modelo esquemático para cantidades iguales de partículas del mismo gas. La curva de mayor temperatura tiene un máximo más bajo y ancho a mayor rapidez. Ambas curvas representan la misma área total. No se implica una escala numérica.",
    "Relative number of particles":"Número relativo de partículas",
    "Particle speed":"Rapidez de partículas",
    "Cooler":"Menor temperatura",
    "Warmer":"Mayor temperatura",
    "Model, schematic curves; equal particle numbers.":"Modelo, curvas esquemáticas; cantidades iguales de partículas.",
  }};
  var bank = {topics:topics, questions:questions, units:units, copy:copy};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit3-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
