// Lightweight tracking helper used by all 3 apps.
// Sends events to the tutor-corner dashboard worker. Web-only; on native it's a no-op.
import { Platform } from 'react-native';

const TRACK_URL = 'https://tutorcornerllc.com/appdashboard/api/track';

let _localFlag = false;
function getInstalledFlag(): boolean {
  if (typeof window === 'undefined') return false;
  if (_localFlag) return true;
  try { return !!window.localStorage.getItem('tc_install_logged'); } catch { return false; }
}
function setInstalledFlag(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('tc_install_logged', '1'); _localFlag = true; } catch {}
}

export type AppKey = 'sat' | 'french' | 'spanish';
export type EventType = 'install' | 'open' | 'daily_done' | 'subscribe' | 'cancel' | 'expire' | 'game_played';

export async function track(app: AppKey, event_type: EventType, extra?: Record<string, any>): Promise<void> {
  if (Platform.OS !== 'web') return; // dashboard is web-only for now
  try {
    await fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app, event_type, ...extra }),
      keepalive: true,
    });
  } catch {}
}

// Call once when the app shell mounts. Logs an 'open' every visit, and a one-time 'install'
// on the first visit in standalone (PWA) mode (covers iOS add-to-home-screen).
export function bootstrapTracking(app: AppKey): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  // Always log an open
  track(app, 'open');

  // beforeinstallprompt fires on Android/Chrome/desktop install
  window.addEventListener('appinstalled', () => {
    if (!getInstalledFlag()) { setInstalledFlag(); track(app, 'install'); }
  });

  // iOS Safari has no install event; if running standalone and never logged → first-time install.
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (window as any).navigator && (window as any).navigator.standalone === true;
  if ((standalone || iosStandalone) && !getInstalledFlag()) {
    setInstalledFlag();
    track(app, 'install');
  }
}
