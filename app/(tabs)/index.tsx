import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { DeviceEventEmitter, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  getDailyGames,
  getTodayXP,
  getStreak,
  getAllGamesTotalXP,
  getGameHistory,
  isDailyComplete,
  markDailyComplete,
} from '../storage';
import { scheduleAllNotifications } from '../notifications';

const ALL_GAMES: Record<number, { id: number; name: string; emoji: string; color: string; desc: string; domain: string; section: 'rw' | 'math' }> = {
  1:  { id: 1,  name: 'Word Duel',      emoji: '⚔️',  color: '#2563EB', desc: 'Vocab in context',           domain: 'D1', section: 'rw' },
  2:  { id: 2,  name: 'Flip It',        emoji: '🔄',  color: '#1D4ED8', desc: 'Choose correct word form',   domain: 'D3', section: 'rw' },
  3:  { id: 3,  name: 'Error Hunt',     emoji: '🔍',  color: '#F97316', desc: 'Find punctuation errors',    domain: 'D3', section: 'rw' },
  4:  { id: 4,  name: 'Polish Up',      emoji: '💎',  color: '#EA580C', desc: 'Refine sentences',           domain: 'D4', section: 'rw' },
  5:  { id: 5,  name: 'Bridge It',      emoji: '🌉',  color: '#2563EB', desc: 'Choose transitions',         domain: 'D4', section: 'rw' },
  6:  { id: 6,  name: 'Speed Read',     emoji: '⚡',  color: '#F97316', desc: 'Speed reading',              domain: 'D2', section: 'rw' },
  7:  { id: 7,  name: 'Deep Dive',      emoji: '🤿',  color: '#1D4ED8', desc: 'Comprehension',              domain: 'D2', section: 'rw' },
  8:  { id: 8,  name: 'Tone Craft',     emoji: '🎭',  color: '#EA580C', desc: 'Expressive writing',         domain: 'D1', section: 'rw' },
  9:  { id: 9,  name: 'Shape Snap',     emoji: '🧩',  color: '#2563EB', desc: 'Geometry & shapes',          domain: 'D4', section: 'math' },
  10: { id: 10, name: 'Formula Forge',  emoji: '⚒️',  color: '#F97316', desc: 'Math formulas',              domain: 'D2', section: 'math' },
  11: { id: 11, name: 'Graph Match',    emoji: '📈',  color: '#1D4ED8', desc: 'Match equations to graphs',  domain: 'D3', section: 'math' },
  12: { id: 12, name: 'Data Dash',      emoji: '📊',  color: '#EA580C', desc: 'Data & statistics',          domain: 'D3', section: 'math' },
  13: { id: 13, name: 'Rapid Fire',     emoji: '🎯',  color: '#2563EB', desc: 'Quick calculations',         domain: 'D1', section: 'math' },
  14: { id: 14, name: 'Story Solve',    emoji: '📖',  color: '#F97316', desc: 'Word problems',              domain: 'D1', section: 'math' },
  15: { id: 15, name: 'Math Memory',    emoji: '🧠',  color: '#1D4ED8', desc: 'Memory & sequences',         domain: 'D2', section: 'math' },
  16: { id: 16, name: 'Chain Reaction', emoji: '☢️',  color: '#DC2626', desc: 'Trig chains & story problems', domain: 'D2', section: 'math' },
};

const GAME_ROUTES: Record<number, string> = {
  1: '/wordduel', 2: '/flipit', 3: '/errorhunt', 4: '/polishup',
  5: '/bridgeit', 6: '/speedread', 7: '/deepdive', 8: '/tonecraft',
  9: '/shapesnap', 10: '/formulaforge', 11: '/graphmatch', 12: '/datadash',
  13: '/rapidfire', 14: '/storysolve', 15: '/mathmemory', 16: '/chainreaction',
};

function getPrecision(allHistory: any[]): string {
  if (allHistory.length === 0) return '--%';
  const avg = allHistory.reduce((sum, r) => sum + r.score, 0) / allHistory.length;
  return `${Math.round(avg)}%`;
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const [dailyGameIds, setDailyGameIds] = useState<number[]>([]);
  const [todayXP, setTodayXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [precision, setPrecision] = useState('--%');
  const [dailyDone, setDailyDone] = useState(false);
  const [playedIds, setPlayedIds] = useState<Set<number>>(new Set());

  // Scroll to top on tab tap
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('scrollToTop_home', () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  // Reload when any game saves its daily_played key (guarantees grayed-out updates).
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('daily_played_changed', () => {
      loadData();
    });
    return () => sub.remove();
  }, []);

  // Reload data every time tab is focused (real-time updates)
  useFocusEffect(useCallback(() => { loadData(); }, []));

  // Web: useFocusEffect can miss tab-internal route changes, so listen to
  // browser focus/visibility/storage events AND poll while the page is visible.
  // Belt-and-suspenders so the daily-played gray-out always updates.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const reload = () => loadData();
    const onVisibility = () => { if (!document.hidden) loadData(); };
    window.addEventListener('focus', reload);
    window.addEventListener('storage', reload);
    window.addEventListener('daily_played_changed', reload as any);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(() => {
      if (!document.hidden) loadData();
    }, 1500);
    return () => {
      window.removeEventListener('focus', reload);
      window.removeEventListener('storage', reload);
      window.removeEventListener('daily_played_changed', reload as any);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(interval);
    };
  }, []);

  async function loadData() {
    const ids = await getDailyGames();
    setDailyGameIds(ids);

    const xp = await getTodayXP();
    setTodayXP(xp);

    const s = await getStreak();
    setStreak(s);

    // Calculate precision from all game history
    const allHistory: any[] = [];
    for (let i = 1; i <= 16; i++) {
      const h = await getGameHistory(i);
      allHistory.push(...h);
    }
    setPrecision(getPrecision(allHistory));

    const done = await isDailyComplete();
    setDailyDone(done);

    const today = new Date().toISOString().split('T')[0];
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const played = new Set<number>();
    for (const id of ids) {
      const v = await AsyncStorage.getItem(`daily_played_${today}_${id}`);
      if (v) played.add(id);
    }
    setPlayedIds(played);
    // Auto-mark daily complete once all 4 are played
    if (ids.length > 0 && played.size === ids.length && !done) {
      await markDailyComplete();
      setDailyDone(true);
    }
  }

  function handleGameTap(gameId: number, index: number) {
    if (dailyDone) return;
    if (playedIds.has(gameId)) return;
    scheduleAllNotifications();
    const route = GAME_ROUTES[gameId];
    if (!route) return;
    router.push({
      pathname: route as any,
      params: {
        isDailyChallenge: '1',
        dailyGames: dailyGameIds.join(','),
        currentIndex: String(index),
      },
    });
  }

  const rwGames = dailyGameIds.map(id => ALL_GAMES[id]).filter(g => g?.section === 'rw');
  const mathGames = dailyGameIds.map(id => ALL_GAMES[id]).filter(g => g?.section === 'math');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CornerMind</Text>
            <Text style={styles.headerSub}>Tutor Corner LLC®</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🔥 {streak}</Text>
          </View>
        </View>

        {/* Hello Message */}
        <View style={styles.helloCard}>
          <Text style={styles.helloText}>{greetEmoji} {greeting}!</Text>
          <Text style={styles.helloSub}>Are you ready for today's challenges? 💪</Text>
        </View>

        {/* Daily Challenge Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>⭐ Today's Challenge</Text>
          <Text style={styles.bannerSub}>2 Reading & Writing + 2 Math • Resets daily</Text>
          {dailyDone && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedBannerText}>✅ Completed! Come back tomorrow for new challenges.</Text>
            </View>
          )}
        </View>

        {/* RW Daily Games */}
        {rwGames.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>📖</Text>
              <Text style={styles.sectionTitle}>Reading & Writing</Text>
            </View>
            {rwGames.map((game) => {
              if (!game) return null;
              const globalIndex = dailyGameIds.indexOf(game.id);
              const isCompleted = playedIds.has(game.id);
              const isCurrent = !isCompleted && !dailyDone;
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.dailyCard, { borderLeftColor: game.color }, isCompleted && styles.dailyCardDone]}
                  onPress={() => handleGameTap(game.id, globalIndex)}
                  activeOpacity={isCompleted ? 1 : 0.7}
                  disabled={isCompleted}
                >
                  <View style={[styles.dailyEmoji, { backgroundColor: game.color + '20' }]}>
                    <Text style={styles.emojiText}>{isCompleted ? '✅' : game.emoji}</Text>
                  </View>
                  <View style={styles.dailyInfo}>
                    <Text style={styles.dailyName}>{game.name}</Text>
                    <Text style={styles.dailyDesc}>{game.desc}</Text>
                  </View>
                  <View style={styles.dailyRight}>
                    <View style={[styles.domainBadge, { backgroundColor: game.color + '25' }]}>
                      <Text style={[styles.domainText, { color: game.color }]}>{game.domain}</Text>
                    </View>
                    <View style={[styles.dailyBadge, { backgroundColor: isCompleted ? '#10B981' : isCurrent ? game.color : '#2D2D44' }]}>
                      <Text style={styles.dailyNum}>{globalIndex + 1}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Math Daily Games */}
        {mathGames.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <Text style={styles.sectionEmoji}>🔢</Text>
              <Text style={styles.sectionTitle}>Math</Text>
            </View>
            {mathGames.map((game) => {
              if (!game) return null;
              const globalIndex = dailyGameIds.indexOf(game.id);
              const isCompleted = playedIds.has(game.id);
              const isCurrent = !isCompleted && !dailyDone;
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.dailyCard, { borderLeftColor: game.color }, isCompleted && styles.dailyCardDone]}
                  onPress={() => handleGameTap(game.id, globalIndex)}
                  activeOpacity={isCompleted ? 1 : 0.7}
                  disabled={isCompleted}
                >
                  <View style={[styles.dailyEmoji, { backgroundColor: game.color + '20' }]}>
                    <Text style={styles.emojiText}>{isCompleted ? '✅' : game.emoji}</Text>
                  </View>
                  <View style={styles.dailyInfo}>
                    <Text style={styles.dailyName}>{game.name}</Text>
                    <Text style={styles.dailyDesc}>{game.desc}</Text>
                  </View>
                  <View style={styles.dailyRight}>
                    <View style={[styles.domainBadge, { backgroundColor: game.color + '25' }]}>
                      <Text style={[styles.domainText, { color: game.color }]}>{game.domain}</Text>
                    </View>
                    <View style={[styles.dailyBadge, { backgroundColor: isCompleted ? '#10B981' : isCurrent ? game.color : '#2D2D44' }]}>
                      <Text style={styles.dailyNum}>{globalIndex + 1}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{todayXP}</Text>
            <Text style={styles.statLabel}>XP Today</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>Streak 🔥</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{precision}</Text>
            <Text style={styles.statLabel}>Precision 🎯</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 50, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  headerBadge: { backgroundColor: '#1A1A2E', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#F9731630' },
  headerBadgeText: { color: '#F97316', fontWeight: '700', fontSize: 14 },
  helloCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2563EB20' },
  helloText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  helloSub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  banner: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2563EB30' },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  completedBanner: { backgroundColor: '#10B98120', borderRadius: 10, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#10B981' },
  completedBannerText: { color: '#10B981', fontSize: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 10 },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  dailyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  dailyCardDone: { opacity: 0.6 },
  dailyEmoji: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emojiText: { fontSize: 22 },
  dailyInfo: { flex: 1, marginLeft: 12 },
  dailyName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  dailyDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  dailyRight: { alignItems: 'center', gap: 6 },
  domainBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  domainText: { fontSize: 11, fontWeight: '700' },
  dailyBadge: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  dailyNum: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  startButton: { backgroundColor: '#2563EB', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 20, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  startButtonDone: { backgroundColor: '#10B981' },
  startButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, alignItems: 'center' },
  statBoxMiddle: { borderWidth: 2, borderColor: '#F9731620' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#2563EB' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
});