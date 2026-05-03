import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── PASSAGES + QUESTIONS ────────────────────────────────────────────────────
const PASSAGES = [
    {
      id: 1,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Ocean currents are driven by differences in temperature and salinity. Cold, salty water sinks while warmer water rises to replace it. This movement helps regulate global climate.',
      questions: [
        {
          question: 'What causes ocean currents in the passage?',
          options: ['Temperature and salinity differences', 'Wind only', 'Earthquakes', 'Tides'],
          correct: 0,
          explanation: 'The passage states currents are driven by temperature and salinity differences.'
        },
        {
          question: 'Why does cold salty water sink?',
          options: ['It is lighter', 'It evaporates', 'It is denser', 'It heats up'],
          correct: 2,
          explanation: 'Cold, salty water is denser, causing it to sink.'
        },
        {
          question: 'What is the result of this movement?',
          options: ['Wave formation', 'Ice melting', 'Fish migration', 'Climate regulation'],
          correct: 3,
          explanation: 'The passage says it helps regulate global climate.'
        }
      ]
    },

    {
      id: 2,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'Sleep is essential for brain function. During sleep, the brain processes information and clears waste. Without enough sleep, performance declines.',
      questions: [
        {
          question: 'What happens during sleep?',
          options: ['The brain shuts off', 'The brain processes information and clears waste', 'Only dreaming occurs', 'Nothing important'],
          correct: 1,
          explanation: 'The passage explains the brain processes information and clears waste.'
        },
        {
          question: 'What is the effect of not sleeping enough?',
          options: ['Better focus', 'No change', 'Improved memory', 'Reduced performance'],
          correct: 3,
          explanation: 'The passage says performance declines.'
        },
        {
          question: 'What is the main idea?',
          options: ['Sleep is optional', 'Sleep harms the brain', 'Sleep is important for brain function', 'Sleep only affects the body'],
          correct: 2,
          explanation: 'The passage emphasizes sleep is essential for brain function.'
        }
      ]
    },

    {
      id: 3,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Coral reefs support many marine species despite covering little ocean area. They provide food and shelter for organisms. However, rising temperatures can damage them.',
      questions: [
        {
          question: 'Why are coral reefs important?',
          options: ['They control tides', 'They support many species', 'They create oxygen', 'They cool oceans'],
          correct: 1,
          explanation: 'They support many marine species.'
        },
        {
          question: 'What do reefs provide?',
          options: ['Energy', 'Waves', 'Food and shelter', 'Light'],
          correct: 2,
          explanation: 'The passage states they provide food and shelter.'
        },
        {
          question: 'What threatens reefs?',
          options: ['Cold water', 'Wind', 'Rising temperatures', 'Darkness'],
          correct: 2,
          explanation: 'Rising temperatures damage reefs.'
        }
      ]
    },

    {
      id: 4,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'The placebo effect demonstrates that belief can influence physical outcomes. Patients given inactive treatments often report real improvements. This suggests the mind can trigger biological responses.',
      questions: [
        {
          question: 'What is the placebo effect?',
          options: ['A harmful drug reaction', 'A surgical method', 'A diagnostic error', 'A belief-driven improvement'],
          correct: 3,
          explanation: 'It refers to improvement caused by belief.'
        },
        {
          question: 'Why is it surprising?',
          options: ['It uses chemicals', 'It works instantly', 'It produces real effects without active treatment', 'It is expensive'],
          correct: 2,
          explanation: 'Inactive treatments still produce real effects.'
        },
        {
          question: 'What does this suggest?',
          options: ['The body ignores the brain', 'The mind influences biology', 'Medicine is useless', 'Doctors are unnecessary'],
          correct: 1,
          explanation: 'The passage suggests the mind triggers biological responses.'
        }
      ]
    },

    {
      id: 5,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'The printing press made books widely available. This allowed ideas to spread quickly across regions. As a result, literacy rates increased.',
      questions: [
        {
          question: 'What did the printing press do?',
          options: ['Made books widely available', 'Reduced reading', 'Destroyed books', 'Limited knowledge'],
          correct: 0,
          explanation: 'It made books widely available.'
        },
        {
          question: 'What was a result of this?',
          options: ['Less communication', 'Faster idea spread', 'Fewer writers', 'Less learning'],
          correct: 1,
          explanation: 'Ideas spread quickly.'
        },
        {
          question: 'What increased?',
          options: ['Prices', 'Literacy rates', 'Wars', 'Travel'],
          correct: 1,
          explanation: 'Literacy rates increased.'
        }
      ]
    },

    {
      id: 6,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'Plants use photosynthesis to make food. They convert sunlight, water, and carbon dioxide into energy. Oxygen is released as a byproduct.',
      questions: [
        {
          question: 'What is photosynthesis?',
          options: ['Breathing', 'Digestion', 'Energy conversion', 'Movement'],
          correct: 2,
          explanation: 'It converts sunlight into energy.'
        },
        {
          question: 'What do plants produce?',
          options: ['Nitrogen', 'Carbon dioxide', 'Energy and oxygen', 'Heat'],
          correct: 2,
          explanation: 'They produce energy and release oxygen.'
        },
        {
          question: 'What is required?',
          options: ['Wind', 'Sunlight, water, carbon dioxide', 'Soil only', 'Animals'],
          correct: 1,
          explanation: 'These inputs are required.'
        }
      ]
    },

    {
      id: 7,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Democracy relies on individuals making informed choices. However, people often act on limited information or bias. This can lead to imperfect outcomes.',
      questions: [
        {
          question: 'What does democracy depend on?',
          options: ['Leaders only', 'Wealth', 'Technology', 'Individual choices'],
          correct: 3,
          explanation: 'It relies on individual decisions.'
        },
        {
          question: 'What problem is identified?',
          options: ['Too much information', 'Bias and limited information', 'Lack of voting', 'Too many leaders'],
          correct: 1,
          explanation: 'People act on bias or limited information.'
        },
        {
          question: 'What is the result?',
          options: ['Perfect outcomes', 'Faster systems', 'Imperfect outcomes', 'Better laws'],
          correct: 2,
          explanation: 'This leads to imperfect outcomes.'
        }
      ]
    },

    {
      id: 8,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'The human microbiome consists of trillions of bacteria. These organisms aid digestion and influence health. Disruptions can lead to illness.',
      questions: [
        {
          question: 'What is the microbiome?',
          options: ['Bacteria in the body', 'Human cells', 'Organs', 'Blood'],
          correct: 0,
          explanation: 'It refers to bacteria in the body.'
        },
        {
          question: 'What do these bacteria do?',
          options: ['Aid digestion', 'Destroy cells', 'Stop breathing', 'Cause sleep'],
          correct: 0,
          explanation: 'They help digestion and health.'
        },
        {
          question: 'What happens if disrupted?',
          options: ['Better health', 'No change', 'Illness', 'Growth'],
          correct: 2,
          explanation: 'Disruption leads to illness.'
        }
      ]
    },

    {
      id: 9,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'Volcanoes release magma from beneath Earth’s surface. When magma reaches the surface, it is called lava. Eruptions can create new land.',
      questions: [
        {
          question: 'What is magma?',
          options: ['Surface rock', 'Molten rock underground', 'Gas', 'Water'],
          correct: 1,
          explanation: 'Magma is molten rock below the surface.'
        },
        {
          question: 'What is lava?',
          options: ['Cold rock', 'Magma underground', 'Magma on the surface', 'Ash'],
          correct: 2,
          explanation: 'Lava is magma after eruption.'
        },
        {
          question: 'What can eruptions do?',
          options: ['Destroy air', 'Stop oceans', 'Remove soil', 'Create land'],
          correct: 3,
          explanation: 'They can create new land.'
        }
      ]
    },

    {
      id: 10,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Cultural exchange allows ideas to spread between societies. However, power imbalances can make this exchange controversial. Context determines whether it is respectful or harmful.',
      questions: [
        {
          question: 'What is cultural exchange?',
          options: ['Isolation', 'Sharing ideas between cultures', 'Trade only', 'Language loss'],
          correct: 1,
          explanation: 'It refers to sharing ideas between cultures.'
        },
        {
          question: 'What issue can arise?',
          options: ['Power imbalances', 'Weather changes', 'Technology failure', 'Population growth'],
          correct: 0,
          explanation: 'Power imbalances can create controversy.'
        },
        {
          question: 'What determines if it is harmful?',
          options: ['Time', 'Location', 'Context', 'Population'],
          correct: 2,
          explanation: 'The passage says context determines this.'
        }
      ]
    },
    {
    id: 11,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Glaciers move slowly over land due to gravity. As they advance, they carve valleys and reshape landscapes. This process can take thousands of years.',
    questions: [
      {
        question: 'What causes glaciers to move?',
        options: ['Wind', 'Gravity', 'Ocean currents', 'Heat'],
        correct: 1,
        explanation: 'The passage states glaciers move due to gravity.'
      },
      {
        question: 'What do glaciers do to land?',
        options: ['Flatten it instantly', 'Heat the ground', 'Grow plants', 'Carve valleys'],
        correct: 3,
        explanation: 'They carve valleys and reshape landscapes.'
      },
      {
        question: 'How long does this process take?',
        options: ['Days', 'Months', 'Years', 'Thousands of years'],
        correct: 3,
        explanation: 'The passage says it takes thousands of years.'
      }
    ]
  },

  {
    id: 12,
    domain: 'D2',
    difficulty: 'Easy',
    text: 'Electric circuits require a complete path for current to flow. If the path is broken, electricity cannot move. Switches control this flow by opening or closing the circuit.',
    questions: [
      {
        question: 'What is needed for current to flow?',
        options: ['Heat', 'A complete path', 'Light', 'Air'],
        correct: 1,
        explanation: 'A complete path is required for current flow.'
      },
      {
        question: 'What happens if the path is broken?',
        options: ['More current flows', 'Nothing changes', 'Electricity stops', 'The circuit heats up'],
        correct: 2,
        explanation: 'Electricity cannot move if the path is broken.'
      },
      {
        question: 'What do switches do?',
        options: ['Control the flow', 'Create energy', 'Store electricity', 'Destroy circuits'],
        correct: 0,
        explanation: 'Switches open or close the circuit.'
      }
    ]
  },

  {
    id: 13,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Urban areas tend to be warmer than surrounding regions. Buildings and pavement absorb and retain heat. This effect is known as the urban heat island effect.',
    questions: [
      {
        question: 'Why are cities warmer?',
        options: ['More wind', 'Less sunlight', 'More water', 'Heat absorption by surfaces'],
        correct: 3,
        explanation: 'Buildings and pavement retain heat.'
      },
      {
        question: 'What is this effect called?',
        options: ['Global warming', 'Heat island effect', 'Solar effect', 'Thermal drift'],
        correct: 1,
        explanation: 'It is called the urban heat island effect.'
      },
      {
        question: 'What materials contribute to this?',
        options: ['Trees', 'Water', 'Ice', 'Buildings and pavement'],
        correct: 3,
        explanation: 'These materials absorb heat.'
      }
    ]
  },

  {
    id: 14,
    domain: 'D2',
    difficulty: 'Hard',
    text: 'Language shapes how people perceive reality. Different languages categorize experiences in unique ways. This can influence thought and decision-making.',
    questions: [
      {
        question: 'What does the passage suggest about language?',
        options: ['It limits communication', 'It shapes perception', 'It is universal', 'It prevents thinking'],
        correct: 1,
        explanation: 'Language influences how people perceive reality.'
      },
      {
        question: 'Why do languages differ?',
        options: ['They categorize experiences differently', 'They use the same rules', 'They avoid meaning', 'They eliminate emotion'],
        correct: 0,
        explanation: 'Languages categorize experiences in unique ways.'
      },
      {
        question: 'What is influenced by language?',
        options: ['Weather', 'Thought and decisions', 'Gravity', 'Time'],
        correct: 1,
        explanation: 'It influences thought and decision-making.'
      }
    ]
  },

  {
    id: 15,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Renewable energy sources include solar and wind power. These sources do not run out and produce less pollution. They are increasingly used worldwide.',
    questions: [
      {
        question: 'What are renewable sources?',
        options: ['Coal and oil', 'Gas and wood', 'Metal and water', 'Solar and wind'],
        correct: 3,
        explanation: 'Solar and wind are renewable sources.'
      },
      {
        question: 'Why are they important?',
        options: ['They are expensive', 'They run out quickly', 'They produce less pollution', 'They are rare'],
        correct: 2,
        explanation: 'They produce less pollution.'
      },
      {
        question: 'What trend is mentioned?',
        options: ['Decreasing use', 'No change', 'Increasing use', 'Limited access'],
        correct: 2,
        explanation: 'They are increasingly used worldwide.'
      }
    ]
  },

  {
    id: 16,
    domain: 'D2',
    difficulty: 'Easy',
    text: 'Water boils at 100 degrees Celsius at standard pressure. Heating water increases its temperature until it changes into vapor. This process is called boiling.',
    questions: [
      {
        question: 'At what temperature does water boil?',
        options: ['0°C', '50°C', '100°C', '200°C'],
        correct: 2,
        explanation: 'Water boils at 100°C.'
      },
      {
        question: 'What happens during boiling?',
        options: ['Water becomes vapor', 'Water freezes', 'Water disappears', 'Water cools'],
        correct: 0,
        explanation: 'It changes into vapor.'
      },
      {
        question: 'What is needed for boiling?',
        options: ['Cooling', 'Heating', 'Freezing', 'Pressure drop'],
        correct: 1,
        explanation: 'Heating causes boiling.'
      }
    ]
  },

  {
    id: 17,
    domain: 'D2',
    difficulty: 'Hard',
    text: 'Economic inflation reduces purchasing power over time. As prices rise, the same amount of money buys fewer goods. This can impact savings and wages.',
    questions: [
      {
        question: 'What is inflation?',
        options: ['Falling prices', 'Stable prices', 'No prices', 'Rising prices'],
        correct: 3,
        explanation: 'Inflation refers to rising prices.'
      },
      {
        question: 'What happens to purchasing power?',
        options: ['It increases', 'It stays the same', 'It doubles', 'It decreases'],
        correct: 3,
        explanation: 'It decreases over time.'
      },
      {
        question: 'What is affected?',
        options: ['Weather', 'Savings and wages', 'Gravity', 'Light'],
        correct: 1,
        explanation: 'Savings and wages are impacted.'
      }
    ]
  },

  {
    id: 18,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Antibiotics are used to treat bacterial infections. They do not work against viruses. Misuse can lead to antibiotic resistance.',
    questions: [
      {
        question: 'What do antibiotics treat?',
        options: ['Bacteria', 'Viruses', 'Fungi', 'All diseases'],
        correct: 0,
        explanation: 'They treat bacterial infections.'
      },
      {
        question: 'What do they not work against?',
        options: ['Viruses', 'Bacteria', 'Cells', 'Water'],
        correct: 0,
        explanation: 'They do not work against viruses.'
      },
      {
        question: 'What can misuse cause?',
        options: ['Faster healing', 'Stronger medicine', 'Lower cost', 'Resistance'],
        correct: 3,
        explanation: 'Misuse leads to resistance.'
      }
    ]
  },

  {
    id: 19,
    domain: 'D2',
    difficulty: 'Easy',
    text: 'Gravity pulls objects toward Earth. The stronger the mass, the stronger the pull. This force keeps planets in orbit.',
    questions: [
      {
        question: 'What does gravity do?',
        options: ['Push objects away', 'Pull objects toward Earth', 'Stop motion', 'Create light'],
        correct: 1,
        explanation: 'Gravity pulls objects toward Earth.'
      },
      {
        question: 'What affects gravity strength?',
        options: ['Color', 'Mass', 'Speed', 'Temperature'],
        correct: 1,
        explanation: 'Mass determines strength.'
      },
      {
        question: 'What does gravity keep in orbit?',
        options: ['Cars', 'Planets', 'Buildings', 'Clouds'],
        correct: 1,
        explanation: 'Gravity keeps planets in orbit.'
      }
    ]
  },

  {
    id: 20,
    domain: 'D2',
    difficulty: 'Hard',
    text: 'Artificial intelligence can analyze large datasets quickly. However, it depends on the quality of the data provided. Poor data can lead to incorrect conclusions.',
    questions: [
      {
        question: 'What is a strength of AI?',
        options: ['Slow analysis', 'Human emotions', 'Memory loss', 'Fast data analysis'],
        correct: 3,
        explanation: 'AI analyzes data quickly.'
      },
      {
        question: 'What does AI depend on?',
        options: ['Electricity only', 'Data quality', 'User mood', 'Data quality'],
        correct: 3,
        explanation: 'It depends on data quality.'
      },
      {
        question: 'What happens with poor data?',
        options: ['Better results', 'No effect', 'Incorrect conclusions', 'Faster output'],
        correct: 2,
        explanation: 'Poor data leads to incorrect conclusions.'
      }
    ]
  },
    {
    id: 21,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Ecosystems consist of living and nonliving components interacting together. Plants, animals, and environmental factors depend on each other. A change in one part can affect the entire system.',
    questions: [
      {
        question: 'What is an ecosystem?',
        options: ['Only animals', 'Only plants', 'Living and nonliving components interacting', 'Weather patterns only'],
        correct: 2,
        explanation: 'The passage defines ecosystems as interactions between living and nonliving components.'
      },
      {
        question: 'What is emphasized about ecosystems?',
        options: ['Independence', 'Interdependence', 'Isolation', 'Randomness'],
        correct: 1,
        explanation: 'The passage highlights that components depend on each other.'
      },
      {
        question: 'What happens if one part changes?',
        options: ['Nothing', 'Only plants are affected', 'The entire system can be affected', 'Only animals are affected'],
        correct: 2,
        explanation: 'A change can impact the whole system.'
      }
    ]
  },

  {
    id: 22,
    domain: 'D2',
    difficulty: 'Easy',
    text: 'Sound travels in waves through a medium such as air or water. It cannot travel through a vacuum. The speed of sound depends on the medium.',
    questions: [
      {
        question: 'How does sound travel?',
        options: ['As waves', 'As particles', 'As light', 'As heat'],
        correct: 1,
        explanation: 'Sound travels in waves.'
      },
      {
        question: 'Where can sound not travel?',
        options: ['Air', 'Water', 'Vacuum', 'Solid'],
        correct: 2,
        explanation: 'Sound cannot travel through a vacuum.'
      },
      {
        question: 'What affects the speed of sound?',
        options: ['Color', 'Medium', 'Light', 'Gravity'],
        correct: 1,
        explanation: 'The medium determines sound speed.'
      }
    ]
  },

  {
    id: 23,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Supply and demand determine market prices. When demand increases and supply stays constant, prices tend to rise. Conversely, excess supply can lower prices.',
    questions: [
      {
        question: 'What determines market prices?',
        options: ['Government only', 'Weather', 'Supply and demand', 'Population'],
        correct: 2,
        explanation: 'Prices are determined by supply and demand.'
      },
      {
        question: 'What happens when demand increases?',
        options: ['Prices fall', 'No change', 'Supply disappears', 'Prices rise'],
        correct: 3,
        explanation: 'Higher demand leads to higher prices.'
      },
      {
        question: 'What happens with excess supply?',
        options: ['Prices decrease', 'Prices increase', 'Demand increases', 'Nothing changes'],
        correct: 0,
        explanation: 'Excess supply lowers prices.'
      }
    ]
  },

  {
    id: 24,
    domain: 'D2',
    difficulty: 'Hard',
    text: 'Memory is not a perfect recording of events. Each time a memory is recalled, it can be altered slightly. This makes human recollection both flexible and unreliable.',
    questions: [
      {
        question: 'What does the passage suggest about memory?',
        options: ['It is exact', 'It is permanent', 'It can change over time', 'It is stored physically'],
        correct: 2,
        explanation: 'Memory can be altered when recalled.'
      },
      {
        question: 'Why is memory unreliable?',
        options: ['It disappears quickly', 'It is never used', 'It changes during recall', 'It depends on others'],
        correct: 2,
        explanation: 'Recall can modify memory.'
      },
      {
        question: 'What quality does memory have?',
        options: ['Rigidity', 'Flexibility', 'Immutability', 'Stability'],
        correct: 1,
        explanation: 'The passage calls memory flexible.'
      }
    ]
  },

  {
    id: 25,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Friction is a force that resists motion between surfaces. It can slow objects down or stop them completely. Without friction, movement would be difficult to control.',
    questions: [
      {
        question: 'What is friction?',
        options: ['A pushing force', 'A magnetic force', 'A pulling force', 'A resisting force'],
        correct: 3,
        explanation: 'Friction resists motion.'
      },
      {
        question: 'What does friction do?',
        options: ['Slows or stops motion', 'Speeds objects up', 'Creates energy', 'Removes mass'],
        correct: 0,
        explanation: 'It slows or stops objects.'
      },
      {
        question: 'What would happen without friction?',
        options: ['Uncontrolled movement', 'Better control', 'No movement', 'More gravity'],
        correct: 0,
        explanation: 'Movement would be hard to control.'
      }
    ]
  },

  {
    id: 26,
    domain: 'D2',
    difficulty: 'Easy',
    text: 'The sun is the primary source of energy for Earth. It provides light and heat necessary for life. Plants use this energy for photosynthesis.',
    questions: [
      {
        question: 'What is Earth’s main energy source?',
        options: ['Moon', 'Sun', 'Wind', 'Water'],
        correct: 1,
        explanation: 'The sun is the primary energy source.'
      },
      {
        question: 'What does the sun provide?',
        options: ['Water', 'Light and heat', 'Soil', 'Gravity'],
        correct: 1,
        explanation: 'It provides light and heat.'
      },
      {
        question: 'What do plants use sunlight for?',
        options: ['Movement', 'Photosynthesis', 'Digestion', 'Sleep'],
        correct: 1,
        explanation: 'Plants use sunlight for photosynthesis.'
      }
    ]
  },

  {
    id: 27,
    domain: 'D2',
    difficulty: 'Hard',
    text: 'Scientific theories are supported by evidence and experimentation. They are not guesses but well-tested explanations. However, they can be revised if new evidence emerges.',
    questions: [
      {
        question: 'What is a scientific theory?',
        options: ['A guess', 'An opinion', 'A tested explanation', 'A fact without proof'],
        correct: 2,
        explanation: 'Theories are well-tested explanations.'
      },
      {
        question: 'What supports theories?',
        options: ['Beliefs', 'Evidence and experimentation', 'Tradition', 'Authority'],
        correct: 1,
        explanation: 'They are supported by evidence and experiments.'
      },
      {
        question: 'Can theories change?',
        options: ['Yes, with new evidence', 'No', 'Only rarely', 'Only in science fiction'],
        correct: 0,
        explanation: 'They can be revised with new evidence.'
      }
    ]
  },

  {
    id: 28,
    domain: 'D2',
    difficulty: 'Medium',
    text: 'Migration is the seasonal movement of animals. Many species travel long distances to find food or breeding grounds. These journeys can be dangerous.',
    questions: [
      {
        question: 'What is migration?',
        options: ['Random movement', 'Daily travel', 'Permanent relocation', 'Seasonal movement'],
        correct: 3,
        explanation: 'Migration is seasonal movement.'
      },
      {
        question: 'Why do animals migrate?',
        options: ['Avoid humans', 'Find food or breeding grounds', 'Change color', 'Stay warm only'],
        correct: 1,
        explanation: 'They migrate for food and breeding.'
      },
      {
        question: 'What is a challenge of migration?',
        options: ['Short distance', 'Safety', 'Danger', 'Speed'],
        correct: 2,
        explanation: 'The passage says journeys can be dangerous.'
      }
    ]
  },

  {
    id: 29,
    domain: 'D2',
    difficulty: 'Easy',
    text: 'Plants need water, sunlight, and nutrients to grow. Without these, they cannot survive. Growth depends on environmental conditions.',
    questions: [
      {
        question: 'What do plants need?',
        options: ['Water, sunlight, nutrients', 'Metal', 'Animals', 'Air only'],
        correct: 0,
        explanation: 'These are required for growth.'
      },
      {
        question: 'What happens without them?',
        options: ['Faster growth', 'No change', 'They cannot survive', 'They grow differently'],
        correct: 2,
        explanation: 'Plants cannot survive without these.'
      },
      {
        question: 'What affects growth?',
        options: ['Environment', 'Luck',, 'Time only', 'Color'],
        correct: 0,
        explanation: 'Growth depends on environmental conditions.'
      }
    ]
  },

  {
    id: 30,
    domain: 'D2',
    difficulty: 'Hard',
    text: 'Ethical decisions often involve balancing competing values. What is beneficial for one group may harm another. This makes ethical reasoning complex.',
    questions: [
      {
        question: 'What do ethical decisions involve?',
        options: ['Simple answers', 'Following rules only', 'Ignoring outcomes', 'Balancing values'],
        correct: 3,
        explanation: 'They involve balancing competing values.'
      },
      {
        question: 'Why are ethical decisions complex?',
        options: ['They are easy', 'They involve no conflict', 'They affect different groups differently', 'They are always obvious'],
        correct: 2,
        explanation: 'Different groups may be affected differently.'
      },
      {
        question: 'What creates difficulty?',
        options: ['Lack of knowledge', 'Conflicting values', 'Too much time', 'Too many people'],
        correct: 1,
        explanation: 'Conflicting values create complexity.'
      }
    ]
  },
      {
      id: 31,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Atoms are the basic units of matter. They combine to form molecules, which make up all substances. Different combinations create different materials.',
      questions: [
        {
          question: 'What are atoms?',
          options: ['Basic units of matter', 'Energy sources', 'Types of molecules', 'Forms of light'],
          correct: 0,
          explanation: 'Atoms are described as the basic units of matter.'
        },
        {
          question: 'What do atoms form?',
          options: ['Cells', 'Energy', 'Waves', 'Molecules'],
          correct: 3,
          explanation: 'Atoms combine to form molecules.'
        },
        {
          question: 'Why are combinations important?',
          options: ['They create energy', 'They form different materials', 'They stop reactions', 'They reduce mass'],
          correct: 1,
          explanation: 'Different combinations create different materials.'
        }
      ]
    },

    {
      id: 32,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'The Earth rotates on its axis once every 24 hours. This rotation causes day and night. Different parts of Earth receive sunlight at different times.',
      questions: [
        {
          question: 'What causes day and night?',
          options: ['Earth’s rotation', 'Earth’s orbit', 'The moon', 'Clouds'],
          correct: 0,
          explanation: 'Rotation causes day and night.'
        },
        {
          question: 'How long does one rotation take?',
          options: ['12 hours', '24 hours', '48 hours', '7 days'],
          correct: 1,
          explanation: 'One full rotation takes 24 hours.'
        },
        {
          question: 'Why do places experience day at different times?',
          options: ['Different climates', 'Wind patterns', 'Ocean currents', 'Different sunlight exposure'],
          correct: 3,
          explanation: 'Different areas receive sunlight at different times.'
        }
      ]
    },

    {
      id: 33,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Competition occurs when organisms require the same limited resources. This can affect population sizes. Some species adapt to reduce competition.',
      questions: [
        {
          question: 'What is competition?',
          options: ['Cooperation', 'Shared resources', 'Migration', 'Struggle for limited resources'],
          correct: 3,
          explanation: 'Competition is the struggle for limited resources.'
        },
        {
          question: 'What can competition affect?',
          options: ['Weather', 'Population sizes', 'Gravity', 'Light'],
          correct: 1,
          explanation: 'It affects population sizes.'
        },
        {
          question: 'How do species respond?',
          options: ['Disappear', 'Adapt', 'Stop growing', 'Ignore resources'],
          correct: 1,
          explanation: 'Some species adapt to reduce competition.'
        }
      ]
    },

    {
      id: 34,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Technological advancements often solve problems but can create new ones. Increased efficiency may lead to unintended consequences. This highlights the complexity of innovation.',
      questions: [
        {
          question: 'What is a key idea about technology?',
          options: ['It solves all problems', 'It creates no issues', 'It can create new problems', 'It is predictable'],
          correct: 2,
          explanation: 'Technology can create unintended consequences.'
        },
        {
          question: 'What can increased efficiency lead to?',
          options: ['Unintended consequences', 'Less complexity', 'No change', 'Fewer innovations'],
          correct: 0,
          explanation: 'Efficiency can cause unintended consequences.'
        },
        {
          question: 'What does this show about innovation?',
          options: ['It is simple', 'It is complex', 'It is useless', 'It is complete'],
          correct: 1,
          explanation: 'Innovation is complex.'
        }
      ]
    },

    {
      id: 35,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Water cycles through evaporation, condensation, and precipitation. This continuous movement distributes water across Earth. It is essential for life.',
      questions: [
        {
          question: 'What is the water cycle?',
          options: ['Movement through stages', 'Static water', 'Ocean currents', 'Rain only'],
          correct: 0,
          explanation: 'Water moves through evaporation, condensation, and precipitation.'
        },
        {
          question: 'What does it distribute?',
          options: ['Energy', 'Air', 'Water', 'Soil'],
          correct: 2,
          explanation: 'It distributes water across Earth.'
        },
        {
          question: 'Why is it important?',
          options: ['It controls weather only', 'It creates heat', 'It stops evaporation', 'It supports life'],
          correct: 3,
          explanation: 'It is essential for life.'
        }
      ]
    },

    {
      id: 36,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'Plants grow toward light in a process called phototropism. This helps them maximize energy intake. Light is essential for their survival.',
      questions: [
        {
          question: 'What is phototropism?',
          options: ['Plant movement toward light', 'Water absorption', 'Root growth', 'Seed spreading'],
          correct: 0,
          explanation: 'Phototropism is growth toward light.'
        },
        {
          question: 'Why do plants grow toward light?',
          options: ['Avoid heat', 'Reduce size', 'Change color', 'Maximize energy intake'],
          correct: 3,
          explanation: 'It helps maximize energy intake.'
        },
        {
          question: 'Why is light important?',
          options: ['It changes shape', 'It supports survival', 'It creates roots', 'It reduces growth'],
          correct: 1,
          explanation: 'Light is essential for survival.'
        }
      ]
    },

    {
      id: 37,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Bias can influence decision-making without conscious awareness. People often believe they are objective when they are not. Recognizing bias is the first step toward reducing it.',
      questions: [
        {
          question: 'What is bias?',
          options: ['Logical thinking', 'Scientific method', 'Random behavior', 'Unconscious influence'],
          correct: 3,
          explanation: 'Bias influences decisions unconsciously.'
        },
        {
          question: 'What do people often believe?',
          options: ['They are biased', 'They are objective', 'They are uninformed', 'They are correct', 'They are objective'],
          correct: 3,
          explanation: 'People often believe they are objective.'
        },
        {
          question: 'What reduces bias?',
          options: ['Ignoring it', 'Avoiding decisions', 'Following others', 'Recognizing it'],
          correct: 3,
          explanation: 'Recognizing bias helps reduce it.'
        }
      ]
    },

    {
      id: 38,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Energy cannot be created or destroyed, only transformed. This principle is known as conservation of energy. It applies to all physical systems.',
      questions: [
        {
          question: 'What happens to energy?',
          options: ['It disappears', 'It is created', 'It is transformed', 'It stops'],
          correct: 2,
          explanation: 'Energy is transformed, not created or destroyed.'
        },
        {
          question: 'What is this principle called?',
          options: ['Energy flow', 'Energy balance', 'Conservation of energy', 'Energy loss'],
          correct: 2,
          explanation: 'It is called conservation of energy.'
        },
        {
          question: 'Where does it apply?',
          options: ['Only physics labs', 'Only Earth', 'All systems', 'Only machines'],
          correct: 2,
          explanation: 'It applies to all physical systems.'
        }
      ]
    },

    {
      id: 39,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'Wind is caused by differences in air pressure. Air moves from high pressure to low pressure areas. This movement creates wind.',
      questions: [
        {
          question: 'What causes wind?',
          options: ['Air pressure differences', 'Temperature only', 'Water flow', 'Gravity'],
          correct: 0,
          explanation: 'Wind is caused by pressure differences.'
        },
        {
          question: 'How does air move?',
          options: ['High to low', 'Low to high', 'Sideways only', 'Up only'],
          correct: 0,
          explanation: 'Air moves from high to low pressure.'
        },
        {
          question: 'What is wind?',
          options: ['Moving air', 'Heat', 'Water vapor', 'Light'],
          correct: 0,
          explanation: 'Wind is moving air.'
        }
      ]
    },

    {
      id: 40,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Historical interpretations can change over time. New evidence or perspectives can alter how events are understood. This shows that history is not always fixed.',
      questions: [
        {
          question: 'What can change historical interpretations?',
          options: ['Time alone', 'New evidence or perspectives', 'Weather', 'Population'],
          correct: 1,
          explanation: 'New evidence or perspectives can change interpretations.'
        },
        {
          question: 'What does this suggest about history?',
          options: ['It is fixed', 'It never changes', 'It can be reinterpreted', 'It is predictable'],
          correct: 2,
          explanation: 'History can be reinterpreted.'
        },
        {
          question: 'Why is history not fixed?',
          options: ['It is forgotten', 'It depends on opinion', 'New information can emerge', 'It is inaccurate'],
          correct: 2,
          explanation: 'New information can change understanding.'
        }
      ]
    },
        {
      id: 41,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Sound waves require a medium such as air, water, or solids to travel. They cannot move through empty space. The vibration of particles carries the sound energy.',
      questions: [
        {
          question: 'What do sound waves need to travel?',
          options: ['Light', 'Vacuum', 'Heat', 'A medium'],
          correct: 3,
          explanation: 'Sound waves need a medium like air or water.'
        },
        {
          question: 'Can sound travel through empty space?',
          options: ['Yes', 'Only sometimes', 'No', 'Only in water'],
          correct: 2,
          explanation: 'The passage states sound cannot travel through a vacuum.'
        },
        {
          question: 'What carries sound energy?',
          options: ['Light particles', 'Vibrating particles', 'Magnetic fields', 'Electric currents'],
          correct: 1,
          explanation: 'Vibration of particles carries sound energy.'
        }
      ]
    },

    {
      id: 42,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'The water cycle moves water through evaporation, condensation, and precipitation. It continuously recycles water on Earth.',
      questions: [
        {
          question: 'What are the stages of the water cycle?',
          options: ['Freeze, melt, boil', 'Evaporation, condensation, precipitation', 'Drain, collect, store', 'Absorb, release, form'],
          correct: 1,
          explanation: 'The passage lists evaporation, condensation, and precipitation.'
        },
        {
          question: 'What does the water cycle do?',
          options: ['Recycles water', 'Destroys water', 'Stops rainfall', 'Creates oceans'],
          correct: 0,
          explanation: 'It continuously recycles water.'
        },
        {
          question: 'Where does this cycle occur?',
          options: ['Only oceans', 'Only clouds', 'On Earth', 'Only rivers'],
          correct: 2,
          explanation: 'It occurs globally on Earth.'
        }
      ]
    },

    {
      id: 43,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Fossils are preserved remains or traces of ancient organisms. They provide evidence of past life on Earth. Scientists use them to study evolution.',
      questions: [
        {
          question: 'What are fossils?',
          options: ['Living organisms', 'Rocks only', 'Plants only', 'Ancient remains or traces'],
          correct: 3,
          explanation: 'Fossils are preserved remains or traces.'
        },
        {
          question: 'What do fossils show?',
          options: ['Future life', 'Weather patterns', 'Past life', 'Ocean depth'],
          correct: 2,
          explanation: 'They provide evidence of past life.'
        },
        {
          question: 'How are fossils used?',
          options: ['To study evolution', 'To predict weather', 'To create energy', 'To grow plants'],
          correct: 0,
          explanation: 'Scientists use them to study evolution.'
        }
      ]
    },

    {
      id: 44,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Social media influences how people communicate and consume information. While it enables fast sharing, it can also spread misinformation quickly.',
      questions: [
        {
          question: 'What is a benefit of social media?',
          options: ['Slower communication', 'Fast information sharing', 'Less interaction', 'No communication'],
          correct: 1,
          explanation: 'It enables fast sharing.'
        },
        {
          question: 'What is a drawback?',
          options: ['Misinformation spread', 'Better accuracy', 'Less usage', 'No content'],
          correct: 0,
          explanation: 'It can spread misinformation.'
        },
        {
          question: 'What does it influence?',
          options: ['Only weather', 'Communication and information consumption', 'Gravity', 'Biology only'],
          correct: 1,
          explanation: 'It affects communication and information consumption.'
        }
      ]
    },

    {
      id: 45,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Cells are the basic building blocks of life. All living organisms are made of one or more cells. They carry out essential life functions.',
      questions: [
        {
          question: 'What are cells?',
          options: ['Energy units', 'Tissues only', 'Organs', 'Building blocks of life'],
          correct: 3,
          explanation: 'Cells are the basic building blocks of life.'
        },
        {
          question: 'What are organisms made of?',
          options: ['Atoms only', 'Proteins only', 'One or more cells', 'Air'],
          correct: 2,
          explanation: 'All organisms are made of cells.'
        },
        {
          question: 'What do cells do?',
          options: ['Stop growth', 'Block energy', 'Carry out life functions', 'Create weather'],
          correct: 2,
          explanation: 'They perform essential life functions.'
        }
      ]
    },

    {
      id: 46,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'Light travels faster than sound. This is why we see lightning before hearing thunder. The difference in speed is significant.',
      questions: [
        {
          question: 'Which travels faster?',
          options: ['Light', 'Sound', 'Both equal', 'Neither'],
          correct: 0,
          explanation: 'Light travels faster than sound.'
        },
        {
          question: 'Why do we see lightning first?',
          options: ['Sound is blocked', 'Thunder is delayed intentionally', 'Rain hides sound', 'Light is faster'],
          correct: 3,
          explanation: 'Light reaches us faster than sound.'
        },
        {
          question: 'What is thunder?',
          options: ['Light wave', 'Sound wave', 'Heat wave', 'Wind'],
          correct: 1,
          explanation: 'Thunder is sound.'
        }
      ]
    },

    {
      id: 47,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Climate change is driven by increased greenhouse gas emissions. These gases trap heat in the atmosphere, leading to rising global temperatures.',
      questions: [
        {
          question: 'What causes climate change in the passage?',
          options: ['Wind patterns', 'Earth’s rotation', 'Ocean currents', 'Greenhouse gas emissions'],
          correct: 3,
          explanation: 'It is driven by greenhouse gas emissions.'
        },
        {
          question: 'What do greenhouse gases do?',
          options: ['Cool Earth', 'Trap heat', 'Create oxygen', 'Block sunlight completely'],
          correct: 1,
          explanation: 'They trap heat in the atmosphere.'
        },
        {
          question: 'What is the result?',
          options: ['Lower temperatures', 'Rising temperatures', 'No change', 'More oxygen'],
          correct: 1,
          explanation: 'They lead to rising global temperatures.'
        }
      ]
    },

    {
      id: 48,
      domain: 'D2',
      difficulty: 'Medium',
      text: 'Electricity flows through conductors like metals. Insulators resist electrical flow. These materials are used in different applications.',
      questions: [
        {
          question: 'What are conductors?',
          options: ['Materials that block electricity', 'Gases', 'Materials that allow electricity to flow', 'Liquids only'],
          correct: 2,
          explanation: 'Conductors allow electricity to flow.'
        },
        {
          question: 'What are insulators?',
          options: ['Materials that resist electricity', 'Heat producers', 'Metals only', 'Charged particles'],
          correct: 0,
          explanation: 'Insulators resist electrical flow.'
        },
        {
          question: 'Why are they important?',
          options: ['They are decorative', 'They have different uses', 'They create energy', 'They stop gravity'],
          correct: 1,
          explanation: 'They are used in different applications.'
        }
      ]
    },

    {
      id: 49,
      domain: 'D2',
      difficulty: 'Easy',
      text: 'The moon orbits Earth and reflects sunlight. It does not produce its own light. Its appearance changes during phases.',
      questions: [
        {
          question: 'What does the moon do?',
          options: ['Produces light', 'Creates heat', 'Orbits Earth', 'Stops tides'],
          correct: 2,
          explanation: 'The moon orbits Earth.'
        },
        {
          question: 'Where does moonlight come from?',
          options: ['Moon itself', 'Earth', 'Stars', 'Sunlight reflection'],
          correct: 3,
          explanation: 'It reflects sunlight.'
        },
        {
          question: 'What changes over time?',
          options: ['Moon phases', 'Moon’s size', 'Gravity', 'Orbit speed'],
          correct: 0,
          explanation: 'The moon appears to change phases.'
        }
      ]
    },

    {
      id: 50,
      domain: 'D2',
      difficulty: 'Hard',
      text: 'Artificial intelligence systems learn from data to make predictions. However, they may inherit biases present in the training data.',
      questions: [
        {
          question: 'How does AI learn?',
          options: ['Random guessing', 'From data', 'From emotions', 'From humans only'],
          correct: 1,
          explanation: 'AI learns from data.'
        },
        {
          question: 'What can AI inherit?',
          options: ['Weather patterns', 'Gravity', 'Biases', 'Memory loss'],
          correct: 2,
          explanation: 'It can inherit biases from data.'
        },
        {
          question: 'What is a limitation?',
          options: ['Perfect accuracy', 'No predictions', 'No data usage', 'Bias in output'],
          correct: 3,
          explanation: 'Bias can affect outputs.'
        }
      ]
    }
  
];

const TIMER_DURATION = 45;
const BASE_WPM = 100;

export default function SpeedReadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;

  // Game phase: 'reading' | 'questions' | 'paused' | 'results'
  const [gameState, setGameState] = useState<'reading' | 'questions' | 'paused' | 'results'>('reading');
  const [prevGameState, setPrevGameState] = useState<'reading' | 'questions'>('reading');

  // Passage
  const [passageIndex, setPassageIndex] = useState(() => Math.floor(Math.random() * PASSAGES.length));
  const passage = PASSAGES[passageIndex] || PASSAGES[0];
  const words = passage.text.split(' ');

  // Reading state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wpm, setWpm] = useState(BASE_WPM);
  const [readingComplete, setReadingComplete] = useState(false);
  const wordTimerRef = useRef<any>(null);

  // Questions state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Score / lives / timer
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Animations
  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const wordFadeAnim = useRef(new Animated.Value(1)).current;
  const planeAnim = useRef(new Animated.Value(width * 0.2)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  // ─── GLOBAL TIMER ────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'reading' && gameState !== 'questions') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // ─── WORD FLASHER ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'reading') {
      clearInterval(wordTimerRef.current);
      return;
    }
    const interval = Math.round((60 / wpm) * 1000);
    wordTimerRef.current = setInterval(() => {
      setCurrentWordIndex(i => {
        const next = i + 1;
        if (next >= words.length) {
          clearInterval(wordTimerRef.current);
          setReadingComplete(true);
          return i;
        }
        // Flash word animation
        Animated.sequence([
          Animated.timing(wordFadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
          Animated.timing(wordFadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        return next;
      });
    }, interval);
    return () => clearInterval(wordTimerRef.current);
  }, [gameState, wpm]);

  // Animate plane position based on WPM
  useEffect(() => {
    const targetX = Math.min(width * 0.75, width * 0.2 + ((wpm - 80) / 120) * (width * 0.55));
    Animated.timing(planeAnim, { toValue: targetX, duration: 600, useNativeDriver: true }).start();
  }, [wpm]);

  // Auto-advance to questions when reading is done
  useEffect(() => {
    if (readingComplete && gameState === 'reading') {
      setTimeout(() => {
        setGameState('questions');

        setQuestionIndex(0);
        setAnswered(false);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
      }, 500);
    }
  }, [readingComplete]);

  function endGame() {
    clearInterval(timerRef.current);
    clearInterval(wordTimerRef.current);
    setGameState('results');
  }

  function goToNextPassage() {
    const nextIndex = passageIndex + 1;

    if (nextIndex >= PASSAGES.length) {
      endGame();
      return;
    }

    setPassageIndex(nextIndex);

    setCurrentWordIndex(0);
    setReadingComplete(false);

    setQuestionIndex(0);
    setAnswered(false);
    setSelectedAnswer(null);

    setWpm(w => Math.min(w + 15, 300));

    setGameState('reading');
  }

  // ─── ANSWER HANDLER ───────────────────────────────────────────────────────
  function handleAnswer(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);

    const q = passage.questions[questionIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 6;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((6 - timeTaken) * 2)) : 0;
    const isCorrect = index === q.correct;
    playTapSound();
    if (isCorrect) playCorrectSound();
    else playWrongSound();
    let pts = 0;

    if (isCorrect) {
      pts = 8 + speedBonus;
      if (isSpeedy) setSpeedyCount(s => s + 1);
      setScore(s => s + pts);
      setWpm(w => Math.min(w + 20, 300));
      showFloatingScore(`+${pts}${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
    } else {
      setLives(l => {
        const n = l - 1;
        if (n <= 0) setTimeout(() => endGame(), 1500);
        return n;
      });
      setWpm(w => Math.max(w - 15, 60));
      shakeScreen();
    }

    setAnswers(prev => [...prev, {
      question: q.question,
      userAnswer: q.options[index],
      correctAnswer: q.options[q.correct],
      isCorrect, isSpeedy, pts,
      explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);

    setTimeout(() => {
      const isLastQuestion =
        questionIndex + 1 >= passage.questions.length;

      // 🔥 PASSAGE COMPLETE → NEXT PASSAGE
      if (isLastQuestion) {
        goToNextPassage();
        return;
      }

      if (lives <= 1 && !isCorrect) {
        endGame();
        return;
      }

      setQuestionIndex(qi => qi + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    }, 1600);
  }

  function shakeScreen() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function showFloatingScore(text: string) {
    setFloatingScore(text);
    scoreAnim.setValue(0);
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: -40, duration: 600, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: -80, duration: 400, useNativeDriver: true }),
    ]).start(() => { setFloatingScore(null); scoreAnim.setValue(0); });
  }

  function togglePause() {
    if (gameState === 'reading' || gameState === 'questions') {
      clearInterval(timerRef.current);
      clearInterval(wordTimerRef.current);
      setPrevGameState(gameState as 'reading' | 'questions');
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState(prevGameState);
    }
  }

  function restartGame() {
    clearInterval(timerRef.current);
    clearInterval(wordTimerRef.current);
    setCurrentWordIndex(0);
    setWpm(BASE_WPM);
    setReadingComplete(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setQuestionsAnswered(0);
    setLives(3);
    setScore(0);
    setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0);
    setQuestionStartTime(Date.now());
    setGameState('reading');
  }

  const finalScore = questionsAnswered > 0
    ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100)
    : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';
  const progressPct = currentWordIndex / (words.length - 1);

  // ─── RESULTS SCREEN ───────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(6, finalScore, xpEarned, 'rw_d2', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review ⚡</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                Your answer: {a.userAnswer} {a.isCorrect ? '✅' : '❌'}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>✅ Correct: {a.correctAnswer}</Text>}
              <Text style={styles.reviewExplanation}>💡 {a.explanation}</Text>
              {a.isSpeedy && <Text style={styles.reviewSpeedy}>⚡ Speedy bonus!</Text>}
            </View>
          ))}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{correctCount}/{questionsAnswered}</Text>
                <Text style={styles.perfLabel}>Correct</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{speedyCount}</Text>
                <Text style={styles.perfLabel}>⚡ Speedy</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{lives < 0 ? 0 : lives}</Text>
                <Text style={styles.perfLabel}>❤️ Lives Left</Text>
              </View>
            </View>
          </View>
          <View style={styles.xpCard}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <Text style={styles.xpScore}>{finalScore}</Text>
            <Text style={styles.xpSub}>Score out of 100</Text>
            <Text style={styles.xpGained}>+{xpEarned} XP added to Speed Read</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📈 Your History</Text>
            <Text style={styles.historySub}>Play more games to see your score history!</Text>
            <Text style={styles.historyRank}>Game #1 — Score: {finalScore}</Text>
          </View>
          {isDailyChallenge ? (
            <>
              {!isLastGame && (
                <TouchableOpacity style={styles.continueBtn} onPress={() => {
                  const nextId = dailyGames[currentIndex + 1];
                  const routes: Record<number,string> = {1:'/wordduel',2:'/flipit',3:'/errorhunt',4:'/polishup',5:'/bridgeit',6:'/speedread',7:'/deepdive',8:'/tonecraft',9:'/shapesnap',10:'/formulaforge',11:'/graphmatch',12:'/datadash',13:'/rapidfire',14:'/storysolve',15:'/mathmemory',16:'/chainreaction'};
                  router.replace({ pathname: routes[nextId] as any, params: { isDailyChallenge: '1', dailyGames: dailyGames.join(','), currentIndex: String(currentIndex + 1) } });
                }}>
                  <Text style={styles.continueBtnText}>Next Challenge ({currentIndex + 2}/4) →</Text>
                </TouchableOpacity>
              )}
              {isLastGame && (
                <TouchableOpacity style={styles.continueBtn} onPress={() => {
                  router.replace({ pathname: '/dailycomplete' as any, params: { dailyGames: dailyGames.join(','), scores: '' } });
                }}>
                  <Text style={styles.continueBtnText}>See Results 🏆</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.quitBtn} onPress={() => router.replace('/(tabs)' as any)}>
                <Text style={styles.quitBtnText}>← Back to Home</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.continueBtn} onPress={restartGame}>
                <Text style={styles.continueBtnText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quitBtn} onPress={() => router.back()}>
                <Text style={styles.quitBtnText}>← Back to Games</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = passage.questions[questionIndex];

  // ─── MAIN GAME SCREEN ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* ── HEADER ── */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>⚡ Speed Read</Text>
            <Text style={styles.gameSubtitle}>D2 · Information & Ideas</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{score}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
          </View>
        </View>

        {/* Floating Score */}
        {floatingScore && (
          <Animated.Text style={[styles.floatingScore, { transform: [{ translateY: scoreAnim }] }]}>
            {floatingScore}
          </Animated.Text>
        )}

        {/* ── STATUS ROW ── */}
        <View style={styles.statusRow}>
          <View style={styles.livesRow}>
            {[1, 2, 3].map(i => (
              <Text key={i} style={styles.heart}>{i <= lives ? '❤️' : '🖤'}</Text>
            ))}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
            </View>
          </View>
          <View style={styles.wpmBadge}>
            <Text style={styles.wpmNum}>{wpm}</Text>
            <Text style={styles.wpmLabel}>WPM</Text>
          </View>
        </View>

        {/* ── READING PHASE ── */}
        {(gameState === 'reading' || (gameState === 'paused' && prevGameState === 'reading')) && (
          <View style={styles.readingContainer}>

            {/* Sky + Clouds + Plane */}
            <View style={styles.skyBox}>
              {/* Cloud layers */}
              <Text style={[styles.cloud, { top: 18, left: '8%' }]}>☁️</Text>
              <Text style={[styles.cloud, { top: 8, left: '45%', fontSize: 28 }]}>☁️</Text>
              <Text style={[styles.cloud, { top: 22, left: '70%', fontSize: 20 }]}>☁️</Text>
              <Text style={[styles.cloud, { top: 38, left: '25%', fontSize: 16 }]}>☁️</Text>

              {/* Plane */}
              <Animated.Text style={[styles.plane, { transform: [{ translateX: planeAnim }] }]}>
                ✈️
              </Animated.Text>

              {/* WPM speed label */}
              <Text style={styles.wpmOverlay}>
                {wpm < 120 ? 'Cruising...' : wpm < 180 ? 'Speeding up! 🚀' : 'Blazing fast! 🔥'}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct * 100}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>
              Word {currentWordIndex + 1} of {words.length}
            </Text>

            {/* Flash Word */}
            <View style={styles.wordStage}>
              <Animated.Text style={[styles.flashWord, { opacity: wordFadeAnim }]}>
                {words[currentWordIndex]}
              </Animated.Text>
              {readingComplete && (
                <Text style={styles.readDone}>✅ Passage complete! Loading questions...</Text>
              )}
            </View>

            {/* Passage title */}
            <View style={styles.passageMeta}>
              <Text style={styles.passageMetaText}>📄 {passage.title || 'Reading Passage'}</Text>
              <Text style={styles.passageMetaDomain}>{passage.domain} · {passage.difficulty}</Text>
            </View>
          </View>
        )}

        {/* ── QUESTIONS PHASE ── */}
        {(gameState === 'questions' || (gameState === 'paused' && prevGameState === 'questions')) && (
          <ScrollView style={styles.questionsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.qPhaseHeader}>
              <Text style={styles.qPhaseTitle}>📝 Comprehension</Text>
              <Text style={styles.qPhaseSub}>Question {questionIndex + 1} of {passage.questions.length}</Text>
            </View>

            <View style={styles.questionBox}>
              <Text style={styles.questionText}>{q.question}</Text>
            </View>

            <View style={styles.optionsGrid}>
              {q.options.map((option, index) => {
                let bgColor = '#16253B';
                let borderColor = '#2A3F5F';
                let textColor = '#E2E8F0';
                let letterBg = '#1E3A5F';
                if (answered) {
                  if (index === q.correct) {
                    bgColor = '#10B98125'; borderColor = '#10B981'; textColor = '#10B981'; letterBg = '#10B981';
                  } else if (index === selectedAnswer) {
                    bgColor = '#EF444425'; borderColor = '#EF4444'; textColor = '#EF4444'; letterBg = '#EF4444';
                  }
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionPill, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => handleAnswer(index)}
                    disabled={answered}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionLetterBox, { backgroundColor: letterBg }]}>
                      <Text style={styles.optionLetter}>{['A', 'B', 'C', 'D'][index]}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

      </Animated.View>

      {/* ── PAUSE OVERLAY ── */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>⏸ Paused</Text>
            <Text style={styles.pauseSub}>Score: {score} pts · {wpm} WPM</Text>
            <TouchableOpacity style={styles.pauseOption} onPress={togglePause}>
              <Text style={styles.pauseOptionText}>▶️ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseOption} onPress={restartGame}>
              <Text style={styles.pauseOptionText}>🔄 Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pauseOption, styles.pauseQuit]} onPress={async () => {
              if (isDailyChallenge) {
                const today = new Date().toISOString().split('T')[0];
                const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
                await AsyncStorage.setItem(`daily_played_${today}_${dailyGames[currentIndex]}`, '1');
                router.replace('/(tabs)' as any);
              } else {
                router.back();
              }
            }}>
              <Text style={styles.pauseQuitText}>🚪 Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A1E3D' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#0A1E3D' },

  // Header
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20, gap: 12,
  },
  pauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#122845', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#1E4070',
  },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#38BDF8', fontWeight: '700' },
  scoreBox: {
    backgroundColor: '#F9731620', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#F97316',
  },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F97316' },
  scoreLabel: { fontSize: 10, color: '#F97316', fontWeight: '600' },
  floatingScore: {
    position: 'absolute', right: 24, top: 110,
    fontSize: 24, fontWeight: '900', color: '#10B981', zIndex: 100,
  },

  // Status Row
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#122845', borderRadius: 16, padding: 12,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 10 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#1E3A5F', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  wpmBadge: {
    backgroundColor: '#38BDF820', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
    borderWidth: 1, borderColor: '#38BDF8',
  },
  wpmNum: { fontSize: 18, fontWeight: '900', color: '#38BDF8' },
  wpmLabel: { fontSize: 10, color: '#38BDF8', fontWeight: '700' },

  // Reading Phase
  readingContainer: { flex: 1, paddingHorizontal: 20 },
  skyBox: {
    height: 100, backgroundColor: '#0D2A4A', borderRadius: 20,
    marginBottom: 14, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: '#1E4070',
  },
  cloud: { position: 'absolute', fontSize: 24, opacity: 0.7 },
  plane: { position: 'absolute', bottom: 18, fontSize: 32 },
  wpmOverlay: {
    position: 'absolute', bottom: 6, left: 0, right: 0,
    textAlign: 'center', fontSize: 12, color: '#38BDF8', fontWeight: '700',
  },
  progressBarBg: {
    height: 8, backgroundColor: '#122845', borderRadius: 4,
    overflow: 'hidden', marginBottom: 6,
  },
  progressBarFill: {
    height: 8, backgroundColor: '#38BDF8', borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12, color: '#38BDF8', fontWeight: '600',
    textAlign: 'right', marginBottom: 16,
  },
  wordStage: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    minHeight: 180,
  },
  flashWord: {
    fontSize: 56, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', letterSpacing: 2,
    textShadowColor: '#38BDF880',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  readDone: {
    fontSize: 16, color: '#10B981', fontWeight: '700',
    marginTop: 20, textAlign: 'center',
  },
  passageMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#122845', borderRadius: 14,
    padding: 12, marginTop: 16, marginBottom: 20,
  },
  passageMetaText: { fontSize: 13, color: '#E2E8F0', fontWeight: '600' },
  passageMetaDomain: { fontSize: 13, color: '#38BDF8', fontWeight: '700' },

  // Questions Phase
  questionsContainer: { flex: 1, paddingHorizontal: 20 },
  qPhaseHeader: {
    backgroundColor: '#38BDF815', borderRadius: 16,
    padding: 16, marginBottom: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#38BDF830',
  },
  qPhaseTitle: { fontSize: 20, fontWeight: '800', color: '#38BDF8' },
  qPhaseSub: { fontSize: 14, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
  questionBox: {
    backgroundColor: '#122845', borderRadius: 18,
    padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E4070',
  },
  questionText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', lineHeight: 26 },
  optionsGrid: { gap: 12, paddingBottom: 30 },
  optionPill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 50, padding: 16, borderWidth: 2, gap: 14,
  },
  optionLetterBox: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', lineHeight: 22 },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: {
    backgroundColor: '#122845', borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
  },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: {
    backgroundColor: '#122845', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E4070',
  },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: {
    flex: 1, backgroundColor: '#0A1E3D',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#38BDF8' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: {
    backgroundColor: '#F9731615', borderRadius: 20,
    padding: 24, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#F97316',
  },
  xpTitle: { fontSize: 16, color: '#F97316', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#F97316', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: {
    backgroundColor: '#122845', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E4070',
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#38BDF8', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#38BDF8', borderRadius: 50,
    padding: 18, alignItems: 'center', marginVertical: 20,
  },
  continueBtnText: { color: '#0A1E3D', fontSize: 17, fontWeight: '900' },
  quitBtn: {
    backgroundColor: 'transparent', borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 30,
    borderWidth: 2, borderColor: '#1E4070',
  },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },

  // Pause
  pauseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center',
  },
  pauseCard: {
    backgroundColor: '#122845', borderRadius: 24,
    padding: 32, width: '82%', alignItems: 'center',
    borderWidth: 1, borderColor: '#1E4070',
  },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: {
    width: '100%', padding: 16, borderRadius: 50,
    backgroundColor: '#38BDF8', alignItems: 'center', marginBottom: 12,
  },
  pauseOptionText: { color: '#0A1E3D', fontSize: 16, fontWeight: '800' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});