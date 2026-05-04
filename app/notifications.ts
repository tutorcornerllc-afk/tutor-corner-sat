import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';

if (!IS_WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert:   true,
      shouldPlaySound:   true,
      shouldSetBadge:    false,
      shouldShowBanner:  true,
      shouldShowList:    true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (IS_WEB) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleAllNotifications(): Promise<void> {
  if (IS_WEB) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 1. Daily 8am - challenges ready
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'CornerMind - Today\'s Challenges Are Ready!',
        body:  'Train your brain today - 4 quick games are waiting for you!',
      },
      trigger: {
        type:    Notifications.SchedulableTriggerInputTypes.DAILY,
        hour:    8,
        minute:  0,
      },
    });

    // 2. Daily 8pm - don't lose streak
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'CornerMind - Don\'t Lose Your Streak!',
        body:  'Today\'s challenges are still waiting. Takes less than a minute each - go!',
      },
      trigger: {
        type:    Notifications.SchedulableTriggerInputTypes.DAILY,
        hour:    20,
        minute:  0,
      },
    });

    await AsyncStorage.setItem('notifications_scheduled', '1');
  } catch (e) {
    console.log('scheduleAllNotifications error:', e);
  }
}

export async function checkAndNotifyInactive(): Promise<void> {
  if (IS_WEB) return;
  try {
    const lastOpenStr = await AsyncStorage.getItem('last_app_open');
    const today       = new Date().toISOString().split('T')[0];

    await AsyncStorage.setItem('last_app_open', today);

    if (!lastOpenStr) return;

    const lastOpen   = new Date(lastOpenStr);
    const now        = new Date();
    const diffDays   = Math.floor(
      (now.getTime() - lastOpen.getTime()) / 86400000
    );

    if (diffDays === 1) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'CornerMind - Streak Broken? That\'s OK!',
          body:  'Everyone needs a break. Let\'s get back at it today - your brain will thank you!',
        },
        trigger: null,
      });
    } else if (diffDays >= 3) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'CornerMind - Miss Us? Come Back!',
          body:  'Each game takes under a minute. Let\'s go!',
        },
        trigger: null,
      });
    }
  } catch (e) {
    console.log('checkAndNotifyInactive error:', e);
  }
}

export async function notificationsAlreadyScheduled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem('notifications_scheduled');
    return val === '1';
  } catch {
    return false;
  }
}

export default {};
