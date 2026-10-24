// ACT Practice: every word a student sees (`ui`), and for each section its own words, skill names and tips
// (`sections`). Questions live in the bank files (bank-english.js, bank-math.js, bank-reading.js, bank-science.js).
// A section's `ui` replaces the shared `ui` entry of the same name while that section is open.
// Placeholders in braces ({name}, {count}) are filled in by act.js.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var data = {
  ui: {
    homeEyebrow: "Test prep",
    homeTitle: "ACT Practice",
    homeLede: "Practice questions, one section, or the whole test with original ACT-style questions. Every section ends with a score report that shows how you compare nationally and which skills to work on next. Nothing is saved or sent anywhere.",
    brandHome: "ACT Practice",
    fullTitle: "Full ACT",
    fullText: "English, Math, and Reading, with a 10-minute break after Math, then the optional Science section. You get a composite score and a score for each section. About 3 hours with Science, 2 hours 15 minutes without.",
    includeScience: "Include the optional Science section",
    fullStart: "Start the full ACT",
    fullSoon: "The full ACT opens when every section has a full set of reviewed questions. Until then, practice one section at a time.",
    sectionsTitle: "Practice one section",
    sectionLine: "{count} questions in {minutes} minutes",
    sectionOptional: " (optional)",
    homeFactsTitle: "The ACT",
    homeFacts: [
      ["3", "required sections: English, Math, and Reading. Science is optional."],
      ["1-36", "score range for each section. The composite is the average of English, Math, and Reading."],
      ["{avg}", "national average composite score for the {avgClass}."],
      ["2:05", "hours of testing for the three required sections, plus 40 minutes for Science."]
    ],
    homeFactsNote: "Science no longer counts toward the composite on the national ACT, but Illinois students take it as part of the state ACT at school.",
    eyebrow: "Practice set",
    backHome: "All sections",
    noQuestions: "Questions for this section are being written and reviewed. Check back soon.",
    modeOne: "One passage",
    modeMixed: "Mixed practice",
    modeFull: "Full section",
    modeFullText: "{count} questions in {minutes} minutes, like the real test, with an estimated ACT {name} score and percentile.",
    draftsTitle: "Review drafts",
    draftsNote: "This list appears only with ?drafts=1 in the address. Drafts stay hidden from students until their status is changed to reviewed in the bank file. While this list is showing, the practice modes above use drafts too. Each button below starts that passage or question on its own, untimed.",
    draftLine: "{type} · {count} questions · {status}",
    draftLineOne: "{type} · {status}",
    statusDraft: "Draft",
    statusReviewed: "Reviewed",
    factsTitle: "The ACT {name} test",
    barLabel: "{section} · Passage {n} of {total}",
    barLabelSolo: "{section}",
    passageLabel: "Passage {roman} · {type}",
    passageRegion: "Passage {roman}",
    figureData: "Data in {caption}",
    timeLeft: "Time left",
    timeUsedLabel: "Time used",
    hideTimer: "Hide timer",
    showTimer: "Show timer",
    timerHidden: "Timer hidden",
    directions: "Directions",
    directionsTitle: "{name} test directions",
    directionsIntro: "This section has {passages} {passageWord} and {count} questions. Each passage is followed by several questions.",
    directionsIntroSolo: "This section has {count} {questionWord}.",
    directionsTimed: "You have {minutes} minutes. The timer at the top counts down. You will see a notice when 5 minutes are left, and the section ends when time runs out.",
    directionsUntimed: "This practice is untimed. The clock at the top counts up so you can see your pace. On the ACT, plan on about {pace} per question.",
    tools: "Tools",
    toolHighlight: "Highlighter",
    hlColors: "Highlighter options",
    yellow: "Yellow",
    green: "Green",
    blue: "Blue",
    erase: "Erase",
    hlApply: "Highlight selection",
    hlClear: "Clear",
    hlAdded: "Highlighted.",
    hlRemoved: "Highlight removed.",
    hlCleared: "Highlights cleared on this question and its passage.",
    toolReader: "Line reader",
    readerLabel: "Line reader. Use the Up and Down arrow keys to move it, and Shift with Up or Down to make it shorter or taller.",
    readerValue: "Showing {from}% to {to}% of the passage area",
    toolElim: "Eliminator",
    toolMask: "Masking",
    zoomLabel: "Passage zoom",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    zoomAnnounce: "Passage zoom {pct}%",
    eliminate: "Eliminate choice {letter}",
    eliminated: " (eliminated)",
    hideChoice: "Hide choice {letter}",
    choiceHidden: "Choice hidden",
    startSection: "Start the section",
    back: "Back",
    close: "Close",
    question: "Question {n}",
    ofTotal: " of {total}",
    questionBox: "Question ",
    paragraph: "Paragraph ",
    over: " over ",
    flag: "Flag for review",
    previous: "Previous",
    next: "Next",
    toReview: "Review",
    navLabel: "Questions",
    navItem: "Question {n}",
    answered: "answered",
    unanswered: "not answered",
    flagged: "flagged",
    announce: "Question {n} of {total}",
    fiveLeft: "5 minutes left. Check the review screen for questions you have not answered.",
    dismiss: "OK",
    section: "{name}",
    reviewHeading: "Section review",
    reviewCounts: "{answered} answered, {unanswered} not answered, {flagged} flagged, out of {total} questions.",
    reviewUnanswered: "Not answered",
    reviewFlagged: "Flagged",
    reviewAll: "All questions",
    reviewNone: "None.",
    reviewHint: "Select a question number to go back to it.",
    legendAnswered: "Answered",
    legendUnanswered: "Not answered",
    legendFlagged: "Flagged",
    returnToQuestions: "Return to questions",
    endSection: "End section",
    endTitle: "End the section?",
    endText: "After you end the section, you cannot change your answers.",
    endBlank: "You have {count} {questions} not answered. There is no penalty for guessing.",
    endYes: "Yes, end the section",
    endNo: "No, keep working",
    openInTest: "Show with passage",
    openInTestSr: " (question {n})",
    answersLabel: "Answer review · Passage {n} of {total}",
    answersLabelSolo: "Answer review · {section}",
    backToReport: "Back to score report",
    toReport: "Score report",
    choicesLabel: "Answer choices",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    explanation: "Explanation",
    skillLine: "Skill: {skill}",
    stateCorrect: "correct",
    stateMissed: "missed",
    timeUp: "Time is up. The section ended when the timer reached 0:00, and questions you did not answer count as blank.",
    reportTitle: "Score report",
    correct: "{pct}% correct",
    timeUsed: "Time {time}, {pace} ({paceTime} for {count} questions).",
    onPace: "on ACT pace",
    slowPace: "slower than ACT pace",
    estimateTitle: "Estimated ACT {name} score: {lo} to {hi}",
    estimateSingleTitle: "Estimated ACT {name} score: {est}",
    estimateSingleText: "That is {cmp} the national average of {avg}.",
    rankSingleText: " {a} {est} is about the <strong>{pr} percentile</strong>, meaning you would score as well as or better than about {prNum}% of students who take the test.",
    estimateText: "That range is {cmp} the national average of {avg}.",
    rankText: " {a} {est}, the middle of your range, is about the <strong>{pr} percentile</strong>, meaning you would score as well as or better than about {prNum}% of students who take the test.",
    disclaimerFull: "This is a rough estimate. It converts your raw score with a typical past ACT conversion{ranks}. Real test forms are scaled differently, so your score on test day could be a few points higher or lower.",
    disclaimer: "This is a rough estimate. It scales your percent correct to a {full}-question test using a typical past ACT conversion{ranks}. Real test forms are scaled differently, and {count} questions is a small sample.",
    ranksFull: " and uses ACT's {rankYear} national ranks",
    ranksMixed: ", and uses ACT's {rankYear} national ranks",
    above: "above", below: "below", about: "about at",
    meetsBenchmark: "It also meets ACT's college readiness benchmark of {benchmark}.",
    benchmarkIs: "ACT's college readiness benchmark is {benchmark}.",
    scaleYou: "You ≈ {est}",
    scaleAvg: "Avg {avg}",
    scaleBenchmark: "Benchmark {benchmark}",
    compareTitle: "How this compares",
    compareText: "One passage is too few questions to estimate an ACT score. The national average {name} score is {avg}, and ACT's college readiness benchmark is {benchmark}.",
    compareMore: "Try mixed practice or a full section for an estimated score and percentile.",
    bySkill: "By skill",
    workOn: "What to work on",
    keepSharp: "Keep it sharp",
    allRight: "You got every question right",
    habits: "Test-day habits",
    reviewTitle: "Review your answers",
    tagCorrect: "Correct", tagMissed: "Missed", tagBlank: "Blank",
    noAnswer: "No answer.",
    youChose: "You chose {letter}.",
    answerIs: "Answer:",
    home: "Back to start",
    again: "Try another set",
    fullEyebrow: "Full ACT · Section {n} of {total}",
    sectionDone: "The {name} section is done. Your answers are saved for the score report at the end.",
    sectionDoneTime: "Time ran out on the {name} section. Your answers are saved for the score report at the end.",
    breakTitle: "Break",
    breakText: "Take a 10-minute break before Reading. Stand up, stretch, and get a drink of water. Reading starts on its own when the break ends.",
    breakLeft: "Break time left",
    breakEnd: "End the break",
    fullReportTitle: "Full ACT score report",
    compositeLabel: "Composite",
    compositeText: "Your composite is the average of your English, Math, and Reading scores, rounded to a whole number. That is {cmp} the national average composite of {avg} for the {avgClass}. {a} {composite} is about the <strong>{pr} percentile</strong>, meaning you would score as well as or better than about {prNum}% of students who take the ACT.",
    stemLine: "STEM score (the average of Math and Science): {stem}, about the {pr} percentile",
    sectionScoresTitle: "Section scores",
    sectionScoreLine: "{right} of {count} correct. About the {pr} percentile. {bench}",
    benchMet: "Meets the benchmark of {benchmark}.",
    benchNotMet: "Benchmark {benchmark}.",
    seeReport: "See the {name} report",
    fullDisclaimer: "These are rough estimates. Each section score converts your raw score with a typical past ACT conversion, and percentiles use ACT's {rankYear} national ranks. Real test forms are scaled differently, so your scores on test day could be a few points higher or lower.",
    backToFull: "Back to full ACT report",
    fullAgain: "Take another full ACT",
    underlined: "Underlined part:",
    soloHeading: "{name} test",
    underlineStem: "Choose the best version of underlined part {n}. If the original is best, choose NO CHANGE.",
    boxStem: "Question {n}"
  },
  sections: {
    english: {
      name: "English",
      brand: "ACT English",
      ui: {
        title: "ACT English Practice",
        pace: "40 seconds",
        lede: "Read each passage and choose the best way to write each underlined part. The score report shows how you compare nationally and which skills to work on next. Nothing is saved or sent anywhere.",
        modeOneText: "One passage with its questions. Untimed, with a clock that counts up so you can see your pace.",
        modeMixedText: "{passages} passages timed at ACT pace ({minutes} minutes), with an estimated ACT English score.",
        facts: [
          ["50", "questions in 35 minutes, so plan on about 40 seconds per question."],
          ["3", "skill areas: Production of Writing, Knowledge of Language, and Conventions of Standard English."],
          ["{avg}", "national average English score for the {avgClass}."],
          ["{benchmark}", "ACT's college readiness benchmark for English."]
        ],
        factsNote: "Most English questions ask about one underlined part. A few ask about a whole paragraph or the whole passage.",
        directionsList: [
          "In each passage, some parts are underlined and numbered. Each number matches a question. Choose the answer that makes the passage correct, clear, and consistent with the rest of it. If the original is best, choose NO CHANGE.",
          "Some questions ask about a spot in the passage marked with a boxed number, or about the passage as a whole. Read the question carefully.",
          "Read the whole sentence, and often the sentences around it, before you choose. Many answers depend on what comes before and after.",
          "Use Previous and Next, or the question numbers at the bottom of the screen, to move between questions. The passage moves to the underlined part for each question.",
          "Flag a question to come back to it. Before you end the section, a review screen shows every question you left blank or flagged.",
          "Tools are in the bar under the timer: the highlighter, the line reader, the answer eliminator, answer masking, and zoom.",
          "There is no penalty for guessing. Answer every question before you end the section."
        ],
        allRightTips: [
          "Work on speed next. Try finishing each passage in under 7 minutes.",
          "Read each answer choice in the sentence, not just on its own.",
          "When two answers both look correct, the shorter one is often better."
        ],
        habitsTips: [
          "Read the passage as you go, not just the underlined parts. Context decides many answers.",
          "When an answer changes punctuation, name the rule: comma, semicolon, colon, or dash.",
          "Never leave a question blank. There is no penalty for guessing."
        ]
      },
      skills: {
        punct: {name: "Punctuation", tips: [
          "A semicolon joins two complete sentences, just like a period does.",
          "A colon comes after a complete sentence and introduces a list, an explanation, or an example.",
          "Use commas in pairs around extra information that the sentence could do without."]},
        grammar: {name: "Grammar and usage", tips: [
          "Find the real subject of the verb. Cross out phrases like \"of the students\" that come between them.",
          "Keep verb tenses consistent with the rest of the paragraph.",
          "Check that each pronoun matches the noun it stands for: singular with singular, plural with plural."]},
        structure: {name: "Sentence structure", tips: [
          "Every sentence needs a subject and a verb and must express a complete thought.",
          "Two complete sentences joined only by a comma is a comma splice. Use a period, a semicolon, or a comma with and, but, or so.",
          "A describing phrase at the start of a sentence must describe the noun right after the comma."]},
        style: {name: "Word choice and style", tips: [
          "If two choices say the same thing, the shorter one is usually right.",
          "Cut words that repeat an idea, like \"past history\" or \"each and every\".",
          "Pick the word with the exact meaning the sentence needs, and match the tone of the passage."]},
        development: {name: "Topic development", tips: [
          "For \"Should the writer add this sentence?\" questions, ask whether it fits the paragraph's main point.",
          "When a question names the writer's goal, pick the choice that meets that goal, not just a true statement.",
          "Read the paragraph's first sentence again to remind yourself what it is about."]},
        organization: {name: "Organization and transitions", tips: [
          "Name the relationship between two ideas first: contrast, cause and effect, example, or addition.",
          "Then pick the transition that matches it: however, therefore, for example, or also.",
          "For sentence order questions, look for words like this, these, and then that point back to an earlier sentence."]}
      },
      types: ["Narrative", "Informative", "Argument"]
    },
    math: {
      name: "Math",
      brand: "ACT Math",
      solo: true,
      ui: {
        title: "ACT Math Practice",
        pace: "a little over 1 minute",
        lede: "Solve original ACT-style math problems, from pre-algebra to trigonometry. The score report shows how you compare nationally and which skills to work on next. Nothing is saved or sent anywhere.",
        modeOne: "Practice questions",
        modeOneText: "{count} random questions, easier ones first. Untimed, with a clock that counts up so you can see your pace.",
        modeMixedText: "{count} questions timed at ACT pace ({minutes} minutes), with an estimated ACT Math score.",
        facts: [
          ["45", "questions in 50 minutes, so plan on a little over 1 minute per question."],
          ["4", "answer choices per question. An approved calculator is allowed."],
          ["{avg}", "national average Math score for the {avgClass}."],
          ["{benchmark}", "ACT's college readiness benchmark for Math."]
        ],
        factsNote: "Questions get harder as the section goes on. Do the easier ones carefully, and do not spend too long on any one question.",
        directionsList: [
          "Solve each problem, then choose the best answer.",
          "Questions start easier and get harder. Do not spend too long on one question. Flag it, move on, and come back if you have time.",
          "You may use an approved calculator, but many problems are faster without one.",
          "Unless a question says otherwise, figures are not necessarily drawn to scale, figures lie in a plane, the word line means a straight line, and the word average means the arithmetic mean.",
          "Use Previous and Next, or the question numbers at the bottom of the screen, to move between questions.",
          "Tools are in the bar under the timer: the highlighter, the answer eliminator, answer masking, and zoom.",
          "There is no penalty for guessing. Answer every question before you end the section."
        ],
        directionsIntroSolo: "This section has {count} {questionWord}.",
        compareText: "{count} questions are too few to estimate an ACT score. The national average Math score is {avg}, and ACT's college readiness benchmark is {benchmark}.",
        compareMore: "Try mixed practice or a full section for an estimated score and percentile.",
        openInTest: "Show question",
        zoomLabel: "Question zoom",
        zoomAnnounce: "Question zoom {pct}%",
        hlCleared: "Highlights cleared on this question.",
        allRightTips: [
          "Work on speed next. Try to finish the first 30 questions in 30 minutes.",
          "Check your work by plugging your answer back into the problem.",
          "Practice the topics that show up late in the section: trigonometry, logarithms, and complex numbers."
        ],
        habitsTips: [
          "Write down what the question asks for before you start solving.",
          "If you are stuck, try plugging in the answer choices or picking easy numbers.",
          "Never leave a question blank. There is no penalty for guessing."
        ]
      },
      skills: {
        number: {name: "Number and quantity", tips: [
          "Review exponent rules: multiply powers with the same base by adding exponents.",
          "Convert units step by step, and write the units in every step.",
          "Remember that i<sup>2</sup> = -1 when you work with complex numbers."]},
        algebra: {name: "Algebra", tips: [
          "Do the same step to both sides of an equation, and check your answer in the original.",
          "For word problems, name the unknown with a letter and write one equation for each fact.",
          "Slope is rise over run: the change in y divided by the change in x."]},
        functions: {name: "Functions", tips: [
          "f(3) means put 3 in for x everywhere in the rule.",
          "For f(g(x)), work from the inside out: find g(x) first.",
          "On a graph, the x-intercepts are where y = 0 and the y-intercept is where x = 0."]},
        geometry: {name: "Geometry", tips: [
          "Draw and label a figure if the question does not give one.",
          "Know the area formulas for triangles, rectangles, and circles, and the Pythagorean theorem.",
          "For right triangles, SOH CAH TOA gives sine, cosine, and tangent."]},
        stats: {name: "Statistics and probability", tips: [
          "The mean is the sum divided by the count. The median is the middle value after sorting.",
          "Probability is the number of ways to succeed divided by the total number of outcomes.",
          "Read table and graph labels carefully before you calculate."]},
        essential: {name: "Integrating essential skills", tips: [
          "Percent change is the change divided by the original amount.",
          "For rate problems, distance equals rate times time. Keep the units matched.",
          "Break long problems into small steps and write each result down."]}
      },
      types: ["Number and quantity", "Algebra", "Functions", "Geometry", "Statistics and probability", "Integrating essential skills"]
    },
    reading: {
      name: "Reading",
      brand: "ACT Reading",
      ui: {
        title: "ACT Reading Practice",
        pace: "a little over 1 minute",
        lede: "Read original passages in the four ACT Reading types and answer questions about main ideas, details, and the author's choices. The score report shows how you compare nationally and which skills to work on next. Nothing is saved or sent anywhere.",
        modeOneText: "One passage with its questions. Untimed, with a clock that counts up so you can see your pace.",
        modeMixedText: "{passages} passages timed at ACT pace ({minutes} minutes), with an estimated ACT Reading score.",
        facts: [
          ["36", "questions in 40 minutes, so plan on about 10 minutes per passage."],
          ["4", "passage types: Prose Fiction, Social Science, Humanities, and Natural Science."],
          ["{avg}", "national average Reading score for the {avgClass}."],
          ["{benchmark}", "ACT's college readiness benchmark for Reading."]
        ],
        factsNote: "Some passages come in pairs (Passage A and Passage B), with questions that compare them.",
        directionsList: [
          "Read each passage, then choose the best answer to each question. You can look back at the passage as often as you need to.",
          "Paragraphs are numbered so questions can point to them.",
          "Answer from what the passage says or suggests, not from what you already know about the topic.",
          "Use Previous and Next, or the question numbers at the bottom of the screen, to move between questions.",
          "Flag a question to come back to it. Before you end the section, a review screen shows every question you left blank or flagged.",
          "Tools are in the bar under the timer: the highlighter, the line reader, the answer eliminator, answer masking, and zoom.",
          "There is no penalty for guessing. Answer every question before you end the section."
        ],
        allRightTips: [
          "Work on speed next. Try finishing each passage and its questions in under 9 minutes.",
          "Practice the passage type you find hardest.",
          "Before you look at the choices, answer the question in your own words."
        ],
        habitsTips: [
          "Read for the main idea of each paragraph. Jot a few words beside each one.",
          "The right answer is supported by the passage. If you cannot point to the support, keep looking.",
          "Never leave a question blank. There is no penalty for guessing."
        ]
      },
      skills: {
        main: {name: "Main ideas", tips: [
          "After each paragraph, sum it up in a few words.",
          "The main idea covers the whole passage, not just one paragraph.",
          "Rule out choices that are too narrow or too broad."]},
        detail: {name: "Details", tips: [
          "Go back to the paragraph the question names and find the exact line.",
          "Wrong answers often use words from the passage in a way it does not say.",
          "Match the meaning, not just the words."]},
        infer: {name: "Inferences", tips: [
          "An inference must be supported by the passage, even if it is not stated.",
          "Choose the answer that needs the smallest leap from the text.",
          "Watch out for answers with extreme words like always, never, or only."]},
        vocab: {name: "Words in context", tips: [
          "Cover the word, read the sentence, and say what word would fit.",
          "Then pick the choice closest to your word. The common meaning is often a trap.",
          "Plug your choice back into the sentence to check it."]},
        purpose: {name: "Author's purpose and point of view", tips: [
          "Ask why the author included the part the question names.",
          "Notice the author's tone: is it admiring, critical, neutral, or worried?",
          "For narrator questions, ask what the narrator knows and feels at that point in the story."]},
        structure: {name: "Structure and comparing texts", tips: [
          "Notice how the passage is built: problem and solution, cause and effect, or a story told in order.",
          "For paired passages, note what each author thinks before the questions.",
          "Look for the idea both passages share, even if they disagree on details."]}
      },
      types: ["Prose Fiction", "Social Science", "Humanities", "Natural Science"]
    },
    science: {
      name: "Science",
      brand: "ACT Science",
      optional: true,
      ui: {
        title: "ACT Science Practice",
        pace: "1 minute",
        lede: "Read each passage, answer its questions, and get a score report that shows how you compare nationally and which skills to work on next. Nothing is saved or sent anywhere.",
        modeOneText: "A random passage with 5 to 7 questions. Untimed, with a clock that counts up so you can see your pace.",
        modeFullText: "{count} questions in 40 minutes, like the real test, with an estimated ACT Science score and percentile.",
        modeMixedText: "{passages} passages, one of each type, timed at 1 minute per question ({minutes} minutes), with an estimated ACT Science score.",
        facts: [
          ["40", "questions in 40 minutes, so plan on about 1 minute per question."],
          ["3", "passage types: Data Representation, Research Summaries, and Conflicting Viewpoints."],
          ["{avg}", "national average Science score for the {avgClass}."],
          ["{benchmark}", "ACT's college readiness benchmark for Science."]
        ],
        factsNote: "Science is optional on the national ACT, but Illinois students take it as part of the state ACT at school.",
        directionsList: [
          "Read each passage, then choose the best answer to each question. You can look back at the passage as often as you need to.",
          "Use Previous and Next, or the question numbers at the bottom of the screen, to move between questions.",
          "Flag a question to come back to it. Before you end the section, a review screen shows every question you left blank or flagged.",
          "Tools are in the bar under the timer. The highlighter marks passage and question text. The line reader covers everything in the passage except a few lines. The answer eliminator crosses out choices you have ruled out, and answer masking hides choices until you are ready. Zoom makes the passage and its figures bigger.",
          "Calculators are not allowed on the ACT Science test, so practice without one.",
          "There is no penalty for guessing. Answer every question before you end the section."
        ],
        compareText: "One passage is too few questions to estimate an ACT score. As a rough guide, students near the national average of {avg} get about half of the Science questions right, and students at the college readiness benchmark of {benchmark} get about two thirds right.",
        compareMore: "Try mixed practice for an estimated score and percentile.",
        allRightTips: [
          "Work on speed next. Try finishing each passage in under 5 minutes.",
          "Practice skimming: read the questions first, then go to the figure they name.",
          "Try the other passage types to make sure your skills hold up across all three."
        ],
        habitsTips: [
          "ACT Science tests reading data more than memorized facts. Most answers are in the figures.",
          "Skim the passage for what was changed and measured, then go to the questions.",
          "Never leave a question blank. There is no penalty for guessing."
        ]
      },
      skills: {
        data: {name: "Reading tables and graphs", tips: [
          "Read the axis labels, units, and table headings before you look at the question.",
          "Put your finger (or cursor) on the exact row, column, or point the question names.",
          "Check which figure or table the question points to. ACT questions usually name it."]},
        trends: {name: "Spotting trends", tips: [
          "Say the trend in words: increases, decreases, or increases then decreases.",
          "Look across the whole range of data, not just the first two values.",
          "When comparing factors, compare how much the result changes, not just the direction."]},
        inter: {name: "Interpolating and predicting", tips: [
          "For a value between two data points, the answer is usually between their results.",
          "For a value past the data, continue the pattern and notice whether the changes are getting bigger or smaller.",
          "Cross out choices that fall outside the possible range first."]},
        design: {name: "Experimental design", tips: [
          "The independent variable is what the scientists changed on purpose. The dependent variable is what they measured.",
          "Constants are the conditions that stay the same across every trial in one experiment.",
          "Look for a trial that repeats across experiments. It often works as a control."]},
        claims: {name: "Evaluating claims and evidence", tips: [
          "Find the data the claim depends on, then check every value, not just one.",
          "In \"Yes, because\" choices, the reason must also be true and match the data.",
          "New evidence supports a viewpoint when it matches what that viewpoint predicts."]},
        views: {name: "Comparing viewpoints", tips: [
          "Before the questions, write a one-line summary of each viewpoint in the margin.",
          "Mark what each viewpoint says causes the result and what it predicts will happen.",
          "For agreement questions, find the idea both share, even if they disagree on details."]}
      },
      types: ["Data Representation", "Research Summaries", "Conflicting Viewpoints"]
    }
  }
  };
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(data); }, {once: true});
}());
