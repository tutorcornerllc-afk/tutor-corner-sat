import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useFocusEffect } from '@react-navigation/native';
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
import { validateAccessCode } from '../storage';

const { width: SW } = Dimensions.get('window');

const RW_GAMES = [
  { id: 1,  name: 'Word Duel',     emoji: '⚔️',  color: '#2563EB', domain: 'D1', storageKey: 'rw_d1'   },
  { id: 2,  name: 'Flip It',       emoji: '🔄',  color: '#1D4ED8', domain: 'D3', storageKey: 'rw_d3'   },
  { id: 3,  name: 'Error Hunt',    emoji: '🔍',  color: '#F97316', domain: 'D3', storageKey: 'rw_d3'   },
  { id: 4,  name: 'Polish Up',     emoji: '💎',  color: '#EA580C', domain: 'D4', storageKey: 'rw_d4'   },
  { id: 5,  name: 'Bridge It',     emoji: '🌉',  color: '#2563EB', domain: 'D4', storageKey: 'rw_d4'   },
  { id: 6,  name: 'Speed Read',    emoji: '⚡',  color: '#F97316', domain: 'D2', storageKey: 'rw_d2'   },
  { id: 7,  name: 'Deep Dive',     emoji: '🤿',  color: '#1D4ED8', domain: 'D2', storageKey: 'rw_d2'   },
  { id: 8,  name: 'Tone Craft',    emoji: '🎭',  color: '#EA580C', domain: 'D1', storageKey: 'rw_d1'   },
];

const MATH_GAMES = [
  { id: 9,  name: 'Shape Snap',     emoji: '🧩', color: '#2563EB', domain: 'D4', storageKey: 'math_d4' },
  { id: 10, name: 'Formula Forge',  emoji: '⚒️', color: '#F97316', domain: 'D2', storageKey: 'math_d2' },
  { id: 11, name: 'Graph Match',    emoji: '📈', color: '#1D4ED8', domain: 'D3', storageKey: 'math_d3' },
  { id: 12, name: 'Data Dash',      emoji: '📊', color: '#EA580C', domain: 'D3', storageKey: 'math_d3' },
  { id: 13, name: 'Rapid Fire',     emoji: '🎯', color: '#2563EB', domain: 'D1', storageKey: 'math_d1' },
  { id: 14, name: 'Story Solve',    emoji: '📖', color: '#F97316', domain: 'D1', storageKey: 'math_d1' },
  { id: 15, name: 'Math Memory',    emoji: '🧠', color: '#1D4ED8', domain: 'D2', storageKey: 'math_d2' },
  { id: 16, name: 'Chain Reaction', emoji: '☢️', color: '#DC2626', domain: 'D2', storageKey: 'math_d2' },
];

const RW_DOMAINS = [
  { id: 1, name: 'Craft & Structure',    short: 'D1', color: '#2563EB', key: 'rw_d1'   },
  { id: 2, name: 'Information & Ideas',  short: 'D2', color: '#F97316', key: 'rw_d2'   },
  { id: 3, name: 'Standard English',     short: 'D3', color: '#1D4ED8', key: 'rw_d3'   },
  { id: 4, name: 'Expression of Ideas',  short: 'D4', color: '#EA580C', key: 'rw_d4'   },
];

const MATH_DOMAINS = [
  { id: 1, name: 'Algebra',                 short: 'D1', color: '#2563EB', key: 'math_d1' },
  { id: 2, name: 'Advanced Math',           short: 'D2', color: '#F97316', key: 'math_d2' },
  { id: 3, name: 'Problem Solving & Data',  short: 'D3', color: '#1D4ED8', key: 'math_d3' },
  { id: 4, name: 'Geometry & Trig',         short: 'D4', color: '#EA580C', key: 'math_d4' },
];

const GAME_MAX_PTS = 1000;    // per-game XP max (0-10 per play, ~100 over time)
const DOMAIN_MAX_PTS = 1000;  // domain XP max (multiple games feed into it)
const OVERALL_MAX_PTS = 10000; // total TCES score max

const LEVEL_BREAKS = [
  { pct: 0/1000,   label: 'Lr',  color: '#6B7280' },  // 0 for each game and domain breakdown of bars
  { pct: 100/1000, label: 'Tk',  color: '#3B82F6' },  // 100pts
  { pct: 400/1000, label: 'Sc',  color: '#8B5CF6' },  // 400pts
  { pct: 650/1000, label: 'Ac', color: '#F59E0B' },  // 650pts
  { pct: 800/1000, label: 'El', color: '#EF4444' },  // 800pts
  { pct: 900/1000, label: 'Pr',  color: '#10B981' },  // 900pts
];

const LEVELS = [
  { name: 'Learner',     min: 0,  max: 19,    color: '#6B7280', emoji: '🌱' },
  { name: 'Thinker', min: 20, max: 39,    color: '#3B82F6', emoji: '📚' },
  { name: 'Scholar',     min: 40, max: 59,    color: '#8B5CF6', emoji: '🎓' },
  { name: 'Academic',       min: 60, max: 79,    color: '#F59E0B', emoji: '⭐' },
  { name: 'Elite',        min: 80, max: 94,    color: '#EF4444', emoji: '🏆' },
  { name: 'Prodigy',       min: 95, max: 99999, color: '#10B981', emoji: '👑' },
];

const RW_ACHIEVEMENTS = [
  { min: 0,    max: 100,   name: 'Rookie Scribe',       avatar: '📜', desc: 'Still figuring out where the period goes' },
  { min: 101,  max: 200,  name: 'Word Squire',          avatar: '⚔️', desc: 'Getting dangerous with a dictionary'      },
  { min: 201, max: 300,  name: 'Vocab Viking',         avatar: '🪖', desc: 'Pillaging wrong answers everywhere'       },
  { min: 301, max: 430,  name: 'Syntax Samurai',       avatar: '🥷', desc: 'Cutting through sentences with precision' },
  { min: 431, max: 500,  name: 'Grammar Gladiator',    avatar: '🛡️', desc: 'Fighting errors to the death'            },
  { min: 501, max: 570,  name: 'Eloquence Elite',      avatar: '👑', desc: 'Words bow before you'                    },
  { min: 571, max: 99999, name: 'Legendary Lexicon',    avatar: '🐉', desc: 'You ARE the SAT'                         },
];

const MATH_ACHIEVEMENTS = [
  { min: 0,    max: 100,   name: 'Counting Cadet',      avatar: '🔢', desc: '2+2 is still a challenge'              },
  { min: 101,  max: 200,  name: 'Number Knight',        avatar: '⚔️', desc: 'Slaying basic equations'               },
  { min: 201, max: 300,  name: 'Formula Warrior',      avatar: '🧪', desc: 'Armed and algebraic'                   },
  { min: 301, max: 430,  name: 'Equation Assassin',    avatar: '🥷', desc: 'Solving silently, striking fast'        },
  { min: 431, max: 500,  name: 'Calculus Commander',   avatar: '🎖️', desc: 'Leading the charge on derivatives'     },
  { min: 501, max: 570,  name: 'Math Monarch',         avatar: '👑', desc: 'The kingdom of math is yours'          },
  { min: 571, max: 99999, name: 'Infinite Legend',      avatar: '🐉', desc: 'You ARE the math'                      },
];

const BADGES = [
  { id: 1,  icon: '🏅', name: 'First Step',        desc: 'Complete any game',              category: 'Games',     target: 1,    field: 'gamesPlayed'   },
  { id: 2,  icon: '🎯', name: 'Game Explorer',      desc: 'Play 8 different games',         category: 'Games',     target: 8,    field: 'uniqueGames'   },
  { id: 3,  icon: '🌟', name: 'Game Master',        desc: 'Play all 16 games',              category: 'Games',     target: 16,   field: 'uniqueGames'   },
  { id: 4,  icon: '🔁', name: 'Dedicated',          desc: 'Play any game 10 times',         category: 'Games',     target: 10,   field: 'maxPlays'      },
  { id: 5,  icon: '💪', name: 'Committed',          desc: 'Play any game 25 times',         category: 'Games',     target: 25,   field: 'maxPlays'      },
  { id: 6,  icon: '⚡', name: 'Quick Draw',         desc: 'Get 3 speedy answers in one game',category: 'Speed',    target: 3,    field: 'speedyAnswers' },
  { id: 7,  icon: '🚀', name: 'Speed Demon',        desc: 'Get 5 speedy answers in one game',category: 'Speed',   target: 5,    field: 'speedyAnswers' },
  { id: 8,  icon: '💨', name: 'Lightning',          desc: 'Get 8 speedy answers in one game',category: 'Speed',   target: 8,    field: 'speedyAnswers' },
  { id: 9,  icon: '✨', name: 'Sharp',              desc: 'Score 80+ in any game',          category: 'Score',     target: 80,   field: 'topScore'      },
  { id: 10, icon: '💎', name: 'Perfectionist',      desc: 'Score 100 in any game',          category: 'Score',     target: 100,  field: 'topScore'      },
  { id: 11, icon: '👑', name: 'Flawless',           desc: 'Score 100 three times',          category: 'Score',     target: 3,    field: 'perfect100s'   },
  { id: 12, icon: '🌱', name: 'Rising Star',        desc: 'Earn 100 total XP',              category: 'XP',        target: 100,  field: 'totalXP'       },
  { id: 13, icon: '⭐', name: 'Scholar',            desc: 'Earn 500 total XP',              category: 'XP',        target: 500,  field: 'totalXP'       },
  { id: 14, icon: '🌟', name: 'Honor Roll',         desc: 'Earn 1000 total XP',             category: 'XP',        target: 1000, field: 'totalXP'       },
  { id: 15, icon: '🎓', name: 'Academic',           desc: 'Earn 2500 total XP',             category: 'XP',        target: 2500, field: 'totalXP'       },
  { id: 16, icon: '👑', name: 'Elite Scholar',      desc: 'Earn 4000 total XP',             category: 'XP',        target: 4000, field: 'totalXP'       },
  { id: 17, icon: '🐉', name: 'Legend',             desc: 'Earn 4700+ total XP',            category: 'XP',        target: 4700, field: 'totalXP'       },
  { id: 18, icon: '🔥', name: 'Spark',              desc: '3 day streak',                   category: 'Streak',    target: 3,    field: 'streak'        },
  { id: 19, icon: '🔥', name: 'Blazing',            desc: '7 day streak',                   category: 'Streak',    target: 7,    field: 'streak'        },
  { id: 20, icon: '🔥', name: 'Inferno',            desc: '14 day streak',                  category: 'Streak',    target: 14,   field: 'streak'        },
  { id: 21, icon: '☀️', name: 'Unstoppable',        desc: '30 day streak',                  category: 'Streak',    target: 30,   field: 'streak'        },
  { id: 22, icon: '📝', name: 'Craft Master',       desc: 'Reach 2000 in RW D1',            category: 'Domain',    target: 2000, field: 'rwD1'          },
  { id: 23, icon: '💡', name: 'Idea Machine',       desc: 'Reach 2000 in RW D2',            category: 'Domain',    target: 2000, field: 'rwD2'          },
  { id: 24, icon: '✏️', name: 'Grammar Guru',       desc: 'Reach 2000 in RW D3',            category: 'Domain',    target: 2000, field: 'rwD3'          },
  { id: 25, icon: '🎨', name: 'Expression Expert',  desc: 'Reach 2000 in RW D4',            category: 'Domain',    target: 2000, field: 'rwD4'          },
  { id: 26, icon: '➕', name: 'Algebra Ace',        desc: 'Reach 2000 in Math D1',          category: 'Domain',    target: 2000, field: 'mD1'           },
  { id: 27, icon: '📐', name: 'Math Wizard',        desc: 'Reach 2000 in Math D2',          category: 'Domain',    target: 2000, field: 'mD2'           },
  { id: 28, icon: '📊', name: 'Data Detective',     desc: 'Reach 2000 in Math D3',          category: 'Domain',    target: 2000, field: 'mD3'           },
  { id: 29, icon: '📏', name: 'Geometry Giant',     desc: 'Reach 2000 in Math D4',          category: 'Domain',    target: 2000, field: 'mD4'           },
  { id: 30, icon: '🌅', name: 'Early Bird',         desc: 'Complete daily challenge 7 days', category: 'Challenge', target: 7,   field: 'dailyStreak'   },
  { id: 31, icon: '🎯', name: "Bull's Eye",         desc: 'Get 100% on daily 3 times',      category: 'Challenge', target: 3,    field: 'perfectDaily'  },
  { id: 32, icon: '🏃', name: 'Marathon',           desc: 'Play 5 games in one session',    category: 'Challenge', target: 5,    field: 'sessionGames'  },
  { id: 33, icon: '🎪', name: 'Jack of All',        desc: 'Score 70+ in every game',        category: 'Special',   target: 16,   field: 'games70plus'   },
  { id: 34, icon: '🌍', name: 'Well Rounded',       desc: 'Earn XP in every domain',        category: 'Special',   target: 8,    field: 'domainsWithXP' },
  { id: 35, icon: '🔬', name: 'Analyst',            desc: 'Complete Data Dash 20 times',    category: 'Special',   target: 20,   field: 'dataDash'      },
  { id: 36, icon: '📚', name: 'Bookworm',           desc: 'Complete Deep Dive 20 times',    category: 'Special',   target: 20,   field: 'deepDive'      },
  { id: 37, icon: '⚔️', name: 'Word Warrior',       desc: 'Complete Word Duel 20 times',    category: 'Special',   target: 20,   field: 'wordDuel'      },
];

const BADGE_CATEGORIES = ['All', 'Games', 'Speed', 'Score', 'XP', 'Streak', 'Domain', 'Challenge', 'Special'];

function getLevelFromPts(pts: number) {
  return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0];
}

function getOverallLevel(xp: number) {
  if (xp >= 9000) return { name: 'Prodigy',      color: '#10B981', emoji: '👑' };
  if (xp >= 8000) return { name: 'Elite',        color: '#EF4444', emoji: '🏆' };
  if (xp >= 6500) return { name: 'Academic',       color: '#F59E0B', emoji: '⭐' };
  if (xp >= 4000) return { name: 'Scholar',     color: '#8B5CF6', emoji: '🎓' };
  if (xp >= 1000) return { name: 'Thinker', color: '#3B82F6', emoji: '📚' };
  return           { name: 'Learner',     color: '#6B7280', emoji: '🌱' };
}

function getNextOverallLevel(xp: number) {
  if (xp >= 9000) return null;
  if (xp >= 8000) return { name: 'Prodigy',      min: 9000 };
  if (xp >= 6500) return { name: 'Elite',        min: 8000 };
  if (xp >= 4000) return { name: 'Academic',       min: 6500 };
  if (xp >= 1000) return { name: 'Scholar',     min: 4000 };
  if (xp >= 0)    return { name: 'Thinker', min: 1000 };
  return null;
}

function getNextLevel(pts: number) {
  const idx = LEVELS.findIndex(l => pts >= l.min && pts <= l.max);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
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
  const pts = scores.slice(-10).map((s, i, arr) => ({
    x: arr.length === 1 ? graphW / 2 : (i / (arr.length - 1)) * graphW,
    y: graphH - (s / 100) * graphH,
    score: s,
  }));
  return (
    <View style={[styles.graphContainer, { width: graphW, height: graphH + 20 }]}>
      {pts.slice(0, -1).map((p, i) => {
        const next = pts[i + 1];
        const dx = next.x - p.x; const dy = next.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const c = p.score >= 75 ? '#10B981' : p.score >= 40 ? '#F59E0B' : '#EF4444';
        return (
          <View key={i} style={{
            position: 'absolute', left: p.x, top: p.y,
            width: len, height: 2, backgroundColor: c,
            transform: [{ rotate: `${angle}deg` }],
            // @ts-ignore
            transformOrigin: '0 50%',
          }} />
        );
      })}
      {pts.map((p, i) => {
        const c = p.score >= 75 ? '#10B981' : p.score >= 40 ? '#F59E0B' : '#EF4444';
        return (
          <View key={i} style={{
            position: 'absolute', left: p.x - 5, top: p.y - 5,
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: c, borderWidth: 2, borderColor: '#0F0F1A',
          }} />
        );
      })}
    </View>
  );
}

// ─── LEVEL BAR ────────────────────────────────────────────────────────────────
function LevelBar({ pts, color, maxPts = GAME_MAX_PTS }: {
  pts: number; color: string; maxPts?: number;
}) {
  const progress = Math.min(pts / maxPts, 1);
  const currentBreak = [...LEVEL_BREAKS].reverse().find(b => progress >= b.pct) || LEVEL_BREAKS[0];

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.barBg}>
        <View style={[styles.barFill, {
          width: `${Math.max(progress * 100, 0.5)}%` as any,
          backgroundColor: currentBreak.color,
        }]} />
        {LEVEL_BREAKS.slice(1).map((b, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: `${b.pct * 100}%` as any,
            top: 0, width: 2, height: 10,
            backgroundColor: '#0F0F1A',
          }} />
        ))}
      </View>
      <View style={{ position: 'relative', height: 14, marginTop: 2 }}>
        {LEVEL_BREAKS.map((b, i) => (
          <Text key={i} style={{
            position: 'absolute',
            left: `${b.pct * 100}%` as any,
            fontSize: 9,
            fontWeight: '700',
            color: progress >= b.pct ? b.color : '#374151',
          }}>
            {b.label}
          </Text>
        ))}
        <Text style={{
          position: 'absolute',
          right: 0,
          fontSize: 9,
          color: '#6B7280',
          fontWeight: '600',
        }}>
          {pts}/{maxPts}
        </Text>
      </View>
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
          <View style={[styles.badgeBarFill, { width: `${pct * 100}%` as any, backgroundColor: earned ? '#10B981' : '#2563EB' }]} />
        </View>
        <Text style={styles.badgeProgress}>{earned ? '✅ Earned!' : `${progress} / ${badge.target}`}</Text>
      </View>
      {!earned && <Text style={styles.badgeLock}>🔒</Text>}
    </View>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [accessCode, setAccessCode] = useState('');
  const [accessMsg, setAccessMsg]   = useState('');
  const [loadingAccess, setLoadingAccess] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
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

  const [totalXP, setTotalXP] = useState(0);
  const [gameXPMap, setGameXPMap] = useState<Record<number, number>>({});
  const [domainXP, setDomainXP] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [todayXP, setTodayXP] = useState(0);
  const [gameHistoryMap, setGameHistoryMap] = useState<Record<number, GameResult[]>>({});
  const [gameBestMap, setGameBestMap] = useState<Record<number, number>>({});
  const [gamePlayMap, setGamePlayMap] = useState<Record<number, number>>({});
  const [modalScores, setModalScores] = useState<number[]>([]);
  const [modalBest, setModalBest] = useState(0);
  const [modalXP, setModalXP] = useState(0);
  const [modalPlays, setModalPlays] = useState(0);
  const [lastGameDate, setLastGameDate] = useState<string>('--');

  // Reload every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      setInstallDateIfNeeded();
      loadAllData();
    }, [])
  );

  async function loadAllData() {
    try {
      const xp = await getAllGamesTotalXP();
      setTotalXP(xp);

      const xpMap = await getAllGameXPMap();
      setGameXPMap(xpMap);

      const domains = ['rw_d1','rw_d2','rw_d3','rw_d4','math_d1','math_d2','math_d3','math_d4'];
      const dMap: Record<string, number> = {};
      for (const d of domains) dMap[d] = await getDomainXP(d);
      setDomainXP(dMap);

      setStreak(await getStreak());
      setTodayXP(await getTodayXP());

      const histMap: Record<number, GameResult[]> = {};
      const bestMap: Record<number, number> = {};
      const playMap: Record<number, number> = {};
      let latestDate = 0;
      for (let i = 1; i <= 16; i++) {
        histMap[i] = await getGameHistory(i);
        bestMap[i] = await getGameBestScore(i);
        playMap[i] = await getGamePlayCount(i);
        if (histMap[i].length > 0) {
          const last = histMap[i][histMap[i].length - 1].date;
          if (last > latestDate) latestDate = last;
        }
      }
      setGameHistoryMap(histMap);
      setGameBestMap(bestMap);
      setGamePlayMap(playMap);
      if (latestDate > 0) setLastGameDate(new Date(latestDate).toLocaleDateString());

      await checkAndUnlockBadges();
      setBackupCode(await generateBackupCodeIfNeeded());
    } catch (e) {
    }
  }

  function openGameModal(game: any) {
    const history = gameHistoryMap[game.id] || [];
    setModalScores(history.map((r: GameResult) => r.score));
    setModalBest(gameBestMap[game.id] || 0);
    setModalXP(gameXPMap[game.id] || 0);
    setModalPlays(gamePlayMap[game.id] || 0);
    setSelectedGame(game);
  }

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) { setPromoMessage('Enter a code first'); return; }
    const plan = checkPromoCode(code);
    if (!plan) { setPromoMessage('❌ Invalid code'); return; }
    const success = await redeemPromoCode(code);
    if (success) {
      setPromoMessage(`✅ Code applied! Enjoy ${plan} access!`);
      setTimeout(() => { setShowSubscription(false); setPromoMessage(''); setPromoCode(''); }, 2000);
    }
  }

  // Stats derived from loaded data
  const allHistory: GameResult[] = Object.values(gameHistoryMap).flat();
  const gamesPlayed   = allHistory.length;
  const uniqueGames   = new Set(allHistory.map(r => r.gameId)).size;
  const topScore      = allHistory.length > 0 ? Math.max(...allHistory.map(r => r.score)) : 0;
  const perfect100s   = allHistory.filter(r => r.score >= 100).length;
  const maxSpeedy     = allHistory.length > 0 ? Math.max(...allHistory.map(r => r.speedy || 0)) : 0;
  const maxPlays      = Object.values(gamePlayMap).length > 0 ? Math.max(...Object.values(gamePlayMap)) : 0;
  const domainsWithXP = Object.values(domainXP).filter(v => v > 0).length;
  const precision     = allHistory.length > 0
    ? `${Math.round(allHistory.reduce((s, r) => s + r.score, 0) / allHistory.length)}%`
    : '--%';

  const stats: Record<string, number> = {
    gamesPlayed, uniqueGames, maxPlays, totalPlays: gamesPlayed,
    speedyAnswers: maxSpeedy, topScore, perfect100s, totalXP, streak,
    rwD1: domainXP['rw_d1']   || 0, rwD2: domainXP['rw_d2']    || 0,
    rwD3: domainXP['rw_d3']   || 0, rwD4: domainXP['rw_d4']    || 0,
    mD1:  domainXP['math_d1'] || 0, mD2:  domainXP['math_d2']  || 0,
    mD3:  domainXP['math_d3'] || 0, mD4:  domainXP['math_d4']  || 0,
    domainsWithXP,
    wordDuel:  gamePlayMap[1]  || 0,
    deepDive:  gamePlayMap[7]  || 0,
    dataDash:  gamePlayMap[12] || 0,
    dailyStreak: 0, perfectDaily: 0, sessionGames: 0, games70plus: 0,
  };

  const rwTotal   = (domainXP['rw_d1']||0)+(domainXP['rw_d2']||0)+(domainXP['rw_d3']||0)+(domainXP['rw_d4']||0);
  const mathTotal = (domainXP['math_d1']||0)+(domainXP['math_d2']||0)+(domainXP['math_d3']||0)+(domainXP['math_d4']||0);
  const overallLevel  = getOverallLevel(totalXP);
  const nextLevel     = getNextOverallLevel(totalXP);
  const xpToNext      = nextLevel ? nextLevel.min - totalXP : 0;
  const rwAchievement   = getAchievement(rwTotal, RW_ACHIEVEMENTS);
  const mathAchievement = getAchievement(mathTotal, MATH_ACHIEVEMENTS);
  const earnedCount   = BADGES.filter(b => (stats[b.field] || 0) >= b.target).length;
  const filteredBadges = badgeCategory === 'All' ? BADGES : BADGES.filter(b => b.category === badgeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>

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

        {/* My Stats */}
        <View style={styles.myStatsCard}>
          <Text style={styles.myStatsTitle}>📊 My Stats</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelEmoji}>{overallLevel.emoji}</Text>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelName, { color: overallLevel.color }]}>{overallLevel.name} Level</Text>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, {
                  width: `${Math.min((totalXP / OVERALL_MAX_PTS) * 100, 100)}%` as any,
                  backgroundColor: overallLevel.color,
                }]} />
              </View>
              <Text style={styles.xpBarLabel}>
                {totalXP} XP total
                {nextLevel ? ` · ${xpToNext} XP to ${nextLevel.name}` : ' · Max Level!'}
              </Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCell}><Text style={styles.statCellNum}>🔥 {streak}</Text><Text style={styles.statCellLabel}>Streak</Text></View>
            <View style={styles.statCell}><Text style={styles.statCellNum}>⚡ {todayXP}</Text><Text style={styles.statCellLabel}>Today XP</Text></View>
            <View style={styles.statCell}><Text style={styles.statCellNum}>🎮 {gamesPlayed}</Text><Text style={styles.statCellLabel}>Games Played</Text></View>
            <View style={styles.statCell}><Text style={styles.statCellNum}>🏅 {earnedCount}</Text><Text style={styles.statCellLabel}>Badges</Text></View>
            <View style={styles.statCell}><Text style={styles.statCellNum}>🎯 {precision}</Text><Text style={styles.statCellLabel}>Precision</Text></View>
            <View style={styles.statCell}><Text style={styles.statCellNum}>📅 {lastGameDate}</Text><Text style={styles.statCellLabel}>Last Played</Text></View>
          </View>
        </View>

        {/* TCES Bubble */}
        <View style={styles.tcesBubble}>
          <Text style={styles.tcesLabel}>TCES</Text>
          <Text style={styles.tcesScore}>{totalXP}</Text>
          <View style={[styles.levelPill, { backgroundColor: overallLevel.color + '25' }]}>
            <Text style={[styles.levelPillText, { color: overallLevel.color }]}>{getLevel(totalXP)}</Text>
          </View>
          <Text style={styles.tcesRank}>{getPercentile(totalXP)} of all players</Text>

          {/* TCES level break bar */}
          <View style={{ width: '100%', marginTop: 16 }}>
            <View style={[styles.barBg, { height: 12, borderRadius: 6 }]}>
              <View style={[styles.barFill, {
                width: `${Math.min((totalXP / OVERALL_MAX_PTS) * 100, 100)}%` as any,
                backgroundColor: overallLevel.color,
                borderRadius: 6,
                height: 12,
              }]} />
              {[
                { pct: 1000/10000,  color: '#3B82F6' },
                { pct: 4000/10000,  color: '#8B5CF6' },
                { pct: 6500/10000,  color: '#F59E0B' },
                { pct: 8000/10000,  color: '#EF4444' },
                { pct: 9000/10000,  color: '#10B981' },
              ].map((b, i) => (
                <View key={i} style={{
                  position: 'absolute',
                  left: `${b.pct * 100}%` as any,
                  top: 0, width: 2, height: 12,
                  backgroundColor: '#0F0F1A',
                }} />
              ))}
            </View>
            <View style={{ position: 'relative', height: 16, marginTop: 3 }}>
              {[
                { pct: 0,           label: 'B',  color: '#6B7280' },
                { pct: 1000/10000,  label: 'I',  color: '#3B82F6' },
                { pct: 4000/10000,  label: 'A',  color: '#8B5CF6' },
                { pct: 6500/10000,  label: 'Ex', color: '#F59E0B' },
                { pct: 8000/10000,  label: 'El', color: '#EF4444' },
                { pct: 9000/10000,  label: 'M',  color: '#10B981' },
              ].map((b, i) => (
                <Text key={i} style={{
                  position: 'absolute',
                  left: `${b.pct * 100}%` as any,
                  fontSize: 9,
                  fontWeight: '700',
                  color: totalXP >= b.pct * OVERALL_MAX_PTS ? b.color : '#374151',
                }}>
                  {b.label}
                </Text>
              ))}
              <Text style={{
                position: 'absolute', right: 0,
                fontSize: 9, color: '#6B7280', fontWeight: '600',
              }}>
                {totalXP}/{OVERALL_MAX_PTS}
              </Text>
            </View>
          </View>
        </View>

        {/* RW Card */}
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
              <TouchableOpacity key={game.id} style={[styles.bubble, { backgroundColor: game.color }]} onPress={() => openGameModal(game)}>
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
                <LevelBar pts={gameXPMap[game.id] || 0} color={game.color} maxPts={GAME_MAX_PTS} />
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
                <LevelBar pts={domainXP[domain.key] || 0} color={domain.color} maxPts={DOMAIN_MAX_PTS} />
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
              <TouchableOpacity key={game.id} style={[styles.bubble, { backgroundColor: game.color }]} onPress={() => openGameModal(game)}>
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
                <LevelBar pts={gameXPMap[game.id] || 0} color={game.color} maxPts={GAME_MAX_PTS} />
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
                <LevelBar pts={domainXP[domain.key] || 0} color={domain.color} maxPts={DOMAIN_MAX_PTS} />
              </View>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.badgesTitle}>🏅 Badges</Text>
          <Text style={styles.badgesSub}>{BADGES.length} total · {earnedCount} earned</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {BADGE_CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={[styles.categoryBtn, badgeCategory === cat && styles.categoryBtnActive]} onPress={() => setBadgeCategory(cat)}>
                <Text style={[styles.categoryText, badgeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filteredBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} progress={stats[badge.field] || 0} />
          ))}
        </View>

      </ScrollView>

      {/* GAME HISTORY MODAL */}
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

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚙️ Settings</Text>
            <TouchableOpacity style={styles.settingsRow} onPress={() => {
              setShowSettings(false);
              setTimeout(() => setShowSubscription(true), 300);
            }}>
              <Text style={styles.settingsRowIcon}>🔑</Text>
              <Text style={styles.settingsRowText}>Manage Account</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowBackup(true), 300); }}>
              <Text style={styles.settingsRowIcon}>🔑</Text><Text style={styles.settingsRowText}>Backup & Restore Code</Text><Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('https://tutorcornerllc.com/contact-us')}>
              <Text style={styles.settingsRowIcon}>🗓️</Text><Text style={styles.settingsRowText}>Book a Tutor Session</Text><Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('mailto:admin@tutorcornerllc.com?subject=Tutor Corner SAT Support')}>
              <Text style={styles.settingsRowIcon}>📧</Text><Text style={styles.settingsRowText}>Contact Us</Text><Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={async () => {
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.clear();
              alert('Data cleared! Close and reopen the app.');
            }}>
              <Text style={styles.settingsRowIcon}>🧪</Text>
              <Text style={styles.settingsRowText}>DEV: Reset All Data</Text>
              <Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowPrivacy(true), 300); }}>
              <Text style={styles.settingsRowIcon}>📋</Text><Text style={styles.settingsRowText}>Privacy Policy</Text><Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowSettings(false); setTimeout(() => setShowTerms(true), 300); }}>
              <Text style={styles.settingsRowIcon}>📄</Text><Text style={styles.settingsRowText}>Terms of Service</Text><Text style={styles.settingsRowArrow}>›</Text>
            </TouchableOpacity>
            <Text style={styles.settingsVersion}>Tutor Corner SAT v1.0.0{'\n'}© 2025 Tutor Corner LLC</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* BACKUP MODAL */}
      <Modal visible={showBackup} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBackup(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Backup Code</Text>
            <Text style={styles.backupDesc}>Save this code to restore your progress on a new device.</Text>
            <View style={styles.backupCodeBox}><Text style={styles.backupCodeText}>{backupCode}</Text></View>
            <TouchableOpacity style={styles.copyBtn} onPress={() => setCopied(true)}>
              <Text style={styles.copyBtnText}>{copied ? '✅ Copied!' : '📋 Copy Code'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalClose, { marginTop: 8 }]} onPress={() => { setShowBackup(false); setCopied(false); }}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* PRIVACY MODAL */}
      <Modal visible={showPrivacy} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPrivacy(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📋 Privacy Policy</Text>
              <Text style={styles.legalText}>{`PRIVACY POLICY — Tutor Corner LLC\nLast Updated: April 2026\n\n1. INFORMATION WE COLLECT\nWhen you subscribe to or inquire about Tutor Corner LLC\u00ae services, we collect your name, email address, and optionally your phone number solely for account management, service delivery, and communication purposes. This information is collected with your explicit consent via our subscription and onboarding forms.\n\nApp data including game scores, progress, streaks, XP, and preferences are stored locally on your device only via AsyncStorage. Tutor Corner LLC does not have access to your local app data. We do not collect, transmit, or store app gameplay data on external servers.\n\nWe may collect your device identifier solely to associate your premium access code with your device for security purposes. This identifier is not shared with third parties.\n\n2. HOW WE USE YOUR INFORMATION\nWe use your name, email, and phone number to send invoices, access codes, account confirmations, and service-related communications. If you opted in, we may send SAT\u00ae prep tips and tutoring offers. You may opt out at any time by emailing admin@tutorcornerllc.com.\n\n3. DATA STORAGE & SECURITY\nContact information submitted through our forms is stored securely in our internal systems. We implement reasonable safeguards but cannot guarantee absolute security. App data is stored locally on your device only. Tutor Corner LLC is not responsible for data loss resulting from app uninstallation, device failure, software updates, OS changes, or any technical issue. We do not maintain backups of your local app data.\n\n4. DATA RETENTION & DELETION\nWe retain your contact information for as long as necessary to provide services. To request deletion of your data email admin@tutorcornerllc.com. We will process deletion requests within 30 days.\n\n5. PAYMENTS\nAll premium app access is managed externally through tutorcornerllc.com. Tutor Corner LLC processes payments via Zelle or other methods as specified at time of purchase. Payment information is not stored by Tutor Corner LLC beyond what is necessary for transaction records. Tutoring payments are governed separately by our Tutoring Terms of Service.\n\n6. PUSH NOTIFICATIONS\nIf you grant notification permissions, Tutor Corner LLC apps may send you daily challenge reminders, streak alerts, and motivational messages. You may disable notifications at any time through your device settings. We do not use notifications for advertising third party products.\n\n7. AGE REQUIREMENT\nThis app and our services are not directed at children under 13. By using our app or services you confirm you are at least 13 years of age. We do not knowingly collect information from children under 13. If we become aware that a child under 13 has submitted information we will delete it promptly.\n\n8. THIRD PARTIES\nThis app does not use third party advertising or analytics services. We do not sell, rent, or trade your personal information to third parties. We do not share your information except as required by law.\n\n9. YOUR RIGHTS\nYou have the right to access, correct, or request deletion of your personal information at any time. Contact admin@tutorcornerllc.com for any such requests.\n\n10. CHANGES\nWe reserve the right to update this policy at any time. Continued use of our app or services constitutes acceptance of the updated policy. Material changes will be communicated via email where possible.\n\n11. CONTACT\nTutor Corner LLC\nEmail: admin@tutorcornerllc.com\nWebsite: tutorcornerllc.com`}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowPrivacy(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* TERMS MODAL */}
      <Modal visible={showTerms} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTerms(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📄 Terms of Service</Text>
              <Text style={styles.legalText}>{`TERMS OF SERVICE — Tutor Corner LLC\nLast Updated: April 2026\n\n1. ACCEPTANCE\nBy downloading, installing, or using Tutor Corner LLC\u00ae apps, submitting any form on tutorcornerllc.com, or using any Tutor Corner LLC service, you agree to be legally bound by these Terms of Service and our Privacy Policy. If you do not agree do not use our products or services.\n\n2. APP LICENSE\nTutor Corner LLC grants you a limited, non-exclusive, non-transferable, revocable license to use Tutor Corner LLC apps for personal non-commercial educational purposes only. You may not copy, reverse engineer, modify, or distribute any part of the app.\n\n3. FREE & PREMIUM ACCESS\nTutor Corner LLC apps are free. Daily challenges are always free. Premium access unlocks all games and is obtained by purchasing a subscription through tutorcornerllc.com and entering the access code provided via email. Premium access is tied to your device. To transfer to a new device contact admin@tutorcornerllc.com.\n\n4. SUBSCRIPTIONS & BILLING\nMonthly and yearly subscriptions are managed through tutorcornerllc.com. Your subscription remains active through the end of the paid billing period even if cancelled early. No partial refunds are issued for unused time within a billing period. You are responsible for cancelling before your renewal date. Renewal reminders are sent via email.\n\n5. LIFETIME PURCHASE\nA lifetime purchase grants access to the current version of the specific Tutor Corner LLC app only. Tutor Corner LLC reserves the right to modify, update, remove, or discontinue any feature, game, or content at any time without notice or compensation. Lifetime purchases are final and non-refundable. Future separate apps may require separate purchase.\n\n6. NO REFUND POLICY\nAll purchases are final. No refunds are issued after payment confirmation under any circumstances including but not limited to change of mind, device issues, app performance, or educational outcomes. By completing any purchase you explicitly agree to this no-refund policy.\n\n7. USER DATA & ONBOARDING\nWhen you first launch any Tutor Corner LLC app you may be asked to provide your email address and optionally your phone number. This is used solely to help you recover access and receive your premium access code. By submitting this information you consent to Tutor Corner LLC storing and using it as described in our Privacy Policy. Providing this information is voluntary. The app is functional without providing contact details.\n\n8. PUSH NOTIFICATIONS\nBy granting notification permissions you consent to receiving daily challenge reminders, streak alerts, and motivational messages from Tutor Corner LLC apps. You may withdraw consent at any time through your device notification settings.\n\n9. NO GUARANTEE OF RESULTS\nTutor Corner LLC apps are educational entertainment tools only. Tutor Corner LLC makes absolutely no guarantee of SAT\u00ae score improvement, academic performance, college admission outcomes, or any other educational result. By using this app you explicitly acknowledge that results depend entirely on your own effort and ability and you waive any claim based on educational outcomes.\n\n10. SAT\u00ae TRADEMARK DISCLAIMER\nSAT\u00ae is a registered trademark of College Board. Tutor Corner LLC\u00ae is not affiliated with, endorsed by, or sponsored by College Board in any way. Use of the SAT\u00ae name is purely for descriptive educational reference.\n\n11. DISCLAIMER OF WARRANTIES\nThis app is provided AS IS without warranties of any kind express or implied. Tutor Corner LLC does not warrant that the app will be uninterrupted, error-free, or free of bugs, viruses, or other harmful components. We are not liable for technical difficulties, connectivity issues, device compatibility problems, or data loss of any kind.\n\n12. LIMITATION OF LIABILITY\nTo the fullest extent permitted by applicable law, Tutor Corner LLC, its owners, employees, contractors, and affiliates shall not be liable for any damages whatsoever including direct, indirect, incidental, special, consequential, or punitive damages arising from use of the app or services. In no event shall our total liability exceed the amount you paid in the twelve months preceding the claim.\n\n13. INDEMNIFICATION\nYou agree to indemnify and hold harmless Tutor Corner LLC from any claims, damages, losses, or expenses including attorney fees arising from your use of the app, violation of these terms, or submission of inaccurate information.\n\n14. INTELLECTUAL PROPERTY\nAll content in Tutor Corner LLC apps including game mechanics, questions, answers, explanations, graphics, code, and branding are the exclusive intellectual property of Tutor Corner LLC protected by copyright law. You may not copy, reproduce, distribute, or create derivative works without written permission.\n\n15. MODIFICATIONS\nTutor Corner LLC reserves the right to modify these terms, the app, or any service at any time without notice. Continued use constitutes acceptance of updated terms.\n\n16. TERMINATION\nTutor Corner LLC reserves the right to terminate or suspend your access at any time without notice for any reason including violation of these terms.\n\n17. DISPUTE RESOLUTION\nAll disputes shall be resolved through binding individual arbitration in accordance with American Arbitration Association rules. You waive any right to participate in class action lawsuits. The arbitrator's decision is final and binding.\n\n18. GOVERNING LAW\nThese terms are governed by the laws of the State of Arizona, United States.\n\n19. ENTIRE AGREEMENT\nThese terms together with our Privacy Policy constitute the entire agreement between you and Tutor Corner LLC and supersede any prior agreements.\n\n20. CONTACT\nTutor Corner LLC\nEmail: admin@tutorcornerllc.com\nWebsite: tutorcornerllc.com`}</Text>
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
              <Text style={styles.modalTitle}>🔑 Manage Account</Text>
              <Text style={styles.planSubtitle}>
                Premium unlocks all 16 games. Daily challenges are always free!.
                Manage your account at www.tutorcornerllc.com/app
              </Text>

              <View style={{
                backgroundColor: '#0F0F1A', borderRadius: 16,
                padding: 16, marginBottom: 16,
                borderWidth: 1, borderColor: '#2563EB30',
              }}>
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>
                  Subscribe at:
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#2563EB', marginBottom: 6 }}>
                  tutorcornerllc.com/app
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18 }}>
                  After subscribing you will receive a unique
                  access code via email — enter it below
                </Text>
              </View>
<View style={styles.planCard}>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>Most Flexible</Text>
                </View>
                <Text style={styles.planName}>Monthly Premium</Text>
                <Text style={styles.planFeature}>✅ All 16 games unlimited</Text>
                <Text style={styles.planFeature}>✅ Daily challenges forever free</Text>
                <Text style={styles.planFeature}>✅ Cancel anytime</Text>
              </View>
              <View style={[styles.planCard, styles.planCardHighlight]}>
                <View style={[styles.planBadge, { backgroundColor: '#F97316' }]}>
                  <Text style={styles.planBadgeText}>Best Value</Text>
                </View>
                <Text style={styles.planName}>Yearly Premium</Text>
                <Text style={styles.planFeature}>✅ All 16 games unlimited</Text>
                <Text style={styles.planFeature}>✅ Best value plan</Text>
                <Text style={styles.planFeature}>✅ Daily challenges forever free</Text>
              </View>
              <View style={styles.planCard}>
                <View style={[styles.planBadge, { backgroundColor: '#8B5CF6' }]}>
                  <Text style={styles.planBadgeText}>Own Forever</Text>
                </View>
                <Text style={styles.planName}>Lifetime Premium</Text>
                <Text style={styles.planFeature}>✅ All 16 games unlimited</Text>
                <Text style={styles.planFeature}>✅ All future updates included</Text>
                <Text style={styles.planFeature}>✅ Daily challenges forever free</Text>
              </View>

              <View style={{
                backgroundColor: '#0F0F1A', borderRadius: 14,
                padding: 16, marginBottom: 16, marginTop: 4,
                borderWidth: 1, borderColor: '#2563EB30',
                alignItems: 'center',
              }}>
                <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 6, textAlign: 'center' }}>
                  To subscribe or manage your premium account visit:
                </Text>
                <Text style={{ color: '#2563EB', fontSize: 16, fontWeight: '800', textAlign: 'center' }}>
                  tutorcornerllc.com/app
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 6, textAlign: 'center' }}>
                  After subscribing you will receive an access code via email
                </Text>
              </View>
              {/* Access code */}
              <View style={styles.promoBox}>
                <Text style={[styles.promoLabel, { color: '#FFFFFF', fontWeight: '700' }]}>
                  Enter Access Code
                </Text>
                <View style={styles.promoRow}>
                  <TextInput
                    style={styles.promoTextInput}
                    placeholder="e.g. TCM-X4K9-M2PQ"
                    placeholderTextColor="#6B7280"
                    value={accessCode}
                    onChangeText={t => { setAccessCode(t); setAccessMsg(''); }}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.promoInputBtn}
                    onPress={async () => {
                      const code = accessCode.trim();
                      if (!code) { setAccessMsg('Enter your code'); return; }
                      setLoadingAccess(true);
                      const result = await validateAccessCode(code);
                      setLoadingAccess(false);
                      if (result.valid) {
                        setAccessMsg('✅ Access unlocked!');
                        setTimeout(() => setShowSubscription(false), 1500);
                      } else {
                        setAccessMsg('❌ ' + (result.message || 'Invalid code'));
                      }
                    }}
                    disabled={loadingAccess}
                  >
                    {loadingAccess
                      ? <ActivityIndicator color="#FFFFFF" size="small" />
                      : <Text style={styles.promoApplyText}>Activate</Text>
                    }
                  </TouchableOpacity>
                </View>
                {accessMsg ? (
                  <Text style={[styles.promoMessage, {
                    color: accessMsg.includes('✅') ? '#10B981' : '#EF4444'
                  }]}>
                    {accessMsg}
                  </Text>
                ) : null}
              </View>

              {/* Promo code */}
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
                  <TouchableOpacity style={styles.promoInputBtn} onPress={handleApplyPromo}>
                    <Text style={styles.promoApplyText}>Apply</Text>
                  </TouchableOpacity>
                </View>
                {promoMessage ? (
                  <Text style={styles.promoMessage}>{promoMessage}</Text>
                ) : null}
              </View>

              <Text style={styles.legalText}>
                SAT® is a registered trademark of College Board.
                Tutor Corner LLC® is not affiliated with
                or endorsed by College Board.
              </Text>
              <Text style={styles.legalText}>Premium access is managed at tutorcornerllc.com/app. No guarantee of SAT score improvement.</Text>
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
  myStatsCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2563EB30' },
  myStatsTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  levelEmoji: { fontSize: 40 },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  xpBarBg: { height: 10, backgroundColor: '#2D2D44', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  xpBarFill: { height: 10, borderRadius: 5 },
  xpBarLabel: { fontSize: 11, color: '#9CA3AF' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: { backgroundColor: '#0F0F1A', borderRadius: 12, padding: 10, alignItems: 'center', flex: 1, minWidth: '30%' },
  statCellNum: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  statCellLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
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
  graphContainer: { position: 'relative', marginVertical: 8 },
  graphEmpty: { padding: 16, alignItems: 'center' },
  graphEmptyText: { color: '#6B7280', fontSize: 13 },
  modalGraphLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 24, margin: 16 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  modalStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  modalStat: { flex: 1, alignItems: 'center', backgroundColor: '#0F0F1A', borderRadius: 12, padding: 12 },
  modalStatNum: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  modalStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  modalDomain: { fontSize: 14, color: '#2563EB', fontWeight: '600', marginBottom: 16, marginTop: 8 },
  modalClose: { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  modalCloseText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2D2D44' },
  settingsRowIcon: { fontSize: 20, marginRight: 12 },
  settingsRowText: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  settingsRowArrow: { fontSize: 20, color: '#6B7280' },
  settingsVersion: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  backupDesc: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  backupCodeBox: { backgroundColor: '#0F0F1A', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#2563EB' },
  backupCodeText: { fontSize: 28, fontWeight: '900', color: '#2563EB', letterSpacing: 4 },
  copyBtn: { backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4, borderWidth: 1, borderColor: '#2563EB' },
  copyBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 15 },
  legalText: { fontSize: 13, color: '#9CA3AF', lineHeight: 22, marginBottom: 16 },
  planSubtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 16 },
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
  promoTextInput: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2D2D44', fontSize: 14 },
  promoInputBtn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center' },
  promoApplyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  promoMessage: { fontSize: 13, fontWeight: '600', marginTop: 8, color: '#10B981' },
});