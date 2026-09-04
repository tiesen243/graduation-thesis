import '@/globals.css'

import { createQueryClient } from '@rozumari/lib/create-query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind'

import { RuntimeProvider } from '@/hooks/use-runtime'
import { getTheme } from '@/lib/secure-store'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const queryClient = createQueryClient()

  const { theme } = useUniwind()
  const backgroundColor = useCSSVariable('--color-background') as string
  const cardColor = useCSSVariable('--color-card') as string
  const cardForegroundColor = useCSSVariable(
    '--color-card-foreground'
  ) as string

  useEffect(() => {
    void (async () => {
      const _theme = await getTheme()
      Uniwind.setTheme(_theme)
      SplashScreen.hideAsync()
    })()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RuntimeProvider>
        <Stack
          initialRouteName='(tabs)'
          screenOptions={{
            headerStyle: { backgroundColor: cardColor },
            headerTitleStyle: { color: cardForegroundColor },
            contentStyle: { backgroundColor },
          }}
        >
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='login' options={{ title: 'Login' }} />
        </Stack>

        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        />
      </RuntimeProvider>
    </QueryClientProvider>
  )
}
