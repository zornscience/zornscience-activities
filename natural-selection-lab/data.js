(function () {
  "use strict";
  // Complete English templates paired with Mexican Spanish. No remote resources.
  const content = {
  "titles": [
    "1. Camouflage and Survival",
    "2. A Changing Environment",
    "3. Variation and Population Size"
  ],
  "descriptions": [
    "Start with 50 dark and 50 light beetles on dark ground. Compare the population across 15 generations.",
    "Start with 50 dark and 50 light beetles. Watch 30 generations, including a change in the ground.",
    "Compare variation and population size. Each run starts fresh and lasts 20 generations. You can keep up to 6 runs."
  ],
  "predictionQuestions": [
    "Before the run: the percent of dark beetles will ...",
    "After generation 10: the percent of dark beetles will ...",
    "Before the runs: which populations will vary more by chance?"
  ],
  "predictions": [
    [
      "Increase",
      "Decrease",
      "Stay about the same"
    ],
    [
      "Increase",
      "Decrease",
      "Stay about the same"
    ],
    [
      "Small populations",
      "Large populations",
      "Both will vary equally"
    ]
  ],
  "prompts": [
    [
      {
        "number": "1A",
        "text": "Describe how the percent of dark beetles changed from generation 0 to generation 15. Use numbers from your table."
      },
      {
        "number": "1B",
        "text": "Explain why the population changed, using the ideas of variation, inheritance, and survival."
      },
      {
        "number": "1C",
        "text": "Did any single beetle change color during the run? Explain how a population can change even though individual beetles do not."
      }
    ],
    [
      {
        "number": "2A",
        "text": "Describe what happened to the percent of dark beetles after the ground became light, and how quickly the change happened compared with Investigation 1."
      },
      {
        "number": "2B",
        "text": "Explain why the same trait helped the beetles in generation 5 but hurt them in generation 25."
      },
      {
        "number": "2C",
        "text": "Predict what would happen if the ground turned dark again at generation 30. Explain your reasoning."
      }
    ],
    [
      {
        "number": "3A",
        "text": "Compare the run that started with no dark beetles to the run that started with 50 percent dark. Why did the change take longer, and where did the first dark beetles come from?"
      },
      {
        "number": "3B",
        "text": "Compare your three population sizes. Which runs were most alike and which varied the most? Use your graph as evidence."
      },
      {
        "number": "3C",
        "text": "List the conditions a population needs for natural selection to change it, and point to evidence from this lab for each."
      }
    ]
  ],
  "questions": [
    {
      "title": "Why do dark beetles become more common on dark ground?",
      "options": [
        "They survive more often and have more offspring that inherit the color.",
        "They choose dark shells because they need camouflage.",
        "Birds teach them to change their color."
      ],
      "correct": 0,
      "explanation": "Birds are less likely to see matching beetles. More survivors can pass their heritable color to offspring."
    },
    {
      "title": "How can the population change if individual beetles do not change color?",
      "options": [
        "Every beetle becomes darker as it grows.",
        "The mix of inherited colors changes across generations.",
        "The ground paints the beetles."
      ],
      "correct": 1,
      "explanation": "An individual keeps its color. Different survival and reproduction change the mix of traits in the next generation."
    },
    {
      "title": "What happens when there is no variation in shell color?",
      "options": [
        "A new color appears immediately because the beetles need it.",
        "Natural selection always creates the most helpful trait.",
        "There is little or no change until a rare random change adds a new color."
      ],
      "correct": 2,
      "explanation": "Selection acts on existing variation. Rare random changes can add variation, without knowing what the beetles need."
    }
  ]
};
  const es = {
  "Natural Selection Lab": "Laboratorio de selección natural",
  "ZornScience home": "Inicio de ZornScience",
  "Instructions and sharing": "Instrucciones y opciones para compartir",
  "Instructions": "Instrucciones",
  "Close instructions": "Cerrar instrucciones",
  "Share": "Compartir",
  "Share this activity": "Compartir esta actividad",
  "Share a fresh lab. Your predictions, settings and seed are not included.": "Comparte el laboratorio desde cero. No se incluyen tus predicciones, ajustes ni semilla.",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "Close share options": "Cerrar opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac.",
  "Back to the lesson": "Volver a la lección",
  "Investigation": "Investigación",
  "Virtual lab": "Laboratorio virtual",
  "Start run": "Iniciar ensayo",
  "Next generation": "Siguiente generación",
  "Run to generation {generation}": "Avanzar hasta la generación {generation}",
  "Run to generation 15": "Avanzar hasta la generación 15",
  "Beetles on the ground": "Escarabajos en el suelo",
  "Population through generations": "Población a través de las generaciones",
  "Only observed generations appear. The tables below give exact counts.": "Solo aparecen las generaciones observadas. Las tablas de abajo muestran los conteos exactos.",
  "Data for your worksheet": "Datos para tu hoja de trabajo",
  "Copy": "Copiar",
  "Data for manual copying": "Datos para copiar manualmente",
  "Answer these in your document": "Responde estas preguntas en tu documento",
  "Check your understanding": "Comprueba tu comprensión",
  "Choose an answer. You get feedback right away.": "Elige una respuesta. Recibes retroalimentación de inmediato.",
  "All activities": "Todas las actividades",
  "This simulation requires JavaScript.": "Esta simulación requiere JavaScript.",
  "Watch a population of beetles across generations. Beetles that match the ground are harder for birds to see. Survivors have offspring that inherit their shell color. A rare random change can add a different color to the offspring.": "Observa una población de escarabajos a través de las generaciones. A las aves les cuesta más ver a los escarabajos que se parecen al suelo. Los que sobreviven tienen descendencia que hereda su color de caparazón. Un cambio aleatorio poco frecuente puede agregar otro color a la descendencia.",
  "Choose your prediction, then start a run. Step one generation at a time or run to the last generation. Settings lock during a run. In Investigation 3, start each new run with fresh beetles.": "Elige tu predicción y luego inicia un ensayo. Avanza una generación a la vez o hasta la última generación. Los ajustes se bloquean durante el ensayo. En la Investigación 3, cada nuevo ensayo empieza con una población nueva.",
  "Dark beetles have solid oval shells. Light beetles have striped, pointed shells. The ground also has a texture. Every drawing has counts and a data table.": "Los escarabajos oscuros tienen caparazones ovalados sólidos. Los escarabajos claros tienen caparazones puntiagudos con rayas. El suelo también tiene textura. Cada dibujo tiene conteos y una tabla de datos.",
  "This is an illustrative teaching model, not real data. Real populations have many traits and changing conditions.": "Este es un modelo ilustrativo para la enseñanza, no son datos reales. Las poblaciones reales tienen muchos rasgos y condiciones cambiantes.",
  "Copy the tables and prompts to your worksheet or document. Write your answers there. Nothing is saved or sent. Reloading or changing language clears your work.": "Copia las tablas y las preguntas a tu hoja de trabajo o documento. Escribe tus respuestas ahí. No se guarda ni se envía nada. Recargar la página o cambiar de idioma borra tu trabajo.",
  "1. Camouflage and Survival": "1. Camuflaje y supervivencia",
  "2. A Changing Environment": "2. Un ambiente cambiante",
  "3. Variation and Population Size": "3. Variación y tamaño de la población",
  "Start with 50 dark and 50 light beetles on dark ground. Compare the population across 15 generations.": "Empieza con 50 escarabajos oscuros y 50 claros en suelo oscuro. Compara la población a lo largo de 15 generaciones.",
  "Start with 50 dark and 50 light beetles. Watch 30 generations, including a change in the ground.": "Empieza con 50 escarabajos oscuros y 50 claros. Observa 30 generaciones, incluido un cambio en el suelo.",
  "Compare variation and population size. Each run starts fresh and lasts 20 generations. You can keep up to 6 runs.": "Compara la variación y el tamaño de la población. Cada ensayo empieza desde cero y dura 20 generaciones. Puedes conservar hasta 6 ensayos.",
  "At generation 10, a drought turns the soil pale. The ground changes from dark to light.": "En la generación 10, una sequía aclara el suelo. El suelo cambia de oscuro a claro.",
  "The drought has turned the soil pale. The ground is now light.": "La sequía ha aclarado el suelo. El suelo ahora es claro.",
  "Prediction": "Predicción",
  "Before the run: the percent of dark beetles will ...": "Antes del ensayo: el porcentaje de escarabajos oscuros va a ...",
  "After generation 10: the percent of dark beetles will ...": "Después de la generación 10: el porcentaje de escarabajos oscuros va a ...",
  "Before the runs: which populations will vary more by chance?": "Antes de los ensayos: ¿qué poblaciones van a variar más por azar?",
  "Increase": "Aumentar",
  "Decrease": "Disminuir",
  "Stay about the same": "Quedarse casi igual",
  "Small populations": "Las poblaciones pequeñas",
  "Large populations": "Las poblaciones grandes",
  "Both will vary equally": "Ambas van a variar igual",
  "Starting population": "Población inicial",
  "Population size": "Tamaño de la población",
  "50 percent dark": "50 por ciento oscuros",
  "90 percent dark": "90 por ciento oscuros",
  "0 percent dark (no variation at the start)": "0 por ciento oscuros (sin variación al inicio)",
  "Guided comparisons": "Comparaciones guiadas",
  "Run at N = 100, starting 50 percent dark.": "Haz un ensayo con N = 100, empezando con 50 por ciento oscuros.",
  "Run at N = 100, starting 0 percent dark.": "Haz un ensayo con N = 100, empezando con 0 por ciento oscuros.",
  "Run three fresh populations starting 50 percent dark: N = 10, N = 50, and N = 200.": "Haz ensayos con tres poblaciones nuevas, empezando con 50 por ciento oscuros: N = 10, N = 50 y N = 200.",
  "Done": "Listo",
  "To do": "Pendiente",
  "Dark ground. Medium selection. N = 100. Start: 50 dark, 50 light.": "Suelo oscuro. Selección media. N = 100. Inicio: 50 oscuros, 50 claros.",
  "Changing ground. Medium selection. N = 100. Start: 50 dark, 50 light.": "Suelo cambiante. Selección media. N = 100. Inicio: 50 oscuros, 50 claros.",
  "Dark ground. Medium selection. Settings lock when each run starts.": "Suelo oscuro. Selección media. Los ajustes se bloquean al iniciar cada ensayo.",
  "Choose a prediction to start.": "Elige una predicción para empezar.",
  "Ready for a fresh run.": "Todo listo para un nuevo ensayo.",
  "Run {run}: generation {generation}.": "Ensayo {run}: generación {generation}.",
  "Run {run} complete at generation {generation}.": "Ensayo {run} completo en la generación {generation}.",
  "Six runs complete. Compare your tables and graph.": "Seis ensayos completos. Compara tus tablas y tu gráfica.",
  "No beetles survived, so there is no next generation.": "No sobrevivió ningún escarabajo, así que no hay una siguiente generación.",
  "Generation {generation}: {dark} dark, {light} light. {percent}% dark.": "Generación {generation}: {dark} oscuros, {light} claros. {percent}% oscuros.",
  "Dark ground with short pale cracks. Solid oval dark beetles and striped, pointed light beetles.": "Suelo oscuro con grietas claras cortas. Escarabajos oscuros ovalados sólidos y escarabajos claros puntiagudos con rayas.",
  "Light ground with long dark cracks. Solid oval dark beetles and striped, pointed light beetles.": "Suelo claro con grietas oscuras largas. Escarabajos oscuros ovalados sólidos y escarabajos claros puntiagudos con rayas.",
  "Each symbol represents one beetle.": "Cada símbolo representa un escarabajo.",
  "Symbols are a sample of the population. Use the counts for exact totals.": "Los símbolos son una muestra de la población. Usa los conteos para conocer los totales exactos.",
  "No run yet. Choose a prediction and start.": "Todavía no hay ensayos. Elige una predicción y empieza.",
  "Generation": "Generación",
  "Dark beetles": "Escarabajos oscuros",
  "Light beetles": "Escarabajos claros",
  "Percent dark": "Porcentaje de oscuros",
  "Run {run}": "Ensayo {run}",
  "Run {run}: N = {size}, start {start}% dark": "Ensayo {run}: N = {size}, inicio {start}% oscuros",
  "Prediction: {prediction}": "Predicción: {prediction}",
  "Drought: light ground": "Sequía: suelo claro",
  "Percent dark against generation. Exact data in the run tables.": "Porcentaje de escarabajos oscuros según la generación. Datos exactos en las tablas de los ensayos.",
  "Copied. Paste the tables and prompts into your document.": "Datos copiados. Pega las tablas y las preguntas en tu documento.",
  "Copy is blocked. The data below are selected. Press Ctrl+C, or Command+C on a Mac.": "No se permite copiar. Los datos de abajo están seleccionados. Presiona Ctrl+C, o Command+C en una Mac.",
  "Why do dark beetles become more common on dark ground?": "¿Por qué se vuelven más comunes los escarabajos oscuros en suelo oscuro?",
  "They survive more often and have more offspring that inherit the color.": "Sobreviven con más frecuencia y tienen más descendencia que hereda el color.",
  "They choose dark shells because they need camouflage.": "Eligen caparazones oscuros porque necesitan camuflaje.",
  "Birds teach them to change their color.": "Las aves les enseñan a cambiar de color.",
  "Birds are less likely to see matching beetles. More survivors can pass their heritable color to offspring.": "Es menos probable que las aves vean a los escarabajos que se parecen al suelo. Más sobrevivientes pueden transmitir su color hereditario a la descendencia.",
  "How can the population change if individual beetles do not change color?": "¿Cómo puede cambiar la población si los escarabajos individuales no cambian de color?",
  "Every beetle becomes darker as it grows.": "Todos los escarabajos se vuelven más oscuros al crecer.",
  "The mix of inherited colors changes across generations.": "La proporción de colores heredados cambia entre generaciones.",
  "The ground paints the beetles.": "El suelo pinta a los escarabajos.",
  "An individual keeps its color. Different survival and reproduction change the mix of traits in the next generation.": "Cada individuo conserva su color. Las diferencias en supervivencia y reproducción cambian la proporción de rasgos en la siguiente generación.",
  "What happens when there is no variation in shell color?": "¿Qué pasa cuando no hay variación en el color del caparazón?",
  "A new color appears immediately because the beetles need it.": "Aparece un color nuevo de inmediato porque los escarabajos lo necesitan.",
  "Natural selection always creates the most helpful trait.": "La selección natural siempre crea el rasgo más útil.",
  "There is little or no change until a rare random change adds a new color.": "Hay poco o ningún cambio hasta que un cambio aleatorio poco frecuente agrega un nuevo color.",
  "Selection acts on existing variation. Rare random changes can add variation, without knowing what the beetles need.": "La selección actúa sobre la variación que ya existe. Los cambios aleatorios poco frecuentes pueden agregar variación, sin saber qué necesitan los escarabajos.",
  "Correct. {explanation}": "Correcto. {explanation}",
  "Try again. {explanation}": "Inténtalo de nuevo. {explanation}",
  "Describe how the percent of dark beetles changed from generation 0 to generation 15. Use numbers from your table.": "Describe cómo cambió el porcentaje de escarabajos oscuros de la generación 0 a la generación 15. Usa números de tu tabla.",
  "Explain why the population changed, using the ideas of variation, inheritance, and survival.": "Explica por qué cambió la población usando las ideas de variación, herencia y supervivencia.",
  "Did any single beetle change color during the run? Explain how a population can change even though individual beetles do not.": "¿Cambió de color algún escarabajo durante el ensayo? Explica cómo puede cambiar una población aunque los escarabajos individuales no cambien.",
  "Describe what happened to the percent of dark beetles after the ground became light, and how quickly the change happened compared with Investigation 1.": "Describe qué pasó con el porcentaje de escarabajos oscuros después de que el suelo se volvió claro y qué tan rápido ocurrió el cambio en comparación con la Investigación 1.",
  "Explain why the same trait helped the beetles in generation 5 but hurt them in generation 25.": "Explica por qué el mismo rasgo ayudó a los escarabajos en la generación 5 pero los perjudicó en la generación 25.",
  "Predict what would happen if the ground turned dark again at generation 30. Explain your reasoning.": "Predice qué pasaría si el suelo se volviera oscuro de nuevo en la generación 30. Explica tu razonamiento.",
  "Compare the run that started with no dark beetles to the run that started with 50 percent dark. Why did the change take longer, and where did the first dark beetles come from?": "Compara el ensayo que empezó sin escarabajos oscuros con el que empezó con 50 por ciento oscuros. ¿Por qué tardó más el cambio y de dónde vinieron los primeros escarabajos oscuros?",
  "Compare your three population sizes. Which runs were most alike and which varied the most? Use your graph as evidence.": "Compara tus tres tamaños de población. ¿Qué ensayos fueron más parecidos y cuáles variaron más? Usa tu gráfica como evidencia.",
  "List the conditions a population needs for natural selection to change it, and point to evidence from this lab for each.": "Enumera las condiciones que necesita una población para que la selección natural la cambie y señala evidencia de este laboratorio para cada una."
};
  const root = document.querySelector('[data-zsa-activity="natural-selection-lab"]');
  let i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  i18n.configure({title: "Natural Selection Lab", es});
  root.addEventListener("natural-selection-data", event => event.detail.receive(content));
}());
