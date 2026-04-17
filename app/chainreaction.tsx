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

// ─── CHAIN BANK (10 chains shown, each 5 parts) ──────────────────────────────
const CHAINS = [
  // ── CHAIN 1: Basic Fractions ──────────────────────────────────────────────
  {
    id: 1, title: 'Fraction Fundamentals', domain: 'D2', difficulty: 'Easy',
    parts: [
      { story: 'Simplify: 12/18', options: ['2/4', '2/3', '3/4', '4/6'], correct: 1, explanation: 'GCD(12,18)=6. 12÷6=2, 18÷6=3. Answer: 2/3.' },
      { story: 'Add: 1/3 + 1/4 = ?', options: ['2/7', '7/12', '5/12', '2/12'], correct: 1, explanation: 'LCD=12. 4/12+3/12 = 7/12.' },
      { story: 'Subtract: 3/4 − 2/5 = ?', options: ['1/20', '7/20', '5/9', '1/9'], correct: 1, explanation: 'LCD=20. 15/20−8/20 = 7/20.' },
      { story: 'Multiply: (2/3) × (9/4) = ?', options: ['18/12', '3/2', '11/12', '6/7'], correct: 1, explanation: '(2×9)/(3×4) = 18/12 = 3/2.' },
      { story: 'Divide: (5/6) ÷ (5/3) = ?', options: ['25/18', '1/2', '10/9', '3/6'], correct: 1, explanation: 'Flip second: (5/6)×(3/5) = 15/30 = 1/2.' },
    ],
  },

  // ── CHAIN 2: Factoring ────────────────────────────────────────────────────
  {
    id: 2, title: 'Factoring Chain', domain: 'D2', difficulty: 'Easy',
    parts: [
      { story: 'Factor: x² + 5x + 6', options: ['(x+1)(x+6)', '(x+2)(x+3)', '(x−2)(x−3)', '(x+3)(x+2)'], correct: 1, explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3.' },
      { story: 'Factor: x² − 9', options: ['(x−3)²', '(x+9)(x−1)', '(x+3)(x−3)', '(x−9)(x+1)'], correct: 2, explanation: 'Difference of squares: a²−b² = (a+b)(a−b).' },
      { story: 'Factor: 2x² + 7x + 3', options: ['(2x+1)(x+3)', '(2x−1)(x−3)', '(x+3)(2x+1)', '(2x+3)(x+1)'], correct: 0, explanation: 'AC method: 2×3=6. Find 6 and 1: (2x+1)(x+3).' },
      { story: 'Factor: x³ − 8', options: ['(x−2)³', '(x+2)(x²−2x+4)', '(x−2)(x²+2x+4)', '(x−2)(x+2)²'], correct: 2, explanation: 'Difference of cubes: a³−b³=(a−b)(a²+ab+b²). a=x, b=2.' },
      { story: 'Factor completely: 3x² − 12', options: ['3(x²−4)', '3(x−2)(x+2)', '(3x+6)(x−2)', '3(x−2)²'], correct: 1, explanation: 'Factor out 3: 3(x²−4). Then difference of squares: 3(x−2)(x+2).' },
    ],
  },

  // ── CHAIN 3: Exponent Rules ───────────────────────────────────────────────
  {
    id: 3, title: 'Exponent Rules', domain: 'D2', difficulty: 'Easy',
    parts: [
      { story: 'Simplify: x³ · x⁴', options: ['x⁷', 'x¹²', 'x³⁴', 'x'], correct: 0, explanation: 'Multiply same base: add exponents. x^(3+4) = x⁷.' },
      { story: 'Simplify: (x²)³', options: ['x⁵', 'x⁶', 'x⁸', '3x²'], correct: 1, explanation: 'Power of power: multiply exponents. x^(2×3) = x⁶.' },
      { story: 'Simplify: x⁵/x²', options: ['x³', 'x⁷', 'x¹⁰', '1/x³'], correct: 0, explanation: 'Divide same base: subtract exponents. x^(5−2) = x³.' },
      { story: 'Simplify: (2x²y³)²', options: ['2x⁴y⁶', '4x⁴y⁶', '4x²y³', '2x⁴y⁵'], correct: 1, explanation: 'Square each factor: 2²=4, (x²)²=x⁴, (y³)²=y⁶.' },
      { story: 'Simplify: (x⁻²)⁻³', options: ['x⁻⁶', 'x⁶', 'x⁻⁵', '1/x⁶'], correct: 1, explanation: 'Multiply exponents: (−2)(−3) = 6. Answer: x⁶.' },
    ],
  },

  // ── CHAIN 4: Logarithms ───────────────────────────────────────────────────
  {
    id: 4, title: 'Logarithm Laws', domain: 'D2', difficulty: 'Medium',
    parts: [
      { story: 'Evaluate: log₂(8)', options: ['4', '2', '3', '8'], correct: 2, explanation: '2³=8, so log₂(8)=3.' },
      { story: 'Simplify: log(2) + log(5)', options: ['log(7)', 'log(10)', '1', 'log(3)'], correct: 2, explanation: 'log(a)+log(b)=log(ab). log(10)=1.' },
      { story: 'Simplify: log(100) − log(10)', options: ['log(90)', '0', '10', '1'], correct: 3, explanation: 'log(a)−log(b)=log(a/b). log(10)=1.' },
      { story: 'Simplify: 3·log₂(4)', options: ['6', '12', '3', '8'], correct: 0, explanation: 'n·log(a)=log(aⁿ). log₂(4³)=log₂(64)=6.' },
      { story: 'Solve: log₃(x) = 4', options: ['12', '64', '81', '34'], correct: 2, explanation: 'x = 3⁴ = 81.' },
    ],
  },

  // ── CHAIN 5: Trig Values ──────────────────────────────────────────────────
  {
    id: 5, title: 'Trig Chain', domain: 'D2', difficulty: 'Medium',
    parts: [
      { story: 'sin(135°) = ?', options: ['√3/2', '−√2/2', '√2/2', '1/2'], correct: 2, explanation: '135°=180°−45°. sin(135°)=sin(45°)=√2/2.' },
      { story: 'cos(135°) = ?', options: ['√2/2', '−1/2', '√3/2', '−√2/2'], correct: 3, explanation: 'In Q2 cos is negative: −cos(45°)=−√2/2.' },
      { story: 'tan(135°) = sin/cos = ?', options: ['1', '−√3', '√3', '−1'], correct: 3, explanation: '(√2/2)/(−√2/2) = −1.' },
      { story: 'Reference angle of 225°?', options: ['135°', '90°', '30°', '45°'], correct: 3, explanation: '225°−180°=45°.' },
      { story: 'sin(225°) = ?', options: ['√2/2', '−1/2', '1/2', '−√2/2'], correct: 3, explanation: 'Q3: sin negative. ref angle 45°. −√2/2.' },
    ],
  },

  // ── CHAIN 6: Probability Story ────────────────────────────────────────────
  {
    id: 6, title: 'Probability Story', domain: 'D3', difficulty: 'Medium',
    parts: [
      { story: 'Class: 12 girls, 8 boys. P(first pick is girl)?', options: ['2/5', '3/5', '1/2', '12/20'], correct: 1, explanation: '12/20 = 3/5.' },
      { story: 'Given first was a girl (no replace). P(second is girl)?', options: ['12/19', '11/20', '3/5', '11/19'], correct: 3, explanation: '11 girls left from 19 students.' },
      { story: 'P(both students are girls) = ?', options: ['11/38', '1/3', '33/95', '3/5'], correct: 2, explanation: '(12/20)×(11/19) = 132/380 = 33/95.' },
      { story: 'P(at least one boy selected) = ?', options: ['33/95', '57/95', '1/2', '62/95'], correct: 3, explanation: '1 − P(both girls) = 1 − 33/95 = 62/95.' },
      { story: 'Done 3 independent times. P(all 3 selections both girls)?', options: ['33/285', '(62/95)³', '1/27', '(33/95)³'], correct: 3, explanation: 'Independent: multiply. (33/95)³.' },
    ],
  },

  // ── CHAIN 7: Polynomial Roots ─────────────────────────────────────────────
  {
    id: 7, title: 'Polynomial Roots', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'p(x)=x³−6x²+11x−6. Test x=1: p(1)=?', options: ['2', '−2', '1', '0'], correct: 3, explanation: '1−6+11−6=0. So (x−1) is a factor.' },
      { story: 'Divide x³−6x²+11x−6 by (x−1). Quotient?', options: ['x²+5x+6', 'x²−5x−6', 'x²+5x−6', 'x²−5x+6'], correct: 3, explanation: 'Synthetic division gives x²−5x+6.' },
      { story: 'Factor x²−5x+6', options: ['(x+2)(x+3)', '(x−2)(x+3)', '(x+2)(x−3)', '(x−2)(x−3)'], correct: 3, explanation: 'Find: multiply 6, add −5 → −2 and −3.' },
      { story: 'All roots of x³−6x²+11x−6?', options: ['1,−2,−3', '−1,2,3', '1,−2,3', '1,2,3'], correct: 3, explanation: '(x−1)(x−2)(x−3)=0 → x=1,2,3.' },
      { story: 'Sum of all roots = ?', options: ['−6', '7', '5', '6'], correct: 3, explanation: '1+2+3=6. Or sum=−b/a=6.' },
    ],
  },

  // ── CHAIN 8: Derivatives ──────────────────────────────────────────────────
  {
    id: 8, title: 'Derivative Chain', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'f(x)=x³−3x²+2. Find f\'(x)=?', options: ['3x²+6x', 'x²−6x', '3x−6', '3x²−6x'], correct: 3, explanation: 'Power rule: 3x²−6x.' },
      { story: 'Set f\'(x)=0. Factor 3x²−6x=0', options: ['(3x−1)(x−2)=0', '3x(x+2)=0', 'x(3x−6)=0', '3x(x−2)=0'], correct: 3, explanation: 'Factor out 3x: 3x(x−2)=0.' },
      { story: 'Critical points are x = ?', options: ['0 and −2', '1 and 2', '0 and 3', '0 and 2'], correct: 3, explanation: '3x=0→x=0; x−2=0→x=2.' },
      { story: 'f\'\'(x) = ?', options: ['6x+6', '3x−6', '6x', '6x−6'], correct: 3, explanation: 'Derivative of 3x²−6x = 6x−6.' },
      { story: 'f\'\'(0)=−6<0. x=0 is a local ___?', options: ['inflection', 'undefined', 'minimum', 'maximum'], correct: 3, explanation: 'f\'\'(0)<0 means concave down → local maximum.' },
    ],
  },

  // ── CHAIN 9: Combinations ─────────────────────────────────────────────────
  {
    id: 9, title: 'Combinations & Permutations', domain: 'D3', difficulty: 'Medium',
    parts: [
      { story: '8 students compete for 1st, 2nd, 3rd. Arrangements?', options: ['56', '512', '24', '336'], correct: 3, explanation: 'P(8,3)=8×7×6=336.' },
      { story: 'Same 8, choose 3 for committee (order irrelevant)?', options: ['336', '112', '24', '56'], correct: 3, explanation: 'C(8,3)=336/6=56.' },
      { story: 'From committee of 3, choose a president. Ways?', options: ['9', '1', '6', '3'], correct: 3, explanation: 'Any of 3 committee members can be president.' },
      { story: 'Total ways: pick committee AND president?', options: ['112', '336', '56', '168'], correct: 3, explanation: '56×3=168.' },
      { story: 'P(Alex is on committee AND is president)?', options: ['3/168', '1/56', '1/8', '1/168'], correct: 3, explanation: 'Only 1 favorable outcome out of 168.' },
    ],
  },

  // ── CHAIN 10: Limits ──────────────────────────────────────────────────────
  {
    id: 10, title: 'Limits Chain', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'lim(x→2) of (x²−4)/(x−2) = ?', options: ['2', '0', 'undefined', '4'], correct: 3, explanation: 'Factor: (x+2)(x−2)/(x−2)=x+2. At x=2: 4.' },
      { story: 'lim(x→0) of sin(x)/x = ?', options: ['∞', '0', 'undefined', '1'], correct: 3, explanation: 'Famous limit. Always equals 1.' },
      { story: 'lim(x→∞) of (3x²+2x)/(x²−5) = ?', options: ['2', '∞', '0', '3'], correct: 3, explanation: 'Leading coefficients: 3/1=3.' },
      { story: 'Vertical asymptote of f(x)=1/(x²−4)?', options: ['x=4', 'x=−2', 'x=2', 'x=±2'], correct: 3, explanation: 'x²−4=0 → x=±2.' },
      { story: 'Horizontal asymptote of f(x)=3x/(x²+1)?', options: ['none', 'y=1', 'y=3', 'y=0'], correct: 3, explanation: 'Degree denom > numerator → y=0.' },
    ],
  },

  // ── CHAIN 11: Partial Fractions ───────────────────────────────────────────
  {
    id: 11, title: 'Partial Fractions', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'Decompose: 1/[(x+1)(x−1)]. Form?', options: ['A/(x+1)+B/(x+1)', 'A/x+B/(x²−1)', 'Ax+B/(x²−1)', 'A/(x+1)+B/(x−1)'], correct: 3, explanation: 'Distinct linear factors: A/(x+1)+B/(x−1).' },
      { story: 'Multiply both sides by (x+1)(x−1): 1=A(x−1)+B(x+1). Set x=1: B=?', options: ['1', '−1', '1/2', '2'], correct: 2, explanation: '1=A(0)+B(2) → B=1/2.' },
      { story: 'Set x=−1 to find A: A=?', options: ['1', '1/2', '−1/2', '2'], correct: 2, explanation: '1=A(−2)+0 → A=−1/2.' },
      { story: 'Full partial fraction decomposition?', options: ['1/(x+1)+1/(x−1)', '−1/2/(x+1)+1/2/(x−1)', '1/2/(x+1)+1/2/(x−1)', '1/2/(x+1)−1/2/(x−1)'], correct: 1, explanation: '−1/[2(x+1)] + 1/[2(x−1)].' },
      { story: '∫[1/(x²−1)]dx using decomposition = ?', options: ['ln|x+1|−ln|x−1|+C', '(1/2)ln|(x−1)/(x+1)|+C', '(1/2)ln|(x+1)/(x−1)|+C', 'ln|x²−1|+C'], correct: 1, explanation: 'Integrate each part: (1/2)ln|x−1|−(1/2)ln|x+1|.' },
    ],
  },

  // ── CHAIN 12: Integration ─────────────────────────────────────────────────
  {
    id: 12, title: 'Integration Basics', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: '∫x³ dx = ?', options: ['3x²+C', 'x²/2+C', 'x⁴+C', 'x⁴/4+C'], correct: 3, explanation: 'Power rule: xⁿ⁺¹/(n+1)+C = x⁴/4+C.' },
      { story: '∫(2x+3) dx = ?', options: ['2+C', 'x²+3+C', 'x²+3x+C', '2x²+3x+C'], correct: 2, explanation: 'Integrate term by term: x²+3x+C.' },
      { story: '∫eˣ dx = ?', options: ['eˣ/x+C', 'xeˣ+C', '1/eˣ+C', 'eˣ+C'], correct: 3, explanation: 'eˣ is its own antiderivative.' },
      { story: '∫(1/x) dx = ?', options: ['−1/x²+C', '1/x²+C', 'x⁰+C', 'ln|x|+C'], correct: 3, explanation: '∫(1/x)dx = ln|x|+C.' },
      { story: '∫₀² x² dx = ?', options: ['4', '2', '8/3', '4/3'], correct: 2, explanation: '[x³/3]₀² = 8/3−0 = 8/3.' },
    ],
  },

  // ── CHAIN 13: Matrix Operations ───────────────────────────────────────────
  {
    id: 13, title: 'Matrix Chain', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'Matrix A=[1,2;3,4]. det(A)=?', options: ['14', '−14', '2', '−2'], correct: 3, explanation: 'det=[1×4−2×3]=4−6=−2.' },
      { story: 'Matrix A=[2,0;0,3]. Eigenvalues?', options: ['2 and 0', '0 and 3', '1 and 6', '2 and 3'], correct: 3, explanation: 'Diagonal matrix: eigenvalues are diagonal entries.' },
      { story: '[1,2;3,4]×[1;1] = ?', options: ['[1;7]', '[3;7]', '[2;4]', '[3;3]'], correct: 1, explanation: 'Row1×col: 1+2=3. Row2×col: 3+4=7. Result: [3;7].' },
      { story: 'Transpose of [1,2;3,4] = ?', options: ['[1,3;2,4]', '[4,3;2,1]', '[1,2;3,4]', '[2,1;4,3]'], correct: 0, explanation: 'Transpose: rows become columns.' },
      { story: 'Rank of [1,2;2,4] = ?', options: ['2', '0', '4', '1'], correct: 3, explanation: 'Row 2 = 2×Row 1. Only 1 independent row. Rank=1.' },
    ],
  },

  // ── CHAIN 14: Expanding / Simplifying ────────────────────────────────────
  {
    id: 14, title: 'Expand & Simplify', domain: 'D1', difficulty: 'Easy',
    parts: [
      { story: 'Expand: (x+3)²', options: ['x²+9', 'x²+3x+9', '2x+6', 'x²+6x+9'], correct: 3, explanation: '(a+b)²=a²+2ab+b². x²+6x+9.' },
      { story: 'Expand: (2x−1)(x+4)', options: ['2x²+8x−4', '2x²+7x−4', '2x²−4x+4', '2x²+9x−4'], correct: 1, explanation: 'FOIL: 2x²+8x−x−4=2x²+7x−4.' },
      { story: 'Simplify: (x²+3x−4)/(x−1)', options: ['x−4', 'x+3', 'x+4', 'x−3'], correct: 2, explanation: 'Factor: (x+4)(x−1)/(x−1)=x+4.' },
      { story: 'Simplify: (3x²−12x)/(3x)', options: ['x−4', 'x²−4', '3x−4', 'x+4'], correct: 0, explanation: 'Factor out 3x: 3x(x−4)/3x = x−4.' },
      { story: 'Expand: (x+y+z)² has how many terms?', options: ['3', '4', '6', '9'], correct: 2, explanation: '6 terms: x²,y²,z²,2xy,2xz,2yz.' },
    ],
  },

  // ── CHAIN 15: Differential Equations ─────────────────────────────────────
  {
    id: 15, title: 'Diff. Equations', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'dy/dx = 2x. General solution y=?', options: ['2+C', '2x²+C', 'x+C', 'x²+C'], correct: 3, explanation: 'Integrate both sides: y=x²+C.' },
      { story: 'dy/dx = ky models? (k>0)', options: ['Linear decay', 'Quadratic growth', 'Exponential decay', 'Exponential growth'], correct: 3, explanation: 'Proportional to y → exponential growth.' },
      { story: 'Solution of dy/dx = ky is?', options: ['y=k+C', 'y=kx+C', 'y=Ceᵏˣ', 'y=Ce^x'], correct: 2, explanation: 'Separable ODE: y=Ce^(kx).' },
      { story: 'y\'\'−y=0. Characteristic roots?', options: ['r=0,1', 'r=±i', 'r=1,−1', 'r=0,−1'], correct: 2, explanation: 'r²=1 → r=±1.' },
      { story: 'General solution of y\'\'−y=0?', options: ['y=C₁sin(x)+C₂cos(x)', 'y=C₁x+C₂', 'y=C₁eˣ', 'y=C₁eˣ+C₂e⁻ˣ'], correct: 3, explanation: 'Real distinct roots: y=C₁e^x+C₂e^(-x).' },
    ],
  },

  // ── CHAIN 16: Coterminal Angles ───────────────────────────────────────────
  {
    id: 16, title: 'Coterminal Angles', domain: 'D2', difficulty: 'Medium',
    parts: [
      { story: '810° is coterminal with?', options: ['270°', '180°', '45°', '90°'], correct: 3, explanation: '810−2(360)=90°.' },
      { story: 'sin(810°) = sin(90°) = ?', options: ['0', '√2/2', '−1', '1'], correct: 3, explanation: 'sin(90°)=1.' },
      { story: '−π/6 radians in degrees?', options: ['60°', '−60°', '30°', '−30°'], correct: 3, explanation: '(−π/6)×(180/π)=−30°.' },
      { story: 'cos(−30°) = ?', options: ['−1/2', '1/2', '−√3/2', '√3/2'], correct: 3, explanation: 'cos is even: cos(−θ)=cos(θ). cos(30°)=√3/2.' },
      { story: 'Reference angle of −30°?', options: ['150°', '330°', '−30°', '30°'], correct: 3, explanation: 'Reference angle always positive: 30°.' },
    ],
  },

  // ── CHAIN 17: Graphs & Asymptotes ────────────────────────────────────────
  {
    id: 17, title: 'Graphs & Asymptotes', domain: 'D2', difficulty: 'Medium',
    parts: [
      { story: 'f(x)=1/(x−3). Vertical asymptote?', options: ['x=0', 'x=1', 'x=−3', 'x=3'], correct: 3, explanation: 'Set denominator=0: x−3=0 → x=3.' },
      { story: 'f(x)=(2x+1)/(x−3). Horizontal asymptote?', options: ['y=−1', 'y=0', 'y=3', 'y=2'], correct: 3, explanation: 'Same degree: ratio of leading coefficients=2/1=2.' },
      { story: 'f(x)=x²/(x+1). Oblique asymptote?', options: ['y=x+1', 'y=x−1', 'y=x', 'y=x²'], correct: 1, explanation: 'Poly divide: x²÷(x+1)=x−1 remainder. Oblique: y=x−1.' },
      { story: 'Which describes y=−x²+4?', options: ['Parabola up, vertex(0,4)', 'Line slope−1', 'Parabola down, vertex(0,4)', 'Parabola down, vertex(4,0)'], correct: 2, explanation: 'Negative leading coeff→opens down. Vertex at (0,4).' },
      { story: 'y=2sin(3x). Period = ?', options: ['3π', '2π/3', '6π', '2π'], correct: 1, explanation: 'Period = 2π/b = 2π/3.' },
    ],
  },

  // ── CHAIN 18: Partial Derivatives ─────────────────────────────────────────
  {
    id: 18, title: 'Partial Derivatives', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'f(x,y)=x²y+3xy². ∂f/∂x = ?', options: ['2xy+3y²', 'x²+6xy', '2x+3y', '2xy+3x'], correct: 0, explanation: 'Treat y as constant: 2xy+3y².' },
      { story: 'f(x,y)=x²y+3xy². ∂f/∂y = ?', options: ['x²+6y', 'x²+6xy', '2x+6xy', 'x²y+3x'], correct: 1, explanation: 'Treat x as constant: x²+6xy.' },
      { story: 'f(x,y)=eˣʸ. ∂f/∂x = ?', options: ['eˣʸ', 'yeˣ', 'xeˣʸ', 'yeˣʸ'], correct: 3, explanation: 'Chain rule: y·e^(xy).' },
      { story: 'Critical point requires?', options: ['∂f/∂x=0 only', '∂f/∂x=∂f/∂y', 'f=0', '∂f/∂x=0 AND ∂f/∂y=0'], correct: 3, explanation: 'Both partials must equal zero simultaneously.' },
      { story: 'f(x,y)=x²+y². ∇f = ?', options: ['[2x,2y]', '[x²,y²]', '[2,2]', '[x,y]'], correct: 0, explanation: 'Gradient: [∂f/∂x, ∂f/∂y] = [2x, 2y].' },
    ],
  },

  // ── CHAIN 19: Complex Numbers ─────────────────────────────────────────────
  {
    id: 19, title: 'Complex Numbers', domain: 'D2', difficulty: 'Medium',
    parts: [
      { story: 'Simplify: i² = ?', options: ['i', '1', '2i', '−1'], correct: 3, explanation: 'By definition i²=−1.' },
      { story: 'Simplify: i³ = ?', options: ['−i', '1', 'i', '−1'], correct: 0, explanation: 'i³=i²·i=−i.' },
      { story: 'Add: (3+2i)+(1−5i) = ?', options: ['4+7i', '4−3i', '3−3i', '4+3i'], correct: 1, explanation: '(3+1)+(2−5)i = 4−3i.' },
      { story: 'Multiply: (2+i)(2−i) = ?', options: ['4−i²', '3', '4+1', '5'], correct: 3, explanation: '4−i²=4−(−1)=5.' },
      { story: '|3+4i| = ?', options: ['7', '1', '25', '5'], correct: 3, explanation: 'Modulus=√(3²+4²)=√25=5.' },
    ],
  },

  // ── CHAIN 20: Asymptote + Continuity ─────────────────────────────────────
  {
    id: 20, title: 'Continuity Chain', domain: 'D2', difficulty: 'Hard',
    parts: [
      { story: 'f(x)=x² at x=2. f(2)=?', options: ['2', '8', '16', '4'], correct: 3, explanation: '2²=4.' },
      { story: 'lim(x→2) x² = ?', options: ['2', '8', '16', '4'], correct: 3, explanation: 'Polynomial continuous: limit = f(2) = 4.' },
      { story: 'f is continuous at x=2 if lim=f(2). Is x² continuous at x=2?', options: ['No, hole', 'No, jump', 'Cannot tell', 'Yes'], correct: 3, explanation: 'lim=4=f(2). All three conditions met.' },
      { story: 'f(x)=1/x at x=0. Is it continuous?', options: ['Yes, limit=0', 'Yes, f(0)=0', 'Yes, defined', 'No, undefined'], correct: 3, explanation: 'f(0) undefined. Not continuous at x=0.' },
      { story: 'Removable discontinuity means?', options: ['Vertical asymptote', 'Jump in values', 'Not differentiable', 'Hole that can be filled'], correct: 3, explanation: 'A hole: limit exists but f(x) not defined there.' },
    ],
  },
];

const TIMER_DURATION = 180; // 3 minutes
const ORB_COLORS = ['#22C55E', '#FBBF24', '#A78BFA', '#38BDF8'];

// ─── FALLING ORB COMPONENT ────────────────────────────────────────────────────
function FallingOrb({
  text, index, onTap, answered, isCorrect, isSelected, delay,
}: {
  text: string; index: number; onTap: () => void;
  answered: boolean; isCorrect: boolean; isSelected: boolean; delay: number;
}) {
  const orbY = useRef(new Animated.Value(-60)).current;
  const wobbleX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const animRef = useRef<any>(null);
  const color = ORB_COLORS[index % 4];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleX, { toValue: 6, duration: 800, useNativeDriver: true }),
        Animated.timing(wobbleX, { toValue: -6, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      animRef.current = Animated.timing(orbY, {
        toValue: 320,
        duration: 7000,
        useNativeDriver: true,
      });
      animRef.current.start();
    }, delay);

    return () => { animRef.current?.stop(); };
  }, []);

  useEffect(() => {
    if (!answered) return;
    animRef.current?.stop();
    if (isSelected && isCorrect) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.5, useNativeDriver: true, tension: 200 }),
        Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (isSelected && !isCorrect) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, { toValue: 0.2, duration: 400, useNativeDriver: true }).start();
    }
  }, [answered]);

  const leftPositions = [20, 100, 190, 270];

  return (
    <Animated.View style={{
      position: 'absolute',
      left: leftPositions[index],
      top: 0,
      transform: [{ translateY: orbY }, { translateX: wobbleX }, { scale: scaleAnim }],
      opacity: opacityAnim,
      zIndex: 20,
    }}>
      <TouchableOpacity
        onPress={onTap}
        disabled={answered}
        activeOpacity={0.85}
        style={[styles.orb, { borderColor: color, shadowColor: color }]}
      >
        <Text style={[styles.orbText, { color }]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── ATOM DECORATION ──────────────────────────────────────────────────────────
function Atom({ x, y, delay }: { x: number; y: number; delay: number }) {
  const orbit = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(orbit, { toValue: 1, duration: 3000, useNativeDriver: true })).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 10, duration: 2000 + delay, useNativeDriver: true }),
        Animated.timing(drift, { toValue: -10, duration: 2000 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orbitDeg = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      transform: [{ translateY: drift }], opacity: 0.15,
    }}>
      <View style={styles.atomNucleus} />
      <Animated.View style={[styles.atomOrbit, { transform: [{ rotate: orbitDeg }] }]}>
        <View style={styles.atomElectron} />
      </Animated.View>
    </Animated.View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ChainReactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [chainIndex, setChainIndex] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const [selectedOrb, setSelectedOrb] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [orbKey, setOrbKey] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showGiven, setShowGiven] = useState(false);
  const [givenAnswer, setGivenAnswer] = useState('');
  const [linkResults, setLinkResults] = useState<Array<'green' | 'red' | 'orange' | 'locked'>>(['locked','locked','locked','locked','locked']);
  const [allChainResults, setAllChainResults] = useState<Array<Array<'green'|'red'|'orange'>>>([]);
  const [chainsCompleted, setChainsCompleted] = useState(0);
  const [totalLinksEarned, setTotalLinksEarned] = useState(0);
  const [shuffledChains] = useState(() => [...CHAINS].sort(() => Math.random() - 0.5).slice(0, 10));

  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const reactorPulse = useRef(new Animated.Value(0.8)).current;
  const reactorScale = useRef(new Animated.Value(1)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);
  const [showChainBonus, setShowChainBonus] = useState(false);

  const atoms = useRef([
    { x: 30, y: 120, delay: 500 },
    { x: 300, y: 200, delay: 1000 },
    { x: 60, y: 400, delay: 300 },
    { x: 280, y: 500, delay: 800 },
    { x: 150, y: 650, delay: 200 },
  ]).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(reactorPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(reactorPulse, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ])
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

  function endGame() {
    clearInterval(timerRef.current);
    setGameState('results');
  }

  function handleOrbTap(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedOrb(index);

    const chain = shuffledChains[chainIndex];
    const part = chain.parts[partIndex];
    const isCorrect = index === part.correct;
    playTapSound();
    if (isCorrect) playCorrectSound();
    else playWrongSound();
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 6;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((6 - timeTaken) * 2)) : 0;

    const newLinks = [...linkResults];

    if (isCorrect) {
      const pts = 8 + speedBonus;
      if (isSpeedy) setSpeedyCount(s => s + 1);
      setScore(s => s + pts);
      setTotalLinksEarned(n => n + 1);
      showFloatingScore(`+${pts} ⚡LINK!${isSpeedy ? ` +${speedBonus}` : ''}`);
      newLinks[partIndex] = 'green';
      setLinkResults(newLinks);
      // Reactor pulse
      Animated.sequence([
        Animated.spring(reactorScale, { toValue: 1.15, useNativeDriver: true, tension: 200 }),
        Animated.spring(reactorScale, { toValue: 1, useNativeDriver: true, tension: 200 }),
      ]).start();
      advancePart(newLinks, isCorrect, part);
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 2000); return n; });
      shakeScreen();
      newLinks[partIndex] = 'red';
      setLinkResults(newLinks);
      // Show correct answer briefly
      setGivenAnswer(part.options[part.correct]);
      setShowGiven(true);
      setTimeout(() => {
        setShowGiven(false);
        advancePart(newLinks, isCorrect, part);
      }, 2000);
    }
  }

  function advancePart(links: Array<'green'|'red'|'orange'|'locked'>, wasCorrect: boolean, part: any) {
    const chain = shuffledChains[chainIndex];
    const nextPart = partIndex + 1;

    if (nextPart >= chain.parts.length) {
      // Chain complete
      const earned = links.filter(l => l === 'green').length;
      if (earned === 5) {
        setScore(s => s + 10);
        setShowChainBonus(true);
        setTimeout(() => setShowChainBonus(false), 2000);
      }
      setChainsCompleted(c => c + 1);
      setAllChainResults(prev => [...prev, links.filter(l => l !== 'locked') as Array<'green'|'red'|'orange'>]);

      // Move to next chain
      const nextChain = chainIndex + 1;
      if (nextChain >= shuffledChains.length) {
        endGame();
        return;
      }
      setTimeout(() => {
        setChainIndex(nextChain);
        setPartIndex(0);
        setSelectedOrb(null);
        setAnswered(false);
        setLinkResults(['locked','locked','locked','locked','locked']);
        setOrbKey(k => k + 1);
        setQuestionStartTime(Date.now());
      }, 500);
    } else {
      setTimeout(() => {
        setPartIndex(nextPart);
        setSelectedOrb(null);
        setAnswered(false);
        // Unlock next link
        const newLinks = [...links];
        newLinks[nextPart] = 'locked';
        setLinkResults(newLinks);
        setOrbKey(k => k + 1);
        setQuestionStartTime(Date.now());
      }, wasCorrect ? 600 : 0);
    }
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
    setChainIndex(0); setPartIndex(0); setSelectedOrb(null); setAnswered(false);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setOrbKey(0); setChainsCompleted(0); setTotalLinksEarned(0);
    setLinkResults(['locked','locked','locked','locked','locked']);
    setAllChainResults([]);
    setQuestionStartTime(Date.now());
    setGameState('playing');
  }

  const finalScore = totalLinksEarned > 0 ? Math.min(Math.round((score / (totalLinksEarned * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#22C55E' : timerPct > 0.25 ? '#FBBF24' : '#EF4444';

  const chain = shuffledChains[Math.min(chainIndex, shuffledChains.length - 1)];
  const part = chain?.parts[Math.min(partIndex, chain.parts.length - 1)];
  const domainColor = chain?.domain === 'D1' ? '#2563EB' : chain?.domain === 'D2' ? '#7C3AED' : chain?.domain === 'D3' ? '#F97316' : '#F59E0B';

  // ─── RESULTS ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(1, finalScore, xpEarned, 'rw_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const fullChains = allChainResults.filter(r => r.every(l => l === 'green')).length;
    const message = finalScore >= 75 ? '⚡ Nuclear Master!' : finalScore >= 40 ? '🔬 Good Reaction!' : '🔄 Keep Practicing!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Reaction Report ⚡</Text>
          <View style={styles.chainSummary}>
            <Text style={styles.chainSummaryTitle}>Chain Results</Text>
            {allChainResults.map((links, ci) => (
              <View key={ci} style={styles.chainRow}>
                <Text style={styles.chainRowLabel}>Chain {ci + 1}:</Text>
                <View style={styles.chainLinkRow}>
                  {links.map((l, li) => (
                    <View key={li} style={[styles.chainLinkDot, {
                      backgroundColor: l === 'green' ? '#10B981' : l === 'red' ? '#EF4444' : '#F97316'
                    }]} />
                  ))}
                </View>
                <Text style={styles.chainRowScore}>
                  {links.filter(l => l === 'green').length}/5
                  {links.every(l => l === 'green') ? ' 🏆' : ''}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{totalLinksEarned}</Text>
                <Text style={styles.perfLabel}>Links Earned</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{fullChains}</Text>
                <Text style={styles.perfLabel}>🏆 Full Chains</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{lives < 0 ? 0 : lives}</Text>
                <Text style={styles.perfLabel}>⚛️ Lives</Text>
              </View>
            </View>
          </View>
          <View style={styles.xpCard}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <Text style={styles.xpScore}>{score}</Text>
            <Text style={styles.xpSub}>Total points</Text>
            <Text style={styles.xpGained}>+{xpEarned} XP added to Chain Reaction</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>⚡ Reaction History</Text>
            <Text style={styles.historySub}>Complete more reactions to see history!</Text>
            <Text style={styles.historyRank}>Session #1 — Score: {score}</Text>
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

        {/* REACTOR BACKGROUND */}
        <View style={styles.reactorBg} pointerEvents="none">
          <Animated.View style={[styles.reactorCore, { opacity: reactorPulse, transform: [{ scale: reactorScale }] }]} />
          <Animated.View style={[styles.reactorRing1, { opacity: reactorPulse }]} />
          <Animated.View style={[styles.reactorRing2, { opacity: Animated.multiply(reactorPulse, 0.6) as any }]} />
          {atoms.map((a, i) => <Atom key={i} x={a.x} y={a.y} delay={a.delay} />)}
          {/* Particle tracks */}
          <View style={styles.particle1} />
          <View style={styles.particle2} />
          <View style={styles.particle3} />
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>⚡ CHAIN REACTION</Text>
            <Text style={styles.gameSubtitle}>CHAIN {chainIndex + 1}/{shuffledChains.length} · LINK {partIndex + 1}/5</Text>
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
            {[1,2,3].map(i => <Text key={i} style={styles.heart}>{i <= lives ? '⚛️' : '💨'}</Text>)}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
            </View>
          </View>
          <View style={[styles.domainPill, { backgroundColor: domainColor + '25', borderColor: domainColor }]}>
            <Text style={[styles.domainTxt, { color: domainColor }]}>{chain?.domain}</Text>
          </View>
        </View>

        {/* CHAIN PROGRESS */}
        <View style={styles.chainProgress}>
          {[0,1,2,3,4].map(i => {
            const status = i < partIndex ? linkResults[i] : i === partIndex ? 'current' : 'locked';
            const color = status === 'green' || (i === partIndex && answered && selectedOrb === shuffledChains[chainIndex]?.parts[partIndex]?.correct)
              ? '#10B981'
              : status === 'red' ? '#EF4444'
              : status === 'orange' ? '#F97316'
              : status === 'current' ? '#FBBF24'
              : '#1A3A1A';
            return (
              <View key={i} style={styles.chainLinkRow2}>
                <View style={[styles.chainNode, { backgroundColor: color, borderColor: color }]}>
                  <Text style={styles.chainNodeText}>{i + 1}</Text>
                </View>
                {i < 4 && <View style={[styles.chainLine, { backgroundColor: color + '60' }]} />}
              </View>
            );
          })}
        </View>

        {/* CHAIN TITLE + STORY CARD */}
        <View style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <Text style={styles.chainTitle}>{chain?.title}</Text>
            <View style={styles.noCalcBadge}><Text style={styles.noCalcText}>NO CALC</Text></View>
          </View>
          <Text style={styles.storyText}>{part?.story}</Text>
        </View>

        {/* CHAIN BONUS */}
        {showChainBonus && (
          <Text style={styles.chainBonusText}>💥 CHAIN REACTION! +10 BONUS!</Text>
        )}

        {/* GIVEN ANSWER REVEAL */}
        {showGiven && (
          <View style={styles.givenBox}>
            <Text style={styles.givenLabel}>GIVEN ANSWER: </Text>
            <Text style={styles.givenAnswer}>{givenAnswer}</Text>
          </View>
        )}

        {/* EXPLANATION after correct */}
        {answered && selectedOrb === part?.correct && (
          <View style={styles.explainBox}>
            <Text style={styles.explainText}>💡 {part?.explanation}</Text>
          </View>
        )}

        {/* FALLING ORBS */}
        <View style={styles.orbZone} pointerEvents="box-none">
          {part?.options.map((opt: string, i: number) => (
            <FallingOrb
              key={`${orbKey}-${i}`}
              text={opt}
              index={i}
              onTap={() => handleOrbTap(i)}
              answered={answered}
              isCorrect={i === part?.correct}
              isSelected={selectedOrb === i}
              delay={i * 600}
            />
          ))}
        </View>

      </Animated.View>

      {/* PAUSE */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>⚛️ Reaction Paused</Text>
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
  safe: { flex: 1, backgroundColor: '#030A03' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#030A03' },

  reactorBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 },
  reactorCore: { position: 'absolute', top: '30%', left: '25%', width: 200, height: 200, borderRadius: 100, backgroundColor: '#00FF4108' },
  reactorRing1: { position: 'absolute', top: '22%', left: '15%', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: '#22C55E20' },
  reactorRing2: { position: 'absolute', top: '12%', left: '5%', width: 380, height: 380, borderRadius: 190, borderWidth: 1, borderColor: '#22C55E15' },
  atomNucleus: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  atomOrbit: { position: 'absolute', top: -20, left: -20, width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#22C55E60' },
  atomElectron: { position: 'absolute', top: -3, left: 22, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FBBF24' },
  particle1: { position: 'absolute', top: '40%', left: 0, right: 0, height: 1, backgroundColor: '#22C55E10' },
  particle2: { position: 'absolute', top: 0, bottom: 0, left: '30%', width: 1, backgroundColor: '#22C55E08' },
  particle3: { position: 'absolute', top: 0, bottom: 0, right: '30%', width: 1, backgroundColor: '#22C55E08' },

  gameHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 20, gap: 10, zIndex: 10 },
  pauseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0A140A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#22C55E' },
  pauseIcon: { fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 18, fontWeight: '900', color: '#22C55E', letterSpacing: 1 },
  gameSubtitle: { fontSize: 9, color: '#FBBF24', fontWeight: '700', letterSpacing: 1 },
  scoreBox: { backgroundColor: '#22C55E20', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#22C55E' },
  scoreNum: { fontSize: 18, fontWeight: '900', color: '#22C55E' },
  scoreLabel: { fontSize: 9, color: '#22C55E', fontWeight: '600' },
  floatingScore: { position: 'absolute', right: 20, top: 105, fontSize: 18, fontWeight: '900', color: '#22C55E', zIndex: 100 },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 6, backgroundColor: '#0A140A80', borderRadius: 14, padding: 10, zIndex: 10 },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 16 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  timerNum: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#0A2A0A', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  domainPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  domainTxt: { fontSize: 11, fontWeight: '800' },

  // Chain progress
  chainProgress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginBottom: 8, zIndex: 10 },
  chainLinkRow2: { flexDirection: 'row', alignItems: 'center' },
  chainNode: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  chainNodeText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  chainLine: { width: 24, height: 3, borderRadius: 2 },

  // Story card
  storyCard: { marginHorizontal: 20, backgroundColor: '#0A140A', borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#22C55E30', zIndex: 10 },
  storyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  chainTitle: { fontSize: 12, color: '#22C55E', fontWeight: '700', flex: 1 },
  noCalcBadge: { backgroundColor: '#FBBF2420', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#FBBF24' },
  noCalcText: { fontSize: 9, color: '#FBBF24', fontWeight: '800' },
  storyText: { fontSize: 15, fontWeight: '700', color: '#DCFCE7', lineHeight: 22 },

  // Chain bonus
  chainBonusText: { textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#FBBF24', marginBottom: 4, zIndex: 10 },

  // Given answer box
  givenBox: { marginHorizontal: 20, backgroundColor: '#F9731620', borderRadius: 10, padding: 10, marginBottom: 4, borderWidth: 1, borderColor: '#F97316', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  givenLabel: { fontSize: 12, color: '#F97316', fontWeight: '700' },
  givenAnswer: { fontSize: 14, color: '#FFFFFF', fontWeight: '900' },

  // Explain
  explainBox: { marginHorizontal: 20, backgroundColor: '#10B98115', borderRadius: 10, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: '#10B98140', zIndex: 10 },
  explainText: { fontSize: 12, color: '#A7F3D0', lineHeight: 18 },

  // Orb zone
  orbZone: { flex: 1, position: 'relative', zIndex: 10 },

  // Orbs
  orb: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#0A140A', borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, elevation: 8 },
  orbText: { fontSize: 13, fontWeight: '900', textAlign: 'center', paddingHorizontal: 4 },

  // Results
  resultsTitle: { fontSize: 26, fontWeight: '800', color: '#22C55E', paddingTop: 50, marginBottom: 16 },
  chainSummary: { backgroundColor: '#0A140A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#22C55E30' },
  chainSummaryTitle: { fontSize: 14, color: '#22C55E', fontWeight: '800', marginBottom: 10 },
  chainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  chainRowLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', width: 60 },
  chainLinkRow: { flexDirection: 'row', gap: 4, flex: 1 },
  chainLinkDot: { width: 20, height: 20, borderRadius: 10 },
  chainRowScore: { fontSize: 12, color: '#FBBF24', fontWeight: '700', width: 40 },
  performanceCard: { backgroundColor: '#0A140A', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#22C55E30' },
  performanceTitle: { fontSize: 22, fontWeight: '800', color: '#22C55E', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: { flex: 1, backgroundColor: '#030A03', borderRadius: 16, padding: 14, alignItems: 'center' },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#22C55E' },
  perfLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: { backgroundColor: '#22C55E15', borderRadius: 20, padding: 24, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#22C55E' },
  xpTitle: { fontSize: 16, color: '#22C55E', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#FBBF24', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: { backgroundColor: '#0A140A', borderRadius: 20, padding: 20, marginVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#22C55E30' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#22C55E', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#FBBF24', fontWeight: '700' },
  continueBtn: { backgroundColor: '#22C55E', borderRadius: 50, padding: 18, alignItems: 'center', marginVertical: 20 },
  continueBtnText: { color: '#030A03', fontSize: 17, fontWeight: '900' },
  quitBtn: { backgroundColor: 'transparent', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#0A2A0A' },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pauseCard: { backgroundColor: '#0A140A', borderRadius: 24, padding: 32, width: '82%', alignItems: 'center', borderWidth: 1, borderColor: '#22C55E' },
  pauseTitle: { fontSize: 24, fontWeight: '800', color: '#22C55E', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: { width: '100%', padding: 16, borderRadius: 50, backgroundColor: '#22C55E', alignItems: 'center', marginBottom: 12 },
  pauseOptionText: { color: '#030A03', fontSize: 16, fontWeight: '800' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});