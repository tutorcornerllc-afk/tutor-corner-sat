import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
    Animated, SafeAreaView, ScrollView, StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';

const QUESTIONS = [
  { id: 1, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'She returned back to her hometown after many years abroad.', words: ['She', 'returned', 'back', 'to', 'her', 'hometown', 'after', 'many', 'years', 'abroad.'], errorIndex: 2, explanation: '"Returned" already means to go back. "Back" is redundant and should be removed.' },
  { id: 2, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The end result of the experiment was completely unexpected.', words: ['The', 'end', 'result', 'of', 'the', 'experiment', 'was', 'completely', 'unexpected.'], errorIndex: 1, explanation: '"Result" already implies an end. "End" is redundant here.' },
  { id: 3, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'Please revert back to the original settings on your device.', words: ['Please', 'revert', 'back', 'to', 'the', 'original', 'settings', 'on', 'your', 'device.'], errorIndex: 2, explanation: '"Revert" means to go back. "Back" is redundant.' },
  { id: 4, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The two twins looked remarkably similar to each other.', words: ['The', 'two', 'twins', 'looked', 'remarkably', 'similar', 'to', 'each', 'other.'], errorIndex: 1, explanation: '"Twins" already means two people. "Two" is redundant.' },
  { id: 5, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'He made an unexpected surprise appearance at the party.', words: ['He', 'made', 'an', 'unexpected', 'surprise', 'appearance', 'at', 'the', 'party.'], errorIndex: 3, explanation: '"Surprise" already implies unexpected. "Unexpected" is redundant.' },
  { id: 6, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'They decided to cooperate together on the new research project.', words: ['They', 'decided', 'to', 'cooperate', 'together', 'on', 'the', 'new', 'research', 'project.'], errorIndex: 4, explanation: '"Cooperate" already means to work together. "Together" is redundant.' },
  { id: 7, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The forward progress of the team was remarkable this season.', words: ['The', 'forward', 'progress', 'of', 'the', 'team', 'was', 'remarkable', 'this', 'season.'], errorIndex: 1, explanation: '"Progress" already implies moving forward. "Forward" is redundant.' },
  { id: 8, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'She gave a free gift to every customer who visited the store.', words: ['She', 'gave', 'a', 'free', 'gift', 'to', 'every', 'customer', 'who', 'visited', 'the', 'store.'], errorIndex: 3, explanation: 'A "gift" is by definition free. "Free" is redundant.' },
  { id: 9, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The ATM machine dispensed the cash quickly and efficiently.', words: ['The', 'ATM', 'machine', 'dispensed', 'the', 'cash', 'quickly', 'and', 'efficiently.'], errorIndex: 2, explanation: 'ATM stands for "Automated Teller Machine." "Machine" is redundant.' },
  { id: 10, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'They merged together the two departments into one division.', words: ['They', 'merged', 'together', 'the', 'two', 'departments', 'into', 'one', 'division.'], errorIndex: 2, explanation: '"Merge" already means to combine together. "Together" is redundant.' },
  { id: 11, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The newborn baby was brought home from the hospital yesterday.', words: ['The', 'newborn', 'baby', 'was', 'brought', 'home', 'from', 'the', 'hospital', 'yesterday.'], errorIndex: 1, explanation: '"Baby" already implies newborn in most contexts. "Newborn" is redundant when followed by "baby."' },
  { id: 12, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'Please rise up from your seats when the judge enters the courtroom.', words: ['Please', 'rise', 'up', 'from', 'your', 'seats', 'when', 'the', 'judge', 'enters', 'the', 'courtroom.'], errorIndex: 2, explanation: '"Rise" already means to move upward. "Up" is redundant.' },
  { id: 13, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The basic fundamentals of mathematics are taught in elementary school.', words: ['The', 'basic', 'fundamentals', 'of', 'mathematics', 'are', 'taught', 'in', 'elementary', 'school.'], errorIndex: 1, explanation: '"Fundamentals" already means basic principles. "Basic" is redundant.' },
  { id: 14, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'In my personal opinion, the new policy will benefit everyone involved.', words: ['In', 'my', 'personal', 'opinion,', 'the', 'new', 'policy', 'will', 'benefit', 'everyone', 'involved.'], errorIndex: 2, explanation: 'An opinion is by definition personal. "Personal" is redundant before "opinion."' },
  { id: 15, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'She made a written note of all the important details discussed.', words: ['She', 'made', 'a', 'written', 'note', 'of', 'all', 'the', 'important', 'details', 'discussed.'], errorIndex: 3, explanation: 'A "note" is by definition written. "Written" is redundant.' },
  { id: 16, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The exact same procedure was followed in both experiments conducted.', words: ['The', 'exact', 'same', 'procedure', 'was', 'followed', 'in', 'both', 'experiments', 'conducted.'], errorIndex: 1, explanation: '"Same" already means identical. "Exact" is redundant before "same."' },
  { id: 17, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'He repeated the same mistake twice in a single afternoon.', words: ['He', 'repeated', 'the', 'same', 'mistake', 'twice', 'in', 'a', 'single', 'afternoon.'], errorIndex: 3, explanation: '"Repeated" already implies doing something again. "Same" adds no meaning here.' },
  { id: 18, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The past history of the region is documented in the museum.', words: ['The', 'past', 'history', 'of', 'the', 'region', 'is', 'documented', 'in', 'the', 'museum.'], errorIndex: 1, explanation: '"History" already refers to the past. "Past" is redundant.' },
  { id: 19, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'They assembled together in the auditorium for the annual ceremony.', words: ['They', 'assembled', 'together', 'in', 'the', 'auditorium', 'for', 'the', 'annual', 'ceremony.'], errorIndex: 2, explanation: '"Assemble" already means to gather together. "Together" is redundant.' },
  { id: 20, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The new innovation in battery technology will revolutionize transportation.', words: ['The', 'new', 'innovation', 'in', 'battery', 'technology', 'will', 'revolutionize', 'transportation.'], errorIndex: 1, explanation: '"Innovation" already implies something new. "New" is redundant.' },
  { id: 21, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'Please respond back to this email within twenty-four hours.', words: ['Please', 'respond', 'back', 'to', 'this', 'email', 'within', 'twenty-four', 'hours.'], errorIndex: 2, explanation: '"Respond" already implies replying. "Back" is redundant.' },
  { id: 22, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The future plans of the company include expanding into new markets.', words: ['The', 'future', 'plans', 'of', 'the', 'company', 'include', 'expanding', 'into', 'new', 'markets.'], errorIndex: 1, explanation: '"Plans" already refer to future intentions. "Future" is redundant.' },
  { id: 23, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'She nodded her head in agreement when asked about the proposal.', words: ['She', 'nodded', 'her', 'head', 'in', 'agreement', 'when', 'asked', 'about', 'the', 'proposal.'], errorIndex: 3, explanation: '"Nodded" already implies moving the head. "Head" is redundant.' },
  { id: 24, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The visible appearance of the building was dramatically altered.', words: ['The', 'visible', 'appearance', 'of', 'the', 'building', 'was', 'dramatically', 'altered.'], errorIndex: 1, explanation: '"Appearance" already refers to what is visible. "Visible" is redundant.' },
  { id: 25, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The biography of her life was published to great critical acclaim.', words: ['The', 'biography', 'of', 'her', 'life', 'was', 'published', 'to', 'great', 'critical', 'acclaim.'], errorIndex: 4, explanation: 'A "biography" is by definition the story of someone\'s life. "Life" is redundant.' },
  { id: 26, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'Scientists are studying the HIV virus to develop more effective treatments.', words: ['Scientists', 'are', 'studying', 'the', 'HIV', 'virus', 'to', 'develop', 'more', 'effective', 'treatments.'], errorIndex: 5, explanation: 'HIV stands for "Human Immunodeficiency Virus." "Virus" is redundant.' },
  { id: 27, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The general consensus of opinion favored the proposed reform.', words: ['The', 'general', 'consensus', 'of', 'opinion', 'favored', 'the', 'proposed', 'reform.'], errorIndex: 1, explanation: '"Consensus" already means general agreement of opinion. "General" is redundant.' },
  { id: 28, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'Each individual student is responsible for submitting their own work.', words: ['Each', 'individual', 'student', 'is', 'responsible', 'for', 'submitting', 'their', 'own', 'work.'], errorIndex: 1, explanation: '"Each" already refers to individual members. "Individual" is redundant.' },
  { id: 29, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The added bonus of the new contract was the additional vacation days.', words: ['The', 'added', 'bonus', 'of', 'the', 'new', 'contract', 'was', 'the', 'additional', 'vacation', 'days.'], errorIndex: 1, explanation: 'A "bonus" is by definition something added. "Added" is redundant.' },
  { id: 30, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'They made advance reservations at the restaurant months before the event.', words: ['They', 'made', 'advance', 'reservations', 'at', 'the', 'restaurant', 'months', 'before', 'the', 'event.'], errorIndex: 2, explanation: '"Reservations" are by definition made in advance. "Advance" is redundant.' },
  { id: 31, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The close proximity of the two schools made carpooling very convenient.', words: ['The', 'close', 'proximity', 'of', 'the', 'two', 'schools', 'made', 'carpooling', 'very', 'convenient.'], errorIndex: 1, explanation: '"Proximity" already means nearness or closeness. "Close" is redundant.' },
  { id: 32, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'Please provide your PIN number at the security checkpoint entrance.', words: ['Please', 'provide', 'your', 'PIN', 'number', 'at', 'the', 'security', 'checkpoint', 'entrance.'], errorIndex: 4, explanation: 'PIN stands for "Personal Identification Number." "Number" is redundant.' },
  { id: 33, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The students were asked to divide up the work equally among themselves.', words: ['The', 'students', 'were', 'asked', 'to', 'divide', 'up', 'the', 'work', 'equally', 'among', 'themselves.'], errorIndex: 6, explanation: '"Divide" already means to split up. "Up" is redundant.' },
  { id: 34, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'She descended down the staircase carefully holding the railing.', words: ['She', 'descended', 'down', 'the', 'staircase', 'carefully', 'holding', 'the', 'railing.'], errorIndex: 2, explanation: '"Descend" already means to go down. "Down" is redundant.' },
  { id: 35, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The absolutely essential requirement is a valid government-issued ID.', words: ['The', 'absolutely', 'essential', 'requirement', 'is', 'a', 'valid', 'government-issued', 'ID.'], errorIndex: 1, explanation: '"Essential" already means absolutely necessary. "Absolutely" is redundant intensifier.' },
  { id: 36, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'He gave a brief summary of the entire report in five minutes.', words: ['He', 'gave', 'a', 'brief', 'summary', 'of', 'the', 'entire', 'report', 'in', 'five', 'minutes.'], errorIndex: 3, explanation: 'A "summary" is by definition brief. "Brief" is redundant.' },
  { id: 37, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The annual event is held once every year in the city center.', words: ['The', 'annual', 'event', 'is', 'held', 'once', 'every', 'year', 'in', 'the', 'city', 'center.'], errorIndex: 1, explanation: '"Annual" already means once every year. "Once every year" makes "annual" redundant.' },
  { id: 38, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'We must continue to persist in our efforts despite the many obstacles.', words: ['We', 'must', 'continue', 'to', 'persist', 'in', 'our', 'efforts', 'despite', 'the', 'many', 'obstacles.'], errorIndex: 2, explanation: '"Persist" already means to continue. "Continue to" before "persist" is redundant.' },
  { id: 39, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The two organizations decided to join together for a mutual partnership.', words: ['The', 'two', 'organizations', 'decided', 'to', 'join', 'together', 'for', 'a', 'mutual', 'partnership.'], errorIndex: 9, explanation: '"Partnership" already implies mutual benefit. "Mutual" is redundant.' },
  { id: 40, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'They chose to boycott against the company due to unethical practices.', words: ['They', 'chose', 'to', 'boycott', 'against', 'the', 'company', 'due', 'to', 'unethical', 'practices.'], errorIndex: 4, explanation: '"Boycott" already means to protest against. "Against" is redundant.' },
  { id: 41, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The report was completely finished and ready for submission last Monday.', words: ['The', 'report', 'was', 'completely', 'finished', 'and', 'ready', 'for', 'submission', 'last', 'Monday.'], errorIndex: 3, explanation: '"Finished" already means completely done. "Completely" is a redundant intensifier here.' },
  { id: 42, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'He wrote his autobiography about his own life experiences and challenges.', words: ['He', 'wrote', 'his', 'autobiography', 'about', 'his', 'own', 'life', 'experiences', 'and', 'challenges.'], errorIndex: 6, explanation: 'An autobiography is by definition about one\'s own life. "Own" is redundant.' },
  { id: 43, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The oral presentation must be delivered verbally to the entire class.', words: ['The', 'oral', 'presentation', 'must', 'be', 'delivered', 'verbally', 'to', 'the', 'entire', 'class.'], errorIndex: 1, explanation: '"Oral" already means spoken/verbal. "Verbally" is redundant.' },
  { id: 44, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'The sum total of all expenses exceeded the original budget by far.', words: ['The', 'sum', 'total', 'of', 'all', 'expenses', 'exceeded', 'the', 'original', 'budget', 'by', 'far.'], errorIndex: 1, explanation: '"Total" already means the complete sum. "Sum" is redundant.' },
  { id: 45, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'She is a trained professional with years of experience in the field.', words: ['She', 'is', 'a', 'trained', 'professional', 'with', 'years', 'of', 'experience', 'in', 'the', 'field.'], errorIndex: 3, explanation: 'A "professional" is by definition trained. "Trained" is redundant.' },
  { id: 46, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The original prototype was first designed by a team of engineers.', words: ['The', 'original', 'prototype', 'was', 'first', 'designed', 'by', 'a', 'team', 'of', 'engineers.'], errorIndex: 1, explanation: 'A "prototype" is by definition the original model. "Original" is redundant.' },
  { id: 47, domain: 'D4', difficulty: 'Easy', instruction: 'Tap the redundant or unnecessary word', sentence: 'He raised up his hand to ask a question during the lecture.', words: ['He', 'raised', 'up', 'his', 'hand', 'to', 'ask', 'a', 'question', 'during', 'the', 'lecture.'], errorIndex: 2, explanation: '"Raise" already means to lift upward. "Up" is redundant.' },
  { id: 48, domain: 'D4', difficulty: 'Medium', instruction: 'Tap the redundant or unnecessary word', sentence: 'The postponed event has been delayed until further notice from organizers.', words: ['The', 'postponed', 'event', 'has', 'been', 'delayed', 'until', 'further', 'notice', 'from', 'organizers.'], errorIndex: 1, explanation: '"Postponed" and "delayed" mean the same thing. "Postponed" is redundant.' },
  { id: 49, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The campus is completely surrounded on all sides by a security fence.', words: ['The', 'campus', 'is', 'completely', 'surrounded', 'on', 'all', 'sides', 'by', 'a', 'security', 'fence.'], errorIndex: 5, explanation: '"Surrounded" already means enclosed on all sides. "On all sides" is redundant.' },
  { id: 50, domain: 'D4', difficulty: 'Hard', instruction: 'Tap the redundant or unnecessary word', sentence: 'The false pretense used to gain entry was discovered by security personnel.', words: ['The', 'false', 'pretense', 'used', 'to', 'gain', 'entry', 'was', 'discovered', 'by', 'security', 'personnel.'], errorIndex: 1, explanation: 'A "pretense" is by definition false or deceptive. "False" is redundant.' },
];

const TIMER_DURATION = 45;

export default function PolishUpScreen() {
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
  const gemAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gemAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(gemAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
      sentence: q.sentence,
      userWord: q.words[index],
      correctWord: q.words[q.errorIndex],
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setCurrentQ(q => q + 1);
      setAnswered(false);
      setSelectedWord(null);
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
  const gemScale = gemAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(4, finalScore, xpEarned, 'rw_d4', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  

  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 💎</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewSentence}>{a.sentence}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                You tapped: "{a.userWord}" {a.isCorrect ? '✅' : '❌'}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>✅ Remove: "{a.correctWord}"</Text>}
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Polish Up</Text>
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
              <Text style={styles.gameTitle}>💎 Polish Up</Text>
              <Text style={styles.gameSubtitle}>D4 · Expression of Ideas</Text>
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

          {/* Status Row */}
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
            <View style={[styles.qCounterBox, { backgroundColor: '#7C3AED20' }]}>
              <Text style={[styles.qCounter, { color: '#7C3AED' }]}>{currentQ + 1}/{shuffledQ.length}</Text>
            </View>
          </View>

          {/* Gem Animation */}
          <View style={styles.gemContainer}>
            <Animated.Text style={[styles.gemEmoji, { transform: [{ scale: gemScale }] }]}>💎</Animated.Text>
            <Text style={styles.gemLabel}>Polish the sentence — remove the unnecessary word!</Text>
          </View>

          {/* Domain Badge */}
          <View style={styles.domainRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>✨ {q.domain} · {q.difficulty}</Text>
            </View>
          </View>

          {/* Sentence with tappable words */}
          <View style={styles.sentenceBox}>
            <Text style={styles.sentenceLabel}>TAP THE REDUNDANT WORD</Text>
            <View style={styles.wordsContainer}>
              {q.words.map((word, index) => {
                let bgColor = '#2D2D4420';
                let borderColor = '#7C3AED50';
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
                    style={[styles.wordPill, { backgroundColor: bgColor, borderColor, borderWidth: 1.5 }]}
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

          {/* Hint */}
          {!answered && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>💡 Which word is unnecessary? Tap it to remove it!</Text>
            </View>
          )}

          {/* Explanation */}
          {answered && (
            <View style={[styles.explanationBox, {
              borderColor: selectedWord === q.errorIndex ? '#10B981' : '#EF4444',
              backgroundColor: selectedWord === q.errorIndex ? '#10B98115' : '#EF444415',
            }]}>
              <Text style={[styles.explanationTitle, { color: selectedWord === q.errorIndex ? '#10B981' : '#EF4444' }]}>
                {selectedWord === q.errorIndex ? '✅ Polished!' : '❌ Not quite!'}
              </Text>
              <Text style={styles.explanationText}>{q.explanation}</Text>
            </View>
          )}

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
  safe: { flex: 1, backgroundColor: '#0F0A1E' },
  container: { flex: 1, paddingHorizontal: 20 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 16, gap: 12 },
  pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED50' },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#A78BFA', fontWeight: '700' },
  scoreBox: { backgroundColor: '#7C3AED20', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#A78BFA' },
  scoreLabel: { fontSize: 10, color: '#A78BFA', fontWeight: '600' },
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
  gemContainer: { alignItems: 'center', marginBottom: 16 },
  gemEmoji: { fontSize: 48, marginBottom: 8 },
  gemLabel: { fontSize: 14, color: '#A78BFA', fontWeight: '600', textAlign: 'center' },
  domainRow: { marginBottom: 12 },
  domainBadge: { backgroundColor: '#7C3AED20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#7C3AED40' },
  domainText: { fontSize: 13, color: '#A78BFA', fontWeight: '700' },
  sentenceBox: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#7C3AED30' },
  sentenceLabel: { fontSize: 11, color: '#A78BFA', fontWeight: '800', letterSpacing: 1, marginBottom: 14 },
  wordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  wordText: { fontSize: 17, fontWeight: '600' },
  hintBox: { backgroundColor: '#7C3AED15', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#7C3AED30' },
  hintText: { fontSize: 14, color: '#A78BFA', fontWeight: '600', textAlign: 'center' },
  explanationBox: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1.5 },
  explanationTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  explanationText: { fontSize: 15, color: '#E2E8F0', lineHeight: 24 },
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewSentence: { fontSize: 14, color: '#9CA3AF', lineHeight: 22, marginBottom: 8, fontStyle: 'italic' },
  reviewAnswer: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#A78BFA', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#0F0F1A', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#7C3AED' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#7C3AED15', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' },
  xpTitle: { fontSize: 16, color: '#A78BFA', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#A78BFA', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#7C3AED', fontWeight: '700' },
  continueBtn: { backgroundColor: '#7C3AED', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 8 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#3D3D5C' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center' },
  pauseCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED50' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#7C3AED', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});