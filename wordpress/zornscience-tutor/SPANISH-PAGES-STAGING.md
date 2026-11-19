# WordPress edits for the Spanish Students and Tutor pages (apply on staging first)

These pages live in WordPress, not in this repository, so they are not changed by the branch. Each edit below is exact.
Nothing here has been applied to zornscience.org. Needs plugin 1.7.2 (the `lang` attribute below is new in 1.7.2).

## 1. Spanish Students page (https://zornscience.org/es/students/)

Read from the live page on November 19, 2026. Four links point to the English activities catalog. Change each URL to
`https://activities.zornscience.org/?lang=es` (Style Kit section 5: links to activities.zornscience.org add `lang=es`
when the activity, or here the catalog, has Spanish):

| Where | Link text (keep) | New URL |
|---|---|---|
| Practice card heading ("Actividades de práctica") | Actividades de práctica | https://activities.zornscience.org/?lang=es |
| Call to action under the Practice card | Ve todas las actividades → | https://activities.zornscience.org/?lang=es |
| Main menu, under Estudiantes | Actividades de práctica | https://activities.zornscience.org/?lang=es |
| Footer, under Explora | Actividades de práctica | https://activities.zornscience.org/?lang=es |

The menu and footer links are menu items (Appearance > Editor > Navigation, or Appearance > Menus), so editing them there
also fixes every other Spanish page that shows the same menu. Check the English menu is not shared: the English items must
keep `https://activities.zornscience.org/`.

The three tutor links on the Spanish Students page (the "Tutor" header button, the Help card heading and the call to
action "Pregúntale al tutor →") and the "Tutor" item in the Spanish menu and footer point to the English page
`https://zornscience.org/tutor/`. After step 2, change them to `https://zornscience.org/es/tutor/`.

## 2. New Spanish tutor page (https://zornscience.org/es/tutor/)

Today /es/tutor/ shows the English page. Create a page with the slug `tutor` under the Spanish parent page `es`, using the
same template as the English tutor page. Title: **Pregunta al tutor de ZornScience**. Page body (paste the blocks in this
order; the shortcode block is the third one):

> El tutor de ZornScience te ayuda con química, física y biología. Puedes escribir tu pregunta, compartir una foto de tu trabajo o dictarla con la voz. El tutor no te da la respuesta de inmediato: te hace preguntas para que tú encuentres el camino.
>
> El tutor entiende preguntas en inglés y en español. Para cambiar el idioma, elige **English** o **Español** en los botones de arriba del chat. Si lo que escribes está en español, el tutor te responde en español.

Shortcode block:

```
[zornscience_tutor lang="es"]
```

Under the widget:

> ## Cómo funciona el tutor
>
> **Aprendes con preguntas.** El tutor te guía paso a paso y te pide que expliques tu razonamiento. Si te atoras, te da una pista, no la respuesta completa.
>
> **Temas.** Química, física, biología y las matemáticas que necesitas en esas clases.
>
> **Voz.** El micrófono escribe lo que dices en el cuadro de texto, y tú lo revisas antes de enviarlo. Usa el reconocimiento de voz de tu navegador. ZornScience no graba ni guarda tu voz.
>
> **Privacidad.** El tutor de ZornScience es un programa de inteligencia artificial (IA), no una persona. Tu mensaje y los mensajes recientes de este chat se envían a Anthropic para generar una respuesta. ZornScience no guarda tus chats. No escribas nombres, datos de contacto, calificaciones ni otra información privada, y recorta tu nombre de las fotos. [Lee el aviso de privacidad.](https://zornscience.org/es/privacy/#privacidad-estudiantil)
>
> ## Cosas que puedes preguntar
>
> - No me sale un problema de estequiometría. ¿Me ayudas a empezar?
> - ¿Me puedes explicar la segunda ley de Newton de forma sencilla?
> - ¿Cómo funciona la selección natural?
> - Resolví un problema y quiero revisar mi trabajo.
> - ¿Cómo balanceo esta ecuación química?
> - No entiendo por qué se equilibra esta reacción. ¿Me lo explicas con un ejemplo?
> - ¿Cómo convierto gramos a moles?
> - ¿Qué dice la gráfica de velocidad contra tiempo de este problema?
> - ¿Cuál es la diferencia entre mitosis y meiosis?
>
> **Consejo.** Mientras más muestres tu trabajo, mejor te puede ayudar el tutor. Puedes adjuntar una foto o pegar una captura de pantalla. Antes de enviarla, recorta tu nombre.
>
> **El tutor es gratis para estudiantes.** Si quieres apoyar el proyecto, puedes [invitarme un café](the same "buy me a coffee" URL as on the English tutor page).

Terms used are already in the Style Kit glossary (tutor, inteligencia artificial, aviso de privacidad, estequiometría,
selección natural). No new glossary entries.

## 3. English tutor page (https://zornscience.org/tutor/)

The page still tells students to "click the Mexican flag above the chat". The language buttons now say **English** and
**Español** (plugin 1.7.2), so the flag no longer exists. Replace that Spanish paragraph with:

> ¿Prefieres español? Elige **Español** en los botones de idioma de arriba del chat, o abre la [página en español](https://zornscience.org/es/tutor/). El tutor te responde en el idioma en que le escribas. Escribir con la voz usa el reconocimiento de voz de tu navegador, y ZornScience no graba ni guarda tu voz.

Also replace the English sentence that mentions a flag, if the page has one.

## 4. After applying on staging, check

1. /es/students/: all four catalog links open https://activities.zornscience.org/?lang=es, and the page opens in Spanish.
2. /es/tutor/: the widget starts in Spanish, the privacy link goes to the Spanish notice, English / Español switch works.
3. /tutor/: the widget still starts in English (or in the browser's language) and no sentence mentions a flag.
4. Menu and footer on a Spanish page and on an English page each point to their own language.
