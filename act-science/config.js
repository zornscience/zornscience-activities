// ACT Science Practice: scoring tables and national reference values.
// REFRESH EACH FALL: when ACT publishes new national data (usually October), update natAvg and avgClass from the
// ACT Profile Report (National), and rank and rankYear from ACT's "National Ranks for Test Scores" for the new
// reporting year. Then bump the version and note the change in README.md.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act-science"]');
  if (!root) return;
  var config = {
    // Approximate raw score (0 to 40, the index) to scale score, modeled on a typical past ACT Science form.
    conv: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36],
    // ACT Science national ranks: percent of students at or below each scale score. Scores below 9 round to 1.
    rank: {36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 96, 30: 94, 29: 93, 28: 92, 27: 90, 26: 88, 25: 85, 24: 81, 23: 75, 22: 69, 21: 64, 20: 58, 19: 52, 18: 46, 17: 39, 16: 32, 15: 26, 14: 19, 13: 14, 12: 10, 11: 6, 10: 3, 9: 2},
    rankYear: "2024-2025",
    natAvg: 19.6,
    avgClass: "class of 2025",
    benchmark: 23,
    // Mixed practice shows an estimated range only with at least this many questions.
    minForEstimate: 15,
    // The range is the raw score equivalent plus or minus this many raw points.
    rangeRaw: 4,
    // A full section: this many reviewed passages of each type, adding up to exactly fullQuestions questions.
    // The Full section mode stays hidden until the reviewed bank can make one.
    fullMix: {"Data Representation": 3, "Research Summaries": 3, "Conflicting Viewpoints": 1},
    fullQuestions: 40
  };
  root.addEventListener("zsa:request-config", function (event) { event.detail.receive(config); }, {once: true});
}());
