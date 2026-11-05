(function () {
  "use strict";
  // Original bilingual questions, with answers worked first in TESTING.md.
  var bank = {
  "topics": [
    {
      "id": "5.1",
      "title": {
        "en": "5.1 Reaction Rates",
        "es": "5.1 Velocidades de reacción"
      }
    },
    {
      "id": "5.2",
      "title": {
        "en": "5.2 Introduction to Rate Law",
        "es": "5.2 Introducción a la ley de velocidad"
      }
    },
    {
      "id": "5.3",
      "title": {
        "en": "5.3 Concentration Changes Over Time",
        "es": "5.3 Cambios de concentración con el tiempo"
      }
    },
    {
      "id": "5.4",
      "title": {
        "en": "5.4 Elementary Reactions",
        "es": "5.4 Reacciones elementales"
      }
    },
    {
      "id": "5.5",
      "title": {
        "en": "5.5 Collision Model",
        "es": "5.5 Modelo de colisiones"
      }
    },
    {
      "id": "5.6",
      "title": {
        "en": "5.6 Reaction Energy Profile",
        "es": "5.6 Perfil de energía de una reacción"
      }
    },
    {
      "id": "5.7",
      "title": {
        "en": "5.7 Introduction to Reaction Mechanisms",
        "es": "5.7 Introducción a los mecanismos de reacción"
      }
    },
    {
      "id": "5.8",
      "title": {
        "en": "5.8 Reaction Mechanism and Rate Law",
        "es": "5.8 Mecanismo de reacción y ley de velocidad"
      }
    },
    {
      "id": "5.9",
      "title": {
        "en": "5.9 Pre-Equilibrium Approximation",
        "es": "5.9 Aproximación de preequilibrio"
      }
    },
    {
      "id": "5.10",
      "title": {
        "en": "5.10 Multistep Reaction Energy Profile",
        "es": "5.10 Perfil de energía de una reacción de varios pasos"
      }
    },
    {
      "id": "5.11",
      "title": {
        "en": "5.11 Catalysis",
        "es": "5.11 Catálisis"
      }
    }
  ],
  "questions": [
    {
      "id": "5.1-1",
      "topic": "5.1",
      "type": "mc",
      "prompt": {
        "en": "For A(aq) → B(aq) at constant volume, which expression gives the positive average disappearance rate of A over a time interval?",
        "es": "Para A(aq) → B(aq) a volumen constante, ¿qué expresión da la velocidad promedio positiva de desaparición de A durante un intervalo?"
      },
      "choices": [
        {
          "text": {
            "en": "−Δ[A]/Δt",
            "es": "−Δ[A]/Δt"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Δ[A]/Δt",
            "es": "Δ[A]/Δt"
          },
          "why": {
            "en": "A is consumed, so Δ[A] is negative. Reverse its sign for a positive disappearance rate.",
            "es": "A se consume, así que Δ[A] es negativo. Invierte el signo para obtener una velocidad positiva de desaparición."
          }
        },
        {
          "text": {
            "en": "−Δt/Δ[A]",
            "es": "−Δt/Δ[A]"
          },
          "why": {
            "en": "This inverts concentration change over time and has units s/M, not M/s.",
            "es": "Esto invierte el cambio de concentración entre tiempo y tiene unidades s/M, no M/s."
          }
        },
        {
          "text": {
            "en": "[A]/t at the end of the interval",
            "es": "[A]/t al final del intervalo"
          },
          "why": {
            "en": "A final concentration divided by time is not the change in concentration divided by elapsed time.",
            "es": "Una concentración final entre tiempo no es el cambio de concentración entre el tiempo transcurrido."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Average disappearance rate is −Δ[A]/Δt. The sign makes the rate positive as reactant concentration falls.",
        "es": "La velocidad promedio de desaparición es −Δ[A]/Δt. El signo hace positiva la velocidad cuando baja la concentración del reactivo."
      }
    },
    {
      "id": "5.1-2",
      "topic": "5.1",
      "type": "mc",
      "prompt": {
        "en": "How do you find the instantaneous disappearance rate of A from a smooth [A] versus time curve?",
        "es": "¿Cómo obtienes la velocidad instantánea de desaparición de A a partir de una curva suave de [A] contra tiempo?"
      },
      "choices": [
        {
          "text": {
            "en": "Use the secant slope over the entire run.",
            "es": "Usa la pendiente secante de toda la reacción."
          },
          "why": {
            "en": "A secant over a finite interval gives an average, not a local instantaneous rate.",
            "es": "Una secante de un intervalo finito da una velocidad promedio, no una velocidad instantánea local."
          }
        },
        {
          "text": {
            "en": "Use the area under the concentration curve.",
            "es": "Usa el área bajo la curva de concentración."
          },
          "why": {
            "en": "Area has concentration times time units and is not the time derivative.",
            "es": "El área tiene unidades de concentración por tiempo y no es la derivada respecto al tiempo."
          }
        },
        {
          "text": {
            "en": "Read only the vertical coordinate.",
            "es": "Lee solo la coordenada vertical."
          },
          "why": {
            "en": "The vertical coordinate is concentration, not its rate of change.",
            "es": "La coordenada vertical es la concentración, no su velocidad de cambio."
          }
        },
        {
          "text": {
            "en": "Reverse the sign of the tangent slope at that instant.",
            "es": "Invierte el signo de la pendiente tangente en ese instante."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The tangent slope is d[A]/dt. For disappearance, use −d[A]/dt at the selected instant.",
        "es": "La pendiente tangente es d[A]/dt. Para la desaparición, usa −d[A]/dt en el instante elegido."
      }
    },
    {
      "id": "5.1-3",
      "topic": "5.1",
      "type": "mc",
      "prompt": {
        "en": "For 2NO<sub>2</sub>(g) → 2NO(g) + O<sub>2</sub>(g), how does the formation rate of O<sub>2</sub> compare with the disappearance rate of NO<sub>2</sub>?",
        "es": "Para 2NO<sub>2</sub>(g) → 2NO(g) + O<sub>2</sub>(g), ¿cómo se compara la velocidad de formación de O<sub>2</sub> con la velocidad de desaparición de NO<sub>2</sub>?"
      },
      "choices": [
        {
          "text": {
            "en": "It is equal.",
            "es": "Es igual."
          },
          "why": {
            "en": "Equal species rates require equal coefficient magnitudes; these coefficients differ.",
            "es": "Las velocidades de las especies son iguales cuando sus coeficientes tienen igual magnitud; estos coeficientes son distintos."
          }
        },
        {
          "text": {
            "en": "It is negative.",
            "es": "Es negativa."
          },
          "why": {
            "en": "A formation rate for a product is positive as its concentration rises.",
            "es": "La velocidad de formación de un producto es positiva cuando aumenta su concentración."
          }
        },
        {
          "text": {
            "en": "It is half as large.",
            "es": "Es la mitad."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It is twice as large.",
            "es": "Es el doble."
          },
          "why": {
            "en": "The coefficient ratio for oxygen formation to nitrogen dioxide consumption is 1/2, not 2/1.",
            "es": "La razón de coeficientes para formación de oxígeno respecto al consumo de dióxido de nitrógeno es 1/2, no 2/1."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The normalized reaction rate is −(1/2)d[NO<sub>2</sub>]/dt = d[O<sub>2</sub>]/dt. Oxygen forms half as fast as nitrogen dioxide disappears.",
        "es": "La velocidad de reacción normalizada es −(1/2)d[NO<sub>2</sub>]/dt = d[O<sub>2</sub>]/dt. El oxígeno se forma a la mitad de la velocidad de desaparición del dióxido de nitrógeno."
      }
    },
    {
      "id": "5.1-4",
      "topic": "5.1",
      "type": "mc",
      "prompt": {
        "en": "A closed, constant-volume batch reaction is first order in its only reactant. Temperature stays fixed. Why does its rate decrease as the reaction proceeds?",
        "es": "Una reacción en un sistema cerrado a volumen constante es de primer orden en su único reactivo. La temperatura se mantiene fija. ¿Por qué disminuye su velocidad al avanzar la reacción?"
      },
      "choices": [
        {
          "text": {
            "en": "The balanced coefficients become smaller.",
            "es": "Los coeficientes balanceados se vuelven menores."
          },
          "why": {
            "en": "Stoichiometric coefficients do not change as a batch reaction proceeds.",
            "es": "Los coeficientes estequiométricos no cambian al avanzar una reacción en un sistema cerrado."
          }
        },
        {
          "text": {
            "en": "Reactant concentration falls, so fewer reactive encounters occur per unit volume and time.",
            "es": "La concentración del reactivo baja, así que hay menos encuentros reactivos por unidad de volumen y tiempo."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The rate constant must decrease with time.",
            "es": "La constante de velocidad debe disminuir con el tiempo."
          },
          "why": {
            "en": "At fixed temperature in this model, k is constant; the concentration changes.",
            "es": "A temperatura fija en este modelo, k es constante; cambia la concentración."
          }
        },
        {
          "text": {
            "en": "The activation energy must increase with time.",
            "es": "La energía de activación debe aumentar con el tiempo."
          },
          "why": {
            "en": "Consuming reactant does not by itself raise the activation barrier of the same pathway.",
            "es": "Consumir reactivo no eleva por sí solo la barrera de activación de la misma ruta."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "For first order, rate = k[A]. With constant k, decreasing [A] decreases the rate.",
        "es": "Para primer orden, velocidad = k[A]. Con k constante, una disminución de [A] reduce la velocidad."
      }
    },
    {
      "id": "5.1-5",
      "topic": "5.1",
      "type": "numeric",
      "prompt": {
        "en": "In a constant-volume vessel, [A] falls from 0.800 M to 0.500 M in 15.0 s. Find the average disappearance rate of A.",
        "es": "En un recipiente de volumen constante, [A] baja de 0.800 M a 0.500 M en 15.0 s. Calcula la velocidad promedio de desaparición de A."
      },
      "value": 0.02,
      "display": "0.0200",
      "unit": "M/s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "−Δ[A]/Δt = −(0.500 − 0.800)/15.0 = 0.0200 M/s. Disappearance is reported as a positive value.",
        "es": "−Δ[A]/Δt = −(0.500 − 0.800)/15.0 = 0.0200 M/s. La desaparición se expresa con un valor positivo."
      }
    },
    {
      "id": "5.1-6",
      "topic": "5.1",
      "type": "numeric",
      "prompt": {
        "en": "For N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), NH<sub>3</sub> forms at 0.0400 M/s. Find the positive disappearance rate of H<sub>2</sub>.",
        "es": "Para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), el NH<sub>3</sub> se forma a 0.0400 M/s. Calcula la velocidad positiva de desaparición de H<sub>2</sub>."
      },
      "value": 0.06,
      "display": "0.0600",
      "unit": "M/s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Use the coefficient ratio: (3/2)(0.0400 M/s) = 0.0600 M/s. This is hydrogen disappearance, not the normalized reaction rate.",
        "es": "Usa la razón de coeficientes: (3/2)(0.0400 M/s) = 0.0600 M/s. Esta es la desaparición del hidrógeno, no la velocidad de reacción normalizada."
      }
    },
    {
      "id": "5.2-1",
      "topic": "5.2",
      "type": "mc",
      "prompt": {
        "en": "At fixed temperature, an initial-rate table gives ([A] in M, [B] in M, rate in M/s): (0.10, 0.10, 0.0020); (0.20, 0.10, 0.0080); (0.10, 0.20, 0.0040). Which rate law agrees with the method of initial rates?",
        "es": "A temperatura fija, una tabla de velocidades iniciales da ([A] en M, [B] en M, velocidad en M/s): (0.10, 0.10, 0.0020); (0.20, 0.10, 0.0080); (0.10, 0.20, 0.0040). ¿Qué ley de velocidad concuerda con el método de las velocidades iniciales?"
      },
      "choices": [
        {
          "text": {
            "en": "rate = k[A]<sup>2</sup>[B]",
            "es": "velocidad = k[A]<sup>2</sup>[B]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "rate = k[A][B]",
            "es": "velocidad = k[A][B]"
          },
          "why": {
            "en": "Doubling A quadruples the initial rate, so A is second order rather than first order.",
            "es": "Duplicar A cuadruplica la velocidad inicial, así que A es de segundo orden y no de primer orden."
          }
        },
        {
          "text": {
            "en": "rate = k[A][B]<sup>2</sup>",
            "es": "velocidad = k[A][B]<sup>2</sup>"
          },
          "why": {
            "en": "Doubling B only doubles the rate; B is first order, not second order.",
            "es": "Duplicar B solo duplica la velocidad; B es de primer orden, no de segundo orden."
          }
        },
        {
          "text": {
            "en": "rate = k[A]<sup>2</sup>",
            "es": "velocidad = k[A]<sup>2</sup>"
          },
          "why": {
            "en": "B cannot be omitted because changing B at fixed A changes the measured rate.",
            "es": "No se puede omitir B porque cambiar B con A fija cambia la velocidad medida."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Holding B fixed, a factor of 2 in A gives a factor of 4 in rate: order 2. Holding A fixed, doubling B doubles rate: order 1. Thus rate = k[A]<sup>2</sup>[B].",
        "es": "Con B fija, un factor de 2 en A da un factor de 4 en velocidad: orden de reacción 2. Con A fija, duplicar B duplica la velocidad: orden 1. Así, velocidad = k[A]<sup>2</sup>[B]."
      }
    },
    {
      "id": "5.2-2",
      "topic": "5.2",
      "type": "mc",
      "prompt": {
        "en": "For rate = k[A]<sup>2</sup>[B], what is the overall order?",
        "es": "Para velocidad = k[A]<sup>2</sup>[B], ¿cuál es el orden global?"
      },
      "choices": [
        {
          "text": {
            "en": "2",
            "es": "2"
          },
          "why": {
            "en": "This counts only the exponent of A and omits the first-order dependence on B.",
            "es": "Esto cuenta solo el exponente de A y omite la dependencia de primer orden en B."
          }
        },
        {
          "text": {
            "en": "1",
            "es": "1"
          },
          "why": {
            "en": "This counts only the exponent of B and omits the second-order dependence on A.",
            "es": "Esto cuenta solo el exponente de B y omite la dependencia de segundo orden en A."
          }
        },
        {
          "text": {
            "en": "4",
            "es": "4"
          },
          "why": {
            "en": "Overall order is the sum 2 + 1, not an extra power added for k.",
            "es": "El orden global es la suma 2 + 1, sin añadir una potencia por k."
          }
        },
        {
          "text": {
            "en": "3",
            "es": "3"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Overall order is the sum of concentration exponents: 2 + 1 = 3. The rate constant contributes no reaction order.",
        "es": "El orden global es la suma de los exponentes de concentración: 2 + 1 = 3. La constante de velocidad no aporta orden de reacción."
      }
    },
    {
      "id": "5.2-3",
      "topic": "5.2",
      "type": "mc",
      "prompt": {
        "en": "Rate has units M/s and rate = k[A]<sup>2</sup>[B]. Which units must k have?",
        "es": "La velocidad tiene unidades M/s y velocidad = k[A]<sup>2</sup>[B]. ¿Qué unidades debe tener k?"
      },
      "choices": [
        {
          "text": {
            "en": "M<sup>−1</sup> s<sup>−1</sup>",
            "es": "M<sup>−1</sup> s<sup>−1</sup>"
          },
          "why": {
            "en": "These are second-order units; this law is third order overall.",
            "es": "Estas son unidades de segundo orden; esta ley tiene orden global tres."
          }
        },
        {
          "text": {
            "en": "M s<sup>−1</sup>",
            "es": "M s<sup>−1</sup>"
          },
          "why": {
            "en": "These are zero-order units and do not cancel the concentration powers in this law.",
            "es": "Estas son unidades de orden cero y no cancelan las potencias de concentración en esta ley."
          }
        },
        {
          "text": {
            "en": "M<sup>−2</sup> s<sup>−1</sup>",
            "es": "M<sup>−2</sup> s<sup>−1</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "s<sup>−1</sup>",
            "es": "s<sup>−1</sup>"
          },
          "why": {
            "en": "These are first-order units and would give M cubed per second here.",
            "es": "Estas son unidades de primer orden y aquí darían M al cubo por segundo."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "k units = (M/s)/M<sup>3</sup> = M<sup>−2</sup> s<sup>−1</sup>. In general, order n gives M<sup>1−n</sup> s<sup>−1</sup>.",
        "es": "Unidades de k = (M/s)/M<sup>3</sup> = M<sup>−2</sup> s<sup>−1</sup>. En general, el orden n da M<sup>1−n</sup> s<sup>−1</sup>."
      }
    },
    {
      "id": "5.2-4",
      "topic": "5.2",
      "type": "mc",
      "prompt": {
        "en": "A balanced overall reaction is 2A(g) + B(g) → C(g). No mechanism or kinetic data are given. What can you conclude about its rate law?",
        "es": "Una reacción global balanceada es 2A(g) + B(g) → C(g). No se da un mecanismo ni datos cinéticos. ¿Qué puedes concluir sobre su ley de velocidad?"
      },
      "choices": [
        {
          "text": {
            "en": "It must be first order in every reactant.",
            "es": "Debe ser de primer orden en cada reactivo."
          },
          "why": {
            "en": "First-order dependence is not automatic; it requires experimental support.",
            "es": "La dependencia de primer orden no es automática; requiere apoyo experimental."
          }
        },
        {
          "text": {
            "en": "The rate law must be determined experimentally; coefficients alone are insufficient.",
            "es": "La ley de velocidad se debe determinar experimentalmente; los coeficientes por sí solos no bastan."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It must be rate = k[A]<sup>2</sup>[B].",
            "es": "Debe ser velocidad = k[A]<sup>2</sup>[B]."
          },
          "why": {
            "en": "Coefficients give exponents only when the reaction is explicitly an elementary step.",
            "es": "Los coeficientes dan los exponentes solo cuando la reacción es explícitamente un paso elemental."
          }
        },
        {
          "text": {
            "en": "It must be zero order.",
            "es": "Debe ser de orden cero."
          },
          "why": {
            "en": "A missing mechanism does not imply concentration independence.",
            "es": "La ausencia de un mecanismo no implica independencia de la concentración."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "An overall reaction can contain several elementary steps. Use kinetic measurements to determine its rate law.",
        "es": "Una reacción global puede contener varias reacciones elementales. Usa mediciones cinéticas para determinar su ley de velocidad."
      }
    },
    {
      "id": "5.2-5",
      "topic": "5.2",
      "type": "numeric",
      "prompt": {
        "en": "For rate = k[A]<sup>2</sup>[B], the initial rate is 0.00800 M/s when [A] = 0.200 M and [B] = 0.100 M. Calculate k.",
        "es": "Para velocidad = k[A]<sup>2</sup>[B], la velocidad inicial es 0.00800 M/s cuando [A] = 0.200 M y [B] = 0.100 M. Calcula k."
      },
      "value": 2,
      "display": "2.00",
      "unit": "M^-2 s^-1",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "k = 0.00800/((0.200)<sup>2</sup>(0.100)) = 2.00 M<sup>−2</sup> s<sup>−1</sup>. Divide by both concentration factors.",
        "es": "k = 0.00800/((0.200)<sup>2</sup>(0.100)) = 2.00 M<sup>−2</sup> s<sup>−1</sup>. Divide entre ambos factores de concentración."
      }
    },
    {
      "id": "5.2-6",
      "topic": "5.2",
      "type": "numeric",
      "prompt": {
        "en": "A reaction is zero order in A. At fixed temperature and fixed concentrations of all other reactants, [A] is tripled. Enter the exact ratio new rate / old rate.",
        "es": "Una reacción es de orden cero en A. A temperatura fija y con concentraciones fijas de los demás reactivos, [A] se triplica. Escribe la razón exacta velocidad nueva / velocidad anterior."
      },
      "value": 1,
      "display": "1",
      "unit": "ratio",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "The concentration factor is 3<sup>0</sup> = 1. Zero order means the rate is independent of A over the stated range.",
        "es": "El factor de concentración es 3<sup>0</sup> = 1. El orden cero significa que la velocidad es independiente de A en el intervalo indicado."
      }
    },
    {
      "id": "5.3-1",
      "topic": "5.3",
      "type": "mc",
      "prompt": {
        "en": "The model graph shows [A] decreasing along a straight line from 0.800 M at 0 s to 0.400 M at 40.0 s. Which order is consistent with this graph over that interval?",
        "es": "La gráfica modelo muestra que [A] disminuye en línea recta de 0.800 M a 0 s a 0.400 M a 40.0 s. ¿Qué orden concuerda con esta gráfica en ese intervalo?"
      },
      "choices": [
        {
          "text": {
            "en": "Zero order",
            "es": "Orden cero"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "First order",
            "es": "Primer orden"
          },
          "why": {
            "en": "First order makes ln[A], rather than [A], linear with time.",
            "es": "El primer orden hace lineal ln[A], en vez de [A], con el tiempo."
          }
        },
        {
          "text": {
            "en": "Second order",
            "es": "Segundo orden"
          },
          "why": {
            "en": "Second order makes 1/[A], rather than [A], linear with time.",
            "es": "El segundo orden hace lineal 1/[A], en vez de [A], con el tiempo."
          }
        },
        {
          "text": {
            "en": "No reaction because the line is straight",
            "es": "No hay reacción porque la línea es recta"
          },
          "why": {
            "en": "A decreasing straight line represents constant reactant consumption, not zero consumption.",
            "es": "Una recta descendente representa consumo constante del reactivo, no consumo nulo."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The zero-order integrated rate law is [A] = [A]<sub>0</sub> − kt. Its slope is −k, so a straight [A] versus time graph supports zero order.",
        "es": "La ley de velocidad integrada de orden cero es [A] = [A]<sub>0</sub> − kt. Su pendiente es −k, así que una recta de [A] contra tiempo apoya el orden cero."
      },
      "linear": true
    },
    {
      "id": "5.3-2",
      "topic": "5.3",
      "type": "mc",
      "prompt": {
        "en": "Which graph is linear for a first-order disappearance of A at constant temperature?",
        "es": "¿Qué gráfica es lineal para la desaparición de A de primer orden a temperatura constante?"
      },
      "choices": [
        {
          "text": {
            "en": "[A] versus time",
            "es": "[A] contra tiempo"
          },
          "why": {
            "en": "A straight concentration plot indicates zero order.",
            "es": "Una gráfica recta de concentración indica orden cero."
          }
        },
        {
          "text": {
            "en": "1/[A] versus time",
            "es": "1/[A] contra tiempo"
          },
          "why": {
            "en": "A straight reciprocal concentration plot indicates second order.",
            "es": "Una gráfica recta de concentración recíproca indica segundo orden."
          }
        },
        {
          "text": {
            "en": "[A]<sup>2</sup> versus time",
            "es": "[A]<sup>2</sup> contra tiempo"
          },
          "why": {
            "en": "Squaring concentration does not linearize the first-order integrated law.",
            "es": "Elevar la concentración al cuadrado no hace lineal la ley integrada de primer orden."
          }
        },
        {
          "text": {
            "en": "ln[A] versus time",
            "es": "ln[A] contra tiempo"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "ln[A] = ln[A]<sub>0</sub> − kt is linear in time with slope −k.",
        "es": "ln[A] = ln[A]<sub>0</sub> − kt es lineal con el tiempo y tiene pendiente −k."
      }
    },
    {
      "id": "5.3-3",
      "topic": "5.3",
      "type": "mc",
      "prompt": {
        "en": "For rate = k[A]<sup>2</sup>, which graph is linear and what is its slope?",
        "es": "Para velocidad = k[A]<sup>2</sup>, ¿qué gráfica es lineal y cuál es su pendiente?"
      },
      "choices": [
        {
          "text": {
            "en": "[A] versus time, slope −k",
            "es": "[A] contra tiempo, pendiente −k"
          },
          "why": {
            "en": "This is the zero-order relationship.",
            "es": "Esta es la relación de orden cero."
          }
        },
        {
          "text": {
            "en": "1/[A] versus time, slope −k",
            "es": "1/[A] contra tiempo, pendiente −k"
          },
          "why": {
            "en": "The reciprocal increases as A disappears, so its slope is positive.",
            "es": "El recíproco aumenta al desaparecer A, así que su pendiente es positiva."
          }
        },
        {
          "text": {
            "en": "1/[A] versus time, slope +k",
            "es": "1/[A] contra tiempo, pendiente +k"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ln[A] versus time, slope −k",
            "es": "ln[A] contra tiempo, pendiente −k"
          },
          "why": {
            "en": "This is the first-order relationship.",
            "es": "Esta es la relación de primer orden."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The second-order law is 1/[A] = 1/[A]<sub>0</sub> + kt. A plot of 1/[A] versus time has slope +k.",
        "es": "La ley de segundo orden es 1/[A] = 1/[A]<sub>0</sub> + kt. Una gráfica de 1/[A] contra tiempo tiene pendiente +k."
      }
    },
    {
      "id": "5.3-4",
      "topic": "5.3",
      "type": "mc",
      "prompt": {
        "en": "For a first-order reaction at fixed temperature, which statement about half-life is correct?",
        "es": "Para una reacción de primer orden a temperatura fija, ¿qué afirmación sobre la vida media es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "It equals k.",
            "es": "Es igual a k."
          },
          "why": {
            "en": "Half-life is a time; first-order k has inverse-time units.",
            "es": "La vida media es un tiempo; k de primer orden tiene unidades de tiempo inverso."
          }
        },
        {
          "text": {
            "en": "It is independent of the initial concentration.",
            "es": "Es independiente de la concentración inicial."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It doubles when the initial concentration doubles.",
            "es": "Se duplica cuando se duplica la concentración inicial."
          },
          "why": {
            "en": "First-order half-life contains k but no initial concentration.",
            "es": "La vida media de primer orden contiene k, pero no la concentración inicial."
          }
        },
        {
          "text": {
            "en": "It halves whenever the concentration halves.",
            "es": "Se reduce a la mitad cada vez que la concentración se reduce a la mitad."
          },
          "why": {
            "en": "Successive first-order halvings take equal times at fixed temperature.",
            "es": "Las reducciones sucesivas a la mitad de primer orden requieren tiempos iguales a temperatura fija."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "For first order, t½ = 0.693/k. The same fraction reacts in each equal time interval.",
        "es": "Para primer orden, t½ = 0.693/k. La misma fracción reacciona en cada intervalo igual de tiempo."
      }
    },
    {
      "id": "5.3-5",
      "topic": "5.3",
      "type": "numeric",
      "prompt": {
        "en": "A first-order reaction has k = 0.0231 s<sup>−1</sup>. Using t½ = 0.693/k, calculate its half-life.",
        "es": "Una reacción de primer orden tiene k = 0.0231 s<sup>−1</sup>. Usa t½ = 0.693/k para calcular su vida media."
      },
      "value": 30,
      "display": "30.0",
      "unit": "s",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "t½ = 0.693/0.0231 = 30.0 s. Use the first-order half-life equation, not its reciprocal.",
        "es": "t½ = 0.693/0.0231 = 30.0 s. Usa la ecuación de vida media de primer orden, no su recíproco."
      }
    },
    {
      "id": "5.3-6",
      "topic": "5.3",
      "type": "numeric",
      "prompt": {
        "en": "For rate = k[A]<sup>2</sup>, [A]<sub>0</sub> = 0.500 M and k = 0.200 M<sup>−1</sup> s<sup>−1</sup>. Find [A] after 10.0 s.",
        "es": "Para velocidad = k[A]<sup>2</sup>, [A]<sub>0</sub> = 0.500 M y k = 0.200 M<sup>−1</sup> s<sup>−1</sup>. Calcula [A] después de 10.0 s."
      },
      "value": 0.25,
      "display": "0.250",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "1/[A] = 1/0.500 + (0.200)(10.0) = 4.00 M<sup>−1</sup>. Invert to obtain [A] = 0.250 M.",
        "es": "1/[A] = 1/0.500 + (0.200)(10.0) = 4.00 M<sup>−1</sup>. Invierte para obtener [A] = 0.250 M."
      }
    },
    {
      "id": "5.4-1",
      "topic": "5.4",
      "type": "mc",
      "prompt": {
        "en": "The reaction A(g) → B(g) + C(g) is explicitly an elementary step. What is its molecularity?",
        "es": "La reacción A(g) → B(g) + C(g) es explícitamente un paso elemental. ¿Cuál es su molecularidad?"
      },
      "choices": [
        {
          "text": {
            "en": "Unimolecular",
            "es": "Unimolecular"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Bimolecular",
            "es": "Bimolecular"
          },
          "why": {
            "en": "Molecularity counts reacting particles, not product particles.",
            "es": "La molecularidad cuenta partículas que reaccionan, no partículas de productos."
          }
        },
        {
          "text": {
            "en": "Termolecular",
            "es": "Termolecular"
          },
          "why": {
            "en": "Adding all particles on both sides does not determine molecularity.",
            "es": "Sumar todas las partículas de ambos lados no determina la molecularidad."
          }
        },
        {
          "text": {
            "en": "Zero because no collision partner is shown",
            "es": "Cero porque no se muestra otra partícula de colisión"
          },
          "why": {
            "en": "A single energized molecule can rearrange or dissociate in a unimolecular elementary event.",
            "es": "Una sola molécula con energía puede reorganizarse o disociarse en un evento elemental unimolecular."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "An elementary step with one reacting molecule is unimolecular. For this step, rate = k[A].",
        "es": "Un paso elemental con una molécula reactiva es unimolecular. Para este paso, velocidad = k[A]."
      }
    },
    {
      "id": "5.4-2",
      "topic": "5.4",
      "type": "mc",
      "prompt": {
        "en": "For the elementary step 2NO(g) → N<sub>2</sub>O<sub>2</sub>(g), which molecularity and rate law are appropriate?",
        "es": "Para el paso elemental 2NO(g) → N<sub>2</sub>O<sub>2</sub>(g), ¿qué molecularidad y ley de velocidad son apropiadas?"
      },
      "choices": [
        {
          "text": {
            "en": "Unimolecular; rate = k[NO]",
            "es": "Unimolecular; velocidad = k[NO]"
          },
          "why": {
            "en": "There are two reacting NO molecules, even though they are the same species.",
            "es": "Hay dos moléculas de NO que reaccionan, aunque sean de la misma especie."
          }
        },
        {
          "text": {
            "en": "Bimolecular; rate = k[N<sub>2</sub>O<sub>2</sub>]",
            "es": "Bimolecular; velocidad = k[N<sub>2</sub>O<sub>2</sub>]"
          },
          "why": {
            "en": "The forward step depends on its reactants, not on its product concentration.",
            "es": "El paso directo depende de sus reactivos, no de la concentración de su producto."
          }
        },
        {
          "text": {
            "en": "Termolecular; rate = k[NO]<sup>3</sup>",
            "es": "Termolecular; velocidad = k[NO]<sup>3</sup>"
          },
          "why": {
            "en": "The product is not a third reacting particle in the forward event.",
            "es": "El producto no es una tercera partícula reactiva en el evento directo."
          }
        },
        {
          "text": {
            "en": "Bimolecular; rate = k[NO]<sup>2</sup>",
            "es": "Bimolecular; velocidad = k[NO]<sup>2</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Two NO molecules participate in one elementary event, so the step is bimolecular and rate = k[NO]<sup>2</sup>.",
        "es": "Dos moléculas de NO participan en un evento elemental, así que el paso es bimolecular y velocidad = k[NO]<sup>2</sup>."
      }
    },
    {
      "id": "5.4-3",
      "topic": "5.4",
      "type": "mc",
      "prompt": {
        "en": "An elementary step is A(g) + B(g) → C(g). Which forward rate law follows from this step?",
        "es": "Un paso elemental es A(g) + B(g) → C(g). ¿Qué ley de velocidad directa se obtiene de este paso?"
      },
      "choices": [
        {
          "text": {
            "en": "rate = k[A + B]",
            "es": "velocidad = k[A + B]"
          },
          "why": {
            "en": "Concentrations multiply for an elementary bimolecular event; a bracketed sum is not the rate law.",
            "es": "Las concentraciones se multiplican para un evento elemental bimolecular; una suma entre corchetes no es la ley de velocidad."
          }
        },
        {
          "text": {
            "en": "rate = k[A]<sup>2</sup>[B]",
            "es": "velocidad = k[A]<sup>2</sup>[B]"
          },
          "why": {
            "en": "Only one A participates in each stated elementary event.",
            "es": "Solo participa una A en cada evento elemental indicado."
          }
        },
        {
          "text": {
            "en": "rate = k[A][B]",
            "es": "velocidad = k[A][B]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "rate = k[C]",
            "es": "velocidad = k[C]"
          },
          "why": {
            "en": "C is the product of the forward step.",
            "es": "C es el producto del paso directo."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "For an elementary reaction, each reactant coefficient becomes its concentration exponent: rate = k[A][B].",
        "es": "Para una reacción elemental, cada coeficiente reactivo se vuelve su exponente de concentración: velocidad = k[A][B]."
      }
    },
    {
      "id": "5.4-4",
      "topic": "5.4",
      "type": "mc",
      "prompt": {
        "en": "Why are termolecular elementary reactions less common than bimolecular elementary reactions?",
        "es": "¿Por qué las reacciones elementales termoleculares son menos comunes que las reacciones elementales bimoleculares?"
      },
      "choices": [
        {
          "text": {
            "en": "Only three products can form in a termolecular step.",
            "es": "Solo pueden formarse tres productos en un paso termolecular."
          },
          "why": {
            "en": "Molecularity describes reactant participants, not the number of products.",
            "es": "La molecularidad describe los participantes reactivos, no el número de productos."
          }
        },
        {
          "text": {
            "en": "Three particles must meet simultaneously with suitable energy and orientation.",
            "es": "Tres partículas deben encontrarse simultáneamente con energía y orientación adecuadas."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Three-particle events violate conservation of mass.",
            "es": "Los eventos de tres partículas violan la conservación de la masa."
          },
          "why": {
            "en": "Mass conservation can hold for any molecularity.",
            "es": "La conservación de la masa puede cumplirse para cualquier molecularidad."
          }
        },
        {
          "text": {
            "en": "All termolecular reactions have zero activation energy.",
            "es": "Todas las reacciones termoleculares tienen energía de activación nula."
          },
          "why": {
            "en": "Molecularity does not force the activation energy to be zero.",
            "es": "La molecularidad no obliga a que la energía de activación sea nula."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Simultaneous appropriately oriented encounters of three particles are less probable than encounters of two particles.",
        "es": "Los encuentros simultáneos de tres partículas con orientación adecuada son menos probables que los encuentros de dos partículas."
      }
    },
    {
      "id": "5.4-5",
      "topic": "5.4",
      "type": "numeric",
      "prompt": {
        "en": "For elementary A(aq) + B(aq) → C(aq), k = 0.500 M<sup>−1</sup> s<sup>−1</sup>, [A] = 0.200 M and [B] = 0.300 M. Calculate the reaction rate.",
        "es": "Para A(aq) + B(aq) → C(aq) elemental, k = 0.500 M<sup>−1</sup> s<sup>−1</sup>, [A] = 0.200 M y [B] = 0.300 M. Calcula la velocidad de reacción."
      },
      "value": 0.03,
      "display": "0.0300",
      "unit": "M/s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "rate = k[A][B] = (0.500)(0.200)(0.300) = 0.0300 M/s. The concentration factors cancel the inverse concentration unit in k.",
        "es": "velocidad = k[A][B] = (0.500)(0.200)(0.300) = 0.0300 M/s. Los factores de concentración cancelan la unidad de concentración inversa en k."
      }
    },
    {
      "id": "5.4-6",
      "topic": "5.4",
      "type": "numeric",
      "prompt": {
        "en": "A proposed elementary gas-phase step is A(g) + 2B(g) → P(g). Enter its molecularity as an exact number of reacting particles.",
        "es": "Un paso elemental propuesto en fase gaseosa es A(g) + 2B(g) → P(g). Escribe su molecularidad como el número exacto de partículas que reaccionan."
      },
      "value": 3,
      "display": "3",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "One A plus two B particles gives molecularity 1 + 2 = 3. This is a termolecular elementary-step model.",
        "es": "Una partícula de A más dos de B da molecularidad 1 + 2 = 3. Este es un modelo de paso elemental termolecular."
      }
    },
    {
      "id": "5.5-1",
      "topic": "5.5",
      "type": "mc",
      "prompt": {
        "en": "According to the collision model, what is required for a successful collision between reactants?",
        "es": "Según el modelo de colisiones, ¿qué se requiere para una colisión exitosa entre reactivos?"
      },
      "choices": [
        {
          "text": {
            "en": "Sufficient collision energy and a suitable orientation",
            "es": "Energía de colisión suficiente y orientación adecuada"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Sufficient energy, regardless of orientation",
            "es": "Energía suficiente, sin importar la orientación"
          },
          "why": {
            "en": "An energetic collision can fail when the reacting sites do not meet correctly.",
            "es": "Una colisión con energía puede fallar cuando los sitios reactivos no se encuentran correctamente."
          }
        },
        {
          "text": {
            "en": "Suitable orientation, regardless of energy",
            "es": "Orientación adecuada, sin importar la energía"
          },
          "why": {
            "en": "Correct orientation cannot compensate for insufficient energy to cross the barrier.",
            "es": "La orientación correcta no compensa la energía insuficiente para superar la barrera."
          }
        },
        {
          "text": {
            "en": "Any contact between particles",
            "es": "Cualquier contacto entre partículas"
          },
          "why": {
            "en": "Many encounters fail because their energy or orientation is unsuitable.",
            "es": "Muchos encuentros fallan porque su energía u orientación no es adecuada."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A successful collision requires enough energy to overcome the activation barrier and an orientation that allows the needed bond rearrangement.",
        "es": "Una colisión exitosa requiere energía suficiente para superar la barrera de activación y una orientación que permita la reorganización de enlaces necesaria."
      }
    },
    {
      "id": "5.5-2",
      "topic": "5.5",
      "type": "mc",
      "prompt": {
        "en": "Temperature increases while the reaction pathway and activation energy stay the same. Why does the reaction usually become faster?",
        "es": "La temperatura aumenta mientras la ruta de reacción y la energía de activación permanecen iguales. ¿Por qué la reacción suele volverse más veloz?"
      },
      "choices": [
        {
          "text": {
            "en": "The activation energy necessarily decreases.",
            "es": "La energía de activación disminuye necesariamente."
          },
          "why": {
            "en": "Heating changes the energy distribution; it does not necessarily change the pathway barrier.",
            "es": "Calentar cambia la distribución de energía; no cambia necesariamente la barrera de la ruta."
          }
        },
        {
          "text": {
            "en": "Every collision becomes successful.",
            "es": "Cada colisión se vuelve exitosa."
          },
          "why": {
            "en": "Some collisions still lack energy or a suitable orientation.",
            "es": "Algunas colisiones aún carecen de energía o de orientación adecuada."
          }
        },
        {
          "text": {
            "en": "The reaction enthalpy becomes zero.",
            "es": "La entalpía de reacción se vuelve cero."
          },
          "why": {
            "en": "A faster rate does not require a zero enthalpy change.",
            "es": "Una mayor velocidad no requiere un cambio de entalpía nulo."
          }
        },
        {
          "text": {
            "en": "A larger fraction of collisions has energy above the activation threshold.",
            "es": "Una fracción mayor de las colisiones tiene energía superior al umbral de activación."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Raising temperature increases the fraction of particles energetic enough to cross a fixed activation barrier.",
        "es": "Elevar la temperatura aumenta la fracción de partículas con energía suficiente para superar una barrera de activación fija."
      }
    },
    {
      "id": "5.5-3",
      "topic": "5.5",
      "type": "mc",
      "prompt": {
        "en": "At constant temperature, the concentration of a gaseous reactant increases. In the collision model, what changes most directly?",
        "es": "A temperatura constante, aumenta la concentración de un reactivo gaseoso. En el modelo de colisiones, ¿qué cambia más directamente?"
      },
      "choices": [
        {
          "text": {
            "en": "The average kinetic energy necessarily increases.",
            "es": "La energía cinética promedio aumenta necesariamente."
          },
          "why": {
            "en": "Average kinetic energy depends on temperature, which is fixed.",
            "es": "La energía cinética promedio depende de la temperatura, que es fija."
          }
        },
        {
          "text": {
            "en": "Reactant particles acquire a different chemical identity before colliding.",
            "es": "Las partículas reactivas adquieren otra identidad química antes de chocar."
          },
          "why": {
            "en": "Increasing concentration does not itself change molecular identity.",
            "es": "Aumentar la concentración no cambia por sí solo la identidad molecular."
          }
        },
        {
          "text": {
            "en": "Collisions occur more often per unit volume and time.",
            "es": "Las colisiones ocurren con mayor frecuencia por unidad de volumen y tiempo."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The activation energy becomes smaller.",
            "es": "La energía de activación se vuelve menor."
          },
          "why": {
            "en": "Concentration alone does not lower the barrier for an unchanged pathway.",
            "es": "La concentración por sí sola no reduce la barrera de una ruta que no cambia."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "More particles in a fixed volume produce more encounters per unit time. At the same temperature, the energy distribution is unchanged in this model.",
        "es": "Más partículas en un volumen fijo producen más encuentros por unidad de tiempo. A la misma temperatura, la distribución de energía no cambia en este modelo."
      }
    },
    {
      "id": "5.5-4",
      "topic": "5.5",
      "type": "mc",
      "prompt": {
        "en": "The Arrhenius equation is k = A exp(−E<sub>a</sub>/RT). For positive E<sub>a</sub>, with A and E<sub>a</sub> fixed, what happens to k as temperature rises?",
        "es": "La ecuación de Arrhenius es k = A exp(−E<sub>a</sub>/RT). Para E<sub>a</sub> positiva, con A y E<sub>a</sub> fijos, ¿qué le ocurre a k al subir la temperatura?"
      },
      "choices": [
        {
          "text": {
            "en": "k becomes the reaction enthalpy.",
            "es": "k se vuelve la entalpía de reacción."
          },
          "why": {
            "en": "A rate constant and reaction enthalpy are different physical quantities.",
            "es": "Una constante de velocidad y la entalpía de reacción son cantidades físicas distintas."
          }
        },
        {
          "text": {
            "en": "k increases.",
            "es": "k aumenta."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "k decreases.",
            "es": "k disminuye."
          },
          "why": {
            "en": "A larger T makes the negative exponent less negative, so the exponential increases.",
            "es": "Una T mayor hace menos negativo el exponente, así que la exponencial aumenta."
          }
        },
        {
          "text": {
            "en": "k stays fixed because concentration is absent.",
            "es": "k permanece fija porque no aparece la concentración."
          },
          "why": {
            "en": "The equation explicitly contains temperature even though it does not contain reactant concentrations.",
            "es": "La ecuación contiene explícitamente la temperatura aunque no contenga las concentraciones de los reactivos."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "For fixed positive E<sub>a</sub>, increasing T makes −E<sub>a</sub>/RT less negative. Therefore the exponential and k increase.",
        "es": "Para E<sub>a</sub> positiva fija, aumentar T hace que −E<sub>a</sub>/RT sea menos negativo. Por lo tanto, aumentan la exponencial y k."
      }
    },
    {
      "id": "5.5-5",
      "topic": "5.5",
      "type": "numeric",
      "prompt": {
        "en": "Collision-count model: exactly 200 encounters occur. Exactly 30% have sufficient energy, and exactly 20% of those energetic encounters have suitable orientation. How many successful collisions does the model predict?",
        "es": "Modelo de conteo de colisiones: ocurren exactamente 200 encuentros. Exactamente 30% tienen energía suficiente y exactamente 20% de esos encuentros energéticos tienen orientación adecuada. ¿Cuántas colisiones exitosas predice el modelo?"
      },
      "value": 12,
      "display": "12",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "The model gives 200 × 0.30 × 0.20 = 12 successful collisions. The orientation fraction applies only to energetic encounters.",
        "es": "El modelo da 200 × 0.30 × 0.20 = 12 colisiones exitosas. La fracción de orientación se aplica solo a los encuentros energéticos."
      }
    },
    {
      "id": "5.5-6",
      "topic": "5.5",
      "type": "numeric",
      "prompt": {
        "en": "Two first-order pathways have the same Arrhenius prefactor at the same temperature. The lower-barrier pathway has k(new)/k(old) = 4.00. If k(old) = 0.0250 s<sup>−1</sup>, calculate k(new).",
        "es": "Dos rutas de primer orden tienen el mismo factor preexponencial de Arrhenius a la misma temperatura. La ruta de menor barrera tiene k(nueva)/k(anterior) = 4.00. Si k(anterior) = 0.0250 s<sup>−1</sup>, calcula k(nueva)."
      },
      "value": 0.1,
      "display": "0.100",
      "unit": "s^-1",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "k(new) = (4.00)(0.0250) = 0.100 s<sup>−1</sup>. The given ratio captures the barrier effect at the stated temperature.",
        "es": "k(nueva) = (4.00)(0.0250) = 0.100 s<sup>−1</sup>. La razón dada representa el efecto de la barrera a la temperatura indicada."
      }
    },
    {
      "id": "5.6-1",
      "topic": "5.6",
      "type": "mc",
      "prompt": {
        "en": "In the single-step energy-profile model, reactants are at 20 kJ/mol, the peak at 80 kJ/mol and products at 0 kJ/mol. What does the peak represent?",
        "es": "En el modelo de perfil de energía de un paso, los reactivos están a 20 kJ/mol, el pico a 80 kJ/mol y los productos a 0 kJ/mol. ¿Qué representa el pico?"
      },
      "choices": [
        {
          "text": {
            "en": "A transition state (activated complex)",
            "es": "Un estado de transición (complejo activado)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A stable intermediate",
            "es": "Un intermediario estable"
          },
          "why": {
            "en": "A peak is unstable along the reaction coordinate; an intermediate occupies a valley between peaks.",
            "es": "Un pico es inestable a lo largo de la coordenada de reacción; un intermediario ocupa un valle entre picos."
          }
        },
        {
          "text": {
            "en": "The final equilibrium mixture",
            "es": "La mezcla final en equilibrio"
          },
          "why": {
            "en": "The peak describes a configuration along a pathway, not equilibrium composition.",
            "es": "El pico describe una configuración en una ruta, no la composición de equilibrio."
          }
        },
        {
          "text": {
            "en": "The activation energy itself",
            "es": "La energía de activación en sí"
          },
          "why": {
            "en": "The activation energy is a difference between levels, not the configuration at the peak.",
            "es": "La energía de activación es una diferencia entre niveles, no la configuración en el pico."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The peak is the transition state, also called the activated complex. It is not an isolable intermediate.",
        "es": "El pico es el estado de transición, también llamado complejo activado. No es un intermediario que se pueda aislar."
      },
      "single": true
    },
    {
      "id": "5.6-2",
      "topic": "5.6",
      "type": "mc",
      "prompt": {
        "en": "In the single-step energy-profile model, reactants are at 20 kJ/mol, the peak at 80 kJ/mol and products at 0 kJ/mol. Which description of ΔH is correct?",
        "es": "En el modelo de perfil de energía de un paso, los reactivos están a 20 kJ/mol, el pico a 80 kJ/mol y los productos a 0 kJ/mol. ¿Qué descripción de ΔH es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "Endothermic; ΔH = +20 kJ/mol",
            "es": "Endotérmica; ΔH = +20 kJ/mol"
          },
          "why": {
            "en": "Products are lower than reactants, so products minus reactants is negative.",
            "es": "Los productos están más abajo que los reactivos, así que productos menos reactivos es negativo."
          }
        },
        {
          "text": {
            "en": "Exothermic; ΔH = −80 kJ/mol",
            "es": "Exotérmica; ΔH = −80 kJ/mol"
          },
          "why": {
            "en": "The peak is not used to find ΔH; only the reactant and product levels matter.",
            "es": "El pico no se usa para calcular ΔH; solo importan los niveles de reactivos y productos."
          }
        },
        {
          "text": {
            "en": "Thermoneutral; ΔH = 0 kJ/mol",
            "es": "Termoneutra; ΔH = 0 kJ/mol"
          },
          "why": {
            "en": "A zero product energy does not mean a zero change from the nonzero reactant energy.",
            "es": "Una energía de producto nula no significa un cambio nulo desde la energía no nula del reactivo."
          }
        },
        {
          "text": {
            "en": "Exothermic; ΔH = −20 kJ/mol",
            "es": "Exotérmica; ΔH = −20 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "ΔH = 0 − 20 = −20 kJ/mol. Products are lower in energy, so the reaction is exothermic.",
        "es": "ΔH = 0 − 20 = −20 kJ/mol. Los productos tienen menor energía, así que la reacción es exotérmica."
      },
      "single": true
    },
    {
      "id": "5.6-3",
      "topic": "5.6",
      "type": "mc",
      "prompt": {
        "en": "In the single-step energy-profile model, reactants are at 20 kJ/mol, the peak at 80 kJ/mol and products at 0 kJ/mol. What is the reverse activation energy?",
        "es": "En el modelo de perfil de energía de un paso, los reactivos están a 20 kJ/mol, el pico a 80 kJ/mol y los productos a 0 kJ/mol. ¿Cuál es la energía de activación inversa?"
      },
      "choices": [
        {
          "text": {
            "en": "20 kJ/mol",
            "es": "20 kJ/mol"
          },
          "why": {
            "en": "This is the magnitude of the enthalpy change, not the barrier from products to the peak.",
            "es": "Esta es la magnitud del cambio de entalpía, no la barrera desde los productos hasta el pico."
          }
        },
        {
          "text": {
            "en": "0 kJ/mol",
            "es": "0 kJ/mol"
          },
          "why": {
            "en": "Products at zero energy still must reach the peak to react in reverse.",
            "es": "Los productos a energía cero aún deben alcanzar el pico para reaccionar en sentido inverso."
          }
        },
        {
          "text": {
            "en": "80 kJ/mol",
            "es": "80 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "60 kJ/mol",
            "es": "60 kJ/mol"
          },
          "why": {
            "en": "Subtracting the reactant level gives the forward barrier, not the reverse barrier.",
            "es": "Restar el nivel de reactivos da la barrera directa, no la inversa."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Reverse E<sub>a</sub> = peak − products = 80 − 0 = 80 kJ/mol. Forward E<sub>a</sub> is 80 − 20 = 60 kJ/mol.",
        "es": "E<sub>a</sub> inversa = pico − productos = 80 − 0 = 80 kJ/mol. E<sub>a</sub> directa es 80 − 20 = 60 kJ/mol."
      },
      "single": true
    },
    {
      "id": "5.6-4",
      "topic": "5.6",
      "type": "mc",
      "prompt": {
        "en": "What does the horizontal reaction coordinate on an energy profile represent?",
        "es": "¿Qué representa la coordenada de reacción horizontal en un perfil de energía?"
      },
      "choices": [
        {
          "text": {
            "en": "Temperature in kelvin",
            "es": "Temperatura en kelvin"
          },
          "why": {
            "en": "The axis tracks structural progress, not a temperature scan.",
            "es": "El eje sigue el avance estructural, no un recorrido de temperatura."
          }
        },
        {
          "text": {
            "en": "Progress of molecular rearrangement from reactants to products",
            "es": "Avance de la reorganización molecular de reactivos a productos"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Elapsed time measured by a clock",
            "es": "Tiempo transcurrido medido con un reloj"
          },
          "why": {
            "en": "The reaction coordinate is not a time axis; spacing does not measure step duration.",
            "es": "La coordenada de reacción no es un eje de tiempo; la separación no mide la duración de un paso."
          }
        },
        {
          "text": {
            "en": "Reactant concentration in M",
            "es": "Concentración del reactivo en M"
          },
          "why": {
            "en": "Concentration is not the horizontal quantity in a reaction-coordinate energy diagram.",
            "es": "La concentración no es la cantidad horizontal en un diagrama de energía contra coordenada de reacción."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The reaction coordinate follows bond rearrangement along a proposed pathway. It does not directly measure time or concentration.",
        "es": "La coordenada de reacción sigue la reorganización de enlaces a lo largo de una ruta propuesta. No mide directamente tiempo ni concentración."
      }
    },
    {
      "id": "5.6-5",
      "topic": "5.6",
      "type": "numeric",
      "prompt": {
        "en": "In the single-step energy-profile model, reactants are at 20 kJ/mol, the peak at 80 kJ/mol and products at 0 kJ/mol. Calculate the forward activation energy. Report three significant figures.",
        "es": "En el modelo de perfil de energía de un paso, los reactivos están a 20 kJ/mol, el pico a 80 kJ/mol y los productos a 0 kJ/mol. Calcula la energía de activación directa. Expresa tres cifras significativas."
      },
      "value": 60,
      "display": "60.0",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "Forward E<sub>a</sub> = peak − reactants = 80 − 20 = 60.0 kJ/mol to the requested precision.",
        "es": "E<sub>a</sub> directa = pico − reactivos = 80 − 20 = 60.0 kJ/mol con la precisión solicitada."
      },
      "single": true
    },
    {
      "id": "5.6-6",
      "topic": "5.6",
      "type": "numeric",
      "prompt": {
        "en": "A separate energy-profile model places reactants at 10.0 kJ/mol and products at 35.0 kJ/mol. Calculate ΔH, including its sign.",
        "es": "Otro modelo de perfil de energía coloca los reactivos a 10.0 kJ/mol y los productos a 35.0 kJ/mol. Calcula ΔH, incluido su signo."
      },
      "value": 25,
      "display": "+25.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "ΔH = products − reactants = 35.0 − 10.0 = +25.0 kJ/mol. This model is endothermic.",
        "es": "ΔH = productos − reactivos = 35.0 − 10.0 = +25.0 kJ/mol. Este modelo es endotérmico."
      }
    },
    {
      "id": "5.7-1",
      "topic": "5.7",
      "type": "mc",
      "prompt": {
        "en": "Proposed gas-phase mechanism: step 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); step 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). What is the overall reaction?",
        "es": "Mecanismo de reacción propuesto en fase gaseosa: paso 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); paso 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). ¿Cuál es la reacción global?"
      },
      "choices": [
        {
          "text": {
            "en": "NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g)",
            "es": "NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "2NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g)",
            "es": "2NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "One NO<sub>2</sub> is regenerated and must cancel; this option does not conserve atoms.",
            "es": "Un NO<sub>2</sub> se regenera y debe cancelarse; esta opción no conserva los átomos."
          }
        },
        {
          "text": {
            "en": "NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g)",
            "es": "NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "This is only the second step and retains the intermediate as an overall reactant.",
            "es": "Este es solo el segundo paso y conserva al intermediario como reactivo global."
          }
        },
        {
          "text": {
            "en": "NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g)",
            "es": "NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g)"
          },
          "why": {
            "en": "This omits the CO reaction and does not cancel the species formed and consumed between steps.",
            "es": "Esto omite la reacción del CO y no cancela las especies formadas y consumidas entre pasos."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Add both steps and cancel NO<sub>3</sub> plus one NO<sub>2</sub>. The overall reaction is NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g).",
        "es": "Suma ambos pasos y cancela NO<sub>3</sub> más un NO<sub>2</sub>. La reacción global es NO<sub>2</sub>(g) + CO(g) → NO(g) + CO<sub>2</sub>(g)."
      }
    },
    {
      "id": "5.7-2",
      "topic": "5.7",
      "type": "mc",
      "prompt": {
        "en": "Proposed gas-phase mechanism: step 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); step 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). Which species is an intermediate?",
        "es": "Mecanismo de reacción propuesto en fase gaseosa: paso 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); paso 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). ¿Qué especie es un intermediario?"
      },
      "choices": [
        {
          "text": {
            "en": "CO(g)",
            "es": "CO(g)"
          },
          "why": {
            "en": "CO is consumed overall and is not formed in an earlier step.",
            "es": "El CO se consume globalmente y no se forma en un paso anterior."
          }
        },
        {
          "text": {
            "en": "NO(g)",
            "es": "NO(g)"
          },
          "why": {
            "en": "NO is an overall product and is not consumed in the later step.",
            "es": "El NO es un producto global y no se consume en el paso posterior."
          }
        },
        {
          "text": {
            "en": "CO<sub>2</sub>(g)",
            "es": "CO<sub>2</sub>(g)"
          },
          "why": {
            "en": "Carbon dioxide is formed as an overall product, not formed and then consumed.",
            "es": "El dióxido de carbono se forma como producto global, no se forma y luego se consume."
          }
        },
        {
          "text": {
            "en": "NO<sub>3</sub>(g)",
            "es": "NO<sub>3</sub>(g)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "NO<sub>3</sub> forms in step 1 and is consumed in step 2. It cancels from the overall equation, so it is an intermediate.",
        "es": "El NO<sub>3</sub> se forma en el paso 1 y se consume en el paso 2. Se cancela de la ecuación global, así que es un intermediario."
      }
    },
    {
      "id": "5.7-3",
      "topic": "5.7",
      "type": "mc",
      "prompt": {
        "en": "Proposed mechanism: Cl(g) + O<sub>3</sub>(g) → ClO(g) + O<sub>2</sub>(g); ClO(g) + O(g) → Cl(g) + O<sub>2</sub>(g). Which species acts as the catalyst?",
        "es": "Mecanismo de reacción propuesto: Cl(g) + O<sub>3</sub>(g) → ClO(g) + O<sub>2</sub>(g); ClO(g) + O(g) → Cl(g) + O<sub>2</sub>(g). ¿Qué especie actúa como catalizador?"
      },
      "choices": [
        {
          "text": {
            "en": "O<sub>3</sub>(g)",
            "es": "O<sub>3</sub>(g)"
          },
          "why": {
            "en": "Ozone is consumed overall and is not regenerated.",
            "es": "El ozono se consume globalmente y no se regenera."
          }
        },
        {
          "text": {
            "en": "O<sub>2</sub>(g)",
            "es": "O<sub>2</sub>(g)"
          },
          "why": {
            "en": "Oxygen molecules are products, not a species consumed early and regenerated later.",
            "es": "Las moléculas de oxígeno son productos, no una especie consumida al inicio y regenerada después."
          }
        },
        {
          "text": {
            "en": "Cl(g)",
            "es": "Cl(g)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "ClO(g)",
            "es": "ClO(g)"
          },
          "why": {
            "en": "ClO is formed and then consumed, making it an intermediate rather than the catalyst.",
            "es": "El ClO se forma y luego se consume, así que es un intermediario y no el catalizador."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Cl is consumed in the first step and regenerated in the second. It participates in the pathway but is not consumed overall.",
        "es": "El Cl se consume en el primer paso y se regenera en el segundo. Participa en la ruta, pero no se consume globalmente."
      }
    },
    {
      "id": "5.7-4",
      "topic": "5.7",
      "type": "mc",
      "prompt": {
        "en": "Which evidence is necessary for a proposed reaction mechanism to be consistent with experiment?",
        "es": "¿Qué evidencia es necesaria para que un mecanismo de reacción propuesto sea consistente con el experimento?"
      },
      "choices": [
        {
          "text": {
            "en": "Every step has the same rate constant.",
            "es": "Cada paso tiene la misma constante de velocidad."
          },
          "why": {
            "en": "Elementary steps may have different rate constants and even different units for them.",
            "es": "Los pasos elementales pueden tener constantes de velocidad distintas e incluso unidades distintas para ellas."
          }
        },
        {
          "text": {
            "en": "Its steps sum to the overall reaction and its predicted rate law agrees with measurements.",
            "es": "Sus pasos suman la reacción global y su ley de velocidad predicha concuerda con las mediciones."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Its steps sum correctly, regardless of the rate law.",
            "es": "Sus pasos suman correctamente, sin importar la ley de velocidad."
          },
          "why": {
            "en": "Stoichiometric agreement alone cannot establish kinetic consistency.",
            "es": "La concordancia estequiométrica por sí sola no establece consistencia cinética."
          }
        },
        {
          "text": {
            "en": "It includes the largest possible number of steps.",
            "es": "Incluye el mayor número posible de pasos."
          },
          "why": {
            "en": "Adding steps is not experimental evidence for a pathway.",
            "es": "Añadir pasos no es evidencia experimental de una ruta."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "A mechanism must reproduce both stoichiometry and measured kinetics. These checks support a mechanism but do not prove it is unique.",
        "es": "Un mecanismo debe reproducir tanto la estequiometría como la cinética medida. Estas comprobaciones apoyan un mecanismo, pero no prueban que sea único."
      }
    },
    {
      "id": "5.7-5",
      "topic": "5.7",
      "type": "numeric",
      "prompt": {
        "en": "Proposed gas-phase mechanism: step 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); step 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). How many distinct intermediate species appear? Enter an exact count.",
        "es": "Mecanismo de reacción propuesto en fase gaseosa: paso 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); paso 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). ¿Cuántas especies intermediarias distintas aparecen? Escribe un conteo exacto."
      },
      "value": 1,
      "display": "1",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Only NO<sub>3</sub> is formed and then consumed without appearing in the overall reaction. The count is 1.",
        "es": "Solo el NO<sub>3</sub> se forma y luego se consume sin aparecer en la reacción global. El conteo es 1."
      }
    },
    {
      "id": "5.7-6",
      "topic": "5.7",
      "type": "numeric",
      "prompt": {
        "en": "Proposed mechanism: Cl(g) + O<sub>3</sub>(g) → ClO(g) + O<sub>2</sub>(g); ClO(g) + O(g) → Cl(g) + O<sub>2</sub>(g). After canceling the catalyst and intermediate, what is the smallest whole-number coefficient of O<sub>2</sub> in the overall reaction?",
        "es": "Mecanismo de reacción propuesto: Cl(g) + O<sub>3</sub>(g) → ClO(g) + O<sub>2</sub>(g); ClO(g) + O(g) → Cl(g) + O<sub>2</sub>(g). Después de cancelar el catalizador y el intermediario, ¿cuál es el menor coeficiente entero de O<sub>2</sub> en la reacción global?"
      },
      "value": 2,
      "display": "2",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Cancel Cl and ClO to obtain O<sub>3</sub>(g) + O(g) → 2O<sub>2</sub>(g). The oxygen coefficient is 2.",
        "es": "Cancela Cl y ClO para obtener O<sub>3</sub>(g) + O(g) → 2O<sub>2</sub>(g). El coeficiente del oxígeno es 2."
      }
    },
    {
      "id": "5.8-1",
      "topic": "5.8",
      "type": "mc",
      "prompt": {
        "en": "Proposed gas-phase mechanism: step 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); step 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). Step 1 is elementary and slow; step 2 is fast. Which rate law is predicted?",
        "es": "Mecanismo de reacción propuesto en fase gaseosa: paso 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); paso 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). El paso 1 es elemental y lento; el paso 2 es rápido. ¿Qué ley de velocidad se predice?"
      },
      "choices": [
        {
          "text": {
            "en": "rate = k[NO<sub>2</sub>]<sup>2</sup>",
            "es": "velocidad = k[NO<sub>2</sub>]<sup>2</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "rate = k[NO<sub>2</sub>][CO]",
            "es": "velocidad = k[NO<sub>2</sub>][CO]"
          },
          "why": {
            "en": "This copies overall coefficients instead of using the slow elementary step.",
            "es": "Esto copia los coeficientes globales en lugar de usar el paso elemental lento."
          }
        },
        {
          "text": {
            "en": "rate = k[NO<sub>3</sub>][CO]",
            "es": "velocidad = k[NO<sub>3</sub>][CO]"
          },
          "why": {
            "en": "This describes the subsequent fast step rather than the slow first-step prediction.",
            "es": "Esto describe el paso rápido posterior en vez de la predicción del primer paso lento."
          }
        },
        {
          "text": {
            "en": "rate = k[NO<sub>2</sub>]",
            "es": "velocidad = k[NO<sub>2</sub>]"
          },
          "why": {
            "en": "Two NO<sub>2</sub> molecules participate in the slow elementary event, giving a squared dependence.",
            "es": "Dos moléculas de NO<sub>2</sub> participan en el evento elemental lento, lo que da una dependencia al cuadrado."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The slow first step is the rate-determining step. Since it is elementary and consumes two NO<sub>2</sub>, rate = k[NO<sub>2</sub>]<sup>2</sup>.",
        "es": "El primer paso lento es el paso determinante de la velocidad. Como es elemental y consume dos NO<sub>2</sub>, velocidad = k[NO<sub>2</sub>]<sup>2</sup>."
      }
    },
    {
      "id": "5.8-2",
      "topic": "5.8",
      "type": "mc",
      "prompt": {
        "en": "Proposed gas-phase mechanism: step 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); step 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). Under conditions where step 1 remains slow and step 2 remains fast, what order in CO is predicted?",
        "es": "Mecanismo de reacción propuesto en fase gaseosa: paso 1, NO<sub>2</sub>(g) + NO<sub>2</sub>(g) → NO<sub>3</sub>(g) + NO(g); paso 2, NO<sub>3</sub>(g) + CO(g) → NO<sub>2</sub>(g) + CO<sub>2</sub>(g). En condiciones donde el paso 1 sigue siendo lento y el paso 2 sigue siendo rápido, ¿qué orden en CO se predice?"
      },
      "choices": [
        {
          "text": {
            "en": "First order in CO because it is an overall reactant",
            "es": "Primer orden en CO porque es un reactivo global"
          },
          "why": {
            "en": "An overall reactant need not appear in the observed rate law.",
            "es": "Un reactivo global no tiene que aparecer en la ley de velocidad observada."
          }
        },
        {
          "text": {
            "en": "Second order in CO because there are two steps",
            "es": "Segundo orden en CO porque hay dos pasos"
          },
          "why": {
            "en": "The number of steps does not set the concentration exponent.",
            "es": "El número de pasos no determina el exponente de concentración."
          }
        },
        {
          "text": {
            "en": "Negative order in CO because it is consumed",
            "es": "Orden negativo en CO porque se consume"
          },
          "why": {
            "en": "Consumption does not imply a negative order; order describes the concentration dependence of rate.",
            "es": "El consumo no implica orden negativo; el orden describe la dependencia de la velocidad con la concentración."
          }
        },
        {
          "text": {
            "en": "Zero order in CO",
            "es": "Orden cero en CO"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The slow-step prediction is independent of CO. This zero-order prediction applies only while the assumed slow/fast separation remains valid.",
        "es": "La predicción del paso lento es independiente del CO. Esta predicción de orden cero se aplica solo mientras siga siendo válida la separación supuesta entre lento y rápido."
      }
    },
    {
      "id": "5.8-3",
      "topic": "5.8",
      "type": "mc",
      "prompt": {
        "en": "A model has slow elementary A(g) + B(g) → I(g), followed by fast I(g) + B(g) → P(g). Which rate law follows, even though the overall reaction consumes two B?",
        "es": "Un modelo tiene A(g) + B(g) → I(g) elemental lento, seguido de I(g) + B(g) → P(g) rápido. ¿Qué ley de velocidad se obtiene, aunque la reacción global consuma dos B?"
      },
      "choices": [
        {
          "text": {
            "en": "rate = k[I][B]",
            "es": "velocidad = k[I][B]"
          },
          "why": {
            "en": "This is the expression for the fast step, not the slow-first mechanism prediction.",
            "es": "Esta es la expresión del paso rápido, no la predicción del mecanismo con primer paso lento."
          }
        },
        {
          "text": {
            "en": "rate = k[P]",
            "es": "velocidad = k[P]"
          },
          "why": {
            "en": "P is the final product and is absent from the slow forward step.",
            "es": "P es el producto final y no aparece en el paso directo lento."
          }
        },
        {
          "text": {
            "en": "rate = k[A][B]",
            "es": "velocidad = k[A][B]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "rate = k[A][B]<sup>2</sup>",
            "es": "velocidad = k[A][B]<sup>2</sup>"
          },
          "why": {
            "en": "This uses the overall B coefficient instead of the slow elementary-step coefficient.",
            "es": "Esto usa el coeficiente global de B en vez del coeficiente del paso elemental lento."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The rate-determining step contains one A and one B, giving rate = k[A][B]. The second B is consumed in the later fast step.",
        "es": "El paso determinante de la velocidad contiene una A y una B, así que velocidad = k[A][B]. La segunda B se consume en el paso rápido posterior."
      }
    },
    {
      "id": "5.8-4",
      "topic": "5.8",
      "type": "mc",
      "prompt": {
        "en": "Experiments give rate = k[A]<sup>2</sup>, independent of B. A proposed mechanism begins with slow elementary A(g) + B(g) → I(g). Is it consistent with those data?",
        "es": "Los experimentos dan velocidad = k[A]<sup>2</sup>, independiente de B. Un mecanismo propuesto empieza con A(g) + B(g) → I(g) elemental lento. ¿Es consistente con esos datos?"
      },
      "choices": [
        {
          "text": {
            "en": "No; elementary reactions cannot involve two different species.",
            "es": "No; las reacciones elementales no pueden incluir dos especies distintas."
          },
          "why": {
            "en": "A bimolecular elementary reaction can involve different species; the problem is the conflicting rate law.",
            "es": "Una reacción elemental bimolecular puede incluir especies distintas; el problema es la ley de velocidad contradictoria."
          }
        },
        {
          "text": {
            "en": "No; it predicts rate = k[A][B].",
            "es": "No; predice velocidad = k[A][B]."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Yes; any slow step gives the observed rate law.",
            "es": "Sí; cualquier paso lento da la ley de velocidad observada."
          },
          "why": {
            "en": "The identities and coefficients in the slow elementary step determine its concentration dependence.",
            "es": "Las identidades y los coeficientes del paso elemental lento determinan su dependencia de concentración."
          }
        },
        {
          "text": {
            "en": "Yes; the sum of orders is two in both laws.",
            "es": "Sí; la suma de órdenes es dos en ambas leyes."
          },
          "why": {
            "en": "The same overall order does not make the individual reactant dependences identical.",
            "es": "El mismo orden global no hace idénticas las dependencias de cada reactivo."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The proposed step predicts first order in A and first order in B. The data require second order in A and zero order in B, so this slow-first model is inconsistent.",
        "es": "El paso propuesto predice primer orden en A y primer orden en B. Los datos requieren segundo orden en A y orden cero en B, así que este modelo con primer paso lento es inconsistente."
      }
    },
    {
      "id": "5.8-5",
      "topic": "5.8",
      "type": "numeric",
      "prompt": {
        "en": "A slow first elementary step is A(aq) + B(aq) → I(aq). With k = 0.400 M<sup>−1</sup> s<sup>−1</sup>, [A] = 0.250 M and [B] = 0.200 M, calculate the predicted rate.",
        "es": "Un primer paso elemental lento es A(aq) + B(aq) → I(aq). Con k = 0.400 M<sup>−1</sup> s<sup>−1</sup>, [A] = 0.250 M y [B] = 0.200 M, calcula la velocidad predicha."
      },
      "value": 0.02,
      "display": "0.0200",
      "unit": "M/s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "rate = k[A][B] = (0.400)(0.250)(0.200) = 0.0200 M/s.",
        "es": "velocidad = k[A][B] = (0.400)(0.250)(0.200) = 0.0200 M/s."
      }
    },
    {
      "id": "5.8-6",
      "topic": "5.8",
      "type": "numeric",
      "prompt": {
        "en": "A slow first elementary step is A(g) + B(g) → I(g). Both reactant concentrations are doubled at fixed temperature, with later steps remaining fast. Enter the exact new rate / old rate.",
        "es": "Un primer paso elemental lento es A(g) + B(g) → I(g). Ambas concentraciones reactivas se duplican a temperatura fija y los pasos posteriores siguen siendo rápidos. Escribe la razón exacta velocidad nueva / velocidad anterior."
      },
      "value": 4,
      "display": "4",
      "unit": "ratio",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "The predicted law is rate = k[A][B]. Doubling each concentration multiplies rate by 2 × 2 = 4.",
        "es": "La ley predicha es velocidad = k[A][B]. Duplicar cada concentración multiplica la velocidad por 2 × 2 = 4."
      }
    },
    {
      "id": "5.9-1",
      "topic": "5.9",
      "type": "mc",
      "prompt": {
        "en": "Mechanism model: fast pre-equilibrium A(aq) + B(aq) ⇌ I(aq), with forward k<sub>1</sub> and reverse k<sub>−1</sub>; slow elementary I(aq) + B(aq) → P(aq), with k<sub>2</sub>. Which expression eliminates the intermediate using the pre-equilibrium approximation?",
        "es": "Modelo de mecanismo: preequilibrio rápido A(aq) + B(aq) ⇌ I(aq), con k<sub>1</sub> directa y k<sub>−1</sub> inversa; I(aq) + B(aq) → P(aq) elemental lento, con k<sub>2</sub>. ¿Qué expresión elimina al intermediario mediante la aproximación de preequilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "[I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B]",
            "es": "[I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "[I] = (k<sub>−1</sub>/k<sub>1</sub>)[A][B]",
            "es": "[I] = (k<sub>−1</sub>/k<sub>1</sub>)[A][B]"
          },
          "why": {
            "en": "Equating forward and reverse rates puts the forward constant in the numerator when solving for I.",
            "es": "Al igualar las velocidades directa e inversa, la constante directa queda en el numerador al despejar I."
          }
        },
        {
          "text": {
            "en": "[I] = k<sub>1</sub>[A]",
            "es": "[I] = k<sub>1</sub>[A]"
          },
          "why": {
            "en": "This omits B and reverse dissociation, so it does not express pre-equilibrium.",
            "es": "Esto omite B y la disociación inversa, así que no expresa el preequilibrio."
          }
        },
        {
          "text": {
            "en": "[I] = [P]",
            "es": "[I] = [P]"
          },
          "why": {
            "en": "The equilibrium constraint is on the fast first step; it does not equate the intermediate and final product.",
            "es": "La condición de equilibrio corresponde al primer paso rápido; no iguala al intermediario y al producto final."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Fast pre-equilibrium gives k<sub>1</sub>[A][B] = k<sub>−1</sub>[I]. Solving yields [I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B].",
        "es": "El preequilibrio rápido da k<sub>1</sub>[A][B] = k<sub>−1</sub>[I]. Al despejar, [I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B]."
      }
    },
    {
      "id": "5.9-2",
      "topic": "5.9",
      "type": "mc",
      "prompt": {
        "en": "Mechanism model: fast pre-equilibrium A(aq) + B(aq) ⇌ I(aq), with forward k<sub>1</sub> and reverse k<sub>−1</sub>; slow elementary I(aq) + B(aq) → P(aq), with k<sub>2</sub>. What rate law in terms of A and B is predicted?",
        "es": "Modelo de mecanismo: preequilibrio rápido A(aq) + B(aq) ⇌ I(aq), con k<sub>1</sub> directa y k<sub>−1</sub> inversa; I(aq) + B(aq) → P(aq) elemental lento, con k<sub>2</sub>. ¿Qué ley de velocidad en términos de A y B se predice?"
      },
      "choices": [
        {
          "text": {
            "en": "rate = k<sub>2</sub>[I][B] only; I cannot be eliminated",
            "es": "velocidad = k<sub>2</sub>[I][B] solamente; I no se puede eliminar"
          },
          "why": {
            "en": "The slow-step expression is a starting point; pre-equilibrium lets you substitute for I.",
            "es": "La expresión del paso lento es un punto de partida; el preequilibrio permite sustituir I."
          }
        },
        {
          "text": {
            "en": "rate = k<sub>1</sub>[A][B]",
            "es": "velocidad = k<sub>1</sub>[A][B]"
          },
          "why": {
            "en": "This is the fast forward rate, not the net product-formation prediction controlled by the slow step.",
            "es": "Esta es la velocidad directa rápida, no la predicción de formación neta de producto controlada por el paso lento."
          }
        },
        {
          "text": {
            "en": "rate = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A]<sup>2</sup>[B]",
            "es": "velocidad = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A]<sup>2</sup>[B]"
          },
          "why": {
            "en": "The extra concentration factor comes from B in the slow step, not from A.",
            "es": "El factor adicional de concentración proviene de B en el paso lento, no de A."
          }
        },
        {
          "text": {
            "en": "rate = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A][B]<sup>2</sup>",
            "es": "velocidad = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A][B]<sup>2</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Substitute [I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B] into rate = k<sub>2</sub>[I][B]. This gives rate = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A][B]<sup>2</sup>.",
        "es": "Sustituye [I] = (k<sub>1</sub>/k<sub>−1</sub>)[A][B] en velocidad = k<sub>2</sub>[I][B]. Se obtiene velocidad = k<sub>2</sub>(k<sub>1</sub>/k<sub>−1</sub>)[A][B]<sup>2</sup>."
      }
    },
    {
      "id": "5.9-3",
      "topic": "5.9",
      "type": "mc",
      "prompt": {
        "en": "Mechanism model: fast pre-equilibrium A(aq) + B(aq) ⇌ I(aq), with forward k<sub>1</sub> and reverse k<sub>−1</sub>; slow elementary I(aq) + B(aq) → P(aq), with k<sub>2</sub>. Which condition justifies the pre-equilibrium approximation?",
        "es": "Modelo de mecanismo: preequilibrio rápido A(aq) + B(aq) ⇌ I(aq), con k<sub>1</sub> directa y k<sub>−1</sub> inversa; I(aq) + B(aq) → P(aq) elemental lento, con k<sub>2</sub>. ¿Qué condición justifica la aproximación de preequilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "The first step is the slowest step.",
            "es": "El primer paso es el más lento."
          },
          "why": {
            "en": "This model explicitly requires a fast first equilibrium before slow product formation.",
            "es": "Este modelo requiere explícitamente un primer equilibrio rápido antes de la formación lenta del producto."
          }
        },
        {
          "text": {
            "en": "Every intermediate concentration is zero.",
            "es": "La concentración de cada intermediario es cero."
          },
          "why": {
            "en": "A zero intermediate would stop the proposed slow step; pre-equilibrium gives a nonzero concentration relation.",
            "es": "Un intermediario nulo detendría el paso lento propuesto; el preequilibrio da una relación de concentración no nula."
          }
        },
        {
          "text": {
            "en": "The first step equilibrates much faster than the slow step consumes I.",
            "es": "El primer paso alcanza el equilibrio mucho más rápido de lo que el paso lento consume I."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The reverse first step is negligible.",
            "es": "El primer paso inverso es despreciable."
          },
          "why": {
            "en": "Pre-equilibrium needs rapid reversible exchange; ignoring the reverse step removes that balance.",
            "es": "El preequilibrio necesita intercambio reversible rápido; ignorar el paso inverso elimina ese balance."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Rapid reversible equilibration keeps the first step near equilibrium while product forms slowly. This is a condition on the mechanism and conditions, not an automatic rule for every intermediate.",
        "es": "El equilibrio reversible rápido mantiene el primer paso cerca del equilibrio mientras el producto se forma lentamente. Es una condición del mecanismo y de las condiciones, no una regla automática para todo intermediario."
      }
    },
    {
      "id": "5.9-4",
      "topic": "5.9",
      "type": "mc",
      "prompt": {
        "en": "Mechanism model: fast pre-equilibrium A(aq) + B(aq) ⇌ I(aq), with forward k<sub>1</sub> and reverse k<sub>−1</sub>; slow elementary I(aq) + B(aq) → P(aq), with k<sub>2</sub>. At fixed temperature and free [A], free [B] doubles while the approximation remains valid. What happens to the predicted rate?",
        "es": "Modelo de mecanismo: preequilibrio rápido A(aq) + B(aq) ⇌ I(aq), con k<sub>1</sub> directa y k<sub>−1</sub> inversa; I(aq) + B(aq) → P(aq) elemental lento, con k<sub>2</sub>. A temperatura y [A] libre fijas, [B] libre se duplica mientras la aproximación sigue siendo válida. ¿Qué ocurre con la velocidad predicha?"
      },
      "choices": [
        {
          "text": {
            "en": "It increases eightfold.",
            "es": "Aumenta ocho veces."
          },
          "why": {
            "en": "Only B is doubled; its exponent is two, not the overall order three.",
            "es": "Solo B se duplica; su exponente es dos, no el orden global tres."
          }
        },
        {
          "text": {
            "en": "It quadruples.",
            "es": "Se cuadruplica."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It doubles.",
            "es": "Se duplica."
          },
          "why": {
            "en": "B appears once through the pre-equilibrium intermediate and once again in the slow step.",
            "es": "B aparece una vez por el intermediario del preequilibrio y otra vez en el paso lento."
          }
        },
        {
          "text": {
            "en": "It stays constant.",
            "es": "Permanece constante."
          },
          "why": {
            "en": "B has a nonzero exponent in the derived law.",
            "es": "B tiene un exponente no nulo en la ley derivada."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The derived law contains [B]<sup>2</sup>. Doubling B multiplies rate by 2<sup>2</sup> = 4 while A and temperature stay fixed.",
        "es": "La ley derivada contiene [B]<sup>2</sup>. Duplicar B multiplica la velocidad por 2<sup>2</sup> = 4 mientras A y la temperatura permanecen fijas."
      }
    },
    {
      "id": "5.9-5",
      "topic": "5.9",
      "type": "numeric",
      "prompt": {
        "en": "For fast A(aq) + B(aq) ⇌ I(aq), use the concentration-form relation [I] = K<sub>c</sub>[A][B]. Given K<sub>c</sub> = 4.00 M<sup>−1</sup>, free [A] = 0.100 M and free [B] = 0.200 M at pre-equilibrium, calculate [I].",
        "es": "Para A(aq) + B(aq) ⇌ I(aq) rápido, usa la relación en concentraciones [I] = K<sub>c</sub>[A][B]. Con K<sub>c</sub> = 4.00 M<sup>−1</sup>, [A] libre = 0.100 M y [B] libre = 0.200 M en el preequilibrio, calcula [I]."
      },
      "value": 0.08,
      "display": "0.0800",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "[I] = (4.00)(0.100)(0.200) = 0.0800 M. The given A and B are free equilibrium concentrations, not initial analytical totals.",
        "es": "[I] = (4.00)(0.100)(0.200) = 0.0800 M. A y B dadas son concentraciones libres de equilibrio, no totales analíticos iniciales."
      }
    },
    {
      "id": "5.9-6",
      "topic": "5.9",
      "type": "numeric",
      "prompt": {
        "en": "A fast pre-equilibrium maintains [I] = 0.0800 M. For slow elementary I(aq) + B(aq) → P(aq), k<sub>2</sub> = 0.500 M<sup>−1</sup> s<sup>−1</sup> and free [B] = 0.200 M. Calculate the product-formation rate.",
        "es": "Un preequilibrio rápido mantiene [I] = 0.0800 M. Para I(aq) + B(aq) → P(aq) elemental lento, k<sub>2</sub> = 0.500 M<sup>−1</sup> s<sup>−1</sup> y [B] libre = 0.200 M. Calcula la velocidad de formación del producto."
      },
      "value": 0.008,
      "display": "0.00800",
      "unit": "M/s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-06,
      "explanation": {
        "en": "rate = k<sub>2</sub>[I][B] = (0.500)(0.0800)(0.200) = 0.00800 M/s.",
        "es": "velocidad = k<sub>2</sub>[I][B] = (0.500)(0.0800)(0.200) = 0.00800 M/s."
      }
    },
    {
      "id": "5.10-1",
      "topic": "5.10",
      "type": "mc",
      "prompt": {
        "en": "Two-step energy-profile model (kJ/mol): reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10. How many elementary steps does this pathway represent?",
        "es": "Modelo de perfil de energía de dos pasos (kJ/mol): reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10. ¿Cuántos pasos elementales representa esta ruta?"
      },
      "choices": [
        {
          "text": {
            "en": "Two",
            "es": "Dos"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "One",
            "es": "Uno"
          },
          "why": {
            "en": "There are two peaks, each corresponding to an elementary transition-state crossing.",
            "es": "Hay dos picos, cada uno correspondiente al cruce de un estado de transición elemental."
          }
        },
        {
          "text": {
            "en": "Three",
            "es": "Tres"
          },
          "why": {
            "en": "The intermediate valley separates steps but is not a third step.",
            "es": "El valle del intermediario separa los pasos, pero no es un tercer paso."
          }
        },
        {
          "text": {
            "en": "Five",
            "es": "Cinco"
          },
          "why": {
            "en": "Counting all labeled energy levels does not count elementary steps.",
            "es": "Contar todos los niveles de energía etiquetados no cuenta los pasos elementales."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Each peak represents one transition state for an elementary step. Two peaks indicate two steps in this model.",
        "es": "Cada pico representa un estado de transición de un paso elemental. Dos picos indican dos pasos en este modelo."
      },
      "multi": true
    },
    {
      "id": "5.10-2",
      "topic": "5.10",
      "type": "mc",
      "prompt": {
        "en": "Two-step energy-profile model (kJ/mol): reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10. What does the valley between the peaks represent?",
        "es": "Modelo de perfil de energía de dos pasos (kJ/mol): reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10. ¿Qué representa el valle entre los picos?"
      },
      "choices": [
        {
          "text": {
            "en": "The first transition state",
            "es": "El primer estado de transición"
          },
          "why": {
            "en": "A transition state is a peak, not the valley after it.",
            "es": "Un estado de transición es un pico, no el valle posterior."
          }
        },
        {
          "text": {
            "en": "The final products",
            "es": "Los productos finales"
          },
          "why": {
            "en": "The products lie at the right endpoint, after the second peak.",
            "es": "Los productos están en el extremo derecho, después del segundo pico."
          }
        },
        {
          "text": {
            "en": "The catalyst in every possible mechanism",
            "es": "El catalizador en cualquier mecanismo posible"
          },
          "why": {
            "en": "A valley indicates an intermediate; it does not by itself identify a catalyst.",
            "es": "Un valle indica un intermediario; no identifica por sí solo a un catalizador."
          }
        },
        {
          "text": {
            "en": "An intermediate with a finite lifetime",
            "es": "Un intermediario con vida finita"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The local minimum between peaks is an intermediate: it forms in one step and reacts in the next.",
        "es": "El mínimo local entre picos es un intermediario: se forma en un paso y reacciona en el siguiente."
      },
      "multi": true
    },
    {
      "id": "5.10-3",
      "topic": "5.10",
      "type": "mc",
      "prompt": {
        "en": "Two-step energy-profile model (kJ/mol): reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10. Assuming comparable prefactors and that the larger local forward barrier identifies the slower step, which step is rate determining?",
        "es": "Modelo de perfil de energía de dos pasos (kJ/mol): reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10. Suponiendo factores preexponenciales comparables y que la mayor barrera directa local identifica al paso más lento, ¿qué paso es el determinante de la velocidad?"
      },
      "choices": [
        {
          "text": {
            "en": "Step 2, whose local forward barrier is 100 kJ/mol",
            "es": "El paso 2, cuya barrera directa local es 100 kJ/mol"
          },
          "why": {
            "en": "The step is identified correctly, but its barrier starts at the intermediate level 40, not zero.",
            "es": "El paso se identifica correctamente, pero su barrera empieza en el nivel del intermediario 40, no en cero."
          }
        },
        {
          "text": {
            "en": "Both steps, because there are two peaks",
            "es": "Ambos pasos, porque hay dos picos"
          },
          "why": {
            "en": "Two peaks show two steps, not equal local activation barriers.",
            "es": "Dos picos muestran dos pasos, no barreras de activación locales iguales."
          }
        },
        {
          "text": {
            "en": "Step 2, whose local forward barrier is 60 kJ/mol",
            "es": "El paso 2, cuya barrera directa local es 60 kJ/mol"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Step 1, whose local forward barrier is 70 kJ/mol",
            "es": "El paso 1, cuya barrera directa local es 70 kJ/mol"
          },
          "why": {
            "en": "The first barrier is measured from reactants at 20, so it is 50 rather than 70.",
            "es": "La primera barrera se mide desde los reactivos a 20, así que es 50 en lugar de 70."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Local E<sub>a</sub> values are 70 − 20 = 50 and 100 − 40 = 60 kJ/mol. Under the stated assumptions, step 2 is the rate-determining step. Peak height alone is not the barrier.",
        "es": "Los valores locales de E<sub>a</sub> son 70 − 20 = 50 y 100 − 40 = 60 kJ/mol. Bajo los supuestos indicados, el paso 2 es el paso determinante de la velocidad. La altura del pico por sí sola no es la barrera."
      },
      "multi": true
    },
    {
      "id": "5.10-4",
      "topic": "5.10",
      "type": "mc",
      "prompt": {
        "en": "Two-step energy-profile model (kJ/mol): reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10. Which count of transition states and intermediate species is correct?",
        "es": "Modelo de perfil de energía de dos pasos (kJ/mol): reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10. ¿Qué conteo de estados de transición y especies intermediarias es correcto?"
      },
      "choices": [
        {
          "text": {
            "en": "Three transition states and two intermediates",
            "es": "Tres estados de transición y dos intermediarios"
          },
          "why": {
            "en": "Reactant and product endpoints are not additional transition states or internal intermediates.",
            "es": "Los extremos de reactivos y productos no son estados de transición adicionales ni intermediarios internos."
          }
        },
        {
          "text": {
            "en": "Two transition states and one intermediate",
            "es": "Dos estados de transición y un intermediario"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "One transition state and two intermediates",
            "es": "Un estado de transición y dos intermediarios"
          },
          "why": {
            "en": "Peaks are transition states and the internal valley is an intermediate, not the reverse.",
            "es": "Los picos son estados de transición y el valle interno es un intermediario, no al revés."
          }
        },
        {
          "text": {
            "en": "Two transition states and no intermediate",
            "es": "Dos estados de transición y ningún intermediario"
          },
          "why": {
            "en": "The valley between the peaks represents an intermediate species.",
            "es": "El valle entre los picos representa una especie intermediaria."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The two maxima are transition states. Only the single internal minimum is an intermediate; endpoints are reactants and products.",
        "es": "Los dos máximos son estados de transición. Solo el mínimo interno es un intermediario; los extremos son reactivos y productos."
      },
      "multi": true
    },
    {
      "id": "5.10-5",
      "topic": "5.10",
      "type": "numeric",
      "prompt": {
        "en": "Two-step energy-profile model (kJ/mol): reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10. Calculate the second-step forward activation energy. Report three significant figures.",
        "es": "Modelo de perfil de energía de dos pasos (kJ/mol): reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10. Calcula la energía de activación directa del segundo paso. Expresa tres cifras significativas."
      },
      "value": 60,
      "display": "60.0",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "The second step starts at the intermediate: E<sub>a,2</sub> = 100 − 40 = 60.0 kJ/mol to the requested precision.",
        "es": "El segundo paso empieza en el intermediario: E<sub>a,2</sub> = 100 − 40 = 60.0 kJ/mol con la precisión solicitada."
      },
      "multi": true
    },
    {
      "id": "5.10-6",
      "topic": "5.10",
      "type": "numeric",
      "prompt": {
        "en": "Two-step energy-profile model (kJ/mol): reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10. Calculate the overall ΔH. Report one decimal place and include the sign.",
        "es": "Modelo de perfil de energía de dos pasos (kJ/mol): reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10. Calcula el ΔH global. Expresa un decimal e incluye el signo."
      },
      "value": -10,
      "display": "-10.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "Overall ΔH = final products − initial reactants = 10 − 20 = −10.0 kJ/mol. Intermediate and peak energies do not enter this difference.",
        "es": "ΔH global = productos finales − reactivos iniciales = 10 − 20 = −10.0 kJ/mol. Las energías del intermediario y de los picos no entran en esta diferencia."
      },
      "multi": true
    },
    {
      "id": "5.11-1",
      "topic": "5.11",
      "type": "mc",
      "prompt": {
        "en": "How does a catalyst increase reaction rate at a fixed temperature?",
        "es": "¿Cómo aumenta un catalizador la velocidad de reacción a temperatura fija?"
      },
      "choices": [
        {
          "text": {
            "en": "It provides an alternative pathway with a lower activation barrier.",
            "es": "Proporciona una ruta alternativa con menor barrera de activación."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It raises the average kinetic energy without changing temperature.",
            "es": "Eleva la energía cinética promedio sin cambiar la temperatura."
          },
          "why": {
            "en": "Average kinetic energy is set by temperature; a catalyst changes the pathway.",
            "es": "La energía cinética promedio depende de la temperatura; un catalizador cambia la ruta."
          }
        },
        {
          "text": {
            "en": "It makes ΔH more negative.",
            "es": "Hace que ΔH sea más negativo."
          },
          "why": {
            "en": "The catalyst does not change the reactant and product enthalpy difference.",
            "es": "El catalizador no cambia la diferencia de entalpía entre reactivos y productos."
          }
        },
        {
          "text": {
            "en": "It is consumed permanently as an extra reactant.",
            "es": "Se consume permanentemente como reactivo adicional."
          },
          "why": {
            "en": "A catalyst participates but is regenerated in the catalytic cycle.",
            "es": "Un catalizador participa, pero se regenera en el ciclo catalítico."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A catalyst changes the reaction mechanism to a pathway with a lower effective barrier. It is regenerated and does not change ΔH.",
        "es": "Un catalizador cambia el mecanismo de reacción a una ruta con menor barrera efectiva. Se regenera y no cambia ΔH."
      }
    },
    {
      "id": "5.11-2",
      "topic": "5.11",
      "type": "mc",
      "prompt": {
        "en": "Catalysis model (kJ/mol): both paths start at reactants 20 and end at products 0; the uncatalyzed peak is 90 and the catalyzed peak is 55. Which comparison is correct?",
        "es": "Modelo de catálisis (kJ/mol): ambas rutas empiezan con reactivos a 20 y terminan con productos a 0; el pico sin catalizador es 90 y el pico con catalizador es 55. ¿Qué comparación es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "The catalyzed path has a lower barrier and a different ΔH.",
            "es": "La ruta con catalizador tiene menor barrera y un ΔH distinto."
          },
          "why": {
            "en": "Both paths have identical endpoints, so their enthalpy changes are equal.",
            "es": "Ambas rutas tienen extremos idénticos, así que sus cambios de entalpía son iguales."
          }
        },
        {
          "text": {
            "en": "The catalyzed path has no transition state.",
            "es": "La ruta con catalizador no tiene estado de transición."
          },
          "why": {
            "en": "The catalyzed model still has a peak and therefore a transition state.",
            "es": "El modelo con catalizador aún tiene un pico y por lo tanto un estado de transición."
          }
        },
        {
          "text": {
            "en": "The catalyzed path must have a higher product energy.",
            "es": "La ruta con catalizador debe tener mayor energía de productos."
          },
          "why": {
            "en": "The model explicitly keeps product energy unchanged.",
            "es": "El modelo mantiene explícitamente sin cambio la energía de productos."
          }
        },
        {
          "text": {
            "en": "The catalyzed path has a lower barrier and the same ΔH.",
            "es": "La ruta con catalizador tiene menor barrera y el mismo ΔH."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Forward barriers are 90 − 20 = 70 and 55 − 20 = 35 kJ/mol. Both paths have ΔH = 0 − 20 = −20 kJ/mol.",
        "es": "Las barreras directas son 90 − 20 = 70 y 55 − 20 = 35 kJ/mol. Ambas rutas tienen ΔH = 0 − 20 = −20 kJ/mol."
      },
      "catalysis": true
    },
    {
      "id": "5.11-3",
      "topic": "5.11",
      "type": "mc",
      "prompt": {
        "en": "A catalyst is added to a reversible reaction at fixed temperature. What happens to equilibrium?",
        "es": "Se añade un catalizador a una reacción reversible a temperatura fija. ¿Qué ocurre con el equilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "Only the forward reaction is accelerated.",
            "es": "Solo se acelera la reacción directa."
          },
          "why": {
            "en": "The alternate reversible pathway also accelerates the reverse reaction.",
            "es": "La ruta reversible alternativa también acelera la reacción inversa."
          }
        },
        {
          "text": {
            "en": "The final equilibrium mixture must contain only products.",
            "es": "La mezcla final de equilibrio debe contener solo productos."
          },
          "why": {
            "en": "A catalyst does not force complete conversion or change the equilibrium composition under the stated conditions.",
            "es": "Un catalizador no obliga a la conversión completa ni cambia la composición de equilibrio bajo las condiciones indicadas."
          }
        },
        {
          "text": {
            "en": "Equilibrium is reached sooner, but the equilibrium constant is unchanged.",
            "es": "Se alcanza el equilibrio antes, pero la constante de equilibrio no cambia."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The equilibrium constant increases.",
            "es": "La constante de equilibrio aumenta."
          },
          "why": {
            "en": "A catalyst changes kinetics, not the equilibrium constant at a given temperature.",
            "es": "Un catalizador cambia la cinética, no la constante de equilibrio a una temperatura dada."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Catalysis accelerates approach to equilibrium in both directions. At fixed temperature, it does not change the equilibrium constant or equilibrium composition.",
        "es": "La catálisis acelera el acercamiento al equilibrio en ambos sentidos. A temperatura fija, no cambia la constante de equilibrio ni la composición de equilibrio."
      }
    },
    {
      "id": "5.11-4",
      "topic": "5.11",
      "type": "mc",
      "prompt": {
        "en": "Gaseous reactants react on a solid metal catalyst. Increasing the exposed metal surface increases the rate under the stated conditions. Which explanation is best?",
        "es": "Los reactivos gaseosos reaccionan sobre un catalizador metálico sólido. Aumentar la superficie metálica expuesta aumenta la velocidad bajo las condiciones indicadas. ¿Qué explicación es mejor?"
      },
      "choices": [
        {
          "text": {
            "en": "More surface area makes the reaction enthalpy zero.",
            "es": "Una mayor área superficial hace nula la entalpía de reacción."
          },
          "why": {
            "en": "Surface availability changes kinetics without requiring any change in ΔH.",
            "es": "La disponibilidad de superficie cambia la cinética sin requerir ningún cambio en ΔH."
          }
        },
        {
          "text": {
            "en": "More surface sites are available for heterogeneous catalysis.",
            "es": "Hay más sitios de superficie disponibles para la catálisis heterogénea."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The catalyst changes the balanced overall coefficients.",
            "es": "El catalizador cambia los coeficientes globales balanceados."
          },
          "why": {
            "en": "Surface area does not change the atom ratios of the overall reaction.",
            "es": "El área superficial no cambia las razones de átomos de la reacción global."
          }
        },
        {
          "text": {
            "en": "The solid must dissolve to be a catalyst.",
            "es": "El sólido debe disolverse para ser catalizador."
          },
          "why": {
            "en": "A heterogeneous catalyst can act at a surface while remaining a separate phase.",
            "es": "Un catalizador heterogéneo puede actuar en una superficie mientras permanece en una fase separada."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "A solid catalyst and gaseous reactants occupy different phases. Exposing more active sites can increase the rate of heterogeneous catalysis.",
        "es": "Un catalizador sólido y los reactivos gaseosos ocupan fases distintas. Exponer más sitios activos puede aumentar la velocidad de la catálisis heterogénea."
      }
    },
    {
      "id": "5.11-5",
      "topic": "5.11",
      "type": "numeric",
      "prompt": {
        "en": "Catalysis model (kJ/mol): both paths start at reactants 20 and end at products 0; the uncatalyzed peak is 90 and the catalyzed peak is 55. By how much does the forward activation energy decrease? Enter a positive difference with three significant figures.",
        "es": "Modelo de catálisis (kJ/mol): ambas rutas empiezan con reactivos a 20 y terminan con productos a 0; el pico sin catalizador es 90 y el pico con catalizador es 55. ¿Cuánto disminuye la energía de activación directa? Escribe una diferencia positiva con tres cifras significativas."
      },
      "value": 35,
      "display": "35.0",
      "unit": "kJ/mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "The forward barriers are 90 − 20 = 70 and 55 − 20 = 35 kJ/mol. Their decrease is 70 − 35 = 35.0 kJ/mol.",
        "es": "Las barreras directas son 90 − 20 = 70 y 55 − 20 = 35 kJ/mol. Su disminución es 70 − 35 = 35.0 kJ/mol."
      },
      "catalysis": true
    },
    {
      "id": "5.11-6",
      "topic": "5.11",
      "type": "numeric",
      "prompt": {
        "en": "Catalysis model (kJ/mol): both paths start at reactants 20 and end at products 0; the uncatalyzed peak is 90 and the catalyzed peak is 55. Calculate ΔH for the catalyzed path. Include its sign and report one decimal place.",
        "es": "Modelo de catálisis (kJ/mol): ambas rutas empiezan con reactivos a 20 y terminan con productos a 0; el pico sin catalizador es 90 y el pico con catalizador es 55. Calcula ΔH para la ruta con catalizador. Incluye su signo y expresa un decimal."
      },
      "value": -20,
      "display": "-20.0",
      "unit": "kJ/mol",
      "precision": {
        "decimals": 1
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "ΔH = products − reactants = 0 − 20 = −20.0 kJ/mol. The uncatalyzed path has the same endpoints and the same ΔH.",
        "es": "ΔH = productos − reactivos = 0 − 20 = −20.0 kJ/mol. La ruta sin catalizador tiene los mismos extremos y el mismo ΔH."
      },
      "catalysis": true
    }
  ],
  "units": [
    {
      "id": "M/s",
      "label": {
        "en": "M/s",
        "es": "M/s"
      }
    },
    {
      "id": "M",
      "label": {
        "en": "M (mol/L)",
        "es": "M (mol/L)"
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
      "id": "s^-1",
      "label": {
        "en": "1/s",
        "es": "1/s"
      }
    },
    {
      "id": "M^-1 s^-1",
      "label": {
        "en": "1/(M s)",
        "es": "1/(M s)"
      }
    },
    {
      "id": "M^-2 s^-1",
      "label": {
        "en": "1/(M M s)",
        "es": "1/(M M s)"
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
      "id": "count",
      "label": {
        "en": "count",
        "es": "conteo"
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
    "title": "AP Chemistry Unit 5 Practice",
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
      "AP Chemistry Unit 5 Practice": "Práctica de la unidad 5 de Química AP",
      "AP Chemistry · Unit 5": "Química AP · Unidad 5",
      "Choose a topic, then start. Mixed review includes all eleven topics.": "Elige un tema y comienza. El repaso mixto incluye los once temas.",
      "Choose one topic for six questions, or Mixed review for all 66. Read the feedback after each answer.": "Elige un tema para seis preguntas o Repaso mixto para las 66. Lee los comentarios después de cada respuesta.",
      "No timer. Use scratch paper and a calculator. The rate-law reference is below.": "Sin límite de tiempo. Usa papel y calculadora. La referencia de leyes de velocidad está abajo.",
      "Aligned practice for AP Chemistry CED topics 5.1 to 5.11. Original ZornScience questions.": "Práctica alineada con los temas 5.1 a 5.11 del CED de Química AP. Preguntas originales de ZornScience.",
      "Integrated rate laws": "Leyes de velocidad integradas",
      "At constant temperature and volume, for disappearance of a single reactant A:": "A temperatura y volumen constantes, para la desaparición de un solo reactivo A:",
      "Zero order": "Orden cero",
      "First order": "Primer orden",
      "Second order": "Segundo orden",
      "Linear plot: [A] versus time; slope −k.": "Gráfica lineal: [A] contra tiempo; pendiente −k.",
      "Linear plot: ln[A] versus time; slope −k.": "Gráfica lineal: ln[A] contra tiempo; pendiente −k.",
      "Linear plot: 1/[A] versus time; slope +k.": "Gráfica lineal: 1/[A] contra tiempo; pendiente +k.",
      "First-order half-life": "Vida media de primer orden",
      "Rate law and units of k": "Ley de velocidad y unidades de k",
      "rate": "velocidad",
      "Overall order": "Orden global",
      "For concentration in M and time in s:": "Para concentración en M y tiempo en s:",
      "The rate constant depends on temperature. Orders come from experiments for an overall reaction; coefficients give orders only for an elementary reaction.": "La constante de velocidad depende de la temperatura. Los órdenes de una reacción global se obtienen de experimentos; los coeficientes dan los órdenes solo para una reacción elemental.",
      "Keep extra digits in your work and round only the final answer. Energy-profile levels are schematic model values.": "Conserva dígitos adicionales en tu trabajo y redondea solo la respuesta final. Los niveles de los perfiles de energía son valores de modelos esquemáticos.",
      "Model: concentration versus time": "Modelo: concentración contra tiempo",
      "A straight concentration line from 0.800 M at 0 s to 0.400 M at 40.0 s.": "Una recta de concentración desde 0.800 M a 0 s hasta 0.400 M a 40.0 s.",
      "Time (s)": "Tiempo (s)",
      "[A] (M)": "[A] (M)",
      "Model: concentration versus time over the stated interval.": "Modelo: concentración contra tiempo en el intervalo indicado.",
      "Model: single-step energy profile": "Modelo: perfil de energía de un paso",
      "Reactants at 20 kJ/mol rise to one peak at 80 kJ/mol and fall to products at 0 kJ/mol.": "Los reactivos a 20 kJ/mol suben a un pico a 80 kJ/mol y bajan a productos a 0 kJ/mol.",
      "Reaction coordinate": "Coordenada de reacción",
      "Energy (kJ/mol)": "Energía (kJ/mol)",
      "Model, not to scale. Use the numerical values in the question.": "Modelo, sin escala. Usa los valores numéricos del enunciado.",
      "Model: multistep energy profile": "Modelo: perfil de energía de varios pasos",
      "Reactants 20, first peak 70, intermediate valley 40, second peak 100, products 10, all in kJ/mol.": "Reactivos 20, primer pico 70, valle del intermediario 40, segundo pico 100, productos 10, todo en kJ/mol.",
      "Model: catalyzed and uncatalyzed pathways": "Modelo: rutas con y sin catalizador",
      "Both paths start at 20 and end at 0 kJ/mol. The solid uncatalyzed path peaks at 90; the dashed catalyzed path peaks at 55 kJ/mol.": "Ambas rutas empiezan a 20 y terminan a 0 kJ/mol. La ruta continua sin catalizador tiene pico a 90; la ruta discontinua con catalizador tiene pico a 55 kJ/mol.",
      "Solid: uncatalyzed": "Continua: sin catalizador",
      "Dashed: catalyzed": "Discontinua: con catalizador"
    }
  }
};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit5-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
