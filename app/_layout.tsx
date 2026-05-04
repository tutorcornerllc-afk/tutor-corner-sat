import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import InstallPrompt from './InstallPrompt';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="wordduel" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="errorhunt" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="flipit" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="polishup" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="bridgeit" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="speedread" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="deepdive" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="tonecraft" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="shapesnap" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="formulaforge" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="graphmatch" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="datadash" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="rapidfire" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="storysolve" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="mathmemory" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="chainreaction" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="dailycomplete" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      <InstallPrompt />
    </ThemeProvider>
  );
}