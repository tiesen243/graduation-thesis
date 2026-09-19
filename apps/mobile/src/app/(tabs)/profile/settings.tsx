import { Button } from '@rozumari/ui/components/button'
import { Typography } from '@rozumari/ui/components/typography'
import * as Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { ProfileSettingsLanguage } from '@/components/profile/settings/language'
import { ProfileSettingsTheme } from '@/components/profile/settings/theme'

export default function TabsProfileSettingsScreen() {
  const router = useRouter()

  return (
    <View className='gap-4 p-4'>
      <ProfileSettingsTheme />

      <ProfileSettingsLanguage />

      <View className='gap-2'>
        <Typography variant='h3'>Device Configuration</Typography>
        <Button onPress={() => router.push('/(tabs)/profile/config')}>
          Configure
        </Button>
      </View>

      <View className='gap-2'>
        <Typography variant='h3'>App Version</Typography>
        <Typography>{Constants.default.expoConfig?.version}</Typography>
      </View>
    </View>
  )
}
