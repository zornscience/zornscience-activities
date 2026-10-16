// Starter data: everything a student reads lives here, so content can be checked without reading the logic.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="starter"]');
  if (!root) return;
  var data = {
    // The practice items. Each has a unique key (symbol) and whatever the steps need.
    items: [
      {name: "sodium", symbol: "Na", group: 1, metal: true, moved: 1},
      {name: "magnesium", symbol: "Mg", group: 2, metal: true, moved: 2},
      {name: "aluminum", symbol: "Al", group: 13, metal: true, moved: 3},
      {name: "potassium", symbol: "K", group: 1, metal: true, moved: 1},
      {name: "nitrogen", symbol: "N", group: 15, metal: false, moved: 3},
      {name: "oxygen", symbol: "O", group: 16, metal: false, moved: 2},
      {name: "fluorine", symbol: "F", group: 17, metal: false, moved: 1},
      {name: "chlorine", symbol: "Cl", group: 17, metal: false, moved: 1}
    ],
    // Text with {slots}: {name}, {Name} (capitalized), {group}, {moved} (a number), {electrons} ("1 electron",
    // "2 electrons"), {kind} (metal or nonmetal), {change} (loses or gains).
    ui: {
      questions: ["Is this element a metal or a nonmetal?", "Does it lose or gain electrons, and how many?"],
      kinds: [["metal", "Metal"], ["nonmetal", "Nonmetal"]],
      directions: [["loses", "Lose"], ["gains", "Gain"]],
      countLegend: "How many electrons?",
      caption: "Group {group}",
      feedback: {
        side: "Metals are on the left of the table, nonmetals on the right. {Name} is in group {group}.",
        direction: "For these common ions, metals lose electrons and nonmetals gain them.",
        number: "Count again. How many electrons must change to reach a full outer level?"
      },
      hints: [
        ["Find {name} on the table. Which side is it on?", "{Name} is in group {group}."],
        ["Metals lose electrons; nonmetals gain them to reach 8.", "{Name} is in group {group}. Count the electrons it must lose or gain to reach a full outer level."]
      ],
      trail: ["{Kind}", "{Change} {moved}"],
      explain: ["{Name} is a {kind} (group {group}).", "{Name} {change} {electrons} to reach a full outer level."],
      summary: "{Name} {change} {electrons}.",
      stats: ["Metal or nonmetal", "Lose or gain"],
      labels: {next: "Next element", complete: "Element complete", singleDone: "Chosen element complete",
        firstTry: "First-try correct on original elements", itemLabel: "Element", singleLabel: "Chosen element",
        currentMark: " (this element)"}
    },
    groups: [1, 2, 13, 14, 15, 16, 17, 18],
    table: [
      ["H", "", "", "", "", "", "", "He"], ["Li", "Be", "B", "C", "N", "O", "F", "Ne"], ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"],
      ["K", "Ca", "Ga", "Ge", "As", "Se", "Br", "Kr"], ["Rb", "Sr", "In", "Sn", "Sb", "Te", "I", "Xe"], ["Cs", "Ba", "Tl", "Pb", "Bi", "Po", "At", "Rn"]
    ]
  };
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(data); }, {once: true});
}());
