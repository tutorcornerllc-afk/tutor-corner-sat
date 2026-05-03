// Daily challenge wrap-up screen — replaced with a silent redirect to home.
// The previous celebration modal had display bugs (numbers not showing).
// We still mark the daily as complete via storage; the user just lands back on the home tab.
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { markDailyComplete } from './storage';

export default function DailyCompleteScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await markDailyComplete();
      } catch {}
      router.replace('/(tabs)' as any);
    })();
  }, []);

  return <View style={styles.bg} />;
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0F0F1A' },
});
