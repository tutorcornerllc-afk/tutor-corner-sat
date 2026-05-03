import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// ─── GOOGLE SHEETS CONNECTION ─────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbys36yf4TYLrTwlL6hJ9d5qG8sGXifqGxhQpPQuvLVeO8RIdalwAn68gnXTDm1d3ryZ/exec';

export async function getDeviceId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem('device_id');
    if (stored) return stored;
    const id = Device.modelName + '-' +
      Math.random().toString(36).substring(2, 10).toUpperCase();
    await AsyncStorage.setItem('device_id', id);
    return id;
  } catch {
    return 'unknown-device';
  }
}

export async function validateAccessCode(code: string): Promise<{
  valid: boolean;
  plan?: string;
  expiry?: string;
  reason?: string;
  message?: string;
}> {
  try {
    const deviceId = await getDeviceId();
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'validate_code',
        code:     code.trim().toUpperCase(),
        deviceId: deviceId,
      }),
    });
    const result = await response.json();
    if (result.valid) {
      await AsyncStorage.setItem('access_code', code.trim().toUpperCase());
      await AsyncStorage.setItem('access_plan', result.plan || '');
      await AsyncStorage.setItem('access_expiry', result.expiry || '');
      await AsyncStorage.setItem('last_validated', Date.now().toString());
      await setSubscribed(result.plan || 'website');
    }
    return result;
  } catch (e) {
    // Offline fallback
    const cached = await AsyncStorage.getItem('access_code');
    const lastCheck = await AsyncStorage.getItem('last_validated');
    if (cached && lastCheck) {
      const daysSince = (Date.now() - parseInt(lastCheck)) / 86400000;
      if (daysSince < 7) {
        return { valid: true, plan: 'offline', message: 'Offline — using cached access' };
      }
    }
    return { valid: false, reason: 'network', message: 'No internet connection. Try again.' };
  }
}

export async function checkSubscriptionOnline(): Promise<void> {
  try {
    const code = await AsyncStorage.getItem('access_code');
    if (!code) return;
    const deviceId = await getDeviceId();
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'validate_code',
        code:     code,
        deviceId: deviceId,
      }),
    });
    const result = await response.json();
    if (result.valid) {
      await AsyncStorage.setItem('last_validated', Date.now().toString());
      await setSubscribed(result.plan || 'website');
    } else {
      if (result.reason === 'expired') {
        await AsyncStorage.removeItem('access_code');
        const sub = { status: 'expired', plan: '', date: Date.now() };
        await AsyncStorage.setItem('subscription', JSON.stringify(sub));
      }
      if (result.reason === 'blocked' || result.reason === 'wrong_device') {
        await AsyncStorage.removeItem('access_code');
        const sub = { status: 'expired', plan: '', date: Date.now() };
        await AsyncStorage.setItem('subscription', JSON.stringify(sub));
      }
    }
  } catch (e) {
    // Offline — keep existing status, 7 day grace period
    const lastCheck = await AsyncStorage.getItem('last_validated');
    if (lastCheck) {
      const daysSince = (Date.now() - parseInt(lastCheck)) / 86400000;
      if (daysSince > 7) {
        const sub = { status: 'expired', plan: '', date: Date.now() };
        await AsyncStorage.setItem('subscription', JSON.stringify(sub));
      }
    }
  }
}

export async function sendUserDataToSheets(userData: {
  type: string;
  email?: string;
  phone?: string;
  totalXP?: number;
  gamesPlayed?: number;
  streak?: number;
  subStatus?: string;
  ageConfirmed?: boolean;
  agreedTerms?: boolean;
  wantsMarketing?: boolean;
  backupCode?: string;
  accessCode?: string;
}): Promise<void> {
  try {
    const deviceId = await getDeviceId();
    await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'save_user',
        deviceId: deviceId,
        appVersion: '1.0.0',
        ...userData,
      }),
    });
  } catch (e) {
    console.log('Sheets sync failed silently');
  }
}

// ─── PROMO CODES ─────────────────────────────────────────────────────────────
const PROMO_CODES: Record<string, string> = {
  'WELCOME2024': 'monthly',
  'TEACHER': 'yearly',
  'LIFETIME99': 'lifetime',
  'FRIEND2024': 'monthly',
  'TEACHER123': 'yearly',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface GameResult {
  gameId: number;
  score: number;
  xp: number;
  domain: string;
  speedy: number;
  lives: number;
  date: number;
}

export interface StreakData {
  currentStreak: number;
  lastPlayedDate: string;
}

export interface SubscriptionData {
  status: 'trial' | 'subscribed' | 'expired';
  plan: string;
  date: number;
}

// ─── GAME HISTORY ─────────────────────────────────────────────────────────────
export async function saveGameResult(
  gameId: number,
  score: number,
  xp: number,
  domain: string,
  speedy: number,
  lives: number,
  date: number
): Promise<void> {
  try {
    const key = `game_history_${gameId}`;
    const existing = await AsyncStorage.getItem(key);
    const history: GameResult[] = existing ? JSON.parse(existing) : [];
    const newResult: GameResult = { gameId, score, xp, domain, speedy, lives, date };
    history.push(newResult);
    if (history.length > 50) history.splice(0, history.length - 50);
    await AsyncStorage.setItem(key, JSON.stringify(history));

    const domainKey = `domain_xp_${domain}`;
    const currentDomainXP = await AsyncStorage.getItem(domainKey);
    const newDomainXP = (currentDomainXP ? parseInt(currentDomainXP) : 0) + xp;
    await AsyncStorage.setItem(domainKey, String(newDomainXP));

    const today = new Date().toISOString().split('T')[0];
    const todayKey = `today_xp_${today}`;
    const currentTodayXP = await AsyncStorage.getItem(todayKey);
    const newTodayXP = (currentTodayXP ? parseInt(currentTodayXP) : 0) + xp;
    await AsyncStorage.setItem(todayKey, String(newTodayXP));

    await updateStreak();
  } catch (e) {
    console.error('saveGameResult error:', e);
  }
}

export async function getGameHistory(gameId: number): Promise<GameResult[]> {
  try {
    const key = `game_history_${gameId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getGameBestScore(gameId: number): Promise<number> {
  try {
    const history = await getGameHistory(gameId);
    if (history.length === 0) return 0;
    return Math.max(...history.map(r => r.score));
  } catch {
    return 0;
  }
}

export async function getGameTotalXP(gameId: number): Promise<number> {
  try {
    const history = await getGameHistory(gameId);
    return history.reduce((sum, r) => sum + r.xp, 0);
  } catch {
    return 0;
  }
}

export async function getGamePlayCount(gameId: number): Promise<number> {
  try {
    const history = await getGameHistory(gameId);
    return history.length;
  } catch {
    return 0;
  }
}

// ─── XP ───────────────────────────────────────────────────────────────────────
export async function getAllGamesTotalXP(): Promise<number> {
  try {
    const domains = [
      'rw_d1','rw_d2','rw_d3','rw_d4',
      'math_d1','math_d2','math_d3','math_d4',
    ];
    let total = 0;
    for (const d of domains) {
      const val = await AsyncStorage.getItem(`domain_xp_${d}`);
      if (val) total += parseInt(val);
    }
    return total;
  } catch {
    return 0;
  }
}

export async function getDomainXP(domain: string): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(`domain_xp_${domain}`);
    return val ? parseInt(val) : 0;
  } catch {
    return 0;
  }
}

export async function getTodayXP(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const val = await AsyncStorage.getItem(`today_xp_${today}`);
    return val ? parseInt(val) : 0;
  } catch {
    return 0;
  }
}

export async function getAllGameXPMap(): Promise<Record<number, number>> {
  try {
    const gameIds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    const map: Record<number, number> = {};
    for (const id of gameIds) {
      map[id] = await getGameTotalXP(id);
    }
    return map;
  } catch {
    return {};
  }
}

// ─── STREAK ───────────────────────────────────────────────────────────────────
export async function getStreak(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem('streak_data');
    if (!data) return 0;
    const streak: StreakData = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastPlayedDate === today || streak.lastPlayedDate === yesterday) {
      return streak.currentStreak;
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function updateStreak(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const data = await AsyncStorage.getItem('streak_data');
    let streak: StreakData = data
      ? JSON.parse(data)
      : { currentStreak: 0, lastPlayedDate: '' };

    if (streak.lastPlayedDate === today) return;
    else if (streak.lastPlayedDate === yesterday) streak.currentStreak += 1;
    else streak.currentStreak = 1;

    streak.lastPlayedDate = today;
    await AsyncStorage.setItem('streak_data', JSON.stringify(streak));
  } catch (e) {
    console.error('updateStreak error:', e);
  }
}

// ─── BACKUP CODE ──────────────────────────────────────────────────────────────
export async function getBackupCode(): Promise<string> {
  try {
    const code = await AsyncStorage.getItem('backup_code');
    return code || '';
  } catch {
    return '';
  }
}

export async function generateBackupCodeIfNeeded(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem('backup_code');
    if (existing) return existing;
    const code =
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    await AsyncStorage.setItem('backup_code', code);
    return code;
  } catch {
    return 'ERROR';
  }
}

// ─── INSTALL DATE & TRIAL ─────────────────────────────────────────────────────
export async function setInstallDateIfNeeded(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem('install_date');
    if (!existing) {
      await AsyncStorage.setItem('install_date', new Date().toISOString());
    }
  } catch (e) {
    console.error('setInstallDateIfNeeded error:', e);
  }
}

export async function getInstallDate(): Promise<Date> {
  try {
    const val = await AsyncStorage.getItem('install_date');
    return val ? new Date(val) : new Date();
  } catch {
    return new Date();
  }
}

export async function getDaysRemaining(): Promise<number> {
  try {
    const installDate = await getInstallDate();
    const now = new Date();
    const diffMs = now.getTime() - installDate.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const remaining = 3 - diffDays;
    return remaining < 0 ? 0 : remaining;
  } catch {
    return 3;
  }
}

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────────
export async function getSubscriptionStatus(): Promise<'trial' | 'subscribed' | 'expired'> {
  try {
    const subData = await AsyncStorage.getItem('subscription');
    if (subData) {
      const sub: SubscriptionData = JSON.parse(subData);
      if (sub.status === 'subscribed') return 'subscribed';
    }
    const daysRemaining = await getDaysRemaining();
    if (daysRemaining > 0) return 'trial';
    return 'expired';
  } catch {
    return 'trial';
  }
}

export async function setSubscribed(plan: string): Promise<void> {
  try {
    const sub: SubscriptionData = {
      status: 'subscribed',
      plan,
      date: Date.now(),
    };
    await AsyncStorage.setItem('subscription', JSON.stringify(sub));
  } catch (e) {
    console.error('setSubscribed error:', e);
  }
}

export async function isGameAccessible(): Promise<boolean> {
  const status = await getSubscriptionStatus();
  return status === 'trial' || status === 'subscribed';
}

// ─── PROMO CODES ──────────────────────────────────────────────────────────────
export function checkPromoCode(code: string): string | null {
  const upper = code.trim().toUpperCase();
  return PROMO_CODES[upper] || null;
}

export async function redeemPromoCode(code: string): Promise<boolean> {
  try {
    const plan = checkPromoCode(code);
    if (!plan) return false;
    await setSubscribed(plan);
    await AsyncStorage.setItem(`promo_used_${code.toUpperCase()}`, '1');
    return true;
  } catch {
    return false;
  }
}

// ─── SOUND SETTING ────────────────────────────────────────────────────────────
export async function getSoundEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem('sound_enabled');
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem('sound_enabled', String(enabled));
  } catch (e) {
    console.error('setSoundEnabled error:', e);
  }
}

// ─── DAILY CHALLENGE ──────────────────────────────────────────────────────────
export async function getDailyGames(): Promise<number[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_games_${today}`;
    const existing = await AsyncStorage.getItem(key);
    if (existing) return JSON.parse(existing);
    const rwGames = [1, 2, 3, 4, 5, 6, 7, 8];
    const mathGames = [9, 10, 11, 12, 13, 14, 15, 16];
    const seed = today.replace(/-/g, '');
    const n = parseInt(seed) % 1000;
    const rw1 = rwGames[n % 8];
    const rw2 = rwGames[(n + 3) % 8];
    const m1 = mathGames[n % 8];
    const m2 = mathGames[(n + 5) % 8];
    const games = [
      rw1,
      rw2 === rw1 ? rwGames[(n + 4) % 8] : rw2,
      m1,
      m2 === m1 ? mathGames[(n + 6) % 8] : m2,
    ];
    await AsyncStorage.setItem(key, JSON.stringify(games));
    return games;
  } catch {
    return [1, 3, 9, 12];
  }
}

export async function markDailyComplete(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`daily_complete_${today}`, '1');
    const todayKey = `today_xp_${today}`;
    const current = await AsyncStorage.getItem(todayKey);
    const newVal = (current ? parseInt(current) : 0) + 20;
    await AsyncStorage.setItem(todayKey, String(newVal));
  } catch (e) {
    console.error('markDailyComplete error:', e);
  }
}

export async function isDailyComplete(): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const val = await AsyncStorage.getItem(`daily_complete_${today}`);
    return val === '1';
  } catch {
    return false;
  }
}

// ─── FIRST LAUNCH ─────────────────────────────────────────────────────────────
export async function isFirstLaunch(): Promise<boolean> {
  try {
    const seen = await AsyncStorage.getItem('has_seen_welcome');
    return !seen;
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem('has_seen_welcome', '1');
  } catch {}
}

// ─── BADGES ───────────────────────────────────────────────────────────────────
export interface BadgeStatus {
  id: string;
  unlocked: boolean;
}

export async function checkAndUnlockBadges(): Promise<string[]> {
  try {
    const totalXP = await getAllGamesTotalXP();
    const streak = await getStreak();
    const allHistory: GameResult[] = [];
    for (let i = 1; i <= 16; i++) {
      const h = await getGameHistory(i);
      allHistory.push(...h);
    }
    const gamesPlayed = allHistory.length;
    const uniqueGames = new Set(allHistory.map(r => r.gameId)).size;
    const topScore = allHistory.length > 0
      ? Math.max(...allHistory.map(r => r.score)) : 0;
    const totalSpeedy = allHistory.reduce((s, r) => s + (r.speedy || 0), 0);
    const perfectScores = allHistory.filter(r => r.score >= 100).length;

    const newlyUnlocked: string[] = [];
    const badgeChecks = [
      { id: 'first_step',    condition: gamesPlayed >= 1 },
      { id: 'game_explorer', condition: uniqueGames >= 8 },
      { id: 'game_master',   condition: uniqueGames >= 16 },
      { id: 'rising_star',   condition: totalXP >= 100 },
      { id: 'scholar',       condition: totalXP >= 500 },
      { id: 'honor_roll',    condition: totalXP >= 1000 },
      { id: 'champion',      condition: totalXP >= 2000 },
      { id: 'elite',         condition: totalXP >= 3300 },
      { id: 'legendary',     condition: totalXP >= 4700 },
      { id: 'spark',         condition: streak >= 3 },
      { id: 'blazing',       condition: streak >= 7 },
      { id: 'inferno',       condition: streak >= 14 },
      { id: 'quick_draw',    condition: totalSpeedy >= 3 },
      { id: 'speed_demon',   condition: totalSpeedy >= 25 },
      { id: 'lightning',     condition: totalSpeedy >= 100 },
      { id: 'sharp',         condition: topScore >= 80 },
      { id: 'perfectionist', condition: perfectScores >= 1 },
      { id: 'flawless',      condition: perfectScores >= 5 },
    ];

    for (const badge of badgeChecks) {
      if (!badge.condition) continue;
      const key = `badge_${badge.id}`;
      const already = await AsyncStorage.getItem(key);
      if (!already) {
        await AsyncStorage.setItem(key, '1');
        newlyUnlocked.push(badge.id);
      }
    }
    return newlyUnlocked;
  } catch {
    return [];
  }
}

export async function getBadgeUnlocked(badgeId: string): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(`badge_${badgeId}`);
    return val === '1';
  } catch {
    return false;
  }
}

// ─── PERCENTILE & LEVEL ───────────────────────────────────────────────────────
export function getPercentile(totalXP: number): string {
  if (totalXP >= 9000) return 'Top 5%';
  if (totalXP >= 8000) return 'Top 10%';
  if (totalXP >= 6500) return 'Top 25%';
  if (totalXP >= 4000) return 'Top 40%';
  if (totalXP >= 1000) return 'Top 60%';
  if (totalXP >= 500)  return 'Top 75%';
  return 'Top 90%';
}

export function getLevel(xp: number): string {
  if (xp >= 9000) return 'Prodigy';
  if (xp >= 8000) return 'Elite';
  if (xp >= 6500) return 'Academic';
  if (xp >= 4000) return 'Scholar';
  if (xp >= 1000) return 'Thinker';
  return 'Learner';
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
export async function sendOnboardingData(data: {
  name: string;
  email: string;
  phone: string;
  agreedAge: boolean;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedRefund: boolean;
  agreedLiability: boolean;
  agreedSat: boolean;
  marketing: boolean;
  skipped: boolean;
}): Promise<void> {
  try {
    const deviceId   = await getDeviceId();
    const backupCode = await generateBackupCodeIfNeeded();
    await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:     'save_backup',
        deviceId:   deviceId,
        backupCode: backupCode,
        ...data,
      }),
    });
  } catch (e) {
    console.log('Onboarding sync failed silently');
  }
}

// ─── CLEAR ALL DATA ───────────────────────────────────────────────────────────
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('clearAllData error:', e);
  }
}

export default {};