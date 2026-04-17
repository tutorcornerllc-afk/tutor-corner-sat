import { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GameResult,
  checkAndUnlockBadges,
  checkPromoCode,
  generateBackupCodeIfNeeded,
  getAllGamesTotalXP,
  getAllGameXPMap,
  getDomainXP,
  getGameBestScore,
  getGameHistory,
  getGamePlayCount,
  getLevel,
  getPercentile,
  getStreak,
  getTodayXP,
  redeemPromoCode,
  setInstallDateIfNeeded,
} from '../storage';
import * as StoreReview from 'expo-store-review';

const { width: SW } = Dimensions.get('window');

const RW_GAMES = [
  { id: 1, name: 'Word Duel', emoji: '⚔️', color: '#2563EB', domain: 'D1', storageKey: 'rw_d1' },
  { id: 2, name: 'Flip It', emoji: '🔄', color: '#1D4ED8', domain: 'D3', storageKey: 'rw_d3' },
  { id: 3, name: 'Error Hunt', emoji: '🔍', color: '#F97316', domain: 'D3', storageKey: 'rw_d3' },
  { id: 4, name: 'Polish Up', emoji: '💎', color: '#EA580C', domain: 'D4', storageKey: 'rw_d4' },
  { id: 5, name: 'Bridge It', emoji: '🌉', color: '#2563EB', domain: 'D4', storageKey: 'rw_d4' },
  { id: 6, name: 'Speed Read', emoji: '⚡', color: '#F97316', domain: 'D2', storageKey: 'rw_d2' },
  { id: 7, name: 'Deep Dive', emoji: '🤿', color: '#1D4ED8', domain: 'D2', storageKey: 'rw_d2' },
  { id: 8, name: 'Tone Craft', emoji: '🎭', color: '#EA580C', domain: 'D1', storageKey: 'rw_d1' },
];

const MATH_GAMES = [
  { id: 9, name: 'Shape Snap', emoji: '🧩', color: '#2563EB', domain: 'D4', storageKey: 'math_d4' },
  { id: 10, name: 'Formula Forge', emoji: '⚒️', color: '#F97316', domain: 'D2', storageKey: 'math_d2' },
  { id: 11, name: 'Graph Match', emoji: '📈', color: '#1D4ED8', domain: 'D3', storageKey: 'math_d3' },
  { id: 12, name: 'Data Dash', emoji: '📊', color: '#EA580C', domain: 'D3', storageKey: 'math_d3' },
  { id: 13, name: 'Rapid Fire', emoji: '🎯', color: '#2563EB', domain: 'D1', storageKey: 'math_d1' },
  { id: 14, name: 'Story Solve', emoji: '📖', color: '#F97316', domain: 'D1', storageKey: 'math_d1' },
  { id: 15, name: 'Math Memory', emoji: '🧠', color: '#1D4ED8', domain: 'D2', storageKey: 'math_d2' },
  { id: 16, name: 'Chain Reaction', emoji: '☢️', color: '#DC2626', domain: 'D2', storageKey: 'math_d2' },
];

const RW_DOMAINS = [
  { id: 1, name: 'Craft & Structure', short: 'D1', color: '#2563EB', key: 'rw_d1' },
  { id: 2, name: 'Information & Ideas', short: 'D2', color: '#F97316', key: 'rw_d2' },
  { id: 3, name: 'Standard English', short: 'D3', color: '#1D4ED8', key: 'rw_d3' },
  { id: 4, name: 'Expression of Ideas', short: 'D4', color: '#EA580C', key: 'rw_d4' },
];

const MATH_DOMAINS = [
  { id: 1, name: 'Algebra', short: 'D1', color: '#2563EB', key: 'math_d1' },
  { id: 2, name: 'Advanced Math', short: 'D2', color: '#F97316', key: 'math_d2' },
  { id: 3, name: 'Problem Solving & Data', short: 'D3', color: '#1D4ED8', key: 'math_d3' },
  { id: 4, name: 'Geometry & Trig', short: 'D4', color: '#EA580C', key: 'math_d4' },
];

const LEVEL_CHECKPOINTS = [
  { pts: 0, label: 'B', color: '#6B7280' },
  { pts: 1001, label: 'I', color: '#3B82F6' },
  { pts: 2001, label: 'A', color: '#8B5CF6' },
  { pts: 3301, label: 'Ex', color: '#F59E0B' },
  { pts: 4001, label: 'El', color: '#EF4444' },
  { pts: 4701, label: 'M', color: '#10B981' },
];

const MAX_PTS = 5000;

const LEVELS = [
  { name: 'Beginner', min: 0, max: 1000, color: '#6B7280' },
  { name: 'Intermediate', min: 1001, max: 2000, color: '#3B82F6' },
  { name: 'Advanced', min: 2001, max: 3300, color: '#8B5CF6' },
  { name: 'Expert', min: 3301, max: 4000, color: '#F59E0B' },
  { name: 'Elite', min: 4001, max: 4700, color: '#EF4444' },
  { name: 'Master', min: 4701, max: 99999, color: '#10B981' },
];

const RW_ACHIEVEMENTS = [
  { min: 0, max: 500, name: 'Rookie Scribe', avatar: '📜', desc: 'Still figuring out where the period goes' },
  { min: 501, max: 1000, name: 'Word Squire', avatar: '⚔️', desc: 'Getting dangerous with a dictionary' },
  { min: 1001, max: 2000, name: 'Vocab Viking', avatar: '🪖', desc: 'Pillaging wrong answers everywhere' },
  { min: 2001, max: 3300, name: 'Syntax Samurai', avatar: '🥷', desc: 'Cutting through sentences with precision' },
  { min: 3301, max: 4000, name: 'Grammar Gladiator', avatar: '🛡️', desc: 'Fighting errors to the death' },
  { min: 4001, max: 4700, name: 'Eloquence Elite', avatar: '👑', desc: 'Words bow before you' },
  { min: 4701, max: 99999, name: 'Legendary Lexicon', avatar: '🐉', desc: 'You ARE the SAT' },
];

const MATH_ACHIEVEMENTS = [
  { min: 0, max: 500, name: 'Counting Cadet', avatar: '🔢', desc: '2+2 is still a challenge' },
  { min: 501, max: 1000, name: 'Number Knight', avatar: '⚔️', desc: 'Slaying basic equations' },
  { min: 1001, max: 2000, name: 'Formula Warrior', avatar: '🧪', desc: 'Armed and algebraic' },
  { min: 2001, max: 3300, name: 'Equation Assassin', avatar: '🥷', desc: 'Solving silently, striking fast' },
  { min: 3301, max: 4000, name: 'Calculus Commander', avatar: '🎖️', desc: 'Leading the charge on derivatives' },
  { min: 4001, max: 4700, name: 'Math Monarch', avatar: '👑', desc: 'The kingdom of math is yours' },
  { min: 4701, max: 99999, name: 'Infinite Legend', avatar: '🐉', desc: 'You ARE the math' },
];

const BADGES = [
  { id: 1, icon: '🏅', name: 'First Step', desc: 'Complete any game', category: 'Games', target: 1, field: 'gamesPlayed' },
  { id: 2, icon: '🎯', name: 'Game Explorer', desc: 'Play 8 different games', category: 'Games', target: 8, field: 'uniqueGames' },
  { id: 3, icon: '🌟', name: 'Game Master', desc: 'Play all 16 games', category: 'Games', target: 16, field: 'uniqueGames' },
  { id: 4, icon: '🔁', name: 'Dedicated', desc: 'Play any game 10 times', category: 'Games', target: 10, field: 'maxPlays' },
  { id: 5, icon: '💪', name: 'Committed', desc: 'Play any game 25 times', category: 'Games', target: 25, field: 'maxPlays' },
  { id: 6, icon: '⚡', name: 'Quick Draw', desc: 'Get 3 speedy answers in one game', category: 'Speed', target: 3, field: 'speedyAnswers' },
  { id: 7, icon: '🚀', name: 'Speed Demon', desc: 'Get 5 speedy answers in one game', category: 'Speed', target: 5, field: 'speedyAnswers' },
  { id: 8, icon: '💨', name: 'Lightning', desc: 'Get 8 speedy answers in one game', category: 'Speed', target: 8, field: 'speedyAnswers' },
  { id: 9, icon: '✨', name: 'Sharp', desc: 'Score 80+ in any game', category: 'Score', target: 80, field: 'topScore' },
  { id: 10, icon: '💎', name: 'Perfectionist', desc: 'Score 100 in any game', category: 'Score', target: 100, field: 'topScore' },
  { id: 11, icon: '👑', name: 'Flawless', desc: 'Score 100 three times', category: 'Score', target: 3, field: 'perfect100s' },
  { id: 12, icon: '🌱', name: 'Rising Star', desc: 'Earn 100 total XP', category: 'XP', target: 100, field: 'totalXP' },
  { id: 13, icon: '⭐', name: 'Scholar', desc: 'Earn 500 total XP', category: 'XP', target: 500, field: 'totalXP' },
  { id: 14, icon: '🌟', name: 'Honor Roll', desc: 'Earn 1000 total XP', category: 'XP', target: 1000, field: 'totalXP' },
  { id: 15, icon: '🎓', name: 'Academic', desc: 'Earn 2500 total XP', category: 'XP', target: 2500, field: 'totalXP' },
  { id: 16, icon: '👑', name: 'Elite Scholar', desc: 'Earn 4000 total XP', category: 'XP', target: 4000, field: 'totalXP' },
  { id: 17, icon: '🐉', name: 'Legend', desc: 'Earn 4700+ total XP', category: 'XP', target: 4700, field: 'totalXP' },
  { id: 18, icon: '🔥', name: 'Spark', desc: '3 day streak', category: 'Streak', target: 3, field: 'streak' },
  { id: 19, icon: '🔥', name: 'Blazing', desc: '7 day streak', category: 'Streak', target: 7, field: 'streak' },
  { id: 20, icon: '🔥', name: 'Inferno', desc: '14 day streak', category: 'Streak', target: 14, field: 'streak' },
  { id: 21, icon: '☀️', name: 'Unstoppable', desc: '30 day streak', category: 'Streak', target: 30, field: 'streak' },
  { id: 22, icon: '📝', name: 'Craft Master', desc: 'Reach 2000 in RW D1', category: 'Domain', target: 2000, field: 'rwD1' },
  { id: 23, icon: '💡', name: 'Idea Machine', desc: 'Reach 2000 in RW D2', category: 'Domain', target: 2000, field: 'rwD2' },
  { id: 24, icon: '✏️', name: 'Grammar Guru', desc: 'Reach 2000 in RW D3', category: 'Domain', target: 2000, field: 'rwD3' },
  { id: 25, icon: '🎨', name: 'Expression Expert', desc: 'Reach 2000 in RW D4', category: 'Domain', target: 2000, field: 'rwD4' },
  { id: 26, icon: '➕', name: 'Algebra Ace', desc: 'Reach 2000 in Math D1', category: 'Domain', target: 2000, field: 'mD1' },
  { id: 27, icon: '📐', name: 'Math Wizard', desc: 'Reach 2000 in Math D2', category: 'Domain', target: 2000, field: 'mD2' },
  { id: 28, icon: '📊', name: 'Data Detective', desc: 'Reach 2000 in Math D3', category: 'Domain', target: 2000, field: 'mD3' },
  { id: 29, icon: '📏', name: 'Geometry Giant', desc: 'Reach 2000 in Math D4', category: 'Domain', target: 2000, field: 'mD4' },
  { id: 30, icon: '🌅', name: 'Early Bird', desc: 'Complete daily challenge 7 days', category: 'Challenge', target: 7, field: 'dailyStreak' },
  { id: 31, icon: '🎯', name: "Bull's Eye", desc: 'Get 100% on daily 3 times', category: 'Challenge', target: 3, field: 'perfectDaily' },
  { id: 32, icon: '🏃', name: 'Marathon', desc: 'Play 5 games in one session', category: 'Challenge', target: 5, field: 'sessionGames' },
  { id: 33, icon: '🎪', name: 'Jack of All', desc: 'Score 70+ in every game', category: 'Special', target: 16, field: 'games70plus' },
  { id: 34, icon: '🌍', name: 'Well Rounded', desc: 'Earn XP in every domain', category: 'Special', target: 8, field: 'domainsWithXP' },
  { id: 35, icon: '🔬', name: 'Analyst', desc: 'Complete Data Dash 20 times', category: 'Special', target: 20, field: 'dataDash' },
  { id: 36, icon: '📚', name: 'Bookworm', desc: 'Complete Deep Dive 20 times', category: 'Special', target: 20, field: 'deepDive' },
  { id: 37, icon: '⚔️', name: 'Word Warrior', desc: 'Complete Word Duel 20 times', category: 'Special', target: 20, field: 'wordDuel' },
];

const BADGE_CATEGORIES = ['All', 'Games', 'Speed', 'Score', 'XP', 'Streak', 'Domain', 'Challenge', 'Special'];

function getLevelFromPts(pts: number) {
  return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0];
}

function getAchievement(pts: number, list: any[]) {
  return list.find(a => pts >= a.min && pts <= a.max) || list[0];
}

// ─── LINE GRAPH ───────────────────────────────────────────────────────────────
function LineGraph({ scores }: { scores: number[] }) {
  if (scores.length === 0) return (
    <View style={styles.graphEmpty}>
      <Text style={styles.graphEmptyText}>Play this game to see your history!</Text>
    </View>
  );

  const graphW = SW - 100;
  const graphH = 80;
  const max = 100;

  const points = scores.slice(-10).map((s, i, arr) => ({
    x: arr.length === 1 ? graphW / 2 : (i / (arr.length - 1)) * graphW,
    y: graphH - (s / max) * graphH,
    score: s,
  }));

  return (
    <View style={[styles.graphContainer, { width: graphW, height: graphH + 20 }]}>
      {/* Connecting lines */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const score = p.score;
        const lineColor = score >= 75 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
        return (
          <View key={i} style={{
            position: 'absolute',
            left: p.x, top: p.y,
            width: len, height: 2,
            backgroundColor: lineColor,
            transform: [{ rotate: `${angle}deg` }],
            transformOrigin: '0 50%',
          }} />
        );
      })}
      {/* Dots */}
      {points.map((p, i) => {
        const dotColor = p.score >= 75 ? '#10B981' : p.score >= 40 ? '#F59E0B' : '#EF4444';
        return (
          <View key={i} style={{
            position: 'absolute',
            left: p.x - 5, top: p.y - 5,
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: dotColor,
            borderWidth: 2, borderColor: '#0F0F1A',
          }} />
        );
      })}
    </View>
  );
}

// ─── LEVEL BAR ────────────────────────────────────────────────────────────────
function LevelBar({ pts, color }: { pts: number; color: string }) {
  const progress = Math.min(pts / MAX_PTS, 1);
  const level = getLevelFromPts(pts);
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={styles.barBg}>
        <View style={[styles.barFill, {
          width: `${Math.max(progress * 100, 1)}%` as any,
          backgroundColor: color,
        }]} />
        {LEVEL_CHECKPOINTS.slice(1).map((cp, i) => (
          <View key={i} style={[styles.barMarker, { left: `${(cp.pts / MAX_PTS) * 100}%` as any }]} />
        ))}
      </View>
      <View style={styles.barLabelRow}>
        {LEVEL_CHECKPOINTS.map((cp, i) => (
          <Text key={i} style={[styles.barLabel, {
            left: `${(cp.pts / MAX_PTS) * 100}%` as any,
            color: cp.color,
          }]}>{cp.label}</Text>
        ))}
      </View>
      <Text style={[styles.levelNameText, { color: level.color }]}>{level.name} • {pts} pts</Text>
    </View>
  );
}

// ─── BADGE CARD ───────────────────────────────────────────────────────────────
function BadgeCard({ badge, progress }: { badge: any; progress: number }) {
  const earned = progress >= badge.target;
  const pct = Math.min(progress / badge.target, 1);
  return (
    <View style={[styles.badgeCard, earned && styles.badgeEarned]}>
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, earned && styles.badgeNameEarned]}>{badge.name}</Text>
        <Text style={styles.badgeDesc}>{badge.desc}</Text>
        <View style={styles.badgeBarBg}>
          <View style={[styles.badgeBarFill, {
            width: `${pct * 100}%` as any,
            backgroundColor: earned ? '#10B981' : '#2563EB',
          }]} />
        </View>
        <Text style={styles.badgeProgress}>{earned ? '✅ Earned!' : `${progress} / ${badge.target}`}</Text>
      </View>
      {!earned && <Text style={styles.badgeLock}>🔒</Text>}
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [badgeCategory, setBadgeCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Real data from storage
  const [totalXP, setTotalXP] = useState(0);
  const [gameXPMap, setGameXPMap] = useState<Record<number, number>>({});
  const [domainXP, setDomainXP] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [todayXP, setTodayXP] = useState(0);
  const [gameHistoryMap, setGameHistoryMap] = useState<Record<number, GameResult[]>>({});
  const [gameBestMap, setGameBestMap] = useState<Record<number, number>>({});
  const [gamePlayMap, setGamePlayMap] = useState<Record<number, number>>({});

  // Modal game data
  const [modalScores, setModalScores] = useState<number[]>([]);
  const [modalBest, setModalBest] = useState(0);
  const [modalXP, setModalXP] = useState(0);
  const [modalPlays, setModalPlays] = useState(0);

  useEffect(() => {
    setInstallDateIfNeeded();
    loadAllData();
  }, []);

  async function loadAllData() {
    const xp = await getAllGamesTotalXP();
    setTotalXP(xp);

    const xpMap = await getAllGameXPMap();
    setGameXPMap(xpMap);

    const domains = ['rw_d1','rw_d2','rw_d3','rw_d4','math_d1','math_d2','math_d3','math_d4'];
    const dMap: Record<string, number> = {};
    for (const d of domains) {
      dMap[d] = await getDomainXP(d);
    }
    setDomainXP(dMap);

    const s = await getStreak();
    setStreak(s);

    const todayVal = await getTodayXP();
    setTodayXP(todayVal);

    // Load history/best/plays for all games
    const histMap: Record<number, GameResult[]> = {};
    const bestMap: Record<number, number> = {};
    const playMap: Record<number, number> = {};
    for (let i = 1; i <= 16; i++) {
      histMap[i] = await getGameHistory(i);
      bestMap[i] = await getGameBestScore(i);
      playMap[i] = await getGamePlayCount(i);
    }
    setGameHistoryMap(histMap);
    setGameBestMap(bestMap);
    setGamePlayMap(playMap);

    await checkAndUnlockBadges();
    const code = await generateBackupCodeIfNeeded();
    setBackupCode(code);
  }

  async function openGameModal(game: any) {
    setSelectedGame(game);
    const history = gameHistoryMap[game.id] || [];
    setModalScores(history.map(r => r.score));
    setModalBest(gameBestMap[game.id] || 0);
    setModalXP(gameXPMap[game.id] || 0);
    setModalPlays(gamePlayMap[game.id] || 0);
  }

  // Compute stats for badges
  const allHistory: GameResult[] = Object.values(gameHistoryMap).flat();
  const gamesPlayed = allHistory.length;
  const uniqueGames = new Set(allHistory.map(r => r.gameId)).size;
  const topScore = allHistory.length > 0 ? Math.max(...allHistory.map(r => r.score)) : 0;
  const perfect100s = allHistory.filter(r => r.score >= 100).length;
  const maxSpeedy = allHistory.length > 0 ? Math.max(...allHistory.map(r => r.speedy || 0)) : 0;
  const maxPlays = Object.values(gamePlayMap).length > 0 ? Math.max(...Object.values(gamePlayMap)) : 0;
  const domainsWithXP = Object.values(domainXP).filter(v => v > 0).length;
  const wordDuelPlays = gamePlayMap[1] || 0;
  const deepDivePlays = gamePlayMap[7] || 0;
  const dataDashPlays = gamePlayMap[12] || 0;

  const stats: Record<string, number> = {
    gamesPlayed, uniqueGames, maxPlays, totalPlays: gamesPlayed,
    speedyAnswers: maxSpeedy, topScore, perfect100s,
    totalXP, streak,
    rwD1: domainXP['rw_d1'] || 0,
    rwD2: domainXP['rw_d2'] || 0,
    rwD3: domainXP['rw_d3'] || 0,
    rwD4: domainXP['rw_d4'] || 0,
    mD1: domainXP['math_d1'] || 0,
    mD2: domainXP['math_d2'] || 0,
    mD3: domainXP['math_d3'] || 0,
    mD4: domainXP['math_d4'] || 0,
    domainsWithXP, wordDuel: wordDuelPlays,
    deepDive: deepDivePlays, dataDash: dataDashPlays,
    dailyStreak: 0, perfectDaily: 0, sessionGames: 0, games70plus: 0,
  };

  const rwTotal = (domainXP['rw_d1'] || 0) + (domainXP['rw_d2'] || 0) + (domainXP['rw_d3'] || 0) + (domainXP['rw_d4'] || 0);
  const mathTotal = (domainXP['math_d1'] || 0) + (domainXP['math_d2'] || 0) + (domainXP['math_d3'] || 0) + (domainXP['math_d4'] || 0);
  const overallLevel = getLevelFromPts(totalXP);
  const rwAchievement = getAchievement(rwTotal, RW_ACHIEVEMENTS);
  const mathAchievement = getAchievement(mathTotal, MATH_ACHIEVEMENTS);
  const percentile = getPercentile(totalXP);
  const levelLabel = getLevel(totalXP);

  const filteredBadges = badgeCategory === 'All' ? BADGES : BADGES.filter(b => b.category === badgeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSub}>Tutor Corner Experience Score</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statsPill}>
            <Text style={styles.statsNum}>🔥 {streak}</Text>
            <Text style={styles.statsLabel}>Streak</Text>
          </View>
          <View style={styles.statsPill}>
            <Text style={styles.statsNum}>⚡ {todayXP}</Text>
            <Text style={styles.statsLabel}>Today XP</Text>
          </View>
          <View style={styles.statsPill}>
            <Text style={styles.statsNum}>🎮 {gamesPlayed}</Text>
            <Text style={styles.statsLabel}>Played</Text>
          </View>
        </View>

        {/* TCES Bubble */}
        <View style={styles.tcesBubble}>
          <Text style={styles.tcesLabel}>TCES</Text>
          <Text style={styles.tcesScore}>{totalXP}</Text>
          <View style={[styles.levelPill, { backgroundColor: overallLevel.color + '25' }]}>
            <Text style={[styles.levelPillText, { color: overallLevel.color }]}>{levelLabel}</Text>
          </View>
          <Text style={styles.tcesRank}>{percentile} of all players</Text>
        </View>

        {/* Reading & Writing Card */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectEmoji}>📖</Text>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectTitle}>Reading & Writing</Text>
              <Text style={styles.subjectPts}>{rwTotal} pts total</Text>
            </View>
            <Text style={styles.achievementAvatar}>{rwAchievement.avatar}</Text>
          </View>
          <Text style={styles.achievementName}>{rwAchievement.name}</Text>
          <Text style={styles.achievementDesc}>{rwAchievement.desc}</Text>

          <Text style={styles.sectionLabel}>Games — tap for history</Text>
          <View style={styles.bubblesRow}>
            {RW_GAMES.map(game => (
              <TouchableOpacity
                key={game.id}
                style={[styles.bubble, { backgroundColor: game.color }]}
                onPress={() => openGameModal(game)}
              >
                <Text style={styles.bubbleLetter}>{game.name[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Game Progress</Text>
          {RW_GAMES.map(game => (
            <View key={game.id} style={styles.gameBarRow}>
              <Text style={styles.gameBarEmoji}>{game.emoji}</Text>
              <View style={styles.gameBarInfo}>
                <Text style={styles.gameBarName}>{game.name}</Text>
                <LevelBar pts={gameXPMap[game.id] || 0} color={game.color} />
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>Domain Progress</Text>
          {RW_DOMAINS.map(domain => (
            <View key={domain.id} style={styles.gameBarRow}>
              <View style={[styles.domainBadge, { backgroundColor: domain.color + '25' }]}>
                <Text style={[styles.domainShort, { color: domain.color }]}>{domain.short}</Text>
              </View>
              <View style={styles.gameBarInfo}>
                <Text style={styles.gameBarName}>{domain.name}</Text>
                <LevelBar pts={domainXP[domain.key] || 0} color={domain.color} />
              </View>
            </View>
          ))}
        </View>

        {/* Math Card */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectEmoji}>🔢</Text>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectTitle}>Math</Text>
              <Text style={styles.subjectPts}>{mathTotal} pts total</Text>
            </View>
            <Text style={styles.achievementAvatar}>{mathAchievement.avatar}</Text>
          </View>
          <Text style={styles.achievementName}>{mathAchievement.name}</Text>
          <Text style={styles.achievementDesc}>{mathAchievement.desc}</Text>

          <Text style={styles.sectionLabel}>Games — tap for history</Text>
          <View style={styles.bubblesRow}>
            {MATH_GAMES.map(game => (
              <TouchableOpacity
                key={game.id}
                style={[styles.bubble, { backgroundColor: game.color }]}
                onPress={() => openGameModal(game)}
              >
                <Text style={styles.bubbleLetter}>{game.name[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Game Progress</Text>
          {MATH_GAMES.map(game => (
            <View key={game.id} style={styles.gameBarRow}>
              <Text style={styles.gameBarEmoji}>{game.emoji}</Text>
              <View style={styles.gameBarInfo}>
                <Text style={styles.gameBarName}>{game.name}</Text>
                <LevelBar pts={gameXPMap[game.id] || 0} color={game.color} />
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>Domain Progress</Text>
          {MATH_DOMAINS.map(domain => (
            <View key={domain.id} style={styles.gameBarRow}>
              <View style={[styles.domainBadge, { backgroundColor: domain.color + '25' }]}>
                <Text style={[styles.domainShort, { color: domain.color }]}>{domain.short}</Text>
              </View>
              <View style={styles.gameBarInfo}>
                <Text style={styles.gameBarName}>{domain.name}</Text>
                <LevelBar pts={domainXP[domain.key] || 0} color={domain.color} />
              </View>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.badgesTitle}>🏅 Badges</Text>
          <Text style={styles.badgesSub}>{BADGES.length} total</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {BADGE_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, badgeCategory === cat && styles.categoryBtnActive]}
                onPress={() => setBadgeCategory(cat)}
              >
                <Text style={[styles.categoryText, badgeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filteredBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} progress={stats[badge.field] || 0} />
          ))}
        </View>

      </ScrollView>

      {/* ── GAME HISTORY MODAL ── */}
      <Modal visible={!!selectedGame} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedGame(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedGame?.emoji} {selectedGame?.name}</Text>
            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatNum}>{modalBest > 0 ? modalBest : '---'}</Text>
                <Text style={styles.modalStatLabel}>Best Score</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatNum}>{modalXP}</Text>
                <Text style={styles.modalStatLabel}>Total XP</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatNum}>{modalPlays}</Text>
                <Text style={styles.modalStatLabel}>Games Played</Text>
              </View>
            </View>
            <Text style={styles.modalGraphLabel}>Score History</Text>
            <LineGraph scores={modalScores} />
            <Text style={styles.modalDomain}>Domain: {selectedGame?.domain}</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedGame(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── SETTINGS MODAL ── */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚙️ Settings</Text>

            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowSubscription(true), 300); }}>
              <Text style={styles.settingsRowIcon}>👑</Text>
              <Text style={styles.settingsRowText}>Subscription & Plans</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowBackup(true), 300); }}>
              <Text style={styles.settingsRowIcon}>🔑</Text>
              <Text style={styles.settingsRowText}>Backup & Restore Code</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('https://tutorcornerllc.com/contact-us')}>
              <Text style={styles.settingsRowIcon}>🗓️</Text>
              <Text style={styles.settingsRowText}>Book a Tutor Session</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('mailto:admin@tutorcornerllc.com?subject=Tutor Corner SAT Support')}>
              <Text style={styles.settingsRowIcon}>📧</Text>
              <Text style={styles.settingsRowText}>Contact Us</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowPrivacy(true), 300); }}>
              <Text style={styles.settingsRowIcon}>📋</Text>
              <Text style={styles.settingsRowText}>Privacy Policy</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowTerms(true), 300); }}>
              <Text style={styles.settingsRowIcon}>📄</Text>
              <Text style={styles.settingsRowText}>Terms of Service</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>

            <Text style={styles.settingsVersion}>Tutor Corner SAT v1.0.0{'\n'}© 2025 Tutor Corner LLC</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── BACKUP CODE MODAL ── */}
      <Modal visible={showBackup} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBackup(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Backup Code</Text>
            <Text style={styles.backupDesc}>Save this code to restore your progress on a new device.</Text>
            <View style={styles.backupCodeBox}>
              <Text style={styles.backupCodeText}>{backupCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={() => setCopied(true)}>
              <Text style={styles.copyBtnText}>{copied ? '✅ Copied!' : '📋 Copy Code'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalClose, { marginTop: 8 }]} onPress={() => { setShowBackup(false); setCopied(false); }}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── PRIVACY MODAL ── */}
      <Modal visible={showPrivacy} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPrivacy(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📋 Privacy Policy</Text>
              <Text style={styles.legalText}>{`PRIVACY POLICY — Tutor Corner LLC\n\nLast updated: 2025\n\nData Collection:\nWe collect game scores and progress data stored locally on your device only. We do not collect personal information. We do not sell data to third parties.\n\nNo Liability:\nTutor Corner SAT is provided as an educational tool only. We make no guarantee of SAT score improvement. Results vary by individual effort and preparation.\n\nTechnical Issues:\nTutor Corner LLC is not liable for data loss, app crashes, or technical issues that may affect your progress or purchases.\n\nContact: admin@tutorcornerllc.com`}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowPrivacy(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── TERMS MODAL ── */}
      <Modal visible={showTerms} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTerms(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📄 Terms of Service</Text>
              <Text style={styles.legalText}>{`TERMS OF SERVICE — Tutor Corner LLC\n\nLast updated: 2025\n\nAcceptance:\nBy using this app you agree to these terms.\n\nSubscriptions:\nMonthly and yearly subscriptions auto-renew. Cancel anytime in App Store settings. No refund for current billing period.\n\nLifetime Purchase:\nLifetime access applies to the current version of Tutor Corner SAT. Tutor Corner LLC reserves the right to modify, update, or discontinue features at any time without notice. Lifetime purchase is non-refundable.\n\nNo Guarantee:\nThis app does not guarantee any specific SAT score outcome. Educational results depend on individual effort, consistency, and preparation.\n\nModifications:\nWe reserve the right to change these terms, pricing, or app features at any time.\n\nContact: admin@tutorcornerllc.com`}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowTerms(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
            {/* SUBSCRIPTION MODAL */}
      <Modal visible={showSubscription} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubscription(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>👑 Unlock Full Access</Text>
              <Text style={[styles.legalText, { color: '#9CA3AF', marginBottom: 16 }]}>Choose a plan to unlock all 16 games</Text>

              {/* Monthly */}
              <View style={styles.planCard}>
                <View style={styles.planBadge}><Text style={styles.planBadgeText}>Most Flexible</Text></View>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planPrice}>$9.99/month</Text>
                <Text style={styles.planFeature}>✅ All 16 games unlimited</Text>
                <Text style={styles.planFeature}>✅ Cancel anytime</Text>
                <Text style={styles.planFeature}>✅ Full progress tracking</Text>
                <TouchableOpacity style={styles.planBtn} onPress={() => alert('Coming soon — payment via App Store')}>
                  <Text style={styles.planBtnText}>Start Monthly — $9.99/mo</Text>
                </TouchableOpacity>
              </View>

              {/* Yearly */}
              <View style={[styles.planCard, styles.planCardHighlight]}>
                <View style={[styles.planBadge, { backgroundColor: '#F97316' }]}><Text style={styles.planBadgeText}>Best Value 🌟</Text></View>
                <Text style={styles.planName}>Yearly</Text>
                <Text style={styles.planPrice}>$99.99/year</Text>
                <Text style={styles.planSave}>Save 17% vs monthly</Text>
                <Text style={styles.planFeature}>✅ Everything in Monthly</Text>
                <Text style={styles.planFeature}>✅ 2 months FREE</Text>
                <TouchableOpacity style={[styles.planBtn, { backgroundColor: '#F97316' }]} onPress={() => alert('Coming soon — payment via App Store')}>
                  <Text style={styles.planBtnText}>Start Annual — $99.99/yr</Text>
                </TouchableOpacity>
              </View>

              {/* Lifetime */}
              <View style={styles.planCard}>
                <View style={[styles.planBadge, { backgroundColor: '#8B5CF6' }]}><Text style={styles.planBadgeText}>Own Forever</Text></View>
                <Text style={styles.planName}>Lifetime</Text>
                <Text style={styles.planPrice}>$399.99</Text>
                <Text style={styles.planFeature}>✅ One payment ever</Text>
                <Text style={styles.planFeature}>✅ All future subjects included</Text>
                <TouchableOpacity style={[styles.planBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => alert('Coming soon — payment via App Store')}>
                  <Text style={styles.planBtnText}>Get Lifetime — $399.99</Text>
                </TouchableOpacity>
              </View>

              {/* Promo Code */}
              <View style={styles.promoBox}>
                <Text style={styles.promoLabel}>Have a promo code?</Text>
                <View style={styles.promoRow}>
                  <TextInput
                    style={styles.promoTextInput}
                    placeholder="Enter promo code"
                    placeholderTextColor="#6B7280"
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.promoInputBtn}
                    onPress={() => {
                      const code = promoCode.trim();
                      if (!code) { setPromoMessage('Enter a code first'); return; }
                      const plan = checkPromoCode(code);
                      if (!plan) { setPromoMessage('❌ Invalid code'); return; }
                      redeemPromoCode(code).then(() => {
                        setPromoMessage(`✅ Code applied! Enjoy ${plan} access!`);
                        setTimeout(() => setShowSubscription(false), 2000);
                      });
                    }}
                  >
                    <Text style={styles.promoApplyText}>Apply</Text>
                  </TouchableOpacity>
                </View>
                {promoMessage ? <Text style={styles.promoMessage}>{promoMessage}</Text> : null}
              </View>

              <Text style={styles.legalText}>By subscribing you agree to our Terms of Service. Lifetime purchase provides access to current app. Tutor Corner LLC reserves the right to modify the app. No refunds after purchase. Cancel monthly/yearly anytime from App Store settings. No guarantee of SAT score improvement.</Text>

            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSubscription(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 50, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  settingsIcon: { fontSize: 22 },
  statsStrip: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statsPill: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D2D44' },
  statsNum: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  statsLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  tcesBubble: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2563EB30' },
  tcesLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '600', letterSpacing: 2 },
  tcesScore: { fontSize: 48, fontWeight: '900', color: '#2563EB', marginTop: 4 },
  levelPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  levelPillText: { fontSize: 14, fontWeight: '700' },
  tcesRank: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  subjectCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 16, marginBottom: 16 },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  subjectEmoji: { fontSize: 28 },
  subjectInfo: { flex: 1 },
  subjectTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  subjectPts: { fontSize: 13, color: '#9CA3AF' },
  achievementAvatar: { fontSize: 32 },
  achievementName: { fontSize: 15, fontWeight: '700', color: '#F97316', marginBottom: 2 },
  achievementDesc: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 12 },
  sectionLabel: { fontSize: 12, color: '#6B7280', marginBottom: 8, marginTop: 4 },
  bubblesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  bubble: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bubbleLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  gameBarRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  gameBarEmoji: { fontSize: 20, marginTop: 2 },
  gameBarInfo: { flex: 1 },
  gameBarName: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  barBg: { height: 10, backgroundColor: '#2D2D44', borderRadius: 5, overflow: 'visible', position: 'relative', marginBottom: 2 },
  barFill: { position: 'absolute', height: 10, borderRadius: 5 },
  barMarker: { position: 'absolute', width: 2, height: 14, backgroundColor: '#0F0F1A', top: -2 },
  barLabelRow: { position: 'relative', height: 14, marginBottom: 2 },
  barLabel: { position: 'absolute', fontSize: 9, fontWeight: '700' },
  levelNameText: { fontSize: 11, fontWeight: '600' },
  domainBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 2 },
  domainShort: { fontSize: 11, fontWeight: '700' },
  badgesSection: { marginBottom: 32 },
  badgesTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  badgesSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  categoryScroll: { marginBottom: 16 },
  categoryBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1A1A2E', borderRadius: 20, marginRight: 8 },
  categoryBtnActive: { backgroundColor: '#2563EB' },
  categoryText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  badgeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#2D2D44' },
  badgeEarned: { borderColor: '#10B98140', backgroundColor: '#10B98108' },
  badgeIcon: { fontSize: 28 },
  badgeInfo: { flex: 1 },
  badgeName: { fontSize: 14, fontWeight: '700', color: '#9CA3AF', marginBottom: 2 },
  badgeNameEarned: { color: '#FFFFFF' },
  badgeDesc: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  badgeBarBg: { height: 4, backgroundColor: '#2D2D44', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  badgeBarFill: { height: 4, borderRadius: 2 },
  badgeProgress: { fontSize: 11, color: '#9CA3AF' },
  badgeLock: { fontSize: 18 },
  // Graph
  graphContainer: { position: 'relative', marginVertical: 8 },
  graphEmpty: { padding: 16, alignItems: 'center' },
  graphEmptyText: { color: '#6B7280', fontSize: 13 },
  modalGraphLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 24, margin: 16 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  modalStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  modalStat: { flex: 1, alignItems: 'center', backgroundColor: '#0F0F1A', borderRadius: 12, padding: 12 },
  modalStatNum: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  modalStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  modalDomain: { fontSize: 14, color: '#2563EB', fontWeight: '600', marginBottom: 16, marginTop: 8 },
  modalClose: { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalCloseText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  // Settings
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2D2D44' },
  settingsRowIcon: { fontSize: 20, marginRight: 12 },
  settingsRowText: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  settingsRowArrow: { fontSize: 20, color: '#6B7280' },
  settingsVersion: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  // Backup
  backupDesc: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  backupCodeBox: { backgroundColor: '#0F0F1A', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#2563EB' },
  backupCodeText: { fontSize: 28, fontWeight: '900', color: '#2563EB', letterSpacing: 4 },
  copyBtn: { backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4, borderWidth: 1, borderColor: '#2563EB' },
  copyBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 15 },
  // Legal
  legalText: { fontSize: 13, color: '#9CA3AF', lineHeight: 22, marginBottom: 16 },

  planCard: { backgroundColor: '#0F0F1A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D2D44' },
  planCardHighlight: { borderColor: '#F97316' },
  planBadge: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  planBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  planName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  planPrice: { fontSize: 28, fontWeight: '900', color: '#2563EB', marginBottom: 4 },
  planSave: { fontSize: 12, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  planFeature: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  planBtn: { backgroundColor: '#2563EB', borderRadius: 50, padding: 14, alignItems: 'center', marginTop: 12 },
  planBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  promoBox: { backgroundColor: '#0F0F1A', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D2D44' },
  promoLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 10 },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoMessage: { fontSize: 13, fontWeight: '600', marginTop: 8, color: '#10B981' },
  promoApplyText: { color: '#FFFFFF', fontWeight: '700' },
  promoTextInput: { flex: 1, backgroundColor: '#0F0F1A', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2D2D44', fontSize: 14 },
  promoInputBtn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
