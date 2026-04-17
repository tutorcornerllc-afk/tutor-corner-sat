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
  { id: 1, domain: 'D1', difficulty: 'Easy', passage: 'The scientist\'s findings were considered ephemeral by her peers, lasting only a brief moment in the public consciousness before being forgotten entirely.', question: 'As used in the passage, "ephemeral" most nearly means:', options: ['Permanent', 'Short-lived', 'Controversial', 'Groundbreaking'], correct: 1, explanation: 'Ephemeral means lasting for a very short time. The passage confirms this with "lasting only a brief moment."' },
  { id: 2, domain: 'D1', difficulty: 'Easy', passage: 'Despite his reputation for being austere, the professor surprised his students with an unexpectedly warm and generous celebration at the end of the semester.', question: 'As used in the passage, "austere" most nearly means:', options: ['Wealthy', 'Strict and severe', 'Cheerful', 'Forgetful'], correct: 1, explanation: 'Austere means strict or severe. The contrast with "warm and generous" confirms this.' },
  { id: 3, domain: 'D1', difficulty: 'Easy', passage: 'The politician\'s speech was filled with ambiguous statements that could be interpreted in multiple ways, leaving voters uncertain about her actual position.', question: 'As used in the passage, "ambiguous" most nearly means:', options: ['Clear and direct', 'Open to multiple interpretations', 'Dishonest', 'Passionate'], correct: 1, explanation: 'Ambiguous means open to more than one interpretation. The passage states "interpreted in multiple ways."' },
  { id: 4, domain: 'D1', difficulty: 'Easy', passage: 'The new policy was designed to mitigate the effects of climate change by reducing carbon emissions from industrial sources across the country.', question: 'As used in the passage, "mitigate" most nearly means:', options: ['Worsen', 'Ignore', 'Lessen', 'Celebrate'], correct: 2, explanation: 'Mitigate means to make less severe. Reducing emissions lessens climate change effects.' },
  { id: 5, domain: 'D1', difficulty: 'Easy', passage: 'Her pragmatic approach to problem-solving meant she focused on practical solutions rather than ideal ones, even if they were imperfect.', question: 'As used in the passage, "pragmatic" most nearly means:', options: ['Idealistic', 'Practical', 'Emotional', 'Theoretical'], correct: 1, explanation: 'Pragmatic means dealing with things sensibly and practically. The passage confirms "practical solutions."' },
  { id: 6, domain: 'D1', difficulty: 'Easy', passage: 'The community center served as a nexus for local organizations, connecting dozens of groups that might otherwise have had no contact with one another.', question: 'As used in the passage, "nexus" most nearly means:', options: ['Barrier', 'Central connection point', 'Funding source', 'Meeting schedule'], correct: 1, explanation: 'Nexus means a connection or series of connections linking things. "Connecting dozens of groups" confirms this.' },
  { id: 7, domain: 'D1', difficulty: 'Easy', passage: 'The documentary took a candid look at poverty in urban areas, presenting unfiltered, honest images without any attempt to soften the reality.', question: 'As used in the passage, "candid" most nearly means:', options: ['Biased', 'Honest and direct', 'Artistic', 'Dramatic'], correct: 1, explanation: 'Candid means truthful and straightforward. "Unfiltered, honest images" confirms this meaning.' },
  { id: 8, domain: 'D1', difficulty: 'Medium', passage: 'The author\'s prose was lauded for its pellucid quality — each sentence so clear and transparent that even complex philosophical ideas became accessible to general readers.', question: 'As used in the passage, "pellucid" most nearly means:', options: ['Obscure', 'Brilliantly clear', 'Overly simple', 'Poetic'], correct: 1, explanation: 'Pellucid means translucently clear. The passage confirms this with "clear and transparent."' },
  { id: 9, domain: 'D1', difficulty: 'Medium', passage: 'The engineer proposed an ingenious solution to the water shortage: collecting rainwater from rooftops and redirecting it into underground storage tanks.', question: 'As used in the passage, "ingenious" most nearly means:', options: ['Expensive', 'Complicated', 'Clever and inventive', 'Risky'], correct: 2, explanation: 'Ingenious means clever, original, and inventive. The novel rainwater solution demonstrates this quality.' },
  { id: 10, domain: 'D1', difficulty: 'Medium', passage: 'The general\'s tactics were considered audacious by military historians — bold moves that most commanders would have considered far too risky to attempt.', question: 'As used in the passage, "audacious" most nearly means:', options: ['Foolish', 'Cautious', 'Daring and bold', 'Secretive'], correct: 2, explanation: 'Audacious means showing a willingness to take bold risks. "Bold moves" and "too risky" confirm this.' },
  { id: 11, domain: 'D1', difficulty: 'Medium', passage: 'Despite centuries of scholarly debate, the origin of the ancient manuscript remains enigmatic, with no consensus about where, when, or by whom it was written.', question: 'As used in the passage, "enigmatic" most nearly means:', options: ['Well-documented', 'Mysterious', 'Irrelevant', 'Controversial'], correct: 1, explanation: 'Enigmatic means mysterious or difficult to interpret. The lack of consensus about its origins confirms this.' },
  { id: 12, domain: 'D1', difficulty: 'Medium', passage: 'The CEO\'s verbose presentation frustrated the board, who had requested a concise summary but instead received a three-hour lecture filled with unnecessary details.', question: 'As used in the passage, "verbose" most nearly means:', options: ['Clear', 'Using too many words', 'Technical', 'Persuasive'], correct: 1, explanation: 'Verbose means using more words than necessary. The contrast with "concise summary" and the three-hour lecture confirm this.' },
  { id: 13, domain: 'D1', difficulty: 'Medium', passage: 'The young artist\'s work showed remarkable perspicacity — an ability to see through surface appearances and identify the deeper emotional truths hidden within everyday scenes.', question: 'As used in the passage, "perspicacity" most nearly means:', options: ['Creativity', 'Technical skill', 'Keen insight', 'Ambition'], correct: 2, explanation: 'Perspicacity means having a ready insight into things. The ability to see deeper truths demonstrates this quality.' },
  { id: 14, domain: 'D1', difficulty: 'Medium', passage: 'The philanthropist\'s munificent donation of ten million dollars allowed the museum to expand its collection and offer free admission to all visitors.', question: 'As used in the passage, "munificent" most nearly means:', options: ['Reluctant', 'Surprisingly large and generous', 'Anonymous', 'Conditional'], correct: 1, explanation: 'Munificent means larger or more generous than is usual or necessary. The ten million dollar donation confirms this.' },
  { id: 15, domain: 'D1', difficulty: 'Hard', passage: 'Critics found the novel\'s ending bathetic, a jarring descent from the lofty emotional heights of the earlier chapters into something disappointingly mundane and predictable.', question: 'As used in the passage, "bathetic" most nearly means:', options: ['Deeply moving', 'Anticlimactic', 'Confusing', 'Violent'], correct: 1, explanation: 'Bathetic means producing an effect of anticlimax. "Disappointing descent from emotional heights" confirms this.' },
  { id: 16, domain: 'D1', difficulty: 'Hard', passage: 'The philosopher\'s argument was built on a series of tendentious claims — statements that appeared objective but were actually designed to promote a particular political agenda.', question: 'As used in the passage, "tendentious" most nearly means:', options: ['Logical', 'Promoting a particular cause', 'Well-researched', 'Confusing'], correct: 1, explanation: 'Tendentious means expressing a particular point of view. "Designed to promote a particular political agenda" confirms this.' },
  { id: 17, domain: 'D1', difficulty: 'Hard', passage: 'The historian described the treaty as a Pyrrhic victory for the conquering nation — they had won the territory but at such enormous cost that their empire never fully recovered.', question: 'As used in the passage, "Pyrrhic" most nearly means:', options: ['Decisive and total', 'Won at too great a cost', 'Unexpected', 'Diplomatic'], correct: 1, explanation: 'A Pyrrhic victory is one won at too great a cost. The empire never recovering despite winning confirms this.' },
  { id: 18, domain: 'D1', difficulty: 'Hard', passage: 'The scientist\'s theory was considered heterodox by her colleagues, who felt it challenged too many of the field\'s most fundamental and long-accepted assumptions.', question: 'As used in the passage, "heterodox" most nearly means:', options: ['Widely accepted', 'Departing from accepted beliefs', 'Experimental', 'Poorly supported'], correct: 1, explanation: 'Heterodox means not conforming to accepted beliefs. Challenging fundamental assumptions confirms this.' },
  { id: 19, domain: 'D2', difficulty: 'Easy', passage: 'Urban planners argue that green spaces in cities are not merely aesthetic luxuries but essential infrastructure that improves air quality, reduces urban heat, and supports mental health.', question: 'Which statement best describes the author\'s main claim?', options: ['Green spaces make cities look prettier', 'Green spaces are necessary urban infrastructure with multiple benefits', 'Urban planners disagree about green spaces', 'Mental health is the most important benefit of green spaces'], correct: 1, explanation: 'The main claim is that green spaces are essential infrastructure, not just aesthetic. Multiple functional benefits are listed.' },
  { id: 20, domain: 'D2', difficulty: 'Easy', passage: 'Sleep deprivation affects cognitive performance more than most people realize. Studies show that going 17 hours without sleep produces impairment equivalent to a blood alcohol level of 0.05%.', question: 'What is the primary purpose of this passage?', options: ['To argue that alcohol is dangerous', 'To demonstrate the cognitive effects of sleep deprivation with evidence', 'To recommend a sleep schedule', 'To criticize people who stay up late'], correct: 1, explanation: 'The passage uses a comparison to alcohol impairment to demonstrate how serious sleep deprivation is for cognitive function.' },
  { id: 21, domain: 'D2', difficulty: 'Medium', passage: 'While many assume that multitasking increases productivity, research consistently shows the opposite. Studies indicate that switching between tasks reduces efficiency by up to 40%, as the brain requires time to refocus after each transition.', question: 'What evidence does the author use to support the claim about multitasking?', options: ['Personal anecdotes about productivity', 'Studies showing up to 40% efficiency reduction', 'Expert opinions from business leaders', 'Historical examples of successful multitaskers'], correct: 1, explanation: 'The author cites specific research showing a 40% efficiency reduction, which directly supports the claim against multitasking.' },
  { id: 22, domain: 'D2', difficulty: 'Medium', passage: 'The Columbian Exchange fundamentally transformed global diets. Tomatoes, originally from the Americas, became central to Italian cuisine. Potatoes revolutionized food security in Ireland and Northern Europe. Meanwhile, horses introduced to the Americas transformed the cultures of many Indigenous peoples.', question: 'What is the central idea of this passage?', options: ['Italian food originated in America', 'The Columbian Exchange caused widespread cultural transformation through new foods and animals', 'Potatoes prevented famine in Europe', 'Horses are more important than plants'], correct: 1, explanation: 'The passage shows multiple examples of how the exchange of plants and animals between continents transformed cultures globally.' },
  { id: 23, domain: 'D2', difficulty: 'Hard', passage: 'The Renaissance was not simply a rebirth of classical antiquity but a complex negotiation between inherited traditions and emerging empirical methods. Scholars who once relied solely on ancient texts began demanding observable evidence, a shift that would eventually give rise to the scientific revolution.', question: 'What inference can best be drawn from this passage?', options: ['Renaissance scholars rejected all ancient knowledge', 'The scientific revolution preceded the Renaissance', 'The Renaissance created conditions that enabled the scientific revolution', 'Ancient texts were proven wrong during the Renaissance'], correct: 2, explanation: 'The shift toward demanding observable evidence during the Renaissance implies this mindset eventually led to the scientific revolution.' },
  { id: 24, domain: 'D2', difficulty: 'Hard', passage: 'Proponents of universal basic income argue that automation will eliminate millions of jobs within the next two decades. Critics counter that new technologies historically create more jobs than they destroy. Both sides, however, acknowledge that the transition period may cause significant economic disruption regardless of the long-term outcome.', question: 'Which statement would both proponents and critics of universal basic income agree with?', options: ['Automation will definitely eliminate jobs permanently', 'The transition to automated economies may cause economic disruption', 'Universal basic income is the best solution to automation', 'New technologies always create more jobs than they destroy'], correct: 1, explanation: 'The passage explicitly states both sides acknowledge the transition period may cause disruption, making this the point of agreement.' },
  { id: 25, domain: 'D3', difficulty: 'Easy', passage: 'The committee members each expressed their unique opinions about the proposal during the meeting yesterday afternoon.', question: 'Which revision best improves the sentence by eliminating redundancy?', options: ['The committee members each expressed their own individual unique opinions about the proposal.', 'The committee members expressed their opinions about the proposal.', 'Each of the committee members uniquely and individually expressed opinions.', 'The members of the committee each gave their own unique personal opinions.'], correct: 1, explanation: '"Each" and "unique" are redundant. The clearest version simply says "expressed their opinions."' },
  { id: 26, domain: 'D3', difficulty: 'Easy', passage: 'Neither the coach nor the players was prepared for the sudden change in weather conditions during the championship game.', question: 'Which correction best fixes the grammatical error?', options: ['Neither the coach nor the players were prepared', 'Neither the coach nor the players is prepared', 'Neither the coach or the players was prepared', 'No change needed'], correct: 0, explanation: 'With "neither/nor," the verb agrees with the closest subject. "Players" is plural, so the verb should be "were."' },
  { id: 27, domain: 'D3', difficulty: 'Easy', passage: 'The students who studied consistently throughout the semester performed significantly better on their final exams.', question: 'Which of the following is grammatically correct and maintains the same meaning?', options: ['The students, who studied consistently throughout the semester, performed significantly better on their final exams.', 'The students who studied consistently throughout the semester, they performed significantly better on their final exams.', 'The students who studied consistently throughout the semester and performed significantly better on their final exams.', 'No change needed'], correct: 3, explanation: 'The original sentence is grammatically correct. The restrictive clause "who studied consistently" correctly identifies which students.' },
  { id: 28, domain: 'D3', difficulty: 'Medium', passage: 'Running through the park, the flowers seemed to bloom more brilliantly in the morning light.', question: 'Which revision corrects the dangling modifier?', options: ['Running through the park, I noticed the flowers seemed to bloom more brilliantly.', 'The flowers, running through the park, seemed to bloom more brilliantly.', 'Running through the park; the flowers seemed to bloom more brilliantly.', 'No change needed'], correct: 0, explanation: 'The original implies flowers were running. Adding "I" gives the participial phrase a logical subject.' },
  { id: 29, domain: 'D3', difficulty: 'Medium', passage: 'The research team has been working on this project since three years and have made considerable progress in developing a viable solution.', question: 'Which revision corrects the error?', options: ['The research team has been working on this project for three years and has made considerable progress.', 'The research team have been working on this project since three years and has made considerable progress.', 'The research team has been working on this project since three years and has made considerable progress.', 'No change needed'], correct: 0, explanation: '"Since" is used with specific points in time. "For" is used with durations. Also, "team" as a collective noun takes singular "has."' },
  { id: 30, domain: 'D3', difficulty: 'Medium', passage: 'The new regulations require companies to report their emissions annually, reduce waste by 20%, and the implementation of renewable energy sources.', question: 'Which revision corrects the parallel structure error?', options: ['The new regulations require companies to report their emissions annually, reduce waste by 20%, and implement renewable energy sources.', 'The new regulations require companies to report their emissions annually, reducing waste by 20%, and the implementation of renewable energy sources.', 'The new regulations require companies reporting their emissions annually, reducing waste by 20%, and implementing renewable energy sources.', 'No change needed'], correct: 0, explanation: 'Parallel structure requires all items in a series to use the same grammatical form: "to report, reduce, and implement."' },
  { id: 31, domain: 'D3', difficulty: 'Hard', passage: 'Each of the proposed solutions have their own advantages and disadvantages that must be carefully weighed before the committee makes their final decision.', question: 'Which revision corrects ALL grammatical errors in this sentence?', options: ['Each of the proposed solutions has its own advantages and disadvantages that must be carefully weighed before the committee makes its final decision.', 'Each of the proposed solutions have its own advantages and disadvantages that must be carefully weighed before the committee makes its final decision.', 'Each of the proposed solutions has their own advantages and disadvantages that must be carefully weighed before the committee makes their final decision.', 'No change needed'], correct: 0, explanation: '"Each" is singular and takes "has" and "its." "Committee" as a collective noun acting as a unit takes "its."' },
  { id: 32, domain: 'D3', difficulty: 'Hard', passage: 'The professor, along with several of her graduate students, are presenting their research at the international conference next month in Vienna.', question: 'Which correction fixes the subject-verb agreement error?', options: ['The professor, along with several of her graduate students, is presenting her research at the international conference next month.', 'The professor, along with several of her graduate students, are presenting her research at the international conference next month.', 'The professor, along with several of her graduate students, is presenting their research at the international conference next month.', 'No change needed'], correct: 2, explanation: '"Along with" does not make a compound subject. "Professor" is singular, so the verb should be "is." "Their" correctly refers to the group\'s shared research.' },
  { id: 33, domain: 'D4', difficulty: 'Easy', passage: 'Scientists have made remarkable discoveries about deep-sea creatures. _______, much of the ocean floor remains unexplored.', question: 'Which transition best connects these two ideas?', options: ['Therefore', 'Nevertheless', 'Similarly', 'Specifically'], correct: 1, explanation: '"Nevertheless" signals a contrast — despite discoveries, much remains unexplored. The others don\'t fit the contrasting relationship.' },
  { id: 34, domain: 'D4', difficulty: 'Easy', passage: 'The study found that exercise improves mood. _______, participants who exercised regularly reported lower levels of anxiety and depression.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Specifically', 'Despite this'], correct: 2, explanation: '"Specifically" introduces a specific example or detail supporting the previous statement about exercise improving mood.' },
  { id: 35, domain: 'D4', difficulty: 'Easy', passage: 'Maria had studied for weeks. _______, she felt confident walking into the exam room.', question: 'Which transition best connects these sentences?', options: ['Nevertheless', 'As a result', 'In contrast', 'For example'], correct: 1, explanation: '"As a result" shows cause and effect — studying led to confidence. This is a logical cause-and-effect relationship.' },
  { id: 36, domain: 'D4', difficulty: 'Medium', passage: 'The report concluded that remote work increased employee satisfaction by 35%. It also found that productivity rose in most departments. _______, the company decided to make remote work permanent.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Based on these findings', 'Despite this'], correct: 2, explanation: '"Based on these findings" logically connects research results to the company\'s decision. Other options suggest contrast.' },
  { id: 37, domain: 'D4', difficulty: 'Medium', passage: 'Early humans lived in small nomadic groups that followed seasonal food sources. Agriculture changed everything. _______ settling in permanent locations, humans could store food, support larger populations, and develop specialized roles.', question: 'Which transition best fits here?', options: ['Instead of', 'By', 'Despite', 'Although'], correct: 1, explanation: '"By" introduces how something is accomplished — settling in permanent locations was the mechanism that enabled food storage and population growth.' },
  { id: 38, domain: 'D4', difficulty: 'Medium', passage: 'The new medication showed promising results in laboratory studies. _______, clinical trials involving human patients revealed several unexpected and serious side effects.', question: 'Which transition best fits here?', options: ['Furthermore', 'Similarly', 'However', 'Therefore'], correct: 2, explanation: '"However" signals a contrast or complication — the promising lab results were contradicted by the clinical trial findings.' },
  { id: 39, domain: 'D4', difficulty: 'Hard', passage: 'The ancient Silk Road connected civilizations across thousands of miles. _______ facilitating trade in goods like silk and spices, it served as a conduit for the exchange of ideas, religions, and technologies that fundamentally shaped the medieval world.', question: 'Which transition best fits here?', options: ['Instead of', 'Despite', 'Beyond merely', 'Because of'], correct: 2, explanation: '"Beyond merely" signals that the author is expanding on what was already stated — the Silk Road did more than just facilitate trade.' },
  { id: 40, domain: 'D4', difficulty: 'Hard', passage: 'Renewable energy sources like solar and wind power have become significantly cheaper over the past decade. _______, the transition away from fossil fuels has been slower than many climate scientists recommend, due largely to political and economic factors that resist rapid change.', question: 'Which transition best fits here?', options: ['As a result', 'Consequently', 'Nevertheless', 'Furthermore'], correct: 2, explanation: '"Nevertheless" introduces a concession — despite cheaper renewables, the transition has been slow. This is a contrast, not a consequence.' },
  { id: 41, domain: 'D1', difficulty: 'Medium', passage: 'The novel\'s protagonist was a taciturn man who spoke rarely, preferring to communicate through meaningful glances and deliberate silences rather than words.', question: 'As used in the passage, "taciturn" most nearly means:', options: ['Talkative', 'Reserved and uncommunicative', 'Mysterious', 'Thoughtful'], correct: 1, explanation: 'Taciturn means reserved or uncommunicative in speech. "Spoke rarely" directly confirms this.' },
  { id: 42, domain: 'D1', difficulty: 'Medium', passage: 'The journalist\'s report was lauded for its meticulous attention to detail — every fact checked, every source verified, every claim supported by multiple independent pieces of evidence.', question: 'As used in the passage, "meticulous" most nearly means:', options: ['Biased', 'Showing great attention to detail', 'Lengthy', 'Controversial'], correct: 1, explanation: 'Meticulous means showing great attention to detail and care. The description of thorough fact-checking confirms this.' },
  { id: 43, domain: 'D1', difficulty: 'Hard', passage: 'The economist\'s analysis was considered sanguine by her critics, who felt her optimistic projections failed to account for the volatile and unpredictable nature of global markets.', question: 'As used in the passage, "sanguine" most nearly means:', options: ['Pessimistic', 'Overly optimistic', 'Detailed', 'Controversial'], correct: 1, explanation: 'Sanguine means optimistic, especially in difficult situations. "Optimistic projections" and the contrast with "volatile markets" confirm this.' },
  { id: 44, domain: 'D2', difficulty: 'Medium', passage: 'Coral reefs cover less than 1% of the ocean floor yet support approximately 25% of all marine species. Scientists estimate that reefs provide ecosystem services worth $375 billion annually to millions of people worldwide through fisheries, tourism, and coastal protection.', question: 'What is the main purpose of including the statistic about ecosystem services?', options: ['To show that tourism is the most valuable reef service', 'To quantify the economic importance of coral reefs', 'To argue that 1% of the ocean is more important than the rest', 'To suggest that marine species are economically valuable'], correct: 1, explanation: 'The $375 billion figure quantifies the economic value, supporting the broader argument that coral reefs are disproportionately important.' },
  { id: 45, domain: 'D2', difficulty: 'Hard', passage: 'While democracy promotes individual freedoms, it can paradoxically undermine long-term planning. Elected officials, focused on short electoral cycles, often prioritize immediate gains over necessary but costly long-term investments in infrastructure, education, or climate resilience.', question: 'What is the author\'s main argument?', options: ['Democracy is inferior to other forms of government', 'Democratic electoral systems may create structural obstacles to long-term planning', 'Politicians are generally corrupt and self-interested', 'Infrastructure investment is the most important government priority'], correct: 1, explanation: 'The author argues that the structure of democratic elections — short cycles focused on immediate gains — creates obstacles to long-term planning.' },
  { id: 46, domain: 'D3', difficulty: 'Easy', passage: 'The childrens\' books were arranged carefully on the lowest shelves so that young readers could reach them easily without assistance.', question: 'Which correction fixes the apostrophe error?', options: ["The children's books were arranged carefully on the lowest shelves.", 'The childrens books were arranged carefully on the lowest shelves.', "The children's' books were arranged carefully on the lowest shelves.", 'No change needed'], correct: 0, explanation: '"Children" is already plural, so the possessive is formed by adding \'s: "children\'s" not "childrens\'."' },
  { id: 47, domain: 'D3', difficulty: 'Medium', passage: 'The board of directors have decided to postpone the merger until market conditions improve, according to the statement released yesterday.', question: 'Which best corrects the subject-verb agreement?', options: ['The board of directors has decided to postpone the merger until market conditions improve.', 'The board of directors have decides to postpone the merger until market conditions improve.', 'The board of directors had decided to postpone the merger until market conditions improve.', 'No change needed'], correct: 0, explanation: '"Board" is a collective noun acting as a single unit, so it takes the singular verb "has decided."' },
  { id: 48, domain: 'D3', difficulty: 'Hard', passage: 'Having completed the experiment, the results were recorded carefully in the laboratory notebook and then submitted to the supervising professor for review.', question: 'Which revision corrects the dangling modifier?', options: ['Having completed the experiment, the researchers recorded the results carefully in the laboratory notebook and submitted them to the supervising professor.', 'Having completed the experiment, the results were carefully recorded in the laboratory notebook and submitted.', 'The results, having completed the experiment, were recorded carefully and then submitted.', 'No change needed'], correct: 0, explanation: 'The original implies the results completed the experiment. Adding "the researchers" gives the modifier a proper subject.' },
  { id: 49, domain: 'D4', difficulty: 'Medium', passage: 'The human brain is remarkably adaptable. _______ this neuroplasticity allows people to recover from strokes, learn new languages in adulthood, and adapt to sensory loss by strengthening other senses.', question: 'Which transition best fits here?', options: ['However,', 'In contrast,', 'This adaptability, known as neuroplasticity,', 'Despite this,'], correct: 2, explanation: 'The second sentence elaborates on the brain\'s adaptability. "This adaptability, known as neuroplasticity," creates a smooth connection and introduces the technical term.' },
  { id: 50, domain: 'D4', difficulty: 'Hard', passage: 'Many historians argue that World War I was the direct cause of World War II. _______, others contend that the seeds of the second conflict were planted decades earlier by colonial competition, nationalism, and industrial rivalry that predated the first war entirely.', question: 'Which transition best fits here?', options: ['Similarly', 'Furthermore', 'In contrast', 'As a result'], correct: 2, explanation: '"In contrast" introduces the opposing scholarly perspective. The two positions presented are contradictory, requiring a contrasting transition.' },
];

const TIMER_DURATION = 45;

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
  const [shuffledQ] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
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