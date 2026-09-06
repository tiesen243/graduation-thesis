import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { Typography } from '@rozumari/ui/components/typography'
import { View } from 'react-native'
import { Uniwind, useUniwind } from 'uniwind'

import { setTheme } from '@/lib/secure-store'

export default function TabsProfileSettingsScreen() {
  const { theme, hasAdaptiveThemes } = useUniwind()

  return (
    <View className='p-4'>
      <View className='gap-2'>
        <Typography variant='h2'>Dark Mode</Typography>

        <RadioGroup
          value={hasAdaptiveThemes ? 'system' : theme}
          onValueChange={async (value) => {
            await setTheme(value as 'light' | 'dark' | 'system')
            Uniwind.setTheme(value as 'light' | 'dark' | 'system')
          }}
        >
          <RadioGroupItem value='light'>
            <Typography>Off</Typography>
          </RadioGroupItem>
          <RadioGroupItem value='dark'>
            <Typography>On</Typography>
          </RadioGroupItem>
          <RadioGroupItem value='system'>
            <Typography>Use device settings</Typography>
          </RadioGroupItem>
        </RadioGroup>
      </View>
    </View>
  )
}
