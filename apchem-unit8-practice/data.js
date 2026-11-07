(function () {
  "use strict";
  // Original bilingual questions. Independent worked answers are in TESTING.md.
  var bank = {
  "topics": [
    {
      "id": "8.1",
      "title": {
        "en": "8.1 Introduction to Acids and Bases",
        "es": "8.1 Introducción a los ácidos y las bases"
      }
    },
    {
      "id": "8.2",
      "title": {
        "en": "8.2 pH and pOH of Strong Acids and Bases",
        "es": "8.2 pH y pOH de ácidos y bases fuertes"
      }
    },
    {
      "id": "8.3",
      "title": {
        "en": "8.3 Weak Acid and Base Equilibria",
        "es": "8.3 Equilibrios de ácidos y bases débiles"
      }
    },
    {
      "id": "8.4",
      "title": {
        "en": "8.4 Acid-Base Reactions and Buffers",
        "es": "8.4 Reacciones ácido-base y amortiguadores"
      }
    },
    {
      "id": "8.5",
      "title": {
        "en": "8.5 Acid-Base Titrations",
        "es": "8.5 Titulaciones ácido-base"
      }
    },
    {
      "id": "8.6",
      "title": {
        "en": "8.6 Molecular Structure of Acids and Bases",
        "es": "8.6 Estructura molecular de ácidos y bases"
      }
    },
    {
      "id": "8.7",
      "title": {
        "en": "8.7 pH and pKa",
        "es": "8.7 pH y pKa"
      }
    },
    {
      "id": "8.8",
      "title": {
        "en": "8.8 Properties of Buffers",
        "es": "8.8 Propiedades de los amortiguadores"
      }
    },
    {
      "id": "8.9",
      "title": {
        "en": "8.9 Henderson-Hasselbalch Equation",
        "es": "8.9 Ecuación de Henderson-Hasselbalch"
      }
    },
    {
      "id": "8.10",
      "title": {
        "en": "8.10 Buffer Capacity",
        "es": "8.10 Capacidad amortiguadora"
      }
    },
    {
      "id": "8.11",
      "title": {
        "en": "8.11 pH and Solubility",
        "es": "8.11 pH y solubilidad"
      }
    }
  ],
  "questions": [
    {
      "id": "8.1-1",
      "topic": "8.1",
      "type": "mc",
      "prompt": {
        "en": "In NH<sub>4</sub><sup>+</sup>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>3</sub>(aq) + H<sub>3</sub>O<sup>+</sup>(aq), which reactant is the Brønsted-Lowry acid?",
        "es": "En NH<sub>4</sub><sup>+</sup>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>3</sub>(aq) + H<sub>3</sub>O<sup>+</sup>(aq), ¿qué reactivo es el ácido de Brønsted-Lowry?"
      },
      "choices": [
        {
          "text": {
            "en": "NH<sub>3</sub>",
            "es": "NH<sub>3</sub>"
          },
          "why": {
            "en": "Ammonia is a product and the conjugate base of the acid.",
            "es": "El amoniaco es un producto y la base conjugada del ácido."
          }
        },
        {
          "text": {
            "en": "H<sub>3</sub>O<sup>+</sup>",
            "es": "H<sub>3</sub>O<sup>+</sup>"
          },
          "why": {
            "en": "Hydronium is the conjugate acid produced, not the proton-donating reactant.",
            "es": "El hidronio es el ácido conjugado producido, no el reactivo que dona el protón."
          }
        },
        {
          "text": {
            "en": "NH<sub>4</sub><sup>+</sup>",
            "es": "NH<sub>4</sub><sup>+</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "H<sub>2</sub>O",
            "es": "H<sub>2</sub>O"
          },
          "why": {
            "en": "Water accepts a proton here, so it acts as a base.",
            "es": "Aquí el agua acepta un protón, por lo que actúa como base."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "NH<sub>4</sub><sup>+</sup> donates a proton to water. Water accepts it and becomes the hydronium ion, H<sub>3</sub>O<sup>+</sup>.",
        "es": "NH<sub>4</sub><sup>+</sup> dona un protón al agua. El agua lo acepta y se convierte en el ion hidronio, H<sub>3</sub>O<sup>+</sup>."
      }
    },
    {
      "id": "8.1-2",
      "topic": "8.1",
      "type": "mc",
      "prompt": {
        "en": "Which pair is a conjugate acid-base pair?",
        "es": "¿Qué pareja es un par conjugado ácido-base?"
      },
      "choices": [
        {
          "text": {
            "en": "NH<sub>4</sub><sup>+</sup> / H<sub>2</sub>O",
            "es": "NH<sub>4</sub><sup>+</sup> / H<sub>2</sub>O"
          },
          "why": {
            "en": "The atoms other than the transferred proton must remain the same.",
            "es": "Los átomos distintos del protón transferido deben permanecer iguales."
          }
        },
        {
          "text": {
            "en": "NH<sub>4</sub><sup>+</sup> / NH<sub>3</sub>",
            "es": "NH<sub>4</sub><sup>+</sup> / NH<sub>3</sub>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "H<sub>3</sub>O<sup>+</sup> / OH<sup>−</sup>",
            "es": "H<sub>3</sub>O<sup>+</sup> / OH<sup>−</sup>"
          },
          "why": {
            "en": "These species differ by two protons, not one.",
            "es": "Estas especies difieren en dos protones, no en uno."
          }
        },
        {
          "text": {
            "en": "HCl / NaCl",
            "es": "HCl / NaCl"
          },
          "why": {
            "en": "Replacing hydrogen with sodium does not define conjugate partners.",
            "es": "Sustituir hidrógeno por sodio no define una pareja conjugada."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "NH<sub>4</sub><sup>+</sup> and NH<sub>3</sub> differ by one proton. Losing that proton lowers the charge by one.",
        "es": "NH<sub>4</sub><sup>+</sup> y NH<sub>3</sub> difieren en un protón. Al perder ese protón, la carga disminuye en uno."
      }
    },
    {
      "id": "8.1-3",
      "topic": "8.1",
      "type": "mc",
      "prompt": {
        "en": "Water accepts a proton from HCl but donates a proton to ammonia. What does this show?",
        "es": "El agua acepta un protón del HCl, pero dona un protón al amoniaco. ¿Qué demuestra esto?"
      },
      "choices": [
        {
          "text": {
            "en": "Water is amphoteric.",
            "es": "El agua es anfótera."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Water is always an acid.",
            "es": "El agua siempre es un ácido."
          },
          "why": {
            "en": "Accepting a proton is base behavior.",
            "es": "Aceptar un protón es un comportamiento de base."
          }
        },
        {
          "text": {
            "en": "Water is always a base.",
            "es": "El agua siempre es una base."
          },
          "why": {
            "en": "Donating a proton is acid behavior.",
            "es": "Donar un protón es un comportamiento de ácido."
          }
        },
        {
          "text": {
            "en": "Water cannot participate in proton transfer.",
            "es": "El agua no puede participar en la transferencia de protones."
          },
          "why": {
            "en": "Both observations describe proton transfer involving water.",
            "es": "Ambas observaciones describen una transferencia de protones en la que participa el agua."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Water is amphoteric. Its role depends on its reaction partner: it can form H<sub>3</sub>O<sup>+</sup> or OH<sup>−</sup>.",
        "es": "El agua es anfótera. Su función depende de la especie con la que reacciona: puede formar H<sub>3</sub>O<sup>+</sup> u OH<sup>−</sup>."
      }
    },
    {
      "id": "8.1-4",
      "topic": "8.1",
      "type": "mc",
      "prompt": {
        "en": "Why can pure water be neutral at a pH different from 7.00 when temperature changes?",
        "es": "¿Por qué el agua pura puede ser neutra con un pH distinto de 7.00 cuando cambia la temperatura?"
      },
      "choices": [
        {
          "text": {
            "en": "Neutrality always requires pH 7.00.",
            "es": "La neutralidad siempre requiere un pH de 7.00."
          },
          "why": {
            "en": "That numerical pH applies to neutral water at 25 °C.",
            "es": "Ese valor numérico de pH corresponde al agua neutra a 25 °C."
          }
        },
        {
          "text": {
            "en": "Heating eliminates hydroxide from pure water.",
            "es": "Calentar elimina el hidróxido del agua pura."
          },
          "why": {
            "en": "Autoionization still produces equal amounts of the two ions.",
            "es": "La autoionización sigue produciendo cantidades iguales de los dos iones."
          }
        },
        {
          "text": {
            "en": "Kw is unchanged, but the definition of pH changes.",
            "es": "Kw no cambia, pero cambia la definición de pH."
          },
          "why": {
            "en": "The definition of pH is unchanged; the equilibrium constant changes.",
            "es": "La definición de pH no cambia; cambia la constante de equilibrio."
          }
        },
        {
          "text": {
            "en": "Neutrality requires equal ion concentrations, while Kw depends on temperature.",
            "es": "La neutralidad requiere concentraciones iónicas iguales, mientras que Kw depende de la temperatura."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Neutral means [H<sub>3</sub>O<sup>+</sup>] = [OH<sup>−</sup>]. Kw changes with temperature, so the common concentration and neutral pH change.",
        "es": "Neutro significa [H<sub>3</sub>O<sup>+</sup>] = [OH<sup>−</sup>]. Kw cambia con la temperatura, por lo que cambian la concentración común y el pH neutro."
      }
    },
    {
      "id": "8.1-5",
      "topic": "8.1",
      "type": "numeric",
      "prompt": {
        "en": "At a temperature other than 25 °C, neutral water has [H<sub>3</sub>O<sup>+</sup>] = [OH<sup>−</sup>] = 2.00 × 10<sup>−7</sup> M. Calculate Kw.",
        "es": "A una temperatura distinta de 25 °C, el agua neutra tiene [H<sub>3</sub>O<sup>+</sup>] = [OH<sup>−</sup>] = 2.00 × 10<sup>−7</sup> M. Calcula Kw."
      },
      "value": 4e-14,
      "display": "4.00e-14",
      "unit": "ratio",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.5000000000000006e-17,
      "explanation": {
        "en": "Kw = (2.00 × 10<sup>−7</sup>)(2.00 × 10<sup>−7</sup>) = 4.00 × 10<sup>−14</sup>. Use no units.",
        "es": "Kw = (2.00 × 10<sup>−7</sup>)(2.00 × 10<sup>−7</sup>) = 4.00 × 10<sup>−14</sup>. Usa sin unidades."
      }
    },
    {
      "id": "8.1-6",
      "topic": "8.1",
      "type": "numeric",
      "prompt": {
        "en": "At a temperature where Kw = 4.0 × 10<sup>−14</sup>, calculate the pH of neutral water.",
        "es": "A una temperatura donde Kw = 4.0 × 10<sup>−14</sup>, calcula el pH del agua neutra."
      },
      "value": 6.698970004336019,
      "display": "6.70",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Neutral water has [H<sub>3</sub>O<sup>+</sup>] = √Kw = 2.0 × 10<sup>−7</sup> M. pH = −log(2.0 × 10<sup>−7</sup>) = 6.70. It remains neutral because the ion concentrations are equal. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "El agua neutra tiene [H<sub>3</sub>O<sup>+</sup>] = √Kw = 2.0 × 10<sup>−7</sup> M. pH = −log(2.0 × 10<sup>−7</sup>) = 6.70. Sigue siendo neutra porque las concentraciones iónicas son iguales. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.2-1",
      "topic": "8.2",
      "type": "mc",
      "prompt": {
        "en": "A student says a dilute HCl solution must be a weak acid. Which correction is best?",
        "es": "Un estudiante dice que una solución diluida de HCl debe ser un ácido débil. ¿Cuál es la mejor corrección?"
      },
      "choices": [
        {
          "text": {
            "en": "A strong acid cannot be diluted.",
            "es": "Un ácido fuerte no se puede diluir."
          },
          "why": {
            "en": "Adding water lowers concentration even for a strong acid.",
            "es": "Agregar agua reduce la concentración incluso de un ácido fuerte."
          }
        },
        {
          "text": {
            "en": "HCl can be dilute and still ionize essentially completely.",
            "es": "El HCl puede estar diluido y aun así ionizarse casi por completo."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "All dilute acids are weak.",
            "es": "Todos los ácidos diluidos son débiles."
          },
          "why": {
            "en": "Dilution does not change HCl into a weak acid.",
            "es": "La dilución no convierte el HCl en un ácido débil."
          }
        },
        {
          "text": {
            "en": "Strong means a solution has a high concentration.",
            "es": "Fuerte significa que una solución tiene una concentración alta."
          },
          "why": {
            "en": "Strength and concentration describe different properties.",
            "es": "La fuerza y la concentración describen propiedades distintas."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Acid strength describes the extent of ionization, while concentration describes how much solute is present per volume.",
        "es": "La fuerza de un ácido describe el grado de ionización, mientras que la concentración describe cuánto soluto hay por volumen."
      }
    },
    {
      "id": "8.2-2",
      "topic": "8.2",
      "type": "mc",
      "prompt": {
        "en": "At 25 °C, a fully dissolved 0.0100 M Ca(OH)<sub>2</sub> solution dissociates completely. What is [OH<sup>−</sup>]?",
        "es": "A 25 °C, una solución de Ca(OH)<sub>2</sub> 0.0100 M completamente disuelta se disocia por completo. ¿Cuál es [OH<sup>−</sup>]?"
      },
      "choices": [
        {
          "text": {
            "en": "0.0200 M",
            "es": "0.0200 M"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "0.0100 M",
            "es": "0.0100 M"
          },
          "why": {
            "en": "This ignores the two hydroxide ions per formula unit.",
            "es": "Esto ignora los dos iones hidróxido por unidad fórmula."
          }
        },
        {
          "text": {
            "en": "0.00500 M",
            "es": "0.00500 M"
          },
          "why": {
            "en": "Multiply by the hydroxide coefficient rather than dividing by it.",
            "es": "Multiplica por el coeficiente del hidróxido en lugar de dividir entre él."
          }
        },
        {
          "text": {
            "en": "2.000 M",
            "es": "2.000 M"
          },
          "why": {
            "en": "The coefficient multiplies the stated molarity; it does not replace it.",
            "es": "El coeficiente multiplica la molaridad dada; no la sustituye."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Ca(OH)<sub>2</sub>(aq) → Ca<sup>2+</sup>(aq) + 2OH<sup>−</sup>(aq). Each formula unit supplies two hydroxide ions, giving 0.0200 M.",
        "es": "Ca(OH)<sub>2</sub>(aq) → Ca<sup>2+</sup>(aq) + 2OH<sup>−</sup>(aq). Cada unidad fórmula aporta dos iones hidróxido y da 0.0200 M."
      }
    },
    {
      "id": "8.2-3",
      "topic": "8.2",
      "type": "mc",
      "prompt": {
        "en": "A strong monoprotic acid is diluted from 0.0100 M to 0.00100 M at 25 °C. What happens to its pH?",
        "es": "Un ácido fuerte monoprótico se diluye de 0.0100 M a 0.00100 M a 25 °C. ¿Qué ocurre con su pH?"
      },
      "choices": [
        {
          "text": {
            "en": "It decreases by 1.00.",
            "es": "Disminuye en 1.00."
          },
          "why": {
            "en": "Diluting an acid lowers hydronium concentration and raises pH.",
            "es": "Diluir un ácido reduce la concentración de hidronio y aumenta el pH."
          }
        },
        {
          "text": {
            "en": "It stays unchanged.",
            "es": "No cambia."
          },
          "why": {
            "en": "The hydronium concentration changes, so its negative logarithm changes.",
            "es": "La concentración de hidronio cambia, así que su logaritmo negativo cambia."
          }
        },
        {
          "text": {
            "en": "It increases tenfold.",
            "es": "Aumenta diez veces."
          },
          "why": {
            "en": "The pH scale is logarithmic rather than proportional to concentration.",
            "es": "La escala de pH es logarítmica, no proporcional a la concentración."
          }
        },
        {
          "text": {
            "en": "It increases by 1.00.",
            "es": "Aumenta en 1.00."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "A tenfold decrease in hydronium concentration raises pH by 1.00. Water autoionization is negligible at these concentrations.",
        "es": "Una disminución de diez veces en la concentración de hidronio aumenta el pH en 1.00. La autoionización del agua es despreciable a estas concentraciones."
      }
    },
    {
      "id": "8.2-4",
      "topic": "8.2",
      "type": "mc",
      "prompt": {
        "en": "For [H<sub>3</sub>O<sup>+</sup>] = 2.50 × 10<sup>−3</sup> M, a calculator gives pH 2.60205999. Which reported answer follows the log rule?",
        "es": "Para [H<sub>3</sub>O<sup>+</sup>] = 2.50 × 10<sup>−3</sup> M, una calculadora da un pH de 2.60205999. ¿Qué respuesta sigue la regla de logaritmos?"
      },
      "choices": [
        {
          "text": {
            "en": "2.6",
            "es": "2.6"
          },
          "why": {
            "en": "One decimal place loses precision supported by the concentration.",
            "es": "Un decimal pierde precisión respaldada por la concentración."
          }
        },
        {
          "text": {
            "en": "2.60205999",
            "es": "2.60205999"
          },
          "why": {
            "en": "Keeping all calculator digits overstates the precision of the measured input.",
            "es": "Conservar todos los dígitos de la calculadora exagera la precisión del dato medido."
          }
        },
        {
          "text": {
            "en": "2.602",
            "es": "2.602"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "2.60",
            "es": "2.60"
          },
          "why": {
            "en": "This has only 2 decimal places; counting all pH digits as significant figures applies the wrong rule.",
            "es": "Esto tiene solo 2 decimales; contar todos los dígitos del pH como cifras significativas aplica la regla incorrecta."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The concentration has 3 significant figures. A pH answer therefore needs 3 decimal places: 2.602.",
        "es": "La concentración tiene 3 cifras significativas. Por eso una respuesta de pH necesita 3 decimales: 2.602."
      }
    },
    {
      "id": "8.2-5",
      "topic": "8.2",
      "type": "numeric",
      "prompt": {
        "en": "Calculate the pH of 0.00250 M HCl at 25 °C. Treat HCl as completely ionized.",
        "es": "Calcula el pH de HCl 0.00250 M a 25 °C. Considera que el HCl se ioniza por completo."
      },
      "value": 2.6020599913279625,
      "display": "2.602",
      "unit": "ratio",
      "precision": {
        "decimals": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "[H<sub>3</sub>O<sup>+</sup>] = 0.00250 M. pH = −log(0.00250) = 2.602. Log rule: use 3 decimal places because the governing concentration or K value has 3 significant figures.",
        "es": "[H<sub>3</sub>O<sup>+</sup>] = 0.00250 M. pH = −log(0.00250) = 2.602. Regla de logaritmos: usa 3 decimales porque la concentración o el valor de K que determina la precisión tiene 3 cifras significativas."
      }
    },
    {
      "id": "8.2-6",
      "topic": "8.2",
      "type": "numeric",
      "prompt": {
        "en": "Calculate the pOH of fully dissolved 0.015 M Ba(OH)<sub>2</sub> at 25 °C. It dissociates completely.",
        "es": "Calcula el pOH de Ba(OH)<sub>2</sub> 0.015 M completamente disuelto a 25 °C. Se disocia por completo."
      },
      "value": 1.5228787452803376,
      "display": "1.52",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "[OH<sup>−</sup>] = 2(0.015) = 0.030 M. pOH = −log(0.030) = 1.52; pH = 14.00 − pOH = 12.48. Keep unrounded pOH until the final subtraction. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "[OH<sup>−</sup>] = 2(0.015) = 0.030 M. pOH = −log(0.030) = 1.52; pH = 14.00 − pOH = 12.48. Conserva el pOH sin redondear hasta la resta final. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.3-1",
      "topic": "8.3",
      "type": "mc",
      "prompt": {
        "en": "For HA(aq) + H<sub>2</sub>O(l) ⇌ H<sub>3</sub>O<sup>+</sup>(aq) + A<sup>−</sup>(aq), which is the acid dissociation constant expression?",
        "es": "Para HA(aq) + H<sub>2</sub>O(l) ⇌ H<sub>3</sub>O<sup>+</sup>(aq) + A<sup>−</sup>(aq), ¿cuál es la expresión de la constante de acidez?"
      },
      "choices": [
        {
          "text": {
            "en": "Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA]",
            "es": "Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA]"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Ka = [HA]/([H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>])",
            "es": "Ka = [HA]/([H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>])"
          },
          "why": {
            "en": "This is the reciprocal of the expression for the written acid ionization.",
            "es": "Es el recíproco de la expresión para la ionización del ácido escrita."
          }
        },
        {
          "text": {
            "en": "Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/([HA][H<sub>2</sub>O])",
            "es": "Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/([HA][H<sub>2</sub>O])"
          },
          "why": {
            "en": "Pure liquid water does not appear as a concentration factor.",
            "es": "El agua líquida pura no aparece como factor de concentración."
          }
        },
        {
          "text": {
            "en": "Ka = [OH<sup>−</sup>][A<sup>−</sup>]/[HA]",
            "es": "Ka = [OH<sup>−</sup>][A<sup>−</sup>]/[HA]"
          },
          "why": {
            "en": "The written acid reaction produces hydronium, not hydroxide.",
            "es": "La reacción del ácido escrita produce hidronio, no hidróxido."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA]. Pure liquid water has constant activity and is omitted.",
        "es": "Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA]. El agua líquida pura tiene actividad constante y se omite."
      }
    },
    {
      "id": "8.3-2",
      "topic": "8.3",
      "type": "mc",
      "prompt": {
        "en": "An initially 0.100 M NH<sub>3</sub> solution contains negligible NH<sub>4</sub><sup>+</sup> and OH<sup>−</sup>. If x M reacts with water, which ICE-table equation gives Kb?",
        "es": "Una solución inicialmente 0.100 M de NH<sub>3</sub> contiene cantidades despreciables de NH<sub>4</sub><sup>+</sup> y OH<sup>−</sup>. Si reaccionan x M con el agua, ¿qué ecuación de la tabla ICE da Kb?"
      },
      "choices": [
        {
          "text": {
            "en": "Kb = x/(0.100 − x)",
            "es": "Kb = x/(0.100 − x)"
          },
          "why": {
            "en": "Both product concentrations equal x, so their product is squared.",
            "es": "Ambas concentraciones de productos son iguales a x, por lo que su producto queda al cuadrado."
          }
        },
        {
          "text": {
            "en": "Kb = x<sup>2</sup>/(0.100 + x)",
            "es": "Kb = x<sup>2</sup>/(0.100 + x)"
          },
          "why": {
            "en": "Ammonia is consumed, so its concentration decreases.",
            "es": "El amoniaco se consume, así que su concentración disminuye."
          }
        },
        {
          "text": {
            "en": "Kb = (0.100 − x)/x<sup>2</sup>",
            "es": "Kb = (0.100 − x)/x<sup>2</sup>"
          },
          "why": {
            "en": "Products belong in the numerator for the base ionization as written.",
            "es": "Los productos van en el numerador para la ionización de la base tal como está escrita."
          }
        },
        {
          "text": {
            "en": "Kb = x<sup>2</sup>/(0.100 − x)",
            "es": "Kb = x<sup>2</sup>/(0.100 − x)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "NH<sub>3</sub>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>4</sub><sup>+</sup>(aq) + OH<sup>−</sup>(aq). The ICE equilibrium row is 0.100 − x, x, x, so Kb = x<sup>2</sup>/(0.100 − x).",
        "es": "NH<sub>3</sub>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>4</sub><sup>+</sup>(aq) + OH<sup>−</sup>(aq). La fila de equilibrio de la tabla ICE es 0.100 − x, x, x, así que Kb = x<sup>2</sup>/(0.100 − x)."
      }
    },
    {
      "id": "8.3-3",
      "topic": "8.3",
      "type": "mc",
      "prompt": {
        "en": "At fixed temperature, acetic acid is diluted from 0.100 M to 0.0100 M. With Ka = 1.8 × 10<sup>−5</sup>, how do hydronium concentration and percent ionization change?",
        "es": "A temperatura fija, el ácido acético se diluye de 0.100 M a 0.0100 M. Con Ka = 1.8 × 10<sup>−5</sup>, ¿cómo cambian la concentración de hidronio y el porcentaje de ionización?"
      },
      "choices": [
        {
          "text": {
            "en": "Both rise.",
            "es": "Ambas aumentan."
          },
          "why": {
            "en": "Greater fractional ionization does not overcome the decrease in analytical concentration.",
            "es": "La mayor fracción ionizada no compensa la disminución en la concentración analítica."
          }
        },
        {
          "text": {
            "en": "Ka rises, causing both to stay unchanged.",
            "es": "Ka aumenta, lo que hace que ambas no cambien."
          },
          "why": {
            "en": "Dilution at fixed temperature does not change Ka.",
            "es": "La dilución a temperatura fija no cambia Ka."
          }
        },
        {
          "text": {
            "en": "Hydronium concentration falls; percent ionization rises.",
            "es": "La concentración de hidronio disminuye; el porcentaje de ionización aumenta."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both fall.",
            "es": "Ambas disminuyen."
          },
          "why": {
            "en": "The fraction ionized grows on dilution even though hydronium concentration falls.",
            "es": "La fracción ionizada aumenta con la dilución aunque disminuya la concentración de hidronio."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Solving the equilibrium gives hydronium concentrations of 0.00133 M and 0.000415 M. Percent ionization = ionized concentration / initial acid concentration × 100 rises from 1.33% to 4.15%.",
        "es": "Al resolver el equilibrio se obtienen concentraciones de hidronio de 0.00133 M y 0.000415 M. El porcentaje de ionización = concentración ionizada / concentración inicial del ácido × 100 aumenta de 1.33% a 4.15%."
      }
    },
    {
      "id": "8.3-4",
      "topic": "8.3",
      "type": "mc",
      "prompt": {
        "en": "For a hypothetical weak acid, C = 0.010 M and Ka = 1.0 × 10<sup>−3</sup>. The approximation x = √(KaC) predicts 31.6% ionization. What should you do?",
        "es": "Para un ácido débil hipotético, C = 0.010 M y Ka = 1.0 × 10<sup>−3</sup>. La aproximación x = √(KaC) predice 31.6% de ionización. ¿Qué debes hacer?"
      },
      "choices": [
        {
          "text": {
            "en": "Change Ka until the check passes.",
            "es": "Cambia Ka hasta que se cumpla la comprobación."
          },
          "why": {
            "en": "Ka is fixed by the specified acid and temperature, not by the chosen method.",
            "es": "Ka está fijada por el ácido y la temperatura dados, no por el método elegido."
          }
        },
        {
          "text": {
            "en": "Reject the small-x approximation and solve the full equation.",
            "es": "Rechaza la aproximación de x pequeña y resuelve la ecuación completa."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Accept it because the acid is weak.",
            "es": "Acéptala porque el ácido es débil."
          },
          "why": {
            "en": "Weak does not guarantee a negligible fractional ionization.",
            "es": "Que sea débil no garantiza una fracción de ionización despreciable."
          }
        },
        {
          "text": {
            "en": "Set x equal to the entire initial acid concentration.",
            "es": "Iguala x a toda la concentración inicial del ácido."
          },
          "why": {
            "en": "This assumes complete ionization, inconsistent with the stated equilibrium.",
            "es": "Esto supone ionización completa, incompatible con el equilibrio dado."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "The neglected change exceeds 5%. Solve x<sup>2</sup>/(0.010 − x) = 1.0 × 10<sup>−3</sup> instead; the physical root is 0.00270 M.",
        "es": "El cambio despreciado supera el 5%. Resuelve x<sup>2</sup>/(0.010 − x) = 1.0 × 10<sup>−3</sup>; la raíz física es 0.00270 M."
      }
    },
    {
      "id": "8.3-5",
      "topic": "8.3",
      "type": "numeric",
      "prompt": {
        "en": "Calculate the pH of 0.100 M acetic acid at 25 °C, with Ka = 1.8 × 10<sup>−5</sup>. Use the full equilibrium equation.",
        "es": "Calcula el pH del ácido acético 0.100 M a 25 °C, con Ka = 1.8 × 10<sup>−5</sup>. Usa la ecuación de equilibrio completa."
      },
      "value": 2.8752770615501357,
      "display": "2.88",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "CH<sub>3</sub>COOH(aq) + H<sub>2</sub>O(l) ⇌ H<sub>3</sub>O<sup>+</sup>(aq) + CH<sub>3</sub>COO<sup>−</sup>(aq). ICE: 0.100 − x, x, x. Solve x<sup>2</sup>/(0.100 − x) = 1.8 × 10<sup>−5</sup>: x = 0.00133267 M. pH = 2.88. Percent ionization is 1.33%. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "CH<sub>3</sub>COOH(aq) + H<sub>2</sub>O(l) ⇌ H<sub>3</sub>O<sup>+</sup>(aq) + CH<sub>3</sub>COO<sup>−</sup>(aq). Tabla ICE: 0.100 − x, x, x. Resuelve x<sup>2</sup>/(0.100 − x) = 1.8 × 10<sup>−5</sup>: x = 0.00133267 M. pH = 2.88. El porcentaje de ionización es 1.33%. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.3-6",
      "topic": "8.3",
      "type": "numeric",
      "prompt": {
        "en": "Calculate the pH of 0.100 M ammonia at 25 °C, with Kb = 1.8 × 10<sup>−5</sup>. Use the full equilibrium equation.",
        "es": "Calcula el pH del amoniaco 0.100 M a 25 °C, con Kb = 1.8 × 10<sup>−5</sup>. Usa la ecuación de equilibrio completa."
      },
      "value": 11.124722938449864,
      "display": "11.12",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "NH<sub>3</sub>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>4</sub><sup>+</sup>(aq) + OH<sup>−</sup>(aq). ICE: 0.100 − x, x, x. Solving Kb = x<sup>2</sup>/(0.100 − x) gives x = 0.00133267 M hydroxide. pOH = 2.875277; pH = 14.00 − pOH = 11.12. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "NH<sub>3</sub>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>4</sub><sup>+</sup>(aq) + OH<sup>−</sup>(aq). Tabla ICE: 0.100 − x, x, x. Al resolver Kb = x<sup>2</sup>/(0.100 − x) se obtiene x = 0.00133267 M de hidróxido. pOH = 2.875277; pH = 14.00 − pOH = 11.12. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.4-1",
      "topic": "8.4",
      "type": "mc",
      "prompt": {
        "en": "Mix 3.00 mmol HCl with 2.00 mmol NaOH in water. Which description applies after neutralization?",
        "es": "Mezcla 3.00 mmol de HCl con 2.00 mmol de NaOH en agua. ¿Qué descripción corresponde después de la neutralización?"
      },
      "choices": [
        {
          "text": {
            "en": "Equal amounts of acid and base remain.",
            "es": "Quedan cantidades iguales de ácido y base."
          },
          "why": {
            "en": "The initial amounts are unequal and neutralization consumes the hydroxide.",
            "es": "Las cantidades iniciales son distintas y la neutralización consume el hidróxido."
          }
        },
        {
          "text": {
            "en": "A strong acid and its salt form a buffer.",
            "es": "Un ácido fuerte y su sal forman un amortiguador."
          },
          "why": {
            "en": "The chloride ion does not supply an effective weak conjugate base.",
            "es": "El ion cloruro no aporta una base conjugada débil eficaz."
          }
        },
        {
          "text": {
            "en": "Excess hydroxide remains.",
            "es": "Queda hidróxido en exceso."
          },
          "why": {
            "en": "Hydroxide is limiting because its initial amount is smaller.",
            "es": "El hidróxido es el reactivo limitante porque su cantidad inicial es menor."
          }
        },
        {
          "text": {
            "en": "Excess hydronium remains; the mixture is not a buffer.",
            "es": "Queda hidronio en exceso; la mezcla no es un amortiguador."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "H<sub>3</sub>O<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → 2H<sub>2</sub>O(l). There is 1.00 mmol excess hydronium and spectator ions. This is an acidic solution, not a buffer.",
        "es": "H<sub>3</sub>O<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → 2H<sub>2</sub>O(l). Queda un exceso de 1.00 mmol de hidronio e iones espectadores. Es una solución ácida, no un amortiguador."
      }
    },
    {
      "id": "8.4-2",
      "topic": "8.4",
      "type": "mc",
      "prompt": {
        "en": "A weak monoprotic acid HA, initially 10.0 mmol, reacts completely with 4.00 mmol NaOH. Which appreciable acid-base species remain?",
        "es": "Un ácido débil monoprótico HA, inicialmente 10.0 mmol, reacciona por completo con 4.00 mmol de NaOH. ¿Qué especies ácido-base quedan en cantidades apreciables?"
      },
      "choices": [
        {
          "text": {
            "en": "Excess strong base",
            "es": "Base fuerte en exceso"
          },
          "why": {
            "en": "The weak acid has more available protons than the added hydroxide can consume.",
            "es": "El ácido débil tiene más protones disponibles de los que puede consumir el hidróxido agregado."
          }
        },
        {
          "text": {
            "en": "Only A<sup>−</sup>, at equivalence",
            "es": "Solo A<sup>−</sup>, en el punto de equivalencia"
          },
          "why": {
            "en": "The hydroxide amount is insufficient to consume all the acid.",
            "es": "La cantidad de hidróxido no basta para consumir todo el ácido."
          }
        },
        {
          "text": {
            "en": "HA and A<sup>−</sup>, forming a buffer",
            "es": "HA y A<sup>−</sup>, que forman un amortiguador"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only HA, with no conjugate base",
            "es": "Solo HA, sin base conjugada"
          },
          "why": {
            "en": "Neutralization produces the conjugate base from the consumed acid.",
            "es": "La neutralización produce la base conjugada a partir del ácido consumido."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "HA(aq) + OH<sup>−</sup>(aq) → A<sup>−</sup>(aq) + H<sub>2</sub>O(l). There are 6.00 mmol HA and 4.00 mmol A<sup>−</sup>, so the solution is a buffer.",
        "es": "HA(aq) + OH<sup>−</sup>(aq) → A<sup>−</sup>(aq) + H<sub>2</sub>O(l). Quedan 6.00 mmol de HA y 4.00 mmol de A<sup>−</sup>, por lo que la solución es un amortiguador."
      }
    },
    {
      "id": "8.4-3",
      "topic": "8.4",
      "type": "mc",
      "prompt": {
        "en": "Equal moles of acetic acid and NaOH react in water at 25 °C. What best describes the equivalence mixture?",
        "es": "Moles iguales de ácido acético y NaOH reaccionan en agua a 25 °C. ¿Qué describe mejor la mezcla en el punto de equivalencia?"
      },
      "choices": [
        {
          "text": {
            "en": "Excess NaOH",
            "es": "NaOH en exceso"
          },
          "why": {
            "en": "Equal reacting amounts leave no stoichiometric excess of strong base.",
            "es": "Las cantidades iguales que reaccionan no dejan un exceso estequiométrico de base fuerte."
          }
        },
        {
          "text": {
            "en": "Mostly acetate; basic, without an appreciable buffer pair",
            "es": "Principalmente acetato; básica, sin una pareja amortiguadora apreciable"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Equal amounts of acetic acid and acetate",
            "es": "Cantidades iguales de ácido acético y acetato"
          },
          "why": {
            "en": "Equal conjugate amounts occur at half-equivalence, not equivalence.",
            "es": "Las cantidades conjugadas iguales aparecen en el punto de semiequivalencia, no en el punto de equivalencia."
          }
        },
        {
          "text": {
            "en": "Neutral because all salts are neutral",
            "es": "Neutra porque todas las sales son neutras"
          },
          "why": {
            "en": "The conjugate base of a weak acid reacts with water.",
            "es": "La base conjugada de un ácido débil reacciona con el agua."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Acetate is the predominant acid-base solute. CH<sub>3</sub>COO<sup>−</sup>(aq) + H<sub>2</sub>O(l) ⇌ CH<sub>3</sub>COOH(aq) + OH<sup>−</sup>(aq) makes the solution basic. Trace acetic acid does not make an appreciable buffer pair.",
        "es": "El acetato es el soluto ácido-base predominante. CH<sub>3</sub>COO<sup>−</sup>(aq) + H<sub>2</sub>O(l) ⇌ CH<sub>3</sub>COOH(aq) + OH<sup>−</sup>(aq) hace básica la solución. Las trazas de ácido acético no forman una pareja amortiguadora apreciable."
      }
    },
    {
      "id": "8.4-4",
      "topic": "8.4",
      "type": "mc",
      "prompt": {
        "en": "A student adds HCl to a solution containing only acetic acid. Does this create a useful buffer?",
        "es": "Un estudiante agrega HCl a una solución que contiene solo ácido acético. ¿Esto crea un amortiguador útil?"
      },
      "choices": [
        {
          "text": {
            "en": "No; there is no appreciable supply of the conjugate base.",
            "es": "No; no hay un aporte apreciable de la base conjugada."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Yes; mixing any two acids makes a buffer.",
            "es": "Sí; mezclar dos ácidos cualesquiera forma un amortiguador."
          },
          "why": {
            "en": "Two proton donors do not provide the conjugate base needed to consume added acid.",
            "es": "Dos donadores de protones no aportan la base conjugada necesaria para consumir ácido agregado."
          }
        },
        {
          "text": {
            "en": "Yes; chloride is the conjugate base of acetic acid.",
            "es": "Sí; el cloruro es la base conjugada del ácido acético."
          },
          "why": {
            "en": "Acetate, not chloride, is the conjugate base of acetic acid.",
            "es": "El acetato, no el cloruro, es la base conjugada del ácido acético."
          }
        },
        {
          "text": {
            "en": "No; a buffer must contain a strong base.",
            "es": "No; un amortiguador debe contener una base fuerte."
          },
          "why": {
            "en": "A buffer uses a weak conjugate base; strong base can help prepare it by partial neutralization.",
            "es": "Un amortiguador usa una base conjugada débil; una base fuerte puede ayudar a prepararlo mediante neutralización parcial."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A useful buffer needs appreciable amounts of a weak acid and its conjugate base. Adding strong acid does not provide acetate.",
        "es": "Un amortiguador útil necesita cantidades apreciables de un ácido débil y su base conjugada. Agregar un ácido fuerte no aporta acetato."
      }
    },
    {
      "id": "8.4-5",
      "topic": "8.4",
      "type": "numeric",
      "prompt": {
        "en": "Mix 30.0 mL of 0.100 M HCl with 20.0 mL of 0.100 M NaOH at 25 °C. Assume additive volumes. Calculate the final pH.",
        "es": "Mezcla 30.0 mL de HCl 0.100 M con 20.0 mL de NaOH 0.100 M a 25 °C. Supón volúmenes aditivos. Calcula el pH final."
      },
      "value": 1.6989700043360187,
      "display": "1.699",
      "unit": "ratio",
      "precision": {
        "decimals": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "H<sub>3</sub>O<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → 2H<sub>2</sub>O(l). Excess acid = 0.00300 − 0.00200 = 0.00100 mol. Divide by 0.0500 L to get 0.0200 M hydronium. pH = 1.699. Log rule: use 3 decimal places because the governing concentration or K value has 3 significant figures.",
        "es": "H<sub>3</sub>O<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → 2H<sub>2</sub>O(l). Exceso de ácido = 0.00300 − 0.00200 = 0.00100 mol. Divide entre 0.0500 L para obtener 0.0200 M de hidronio. pH = 1.699. Regla de logaritmos: usa 3 decimales porque la concentración o el valor de K que determina la precisión tiene 3 cifras significativas."
      }
    },
    {
      "id": "8.4-6",
      "topic": "8.4",
      "type": "numeric",
      "prompt": {
        "en": "A solution initially has 0.0100 mol weak monoprotic acid HA. It reacts with 0.00400 mol NaOH. How many moles of HA remain after the complete neutralization?",
        "es": "Una solución tiene inicialmente 0.0100 mol de un ácido débil monoprótico HA. Reacciona con 0.00400 mol de NaOH. ¿Cuántos moles de HA quedan después de la neutralización completa?"
      },
      "value": 0.006,
      "display": "0.00600",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-06,
      "explanation": {
        "en": "HA(aq) + OH<sup>−</sup>(aq) → A<sup>−</sup>(aq) + H<sub>2</sub>O(l). HA remaining = 0.0100 − 0.00400 = 0.00600 mol. The produced conjugate base and remaining acid form a buffer.",
        "es": "HA(aq) + OH<sup>−</sup>(aq) → A<sup>−</sup>(aq) + H<sub>2</sub>O(l). HA restante = 0.0100 − 0.00400 = 0.00600 mol. La base conjugada producida y el ácido restante forman un amortiguador."
      }
    },
    {
      "id": "8.5-1",
      "topic": "8.5",
      "type": "mc",
      "prompt": {
        "en": "The model shows a weak monoprotic acid titrated with NaOH at 25 °C. Half-equivalence is at 12.5 mL and equivalence at 25.0 mL. Why is the equivalence pH above 7?",
        "es": "El modelo muestra un ácido débil monoprótico titulado con NaOH a 25 °C. El punto de semiequivalencia está en 12.5 mL y el punto de equivalencia en 25.0 mL. ¿Por qué el pH en el punto de equivalencia es mayor que 7?"
      },
      "choices": [
        {
          "text": {
            "en": "The acid has become a strong acid.",
            "es": "El ácido se ha convertido en un ácido fuerte."
          },
          "why": {
            "en": "Neutralization forms a conjugate base rather than changing the identity of the acid.",
            "es": "La neutralización forma una base conjugada en lugar de cambiar la identidad del ácido."
          }
        },
        {
          "text": {
            "en": "All equivalence points have pH above 7.",
            "es": "Todos los puntos de equivalencia tienen un pH mayor que 7."
          },
          "why": {
            "en": "The equivalence pH depends on the acid and base being titrated.",
            "es": "El pH en el punto de equivalencia depende del ácido y la base que se titulan."
          }
        },
        {
          "text": {
            "en": "The conjugate base reacts with water to produce hydroxide.",
            "es": "La base conjugada reacciona con el agua y produce hidróxido."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "There must be excess NaOH at equivalence.",
            "es": "Debe haber NaOH en exceso en el punto de equivalencia."
          },
          "why": {
            "en": "Equivalence means stoichiometric neutralization, before excess titrant is added.",
            "es": "El punto de equivalencia significa neutralización estequiométrica, antes de agregar titulante en exceso."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "At equivalence, A<sup>−</sup>(aq) + H<sub>2</sub>O(l) ⇌ HA(aq) + OH<sup>−</sup>(aq). The conjugate base produces hydroxide even though no excess NaOH remains.",
        "es": "En el punto de equivalencia, A<sup>−</sup>(aq) + H<sub>2</sub>O(l) ⇌ HA(aq) + OH<sup>−</sup>(aq). La base conjugada produce hidróxido aunque no queda NaOH en exceso."
      },
      "curve": true
    },
    {
      "id": "8.5-2",
      "topic": "8.5",
      "type": "mc",
      "prompt": {
        "en": "Ammonia is titrated with HCl at 25 °C. Is the equivalence-point solution acidic, basic or neutral?",
        "es": "El amoniaco se titula con HCl a 25 °C. ¿La solución en el punto de equivalencia es ácida, básica o neutra?"
      },
      "choices": [
        {
          "text": {
            "en": "Acidic, because excess HCl is required at equivalence",
            "es": "Ácida, porque se requiere HCl en exceso en el punto de equivalencia"
          },
          "why": {
            "en": "No stoichiometric excess of HCl is needed; ammonium supplies the acidity.",
            "es": "No se necesita un exceso estequiométrico de HCl; el amonio aporta la acidez."
          }
        },
        {
          "text": {
            "en": "Acidic, because ammonium reacts with water",
            "es": "Ácida, porque el amonio reacciona con el agua"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Basic, because the initial analyte was a base",
            "es": "Básica, porque el analito inicial era una base"
          },
          "why": {
            "en": "The original weak base has been converted to its conjugate acid at equivalence.",
            "es": "En el punto de equivalencia, la base débil original se ha convertido en su ácido conjugado."
          }
        },
        {
          "text": {
            "en": "Neutral, because equal moles always give pH 7",
            "es": "Neutra, porque los moles iguales siempre dan un pH de 7"
          },
          "why": {
            "en": "Stoichiometric equivalence does not imply a neutral salt.",
            "es": "La equivalencia estequiométrica no implica una sal neutra."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "NH<sub>4</sub><sup>+</sup>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>3</sub>(aq) + H<sub>3</sub>O<sup>+</sup>(aq). The weak base becomes its conjugate acid, giving pH below 7.",
        "es": "NH<sub>4</sub><sup>+</sup>(aq) + H<sub>2</sub>O(l) ⇌ NH<sub>3</sub>(aq) + H<sub>3</sub>O<sup>+</sup>(aq). La base débil se convierte en su ácido conjugado y da un pH menor que 7."
      }
    },
    {
      "id": "8.5-3",
      "topic": "8.5",
      "type": "mc",
      "prompt": {
        "en": "HCl is titrated with NaOH at 25 °C. Neglect atmospheric gases. What is the pH at equivalence?",
        "es": "Se titula HCl con NaOH a 25 °C. Desprecia los gases atmosféricos. ¿Cuál es el pH en el punto de equivalencia?"
      },
      "choices": [
        {
          "text": {
            "en": "7.00",
            "es": "7.00"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Below 7.00, because the initial solution was acidic",
            "es": "Menor que 7.00, porque la solución inicial era ácida"
          },
          "why": {
            "en": "The initial hydronium has been consumed at equivalence.",
            "es": "El hidronio inicial se ha consumido en el punto de equivalencia."
          }
        },
        {
          "text": {
            "en": "Above 7.00, because sodium is a metal",
            "es": "Mayor que 7.00, porque el sodio es un metal"
          },
          "why": {
            "en": "Dissolved sodium ions do not behave like sodium metal reacting with water.",
            "es": "Los iones sodio disueltos no se comportan como el sodio metálico al reaccionar con agua."
          }
        },
        {
          "text": {
            "en": "Always 14.00",
            "es": "Siempre 14.00"
          },
          "why": {
            "en": "That would require a strongly basic excess rather than equivalence.",
            "es": "Eso requeriría un exceso fuertemente básico en lugar del punto de equivalencia."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Complete neutralization consumes H<sub>3</sub>O<sup>+</sup> and OH<sup>−</sup>. The remaining sodium and chloride ions do not appreciably react with water. The pH is 7.00 at 25 °C.",
        "es": "La neutralización completa consume H<sub>3</sub>O<sup>+</sup> y OH<sup>−</sup>. Los iones sodio y cloruro restantes no reaccionan de forma apreciable con el agua. El pH es 7.00 a 25 °C."
      }
    },
    {
      "id": "8.5-4",
      "topic": "8.5",
      "type": "mc",
      "prompt": {
        "en": "For the modeled weak-acid titration, the steep region near equivalence spans pH 8.0 to 10.5. Which indicator transition range is best, and what does its color change mark?",
        "es": "Para la titulación de ácido débil del modelo, la región de gran pendiente cerca del punto de equivalencia abarca un pH de 8.0 a 10.5. ¿Qué intervalo de cambio del indicador es mejor y qué marca su cambio de color?"
      },
      "choices": [
        {
          "text": {
            "en": "3.1 to 4.4; the equivalence point by definition",
            "es": "3.1 a 4.4; el punto de equivalencia por definición"
          },
          "why": {
            "en": "This transition is outside the steep region, and a color change defines an endpoint.",
            "es": "Esta transición está fuera de la región de gran pendiente y un cambio de color define un punto final."
          }
        },
        {
          "text": {
            "en": "4.0 to 5.0; the half-equivalence point must be the endpoint",
            "es": "4.0 a 5.0; el punto de semiequivalencia debe ser el punto final"
          },
          "why": {
            "en": "Half-equivalence is in the buffer region, far before stoichiometric equivalence.",
            "es": "El punto de semiequivalencia está en la región de amortiguador, mucho antes de la equivalencia estequiométrica."
          }
        },
        {
          "text": {
            "en": "12.0 to 13.0; any indicator works equally well",
            "es": "12.0 a 13.0; cualquier indicador funciona igual de bien"
          },
          "why": {
            "en": "This transition would occur after the useful steep equivalence region.",
            "es": "Esta transición ocurriría después de la región útil de gran pendiente del punto de equivalencia."
          }
        },
        {
          "text": {
            "en": "8.2 to 10.0; the endpoint",
            "es": "8.2 a 10.0; el punto final"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Choose an indicator whose transition lies inside the steep region. The observed color change marks the endpoint; equivalence is defined by stoichiometric amounts.",
        "es": "Elige un indicador cuya transición esté dentro de la región de gran pendiente. El cambio de color observado marca el punto final; el punto de equivalencia se define por las cantidades estequiométricas."
      },
      "curve": true
    },
    {
      "id": "8.5-5",
      "topic": "8.5",
      "type": "numeric",
      "prompt": {
        "en": "Acetic acid, Ka = 1.8 × 10<sup>−5</sup>, is titrated with NaOH at 25 °C. Using the buffer approximation, calculate the pH at half-equivalence.",
        "es": "El ácido acético, Ka = 1.8 × 10<sup>−5</sup>, se titula con NaOH a 25 °C. Con la aproximación de amortiguador, calcula el pH en el punto de semiequivalencia."
      },
      "value": 4.7447274948966935,
      "display": "4.74",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "At half-equivalence [HA] = [A<sup>−</sup>], so log([A<sup>−</sup>]/[HA]) = 0. Thus pH = pKa = −log(1.8 × 10<sup>−5</sup>) = 4.74. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "En el punto de semiequivalencia [HA] = [A<sup>−</sup>], así que log([A<sup>−</sup>]/[HA]) = 0. Por tanto, pH = pKa = −log(1.8 × 10<sup>−5</sup>) = 4.74. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      },
      "curve": true
    },
    {
      "id": "8.5-6",
      "topic": "8.5",
      "type": "numeric",
      "prompt": {
        "en": "Find the volume in mL of 0.100 M NaOH needed to reach equivalence for 25.0 mL of 0.100 M monoprotic acetic acid.",
        "es": "Calcula el volumen en mL de NaOH 0.100 M necesario para alcanzar el punto de equivalencia de 25.0 mL de ácido acético monoprótico 0.100 M."
      },
      "value": 25.0,
      "display": "25.0",
      "unit": "mL",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "The acid amount is 0.0250 L × 0.100 mol/L = 0.00250 mol. Neutralization is one-to-one, so V = 0.00250 mol / 0.100 mol/L = 0.0250 L = 25.0 mL.",
        "es": "La cantidad de ácido es 0.0250 L × 0.100 mol/L = 0.00250 mol. La neutralización es uno a uno, así que V = 0.00250 mol / 0.100 mol/L = 0.0250 L = 25.0 mL."
      }
    },
    {
      "id": "8.6-1",
      "topic": "8.6",
      "type": "mc",
      "prompt": {
        "en": "Why is HI a stronger acid than HF in water, despite fluorine being more electronegative?",
        "es": "¿Por qué el HI es un ácido más fuerte que el HF en agua, aunque el flúor es más electronegativo?"
      },
      "choices": [
        {
          "text": {
            "en": "A stronger H-X bond always gives a stronger acid.",
            "es": "Un enlace H-X más fuerte siempre da un ácido más fuerte."
          },
          "why": {
            "en": "A stronger bond makes proton removal harder in this comparison.",
            "es": "Un enlace más fuerte dificulta la pérdida del protón en esta comparación."
          }
        },
        {
          "text": {
            "en": "The H-I bond is weaker, making proton donation easier.",
            "es": "El enlace H-I es más débil, lo que facilita la donación de protones."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "HI has more hydrogen atoms per molecule.",
            "es": "El HI tiene más átomos de hidrógeno por molécula."
          },
          "why": {
            "en": "Each formula contains the same number of hydrogen atoms.",
            "es": "Cada fórmula contiene la misma cantidad de átomos de hidrógeno."
          }
        },
        {
          "text": {
            "en": "Iodine is more electronegative than fluorine.",
            "es": "El yodo es más electronegativo que el flúor."
          },
          "why": {
            "en": "The electronegativity order is the opposite.",
            "es": "El orden de electronegatividad es el contrario."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Down the hydrogen halide group, the H-I bond is much weaker than H-F. Easier bond breaking favors proton transfer to water.",
        "es": "Al bajar en el grupo de los haluros de hidrógeno, el enlace H-I es mucho más débil que el H-F. La mayor facilidad para romper el enlace favorece la transferencia de protones al agua."
      }
    },
    {
      "id": "8.6-2",
      "topic": "8.6",
      "type": "mc",
      "prompt": {
        "en": "Across period 2, why is HF a stronger proton donor than NH<sub>3</sub>?",
        "es": "A lo largo del periodo 2, ¿por qué el HF es un donador de protones más fuerte que el NH<sub>3</sub>?"
      },
      "choices": [
        {
          "text": {
            "en": "Fluorine increases bond polarity and stabilizes the conjugate base better.",
            "es": "El flúor aumenta la polaridad de enlace y estabiliza mejor la base conjugada."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Acidity always increases as electronegativity decreases across a period.",
            "es": "La acidez siempre aumenta al disminuir la electronegatividad a lo largo de un periodo."
          },
          "why": {
            "en": "For these period neighbors, the stated trend is reversed.",
            "es": "Para estos elementos vecinos del periodo, la tendencia indicada está invertida."
          }
        },
        {
          "text": {
            "en": "Ammonia has no hydrogen atoms.",
            "es": "El amoniaco no tiene átomos de hidrógeno."
          },
          "why": {
            "en": "Ammonia contains hydrogen but is a much weaker proton donor.",
            "es": "El amoniaco contiene hidrógeno, pero es un donador de protones mucho más débil."
          }
        },
        {
          "text": {
            "en": "Molecular mass alone determines acid strength.",
            "es": "Solo la masa molecular determina la fuerza de un ácido."
          },
          "why": {
            "en": "Acid strength depends on bond and conjugate-base properties rather than mass alone.",
            "es": "La fuerza de un ácido depende de las propiedades del enlace y de la base conjugada, no solo de la masa."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Across the period, greater electronegativity increases H-X bond polarity and helps stabilize negative charge on the conjugate base. This supports greater acidity.",
        "es": "A lo largo del periodo, la mayor electronegatividad aumenta la polaridad del enlace H-X y ayuda a estabilizar la carga negativa en la base conjugada. Esto favorece una mayor acidez."
      }
    },
    {
      "id": "8.6-3",
      "topic": "8.6",
      "type": "mc",
      "prompt": {
        "en": "Why is chloroacetic acid stronger than acetic acid?",
        "es": "¿Por qué el ácido cloroacético es más fuerte que el ácido acético?"
      },
      "choices": [
        {
          "text": {
            "en": "Chlorine makes the conjugate base less stable.",
            "es": "El cloro hace menos estable la base conjugada."
          },
          "why": {
            "en": "A less stable conjugate base would oppose the stated increase in acidity.",
            "es": "Una base conjugada menos estable se opondría al aumento de acidez indicado."
          }
        },
        {
          "text": {
            "en": "Chlorine must leave as chloride during proton donation.",
            "es": "El cloro debe salir como cloruro durante la donación de protones."
          },
          "why": {
            "en": "The acidic proton leaves the carboxyl group; the carbon-chlorine bond remains.",
            "es": "El protón ácido sale del grupo carboxilo; el enlace carbono-cloro permanece."
          }
        },
        {
          "text": {
            "en": "The two acids must have equal strength because both have a carboxyl group.",
            "es": "Los dos ácidos deben tener la misma fuerza porque ambos tienen un grupo carboxilo."
          },
          "why": {
            "en": "Nearby substituents can change conjugate-base stability even with the same acidic group.",
            "es": "Los sustituyentes cercanos pueden cambiar la estabilidad de la base conjugada incluso con el mismo grupo ácido."
          }
        },
        {
          "text": {
            "en": "Nearby chlorine stabilizes the conjugate base by an inductive effect.",
            "es": "El cloro cercano estabiliza la base conjugada mediante un efecto inductivo."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "The nearby electronegative chlorine withdraws electron density through bonds. This inductive effect stabilizes the conjugate base and favors ionization.",
        "es": "El cloro electronegativo cercano atrae densidad electrónica a través de los enlaces. Este efecto inductivo estabiliza la base conjugada y favorece la ionización."
      }
    },
    {
      "id": "8.6-4",
      "topic": "8.6",
      "type": "mc",
      "prompt": {
        "en": "Why is a carboxylic acid generally a stronger acid than an alcohol with a similar carbon skeleton?",
        "es": "¿Por qué un ácido carboxílico suele ser más fuerte que un alcohol con un esqueleto de carbono similar?"
      },
      "choices": [
        {
          "text": {
            "en": "An alcohol cannot lose a proton under any conditions.",
            "es": "Un alcohol no puede perder un protón en ninguna condición."
          },
          "why": {
            "en": "Alcohols can donate a proton but do so much less readily in water.",
            "es": "Los alcoholes pueden donar un protón, pero lo hacen con mucha menor facilidad en agua."
          }
        },
        {
          "text": {
            "en": "Resonance means oxygen atoms exchange places.",
            "es": "La resonancia significa que los átomos de oxígeno intercambian lugares."
          },
          "why": {
            "en": "Resonance describes electron delocalization, not atomic motion.",
            "es": "La resonancia describe la deslocalización de electrones, no el movimiento de átomos."
          }
        },
        {
          "text": {
            "en": "Resonance stabilizes the carboxylate conjugate base.",
            "es": "La resonancia estabiliza la base conjugada carboxilato."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Carboxylate has no negative charge.",
            "es": "El carboxilato no tiene carga negativa."
          },
          "why": {
            "en": "Resonance distributes the negative charge; it does not eliminate it.",
            "es": "La resonancia distribuye la carga negativa; no la elimina."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "A carboxylate ion delocalizes negative charge over two oxygen atoms by resonance. An alkoxide lacks this comparable resonance stabilization.",
        "es": "Un ion carboxilato deslocaliza la carga negativa entre dos átomos de oxígeno por resonancia. Un alcóxido carece de esta estabilización comparable por resonancia."
      }
    },
    {
      "id": "8.6-5",
      "topic": "8.6",
      "type": "numeric",
      "prompt": {
        "en": "For HF at 25 °C, Ka = 6.8 × 10<sup>−4</sup>. Calculate pKa.",
        "es": "Para HF a 25 °C, Ka = 6.8 × 10<sup>−4</sup>. Calcula pKa."
      },
      "value": 3.167491087293764,
      "display": "3.17",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "pKa = −log(6.8 × 10<sup>−4</sup>) = 3.17. A smaller pKa means a stronger acid. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "pKa = −log(6.8 × 10<sup>−4</sup>) = 3.17. Un pKa menor significa un ácido más fuerte. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.6-6",
      "topic": "8.6",
      "type": "numeric",
      "prompt": {
        "en": "Acetic acid has Ka = 1.8 × 10<sup>−5</sup> at 25 °C. Calculate Kb for its conjugate base, acetate.",
        "es": "El ácido acético tiene Ka = 1.8 × 10<sup>−5</sup> a 25 °C. Calcula Kb para su base conjugada, el acetato."
      },
      "value": 5.555555555555555e-10,
      "display": "5.6e-10",
      "unit": "ratio",
      "precision": {
        "sf": 2
      },
      "tolerance": 5.5e-12,
      "explanation": {
        "en": "For a conjugate pair, Ka × Kb = Kw. Kb = 1.0 × 10<sup>−14</sup> / (1.8 × 10<sup>−5</sup>) = 5.6 × 10<sup>−10</sup>. Use no units.",
        "es": "Para un par conjugado, Ka × Kb = Kw. Kb = 1.0 × 10<sup>−14</sup> / (1.8 × 10<sup>−5</sup>) = 5.6 × 10<sup>−10</sup>. Usa sin unidades."
      }
    },
    {
      "id": "8.7-1",
      "topic": "8.7",
      "type": "mc",
      "prompt": {
        "en": "A weak acid HA is in a solution whose pH is below its pKa. Which form dominates?",
        "es": "Un ácido débil HA está en una solución cuyo pH es menor que su pKa. ¿Qué forma predomina?"
      },
      "choices": [
        {
          "text": {
            "en": "HA",
            "es": "HA"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A<sup>−</sup>",
            "es": "A<sup>−</sup>"
          },
          "why": {
            "en": "The deprotonated form dominates above pKa, not below it.",
            "es": "La forma desprotonada predomina por encima del pKa, no por debajo."
          }
        },
        {
          "text": {
            "en": "Equal amounts of both forms",
            "es": "Cantidades iguales de ambas formas"
          },
          "why": {
            "en": "Equal amounts occur when pH equals pKa.",
            "es": "Las cantidades iguales aparecen cuando el pH es igual al pKa."
          }
        },
        {
          "text": {
            "en": "Neither form can exist",
            "es": "Ninguna forma puede existir"
          },
          "why": {
            "en": "Both forms can exist at equilibrium; the pH sets their relative amounts.",
            "es": "Ambas formas pueden existir en el equilibrio; el pH determina sus cantidades relativas."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "pH < pKa means log([A<sup>−</sup>]/[HA]) < 0, so [A<sup>−</sup>]/[HA] < 1 and HA dominates.",
        "es": "pH < pKa significa log([A<sup>−</sup>]/[HA]) < 0, así que [A<sup>−</sup>]/[HA] < 1 y predomina HA."
      }
    },
    {
      "id": "8.7-2",
      "topic": "8.7",
      "type": "mc",
      "prompt": {
        "en": "A solution has pH greater than the pKa of HA. Which form dominates?",
        "es": "Una solución tiene un pH mayor que el pKa de HA. ¿Qué forma predomina?"
      },
      "choices": [
        {
          "text": {
            "en": "HA",
            "es": "HA"
          },
          "why": {
            "en": "The protonated acid dominates below pKa.",
            "es": "El ácido protonado predomina por debajo del pKa."
          }
        },
        {
          "text": {
            "en": "Both must have equal concentrations",
            "es": "Ambas deben tener concentraciones iguales"
          },
          "why": {
            "en": "Equality requires pH = pKa.",
            "es": "La igualdad requiere pH = pKa."
          }
        },
        {
          "text": {
            "en": "All acid molecules disappear completely",
            "es": "Todas las moléculas del ácido desaparecen por completo"
          },
          "why": {
            "en": "Dominant does not mean exclusive; an equilibrium amount of HA remains.",
            "es": "Predominante no significa exclusiva; queda una cantidad de HA en el equilibrio."
          }
        },
        {
          "text": {
            "en": "A<sup>−</sup>",
            "es": "A<sup>−</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "pH > pKa means [A<sup>−</sup>]/[HA] > 1. The conjugate base A<sup>−</sup> dominates.",
        "es": "pH > pKa significa [A<sup>−</sup>]/[HA] > 1. Predomina la base conjugada A<sup>−</sup>."
      }
    },
    {
      "id": "8.7-3",
      "topic": "8.7",
      "type": "mc",
      "prompt": {
        "en": "The species-versus-pH model shows the HA fraction falling and the conjugate-base fraction rising. Both equal 0.50 at the crossing. What does the crossing represent?",
        "es": "El modelo de especies contra pH muestra que la fracción de HA disminuye y la de la base conjugada aumenta. Ambas son 0.50 en el cruce. ¿Qué representa el cruce?"
      },
      "choices": [
        {
          "text": {
            "en": "The acid has fully ionized",
            "es": "El ácido se ha ionizado por completo"
          },
          "why": {
            "en": "The equal fractions show appreciable amounts of both forms.",
            "es": "Las fracciones iguales muestran cantidades apreciables de ambas formas."
          }
        },
        {
          "text": {
            "en": "The conjugate base has disappeared",
            "es": "La base conjugada ha desaparecido"
          },
          "why": {
            "en": "Its modeled fraction is nonzero and equals that of HA.",
            "es": "Su fracción en el modelo es distinta de cero e igual a la de HA."
          }
        },
        {
          "text": {
            "en": "pH = pKa",
            "es": "pH = pKa"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "pH must be 7.00",
            "es": "El pH debe ser 7.00"
          },
          "why": {
            "en": "The crossing depends on the acid constant, not on the neutral pH of water.",
            "es": "El cruce depende de la constante del ácido, no del pH neutro del agua."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Equal fractions mean [HA] = [A<sup>−</sup>]. The ratio is unity, so pH = pKa. The model shows fractions, not absolute concentrations.",
        "es": "Las fracciones iguales significan [HA] = [A<sup>−</sup>]. La razón es unitaria, así que pH = pKa. El modelo muestra fracciones, no concentraciones absolutas."
      },
      "species": true
    },
    {
      "id": "8.7-4",
      "topic": "8.7",
      "type": "mc",
      "prompt": {
        "en": "At the same temperature, acid X has pKa 3.00 and acid Y has pKa 5.00. Which is stronger?",
        "es": "A la misma temperatura, el ácido X tiene un pKa de 3.00 y el ácido Y tiene un pKa de 5.00. ¿Cuál es más fuerte?"
      },
      "choices": [
        {
          "text": {
            "en": "Their concentrations are required to compare Ka",
            "es": "Se requieren sus concentraciones para comparar Ka"
          },
          "why": {
            "en": "The supplied pKa values already determine their relative intrinsic strengths.",
            "es": "Los valores de pKa dados ya determinan sus fuerzas intrínsecas relativas."
          }
        },
        {
          "text": {
            "en": "X, because its Ka is larger",
            "es": "X, porque su Ka es mayor"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Y, because its pKa is larger",
            "es": "Y, porque su pKa es mayor"
          },
          "why": {
            "en": "A larger negative logarithm corresponds to a smaller acid dissociation constant.",
            "es": "Un logaritmo negativo mayor corresponde a una constante de acidez menor."
          }
        },
        {
          "text": {
            "en": "They are equally strong because both are acids",
            "es": "Tienen la misma fuerza porque ambos son ácidos"
          },
          "why": {
            "en": "Acids can have very different dissociation constants.",
            "es": "Los ácidos pueden tener constantes de acidez muy distintas."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Because pKa = −log Ka, the lower pKa corresponds to the larger Ka. Acid X is stronger.",
        "es": "Como pKa = −log Ka, el pKa menor corresponde a la Ka mayor. El ácido X es más fuerte."
      }
    },
    {
      "id": "8.7-5",
      "topic": "8.7",
      "type": "numeric",
      "prompt": {
        "en": "A measured Ka for acetic acid is 1.80 × 10<sup>−5</sup> at 25 °C. Calculate pKa using the precision of this measurement.",
        "es": "Una Ka medida para el ácido acético es 1.80 × 10<sup>−5</sup> a 25 °C. Calcula pKa con la precisión de esta medición."
      },
      "value": 4.7447274948966935,
      "display": "4.745",
      "unit": "ratio",
      "precision": {
        "decimals": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "pKa = −log(1.80 × 10<sup>−5</sup>) = 4.745. This question supplies a more precise Ka measurement than the two-significant-figure reference value. Log rule: use 3 decimal places because the governing concentration or K value has 3 significant figures.",
        "es": "pKa = −log(1.80 × 10<sup>−5</sup>) = 4.745. Esta pregunta proporciona una medición de Ka más precisa que el valor de referencia de dos cifras significativas. Regla de logaritmos: usa 3 decimales porque la concentración o el valor de K que determina la precisión tiene 3 cifras significativas."
      }
    },
    {
      "id": "8.7-6",
      "topic": "8.7",
      "type": "numeric",
      "prompt": {
        "en": "For an HA/A<sup>−</sup> pair, pKa = 4.74 and pH = 5.74. Calculate the equilibrium ratio [A<sup>−</sup>]/[HA].",
        "es": "Para un par HA/A<sup>−</sup>, pKa = 4.74 y pH = 5.74. Calcula la razón en el equilibrio [A<sup>−</sup>]/[HA]."
      },
      "value": 10.0,
      "display": "1.0e1",
      "unit": "ratio",
      "precision": {
        "sf": 2
      },
      "tolerance": 0.55,
      "explanation": {
        "en": "log([A<sup>−</sup>]/[HA]) = 5.74 − 4.74 = 1.00. The ratio is 10<sup>1.00</sup> = 1.0 × 10<sup>1</sup>. The inverse log of a value with two decimal places has two significant figures.",
        "es": "log([A<sup>−</sup>]/[HA]) = 5.74 − 4.74 = 1.00. La razón es 10<sup>1.00</sup> = 1.0 × 10<sup>1</sup>. El logaritmo inverso de un valor con dos decimales tiene dos cifras significativas."
      }
    },
    {
      "id": "8.8-1",
      "topic": "8.8",
      "type": "mc",
      "prompt": {
        "en": "What does the conjugate base A<sup>−</sup> do when a small amount of strong acid is added to an HA/A<sup>−</sup> buffer?",
        "es": "¿Qué hace la base conjugada A<sup>−</sup> cuando se agrega una cantidad pequeña de ácido fuerte a un amortiguador HA/A<sup>−</sup>?"
      },
      "choices": [
        {
          "text": {
            "en": "It releases hydroxide in a one-step complete dissociation.",
            "es": "Libera hidróxido en una disociación completa de un solo paso."
          },
          "why": {
            "en": "A weak conjugate base consumes the acid directly; it is not a fully dissociating hydroxide salt.",
            "es": "Una base conjugada débil consume el ácido directamente; no es una sal de hidróxido que se disocia por completo."
          }
        },
        {
          "text": {
            "en": "It reacts with HA to remove both components.",
            "es": "Reacciona con HA para eliminar ambos componentes."
          },
          "why": {
            "en": "The relevant added reactant is hydronium, not the weak acid partner.",
            "es": "El reactivo agregado relevante es el hidronio, no el ácido débil de la pareja."
          }
        },
        {
          "text": {
            "en": "It prevents any change in the component ratio.",
            "es": "Impide cualquier cambio en la razón de componentes."
          },
          "why": {
            "en": "Reacting with acid decreases conjugate base and increases HA, so the ratio changes.",
            "es": "Reaccionar con el ácido disminuye la base conjugada y aumenta HA, así que la razón cambia."
          }
        },
        {
          "text": {
            "en": "It consumes added hydronium and becomes HA.",
            "es": "Consume el hidronio agregado y se convierte en HA."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "A<sup>−</sup>(aq) + H<sub>3</sub>O<sup>+</sup>(aq) → HA(aq) + H<sub>2</sub>O(l). This consumes most of the added hydronium and limits the pH change.",
        "es": "A<sup>−</sup>(aq) + H<sub>3</sub>O<sup>+</sup>(aq) → HA(aq) + H<sub>2</sub>O(l). Esto consume la mayor parte del hidronio agregado y limita el cambio de pH."
      }
    },
    {
      "id": "8.8-2",
      "topic": "8.8",
      "type": "mc",
      "prompt": {
        "en": "What does HA do when a small amount of NaOH is added to an HA/A<sup>−</sup> buffer?",
        "es": "¿Qué hace HA cuando se agrega una cantidad pequeña de NaOH a un amortiguador HA/A<sup>−</sup>?"
      },
      "choices": [
        {
          "text": {
            "en": "It leaves all the hydroxide unreacted.",
            "es": "Deja todo el hidróxido sin reaccionar."
          },
          "why": {
            "en": "The weak acid reacts with added strong base by neutralization.",
            "es": "El ácido débil reacciona con la base fuerte agregada mediante neutralización."
          }
        },
        {
          "text": {
            "en": "It makes the pH fall sharply.",
            "es": "Hace que el pH disminuya mucho."
          },
          "why": {
            "en": "Adding base usually raises buffer pH slightly while the acid component remains available.",
            "es": "Agregar base suele aumentar ligeramente el pH del amortiguador mientras el componente ácido siga disponible."
          }
        },
        {
          "text": {
            "en": "It consumes hydroxide and becomes the conjugate base.",
            "es": "Consume el hidróxido y se convierte en la base conjugada."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It consumes hydroxide and produces more HA.",
            "es": "Consume el hidróxido y produce más HA."
          },
          "why": {
            "en": "Proton donation converts HA into its conjugate base.",
            "es": "La donación de un protón convierte HA en su base conjugada."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "HA(aq) + OH<sup>−</sup>(aq) → A<sup>−</sup>(aq) + H<sub>2</sub>O(l). The weak acid consumes added hydroxide, limiting the increase in pH.",
        "es": "HA(aq) + OH<sup>−</sup>(aq) → A<sup>−</sup>(aq) + H<sub>2</sub>O(l). El ácido débil consume el hidróxido agregado y limita el aumento del pH."
      }
    },
    {
      "id": "8.8-3",
      "topic": "8.8",
      "type": "mc",
      "prompt": {
        "en": "A buffer is diluted tenfold with water. Compare equal final sample volumes before and after dilution. What changes, using the buffer approximation?",
        "es": "Un amortiguador se diluye diez veces con agua. Compara volúmenes finales iguales de muestra antes y después de la dilución. ¿Qué cambia, con la aproximación de amortiguador?"
      },
      "choices": [
        {
          "text": {
            "en": "Ka decreases tenfold.",
            "es": "Ka disminuye diez veces."
          },
          "why": {
            "en": "Dilution at fixed temperature does not change the acid constant.",
            "es": "La dilución a temperatura fija no cambia la constante del ácido."
          }
        },
        {
          "text": {
            "en": "pH is nearly unchanged, but capacity per volume decreases.",
            "es": "El pH casi no cambia, pero la capacidad por volumen disminuye."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "pH increases by a full unit and capacity is unchanged.",
            "es": "El pH aumenta una unidad completa y la capacidad no cambia."
          },
          "why": {
            "en": "The conjugate ratio is preserved; this is different from diluting an unbuffered strong acid.",
            "es": "La razón conjugada se conserva; esto es distinto de diluir un ácido fuerte sin amortiguador."
          }
        },
        {
          "text": {
            "en": "Capacity increases because there is more water.",
            "es": "La capacidad aumenta porque hay más agua."
          },
          "why": {
            "en": "Water does not replace the acid and base components consumed during buffering.",
            "es": "El agua no sustituye los componentes ácido y básico consumidos durante la acción amortiguadora."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Both conjugate concentrations decrease by the same factor, preserving their ratio approximately. The diluted sample contains fewer reacting moles per volume, so its buffer capacity is lower.",
        "es": "Ambas concentraciones conjugadas disminuyen por el mismo factor y conservan aproximadamente su razón. La muestra diluida contiene menos moles reactivos por volumen, así que su capacidad amortiguadora es menor."
      }
    },
    {
      "id": "8.8-4",
      "topic": "8.8",
      "type": "mc",
      "prompt": {
        "en": "Why can a sufficiently large addition of acid overwhelm a buffer?",
        "es": "¿Por qué una adición suficientemente grande de ácido puede superar la acción de un amortiguador?"
      },
      "choices": [
        {
          "text": {
            "en": "The acid-consuming component is finite and can be depleted.",
            "es": "El componente que consume ácido es finito y puede agotarse."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A buffer makes unlimited conjugate base from nothing.",
            "es": "Un amortiguador produce una cantidad ilimitada de base conjugada de la nada."
          },
          "why": {
            "en": "Buffering must conserve matter and consumes available components.",
            "es": "La acción amortiguadora debe conservar la materia y consume los componentes disponibles."
          }
        },
        {
          "text": {
            "en": "The added acid changes the temperature-independent definition of Ka.",
            "es": "El ácido agregado cambia la definición de Ka, que es independiente de la temperatura."
          },
          "why": {
            "en": "The limit comes from stoichiometric amounts; Ka itself depends on temperature.",
            "es": "El límite proviene de las cantidades estequiométricas; Ka sí depende de la temperatura."
          }
        },
        {
          "text": {
            "en": "Buffers are designed to stop all pH change forever.",
            "es": "Los amortiguadores están diseñados para detener todo cambio de pH para siempre."
          },
          "why": {
            "en": "They resist small additions within finite capacity; they do not fix pH exactly.",
            "es": "Resisten adiciones pequeñas dentro de una capacidad finita; no fijan el pH exactamente."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A buffer contains a finite amount of A<sup>−</sup> to react with acid. Once that component is substantially depleted, added hydronium can cause a large pH change.",
        "es": "Un amortiguador contiene una cantidad finita de A<sup>−</sup> para reaccionar con el ácido. Cuando ese componente se agota en gran medida, el hidronio agregado puede causar un cambio grande de pH."
      }
    },
    {
      "id": "8.8-5",
      "topic": "8.8",
      "type": "numeric",
      "prompt": {
        "en": "An acetic acid/acetate buffer contains 0.0200 mol acid and 0.0300 mol acetate. Add 0.00500 mol HCl. With Ka = 1.8 × 10<sup>−5</sup>, calculate the pH after reaction using the buffer approximation.",
        "es": "Un amortiguador de ácido acético/acetato contiene 0.0200 mol de ácido y 0.0300 mol de acetato. Agrega 0.00500 mol de HCl. Con Ka = 1.8 × 10<sup>−5</sup>, calcula el pH después de la reacción con la aproximación de amortiguador."
      },
      "value": 4.7447274948966935,
      "display": "4.74",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Added hydronium converts acetate into acetic acid. Final amounts are 0.0250 mol acid and 0.0250 mol acetate. Their ratio is unity, so pH = pKa = 4.74. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "El hidronio agregado convierte acetato en ácido acético. Las cantidades finales son 0.0250 mol de ácido y 0.0250 mol de acetato. Su razón es unitaria, así que pH = pKa = 4.74. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.8-6",
      "topic": "8.8",
      "type": "numeric",
      "prompt": {
        "en": "An acetic acid/acetate buffer has equilibrium [acid] = 0.100 M and [acetate] = 0.200 M. With Ka = 1.8 × 10<sup>−5</sup>, calculate [H<sub>3</sub>O<sup>+</sup>] in M.",
        "es": "Un amortiguador de ácido acético/acetato tiene [ácido] = 0.100 M y [acetato] = 0.200 M en el equilibrio. Con Ka = 1.8 × 10<sup>−5</sup>, calcula [H<sub>3</sub>O<sup>+</sup>] en M."
      },
      "value": 9e-06,
      "display": "9.0e-6",
      "unit": "M",
      "precision": {
        "sf": 2
      },
      "tolerance": 5.5e-08,
      "explanation": {
        "en": "Rearrange Ka = [H<sub>3</sub>O<sup>+</sup>][acetate]/[acid]. Thus [H<sub>3</sub>O<sup>+</sup>] = 1.8 × 10<sup>−5</sup> × 0.100/0.200 = 9.0 × 10<sup>−6</sup> M.",
        "es": "Despeja Ka = [H<sub>3</sub>O<sup>+</sup>][acetato]/[ácido]. Así, [H<sub>3</sub>O<sup>+</sup>] = 1.8 × 10<sup>−5</sup> × 0.100/0.200 = 9.0 × 10<sup>−6</sup> M."
      }
    },
    {
      "id": "8.9-1",
      "topic": "8.9",
      "type": "mc",
      "prompt": {
        "en": "Which Henderson-Hasselbalch equation applies to an HA/A<sup>−</sup> buffer?",
        "es": "¿Qué ecuación de Henderson-Hasselbalch corresponde a un amortiguador HA/A<sup>−</sup>?"
      },
      "choices": [
        {
          "text": {
            "en": "pH = Ka + log([A<sup>−</sup>]/[HA])",
            "es": "pH = Ka + log([A<sup>−</sup>]/[HA])"
          },
          "why": {
            "en": "Use the negative logarithm of Ka, not Ka itself.",
            "es": "Usa el logaritmo negativo de Ka, no Ka directamente."
          }
        },
        {
          "text": {
            "en": "pH = pKa × ([A<sup>−</sup>]/[HA])",
            "es": "pH = pKa × ([A<sup>−</sup>]/[HA])"
          },
          "why": {
            "en": "The dependence on the ratio is logarithmic and additive.",
            "es": "La dependencia de la razón es logarítmica y aditiva."
          }
        },
        {
          "text": {
            "en": "pH = pKa + log([A<sup>−</sup>]/[HA])",
            "es": "pH = pKa + log([A<sup>−</sup>]/[HA])"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "pH = pKa + log([HA]/[A<sup>−</sup>])",
            "es": "pH = pKa + log([HA]/[A<sup>−</sup>])"
          },
          "why": {
            "en": "The conjugate-base concentration belongs above the acid concentration.",
            "es": "La concentración de la base conjugada va sobre la del ácido."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "Rearranging Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA] and taking negative logarithms gives pH = pKa + log([A<sup>−</sup>]/[HA]).",
        "es": "Al despejar Ka = [H<sub>3</sub>O<sup>+</sup>][A<sup>−</sup>]/[HA] y tomar logaritmos negativos se obtiene pH = pKa + log([A<sup>−</sup>]/[HA])."
      }
    },
    {
      "id": "8.9-2",
      "topic": "8.9",
      "type": "mc",
      "prompt": {
        "en": "Strong acid is added to a buffer and both conjugate components remain appreciable. What must happen before a Henderson-Hasselbalch calculation?",
        "es": "Se agrega ácido fuerte a un amortiguador y ambos componentes conjugados quedan en cantidades apreciables. ¿Qué debe ocurrir antes de un cálculo con Henderson-Hasselbalch?"
      },
      "choices": [
        {
          "text": {
            "en": "Set the acid concentration equal to zero.",
            "es": "Iguala la concentración del ácido a cero."
          },
          "why": {
            "en": "Added hydronium creates more weak acid rather than eliminating it.",
            "es": "El hidronio agregado produce más ácido débil en lugar de eliminarlo."
          }
        },
        {
          "text": {
            "en": "Calculate the complete neutralization and use the resulting amounts.",
            "es": "Calcula la neutralización completa y usa las cantidades resultantes."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Use the original component amounts without changes.",
            "es": "Usa las cantidades originales de los componentes sin cambios."
          },
          "why": {
            "en": "This ignores the material consumed and produced by added acid.",
            "es": "Esto ignora el material consumido y producido por el ácido agregado."
          }
        },
        {
          "text": {
            "en": "Add the pH of the strong acid to the buffer pH.",
            "es": "Suma el pH del ácido fuerte al pH del amortiguador."
          },
          "why": {
            "en": "pH values cannot be added to describe mixing.",
            "es": "Los valores de pH no se pueden sumar para describir una mezcla."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "First neutralize the added hydronium with the conjugate base. Then use the remaining base and newly increased acid amounts in the ratio.",
        "es": "Primero neutraliza el hidronio agregado con la base conjugada. Después usa las cantidades restantes de base y las cantidades aumentadas de ácido en la razón."
      }
    },
    {
      "id": "8.9-3",
      "topic": "8.9",
      "type": "mc",
      "prompt": {
        "en": "Why can a buffer calculation use a ratio of conjugate mole amounts instead of a ratio of their concentrations?",
        "es": "¿Por qué un cálculo de amortiguador puede usar una razón de cantidades de moles conjugados en lugar de una razón de sus concentraciones?"
      },
      "choices": [
        {
          "text": {
            "en": "The same final solution volume cancels.",
            "es": "El mismo volumen final de solución se cancela."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Moles and molarity are identical units.",
            "es": "Los moles y la molaridad son unidades idénticas."
          },
          "why": {
            "en": "Moles are an amount; molarity is an amount per volume.",
            "es": "Los moles son una cantidad; la molaridad es una cantidad por volumen."
          }
        },
        {
          "text": {
            "en": "Volumes never matter in equilibrium calculations.",
            "es": "Los volúmenes nunca importan en los cálculos de equilibrio."
          },
          "why": {
            "en": "They cancel only in this shared-volume ratio, not in every expression.",
            "es": "Solo se cancelan en esta razón con volumen compartido, no en toda expresión."
          }
        },
        {
          "text": {
            "en": "Each component occupies its own independent volume.",
            "es": "Cada componente ocupa su propio volumen independiente."
          },
          "why": {
            "en": "Dissolved components share the same solution volume.",
            "es": "Los componentes disueltos comparten el mismo volumen de solución."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Both components occupy the same final volume. Dividing each mole amount by that volume makes the volume cancel in the ratio.",
        "es": "Ambos componentes ocupan el mismo volumen final. Al dividir cada cantidad de moles entre ese volumen, el volumen se cancela en la razón."
      }
    },
    {
      "id": "8.9-4",
      "topic": "8.9",
      "type": "mc",
      "prompt": {
        "en": "At the equivalence point of a weak acid titrated with strong base, why is the usual buffer approximation unsuitable?",
        "es": "En el punto de equivalencia de un ácido débil titulado con base fuerte, ¿por qué no sirve la aproximación habitual de amortiguador?"
      },
      "choices": [
        {
          "text": {
            "en": "The acid constant becomes zero.",
            "es": "La constante de acidez se vuelve cero."
          },
          "why": {
            "en": "Neutralization changes amounts, not the acid constant at fixed temperature.",
            "es": "La neutralización cambia las cantidades, no la constante de acidez a temperatura fija."
          }
        },
        {
          "text": {
            "en": "The pH must equal pKa at equivalence.",
            "es": "El pH debe ser igual al pKa en el punto de equivalencia."
          },
          "why": {
            "en": "That equality applies at half-equivalence in the buffer region.",
            "es": "Esa igualdad corresponde al punto de semiequivalencia en la región de amortiguador."
          }
        },
        {
          "text": {
            "en": "The solution contains no ions.",
            "es": "La solución no contiene iones."
          },
          "why": {
            "en": "The conjugate base and counterions remain dissolved.",
            "es": "La base conjugada y los contraiones permanecen disueltos."
          }
        },
        {
          "text": {
            "en": "No appreciable HA remains; use conjugate-base hydrolysis.",
            "es": "No queda HA en cantidad apreciable; usa la hidrólisis de la base conjugada."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "There is no appreciable unreacted HA after stoichiometric neutralization. Solve A<sup>−</sup>(aq) + H<sub>2</sub>O(l) ⇌ HA(aq) + OH<sup>−</sup>(aq) using Kb instead.",
        "es": "No queda HA sin reaccionar en cantidad apreciable después de la neutralización estequiométrica. Resuelve A<sup>−</sup>(aq) + H<sub>2</sub>O(l) ⇌ HA(aq) + OH<sup>−</sup>(aq) con Kb."
      }
    },
    {
      "id": "8.9-5",
      "topic": "8.9",
      "type": "numeric",
      "prompt": {
        "en": "An acetic acid/acetate buffer has 0.100 M acid and 0.250 M acetate. With Ka = 1.8 × 10<sup>−5</sup>, calculate pH using the buffer approximation.",
        "es": "Un amortiguador de ácido acético/acetato tiene ácido 0.100 M y acetato 0.250 M. Con Ka = 1.8 × 10<sup>−5</sup>, calcula el pH con la aproximación de amortiguador."
      },
      "value": 5.142667503568731,
      "display": "5.14",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "pH = −log(1.8 × 10<sup>−5</sup>) + log(0.250/0.100) = 5.14. Use the conjugate base over acid and keep pKa unrounded during calculation. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "pH = −log(1.8 × 10<sup>−5</sup>) + log(0.250/0.100) = 5.14. Usa la base conjugada sobre el ácido y conserva pKa sin redondear durante el cálculo. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.9-6",
      "topic": "8.9",
      "type": "numeric",
      "prompt": {
        "en": "Design an acetic acid/acetate buffer at pH 5.00. With Ka = 1.8 × 10<sup>−5</sup>, calculate the required equilibrium [acetate]/[acid] ratio.",
        "es": "Diseña un amortiguador de ácido acético/acetato con un pH de 5.00. Con Ka = 1.8 × 10<sup>−5</sup>, calcula la razón requerida [acetato]/[ácido] en el equilibrio."
      },
      "value": 1.8,
      "display": "1.8",
      "unit": "ratio",
      "precision": {
        "sf": 2
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "[H<sub>3</sub>O<sup>+</sup>] = 10<sup>−5.00</sup> M. From Ka = [H<sub>3</sub>O<sup>+</sup>][acetate]/[acid], the ratio is 1.8 × 10<sup>−5</sup> / 10<sup>−5.00</sup> = 1.8. This ratio has no units.",
        "es": "[H<sub>3</sub>O<sup>+</sup>] = 10<sup>−5.00</sup> M. A partir de Ka = [H<sub>3</sub>O<sup>+</sup>][acetato]/[ácido], la razón es 1.8 × 10<sup>−5</sup> / 10<sup>−5.00</sup> = 1.8. Esta razón no tiene unidades."
      }
    },
    {
      "id": "8.10-1",
      "topic": "8.10",
      "type": "mc",
      "prompt": {
        "en": "Two equal-volume acetic acid/acetate buffers have the same ratio. One has ten times the total conjugate concentration. Which has greater buffer capacity?",
        "es": "Dos amortiguadores de ácido acético/acetato de igual volumen tienen la misma razón. Uno tiene diez veces la concentración conjugada total. ¿Cuál tiene mayor capacidad amortiguadora?"
      },
      "choices": [
        {
          "text": {
            "en": "Neither can react with added acid",
            "es": "Ninguno puede reaccionar con ácido agregado"
          },
          "why": {
            "en": "Both contain the conjugate base that consumes hydronium.",
            "es": "Ambos contienen la base conjugada que consume hidronio."
          }
        },
        {
          "text": {
            "en": "The more concentrated buffer",
            "es": "El amortiguador más concentrado"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The less concentrated buffer",
            "es": "El amortiguador menos concentrado"
          },
          "why": {
            "en": "Fewer reacting moles means less capacity, not more.",
            "es": "Menos moles reactivos significa menor capacidad, no mayor."
          }
        },
        {
          "text": {
            "en": "Both must have the same capacity because their pH is the same",
            "es": "Ambos deben tener la misma capacidad porque su pH es igual"
          },
          "why": {
            "en": "The pH depends mainly on ratio, while capacity also depends on total concentration.",
            "es": "El pH depende principalmente de la razón, mientras que la capacidad también depende de la concentración total."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "At fixed ratio and volume, the more concentrated buffer has more moles of both components available to consume added acid or base.",
        "es": "A razón y volumen fijos, el amortiguador más concentrado tiene más moles de ambos componentes disponibles para consumir ácido o base agregados."
      }
    },
    {
      "id": "8.10-2",
      "topic": "8.10",
      "type": "mc",
      "prompt": {
        "en": "At fixed total conjugate concentration and volume, which ratio gives the best balanced capacity for both added acid and added base?",
        "es": "A concentración conjugada total y volumen fijos, ¿qué razón da la capacidad mejor equilibrada tanto para ácido como para base agregados?"
      },
      "choices": [
        {
          "text": {
            "en": "Equal concentrations of weak acid and conjugate base",
            "es": "Concentraciones iguales del ácido débil y su base conjugada"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Almost only weak acid",
            "es": "Casi solo ácido débil"
          },
          "why": {
            "en": "This leaves little conjugate base to consume added acid.",
            "es": "Esto deja poca base conjugada para consumir ácido agregado."
          }
        },
        {
          "text": {
            "en": "Almost only conjugate base",
            "es": "Casi solo base conjugada"
          },
          "why": {
            "en": "This leaves little weak acid to consume added base.",
            "es": "Esto deja poco ácido débil para consumir base agregada."
          }
        },
        {
          "text": {
            "en": "No conjugate components at all",
            "es": "Ningún componente conjugado"
          },
          "why": {
            "en": "Without the components there is no buffer capacity.",
            "es": "Sin los componentes no hay capacidad amortiguadora."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A ratio near unity provides substantial amounts of both components. A very skewed ratio limits capacity in one direction.",
        "es": "Una razón cercana a la unidad aporta cantidades considerables de ambos componentes. Una razón muy desigual limita la capacidad en una dirección."
      }
    },
    {
      "id": "8.10-3",
      "topic": "8.10",
      "type": "mc",
      "prompt": {
        "en": "Two equal-volume buffers have the same total [HA] + [A<sup>−</sup>]. One is rich in A<sup>−</sup> and the other is rich in HA. Which better consumes added strong acid before its base component is depleted?",
        "es": "Dos amortiguadores de igual volumen tienen la misma suma [HA] + [A<sup>−</sup>]. Uno es rico en A<sup>−</sup> y el otro en HA. ¿Cuál consume mejor el ácido fuerte agregado antes de que se agote su componente básico?"
      },
      "choices": [
        {
          "text": {
            "en": "The buffer rich in HA",
            "es": "El amortiguador rico en HA"
          },
          "why": {
            "en": "HA consumes added base rather than supplying the base needed to consume acid.",
            "es": "HA consume base agregada en lugar de aportar la base necesaria para consumir ácido."
          }
        },
        {
          "text": {
            "en": "They must be identical in both directions",
            "es": "Deben ser idénticos en ambas direcciones"
          },
          "why": {
            "en": "The unequal component amounts give different capacities for acid and base additions.",
            "es": "Las cantidades desiguales de componentes dan capacidades distintas para las adiciones de ácido y base."
          }
        },
        {
          "text": {
            "en": "Neither, because adding acid is never a buffer process",
            "es": "Ninguno, porque agregar ácido nunca es un proceso de amortiguación"
          },
          "why": {
            "en": "Conjugate base consuming added acid is a main buffer function.",
            "es": "Que la base conjugada consuma ácido agregado es una función principal del amortiguador."
          }
        },
        {
          "text": {
            "en": "The buffer rich in A<sup>−</sup>",
            "es": "El amortiguador rico en A<sup>−</sup>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Each added hydronium ion consumes a conjugate-base ion. More A<sup>−</sup> supplies greater stoichiometric capacity for added acid, although the initial pH and balanced buffering differ.",
        "es": "Cada ion hidronio agregado consume un ion de la base conjugada. Más A<sup>−</sup> aporta mayor capacidad estequiométrica para el ácido agregado, aunque el pH inicial y el equilibrio de la acción amortiguadora difieren."
      }
    },
    {
      "id": "8.10-4",
      "topic": "8.10",
      "type": "mc",
      "prompt": {
        "en": "Two buffers made from the same conjugate pair have identical pH but very different total concentrations. Which conclusion is valid?",
        "es": "Dos amortiguadores hechos del mismo par conjugado tienen un pH idéntico, pero concentraciones totales muy distintas. ¿Qué conclusión es válida?"
      },
      "choices": [
        {
          "text": {
            "en": "Their Ka values must differ.",
            "es": "Sus valores de Ka deben diferir."
          },
          "why": {
            "en": "The same conjugate pair at the same temperature has the same Ka.",
            "es": "El mismo par conjugado a la misma temperatura tiene la misma Ka."
          }
        },
        {
          "text": {
            "en": "Neither can contain a weak acid.",
            "es": "Ninguno puede contener un ácido débil."
          },
          "why": {
            "en": "A weak acid and its conjugate base can produce identical pH at different concentrations.",
            "es": "Un ácido débil y su base conjugada pueden producir un pH idéntico a concentraciones distintas."
          }
        },
        {
          "text": {
            "en": "Their buffer capacities can differ.",
            "es": "Sus capacidades amortiguadoras pueden diferir."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Their total conjugate concentrations must be equal.",
            "es": "Sus concentraciones conjugadas totales deben ser iguales."
          },
          "why": {
            "en": "A ratio can stay constant while both component concentrations change together.",
            "es": "Una razón puede permanecer constante mientras ambas concentraciones de componentes cambian juntas."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "The same pH indicates approximately the same conjugate ratio. It does not specify the total concentration or capacity.",
        "es": "El mismo pH indica aproximadamente la misma razón conjugada. No especifica la concentración total ni la capacidad."
      }
    },
    {
      "id": "8.10-5",
      "topic": "8.10",
      "type": "numeric",
      "prompt": {
        "en": "A buffer has 0.0100 mol acetic acid and 0.0100 mol acetate. Add 0.00200 mol NaOH. With Ka = 1.8 × 10<sup>−5</sup>, calculate the final pH using the buffer approximation.",
        "es": "Un amortiguador tiene 0.0100 mol de ácido acético y 0.0100 mol de acetato. Agrega 0.00200 mol de NaOH. Con Ka = 1.8 × 10<sup>−5</sup>, calcula el pH final con la aproximación de amortiguador."
      },
      "value": 4.920818753952375,
      "display": "4.92",
      "unit": "ratio",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Hydroxide consumes acid and makes acetate. Final amounts: 0.00800 mol acid and 0.0120 mol acetate. pH = −log(1.8 × 10<sup>−5</sup>) + log(0.0120/0.00800) = 4.92. Log rule: use 2 decimal places because the governing concentration or K value has 2 significant figures.",
        "es": "El hidróxido consume ácido y produce acetato. Cantidades finales: 0.00800 mol de ácido y 0.0120 mol de acetato. pH = −log(1.8 × 10<sup>−5</sup>) + log(0.0120/0.00800) = 4.92. Regla de logaritmos: usa 2 decimales porque la concentración o el valor de K que determina la precisión tiene 2 cifras significativas."
      }
    },
    {
      "id": "8.10-6",
      "topic": "8.10",
      "type": "numeric",
      "prompt": {
        "en": "A buffer initially contains 0.0200 mol HA and 0.0200 mol conjugate base. After 0.00500 mol HCl reacts, how many additional moles of hydronium would consume all remaining conjugate base? Find the stoichiometric limit, not the useful buffer range.",
        "es": "Un amortiguador contiene inicialmente 0.0200 mol de HA y 0.0200 mol de base conjugada. Después de que reaccionan 0.00500 mol de HCl, ¿cuántos moles adicionales de hidronio consumirían toda la base conjugada restante? Calcula el límite estequiométrico, no el intervalo útil del amortiguador."
      },
      "value": 0.015,
      "display": "0.0150",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "A<sup>−</sup>(aq) + H<sub>3</sub>O<sup>+</sup>(aq) → HA(aq) + H<sub>2</sub>O(l). Base remaining = 0.0200 − 0.00500 = 0.0150 mol. This can consume 0.0150 mol more hydronium before total depletion. Useful buffering deteriorates before this limiting point.",
        "es": "A<sup>−</sup>(aq) + H<sub>3</sub>O<sup>+</sup>(aq) → HA(aq) + H<sub>2</sub>O(l). Base restante = 0.0200 − 0.00500 = 0.0150 mol. Puede consumir 0.0150 mol más de hidronio antes de agotarse por completo. La acción amortiguadora útil se deteriora antes de este punto límite."
      }
    },
    {
      "id": "8.11-1",
      "topic": "8.11",
      "type": "mc",
      "prompt": {
        "en": "Why does adding dilute acid increase the solubility of calcium carbonate at fixed temperature?",
        "es": "¿Por qué agregar ácido diluido aumenta la solubilidad del carbonato de calcio a temperatura fija?"
      },
      "choices": [
        {
          "text": {
            "en": "Hydronium consumes carbonate, favoring further dissolution.",
            "es": "El hidronio consume carbonato y favorece una mayor disolución."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Acid raises Ksp at fixed temperature.",
            "es": "El ácido aumenta Ksp a temperatura fija."
          },
          "why": {
            "en": "The fixed-temperature Ksp is unchanged; coupled acid-base reactions change the dissolved amounts.",
            "es": "Ksp no cambia a temperatura fija; las reacciones ácido-base acopladas cambian las cantidades disueltas."
          }
        },
        {
          "text": {
            "en": "Hydronium supplies a common calcium ion.",
            "es": "El hidronio aporta un ion calcio común."
          },
          "why": {
            "en": "Hydronium is not calcium, and consuming carbonate is the relevant effect.",
            "es": "El hidronio no es calcio y el efecto relevante es el consumo de carbonato."
          }
        },
        {
          "text": {
            "en": "Acid forces all carbonate to remain unprotonated.",
            "es": "El ácido obliga a que todo el carbonato permanezca sin protonarse."
          },
          "why": {
            "en": "Carbonate accepts protons from hydronium.",
            "es": "El carbonato acepta protones del hidronio."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Acid consumes the basic carbonate anion. Overall, CaCO<sub>3</sub>(s) + 2H<sub>3</sub>O<sup>+</sup>(aq) → Ca<sup>2+</sup>(aq) + CO<sub>2</sub>(aq) + 3H<sub>2</sub>O(l). Removing carbonate favors further dissolution.",
        "es": "El ácido consume el anión carbonato básico. En conjunto, CaCO<sub>3</sub>(s) + 2H<sub>3</sub>O<sup>+</sup>(aq) → Ca<sup>2+</sup>(aq) + CO<sub>2</sub>(aq) + 3H<sub>2</sub>O(l). Eliminar carbonato favorece una mayor disolución."
      }
    },
    {
      "id": "8.11-2",
      "topic": "8.11",
      "type": "mc",
      "prompt": {
        "en": "Ignoring complex formation and ionic-strength effects, why does dilute acid have little acid-base effect on AgCl solubility?",
        "es": "Sin considerar la formación de complejos ni los efectos de fuerza iónica, ¿por qué el ácido diluido tiene poco efecto ácido-base sobre la solubilidad del AgCl?"
      },
      "choices": [
        {
          "text": {
            "en": "AgCl contains no ions.",
            "es": "El AgCl no contiene iones."
          },
          "why": {
            "en": "AgCl is an ionic solid; the issue is the very weak basicity of chloride.",
            "es": "El AgCl es un sólido iónico; la razón es la basicidad muy débil del cloruro."
          }
        },
        {
          "text": {
            "en": "All anions react strongly with hydronium.",
            "es": "Todos los aniones reaccionan fuertemente con el hidronio."
          },
          "why": {
            "en": "Anion basicity depends on the strength of its conjugate acid.",
            "es": "La basicidad de un anión depende de la fuerza de su ácido conjugado."
          }
        },
        {
          "text": {
            "en": "Acid destroys the definition of solubility equilibrium.",
            "es": "El ácido destruye la definición del equilibrio de solubilidad."
          },
          "why": {
            "en": "The equilibrium remains valid even when an acid-base side reaction is negligible.",
            "es": "El equilibrio sigue siendo válido aunque una reacción secundaria ácido-base sea despreciable."
          }
        },
        {
          "text": {
            "en": "Chloride is not appreciably protonated under these conditions.",
            "es": "El cloruro no se protona de forma apreciable en estas condiciones."
          },
          "why": {
            "en": "",
            "es": ""
          }
        }
      ],
      "answer": 3,
      "explanation": {
        "en": "Chloride is the conjugate base of strong acid HCl. It is not appreciably protonated by dilute acid under these assumptions, so the anion-removal mechanism is ineffective.",
        "es": "El cloruro es la base conjugada del ácido fuerte HCl. El ácido diluido no lo protona de forma apreciable con estas suposiciones, así que el mecanismo de eliminación del anión no es eficaz."
      }
    },
    {
      "id": "8.11-3",
      "topic": "8.11",
      "type": "mc",
      "prompt": {
        "en": "Acid protonates F<sup>−</sup> in a saturated CaF<sub>2</sub> system at fixed temperature. What happens to molar solubility and Ksp?",
        "es": "El ácido protona F<sup>−</sup> en un sistema saturado de CaF<sub>2</sub> a temperatura fija. ¿Qué ocurre con la solubilidad molar y Ksp?"
      },
      "choices": [
        {
          "text": {
            "en": "Both decrease.",
            "es": "Ambas disminuyen."
          },
          "why": {
            "en": "Removing a dissolved anion favors dissolution rather than suppressing it.",
            "es": "Eliminar un anión disuelto favorece la disolución en lugar de reducirla."
          }
        },
        {
          "text": {
            "en": "Solubility decreases; Ksp is unchanged.",
            "es": "La solubilidad disminuye; Ksp no cambia."
          },
          "why": {
            "en": "Anion protonation lowers the free ion product and permits additional solid to dissolve.",
            "es": "La protonación del anión reduce el producto de iones libres y permite que se disuelva más sólido."
          }
        },
        {
          "text": {
            "en": "Solubility increases; Ksp is unchanged.",
            "es": "La solubilidad aumenta; Ksp no cambia."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both increase.",
            "es": "Ambas aumentan."
          },
          "why": {
            "en": "The temperature is fixed, so Ksp does not increase.",
            "es": "La temperatura es fija, así que Ksp no aumenta."
          }
        }
      ],
      "answer": 2,
      "explanation": {
        "en": "F<sup>−</sup>(aq) + H<sub>3</sub>O<sup>+</sup>(aq) ⇌ HF(aq) + H<sub>2</sub>O(l) removes free fluoride. The ion product drops below Ksp, so more CaF<sub>2</sub>(s) dissolves while Ksp stays fixed.",
        "es": "F<sup>−</sup>(aq) + H<sub>3</sub>O<sup>+</sup>(aq) ⇌ HF(aq) + H<sub>2</sub>O(l) elimina fluoruro libre. El producto iónico baja por debajo de Ksp, así que se disuelve más CaF<sub>2</sub>(s) mientras Ksp permanece fija."
      }
    },
    {
      "id": "8.11-4",
      "topic": "8.11",
      "type": "mc",
      "prompt": {
        "en": "Why does lowering pH generally increase Mg(OH)<sub>2</sub> solubility at fixed temperature, with no complex formation?",
        "es": "¿Por qué disminuir el pH suele aumentar la solubilidad del Mg(OH)<sub>2</sub> a temperatura fija, sin formación de complejos?"
      },
      "choices": [
        {
          "text": {
            "en": "Ksp must become infinite.",
            "es": "Ksp debe volverse infinita."
          },
          "why": {
            "en": "The fixed-temperature constant remains finite and unchanged.",
            "es": "La constante a temperatura fija sigue siendo finita y no cambia."
          }
        },
        {
          "text": {
            "en": "Hydronium consumes hydroxide, favoring dissolution.",
            "es": "El hidronio consume hidróxido y favorece la disolución."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Acid adds a hydroxide common ion.",
            "es": "El ácido agrega un ion hidróxido común."
          },
          "why": {
            "en": "Acid consumes hydroxide instead of supplying it.",
            "es": "El ácido consume hidróxido en lugar de aportarlo."
          }
        },
        {
          "text": {
            "en": "Magnesium disappears from the mass balance.",
            "es": "El magnesio desaparece del balance de masa."
          },
          "why": {
            "en": "Dissolved magnesium increases as the solid dissolves; matter is conserved.",
            "es": "El magnesio disuelto aumenta al disolverse el sólido; la materia se conserva."
          }
        }
      ],
      "answer": 1,
      "explanation": {
        "en": "Mg(OH)<sub>2</sub>(s) ⇌ Mg<sup>2+</sup>(aq) + 2OH<sup>−</sup>(aq). Added H<sub>3</sub>O<sup>+</sup> consumes OH<sup>−</sup> to form water, allowing more solid to dissolve.",
        "es": "Mg(OH)<sub>2</sub>(s) ⇌ Mg<sup>2+</sup>(aq) + 2OH<sup>−</sup>(aq). El H<sub>3</sub>O<sup>+</sup> agregado consume OH<sup>−</sup> para formar agua, lo que permite que se disuelva más sólido."
      }
    },
    {
      "id": "8.11-5",
      "topic": "8.11",
      "type": "numeric",
      "prompt": {
        "en": "For CaF<sub>2</sub>(s), Ksp = 3.20 × 10<sup>−11</sup> and HF has Ka = 6.8 × 10<sup>−4</sup>. A large external reservoir holds [H<sub>3</sub>O<sup>+</sup>] = 0.0100 M. Neglect complexes and other fluoride species. Use s = (Ksp(1 + [H<sub>3</sub>O<sup>+</sup>]/Ka)<sup>2</sup>/4)<sup>1/3</sup> to calculate molar solubility in M.",
        "es": "Para CaF<sub>2</sub>(s), Ksp = 3.20 × 10<sup>−11</sup> y HF tiene Ka = 6.8 × 10<sup>−4</sup>. Un gran reservorio externo mantiene [H<sub>3</sub>O<sup>+</sup>] = 0.0100 M. Desprecia complejos y otras especies de fluoruro. Usa s = (Ksp(1 + [H<sub>3</sub>O<sup>+</sup>]/Ka)<sup>2</sup>/4)<sup>1/3</sup> para calcular la solubilidad molar en M."
      },
      "value": 0.001254310012381127,
      "display": "1.3e-3",
      "unit": "M",
      "precision": {
        "sf": 2
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Total dissolved fluoride is 2s, partitioned between HF and F<sup>−</sup>. Free [F<sup>−</sup>] = 2s/(1 + [H<sub>3</sub>O<sup>+</sup>]/Ka). Substituting in Ksp gives the supplied equation: s = 0.00125431 M, reported as 1.3 × 10<sup>−3</sup> M. In the no-protonation model s = (Ksp/4)<sup>1/3</sup> = 2.00 × 10<sup>−4</sup> M, so acid increases solubility.",
        "es": "El fluoruro disuelto total es 2s, repartido entre HF y F<sup>−</sup>. [F<sup>−</sup>] libre = 2s/(1 + [H<sub>3</sub>O<sup>+</sup>]/Ka). Al sustituir en Ksp se obtiene la ecuación dada: s = 0.00125431 M, expresada como 1.3 × 10<sup>−3</sup> M. En el modelo sin protonación s = (Ksp/4)<sup>1/3</sup> = 2.00 × 10<sup>−4</sup> M, así que el ácido aumenta la solubilidad."
      }
    },
    {
      "id": "8.11-6",
      "topic": "8.11",
      "type": "numeric",
      "prompt": {
        "en": "For Mg(OH)<sub>2</sub>(s), Ksp = 5.6 × 10<sup>−12</sup> at 25 °C. A large external reservoir holds pH at 10.00. Assume no complexes or initial dissolved magnesium. Calculate the equilibrium magnesium concentration in M.",
        "es": "Para Mg(OH)<sub>2</sub>(s), Ksp = 5.6 × 10<sup>−12</sup> a 25 °C. Un gran reservorio externo mantiene el pH en 10.00. Supón que no hay complejos ni magnesio disuelto inicialmente. Calcula la concentración de magnesio en el equilibrio en M."
      },
      "value": 0.0005600000000000001,
      "display": "5.6e-4",
      "unit": "M",
      "precision": {
        "sf": 2
      },
      "tolerance": 5.500000000000001e-06,
      "explanation": {
        "en": "pOH = 14.00 − 10.00 = 4.00, so [OH<sup>−</sup>] = 1.0 × 10<sup>−4</sup> M. Ksp = [Mg<sup>2+</sup>][OH<sup>−</sup>]<sup>2</sup>, giving [Mg<sup>2+</sup>] = 5.6 × 10<sup>−4</sup> M. The reservoir fixes hydroxide; do not replace it by 2s.",
        "es": "pOH = 14.00 − 10.00 = 4.00, así que [OH<sup>−</sup>] = 1.0 × 10<sup>−4</sup> M. Ksp = [Mg<sup>2+</sup>][OH<sup>−</sup>]<sup>2</sup>, lo que da [Mg<sup>2+</sup>] = 5.6 × 10<sup>−4</sup> M. El reservorio fija el hidróxido; no lo sustituyas por 2s."
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
      "id": "mol",
      "label": {
        "en": "mol",
        "es": "mol"
      }
    },
    {
      "id": "mL",
      "label": {
        "en": "mL",
        "es": "mL"
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
    "title": "AP Chemistry Unit 8 Practice",
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
      "AP Chemistry Unit 8 Practice": "Práctica de la unidad 8 de Química AP",
      "AP Chemistry · Unit 8": "Química AP · Unidad 8",
      "Choose a topic, then start. Mixed review includes all eleven topics.": "Elige un tema y comienza. El repaso mixto incluye los once temas.",
      "Choose one topic for six questions, or Mixed review for all 66. Read the feedback after each answer.": "Elige un tema para seis preguntas o Repaso mixto para las 66. Lee los comentarios después de cada respuesta.",
      "Select one answer, or enter a number and choose its unit. For pH, pOH, pKa and equilibrium constants, choose no units.": "Selecciona una respuesta o escribe un número y elige su unidad. Para pH, pOH, pKa y las constantes de equilibrio, elige sin unidades.",
      "No timer. Use scratch paper and a calculator. The acid-base reference is below.": "Sin límite de tiempo. Usa papel y calculadora. La referencia de ácidos y bases está abajo.",
      "Aligned practice for AP Chemistry CED topics 8.1 to 8.11. Original ZornScience questions.": "Práctica alineada con los temas 8.1 a 8.11 del CED de Química AP. Preguntas originales de ZornScience.",
      "Added NaOH (mL)": "NaOH agregado (mL)",
      "Equivalence": "Punto de equivalencia",
      "Model: weak-acid titration curve": "Modelo: curva de titulación de un ácido débil",
      "A weak monoprotic acid is titrated with strong base. The rising curve has a buffer region, half-equivalence at 12.5 mL with pH 4.74, and equivalence at 25.0 mL with pH above 7. The steep region near equivalence spans pH 8.0 to 10.5.": "Un ácido débil monoprótico se titula con una base fuerte. La curva ascendente tiene una región de amortiguador, el punto de semiequivalencia en 12.5 mL con pH 4.74 y el punto de equivalencia en 25.0 mL con un pH mayor que 7. La región de gran pendiente cerca del punto de equivalencia abarca un pH de 8.0 a 10.5.",
      "Schematic model, not measured data. Half-equivalence: 12.5 mL. Equivalence: 25.0 mL. Values are repeated in the question.": "Modelo esquemático, no datos medidos. Punto de semiequivalencia: 12.5 mL. Punto de equivalencia: 25.0 mL. Los valores se repiten en la pregunta.",
      "Fraction of total acid species": "Fracción de especies ácidas totales",
      "Model: species fractions versus pH": "Modelo: fracciones de especies contra pH",
      "At pH below pKa, HA is dominant. At pH equal to pKa both fractions are 0.50. Above pKa, the conjugate base is dominant. Solid is HA and dashed is the conjugate base.": "A un pH menor que pKa, predomina HA. A un pH igual al pKa, ambas fracciones son 0.50. Por encima del pKa, predomina la base conjugada. La línea continua es HA y la discontinua es la base conjugada.",
      "Model of normalized species fractions. Solid: HA. Dashed: conjugate base. The crossing is at pH = pKa, not necessarily pH 7.": "Modelo de fracciones normalizadas de especies. Continua: HA. Discontinua: base conjugada. El cruce está en pH = pKa, no necesariamente en un pH de 7.",
      "Acids, bases and logarithms": "Ácidos, bases y logaritmos",
      "Use ideal dilute solutions. Unless stated otherwise, temperature is 25 °C. Hydronium is the proton-bearing ion in water.": "Usa soluciones ideales diluidas. Salvo que se indique otra cosa, la temperatura es de 25 °C. El hidronio es el ion que porta el protón en agua.",
      "Neutral water has equal hydronium and hydroxide concentrations. Neutral pH depends on temperature because Kw depends on temperature.": "El agua neutra tiene concentraciones iguales de hidronio e hidróxido. El pH neutro depende de la temperatura porque Kw depende de la temperatura.",
      "Precision and units": "Precisión y unidades",
      "Log rule: decimal places in pH, pOH or pKa equal significant figures in the concentration or K value. Keep extra digits until the final answer.": "Regla de logaritmos: los decimales en pH, pOH o pKa equivalen a las cifras significativas en la concentración o el valor de K. Conserva dígitos adicionales hasta la respuesta final.",
      "Choose no units for pH, pOH, pKa, Ka, Kb and Kw. Choose M for concentrations and molar solubility. Precision feedback is advisory; a correct value with the right unit earns its point.": "Elige sin unidades para pH, pOH, pKa, Ka, Kb y Kw. Elige M para concentraciones y solubilidad molar. Los comentarios de precisión son orientativos; un valor correcto con la unidad adecuada recibe su punto.",
      "Weak-acid and weak-base equilibria": "Equilibrios de ácidos y bases débiles",
      "An ICE table lists initial, change and equilibrium concentrations. For a single ionizing weak acid or base with initial concentration C and no initial products:": "Una tabla ICE presenta las concentraciones iniciales, el cambio y el equilibrio. Para un solo ácido o base débil que se ioniza, con concentración inicial C y sin productos iniciales:",
      "For the small-x approximation, check x/C × 100 < 5%. Otherwise solve the full equation. Percent ionization increases on dilution of a weak acid at fixed temperature.": "Para la aproximación de x pequeña, comprueba que x/C × 100 < 5%. De lo contrario, resuelve la ecuación completa. El porcentaje de ionización aumenta con la dilución de un ácido débil a temperatura fija.",
      "Percent ionization = (ionized acid concentration / initial acid concentration) × 100%.": "Porcentaje de ionización = (concentración de ácido ionizado / concentración inicial de ácido) × 100%.",
      "Buffers and titrations": "Amortiguadores y titulaciones",
      "React added strong acid or base completely first. Use remaining conjugate amounts in the buffer ratio. Both components must remain appreciable. Dilution nearly preserves pH but lowers capacity per volume. Greater total concentration increases capacity; a ratio near unity balances acid and base capacity.": "Primero haz reaccionar por completo el ácido o la base fuerte agregados. Usa las cantidades conjugadas restantes en la razón del amortiguador. Ambos componentes deben quedar en cantidades apreciables. La dilución casi conserva el pH, pero reduce la capacidad por volumen. Una mayor concentración total aumenta la capacidad; una razón cercana a la unidad equilibra la capacidad frente a ácido y base.",
      "At weak-acid half-equivalence, pH = pKa. At equivalence, a weak acid with strong base gives pH above 7; a weak base with strong acid gives pH below 7; a strong acid with strong base gives pH 7.00 at 25 °C. The indicator endpoint is an observed color change near the stoichiometric equivalence point.": "En el punto de semiequivalencia de un ácido débil, pH = pKa. En el punto de equivalencia, un ácido débil con una base fuerte da un pH mayor que 7; una base débil con un ácido fuerte da un pH menor que 7; un ácido fuerte con una base fuerte da un pH de 7.00 a 25 °C. El punto final del indicador es un cambio de color observado cerca del punto de equivalencia estequiométrico.",
      "Constants used in these questions": "Constantes usadas en estas preguntas",
      "Ka and Kb at 25 °C": "Ka y Kb a 25 °C",
      "Species": "Especie",
      "Constant": "Constante",
      "Value": "Valor",
      "Acetic acid": "Ácido acético",
      "Acetic acid, more precise measurement": "Ácido acético, medición más precisa",
      "Ammonia": "Amoniaco",
      "Hydrofluoric acid": "Ácido fluorhídrico",
      "Acetate, derived": "Acetato, valor calculado",
      "Hypothetical weak acid": "Ácido débil hipotético",
      "pH and solubility": "pH y solubilidad",
      "Acid can consume basic anions such as carbonate, fluoride and hydroxide, increasing molar solubility at fixed Ksp. Chloride is not appreciably protonated by dilute acid. Use the free-ion concentrations in Ksp.": "El ácido puede consumir aniones básicos como carbonato, fluoruro e hidróxido y aumentar la solubilidad molar con Ksp fija. El ácido diluido no protona el cloruro de forma apreciable. Usa las concentraciones de iones libres en Ksp."
    }
  }
};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit8-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
