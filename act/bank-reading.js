// ACT Practice, Reading question bank. Only "reviewed" passages appear to students; ?drafts=1 shows drafts too.
// Types: Prose Fiction, Social Science, Humanities, Natural Science. With `numbered: true` every text block is a
// numbered paragraph, so questions can point to "paragraph 3". A "note" block is the italic line above a passage,
// and "heading" blocks split a paired passage into Passage A and Passage B. Text may use <em> and <strong>.
// Explanations must not name a choice letter: letters depend on where a question lands in a set.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var bank = {section: "reading", passages: [
    {
      id: "hummingbird-torpor",
      type: "Natural Science",
      title: "The Hummingbird's Night Budget",
      status: "draft",
      numbered: true,
      body: [
        {kind: "note", html: "This passage was written for this practice test."},
        {kind: "text", html: "On a cold mountain night, a hummingbird faces a problem that most birds never do. It is so small, and it burns energy so fast, that it can run out of fuel before morning. A hummingbird's heart can beat more than a thousand times a minute while it flies, and the bird must drink nectar from hundreds of flowers each day just to keep going."},
        {kind: "text", html: "The bird's solution is a state called torpor. As the evening cools, the hummingbird perches, fluffs its feathers, and lets its body temperature drop, sometimes by more than 20 degrees Celsius. Its heartbeat slows to fewer than 100 beats a minute, and its breathing becomes so shallow that it can seem to stop. In this state, the bird uses only a small fraction of the energy it would need to stay warm."},
        {kind: "text", html: "Torpor is not the same as sleep. A sleeping bird can wake in an instant, but a bird in torpor cannot. In the morning it must shiver for twenty minutes or more to warm its flight muscles before it can fly. During that time it is nearly helpless, which may be why hummingbirds choose sheltered, hidden perches before they settle in for the night."},
        {kind: "text", html: "For many years, scientists thought hummingbirds used torpor only in emergencies, when they had not found enough food. Recent studies in the Andes Mountains of South America suggest otherwise. Researchers who measured the body temperatures of several species found that some birds entered torpor almost every night, even when they had eaten well. One bird let its body temperature fall to just above 3 degrees Celsius, colder than any bird had been known to survive."},
        {kind: "text", html: "Why would a well-fed bird bother? The researchers suggest that torpor lets hummingbirds save their fat for when they really need it, such as during long migrations. If that is true, torpor is less like an emergency brake and more like a careful budget: a way of spending as little as possible on the nights when spending is not necessary."}
      ],
      questions: [
        {skill: "main", difficulty: 1, stem: "The main purpose of the passage is to:",
          choices: ["explain how hummingbirds use torpor to save energy and how scientists' ideas about it have changed.", "argue that hummingbirds in the Andes need more protection from predators.", "compare the way hummingbirds sleep with the way other birds sleep.", "describe how hummingbirds find the hundreds of flowers they visit each day."], answer: 0,
          explanation: "The passage describes what torpor is (paragraphs 2 and 3) and how research changed what scientists think about when hummingbirds use it (paragraphs 4 and 5). The other choices are either not discussed or are only small details."},
        {skill: "detail", difficulty: 1, stem: "According to the passage, during torpor a hummingbird's heart rate:",
          choices: ["rises to more than a thousand beats a minute.", "stays the same as it is during sleep.", "slows to fewer than 100 beats a minute.", "stops completely until morning."], answer: 2,
          explanation: "Paragraph 2 says the heartbeat \"slows to fewer than 100 beats a minute\". The thousand beats a minute in paragraph 1 is the rate while flying, and it is the breathing, not the heart, that can seem to stop."},
        {skill: "vocab", difficulty: 2, stem: "As it is used in paragraph 5, the word <em>budget</em> most nearly means:",
          choices: ["a list of prices.", "a plan for using a limited supply.", "an amount of money.", "a small meal."], answer: 1,
          explanation: "The author compares torpor to \"spending as little as possible\" when spending is not necessary. The bird is managing a limited supply of energy, so a budget here is a plan for using a limited supply, not money itself."},
        {skill: "infer", difficulty: 2, stem: "Based on paragraph 3, a hummingbird in torpor would most likely be in the greatest danger if:",
          choices: ["it found more nectar than usual the evening before.", "the night were warmer than usual.", "it woke up quickly in the morning.", "a predator found it before it had warmed up."], answer: 3,
          explanation: "Paragraph 3 says a bird in torpor cannot wake quickly and is \"nearly helpless\" while it shivers to warm up, which may be why it hides. A predator arriving then would be the biggest danger."},
        {skill: "purpose", difficulty: 2, stem: "The author mentions that a hummingbird's heart can beat more than a thousand times a minute (paragraph 1) mainly to:",
          choices: ["show how much energy a hummingbird uses.", "prove that hummingbirds are the fastest birds.", "explain why torpor is dangerous.", "compare hummingbirds with humans."], answer: 0,
          explanation: "Paragraph 1 is about how fast the bird burns energy and how it can run out of fuel. The heart rate is an example of that high energy use, which sets up why the bird needs torpor."},
        {skill: "structure", difficulty: 3, stem: "Which of the following best describes how paragraph 4 relates to paragraph 2?",
          choices: ["Paragraph 4 shows that the description of torpor in paragraph 2 is wrong.", "Paragraph 4 repeats the description in paragraph 2 with more numbers.", "Paragraph 2 describes what torpor is, and paragraph 4 presents research that changed ideas about when it is used.", "Paragraph 2 describes sleep, and paragraph 4 describes torpor."], answer: 2,
          explanation: "Paragraph 2 explains what happens to a bird in torpor. Paragraph 4 does not contradict that; it reports new findings that birds use torpor often, not just in emergencies."},
        {skill: "detail", difficulty: 2, stem: "According to the passage, scientists once believed that hummingbirds used torpor:",
          choices: ["every night of the year.", "only when they had not found enough food.", "only during long migrations.", "only in the Andes Mountains."], answer: 1,
          explanation: "Paragraph 4 says scientists \"thought hummingbirds used torpor only in emergencies, when they had not found enough food.\""},
        {skill: "infer", difficulty: 3, stem: "The researchers' suggestion in paragraph 5 would be most strongly supported by a finding that hummingbirds:",
          choices: ["ate less on evenings before they entered torpor.", "entered torpor only on the coldest nights.", "lost fat faster in torpor than during ordinary sleep.", "had more stored fat at the start of migration when they had used torpor often."], answer: 3,
          explanation: "The suggestion is that torpor saves fat for later needs like migration. Birds with more fat before migration after frequent torpor would fit that idea. Losing fat faster in torpor would work against it."},
        {skill: "purpose", difficulty: 3, stem: "The comparison in the last sentence of the passage suggests that torpor is:",
          choices: ["a sign that a hummingbird is sick or starving.", "a way for hummingbirds to fly farther each day.", "a regular, planned way of saving energy rather than only a last resort.", "something hummingbirds do only during storms."], answer: 2,
          explanation: "An emergency brake is used only in a crisis, while a budget is used all the time to plan spending. The comparison says torpor is a routine way to save energy, not just an emergency response."}
      ]
    }
  ]};
  root.addEventListener("zsa:request-bank", function (event) { event.detail.receive(bank); }, {once: true});
}());
