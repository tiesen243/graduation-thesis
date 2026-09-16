import { Button } from '@rozumari/ui/components/button'
import { LinkIcon } from '@rozumari/ui/components/icons'
import { Stack, useRouter } from 'expo-router'

import { useOptions } from '@/hooks/use-options'

export default function TabsPillBoxesLayout() {
  const screenOptions = useOptions()
  const router = useRouter()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Pill Boxes',
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push('/(tabs)/pill-boxes/link')}
            >
              <LinkIcon className='size-5 shrink-0 text-foreground' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='link' options={{ title: 'Link Pill Box' }} />
    </Stack>
  )
}
