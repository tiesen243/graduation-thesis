import { Stack } from 'expo-router'

import { useOptions } from '@/hooks/use-options'

export default function AuthLayout() {
  const screenOptions = useOptions()

  return <Stack screenOptions={{ ...screenOptions, headerShown: false }} />
}
