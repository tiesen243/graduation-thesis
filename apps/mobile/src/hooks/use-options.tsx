import type { NativeStackNavigationOptions } from 'expo-router'

import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'

export const useOptions = () => {
  const backgroundColor = useCSSVariable('--color-background') as string
  const popoverForegroundColor = useCSSVariable(
    '--color-popover-foreground'
  ) as string

  return {
    headerShadowVisible: false,
    headerTitleStyle: { color: popoverForegroundColor },
    headerTintColor: popoverForegroundColor,
    contentStyle: { backgroundColor },

    animationMatchesGesture: true,
    animation: 'ios_from_right',

    headerBackground: () => (
      <View className='flex-1 border-b border-b-border bg-popover' />
    ),
  } satisfies NativeStackNavigationOptions
}
