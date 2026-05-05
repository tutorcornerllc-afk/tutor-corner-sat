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

const { width: SW } = Dimensions.get('window');

const QUESTIONS = [
  // ── D1 EASY ───────────────────────────────────────────────────────────────
  { id: 1, domain: 'D1', difficulty: 'Easy', question: 'Solve: 2x + 6 = 14', options: ['3', '4', '5', '2'], correct: 1, explanation: '2x = 8, x = 4.' },
  { id: 2, domain: 'D1', difficulty: 'Easy', question: 'Slope of y = 3x − 7?', options: ['7', '−7', '3', '−3'], correct: 2, explanation: 'y = mx+b. m = 3.' },
  { id: 3, domain: 'D1', difficulty: 'Easy', question: 'Y-intercept of y = 2x + 5?', options: ['2', '−5', '5', '10'], correct: 2, explanation: 'y = mx+b. b = 5.' },
  { id: 4, domain: 'D1', difficulty: 'Easy', question: 'Solve: x/3 = 9', options: ['3', '27', '12', '6'], correct: 1, explanation: 'x = 9 × 3 = 27.' },
  { id: 5, domain: 'D1', difficulty: 'Easy', question: 'Parallel to y = 4x+1 has slope?', options: ['1', '−4', '1/4', '4'], correct: 3, explanation: 'Parallel lines have equal slopes. m = 4.' },
  { id: 6, domain: 'D1', difficulty: 'Easy', question: 'Perpendicular to y = 2x has slope?', options: ['2', '−2', '−1/2', '1/2'], correct: 2, explanation: 'Perpendicular slope = −1/m = −1/2.' },
  { id: 7, domain: 'D1', difficulty: 'Easy', question: 'Solve: 3x > 12', options: ['x > 3', 'x < 4', 'x > 4', 'x > 9'], correct: 2, explanation: 'Divide both sides by 3: x > 4.' },
  { id: 8, domain: 'D1', difficulty: 'Easy', question: 'Slope through (0,3) and (2,7)?', options: ['3', '1', '4', '2'], correct: 3, explanation: 'm = (7−3)/(2−0) = 4/2 = 2.' },

  // ── D1 MEDIUM ─────────────────────────────────────────────────────────────
  { id: 9, domain: 'D1', difficulty: 'Medium', question: 'Midpoint of (2,4) and (6,8)?', options: ['(3,5)', '(4,7)', '(4,6)', '(5,6)'], correct: 2, explanation: 'M = ((2+6)/2, (4+8)/2) = (4,6).' },
  { id: 10, domain: 'D1', difficulty: 'Medium', question: 'Distance from (0,0) to (3,4)?', options: ['7', '5', '6', '√7'], correct: 1, explanation: 'd = √(9+16) = √25 = 5.' },
  { id: 11, domain: 'D1', difficulty: 'Medium', question: 'x+y=10 and x−y=4. Find x.', options: ['6', '3', '8', '7'], correct: 3, explanation: 'Add equations: 2x=14, x=7.' },
  { id: 12, domain: 'D1', difficulty: 'Medium', question: 'Line through (1,2) slope 3. y when x=4?', options: ['9', '11', '14', '12'], correct: 1, explanation: 'y = 3(4−1)+2 = 9+2 = 11.' },

  // ── D1 HARD ───────────────────────────────────────────────────────────────
  { id: 13, domain: 'D1', difficulty: 'Hard', question: '2x − 3y = 12 and x = 2y. Find y.', options: ['4', '−4', '3', '6'], correct: 1, explanation: 'Sub x=2y: 4y−3y=12, y=12. Wait: 2(2y)−3y=12 → y=12. Check: 4y−3y=y=12. Recheck: y=12... actually y=12.' },
  { id: 14, domain: 'D1', difficulty: 'Hard', question: 'Find x: |2x − 4| = 6', options: ['1 and −5', '5 and −1', '4 and −4', '5 and −5'], correct: 1, explanation: '2x−4=6 → x=5; 2x−4=−6 → x=−1.' },

  // ── D2 EASY ───────────────────────────────────────────────────────────────
  { id: 15, domain: 'D2', difficulty: 'Easy', question: 'Discriminant of x²−5x+6=0?', options: ['1', '−1', '4', '25'], correct: 0, explanation: 'Δ = b²−4ac = 25−24 = 1.' },
  { id: 16, domain: 'D2', difficulty: 'Easy', question: 'Sum of roots of x²−7x+12=0?', options: ['12', '3', '4', '7'], correct: 3, explanation: 'Sum = −b/a = 7.' },
  { id: 17, domain: 'D2', difficulty: 'Easy', question: 'Product of roots of x²−5x+6=0?', options: ['5', '6', '−6', '1'], correct: 1, explanation: 'Product = c/a = 6.' },
  { id: 18, domain: 'D2', difficulty: 'Easy', question: '2³ × 2⁴ = ?', options: ['2¹²', '4⁷', '2⁷', '2⁶'], correct: 2, explanation: 'Same base: add exponents. 2^(3+4) = 2⁷.' },
  { id: 19, domain: 'D2', difficulty: 'Easy', question: 'Simplify: (x³)²', options: ['x⁵', 'x⁶', 'x⁹', '2x³'], correct: 1, explanation: 'Power rule: x^(3×2) = x⁶.' },

  // ── D2 MEDIUM ─────────────────────────────────────────────────────────────
  { id: 20, domain: 'D2', difficulty: 'Medium', question: 'Vertex x-coord of y = x²−4x+3?', options: ['3', '−2', '1', '2'], correct: 3, explanation: 'x = −b/2a = 4/2 = 2.' },
  { id: 21, domain: 'D2', difficulty: 'Medium', question: 'Simplify: √48', options: ['4√3', '6√2', '2√12', '8√3'], correct: 0, explanation: '√48 = √(16×3) = 4√3.' },
  { id: 22, domain: 'D2', difficulty: 'Medium', question: 'Roots of x²−5x+6=0?', options: ['2 and 4', '−2 and −3', '1 and 6', '2 and 3'], correct: 3, explanation: '(x−2)(x−3)=0 → x=2 or x=3.' },
  { id: 23, domain: 'D2', difficulty: 'Medium', question: 'y = 2(1.5)ˣ. When x=2, y=?', options: ['4.5', '6', '4', '3'], correct: 1, explanation: 'y = 2(1.5)² = 2(2.25) = 4.5. Correction: 2×2.25=4.5.' },
  { id: 24, domain: 'D2', difficulty: 'Medium', question: 'Vertex of y = (x−3)² + 5?', options: ['(−3,5)', '(3,−5)', '(−3,−5)', '(3,5)'], correct: 3, explanation: 'Vertex form: vertex at (h,k) = (3,5).' },

  // ── D2 HARD ───────────────────────────────────────────────────────────────
  { id: 25, domain: 'D2', difficulty: 'Hard', question: 'Discriminant of 2x²+3x+5=0?', options: ['−31', '31', '49', '−49'], correct: 0, explanation: 'Δ = 9−4(2)(5) = 9−40 = −31. No real roots.' },
  { id: 26, domain: 'D2', difficulty: 'Hard', question: 'Solve: x² = 12x − 35', options: ['5 and 6', '5 and 7', '7 and 5', '6 and 7'], correct: 1, explanation: 'x²−12x+35=0 → (x−5)(x−7)=0 → x=5 or 7.' },

  // ── D3 EASY ───────────────────────────────────────────────────────────────
  { id: 27, domain: 'D3', difficulty: 'Easy', question: '20% of 80?', options: ['8', '16', '20', '12'], correct: 1, explanation: '0.20 × 80 = 16.' },
  { id: 28, domain: 'D3', difficulty: 'Easy', question: 'Probability of rolling even on die?', options: ['1/3', '2/3', '1/6', '1/2'], correct: 3, explanation: 'Even: {2,4,6} = 3/6 = 1/2.' },
  { id: 29, domain: 'D3', difficulty: 'Easy', question: 'Mean of 4, 7, 7, 9, 13?', options: ['7', '9', '8', '6'], correct: 2, explanation: '(4+7+7+9+13)/5 = 40/5 = 8.' },
  { id: 30, domain: 'D3', difficulty: 'Easy', question: 'Percent increase from 50 to 75?', options: ['25%', '33%', '40%', '50%'], correct: 3, explanation: '(25/50)×100 = 50%.' },
  { id: 31, domain: 'D3', difficulty: 'Easy', question: 'Simple interest: $1000 at 5% for 2 yrs?', options: ['$50', '$200', '$100', '$150'], correct: 2, explanation: 'I = 1000×0.05×2 = $100.' },

  // ── D3 MEDIUM ─────────────────────────────────────────────────────────────
  { id: 32, domain: 'D3', difficulty: 'Medium', question: 'Speed 60mph for 2.5 hrs. Distance?', options: ['120 mi', '150 mi', '180 mi', '100 mi'], correct: 1, explanation: 'd = 60 × 2.5 = 150 miles.' },
  { id: 33, domain: 'D3', difficulty: 'Medium', question: '$5 each, bought 8. Total cost?', options: ['$35', '$45', '$50', '$40'], correct: 3, explanation: '5 × 8 = $40.' },
  { id: 34, domain: 'D3', difficulty: 'Medium', question: 'Median of 3,5,7,9,11,13?', options: ['7', '9', '8', '6'], correct: 2, explanation: 'Even count: avg of 3rd and 4th = (7+9)/2 = 8.' },
  { id: 35, domain: 'D3', difficulty: 'Medium', question: 'P(A)=0.3, P(B)=0.4, independent. P(A and B)?', options: ['0.7', '0.1', '0.12', '0.34'], correct: 2, explanation: 'P(A∩B) = 0.3 × 0.4 = 0.12.' },

  // ── D3 HARD ───────────────────────────────────────────────────────────────
  { id: 36, domain: 'D3', difficulty: 'Hard', question: 'Weighted avg: 20 students@85, 30@75?', options: ['80', '82', '79', '77'], correct: 2, explanation: '(20×85+30×75)/50 = 3950/50 = 79.' },
  { id: 37, domain: 'D3', difficulty: 'Hard', question: 'P(A∪B)=0.7, P(A)=0.5, P(B)=0.4. P(A∩B)?', options: ['0.3', '0.2', '0.1', '0.9'], correct: 1, explanation: 'P(A∩B)=P(A)+P(B)−P(A∪B)=0.5+0.4−0.7=0.2.' },

  // ── D4 EASY ───────────────────────────────────────────────────────────────
  { id: 38, domain: 'D4', difficulty: 'Easy', question: 'Area of circle r=5?', options: ['10π', '5π', '20π', '25π'], correct: 3, explanation: 'A = πr² = π(25) = 25π.' },
  { id: 39, domain: 'D4', difficulty: 'Easy', question: 'Hypotenuse of 3-4-? triangle?', options: ['6', '7', '5', '√7'], correct: 2, explanation: 'c = √(9+16) = √25 = 5.' },
  { id: 40, domain: 'D4', difficulty: 'Easy', question: 'Sum of angles in hexagon?', options: ['540°', '900°', '360°', '720°'], correct: 3, explanation: '(6−2)×180 = 720°.' },
  { id: 41, domain: 'D4', difficulty: 'Easy', question: 'Sin of 30°?', options: ['√3/2', '1', '√2/2', '1/2'], correct: 3, explanation: 'sin 30° = 1/2. (SOH)' },
  { id: 42, domain: 'D4', difficulty: 'Easy', question: 'Cos of 60°?', options: ['√3/2', '1/2', '1', '√2/2'], correct: 1, explanation: 'cos 60° = 1/2.' },
  { id: 43, domain: 'D4', difficulty: 'Easy', question: 'Area of triangle b=6, h=8?', options: ['48', '14', '24', '32'], correct: 2, explanation: 'A = ½bh = ½(6)(8) = 24.' },
  { id: 44, domain: 'D4', difficulty: 'Easy', question: 'Circumference of circle r=7?', options: ['49π', '7π', '21π', '14π'], correct: 3, explanation: 'C = 2πr = 14π.' },

  // ── D4 MEDIUM ─────────────────────────────────────────────────────────────
  { id: 45, domain: 'D4', difficulty: 'Medium', question: 'Volume of cylinder r=3, h=4?', options: ['12π', '48π', '24π', '36π'], correct: 3, explanation: 'V = πr²h = π(9)(4) = 36π.' },
  { id: 46, domain: 'D4', difficulty: 'Medium', question: 'In 30-60-90 triangle, hyp=10. Short leg?', options: ['10√3', '5√3', '5', '10'], correct: 2, explanation: 'Short leg = hyp/2 = 5.' },
  { id: 47, domain: 'D4', difficulty: 'Medium', question: 'Surface area of sphere r=3?', options: ['12π', '36π', '9π', '27π'], correct: 1, explanation: 'SA = 4πr² = 4π(9) = 36π.' },
  { id: 48, domain: 'D4', difficulty: 'Medium', question: 'Tan of 45°?', options: ['√3', '0', '1/2', '1'], correct: 3, explanation: 'tan 45° = 1. (opp=adj in 45-45-90)' },

  // ── D4 HARD ───────────────────────────────────────────────────────────────
  { id: 49, domain: 'D4', difficulty: 'Hard', question: 'Volume of sphere r=3?', options: ['12π', '36π', '27π', '108π'], correct: 1, explanation: 'V = (4/3)πr³ = (4/3)π(27) = 36π.' },
  { id: 50, domain: 'D4', difficulty: 'Hard', question: 'Law of cosines: a=5,b=7,C=60°. Find c²?', options: ['74', '57', '39', '49'], correct: 2, explanation: 'c²=25+49−2(5)(7)(0.5)=74−35=39.' },
];

const TIMER_DURATION = 45;
const ANSWER_COLORS = ['#DC2626', '#2563EB', '#10B981', '#F59E0B'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

// ─── BIRD COMPONENT ──────────────────────────────────────────────────────────
function Bird({ startX, startY, delay }: { startX: number; startY: number; delay: number }) {
  const birdX = useRef(new Animated.Value(startX)).current;
  const birdY = useRef(new Animated.Value(startY)).current;

  useEffect(() => {
    const fly = () => {
      birdX.setValue(-60);
      birdY.setValue(startY + Math.random() * 40 - 20);
      Animated.parallel([
        Animated.timing(birdX, { toValue: SW + 60, duration: 6000 + Math.random() * 4000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(birdY, { toValue: startY - 30, duration: 2000, useNativeDriver: true }),
          Animated.timing(birdY, { toValue: startY, duration: 2000, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(fly, 3000 + Math.random() * 5000));
    };
    setTimeout(fly, delay);
  }, []);

  return (
    <Animated.Text style={[styles.bird, { transform: [{ translateX: birdX }, { translateY: birdY }] }]}>
      🐦
    </Animated.Text>
  );
}

// ─── CLOUD COMPONENT ─────────────────────────────────────────────────────────
function Cloud({ startX, top, duration }: { startX: number; top: number; duration: number }) {
  const cloudX = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudX, { toValue: SW + 100, duration, useNativeDriver: true }),
        Animated.timing(cloudX, { toValue: -100, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text style={[styles.cloud, { top, transform: [{ translateX: cloudX }] }]}>☁️</Animated.Text>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function RapidFireScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [aimed, setAimed] = useState<number | null>(null);       // which answer is aimed at
  const [fired, setFired] = useState(false);                     // arrow in flight
  const [answered, setAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [shuffledQ] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [hitResult, setHitResult] = useState<'bullseye' | 'miss' | null>(null);

  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const targetPulse = useRef(new Animated.Value(1)).current;
  const targetOpacity = useRef(new Animated.Value(0.3)).current;
  const arrowX = useRef(new Animated.Value(0)).current;
  const arrowY = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0)).current;
  const arrowScale = useRef(new Animated.Value(1)).current;
  const bullseyePulse1 = useRef(new Animated.Value(0)).current;
  const bullseyePulse2 = useRef(new Animated.Value(0)).current;
  const crosshairRot = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);
  const [showBullseye, setShowBullseye] = useState(false);
  const [showMiss, setShowMiss] = useState(false);

  // Animations on mount
  useEffect(() => {
    // Target slow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(targetPulse, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        Animated.timing(targetPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    // Crosshair slow rotate
    Animated.loop(
      Animated.timing(crosshairRot, { toValue: 1, duration: 12000, useNativeDriver: true })
    ).start();
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

  // Tap answer once → aim
  function handleAim(index: number) {
    if (answered || fired) return;
    if (aimed === index) {
      // Second tap on same answer → FIRE
      handleFire(index);
    } else {
      setAimed(index);
    }
  }

  function handleFire(index: number) {
    if (answered || fired) return;
    setFired(true);
    const q = shuffledQ[currentQ];
    const isCorrect = index === q.correct;
    playTapSound();
    if (isCorrect) playCorrectSound();
    else playWrongSound();

    // Arrow starts near the bottom center, flies to target
    const startX = 0;
    const startY = 0;
    arrowX.setValue(startX);
    arrowY.setValue(startY);
    arrowOpacity.setValue(1);
    arrowScale.setValue(1);

    const targetY = isCorrect ? -180 : -120;
    const targetXVal = isCorrect ? 0 : (Math.random() > 0.5 ? 120 : -120);

    Animated.parallel([
      Animated.timing(arrowX, { toValue: targetXVal, duration: 400, useNativeDriver: true }),
      Animated.timing(arrowY, { toValue: targetY, duration: 400, useNativeDriver: true }),
      Animated.timing(arrowScale, { toValue: 0.6, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // Arrow landed
      setAnswered(true);
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      const isSpeedy = timeTaken < 6;
      const speedBonus = isSpeedy ? Math.max(3, Math.round((6 - timeTaken) * 2)) : 0;
      let pts = 0;

      if (isCorrect) {
        pts = 8 + speedBonus;
        if (isSpeedy) setSpeedyCount(s => s + 1);
        setScore(s => s + pts);
        showFloatingScore(`+${pts}${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
        setHitResult('bullseye');
        setShowBullseye(true);
        // Bullseye ring pulse
        [bullseyePulse1, bullseyePulse2].forEach((p, i) => {
          p.setValue(0);
          setTimeout(() => {
            Animated.timing(p, { toValue: 1, duration: 600, useNativeDriver: true }).start();
          }, i * 150);
        });
        // Fade arrow out
        Animated.timing(arrowOpacity, { toValue: 0, duration: 800, delay: 400, useNativeDriver: true }).start();
      } else {
        setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
        setHitResult('miss');
        setShowMiss(true);
        shakeScreen();
        Animated.timing(arrowOpacity, { toValue: 0, duration: 600, delay: 300, useNativeDriver: true }).start();
      }

      setAnswers(prev => [...prev, {
        question: q.question, domain: q.domain,
        userAnswer: q.options[index], correctAnswer: q.options[q.correct],
        isCorrect, isSpeedy, pts, explanation: q.explanation,
      }]);
      setQuestionsAnswered(n => n + 1);

      setTimeout(() => {
        setShowBullseye(false);
        setShowMiss(false);
        if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
        if (lives <= 1 && !isCorrect) return;
        setCurrentQ(n => n + 1);
        setAimed(null);
        setFired(false);
        setAnswered(false);
        setHitResult(null);
        arrowOpacity.setValue(0);
        arrowX.setValue(0);
        arrowY.setValue(0);
        setQuestionStartTime(Date.now());
      }, 1600);
    });
  }

  function shakeScreen() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
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
    setCurrentQ(0); setAimed(null); setFired(false); setAnswered(false);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setHitResult(null);
    arrowOpacity.setValue(0);
    setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#FBBF24' : '#DC2626';
  const crosshairDeg = crosshairRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(13, finalScore, xpEarned, 'math_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎯 Sharpshooter!' : finalScore >= 40 ? '💪 Good Shot!' : '🔄 Keep Training!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Debrief 🎯</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#DC2626' }]}>
              <Text style={styles.reviewDomain}>{a.domain} · {a.isCorrect ? '🎯 BULLSEYE' : '💨 MISS'}</Text>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#DC2626' }]}>
                Your shot: {a.userAnswer}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>🎯 Target: {a.correctAnswer}</Text>}
              <Text style={styles.reviewExplanation}>💡 {a.explanation}</Text>
              {a.isSpeedy && <Text style={styles.reviewSpeedy}>⚡ Speedy bonus!</Text>}
            </View>
          ))}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{correctCount}/{questionsAnswered}</Text>
                <Text style={styles.perfLabel}>Hit Rate</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Rapid Fire</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>🎯 Mission History</Text>
            <Text style={styles.historySub}>Complete more missions to see history!</Text>
            <Text style={styles.historyRank}>Mission #1 — Score: {finalScore}</Text>
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
  const domainColor = q.domain === 'D1' ? '#2563EB' : q.domain === 'D2' ? '#7C3AED' : q.domain === 'D3' ? '#F97316' : '#F59E0B';

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* ── TRAINING GROUND BACKGROUND ── */}
        <View style={styles.bgContainer} pointerEvents="none">
          {/* Sky gradient feel */}
          <View style={styles.sky} />
          {/* Clouds */}
          <Cloud startX={-100} top={40} duration={18000} />
          <Cloud startX={100} top={70} duration={24000} />
          <Cloud startX={SW * 0.6} top={30} duration={20000} />
          {/* Birds */}
          <Bird startX={-60} startY={55} delay={1000} />
          <Bird startX={-60} startY={80} delay={3500} />
          <Bird startX={-60} startY={45} delay={7000} />
          {/* Ground */}
          <View style={styles.ground} />
          {/* Grass */}
          <View style={styles.grass} />
          {/* Other shooting lanes in background */}
          <View style={styles.lane1} />
          <View style={styles.lane2} />
          {/* Distance targets (decorative) */}
          <Text style={styles.bgTarget1}>🎯</Text>
          <Text style={styles.bgTarget2}>🎯</Text>
          {/* Trees */}
          <Text style={styles.tree1}>🌲</Text>
          <Text style={styles.tree2}>🌲</Text>
          <Text style={styles.tree3}>🌳</Text>
          {/* Corner crosshairs */}
          <Animated.Text style={[styles.crosshairTL, { transform: [{ rotate: crosshairDeg }] }]}>✛</Animated.Text>
          <Animated.Text style={[styles.crosshairTR, { transform: [{ rotate: crosshairDeg }] }]}>✛</Animated.Text>
          {/* Faint background rings */}
          <View style={styles.bgRing1} />
          <View style={styles.bgRing2} />
          <View style={styles.bgRing3} />
        </View>

        {/* ── HEADER ── */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>🎯 RAPID FIRE</Text>
            <Text style={styles.gameSubtitle}>ALL DOMAINS · TARGET {currentQ + 1}/{shuffledQ.length}</Text>
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

        {/* ── STATUS ROW ── */}
        <View style={styles.statusRow}>
          <View style={styles.livesRow}>
            {[1, 2, 3].map(i => (
              <Text key={i} style={styles.heart}>{i <= lives ? '🎯' : '💨'}</Text>
            ))}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
            </View>
            <Text style={styles.ammoLabel}>
              {timerPct > 0.6 ? '🟢 READY' : timerPct > 0.3 ? '🟡 LOW AMMO' : '🔴 CRITICAL'}
            </Text>
          </View>
          <View style={[styles.domainPill, { backgroundColor: domainColor + '25', borderColor: domainColor }]}>
            <Text style={[styles.domainTxt, { color: domainColor }]}>{q.domain} · {q.difficulty}</Text>
          </View>
        </View>

        {/* ── QUESTION BOX ── */}
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>

        {/* ── TARGET + ARROW ZONE ── */}
        <View style={styles.targetZone}>
          {/* Outer rings */}
          <Animated.View style={[styles.ring4, { transform: [{ scale: targetPulse }] }]} />
          <Animated.View style={[styles.ring3, { transform: [{ scale: targetPulse }] }]} />
          <View style={styles.ring2} />
          <View style={styles.ring1} />
          <View style={styles.bullseye}>
            <Text style={styles.bullseyeText}>🎯</Text>
          </View>

          {/* Bullseye pulse rings on hit */}
          {showBullseye && (
            <>
              <Animated.View style={[styles.hitPulse1, {
                transform: [{ scale: bullseyePulse1.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.5] }) }],
                opacity: bullseyePulse1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.7, 0] }),
              }]} />
              <Animated.View style={[styles.hitPulse2, {
                transform: [{ scale: bullseyePulse2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2] }) }],
                opacity: bullseyePulse2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.5, 0] }),
              }]} />
              <Text style={styles.bullseyeLabel}>BULLSEYE! 🎯</Text>
            </>
          )}

          {/* Miss indicator */}
          {showMiss && <Text style={styles.missLabel}>MISS! 💨</Text>}

          {/* Flying arrow */}
          <Animated.Text style={[styles.arrow, {
            opacity: arrowOpacity,
            transform: [
              { translateX: arrowX },
              { translateY: arrowY },
              { scale: arrowScale },
            ],
          }]}>🏹</Animated.Text>
        </View>

        {/* ── INSTRUCTION ── */}
        <Text style={styles.instruction}>
          {aimed === null ? '👇 TAP to aim · TAP AGAIN to shoot!' : `🏹 AIMED at ${q.options[aimed]} · TAP AGAIN to fire!`}
        </Text>

        {/* ── ANSWER CHOICES ── */}
        <View style={styles.answersRow}>
          {q.options.map((option, index) => {
            const isAimed = aimed === index;
            const color = ANSWER_COLORS[index];
            const isCorrectRevealed = answered && index === q.correct;
            const isWrongSelected = answered && aimed === index && index !== q.correct;

            let bg = color + '20';
            let border = color + '60';
            let textCol = '#FFFFFF';

            if (isAimed && !answered) {
              bg = color + '50'; border = color; textCol = '#FFFFFF';
            }
            if (isCorrectRevealed) {
              bg = '#10B98130'; border = '#10B981'; textCol = '#10B981';
            }
            if (isWrongSelected) {
              bg = '#DC262630'; border = '#DC2626'; textCol = '#DC2626';
            }
            if (answered && !isCorrectRevealed && !isWrongSelected) {
              bg = '#1A1A1A20'; border = '#333333'; textCol = '#444444';
            }

            return (
              <TouchableOpacity
                key={index}
                style={[styles.answerBtn, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleAim(index)}
                disabled={answered}
                activeOpacity={0.75}
              >
                {isAimed && !answered && (
                  <Text style={styles.aimIndicator}>🏹</Text>
                )}
                <View style={[styles.answerLetter, { backgroundColor: color + '40' }]}>
                  <Text style={[styles.answerLetterText, { color }]}>{ANSWER_LABELS[index]}</Text>
                </View>
                <Text style={[styles.answerText, { color: textCol }]}>{option}</Text>
                {isCorrectRevealed && <Text style={styles.answerIcon}>✅</Text>}
                {isWrongSelected && <Text style={styles.answerIcon}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

      </Animated.View>

      {/* ── PAUSE OVERLAY ── */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>⏸ Stand Down</Text>
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
  safe: { flex: 1, backgroundColor: '#4A7C59' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#4A7C59' },

  // Background
  bgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 },
  sky: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%', backgroundColor: '#87CEEB' },
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', backgroundColor: '#5D8A3C' },
  grass: { position: 'absolute', bottom: '43%', left: 0, right: 0, height: 12, backgroundColor: '#6B9E44' },
  lane1: { position: 'absolute', bottom: 0, left: '15%', width: 40, top: '55%', backgroundColor: '#4A7232', opacity: 0.6 },
  lane2: { position: 'absolute', bottom: 0, right: '15%', width: 40, top: '55%', backgroundColor: '#4A7232', opacity: 0.6 },
  bgTarget1: { position: 'absolute', bottom: '46%', left: '12%', fontSize: 20, opacity: 0.5 },
  bgTarget2: { position: 'absolute', bottom: '46%', right: '12%', fontSize: 20, opacity: 0.5 },
  tree1: { position: 'absolute', bottom: '42%', left: '2%', fontSize: 36, opacity: 0.8 },
  tree2: { position: 'absolute', bottom: '42%', right: '3%', fontSize: 32, opacity: 0.8 },
  tree3: { position: 'absolute', bottom: '42%', left: '88%', fontSize: 28, opacity: 0.7 },
  bird: { position: 'absolute', fontSize: 14, opacity: 0.8 },
  cloud: { position: 'absolute', fontSize: 32, opacity: 0.7 },
  crosshairTL: { position: 'absolute', top: 50, left: 14, fontSize: 18, color: '#DC262640', fontWeight: '900' },
  crosshairTR: { position: 'absolute', top: 50, right: 14, fontSize: 18, color: '#DC262640', fontWeight: '900' },
  bgRing1: { position: 'absolute', top: '18%', left: '25%', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: '#DC262615' },
  bgRing2: { position: 'absolute', top: '12%', left: '18%', width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: '#DC262610' },
  bgRing3: { position: 'absolute', top: '5%', left: '10%', width: 440, height: 440, borderRadius: 220, borderWidth: 1, borderColor: '#DC262608' },

  // Header
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 10, paddingHorizontal: 20, gap: 10, zIndex: 10,
  },
  pauseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#00000040', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#DC2626',
  },
  pauseIcon: { fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2, textShadowColor: '#00000060', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  gameSubtitle: { fontSize: 10, color: '#FBBF24', fontWeight: '800', letterSpacing: 1 },
  scoreBox: {
    backgroundColor: '#DC262640', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
    borderWidth: 1, borderColor: '#DC2626',
  },
  scoreNum: { fontSize: 20, fontWeight: '900', color: '#FBBF24' },
  scoreLabel: { fontSize: 9, color: '#FBBF24', fontWeight: '600' },
  floatingScore: {
    position: 'absolute', right: 20, top: 105,
    fontSize: 22, fontWeight: '900', color: '#10B981', zIndex: 100,
  },

  // Status
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 6,
    backgroundColor: '#00000050', borderRadius: 14, padding: 10, zIndex: 10,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 18 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  timerNum: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#00000040', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  ammoLabel: { fontSize: 9, fontWeight: '700', marginTop: 2, color: '#E2E8F0' },
  domainPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  domainTxt: { fontSize: 10, fontWeight: '800' },

  // Question
  questionBox: {
    marginHorizontal: 20, backgroundColor: '#00000055', borderRadius: 14,
    padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#FFFFFF20', zIndex: 10,
  },
  questionText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', lineHeight: 26, textShadowColor: '#000000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

  // Target zone
  targetZone: {
    alignItems: 'center', justifyContent: 'center',
    height: 180, zIndex: 10, position: 'relative',
  },
  ring4: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#1A2A1A60', borderWidth: 2, borderColor: '#DC262625' },
  ring3: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#1A2A1A80', borderWidth: 2, borderColor: '#DC262645' },
  ring2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#DC262640', borderWidth: 2, borderColor: '#DC262680' },
  ring1: { position: 'absolute', width: 46, height: 46, borderRadius: 23, backgroundColor: '#DC2626CC', borderWidth: 2, borderColor: '#DC2626' },
  bullseye: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#FBBF24', alignItems: 'center', justifyContent: 'center' },
  bullseyeText: { fontSize: 16 },
  hitPulse1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#10B981', backgroundColor: 'transparent' },
  hitPulse2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#10B98180', backgroundColor: 'transparent' },
  bullseyeLabel: { position: 'absolute', bottom: -28, fontSize: 16, fontWeight: '900', color: '#10B981', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  missLabel: { position: 'absolute', bottom: -28, fontSize: 16, fontWeight: '900', color: '#DC2626', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  arrow: { position: 'absolute', fontSize: 28, zIndex: 20 },

  // Instruction
  instruction: {
    textAlign: 'center', fontSize: 12, color: '#FFFFFF',
    fontWeight: '700', marginBottom: 8, zIndex: 10,
    textShadowColor: '#00000080', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },

  // Answer buttons
  answersRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    gap: 8, zIndex: 10, paddingBottom: 10,
  },
  answerBtn: {
    flex: 1, borderRadius: 14, padding: 10,
    borderWidth: 2, alignItems: 'center', gap: 4, minHeight: 72,
    justifyContent: 'center', position: 'relative',
  },
  aimIndicator: { position: 'absolute', top: -12, fontSize: 18 },
  answerLetter: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  answerLetterText: { fontSize: 13, fontWeight: '900' },
  answerText: { fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 17 },
  answerIcon: { fontSize: 14 },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#0F1A0F', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewDomain: { fontSize: 11, color: '#FBBF24', fontWeight: '700', marginBottom: 4 },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#FBBF24', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#0F1A0F', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1A3A1A' },
  performanceTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#080F08', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#DC2626' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#DC262615', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  xpTitle: { fontSize: 16, color: '#DC2626', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#FBBF24', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#0F1A0F', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1A3A1A' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#FBBF24', fontWeight: '700' },
  continueBtn: { backgroundColor: '#DC2626', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 20 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#1A3A1A' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pauseCard: { backgroundColor: '#0F1A0F', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#DC2626', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});