// CornerMind install banner (web only).
// Android/Chrome: real one-tap install via beforeinstallprompt.
// iOS Safari: instructions to tap Share -> Add to Home Screen.
// Hides when already installed; "Maybe later" remembers dismissal for 7 days.

import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const DISMISS_KEY = 'cornermind_install_dismissed_at';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type Mode = 'hidden' | 'native' | 'ios';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPrompt() {
  const [mode, setMode] = useState<Mode>('hidden');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_MS) return;
    } catch {}
    const ua = window.navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|crios|fxios|edgios).)*safari/i.test(ua);
    if (isIOS && isSafari) {
      const t = setTimeout(() => setMode('ios'), 1200);
      return () => clearTimeout(t);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode('native');
    };
    window.addEventListener('beforeinstallprompt', handler);
    const installed = () => setMode('hidden');
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setMode('hidden');
  };
  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') setMode('hidden');
      else dismiss();
    } catch { dismiss(); }
  };

  if (mode === 'hidden') return null;

  return (
    <View style={s.wrap} pointerEvents="box-none">
      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.emoji}>🧠</Text>
          <View style={s.texts}>
            <Text style={s.title}>Install CornerMind</Text>
            {mode === 'native' ? (
              <Text style={s.body}>
                Add the app to your home screen for one-tap access. No App Store needed.
              </Text>
            ) : (
              <Text style={s.body}>
                Tap the Share button at the bottom of Safari, then{' '}
                <Text style={s.bold}>"Add to Home Screen"</Text>.
              </Text>
            )}
          </View>
          <Pressable onPress={dismiss} style={s.close} hitSlop={10} accessibilityLabel="Close">
            <Text style={s.closeTxt}>X</Text>
          </Pressable>
        </View>
        {mode === 'native' && (
          <View style={s.actions}>
            <Pressable style={s.primaryBtn} onPress={install}>
              <Text style={s.primaryTxt}>Install</Text>
            </Pressable>
            <Pressable style={s.secondaryBtn} onPress={dismiss}>
              <Text style={s.secondaryTxt}>Maybe later</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, zIndex: 99999, alignItems: 'center' },
  card: { width: '100%', maxWidth: 460, backgroundColor: '#1A1A2E', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#2563EB', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  emoji: { fontSize: 26, marginRight: 10, marginTop: 2 },
  texts: { flex: 1 },
  title: { color: '#2563EB', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  body: { color: '#E5E7EB', fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '800', color: '#2563EB' },
  close: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  closeTxt: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  primaryBtn: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  primaryTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  secondaryBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: '#374151', alignItems: 'center' },
  secondaryTxt: { color: '#9CA3AF', fontWeight: '700', fontSize: 14 },
});
