(function () {
  "use strict";
  // Original bilingual questions. Independent worked answers are in TESTING.md.
  var bank = {
  "topics": [
    {
      "id": "9.1",
      "title": {
        "en": "9.1 Introduction to Entropy",
        "es": "9.1 Introducción a la entropía"
      }
    },
    {
      "id": "9.2",
      "title": {
        "en": "9.2 Absolute Entropy and Entropy Change",
        "es": "9.2 Entropía absoluta y cambio de entropía"
      }
    },
    {
      "id": "9.3",
      "title": {
        "en": "9.3 Gibbs Free Energy and Thermodynamic Favorability",
        "es": "9.3 Energía libre de Gibbs y favorabilidad termodinámica"
      }
    },
    {
      "id": "9.4",
      "title": {
        "en": "9.4 Thermodynamic and Kinetic Control",
        "es": "9.4 Control termodinámico y control cinético"
      }
    },
    {
      "id": "9.5",
      "title": {
        "en": "9.5 Free Energy and Equilibrium",
        "es": "9.5 Energía libre y equilibrio"
      }
    },
    {
      "id": "9.6",
      "title": {
        "en": "9.6 Free Energy of Dissolution",
        "es": "9.6 Energía libre de disolución"
      }
    },
    {
      "id": "9.7",
      "title": {
        "en": "9.7 Coupled Reactions",
        "es": "9.7 Reacciones acopladas"
      }
    },
    {
      "id": "9.8",
      "title": {
        "en": "9.8 Galvanic (Voltaic) and Electrolytic Cells",
        "es": "9.8 Celdas galvánicas (voltaicas) y electrolíticas"
      }
    },
    {
      "id": "9.9",
      "title": {
        "en": "9.9 Cell Potential and Free Energy",
        "es": "9.9 Potencial de celda y energía libre"
      }
    },
    {
      "id": "9.10",
      "title": {
        "en": "9.10 Cell Potential Under Nonstandard Conditions",
        "es": "9.10 Potencial de celda en condiciones no estándar"
      }
    },
    {
      "id": "9.11",
      "title": {
        "en": "9.11 Electrolysis and Faraday's Law",
        "es": "9.11 Electrólisis y ley de Faraday"
      }
    }
  ],
  "questions": [
    {
      "id": "9.1-1",
      "topic": "9.1",
      "type": "mc",
      "prompt": {
        "en": "For water vaporization at a fixed temperature, which sign of ΔS is expected?",
        "es": "Para la vaporización del agua a temperatura fija, ¿qué signo de ΔS se espera?"
      },
      "explanation": {
        "en": "H<sub>2</sub>O(l) → H<sub>2</sub>O(g) opens many more accessible molecular arrangements. The entropy change has a + sign.",
        "es": "H<sub>2</sub>O(l) → H<sub>2</sub>O(g) permite muchas más distribuciones moleculares accesibles. El cambio de entropía tiene signo +."
      },
      "choices": [
        {
          "text": {
            "en": "ΔS is always zero for a phase change.",
            "es": "ΔS siempre es cero en un cambio de fase."
          },
          "why": {
            "en": "A phase change alters accessible microstates even when the temperature stays fixed.",
            "es": "Un cambio de fase altera los microestados accesibles aunque la temperatura permanezca fija."
          }
        },
        {
          "text": {
            "en": "The sign follows only from whether water is an element.",
            "es": "El signo depende solo de si el agua es un elemento."
          },
          "why": {
            "en": "The entropy change depends on the initial and final phases, not on classifying a substance as an element.",
            "es": "El cambio de entropía depende de las fases inicial y final, no de clasificar una sustancia como elemento."
          }
        },
        {
          "text": {
            "en": "ΔS: +",
            "es": "ΔS: +"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ΔS: −",
            "es": "ΔS: −"
          },
          "why": {
            "en": "Gas molecules have more accessible arrangements than the liquid, not fewer.",
            "es": "Las moléculas gaseosas tienen más distribuciones accesibles que el líquido, no menos."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.1-2",
      "topic": "9.1",
      "type": "mc",
      "prompt": {
        "en": "For N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), which entropy-change sign is most plausible?",
        "es": "Para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), ¿qué signo del cambio de entropía es más probable?"
      },
      "explanation": {
        "en": "The gas amount decreases from 4 mol to 2 mol per mole of reaction. Fewer gas particles usually mean fewer accessible arrangements, so ΔS is −.",
        "es": "La cantidad de gas disminuye de 4 mol a 2 mol por mol de reacción. Menos partículas gaseosas suelen implicar menos distribuciones accesibles, así que ΔS es −."
      },
      "choices": [
        {
          "text": {
            "en": "The sign is fixed by the reaction rate.",
            "es": "El signo está determinado por la velocidad de reacción."
          },
          "why": {
            "en": "Kinetics does not determine the entropy difference between the states.",
            "es": "La cinética no determina la diferencia de entropía entre los estados."
          }
        },
        {
          "text": {
            "en": "ΔS: −",
            "es": "ΔS: −"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ΔS: +",
            "es": "ΔS: +"
          },
          "why": {
            "en": "The gas amount falls rather than rises.",
            "es": "La cantidad de gas disminuye en lugar de aumentar."
          }
        },
        {
          "text": {
            "en": "ΔS must be zero because atoms are conserved.",
            "es": "ΔS debe ser cero porque se conservan los átomos."
          },
          "why": {
            "en": "Atom conservation does not require unchanged entropy.",
            "es": "La conservación de átomos no requiere que la entropía no cambie."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.1-3",
      "topic": "9.1",
      "type": "mc",
      "prompt": {
        "en": "A sample is heated while remaining in one phase. Why does its entropy generally increase?",
        "es": "Se calienta una muestra mientras permanece en una fase. ¿Por qué suele aumentar su entropía?"
      },
      "explanation": {
        "en": "Higher temperature makes more energy microstates accessible to the same sample. Entropy is related to the number of accessible microstates.",
        "es": "Una mayor temperatura permite que la misma muestra acceda a más microestados de energía. La entropía se relaciona con el número de microestados accesibles."
      },
      "choices": [
        {
          "text": {
            "en": "More energy microstates become accessible.",
            "es": "Se vuelven accesibles más microestados de energía."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Heating destroys particles.",
            "es": "Calentar destruye partículas."
          },
          "why": {
            "en": "The sample can gain entropy without changing its particle count.",
            "es": "La muestra puede ganar entropía sin cambiar su número de partículas."
          }
        },
        {
          "text": {
            "en": "Higher temperature always makes entropy zero.",
            "es": "Una mayor temperatura siempre hace que la entropía sea cero."
          },
          "why": {
            "en": "Zero entropy is the ideal perfect-crystal limit at 0 K, not the result of heating.",
            "es": "La entropía cero es el límite ideal de un cristal perfecto a 0 K, no el resultado de calentar."
          }
        },
        {
          "text": {
            "en": "Entropy is the same thing as reaction speed.",
            "es": "La entropía es lo mismo que la velocidad de reacción."
          },
          "why": {
            "en": "Entropy describes accessible states, while reaction speed belongs to kinetics.",
            "es": "La entropía describe estados accesibles, mientras que la velocidad de reacción corresponde a la cinética."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.1-4",
      "topic": "9.1",
      "type": "mc",
      "prompt": {
        "en": "An ideal gas expands isothermally into a larger available volume. What happens to its entropy?",
        "es": "Un gas ideal se expande isotérmicamente hacia un mayor volumen disponible. ¿Qué ocurre con su entropía?"
      },
      "explanation": {
        "en": "At the same temperature, more volume provides more possible particle positions. The entropy increases.",
        "es": "A la misma temperatura, un mayor volumen proporciona más posiciones posibles para las partículas. La entropía aumenta."
      },
      "choices": [
        {
          "text": {
            "en": "It decreases because particles are farther apart.",
            "es": "Disminuye porque las partículas están más separadas."
          },
          "why": {
            "en": "The greater number of available positions increases entropy.",
            "es": "El mayor número de posiciones disponibles aumenta la entropía."
          }
        },
        {
          "text": {
            "en": "It must stay constant because temperature stays constant.",
            "es": "Debe permanecer constante porque la temperatura no cambia."
          },
          "why": {
            "en": "Entropy depends on available volume as well as temperature.",
            "es": "La entropía depende del volumen disponible además de la temperatura."
          }
        },
        {
          "text": {
            "en": "It becomes negative absolute entropy.",
            "es": "Se convierte en una entropía absoluta negativa."
          },
          "why": {
            "en": "A decrease or increase in entropy is different from assigning a negative absolute entropy.",
            "es": "Una disminución o un aumento de entropía es distinto de asignar una entropía absoluta negativa."
          }
        },
        {
          "text": {
            "en": "It increases.",
            "es": "Aumenta."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.1-5",
      "topic": "9.1",
      "type": "numeric",
      "prompt": {
        "en": "For H<sub>2</sub>O(l) → H<sub>2</sub>O(g), use S°(liquid) = 69.9 and S°(gas) = 188.8 J/(mol·K). Calculate ΔS° in J/(mol·K).",
        "es": "Para H<sub>2</sub>O(l) → H<sub>2</sub>O(g), usa S°(líquido) = 69.9 y S°(gas) = 188.8 J/(mol·K). Calcula ΔS° en J/(mol·K)."
      },
      "explanation": {
        "en": "Products minus reactants gives ΔS° = 188.8 − 69.9 = +118.9 J/(mol·K). Vaporization increases accessible arrangements. Required sign: +. The opposite sign is incorrect.",
        "es": "Productos menos reactivos da ΔS° = 188.8 − 69.9 = +118.9 J/(mol·K). La vaporización aumenta las distribuciones accesibles. Signo requerido: +. El signo opuesto es incorrecto."
      },
      "value": 118.9,
      "display": "+118.9",
      "unit": "J/(mol·K)",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.1-6",
      "topic": "9.1",
      "type": "numeric",
      "prompt": {
        "en": "For C<sub>2</sub>H<sub>5</sub>OH(g) → C<sub>2</sub>H<sub>5</sub>OH(l), S°(gas) = 282.7 and S°(liquid) = 160.7 J/(mol·K). Calculate ΔS° in J/(mol·K).",
        "es": "Para C<sub>2</sub>H<sub>5</sub>OH(g) → C<sub>2</sub>H<sub>5</sub>OH(l), S°(gas) = 282.7 y S°(líquido) = 160.7 J/(mol·K). Calcula ΔS° en J/(mol·K)."
      },
      "explanation": {
        "en": "ΔS° = 160.7 − 282.7 = −122.0 J/(mol·K). Condensation reduces the accessible arrangements. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔS° = 160.7 − 282.7 = −122.0 J/(mol·K). La condensación reduce las distribuciones accesibles. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -122.0,
      "display": "−122.0",
      "unit": "J/(mol·K)",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.2-1",
      "topic": "9.2",
      "type": "mc",
      "prompt": {
        "en": "An element is in its standard state at 298 K. Which statement about S° and ΔH°f is correct?",
        "es": "Un elemento está en su estado estándar a 298 K. ¿Qué enunciado sobre S° y ΔH°f es correcto?"
      },
      "explanation": {
        "en": "S° is an absolute entropy and is not defined as zero for elements at room temperature. ΔH°f is defined as zero for an element in its standard state.",
        "es": "S° es una entropía absoluta y no se define como cero para los elementos a temperatura ambiente. ΔH°f se define como cero para un elemento en su estado estándar."
      },
      "choices": [
        {
          "text": {
            "en": "Neither quantity can be tabulated.",
            "es": "Ninguna cantidad se puede tabular."
          },
          "why": {
            "en": "Thermodynamic tables include absolute entropies and formation enthalpies.",
            "es": "Las tablas termodinámicas incluyen entropías absolutas y entalpías de formación."
          }
        },
        {
          "text": {
            "en": "S° is not defined as zero; ΔH°f is defined as zero.",
            "es": "S° no se define como cero; ΔH°f se define como cero."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both are defined as zero at every temperature.",
            "es": "Ambas se definen como cero a cualquier temperatura."
          },
          "why": {
            "en": "The zero formation-enthalpy convention does not apply to absolute entropy.",
            "es": "La convención de entalpía de formación cero no se aplica a la entropía absoluta."
          }
        },
        {
          "text": {
            "en": "S° is zero, while ΔH°f is always positive.",
            "es": "S° es cero, mientras que ΔH°f siempre es positiva."
          },
          "why": {
            "en": "This reverses the formation convention and incorrectly removes the element's accessible microstates.",
            "es": "Esto invierte la convención de formación y elimina incorrectamente los microestados accesibles del elemento."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.2-2",
      "topic": "9.2",
      "type": "mc",
      "prompt": {
        "en": "Which ideal system has zero absolute entropy according to the third law?",
        "es": "¿Qué sistema ideal tiene entropía absoluta cero según la tercera ley?"
      },
      "explanation": {
        "en": "The third-law reference is a perfect crystal at 0 K, with a single ground-state arrangement. This does not make room-temperature elemental S° values zero.",
        "es": "La referencia de la tercera ley es un cristal perfecto a 0 K, con una sola distribución del estado fundamental. Esto no hace que los valores de S° de los elementos a temperatura ambiente sean cero."
      },
      "choices": [
        {
          "text": {
            "en": "A perfect crystal at 0 K",
            "es": "Un cristal perfecto a 0 K"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Any element at 298 K",
            "es": "Cualquier elemento a 298 K"
          },
          "why": {
            "en": "Room-temperature elements have accessible thermal microstates.",
            "es": "Los elementos a temperatura ambiente tienen microestados térmicos accesibles."
          }
        },
        {
          "text": {
            "en": "Any gas at standard pressure",
            "es": "Cualquier gas a presión estándar"
          },
          "why": {
            "en": "A gas has many accessible arrangements even at standard pressure.",
            "es": "Un gas tiene muchas distribuciones accesibles incluso a presión estándar."
          }
        },
        {
          "text": {
            "en": "Every substance at its melting point",
            "es": "Toda sustancia en su punto de fusión"
          },
          "why": {
            "en": "A melting-point sample has accessible configurations in its phases.",
            "es": "Una muestra en su punto de fusión tiene configuraciones accesibles en sus fases."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.2-3",
      "topic": "9.2",
      "type": "mc",
      "prompt": {
        "en": "Which method calculates ΔS°rxn from tabulated S° values for a balanced equation?",
        "es": "¿Qué método calcula ΔS°rxn a partir de valores tabulados de S° para una ecuación balanceada?"
      },
      "explanation": {
        "en": "Multiply each S° by its balanced coefficient, then subtract the reactant sum from the product sum. Report J/(mol·K) per mole of reaction as written.",
        "es": "Multiplica cada S° por su coeficiente balanceado y resta la suma de los reactivos de la suma de los productos. Expresa J/(mol·K) por mol de reacción tal como está escrita."
      },
      "choices": [
        {
          "text": {
            "en": "Reactant sum minus product sum",
            "es": "Suma de reactivos menos suma de productos"
          },
          "why": {
            "en": "This gives the entropy change for the reverse reaction.",
            "es": "Esto da el cambio de entropía de la reacción inversa."
          }
        },
        {
          "text": {
            "en": "Add every value without coefficients",
            "es": "Suma todos los valores sin coeficientes"
          },
          "why": {
            "en": "The balanced amounts and the distinction between initial and final states both matter.",
            "es": "Importan tanto las cantidades balanceadas como la distinción entre los estados inicial y final."
          }
        },
        {
          "text": {
            "en": "Set every elemental S° value to zero first",
            "es": "Primero iguala a cero cada S° de un elemento"
          },
          "why": {
            "en": "That is the formation-enthalpy convention, not the absolute-entropy rule.",
            "es": "Esa es la convención de entalpía de formación, no la regla de entropía absoluta."
          }
        },
        {
          "text": {
            "en": "Coefficient-weighted product sum minus reactant sum",
            "es": "Suma de productos con sus coeficientes menos suma de reactivos"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.2-4",
      "topic": "9.2",
      "type": "mc",
      "prompt": {
        "en": "Ammonia formation has ΔS°rxn = −198.1 J/(mol·K). What is ΔS°rxn when the entire equation is reversed?",
        "es": "La formación de amoniaco tiene ΔS°rxn = −198.1 J/(mol·K). ¿Cuál es ΔS°rxn cuando se invierte toda la ecuación?"
      },
      "explanation": {
        "en": "Reversing a reaction exchanges its initial and final states, so ΔS° reverses sign: +198.1 J/(mol·K).",
        "es": "Invertir una reacción intercambia sus estados inicial y final, así que ΔS° cambia de signo: +198.1 J/(mol·K)."
      },
      "choices": [
        {
          "text": {
            "en": "+0.1981 J/(mol·K)",
            "es": "+0.1981 J/(mol·K)"
          },
          "why": {
            "en": "Dividing by a thousand changes the numerical value without making the required unit change.",
            "es": "Dividir entre mil cambia el valor numérico sin hacer el cambio de unidad requerido."
          }
        },
        {
          "text": {
            "en": "+396.2 J/(mol·K)",
            "es": "+396.2 J/(mol·K)"
          },
          "why": {
            "en": "Reversing changes sign; it does not double the coefficients.",
            "es": "Invertir cambia el signo; no duplica los coeficientes."
          }
        },
        {
          "text": {
            "en": "+198.1 J/(mol·K)",
            "es": "+198.1 J/(mol·K)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "−198.1 J/(mol·K)",
            "es": "−198.1 J/(mol·K)"
          },
          "why": {
            "en": "The sign must reverse when the equation reverses.",
            "es": "El signo debe cambiar cuando se invierte la ecuación."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.2-5",
      "topic": "9.2",
      "type": "numeric",
      "prompt": {
        "en": "For N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), use S° values 191.6, 130.7 and 192.8 J/(mol·K), respectively. Calculate ΔS°rxn in J/(mol·K).",
        "es": "Para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), usa valores de S° de 191.6, 130.7 y 192.8 J/(mol·K), respectivamente. Calcula ΔS°rxn en J/(mol·K)."
      },
      "explanation": {
        "en": "ΔS°rxn = 2(192.8) − [191.6 + 3(130.7)] = −198.1 J/(mol·K). Include the coefficients and keep the absolute entropies of the elemental reactants. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔS°rxn = 2(192.8) − [191.6 + 3(130.7)] = −198.1 J/(mol·K). Incluye los coeficientes y conserva las entropías absolutas de los reactivos elementales. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -198.1,
      "display": "−198.1",
      "unit": "J/(mol·K)",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.2-6",
      "topic": "9.2",
      "type": "numeric",
      "prompt": {
        "en": "For 2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(l), use S° values 130.7, 205.0 and 69.9 J/(mol·K), respectively. Calculate ΔS°rxn in J/(mol·K).",
        "es": "Para 2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(l), usa valores de S° de 130.7, 205.0 y 69.9 J/(mol·K), respectivamente. Calcula ΔS°rxn en J/(mol·K)."
      },
      "explanation": {
        "en": "ΔS°rxn = 2(69.9) − [2(130.7) + 205.0] = −326.6 J/(mol·K). The large decrease is consistent with consuming gases to form liquid. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔS°rxn = 2(69.9) − [2(130.7) + 205.0] = −326.6 J/(mol·K). La gran disminución concuerda con consumir gases para formar líquido. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -326.6,
      "display": "−326.6",
      "unit": "J/(mol·K)",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.3-1",
      "topic": "9.3",
      "type": "mc",
      "prompt": {
        "en": "A reaction has ΔH° < 0 and ΔS° > 0. Assuming both stay approximately constant, when is ΔG° negative?",
        "es": "Una reacción tiene ΔH° < 0 y ΔS° > 0. Suponiendo que ambas permanecen aproximadamente constantes, ¿cuándo es negativa ΔG°?"
      },
      "explanation": {
        "en": "ΔG° = ΔH° − TΔS°. A negative enthalpy and a positive entropy change both favor a negative ΔG° at any positive temperature.",
        "es": "ΔG° = ΔH° − TΔS°. Una entalpía negativa y un cambio de entropía positivo favorecen una ΔG° negativa a cualquier temperatura positiva."
      },
      "choices": [
        {
          "text": {
            "en": "At all positive temperatures",
            "es": "A todas las temperaturas positivas"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only at low temperature",
            "es": "Solo a temperatura baja"
          },
          "why": {
            "en": "Heating makes the favorable entropy term more negative rather than opposing it.",
            "es": "Calentar hace más negativo el término favorable de entropía en lugar de oponerse a él."
          }
        },
        {
          "text": {
            "en": "Only at high temperature",
            "es": "Solo a temperatura alta"
          },
          "why": {
            "en": "The enthalpy term already favors the reaction at low temperature.",
            "es": "El término de entalpía ya favorece la reacción a temperatura baja."
          }
        },
        {
          "text": {
            "en": "At no positive temperature",
            "es": "A ninguna temperatura positiva"
          },
          "why": {
            "en": "Both contributions make ΔG° negative with the stated signs.",
            "es": "Ambas contribuciones hacen negativa ΔG° con los signos dados."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.3-2",
      "topic": "9.3",
      "type": "mc",
      "prompt": {
        "en": "A reaction has ΔH° > 0 and ΔS° < 0. When is its standard forward direction thermodynamically favorable?",
        "es": "Una reacción tiene ΔH° > 0 y ΔS° < 0. ¿Cuándo es termodinámicamente favorable su dirección directa estándar?"
      },
      "explanation": {
        "en": "The enthalpy term is positive and −TΔS° is also positive. Thus ΔG° is positive at every positive temperature under the stated constant-value approximation.",
        "es": "El término de entalpía es positivo y −TΔS° también es positivo. Por tanto, ΔG° es positiva a toda temperatura positiva con la aproximación de valores constantes."
      },
      "choices": [
        {
          "text": {
            "en": "At all positive temperatures",
            "es": "A todas las temperaturas positivas"
          },
          "why": {
            "en": "Neither contribution favors a negative ΔG° for these signs.",
            "es": "Ninguna contribución favorece una ΔG° negativa con estos signos."
          }
        },
        {
          "text": {
            "en": "Only at high temperature",
            "es": "Solo a temperatura alta"
          },
          "why": {
            "en": "Higher temperature increases the unfavorable entropy contribution.",
            "es": "Una mayor temperatura aumenta la contribución desfavorable de entropía."
          }
        },
        {
          "text": {
            "en": "Only at low temperature",
            "es": "Solo a temperatura baja"
          },
          "why": {
            "en": "Even at low positive temperature, the positive enthalpy remains unfavorable.",
            "es": "Incluso a temperatura positiva baja, la entalpía positiva sigue siendo desfavorable."
          }
        },
        {
          "text": {
            "en": "At no positive temperature under this approximation",
            "es": "A ninguna temperatura positiva con esta aproximación"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.3-3",
      "topic": "9.3",
      "type": "mc",
      "prompt": {
        "en": "For ΔH° < 0 and ΔS° < 0, which temperature range can give ΔG° < 0?",
        "es": "Para ΔH° < 0 y ΔS° < 0, ¿qué intervalo de temperatura puede dar ΔG° < 0?"
      },
      "explanation": {
        "en": "At sufficiently low temperature, the negative enthalpy outweighs the positive −TΔS° term. Increasing temperature can make ΔG° positive.",
        "es": "A temperatura suficientemente baja, la entalpía negativa supera al término positivo −TΔS°. Aumentar la temperatura puede hacer positiva ΔG°."
      },
      "choices": [
        {
          "text": {
            "en": "Every positive temperature",
            "es": "Toda temperatura positiva"
          },
          "why": {
            "en": "The two contributions oppose each other and their balance depends on temperature.",
            "es": "Las dos contribuciones se oponen y su balance depende de la temperatura."
          }
        },
        {
          "text": {
            "en": "No temperature because negative ΔS° always forbids favorability",
            "es": "Ninguna temperatura porque una ΔS° negativa siempre impide la favorabilidad"
          },
          "why": {
            "en": "A sufficiently negative enthalpy can outweigh the entropy penalty.",
            "es": "Una entalpía suficientemente negativa puede superar la contribución desfavorable de entropía."
          }
        },
        {
          "text": {
            "en": "Sufficiently low temperature",
            "es": "Temperatura suficientemente baja"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Sufficiently high temperature",
            "es": "Temperatura suficientemente alta"
          },
          "why": {
            "en": "For negative ΔS°, increasing T makes −TΔS° more positive.",
            "es": "Para ΔS° negativa, aumentar T hace más positivo −TΔS°."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.3-4",
      "topic": "9.3",
      "type": "mc",
      "prompt": {
        "en": "The line model uses ΔH° = +60.0 kJ/mol and ΔS° = +100. J/(mol·K), held constant. At 800. K, which ΔG° and conclusion are correct?",
        "es": "El modelo lineal usa ΔH° = +60.0 kJ/mol y ΔS° = +100. J/(mol·K), constantes. A 800. K, ¿qué ΔG° y conclusión son correctas?"
      },
      "explanation": {
        "en": "Convert +100. J/(mol·K) to +0.100 kJ/(mol·K). ΔG° = +60.0 − 800.(+0.100) = −20.0 kJ/mol. With both ΔH° and ΔS° positive, the reaction becomes favorable above the 600 K crossing.",
        "es": "Convierte +100. J/(mol·K) a +0.100 kJ/(mol·K). ΔG° = +60.0 − 800.(+0.100) = −20.0 kJ/mol. Con ΔH° y ΔS° positivas, la reacción se vuelve favorable por encima del cruce de 600 K."
      },
      "choices": [
        {
          "text": {
            "en": "+60.0 kJ/mol; entropy has no effect",
            "es": "+60.0 kJ/mol; la entropía no tiene efecto"
          },
          "why": {
            "en": "This keeps only enthalpy and ignores the temperature-dependent entropy term.",
            "es": "Esto conserva solo la entalpía e ignora el término de entropía que depende de la temperatura."
          }
        },
        {
          "text": {
            "en": "−20.0 kJ/mol; thermodynamically favorable",
            "es": "−20.0 kJ/mol; termodinámicamente favorable"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "+20.0 kJ/mol; thermodynamically unfavorable",
            "es": "+20.0 kJ/mol; termodinámicamente desfavorable"
          },
          "why": {
            "en": "The entropy term is subtracted from enthalpy, so the resulting sign is negative.",
            "es": "El término de entropía se resta de la entalpía, así que el signo resultante es negativo."
          }
        },
        {
          "text": {
            "en": "−79940 kJ/mol; thermodynamically favorable",
            "es": "−79940 kJ/mol; termodinámicamente favorable"
          },
          "why": {
            "en": "J/kJ error: multiplying 800. by 100. gives J/mol. Divide by 1000 before subtracting from an enthalpy in kJ/mol.",
            "es": "Error de J/kJ: multiplicar 800. por 100. da J/mol. Divide entre 1000 antes de restar de una entalpía en kJ/mol."
          }
        }
      ],
      "answer": 1,
      "free": true
    },
    {
      "id": "9.3-5",
      "topic": "9.3",
      "type": "numeric",
      "prompt": {
        "en": "For the model reaction with ΔH° = +60.0 kJ/mol and ΔS° = +100. J/(mol·K), calculate ΔG° at 298 K in kJ/mol.",
        "es": "Para la reacción del modelo con ΔH° = +60.0 kJ/mol y ΔS° = +100. J/(mol·K), calcula ΔG° a 298 K en kJ/mol."
      },
      "explanation": {
        "en": "ΔS° = +0.100 kJ/(mol·K). ΔG° = +60.0 − 298(+0.100) = +30.2 kJ/mol, so the standard forward direction is unfavorable. J/kJ check: divide the entropy value by 1000 before combining it with kJ/mol. Required sign: +. The opposite sign is incorrect.",
        "es": "ΔS° = +0.100 kJ/(mol·K). ΔG° = +60.0 − 298(+0.100) = +30.2 kJ/mol, así que la dirección directa estándar es desfavorable. Comprobación de J/kJ: divide el valor de entropía entre 1000 antes de combinarlo con kJ/mol. Signo requerido: +. El signo opuesto es incorrecto."
      },
      "value": 30.2,
      "display": "+30.2",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001,
      "free": true
    },
    {
      "id": "9.3-6",
      "topic": "9.3",
      "type": "numeric",
      "prompt": {
        "en": "For constant ΔH° = +60.0 kJ/mol and ΔS° = +100. J/(mol·K), calculate the temperature in K where ΔG° changes sign.",
        "es": "Para ΔH° = +60.0 kJ/mol y ΔS° = +100. J/(mol·K) constantes, calcula la temperatura en K donde ΔG° cambia de signo."
      },
      "explanation": {
        "en": "At the boundary ΔG° = 0, so T = ΔH°/ΔS° = 60.0/0.100 = 6.00 × 10<sup>2</sup> K. Use matching kJ units. Above this temperature the model gives negative ΔG°; below it the value is positive.",
        "es": "En el límite ΔG° = 0, así que T = ΔH°/ΔS° = 60.0/0.100 = 6.00 × 10<sup>2</sup> K. Usa unidades de kJ compatibles. Por encima de esta temperatura el modelo da ΔG° negativa; por debajo el valor es positivo."
      },
      "value": 600,
      "display": "6.00e2",
      "unit": "K",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.55,
      "free": true
    },
    {
      "id": "9.4-1",
      "topic": "9.4",
      "type": "mc",
      "prompt": {
        "en": "A reaction has ΔG° < 0 but is barely observable at room temperature. Which explanation is consistent?",
        "es": "Una reacción tiene ΔG° < 0, pero apenas se observa a temperatura ambiente. ¿Qué explicación es compatible?"
      },
      "explanation": {
        "en": "Thermodynamic favorability concerns the free-energy difference between states. A high activation energy can still make the reaction kinetically slow.",
        "es": "La favorabilidad termodinámica se refiere a la diferencia de energía libre entre estados. Una energía de activación alta aun puede hacer que la reacción sea cinéticamente lenta."
      },
      "choices": [
        {
          "text": {
            "en": "Negative ΔG° guarantees a rapid reaction.",
            "es": "Una ΔG° negativa garantiza una reacción rápida."
          },
          "why": {
            "en": "Free-energy change does not determine the activation barrier.",
            "es": "El cambio de energía libre no determina la barrera de activación."
          }
        },
        {
          "text": {
            "en": "A slow reaction must have positive ΔG°.",
            "es": "Una reacción lenta debe tener ΔG° positiva."
          },
          "why": {
            "en": "Rate and thermodynamic favorability describe different properties.",
            "es": "La velocidad y la favorabilidad termodinámica describen propiedades distintas."
          }
        },
        {
          "text": {
            "en": "The equilibrium constant must be zero.",
            "es": "La constante de equilibrio debe ser cero."
          },
          "why": {
            "en": "A negative standard free-energy change corresponds to an equilibrium constant greater than unity.",
            "es": "Un cambio de energía libre estándar negativo corresponde a una constante de equilibrio mayor que la unidad."
          }
        },
        {
          "text": {
            "en": "It is thermodynamically favorable but has a high activation barrier.",
            "es": "Es termodinámicamente favorable, pero tiene una barrera de activación alta."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.4-2",
      "topic": "9.4",
      "type": "mc",
      "prompt": {
        "en": "What does a catalyst change for a reversible reaction at fixed temperature?",
        "es": "¿Qué cambia un catalizador en una reacción reversible a temperatura fija?"
      },
      "explanation": {
        "en": "A catalyst lowers activation barriers for the coupled forward and reverse pathways. It speeds the approach to equilibrium without changing ΔG° or K.",
        "es": "Un catalizador reduce las barreras de activación de las rutas directa e inversa relacionadas. Acelera la llegada al equilibrio sin cambiar ΔG° ni K."
      },
      "choices": [
        {
          "text": {
            "en": "Only the forward reaction becomes faster.",
            "es": "Solo la reacción directa se vuelve más rápida."
          },
          "why": {
            "en": "The catalytic pathway also changes the reverse activation barrier.",
            "es": "La ruta catalítica también cambia la barrera de activación inversa."
          }
        },
        {
          "text": {
            "en": "K increases because equilibrium is reached sooner.",
            "es": "K aumenta porque se alcanza antes el equilibrio."
          },
          "why": {
            "en": "The time taken to reach equilibrium does not set the equilibrium constant.",
            "es": "El tiempo para llegar al equilibrio no determina la constante de equilibrio."
          }
        },
        {
          "text": {
            "en": "The approach to equilibrium is faster, with the same ΔG° and K.",
            "es": "La llegada al equilibrio es más rápida, con las mismas ΔG° y K."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ΔG° becomes more negative.",
            "es": "ΔG° se vuelve más negativa."
          },
          "why": {
            "en": "A catalyst does not change the free energies of reactants and products.",
            "es": "Un catalizador no cambia las energías libres de los reactivos y productos."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.4-3",
      "topic": "9.4",
      "type": "mc",
      "prompt": {
        "en": "Two products can form by competing pathways. Before reversible equilibration, which product can dominate under kinetic control?",
        "es": "Dos productos pueden formarse por rutas que compiten. Antes de alcanzar el equilibrio reversible, ¿qué producto puede predominar bajo control cinético?"
      },
      "explanation": {
        "en": "Kinetic control favors the product formed more rapidly through the lower accessible activation barrier. It need not be the most stable product.",
        "es": "El control cinético favorece al producto que se forma más rápido a través de la menor barrera de activación accesible. No tiene que ser el producto más estable."
      },
      "choices": [
        {
          "text": {
            "en": "Both products must form in equal amounts",
            "es": "Ambos productos deben formarse en cantidades iguales"
          },
          "why": {
            "en": "Different pathway rates can give unequal product amounts.",
            "es": "Las velocidades distintas de las rutas pueden dar cantidades desiguales de productos."
          }
        },
        {
          "text": {
            "en": "The product formed through the faster pathway",
            "es": "El producto que se forma por la ruta más rápida"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Always the product with the lowest final Gibbs free energy",
            "es": "Siempre el producto con la menor energía libre de Gibbs final"
          },
          "why": {
            "en": "That describes thermodynamic control after equilibration, not necessarily the early product mixture.",
            "es": "Eso describe el control termodinámico después del equilibrio, no necesariamente la mezcla inicial de productos."
          }
        },
        {
          "text": {
            "en": "Always the product with the largest activation barrier",
            "es": "Siempre el producto con la mayor barrera de activación"
          },
          "why": {
            "en": "A larger activation barrier usually slows its pathway under comparable conditions.",
            "es": "Una barrera de activación mayor suele hacer más lenta su ruta en condiciones comparables."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.4-4",
      "topic": "9.4",
      "type": "mc",
      "prompt": {
        "en": "Reversible interconversion has reached equilibrium between two products at fixed temperature. What describes thermodynamic control?",
        "es": "La interconversión reversible ha alcanzado el equilibrio entre dos productos a temperatura fija. ¿Qué describe el control termodinámico?"
      },
      "explanation": {
        "en": "Thermodynamic control reflects relative product Gibbs free energies and equilibrium stability. The lower-G product can dominate even if it formed more slowly at first.",
        "es": "El control termodinámico refleja las energías libres de Gibbs relativas de los productos y la estabilidad en el equilibrio. El producto de menor G puede predominar aunque al principio se haya formado más lentamente."
      },
      "choices": [
        {
          "text": {
            "en": "The more thermodynamically stable product is favored.",
            "es": "Se favorece el producto más estable termodinámicamente."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only the initial activation barriers determine the final ratio.",
            "es": "Solo las barreras de activación iniciales determinan la razón final."
          },
          "why": {
            "en": "Equilibrium product ratios depend on free-energy differences, not just the initial rates.",
            "es": "Las razones de productos en el equilibrio dependen de diferencias de energía libre, no solo de las velocidades iniciales."
          }
        },
        {
          "text": {
            "en": "A catalyst must change the final equilibrium ratio.",
            "es": "Un catalizador debe cambiar la razón final de equilibrio."
          },
          "why": {
            "en": "Catalysis can accelerate equilibration but does not change the fixed-temperature equilibrium ratio.",
            "es": "La catálisis puede acelerar el equilibrio, pero no cambia la razón de equilibrio a temperatura fija."
          }
        },
        {
          "text": {
            "en": "The least stable product always dominates.",
            "es": "El producto menos estable siempre predomina."
          },
          "why": {
            "en": "Thermodynamic control favors lower free energy rather than higher free energy.",
            "es": "El control termodinámico favorece una menor energía libre en lugar de una mayor."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.4-5",
      "topic": "9.4",
      "type": "numeric",
      "prompt": {
        "en": "For N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), use ΔH°f(NH<sub>3</sub>) = −46.1 kJ/mol, elemental ΔH°f = 0, and ΔS°rxn = −198.1 J/(mol·K). Calculate ΔG° at 298 K in kJ/mol.",
        "es": "Para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), usa ΔH°f(NH<sub>3</sub>) = −46.1 kJ/mol, ΔH°f elemental = 0 y ΔS°rxn = −198.1 J/(mol·K). Calcula ΔG° a 298 K en kJ/mol."
      },
      "explanation": {
        "en": "ΔH°rxn = 2(−46.1) = −92.2 kJ/mol. ΔG° = −92.2 − 298(−0.1981) = −33.1662 kJ/mol, rounded to −33.2 kJ/mol. J/kJ check: convert −198.1 J/(mol·K) to −0.1981 kJ/(mol·K). This favorable value does not establish a fast rate. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔH°rxn = 2(−46.1) = −92.2 kJ/mol. ΔG° = −92.2 − 298(−0.1981) = −33.1662 kJ/mol, redondeada a −33.2 kJ/mol. Comprobación de J/kJ: convierte −198.1 J/(mol·K) a −0.1981 kJ/(mol·K). Este valor favorable no establece una velocidad alta. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -33.1662,
      "display": "−33.2",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.4-6",
      "topic": "9.4",
      "type": "numeric",
      "prompt": {
        "en": "A catalyst lowers an activation barrier from 80.0 kJ/mol to 45.0 kJ/mol. Calculate the amount of the barrier reduction in kJ/mol.",
        "es": "Un catalizador reduce una barrera de activación de 80.0 kJ/mol a 45.0 kJ/mol. Calcula la magnitud de la reducción de la barrera en kJ/mol."
      },
      "explanation": {
        "en": "The barrier reduction is 80.0 − 45.0 = 35.0 kJ/mol. This changes reaction speed, not ΔG° or the equilibrium constant.",
        "es": "La reducción de la barrera es 80.0 − 45.0 = 35.0 kJ/mol. Esto cambia la velocidad de reacción, no ΔG° ni la constante de equilibrio."
      },
      "value": 35,
      "display": "35.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.5-1",
      "topic": "9.5",
      "type": "mc",
      "prompt": {
        "en": "At a fixed positive temperature, ΔG° is negative. What follows about K?",
        "es": "A una temperatura positiva fija, ΔG° es negativa. ¿Qué se deduce sobre K?"
      },
      "explanation": {
        "en": "ΔG° = −RT ln K. A negative ΔG° requires ln K > 0, so K > 1. This concerns equilibrium, not reaction speed.",
        "es": "ΔG° = −RT ln K. Una ΔG° negativa requiere ln K > 0, así que K > 1. Esto se refiere al equilibrio, no a la velocidad de reacción."
      },
      "choices": [
        {
          "text": {
            "en": "K = 1",
            "es": "K = 1"
          },
          "why": {
            "en": "Unity corresponds to zero standard free-energy change.",
            "es": "La unidad corresponde a un cambio de energía libre estándar cero."
          }
        },
        {
          "text": {
            "en": "K depends only on the catalyst.",
            "es": "K depende solo del catalizador."
          },
          "why": {
            "en": "A catalyst changes rates rather than the equilibrium constant.",
            "es": "Un catalizador cambia las velocidades, no la constante de equilibrio."
          }
        },
        {
          "text": {
            "en": "K > 1",
            "es": "K > 1"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "K < 1",
            "es": "K < 1"
          },
          "why": {
            "en": "That would make ln K negative and ΔG° positive.",
            "es": "Eso haría negativo ln K y positiva ΔG°."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.5-2",
      "topic": "9.5",
      "type": "mc",
      "prompt": {
        "en": "At a fixed positive temperature, ΔG° is positive. Which K range is consistent?",
        "es": "A una temperatura positiva fija, ΔG° es positiva. ¿Qué intervalo de K es compatible?"
      },
      "explanation": {
        "en": "Positive ΔG° means ln K is negative in ΔG° = −RT ln K. Therefore K lies between zero and unity.",
        "es": "Una ΔG° positiva significa que ln K es negativo en ΔG° = −RT ln K. Por tanto, K está entre cero y la unidad."
      },
      "choices": [
        {
          "text": {
            "en": "K = 0",
            "es": "K = 0"
          },
          "why": {
            "en": "A finite positive standard free energy gives a positive, nonzero K.",
            "es": "Una energía libre estándar positiva y finita da una K positiva distinta de cero."
          }
        },
        {
          "text": {
            "en": "0 < K < 1",
            "es": "0 < K < 1"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "K > 1",
            "es": "K > 1"
          },
          "why": {
            "en": "A constant greater than unity corresponds to negative ΔG°.",
            "es": "Una constante mayor que la unidad corresponde a ΔG° negativa."
          }
        },
        {
          "text": {
            "en": "K is negative.",
            "es": "K es negativa."
          },
          "why": {
            "en": "An equilibrium constant is positive; its logarithm can be negative.",
            "es": "Una constante de equilibrio es positiva; su logaritmo puede ser negativo."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.5-3",
      "topic": "9.5",
      "type": "mc",
      "prompt": {
        "en": "A reaction mixture has reached equilibrium with Q = K. What is true about its actual reaction free-energy change ΔG?",
        "es": "Una mezcla de reacción ha alcanzado el equilibrio con Q = K. ¿Qué es cierto sobre su cambio real de energía libre de reacción ΔG?"
      },
      "explanation": {
        "en": "At equilibrium, ΔG = RT ln(Q/K) = 0. There is no net driving force. This does not require ΔG° to be zero or K to be unity.",
        "es": "En el equilibrio, ΔG = RT ln(Q/K) = 0. No hay fuerza impulsora neta. Esto no requiere que ΔG° sea cero ni que K sea la unidad."
      },
      "choices": [
        {
          "text": {
            "en": "ΔG = 0; there is no net driving force.",
            "es": "ΔG = 0; no hay fuerza impulsora neta."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ΔG must be negative at equilibrium.",
            "es": "ΔG debe ser negativa en el equilibrio."
          },
          "why": {
            "en": "A negative actual ΔG would still drive a net forward change.",
            "es": "Una ΔG real negativa todavía impulsaría un cambio neto directo."
          }
        },
        {
          "text": {
            "en": "ΔG° must also be zero.",
            "es": "ΔG° también debe ser cero."
          },
          "why": {
            "en": "Standard free energy and actual reaction free energy differ under nonstandard conditions.",
            "es": "La energía libre estándar y la energía libre real de reacción difieren en condiciones no estándar."
          }
        },
        {
          "text": {
            "en": "All microscopic reactions stop.",
            "es": "Todas las reacciones microscópicas se detienen."
          },
          "why": {
            "en": "Equilibrium is dynamic even though the net driving force vanishes.",
            "es": "El equilibrio es dinámico aunque desaparezca la fuerza impulsora neta."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.5-4",
      "topic": "9.5",
      "type": "mc",
      "prompt": {
        "en": "For A(aq) ⇌ B(aq), the current Q exceeds K at fixed temperature. Which direction is thermodynamically favored?",
        "es": "Para A(aq) ⇌ B(aq), el Q actual supera a K a temperatura fija. ¿Qué dirección está favorecida termodinámicamente?"
      },
      "explanation": {
        "en": "ΔGforward = RT ln(Q/K) is positive when Q > K. The reverse direction lowers Gibbs free energy and is favored.",
        "es": "ΔGdirecta = RT ln(Q/K) es positiva cuando Q > K. La dirección inversa reduce la energía libre de Gibbs y está favorecida."
      },
      "choices": [
        {
          "text": {
            "en": "The forward direction; forward ΔG has a − sign.",
            "es": "La dirección directa; ΔG directa tiene signo −."
          },
          "why": {
            "en": "Excess product relative to equilibrium makes the forward actual free-energy change positive.",
            "es": "El exceso de producto respecto al equilibrio hace positivo el cambio real de energía libre directo."
          }
        },
        {
          "text": {
            "en": "Neither direction, because any value of Q is equilibrium.",
            "es": "Ninguna dirección, porque cualquier valor de Q es equilibrio."
          },
          "why": {
            "en": "Equilibrium requires equality between Q and K.",
            "es": "El equilibrio requiere igualdad entre Q y K."
          }
        },
        {
          "text": {
            "en": "The direction can be determined only from activation energy.",
            "es": "La dirección solo se puede determinar con la energía de activación."
          },
          "why": {
            "en": "Activation energy determines kinetics; Q and K establish the thermodynamic direction here.",
            "es": "La energía de activación determina la cinética; aquí Q y K establecen la dirección termodinámica."
          }
        },
        {
          "text": {
            "en": "The reverse direction; forward ΔG has a + sign.",
            "es": "La dirección inversa; ΔG directa tiene signo +."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.5-5",
      "topic": "9.5",
      "type": "numeric",
      "prompt": {
        "en": "At 298 K, a reaction has K = 25.0. Using R = 8.314 J/(mol·K), calculate ΔG° in kJ/mol.",
        "es": "A 298 K, una reacción tiene K = 25.0. Con R = 8.314 J/(mol·K), calcula ΔG° en kJ/mol."
      },
      "explanation": {
        "en": "ΔG° = −RT ln K = −(8.314)(298)ln(25.0) = −7974.997 J/mol = −7.97 kJ/mol. J/kJ check: divide the result in J/mol by 1000. K > 1 is consistent with the negative sign. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔG° = −RT ln K = −(8.314)(298)ln(25.0) = −7974.997 J/mol = −7.97 kJ/mol. Comprobación de J/kJ: divide el resultado en J/mol entre 1000. K > 1 concuerda con el signo negativo. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -7.974996615170357,
      "display": "−7.97",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005
    },
    {
      "id": "9.5-6",
      "topic": "9.5",
      "type": "numeric",
      "prompt": {
        "en": "At 298 K, ΔG° = −5.00 kJ/mol. Using R = 8.314 J/(mol·K), calculate K. Choose no units.",
        "es": "A 298 K, ΔG° = −5.00 kJ/mol. Con R = 8.314 J/(mol·K), calcula K. Elige sin unidades."
      },
      "explanation": {
        "en": "Convert −5.00 kJ/mol to −5000 J/mol. K = exp[−ΔG°/(RT)] = exp[5000/(8.314 × 298)] = 7.52. The two negative signs cancel in the exponent.",
        "es": "Convierte −5.00 kJ/mol a −5000 J/mol. K = exp[−ΔG°/(RT)] = exp[5000/(8.314 × 298)] = 7.52. Los dos signos negativos se cancelan en el exponente."
      },
      "value": 7.524051995083772,
      "display": "7.52",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005
    },
    {
      "id": "9.6-1",
      "topic": "9.6",
      "type": "mc",
      "prompt": {
        "en": "An endothermic salt dissolution is thermodynamically favorable under standard conditions. How can that happen?",
        "es": "La disolución endotérmica de una sal es termodinámicamente favorable en condiciones estándar. ¿Cómo puede ocurrir?"
      },
      "explanation": {
        "en": "If ΔS° is sufficiently positive, TΔS° exceeds the positive ΔH° and ΔG° becomes negative. Favorable dissolution need not release heat.",
        "es": "Si ΔS° es suficientemente positiva, TΔS° supera a la ΔH° positiva y ΔG° se vuelve negativa. Una disolución favorable no tiene que liberar calor."
      },
      "choices": [
        {
          "text": {
            "en": "The entropy term must be added with the same sign as enthalpy.",
            "es": "El término de entropía debe sumarse con el mismo signo que la entalpía."
          },
          "why": {
            "en": "In ΔG° = ΔH° − TΔS°, a positive entropy change lowers ΔG°.",
            "es": "En ΔG° = ΔH° − TΔS°, un cambio de entropía positivo reduce ΔG°."
          }
        },
        {
          "text": {
            "en": "A positive entropy contribution can outweigh the positive enthalpy.",
            "es": "Una contribución positiva de entropía puede superar a la entalpía positiva."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Every favorable dissolution must be exothermic.",
            "es": "Toda disolución favorable debe ser exotérmica."
          },
          "why": {
            "en": "Favorability depends on Gibbs free energy rather than enthalpy alone.",
            "es": "La favorabilidad depende de la energía libre de Gibbs, no solo de la entalpía."
          }
        },
        {
          "text": {
            "en": "Temperature is irrelevant to dissolution free energy.",
            "es": "La temperatura no influye en la energía libre de disolución."
          },
          "why": {
            "en": "The entropy contribution is multiplied by temperature.",
            "es": "La contribución de entropía se multiplica por la temperatura."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.6-2",
      "topic": "9.6",
      "type": "mc",
      "prompt": {
        "en": "Which observation shows that dissolving does not always increase system entropy?",
        "es": "¿Qué observación muestra que disolver no siempre aumenta la entropía del sistema?"
      },
      "explanation": {
        "en": "A gas can lose positional freedom on dissolving in water. Its entropy contribution can decrease, so dissolution is not automatically associated with positive ΔS°.",
        "es": "Un gas puede perder libertad de posición al disolverse en agua. Su contribución de entropía puede disminuir, así que la disolución no se asocia automáticamente con ΔS° positiva."
      },
      "choices": [
        {
          "text": {
            "en": "Gas dissolution can have ΔS° with a − sign.",
            "es": "La disolución de un gas puede tener ΔS° con signo −."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Every dissolved particle has more freedom than every gas particle.",
            "es": "Toda partícula disuelta tiene más libertad que toda partícula gaseosa."
          },
          "why": {
            "en": "Solvation constrains a particle that previously moved freely in the gas phase.",
            "es": "La solvatación limita una partícula que antes se movía libremente en la fase gaseosa."
          }
        },
        {
          "text": {
            "en": "Dissolving always destroys solute atoms.",
            "es": "Disolver siempre destruye los átomos del soluto."
          },
          "why": {
            "en": "Dissolution conserves atoms; entropy changes arise from accessible arrangements.",
            "es": "La disolución conserva los átomos; los cambios de entropía surgen de las distribuciones accesibles."
          }
        },
        {
          "text": {
            "en": "All dissolution has ΔS° equal to zero.",
            "es": "Toda disolución tiene ΔS° igual a cero."
          },
          "why": {
            "en": "The initial and final accessible microstates generally differ.",
            "es": "Los microestados accesibles iniciales y finales suelen diferir."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.6-3",
      "topic": "9.6",
      "type": "mc",
      "prompt": {
        "en": "Ions disperse when a salt dissolves, but their hydration strongly orders nearby water. What can follow for total system ΔS°?",
        "es": "Los iones se dispersan cuando una sal se disuelve, pero su hidratación ordena fuertemente el agua cercana. ¿Qué puede ocurrir con la ΔS° total del sistema?"
      },
      "explanation": {
        "en": "Count the solvent as part of the system. Ordering of hydration shells can outweigh ion dispersal, making total ΔS° negative.",
        "es": "Cuenta el disolvente como parte del sistema. El orden de las capas de hidratación puede superar la dispersión de iones y hacer negativa la ΔS° total."
      },
      "choices": [
        {
          "text": {
            "en": "ΔS° must have a + sign because only the solute matters.",
            "es": "ΔS° debe tener signo + porque solo importa el soluto."
          },
          "why": {
            "en": "Solvent arrangements also contribute to system entropy.",
            "es": "Las distribuciones del disolvente también contribuyen a la entropía del sistema."
          }
        },
        {
          "text": {
            "en": "The solvent is never part of a solution system.",
            "es": "El disolvente nunca es parte de un sistema de solución."
          },
          "why": {
            "en": "The system being analyzed includes both solute and solvent.",
            "es": "El sistema analizado incluye tanto soluto como disolvente."
          }
        },
        {
          "text": {
            "en": "Hydration can change enthalpy but never entropy.",
            "es": "La hidratación puede cambiar la entalpía, pero nunca la entropía."
          },
          "why": {
            "en": "Restricting water arrangements changes accessible microstates and therefore entropy.",
            "es": "Limitar las distribuciones del agua cambia los microestados accesibles y, por tanto, la entropía."
          }
        },
        {
          "text": {
            "en": "ΔS° can have a − sign despite ion dispersal.",
            "es": "ΔS° puede tener signo − a pesar de la dispersión de iones."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.6-4",
      "topic": "9.6",
      "type": "mc",
      "prompt": {
        "en": "A dissolution reaction has K > 1 at a specified temperature. What can be concluded about ΔG° and the rate?",
        "es": "Una reacción de disolución tiene K > 1 a una temperatura dada. ¿Qué se puede concluir sobre ΔG° y la velocidad?"
      },
      "explanation": {
        "en": "K > 1 corresponds to negative ΔG°. The equilibrium constant does not tell how fast the salt dissolves.",
        "es": "K > 1 corresponde a ΔG° negativa. La constante de equilibrio no indica qué tan rápido se disuelve la sal."
      },
      "choices": [
        {
          "text": {
            "en": "ΔG° has a − sign, so dissolution must be instantaneous.",
            "es": "ΔG° tiene signo −, así que la disolución debe ser instantánea."
          },
          "why": {
            "en": "A favorable free-energy change does not eliminate kinetic barriers.",
            "es": "Un cambio favorable de energía libre no elimina las barreras cinéticas."
          }
        },
        {
          "text": {
            "en": "All the solute must dissolve, regardless of its amount.",
            "es": "Todo el soluto debe disolverse, sin importar su cantidad."
          },
          "why": {
            "en": "Equilibrium and saturation can leave undissolved material when enough solute is present.",
            "es": "El equilibrio y la saturación pueden dejar material sin disolver cuando hay suficiente soluto."
          }
        },
        {
          "text": {
            "en": "ΔG° has a − sign; the rate is not determined.",
            "es": "ΔG° tiene signo −; la velocidad no está determinada."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ΔG° has a + sign and the rate must be fast.",
            "es": "ΔG° tiene signo + y la velocidad debe ser alta."
          },
          "why": {
            "en": "Both claims are wrong: a large K gives negative ΔG° and does not fix the rate.",
            "es": "Ambas afirmaciones son incorrectas: una K grande da ΔG° negativa y no fija la velocidad."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.6-5",
      "topic": "9.6",
      "type": "numeric",
      "prompt": {
        "en": "A hypothetical salt dissolution has ΔH° = +15.0 kJ/mol and ΔS° = +80.0 J/(mol·K). Calculate ΔG° at 298 K in kJ/mol.",
        "es": "La disolución de una sal hipotética tiene ΔH° = +15.0 kJ/mol y ΔS° = +80.0 J/(mol·K). Calcula ΔG° a 298 K en kJ/mol."
      },
      "explanation": {
        "en": "ΔG° = +15.0 − 298(+0.0800) = −8.840 kJ/mol, reported as −8.8 kJ/mol. The entropy term outweighs the endothermic enthalpy. J/kJ check: divide the entropy value by 1000 before multiplying by T. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔG° = +15.0 − 298(+0.0800) = −8.840 kJ/mol, expresada como −8.8 kJ/mol. El término de entropía supera a la entalpía endotérmica. Comprobación de J/kJ: divide el valor de entropía entre 1000 antes de multiplicar por T. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -8.84,
      "display": "−8.8",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.6-6",
      "topic": "9.6",
      "type": "numeric",
      "prompt": {
        "en": "A model dissolution has ΔH° = −30.0 kJ/mol and ΔS° = −50.0 J/(mol·K), held constant. Calculate ΔG° at 500. K in kJ/mol.",
        "es": "Una disolución del modelo tiene ΔH° = −30.0 kJ/mol y ΔS° = −50.0 J/(mol·K), constantes. Calcula ΔG° a 500. K en kJ/mol."
      },
      "explanation": {
        "en": "ΔG° = −30.0 − 500.(−0.0500) = −5.000 kJ/mol, reported as −5.0 kJ/mol. Subtracting a negative entropy term raises free energy. J/kJ check: use −0.0500 kJ/(mol·K), not −50.0 with kJ enthalpy. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔG° = −30.0 − 500.(−0.0500) = −5.000 kJ/mol, expresada como −5.0 kJ/mol. Restar un término de entropía negativo aumenta la energía libre. Comprobación de J/kJ: usa −0.0500 kJ/(mol·K), no −50.0 con la entalpía en kJ. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -5,
      "display": "−5.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.7-1",
      "topic": "9.7",
      "type": "mc",
      "prompt": {
        "en": "Two physically coupled steps share an intermediate that cancels when their equations are added. How is the net ΔG° obtained?",
        "es": "Dos etapas físicamente acopladas comparten un intermediario que se cancela al sumar sus ecuaciones. ¿Cómo se obtiene la ΔG° neta?"
      },
      "explanation": {
        "en": "Reaction free energies add with the balanced equations. A sufficiently negative step can make the coupled net ΔG° negative.",
        "es": "Las energías libres de reacción se suman con las ecuaciones balanceadas. Una etapa suficientemente negativa puede hacer negativa la ΔG° neta acoplada."
      },
      "choices": [
        {
          "text": {
            "en": "Add the ΔG° values for the equations as combined.",
            "es": "Suma los valores de ΔG° de las ecuaciones tal como se combinan."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Multiply the ΔG° values.",
            "es": "Multiplica los valores de ΔG°."
          },
          "why": {
            "en": "Free energies are additive state-function changes, not multiplicative constants.",
            "es": "Las energías libres son cambios aditivos de una función de estado, no constantes multiplicativas."
          }
        },
        {
          "text": {
            "en": "Keep only the positive ΔG° step.",
            "es": "Conserva solo la etapa con ΔG° positiva."
          },
          "why": {
            "en": "The favorable step contributes to the energy change of the net process.",
            "es": "La etapa favorable contribuye al cambio de energía del proceso neto."
          }
        },
        {
          "text": {
            "en": "Set the net ΔG° equal to zero because an intermediate cancels.",
            "es": "Iguala a cero la ΔG° neta porque se cancela un intermediario."
          },
          "why": {
            "en": "Canceling a chemical species does not require cancellation of the energy changes.",
            "es": "Cancelar una especie química no requiere que se cancelen los cambios de energía."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.7-2",
      "topic": "9.7",
      "type": "mc",
      "prompt": {
        "en": "Why does adding an unrelated favorable reaction on paper not necessarily drive an unfavorable reaction in a separate container?",
        "es": "¿Por qué sumar en papel una reacción favorable sin relación no necesariamente impulsa una reacción desfavorable en otro recipiente?"
      },
      "explanation": {
        "en": "Useful coupling needs a physical mechanism that transfers energy between the processes, often through a shared intermediate. An algebraic sum alone does not establish that connection.",
        "es": "Un acoplamiento útil necesita un mecanismo físico que transfiera energía entre los procesos, a menudo mediante un intermediario compartido. Una suma algebraica por sí sola no establece esa conexión."
      },
      "choices": [
        {
          "text": {
            "en": "Free energy cannot be transferred between reactions.",
            "es": "La energía libre no puede transferirse entre reacciones."
          },
          "why": {
            "en": "Coupled mechanisms can transfer usable energy; the missing connection is the issue.",
            "es": "Los mecanismos acoplados pueden transferir energía utilizable; el problema es la falta de conexión."
          }
        },
        {
          "text": {
            "en": "Any favorable reaction makes every other reaction favorable.",
            "es": "Cualquier reacción favorable hace favorable toda otra reacción."
          },
          "why": {
            "en": "Separate processes do not automatically exchange useful energy.",
            "es": "Los procesos separados no intercambian automáticamente energía útil."
          }
        },
        {
          "text": {
            "en": "The unfavorable step must have a negative activation energy.",
            "es": "La etapa desfavorable debe tener una energía de activación negativa."
          },
          "why": {
            "en": "Coupling concerns the net energy balance, not a requirement for negative activation energy.",
            "es": "El acoplamiento se refiere al balance neto de energía, no a exigir una energía de activación negativa."
          }
        },
        {
          "text": {
            "en": "The processes need a physical coupling mechanism.",
            "es": "Los procesos necesitan un mecanismo físico de acoplamiento."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.7-3",
      "topic": "9.7",
      "type": "mc",
      "prompt": {
        "en": "An otherwise unfavorable chemical process is driven by absorbed light or an external power supply. Which statement is consistent with energy conservation?",
        "es": "Un proceso químico que de otro modo es desfavorable es impulsado por luz absorbida o una fuente externa de energía eléctrica. ¿Qué enunciado concuerda con la conservación de la energía?"
      },
      "explanation": {
        "en": "Light or electrical work can supply energy to the chemical system. Include that energy source when analyzing the complete process.",
        "es": "La luz o el trabajo eléctrico pueden aportar energía al sistema químico. Incluye esa fuente de energía al analizar el proceso completo."
      },
      "choices": [
        {
          "text": {
            "en": "The energy input must be ignored in a coupled analysis.",
            "es": "La energía aportada debe ignorarse en un análisis de acoplamiento."
          },
          "why": {
            "en": "Ignoring the input omits what drives the unfavorable chemical change.",
            "es": "Ignorar el aporte omite lo que impulsa el cambio químico desfavorable."
          }
        },
        {
          "text": {
            "en": "An unfavorable reaction can never occur under any conditions.",
            "es": "Una reacción desfavorable nunca puede ocurrir en ninguna condición."
          },
          "why": {
            "en": "External work and suitable coupling can drive the written direction.",
            "es": "El trabajo externo y un acoplamiento adecuado pueden impulsar la dirección escrita."
          }
        },
        {
          "text": {
            "en": "External energy can drive the chemical process.",
            "es": "La energía externa puede impulsar el proceso químico."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Energy conservation no longer applies.",
            "es": "La conservación de la energía deja de aplicarse."
          },
          "why": {
            "en": "The external source is part of the complete energy accounting.",
            "es": "La fuente externa forma parte del balance completo de energía."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.7-4",
      "topic": "9.7",
      "type": "mc",
      "prompt": {
        "en": "A step has ΔG° = +12.0 kJ/mol. The equation is reversed and then multiplied by 2 for a coupled sum. What ΔG° contribution must be used?",
        "es": "Una etapa tiene ΔG° = +12.0 kJ/mol. La ecuación se invierte y luego se multiplica por 2 para una suma acoplada. ¿Qué contribución de ΔG° debe usarse?"
      },
      "explanation": {
        "en": "Reverse the sign and scale the reaction free energy with the equation: 2(−12.0) = −24.0 kJ/mol.",
        "es": "Invierte el signo y escala la energía libre de reacción con la ecuación: 2(−12.0) = −24.0 kJ/mol."
      },
      "choices": [
        {
          "text": {
            "en": "+6.00 kJ/mol",
            "es": "+6.00 kJ/mol"
          },
          "why": {
            "en": "Multiplying an equation multiplies its free-energy change; it does not divide it.",
            "es": "Multiplicar una ecuación multiplica su cambio de energía libre; no lo divide."
          }
        },
        {
          "text": {
            "en": "−24.0 kJ/mol",
            "es": "−24.0 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "+24.0 kJ/mol",
            "es": "+24.0 kJ/mol"
          },
          "why": {
            "en": "The coefficient was applied, but reversing the reaction also reverses the sign.",
            "es": "Se aplicó el coeficiente, pero invertir la reacción también invierte el signo."
          }
        },
        {
          "text": {
            "en": "−12.0 kJ/mol",
            "es": "−12.0 kJ/mol"
          },
          "why": {
            "en": "This reverses the sign but omits the doubled reaction amount.",
            "es": "Esto invierte el signo, pero omite la cantidad de reacción duplicada."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.7-5",
      "topic": "9.7",
      "type": "numeric",
      "prompt": {
        "en": "Two physically coupled steps have ΔG° values +25.0 kJ/mol and −40.0 kJ/mol for the equations being added. Calculate net ΔG° in kJ/mol.",
        "es": "Dos etapas físicamente acopladas tienen valores de ΔG° de +25.0 kJ/mol y −40.0 kJ/mol para las ecuaciones que se suman. Calcula ΔG° neta en kJ/mol."
      },
      "explanation": {
        "en": "ΔG°net = +25.0 + (−40.0) = −15.0 kJ/mol. The favorable step is large enough to make the combined standard process thermodynamically favorable. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔG°neta = +25.0 + (−40.0) = −15.0 kJ/mol. La etapa favorable es suficientemente grande para hacer termodinámicamente favorable el proceso estándar combinado. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -15,
      "display": "−15.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.7-6",
      "topic": "9.7",
      "type": "numeric",
      "prompt": {
        "en": "A model mechanism couples one step with ΔG° = +32.0 kJ/mol to two occurrences of a driving step with ΔG° = −20.0 kJ/mol each. Calculate net ΔG° in kJ/mol.",
        "es": "Un mecanismo del modelo acopla una etapa con ΔG° = +32.0 kJ/mol a dos ejecuciones de una etapa impulsora con ΔG° = −20.0 kJ/mol cada una. Calcula ΔG° neta en kJ/mol."
      },
      "explanation": {
        "en": "Use the mechanism's reaction amounts: ΔG°net = +32.0 + 2(−20.0) = −8.0 kJ/mol. Scaling reaction free energy is valid; scaling an electrode potential would not be. Required sign: −. The opposite sign is incorrect.",
        "es": "Usa las cantidades de reacción del mecanismo: ΔG°neta = +32.0 + 2(−20.0) = −8.0 kJ/mol. Es válido escalar la energía libre de reacción; no sería válido escalar un potencial de electrodo. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -8,
      "display": "−8.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001
    },
    {
      "id": "9.8-1",
      "topic": "9.8",
      "type": "mc",
      "prompt": {
        "en": "Which electrode roles apply in both galvanic and electrolytic cells?",
        "es": "¿Qué funciones de los electrodos se cumplen tanto en las celdas galvánicas como en las electrolíticas?"
      },
      "explanation": {
        "en": "Oxidation always occurs at the anode and reduction always occurs at the cathode. Electrode charge signs depend on the cell type, but these reaction roles do not.",
        "es": "La oxidación siempre ocurre en el ánodo y la reducción siempre ocurre en el cátodo. Los signos de carga de los electrodos dependen del tipo de celda, pero estas funciones de reacción no cambian."
      },
      "choices": [
        {
          "text": {
            "en": "Anode: reduction; cathode: oxidation",
            "es": "Ánodo: reducción; cátodo: oxidación"
          },
          "why": {
            "en": "These definitions have been interchanged.",
            "es": "Estas definiciones se han intercambiado."
          }
        },
        {
          "text": {
            "en": "Both electrodes carry out only oxidation.",
            "es": "Ambos electrodos realizan solo oxidación."
          },
          "why": {
            "en": "Reduction must consume the charge released by oxidation in the complete electrochemical process.",
            "es": "La reducción debe consumir la carga liberada por la oxidación en el proceso electroquímico completo."
          }
        },
        {
          "text": {
            "en": "The anode is always negative in every cell.",
            "es": "El ánodo siempre es negativo en toda celda."
          },
          "why": {
            "en": "A galvanic anode is negative, while an electrolytic anode is positive.",
            "es": "Un ánodo galvánico es negativo, mientras que un ánodo electrolítico es positivo."
          }
        },
        {
          "text": {
            "en": "Anode: oxidation; cathode: reduction",
            "es": "Ánodo: oxidación; cátodo: reducción"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.8-2",
      "topic": "9.8",
      "type": "mc",
      "prompt": {
        "en": "The Zn/Cu galvanic model has a zinc anode and copper cathode. Which way do e<sup>−</sup> move through the external wire?",
        "es": "El modelo galvánico de Zn/Cu tiene un ánodo de zinc y un cátodo de cobre. ¿En qué dirección se mueven los e<sup>−</sup> por el alambre externo?"
      },
      "explanation": {
        "en": "Zn(s) → Zn<sup>2+</sup>(aq) + 2e<sup>−</sup> supplies charge at the anode. The external wire carries e<sup>−</sup> from zinc to copper, where reduction occurs.",
        "es": "Zn(s) → Zn<sup>2+</sup>(aq) + 2e<sup>−</sup> aporta carga en el ánodo. El alambre externo transporta e<sup>−</sup> del zinc al cobre, donde ocurre la reducción."
      },
      "choices": [
        {
          "text": {
            "en": "Through the salt bridge from zinc to copper",
            "es": "Por el puente salino del zinc al cobre"
          },
          "why": {
            "en": "The salt bridge conducts ions rather than external-wire charge carriers.",
            "es": "El puente salino conduce iones, no los portadores de carga del alambre externo."
          }
        },
        {
          "text": {
            "en": "They remain fixed inside the zinc electrode.",
            "es": "Permanecen fijos dentro del electrodo de zinc."
          },
          "why": {
            "en": "A working circuit transfers charge between the two half-reactions.",
            "es": "Un circuito en funcionamiento transfiere carga entre las dos semirreacciones."
          }
        },
        {
          "text": {
            "en": "From the zinc anode to the copper cathode",
            "es": "Del ánodo de zinc al cátodo de cobre"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "From the copper cathode to the zinc anode",
            "es": "Del cátodo de cobre al ánodo de zinc"
          },
          "why": {
            "en": "This reverses the external flow for galvanic Zn/Cu operation.",
            "es": "Esto invierte el flujo externo de la operación galvánica de Zn/Cu."
          }
        }
      ],
      "answer": 2,
      "cell": true
    },
    {
      "id": "9.8-3",
      "topic": "9.8",
      "type": "mc",
      "prompt": {
        "en": "In the Zn/Cu galvanic model, a KNO<sub>3</sub> salt bridge maintains electrical neutrality. Which ion flow is correct?",
        "es": "En el modelo galvánico de Zn/Cu, un puente salino de KNO<sub>3</sub> mantiene la neutralidad eléctrica. ¿Qué flujo de iones es correcto?"
      },
      "explanation": {
        "en": "Zinc oxidation adds Zn<sup>2+</sup> to the anode solution, attracting NO<sub>3</sub><sup>−</sup>. Copper reduction consumes Cu<sup>2+</sup> at the cathode, so K<sup>+</sup> migrates there to balance charge.",
        "es": "La oxidación del zinc agrega Zn<sup>2+</sup> a la solución del ánodo, lo que atrae NO<sub>3</sub><sup>−</sup>. La reducción del cobre consume Cu<sup>2+</sup> en el cátodo, así que K<sup>+</sup> migra hacia allí para balancear la carga."
      },
      "choices": [
        {
          "text": {
            "en": "No bridge ion motion is needed while current flows.",
            "es": "No se necesita movimiento de iones del puente mientras fluye corriente."
          },
          "why": {
            "en": "Without ionic charge balance, charge buildup would stop sustained current.",
            "es": "Sin balance iónico de carga, la acumulación de carga detendría la corriente sostenida."
          }
        },
        {
          "text": {
            "en": "Anions toward the anode; cations toward the cathode",
            "es": "Aniones hacia el ánodo; cationes hacia el cátodo"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Cations toward the anode; anions toward the cathode",
            "es": "Cationes hacia el ánodo; aniones hacia el cátodo"
          },
          "why": {
            "en": "These flows would worsen the solution charge imbalance for the modeled reaction.",
            "es": "Estos flujos empeorarían el desequilibrio de carga en las soluciones para la reacción del modelo."
          }
        },
        {
          "text": {
            "en": "Only e<sup>−</sup> flow through the salt bridge.",
            "es": "Solo los e<sup>−</sup> fluyen por el puente salino."
          },
          "why": {
            "en": "The bridge contains mobile ions; the external wire carries the other charge flow.",
            "es": "El puente contiene iones móviles; el alambre externo transporta el otro flujo de carga."
          }
        }
      ],
      "answer": 1,
      "cell": true
    },
    {
      "id": "9.8-4",
      "topic": "9.8",
      "type": "mc",
      "prompt": {
        "en": "What distinguishes a galvanic cell from an electrolytic cell?",
        "es": "¿Qué distingue una celda galvánica de una celda electrolítica?"
      },
      "explanation": {
        "en": "A galvanic (voltaic) cell uses a thermodynamically favorable chemical change to produce electrical work. An electrolytic cell uses external electrical work to drive an unfavorable written chemical direction.",
        "es": "Una celda galvánica (voltaica) usa un cambio químico termodinámicamente favorable para producir trabajo eléctrico. Una celda electrolítica usa trabajo eléctrico externo para impulsar una dirección química escrita desfavorable."
      },
      "choices": [
        {
          "text": {
            "en": "Galvanic produces electrical work; electrolytic requires external electrical work.",
            "es": "La galvánica produce trabajo eléctrico; la electrolítica requiere trabajo eléctrico externo."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only a galvanic cell has oxidation and reduction.",
            "es": "Solo una celda galvánica tiene oxidación y reducción."
          },
          "why": {
            "en": "Both cell types contain oxidation and reduction half-reactions.",
            "es": "Ambos tipos de celda contienen semirreacciones de oxidación y reducción."
          }
        },
        {
          "text": {
            "en": "Only an electrolytic cell can transfer charge.",
            "es": "Solo una celda electrolítica puede transferir carga."
          },
          "why": {
            "en": "Current can flow in either cell type when a complete operating circuit exists.",
            "es": "La corriente puede fluir en cualquiera de los dos tipos de celda cuando existe un circuito completo en funcionamiento."
          }
        },
        {
          "text": {
            "en": "Reduction switches to the anode in electrolysis.",
            "es": "La reducción cambia al ánodo en la electrólisis."
          },
          "why": {
            "en": "Reduction remains at the cathode in both types.",
            "es": "La reducción permanece en el cátodo en ambos tipos."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.8-5",
      "topic": "9.8",
      "type": "numeric",
      "prompt": {
        "en": "A zinc anode oxidizes 0.0100 mol Zn by Zn(s) → Zn<sup>2+</sup>(aq) + 2e<sup>−</sup>. Calculate the transferred amount of e<sup>−</sup> in mol.",
        "es": "Un ánodo de zinc oxida 0.0100 mol de Zn mediante Zn(s) → Zn<sup>2+</sup>(aq) + 2e<sup>−</sup>. Calcula la cantidad transferida de e<sup>−</sup> en mol."
      },
      "explanation": {
        "en": "Each mol Zn releases 2 mol e<sup>−</sup>. The transferred amount is 2 × 0.0100 = 0.0200 mol e<sup>−</sup>.",
        "es": "Cada mol de Zn libera 2 mol de e<sup>−</sup>. La cantidad transferida es 2 × 0.0100 = 0.0200 mol de e<sup>−</sup>."
      },
      "value": 0.02,
      "display": "0.0200",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05
    },
    {
      "id": "9.8-6",
      "topic": "9.8",
      "type": "numeric",
      "prompt": {
        "en": "A standard Zn/Cu galvanic cell uses copper as cathode and zinc as anode. Standard reduction potentials are +0.34 V and −0.76 V, respectively. Calculate E°cell in V.",
        "es": "Una celda galvánica estándar de Zn/Cu usa cobre como cátodo y zinc como ánodo. Los potenciales estándar de reducción son +0.34 V y −0.76 V, respectivamente. Calcula E°celda en V."
      },
      "explanation": {
        "en": "E°cell = E°cathode − E°anode = +0.34 − (−0.76) = +1.10 V. Subtract the listed anode reduction potential rather than adding both listed values. Required sign: +. The opposite sign is incorrect.",
        "es": "E°celda = E°cátodo − E°ánodo = +0.34 − (−0.76) = +1.10 V. Resta el potencial de reducción tabulado del ánodo en lugar de sumar ambos valores tabulados. Signo requerido: +. El signo opuesto es incorrecto."
      },
      "value": 1.1,
      "display": "+1.10",
      "unit": "V",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "cell": true
    },
    {
      "id": "9.9-1",
      "topic": "9.9",
      "type": "mc",
      "prompt": {
        "en": "When a half-reaction is multiplied to balance charge, what happens to its tabulated standard reduction potential?",
        "es": "Cuando una semirreacción se multiplica para balancear la carga, ¿qué ocurre con su potencial estándar de reducción tabulado?"
      },
      "explanation": {
        "en": "E° is an intensive potential and is not multiplied by a stoichiometric coefficient. The transferred charge n and reaction ΔG° do scale with reaction amounts.",
        "es": "E° es un potencial intensivo y no se multiplica por un coeficiente estequiométrico. La carga transferida n y la ΔG° de reacción sí cambian con las cantidades de reacción."
      },
      "choices": [
        {
          "text": {
            "en": "E° is divided by the coefficient.",
            "es": "E° se divide entre el coeficiente."
          },
          "why": {
            "en": "Balancing does not rescale the potential in either direction.",
            "es": "El balanceo no cambia la escala del potencial en ninguna dirección."
          }
        },
        {
          "text": {
            "en": "E° becomes zero.",
            "es": "E° se vuelve cero."
          },
          "why": {
            "en": "Balancing charge does not remove the thermodynamic difference represented by a potential.",
            "es": "Balancear la carga no elimina la diferencia termodinámica representada por un potencial."
          }
        },
        {
          "text": {
            "en": "E° remains unchanged.",
            "es": "E° permanece sin cambio."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "E° is multiplied by the coefficient.",
            "es": "E° se multiplica por el coeficiente."
          },
          "why": {
            "en": "Coefficient error: potentials are intensive. Multiply reaction free energy and charge, not the standard reduction potential.",
            "es": "Error de coeficiente: los potenciales son intensivos. Multiplica la energía libre de reacción y la carga, no el potencial estándar de reducción."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.9-2",
      "topic": "9.9",
      "type": "mc",
      "prompt": {
        "en": "For a reaction with positive n and F, E°cell has a + sign. What sign must ΔG° have?",
        "es": "Para una reacción con n y F positivas, E°celda tiene signo +. ¿Qué signo debe tener ΔG°?"
      },
      "explanation": {
        "en": "ΔG° = −nFE°. Positive standard cell potential gives negative standard reaction free energy and a thermodynamically favorable standard direction.",
        "es": "ΔG° = −nFE°. Un potencial estándar de celda positivo da una energía libre estándar de reacción negativa y una dirección estándar termodinámicamente favorable."
      },
      "choices": [
        {
          "text": {
            "en": "The sign depends on the mass of the electrodes only.",
            "es": "El signo depende solo de la masa de los electrodos."
          },
          "why": {
            "en": "For the stated reaction, the sign follows from the potential and −nF.",
            "es": "Para la reacción dada, el signo se obtiene del potencial y de −nF."
          }
        },
        {
          "text": {
            "en": "ΔG°: −",
            "es": "ΔG°: −"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ΔG°: +",
            "es": "ΔG°: +"
          },
          "why": {
            "en": "The minus sign in −nFE° reverses the sign of a positive potential.",
            "es": "El signo menos de −nFE° invierte el signo de un potencial positivo."
          }
        },
        {
          "text": {
            "en": "ΔG° is zero for every cell.",
            "es": "ΔG° es cero en toda celda."
          },
          "why": {
            "en": "Zero standard free energy would require zero standard cell potential.",
            "es": "La energía libre estándar cero requeriría un potencial estándar de celda cero."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.9-3",
      "topic": "9.9",
      "type": "mc",
      "prompt": {
        "en": "For Zn(s) + 2Ag<sup>+</sup>(aq) → Zn<sup>2+</sup>(aq) + 2Ag(s), use E°(Ag<sup>+</sup>/Ag) = +0.80 V and E°(Zn<sup>2+</sup>/Zn) = −0.76 V. What is E°cell?",
        "es": "Para Zn(s) + 2Ag<sup>+</sup>(aq) → Zn<sup>2+</sup>(aq) + 2Ag(s), usa E°(Ag<sup>+</sup>/Ag) = +0.80 V y E°(Zn<sup>2+</sup>/Zn) = −0.76 V. ¿Cuál es E°celda?"
      },
      "explanation": {
        "en": "E°cell = +0.80 − (−0.76) = +1.56 V. The balanced silver coefficient changes the transferred charge, not the silver reduction potential.",
        "es": "E°celda = +0.80 − (−0.76) = +1.56 V. El coeficiente balanceado de la plata cambia la carga transferida, no el potencial de reducción de la plata."
      },
      "choices": [
        {
          "text": {
            "en": "+1.56 V",
            "es": "+1.56 V"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "+2.36 V",
            "es": "+2.36 V"
          },
          "why": {
            "en": "Coefficient error: do not multiply +0.80 V by the silver coefficient. E° values are never scaled by balanced coefficients.",
            "es": "Error de coeficiente: no multipliques +0.80 V por el coeficiente de la plata. Los valores de E° nunca se escalan con los coeficientes balanceados."
          }
        },
        {
          "text": {
            "en": "+0.04 V",
            "es": "+0.04 V"
          },
          "why": {
            "en": "Subtract the negative anode reduction potential instead of adding the two listed potentials.",
            "es": "Resta el potencial de reducción negativo del ánodo en lugar de sumar los dos potenciales tabulados."
          }
        },
        {
          "text": {
            "en": "−1.56 V",
            "es": "−1.56 V"
          },
          "why": {
            "en": "This sign corresponds to reversing the written cell reaction.",
            "es": "Este signo corresponde a invertir la reacción de celda escrita."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.9-4",
      "topic": "9.9",
      "type": "mc",
      "prompt": {
        "en": "The written reverse of the standard Zn/Cu galvanic reaction has E°cell = −1.10 V. What follows?",
        "es": "La reacción inversa escrita de la celda galvánica estándar de Zn/Cu tiene E°celda = −1.10 V. ¿Qué se deduce?"
      },
      "explanation": {
        "en": "A negative E°cell gives positive ΔG° through −nFE°. Driving the written direction under standard conditions requires external work.",
        "es": "Una E°celda negativa da una ΔG° positiva mediante −nFE°. Impulsar la dirección escrita en condiciones estándar requiere trabajo externo."
      },
      "choices": [
        {
          "text": {
            "en": "ΔG° has a − sign and the reaction is galvanic as written.",
            "es": "ΔG° tiene signo − y la reacción es galvánica tal como está escrita."
          },
          "why": {
            "en": "The minus sign in −nFE° makes ΔG° positive for a negative E°.",
            "es": "El signo menos de −nFE° hace positiva ΔG° para una E° negativa."
          }
        },
        {
          "text": {
            "en": "The electrode potentials should be multiplied until E° becomes positive.",
            "es": "Los potenciales de electrodo deben multiplicarse hasta que E° sea positiva."
          },
          "why": {
            "en": "Changing coefficients cannot change the intensive cell potential.",
            "es": "Cambiar los coeficientes no puede cambiar el potencial intensivo de celda."
          }
        },
        {
          "text": {
            "en": "No oxidation or reduction is possible.",
            "es": "No es posible ninguna oxidación ni reducción."
          },
          "why": {
            "en": "External electrical work can drive oxidation and reduction in the unfavorable chemical direction.",
            "es": "El trabajo eléctrico externo puede impulsar oxidación y reducción en la dirección química desfavorable."
          }
        },
        {
          "text": {
            "en": "ΔG° has a + sign; external work is required to drive that direction.",
            "es": "ΔG° tiene signo +; se requiere trabajo externo para impulsar esa dirección."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.9-5",
      "topic": "9.9",
      "type": "numeric",
      "prompt": {
        "en": "For the standard Zn/Cu reaction, n = 2 and E°cell = +1.10 V. Using F = 96,485 C/mol e<sup>−</sup>, calculate ΔG° in kJ/mol.",
        "es": "Para la reacción estándar de Zn/Cu, n = 2 y E°celda = +1.10 V. Con F = 96,485 C/mol e<sup>−</sup>, calcula ΔG° en kJ/mol."
      },
      "explanation": {
        "en": "ΔG° = −nFE° = −(2)(96485)(+1.10) = −212267 J/mol = −212 kJ/mol. J/kJ check: C × V is J, so divide by 1000 for kJ/mol. Required sign: −. The opposite sign is incorrect.",
        "es": "ΔG° = −nFE° = −(2)(96485)(+1.10) = −212267 J/mol = −212 kJ/mol. Comprobación de J/kJ: C × V es J, así que divide entre 1000 para obtener kJ/mol. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -212.26700000000002,
      "display": "−212",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.55
    },
    {
      "id": "9.9-6",
      "topic": "9.9",
      "type": "numeric",
      "prompt": {
        "en": "For Cu(s) + Zn<sup>2+</sup>(aq) → Cu<sup>2+</sup>(aq) + Zn(s), use standard reduction potentials Zn: −0.76 V and Cu: +0.34 V. Calculate E°cell for this written direction in V.",
        "es": "Para Cu(s) + Zn<sup>2+</sup>(aq) → Cu<sup>2+</sup>(aq) + Zn(s), usa los potenciales estándar de reducción Zn: −0.76 V y Cu: +0.34 V. Calcula E°celda para esta dirección escrita en V."
      },
      "explanation": {
        "en": "The written reduction is zinc formation and the oxidation is copper loss. E°cell = −0.76 − (+0.34) = −1.10 V. The reverse direction would have +1.10 V. Required sign: −. The opposite sign is incorrect.",
        "es": "La reducción escrita es la formación de zinc y la oxidación es la pérdida de cobre. E°celda = −0.76 − (+0.34) = −1.10 V. La dirección inversa tendría +1.10 V. Signo requerido: −. El signo opuesto es incorrecto."
      },
      "value": -1.1,
      "display": "−1.10",
      "unit": "V",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005
    },
    {
      "id": "9.10-1",
      "topic": "9.10",
      "type": "mc",
      "prompt": {
        "en": "At fixed temperature for the written cell reaction, Q > 1. What does the Nernst equation imply about E relative to E°?",
        "es": "A temperatura fija para la reacción de celda escrita, Q > 1. ¿Qué implica la ecuación de Nernst sobre E respecto a E°?"
      },
      "explanation": {
        "en": "E = E° − (RT/nF) ln Q. When Q > 1, ln Q is positive and a positive correction is subtracted, so E < E°.",
        "es": "E = E° − (RT/nF) ln Q. Cuando Q > 1, ln Q es positivo y se resta una corrección positiva, así que E < E°."
      },
      "choices": [
        {
          "text": {
            "en": "E must have a − sign whenever Q > 1.",
            "es": "E debe tener signo − siempre que Q > 1."
          },
          "why": {
            "en": "E decreases relative to E°, but it can remain positive.",
            "es": "E disminuye respecto a E°, pero puede seguir siendo positiva."
          }
        },
        {
          "text": {
            "en": "E < E°",
            "es": "E < E°"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "E > E°",
            "es": "E > E°"
          },
          "why": {
            "en": "A positive logarithm lowers the potential because the Nernst correction is subtracted.",
            "es": "Un logaritmo positivo reduce el potencial porque se resta la corrección de Nernst."
          }
        },
        {
          "text": {
            "en": "E must equal E° for every Q.",
            "es": "E debe ser igual a E° para cualquier Q."
          },
          "why": {
            "en": "Equality occurs when the logarithmic correction vanishes, not for every composition.",
            "es": "La igualdad ocurre cuando se anula la corrección logarítmica, no para cualquier composición."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.10-2",
      "topic": "9.10",
      "type": "mc",
      "prompt": {
        "en": "At fixed temperature for the written cell reaction, Q < 1. What happens to E relative to E°?",
        "es": "A temperatura fija para la reacción de celda escrita, Q < 1. ¿Qué ocurre con E respecto a E°?"
      },
      "explanation": {
        "en": "For Q < 1, ln Q is negative. Subtracting the negative Nernst term raises E above E°.",
        "es": "Para Q < 1, ln Q es negativo. Restar el término negativo de Nernst aumenta E por encima de E°."
      },
      "choices": [
        {
          "text": {
            "en": "E > E°",
            "es": "E > E°"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "E < E°",
            "es": "E < E°"
          },
          "why": {
            "en": "The logarithm is negative, so its subtraction increases the potential.",
            "es": "El logaritmo es negativo, así que restarlo aumenta el potencial."
          }
        },
        {
          "text": {
            "en": "E becomes independent of the reaction quotient.",
            "es": "E se vuelve independiente del cociente de reacción."
          },
          "why": {
            "en": "The nonstandard potential still depends on Q through its logarithm.",
            "es": "El potencial no estándar sigue dependiendo de Q mediante su logaritmo."
          }
        },
        {
          "text": {
            "en": "E° must change with Q.",
            "es": "E° debe cambiar con Q."
          },
          "why": {
            "en": "At fixed temperature the standard potential stays fixed; the actual potential changes.",
            "es": "A temperatura fija el potencial estándar permanece fijo; cambia el potencial real."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.10-3",
      "topic": "9.10",
      "type": "mc",
      "prompt": {
        "en": "A cell reaction reaches equilibrium with Q = K. What is its actual cell potential E?",
        "es": "Una reacción de celda alcanza el equilibrio con Q = K. ¿Cuál es su potencial real de celda E?"
      },
      "explanation": {
        "en": "At equilibrium actual ΔG = 0, so E = 0 through ΔG = −nFE. Zero means there is no net electrical driving force. This does not require E° = 0 or K = 1.",
        "es": "En el equilibrio la ΔG real = 0, así que E = 0 mediante ΔG = −nFE. El cero significa que no hay fuerza impulsora eléctrica neta. Esto no requiere E° = 0 ni K = 1."
      },
      "choices": [
        {
          "text": {
            "en": "+1.00 V",
            "es": "+1.00 V"
          },
          "why": {
            "en": "Equilibrium has no net electrical driving force, so the actual cell potential is zero.",
            "es": "En el equilibrio no hay fuerza impulsora eléctrica neta, así que el potencial real de celda es cero."
          }
        },
        {
          "text": {
            "en": "Always E = E°, even when E° is nonzero",
            "es": "Siempre E = E°, incluso cuando E° no es cero"
          },
          "why": {
            "en": "The Nernst correction at Q = K cancels the standard potential.",
            "es": "La corrección de Nernst en Q = K cancela el potencial estándar."
          }
        },
        {
          "text": {
            "en": "−1.00 V",
            "es": "−1.00 V"
          },
          "why": {
            "en": "A nonzero negative potential would favor net change in the reverse direction.",
            "es": "Un potencial negativo distinto de cero favorecería un cambio neto en la dirección inversa."
          }
        },
        {
          "text": {
            "en": "+0.00 V",
            "es": "+0.00 V"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.10-4",
      "topic": "9.10",
      "type": "mc",
      "prompt": {
        "en": "For a Zn/Cu galvanic cell, Q = [Zn<sup>2+</sup>]/[Cu<sup>2+</sup>]. At fixed temperature and zinc concentration, some dissolved Cu<sup>2+</sup> is removed. How does E change?",
        "es": "Para una celda galvánica de Zn/Cu, Q = [Zn<sup>2+</sup>]/[Cu<sup>2+</sup>]. A temperatura y concentración de zinc fijas, se elimina parte del Cu<sup>2+</sup> disuelto. ¿Cómo cambia E?"
      },
      "explanation": {
        "en": "Removing copper ions raises Q by decreasing the denominator. A larger Q increases the subtracted Nernst correction, lowering E.",
        "es": "Eliminar iones cobre aumenta Q al disminuir el denominador. Una Q mayor aumenta la corrección de Nernst que se resta y reduce E."
      },
      "choices": [
        {
          "text": {
            "en": "E° increases, so E cannot change.",
            "es": "E° aumenta, así que E no puede cambiar."
          },
          "why": {
            "en": "Changing composition alters the actual potential, not the fixed-temperature standard potential.",
            "es": "Cambiar la composición altera el potencial real, no el potencial estándar a temperatura fija."
          }
        },
        {
          "text": {
            "en": "E is multiplied by the concentration change.",
            "es": "E se multiplica por el cambio de concentración."
          },
          "why": {
            "en": "The composition dependence is logarithmic, not direct multiplication.",
            "es": "La dependencia de la composición es logarítmica, no una multiplicación directa."
          }
        },
        {
          "text": {
            "en": "E decreases.",
            "es": "E disminuye."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "E increases.",
            "es": "E aumenta."
          },
          "why": {
            "en": "The quotient rises rather than falls when the denominator decreases.",
            "es": "El cociente aumenta en lugar de disminuir cuando se reduce el denominador."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.10-5",
      "topic": "9.10",
      "type": "numeric",
      "prompt": {
        "en": "For the Zn/Cu reaction at 298 K, E°cell = +1.10 V, n = 2 and Q = 100. Use R = 8.314 J/(mol·K) and F = 96,485 C/mol e<sup>−</sup>. Calculate E in V.",
        "es": "Para la reacción de Zn/Cu a 298 K, E°celda = +1.10 V, n = 2 y Q = 100. Usa R = 8.314 J/(mol·K) y F = 96,485 C/mol e<sup>−</sup>. Calcula E en V."
      },
      "explanation": {
        "en": "E = +1.10 − [(8.314 × 298)/(2 × 96485)] ln(100.) = +1.0408735 V, reported as +1.04 V. Q > 1 lowers E relative to E°. Use the natural logarithm and temperature in K. Required sign: +. The opposite sign is incorrect.",
        "es": "E = +1.10 − [(8.314 × 298)/(2 × 96485)] ln(100.) = +1.0408735 V, expresada como +1.04 V. Q > 1 reduce E respecto a E°. Usa el logaritmo natural y la temperatura en K. Signo requerido: +. El signo opuesto es incorrecto."
      },
      "value": 1.0408734999842522,
      "display": "+1.04",
      "unit": "V",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005
    },
    {
      "id": "9.10-6",
      "topic": "9.10",
      "type": "numeric",
      "prompt": {
        "en": "For the Zn/Cu reaction at 298 K, E°cell = +1.10 V, n = 2 and Q = 0.0100. Use R = 8.314 J/(mol·K) and F = 96,485 C/mol e<sup>−</sup>. Calculate E in V.",
        "es": "Para la reacción de Zn/Cu a 298 K, E°celda = +1.10 V, n = 2 y Q = 0.0100. Usa R = 8.314 J/(mol·K) y F = 96,485 C/mol e<sup>−</sup>. Calcula E en V."
      },
      "explanation": {
        "en": "E = +1.10 − [(8.314 × 298)/(2 × 96485)] ln(0.0100) = +1.1591265 V, reported as +1.16 V. Subtracting a negative logarithmic term raises E above E°. Required sign: +. The opposite sign is incorrect.",
        "es": "E = +1.10 − [(8.314 × 298)/(2 × 96485)] ln(0.0100) = +1.1591265 V, expresada como +1.16 V. Restar un término logarítmico negativo aumenta E por encima de E°. Signo requerido: +. El signo opuesto es incorrecto."
      },
      "value": 1.159126500015748,
      "display": "+1.16",
      "unit": "V",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005
    },
    {
      "id": "9.11-1",
      "topic": "9.11",
      "type": "mc",
      "prompt": {
        "en": "A circuit transfers 600. C in 300. s. What current flows?",
        "es": "Un circuito transfiere 600. C en 300. s. ¿Qué corriente fluye?"
      },
      "explanation": {
        "en": "I = q/t = 600. C / 300. s = 2.00 A. An ampere is a coulomb per second.",
        "es": "I = q/t = 600. C / 300. s = 2.00 A. Un ampere es un coulomb por segundo."
      },
      "choices": [
        {
          "text": {
            "en": "2.00 A",
            "es": "2.00 A"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "0.500 A",
            "es": "0.500 A"
          },
          "why": {
            "en": "This divides time by charge instead of charge by time.",
            "es": "Esto divide el tiempo entre la carga en lugar de la carga entre el tiempo."
          }
        },
        {
          "text": {
            "en": "1.80 × 10<sup>5</sup> A",
            "es": "1.80 × 10<sup>5</sup> A"
          },
          "why": {
            "en": "Multiplying charge by time does not calculate current.",
            "es": "Multiplicar la carga por el tiempo no calcula la corriente."
          }
        },
        {
          "text": {
            "en": "600. A",
            "es": "600. A"
          },
          "why": {
            "en": "The charge value alone does not include the elapsed time.",
            "es": "El valor de la carga por sí solo no incluye el tiempo transcurrido."
          }
        }
      ],
      "answer": 0
    },
    {
      "id": "9.11-2",
      "topic": "9.11",
      "type": "mc",
      "prompt": {
        "en": "A copper cathode consumes 0.200 mol e<sup>−</sup> with complete current efficiency. For Cu<sup>2+</sup>(aq) + 2e<sup>−</sup> → Cu(s), how much Cu forms?",
        "es": "Un cátodo de cobre consume 0.200 mol de e<sup>−</sup> con eficiencia de corriente completa. Para Cu<sup>2+</sup>(aq) + 2e<sup>−</sup> → Cu(s), ¿cuánto Cu se forma?"
      },
      "explanation": {
        "en": "The half-reaction consumes 2 mol e<sup>−</sup> per mol Cu. The deposited copper amount is 0.200/2 = 0.100 mol.",
        "es": "La semirreacción consume 2 mol de e<sup>−</sup> por mol de Cu. La cantidad de cobre depositado es 0.200/2 = 0.100 mol."
      },
      "choices": [
        {
          "text": {
            "en": "0.200 mol",
            "es": "0.200 mol"
          },
          "why": {
            "en": "This ignores the two-to-one charge-to-metal stoichiometry.",
            "es": "Esto ignora la estequiometría de carga a metal de dos a uno."
          }
        },
        {
          "text": {
            "en": "0.400 mol",
            "es": "0.400 mol"
          },
          "why": {
            "en": "Divide by the charge coefficient rather than multiplying by it.",
            "es": "Divide entre el coeficiente de carga en lugar de multiplicar por él."
          }
        },
        {
          "text": {
            "en": "0.200 g",
            "es": "0.200 g"
          },
          "why": {
            "en": "The supplied amount is in mol; a mass additionally requires the molar mass.",
            "es": "La cantidad dada está en mol; una masa requiere además la masa molar."
          }
        },
        {
          "text": {
            "en": "0.100 mol",
            "es": "0.100 mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3
    },
    {
      "id": "9.11-3",
      "topic": "9.11",
      "type": "mc",
      "prompt": {
        "en": "At which electrode does metal deposition by reduction occur in an electrolytic cell powered by an external source?",
        "es": "¿En qué electrodo ocurre el depósito de metal por reducción en una celda electrolítica alimentada por una fuente externa?"
      },
      "explanation": {
        "en": "The negative cathode receives e<sup>−</sup> from the external source. Metal cations gain that charge and form metal by reduction. The positive anode is the oxidation electrode.",
        "es": "El cátodo negativo recibe e<sup>−</sup> de la fuente externa. Los cationes metálicos ganan esa carga y forman metal por reducción. El ánodo positivo es el electrodo de oxidación."
      },
      "choices": [
        {
          "text": {
            "en": "Negative anode",
            "es": "Ánodo negativo"
          },
          "why": {
            "en": "This borrows the galvanic anode sign and assigns reduction to the wrong electrode.",
            "es": "Esto toma el signo del ánodo galvánico y asigna la reducción al electrodo incorrecto."
          }
        },
        {
          "text": {
            "en": "The salt bridge only",
            "es": "Solo el puente salino"
          },
          "why": {
            "en": "Deposition requires reduction at an electrode, not ion migration alone.",
            "es": "El depósito requiere reducción en un electrodo, no solo migración de iones."
          }
        },
        {
          "text": {
            "en": "Negative cathode",
            "es": "Cátodo negativo"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Positive anode",
            "es": "Ánodo positivo"
          },
          "why": {
            "en": "The anode carries out oxidation rather than metal-ion reduction.",
            "es": "El ánodo realiza oxidación en lugar de reducción de iones metálicos."
          }
        }
      ],
      "answer": 2
    },
    {
      "id": "9.11-4",
      "topic": "9.11",
      "type": "mc",
      "prompt": {
        "en": "A steady current of 1.50 A flows for 1.20 × 10<sup>2</sup> s. What charge passes through the electrolytic cell?",
        "es": "Una corriente constante de 1.50 A fluye durante 1.20 × 10<sup>2</sup> s. ¿Qué carga pasa por la celda electrolítica?"
      },
      "explanation": {
        "en": "q = It = 1.50 × 120. = 1.80 × 10<sup>2</sup> C. Current multiplied by time gives charge before any Faraday calculation.",
        "es": "q = It = 1.50 × 120. = 1.80 × 10<sup>2</sup> C. La corriente multiplicada por el tiempo da la carga antes de cualquier cálculo de Faraday."
      },
      "choices": [
        {
          "text": {
            "en": "1.50 C",
            "es": "1.50 C"
          },
          "why": {
            "en": "Current is a rate of charge transfer, not the total charge.",
            "es": "La corriente es una tasa de transferencia de carga, no la carga total."
          }
        },
        {
          "text": {
            "en": "1.80 × 10<sup>2</sup> C",
            "es": "1.80 × 10<sup>2</sup> C"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "0.0125 C",
            "es": "0.0125 C"
          },
          "why": {
            "en": "Dividing current by time does not give charge.",
            "es": "Dividir la corriente entre el tiempo no da la carga."
          }
        },
        {
          "text": {
            "en": "80.0 C",
            "es": "80.0 C"
          },
          "why": {
            "en": "Time divided by current is not the required product It.",
            "es": "El tiempo dividido entre la corriente no es el producto requerido It."
          }
        }
      ],
      "answer": 1
    },
    {
      "id": "9.11-5",
      "topic": "9.11",
      "type": "numeric",
      "prompt": {
        "en": "A copper electrode plates metal by Cu<sup>2+</sup>(aq) + 2e<sup>−</sup> → Cu(s). A 2.00 A current flows for 1.93 × 10<sup>3</sup> s with 100% current efficiency. Use F = 96,485 C/mol e<sup>−</sup> and Cu = 63.55 g/mol. Calculate deposited mass in g.",
        "es": "Un electrodo de cobre deposita metal mediante Cu<sup>2+</sup>(aq) + 2e<sup>−</sup> → Cu(s). Una corriente de 2.00 A fluye durante 1.93 × 10<sup>3</sup> s con eficiencia de corriente del 100%. Usa F = 96,485 C/mol e<sup>−</sup> y Cu = 63.55 g/mol. Calcula la masa depositada en g."
      },
      "explanation": {
        "en": "q = It = 3860 C. The amount of e<sup>−</sup> is q/F, and mol Cu = q/(2F). Mass = [3860/(2 × 96485)] × 63.55 = 1.27 g. Include the half-reaction coefficient before using molar mass.",
        "es": "q = It = 3860 C. La cantidad de e<sup>−</sup> es q/F y mol de Cu = q/(2F). Masa = [3860/(2 × 96485)] × 63.55 = 1.27 g. Incluye el coeficiente de la semirreacción antes de usar la masa molar."
      },
      "value": 1.271197595481163,
      "display": "1.27",
      "unit": "g",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005
    },
    {
      "id": "9.11-6",
      "topic": "9.11",
      "type": "numeric",
      "prompt": {
        "en": "For Ag<sup>+</sup>(aq) + e<sup>−</sup> → Ag(s), find the time in s needed to deposit 1.08 g Ag at 0.500 A and 100% current efficiency. Use Ag = 107.87 g/mol and F = 96,485 C/mol e<sup>−</sup>.",
        "es": "Para Ag<sup>+</sup>(aq) + e<sup>−</sup> → Ag(s), calcula el tiempo en s necesario para depositar 1.08 g de Ag a 0.500 A y con eficiencia de corriente del 100%. Usa Ag = 107.87 g/mol y F = 96,485 C/mol e<sup>−</sup>."
      },
      "explanation": {
        "en": "Mol Ag = 1.08/107.87, equal to mol e<sup>−</sup> for this half-reaction. q = (1.08/107.87)(96485), and t = q/I = 1932.03 s. Report 1.93 × 10<sup>3</sup> s.",
        "es": "Mol de Ag = 1.08/107.87, igual a mol de e<sup>−</sup> para esta semirreacción. q = (1.08/107.87)(96485) y t = q/I = 1932.03 s. Expresa 1.93 × 10<sup>3</sup> s."
      },
      "value": 1932.0255863539446,
      "display": "1.93e3",
      "unit": "s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5
    }
  ],
  "units": [
    {
      "id": "J/(mol·K)",
      "label": {
        "en": "J/(mol·K)",
        "es": "J/(mol·K)"
      }
    },
    {
      "id": "kJ/mol",
      "label": {
        "en": "kJ/mol",
        "es": "kJ/mol"
      }
    },
    {
      "id": "K",
      "label": {
        "en": "K",
        "es": "K"
      }
    },
    {
      "id": "V",
      "label": {
        "en": "V",
        "es": "V"
      }
    },
    {
      "id": "C",
      "label": {
        "en": "C",
        "es": "C"
      }
    },
    {
      "id": "A",
      "label": {
        "en": "A",
        "es": "A"
      }
    },
    {
      "id": "s",
      "label": {
        "en": "s",
        "es": "s"
      }
    },
    {
      "id": "g",
      "label": {
        "en": "g",
        "es": "g"
      }
    },
    {
      "id": "mol",
      "label": {
        "en": "mol",
        "es": "mol"
      }
    },
    {
      "id": "ratio",
      "label": {
        "en": "no units",
        "es": "sin unidades"
      }
    }
  ],
  "copy": {
    "title": "AP Chemistry Unit 9 Practice",
    "es": {
      "ZornScience home": "Inicio de ZornScience",
      "Activity tools": "Herramientas de la actividad",
      "Instructions": "Instrucciones",
      "Close": "Cerrar",
      "Close instructions": "Cerrar instrucciones",
      "Share": "Compartir",
      "Share activity": "Compartir actividad",
      "Share this activity": "Compartir esta actividad",
      "Close share options": "Cerrar opciones para compartir",
      "Share link": "Enlace para compartir",
      "Copy link": "Copiar enlace",
      "Email": "Correo electrónico",
      "Link copied.": "Enlace copiado.",
      "Link selected. Copy it with Ctrl+C or Command+C.": "Enlace seleccionado. Cópialo con Ctrl+C o Command+C.",
      "Share a fresh activity. Your answers and results are not included.": "Comparte una actividad nueva. Tus respuestas y resultados no se incluyen.",
      "Catch up at your own pace.": "Ponte al corriente a tu ritmo.",
      "Topic": "Tema",
      "Mixed review": "Repaso mixto",
      "Start practice": "Comenzar práctica",
      "Choose a topic": "Selección de un tema",
      "Submit once per question. Read the explanation, then continue. Your score counts correct answers; a significant figure note does not remove a point.": "Envía una respuesta por pregunta. Lee la explicación y continúa. Tu puntaje cuenta las respuestas correctas; una nota sobre cifras significativas no quita un punto.",
      "At the end, Try again shuffles the questions and answer choices. Choose another topic to build a new set.": "Al terminar, Intentar de nuevo cambia el orden de las preguntas y las opciones. Elige otro tema para crear una serie nueva.",
      "Reference": "Consulta",
      "Scientific notation: you may type 1.51e23 in the number field.": "Notación científica: puedes escribir 1.51e23 en el campo numérico.",
      "Your answers stay in this tab. No account needed.": "Tus respuestas se quedan en esta pestaña. No necesitas una cuenta.",
      "← Back to the lesson": "← Volver a la lección",
      "Check answer": "Comprobar respuesta",
      "Next question": "Siguiente pregunta",
      "See results": "Ver resultados",
      "Question {n} of {total}": "Pregunta {n} de {total}",
      "{n} of {total} correct": "{n} de {total} correctas",
      "Set progress": "Avance de la serie",
      "Numerical answer": "Respuesta numérica",
      "Unit": "Unidad",
      "Choose a unit": "Elige una unidad",
      "Choose one answer.": "Elige una respuesta.",
      "Use {n} significant figures.": "Usa {n} cifras significativas.",
      "Use {n} decimal places.": "Usa {n} decimales.",
      "Use 1 decimal place.": "Usa 1 decimal.",
      "Enter an exact whole number.": "Escribe un número entero exacto.",
      "Enter a number using a decimal point or scientific notation.": "Escribe un número con punto decimal o notación científica.",
      "Select an answer first.": "Primero selecciona una respuesta.",
      "Choose a unit first.": "Primero elige una unidad.",
      "Correct.": "Correcto.",
      "Incorrect.": "Incorrecto.",
      "Correct value; check significant figures.": "Valor correcto; revisa las cifras significativas.",
      "Correct value; check decimal places.": "Valor correcto; revisa los decimales.",
      "Your value is within tolerance, but the unit is incorrect.": "Tu valor está dentro de la tolerancia, pero la unidad es incorrecta.",
      "The unit is incorrect. Use {unit}.": "La unidad es incorrecta. Usa {unit}.",
      "Use {n} significant figures in your final answer.": "Usa {n} cifras significativas en tu respuesta final.",
      "Round your final answer to {n} decimal places.": "Redondea tu respuesta final a {n} decimales.",
      "Correct answer: ": "Respuesta correcta: ",
      "Your set is complete": "Tu serie está completa",
      "Try again": "Intentar de nuevo",
      "Choose another topic": "Elegir otro tema",
      "Results by topic": "Resultados por tema",
      "Review these questions": "Repaso de estas preguntas",
      "All correct. Try another topic when you are ready.": "Todo correcto. Intenta otro tema cuando quieras.",
      "{score} of {total} correct ({percent}%).": "{score} de {total} correctas ({percent}%).",
      "{n} questions": "{n} preguntas",
      "Enter only the number in the number field and select the unit from the list. The activity does not convert units.": "Escribe solo el número en el campo numérico y selecciona la unidad de la lista. La actividad no convierte unidades.",
      "AP Chemistry Unit 9 Practice": "Práctica de la unidad 9 de Química AP",
      "AP Chemistry · Unit 9": "Química AP · Unidad 9",
      "Choose a topic, then start. Mixed review includes all eleven topics.": "Elige un tema y comienza. El repaso mixto incluye los once temas.",
      "Choose one topic for six questions, or Mixed review for all 66. Read the feedback after each answer.": "Elige un tema para seis preguntas o Repaso mixto para las 66. Lee los comentarios después de cada respuesta.",
      "Select one answer, or enter a number and choose its unit. Keep the sign on entropy changes, free-energy changes and potentials. Use K for temperature. Choose no units for the equilibrium constant K.": "Selecciona una respuesta o escribe un número y elige su unidad. Conserva el signo en los cambios de entropía, los cambios de energía libre y los potenciales. Usa K para la temperatura. Elige sin unidades para la constante de equilibrio K.",
      "No timer. Use scratch paper and a calculator. The thermodynamics and electrochemistry reference is below.": "Sin límite de tiempo. Usa papel y calculadora. La referencia de termodinámica y electroquímica está abajo.",
      "Aligned practice for AP Chemistry CED topics 9.1 to 9.11. Original ZornScience questions.": "Práctica alineada con los temas 9.1 a 9.11 del CED de Química AP. Preguntas originales de ZornScience.",
      "Model: standard free energy versus temperature": "Modelo: energía libre estándar contra temperatura",
      "A straight line starts at +60.0 kJ/mol at 0 K, crosses zero at 600 K, and reaches −20.0 kJ/mol at 800 K. The model holds enthalpy at +60.0 kJ/mol and entropy change at +100. J/(mol·K).": "Una línea recta empieza en +60.0 kJ/mol a 0 K, cruza cero a 600 K y llega a −20.0 kJ/mol a 800 K. El modelo mantiene la entalpía en +60.0 kJ/mol y el cambio de entropía en +100. J/(mol·K).",
      "Schematic model with constant ΔH° and ΔS°. The line crosses ΔG° = 0 at 600 K. Values are repeated in the questions.": "Modelo esquemático con ΔH° y ΔS° constantes. La línea cruza ΔG° = 0 a 600 K. Los valores se repiten en las preguntas.",
      "Salt bridge": "Puente salino",
      "Anions ←": "Aniones ←",
      "Cations →": "Cationes →",
      "Anode (−)": "Ánodo (−)",
      "Cathode (+)": "Cátodo (+)",
      "Model: zinc/copper galvanic cell": "Modelo: celda galvánica de zinc/cobre",
      "Zinc is the negative anode and copper is the positive cathode. Charge carriers in the external wire move from zinc to copper. Nitrate anions in the salt bridge move toward the anode; potassium cations move toward the cathode.": "El zinc es el ánodo negativo y el cobre es el cátodo positivo. Los portadores de carga del alambre externo se mueven del zinc al cobre. Los aniones nitrato del puente salino se mueven hacia el ánodo; los cationes potasio se mueven hacia el cátodo.",
      "Galvanic cell model, not to scale. Solid wire: external charge flow. Dashed bridge: ion migration. Anions move toward zinc; cations toward copper.": "Modelo de celda galvánica, sin escala. Alambre continuo: flujo de carga externo. Puente discontinuo: migración de iones. Los aniones se mueven hacia el zinc; los cationes hacia el cobre.",
      "Thermodynamics and units": "Termodinámica y unidades",
      "Use the values below and keep extra digits until the final answer. Entropies are in J/(mol·K); reaction enthalpies and free energies are in kJ/mol. Reaction quantities refer to the balanced equation as written.": "Usa los valores de abajo y conserva dígitos adicionales hasta la respuesta final. Las entropías están en J/(mol·K); las entalpías y energías libres de reacción están en kJ/mol. Las cantidades de reacción corresponden a la ecuación balanceada tal como está escrita.",
      "ΔS°rxn = Σ S°(products) − Σ S°(reactants)": "ΔS°rxn = Σ S°(productos) − Σ S°(reactivos)",
      "Multiply each S° by its balanced coefficient. S° of an element at room temperature is not zero, unlike ΔH°f of an element in its standard state. A perfect crystal at 0 K has zero absolute entropy.": "Multiplica cada S° por su coeficiente balanceado. La S° de un elemento a temperatura ambiente no es cero, a diferencia de ΔH°f de un elemento en su estado estándar. Un cristal perfecto a 0 K tiene entropía absoluta cero.",
      "J/kJ check: divide ΔS° in J/(mol·K) by 1000 before combining TΔS° with ΔH° in kJ/mol. With R in J/(mol·K), RT ln K is in J/mol; divide by 1000 for kJ/mol. Use T in K, never °C.": "Comprobación de J/kJ: divide ΔS° en J/(mol·K) entre 1000 antes de combinar TΔS° con ΔH° en kJ/mol. Con R en J/(mol·K), RT ln K está en J/mol; divide entre 1000 para obtener kJ/mol. Usa T en K, nunca °C.",
      "Keep the + or − sign on every entropy-change, free-energy and cell-potential answer. The opposite sign is incorrect. Positive values may be typed with or without +. Precision notes are advisory. The unit selector does not convert values.": "Conserva el signo + o − en cada respuesta de cambio de entropía, energía libre y potencial de celda. El signo opuesto es incorrecto. Los valores positivos pueden escribirse con o sin +. Las notas de precisión son orientativas. El selector de unidades no convierte valores.",
      "Favorability, equilibrium and coupling": "Favorabilidad, equilibrio y acoplamiento",
      "ΔG° < 0: standard forward direction is thermodynamically favorable and K > 1. ΔG° > 0: it is unfavorable and K < 1. At actual equilibrium Q = K and ΔG = 0.": "ΔG° < 0: la dirección directa estándar es termodinámicamente favorable y K > 1. ΔG° > 0: es desfavorable y K < 1. En el equilibrio real Q = K y ΔG = 0.",
      "For constant ΔH° and ΔS°: −/+ favors all positive T; +/− favors none; −/− favors low T; +/+ favors high T. The boundary is T = ΔH°/ΔS° with matching energy units.": "Para ΔH° y ΔS° constantes: −/+ favorece toda T positiva; +/− no favorece ninguna; −/− favorece T baja; +/+ favorece T alta. El límite es T = ΔH°/ΔS° con unidades de energía compatibles.",
      "A negative free-energy change does not imply a fast reaction. A high activation barrier can make a favorable reaction slow. A catalyst changes rates, not ΔG° or K at fixed T.": "Un cambio de energía libre negativo no implica una reacción rápida. Una barrera de activación alta puede hacer lenta una reacción favorable. Un catalizador cambia las velocidades, no ΔG° ni K a T fija.",
      "Coupled reactions must transfer energy through a physical mechanism. Add their ΔG° values with the balanced equations. Reverse the sign when reversing a step; multiply ΔG° when scaling a step. Light or electrical work can drive an unfavorable chemical process.": "Las reacciones acopladas deben transferir energía mediante un mecanismo físico. Suma sus valores de ΔG° con las ecuaciones balanceadas. Invierte el signo al invertir una etapa; multiplica ΔG° al escalar una etapa. La luz o el trabajo eléctrico pueden impulsar un proceso químico desfavorable.",
      "Thermodynamic data": "Datos termodinámicos",
      "Rounded classroom values at 298 K. S°: J/(mol·K). ΔH°f: kJ/mol. Assume the given ΔH° and ΔS° remain approximately constant when a problem changes temperature.": "Valores redondeados para clase a 298 K. S°: J/(mol·K). ΔH°f: kJ/mol. Supón que las ΔH° y ΔS° dadas permanecen aproximadamente constantes cuando un problema cambia la temperatura.",
      "Absolute entropies and formation enthalpies": "Entropías absolutas y entalpías de formación",
      "Species": "Especie",
      "not used": "no se usa",
      "Electrochemical cells": "Celdas electroquímicas",
      "E°cell = E°(cathode) − E°(anode)": "E°cell = E°(cátodo) − E°(ánodo)",
      "With E in V and F in C/mol, nFE is in J/mol. Divide by 1000 for kJ/mol. Standard reduction potentials are never multiplied by stoichiometric coefficients. The balanced charge transfer determines n.": "Con E en V y F en C/mol, nFE está en J/mol. Divide entre 1000 para obtener kJ/mol. Los potenciales estándar de reducción nunca se multiplican por coeficientes estequiométricos. La transferencia de carga balanceada determina n.",
      "Oxidation is at the anode; reduction is at the cathode. A galvanic (voltaic) cell produces electrical work. An electrolytic cell requires external electrical work. Electrode signs change between these cell types, but oxidation and reduction roles do not.": "La oxidación ocurre en el ánodo; la reducción ocurre en el cátodo. Una celda galvánica (voltaica) produce trabajo eléctrico. Una celda electrolítica requiere trabajo eléctrico externo. Los signos de los electrodos cambian entre estos tipos de celda, pero sus funciones de oxidación y reducción no cambian.",
      "For Q > 1, E < E°. For Q < 1, E > E°. At equilibrium Q = K and E = 0. Use the natural logarithm and ideal dilute activities. For Zn/Cu, Q is the zinc-ion activity divided by copper-ion activity; pure metals are omitted.": "Para Q > 1, E < E°. Para Q < 1, E > E°. En el equilibrio Q = K y E = 0. Usa el logaritmo natural y actividades ideales diluidas. Para Zn/Cu, Q es la actividad del ion zinc dividida entre la del ion cobre; los metales puros se omiten.",
      "Standard reduction potentials at 298 K": "Potenciales estándar de reducción a 298 K",
      "Reduction half-reaction": "Semirreacción de reducción",
      "Electrolysis and Faraday’s law": "Electrólisis y ley de Faraday",
      "Use current in A, charge in C and time in s. Divide mol of transferred charge carriers by the balanced half-reaction coefficient to find mol of metal. Multiply by molar mass in g/mol for deposited mass. Calculations assume 100% current efficiency unless stated otherwise.": "Usa corriente en A, carga en C y tiempo en s. Divide los mol de portadores de carga transferidos entre el coeficiente balanceado de la semirreacción para obtener mol de metal. Multiplica por la masa molar en g/mol para obtener la masa depositada. Los cálculos suponen una eficiencia de corriente del 100% salvo que se indique otra cosa.",
      "Atomic masses (g/mol)": "Masas atómicas (g/mol)"
    }
  }
};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit9-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
