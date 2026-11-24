(function () {
  "use strict";
  // Standing Waves on a String: every English string with its Mexican Spanish translation, for ../shared/zsa-i18n.js.
  // English is the default and the fallback. Symbols, numbers, units and decimal points stay exactly as written.
  var root = document.querySelector('[data-zsa-activity="standing-waves-lab"]');
  if (!root) return;
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  var copy = {title:"Standing Waves on a String", es:{
  // Header, instructions and share
  "Standing Waves on a String": "Ondas estacionarias en una cuerda",
  "ZornScience home": "Inicio de ZornScience",
  "Activity links": "Enlaces de la actividad",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share this activity": "Compartir esta actividad",
  "Close share options": "Cerrar opciones para compartir",
  "Close instructions": "Cerrar instrucciones",
  "Share this simulation. Each link opens a fresh apparatus.": "Comparte esta simulación. Cada enlace abre el aparato desde cero.",
  "Share link": "Enlace para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "More share options": "Más opciones para compartir",
  "Link copied.": "Enlace copiado.",
  "Link selected. Press Ctrl+C, or Command+C on a Mac, to copy it.": "Enlace seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
  "Share options opened.": "Se abrieron las opciones para compartir.",
  "Use Copy link or email instead.": "Usa Copiar enlace o el correo electrónico.",
  "Create harmonics and measure node spacing with a synchronized strobe.": "Produce armónicos y mide la separación entre nodos con una luz estroboscópica sincronizada.",
  "Find the harmonics": "Búsqueda de los armónicos",
  "Choose any of the three optional investigations above the apparatus. Read the question, make a prediction, then try it. You can freely explore all controls.": "Elige cualquiera de las tres investigaciones opcionales que están arriba del aparato. Lee la pregunta, haz una predicción y luego pruébala. Puedes explorar libremente todos los controles.",
  "Switch on the oscillator. Adjust the generator frequency until the string forms clear, large loops. Each resonance is a harmonic.": "Enciende el oscilador. Ajusta la frecuencia del generador hasta que la cuerda forme segmentos grandes y claros. Cada resonancia es un armónico.",
  "Change the hanging mass, vibrating length, or string density. Explore how the resonance frequencies change. The harmonic buttons tune the generator exactly.": "Cambia la masa colgante, la longitud de vibración o la densidad de la cuerda. Explora cómo cambian las frecuencias de resonancia. Los botones de armónicos sintonizan el generador con exactitud.",
  "Strobe lock": "Bloqueo estroboscópico",
  "Turn on {button} to see the string at the same point in every cycle. This virtual synchronized light holds a stationary view without flashing the screen. Use the phase slider to inspect different positions. Track one string point to see transverse motion: it moves up and down, not along the string.": "Activa el {button} para ver la cuerda en el mismo punto de cada ciclo. Esta luz virtual sincronizada mantiene una vista fija sin hacer parpadear la pantalla. Usa el control deslizante de fase para examinar distintas posiciones. Sigue un punto de la cuerda para ver el movimiento transversal: sube y baja, no avanza a lo largo de la cuerda.",
  "Show nodes and antinodes at resonance. Nodes stay still; antinodes have the largest motion.": "Muestra los nodos y los antinodos en la resonancia. Los nodos se quedan quietos; los antinodos tienen el mayor movimiento.",
  "Move the two measurement cursors using their sliders, or drag their handles along the ruler. The adjacent-node button aligns the cursors at resonance. The readout only converts spacing to wavelength when the cursors sit on neighboring nodes. Adjacent nodes are half a wavelength apart: {formula}.": "Mueve los dos cursores de medición con sus controles deslizantes o arrastra sus marcadores a lo largo de la regla. El botón de nodos adyacentes alinea los cursores en la resonancia. La lectura solo convierte la separación en longitud de onda cuando los cursores están en nodos vecinos. Los nodos adyacentes están a media longitud de onda uno del otro: {formula}.",
  "Normal viewing shows slow motion so you can follow the vibration. The generator displays the physical frequency. No observations are saved.": "La vista normal muestra el movimiento en cámara lenta para que puedas seguir la vibración. El generador muestra la frecuencia física. No se guardan observaciones.",
  // Controls
  "01 / SIGNAL GENERATOR": "01 / GENERADOR DE SEÑALES",
  "Frequency": "Frecuencia",
  "Drive amplitude": "Amplitud de excitación",
  "Fine tune frequency": "Ajuste fino de la frecuencia",
  "Decrease frequency by 0.1 Hz": "Bajar la frecuencia 0.1 Hz",
  "Increase frequency by 0.1 Hz": "Subir la frecuencia 0.1 Hz",
  "Tune to a harmonic (number of loops)": "Sintoniza un armónico (número de segmentos)",
  "Tune harmonic": "Sintonizar un armónico",
  "02 / STRING & TENSION": "02 / CUERDA Y TENSIÓN",
  "Hanging mass": "Masa colgante",
  "Vibrating length": "Longitud de vibración",
  "String density": "Densidad de la cuerda",
  "Light cord · 1.0 g/m": "Cuerda ligera · 1.0 g/m",
  "Medium cord · 2.0 g/m": "Cuerda media · 2.0 g/m",
  "Heavy cord · 4.0 g/m": "Cuerda pesada · 4.0 g/m",
  "← All ZornScience activities": "← Todas las actividades de ZornScience",
  // Bench, investigations and apparatus
  "Standing-wave apparatus": "Aparato de ondas estacionarias",
  "OSCILLATOR OFF": "OSCILADOR APAGADO",
  "STROBE LOCKED": "LUZ ESTROBOSCÓPICA SINCRONIZADA",
  "SLOW MOTION": "CÁMARA LENTA",
  "Optional investigations": "Investigaciones opcionales",
  "Choose an investigation": "Elige una investigación",
  "1 · Find harmonics": "1 · Busca armónicos",
  "2 · Measure wavelength": "2 · Mide la longitud de onda",
  "3 · Change tension": "3 · Cambia la tensión",
  "Why does this happen?": "¿Por qué pasa esto?",
  "Adjust generator & string": "Ajustar el generador y la cuerda",
  "VIBRATOR / PULLEY / MASS HANGER": "VIBRADOR / POLEA / PORTAPESAS",
  "WAVES LABORATORY": "LABORATORIO DE ONDAS",
  "Apparatus; scroll sideways on narrow screens": "Aparato; desplázate hacia los lados en pantallas angostas",
  "Standing-wave lab bench": "Mesa de laboratorio de ondas estacionarias",
  "A signal generator drives a mechanical vibrator. A string crosses a pulley and supports a hanging mass. A ruler and two movable cursors measure distances along the vibrating section.": "Un generador de señales impulsa un vibrador mecánico. Una cuerda pasa por una polea y sostiene una masa colgante. Una regla y dos cursores móviles miden distancias a lo largo de la parte que vibra.",
  "FUNCTION GENERATOR": "GENERADOR DE FUNCIONES",
  "VIBRATOR": "VIBRADOR",
  "STRING POINT": "PUNTO DE LA CUERDA",
  "VIBRATING STRING": "CUERDA VIBRANTE",
  "Pulley": "Polea",
  "Mass": "Masa",
  "ZORNSCIENCE / WAVES & RESONANCE": "ZORNSCIENCE / ONDAS Y RESONANCIA",
  "SLOW MOTION · 1/40 SPEED": "CÁMARA LENTA · 1/40 DEL TIEMPO REAL",
  "STROBE · SYNCHRONIZED PHASE": "LUZ ESTROBOSCÓPICA · FASE SINCRONIZADA",
  "READY TO DRIVE THE STRING": "LISTO PARA HACER VIBRAR LA CUERDA",
  "TUNE THE GENERATOR TO BUILD A STANDING WAVE": "SINTONIZA EL GENERADOR PARA FORMAR UNA ONDA ESTACIONARIA",
  "HARMONIC {n} · {n} LOOP": "ARMÓNICO {n} · {n} SEGMENTO",
  "HARMONIC {n} · {n} LOOPS": "ARMÓNICO {n} · {n} SEGMENTOS",
  "TENSION {t} N": "TENSIÓN {t} N",
  "▶ Start oscillator": "▶ Encender el oscilador",
  "■ Stop oscillator": "■ Apagar el oscilador",
  "Strobe lock: off": "Bloqueo estroboscópico: apagado",
  "Strobe lock: on": "Bloqueo estroboscópico: encendido",
  "Reset": "Reiniciar",
  "Horizontal distances follow the ruler; vertical motion is magnified. On small screens, scroll the apparatus sideways.": "Las distancias horizontales siguen la regla; el movimiento vertical está ampliado. En pantallas pequeñas, desplaza el aparato hacia los lados.",
  "Label nodes & antinodes": "Marcar nodos y antinodos",
  "Show motion envelope": "Mostrar la envolvente del movimiento",
  "Track one string point": "Seguir un punto de la cuerda",
  "Strobe phase": "Fase de la luz estroboscópica",
  "● N · Node: stays still": "● N · Nodo: se queda quieto",
  "│ A · Antinode: greatest motion": "│ A · Antinodo: mayor movimiento",
  "Dashed envelope: limits of motion": "Envolvente punteada: límites del movimiento",
  "Strobe lock samples the same phase each cycle; the actual string still vibrates. Change phase to inspect another position.": "El bloqueo estroboscópico toma la misma fase en cada ciclo; la cuerda real sigue vibrando. Cambia la fase para examinar otra posición.",
  "Motion is shown at 1/40 speed. The generator reads the physical frequency, not the slowed display frequency.": "El movimiento se muestra a 1/40 del tiempo real. El generador marca la frecuencia física, no la frecuencia más lenta que ves en pantalla.",
  "The green point is one piece of string: its horizontal position stays fixed.": "El punto verde es un pedazo de la cuerda: su posición horizontal no cambia.",
  "Tune to a resonance to reveal stationary nodes.": "Sintoniza una resonancia para que aparezcan nodos inmóviles.",
  // Measurement and readouts
  "Measure the string": "Medición de la cuerda",
  "Place A and B at neighboring nodes. Their separation is half a wavelength, not a full wavelength.": "Coloca A y B en nodos vecinos. Su separación es media longitud de onda, no una longitud de onda completa.",
  "Place cursors on adjacent nodes": "Colocar los cursores en nodos adyacentes",
  "Cursor A": "Cursor A",
  "Cursor B": "Cursor B",
  "CURSOR SEPARATION": "SEPARACIÓN DE LOS CURSORES",
  "Ruler cursor {letter}": "Cursor {letter} de la regla",
  "{value} meters": "{value} metros",
  "WAVE SPEED": "RAPIDEZ DE LA ONDA",
  "FUNDAMENTAL f₁": "FUNDAMENTAL f₁",
  "NEAREST HARMONIC": "ARMÓNICO MÁS CERCANO",
  "RESONANCE": "RESONANCIA",
  "Tuned": "Sintonizada",
  "Detuned": "Desintonizada",
  "Start the oscillator, then tune the frequency to make the string resonate.": "Enciende el oscilador y luego sintoniza la frecuencia para que la cuerda entre en resonancia.",
  "Drive amplitude is zero: the string is at rest.": "La amplitud de excitación es cero: la cuerda está en reposo.",
  "Harmonic {n}: {nodes} nodes, {n} antinodes. Adjacent nodes are {spacing} m apart; wavelength is {wavelength} m.": "Armónico {n}. Nodos: {nodes}. Antinodos: {n}. Los nodos adyacentes están a {spacing} m uno del otro; la longitud de onda es {wavelength} m.",
  "Between resonances: the response is smaller and interior points do not form exact stationary nodes. Try a harmonic preset or fine-tune the frequency.": "Entre resonancias: la respuesta es menor y los puntos interiores no forman nodos inmóviles exactos. Prueba un botón de armónico o ajusta la frecuencia con precisión.",
  "Oscillator off": "Oscilador apagado",
  "No drive · string at rest": "Sin excitación · cuerda en reposo",
  "Resonance · harmonic {n}": "Resonancia · armónico {n}",
  "Between resonances": "Entre resonancias",
  "Nearest resonance: {f} Hz · frequency ratio f/f₁ ≈ {n}": "Resonancia más cercana: {f} Hz · razón de frecuencias f/f₁ ≈ {n}",
  "Nearest resonance: {f} Hz · increase by {delta} Hz": "Resonancia más cercana: {f} Hz · sube {delta} Hz",
  "Nearest resonance: {f} Hz · decrease by {delta} Hz": "Resonancia más cercana: {f} Hz · baja {delta} Hz",
  "Generator frequency {f} hertz; tension {t} newtons; vibrating length {L} meters. Oscillator off.": "Frecuencia del generador: {f} hertz; tensión: {t} newtons; longitud de vibración: {L} metros. Oscilador apagado.",
  "Generator frequency {f} hertz; tension {t} newtons; vibrating length {L} meters. Harmonic {n} with {nodes} stationary nodes and {n} antinodes.": "Frecuencia del generador: {f} hertz; tensión: {t} newtons; longitud de vibración: {L} metros. Armónico {n}. Nodos inmóviles: {nodes}. Antinodos: {n}.",
  "Generator frequency {f} hertz; tension {t} newtons; vibrating length {L} meters. The string is driven between resonances.": "Frecuencia del generador: {f} hertz; tensión: {t} newtons; longitud de vibración: {L} metros. La cuerda vibra entre resonancias.",
  "Neighboring nodes: Δx = {dx} m = λ/2. Your measured wavelength is λ = 2Δx = {wavelength} m.": "Nodos vecinos: Δx = {dx} m = λ/2. La longitud de onda que mediste es λ = 2Δx = {wavelength} m.",
  "Start a nonzero drive and tune to resonance to measure stationary nodes.": "Enciende una excitación mayor que cero y sintoniza una resonancia para medir nodos inmóviles.",
  "Δx is the distance between your cursors. Place them at neighboring nodes before using λ = 2Δx.": "Δx es la distancia entre tus cursores. Colócalos en nodos vecinos antes de usar λ = 2Δx.",
  // Investigations
  "Start the oscillator. Tune to harmonics 1, 2 and 3 using the generator controls. Before changing frequency, predict: how many loops will appear? What stays still?": "Enciende el oscilador. Sintoniza los armónicos 1, 2 y 3 con los controles del generador. Antes de cambiar la frecuencia, predice: ¿cuántos segmentos van a aparecer? ¿Qué se queda quieto?",
  "At resonance, an integer number of half-wavelengths fits the string. Harmonic n has n loops, n antinodes and n + 1 nodes, including both ends. A loop is half a wavelength.": "En la resonancia, en la cuerda cabe un número entero de medias longitudes de onda. El armónico n tiene n segmentos, n antinodos y n + 1 nodos, incluidos los dos extremos. Un segmento es media longitud de onda.",
  "Tune harmonic 3 and turn on Strobe lock. Place A and B at two neighboring nodes. Is that distance a whole wavelength or half? Change strobe phase: do the nodes move?": "Sintoniza el armónico 3 y activa el bloqueo estroboscópico. Coloca A y B en dos nodos vecinos. ¿Esa distancia es una longitud de onda completa o media? Cambia la fase de la luz estroboscópica: ¿se mueven los nodos?",
  "Neighboring nodes are half a wavelength apart, so wavelength λ = 2Δx. Neighboring crests are a full wavelength apart. The strobe changes the position you see within a cycle; it does not change wavelength or stop the actual vibration.": "Los nodos vecinos están a media longitud de onda uno del otro, así que la longitud de onda es λ = 2Δx. Las crestas vecinas están a una longitud de onda completa. La luz estroboscópica cambia la posición que ves dentro de un ciclo; no cambia la longitud de onda ni detiene la vibración real.",
  "Tune harmonic 2. Keep frequency, length and string density fixed, then increase the hanging mass. Will the same resonance remain? Find harmonic 2 again and compare the required frequency.": "Sintoniza el armónico 2. Deja fijas la frecuencia, la longitud y la densidad de la cuerda, y luego aumenta la masa colgante. ¿Se mantiene la misma resonancia? Busca otra vez el armónico 2 y compara la frecuencia necesaria.",
  "More mass increases tension (T = mg), so waves travel faster. At fixed length and harmonic number, the required frequency rises as √T. Doubling mass multiplies it by √2, not 2. Amplitude changes how far the string moves; it does not change the resonance frequency in this model.": "Más masa aumenta la tensión (T = mg), así que las ondas viajan más rápido. Con la longitud y el número de armónico fijos, la frecuencia necesaria aumenta como √T. Duplicar la masa la multiplica por √2, no por 2. La amplitud cambia cuánto se mueve la cuerda; en este modelo no cambia la frecuencia de resonancia.",
  // Model note
  "About this model": "Acerca de este modelo",
  "A lightly damped, small-amplitude string with ideal fixed ends and constant tension T = mg. The small driver is approximated as a node. Near resonance (within 0.5%), an ideal single harmonic makes nodes exactly stationary. Away from resonance, a modal sum (at least 16 modes, extended to cover the driving frequency; damping ratio 0.018) models the steady forced response; transients, pulley friction and string stretch are omitted. Away from resonance, several modes contribute and interior nodes are not stationary. Node markers appear only near resonance with the oscillator on and a nonzero drive. Changing length rescales the apparatus view; use ruler values rather than screen distances. The string’s vertical displacement is magnified; horizontal distances and ruler readings use the selected vibrating length. The strobe samples one phase per driving cycle without visible flashes. Normal playback is 1/40 speed and may alias at very low screen refresh rates.": "Una cuerda con poco amortiguamiento y amplitud pequeña, con extremos fijos ideales y tensión constante T = mg. El pequeño vibrador se aproxima como un nodo. Cerca de la resonancia (dentro del 0.5%), un solo armónico ideal hace que los nodos estén exactamente inmóviles. Lejos de la resonancia, una suma de modos (al menos 16 modos, ampliada para cubrir la frecuencia de excitación; coeficiente de amortiguamiento 0.018) modela la respuesta forzada estable; se omiten los transitorios, la fricción de la polea y el estiramiento de la cuerda. Lejos de la resonancia, varios modos contribuyen y los nodos interiores no están inmóviles. Los marcadores de nodos aparecen solo cerca de la resonancia, con el oscilador encendido y una excitación mayor que cero. Cambiar la longitud cambia la escala del aparato en pantalla; usa los valores de la regla y no las distancias en pantalla. El desplazamiento vertical de la cuerda está ampliado; las distancias horizontales y las lecturas de la regla usan la longitud de vibración elegida. La luz estroboscópica toma una fase por cada ciclo de excitación sin destellos visibles. La reproducción normal va a 1/40 del tiempo real y puede mostrar efectos de muestreo (aliasing) con frecuencias de actualización de pantalla muy bajas.",
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
  "Three loops": "Tres segmentos",
  "Set up the lab. Read the Fundamental f₁ readout. Which generator frequency makes the string vibrate in 3 loops (harmonic 3)?": "Prepara el laboratorio. Lee la lectura FUNDAMENTAL f₁. ¿Qué frecuencia del generador hace vibrar la cuerda en 3 segmentos (armónico 3)?",
  "Harmonics are multiples of f₁, not f₁ plus a number. Harmonic n is at n × f₁.": "Los armónicos son múltiplos de f₁, no f₁ más un número. El armónico n está en n × f₁.",
  "That frequency makes 4 loops. Harmonic 3 has 3 loops.": "Esa frecuencia forma 4 segmentos. El armónico 3 tiene 3 segmentos.",
  "Higher harmonics have higher frequencies than f₁, not lower. Multiply f₁ by n.": "Los armónicos más altos tienen frecuencias mayores que f₁, no menores. Multiplica f₁ por n.",
  "Harmonic n has frequency fₙ = n × f₁. With f₁ = {f1} Hz, harmonic 3 is 3 × {f1} = {h3} Hz. Press the 3 harmonic button to check: the generator shows {h3} Hz and the readout says n = 3.": "El armónico n tiene frecuencia fₙ = n × f₁. Con f₁ = {f1} Hz, el armónico 3 es 3 × {f1} = {h3} Hz. Presiona el botón del armónico 3 para comprobar: el generador marca {h3} Hz y la lectura dice n = 3.",
  // Lab check, question 2
  "Wavelength from the nodes": "Longitud de onda a partir de los nodos",
  "Set up the lab at harmonic 3. Press Place cursors on adjacent nodes. What wavelength does the Measure the string readout give?": "Prepara el laboratorio en el armónico 3. Presiona Colocar los cursores en nodos adyacentes. ¿Qué longitud de onda indica la lectura de Medición de la cuerda?",
  "That is Δx, the distance between neighboring nodes. It is only half a wavelength, so λ = 2Δx.": "Esa es Δx, la distancia entre nodos vecinos. Es solo media longitud de onda, así que λ = 2Δx.",
  "That is the length of the string. At harmonic 3, 1.5 wavelengths fit on it, so one wavelength is shorter.": "Esa es la longitud de la cuerda. En el armónico 3 caben 1.5 longitudes de onda, así que una longitud de onda es menor.",
  "That is the wavelength of harmonic 1, λ = 2L. Harmonic 3 packs in three times as many loops.": "Esa es la longitud de onda del armónico 1, λ = 2L. El armónico 3 tiene el triple de segmentos.",
  "Neighboring nodes are Δx = {dx} m apart, half a wavelength. So λ = 2Δx = {lambda} m. Check: harmonic 3 fits 3 loops on a {L} m string, so λ = 2L / 3 = {lambda} m.": "Los nodos vecinos están a Δx = {dx} m uno del otro, media longitud de onda. Así que λ = 2Δx = {lambda} m. Comprobación: en el armónico 3 caben 3 segmentos en una cuerda de {L} m, así que λ = 2L / 3 = {lambda} m.",
  // Lab check, question 3
  "The same speed": "La misma rapidez",
  "Set up the lab at harmonic 4. Read the Wave speed. Then press the 2 harmonic button and read it again. What does the Wave speed readout show?": "Prepara el laboratorio en el armónico 4. Lee la rapidez de la onda. Luego presiona el botón del armónico 2 y léela de nuevo. ¿Qué indica la lectura RAPIDEZ DE LA ONDA?",
  "Wave speed depends on the string, not on how many loops it has. Tune to another harmonic and watch the readout.": "La rapidez de la onda depende de la cuerda, no de cuántos segmentos tiene. Sintoniza otro armónico y observa la lectura.",
  "That number is the generator frequency, in hertz. Wave speed is in m/s: read the Wave speed readout.": "Ese número es la frecuencia del generador, en hertz. La rapidez de la onda está en m/s: lee la lectura RAPIDEZ DE LA ONDA.",
  "Wave speed depends only on the tension and the string, so it is {v} m/s at harmonic 2 and at harmonic 4. Higher harmonics have a higher frequency and a shorter wavelength: v = fλ = {freq} Hz × {lambda4} m = {v} m/s, and at harmonic 2, {f2} Hz × {lambda2} m = {v} m/s.": "La rapidez de la onda depende solo de la tensión y de la cuerda, así que es de {v} m/s en el armónico 2 y en el armónico 4. Los armónicos más altos tienen mayor frecuencia y menor longitud de onda: v = fλ = {freq} Hz × {lambda4} m = {v} m/s, y en el armónico 2, {f2} Hz × {lambda2} m = {v} m/s.",
  // Lab check, question 4
  "More tension": "Más tensión",
  "Set up the lab. The hanging mass is now 400 g, double the usual 200 g, which gave f₁ = {f1Base} Hz. What does the Fundamental f₁ readout show?": "Prepara el laboratorio. La masa colgante ahora es de 400 g, el doble de los 200 g de siempre, que daban f₁ = {f1Base} Hz. ¿Qué indica la lectura FUNDAMENTAL f₁?",
  "Doubling the mass doubles the tension, but wave speed goes as the square root of tension. f₁ does not double.": "Duplicar la masa duplica la tensión, pero la rapidez de la onda va con la raíz cuadrada de la tensión. f₁ no se duplica.",
  "More mass means more tension, so waves travel faster and f₁ changes. Read the Fundamental readout.": "Más masa significa más tensión, así que las ondas viajan más rápido y f₁ cambia. Lee la lectura FUNDAMENTAL.",
  "More tension makes waves faster, so f₁ rises. It does not fall.": "Más tensión hace las ondas más rápidas, así que f₁ aumenta. No disminuye.",
  "Doubling the mass doubles the tension (T = mg = {T} N). Wave speed goes as √T, so f₁ rises by a factor of √2, about 1.41: {f1Base} × √2 = {f1} Hz, not twice as much.": "Duplicar la masa duplica la tensión (T = mg = {T} N). La rapidez de la onda va con √T, así que f₁ aumenta por un factor de √2, cerca de 1.41: {f1Base} × √2 = {f1} Hz, no el doble.",
  // Lab check, question 5
  "A heavier cord": "Una cuerda más pesada",
  "Set up the lab with the Heavy cord (4.0 g/m) at the same tension and length. What does the Wave speed readout show?": "Prepara el laboratorio con la cuerda pesada (4.0 g/m) con la misma tensión y longitud. ¿Qué indica la lectura RAPIDEZ DE LA ONDA?",
  "A heavier string changes the speed. Compare the readout with {vMedium} m/s for the Medium cord.": "Una cuerda más pesada cambia la rapidez. Compara la lectura con {vMedium} m/s de la cuerda media.",
  "A heavier string is harder to move, so waves travel slower, not faster.": "Una cuerda más pesada cuesta más mover, así que las ondas viajan más lento, no más rápido.",
  "Wave speed goes as 1 / √μ. Doubling μ divides the speed by √2, about 1.41, not by 2.": "La rapidez de la onda va con 1 / √μ. Duplicar μ divide la rapidez entre √2, cerca de 1.41, no entre 2.",
  "v = √(T/μ). Doubling the density at the same tension divides the speed by √2: {vMedium} / √2 = {v} m/s. The same string would also have a lower f₁ and lower harmonics.": "v = √(T/μ). Duplicar la densidad con la misma tensión divide la rapidez entre √2: {vMedium} / √2 = {v} m/s. La misma cuerda también tendría una f₁ menor y armónicos menores."
}};
  if (i18n) i18n.configure(copy);
  // Lab check (labcheck.js and ../shared/zsa-labcheck.js). Each choice is [value, label, feedback key]; the right
  // choice has a null key. Every number in braces is filled in by labcheck.js from the lab's own model (lab.js
  // compute()) and its number formatting, so no answer is written here. setup is the starting state: frequency (Hz),
  // mass (hanging mass, g), length (vibrating length, m), density (string density, kg/m) and nodes (true turns on
  // Label nodes & antinodes). base is the lab's own Reset setup, the usual 200 g, 1.20 m Medium cord that the questions
  // compare with ({f1Base}, {vMedium}).
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
    base: {frequency: 26.1, mass: 200, length: 1.2, density: 0.002},
    questions: [
      {id: "harmonic3", title: "Three loops", setup: {frequency: 26.1, mass: 200, length: 1.2, density: 0.002},
        question: "Set up the lab. Read the Fundamental f₁ readout. Which generator frequency makes the string vibrate in 3 loops (harmonic 3)?",
        choices: [["right", "{h3} Hz", null], ["add", "{add} Hz", "add"], ["h4", "{h4} Hz", "h4"], ["div", "{div} Hz", "div"]],
        feedback: {
          add: "Harmonics are multiples of f₁, not f₁ plus a number. Harmonic n is at n × f₁.",
          h4: "That frequency makes 4 loops. Harmonic 3 has 3 loops.",
          div: "Higher harmonics have higher frequencies than f₁, not lower. Multiply f₁ by n."
        },
        explanation: "Harmonic n has frequency fₙ = n × f₁. With f₁ = {f1} Hz, harmonic 3 is 3 × {f1} = {h3} Hz. Press the 3 harmonic button to check: the generator shows {h3} Hz and the readout says n = 3."},
      {id: "wavelength", title: "Wavelength from the nodes", setup: {frequency: 39.15, mass: 200, length: 1.2, density: 0.002, nodes: true},
        question: "Set up the lab at harmonic 3. Press Place cursors on adjacent nodes. What wavelength does the Measure the string readout give?",
        choices: [["right", "{lambda} m", null], ["dx", "{dx} m", "dx"], ["whole", "{L} m", "whole"], ["twoL", "{twoL} m", "twoL"]],
        feedback: {
          dx: "That is Δx, the distance between neighboring nodes. It is only half a wavelength, so λ = 2Δx.",
          whole: "That is the length of the string. At harmonic 3, 1.5 wavelengths fit on it, so one wavelength is shorter.",
          twoL: "That is the wavelength of harmonic 1, λ = 2L. Harmonic 3 packs in three times as many loops."
        },
        explanation: "Neighboring nodes are Δx = {dx} m apart, half a wavelength. So λ = 2Δx = {lambda} m. Check: harmonic 3 fits 3 loops on a {L} m string, so λ = 2L / 3 = {lambda} m."},
      {id: "speed", title: "The same speed", setup: {frequency: 52.2, mass: 200, length: 1.2, density: 0.002},
        question: "Set up the lab at harmonic 4. Read the Wave speed. Then press the 2 harmonic button and read it again. What does the Wave speed readout show?",
        choices: [["right", "{v} m/s", null], ["double", "{double} m/s", "double"], ["half", "{half} m/s", "half"], ["hz", "{freq} m/s", "hz"]],
        feedback: {
          double: "Wave speed depends on the string, not on how many loops it has. Tune to another harmonic and watch the readout.",
          half: "Wave speed depends on the string, not on how many loops it has. Tune to another harmonic and watch the readout.",
          hz: "That number is the generator frequency, in hertz. Wave speed is in m/s: read the Wave speed readout."
        },
        explanation: "Wave speed depends only on the tension and the string, so it is {v} m/s at harmonic 2 and at harmonic 4. Higher harmonics have a higher frequency and a shorter wavelength: v = fλ = {freq} Hz × {lambda4} m = {v} m/s, and at harmonic 2, {f2} Hz × {lambda2} m = {v} m/s."},
      {id: "tension", title: "More tension", setup: {frequency: 26.1, mass: 400, length: 1.2, density: 0.002},
        question: "Set up the lab. The hanging mass is now 400 g, double the usual 200 g, which gave f₁ = {f1Base} Hz. What does the Fundamental f₁ readout show?",
        choices: [["right", "{f1} Hz", null], ["double", "{double} Hz", "double"], ["same", "{f1Base} Hz", "same"], ["half", "{half} Hz", "half"]],
        feedback: {
          double: "Doubling the mass doubles the tension, but wave speed goes as the square root of tension. f₁ does not double.",
          same: "More mass means more tension, so waves travel faster and f₁ changes. Read the Fundamental readout.",
          half: "More tension makes waves faster, so f₁ rises. It does not fall."
        },
        explanation: "Doubling the mass doubles the tension (T = mg = {T} N). Wave speed goes as √T, so f₁ rises by a factor of √2, about 1.41: {f1Base} × √2 = {f1} Hz, not twice as much."},
      {id: "density", title: "A heavier cord", setup: {frequency: 26.1, mass: 200, length: 1.2, density: 0.004},
        question: "Set up the lab with the Heavy cord (4.0 g/m) at the same tension and length. What does the Wave speed readout show?",
        choices: [["right", "{v} m/s", null], ["same", "{vMedium} m/s", "same"], ["faster", "{vFaster} m/s", "faster"], ["half", "{half} m/s", "half"]],
        feedback: {
          same: "A heavier string changes the speed. Compare the readout with {vMedium} m/s for the Medium cord.",
          faster: "A heavier string is harder to move, so waves travel slower, not faster.",
          half: "Wave speed goes as 1 / √μ. Doubling μ divides the speed by √2, about 1.41, not by 2."
        },
        explanation: "v = √(T/μ). Doubling the density at the same tension divides the speed by √2: {vMedium} / √2 = {v} m/s. The same string would also have a lower f₁ and lower harmonics."}
    ]
  };
  // In Spanish only the words change: ids, setups, choice values and feedback keys stay as they are.
  var text = function (value) { return i18n ? i18n.text(value) : value; };
  var labels = {};
  Object.keys(check.labels).forEach(function (k) { labels[k] = text(check.labels[k]); });
  var localized = {labels: labels, base: check.base, questions: check.questions.map(function (q) {
    var feedback = {};
    Object.keys(q.feedback).forEach(function (k) { feedback[k] = text(q.feedback[k]); });
    return {id: q.id, title: text(q.title), setup: q.setup, question: text(q.question),
      choices: q.choices.map(function (c) { return [c[0], text(c[1]), c[2]]; }), feedback: feedback, explanation: text(q.explanation)};
  })};
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive({check: localized}); });
  // Two instruction steps hold bold text inside one sentence. Spanish rebuilds each from one full template around it.
  if (!i18n || i18n.lang !== "es") return;
  function rebuild(n, template, key) {
    var step = root.querySelector("#zsa-th-instructions li:nth-child(" + n + ")"), strong = step && step.querySelector("strong");
    if (!strong) return;
    var parts = i18n.text(template).split(key);
    step.replaceChildren(document.createTextNode(parts[0]), strong, document.createTextNode(parts[1] || ""));
  }
  rebuild(4, "Turn on {button} to see the string at the same point in every cycle. This virtual synchronized light holds a stationary view without flashing the screen. Use the phase slider to inspect different positions. Track one string point to see transverse motion: it moves up and down, not along the string.", "{button}");
  rebuild(6, "Move the two measurement cursors using their sliders, or drag their handles along the ruler. The adjacent-node button aligns the cursors at resonance. The readout only converts spacing to wavelength when the cursors sit on neighboring nodes. Adjacent nodes are half a wavelength apart: {formula}.", "{formula}");
}());
