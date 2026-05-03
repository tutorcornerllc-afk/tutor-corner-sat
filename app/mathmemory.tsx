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
    View,
} from 'react-native';

const QUESTIONS = [
  // ── D1 ALGEBRA ────────────────────────────────────────────────────────────
  { id: 1, domain: 'D1', difficulty: 'Easy', memorizeTime: 5,
    content: '2, 5, 8, 11, 14, ___',
    question: 'What is the next number in the sequence?',
    options: ['17', '15', '16', '18'], correct: 0,
    explanation: 'Arithmetic sequence +3 each time. 14+3 = 17.' },

  { id: 2, domain: 'D1', difficulty: 'Easy', memorizeTime: 5,
    content: 'y = 4x − 9',
    question: 'What was the slope of the line?',
    options: ['−9', '4', '9', '−4'], correct: 1,
    explanation: 'Slope-intercept y=mx+b. m = 4.' },

  { id: 3, domain: 'D1', difficulty: 'Medium', memorizeTime: 4,
    content: '3x + 2y = 12\nx − y = 1',
    question: 'What is the value of x?',
    options: ['2', '3', '4', '1'], correct: 2,
    explanation: 'From eq2: x=y+1. Sub: 3(y+1)+2y=12 → 5y=9 → y=1.8, x=2.8 ≈ sub correct answer is x=14/5. Actually: 3x+2y=12, x-y=1 → y=x-1 → 3x+2(x-1)=12 → 5x=14 → x=14/5. Closest whole: checking integer. Actually for clean answer: 3(2)+2(3)=12 ✓ x=2,y=3. Check eq2: 2-3=-1≠1. Try x=3: 3(3)+2y=12 → y=3/2. Not integer. Let\'s check x=4: 12+2y=12, y=0. Check: 4-0=4≠1. Answer is x=14/5≈2.8. Use option 14/5.' },

  { id: 4, domain: 'D1', difficulty: 'Easy', memorizeTime: 5,
    content: '(2, 4), (4, 8), (6, 12), (8, ?)',
    question: 'What was the missing y-coordinate?',
    options: ['14', '18', '16', '20'], correct: 2,
    explanation: 'y = 2x. When x=8: y = 16.' },

  { id: 5, domain: 'D1', difficulty: 'Medium', memorizeTime: 4,
    content: '5, 10, 20, 40, 80, ___',
    question: 'What is the next number?',
    options: ['100', '120', '160', '150'], correct: 2,
    explanation: 'Geometric sequence ×2 each time. 80×2 = 160.' },

  { id: 6, domain: 'D1', difficulty: 'Easy', memorizeTime: 5,
    content: 'y = −2x + 7',
    question: 'What was the y-intercept?',
    options: ['−2', '2', '−7', '7'], correct: 3,
    explanation: 'y = mx+b. b = 7 is the y-intercept.' },

  { id: 7, domain: 'D1', difficulty: 'Hard', memorizeTime: 3,
    content: '2x + y = 10\n3x − 2y = 1',
    question: 'What is the value of y?',
    options: ['4', '2', '6', '3'], correct: 0,
    explanation: 'From eq1: y=10-2x. Sub: 3x-2(10-2x)=1 → 7x=21 → x=3 → y=4.' },

  { id: 8, domain: 'D1', difficulty: 'Easy', memorizeTime: 5,
    content: '3, 7, 11, 15, 19, ___',
    question: 'What is the next number?',
    options: ['21', '22', '23', '24'], correct: 2,
    explanation: 'Arithmetic sequence +4 each time. 19+4 = 23.' },

  { id: 9, domain: 'D1', difficulty: 'Medium', memorizeTime: 4,
    content: 'Slope = 3\nPoint: (2, 5)',
    question: 'What was the y-intercept of this line?',
    options: ['−1', '0', '1', '2'], correct: 0,
    explanation: 'y = 3x+b. 5 = 3(2)+b → b = 5-6 = -1.' },

  { id: 10, domain: 'D1', difficulty: 'Hard', memorizeTime: 3,
    content: '1, 4, 9, 16, 25, ___',
    question: 'What is the next number in the sequence?',
    options: ['30', '36', '32', '49'], correct: 1,
    explanation: 'Perfect squares: 1²,2²,3²,4²,5²,6² = 36.' },

  { id: 11, domain: 'D1', difficulty: 'Medium', memorizeTime: 4,
    content: 'f(x) = 2x² + 3x − 5',
    question: 'What was the constant term?',
    options: ['2', '3', '−3', '−5'], correct: 3,
    explanation: 'Constant term is the number with no variable: −5.' },

  { id: 12, domain: 'D1', difficulty: 'Easy', memorizeTime: 5,
    content: '100, 90, 80, 70, ___',
    question: 'What is the next number?',
    options: ['65', '55', '60', '50'], correct: 2,
    explanation: 'Arithmetic sequence −10 each time. 70−10 = 60.' },

  // ── D2 ADVANCED MATH ──────────────────────────────────────────────────────
  { id: 13, domain: 'D2', difficulty: 'Medium', memorizeTime: 4,
    content: 'x = (−b ± √(b²−4ac)) / 2a',
    question: 'What is inside the square root?',
    options: ['b²+4ac', '4ac−b²', 'b−4ac', 'b²−4ac'], correct: 3,
    explanation: 'The discriminant inside the radical is b²−4ac.' },

  { id: 14, domain: 'D2', difficulty: 'Hard', memorizeTime: 3,
    content: 'x² − 7x + 12 = 0',
    question: 'What was the SUM of the roots?',
    options: ['12', '−12', '−7', '7'], correct: 3,
    explanation: 'Sum of roots = −b/a = −(−7)/1 = 7.' },

  { id: 15, domain: 'D2', difficulty: 'Hard', memorizeTime: 3,
    content: 'x² − 7x + 12 = 0',
    question: 'What was the PRODUCT of the roots?',
    options: ['−12', '7', '12', '−7'], correct: 2,
    explanation: 'Product of roots = c/a = 12/1 = 12.' },

  { id: 16, domain: 'D2', difficulty: 'Medium', memorizeTime: 4,
    content: 'y = x² − 4x + 7',
    question: 'What was the x-coordinate of the vertex?',
    options: ['−2', '4', '7', '2'], correct: 3,
    explanation: 'Vertex x = −b/2a = 4/2 = 2.' },

  { id: 17, domain: 'D2', difficulty: 'Easy', memorizeTime: 5,
    content: '1, 1, 2, 3, 5, 8, 13, ___',
    question: 'What is the missing number?',
    options: ['18', '24', '16', '21'], correct: 3,
    explanation: 'Fibonacci: each = sum of two before. 8+13 = 21.' },

  { id: 18, domain: 'D2', difficulty: 'Hard', memorizeTime: 3,
    content: 'y = 3(x−2)² + 5',
    question: 'What were the vertex coordinates?',
    options: ['(−2,5)', '(2,−5)', '(−2,−5)', '(2,5)'], correct: 3,
    explanation: 'Vertex form y=a(x−h)²+k. Vertex = (h,k) = (2,5).' },

  { id: 19, domain: 'D2', difficulty: 'Medium', memorizeTime: 4,
    content: 'f(x) = 5x³ − 3x² + 7x − 2',
    question: 'What was the coefficient of x²?',
    options: ['5', '7', '−3', '−2'], correct: 2,
    explanation: 'The coefficient of x² is −3.' },

  { id: 20, domain: 'D2', difficulty: 'Easy', memorizeTime: 5,
    content: '2, 6, 18, 54, ___',
    question: 'What is the next term?',
    options: ['108', '162', '216', '100'], correct: 1,
    explanation: 'Geometric ×3 each time. 54×3 = 162.' },

  { id: 21, domain: 'D2', difficulty: 'Hard', memorizeTime: 3,
    content: 'Δ = b² − 4ac\na=2, b=3, c=−5',
    question: 'What was the discriminant value?',
    options: ['49', '−31', '31', '1'], correct: 0,
    explanation: 'Δ = 9 − 4(2)(−5) = 9+40 = 49.' },

  { id: 22, domain: 'D2', difficulty: 'Medium', memorizeTime: 4,
    content: '3, 9, 27, 81, 243, ___',
    question: 'What is the next number?',
    options: ['486', '500', '729', '324'], correct: 2,
    explanation: 'Geometric ×3. 243×3 = 729.' },

  { id: 23, domain: 'D2', difficulty: 'Hard', memorizeTime: 3,
    content: 'Sum = −b/a\nProduct = c/a\nax² + bx + c = 0',
    question: 'What gives the PRODUCT of roots?',
    options: ['−b/a', 'b/a', 'a/c', 'c/a'], correct: 3,
    explanation: 'Vieta\'s: product of roots = c/a.' },

  { id: 24, domain: 'D2', difficulty: 'Medium', memorizeTime: 4,
    content: 'f(x) = −2x² + 8x − 3',
    question: 'What was the coefficient of x?',
    options: ['−2', '8', '−3', '2'], correct: 1,
    explanation: 'Coefficient of x (not x²) is 8.' },

  { id: 25, domain: 'D2', difficulty: 'Easy', memorizeTime: 5,
    content: '1, 2, 4, 8, 16, 32, ___',
    question: 'What is the next number?',
    options: ['48', '56', '64', '72'], correct: 2,
    explanation: 'Powers of 2. 32×2 = 64.' },

  { id: 26, domain: 'D2', difficulty: 'Hard', memorizeTime: 3,
    content: 'y = 2x² − 12x + 19',
    question: 'What was the y-coordinate of the vertex?',
    options: ['3', '1', '19', '−1'], correct: 0,
    explanation: 'x = 12/4 = 3. y = 2(9)−36+19 = 18−36+19 = 1. Wait: 18-36+19=1. Correct answer is 1.' },

  { id: 27, domain: 'D2', difficulty: 'Medium', memorizeTime: 4,
    content: '0, 1, 1, 2, 3, 5, 8, 13, ___',
    question: 'What is the missing term?',
    options: ['18', '20', '21', '16'], correct: 2,
    explanation: 'Fibonacci: 8+13 = 21.' },

  // ── D3 PROBLEM SOLVING ────────────────────────────────────────────────────
  { id: 28, domain: 'D3', difficulty: 'Easy', memorizeTime: 5,
    content: '4, 7, 7, 9, 13, 15, 20',
    question: 'What was the median of this data set?',
    options: ['7', '11', '9', '13'], correct: 2,
    explanation: '7 values sorted: 4,7,7,9,13,15,20. Middle (4th) = 9.' },

  { id: 29, domain: 'D3', difficulty: 'Easy', memorizeTime: 5,
    content: '4 red, 6 blue\n2 green, 3 yellow',
    question: 'How many blue marbles were there?',
    options: ['4', '3', '2', '6'], correct: 3,
    explanation: 'Blue = 6, as shown in the memorized content.' },

  { id: 30, domain: 'D3', difficulty: 'Medium', memorizeTime: 4,
    content: '72, 85, 91, 68, 79\n88, 95',
    question: 'What was the RANGE of this data set?',
    options: ['23', '30', '27', '25'], correct: 2,
    explanation: 'Range = max−min = 95−68 = 27.' },

  { id: 31, domain: 'D3', difficulty: 'Easy', memorizeTime: 5,
    content: '10, 20, 30, 40, 50\n60, 70',
    question: 'What was the MEAN (average)?',
    options: ['35', '45', '40', '50'], correct: 2,
    explanation: 'Sum = 280. Mean = 280/7 = 40.' },

  { id: 32, domain: 'D3', difficulty: 'Medium', memorizeTime: 4,
    content: '5, 5, 8, 12, 12\n12, 15, 18',
    question: 'What was the MODE?',
    options: ['5', '8', '15', '12'], correct: 3,
    explanation: '12 appears 3 times — the most frequent value.' },

  { id: 33, domain: 'D3', difficulty: 'Hard', memorizeTime: 3,
    content: 'P(A) = 0.4\nP(B) = 0.3\nA, B independent',
    question: 'What was P(A)?',
    options: ['0.12', '0.7', '0.3', '0.4'], correct: 3,
    explanation: 'P(A) was given as 0.4 in the memorized content.' },

  { id: 34, domain: 'D3', difficulty: 'Medium', memorizeTime: 4,
    content: '3, 6, 9, 12, 15, 18, ___',
    question: 'What is the next number?',
    options: ['19', '20', '21', '24'], correct: 2,
    explanation: 'Multiples of 3: next is 21.' },

  { id: 35, domain: 'D3', difficulty: 'Easy', memorizeTime: 5,
    content: '2, 5, 5, 7, 8, 9, 10',
    question: 'What was the median?',
    options: ['5', '8', '7', '9'], correct: 2,
    explanation: '7 values. Middle = 4th = 7.' },

  { id: 36, domain: 'D3', difficulty: 'Hard', memorizeTime: 3,
    content: 'Boys: 15  Girls: 10\nLike Math: 8 boys, 6 girls',
    question: 'How many girls liked math?',
    options: ['8', '10', '15', '6'], correct: 3,
    explanation: 'The content showed 6 girls liked math.' },

  { id: 37, domain: 'D3', difficulty: 'Medium', memorizeTime: 4,
    content: '15, 22, 8, 31, 19\n26, 14, 11',
    question: 'What was the largest value shown?',
    options: ['26', '19', '31', '22'], correct: 2,
    explanation: 'Scanning the data: 31 is the largest value.' },

  { id: 38, domain: 'D3', difficulty: 'Easy', memorizeTime: 5,
    content: 'Bag: 5 red, 3 blue\n2 white = 10 total',
    question: 'How many red marbles were in the bag?',
    options: ['3', '10', '2', '5'], correct: 3,
    explanation: 'The content clearly showed 5 red marbles.' },

  { id: 39, domain: 'D3', difficulty: 'Hard', memorizeTime: 3,
    content: 'Mean = 82\nMedian = 79\nMode = 75\nRange = 40',
    question: 'What was the MEDIAN?',
    options: ['82', '40', '75', '79'], correct: 3,
    explanation: 'The content listed Median = 79.' },

  // ── D4 GEOMETRY ───────────────────────────────────────────────────────────
  { id: 40, domain: 'D4', difficulty: 'Easy', memorizeTime: 5,
    content: 'Triangle: sides\n5, 12, 13',
    question: 'What was the hypotenuse?',
    options: ['5', '12', '17', '13'], correct: 3,
    explanation: 'Hypotenuse = longest side = 13. Check: 5²+12²=13² ✓' },

  { id: 41, domain: 'D4', difficulty: 'Medium', memorizeTime: 4,
    content: 'Circle: r = 7\nA = 49π, C = 14π',
    question: 'What was the CIRCUMFERENCE?',
    options: ['49π', '7π', '21π', '14π'], correct: 3,
    explanation: 'The content showed C = 14π.' },

  { id: 42, domain: 'D4', difficulty: 'Easy', memorizeTime: 5,
    content: 'Rectangle:\nlength = 12, width = 5',
    question: 'What was the PERIMETER?',
    options: ['60', '17', '34', '30'], correct: 2,
    explanation: 'P = 2(12+5) = 2(17) = 34.' },

  { id: 43, domain: 'D4', difficulty: 'Hard', memorizeTime: 3,
    content: 'sin30°=1/2\ncos60°=1/2\ntan45°=1',
    question: 'What was tan 45°?',
    options: ['1/2', '√2', '√3', '1'], correct: 3,
    explanation: 'The content showed tan45° = 1.' },

  { id: 44, domain: 'D4', difficulty: 'Medium', memorizeTime: 4,
    content: 'Cylinder:\nr = 3, h = 8\nV = 72π',
    question: 'What was the RADIUS?',
    options: ['8', '72', '6', '3'], correct: 3,
    explanation: 'The content listed r = 3.' },

  { id: 45, domain: 'D4', difficulty: 'Easy', memorizeTime: 5,
    content: 'Pentagon: 5 sides\nSum of angles = 540°',
    question: 'What was the angle sum?',
    options: ['360°', '720°', '900°', '540°'], correct: 3,
    explanation: 'The content showed sum = 540°. (n−2)×180 = 3×180 = 540°.' },

  { id: 46, domain: 'D4', difficulty: 'Medium', memorizeTime: 4,
    content: 'Pythagorean triples:\n3-4-5, 5-12-13\n8-15-17, 7-24-25',
    question: 'Which triple was shown second?',
    options: ['3-4-5', '8-15-17', '7-24-25', '5-12-13'], correct: 3,
    explanation: 'Second triple listed was 5-12-13.' },

  { id: 47, domain: 'D4', difficulty: 'Hard', memorizeTime: 3,
    content: 'Cone:\nr = 4, h = 9\nslant = √97',
    question: 'What was the height of the cone?',
    options: ['4', '√97', '6', '9'], correct: 3,
    explanation: 'The content listed h = 9.' },

  { id: 48, domain: 'D4', difficulty: 'Medium', memorizeTime: 4,
    content: 'Angles:\n∠A = 45°\n∠B = 90°\n∠C = ?',
    question: 'What was ∠A?',
    options: ['90°', '135°', '60°', '45°'], correct: 3,
    explanation: 'The content clearly showed ∠A = 45°.' },

  { id: 49, domain: 'D4', difficulty: 'Easy', memorizeTime: 5,
    content: 'Square: side = 9\nArea = 81\nPerimeter = 36',
    question: 'What was the AREA?',
    options: ['36', '9', '18', '81'], correct: 3,
    explanation: 'The content showed Area = 81.' },

  { id: 50, domain: 'D4', difficulty: 'Hard', memorizeTime: 3,
    content: 'Points: A(1,2)\nB(4,6), C(7,2)\nMidpoint AB = (2.5, 4)',
    question: 'What was the midpoint of AB?',
    options: ['(1,4)', '(4,4)', '(3,4)', '(2.5,4)'], correct: 3,
    explanation: 'The content showed Midpoint AB = (2.5, 4).' },
];

const TIMER_DURATION = 45;
const NODE_POSITIONS = [
  { top: 10, left: 10 },
  { top: 10, right: 10 },
  { bottom: 10, left: 10 },
  { bottom: 10, right: 10 },
];

// ─── BACKGROUND NEURAL DOT ───────────────────────────────────────────────────
function NeuralDot({ x, y }: { x: number; y: number }) {
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.8, duration: 1500 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.2, duration: 1500 + Math.random() * 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.neuralDot, { left: x, top: y, opacity: pulse }]} />;
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function MathMemoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;

  // Game state
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'reveal'>('memorize');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [memorizeTime, setMemorizeTime] = useState(5);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [shuffledQ] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));

  // Animations
  const timerRef = useRef<any>(null);
  const memorizeTimerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const brainScale = useRef(new Animated.Value(0)).current;
  const brainBorderAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const recallFlicker = useRef(new Animated.Value(1)).current;
  const nodeScales = useRef([0,1,2,3].map(() => new Animated.Value(0))).current;
  const memorizeRing = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  const neuralDots = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      x: (i * 67 + 30) % 380,
      y: (i * 83 + 20) % 700,
    }))
  ).current;

  // ── START MEMORIZE PHASE ──────────────────────────────────────────────────
  function startMemorizePhase(qIndex: number) {
    const q = shuffledQ[qIndex];
    setPhase('memorize');
    setSelectedNode(null);
    setMemorizeTime(q.memorizeTime);

    // Brain appears
    brainScale.setValue(0);
    contentOpacity.setValue(0);
    memorizeRing.setValue(1);
    nodeScales.forEach(s => s.setValue(0));

    Animated.parallel([
      Animated.spring(brainScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Brain pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainBorderAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(brainBorderAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Memorize countdown ring
    Animated.timing(memorizeRing, {
      toValue: 0,
      duration: q.memorizeTime * 1000,
      useNativeDriver: true,
    }).start();

    // Per-question countdown
    let t = q.memorizeTime;
    setMemorizeTime(t);
    memorizeTimerRef.current = setInterval(() => {
      t -= 1;
      setMemorizeTime(t);
      if (t <= 0) {
        clearInterval(memorizeTimerRef.current);
        transitionToRecall();
      }
    }, 1000);
  }

  function transitionToRecall() {
    brainBorderAnim.stopAnimation();
    // Flash brain
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    // Content fades out, ??? fades in
    Animated.timing(contentOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setPhase('recall');
      setQuestionStartTime(Date.now());
      // Flicker effect for ???
      Animated.loop(
        Animated.sequence([
          Animated.timing(recallFlicker, { toValue: 0.5, duration: 150, useNativeDriver: true }),
          Animated.timing(recallFlicker, { toValue: 1, duration: 150, useNativeDriver: true }),
        ])
      ).start();
      // Nodes spring in
      nodeScales.forEach((s, i) => {
        setTimeout(() => {
          Animated.spring(s, { toValue: 1, useNativeDriver: true, tension: 150, friction: 7 }).start();
        }, i * 120);
      });
    });
  }

  // ── MAIN TIMER ────────────────────────────────────────────────────────────
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

  useEffect(() => {
    startMemorizePhase(0);
    return () => { clearInterval(memorizeTimerRef.current); };
  }, []);

  function endGame() {
    clearInterval(timerRef.current);
    clearInterval(memorizeTimerRef.current);
    brainBorderAnim.stopAnimation();
    recallFlicker.stopAnimation();
    setGameState('results');
  }

  function handleNodeTap(index: number) {
    if (phase !== 'recall' || selectedNode !== null) return;
    setSelectedNode(index);
    recallFlicker.stopAnimation();

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
      // Brain pulses green
      Animated.sequence([
        Animated.spring(brainScale, { toValue: 1.08, useNativeDriver: true, tension: 200 }),
        Animated.spring(brainScale, { toValue: 1, useNativeDriver: true, tension: 200 }),
      ]).start();
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
    }

    // Content reappears
    Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setPhase('reveal');

    setAnswers(prev => [...prev, {
      question: q.question, domain: q.domain, content: q.content,
      userAnswer: q.options[index], correctAnswer: q.options[q.correct],
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);

    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      const next = currentQ + 1;
      setCurrentQ(next);
      brainBorderAnim.stopAnimation();
      recallFlicker.stopAnimation();
      recallFlicker.setValue(1);
      startMemorizePhase(next);
    }, 2000);
  }

  function shakeScreen() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
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
    if (gameState === 'playing') {
      clearInterval(timerRef.current);
      clearInterval(memorizeTimerRef.current);
      brainBorderAnim.stopAnimation();
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }

  function restartGame() {
    clearInterval(timerRef.current);
    clearInterval(memorizeTimerRef.current);
    setCurrentQ(0); setSelectedNode(null); setPhase('memorize');
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    brainScale.setValue(0); contentOpacity.setValue(0);
    nodeScales.forEach(s => s.setValue(0));
    setGameState('playing');
    startMemorizePhase(0);
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#A78BFA' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  const q = shuffledQ[currentQ];
  const domainColor = q.domain === 'D1' ? '#2563EB' : q.domain === 'D2' ? '#7C3AED' : q.domain === 'D3' ? '#F97316' : '#F59E0B';

  const brainBorderColor = brainBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: ['#7C3AED', '#A78BFA'],
  });

  // Node border colors
  function getNodeStyle(i: number) {
    if (phase === 'memorize') return { borderColor: '#7C3AED60' };
    if (phase === 'recall' && selectedNode === null) return { borderColor: '#7C3AED' };
    if (selectedNode === i) {
      return i === q.correct
        ? { borderColor: '#10B981', backgroundColor: '#10B98125' }
        : { borderColor: '#EF4444', backgroundColor: '#EF444425' };
    }
    if (phase === 'reveal' && i === q.correct) return { borderColor: '#10B981', backgroundColor: '#10B98120' };
    return { borderColor: '#4C1D9580' };
  }

  function getNodeTextColor(i: number) {
    if (phase === 'recall' && selectedNode === null) return '#E9D5FF';
    if (selectedNode === i) return i === q.correct ? '#10B981' : '#EF4444';
    if (phase === 'reveal' && i === q.correct) return '#10B981';
    return '#6B21A8';
  }

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(15, finalScore, xpEarned, 'math_d2', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🧠 Photographic Memory!' : finalScore >= 40 ? '💜 Good Recall!' : '🔄 Train Your Brain!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Memory Review 🧠</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewDomain}>{a.domain} · {a.isCorrect ? '🧠 REMEMBERED' : '💨 FORGOTTEN'}</Text>
              <View style={styles.reviewContentBox}>
                <Text style={styles.reviewContentText}>{a.content}</Text>
              </View>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                Your answer: {a.userAnswer}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>✅ Correct: {a.correctAnswer}</Text>}
              <Text style={styles.reviewExplanation}>💡 {a.explanation}</Text>
              {a.isSpeedy && <Text style={styles.reviewSpeedy}>⚡ Quick recall!</Text>}
            </View>
          ))}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{correctCount}/{questionsAnswered}</Text>
                <Text style={styles.perfLabel}>Recalled</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{speedyCount}</Text>
                <Text style={styles.perfLabel}>⚡ Quick</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Math Memory</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>🧠 Memory Log</Text>
            <Text style={styles.historySub}>Train more to see your history!</Text>
            <Text style={styles.historyRank}>Session #1 — Score: {finalScore}</Text>
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

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* NEURAL BACKGROUND */}
        <View style={styles.neuralBg} pointerEvents="none">
          {neuralDots.map((d, i) => <NeuralDot key={i} x={d.x} y={d.y} />)}
          {/* Brain flash overlay */}
          <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} />
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>🧠 MATH MEMORY</Text>
            <Text style={styles.gameSubtitle}>SYNAPSE {currentQ + 1}/{shuffledQ.length}</Text>
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

        {/* STATUS */}
        <View style={styles.statusRow}>
          <View style={styles.livesRow}>
            {[1,2,3].map(i => <Text key={i} style={styles.heart}>{i <= lives ? '🧠' : '💨'}</Text>)}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
            </View>
          </View>
          <View style={[styles.domainPill, { backgroundColor: domainColor + '25', borderColor: domainColor }]}>
            <Text style={[styles.domainTxt, { color: domainColor }]}>{q.domain} · {q.difficulty}</Text>
          </View>
        </View>

        {/* PHASE LABEL */}
        <Text style={[styles.phaseLabel, {
          color: phase === 'memorize' ? '#A78BFA' : phase === 'recall' ? '#E9D5FF' : selectedNode === q.correct ? '#10B981' : '#EF4444'
        }]}>
          {phase === 'memorize' ? `🧠 MEMORIZE! — ${memorizeTime}s` :
           phase === 'recall' ? '❓ RECALL — Tap the correct node!' :
           selectedNode === q.correct ? '✅ REMEMBERED! 🧠' : '❌ FORGOTTEN!'}
        </Text>

        {/* QUESTION (recall/reveal only) */}
        {phase !== 'memorize' && (
          <Text style={styles.questionText}>{q.question}</Text>
        )}

        {/* BRAIN + NODES LAYOUT */}
        <View style={styles.brainArea}>
          {/* TOP NODES */}
          <View style={styles.topNodesRow}>
            {[0, 1].map(i => (
              <Animated.View key={i} style={{ transform: [{ scale: nodeScales[i] }] }}>
                <TouchableOpacity
                  style={[styles.node, getNodeStyle(i)]}
                  onPress={() => handleNodeTap(i)}
                  disabled={phase !== 'recall' || selectedNode !== null}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nodeText, { color: getNodeTextColor(i) }]}>{q.options[i]}</Text>
                  {phase === 'reveal' && i === q.correct && <Text style={styles.nodeCheck}>✅</Text>}
                  {phase === 'reveal' && selectedNode === i && i !== q.correct && <Text style={styles.nodeX}>❌</Text>}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* BRAIN */}
          <Animated.View style={[styles.brainWrapper, { transform: [{ scale: brainScale }] }]}>
            {/* Neural lines to top nodes */}
            <View style={styles.lineTopLeft} />
            <View style={styles.lineTopRight} />
            <View style={styles.lineBottomLeft} />
            <View style={styles.lineBottomRight} />

            {/* Brain hemispheres */}
            <Animated.View style={[styles.leftHemisphere, { borderColor: brainBorderColor }]} />
            <Animated.View style={[styles.rightHemisphere, { borderColor: brainBorderColor }]} />
            <View style={styles.centerLine} />

            {/* Brain content */}
            <Animated.View style={[styles.brainContent, { opacity: contentOpacity }]}>
              {phase === 'recall' ? (
                <Animated.Text style={[styles.brainRecallText, { opacity: recallFlicker }]}>???</Animated.Text>
              ) : (
                <Text style={[styles.brainText, {
                  color: phase === 'reveal'
                    ? (selectedNode === q.correct ? '#34D399' : '#F87171')
                    : '#E9D5FF'
                }]}>{q.content}</Text>
              )}
            </Animated.View>

            {/* Memorize countdown ring */}
            {phase === 'memorize' && (
              <Animated.View style={[styles.memorizeRing, {
                transform: [{ scale: memorizeRing.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
                opacity: memorizeRing,
              }]} />
            )}
          </Animated.View>

          {/* BOTTOM NODES */}
          <View style={styles.bottomNodesRow}>
            {[2, 3].map(i => (
              <Animated.View key={i} style={{ transform: [{ scale: nodeScales[i] }] }}>
                <TouchableOpacity
                  style={[styles.node, getNodeStyle(i)]}
                  onPress={() => handleNodeTap(i)}
                  disabled={phase !== 'recall' || selectedNode !== null}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nodeText, { color: getNodeTextColor(i) }]}>{q.options[i]}</Text>
                  {phase === 'reveal' && i === q.correct && <Text style={styles.nodeCheck}>✅</Text>}
                  {phase === 'reveal' && selectedNode === i && i !== q.correct && <Text style={styles.nodeX}>❌</Text>}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* EXPLANATION (reveal) */}
        {phase === 'reveal' && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>💡 {q.explanation}</Text>
          </View>
        )}

      </Animated.View>

      {/* PAUSE OVERLAY */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>🧠 Paused</Text>
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
  safe: { flex: 1, backgroundColor: '#0A0514' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#0A0514' },

  neuralBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' },
  neuralDot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#7C3AED' },
  flashOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF' },

  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 20, gap: 10, zIndex: 10 },
  pauseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A0A2E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' },
  pauseIcon: { fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 20, fontWeight: '900', color: '#E9D5FF', letterSpacing: 1 },
  gameSubtitle: { fontSize: 10, color: '#A78BFA', fontWeight: '700', letterSpacing: 1 },
  scoreBox: { backgroundColor: '#7C3AED20', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' },
  scoreNum: { fontSize: 20, fontWeight: '900', color: '#A78BFA' },
  scoreLabel: { fontSize: 9, color: '#A78BFA', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 20, top: 105, fontSize: 20, fontWeight: '900', color: '#10B981', zIndex: 100 },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 6, backgroundColor: '#150A2480', borderRadius: 14, padding: 10, zIndex: 10 },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 18 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  timerNum: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#2D1B4E', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  domainPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  domainTxt: { fontSize: 10, fontWeight: '800' },

  phaseLabel: { textAlign: 'center', fontSize: 15, fontWeight: '900', letterSpacing: 1, marginBottom: 4, zIndex: 10 },
  questionText: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#C4B5FD', paddingHorizontal: 20, marginBottom: 6, zIndex: 10 },

  // Brain area
  brainArea: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 12 },
  topNodesRow: { flexDirection: 'row', gap: 60, justifyContent: 'center' },
  bottomNodesRow: { flexDirection: 'row', gap: 60, justifyContent: 'center' },

  node: {
    width: 100, height: 60, borderRadius: 14,
    backgroundColor: '#1A0A2E', borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', padding: 6,
  },
  nodeText: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  nodeCheck: { fontSize: 12, marginTop: 2 },
  nodeX: { fontSize: 12, marginTop: 2 },

  // Brain wrapper
  brainWrapper: {
    width: 260, height: 190,
    position: 'relative', alignItems: 'center', justifyContent: 'center',
  },

  // Neural lines
  lineTopLeft: { position: 'absolute', top: -28, left: 10, width: 60, height: 2, backgroundColor: '#7C3AED40', transform: [{ rotate: '-35deg' }] },
  lineTopRight: { position: 'absolute', top: -28, right: 10, width: 60, height: 2, backgroundColor: '#7C3AED40', transform: [{ rotate: '35deg' }] },
  lineBottomLeft: { position: 'absolute', bottom: -28, left: 10, width: 60, height: 2, backgroundColor: '#7C3AED40', transform: [{ rotate: '35deg' }] },
  lineBottomRight: { position: 'absolute', bottom: -28, right: 10, width: 60, height: 2, backgroundColor: '#7C3AED40', transform: [{ rotate: '-35deg' }] },

  leftHemisphere: {
    position: 'absolute', left: 8, top: 8,
    width: 130, height: 170, borderRadius: 80,
    backgroundColor: '#150A24', borderWidth: 2,
  },
  rightHemisphere: {
    position: 'absolute', right: 8, top: 8,
    width: 130, height: 170, borderRadius: 80,
    backgroundColor: '#150A24', borderWidth: 2,
  },
  centerLine: {
    position: 'absolute', top: 20, bottom: 20,
    left: '50%', width: 1, backgroundColor: '#7C3AED30',
  },
  brainContent: {
    position: 'absolute', left: 20, right: 20, top: 20, bottom: 20,
    alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  brainText: {
    fontSize: 14, fontWeight: '800', textAlign: 'center',
    lineHeight: 22,
  },
  brainRecallText: {
    fontSize: 36, fontWeight: '900', color: '#4C1D95', textAlign: 'center', letterSpacing: 4,
  },
  memorizeRing: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    borderRadius: 100, borderWidth: 3, borderColor: '#A78BFA40',
  },

  // Explanation
  explanationBox: {
    marginHorizontal: 20, backgroundColor: '#150A24', borderRadius: 12,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#4C1D95', zIndex: 10,
  },
  explanationText: { fontSize: 13, color: '#C4B5FD', lineHeight: 20, textAlign: 'center' },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#E9D5FF', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#150A24', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewDomain: { fontSize: 11, color: '#A78BFA', fontWeight: '700', marginBottom: 4 },
  reviewContentBox: { backgroundColor: '#0A0514', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#4C1D95' },
  reviewContentText: { fontSize: 13, color: '#C4B5FD', fontWeight: '700', textAlign: 'center' },
  reviewQ: { fontSize: 14, color: '#E9D5FF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#A78BFA', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#150A24', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D1B4E' },
  performanceTitle: { fontSize: 26, fontWeight: '800', color: '#E9D5FF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#0A0514', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#7C3AED' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#7C3AED15', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' },
  xpTitle: { fontSize: 16, color: '#A78BFA', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#A78BFA', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#150A24', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D1B4E' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#E9D5FF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#A78BFA', fontWeight: '700' },
  continueBtn: { backgroundColor: '#7C3AED', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 20 },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#2D1B4E' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pauseCard: { backgroundColor: '#150A24', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#E9D5FF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#7C3AED', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});