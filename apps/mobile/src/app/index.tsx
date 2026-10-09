import { useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { View } from 'react-native'

import { useSession } from '@/hooks/use-session'

export default function IndexScreen() {
  const { status } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    void (async () => {
      if (status === 'unauthenticated') router.replace('/(auth)/login')
      else if (status === 'authenticated') router.replace('/(tabs)/home')

      await SplashScreen.hideAsync()
    })()
  }, [status, segments, router])

  return <View className='flex-1 items-center justify-center bg-chart-1' />
}
