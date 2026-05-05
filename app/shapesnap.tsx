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
  // ── EASY: Basic formulas ──────────────────────────────────────────────────
  { id: 1, domain: 'D4', difficulty: 'Easy', formula: 'A = πr²', question: 'A circle has a radius of 5. What is its area?', options: ['25π', '10π', '5π', '20π'], correct: 0, explanation: 'Area = π(5)² = 25π' },
  { id: 2, domain: 'D4', difficulty: 'Easy', formula: 'a² + b² = c²', question: 'A right triangle has legs of length 3 and 4. What is the hypotenuse?', options: ['6', '5', '7', '√7'], correct: 1, explanation: '3² + 4² = 25 → √25 = 5' },
  { id: 3, domain: 'D4', difficulty: 'Easy', formula: 'C = 2πr', question: 'A circle has a radius of 6. What is its circumference?', options: ['36π', '6π', '12π', '18π'], correct: 2, explanation: '2π(6) = 12π' },
  { id: 4, domain: 'D4', difficulty: 'Easy', formula: 'A = ½bh', question: 'A triangle has a base of 8 and height of 5. What is its area?', options: ['40', '13', '16', '20'], correct: 3, explanation: '½(8)(5) = 20' },
  { id: 5, domain: 'D4', difficulty: 'Easy', formula: 'Interior angles sum = (n-2)×180°', question: 'What is the sum of the interior angles of a hexagon?', options: ['720°', '540°', '900°', '360°'], correct: 0, explanation: '(6-2)×180 = 720°' },
  { id: 6, domain: 'D4', difficulty: 'Easy', formula: 'V = πr²h', question: 'A cylinder has radius 3 and height 4. What is its volume?', options: ['12π', '36π', '48π', '24π'], correct: 1, explanation: 'π(3)²(4) = 36π' },
  { id: 7, domain: 'D4', difficulty: 'Easy', formula: 'A = s²', question: 'A square has a side length of 7. What is its area?', options: ['28', '14', '49', '56'], correct: 2, explanation: '7² = 49' },
  { id: 8, domain: 'D4', difficulty: 'Easy', formula: 'sin θ = opp/hyp', question: 'Opposite side is 3 and hypotenuse is 5. What is sin θ?', options: ['4/5', '3/4', '5/3', '3/5'], correct: 3, explanation: '3/5' },
  { id: 9, domain: 'D4', difficulty: 'Easy', formula: 'A = lw', question: 'A rectangle has length 9 and width 4. What is its area?', options: ['36', '26', '13', '72'], correct: 0, explanation: '9 × 4 = 36' },
  { id: 10, domain: 'D4', difficulty: 'Easy', formula: 'Exterior angle = 360°/n', question: 'What is the measure of each exterior angle of a regular pentagon?', options: ['60°', '72°', '90°', '108°'], correct: 1, explanation: '360° ÷ 5 = 72°' },
  { id: 11, domain: 'D4', difficulty: 'Easy', formula: 'V = (4/3)πr³', question: 'A sphere has a radius of 3. What is its volume?', options: ['12π', '27π', '36π', '108π'], correct: 2, explanation: '(4/3)(27π) = 36π' },
  { id: 12, domain: 'D4', difficulty: 'Easy', formula: 'cos θ = adj/hyp', question: 'Adjacent side is 4 and hypotenuse is 5. What is cos θ?', options: ['3/5', '5/4', '4/3', '4/5'], correct: 3, explanation: '4/5' },
  { id: 13, domain: 'D4', difficulty: 'Easy', formula: 'P = 2l + 2w', question: 'Length 10 and width 4. What is perimeter?', options: ['28', '40', '14', '24'], correct: 0, explanation: '2(10)+2(4)=28' },
  { id: 14, domain: 'D4', difficulty: 'Easy', formula: '30-60-90: sides x, x√3, 2x', question: 'Shortest side is 4. What is hypotenuse?', options: ['4√3', '8', '6', '4√2'], correct: 1, explanation: '2×4=8' },
  { id: 15, domain: 'D4', difficulty: 'Easy', formula: '45-45-90: sides x, x, x√2', question: 'Each leg is 5. What is hypotenuse?', options: ['10', '25', '5√2', '5√3'], correct: 2, explanation: '5√2' },
  { id: 16, domain: 'D4', difficulty: 'Easy', formula: 'tan θ = opp/adj', question: 'Opposite = 3, adjacent = 3. What is tan θ?', options: ['√3', '√2', '1/√2', '1'], correct: 3, explanation: '3/3 = 1' },
  { id: 17, domain: 'D4', difficulty: 'Easy', formula: 'A = πr²', question: 'Diameter is 10. What is area?', options: ['25π', '100π', '50π', '10π'], correct: 0, explanation: 'r=5 → 25π' },

  // ── MEDIUM: Multi-step ────────────────────────────────────────────────────
  { id: 18, domain: 'D4', difficulty: 'Medium', formula: 'Arc length = (θ/360)×2πr', question: 'A circle has radius 9. What is the arc length of a 120° sector?', options: ['6π', '9π', '3π', '12π'], correct: 0, explanation: 'Arc length = (120/360) × 2π(9) = (1/3)(18π) = 6π' },
  { id: 19, domain: 'D4', difficulty: 'Medium', formula: 'Sector area = (θ/360)×πr²', question: 'A circle has radius 6. What is the area of a 90° sector?', options: ['36π', '9π', '12π', '6π'], correct: 1, explanation: 'Sector area = (90/360) × π(6)² = (1/4)(36π) = 9π' },
  { id: 20, domain: 'D4', difficulty: 'Medium', formula: 'V = (1/3)πr²h', question: 'A cone has radius 3 and height 4. What is its volume?', options: ['36π', '9π', '12π', '16π'], correct: 2, explanation: 'V = (1/3)πr²h = (1/3)π(9)(4) = 12π' },
  { id: 21, domain: 'D4', difficulty: 'Medium', formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)', question: 'What is the distance between points (1, 2) and (4, 6)?', options: ['4', '√7', '6', '5'], correct: 3, explanation: 'd = √((4-1)² + (6-2)²) = √(9+16) = √25 = 5' },
  { id: 22, domain: 'D4', difficulty: 'Medium', formula: 'Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)', question: 'What is the midpoint of the segment from (2, 4) to (8, 10)?', options: ['(5, 7)', '(3, 5)', '(6, 8)', '(4, 6)'], correct: 0, explanation: 'Midpoint = ((2+8)/2, (4+10)/2) = (10/2, 14/2) = (5, 7)' },
  { id: 23, domain: 'D4', difficulty: 'Medium', formula: 'SA = 2πr² + 2πrh', question: 'A cylinder has radius 2 and height 5. What is its total surface area?', options: ['20π', '28π', '14π', '24π'], correct: 1, explanation: 'SA = 2πr² + 2πrh = 2π(4) + 2π(2)(5) = 8π + 20π = 28π' },
  { id: 24, domain: 'D4', difficulty: 'Medium', formula: 'Interior angle = (n-2)×180/n', question: 'What is the measure of each interior angle of a regular octagon?', options: ['120°', '144°', '135°', '150°'], correct: 2, explanation: 'Interior angle = (8-2)×180/8 = 6×180/8 = 1080/8 = 135°' },
  { id: 25, domain: 'D4', difficulty: 'Medium', formula: 'a² + b² = c²', question: 'A ladder 13 feet long leans against a wall. The base is 5 feet from the wall. How high up the wall does it reach?', options: ['8', '10', '11', '12'], correct: 3, explanation: 'a² + 5² = 13², so a² = 169 - 25 = 144, a = 12 feet' },
  { id: 26, domain: 'D4', difficulty: 'Medium', formula: 'SA = 4πr²', question: 'A sphere has radius 4. What is its surface area?', options: ['64π', '32π', '16π', '256π'], correct: 0, explanation: 'SA = 4πr² = 4π(4)² = 4π(16) = 64π' },
  { id: 27, domain: 'D4', difficulty: 'Medium', formula: '30-60-90: sides x, x√3, 2x', question: 'In a 30-60-90 triangle, the hypotenuse is 10. What is the length of the side opposite 60°?', options: ['5', '5√3', '10√3', '5√2'], correct: 1, explanation: 'Hypotenuse = 2x = 10, so x = 5. Side opposite 60° = x√3 = 5√3' },
  { id: 28, domain: 'D4', difficulty: 'Medium', formula: 'A = ½d₁d₂', question: 'A rhombus has diagonals of length 8 and 6. What is its area?', options: ['48', '12', '24', '36'], correct: 2, explanation: 'Area of rhombus = ½d₁d₂ = ½(8)(6) = 24' },
  { id: 29, domain: 'D4', difficulty: 'Medium', formula: 'V = lwh', question: 'A rectangular prism has length 5, width 3, and height 4. What is its volume?', options: ['47', '24', '120', '60'], correct: 3, explanation: 'V = lwh = 5 × 3 × 4 = 60' },
  { id: 30, domain: 'D4', difficulty: 'Medium', formula: 'tan θ = opp/adj', question: 'A ramp makes an angle with the ground. The ramp rises 6 feet over a horizontal distance of 6 feet. What angle does it make?', options: ['45°', '30°', '60°', '90°'], correct: 0, explanation: 'tan θ = 6/6 = 1, so θ = arctan(1) = 45°' },
  { id: 31, domain: 'D4', difficulty: 'Medium', formula: 'Arc length = (θ/360)×2πr', question: 'A sector has a central angle of 60° and radius 12. What is its arc length?', options: ['6π', '4π', '2π', '8π'], correct: 1, explanation: 'Arc length = (60/360) × 2π(12) = (1/6)(24π) = 4π' },
  { id: 32, domain: 'D4', difficulty: 'Medium', formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)', question: 'What is the distance between points (-3, 1) and (3, 9)?', options: ['8', '√52', '10', '12'], correct: 2, explanation: 'd = √((3-(-3))² + (9-1)²) = √(36+64) = √100 = 10' },
  { id: 33, domain: 'D4', difficulty: 'Medium', formula: 'V = (1/3)Bh', question: 'A square pyramid has a base side of 6 and height 4. What is its volume?', options: ['72', '24', '96', '48'], correct: 3, explanation: 'V = (1/3)Bh = (1/3)(36)(4) = 48' },
  // ── HARD: Combined concepts ───────────────────────────────────────────────
  { id: 34, domain: 'D4', difficulty: 'Hard', formula: 'sin²θ + cos²θ = 1', question: 'If sin θ = 3/5 and θ is acute, what is cos θ?', options: ['4/5', '3/4', '5/4', '1/5'], correct: 0, explanation: 'Using sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1, 9/25 + cos²θ = 1, cos²θ = 16/25, cos θ = 4/5' },
  { id: 35, domain: 'D4', difficulty: 'Hard', formula: 'Sector area = (θ/360)×πr²', question: 'A circle has area 36π. A sector has central angle 120°. What is the sector area?', options: ['9π', '12π', '18π', '6π'], correct: 1, explanation: 'Circle area = 36π, so r² = 36. Sector = (120/360) × 36π = (1/3)(36π) = 12π' },
  { id: 36, domain: 'D4', difficulty: 'Hard', formula: 'a² = b² + c² - 2bc·cosA', question: 'A triangle has sides b = 5, c = 7, and angle A = 60°. What is the length of side a?', options: ['√49', '√25', '√39', '√61'], correct: 2, explanation: 'a² = 5² + 7² - 2(5)(7)cos60° = 25 + 49 - 70(0.5) = 74 - 35 = 39, so a = √39' },
  { id: 37, domain: 'D4', difficulty: 'Hard', formula: 'SA = πr² + πrl', question: 'A cone has radius 3 and slant height 5. What is its total surface area?', options: ['15π', '18π', '30π', '24π'], correct: 3, explanation: 'SA = πr² + πrl = π(9) + π(3)(5) = 9π + 15π = 24π' },
  { id: 38, domain: 'D4', difficulty: 'Hard', formula: 'a/sinA = b/sinB', question: 'In a triangle, angle A = 30°, angle B = 45°, and side a = 4. What is side b?', options: ['4√2', '2√2', '4√3', '8'], correct: 0, explanation: 'b/sin45° = 4/sin30°, b/(√2/2) = 4/(1/2) = 8, b = 8 × (√2/2) = 4√2' },
  { id: 39, domain: 'D4', difficulty: 'Hard', formula: 'Distance formula + midpoint', question: 'A circle has center (2, 3) and passes through (6, 6). What is its radius?', options: ['4', '5', '√34', '6'], correct: 1, explanation: 'r = distance from center to point = √((6-2)² + (6-3)²) = √(16+9) = √25 = 5' },
  { id: 40, domain: 'D4', difficulty: 'Hard', formula: 'V = (4/3)πr³', question: 'A sphere\'s volume is 288π. What is its radius?', options: ['4', '8', '6', '3'], correct: 2, explanation: '(4/3)πr³ = 288π, r³ = 288×(3/4) = 216, r = ∛216 = 6' },
  { id: 41, domain: 'D4', difficulty: 'Hard', formula: 'tan θ = opp/adj', question: 'A 10-foot flagpole casts a shadow. The angle of elevation to the top is 60°. How long is the shadow?', options: ['10√3', '5√3', '10', '10√3/3'], correct: 3, explanation: 'tan60° = 10/shadow, √3 = 10/shadow, shadow = 10/√3 = 10√3/3' },
  { id: 42, domain: 'D4', difficulty: 'Hard', formula: 'Inscribed angle = ½ central angle', question: 'An inscribed angle in a circle intercepts an arc of 140°. What is the measure of the inscribed angle?', options: ['70°', '140°', '35°', '280°'], correct: 0, explanation: 'Inscribed angle = ½ × intercepted arc = ½ × 140° = 70°' },
  { id: 43, domain: 'D4', difficulty: 'Hard', formula: '30-60-90 + area', question: 'An equilateral triangle has side length 8. What is its area?', options: ['32√3', '16√3', '8√3', '64√3'], correct: 1, explanation: 'Height = 8×(√3/2) = 4√3. Area = ½ × base × height = ½ × 8 × 4√3 = 16√3' },
  { id: 44, domain: 'D4', difficulty: 'Hard', formula: 'SA = 2lw + 2lh + 2wh', question: 'A rectangular prism has length 4, width 3, height 5. What is its surface area?', options: ['60', '47', '94', '120'], correct: 2, explanation: 'SA = 2(4)(3) + 2(4)(5) + 2(3)(5) = 24 + 40 + 30 = 94' },
  { id: 45, domain: 'D4', difficulty: 'Hard', formula: 'cosine rule + area', question: 'In triangle ABC, a = 6, b = 8, C = 90°. What is the area of the triangle?', options: ['48', '12', '36', '24'], correct: 3, explanation: 'Since C = 90°, the legs are 6 and 8. Area = ½(6)(8) = 24' },
  { id: 46, domain: 'D4', difficulty: 'Hard', formula: 'Circle equation: (x-h)² + (y-k)² = r²', question: 'A circle has equation (x-2)² + (y+3)² = 16. What is its radius?', options: ['4', '16', '2', '8'], correct: 0, explanation: 'The equation is in standard form (x-h)² + (y-k)² = r². Here r² = 16, so r = 4.' },
  { id: 47, domain: 'D4', difficulty: 'Hard', formula: 'sin A/a = sin B/b', question: 'In triangle ABC, angle B = 60°, b = 6√3, and a = 6. What is angle A?', options: ['45°', '30°', '60°', '90°'], correct: 1, explanation: 'sinA/6 = sin60°/(6√3) = (√3/2)/(6√3) = 1/12. sinA = 6/12 = 1/2, so A = 30°' },
  { id: 48, domain: 'D4', difficulty: 'Hard', formula: 'Sector + triangle area', question: 'A sector with radius 4 and central angle 90° is cut from a circle. What is the area of the remaining shape (the major sector)?', options: ['4π', '8π', '12π', '16π'], correct: 2, explanation: 'Full circle area = 16π. Minor sector area = (90/360)×16π = 4π. Major sector = 16π - 4π = 12π' },
  { id: 49, domain: 'D4', difficulty: 'Hard', formula: 'Heron\'s formula', question: 'A triangle has sides 5, 12, and 13. What is its area?', options: ['60', '26', '65', '30'], correct: 3, explanation: 'Since 5² + 12² = 25 + 144 = 169 = 13², this is a right triangle. Area = ½(5)(12) = 30' },
  { id: 50, domain: 'D4', difficulty: 'Hard', formula: 'V cylinder - V cone', question: 'A cylinder has radius 3 and height 8. A cone with same radius and height is removed from inside. What is the remaining volume?', options: ['48π', '72π', '24π', '96π'], correct: 0, explanation: 'V_cylinder = π(9)(8) = 72π. V_cone = (1/3)π(9)(8) = 24π. Remaining = 72π - 24π = 48π' },
];

const TIMER_DURATION = 45;

export default function ShapeSnapScreen() {
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
  const snapAnim = useRef(new Animated.Value(1)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  // Greek theme animations
  const pillar1Anim = useRef(new Animated.Value(0)).current;
  const pillar2Anim = useRef(new Animated.Value(0)).current;
  const shape1Rot = useRef(new Animated.Value(0)).current;
  const shape2Rot = useRef(new Animated.Value(0)).current;
  const shape3Rot = useRef(new Animated.Value(0)).current;
  const shape1Y = useRef(new Animated.Value(0)).current;
  const shape2Y = useRef(new Animated.Value(0)).current;
  const shape3Y = useRef(new Animated.Value(0)).current;
  const formulaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pillars sway gently
    Animated.loop(
      Animated.sequence([
        Animated.timing(pillar1Anim, { toValue: 3, duration: 3000, useNativeDriver: true }),
        Animated.timing(pillar1Anim, { toValue: -3, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pillar2Anim, { toValue: -4, duration: 2500, useNativeDriver: true }),
        Animated.timing(pillar2Anim, { toValue: 4, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // Floating shapes rotate
    Animated.loop(
      Animated.timing(shape1Rot, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(shape2Rot, { toValue: -1, duration: 10000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(shape3Rot, { toValue: 1, duration: 6000, useNativeDriver: true })
    ).start();

    // Shapes bob up/down
    Animated.loop(
      Animated.sequence([
        Animated.timing(shape1Y, { toValue: -12, duration: 2500, useNativeDriver: true }),
        Animated.timing(shape1Y, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shape2Y, { toValue: -10, duration: 3200, useNativeDriver: true }),
        Animated.timing(shape2Y, { toValue: 0, duration: 3200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shape3Y, { toValue: -14, duration: 2000, useNativeDriver: true }),
        Animated.timing(shape3Y, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Formula float animation on new question
  useEffect(() => {
    formulaAnim.setValue(0);
    Animated.spring(formulaAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
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
      // Snap animation
      Animated.sequence([
        Animated.spring(snapAnim, { toValue: 1.15, useNativeDriver: true, tension: 200, friction: 5 }),
        Animated.spring(snapAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 5 }),
      ]).start();
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
    }
    setAnswers(prev => [...prev, {
      question: q.question, formula: q.formula,
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
      setQuestionStartTime(Date.now());
    }, 1600);
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
    setQuestionStartTime(Date.now()); setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(9, finalScore, xpEarned, 'math_d4', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🏛️ Excellent!' : finalScore >= 40 ? '👍 Good Work!' : '💪 Keep Practicing!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 🧩</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <View style={styles.reviewFormulaBox}>
                <Text style={styles.reviewFormula}>📐 {a.formula}</Text>
              </View>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Shape Snap</Text>
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

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* GREEK BACKGROUND */}
        <View style={styles.greekBg} pointerEvents="none">
          {/* Grid lines */}
          <View style={styles.gridOverlay}>
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <View key={`h${i}`} style={[styles.gridLineH, { top: `${i * 14}%` as any }]} />
            ))}
            {[0,1,2,3,4,5,6,7].map(i => (
              <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 16}%` as any }]} />
            ))}
          </View>

          {/* Left pillar */}
          <Animated.View style={[styles.pillarLeft, { transform: [{ translateX: pillar1Anim }] }]}>
            <Text style={styles.pillarCap}>🏛️</Text>
            <View style={styles.pillarShaft}>
              {[0,1,2,3,4].map(i => <View key={i} style={styles.pillarSegment} />)}
            </View>
            <View style={styles.pillarBase} />
          </Animated.View>

          {/* Right pillar */}
          <Animated.View style={[styles.pillarRight, { transform: [{ translateX: pillar2Anim }] }]}>
            <Text style={styles.pillarCap}>🏛️</Text>
            <View style={styles.pillarShaft}>
              {[0,1,2,3,4].map(i => <View key={i} style={styles.pillarSegment} />)}
            </View>
            <View style={styles.pillarBase} />
          </Animated.View>

          {/* Floating geometric shapes */}
          <Animated.Text style={[styles.floatShape1, {
            transform: [
              { translateY: shape1Y },
              { rotate: shape1Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
            ]
          }]}>△</Animated.Text>

          <Animated.Text style={[styles.floatShape2, {
            transform: [
              { translateY: shape2Y },
              { rotate: shape2Rot.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] }) }
            ]
          }]}>◯</Animated.Text>

          <Animated.Text style={[styles.floatShape3, {
            transform: [
              { translateY: shape3Y },
              { rotate: shape3Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
            ]
          }]}>⬡</Animated.Text>

          {/* Decorative elements */}
          <Text style={styles.protractor}>📐</Text>
          <Text style={styles.compass}>🧭</Text>
          <Text style={styles.scroll}>📜</Text>

          {/* Bottom frieze */}
          <View style={styles.friezeBar} />
          <Text style={styles.frieze1}>⊿</Text>
          <Text style={styles.frieze2}>○</Text>
          <Text style={styles.frieze3}>□</Text>
          <Text style={styles.frieze4}>⊿</Text>
          <Text style={styles.frieze5}>○</Text>
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>🧩 Shape Snap</Text>
            <Text style={styles.gameSubtitle}>D4 · Geometry & Trig</Text>
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

          {/* FORMULA STRIP */}
          <Animated.View style={[styles.formulaStrip, {
            opacity: formulaAnim,
            transform: [{ translateY: formulaAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }]
          }]}>
            <Text style={styles.formulaLabel}>📐 FORMULA</Text>
            <Text style={styles.formulaText}>{q.formula}</Text>
          </Animated.View>

          {/* DOMAIN BADGE */}
          <View style={styles.domainRow}>
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>🏛️ {q.domain} · {q.difficulty}</Text>
            </View>
          </View>

          {/* QUESTION */}
          <Animated.View style={[styles.questionBox, { transform: [{ scale: snapAnim }] }]}>
            <Text style={styles.questionText}>{q.question}</Text>
          </Animated.View>

          {/* ANSWER PILLS */}
          <View style={styles.optionsGrid}>
            {q.options.map((option, index) => {
              let bgColor = '#0D2137';
              let borderColor = '#1E3A5F';
              let textColor = '#FFFFFF';
              let letterBg = '#162840';
              if (answered) {
                if (index === q.correct) {
                  bgColor = '#10B98125'; borderColor = '#10B981'; textColor = '#10B981'; letterBg = '#10B981';
                } else if (index === selectedAnswer) {
                  bgColor = '#EF444425'; borderColor = '#EF4444'; textColor = '#EF4444'; letterBg = '#EF4444';
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
                  <View style={[styles.optionLetterBox, { backgroundColor: letterBg }]}>
                    <Text style={styles.optionLetter}>{['A', 'B', 'C', 'D'][index]}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
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
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#0A1628' },

  // Greek background
  greekBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 0,
  },
  gridOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#0F2848' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#0F2848' },

  // Pillars
  pillarLeft: { position: 'absolute', left: -8, top: 80, alignItems: 'center' },
  pillarRight: { position: 'absolute', right: -8, top: 80, alignItems: 'center' },
  pillarCap: { fontSize: 32, opacity: 0.6 },
  pillarShaft: { width: 24, gap: 2, marginVertical: 4 },
  pillarSegment: {
    height: 28, width: 24, backgroundColor: '#1E3A5F',
    borderRadius: 2, borderWidth: 1, borderColor: '#2A4A6F',
  },
  pillarBase: {
    width: 32, height: 10, backgroundColor: '#1E3A5F',
    borderRadius: 2, borderWidth: 1, borderColor: '#2A4A6F',
  },

  // Floating shapes
  floatShape1: {
    position: 'absolute', top: '15%', left: '8%',
    fontSize: 36, color: '#0EA5E940', fontWeight: '100',
  },
  floatShape2: {
    position: 'absolute', top: '20%', right: '8%',
    fontSize: 34, color: '#F59E0B30', fontWeight: '100',
  },
  floatShape3: {
    position: 'absolute', top: '55%', left: '5%',
    fontSize: 30, color: '#0EA5E930', fontWeight: '100',
  },

  // Decorative
  protractor: { position: 'absolute', bottom: 100, right: '8%', fontSize: 30, opacity: 0.5 },
  compass: { position: 'absolute', bottom: 100, left: '8%', fontSize: 28, opacity: 0.5 },
  scroll: { position: 'absolute', top: '45%', right: '6%', fontSize: 24, opacity: 0.4 },

  // Frieze
  friezeBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 60, backgroundColor: '#0D2137',
    borderTopWidth: 2, borderTopColor: '#1E3A5F',
  },
  frieze1: { position: 'absolute', bottom: 16, left: '8%', fontSize: 22, color: '#0EA5E960' },
  frieze2: { position: 'absolute', bottom: 16, left: '25%', fontSize: 20, color: '#F59E0B60' },
  frieze3: { position: 'absolute', bottom: 16, left: '47%', fontSize: 20, color: '#0EA5E960' },
  frieze4: { position: 'absolute', bottom: 16, right: '25%', fontSize: 22, color: '#F59E0B60' },
  frieze5: { position: 'absolute', bottom: 16, right: '8%', fontSize: 20, color: '#0EA5E960' },

  // Header
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20, gap: 12, zIndex: 10,
  },
  pauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0D2137', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#0EA5E9',
  },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#0EA5E9', fontWeight: '700' },
  scoreBox: {
    backgroundColor: '#F9731620', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#F97316',
  },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F97316' },
  scoreLabel: { fontSize: 10, color: '#F97316', fontWeight: '600' },
  floatingScore: {
    position: 'absolute', right: 24, top: 110,
    fontSize: 24, fontWeight: '900', color: '#10B981', zIndex: 100,
  },

  // Status
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10,
    backgroundColor: '#0D2137CC', borderRadius: 16, padding: 12, zIndex: 10,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#1E3A5F', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: {
    backgroundColor: '#0EA5E920', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: '#0EA5E9',
  },
  qCounter: { fontSize: 14, color: '#0EA5E9', fontWeight: '800' },

  // Game scroll
  gameScroll: { flex: 1, paddingHorizontal: 20, zIndex: 10 },

  // Formula strip
  formulaStrip: {
    backgroundColor: '#F59E0B15', borderRadius: 14,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#F59E0B40',
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  formulaLabel: { fontSize: 10, color: '#F59E0B', fontWeight: '800', letterSpacing: 1 },
  formulaText: { fontSize: 16, color: '#F59E0B', fontWeight: '800', flex: 1 },

  // Domain
  domainRow: { marginBottom: 8 },
  domainBadge: {
    backgroundColor: '#0EA5E920', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: '#0EA5E940',
  },
  domainText: { fontSize: 12, color: '#0EA5E9', fontWeight: '700' },

  // Question
  questionBox: {
    backgroundColor: '#0D2137', borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E3A5F',
  },
  questionText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', lineHeight: 28 },

  // Options
  optionsGrid: { gap: 12, paddingBottom: 100 },
  optionPill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 50, padding: 16, borderWidth: 2, gap: 14,
  },
  optionLetterBox: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', lineHeight: 22 },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: {
    backgroundColor: '#0D2137', borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
  },
  reviewFormulaBox: {
    backgroundColor: '#F59E0B15', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8,
    alignSelf: 'flex-start',
  },
  reviewFormula: { fontSize: 12, color: '#F59E0B', fontWeight: '700' },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: {
    backgroundColor: '#0D2137', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E3A5F',
  },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: {
    flex: 1, backgroundColor: '#0A1628',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#0EA5E9' },
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
    backgroundColor: '#0D2137', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E3A5F',
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#0EA5E9', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#0EA5E9', borderRadius: 50,
    padding: 18, alignItems: 'center', marginVertical: 20,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: {
    backgroundColor: 'transparent', borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 30,
    borderWidth: 2, borderColor: '#1E3A5F',
  },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },

  // Pause
  pauseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  pauseCard: {
    backgroundColor: '#0D2137', borderRadius: 24,
    padding: 32, width: '82%', alignItems: 'center',
    borderWidth: 1, borderColor: '#0EA5E9',
  },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: {
    width: '100%', padding: 16, borderRadius: 50,
    backgroundColor: '#0EA5E9', alignItems: 'center', marginBottom: 12,
  },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});