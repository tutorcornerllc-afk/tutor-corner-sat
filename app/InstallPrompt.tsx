// CornerMind install banner (web only).
// Android/Chrome: real one-tap install via beforeinstallprompt.
// iOS Safari: tap "Install" → modal with visual Share → Add to Home Screen steps.
// Hides when already installed; "Maybe later" remembers dismissal for 7 days.

import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const [iosModalOpen, setIosModalOpen] = useState(false);

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
    setIosModalOpen(false);
  };
  const install = async () => {
    if (mode === 'ios') {
      setIosModalOpen(true);
      return;
    }
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
    <>
      <View style={s.wrap} pointerEvents="box-none">
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.emoji}>🧠</Text>
            <View style={s.texts}>
              <Text style={s.title}>Install CornerMind</Text>
              <Text style={s.body}>
                {mode === 'native'
                  ? 'Add the app to your home screen for one-tap access. No App Store needed.'
                  : 'Tap Install to add CornerMind to your iPhone home screen — no App Store needed.'}
              </Text>
            </View>
            <Pressable onPress={dismiss} style={s.close} hitSlop={10} accessibilityLabel="Close">
              <Text style={s.closeTxt}>X</Text>
            </Pressable>
          </View>
          <View style={s.actions}>
            <Pressable style={s.primaryBtn} onPress={install}>
              <Text style={s.primaryTxt}>📲 Install App</Text>
            </Pressable>
            <Pressable style={s.secondaryBtn} onPress={dismiss}>
              <Text style={s.secondaryTxt}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* iOS instruction modal */}
      <Modal
        visible={iosModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIosModalOpen(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalTitle}>📲 Install CornerMind</Text>
              <Text style={s.modalSub}>
                iPhone needs 3 quick taps — Apple doesn't allow apps to install themselves on iOS.
              </Text>

              <View style={s.step}>
                <View style={s.stepNum}><Text style={s.stepNumTxt}>1</Text></View>
                <View style={s.stepContent}>
                  <Text style={s.stepTitle}>Tap the Share button</Text>
                  <Text style={s.stepBody}>
                    It's the square with an up-arrow ↑ at the <Text style={s.bold}>bottom</Text> of
                    Safari (or top-right on iPad).
                  </Text>
                  <View style={s.shareIconBox}>
                    <Text style={s.shareIcon}>⬆️</Text>
                    <Text style={s.shareLabel}>Share</Text>
                  </View>
                </View>
              </View>

              <View style={s.step}>
                <View style={s.stepNum}><Text style={s.stepNumTxt}>2</Text></View>
                <View style={s.stepContent}>
                  <Text style={s.stepTitle}>Scroll & tap "Add to Home Screen"</Text>
                  <Text style={s.stepBody}>
                    Look for the icon with a <Text style={s.bold}>+</Text> next to "Add to Home
                    Screen".
                  </Text>
                </View>
              </View>

              <View style={s.step}>
                <View style={s.stepNum}><Text style={s.stepNumTxt}>3</Text></View>
                <View style={s.stepContent}>
                  <Text style={s.stepTitle}>Tap "Add"</Text>
                  <Text style={s.stepBody}>
                    The CornerMind icon will appear on your home screen — just like any app.
                  </Text>
                </View>
              </View>

              <View style={s.tipBox}>
                <Text style={s.tipText}>
                  💡 Tip: Make sure you're in <Text style={s.bold}>Safari</Text> — not Chrome,
                  Instagram, or any in-app browser. If you don't see the Share button, copy the URL
                  and open it in Safari.
                </Text>
              </View>

              <Pressable style={s.modalClose} onPress={() => setIosModalOpen(false)}>
                <Text style={s.modalCloseTxt}>Got it ✓</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2563EB' },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  modalSub: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  step: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  stepNumTxt: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  stepContent: { flex: 1 },
  stepTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, marginBottom: 3 },
  stepBody: { color: '#D1D5DB', fontSize: 13, lineHeight: 19 },
  shareIconBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F1A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 6, borderWidth: 1, borderColor: '#2563EB40' },
  shareIcon: { fontSize: 16, marginRight: 6 },
  shareLabel: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  tipBox: { backgroundColor: '#F9731620', borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 14, borderWidth: 1, borderColor: '#F9731640' },
  tipText: { color: '#FDBA74', fontSize: 12, lineHeight: 17 },
  modalClose: { backgroundColor: '#2563EB', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  modalCloseTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
