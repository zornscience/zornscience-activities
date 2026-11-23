// Every word the Test Policy Checker shows that does not come from the data: English, with its Mexican Spanish for
// shared/zsa-i18n.js. The school names, exceptions and tests accepted come from data.js (built from the Sheet).
// Spanish follows the Style Kit (section 6, After High School) and the live Spanish Four-Year Colleges page:
// resultado for a test score, promedio for GPA, colocación en clases for course placement, tú for the student.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="test-policy-checker"]');
  if (!root) return;
  var copy = {title: "Test Policy Checker", es: {
    "Test Policy Checker": "Verificador de políticas de exámenes",
    // Header and dialogs
    "Instructions": "Instrucciones",
    "Close instructions": "Cerrar instrucciones",
    "Close": "Cerrar",
    "Share activity": "Compartir actividad",
    "Share": "Compartir",
    "Share this tool": "Comparte esta herramienta",
    "Close share options": "Cerrar opciones para compartir",
    "Share a clean link to the map. Your choices are not included.": "Comparte un enlace limpio al mapa. Tus selecciones no se incluyen.",
    "Share link": "Enlace para compartir",
    "Copy link": "Copiar enlace",
    "Email": "Correo electrónico",
    "Link copied.": "Enlace copiado.",
    "Link selected. Copy it with Ctrl+C or Command+C.": "Enlace seleccionado. Cópialo con Ctrl+C o Comando+C.",
    "Choose a state on the map, in the State list, or with the buttons under the map.": "Elige un estado en el mapa, en la lista Estado o con los botones debajo del mapa.",
    "Or type part of a school's name to search every state.": "O escribe parte del nombre de una universidad para buscar en todos los estados.",
    "Use Policy to show one kind of policy. The map then shows how many schools in each state have it.": "Usa Política para ver un solo tipo de política. El mapa muestra cuántas universidades de cada estado la tienen.",
    "Each school shows its policy, the tests it accepts, any exception, and a link to the page we checked.": "Cada universidad muestra su política, los exámenes que acepta, cualquier excepción y un enlace a la página que revisamos.",
    "On the map, use the arrow keys to move from state to state, and Enter or Space to choose one.": "En el mapa, usa las flechas para moverte de un estado a otro, y Enter o la barra espaciadora para elegir uno.",
    "This tool needs JavaScript. Turn it on to see the map and the list.": "Esta herramienta necesita JavaScript. Actívalo para ver el mapa y la lista.",
    // Intro and controls
    "ACT and SAT policies of public four-year universities for students starting college in fall 2027.": "Políticas del ACT y el SAT de las universidades públicas de cuatro años para el ingreso en el otoño de 2027.",
    "Policies change every admissions cycle. Confirm on the college's page before you apply.": "Las políticas cambian en cada ciclo de admisión. Confírmalas en la página de la universidad antes de solicitar.",
    "State": "Estado",
    "Choose a state": "Elige un estado",
    "Search by school name": "Busca por nombre de universidad",
    "Policy": "Política",
    "All policies": "Todas las políticas",
    "{label} ({n})": "{label} ({n})",
    "Map of the United States. Choose a state to see its public universities.": "Mapa de Estados Unidos. Elige un estado para ver sus universidades públicas.",
    "Small states": "Estados pequeños",
    "What the policies mean": "Qué significa cada política",
    "Darker states have more schools with this policy. The number on each state is how many.": "Los estados más oscuros tienen más universidades con esta política. El número en cada estado indica cuántas.",
    // Policies
    "Test required": "Examen obligatorio",
    "Test optional": "Exámenes opcionales",
    "Test free": "Sin examen",
    "Test flexible": "Exámenes flexibles",
    "Varies": "Varía",
    "Not confirmed": "Sin confirmar",
    "No first-year admission": "Sin admisión de primer año",
    "Every first-year applicant sends a test score the college accepts, such as the ACT or SAT.": "Todos los solicitantes de primer año envían un resultado de un examen que la universidad acepta, como el ACT o el SAT.",
    "You choose whether to send a score. If you send one, the college looks at it.": "Tú decides si envías un resultado. Si lo envías, la universidad lo toma en cuenta.",
    "The college does not look at ACT or SAT scores for admission, even if you send them.": "La universidad no toma en cuenta el ACT ni el SAT para la admisión, aunque los envíes.",
    "A score is one way to qualify. A GPA or class rank can qualify you without one.": "Un resultado es una forma de calificar. Tu promedio o tu lugar en la clase pueden darte la admisión sin él.",
    "Whether you need a score depends on your GPA, your program or the kind of applicant you are.": "Si necesitas un resultado depende de tu promedio, de tu programa o de tu tipo de solicitud.",
    "We could not confirm this policy on the college's own page. Check its admissions page.": "No pudimos confirmar esta política en la página de la universidad. Revisa su página de admisiones.",
    "This university admits transfer students only, not first-year students.": "Esta universidad solo admite estudiantes de transferencia, no estudiantes de primer año.",
    // Results
    "Choose a state on the map or from the list, or search for a school.": "Elige un estado en el mapa o en la lista, o busca una universidad.",
    "{n} public universities in the 50 states and Washington, DC, checked {date}.": "{n} universidades públicas en los 50 estados y Washington, D. C., revisadas el {date}.",
    "{state}: 1 public university": "{state}: 1 universidad pública",
    "{state}: {n} public universities": "{state}: {n} universidades públicas",
    "{shown} of {n} have this policy: {policy}.": "{shown} de {n} tienen esta política: {policy}.",
    "None of the public universities in {state} have this policy: {policy}.": "Ninguna universidad pública de {state} tiene esta política: {policy}.",
    "1 school matches “{q}”": "1 universidad coincide con “{q}”",
    "{n} schools match “{q}”": "{n} universidades coinciden con “{q}”",
    "No school matches “{q}”. Try one word of the name, such as State or Tech.": "Ninguna universidad coincide con “{q}”. Prueba una palabra del nombre, como State o Tech.",
    "{n} schools in all states have this policy: {policy}": "{n} universidades de todos los estados tienen esta política: {policy}",
    "Schools by policy:": "Universidades por política:",
    "Tests accepted:": "Exámenes aceptados:",
    "Branch campus": "Campus regional",
    "Federal service academy": "Academia militar federal",
    "Admissions testing page": "Página de exámenes de admisión",
    " (opens in a new tab)": " (se abre en una pestaña nueva)",
    " (in English)": " (en inglés)",
    "Checked {date}": "Revisado el {date}",
    "This page covers fall 2027.": "Esta página cubre el ingreso en el otoño de 2027.",
    "This page names fall 2026 only. Confirm the rule for fall 2027.": "Esta página solo menciona el otoño de 2026. Confirma la regla para el otoño de 2027.",
    "This page names an earlier year only. Confirm the rule for fall 2027.": "Esta página solo menciona un año anterior. Confirma la regla para el otoño de 2027.",
    "This page does not name a year.": "Esta página no menciona un año.",
    "The page names only the ACT. Ask the college whether it takes the SAT.": "La página solo menciona el ACT. Pregunta a la universidad si acepta el SAT.",
    "The page prefers the ACT but also takes the SAT.": "La página prefiere el ACT, pero también acepta el SAT.",
    "The page requires the ACT.": "La página exige el ACT.",
    "The page prefers the SAT but also takes the ACT.": "La página prefiere el SAT, pero también acepta el ACT.",
    "The page requires the SAT.": "La página exige el SAT.",
    // Map labels for screen readers
    "{state}, {n} public universities": "{state}, {n} universidades públicas",
    "{state}, 1 public university": "{state}, 1 universidad pública",
    "{state}, {n} with this policy": "{state}, {n} con esta política",
    // Footer
    "No account needed. Nothing you choose or type leaves this page.": "No necesitas cuenta. Nada de lo que eliges o escribes sale de esta página.",
    "All activities": "Todas las actividades",
    "← Back to the lesson": "← Volver a la lección"
  }};
  root.addEventListener("zsa:request-copy", function (event) { event.detail.receive(copy); }, {once: true});
}());
