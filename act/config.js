// ACT Practice: test timing, scoring tables and national reference values for each section.
// REFRESH EACH FALL: when ACT publishes new national data (usually October), update natAvg and avgClass from the
// ACT Profile Report (National), and every rank table and rankYear from ACT's "ACT Score National Ranks" for the new
// reporting year. Then bump the version and note the change in README.md.
// Ranks: percent of ACT-tested students at or below each scale score (1 to 36), from ACT's "ACT Score National Ranks"
// for the 2026-2027 reporting year, based on high school graduates of 2024, 2025 and 2026.
// A section without a `rank` table would show no percentile.
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
    compositeRank: {36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 96, 30: 94, 29: 93, 28: 91, 27: 89, 26: 86, 25: 83, 24: 80, 23: 77, 22: 72, 21: 68, 20: 63, 19: 58, 18: 52, 17: 47, 16: 41, 15: 34, 14: 28, 13: 20, 12: 13, 11: 6, 10: 2, 9: 1, 8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1},
    // STEM is the average of Math and Science, reported when Science is taken.
    stemRank: {36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 96, 30: 95, 29: 94, 28: 92, 27: 90, 26: 88, 25: 85, 24: 81, 23: 77, 22: 73, 21: 69, 20: 64, 19: 58, 18: 52, 17: 45, 16: 36, 15: 27, 14: 17, 13: 10, 12: 5, 11: 2, 10: 1, 9: 1, 8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1},
    avgClass: "class of 2025",
    rankYear: "2026-2027",
    // Practice codes: scores saved under an anonymous six-character code by the ZornScience ACT Practice History
    // WordPress plugin (wordpress/zornscience-act-history/ in this repository). Leave `enabled` false until the plugin
    // is installed and turned on at zornscience.org; ?codes=1 in the address turns codes on for testing. classMax is the
    // most students in one class set: keep it the same as "Most students in one class set" on the plugin's admin page.
    history: {enabled: false, api: "https://zornscience.org/wp-json/zsa-act/v1", classMax: 50},
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
        conv: [1, 2, 4, 5, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 25, 25, 26, 27, 28, 29, 31, 32, 34, 36],
        rank: {36: 100, 35: 99, 34: 97, 33: 96, 32: 95, 31: 94, 30: 93, 29: 92, 28: 90, 27: 88, 26: 87, 25: 84, 24: 81, 23: 77, 22: 74, 21: 70, 20: 64, 19: 58, 18: 54, 17: 50, 16: 46, 15: 41, 14: 34, 13: 28, 12: 23, 11: 18, 10: 11, 9: 6, 8: 3, 7: 2, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1}
      },
      math: {
        count: 45, minutes: 50, natAvg: 18.9, benchmark: 22,
        // Math has no passages. Practice uses this many random questions; mixed practice this many, timed.
        practiceCount: 10, mixedCount: 15,
        // Approximate raw score (0 to 45) to scale score, modeled on typical past ACT Math forms.
        conv: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 25, 26, 26, 27, 28, 30, 31, 33, 34, 36],
        rank: {36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 96, 30: 95, 29: 94, 28: 93, 27: 91, 26: 88, 25: 84, 24: 81, 23: 77, 22: 74, 21: 71, 20: 68, 19: 64, 18: 60, 17: 53, 16: 45, 15: 33, 14: 21, 13: 11, 12: 6, 11: 3, 10: 2, 9: 1, 8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1}
      },
      reading: {
        count: 36, minutes: 40, natAvg: 20.0, benchmark: 22,
        // A full section: one reviewed passage of each type adding up to exactly 36 questions.
        mix: {"Prose Fiction": 1, "Social Science": 1, "Humanities": 1, "Natural Science": 1}, mixedPassages: 2,
        // Approximate raw score (0 to 36) to scale score, modeled on typical past ACT Reading forms.
        conv: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 14, 14, 15, 16, 16, 17, 17, 18, 19, 20, 20, 21, 21, 22, 22, 23, 24, 25, 26, 28, 29, 31, 33, 36],
        rank: {36: 100, 35: 98, 34: 97, 33: 95, 32: 93, 31: 91, 30: 89, 29: 87, 28: 85, 27: 83, 26: 81, 25: 78, 24: 75, 23: 71, 22: 66, 21: 61, 20: 56, 19: 51, 18: 47, 17: 42, 16: 37, 15: 33, 14: 28, 13: 22, 12: 16, 11: 10, 10: 5, 9: 2, 8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1}
      },
      science: {
        count: 40, minutes: 40, natAvg: 19.6, benchmark: 23,
        // A full section: this many reviewed passages of each type, adding up to exactly 40 questions.
        mix: {"Data Representation": 3, "Research Summaries": 3, "Conflicting Viewpoints": 1}, mixedPassages: 3,
        // Approximate raw score (0 to 40) to scale score, modeled on a typical past ACT Science form.
        conv: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 36],
        rank: {36: 100, 35: 99, 34: 99, 33: 98, 32: 97, 31: 96, 30: 95, 29: 93, 28: 92, 27: 91, 26: 89, 25: 86, 24: 82, 23: 77, 22: 70, 21: 65, 20: 60, 19: 54, 18: 48, 17: 41, 16: 34, 15: 27, 14: 19, 13: 14, 12: 10, 11: 6, 10: 3, 9: 2, 8: 1, 7: 1, 6: 1, 5: 1, 4: 1, 3: 1, 2: 1, 1: 1}
      }
    }
  };
  root.addEventListener("zsa:request-config", function (event) { event.detail.receive(config); }, {once: true});
}());
