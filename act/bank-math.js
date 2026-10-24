// ACT Practice, Math question bank. Only "reviewed" questions appear to students; ?drafts=1 shows drafts too.
// Each question stands alone, with four choices. Skills: number, algebra, functions, geometry, stats, essential.
// Text may use <sub>, <sup>, <em>, <strong>, <frac>top|bottom</frac> and <sqrt>...</sqrt>. Write minus signs as −
// (U+2212) and symbols as characters (°, π, ≤), not entities. A question may have one `figure` block (diagram,
// table, lineChart, scatter or barChart, as in the Science bank). List numeric choices from least to greatest.
// Explanations must not name a choice letter: letters depend on where a question lands in a set.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var bank = {section: "math", questions: [
    {id: "m-linear-1", status: "draft", skill: "algebra", difficulty: 1,
      stem: "If 3<em>x</em> + 7 = 22, what is the value of <em>x</em>?",
      choices: ["5", "7", "<frac>29|3</frac>", "15"], answer: 0,
      explanation: "Subtract 7 from both sides to get 3<em>x</em> = 15, then divide by 3: <em>x</em> = 5."},
    {id: "m-powers-1", status: "draft", skill: "number", difficulty: 1,
      stem: "What is the value of 2<sup>3</sup> + 4<sup>2</sup>?",
      choices: ["14", "24", "40", "128"], answer: 1,
      explanation: "2<sup>3</sup> = 8 and 4<sup>2</sup> = 16, so the sum is 24. Multiplying the base by the exponent (6 + 8 = 14) is a common mistake."},
    {id: "m-median-1", status: "draft", skill: "stats", difficulty: 1,
      stem: "The test scores of 5 students are 72, 85, 90, 85, and 78. What is the median score?",
      choices: ["78", "82", "85", "90"], answer: 2,
      explanation: "In order, the scores are 72, 78, 85, 85, 90. The median is the middle value, 85. The mean is 82."},
    {id: "m-pythag-1", status: "draft", skill: "geometry", difficulty: 2,
      stem: "In the right triangle shown below, the legs are 6 units and 8 units long. What is the length, in units, of the hypotenuse, <em>x</em>?",
      figure: {kind: "diagram", viewBox: [260, 190], label: "A right triangle with legs labeled 6 and 8 and the hypotenuse labeled x.", caption: "Not drawn to scale",
        shapes: [
          {shape: "path", d: "M40 160 L220 160 L40 40 Z", fill: "surface", stroke: "ink", width: 2},
          {shape: "path", d: "M40 146 L54 146 L54 160", stroke: "ink", width: 1.5},
          {shape: "text", x: 130, y: 182, text: "8", size: 16, anchor: "middle"},
          {shape: "text", x: 24, y: 106, text: "6", size: 16, anchor: "middle"},
          {shape: "text", x: 140, y: 92, text: "x", size: 16, anchor: "middle"}
        ]},
      choices: ["2<sqrt>7</sqrt>", "10", "12", "14"], answer: 1,
      explanation: "By the Pythagorean theorem, <em>x</em><sup>2</sup> = 6<sup>2</sup> + 8<sup>2</sup> = 36 + 64 = 100, so <em>x</em> = 10."},
    {id: "m-function-1", status: "draft", skill: "functions", difficulty: 2,
      stem: "If <em>f</em>(<em>x</em>) = 2<em>x</em><sup>2</sup> − 3<em>x</em> + 1, what is <em>f</em>(−2)?",
      choices: ["3", "7", "15", "23"], answer: 2,
      explanation: "Put −2 in for <em>x</em>: 2(−2)<sup>2</sup> − 3(−2) + 1 = 2(4) + 6 + 1 = 15. Squaring −2 gives positive 4, and −3 times −2 is positive 6."},
    {id: "m-percent-1", status: "draft", skill: "essential", difficulty: 2,
      stem: "A jacket costs $80. It is on sale for 25% off. What is the sale price?",
      choices: ["$20", "$40", "$55", "$60"], answer: 3,
      explanation: "25% of $80 is 0.25 × 80 = $20, the amount taken off. The sale price is $80 − $20 = $60."},
    {id: "m-fractions-1", status: "draft", skill: "algebra", difficulty: 3,
      stem: "Which of the following expressions is equivalent to <frac>x|2</frac> + <frac>x|3</frac>?",
      choices: ["<frac>x|5</frac>", "<frac>2x|5</frac>", "<frac>x<sup>2</sup>|6</frac>", "<frac>5x|6</frac>"], answer: 3,
      explanation: "Use the common denominator 6: <frac>x|2</frac> = <frac>3x|6</frac> and <frac>x|3</frac> = <frac>2x|6</frac>, so the sum is <frac>5x|6</frac>. Adding the tops and the bottoms separately is not how fractions add."},
    {id: "m-trig-1", status: "draft", skill: "geometry", difficulty: 3,
      stem: "In right triangle <em>ABC</em>, angle <em>C</em> is the right angle, <em>AC</em> = 5, and <em>BC</em> = 12. What is sin <em>A</em>?",
      choices: ["<frac>5|13</frac>", "<frac>5|12</frac>", "<frac>12|13</frac>", "<frac>13|12</frac>"], answer: 2,
      explanation: "The hypotenuse is <em>AB</em> = <sqrt>5<sup>2</sup> + 12<sup>2</sup></sqrt> = 13. Sine is the opposite side over the hypotenuse, and the side opposite angle <em>A</em> is <em>BC</em> = 12, so sin <em>A</em> = <frac>12|13</frac>."}
  ]};
  root.addEventListener("zsa:request-bank", function (event) { event.detail.receive(bank); }, {once: true});
}());
