import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { checkSubscriptionOnline, isFirstLaunch } from '../storage';
import {
  requestNotificationPermission,
  scheduleAllNotifications,
  checkAndNotifyInactive,
  notificationsAlreadyScheduled,
} from '../notifications';

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    checkSubscriptionOnline();
    checkFirstLaunch();
    setupNotifications();
  }, []);

  async function checkFirstLaunch() {
    const first = await isFirstLaunch();
    if (first) router.replace('/welcome');
  }

  async function setupNotifications() {
    try {
      await checkAndNotifyInactive();
      const alreadyScheduled = await notificationsAlreadyScheduled();
      if (!alreadyScheduled) {
        const granted = await requestNotificationPermission();
        if (granted) await scheduleAllNotifications();
      }
    } catch (e) {
      console.log('setupNotifications error:', e);
    }
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: '#2D2D44',
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Games',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎮</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}