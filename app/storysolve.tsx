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

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
const QUESTIONS: any[] = [
  // ── D1 ALGEBRA ───────────────────────────────────────────────────────────
  { id: 1, domain: 'D1', difficulty: 'Easy', format: 'two-cards',
    question: 'Two trains 300 miles apart travel toward each other. Train A: 80mph, Train B: 70mph. How many hours until they meet?',
    cards: ['2 hours', '3 hours'], correct: 0,
    explanation: 'Combined speed = 80+70 = 150mph. Time = 300÷150 = 2 hours.' },

  { id: 2, domain: 'D1', difficulty: 'Hard', format: 'four-pills',
    question: 'John is 3 times as old as his son. In 12 years he will be twice as old. How old is John now?',
    options: ['24', '36', '48', '30'], correct: 1,
    explanation: 'Let S = son. J=3S. J+12=2(S+12) → 3S+12=2S+24 → S=12. J=36.' },

  { id: 3, domain: 'D1', difficulty: 'Medium', format: 'two-cards',
    question: 'A tank fills in 6 hrs with Pipe A and 4 hrs with Pipe B. How long with both pipes open?',
    cards: ['2.4 hours', '3 hours'], correct: 0,
    explanation: 'Rate: 1/6+1/4 = 5/12 per hour. Time = 12/5 = 2.4 hours.' },

  { id: 4, domain: 'D1', difficulty: 'Medium', format: 'four-pills',
    question: 'A bag has nickels and dimes totaling $2.50. There are 35 coins total. How many dimes?',
    options: ['15', '10', '25', '20'], correct: 3,
    explanation: 'N+D=35 and 5N+10D=250. Sub: 5(35-D)+10D=250 → 175+5D=250 → D=15. Wait: 5D=75, D=15.' },

  { id: 5, domain: 'D1', difficulty: 'Easy', format: 'two-cards',
    question: 'A car travels at 60mph. Another leaves 1 hour later at 90mph. How many hours until the second car catches up?',
    cards: ['2 hours', '3 hours'], correct: 0,
    explanation: '60(t+1)=90t → 60t+60=90t → 30t=60 → t=2 hours after second car leaves.' },

  { id: 6, domain: 'D1', difficulty: 'Hard', format: 'four-pills',
    question: 'A store sells adult tickets at $8 and child tickets at $5. 200 tickets sold for $1,300. How many adult tickets?',
    options: ['75', '50', '100', '125'], correct: 2,
    explanation: 'A+C=200 and 8A+5C=1300. Sub: 8A+5(200-A)=1300 → 3A=300 → A=100.' },

  { id: 7, domain: 'D1', difficulty: 'Medium', format: 'four-pills',
    question: 'The sum of two numbers is 40. The larger is 4 more than twice the smaller. Find the larger number.',
    options: ['24', '28', '32', '36'], correct: 1,
    explanation: 'L+S=40 and L=2S+4. Sub: 2S+4+S=40 → 3S=36 → S=12 → L=28.' },

  { id: 8, domain: 'D1', difficulty: 'Easy', format: 'true-false',
    question: 'If a linear equation has a negative slope, the line always goes down from left to right.',
    correct: 'true',
    explanation: 'True. A negative slope means as x increases, y decreases — the line always goes downward left to right.' },

  { id: 9, domain: 'D1', difficulty: 'Medium', format: 'two-cards',
    question: 'A company breaks even when revenue equals cost. Revenue = 50x, Cost = 30x + 800. At what quantity do they break even?',
    cards: ['20 units', '40 units'], correct: 1,
    explanation: '50x = 30x+800 → 20x=800 → x=40 units.' },

  { id: 10, domain: 'D1', difficulty: 'Hard', format: 'four-pills',
    question: 'A mixture of 20% and 50% acid is combined to make 60L of 30% acid. How many liters of 20%?',
    options: ['30L', '20L', '45L', '40L'], correct: 3,
    explanation: '0.2x+0.5(60-x)=18 → 0.2x+30-0.5x=18 → -0.3x=-12 → x=40L.' },

  { id: 11, domain: 'D1', difficulty: 'Easy', format: 'four-pills',
    question: 'A number is 5 more than twice another. Their sum is 23. What is the larger number?',
    options: ['17', '15', '19', '13'], correct: 0,
    explanation: 'L=2S+5 and L+S=23. 2S+5+S=23 → S=6 → L=17.' },

  { id: 12, domain: 'D1', difficulty: 'Medium', format: 'true-false',
    question: 'Two lines with the same slope are always parallel.',
    correct: 'true',
    explanation: 'True. Same slope means they rise and run identically. They never intersect unless they are the same line (identical).' },

  { id: 13, domain: 'D1', difficulty: 'Hard', format: 'four-pills',
    question: 'Maria is 3 times older than twice her age minus 10. How old is Maria?',
    options: ['10', '6', '5', '15'], correct: 2,
    explanation: 'M = 3(2M-10) → M=6M-30 → -5M=-30 → M=6. Check: 3(12-10)=6 ✓' },

  { id: 14, domain: 'D1', difficulty: 'Easy', format: 'two-cards',
    question: 'A plumber charges $50 flat fee + $40/hr. A job costs $210 total. How many hours did it take?',
    cards: ['4 hours', '5 hours'], correct: 0,
    explanation: '50+40h=210 → 40h=160 → h=4 hours.' },

  { id: 15, domain: 'D1', difficulty: 'Medium', format: 'four-pills',
    question: 'Together, Alice and Bob can paint a room in 4 hours. Alone, Alice takes 12 hours. How long for Bob alone?',
    options: ['6 hours', '8 hours', '10 hours', '4 hours'], correct: 0,
    explanation: '1/12+1/B=1/4 → 1/B=1/4-1/12=2/12=1/6 → B=6 hours.' },

  // ── D2 ADVANCED MATH ──────────────────────────────────────────────────────
  { id: 16, domain: 'D2', difficulty: 'Medium', format: 'horizontal-scroll',
    question: 'Which equation models exponential DECAY?',
    cards: ['y=100(1.15)ˣ', 'y=100x+85', 'y=100(1.85)ˣ', 'y=100(0.85)ˣ'], correct: 3,
    explanation: 'Decay requires base between 0 and 1. Only 0.85 satisfies 0<b<1.' },

  { id: 17, domain: 'D2', difficulty: 'Hard', format: 'scroll-wheel',
    question: 'A ball is launched. Height: h = −16t² + 64t + 5. What is the MAXIMUM height in feet?',
    correctValue: 69,
    explanation: 'Vertex at t = -b/2a = 64/32 = 2. h = -16(4)+128+5 = -64+128+5 = 69 feet.' },

  { id: 18, domain: 'D2', difficulty: 'Easy', format: 'two-cards',
    question: 'A population of 1,000 doubles every 5 years. What is the population after 10 years?',
    cards: ['4,000', '2,000'], correct: 0,
    explanation: '10 years = 2 doubling periods. 1000×2² = 1000×4 = 4,000.' },

  { id: 19, domain: 'D2', difficulty: 'Medium', format: 'scroll-wheel',
    question: '$5,000 invested at 8% compounded annually for 2 years. Amount to nearest dollar?',
    correctValue: 5832,
    explanation: 'A = 5000(1.08)² = 5000×1.1664 = $5,832.' },

  { id: 20, domain: 'D2', difficulty: 'Easy', format: 'true-false',
    question: 'A quadratic equation can have at most 2 real solutions.',
    correct: 'true',
    explanation: 'True. A degree-2 polynomial has at most 2 roots (real or complex). Discriminant determines if 0, 1, or 2 real roots.' },

  { id: 21, domain: 'D2', difficulty: 'Hard', format: 'horizontal-scroll',
    question: 'Population doubles every 3 years, starts at 500. Which models it correctly?',
    cards: ['P=500(3)^t', 'P=500+2t', 'P=500(2)^(t/3)', 'P=500(2t)'], correct: 2,
    explanation: 'Doubling every 3 years: exponent is t/3. P = 500×2^(t/3).' },

  { id: 22, domain: 'D2', difficulty: 'Medium', format: 'four-pills',
    question: 'A drug decays at 20% per hour. You start with 200mg. How much remains after 3 hours?',
    options: ['102.4mg', '120mg', '128mg', '96mg'], correct: 0,
    explanation: '200(0.8)³ = 200×0.512 = 102.4mg.' },

  { id: 23, domain: 'D2', difficulty: 'Hard', format: 'scroll-wheel',
    question: 'Rectangle: length = 2×width, perimeter = 48. What is the AREA?',
    correctValue: 128,
    explanation: '2(2w+w)=48 → 6w=48 → w=8, l=16. Area = 8×16 = 128.' },

  { id: 24, domain: 'D2', difficulty: 'Easy', format: 'true-false',
    question: 'The product of two negative numbers is always negative.',
    correct: 'false',
    explanation: 'False. Negative × Negative = Positive. Example: (−3)(−4) = +12.' },

  { id: 25, domain: 'D2', difficulty: 'Medium', format: 'horizontal-scroll',
    question: 'Which models continuous decline starting at 1000, decreasing 5% each year?',
    cards: ['A=1000(0.95)^t', 'A=1000(1.05)^t', 'A=1000−50t', 'A=1000÷1.05^t'], correct: 0,
    explanation: 'Decay base = 1−0.05 = 0.95. A = 1000(0.95)^t.' },

  // ── D3 PROBLEM SOLVING ────────────────────────────────────────────────────
  { id: 26, domain: 'D3', difficulty: 'Medium', format: 'four-pills',
    question: 'A store marks up a $60 item by 40%, then discounts 20%. What is the final price?',
    options: ['$64.00', '$67.20', '$72.00', '$60.00'], correct: 1,
    explanation: 'Markup: 60×1.4=$84. Discount: 84×0.8=$67.20. Net = 12% above original.' },

  { id: 27, domain: 'D3', difficulty: 'Easy', format: 'scroll-wheel',
    question: 'A map has scale 1 inch = 25 miles. Two cities are 7 inches apart. Actual distance?',
    correctValue: 175,
    explanation: '7 inches × 25 miles/inch = 175 miles.' },

  { id: 28, domain: 'D3', difficulty: 'Medium', format: 'four-pills',
    question: 'Class A: 25 students avg 82. Class B: 15 students avg 74. Combined weighted average?',
    options: ['79', '78.5', '80', '77'], correct: 0,
    explanation: '(25×82+15×74)/40 = (2050+1110)/40 = 3160/40 = 79.' },

  { id: 29, domain: 'D3', difficulty: 'Easy', format: 'four-pills',
    question: 'A jar has 4 red, 6 blue, 5 green marbles. You pick one. P(not red)?',
    options: ['4/15', '11/15', '2/3', '1/3'], correct: 1,
    explanation: 'P(not red) = (6+5)/15 = 11/15.' },

  { id: 30, domain: 'D3', difficulty: 'Easy', format: 'true-false',
    question: 'The mean is always greater than the median in any data set.',
    correct: 'false',
    explanation: 'False. Mean > median only in right-skewed data. In left-skewed, mean < median. In symmetric, mean = median.' },

  { id: 31, domain: 'D3', difficulty: 'Easy', format: 'two-cards',
    question: 'A recipe needs 2.5 cups of flour per batch. You need 10 batches. How many cups of flour?',
    cards: ['25 cups', '20 cups'], correct: 0,
    explanation: '2.5 × 10 = 25 cups.' },

  { id: 32, domain: 'D3', difficulty: 'Medium', format: 'four-pills',
    question: 'A car goes 240 miles using 8 gallons. At this rate, how far on 14 gallons?',
    options: ['360 miles', '300 miles', '420 miles', '480 miles'], correct: 2,
    explanation: 'Rate = 240/8 = 30 mpg. 14×30 = 420 miles.' },

  { id: 33, domain: 'D3', difficulty: 'Medium', format: 'two-cards',
    question: '$1,000 simple interest at 6% for 3 years vs 4 years. Difference in interest earned?',
    cards: ['$60 more', '$40 more'], correct: 0,
    explanation: 'SI = Prt. Year 4 extra = 1000×0.06×1 = $60 more interest.' },

  { id: 34, domain: 'D3', difficulty: 'Hard', format: 'four-pills',
    question: 'Price drops 20% then increases 25%. Net change from original?',
    options: ['5% increase', '5% decrease', '0% change', '10% increase'], correct: 2,
    explanation: '0.8×1.25 = 1.00. Exactly back to original — 0% net change.' },

  { id: 35, domain: 'D3', difficulty: 'Easy', format: 'true-false',
    question: 'If you flip a fair coin 10 times and get 8 heads, the next flip is more likely to be tails.',
    correct: 'false',
    explanation: 'False. Each flip is independent. P(tails) = 1/2 every time regardless of previous results. This is the gambler\'s fallacy.' },

  { id: 36, domain: 'D3', difficulty: 'Medium', format: 'four-pills',
    question: 'A survey of 400 people: 45% prefer Brand A. How many people prefer Brand A?',
    options: ['160', '200', '180', '220'], correct: 2,
    explanation: '45% of 400 = 0.45×400 = 180 people.' },

  { id: 37, domain: 'D3', difficulty: 'Hard', format: 'four-pills',
    question: 'Investment grows 10% year 1, drops 10% year 2. Net effect on $1,000?',
    options: ['Back to $1,000', '$990', '$980', '$1,010'], correct: 1,
    explanation: '1000×1.1×0.9 = 1000×0.99 = $990. Percent gain then loss always results in net loss.' },

  { id: 38, domain: 'D3', difficulty: 'Medium', format: 'scroll-wheel',
    question: 'A runner completes a 26.2 mile marathon in 3.5 hours. Speed in mph to 1 decimal?',
    correctValue: 7,
    explanation: 'Speed = 26.2÷3.5 ≈ 7.49 ≈ 7 mph (rounded). Or accept 7.5 — we use 7.' },

  { id: 39, domain: 'D3', difficulty: 'Easy', format: 'two-cards',
    question: 'A bag of chips has 250 calories. You eat 60% of the bag. Calories consumed?',
    cards: ['150 calories', '100 calories'], correct: 0,
    explanation: '60% of 250 = 0.6×250 = 150 calories.' },

  { id: 40, domain: 'D3', difficulty: 'Hard', format: 'four-pills',
    question: 'Two machines produce 120 parts/hr combined. Machine A produces twice as much as B. How many does A produce per hour?',
    options: ['60', '80', '40', '90'], correct: 1,
    explanation: 'A=2B and A+B=120. 2B+B=120 → B=40 → A=80 parts/hr.' },

  // ── D4 GEOMETRY ───────────────────────────────────────────────────────────
  { id: 41, domain: 'D4', difficulty: 'Easy', format: 'two-cards',
    question: 'A 13-foot ladder leans against a wall. The base is 5 feet from the wall. How high does it reach?',
    cards: ['12 feet', '10 feet'], correct: 0,
    explanation: 'Pythagorean: 5²+h²=13² → h²=169-25=144 → h=12 feet.' },

  { id: 42, domain: 'D4', difficulty: 'Medium', format: 'four-pills',
    question: 'A circular pizza has diameter 14 inches. What is the area of a 90° slice?',
    options: ['38.5π', '12.25π', '49π', '7π'], correct: 1,
    explanation: 'r=7. Full area=49π. 90° = 1/4 of circle. Slice area = 49π/4 = 12.25π.' },

  { id: 43, domain: 'D4', difficulty: 'Medium', format: 'scroll-wheel',
    question: 'A square garden has perimeter 60 feet. What is the area in square feet?',
    correctValue: 225,
    explanation: 'Side = 60/4 = 15 feet. Area = 15² = 225 sq ft.' },

  { id: 44, domain: 'D4', difficulty: 'Medium', format: 'four-pills',
    question: 'A cylindrical tank has radius 4m and height 10m. Volume in cubic meters? (use π≈3.14)',
    options: ['502.4m³', '251.2m³', '401.92m³', '160m³'], correct: 0,
    explanation: 'V = πr²h = 3.14×16×10 = 502.4m³.' },

  { id: 45, domain: 'D4', difficulty: 'Easy', format: 'true-false',
    question: 'A square is always a rectangle, but a rectangle is not always a square.',
    correct: 'true',
    explanation: 'True. Squares have all properties of rectangles (4 right angles) PLUS equal sides. Rectangles don\'t require equal sides.' },

  { id: 46, domain: 'D4', difficulty: 'Hard', format: 'four-pills',
    question: 'Two similar triangles have sides in ratio 3:5. If smaller triangle area is 27m², larger area?',
    options: ['45m²', '135m²', '81m²', '75m²'], correct: 3,
    explanation: 'Area ratio = (3/5)² = 9/25. 27/(9/25) = 27×25/9 = 75m².' },

  { id: 47, domain: 'D4', difficulty: 'Hard', format: 'scroll-wheel',
    question: 'A tree casts a 24-foot shadow. Angle of elevation to top is 30°. Height of tree in feet?',
    correctValue: 14,
    explanation: 'tan30° = h/24. h = 24×tan30° = 24×(1/√3) ≈ 24×0.577 ≈ 13.86 ≈ 14 feet.' },

  { id: 48, domain: 'D4', difficulty: 'Medium', format: 'four-pills',
    question: 'A cone has radius 6cm and height 8cm. Volume to nearest whole? (π≈3.14)',
    options: ['452cm³', '904cm³', '301cm³', '226cm³'], correct: 2,
    explanation: 'V = (1/3)πr²h = (1/3)(3.14)(36)(8) = (1/3)(904.32) ≈ 301cm³.' },

  { id: 49, domain: 'D4', difficulty: 'Easy', format: 'true-false',
    question: 'The diagonal of a square with side 5 is 5√2.',
    correct: 'true',
    explanation: 'True. Diagonal = s√2 = 5√2. Using Pythagorean: √(5²+5²) = √50 = 5√2.' },

  { id: 50, domain: 'D4', difficulty: 'Hard', format: 'four-pills',
    question: 'A sphere fits exactly inside a cube with side 6cm. Volume of space between them? (π≈3.14)',
    options: ['103.1cm³', '216cm³', '84.8cm³', '56.6cm³'], correct: 0,
    explanation: 'Cube V=216. Sphere r=3: V=(4/3)π(27)=113.04≈113. Space=216-113=103.' },
];

const TIMER_DURATION = 60;

// ─── FLOATING SYMBOL ─────────────────────────────────────────────────────────
function FloatSymbol({ symbol, left, delay }: { symbol: string; left: number; delay: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      y.setValue(300);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(y, { toValue: -50, duration: 8000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.15, duration: 6000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(animate, Math.random() * 4000));
    };
    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.Text style={{
      position: 'absolute', left, color: '#D97706',
      fontSize: 24, fontWeight: '700',
      transform: [{ translateY: y }],
      opacity,
    }}>{symbol}</Animated.Text>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function StorySolveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [answered, setAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [shuffledQ] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [wheelValue, setWheelValue] = useState(0);
  const [resultLabel, setResultLabel] = useState<'solved' | 'wrong' | null>(null);

  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const candleAnim = useRef(new Animated.Value(0.8)).current;
  const questionFade = useRef(new Animated.Value(0)).current;
  const questionSlide = useRef(new Animated.Value(10)).current;
  const correctCardAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  const mathSymbols = ['∑', 'π', '√', '∞', '×', '÷', 'α', 'β', '∫', 'Δ'];

  useEffect(() => {
    // Candle flicker
    Animated.loop(
      Animated.sequence([
        Animated.timing(candleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(candleAnim, { toValue: 0.75, duration: 600, useNativeDriver: true }),
        Animated.timing(candleAnim, { toValue: 0.95, duration: 400, useNativeDriver: true }),
        Animated.timing(candleAnim, { toValue: 0.8, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate question in
  useEffect(() => {
    questionFade.setValue(0);
    questionSlide.setValue(12);
    Animated.parallel([
      Animated.timing(questionFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(questionSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    setWheelValue(0);
  }, [currentQ]);

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

  function handleAnswer(answer: any) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);

    const q = shuffledQ[currentQ];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 8;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((8 - timeTaken) * 2)) : 0;

    let isCorrect = false;
    if (q.format === 'true-false') {
      isCorrect = answer === q.correct;
    } else if (q.format === 'scroll-wheel') {
      isCorrect = Number(answer) === q.correctValue;
    } else if (q.format === 'two-cards' || q.format === 'horizontal-scroll') {
      isCorrect = answer === q.correct;
    } else {
      isCorrect = answer === q.correct;
    }

    let pts = 0;
    if (isCorrect) {
      pts = 8 + speedBonus;
      if (isSpeedy) setSpeedyCount(s => s + 1);
      setScore(s => s + pts);
      showFloatingScore(`+${pts}${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
      setResultLabel('solved');
      Animated.sequence([
        Animated.spring(correctCardAnim, { toValue: -8, useNativeDriver: true, tension: 200, friction: 6 }),
        Animated.spring(correctCardAnim, { toValue: 0, useNativeDriver: true, tension: 200, friction: 6 }),
      ]).start();
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
      setResultLabel('wrong');
    }

    const correctLabel = q.format === 'scroll-wheel' ? String(q.correctValue)
      : q.format === 'true-false' ? String(q.correct)
      : q.format === 'two-cards' || q.format === 'horizontal-scroll' ? q.cards[q.correct]
      : q.options[q.correct];

    const userLabel = q.format === 'scroll-wheel' ? String(answer)
      : q.format === 'true-false' ? String(answer)
      : q.format === 'two-cards' || q.format === 'horizontal-scroll' ? q.cards[answer]
      : q.options[answer];

    playTapSound();
    if (isCorrect) playCorrectSound();
    else playWrongSound();
    setAnswers(prev => [...prev, {
      question: q.question, domain: q.domain, format: q.format,
      userAnswer: userLabel, correctAnswer: correctLabel,
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);

    setTimeout(() => {
      if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setCurrentQ(n => n + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setResultLabel(null);
      correctCardAnim.setValue(0);
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
    setCurrentQ(0); setSelectedAnswer(null); setAnswered(false);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setResultLabel(null);
    setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#D97706' : timerPct > 0.25 ? '#F59E0B' : '#DC2626';

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(14, finalScore, xpEarned, 'math_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '📖 Master Solver!' : finalScore >= 40 ? '✏️ Good Work!' : '🔄 Keep Reading!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Story Complete 📖</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewDomain}>{a.domain} · {a.format} · {a.isCorrect ? '✅ SOLVED' : '❌ MISSED'}</Text>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                Your answer: {a.userAnswer}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>✅ Correct: {a.correctAnswer}</Text>}
              <Text style={styles.reviewExplanation}>💡 {a.explanation}</Text>
              {a.isSpeedy && <Text style={styles.reviewSpeedy}>⚡ Quick thinking!</Text>}
            </View>
          ))}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{correctCount}/{questionsAnswered}</Text>
                <Text style={styles.perfLabel}>Solved</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Story Solve</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📚 Story History</Text>
            <Text style={styles.historySub}>Solve more stories to see your history!</Text>
            <Text style={styles.historyRank}>Story #1 — Score: {finalScore}</Text>
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
  const domainColor = q.domain === 'D1' ? '#2563EB' : q.domain === 'D2' ? '#7C3AED' : q.domain === 'D3' ? '#F97316' : '#F59E0B';

  // ─── ANSWER FORMAT RENDERERS ─────────────────────────────────────────────
  function renderAnswers() {
    if (q.format === 'two-cards') {
      return (
        <View style={styles.twoCardsRow}>
          {q.cards.map((card: string, i: number) => {
            let bg = styles.twoCard;
            let borderC = '#4A3020';
            let textC = '#FEF3C7';
            if (answered) {
              if (i === q.correct) { borderC = '#10B981'; textC = '#10B981'; }
              else if (selectedAnswer === i) { borderC = '#EF4444'; textC = '#EF4444'; }
            } else if (selectedAnswer === i) {
              borderC = '#D97706'; textC = '#D97706';
            }
            return (
              <TouchableOpacity
                key={i}
                style={[styles.twoCard, { borderColor: borderC }]}
                onPress={() => handleAnswer(i)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ translateY: answered && i === q.correct ? correctCardAnim : new Animated.Value(0) }] }}>
                  <Text style={[styles.twoCardText, { color: textC }]}>{card}</Text>
                  {answered && i === q.correct && <Text style={styles.cardCheck}>✅</Text>}
                  {answered && selectedAnswer === i && i !== q.correct && <Text style={styles.cardX}>❌</Text>}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (q.format === 'four-pills') {
      return (
        <View style={styles.pillsCol}>
          {q.options.map((opt: string, i: number) => {
            let bg = '#2A1A0A';
            let borderC = '#4A3020';
            let textC = '#FEF3C7';
            if (answered) {
              if (i === q.correct) { bg = '#10B98120'; borderC = '#10B981'; textC = '#10B981'; }
              else if (selectedAnswer === i) { bg = '#EF444420'; borderC = '#EF4444'; textC = '#EF4444'; }
            } else if (selectedAnswer === i) {
              bg = '#D9770620'; borderC = '#D97706'; textC = '#D97706';
            }
            return (
              <TouchableOpacity
                key={i}
                style={[styles.pill, { backgroundColor: bg, borderColor: borderC }]}
                onPress={() => handleAnswer(i)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <View style={[styles.pillLetter, { backgroundColor: borderC + '40' }]}>
                  <Text style={[styles.pillLetterText, { color: borderC }]}>{['A','B','C','D'][i]}</Text>
                </View>
                <Text style={[styles.pillText, { color: textC }]}>{opt}</Text>
                {answered && i === q.correct && <Text style={styles.pillIcon}>✅</Text>}
                {answered && selectedAnswer === i && i !== q.correct && <Text style={styles.pillIcon}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (q.format === 'true-false') {
      const trueSelected = selectedAnswer === 'true';
      const falseSelected = selectedAnswer === 'false';
      const correctIsTrue = q.correct === 'true';
      return (
        <View style={styles.tfRow}>
          <TouchableOpacity
            style={[styles.tfCard, {
              backgroundColor: answered
                ? (correctIsTrue ? '#10B98125' : (trueSelected ? '#EF444425' : '#1A1A1A20'))
                : (trueSelected ? '#06402020' : '#06402010'),
              borderColor: answered
                ? (correctIsTrue ? '#10B981' : (trueSelected ? '#EF4444' : '#1A3A1A'))
                : (trueSelected ? '#10B981' : '#1A3A1A'),
            }]}
            onPress={() => handleAnswer('true')}
            disabled={answered}
            activeOpacity={0.8}
          >
            <Text style={styles.tfEmoji}>✅</Text>
            <Text style={[styles.tfText, { color: answered ? (correctIsTrue ? '#10B981' : '#EF4444') : '#6EE7B7' }]}>TRUE</Text>
            {answered && correctIsTrue && <Text style={styles.tfCheck}>🎯</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tfCard, {
              backgroundColor: answered
                ? (!correctIsTrue ? '#10B98125' : (falseSelected ? '#EF444425' : '#1A1A1A20'))
                : (falseSelected ? '#7F1D1D20' : '#7F1D1D10'),
              borderColor: answered
                ? (!correctIsTrue ? '#10B981' : (falseSelected ? '#EF4444' : '#7F1D1D'))
                : (falseSelected ? '#EF4444' : '#7F1D1D'),
            }]}
            onPress={() => handleAnswer('false')}
            disabled={answered}
            activeOpacity={0.8}
          >
            <Text style={styles.tfEmoji}>❌</Text>
            <Text style={[styles.tfText, { color: answered ? (!correctIsTrue ? '#10B981' : '#EF4444') : '#FCA5A5' }]}>FALSE</Text>
            {answered && !correctIsTrue && <Text style={styles.tfCheck}>🎯</Text>}
          </TouchableOpacity>
        </View>
      );
    }

    if (q.format === 'scroll-wheel') {
      return (
        <View style={styles.wheelContainer}>
          <Text style={styles.wheelLabel}>Enter your answer:</Text>
          <View style={styles.wheelBox}>
            <TouchableOpacity
              style={styles.wheelBtn}
              onPress={() => !answered && setWheelValue(v => v + 1)}
              disabled={answered}
            >
              <Text style={styles.wheelBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={[styles.wheelValue, {
              color: answered
                ? (Number(wheelValue) === q.correctValue ? '#10B981' : '#EF4444')
                : '#FEF3C7'
            }]}>{wheelValue}</Text>
            <TouchableOpacity
              style={styles.wheelBtn}
              onPress={() => !answered && setWheelValue(v => Math.max(0, v - 1))}
              disabled={answered}
            >
              <Text style={styles.wheelBtnText}>▼</Text>
            </TouchableOpacity>
          </View>
          {answered && Number(wheelValue) !== q.correctValue && (
            <Text style={styles.wheelCorrect}>Correct answer: {q.correctValue}</Text>
          )}
          {!answered && (
            <TouchableOpacity
              style={styles.wheelSubmit}
              onPress={() => handleAnswer(wheelValue)}
            >
              <Text style={styles.wheelSubmitText}>📖 Submit Answer</Text>
            </TouchableOpacity>
          )}
          {answered && (
            <View style={[styles.wheelResult, {
              backgroundColor: Number(wheelValue) === q.correctValue ? '#10B98120' : '#EF444420',
              borderColor: Number(wheelValue) === q.correctValue ? '#10B981' : '#EF4444',
            }]}>
              <Text style={{ color: Number(wheelValue) === q.correctValue ? '#10B981' : '#EF4444', fontWeight: '800', fontSize: 16 }}>
                {Number(wheelValue) === q.correctValue ? '✅ CORRECT!' : '❌ INCORRECT'}
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (q.format === 'horizontal-scroll') {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScrollRow} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
          {q.cards.map((card: string, i: number) => {
            let bg = '#2A1A0A';
            let borderC = '#4A3020';
            let textC = '#FEF3C7';
            if (answered) {
              if (i === q.correct) { bg = '#10B98120'; borderC = '#10B981'; textC = '#10B981'; }
              else if (selectedAnswer === i) { bg = '#EF444420'; borderC = '#EF4444'; textC = '#EF4444'; }
            } else if (selectedAnswer === i) {
              bg = '#D9770630'; borderC = '#D97706'; textC = '#D97706';
            }
            return (
              <TouchableOpacity
                key={i}
                style={[styles.hCard, { backgroundColor: bg, borderColor: borderC }]}
                onPress={() => handleAnswer(i)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Text style={[styles.hCardText, { color: textC }]}>{card}</Text>
                {answered && i === q.correct && <Text style={{ fontSize: 16, marginTop: 6 }}>✅</Text>}
                {answered && selectedAnswer === i && i !== q.correct && <Text style={{ fontSize: 16, marginTop: 6 }}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    }

    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* BACKGROUND */}
        <View style={styles.bgLayer} pointerEvents="none">
          {/* Ambient candle glow */}
          <Animated.View style={[styles.candleGlow, { opacity: candleAnim }]} />
          {/* Floating math symbols */}
          {mathSymbols.map((sym, i) => (
            <FloatSymbol key={i} symbol={sym} left={(i * 38) % 340 + 10} delay={i * 700} />
          ))}
          {/* Page lines */}
          {[0,1,2,3,4,5].map(i => (
            <View key={i} style={[styles.pageLine, { top: 120 + i * 80 }]} />
          ))}
          {/* Candle flame */}
          <Animated.Text style={[styles.candleFlame, { opacity: candleAnim }]}>🕯️</Animated.Text>
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>📖 STORY SOLVE</Text>
            <Text style={styles.gameSubtitle}>Chapter {currentQ + 1} of {shuffledQ.length}</Text>
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
            {[1,2,3].map(i => (
              <Text key={i} style={styles.bookmark}>{i <= lives ? '🔖' : '💨'}</Text>
            ))}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
            </View>
            <Text style={styles.timerLabel}>
              {timerPct > 0.5 ? '🕯️ Candle burning' : timerPct > 0.25 ? '🔥 Getting low' : '💨 Almost out!'}
            </Text>
          </View>
          <View style={[styles.domainPill, { backgroundColor: domainColor + '25', borderColor: domainColor }]}>
            <Text style={[styles.domainTxt, { color: domainColor }]}>{q.domain} · {q.difficulty}</Text>
          </View>
        </View>

        {/* QUESTION PARCHMENT */}
        <Animated.View style={[styles.parchmentCard, {
          opacity: questionFade,
          transform: [{ translateY: questionSlide }],
        }]}>
          <View style={styles.parchmentBorderTop} />
          <Text style={styles.storyLabel}>≋≋ THE PROBLEM ≋≋</Text>
          <Text style={styles.questionText}>{q.question}</Text>
          <View style={styles.parchmentBorderBottom} />
        </Animated.View>

        {/* RESULT LABEL */}
        {resultLabel && (
          <Text style={[styles.resultText, { color: resultLabel === 'solved' ? '#D97706' : '#EF4444' }]}>
            {resultLabel === 'solved' ? '✨ SOLVED! ✨' : '📕 INCORRECT'}
          </Text>
        )}

        {/* ANSWERS */}
        <View style={styles.answersArea}>
          {renderAnswers()}
        </View>

      </Animated.View>

      {/* PAUSE OVERLAY */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>🕯️ Bookmark</Text>
            <Text style={styles.pauseSub}>Score: {score} pts</Text>
            <TouchableOpacity style={styles.pauseOption} onPress={togglePause}>
              <Text style={styles.pauseOptionText}>📖 Continue Reading</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseOption} onPress={restartGame}>
              <Text style={styles.pauseOptionText}>🔄 Start Over</Text>
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
  safe: { flex: 1, backgroundColor: '#12080A' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#12080A' },

  // Background
  bgLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 },
  candleGlow: { position: 'absolute', bottom: 0, left: '20%', width: '60%', height: 400, backgroundColor: '#D9770610', borderRadius: 200 },
  pageLine: { position: 'absolute', left: 20, right: 20, height: 1, backgroundColor: '#D9770615' },
  candleFlame: { position: 'absolute', bottom: 20, right: 20, fontSize: 28, opacity: 0.6 },

  // Header
  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20, gap: 10, zIndex: 10 },
  pauseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1208', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D97706' },
  pauseIcon: { fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 20, fontWeight: '900', color: '#FEF3C7', letterSpacing: 1 },
  gameSubtitle: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  scoreBox: { backgroundColor: '#D9770620', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#D97706' },
  scoreNum: { fontSize: 20, fontWeight: '900', color: '#D97706' },
  scoreLabel: { fontSize: 9, color: '#D97706', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 20, top: 105, fontSize: 20, fontWeight: '900', color: '#D97706', zIndex: 100 },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, backgroundColor: '#1E120880', borderRadius: 14, padding: 10, zIndex: 10 },
  livesRow: { flexDirection: 'row', gap: 2 },
  bookmark: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  timerNum: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#2A1A0A', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  timerLabel: { fontSize: 9, fontWeight: '700', marginTop: 2, color: '#D97706' },
  domainPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  domainTxt: { fontSize: 10, fontWeight: '800' },

  // Parchment
  parchmentCard: { marginHorizontal: 20, backgroundColor: '#1E1208', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#4A3020', zIndex: 10 },
  parchmentBorderTop: { height: 2, backgroundColor: '#D9770630', marginBottom: 8, borderRadius: 1 },
  parchmentBorderBottom: { height: 2, backgroundColor: '#D9770630', marginTop: 8, borderRadius: 1 },
  storyLabel: { fontSize: 10, color: '#D97706', fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginBottom: 8 },
  questionText: { fontSize: 15, fontWeight: '700', color: '#FEF3C7', lineHeight: 24, textAlign: 'center' },

  // Result label
  resultText: { textAlign: 'center', fontSize: 18, fontWeight: '900', marginBottom: 6, zIndex: 10 },

  // Answers area
  answersArea: { flex: 1, paddingHorizontal: 20, zIndex: 10, justifyContent: 'flex-start' },

  // TWO CARDS
  twoCardsRow: { flexDirection: 'row', gap: 12 },
  twoCard: { flex: 1, backgroundColor: '#2A1A0A', borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, minHeight: 90 },
  twoCardText: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  cardCheck: { fontSize: 20, marginTop: 6 },
  cardX: { fontSize: 20, marginTop: 6 },

  // FOUR PILLS
  pillsCol: { gap: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: 50, padding: 14, borderWidth: 2, gap: 12 },
  pillLetter: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pillLetterText: { fontSize: 14, fontWeight: '900' },
  pillText: { flex: 1, fontSize: 15, fontWeight: '700' },
  pillIcon: { fontSize: 16 },

  // TRUE FALSE
  tfRow: { flexDirection: 'row', gap: 12 },
  tfCard: { flex: 1, borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, minHeight: 100 },
  tfEmoji: { fontSize: 28, marginBottom: 6 },
  tfText: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  tfCheck: { fontSize: 20, marginTop: 6 },

  // SCROLL WHEEL
  wheelContainer: { alignItems: 'center', gap: 12 },
  wheelLabel: { fontSize: 14, color: '#D97706', fontWeight: '700' },
  wheelBox: { flexDirection: 'row', alignItems: 'center', gap: 20, backgroundColor: '#2A1A0A', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#4A3020' },
  wheelBtn: { width: 48, height: 48, backgroundColor: '#4A3020', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wheelBtnText: { fontSize: 22, color: '#D97706', fontWeight: '900' },
  wheelValue: { fontSize: 48, fontWeight: '900', minWidth: 80, textAlign: 'center' },
  wheelCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700' },
  wheelSubmit: { backgroundColor: '#D97706', borderRadius: 50, paddingVertical: 14, paddingHorizontal: 28 },
  wheelSubmitText: { color: '#12080A', fontSize: 16, fontWeight: '900' },
  wheelResult: { borderRadius: 12, padding: 12, borderWidth: 2 },

  // HORIZONTAL SCROLL
  hScrollRow: { flexGrow: 0 },
  hCard: { borderRadius: 14, padding: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', minWidth: 140, minHeight: 80 },
  hCardText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FEF3C7', paddingTop: 50, marginBottom: 16 },
  reviewCard: { backgroundColor: '#1E1208', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  reviewDomain: { fontSize: 11, color: '#D97706', fontWeight: '700', marginBottom: 4 },
  reviewQ: { fontSize: 14, color: '#FEF3C7', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#D97706', fontWeight: '700', marginTop: 6 },
  performanceCard: { backgroundColor: '#1E1208', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4A3020' },
  performanceTitle: { fontSize: 26, fontWeight: '800', color: '#FEF3C7', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#12080A', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#D97706' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#D9770615', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D97706' },
  xpTitle: { fontSize: 16, color: '#D97706', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#D97706', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#1E1208', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4A3020' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FEF3C7', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#D97706', fontWeight: '700' },
  continueBtn: { backgroundColor: '#D97706', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 20 },
  continueBtnText: { color: '#12080A', fontSize: 17, fontWeight: '900' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#4A3020' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pauseCard: { backgroundColor: '#1E1208', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#D97706' },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FEF3C7', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#D97706', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#12080A', fontSize: 16, fontWeight: '800' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});