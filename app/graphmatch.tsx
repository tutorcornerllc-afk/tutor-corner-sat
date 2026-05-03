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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BUBBLE_TRAVEL = SCREEN_HEIGHT * 0.55;
const BUBBLE_DURATION = 6000;

const QUESTIONS = [
  // ── EASY: Basic slope/intercept ──────────────────────────────────────────
  { id: 1, domain: 'D3', difficulty: 'Easy', type: 'equation→description', question: 'Which equation matches a line with slope 2 passing through the origin?', graph: { type: 'line', slope: 2, intercept: 0 }, options: ['y = x + 2', 'y = 2x + 2', 'y = 2x', 'y = ½x'], correct: 2, explanation: 'Slope-intercept form y = mx + b. Slope = 2 and y-intercept = 0 gives y = 2x. Option A has slope 1. Option B has a y-intercept of 2.' },
  { id: 2, domain: 'D1', difficulty: 'Easy', type: 'features→equation', question: 'Which equation has a y-intercept of 3 and slope of -2?', graph: { type: 'line', slope: -2, intercept: 3 }, options: ['y = 2x + 3', 'y = -2x - 3', 'y = 3x - 2', 'y = -2x + 3'], correct: 3, explanation: 'y = mx + b with m = -2 and b = 3 gives y = -2x + 3. Option A has wrong sign for slope. Option B has wrong sign for intercept.' },
  { id: 3, domain: 'D1', difficulty: 'Easy', type: 'description→equation', question: 'A line crosses the y-axis at 4 and has slope 1. Which equation is correct?', graph: { type: 'line', slope: 1, intercept: 4 }, options: ['y = 4x + 1', 'y = x + 4', 'y = x - 4', 'y = 4x - 1'], correct: 1, explanation: 'y = mx + b: slope = 1, y-intercept = 4 → y = x + 4. Option A swaps slope and intercept. Option C has wrong sign on intercept.' },
  { id: 4, domain: 'D1', difficulty: 'Easy', type: 'features→equation', question: 'Which line has a positive slope and negative y-intercept?', graph: { type: 'line', slope: 3, intercept: -2 }, options: ['y = -3x + 2', 'y = 3x + 2', 'y = 3x - 2', 'y = -3x - 2'], correct: 2, explanation: 'Positive slope means line goes up left to right. Negative y-intercept means it crosses below origin. y = 3x - 2 fits both.' },
  { id: 5, domain: 'D3', difficulty: 'Easy', type: 'data→graph', question: 'A scatter plot shows points going up from left to right. What kind of correlation is this?', graph: { type: 'scatter', correlation: 'positive' }, options: ['Negative correlation', 'No correlation', 'Undefined correlation', 'Positive correlation'], correct: 3, explanation: 'Points rising left to right = positive correlation. Falling left to right = negative. Random scatter = no correlation.' },
  { id: 6, domain: 'D3', difficulty: 'Easy', type: 'data→graph', question: 'A bar chart shows: Math=80, Science=65, English=90. Which subject scored highest?', graph: { type: 'bar', values: [80, 65, 90], labels: ['Math', 'Sci', 'Eng'] }, options: ['English (90)', 'Math (80)', 'Science (65)', 'All equal'], correct: 0, explanation: 'English bar reaches 90, which is higher than Math (80) and Science (65).' },
  { id: 7, domain: 'D3', difficulty: 'Easy', type: 'data→stat', question: 'A pie chart shows 25% red, 50% blue, 25% green. What fraction is blue?', graph: { type: 'pie', values: [25, 50, 25], labels: ['Red', 'Blue', 'Green'] }, options: ['1/4', '1/2', '3/4', '1/3'], correct: 1, explanation: '50% = 50/100 = 1/2. Red and green are each 25% = 1/4.' },
  { id: 8, domain: 'D3', difficulty: 'Easy', type: 'data→stat', question: 'Which scatter plot description shows NO correlation between variables?', graph: { type: 'scatter', correlation: 'none' }, options: ['Points forming a line up', 'Points forming a line down', 'Random points with no pattern', 'A curved U-shape'], correct: 2, explanation: 'No correlation = random scatter with no trend. A line going up = positive. A line going down = negative correlation.' },
  { id: 9, domain: 'D1', difficulty: 'Easy', type: 'graph→equation', question: 'A line has x-intercept 3 and y-intercept 6. What is its slope?', graph: { type: 'line', slope: -2, intercept: 6 }, options: ['m = 2', 'm = 1/2', 'm = -2', 'm = -1/2'], correct: 2, explanation: 'Slope = rise/run = (0-6)/(3-0) = -6/3 = -2. The line falls from left to right.' },
  { id: 10, domain: 'D3', difficulty: 'Easy', type: 'data→stat', question: 'Data values: 2, 4, 6, 8, 10. What is the mean?', graph: { type: 'bar', values: [2, 4, 6, 8, 10], labels: ['A', 'B', 'C', 'D', 'E'] }, options: ['5', '8', '4', '6'], correct: 3, explanation: 'Mean = sum/count = (2+4+6+8+10)/5 = 30/5 = 6.' },
  // ── MEDIUM ────────────────────────────────────────────────────────────────
  { id: 11, domain: 'D2', difficulty: 'Medium', type: 'equation→graph', question: 'y = x² - 4. Which best describes this parabola?', graph: { type: 'parabola', a: 1, h: 0, k: -4 }, options: ['Opens down, vertex at (0,-4)', 'Opens up, vertex at (0,4)', 'Opens up, crosses x-axis at ±2', 'Crosses y-axis at 4'], correct: 2, explanation: 'y = x² - 4 opens upward (positive coefficient). Vertex at (0,-4). Roots: x² = 4, x = ±2.' },
  { id: 12, domain: 'D2', difficulty: 'Medium', type: 'equation→graph', question: 'y = -x² + 9. Which best describes this graph?', graph: { type: 'parabola', a: -1, h: 0, k: 9 }, options: ['Opens down, vertex at (0,9)', 'Opens up, vertex at (0,9)', 'Opens down, vertex at (9,0)', 'Opens up, vertex at (-3,3)'], correct: 0, explanation: 'Negative leading coefficient → opens downward. Vertex at (0,9). Roots at x = ±3.' },
  { id: 13, domain: 'D2', difficulty: 'Medium', type: 'equation→graph', question: 'y = (x-2)² + 3. Where is the vertex?', graph: { type: 'parabola', a: 1, h: 2, k: 3 }, options: ['(-2, 3)', '(2, -3)', '(3, 2)', '(2, 3)'], correct: 3, explanation: 'Vertex form y = a(x-h)² + k has vertex at (h, k). Here h = 2, k = 3, so vertex is (2, 3).' },
  { id: 14, domain: 'D2', difficulty: 'Medium', type: 'data→graph', question: 'Data shows 200% increase each year starting at 100. Which graph type fits best?', graph: { type: 'exponential', base: 2, initial: 100 }, options: ['Straight increasing line', 'Decreasing curve', 'Exponential growth curve', 'U-shaped parabola'], correct: 2, explanation: 'Percentage increase each period = exponential growth. A constant amount increase would be linear.' },
  { id: 15, domain: 'D2', difficulty: 'Medium', type: 'equation→graph', question: 'y = 3(0.5)ˣ. What kind of graph is this?', graph: { type: 'exponential', base: 0.5, initial: 3 }, options: ['Exponential decay starting at y=3', 'Exponential growth starting at y=3', 'Linear decrease from y=3', 'Horizontal line at y=3'], correct: 0, explanation: 'Base 0.5 < 1 means exponential decay. When x=0, y=3(1)=3 so y-intercept is 3.' },
  { id: 16, domain: 'D3', difficulty: 'Medium', type: 'boxplot→stat', question: 'Box plot: Min=10, Q1=25, Median=40, Q3=60, Max=80. What is the IQR?', graph: { type: 'boxplot', min: 10, q1: 25, median: 40, q3: 60, max: 80 }, options: ['70', '40', '15', '35'], correct: 3, explanation: 'IQR = Q3 - Q1 = 60 - 25 = 35. The IQR measures the middle 50% spread.' },
  { id: 17, domain: 'D3', difficulty: 'Medium', type: 'boxplot→stat', question: 'Box plot: Q1=20, Q3=50. What is the interquartile range?', graph: { type: 'boxplot', min: 5, q1: 20, median: 35, q3: 50, max: 70 }, options: ['30', '25', '50', '65'], correct: 0, explanation: 'IQR = Q3 - Q1 = 50 - 20 = 30.' },
  { id: 18, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'A histogram shows most data between 60-70 with few values below 40 or above 90. What shape is this?', graph: { type: 'histogram', shape: 'normal' }, options: ['Right-skewed', 'Left-skewed', 'Bell curve (normal distribution)', 'Uniform distribution'], correct: 2, explanation: 'Symmetric distribution concentrated in middle with few extremes = bell curve / normal distribution.' },
  { id: 19, domain: 'D3', difficulty: 'Medium', type: 'scatter→stat', question: 'Scatter plot shows r = -0.85. What does this indicate?', graph: { type: 'scatter', correlation: 'strong negative' }, options: ['Strong positive correlation', 'Weak negative correlation', 'No correlation', 'Strong negative correlation'], correct: 3, explanation: 'r = -0.85 is close to -1, indicating strong negative correlation. Negative = as x increases, y decreases.' },
  { id: 20, domain: 'D1', difficulty: 'Medium', type: 'features→equation', question: 'Two lines are parallel. Line 1 is y = 3x + 1. Which could be Line 2?', graph: { type: 'line', slope: 3, intercept: 5 }, options: ['y = 3x + 5', 'y = -3x + 1', 'y = (1/3)x + 1', 'y = -1/3x + 5'], correct: 0, explanation: 'Parallel lines have equal slopes. Line 2 must also have slope 3. Option B has opposite slope. Option C has reciprocal slope.' },
  { id: 21, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'Bar chart shows sales: Jan=100, Feb=150, Mar=120. What is the mean monthly sales?', graph: { type: 'bar', values: [100, 150, 120], labels: ['Jan', 'Feb', 'Mar'] }, options: ['123.3', '150', '100', '110.5'], correct: 0, explanation: 'Mean = (100+150+120)/3 = 370/3 ≈ 123.3' },
  { id: 22, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'Data set: 5, 8, 12, 15, 20. What is the median?', graph: { type: 'bar', values: [5, 8, 12, 15, 20], labels: ['1', '2', '3', '4', '5'] }, options: ['8', '15', '12', '10'], correct: 2, explanation: 'Median = middle value when sorted. 5 values, middle is 3rd = 12.' },
  { id: 23, domain: 'D2', difficulty: 'Medium', type: 'equation→graph', question: 'y = 2ˣ. When x=3, what is y?', graph: { type: 'exponential', base: 2, initial: 1 }, options: ['6', '9', '5', '8'], correct: 3, explanation: 'y = 2³ = 8. Exponential: base raised to the power of x.' },
  { id: 24, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'Pie chart: Category A = 40%, B = 35%, C = 25%. Total sales = $200. How much is Category A?', graph: { type: 'pie', values: [40, 35, 25], labels: ['A', 'B', 'C'] }, options: ['$80', '$70', '$40', '$100'], correct: 0, explanation: '40% of $200 = 0.40 × 200 = $80.' },
  { id: 25, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'A bar chart shows a 25% increase from Year 1 (80) to Year 2. What is Year 2?', graph: { type: 'bar', values: [80, 100], labels: ['Y1', 'Y2'] }, options: ['105', '90', '100', '125'], correct: 2, explanation: '25% increase: 80 × 1.25 = 100.' },
  // ── HARD: Complex analysis ────────────────────────────────────────────────
  { id: 26, domain: 'D3', difficulty: 'Hard', type: 'boxplot→stat', question: 'Box plot: Min=5, Q1=15, Median=30, Q3=55, Max=95. Are there outliers above Q3?', graph: { type: 'boxplot', min: 5, q1: 15, median: 30, q3: 55, max: 95 }, options: ['Yes — max=95 is above Q3', 'No — upper fence = 115, max=95 ≤ 115', 'Yes — any value above Q3 is an outlier', 'No — the range is only 90'], correct: 1, explanation: 'Upper fence = Q3 + 1.5×IQR = 55 + 1.5×40 = 55 + 60 = 115. Max=95 < 115, so no outliers.' },
  { id: 27, domain: 'D2', difficulty: 'Hard', type: 'equation→graph', question: 'y = -(x+1)² + 4. What are the x-intercepts?', graph: { type: 'parabola', a: -1, h: -1, k: 4 }, options: ['x = -1 and x = 4', 'x = 2 and x = -4', 'x = 1 and x = -3', 'x = 0 and x = -2'], correct: 2, explanation: 'Set y=0: -(x+1)²+4=0, (x+1)²=4, x+1=±2, x=1 or x=-3.' },
  { id: 28, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Scatter shows strong positive correlation. r ≈ 0.92. Which statement is correct?', graph: { type: 'scatter', correlation: 'strong positive' }, options: ['As x increases, y increases strongly', 'Correlation means x causes y', 'r=0.92 means 92% of points are correct', 'There is no linear relationship'], correct: 0, explanation: 'r=0.92 means strong positive relationship. But correlation ≠ causation. r² = 0.85 means 85% of variance explained.' },
  { id: 29, domain: 'D2', difficulty: 'Hard', type: 'equation→graph', question: 'f(x) = 2x² - 8x + 6. What is the vertex?', graph: { type: 'parabola', a: 2, h: 2, k: -2 }, options: ['(-2, 2)', '(4, 6)', '(2, -2)', '(0, 6)'], correct: 2, explanation: 'Vertex x = -b/2a = 8/4 = 2. y = 2(4) - 16 + 6 = 8 - 16 + 6 = -2. Vertex = (2, -2).' },
  { id: 30, domain: 'D1', difficulty: 'Hard', type: 'features→equation', question: 'Two lines are perpendicular. Line 1 is y = (2/3)x + 1. Which is Line 2?', graph: { type: 'line', slope: -1.5, intercept: 2 }, options: ['y = -(3/2)x + 2', 'y = (2/3)x + 2', 'y = (3/2)x - 1', 'y = -(2/3)x + 2'], correct: 0, explanation: 'Perpendicular slope = negative reciprocal of 2/3 = -3/2. So Line 2: y = -(3/2)x + 2.' },
  { id: 31, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Histogram is right-skewed. Where is the mean relative to the median?', graph: { type: 'histogram', shape: 'right-skewed' }, options: ['Mean < Median', 'Mean = Median', 'Mean > Median', 'Mean is exactly double'], correct: 2, explanation: 'Right skew pulls the mean toward the tail (high values). So mean > median in right-skewed distributions.' },
  { id: 32, domain: 'D3', difficulty: 'Hard', type: 'boxplot→stat', question: 'Two box plots: A has IQR=10, B has IQR=40. Which is more spread out in the middle?', graph: { type: 'boxplot', min: 10, q1: 30, median: 50, q3: 70, max: 90 }, options: ['A (smaller IQR = less variation)', 'B (larger IQR = more spread)', 'They are equal', 'Cannot be determined'], correct: 1, explanation: 'IQR measures middle 50% spread. Larger IQR = more variability in the data.' },
  { id: 33, domain: 'D2', difficulty: 'Hard', type: 'equation→graph', question: 'y = 100(0.8)ˣ. After how many years does y fall below 50?', graph: { type: 'exponential', base: 0.8, initial: 100 }, options: ['After x = 2 (y = 64)', 'After x = 5 (y ≈ 32.8)', 'After x = 1 (y = 80)', 'After x = 3 (y ≈ 51.2)'], correct: 3, explanation: 'x=3: y=100(0.8)³=100(0.512)=51.2. x=4: y=100(0.8)⁴=40.96 < 50. So it falls below 50 after x=3.' },
  { id: 34, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Data: 10, 12, 14, 16, 100. Which measure is most affected by the outlier 100?', graph: { type: 'bar', values: [10, 12, 14, 16, 100], labels: ['A', 'B', 'C', 'D', 'E'] }, options: ['Mean (30.4)', 'Median (14)', 'Mode (none)', 'Range (90)'], correct: 0, explanation: 'Mean = 152/5 = 30.4, heavily pulled by outlier 100. Median = 14 (unchanged by outlier). Mean is most affected.' },
  { id: 35, domain: 'D3', difficulty: 'Hard', type: 'scatter→stat', question: 'Line of best fit: ŷ = 2.5x + 10. Predict y when x = 8.', graph: { type: 'scatter', correlation: 'positive' }, options: ['25', '28', '30', '40'], correct: 2, explanation: 'ŷ = 2.5(8) + 10 = 20 + 10 = 30.' },
  { id: 36, domain: 'D1', difficulty: 'Hard', type: 'graph→equation', question: 'A line passes through (0,5) and (4,1). Which equation is correct?', graph: { type: 'line', slope: -1, intercept: 5 }, options: ['y = x + 5', 'y = -x - 5', 'y = -x + 5', 'y = -4x + 5'], correct: 2, explanation: 'Slope = (1-5)/(4-0) = -4/4 = -1. Y-intercept = 5. So y = -x + 5.' },
  { id: 37, domain: 'D2', difficulty: 'Hard', type: 'equation→graph', question: 'y = x² - 6x + 9. What are the roots?', graph: { type: 'parabola', a: 1, h: 3, k: 0 }, options: ['x = 3 (double root)', 'x = 3 and x = -3', 'x = 6 and x = 0', 'x = 9 and x = 1'], correct: 0, explanation: 'y = (x-3)² = 0 → x = 3. This is a perfect square so there is one repeated (double) root.' },
  { id: 38, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Bar chart: Class A avg=82 (n=20), Class B avg=76 (n=30). What is the combined mean?', graph: { type: 'bar', values: [82, 76], labels: ['A', 'B'] }, options: ['79', '77', '78.4', '80'], correct: 2, explanation: 'Weighted mean = (20×82 + 30×76)/(50) = (1640+2280)/50 = 3920/50 = 78.4' },
  { id: 39, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Scatter plot r² = 0.64. What percent of variation in y is explained by x?', graph: { type: 'scatter', correlation: 'moderate positive' }, options: ['64%', '80%', '36%', '6.4%'], correct: 0, explanation: 'r² = coefficient of determination. r²=0.64 means 64% of variation in y is explained by the linear relationship with x.' },
  { id: 40, domain: 'D3', difficulty: 'Hard', type: 'boxplot→stat', question: 'Box plot range = 60, IQR = 20. What does this suggest about the data?', graph: { type: 'boxplot', min: 10, q1: 35, median: 45, q3: 55, max: 70 }, options: ['Wide overall spread, concentrated middle 50%', 'Evenly spread throughout', 'No outliers present', 'Data is left-skewed'], correct: 0, explanation: 'Range=60 shows wide overall spread. IQR=20 means middle 50% is tightly packed. Suggests possible outliers at extremes.' },
  // ── MORE MEDIUM/HARD ──────────────────────────────────────────────────────
  { id: 41, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'Histogram shows data from 0-100 with most values between 70-90. What shape is this?', graph: { type: 'histogram', shape: 'left-skewed' }, options: ['Right-skewed', 'Left-skewed', 'Normal/symmetric', 'Uniform'], correct: 1, explanation: 'Most data at high end with a tail to the left = left-skewed (negatively skewed).' },
  { id: 42, domain: 'D2', difficulty: 'Medium', type: 'equation→graph', question: 'y = 5(2)ˣ. What is the y-intercept?', graph: { type: 'exponential', base: 2, initial: 5 }, options: ['2', '10', '0', '5'], correct: 3, explanation: 'When x=0: y = 5(2)⁰ = 5(1) = 5. The y-intercept equals the initial value.' },
  { id: 43, domain: 'D3', difficulty: 'Medium', type: 'data→stat', question: 'A survey finds 60% prefer Option A. 500 people surveyed. How many prefer A?', graph: { type: 'pie', values: [60, 40], labels: ['A', 'B'] }, options: ['300', '250', '350', '200'], correct: 0, explanation: '60% of 500 = 0.60 × 500 = 300 people.' },
  { id: 44, domain: 'D1', difficulty: 'Medium', type: 'features→equation', question: 'A line is horizontal and passes through y = 4. What is its equation?', graph: { type: 'line', slope: 0, intercept: 4 }, options: ['x = 4', 'y = 4', 'y = 4x', 'x + y = 4'], correct: 1, explanation: 'Horizontal lines have slope = 0 and equation y = constant. Here y = 4.' },
  { id: 45, domain: 'D1', difficulty: 'Medium', type: 'features→equation', question: 'A vertical line passes through x = -3. What is its equation?', graph: { type: 'line', slope: 999, intercept: -3 }, options: ['y = -3', 'y = -3x', 'x = -3', 'x + 3 = y'], correct: 2, explanation: 'Vertical lines have undefined slope and equation x = constant. Here x = -3.' },
  { id: 46, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Two data sets have same mean = 50. Set A std dev = 2, Set B std dev = 15. Which is more spread?', graph: { type: 'histogram', shape: 'normal' }, options: ['Set B (higher std dev)', 'Set A (lower std dev)', 'They are equally spread', 'Cannot be determined'], correct: 0, explanation: 'Standard deviation measures spread. Higher std dev = more spread from mean. Set B with σ=15 is far more spread than Set A with σ=2.' },
  { id: 47, domain: 'D3', difficulty: 'Hard', type: 'scatter→stat', question: 'Line of best fit: ŷ = -3x + 90. For x=20, what is the predicted y?', graph: { type: 'scatter', correlation: 'negative' }, options: ['60', '30', '50', '0'], correct: 1, explanation: 'ŷ = -3(20) + 90 = -60 + 90 = 30.' },
  { id: 48, domain: 'D3', difficulty: 'Hard', type: 'data→stat', question: 'Data: 4, 4, 7, 9, 10, 10, 12. What is the median?', graph: { type: 'bar', values: [4, 4, 7, 9, 10, 10, 12], labels: ['1', '2', '3', '4', '5', '6', '7'] }, options: ['7', '10', '9', '8'], correct: 2, explanation: '7 values, median = 4th value = 9.' },
  { id: 49, domain: 'D2', difficulty: 'Hard', type: 'equation→graph', question: 'y = (x+3)(x-1). What are the zeros of this function?', graph: { type: 'parabola', a: 1, h: -1, k: -4 }, options: ['x = 3 and x = -1', 'x = -3 and x = 1', 'x = -3 and x = -1', 'x = 0 and x = 3'], correct: 1, explanation: 'Set y=0: (x+3)=0 → x=-3; (x-1)=0 → x=1. Zeros at x=-3 and x=1.' },
  { id: 50, domain: 'D3', difficulty: 'Hard', type: 'boxplot→stat', question: 'Box plot shows median at 45. The mean is 60. What does this suggest?', graph: { type: 'boxplot', min: 20, q1: 35, median: 45, q3: 65, max: 120 }, options: ['Left-skewed (mean < median)', 'Symmetric distribution', 'Right-skewed (mean > median)', 'Uniform distribution'], correct: 2, explanation: 'When mean > median, data is right-skewed (pulled up by high outliers). Mean=60 > Median=45 confirms right skew.' },
];

const TIMER_DURATION = 45;
const BUBBLE_COLORS = ['#2563EB', '#F97316', '#7C3AED'];

// ─── GRAPH RENDERER ──────────────────────────────────────────────────────────
function GraphDisplay({ graph, question }: { graph: any; question: string }) {
  const W = SCREEN_WIDTH - 56;
  const H = 110;

  if (graph.type === 'line') {
    const slope = graph.slope === 999 ? null : graph.slope;
    const pts = slope !== null ? [
      { x: 0, y: H / 2 - graph.intercept * 10 },
      { x: W, y: H / 2 - (graph.slope * (W / 30) + graph.intercept) * 10 },
    ] : null;
    return (
      <View style={[gStyles.graphBox, { width: W, height: H }]}>
        {/* Axes */}
        <View style={[gStyles.axisH, { top: H / 2 }]} />
        <View style={[gStyles.axisV, { left: W / 2 }]} />
        {/* Line */}
        {pts && (
          <View style={{
            position: 'absolute',
            left: pts[0].x, top: Math.min(pts[0].y, pts[1].y),
            width: Math.abs(pts[1].x - pts[0].x),
            height: Math.max(Math.abs(pts[1].y - pts[0].y), 2),
            backgroundColor: '#10B981', opacity: 0.9,
            transform: [{ rotate: `${Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI}deg` }],
          }} />
        )}
        {slope === null && (
          <View style={{ position: 'absolute', left: W / 2 + graph.intercept * 10, top: 0, width: 2, height: H, backgroundColor: '#10B981' }} />
        )}
        <Text style={gStyles.graphLabel}>{graph.slope === 0 ? 'y = c' : graph.slope === 999 ? 'x = c' : `slope: ${graph.slope}`}</Text>
      </View>
    );
  }

  if (graph.type === 'parabola') {
    const points = Array.from({ length: 11 }, (_, i) => {
      const x = (i - 5) * (W / 12);
      const xVal = (i - 5) * 1.2 - graph.h;
      const yVal = graph.a * xVal * xVal + graph.k;
      const y = H / 2 - yVal * 6;
      return { x: x + W / 2, y };
    });
    return (
      <View style={[gStyles.graphBox, { width: W, height: H }]}>
        <View style={[gStyles.axisH, { top: H / 2 }]} />
        <View style={[gStyles.axisV, { left: W / 2 }]} />
        {points.slice(0, -1).map((p, i) => {
          const next = points[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return (
            <View key={i} style={{
              position: 'absolute',
              left: p.x, top: p.y,
              width: len, height: 2,
              backgroundColor: '#10B981',
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 50%',
            }} />
          );
        })}
        <Text style={gStyles.graphLabel}>vertex: ({graph.h}, {graph.k})</Text>
      </View>
    );
  }

  if (graph.type === 'bar') {
    const maxVal = Math.max(...graph.values);
    return (
      <View style={[gStyles.graphBox, { width: W, height: H, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', paddingBottom: 16, paddingHorizontal: 4 }]}>
        {graph.values.map((v: number, i: number) => (
          <View key={i} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={gStyles.barVal}>{v}</Text>
            <View style={{ width: '60%', height: (v / maxVal) * 65, backgroundColor: BUBBLE_COLORS[i % 3], borderRadius: 3, opacity: 0.85 }} />
            <Text style={gStyles.barLabel}>{graph.labels[i]}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (graph.type === 'pie') {
    return (
      <View style={[gStyles.graphBox, { width: W, height: H, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }]}>
        <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: '#2563EB', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>PIE</Text>
        </View>
        <View style={{ gap: 4 }}>
          {graph.labels.map((l: string, i: number) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: BUBBLE_COLORS[i % 3] }} />
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>{l}: {graph.values[i]}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (graph.type === 'scatter') {
    const pts = graph.correlation === 'positive' || graph.correlation === 'strong positive' || graph.correlation === 'moderate positive'
      ? [[10, 80], [25, 65], [40, 50], [55, 38], [70, 22], [85, 15]]
      : graph.correlation === 'negative' || graph.correlation === 'strong negative'
      ? [[10, 20], [25, 32], [40, 45], [55, 60], [70, 72], [85, 85]]
      : [[15, 30], [30, 70], [50, 20], [65, 60], [80, 40], [40, 80]];
    return (
      <View style={[gStyles.graphBox, { width: W, height: H }]}>
        <View style={[gStyles.axisH, { bottom: 14 }]} />
        <View style={[gStyles.axisV, { left: 14 }]} />
        {pts.map(([px, py], i) => (
          <View key={i} style={{
            position: 'absolute',
            left: 14 + (px / 100) * (W - 28),
            top: 8 + ((100 - py) / 100) * (H - 30),
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: '#10B981',
          }} />
        ))}
        <Text style={gStyles.graphLabel}>{graph.correlation} correlation</Text>
      </View>
    );
  }

  if (graph.type === 'boxplot') {
    const range = graph.max - graph.min;
    const toX = (v: number) => 10 + ((v - graph.min) / range) * (W - 20);
    const mid = H / 2;
    return (
      <View style={[gStyles.graphBox, { width: W, height: H }]}>
        <View style={[gStyles.axisH, { top: mid }]} />
        {[graph.min, graph.q1, graph.median, graph.q3, graph.max].map((v, i) => (
          <View key={i} style={{ position: 'absolute', left: toX(v), top: mid - 14, width: 2, height: 28, backgroundColor: '#10B981' }} />
        ))}
        <View style={{
          position: 'absolute', left: toX(graph.q1), top: mid - 14,
          width: toX(graph.q3) - toX(graph.q1), height: 28,
          borderWidth: 2, borderColor: '#10B981', backgroundColor: '#10B98120',
        }} />
        <View style={{ position: 'absolute', left: 10, top: mid + 18, right: 0 }}>
          <Text style={{ color: '#64748B', fontSize: 9 }}>Min={graph.min} Q1={graph.q1} Med={graph.median} Q3={graph.q3} Max={graph.max}</Text>
        </View>
      </View>
    );
  }

  if (graph.type === 'histogram') {
    const bars = graph.shape === 'normal'
      ? [15, 30, 55, 80, 100, 80, 55, 30, 15]
      : graph.shape === 'right-skewed'
      ? [80, 65, 50, 35, 25, 15, 8, 4, 2]
      : [2, 4, 8, 15, 25, 35, 50, 65, 80];
    return (
      <View style={[gStyles.graphBox, { width: W, height: H, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 14, paddingHorizontal: 4, gap: 2 }]}>
        {bars.map((v, i) => (
          <View key={i} style={{ flex: 1, height: (v / 100) * 70, backgroundColor: '#2563EB', borderRadius: 2, opacity: 0.75 }} />
        ))}
        <Text style={[gStyles.graphLabel, { bottom: 2 }]}>{graph.shape}</Text>
      </View>
    );
  }

  if (graph.type === 'exponential') {
    const pts = Array.from({ length: 9 }, (_, i) => ({
      x: 10 + (i / 8) * (W - 20),
      y: H - 14 - Math.min(Math.pow(graph.base, i * 0.8) * 10, H - 20),
    }));
    return (
      <View style={[gStyles.graphBox, { width: W, height: H }]}>
        <View style={[gStyles.axisH, { bottom: 14 }]} />
        <View style={[gStyles.axisV, { left: 10 }]} />
        {pts.slice(0, -1).map((p, i) => {
          const next = pts[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return (
            <View key={i} style={{
              position: 'absolute', left: p.x, top: p.y,
              width: len, height: 2, backgroundColor: '#10B981',
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 50%',
            }} />
          );
        })}
        <Text style={gStyles.graphLabel}>{graph.base < 1 ? 'decay' : 'growth'}</Text>
      </View>
    );
  }

  return (
    <View style={[gStyles.graphBox, { width: W, height: H, justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#64748B', fontSize: 13 }}>📊 {graph.type}</Text>
    </View>
  );
}

const gStyles = StyleSheet.create({
  graphBox: { position: 'relative', overflow: 'hidden' },
  axisH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#1E3A5F' },
  axisV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#1E3A5F' },
  graphLabel: { position: 'absolute', bottom: 4, right: 6, fontSize: 9, color: '#64748B' },
  barVal: { fontSize: 9, color: '#94A3B8', marginBottom: 2 },
  barLabel: { fontSize: 9, color: '#64748B', marginTop: 2 },
});

// ─── FLOATING BUBBLE ─────────────────────────────────────────────────────────
function FloatingBubble({ text, color, index, onTap, answered, isCorrect, isSelected, startDelay, onReachTop }: {
  text: string; color: string; index: number; onTap: () => void;
  answered: boolean; isCorrect: boolean; isSelected: boolean;
  startDelay: number; onReachTop: () => void;
}) {
  const posY = useRef(new Animated.Value(BUBBLE_TRAVEL)).current;
  const wobbleX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const animRef = useRef<any>(null);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleX, { toValue: 8, duration: 1200, useNativeDriver: true }),
        Animated.timing(wobbleX, { toValue: -8, duration: 1200, useNativeDriver: true }),
      ])
    );
    wobble.start();

    setTimeout(() => {
      animRef.current = Animated.timing(posY, {
        toValue: -120,
        duration: BUBBLE_DURATION,
        useNativeDriver: true,
      });
      animRef.current.start(({ finished }) => {
        if (finished && !popped) onReachTop();
      });
    }, startDelay);

    return () => { wobble.stop(); animRef.current?.stop(); };
  }, []);

  useEffect(() => {
    if (!answered) return;
    if (isSelected && isCorrect) {
      animRef.current?.stop();
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true, tension: 200 }),
        Animated.timing(scaleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setPopped(true));
    } else if (isSelected && !isCorrect) {
      animRef.current?.stop();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setPopped(true));
    } else if (!isSelected) {
      animRef.current?.stop();
      Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }
  }, [answered]);

  if (popped) return null;

  const leftPositions = [SCREEN_WIDTH * 0.12, SCREEN_WIDTH * 0.42, SCREEN_WIDTH * 0.68];

  return (
    <Animated.View style={{
      position: 'absolute',
      bottom: 0,
      left: leftPositions[index],
      transform: [{ translateY: posY }, { translateX: wobbleX }, { scale: scaleAnim }],
      opacity: opacityAnim,
      zIndex: 20,
    }}>
      <TouchableOpacity
        onPress={onTap}
        disabled={answered}
        activeOpacity={0.8}
        style={[bStyles.bubble, {
          backgroundColor: isSelected && isCorrect ? '#10B981' : isSelected && !isCorrect ? '#EF4444' : color,
          borderColor: isSelected && isCorrect ? '#34D399' : isSelected && !isCorrect ? '#FCA5A5' : color + 'CC',
        }]}
      >
        <Text style={bStyles.bubbleText}>{text}</Text>
        {isSelected && isCorrect && <Text style={bStyles.bubbleIcon}>✨</Text>}
        {isSelected && !isCorrect && <Text style={bStyles.bubbleIcon}>💥</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const bStyles = StyleSheet.create({
  bubble: {
    width: 100, minHeight: 70, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    padding: 10, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 8,
  },
  bubbleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 17 },
  bubbleIcon: { fontSize: 16, marginTop: 4 },
});

// ─── MATRIX RAIN DIGIT ───────────────────────────────────────────────────────
function MatrixDigit({ left, delay }: { left: number; delay: number }) {
  const posY = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [digit] = useState(() => Math.floor(Math.random() * 10).toString());

  useEffect(() => {
    const animate = () => {
      posY.setValue(-30);
      opacity.setValue(0.8);
      Animated.parallel([
        Animated.timing(posY, { toValue: SCREEN_HEIGHT + 30, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(animate, Math.random() * 5000));
    };
    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.Text style={{
      position: 'absolute', left, color: '#10B98140',
      fontSize: 12, fontWeight: '700', opacity, transform: [{ translateY: posY }],
    }}>{digit}</Animated.Text>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function GraphMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'results'>('playing');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedBubble, setSelectedBubble] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [shuffledQ] = useState(() => {
    const picked = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    return picked.map(orig => {
      // Always take the correct option + 2 random wrong ones, then shuffle.
      const correctText = orig.options[orig.correct];
      const wrongs = orig.options.filter((_, i) => i !== orig.correct);
      const pickedWrong = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
      const newOpts = [correctText, ...pickedWrong].sort(() => Math.random() - 0.5);
      return { ...orig, options: newOpts, correct: newOpts.indexOf(correctText) };
    });
  });
  const [bubbleKey, setBubbleKey] = useState(0);
  const [topReachedCount, setTopReachedCount] = useState(0);

  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  const matrixPositions = useRef(
    Array.from({ length: 18 }, (_, i) => ({ left: i * (SCREEN_WIDTH / 18), delay: i * 300 }))
  ).current;

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

  function handleBubbleTap(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedBubble(index);
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
      advanceQuestion();
    }, 1800);
  }

  function handleBubbleReachTop() {
    if (answered) return;
    setTopReachedCount(c => {
      const next = c + 1;
      // Now there are exactly 3 bubbles; once all 3 have popped off, give the user
      // a 5-second grace window before counting the question as missed.
      if (next >= 3) {
        setTimeout(() => {
          // Re-check: if user tapped during the grace window, answered will be true; bail.
          setAnswered(prevAnswered => {
            if (prevAnswered) return prevAnswered;
            setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
            shakeScreen();
            const q = shuffledQ[currentQ];
            setAnswers(prev => [...prev, {
              question: q.question, domain: q.domain,
              userAnswer: '(missed)', correctAnswer: q.options[q.correct],
              isCorrect: false, isSpeedy: false, pts: 0, explanation: q.explanation,
            }]);
            setQuestionsAnswered(n => n + 1);
            setTimeout(() => {
              if (currentQ + 1 >= shuffledQ.length) { endGame(); return; }
              advanceQuestion();
            }, 1500);
            return true;
          });
        }, 5000);
      }
      return next;
    });
  }

  function advanceQuestion() {
    setCurrentQ(q => q + 1);
    setAnswered(false);
    setSelectedBubble(null);
    setTopReachedCount(0);
    setBubbleKey(k => k + 1);
    setQuestionStartTime(Date.now());
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
    setCurrentQ(0); setAnswered(false); setSelectedBubble(null);
    setLives(3); setScore(0); setTimeLeft(TIMER_DURATION);
    setSpeedyCount(0); setAnswers([]); setQuestionsAnswered(0);
    setQuestionStartTime(Date.now()); setBubbleKey(0); setTopReachedCount(0);
    setGameState('playing');
  }

  const finalScore = questionsAnswered > 0 ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = timeLeft / TIMER_DURATION;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(11, finalScore, xpEarned, 'math_d3', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '📈 Data Master!' : finalScore >= 40 ? '👍 Good Analysis!' : '💪 Keep Studying!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 📈</Text>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewDomain}>{a.domain} · Graph Match</Text>
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
            <Text style={styles.xpGained}>+{xpEarned} XP added to Graph Match</Text>
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

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* MATRIX BACKGROUND */}
        <View style={styles.matrixBg} pointerEvents="none">
          {matrixPositions.map((m, i) => (
            <MatrixDigit key={i} left={m.left} delay={m.delay} />
          ))}
          {/* Grid lines */}
          {[0,1,2,3,4,5,6,7].map(i => (
            <View key={`h${i}`} style={[styles.gridH, { top: `${i * 14}%` as any }]} />
          ))}
          {[0,1,2,3,4,5].map(i => (
            <View key={`v${i}`} style={[styles.gridV, { left: `${i * 20}%` as any }]} />
          ))}
          {/* Neon corner accents */}
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>📈 Graph Match</Text>
            <Text style={styles.gameSubtitle}>D3 · Data Analysis</Text>
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

        {/* GRAPH + QUESTION */}
        <View style={styles.topSection}>
          <View style={styles.graphCard}>
            <View style={styles.graphHeaderRow}>
              <Text style={styles.graphTypeLabel}>📊 {q.graph.type.toUpperCase()}</Text>
              <View style={styles.domainBadge}>
                <Text style={styles.domainText}>{q.domain} · {q.difficulty}</Text>
              </View>
            </View>
            <GraphDisplay graph={q.graph} question={q.question} />
          </View>
          <View style={styles.questionCard}>
            <Text style={styles.catchLabel}>🎯 CATCH THE MATCH</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>
        </View>

        {/* BUBBLE ZONE */}
        <View style={styles.bubbleZone} pointerEvents="box-none">
          <Text style={styles.bubbleHint}>Tap the correct bubble before it escapes! ⬆️</Text>
          {q.options.map((option, index) => (
            <FloatingBubble
              key={`${bubbleKey}-${index}`}
              text={option}
              color={BUBBLE_COLORS[index]}
              index={index}
              onTap={() => handleBubbleTap(index)}
              answered={answered}
              isCorrect={index === q.correct}
              isSelected={selectedBubble === index}
              startDelay={index * 400}
              onReachTop={handleBubbleReachTop}
            />
          ))}
        </View>

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
  safe: { flex: 1, backgroundColor: '#050E1A' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#050E1A' },

  // Matrix BG
  matrixBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 0,
  },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#0A2040' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#0A2040' },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#10B98130' },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#10B98130' },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#10B98130' },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#10B98130' },

  // Header
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 20, gap: 12, zIndex: 10,
  },
  pauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0A1628', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#10B981',
  },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#10B981', fontWeight: '700' },
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
    backgroundColor: '#0A1628CC', borderRadius: 16, padding: 12, zIndex: 10,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#0A2040', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  qCounterBox: {
    backgroundColor: '#10B98120', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: '#10B981',
  },
  qCounter: { fontSize: 14, color: '#10B981', fontWeight: '800' },

  // Top section
  topSection: { paddingHorizontal: 20, zIndex: 10, gap: 8 },
  graphCard: {
    backgroundColor: '#0A1628', borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: '#10B98130',
  },
  graphHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  graphTypeLabel: { fontSize: 11, color: '#10B981', fontWeight: '800', letterSpacing: 1 },
  domainBadge: {
    backgroundColor: '#2563EB20', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#2563EB40',
  },
  domainText: { fontSize: 10, color: '#2563EB', fontWeight: '700' },
  questionCard: {
    backgroundColor: '#0A1628', borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: '#1E3A5F',
  },
  catchLabel: { fontSize: 10, color: '#F97316', fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  questionText: { fontSize: 15, fontWeight: '700', color: '#E2E8F0', lineHeight: 22 },

  // Bubble zone
  bubbleZone: {
    flex: 1, position: 'relative', marginTop: 8,
  },
  bubbleHint: {
    textAlign: 'center', fontSize: 11, color: '#10B98160',
    fontWeight: '600', marginTop: 4, zIndex: 5,
  },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 16 },
  reviewCard: {
    backgroundColor: '#0A1628', borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
  },
  reviewDomain: { fontSize: 11, color: '#10B981', fontWeight: '700', marginBottom: 4 },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: {
    backgroundColor: '#0A1628', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E3A5F',
  },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: {
    flex: 1, backgroundColor: '#050E1A',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#10B981' },
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
    backgroundColor: '#0A1628', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E3A5F',
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#10B981', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#10B981', borderRadius: 50,
    padding: 18, alignItems: 'center', marginVertical: 20,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: {
    backgroundColor: 'transparent', borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 30,
    borderWidth: 2, borderColor: '#1E3A5F',
  },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  pauseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  pauseCard: {
    backgroundColor: '#0A1628', borderRadius: 24,
    padding: 32, width: '82%', alignItems: 'center',
    borderWidth: 1, borderColor: '#10B981',
  },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: {
    width: '100%', padding: 16, borderRadius: 50,
    backgroundColor: '#10B981', alignItems: 'center', marginBottom: 12,
  },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});