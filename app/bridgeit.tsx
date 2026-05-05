import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';

const QUESTIONS = [
  { id: 1, domain: 'D4', difficulty: 'Easy', passage: 'Many students struggle with time management. _______, they often miss deadlines and feel overwhelmed by their workload.', question: 'Which transition best connects these ideas?', options: ['As a result', 'However', 'In contrast', 'Nevertheless'], correct: 0, explanation: '"As a result" shows cause and effect — poor time management leads to missed deadlines.' },
  { id: 2, domain: 'D4', difficulty: 'Easy', passage: 'The new park was built in the center of the city. _______, residents now have a convenient place to exercise and relax.', question: 'Which transition best fits here?', options: ['However', 'As a result', 'In contrast', 'Although'], correct: 1, explanation: '"As a result" connects the cause (new park) to the effect (residents have a place to relax).' },
  { id: 3, domain: 'D4', difficulty: 'Easy', passage: 'Solar energy is becoming increasingly affordable. _______, many homeowners are installing solar panels on their roofs.', question: 'Which transition best fits here?', options: ['Nevertheless', 'In contrast', 'Consequently', 'However'], correct: 2, explanation: '"Consequently" shows that the affordability of solar energy leads to more homeowners installing panels.' },
  { id: 4, domain: 'D4', difficulty: 'Easy', passage: 'The restaurant received excellent reviews online. _______, it was fully booked every weekend for months.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Although', 'Therefore'], correct: 3, explanation: '"Therefore" shows that the excellent reviews logically led to the restaurant being fully booked.' },
  { id: 5, domain: 'D4', difficulty: 'Easy', passage: 'Dogs are known for being loyal and affectionate companions. _______, cats tend to be more independent and self-sufficient.', question: 'Which transition best fits here?', options: ['In contrast', 'Therefore', 'As a result', 'Furthermore'], correct: 0, explanation: '"In contrast" introduces an opposing characteristic — cats are different from dogs in their behavior.' },
  { id: 6, domain: 'D4', difficulty: 'Easy', passage: 'The scientist conducted hundreds of experiments. _______, she finally discovered a cure for the disease.', question: 'Which transition best fits here?', options: ['In contrast', 'Eventually', 'However', 'Nevertheless'], correct: 1, explanation: '"Eventually" shows that after many experiments, success finally came.' },
  { id: 7, domain: 'D4', difficulty: 'Easy', passage: 'Regular exercise improves cardiovascular health. _______, it reduces stress and improves mental well-being.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Furthermore', 'Although'], correct: 2, explanation: '"Furthermore" adds an additional benefit of exercise beyond cardiovascular health.' },
  { id: 8, domain: 'D4', difficulty: 'Easy', passage: 'The movie received negative reviews from critics. _______, it became one of the highest-grossing films of the year.', question: 'Which transition best fits here?', options: ['Therefore', 'Furthermore', 'As a result', 'Nevertheless'], correct: 3, explanation: '"Nevertheless" shows that despite negative reviews, the film succeeded — a contrast.' },
  { id: 9, domain: 'D4', difficulty: 'Medium', passage: 'The company invested heavily in employee training programs. _______, productivity increased by thirty percent over the following year.', question: 'Which transition best fits here?', options: ['As a result', 'However', 'In contrast', 'Although'], correct: 0, explanation: '"As a result" connects the investment in training to the outcome of increased productivity.' },
  { id: 10, domain: 'D4', difficulty: 'Medium', passage: 'Ancient civilizations built impressive structures without modern technology. _______, the pyramids of Egypt still stand after thousands of years.', question: 'Which transition best fits here?', options: ['Therefore', 'For example', 'However', 'In contrast'], correct: 1, explanation: '"For example" introduces a specific instance that supports the claim about impressive ancient structures.' },
  { id: 11, domain: 'D4', difficulty: 'Medium', passage: 'The new medication showed promising results in laboratory tests. _______, clinical trials involving human patients revealed serious side effects.', question: 'Which transition best fits here?', options: ['Furthermore', 'Similarly', 'However', 'Therefore'], correct: 2, explanation: '"However" signals a contrast — the promising lab results were contradicted by the clinical findings.' },
  { id: 12, domain: 'D4', difficulty: 'Medium', passage: 'Deforestation destroys natural habitats and threatens biodiversity. _______, it contributes significantly to climate change by releasing stored carbon.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Although', 'Moreover'], correct: 3, explanation: '"Moreover" adds another serious consequence of deforestation beyond habitat destruction.' },
  { id: 13, domain: 'D4', difficulty: 'Medium', passage: 'The study found that students who sleep at least eight hours perform better academically. _______, many students sacrifice sleep to study longer hours.', question: 'Which transition best fits here?', options: ['Ironically', 'Therefore', 'Furthermore', 'Similarly'], correct: 0, explanation: '"Ironically" highlights the contradiction — despite evidence for sleep, students still sacrifice it.' },
  { id: 14, domain: 'D4', difficulty: 'Medium', passage: 'Urban gardens provide fresh produce for city residents. _______, they create green spaces that improve air quality and community well-being.', question: 'Which transition best fits here?', options: ['However', 'In addition', 'In contrast', 'Although'], correct: 1, explanation: '"In addition" introduces another benefit of urban gardens beyond providing fresh produce.' },
  { id: 15, domain: 'D4', difficulty: 'Medium', passage: 'The first draft of the novel was rejected by twelve publishers. _______, the author revised and resubmitted it, eventually securing a major book deal.', question: 'Which transition best fits here?', options: ['Therefore', 'Similarly', 'Undeterred', 'In contrast'], correct: 2, explanation: '"Undeterred" shows the author persisted despite rejection — expressing determination.' },
  { id: 16, domain: 'D4', difficulty: 'Medium', passage: 'Traditional farming methods are labor-intensive and time-consuming. _______, modern agricultural technology has dramatically increased efficiency.', question: 'Which transition best fits here?', options: ['Furthermore', 'As a result', 'Similarly', 'In contrast'], correct: 3, explanation: '"In contrast" introduces the opposing idea — modern technology differs from traditional methods.' },
  { id: 17, domain: 'D4', difficulty: 'Medium', passage: 'The government introduced new recycling regulations last year. _______, waste sent to landfills has decreased by twenty-five percent.', question: 'Which transition best fits here?', options: ['Since then', 'However', 'In contrast', 'Although'], correct: 0, explanation: '"Since then" shows that after the regulations were introduced, the decrease in landfill waste followed.' },
  { id: 18, domain: 'D4', difficulty: 'Hard', passage: 'Proponents of standardized testing argue that it provides an objective measure of student achievement. _______, critics contend that such tests favor students from wealthier backgrounds.', question: 'Which transition best fits here?', options: ['Furthermore', 'Conversely', 'Similarly', 'Therefore'], correct: 1, explanation: '"Conversely" introduces the directly opposing viewpoint in a balanced argument.' },
  { id: 19, domain: 'D4', difficulty: 'Hard', passage: 'The Renaissance produced extraordinary achievements in art, science, and literature. _______, it laid the intellectual groundwork for the Scientific Revolution that followed.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Furthermore', 'Although'], correct: 2, explanation: '"Furthermore" adds another significant contribution of the Renaissance beyond its artistic achievements.' },
  { id: 20, domain: 'D4', difficulty: 'Hard', passage: 'Early computers filled entire rooms and required teams of engineers to operate. _______, today\'s smartphones contain more processing power than those early machines.', question: 'Which transition best fits here?', options: ['Similarly', 'Therefore', 'Furthermore', 'In contrast'], correct: 3, explanation: '"In contrast" highlights how dramatically different modern technology is from early computers.' },
  { id: 21, domain: 'D4', difficulty: 'Hard', passage: 'The research team spent three years collecting data from remote locations. _______, their findings challenged several long-held assumptions in the field.', question: 'Which transition best fits here?', options: ['Ultimately', 'Nevertheless', 'In contrast', 'Similarly'], correct: 0, explanation: '"Ultimately" shows the final significant outcome after years of research.' },
  { id: 22, domain: 'D4', difficulty: 'Hard', passage: 'Some economists argue that raising the minimum wage reduces unemployment by increasing consumer spending. _______, others warn that it may cause businesses to cut jobs or raise prices.', question: 'Which transition best fits here?', options: ['Furthermore', 'Conversely', 'Similarly', 'Therefore'], correct: 1, explanation: '"Conversely" introduces the opposing economic argument in a balanced presentation of perspectives.' },
  { id: 23, domain: 'D4', difficulty: 'Hard', passage: 'The ancient Silk Road facilitated trade in goods like silk, spices, and precious metals. _______, it served as a conduit for the exchange of ideas, religions, and technologies.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Beyond merely', 'Although'], correct: 2, explanation: '"Beyond merely" signals that the author is expanding on what was already stated — the Silk Road did more than just trade goods.' },
  { id: 24, domain: 'D4', difficulty: 'Easy', passage: 'The concert was canceled due to bad weather. _______, attendees were offered full refunds for their tickets.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Furthermore', 'As a result'], correct: 3, explanation: '"As a result" connects the cancellation to the natural consequence of offering refunds.' },
  { id: 25, domain: 'D4', difficulty: 'Easy', passage: 'Learning a new language takes years of dedicated practice. _______, the benefits of bilingualism are well worth the effort.', question: 'Which transition best fits here?', options: ['Nevertheless', 'Therefore', 'Furthermore', 'Similarly'], correct: 0, explanation: '"Nevertheless" concedes the difficulty while affirming the benefits — a contrast.' },
  { id: 26, domain: 'D4', difficulty: 'Medium', passage: 'The new highway reduced commute times significantly. _______, it increased air pollution in surrounding neighborhoods.', question: 'Which transition best fits here?', options: ['Furthermore', 'However', 'Therefore', 'Similarly'], correct: 1, explanation: '"However" introduces an unintended negative consequence that contrasts with the positive effect.' },
  { id: 27, domain: 'D4', difficulty: 'Medium', passage: 'The author spent ten years researching the biography. _______, the resulting book was remarkably detailed and accurate.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Not surprisingly', 'Although'], correct: 2, explanation: '"Not surprisingly" signals that the detailed research predictably led to a detailed book.' },
  { id: 28, domain: 'D4', difficulty: 'Medium', passage: 'Exercise has been shown to reduce symptoms of depression. _______, many people with depression struggle to find the motivation to exercise regularly.', question: 'Which transition best fits here?', options: ['Therefore', 'Furthermore', 'Similarly', 'Paradoxically'], correct: 3, explanation: '"Paradoxically" highlights the contradiction — the cure is difficult to access for those who need it.' },
  { id: 29, domain: 'D4', difficulty: 'Hard', passage: 'Traditional print journalism has struggled financially in the digital age. _______, several major newspapers have successfully transitioned to digital subscription models.', question: 'Which transition best fits here?', options: ['That said', 'Furthermore', 'Similarly', 'Therefore'], correct: 0, explanation: '"That said" acknowledges the struggle while introducing a positive counterexample.' },
  { id: 30, domain: 'D4', difficulty: 'Hard', passage: 'The industrial revolution transformed economies and raised living standards for many. _______, it created dangerous working conditions and severe environmental pollution.', question: 'Which transition best fits here?', options: ['Furthermore', 'At the same time', 'Similarly', 'Therefore'], correct: 1, explanation: '"At the same time" shows that both the positive and negative effects occurred simultaneously.' },
  { id: 31, domain: 'D4', difficulty: 'Easy', passage: 'The recipe calls for fresh herbs and seasonal vegetables. _______, you can substitute dried herbs if fresh ones are unavailable.', question: 'Which transition best fits here?', options: ['Therefore', 'Furthermore', 'Alternatively', 'In contrast'], correct: 2, explanation: '"Alternatively" introduces an option that can be used instead of the recommended ingredient.' },
  { id: 32, domain: 'D4', difficulty: 'Easy', passage: 'The athlete trained for five years to reach the Olympic level. _______, she won the gold medal in her first Olympic appearance.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Although', 'As a result'], correct: 3, explanation: '"As a result" connects years of training to the logical outcome of winning the gold medal.' },
  { id: 33, domain: 'D4', difficulty: 'Medium', passage: 'Renewable energy sources are becoming increasingly cost-competitive with fossil fuels. _______, the transition away from coal and oil has been slower than many experts predicted.', question: 'Which transition best fits here?', options: ['Despite this', 'Therefore', 'Furthermore', 'Similarly'], correct: 0, explanation: '"Despite this" acknowledges the competitive pricing while noting the unexpectedly slow transition.' },
  { id: 34, domain: 'D4', difficulty: 'Medium', passage: 'The new tax policy was designed to reduce income inequality. _______, preliminary data suggests that the wealth gap has actually widened since its implementation.', question: 'Which transition best fits here?', options: ['Therefore','Surprisingly', 'Furthermore', 'Similarly'], correct: 1, explanation: '"Surprisingly" signals that the outcome is contrary to the policy\'s stated intention.' },
  { id: 35, domain: 'D4', difficulty: 'Hard', passage: 'Many developed nations are experiencing declining birth rates. _______, they face growing economic pressures from aging populations and shrinking workforces.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Consequently', 'Although'], correct: 2, explanation: '"Consequently" shows that declining birth rates directly cause the economic pressures that follow.' },
  { id: 36, domain: 'D4', difficulty: 'Hard', passage: 'Artificial intelligence has demonstrated remarkable capabilities in narrow, specific tasks. _______, it still lacks the general reasoning and emotional intelligence that characterize human thought.', question: 'Which transition best fits here?', options: ['Furthermore', 'Therefore', 'Similarly', 'However'], correct: 3, explanation: '"However" introduces a significant limitation that contrasts with AI\'s impressive narrow capabilities.' },
  { id: 37, domain: 'D4', difficulty: 'Easy', passage: 'The city invested in new public transportation. _______, fewer residents drove their cars to work.', question: 'Which transition best fits here?', options: ['As a result', 'However', 'In contrast', 'Nevertheless'], correct: 0, explanation: '"As a result" shows that the transportation investment directly led to reduced car usage.' },
  { id: 38, domain: 'D4', difficulty: 'Medium', passage: 'The study concluded that social media use is linked to increased anxiety among teenagers. _______, researchers caution that correlation does not necessarily imply causation.', question: 'Which transition best fits here?', options: ['Therefore', 'However','Furthermore', 'Similarly'], correct: 1, explanation: '"However" introduces an important qualification that limits the conclusion of the study.' },
  { id: 39, domain: 'D4', difficulty: 'Hard', passage: 'Space exploration has yielded important technological advances that benefit everyday life. _______, the enormous costs have led some to question whether the investment is justified.', question: 'Which transition best fits here?', options: ['Furthermore', 'Similarly', 'Nevertheless', 'Therefore'], correct: 2, explanation: '"Nevertheless" acknowledges the benefits while introducing the opposing concern about costs.' },
  { id: 40, domain: 'D4', difficulty: 'Easy', passage: 'She practiced piano for three hours every day. _______, she performed flawlessly at the recital.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Although',  'As a result'], correct: 3, explanation: '"As a result" connects daily practice to the natural outcome of a flawless performance.' },
  { id: 41, domain: 'D4', difficulty: 'Medium', passage: 'The documentary presented evidence of widespread environmental damage. _______, it offered practical solutions that individuals and governments could implement.', question: 'Which transition best fits here?', options: ['Furthermore', 'However', 'In contrast', 'Although'], correct: 0, explanation: '"Furthermore" adds another positive element — solutions — to complement the evidence presented.' },
  { id: 42, domain: 'D4', difficulty: 'Hard', passage: 'Classical conditioning, as demonstrated by Pavlov, shows that animals learn through association. _______, operant conditioning, developed by Skinner, emphasizes learning through consequences.', question: 'Which transition best fits here?', options: ['Therefore', 'In contrast', 'Similarly', 'Furthermore'], correct: 1, explanation: '"In contrast" introduces a different theory of learning that differs from classical conditioning.' },
  { id: 43, domain: 'D4', difficulty: 'Medium', passage: 'The new medication was approved after extensive clinical trials. _______, doctors began prescribing it to patients with the condition.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Subsequently', 'Although'], correct: 2, explanation: '"Subsequently" shows temporal sequence — approval led to doctors prescribing the medication afterward.' },
  { id: 44, domain: 'D4', difficulty: 'Easy', passage: 'The team lost three consecutive games. _______, the coach decided to change the team\'s strategy.', question: 'Which transition best fits here?', options: ['Furthermore', 'In contrast', 'Although', 'In response'], correct: 3, explanation: '"In response" shows that the coaching change was a reaction to the losing streak.' },
  { id: 45, domain: 'D4', difficulty: 'Hard', passage: 'The philosopher argued that true knowledge requires certainty. _______, modern epistemologists suggest that knowledge can exist alongside the possibility of error.', question: 'Which transition best fits here?', options: ['In contrast', 'Furthermore', 'Similarly', 'Therefore'], correct: 0, explanation: '"In contrast" introduces a modern philosophical position that directly challenges the earlier claim.' },
  { id: 46, domain: 'D4', difficulty: 'Medium', passage: 'The ancient Romans built an extensive road network throughout their empire. _______, they constructed sophisticated aqueducts to supply water to cities.', question: 'Which transition best fits here?', options: ['However', 'In addition', 'In contrast', 'Although'], correct: 1, explanation: '"In addition" introduces another impressive engineering achievement of the Romans.' },
  { id: 47, domain: 'D4', difficulty: 'Hard', passage: 'Economic growth in emerging markets has lifted millions out of poverty. _______, rapid industrialization has created significant environmental challenges in those regions.', question: 'Which transition best fits here?', options: ['Furthermore', 'Similarly', 'At the same time', 'Therefore'], correct: 2, explanation: '"At the same time" acknowledges that both the positive and negative effects have occurred simultaneously.' },
  { id: 48, domain: 'D4', difficulty: 'Easy', passage: 'The library was closed for renovations for six months. _______, it reopened with a modern design and expanded digital resources.', question: 'Which transition best fits here?', options: ['However', 'In contrast', 'Although', 'Upon reopening'], correct: 3, explanation: '"Upon reopening" specifies the exact timing and context for the improvements.' },
  { id: 49, domain: 'D4', difficulty: 'Medium', passage: 'Scientists have identified over a million species of insects on Earth. _______, researchers estimate that millions more remain undiscovered.', question: 'Which transition best fits here?', options: ['Yet', 'Therefore', 'However', 'Nevertheless'], correct: 0, explanation: '"Yet" introduces a surprising contrast — despite identifying so many species, even more remain unknown.' },
  { id: 50, domain: 'D4', difficulty: 'Hard', passage: 'The treaty brought an end to decades of armed conflict between the two nations. _______, deep-seated mistrust and unresolved grievances continued to strain diplomatic relations.', question: 'Which transition best fits here?', options: ['Furthermore', 'Nevertheless', 'Similarly', 'Therefore'], correct: 1, explanation: '"Nevertheless" acknowledges the peace while introducing the ongoing tension — a meaningful contrast.' },
];

const TIMER_DURATION = 45;

export default function BridgeItScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
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
  const bridgeAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bridgeAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(bridgeAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
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

  function handleAnswer(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(index);
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
      passage: q.passage,
      userAnswer: q.options[index],
      correctAnswer: q.options[q.correct],
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
  const bridgeGlow = bridgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(5, finalScore, xpEarned, 'rw_d4', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);

  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 🌉</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewPassage}>{a.passage}</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Bridge It</Text>
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

          {/* City Skyline */}
          <View style={styles.skylineContainer}>
            <View style={styles.building1} />
            <View style={styles.building2} />
            <View style={styles.building3} />
            <View style={styles.building4} />
            <View style={styles.building5} />
            <View style={styles.building6} />
            <View style={styles.building7} />
            {/* Stars */}
            <Text style={[styles.star, { top: 20, left: 30 }]}>✦</Text>
            <Text style={[styles.star, { top: 10, left: 80 }]}>·</Text>
            <Text style={[styles.star, { top: 25, left: 150 }]}>✦</Text>
            <Text style={[styles.star, { top: 8, left: 220 }]}>·</Text>
            <Text style={[styles.star, { top: 18, left: 280 }]}>✦</Text>
            <Text style={[styles.star, { top: 5, left: 320 }]}>·</Text>
          </View>

          {/* Header */}
          <View style={styles.gameHeader}>
            <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
              <Text style={styles.pauseIcon}>⏸</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.gameTitle}>🌉 Bridge It</Text>
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
            <View style={[styles.qCounterBox, { backgroundColor: '#F59E0B20' }]}>
              <Text style={[styles.qCounter, { color: '#F59E0B' }]}>{currentQ + 1}/{shuffledQ.length}</Text>
            </View>
          </View>

          {/* Domain Badge */}
          <View style={styles.domainRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>🌉 {q.domain} · {q.difficulty}</Text>
            </View>
          </View>

          {/* Passage Card */}
          <View style={styles.passageBox}>
            <Text style={styles.passageLabel}>FILL THE BRIDGE</Text>
            <Text style={styles.passageText}>{q.passage}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>

          {/* Answer Pills */}
          <View style={styles.optionsGrid}>
            {q.options.map((option, index) => {
              let bgColor = '#0F2337';
              let borderColor = '#F59E0B50';
              let textColor = '#FFFFFF';
              if (answered) {
                if (index === q.correct) {
                  bgColor = '#10B98120'; borderColor = '#10B981'; textColor = '#10B981';
                } else if (index === selectedOption && index !== q.correct) {
                  bgColor = '#EF444420'; borderColor = '#EF4444'; textColor = '#EF4444';
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
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {answered && (
            <View style={[styles.explanationBox, {
              borderColor: selectedOption === q.correct ? '#10B981' : '#EF4444',
              backgroundColor: selectedOption === q.correct ? '#10B98115' : '#EF444415',
            }]}>
              <Text style={[styles.explanationTitle, { color: selectedOption === q.correct ? '#10B981' : '#EF4444' }]}>
                {selectedOption === q.correct ? '✅ Bridge connected!' : '❌ Bridge fell!'}
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
  safe: { flex: 1, backgroundColor: '#0A1628' },
  container: { flex: 1, paddingHorizontal: 20 },
  skylineContainer: {
    height: 80, flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 10, marginBottom: -10, overflow: 'hidden',
  },
  building1: { width: 30, height: 50, backgroundColor: '#0D2140', marginRight: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  building2: { width: 20, height: 65, backgroundColor: '#0E2544', marginRight: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  building3: { width: 40, height: 45, backgroundColor: '#0C1E3A', marginRight: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  building4: { width: 25, height: 70, backgroundColor: '#0F2648', marginRight: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  building5: { width: 35, height: 55, backgroundColor: '#0D2040', marginRight: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  building6: { width: 20, height: 40, backgroundColor: '#0C1E3C', marginRight: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  building7: { width: 45, height: 60, backgroundColor: '#0E2240', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  star: { position: 'absolute', color: '#F59E0B', fontSize: 10, opacity: 0.7 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 16, gap: 12 },
  pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0F2337', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B40' },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
  scoreBox: { backgroundColor: '#F59E0B20', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F59E0B' },
  scoreLabel: { fontSize: 10, color: '#F59E0B', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 24, top: 110, fontSize: 24, fontWeight: '900', color: '#10B981', zIndex: 100 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, backgroundColor: '#0F2337', borderRadius: 16, padding: 12 },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#1A3050', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  qCounter: { fontSize: 14, fontWeight: '800' },
  domainRow: { marginBottom: 12 },
  domainBadge: { backgroundColor: '#F59E0B20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#F59E0B40' },
  domainText: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
  passageBox: { backgroundColor: '#0F2337', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#F59E0B30' },
  passageLabel: { fontSize: 11, color: '#F59E0B', fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  passageText: { fontSize: 17, color: '#E2E8F0', lineHeight: 28 },
  questionBox: { backgroundColor: '#0891B220', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#0891B240' },
  questionText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', lineHeight: 24 },
  optionsGrid: { gap: 12, paddingBottom: 20 },
  optionPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 50, padding: 16, borderWidth: 2 },
  optionText: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  explanationBox: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1.5 },
  explanationTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  explanationText: { fontSize: 15, color: '#E2E8F0', lineHeight: 24 },
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#0F2337', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewPassage: { fontSize: 13, color: '#9CA3AF', lineHeight: 20, marginBottom: 8, fontStyle: 'italic' },
  reviewAnswer: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F59E0B', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#0F2337', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1A3050' },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#0A1628', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#F59E0B' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#F59E0B15', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
  xpTitle: { fontSize: 16, color: '#F59E0B', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#F59E0B', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#0F2337', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1A3050' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#F59E0B', fontWeight: '700' },
  continueBtn: { backgroundColor: '#F59E0B', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 8 },
  continueBtnText: { color: '#0A1628', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#1A3050' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center' },
  pauseCard: { backgroundColor: '#0F2337', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B30' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#F59E0B', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#0A1628', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});