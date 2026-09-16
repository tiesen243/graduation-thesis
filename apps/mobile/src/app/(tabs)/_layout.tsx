import { useQuery } from '@tanstack/react-query'
import { NativeTabs } from 'expo-router/native-tabs'
import { useCSSVariable } from 'uniwind'

import { useRuntime } from '@/hooks/use-runtime'

// oxlint-disable node/global-require unicorn/prefer-module

export default function TabsLayout() {
  const cardColor = useCSSVariable('--color-card') as string
  const cardForegroundColor = useCSSVariable(
    '--color-card-foreground'
  ) as string
  const primaryColor = useCSSVariable('--color-primary') as string
  const mutedColor = useCSSVariable('--color-muted') as string
  const destructiveColor = useCSSVariable('--color-destructive') as string

  const { api } = useRuntime()
  const { data } = useQuery({
    ...api.notification.unread.queryOptions(),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })

  return (
    <NativeTabs
      backgroundColor={cardColor}
      iconColor={{ default: cardForegroundColor, selected: primaryColor }}
      labelStyle={{
        default: { color: cardForegroundColor },
        selected: { color: primaryColor },
      }}

      rippleColor={`${primaryColor}33`}
      indicatorColor={mutedColor}
      labelVisibilityMode='labeled'

      badgeBackgroundColor={destructiveColor}
      badgeTextColor='#FAFAFA'

      activityEnabled
    >
      <NativeTabs.Trigger name='home'>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/home.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='pill-boxes'>
        <NativeTabs.Trigger.Label>Pill Boxes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/pill-boxes.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='schedules'>
        <NativeTabs.Trigger.Label>Schedules</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/schedule.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='notifications'>
        <NativeTabs.Trigger.Label>Notifications</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/notification.png')}
          renderingMode='template'
        />

        {data?.data && data.data.count > 0 && (
          <NativeTabs.Trigger.Badge>
            {String(data.data.count)}
          </NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='profile'>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/tab-icons/profile.png')}
          renderingMode='template'
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
