import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Animated, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { markDailyComplete, getTodayXP, getStreak } from './storage';

const ALL_GAMES: Record<number, { name: string; emoji: string; color: string }> = {
  1:  { name: 'Word Duel',      emoji: '⚔️',  color: '#2563EB' },
  2:  { name: 'Flip It',        emoji: '🔄',  color: '#1D4ED8' },
  3:  { name: 'Error Hunt',     emoji: '🔍',  color: '#F97316' },
  4:  { name: 'Polish Up',      emoji: '💎',  color: '#EA580C' },
  5:  { name: 'Bridge It',      emoji: '🌉',  color: '#2563EB' },
  6:  { name: 'Speed Read',     emoji: '⚡',  color: '#F97316' },
  7:  { name: 'Deep Dive',      emoji: '🤿',  color: '#1D4ED8' },
  8:  { name: 'Tone Craft',     emoji: '🎭',  color: '#EA580C' },
  9:  { name: 'Shape Snap',     emoji: '🧩',  color: '#2563EB' },
  10: { name: 'Formula Forge',  emoji: '⚒️',  color: '#F97316' },
  11: { name: 'Graph Match',    emoji: '📈',  color: '#1D4ED8' },
  12: { name: 'Data Dash',      emoji: '📊',  color: '#EA580C' },
  13: { name: 'Rapid Fire',     emoji: '🎯',  color: '#2563EB' },
  14: { name: 'Story Solve',    emoji: '📖',  color: '#F97316' },
  15: { name: 'Math Memory',    emoji: '🧠',  color: '#1D4ED8' },
  16: { name: 'Chain Reaction', emoji: '☢️',  color: '#DC2626' },
};

// Firework particle
function Firework({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(translateY, { toValue: -60, duration: 600, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.Text style={{
      position: 'absolute', left: x, top: y,
      fontSize: 24, opacity,
      transform: [{ scale }, { translateY }],
    }}>🎆</Animated.Text>
  );
}

export default function DailyCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const dailyGamesParam = params.dailyGames as string || '';
  const scoresParam = params.scores as string || '';
  const dailyGameIds = dailyGamesParam.split(',').map(Number).filter(Boolean);
  const scores = scoresParam.split(',').map(Number);

  const [todayXP, setTodayXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const titleScale = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const fireworks = [
    { x: 40, y: 80, color: '#F97316', delay: 200 },
    { x: 280, y: 60, color: '#2563EB', delay: 400 },
    { x: 160, y: 100, color: '#10B981', delay: 600 },
    { x: 60, y: 200, color: '#FBBF24', delay: 800 },
    { x: 300, y: 180, color: '#A78BFA', delay: 300 },
    { x: 200, y: 50, color: '#F97316', delay: 700 },
  ];

  useEffect(() => {
    // Mark daily complete and add bonus XP
    markDailyComplete();

    // Load stats
    const load = async () => {
      const xp = await getTodayXP();
      setTodayXP(xp);
      const s = await getStreak();
      setStreak(s);
    };
    load();

    // Entrance animations
    Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 6 }).start();
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: 0, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Fireworks */}
        <View style={styles.fireworksContainer} pointerEvents="none">
          {fireworks.map((fw, i) => (
            <Firework key={i} x={fw.x} y={fw.y} color={fw.color} delay={fw.delay} />
          ))}
        </View>

        {/* Title */}
        <Animated.View style={[styles.titleArea, { transform: [{ scale: titleScale }] }]}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.titleText}>Daily Challenge{'\n'}Complete!</Text>
          <Text style={styles.subtitle}>Amazing work today! 🎉</Text>
        </Animated.View>

        {/* Score Cards */}
        <Animated.View style={[styles.scoresCard, {
          opacity: cardOpacity,
          transform: [{ translateY: cardSlide }],
        }]}>
          <Text style={styles.scoresTitle}>Today's Results</Text>
          {dailyGameIds.map((id, i) => {
            const game = ALL_GAMES[id];
            const score = scores[i] ?? 0;
            const scoreColor = score >= 75 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
            if (!game) return null;
            return (
              <View key={id} style={styles.scoreRow}>
                <View style={[styles.scoreEmoji, { backgroundColor: game.color + '20' }]}>
                  <Text style={styles.scoreEmojiText}>{game.emoji}</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreName}>{game.name}</Text>
                  <View style={styles.scoreBarBg}>
                    <View style={[styles.scoreBarFill, {
                      width: `${score}%` as any,
                      backgroundColor: scoreColor,
                    }]} />
                  </View>
                </View>
                <Text style={[styles.scoreNum, { color: scoreColor }]}>{score}</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsCard, {
          opacity: cardOpacity,
          transform: [{ translateY: cardSlide }],
        }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{totalScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{todayXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </Animated.View>

        {/* Bonus XP notice */}
        <Animated.View style={[styles.bonusCard, { opacity: cardOpacity }]}>
          <Text style={styles.bonusText}>⚡ +20 Bonus XP for completing all 4 challenges!</Text>
        </Animated.View>

        {/* Return to Home button */}
        <Animated.View style={{ opacity: cardOpacity }}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)' as any)}
          >
            <Text style={styles.homeBtnText}>🏠 Return to Home</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20 },
  fireworksContainer: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 300, zIndex: 0,
  },
  titleArea: {
    alignItems: 'center', paddingTop: 80, paddingBottom: 32, zIndex: 1,
  },
  trophy: { fontSize: 64, marginBottom: 12 },
  titleText: {
    fontSize: 36, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', lineHeight: 44,
  },
  subtitle: { fontSize: 18, color: '#F97316', fontWeight: '600', marginTop: 8 },
  scoresCard: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: '#2563EB30',
  },
  scoresTitle: {
    fontSize: 16, fontWeight: '800', color: '#FFFFFF',
    marginBottom: 16, textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, gap: 12,
  },
  scoreEmoji: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreEmojiText: { fontSize: 20 },
  scoreInfo: { flex: 1 },
  scoreName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  scoreBarBg: {
    height: 8, backgroundColor: '#2D2D44',
    borderRadius: 4, overflow: 'hidden',
  },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scoreNum: { fontSize: 18, fontWeight: '900', width: 36, textAlign: 'right' },
  statsCard: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 20, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2563EB30',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: '#2563EB' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#2D2D44' },
  bonusCard: {
    backgroundColor: '#F9731620', borderRadius: 14,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#F97316',
    alignItems: 'center',
  },
  bonusText: { color: '#F97316', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  homeBtn: {
    backgroundColor: '#2563EB', borderRadius: 16,
    padding: 18, alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  homeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});