import { Button } from '@rozumari/ui/components/button'
import { Typography } from '@rozumari/ui/components/typography'
import { useRouter } from 'expo-router'
import { View } from 'react-native'

export default function NotFound() {
  const router = useRouter()

  return (
    <View className='flex-1 items-center justify-center gap-6 bg-background p-4'>
      <Typography variant='h1' className='text-center'>
        404 - Screen Not Found
      </Typography>

      <Button onPress={() => router.push('/')}>Take me home</Button>
    </View>
  )
}
