import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CaesProvider } from '@/hooks/use-caes';
import { PasseadoresProvider } from '@/hooks/use-passeadores';
import { MatilhasProvider } from '@/hooks/use-matilhas';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <CaesProvider>
      <PasseadoresProvider>
        <MatilhasProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="matilha-form" 
                options={{ 
                  presentation: 'modal',
                  title: 'Matilha',
                  headerShown: false,
                }} 
              />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </MatilhasProvider>
      </PasseadoresProvider>
    </CaesProvider>
  );
}
