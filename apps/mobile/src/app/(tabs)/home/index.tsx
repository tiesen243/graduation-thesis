import { Typography } from '@rozumari/ui/components/typography'
import { View } from 'react-native'

export default function TabsHomeIndexScreen() {
  return (
    <View className='flex-1 p-4'>
      <Typography variant='h1'>Rozumari</Typography>
      <Typography>
        The system automatically opens the designated pill compartment at
        scheduled times, broadcasts audio reminders, and sends notifications to
        caregivers if the patient misses a dose or takes medication from the
        incorrect compartment.
      </Typography>
    </View>
  )
}
