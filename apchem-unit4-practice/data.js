(function () {
  "use strict";
  // Original bilingual questions, with answers worked first in TESTING.md.
  var bank = {
  "topics": [
    {
      "id": "4.1",
      "title": {
        "en": "4.1 Introduction for Reactions",
        "es": "4.1 Introducción a las reacciones"
      }
    },
    {
      "id": "4.2",
      "title": {
        "en": "4.2 Net Ionic Equations",
        "es": "4.2 Ecuaciones iónicas netas"
      }
    },
    {
      "id": "4.3",
      "title": {
        "en": "4.3 Representations of Reactions",
        "es": "4.3 Representaciones de las reacciones"
      }
    },
    {
      "id": "4.4",
      "title": {
        "en": "4.4 Physical and Chemical Changes",
        "es": "4.4 Cambios físicos y químicos"
      }
    },
    {
      "id": "4.5",
      "title": {
        "en": "4.5 Stoichiometry",
        "es": "4.5 Estequiometría"
      }
    },
    {
      "id": "4.6",
      "title": {
        "en": "4.6 Introduction to Titration",
        "es": "4.6 Introducción a la titulación"
      }
    },
    {
      "id": "4.7",
      "title": {
        "en": "4.7 Types of Chemical Reactions",
        "es": "4.7 Tipos de reacciones químicas"
      }
    },
    {
      "id": "4.8",
      "title": {
        "en": "4.8 Introduction to Acid-Base Reactions",
        "es": "4.8 Introducción a las reacciones ácido-base"
      }
    },
    {
      "id": "4.9",
      "title": {
        "en": "4.9 Oxidation-Reduction (Redox) Reactions",
        "es": "4.9 Reacciones de oxidación-reducción (redox)"
      }
    }
  ],
  "questions": [
    {
      "id": "4.1-1",
      "topic": "4.1",
      "type": "mc",
      "prompt": {
        "en": "Two clear aqueous solutions are mixed at room temperature. Which observation most directly supports formation of a new substance?",
        "es": "Se mezclan dos soluciones acuosas transparentes a temperatura ambiente. ¿Qué observación apoya más directamente la formación de una sustancia nueva?"
      },
      "choices": [
        {
          "text": {
            "en": "A new insoluble solid appears.",
            "es": "Aparece un sólido insoluble nuevo."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The combined volume is larger than either starting volume.",
            "es": "El volumen combinado es mayor que cualquiera de los volúmenes iniciales."
          },
          "why": {
            "en": "Combining liquids increases volume even without a reaction.",
            "es": "Combinar líquidos aumenta el volumen incluso sin una reacción."
          }
        },
        {
          "text": {
            "en": "Some water evaporates from the surface.",
            "es": "Parte del agua se evapora de la superficie."
          },
          "why": {
            "en": "Evaporation changes phase without changing water molecules.",
            "es": "La evaporación cambia la fase sin cambiar las moléculas de agua."
          }
        },
        {
          "text": {
            "en": "The mixture can be poured into a larger beaker.",
            "es": "La mezcla se puede verter en un vaso de precipitados más grande."
          },
          "why": {
            "en": "Changing containers does not establish formation of a new substance.",
            "es": "Cambiar de recipiente no establece la formación de una sustancia nueva."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A precipitate is evidence of a reaction because a new insoluble substance forms from dissolved species.",
        "es": "Un precipitado es evidencia de una reacción porque se forma una sustancia insoluble nueva a partir de especies disueltas."
      }
    },
    {
      "id": "4.1-2",
      "topic": "4.1",
      "type": "mc",
      "prompt": {
        "en": "A student sees bubbles while pure water is heated to its boiling point. Which conclusion is justified by this observation alone?",
        "es": "Un estudiante observa burbujas al calentar agua pura hasta su punto de ebullición. ¿Qué conclusión se justifica solo con esta observación?"
      },
      "choices": [
        {
          "text": {
            "en": "Bubbles alone do not prove that a chemical reaction occurred.",
            "es": "Las burbujas por sí solas no prueban que ocurrió una reacción química."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The water must have decomposed into hydrogen and oxygen.",
            "es": "El agua debe haberse descompuesto en hidrógeno y oxígeno."
          },
          "why": {
            "en": "Boiling produces water vapor, not evidence of decomposition.",
            "es": "La ebullición produce vapor de agua, no evidencia de descomposición."
          }
        },
        {
          "text": {
            "en": "Any gas formation proves a new substance formed.",
            "es": "Toda formación de gas prueba que se formó una sustancia nueva."
          },
          "why": {
            "en": "A gas can also form by a physical phase change.",
            "es": "Un gas también puede formarse por un cambio físico de fase."
          }
        },
        {
          "text": {
            "en": "Water molecules lose their oxygen atoms during boiling.",
            "es": "Las moléculas de agua pierden sus átomos de oxígeno durante la ebullición."
          },
          "why": {
            "en": "Water molecules retain their composition during boiling.",
            "es": "Las moléculas de agua conservan su composición durante la ebullición."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Gas evolution can support a reaction in context, but H<sub>2</sub>O(l) → H<sub>2</sub>O(g) is a physical phase change. Identify the substance, not just the bubbles.",
        "es": "La liberación de gas puede apoyar una reacción según el contexto, pero H<sub>2</sub>O(l) → H<sub>2</sub>O(g) es un cambio físico de fase. Identifica la sustancia, no solo las burbujas."
      }
    },
    {
      "id": "4.1-3",
      "topic": "4.1",
      "type": "mc",
      "prompt": {
        "en": "A reaction produces a gas inside a sealed, rigid container. How does the total mass of the container and its contents change?",
        "es": "Una reacción produce un gas dentro de un recipiente rígido y sellado. ¿Cómo cambia la masa total del recipiente y su contenido?"
      },
      "choices": [
        {
          "text": {
            "en": "It stays constant.",
            "es": "Permanece constante."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It decreases because gases have no mass.",
            "es": "Disminuye porque los gases no tienen masa."
          },
          "why": {
            "en": "Gas particles have mass and remain inside the sealed container.",
            "es": "Las partículas de gas tienen masa y permanecen dentro del recipiente sellado."
          }
        },
        {
          "text": {
            "en": "It increases because gas particles occupy more space.",
            "es": "Aumenta porque las partículas de gas ocupan más espacio."
          },
          "why": {
            "en": "Particle spacing does not create additional mass.",
            "es": "La separación entre partículas no crea masa adicional."
          }
        },
        {
          "text": {
            "en": "It decreases because atoms disappear when bonds break.",
            "es": "Disminuye porque los átomos desaparecen al romper enlaces."
          },
          "why": {
            "en": "Breaking bonds rearranges atoms; it does not remove them.",
            "es": "Romper enlaces reorganiza los átomos; no los elimina."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "No matter enters or leaves. Chemical reactions conserve the atoms and total mass of a closed system.",
        "es": "No entra ni sale materia. Las reacciones químicas conservan los átomos y la masa total de un sistema cerrado."
      }
    },
    {
      "id": "4.1-4",
      "topic": "4.1",
      "type": "mc",
      "prompt": {
        "en": "Which quantity must be equal on both sides of a balanced chemical equation?",
        "es": "¿Qué cantidad debe ser igual a ambos lados de una ecuación química balanceada?"
      },
      "choices": [
        {
          "text": {
            "en": "The number of atoms of each element",
            "es": "El número de átomos de cada elemento"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "The total number of molecules",
            "es": "El número total de moléculas"
          },
          "why": {
            "en": "Molecules can combine or split, so their total number can change.",
            "es": "Las moléculas pueden combinarse o dividirse, así que su número total puede cambiar."
          }
        },
        {
          "text": {
            "en": "The total volume of every phase",
            "es": "El volumen total de cada fase"
          },
          "why": {
            "en": "Volume is not the conservation rule used to balance equations.",
            "es": "El volumen no es la regla de conservación usada para balancear ecuaciones."
          }
        },
        {
          "text": {
            "en": "The number of covalent bonds of each type",
            "es": "El número de enlaces covalentes de cada tipo"
          },
          "why": {
            "en": "Chemical reactions can replace one type of bond with another.",
            "es": "Las reacciones químicas pueden reemplazar un tipo de enlace por otro."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Coefficients count conserved atoms. For ionic equations, total charge must also balance.",
        "es": "Los coeficientes cuentan los átomos conservados. En las ecuaciones iónicas, la carga total también debe estar balanceada."
      }
    },
    {
      "id": "4.1-5",
      "topic": "4.1",
      "type": "mc",
      "prompt": {
        "en": "Two solutions at the same initial temperature are mixed in an insulated cup. A new solid forms and the temperature rises without external heating. What do these observations support?",
        "es": "Se mezclan dos soluciones a la misma temperatura inicial en un vaso aislado. Se forma un sólido nuevo y la temperatura aumenta sin calentamiento externo. ¿Qué apoyan estas observaciones?"
      },
      "choices": [
        {
          "text": {
            "en": "A reaction occurred and released energy to the surroundings.",
            "es": "Ocurrió una reacción y liberó energía a los alrededores."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Energy was created from nothing.",
            "es": "Se creó energía de la nada."
          },
          "why": {
            "en": "Energy is transferred, not created, during a reaction.",
            "es": "Durante una reacción la energía se transfiere, no se crea."
          }
        },
        {
          "text": {
            "en": "The reaction must absorb energy from the solution.",
            "es": "La reacción debe absorber energía de la solución."
          },
          "why": {
            "en": "Energy absorption by the reaction would tend to cool the solution.",
            "es": "La absorción de energía por la reacción tendería a enfriar la solución."
          }
        },
        {
          "text": {
            "en": "The temperature rise proves that no bonds changed.",
            "es": "El aumento de temperatura prueba que no cambiaron enlaces."
          },
          "why": {
            "en": "A temperature rise does not rule out bond rearrangements.",
            "es": "Un aumento de temperatura no descarta cambios de enlaces."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The new solid supports formation of a new substance. The warming supports an exothermic process under the stated conditions.",
        "es": "El sólido nuevo apoya la formación de una sustancia nueva. El calentamiento apoya un proceso exotérmico en las condiciones indicadas."
      }
    },
    {
      "id": "4.1-6",
      "topic": "4.1",
      "type": "numeric",
      "prompt": {
        "en": "For 2Mg(s) + O<sub>2</sub>(g) → 2MgO(s), how many moles of O<sub>2</sub> react with 0.300 mol Mg?",
        "es": "Para 2Mg(s) + O<sub>2</sub>(g) → 2MgO(s), ¿cuántos moles de O<sub>2</sub> reaccionan con 0.300 mol de Mg?"
      },
      "value": 0.15,
      "display": "0.150",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "The O<sub>2</sub>:Mg coefficient ratio is 1:2. Multiply 0.300 mol by 1/2 to get 0.150 mol O<sub>2</sub>.",
        "es": "La razón de coeficientes O<sub>2</sub>:Mg es 1:2. Multiplica 0.300 mol por 1/2 para obtener 0.150 mol de O<sub>2</sub>."
      }
    },
    {
      "id": "4.2-1",
      "topic": "4.2",
      "type": "mc",
      "prompt": {
        "en": "Aqueous CaCl<sub>2</sub> and Na<sub>2</sub>CO<sub>3</sub> form a precipitate. Which is the net ionic equation?",
        "es": "CaCl<sub>2</sub> y Na<sub>2</sub>CO<sub>3</sub> acuosos forman un precipitado. ¿Cuál es la ecuación iónica neta?"
      },
      "choices": [
        {
          "text": {
            "en": "Ca<sup>2+</sup>(aq) + CO<sub>3</sub><sup>2−</sup>(aq) → CaCO<sub>3</sub>(s)",
            "es": "Ca<sup>2+</sup>(aq) + CO<sub>3</sub><sup>2−</sup>(aq) → CaCO<sub>3</sub>(s)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Na<sup>+</sup>(aq) + Cl<sup>−</sup>(aq) → NaCl(s)",
            "es": "Na<sup>+</sup>(aq) + Cl<sup>−</sup>(aq) → NaCl(s)"
          },
          "why": {
            "en": "Sodium salts are soluble; NaCl does not precipitate here.",
            "es": "Las sales de sodio son solubles; NaCl no precipita aquí."
          }
        },
        {
          "text": {
            "en": "Ca<sup>2+</sup>(aq) + CO<sub>3</sub><sup>2−</sup>(aq) → CaCO<sub>3</sub>(aq)",
            "es": "Ca<sup>2+</sup>(aq) + CO<sub>3</sub><sup>2−</sup>(aq) → CaCO<sub>3</sub>(aq)"
          },
          "why": {
            "en": "The precipitate must be shown as a solid, (s).",
            "es": "El precipitado debe indicarse como sólido, (s)."
          }
        },
        {
          "text": {
            "en": "Ca<sup>+</sup>(aq) + CO<sub>3</sub><sup>−</sup>(aq) → CaCO<sub>3</sub>(s)",
            "es": "Ca<sup>+</sup>(aq) + CO<sub>3</sub><sup>−</sup>(aq) → CaCO<sub>3</sub>(s)"
          },
          "why": {
            "en": "The calcium and carbonate charges are 2+ and 2−, not 1+ and 1−.",
            "es": "Las cargas del calcio y del carbonato son 2+ y 2−, no 1+ y 1−."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Carbonates other than those of Group 1 and ammonium are generally insoluble. Remove the unchanged sodium and chloride ions to obtain the net ionic equation.",
        "es": "Los carbonatos distintos de los del grupo 1 y del amonio suelen ser insolubles. Elimina los iones sodio y cloruro que no cambian para obtener la ecuación iónica neta."
      }
    },
    {
      "id": "4.2-2",
      "topic": "4.2",
      "type": "mc",
      "prompt": {
        "en": "For BaCl<sub>2</sub>(aq) + Na<sub>2</sub>SO<sub>4</sub>(aq) → BaSO<sub>4</sub>(s) + 2NaCl(aq), which species are spectator ions?",
        "es": "Para BaCl<sub>2</sub>(aq) + Na<sub>2</sub>SO<sub>4</sub>(aq) → BaSO<sub>4</sub>(s) + 2NaCl(aq), ¿qué especies son iones espectadores?"
      },
      "choices": [
        {
          "text": {
            "en": "Na<sup>+</sup>(aq) and Cl<sup>−</sup>(aq)",
            "es": "Na<sup>+</sup>(aq) y Cl<sup>−</sup>(aq)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Ba<sup>2+</sup>(aq) and SO<sub>4</sub><sup>2−</sup>(aq)",
            "es": "Ba<sup>2+</sup>(aq) y SO<sub>4</sub><sup>2−</sup>(aq)"
          },
          "why": {
            "en": "These ions form the solid and do not remain unchanged in solution.",
            "es": "Estos iones forman el sólido y no permanecen sin cambios en solución."
          }
        },
        {
          "text": {
            "en": "Only Ba<sup>2+</sup>(aq)",
            "es": "Solo Ba<sup>2+</sup>(aq)"
          },
          "why": {
            "en": "Barium is incorporated into BaSO<sub>4</sub>(s).",
            "es": "El bario se incorpora a BaSO<sub>4</sub>(s)."
          }
        },
        {
          "text": {
            "en": "All four aqueous ion types",
            "es": "Los cuatro tipos de iones acuosos"
          },
          "why": {
            "en": "Barium and sulfate participate in precipitation.",
            "es": "El bario y el sulfato participan en la precipitación."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A spectator ion appears unchanged on both sides of the complete ionic equation. Sodium and chloride stay dissolved; barium sulfate precipitates.",
        "es": "Un ion espectador aparece sin cambios a ambos lados de la ecuación iónica completa. El sodio y el cloruro permanecen disueltos; el sulfato de bario precipita."
      }
    },
    {
      "id": "4.2-3",
      "topic": "4.2",
      "type": "mc",
      "prompt": {
        "en": "When converting a molecular equation for precipitation into a complete ionic equation, which procedure is correct?",
        "es": "Al convertir una ecuación molecular de precipitación en una ecuación iónica completa, ¿qué procedimiento es correcto?"
      },
      "choices": [
        {
          "text": {
            "en": "Separate soluble aqueous strong electrolytes into ions; keep the solid intact.",
            "es": "Separa los electrolitos fuertes acuosos solubles en iones; conserva intacto el sólido."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Separate the precipitate into aqueous ions on the product side.",
            "es": "Separa el precipitado en iones acuosos del lado de los productos."
          },
          "why": {
            "en": "An insoluble solid is not written as freely dissolved ions.",
            "es": "Un sólido insoluble no se escribe como iones libremente disueltos."
          }
        },
        {
          "text": {
            "en": "Remove every ion before writing the complete ionic equation.",
            "es": "Elimina todos los iones antes de escribir la ecuación iónica completa."
          },
          "why": {
            "en": "The complete ionic equation retains spectator ions; cancel them only for the net equation.",
            "es": "La ecuación iónica completa conserva los iones espectadores; cancélalos solo para la ecuación neta."
          }
        },
        {
          "text": {
            "en": "Change all aqueous state symbols to solid state symbols.",
            "es": "Cambia todos los símbolos de estado acuoso por símbolos de estado sólido."
          },
          "why": {
            "en": "Only insoluble products are precipitates; dissolved species remain (aq).",
            "es": "Solo los productos insolubles son precipitados; las especies disueltas siguen como (aq)."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A molecular equation groups soluble salts as formulas. The complete ionic equation shows their dissolved ions, including spectator ions, while retaining solids and pure liquids.",
        "es": "Una ecuación molecular agrupa las sales solubles como fórmulas. La ecuación iónica completa muestra sus iones disueltos, incluidos los iones espectadores, y conserva los sólidos y los líquidos puros."
      }
    },
    {
      "id": "4.2-4",
      "topic": "4.2",
      "type": "mc",
      "prompt": {
        "en": "Acetic acid is a weak electrolyte. Which net ionic equation describes its reaction with aqueous NaOH?",
        "es": "El ácido acético es un electrolito débil. ¿Qué ecuación iónica neta describe su reacción con NaOH acuoso?"
      },
      "choices": [
        {
          "text": {
            "en": "CH<sub>3</sub>COOH(aq) + OH<sup>−</sup>(aq) → CH<sub>3</sub>COO<sup>−</sup>(aq) + H<sub>2</sub>O(l)",
            "es": "CH<sub>3</sub>COOH(aq) + OH<sup>−</sup>(aq) → CH<sub>3</sub>COO<sup>−</sup>(aq) + H<sub>2</sub>O(l)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "H<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → H<sub>2</sub>O(l)",
            "es": "H<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → H<sub>2</sub>O(l)"
          },
          "why": {
            "en": "This omits the weak acid, which is kept molecular rather than fully dissociated.",
            "es": "Esto omite el ácido débil, que se conserva molecular en vez de disociarse por completo."
          }
        },
        {
          "text": {
            "en": "Na<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → NaOH(s)",
            "es": "Na<sup>+</sup>(aq) + OH<sup>−</sup>(aq) → NaOH(s)"
          },
          "why": {
            "en": "NaOH is soluble; sodium is a spectator ion.",
            "es": "NaOH es soluble; el sodio es un ion espectador."
          }
        },
        {
          "text": {
            "en": "CH<sub>3</sub>COOH(aq) → CH<sub>3</sub>COOH(g)",
            "es": "CH<sub>3</sub>COOH(aq) → CH<sub>3</sub>COOH(g)"
          },
          "why": {
            "en": "The reaction transfers a proton to hydroxide rather than vaporizing the acid.",
            "es": "La reacción transfiere un protón al hidróxido en vez de vaporizar el ácido."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Keep the weak acid intact on the reactant side. Hydroxide removes its acidic proton, producing acetate and water; the strong electrolyte NaOH supplies OH<sup>−</sup>.",
        "es": "Conserva intacto el ácido débil del lado de los reactivos. El hidróxido retira su protón ácido y produce acetato y agua; el electrolito fuerte NaOH aporta OH<sup>−</sup>."
      }
    },
    {
      "id": "4.2-5",
      "topic": "4.2",
      "type": "mc",
      "prompt": {
        "en": "Dilute NaCl(aq) and KNO<sub>3</sub>(aq) are mixed. All possible salts are soluble. What is the net ionic result?",
        "es": "Se mezclan NaCl(aq) y KNO<sub>3</sub>(aq) diluidos. Todas las sales posibles son solubles. ¿Cuál es el resultado iónico neto?"
      },
      "choices": [
        {
          "text": {
            "en": "No net ionic reaction occurs.",
            "es": "No ocurre una reacción iónica neta."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "KCl(s) precipitates.",
            "es": "Precipita KCl(s)."
          },
          "why": {
            "en": "Potassium salts are soluble under these conditions.",
            "es": "Las sales de potasio son solubles en estas condiciones."
          }
        },
        {
          "text": {
            "en": "NaNO<sub>3</sub>(s) precipitates.",
            "es": "Precipita NaNO<sub>3</sub>(s)."
          },
          "why": {
            "en": "Nitrates and sodium salts are soluble.",
            "es": "Los nitratos y las sales de sodio son solubles."
          }
        },
        {
          "text": {
            "en": "Na<sup>+</sup>(aq) is reduced to Na(s).",
            "es": "Na<sup>+</sup>(aq) se reduce a Na(s)."
          },
          "why": {
            "en": "Simply mixing these salt solutions supplies no electron donor for that reduction.",
            "es": "Mezclar estas soluciones salinas no aporta un donador de electrones para esa reducción."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "All ions remain dissolved and unchanged. The complete ionic equation cancels entirely, leaving no net ionic equation.",
        "es": "Todos los iones permanecen disueltos y sin cambios. La ecuación iónica completa se cancela por completo y no queda una ecuación iónica neta."
      }
    },
    {
      "id": "4.2-6",
      "topic": "4.2",
      "type": "numeric",
      "prompt": {
        "en": "Model: one formula unit each of CaCl<sub>2</sub> and Na<sub>2</sub>CO<sub>3</sub> dissolves completely, then CaCO<sub>3</sub>(s) forms. Solvent is omitted. How many individual spectator ions remain?",
        "es": "Modelo: una unidad fórmula de CaCl<sub>2</sub> y una de Na<sub>2</sub>CO<sub>3</sub> se disuelven por completo y luego se forma CaCO<sub>3</sub>(s). Se omite el disolvente. ¿Cuántos iones espectadores individuales quedan?"
      },
      "value": 4,
      "display": "4",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Ca<sup>2+</sup> and CO<sub>3</sub><sup>2−</sup> form the solid. The 2 Na<sup>+</sup> and 2 Cl<sup>−</sup> remain dissolved, giving 4 spectator ions.",
        "es": "Ca<sup>2+</sup> y CO<sub>3</sub><sup>2−</sup> forman el sólido. Los 2 Na<sup>+</sup> y los 2 Cl<sup>−</sup> permanecen disueltos, lo que da 4 iones espectadores."
      }
    },
    {
      "id": "4.3-1",
      "topic": "4.3",
      "type": "mc",
      "prompt": {
        "en": "Particle model: 4 H<sub>2</sub>(g) molecules and 3 O<sub>2</sub>(g) molecules react completely according to 2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(g). Which final picture is consistent?",
        "es": "Modelo de partículas: 4 moléculas de H<sub>2</sub>(g) y 3 de O<sub>2</sub>(g) reaccionan por completo según 2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(g). ¿Qué imagen final es coherente?"
      },
      "choices": [
        {
          "text": {
            "en": "4 H<sub>2</sub>O molecules and 1 O<sub>2</sub> molecule",
            "es": "4 moléculas de H<sub>2</sub>O y 1 molécula de O<sub>2</sub>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "6 H<sub>2</sub>O molecules and no reactants",
            "es": "6 moléculas de H<sub>2</sub>O y ningún reactivo"
          },
          "why": {
            "en": "Six water molecules need twelve H atoms, but the model starts with eight.",
            "es": "Seis moléculas de agua necesitan doce átomos de H, pero el modelo comienza con ocho."
          }
        },
        {
          "text": {
            "en": "4 H<sub>2</sub>O molecules and 1 free O atom",
            "es": "4 moléculas de H<sub>2</sub>O y 1 átomo libre de O"
          },
          "why": {
            "en": "After four O atoms enter water, two O atoms remain as one O<sub>2</sub> molecule.",
            "es": "Después de que cuatro átomos de O entran al agua, quedan dos como una molécula de O<sub>2</sub>."
          }
        },
        {
          "text": {
            "en": "3 H<sub>2</sub>O molecules and 1 H<sub>2</sub> molecule",
            "es": "3 moléculas de H<sub>2</sub>O y 1 molécula de H<sub>2</sub>"
          },
          "why": {
            "en": "This omits oxygen atoms and leaves reactants able to make more product.",
            "es": "Esto omite átomos de oxígeno y deja reactivos capaces de formar más producto."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "H<sub>2</sub> is the limiting reactant. Four H<sub>2</sub> consume two O<sub>2</sub> and make four water molecules. One O<sub>2</sub> remains.",
        "es": "H<sub>2</sub> es el reactivo limitante. Cuatro H<sub>2</sub> consumen dos O<sub>2</sub> y forman cuatro moléculas de agua. Queda un O<sub>2</sub>."
      },
      "particles": true
    },
    {
      "id": "4.3-2",
      "topic": "4.3",
      "type": "mc",
      "prompt": {
        "en": "Model: a container holds 6 CO(g) molecules and 4 O<sub>2</sub>(g) molecules. For 2CO(g) + O<sub>2</sub>(g) → 2CO<sub>2</sub>(g), which is the limiting reactant?",
        "es": "Modelo: un recipiente contiene 6 moléculas de CO(g) y 4 de O<sub>2</sub>(g). Para 2CO(g) + O<sub>2</sub>(g) → 2CO<sub>2</sub>(g), ¿cuál es el reactivo limitante?"
      },
      "choices": [
        {
          "text": {
            "en": "CO, because six CO consume only three O<sub>2</sub>",
            "es": "CO, porque seis CO consumen solo tres O<sub>2</sub>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "O<sub>2</sub>, because four is smaller than six",
            "es": "O<sub>2</sub>, porque cuatro es menor que seis"
          },
          "why": {
            "en": "Compare counts divided by coefficients, not raw counts.",
            "es": "Compara las cantidades divididas entre sus coeficientes, no las cantidades solas."
          }
        },
        {
          "text": {
            "en": "Both, because every collision consumes equal numbers",
            "es": "Ambos, porque cada colisión consume cantidades iguales"
          },
          "why": {
            "en": "The balanced ratio is two CO for each O<sub>2</sub>.",
            "es": "La razón balanceada es dos CO por cada O<sub>2</sub>."
          }
        },
        {
          "text": {
            "en": "Neither, because gases cannot be limiting reactants",
            "es": "Ninguno, porque los gases no pueden ser reactivos limitantes"
          },
          "why": {
            "en": "A finite supply of any reactant, including a gas, can limit product.",
            "es": "Una cantidad finita de cualquier reactivo, incluido un gas, puede limitar el producto."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The available reaction groups are 6/2 = 3 from CO and 4/1 = 4 from oxygen. CO runs out first; one O<sub>2</sub> remains.",
        "es": "Los grupos de reacción disponibles son 6/2 = 3 a partir de CO y 4/1 = 4 a partir de oxígeno. CO se agota primero; queda un O<sub>2</sub>."
      }
    },
    {
      "id": "4.3-3",
      "topic": "4.3",
      "type": "mc",
      "prompt": {
        "en": "Model: mix 2 Ca<sup>2+</sup>(aq), 4 Cl<sup>−</sup>(aq), 4 Na<sup>+</sup>(aq), and 2 CO<sub>3</sub><sup>2−</sup>(aq). Solvent is omitted. Which picture represents complete precipitation of CaCO<sub>3</sub>(s)?",
        "es": "Modelo: mezcla 2 Ca<sup>2+</sup>(aq), 4 Cl<sup>−</sup>(aq), 4 Na<sup>+</sup>(aq) y 2 CO<sub>3</sub><sup>2−</sup>(aq). Se omite el disolvente. ¿Qué imagen representa la precipitación completa de CaCO<sub>3</sub>(s)?"
      },
      "choices": [
        {
          "text": {
            "en": "2 CaCO<sub>3</sub> units in a solid, with 4 Na<sup>+</sup> and 4 Cl<sup>−</sup> dispersed in solution",
            "es": "2 unidades de CaCO<sub>3</sub> en un sólido, con 4 Na<sup>+</sup> y 4 Cl<sup>−</sup> dispersos en solución"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "4 NaCl units in a solid, with calcium and carbonate still dissolved",
            "es": "4 unidades de NaCl en un sólido, con calcio y carbonato todavía disueltos"
          },
          "why": {
            "en": "NaCl stays dissolved; calcium carbonate is the insoluble product.",
            "es": "NaCl permanece disuelto; el carbonato de calcio es el producto insoluble."
          }
        },
        {
          "text": {
            "en": "2 separate Ca<sup>2+</sup> ions and 2 separate carbonate ions, with no solid",
            "es": "2 iones Ca<sup>2+</sup> separados y 2 iones carbonato separados, sin sólido"
          },
          "why": {
            "en": "This is the starting solution, not the result of precipitation.",
            "es": "Esta es la solución inicial, no el resultado de la precipitación."
          }
        },
        {
          "text": {
            "en": "4 CaCO<sub>3</sub> units and no dissolved ions",
            "es": "4 unidades de CaCO<sub>3</sub> y ningún ion disuelto"
          },
          "why": {
            "en": "Only two calcium ions are present, and the spectator ions must remain.",
            "es": "Solo hay dos iones calcio y los iones espectadores deben permanecer."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Each solid formula unit uses one calcium and one carbonate ion. Sodium and chloride are conserved as separate hydrated ions.",
        "es": "Cada unidad fórmula del sólido usa un ion calcio y uno carbonato. El sodio y el cloruro se conservan como iones hidratados separados."
      }
    },
    {
      "id": "4.3-4",
      "topic": "4.3",
      "type": "mc",
      "prompt": {
        "en": "Which particle grouping represents N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) while conserving every atom?",
        "es": "¿Qué agrupación de partículas representa N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g) y conserva cada átomo?"
      },
      "choices": [
        {
          "text": {
            "en": "1 nitrogen pair plus 3 hydrogen pairs form 2 molecules, each with 1 N and 3 H.",
            "es": "1 par de nitrógeno y 3 pares de hidrógeno forman 2 moléculas, cada una con 1 N y 3 H."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "1 nitrogen atom plus 3 hydrogen atoms form 2 ammonia molecules.",
            "es": "1 átomo de nitrógeno y 3 átomos de hidrógeno forman 2 moléculas de amoniaco."
          },
          "why": {
            "en": "Two ammonia molecules require two N atoms and six H atoms.",
            "es": "Dos moléculas de amoniaco requieren dos átomos de N y seis de H."
          }
        },
        {
          "text": {
            "en": "1 nitrogen pair plus 1 hydrogen pair form 2 ammonia molecules.",
            "es": "1 par de nitrógeno y 1 par de hidrógeno forman 2 moléculas de amoniaco."
          },
          "why": {
            "en": "One hydrogen pair supplies only two of the six H atoms needed.",
            "es": "Un par de hidrógeno aporta solo dos de los seis átomos de H necesarios."
          }
        },
        {
          "text": {
            "en": "3 nitrogen pairs plus 1 hydrogen pair form 2 ammonia molecules.",
            "es": "3 pares de nitrógeno y 1 par de hidrógeno forman 2 moléculas de amoniaco."
          },
          "why": {
            "en": "This reverses the coefficients and does not conserve the stated atoms.",
            "es": "Esto invierte los coeficientes y no conserva los átomos indicados."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The coefficients count molecules, while subscripts count atoms inside each molecule. Both sides contain 2 N atoms and 6 H atoms.",
        "es": "Los coeficientes cuentan moléculas y los subíndices cuentan átomos dentro de cada molécula. Ambos lados contienen 2 átomos de N y 6 de H."
      }
    },
    {
      "id": "4.3-5",
      "topic": "4.3",
      "type": "numeric",
      "prompt": {
        "en": "Model: 3 N<sub>2</sub>(g) molecules and 6 H<sub>2</sub>(g) molecules react completely by N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g). How many NH<sub>3</sub> molecules form?",
        "es": "Modelo: 3 moléculas de N<sub>2</sub>(g) y 6 de H<sub>2</sub>(g) reaccionan por completo según N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g). ¿Cuántas moléculas de NH<sub>3</sub> se forman?"
      },
      "value": 4,
      "display": "4",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Six H<sub>2</sub> allow two reaction groups. Each makes two NH<sub>3</sub>, so four NH<sub>3</sub> form and one N<sub>2</sub> remains.",
        "es": "Seis H<sub>2</sub> permiten dos grupos de reacción. Cada uno forma dos NH<sub>3</sub>, así que se forman cuatro NH<sub>3</sub> y queda un N<sub>2</sub>."
      }
    },
    {
      "id": "4.3-6",
      "topic": "4.3",
      "type": "numeric",
      "prompt": {
        "en": "Model: 5 H<sub>2</sub>(g) molecules and 2 O<sub>2</sub>(g) molecules react completely by 2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(g). How many H<sub>2</sub> molecules remain?",
        "es": "Modelo: 5 moléculas de H<sub>2</sub>(g) y 2 de O<sub>2</sub>(g) reaccionan por completo según 2H<sub>2</sub>(g) + O<sub>2</sub>(g) → 2H<sub>2</sub>O(g). ¿Cuántas moléculas de H<sub>2</sub> quedan?"
      },
      "value": 1,
      "display": "1",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Two O<sub>2</sub> consume four H<sub>2</sub>. The leftover hydrogen count is 5 − 4 = 1 molecule; O<sub>2</sub> is limiting.",
        "es": "Dos O<sub>2</sub> consumen cuatro H<sub>2</sub>. Queda 5 − 4 = 1 molécula de hidrógeno; O<sub>2</sub> es el reactivo limitante."
      }
    },
    {
      "id": "4.4-1",
      "topic": "4.4",
      "type": "mc",
      "prompt": {
        "en": "Liquid ethanol vaporizes without decomposition. What changes at the particle level?",
        "es": "El etanol líquido se vaporiza sin descomponerse. ¿Qué cambia a nivel de partículas?"
      },
      "choices": [
        {
          "text": {
            "en": "Intermolecular attractions are overcome while the molecules remain intact.",
            "es": "Se vencen atracciones intermoleculares y las moléculas permanecen intactas."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "All C−C covalent bonds break.",
            "es": "Se rompen todos los enlaces covalentes C−C."
          },
          "why": {
            "en": "Breaking the molecular framework would change the substance, unlike vaporization.",
            "es": "Romper la estructura molecular cambiaría la sustancia, a diferencia de la vaporización."
          }
        },
        {
          "text": {
            "en": "Every O−H covalent bond breaks to form hydrogen gas.",
            "es": "Se rompe cada enlace covalente O−H para formar hidrógeno gaseoso."
          },
          "why": {
            "en": "Ethanol vapor still contains intact ethanol molecules.",
            "es": "El vapor de etanol todavía contiene moléculas de etanol intactas."
          }
        },
        {
          "text": {
            "en": "The molecules become individual ions.",
            "es": "Las moléculas se convierten en iones individuales."
          },
          "why": {
            "en": "Vaporization separates neutral molecules rather than ionizing them.",
            "es": "La vaporización separa moléculas neutras en vez de ionizarlas."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A physical change can change spacing and intermolecular attractions without changing molecular connectivity.",
        "es": "Un cambio físico puede cambiar la separación y las atracciones intermoleculares sin cambiar la conectividad molecular."
      }
    },
    {
      "id": "4.4-2",
      "topic": "4.4",
      "type": "mc",
      "prompt": {
        "en": "For CH<sub>4</sub>(g) + 2O<sub>2</sub>(g) → CO<sub>2</sub>(g) + 2H<sub>2</sub>O(g), which statement explains why the change is chemical?",
        "es": "Para CH<sub>4</sub>(g) + 2O<sub>2</sub>(g) → CO<sub>2</sub>(g) + 2H<sub>2</sub>O(g), ¿qué afirmación explica por qué el cambio es químico?"
      },
      "choices": [
        {
          "text": {
            "en": "Covalent bonds are broken and formed, producing different substances.",
            "es": "Se rompen y forman enlaces covalentes, lo que produce sustancias diferentes."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only the distances between unchanged methane molecules increase.",
            "es": "Solo aumentan las distancias entre moléculas de metano sin cambios."
          },
          "why": {
            "en": "The products are carbon dioxide and water, not unchanged methane.",
            "es": "Los productos son dióxido de carbono y agua, no metano sin cambios."
          }
        },
        {
          "text": {
            "en": "The total number of carbon atoms increases.",
            "es": "Aumenta el número total de átomos de carbono."
          },
          "why": {
            "en": "Chemical reactions conserve atoms; both sides have one carbon atom per reaction group.",
            "es": "Las reacciones químicas conservan átomos; ambos lados tienen un átomo de carbono por grupo de reacción."
          }
        },
        {
          "text": {
            "en": "Any process involving gases is chemical.",
            "es": "Todo proceso que involucra gases es químico."
          },
          "why": {
            "en": "Gases can also undergo physical changes such as expansion.",
            "es": "Los gases también pueden experimentar cambios físicos como la expansión."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "C−H and O−O bonding is replaced by C−O and O−H bonding. New molecular identities indicate a chemical change.",
        "es": "Los enlaces C−H y O−O se reemplazan por enlaces C−O y O−H. Las identidades moleculares nuevas indican un cambio químico."
      }
    },
    {
      "id": "4.4-3",
      "topic": "4.4",
      "type": "mc",
      "prompt": {
        "en": "A pure NaCl crystal is crushed into smaller crystals without heating or adding another substance. How is this classified?",
        "es": "Un cristal puro de NaCl se tritura en cristales más pequeños sin calentarlo ni agregar otra sustancia. ¿Cómo se clasifica esto?"
      },
      "choices": [
        {
          "text": {
            "en": "A physical change because the chemical composition stays the same",
            "es": "Un cambio físico porque la composición química permanece igual"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A chemical change because every smaller piece is a new compound",
            "es": "Un cambio químico porque cada trozo pequeño es un compuesto nuevo"
          },
          "why": {
            "en": "Smaller crystals still have the same NaCl composition.",
            "es": "Los cristales más pequeños conservan la composición de NaCl."
          }
        },
        {
          "text": {
            "en": "A redox reaction because sodium gains electrons",
            "es": "Una reacción redox porque el sodio gana electrones"
          },
          "why": {
            "en": "Crushing does not change the oxidation numbers of sodium or chlorine.",
            "es": "Triturar no cambia los números de oxidación del sodio ni del cloro."
          }
        },
        {
          "text": {
            "en": "An acid-base reaction because the surface area increases",
            "es": "Una reacción ácido-base porque aumenta el área superficial"
          },
          "why": {
            "en": "Greater surface area does not imply proton transfer.",
            "es": "Una mayor área superficial no implica transferencia de protones."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Crushing changes size and exposes surfaces, but it does not create a new substance. A physical change can alter some particle interactions.",
        "es": "Triturar cambia el tamaño y expone superficies, pero no crea una sustancia nueva. Un cambio físico puede modificar algunas interacciones entre partículas."
      }
    },
    {
      "id": "4.4-4",
      "topic": "4.4",
      "type": "mc",
      "prompt": {
        "en": "Sugar dissolves in water without reacting or decomposing. Which description is correct?",
        "es": "El azúcar se disuelve en agua sin reaccionar ni descomponerse. ¿Qué descripción es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "Intact sugar molecules disperse and form attractions with water.",
            "es": "Las moléculas intactas de azúcar se dispersan y forman atracciones con el agua."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "All sugar covalent bonds break into separate atoms.",
            "es": "Todos los enlaces covalentes del azúcar se rompen y forman átomos separados."
          },
          "why": {
            "en": "Dissolving this molecular solute does not atomize it.",
            "es": "Disolver este soluto molecular no lo separa en átomos."
          }
        },
        {
          "text": {
            "en": "Every sugar molecule becomes a metal cation and an anion.",
            "es": "Cada molécula de azúcar se convierte en un catión metálico y un anión."
          },
          "why": {
            "en": "Sugar is molecular and does not dissociate like an ionic salt.",
            "es": "El azúcar es molecular y no se disocia como una sal iónica."
          }
        },
        {
          "text": {
            "en": "Water loses all of its O−H covalent bonds.",
            "es": "El agua pierde todos sus enlaces covalentes O−H."
          },
          "why": {
            "en": "Water molecules remain intact as they interact with sugar.",
            "es": "Las moléculas de agua permanecen intactas al interactuar con el azúcar."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "This physical change replaces some sugar-sugar and water-water attractions with sugar-water attractions while retaining the covalent frameworks.",
        "es": "Este cambio físico reemplaza algunas atracciones azúcar-azúcar y agua-agua por atracciones azúcar-agua y conserva las estructuras covalentes."
      }
    },
    {
      "id": "4.4-5",
      "topic": "4.4",
      "type": "mc",
      "prompt": {
        "en": "Electrolysis causes 2H<sub>2</sub>O(l) → 2H<sub>2</sub>(g) + O<sub>2</sub>(g). How does it differ from boiling water?",
        "es": "La electrólisis produce 2H<sub>2</sub>O(l) → 2H<sub>2</sub>(g) + O<sub>2</sub>(g). ¿En qué se diferencia de la ebullición del agua?"
      },
      "choices": [
        {
          "text": {
            "en": "Electrolysis changes chemical identity; boiling retains water molecules.",
            "es": "La electrólisis cambia la identidad química; la ebullición conserva las moléculas de agua."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both only separate intact water molecules.",
            "es": "Ambas solo separan moléculas de agua intactas."
          },
          "why": {
            "en": "Electrolysis produces hydrogen and oxygen, which are different substances.",
            "es": "La electrólisis produce hidrógeno y oxígeno, que son sustancias diferentes."
          }
        },
        {
          "text": {
            "en": "Boiling changes oxygen atoms into hydrogen atoms.",
            "es": "La ebullición transforma átomos de oxígeno en átomos de hidrógeno."
          },
          "why": {
            "en": "A physical change does not change the identities of elements.",
            "es": "Un cambio físico no cambia las identidades de los elementos."
          }
        },
        {
          "text": {
            "en": "Electrolysis is physical because gas bubbles appear.",
            "es": "La electrólisis es física porque aparecen burbujas de gas."
          },
          "why": {
            "en": "Classification depends on chemical identity, not simply whether bubbles appear.",
            "es": "La clasificación depende de la identidad química, no solo de si aparecen burbujas."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Electrolysis replaces O−H bonds with H−H and O−O bonds. Boiling overcomes intermolecular attractions while keeping H<sub>2</sub>O intact.",
        "es": "La electrólisis reemplaza enlaces O−H por enlaces H−H y O−O. La ebullición vence atracciones intermoleculares y conserva H<sub>2</sub>O intacta."
      }
    },
    {
      "id": "4.4-6",
      "topic": "4.4",
      "type": "numeric",
      "prompt": {
        "en": "Bond-counting model: 2H<sub>2</sub>O(l) → 2H<sub>2</sub>(g) + O<sub>2</sub>(g). How many original O−H covalent bonds in two water molecules are replaced overall? Count original bonds, not individual mechanism steps.",
        "es": "Modelo de conteo de enlaces: 2H<sub>2</sub>O(l) → 2H<sub>2</sub>(g) + O<sub>2</sub>(g). ¿Cuántos enlaces covalentes O−H originales de dos moléculas de agua se reemplazan en total? Cuenta enlaces originales, no pasos individuales del mecanismo."
      },
      "value": 4,
      "display": "4",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Each water molecule has two O−H bonds. Two molecules contain 2 × 2 = 4 original O−H bonds that are absent from the final hydrogen and oxygen molecules.",
        "es": "Cada molécula de agua tiene dos enlaces O−H. Dos moléculas contienen 2 × 2 = 4 enlaces O−H originales que no están en las moléculas finales de hidrógeno y oxígeno."
      }
    },
    {
      "id": "4.5-1",
      "topic": "4.5",
      "type": "mc",
      "prompt": {
        "en": "For N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), which mole ratio converts moles of H<sub>2</sub> consumed to moles of NH<sub>3</sub> formed?",
        "es": "Para N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g), ¿qué razón molar convierte los moles de H<sub>2</sub> consumidos en moles de NH<sub>3</sub> formados?"
      },
      "choices": [
        {
          "text": {
            "en": "2 mol NH<sub>3</sub> / 3 mol H<sub>2</sub>",
            "es": "2 mol NH<sub>3</sub> / 3 mol H<sub>2</sub>"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "3 mol NH<sub>3</sub> / 2 mol H<sub>2</sub>",
            "es": "3 mol NH<sub>3</sub> / 2 mol H<sub>2</sub>"
          },
          "why": {
            "en": "This reverses the coefficients for hydrogen and ammonia.",
            "es": "Esto invierte los coeficientes del hidrógeno y el amoniaco."
          }
        },
        {
          "text": {
            "en": "1 mol NH<sub>3</sub> / 1 mol H<sub>2</sub>",
            "es": "1 mol NH<sub>3</sub> / 1 mol H<sub>2</sub>"
          },
          "why": {
            "en": "The balanced coefficients are two and three, not one and one.",
            "es": "Los coeficientes balanceados son dos y tres, no uno y uno."
          }
        },
        {
          "text": {
            "en": "2 g NH<sub>3</sub> / 3 g H<sub>2</sub>",
            "es": "2 g NH<sub>3</sub> / 3 g H<sub>2</sub>"
          },
          "why": {
            "en": "Coefficients give mole ratios, not mass ratios. Molar masses are needed for grams.",
            "es": "Los coeficientes dan razones molares, no razones de masa. Se necesitan masas molares para los gramos."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Stoichiometry uses balanced coefficients as a mole ratio. Put the desired NH<sub>3</sub> in the numerator so mol H<sub>2</sub> cancels.",
        "es": "La estequiometría usa los coeficientes balanceados como razón molar. Coloca NH<sub>3</sub>, la sustancia deseada, en el numerador para cancelar mol de H<sub>2</sub>."
      }
    },
    {
      "id": "4.5-2",
      "topic": "4.5",
      "type": "numeric",
      "prompt": {
        "en": "For 2Mg(s) + O<sub>2</sub>(g) → 2MgO(s), 4.862 g Mg reacts with excess oxygen. What mass of MgO forms at 100% yield?",
        "es": "Para 2Mg(s) + O<sub>2</sub>(g) → 2MgO(s), 4.862 g de Mg reaccionan con oxígeno en exceso. ¿Qué masa de MgO se forma con un rendimiento del 100%?"
      },
      "value": 8.062000000000001,
      "display": "8.062",
      "unit": "g",
      "precision": {
        "sf": 4
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "M(MgO) = 24.31 + 16.00 = 40.31 g/mol. Convert 4.862 g / 24.31 g/mol = 0.2000 mol Mg, use the 1:1 ratio, then multiply by 40.31 g/mol to get 8.062 g.",
        "es": "M(MgO) = 24.31 + 16.00 = 40.31 g/mol. Convierte 4.862 g / 24.31 g/mol = 0.2000 mol de Mg, usa la razón 1:1 y multiplica por 40.31 g/mol para obtener 8.062 g."
      }
    },
    {
      "id": "4.5-3",
      "topic": "4.5",
      "type": "numeric",
      "prompt": {
        "en": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g). A mixture contains 0.250 mol N<sub>2</sub> and 0.600 mol H<sub>2</sub>. What is the maximum amount of NH<sub>3</sub>?",
        "es": "N<sub>2</sub>(g) + 3H<sub>2</sub>(g) → 2NH<sub>3</sub>(g). Una mezcla contiene 0.250 mol de N<sub>2</sub> y 0.600 mol de H<sub>2</sub>. ¿Cuál es la cantidad máxima de NH<sub>3</sub>?"
      },
      "value": 0.39999999999999997,
      "display": "0.400",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.00055,
      "explanation": {
        "en": "Nitrogen could make 0.250 × 2 = 0.500 mol NH<sub>3</sub>. Hydrogen could make 0.600 × 2/3 = 0.400 mol. Choose the smaller yield: H<sub>2</sub> is limiting.",
        "es": "El nitrógeno podría formar 0.250 × 2 = 0.500 mol de NH<sub>3</sub>. El hidrógeno podría formar 0.600 × 2/3 = 0.400 mol. Elige el menor rendimiento: H<sub>2</sub> es el reactivo limitante."
      }
    },
    {
      "id": "4.5-4",
      "topic": "4.5",
      "type": "numeric",
      "prompt": {
        "en": "For 2Al(s) + 3Cl<sub>2</sub>(g) → 2AlCl<sub>3</sub>(s), 2.698 g Al reacts with excess chlorine. What is the theoretical yield of AlCl<sub>3</sub> in grams?",
        "es": "Para 2Al(s) + 3Cl<sub>2</sub>(g) → 2AlCl<sub>3</sub>(s), 2.698 g de Al reaccionan con cloro en exceso. ¿Cuál es el rendimiento teórico de AlCl<sub>3</sub> en gramos?"
      },
      "value": 13.333,
      "display": "13.33",
      "unit": "g",
      "precision": {
        "sf": 4
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "M(AlCl<sub>3</sub>) = 26.98 + 3(35.45) = 133.33 g/mol. The 1:1 Al:AlCl<sub>3</sub> ratio gives (2.698/26.98) × 133.33 = 13.333 g, rounded to 13.33 g.",
        "es": "M(AlCl<sub>3</sub>) = 26.98 + 3(35.45) = 133.33 g/mol. La razón 1:1 de Al:AlCl<sub>3</sub> da (2.698/26.98) × 133.33 = 13.333 g, que se redondea a 13.33 g."
      }
    },
    {
      "id": "4.5-5",
      "topic": "4.5",
      "type": "numeric",
      "prompt": {
        "en": "A reaction has a theoretical yield of 9.00 g and an actual yield of 8.10 g. What is its percent yield?",
        "es": "Una reacción tiene un rendimiento teórico de 9.00 g y un rendimiento real de 8.10 g. ¿Cuál es su rendimiento porcentual?"
      },
      "value": 89.99999999999999,
      "display": "90.0",
      "unit": "%",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.05500000000000001,
      "explanation": {
        "en": "Percent yield = actual yield / theoretical yield × 100 = (8.10/9.00) × 100 = 90.0%.",
        "es": "Rendimiento porcentual = rendimiento real / rendimiento teórico × 100 = (8.10/9.00) × 100 = 90.0%."
      }
    },
    {
      "id": "4.5-6",
      "topic": "4.5",
      "type": "numeric",
      "prompt": {
        "en": "CaCO<sub>3</sub>(s) → CaO(s) + CO<sub>2</sub>(g). Starting with 10.009 g pure CaCO<sub>3</sub>, what mass of CaO is collected at 80.0% yield?",
        "es": "CaCO<sub>3</sub>(s) → CaO(s) + CO<sub>2</sub>(g). A partir de 10.009 g de CaCO<sub>3</sub> puro, ¿qué masa de CaO se recoge con un rendimiento del 80.0%?"
      },
      "value": 4.486400000000001,
      "display": "4.49",
      "unit": "g",
      "precision": {
        "sf": 3
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "M(CaCO<sub>3</sub>) = 100.09 g/mol and M(CaO) = 56.08 g/mol. Theoretical CaO = (10.009/100.09) × 56.08 = 5.608 g. Actual yield = 5.608 × 0.800 = 4.4864 g, or 4.49 g.",
        "es": "M(CaCO<sub>3</sub>) = 100.09 g/mol y M(CaO) = 56.08 g/mol. CaO teórico = (10.009/100.09) × 56.08 = 5.608 g. Rendimiento real = 5.608 × 0.800 = 4.4864 g, es decir, 4.49 g."
      }
    },
    {
      "id": "4.6-1",
      "topic": "4.6",
      "type": "mc",
      "prompt": {
        "en": "In an acid-base titration, how does the equivalence point differ from the endpoint?",
        "es": "En una titulación ácido-base, ¿en qué se diferencia el punto de equivalencia del punto final?"
      },
      "choices": [
        {
          "text": {
            "en": "Equivalence is the stoichiometric condition; the endpoint is the observed indicator signal.",
            "es": "El punto de equivalencia es la condición estequiométrica; el punto final es la señal observada del indicador."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Both always mean that pH is exactly 7.00.",
            "es": "Ambos siempre significan que el pH es exactamente 7.00."
          },
          "why": {
            "en": "Equivalence need not occur at pH 7, and an indicator changes over a range.",
            "es": "El punto de equivalencia no tiene que ocurrir a pH 7 y un indicador cambia en un intervalo."
          }
        },
        {
          "text": {
            "en": "The endpoint occurs when the buret is empty.",
            "es": "El punto final ocurre cuando la bureta está vacía."
          },
          "why": {
            "en": "A buret can still contain titrant when the indicator changes.",
            "es": "La bureta puede contener titulante cuando cambia el indicador."
          }
        },
        {
          "text": {
            "en": "Equivalence means equal acid and base volumes for every reaction.",
            "es": "El punto de equivalencia significa volúmenes iguales de ácido y base en toda reacción."
          },
          "why": {
            "en": "Required volumes depend on concentrations and the balanced mole ratio.",
            "es": "Los volúmenes necesarios dependen de las concentraciones y de la razón molar balanceada."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "At equivalence, titrant and analyte have reacted in the balanced stoichiometric ratio. Choose an indicator whose endpoint closely tracks that condition.",
        "es": "En el punto de equivalencia, el titulante y el analito han reaccionado en la razón estequiométrica balanceada. Elige un indicador cuyo punto final se aproxime a esa condición."
      }
    },
    {
      "id": "4.6-2",
      "topic": "4.6",
      "type": "mc",
      "prompt": {
        "en": "Known NaOH(aq) is delivered from a buret into an unknown HCl(aq) sample in a flask. Which labels are correct?",
        "es": "Se vierte NaOH(aq) de concentración conocida desde una bureta hacia una muestra de HCl(aq) de concentración desconocida en un matraz. ¿Qué etiquetas son correctas?"
      },
      "choices": [
        {
          "text": {
            "en": "NaOH is the titrant; HCl is the analyte; the buret measures delivered volume.",
            "es": "NaOH es el titulante; HCl es el analito; la bureta mide el volumen vertido."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "HCl is the titrant because it begins in the flask.",
            "es": "HCl es el titulante porque comienza en el matraz."
          },
          "why": {
            "en": "The known reagent delivered from the buret is the titrant.",
            "es": "El reactivo conocido que se vierte desde la bureta es el titulante."
          }
        },
        {
          "text": {
            "en": "The buret measures the mass of NaOH directly.",
            "es": "La bureta mide directamente la masa de NaOH."
          },
          "why": {
            "en": "Buret graduations measure volume, not mass.",
            "es": "Las graduaciones de la bureta miden volumen, no masa."
          }
        },
        {
          "text": {
            "en": "The analyte is the indicator rather than the acid sample.",
            "es": "El analito es el indicador en vez de la muestra de ácido."
          },
          "why": {
            "en": "The analyte is the substance being measured; the indicator signals an endpoint.",
            "es": "El analito es la sustancia que se mide; el indicador señala un punto final."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l). The known titrant concentration and delivered volume determine the amount of analyte.",
        "es": "HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l). La concentración conocida del titulante y el volumen vertido determinan la cantidad de analito."
      }
    },
    {
      "id": "4.6-3",
      "topic": "4.6",
      "type": "numeric",
      "prompt": {
        "en": "A 25.00 mL HCl sample reaches equivalence with 30.00 mL of 0.1000 M NaOH. For HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l), what is the HCl molarity?",
        "es": "Una muestra de 25.00 mL de HCl alcanza el punto de equivalencia con 30.00 mL de NaOH 0.1000 M. Para HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l), ¿cuál es la molaridad del HCl?"
      },
      "value": 0.12,
      "display": "0.1200",
      "unit": "M",
      "precision": {
        "sf": 4
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Moles NaOH = 0.1000 × 0.03000 = 0.003000 mol. At equivalence moles HCl are equal. Divide by 0.02500 L to get 0.1200 M; use sample volume, not combined volume.",
        "es": "Moles de NaOH = 0.1000 × 0.03000 = 0.003000 mol. En el punto de equivalencia los moles de HCl son iguales. Divide entre 0.02500 L para obtener 0.1200 M; usa el volumen de la muestra, no el volumen combinado."
      }
    },
    {
      "id": "4.6-4",
      "topic": "4.6",
      "type": "numeric",
      "prompt": {
        "en": "A 20.00 mL sample of 0.1500 M H<sub>2</sub>SO<sub>4</sub> is titrated with 0.2000 M NaOH to complete neutralization of both acidic protons. For H<sub>2</sub>SO<sub>4</sub>(aq) + 2NaOH(aq) → Na<sub>2</sub>SO<sub>4</sub>(aq) + 2H<sub>2</sub>O(l), what NaOH volume in mL is required?",
        "es": "Una muestra de 20.00 mL de una solución 0.1500 M de H<sub>2</sub>SO<sub>4</sub> se titula con NaOH 0.2000 M hasta neutralizar por completo ambos protones ácidos. Para H<sub>2</sub>SO<sub>4</sub>(aq) + 2NaOH(aq) → Na<sub>2</sub>SO<sub>4</sub>(aq) + 2H<sub>2</sub>O(l), ¿qué volumen de NaOH en mL se requiere?"
      },
      "value": 30.0,
      "display": "30.00",
      "unit": "mL",
      "precision": {
        "sf": 4
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Acid amount = 0.02000 × 0.1500 = 0.003000 mol. Two moles NaOH per mole acid require 0.006000 mol NaOH. Volume = 0.006000/0.2000 = 0.03000 L = 30.00 mL.",
        "es": "Cantidad de ácido = 0.02000 × 0.1500 = 0.003000 mol. Dos moles de NaOH por mol de ácido requieren 0.006000 mol de NaOH. Volumen = 0.006000/0.2000 = 0.03000 L = 30.00 mL."
      }
    },
    {
      "id": "4.6-5",
      "topic": "4.6",
      "type": "numeric",
      "prompt": {
        "en": "A buret reads 1.24 mL before titration and 24.86 mL at the endpoint. What volume of titrant was delivered?",
        "es": "Una bureta indica 1.24 mL antes de la titulación y 24.86 mL en el punto final. ¿Qué volumen de titulante se vertió?"
      },
      "value": 23.62,
      "display": "23.62",
      "unit": "mL",
      "precision": {
        "decimals": 2
      },
      "tolerance": 0.0055000000000000005,
      "explanation": {
        "en": "Delivered volume is final reading minus initial reading: 24.86 − 1.24 = 23.62 mL. Do not use the final reading alone.",
        "es": "El volumen vertido es la lectura final menos la inicial: 24.86 − 1.24 = 23.62 mL. No uses solo la lectura final."
      }
    },
    {
      "id": "4.6-6",
      "topic": "4.6",
      "type": "numeric",
      "prompt": {
        "en": "Error model: a 25.00 mL HCl sample needs 25.00 mL of 0.1000 M NaOH at equivalence, but a student overshoots to 25.50 mL and uses that volume. HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l). What HCl molarity does the student calculate?",
        "es": "Modelo de error: una muestra de 25.00 mL de HCl necesita 25.00 mL de NaOH 0.1000 M en el punto de equivalencia, pero un estudiante se pasa hasta 25.50 mL y usa ese volumen. HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l). ¿Qué molaridad de HCl calcula el estudiante?"
      },
      "value": 0.10200000000000001,
      "display": "0.1020",
      "unit": "M",
      "precision": {
        "sf": 4
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "The calculation uses 0.1000 × 0.02550/0.02500 = 0.1020 M. This is too high relative to the true 0.1000 M because the endpoint volume exceeds the equivalence volume.",
        "es": "El cálculo usa 0.1000 × 0.02550/0.02500 = 0.1020 M. Es demasiado alto en comparación con el valor verdadero de 0.1000 M porque el volumen del punto final supera el del punto de equivalencia."
      }
    },
    {
      "id": "4.7-1",
      "topic": "4.7",
      "type": "mc",
      "prompt": {
        "en": "Which classification best describes CaCl<sub>2</sub>(aq) + Na<sub>2</sub>CO<sub>3</sub>(aq) → CaCO<sub>3</sub>(s) + 2NaCl(aq)?",
        "es": "¿Qué clasificación describe mejor CaCl<sub>2</sub>(aq) + Na<sub>2</sub>CO<sub>3</sub>(aq) → CaCO<sub>3</sub>(s) + 2NaCl(aq)?"
      },
      "choices": [
        {
          "text": {
            "en": "Precipitation reaction",
            "es": "Reacción de precipitación"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Redox reaction, because calcium changes from +2 to 0",
            "es": "Reacción redox, porque el calcio cambia de +2 a 0"
          },
          "why": {
            "en": "Calcium remains +2 in calcium carbonate.",
            "es": "El calcio permanece en +2 en el carbonato de calcio."
          }
        },
        {
          "text": {
            "en": "Acid-base reaction, because H<sup>+</sup> is transferred",
            "es": "Reacción ácido-base, porque se transfiere H<sup>+</sup>"
          },
          "why": {
            "en": "No proton transfer appears in this reaction.",
            "es": "No aparece una transferencia de protones en esta reacción."
          }
        },
        {
          "text": {
            "en": "Combustion, because oxygen atoms are present",
            "es": "Combustión, porque hay átomos de oxígeno"
          },
          "why": {
            "en": "Having oxygen in a carbonate is not evidence of combustion.",
            "es": "Tener oxígeno en un carbonato no es evidencia de combustión."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Dissolved ions combine to form insoluble CaCO<sub>3</sub>. No oxidation numbers change and no proton is transferred.",
        "es": "Los iones disueltos se combinan para formar CaCO<sub>3</sub> insoluble. No cambian números de oxidación ni se transfiere un protón."
      }
    },
    {
      "id": "4.7-2",
      "topic": "4.7",
      "type": "mc",
      "prompt": {
        "en": "Which classification best describes HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l)?",
        "es": "¿Qué clasificación describe mejor HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l)?"
      },
      "choices": [
        {
          "text": {
            "en": "Acid-base reaction",
            "es": "Reacción ácido-base"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Precipitation, because NaCl forms a solid",
            "es": "Precipitación, porque NaCl forma un sólido"
          },
          "why": {
            "en": "The equation shows dissolved NaCl(aq), not a precipitate.",
            "es": "La ecuación muestra NaCl(aq) disuelto, no un precipitado."
          }
        },
        {
          "text": {
            "en": "Redox, because oxygen is reduced from 0 to −2",
            "es": "Redox, porque el oxígeno se reduce de 0 a −2"
          },
          "why": {
            "en": "Oxygen is −2 in both hydroxide and water.",
            "es": "El oxígeno tiene −2 tanto en el hidróxido como en el agua."
          }
        },
        {
          "text": {
            "en": "Only a phase change of water",
            "es": "Solo un cambio de fase del agua"
          },
          "why": {
            "en": "The acid and base react to form water; water is not merely changing phase.",
            "es": "El ácido y la base reaccionan para formar agua; el agua no solo cambia de fase."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The acid supplies a proton that hydroxide accepts to form water. This is neutralization without electron transfer.",
        "es": "El ácido aporta un protón que el hidróxido acepta para formar agua. Es una neutralización sin transferencia de electrones."
      }
    },
    {
      "id": "4.7-3",
      "topic": "4.7",
      "type": "mc",
      "prompt": {
        "en": "Which feature identifies Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s) as a redox reaction?",
        "es": "¿Qué característica identifica Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s) como una reacción redox?"
      },
      "choices": [
        {
          "text": {
            "en": "Zn changes from 0 to +2 and Cu changes from +2 to 0.",
            "es": "Zn cambia de 0 a +2 y Cu cambia de +2 a 0."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Every ion is a spectator ion.",
            "es": "Cada ion es un ion espectador."
          },
          "why": {
            "en": "Copper ions become copper metal, so they are not spectators.",
            "es": "Los iones cobre se convierten en cobre metálico, así que no son espectadores."
          }
        },
        {
          "text": {
            "en": "A proton moves from zinc to copper.",
            "es": "Un protón pasa del zinc al cobre."
          },
          "why": {
            "en": "The equation contains no hydrogen species; electrons are transferred.",
            "es": "La ecuación no contiene especies de hidrógeno; se transfieren electrones."
          }
        },
        {
          "text": {
            "en": "Both oxidation numbers stay unchanged.",
            "es": "Ambos números de oxidación permanecen sin cambios."
          },
          "why": {
            "en": "Elemental metals have oxidation number 0, unlike their 2+ ions.",
            "es": "Los metales elementales tienen número de oxidación 0, a diferencia de sus iones 2+."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Changes in oxidation number reveal electron transfer. Zinc loses two electrons and copper ions gain them.",
        "es": "Los cambios en el número de oxidación revelan transferencia de electrones. El zinc pierde dos electrones y los iones cobre los ganan."
      }
    },
    {
      "id": "4.7-4",
      "topic": "4.7",
      "type": "mc",
      "prompt": {
        "en": "For Na<sub>2</sub>CO<sub>3</sub>(aq) + 2HCl(aq) → 2NaCl(aq) + H<sub>2</sub>O(l) + CO<sub>2</sub>(g), which description is correct?",
        "es": "Para Na<sub>2</sub>CO<sub>3</sub>(aq) + 2HCl(aq) → 2NaCl(aq) + H<sub>2</sub>O(l) + CO<sub>2</sub>(g), ¿qué descripción es correcta?"
      },
      "choices": [
        {
          "text": {
            "en": "An acid-base reaction produces gas while carbon stays at +4.",
            "es": "Una reacción ácido-base produce gas mientras el carbono permanece en +4."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "It must be redox because every gas-producing reaction transfers electrons.",
            "es": "Debe ser redox porque toda reacción que produce gas transfiere electrones."
          },
          "why": {
            "en": "Gas production alone does not establish changes in oxidation number.",
            "es": "La producción de gas por sí sola no establece cambios en el número de oxidación."
          }
        },
        {
          "text": {
            "en": "It precipitates solid sodium chloride.",
            "es": "Precipita cloruro de sodio sólido."
          },
          "why": {
            "en": "NaCl remains aqueous in the equation.",
            "es": "NaCl permanece acuoso en la ecuación."
          }
        },
        {
          "text": {
            "en": "Carbon is reduced from +4 to 0.",
            "es": "El carbono se reduce de +4 a 0."
          },
          "why": {
            "en": "Carbon is +4 in both carbonate and carbon dioxide.",
            "es": "El carbono tiene +4 tanto en el carbonato como en el dióxido de carbono."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Carbonate accepts protons from the acid, and the overall process produces water and carbon dioxide. Carbon remains +4, so gas evolution here is not redox.",
        "es": "El carbonato acepta protones del ácido y el proceso global produce agua y dióxido de carbono. El carbono permanece en +4, así que la liberación de gas aquí no es redox."
      }
    },
    {
      "id": "4.7-5",
      "topic": "4.7",
      "type": "mc",
      "prompt": {
        "en": "Why is CH<sub>4</sub>(g) + 2O<sub>2</sub>(g) → CO<sub>2</sub>(g) + 2H<sub>2</sub>O(g) classified as redox?",
        "es": "¿Por qué CH<sub>4</sub>(g) + 2O<sub>2</sub>(g) → CO<sub>2</sub>(g) + 2H<sub>2</sub>O(g) se clasifica como redox?"
      },
      "choices": [
        {
          "text": {
            "en": "Carbon goes from −4 to +4 and oxygen from 0 to −2.",
            "es": "El carbono pasa de −4 a +4 y el oxígeno de 0 a −2."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Oxygen stays at −2 on both sides.",
            "es": "El oxígeno permanece en −2 en ambos lados."
          },
          "why": {
            "en": "Elemental O<sub>2</sub> has oxidation number 0.",
            "es": "O<sub>2</sub> elemental tiene número de oxidación 0."
          }
        },
        {
          "text": {
            "en": "Every reaction with water as a product is acid-base only.",
            "es": "Toda reacción con agua como producto es solo ácido-base."
          },
          "why": {
            "en": "Product identity alone does not replace oxidation-number analysis.",
            "es": "La identidad del producto por sí sola no reemplaza el análisis del número de oxidación."
          }
        },
        {
          "text": {
            "en": "Methane simply dissolves in oxygen without changing bonds.",
            "es": "El metano simplemente se disuelve en oxígeno sin cambiar enlaces."
          },
          "why": {
            "en": "Carbon dioxide and water are new substances with different bonding.",
            "es": "El dióxido de carbono y el agua son sustancias nuevas con enlaces diferentes."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Combustion is a redox process: carbon is oxidized and oxygen is reduced. Hydrogen stays at +1.",
        "es": "La combustión es un proceso redox: el carbono se oxida y el oxígeno se reduce. El hidrógeno permanece en +1."
      }
    },
    {
      "id": "4.7-6",
      "topic": "4.7",
      "type": "numeric",
      "prompt": {
        "en": "A precipitation reaction follows CaCl<sub>2</sub>(aq) + Na<sub>2</sub>CO<sub>3</sub>(aq) → CaCO<sub>3</sub>(s) + 2NaCl(aq). With excess carbonate, assume all 0.0200 mol CaCl<sub>2</sub> precipitates. How many moles of CaCO<sub>3</sub> form?",
        "es": "Una reacción de precipitación sigue CaCl<sub>2</sub>(aq) + Na<sub>2</sub>CO<sub>3</sub>(aq) → CaCO<sub>3</sub>(s) + 2NaCl(aq). Con carbonato en exceso, supone que precipitan todos los 0.0200 mol de CaCl<sub>2</sub>. ¿Cuántos moles de CaCO<sub>3</sub> se forman?"
      },
      "value": 0.02,
      "display": "0.0200",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Each mole of CaCl<sub>2</sub> supplies one mole of calcium ions and makes one mole of solid CaCO<sub>3</sub>. The 1:1 ratio gives 0.0200 mol.",
        "es": "Cada mol de CaCl<sub>2</sub> aporta un mol de iones calcio y forma un mol de CaCO<sub>3</sub> sólido. La razón 1:1 da 0.0200 mol."
      }
    },
    {
      "id": "4.8-1",
      "topic": "4.8",
      "type": "mc",
      "prompt": {
        "en": "Consider the forward proton transfer NH<sub>3</sub>(aq) + H<sub>2</sub>O(l) → NH<sub>4</sub><sup>+</sup>(aq) + OH<sup>−</sup>(aq). This does not imply complete reaction. What is the role of NH<sub>3</sub>?",
        "es": "Considera la transferencia de protones hacia los productos NH<sub>3</sub>(aq) + H<sub>2</sub>O(l) → NH<sub>4</sub><sup>+</sup>(aq) + OH<sup>−</sup>(aq). Esto no implica una reacción completa. ¿Cuál es la función de NH<sub>3</sub>?"
      },
      "choices": [
        {
          "text": {
            "en": "A Brønsted-Lowry base because it accepts a proton",
            "es": "Una base de Brønsted-Lowry porque acepta un protón"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "A Brønsted-Lowry acid because it gains a proton",
            "es": "Un ácido de Brønsted-Lowry porque gana un protón"
          },
          "why": {
            "en": "A Brønsted-Lowry acid donates a proton; gaining one makes NH<sub>3</sub> a base here.",
            "es": "Un ácido de Brønsted-Lowry dona un protón; ganarlo hace que NH<sub>3</sub> sea una base aquí."
          }
        },
        {
          "text": {
            "en": "An oxidizing agent because nitrogen becomes +1",
            "es": "Un agente oxidante porque el nitrógeno cambia a +1"
          },
          "why": {
            "en": "Nitrogen stays at −3 in NH<sub>3</sub> and NH<sub>4</sub><sup>+</sup>.",
            "es": "El nitrógeno permanece en −3 en NH<sub>3</sub> y NH<sub>4</sub><sup>+</sup>."
          }
        },
        {
          "text": {
            "en": "A spectator because its formula stays unchanged",
            "es": "Un espectador porque su fórmula permanece sin cambios"
          },
          "why": {
            "en": "NH<sub>3</sub> changes to NH<sub>4</sub><sup>+</sup>, so it participates.",
            "es": "NH<sub>3</sub> cambia a NH<sub>4</sub><sup>+</sup>, así que participa."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "NH<sub>3</sub> accepts H<sup>+</sup> from water and becomes NH<sub>4</sub><sup>+</sup>, its conjugate acid. Water acts as the acid in this event.",
        "es": "NH<sub>3</sub> acepta H<sup>+</sup> del agua y se convierte en NH<sub>4</sub><sup>+</sup>, su ácido conjugado. El agua actúa como ácido en este evento."
      }
    },
    {
      "id": "4.8-2",
      "topic": "4.8",
      "type": "mc",
      "prompt": {
        "en": "In HCl(aq) + H<sub>2</sub>O(l) → H<sub>3</sub>O<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), which statement identifies the acid and its conjugate base?",
        "es": "En HCl(aq) + H<sub>2</sub>O(l) → H<sub>3</sub>O<sup>+</sup>(aq) + Cl<sup>−</sup>(aq), ¿qué afirmación identifica al ácido y su base conjugada?"
      },
      "choices": [
        {
          "text": {
            "en": "HCl donates a proton; Cl<sup>−</sup> is its conjugate base.",
            "es": "HCl dona un protón; Cl<sup>−</sup> es su base conjugada."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Water donates a proton; H<sub>3</sub>O<sup>+</sup> is its conjugate base.",
            "es": "El agua dona un protón; H<sub>3</sub>O<sup>+</sup> es su base conjugada."
          },
          "why": {
            "en": "Water gains a proton here, and hydronium is its conjugate acid.",
            "es": "El agua gana un protón aquí y el hidronio es su ácido conjugado."
          }
        },
        {
          "text": {
            "en": "Cl<sup>−</sup> is the acid because its charge is negative.",
            "es": "Cl<sup>−</sup> es el ácido porque su carga es negativa."
          },
          "why": {
            "en": "Acid-base roles depend on proton transfer, not the sign of charge alone.",
            "es": "Las funciones ácido-base dependen de la transferencia de protones, no solo del signo de la carga."
          }
        },
        {
          "text": {
            "en": "HCl and H<sub>3</sub>O<sup>+</sup> are a conjugate pair.",
            "es": "HCl y H<sub>3</sub>O<sup>+</sup> son un par conjugado."
          },
          "why": {
            "en": "A conjugate pair must differ by exactly one proton, retaining the other atoms.",
            "es": "Un par conjugado debe diferir en exactamente un protón y conservar los otros átomos."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "A Brønsted-Lowry acid donates H<sup>+</sup>. Removing H<sup>+</sup> from HCl leaves Cl<sup>−</sup>, its conjugate base.",
        "es": "Un ácido de Brønsted-Lowry dona H<sup>+</sup>. Retirar H<sup>+</sup> de HCl deja Cl<sup>−</sup>, su base conjugada."
      }
    },
    {
      "id": "4.8-3",
      "topic": "4.8",
      "type": "mc",
      "prompt": {
        "en": "Which pair is a conjugate acid-base pair?",
        "es": "¿Qué par es un par ácido-base conjugado?"
      },
      "choices": [
        {
          "text": {
            "en": "NH<sub>4</sub><sup>+</sup>(aq) and NH<sub>3</sub>(aq)",
            "es": "NH<sub>4</sub><sup>+</sup>(aq) y NH<sub>3</sub>(aq)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "HCl(aq) and NaOH(aq)",
            "es": "HCl(aq) y NaOH(aq)"
          },
          "why": {
            "en": "These are an acid and a base, but they do not differ by a single proton.",
            "es": "Son un ácido y una base, pero no difieren en un solo protón."
          }
        },
        {
          "text": {
            "en": "H<sub>2</sub>O(l) and O<sub>2</sub>(g)",
            "es": "H<sub>2</sub>O(l) y O<sub>2</sub>(g)"
          },
          "why": {
            "en": "Their compositions differ by more than adding or removing H<sup>+</sup>.",
            "es": "Sus composiciones difieren en más que agregar o retirar H<sup>+</sup>."
          }
        },
        {
          "text": {
            "en": "Na<sup>+</sup>(aq) and Cl<sup>−</sup>(aq)",
            "es": "Na<sup>+</sup>(aq) y Cl<sup>−</sup>(aq)"
          },
          "why": {
            "en": "Opposite charges do not make species a conjugate pair.",
            "es": "Las cargas opuestas no hacen que las especies sean un par conjugado."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "NH<sub>4</sub><sup>+</sup> loses one H<sup>+</sup> to give NH<sub>3</sub>. A conjugate acid has one more proton and a charge one unit higher than its base.",
        "es": "NH<sub>4</sub><sup>+</sup> pierde un H<sup>+</sup> para dar NH<sub>3</sub>. Un ácido conjugado tiene un protón más y una carga una unidad mayor que su base."
      }
    },
    {
      "id": "4.8-4",
      "topic": "4.8",
      "type": "mc",
      "prompt": {
        "en": "For CH<sub>3</sub>COOH(aq) + NH<sub>3</sub>(aq) → CH<sub>3</sub>COO<sup>−</sup>(aq) + NH<sub>4</sub><sup>+</sup>(aq), identify the conjugate products.",
        "es": "Para CH<sub>3</sub>COOH(aq) + NH<sub>3</sub>(aq) → CH<sub>3</sub>COO<sup>−</sup>(aq) + NH<sub>4</sub><sup>+</sup>(aq), identifica los productos conjugados."
      },
      "choices": [
        {
          "text": {
            "en": "CH<sub>3</sub>COO<sup>−</sup> is the conjugate base; NH<sub>4</sub><sup>+</sup> is the conjugate acid.",
            "es": "CH<sub>3</sub>COO<sup>−</sup> es la base conjugada; NH<sub>4</sub><sup>+</sup> es el ácido conjugado."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "CH<sub>3</sub>COO<sup>−</sup> is the conjugate acid; NH<sub>4</sub><sup>+</sup> is the conjugate base.",
            "es": "CH<sub>3</sub>COO<sup>−</sup> es el ácido conjugado; NH<sub>4</sub><sup>+</sup> es la base conjugada."
          },
          "why": {
            "en": "The species formed by losing a proton is the base, while the one formed by gaining it is the acid.",
            "es": "La especie formada al perder un protón es la base y la formada al ganarlo es el ácido."
          }
        },
        {
          "text": {
            "en": "Both products are spectator ions.",
            "es": "Ambos productos son iones espectadores."
          },
          "why": {
            "en": "Both products have different proton counts from their reactants.",
            "es": "Ambos productos tienen cantidades de protones distintas de las de sus reactivos."
          }
        },
        {
          "text": {
            "en": "Both products result from electron transfer.",
            "es": "Ambos productos resultan de transferencia de electrones."
          },
          "why": {
            "en": "This equation transfers a proton without changing oxidation numbers.",
            "es": "Esta ecuación transfiere un protón sin cambiar los números de oxidación."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Acetic acid donates H<sup>+</sup> and becomes acetate. Ammonia accepts that H<sup>+</sup> and becomes ammonium.",
        "es": "El ácido acético dona H<sup>+</sup> y se convierte en acetato. El amoniaco acepta ese H<sup>+</sup> y se convierte en amonio."
      }
    },
    {
      "id": "4.8-5",
      "topic": "4.8",
      "type": "mc",
      "prompt": {
        "en": "Compare a strong acid and a weak acid at the same initial molarity in water. What does acid strength describe?",
        "es": "Compara un ácido fuerte y un ácido débil con la misma molaridad inicial en agua. ¿Qué describe la fuerza del ácido?"
      },
      "choices": [
        {
          "text": {
            "en": "The extent of ionization: essentially complete for the strong acid, partial for the weak acid",
            "es": "El grado de ionización: prácticamente completo para el ácido fuerte y parcial para el ácido débil"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Only the initial number of moles per liter",
            "es": "Solo el número inicial de moles por litro"
          },
          "why": {
            "en": "Moles per liter describes concentration, which the prompt holds equal.",
            "es": "Los moles por litro describen la concentración, que el enunciado mantiene igual."
          }
        },
        {
          "text": {
            "en": "Whether every molecule contains oxygen",
            "es": "Si cada molécula contiene oxígeno"
          },
          "why": {
            "en": "Strong acids can lack oxygen, as HCl does.",
            "es": "Los ácidos fuertes pueden carecer de oxígeno, como HCl."
          }
        },
        {
          "text": {
            "en": "The mass of the container holding the acid",
            "es": "La masa del recipiente que contiene el ácido"
          },
          "why": {
            "en": "Container mass does not define ionization or acid strength.",
            "es": "La masa del recipiente no define la ionización ni la fuerza del ácido."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Strength and concentration are different. A strong acid is a strong electrolyte; a weak acid is a weak electrolyte because only part of it ionizes in water.",
        "es": "La fuerza y la concentración son diferentes. Un ácido fuerte es un electrolito fuerte; un ácido débil es un electrolito débil porque solo una parte se ioniza en agua."
      }
    },
    {
      "id": "4.8-6",
      "topic": "4.8",
      "type": "numeric",
      "prompt": {
        "en": "For HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l), how many moles of OH<sup>−</sup> accept the acidic protons from 0.0150 mol HCl at complete neutralization?",
        "es": "Para HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l), ¿cuántos moles de OH<sup>−</sup> aceptan los protones ácidos de 0.0150 mol de HCl en la neutralización completa?"
      },
      "value": 0.015,
      "display": "0.0150",
      "unit": "mol",
      "precision": {
        "sf": 3
      },
      "tolerance": 5.500000000000001e-05,
      "explanation": {
        "en": "Each HCl donates one proton and each OH<sup>−</sup> accepts one proton to form water. The 1:1 ratio requires 0.0150 mol OH<sup>−</sup>.",
        "es": "Cada HCl dona un protón y cada OH<sup>−</sup> acepta un protón para formar agua. La razón 1:1 requiere 0.0150 mol de OH<sup>−</sup>."
      }
    },
    {
      "id": "4.9-1",
      "topic": "4.9",
      "type": "mc",
      "prompt": {
        "en": "In Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s), which species is oxidized and which is reduced?",
        "es": "En Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s), ¿qué especie se oxida y cuál se reduce?"
      },
      "choices": [
        {
          "text": {
            "en": "Zn is oxidized; Cu<sup>2+</sup> is reduced.",
            "es": "Zn se oxida; Cu<sup>2+</sup> se reduce."
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Zn is reduced; Cu<sup>2+</sup> is oxidized.",
            "es": "Zn se reduce; Cu<sup>2+</sup> se oxida."
          },
          "why": {
            "en": "An increasing oxidation number is oxidation, while a decreasing one is reduction.",
            "es": "Un número de oxidación creciente indica oxidación y uno decreciente indica reducción."
          }
        },
        {
          "text": {
            "en": "Both are oxidized because a solid appears.",
            "es": "Ambos se oxidan porque aparece un sólido."
          },
          "why": {
            "en": "The copper ion gains electrons, which is reduction.",
            "es": "El ion cobre gana electrones, lo que es reducción."
          }
        },
        {
          "text": {
            "en": "Neither changes oxidation number.",
            "es": "Ninguno cambia de número de oxidación."
          },
          "why": {
            "en": "Zn changes 0 to +2, while copper changes +2 to 0.",
            "es": "Zn cambia de 0 a +2 y el cobre de +2 a 0."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Zn loses two electrons as its oxidation number rises from 0 to +2. Cu<sup>2+</sup> gains two electrons as its oxidation number falls from +2 to 0.",
        "es": "Zn pierde dos electrones cuando su número de oxidación aumenta de 0 a +2. Cu<sup>2+</sup> gana dos electrones cuando su número de oxidación disminuye de +2 a 0."
      }
    },
    {
      "id": "4.9-2",
      "topic": "4.9",
      "type": "mc",
      "prompt": {
        "en": "For Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s), which species is the oxidizing agent?",
        "es": "Para Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s), ¿qué especie es el agente oxidante?"
      },
      "choices": [
        {
          "text": {
            "en": "Cu<sup>2+</sup>(aq), because it accepts electrons",
            "es": "Cu<sup>2+</sup>(aq), porque acepta electrones"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Zn(s), because it loses electrons",
            "es": "Zn(s), porque pierde electrones"
          },
          "why": {
            "en": "The electron donor is the reducing agent, not the oxidizing agent.",
            "es": "El donador de electrones es el agente reductor, no el agente oxidante."
          }
        },
        {
          "text": {
            "en": "Zn<sup>2+</sup>(aq), because it is a product ion",
            "es": "Zn<sup>2+</sup>(aq), porque es un ion producto"
          },
          "why": {
            "en": "The oxidizing agent is the reactant that is reduced, not the oxidized product.",
            "es": "El agente oxidante es el reactivo que se reduce, no el producto oxidado."
          }
        },
        {
          "text": {
            "en": "Cu(s), because it is neutral",
            "es": "Cu(s), porque es neutro"
          },
          "why": {
            "en": "Copper metal is the reduced product, not the electron-accepting reactant.",
            "es": "El cobre metálico es el producto reducido, no el reactivo que acepta electrones."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The oxidizing agent causes another species to lose electrons and is itself reduced. Cu<sup>2+</sup> accepts the electrons from zinc.",
        "es": "El agente oxidante hace que otra especie pierda electrones y él mismo se reduce. Cu<sup>2+</sup> acepta los electrones del zinc."
      }
    },
    {
      "id": "4.9-3",
      "topic": "4.9",
      "type": "mc",
      "prompt": {
        "en": "For Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s), which species is the reducing agent?",
        "es": "Para Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s), ¿qué especie es el agente reductor?"
      },
      "choices": [
        {
          "text": {
            "en": "Zn(s), because it donates electrons",
            "es": "Zn(s), porque dona electrones"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Cu<sup>2+</sup>(aq), because it gains electrons",
            "es": "Cu<sup>2+</sup>(aq), porque gana electrones"
          },
          "why": {
            "en": "A species gaining electrons is the oxidizing agent.",
            "es": "Una especie que gana electrones es el agente oxidante."
          }
        },
        {
          "text": {
            "en": "Zn<sup>2+</sup>(aq), because it has a positive charge",
            "es": "Zn<sup>2+</sup>(aq), porque tiene carga positiva"
          },
          "why": {
            "en": "Charge alone does not define the agent; the donor reactant is Zn(s).",
            "es": "La carga por sí sola no define al agente; el reactivo donador es Zn(s)."
          }
        },
        {
          "text": {
            "en": "Cu(s), because all metals reduce other species here",
            "es": "Cu(s), porque todos los metales reducen otras especies aquí"
          },
          "why": {
            "en": "Copper is a product here; zinc is the reactant supplying electrons.",
            "es": "El cobre es un producto aquí; el zinc es el reactivo que aporta electrones."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "The reducing agent causes reduction of another species and is itself oxidized. Zn supplies two electrons per atom.",
        "es": "El agente reductor causa la reducción de otra especie y él mismo se oxida. Zn aporta dos electrones por átomo."
      }
    },
    {
      "id": "4.9-4",
      "topic": "4.9",
      "type": "mc",
      "prompt": {
        "en": "Which half-reaction represents reduction of aqueous iron(III) to iron(II) with atoms and charge balanced?",
        "es": "¿Qué semirreacción representa la reducción de hierro(III) acuoso a hierro(II) con átomos y carga balanceados?"
      },
      "choices": [
        {
          "text": {
            "en": "Fe<sup>3+</sup>(aq) + e<sup>−</sup> → Fe<sup>2+</sup>(aq)",
            "es": "Fe<sup>3+</sup>(aq) + e<sup>−</sup> → Fe<sup>2+</sup>(aq)"
          },
          "why": {
            "en": "",
            "es": ""
          }
        },
        {
          "text": {
            "en": "Fe<sup>3+</sup>(aq) → Fe<sup>2+</sup>(aq) + e<sup>−</sup>",
            "es": "Fe<sup>3+</sup>(aq) → Fe<sup>2+</sup>(aq) + e<sup>−</sup>"
          },
          "why": {
            "en": "An electron must be gained, and this choice has charge +3 on the left versus +1 on the right.",
            "es": "Se debe ganar un electrón y esta opción tiene carga +3 a la izquierda y +1 a la derecha."
          }
        },
        {
          "text": {
            "en": "Fe<sup>3+</sup>(aq) + 2e<sup>−</sup> → Fe<sup>2+</sup>(aq)",
            "es": "Fe<sup>3+</sup>(aq) + 2e<sup>−</sup> → Fe<sup>2+</sup>(aq)"
          },
          "why": {
            "en": "Two electrons would reduce the left-side net charge to +1, not +2.",
            "es": "Dos electrones reducirían la carga neta del lado izquierdo a +1, no a +2."
          }
        },
        {
          "text": {
            "en": "Fe<sup>2+</sup>(aq) → Fe<sup>3+</sup>(aq) + e<sup>−</sup>",
            "es": "Fe<sup>2+</sup>(aq) → Fe<sup>3+</sup>(aq) + e<sup>−</sup>"
          },
          "why": {
            "en": "This is the balanced oxidation half-reaction, the reverse of the requested reduction.",
            "es": "Esta es la semirreacción de oxidación balanceada, la inversa de la reducción solicitada."
          }
        }
      ],
      "answer": 0,
      "explanation": {
        "en": "Reduction is electron gain. The charge sum on the left is +3 − 1 = +2, matching Fe<sup>2+</sup> on the right.",
        "es": "La reducción es ganancia de electrones. La suma de cargas a la izquierda es +3 − 1 = +2, igual a Fe<sup>2+</sup> a la derecha."
      }
    },
    {
      "id": "4.9-5",
      "topic": "4.9",
      "type": "numeric",
      "prompt": {
        "en": "What is the oxidation number of sulfur in SO<sub>4</sub><sup>2−</sup>(aq)? Enter the signed number and choose no units.",
        "es": "¿Cuál es el número de oxidación del azufre en SO<sub>4</sub><sup>2−</sup>(aq)? Escribe el número con su signo y elige sin unidades."
      },
      "value": 6,
      "display": "+6",
      "unit": "ratio",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Each oxygen is −2. Let sulfur be x: x + 4(−2) = −2, so x = +6. The sum equals the ion charge, not zero.",
        "es": "Cada oxígeno tiene −2. Sea x el número del azufre: x + 4(−2) = −2, así que x = +6. La suma es igual a la carga del ion, no a cero."
      }
    },
    {
      "id": "4.9-6",
      "topic": "4.9",
      "type": "numeric",
      "prompt": {
        "en": "Electron-counting model: 2Al(s) + 3Cu<sup>2+</sup>(aq) → 2Al<sup>3+</sup>(aq) + 3Cu(s). How many electrons transfer when exactly 2 Al atoms react?",
        "es": "Modelo de conteo de electrones: 2Al(s) + 3Cu<sup>2+</sup>(aq) → 2Al<sup>3+</sup>(aq) + 3Cu(s). ¿Cuántos electrones se transfieren cuando reaccionan exactamente 2 átomos de Al?"
      },
      "value": 6,
      "display": "6",
      "unit": "count",
      "precision": {
        "exact": true
      },
      "tolerance": 0,
      "explanation": {
        "en": "Each Al atom loses 3 electrons. Two atoms lose 2 × 3 = 6 electrons; three Cu<sup>2+</sup> ions gain 3 × 2 = 6 electrons. Electrons lost equal electrons gained.",
        "es": "Cada átomo de Al pierde 3 electrones. Dos átomos pierden 2 × 3 = 6 electrones; tres iones Cu<sup>2+</sup> ganan 3 × 2 = 6 electrones. Los electrones perdidos igualan a los ganados."
      }
    }
  ],
  "units": [
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
      "id": "L",
      "label": {
        "en": "L",
        "es": "L"
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
      "id": "M",
      "label": {
        "en": "M (mol/L)",
        "es": "M (mol/L)"
      }
    },
    {
      "id": "%",
      "label": {
        "en": "%",
        "es": "%"
      }
    },
    {
      "id": "count",
      "label": {
        "en": "count",
        "es": "cantidad"
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
    "title": "AP Chemistry Unit 4 Practice",
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
      "Select one answer, or enter a number and choose its unit. For a count, choose count; for a ratio, choose no units.": "Selecciona una respuesta o escribe un número y elige su unidad. Para un conteo, elige cantidad; para una relación, elige sin unidades.",
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
      "AP Chemistry Unit 4 Practice": "Práctica de la unidad 4 de Química AP",
      "AP Chemistry · Unit 4": "Química AP · Unidad 4",
      "Choose a topic, then start. Mixed review includes all nine topics.": "Elige un tema y comienza. El repaso mixto incluye los nueve temas.",
      "Choose one topic for six questions, or Mixed review for all 54. Read the feedback after each answer.": "Elige un tema para seis preguntas o Repaso mixto para las 54. Lee los comentarios después de cada respuesta.",
      "Aligned practice for AP Chemistry CED topics 4.1 to 4.9. Original ZornScience questions.": "Práctica alineada con los temas 4.1 a 4.9 del CED de Química AP. Preguntas originales de ZornScience.",
      "Use these values. Keep extra digits in your work and round only the final answer.": "Usa estos valores. Conserva dígitos adicionales en tu trabajo y redondea solo la respuesta final.",
      "Solubility rules for 4.2": "Reglas de solubilidad para 4.2",
      "For dilute aqueous solutions near room temperature: Group 1, ammonium and nitrate salts are soluble.": "Para soluciones acuosas diluidas cerca de la temperatura ambiente: las sales del grupo 1, del amonio y de nitrato son solubles.",
      "Chlorides are generally soluble except those of Ag, Pb and Hg(I). Sulfates are generally soluble except those of Ba, Sr and Pb; CaSO4 has limited solubility.": "Los cloruros suelen ser solubles excepto los de Ag, Pb y Hg(I). Los sulfatos suelen ser solubles excepto los de Ba, Sr y Pb; CaSO4 tiene solubilidad limitada.",
      "Carbonates and phosphates are generally insoluble except Group 1 and ammonium salts. Hydroxides are generally insoluble except Group 1; Ca, Sr and Ba hydroxides are more soluble. These are guidelines; use any specific data in a prompt.": "Los carbonatos y fosfatos suelen ser insolubles excepto las sales del grupo 1 y del amonio. Los hidróxidos suelen ser insolubles excepto los del grupo 1; los hidróxidos de Ca, Sr y Ba son más solubles. Son pautas; usa los datos específicos del enunciado.",
      "Keep weak acids, solids and pure liquids intact in ionic equations. Separate soluble strong electrolytes into ions and cancel only unchanged spectator ions.": "Conserva intactos los ácidos débiles, los sólidos y los líquidos puros en las ecuaciones iónicas. Separa los electrolitos fuertes solubles en iones y cancela solo los iones espectadores que no cambian.",
      "Molarity = moles / liters of solution. Use balanced coefficients for mole ratios. Percent yield = actual yield / theoretical yield × 100.": "Molaridad = moles / litros de solución. Usa los coeficientes balanceados para las razones molares. Rendimiento porcentual = rendimiento real / rendimiento teórico × 100.",
      "Model: initial reacting particles": "Modelo: partículas iniciales de la reacción",
      "Four hydrogen pairs and three oxygen pairs before reaction. Small open circles represent H; large filled circles represent O.": "Cuatro pares de hidrógeno y tres pares de oxígeno antes de la reacción. Los círculos pequeños vacíos representan H; los círculos grandes rellenos representan O.",
      "Before reaction": "Antes de la reacción",
      "After": "Después",
      "Model, not to scale. Small open circles represent H; large filled circles represent O. Each joined group is one molecule.": "Modelo, sin escala. Los círculos pequeños vacíos representan H; los círculos grandes rellenos representan O. Cada grupo unido es una molécula.",
      "Chlorides are generally soluble except those of Ag, Pb and Hg(I). Sulfates are generally soluble except those of Ba, Sr and Pb.": "Los cloruros suelen ser solubles excepto los de Ag, Pb y Hg(I). Los sulfatos suelen ser solubles excepto los de Ba, Sr y Pb.",
      "limited solubility": "solubilidad limitada"
    }
  }
};
  if (typeof module === "object" && module.exports) module.exports = bank;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="apchem-unit4-practice"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());
