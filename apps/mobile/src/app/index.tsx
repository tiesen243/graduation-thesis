import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

import { ActivityIndicator } from '@/components/native'
import { useSession } from '@/hooks/use-session'

export default function IndexScreen() {
  const { status } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') router.replace('/(auth)/login')
    else if (status === 'authenticated') router.replace('/(tabs)/home')
  }, [status, segments, router])

  return (
    <View className='flex-1 items-center justify-center bg-background'>
      <ActivityIndicator size='large' />
    </View>
  )
}
