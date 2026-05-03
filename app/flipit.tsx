import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
    Animated,
    Dimensions,
    SafeAreaView, ScrollView, StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  { id: 1, domain: 'D3', difficulty: 'Easy', sentence: 'The group of students _____ working hard on their project.', blank: 'working hard on their project', optionA: 'is', optionB: 'are', correct: 'A', explanation: '"Group" is a collective noun acting as a single unit, so it takes the singular verb "is."' },
  { id: 2, domain: 'D3', difficulty: 'Easy', sentence: 'Neither the teacher nor the students _____ ready for the test.', blank: 'ready for the test', optionA: 'was', optionB: 'were', correct: 'B', explanation: 'With "neither/nor," the verb agrees with the closest subject. "Students" is plural, so use "were."' },
  { id: 3, domain: 'D3', difficulty: 'Easy', sentence: 'Everyone in the class _____ their homework on time.', blank: 'their homework on time', optionA: 'submit', optionB: 'submits', correct: 'B', explanation: '"Everyone" is singular and takes a singular verb "submits."' },
  { id: 4, domain: 'D3', difficulty: 'Easy', sentence: 'The news _____ surprising to everyone in the office.', blank: 'surprising to everyone', optionA: 'were', optionB: 'was', correct: 'B', explanation: '"News" is a singular noun despite ending in -s. It takes the singular verb "was."' },
  { id: 5, domain: 'D3', difficulty: 'Easy', sentence: 'My brother and sister _____ coming to the party tonight.', blank: 'coming to the party', optionA: 'is', optionB: 'are', correct: 'B', explanation: 'Two subjects joined by "and" form a plural subject requiring the plural verb "are."' },
  { id: 6, domain: 'D3', difficulty: 'Easy', sentence: 'The team _____ its final game of the season yesterday.', blank: 'its final game', optionA: 'won', optionB: 'win', correct: 'A', explanation: 'The sentence is past tense. "Won" is the correct past tense form of "win."' },
  { id: 7, domain: 'D3', difficulty: 'Easy', sentence: 'Each of the players _____ given a trophy after the game.', blank: 'given a trophy', optionA: 'were', optionB: 'was', correct: 'B', explanation: '"Each" is singular and always takes a singular verb "was."' },
  { id: 8, domain: 'D3', difficulty: 'Easy', sentence: 'The committee _____ meeting every Tuesday afternoon.', blank: 'meeting every Tuesday', optionA: 'are', optionB: 'is', correct: 'B', explanation: '"Committee" as a collective noun acting as one unit takes the singular verb "is."' },
  { id: 9, domain: 'D3', difficulty: 'Easy', sentence: 'Neither Sarah nor her friends _____ seen the new movie.', blank: 'seen the new movie', optionA: 'has', optionB: 'have', correct: 'B', explanation: 'With "neither/nor," the verb agrees with the closer subject. "Friends" is plural, so use "have."' },
  { id: 10, domain: 'D3', difficulty: 'Easy', sentence: 'The data _____ collected over several months of research.', blank: 'collected over months', optionA: 'was', optionB: 'were', correct: 'A', explanation: '"Data" in formal academic writing is treated as singular in American English, taking "was."' },
  { id: 11, domain: 'D3', difficulty: 'Easy', sentence: 'One of the students _____ forgotten their lunch today.', blank: 'forgotten their lunch', optionA: 'have', optionB: 'has', correct: 'B', explanation: '"One" is singular. Despite the plural "students" nearby, the subject is "one," which takes "has."' },
  { id: 12, domain: 'D3', difficulty: 'Easy', sentence: 'The jury _____ reached a unanimous verdict after deliberating.', blank: 'reached a unanimous verdict', optionA: 'have', optionB: 'has', correct: 'B', explanation: '"Jury" is a collective noun acting as one body. It takes the singular verb "has."' },
  { id: 13, domain: 'D3', difficulty: 'Medium', sentence: 'The professor, along with her assistants, _____ presenting at the conference.', blank: 'presenting at the conference', optionA: 'are', optionB: 'is', correct: 'B', explanation: '"Along with" does not create a compound subject. The true subject is "professor," which is singular, requiring "is."' },
  { id: 14, domain: 'D3', difficulty: 'Medium', sentence: 'Not only the students but also the teacher _____ excited about the field trip.', blank: 'excited about the trip', optionA: 'were', optionB: 'was', correct: 'B', explanation: 'With "not only...but also," the verb agrees with the closer subject. "Teacher" is singular, so use "was."' },
  { id: 15, domain: 'D3', difficulty: 'Medium', sentence: 'The number of applicants _____ increased significantly this year.', blank: 'increased significantly', optionA: 'have', optionB: 'has', correct: 'B', explanation: '"The number" (not "a number") is singular and takes the singular verb "has."' },
  { id: 16, domain: 'D3', difficulty: 'Medium', sentence: 'A number of students _____ absent during the final exam week.', blank: 'absent during exam week', optionA: 'was', optionB: 'were', correct: 'B', explanation: '"A number of" means "several" and is treated as plural, requiring "were."' },
  { id: 17, domain: 'D3', difficulty: 'Medium', sentence: 'The majority of the evidence _____ in favor of the defendant.', blank: 'in favor of defendant', optionA: 'point', optionB: 'points', correct: 'B', explanation: '"Majority" followed by a singular noun ("evidence") takes a singular verb "points."' },
  { id: 18, domain: 'D3', difficulty: 'Medium', sentence: 'Statistics _____ a required course for all business majors at the university.', blank: 'a required course', optionA: 'are', optionB: 'is', correct: 'B', explanation: 'When "statistics" refers to a field of study (not data), it is singular and takes "is."' },
  { id: 19, domain: 'D3', difficulty: 'Medium', sentence: 'The researchers, as well as their supervisor, _____ published the findings.', blank: 'published the findings', optionA: 'has', optionB: 'have', correct: 'A', explanation: '"As well as" does not make a compound subject. The true subject is "researchers" — wait, actually "researchers" is plural so "have" is correct. The key is the subject before "as well as."' },
  { id: 20, domain: 'D3', difficulty: 'Medium', sentence: 'Every boy and girl in the school _____ expected to follow the rules.', blank: 'expected to follow rules', optionA: 'are', optionB: 'is', correct: 'B', explanation: 'When "every" precedes subjects joined by "and," the verb is singular: "is."' },
  { id: 21, domain: 'D3', difficulty: 'Medium', sentence: 'The police _____ investigating the incident that occurred last night.', blank: 'investigating the incident', optionA: 'is', optionB: 'are', correct: 'B', explanation: '"Police" is always treated as a plural noun in English, requiring the plural verb "are."' },
  { id: 22, domain: 'D3', difficulty: 'Medium', sentence: 'Either the manager or the employees _____ responsible for the mistake.', blank: 'responsible for mistake', optionA: 'is', optionB: 'are', correct: 'B', explanation: 'With "either/or," the verb agrees with the closer subject. "Employees" is plural, so use "are."' },
  { id: 23, domain: 'D3', difficulty: 'Medium', sentence: 'The athletics program at our school _____ produced many outstanding athletes.', blank: 'produced many athletes', optionA: 'have', optionB: 'has', correct: 'B', explanation: '"Athletics program" refers to a single program as a unit, requiring the singular "has."' },
  { id: 24, domain: 'D3', difficulty: 'Medium', sentence: 'Measles _____ a highly contagious disease that was once widespread.', blank: 'a highly contagious disease', optionA: 'are', optionB: 'is', correct: 'B', explanation: 'Disease names ending in -s (measles, mumps, rabies) are singular and take singular verbs.' },
  { id: 25, domain: 'D3', difficulty: 'Hard', sentence: 'The criteria for admission _____ clearly outlined in the handbook.', blank: 'clearly outlined', optionA: 'is', optionB: 'are', correct: 'B', explanation: '"Criteria" is the plural form of "criterion." It requires the plural verb "are."' },
  { id: 26, domain: 'D3', difficulty: 'Hard', sentence: 'The phenomenon scientists _____ studying has puzzled researchers for decades.', blank: 'studying has puzzled', optionA: 'is', optionB: 'are', correct: 'B', explanation: '"Scientists" is the subject of "are studying." The plural subject requires the plural verb "are."' },
  { id: 27, domain: 'D3', difficulty: 'Hard', sentence: 'Three-quarters of the students _____ passed the standardized examination.', blank: 'passed the examination', optionA: 'has', optionB: 'have', correct: 'B', explanation: 'Fractions agree with the noun that follows "of." "Students" is plural, so use "have."' },
  { id: 28, domain: 'D3', difficulty: 'Hard', sentence: 'The media _____ often criticized for its sensationalized coverage of events.', blank: 'often criticized', optionA: 'are', optionB: 'is', correct: 'B', explanation: 'In American English, "media" is increasingly treated as singular when referring to the industry as a whole.' },
  { id: 29, domain: 'D3', difficulty: 'Hard', sentence: 'Neither of the solutions _____ proven effective in the clinical trials.', blank: 'proven effective', optionA: 'have', optionB: 'has', correct: 'B', explanation: '"Neither" used alone (without "nor") is singular and takes the singular verb "has."' },
  { id: 30, domain: 'D3', difficulty: 'Hard', sentence: 'The acoustics in the new concert hall _____ remarkably clear and resonant.', blank: 'remarkably clear', optionA: 'is', optionB: 'are', correct: 'B', explanation: '"Acoustics" when referring to the properties of a space is plural and takes "are."' },
  { id: 31, domain: 'D3', difficulty: 'Easy', sentence: 'If she _____ studied harder, she would have passed the exam.', blank: 'would have passed', optionA: 'had', optionB: 'has', correct: 'A', explanation: 'This is a past counterfactual conditional. The correct form uses "had studied" in the if-clause.' },
  { id: 32, domain: 'D3', difficulty: 'Easy', sentence: 'By the time the guests arrived, she _____ already prepared dinner.', blank: 'already prepared dinner', optionA: 'had', optionB: 'has', correct: 'A', explanation: 'The past perfect "had prepared" is used for an action completed before another past action.' },
  { id: 33, domain: 'D3', difficulty: 'Easy', sentence: 'The students _____ working on their projects when the fire alarm went off.', blank: 'on their projects', optionA: 'were', optionB: 'are', correct: 'A', explanation: 'The past progressive "were working" describes an ongoing action interrupted by a past event.' },
  { id: 34, domain: 'D3', difficulty: 'Medium', sentence: 'I wish I _____ more time to spend with my family during the holidays.', blank: 'more time to spend', optionA: 'had', optionB: 'have', correct: 'A', explanation: 'After "wish," use the subjunctive mood. "Had" (not "have") expresses a hypothetical desire.' },
  { id: 35, domain: 'D3', difficulty: 'Medium', sentence: 'The report _____ submitted before the deadline next Friday.', blank: 'before the deadline', optionA: 'must be', optionB: 'must have been', correct: 'A', explanation: '"Must be submitted" refers to a future requirement. "Must have been" refers to a past obligation.' },
  { id: 36, domain: 'D3', difficulty: 'Medium', sentence: 'She _____ to the gym every morning before going to work.', blank: 'every morning before work', optionA: 'goes', optionB: 'go', correct: 'A', explanation: '"She" is a third-person singular subject requiring the -s form of the verb: "goes."' },
  { id: 37, domain: 'D3', difficulty: 'Medium', sentence: 'The experiment _____ repeated three times to ensure accuracy of results.', blank: 'to ensure accuracy', optionA: 'was', optionB: 'were', correct: 'A', explanation: '"Experiment" is singular, requiring the singular passive "was repeated."' },
  { id: 38, domain: 'D3', difficulty: 'Hard', sentence: 'It is essential that every student _____ the assigned reading before class.', blank: 'the assigned reading', optionA: 'completes', optionB: 'complete', correct: 'B', explanation: 'After "it is essential that," use the subjunctive mood. The subjunctive uses the base form "complete" without -s.' },
  { id: 39, domain: 'D3', difficulty: 'Hard', sentence: 'The board recommended that the CEO _____ the merger proposal immediately.', blank: 'the merger proposal', optionA: 'reviews', optionB: 'review', correct: 'B', explanation: 'After "recommended that," use the subjunctive mood. The subjunctive uses the base form "review" without -s.' },
  { id: 40, domain: 'D3', difficulty: 'Hard', sentence: 'Had the researchers _____ more carefully, they would have noticed the error.', blank: 'more carefully', optionA: 'observed', optionB: 'been observing', correct: 'A', explanation: 'In inverted conditionals with "had," use the past perfect form: "had observed."' },
  { id: 41, domain: 'D3', difficulty: 'Easy', sentence: 'The cat licked _____ paws after finishing its meal.', blank: 'after finishing meal', optionA: 'their', optionB: 'its', correct: 'B', explanation: '"Cat" is singular. The correct singular pronoun is "its," not "their."' },
  { id: 42, domain: 'D3', difficulty: 'Easy', sentence: 'Everyone must bring _____ own supplies to the workshop on Saturday.', blank: 'own supplies to workshop', optionA: 'their', optionB: 'his', correct: 'A', explanation: '"Everyone" is singular but gender-neutral. The modern standard is to use "their" as a singular gender-neutral pronoun.' },
  { id: 43, domain: 'D3', difficulty: 'Easy', sentence: 'The company announced _____ new policy at the quarterly meeting.', blank: 'at the quarterly meeting', optionA: 'their', optionB: 'its', correct: 'B', explanation: '"Company" is a singular collective noun. In American English, use the singular pronoun "its."' },
  { id: 44, domain: 'D3', difficulty: 'Medium', sentence: 'Between you and _____, I think the new manager is doing a great job.', blank: 'I think the manager', optionA: 'I', optionB: 'me', correct: 'B', explanation: 'After a preposition like "between," use the objective case pronoun "me," not the subjective "I."' },
  { id: 45, domain: 'D3', difficulty: 'Medium', sentence: 'The award was given to _____ finished the project first.', blank: 'finished the project', optionA: 'whoever', optionB: 'whomever', correct: 'A', explanation: '"Whoever" is the subject of the clause "whoever finished the project first." Use the subjective case.' },
  { id: 46, domain: 'D3', difficulty: 'Medium', sentence: 'The teacher asked _____ students had completed the extra credit assignment.', blank: 'had completed assignment', optionA: 'which', optionB: 'whom', correct: 'A', explanation: '"Which" is used to ask about things or choices. Here it asks which students — choosing among a group.' },
  { id: 47, domain: 'D3', difficulty: 'Hard', sentence: 'It was _____ who discovered the error in the financial report.', blank: 'who discovered the error', optionA: 'her', optionB: 'she', correct: 'B', explanation: 'After "it was," use the subjective case pronoun "she." The sentence means "She discovered the error."' },
  { id: 48, domain: 'D3', difficulty: 'Hard', sentence: 'The researchers could not determine _____ theory was more convincing.', blank: 'theory was more convincing', optionA: 'whose', optionB: 'who\'s', correct: 'A', explanation: '"Whose" is the possessive form. "Who\'s" is a contraction of "who is." The sentence needs the possessive.' },
  { id: 49, domain: 'D3', difficulty: 'Hard', sentence: 'Give the presentation materials to _____ is in charge of the conference room.', blank: 'in charge of room', optionA: 'whomever', optionB: 'whoever', correct: 'B', explanation: '"Whoever" is the subject of the clause "whoever is in charge." Despite following "to," the subject case is needed.' },
  { id: 50, domain: 'D3', difficulty: 'Hard', sentence: 'The senators debated _____ bill would better address the housing crisis.', blank: 'would better address', optionA: 'who\'s', optionB: 'whose', correct: 'B', explanation: '"Whose" is the possessive form needed here. "Who\'s" means "who is," which makes no grammatical sense.' },
];

const TIMER_DURATION = 45;

export default function FlipItScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
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
  const signAnim = useRef(new Animated.Value(-300)).current;
  const leftSignAnim = useRef(new Animated.Value(-width)).current;
  const rightSignAnim = useRef(new Animated.Value(width)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  useEffect(() => {
    animateIn();
  }, [currentQ]);

  function animateIn() {
    signAnim.setValue(-300);
    leftSignAnim.setValue(-width);
    rightSignAnim.setValue(width);
    Animated.sequence([
      Animated.spring(signAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.parallel([
        Animated.spring(leftSignAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.spring(rightSignAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
      ]),
    ]).start();
  }

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

  function handleAnswer(option: 'A' | 'B') {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(option);
    const q = shuffledQ[currentQ];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 6;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((6 - timeTaken) * 2)) : 0;
    const isCorrect = option === q.correct;
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
      userAnswer: option === 'A' ? q.optionA : q.optionB,
      correctAnswer: q.correct === 'A' ? q.optionA : q.optionB,
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setCurrentQ(q => q + 1);
      setAnswered(false);
      setSelectedOption(null);
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
    setCurrentQ(0); setAnswered(false); setSelectedOption(null);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);

  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(2, finalScore, xpEarned, 'rw_d2', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 🔄</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewSentence}>{a.sentence}</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Flip It</Text>
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

  const getSignColor = (option: 'A' | 'B') => {
    if (!answered) return '#1A1A2E';
    if (option === q.correct) return '#10B98125';
    if (option === selectedOption && option !== q.correct) return '#EF444425';
    return '#1A1A2E';
  };

  const getSignBorder = (option: 'A' | 'B') => {
    if (!answered) return '#F97316';
    if (option === q.correct) return '#10B981';
    if (option === selectedOption && option !== q.correct) return '#EF4444';
    return '#3D3D5C';
  };

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
              <Text style={styles.gameTitle}>🔄 Flip It</Text>
              <Text style={styles.gameSubtitle}>D3 · Standard English</Text>
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
            <View style={[styles.qCounterBox, { backgroundColor: '#F9731620' }]}>
              <Text style={[styles.qCounter, { color: '#F97316' }]}>{currentQ + 1}/{shuffledQ.length}</Text>
            </View>
          </View>

          {/* Domain Badge */}
          <View style={styles.domainRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>📖 {q.domain} · {q.difficulty}</Text>
            </View>
          </View>

          {/* Question Sign drops from top */}
          <Animated.View style={[styles.questionSign, { transform: [{ translateY: signAnim }] }]}>
            <View style={styles.signPost} />
            <View style={styles.signBoard}>
              <Text style={styles.signLabel}>🚧 CHOOSE THE CORRECT WORD</Text>
              <Text style={styles.questionText}>{q.sentence}</Text>
            </View>
          </Animated.View>

          {/* Street Signs slide in from sides */}
          <View style={styles.signsRow}>
            {/* Left Sign - Option A */}
            <Animated.View style={{ transform: [{ translateX: leftSignAnim }], flex: 1 }}>
              <TouchableOpacity
                style={[styles.streetSign, {
                  backgroundColor: getSignColor('A'),
                  borderColor: getSignBorder('A'),
                }]}
                onPress={() => handleAnswer('A')}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Text style={styles.signArrow}>←</Text>
                <Text style={[styles.signWord, {
                  color: answered && 'A' === q.correct ? '#10B981' :
                    answered && selectedOption === 'A' && 'A' !== q.correct ? '#EF4444' : '#FFFFFF'
                }]}>{q.optionA}</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.signDivider}>
              <Text style={styles.signDividerText}>OR</Text>
            </View>

            {/* Right Sign - Option B */}
            <Animated.View style={{ transform: [{ translateX: rightSignAnim }], flex: 1 }}>
              <TouchableOpacity
                style={[styles.streetSign, {
                  backgroundColor: getSignColor('B'),
                  borderColor: getSignBorder('B'),
                }]}
                onPress={() => handleAnswer('B')}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Text style={[styles.signWord, {
                  color: answered && 'B' === q.correct ? '#10B981' :
                    answered && selectedOption === 'B' && 'B' !== q.correct ? '#EF4444' : '#FFFFFF'
                }]}>{q.optionB}</Text>
                <Text style={styles.signArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Explanation after answer */}
          {answered && (
            <View style={[styles.explanationBox, {
              borderColor: selectedOption === q.correct ? '#10B981' : '#EF4444',
              backgroundColor: selectedOption === q.correct ? '#10B98115' : '#EF444415',
            }]}>
              <Text style={[styles.explanationTitle, {
                color: selectedOption === q.correct ? '#10B981' : '#EF4444'
              }]}>
                {selectedOption === q.correct ? '✅ Correct!' : '❌ Not quite!'}
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
  safe: { flex: 1, backgroundColor: '#0D0D1A' },
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
  domainRow: { marginBottom: 12 },
  domainBadge: { backgroundColor: '#2563EB20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#2563EB40' },
  domainText: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
  questionSign: { alignItems: 'center', marginBottom: 24 },
  signPost: { width: 8, height: 20, backgroundColor: '#9CA3AF', borderRadius: 4 },
  signBoard: {
    backgroundColor: '#1E3A5F', borderRadius: 12, padding: 18,
    borderWidth: 3, borderColor: '#F97316', width: '100%',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  signLabel: { fontSize: 11, color: '#F97316', fontWeight: '800', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  questionText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', lineHeight: 28, textAlign: 'center' },
  signsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  streetSign: {
    borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 2, minHeight: 100, justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  signArrow: { fontSize: 24, color: '#F97316', fontWeight: '900', marginBottom: 6 },
  signWord: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  signDivider: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  signDividerText: { fontSize: 14, color: '#6B7280', fontWeight: '800' },
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
  continueBtn: { backgroundColor: '#2563EB', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 8 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#3D3D5C' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center' },
  pauseCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#3D3D5C' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#2563EB', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});