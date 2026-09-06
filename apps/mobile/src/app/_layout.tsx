import '@/globals.css'

import { createQueryClient } from '@rozumari/lib/create-query-client'
import { ToasterProvider } from '@rozumari/ui/components/toast'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  DefaultTheme,
  Slot,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { ActivityIndicator, StatusBar, View } from 'react-native'
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind'

import { RuntimeProvider } from '@/hooks/use-runtime'
import { SessionProvider, useSession } from '@/hooks/use-session'
import { getTheme } from '@/lib/secure-store'

SplashScreen.preventAutoHideAsync()
const queryClient = createQueryClient()

function RootLayoutContent() {
  const { status } = useSession()
  const { theme } = useUniwind()

  const segments = useSegments()
  const router = useRouter()

  const backgroundColor = useCSSVariable('--color-background') as string
  const foregroundColor = useCSSVariable('--color-foreground') as string
  const primaryColor = useCSSVariable('--color-primary') as string
  const cardColor = useCSSVariable('--color-card') as string
  const popoverColor = useCSSVariable('--color-popover') as string
  const borderColor = useCSSVariable('--color-border') as string

  useEffect(() => {
    let isMounted = true

    void (async () => {
      const _theme = await getTheme()
      if (!isMounted) return

      Uniwind.setTheme(_theme)

      if (status === 'loading') return

      const isAuthRoute = segments[0] === '(auth)'
      if (status === 'unauthenticated' && !isAuthRoute) {
        if (isMounted) router.replace('/(auth)/login')
        return
      }

      if (status === 'authenticated' && isAuthRoute) {
        if (isMounted) router.replace('/(tabs)/home')
        return
      }

      if (isMounted) await SplashScreen.hideAsync()
    })()

    return () => {
      isMounted = false
    }
  }, [status, segments, router])

  if (status === 'loading')
    return (
      <View className='flex-1 items-center justify-center bg-background'>
        <ActivityIndicator size={20} colorClassName='accent-primary' />
      </View>
    )

  return (
    <ThemeProvider
      value={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: backgroundColor,
          text: foregroundColor,
          primary: primaryColor,
          card: cardColor,
          notification: popoverColor,
          border: borderColor,
        },
        dark: theme === 'dark',
      }}
    >
      <ToasterProvider position='bottom'>
        <Slot />
      </ToasterProvider>

      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RuntimeProvider>
        <SessionProvider>
          <RootLayoutContent />
        </SessionProvider>
      </RuntimeProvider>
    </QueryClientProvider>
  )
}
