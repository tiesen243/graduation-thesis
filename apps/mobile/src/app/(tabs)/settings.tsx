import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { Typography } from '@rozumari/ui/components/typography'
import { View } from 'react-native'
import { Uniwind, useUniwind } from 'uniwind'

import { setTheme } from '@/lib/secure-store'

export default function TabsSettingsScreen() {
  const { theme, hasAdaptiveThemes } = useUniwind()

  return (
    <View className='flex-1 gap-6 bg-background px-4'>
      <View className='gap-4'>
        <Typography variant='h2'>Appearance</Typography>

        <RadioGroup
          value={hasAdaptiveThemes ? 'system' : theme}
          onValueChange={async (value) => {
            Uniwind.setTheme(value as 'light' | 'dark' | 'system')
            await setTheme(value as 'light' | 'dark')
          }}
        >
          <RadioGroupItem value='light'>
            <Typography>Light</Typography>
          </RadioGroupItem>

          <RadioGroupItem value='dark'>
            <Typography>Dark</Typography>
          </RadioGroupItem>

          <RadioGroupItem value='system'>
            <Typography>System</Typography>
          </RadioGroupItem>
        </RadioGroup>
      </View>
    </View>
  )
}
