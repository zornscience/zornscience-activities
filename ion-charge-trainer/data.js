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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Lithium is a metal. It has 3 protons and loses 1 electron, so the ion has 2 electrons. Which noble gas also has 2?"
        ]
      ],
      "correct": [
        "Lithium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Lithium loses 1 electron. Its remaining first energy level is full with 2 electrons, like helium.",
        "3 protons − 2 electrons = 1+.",
        "Lithium ion has 2 electrons, the same as helium. Losing its one valence electron leaves only its full first energy level."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Lithium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "lithide",
      "trapGas": "neon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Sodium is a metal. It has 11 protons and loses 1 electron, so the ion has 10 electrons. Which noble gas also has 10?"
        ]
      ],
      "correct": [
        "Sodium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Sodium loses 1 electron to reach a full outer level.",
        "11 protons − 10 electrons = 1+.",
        "Sodium ion has 10 electrons, the same as neon. It lost its whole outer level, so it matches neon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Sodium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "sodide",
      "trapGas": "argon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Potassium is a metal. It has 19 protons and loses 1 electron, so the ion has 18 electrons. Which noble gas also has 18?"
        ]
      ],
      "correct": [
        "Potassium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Potassium loses 1 electron to reach a full outer level.",
        "19 protons − 18 electrons = 1+.",
        "Potassium ion has 18 electrons, the same as argon. It lost its whole outer level, so it matches argon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Potassium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "potasside",
      "trapGas": "krypton"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Rubidium is a metal. It has 37 protons and loses 1 electron, so the ion has 36 electrons. Which noble gas also has 36?"
        ]
      ],
      "correct": [
        "Rubidium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Rubidium loses 1 electron to reach a full outer level.",
        "37 protons − 36 electrons = 1+.",
        "Rubidium ion has 36 electrons, the same as krypton. It lost its whole outer level, so it matches krypton, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Rubidium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "rubidide",
      "trapGas": "xenon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Cesium is a metal. It has 55 protons and loses 1 electron, so the ion has 54 electrons. Which noble gas also has 54?"
        ]
      ],
      "correct": [
        "Cesium has 1 valence electron. For groups 1 and 2, the group number is the number of valence electrons.",
        "Cesium loses 1 electron to reach a full outer level.",
        "55 protons − 54 electrons = 1+.",
        "Cesium ion has 54 electrons, the same as xenon. It lost its whole outer level, so it matches xenon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Cesium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "ceside",
      "trapGas": "radon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Magnesium is a metal. It has 12 protons and loses 2 electrons, so the ion has 10 electrons. Which noble gas also has 10?"
        ]
      ],
      "correct": [
        "Magnesium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Magnesium loses 2 electrons to reach a full outer level.",
        "12 protons − 10 electrons = 2+.",
        "Magnesium ion has 10 electrons, the same as neon. It lost its whole outer level, so it matches neon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Magnesium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "magneside",
      "trapGas": "argon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Calcium is a metal. It has 20 protons and loses 2 electrons, so the ion has 18 electrons. Which noble gas also has 18?"
        ]
      ],
      "correct": [
        "Calcium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Calcium loses 2 electrons to reach a full outer level.",
        "20 protons − 18 electrons = 2+.",
        "Calcium ion has 18 electrons, the same as argon. It lost its whole outer level, so it matches argon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Calcium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "calcide",
      "trapGas": "krypton"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Strontium is a metal. It has 38 protons and loses 2 electrons, so the ion has 36 electrons. Which noble gas also has 36?"
        ]
      ],
      "correct": [
        "Strontium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Strontium loses 2 electrons to reach a full outer level.",
        "38 protons − 36 electrons = 2+.",
        "Strontium ion has 36 electrons, the same as krypton. It lost its whole outer level, so it matches krypton, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Strontium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "strontide",
      "trapGas": "xenon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Barium is a metal. It has 56 protons and loses 2 electrons, so the ion has 54 electrons. Which noble gas also has 54?"
        ]
      ],
      "correct": [
        "Barium has 2 valence electrons. For groups 1 and 2, the group number is the number of valence electrons.",
        "Barium loses 2 electrons to reach a full outer level.",
        "56 protons − 54 electrons = 2+.",
        "Barium ion has 54 electrons, the same as xenon. It lost its whole outer level, so it matches xenon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Barium lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "baride",
      "trapGas": "radon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Aluminum is a metal. It has 13 protons and loses 3 electrons, so the ion has 10 electrons. Which noble gas also has 10?"
        ]
      ],
      "correct": [
        "Aluminum has 3 valence electrons. For groups 13 to 18, use the last digit.",
        "Aluminum loses 3 electrons to reach a full outer level.",
        "13 protons − 10 electrons = 3+.",
        "Aluminum ion has 10 electrons, the same as neon. It lost its whole outer level, so it matches neon, the noble gas from the period before."
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
        "general": "Use a hint and try again.",
        "nameRule": "Only negative ions get the ‑ide ending. A metal ion keeps the element's name and adds the word ion.",
        "trapGas": "Aluminum lost its whole outer level, so it does not match the noble gas in its own period. Count the ion's electrons.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "aluminide",
      "trapGas": "argon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Nitrogen is a nonmetal. It has 7 protons and gains 3 electrons, so the ion has 10 electrons. Which noble gas also has 10?"
        ]
      ],
      "correct": [
        "Nitrogen has 5 valence electrons. For groups 13 to 18, use the last digit.",
        "Nitrogen gains 3 electrons to reach a full outer level.",
        "7 protons − 10 electrons = 3−.",
        "Nitride has 10 electrons, the same as neon. It filled its own outer level, so it matches neon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Nitrogen gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "nitrogen ion",
      "trapGas": "helium"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Phosphorus is a nonmetal. It has 15 protons and gains 3 electrons, so the ion has 18 electrons. Which noble gas also has 18?"
        ]
      ],
      "correct": [
        "Phosphorus has 5 valence electrons. For groups 13 to 18, use the last digit.",
        "Phosphorus gains 3 electrons to reach a full outer level.",
        "15 protons − 18 electrons = 3−.",
        "Phosphide has 18 electrons, the same as argon. It filled its own outer level, so it matches argon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Phosphorus gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "phosphorus ion",
      "trapGas": "neon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Oxygen is a nonmetal. It has 8 protons and gains 2 electrons, so the ion has 10 electrons. Which noble gas also has 10?"
        ]
      ],
      "correct": [
        "Oxygen has 6 valence electrons. For groups 13 to 18, use the last digit.",
        "Oxygen gains 2 electrons to reach a full outer level.",
        "8 protons − 10 electrons = 2−.",
        "Oxide has 10 electrons, the same as neon. It filled its own outer level, so it matches neon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Oxygen gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "oxygen ion",
      "trapGas": "helium"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Sulfur is a nonmetal. It has 16 protons and gains 2 electrons, so the ion has 18 electrons. Which noble gas also has 18?"
        ]
      ],
      "correct": [
        "Sulfur has 6 valence electrons. For groups 13 to 18, use the last digit.",
        "Sulfur gains 2 electrons to reach a full outer level.",
        "16 protons − 18 electrons = 2−.",
        "Sulfide has 18 electrons, the same as argon. It filled its own outer level, so it matches argon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Sulfur gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "sulfur ion",
      "trapGas": "neon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Selenium is a nonmetal. It has 34 protons and gains 2 electrons, so the ion has 36 electrons. Which noble gas also has 36?"
        ]
      ],
      "correct": [
        "Selenium has 6 valence electrons. For groups 13 to 18, use the last digit.",
        "Selenium gains 2 electrons to reach a full outer level.",
        "34 protons − 36 electrons = 2−.",
        "Selenide has 36 electrons, the same as krypton. It filled its own outer level, so it matches krypton, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Selenium gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "selenium ion",
      "trapGas": "argon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Fluorine is a nonmetal. It has 9 protons and gains 1 electron, so the ion has 10 electrons. Which noble gas also has 10?"
        ]
      ],
      "correct": [
        "Fluorine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Fluorine gains 1 electron to reach a full outer level.",
        "9 protons − 10 electrons = 1−.",
        "Fluoride has 10 electrons, the same as neon. It filled its own outer level, so it matches neon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Fluorine gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "fluorine ion",
      "trapGas": "helium"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Chlorine is a nonmetal. It has 17 protons and gains 1 electron, so the ion has 18 electrons. Which noble gas also has 18?"
        ]
      ],
      "correct": [
        "Chlorine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Chlorine gains 1 electron to reach a full outer level.",
        "17 protons − 18 electrons = 1−.",
        "Chloride has 18 electrons, the same as argon. It filled its own outer level, so it matches argon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Chlorine gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "chlorine ion",
      "trapGas": "neon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Bromine is a nonmetal. It has 35 protons and gains 1 electron, so the ion has 36 electrons. Which noble gas also has 36?"
        ]
      ],
      "correct": [
        "Bromine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Bromine gains 1 electron to reach a full outer level.",
        "35 protons − 36 electrons = 1−.",
        "Bromide has 36 electrons, the same as krypton. It filled its own outer level, so it matches krypton, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Bromine gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "bromine ion",
      "trapGas": "argon"
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
        ],
        [
          "Metal ions keep the element's name and add the word ion. Nonmetal ions change the ending to ‑ide. For the noble gas, count the ion's electrons.",
          "Iodine is a nonmetal. It has 53 protons and gains 1 electron, so the ion has 54 electrons. Which noble gas also has 54?"
        ]
      ],
      "correct": [
        "Iodine has 7 valence electrons. For groups 13 to 18, use the last digit.",
        "Iodine gains 1 electron to reach a full outer level.",
        "53 protons − 54 electrons = 1−.",
        "Iodide has 54 electrons, the same as xenon. It filled its own outer level, so it matches xenon, the noble gas at the end of its period."
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
        "general": "Use a hint and try again.",
        "nameRule": "A negative ion made from one nonmetal changes its ending to ‑ide.",
        "trapGas": "Iodine gained electrons to fill its own outer level, so it matches the noble gas at the end of its own period, not the one before.",
        "gasCount": "Count the ion's electrons, protons minus the charge, then find the noble gas with that many."
      },
      "nameWrong": "iodine ion",
      "trapGas": "krypton"
    }
  ],
  "ui": {
    "stepNames": [
      "Valence electrons",
      "Gain or lose",
      "Ion charge",
      "Name the ion"
    ],
    "questions": [
      "How many valence electrons does this atom have?",
      "Does this atom lose or gain electrons, and how many?",
      "What charge does the ion form?",
      "Name the ion and the noble gas with the same number of electrons."
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
    "previewNote": "Finish the current round or choose a new practice mode below.",
    "nameLegend": "Ion name",
    "gasLegend": "Same number of electrons as",
    "missing4": "Choose an ion name and a noble gas.",
    "namingOption": "Include step 4: name the ion and match its noble gas",
    "namingNote": "Changes apply from the next element.",
    "valenceOne": "valence electron",
    "valenceMany": "valence electrons",
    "loses": "Loses",
    "gains": "Gains",
    "chargeWord": "Charge",
    "likeWord": "like",
    "trailLabel": "Your answers so far",
    "correctMark": "Correct: ",
    "shownMark": "Shown: ",
    "currentMark": " (this element)",
    "hintMark": " (hint)",
    "triedMark": " (tried, not correct)"
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
  ],
  "gases": [
    "helium",
    "neon",
    "argon",
    "krypton",
    "xenon"
  ]
};
  var i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  if (i18n) {
    i18n.configure({title:"Predicting Ion Charge Trainer", es:{
  "Activity tools": "Herramientas de la actividad",
  "Close": "Cerrar",
  "Close instructions": "Cerrar instrucciones",
  "Close share options": "Cerrar opciones para compartir",
  "Copy link": "Copiar enlace",
  "Email": "Correo electrónico",
  "Instructions": "Instrucciones",
  "Share": "Compartir",
  "Share activity": "Compartir actividad",
  "Share link": "Enlace para compartir",
  "Share this activity": "Compartir esta actividad",
  "ZornScience home": "Inicio de ZornScience",
  "← Back to the lesson": "← Volver a la lección",
  "Link copied.": "Enlace copiado.",
  "Link selected. Copy it with Ctrl+C or Command+C.": "Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
  "Share a fresh activity. Your answers and experiment data are not included.": "Comparte una actividad nueva. No se incluyen tus respuestas ni los datos del experimento.",
  "Predicting Ion Charge Trainer": "Práctica de predicción de la carga de iones",
  "Practice options": "Opciones de práctica",
  "Element and periodic table": "Elemento y tabla periódica",
  "Ion practice": "Práctica de iones",
  "Main groups only. Transition metals are not shown.": "Solo grupos principales. No se muestran los metales de transición.",
  "Start a fresh mixed round or work on one element. Starting again clears this round.": "Inicia una ronda mixta nueva o trabaja con un elemento. Al reiniciar se borra esta ronda.",
  "Choose an answer for each step. Hint offers guidance; Show me explains an answer after two unsuccessful attempts.": "Elige una respuesta para cada paso. Pista te orienta; Muéstrame explica una respuesta después de dos intentos incorrectos.",
  "Finish a full mixed round to get a completion code. Practice options lets you start a new round or choose one element.": "Termina una ronda mixta completa para obtener un código de finalización. Opciones de práctica te permite iniciar una ronda nueva o elegir un elemento.",
  "Use the highlighted element and periodic table to predict valence electrons, electron transfer, and ion charge.": "Usa el elemento resaltado y la tabla periódica para predecir los electrones de valencia, la transferencia de electrones y la carga del ion.",
  "Start a new round": "Iniciar una ronda nueva",
  "Choose an element": "Elige un elemento",
  "Practice this element": "Practicar este elemento",
  "Include step 4: name the ion and match its noble gas": "Incluir el paso 4: nombrar el ion y relacionarlo con su gas noble",
  "Changes apply from the next element.": "Los cambios se aplican a partir del siguiente elemento."
}});
    if (i18n.lang === "es") data = {
  "elements": [
    {
      "name": "litio",
      "symbol": "Li",
      "z": 3,
      "group": 1,
      "period": 2,
      "valence": 1,
      "charge": 1,
      "ion": "ion de litio",
      "gas": "helio",
      "electrons": 2,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "ion de litio, carga 1 positiva",
      "summary": "Litio pierde 1 electrón. 3 protones − 2 electrones = 1+. El ion es un catión y es isoelectrónico con helio.",
      "reminder": "El litio pierde 1 electrón. Su primer nivel de energía queda lleno con 2 electrones, como el helio.",
      "hints": [
        [
          "Busca litio en la tabla periódica. ¿En qué grupo o columna está?",
          "Litio está en el grupo 1. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Litio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "El litio pierde 1 electrón. Su primer nivel de energía queda lleno con 2 electrones, como el helio."
        ],
        [
          "Carga = protones − electrones.",
          "Litio tiene 3 protones. Después de perder 1, tiene 2 electrones. ¿Cuánto es 3 − 2?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Litio es un metal. Tiene 3 protones y pierde 1 electrón, así que el ion tiene 2 electrones. ¿Qué gas noble también tiene 2?"
        ]
      ],
      "correct": [
        "Litio tiene 1 electrón de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "El litio pierde 1 electrón. Su primer nivel de energía queda lleno con 2 electrones, como el helio.",
        "3 protones − 2 electrones = 1+.",
        "El ion de litio tiene 2 electrones, igual que el helio. Al perder su único electrón de valencia, solo queda su primer nivel de energía lleno."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de litio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que litio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de litio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ganar 7 es el camino largo. El litio es un átomo pequeño y su primer nivel de energía solo admite 2 electrones. ¿Qué cambio deja ese nivel pequeño como un nivel externo lleno?",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Litio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Litio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "litiouro",
      "trapGas": "neón"
    },
    {
      "name": "sodio",
      "symbol": "Na",
      "z": 11,
      "group": 1,
      "period": 3,
      "valence": 1,
      "charge": 1,
      "ion": "ion de sodio",
      "gas": "neón",
      "electrons": 10,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "ion de sodio, carga 1 positiva",
      "summary": "Sodio pierde 1 electrón. 11 protones − 10 electrones = 1+. El ion es un catión y es isoelectrónico con neón.",
      "reminder": "Sodio pierde 1 electrón y forma un ion de carga 1+.",
      "hints": [
        [
          "Busca sodio en la tabla periódica. ¿En qué grupo o columna está?",
          "Sodio está en el grupo 1. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Sodio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Sodio tiene 1 electrón de valencia. ¿Qué es menos: perder 1 o ganar 7?"
        ],
        [
          "Carga = protones − electrones.",
          "Sodio tiene 11 protones. Después de perder 1, tiene 10 electrones. ¿Cuánto es 11 − 10?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Sodio es un metal. Tiene 11 protones y pierde 1 electrón, así que el ion tiene 10 electrones. ¿Qué gas noble también tiene 10?"
        ]
      ],
      "correct": [
        "Sodio tiene 1 electrón de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Sodio pierde 1 electrón para alcanzar un nivel externo lleno.",
        "11 protones − 10 electrones = 1+.",
        "Ion de sodio tiene 10 electrones, igual que neón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de sodio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que sodio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de sodio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Sodio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Sodio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "sodiouro",
      "trapGas": "argón"
    },
    {
      "name": "potasio",
      "symbol": "K",
      "z": 19,
      "group": 1,
      "period": 4,
      "valence": 1,
      "charge": 1,
      "ion": "ion de potasio",
      "gas": "argón",
      "electrons": 18,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "ion de potasio, carga 1 positiva",
      "summary": "Potasio pierde 1 electrón. 19 protones − 18 electrones = 1+. El ion es un catión y es isoelectrónico con argón.",
      "reminder": "Potasio pierde 1 electrón y forma un ion de carga 1+.",
      "hints": [
        [
          "Busca potasio en la tabla periódica. ¿En qué grupo o columna está?",
          "Potasio está en el grupo 1. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Potasio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Potasio tiene 1 electrón de valencia. ¿Qué es menos: perder 1 o ganar 7?"
        ],
        [
          "Carga = protones − electrones.",
          "Potasio tiene 19 protones. Después de perder 1, tiene 18 electrones. ¿Cuánto es 19 − 18?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Potasio es un metal. Tiene 19 protones y pierde 1 electrón, así que el ion tiene 18 electrones. ¿Qué gas noble también tiene 18?"
        ]
      ],
      "correct": [
        "Potasio tiene 1 electrón de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Potasio pierde 1 electrón para alcanzar un nivel externo lleno.",
        "19 protones − 18 electrones = 1+.",
        "Ion de potasio tiene 18 electrones, igual que argón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de potasio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que potasio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de potasio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Potasio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Potasio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "potasiouro",
      "trapGas": "kriptón"
    },
    {
      "name": "rubidio",
      "symbol": "Rb",
      "z": 37,
      "group": 1,
      "period": 5,
      "valence": 1,
      "charge": 1,
      "ion": "ion de rubidio",
      "gas": "kriptón",
      "electrons": 36,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "ion de rubidio, carga 1 positiva",
      "summary": "Rubidio pierde 1 electrón. 37 protones − 36 electrones = 1+. El ion es un catión y es isoelectrónico con kriptón.",
      "reminder": "Rubidio pierde 1 electrón y forma un ion de carga 1+.",
      "hints": [
        [
          "Busca rubidio en la tabla periódica. ¿En qué grupo o columna está?",
          "Rubidio está en el grupo 1. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Rubidio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Rubidio tiene 1 electrón de valencia. ¿Qué es menos: perder 1 o ganar 7?"
        ],
        [
          "Carga = protones − electrones.",
          "Rubidio tiene 37 protones. Después de perder 1, tiene 36 electrones. ¿Cuánto es 37 − 36?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Rubidio es un metal. Tiene 37 protones y pierde 1 electrón, así que el ion tiene 36 electrones. ¿Qué gas noble también tiene 36?"
        ]
      ],
      "correct": [
        "Rubidio tiene 1 electrón de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Rubidio pierde 1 electrón para alcanzar un nivel externo lleno.",
        "37 protones − 36 electrones = 1+.",
        "Ion de rubidio tiene 36 electrones, igual que kriptón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de rubidio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que rubidio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de rubidio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Rubidio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Rubidio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "rubidiouro",
      "trapGas": "xenón"
    },
    {
      "name": "cesio",
      "symbol": "Cs",
      "z": 55,
      "group": 1,
      "period": 6,
      "valence": 1,
      "charge": 1,
      "ion": "ion de cesio",
      "gas": "xenón",
      "electrons": 54,
      "direction": "loses",
      "moved": 1,
      "metal": "metal",
      "chargeLabel": "1+",
      "spoken": "ion de cesio, carga 1 positiva",
      "summary": "Cesio pierde 1 electrón. 55 protones − 54 electrones = 1+. El ion es un catión y es isoelectrónico con xenón.",
      "reminder": "Cesio pierde 1 electrón y forma un ion de carga 1+.",
      "hints": [
        [
          "Busca cesio en la tabla periódica. ¿En qué grupo o columna está?",
          "Cesio está en el grupo 1. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Cesio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Cesio tiene 1 electrón de valencia. ¿Qué es menos: perder 1 o ganar 7?"
        ],
        [
          "Carga = protones − electrones.",
          "Cesio tiene 55 protones. Después de perder 1, tiene 54 electrones. ¿Cuánto es 55 − 54?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Cesio es un metal. Tiene 55 protones y pierde 1 electrón, así que el ion tiene 54 electrones. ¿Qué gas noble también tiene 54?"
        ]
      ],
      "correct": [
        "Cesio tiene 1 electrón de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Cesio pierde 1 electrón para alcanzar un nivel externo lleno.",
        "55 protones − 54 electrones = 1+.",
        "Ion de cesio tiene 54 electrones, igual que xenón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de cesio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que cesio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de cesio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Cesio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Cesio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "cesiouro",
      "trapGas": "radón"
    },
    {
      "name": "magnesio",
      "symbol": "Mg",
      "z": 12,
      "group": 2,
      "period": 3,
      "valence": 2,
      "charge": 2,
      "ion": "ion de magnesio",
      "gas": "neón",
      "electrons": 10,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "ion de magnesio, carga 2 positiva",
      "summary": "Magnesio pierde 2 electrones. 12 protones − 10 electrones = 2+. El ion es un catión y es isoelectrónico con neón.",
      "reminder": "Magnesio pierde 2 electrones y forma un ion de carga 2+.",
      "hints": [
        [
          "Busca magnesio en la tabla periódica. ¿En qué grupo o columna está?",
          "Magnesio está en el grupo 2. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Magnesio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Magnesio tiene 2 electrones de valencia. ¿Qué es menos: perder 2 o ganar 6?"
        ],
        [
          "Carga = protones − electrones.",
          "Magnesio tiene 12 protones. Después de perder 2, tiene 10 electrones. ¿Cuánto es 12 − 10?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Magnesio es un metal. Tiene 12 protones y pierde 2 electrones, así que el ion tiene 10 electrones. ¿Qué gas noble también tiene 10?"
        ]
      ],
      "correct": [
        "Magnesio tiene 2 electrones de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Magnesio pierde 2 electrones para alcanzar un nivel externo lleno.",
        "12 protones − 10 electrones = 2+.",
        "Ion de magnesio tiene 10 electrones, igual que neón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de magnesio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que magnesio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de magnesio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Magnesio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Magnesio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "magnesiouro",
      "trapGas": "argón"
    },
    {
      "name": "calcio",
      "symbol": "Ca",
      "z": 20,
      "group": 2,
      "period": 4,
      "valence": 2,
      "charge": 2,
      "ion": "ion de calcio",
      "gas": "argón",
      "electrons": 18,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "ion de calcio, carga 2 positiva",
      "summary": "Calcio pierde 2 electrones. 20 protones − 18 electrones = 2+. El ion es un catión y es isoelectrónico con argón.",
      "reminder": "Calcio pierde 2 electrones y forma un ion de carga 2+.",
      "hints": [
        [
          "Busca calcio en la tabla periódica. ¿En qué grupo o columna está?",
          "Calcio está en el grupo 2. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Calcio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Calcio tiene 2 electrones de valencia. ¿Qué es menos: perder 2 o ganar 6?"
        ],
        [
          "Carga = protones − electrones.",
          "Calcio tiene 20 protones. Después de perder 2, tiene 18 electrones. ¿Cuánto es 20 − 18?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Calcio es un metal. Tiene 20 protones y pierde 2 electrones, así que el ion tiene 18 electrones. ¿Qué gas noble también tiene 18?"
        ]
      ],
      "correct": [
        "Calcio tiene 2 electrones de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Calcio pierde 2 electrones para alcanzar un nivel externo lleno.",
        "20 protones − 18 electrones = 2+.",
        "Ion de calcio tiene 18 electrones, igual que argón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de calcio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que calcio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de calcio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Calcio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Calcio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "calciouro",
      "trapGas": "kriptón"
    },
    {
      "name": "estroncio",
      "symbol": "Sr",
      "z": 38,
      "group": 2,
      "period": 5,
      "valence": 2,
      "charge": 2,
      "ion": "ion de estroncio",
      "gas": "kriptón",
      "electrons": 36,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "ion de estroncio, carga 2 positiva",
      "summary": "Estroncio pierde 2 electrones. 38 protones − 36 electrones = 2+. El ion es un catión y es isoelectrónico con kriptón.",
      "reminder": "Estroncio pierde 2 electrones y forma un ion de carga 2+.",
      "hints": [
        [
          "Busca estroncio en la tabla periódica. ¿En qué grupo o columna está?",
          "Estroncio está en el grupo 2. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Estroncio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Estroncio tiene 2 electrones de valencia. ¿Qué es menos: perder 2 o ganar 6?"
        ],
        [
          "Carga = protones − electrones.",
          "Estroncio tiene 38 protones. Después de perder 2, tiene 36 electrones. ¿Cuánto es 38 − 36?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Estroncio es un metal. Tiene 38 protones y pierde 2 electrones, así que el ion tiene 36 electrones. ¿Qué gas noble también tiene 36?"
        ]
      ],
      "correct": [
        "Estroncio tiene 2 electrones de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Estroncio pierde 2 electrones para alcanzar un nivel externo lleno.",
        "38 protones − 36 electrones = 2+.",
        "Ion de estroncio tiene 36 electrones, igual que kriptón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de estroncio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que estroncio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de estroncio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Estroncio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Estroncio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "estronciouro",
      "trapGas": "xenón"
    },
    {
      "name": "bario",
      "symbol": "Ba",
      "z": 56,
      "group": 2,
      "period": 6,
      "valence": 2,
      "charge": 2,
      "ion": "ion de bario",
      "gas": "xenón",
      "electrons": 54,
      "direction": "loses",
      "moved": 2,
      "metal": "metal",
      "chargeLabel": "2+",
      "spoken": "ion de bario, carga 2 positiva",
      "summary": "Bario pierde 2 electrones. 56 protones − 54 electrones = 2+. El ion es un catión y es isoelectrónico con xenón.",
      "reminder": "Bario pierde 2 electrones y forma un ion de carga 2+.",
      "hints": [
        [
          "Busca bario en la tabla periódica. ¿En qué grupo o columna está?",
          "Bario está en el grupo 2. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia."
        ],
        [
          "¿Bario es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Bario tiene 2 electrones de valencia. ¿Qué es menos: perder 2 o ganar 6?"
        ],
        [
          "Carga = protones − electrones.",
          "Bario tiene 56 protones. Después de perder 2, tiene 54 electrones. ¿Cuánto es 56 − 54?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Bario es un metal. Tiene 56 protones y pierde 2 electrones, así que el ion tiene 54 electrones. ¿Qué gas noble también tiene 54?"
        ]
      ],
      "correct": [
        "Bario tiene 2 electrones de valencia. Para los grupos 1 y 2, el número de grupo indica los electrones de valencia.",
        "Bario pierde 2 electrones para alcanzar un nivel externo lleno.",
        "56 protones − 54 electrones = 2+.",
        "Ion de bario tiene 54 electrones, igual que xenón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de bario. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que bario necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de bario como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Bario es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Bario perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "bariouro",
      "trapGas": "radón"
    },
    {
      "name": "aluminio",
      "symbol": "Al",
      "z": 13,
      "group": 13,
      "period": 3,
      "valence": 3,
      "charge": 3,
      "ion": "ion de aluminio",
      "gas": "neón",
      "electrons": 10,
      "direction": "loses",
      "moved": 3,
      "metal": "metal",
      "chargeLabel": "3+",
      "spoken": "ion de aluminio, carga 3 positiva",
      "summary": "Aluminio pierde 3 electrones. 13 protones − 10 electrones = 3+. El ion es un catión y es isoelectrónico con neón.",
      "reminder": "Aluminio pierde 3 electrones y forma un ion de carga 3+.",
      "hints": [
        [
          "Busca aluminio en la tabla periódica. ¿En qué grupo o columna está?",
          "Aluminio está en el grupo 13. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Aluminio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Aluminio tiene 3 electrones de valencia. ¿Qué es menos: perder 3 o ganar 5?"
        ],
        [
          "Carga = protones − electrones.",
          "Aluminio tiene 13 protones. Después de perder 3, tiene 10 electrones. ¿Cuánto es 13 − 10?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Aluminio es un metal. Tiene 13 protones y pierde 3 electrones, así que el ion tiene 10 electrones. ¿Qué gas noble también tiene 10?"
        ]
      ],
      "correct": [
        "Aluminio tiene 3 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Aluminio pierde 3 electrones para alcanzar un nivel externo lleno.",
        "13 protones − 10 electrones = 3+.",
        "Ion de aluminio tiene 10 electrones, igual que neón. Perdió todo su nivel externo, así que coincide con el gas noble del periodo anterior."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de aluminio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que aluminio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de aluminio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Aluminio es un metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al perder electrones quedan más protones que electrones, así que la carga es positiva.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion metálico se nombra con ion de seguido del nombre del elemento. Solo los iones negativos cambian su terminación.",
        "trapGas": "Aluminio perdió todo su nivel externo, así que no coincide con el gas noble de su propio periodo. Cuenta los electrones del ion.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "aluminiouro",
      "trapGas": "argón"
    },
    {
      "name": "nitrógeno",
      "symbol": "N",
      "z": 7,
      "group": 15,
      "period": 2,
      "valence": 5,
      "charge": -3,
      "ion": "nitruro",
      "gas": "neón",
      "electrons": 10,
      "direction": "gains",
      "moved": 3,
      "metal": "nonmetal",
      "chargeLabel": "3−",
      "spoken": "nitruro, carga 3 negativa",
      "summary": "Nitrógeno gana 3 electrones. 7 protones − 10 electrones = 3−. El ion es un anión y es isoelectrónico con neón.",
      "reminder": "Nitrógeno gana 3 electrones y forma un ion de carga 3−.",
      "hints": [
        [
          "Busca nitrógeno en la tabla periódica. ¿En qué grupo o columna está?",
          "Nitrógeno está en el grupo 15. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Nitrógeno es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Nitrógeno tiene 5 electrones de valencia. ¿Qué es menos: perder 5 o ganar 3?"
        ],
        [
          "Carga = protones − electrones.",
          "Nitrógeno tiene 7 protones. Después de ganar 3, tiene 10 electrones. ¿Cuánto es 7 − 10?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Nitrógeno es un no metal. Tiene 7 protones y gana 3 electrones, así que el ion tiene 10 electrones. ¿Qué gas noble también tiene 10?"
        ]
      ],
      "correct": [
        "Nitrógeno tiene 5 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Nitrógeno gana 3 electrones para alcanzar un nivel externo lleno.",
        "7 protones − 10 electrones = 3−.",
        "Nitruro tiene 10 electrones, igual que neón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de nitrógeno. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que nitrógeno necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de nitrógeno como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Nitrógeno es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Nitrógeno ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de nitrógeno",
      "trapGas": "helio"
    },
    {
      "name": "fósforo",
      "symbol": "P",
      "z": 15,
      "group": 15,
      "period": 3,
      "valence": 5,
      "charge": -3,
      "ion": "fosfuro",
      "gas": "argón",
      "electrons": 18,
      "direction": "gains",
      "moved": 3,
      "metal": "nonmetal",
      "chargeLabel": "3−",
      "spoken": "fosfuro, carga 3 negativa",
      "summary": "Fósforo gana 3 electrones. 15 protones − 18 electrones = 3−. El ion es un anión y es isoelectrónico con argón.",
      "reminder": "Fósforo gana 3 electrones y forma un ion de carga 3−.",
      "hints": [
        [
          "Busca fósforo en la tabla periódica. ¿En qué grupo o columna está?",
          "Fósforo está en el grupo 15. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Fósforo es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Fósforo tiene 5 electrones de valencia. ¿Qué es menos: perder 5 o ganar 3?"
        ],
        [
          "Carga = protones − electrones.",
          "Fósforo tiene 15 protones. Después de ganar 3, tiene 18 electrones. ¿Cuánto es 15 − 18?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Fósforo es un no metal. Tiene 15 protones y gana 3 electrones, así que el ion tiene 18 electrones. ¿Qué gas noble también tiene 18?"
        ]
      ],
      "correct": [
        "Fósforo tiene 5 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Fósforo gana 3 electrones para alcanzar un nivel externo lleno.",
        "15 protones − 18 electrones = 3−.",
        "Fosfuro tiene 18 electrones, igual que argón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de fósforo. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que fósforo necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de fósforo como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Fósforo es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Fósforo ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de fósforo",
      "trapGas": "neón"
    },
    {
      "name": "oxígeno",
      "symbol": "O",
      "z": 8,
      "group": 16,
      "period": 2,
      "valence": 6,
      "charge": -2,
      "ion": "óxido",
      "gas": "neón",
      "electrons": 10,
      "direction": "gains",
      "moved": 2,
      "metal": "nonmetal",
      "chargeLabel": "2−",
      "spoken": "óxido, carga 2 negativa",
      "summary": "Oxígeno gana 2 electrones. 8 protones − 10 electrones = 2−. El ion es un anión y es isoelectrónico con neón.",
      "reminder": "Oxígeno gana 2 electrones y forma un ion de carga 2−.",
      "hints": [
        [
          "Busca oxígeno en la tabla periódica. ¿En qué grupo o columna está?",
          "Oxígeno está en el grupo 16. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Oxígeno es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Oxígeno tiene 6 electrones de valencia. ¿Qué es menos: perder 6 o ganar 2?"
        ],
        [
          "Carga = protones − electrones.",
          "Oxígeno tiene 8 protones. Después de ganar 2, tiene 10 electrones. ¿Cuánto es 8 − 10?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Oxígeno es un no metal. Tiene 8 protones y gana 2 electrones, así que el ion tiene 10 electrones. ¿Qué gas noble también tiene 10?"
        ]
      ],
      "correct": [
        "Oxígeno tiene 6 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Oxígeno gana 2 electrones para alcanzar un nivel externo lleno.",
        "8 protones − 10 electrones = 2−.",
        "Óxido tiene 10 electrones, igual que neón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de oxígeno. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que oxígeno necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de oxígeno como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Oxígeno es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Oxígeno ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de oxígeno",
      "trapGas": "helio"
    },
    {
      "name": "azufre",
      "symbol": "S",
      "z": 16,
      "group": 16,
      "period": 3,
      "valence": 6,
      "charge": -2,
      "ion": "sulfuro",
      "gas": "argón",
      "electrons": 18,
      "direction": "gains",
      "moved": 2,
      "metal": "nonmetal",
      "chargeLabel": "2−",
      "spoken": "sulfuro, carga 2 negativa",
      "summary": "Azufre gana 2 electrones. 16 protones − 18 electrones = 2−. El ion es un anión y es isoelectrónico con argón.",
      "reminder": "Azufre gana 2 electrones y forma un ion de carga 2−.",
      "hints": [
        [
          "Busca azufre en la tabla periódica. ¿En qué grupo o columna está?",
          "Azufre está en el grupo 16. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Azufre es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Azufre tiene 6 electrones de valencia. ¿Qué es menos: perder 6 o ganar 2?"
        ],
        [
          "Carga = protones − electrones.",
          "Azufre tiene 16 protones. Después de ganar 2, tiene 18 electrones. ¿Cuánto es 16 − 18?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Azufre es un no metal. Tiene 16 protones y gana 2 electrones, así que el ion tiene 18 electrones. ¿Qué gas noble también tiene 18?"
        ]
      ],
      "correct": [
        "Azufre tiene 6 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Azufre gana 2 electrones para alcanzar un nivel externo lleno.",
        "16 protones − 18 electrones = 2−.",
        "Sulfuro tiene 18 electrones, igual que argón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de azufre. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que azufre necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de azufre como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Azufre es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Azufre ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de azufre",
      "trapGas": "neón"
    },
    {
      "name": "selenio",
      "symbol": "Se",
      "z": 34,
      "group": 16,
      "period": 4,
      "valence": 6,
      "charge": -2,
      "ion": "seleniuro",
      "gas": "kriptón",
      "electrons": 36,
      "direction": "gains",
      "moved": 2,
      "metal": "nonmetal",
      "chargeLabel": "2−",
      "spoken": "seleniuro, carga 2 negativa",
      "summary": "Selenio gana 2 electrones. 34 protones − 36 electrones = 2−. El ion es un anión y es isoelectrónico con kriptón.",
      "reminder": "Selenio gana 2 electrones y forma un ion de carga 2−.",
      "hints": [
        [
          "Busca selenio en la tabla periódica. ¿En qué grupo o columna está?",
          "Selenio está en el grupo 16. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Selenio es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Selenio tiene 6 electrones de valencia. ¿Qué es menos: perder 6 o ganar 2?"
        ],
        [
          "Carga = protones − electrones.",
          "Selenio tiene 34 protones. Después de ganar 2, tiene 36 electrones. ¿Cuánto es 34 − 36?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Selenio es un no metal. Tiene 34 protones y gana 2 electrones, así que el ion tiene 36 electrones. ¿Qué gas noble también tiene 36?"
        ]
      ],
      "correct": [
        "Selenio tiene 6 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Selenio gana 2 electrones para alcanzar un nivel externo lleno.",
        "34 protones − 36 electrones = 2−.",
        "Seleniuro tiene 36 electrones, igual que kriptón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de selenio. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que selenio necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de selenio como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Selenio es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Selenio ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de selenio",
      "trapGas": "argón"
    },
    {
      "name": "flúor",
      "symbol": "F",
      "z": 9,
      "group": 17,
      "period": 2,
      "valence": 7,
      "charge": -1,
      "ion": "fluoruro",
      "gas": "neón",
      "electrons": 10,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "fluoruro, carga 1 negativa",
      "summary": "Flúor gana 1 electrón. 9 protones − 10 electrones = 1−. El ion es un anión y es isoelectrónico con neón.",
      "reminder": "Flúor gana 1 electrón y forma un ion de carga 1−.",
      "hints": [
        [
          "Busca flúor en la tabla periódica. ¿En qué grupo o columna está?",
          "Flúor está en el grupo 17. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Flúor es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Flúor tiene 7 electrones de valencia. ¿Qué es menos: perder 7 o ganar 1?"
        ],
        [
          "Carga = protones − electrones.",
          "Flúor tiene 9 protones. Después de ganar 1, tiene 10 electrones. ¿Cuánto es 9 − 10?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Flúor es un no metal. Tiene 9 protones y gana 1 electrón, así que el ion tiene 10 electrones. ¿Qué gas noble también tiene 10?"
        ]
      ],
      "correct": [
        "Flúor tiene 7 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Flúor gana 1 electrón para alcanzar un nivel externo lleno.",
        "9 protones − 10 electrones = 1−.",
        "Fluoruro tiene 10 electrones, igual que neón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de flúor. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que flúor necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de flúor como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Flúor es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Flúor ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de flúor",
      "trapGas": "helio"
    },
    {
      "name": "cloro",
      "symbol": "Cl",
      "z": 17,
      "group": 17,
      "period": 3,
      "valence": 7,
      "charge": -1,
      "ion": "cloruro",
      "gas": "argón",
      "electrons": 18,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "cloruro, carga 1 negativa",
      "summary": "Cloro gana 1 electrón. 17 protones − 18 electrones = 1−. El ion es un anión y es isoelectrónico con argón.",
      "reminder": "Cloro gana 1 electrón y forma un ion de carga 1−.",
      "hints": [
        [
          "Busca cloro en la tabla periódica. ¿En qué grupo o columna está?",
          "Cloro está en el grupo 17. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Cloro es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Cloro tiene 7 electrones de valencia. ¿Qué es menos: perder 7 o ganar 1?"
        ],
        [
          "Carga = protones − electrones.",
          "Cloro tiene 17 protones. Después de ganar 1, tiene 18 electrones. ¿Cuánto es 17 − 18?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Cloro es un no metal. Tiene 17 protones y gana 1 electrón, así que el ion tiene 18 electrones. ¿Qué gas noble también tiene 18?"
        ]
      ],
      "correct": [
        "Cloro tiene 7 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Cloro gana 1 electrón para alcanzar un nivel externo lleno.",
        "17 protones − 18 electrones = 1−.",
        "Cloruro tiene 18 electrones, igual que argón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de cloro. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que cloro necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de cloro como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Cloro es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Cloro ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de cloro",
      "trapGas": "neón"
    },
    {
      "name": "bromo",
      "symbol": "Br",
      "z": 35,
      "group": 17,
      "period": 4,
      "valence": 7,
      "charge": -1,
      "ion": "bromuro",
      "gas": "kriptón",
      "electrons": 36,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "bromuro, carga 1 negativa",
      "summary": "Bromo gana 1 electrón. 35 protones − 36 electrones = 1−. El ion es un anión y es isoelectrónico con kriptón.",
      "reminder": "Bromo gana 1 electrón y forma un ion de carga 1−.",
      "hints": [
        [
          "Busca bromo en la tabla periódica. ¿En qué grupo o columna está?",
          "Bromo está en el grupo 17. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Bromo es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Bromo tiene 7 electrones de valencia. ¿Qué es menos: perder 7 o ganar 1?"
        ],
        [
          "Carga = protones − electrones.",
          "Bromo tiene 35 protones. Después de ganar 1, tiene 36 electrones. ¿Cuánto es 35 − 36?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Bromo es un no metal. Tiene 35 protones y gana 1 electrón, así que el ion tiene 36 electrones. ¿Qué gas noble también tiene 36?"
        ]
      ],
      "correct": [
        "Bromo tiene 7 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Bromo gana 1 electrón para alcanzar un nivel externo lleno.",
        "35 protones − 36 electrones = 1−.",
        "Bromuro tiene 36 electrones, igual que kriptón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de bromo. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que bromo necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de bromo como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Bromo es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Bromo ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de bromo",
      "trapGas": "argón"
    },
    {
      "name": "yodo",
      "symbol": "I",
      "z": 53,
      "group": 17,
      "period": 5,
      "valence": 7,
      "charge": -1,
      "ion": "yoduro",
      "gas": "xenón",
      "electrons": 54,
      "direction": "gains",
      "moved": 1,
      "metal": "nonmetal",
      "chargeLabel": "1−",
      "spoken": "yoduro, carga 1 negativa",
      "summary": "Yodo gana 1 electrón. 53 protones − 54 electrones = 1−. El ion es un anión y es isoelectrónico con xenón.",
      "reminder": "Yodo gana 1 electrón y forma un ion de carga 1−.",
      "hints": [
        [
          "Busca yodo en la tabla periódica. ¿En qué grupo o columna está?",
          "Yodo está en el grupo 17. Para los grupos 13 a 18, usa el último dígito."
        ],
        [
          "¿Yodo es un metal o un no metal? Para estos iones comunes, los metales pierden electrones y los no metales los ganan.",
          "Yodo tiene 7 electrones de valencia. ¿Qué es menos: perder 7 o ganar 1?"
        ],
        [
          "Carga = protones − electrones.",
          "Yodo tiene 53 protones. Después de ganar 1, tiene 54 electrones. ¿Cuánto es 53 − 54?"
        ],
        [
          "Los iones metálicos usan ion de seguido del nombre del elemento. Los iones no metálicos cambian su terminación. Para el gas noble, cuenta los electrones del ion.",
          "Yodo es un no metal. Tiene 53 protones y gana 1 electrón, así que el ion tiene 54 electrones. ¿Qué gas noble también tiene 54?"
        ]
      ],
      "correct": [
        "Yodo tiene 7 electrones de valencia. Para los grupos 13 a 18, usa el último dígito.",
        "Yodo gana 1 electrón para alcanzar un nivel externo lleno.",
        "53 protones − 54 electrones = 1−.",
        "Yoduro tiene 54 electrones, igual que xenón. Llenó su propio nivel externo, así que coincide con el gas noble al final de su periodo."
      ],
      "feedback": {
        "period": "Ese es el periodo o fila de yodo. Los electrones de valencia se obtienen del grupo o columna.",
        "atomic": "Ese es el número total de electrones del átomo neutro. Solo los externos son electrones de valencia.",
        "complement": "Esa es la cantidad de electrones que yodo necesitaría para llegar a 8. La pregunta pide cuántos tiene ya en su nivel externo.",
        "combined": "Ese número es tanto el periodo de yodo como los electrones que necesita para llegar a 8. Usa su grupo o columna para saber cuántos tiene ya.",
        "long": "Ese es el camino largo en este modelo de predicción. Para estos iones comunes, usa el camino más corto a 8. Es un patrón, no una explicación completa de la formación de iones.",
        "direction": "Para estos iones comunes, los metales pierden electrones y los no metales los ganan. Yodo es un no metal.",
        "number": "Cuenta de nuevo. ¿Cuántos electrones deben cambiar para alcanzar un nivel externo lleno?",
        "valence": "Ese es el número de electrones de valencia, no la carga. La carga depende de cuántos electrones gana o pierde el átomo.",
        "sign": "Al ganar electrones quedan más electrones que protones, así que la carga es negativa.",
        "size": "Revisa con protones − electrones.",
        "general": "Usa una pista e inténtalo de nuevo.",
        "nameRule": "Un ion negativo formado por un solo no metal cambia su terminación.",
        "trapGas": "Yodo ganó electrones para llenar su propio nivel externo, así que coincide con el gas noble al final de su periodo, no con el anterior.",
        "gasCount": "Cuenta los electrones del ion, protones menos la carga, y busca el gas noble con esa cantidad."
      },
      "nameWrong": "ion de yodo",
      "trapGas": "kriptón"
    }
  ],
  "ui": {
    "stepNames": [
      "Electrones de valencia",
      "Ganancia o pérdida",
      "Carga del ion",
      "Nombre del ion"
    ],
    "questions": [
      "¿Cuántos electrones de valencia tiene este átomo?",
      "¿Este átomo pierde o gana electrones y cuántos?",
      "¿Qué carga tiene el ion que se forma?",
      "Nombra el ion y el gas noble con el mismo número de electrones."
    ],
    "check": "Revisar respuesta",
    "hint": "Pista",
    "hint2": "Otra pista",
    "hintsDone": "Ya se mostraron ambas pistas",
    "show": "Muéstrame",
    "next": "Siguiente elemento",
    "correct": "✓ Correcto. ",
    "wrong": "↻ Todavía no. ",
    "revealed": "→ Respuesta mostrada. ",
    "missing": "Primero elige una respuesta.",
    "missing2": "Elige Pierde o Gana y el número de electrones.",
    "lose": "Pierde",
    "gain": "Gana",
    "count": "¿Cuántos electrones?",
    "complete": "Elemento terminado",
    "reviewComplete": "Repaso terminado",
    "roundComplete": "Ronda terminada",
    "firstTry": "Respuestas correctas al primer intento en los elementos originales",
    "review": "Sigue practicando",
    "none": "Completaste cada paso original al primer intento.",
    "again": "Practicar de nuevo",
    "misses": "Practicar mis errores",
    "reviewLabel": "Repaso",
    "singleLabel": "Elemento elegido",
    "elementLabel": "Elemento",
    "of": "de",
    "stepLabel": "Paso",
    "reviewNote": "Los elementos de repaso pueden alargar esta ronda hasta 3 elementos.",
    "nextReview": "Elemento de repaso",
    "all": "Práctica mixta",
    "start": "Iniciar una ronda nueva",
    "select": "Elige un elemento",
    "specific": "Practicar este elemento",
    "summaryIntro": "Usa el cambio en los electrones para explicar la carga.",
    "singleDone": "Elemento elegido terminado",
    "hintPrefix": "Pista: ",
    "repeatNote": "Los elementos de repaso no cambian los conteos del primer intento.",
    "previewNote": "Termina la ronda actual o elige otro modo de práctica abajo.",
    "nameLegend": "Nombre del ion",
    "gasLegend": "Mismo número de electrones que",
    "missing4": "Elige el nombre de un ion y un gas noble.",
    "namingOption": "Incluir el paso 4: nombrar el ion y relacionarlo con su gas noble",
    "namingNote": "Los cambios se aplican a partir del siguiente elemento.",
    "valenceOne": "electrón de valencia",
    "valenceMany": "electrones de valencia",
    "loses": "Pierde",
    "gains": "Gana",
    "chargeWord": "Carga",
    "likeWord": "como",
    "trailLabel": "Tus respuestas hasta ahora",
    "correctMark": "Correcto: ",
    "shownMark": "Mostrado: ",
    "currentMark": " (este elemento)",
    "hintMark": " (pista)",
    "triedMark": " (intentado, incorrecto)",
    "general": "Usa una pista e inténtalo de nuevo.",
    "chargeMark": "carga del ion",
    "codeLabel": "Código de finalización",
    "copyCode": "Copiar código",
    "codeCopied": "Código copiado.",
    "codeReady": "Código de finalización listo.",
    "codeSelected": "El código está seleccionado. Presiona Ctrl+C, o Command+C en una Mac, para copiarlo.",
    "codeNote": "Pega este código en tu tarea de Google Classroom."
  },
  "atomicLabel": "Número atómico",
  "tableCaption": "Elementos de los grupos principales por grupo (columna) y periodo (fila)",
  "periodLabel": "Periodo",
  "finishLabel": "Ver resumen de la ronda",
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
  ],
  "gases": [
    "helio",
    "neón",
    "argón",
    "kriptón",
    "xenón"
  ]
};
  }
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(data); }, {once: true});
}());
