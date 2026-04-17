import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Modal, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import {
  getDailyGames,
  getAllGameXPMap,
  getDaysRemaining,
  getSubscriptionStatus,
  checkPromoCode,
  redeemPromoCode,
} from '../storage';

const RW_GAMES = [
  { id: 1, name: 'Word Duel', emoji: '⚔️', color: '#2563EB', desc: 'Vocab in context', difficulty: 'Medium', domain: 'D1' },
  { id: 2, name: 'Flip It', emoji: '🔄', color: '#1D4ED8', desc: 'Choose correct word form', difficulty: 'Hard', domain: 'D3' },
  { id: 3, name: 'Error Hunt', emoji: '🔍', color: '#F97316', desc: 'Find punctuation errors', difficulty: 'Medium', domain: 'D3' },
  { id: 4, name: 'Polish Up', emoji: '💎', color: '#EA580C', desc: 'Refine sentences', difficulty: 'Hard', domain: 'D4' },
  { id: 5, name: 'Bridge It', emoji: '🌉', color: '#2563EB', desc: 'Choose transitions', difficulty: 'Easy', domain: 'D4' },
  { id: 6, name: 'Speed Read', emoji: '⚡', color: '#F97316', desc: 'Speed reading', difficulty: 'Hard', domain: 'D2' },
  { id: 7, name: 'Deep Dive', emoji: '🤿', color: '#1D4ED8', desc: 'Comprehension', difficulty: 'Medium', domain: 'D2' },
  { id: 8, name: 'Tone Craft', emoji: '🎭', color: '#EA580C', desc: 'Expressive writing', difficulty: 'Hard', domain: 'D1' },
];

const MATH_GAMES = [
  { id: 9, name: 'Shape Snap', emoji: '🧩', color: '#2563EB', desc: 'Geometry & shapes', difficulty: 'Medium', domain: 'D4' },
  { id: 10, name: 'Formula Forge', emoji: '⚒️', color: '#F97316', desc: 'Math formulas', difficulty: 'Hard', domain: 'D2' },
  { id: 11, name: 'Graph Match', emoji: '📈', color: '#1D4ED8', desc: 'Match equations to graphs', difficulty: 'Hard', domain: 'D3' },
  { id: 12, name: 'Data Dash', emoji: '📊', color: '#EA580C', desc: 'Data & statistics', difficulty: 'Medium', domain: 'D3' },
  { id: 13, name: 'Rapid Fire', emoji: '🎯', color: '#2563EB', desc: 'Quick calculations', difficulty: 'Easy', domain: 'D1' },
  { id: 14, name: 'Story Solve', emoji: '📖', color: '#F97316', desc: 'Word problems', difficulty: 'Medium', domain: 'D1' },
  { id: 15, name: 'Math Memory', emoji: '🧠', color: '#1D4ED8', desc: 'Memory & sequences', difficulty: 'Hard', domain: 'D2' },
  { id: 16, name: 'Chain Reaction', emoji: '☢️', color: '#DC2626', desc: 'Trig, roots & complex chains', difficulty: 'Hard', domain: 'D2' },
];

const LEVELS = [
  { name: 'Beginner', min: 0, max: 1000, color: '#6B7280' },
  { name: 'Intermediate', min: 1001, max: 2000, color: '#3B82F6' },
  { name: 'Advanced', min: 2001, max: 3300, color: '#8B5CF6' },
  { name: 'Expert', min: 3301, max: 4000, color: '#F59E0B' },
  { name: 'Elite', min: 4001, max: 4700, color: '#EF4444' },
  { name: 'Master', min: 4701, max: 99999, color: '#10B981' },
];

const GAME_ROUTES: Record<number, string> = {
  1: '/wordduel', 2: '/flipit', 3: '/errorhunt', 4: '/polishup',
  5: '/bridgeit', 6: '/speedread', 7: '/deepdive', 8: '/tonecraft',
  9: '/shapesnap', 10: '/formulaforge', 11: '/graphmatch', 12: '/datadash',
  13: '/rapidfire', 14: '/storysolve', 15: '/mathmemory', 16: '/chainreaction',
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
      style={[styles.card, { borderTopColor: game.color }, isDaily && styles.cardDaily, locked && styles.cardLocked]}
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
              backgroundColor: game.difficulty === 'Easy' ? '#05966920' :
                game.difficulty === 'Medium' ? '#D9740620' : '#DC262620',
            }]}>
              <Text style={[styles.diffText, {
                color: game.difficulty === 'Easy' ? '#059669' :
                  game.difficulty === 'Medium' ? '#D97706' : '#DC2626',
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
          <Text style={styles.highScore}>Best: {points > 0 ? `${points} pts` : '---'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function SubscriptionSheet({ visible, onClose, onSubscribed }: {
  visible: boolean; onClose: () => void; onSubscribed: () => void;
}) {
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) { setPromoMessage('Enter a code first'); return; }
    const plan = checkPromoCode(code);
    if (!plan) { setPromoMessage('❌ Invalid code'); return; }
    const success = await redeemPromoCode(code);
    if (success) {
      setPromoMessage(`✅ Code applied! Enjoy ${plan} access!`);
      setTimeout(() => { onSubscribed(); setPromoMessage(''); setPromoCode(''); }, 2000);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.subOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.subSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.subTitle}>👑 Unlock Full Access</Text>
            <Text style={styles.subSubtitle}>Continue your SAT prep journey</Text>

            {/* Monthly */}
            <View style={styles.planCard}>
              <View style={styles.planBadge}><Text style={styles.planBadgeText}>Most Flexible</Text></View>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planPrice}>$9.99<Text style={styles.planPer}>/month</Text></Text>
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
              <Text style={styles.planPrice}>$99.99<Text style={styles.planPer}>/year</Text></Text>
              <Text style={styles.planSave}>Save 17% vs monthly · 2 months FREE</Text>
              <Text style={styles.planFeature}>✅ Everything in Monthly</Text>
              <Text style={styles.planFeature}>✅ Priority support</Text>
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
                  style={styles.promoInput}
                  placeholder="Enter code"
                  placeholderTextColor="#6B7280"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.promoBtn} onPress={handleApplyPromo}>
                  <Text style={styles.promoBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
              {promoMessage ? (
                <Text style={[styles.promoMsg, { color: promoMessage.includes('✅') ? '#10B981' : '#EF4444' }]}>
                  {promoMessage}
                </Text>
              ) : null}
            </View>

            <Text style={styles.legalText}>
              By subscribing you agree to our Terms of Service. Lifetime purchase provides access to current app. Tutor Corner LLC reserves the right to modify the app. No refunds after purchase. Cancel monthly/yearly anytime from App Store settings. No guarantee of SAT score improvement.
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
  const [flipped, setFlipped] = useState(false);
  const [points, setPoints] = useState<Record<number, number>>({});
  const [dailyGameIds, setDailyGameIds] = useState<number[]>([]);
  const [daysRemaining, setDaysRemaining] = useState(3);
  const [subStatus, setSubStatus] = useState<'trial' | 'subscribed' | 'expired'>('trial');
  const [showSubscription, setShowSubscription] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<any>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const ids = await getDailyGames();
    setDailyGameIds(ids);
    const xpMap = await getAllGameXPMap();
    setPoints(xpMap);
    const days = await getDaysRemaining();
    setDaysRemaining(days);
    const status = await getSubscriptionStatus();
    setSubStatus(status);
  }

  function handleGamePress(gameId: number) {
    if (subStatus === 'expired') { setShowSubscription(true); return; }
    const route = GAME_ROUTES[gameId];
    if (route) router.push(route as any);
  }

  const isLocked = subStatus === 'expired';
  const trialBannerColor = daysRemaining >= 2 ? '#10B981' : daysRemaining === 1 ? '#F97316' : '#EF4444';
  const trialBannerText = daysRemaining >= 2
    ? `🟢 ${daysRemaining} days of free access left`
    : daysRemaining === 1
    ? '🟡 Last day of free trial!'
    : '🔴 Free trial ended — unlock to continue';

  return (
    <SafeAreaView style={styles.safe}>

      {/* Trial Banner */}
      {subStatus !== 'subscribed' && (
        <TouchableOpacity
          style={[styles.trialBanner, { backgroundColor: trialBannerColor + '20', borderColor: trialBannerColor }]}
          onPress={() => setShowSubscription(true)}
        >
          <Text style={[styles.trialBannerText, { color: trialBannerColor }]}>{trialBannerText}</Text>
          <Text style={[styles.trialBannerAction, { color: trialBannerColor }]}>Unlock →</Text>
        </TouchableOpacity>
      )}

      <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>

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

        {dailyGameIds.length > 0 && (
          <View style={styles.dailyNote}>
            <Text style={styles.dailyNoteText}>⭐ = Today's Challenge games</Text>
          </View>
        )}

        {isLocked && (
          <TouchableOpacity style={styles.lockBanner} onPress={() => setShowSubscription(true)}>
            <Text style={styles.lockBannerEmoji}>🔓</Text>
            <View style={styles.lockBannerInfo}>
              <Text style={styles.lockBannerTitle}>Trial Ended</Text>
              <Text style={styles.lockBannerSub}>Tap to unlock all 16 games</Text>
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
            <GameCard key={game.id} game={game} flipped={flipped}
              points={points[game.id] || 0} onPress={() => handleGamePress(game.id)}
              isDaily={dailyGameIds.includes(game.id)} locked={isLocked} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🔢</Text>
          <Text style={styles.sectionTitle}>Math</Text>
        </View>
        <View style={styles.grid}>
          {MATH_GAMES.map(game => (
            <GameCard key={game.id} game={game} flipped={flipped}
              points={points[game.id] || 0} onPress={() => handleGamePress(game.id)}
              isDaily={dailyGameIds.includes(game.id)} locked={isLocked} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <SubscriptionSheet
        visible={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSubscribed={() => { setSubStatus('subscribed'); setShowSubscription(false); }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  container: { flex: 1, paddingHorizontal: 20 },
  trialBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  trialBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
  trialBannerAction: { fontSize: 13, fontWeight: '800' },
  header: { paddingTop: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { color: '#9CA3AF', fontSize: 13 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#374151', justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: '#2563EB' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  toggleDotOn: { alignSelf: 'flex-end' },
  dailyNote: { backgroundColor: '#F9731620', borderRadius: 10, padding: 8, marginBottom: 12, borderWidth: 1, borderColor: '#F9731640' },
  dailyNoteText: { color: '#F97316', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  lockBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF444420', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EF4444', gap: 12 },
  lockBannerEmoji: { fontSize: 28 },
  lockBannerInfo: { flex: 1 },
  lockBannerTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  lockBannerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  lockBannerBtn: { backgroundColor: '#EF4444', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  lockBannerBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 12 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 },
  card: { width: '47%', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 12, borderTopWidth: 3 },
  cardDaily: { borderWidth: 1, borderColor: '#F9731640', borderTopWidth: 3 },
  cardLocked: { opacity: 0.6 },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 16 },
  lockIcon: { fontSize: 24 },
  dailyBadgeCorner: { position: 'absolute', top: 6, right: 6, zIndex: 10 },
  dailyBadgeText: { fontSize: 14 },
  cardFront: { alignItems: 'center', gap: 6 },
  cardBack: { alignItems: 'center', gap: 5 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cardEmoji: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  emojiText: { fontSize: 26 },
  cardName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  cardDesc: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  domainBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  domainText: { fontSize: 11, fontWeight: '700' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 11, fontWeight: '600' },
  cardScore: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 12, fontWeight: '700' },
  highScore: { fontSize: 11, color: '#6B7280' },
  subOverlay: { flex: 1, backgroundColor: '#00000090', justifyContent: 'flex-end' },
  subSheet: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 24, margin: 12, maxHeight: '90%' },
  subTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  subSubtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
  planCard: { backgroundColor: '#0F0F1A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D2D44' },
  planCardHighlight: { borderColor: '#F97316' },
  planBadge: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  planBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  planName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  planPrice: { fontSize: 28, fontWeight: '900', color: '#2563EB', marginBottom: 4 },
  planPer: { fontSize: 14, fontWeight: '400', color: '#9CA3AF' },
  planSave: { fontSize: 12, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  planFeature: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  planBtn: { backgroundColor: '#2563EB', borderRadius: 50, padding: 14, alignItems: 'center', marginTop: 12 },
  planBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  promoBox: { backgroundColor: '#0F0F1A', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D2D44' },
  promoLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 10 },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, backgroundColor: '#1A1A2E', borderRadius: 10, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#2D2D44', fontSize: 14 },
  promoBtn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center' },
  promoBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  promoMsg: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  legalText: { fontSize: 11, color: '#6B7280', lineHeight: 18, marginBottom: 16 },
  subCloseBtn: { backgroundColor: '#2D2D44', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  subCloseBtnText: { color: '#9CA3AF', fontWeight: '700', fontSize: 15 },
});