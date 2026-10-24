// ACT Practice, Science question bank. Only "reviewed" passages appear to students; ?drafts=1 shows drafts too.
// Text fields may use <sub>, <sup>, <em> and <strong> and nothing else. Write symbols as characters (°, ≈), not
// entities. Body blocks: text, heading, viewpoint, table, lineChart, scatter, barChart, diagram (see README.md).
// Explanations must not name a choice letter: letters depend on where a question lands in a set.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="act"]');
  if (!root) return;
  var bank = {section: "science", passages: [
    {
      id: "catalase",
      type: "Data Representation",
      title: "Catalase and Temperature",
      topic: "Biology",
      status: "reviewed",
      body: [
        {kind: "text", html: "Catalase is an enzyme found in many living cells. It speeds up the breakdown of hydrogen peroxide (H<sub>2</sub>O<sub>2</sub>) into water and oxygen gas (O<sub>2</sub>)."},
        {kind: "text", html: "Students added 5 mL of potato extract (a source of catalase) to 10 mL of 3% H<sub>2</sub>O<sub>2</sub> solution buffered to pH 5, 7, or 9. They ran trials at several temperatures and collected the O<sub>2</sub> produced in the first 60 seconds (Figure 1)."},
        {kind: "lineChart", caption: "Figure 1", xLabel: "Temperature (°C)", yLabel: "O<sub>2</sub> collected (mL)", x: [10, 20, 30, 40, 50, 60], yMax: 35, yStep: 5,
          series: [
            {name: "pH 7", values: [8, 15, 24, 30, 18, 5]},
            {name: "pH 9", values: [6, 12, 19, 23, 14, 4]},
            {name: "pH 5", values: [5, 10, 16, 20, 12, 3]}
          ]},
        {kind: "text", html: "The students then repeated the procedure at 40°C and pH 7 using different concentrations of H<sub>2</sub>O<sub>2</sub> (Table 1)."},
        {kind: "table", caption: "Table 1", headers: ["H<sub>2</sub>O<sub>2</sub> concentration (%)", "O<sub>2</sub> collected (mL)"],
          rows: [[1, 12], [2, 21], [3, 30], [4, 35], [5, 37]]}
      ],
      questions: [
        {skill: "data", difficulty: 1,
          stem: "According to Figure 1, at pH 7 the greatest volume of O<sub>2</sub> was collected at which temperature?",
          choices: ["20°C", "30°C", "40°C", "50°C"], answer: 2,
          explanation: "The pH 7 curve peaks at 30 mL, which is at 40°C."},
        {skill: "trends", difficulty: 1,
          stem: "According to Figure 1, as temperature increased from 10°C to 60°C at pH 5, the volume of O<sub>2</sub> collected:",
          choices: ["increased only.", "decreased only.", "increased, then decreased.", "decreased, then increased."], answer: 2,
          explanation: "At pH 5 the volume rises from 5 mL to 20 mL at 40°C, then falls to 3 mL at 60°C."},
        {skill: "inter", difficulty: 2,
          stem: "Based on Figure 1, if a trial had been run at pH 7 and 35°C, the volume of O<sub>2</sub> collected would most likely have been closest to:",
          choices: ["15 mL", "20 mL", "27 mL", "33 mL"], answer: 2,
          explanation: "35°C is halfway between 30°C (24 mL) and 40°C (30 mL), so about 27 mL."},
        {skill: "inter", difficulty: 2,
          stem: "Based on Table 1, if the students had used 6% H<sub>2</sub>O<sub>2</sub>, the volume of O<sub>2</sub> collected would most likely have been:",
          choices: ["less than 30 mL.", "between 30 mL and 35 mL.", "between 37 mL and 40 mL.", "greater than 50 mL."], answer: 2,
          explanation: "Each increase adds less than the one before (+9, +9, +5, +2), so the next value should be only slightly above 37 mL."},
        {skill: "design", difficulty: 2,
          stem: "Which variable was held constant in the trials shown in Table 1 but changed in the trials shown in Figure 1?",
          choices: ["H<sub>2</sub>O<sub>2</sub> concentration", "Temperature", "Collection time", "Volume of O<sub>2</sub> collected"], answer: 1,
          explanation: "Table 1 trials were all at 40°C, while Figure 1 trials ran from 10°C to 60°C. Collection time was 60 s in both."},
        {skill: "claims", difficulty: 3,
          stem: "A student claims that catalase produced the most O<sub>2</sub> at pH 7 at every temperature tested. Do the data in Figure 1 support this claim?",
          choices: [
            "Yes; at each temperature, the pH 7 trial produced more O<sub>2</sub> than the pH 5 and pH 9 trials.",
            "Yes; the pH 9 trials always produced the least O<sub>2</sub>.",
            "No; at 40°C, the pH 9 trial produced the most O<sub>2</sub>.",
            "No; at 10°C, the pH 5 trial produced the most O<sub>2</sub>."], answer: 0,
          explanation: "At all six temperatures the pH 7 point is highest. The other \"Yes\" choice has a false reason: pH 5, not pH 9, was always lowest."}
      ]
    },
    {
      id: "antacid",
      type: "Research Summaries",
      title: "Antacid Tablet Reactions",
      topic: "Chemistry",
      status: "reviewed",
      body: [
        {kind: "text", html: "Effervescent antacid tablets contain sodium bicarbonate and citric acid. When a tablet is placed in water, these compounds react and release carbon dioxide gas, which forms bubbles. Students measured the <em>reaction time</em>, the time from when a tablet entered the water until bubbling stopped. Every tablet had the same mass."},
        {kind: "heading", text: "Experiment 1"},
        {kind: "text", html: "A whole tablet was dropped into 200 mL of water. This was repeated at different water temperatures (Table 1)."},
        {kind: "table", caption: "Table 1", headers: ["Water temperature (°C)", "Reaction time (s)"],
          rows: [[5, 92], [20, 61], [35, 40], [50, 27], [65, 19]]},
        {kind: "heading", text: "Experiment 2"},
        {kind: "text", html: "Tablets were added to 200 mL of water at 20°C. Each tablet was whole, broken into 4 pieces, or ground into powder (Table 2)."},
        {kind: "table", caption: "Table 2", headers: ["Tablet form", "Reaction time (s)"],
          rows: [["Whole", 61], ["4 pieces", 44], ["Powder", 23]]},
        {kind: "heading", text: "Experiment 3"},
        {kind: "text", html: "Whole tablets were added to different volumes of water at 20°C (Table 3)."},
        {kind: "table", caption: "Table 3", headers: ["Volume of water (mL)", "Reaction time (s)"],
          rows: [[100, 63], [200, 61], [400, 60]]}
      ],
      questions: [
        {skill: "design", difficulty: 1,
          stem: "In Experiment 1, the independent variable was:",
          choices: ["water temperature.", "reaction time.", "volume of water.", "tablet form."], answer: 0,
          explanation: "Temperature is what the students changed on purpose in Experiment 1. Reaction time is what they measured."},
        {skill: "inter", difficulty: 1,
          stem: "Based on Experiment 1, a whole tablet in 200 mL of water at 42°C would most likely have a reaction time closest to:",
          choices: ["20 s", "33 s", "45 s", "58 s"], answer: 1,
          explanation: "42°C falls between 35°C (40 s) and 50°C (27 s), so the time should be between 27 s and 40 s."},
        {skill: "trends", difficulty: 2,
          stem: "Based on Experiments 1 through 3, which factor had the smallest effect on reaction time?",
          choices: ["Water temperature", "Tablet form", "Volume of water", "The factors had equal effects."], answer: 2,
          explanation: "Quadrupling the water volume changed the time by only 3 s, much less than the changes in Experiments 1 and 2."},
        {skill: "design", difficulty: 2,
          stem: "The whole-tablet trial in Experiment 2 used the same conditions as which trial in Experiment 1?",
          choices: ["5°C", "20°C", "35°C", "50°C"], answer: 1,
          explanation: "Both used a whole tablet in 200 mL of 20°C water, and both took 61 s."},
        {skill: "claims", difficulty: 2,
          stem: "A student hypothesized that increasing a tablet's exposed surface area shortens its reaction time. Which results best support this hypothesis?",
          choices: [
            "Experiment 2, because the powdered tablet had the shortest reaction time.",
            "Experiment 2, because the whole tablet had the shortest reaction time.",
            "Experiment 3, because more water produced a shorter reaction time.",
            "Experiment 1, because warmer water produced a shorter reaction time."], answer: 0,
          explanation: "Grinding a tablet into powder increases its surface area, and the powder reacted fastest (23 s). Experiment 1 tests temperature, not surface area."},
        {skill: "inter", difficulty: 3,
          stem: "If a powdered tablet were added to 200 mL of water at 50°C, its reaction time would most likely be:",
          choices: ["more than 61 s.", "between 27 s and 61 s.", "between 23 s and 27 s.", "less than 23 s."], answer: 3,
          explanation: "Powder at 20°C took 23 s, and warmer water speeds the reaction. Combining both factors should give less than 23 s."}
      ]
    },
    {
      id: "candle",
      type: "Conflicting Viewpoints",
      title: "The Candle in the Jar",
      topic: "Chemistry",
      status: "reviewed",
      body: [
        {kind: "text", html: "In a class demonstration, a candle was secured upright in a shallow dish of water and lit. A glass jar was lowered upside down over the candle so its rim sat under the water. After several seconds, the flame went out and water rose into the jar. Dry air is about 78% nitrogen (N<sub>2</sub>) and 21% oxygen (O<sub>2</sub>) by volume."},
        {kind: "diagram", caption: "Figure 1", label: "A candle stands in a dish of water under an upside-down glass jar. The water level inside the jar is higher than the water in the dish.",
          viewBox: [320, 190],
          shapes: [
            {shape: "path", d: "M30 150 L290 150 L276 176 L44 176 Z", fill: "surface", stroke: "muted", width: 2},
            {shape: "rect", x: 34, y: 152, w: 252, h: 20, fill: "water"},
            {shape: "rect", x: 112, y: 128, w: 96, h: 24, fill: "water"},
            {shape: "path", d: "M110 160 L110 34 Q110 22 122 22 L198 22 Q210 22 210 34 L210 160", stroke: "blue", width: 3},
            {shape: "rect", x: 152, y: 92, w: 16, h: 52, fill: "line", stroke: "muted", width: 1.5},
            {shape: "line", x1: 160, y1: 92, x2: 160, y2: 84, stroke: "ink", width: 2},
            {shape: "line", x1: 220, y1: 108, x2: 172, y2: 108, stroke: "muted", width: 1},
            {shape: "line", x1: 220, y1: 130, x2: 196, y2: 134, stroke: "muted", width: 1},
            {shape: "text", x: 222, y: 40, text: "glass jar"},
            {shape: "text", x: 222, y: 112, text: "candle"},
            {shape: "text", x: 222, y: 128, text: "water level"},
            {shape: "text", x: 222, y: 142, text: "inside jar"}
          ]},
        {kind: "text", html: "Three students explained the results."},
        {kind: "viewpoint", label: "Student 1", html: "The flame uses up the O<sub>2</sub> in the jar. Removing a gas lowers the pressure inside the jar, so water is pushed in to take the space the O<sub>2</sub> filled. The flame goes out when all of the O<sub>2</sub> is gone. Because O<sub>2</sub> is 21% of air, water should rise to fill about 21% of the jar."},
        {kind: "viewpoint", label: "Student 2", html: "Burning wax produces carbon dioxide (CO<sub>2</sub>) and water vapor, which replace much of the O<sub>2</sub> used, so burning alone changes the amount of gas very little. The flame heats the gas in the jar, and some escapes as bubbles while the jar is lowered. After the flame goes out, the remaining gas cools and contracts, the pressure drops, and water rises. Most of the rise should happen after the flame goes out."},
        {kind: "viewpoint", label: "Student 3", html: "Student 2 is correct that water rises because the gas cools. However, a candle flame needs O<sub>2</sub> to make up at least about 16% of the gas to keep burning. The flame goes out before the O<sub>2</sub> is used up, so O<sub>2</sub> is still in the jar afterward."}
      ],
      questions: [
        {skill: "views", difficulty: 1,
          stem: "Students 1 and 2 would most likely agree that water rises into the jar because:",
          choices: [
            "the pressure inside the jar becomes lower than the pressure outside.",
            "most of the rise happens after the flame goes out.",
            "burning wax produces no gases.",
            "all of the O<sub>2</sub> in the jar is used up."], answer: 0,
          explanation: "Student 1 says pressure drops when O<sub>2</sub> is removed. Student 2 says it drops when gas cools. Both rely on lower pressure inside the jar."},
        {skill: "views", difficulty: 1,
          stem: "Which student's explanation predicts that water will fill about 21% of the jar?",
          choices: ["Student 1 only", "Student 2 only", "Student 3 only", "None of the students"], answer: 0,
          explanation: "Only Student 1 links the rise to the 21% of air that is O<sub>2</sub>."},
        {skill: "claims", difficulty: 2,
          stem: "Suppose a sensor in the jar showed that the gas was 15% O<sub>2</sub> just after the flame went out. This result would most directly support:",
          choices: [
            "Student 1's claim that the flame goes out when all of the O<sub>2</sub> is used.",
            "Student 3's claim that O<sub>2</sub> remains in the jar after the flame goes out.",
            "Student 2's claim that heated gas escapes as bubbles.",
            "none of the students' claims."], answer: 1,
          explanation: "Finding 15% O<sub>2</sub> means O<sub>2</sub> was left over, as Student 3 predicts, and contradicts Student 1."},
        {skill: "claims", difficulty: 2,
          stem: "A video shows almost no water entering the jar while the flame burned, and most of the rise happening in the 10 s after it went out. This observation is consistent with the explanations of:",
          choices: ["Student 1 only.", "Student 2 only.", "Students 2 and 3 only.", "Students 1, 2, and 3."], answer: 2,
          explanation: "Students 2 and 3 both say water rises as the gas cools after the flame is out. Student 1 expects water to rise while O<sub>2</sub> is being used."},
        {skill: "views", difficulty: 3,
          stem: "Student 1's explanation assumes that:",
          choices: [
            "burning the candle produces little or no gas that stays in the jar.",
            "air contains no O<sub>2</sub>.",
            "gases expand when heated.",
            "the flame keeps burning after all of the O<sub>2</sub> is used."], answer: 0,
          explanation: "If burning made gases that stayed in the jar, removing O<sub>2</sub> would not lower the pressure much. Student 1 ignores those products."}
      ]
    },
    {
      id: "dissolved-oxygen",
      type: "Data Representation",
      title: "Dissolved Oxygen in Water",
      topic: "Earth and space science",
      status: "reviewed",
      body: [
        {kind: "text", html: "Fish and other aquatic organisms depend on oxygen gas (O<sub>2</sub>) dissolved in water. The <em>solubility</em> of O<sub>2</sub> is the greatest amount that can dissolve in water that is in contact with air. Figure 1 shows the solubility of O<sub>2</sub> in fresh water and in seawater at several temperatures."},
        {kind: "lineChart", caption: "Figure 1", xLabel: "Water temperature (°C)", yLabel: "O<sub>2</sub> solubility (mg/L)", x: [0, 5, 10, 15, 20, 25, 30], yMax: 16, yStep: 2,
          series: [
            {name: "Fresh water", values: [14.6, 12.8, 11.3, 10.1, 9.1, 8.3, 7.6]},
            {name: "Seawater", values: [11.2, 10.0, 9.0, 8.1, 7.4, 6.7, 6.2]}
          ]},
        {kind: "text", html: "On a calm day in August, students measured the water temperature and the amount of dissolved O<sub>2</sub> at several depths in a freshwater lake (Table 1)."},
        {kind: "table", caption: "Table 1", headers: ["Depth (m)", "Water temperature (°C)", "Dissolved O<sub>2</sub> (mg/L)"],
          rows: [["0", "24", "8.4"], ["2", "23", "8.2"], ["4", "18", "6.5"], ["6", "12", "3.1"], ["8", "9", "1.6"], ["10", "8", "1.0"]]}
      ],
      questions: [
        {skill: "data", difficulty: 1,
          stem: "According to Figure 1, the solubility of O<sub>2</sub> in fresh water at 20°C is closest to:",
          choices: ["7.4 mg/L", "8.3 mg/L", "9.1 mg/L", "10.1 mg/L"], answer: 2,
          explanation: "The fresh water curve is at 9.1 mg/L at 20°C. The value 7.4 mg/L is for seawater."},
        {skill: "trends", difficulty: 1,
          stem: "According to Figure 1, as water temperature increases from 0°C to 30°C, the solubility of O<sub>2</sub> in seawater:",
          choices: ["increases only.", "decreases only.", "increases, then decreases.", "stays about the same."], answer: 1,
          explanation: "The seawater curve falls at every step, from 11.2 mg/L at 0°C to 6.2 mg/L at 30°C."},
        {skill: "inter", difficulty: 2,
          stem: "Based on Figure 1, the solubility of O<sub>2</sub> in fresh water at 12°C is closest to:",
          choices: ["9.4 mg/L", "10.8 mg/L", "11.9 mg/L", "12.8 mg/L"], answer: 1,
          explanation: "12°C is between 10°C (11.3 mg/L) and 15°C (10.1 mg/L), a little closer to 10°C, so the value is about 10.8 mg/L."},
        {skill: "data", difficulty: 2,
          stem: "Based on Figure 1, at any given temperature, the solubility of O<sub>2</sub> in seawater is:",
          choices: ["greater than in fresh water.", "less than in fresh water.", "the same as in fresh water.", "greater than in fresh water below 15°C and less above 15°C."], answer: 1,
          explanation: "At every temperature in Figure 1, the seawater point is below the fresh water point."},
        {skill: "inter", difficulty: 2,
          stem: "Based on Table 1, the dissolved O<sub>2</sub> at a depth of 7 m was most likely:",
          choices: ["less than 1.6 mg/L.", "between 1.6 mg/L and 3.1 mg/L.", "between 3.1 mg/L and 6.5 mg/L.", "greater than 6.5 mg/L."], answer: 1,
          explanation: "7 m is between 6 m (3.1 mg/L) and 8 m (1.6 mg/L), and dissolved O<sub>2</sub> fell steadily with depth below 2 m."},
        {skill: "claims", difficulty: 3,
          stem: "A student claims that the water at 10 m had little dissolved O<sub>2</sub> because it was too warm to hold more. Do the data support this claim?",
          choices: [
            "Yes; the water at 10 m was the warmest water in the lake.",
            "Yes; dissolved O<sub>2</sub> decreased as depth increased.",
            "No; Figure 1 shows that fresh water at 8°C can hold about 12 mg/L of O<sub>2</sub>, far more than was measured.",
            "No; the water at 10 m was warmer than the water at the surface."], answer: 2,
          explanation: "The water at 10 m was the coldest in the lake (8°C), and Figure 1 shows that cold fresh water can hold about 12 mg/L. Something other than temperature, such as organisms using up the O<sub>2</sub>, must explain the low value."}
      ]
    },
    {
      id: "solar-panel",
      type: "Data Representation",
      title: "Solar Panel Output",
      topic: "Physics",
      status: "reviewed",
      body: [
        {kind: "text", html: "A solar panel converts sunlight into electrical power. Its <em>efficiency</em> is the percent of the sunlight energy reaching the panel that becomes electrical energy."},
        {kind: "text", html: "Students measured the power output of a small solar panel at noon on a clear day and on a cloudy day, with the panel tilted at different angles from horizontal. A fan kept the panel at 25°C during these trials (Figure 1)."},
        {kind: "barChart", caption: "Figure 1", xLabel: "Tilt angle (degrees)", yLabel: "Power output (W)", categories: ["0", "15", "30", "45", "60", "75", "90"], yMax: 90, yStep: 10,
          series: [
            {name: "Clear day", values: [62, 74, 82, 85, 81, 70, 55]},
            {name: "Cloudy day", values: [18, 20, 21, 21, 20, 18, 15]}
          ]},
        {kind: "text", html: "On another clear day, the students kept the panel at a 45° tilt and turned off the fan, so the panel warmed up in the sun. They recorded its efficiency at different panel temperatures (Figure 2)."},
        {kind: "scatter", caption: "Figure 2", xLabel: "Panel temperature (°C)", yLabel: "Efficiency (%)", xMin: 10, xMax: 60, xStep: 10, yMin: 15, yMax: 21, yStep: 1,
          series: [
            {name: "Efficiency (%)", points: [[15, 20.1], [20, 19.6], [25, 19.2], [30, 18.7], [35, 18.3], [40, 17.8], [45, 17.4], [50, 16.9], [55, 16.5], [60, 16.1]]}
          ]}
      ],
      questions: [
        {skill: "data", difficulty: 1,
          stem: "According to Figure 1, on the clear day the panel produced the most power at a tilt angle of:",
          choices: ["30°.", "45°.", "60°.", "90°."], answer: 1,
          explanation: "The tallest clear day bar, 85 W, is at 45°."},
        {skill: "data", difficulty: 1,
          stem: "According to Figure 2, when the panel temperature was 40°C, its efficiency was closest to:",
          choices: ["16.9%", "17.8%", "18.7%", "19.6%"], answer: 1,
          explanation: "The point at 40°C is at 17.8%."},
        {skill: "trends", difficulty: 1,
          stem: "According to Figure 2, as the panel temperature increased, the panel's efficiency:",
          choices: ["increased only.", "decreased only.", "increased, then decreased.", "did not change."], answer: 1,
          explanation: "Each point is lower than the one before it, from 20.1% at 15°C to 16.1% at 60°C."},
        {skill: "trends", difficulty: 2,
          stem: "Based on Figure 1, did changing the tilt angle have a larger effect on power output on the clear day or on the cloudy day?",
          choices: [
            "The clear day; output ranged from 55 W to 85 W.",
            "The clear day; output ranged from 15 W to 21 W.",
            "The cloudy day; output ranged from 15 W to 21 W.",
            "The cloudy day; output was always less than 25 W."], answer: 0,
          explanation: "On the clear day, output changed by 30 W across the angles. On the cloudy day, it changed by only 6 W."},
        {skill: "inter", difficulty: 2,
          stem: "If the trend in Figure 2 continues, the panel's efficiency at 70°C would most likely be:",
          choices: ["greater than 17.0%.", "between 16.1% and 17.0%.", "between 15.0% and 16.1%.", "less than 13.0%."], answer: 2,
          explanation: "Efficiency falls about 0.45% for every 5°C. Continuing from 16.1% at 60°C gives about 15.2% at 70°C."},
        {skill: "claims", difficulty: 3,
          stem: "A student predicts that on a clear day, the panel at a 45° tilt would produce less power at a panel temperature of 55°C than at 25°C. Do the results support this prediction?",
          choices: [
            "Yes; Figure 2 shows that the panel's efficiency is lower at 55°C than at 25°C.",
            "Yes; Figure 1 shows that power output is greatest at a 45° tilt.",
            "No; Figure 2 shows that efficiency increases as panel temperature increases.",
            "No; the panel produced 85 W at a 45° tilt on the clear day."], answer: 0,
          explanation: "With the same sunlight, a panel with lower efficiency produces less power. Efficiency is 16.5% at 55°C but 19.2% at 25°C."}
      ]
    },
    {
      id: "ramp-carts",
      type: "Research Summaries",
      title: "Carts on a Ramp",
      topic: "Physics",
      status: "reviewed",
      body: [
        {kind: "text", html: "Students released a cart from rest at the top of a 2.0 m long ramp and used a motion sensor to measure the cart's speed at the bottom. Unless stated otherwise, the cart had a mass of 0.50 kg and the ramp had a smooth plastic surface."},
        {kind: "heading", text: "Experiment 1"},
        {kind: "text", html: "The top of the ramp was raised to different heights above the bottom (Table 1)."},
        {kind: "table", caption: "Table 1", headers: ["Ramp height (m)", "Speed at bottom (m/s)"],
          rows: [["0.10", "1.30"], ["0.20", "1.87"], ["0.30", "2.30"], ["0.40", "2.67"], ["0.50", "2.99"]]},
        {kind: "heading", text: "Experiment 2"},
        {kind: "text", html: "The ramp height was 0.30 m. Weights were added to or removed from the cart to change its mass (Table 2)."},
        {kind: "table", caption: "Table 2", headers: ["Cart mass (kg)", "Speed at bottom (m/s)"],
          rows: [["0.25", "2.29"], ["0.50", "2.30"], ["1.00", "2.31"]]},
        {kind: "heading", text: "Experiment 3"},
        {kind: "text", html: "The ramp height was 0.30 m. The ramp was covered with different materials (Table 3)."},
        {kind: "table", caption: "Table 3", headers: ["Ramp surface", "Speed at bottom (m/s)"],
          rows: [["Smooth plastic", "2.30"], ["Felt", "2.05"], ["Sandpaper", "1.71"]]}
      ],
      questions: [
        {skill: "design", difficulty: 1,
          stem: "In Experiment 1, the independent variable was:",
          choices: ["ramp height.", "cart mass.", "ramp surface.", "speed at the bottom of the ramp."], answer: 0,
          explanation: "Ramp height is what the students changed on purpose in Experiment 1. Speed is what they measured."},
        {skill: "data", difficulty: 1,
          stem: "In Experiment 3, which ramp surface resulted in the lowest speed at the bottom of the ramp?",
          choices: ["Smooth plastic", "Felt", "Sandpaper", "All three surfaces gave the same speed."], answer: 2,
          explanation: "The sandpaper trial had the lowest speed, 1.71 m/s."},
        {skill: "inter", difficulty: 2,
          stem: "Based on Experiment 1, if the ramp height had been 0.35 m, the speed at the bottom would most likely have been closest to:",
          choices: ["2.10 m/s", "2.49 m/s", "2.80 m/s", "3.02 m/s"], answer: 1,
          explanation: "0.35 m is halfway between 0.30 m (2.30 m/s) and 0.40 m (2.67 m/s), so the speed should be about 2.5 m/s."},
        {skill: "trends", difficulty: 2,
          stem: "Based on Experiments 1 through 3, which factor had the smallest effect on the speed at the bottom of the ramp?",
          choices: ["Ramp height", "Cart mass", "Ramp surface", "All three factors had equal effects."], answer: 1,
          explanation: "Quadrupling the cart's mass changed the speed by only 0.02 m/s, much less than the changes in Experiments 1 and 3."},
        {skill: "design", difficulty: 2,
          stem: "Which experiment tested whether friction between the cart and the ramp affects the cart's speed?",
          choices: ["Experiment 1 only", "Experiment 2 only", "Experiment 3 only", "Experiments 1 and 2 only"], answer: 2,
          explanation: "Only Experiment 3 changed the ramp's surface, which changes the friction between the cart and the ramp."},
        {skill: "claims", difficulty: 3,
          stem: "A student claims that doubling the ramp height doubles the cart's speed at the bottom. Do the results of Experiment 1 support this claim?",
          choices: [
            "Yes; the speed increased every time the height increased.",
            "Yes; the speed at 0.20 m was double the speed at 0.10 m.",
            "No; the speed at 0.40 m was less than double the speed at 0.20 m.",
            "No; the speed decreased as the height increased."], answer: 2,
          explanation: "Doubling the height from 0.20 m to 0.40 m raised the speed from 1.87 m/s to 2.67 m/s, much less than double (3.74 m/s)."}
      ]
    },
    {
      id: "radish-salt",
      type: "Research Summaries",
      title: "Salt and Radish Seed Germination",
      topic: "Biology",
      status: "reviewed",
      body: [
        {kind: "text", html: "<em>Germination</em> is the start of growth from a seed. Students tested how sodium chloride (NaCl) dissolved in water affects the germination of radish seeds. In each trial, 50 seeds were placed on paper towels soaked with a solution in a covered dish. A seed counted as germinated when a root at least 2 mm long appeared."},
        {kind: "heading", text: "Experiment 1"},
        {kind: "text", html: "Dishes with NaCl solutions of different concentrations were kept at 25°C. Figure 1 shows the percent of seeds that germinated after 5 days. (mM stands for millimoles per liter.)"},
        {kind: "barChart", caption: "Figure 1", xLabel: "NaCl concentration (mM)", yLabel: "Seeds germinated (%)", categories: ["0", "25", "50", "100", "150"], yMax: 100, yStep: 20,
          series: [{name: "Seeds germinated (%)", values: [96, 92, 80, 48, 14]}]},
        {kind: "heading", text: "Experiment 2"},
        {kind: "text", html: "Dishes with distilled water (0 mM NaCl) and with 50 mM NaCl were kept at three temperatures for 5 days (Table 1)."},
        {kind: "table", caption: "Table 1", headers: ["Temperature (°C)", "Germinated in 0 mM NaCl (%)", "Germinated in 50 mM NaCl (%)"],
          rows: [["15", "70", "42"], ["20", "90", "66"], ["25", "96", "80"]]},
        {kind: "heading", text: "Experiment 3"},
        {kind: "text", html: "Fifty seeds were kept in 100 mM NaCl at 25°C for 5 days, and 24 germinated. The 26 seeds that had not germinated were rinsed and moved to a new dish with distilled water at 25°C. After 5 more days, 22 of those 26 seeds had germinated."}
      ],
      questions: [
        {skill: "data", difficulty: 1,
          stem: "According to Figure 1, what percent of the seeds germinated in 100 mM NaCl?",
          choices: ["14%", "48%", "80%", "92%"], answer: 1,
          explanation: "The bar for 100 mM reaches 48%."},
        {skill: "trends", difficulty: 1,
          stem: "According to Figure 1, as the NaCl concentration increased, the percent of seeds that germinated:",
          choices: ["increased only.", "decreased only.", "increased, then decreased.", "stayed the same."], answer: 1,
          explanation: "Each bar is shorter than the one before it, from 96% at 0 mM to 14% at 150 mM."},
        {skill: "inter", difficulty: 2,
          stem: "Based on Figure 1, if a dish with 75 mM NaCl had been tested, the percent of seeds that germinated would most likely have been:",
          choices: ["between 80% and 92%.", "between 48% and 80%.", "between 14% and 48%.", "less than 14%."], answer: 1,
          explanation: "75 mM is between 50 mM (80%) and 100 mM (48%), so the result should be between those values."},
        {skill: "design", difficulty: 2,
          stem: "Which trial in Experiment 2 used the same conditions as the 50 mM trial in Experiment 1?",
          choices: ["0 mM NaCl at 25°C", "50 mM NaCl at 15°C", "50 mM NaCl at 20°C", "50 mM NaCl at 25°C"], answer: 3,
          explanation: "Experiment 1 was done at 25°C, so its 50 mM trial matches the 50 mM, 25°C trial in Experiment 2. Both gave 80%."},
        {skill: "claims", difficulty: 3,
          stem: "A student hypothesized that soaking in 100 mM NaCl kills radish seeds. Which result most strongly weakens this hypothesis?",
          choices: [
            "In Experiment 3, 22 of the 26 seeds that had not germinated in NaCl germinated after being rinsed.",
            "In Experiment 1, only 48% of the seeds germinated in 100 mM NaCl.",
            "In Experiment 1, only 14% of the seeds germinated in 150 mM NaCl.",
            "In Experiment 2, more seeds germinated at 25°C than at 15°C."], answer: 0,
          explanation: "Most of the seeds that did not germinate in the salt solution germinated once they were moved to distilled water. The salt kept them from germinating but did not kill them."}
      ]
    }
  ]};
  root.addEventListener("zsa:request-bank", function (event) { event.detail.receive(bank); }, {once: true});
}());
