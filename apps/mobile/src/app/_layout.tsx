import '@/globals.css'

import { createQueryClient } from '@rozumari/lib/create-query-client'
import { ToasterProvider } from '@rozumari/ui/components/toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { Camera } from 'expo-camera'
import { DefaultTheme, Slot, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { Uniwind, useCSSVariable, useUniwind } from 'uniwind'

import { useGeistFonts } from '@/hooks/use-geist-fonts'
import { RuntimeProvider } from '@/hooks/use-runtime'
import { SessionProvider, useSession } from '@/hooks/use-session'
import { requestBLEPermissions } from '@/lib/ble'
import { getTheme } from '@/lib/secure-store'

SplashScreen.preventAutoHideAsync()
const queryClient = createQueryClient()

function RootLayoutInner() {
  const [fontLoaded, fontError] = useGeistFonts()
  const { status } = useSession()

  useEffect(() => {
    void (async () => {
      if (!fontLoaded && fontError) return
      if (status === 'loading') return

      try {
        const theme = await getTheme()
        Uniwind.setTheme(theme)
      } finally {
        await SplashScreen.hideAsync()
      }

      // check permission...
      await requestBLEPermissions()
      await Camera.requestCameraPermissionsAsync()
    })()
  }, [fontLoaded, fontError, status])

  return <Slot />
}

export default function RootLayout() {
  const { theme: colorscheme } = useUniwind()

  const backgroundColor = useCSSVariable('--color-background') as string
  const foregroundColor = useCSSVariable('--color-foreground') as string
  const primaryColor = useCSSVariable('--color-primary') as string
  const cardColor = useCSSVariable('--color-card') as string
  const popoverColor = useCSSVariable('--color-popover') as string
  const borderColor = useCSSVariable('--color-border') as string

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
        dark: colorscheme === 'dark',
      }}
    >
      <ToasterProvider position='bottom'>
        <QueryClientProvider client={queryClient}>
          <RuntimeProvider>
            <SessionProvider>
              <RootLayoutInner />
            </SessionProvider>
          </RuntimeProvider>
        </QueryClientProvider>

        <StatusBar
          barStyle={colorscheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      </ToasterProvider>
    </ThemeProvider>
  )
}
