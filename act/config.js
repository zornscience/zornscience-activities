// ACT Practice: test timing, scoring tables and national reference values for each section.
// REFRESH EACH FALL: when ACT publishes new national data (usually October), update natAvg and avgClass from the
// ACT Profile Report (National), and rank and rankYear from ACT's "National Ranks for Test Scores" for the new
// reporting year. Then bump the version and note the change in README.md.
// Sections without a `rank` table show no percentile. Add one (scale score to percent at or below) to turn it on.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var config = {
    // The order of a full ACT. The break comes after `breakAfter`; Science is last and optional.
    order: ["english", "math", "reading", "science"],
    breakAfter: "math",
    breakMinutes: 10,
    // The composite averages these sections.
    composite: ["english", "math", "reading"],
    compositeAvg: 19.4,
    avgClass: "class of 2025",
    rankYear: "2024-2025",
    // Mixed practice shows an estimated range only with at least this many questions. The range is the raw score
    // equivalent plus or minus this share of the section's questions (4 of 40 in Science).
    minForEstimate: 15,
    rangeShare: 0.1,
    sections: {
      english: {
        count: 50, minutes: 35, natAvg: 18.4, benchmark: 18,
        // A full section: 5 reviewed passages of any type adding up to exactly 50 questions.
        mix: {"*": 5}, mixedPassages: 2,
        // Approximate raw score (0 to 50, the index) to scale score, modeled on typical past ACT English forms.
        conv: [1, 2, 4, 5, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 25, 25, 26, 27, 28, 29, 31, 32, 34, 36]
      },
      math: {
        count: 45, minutes: 50, natAvg: 18.9, benchmark: 22,
        // Math has no passages. Practice uses this many random questions; mixed practice this many, timed.
        practiceCount: 10, mixedCount: 15,
        // Approximate raw score (0 to 45) to scale score, modeled on typical past ACT Math forms.
        conv: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 25, 26, 26, 27, 28, 30, 31, 33, 34, 36]
      },
      reading: {
        count: 36, minutes: 40, natAvg: 20.0, benchmark: 22,
        // A full section: one reviewed passage of each type adding up to exactly 36 questions.
        mix: {"Prose Fiction": 1, "Social Science": 1, "Humanities": 1, "Natural Science": 1}, mixedPassages: 2,
        // Approximate raw score (0 to 36) to scale score, modeled on typical past ACT Reading forms.
        conv: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 14, 14, 15, 16, 16, 17, 17, 18, 19, 20, 20, 21, 21, 22, 22, 23, 24, 25, 26, 28, 29, 31, 33, 36]
      },
      science: {
        count: 40, minutes: 40, natAvg: 19.6, benchmark: 23,
        // A full section: this many reviewed passages of each type, adding up to exactly 40 questions.
        mix: {"Data Representation": 3, "Research Summaries": 3, "Conflicting Viewpoints": 1}, mixedPassages: 3,
        // Approximate raw score (0 to 40) to scale score, modeled on a typical past ACT Science form.
        conv: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36],
        // ACT Science national ranks: percent of students at or below each scale score. Scores below 9 round to 1.
        rank: {36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 96, 30: 94, 29: 93, 28: 92, 27: 90, 26: 88, 25: 85, 24: 81, 23: 75, 22: 69, 21: 64, 20: 58, 19: 52, 18: 46, 17: 39, 16: 32, 15: 26, 14: 19, 13: 14, 12: 10, 11: 6, 10: 3, 9: 2}
      }
    }
  };
  root.addEventListener("zsa:request-config", function (event) { event.detail.receive(config); }, {once: true});
}());
