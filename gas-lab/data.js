// Gas Laws and KMT Lab: every word the scripts show. The page's fixed labels are in index.html; the gas constants
// are in physics.js (the model). Investigations are added in their own section below.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="gas-lab"]');
  if (!root) return;
  var data = {
    lab: {
      defaultBack: "https://zornscience.org/science/ap-chemistry/unit-3-properties-of-substances-and-mixtures/",
      backToLesson: "← Back to the lesson",
      gases: {
        He: {name: "helium", label: "Helium (He)"},
        Ne: {name: "neon", label: "Neon (Ne)"},
        Ar: {name: "argon", label: "Argon (Ar)"},
        Kr: {name: "krypton", label: "Krypton (Kr)"},
        Xe: {name: "xenon", label: "Xenon (Xe)"},
        N2: {name: "nitrogen", label: "Nitrogen (N₂)", spoken: "N 2"},
        O2: {name: "oxygen", label: "Oxygen (O₂)", spoken: "O 2"},
        CO2: {name: "carbon dioxide", label: "Carbon dioxide (CO₂)", spoken: "C O 2"}
      },
      formula: {He: "He", Ne: "Ne", Ar: "Ar", Kr: "Kr", Xe: "Xe", N2: "N₂", O2: "O₂", CO2: "CO₂"},
      none: "None",
      gasLabel: "Gas",
      slotLabel: "Gas {i}",
      molesLabel: "Moles",
      slotMoles: "Moles of gas {i}",
      shapes: ["circles", "squares", "triangles"],
      // Readouts
      measuring: "Measuring…",
      pausedGauge: "Press Play or Step to measure",
      gaugeLabel: "Pressure gauge",
      gaugeLabelReal: "Pressure (van der Waals)",
      gaugeNote: "Averaged over {s} s of wall hits",
      lawValue: "Gas law: {p}",
      lawValueReal: "Ideal gas law: {p}",
      celsius: "= {c} °C",
      held: "held",
      keMeasured: "{v} kJ/mol from the dots",
      keTheory: "(3/2)RT = {v} kJ/mol",
      speedLine: "{gas}: {v} m/s",
      dotsLine: "{count} dots. Each dot stands for 1/200 mol, about 3.0 × 10²¹ molecules.",
      zLabel: "PV/nRT = {z}",
      zIdeal: "PV/nRT = 1 for an ideal gas",
      volumeEffect: "Particle volume raises it by {v}",
      attractionEffect: "Attractions lower it by {v}",
      zAbove: "Above 1: the particles' own volume matters more than attractions here.",
      zBelow: "Below 1: attractions matter more than the particles' own volume here.",
      zNear: "Close to 1: this gas behaves almost ideally here.",
      condensed: "Below {tc} K, {gas} can condense. In the van der Waals model {pct} of it is liquid at this volume, so the pressure stays at the model's vapor pressure. (The model does not include freezing.)",
      modelNote: "Real gas numbers come from the van der Waals equation. The animation only illustrates: the dots are drawn with the share of the volume the molecules take up, and lines join dots close enough to attract.",
      // Notes under the controls
      heldNote: {
        T: "Temperature is held constant. Change the volume or the moles and the pressure responds.",
        V: "Volume is held constant. Change the temperature or the moles and the pressure responds.",
        P: "Pressure is held constant at {p}. Change the temperature or the moles and the piston moves."
      },
      pistonTop: "The piston reached the top of the container, so the change stopped there.",
      pistonBottom: "The piston reached the bottom of its range, so the change stopped there.",
      realNoHoldP: "Real gas mode holds temperature or volume.",
      realNoMix: "Real gas mode uses one gas at a time.",
      // Play controls
      play: "Play", pause: "Pause", step: "Step",
      reducedMotion: "Paused because your device asks for reduced motion. Press Play or Step to run it.",
      speedNote: "Dots move about 8,000 times slower than real molecules (about 12,000 times in real gas mode), all slowed by the same factor. Speeds are shown in real m/s.",
      // Live announcements (only after a change by the student)
      announce: {
        V: "Volume {V} L.",
        T: "Temperature {T} K ({C} °C).",
        n: "{n} mol.",
        gas: "{gas}.",
        P: "Pressure {P} by the gas law.",
        Preal: "Pressure {P} by the van der Waals equation, PV/nRT {Z}.",
        Pheld: "Pressure held at {P}; the piston moved to {V} L.",
        limited: "The piston reached the end of the container."
      },
      canvasLabel: "Container with a piston at {V} L holding {what} at {T} K.",
      canvasDots: "{count} {gas} dots",
      canvasLiquid: " Some has condensed into liquid on the floor.",
      // Units
      atm: "atm", kpa: "kPa", L: "L", K: "K", mol: "mol", ms: "m/s",
      // Graphs
      graphs: {
        pv: {title: "Pressure vs volume", x: "Volume (L)", y: "Pressure (atm)"},
        p1v: {title: "Pressure vs 1/volume", x: "1/Volume (1/L)", y: "Pressure (atm)"},
        vt: {title: "Volume vs temperature", x: "Temperature (K)", xc: "Temperature (°C)", y: "Volume (L)"},
        pt: {title: "Pressure vs temperature", x: "Temperature (K)", xc: "Temperature (°C)", y: "Pressure (atm)"},
        vn: {title: "Volume vs moles", x: "Moles (mol)", y: "Volume (L)"},
        z: {title: "PV/nRT vs pressure", x: "Pressure (atm)", y: "PV/nRT"}
      },
      sweepHolds: {
        pv: "Sweep: volume from {lo} L to {hi} L at {T} K.",
        p1v: "Sweep: volume from {lo} L to {hi} L at {T} K.",
        vt: "Sweep: 100 K to 1000 K with pressure held at {P}.",
        pt: "Sweep: 100 K to 1000 K with volume held at {V} L.",
        vn: "Sweep: 0.20 mol to 2.00 mol with pressure held at {P}.",
        z: "Sweep: volume from {lo} L to {hi} L at {T} K."
      },
      sweepRealOnly: "This sweep holds pressure, so it runs in ideal mode only.",
      noPoints: "No points yet. Press Record point or Run sweep.",
      onePoint: "Record at least 2 points for a best-fit line.",
      recorded: "Point {i} recorded: {values}.",
      swept: "Sweep done: {count} points.",
      cleared: "Data cleared.",
      copied: "Copied {count} rows. Paste into Google Sheets.",
      copySelected: "The data is selected. Press Ctrl+C, or Command+C on a Mac, to copy it.",
      fitLine: "Best-fit line: {eq}, R² = {r2}",
      fitInverse: "Best fit: P = {k}/V, R² = {r2}",
      zIdealLine: "Ideal gas: PV/nRT = 1",
      zRange: "PV/nRT runs from {lo} to {hi} over these points.",
      zeroK: "The dashed line reaches zero at {t}. The open circle marks absolute zero, 0 K (−273.15 °C).",
      measuredNote: "Each point is measured by running the same simulation, without drawing it, until the walls have taken about 4,000 hits.",
      realNote: "In real gas mode each point is the van der Waals pressure.",
      chartLabel: "{title}: {count} points. {fit}",
      chartEmpty: "{title}: no points yet.",
      showTable: "Show data table", hideTable: "Hide data table",
      tableCaption: "Recorded data, one row per point",
      columns: ["Point", "Gas", "V (L)", "1/V (1/L)", "T (K)", "T (°C)", "n (mol)", "P (atm)", "P (kPa)", "PV/nRT"],
      // Speed distribution
      mb: {
        x: "Speed (m/s)", y: "Number of dots",
        bars: "Bars: speeds of the {count} {gas} dots in the container",
        curve: "{gas} at {T} K",
        overlayNone: "None", overlayT: "The same gas at another temperature", overlayGas: "Another gas at this temperature",
        label: "Speed distribution of {gas} at {T} K: {count} dots, most probable speed {vmp} m/s.{overlay}",
        overlayLabel: " Dashed curve: {gas} at {T} K, most probable speed {vmp} m/s.",
        statsCaption: "Speeds from the Maxwell-Boltzmann distribution",
        statsCols: ["Curve", "Most probable (m/s)", "Average (m/s)", "Root mean square (m/s)"],
        solid: "solid", dashed: "dashed",
        note: "The curve is the 3D Maxwell-Boltzmann distribution scaled to the number of dots. With few dots the bars are rough; add moles for a smoother histogram.",
        presets: {t: "300 K vs 600 K", heAr: "He vs Ar", neKr: "Ne vs Kr"}
      }
    },
    // Investigations (the engine, shared/zsa-engine.js). Each has three steps: predict, test it in the lab, explain
    // in terms of particles. A choice is [value, label, feedback key]; the key is null for the right answer. Test
    // steps list named numbers that investigations.js works out from physics.js, the same numbers the lab shows.
    inv: {
      labels: {next: "Next investigation", complete: "Investigation complete", singleDone: "Chosen investigation complete",
        firstTry: "First-try correct on original investigations", itemLabel: "Investigation", singleLabel: "Chosen investigation",
        reviewLabel: "Review", none: "You answered every original step on the first try.", currentMark: " (current)"},
      stats: [["predict", "Predict"], ["test", "Test in the lab"], ["explain", "Explain with particles"]],
      setupButton: "Set up the lab",
      runButton: "Make the change for me",
      setupDone: "The lab is set up: {what}. Now {run}, or press Make the change for me.",
      setupDoneStatic: "The lab is set up: {what}. Read the answer in the lab.",
      runDone: "Done: {what}. Read the answer in the lab.",
      setupNote: "Then {run} in the lab and read the result.",
      setupNotePredict: "Set up the lab to see the starting point, then make your prediction.",
      setupDonePredict: "The lab is set up: {what}.",
      setupNoteStatic: "Then read the result in the lab.",
      curveA: "Curve A (solid)", curveB: "Curve B (dashed)",
      curveLabelA: "A", curveLabelB: "B",
      chartTitle: "Two Maxwell-Boltzmann speed curves, A (solid) and B (dashed)",
      chartSpoken: "Curve A, solid, peaks at {va} m/s with a height of {ha}. Curve B, dashed, peaks at {vb} m/s with a height of {hb}.",
      caption: "{group}",
      groups: {law: "Gas laws", kmt: "Kinetic molecular theory", mb: "Speed distributions", mix: "Mixtures and real gases"},
      // Feedback for the misconceptions every investigation can meet.
      feedback: {
        celsius: "Use kelvins. Ratios in the gas laws and kinetic energy only work with absolute temperature: {t1} °C is {k1} K and {t2} °C is {k2} K.",
        heavierKE: "At the same temperature every gas has the same average kinetic energy, (3/2)RT. Heavier particles move slower; they do not have more energy.",
        pushing: "In an ideal gas the particles do not push on each other. Pressure comes from particles hitting the walls.",
        notRun: "That is the reading before the change. Make the change in the lab ({run}) and read it again.",
        sizeConst: "The particles do not change size. What changes is how fast they move or how often they hit the walls.",
        speedConst: "The temperature is held, so the average speed stays the same. Check the Average speed readout.",
        idealOne: "1 is the ideal gas value. Real gas mode shows how far the van der Waals model departs from it."
      },
      tasks: [
        {id: "boyle", group: "law", title: "Squeeze the gas", setup: {mode: "ideal", gases: [{gas: "N2", n: 0.50}], T: 300, V: 6.0, hold: "T"},
          run: {V: 3.0}, runText: "set the volume to 3.0 L", what: "0.50 mol of nitrogen at 300 K in 6.0 L, temperature held",
          steps: [
            {question: "You will push the piston from 6.0 L down to 3.0 L at constant temperature. What will the pressure do?",
              choices: [["double", "It will double.", null], ["half", "It will be cut in half.", "inverse"], ["same", "It will stay the same.", "boyleSame"], ["four", "It will become 4 times as large.", "notSquare"]],
              hints: ["Think about what happens to how often the particles hit the walls when they have less room.", "Half the volume, same particles, same speeds: each part of the wall is hit twice as often."],
              trail: "P doubles", explain: "Halving the volume doubles the pressure: P and V are inversely proportional (Boyle's law)."},
            {question: "Set up the lab and make the change. What pressure does the gas law show at 3.0 L?", quantity: "p",
              choices: [["right", null], ["start", "notRun"], ["half", "inverse"], ["four", "notSquare"]],
              hints: ["Press Set up the lab, then set the volume to 3.0 L (or press Make the change for me).", "Read Gas law under the pressure gauge. It is P = nRT/V = (0.50)(0.08206)(300)/3.0."],
              trail: "{right}", explain: "At 3.0 L the pressure is {right}, twice the {start} at 6.0 L. The gauge's measured value settles near it."},
            {question: "Why does the pressure double?",
              choices: [["hits", "The same particles at the same speeds hit each part of the wall twice as often.", null], ["push", "Crowded particles push on each other harder.", "pushing"], ["faster", "The particles move faster when they are squeezed.", "speedConst"], ["shrink", "The particles shrink, so they bounce around more.", "sizeConst"]],
              hints: ["Pressure is the force of particles hitting the walls. What changed: how hard each hit is, or how often hits happen?", "The temperature did not change, so each hit is just as hard. The walls are closer together."],
              trail: "More hits per second", explain: "With half the room, each particle reaches a wall twice as often, so the walls get twice the force."}
          ],
          feedback: {inverse: "Less volume means the same particles have less room, so they hit the walls more often. The pressure goes up, not down.",
            boyleSame: "The speeds stay the same, but the particles have less room and hit the walls more often.",
            notSquare: "P and V are inversely proportional: half the volume gives twice the pressure, so P × V stays the same."},
          summary: "At constant temperature, P × V stays the same: halving the volume doubles the pressure because the walls are hit twice as often."},
        {id: "charles", group: "law", title: "Heat the gas, piston free", setup: {mode: "ideal", gases: [{gas: "O2", n: 0.20}], T: 300, V: 4.9236, hold: "P", P: 1.00},
          run: {T: 600}, runText: "set the temperature to 600 K", what: "0.20 mol of oxygen at 300 K (27 °C), pressure held at 1.00 atm",
          celsius: [27, 327],
          steps: [
            {question: "Holding the pressure, you heat the gas from 27 °C to 327 °C. What will the volume do?",
              choices: [["double", "It will double.", null], ["twelve", "It will grow about 12 times.", "celsius"], ["same", "It will stay the same.", "charlesSame"], ["half", "It will be cut in half.", "direction"]],
              hints: ["Change both temperatures to kelvins first.", "27 °C is 300 K and 327 °C is 600 K. At constant pressure V is proportional to the kelvin temperature."],
              trail: "V doubles", explain: "300 K to 600 K doubles the kelvin temperature, so the volume doubles (Charles's law)."},
            {question: "Set up the lab and heat it to 600 K. What volume does the piston move to?", quantity: "v",
              choices: [["right", null], ["start", "notRun"], ["celsius", "celsius"], ["half", "direction"]],
              hints: ["Press Set up the lab, then set the temperature to 600 K (or press Make the change for me).", "Read the volume box. V = nRT/P = (0.20)(0.08206)(600)/1.00."],
              trail: "{right}", explain: "At 600 K the piston settles at {right}, twice the {start} at 300 K."},
            {question: "Why does the piston move out?",
              choices: [["harder", "Faster particles hit the piston harder and more often, so it moves out until the pressure is back to 1.00 atm.", null], ["expand", "Heated particles expand and take up more room.", "sizeConst"], ["repel", "Hot particles repel each other more strongly.", "pushing"], ["heat", "Heat is a substance that fills up the container.", "heatStuff"]],
              hints: ["What does heating do to the particles' speed?", "Faster particles hit the piston harder and more often; the piston moves until the hits per area match the held pressure."],
              trail: "Harder, more frequent hits", explain: "Faster particles hit harder and more often, pushing the piston out; in the larger volume the hits per area drop back to the held pressure."}
          ],
          feedback: {charlesSame: "The pressure is held, not the volume: the piston is free to move, and heating pushes it out.",
            direction: "Heating makes the particles faster, which pushes the piston out. The volume goes up.",
            heatStuff: "Heat is energy, not a substance. Heating makes the particles move faster."},
          summary: "At constant pressure, V is proportional to the kelvin temperature: 300 K to 600 K doubles the volume."},
        {id: "gaylussac", group: "law", title: "Heat the gas, walls fixed", setup: {mode: "ideal", gases: [{gas: "Ar", n: 1.00}], T: 300, V: 8.0, hold: "V"},
          run: {T: 450}, runText: "set the temperature to 450 K", what: "1.00 mol of argon at 300 K (27 °C) in 8.0 L, volume held",
          celsius: [27, 177],
          steps: [
            {question: "At constant volume you heat the gas from 27 °C to 177 °C. What will the pressure do?",
              choices: [["x15", "It will increase to 1.5 times as much.", null], ["x66", "It will increase to about 6.6 times as much.", "celsius"], ["same", "It will stay the same, because the volume is fixed.", "glSame"], ["down", "It will decrease.", "direction"]],
              hints: ["Change both temperatures to kelvins first.", "27 °C is 300 K and 177 °C is 450 K. At constant volume P is proportional to the kelvin temperature."],
              trail: "P × 1.5", explain: "300 K to 450 K is 1.5 times the kelvin temperature, so the pressure is 1.5 times as much (Gay-Lussac's law)."},
            {question: "Set up the lab and heat it to 450 K. What pressure does the gas law show?", quantity: "p",
              choices: [["right", null], ["start", "notRun"], ["celsius", "celsius"], ["down", "direction"]],
              hints: ["Press Set up the lab, then set the temperature to 450 K (or press Make the change for me).", "Read Gas law under the gauge. P = nRT/V = (1.00)(0.08206)(450)/8.0."],
              trail: "{right}", explain: "At 450 K the pressure is {right}, 1.5 times the {start} at 300 K."},
            {question: "Why does the pressure go up?",
              choices: [["faster", "Faster particles hit the walls more often and with more force.", null], ["more", "Heating makes more particles.", "moreParticles"], ["push", "Hot particles push each other apart.", "pushing"], ["bigger", "The particles get bigger, so they hit the walls more.", "sizeConst"]],
              hints: ["The number of particles and the walls do not change. What does heating change?", "Heating speeds the particles up: each hit is harder and hits come more often."],
              trail: "Harder, more frequent hits", explain: "The particles move faster, so they hit the walls both harder and more often."}
          ],
          feedback: {glSame: "The volume is fixed, but the particles move faster, so they hit the fixed walls harder and more often.",
            direction: "Heating speeds the particles up, so they hit the walls harder. The pressure goes up.",
            moreParticles: "No particles are added; the moles stay the same. The same particles move faster."},
          summary: "At constant volume, P is proportional to the kelvin temperature: faster particles hit harder and more often."},
        {id: "avogadro", group: "law", title: "Add more gas", setup: {mode: "ideal", gases: [{gas: "He", n: 0.40}], T: 300, V: 4.9236, hold: "P", P: 2.00},
          run: {n: 0.80}, runText: "set the moles to 0.80 mol", what: "0.40 mol of helium at 300 K, pressure held at 2.00 atm",
          steps: [
            {question: "Holding pressure and temperature, you double the moles of gas. What will the volume do?",
              choices: [["double", "It will double.", null], ["same", "It will stay the same, because the container is the same.", "avoSame"], ["half", "It will be cut in half.", "direction"], ["gas", "It depends on which gas it is.", "avoGas"]],
              hints: ["More particles means more hits on the piston. The pressure is held, so what must the piston do?", "At constant P and T, V is proportional to n."],
              trail: "V doubles", explain: "Twice the moles gives twice the volume at the same pressure and temperature (Avogadro's law)."},
            {question: "Set up the lab and change the moles to 0.80 mol. What volume does the piston move to?", quantity: "v",
              choices: [["right", null], ["start", "notRun"], ["half", "direction"], ["four", "linear"]],
              hints: ["Press Set up the lab, then set the moles to 0.80 (or press Make the change for me).", "Read the volume box. V = nRT/P = (0.80)(0.08206)(300)/2.00."],
              trail: "{right}", explain: "With 0.80 mol the piston settles at {right}, twice the {start} with 0.40 mol."},
            {question: "Why does the volume double?",
              choices: [["more", "Twice as many particles hit the piston, so it moves out until each part of the wall is hit as often as before.", null], ["push", "The new particles push the old ones apart.", "pushing"], ["space", "Each particle takes up more space.", "sizeConst"], ["faster", "The particles move faster with more of them.", "speedConst"]],
              hints: ["The temperature is held, so each particle hits just as hard. What changes?", "Twice the particles means twice the hits on the piston until the volume doubles."],
              trail: "Twice the hits", explain: "Twice the particles make twice the hits on the piston; it moves out until the hits per area are back to the held pressure."}
          ],
          feedback: {avoSame: "The pressure is held, not the volume: with more particles hitting it, the piston moves out.",
            direction: "Adding particles adds hits on the piston, which pushes it out. The volume goes up.",
            avoGas: "At the same temperature and pressure, equal volumes of any gas hold equal numbers of particles. The kind of gas does not matter.",
            linear: "V is proportional to n: twice the particles, twice the volume, not 4 times."},
          summary: "At constant P and T, V is proportional to n: equal volumes of gases hold equal numbers of particles."},
        {id: "ke", group: "kmt", title: "Kinetic energy and temperature", setup: {mode: "ideal", gases: [{gas: "N2", n: 1.00}], T: 300, V: 5.0, hold: "V"},
          run: {T: 600}, runText: "set the temperature to 600 K", what: "1.00 mol of nitrogen at 300 K (27 °C), volume held",
          celsius: [27, 327],
          steps: [
            {question: "You heat the gas from 27 °C to 327 °C. What will the particles' average kinetic energy do?",
              choices: [["double", "It will double.", null], ["twelve", "It will grow about 12 times.", "celsius"], ["root2", "It will grow about 1.4 times.", "speedNotKE"], ["same", "It will stay the same.", "keSame"]],
              hints: ["Average kinetic energy is proportional to temperature on one particular scale.", "27 °C is 300 K and 327 °C is 600 K."],
              trail: "KE doubles", explain: "Average kinetic energy is proportional to the kelvin temperature: 300 K to 600 K doubles it."},
            {question: "Set up the lab and heat it to 600 K. What average kinetic energy does the lab show, (3/2)RT?", quantity: "ke",
              choices: [["right", null], ["start", "notRun"], ["celsius", "celsius"], ["root2", "speedNotKE"]],
              hints: ["Press Set up the lab, then set the temperature to 600 K (or press Make the change for me).", "Read Average kinetic energy. (3/2)RT = 1.5 × 8.314 × 600 J/mol."],
              trail: "{right}", explain: "At 600 K the average kinetic energy is {right}, twice the {start} at 300 K. The dots' own average matches it."},
            {question: "Which statement explains this?",
              choices: [["kelvin", "The kelvin temperature is proportional to the average kinetic energy of the particles.", null], ["heat", "Temperature measures how much heat is stored in the container.", "heatStuff"], ["bigger", "Hot particles are bigger, so they have more energy.", "sizeConst"], ["celsius", "Kinetic energy is proportional to the Celsius temperature.", "celsiusKE"]],
              hints: ["What does temperature measure, at the particle level?", "Temperature in kelvins is a measure of the particles' average kinetic energy."],
              trail: "KE ∝ kelvin temperature", explain: "Temperature in kelvins measures the average kinetic energy of the particles: KE = (3/2)RT per mole."}
          ],
          feedback: {speedNotKE: "1.4 (√2) is how much the average speed rises. Kinetic energy itself is proportional to the kelvin temperature.",
            keSame: "Heating speeds the particles up, so their average kinetic energy rises.",
            heatStuff: "Heat is energy moving from hot to cold, not a substance stored in the gas. Temperature measures the particles' average kinetic energy.",
            celsiusKE: "At 0 °C particles still move. Only the kelvin scale starts at zero kinetic energy, so KE is proportional to kelvins."},
          summary: "Average kinetic energy is proportional to the kelvin temperature: 27 °C to 327 °C (300 K to 600 K) doubles it."},
        {id: "hexe", group: "kmt", title: "Helium and xenon at the same temperature", setup: {mode: "ideal", gases: [{gas: "He", n: 1.00}, {gas: "Xe", n: 1.00}], T: 300, V: 10.0, hold: "T"},
          what: "1.00 mol of helium and 1.00 mol of xenon mixed at 300 K",
          steps: [
            {question: "Helium (4.0 g/mol) and xenon (131.3 g/mol) are mixed at 300 K. Which particles have the larger average kinetic energy?",
              choices: [["same", "Neither: they are the same.", null], ["xe", "Xenon, because its atoms are heavier.", "heavierKE"], ["he", "Helium, because its atoms are faster.", "fasterKE"]],
              hints: ["What does temperature tell you about the particles?", "Both gases are at 300 K, and temperature sets the average kinetic energy."],
              trail: "Same average KE", explain: "Same temperature, same average kinetic energy: (3/2)RT for every gas."},
            {question: "Set up the lab. Compare the average speeds. About how many times faster is helium than xenon?", quantity: "ratio",
              choices: [["right", null], ["mass", "massRatio"], ["one", "sameSpeed"], ["inverse", "heavierFast"]],
              hints: ["Press Set up the lab and read Average speed for He and Xe.", "Divide helium's average speed by xenon's. It equals √(131.3/4.0)."],
              trail: "{right}", explain: "Helium averages {he} and xenon {xe}: helium is {right} faster, √(131.3/4.0)."},
            {question: "Why is helium faster at the same temperature?",
              choices: [["mass", "The average kinetic energy ½mv² is the same, so lighter particles must move faster.", null], ["heavy", "Xenon's heavier atoms have more energy, so they push harder.", "heavierKE"], ["hotter", "Helium atoms are hotter than xenon atoms.", "hotter"], ["attract", "Xenon atoms attract each other, which slows them down.", "attractIdeal"]],
              hints: ["Kinetic energy is ½mv². What happens to v if m is smaller and ½mv² is the same?", "The same ½mv² with a smaller m needs a larger v."],
              trail: "Same ½mv², smaller m", explain: "With the same ½mv², the lighter helium atoms must move faster: speed goes as 1/√M."}
          ],
          feedback: {fasterKE: "Helium is faster, but each atom has much less mass. ½mv² comes out the same for both.",
            massRatio: "33 is the ratio of the molar masses. Speed goes as 1/√M, so the ratio is √33.",
            sameSpeed: "Same temperature means the same average kinetic energy, not the same speed.",
            heavierFast: "That would make helium slower. Lighter particles move faster at the same temperature.",
            hotter: "Both gases are at the same temperature, 300 K. They differ in mass, not temperature.",
            attractIdeal: "The ideal model has no attractions. The difference in speed comes from the difference in mass alone."},
          summary: "At the same temperature every gas has the same average kinetic energy, so lighter particles move faster (speed ∝ 1/√M)."},
        {id: "mbT", group: "mb", title: "Read the curves: temperature", chart: {gas: "N2", T: [300, 600]},
          setup: {mode: "ideal", gases: [{gas: "N2", n: 2.00}], T: 300, V: 5.0, hold: "V"},
          run: {T: 600}, runText: "set the temperature to 600 K", what: "2.00 mol of nitrogen at 300 K, volume held",
          steps: [
            {question: "These are nitrogen's speed curves at 300 K and at 600 K. Which curve is 600 K?", curves: true,
              choices: [["higher", "Curve A (solid)", null], ["lower", "Curve B (dashed)", "tallIsHot"]],
              hints: ["At a higher temperature, are more particles fast or slow?", "Higher temperature moves the peak to higher speeds and spreads the curve out, so it is lower and wider."],
              trail: "The wider curve", explain: "The 600 K curve peaks at a higher speed and is lower and wider: more particles move fast."},
            {question: "Set up the lab and heat it to 600 K. What average speed does the lab show for nitrogen?", quantity: "speed",
              choices: [["right", null], ["start", "notRun"], ["double", "speedDouble"], ["half", "direction"]],
              hints: ["Press Set up the lab, then set the temperature to 600 K (or press Make the change for me).", "Read Average speed. Speed goes as √T, so doubling T multiplies it by √2."],
              trail: "{right}", explain: "At 600 K nitrogen averages {right}, √2 times the {start} at 300 K."},
            {question: "Why are the two curves different shapes?",
              choices: [["spread", "At higher temperature more particles move fast, so the peak shifts right and flattens; the area stays the same because the number of particles is the same.", null], ["same", "At higher temperature every particle moves at the same, higher speed.", "allSame"], ["more", "The 600 K curve has more particles under it.", "moreParticles"]],
              hints: ["Does every particle have the same speed at one temperature?", "The area under each curve is the number of particles, which did not change."],
              trail: "Same area, shifted right", explain: "The particles have a spread of speeds; heating shifts the spread to higher speeds, and the same number of particles means the same area."}
          ],
          feedback: {tallIsHot: "The taller, narrower curve has more slow particles: that is the lower temperature.",
            speedDouble: "Doubling the kelvin temperature doubles the kinetic energy; the speed goes up by √2, about 1.41 times.",
            direction: "Heating makes particles faster, so the average speed goes up.",
            allSame: "At any temperature particles have a spread of speeds; that spread is the curve.",
            moreParticles: "No particles are added. The area under each curve is the number of particles, and it is the same."},
          summary: "Higher temperature shifts the speed curve to higher speeds and flattens it; the area (number of particles) stays the same."},
        {id: "mbM", group: "mb", title: "Read the curves: mass", chart: {gas: ["Ne", "Kr"], T: 300},
          setup: {mode: "ideal", gases: [{gas: "Kr", n: 2.00}], T: 300, V: 5.0, hold: "V"},
          what: "2.00 mol of krypton at 300 K",
          steps: [
            {question: "These are speed curves of neon (20.2 g/mol) and krypton (83.8 g/mol) at 300 K. Which curve is krypton?", curves: true,
              choices: [["heavy", "Curve A (solid)", null], ["light", "Curve B (dashed)", "heavyFast"]],
              hints: ["At the same temperature, do heavier particles move faster or slower?", "Heavier particles move slower: their curve peaks at a lower speed and is taller and narrower."],
              trail: "The narrower curve", explain: "Krypton's curve peaks at a lower speed and is taller and narrower: heavier particles move slower."},
            {question: "Set up the lab with krypton. What average speed does the lab show?", quantity: "speed",
              choices: [["right", null], ["neon", "swapGas"], ["heavyFast", "heavyFast"]],
              hints: ["Press Set up the lab and read Average speed.", "Krypton is heavier than neon, so its speed is lower: about 561 m/s × √(20.2/83.8)."],
              trail: "{right}", explain: "Krypton averages {right} at 300 K, slower than neon's {neon}."},
            {question: "Why is krypton slower at the same temperature?",
              choices: [["mass", "Same temperature means the same average kinetic energy, so heavier particles must move slower.", null], ["moreKE", "Heavier particles have more kinetic energy, so they don't need to move fast.", "heavierKE"], ["colder", "Krypton atoms are colder.", "hotter"]],
              hints: ["Kinetic energy is ½mv².", "The same ½mv² with a larger m means a smaller v."],
              trail: "Same KE, larger m", explain: "With the same average ½mv², the heavier krypton atoms move slower."}
          ],
          feedback: {heavyFast: "Heavier particles move slower at the same temperature, not faster.",
            swapGas: "That is neon's average speed. Krypton is heavier, so it is slower.",
            hotter: "Both gases are at 300 K. They differ in mass, not temperature."},
          summary: "At the same temperature heavier particles move slower: their speed curve peaks at a lower speed and is taller and narrower."},
        {id: "dalton", group: "mix", title: "Partial pressures", setup: {mode: "ideal", gases: [{gas: "He", n: 0.50}, {gas: "Ar", n: 1.50}], T: 300, V: 10.0, hold: "T"},
          what: "0.50 mol of helium and 1.50 mol of argon at 300 K in 10.0 L",
          steps: [
            {question: "A container holds 0.50 mol of helium and 1.50 mol of argon. Which gas has the larger partial pressure?",
              choices: [["ar", "Argon, because it has more moles.", null], ["he", "Helium, because its atoms move faster.", "fasterPressure"], ["equal", "They are equal, because they share one container.", "equalShare"]],
              hints: ["Each gas's partial pressure is the pressure it would have alone in the container.", "Partial pressure = mole fraction × total pressure."],
              trail: "Argon", explain: "Argon has 3/4 of the moles, so it has 3/4 of the pressure."},
            {question: "Set up the lab. What partial pressure does the table show for argon?", quantity: "p",
              choices: [["right", null], ["he", "swapPartial"], ["total", "totalNotPartial"], ["equal", "equalShare"]],
              hints: ["Press Set up the lab and find the partial pressure table under the controls.", "Argon's mole fraction is 1.50/2.00 = 0.750; multiply by the total pressure."],
              trail: "{right}", explain: "Argon's partial pressure is {right}; helium's is {he}; together they make the total, {total}."},
            {question: "Why does each gas's pressure depend only on its moles?",
              choices: [["independent", "Particles in an ideal gas act independently, and at the same temperature each mole of any gas hits the walls with the same total force.", null], ["push", "Argon atoms push the helium atoms against the walls.", "pushing"], ["heavy", "Heavier atoms always make more pressure.", "heavierKE"]],
              hints: ["Does an argon atom change how a helium atom hits the wall?", "Light atoms hit more often but more softly; heavy atoms hit less often but harder. Per mole it evens out."],
              trail: "Independent particles", explain: "Each gas hits the walls as if it were alone, and per mole every gas gives the same pressure at the same temperature."}
          ],
          feedback: {fasterPressure: "Helium atoms hit more often, but each hit is softer. Per mole, every gas gives the same pressure at the same temperature.",
            equalShare: "Sharing a container does not split the pressure equally. Each gas's share is its mole fraction.",
            swapPartial: "That is helium's partial pressure. Argon has 3 times the moles, so 3 times the pressure.",
            totalNotPartial: "That is the total pressure. Argon's share is its mole fraction, 0.750, of the total."},
          summary: "Each gas's partial pressure is its mole fraction times the total, and the partial pressures add up to the total (Dalton's law)."},
        {id: "realP", group: "mix", title: "When real gases deviate", setup: {mode: "real", gases: [{gas: "CO2", n: 1.00}], T: 300, V: 2.5, hold: "T"},
          run: {V: 0.5}, runText: "set the volume to 0.50 L", what: "1.00 mol of carbon dioxide at 300 K in 2.50 L, real gas mode",
          steps: [
            {question: "Under which conditions does a real gas behave least like an ideal gas?",
              choices: [["hpLt", "High pressure and low temperature", null], ["lpHt", "Low pressure and high temperature", "realReverse"], ["hpHt", "High pressure and high temperature", "realHighT"], ["lpLt", "Low pressure and low temperature", "realLowP"]],
              hints: ["The ideal model ignores two things: the particles' own volume and attractions between them.", "Both matter most when particles are crowded (high pressure) and slow (low temperature)."],
              trail: "High P, low T", explain: "Crowded (high pressure) and slow (low temperature) particles feel their own volume and their attractions most."},
            {question: "Set up the lab and compress the CO₂ to 0.50 L. What is PV/nRT now?", quantity: "z",
              choices: [["right", null], ["start", "notRun"], ["one", "idealOne"], ["above", "realAbove"]],
              hints: ["Press Set up the lab, then set the volume to 0.50 L (or press Make the change for me).", "Read PV/nRT under the pressure gauge. It comes from the van der Waals equation."],
              trail: "{right}", explain: "At 0.50 L, PV/nRT is {right}, further below 1 than {start} at 2.50 L: attractions lower the pressure."},
            {question: "Why does the compressed CO₂ depart from ideal?",
              choices: [["both", "Crowded together, the particles attract each other, which softens their hits on the walls, and their own volume starts to matter.", null], ["push", "Real particles push each other away at every distance.", "pushing"], ["slow", "The particles slow down when they are compressed.", "speedConst"], ["r", "R changes at high pressure.", "rConst"]],
              hints: ["At 300 K, CO₂ is close to condensing. What pulls condensing particles together?", "Attractions pull particles back as they reach the wall, so they hit more softly; PV/nRT drops below 1."],
              trail: "Attractions, then volume", explain: "Close together, attractions pull particles back from the walls (PV/nRT below 1); at even higher pressure their own volume pushes it above 1."}
          ],
          feedback: {realReverse: "At low pressure and high temperature particles are far apart and fast: that is when gases behave most ideally.",
            realHighT: "High pressure helps, but at high temperature attractions matter less. Low temperature makes the deviation larger.",
            realLowP: "At low pressure particles are far apart, so their volume and attractions hardly matter.",
            realAbove: "Above 1 would mean the particles' own volume wins. For CO₂ at 300 K attractions win, so PV/nRT is below 1.",
            rConst: "R is a constant. PV/nRT changes because real particles have volume and attract each other."},
          summary: "Real gases deviate most at high pressure and low temperature, when particles are crowded and slow enough for their volume and attractions to matter."},
        {id: "realGas", group: "mix", title: "Which gas is least ideal?", setup: {mode: "real", gases: [{gas: "Xe", n: 2.00}], T: 300, V: 1.0, hold: "T"},
          what: "2.00 mol of xenon at 300 K in 1.00 L, real gas mode",
          steps: [
            {question: "At the same high pressure and temperature, which gas departs most from ideal behavior?",
              choices: [["xe", "Xenon", null], ["n2", "Nitrogen", "middleGas"], ["he", "Helium", "smallGas"]],
              hints: ["Which particles are largest and attract each other most strongly?", "Larger atoms with more electrons attract more strongly (larger a) and take up more room (larger b)."],
              trail: "Xenon", explain: "Xenon's large atoms attract each other most strongly and take up the most room."},
            {question: "Set up the lab. What is PV/nRT for xenon here?", quantity: "z",
              choices: [["right", null], ["he", "swapZ"], ["one", "idealOne"]],
              hints: ["Press Set up the lab and read PV/nRT under the pressure gauge.", "You can switch the gas to helium afterwards to compare."],
              trail: "{right}", explain: "Xenon's PV/nRT is {right}; helium's at the same conditions is {he}, much closer to 1."},
            {question: "Why does xenon deviate more than helium?",
              choices: [["size", "Xenon atoms are larger and have many more electrons, so they attract each other more strongly and take up more room.", null], ["heavy", "Xenon is heavier, so it hits the walls harder.", "heavierKE"], ["fast", "Xenon atoms move faster, so they collide more.", "heavyFast"]],
              hints: ["What makes particles attract each other more strongly?", "More electrons mean stronger London dispersion attractions; bigger atoms take up more space."],
              trail: "Larger, more attractive atoms", explain: "Xenon's larger electron cloud gives stronger attractions (a) and a larger atom (b), so both corrections are bigger."}
          ],
          feedback: {middleGas: "Nitrogen deviates some, but xenon's atoms are larger and attract each other more strongly.",
            smallGas: "Helium's tiny, weakly attracting atoms make it the most nearly ideal gas.",
            swapZ: "That is helium's PV/nRT at the same conditions. Xenon departs further from 1.",
            heavyFast: "Xenon atoms are heavier, so they move slower at the same temperature, not faster."},
          summary: "Larger particles with stronger attractions (larger van der Waals a and b) deviate more from ideal behavior."}
      ]
    }
  };
  // Spanish: i18n-data.js has already given the shared i18n module every English string with its translation.
  // Only words are swapped, by exact English match: ids, lab settings, gas symbols and choice values stay as they
  // are, because the scripts look things up by them. The engine's own default words are added so they are
  // translated too; English keeps the engine defaults.
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  if (i18n && i18n.lang === "es") {
    var engine = {hint: "Hint", hint2: "Another hint", hintsDone: "Both hints shown", show: "Show me", hintPrefix: "Hint: ",
      correct: "\u2713 Correct. ", wrong: "\u21bb Not yet. ", revealed: "\u2192 Answer shown. ", general: "Use a hint and try again.",
      finish: "See round summary", roundComplete: "Round complete", review: "Keep practicing", again: "Practice again",
      misses: "Practice my misses", repeatNote: "Review items do not change the first-try counts.",
      progress: "{label} {number} of {total} \u00b7 Step {step} of {steps}", trailLabel: "Your answers so far",
      correctMark: "Correct: ", shownMark: "Shown: ", triedMark: " (tried, not correct)", hintMark: " (hint)",
      codeLabel: "Completion code", copyCode: "Copy code", codeCopied: "Code copied.", codeReady: "Completion code ready.",
      codeSelected: "The code is selected. Press Ctrl+C, or Command+C on a Mac, to copy it.",
      codeNote: "Paste this code into your Google Classroom assignment.",
      chargeMark: "ion charge", tableCaption: "Main-group elements by group (column) and period (row)", periodLabel: "Period"};
    Object.keys(data.inv.labels).forEach(function (k) { engine[k] = data.inv.labels[k]; });
    data.inv.labels = engine;
    var KEEP = {id: 1, group: 1, setup: 1, run: 1, chart: 1, celsius: 1, quantity: 1, curves: 1, formula: 1, spoken: 1, defaultBack: 1};
    var localize = function (value) {
      if (typeof value === "string") return i18n.text(value);
      if (Array.isArray(value)) return value.map(localize);
      if (!value || typeof value !== "object") return value;
      var out = {};
      Object.keys(value).forEach(function (k) {
        var v = value[k];
        if (KEEP[k] && (k !== "celsius" || Array.isArray(v))) out[k] = v; // feedback.celsius is a message
        // [value, label, feedback key] or, in test steps, [value, feedback key]: only a label is a word.
        else if (k === "choices") out[k] = v.map(function (c) { return c.length === 3 ? [c[0], i18n.text(c[1]), c[2]] : c.slice(); });
        else if (k === "stats") out[k] = v.map(function (st) { return [st[0], i18n.text(st[1])]; });
        else out[k] = localize(v);
      });
      return out;
    };
    data = localize(data);
  }
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(data); });
}());
