import { Button } from '@rozumari/ui/components/button'
import { Icon } from '@rozumari/ui/components/icons'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useOptions } from '@/hooks/use-options'

export default function TabsSchedulesLayout() {
  const { id } = useGlobalSearchParams<{ id: string }>()
  const { t } = useTranslation('schedule')
  const screenOptions = useOptions()
  const router = useRouter()

  return (
    <Stack screenOptions={screenOptions} activityEnabled>
      <Stack.Screen
        name='index'
        options={{
          title: t('index.title'),
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push('/(tabs)/schedules/create')}
            >
              <Icon name='Plus' className='size-5' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='create' options={{ title: t('create.title') }} />

      <Stack.Screen
        name='[id]/index'
        options={{
          title: t('detail.title'),
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push(`/(tabs)/schedules/${id}/edit`)}
            >
              <Icon name='Pencil' className='size-5' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='[id]/edit' options={{ title: t('edit.title') }} />
    </Stack>
  )
}
