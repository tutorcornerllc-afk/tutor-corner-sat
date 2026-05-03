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
  { id: 1, domain: 'D1', difficulty: 'Easy', question: 'Which is the correct formula for slope?', options: ['m = (y₂-y₁)/(x₂-x₁)', 'm = (x₂-x₁)/(y₂-y₁)', 'm = (y₂+y₁)/(x₂+x₁)', 'm = (y₂-x₂)/(y₁-x₁)'], correct: 0, explanation: 'Slope = rise over run = change in y divided by change in x. Option B flips the fraction. Option C uses addition instead of subtraction.' },
  { id: 2, domain: 'D1', difficulty: 'Easy', question: 'Which is the slope-intercept form of a line?', options: ['y = bx + m', 'y = mx + b', 'x = my + b', 'y = m(x - b)'], correct: 1, explanation: 'y = mx + b is slope-intercept form where m is slope and b is y-intercept. Option A swaps m and b. Option C solves for x instead of y.' },
  { id: 3, domain: 'D1', difficulty: 'Medium', question: 'A line passes through (1,2) and (3,6). Which formula correctly finds its slope?', options: ['m = (3-1)/(6-2) = ½', 'm = (6+2)/(3+1) = 2', 'm = (6-2)/(3-1) = 2', 'm = (1-3)/(2-6) = 0.5'], correct: 2, explanation: 'Slope = (y₂-y₁)/(x₂-x₁) = (6-2)/(3-1) = 4/2 = 2. Option A inverts the fraction. Option B uses addition — wrong operation.' },
  { id: 4, domain: 'D1', difficulty: 'Easy', question: 'Which is the correct point-slope formula?', options: ['y + y₁ = m(x + x₁)', 'y - y₁ = m(x + x₁)', 'y + x₁ = m(x + y₁)', 'y - y₁ = m(x - x₁)'], correct: 3, explanation: 'Point-slope form: y - y₁ = m(x - x₁). Option A uses addition on both sides. Option B mixes subtraction and addition incorrectly.' },
  { id: 5, domain: 'D1', difficulty: 'Medium', question: 'Which formula finds the distance between two points?', options: ['d = √((x₂-x₁)² + (y₂-y₁)²)', 'd = (x₂-x₁)² + (y₂-y₁)²', 'd = √((x₂+x₁)² + (y₂+y₁)²)', 'd = (x₂-x₁) + (y₂-y₁)'], correct: 0, explanation: 'Distance = square root of the sum of squared differences. Option B is missing the square root. Option C uses addition instead of subtraction inside.' },
  { id: 6, domain: 'D1', difficulty: 'Easy', question: 'Which is the correct midpoint formula?', options: ['M = ((x₁-x₂)/2, (y₁-y₂)/2)', 'M = ((x₁+x₂)/2, (y₁+y₂)/2)', 'M = ((x₁+x₂), (y₁+y₂))', 'M = (x₁x₂, y₁y₂)'], correct: 1, explanation: 'Midpoint = average of x-coordinates and average of y-coordinates. Option A subtracts instead of adding. Option C forgets to divide by 2.' },
  { id: 7, domain: 'D1', difficulty: 'Hard', question: 'Line 1 has slope 3. A parallel line has which slope?', options: ['m = -3', 'm = -1/3', 'm = 3', 'm = 1/3'], correct: 2, explanation: 'Parallel lines have EQUAL slopes. m = 3. Option A is the negative. Option B is the negative reciprocal (perpendicular slope).' },
  { id: 8, domain: 'D1', difficulty: 'Hard', question: 'Line 1 has slope 2. A perpendicular line has which slope?', options: ['m = 2', 'm = 1/2', 'm = -2', 'm = -1/2'], correct: 3, explanation: 'Perpendicular slopes are negative reciprocals: m₁ × m₂ = -1. So m = -1/2. Option A is the same slope (parallel). Option B misses the negative sign.' },
  // ── D2 ADVANCED MATH ──────────────────────────────────────────────────────
  { id: 9, domain: 'D2', difficulty: 'Easy', question: 'Which is the correct quadratic formula?', options: ['x = (-b ± √(b²-4ac)) / 2a', 'x = (-b ± √(b²+4ac)) / 2a', 'x = (b ± √(b²-4ac)) / 2a', 'x = (-b + √(b²-4ac)) / a'], correct: 0, explanation: 'The quadratic formula is x = (-b ± √(b²-4ac))/2a. Option B has + inside the radical — wrong. Option C is missing the negative before b.' },
  { id: 10, domain: 'D2', difficulty: 'Easy', question: 'Which is the correct discriminant formula?', options: ['Δ = b² + 4ac', 'Δ = b² - 4ac', 'Δ = 2b² - 4ac', 'Δ = √(b² - 4ac)'], correct: 1, explanation: 'Discriminant Δ = b² - 4ac. It determines number of real roots. Option A uses + instead of -. Option C incorrectly doubles b².' },
  { id: 11, domain: 'D2', difficulty: 'Medium', question: 'For y = 2x² - 8x + 3, which formula finds the vertex x-coordinate?', options: ['x = b/2a = -2', 'x = -b/a = 4', 'x = -b/2a = 2', 'x = -2a/b = 0.5'], correct: 2, explanation: 'Vertex x = -b/2a = -(-8)/2(2) = 8/4 = 2. Option A is missing the negative. Option B forgets to divide by 2.' },
  { id: 12, domain: 'D2', difficulty: 'Easy', question: 'Which is the vertex form of a quadratic?', options: ['y = a(x+h)² + k', 'y = a(x-h)² - k', 'y = (x-h)² + ak', 'y = a(x-h)² + k'], correct: 3, explanation: 'Vertex form is y = a(x-h)² + k where (h,k) is the vertex. Option A uses + so vertex would be at -h. Option B has -k which shifts the vertex incorrectly.' },
  { id: 13, domain: 'D2', difficulty: 'Medium', question: 'For ax² + bx + c = 0, which formula gives the SUM of roots?', options: ['r₁ + r₂ = -b/a', 'r₁ + r₂ = b/a', 'r₁ + r₂ = c/a', 'r₁ + r₂ = -c/a'], correct: 0, explanation: 'Sum of roots = -b/a by Vieta\'s formulas. Option B is missing the negative. Option C is the product formula, not sum.' },
  { id: 14, domain: 'D2', difficulty: 'Medium', question: 'For ax² + bx + c = 0, which formula gives the PRODUCT of roots?', options: ['r₁ × r₂ = -c/a', 'r₁ × r₂ = c/a', 'r₁ × r₂ = -b/a', 'r₁ × r₂ = b/c'], correct: 1, explanation: 'Product of roots = c/a. Option A incorrectly adds a negative. Option C is the sum formula, not product.' },
  { id: 15, domain: 'D2', difficulty: 'Hard', question: 'Which formula models exponential GROWTH?', options: ['Final = Initial × (1-r)ⁿ', 'Final = Initial × rⁿ', 'Final = Initial × (1+r)ⁿ', 'Final = Initial + (1+r)ⁿ'], correct: 2, explanation: 'Exponential growth: multiply by (1+r) each period where r is growth rate. Option A is decay (1-r). Option B is missing the 1+ which represents the original amount.' },
  { id: 16, domain: 'D2', difficulty: 'Hard', question: 'A quadratic has discriminant b²-4ac = 0. What does this mean?', options: ['Two distinct real roots', 'No real roots', 'Exactly one real root (repeated)', 'Two complex roots'], correct: 2, explanation: 'Δ = 0 means one repeated real root. Δ > 0 means two real roots. Δ < 0 means no real roots (complex).' },
  { id: 17, domain: 'D2', difficulty: 'Hard', question: 'Which correctly expresses exponential DECAY?', options: ['A = A₀ × (1+r)ⁿ', 'A = A₀ - r×n', 'A = A₀ × r / n', 'A = A₀ × (1-r)ⁿ'], correct: 3, explanation: 'Exponential decay: A = A₀(1-r)ⁿ where r is decay rate. Option A is growth. Option B is linear decrease, not exponential.' },
  // ── D3 DATA ANALYSIS ──────────────────────────────────────────────────────
  { id: 18, domain: 'D3', difficulty: 'Easy', question: 'Which formula is used to calculate the mean of a data set?', options: ['Mean = Σx / n', 'Mean = Σx × n', 'Mean = max - min', 'Mean = middle value'], correct: 0, explanation: 'The mean is the sum of all values (Σx) divided by the number of values (n). Option C is the range. Option D is the median.' },
  { id: 19, domain: 'D3', difficulty: 'Easy', question: 'How is the range of a data set determined?', options: ['Range = Σx / n', 'Range = max - min', 'Range = (max + min) / 2', 'Range = Σ(x - mean)²'], correct: 1, explanation: 'The range is the difference between the highest (max) and lowest (min) values. Option A is the mean. Option C is the midrange.' },
  { id: 20, domain: 'D3', difficulty: 'Medium', question: 'Which formula represents the probability of an event NOT occurring?', options: ['P(not A) = 1 / P(A)', 'P(not A) = P(A) - 1', 'P(not A) = 1 - P(A)', 'P(not A) = 0'], correct: 2, explanation: 'The probability of the complement is 1 minus the probability of the event. Total probability must always sum to 1.' },
  { id: 21, domain: 'D3', difficulty: 'Medium', question: 'Which is the correct formula for the margin of error (ME) in a sample proportion?', options: ['ME = z × √(p(1-p)/n)', 'ME = p / n', 'ME = √(p + n)', 'ME = z × (p(1-p) / n)'], correct: 0, explanation: 'Margin of error uses the z-score times the standard error. Option D is missing the square root required for standard error.' },
  { id: 22, domain: 'D3', difficulty: 'Hard', question: 'Which formula represents the standard deviation of a sample?', options: ['s = Σ(x - mean)²', 's = √(Σ(x - mean)² / (n - 1))', 's = Σx / n', 's = √(mean / n)'], correct: 1, explanation: 'Standard deviation is the square root of the variance. Sample variance uses n-1 in the denominator to reduce bias.' },
  { id: 23, domain: 'D3', difficulty: 'Easy', question: 'In a probability distribution, what must the sum of all probabilities equal?', options: ['0.5', '100', '1', 'Σx'], correct: 2, explanation: 'The sum of all possible outcomes in a probability distribution is always exactly 1 (or 100%).' },
  { id: 24, domain: 'D3', difficulty: 'Medium', question: 'Which formula calculates a percentage change?', options: ['(Old - New) / Old', 'New - Old / 100', '((New - Old) / Old) × 100', '((Old + New) / 2)'], correct: 2, explanation: 'Percentage change is the difference (New - Old) divided by the original (Old) value, multiplied by 100.' },
  { id: 25, domain: 'D3', difficulty: 'Hard', question: 'What is the formula for the conditional probability of A given B?', options: ['P(A|B) = P(A) + P(B)', 'P(A|B) = P(A) / P(B)', 'P(A|B) = P(A and B) / P(B)', 'P(A|B) = P(B) / P(A)'], correct: 2, explanation: 'Conditional probability is the probability of both events occurring divided by the probability of the condition (B).' },
// ── D4 GEOMETRY & TRIG ────────────────────────────────────────────────────
  { id: 26, domain: 'D4', difficulty: 'Easy', question: 'Which formula finds the area of a circle?', options: ['A = 2πr', 'A = πd', 'A = πr²', 'A = r²/π'], correct: 2, explanation: 'Area = πr². Option A is circumference (2πr). Option B is also circumference written with diameter (πd).' },
  { id: 27, domain: 'D4', difficulty: 'Easy', question: 'Which is the correct Pythagorean theorem?', options: ['a + b = c', 'a² + b² = c²', 'a² + b² = c', 'a² - b² = c²'], correct: 1, explanation: 'Pythagorean theorem: a² + b² = c² where c is the hypotenuse. Option A has no squares. Option C is missing the square on c.' },
  { id: 28, domain: 'D4', difficulty: 'Easy', question: 'Which formula gives the volume of a cylinder?', options: ['V = πr²h', 'V = 2πrh', 'V = πrh', 'V = ⅓πr²h'], correct: 0, explanation: 'Cylinder volume = πr²h (area of circular base × height). Option B is the lateral surface area formula. Option D is the volume of a cone.' },
  { id: 29, domain: 'D4', difficulty: 'Easy', question: 'Which correctly defines sin θ in a right triangle?', options: ['sin θ = adjacent / hypotenuse', 'sin θ = opposite / adjacent', 'sin θ = opposite / hypotenuse', 'sin θ = hypotenuse / opposite'], correct: 2, explanation: 'SOH: Sin = Opposite/Hypotenuse. Option A is cosine (CAH). Option B is tangent (TOA).' },
  { id: 30, domain: 'D4', difficulty: 'Easy', question: 'Which correctly defines cos θ in a right triangle?', options: ['cos θ = opposite / hypotenuse', 'cos θ = adjacent / hypotenuse', 'cos θ = adjacent / opposite', 'cos θ = hypotenuse / adjacent'], correct: 1, explanation: 'CAH: Cos = Adjacent/Hypotenuse. Option A is sine. Option C is the reciprocal of tangent.' },
  { id: 31, domain: 'D4', difficulty: 'Easy', question: 'Which correctly defines tan θ in a right triangle?', options: ['tan θ = opposite / adjacent', 'tan θ = adjacent / opposite', 'tan θ = opposite / hypotenuse', 'tan θ = hypotenuse / adjacent'], correct: 0, explanation: 'TOA: Tan = Opposite/Adjacent. Option B is cotangent. Option C is sine.' },
  { id: 32, domain: 'D4', difficulty: 'Medium', question: 'Which formula finds the volume of a sphere?', options: ['V = 4πr²', 'V = (4/3)πr²', 'V = ⅓πr³', 'V = (4/3)πr³'], correct: 3, explanation: 'Sphere volume = (4/3)πr³. Option A is surface area. Option B has r² instead of r³.' },
  { id: 33, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives arc length?', options: ['L = (θ/360) × 2πr', 'L = (θ/360) × πr²', 'L = θ × r²', 'L = 2πr / θ'], correct: 0, explanation: 'Arc length = fraction of circle × circumference = (θ/360) × 2πr. Option B uses the area formula instead of circumference.' },
  { id: 34, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives the area of a sector?', options: ['A = (θ/360) × 2πr', 'A = (θ/360) × πr²', 'A = θ × πr²', 'A = πr² / 2'], correct: 1, explanation: 'Sector area = fraction of circle × total area = (θ/360) × πr². Option A uses circumference instead of area.' },
  { id: 35, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives the sum of interior angles of a polygon?', options: ['S = n × 180°', 'S = (n-2) × 90°', 'S = (n-2) × 180°', 'S = 360° / n'], correct: 2, explanation: 'Interior angle sum = (n-2) × 180°. Option A overcounts by including exterior angles. Option D is for a single exterior angle.' },
  { id: 36, domain: 'D4', difficulty: 'Hard', question: 'Which is the Law of Cosines?', options: ['c² = a² + b² - 2ab·cosC', 'c² = a² + b² + 2ab·cosC', 'c² = a² - b² - 2ab·cosC', 'c = a + b - cosC'], correct: 0, explanation: 'Law of Cosines: c² = a² + b² - 2ab·cosC. Option B has + instead of - before 2ab·cosC. Option C incorrectly subtracts b².' },
  { id: 37, domain: 'D4', difficulty: 'Hard', question: 'Which is the Law of Sines?', options: ['sinA/a = sinB/b ≠ sinC/c', 'a×sinA = b×sinB = c×sinC', 'a/sinA = b/sinB = c/sinC', 'a/cosA = b/cosB'], correct: 2, explanation: 'Law of Sines: a/sinA = b/sinB = c/sinC. All three ratios are equal. Option B multiplies instead of divides.' },
  { id: 38, domain: 'D4', difficulty: 'Hard', question: 'Which formula gives the surface area of a sphere?', options: ['SA = (4/3)πr³', 'SA = 4πr²', 'SA = 2πr²', 'SA = πr²'], correct: 1, explanation: 'Sphere surface area = 4πr². Option A is volume. Option C is off by a factor of 2.' },
  // ── D4 GEOMETRY & TRIG (CONTINUED) ────────────────────────────────────────
  { id: 39, domain: 'D4', difficulty: 'Hard', question: 'Which is the correct formula for the area of a triangle given two sides and the included angle?', options: ['A = ½ab sin C', 'A = ab cos C', 'A = ½ab cos C', 'A = ½(a+b) sin C'], correct: 0, explanation: 'Area = ½ab sin C. This uses trigonometry to find the height (b sin C). Option B and C use cosine incorrectly. Option D uses addition.' },
  { id: 40, domain: 'D4', difficulty: 'Medium', question: 'Which formula finds the volume of a square pyramid?', options: ['V = Bh', 'V = ½Bh', 'V = ⅓Bh', 'V = ⅓πr²h'], correct: 2, explanation: 'Pyramid volume is ⅓ × Base area × height. Option A is for a prism. Option D is specifically for a cone (circular base).' },
  { id: 41, domain: 'D4', difficulty: 'Easy', question: 'Which formula gives the area of a trapezoid?', options: ['A = ½h(b₁ - b₂)', 'A = ½h(b₁ + b₂)', 'A = h(b₁ + b₂)', 'A = ½(b₁b₂)h'], correct: 1, explanation: 'Area = ½h(b₁ + b₂), which is the height times the average of the bases. Option A subtracts the bases. Option C forgets the ½.' },
  { id: 42, domain: 'D4', difficulty: 'Medium', question: 'What is the measure of each EXTERIOR angle of a regular n-sided polygon?', options: ['E = (n-2) × 180° / n', 'E = 180° / n', 'E = 360°', 'E = 360° / n'], correct: 3, explanation: 'Exterior angles always sum to 360°. For a regular polygon, divide by n. Option A is for an interior angle.' },
  { id: 43, domain: 'D4', difficulty: 'Hard', question: 'Which formula represents the standard equation of a circle?', options: ['(x-h)² + (y-k)² = r²', '(x-h)² + (y-k)² = r', '(x+h)² + (y+k)² = r²', '(x-h)² - (y-k)² = r²'], correct: 0, explanation: 'The standard form is (x-h)² + (y-k)² = r². Option B forgets to square the radius. Option D is the equation for a hyperbola.' },
  { id: 44, domain: 'D4', difficulty: 'Medium', question: 'Which is the correct formula for the lateral surface area of a cylinder?', options: ['LA = πr²h', 'LA = 2πrh', 'LA = 2πr² + 2πrh', 'LA = πrh'], correct: 1, explanation: 'Lateral area = Circumference × height = 2πrh. Option A is volume. Option C is the total surface area including the bases.' },
  { id: 45, domain: 'D4', difficulty: 'Hard', question: 'Which identity is known as the Pythagorean Identity?', options: ['sin θ + cos θ = 1', 'sin²θ - cos²θ = 1', 'tan²θ + 1 = sec²θ', 'sin θ / cos θ = tan θ'], correct: 2, explanation: 'tan²θ + 1 = sec²θ is a Pythagorean identity derived from sin²θ + cos²θ = 1. Option A is missing the squares.' },
  { id: 46, domain: 'D4', difficulty: 'Easy', question: 'Which formula finds the perimeter of a rectangle?', options: ['P = lw', 'P = l + w', 'P = 2(l + w)²', 'P = 2l + 2w'], correct: 3, explanation: 'Perimeter is the sum of all four sides: 2l + 2w. Option A is the formula for area. Option B only sums two sides.' },
  { id: 47, domain: 'D4', difficulty: 'Medium', question: 'Which formula finds the diagonal of a rectangular prism?', options: ['d = √(l² + w² + h²)', 'd = l + w + h', 'd = √(l² + w²)', 'd = l² + w² + h²'], correct: 0, explanation: 'The 3D distance formula/Pythagorean theorem is d = √(l² + w² + h²). Option C only works for a 2D rectangle.' },
  { id: 48, domain: 'D4', difficulty: 'Hard', question: 'What is the relationship between radians and degrees?', options: ['360° = π radians', '180° = π radians', '1° = π radians', '90° = π radians'], correct: 1, explanation: 'A semicircle is 180° or π radians. Therefore, 180° = π. Option A is incorrect because 360° = 2π.' },
  { id: 49, domain: 'D4', difficulty: 'Medium', question: 'Which formula gives the area of a rhombus?', options: ['d₁d₂', 'A = ½(d₁ + d₂)', 'A = ½d₁d₂', 'A = s²'], correct: 2, explanation: 'Area = ½ × product of the diagonals. Option A forgets the ½. Option D is only for a square.' },
  { id: 50, domain: 'D4', difficulty: 'Easy', question: 'What is the sum of the exterior angles of any convex polygon?', options: ['180°', '(n-2) × 180°', 'n × 360°', '360°'], correct: 3, explanation: 'Regardless of the number of sides, the exterior angles of any convex polygon always sum to 360°. Option B is for interior angles.' },
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
    saveGameResult(10, finalScore, xpEarned, 'math_d2', speedyCount, lives < 0 ? 0 : lives, Date.now());
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