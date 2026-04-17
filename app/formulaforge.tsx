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
  { id: 1, domain: 'D1', difficulty: 'Easy', question: 'Which is the correct formula for slope?', options: ['m = (y₂-y₁)/(x₂-x₁)', 'm = (x₂-x₁)/(y₂-y₁)', 'm = (y₂+y₁)/(x₂+x₁)'], correct: 0, explanation: 'Slope = rise over run = change in y divided by change in x. Option B flips the fraction. Option C uses addition instead of subtraction.' },
  { id: 2, domain: 'D1', difficulty: 'Easy', question: 'Which is the slope-intercept form of a line?', options: ['y = mx + b', 'y = bx + m', 'x = my + b'], correct: 0, explanation: 'y = mx + b is slope-intercept form where m is slope and b is y-intercept. Option B swaps m and b. Option C solves for x instead of y.' },
  { id: 3, domain: 'D1', difficulty: 'Medium', question: 'A line passes through (1,2) and (3,6). Which formula correctly finds its slope?', options: ['m = (6-2)/(3-1) = 2', 'm = (3-1)/(6-2) = ½', 'm = (6+2)/(3+1) = 2'], correct: 0, explanation: 'Slope = (y₂-y₁)/(x₂-x₁) = (6-2)/(3-1) = 4/2 = 2. Option B inverts the fraction. Option C uses addition — wrong operation.' },
  { id: 4, domain: 'D1', difficulty: 'Easy', question: 'Which is the correct point-slope formula?', options: ['y - y₁ = m(x - x₁)', 'y + y₁ = m(x + x₁)', 'y - y₁ = m(x + x₁)'], correct: 0, explanation: 'Point-slope form: y - y₁ = m(x - x₁). Option B uses addition on both sides. Option C mixes subtraction and addition incorrectly.' },
  { id: 5, domain: 'D1', difficulty: 'Medium', question: 'Which formula finds the distance between two points?', options: ['d = √((x₂-x₁)² + (y₂-y₁)²)', 'd = (x₂-x₁)² + (y₂-y₁)²', 'd = √((x₂+x₁)² + (y₂+y₁)²)'], correct: 0, explanation: 'Distance = square root of the sum of squared differences. Option B is missing the square root. Option C uses addition instead of subtraction inside.' },
  { id: 6, domain: 'D1', difficulty: 'Easy', question: 'Which is the correct midpoint formula?', options: ['M = ((x₁+x₂)/2, (y₁+y₂)/2)', 'M = ((x₁-x₂)/2, (y₁-y₂)/2)', 'M = ((x₁+x₂), (y₁+y₂))'], correct: 0, explanation: 'Midpoint = average of x-coordinates and average of y-coordinates. Option B subtracts instead of adding. Option C forgets to divide by 2.' },
  { id: 7, domain: 'D1', difficulty: 'Hard', question: 'Line 1 has slope 3. A parallel line has which slope?', options: ['m = 3', 'm = -3', 'm = -1/3'], correct: 0, explanation: 'Parallel lines have EQUAL slopes. m = 3. Option B is the negative. Option C is the negative reciprocal (perpendicular slope).' },
  { id: 8, domain: 'D1', difficulty: 'Hard', question: 'Line 1 has slope 2. A perpendicular line has which slope?', options: ['m = -1/2', 'm = 2', 'm = 1/2'], correct: 0, explanation: 'Perpendicular slopes are negative reciprocals: m₁ × m₂ = -1. So m = -1/2. Option B is the same slope (parallel). Option C misses the negative sign.' },

  // ── D2 ADVANCED MATH ──────────────────────────────────────────────────────
  { id: 9, domain: 'D2', difficulty: 'Easy', question: 'Which is the correct quadratic formula?', options: ['x = (-b ± √(b²-4ac)) / 2a', 'x = (-b ± √(b²+4ac)) / 2a', 'x = (b ± √(b²-4ac)) / 2a'], correct: 0, explanation: 'The quadratic formula is x = (-b ± √(b²-4ac))/2a. Option B has + inside the radical — wrong. Option C is missing the negative before b.' },
  { id: 10, domain: 'D2', difficulty: 'Easy', question: 'Which is the correct discriminant formula?', options: ['Δ = b² - 4ac', 'Δ = b² + 4ac', 'Δ = 2b² - 4ac'], correct: 0, explanation: 'Discriminant Δ = b² - 4ac. It determines number of real roots. Option B uses + instead of -. Option C incorrectly doubles b².' },
  { id: 11, domain: 'D2', difficulty: 'Medium', question: 'For y = 2x² - 8x + 3, which formula finds the vertex x-coordinate?', options: ['x = -b/2a = 2', 'x = b/2a = -2', 'x = -b/a = 4'], correct: 0, explanation: 'Vertex x = -b/2a = -(-8)/2(2) = 8/4 = 2. Option B is missing the negative. Option C forgets to divide by 2.' },
  { id: 12, domain: 'D2', difficulty: 'Easy', question: 'Which is the vertex form of a quadratic?', options: ['y = a(x-h)² + k', 'y = a(x+h)² + k', 'y = a(x-h)² - k'], correct: 0, explanation: 'Vertex form is y = a(x-h)² + k where (h,k) is the vertex. Option B uses + so vertex would be at -h. Option C has -k which shifts the vertex incorrectly.' },
  { id: 13, domain: 'D2', difficulty: 'Medium', question: 'For ax² + bx + c = 0, which formula gives the SUM of roots?', options: ['r₁ + r₂ = -b/a', 'r₁ + r₂ = b/a', 'r₁ + r₂ = c/a'], correct: 0, explanation: 'Sum of roots = -b/a by Vieta\'s formulas. Option B is missing the negative. Option C is the product formula, not sum.' },
  { id: 14, domain: 'D2', difficulty: 'Medium', question: 'For ax² + bx + c = 0, which formula gives the PRODUCT of roots?', options: ['r₁ × r₂ = c/a', 'r₁ × r₂ = -c/a', 'r₁ × r₂ = -b/a'], correct: 0, explanation: 'Product of roots = c/a. Option B incorrectly adds a negative. Option C is the sum formula, not product.' },
  { id: 15, domain: 'D2', difficulty: 'Hard', question: 'Which formula models exponential GROWTH?', options: ['Final = Initial × (1+r)ⁿ', 'Final = Initial × (1-r)ⁿ', 'Final = Initial × rⁿ'], correct: 0, explanation: 'Exponential growth: multiply by (1+r) each period where r is growth rate. Option B is decay (1-r). Option C is missing the 1+ which represents the original amount.' },
  { id: 16, domain: 'D2', difficulty: 'Hard', question: 'A quadratic has discriminant b²-4ac = 0. What does this mean?', options: ['Exactly one real root (repeated)', 'Two distinct real roots', 'No real roots'], correct: 0, explanation: 'Δ = 0 means one repeated real root. Δ > 0 means two real roots. Δ < 0 means no real roots (complex).' },
  { id: 17, domain: 'D2', difficulty: 'Hard', question: 'Which correctly expresses exponential DECAY?', options: ['A = A₀ × (1-r)ⁿ', 'A = A₀ × (1+r)ⁿ', 'A = A₀ - r×n'], correct: 0, explanation: 'Exponential decay: A = A₀(1-r)ⁿ where r is decay rate. Option B is growth. Option C is linear decrease, not exponential.' },

  // ── D3 PROBLEM SOLVING & DATA ────────────────────────────────────────────
  { id: 18, domain: 'D3', difficulty: 'Easy', question: 'Which formula calculates percent change?', options: ['% change = (new-old)/old × 100', '% change = (old-new)/new × 100', '% change = (new-old)/new × 100'], correct: 0, explanation: 'Percent change = (new - old)/old × 100. The base is always the ORIGINAL (old) value. Option B inverts the subtraction and uses new as base. Option C uses new as the base — wrong.' },
  { id: 19, domain: 'D3', difficulty: 'Easy', question: 'Which is the correct simple interest formula?', options: ['I = P × r × t', 'I = P + r × t', 'I = P × r / t'], correct: 0, explanation: 'Simple interest I = Prt (Principal × rate × time). Option B adds P instead of multiplying. Option C divides by time instead of multiplying.' },
  { id: 20, domain: 'D3', difficulty: 'Easy', question: 'Which formula finds the mean of a data set?', options: ['Mean = sum of values / count', 'Mean = middle value', 'Mean = most frequent value'], correct: 0, explanation: 'Mean = sum/count (average). Option B describes the median. Option C describes the mode.' },
  { id: 21, domain: 'D3', difficulty: 'Easy', question: 'Which is the correct probability formula?', options: ['P(E) = favorable outcomes / total outcomes', 'P(E) = total outcomes / favorable outcomes', 'P(E) = favorable outcomes - total outcomes'], correct: 0, explanation: 'P(E) = favorable/total. Option B inverts the fraction (would give values > 1). Option C subtracts which makes no sense for probability.' },
  { id: 22, domain: 'D3', difficulty: 'Medium', question: 'A shirt costs $40, now $50. Which formula correctly finds percent increase?', options: ['(50-40)/40 × 100 = 25%', '(50-40)/50 × 100 = 20%', '(40-50)/40 × 100 = -25%'], correct: 0, explanation: 'Percent increase = (new-old)/old × 100 = 10/40 × 100 = 25%. Option B uses new as base = 20% (wrong base). Option C gets the subtraction backwards.' },
  { id: 23, domain: 'D3', difficulty: 'Medium', question: 'Which formula finds compound interest amount?', options: ['A = P(1 + r/n)^(nt)', 'A = P + r/n × nt', 'A = P × r^(nt)'], correct: 0, explanation: 'Compound interest: A = P(1+r/n)^(nt) where n = compounds per year. Option B is not exponential. Option C incorrectly uses r alone as the base.' },
  { id: 24, domain: 'D3', difficulty: 'Hard', question: 'Which correctly finds the percentage a part is of a whole?', options: ['Percent = (part/whole) × 100', 'Percent = (whole/part) × 100', 'Percent = (part-whole) × 100'], correct: 0, explanation: 'Percent = (part/whole) × 100. Option B inverts giving > 100% when part < whole. Option C subtracts instead of divides.' },
  { id: 25, domain: 'D3', difficulty: 'Hard', question: 'Two events A and B are independent. Which formula finds P(A and B)?', options: ['P(A∩B) = P(A) × P(B)', 'P(A∩B) = P(A) + P(B)', 'P(A∩B) = P(A) + P(B) - P(A∪B)'], correct: 0, explanation: 'For independent events: P(A and B) = P(A) × P(B). Option B is for P(A or B) when mutually exclusive. Option C is the inclusion-exclusion formula for unions.' },

  // ── D4 GEOMETRY & TRIG ────────────────────────────────────────────────────
  { id: 26, domain: 'D4', difficulty: 'Easy', question: 'Which formula finds the area of a circle?', options: ['A = πr²', 'A = 2πr', 'A = πd'], correct: 0, explanation: 'Area = πr². Option B is circumference (2πr). Option C is also circumference written with diameter (πd).' },
  { id: 27, domain: 'D4', difficulty: 'Easy', question: 'Which is the correct Pythagorean theorem?', options: ['a² + b² = c²', 'a + b = c', 'a² + b² = c'], correct: 0, explanation: 'Pythagorean theorem: a² + b² = c² where c is the hypotenuse. Option B has no squares. Option C is missing the square on c.' },
  { id: 28, domain: 'D4', difficulty: 'Easy', question: 'Which formula gives the volume of a cylinder?', options: ['V = πr²h', 'V = 2πrh', 'V = πrh'], correct: 0, explanation: 'Cylinder volume = πr²h (area of circular base × height). Option B is the lateral surface area formula. Option C is missing the r exponent.' },
  { id: 29, domain: 'D4', difficulty: 'Easy', question: 'Which correctly defines sin θ in a right triangle?', options: ['sin θ = opposite / hypotenuse', 'sin θ = adjacent / hypotenuse', 'sin θ = opposite / adjacent'], correct: 0, explanation: 'SOH: Sin = Opposite/Hypotenuse. Option B is cosine (CAH: Cos = Adjacent/Hypotenuse). Option C is tangent (TOA: Tan = Opposite/Adjacent).' },
  { id: 30, domain: 'D4', difficulty: 'Easy', question: 'Which correctly defines cos θ in a right triangle?', options: ['cos θ = adjacent / hypotenuse', 'cos θ = opposite / hypotenuse', 'cos θ = adjacent / opposite'], correct: 0, explanation: 'CAH: Cos = Adjacent/Hypotenuse. Option B is sine. Option C is the reciprocal of tangent.' },
  { id: 31, domain: 'D4', difficulty: 'Easy', question: 'Which correctly defines tan θ in a right triangle?', options: ['tan θ = opposite / adjacent', 'tan θ = adjacent / opposite', 'tan θ = opposite / hypotenuse'], correct: 0, explanation: 'TOA: Tan = Opposite/Adjacent. Option B is cotangent (reciprocal of tan). Option C is sine.' },
  { id: 32, domain: 'D4', difficulty: 'Medium', question: 'Which formula finds the volume of a sphere?', options: ['V = (4/3)πr³', 'V = 4πr²', 'V = (4/3)πr²'], correct: 0, explanation: 'Sphere volume = (4/3)πr³. Option B is surface area of a sphere (4πr²). Option C has r² instead of r³.' },
  { id: 33, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives arc length?', options: ['L = (θ/360) × 2πr', 'L = (θ/360) × πr²', 'L = θ × r²'], correct: 0, explanation: 'Arc length = fraction of circle × circumference = (θ/360) × 2πr. Option B uses the area formula instead of circumference. Option C is not a standard formula.' },
  { id: 34, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives the area of a sector?', options: ['A = (θ/360) × πr²', 'A = (θ/360) × 2πr', 'A = θ × πr²'], correct: 0, explanation: 'Sector area = fraction of circle × total area = (θ/360) × πr². Option B uses circumference instead of area. Option C doesn\'t divide by 360.' },
  { id: 35, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives the sum of interior angles of a polygon?', options: ['S = (n-2) × 180°', 'S = n × 180°', 'S = (n-2) × 90°'], correct: 0, explanation: 'Interior angle sum = (n-2) × 180°. Option B overcounts by including exterior angles. Option C uses 90° instead of 180°.' },
  { id: 36, domain: 'D4', difficulty: 'Hard', question: 'Which is the Law of Cosines?', options: ['c² = a² + b² - 2ab·cosC', 'c² = a² + b² + 2ab·cosC', 'c² = a² - b² - 2ab·cosC'], correct: 0, explanation: 'Law of Cosines: c² = a² + b² - 2ab·cosC. Option B has + instead of - before 2ab·cosC. Option C incorrectly subtracts b².' },
  { id: 37, domain: 'D4', difficulty: 'Hard', question: 'Which is the Law of Sines?', options: ['a/sinA = b/sinB = c/sinC', 'sinA/a = sinB/b ≠ sinC/c', 'a×sinA = b×sinB = c×sinC'], correct: 0, explanation: 'Law of Sines: a/sinA = b/sinB = c/sinC. All three ratios are equal. Option C multiplies instead of divides.' },
  { id: 38, domain: 'D4', difficulty: 'Hard', question: 'Which formula gives the surface area of a sphere?', options: ['SA = 4πr²', 'SA = (4/3)πr³', 'SA = 2πr²'], correct: 0, explanation: 'Sphere surface area = 4πr². Option B is volume. Option C is off by a factor of 2.' },

  // ── MIXED APPLIED QUESTIONS ───────────────────────────────────────────────
  { id: 39, domain: 'D2', difficulty: 'Medium', question: 'For x² + 5x + 6 = 0, which formula correctly starts solving it?', options: ['x = (-5 ± √(25-24)) / 2', 'x = (5 ± √(25-24)) / 2', 'x = (-5 ± √(25+24)) / 2'], correct: 0, explanation: 'a=1, b=5, c=6. Quadratic formula: x = (-5 ± √(25-24))/2. Option B is missing the negative on b. Option C adds instead of subtracts under the radical.' },
  { id: 40, domain: 'D1', difficulty: 'Medium', question: 'A line has slope 2 and passes through (1, 3). Which correctly writes point-slope form?', options: ['y - 3 = 2(x - 1)', 'y + 3 = 2(x + 1)', 'y - 3 = 2(x + 1)'], correct: 0, explanation: 'y - y₁ = m(x - x₁): y - 3 = 2(x - 1). Option B uses addition on both sides. Option C mixes — uses subtraction on left but addition on right.' },
  { id: 41, domain: 'D3', difficulty: 'Medium', question: 'A population of 1000 grows 5% per year. Which formula finds population after 3 years?', options: ['P = 1000 × (1.05)³', 'P = 1000 × (0.95)³', 'P = 1000 + 0.05 × 3'], correct: 0, explanation: 'Exponential growth: P = 1000(1+0.05)³ = 1000(1.05)³. Option B uses decay (0.95). Option C is simple interest — linear not exponential.' },
  { id: 42, domain: 'D4', difficulty: 'Medium', question: 'A right triangle has legs 5 and 12. Which formula finds the hypotenuse?', options: ['c = √(5² + 12²) = 13', 'c = 5² + 12² = 169', 'c = √(5 + 12) = √17'], correct: 0, explanation: 'c = √(a²+b²) = √(25+144) = √169 = 13. Option B forgets the square root. Option C adds the bases without squaring them first.' },
  { id: 43, domain: 'D1', difficulty: 'Hard', question: 'Which formula correctly finds the distance between (-1,2) and (3,5)?', options: ['d = √((3-(-1))² + (5-2)²) = 5', 'd = √((3+1)² - (5-2)²) = √7', 'd = (3-(-1)) + (5-2) = 7'], correct: 0, explanation: 'd = √(4²+3²) = √(16+9) = √25 = 5. Option B incorrectly subtracts the second term. Option C adds differences instead of using the distance formula.' },
  { id: 44, domain: 'D3', difficulty: 'Hard', question: 'A bag has 4 red and 6 blue balls. Which finds P(red)?', options: ['P(red) = 4/10 = 2/5', 'P(red) = 4/6 = 2/3', 'P(red) = 6/10 = 3/5'], correct: 0, explanation: 'Total = 10 balls. P(red) = 4/10 = 2/5. Option B divides by blue count only (not total). Option C gives probability of blue, not red.' },
  { id: 45, domain: 'D4', difficulty: 'Hard', question: 'A circle has equation (x-3)² + (y+2)² = 25. What is the radius?', options: ['r = 5', 'r = 25', 'r = √5'], correct: 0, explanation: 'Standard form: (x-h)²+(y-k)²=r². Here r²=25 so r=5. Option B uses r² instead of r. Option C takes √r² incorrectly giving √5.' },
  { id: 46, domain: 'D2', difficulty: 'Hard', question: 'For y = 3(x-2)² + 5, what is the vertex?', options: ['(2, 5)', '(-2, 5)', '(2, -5)'], correct: 0, explanation: 'Vertex form y = a(x-h)²+k gives vertex (h,k). Here h=2 (note: x-h means subtract 2, so h=+2) and k=5. Option B uses wrong sign for h. Option C uses wrong sign for k.' },
  { id: 47, domain: 'D1', difficulty: 'Hard', question: 'Lines y = 3x + 1 and y = -⅓x + 4. What is their relationship?', options: ['Perpendicular (m₁×m₂ = -1)', 'Parallel (equal slopes)', 'Neither parallel nor perpendicular'], correct: 0, explanation: '3 × (-1/3) = -1, confirming perpendicular lines. Option B is wrong — slopes 3 and -1/3 are not equal. Option C is wrong because the product rule confirms perpendicularity.' },
  { id: 48, domain: 'D2', difficulty: 'Hard', question: 'Which formula correctly applies the quadratic formula to 2x²-3x-2=0?', options: ['x = (3 ± √(9+16)) / 4', 'x = (3 ± √(9-16)) / 4', 'x = (-3 ± √(9+16)) / 4'], correct: 0, explanation: 'a=2,b=-3,c=-2. x=(-(-3)±√((-3)²-4(2)(-2)))/2(2) = (3±√(9+16))/4 = (3±5)/4. Option B has wrong sign inside. Option C uses wrong sign for -b.' },
  { id: 49, domain: 'D3', difficulty: 'Hard', question: 'Investment $2000 at 6% for 4 years simple interest. Which formula applies?', options: ['I = 2000 × 0.06 × 4 = $480', 'I = 2000 × (1.06)⁴ = compound', 'I = 2000 + 0.06/4 = not interest'], correct: 0, explanation: 'Simple interest: I = Prt = 2000 × 0.06 × 4 = $480. Option B is compound interest formula. Option C incorrectly divides rate by time.' },
  { id: 50, domain: 'D4', difficulty: 'Hard', question: 'Triangle with sides 7, 8, angle between them = 60°. Which finds the third side?', options: ['c² = 49 + 64 - 2(7)(8)cos60° = 57', 'c² = 49 + 64 + 2(7)(8)cos60° = 169', 'c² = 49 - 64 - 2(7)(8)cos60° = wrong'], correct: 0, explanation: 'Law of Cosines: c² = a²+b²-2ab·cosC = 49+64-112(0.5) = 113-56 = 57. Option B has + before 2ab giving 169. Option C subtracts b² which is wrong.' },
];

const TIMER_DURATION = 45;

export default function FormulaForgeScreen() {
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
  const hammerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const forgeAnim = useRef(new Animated.Value(0.6)).current;
  const spark1 = useRef(new Animated.Value(0)).current;
  const spark2 = useRef(new Animated.Value(0)).current;
  const spark3 = useRef(new Animated.Value(0)).current;
  const anvil1 = useRef(new Animated.Value(0)).current;
  const anvil2 = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  // Forge glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(forgeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(forgeAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    // Anvil bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(anvil1, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(anvil1, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(anvil2, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(anvil2, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function triggerHammer() {
    Animated.sequence([
      Animated.timing(hammerAnim, { toValue: -20, duration: 100, useNativeDriver: true }),
      Animated.timing(hammerAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(hammerAnim, { toValue: -15, duration: 80, useNativeDriver: true }),
      Animated.timing(hammerAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }

  function triggerSparks() {
    [spark1, spark2, spark3].forEach((s, i) => {
      s.setValue(0);
      setTimeout(() => {
        Animated.timing(s, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }, i * 100);
    });
  }

  function triggerGlow() {
    glowAnim.setValue(1);
    Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }).start();
  }

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
      triggerHammer();
      triggerSparks();
      triggerGlow();
      setCorrectIndex(index);
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
      setCorrectIndex(q.correct);
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
      setCurrentQ(q => q + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setCorrectIndex(null);
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
    setQuestionStartTime(Date.now()); setCorrectIndex(null);
    setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  const domainColor: Record<string, string> = {
    D1: '#3B82F6', D2: '#8B5CF6', D3: '#10B981', D4: '#F59E0B',
  };
  const domainLabel: Record<string, string> = {
    D1: 'Algebra', D2: 'Advanced Math', D3: 'Problem Solving', D4: 'Geometry & Trig',
  };

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(1, finalScore, xpEarned, 'rw_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '⚒️ Master Forger!' : finalScore >= 40 ? '🔨 Good Work!' : '💪 Keep Forging!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review ⚒️</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <View style={[styles.reviewDomainBadge, { backgroundColor: (domainColor[a.domain] || '#EA580C') + '25' }]}>
                <Text style={[styles.reviewDomainText, { color: domainColor[a.domain] || '#EA580C' }]}>
                  {a.domain} · {domainLabel[a.domain]}
                </Text>
              </View>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <View style={[styles.reviewFormulaCard, { borderColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                <Text style={[styles.reviewFormulaText, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                  {a.userAnswer} {a.isCorrect ? '✅' : '❌'}
                </Text>
              </View>
              {!a.isCorrect && (
                <View style={[styles.reviewFormulaCard, { borderColor: '#10B981', marginTop: 6 }]}>
                  <Text style={[styles.reviewFormulaText, { color: '#10B981' }]}>✅ {a.correctAnswer}</Text>
                </View>
              )}
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Formula Forge</Text>
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
  const qDomainColor = domainColor[q.domain] || '#EA580C';

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* FORGE BACKGROUND */}
        <View style={styles.forgeBg} pointerEvents="none">
          {/* Forge glow */}
          <Animated.View style={[styles.forgeGlow, { opacity: forgeAnim }]} />

          {/* Hammer animation */}
          <Animated.Text style={[styles.bgHammer, { transform: [{ translateY: hammerAnim }] }]}>⚒️</Animated.Text>

          {/* Anvil decorations */}
          <Animated.Text style={[styles.anvil1, { transform: [{ translateY: anvil1 }] }]}>🔩</Animated.Text>
          <Animated.Text style={[styles.anvil2, { transform: [{ translateY: anvil2 }] }]}>🔧</Animated.Text>
          <Text style={styles.wrench1}>🔨</Text>
          <Text style={styles.wrench2}>⚙️</Text>
          <Text style={styles.wrench3}>🔑</Text>

          {/* Sparks on correct */}
          <Animated.Text style={[styles.spark1, {
            opacity: spark1,
            transform: [{ translateY: spark1.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) },
                        { translateX: spark1.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }]
          }]}>✨</Animated.Text>
          <Animated.Text style={[styles.spark2, {
            opacity: Animated.subtract(1, spark2),
            transform: [{ translateY: spark2.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
                        { translateX: spark2.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) }]
          }]}>⭐</Animated.Text>
          <Animated.Text style={[styles.spark3, {
            opacity: Animated.subtract(1, spark3),
            transform: [{ translateY: spark3.interpolate({ inputRange: [0, 1], outputRange: [0, -35] }) },
                        { translateX: spark3.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) }]
          }]}>✨</Animated.Text>

          {/* Warning stripe top */}
          <View style={styles.warningStripe}>
            {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
              <View key={i} style={[styles.warningBlock, { backgroundColor: i % 2 === 0 ? '#D97706' : '#1A1008' }]} />
            ))}
          </View>

          {/* Floor */}
          <View style={styles.forgeFloor} />
          <Text style={styles.floorBolt1}>🔩</Text>
          <Text style={styles.floorBolt2}>⚙️</Text>
          <Text style={styles.floorBolt3}>🔩</Text>
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>⚒️ Formula Forge</Text>
            <Text style={styles.gameSubtitle}>All Math Domains</Text>
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
          <View style={styles.qCounterBox}>
            <Text style={styles.qCounter}>{currentQ + 1}/{shuffledQ.length}</Text>
          </View>
        </View>

        <ScrollView style={styles.gameScroll} showsVerticalScrollIndicator={false}>

          {/* DOMAIN BADGE */}
          <View style={styles.domainRow}>
            <View style={[styles.domainBadge, { backgroundColor: qDomainColor + '25', borderColor: qDomainColor + '60' }]}>
              <Text style={[styles.domainText, { color: qDomainColor }]}>
                ⚒️ {q.domain} · {domainLabel[q.domain]} · {q.difficulty}
              </Text>
            </View>
          </View>

          {/* QUESTION */}
          <View style={[styles.questionBox, {
            borderColor: answered && correctIndex !== null ? (selectedAnswer === q.correct ? '#10B981' : '#EF4444') : '#3D2A1A',
          }]}>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>

          {/* FORGE LABEL */}
          <View style={styles.forgeLabelRow}>
            <View style={styles.forgeLabelLine} />
            <Text style={styles.forgeLabel}>⚒️ FORGE THE FORMULA</Text>
            <View style={styles.forgeLabelLine} />
          </View>

          {/* FORMULA CARDS — 3 options */}
          <View style={styles.formulaCards}>
            {q.options.map((option, index) => {
              let bgColor = '#2A1E0F';
              let borderColor = '#4A3020';
              let textColor = '#F5DEB3';
              let labelColor = '#D97706';
              let glowBorder = false;

              if (answered) {
                if (index === q.correct) {
                  bgColor = '#10B98115'; borderColor = '#10B981';
                  textColor = '#10B981'; labelColor = '#10B981'; glowBorder = true;
                } else if (index === selectedAnswer && index !== q.correct) {
                  bgColor = '#EF444415'; borderColor = '#EF4444';
                  textColor = '#EF4444'; labelColor = '#EF4444';
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.formulaCard, { backgroundColor: bgColor, borderColor, borderWidth: glowBorder ? 2 : 1.5 }]}
                  onPress={() => handleAnswer(index)}
                  disabled={answered}
                  activeOpacity={0.75}
                >
                  <View style={[styles.cardLabel, { backgroundColor: labelColor + '25' }]}>
                    <Text style={[styles.cardLabelText, { color: labelColor }]}>
                      {['A', 'B', 'C'][index]}
                    </Text>
                  </View>
                  <Text style={[styles.formulaText, { color: textColor }]}>{option}</Text>
                  {answered && index === q.correct && (
                    <Text style={styles.cardCheck}>✅</Text>
                  )}
                  {answered && index === selectedAnswer && index !== q.correct && (
                    <Text style={styles.cardX}>❌</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </Animated.View>

      {/* PAUSE OVERLAY */}
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
  safe: { flex: 1, backgroundColor: '#1A1008' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#1A1008' },

  // Forge background
  forgeBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 0,
  },
  forgeGlow: {
    position: 'absolute', bottom: 0, left: '20%',
    width: '60%', height: 300,
    backgroundColor: '#EA580C12', borderRadius: 200,
  },
  bgHammer: { position: 'absolute', top: 160, right: '12%', fontSize: 44, opacity: 0.7 },
  anvil1: { position: 'absolute', top: 220, left: '8%', fontSize: 28, opacity: 0.6 },
  anvil2: { position: 'absolute', top: 300, right: '8%', fontSize: 26, opacity: 0.5 },
  wrench1: { position: 'absolute', top: 170, left: '6%', fontSize: 26, opacity: 0.4 },
  wrench2: { position: 'absolute', bottom: 140, left: '12%', fontSize: 28, opacity: 0.5 },
  wrench3: { position: 'absolute', bottom: 140, right: '10%', fontSize: 24, opacity: 0.4 },
  spark1: { position: 'absolute', top: 200, right: '20%', fontSize: 18 },
  spark2: { position: 'absolute', top: 210, right: '25%', fontSize: 14 },
  spark3: { position: 'absolute', top: 195, right: '15%', fontSize: 16 },
  warningStripe: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 8, flexDirection: 'row',
  },
  warningBlock: { flex: 1, height: 8 },
  forgeFloor: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 60, backgroundColor: '#2A1E0F',
    borderTopWidth: 2, borderTopColor: '#4A3020',
  },
  floorBolt1: { position: 'absolute', bottom: 14, left: '15%', fontSize: 18, opacity: 0.6 },
  floorBolt2: { position: 'absolute', bottom: 16, left: '48%', fontSize: 20, opacity: 0.5 },
  floorBolt3: { position: 'absolute', bottom: 14, right: '15%', fontSize: 18, opacity: 0.6 },

  // Header
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, gap: 12, zIndex: 10,
  },
  pauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2A1E0F', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EA580C',
  },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#D97706', fontWeight: '700' },
  scoreBox: {
    backgroundColor: '#F9731620', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#F97316',
  },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F97316' },
  scoreLabel: { fontSize: 10, color: '#F97316', fontWeight: '600' },
  floatingScore: {
    position: 'absolute', right: 24, top: 110,
    fontSize: 22, fontWeight: '900', color: '#F59E0B', zIndex: 100,
  },

  // Status
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10,
    backgroundColor: '#2A1E0FCC', borderRadius: 16, padding: 12, zIndex: 10,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#3D2A1A', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: {
    backgroundColor: '#D9770620', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: '#D97706',
  },
  qCounter: { fontSize: 14, color: '#D97706', fontWeight: '800' },

  // Game scroll
  gameScroll: { flex: 1, paddingHorizontal: 20, zIndex: 10 },

  // Domain badge
  domainRow: { marginBottom: 8 },
  domainBadge: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
    alignSelf: 'flex-start', borderWidth: 1,
  },
  domainText: { fontSize: 12, fontWeight: '700' },

  // Question
  questionBox: {
    backgroundColor: '#2A1E0F', borderRadius: 18,
    padding: 18, marginBottom: 14, borderWidth: 1.5,
  },
  questionText: { fontSize: 17, fontWeight: '700', color: '#F5DEB3', lineHeight: 26 },

  // Forge label
  forgeLabelRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 12,
  },
  forgeLabelLine: { flex: 1, height: 1, backgroundColor: '#4A3020' },
  forgeLabel: { fontSize: 11, color: '#D97706', fontWeight: '800', letterSpacing: 1 },

  // Formula cards (3 options)
  formulaCards: { gap: 12, paddingBottom: 100 },
  formulaCard: {
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 70,
  },
  cardLabel: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cardLabelText: { fontSize: 16, fontWeight: '900' },
  formulaText: { flex: 1, fontSize: 15, fontWeight: '700', lineHeight: 22, fontVariant: ['tabular-nums'] as any },
  cardCheck: { fontSize: 20, flexShrink: 0 },
  cardX: { fontSize: 20, flexShrink: 0 },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: {
    backgroundColor: '#2A1E0F', borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
  },
  reviewDomainBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  reviewDomainText: { fontSize: 11, fontWeight: '700' },
  reviewQ: { fontSize: 15, color: '#F5DEB3', fontWeight: '700', marginBottom: 8 },
  reviewFormulaCard: {
    backgroundColor: '#1A1008', borderRadius: 10,
    padding: 10, borderWidth: 1,
  },
  reviewFormulaText: { fontSize: 14, fontWeight: '700' },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20, marginTop: 8 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: {
    backgroundColor: '#2A1E0F', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#4A3020',
  },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: {
    flex: 1, backgroundColor: '#1A1008',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#D97706' },
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
    backgroundColor: '#2A1E0F', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#4A3020',
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#D97706', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#EA580C', borderRadius: 50,
    padding: 18, alignItems: 'center', marginVertical: 20,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: {
    backgroundColor: 'transparent', borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 30,
    borderWidth: 2, borderColor: '#3D2A1A',
  },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },

  // Pause
  pauseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  pauseCard: {
    backgroundColor: '#2A1E0F', borderRadius: 24,
    padding: 32, width: '82%', alignItems: 'center',
    borderWidth: 1, borderColor: '#EA580C',
  },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: {
    width: '100%', padding: 16, borderRadius: 50,
    backgroundColor: '#EA580C', alignItems: 'center', marginBottom: 12,
  },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});