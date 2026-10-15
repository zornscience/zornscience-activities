(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ion-charge-trainer"]');
  if (!root) return;
  var data = {
  "elements": [
    {
      "name": "lithium",
      "symbol": "Li",
      "z": 3,
      "group": 1,
      "period": 2,
      "valence": 1,
      "charge": 1,
      "ion": "lithium ion",
      "gas": "helium",
      "electrons": 2,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "lithium ion, 1 plus charge",
      "summary": "Lithium loses 1 electron. 3 protons − 2 electrons = 1+. The ion is a cation and is isoelectronic with helium.",
      "reminder": "Lithium loses 1 electron. Its remaining first energy level is full with 2 electrons, like helium.",
      "hints": [
        [
          "Find lithium on the periodic table. Which group, or column, is it in?",
          "Lithium is in group 1. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is lithium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Lithium loses 1 electron. Its remaining first energy level is full with 2 electrons, like helium."
        ],
        [
          "Charge = protons − electrons.",
          "Lithium has 3 protons. After losing 1, it has 2 electrons. What is 3 − 2?"
        ]
      ],
      "correct": [
        "Lithium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Lithium loses 1 electron. Its remaining first energy level is full with 2 electrons, like helium.",
        "3 protons − 2 electrons = 1+."
      ],
      "feedback": {
        "period": "That is lithium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons lithium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both lithium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "Gaining 7 is the long path. Lithium is a small atom, and its first energy level holds only 2 electrons. Which change leaves that small level as a full outer level?",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Lithium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "sodium",
      "symbol": "Na",
      "z": 11,
      "group": 1,
      "period": 3,
      "valence": 1,
      "charge": 1,
      "ion": "sodium ion",
      "gas": "neon",
      "electrons": 10,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "sodium ion, 1 plus charge",
      "summary": "Sodium loses 1 electron. 11 protons − 10 electrons = 1+. The ion is a cation and is isoelectronic with neon.",
      "reminder": "Sodium loses 1 electron and forms a 1+ ion.",
      "hints": [
        [
          "Find sodium on the periodic table. Which group, or column, is it in?",
          "Sodium is in group 1. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is sodium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Sodium has 1 valence electron. Which is fewer: losing 1 or gaining 7?"
        ],
        [
          "Charge = protons − electrons.",
          "Sodium has 11 protons. After losing 1, it has 10 electrons. What is 11 − 10?"
        ]
      ],
      "correct": [
        "Sodium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Sodium loses 1 electron to reach a full outer level.",
        "11 protons − 10 electrons = 1+."
      ],
      "feedback": {
        "period": "That is sodium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons sodium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both sodium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Sodium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "potassium",
      "symbol": "K",
      "z": 19,
      "group": 1,
      "period": 4,
      "valence": 1,
      "charge": 1,
      "ion": "potassium ion",
      "gas": "argon",
      "electrons": 18,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "potassium ion, 1 plus charge",
      "summary": "Potassium loses 1 electron. 19 protons − 18 electrons = 1+. The ion is a cation and is isoelectronic with argon.",
      "reminder": "Potassium loses 1 electron and forms a 1+ ion.",
      "hints": [
        [
          "Find potassium on the periodic table. Which group, or column, is it in?",
          "Potassium is in group 1. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is potassium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Potassium has 1 valence electron. Which is fewer: losing 1 or gaining 7?"
        ],
        [
          "Charge = protons − electrons.",
          "Potassium has 19 protons. After losing 1, it has 18 electrons. What is 19 − 18?"
        ]
      ],
      "correct": [
        "Potassium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Potassium loses 1 electron to reach a full outer level.",
        "19 protons − 18 electrons = 1+."
      ],
      "feedback": {
        "period": "That is potassium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons potassium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both potassium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Potassium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "rubidium",
      "symbol": "Rb",
      "z": 37,
      "group": 1,
      "period": 5,
      "valence": 1,
      "charge": 1,
      "ion": "rubidium ion",
      "gas": "krypton",
      "electrons": 36,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "rubidium ion, 1 plus charge",
      "summary": "Rubidium loses 1 electron. 37 protons − 36 electrons = 1+. The ion is a cation and is isoelectronic with krypton.",
      "reminder": "Rubidium loses 1 electron and forms a 1+ ion.",
      "hints": [
        [
          "Find rubidium on the periodic table. Which group, or column, is it in?",
          "Rubidium is in group 1. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is rubidium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Rubidium has 1 valence electron. Which is fewer: losing 1 or gaining 7?"
        ],
        [
          "Charge = protons − electrons.",
          "Rubidium has 37 protons. After losing 1, it has 36 electrons. What is 37 − 36?"
        ]
      ],
      "correct": [
        "Rubidium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Rubidium loses 1 electron to reach a full outer level.",
        "37 protons − 36 electrons = 1+."
      ],
      "feedback": {
        "period": "That is rubidium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons rubidium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both rubidium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Rubidium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "cesium",
      "symbol": "Cs",
      "z": 55,
      "group": 1,
      "period": 6,
      "valence": 1,
      "charge": 1,
      "ion": "cesium ion",
      "gas": "xenon",
      "electrons": 54,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "cesium ion, 1 plus charge",
      "summary": "Cesium loses 1 electron. 55 protons − 54 electrons = 1+. The ion is a cation and is isoelectronic with xenon.",
      "reminder": "Cesium loses 1 electron and forms a 1+ ion.",
      "hints": [
        [
          "Find cesium on the periodic table. Which group, or column, is it in?",
          "Cesium is in group 1. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is cesium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Cesium has 1 valence electron. Which is fewer: losing 1 or gaining 7?"
        ],
        [
          "Charge = protons − electrons.",
          "Cesium has 55 protons. After losing 1, it has 54 electrons. What is 55 − 54?"
        ]
      ],
      "correct": [
        "Cesium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Cesium loses 1 electron to reach a full outer level.",
        "55 protons − 54 electrons = 1+."
      ],
      "feedback": {
        "period": "That is cesium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons cesium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both cesium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Cesium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "magnesium",
      "symbol": "Mg",
      "z": 12,
      "group": 2,
      "period": 3,
      "valence": 2,
      "charge": 2,
      "ion": "magnesium ion",
      "gas": "neon",
      "electrons": 10,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "magnesium ion, 2 plus charge",
      "summary": "Magnesium loses 2 electrons. 12 protons − 10 electrons = 2+. The ion is a cation and is isoelectronic with neon.",
      "reminder": "Magnesium loses 2 electrons and forms a 2+ ion.",
      "hints": [
        [
          "Find magnesium on the periodic table. Which group, or column, is it in?",
          "Magnesium is in group 2. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is magnesium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Magnesium has 2 valence electrons. Which is fewer: losing 2 or gaining 6?"
        ],
        [
          "Charge = protons − electrons.",
          "Magnesium has 12 protons. After losing 2, it has 10 electrons. What is 12 − 10?"
        ]
      ],
      "correct": [
        "Magnesium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Magnesium loses 2 electrons to reach a full outer level.",
        "12 protons − 10 electrons = 2+."
      ],
      "feedback": {
        "period": "That is magnesium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons magnesium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both magnesium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Magnesium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "calcium",
      "symbol": "Ca",
      "z": 20,
      "group": 2,
      "period": 4,
      "valence": 2,
      "charge": 2,
      "ion": "calcium ion",
      "gas": "argon",
      "electrons": 18,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "calcium ion, 2 plus charge",
      "summary": "Calcium loses 2 electrons. 20 protons − 18 electrons = 2+. The ion is a cation and is isoelectronic with argon.",
      "reminder": "Calcium loses 2 electrons and forms a 2+ ion.",
      "hints": [
        [
          "Find calcium on the periodic table. Which group, or column, is it in?",
          "Calcium is in group 2. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is calcium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Calcium has 2 valence electrons. Which is fewer: losing 2 or gaining 6?"
        ],
        [
          "Charge = protons − electrons.",
          "Calcium has 20 protons. After losing 2, it has 18 electrons. What is 20 − 18?"
        ]
      ],
      "correct": [
        "Calcium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Calcium loses 2 electrons to reach a full outer level.",
        "20 protons − 18 electrons = 2+."
      ],
      "feedback": {
        "period": "That is calcium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons calcium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both calcium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Calcium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "strontium",
      "symbol": "Sr",
      "z": 38,
      "group": 2,
      "period": 5,
      "valence": 2,
      "charge": 2,
      "ion": "strontium ion",
      "gas": "krypton",
      "electrons": 36,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "strontium ion, 2 plus charge",
      "summary": "Strontium loses 2 electrons. 38 protons − 36 electrons = 2+. The ion is a cation and is isoelectronic with krypton.",
      "reminder": "Strontium loses 2 electrons and forms a 2+ ion.",
      "hints": [
        [
          "Find strontium on the periodic table. Which group, or column, is it in?",
          "Strontium is in group 2. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is strontium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Strontium has 2 valence electrons. Which is fewer: losing 2 or gaining 6?"
        ],
        [
          "Charge = protons − electrons.",
          "Strontium has 38 protons. After losing 2, it has 36 electrons. What is 38 − 36?"
        ]
      ],
      "correct": [
        "Strontium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Strontium loses 2 electrons to reach a full outer level.",
        "38 protons − 36 electrons = 2+."
      ],
      "feedback": {
        "period": "That is strontium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons strontium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both strontium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Strontium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "barium",
      "symbol": "Ba",
      "z": 56,
      "group": 2,
      "period": 6,
      "valence": 2,
      "charge": 2,
      "ion": "barium ion",
      "gas": "xenon",
      "electrons": 54,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "barium ion, 2 plus charge",
      "summary": "Barium loses 2 electrons. 56 protons − 54 electrons = 2+. The ion is a cation and is isoelectronic with xenon.",
      "reminder": "Barium loses 2 electrons and forms a 2+ ion.",
      "hints": [
        [
          "Find barium on the periodic table. Which group, or column, is it in?",
          "Barium is in group 2. For groups 1 and 2, the group number is the number of valence electrons."
        ],
        [
          "Is barium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Barium has 2 valence electrons. Which is fewer: losing 2 or gaining 6?"
        ],
        [
          "Charge = protons − electrons.",
          "Barium has 56 protons. After losing 2, it has 54 electrons. What is 56 − 54?"
        ]
      ],
      "correct": [
        "Barium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Barium loses 2 electrons to reach a full outer level.",
        "56 protons − 54 electrons = 2+."
      ],
      "feedback": {
        "period": "That is barium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons barium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both barium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Barium is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "aluminum",
      "symbol": "Al",
      "z": 13,
      "group": 13,
      "period": 3,
      "valence": 3,
      "charge": 3,
      "ion": "aluminum ion",
      "gas": "neon",
      "electrons": 10,
      "direction": "loses",
      "moved": 3,
      "metal": "metal",
      "chargeLabel": "3+",
      "spoken": "aluminum ion, 3 plus charge",
      "summary": "Aluminum loses 3 electrons. 13 protons − 10 electrons = 3+. The ion is a cation and is isoelectronic with neon.",
      "reminder": "Aluminum loses 3 electrons and forms a 3+ ion.",
      "hints": [
        [
          "Find aluminum on the periodic table. Which group, or column, is it in?",
          "Aluminum is in group 13. For groups 13 to 18, use the last digit."
        ],
        [
          "Is aluminum a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Aluminum has 3 valence electrons. Which is fewer: losing 3 or gaining 5?"
        ],
        [
          "Charge = protons − electrons.",
          "Aluminum has 13 protons. After losing 3, it has 10 electrons. What is 13 − 10?"
        ]
      ],
      "correct": [
        "Aluminum has 3 valence electrons. For groups 13 to 18, use the last digit.",
        "Aluminum loses 3 electrons to reach a full outer level.",
        "13 protons − 10 electrons = 3+."
      ],
      "feedback": {
        "period": "That is aluminum's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons aluminum would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both aluminum's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Aluminum is a metal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Losing electrons leaves more protons than electrons, so the charge is positive.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "nitrogen",
      "symbol": "N",
      "z": 7,
      "group": 15,
      "period": 2,
      "valence": 5,
      "charge": -3,
      "ion": "nitride",
      "gas": "neon",
      "electrons": 10,
      "direction": "gains",
      "moved": 3,
      "metal": "nonmetal",
      "chargeLabel": "3−",
      "spoken": "nitride ion, 3 minus charge",
      "summary": "Nitrogen gains 3 electrons. 7 protons − 10 electrons = 3−. The ion is an anion and is isoelectronic with neon.",
      "reminder": "Nitrogen gains 3 electrons and forms a 3− ion.",
      "hints": [
        [
          "Find nitrogen on the periodic table. Which group, or column, is it in?",
          "Nitrogen is in group 15. For groups 13 to 18, use the last digit."
        ],
        [
          "Is nitrogen a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Nitrogen has 5 valence electrons. Which is fewer: losing 5 or gaining 3?"
        ],
        [
          "Charge = protons − electrons.",
          "Nitrogen has 7 protons. After gaining 3, it has 10 electrons. What is 7 − 10?"
        ]
      ],
      "correct": [
        "Nitrogen has 5 valence electrons. For groups 13 to 18, use the last digit.",
        "Nitrogen gains 3 electrons to reach a full outer level.",
        "7 protons − 10 electrons = 3−."
      ],
      "feedback": {
        "period": "That is nitrogen's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons nitrogen would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both nitrogen's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Nitrogen is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "phosphorus",
      "symbol": "P",
      "z": 15,
      "group": 15,
      "period": 3,
      "valence": 5,
      "charge": -3,
      "ion": "phosphide",
      "gas": "argon",
      "electrons": 18,
      "direction": "gains",
      "moved": 3,
      "metal": "nonmetal",
      "chargeLabel": "3−",
      "spoken": "phosphide ion, 3 minus charge",
      "summary": "Phosphorus gains 3 electrons. 15 protons − 18 electrons = 3−. The ion is an anion and is isoelectronic with argon.",
      "reminder": "Phosphorus gains 3 electrons and forms a 3− ion.",
      "hints": [
        [
          "Find phosphorus on the periodic table. Which group, or column, is it in?",
          "Phosphorus is in group 15. For groups 13 to 18, use the last digit."
        ],
        [
          "Is phosphorus a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Phosphorus has 5 valence electrons. Which is fewer: losing 5 or gaining 3?"
        ],
        [
          "Charge = protons − electrons.",
          "Phosphorus has 15 protons. After gaining 3, it has 18 electrons. What is 15 − 18?"
        ]
      ],
      "correct": [
        "Phosphorus has 5 valence electrons. For groups 13 to 18, use the last digit.",
        "Phosphorus gains 3 electrons to reach a full outer level.",
        "15 protons − 18 electrons = 3−."
      ],
      "feedback": {
        "period": "That is phosphorus's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons phosphorus would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both phosphorus's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Phosphorus is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "oxygen",
      "symbol": "O",
      "z": 8,
      "group": 16,
      "period": 2,
      "valence": 6,
      "charge": -2,
      "ion": "oxide",
      "gas": "neon",
      "electrons": 10,
      "direction": "gains",
      "moved": 2,
      "metal": "nonmetal",
      "chargeLabel": "2−",
      "spoken": "oxide ion, 2 minus charge",
      "summary": "Oxygen gains 2 electrons. 8 protons − 10 electrons = 2−. The ion is an anion and is isoelectronic with neon.",
      "reminder": "Oxygen gains 2 electrons and forms a 2− ion.",
      "hints": [
        [
          "Find oxygen on the periodic table. Which group, or column, is it in?",
          "Oxygen is in group 16. For groups 13 to 18, use the last digit."
        ],
        [
          "Is oxygen a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Oxygen has 6 valence electrons. Which is fewer: losing 6 or gaining 2?"
        ],
        [
          "Charge = protons − electrons.",
          "Oxygen has 8 protons. After gaining 2, it has 10 electrons. What is 8 − 10?"
        ]
      ],
      "correct": [
        "Oxygen has 6 valence electrons. For groups 13 to 18, use the last digit.",
        "Oxygen gains 2 electrons to reach a full outer level.",
        "8 protons − 10 electrons = 2−."
      ],
      "feedback": {
        "period": "That is oxygen's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons oxygen would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both oxygen's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Oxygen is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "sulfur",
      "symbol": "S",
      "z": 16,
      "group": 16,
      "period": 3,
      "valence": 6,
      "charge": -2,
      "ion": "sulfide",
      "gas": "argon",
      "electrons": 18,
      "direction": "gains",
      "moved": 2,
      "metal": "nonmetal",
      "chargeLabel": "2−",
      "spoken": "sulfide ion, 2 minus charge",
      "summary": "Sulfur gains 2 electrons. 16 protons − 18 electrons = 2−. The ion is an anion and is isoelectronic with argon.",
      "reminder": "Sulfur gains 2 electrons and forms a 2− ion.",
      "hints": [
        [
          "Find sulfur on the periodic table. Which group, or column, is it in?",
          "Sulfur is in group 16. For groups 13 to 18, use the last digit."
        ],
        [
          "Is sulfur a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Sulfur has 6 valence electrons. Which is fewer: losing 6 or gaining 2?"
        ],
        [
          "Charge = protons − electrons.",
          "Sulfur has 16 protons. After gaining 2, it has 18 electrons. What is 16 − 18?"
        ]
      ],
      "correct": [
        "Sulfur has 6 valence electrons. For groups 13 to 18, use the last digit.",
        "Sulfur gains 2 electrons to reach a full outer level.",
        "16 protons − 18 electrons = 2−."
      ],
      "feedback": {
        "period": "That is sulfur's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons sulfur would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both sulfur's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Sulfur is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "selenium",
      "symbol": "Se",
      "z": 34,
      "group": 16,
      "period": 4,
      "valence": 6,
      "charge": -2,
      "ion": "selenide",
      "gas": "krypton",
      "electrons": 36,
      "direction": "gains",
      "moved": 2,
      "metal": "nonmetal",
      "chargeLabel": "2−",
      "spoken": "selenide ion, 2 minus charge",
      "summary": "Selenium gains 2 electrons. 34 protons − 36 electrons = 2−. The ion is an anion and is isoelectronic with krypton.",
      "reminder": "Selenium gains 2 electrons and forms a 2− ion.",
      "hints": [
        [
          "Find selenium on the periodic table. Which group, or column, is it in?",
          "Selenium is in group 16. For groups 13 to 18, use the last digit."
        ],
        [
          "Is selenium a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Selenium has 6 valence electrons. Which is fewer: losing 6 or gaining 2?"
        ],
        [
          "Charge = protons − electrons.",
          "Selenium has 34 protons. After gaining 2, it has 36 electrons. What is 34 − 36?"
        ]
      ],
      "correct": [
        "Selenium has 6 valence electrons. For groups 13 to 18, use the last digit.",
        "Selenium gains 2 electrons to reach a full outer level.",
        "34 protons − 36 electrons = 2−."
      ],
      "feedback": {
        "period": "That is selenium's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons selenium would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both selenium's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Selenium is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "fluorine",
      "symbol": "F",
      "z": 9,
      "group": 17,
      "period": 2,
      "valence": 7,
      "charge": -1,
      "ion": "fluoride",
      "gas": "neon",
      "electrons": 10,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "fluoride ion, 1 minus charge",
      "summary": "Fluorine gains 1 electron. 9 protons − 10 electrons = 1−. The ion is an anion and is isoelectronic with neon.",
      "reminder": "Fluorine gains 1 electron and forms a 1− ion.",
      "hints": [
        [
          "Find fluorine on the periodic table. Which group, or column, is it in?",
          "Fluorine is in group 17. For groups 13 to 18, use the last digit."
        ],
        [
          "Is fluorine a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Fluorine has 7 valence electrons. Which is fewer: losing 7 or gaining 1?"
        ],
        [
          "Charge = protons − electrons.",
          "Fluorine has 9 protons. After gaining 1, it has 10 electrons. What is 9 − 10?"
        ]
      ],
      "correct": [
        "Fluorine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Fluorine gains 1 electron to reach a full outer level.",
        "9 protons − 10 electrons = 1−."
      ],
      "feedback": {
        "period": "That is fluorine's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons fluorine would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both fluorine's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Fluorine is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "chlorine",
      "symbol": "Cl",
      "z": 17,
      "group": 17,
      "period": 3,
      "valence": 7,
      "charge": -1,
      "ion": "chloride",
      "gas": "argon",
      "electrons": 18,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "chloride ion, 1 minus charge",
      "summary": "Chlorine gains 1 electron. 17 protons − 18 electrons = 1−. The ion is an anion and is isoelectronic with argon.",
      "reminder": "Chlorine gains 1 electron and forms a 1− ion.",
      "hints": [
        [
          "Find chlorine on the periodic table. Which group, or column, is it in?",
          "Chlorine is in group 17. For groups 13 to 18, use the last digit."
        ],
        [
          "Is chlorine a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Chlorine has 7 valence electrons. Which is fewer: losing 7 or gaining 1?"
        ],
        [
          "Charge = protons − electrons.",
          "Chlorine has 17 protons. After gaining 1, it has 18 electrons. What is 17 − 18?"
        ]
      ],
      "correct": [
        "Chlorine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Chlorine gains 1 electron to reach a full outer level.",
        "17 protons − 18 electrons = 1−."
      ],
      "feedback": {
        "period": "That is chlorine's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons chlorine would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both chlorine's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Chlorine is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "bromine",
      "symbol": "Br",
      "z": 35,
      "group": 17,
      "period": 4,
      "valence": 7,
      "charge": -1,
      "ion": "bromide",
      "gas": "krypton",
      "electrons": 36,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "bromide ion, 1 minus charge",
      "summary": "Bromine gains 1 electron. 35 protons − 36 electrons = 1−. The ion is an anion and is isoelectronic with krypton.",
      "reminder": "Bromine gains 1 electron and forms a 1− ion.",
      "hints": [
        [
          "Find bromine on the periodic table. Which group, or column, is it in?",
          "Bromine is in group 17. For groups 13 to 18, use the last digit."
        ],
        [
          "Is bromine a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Bromine has 7 valence electrons. Which is fewer: losing 7 or gaining 1?"
        ],
        [
          "Charge = protons − electrons.",
          "Bromine has 35 protons. After gaining 1, it has 36 electrons. What is 35 − 36?"
        ]
      ],
      "correct": [
        "Bromine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Bromine gains 1 electron to reach a full outer level.",
        "35 protons − 36 electrons = 1−."
      ],
      "feedback": {
        "period": "That is bromine's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons bromine would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both bromine's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Bromine is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    },
    {
      "name": "iodine",
      "symbol": "I",
      "z": 53,
      "group": 17,
      "period": 5,
      "valence": 7,
      "charge": -1,
      "ion": "iodide",
      "gas": "xenon",
      "electrons": 54,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "iodide ion, 1 minus charge",
      "summary": "Iodine gains 1 electron. 53 protons − 54 electrons = 1−. The ion is an anion and is isoelectronic with xenon.",
      "reminder": "Iodine gains 1 electron and forms a 1− ion.",
      "hints": [
        [
          "Find iodine on the periodic table. Which group, or column, is it in?",
          "Iodine is in group 17. For groups 13 to 18, use the last digit."
        ],
        [
          "Is iodine a metal or a nonmetal? For these common ions, metals lose electrons and nonmetals gain them.",
          "Iodine has 7 valence electrons. Which is fewer: losing 7 or gaining 1?"
        ],
        [
          "Charge = protons − electrons.",
          "Iodine has 53 protons. After gaining 1, it has 54 electrons. What is 53 − 54?"
        ]
      ],
      "correct": [
        "Iodine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Iodine gains 1 electron to reach a full outer level.",
        "53 protons − 54 electrons = 1−."
      ],
      "feedback": {
        "period": "That is iodine's period, or row. Valence electrons come from the group, or column.",
        "atomic": "That is the total number of electrons in the neutral atom. Only the outer ones are valence electrons.",
        "complement": "That is how many electrons iodine would need to reach 8. The question asks how many it already has in its outer level.",
        "combined": "That number is both iodine's period and how many electrons it needs to reach 8. Find how many it already has using its group, or column.",
        "long": "That is the long path in this prediction model. For these common ions, use the shorter path to 8. This is a pattern, not a complete explanation of ion formation.",
        "direction": "For these common ions, metals lose electrons and nonmetals gain them. Iodine is a nonmetal.",
        "number": "Count again. How many electrons must change to reach a full outer level?",
        "valence": "That is the number of valence electrons, not the charge. Charge comes from how many electrons the atom gains or loses.",
        "sign": "Gaining electrons leaves more electrons than protons, so the charge is negative.",
        "size": "Check it with protons − electrons.",
        "general": "Not yet. Use a hint and try again."
      }
    }
  ],
  "ui": {
    "stepNames": [
      "Valence electrons",
      "Gain or lose",
      "Ion charge"
    ],
    "questions": [
      "How many valence electrons does this atom have?",
      "Does this atom lose or gain electrons, and how many?",
      "What charge does the ion form?"
    ],
    "check": "Check answer",
    "hint": "Hint",
    "hint2": "Another hint",
    "hintsDone": "Both hints shown",
    "show": "Show me",
    "next": "Next element",
    "correct": "✓ Correct. ",
    "wrong": "↻ Not yet. ",
    "revealed": "→ Answer shown. ",
    "missing": "Choose an answer first.",
    "missing2": "Choose Lose or Gain and the number of electrons.",
    "lose": "Lose",
    "gain": "Gain",
    "count": "How many electrons?",
    "complete": "Element complete",
    "reviewComplete": "Review complete",
    "roundComplete": "Round complete",
    "firstTry": "First-try correct on original elements",
    "review": "Keep practicing",
    "none": "You completed every original step on the first try.",
    "again": "Practice again",
    "misses": "Practice my misses",
    "reviewLabel": "Review",
    "singleLabel": "Chosen element",
    "elementLabel": "Element",
    "of": "of",
    "stepLabel": "Step",
    "reviewNote": "Review items may extend this round by up to 3 elements.",
    "nextReview": "Review element",
    "all": "Mixed practice",
    "start": "Start a new round",
    "select": "Choose an element",
    "specific": "Practice this element",
    "summaryIntro": "Use the change in electrons to explain the charge.",
    "singleDone": "Chosen element complete",
    "hintPrefix": "Hint: ",
    "repeatNote": "Review items do not change the first-try counts.",
    "previewNote": "Finish the current round or choose a new practice mode below."
  },
  "atomicLabel": "Atomic number",
  "tableCaption": "Main-group elements by group (column) and period (row)",
  "periodLabel": "Period",
  "finishLabel": "See round summary",
  "groups": [
    1,
    2,
    13,
    14,
    15,
    16,
    17,
    18
  ],
  "table": [
    [
      "H",
      "",
      "",
      "",
      "",
      "",
      "",
      "He"
    ],
    [
      "Li",
      "Be",
      "B",
      "C",
      "N",
      "O",
      "F",
      "Ne"
    ],
    [
      "Na",
      "Mg",
      "Al",
      "Si",
      "P",
      "S",
      "Cl",
      "Ar"
    ],
    [
      "K",
      "Ca",
      "Ga",
      "Ge",
      "As",
      "Se",
      "Br",
      "Kr"
    ],
    [
      "Rb",
      "Sr",
      "In",
      "Sn",
      "Sb",
      "Te",
      "I",
      "Xe"
    ],
    [
      "Cs",
      "Ba",
      "Tl",
      "Pb",
      "Bi",
      "Po",
      "At",
      "Rn"
    ]
  ]
};
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(data); }, {once: true});
}());
