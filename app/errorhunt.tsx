import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
  Animated, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';

const QUESTIONS = [
  { id: 1, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the punctuation error', sentence: 'The students who studied consistently throughout the semester, performed significantly better on their final exams.', words: ['The', 'students', 'who', 'studied', 'consistently', 'throughout', 'the', 'semester,', 'performed', 'significantly', 'better', 'on', 'their', 'final', 'exams.'], errorIndex: 7, errorType: 'punctuation', explanation: 'The comma after "semester" is incorrect. The clause "who studied consistently throughout the semester" is a restrictive clause and should not be separated from the main clause by a comma.' },
  { id: 2, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'Every summer, my family visits aunt Martha in chicago for a week.', words: ['Every', 'summer,', 'my', 'family', 'visits', 'aunt', 'Martha', 'in', 'chicago', 'for', 'a', 'week.'], errorIndex: 8, errorType: 'capitalization', explanation: '"Chicago" is a proper noun (city name) and must always be capitalized.' },
  { id: 3, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the repeated word', sentence: 'The the quick brown fox jumped over the lazy dog near the river.', words: ['The', 'the', 'quick', 'brown', 'fox', 'jumped', 'over', 'the', 'lazy', 'dog', 'near', 'the', 'river.'], errorIndex: 1, errorType: 'repeated', explanation: '"The" is repeated at the beginning of the sentence. Only one "The" is needed.' },
  { id: 4, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the punctuation error', sentence: 'She bought apples oranges, and bananas at the farmers market.', words: ['She', 'bought', 'apples', 'oranges,', 'and', 'bananas', 'at', 'the', 'farmers', 'market.'], errorIndex: 2, errorType: 'punctuation', explanation: 'In a list of three or more items, a comma should follow each item. "Apples" needs a comma after it.' },
  { id: 5, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'Last tuesday, the President gave a speech about economic reform.', words: ['Last', 'tuesday,', 'the', 'President', 'gave', 'a', 'speech', 'about', 'economic', 'reform.'], errorIndex: 1, errorType: 'capitalization', explanation: 'Days of the week are proper nouns and must always be capitalized. "Tuesday" should be capitalized.' },
  { id: 6, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the punctuation error', sentence: 'Its important to check your work before submitting the final assignment.', words: ['Its', 'important', 'to', 'check', 'your', 'work', 'before', 'submitting', 'the', 'final', 'assignment.'], errorIndex: 0, errorType: 'punctuation', explanation: '"Its" here is a contraction of "it is" and needs an apostrophe: "It\'s."' },
  { id: 7, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the repeated word', sentence: 'The scientist carefully carefully recorded her observations in the laboratory notebook.', words: ['The', 'scientist', 'carefully', 'carefully', 'recorded', 'her', 'observations', 'in', 'the', 'laboratory', 'notebook.'], errorIndex: 3, errorType: 'repeated', explanation: '"Carefully" appears twice in a row. Only one instance is needed.' },
  { id: 8, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'We studied the french revolution in our history class this semester.', words: ['We', 'studied', 'the', 'french', 'revolution', 'in', 'our', 'history', 'class', 'this', 'semester.'], errorIndex: 3, errorType: 'capitalization', explanation: '"French" refers to a nationality and a specific historical event. As a proper adjective, it must be capitalized.' },
  { id: 9, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'The results were remarkable however the researchers remained cautious about drawing conclusions.', words: ['The', 'results', 'were', 'remarkable', 'however', 'the', 'researchers', 'remained', 'cautious', 'about', 'drawing', 'conclusions.'], errorIndex: 4, errorType: 'punctuation', explanation: '"However" used as a conjunctive adverb joining two independent clauses needs a semicolon before it and a comma after it.' },
  { id: 10, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'The following items are required: a pencil, an eraser a ruler, and a calculator.', words: ['The', 'following', 'items', 'are', 'required:', 'a', 'pencil,', 'an', 'eraser', 'a', 'ruler,', 'and', 'a', 'calculator.'], errorIndex: 8, errorType: 'punctuation', explanation: '"Eraser" is missing a comma after it. In a series, each item must be followed by a comma except the last.' },
  { id: 11, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the capitalization error', sentence: 'Dr. Johnson teaches biology and chemistry at westfield high school.', words: ['Dr.', 'Johnson', 'teaches', 'biology', 'and', 'chemistry', 'at', 'westfield', 'high', 'school.'], errorIndex: 7, errorType: 'capitalization', explanation: '"Westfield" is part of a proper noun (the name of a specific school) and must be capitalized.' },
  { id: 12, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the repeated word', sentence: 'The board of directors decided to to postpone the merger until market conditions improved.', words: ['The', 'board', 'of', 'directors', 'decided', 'to', 'to', 'postpone', 'the', 'merger', 'until', 'market', 'conditions', 'improved.'], errorIndex: 6, errorType: 'repeated', explanation: '"To" appears twice in a row. Only one "to" is needed before "postpone."' },
  { id: 13, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'Although she had studied for weeks she still felt nervous before the examination.', words: ['Although', 'she', 'had', 'studied', 'for', 'weeks', 'she', 'still', 'felt', 'nervous', 'before', 'the', 'examination.'], errorIndex: 5, errorType: 'punctuation', explanation: 'When an introductory subordinate clause precedes the main clause, it should be followed by a comma. "Weeks" needs a comma after it.' },
  { id: 14, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the capitalization error', sentence: 'The amazon river is the largest river by discharge volume in the world.', words: ['The', 'amazon', 'river', 'is', 'the', 'largest', 'river', 'by', 'discharge', 'volume', 'in', 'the', 'world.'], errorIndex: 1, errorType: 'capitalization', explanation: '"Amazon" is a proper noun (the name of a specific river) and must always be capitalized.' },
  { id: 15, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'The childrens toys were scattered across the living room floor after the party.', words: ['The', 'childrens', 'toys', 'were', 'scattered', 'across', 'the', 'living', 'room', 'floor', 'after', 'the', 'party.'], errorIndex: 1, errorType: 'punctuation', explanation: '"Children\'s" needs an apostrophe to show possession.' },
  { id: 16, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the redundant word', sentence: 'In my opinion, I personally think that the new policy will have negative consequences.', words: ['In', 'my', 'opinion,', 'I', 'personally', 'think', 'that', 'the', 'new', 'policy', 'will', 'have', 'negative', 'consequences.'], errorIndex: 4, errorType: 'redundancy', explanation: '"In my opinion" and "I personally think" are redundant. "Personally" is the unnecessary repetition.' },
  { id: 17, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'The experiment which had taken three years to design produced results that surprised even its creators.', words: ['The', 'experiment', 'which', 'had', 'taken', 'three', 'years', 'to', 'design', 'produced', 'results', 'that', 'surprised', 'even', 'its', 'creators.'], errorIndex: 2, errorType: 'punctuation', explanation: '"Which" introduces a nonrestrictive clause and must be preceded by a comma.' },
  { id: 18, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the capitalization error', sentence: 'The treaty of versailles formally ended World War I in 1919.', words: ['The', 'treaty', 'of', 'versailles', 'formally', 'ended', 'World', 'War', 'I', 'in', '1919.'], errorIndex: 3, errorType: 'capitalization', explanation: '"Versailles" is a proper noun and part of the treaty\'s official name. It must be capitalized.' },
  { id: 19, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'Three factors contributed to the company\'s success: strong leadership effective communication, and a commitment to innovation.', words: ['Three', 'factors', 'contributed', 'to', 'the', "company's", 'success:', 'strong', 'leadership', 'effective', 'communication,', 'and', 'a', 'commitment', 'to', 'innovation.'], errorIndex: 8, errorType: 'punctuation', explanation: '"Leadership" needs a comma after it. In a series following a colon, each item must be separated by commas.' },
  { id: 20, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the repeated word', sentence: 'The researchers concluded that the new vaccine was was both safe and effective in clinical trials.', words: ['The', 'researchers', 'concluded', 'that', 'the', 'new', 'vaccine', 'was', 'was', 'both', 'safe', 'and', 'effective', 'in', 'clinical', 'trials.'], errorIndex: 8, errorType: 'repeated', explanation: '"Was" appears twice in a row. Only one "was" is needed.' },
  { id: 21, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'My favorite subject in school is english because I love reading and writing.', words: ['My', 'favorite', 'subject', 'in', 'school', 'is', 'english', 'because', 'I', 'love', 'reading', 'and', 'writing.'], errorIndex: 6, errorType: 'capitalization', explanation: '"English" refers to a specific language. As a proper noun, it must be capitalized.' },
  { id: 22, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the punctuation error', sentence: 'My sister who lives in Boston is visiting us next weekend for the holidays.', words: ['My', 'sister', 'who', 'lives', 'in', 'Boston', 'is', 'visiting', 'us', 'next', 'weekend', 'for', 'the', 'holidays.'], errorIndex: 2, errorType: 'punctuation', explanation: '"Who lives in Boston" is nonrestrictive and needs commas around it. A comma is needed before "who."' },
  { id: 23, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the capitalization error', sentence: 'Einstein published his theory of special relativity in the journal annalen der physik in 1905.', words: ['Einstein', 'published', 'his', 'theory', 'of', 'special', 'relativity', 'in', 'the', 'journal', 'annalen', 'der', 'physik', 'in', '1905.'], errorIndex: 10, errorType: 'capitalization', explanation: '"Annalen der Physik" is the proper name of a specific journal and must be capitalized.' },
  { id: 24, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'The professor asked the students to read chapters four five and six before next class.', words: ['The', 'professor', 'asked', 'the', 'students', 'to', 'read', 'chapters', 'four', 'five', 'and', 'six', 'before', 'next', 'class.'], errorIndex: 8, errorType: 'punctuation', explanation: '"Four" needs a comma after it. Items in a series must be separated by commas.' },
  { id: 25, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'The scientists findings which contradicted decades of accepted research were initially dismissed by the academic community.', words: ['The', 'scientists', 'findings', 'which', 'contradicted', 'decades', 'of', 'accepted', 'research', 'were', 'initially', 'dismissed', 'by', 'the', 'academic', 'community.'], errorIndex: 1, errorType: 'punctuation', explanation: '"Scientists" needs an apostrophe to show possession: "scientist\'s findings."' },
  { id: 26, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'We visited the statue of liberty during our trip to new york city last summer.', words: ['We', 'visited', 'the', 'statue', 'of', 'liberty', 'during', 'our', 'trip', 'to', 'new', 'york', 'city', 'last', 'summer.'], errorIndex: 3, errorType: 'capitalization', explanation: '"Statue of Liberty" is a proper noun. All words in the name must be capitalized.' },
  { id: 27, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the repeated word', sentence: 'The new new policy requires all employees to complete a safety training course annually.', words: ['The', 'new', 'new', 'policy', 'requires', 'all', 'employees', 'to', 'complete', 'a', 'safety', 'training', 'course', 'annually.'], errorIndex: 2, errorType: 'repeated', explanation: '"New" appears twice in a row. Only one "new" is needed.' },
  { id: 28, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'Having reviewed all the evidence the jury reached a unanimous verdict after three days of deliberation.', words: ['Having', 'reviewed', 'all', 'the', 'evidence', 'the', 'jury', 'reached', 'a', 'unanimous', 'verdict', 'after', 'three', 'days', 'of', 'deliberation.'], errorIndex: 4, errorType: 'punctuation', explanation: 'An introductory participial phrase must be followed by a comma. "Evidence" needs a comma after it.' },
  { id: 29, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the capitalization error', sentence: 'The great wall of china stretches over 13,000 miles across northern China.', words: ['The', 'great', 'wall', 'of', 'china', 'stretches', 'over', '13,000', 'miles', 'across', 'northern', 'China.'], errorIndex: 1, errorType: 'capitalization', explanation: '"Great Wall of China" is a proper noun. "Great" must be capitalized as part of the official name.' },
  { id: 30, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the punctuation error', sentence: 'Dont forget to bring your umbrella the weather forecast predicts heavy rain this afternoon.', words: ['Dont', 'forget', 'to', 'bring', 'your', 'umbrella', 'the', 'weather', 'forecast', 'predicts', 'heavy', 'rain', 'this', 'afternoon.'], errorIndex: 0, errorType: 'punctuation', explanation: '"Don\'t" is a contraction and requires an apostrophe between "n" and "t."' },
  { id: 31, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the capitalization error', sentence: 'Shakespeare wrote hamlet, one of the most famous plays in the english language.', words: ['Shakespeare', 'wrote', 'hamlet,', 'one', 'of', 'the', 'most', 'famous', 'plays', 'in', 'the', 'english', 'language.'], errorIndex: 2, errorType: 'capitalization', explanation: '"Hamlet" is the title of a specific literary work and must be capitalized.' },
  { id: 32, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'The CEO stated that the companys profits had increased by 40% in the third quarter.', words: ['The', 'CEO', 'stated', 'that', 'the', 'companys', 'profits', 'had', 'increased', 'by', '40%', 'in', 'the', 'third', 'quarter.'], errorIndex: 5, errorType: 'punctuation', explanation: '"Company\'s" needs an apostrophe to show possession.' },
  { id: 33, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the repeated word', sentence: 'Please make sure to to submit your application before the deadline on Friday.', words: ['Please', 'make', 'sure', 'to', 'to', 'submit', 'your', 'application', 'before', 'the', 'deadline', 'on', 'Friday.'], errorIndex: 4, errorType: 'repeated', explanation: '"To" is repeated unnecessarily. Only one "to" is needed before "submit."' },
  { id: 34, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'The authors argument which spans three chapters is both compelling and well-supported.', words: ['The', 'authors', 'argument', 'which', 'spans', 'three', 'chapters', 'is', 'both', 'compelling', 'and', 'well-supported.'], errorIndex: 1, errorType: 'punctuation', explanation: '"Author\'s" requires an apostrophe to show possession.' },
  { id: 35, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the capitalization error', sentence: 'The declaration of independence was signed on july 4, 1776, in Philadelphia.', words: ['The', 'declaration', 'of', 'independence', 'was', 'signed', 'on', 'july', '4,', '1776,', 'in', 'Philadelphia.'], errorIndex: 1, errorType: 'capitalization', explanation: '"Declaration of Independence" is the official name of a historical document and must be fully capitalized.' },
  { id: 36, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the punctuation error', sentence: 'We need to buy milk eggs bread, and butter from the grocery store today.', words: ['We', 'need', 'to', 'buy', 'milk', 'eggs', 'bread,', 'and', 'butter', 'from', 'the', 'grocery', 'store', 'today.'], errorIndex: 4, errorType: 'punctuation', explanation: '"Milk" needs a comma after it. Items in a series must each be separated by commas.' },
  { id: 37, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the repeated word', sentence: 'The committee will will meet next Thursday to discuss the proposed changes to the budget.', words: ['The', 'committee', 'will', 'will', 'meet', 'next', 'Thursday', 'to', 'discuss', 'the', 'proposed', 'changes', 'to', 'the', 'budget.'], errorIndex: 3, errorType: 'repeated', explanation: '"Will" is repeated unnecessarily. Only one "will" is needed before "meet."' },
  { id: 38, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'To succeed in todays competitive market companies must innovate adapt and embrace new technologies.', words: ['To', 'succeed', 'in', 'todays', 'competitive', 'market', 'companies', 'must', 'innovate', 'adapt', 'and', 'embrace', 'new', 'technologies.'], errorIndex: 3, errorType: 'punctuation', explanation: '"Today\'s" needs an apostrophe to show possession.' },
  { id: 39, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'My brother is studying medicine at johns hopkins university in baltimore.', words: ['My', 'brother', 'is', 'studying', 'medicine', 'at', 'johns', 'hopkins', 'university', 'in', 'baltimore.'], errorIndex: 6, errorType: 'capitalization', explanation: '"Johns Hopkins University" is the proper name of a specific institution and must be fully capitalized.' },
  { id: 40, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'The novel which was published in 1851 is considered one of the greatest works of american literature.', words: ['The', 'novel', 'which', 'was', 'published', 'in', '1851', 'is', 'considered', 'one', 'of', 'the', 'greatest', 'works', 'of', 'american', 'literature.'], errorIndex: 2, errorType: 'punctuation', explanation: '"Which" introduces a nonrestrictive clause and must be preceded by a comma.' },
  { id: 41, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the repeated word', sentence: 'The students were were required to submit their essays before midnight on Friday.', words: ['The', 'students', 'were', 'were', 'required', 'to', 'submit', 'their', 'essays', 'before', 'midnight', 'on', 'Friday.'], errorIndex: 3, errorType: 'repeated', explanation: '"Were" is repeated unnecessarily. Only one "were" is needed.' },
  { id: 42, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the capitalization error', sentence: 'The cold war between the united states and the soviet union lasted from 1947 to 1991.', words: ['The', 'cold', 'war', 'between', 'the', 'united', 'states', 'and', 'the', 'soviet', 'union', 'lasted', 'from', '1947', 'to', '1991.'], errorIndex: 1, errorType: 'capitalization', explanation: '"Cold War" is the proper name of a specific historical period and must be capitalized.' },
  { id: 43, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the punctuation error', sentence: 'Before submitting your application you should proofread it carefully at least twice.', words: ['Before', 'submitting', 'your', 'application', 'you', 'should', 'proofread', 'it', 'carefully', 'at', 'least', 'twice.'], errorIndex: 3, errorType: 'punctuation', explanation: 'An introductory phrase must be followed by a comma. "Application" needs a comma after it.' },
  { id: 44, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'We read the great gatsby in our AP english class during the spring semester.', words: ['We', 'read', 'the', 'great', 'gatsby', 'in', 'our', 'AP', 'english', 'class', 'during', 'the', 'spring', 'semester.'], errorIndex: 3, errorType: 'capitalization', explanation: '"The Great Gatsby" is a literary title. All words must be capitalized.' },
  { id: 45, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the repeated word', sentence: 'The museum features an impressive impressive collection of ancient Egyptian artifacts.', words: ['The', 'museum', 'features', 'an', 'impressive', 'impressive', 'collection', 'of', 'ancient', 'Egyptian', 'artifacts.'], errorIndex: 5, errorType: 'repeated', explanation: '"Impressive" is repeated unnecessarily. Only one "impressive" is needed.' },
  { id: 46, domain: 'D3', difficulty: 'Easy', instruction: 'Tap the capitalization error', sentence: 'The pacific ocean is the largest and deepest ocean on earth.', words: ['The', 'pacific', 'ocean', 'is', 'the', 'largest', 'and', 'deepest', 'ocean', 'on', 'earth.'], errorIndex: 1, errorType: 'capitalization', explanation: '"Pacific" is a proper adjective referring to a specific ocean. It must always be capitalized.' },
  { id: 47, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'The data suggests that students who read for pleasure consistently outperform their peers on standardized tests however many schools have reduced free reading time.', words: ['The', 'data', 'suggests', 'that', 'students', 'who', 'read', 'for', 'pleasure', 'consistently', 'outperform', 'their', 'peers', 'on', 'standardized', 'tests', 'however', 'many', 'schools', 'have', 'reduced', 'free', 'reading', 'time.'], errorIndex: 16, errorType: 'punctuation', explanation: '"However" as a conjunctive adverb needs a semicolon before it: "tests; however, many schools..."' },
  { id: 48, domain: 'D3', difficulty: 'Medium', instruction: 'Tap the capitalization error', sentence: 'According to nasa, the james webb space telescope has captured stunning images of distant galaxies.', words: ['According', 'to', 'nasa,', 'the', 'james', 'webb', 'space', 'telescope', 'has', 'captured', 'stunning', 'images', 'of', 'distant', 'galaxies.'], errorIndex: 4, errorType: 'capitalization', explanation: '"James Webb Space Telescope" is the proper name of a specific instrument. All words must be capitalized.' },
  { id: 49, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the punctuation error', sentence: 'The most effective leaders according to research are those who combine vision with the ability to listen.', words: ['The', 'most', 'effective', 'leaders', 'according', 'to', 'research', 'are', 'those', 'who', 'combine', 'vision', 'with', 'the', 'ability', 'to', 'listen.'], errorIndex: 4, errorType: 'punctuation', explanation: '"According to research" is a parenthetical phrase and must be set off by commas. A comma is needed before "according."' },
  { id: 50, domain: 'D3', difficulty: 'Hard', instruction: 'Tap the repeated word', sentence: 'The scientists scientists discovered a new species of deep-sea fish near the ocean floor.', words: ['The', 'scientists', 'scientists', 'discovered', 'a', 'new', 'species', 'of', 'deep-sea', 'fish', 'near', 'the', 'ocean', 'floor.'], errorIndex: 2, errorType: 'repeated', explanation: '"Scientists" is repeated unnecessarily. Only one "scientists" is needed.' },
];

const TIMER_DURATION = 45;

export default function ErrorHuntScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
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
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  function endGame() { clearInterval(timerRef.current); setGameState('results'); }

  function handleWordTap(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedWord(index);
    const q = shuffledQ[currentQ];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 6;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((6 - timeTaken) * 2)) : 0;
    const isCorrect = index === q.errorIndex;
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
      sentence: q.sentence, instruction: q.instruction,
      userWord: q.words[index], correctWord: q.words[q.errorIndex],
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setCurrentQ(q => q + 1); setAnswered(false); setSelectedWord(null);
      setQuestionStartTime(Date.now());
    }, 1800);
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
    setCurrentQ(0); setAnswered(false); setSelectedWord(null);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);

  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(3, finalScore, xpEarned, 'rw_d3', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 🔍</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewSentence}>{a.sentence}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                You tapped: "{a.userWord}" {a.isCorrect ? '✅' : '❌'}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>✅ Error was: "{a.correctWord}"</Text>}
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Error Hunt</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📈 Your History</Text>
            <Text style={styles.historySub}>Play more games to see your score history!</Text>
            <Text style={styles.historyRank}>Game #1 — Score: {finalScore}</Text>
          </View>
          {isDailyChallenge ? (
            <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace('/(tabs)' as any)}>
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
          <View style={styles.gameHeader}>
            <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
              <Text style={styles.pauseIcon}>⏸</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.gameTitle}>🔍 Error Hunt</Text>
              <Text style={styles.gameSubtitle}>D3 · Standard English</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNum}>{score}</Text>
              <Text style={styles.scoreLabel}>pts</Text>
            </View>
          </View>
          {floatingScore && (
            <Animated.Text style={[styles.floatingScore, { transform: [{ translateY: scoreAnim }] }]}>
              {floatingScore}
            </Animated.Text>
          )}
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
            <View style={[styles.qCounterBox, { backgroundColor: '#F9731620' }]}>
              <Text style={[styles.qCounter, { color: '#F97316' }]}>{currentQ + 1}/{shuffledQ.length}</Text>
            </View>
          </View>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionIcon}>🔍</Text>
            <Text style={styles.instructionText}>{q.instruction}</Text>
          </View>
          <View style={styles.domainRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>📝 {q.domain} · {q.difficulty} · {q.errorType}</Text>
            </View>
          </View>
          <View style={styles.sentenceBox}>
            <Text style={styles.sentenceLabel}>TAP THE ERROR</Text>
            <View style={styles.wordsContainer}>
              {q.words.map((word, index) => {
                let bgColor = 'transparent';
                let borderColor = 'transparent';
                let textColor = '#FFFFFF';
                if (answered) {
                  if (index === q.errorIndex) {
                    bgColor = '#10B98120'; borderColor = '#10B981'; textColor = '#10B981';
                  } else if (index === selectedWord && index !== q.errorIndex) {
                    bgColor = '#EF444420'; borderColor = '#EF4444'; textColor = '#EF4444';
                  }
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.wordPill, {
                      backgroundColor: answered ? bgColor : '#2D2D5020',
                      borderColor: answered ? borderColor : '#3D3D5C',
                      borderWidth: 1.5,
                    }]}
                    onPress={() => handleWordTap(index)}
                    disabled={answered}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.wordText, { color: textColor }]}>{word}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {!answered && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>💡 Tap the word that contains the {q.errorType} error</Text>
            </View>
          )}
          {answered && (
            <View style={[styles.explanationBox, {
              borderColor: selectedWord === q.errorIndex ? '#10B981' : '#EF4444',
              backgroundColor: selectedWord === q.errorIndex ? '#10B98115' : '#EF444415',
            }]}>
              <Text style={[styles.explanationTitle, { color: selectedWord === q.errorIndex ? '#10B981' : '#EF4444' }]}>
                {selectedWord === q.errorIndex ? '✅ Correct!' : '❌ Not quite!'}
              </Text>
              <Text style={styles.explanationText}>{q.explanation}</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
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
  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 16, gap: 12 },
  pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#F97316', fontWeight: '700' },
  scoreBox: { backgroundColor: '#F9731620', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#F97316' },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F97316' },
  scoreLabel: { fontSize: 10, color: '#F97316', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 24, top: 110, fontSize: 24, fontWeight: '900', color: '#10B981', zIndex: 100 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, backgroundColor: '#1A1A2E', borderRadius: 16, padding: 12 },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#2D2D44', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  qCounter: { fontSize: 14, fontWeight: '800' },
  instructionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9731615', borderRadius: 16, padding: 14, marginBottom: 10, gap: 10, borderWidth: 1, borderColor: '#F97316' },
  instructionIcon: { fontSize: 24 },
  instructionText: { fontSize: 17, fontWeight: '700', color: '#F97316', flex: 1 },
  domainRow: { marginBottom: 12 },
  domainBadge: { backgroundColor: '#2563EB20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#2563EB40' },
  domainText: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
  sentenceBox: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#3D3D5C' },
  sentenceLabel: { fontSize: 11, color: '#F97316', fontWeight: '800', letterSpacing: 1, marginBottom: 14 },
  wordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  wordText: { fontSize: 17, fontWeight: '600' },
  hintBox: { backgroundColor: '#2563EB15', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2563EB30' },
  hintText: { fontSize: 14, color: '#2563EB', fontWeight: '600', textAlign: 'center' },
  explanationBox: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1.5 },
  explanationTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  explanationText: { fontSize: 15, color: '#E2E8F0', lineHeight: 24 },
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewSentence: { fontSize: 14, color: '#9CA3AF', lineHeight: 22, marginBottom: 8, fontStyle: 'italic' },
  reviewAnswer: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#0F0F1A', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#2563EB' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#F9731615', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F97316' },
  xpTitle: { fontSize: 16, color: '#F97316', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#F97316', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#2563EB', fontWeight: '700' },
  continueBtn: { backgroundColor: '#F97316', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 8 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#3D3D5C' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center' },
  pauseCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#F97316', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});