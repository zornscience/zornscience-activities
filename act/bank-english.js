// ACT Practice, English question bank. Only "reviewed" passages appear to students; ?drafts=1 shows drafts too.
// In a passage, <u3>words</u3> underlines a part and numbers it with the passage's third question; <b3/> puts the
// boxed number 3 at a spot (for questions about adding or moving a sentence). A question about an underlined part
// may leave its stem empty: the page asks for the best version of that part. Choice one of such a question is
// usually "NO CHANGE". Text may also use <sub>, <sup>, <em> and <strong>.
// Explanations must not name a choice letter: letters depend on where a question lands in a set.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var bank = {section: "english", passages: [
    {
      id: "seed-library",
      type: "Informative",
      title: "The Library That Lends Seeds",
      status: "draft",
      body: [
        {kind: "text", html: "Most public libraries lend books, movies, and sometimes even tools. The library in my town also <u1>lends seeds, it</u1> started the program three years ago with a single wooden cabinet near the front desk. Each small drawer <u2>are labeled</u2> with the name of a vegetable or a flower."},
        {kind: "text", html: "The idea is simple. A gardener <u3>borrows</u3> a packet of seeds in the spring, grows the plants, and lets a few of them go to seed at the end of the summer. <u4>Then, the gardener returns</u4> some of the new seeds to the library so that someone else can borrow them the next year."},
        {kind: "text", html: "The program has grown <u5>quickly, last spring,</u5> more than two hundred people borrowed seeds. Volunteers sort the returned seeds <u6>by hand, one at a time, individually</u6>, and throw out any that look damaged or moldy. The most popular packets are tomatoes, beans, and sunflowers. <b7/>"},
        {kind: "text", html: "Seed libraries also help protect rare plants. Some of the beans in the cabinet came from a farmer whose family <u8>has saved it</u8> for more than a century. Every time someone grows these beans and returns the seeds, <u9>the variety lives to fight another day</u9>."}
      ],
      questions: [
        {skill: "structure", difficulty: 1, stem: "",
          choices: ["NO CHANGE", "lends seeds. It", "lends seeds it", "lends seeds; and it"], answer: 1,
          explanation: "\"The library in my town also lends seeds\" and \"it started the program\" are both complete sentences. Joining them with only a comma is a comma splice. A period fixes it. A semicolon would work alone, but not with \"and\" after it."},
        {skill: "grammar", difficulty: 1, stem: "",
          choices: ["NO CHANGE", "were labeled", "is labeled", "have been labeled"], answer: 2,
          explanation: "The subject is \"drawer\", which is singular, so the verb must be singular: \"is labeled\". The passage describes the cabinet in the present tense, so \"were\" does not fit either."},
        {skill: "grammar", difficulty: 1, stem: "",
          choices: ["NO CHANGE", "borrowed", "will have borrowed", "had borrowed"], answer: 0,
          explanation: "The rest of the sentence uses the present tense (\"grows\" and \"lets\") to describe how the program works, so \"borrows\" keeps the verbs consistent."},
        {skill: "organization", difficulty: 2, stem: "",
          choices: ["NO CHANGE", "However, the gardener returns", "For example, the gardener returns", "Instead, the gardener returns"], answer: 0,
          explanation: "Returning the seeds is the next step after growing the plants, so a time word like \"Then\" fits. \"However\" and \"Instead\" signal a contrast, and \"For example\" signals an example, which this sentence is not."},
        {skill: "punct", difficulty: 2, stem: "",
          choices: ["NO CHANGE", "quickly; last spring,", "quickly last spring,", "quickly, last spring"], answer: 1,
          explanation: "\"The program has grown quickly\" and \"last spring, more than two hundred people borrowed seeds\" are both complete sentences. A semicolon can join them. The comma after \"spring\" sets off the introductory phrase in the second sentence."},
        {skill: "style", difficulty: 2, stem: "",
          choices: ["NO CHANGE", "by hand, one at a time, separately", "by hand, one at a time", "individually by hand, singly"], answer: 2,
          explanation: "\"One at a time\", \"individually\", \"separately\" and \"singly\" all mean the same thing. Saying it once is enough, so the shortest choice is best."},
        {skill: "development", difficulty: 2, stem: "At this point, the writer is considering adding the following sentence: \"Tomatoes were first grown as food in Central and South America.\" Should the writer make this addition here?",
          choices: ["Yes, because it gives useful background about one of the popular seeds.", "Yes, because it explains why tomatoes are so popular at the library.", "No, because it shifts the focus from the seed library to the history of one plant.", "No, because it contradicts the claim that tomatoes are popular."], answer: 2,
          explanation: "The paragraph is about how the seed library has grown and how it works. The history of tomatoes is true but off topic, and it does not explain why people borrow them."},
        {skill: "grammar", difficulty: 3, stem: "",
          choices: ["NO CHANGE", "has saved them", "have saved it", "saving them"], answer: 1,
          explanation: "The pronoun stands for \"beans\", which is plural, so it must be \"them\". \"Family\" is one group, so \"has saved\" is right. Without a helping verb, \"saving\" leaves the clause without a complete verb."},
        {skill: "style", difficulty: 2, stem: "",
          choices: ["NO CHANGE", "the variety is, like, still around", "the variety totally makes it", "the variety survives for another year"], answer: 3,
          explanation: "The essay is informative and fairly formal. \"Survives for another year\" says exactly what happens in a tone that matches. The other choices are slang or a cliché."},
        {skill: "development", difficulty: 3, stem: "Suppose the writer's goal had been to write a short essay explaining how a community program helps local gardeners. Would this essay accomplish that goal?",
          choices: ["Yes, because it describes how the seed library works and how it helps gardeners and rare plants.", "Yes, because it gives step-by-step directions for growing tomatoes and beans.", "No, because it focuses mainly on the history of public libraries.", "No, because it describes only one gardener's experience with the program."], answer: 0,
          explanation: "The essay explains how gardeners borrow and return seeds, how much the program has grown, and how it protects rare plants. That meets the goal. It does not give growing directions or focus on library history or one gardener."}
      ]
    }
  ]};
  root.addEventListener("zsa:request-bank", function (event) { event.detail.receive(bank); }, {once: true});
}());
