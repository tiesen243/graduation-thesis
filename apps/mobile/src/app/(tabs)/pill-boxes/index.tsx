import { Typography } from '@rozumari/ui/components/typography'
import { View } from 'react-native'

export default function TabsPillBoxesIndexScreen() {
  return (
    <View className='flex-1 items-center justify-center'>
      <Typography>
        Please link your pill box to get started. You can do this by scanning
        the QR code on your pill box or entering the code manually.
      </Typography>
    </View>
  )
}
