import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';

const QUESTIONS = [
  // ── D3 EASY ───────────────────────────────────────────────────────────────
  { id: 1, domain: 'D3', difficulty: 'Easy', question: 'Data set: 4, 7, 7, 9, 13. What is the median?', options: ['8', '7', '9', '6'], correct: 1, explanation: 'Sorted: 4,7,7,9,13. Middle value (3rd of 5) = 7.' },
  { id: 2, domain: 'D3', difficulty: 'Easy', question: 'Data set: 3, 5, 7, 9, 11. What is the mean?', options: ['6', '8', '7', '9'], correct: 2, explanation: 'Mean = (3+5+7+9+11)/5 = 35/5 = 7.' },
  { id: 3, domain: 'D3', difficulty: 'Easy', question: 'Data set: 2, 4, 4, 6, 8, 8, 8. What is the mode?', options: ['4', '6', '2', '8'], correct: 3, explanation: 'Mode = most frequent value. 8 appears 3 times.' },
  { id: 4, domain: 'D3', difficulty: 'Easy', question: 'Data set: 5, 10, 15, 20, 25. What is the range?', options: ['15', '20', '25', '10'], correct: 1, explanation: 'Range = max - min = 25 - 5 = 20.' },
  { id: 5, domain: 'D3', difficulty: 'Easy', question: 'A bag has 3 red, 5 blue, 2 green marbles. P(blue)?', options: ['3/10', '1/5', '1/2', '2/5'], correct: 2, explanation: 'P(blue) = 5/10 = 1/2. Total = 10 marbles.' },
  { id: 6, domain: 'D3', difficulty: 'Easy', question: 'A shirt costs $40, marked down 25%. New price?', options: ['$35', '$30', '$25', '$32'], correct: 1, explanation: '25% of $40 = $10. $40 - $10 = $30.' },
  { id: 7, domain: 'D3', difficulty: 'Easy', question: 'A car travels 120 miles in 2 hours. Speed in mph?', options: ['240', '30', '45', '60'], correct: 3, explanation: 'Speed = distance/time = 120/2 = 60 mph.' },
  { id: 8, domain: 'D3', difficulty: 'Easy', question: 'Sales 2020: $500K, 2021: $650K. Percent increase?', options: ['25%', '15%', '30%', '35%'], correct: 2, explanation: '% change = (650-500)/500 × 100 = 30%.' },
  { id: 9, domain: 'D3', difficulty: 'Easy', question: 'Simple interest: $1000 at 5% for 3 years. Interest?', options: ['$50', '$105', '$500', '$150'], correct: 3, explanation: 'I = Prt = 1000 × 0.05 × 3 = $150.' },
  { id: 10, domain: 'D3', difficulty: 'Easy', question: 'What is 35% of 200?', options: ['65', '70', '80', '35'], correct: 1, explanation: '35% of 200 = 0.35 × 200 = 70.' },
  { id: 11, domain: 'D3', difficulty: 'Easy', question: '3 cups flour for 12 cookies. Cups needed for 48?', options: ['9', '16', '12', '6'], correct: 2, explanation: 'Ratio: 3/12 = x/48. x = 12 cups.' },
  { id: 12, domain: 'D3', difficulty: 'Easy', question: 'Data: 10, 20, 20, 30, 40. What is the mean?', options: ['20', '25', '30', '24'], correct: 3, explanation: 'Mean = 120/5 = 24.' },
  { id: 13, domain: 'D3', difficulty: 'Easy', question: 'Probability of rolling a 3 on a standard die?', options: ['1/3', '1/6', '1/2', '3/6'], correct: 1, explanation: 'P(3) = 1/6. One favorable out of 6 total.' },
  { id: 14, domain: 'D3', difficulty: 'Easy', question: 'A store sells 80 items. 20% are returned. How many?', options: ['20', '14', '16', '18'], correct: 2, explanation: '20% of 80 = 16 items returned.' },
  { id: 15, domain: 'D3', difficulty: 'Easy', question: '180 miles on 6 gallons. Miles per gallon?', options: ['25', '18', '36', '30'], correct: 3, explanation: 'Rate = 180/6 = 30 mpg.' },
  { id: 16, domain: 'D3', difficulty: 'Easy', question: 'Data: 5, 5, 5, 10, 10. What is the mode?', options: ['10', '5', '7', '8'], correct: 1, explanation: 'Mode = 5. Appears 3 times vs 2 for 10.' },
  { id: 17, domain: 'D3', difficulty: 'Easy', question: 'P(rain) = 0.3. What is P(no rain)?', options: ['0.3', '0.6', '0.7', '1.3'], correct: 2, explanation: 'P(complement) = 1 - 0.3 = 0.7.' },

  // ── D3 MEDIUM ─────────────────────────────────────────────────────────────
  { id: 18, domain: 'D3', difficulty: 'Medium', question: 'Class A: 20 students avg 85. Class B: 30 students avg 75. Combined average?', options: ['80', '79', '77', '82'], correct: 1, explanation: 'Weighted avg = (20×85+30×75)/50 = 3950/50 = 79.' },
  { id: 19, domain: 'D3', difficulty: 'Medium', question: 'Data: 2, 5, 6, 8, 9, 10, 14. What is the median?', options: ['7', '9', '8', '6'], correct: 2, explanation: '7 values — median is 4th value = 8.' },
  { id: 20, domain: 'D3', difficulty: 'Medium', question: 'P(A)=0.4, P(B)=0.3, independent. P(A and B)?', options: ['0.7', '0.1', '0.34', '0.12'], correct: 3, explanation: 'P(A and B) = 0.4 × 0.3 = 0.12.' },
  { id: 21, domain: 'D3', difficulty: 'Medium', question: 'Population grew 8,000 to 10,000. Percent increase?', options: ['25%', '20%', '30%', '15%'], correct: 0, explanation: '(2000/8000) × 100 = 25%.' },
  { id: 22, domain: 'D3', difficulty: 'Medium', question: 'Compound interest: $2000 at 10% for 2 years. Amount?', options: ['$2400', '$2420', '$2200', '$2440'], correct: 1, explanation: 'A = 2000(1.1)² = $2420.' },
  { id: 23, domain: 'D3', difficulty: 'Medium', question: 'Q1=7, Q3=9. What is the IQR?', options: ['5', '3', '7', '2'], correct: 3, explanation: 'IQR = Q3 - Q1 = 9 - 7 = 2.' },
  { id: 24, domain: 'D3', difficulty: 'Medium', question: '4 red, 6 blue. Pick 2 without replacement. P(both red)?', options: ['4/25', '2/15', '1/6', '2/9'], correct: 1, explanation: '4/10 × 3/9 = 12/90 = 2/15.' },
  { id: 25, domain: 'D3', difficulty: 'Medium', question: 'Train travels 300km in 2.5 hours. Speed in km/h?', options: ['100', '150', '120', '75'], correct: 2, explanation: 'Speed = 300/2.5 = 120 km/h.' },
  { id: 26, domain: 'D3', difficulty: 'Medium', question: 'Mon=12, Tue=18, Wed=15, Thu=21, Fri=9. Mean?', options: ['14', '16', '15', '18'], correct: 2, explanation: '(12+18+15+21+9)/5 = 15.' },
  { id: 27, domain: 'D3', difficulty: 'Medium', question: 'Product costs $60. Marked up 40%. Selling price?', options: ['$84', '$80', '$90', '$96'], correct: 0, explanation: '40% of $60 = $24. $60 + $24 = $84.' },
  { id: 28, domain: 'D3', difficulty: 'Medium', question: '20 girls total, 8 like math. P(math | girl)?', options: ['2/3', '1/3', '2/5', '4/15'], correct: 2, explanation: 'P = 8/20 = 2/5.' },
  { id: 29, domain: 'D3', difficulty: 'Medium', question: 'Mass=150g, volume=50cm³. Density?', options: ['5 g/cm³', '0.33 g/cm³', '7500', '3 g/cm³'], correct: 3, explanation: 'Density = 150/50 = 3 g/cm³.' },
  { id: 30, domain: 'D3', difficulty: 'Medium', question: 'Price dropped $80 to $60. Percent decrease?', options: ['20%', '33%', '25%', '15%'], correct: 2, explanation: '(20/80) × 100 = 25%.' },
  { id: 31, domain: 'D3', difficulty: 'Medium', question: '60 students, 45% prefer pizza. How many students?', options: ['25', '36', '30', '27'], correct: 3, explanation: '0.45 × 60 = 27.' },
  { id: 32, domain: 'D3', difficulty: 'Medium', question: '$500 at 8% simple interest for 4 years. Total?', options: ['$640', '$660', '$580', '$700'], correct: 1, explanation: 'I = 500×0.08×4 = $160. Total = $660.' },
  { id: 33, domain: 'D3', difficulty: 'Medium', question: 'Box plot: Min=10, Max=80. What is the range?', options: ['70', '35', '40', '50'], correct: 0, explanation: 'Range = 80 - 10 = 70.' },
  // ── D3 HARD ───────────────────────────────────────────────────────────────
  { id: 34, domain: 'D3', difficulty: 'Hard', question: 'Ages: 18,22,22,24,25,30,45. Outlier 45 most affects which measure?', options: ['Median', 'Mode', 'Mean', 'IQR'], correct: 2, explanation: 'Mean goes from ≈26.6 down significantly if 45 removed. Median barely changes.' },
  { id: 35, domain: 'D3', difficulty: 'Hard', question: 'Line of best fit: y = 2.5x + 10. Predict y when x=12.', options: ['35', '30', '45', '40'], correct: 3, explanation: 'y = 2.5(12)+10 = 30+10 = 40.' },
  { id: 36, domain: 'D3', difficulty: 'Hard', question: 'Set A std dev=2, Set B std dev=15. Which is more consistent?', options: ['Set B', 'Equal', 'Cannot tell', 'Set A'], correct: 3, explanation: 'Lower std dev = more consistent. Set A (σ=2) is more consistent.' },
  { id: 37, domain: 'D3', difficulty: 'Hard', question: '200 people: 120 coffee, 90 tea, 40 both. P(coffee or tea)?', options: ['3/5', '9/20', '7/10', '17/20'], correct: 3, explanation: '(120+90-40)/200 = 170/200 = 17/20.' },
  { id: 38, domain: 'D3', difficulty: 'Hard', question: '$5000 at 6% compounded monthly for 1 year. Amount?', options: ['$5300', '$5308', '$5250', '$5360'], correct: 1, explanation: 'A = 5000(1.005)^12 ≈ $5308.' },
  { id: 39, domain: 'D3', difficulty: 'Hard', question: 'Test 1=70 (30%), Test 2=80 (70%). Weighted grade?', options: ['75', '77', '76', '79'], correct: 1, explanation: '0.30×70 + 0.70×80 = 21+56 = 77.' },
  { id: 40, domain: 'D3', difficulty: 'Hard', question: 'r = -0.92 on scatter plot. What does this indicate?', options: ['Weak negative', 'No correlation', 'Strong positive', 'Strong negative'], correct: 3, explanation: 'r = -0.92 near -1 = strong negative linear correlation.' },
  { id: 41, domain: 'D3', difficulty: 'Hard', question: 'Data: 1,2,3,4,100. Remove 100. Which changes most?', options: ['Median', 'Mode', 'Range', 'Mean'], correct: 3, explanation: 'Mean goes from 22 to 2.5. Median barely changes. Mean most affected.' },
  { id: 42, domain: 'D3', difficulty: 'Hard', question: 'P(A)=0.5, P(B)=0.4, P(A∪B)=0.7. Find P(A∩B).', options: ['0.3', '0.1', '0.2', '0.9'], correct: 2, explanation: 'P(A∩B) = 0.5+0.4-0.7 = 0.2.' },

  // ── D1 ALGEBRA ────────────────────────────────────────────────────────────
  { id: 43, domain: 'D1', difficulty: 'Medium', question: 'y = 2x + 5. Find y when x = 7.', options: ['17', '21', '19', '14'], correct: 2, explanation: 'y = 2(7)+5 = 14+5 = 19.' },
  { id: 44, domain: 'D1', difficulty: 'Medium', question: 'Solve: 3x - 7 = 14. What is x?', options: ['3', '7', '9', '6'], correct: 1, explanation: '3x = 21, x = 7.' },
  { id: 45, domain: 'D1', difficulty: 'Easy', question: 'Slope m=3, passes through (0,2). Find y when x=4.', options: ['12', '10', '16', '14'], correct: 3, explanation: 'y = 3(4)+2 = 14.' },

  // ── D2 ADVANCED MATH ──────────────────────────────────────────────────────
  { id: 46, domain: 'D2', difficulty: 'Medium', question: 'Population 1000, grows 10%/year. After 2 years?', options: ['1200', '1250', '1100', '1210'], correct: 3, explanation: 'A = 1000(1.1)² = 1210.' },
  { id: 47, domain: 'D2', difficulty: 'Hard', question: 'Bacteria doubles every 3 hours. Starts 200. After 12 hours?', options: ['1600', '6400', '800', '3200'], correct: 3, explanation: '4 doublings. 200 × 2⁴ = 3200.' },
  { id: 48, domain: 'D2', difficulty: 'Medium', question: 'Car $20000, depreciates 15%/year. Value after 1 year?', options: ['$16000', '$18000', '$17000', '$15000'], correct: 2, explanation: '20000 × 0.85 = $17000.' },

  // ── D4 GEOMETRY ───────────────────────────────────────────────────────────
  { id: 49, domain: 'D4', difficulty: 'Medium', question: 'Cylinder r=4, h=5. Volume? (π≈3.14)', options: ['125.6', '502.4', '62.8', '251.2'], correct: 3, explanation: 'V = πr²h = 3.14×16×5 = 251.2.' },
  { id: 50, domain: 'D4', difficulty: 'Easy', question: 'Right triangle legs: 6 and 8. Hypotenuse?', options: ['12', '10', '14', '9'], correct: 1, explanation: 'c = √(36+64) = √100 = 10.' },
];

const TIMER_DURATION = 45;
const CAR_EMOJIS = ['🏎️', '🚗', '🚕', '🚙'];
const CAR_COLORS = ['#DC2626', '#2563EB', '#10B981', '#F59E0B'];

// ─── RACE CAR COMPONENT ──────────────────────────────────────────────────────
function RaceCar({
  option, index, onTap, answered, isCorrect, isSelected,
}: {
  option: string; index: number;
  onTap: () => void; answered: boolean; isCorrect: boolean; isSelected: boolean;
}) {
  const carX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wobbleY = useRef(new Animated.Value(0)).current;
  const mainAnimRef = useRef<any>(null);

  const color = CAR_COLORS[index];
  const emoji = CAR_EMOJIS[index];

  useEffect(() => {
    // Gentle engine wobble — same for all cars
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleY, { toValue: -2, duration: 280, useNativeDriver: true }),
        Animated.timing(wobbleY, { toValue: 2, duration: 280, useNativeDriver: true }),
      ])
    ).start();

    // ALL cars move at the exact same slow speed
    mainAnimRef.current = Animated.timing(carX, {
      toValue: 220,
      duration: 9000,
      useNativeDriver: true,
    });
    mainAnimRef.current.start();
  }, []);

  useEffect(() => {
    if (!answered) return;
    mainAnimRef.current?.stop();

    if (isCorrect) {
      // ✅ Correct car zooms ahead
      Animated.parallel([
        Animated.timing(carX, { toValue: 280, duration: 350, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true, tension: 280, friction: 5 }),
      ]).start();
    } else if (isSelected && !isCorrect) {
      // ❌ Tapped wrong car — violent shake then shrink (broken)
      Animated.sequence([
        Animated.timing(wobbleY, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(wobbleY, { toValue: 10, duration: 55, useNativeDriver: true }),
        Animated.timing(wobbleY, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(wobbleY, { toValue: 0, duration: 55, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      // Other cars just gently slow to a stop
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 400, useNativeDriver: true }).start();
    }
  }, [answered]);

  // Lane colors
  let laneColor = color + '14';
  let borderCol = color + '45';
  let textCol = '#FFFFFF';

  if (answered) {
    if (isCorrect) {
      laneColor = '#10B98120'; borderCol = '#10B981'; textCol = '#10B981';
    } else if (isSelected) {
      laneColor = '#DC262620'; borderCol = '#DC2626'; textCol = '#DC2626';
    } else {
      laneColor = '#161616'; borderCol = '#252525'; textCol = '#444444';
    }
  }

  return (
    <TouchableOpacity
      onPress={onTap}
      disabled={answered}
      activeOpacity={0.8}
      style={[styles.carLane, { backgroundColor: laneColor, borderColor: borderCol }]}
    >
      {/* Dashed track line */}
      <View style={styles.laneTrackLine} />

      {/* Answer label */}
      <View style={[styles.answerLabel, { borderRightColor: borderCol + '80' }]}>
        <Text style={[styles.answerText, { color: textCol }]}>{option}</Text>
        {answered && isCorrect && <Text style={styles.resultIcon}>🏆</Text>}
        {answered && isSelected && !isCorrect && <Text style={styles.resultIcon}>💥</Text>}
      </View>

      {/* Animated race car */}
      <Animated.View style={[
        styles.carWrapper,
        { transform: [{ translateX: carX }, { translateY: wobbleY }, { scale: scaleAnim }, { scaleX: -1 }] },
      ]}>
        <Text style={styles.carEmoji}>{emoji}</Text>
        {answered && isSelected && !isCorrect && <Text style={styles.brokenIcon}>🔧</Text>}
        {answered && isCorrect && <Text style={styles.winIcon}>🏁</Text>}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function DataDashScreen() {
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
  const [carKey, setCarKey] = useState(0);

  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const bgCarX = useRef(new Animated.Value(-80)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  useEffect(() => {
    const moveBgCar = () => {
      bgCarX.setValue(-80);
      Animated.timing(bgCarX, { toValue: 450, duration: 7000, useNativeDriver: true }).start(() => {
        setTimeout(moveBgCar, 3000);
      });
    };
    setTimeout(moveBgCar, 1500);
  }, []);

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
      question: q.question, domain: q.domain,
      userAnswer: q.options[index], correctAnswer: q.options[q.correct],
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setCurrentQ(n => n + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setCarKey(k => k + 1);
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
    clearInterval(timerRef.current);
    setCurrentQ(0); setAnswered(false); setSelectedAnswer(null);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setCarKey(0);
    setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#FBBF24' : '#DC2626';

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(12, finalScore, xpEarned, 'math_d3', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🏆 Pole Position!' : finalScore >= 40 ? '🏎️ Good Race!' : '🔧 Back to the Pits!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Race Review 🏁</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#DC2626' }]}>
              <Text style={styles.reviewDomain}>{a.domain} · {a.isCorrect ? '✅ Correct' : '❌ Wrong'}</Text>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#DC2626' }]}>
                Your answer: {a.userAnswer}
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
                <Text style={styles.perfLabel}>❤️ Lives</Text>
              </View>
            </View>
          </View>
          <View style={styles.xpCard}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <Text style={styles.xpScore}>{finalScore}</Text>
            <Text style={styles.xpSub}>Score out of 100</Text>
            <Text style={styles.xpGained}>+{xpEarned} XP added to Data Dash</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>🏁 Race History</Text>
            <Text style={styles.historySub}>Race more to see your history!</Text>
            <Text style={styles.historyRank}>Race #1 — Score: {finalScore}</Text>
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
  const domainColor = q.domain === 'D3' ? '#DC2626' : q.domain === 'D1' ? '#2563EB' : q.domain === 'D2' ? '#7C3AED' : '#F59E0B';

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* RACING BACKGROUND */}
        <View style={styles.racingBg} pointerEvents="none">
          {[0,1,2,3,4,5,6,7,8,9].map(i => (
            <View key={i} style={[styles.racingStripe, { left: i * 55 - 20 }]} />
          ))}
          <View style={styles.checkTL}>
            {[0,1,2,3].map(r => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {[0,1,2,3].map(c => (
                  <View key={c} style={[styles.checkCell, { backgroundColor: (r+c)%2===0 ? '#FFFFFF10' : 'transparent' }]} />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.checkBR}>
            {[0,1,2,3].map(r => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {[0,1,2,3].map(c => (
                  <View key={c} style={[styles.checkCell, { backgroundColor: (r+c)%2===0 ? '#FFFFFF10' : 'transparent' }]} />
                ))}
              </View>
            ))}
          </View>
          <Animated.Text style={[styles.bgCar, { transform: [{ translateX: bgCarX }] }]}>🏎️</Animated.Text>
          <View style={styles.speedLine1} />
          <View style={styles.speedLine2} />
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>📊 Data Dash</Text>
            <Text style={styles.gameSubtitle}>D3 · Problem Solving</Text>
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

        {/* STATUS ROW */}
        <View style={styles.statusRow}>
          <View style={styles.livesRow}>
            {[1,2,3].map(i => <Text key={i} style={styles.heart}>{i <= lives ? '❤️' : '🖤'}</Text>)}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
              <View style={styles.redlineMarker} />
            </View>
            <Text style={styles.rpmLabel}>
              {timerPct > 0.5 ? '🟢 CRUISING' : timerPct > 0.25 ? '🟡 PUSHING' : '🔴 REDLINE!'}
            </Text>
          </View>
          <View style={styles.lapBox}>
            <Text style={styles.lapLabel}>LAP</Text>
            <Text style={styles.lapNum}>{currentQ + 1}/{shuffledQ.length}</Text>
          </View>
        </View>

        {/* DOMAIN BADGE */}
        <View style={styles.domainRow}>
          <View style={[styles.domainBadge, { backgroundColor: domainColor + '20', borderColor: domainColor }]}>
            <Text style={[styles.domainText, { color: domainColor }]}>🏎️ {q.domain} · {q.difficulty}</Text>
          </View>
        </View>

        {/* QUESTION */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>⚡ QUICK CALCULATION</Text>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>

        <Text style={styles.trackInstruction}>🏁 Tap the correct car to make it win!</Text>

        {/* RACE LANES */}
        <View style={styles.raceTrack}>
          {q.options.map((option, index) => (
            <RaceCar
              key={`${carKey}-${index}`}
              option={option}
              index={index}
              onTap={() => handleAnswer(index)}
              answered={answered}
              isCorrect={index === q.correct}
              isSelected={selectedAnswer === index}
            />
          ))}
        </View>

      </Animated.View>

      {/* PAUSE OVERLAY */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>🏁 Pit Stop</Text>
            <Text style={styles.pauseSub}>Score: {score} pts</Text>
            <TouchableOpacity style={styles.pauseOption} onPress={togglePause}>
              <Text style={styles.pauseOptionText}>▶️ Back to Race</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseOption} onPress={restartGame}>
              <Text style={styles.pauseOptionText}>🔄 Restart Race</Text>
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
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#0F0F0F' },
  racingBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 },
  racingStripe: { position: 'absolute', top: -300, bottom: -300, width: 35, transform: [{ rotate: '18deg' }], backgroundColor: '#DC262606' },
  checkTL: { position: 'absolute', top: 0, left: 0 },
  checkBR: { position: 'absolute', bottom: 0, right: 0 },
  checkCell: { width: 14, height: 14 },
  bgCar: { position: 'absolute', bottom: 60, fontSize: 26, opacity: 0.12 },
  speedLine1: { position: 'absolute', top: '40%', left: 0, right: 0, height: 1, backgroundColor: '#DC262610' },
  speedLine2: { position: 'absolute', top: '60%', left: 0, right: 0, height: 1, backgroundColor: '#FBBF2408' },
  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20, gap: 12, zIndex: 10 },
  pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#DC2626', fontWeight: '700' },
  scoreBox: { backgroundColor: '#DC262620', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#FBBF24' },
  scoreLabel: { fontSize: 10, color: '#FBBF24', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 24, top: 110, fontSize: 24, fontWeight: '900', color: '#10B981', zIndex: 100 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, backgroundColor: '#1A1A1ACC', borderRadius: 16, padding: 12, zIndex: 10 },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 10 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  timerBarBg: { width: '100%', height: 10, backgroundColor: '#333333', borderRadius: 5, overflow: 'hidden', position: 'relative' },
  timerBarFill: { height: 10, borderRadius: 5 },
  redlineMarker: { position: 'absolute', right: '25%', top: 0, bottom: 0, width: 2, backgroundColor: '#DC2626' },
  rpmLabel: { fontSize: 10, fontWeight: '700', marginTop: 3, color: '#9CA3AF' },
  lapBox: { alignItems: 'center' },
  lapLabel: { fontSize: 9, color: '#FBBF24', fontWeight: '800', letterSpacing: 1 },
  lapNum: { fontSize: 15, color: '#FBBF24', fontWeight: '900' },
  domainRow: { paddingHorizontal: 20, marginBottom: 8, zIndex: 10 },
  domainBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', borderWidth: 1 },
  domainText: { fontSize: 12, fontWeight: '700' },
  questionCard: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 6, borderWidth: 1, borderColor: '#2A2A2A', zIndex: 10 },
  questionLabel: { fontSize: 10, color: '#FBBF24', fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  questionText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', lineHeight: 24 },
  trackInstruction: { fontSize: 11, color: '#FBBF2480', fontWeight: '700', textAlign: 'center', marginBottom: 6, zIndex: 10 },
  raceTrack: { flex: 1, paddingHorizontal: 20, gap: 6, zIndex: 10, paddingBottom: 10 },
  carLane: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', minHeight: 54, position: 'relative' },
  laneTrackLine: { position: 'absolute', top: '50%', left: 120, right: 8, height: 1, backgroundColor: '#FFFFFF08' },
  answerLabel: { width: 120, height: '100%', justifyContent: 'center', paddingHorizontal: 12, borderRightWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  answerText: { fontSize: 14, fontWeight: '800', flex: 1 },
  resultIcon: { fontSize: 16 },
  carWrapper: { position: 'absolute', left: 124, flexDirection: 'row', alignItems: 'center', gap: 3 },
  carEmoji: { fontSize: 30 },
  brokenIcon: { fontSize: 14 },
  winIcon: { fontSize: 16 },
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewDomain: { fontSize: 11, color: '#FBBF24', fontWeight: '700', marginBottom: 4 },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#FBBF24', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  performanceTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#0F0F0F', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#DC2626' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#DC262615', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  xpTitle: { fontSize: 16, color: '#DC2626', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#FBBF24', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#FBBF24', fontWeight: '700' },
  continueBtn: { backgroundColor: '#DC2626', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 20 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#333333' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pauseCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#DC2626', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});