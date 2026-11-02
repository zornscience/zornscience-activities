(function () {
  "use strict";
  // Scientific Calculator Practice: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Key labels stay as printed on a real scientific calculator (sin, cos,
  // tan, log, ln, EXP, Ans, DEG, RAD, 2nd, ENTER and so on), and symbols, numbers and decimal points stay as written.
  var root = document.querySelector('[data-zsa-activity="scientific-calculator"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (!i18n) return;
  // Paragraphs with bold key names inside a sentence. Each is one full template; [brackets] mark the bold words.
  var RICH = {
    "zsa-calc-help-intro": "Use the keypad or your keyboard to calculate. Select a guided exercise to practice a key sequence. Press [Fullscreen] for a calculator-only view that fills your screen; use [Exit fullscreen] to return to practice. On browsers without native fullscreen, browser controls may remain visible.",
    "zsa-calc-help-second": "For second functions, press the coral [2nd] key, then the key below the coral label. Menus use arrows and ENTER."
  };
  var copy = {title:"Scientific Calculator Practice", es:{
  // Header, page and footer
  "Scientific Calculator Practice": "Práctica con la calculadora científica",
  "ZornScience home": "Inicio de ZornScience",
  "Activity tools": "Herramientas de la actividad",
  "Instructions": "Instrucciones",
  "Fullscreen": "Pantalla completa",
  "Share": "Compartir",
  "Scientific calculator": "Calculadora científica",
  "Exit fullscreen calculator": "Salir de la calculadora en pantalla completa",
  "Exit fullscreen": "Salir de pantalla completa",
  "Calculator keypad and display": "Teclado y pantalla de la calculadora",
  "SCIENTIFIC": "CIENTÍFICA",
  "ZORNSCIENCE · CALCULATOR PRACTICE": "ZORNSCIENCE · PRÁCTICA DE CALCULADORA",
  "Ready when you are": "Lista cuando tú lo estés",
  "Reset calculator ↺": "Reiniciar la calculadora ↺",
  "Guided practice": "Práctica guiada",
  "History": "Historial",
  "ONE SKILL AT A TIME": "UNA HABILIDAD A LA VEZ",
  "Let’s make it click.": "Calculadora sin misterios.",
  "Small exercises. Useful habits.": "Ejercicios cortos. Hábitos útiles.",
  "A good test-day habit": "Un buen hábito para el día del examen",
  "Check your angle mode before using sin, cos, or tan. Most geometry problems use degrees.": "Revisa el modo de ángulo antes de usar sin, cos o tan. La mayoría de los problemas de geometría usan grados.",
  "Your calculations": "Tus cálculos",
  "Select an entry to use its expression again.": "Elige una entrada para volver a usar su expresión.",
  "Clear history": "Borrar el historial",
  "About this practice calculator": "Acerca de esta calculadora de práctica",
  "This independently built learning tool uses the TI-30X IIS key arrangement without manufacturer branding. It is not affiliated with Texas Instruments or ACT. Scientific operations are implemented independently; menu presentation and numeric rounding may differ from the physical device. Use an approved physical calculator on test day.": "Esta herramienta de aprendizaje, creada de forma independiente, usa la distribución de teclas de la TI-30X IIS sin la marca del fabricante. No está afiliada con Texas Instruments ni con ACT. Las operaciones científicas se programaron de forma independiente; la presentación de los menús y el redondeo de los números pueden ser distintos a los de la calculadora física. El día del examen, usa una calculadora física aprobada.",
  "All activities": "Todas las actividades",
  "Close": "Cerrar",
  // Dialogs
  "Data values": "Valores de los datos",
  "Save data": "Guardar datos",
  "First value": "Primer valor",
  "Second value": "Segundo valor",
  "Calculate": "Calcular",
  "Minimum": "Mínimo",
  "Maximum": "Máximo",
  "Generate": "Generar",
  "Share a fresh calculator with your students. Calculations stay on their device.": "Comparte una calculadora nueva con tus estudiantes. Los cálculos se quedan en su dispositivo.",
  "Activity link": "Enlace de la actividad",
  "Copy link": "Copiar enlace",
  "Share this activity": "Compartir esta actividad",
  "Link copied.": "Enlace copiado.",
  "Select and copy the activity link.": "Selecciona y copia el enlace de la actividad.",
  "Your keyboard works here": "Uso del teclado",
  "Use the keypad or your keyboard to calculate. Select a guided exercise to practice a key sequence. Press [Fullscreen] for a calculator-only view that fills your screen; use [Exit fullscreen] to return to practice. On browsers without native fullscreen, browser controls may remain visible.": "Usa las teclas de la calculadora o el teclado de tu computadora para calcular. Elige un ejercicio guiado para practicar una secuencia de teclas. Presiona [Pantalla completa] para ver solo la calculadora en toda tu pantalla; usa [Salir de pantalla completa] para volver a la práctica. En los navegadores sin pantalla completa nativa, los controles del navegador pueden seguir visibles.",
  "Numbers": "Números",
  "Math operations": "Operaciones matemáticas",
  "Enter or =": "Enter o =",
  "Calculate / select menu item": "Calcular / elegir una opción del menú",
  "Delete previous character": "Borrar el carácter anterior",
  "Delete at cursor": "Borrar en el cursor",
  "Clear entry / close menu": "Borrar la entrada / cerrar el menú",
  "Arrow keys": "Flechas",
  "Edit, recall history, or navigate menus": "Editar, recuperar el historial o moverte por los menús",
  "For second functions, press the coral [2nd] key, then the key below the coral label. Menus use arrows and ENTER.": "Para las segundas funciones, presiona la tecla coral [2nd] y luego la tecla que está debajo de la etiqueta coral. Los menús usan las flechas y ENTER.",
  "Statistics · {mode}": "Estadística · {mode}",
  "Enter one x, y pair per line.": "Escribe un par x, y por línea.",
  "Enter one value per line. Repeat a value to give it a frequency greater than one.": "Escribe un valor por línea. Repite un valor para darle una frecuencia mayor que uno.",
  "Check the values. Use one number or one x, y pair per line.": "Revisa los valores. Usa un número o un par x, y por línea.",
  "Coordinate conversion": "Conversión de coordenadas",
  "Enter x and y.": "Escribe los valores de x y de y.",
  "Enter radius and angle in {mode}.": "Escribe el radio y el ángulo en {mode}.",
  "Enter two finite numbers.": "Escribe dos números finitos.",
  "Random integer": "Entero aleatorio",
  "Use whole numbers with maximum ≥ minimum.": "Usa números enteros con máximo ≥ mínimo.",
  // Arrow keys (spoken names, and the words shown in a lesson's key sequence)
  "up arrow": "Flecha arriba",
  "down arrow": "Flecha abajo",
  "left arrow": "Flecha izquierda",
  "right arrow": "Flecha derecha",
  "up": "arriba",
  "down": "abajo",
  "left": "izquierda",
  "right": "derecha",
  // Calculator display: menu prompts. The error words (SYNTAX, DOMAIN, DIVIDE BY 0, DOMAIN / OVERFLOW, NO DATA,
  // INSUFFICIENT DATA, ENTER OP + VALUE) stay in English, as a real calculator shows them.
  "Select with arrows + ENTER": "Elige con flechas + ENTER",
  "Choose a statistics mode": "Elige un modo estadístico",
  "Select a statistic to display": "Elige una estadística para mostrar",
  "Convert rectangular ↔ polar": "Convierte rectangulares ↔ polares",
  "Attach a unit or display DMS": "Agrega una unidad o muestra DMS",
  "Reset settings, memory and entry?": "¿Restablecer ajustes, memoria y entrada?",
  // Guided practice
  "Fractions, made simple": "Fracciones sin complicaciones",
  "Add fractions & convert to decimals": "Suma fracciones y conviértelas a decimales",
  "Find ½ + ¾. Use A b/c between a numerator and denominator.": "Calcula ½ + ¾. Usa A b/c entre el numerador y el denominador.",
  "You should see 1 1/4. Press 2nd → PRB (F↔D) to see 1.25.": "Deberías ver 1 1/4. Presiona 2nd → PRB (F↔D) para ver 1.25.",
  "Powers & roots": "Potencias y raíces",
  "Squares, exponents & square roots": "Cuadrados, exponentes y raíces cuadradas",
  "Find √(144). The square root is the second function above x².": "Calcula √(144). La raíz cuadrada es la segunda función sobre x².",
  "√144 = 12. Try 12 → x² → ENTER to go back to 144.": "√144 = 12. Prueba 12 → x² → ENTER para regresar a 144.",
  "Get an angle on trig": "Trigonometría desde otro ángulo",
  "Sine, cosine & angle modes": "Seno, coseno y modos de ángulo",
  "Find sin(30°). This practice starts in DEG mode. Always check the mode first.": "Calcula sin(30°). Esta práctica empieza en modo DEG. Siempre revisa primero el modo.",
  "sin(30°) = 0.5. Try 2nd → SIN → 0.5 → ) → ENTER for the inverse.": "sin(30°) = 0.5. Prueba 2nd → SIN → 0.5 → ) → ENTER para la función inversa.",
  "Order matters": "La importancia del orden",
  "Parentheses & order of operations": "Paréntesis y jerarquía de operaciones",
  "Find 6 × (4 + 3). Parentheses make the addition happen first.": "Calcula 6 × (4 + 3). Los paréntesis hacen que la suma se haga primero.",
  "The result is 42. Without parentheses, 6 × 4 + 3 gives 27.": "El resultado es 42. Sin paréntesis, 6 × 4 + 3 da 27.",
  "Count the possibilities": "Conteo de posibilidades",
  "Combinations with the PRB menu": "Combinaciones con el menú PRB",
  "Choose 2 students from 5. Enter 5, open PRB, move right to nCr and press ENTER; then enter 2.": "Elige 2 estudiantes de 5. Escribe 5, abre PRB, avanza a la derecha hasta nCr y presiona ENTER; luego escribe 2.",
  "5 nCr 2 = 10 possible pairs. Use nPr when the order of the choices matters.": "5 nCr 2 = 10 parejas posibles. Usa nPr cuando importa el orden de la elección.",
  "Logs without the guesswork": "Logaritmos sin adivinar",
  "Base 10 & natural logarithms": "Logaritmos base 10 y naturales",
  "Find log(1000). LOG uses base 10; LN uses base e.": "Calcula log(1000). LOG usa base 10; LN usa base e.",
  "log(1000) = 3 because 10³ = 1000.": "log(1000) = 3 porque 10³ = 1000.",
  "✓ Nice work! {after}": "✓ ¡Buen trabajo! {after}",
  "Sequence complete. Check your entry and try again.": "Secuencia completa. Revisa lo que escribiste e inténtalo de nuevo.",
  "Practice complete": "Práctica completa",
  "Step {step} / {total} · Press {key}": "Paso {step} / {total} · Presiona {key}",
  "Start again": "Empezar de nuevo",
  "Free practice": "Práctica libre"
}};
  i18n.configure(copy);
  if (i18n.lang !== "es") return;
  // The dialogs are templates, which configure() does not reach. Translate their text and labels the same way.
  function visit(el) {
    Array.from(el.childNodes).forEach(function (child) {
      if (child.nodeType === 3 && child.textContent.trim()) {
        var text = child.textContent, trimmed = text.trim();
        child.textContent = text.replace(trimmed, i18n.text(trimmed));
      } else if (child.nodeType === 1) visit(child);
    });
    if (el.hasAttribute) ["aria-label", "placeholder", "title", "alt"].forEach(function (attr) {
      if (el.hasAttribute(attr)) el.setAttribute(attr, i18n.text(el.getAttribute(attr)));
    });
  }
  root.querySelectorAll("template").forEach(function (template) {
    Object.keys(RICH).forEach(function (id) {
      var p = template.content.getElementById(id);
      if (!p) return;
      p.replaceChildren();
      i18n.text(RICH[id]).split(/\[([^\]]+)\]/).forEach(function (part, i) {
        if (!part) return;
        if (i % 2) { var b = document.createElement("b"); b.textContent = part; p.appendChild(b); }
        else p.appendChild(document.createTextNode(part));
      });
    });
    visit(template.content);
  });
}());
