import { useRouter } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useLayoutEffect } from 'react'
import { useCSSVariable } from 'uniwind'

// oxlint-disable node/global-require unicorn/prefer-module
import { useSession } from '@/hooks/use-session'

export default function TabsLayout() {
  const cardColor = useCSSVariable('--color-card') as string
  const cardForegroundColor = useCSSVariable(
    '--color-card-foreground'
  ) as string
  const primaryColor = useCSSVariable('--color-primary') as string
  const mutedColor = useCSSVariable('--color-muted') as string

  const { status } = useSession()
  const router = useRouter()
  useLayoutEffect(() => {
    if (status === 'unauthenticated') router.navigate('/login')
  }, [status, router])

  return (
    <NativeTabs
      backgroundColor={cardColor}
      iconColor={{ default: cardForegroundColor, selected: primaryColor }}
      labelStyle={{
        default: { color: cardForegroundColor },
        selected: { color: primaryColor },
      }}
      rippleColor={primaryColor}
      indicatorColor={mutedColor}
    >
      <NativeTabs.Trigger name='index'>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/home.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='notifications'>
        <NativeTabs.Trigger.Label>Notifications</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/notification.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='settings'>
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/settings.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
