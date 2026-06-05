import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const QUESTIONS = [
  { id: 1, domain: 'D1', difficulty: 'Easy', passage: 'The scientist\'s findings were considered ephemeral by her peers, lasting only a brief moment in the public consciousness before being forgotten entirely.', question: 'As used in the passage, "ephemeral" most nearly means:', options: ['Short-lived', 'Permanent', 'Controversial', 'Groundbreaking'], correct: 0, explanation: 'Ephemeral means lasting for a very short time. The passage confirms this with "lasting only a brief moment."' },
  { id: 2, domain: 'D1', difficulty: 'Easy', passage: 'Despite his reputation for being austere, the professor surprised his students with an unexpectedly warm and generous celebration at the end of the semester.', question: 'As used in the passage, "austere" most nearly means:', options: ['Wealthy', 'Strict and severe', 'Cheerful', 'Forgetful'], correct: 1, explanation: 'Austere means strict or severe. The contrast with "warm and generous" confirms this.' },
  { id: 3, domain: 'D1', difficulty: 'Easy', passage: 'The politician\'s speech was filled with ambiguous statements that could be interpreted in multiple ways, leaving voters uncertain about her actual position.', question: 'As used in the passage, "ambiguous" most nearly means:', options: ['Clear and direct', 'Dishonest', 'Open to multiple interpretations', 'Passionate'], correct: 2, explanation: 'Ambiguous means open to more than one interpretation. The passage states "interpreted in multiple ways."' },
  { id: 4, domain: 'D1', difficulty: 'Easy', passage: 'The new policy was designed to mitigate the effects of climate change by reducing carbon emissions from industrial sources across the country.', question: 'As used in the passage, "mitigate" most nearly means:', options: ['Worsen', 'Ignore', 'Celebrate', 'Lessen'], correct: 3, explanation: 'Mitigate means to make less severe. Reducing emissions lessens climate change effects.' },
  { id: 5, domain: 'D1', difficulty: 'Easy', passage: 'Her pragmatic approach to problem-solving meant she focused on practical solutions rather than ideal ones, even if they were imperfect.', question: 'As used in the passage, "pragmatic" most nearly means:', options: ['Practical', 'Idealistic', 'Emotional', 'Theoretical'], correct: 0, explanation: 'Pragmatic means dealing with things sensibly and practically. The passage confirms "practical solutions."' },
  { id: 6, domain: 'D1', difficulty: 'Easy', passage: 'The community center served as a nexus for local organizations, connecting dozens of groups that might otherwise have had no contact with one another.', question: 'As used in the passage, "nexus" most nearly means:', options: ['Barrier', 'Central connection point', 'Funding source', 'Meeting schedule'], correct: 1, explanation: 'Nexus means a connection or series of connections linking things. "Connecting dozens of groups" confirms this.' },
  { id: 7, domain: 'D1', difficulty: 'Easy', passage: 'The documentary took a candid look at poverty in urban areas, presenting unfiltered, honest images without any attempt to soften the reality.', question: 'As used in the passage, "candid" most nearly means:', options: ['Biased', 'Artistic', 'Honest and direct', 'Dramatic'], correct: 2, explanation: 'Candid means truthful and straightforward. "Unfiltered, honest images" confirms this meaning.' },
  { id: 8, domain: 'D1', difficulty: 'Medium', passage: 'The author\'s prose was lauded for its pellucid quality -- each sentence so clear and transparent that even complex philosophical ideas became accessible to general readers.', question: 'As used in the passage, "pellucid" most nearly means:', options: ['Obscure', 'Overly simple', 'Poetic', 'Brilliantly clear'], correct: 3, explanation: 'Pellucid means translucently clear. The passage confirms this with "clear and transparent."' },
  { id: 9, domain: 'D1', difficulty: 'Medium', passage: 'The engineer proposed an ingenious solution to the water shortage: collecting rainwater from rooftops and redirecting it into underground storage tanks.', question: 'As used in the passage, "ingenious" most nearly means:', options: ['Clever and inventive', 'Expensive', 'Complicated', 'Risky'], correct: 0, explanation: 'Ingenious means clever, original, and inventive. The novel rainwater solution demonstrates this quality.' },
  { id: 10, domain: 'D1', difficulty: 'Medium', passage: 'The general\'s tactics were considered audacious by military historians -- bold moves that most commanders would have considered far too risky to attempt.', question: 'As used in the passage, "audacious" most nearly means:', options: ['Foolish', 'Daring and bold', 'Cautious', 'Secretive'], correct: 1, explanation: 'Audacious means showing a willingness to take bold risks. "Bold moves" and "too risky" confirm this.' },
  { id: 11, domain: 'D1', difficulty: 'Medium', passage: 'Despite centuries of scholarly debate, the origin of the ancient manuscript remains enigmatic, with no consensus about where, when, or by whom it was written.', question: 'As used in the passage, "enigmatic" most nearly means:', options: ['Well-documented', 'Irrelevant', 'Mysterious', 'Controversial'], correct: 2, explanation: 'Enigmatic means mysterious or difficult to interpret. The lack of consensus about its origins confirms this.' },
  { id: 12, domain: 'D1', difficulty: 'Medium', passage: 'The CEO\'s verbose presentation frustrated the board, who had requested a concise summary but instead received a three-hour lecture filled with unnecessary details.', question: 'As used in the passage, "verbose" most nearly means:', options: ['Clear', 'Technical', 'Persuasive', 'Using too many words'], correct: 3, explanation: 'Verbose means using more words than necessary. The contrast with "concise summary" and the three-hour lecture confirm this.' },
  { id: 13, domain: 'D1', difficulty: 'Medium', passage: 'The young artist\'s work showed remarkable perspicacity -- an ability to see through surface appearances and identify the deeper emotional truths hidden within everyday scenes.', question: 'As used in the passage, "perspicacity" most nearly means:', options: ['Keen insight', 'Creativity', 'Technical skill', 'Ambition'], correct: 0, explanation: 'Perspicacity means having a ready insight into things. The ability to see deeper truths demonstrates this quality.' },
  { id: 14, domain: 'D1', difficulty: 'Medium', passage: 'The philanthropist\'s munificent donation of ten million dollars allowed the museum to expand its collection and offer free admission to all visitors.', question: 'As used in the passage, "munificent" most nearly means:', options: ['Reluctant', 'Surprisingly large and generous', 'Anonymous', 'Conditional'], correct: 1, explanation: 'Munificent means larger or more generous than is usual or necessary. The ten million dollar donation confirms this.' },
  { id: 15, domain: 'D1', difficulty: 'Hard', passage: 'Critics found the novel\'s ending bathetic, a jarring descent from the lofty emotional heights of the earlier chapters into something disappointingly mundane and predictable.', question: 'As used in the passage, "bathetic" most nearly means:', options: ['Deeply moving', 'Confusing', 'Anticlimactic', 'Violent'], correct: 2, explanation: 'Bathetic means producing an effect of anticlimax. "Disappointing descent from emotional heights" confirms this.' },
  { id: 16, domain: 'D1', difficulty: 'Hard', passage: 'The philosopher\'s argument was built on a series of tendentious claims -- statements that appeared objective but were actually designed to promote a particular political agenda.', question: 'As used in the passage, "tendentious" most nearly means:', options: ['Logical', 'Well-researched', 'Confusing', 'Promoting a particular cause'], correct: 3, explanation: 'Tendentious means expressing a particular point of view. "Designed to promote a particular political agenda" confirms this.' },
  { id: 17, domain: 'D1', difficulty: 'Hard', passage: 'The historian described the treaty as a Pyrrhic victory for the conquering nation -- they had won the territory but at such enormous cost that their empire never fully recovered.', question: 'As used in the passage, "Pyrrhic" most nearly means:', options: ['Won at too great a cost', 'Decisive and total', 'Unexpected', 'Diplomatic'], correct: 0, explanation: 'A Pyrrhic victory is one won at too great a cost. The empire never recovering despite winning confirms this.' },
  { id: 18, domain: 'D1', difficulty: 'Hard', passage: 'The scientist\'s theory was considered heterodox by her colleagues, who felt it challenged too many of the field\'s most fundamental and long-accepted assumptions.', question: 'As used in the passage, "heterodox" most nearly means:', options: ['Widely accepted', 'Departing from accepted beliefs', 'Experimental', 'Poorly supported'], correct: 1, explanation: 'Heterodox means not conforming to accepted beliefs. Challenging fundamental assumptions confirms this.' },
  { id: 19, domain: 'D2', difficulty: 'Easy', passage: 'Urban planners argue that green spaces in cities are not merely aesthetic luxuries but essential infrastructure that improves air quality, reduces urban heat, and supports mental health.', question: 'Which statement best describes the author\'s main claim?', options: ['Green spaces make cities look prettier', 'Urban planners disagree about green spaces', 'Green spaces are necessary urban infrastructure with multiple benefits', 'Mental health is the most important benefit of green spaces'], correct: 2, explanation: 'The main claim is that green spaces are essential infrastructure, not just aesthetic. Multiple functional benefits are listed.' },
  { id: 20, domain: 'D2', difficulty: 'Easy', passage: 'Sleep deprivation affects cognitive performance more than most people realize. Studies show that going 17 hours without sleep produces impairment equivalent to a blood alcohol level of 0.05%.', question: 'What is the primary purpose of this passage?', options: ['To argue that alcohol is dangerous', 'To recommend a sleep schedule', 'To criticize people who stay up late', 'To demonstrate the cognitive effects of sleep deprivation with evidence'], correct: 3, explanation: 'The passage uses a comparison to alcohol impairment to demonstrate how serious sleep deprivation is for cognitive function.' },
  { id: 21, domain: 'D2', difficulty: 'Medium', passage: 'While many assume that multitasking increases productivity, research consistently shows the opposite. Studies indicate that switching between tasks reduces efficiency by up to 40%, as the brain requires time to refocus after each transition.', question: 'What evidence does the author use to support the claim about multitasking?', options: ['Studies showing up to 40% efficiency reduction', 'Personal anecdotes about productivity', 'Expert opinions from business leaders', 'Historical examples of successful multitaskers'], correct: 0, explanation: 'The author cites specific research showing a 40% efficiency reduction, which directly supports the claim against multitasking.' },
  { id: 22, domain: 'D2', difficulty: 'Medium', passage: 'The Columbian Exchange fundamentally transformed global diets. Tomatoes, originally from the Americas, became central to Italian cuisine. Potatoes revolutionized food security in Ireland and Northern Europe. Meanwhile, horses introduced to the Americas transformed the cultures of many Indigenous peoples.', question: 'What is the central idea of this passage?', options: ['Italian food originated in America', 'The Columbian Exchange caused widespread cultural transformation through new foods and animals', 'Potatoes prevented famine in Europe', 'Horses are more important than plants'], correct: 1, explanation: 'The passage shows multiple examples of how the exchange of plants and animals between continents transformed cultures globally.' },
  { id: 23, domain: 'D2', difficulty: 'Hard', passage: 'The Renaissance was not simply a rebirth of classical antiquity but a complex negotiation between inherited traditions and emerging empirical methods. Scholars who once relied solely on ancient texts began demanding observable evidence, a shift that would eventually give rise to the scientific revolution.', question: 'What inference can best be drawn from this passage?', options: ['Renaissance scholars rejected all ancient knowledge', 'The scientific revolution preceded the Renaissance', 'The Renaissance created conditions that enabled the scientific revolution', 'Ancient texts were proven wrong during the Renaissance'], correct: 2, explanation: 'The shift toward demanding observable evidence during the Renaissance implies this mindset eventually led to the scientific revolution.' },
  { id: 24, domain: 'D2', difficulty: 'Hard', passage: 'Proponents of universal basic income argue that automation will eliminate millions of jobs within the next two decades. Critics counter that new technologies historically create more jobs than they destroy. Both sides, however, acknowledge that the transition period may cause significant economic disruption regardless of the long-term outcome.', question: 'Which statement would both proponents and critics of universal basic income agree with?', options: ['Automation will definitely eliminate jobs permanently', 'Universal basic income is the best solution to automation', 'New technologies always create more jobs than they destroy', 'The transition to automated economies may cause economic disruption'], correct: 3, explanation: 'The passage explicitly states both sides acknowledge the transition period may cause disruption, making this the point of agreement.' },
  { id: 25, domain: 'D3', difficulty: 'Easy', passage: 'The committee members each expressed their unique opinions about the proposal during the meeting yesterday afternoon.', question: 'Which revision best improves the sentence by eliminating redundancy?', options: ['The committee members expressed their opinions about the proposal.', 'The committee members each expressed their own individual unique opinions about the proposal.', 'Each of the committee members uniquely and individually expressed opinions.', 'The members of the committee each gave their own unique personal opinions.'], correct: 0, explanation: '"Each" and "unique" are redundant. The clearest version simply says "expressed their opinions."' },
  { id: 26, domain: 'D3', difficulty: 'Easy', passage: 'Neither the coach nor the players was prepared for the sudden change in weather conditions during the championship game.', question: 'Which correction best fixes the grammatical error?', options: ['Neither the coach nor the players is prepared', 'Neither the coach nor the players were prepared', 'Neither the coach or the players was prepared', 'No change needed'], correct: 1, explanation: 'With "neither/nor," the verb agrees with the closest subject. "Players" is plural, so the verb should be "were."' },
  { id: 27, domain: 'D3', difficulty: 'Easy', passage: 'The students who studied consistently throughout the semester performed significantly better on their final exams.', question: 'Which of the following is grammatically correct and maintains the same meaning?', options: ['The students, who studied consistently throughout the semester, performed significantly better on their final exams.', 'The students who studied consistently throughout the semester, they performed significantly better on their final exams.', 'The students who studied consistently throughout the semester and performed significantly better on their final exams.', 'No change needed'], correct: 3, explanation: 'The original sentence is grammatically correct. The restrictive clause "who studied consistently" correctly identifies which students.' },
  { id: 28, domain: 'D3', difficulty: 'Medium', passage: 'Running through the park, the flowers seemed to bloom more brilliantly in the morning light.', question: 'Which revision corrects the dangling modifier?', options: ['Running through the park, I noticed the flowers seemed to bloom more brilliantly.', 'The flowers, running through the park, seemed to bloom more brilliantly.', 'Running through the park; the flowers seemed to bloom more brilliantly.', 'No change needed'], correct: 0, explanation: 'The original implies flowers were running. Adding "I" gives the participial phrase a logical subject.' },
  { id: 29, domain: 'D3', difficulty: 'Medium', passage: 'The research team has been working on this project since three years and have made considerable progress in developing a viable solution.', question: 'Which revision corrects the error?', options: ['The research team have been working on this project since three years and has made considerable progress.', 'The research team has been working on this project for three years and has made considerable progress.', 'The research team has been working on this project since three years and has made considerable progress.', 'No change needed'], correct: 1, explanation: '"Since" is used with specific points in time. "For" is used with durations. Also, "team" as a collective noun takes singular "has."' },
  { id: 30, domain: 'D3', difficulty: 'Medium', passage: 'The new regulations require companies to report their emissions annually, reduce waste by 20%, and the implementation of renewable energy sources.', question: 'Which revision corrects the parallel structure error?', options: ['The new regulations require companies to report their emissions annually, reducing waste by 20%, and the implementation of renewable energy sources.', 'The new regulations require companies reporting their emissions annually, reducing waste by 20%, and implementing renewable energy sources.', 'The new regulations require companies to report their emissions annually, reduce waste by 20%, and implement renewable energy sources.', 'No change needed'], correct: 2, explanation: 'Parallel structure requires all items in a series to use the same grammatical form: "to report, reduce, and implement."' },
  { id: 31, domain: 'D3', difficulty: 'Hard', passage: 'Each of the proposed solutions have their own advantages and disadvantages that must be carefully weighed before the committee makes their final decision.', question: 'Which revision corrects ALL grammatical errors in this sentence?', options: ['Each of the proposed solutions have its own advantages and disadvantages that must be carefully weighed before the committee makes its final decision.', 'Each of the proposed solutions has their own advantages and disadvantages that must be carefully weighed before the committee makes their final decision.', 'Each of the proposed solutions has its own advantages and disadvantages that must be carefully weighed before the committee makes its final decision.', 'No change needed'], correct: 2, explanation: '"Each" is singular and takes "has" and "its." "Committee" as a collective noun acting as a unit takes "its."' },
  { id: 32, domain: 'D3', difficulty: 'Hard', passage: 'The professor, along with several of her graduate students, are presenting their research at the international conference next month in Vienna.', question: 'Which correction fixes the subject-verb agreement error?', options: ['The professor, along with several of her graduate students, is presenting their research at the international conference next month.', 'The professor, along with several of her graduate students, is presenting her research at the international conference next month.', 'The professor, along with several of her graduate students, are presenting her research at the international conference next month.', 'No change needed'], correct: 0, explanation: '"Along with" does not make a compound subject. "Professor" is singular, so the verb should be "is." "Their" correctly refers to the group\'s shared research.' },
  { id: 33, domain: 'D4', difficulty: 'Easy', passage: 'Scientists have made remarkable discoveries about deep-sea creatures. _______, much of the ocean floor remains unexplored.', question: 'Which transition best connects these two ideas?', options: ['Therefore', 'Nevertheless', 'Similarly', 'Specifically'], correct: 1, explanation: '"Nevertheless" signals a contrast -- despite discoveries, much remains unexplored. The others don\'t fit the contrasting relationship.' },
  { id: 34, domain: 'D4', difficulty: 'Easy', passage: 'The study found that exercise improves mood. _______, participants who exercised regularly reported lower levels of anxiety and depression.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Specifically', 'Despite this'], correct: 2, explanation: '"Specifically" introduces a specific example or detail supporting the previous statement about exercise improving mood.' },
  { id: 35, domain: 'D4', difficulty: 'Easy', passage: 'Maria had studied for weeks. _______, she felt confident walking into the exam room.', question: 'Which transition best connects these sentences?', options: ['Nevertheless', 'In contrast', 'For example', 'As a result'], correct: 3, explanation: '"As a result" shows cause and effect -- studying led to confidence. This is a logical cause-and-effect relationship.' },
  { id: 36, domain: 'D4', difficulty: 'Medium', passage: 'The report concluded that remote work increased employee satisfaction by 35%. It also found that productivity rose in most departments. _______, the company decided to make remote work permanent.', question: 'Which transition best fits here?', options: ['Based on these findings', 'However', 'In contrast', 'Despite this'], correct: 0, explanation: '"Based on these findings" logically connects research results to the company\'s decision. Other options suggest contrast.' },
  { id: 37, domain: 'D4', difficulty: 'Medium', passage: 'Early humans lived in small nomadic groups that followed seasonal food sources. Agriculture changed everything. _______ settling in permanent locations, humans could store food, support larger populations, and develop specialized roles.', question: 'Which transition best fits here?', options: ['Instead of', 'By', 'Despite', 'Although'], correct: 1, explanation: '"By" introduces how something is accomplished -- settling in permanent locations was the mechanism that enabled food storage and population growth.' },
  { id: 38, domain: 'D4', difficulty: 'Medium', passage: 'The new medication showed promising results in laboratory studies. _______, clinical trials involving human patients revealed several unexpected and serious side effects.', question: 'Which transition best fits here?', options: ['Furthermore', 'Similarly', 'However', 'Therefore'], correct: 2, explanation: '"However" signals a contrast or complication -- the promising lab results were contradicted by the clinical trial findings.' },
  { id: 39, domain: 'D4', difficulty: 'Hard', passage: 'The ancient Silk Road connected civilizations across thousands of miles. _______ facilitating trade in goods like silk and spices, it served as a conduit for the exchange of ideas, religions, and technologies that fundamentally shaped the medieval world.', question: 'Which transition best fits here?', options: ['Instead of', 'Despite', 'Because of', 'Beyond merely'], correct: 3, explanation: '"Beyond merely" signals that the author is expanding on what was already stated -- the Silk Road did more than just facilitate trade.' },
  { id: 40, domain: 'D4', difficulty: 'Hard', passage: 'Renewable energy sources like solar and wind power have become significantly cheaper over the past decade. _______, the transition away from fossil fuels has been slower than many climate scientists recommend, due largely to political and economic factors that resist rapid change.', question: 'Which transition best fits here?', options: ['Nevertheless', 'As a result', 'Consequently', 'Furthermore'], correct: 0, explanation: '"Nevertheless" introduces a concession -- despite cheaper renewables, the transition has been slow. This is a contrast, not a consequence.' },
  { id: 41, domain: 'D1', difficulty: 'Medium', passage: 'The novel\'s protagonist was a taciturn man who spoke rarely, preferring to communicate through meaningful glances and deliberate silences rather than words.', question: 'As used in the passage, "taciturn" most nearly means:', options: ['Talkative', 'Reserved and uncommunicative', 'Mysterious', 'Thoughtful'], correct: 1, explanation: 'Taciturn means reserved or uncommunicative in speech. "Spoke rarely" directly confirms this.' },
  { id: 42, domain: 'D1', difficulty: 'Medium', passage: 'The journalist\'s report was lauded for its meticulous attention to detail -- every fact checked, every source verified, every claim supported by multiple independent pieces of evidence.', question: 'As used in the passage, "meticulous" most nearly means:', options: ['Biased', 'Lengthy', 'Showing great attention to detail', 'Controversial'], correct: 2, explanation: 'Meticulous means showing great attention to detail and care. The description of thorough fact-checking confirms this.' },
  { id: 43, domain: 'D1', difficulty: 'Hard', passage: 'The economist\'s analysis was considered sanguine by her critics, who felt her optimistic projections failed to account for the volatile and unpredictable nature of global markets.', question: 'As used in the passage, "sanguine" most nearly means:', options: ['Pessimistic', 'Detailed', 'Controversial', 'Overly optimistic'], correct: 3, explanation: 'Sanguine means optimistic, especially in difficult situations. "Optimistic projections" and the contrast with "volatile markets" confirm this.' },
  { id: 44, domain: 'D2', difficulty: 'Medium', passage: 'Coral reefs cover less than 1% of the ocean floor yet support approximately 25% of all marine species. Scientists estimate that reefs provide ecosystem services worth $375 billion annually to millions of people worldwide through fisheries, tourism, and coastal protection.', question: 'What is the main purpose of including the statistic about ecosystem services?', options: ['To quantify the economic importance of coral reefs', 'To show that tourism is the most valuable reef service', 'To argue that 1% of the ocean is more important than the rest', 'To suggest that marine species are economically valuable'], correct: 0, explanation: 'The $375 billion figure quantifies the economic value, supporting the broader argument that coral reefs are disproportionately important.' },
  { id: 45, domain: 'D2', difficulty: 'Hard', passage: 'While democracy promotes individual freedoms, it can paradoxically undermine long-term planning. Elected officials, focused on short electoral cycles, often prioritize immediate gains over necessary but costly long-term investments in infrastructure, education, or climate resilience.', question: 'What is the author\'s main argument?', options: ['Democracy is inferior to other forms of government', 'Democratic electoral systems may create structural obstacles to long-term planning', 'Politicians are generally corrupt and self-interested', 'Infrastructure investment is the most important government priority'], correct: 1, explanation: 'The author argues that the structure of democratic elections -- short cycles focused on immediate gains -- creates obstacles to long-term planning.' },
  { id: 46, domain: 'D3', difficulty: 'Easy', passage: 'The childrens\' books were arranged carefully on the lowest shelves so that young readers could reach them easily without assistance.', question: 'Which correction fixes the apostrophe error?', options: ['The childrens books were arranged carefully on the lowest shelves.', "The children's' books were arranged carefully on the lowest shelves.", "The children's books were arranged carefully on the lowest shelves.", 'No change needed'], correct: 2, explanation: '"Children" is already plural, so the possessive is formed by adding \'s: "children\'s" not "childrens\'."' },
  { id: 47, domain: 'D3', difficulty: 'Medium', passage: 'The board of directors have decided to postpone the merger until market conditions improve, according to the statement released yesterday.', question: 'Which best corrects the subject-verb agreement?', options: ['The board of directors have decides to postpone the merger until market conditions improve.', 'The board of directors had decided to postpone the merger until market conditions improve.', 'The board of directors has decided to postpone the merger until market conditions improve.', 'No change needed'], correct: 2, explanation: '"Board" is a collective noun acting as a single unit, so it takes the singular verb "has decided."' },
  { id: 48, domain: 'D3', difficulty: 'Hard', passage: 'Having completed the experiment, the results were recorded carefully in the laboratory notebook and then submitted to the supervising professor for review.', question: 'Which revision corrects the dangling modifier?', options: ['Having completed the experiment, the researchers recorded the results carefully in the laboratory notebook and submitted them to the supervising professor.', 'Having completed the experiment, the results were carefully recorded in the laboratory notebook and submitted.', 'The results, having completed the experiment, were recorded carefully and then submitted.', 'No change needed'], correct: 0, explanation: 'The original implies the results completed the experiment. Adding "the researchers" gives the modifier a proper subject.' },
  { id: 49, domain: 'D4', difficulty: 'Medium', passage: 'The human brain is remarkably adaptable. _______ this neuroplasticity allows people to recover from strokes, learn new languages in adulthood, and adapt to sensory loss by strengthening other senses.', question: 'Which transition best fits here?', options: ['However,', 'This adaptability, known as neuroplasticity,', 'In contrast,', 'Despite this,'], correct: 2, explanation: 'The second sentence elaborates on the brain\'s adaptability. "This adaptability, known as neuroplasticity," creates a smooth connection and introduces the technical term.' },
  { id: 50, domain: 'D4', difficulty: 'Hard', passage: 'Many historians argue that World War I was the direct cause of World War II. _______, others contend that the seeds of the second conflict were planted decades earlier by colonial competition, nationalism, and industrial rivalry that predated the first war entirely.', question: 'Which transition best fits here?', options: ['Similarly', 'Furthermore', 'In contrast', 'As a result'], correct: 2, explanation: '"In contrast" introduces the opposing scholarly perspective. The two positions presented are contradictory, requiring a contrasting transition.' },

  // ── NEW BATCH ──────────────────────────────────────────────────────────────
  { id: 51, domain: 'D1', difficulty: 'Easy', passage: 'The author's prose was lauded for its lucid style, making complex scientific ideas accessible to general readers.', question: 'As used, "lucid" most nearly means:', options: ['Confusing', 'Lengthy', 'Clear and easy to understand', 'Technical'], correct: 2, explanation: '"Lucid" means clear and intelligible. The clue is "accessible to general readers."' },
  { id: 52, domain: 'D1', difficulty: 'Easy', passage: 'The CEO's decision to restructure the company was seen as pragmatic rather than idealistic, focusing on what could realistically be achieved.', question: 'As used, "pragmatic" most nearly means:', options: ['Unrealistic', 'Practical and realistic', 'Secretive', 'Generous'], correct: 1, explanation: '"Pragmatic" means dealing with things sensibly and realistically.' },
  { id: 53, domain: 'D1', difficulty: 'Easy', passage: 'The new policy was met with widespread derision from critics who considered it poorly conceived and unlikely to succeed.', question: 'As used, "derision" most nearly means:', options: ['Praise', 'Indifference', 'Mockery and contempt', 'Surprise'], correct: 2, explanation: '"Derision" means contemptuous ridicule or mockery.' },
  { id: 54, domain: 'D1', difficulty: 'Medium', passage: 'Unlike his verbose colleagues, the professor was known for his terse responses -- delivering maximum information with minimum words.', question: 'As used, "terse" most nearly means:', options: ['Lengthy', 'Brief and abrupt', 'Friendly', 'Confusing'], correct: 1, explanation: '"Terse" means brief and to the point, sometimes to the point of seeming rude.' },
  { id: 55, domain: 'D1', difficulty: 'Medium', passage: 'The diplomat's remarks were deliberately ambiguous, allowing multiple interpretations and avoiding commitment to any specific position.', question: 'The word "ambiguous" most nearly means:', options: ['Sincere', 'Harsh', 'Open to multiple interpretations', 'Optimistic'], correct: 2, explanation: '"Ambiguous" means having more than one possible meaning.' },
  { id: 56, domain: 'D1', difficulty: 'Medium', passage: 'The scientist remained steadfast in her conviction despite mounting evidence against her theory, refusing to revise her long-held beliefs.', question: '"Steadfast" most nearly means:', options: ['Uncertain', 'Firmly committed', 'Curious', 'Gradually changing'], correct: 1, explanation: '"Steadfast" means resolutely or dutifully firm and unwavering.' },
  { id: 57, domain: 'D1', difficulty: 'Hard', passage: 'The philosopher argued that morality is not immutable but rather contingent on cultural context, shifting with time and place.', question: '"Immutable" most nearly means:', options: ['Universal', 'Unchanging', 'Subjective', 'Complex'], correct: 1, explanation: '"Immutable" means unchanging over time. The contrast with "shifting" confirms this.' },
  { id: 58, domain: 'D1', difficulty: 'Hard', passage: 'The political pundit's analysis, though initially dismissed as tendentious, proved prescient when events unfolded exactly as predicted.', question: '"Prescient" most nearly means:', options: ['Reckless', 'Having foresight', 'Biased', 'Incorrect'], correct: 1, explanation: '"Prescient" means having or showing knowledge of events before they happen.' },
  { id: 59, domain: 'D2', difficulty: 'Easy', passage: 'The novel depicts a protagonist who undergoes a profound transformation, ultimately emerging as a more compassionate and self-aware individual.', question: 'The word "protagonist" most nearly means:', options: ['Villain', 'Main character', 'Narrator', 'Author'], correct: 1, explanation: '"Protagonist" refers to the central character of a story.' },
  { id: 60, domain: 'D2', difficulty: 'Medium', passage: 'The researcher's findings contradicted the prevailing orthodoxy, challenging the assumptions that had dominated the field for decades.', question: '"Orthodoxy" most nearly means:', options: ['New discovery', 'Accepted belief or practice', 'Scientific method', 'Statistical error'], correct: 1, explanation: '"Orthodoxy" refers to an authorized or generally accepted theory or doctrine.' },
  { id: 61, domain: 'D2', difficulty: 'Medium', passage: 'While the company's profits were robust, critics noted the disparity between executive compensation and average worker wages had reached a historic high.', question: '"Disparity" most nearly means:', options: ['Similarity', 'Inequality', 'Agreement', 'Improvement'], correct: 1, explanation: '"Disparity" means a great difference between things.' },
  { id: 62, domain: 'D3', difficulty: 'Easy', passage: 'She was sitting on the steps, whom was waiting for her friend to arrive from the airport.', question: 'Which correction fixes the pronoun error?', options: ['She was sitting on the steps, which was waiting', 'She was sitting on the steps, who was waiting', 'She was sitting on the steps and was waiting', 'No change needed'], correct: 2, explanation: '"Who" refers to a person (subject role). "Whom" would be an object pronoun -- incorrect here.' },
  { id: 63, domain: 'D3', difficulty: 'Medium', passage: 'The committee, along with their advisors, were unable to reach a consensus on the proposed budget cuts.', question: 'Which corrects the subject-verb agreement?', options: ['The committee, along with their advisors, was unable to reach a consensus.', 'The committee, along with its advisors, were unable to reach a consensus.', 'The committee were unable with their advisors to reach a consensus.', 'No change needed'], correct: 0, explanation: '"The committee" is the subject; "along with their advisors" is a parenthetical. Singular subject → "was unable."' },
  { id: 64, domain: 'D3', difficulty: 'Hard', passage: 'Running to catch the train, my bag fell off my shoulder and spilled its contents across the platform.', question: 'Which revision corrects the dangling modifier?', options: ['As I ran to catch the train, my bag fell off my shoulder and spilled its contents across the platform.', 'Running to catch the train, the bag fell and spilled its contents.', 'My bag, running to catch the train, fell off my shoulder.', 'No change needed'], correct: 0, explanation: 'The original implies the bag was running. Adding "As I ran" gives the modifier a proper subject.' },
  { id: 65, domain: 'D4', difficulty: 'Easy', passage: 'Climate change poses significant risks to global agriculture. _______, rising temperatures are expected to reduce crop yields in many regions.', question: 'Which transition best fits?', options: ['However', 'In contrast', 'Specifically', 'Nevertheless'], correct: 2, explanation: '"Specifically" introduces a concrete detail supporting the claim about agricultural risk.' },
  { id: 66, domain: 'D4', difficulty: 'Medium', passage: 'The initial phase of the study yielded inconclusive results. _______, the researchers expanded their sample size and refined their methodology before the second phase.', question: 'Which transition best fits?', options: ['As a result', 'Nevertheless', 'Similarly', 'In addition'], correct: 0, explanation: '"As a result" shows that the inconclusive results caused the researchers to expand their methods.' },
  { id: 67, domain: 'D4', difficulty: 'Medium', passage: 'Exercise has been shown to improve cognitive function in older adults. _______, a sedentary lifestyle is associated with increased risk of dementia.', question: 'Which transition best fits?', options: ['Similarly', 'Conversely', 'For instance', 'In addition'], correct: 1, explanation: '"Conversely" introduces the contrasting idea -- lack of exercise has the opposite effect.' },
  { id: 68, domain: 'D1', difficulty: 'Easy', passage: 'The startup grew rapidly due to its innovative approach, but its founders remained frugal, reinvesting most profits rather than spending on luxuries.', question: '"Frugal" most nearly means:', options: ['Generous', 'Economical with money', 'Aggressive', 'Inexperienced'], correct: 1, explanation: '"Frugal" means being careful with spending; avoiding waste.' },
  { id: 69, domain: 'D1', difficulty: 'Medium', passage: 'The judge's ruling was seen as capricious -- swayed by personal mood rather than consistent legal principles.', question: '"Capricious" most nearly means:', options: ['Fair and consistent', 'Given to sudden, unpredictable changes', 'Strict and firm', 'Well-reasoned'], correct: 1, explanation: '"Capricious" means given to sudden and unaccountable changes of mood or behavior.' },
  { id: 70, domain: 'D2', difficulty: 'Hard', passage: 'The author contends that modern educational systems, by prioritizing standardized testing over critical thinking, are producing students who are adept at rote memorization but ill-equipped for creative problem-solving in dynamic environments.', question: 'The author's primary argument is that:', options: ['Standardized testing should be eliminated entirely', 'Current educational priorities may undermine certain cognitive skills', 'Critical thinking cannot be taught in schools', 'Students today are less intelligent than previous generations'], correct: 1, explanation: 'The author argues that emphasizing testing over critical thinking has a negative effect on students' broader cognitive abilities.' },
  { id: 71, domain: 'D1', difficulty: 'Easy', passage: 'His demeanor in court was stoic, showing no visible reaction to the guilty verdict that would change his life forever.', question: '"Stoic" most nearly means:', options: ['Angry', 'Emotional and expressive', 'Enduring without complaint or emotion', 'Fearful'], correct: 2, explanation: '"Stoic" means enduring pain or hardship without showing feelings and without complaining.' },
  { id: 72, domain: 'D1', difficulty: 'Medium', passage: 'The senator's speech was criticized for being vacuous -- full of pleasant-sounding phrases but devoid of any substantive policy proposals.', question: '"Vacuous" most nearly means:', options: ['Inspirational', 'Empty of meaning or intelligence', 'Aggressive and combative', 'Technically complex'], correct: 1, explanation: '"Vacuous" means having or showing a lack of thought or intelligence; empty.' },
  { id: 73, domain: 'D1', difficulty: 'Hard', passage: 'Though the evidence was largely circumstantial, the prosecutor constructed a compelling narrative that proved incontrovertible to the jury.', question: '"Incontrovertible" most nearly means:', options: ['Debatable', 'Undeniable and impossible to dispute', 'Emotional', 'Circumstantial'], correct: 1, explanation: '"Incontrovertible" means not able to be denied or disputed.' },
  { id: 74, domain: 'D2', difficulty: 'Medium', passage: 'The documentary challenges the conventional narrative about the Industrial Revolution, arguing that its benefits were not distributed equitably across social classes.', question: '"Equitably" most nearly means:', options: ['Rapidly', 'Fairly and impartially', 'Broadly', 'Sufficiently'], correct: 1, explanation: '"Equitably" means in a fair and impartial manner.' },
  { id: 75, domain: 'D3', difficulty: 'Medium', passage: 'The data indicates that students who read for pleasure score higher on standardized tests then those who do not.', question: 'Which correction is needed?', options: ['Change "indicates" to "indicate"', 'Change "then" to "than"', 'Change "who" to "whom"', 'No change needed'], correct: 1, explanation: '"Than" is used in comparisons. "Then" refers to time. The sentence makes a comparison, so "than" is correct.' },
  { id: 76, domain: 'D1', difficulty: 'Medium', passage: 'The novelist's debut work was remarkable for its verisimilitude -- readers frequently mistook the fictional memoir for a factual account.', question: '"Verisimilitude" most nearly means:', options: ['Creativity', 'The appearance of being true or real', 'Simplicity', 'Historical accuracy'], correct: 1, explanation: '"Verisimilitude" refers to the quality of seeming real or true.' },
  { id: 77, domain: 'D4', difficulty: 'Hard', passage: 'Critics praised the film for its nuanced portrayal of grief. _______, some reviewers felt the pacing was too slow for mainstream audiences.', question: 'Which transition best fits?', options: ['Furthermore', 'Therefore', 'That said', 'Similarly'], correct: 2, explanation: '"That said" acknowledges the praise while introducing a contrasting criticism.' },
  { id: 78, domain: 'D1', difficulty: 'Hard', passage: 'The scientist's hypothesis was so heterodox that most of her colleagues refused to engage with it seriously, dismissing it as fringe speculation.', question: '"Heterodox" most nearly means:', options: ['Well-established', 'Contrary to accepted belief', 'Complex and difficult', 'Mathematically precise'], correct: 1, explanation: '"Heterodox" means not conforming with accepted or orthodox standards or beliefs.' },
  { id: 79, domain: 'D2', difficulty: 'Easy', passage: 'The report revealed that the company's charitable donations were largely perfunctory -- made to satisfy legal requirements rather than out of genuine concern for social welfare.', question: '"Perfunctory" most nearly means:', options: ['Generous and sincere', 'Carried out with minimal effort', 'Publicly announced', 'Financially significant'], correct: 1, explanation: '"Perfunctory" means carried out with minimum effort, often as a routine duty.' },
  { id: 80, domain: 'D3', difficulty: 'Hard', passage: 'Between you and I, the proposal seems unlikely to gain board approval given the current financial climate.', question: 'Which correction fixes the pronoun error?', options: ['Between you and myself', 'Between you and me', 'Among you and I', 'No change needed'], correct: 1, explanation: '"Between" is a preposition and takes object pronouns. "Me" (not "I") is the object form.' },

  { id: 81, domain: 'D1', difficulty: 'Easy', passage: 'The teacher used an anecdote from her own life to illustrate the importance of perseverance to her students.', question: '"Anecdote" most nearly means:', options: ['Lesson plan', 'Short personal story', 'Scientific data', 'General principle'], correct: 1, explanation: 'An anecdote is a short, personal story used to illustrate a point.' },
  { id: 82, domain: 'D1', difficulty: 'Easy', passage: 'The author's tone throughout the essay was sardonic, using biting humor to mock the very institutions she once admired.', question: '"Sardonic" most nearly means:', options: ['Sincere and earnest', 'Grimly mocking', 'Enthusiastic', 'Neutral and objective'], correct: 1, explanation: '"Sardonic" means grimly mocking or cynical.' },
  { id: 83, domain: 'D1', difficulty: 'Medium', passage: 'The politician's populist rhetoric resonated with voters who felt ignored by the establishment but was criticized by analysts as superficial.', question: '"Rhetoric" most nearly means:', options: ['Sincere argument', 'Language used to persuade', 'Official policy', 'Mathematical proof'], correct: 1, explanation: '"Rhetoric" refers to language designed to have a persuasive or impressive effect.' },
  { id: 84, domain: 'D1', difficulty: 'Medium', passage: 'The committee's decision to table the proposal was met with consternation by advocates who had spent years lobbying for its passage.', question: '"Consternation" most nearly means:', options: ['Relief', 'Approval', 'Anxiety and dismay', 'Indifference'], correct: 2, explanation: '"Consternation" means a feeling of anxiety or dismay.' },
  { id: 85, domain: 'D1', difficulty: 'Medium', passage: 'The scientist's theory was compelling but ultimately speculative, lacking the empirical evidence needed to gain widespread acceptance.', question: '"Empirical" most nearly means:', options: ['Theoretical', 'Based on observation and experiment', 'Mathematical', 'Widely accepted'], correct: 1, explanation: '"Empirical" means based on or verifiable by observation or experience.' },
  { id: 86, domain: 'D1', difficulty: 'Hard', passage: 'The novel's denouement, though satisfying to some readers, left others feeling that the complex conflicts introduced had been resolved too neatly.', question: '"Denouement" most nearly means:', options: ['Opening chapter', 'Central conflict', 'Final resolution of a story', 'Plot twist'], correct: 2, explanation: '"Denouement" is the final resolution of the main conflict in a narrative.' },
  { id: 87, domain: 'D2', difficulty: 'Easy', passage: 'Critics praised the film's evocative soundtrack, which transported viewers to the time and place depicted on screen.', question: '"Evocative" most nearly means:', options: ['Dissonant', 'Bringing strong images or feelings to mind', 'Simple', 'Repetitive'], correct: 1, explanation: '"Evocative" means bringing strong memories or feelings to mind.' },
  { id: 88, domain: 'D2', difficulty: 'Medium', passage: 'The historian argued that the ancient empire collapsed not due to external invasion but rather through endemic corruption that eroded institutions from within.', question: '"Endemic" most nearly means:', options: ['Foreign', 'Sudden', 'Regularly found in a particular place or group', 'Occasionally occurring'], correct: 2, explanation: '"Endemic" means regularly found and widespread within a particular community or area.' },
  { id: 89, domain: 'D3', difficulty: 'Hard', passage: 'The data that was collected over ten years are now being analyzed by a team of statisticians to identify long-term trends.', question: 'Which correction fixes the subject-verb agreement?', options: ['The data that were collected over ten years are now being analyzed', 'The data that was collected over ten years is now being analyzed', 'The data that was collected over ten years have now been analyzed', 'No correction needed'], correct: 1, explanation: '"Data" as a singular collective noun takes "is." The relative clause verb ("was") also correctly agrees with the singular "data."' },
  { id: 90, domain: 'D4', difficulty: 'Medium', passage: 'The company launched its new product line in the spring. _______, sales exceeded projections by forty percent in the first quarter.', question: 'Which transition best fits?', options: ['Nevertheless', 'In contrast', 'As a result', 'Remarkably'], correct: 3, explanation: '"Remarkably" signals that the sales result was surprisingly impressive.' },
  { id: 91, domain: 'D1', difficulty: 'Hard', passage: 'The philosopher's works were characterized by their aphoristic style -- dense, memorable sentences that packed enormous meaning into very few words.', question: '"Aphoristic" most nearly means:', options: ['Long-winded and complex', 'Expressing ideas in concise pithy statements', 'Confusing and abstract', 'Mathematical in nature'], correct: 1, explanation: 'An aphorism is a pithy, concise statement of principle. "Aphoristic" describes writing in that style.' },
  { id: 92, domain: 'D1', difficulty: 'Medium', passage: 'The attorney was known for her tenacious advocacy on behalf of clients who could not afford private representation.', question: '"Tenacious" most nearly means:', options: ['Brief', 'Careless', 'Holding firmly to purpose', 'Easily discouraged'], correct: 2, explanation: '"Tenacious" means tending to keep a firm hold; persistent.' },
  { id: 93, domain: 'D2', difficulty: 'Hard', passage: 'While most economists predicted a recession, a few contrarian analysts argued that the underlying fundamentals remained robust enough to sustain growth.', question: '"Contrarian" most nearly means:', options: ['Mainstream', 'Going against prevailing opinion', 'Inexperienced', 'Optimistic'], correct: 1, explanation: 'A contrarian deliberately takes the opposite position to the prevailing view.' },
  { id: 94, domain: 'D3', difficulty: 'Medium', passage: 'The mayor, together with city council members, are planning to attend the ribbon-cutting ceremony next Friday.', question: 'Which correction is needed?', options: ['Change "are" to "is"', 'Change "together with" to "and"', 'Change "planning" to "plan"', 'No correction needed'], correct: 0, explanation: '"The mayor" is the subject. "Together with city council members" is a parenthetical phrase. Singular subject → "is planning."' },
  { id: 95, domain: 'D1', difficulty: 'Easy', passage: 'The museum's new exhibit was lauded by critics for its comprehensive coverage of the Renaissance period.', question: '"Lauded" most nearly means:', options: ['Criticized', 'Praised', 'Ignored', 'Questioned'], correct: 1, explanation: '"Lauded" means praised enthusiastically.' },
  { id: 96, domain: 'D2', difficulty: 'Medium', passage: 'The study found a strong correlation between hours of sleep and academic performance, though researchers cautioned that correlation does not imply causation.', question: 'The passage implies that:', options: ['Sleep improves academic performance', 'Poor sleep causes bad grades', 'Two things can be related without one causing the other', 'The study was flawed'], correct: 2, explanation: 'The warning that "correlation does not imply causation" means a relationship between variables doesn't prove one causes the other.' },
  { id: 97, domain: 'D1', difficulty: 'Hard', passage: 'The architecture of the building was deliberately anachronistic, blending medieval stone arches with sleek modernist glass panels.', question: '"Anachronistic" most nearly means:', options: ['Historically accurate', 'Belonging to a period other than the one depicted', 'Futuristic', 'Structurally sound'], correct: 1, explanation: '"Anachronistic" means belonging to a period other than that being portrayed -- here, mixing medieval and modern.' },
  { id: 98, domain: 'D3', difficulty: 'Hard', passage: 'The report, as well as its appendices, contain a wealth of data supporting the committee's conclusions.', question: 'Which correction is needed?', options: ['Change "contain" to "contains"', 'Change "supporting" to "support"', 'Change "its" to "their"', 'No correction needed'], correct: 0, explanation: '"The report" is the singular subject. "As well as its appendices" is parenthetical. Use "contains."' },
  { id: 99, domain: 'D4', difficulty: 'Hard', passage: 'The new treatment showed remarkable efficacy in early trials. _______, larger controlled studies revealed that the initial results could not be replicated at scale.', question: 'Which transition best fits?', options: ['Furthermore', 'Subsequently', 'Similarly', 'Moreover'], correct: 1, explanation: '"Subsequently" shows that the larger studies came after the early trials, introducing the contrasting result.' },
  { id: 100, domain: 'D1', difficulty: 'Medium', passage: 'The poet's use of juxtaposition -- placing images of industrial decay alongside scenes of natural beauty -- created a powerful commentary on environmental destruction.', question: '"Juxtaposition" most nearly means:', options: ['Combination', 'Contradiction', 'Placing contrasting things side by side', 'Metaphorical comparison'], correct: 2, explanation: '"Juxtaposition" means placing two things close together to highlight their differences or create contrast.' },
];

const TIMER_DURATION = 45;


// Shuffle options array and update correct index accordingly
function shuffleOptions<T extends { options: string[]; correct: number }>(q: T): T {
  const idx = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { ...q, options: idx.map(i => q.options[i]), correct: idx.indexOf(q.correct) };
}

export default function WordDuelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [shuffledQ] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10).map(shuffleOptions));
  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  function endGame() { clearInterval(timerRef.current); setGameState('results'); }

  function handleAnswer(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);
    const q = shuffledQ[currentQ];
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
      showFloatingScore(`+${pts}${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
    }
    setAnswers(prev => [...prev, {
      question: q.question, passage: q.passage,
      userAnswer: q.options[index], correctAnswer: q.options[q.correct],
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setCurrentQ(q => q + 1); setAnswered(false); setSelectedAnswer(null);
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
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: -40, duration: 600, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: -80, duration: 400, useNativeDriver: true }),
    ]).start(() => { setFloatingScore(null); scoreAnim.setValue(0); });
  }

  function togglePause() {
    if (gameState === 'playing') { clearInterval(timerRef.current); setGameState('paused'); }
    else if (gameState === 'paused') setGameState('playing');
  }

  function restartGame() {
    setCurrentQ(0); setAnswered(false); setSelectedAnswer(null);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);

  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(1, finalScore, xpEarned, 'rw_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);

  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review ⚔️</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewPassage}>{a.passage}</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Word Duel</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📈 Your History</Text>
            <Text style={styles.historySub}>Play more games to see your score history!</Text>
            <Text style={styles.historyRank}>Game #1 -- Score: {finalScore}</Text>
          </View>
          {isDailyChallenge ? (
            <TouchableOpacity style={styles.continueBtn} onPress={async () => {
              const today = new Date().toISOString().split('T')[0];
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.setItem(`daily_played_${today}_${dailyGames[currentIndex]}`, '1');
              const { DeviceEventEmitter } = await import('react-native');
              DeviceEventEmitter.emit('daily_played_changed');
              if (typeof window !== 'undefined' && typeof Event === 'function') window.dispatchEvent(new Event('daily_played_changed'));
              router.replace('/(tabs)' as any);
            }}>
              <Text style={styles.continueBtnText}>Done ✓</Text>
            </TouchableOpacity>
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

  const q = shuffledQ[currentQ];
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.gameHeader}>
            <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
              <Text style={styles.pauseIcon}>⏸</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.gameTitle}>⚔️ Word Duel</Text>
              <Text style={styles.gameSubtitle}>D1 · Craft & Structure</Text>
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

          {/* Lives & Timer */}
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
            <View style={[styles.qCounterBox, { backgroundColor: '#2563EB20' }]}>
              <Text style={styles.qCounter}>{currentQ + 1}/{shuffledQ.length}</Text>
            </View>
          </View>

          {/* Domain Badge */}
          <View style={styles.domainRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>📖 {q.domain} · {q.difficulty}</Text>
            </View>
          </View>

          {/* Passage */}
          <View style={styles.passageBox}>
            <Text style={styles.passageLabel}>PASSAGE</Text>
            <Text style={styles.passageText}>{q.passage}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>

          {/* Answer Pills */}
          <View style={styles.optionsGrid}>
            {q.options.map((option, index) => {
              let bgColor = '#1A1A2E';
              let borderColor = '#3D3D5C';
              let textColor = '#FFFFFF';
              let letterBg = '#2D2D50';
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
      </Animated.View>

      {/* Pause Overlay */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>⏸ Paused</Text>
            <Text style={styles.pauseSub}>Score: {score} pts</Text>
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
                const { DeviceEventEmitter } = await import('react-native');
                DeviceEventEmitter.emit('daily_played_changed');
                if (typeof window !== 'undefined' && typeof Event === 'function') window.dispatchEvent(new Event('daily_played_changed'));
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
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20 },
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 16, gap: 12,
  },
  pauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#3D3D5C',
  },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
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
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
    backgroundColor: '#1A1A2E', borderRadius: 16, padding: 12,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#2D2D44', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  qCounter: { fontSize: 14, color: '#2563EB', fontWeight: '800' },
  domainRow: { marginBottom: 10 },
  domainBadge: {
    backgroundColor: '#2563EB20', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: '#2563EB40',
  },
  domainText: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
  passageBox: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#3D3D5C',
  },
  passageLabel: { fontSize: 11, color: '#F97316', fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  passageText: { fontSize: 16, color: '#E2E8F0', lineHeight: 26 },
  questionBox: {
    backgroundColor: '#2563EB15', borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#2563EB30',
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
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: {
    backgroundColor: '#1A1A2E', borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
  },
  reviewPassage: { fontSize: 13, color: '#9CA3AF', lineHeight: 20, marginBottom: 8, fontStyle: 'italic' },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#3D3D5C',
  },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: {
    flex: 1, backgroundColor: '#0F0F1A',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#2563EB' },
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
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#3D3D5C',
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#2563EB', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#2563EB', borderRadius: 50,
    padding: 18, alignItems: 'center', marginVertical: 20,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  pauseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center',
  },
  pauseCard: {
    backgroundColor: '#1A1A2E', borderRadius: 24,
    padding: 32, width: '82%', alignItems: 'center',
    borderWidth: 1, borderColor: '#3D3D5C',
  },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: {
    width: '100%', padding: 16, borderRadius: 50,
    backgroundColor: '#2563EB', alignItems: 'center', marginBottom: 12,
  },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#3D3D5C' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
});