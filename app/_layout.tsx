import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../constants/i18n'; // Import i18n configuration
import i18n from '../constants/i18n';
import { supabase } from '../lib/supabase';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const recordLogin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, skipping login recording');
          return;
        }

        console.log('Recording login for user:', user.id);
        const { error } = await supabase
          .from('user_logins')
          .upsert({
            user_id: user.id,
            login_date: new Date().toISOString().split('T')[0]
          }, {
            onConflict: 'user_id,login_date'
          });

        if (error) {
          console.error('Error recording login:', error);
        } else {
          console.log('Login recorded successfully');
        }
      } catch (error) {
        console.error('Error in recordLogin:', error);
      }
    };

    recordLogin();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Slot />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      <Toast />
    </I18nextProvider>
  );
}
