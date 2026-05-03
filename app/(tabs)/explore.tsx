import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  DeviceEventEmitter,
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
  getDailyGames,
  getAllGameXPMap,
  getDaysRemaining,
  getSubscriptionStatus,
  checkPromoCode,
  redeemPromoCode,
  validateAccessCode,
} from '../storage';

const RW_GAMES = [
  { id: 1,  name: 'Word Duel',     emoji: '⚔️',  color: '#2563EB', desc: 'Vocab in context',          difficulty: 'Medium', domain: 'D1' },
  { id: 2,  name: 'Flip It',       emoji: '🔄',  color: '#1D4ED8', desc: 'Choose correct word form',  difficulty: 'Hard',   domain: 'D3' },
  { id: 3,  name: 'Error Hunt',    emoji: '🔍',  color: '#F97316', desc: 'Find punctuation errors',   difficulty: 'Medium', domain: 'D3' },
  { id: 4,  name: 'Polish Up',     emoji: '💎',  color: '#EA580C', desc: 'Refine sentences',          difficulty: 'Hard',   domain: 'D4' },
  { id: 5,  name: 'Bridge It',     emoji: '🌉',  color: '#2563EB', desc: 'Choose transitions',        difficulty: 'Easy',   domain: 'D4' },
  { id: 6,  name: 'Speed Read',    emoji: '⚡',  color: '#F97316', desc: 'Speed reading',             difficulty: 'Hard',   domain: 'D2' },
  { id: 7,  name: 'Deep Dive',     emoji: '🤿',  color: '#1D4ED8', desc: 'Comprehension',             difficulty: 'Medium', domain: 'D2' },
  { id: 8,  name: 'Tone Craft',    emoji: '🎭',  color: '#EA580C', desc: 'Expressive writing',        difficulty: 'Hard',   domain: 'D1' },
];

const MATH_GAMES = [
  { id: 9,  name: 'Shape Snap',     emoji: '🧩', color: '#2563EB', desc: 'Geometry & shapes',         difficulty: 'Medium', domain: 'D4' },
  { id: 10, name: 'Formula Forge',  emoji: '⚒️', color: '#F97316', desc: 'Math formulas',             difficulty: 'Hard',   domain: 'D2' },
  { id: 11, name: 'Graph Match',    emoji: '📈', color: '#1D4ED8', desc: 'Match equations to graphs', difficulty: 'Hard',   domain: 'D3' },
  { id: 12, name: 'Data Dash',      emoji: '📊', color: '#EA580C', desc: 'Data & statistics',         difficulty: 'Medium', domain: 'D3' },
  { id: 13, name: 'Rapid Fire',     emoji: '🎯', color: '#2563EB', desc: 'Quick calculations',        difficulty: 'Easy',   domain: 'D1' },
  { id: 14, name: 'Story Solve',    emoji: '📖', color: '#F97316', desc: 'Word problems',             difficulty: 'Medium', domain: 'D1' },
  { id: 15, name: 'Math Memory',    emoji: '🧠', color: '#1D4ED8', desc: 'Memory & sequences',        difficulty: 'Hard',   domain: 'D2' },
  { id: 16, name: 'Chain Reaction', emoji: '☢️', color: '#DC2626', desc: 'Trig, roots & chains',      difficulty: 'Hard',   domain: 'D2' },
];

const LEVELS = [
  { name: 'Leaner',     min: 0,    max: 1000,  color: '#6B7280' },
  { name: 'Thinker', min: 1001, max: 4000,  color: '#3B82F6' },
  { name: 'Scholar',     min: 4001, max: 6500,  color: '#8B5CF6' },
  { name: 'Academic',       min: 6501, max: 8000,  color: '#F59E0B' },
  { name: 'Elite',        min: 8001, max: 9000,  color: '#EF4444' },
  { name: 'Prodigy',       min: 9001, max: 10000, color: '#10B981' },
];

const GAME_ROUTES: Record<number, string> = {
  1: '/wordduel',  2: '/flipit',       3: '/errorhunt',   4: '/polishup',
  5: '/bridgeit',  6: '/speedread',    7: '/deepdive',    8: '/tonecraft',
  9: '/shapesnap', 10: '/formulaforge',11: '/graphmatch', 12: '/datadash',
  13: '/rapidfire',14: '/storysolve',  15: '/mathmemory', 16: '/chainreaction',
};

function getLevel(pts: number) {
  return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0];
}

function GameCard({ game, flipped, points, onPress, isDaily, locked }: {
  game: any; flipped: boolean; points: number;
  onPress: () => void; isDaily: boolean; locked: boolean;
}) {
  const level = getLevel(points);
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderTopColor: game.color },
        isDaily && styles.cardDaily,
        locked && styles.cardLocked,
      ]}
      onPress={onPress}
      activeOpacity={locked ? 0.5 : 0.8}
    >
      {locked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
      {isDaily && !locked && (
        <View style={styles.dailyBadgeCorner}>
          <Text style={styles.dailyBadgeText}>⭐</Text>
        </View>
      )}
      {!flipped ? (
        <View style={[styles.cardFront, locked && { opacity: 0.4 }]}>
          <View style={styles.cardTopRow}>
            <View style={[styles.domainBadge, { backgroundColor: game.color + '25' }]}>
              <Text style={[styles.domainText, { color: game.color }]}>{game.domain}</Text>
            </View>
            <View style={[styles.diffBadge, {
              backgroundColor:
                game.difficulty === 'Easy'   ? '#05966920' :
                game.difficulty === 'Medium' ? '#D9740620' : '#DC262620',
            }]}>
              <Text style={[styles.diffText, {
                color:
                  game.difficulty === 'Easy'   ? '#059669' :
                  game.difficulty === 'Medium' ? '#D97706'  : '#DC2626',
              }]}>{game.difficulty}</Text>
            </View>
          </View>
          <View style={[styles.cardEmoji, { backgroundColor: game.color + '25' }]}>
            <Text style={styles.emojiText}>{game.emoji}</Text>
          </View>
          <Text style={styles.cardName}>{game.name}</Text>
          <Text style={styles.cardDesc}>{game.desc}</Text>
        </View>
      ) : (
        <View style={[styles.cardBack, locked && { opacity: 0.4 }]}>
          <Text style={styles.cardName}>{game.name}</Text>
          <View style={[styles.domainBadge, { backgroundColor: game.color + '25', marginBottom: 4 }]}>
            <Text style={[styles.domainText, { color: game.color }]}>{game.domain}</Text>
          </View>
          <Text style={styles.cardScore}>{points} pts</Text>
          <View style={[styles.levelBadge, { backgroundColor: level.color + '25' }]}>
            <Text style={[styles.levelText, { color: level.color }]}>{level.name}</Text>
          </View>
          <Text style={styles.highScore}>
            Best: {points > 0 ? `${points} pts` : '---'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function UnlockModal({ visible, onClose, onUnlocked }: {
  visible: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [accessCode, setAccessCode]     = useState('');
  const [promoCode, setPromoCode]       = useState('');
  const [accessMsg, setAccessMsg]       = useState('');
  const [promoMsg, setPromoMsg]         = useState('');
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [loadingPromo, setLoadingPromo]   = useState(false);

  async function handleAccessCode() {
    const code = accessCode.trim();
    if (!code) { setAccessMsg('Please enter your access code'); return; }
    setLoadingAccess(true);
    setAccessMsg('');
    const result = await validateAccessCode(code);
    setLoadingAccess(false);
    if (result.valid) {
      setAccessMsg('✅ Access unlocked!');
      setTimeout(() => {
        setAccessCode('');
        setAccessMsg('');
        onUnlocked();
        onClose();
      }, 1500);
    } else {
      setAccessMsg('❌ ' + (result.message || 'Invalid code'));
    }
  }

  async function handlePromoCode() {
    const code = promoCode.trim();
    if (!code) { setPromoMsg('Please enter a promo code'); return; }
    setLoadingPromo(true);
    const plan = checkPromoCode(code);
    if (!plan) {
      setPromoMsg('❌ Invalid promo code');
      setLoadingPromo(false);
      return;
    }
    const success = await redeemPromoCode(code);
    setLoadingPromo(false);
    if (success) {
      setPromoMsg(`✅ Code applied! Enjoy ${plan} access!`);
      setTimeout(() => {
        setPromoCode('');
        setPromoMsg('');
        onUnlocked();
        onClose();
      }, 1500);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.subOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.subSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>

            <Text style={styles.subTitle}>🔓 Unlock Full Access</Text>
            <Text style={styles.subSubtitle}>
              Premium unlocks all 16 games. Daily challenges are always free.
            </Text>

            {/* Website info box */}
            <View style={styles.websiteBox}>
              <Text style={styles.websiteEmoji}>🌐</Text>
              <View style={styles.websiteInfo}>
                <Text style={styles.websiteLabel}>
                  Subscribe at:
                </Text>
                <Text style={styles.websiteUrl}>
                  tutorcornerllc.com/app
                </Text>
                <Text style={styles.websiteNote}>
                  After subscribing you will receive
                  a unique access code via email
                </Text>
              </View>
            </View>

            {/* Access code input */}
            <View style={styles.codeSection}>
              <Text style={styles.codeSectionTitle}>
                Already have an access code?
              </Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter access code"
                  placeholderTextColor="#6B7280"
                  value={accessCode}
                  onChangeText={t => {
                    setAccessCode(t);
                    setAccessMsg('');
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.codeBtn}
                  onPress={handleAccessCode}
                  disabled={loadingAccess}
                >
                  {loadingAccess
                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                    : <Text style={styles.codeBtnText}>Activate</Text>
                  }
                </TouchableOpacity>
              </View>
              {accessMsg ? (
                <Text style={[
                  styles.codeMsg,
                  { color: accessMsg.includes('✅') ? '#10B981' : '#EF4444' }
                ]}>
                  {accessMsg}
                </Text>
              ) : null}
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Promo code */}
            <View style={styles.codeSection}>
              <Text style={styles.codeSectionTitle}>
                Have a promo code?
              </Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter promo code"
                  placeholderTextColor="#6B7280"
                  value={promoCode}
                  onChangeText={t => {
                    setPromoCode(t);
                    setPromoMsg('');
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[styles.codeBtn, { backgroundColor: '#8B5CF6' }]}
                  onPress={handlePromoCode}
                  disabled={loadingPromo}
                >
                  {loadingPromo
                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                    : <Text style={styles.codeBtnText}>Apply</Text>
                  }
                </TouchableOpacity>
              </View>
              {promoMsg ? (
                <Text style={[
                  styles.codeMsg,
                  { color: promoMsg.includes('✅') ? '#10B981' : '#EF4444' }
                ]}>
                  {promoMsg}
                </Text>
              ) : null}
            </View>

            <Text style={styles.legalText}>
              Daily challenges are always free.
              Full access available at tutorcornerllc.com/app.
              SAT® is a registered trademark of College Board.
              Tutor Corner LLC® is not affiliated with
              or endorsed by College Board.
            </Text>

          </ScrollView>

          <TouchableOpacity style={styles.subCloseBtn} onPress={onClose}>
            <Text style={styles.subCloseBtnText}>Maybe Later</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function GamesScreen() {
  const [flipped, setFlipped]             = useState(false);
  const [points, setPoints]               = useState<Record<number, number>>({});
  const [dailyGameIds, setDailyGameIds]   = useState<number[]>([]);
  const [daysRemaining, setDaysRemaining] = useState(3);
  const [subStatus, setSubStatus]         = useState<'trial' | 'subscribed' | 'expired'>('trial');
  const [showUnlock, setShowUnlock]       = useState(false);
  const router    = useRouter();
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('scrollToTop_games', () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const ids    = await getDailyGames();
    setDailyGameIds(ids);
    const xpMap  = await getAllGameXPMap();
    setPoints(xpMap);
    const days   = await getDaysRemaining();
    setDaysRemaining(days);
    const status = await getSubscriptionStatus();
    setSubStatus(status);
  }

  function handleGamePress(gameId: number) {
    if (subStatus === 'expired') {
      setShowUnlock(true);
      return;
    }
    const route = GAME_ROUTES[gameId];
    if (route) router.push(route as any);
  }

  function handleDailyPress(gameId: number) {
    const route = GAME_ROUTES[gameId];
    if (route) router.push(route as any);
  }

  const isLocked = subStatus === 'expired';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Games</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Stats</Text>
            <TouchableOpacity
              style={[styles.toggle, flipped && styles.toggleOn]}
              onPress={() => setFlipped(!flipped)}
            >
              <View style={[styles.toggleDot, flipped && styles.toggleDotOn]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Trial / access banner — store safe, no prices */}
        {subStatus !== 'subscribed' && (
          <View style={[styles.infoBanner, {
            backgroundColor: '#10B98115',
            borderColor: '#10B98140',
          }]}>
            <Text style={[styles.infoBannerText, { color: '#10B981' }]}>
              🟢 Daily challenges are always free. Premium unlocks all games.
            </Text>
            <Text style={styles.infoBannerSub}>
              Manage account at tutorcornerllc.com/app
            </Text>
          </View>
        )}

        {dailyGameIds.length > 0 && (
          <View style={styles.dailyNote}>
            <Text style={styles.dailyNoteText}>
              ⭐ = Today's Challenge games
            </Text>
          </View>
        )}

        {/* Lock banner when expired — no prices, just info */}
        {isLocked && (
          <TouchableOpacity
            style={styles.lockBanner}
            onPress={() => setShowUnlock(true)}
          >
            <Text style={styles.lockBannerEmoji}>🔒</Text>
            <View style={styles.lockBannerInfo}>
              <Text style={styles.lockBannerTitle}>
                Premium Account Required
              </Text>
              <Text style={styles.lockBannerSub}>
                Have a premium account? Tap to enter your access code
              </Text>
            </View>
            <View style={styles.lockBannerBtn}>
              <Text style={styles.lockBannerBtnText}>Unlock</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>📖</Text>
          <Text style={styles.sectionTitle}>Reading & Writing</Text>
        </View>
        <View style={styles.grid}>
          {RW_GAMES.map(game => (
            <GameCard
              key={game.id}
              game={game}
              flipped={flipped}
              points={points[game.id] || 0}
              onPress={() => handleGamePress(game.id)}
              isDaily={dailyGameIds.includes(game.id)}
              locked={isLocked}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🔢</Text>
          <Text style={styles.sectionTitle}>Math</Text>
        </View>
        <View style={styles.grid}>
          {MATH_GAMES.map(game => (
            <GameCard
              key={game.id}
              game={game}
              flipped={flipped}
              points={points[game.id] || 0}
              onPress={() => handleGamePress(game.id)}
              isDaily={dailyGameIds.includes(game.id)}
              locked={isLocked}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <UnlockModal
        visible={showUnlock}
        onClose={() => setShowUnlock(false)}
        onUnlocked={() => {
          setSubStatus('subscribed');
          setShowUnlock(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20 },

  header: {
    paddingTop: 50, paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },

  toggleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel:  { color: '#9CA3AF', fontSize: 13 },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn:    { backgroundColor: '#2563EB' },
  toggleDot:   { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  toggleDotOn: { alignSelf: 'flex-end' },

  infoBanner: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12,
  },
  infoBannerText: { fontSize: 13, fontWeight: '700' },
  infoBannerSub:  { fontSize: 12, color: '#6B7280', marginTop: 3 },

  dailyNote: {
    backgroundColor: '#F9731620', borderRadius: 10,
    padding: 8, marginBottom: 12,
    borderWidth: 1, borderColor: '#F9731640',
  },
  dailyNoteText: {
    color: '#F97316', fontSize: 12,
    fontWeight: '600', textAlign: 'center',
  },

  lockBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A2E', borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#2D2D44', gap: 12,
  },
  lockBannerEmoji: { fontSize: 28 },
  lockBannerInfo:  { flex: 1 },
  lockBannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  lockBannerSub:   { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  lockBannerBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  lockBannerBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 12, marginTop: 8,
    backgroundColor: '#1A1A2E', borderRadius: 12, padding: 12,
  },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 },

  card: {
    width: '47%', backgroundColor: '#1A1A2E',
    borderRadius: 16, padding: 12, borderTopWidth: 3,
  },
  cardDaily:  { borderWidth: 1, borderColor: '#F9731640', borderTopWidth: 3 },
  cardLocked: { opacity: 0.6 },

  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10, borderRadius: 16,
  },
  lockIcon: { fontSize: 24 },

  dailyBadgeCorner: { position: 'absolute', top: 6, right: 6, zIndex: 10 },
  dailyBadgeText:   { fontSize: 14 },

  cardFront: { alignItems: 'center', gap: 6 },
  cardBack:  { alignItems: 'center', gap: 5 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

  cardEmoji: {
    width: 50, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  emojiText: { fontSize: 26 },
  cardName:  { fontSize: 13, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  cardDesc:  { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },

  domainBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  domainText:  { fontSize: 11, fontWeight: '700' },
  diffBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText:    { fontSize: 11, fontWeight: '600' },

  cardScore: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelText:  { fontSize: 12, fontWeight: '700' },
  highScore:  { fontSize: 11, color: '#6B7280' },

  // Unlock modal
  subOverlay: { flex: 1, backgroundColor: '#00000090', justifyContent: 'flex-end' },
  subSheet: {
    backgroundColor: '#1A1A2E', borderRadius: 24,
    padding: 24, margin: 12, maxHeight: '85%',
  },
  subTitle:    { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  subSubtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },

  websiteBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#0F0F1A', borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#2563EB30', gap: 12,
  },
  websiteEmoji: { fontSize: 28, marginTop: 2 },
  websiteInfo:  { flex: 1 },
  websiteLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  websiteUrl: {
    fontSize: 18, fontWeight: '900', color: '#2563EB',
    marginBottom: 6,
  },
  websiteNote: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  codeSection:      { marginBottom: 16 },
  codeSectionTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },

  codeRow: { flexDirection: 'row', gap: 8 },
  codeInput: {
    flex: 1, backgroundColor: '#0F0F1A',
    borderRadius: 12, padding: 13,
    color: '#FFFFFF', borderWidth: 1.5,
    borderColor: '#2D2D44', fontSize: 14,
    fontWeight: '700', letterSpacing: 1,
  },
  codeBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingHorizontal: 16, justifyContent: 'center',
    alignItems: 'center', minWidth: 80,
  },
  codeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  codeMsg:     { fontSize: 13, fontWeight: '600', marginTop: 8 },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2D2D44' },
  dividerText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },

  legalText: {
    fontSize: 11, color: '#4B5563',
    lineHeight: 18, marginTop: 8, marginBottom: 8,
  },

  subCloseBtn: {
    backgroundColor: '#2D2D44', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 8,
  },
  subCloseBtnText: { color: '#9CA3AF', fontWeight: '700', fontSize: 15 },
});