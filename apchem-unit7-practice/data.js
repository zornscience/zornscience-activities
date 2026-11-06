(function () {
  "use strict";
  // Original bilingual questions. Worked solutions are recorded in TESTING.md.
  var bank = {
  "topics": [
    {
      "id": "7.1",
      "title": {
        "en": "7.1 Introduction to Equilibrium",
        "es": "7.1 Introducción al equilibrio"
      }
    },
    {
      "id": "7.2",
      "title": {
        "en": "7.2 Direction of Reversible Reactions",
        "es": "7.2 Dirección de las reacciones reversibles"
      }
    },
    {
      "id": "7.3",
      "title": {
        "en": "7.3 Reaction Quotient and Equilibrium Constant",
        "es": "7.3 Cociente de reacción y constante de equilibrio"
      }
    },
    {
      "id": "7.4",
      "title": {
        "en": "7.4 Calculating the Equilibrium Constant",
        "es": "7.4 Cálculo de la constante de equilibrio"
      }
    },
    {
      "id": "7.5",
      "title": {
        "en": "7.5 Magnitude of the Equilibrium Constant",
        "es": "7.5 Magnitud de la constante de equilibrio"
      }
    },
    {
      "id": "7.6",
      "title": {
        "en": "7.6 Properties of the Equilibrium Constant",
        "es": "7.6 Propiedades de la constante de equilibrio"
      }
    },
    {
      "id": "7.7",
      "title": {
        "en": "7.7 Calculating Equilibrium Concentrations",
        "es": "7.7 Cálculo de concentraciones en el equilibrio"
      }
    },
    {
      "id": "7.8",
      "title": {
        "en": "7.8 Representations of Equilibrium",
        "es": "7.8 Representaciones del equilibrio"
      }
    },
    {
      "id": "7.9",
      "title": {
        "en": "7.9 Introduction to Le Châtelier's Principle",
        "es": "7.9 Introducción al principio de Le Châtelier"
      }
    },
    {
      "id": "7.10",
      "title": {
        "en": "7.10 Reaction Quotient and Le Châtelier's Principle",
        "es": "7.10 Cociente de reacción y principio de Le Châtelier"
      }
    },
    {
      "id": "7.11",
      "title": {
        "en": "7.11 Introduction to Solubility Equilibria",
        "es": "7.11 Introducción a los equilibrios de solubilidad"
      }
    },
    {
      "id": "7.12",
      "title": {
        "en": "7.12 Common-Ion Effect",
        "es": "7.12 Efecto del ion común"
      }
    }
  ],
  "questions": [
    {
      "id": "7.1-1",
      "topic": "7.1",
      "type": "mc",
      "prompt": {
        "en": "Which statement describes dynamic equilibrium in a closed reacting system?",
        "es": "¿Qué enunciado describe el equilibrio dinámico en un sistema de reacción cerrado?"
      },
      "choices": [
        {
          "text": {
            "en": "Only the forward reaction continues.",
            "es": "Solo continúa la reacción directa."
          },
          "why": {
            "en": "A nonzero reverse rate is necessary to balance the forward rate.",
            "es": "Se necesita una velocidad inversa distinta de cero para equilibrar la velocidad directa."
          }
        },
        {
          "text": {
            "en": "The forward and reverse reactions continue at equal nonzero rates.",
            "es": "La reacción directa y la inversa continúan con velocidades iguales distintas de cero."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both reactions stop.",
            "es": "Ambas reacciones se detienen."
          },
          "why": {
            "en": "Equilibrium is dynamic: molecular reactions continue even though the composition is constant.",
            "es": "El equilibrio es dinámico: las reacciones moleculares continúan aunque la composición sea constante."
          }
        },
        {
          "text": {
            "en": "Reactant and product concentrations must be equal.",
            "es": "Las concentraciones de reactivos y productos deben ser iguales."
          },
          "why": {
            "en": "Equal rates do not require equal concentrations. The equilibrium constant determines the concentration relationship.",
            "es": "Las velocidades iguales no requieren concentraciones iguales. La constante de equilibrio determina la relación entre concentraciones."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "At dynamic equilibrium, the forward and reverse rates are equal. Reactants and products continue to interconvert without a net composition change.",
        "es": "En el equilibrio dinámico, las velocidades directa e inversa son iguales. Los reactivos y productos siguen transformándose entre sí sin un cambio neto de composición."
      }
    },
    {
      "id": "7.1-2",
      "topic": "7.1",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g), the concentration-versus-time model levels off at [A] = 0.600 M and [B] = 0.400 M. What supports equilibrium?",
        "es": "Para A(g) ⇌ B(g), el modelo de concentración contra tiempo se estabiliza en [A] = 0.600 M y [B] = 0.400 M. ¿Qué apoya el equilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "The curves must meet first.",
            "es": "Las curvas deben cruzarse primero."
          },
          "why": {
            "en": "A crossing means equal concentrations at one instant, not necessarily equal reaction rates.",
            "es": "Un cruce significa concentraciones iguales en un instante, no necesariamente velocidades de reacción iguales."
          }
        },
        {
          "text": {
            "en": "The larger concentration must fall to zero.",
            "es": "La concentración mayor debe bajar a cero."
          },
          "why": {
            "en": "Equilibrium can retain both species at nonzero concentrations.",
            "es": "El equilibrio puede conservar ambas especies con concentraciones distintas de cero."
          }
        },
        {
          "text": {
            "en": "The flat curves prove molecules stopped moving.",
            "es": "Las curvas planas prueban que las moléculas dejaron de moverse."
          },
          "why": {
            "en": "Flat curves indicate no net concentration change; they do not show molecular motion stopping.",
            "es": "Las curvas planas indican que no hay cambio neto de concentración; no muestran que se detenga el movimiento molecular."
          }
        },
        {
          "text": {
            "en": "Both concentrations become constant, even though they are unequal.",
            "es": "Ambas concentraciones se vuelven constantes, aunque son distintas."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The plateaus indicate constant macroscopic composition. Dynamic equilibrium does not require [A] = [B].",
        "es": "Las mesetas indican composición macroscópica constante. El equilibrio dinámico no requiere [A] = [B]."
      },
      "curve": true
    },
    {
      "id": "7.1-3",
      "topic": "7.1",
      "type": "mc",
      "prompt": {
        "en": "A rate-versus-time model for A(g) ⇌ B(g) shows the forward rate falling from 0.080 to 0.020 M/s and the reverse rate rising from 0 to 0.020 M/s. Both then stay at 0.020 M/s. When does equilibrium begin?",
        "es": "Un modelo de velocidad contra tiempo para A(g) ⇌ B(g) muestra que la velocidad directa baja de 0.080 a 0.020 M/s y la inversa sube de 0 a 0.020 M/s. Ambas permanecen en 0.020 M/s. ¿Cuándo empieza el equilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "Whenever the reverse rate is increasing",
            "es": "Siempre que la velocidad inversa aumenta"
          },
          "why": {
            "en": "An increasing reverse rate can still be smaller than the forward rate.",
            "es": "Una velocidad inversa creciente aún puede ser menor que la velocidad directa."
          }
        },
        {
          "text": {
            "en": "When the rates become equal and remain equal",
            "es": "Cuando las velocidades se igualan y permanecen iguales"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "When the forward rate is largest",
            "es": "Cuando la velocidad directa es máxima"
          },
          "why": {
            "en": "The largest forward rate occurs before the reverse rate catches up.",
            "es": "La velocidad directa máxima ocurre antes de que la velocidad inversa la alcance."
          }
        },
        {
          "text": {
            "en": "Only when both rates reach zero",
            "es": "Solo cuando ambas velocidades llegan a cero"
          },
          "why": {
            "en": "Dynamic equilibrium has continuing forward and reverse reactions, not zero rates.",
            "es": "El equilibrio dinámico tiene reacciones directa e inversa continuas, no velocidades de cero."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The two rate curves reach the same nonzero plateau. Their equal rates produce zero net change.",
        "es": "Las dos curvas de velocidad llegan a la misma meseta distinta de cero. Sus velocidades iguales producen un cambio neto de cero."
      },
      "rates": true
    },
    {
      "id": "7.1-4",
      "topic": "7.1",
      "type": "mc",
      "prompt": {
        "en": "A sealed vessel contains A(g) ⇌ B(g) at equilibrium. Which molecular description is consistent with the constant composition?",
        "es": "Un recipiente sellado contiene A(g) ⇌ B(g) en equilibrio. ¿Qué descripción molecular es compatible con la composición constante?"
      },
      "choices": [
        {
          "text": {
            "en": "Every molecule is permanently fixed as A or B.",
            "es": "Cada molécula queda fija permanentemente como A o B."
          },
          "why": {
            "en": "Constant bulk composition does not fix the identity of individual reacting molecules.",
            "es": "La composición global constante no fija la identidad de las moléculas individuales que reaccionan."
          }
        },
        {
          "text": {
            "en": "B escapes continuously while A replaces it.",
            "es": "B escapa continuamente mientras A lo reemplaza."
          },
          "why": {
            "en": "A sealed vessel does not continuously lose B; that would describe an open system.",
            "es": "Un recipiente sellado no pierde B continuamente; eso describiría un sistema abierto."
          }
        },
        {
          "text": {
            "en": "All A must eventually disappear.",
            "es": "Todo A debe desaparecer con el tiempo."
          },
          "why": {
            "en": "A reversible reaction can retain reactants at equilibrium.",
            "es": "Una reacción reversible puede conservar reactivos en el equilibrio."
          }
        },
        {
          "text": {
            "en": "A changes to B while B changes to A at the same average rate.",
            "es": "A se transforma en B mientras B se transforma en A con la misma velocidad promedio."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "In a closed system at equilibrium, equal forward and reverse rates balance molecular exchange. There is no net loss of either species.",
        "es": "En un sistema cerrado en equilibrio, las velocidades directa e inversa iguales equilibran el intercambio molecular. No hay pérdida neta de ninguna especie."
      }
    },
    {
      "id": "7.1-5",
      "topic": "7.1",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g) at dynamic equilibrium, the forward rate is 0.0240 M/s. What is the reverse rate? Use three significant figures.",
        "es": "Para A(g) ⇌ B(g) en equilibrio dinámico, la velocidad directa es 0.0240 M/s. ¿Cuál es la velocidad inversa? Usa tres cifras significativas."
      },
      "value": 0.024,
      "display": "0.0240",
      "unit": "M/s",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Equal forward and reverse rates give a reverse rate of 0.0240 M/s. A zero reverse rate would not balance the forward reaction.",
        "es": "Las velocidades directa e inversa iguales dan una velocidad inversa de 0.0240 M/s. Una velocidad inversa de cero no equilibraría la reacción directa."
      }
    },
    {
      "id": "7.1-6",
      "topic": "7.1",
      "type": "numeric",
      "prompt": {
        "en": "The concentration model for A(g) ⇌ B(g) starts with [A] = 1.000 M and [B] = 0.000 M. The plateaus are [A] = 0.600 M and [B] = 0.400 M. Read the equilibrium concentration of B.",
        "es": "El modelo de concentración para A(g) ⇌ B(g) empieza con [A] = 1.000 M y [B] = 0.000 M. Las mesetas son [A] = 0.600 M y [B] = 0.400 M. Lee la concentración de B en el equilibrio."
      },
      "value": 0.4,
      "display": "0.400",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "The B curve levels off at 0.400 M. This is an equilibrium concentration, not the initial concentration or the sum of both concentrations.",
        "es": "La curva de B se estabiliza en 0.400 M. Esta es una concentración en el equilibrio, no la concentración inicial ni la suma de ambas concentraciones."
      },
      "curve": true
    },
    {
      "id": "7.2-1",
      "topic": "7.2",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g) with a finite positive K, a vessel initially contains only A. What is the initial net direction?",
        "es": "Para A(g) ⇌ B(g) con K finita y positiva, un recipiente contiene inicialmente solo A. ¿Cuál es la dirección neta inicial?"
      },
      "choices": [
        {
          "text": {
            "en": "To the left, producing A",
            "es": "A la izquierda, produciendo A"
          },
          "why": {
            "en": "There is initially no B available for the reverse reaction.",
            "es": "Inicialmente no hay B disponible para la reacción inversa."
          }
        },
        {
          "text": {
            "en": "No net reaction because Q = K",
            "es": "No hay reacción neta porque Q = K"
          },
          "why": {
            "en": "Initially Q = 0, which is smaller than a finite positive K.",
            "es": "Inicialmente Q = 0, que es menor que una K finita y positiva."
          }
        },
        {
          "text": {
            "en": "The direction depends only on whether K exceeds 1.",
            "es": "La dirección depende solo de si K supera 1."
          },
          "why": {
            "en": "Even a small positive K exceeds the initial Q of zero.",
            "es": "Incluso una K positiva pequeña supera el Q inicial de cero."
          }
        },
        {
          "text": {
            "en": "To the right, producing B",
            "es": "A la derecha, produciendo B"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Q = [B]/[A] = 0. Because Q < K, the net reaction proceeds to the right until Q reaches K.",
        "es": "Q = [B]/[A] = 0. Como Q < K, la reacción neta avanza a la derecha hasta que Q llega a K."
      }
    },
    {
      "id": "7.2-2",
      "topic": "7.2",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g) with a finite positive K, a vessel initially contains only B. What happens first?",
        "es": "Para A(g) ⇌ B(g) con K finita y positiva, un recipiente contiene inicialmente solo B. ¿Qué ocurre primero?"
      },
      "choices": [
        {
          "text": {
            "en": "A catalyst is required to make the reverse direction possible.",
            "es": "Se necesita un catalizador para hacer posible la dirección inversa."
          },
          "why": {
            "en": "A catalyst can change speed but does not create reversibility or change K.",
            "es": "Un catalizador puede cambiar la velocidad, pero no crea la reversibilidad ni cambia K."
          }
        },
        {
          "text": {
            "en": "The reverse reaction produces A.",
            "es": "La reacción inversa produce A."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only A can react, so nothing happens.",
            "es": "Solo A puede reaccionar, así que no ocurre nada."
          },
          "why": {
            "en": "Reversible means that B can also react to form A.",
            "es": "Reversible significa que B también puede reaccionar para formar A."
          }
        },
        {
          "text": {
            "en": "B must increase without any A forming.",
            "es": "B debe aumentar sin que se forme A."
          },
          "why": {
            "en": "Starting with only B provides material for the reverse direction, not net B production.",
            "es": "Empezar solo con B proporciona material para la dirección inversa, no para la producción neta de B."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "A reversible reaction can approach equilibrium from either side. Starting with only B gives net formation of A.",
        "es": "Una reacción reversible puede acercarse al equilibrio desde cualquiera de los lados. Empezar solo con B produce formación neta de A."
      }
    },
    {
      "id": "7.2-3",
      "topic": "7.2",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g), the forward rate exceeds the reverse rate at an instant. What is the net change?",
        "es": "Para A(g) ⇌ B(g), la velocidad directa supera a la inversa en un instante. ¿Cuál es el cambio neto?"
      },
      "choices": [
        {
          "text": {
            "en": "A increases and B decreases.",
            "es": "A aumenta y B disminuye."
          },
          "why": {
            "en": "That would require the reverse rate to exceed the forward rate.",
            "es": "Eso requeriría que la velocidad inversa superara a la directa."
          }
        },
        {
          "text": {
            "en": "Neither concentration changes.",
            "es": "Ninguna concentración cambia."
          },
          "why": {
            "en": "Constant concentrations require equal rates for this reaction.",
            "es": "Las concentraciones constantes requieren velocidades iguales para esta reacción."
          }
        },
        {
          "text": {
            "en": "Both concentrations increase in a sealed rigid vessel.",
            "es": "Ambas concentraciones aumentan en un recipiente rígido sellado."
          },
          "why": {
            "en": "Net conversion of A into B consumes A; the reaction does not create both species.",
            "es": "La conversión neta de A en B consume A; la reacción no crea ambas especies."
          }
        },
        {
          "text": {
            "en": "B increases and A decreases.",
            "es": "B aumenta y A disminuye."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The forward reaction wins the rate difference, so there is net production of B and net consumption of A.",
        "es": "La reacción directa domina la diferencia de velocidades, así que hay producción neta de B y consumo neto de A."
      }
    },
    {
      "id": "7.2-4",
      "topic": "7.2",
      "type": "mc",
      "prompt": {
        "en": "For a reversible reaction, the reaction quotient (Q) equals the equilibrium constant (K). Which description is correct?",
        "es": "Para una reacción reversible, el cociente de reacción (Q) es igual a la constante de equilibrio (K). ¿Qué descripción es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "All reacting particles stop colliding.",
            "es": "Todas las partículas que reaccionan dejan de chocar."
          },
          "why": {
            "en": "Q = K describes balanced rates, not an end to molecular collisions.",
            "es": "Q = K describe velocidades equilibradas, no el fin de las colisiones moleculares."
          }
        },
        {
          "text": {
            "en": "There is dynamic equilibrium with no net shift.",
            "es": "Hay equilibrio dinámico sin desplazamiento neto."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The reaction must shift right because Q is positive.",
            "es": "La reacción debe desplazarse a la derecha porque Q es positivo."
          },
          "why": {
            "en": "The direction depends on comparing Q with K, not on Q being positive.",
            "es": "La dirección depende de comparar Q con K, no de que Q sea positivo."
          }
        },
        {
          "text": {
            "en": "The reaction must shift left because reactants remain.",
            "es": "La reacción debe desplazarse a la izquierda porque quedan reactivos."
          },
          "why": {
            "en": "Reactants can remain at equilibrium without a net shift.",
            "es": "Pueden quedar reactivos en el equilibrio sin un desplazamiento neto."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Q = K identifies equilibrium. The forward and reverse reactions continue at equal rates.",
        "es": "Q = K identifica el equilibrio. La reacción directa y la inversa continúan con velocidades iguales."
      }
    },
    {
      "id": "7.2-5",
      "topic": "7.2",
      "type": "numeric",
      "prompt": {
        "en": "For H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), an instant has [HI] = 0.600 M, [H<sub>2</sub>] = 0.200 M and [I<sub>2</sub>] = 0.300 M. Calculate Qc, using no units.",
        "es": "Para H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), en un instante [HI] = 0.600 M, [H<sub>2</sub>] = 0.200 M y [I<sub>2</sub>] = 0.300 M. Calcula Qc, usando sin unidades."
      },
      "value": 6,
      "display": "6.00",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Qc = [HI]<sup>2</sup>/([H<sub>2</sub>][I<sub>2</sub>]) = 0.600<sup>2</sup>/(0.200 × 0.300) = 6.00. Square the HI concentration.",
        "es": "Qc = [HI]<sup>2</sup>/([H<sub>2</sub>][I<sub>2</sub>]) = 0.600<sup>2</sup>/(0.200 × 0.300) = 6.00. Eleva al cuadrado la concentración de HI."
      }
    },
    {
      "id": "7.2-6",
      "topic": "7.2",
      "type": "numeric",
      "prompt": {
        "en": "For N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g), [NO<sub>2</sub>] = 0.0400 M and [N<sub>2</sub>O<sub>4</sub>] = 0.0800 M at an instant. Calculate Qc, using no units.",
        "es": "Para N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g), [NO<sub>2</sub>] = 0.0400 M y [N<sub>2</sub>O<sub>4</sub>] = 0.0800 M en un instante. Calcula Qc, usando sin unidades."
      },
      "value": 0.02,
      "display": "0.0200",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Qc = [NO<sub>2</sub>]<sup>2</sup>/[N<sub>2</sub>O<sub>4</sub>] = 0.0400<sup>2</sup>/0.0800 = 0.0200. Q uses the current concentrations, even away from equilibrium.",
        "es": "Qc = [NO<sub>2</sub>]<sup>2</sup>/[N<sub>2</sub>O<sub>4</sub>] = 0.0400<sup>2</sup>/0.0800 = 0.0200. Q usa las concentraciones actuales, incluso fuera del equilibrio."
      }
    },
    {
      "id": "7.3-1",
      "topic": "7.3",
      "type": "mc",
      "prompt": {
        "en": "Which law of mass action expression is correct for N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g)?",
        "es": "¿Qué expresión de la ley de acción de masas es correcta para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g)?"
      },
      "choices": [
        {
          "text": {
            "en": "Kc = 2[NH<sub>3</sub>]/(3[N<sub>2</sub>][H<sub>2</sub>])",
            "es": "Kc = 2[NH<sub>3</sub>]/(3[N<sub>2</sub>][H<sub>2</sub>])"
          },
          "why": {
            "en": "Coefficients become exponents, not multipliers of concentrations.",
            "es": "Los coeficientes se vuelven exponentes, no multiplicadores de concentraciones."
          }
        },
        {
          "text": {
            "en": "Kc = [NH<sub>3</sub>]<sup>2</sup>/([N<sub>2</sub>][H<sub>2</sub>]<sup>3</sup>)",
            "es": "Kc = [NH<sub>3</sub>]<sup>2</sup>/([N<sub>2</sub>][H<sub>2</sub>]<sup>3</sup>)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Kc = [NH<sub>3</sub>]/([N<sub>2</sub>][H<sub>2</sub>])",
            "es": "Kc = [NH<sub>3</sub>]/([N<sub>2</sub>][H<sub>2</sub>])"
          },
          "why": {
            "en": "The balanced coefficients must appear as exponents.",
            "es": "Los coeficientes balanceados deben aparecer como exponentes."
          }
        },
        {
          "text": {
            "en": "Kc = [N<sub>2</sub>][H<sub>2</sub>]<sup>3</sup>/[NH<sub>3</sub>]<sup>2</sup>",
            "es": "Kc = [N<sub>2</sub>][H<sub>2</sub>]<sup>3</sup>/[NH<sub>3</sub>]<sup>2</sup>"
          },
          "why": {
            "en": "This is the reciprocal expression for the reversed equation.",
            "es": "Esta es la expresión recíproca para la ecuación inversa."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The law of mass action places products over reactants, each raised to its balanced coefficient. Here the ammonia exponent is 2 and the hydrogen exponent is 3.",
        "es": "La ley de acción de masas coloca productos sobre reactivos, cada uno elevado a su coeficiente balanceado. Aquí el exponente del amoniaco es 2 y el del hidrógeno es 3."
      }
    },
    {
      "id": "7.3-2",
      "topic": "7.3",
      "type": "mc",
      "prompt": {
        "en": "For CaCO<sub>3</sub>(s) ⇌ CaO(s) + CO<sub>2</sub>(g), which is the equilibrium constant expression in partial pressures?",
        "es": "Para CaCO<sub>3</sub>(s) ⇌ CaO(s) + CO<sub>2</sub>(g), ¿cuál es la expresión de la constante de equilibrio en presiones parciales?"
      },
      "choices": [
        {
          "text": {
            "en": "Kp = P(CaO)P(CO<sub>2</sub>)/P(CaCO<sub>3</sub>)",
            "es": "Kp = P(CaO)P(CO<sub>2</sub>)/P(CaCO<sub>3</sub>)"
          },
          "why": {
            "en": "Pure solids do not contribute gas partial-pressure terms.",
            "es": "Los sólidos puros no aportan términos de presión parcial de gas."
          }
        },
        {
          "text": {
            "en": "Kp = 1/P(CO<sub>2</sub>)",
            "es": "Kp = 1/P(CO<sub>2</sub>)"
          },
          "why": {
            "en": "Carbon dioxide is a product, so its pressure belongs in the numerator.",
            "es": "El dióxido de carbono es un producto, así que su presión va en el numerador."
          }
        },
        {
          "text": {
            "en": "Kp = [CO<sub>2</sub>]",
            "es": "Kp = [CO<sub>2</sub>]"
          },
          "why": {
            "en": "Brackets denote concentration; Kp uses partial pressure.",
            "es": "Los corchetes indican concentración; Kp usa presión parcial."
          }
        },
        {
          "text": {
            "en": "Kp = P(CO<sub>2</sub>)",
            "es": "Kp = P(CO<sub>2</sub>)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Omit pure solids CaCO<sub>3</sub> and CaO. The only gas term is the product partial pressure P(CO<sub>2</sub>). Kp is dimensionless under this activity’s convention.",
        "es": "Omite los sólidos puros CaCO<sub>3</sub> y CaO. El único término gaseoso es la presión parcial del producto P(CO<sub>2</sub>). Kp es adimensional según la convención de esta actividad."
      }
    },
    {
      "id": "7.3-3",
      "topic": "7.3",
      "type": "mc",
      "prompt": {
        "en": "For Fe<sup>3+</sup>(aq) + SCN<sup>−</sup>(aq) ⇌ FeSCN<sup>2+</sup>(aq), choose Kc.",
        "es": "Para Fe<sup>3+</sup>(aq) + SCN<sup>−</sup>(aq) ⇌ FeSCN<sup>2+</sup>(aq), elige Kc."
      },
      "choices": [
        {
          "text": {
            "en": "Kc has no concentration terms because all species are aqueous.",
            "es": "Kc no tiene términos de concentración porque todas las especies son acuosas."
          },
          "why": {
            "en": "Dissolved aqueous species enter Kc; only pure solids and pure liquids are omitted.",
            "es": "Las especies acuosas disueltas entran en Kc; solo se omiten sólidos puros y líquidos puros."
          }
        },
        {
          "text": {
            "en": "[FeSCN<sup>2+</sup>]/([Fe<sup>3+</sup>][SCN<sup>−</sup>])",
            "es": "[FeSCN<sup>2+</sup>]/([Fe<sup>3+</sup>][SCN<sup>−</sup>])"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "[FeSCN<sup>2+</sup>]<sup>2</sup>/([Fe<sup>3+</sup>]<sup>3</sup>[SCN<sup>−</sup>])",
            "es": "[FeSCN<sup>2+</sup>]<sup>2</sup>/([Fe<sup>3+</sup>]<sup>3</sup>[SCN<sup>−</sup>])"
          },
          "why": {
            "en": "Ionic charges are not stoichiometric exponents. All balanced coefficients here are unity.",
            "es": "Las cargas iónicas no son exponentes estequiométricos. Todos los coeficientes balanceados aquí son unitarios."
          }
        },
        {
          "text": {
            "en": "[Fe<sup>3+</sup>][SCN<sup>−</sup>]/[FeSCN<sup>2+</sup>]",
            "es": "[Fe<sup>3+</sup>][SCN<sup>−</sup>]/[FeSCN<sup>2+</sup>]"
          },
          "why": {
            "en": "This puts reactants over products and gives the reverse constant.",
            "es": "Esto coloca reactivos sobre productos y da la constante inversa."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "All three dissolved species enter the expression. Products go above reactants, with exponents from coefficients rather than charges.",
        "es": "Las tres especies disueltas entran en la expresión. Los productos van sobre los reactivos, con exponentes de los coeficientes y no de las cargas."
      }
    },
    {
      "id": "7.3-4",
      "topic": "7.3",
      "type": "mc",
      "prompt": {
        "en": "Choose Kp for C(s) + H<sub>2</sub>O(g) ⇌ CO(g) + H<sub>2</sub>(g).",
        "es": "Elige Kp para C(s) + H<sub>2</sub>O(g) ⇌ CO(g) + H<sub>2</sub>(g)."
      },
      "choices": [
        {
          "text": {
            "en": "P(CO)P(H<sub>2</sub>)",
            "es": "P(CO)P(H<sub>2</sub>)"
          },
          "why": {
            "en": "Water is gaseous here, not a pure liquid; retain its pressure term.",
            "es": "El agua es gaseosa aquí, no un líquido puro; conserva su término de presión."
          }
        },
        {
          "text": {
            "en": "P(CO)P(H<sub>2</sub>)/(P(C)P(H<sub>2</sub>O))",
            "es": "P(CO)P(H<sub>2</sub>)/(P(C)P(H<sub>2</sub>O))"
          },
          "why": {
            "en": "Solid carbon is omitted from the expression.",
            "es": "El carbono sólido se omite de la expresión."
          }
        },
        {
          "text": {
            "en": "P(H<sub>2</sub>O)/(P(CO)P(H<sub>2</sub>))",
            "es": "P(H<sub>2</sub>O)/(P(CO)P(H<sub>2</sub>))"
          },
          "why": {
            "en": "This inverts the product-to-reactant ratio.",
            "es": "Esto invierte la razón de productos a reactivos."
          }
        },
        {
          "text": {
            "en": "P(CO)P(H<sub>2</sub>)/P(H<sub>2</sub>O)",
            "es": "P(CO)P(H<sub>2</sub>)/P(H<sub>2</sub>O)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Omit pure solid C but retain gaseous water. Physical state determines which species enter Kp.",
        "es": "Omite el sólido puro C, pero conserva el agua gaseosa. El estado físico determina qué especies entran en Kp."
      }
    },
    {
      "id": "7.3-5",
      "topic": "7.3",
      "type": "numeric",
      "prompt": {
        "en": "At equilibrium for H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), P(HI) = 0.200 atm, P(H<sub>2</sub>) = 0.400 atm and P(I<sub>2</sub>) = 0.100 atm. Calculate Kp, using no units.",
        "es": "En el equilibrio para H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), P(HI) = 0.200 atm, P(H<sub>2</sub>) = 0.400 atm y P(I<sub>2</sub>) = 0.100 atm. Calcula Kp, usando sin unidades."
      },
      "value": 1.0,
      "display": "1.00",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Kp = P(HI)<sup>2</sup>/(P(H<sub>2</sub>)P(I<sub>2</sub>)) = 0.200<sup>2</sup>/(0.400 × 0.100) = 1.00. Use equilibrium partial pressures.",
        "es": "Kp = P(HI)<sup>2</sup>/(P(H<sub>2</sub>)P(I<sub>2</sub>)) = 0.200<sup>2</sup>/(0.400 × 0.100) = 1.00. Usa presiones parciales en el equilibrio."
      }
    },
    {
      "id": "7.3-6",
      "topic": "7.3",
      "type": "numeric",
      "prompt": {
        "en": "For N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g), Kc = 0.500 at 400.0 K. Calculate Kp using R = 0.08206 L·atm/(mol·K) and no units for Kp.",
        "es": "Para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g), Kc = 0.500 a 400.0 K. Calcula Kp usando R = 0.08206 L·atm/(mol·K) y sin unidades para Kp."
      },
      "value": 0.00046407374237203853,
      "display": "4.64e-4",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5e-07,
      "explanation": {
        "en": "Δn = 2 − (1 + 3) = −2. Kp = Kc(RT)<sup>Δn</sup> = 0.500(0.08206 × 400.0)<sup>−2</sup> = 4.64 × 10<sup>−4</sup>. Count only gaseous coefficients.",
        "es": "Δn = 2 − (1 + 3) = −2. Kp = Kc(RT)<sup>Δn</sup> = 0.500(0.08206 × 400.0)<sup>−2</sup> = 4.64 × 10<sup>−4</sup>. Cuenta solo los coeficientes gaseosos."
      }
    },
    {
      "id": "7.4-1",
      "topic": "7.4",
      "type": "mc",
      "prompt": {
        "en": "Which measurements can be substituted directly into Kc for a reaction at a stated temperature?",
        "es": "¿Qué mediciones se pueden sustituir directamente en Kc para una reacción a una temperatura dada?"
      },
      "choices": [
        {
          "text": {
            "en": "Any initial concentrations",
            "es": "Cualquier concentración inicial"
          },
          "why": {
            "en": "Initial values generally give Q, unless equilibrium has already been established.",
            "es": "Los valores iniciales generalmente dan Q, a menos que ya se haya establecido el equilibrio."
          }
        },
        {
          "text": {
            "en": "Only the initial moles, without volume",
            "es": "Solo los moles iniciales, sin volumen"
          },
          "why": {
            "en": "Moles alone do not provide concentrations and may not be equilibrium amounts.",
            "es": "Los moles solos no dan concentraciones y pueden no ser cantidades en el equilibrio."
          }
        },
        {
          "text": {
            "en": "Reaction rates without concentrations",
            "es": "Velocidades de reacción sin concentraciones"
          },
          "why": {
            "en": "Kc relates equilibrium concentrations; rates alone are not the required measurements.",
            "es": "Kc relaciona concentraciones en el equilibrio; las velocidades solas no son las mediciones necesarias."
          }
        },
        {
          "text": {
            "en": "Concentrations measured at equilibrium",
            "es": "Concentraciones medidas en el equilibrio"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Kc uses equilibrium concentrations. An ICE table can convert initial data and an equilibrium measurement into those concentrations.",
        "es": "Kc usa concentraciones en el equilibrio. Una tabla ICE (inicial, cambio, equilibrio) puede convertir datos iniciales y una medición en el equilibrio en esas concentraciones."
      }
    },
    {
      "id": "7.4-2",
      "topic": "7.4",
      "type": "mc",
      "prompt": {
        "en": "Initially [N<sub>2</sub>O<sub>4</sub>] = 0.100 M and [NO<sub>2</sub>] = 0 for N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g). At equilibrium [NO<sub>2</sub>] = 0.0400 M. Which Kc is correct?",
        "es": "Inicialmente [N<sub>2</sub>O<sub>4</sub>] = 0.100 M y [NO<sub>2</sub>] = 0 para N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g). En el equilibrio [NO<sub>2</sub>] = 0.0400 M. ¿Qué Kc es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "0.500",
            "es": "0.500"
          },
          "why": {
            "en": "This divides concentrations without squaring the product term.",
            "es": "Esto divide concentraciones sin elevar al cuadrado el término del producto."
          }
        },
        {
          "text": {
            "en": "0.0200",
            "es": "0.0200"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "0.0160",
            "es": "0.0160"
          },
          "why": {
            "en": "This uses the initial dimer concentration instead of subtracting the amount consumed.",
            "es": "Esto usa la concentración inicial del dímero en lugar de restar la cantidad consumida."
          }
        },
        {
          "text": {
            "en": "0.0267",
            "es": "0.0267"
          },
          "why": {
            "en": "Subtracting the full product increase from the dimer ignores the coefficient ratio.",
            "es": "Restar todo el aumento del producto al dímero ignora la razón de coeficientes."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The product increase is 2x = 0.0400 M, so x = 0.0200 M and the remaining dimer is 0.0800 M. Kc = 0.0400<sup>2</sup>/0.0800 = 0.0200.",
        "es": "El aumento del producto es 2x = 0.0400 M, así que x = 0.0200 M y el dímero restante es 0.0800 M. Kc = 0.0400<sup>2</sup>/0.0800 = 0.0200."
      }
    },
    {
      "id": "7.4-3",
      "topic": "7.4",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g), equilibrium amounts are 0.600 mol A and 0.300 mol B in 2.00 L. What is Kc?",
        "es": "Para A(g) ⇌ B(g), las cantidades en el equilibrio son 0.600 mol de A y 0.300 mol de B en 2.00 L. ¿Cuál es Kc?"
      },
      "choices": [
        {
          "text": {
            "en": "2.00",
            "es": "2.00"
          },
          "why": {
            "en": "This inverts the equilibrium product-to-reactant ratio.",
            "es": "Esto invierte la razón de producto a reactivo en el equilibrio."
          }
        },
        {
          "text": {
            "en": "0.150",
            "es": "0.150"
          },
          "why": {
            "en": "This is the product concentration, not the ratio of product to reactant concentrations.",
            "es": "Esta es la concentración del producto, no la razón entre las concentraciones de producto y reactivo."
          }
        },
        {
          "text": {
            "en": "0.900",
            "es": "0.900"
          },
          "why": {
            "en": "Adding amounts does not calculate the equilibrium constant.",
            "es": "Sumar cantidades no calcula la constante de equilibrio."
          }
        },
        {
          "text": {
            "en": "0.500",
            "es": "0.500"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "[A] = 0.600/2.00 = 0.300 M and [B] = 0.300/2.00 = 0.150 M. Kc = [B]/[A] = 0.500. The common volume cancels for this coefficient ratio.",
        "es": "[A] = 0.600/2.00 = 0.300 M y [B] = 0.300/2.00 = 0.150 M. Kc = [B]/[A] = 0.500. El volumen común se cancela para esta razón de coeficientes."
      }
    },
    {
      "id": "7.4-4",
      "topic": "7.4",
      "type": "mc",
      "prompt": {
        "en": "For H<sub>2</sub>O(l) ⇌ H<sup>+</sup>(aq) + OH<sup>−</sup>(aq), which expression uses the correct equilibrium data?",
        "es": "Para H<sub>2</sub>O(l) ⇌ H<sup>+</sup>(aq) + OH<sup>−</sup>(aq), ¿qué expresión usa los datos correctos en el equilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "Kc = 1/([H<sup>+</sup>][OH<sup>−</sup>])",
            "es": "Kc = 1/([H<sup>+</sup>][OH<sup>−</sup>])"
          },
          "why": {
            "en": "This reciprocal corresponds to the reversed reaction.",
            "es": "Este recíproco corresponde a la reacción inversa."
          }
        },
        {
          "text": {
            "en": "Kc = [H<sup>+</sup>][OH<sup>−</sup>]",
            "es": "Kc = [H<sup>+</sup>][OH<sup>−</sup>]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Kc = [H<sup>+</sup>][OH<sup>−</sup>]/[H<sub>2</sub>O]",
            "es": "Kc = [H<sup>+</sup>][OH<sup>−</sup>]/[H<sub>2</sub>O]"
          },
          "why": {
            "en": "Pure liquid water has constant activity and is omitted.",
            "es": "El agua líquida pura tiene actividad constante y se omite."
          }
        },
        {
          "text": {
            "en": "Kc = [H<sup>+</sup>] + [OH<sup>−</sup>]",
            "es": "Kc = [H<sup>+</sup>] + [OH<sup>−</sup>]"
          },
          "why": {
            "en": "Concentration terms multiply rather than add in a mass-action expression.",
            "es": "Los términos de concentración se multiplican en lugar de sumarse en una expresión de acción de masas."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Omit pure liquid H<sub>2</sub>O and multiply the two equilibrium ion concentrations. Both aqueous ions remain in Kc.",
        "es": "Omite el H<sub>2</sub>O líquido puro y multiplica las dos concentraciones iónicas en el equilibrio. Ambos iones acuosos permanecen en Kc."
      }
    },
    {
      "id": "7.4-5",
      "topic": "7.4",
      "type": "numeric",
      "prompt": {
        "en": "At equilibrium for H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), [HI] = 0.600 M and [H<sub>2</sub>] = [I<sub>2</sub>] = 0.200 M. Calculate Kc, using no units.",
        "es": "En el equilibrio para H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), [HI] = 0.600 M y [H<sub>2</sub>] = [I<sub>2</sub>] = 0.200 M. Calcula Kc, usando sin unidades."
      },
      "value": 8.999999999999998,
      "display": "9.00",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Kc = 0.600<sup>2</sup>/(0.200 × 0.200) = 9.00. Equilibrium data give Kc rather than an arbitrary current Qc.",
        "es": "Kc = 0.600<sup>2</sup>/(0.200 × 0.200) = 9.00. Los datos en el equilibrio dan Kc y no un Qc actual cualquiera."
      }
    },
    {
      "id": "7.4-6",
      "topic": "7.4",
      "type": "numeric",
      "prompt": {
        "en": "Initially only PCl<sub>5</sub> is present at 0.500 M for PCl<sub>5</sub>(g) ⇌ PCl<sub>3</sub>(g) + Cl<sub>2</sub>(g). At equilibrium [PCl<sub>3</sub>] = 0.100 M. Calculate Kc, using no units.",
        "es": "Inicialmente solo hay PCl<sub>5</sub> a 0.500 M para PCl<sub>5</sub>(g) ⇌ PCl<sub>3</sub>(g) + Cl<sub>2</sub>(g). En el equilibrio [PCl<sub>3</sub>] = 0.100 M. Calcula Kc, usando sin unidades."
      },
      "value": 0.025000000000000005,
      "display": "0.0250",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "The ICE change is −x, +x, +x with x = 0.100 M. Thus [PCl<sub>5</sub>] = 0.400 M and [Cl<sub>2</sub>] = 0.100 M. Kc = 0.100<sup>2</sup>/0.400 = 0.0250.",
        "es": "El cambio de la tabla ICE es −x, +x, +x con x = 0.100 M. Entonces [PCl<sub>5</sub>] = 0.400 M y [Cl<sub>2</sub>] = 0.100 M. Kc = 0.100<sup>2</sup>/0.400 = 0.0250."
      }
    },
    {
      "id": "7.5-1",
      "topic": "7.5",
      "type": "mc",
      "prompt": {
        "en": "For a reaction at a fixed temperature, K is very large. What can be concluded?",
        "es": "Para una reacción a temperatura fija, K es muy grande. ¿Qué se puede concluir?"
      },
      "choices": [
        {
          "text": {
            "en": "The reverse reaction is impossible.",
            "es": "La reacción inversa es imposible."
          },
          "why": {
            "en": "The reverse reaction continues at equilibrium even when products are strongly favored.",
            "es": "La reacción inversa continúa en el equilibrio incluso cuando se favorecen mucho los productos."
          }
        },
        {
          "text": {
            "en": "Products are favored at equilibrium, but the reaction speed is not given.",
            "es": "Se favorecen los productos en el equilibrio, pero no se indica la velocidad de reacción."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The reaction must be very fast.",
            "es": "La reacción debe ser muy rápida."
          },
          "why": {
            "en": "K describes equilibrium composition, not the time needed to reach it.",
            "es": "K describe la composición en el equilibrio, no el tiempo necesario para alcanzarlo."
          }
        },
        {
          "text": {
            "en": "No reactant can remain.",
            "es": "No puede quedar ningún reactivo."
          },
          "why": {
            "en": "A large finite K can still allow a small equilibrium amount of reactant.",
            "es": "Una K finita grande aún puede permitir una cantidad pequeña de reactivo en el equilibrio."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "A large K means the equilibrium mass-action ratio strongly favors products. It does not specify rates or complete conversion.",
        "es": "Una K grande significa que la razón de acción de masas en el equilibrio favorece mucho los productos. No especifica velocidades ni conversión completa."
      }
    },
    {
      "id": "7.5-2",
      "topic": "7.5",
      "type": "mc",
      "prompt": {
        "en": "A reaction has K much smaller than unity at a stated temperature. Which interpretation is best?",
        "es": "Una reacción tiene K mucho menor que la unidad a una temperatura dada. ¿Cuál es la mejor interpretación?"
      },
      "choices": [
        {
          "text": {
            "en": "The equilibrium mixture must contain only products.",
            "es": "La mezcla en el equilibrio debe contener solo productos."
          },
          "why": {
            "en": "Small K makes the product-to-reactant mass-action ratio small.",
            "es": "Una K pequeña hace pequeña la razón de acción de masas de productos a reactivos."
          }
        },
        {
          "text": {
            "en": "No product molecule can ever form.",
            "es": "Nunca puede formarse ninguna molécula de producto."
          },
          "why": {
            "en": "An unfavorable equilibrium position does not prohibit forward molecular events.",
            "es": "Una posición de equilibrio desfavorable no impide los eventos moleculares directos."
          }
        },
        {
          "text": {
            "en": "The forward rate is always smaller than the reverse rate.",
            "es": "La velocidad directa siempre es menor que la inversa."
          },
          "why": {
            "en": "At equilibrium the two rates are equal even for a small K.",
            "es": "En el equilibrio las dos velocidades son iguales incluso para una K pequeña."
          }
        },
        {
          "text": {
            "en": "Reactants are favored at equilibrium; some products can still be present.",
            "es": "Se favorecen los reactivos en el equilibrio; aún puede haber productos."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Small K favors reactants in the equilibrium expression, without requiring product concentration to be zero.",
        "es": "Una K pequeña favorece los reactivos en la expresión de equilibrio, sin requerir que la concentración de producto sea cero."
      }
    },
    {
      "id": "7.5-3",
      "topic": "7.5",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ 2B(g), Kc = 1. Which statement follows?",
        "es": "Para A(g) ⇌ 2B(g), Kc = 1. ¿Qué enunciado se deduce?"
      },
      "choices": [
        {
          "text": {
            "en": "The concentrations must both be zero.",
            "es": "Ambas concentraciones deben ser cero."
          },
          "why": {
            "en": "Zero concentrations do not provide a defined product-to-reactant ratio for this expression.",
            "es": "Las concentraciones de cero no dan una razón definida de producto a reactivo para esta expresión."
          }
        },
        {
          "text": {
            "en": "[B]<sup>2</sup> = [A]; the concentrations need not be equal.",
            "es": "[B]<sup>2</sup> = [A]; las concentraciones no tienen que ser iguales."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "[A] must equal [B].",
            "es": "[A] debe ser igual a [B]."
          },
          "why": {
            "en": "The product concentration is squared in this reaction’s equilibrium expression.",
            "es": "La concentración del producto se eleva al cuadrado en la expresión de equilibrio de esta reacción."
          }
        },
        {
          "text": {
            "en": "The reaction has stopped.",
            "es": "La reacción se ha detenido."
          },
          "why": {
            "en": "The numerical value of K does not stop forward and reverse reactions.",
            "es": "El valor numérico de K no detiene la reacción directa ni la inversa."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Kc = [B]<sup>2</sup>/[A] = 1 constrains a ratio of concentration terms, not equal amounts of each species.",
        "es": "Kc = [B]<sup>2</sup>/[A] = 1 restringe una razón de términos de concentración, no cantidades iguales de cada especie."
      }
    },
    {
      "id": "7.5-4",
      "topic": "7.5",
      "type": "mc",
      "prompt": {
        "en": "A catalyst is added to a mixture already at equilibrium at fixed temperature and volume. What happens to K and the equilibrium composition?",
        "es": "Se agrega un catalizador a una mezcla que ya está en equilibrio a temperatura y volumen fijos. ¿Qué ocurre con K y la composición en el equilibrio?"
      },
      "choices": [
        {
          "text": {
            "en": "K increases and more product forms.",
            "es": "K aumenta y se forma más producto."
          },
          "why": {
            "en": "A catalyst does not change the thermodynamic equilibrium constant.",
            "es": "Un catalizador no cambia la constante de equilibrio termodinámica."
          }
        },
        {
          "text": {
            "en": "K decreases and more reactant forms.",
            "es": "K disminuye y se forma más reactivo."
          },
          "why": {
            "en": "Accelerating both directions does not favor reactants thermodynamically.",
            "es": "Acelerar ambas direcciones no favorece termodinámicamente a los reactivos."
          }
        },
        {
          "text": {
            "en": "K stays fixed, but the equilibrium composition must change.",
            "es": "K permanece fija, pero la composición en el equilibrio debe cambiar."
          },
          "why": {
            "en": "With the same temperature, volume and amounts, a catalyst does not change the equilibrium composition.",
            "es": "Con la misma temperatura, volumen y cantidades, un catalizador no cambia la composición en el equilibrio."
          }
        },
        {
          "text": {
            "en": "Both remain unchanged.",
            "es": "Ambos permanecen sin cambio."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "A catalyst changes the rates of both directions and can shorten the time to equilibrium. It changes neither K nor the equilibrium composition.",
        "es": "Un catalizador cambia las velocidades de ambas direcciones y puede acortar el tiempo para alcanzar el equilibrio. No cambia K ni la composición en el equilibrio."
      }
    },
    {
      "id": "7.5-5",
      "topic": "7.5",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g), Kc = 4.00 and the equilibrium sum [A] + [B] = 0.500 M. Calculate [B].",
        "es": "Para A(g) ⇌ B(g), Kc = 4.00 y la suma en el equilibrio [A] + [B] = 0.500 M. Calcula [B]."
      },
      "value": 0.4,
      "display": "0.400",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "[B] = 4.00[A], so 5.00[A] = 0.500 M. Thus [A] = 0.100 M and [B] = 0.400 M. Products are favored, but reactant remains.",
        "es": "[B] = 4.00[A], así que 5.00[A] = 0.500 M. Entonces [A] = 0.100 M y [B] = 0.400 M. Se favorecen los productos, pero queda reactivo."
      }
    },
    {
      "id": "7.5-6",
      "topic": "7.5",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g), Kc = 0.0200 and equilibrium [A] = 0.500 M. Calculate equilibrium [B].",
        "es": "Para A(g) ⇌ B(g), Kc = 0.0200 y [A] en el equilibrio es 0.500 M. Calcula [B] en el equilibrio."
      },
      "value": 0.01,
      "display": "0.0100",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "[B] = Kc[A] = 0.0200 × 0.500 = 0.0100 M. The small K favors reactants, but does not eliminate all product.",
        "es": "[B] = Kc[A] = 0.0200 × 0.500 = 0.0100 M. La K pequeña favorece los reactivos, pero no elimina todo el producto."
      }
    },
    {
      "id": "7.6-1",
      "topic": "7.6",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g), K = 0.250. What is K for B(g) ⇌ A(g) at the same temperature?",
        "es": "Para A(g) ⇌ B(g), K = 0.250. ¿Cuál es K para B(g) ⇌ A(g) a la misma temperatura?"
      },
      "choices": [
        {
          "text": {
            "en": "−0.250",
            "es": "−0.250"
          },
          "why": {
            "en": "Reversing takes the reciprocal, not the negative. An equilibrium constant is positive.",
            "es": "Invertir toma el recíproco, no el negativo. Una constante de equilibrio es positiva."
          }
        },
        {
          "text": {
            "en": "0.250",
            "es": "0.250"
          },
          "why": {
            "en": "The reversed expression interchanges numerator and denominator.",
            "es": "La expresión inversa intercambia numerador y denominador."
          }
        },
        {
          "text": {
            "en": "0.0625",
            "es": "0.0625"
          },
          "why": {
            "en": "Squaring applies to doubling coefficients, not reversing the equation.",
            "es": "Elevar al cuadrado se aplica al duplicar coeficientes, no al invertir la ecuación."
          }
        },
        {
          "text": {
            "en": "4.00",
            "es": "4.00"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Reversing the reaction gives K′ = 1/K = 1/0.250 = 4.00.",
        "es": "Invertir la reacción da K′ = 1/K = 1/0.250 = 4.00."
      }
    },
    {
      "id": "7.6-2",
      "topic": "7.6",
      "type": "mc",
      "prompt": {
        "en": "A reaction has K = 4.00. Every coefficient is multiplied by 0.5 at the same temperature. What is the new K?",
        "es": "Una reacción tiene K = 4.00. Cada coeficiente se multiplica por 0.5 a la misma temperatura. ¿Cuál es la nueva K?"
      },
      "choices": [
        {
          "text": {
            "en": "0.250",
            "es": "0.250"
          },
          "why": {
            "en": "The reciprocal corresponds to reversal, not halving.",
            "es": "El recíproco corresponde a invertir, no a dividir a la mitad."
          }
        },
        {
          "text": {
            "en": "2.00",
            "es": "2.00"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "8.00",
            "es": "8.00"
          },
          "why": {
            "en": "Dividing K by the coefficient multiplier is not the scaling rule.",
            "es": "Dividir K entre el multiplicador del coeficiente no es la regla de escala."
          }
        },
        {
          "text": {
            "en": "16.0",
            "es": "16.0"
          },
          "why": {
            "en": "Squaring would correspond to doubling the coefficients.",
            "es": "Elevar al cuadrado correspondería a duplicar los coeficientes."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Multiplying coefficients by n gives K′ = K<sup>n</sup>. Here K′ = 4.00<sup>0.5</sup> = 2.00.",
        "es": "Multiplicar los coeficientes por n da K′ = K<sup>n</sup>. Aquí K′ = 4.00<sup>0.5</sup> = 2.00."
      }
    },
    {
      "id": "7.6-3",
      "topic": "7.6",
      "type": "mc",
      "prompt": {
        "en": "At the same temperature, A(g) ⇌ B(g) has K = 3.00 and B(g) ⇌ C(g) has K = 5.00. What is the result of adding the reactions?",
        "es": "A la misma temperatura, A(g) ⇌ B(g) tiene K = 3.00 y B(g) ⇌ C(g) tiene K = 5.00. ¿Cuál es el resultado de sumar las reacciones?"
      },
      "choices": [
        {
          "text": {
            "en": "A(g) ⇌ C(g), K = 8.00",
            "es": "A(g) ⇌ C(g), K = 8.00"
          },
          "why": {
            "en": "Adding reactions multiplies their K values rather than adding them.",
            "es": "Sumar reacciones multiplica sus valores de K en lugar de sumarlos."
          }
        },
        {
          "text": {
            "en": "A(g) ⇌ C(g), K = 0.600",
            "es": "A(g) ⇌ C(g), K = 0.600"
          },
          "why": {
            "en": "Division would require reversing one of the supplied reactions.",
            "es": "La división requeriría invertir una de las reacciones dadas."
          }
        },
        {
          "text": {
            "en": "A(g) + C(g) ⇌ 2B(g), K = 15.0",
            "es": "A(g) + C(g) ⇌ 2B(g), K = 15.0"
          },
          "why": {
            "en": "B cancels because it occurs on opposite sides; C remains a product.",
            "es": "B se cancela porque aparece en lados opuestos; C queda como producto."
          }
        },
        {
          "text": {
            "en": "A(g) ⇌ C(g), K = 15.0",
            "es": "A(g) ⇌ C(g), K = 15.0"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Adding cancels B and multiplies constants: K = 3.00 × 5.00 = 15.0 for A(g) ⇌ C(g).",
        "es": "Sumar cancela B y multiplica constantes: K = 3.00 × 5.00 = 15.0 para A(g) ⇌ C(g)."
      }
    },
    {
      "id": "7.6-4",
      "topic": "7.6",
      "type": "mc",
      "prompt": {
        "en": "An equation with K = 0.200 is reversed and then all coefficients are doubled at the same temperature. What is the new K?",
        "es": "Una ecuación con K = 0.200 se invierte y luego se duplican todos los coeficientes a la misma temperatura. ¿Cuál es la nueva K?"
      },
      "choices": [
        {
          "text": {
            "en": "0.0400",
            "es": "0.0400"
          },
          "why": {
            "en": "This squares the original constant without reversing it first.",
            "es": "Esto eleva al cuadrado la constante original sin invertirla primero."
          }
        },
        {
          "text": {
            "en": "25.0",
            "es": "25.0"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "−0.400",
            "es": "−0.400"
          },
          "why": {
            "en": "Neither reversal nor scaling makes K negative; use a reciprocal and an exponent.",
            "es": "Ni invertir ni cambiar la escala hace negativa a K; usa un recíproco y un exponente."
          }
        },
        {
          "text": {
            "en": "5.00",
            "es": "5.00"
          },
          "why": {
            "en": "This accounts for reversal but omits doubling the coefficients.",
            "es": "Esto considera la inversión, pero omite duplicar los coeficientes."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "First reverse: 1/0.200 = 5.00. Then double: K′ = 5.00<sup>2</sup> = 25.0.",
        "es": "Primero invierte: 1/0.200 = 5.00. Luego duplica: K′ = 5.00<sup>2</sup> = 25.0."
      }
    },
    {
      "id": "7.6-5",
      "topic": "7.6",
      "type": "numeric",
      "prompt": {
        "en": "N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g) has Kc = 0.0400. Calculate Kc for 2NO<sub>2</sub>(g) ⇌ N<sub>2</sub>O<sub>4</sub>(g) at the same temperature. Use no units.",
        "es": "N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g) tiene Kc = 0.0400. Calcula Kc para 2NO<sub>2</sub>(g) ⇌ N<sub>2</sub>O<sub>4</sub>(g) a la misma temperatura. Usa sin unidades."
      },
      "value": 25.0,
      "display": "25.0",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "The equation is reversed without scaling, so Kc′ = 1/0.0400 = 25.0. Do not change the sign or multiply by a coefficient.",
        "es": "La ecuación se invierte sin cambiar la escala, así que Kc′ = 1/0.0400 = 25.0. No cambies el signo ni multipliques por un coeficiente."
      }
    },
    {
      "id": "7.6-6",
      "topic": "7.6",
      "type": "numeric",
      "prompt": {
        "en": "At the same temperature, A(g) ⇌ B(g) has K = 2.50 and B(g) ⇌ C(g) has K = 0.0400. Calculate K for A(g) ⇌ C(g), using no units.",
        "es": "A la misma temperatura, A(g) ⇌ B(g) tiene K = 2.50 y B(g) ⇌ C(g) tiene K = 0.0400. Calcula K para A(g) ⇌ C(g), usando sin unidades."
      },
      "value": 0.1,
      "display": "0.100",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "Cancel the intermediate B and multiply: K = 2.50 × 0.0400 = 0.100. Adding equations does not mean adding their constants.",
        "es": "Cancela el intermediario B y multiplica: K = 2.50 × 0.0400 = 0.100. Sumar ecuaciones no significa sumar sus constantes."
      }
    },
    {
      "id": "7.7-1",
      "topic": "7.7",
      "type": "mc",
      "prompt": {
        "en": "For N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g) starting with only the dimer, x M of dimer dissociates. Which ICE change row is correct?",
        "es": "Para N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g), empezando solo con el dímero, se disocian x M de dímero. ¿Qué fila de cambio de la tabla ICE es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "N<sub>2</sub>O<sub>4</sub>: −2x; NO<sub>2</sub>: +x",
            "es": "N<sub>2</sub>O<sub>4</sub>: −2x; NO<sub>2</sub>: +x"
          },
          "why": {
            "en": "This reverses the stoichiometric change ratio.",
            "es": "Esto invierte la razón estequiométrica de cambio."
          }
        },
        {
          "text": {
            "en": "N<sub>2</sub>O<sub>4</sub>: −x; NO<sub>2</sub>: +2x",
            "es": "N<sub>2</sub>O<sub>4</sub>: −x; NO<sub>2</sub>: +2x"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "N<sub>2</sub>O<sub>4</sub>: −x; NO<sub>2</sub>: +x",
            "es": "N<sub>2</sub>O<sub>4</sub>: −x; NO<sub>2</sub>: +x"
          },
          "why": {
            "en": "The product coefficient doubles the product concentration change.",
            "es": "El coeficiente del producto duplica el cambio de concentración del producto."
          }
        },
        {
          "text": {
            "en": "N<sub>2</sub>O<sub>4</sub>: +x; NO<sub>2</sub>: −2x",
            "es": "N<sub>2</sub>O<sub>4</sub>: +x; NO<sub>2</sub>: −2x"
          },
          "why": {
            "en": "Those signs describe net association, but the starting mixture contains only dimer.",
            "es": "Esos signos describen asociación neta, pero la mezcla inicial contiene solo dímero."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The change row follows the coefficients: consuming x M dimer produces 2x M monomer. The equilibrium row is initial plus change.",
        "es": "La fila de cambio sigue los coeficientes: consumir x M de dímero produce 2x M de monómero. La fila de equilibrio es inicial más cambio."
      }
    },
    {
      "id": "7.7-2",
      "topic": "7.7",
      "type": "mc",
      "prompt": {
        "en": "An ICE calculation replaces 0.100 − x by 0.100 M and estimates x = 0.0020 M. Does this pass the 5% approximation check?",
        "es": "Un cálculo con tabla ICE reemplaza 0.100 − x por 0.100 M y estima x = 0.0020 M. ¿Pasa la comprobación de aproximación del 5%?"
      },
      "choices": [
        {
          "text": {
            "en": "No; x is 20% of the initial concentration.",
            "es": "No; x es 20% de la concentración inicial."
          },
          "why": {
            "en": "Divide x by the initial concentration before multiplying by the percent factor.",
            "es": "Divide x entre la concentración inicial antes de multiplicar por el factor porcentual."
          }
        },
        {
          "text": {
            "en": "Yes, because every small K guarantees an accurate approximation.",
            "es": "Sí, porque toda K pequeña garantiza una aproximación precisa."
          },
          "why": {
            "en": "The check depends on both K and the initial concentrations, not K alone.",
            "es": "La comprobación depende de K y de las concentraciones iniciales, no solo de K."
          }
        },
        {
          "text": {
            "en": "No; any nonzero x makes an approximation invalid.",
            "es": "No; cualquier x distinta de cero invalida una aproximación."
          },
          "why": {
            "en": "An approximation can be useful when the neglected change is a sufficiently small fraction.",
            "es": "Una aproximación puede ser útil cuando el cambio despreciado es una fracción suficientemente pequeña."
          }
        },
        {
          "text": {
            "en": "Yes; x is 2.0% of the initial concentration.",
            "es": "Sí; x es 2.0% de la concentración inicial."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The check is (0.0020/0.100) × 100 = 2.0%, below 5%. Keep x in terms for species initially absent.",
        "es": "La comprobación es (0.0020/0.100) × 100 = 2.0%, menor que 5%. Conserva x en los términos de las especies inicialmente ausentes."
      }
    },
    {
      "id": "7.7-3",
      "topic": "7.7",
      "type": "mc",
      "prompt": {
        "en": "An ICE approximation neglects x compared with 0.100 M, but gives x = 0.010 M. What should you do using the 5% rule?",
        "es": "Una aproximación con tabla ICE desprecia x frente a 0.100 M, pero da x = 0.010 M. ¿Qué debes hacer usando la regla del 5%?"
      },
      "choices": [
        {
          "text": {
            "en": "Change K until the approximation works.",
            "es": "Cambia K hasta que funcione la aproximación."
          },
          "why": {
            "en": "K is fixed by the reaction and temperature, not chosen to simplify the algebra.",
            "es": "K está fijada por la reacción y la temperatura, no se elige para simplificar el álgebra."
          }
        },
        {
          "text": {
            "en": "Reject the approximation and solve the full equilibrium equation.",
            "es": "Rechaza la aproximación y resuelve la ecuación completa de equilibrio."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Accept because x is smaller than the initial value.",
            "es": "Acepta porque x es menor que el valor inicial."
          },
          "why": {
            "en": "Being smaller is insufficient; the neglected fraction must pass the specified check.",
            "es": "Ser menor no basta; la fracción despreciada debe pasar la comprobación especificada."
          }
        },
        {
          "text": {
            "en": "Set x to zero in every concentration.",
            "es": "Haz x igual a cero en todas las concentraciones."
          },
          "why": {
            "en": "Species produced from an initially absent state still require nonzero concentration terms.",
            "es": "Las especies producidas desde un estado inicialmente ausente aún requieren términos de concentración distintos de cero."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The neglected fraction is (0.010/0.100) × 100 = 10%, above 5%. Use the full equation rather than that approximation.",
        "es": "La fracción despreciada es (0.010/0.100) × 100 = 10%, mayor que 5%. Usa la ecuación completa en lugar de esa aproximación."
      }
    },
    {
      "id": "7.7-4",
      "topic": "7.7",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g) + C(g), initially [A] = 0.100 M and [B] = [C] = 0. An algebraic candidate is x = 0.150 M, where [A] = 0.100 − x. How should it be treated?",
        "es": "Para A(g) ⇌ B(g) + C(g), inicialmente [A] = 0.100 M y [B] = [C] = 0. Un candidato algebraico es x = 0.150 M, donde [A] = 0.100 − x. ¿Cómo debe tratarse?"
      },
      "choices": [
        {
          "text": {
            "en": "Accept every positive algebraic root.",
            "es": "Acepta toda raíz algebraica positiva."
          },
          "why": {
            "en": "A positive extent can still exceed the available reactant.",
            "es": "Un avance positivo aún puede superar el reactivo disponible."
          }
        },
        {
          "text": {
            "en": "Use its absolute value for every species.",
            "es": "Usa su valor absoluto para cada especie."
          },
          "why": {
            "en": "Taking absolute values does not restore the mass balance.",
            "es": "Tomar valores absolutos no restaura el balance de masa."
          }
        },
        {
          "text": {
            "en": "Make K negative to keep the root.",
            "es": "Haz negativa a K para conservar la raíz."
          },
          "why": {
            "en": "An equilibrium constant is positive; changing its sign is not a physical correction.",
            "es": "Una constante de equilibrio es positiva; cambiar su signo no es una corrección física."
          }
        },
        {
          "text": {
            "en": "Discard it because it gives a negative concentration.",
            "es": "Descártalo porque da una concentración negativa."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The candidate would consume more A than initially exists. Physical roots must satisfy nonnegative concentrations and the original mass balance.",
        "es": "El candidato consumiría más A de la que existe inicialmente. Las raíces físicas deben satisfacer concentraciones no negativas y el balance de masa original."
      }
    },
    {
      "id": "7.7-5",
      "topic": "7.7",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g) + C(g), initially [A] = 0.100 M and [B] = [C] = 0. Kc = 0.0100. Solve the full ICE equation for equilibrium [B].",
        "es": "Para A(g) ⇌ B(g) + C(g), inicialmente [A] = 0.100 M y [B] = [C] = 0. Kc = 0.0100. Resuelve la ecuación completa de la tabla ICE para [B] en el equilibrio."
      },
      "value": 0.027015621187164243,
      "display": "0.0270",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Kc = x<sup>2</sup>/(0.100 − x) = 0.0100. The physical quadratic root is x = 0.0270156 M, giving [B] = 0.0270 M. Neglecting x would fail the 5% check.",
        "es": "Kc = x<sup>2</sup>/(0.100 − x) = 0.0100. La raíz cuadrática física es x = 0.0270156 M, que da [B] = 0.0270 M. Despreciar x no pasaría la comprobación del 5%."
      }
    },
    {
      "id": "7.7-6",
      "topic": "7.7",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g) + C(g), initially [A] = 0.200 M and [B] = [C] = 0. Kc = 2.00 × 10<sup>−9</sup>. Use the small-x approximation to find [B], then check x is under 5% of initial [A].",
        "es": "Para A(g) ⇌ B(g) + C(g), inicialmente [A] = 0.200 M y [B] = [C] = 0. Kc = 2.00 × 10<sup>−9</sup>. Usa la aproximación de x pequeña para calcular [B], y comprueba que x sea menor que 5% de [A] inicial."
      },
      "value": 2e-05,
      "display": "2.00e-5",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5e-08,
      "explanation": {
        "en": "With 0.200 − x ≈ 0.200, x = √(2.00 × 10<sup>−9</sup> × 0.200) = 2.00 × 10<sup>−5</sup> M. The check is x/0.200 × 100 = 0.0100%, below 5%. The full equation rounds to the same answer.",
        "es": "Con 0.200 − x ≈ 0.200, x = √(2.00 × 10<sup>−9</sup> × 0.200) = 2.00 × 10<sup>−5</sup> M. La comprobación es x/0.200 × 100 = 0.0100%, menor que 5%. La ecuación completa redondea a la misma respuesta."
      }
    },
    {
      "id": "7.8-1",
      "topic": "7.8",
      "type": "mc",
      "prompt": {
        "en": "A model for A<sub>2</sub>(g) ⇌ 2A(g) shows 4 pairs and 2 singles initially, then 3 pairs and 4 singles. Which change is represented?",
        "es": "Un modelo para A<sub>2</sub>(g) ⇌ 2A(g) muestra 4 pares y 2 partículas individuales inicialmente, luego 3 pares y 4 individuales. ¿Qué cambio se representa?"
      },
      "choices": [
        {
          "text": {
            "en": "One pair becomes one single, losing an atom.",
            "es": "Un par se vuelve una partícula individual, perdiendo un átomo."
          },
          "why": {
            "en": "A pair contains two atoms; its dissociation produces two singles.",
            "es": "Un par contiene dos átomos; su disociación produce dos partículas individuales."
          }
        },
        {
          "text": {
            "en": "Two singles combine to make one pair.",
            "es": "Dos partículas individuales se combinan para formar un par."
          },
          "why": {
            "en": "Association would increase pair count, but the described pair count decreases.",
            "es": "La asociación aumentaría el número de pares, pero el número de pares descrito disminuye."
          }
        },
        {
          "text": {
            "en": "New atoms appear because the total particle count rises.",
            "es": "Aparecen átomos nuevos porque aumenta el número total de partículas."
          },
          "why": {
            "en": "Particle count can change while atom count remains conserved.",
            "es": "El número de partículas puede cambiar mientras se conserva el número de átomos."
          }
        },
        {
          "text": {
            "en": "One pair dissociates into two singles, conserving atoms.",
            "es": "Un par se disocia en dos partículas individuales, conservando los átomos."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Initially there are 4 × 2 + 2 = 10 atoms; later there are 3 × 2 + 4 = 10 atoms. Dissociation changes the number of particles, not atoms.",
        "es": "Inicialmente hay 4 × 2 + 2 = 10 átomos; después hay 3 × 2 + 4 = 10 átomos. La disociación cambia el número de partículas, no de átomos."
      },
      "particles": true
    },
    {
      "id": "7.8-2",
      "topic": "7.8",
      "type": "mc",
      "prompt": {
        "en": "Repeated particle snapshots of A(g) ⇌ B(g) at equilibrium show stable average counts of A and B. What can still be occurring?",
        "es": "Imágenes sucesivas de partículas de A(g) ⇌ B(g) en equilibrio muestran números promedio estables de A y B. ¿Qué puede seguir ocurriendo?"
      },
      "choices": [
        {
          "text": {
            "en": "The forward rate remains larger indefinitely.",
            "es": "La velocidad directa permanece mayor indefinidamente."
          },
          "why": {
            "en": "A persistently larger forward rate would change the average composition.",
            "es": "Una velocidad directa persistentemente mayor cambiaría la composición promedio."
          }
        },
        {
          "text": {
            "en": "Individual particles interconvert in both directions.",
            "es": "Las partículas individuales se transforman entre sí en ambas direcciones."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only particles of B can react.",
            "es": "Solo pueden reaccionar las partículas de B."
          },
          "why": {
            "en": "Equilibrium requires balanced forward and reverse reactions.",
            "es": "El equilibrio requiere reacciones directa e inversa equilibradas."
          }
        },
        {
          "text": {
            "en": "Every particle keeps the same identity forever.",
            "es": "Cada partícula conserva la misma identidad para siempre."
          },
          "why": {
            "en": "Stable averages do not imply fixed identities of individual particles.",
            "es": "Los promedios estables no implican identidades fijas de las partículas individuales."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "A static particle drawing is a model of composition. Dynamic exchange can continue while average populations remain constant.",
        "es": "Un dibujo estático de partículas es un modelo de composición. El intercambio dinámico puede continuar mientras las poblaciones promedio permanecen constantes."
      }
    },
    {
      "id": "7.8-3",
      "topic": "7.8",
      "type": "mc",
      "prompt": {
        "en": "A particle model of A(g) ⇌ B(g) at equilibrium contains more B particles than A particles. What must be equal?",
        "es": "Un modelo de partículas de A(g) ⇌ B(g) en equilibrio contiene más partículas de B que de A. ¿Qué debe ser igual?"
      },
      "choices": [
        {
          "text": {
            "en": "The number of A and B particles",
            "es": "El número de partículas de A y B"
          },
          "why": {
            "en": "Unequal populations are compatible with equal reaction rates.",
            "es": "Las poblaciones distintas son compatibles con velocidades de reacción iguales."
          }
        },
        {
          "text": {
            "en": "The average lifetimes of A and B particles",
            "es": "Los tiempos de vida promedio de las partículas de A y B"
          },
          "why": {
            "en": "Different rate constants can give different average lifetimes while the overall reaction rates balance.",
            "es": "Las constantes de velocidad distintas pueden dar tiempos de vida promedio distintos mientras las velocidades globales de reacción se equilibran."
          }
        },
        {
          "text": {
            "en": "The rate constants for the two directions",
            "es": "Las constantes de velocidad de las dos direcciones"
          },
          "why": {
            "en": "Equal overall rates do not require equal rate constants when concentrations differ.",
            "es": "Las velocidades globales iguales no requieren constantes de velocidad iguales cuando las concentraciones difieren."
          }
        },
        {
          "text": {
            "en": "The average forward and reverse reaction rates",
            "es": "Las velocidades promedio de la reacción directa y la inversa"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Particle populations need not be equal. At dynamic equilibrium, the average number of forward events balances reverse events for the reaction as written.",
        "es": "Las poblaciones de partículas no tienen que ser iguales. En el equilibrio dinámico, el número promedio de eventos directos equilibra los eventos inversos para la reacción tal como está escrita."
      }
    },
    {
      "id": "7.8-4",
      "topic": "7.8",
      "type": "mc",
      "prompt": {
        "en": "For A<sub>2</sub>(g) ⇌ 2A(g), each particle in a fixed-volume model represents 0.100 M. It contains 4 A<sub>2</sub> and 2 A, and Kc = 0.400. Predict the net shift.",
        "es": "Para A<sub>2</sub>(g) ⇌ 2A(g), cada partícula en un modelo de volumen fijo representa 0.100 M. Contiene 4 A<sub>2</sub> y 2 A, y Kc = 0.400. Predice el desplazamiento neto."
      },
      "choices": [
        {
          "text": {
            "en": "Right, because Qc = 10.0 > Kc",
            "es": "A la derecha, porque Qc = 10.0 > Kc"
          },
          "why": {
            "en": "This inverts the quotient; a quotient greater than K would instead favor the reverse direction.",
            "es": "Esto invierte el cociente; un cociente mayor que K favorecería la dirección inversa."
          }
        },
        {
          "text": {
            "en": "Right, because Qc = 0.100 < Kc",
            "es": "A la derecha, porque Qc = 0.100 < Kc"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Left, because there are more pairs than singles",
            "es": "A la izquierda, porque hay más pares que partículas individuales"
          },
          "why": {
            "en": "Particle counts alone must be converted into the correctly powered concentration ratio.",
            "es": "Los números de partículas deben convertirse en la razón de concentraciones con las potencias correctas."
          }
        },
        {
          "text": {
            "en": "No shift, because atoms are conserved",
            "es": "Sin desplazamiento, porque se conservan los átomos"
          },
          "why": {
            "en": "Atom conservation holds away from equilibrium too; compare Q with K.",
            "es": "La conservación de átomos también se cumple fuera del equilibrio; compara Q con K."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "[A] = 0.200 M and [A<sub>2</sub>] = 0.400 M. Qc = 0.200<sup>2</sup>/0.400 = 0.100 < 0.400, so the reaction shifts right.",
        "es": "[A] = 0.200 M y [A<sub>2</sub>] = 0.400 M. Qc = 0.200<sup>2</sup>/0.400 = 0.100 < 0.400, así que la reacción se desplaza a la derecha."
      }
    },
    {
      "id": "7.8-5",
      "topic": "7.8",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g), an equilibrium model has 2 A particles and 6 B particles. Each represents 0.100 M. Calculate Kc to three significant figures, using no units.",
        "es": "Para A(g) ⇌ B(g), un modelo en equilibrio tiene 2 partículas de A y 6 de B. Cada una representa 0.100 M. Calcula Kc con tres cifras significativas, usando sin unidades."
      },
      "value": 3,
      "display": "3.00",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "[B]/[A] = 0.600/0.200 = 3.00. In this model the shared concentration-per-particle factor cancels.",
        "es": "[B]/[A] = 0.600/0.200 = 3.00. En este modelo se cancela el factor compartido de concentración por partícula."
      }
    },
    {
      "id": "7.8-6",
      "topic": "7.8",
      "type": "numeric",
      "prompt": {
        "en": "A model for A<sub>2</sub>(g) ⇌ 2A(g) starts with exactly 5 pairs and no singles. Later exactly 3 pairs remain. How many single A particles are present? Choose count.",
        "es": "Un modelo para A<sub>2</sub>(g) ⇌ 2A(g) empieza con exactamente 5 pares y ninguna partícula individual. Después quedan exactamente 3 pares. ¿Cuántas partículas individuales de A hay? Elige conteo."
      },
      "value": 4,
      "display": "4",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "The net loss of 2 pairs produces 2 × 2 = 4 singles. Both snapshots contain 10 atoms. This modeled count is exact.",
        "es": "La pérdida neta de 2 pares produce 2 × 2 = 4 partículas individuales. Ambas imágenes contienen 10 átomos. Este conteo del modelo es exacto."
      }
    },
    {
      "id": "7.9-1",
      "topic": "7.9",
      "type": "mc",
      "prompt": {
        "en": "For A(g) ⇌ B(g) at fixed temperature and volume, the model graph shows only [B] jumping upward at a stress. Then [B] falls gradually and [A] rises to new plateaus. What perturbation fits?",
        "es": "Para A(g) ⇌ B(g) a temperatura y volumen fijos, la gráfica modelo muestra que solo [B] salta hacia arriba ante una perturbación. Luego [B] baja gradualmente y [A] sube a nuevas mesetas. ¿Qué perturbación corresponde?"
      },
      "choices": [
        {
          "text": {
            "en": "A catalyst was added.",
            "es": "Se agregó un catalizador."
          },
          "why": {
            "en": "A catalyst does not make a concentration jump or change equilibrium composition.",
            "es": "Un catalizador no produce un salto de concentración ni cambia la composición en el equilibrio."
          }
        },
        {
          "text": {
            "en": "B was added, causing a shift to the left.",
            "es": "Se agregó B, causando un desplazamiento a la izquierda."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A was added, causing a shift to the right.",
            "es": "Se agregó A, causando un desplazamiento a la derecha."
          },
          "why": {
            "en": "Adding A would give the immediate jump in [A], not [B].",
            "es": "Agregar A daría el salto inmediato en [A], no en [B]."
          }
        },
        {
          "text": {
            "en": "The volume was halved.",
            "es": "El volumen se redujo a la mitad."
          },
          "why": {
            "en": "Compression would immediately increase both gas concentrations.",
            "es": "La compresión aumentaría de inmediato ambas concentraciones gaseosas."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Le Châtelier’s principle predicts that adding product favors its net consumption. The immediate jump records the addition; the gradual changes show the shift left.",
        "es": "El principio de Le Châtelier predice que agregar producto favorece su consumo neto. El salto inmediato registra la adición; los cambios graduales muestran el desplazamiento a la izquierda."
      },
      "stress": true
    },
    {
      "id": "7.9-2",
      "topic": "7.9",
      "type": "mc",
      "prompt": {
        "en": "At fixed temperature, an equilibrium mixture of N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g) is compressed. What happens?",
        "es": "A temperatura fija, se comprime una mezcla en equilibrio de N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g). ¿Qué ocurre?"
      },
      "choices": [
        {
          "text": {
            "en": "It shifts left; K stays unchanged.",
            "es": "Se desplaza a la izquierda; K permanece sin cambio."
          },
          "why": {
            "en": "Compression favors the side with fewer gaseous moles, which is the product side here.",
            "es": "La compresión favorece el lado con menos moles gaseosos, que aquí es el de los productos."
          }
        },
        {
          "text": {
            "en": "It shifts right because K increases.",
            "es": "Se desplaza a la derecha porque K aumenta."
          },
          "why": {
            "en": "Changing volume at fixed temperature changes Q, not K.",
            "es": "Cambiar el volumen a temperatura fija cambia Q, no K."
          }
        },
        {
          "text": {
            "en": "It cannot shift because K is fixed.",
            "es": "No puede desplazarse porque K está fija."
          },
          "why": {
            "en": "A fixed K constrains the new equilibrium; it does not prevent composition changes after a stress.",
            "es": "Una K fija restringe el nuevo equilibrio; no impide cambios de composición después de una perturbación."
          }
        },
        {
          "text": {
            "en": "It shifts right; K stays unchanged.",
            "es": "Se desplaza a la derecha; K permanece sin cambio."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Compression favors the product side with 2 gas moles rather than 4. Temperature is unchanged, so K is unchanged.",
        "es": "La compresión favorece el lado de los productos con 2 moles gaseosos en lugar de 4. La temperatura no cambia, así que K no cambia."
      }
    },
    {
      "id": "7.9-3",
      "topic": "7.9",
      "type": "mc",
      "prompt": {
        "en": "The forward direction of A(g) ⇌ B(g) is exothermic. An equilibrium mixture is heated. Which response is expected?",
        "es": "La dirección directa de A(g) ⇌ B(g) es exotérmica. Se calienta una mezcla en equilibrio. ¿Qué respuesta se espera?"
      },
      "choices": [
        {
          "text": {
            "en": "No shift because all rates increase equally",
            "es": "Sin desplazamiento porque todas las velocidades aumentan por igual"
          },
          "why": {
            "en": "Temperature does not generally multiply forward and reverse rates by the same factor.",
            "es": "La temperatura generalmente no multiplica las velocidades directa e inversa por el mismo factor."
          }
        },
        {
          "text": {
            "en": "A shift left and a smaller K",
            "es": "Un desplazamiento a la izquierda y una K menor"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A shift right and a larger K",
            "es": "Un desplazamiento a la derecha y una K mayor"
          },
          "why": {
            "en": "Heating favors the endothermic reverse direction of this exothermic forward reaction.",
            "es": "Calentar favorece la dirección inversa endotérmica de esta reacción directa exotérmica."
          }
        },
        {
          "text": {
            "en": "A shift left with no change in K",
            "es": "Un desplazamiento a la izquierda sin cambio en K"
          },
          "why": {
            "en": "Temperature changes can change K, unlike concentration or volume stresses at fixed temperature.",
            "es": "Los cambios de temperatura pueden cambiar K, a diferencia de perturbaciones de concentración o volumen a temperatura fija."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Heating favors heat absorption, the reverse direction here. Products become less favored, so K decreases.",
        "es": "Calentar favorece la absorción de calor, aquí la dirección inversa. Los productos se favorecen menos, así que K disminuye."
      }
    },
    {
      "id": "7.9-4",
      "topic": "7.9",
      "type": "mc",
      "prompt": {
        "en": "Which two changes leave both K and the equilibrium concentrations of the reacting species unchanged for ideal gases at fixed temperature and volume?",
        "es": "¿Qué dos cambios dejan sin cambio tanto K como las concentraciones en el equilibrio de las especies que reaccionan para gases ideales a temperatura y volumen fijos?"
      },
      "choices": [
        {
          "text": {
            "en": "Adding reactant or removing product",
            "es": "Agregar reactivo o retirar producto"
          },
          "why": {
            "en": "These concentration stresses change Q and usually produce a shift.",
            "es": "Estas perturbaciones de concentración cambian Q y generalmente producen un desplazamiento."
          }
        },
        {
          "text": {
            "en": "Adding a catalyst or heating an exothermic reaction",
            "es": "Agregar un catalizador o calentar una reacción exotérmica"
          },
          "why": {
            "en": "Heating changes K and the equilibrium position; a catalyst does not.",
            "es": "Calentar cambia K y la posición de equilibrio; un catalizador no."
          }
        },
        {
          "text": {
            "en": "Adding an inert gas at constant total pressure or compressing a gas mixture",
            "es": "Agregar un gas inerte a presión total constante o comprimir una mezcla gaseosa"
          },
          "why": {
            "en": "Both can change reacting partial pressures; the constant-volume condition is essential for the inert-gas conclusion.",
            "es": "Ambos pueden cambiar las presiones parciales de los reactivos; la condición de volumen constante es esencial para la conclusión sobre el gas inerte."
          }
        },
        {
          "text": {
            "en": "Adding a catalyst or adding an inert gas",
            "es": "Agregar un catalizador o agregar un gas inerte"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "A catalyst changes rates without changing K. At fixed temperature and volume, an inert gas changes total pressure but not reacting partial pressures, so there is no shift.",
        "es": "Un catalizador cambia velocidades sin cambiar K. A temperatura y volumen fijos, un gas inerte cambia la presión total pero no las presiones parciales de las especies que reaccionan, así que no hay desplazamiento."
      }
    },
    {
      "id": "7.9-5",
      "topic": "7.9",
      "type": "numeric",
      "prompt": {
        "en": "For A(g) ⇌ B(g), Kc = 2.00 at fixed temperature. After adding A and allowing equilibrium to return, [A] = 0.150 M. Find final [B].",
        "es": "Para A(g) ⇌ B(g), Kc = 2.00 a temperatura fija. Después de agregar A y permitir que vuelva el equilibrio, [A] = 0.150 M. Calcula [B] final."
      },
      "value": 0.3,
      "display": "0.300",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "Kc is unchanged by adding A at fixed temperature. At the new equilibrium, [B] = Kc[A] = 2.00 × 0.150 = 0.300 M.",
        "es": "Kc no cambia al agregar A a temperatura fija. En el nuevo equilibrio, [B] = Kc[A] = 2.00 × 0.150 = 0.300 M."
      }
    },
    {
      "id": "7.9-6",
      "topic": "7.9",
      "type": "numeric",
      "prompt": {
        "en": "For H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), an equilibrium mixture has Kp = 9.00. At fixed temperature its volume is halved, doubling every reacting partial pressure. Calculate Qp immediately afterward, using no units.",
        "es": "Para H<sub>2</sub>(g) + I<sub>2</sub>(g) ⇌ 2HI(g), una mezcla en equilibrio tiene Kp = 9.00. A temperatura fija se reduce su volumen a la mitad, duplicando cada presión parcial de las especies que reaccionan. Calcula Qp inmediatamente después, usando sin unidades."
      },
      "value": 9,
      "display": "9.00",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Qp is multiplied by 2<sup>2</sup>/(2 × 2) = 1. Thus Qp = 9.00 = Kp and there is no shift. Equal total gas coefficients make compression cancel from this quotient.",
        "es": "Qp se multiplica por 2<sup>2</sup>/(2 × 2) = 1. Así, Qp = 9.00 = Kp y no hay desplazamiento. Los coeficientes gaseosos totales iguales hacen que la compresión se cancele en este cociente."
      }
    },
    {
      "id": "7.10-1",
      "topic": "7.10",
      "type": "mc",
      "prompt": {
        "en": "A(g) ⇌ 2B(g) starts at equilibrium. At fixed temperature the volume is halved. How does Q compare with K immediately after compression?",
        "es": "A(g) ⇌ 2B(g) empieza en equilibrio. A temperatura fija se reduce el volumen a la mitad. ¿Cómo se compara Q con K inmediatamente después de la compresión?"
      },
      "choices": [
        {
          "text": {
            "en": "Q < K, so the reaction shifts right.",
            "es": "Q < K, así que la reacción se desplaza a la derecha."
          },
          "why": {
            "en": "Doubling both concentrations multiplies [B] squared more than [A].",
            "es": "Duplicar ambas concentraciones multiplica más [B] al cuadrado que [A]."
          }
        },
        {
          "text": {
            "en": "Q = K because every concentration doubles.",
            "es": "Q = K porque cada concentración se duplica."
          },
          "why": {
            "en": "The unequal exponents prevent the concentration factors from canceling.",
            "es": "Los exponentes distintos impiden que se cancelen los factores de concentración."
          }
        },
        {
          "text": {
            "en": "K doubles, so no shift occurs.",
            "es": "K se duplica, así que no ocurre desplazamiento."
          },
          "why": {
            "en": "Compression at fixed temperature changes Q, not K.",
            "es": "La compresión a temperatura fija cambia Q, no K."
          }
        },
        {
          "text": {
            "en": "Q > K, so the reaction shifts left.",
            "es": "Q > K, así que la reacción se desplaza a la izquierda."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Qc = [B]<sup>2</sup>/[A] is multiplied by 2<sup>2</sup>/2 = 2. Qc exceeds Kc, so B is consumed in a shift left.",
        "es": "Qc = [B]<sup>2</sup>/[A] se multiplica por 2<sup>2</sup>/2 = 2. Qc supera a Kc, así que B se consume en un desplazamiento a la izquierda."
      }
    },
    {
      "id": "7.10-2",
      "topic": "7.10",
      "type": "mc",
      "prompt": {
        "en": "An ideal-gas mixture of N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g) is at equilibrium. Inert gas is added at constant temperature and constant total pressure, allowing expansion. What happens?",
        "es": "Una mezcla de gases ideales de N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g) está en equilibrio. Se agrega gas inerte a temperatura y presión total constantes, permitiendo la expansión. ¿Qué ocurre?"
      },
      "choices": [
        {
          "text": {
            "en": "Kp increases because the total number of gas particles increases.",
            "es": "Kp aumenta porque aumenta el número total de partículas gaseosas."
          },
          "why": {
            "en": "Kp depends on temperature, which stays fixed.",
            "es": "Kp depende de la temperatura, que permanece fija."
          }
        },
        {
          "text": {
            "en": "Qp falls below Kp and the reaction shifts right.",
            "es": "Qp baja por debajo de Kp y la reacción se desplaza a la derecha."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "No shift, because inert gas never affects equilibrium.",
            "es": "Sin desplazamiento, porque un gas inerte nunca afecta el equilibrio."
          },
          "why": {
            "en": "No shift is guaranteed at constant volume, but the volume here increases.",
            "es": "La ausencia de desplazamiento se garantiza a volumen constante, pero aquí el volumen aumenta."
          }
        },
        {
          "text": {
            "en": "Qp rises above Kp and the reaction shifts left.",
            "es": "Qp sube por encima de Kp y la reacción se desplaza a la izquierda."
          },
          "why": {
            "en": "Expansion lowers all reacting pressures; the squared numerator falls faster than the denominator.",
            "es": "La expansión reduce todas las presiones de las especies que reaccionan; el numerador al cuadrado baja más rápido que el denominador."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Expansion reduces each reacting partial pressure by the same factor below unity. Qp = P(NO<sub>2</sub>)<sup>2</sup>/P(N<sub>2</sub>O<sub>4</sub>) decreases, so the shift favors more gas moles.",
        "es": "La expansión reduce cada presión parcial de las especies que reaccionan por el mismo factor menor que la unidad. Qp = P(NO<sub>2</sub>)<sup>2</sup>/P(N<sub>2</sub>O<sub>4</sub>) disminuye, así que el desplazamiento favorece más moles gaseosos."
      }
    },
    {
      "id": "7.10-3",
      "topic": "7.10",
      "type": "mc",
      "prompt": {
        "en": "At equilibrium for A(aq) ⇌ B(aq), A is added at constant temperature with negligible volume change. What happens immediately to Q?",
        "es": "En el equilibrio para A(aq) ⇌ B(aq), se agrega A a temperatura constante con cambio de volumen despreciable. ¿Qué ocurre inmediatamente con Q?"
      },
      "choices": [
        {
          "text": {
            "en": "Q increases above K, causing a shift left.",
            "es": "Q aumenta por encima de K, causando un desplazamiento a la izquierda."
          },
          "why": {
            "en": "A is in the denominator; increasing it lowers Q.",
            "es": "A está en el denominador; aumentarla reduce Q."
          }
        },
        {
          "text": {
            "en": "Q stays equal to K at every instant.",
            "es": "Q permanece igual a K en todo instante."
          },
          "why": {
            "en": "The instantaneous addition disturbs the equilibrium ratio before the reaction responds.",
            "es": "La adición instantánea perturba la razón de equilibrio antes de que responda la reacción."
          }
        },
        {
          "text": {
            "en": "K decreases to match the new Q.",
            "es": "K disminuye para igualar el nuevo Q."
          },
          "why": {
            "en": "At fixed temperature, K remains unchanged and concentrations adjust.",
            "es": "A temperatura fija, K permanece sin cambio y las concentraciones se ajustan."
          }
        },
        {
          "text": {
            "en": "Q decreases below K, causing a shift right.",
            "es": "Q disminuye por debajo de K, causando un desplazamiento a la derecha."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Q = [B]/[A]. Increasing the denominator makes Q < K, so net forward reaction restores equilibrium.",
        "es": "Q = [B]/[A]. Aumentar el denominador hace Q < K, así que la reacción directa neta restaura el equilibrio."
      }
    },
    {
      "id": "7.10-4",
      "topic": "7.10",
      "type": "mc",
      "prompt": {
        "en": "CaCO<sub>3</sub>(s) ⇌ CaO(s) + CO<sub>2</sub>(g) is at equilibrium at fixed temperature and gas volume. Some CaCO<sub>3</sub> is removed, but both pure solids remain. What happens?",
        "es": "CaCO<sub>3</sub>(s) ⇌ CaO(s) + CO<sub>2</sub>(g) está en equilibrio a temperatura y volumen gaseoso fijos. Se retira algo de CaCO<sub>3</sub>, pero quedan ambos sólidos puros. ¿Qué ocurre?"
      },
      "choices": [
        {
          "text": {
            "en": "The mixture shifts right to replace solid reactant.",
            "es": "La mezcla se desplaza a la derecha para reemplazar el reactivo sólido."
          },
          "why": {
            "en": "The forward direction consumes that solid, and removing some while it remains does not disturb Qp.",
            "es": "La dirección directa consume ese sólido, y retirar una parte mientras queda sólido no perturba Qp."
          }
        },
        {
          "text": {
            "en": "Qp and Kp remain equal, so there is no shift.",
            "es": "Qp y Kp permanecen iguales, así que no hay desplazamiento."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Qp decreases because solid reactant was removed.",
            "es": "Qp disminuye porque se retiró reactivo sólido."
          },
          "why": {
            "en": "The amount of a remaining pure solid does not appear in Qp.",
            "es": "La cantidad de un sólido puro que permanece no aparece en Qp."
          }
        },
        {
          "text": {
            "en": "Kp decreases with the mass of solid.",
            "es": "Kp disminuye con la masa de sólido."
          },
          "why": {
            "en": "Kp is not proportional to the amount of pure solid.",
            "es": "Kp no es proporcional a la cantidad de sólido puro."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Qp = P(CO<sub>2</sub>). Removing some pure solid without exhausting either solid leaves the gas pressure and Qp unchanged.",
        "es": "Qp = P(CO<sub>2</sub>). Retirar una parte del sólido puro sin agotar ninguno de los sólidos deja sin cambio la presión del gas y Qp."
      }
    },
    {
      "id": "7.10-5",
      "topic": "7.10",
      "type": "numeric",
      "prompt": {
        "en": "For N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g), immediately after a perturbation [NO<sub>2</sub>] = 0.200 M and [N<sub>2</sub>O<sub>4</sub>] = 0.100 M. Kc = 0.200. Calculate Qc, using no units, then compare it with Kc.",
        "es": "Para N<sub>2</sub>O<sub>4</sub>(g) ⇌ 2NO<sub>2</sub>(g), inmediatamente después de una perturbación [NO<sub>2</sub>] = 0.200 M y [N<sub>2</sub>O<sub>4</sub>] = 0.100 M. Kc = 0.200. Calcula Qc, usando sin unidades, y luego compáralo con Kc."
      },
      "value": 0.4000000000000001,
      "display": "0.400",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "Qc = 0.200<sup>2</sup>/0.100 = 0.400. Since 0.400 > 0.200, Qc > Kc and the net shift is left.",
        "es": "Qc = 0.200<sup>2</sup>/0.100 = 0.400. Como 0.400 > 0.200, Qc > Kc y el desplazamiento neto es a la izquierda."
      }
    },
    {
      "id": "7.10-6",
      "topic": "7.10",
      "type": "numeric",
      "prompt": {
        "en": "For A(aq) ⇌ B(aq) at fixed temperature, Kc = 3.00. After a stress [A] = 0.400 M and [B] = 0.600 M. Calculate Qc, using no units, then predict the shift.",
        "es": "Para A(aq) ⇌ B(aq) a temperatura fija, Kc = 3.00. Después de una perturbación [A] = 0.400 M y [B] = 0.600 M. Calcula Qc, usando sin unidades, y luego predice el desplazamiento."
      },
      "value": 1.4999999999999998,
      "display": "1.50",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Qc = [B]/[A] = 0.600/0.400 = 1.50 < 3.00. The reaction shifts right to form more B until Qc = Kc.",
        "es": "Qc = [B]/[A] = 0.600/0.400 = 1.50 < 3.00. La reacción se desplaza a la derecha para formar más B hasta que Qc = Kc."
      }
    },
    {
      "id": "7.11-1",
      "topic": "7.11",
      "type": "mc",
      "prompt": {
        "en": "Which solubility product expression corresponds to AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq)?",
        "es": "¿Qué expresión del producto de solubilidad corresponde a AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq)?"
      },
      "choices": [
        {
          "text": {
            "en": "Ksp = 1/([Ag<sup>+</sup>][Cl<sup>−</sup>])",
            "es": "Ksp = 1/([Ag<sup>+</sup>][Cl<sup>−</sup>])"
          },
          "why": {
            "en": "Ksp is written for dissolution, so dissolved ions are products in the numerator.",
            "es": "Ksp se escribe para la disolución, así que los iones disueltos son productos en el numerador."
          }
        },
        {
          "text": {
            "en": "Ksp = [Ag<sup>+</sup>][Cl<sup>−</sup>]",
            "es": "Ksp = [Ag<sup>+</sup>][Cl<sup>−</sup>]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Ksp = [Ag<sup>+</sup>][Cl<sup>−</sup>]/[AgCl]",
            "es": "Ksp = [Ag<sup>+</sup>][Cl<sup>−</sup>]/[AgCl]"
          },
          "why": {
            "en": "The pure solid is omitted from the equilibrium expression.",
            "es": "El sólido puro se omite de la expresión de equilibrio."
          }
        },
        {
          "text": {
            "en": "Ksp = [Ag<sup>+</sup>] + [Cl<sup>−</sup>]",
            "es": "Ksp = [Ag<sup>+</sup>] + [Cl<sup>−</sup>]"
          },
          "why": {
            "en": "The ion terms multiply rather than add.",
            "es": "Los términos iónicos se multiplican en lugar de sumarse."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The solubility product (Ksp) multiplies equilibrium ion concentrations raised to their coefficients. Pure solid AgCl is omitted.",
        "es": "El producto de solubilidad (Ksp) multiplica las concentraciones iónicas en el equilibrio elevadas a sus coeficientes. Se omite el sólido puro AgCl."
      }
    },
    {
      "id": "7.11-2",
      "topic": "7.11",
      "type": "mc",
      "prompt": {
        "en": "For CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq) dissolving in pure water with no side reactions, which relation gives molar solubility s?",
        "es": "Para CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq) disolviéndose en agua pura sin reacciones secundarias, ¿qué relación da la solubilidad molar s?"
      },
      "choices": [
        {
          "text": {
            "en": "Ksp = s<sup>2</sup>",
            "es": "Ksp = s<sup>2</sup>"
          },
          "why": {
            "en": "That relation fits a salt producing equal concentrations of two ions, not this stoichiometry.",
            "es": "Esa relación corresponde a una sal que produce concentraciones iguales de dos iones, no a esta estequiometría."
          }
        },
        {
          "text": {
            "en": "Ksp = 2s<sup>2</sup>",
            "es": "Ksp = 2s<sup>2</sup>"
          },
          "why": {
            "en": "The fluoride term must be squared because of its balanced coefficient.",
            "es": "El término de fluoruro debe elevarse al cuadrado por su coeficiente balanceado."
          }
        },
        {
          "text": {
            "en": "Ksp = s<sup>3</sup>",
            "es": "Ksp = s<sup>3</sup>"
          },
          "why": {
            "en": "The fluoride concentration is twice the dissolved salt concentration.",
            "es": "La concentración de fluoruro es el doble de la concentración de sal disuelta."
          }
        },
        {
          "text": {
            "en": "Ksp = s(2s)<sup>2</sup> = 4s<sup>3</sup>",
            "es": "Ksp = s(2s)<sup>2</sup> = 4s<sup>3</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "[Ca<sup>2+</sup>] = s and [F<sup>−</sup>] = 2s. Substitution into Ksp = [Ca<sup>2+</sup>][F<sup>−</sup>]<sup>2</sup> gives 4s<sup>3</sup>.",
        "es": "[Ca<sup>2+</sup>] = s y [F<sup>−</sup>] = 2s. Sustituir en Ksp = [Ca<sup>2+</sup>][F<sup>−</sup>]<sup>2</sup> da 4s<sup>3</sup>."
      }
    },
    {
      "id": "7.11-3",
      "topic": "7.11",
      "type": "mc",
      "prompt": {
        "en": "After mixing and before precipitation, [Ag<sup>+</sup>] = 2.0 × 10<sup>−5</sup> M and [Cl<sup>−</sup>] = 1.0 × 10<sup>−5</sup> M. Ksp for AgCl is 1.8 × 10<sup>−10</sup>. What is predicted for AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq)?",
        "es": "Después de mezclar y antes de la precipitación, [Ag<sup>+</sup>] = 2.0 × 10<sup>−5</sup> M y [Cl<sup>−</sup>] = 1.0 × 10<sup>−5</sup> M. Ksp de AgCl es 1.8 × 10<sup>−10</sup>. ¿Qué se predice para AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq)?"
      },
      "choices": [
        {
          "text": {
            "en": "Precipitation increases Ksp until it matches Qsp.",
            "es": "La precipitación aumenta Ksp hasta igualar Qsp."
          },
          "why": {
            "en": "At fixed temperature, precipitation lowers dissolved ion concentrations while Ksp stays fixed.",
            "es": "A temperatura fija, la precipitación reduce las concentraciones de iones disueltos mientras Ksp permanece fija."
          }
        },
        {
          "text": {
            "en": "A precipitate forms because Qsp > Ksp.",
            "es": "Se forma un precipitado porque Qsp > Ksp."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "No precipitate forms because Qsp < Ksp.",
            "es": "No se forma precipitado porque Qsp < Ksp."
          },
          "why": {
            "en": "The ion product exceeds the supplied solubility product.",
            "es": "El producto iónico supera al producto de solubilidad dado."
          }
        },
        {
          "text": {
            "en": "The solution is exactly at equilibrium because Qsp = Ksp.",
            "es": "La solución está exactamente en equilibrio porque Qsp = Ksp."
          },
          "why": {
            "en": "The computed ion product is larger, not equal to Ksp.",
            "es": "El producto iónico calculado es mayor, no igual a Ksp."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Qsp = (2.0 × 10<sup>−5</sup>)(1.0 × 10<sup>−5</sup>) = 2.0 × 10<sup>−10</sup> > 1.8 × 10<sup>−10</sup>. AgCl precipitates until the ion product returns to Ksp.",
        "es": "Qsp = (2.0 × 10<sup>−5</sup>)(1.0 × 10<sup>−5</sup>) = 2.0 × 10<sup>−10</sup> > 1.8 × 10<sup>−10</sup>. AgCl forma un precipitado hasta que el producto iónico vuelve a Ksp."
      }
    },
    {
      "id": "7.11-4",
      "topic": "7.11",
      "type": "mc",
      "prompt": {
        "en": "For a sparingly soluble salt in an ideal dilute mixture at fixed temperature, Qsp < Ksp and no solid is present. Which prediction is correct?",
        "es": "Para una sal poco soluble en una mezcla ideal diluida a temperatura fija, Qsp < Ksp y no hay sólido presente. ¿Qué predicción es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "A precipitate must form immediately.",
            "es": "Debe formarse un precipitado de inmediato."
          },
          "why": {
            "en": "Precipitation is favored when the ion product exceeds Ksp.",
            "es": "La precipitación se favorece cuando el producto iónico supera a Ksp."
          }
        },
        {
          "text": {
            "en": "The solution is already saturated.",
            "es": "La solución ya está saturada."
          },
          "why": {
            "en": "A saturated solution in equilibrium with solid has Qsp equal to Ksp.",
            "es": "Una solución saturada en equilibrio con sólido tiene Qsp igual a Ksp."
          }
        },
        {
          "text": {
            "en": "Ksp must fall until it equals Qsp.",
            "es": "Ksp debe bajar hasta igualar Qsp."
          },
          "why": {
            "en": "Ksp is fixed at the stated temperature; the present mixture can be unsaturated.",
            "es": "Ksp está fija a la temperatura dada; la mezcla presente puede no estar saturada."
          }
        },
        {
          "text": {
            "en": "No precipitate forms; added salt could dissolve further.",
            "es": "No se forma precipitado; la sal agregada podría disolverse más."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Qsp < Ksp indicates an unsaturated mixture. More salt can dissolve if solid is added, until saturation or exhaustion of the solid.",
        "es": "Qsp < Ksp indica una mezcla no saturada. Puede disolverse más sal si se agrega sólido, hasta la saturación o el agotamiento del sólido."
      }
    },
    {
      "id": "7.11-5",
      "topic": "7.11",
      "type": "numeric",
      "prompt": {
        "en": "For AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), Ksp = 1.80 × 10<sup>−10</sup>. Find molar solubility in pure water. Assume ideal dilute behavior and no side reactions.",
        "es": "Para AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), Ksp = 1.80 × 10<sup>−10</sup>. Calcula la solubilidad molar en agua pura. Supón comportamiento ideal diluido y ninguna reacción secundaria."
      },
      "value": 1.3416407864998738e-05,
      "display": "1.34e-5",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5e-08,
      "explanation": {
        "en": "Both ion concentrations equal s, so Ksp = s<sup>2</sup>. s = √(1.80 × 10<sup>−10</sup>) = 1.34 × 10<sup>−5</sup> M. Solubility is a concentration, not Ksp itself.",
        "es": "Ambas concentraciones iónicas son iguales a s, así que Ksp = s<sup>2</sup>. s = √(1.80 × 10<sup>−10</sup>) = 1.34 × 10<sup>−5</sup> M. La solubilidad es una concentración, no Ksp misma."
      }
    },
    {
      "id": "7.11-6",
      "topic": "7.11",
      "type": "numeric",
      "prompt": {
        "en": "For CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq), Ksp = 3.20 × 10<sup>−11</sup>. Find molar solubility in pure water, assuming ideal dilute behavior and no side reactions.",
        "es": "Para CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq), Ksp = 3.20 × 10<sup>−11</sup>. Calcula la solubilidad molar en agua pura, suponiendo comportamiento ideal diluido y ninguna reacción secundaria."
      },
      "value": 0.0002000000000000001,
      "display": "2.00e-4",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5e-07,
      "explanation": {
        "en": "Ksp = s(2s)<sup>2</sup> = 4s<sup>3</sup>. Thus s = (3.20 × 10<sup>−11</sup>/4)<sup>1/3</sup> = 2.00 × 10<sup>−4</sup> M. Fluoride concentration is twice this solubility.",
        "es": "Ksp = s(2s)<sup>2</sup> = 4s<sup>3</sup>. Entonces s = (3.20 × 10<sup>−11</sup>/4)<sup>1/3</sup> = 2.00 × 10<sup>−4</sup> M. La concentración de fluoruro es el doble de esta solubilidad."
      }
    },
    {
      "id": "7.12-1",
      "topic": "7.12",
      "type": "mc",
      "prompt": {
        "en": "NaCl is added to a saturated AgCl solution with excess AgCl(s) at fixed temperature and negligible volume change. For AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), what is the common-ion effect?",
        "es": "Se agrega NaCl a una solución saturada de AgCl con exceso de AgCl(s) a temperatura fija y cambio de volumen despreciable. Para AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), ¿cuál es el efecto del ion común?"
      },
      "choices": [
        {
          "text": {
            "en": "AgCl molar solubility increases because more ions are present.",
            "es": "La solubilidad molar de AgCl aumenta porque hay más iones."
          },
          "why": {
            "en": "Added chloride raises Qsp, favoring precipitation rather than further dissolution.",
            "es": "El cloruro agregado aumenta Qsp, favoreciendo la precipitación en lugar de más disolución."
          }
        },
        {
          "text": {
            "en": "Ksp decreases because chloride was added.",
            "es": "Ksp disminuye porque se agregó cloruro."
          },
          "why": {
            "en": "At fixed temperature a concentration stress changes Qsp, not Ksp.",
            "es": "A temperatura fija una perturbación de concentración cambia Qsp, no Ksp."
          }
        },
        {
          "text": {
            "en": "Only sodium enters Ksp, so silver concentration increases.",
            "es": "Solo el sodio entra en Ksp, así que aumenta la concentración de plata."
          },
          "why": {
            "en": "Sodium is not in the AgCl dissolution equation; chloride is the common ion.",
            "es": "El sodio no está en la ecuación de disolución de AgCl; el cloruro es el ion común."
          }
        },
        {
          "text": {
            "en": "AgCl molar solubility decreases while Ksp stays unchanged.",
            "es": "La solubilidad molar de AgCl disminuye mientras Ksp permanece sin cambio."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The common ion Cl<sup>−</sup> increases Qsp immediately. The equilibrium shifts left, forming precipitate and lowering dissolved Ag<sup>+</sup>. Ksp stays fixed.",
        "es": "El ion común Cl<sup>−</sup> aumenta Qsp de inmediato. El equilibrio se desplaza a la izquierda, formando precipitado y reduciendo Ag<sup>+</sup> disuelto. Ksp permanece fija."
      }
    },
    {
      "id": "7.12-2",
      "topic": "7.12",
      "type": "mc",
      "prompt": {
        "en": "NaNO<sub>3</sub> is added at negligible volume change to an AgCl solubility system. Assume ideal dilute behavior, fixed temperature and no side reactions. Which conclusion follows?",
        "es": "Se agrega NaNO<sub>3</sub> con cambio de volumen despreciable a un sistema de solubilidad de AgCl. Supón comportamiento ideal diluido, temperatura fija y ninguna reacción secundaria. ¿Qué conclusión se deduce?"
      },
      "choices": [
        {
          "text": {
            "en": "NaNO<sub>3</sub> raises Ksp for AgCl.",
            "es": "NaNO<sub>3</sub> aumenta Ksp de AgCl."
          },
          "why": {
            "en": "The supplied fixed-temperature ideal model keeps Ksp unchanged.",
            "es": "El modelo ideal dado a temperatura fija mantiene Ksp sin cambio."
          }
        },
        {
          "text": {
            "en": "There is no common-ion decrease in AgCl solubility.",
            "es": "No hay disminución de la solubilidad de AgCl por ion común."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Nitrate is the common ion in AgCl.",
            "es": "El nitrato es el ion común en AgCl."
          },
          "why": {
            "en": "AgCl dissolves into silver and chloride ions, not nitrate.",
            "es": "AgCl se disuelve en iones plata y cloruro, no nitrato."
          }
        },
        {
          "text": {
            "en": "Every added soluble salt lowers solubility by the common-ion effect.",
            "es": "Toda sal soluble agregada reduce la solubilidad por el efecto del ion común."
          },
          "why": {
            "en": "A common-ion effect requires an ion shared with the dissolution equilibrium.",
            "es": "El efecto del ion común requiere un ion compartido con el equilibrio de disolución."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Na<sup>+</sup> and NO<sub>3</sub><sup>−</sup> are not common ions for AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq). Under the stated ideal assumptions there is no common-ion decrease.",
        "es": "Na<sup>+</sup> y NO<sub>3</sub><sup>−</sup> no son iones comunes para AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq). Con las suposiciones ideales dadas no hay disminución por ion común."
      }
    },
    {
      "id": "7.12-3",
      "topic": "7.12",
      "type": "mc",
      "prompt": {
        "en": "CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq) dissolves into a solution initially containing 0.100 M F<sup>−</sup> and no Ca<sup>2+</sup>. Which exact equation uses molar solubility s?",
        "es": "CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq) se disuelve en una solución que inicialmente contiene 0.100 M de F<sup>−</sup> y nada de Ca<sup>2+</sup>. ¿Qué ecuación exacta usa la solubilidad molar s?"
      },
      "choices": [
        {
          "text": {
            "en": "Ksp = 4s<sup>3</sup>",
            "es": "Ksp = 4s<sup>3</sup>"
          },
          "why": {
            "en": "This omits the fluoride already supplied by the common-ion solution.",
            "es": "Esto omite el fluoruro ya aportado por la solución con ion común."
          }
        },
        {
          "text": {
            "en": "Ksp = s(0.100 + s)<sup>2</sup>",
            "es": "Ksp = s(0.100 + s)<sup>2</sup>"
          },
          "why": {
            "en": "Each dissolved formula unit adds twice its concentration as fluoride.",
            "es": "Cada unidad fórmula disuelta agrega el doble de su concentración como fluoruro."
          }
        },
        {
          "text": {
            "en": "Ksp = s(0.100 + 2s)",
            "es": "Ksp = s(0.100 + 2s)"
          },
          "why": {
            "en": "The fluoride concentration must be raised to its balanced coefficient.",
            "es": "La concentración de fluoruro debe elevarse a su coeficiente balanceado."
          }
        },
        {
          "text": {
            "en": "Ksp = s(0.100 + 2s)<sup>2</sup>",
            "es": "Ksp = s(0.100 + 2s)<sup>2</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The equilibrium concentrations are [Ca<sup>2+</sup>] = s and [F<sup>−</sup>] = 0.100 + 2s. The common ion contributes an initial term as well as the dissolution change.",
        "es": "Las concentraciones en el equilibrio son [Ca<sup>2+</sup>] = s y [F<sup>−</sup>] = 0.100 + 2s. El ion común aporta un término inicial además del cambio por disolución."
      }
    },
    {
      "id": "7.12-4",
      "topic": "7.12",
      "type": "mc",
      "prompt": {
        "en": "More AgCl(s) is added to a saturated solution already in equilibrium with excess AgCl(s), at fixed temperature and volume. What happens to dissolved concentrations?",
        "es": "Se agrega más AgCl(s) a una solución saturada que ya está en equilibrio con exceso de AgCl(s), a temperatura y volumen fijos. ¿Qué ocurre con las concentraciones disueltas?"
      },
      "choices": [
        {
          "text": {
            "en": "The added solid acts as a dissolved common ion immediately.",
            "es": "El sólido agregado actúa de inmediato como un ion común disuelto."
          },
          "why": {
            "en": "Adding pure solid is different from adding a soluble source of a common ion.",
            "es": "Agregar sólido puro es distinto de agregar una fuente soluble de un ion común."
          }
        },
        {
          "text": {
            "en": "They stay unchanged, as does Ksp.",
            "es": "Permanecen sin cambio, al igual que Ksp."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both ion concentrations double.",
            "es": "Ambas concentraciones iónicas se duplican."
          },
          "why": {
            "en": "Extra pure solid does not change saturated concentrations when solid already remains.",
            "es": "El sólido puro adicional no cambia las concentraciones saturadas cuando ya queda sólido."
          }
        },
        {
          "text": {
            "en": "Ksp increases with the amount of solid.",
            "es": "Ksp aumenta con la cantidad de sólido."
          },
          "why": {
            "en": "Ksp depends on temperature, not the mass of a remaining pure solid.",
            "es": "Ksp depende de la temperatura, no de la masa de un sólido puro que permanece."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "A saturated solution in contact with solid already satisfies Ksp. More of the same solid changes the solid amount, not its activity or the dissolved equilibrium concentrations.",
        "es": "Una solución saturada en contacto con sólido ya satisface Ksp. Más del mismo sólido cambia su cantidad, no su actividad ni las concentraciones disueltas en el equilibrio."
      }
    },
    {
      "id": "7.12-5",
      "topic": "7.12",
      "type": "numeric",
      "prompt": {
        "en": "For AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), Ksp = 1.80 × 10<sup>−10</sup>. Find approximate molar solubility in 0.0100 M NaCl, initially without Ag<sup>+</sup>. Assume ideal dilute behavior and no side reactions; check the neglected change.",
        "es": "Para AgCl(s) ⇌ Ag<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), Ksp = 1.80 × 10<sup>−10</sup>. Calcula la solubilidad molar aproximada en NaCl 0.0100 M, inicialmente sin Ag<sup>+</sup>. Supón comportamiento ideal diluido y ninguna reacción secundaria; comprueba el cambio despreciado."
      },
      "value": 1.8e-08,
      "display": "1.80e-8",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5000000000000004e-11,
      "explanation": {
        "en": "Ksp = s(0.0100 + s) ≈ s(0.0100). Thus s = 1.80 × 10<sup>−8</sup> M. The check is s/0.0100 × 100 = 0.000180%, below 5%. This is much less soluble than in pure water.",
        "es": "Ksp = s(0.0100 + s) ≈ s(0.0100). Entonces s = 1.80 × 10<sup>−8</sup> M. La comprobación es s/0.0100 × 100 = 0.000180%, menor que 5%. Es mucho menos soluble que en agua pura."
      }
    },
    {
      "id": "7.12-6",
      "topic": "7.12",
      "type": "numeric",
      "prompt": {
        "en": "For CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq), Ksp = 3.20 × 10<sup>−11</sup>. Find approximate molar solubility in 0.100 M NaF, initially without Ca<sup>2+</sup>. Assume ideal dilute behavior and no side reactions; check the neglected fluoride change.",
        "es": "Para CaF<sub>2</sub>(s) ⇌ Ca<sup>2+</sup>(aq) + 2F<sup>−</sup>(aq), Ksp = 3.20 × 10<sup>−11</sup>. Calcula la solubilidad molar aproximada en NaF 0.100 M, inicialmente sin Ca<sup>2+</sup>. Supón comportamiento ideal diluido y ninguna reacción secundaria; comprueba el cambio de fluoruro despreciado."
      },
      "value": 3.1999999999999993e-09,
      "display": "3.20e-9",
      "unit": "M",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5e-12,
      "explanation": {
        "en": "Ksp = s(0.100 + 2s)<sup>2</sup> ≈ s(0.100)<sup>2</sup>, so s = 3.20 × 10<sup>−9</sup> M. The check is 2s/0.100 × 100 = 0.00000640%, below 5%. The common ion lowers molar solubility without changing Ksp.",
        "es": "Ksp = s(0.100 + 2s)<sup>2</sup> ≈ s(0.100)<sup>2</sup>, así que s = 3.20 × 10<sup>−9</sup> M. La comprobación es 2s/0.100 × 100 = 0.00000640%, menor que 5%. El ion común reduce la solubilidad molar sin cambiar Ksp."
      }
    }
  ],
  "units": [
    {
      "id": "M",
      "label": {
        "en": "M",
        "es": "M"
      }
    },
    {
      "id": "M/s",
      "label": {
        "en": "M/s",
        "es": "M/s"
      }
    },
    {
      "id": "ratio",
      "label": {
        "en": "no units",
        "es": "sin unidades"
      }
    },
    {
      "id": "count",
      "label": {
        "en": "count",
        "es": "conteo"
      }
    }
  ],
  "copy": {
    "title": "AP Chemistry Unit 7 Practice",
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
      "AP Chemistry Unit 7 Practice": "Práctica de la unidad 7 de Química AP",
      "AP Chemistry · Unit 7": "Química AP · Unidad 7",
      "Choose a topic, then start. Mixed review includes all twelve topics.": "Elige un tema y comienza. El repaso mixto incluye los doce temas.",
      "Choose one topic for six questions, or Mixed review for all 72. Read the feedback after each answer.": "Elige un tema para seis preguntas o Repaso mixto para las 72. Lee los comentarios después de cada respuesta.",
      "Select one answer, or enter a number and choose its unit. For K or Q, choose no units. For particles, choose count.": "Selecciona una respuesta o escribe un número y elige su unidad. Para K o Q, elige sin unidades. Para partículas, elige conteo.",
      "No timer. Use scratch paper and a calculator. The equilibrium reference is below.": "Sin límite de tiempo. Usa papel y calculadora. La referencia de equilibrio está abajo.",
      "Aligned practice for AP Chemistry CED topics 7.1 to 7.12. Original ZornScience questions.": "Práctica alineada con los temas 7.1 a 7.12 del CED de Química AP. Preguntas originales de ZornScience.",
      "Concentration (M)": "Concentración (M)",
      "Time": "Tiempo",
      "Model: concentration versus time": "Modelo: concentración contra tiempo",
      "For A in equilibrium with B, A starts at 1.000 M and B at 0.000 M. A levels off at 0.600 M and B at 0.400 M. A uses a solid curve; B uses a dashed curve.": "Para A en equilibrio con B, A empieza en 1.000 M y B en 0.000 M. A se estabiliza en 0.600 M y B en 0.400 M. A usa una curva continua; B usa una curva discontinua.",
      "Model for A ⇌ B at fixed temperature and volume. Solid: A. Dashed: B. Values are also given in the question.": "Modelo para A ⇌ B a temperatura y volumen fijos. Continua: A. Discontinua: B. Los valores también se dan en la pregunta.",
      "Model: concentration response to a perturbation": "Modelo: respuesta de concentración a una perturbación",
      "At fixed temperature and volume, A and B initially have constant concentrations. At the marked stress, only B jumps upward. B then decreases gradually while A rises to new plateaus. Solid is A; dashed is B.": "A temperatura y volumen fijos, A y B tienen concentraciones constantes inicialmente. En la perturbación marcada, solo B salta hacia arriba. Luego B disminuye gradualmente mientras A sube a nuevas mesetas. La curva continua es A; la discontinua es B.",
      "Stress": "Perturbación",
      "Model for A ⇌ B. Solid: A. Dashed: B. The graph separates an immediate change from gradual re-equilibration.": "Modelo para A ⇌ B. Continua: A. Discontinua: B. La gráfica separa un cambio inmediato del restablecimiento gradual del equilibrio.",
      "Model: initial paired and single particles": "Modelo: partículas iniciales en pares e individuales",
      "Initial model contains four joined pairs and two single circles. Every circle represents an A atom; each pair represents an A dimer.": "El modelo inicial contiene cuatro pares unidos y dos círculos individuales. Cada círculo representa un átomo de A; cada par representa un dímero de A.",
      "Initial particle model, not to scale. Each circle is an atom; each joined pair is a molecule. Later counts are described in the question.": "Modelo inicial de partículas, sin escala. Cada círculo es un átomo; cada par unido es una molécula. Los números posteriores se describen en la pregunta.",
      "Equilibrium expressions": "Expresiones de equilibrio",
      "Use products over reactants, raised to their balanced coefficients. Omit pure solids and pure liquids; retain dissolved species and gases. Kc uses equilibrium concentrations; Kp uses equilibrium gas partial pressures.": "Usa productos sobre reactivos, elevados a sus coeficientes balanceados. Omite sólidos puros y líquidos puros; conserva especies disueltas y gases. Kc usa concentraciones en el equilibrio; Kp usa presiones parciales gaseosas en el equilibrio.",
      "All K and Q values are dimensionless here. Choose no units for them. Use M for concentrations and molar solubility. Concentrations approximate activities in ideal dilute solutions; gases are ideal.": "Todos los valores de K y Q son adimensionales aquí. Elige sin unidades para ellos. Usa M para concentraciones y solubilidad molar. Las concentraciones aproximan actividades en soluciones ideales diluidas; los gases son ideales.",
      "Q versus K": "Q contra K",
      "Q uses the same expression as K with current values, not necessarily equilibrium values.": "Q usa la misma expresión que K con valores actuales, no necesariamente valores en el equilibrio.",
      "Q < K: shift right; net product formation.": "Q < K: desplazamiento a la derecha; formación neta de productos.",
      "Q > K: shift left; net reactant formation.": "Q > K: desplazamiento a la izquierda; formación neta de reactivos.",
      "Q = K: dynamic equilibrium; equal forward and reverse rates.": "Q = K: equilibrio dinámico; velocidades directa e inversa iguales.",
      "Changing the reaction equation": "Cambios en la ecuación de reacción",
      "Reverse:": "Inversión:",
      "Multiply coefficients by n:": "Multiplica los coeficientes por n:",
      "Add reactions:": "Suma reacciones:",
      "Gas equilibria": "Equilibrios gaseosos",
      "Δn is the sum of gaseous product coefficients minus the sum of gaseous reactant coefficients. Use kelvin. At fixed temperature, concentration, volume, catalyst and inert-gas changes do not change K. Temperature can change K.": "Δn es la suma de los coeficientes de productos gaseosos menos la suma de los coeficientes de reactivos gaseosos. Usa kelvin. A temperatura fija, los cambios de concentración, volumen, catalizador y gas inerte no cambian K. La temperatura puede cambiar K.",
      "A catalyst changes both reaction rates. An inert gas causes no shift at constant temperature and volume; at constant total pressure it can cause expansion and a shift when gaseous coefficients differ. Heating favors the endothermic direction.": "Un catalizador cambia ambas velocidades de reacción. Un gas inerte no causa desplazamiento a temperatura y volumen constantes; a presión total constante puede causar expansión y un desplazamiento cuando los coeficientes gaseosos difieren. Calentar favorece la dirección endotérmica.",
      "ICE tables and approximations": "Tablas ICE y aproximaciones",
      "ICE means initial, change, equilibrium. Use coefficient-weighted changes and substitute the equilibrium row into K. Discard roots that give negative concentrations.": "ICE significa inicial, cambio, equilibrio. Usa cambios ponderados por coeficientes y sustituye la fila de equilibrio en K. Descarta raíces que den concentraciones negativas.",
      "For a small-x approximation, check each neglected concentration change divided by its initial concentration, times 100, is under 5%. Otherwise solve the full equation. Keep extra digits and round only the final answer.": "Para una aproximación de x pequeña, comprueba que cada cambio de concentración despreciado dividido entre su concentración inicial, por 100, sea menor que 5%. De lo contrario resuelve la ecuación completa. Conserva dígitos adicionales y redondea solo la respuesta final.",
      "Solubility equilibria": "Equilibrios de solubilidad",
      "The s relations apply in pure water with no side reactions. For precipitation, use ion concentrations after mixing: Qsp > Ksp forms precipitate; Qsp = Ksp is saturated equilibrium; Qsp < Ksp is unsaturated.": "Las relaciones con s se aplican en agua pura sin reacciones secundarias. Para la precipitación, usa concentraciones iónicas después de mezclar: Qsp > Ksp forma precipitado; Qsp = Ksp es equilibrio saturado; Qsp < Ksp no está saturado.",
      "A common ion lowers molar solubility at fixed temperature without changing Ksp. Include the initial common-ion concentration in the ICE table. Ignore acid-base reactions and complex formation only when the prompt specifies no side reactions.": "Un ion común reduce la solubilidad molar a temperatura fija sin cambiar Ksp. Incluye la concentración inicial del ion común en la tabla ICE. Ignora las reacciones ácido-base y la formación de complejos solo cuando el enunciado especifique que no hay reacciones secundarias.",
      "Model: forward and reverse rates versus time": "Modelo: velocidades directa e inversa contra tiempo",
      "For A in equilibrium with B, the forward rate decreases from 0.080 to 0.020 M/s while the reverse rate increases from 0 to 0.020 M/s. Both share the same final plateau. The forward curve is solid; the reverse curve is dashed.": "Para A en equilibrio con B, la velocidad directa disminuye de 0.080 a 0.020 M/s mientras la inversa aumenta de 0 a 0.020 M/s. Ambas comparten la misma meseta final. La curva directa es continua; la inversa es discontinua.",
      "Rate (M/s)": "Velocidad (M/s)",
      "Forward (solid)": "Directa (continua)",
      "Reverse (dashed)": "Inversa (discontinua)",
      "Rate model for A ⇌ B. The forward and reverse curves meet and share a nonzero plateau. Values are also given in the question.": "Modelo de velocidad para A ⇌ B. Las curvas directa e inversa se encuentran y comparten una meseta distinta de cero. Los valores también se dan en la pregunta."
    }
  }
};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit7-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
