import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── SOUND FILES ──────────────────────────────────────────────────────────────
// Files needed in assets/sounds/:
// tap.wav, correct.wav, wrong.wav, celebration_big.wav, celebration_small.wav

const SOUND_FILES: Record<string, any> = {
  tap:                require('../assets/sounds/tap.wav'),
  correct:            require('../assets/sounds/correct.wav'),
  wrong:              require('../assets/sounds/wrong.wav'),
  celebration_big:    require('../assets/sounds/celebration_big.wav'),
  celebration_small:  require('../assets/sounds/celebration_small.wav'),
  // Add these later if you get more files:
  // celebration_medium: require('../assets/sounds/celebration_medium.wav'),
  // chain_complete:     require('../assets/sounds/chain_complete.wav'),
  // speedy:             require('../assets/sounds/speedy.wav'),
};

const soundCache: Record<string, Audio.Sound> = {};

async function isSoundEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem('sound_enabled');
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

async function playSound(name: string, volume: number = 1.0): Promise<void> {
  try {
    const enabled = await isSoundEnabled();
    if (!enabled) return;
    const file = SOUND_FILES[name];
    if (!file) return;
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
    });
    if (soundCache[name]) {
      try { await soundCache[name].unloadAsync(); } catch {}
    }
    const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true, volume });
    soundCache[name] = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        delete soundCache[name];
      }
    });
  } catch {
    // Always silent fail — never crash the game
  }
}

// ─── PUBLIC FUNCTIONS ─────────────────────────────────────────────────────────

/** Bubble pop on every answer tap — games only */
export async function playTapSound(): Promise<void> {
  await playSound('tap', 0.6);
}

/** Rising ding on correct answer */
export async function playCorrectSound(): Promise<void> {
  await playSound('correct', 1.0);
}

/** Low thud on wrong answer */
export async function playWrongSound(): Promise<void> {
  await playSound('wrong', 0.8);
}

/**
 * Celebration on results screen load
 * >= 75 → big fireworks
 * < 75  → small chime
 */
export async function playCelebration(score: number): Promise<void> {
  if (score >= 75) await playSound('celebration_big', 1.0);
  else await playSound('celebration_small', 0.7);
}

/** Chain Reaction chain complete */
export async function playChainComplete(): Promise<void> {
  await playSound('celebration_big', 1.0);
}

/** Speedy bonus */
export async function playSpeedySound(): Promise<void> {
  await playSound('correct', 0.8);
}

/** Call once at app start */
export async function preloadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
    });
  } catch {}
}

export default {};