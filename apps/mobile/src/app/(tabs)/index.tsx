import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@rozumari/ui/components/avatar'
import { Button } from '@rozumari/ui/components/button'
import { Typography } from '@rozumari/ui/components/typography'
import { View } from 'react-native'

import { useSession } from '@/hooks/use-session'

export default function TabsIndexScreen() {
  const { user, logout } = useSession()

  return (
    <View className='flex-1 items-center justify-center gap-4 bg-background px-4'>
      <Avatar>
        <AvatarImage source={{ uri: user?.image ?? '' }} />
        <AvatarFallback>
          {user?.username?.[0]?.toUpperCase() ?? 'U'}
        </AvatarFallback>
      </Avatar>

      <Typography>Welcome, {user?.username ?? 'User'}!</Typography>

      <Button onPress={() => logout()}>Logout</Button>
    </View>
  )
}
