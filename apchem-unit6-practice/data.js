(function () {
  "use strict";
  // Original bilingual questions. Answers worked first in TESTING.md.
  var bank = {
  "topics": [
    {
      "id": "6.1",
      "title": {
        "en": "6.1 Endothermic and Exothermic Processes",
        "es": "6.1 Procesos endotérmicos y exotérmicos"
      }
    },
    {
      "id": "6.2",
      "title": {
        "en": "6.2 Energy Diagrams",
        "es": "6.2 Diagramas de energía"
      }
    },
    {
      "id": "6.3",
      "title": {
        "en": "6.3 Heat Transfer and Thermal Equilibrium",
        "es": "6.3 Transferencia de calor y equilibrio térmico"
      }
    },
    {
      "id": "6.4",
      "title": {
        "en": "6.4 Heat Capacity and Calorimetry",
        "es": "6.4 Capacidad calorífica y calorimetría"
      }
    },
    {
      "id": "6.5",
      "title": {
        "en": "6.5 Energy of Phase Changes",
        "es": "6.5 Energía de los cambios de fase"
      }
    },
    {
      "id": "6.6",
      "title": {
        "en": "6.6 Introduction to Enthalpy of Reaction",
        "es": "6.6 Introducción a la entalpía de reacción"
      }
    },
    {
      "id": "6.7",
      "title": {
        "en": "6.7 Bond Enthalpies",
        "es": "6.7 Entalpías de enlace"
      }
    },
    {
      "id": "6.8",
      "title": {
        "en": "6.8 Enthalpy of Formation",
        "es": "6.8 Entalpía de formación"
      }
    },
    {
      "id": "6.9",
      "title": {
        "en": "6.9 Hess's Law",
        "es": "6.9 Ley de Hess"
      }
    }
  ],
  "questions": [
    {
      "id": "6.1-1",
      "topic": "6.1",
      "type": "mc",
      "prompt": {
        "en": "A reaction takes place in a sealed thin glass vial immersed in water. You define the reacting chemicals as the system. Which belongs to the surroundings?",
        "es": "Una reacción ocurre en un vial de vidrio delgado y sellado sumergido en agua. Defines las sustancias que reaccionan como el sistema. ¿Qué pertenece a los alrededores?"
      },
      "choices": [
        {
          "text": {
            "en": "Only the products",
            "es": "Solo los productos"
          },
          "why": {
            "en": "Products remain part of the defined reacting system.",
            "es": "Los productos siguen siendo parte del sistema que reacciona."
          }
        },
        {
          "text": {
            "en": "All reacting chemicals",
            "es": "Todas las sustancias que reaccionan"
          },
          "why": {
            "en": "The reacting chemicals are the system itself, not the surroundings.",
            "es": "Las sustancias que reaccionan son el sistema mismo, no los alrededores."
          }
        },
        {
          "text": {
            "en": "The water and glass vial",
            "es": "El agua y el vial de vidrio"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only the reactants",
            "es": "Solo los reactivos"
          },
          "why": {
            "en": "Reactants are inside the defined system.",
            "es": "Los reactivos están dentro del sistema definido."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The chosen boundary makes the reacting chemicals the system. The water and glass are surroundings that can exchange heat with it.",
        "es": "El límite elegido hace que las sustancias que reaccionan sean el sistema. El agua y el vidrio son alrededores que pueden intercambiar calor con él."
      }
    },
    {
      "id": "6.1-2",
      "topic": "6.1",
      "type": "mc",
      "prompt": {
        "en": "A salt dissolves at constant pressure and cools the surrounding water. Treat the dissolution as the system. Which description fits?",
        "es": "Una sal se disuelve a presión constante y enfría el agua de los alrededores. Considera la disolución como el sistema. ¿Qué descripción corresponde?"
      },
      "choices": [
        {
          "text": {
            "en": "No heat transfer because temperature falls",
            "es": "No hay transferencia de calor porque baja la temperatura"
          },
          "why": {
            "en": "The water cools precisely because it transfers heat to the system.",
            "es": "El agua se enfría precisamente porque transfiere calor al sistema."
          }
        },
        {
          "text": {
            "en": "Endothermic: q(system) > 0 and ΔH > 0",
            "es": "Endotérmico: q(sistema) > 0 y ΔH > 0"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Exothermic: q(system) < 0 and ΔH < 0",
            "es": "Exotérmico: q(sistema) < 0 y ΔH < 0"
          },
          "why": {
            "en": "Cooling water supplies heat to the dissolution system, so the process is endothermic.",
            "es": "El agua que se enfría aporta calor al sistema de disolución, así que el proceso es endotérmico."
          }
        },
        {
          "text": {
            "en": "Endothermic: q(system) < 0 and ΔH < 0",
            "es": "Endotérmico: q(sistema) < 0 y ΔH < 0"
          },
          "why": {
            "en": "Endothermic means heat enters the system; both signs must be positive here.",
            "es": "Endotérmico significa que entra calor al sistema; ambos signos deben ser positivos aquí."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Heat enters the system: q(system) has a + sign. At constant pressure, ΔH also has a + sign. The surroundings lose thermal energy and cool.",
        "es": "Entra calor al sistema: q(sistema) tiene signo +. A presión constante, ΔH también tiene signo +. Los alrededores pierden energía térmica y se enfrían."
      }
    },
    {
      "id": "6.1-3",
      "topic": "6.1",
      "type": "mc",
      "prompt": {
        "en": "An insulated container includes a system and its surroundings. Only heat passes between them, and no work occurs. What follows from the first law of thermodynamics?",
        "es": "Un recipiente aislado incluye un sistema y sus alrededores. Solo pasa calor entre ellos y no se realiza trabajo. ¿Qué se deduce de la primera ley de la termodinámica?"
      },
      "choices": [
        {
          "text": {
            "en": "q(system) = −q(surroundings)",
            "es": "q(sistema) = −q(alrededores)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both heat transfers must have a + sign",
            "es": "Ambas transferencias de calor deben tener signo +"
          },
          "why": {
            "en": "If one gains heat (+), the other loses heat (−). Both cannot gain energy in isolation.",
            "es": "Si uno gana calor (+), el otro pierde calor (−). Ambos no pueden ganar energía en aislamiento."
          }
        },
        {
          "text": {
            "en": "Both heat transfers must have a − sign",
            "es": "Ambas transferencias de calor deben tener signo −"
          },
          "why": {
            "en": "Both cannot lose energy when no energy leaves the insulated container.",
            "es": "Ambos no pueden perder energía cuando no sale energía del recipiente aislado."
          }
        },
        {
          "text": {
            "en": "The larger sample must gain more heat than the smaller sample loses",
            "es": "La muestra mayor debe ganar más calor del que pierde la menor"
          },
          "why": {
            "en": "Different masses change temperature responses, not conservation of transferred energy.",
            "es": "Las masas distintas cambian las respuestas de temperatura, no la conservación de la energía transferida."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Energy is conserved: q(system) + q(surroundings) = 0. Their magnitudes match and their signs are opposite.",
        "es": "La energía se conserva: q(sistema) + q(alrededores) = 0. Sus magnitudes son iguales y sus signos son opuestos."
      }
    },
    {
      "id": "6.1-4",
      "topic": "6.1",
      "type": "mc",
      "prompt": {
        "en": "An exothermic reaction runs at constant pressure in a thermostatted vessel. Which statement must be true?",
        "es": "Una reacción exotérmica ocurre a presión constante en un recipiente con termostato. ¿Qué afirmación debe ser verdadera?"
      },
      "choices": [
        {
          "text": {
            "en": "The system temperature must rise",
            "es": "La temperatura del sistema debe aumentar"
          },
          "why": {
            "en": "Heat can leave while a thermostat maintains a constant temperature.",
            "es": "Puede salir calor mientras un termostato mantiene una temperatura constante."
          }
        },
        {
          "text": {
            "en": "ΔH has a + sign because the surroundings gain heat",
            "es": "ΔH tiene signo + porque los alrededores ganan calor"
          },
          "why": {
            "en": "The sign of reaction ΔH describes the system, not the heat gained by the surroundings.",
            "es": "El signo de ΔH de reacción describe el sistema, no el calor que ganan los alrededores."
          }
        },
        {
          "text": {
            "en": "Heat and temperature are the same quantity",
            "es": "El calor y la temperatura son la misma cantidad"
          },
          "why": {
            "en": "Heat is energy transferred due to a temperature difference; temperature describes thermal conditions.",
            "es": "El calor es energía transferida por una diferencia de temperatura; la temperatura describe las condiciones térmicas."
          }
        },
        {
          "text": {
            "en": "ΔH has a − sign, even if the thermostat holds the system temperature constant",
            "es": "ΔH tiene signo −, aunque el termostato mantenga constante la temperatura del sistema"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Exothermic means q(system) and ΔH have a − sign at constant pressure. Removing that heat can prevent a system temperature rise.",
        "es": "Exotérmico significa que q(sistema) y ΔH tienen signo − a presión constante. Retirar ese calor puede impedir que aumente la temperatura del sistema."
      }
    },
    {
      "id": "6.1-5",
      "topic": "6.1",
      "type": "numeric",
      "prompt": {
        "en": "The surroundings lose 850 J to a system. No other heat exchange occurs. Find q(system), including its sign, to three significant figures.",
        "es": "Los alrededores pierden 850 J hacia un sistema. No ocurre otro intercambio de calor. Calcula q(sistema), con su signo, con tres cifras significativas."
      },
      "value": 850,
      "display": "+850.",
      "unit": "J",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.55,
      "explanation": {
        "en": "q(system) = −q(surroundings) = −(−850 J) = +850. J. The sign must be + because the system gains heat; a − sign is incorrect.",
        "es": "q(sistema) = −q(alrededores) = −(−850 J) = +850. J. El signo debe ser + porque el sistema gana calor; un signo − es incorrecto."
      }
    },
    {
      "id": "6.1-6",
      "topic": "6.1",
      "type": "numeric",
      "prompt": {
        "en": "A system transfers heat to surroundings that gain 1.25 kJ. Find q(system), including its sign, to three significant figures.",
        "es": "Un sistema transfiere calor a los alrededores, que ganan 1.25 kJ. Calcula q(sistema), con su signo, con tres cifras significativas."
      },
      "value": -1.25,
      "display": "−1.25",
      "unit": "kJ",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055,
      "explanation": {
        "en": "q(system) = −(+1.25 kJ) = −1.25 kJ. The sign must be − because heat leaves the system; a + sign is incorrect.",
        "es": "q(sistema) = −(+1.25 kJ) = −1.25 kJ. El signo debe ser − porque sale calor del sistema; un signo + es incorrecto."
      }
    },
    {
      "id": "6.2-1",
      "topic": "6.2",
      "type": "mc",
      "prompt": {
        "en": "Model energy diagram: reactants 40, peak 100, products 10, all in kJ/mol. What is ΔH for the forward reaction?",
        "es": "Diagrama de energía modelo: reactivos 40, pico 100, productos 10, todo en kJ/mol. ¿Cuál es ΔH para la reacción directa?"
      },
      "choices": [
        {
          "text": {
            "en": "−90 kJ/mol, exothermic",
            "es": "−90 kJ/mol, exotérmico"
          },
          "why": {
            "en": "Peak minus products is a reverse barrier, not the endpoint difference.",
            "es": "Pico menos productos es una barrera inversa, no la diferencia entre extremos."
          }
        },
        {
          "text": {
            "en": "−30 kJ/mol, exothermic",
            "es": "−30 kJ/mol, exotérmico"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "+30 kJ/mol, endothermic",
            "es": "+30 kJ/mol, endotérmico"
          },
          "why": {
            "en": "This reverses products minus reactants. The products are lower.",
            "es": "Esto invierte productos menos reactivos. Los productos están más abajo."
          }
        },
        {
          "text": {
            "en": "+60 kJ/mol, endothermic",
            "es": "+60 kJ/mol, endotérmico"
          },
          "why": {
            "en": "Peak minus reactants is an activation barrier, not ΔH.",
            "es": "Pico menos reactivos es una barrera de activación, no ΔH."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "ΔH = 10 − 40 = −30 kJ/mol. Lower product enthalpy means heat is released, so the process is exothermic.",
        "es": "ΔH = 10 − 40 = −30 kJ/mol. La menor entalpía de los productos significa que se libera calor, así que el proceso es exotérmico."
      },
      "exo": true
    },
    {
      "id": "6.2-2",
      "topic": "6.2",
      "type": "mc",
      "prompt": {
        "en": "Model energy diagram: reactants 40, peak 100, products 10, all in kJ/mol. What is ΔH when the reaction is reversed?",
        "es": "Diagrama de energía modelo: reactivos 40, pico 100, productos 10, todo en kJ/mol. ¿Cuál es ΔH cuando se invierte la reacción?"
      },
      "choices": [
        {
          "text": {
            "en": "+30 kJ/mol, endothermic",
            "es": "+30 kJ/mol, endotérmico"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "−30 kJ/mol, exothermic",
            "es": "−30 kJ/mol, exotérmico"
          },
          "why": {
            "en": "Reversing a reaction reverses the sign of ΔH.",
            "es": "Invertir una reacción invierte el signo de ΔH."
          }
        },
        {
          "text": {
            "en": "+90 kJ/mol, endothermic",
            "es": "+90 kJ/mol, endotérmico"
          },
          "why": {
            "en": "This uses the peak rather than the two endpoints.",
            "es": "Esto usa el pico en vez de los dos extremos."
          }
        },
        {
          "text": {
            "en": "−60 kJ/mol, exothermic",
            "es": "−60 kJ/mol, exotérmico"
          },
          "why": {
            "en": "The forward activation barrier does not give reverse ΔH.",
            "es": "La barrera de activación directa no da ΔH inversa."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "For the reverse reaction, ΔH = 40 − 10 = +30 kJ/mol. The reverse process absorbs heat.",
        "es": "Para la reacción inversa, ΔH = 40 − 10 = +30 kJ/mol. El proceso inverso absorbe calor."
      },
      "exo": true
    },
    {
      "id": "6.2-3",
      "topic": "6.2",
      "type": "mc",
      "prompt": {
        "en": "Model energy diagram: reactants 40, peak 100, products 10, all in kJ/mol. A catalyst lowers only the peak. What happens to ΔH?",
        "es": "Diagrama de energía modelo: reactivos 40, pico 100, productos 10, todo en kJ/mol. Un catalizador baja solo el pico. ¿Qué ocurre con ΔH?"
      },
      "choices": [
        {
          "text": {
            "en": "It becomes +30 kJ/mol",
            "es": "Se vuelve +30 kJ/mol"
          },
          "why": {
            "en": "A catalyst does not reverse the reaction or exchange its endpoints.",
            "es": "Un catalizador no invierte la reacción ni intercambia sus extremos."
          }
        },
        {
          "text": {
            "en": "It becomes more negative",
            "es": "Se vuelve más negativo"
          },
          "why": {
            "en": "A lower peak changes the barrier, not the enthalpy difference.",
            "es": "Un pico menor cambia la barrera, no la diferencia de entalpía."
          }
        },
        {
          "text": {
            "en": "It becomes less negative",
            "es": "Se vuelve menos negativo"
          },
          "why": {
            "en": "The product and reactant enthalpies are unchanged.",
            "es": "Las entalpías de productos y reactivos no cambian."
          }
        },
        {
          "text": {
            "en": "It remains −30 kJ/mol",
            "es": "Permanece en −30 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "ΔH stays 10 − 40 = −30 kJ/mol. It depends on the endpoints, not the peak.",
        "es": "ΔH sigue siendo 10 − 40 = −30 kJ/mol. Depende de los extremos, no del pico."
      },
      "exo": true
    },
    {
      "id": "6.2-4",
      "topic": "6.2",
      "type": "mc",
      "prompt": {
        "en": "Model energy diagram: reactants 15, peak 80, products 45, all in kJ/mol. At constant pressure, the surrounding water supplies all the reaction heat without a heater. What happens to the water?",
        "es": "Diagrama de energía modelo: reactivos 15, pico 80, productos 45, todo en kJ/mol. A presión constante, el agua de los alrededores aporta todo el calor de reacción sin calentador. ¿Qué ocurre con el agua?"
      },
      "choices": [
        {
          "text": {
            "en": "Its temperature must remain constant",
            "es": "Su temperatura debe permanecer constante"
          },
          "why": {
            "en": "The water supplies energy without replacement, so it cools.",
            "es": "El agua aporta energía sin reposición, así que se enfría."
          }
        },
        {
          "text": {
            "en": "It gains the heat lost by the reaction",
            "es": "Gana el calor que pierde la reacción"
          },
          "why": {
            "en": "The reaction gains heat here; it does not lose heat.",
            "es": "Aquí la reacción gana calor; no pierde calor."
          }
        },
        {
          "text": {
            "en": "It cools as the reaction absorbs heat",
            "es": "Se enfría cuando la reacción absorbe calor"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It warms because ΔH is positive",
            "es": "Se calienta porque ΔH es positivo"
          },
          "why": {
            "en": "Positive reaction ΔH describes heat gained by the system, not by the water.",
            "es": "El ΔH positivo de reacción describe el calor que gana el sistema, no el agua."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "ΔH = 45 − 15 = +30 kJ/mol, endothermic. The surrounding water loses heat and its temperature falls.",
        "es": "ΔH = 45 − 15 = +30 kJ/mol, endotérmico. El agua de los alrededores pierde calor y baja su temperatura."
      },
      "endo": true
    },
    {
      "id": "6.2-5",
      "topic": "6.2",
      "type": "numeric",
      "prompt": {
        "en": "Model energy diagram: reactants 40, peak 100, products 10, all in kJ/mol. Calculate forward ΔH with its sign and one decimal place.",
        "es": "Diagrama de energía modelo: reactivos 40, pico 100, productos 10, todo en kJ/mol. Calcula ΔH directa con su signo y un decimal."
      },
      "value": -30,
      "display": "−30.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "ΔH = products − reactants = 10.0 − 40.0 = −30.0 kJ/mol. The sign must be −; +30.0 kJ/mol would describe the reverse reaction.",
        "es": "ΔH = productos − reactivos = 10.0 − 40.0 = −30.0 kJ/mol. El signo debe ser −; +30.0 kJ/mol describiría la reacción inversa."
      },
      "exo": true
    },
    {
      "id": "6.2-6",
      "topic": "6.2",
      "type": "numeric",
      "prompt": {
        "en": "Model energy diagram: reactants 15, peak 80, products 45, all in kJ/mol. Calculate forward ΔH with its sign and one decimal place.",
        "es": "Diagrama de energía modelo: reactivos 15, pico 80, productos 45, todo en kJ/mol. Calcula ΔH directa con su signo y un decimal."
      },
      "value": 30,
      "display": "+30.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "ΔH = 45.0 − 15.0 = +30.0 kJ/mol. The sign must be + because products are higher in enthalpy; a − sign is incorrect.",
        "es": "ΔH = 45.0 − 15.0 = +30.0 kJ/mol. El signo debe ser + porque los productos tienen mayor entalpía; un signo − es incorrecto."
      },
      "endo": true
    },
    {
      "id": "6.3-1",
      "topic": "6.3",
      "type": "mc",
      "prompt": {
        "en": "Two water samples at 70 °C and 20 °C make thermal contact in an insulated container. What is the initial direction of net heat flow?",
        "es": "Dos muestras de agua a 70 °C y 20 °C entran en contacto térmico en un recipiente aislado. ¿Cuál es la dirección inicial del flujo neto de calor?"
      },
      "choices": [
        {
          "text": {
            "en": "From the hotter sample to the colder sample",
            "es": "De la muestra más caliente a la más fría"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "From the colder sample to the hotter sample",
            "es": "De la muestra más fría a la más caliente"
          },
          "why": {
            "en": "Spontaneous net heat transfer follows the temperature decrease, not the increase.",
            "es": "La transferencia neta espontánea de calor sigue la disminución de temperatura, no el aumento."
          }
        },
        {
          "text": {
            "en": "From the larger sample to the smaller sample, regardless of temperature",
            "es": "De la muestra mayor a la menor, sin importar la temperatura"
          },
          "why": {
            "en": "Temperature difference determines direction; mass affects the amount and temperature change.",
            "es": "La diferencia de temperatura determina la dirección; la masa afecta la cantidad y el cambio de temperatura."
          }
        },
        {
          "text": {
            "en": "No heat flows until the temperatures are equal",
            "es": "No fluye calor hasta que las temperaturas son iguales"
          },
          "why": {
            "en": "A temperature difference drives heat flow; equal temperatures end net heat flow.",
            "es": "Una diferencia de temperatura impulsa el flujo de calor; las temperaturas iguales terminan el flujo neto."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Heat flows from higher to lower temperature until thermal equilibrium is reached.",
        "es": "El calor fluye de mayor a menor temperatura hasta alcanzar el equilibrio térmico."
      }
    },
    {
      "id": "6.3-2",
      "topic": "6.3",
      "type": "mc",
      "prompt": {
        "en": "Two different objects reach thermal equilibrium. Which property must be equal?",
        "es": "Dos objetos distintos alcanzan el equilibrio térmico. ¿Qué propiedad debe ser igual?"
      },
      "choices": [
        {
          "text": {
            "en": "Total thermal energy",
            "es": "Energía térmica total"
          },
          "why": {
            "en": "Different amounts and types of matter can have different thermal energies at the same temperature.",
            "es": "Distintas cantidades y tipos de materia pueden tener energías térmicas distintas a la misma temperatura."
          }
        },
        {
          "text": {
            "en": "Mass",
            "es": "Masa"
          },
          "why": {
            "en": "Objects do not need equal masses to reach equilibrium.",
            "es": "Los objetos no necesitan masas iguales para alcanzar el equilibrio."
          }
        },
        {
          "text": {
            "en": "Specific heat capacity",
            "es": "Capacidad calorífica específica"
          },
          "why": {
            "en": "Material properties can differ even when temperatures match.",
            "es": "Las propiedades de los materiales pueden diferir aunque las temperaturas coincidan."
          }
        },
        {
          "text": {
            "en": "Temperature",
            "es": "Temperatura"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Thermal equilibrium means equal temperature and no net heat flow. It does not require equal thermal energy.",
        "es": "El equilibrio térmico significa igual temperatura y ningún flujo neto de calor. No requiere igual energía térmica."
      }
    },
    {
      "id": "6.3-3",
      "topic": "6.3",
      "type": "mc",
      "prompt": {
        "en": "Equal masses of two nonreacting liquids start at 20 °C and 60 °C in an insulated container. The colder liquid has three times the specific heat of the hotter liquid. Assume constant specific heats, no phase changes, and negligible container heat capacity and heat of mixing. Where is the final temperature?",
        "es": "Masas iguales de dos líquidos que no reaccionan empiezan a 20 °C y 60 °C en un recipiente aislado. El líquido frío tiene el triple de calor específico que el caliente. Supón calores específicos constantes, sin cambios de fase y con capacidad calorífica del recipiente y calor de mezcla despreciables. ¿Dónde queda la temperatura final?"
      },
      "choices": [
        {
          "text": {
            "en": "Between 40 °C and 60 °C",
            "es": "Entre 40 °C y 60 °C"
          },
          "why": {
            "en": "The larger heat capacity belongs to the colder liquid, so its initial temperature has more weight.",
            "es": "La mayor capacidad calorífica corresponde al líquido frío, así que su temperatura inicial tiene más peso."
          }
        },
        {
          "text": {
            "en": "Below 20 °C",
            "es": "Por debajo de 20 °C"
          },
          "why": {
            "en": "With no reaction or phase change, the final temperature lies between the initial temperatures.",
            "es": "Sin reacción ni cambio de fase, la temperatura final queda entre las temperaturas iniciales."
          }
        },
        {
          "text": {
            "en": "Between 20 °C and 40 °C",
            "es": "Entre 20 °C y 40 °C"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Exactly 40 °C",
            "es": "Exactamente 40 °C"
          },
          "why": {
            "en": "An arithmetic mean applies only when the two heat capacities are equal.",
            "es": "Un promedio aritmético se aplica solo cuando las dos capacidades caloríficas son iguales."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The larger specific heat weights the colder sample more: T(final) = (3 × 20 + 60)/4 = 30 °C.",
        "es": "El mayor calor específico da más peso a la muestra fría: T(final) = (3 × 20 + 60)/4 = 30 °C."
      }
    },
    {
      "id": "6.3-4",
      "topic": "6.3",
      "type": "mc",
      "prompt": {
        "en": "Equal masses of liquid water at 20 °C and 60 °C mix with no heat loss and no phase change. Assume equal constant specific heats and negligible container heat capacity. What is the final temperature?",
        "es": "Masas iguales de agua líquida a 20 °C y 60 °C se mezclan sin pérdida de calor ni cambio de fase. Supón calores específicos constantes e iguales y capacidad calorífica del recipiente despreciable. ¿Cuál es la temperatura final?"
      },
      "choices": [
        {
          "text": {
            "en": "60 °C",
            "es": "60 °C"
          },
          "why": {
            "en": "The hot sample loses heat, so the final temperature is below its initial temperature.",
            "es": "La muestra caliente pierde calor, así que la temperatura final es menor que su temperatura inicial."
          }
        },
        {
          "text": {
            "en": "40 °C",
            "es": "40 °C"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "80 °C",
            "es": "80 °C"
          },
          "why": {
            "en": "Adding temperatures does not conserve heat. Use the heat-capacity-weighted mean.",
            "es": "Sumar temperaturas no conserva el calor. Usa el promedio ponderado por capacidad calorífica."
          }
        },
        {
          "text": {
            "en": "20 °C",
            "es": "20 °C"
          },
          "why": {
            "en": "The cold sample gains heat, so the final temperature exceeds its initial temperature.",
            "es": "La muestra fría gana calor, así que la temperatura final supera su temperatura inicial."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Equal masses and specific heats give equal temperature changes: (20 + 60)/2 = 40 °C.",
        "es": "Las masas y los calores específicos iguales dan cambios de temperatura iguales: (20 + 60)/2 = 40 °C."
      }
    },
    {
      "id": "6.3-5",
      "topic": "6.3",
      "type": "numeric",
      "prompt": {
        "en": "Mix 50.0 g of water at 80.0 °C with 100.0 g of water at 20.0 °C in an insulated container. Neglect the container heat capacity and evaporation. Use constant c = 4.18 J/(g·°C). Find the final temperature to one decimal place.",
        "es": "Mezcla 50.0 g de agua a 80.0 °C con 100.0 g de agua a 20.0 °C en un recipiente aislado. Desprecia la capacidad calorífica del recipiente y la evaporación. Usa c constante = 4.18 J/(g·°C). Calcula la temperatura final con un decimal."
      },
      "value": 40,
      "display": "40.0",
      "unit": "°C",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "Set q(hot) + q(cold) = 0: 50.0(4.18)(T − 80.0) + 100.0(4.18)(T − 20.0) = 0. Thus T = 40.0 °C. Heat lost (−) equals heat gained (+).",
        "es": "Iguala q(caliente) + q(fría) a 0: 50.0(4.18)(T − 80.0) + 100.0(4.18)(T − 20.0) = 0. Así, T = 40.0 °C. El calor perdido (−) es igual al ganado (+)."
      }
    },
    {
      "id": "6.3-6",
      "topic": "6.3",
      "type": "numeric",
      "prompt": {
        "en": "A 25.0 g water sample cools from 30.0 °C to 20.0 °C. Use c = 4.18 J/(g·°C). Find q for the water with its sign and three significant figures.",
        "es": "Una muestra de 25.0 g de agua se enfría de 30.0 °C a 20.0 °C. Usa c = 4.18 J/(g·°C). Calcula q del agua con su signo y tres cifras significativas."
      },
      "value": -1045,
      "display": "−1.05e3",
      "unit": "J",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5,
      "explanation": {
        "en": "q = mcΔT = (25.0)(4.18)(20.0 − 30.0) = −1045 J ≈ −1.05 × 10<sup>3</sup> J. The sign must be − because the water cools; a + sign is incorrect.",
        "es": "q = mcΔT = (25.0)(4.18)(20.0 − 30.0) = −1045 J ≈ −1.05 × 10<sup>3</sup> J. El signo debe ser − porque el agua se enfría; un signo + es incorrecto."
      }
    },
    {
      "id": "6.4-1",
      "topic": "6.4",
      "type": "mc",
      "prompt": {
        "en": "Which statement correctly distinguishes heat capacity C, specific heat capacity c, and molar heat capacity?",
        "es": "¿Qué afirmación distingue correctamente la capacidad calorífica C, la capacidad calorífica específica (calor específico) c y la capacidad calorífica molar?"
      },
      "choices": [
        {
          "text": {
            "en": "All three must have units J/°C",
            "es": "Las tres deben tener unidades J/°C"
          },
          "why": {
            "en": "Specific and molar heat capacities include a mass or amount denominator.",
            "es": "Las capacidades caloríficas específica y molar incluyen un denominador de masa o cantidad."
          }
        },
        {
          "text": {
            "en": "Specific heat increases whenever the sample mass doubles",
            "es": "El calor específico aumenta siempre que se duplica la masa de la muestra"
          },
          "why": {
            "en": "At fixed conditions, specific heat is a material property; total heat capacity doubles with mass.",
            "es": "A condiciones fijas, el calor específico es una propiedad del material; la capacidad calorífica total se duplica con la masa."
          }
        },
        {
          "text": {
            "en": "Molar heat capacity is measured per gram",
            "es": "La capacidad calorífica molar se mide por gramo"
          },
          "why": {
            "en": "Molar refers to one mole, not one gram.",
            "es": "Molar se refiere a un mol, no a un gramo."
          }
        },
        {
          "text": {
            "en": "C is per sample, c is per gram, and molar heat capacity is per mole",
            "es": "C es por muestra, c es por gramo y la capacidad calorífica molar es por mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Units are C: J/°C, c: J/(g·°C), and molar heat capacity: J/(mol·°C). Also C = mc for a uniform sample.",
        "es": "Las unidades son C: J/°C, c: J/(g·°C) y capacidad calorífica molar: J/(mol·°C). Además, C = mc para una muestra uniforme."
      }
    },
    {
      "id": "6.4-2",
      "topic": "6.4",
      "type": "mc",
      "prompt": {
        "en": "In a coffee-cup calorimeter, the solution gains +2090 J from a reaction at constant pressure. Neglect the cup heat capacity and heat loss. What is q(reaction)?",
        "es": "En un calorímetro de vaso de espuma, la solución gana +2090 J de una reacción a presión constante. Desprecia la capacidad calorífica del vaso y la pérdida de calor. ¿Cuál es q(reacción)?"
      },
      "choices": [
        {
          "text": {
            "en": "−2090 kJ",
            "es": "−2090 kJ"
          },
          "why": {
            "en": "Convert J to kJ by dividing by 1000.",
            "es": "Convierte J a kJ dividiendo entre 1000."
          }
        },
        {
          "text": {
            "en": "+0.00209 kJ",
            "es": "+0.00209 kJ"
          },
          "why": {
            "en": "Both the sign and the J-to-kJ conversion are incorrect.",
            "es": "Tanto el signo como la conversión de J a kJ son incorrectos."
          }
        },
        {
          "text": {
            "en": "−2.09 kJ",
            "es": "−2.09 kJ"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "+2.09 kJ",
            "es": "+2.09 kJ"
          },
          "why": {
            "en": "This is the solution sign. The reaction loses the heat that the solution gains.",
            "es": "Este es el signo de la solución. La reacción pierde el calor que gana la solución."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "q(reaction) = −q(solution) = −2090 J = −2.09 kJ. The exothermic reaction supplies the heat gained by the solution.",
        "es": "q(reacción) = −q(solución) = −2090 J = −2.09 kJ. La reacción exotérmica aporta el calor que gana la solución."
      }
    },
    {
      "id": "6.4-3",
      "topic": "6.4",
      "type": "mc",
      "prompt": {
        "en": "At constant pressure with only pressure-volume work, q(reaction) = −2.09 kJ when 0.0500 mol of reaction occurs as written. What is the molar enthalpy of reaction?",
        "es": "A presión constante con solo trabajo de presión-volumen, q(reacción) = −2.09 kJ cuando ocurren 0.0500 mol de reacción tal como está escrita. ¿Cuál es la entalpía de reacción molar?"
      },
      "choices": [
        {
          "text": {
            "en": "−2.09 kJ/mol",
            "es": "−2.09 kJ/mol"
          },
          "why": {
            "en": "The measured heat was for less than one mole of reaction.",
            "es": "El calor medido correspondía a menos de un mol de reacción."
          }
        },
        {
          "text": {
            "en": "−41.8 kJ/mol",
            "es": "−41.8 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "+41.8 kJ/mol",
            "es": "+41.8 kJ/mol"
          },
          "why": {
            "en": "Heat release requires a − sign for the reaction.",
            "es": "La liberación de calor requiere signo − para la reacción."
          }
        },
        {
          "text": {
            "en": "−0.1045 kJ/mol",
            "es": "−0.1045 kJ/mol"
          },
          "why": {
            "en": "Divide heat by moles; multiplying gives the wrong dimensions.",
            "es": "Divide el calor entre los moles; multiplicar da dimensiones incorrectas."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "ΔH = (−2.09 kJ)/(0.0500 mol) = −41.8 kJ/mol. Use the reacted amount, not the total moles of solution.",
        "es": "ΔH = (−2.09 kJ)/(0.0500 mol) = −41.8 kJ/mol. Usa la cantidad que reaccionó, no los moles totales de solución."
      }
    },
    {
      "id": "6.4-4",
      "topic": "6.4",
      "type": "mc",
      "prompt": {
        "en": "During exothermic coffee-cup calorimetry, some heat escapes to the room before the maximum solution temperature is recorded. If this is ignored, how is the calculated reaction ΔH affected?",
        "es": "Durante una calorimetría exotérmica en vaso de espuma, parte del calor escapa al salón antes de registrar la temperatura máxima de la solución. Si se ignora esto, ¿cómo se afecta el ΔH de reacción calculado?"
      },
      "choices": [
        {
          "text": {
            "en": "It is less negative than the true value",
            "es": "Es menos negativo que el valor verdadero"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It is more negative than the true value",
            "es": "Es más negativo que el valor verdadero"
          },
          "why": {
            "en": "A smaller measured temperature rise underestimates the heat released, not overestimates it.",
            "es": "Un aumento de temperatura medido menor subestima el calor liberado, no lo sobrestima."
          }
        },
        {
          "text": {
            "en": "It must become positive",
            "es": "Debe volverse positivo"
          },
          "why": {
            "en": "Heat loss reduces the measured rise without necessarily reversing it.",
            "es": "La pérdida de calor reduce el aumento medido sin necesariamente invertirlo."
          }
        },
        {
          "text": {
            "en": "It is unchanged because enthalpy is a state function",
            "es": "No cambia porque la entalpía es una función de estado"
          },
          "why": {
            "en": "Path independence does not correct missing energy in an experimental measurement.",
            "es": "La independencia de la trayectoria no corrige la energía faltante en una medición experimental."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The measured positive solution q is too small. After the sign flip, calculated ΔH still has a − sign but too small a magnitude.",
        "es": "El q positivo medido de la solución es demasiado pequeño. Tras invertir el signo, el ΔH calculado sigue teniendo signo − pero una magnitud demasiado pequeña."
      }
    },
    {
      "id": "6.4-5",
      "topic": "6.4",
      "type": "numeric",
      "prompt": {
        "en": "In a coffee-cup calorimeter, 0.0250 mol of reaction warms 100.0 g of solution by +5.00 °C. Use c = 4.18 J/(g·°C), constant pressure, and negligible cup heat capacity and heat loss. Find ΔH per mole of reaction, including its sign, to three significant figures.",
        "es": "En un calorímetro de vaso de espuma, 0.0250 mol de reacción calientan 100.0 g de solución en +5.00 °C. Usa c = 4.18 J/(g·°C), presión constante y capacidad calorífica del vaso y pérdida de calor despreciables. Calcula ΔH por mol de reacción, con su signo, con tres cifras significativas."
      },
      "value": -83.6,
      "display": "−83.6",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "q(solution) = (100.0)(4.18)(+5.00) = +2090 J. q(reaction) = −2.090 kJ; ΔH = −2.090/0.0250 = −83.6 kJ/mol. The sign must be −, opposite the solution heat; a + sign is incorrect.",
        "es": "q(solución) = (100.0)(4.18)(+5.00) = +2090 J. q(reacción) = −2.090 kJ; ΔH = −2.090/0.0250 = −83.6 kJ/mol. El signo debe ser −, opuesto al calor de la solución; un signo + es incorrecto."
      }
    },
    {
      "id": "6.4-6",
      "topic": "6.4",
      "type": "numeric",
      "prompt": {
        "en": "A 50.0 g solution in a coffee-cup calorimeter cools from 30.00 °C to 24.00 °C. Use c = 4.18 J/(g·°C). Find q(solution), not q(reaction), with its sign and three significant figures.",
        "es": "Una solución de 50.0 g en un calorímetro de vaso de espuma se enfría de 30.00 °C a 24.00 °C. Usa c = 4.18 J/(g·°C). Calcula q(solución), no q(reacción), con su signo y tres cifras significativas."
      },
      "value": -1254,
      "display": "−1.25e3",
      "unit": "J",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5,
      "explanation": {
        "en": "q(solution) = (50.0)(4.18)(24.00 − 30.00) = −1254 J ≈ −1.25 × 10<sup>3</sup> J. The sign must be − because the solution cools; a + sign would be incorrect for the solution.",
        "es": "q(solución) = (50.0)(4.18)(24.00 − 30.00) = −1254 J ≈ −1.25 × 10<sup>3</sup> J. El signo debe ser − porque la solución se enfría; un signo + sería incorrecto para la solución."
      }
    },
    {
      "id": "6.5-1",
      "topic": "6.5",
      "type": "mc",
      "prompt": {
        "en": "A model heating curve at constant pressure has A-B sloped (solid), B-C flat (melting), C-D sloped (liquid), D-E flat (boiling), and E-F sloped (gas). Which segment represents heat of fusion?",
        "es": "Una curva de calentamiento modelo a presión constante tiene A-B inclinado (sólido), B-C plano (fusión), C-D inclinado (líquido), D-E plano (ebullición) y E-F inclinado (gas). ¿Qué tramo representa el calor de fusión?"
      },
      "choices": [
        {
          "text": {
            "en": "C-D",
            "es": "C-D"
          },
          "why": {
            "en": "C-D raises the liquid temperature after melting.",
            "es": "C-D eleva la temperatura del líquido después de la fusión."
          }
        },
        {
          "text": {
            "en": "D-E",
            "es": "D-E"
          },
          "why": {
            "en": "D-E is vaporization, not fusion.",
            "es": "D-E es vaporización, no fusión."
          }
        },
        {
          "text": {
            "en": "B-C",
            "es": "B-C"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A-B",
            "es": "A-B"
          },
          "why": {
            "en": "A-B raises the solid temperature without melting.",
            "es": "A-B eleva la temperatura del sólido sin fundirlo."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "B-C is the flat fusion segment. Heat of fusion (enthalpy of fusion) changes solid to liquid without a temperature increase.",
        "es": "B-C es el tramo plano de fusión. El calor de fusión (entalpía de fusión) cambia sólido a líquido sin aumento de temperatura."
      },
      "curve": true
    },
    {
      "id": "6.5-2",
      "topic": "6.5",
      "type": "mc",
      "prompt": {
        "en": "A model heating curve at constant pressure has A-B sloped (solid), B-C flat (melting), C-D sloped (liquid), D-E flat (boiling), and E-F sloped (gas). What changes while heat enters during D-E?",
        "es": "Una curva de calentamiento modelo a presión constante tiene A-B inclinado (sólido), B-C plano (fusión), C-D inclinado (líquido), D-E plano (ebullición) y E-F inclinado (gas). ¿Qué cambia mientras entra calor durante D-E?"
      },
      "choices": [
        {
          "text": {
            "en": "Covalent bonds within every molecule break",
            "es": "Se rompen enlaces covalentes dentro de cada molécula"
          },
          "why": {
            "en": "Vaporization overcomes intermolecular attractions; it does not require molecular decomposition.",
            "es": "La vaporización supera atracciones intermoleculares; no requiere descomposición molecular."
          }
        },
        {
          "text": {
            "en": "Potential energy increases while temperature stays constant",
            "es": "La energía potencial aumenta mientras la temperatura permanece constante"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Temperature increases throughout the flat segment",
            "es": "La temperatura aumenta durante todo el tramo plano"
          },
          "why": {
            "en": "A flat segment indicates constant temperature at the phase change.",
            "es": "Un tramo plano indica temperatura constante durante el cambio de fase."
          }
        },
        {
          "text": {
            "en": "Average molecular kinetic energy increases",
            "es": "La energía cinética molecular promedio aumenta"
          },
          "why": {
            "en": "At constant temperature, average molecular kinetic energy remains constant.",
            "es": "A temperatura constante, la energía cinética molecular promedio permanece constante."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "During the flat D-E segment, heat of vaporization (enthalpy of vaporization) increases potential energy. On a sloped segment, heat instead raises temperature within one phase.",
        "es": "Durante el tramo plano D-E, el calor de vaporización (entalpía de vaporización) aumenta la energía potencial. En un tramo inclinado, el calor eleva la temperatura dentro de una fase."
      },
      "curve": true
    },
    {
      "id": "6.5-3",
      "topic": "6.5",
      "type": "mc",
      "prompt": {
        "en": "Water has ΔH(fusion) = +6.01 kJ/mol and ΔH(vaporization) = +40.7 kJ/mol at their respective transition temperatures. For the same amount, which phase change requires more heat?",
        "es": "El agua tiene ΔH(fusión) = +6.01 kJ/mol y ΔH(vaporización) = +40.7 kJ/mol a sus respectivas temperaturas de transición. Para la misma cantidad, ¿qué cambio de fase requiere más calor?"
      },
      "choices": [
        {
          "text": {
            "en": "Vaporization",
            "es": "Vaporización"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Fusion",
            "es": "Fusión"
          },
          "why": {
            "en": "Fusion has the smaller listed molar enthalpy.",
            "es": "La fusión tiene la menor entalpía molar indicada."
          }
        },
        {
          "text": {
            "en": "Both require equal heat",
            "es": "Ambos requieren igual calor"
          },
          "why": {
            "en": "The listed molar enthalpies have different magnitudes.",
            "es": "Las entalpías molares indicadas tienen magnitudes distintas."
          }
        },
        {
          "text": {
            "en": "Neither absorbs heat",
            "es": "Ninguno absorbe calor"
          },
          "why": {
            "en": "Both changes have positive enthalpy and absorb heat.",
            "es": "Ambos cambios tienen entalpía positiva y absorben calor."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "For equal moles, q is larger for vaporization because +40.7 kJ/mol exceeds +6.01 kJ/mol. Gas formation requires greater separation of molecules.",
        "es": "Para moles iguales, q es mayor para la vaporización porque +40.7 kJ/mol supera +6.01 kJ/mol. Formar gas requiere mayor separación de las moléculas."
      }
    },
    {
      "id": "6.5-4",
      "topic": "6.5",
      "type": "mc",
      "prompt": {
        "en": "At its melting point, water has ΔH(fusion) = +6.01 kJ/mol. What is ΔH for H<sub>2</sub>O(l) → H<sub>2</sub>O(s) at the same temperature?",
        "es": "En su punto de fusión, el agua tiene ΔH(fusión) = +6.01 kJ/mol. ¿Cuál es ΔH para H<sub>2</sub>O(l) → H<sub>2</sub>O(s) a la misma temperatura?"
      },
      "choices": [
        {
          "text": {
            "en": "+6.01 kJ/mol",
            "es": "+6.01 kJ/mol"
          },
          "why": {
            "en": "Freezing reverses fusion, so its sign reverses.",
            "es": "La congelación invierte la fusión, así que se invierte su signo."
          }
        },
        {
          "text": {
            "en": "−40.7 kJ/mol",
            "es": "−40.7 kJ/mol"
          },
          "why": {
            "en": "This is the condensation magnitude, not the freezing magnitude.",
            "es": "Esta es la magnitud de condensación, no la magnitud de congelación."
          }
        },
        {
          "text": {
            "en": "+40.7 kJ/mol",
            "es": "+40.7 kJ/mol"
          },
          "why": {
            "en": "This corresponds to vaporization, not freezing.",
            "es": "Esto corresponde a vaporización, no a congelación."
          }
        },
        {
          "text": {
            "en": "−6.01 kJ/mol",
            "es": "−6.01 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Freezing releases heat: ΔH(freezing) = −ΔH(fusion) = −6.01 kJ/mol.",
        "es": "La congelación libera calor: ΔH(congelación) = −ΔH(fusión) = −6.01 kJ/mol."
      }
    },
    {
      "id": "6.5-5",
      "topic": "6.5",
      "type": "numeric",
      "prompt": {
        "en": "Melt 0.250 mol of ice at its melting point without changing temperature. Use ΔH(fusion) = +6.01 kJ/mol. Find q for the water with its sign and three significant figures.",
        "es": "Funde 0.250 mol de hielo en su punto de fusión sin cambiar la temperatura. Usa ΔH(fusión) = +6.01 kJ/mol. Calcula q del agua con su signo y tres cifras significativas."
      },
      "value": 1.5025,
      "display": "+1.50",
      "unit": "kJ",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055,
      "explanation": {
        "en": "q = nΔH(fusion) = (0.250)(+6.01) = +1.5025 kJ ≈ +1.50 kJ. The sign must be + because melting absorbs heat; a − sign is incorrect.",
        "es": "q = nΔH(fusión) = (0.250)(+6.01) = +1.5025 kJ ≈ +1.50 kJ. El signo debe ser + porque la fusión absorbe calor; un signo − es incorrecto."
      }
    },
    {
      "id": "6.5-6",
      "topic": "6.5",
      "type": "numeric",
      "prompt": {
        "en": "Condense 0.100 mol of water vapor at its boiling point without changing temperature. Use ΔH(vaporization) = +40.7 kJ/mol. Find q for the water with its sign and three significant figures.",
        "es": "Condensa 0.100 mol de vapor de agua en su punto de ebullición sin cambiar la temperatura. Usa ΔH(vaporización) = +40.7 kJ/mol. Calcula q del agua con su signo y tres cifras significativas."
      },
      "value": -4.07,
      "display": "−4.07",
      "unit": "kJ",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055,
      "explanation": {
        "en": "Condensation reverses vaporization: q = (0.100)(−40.7) = −4.07 kJ. The sign must be − because condensation releases heat; a + sign is incorrect.",
        "es": "La condensación invierte la vaporización: q = (0.100)(−40.7) = −4.07 kJ. El signo debe ser − porque la condensación libera calor; un signo + es incorrecto."
      }
    },
    {
      "id": "6.6-1",
      "topic": "6.6",
      "type": "mc",
      "prompt": {
        "en": "A reaction occurs at constant pressure with only pressure-volume work. How is the heat of the reacting system related to its enthalpy change for the reacted amount?",
        "es": "Una reacción ocurre a presión constante con solo trabajo de presión-volumen. ¿Cómo se relaciona el calor del sistema que reacciona con su cambio de entalpía para la cantidad que reaccionó?"
      },
      "choices": [
        {
          "text": {
            "en": "q must be zero whenever pressure is constant",
            "es": "q debe ser cero siempre que la presión sea constante"
          },
          "why": {
            "en": "Constant pressure does not require zero heat transfer.",
            "es": "La presión constante no requiere transferencia de calor nula."
          }
        },
        {
          "text": {
            "en": "q at constant pressure equals the enthalpy change",
            "es": "q a presión constante es igual al cambio de entalpía"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "q always has the opposite sign to the enthalpy change",
            "es": "q siempre tiene signo opuesto al cambio de entalpía"
          },
          "why": {
            "en": "The opposite sign applies to system versus surroundings, not to system heat versus its own enthalpy change.",
            "es": "El signo opuesto se aplica al sistema respecto a los alrededores, no al calor del sistema respecto a su propio cambio de entalpía."
          }
        },
        {
          "text": {
            "en": "q is always positive",
            "es": "q siempre es positivo"
          },
          "why": {
            "en": "Heat can enter (+) or leave (−) the reacting system.",
            "es": "El calor puede entrar (+) o salir (−) del sistema que reacciona."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "q at constant pressure equals the system enthalpy change. Molar reaction ΔH times moles of reaction gives this heat; both share the same + or − sign.",
        "es": "q a presión constante es igual al cambio de entalpía del sistema. ΔH de reacción molar por moles de reacción da este calor; ambos tienen el mismo signo + o −."
      }
    },
    {
      "id": "6.6-2",
      "topic": "6.6",
      "type": "mc",
      "prompt": {
        "en": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) has ΔH = −92.2 kJ/mol of reaction as written. What is ΔH for the reverse equation?",
        "es": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) tiene ΔH = −92.2 kJ/mol de reacción tal como está escrita. ¿Cuál es ΔH para la ecuación inversa?"
      },
      "choices": [
        {
          "text": {
            "en": "+92.2 kJ/mol",
            "es": "+92.2 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "−92.2 kJ/mol",
            "es": "−92.2 kJ/mol"
          },
          "why": {
            "en": "Reversal exchanges the initial and final states, reversing the sign.",
            "es": "Invertir intercambia los estados inicial y final e invierte el signo."
          }
        },
        {
          "text": {
            "en": "+46.1 kJ/mol",
            "es": "+46.1 kJ/mol"
          },
          "why": {
            "en": "The reverse equation retains the original coefficient magnitudes; no halving was requested.",
            "es": "La ecuación inversa conserva las magnitudes de los coeficientes originales; no se pidió dividir entre dos."
          }
        },
        {
          "text": {
            "en": "−184.4 kJ/mol",
            "es": "−184.4 kJ/mol"
          },
          "why": {
            "en": "Doubling and retaining a negative sign does not describe reversal.",
            "es": "Duplicar y conservar un signo negativo no describe la inversión."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Reversing gives 2NH<sub>3</sub>(g) → N<sub>2</sub>(g) + 3H<sub>2</sub>(g), ΔH = +92.2 kJ/mol.",
        "es": "Al invertir se obtiene 2NH<sub>3</sub>(g) → N<sub>2</sub>(g) + 3H<sub>2</sub>(g), ΔH = +92.2 kJ/mol."
      }
    },
    {
      "id": "6.6-3",
      "topic": "6.6",
      "type": "mc",
      "prompt": {
        "en": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) has ΔH = −92.2 kJ/mol of reaction. What is ΔH when every coefficient is doubled?",
        "es": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) tiene ΔH = −92.2 kJ/mol de reacción. ¿Cuál es ΔH cuando se duplica cada coeficiente?"
      },
      "choices": [
        {
          "text": {
            "en": "−46.1 kJ/mol of the doubled reaction",
            "es": "−46.1 kJ/mol de la reacción duplicada"
          },
          "why": {
            "en": "Doubling the reaction doubles its heat; it does not halve it.",
            "es": "Duplicar la reacción duplica su calor; no lo divide entre dos."
          }
        },
        {
          "text": {
            "en": "+184.4 kJ/mol of the doubled reaction",
            "es": "+184.4 kJ/mol de la reacción duplicada"
          },
          "why": {
            "en": "Scaling by a positive factor preserves the sign.",
            "es": "Multiplicar por un factor positivo conserva el signo."
          }
        },
        {
          "text": {
            "en": "−92.2 kJ/mol of the doubled reaction",
            "es": "−92.2 kJ/mol de la reacción duplicada"
          },
          "why": {
            "en": "Reaction enthalpy must scale with the equation coefficients.",
            "es": "La entalpía de reacción debe escalar con los coeficientes de la ecuación."
          }
        },
        {
          "text": {
            "en": "−184.4 kJ/mol of the doubled reaction",
            "es": "−184.4 kJ/mol de la reacción duplicada"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The doubled equation is 2N<sub>2</sub>(g) + 6H<sub>2</sub>(g) → 4NH<sub>3</sub>(g). Its ΔH = 2(−92.2) = −184.4 kJ/mol of reaction as now written.",
        "es": "La ecuación duplicada es 2N<sub>2</sub>(g) + 6H<sub>2</sub>(g) → 4NH<sub>3</sub>(g). Su ΔH = 2(−92.2) = −184.4 kJ/mol de reacción tal como está escrita ahora."
      }
    },
    {
      "id": "6.6-4",
      "topic": "6.6",
      "type": "mc",
      "prompt": {
        "en": "Why can two different pathways between identical initial and final states have the same reaction ΔH?",
        "es": "¿Por qué dos trayectorias distintas entre estados iniciales y finales idénticos pueden tener el mismo ΔH de reacción?"
      },
      "choices": [
        {
          "text": {
            "en": "Every pathway takes the same time",
            "es": "Todas las trayectorias tardan lo mismo"
          },
          "why": {
            "en": "Reaction duration concerns kinetics, not endpoint enthalpy.",
            "es": "La duración de la reacción corresponde a la cinética, no a la entalpía de los extremos."
          }
        },
        {
          "text": {
            "en": "Heat transfer is always zero",
            "es": "La transferencia de calor siempre es cero"
          },
          "why": {
            "en": "A nonzero enthalpy difference is compatible with path independence.",
            "es": "Una diferencia de entalpía no nula es compatible con la independencia de la trayectoria."
          }
        },
        {
          "text": {
            "en": "Enthalpy is a state function",
            "es": "La entalpía es una función de estado"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Every pathway has the same activation barrier",
            "es": "Todas las trayectorias tienen la misma barrera de activación"
          },
          "why": {
            "en": "Activation barriers can differ while endpoint enthalpies match.",
            "es": "Las barreras de activación pueden diferir aunque coincidan las entalpías de los extremos."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "A state function depends on the state. For identical endpoints, ΔH is independent of pathway, whether its sign is + or −.",
        "es": "Una función de estado depende del estado. Para extremos idénticos, ΔH es independiente de la trayectoria, ya sea su signo + o −."
      }
    },
    {
      "id": "6.6-5",
      "topic": "6.6",
      "type": "numeric",
      "prompt": {
        "en": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) has ΔH = −92.2 kJ/mol of reaction. At constant pressure, what q accompanies formation of 0.300 mol NH<sub>3</sub>? Include its sign and three significant figures.",
        "es": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) tiene ΔH = −92.2 kJ/mol de reacción. A presión constante, ¿qué q acompaña la formación de 0.300 mol de NH<sub>3</sub>? Incluye su signo y tres cifras significativas."
      },
      "value": -13.83,
      "display": "−13.8",
      "unit": "kJ",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "q = (0.300/2)(−92.2) = −13.83 kJ ≈ −13.8 kJ. The sign must be − because ammonia synthesis releases heat; a + sign is incorrect.",
        "es": "q = (0.300/2)(−92.2) = −13.83 kJ ≈ −13.8 kJ. El signo debe ser − porque la síntesis de amoniaco libera calor; un signo + es incorrecto."
      }
    },
    {
      "id": "6.6-6",
      "topic": "6.6",
      "type": "numeric",
      "prompt": {
        "en": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) has ΔH = −92.2 kJ/mol of reaction. Find ΔH for NH<sub>3</sub>(g) → 0.5N<sub>2</sub>(g) + 1.5H<sub>2</sub>(g), with its sign and three significant figures.",
        "es": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) tiene ΔH = −92.2 kJ/mol de reacción. Calcula ΔH para NH<sub>3</sub>(g) → 0.5N<sub>2</sub>(g) + 1.5H<sub>2</sub>(g), con su signo y tres cifras significativas."
      },
      "value": 46.1,
      "display": "+46.1",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "Reverse and halve: ΔH = (−1/2)(−92.2) = +46.1 kJ/mol. The sign must be + because decomposition reverses exothermic synthesis; a − sign is incorrect.",
        "es": "Invierte y divide entre dos: ΔH = (−1/2)(−92.2) = +46.1 kJ/mol. El signo debe ser + porque la descomposición invierte la síntesis exotérmica; un signo − es incorrecto."
      }
    },
    {
      "id": "6.7-1",
      "topic": "6.7",
      "type": "mc",
      "prompt": {
        "en": "Which description of individual covalent bond changes is correct?",
        "es": "¿Qué descripción de los cambios de enlaces covalentes individuales es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "Breaking bonds absorbs energy; forming bonds releases energy",
            "es": "Romper enlaces absorbe energía; formar enlaces libera energía"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Breaking bonds releases energy; forming bonds absorbs energy",
            "es": "Romper enlaces libera energía; formar enlaces absorbe energía"
          },
          "why": {
            "en": "Separating bonded atoms requires energy, rather than releasing it.",
            "es": "Separar átomos enlazados requiere energía, en vez de liberarla."
          }
        },
        {
          "text": {
            "en": "Both breaking and forming bonds release energy",
            "es": "Tanto romper como formar enlaces libera energía"
          },
          "why": {
            "en": "Breaking a stable bond requires an energy input.",
            "es": "Romper un enlace estable requiere un aporte de energía."
          }
        },
        {
          "text": {
            "en": "Both breaking and forming bonds absorb energy",
            "es": "Tanto romper como formar enlaces absorbe energía"
          },
          "why": {
            "en": "Formation of a stable bond releases energy as potential energy decreases.",
            "es": "La formación de un enlace estable libera energía cuando disminuye la energía potencial."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Bond breaking is endothermic (+ contribution); bond formation is exothermic (− contribution). Reaction ΔH compares both totals.",
        "es": "Romper enlaces es endotérmico (contribución +); formar enlaces es exotérmico (contribución −). El ΔH de reacción compara ambos totales."
      }
    },
    {
      "id": "6.7-2",
      "topic": "6.7",
      "type": "mc",
      "prompt": {
        "en": "Estimate ΔH for H<sub>2</sub>(g) + Cl<sub>2</sub>(g) → 2HCl(g). Bond enthalpies in kJ/mol: H-H 436, Cl-Cl 243, H-Cl 431.",
        "es": "Estima ΔH para H<sub>2</sub>(g) + Cl<sub>2</sub>(g) → 2HCl(g). Entalpías de enlace en kJ/mol: H-H 436, Cl-Cl 243, H-Cl 431."
      },
      "choices": [
        {
          "text": {
            "en": "+183 kJ/mol",
            "es": "+183 kJ/mol"
          },
          "why": {
            "en": "This subtracts broken bonds from formed bonds, reversing the required sign.",
            "es": "Esto resta enlaces rotos de enlaces formados e invierte el signo requerido."
          }
        },
        {
          "text": {
            "en": "+248 kJ/mol",
            "es": "+248 kJ/mol"
          },
          "why": {
            "en": "Two H-Cl bonds form, so the formed-bond sum must include both.",
            "es": "Se forman dos enlaces H-Cl, así que la suma de enlaces formados debe incluir ambos."
          }
        },
        {
          "text": {
            "en": "−862 kJ/mol",
            "es": "−862 kJ/mol"
          },
          "why": {
            "en": "This counts formation only and omits energy needed to break reactant bonds.",
            "es": "Esto cuenta solo la formación y omite la energía necesaria para romper enlaces de los reactivos."
          }
        },
        {
          "text": {
            "en": "−183 kJ/mol",
            "es": "−183 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "ΔH ≈ Σ bonds broken − Σ bonds formed = (436 + 243) − 2(431) = −183 kJ/mol.",
        "es": "ΔH ≈ Σ enlaces rotos − Σ enlaces formados = (436 + 243) − 2(431) = −183 kJ/mol."
      }
    },
    {
      "id": "6.7-3",
      "topic": "6.7",
      "type": "mc",
      "prompt": {
        "en": "Why is reaction ΔH calculated with tabulated average bond enthalpies usually an estimate?",
        "es": "¿Por qué el ΔH de reacción calculado con entalpías de enlace promedio tabuladas suele ser una estimación?"
      },
      "choices": [
        {
          "text": {
            "en": "Balanced coefficients are unnecessary for this method",
            "es": "Los coeficientes balanceados son innecesarios para este método"
          },
          "why": {
            "en": "Coefficients determine how many bonds break and form.",
            "es": "Los coeficientes determinan cuántos enlaces se rompen y forman."
          }
        },
        {
          "text": {
            "en": "Bond enthalpies already include every liquid phase change",
            "es": "Las entalpías de enlace ya incluyen todos los cambios de fase líquidos"
          },
          "why": {
            "en": "Gas-phase bond values do not automatically include condensation or vaporization.",
            "es": "Los valores de enlace en fase gaseosa no incluyen automáticamente condensación o vaporización."
          }
        },
        {
          "text": {
            "en": "Average gas-phase values vary with molecular environment",
            "es": "Los valores promedio en fase gaseosa varían con el entorno molecular"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Energy conservation fails for gas reactions",
            "es": "La conservación de la energía falla para reacciones gaseosas"
          },
          "why": {
            "en": "Energy conservation still holds; the approximation comes from averaged input data.",
            "es": "La conservación de la energía sigue siendo válida; la aproximación proviene de datos de entrada promedio."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "A bond enthalpy is a gas-phase bond-breaking quantity. Averaging across molecules limits precision, and condensed phases need additional phase information.",
        "es": "Una entalpía de enlace es una cantidad de ruptura de enlace en fase gaseosa. Promediar entre moléculas limita la precisión, y las fases condensadas necesitan información de fase adicional."
      }
    },
    {
      "id": "6.7-4",
      "topic": "6.7",
      "type": "mc",
      "prompt": {
        "en": "A student uses twice the O-H bond enthalpy to calculate the energy to vaporize one mole of H<sub>2</sub>O(l). What is the error?",
        "es": "Un estudiante usa el doble de la entalpía del enlace O-H para calcular la energía para vaporizar un mol de H<sub>2</sub>O(l). ¿Cuál es el error?"
      },
      "choices": [
        {
          "text": {
            "en": "The water formula has only one O-H bond",
            "es": "La fórmula del agua tiene solo un enlace O-H"
          },
          "why": {
            "en": "Each water molecule has two O-H bonds, but vaporization does not break them.",
            "es": "Cada molécula de agua tiene dos enlaces O-H, pero la vaporización no los rompe."
          }
        },
        {
          "text": {
            "en": "Vaporization separates intact molecules instead of breaking O-H bonds",
            "es": "La vaporización separa moléculas intactas en vez de romper enlaces O-H"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Water vapor contains no covalent bonds",
            "es": "El vapor de agua no contiene enlaces covalentes"
          },
          "why": {
            "en": "Water molecules retain their O-H bonds in the gas phase.",
            "es": "Las moléculas de agua conservan sus enlaces O-H en fase gaseosa."
          }
        },
        {
          "text": {
            "en": "Vaporization forms only isolated H and O atoms",
            "es": "La vaporización forma solo átomos aislados de H y O"
          },
          "why": {
            "en": "Producing isolated atoms would be atomization, not vaporization.",
            "es": "Producir átomos aislados sería atomización, no vaporización."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Vaporization overcomes intermolecular attractions. Using intramolecular bond enthalpies would describe different initial and final species.",
        "es": "La vaporización supera atracciones intermoleculares. Usar entalpías de enlaces intramoleculares describiría especies iniciales y finales distintas."
      }
    },
    {
      "id": "6.7-5",
      "topic": "6.7",
      "type": "numeric",
      "prompt": {
        "en": "Estimate ΔH for H<sub>2</sub>(g) + 0.5O<sub>2</sub>(g) → H<sub>2</sub>O(g). Use bond enthalpies H-H 436, O=O 498, O-H 463 kJ/mol. Include the sign and three significant figures.",
        "es": "Estima ΔH para H<sub>2</sub>(g) + 0.5O<sub>2</sub>(g) → H<sub>2</sub>O(g). Usa entalpías de enlace H-H 436, O=O 498, O-H 463 kJ/mol. Incluye el signo y tres cifras significativas."
      },
      "value": -241,
      "display": "−241",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.55,
      "explanation": {
        "en": "ΔH ≈ 436 + 0.5(498) − 2(463) = −241 kJ/mol. The sign must be − because forming bonds releases more energy than breaking bonds requires; a + sign is incorrect.",
        "es": "ΔH ≈ 436 + 0.5(498) − 2(463) = −241 kJ/mol. El signo debe ser − porque formar enlaces libera más energía de la que requiere romperlos; un signo + es incorrecto."
      }
    },
    {
      "id": "6.7-6",
      "topic": "6.7",
      "type": "numeric",
      "prompt": {
        "en": "Estimate ΔH for N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g). Use bond enthalpies N≡N 945, H-H 436, N-H 391 kJ/mol. Include the sign and two significant figures.",
        "es": "Estima ΔH para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g). Usa entalpías de enlace N≡N 945, H-H 436, N-H 391 kJ/mol. Incluye el signo y dos cifras significativas."
      },
      "value": -93,
      "display": "−93",
      "unit": "kJ/mol",
      "precision": {
        "sf": 2
      },
      "tolerance": 0.55,
      "explanation": {
        "en": "Break one N≡N and three H-H bonds; form six N-H bonds. ΔH ≈ 945 + 3(436) − 6(391) = −93 kJ/mol. The sign must be −; a + sign reverses broken minus formed.",
        "es": "Rompe un enlace N≡N y tres H-H; forma seis enlaces N-H. ΔH ≈ 945 + 3(436) − 6(391) = −93 kJ/mol. El signo debe ser −; un signo + invierte rotos menos formados."
      }
    },
    {
      "id": "6.8-1",
      "topic": "6.8",
      "type": "mc",
      "prompt": {
        "en": "Which oxygen species has ΔH°<sub>f</sub> = 0 at 298 K by the standard-state convention?",
        "es": "¿Qué especie de oxígeno tiene ΔH°<sub>f</sub> = 0 a 298 K por la convención de estado estándar?"
      },
      "choices": [
        {
          "text": {
            "en": "O(g)",
            "es": "O(g)"
          },
          "why": {
            "en": "Isolated atoms are not the standard reference form of oxygen at 298 K.",
            "es": "Los átomos aislados no son la forma de referencia estándar del oxígeno a 298 K."
          }
        },
        {
          "text": {
            "en": "O<sub>3</sub>(g)",
            "es": "O<sub>3</sub>(g)"
          },
          "why": {
            "en": "Ozone is an elemental form but not the standard reference form at 298 K.",
            "es": "El ozono es una forma elemental pero no la forma de referencia estándar a 298 K."
          }
        },
        {
          "text": {
            "en": "All oxygen species",
            "es": "Todas las especies de oxígeno"
          },
          "why": {
            "en": "Only the standard reference form receives this zero by convention.",
            "es": "Solo la forma de referencia estándar recibe este cero por convención."
          }
        },
        {
          "text": {
            "en": "O<sub>2</sub>(g)",
            "es": "O<sub>2</sub>(g)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The standard enthalpy of formation of an element in its standard state is 0. For oxygen at 298 K, that reference species is O<sub>2</sub>(g).",
        "es": "La entalpía estándar de formación de un elemento en su estado estándar es 0. Para el oxígeno a 298 K, esa especie de referencia es O<sub>2</sub>(g)."
      }
    },
    {
      "id": "6.8-2",
      "topic": "6.8",
      "type": "mc",
      "prompt": {
        "en": "Which equation defines ΔH°<sub>f</sub> for CO<sub>2</sub>(g) at 298 K?",
        "es": "¿Qué ecuación define ΔH°<sub>f</sub> para CO<sub>2</sub>(g) a 298 K?"
      },
      "choices": [
        {
          "text": {
            "en": "2C(s, graphite) + 2O<sub>2</sub>(g) → 2CO<sub>2</sub>(g)",
            "es": "2C(s, grafito) + 2O<sub>2</sub>(g) → 2CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "A formation equation must produce exactly one mole of the specified substance.",
            "es": "Una ecuación de formación debe producir exactamente un mol de la sustancia especificada."
          }
        },
        {
          "text": {
            "en": "C(g) + 2O(g) → CO<sub>2</sub>(g)",
            "es": "C(g) + 2O(g) → CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "Gaseous C and atomic O are not the standard reference forms at 298 K.",
            "es": "C gaseoso y O atómico no son las formas de referencia estándar a 298 K."
          }
        },
        {
          "text": {
            "en": "C(s, graphite) + O<sub>2</sub>(g) → CO<sub>2</sub>(g)",
            "es": "C(s, grafito) + O<sub>2</sub>(g) → CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "CO(g) + 0.5O<sub>2</sub>(g) → CO<sub>2</sub>(g)",
            "es": "CO(g) + 0.5O<sub>2</sub>(g) → CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "CO is a compound, so this does not start only from elements in standard states.",
            "es": "CO es un compuesto, así que esto no empieza solo con elementos en estados estándar."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Enthalpy of formation refers to one mole produced from elements in standard states: C(s, graphite) and O<sub>2</sub>(g).",
        "es": "La entalpía de formación se refiere a un mol producido a partir de elementos en estados estándar: C(s, grafito) y O<sub>2</sub>(g)."
      }
    },
    {
      "id": "6.8-3",
      "topic": "6.8",
      "type": "mc",
      "prompt": {
        "en": "A table gives ΔH°<sub>f</sub>[H<sub>2</sub>O(l)] = −285.8 kJ/mol and ΔH°<sub>f</sub>[H<sub>2</sub>O(g)] = −241.8 kJ/mol at 298 K. Which statement is correct?",
        "es": "Una tabla da ΔH°<sub>f</sub>[H<sub>2</sub>O(l)] = −285.8 kJ/mol y ΔH°<sub>f</sub>[H<sub>2</sub>O(g)] = −241.8 kJ/mol a 298 K. ¿Qué afirmación es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "Gas and liquid water have equal enthalpy at 298 K",
            "es": "El agua gaseosa y líquida tienen igual entalpía a 298 K"
          },
          "why": {
            "en": "The listed values differ; vapor has higher enthalpy at the same temperature.",
            "es": "Los valores indicados difieren; el vapor tiene mayor entalpía a la misma temperatura."
          }
        },
        {
          "text": {
            "en": "Use the value for the physical state in the equation",
            "es": "Usa el valor del estado físico de la ecuación"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Either value is valid because the formula is the same",
            "es": "Cualquier valor es válido porque la fórmula es igual"
          },
          "why": {
            "en": "The physical state is part of the thermodynamic identity of a species.",
            "es": "El estado físico es parte de la identidad termodinámica de una especie."
          }
        },
        {
          "text": {
            "en": "Both must be zero because water contains elements",
            "es": "Ambos deben ser cero porque el agua contiene elementos"
          },
          "why": {
            "en": "The zero convention applies to elements in standard states, not to compounds.",
            "es": "La convención de cero se aplica a elementos en estados estándar, no a compuestos."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "State symbols matter. The gas formation enthalpy is less negative than the liquid value because separating molecules requires energy.",
        "es": "Los símbolos de estado importan. La entalpía de formación del gas es menos negativa que la del líquido porque separar moléculas requiere energía."
      }
    },
    {
      "id": "6.8-4",
      "topic": "6.8",
      "type": "mc",
      "prompt": {
        "en": "How do you calculate ΔH°<sub>rxn</sub> from standard enthalpies of formation?",
        "es": "¿Cómo calculas ΔH°<sub>rxn</sub> a partir de entalpías estándar de formación?"
      },
      "choices": [
        {
          "text": {
            "en": "Sum coefficient-weighted products, then subtract coefficient-weighted reactants",
            "es": "Suma productos ponderados por coeficientes y resta reactivos ponderados por coeficientes"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Subtract products from reactants",
            "es": "Resta productos de reactivos"
          },
          "why": {
            "en": "This reverses the products-minus-reactants sign convention.",
            "es": "Esto invierte la convención de signos de productos menos reactivos."
          }
        },
        {
          "text": {
            "en": "Sum all values without coefficients",
            "es": "Suma todos los valores sin coeficientes"
          },
          "why": {
            "en": "Each coefficient counts moles and must multiply its formation enthalpy.",
            "es": "Cada coeficiente cuenta moles y debe multiplicar su entalpía de formación."
          }
        },
        {
          "text": {
            "en": "Use only the most negative formation enthalpy",
            "es": "Usa solo la entalpía de formación más negativa"
          },
          "why": {
            "en": "Every reactant and product contributes according to its coefficient.",
            "es": "Cada reactivo y producto contribuye según su coeficiente."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "ΔH°<sub>rxn</sub> = Σ ΔH°<sub>f</sub>(products) − Σ ΔH°<sub>f</sub>(reactants), with each value multiplied by its balanced coefficient. Keep every + or − sign.",
        "es": "ΔH°<sub>rxn</sub> = Σ ΔH°<sub>f</sub>(productos) − Σ ΔH°<sub>f</sub>(reactivos), con cada valor multiplicado por su coeficiente balanceado. Conserva cada signo + o −."
      }
    },
    {
      "id": "6.8-5",
      "topic": "6.8",
      "type": "numeric",
      "prompt": {
        "en": "Calculate ΔH°<sub>rxn</sub> for CH<sub>4</sub>(g) + 2O<sub>2</sub>(g) → CO<sub>2</sub>(g) + 2H<sub>2</sub>O(l). Use ΔH°<sub>f</sub> in kJ/mol: CH<sub>4</sub>(g) −74.8, CO<sub>2</sub>(g) −393.5, H<sub>2</sub>O(l) −285.8, O<sub>2</sub>(g) 0. Include the sign and one decimal place.",
        "es": "Calcula ΔH°<sub>rxn</sub> para CH<sub>4</sub>(g) + 2O<sub>2</sub>(g) → CO<sub>2</sub>(g) + 2H<sub>2</sub>O(l). Usa ΔH°<sub>f</sub> en kJ/mol: CH<sub>4</sub>(g) −74.8, CO<sub>2</sub>(g) −393.5, H<sub>2</sub>O(l) −285.8, O<sub>2</sub>(g) 0. Incluye el signo y un decimal."
      },
      "value": -890.3,
      "display": "−890.3",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "ΔH°<sub>rxn</sub> = [−393.5 + 2(−285.8)] − [−74.8 + 2(0)] = −890.3 kJ/mol. The sign must be −; +890.3 kJ/mol reverses products minus reactants.",
        "es": "ΔH°<sub>rxn</sub> = [−393.5 + 2(−285.8)] − [−74.8 + 2(0)] = −890.3 kJ/mol. El signo debe ser −; +890.3 kJ/mol invierte productos menos reactivos."
      }
    },
    {
      "id": "6.8-6",
      "topic": "6.8",
      "type": "numeric",
      "prompt": {
        "en": "Calculate ΔH°<sub>rxn</sub> for CaCO<sub>3</sub>(s) → CaO(s) + CO<sub>2</sub>(g). Use ΔH°<sub>f</sub> in kJ/mol: CaCO<sub>3</sub>(s) −1206.9, CaO(s) −635.1, CO<sub>2</sub>(g) −393.5. Include the sign and one decimal place.",
        "es": "Calcula ΔH°<sub>rxn</sub> para CaCO<sub>3</sub>(s) → CaO(s) + CO<sub>2</sub>(g). Usa ΔH°<sub>f</sub> en kJ/mol: CaCO<sub>3</sub>(s) −1206.9, CaO(s) −635.1, CO<sub>2</sub>(g) −393.5. Incluye el signo y un decimal."
      },
      "value": 178.3,
      "display": "+178.3",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "ΔH°<sub>rxn</sub> = [−635.1 + (−393.5)] − [−1206.9] = +178.3 kJ/mol. The sign must be + because this decomposition is endothermic; a − sign is incorrect.",
        "es": "ΔH°<sub>rxn</sub> = [−635.1 + (−393.5)] − [−1206.9] = +178.3 kJ/mol. El signo debe ser + porque esta descomposición es endotérmica; un signo − es incorrecto."
      }
    },
    {
      "id": "6.9-1",
      "topic": "6.9",
      "type": "mc",
      "prompt": {
        "en": "A model gives A(g) → B(g), ΔH = −35 kJ/mol, and B(g) → C(g), ΔH = +12 kJ/mol. What results when the equations are added?",
        "es": "Un modelo da A(g) → B(g), ΔH = −35 kJ/mol, y B(g) → C(g), ΔH = +12 kJ/mol. ¿Qué resulta al sumar las ecuaciones?"
      },
      "choices": [
        {
          "text": {
            "en": "C(g) → A(g), ΔH = −23 kJ/mol",
            "es": "C(g) → A(g), ΔH = −23 kJ/mol"
          },
          "why": {
            "en": "The sum proceeds from A to C; reversing it would reverse the enthalpy sign.",
            "es": "La suma va de A a C; invertirla invertiría el signo de entalpía."
          }
        },
        {
          "text": {
            "en": "A(g) + B(g) → C(g), ΔH = +23 kJ/mol",
            "es": "A(g) + B(g) → C(g), ΔH = +23 kJ/mol"
          },
          "why": {
            "en": "B cancels from opposite sides and the signed enthalpy sum is negative.",
            "es": "B se cancela de lados opuestos y la suma de entalpías con signo es negativa."
          }
        },
        {
          "text": {
            "en": "A(g) → C(g), ΔH = −23 kJ/mol",
            "es": "A(g) → C(g), ΔH = −23 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A(g) → C(g), ΔH = −47 kJ/mol",
            "es": "A(g) → C(g), ΔH = −47 kJ/mol"
          },
          "why": {
            "en": "Add signed values: the second step absorbs heat and offsets part of the release.",
            "es": "Suma valores con signo: el segundo paso absorbe calor y compensa parte de la liberación."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Cancel B(g) and add ΔH values: −35 + (+12) = −23 kJ/mol for A(g) → C(g).",
        "es": "Cancela B(g) y suma los valores de ΔH: −35 + (+12) = −23 kJ/mol para A(g) → C(g)."
      }
    },
    {
      "id": "6.9-2",
      "topic": "6.9",
      "type": "mc",
      "prompt": {
        "en": "A supplied equation has ΔH = −56 kJ/mol. You reverse it and divide every coefficient by two. What ΔH belongs to the transformed equation?",
        "es": "Una ecuación dada tiene ΔH = −56 kJ/mol. La inviertes y divides cada coeficiente entre dos. ¿Qué ΔH corresponde a la ecuación transformada?"
      },
      "choices": [
        {
          "text": {
            "en": "+56 kJ/mol",
            "es": "+56 kJ/mol"
          },
          "why": {
            "en": "This reverses the sign but omits the factor of one half.",
            "es": "Esto invierte el signo pero omite el factor de un medio."
          }
        },
        {
          "text": {
            "en": "+28 kJ/mol",
            "es": "+28 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "−28 kJ/mol",
            "es": "−28 kJ/mol"
          },
          "why": {
            "en": "Halving is included, but the reversal also requires a sign change.",
            "es": "Se incluye la división entre dos, pero la inversión también requiere cambiar el signo."
          }
        },
        {
          "text": {
            "en": "+112 kJ/mol",
            "es": "+112 kJ/mol"
          },
          "why": {
            "en": "Divide by two rather than multiply by two.",
            "es": "Divide entre dos en vez de multiplicar por dos."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Apply both operations: ΔH = (−1/2)(−56) = +28 kJ/mol.",
        "es": "Aplica ambas operaciones: ΔH = (−1/2)(−56) = +28 kJ/mol."
      }
    },
    {
      "id": "6.9-3",
      "topic": "6.9",
      "type": "mc",
      "prompt": {
        "en": "When combining thermochemical equations, when can a species be canceled?",
        "es": "Al combinar ecuaciones termoquímicas, ¿cuándo se puede cancelar una especie?"
      },
      "choices": [
        {
          "text": {
            "en": "Equal amounts of the same species in the same physical state appear on opposite sides",
            "es": "Aparecen cantidades iguales de la misma especie en el mismo estado físico en lados opuestos"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Its formula matches even if one state is liquid and the other is gas",
            "es": "Su fórmula coincide aunque un estado sea líquido y el otro gaseoso"
          },
          "why": {
            "en": "Different physical states have different enthalpies and cannot be canceled as identical species.",
            "es": "Los estados físicos distintos tienen entalpías distintas y no se pueden cancelar como especies idénticas."
          }
        },
        {
          "text": {
            "en": "It appears twice on the reactant side",
            "es": "Aparece dos veces del lado de los reactivos"
          },
          "why": {
            "en": "Terms on the same side add rather than cancel.",
            "es": "Los términos del mismo lado se suman en vez de cancelarse."
          }
        },
        {
          "text": {
            "en": "Its coefficients differ, so both amounts disappear completely",
            "es": "Sus coeficientes difieren, así que ambas cantidades desaparecen por completo"
          },
          "why": {
            "en": "Only equal opposite amounts cancel; any excess remains.",
            "es": "Solo se cancelan cantidades opuestas iguales; cualquier exceso permanece."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Match chemical identity, state symbols and amounts on opposite sides. Otherwise a leftover species or phase change remains.",
        "es": "Haz coincidir identidad química, símbolos de estado y cantidades en lados opuestos. De otro modo queda una especie sobrante o un cambio de fase."
      }
    },
    {
      "id": "6.9-4",
      "topic": "6.9",
      "type": "mc",
      "prompt": {
        "en": "Why does Hess's law allow reaction enthalpies to be added?",
        "es": "¿Por qué la ley de Hess permite sumar entalpías de reacción?"
      },
      "choices": [
        {
          "text": {
            "en": "Every reaction must release heat",
            "es": "Toda reacción debe liberar calor"
          },
          "why": {
            "en": "Endothermic steps can be combined with exothermic steps using their signed values.",
            "es": "Se pueden combinar pasos endotérmicos con exotérmicos usando sus valores con signo."
          }
        },
        {
          "text": {
            "en": "All steps must occur at equal rates",
            "es": "Todos los pasos deben ocurrir a velocidades iguales"
          },
          "why": {
            "en": "Rates do not determine the endpoint enthalpy difference.",
            "es": "Las velocidades no determinan la diferencia de entalpía entre extremos."
          }
        },
        {
          "text": {
            "en": "A catalyst changes the total enthalpy between fixed endpoints",
            "es": "Un catalizador cambia la entalpía total entre extremos fijos"
          },
          "why": {
            "en": "A catalyst changes the pathway, not the total ΔH for fixed states.",
            "es": "Un catalizador cambia la trayectoria, no el ΔH total para estados fijos."
          }
        },
        {
          "text": {
            "en": "Enthalpy is a state function, so intermediate states cancel",
            "es": "La entalpía es una función de estado, así que se cancelan los estados intermedios"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Hess's law follows from enthalpy being a state function. Adding step changes cancels intermediate enthalpies and leaves the overall ΔH.",
        "es": "La ley de Hess se deduce de que la entalpía es una función de estado. Sumar cambios de pasos cancela las entalpías intermedias y deja el ΔH global."
      }
    },
    {
      "id": "6.9-5",
      "topic": "6.9",
      "type": "numeric",
      "prompt": {
        "en": "Given C(s, graphite) + O<sub>2</sub>(g) → CO<sub>2</sub>(g), ΔH = −393.5 kJ/mol, and CO(g) + 0.5O<sub>2</sub>(g) → CO<sub>2</sub>(g), ΔH = −283.0 kJ/mol, find ΔH for C(s, graphite) + 0.5O<sub>2</sub>(g) → CO(g). Include the sign and one decimal place.",
        "es": "Dadas C(s, grafito) + O<sub>2</sub>(g) → CO<sub>2</sub>(g), ΔH = −393.5 kJ/mol, y CO(g) + 0.5O<sub>2</sub>(g) → CO<sub>2</sub>(g), ΔH = −283.0 kJ/mol, calcula ΔH para C(s, grafito) + 0.5O<sub>2</sub>(g) → CO(g). Incluye el signo y un decimal."
      },
      "value": -110.5,
      "display": "−110.5",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "Reverse the CO combustion step, then add: ΔH = −393.5 + (+283.0) = −110.5 kJ/mol. CO<sub>2</sub>(g) cancels. The sign must be −; a + sign is incorrect.",
        "es": "Invierte el paso de combustión de CO y suma: ΔH = −393.5 + (+283.0) = −110.5 kJ/mol. CO<sub>2</sub>(g) se cancela. El signo debe ser −; un signo + es incorrecto."
      }
    },
    {
      "id": "6.9-6",
      "topic": "6.9",
      "type": "numeric",
      "prompt": {
        "en": "Given N<sub>2</sub>(g) + O<sub>2</sub>(g) → 2NO(g), ΔH = +180.6 kJ/mol, and 2NO(g) + O<sub>2</sub>(g) → 2NO<sub>2</sub>(g), ΔH = −114.2 kJ/mol, find ΔH for N<sub>2</sub>(g) + 2O<sub>2</sub>(g) → 2NO<sub>2</sub>(g). Include the sign and one decimal place.",
        "es": "Dadas N<sub>2</sub>(g) + O<sub>2</sub>(g) → 2NO(g), ΔH = +180.6 kJ/mol, y 2NO(g) + O<sub>2</sub>(g) → 2NO<sub>2</sub>(g), ΔH = −114.2 kJ/mol, calcula ΔH para N<sub>2</sub>(g) + 2O<sub>2</sub>(g) → 2NO<sub>2</sub>(g). Incluye el signo y un decimal."
      },
      "value": 66.4,
      "display": "+66.4",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.055,
      "explanation": {
        "en": "Cancel 2NO(g), then add: ΔH = +180.6 + (−114.2) = +66.4 kJ/mol. The sign must be + because heat absorbed exceeds heat released; a − sign is incorrect.",
        "es": "Cancela 2NO(g) y suma: ΔH = +180.6 + (−114.2) = +66.4 kJ/mol. El signo debe ser + porque el calor absorbido supera al liberado; un signo − es incorrecto."
      }
    }
  ],
  "units": [
    {
      "id": "J",
      "label": {
        "en": "J",
        "es": "J"
      }
    },
    {
      "id": "kJ",
      "label": {
        "en": "kJ",
        "es": "kJ"
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
      "id": "°C",
      "label": {
        "en": "°C",
        "es": "°C"
      }
    }
  ],
  "copy": {
    "title": "AP Chemistry Unit 6 Practice",
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
      "No timer. Use scratch paper and a calculator. All the atomic masses you need are below.": "Sin límite de tiempo. Usa papel y calculadora. Todas las masas atómicas que necesitas están abajo.",
      "Select one answer, or enter a number and choose its unit. For a count, choose count; for a ratio, choose no units.": "Selecciona una respuesta o escribe un número y elige su unidad. Para un conteo, elige conteo; para una razón, elige sin unidades.",
      "Submit once per question. Read the explanation, then continue. Your score counts correct answers; a significant figure note does not remove a point.": "Envía una respuesta por pregunta. Lee la explicación y continúa. Tu puntaje cuenta las respuestas correctas; una nota sobre cifras significativas no quita un punto.",
      "At the end, Try again shuffles the questions and answer choices. Choose another topic to build a new set.": "Al terminar, Intentar de nuevo cambia el orden de las preguntas y las opciones. Elige otro tema para crear una serie nueva.",
      "Reference": "Consulta",
      "Atomic masses (g/mol)": "Masas atómicas (g/mol)",
      "Avogadro constant": "Constante de Avogadro",
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
      "AP Chemistry Unit 6 Practice": "Práctica de la unidad 6 de Química AP",
      "AP Chemistry · Unit 6": "Química AP · Unidad 6",
      "Choose a topic, then start. Mixed review includes all nine topics.": "Elige un tema y comienza. El repaso mixto incluye los nueve temas.",
      "Choose one topic for six questions, or Mixed review for all 54. Read the feedback after each answer.": "Elige un tema para seis preguntas o Repaso mixto para las 54. Lee los comentarios después de cada respuesta.",
      "Select one answer, or enter a signed number and choose its unit. Use + or - for heat and enthalpy answers.": "Selecciona una respuesta o escribe un número con signo y elige su unidad. Usa + o - para respuestas de calor y entalpía.",
      "No timer. Use scratch paper and a calculator. The thermochemistry reference is below.": "Sin límite de tiempo. Usa papel y calculadora. La referencia de termoquímica está abajo.",
      "Aligned practice for AP Chemistry CED topics 6.1 to 6.9. Original ZornScience questions.": "Práctica alineada con los temas 6.1 a 6.9 del CED de Química AP. Preguntas originales de ZornScience.",
      "Heat and reaction enthalpy": "Calor y entalpía de reacción",
      "Specific heat capacity of water": "Capacidad calorífica específica (calor específico) del agua",
      "At constant pressure with only pressure-volume work, system heat equals its enthalpy change. For an insulated calorimeter with negligible cup heat capacity:": "A presión constante con solo trabajo de presión-volumen, el calor del sistema es igual a su cambio de entalpía. Para un calorímetro aislado con capacidad calorífica del vaso despreciable:",
      "Products": "Productos",
      "Reactants": "Reactivos",
      "Every sum includes balanced coefficients. ΔH values in kJ/mol refer to one mole of reaction as written, unless a named substance is specified. Heat q is in J or kJ.": "Cada suma incluye coeficientes balanceados. Los valores de ΔH en kJ/mol se refieren a un mol de reacción tal como está escrita, salvo que se especifique una sustancia. El calor q está en J o kJ.",
      "The standard enthalpy of formation of an element in its standard state is 0.": "La entalpía estándar de formación de un elemento en su estado estándar es 0.",
      "Average gas-phase bond enthalpies": "Entalpías de enlace promedio en fase gaseosa",
      "Bond": "Enlace",
      "Bond enthalpy (kJ/mol)": "Entalpía de enlace (kJ/mol)",
      "Standard enthalpies of formation at 298 K": "Entalpías estándar de formación a 298 K",
      "Species": "Especie",
      "Phase changes of water": "Cambios de fase del agua",
      "Fusion": "Fusión",
      "Vaporization": "Vaporización",
      "Phase values apply at the normal melting and boiling points, respectively. They are not the difference between the 298 K gas and liquid formation values.": "Los valores de fase se aplican en los puntos normales de fusión y ebullición, respectivamente. No son la diferencia entre los valores de formación del gas y del líquido a 298 K.",
      "Keep extra digits in your work and round only the final answer. Use a + sign for heat entering the system and a − sign for heat leaving it.": "Conserva dígitos adicionales en tu trabajo y redondea solo la respuesta final. Usa signo + para calor que entra al sistema y signo − para calor que sale.",
      "Model: exothermic energy diagram": "Modelo: diagrama de energía exotérmico",
      "Model energy diagram: reactants 40, peak 100, products 10, all in kJ/mol.": "Diagrama de energía modelo: reactivos 40, pico 100, productos 10, todo en kJ/mol.",
      "Model: endothermic energy diagram": "Modelo: diagrama de energía endotérmico",
      "Model energy diagram: reactants 15, peak 80, products 45, all in kJ/mol.": "Diagrama de energía modelo: reactivos 15, pico 80, productos 45, todo en kJ/mol.",
      "Reaction progress": "Avance de la reacción",
      "Enthalpy (kJ/mol)": "Entalpía (kJ/mol)",
      "Model, not to scale. Use the numerical values in the question.": "Modelo, sin escala. Usa los valores numéricos del enunciado.",
      "Model: heating curve": "Modelo: curva de calentamiento",
      "A model heating curve at constant pressure has A-B sloped (solid), B-C flat (melting), C-D sloped (liquid), D-E flat (boiling), and E-F sloped (gas).": "Una curva de calentamiento modelo a presión constante tiene A-B inclinado (sólido), B-C plano (fusión), C-D inclinado (líquido), D-E plano (ebullición) y E-F inclinado (gas).",
      "Heat added": "Calor añadido",
      "Temperature": "Temperatura",
      "Model at constant pressure. Sloped segments warm one phase; flat segments change phase.": "Modelo a presión constante. Los tramos inclinados calientan una fase; los tramos planos cambian de fase.",
      "graphite": "grafito",
      "final": "final",
      "initial": "inicial",
      "reaction": "reacción",
      "solution": "solución",
      "phase": "fase",
      " = Σ ΔH°": " = Σ ΔH°",
      "(products) − Σ ΔH°": "(productos) − Σ ΔH°",
      "(reactants).": "(reactivos).",
      "ΔH = Σ bonds broken − Σ bonds formed.": "ΔH = Σ enlaces rotos − Σ enlaces formados."
    }
  }
};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit6-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
