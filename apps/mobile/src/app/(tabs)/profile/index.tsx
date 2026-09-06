import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@rozumari/ui/components/avatar'
import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  Calendar1Icon,
  LogOutIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from '@rozumari/ui/components/icons'
import { Separator } from '@rozumari/ui/components/separator'
import { Typography } from '@rozumari/ui/components/typography'
import React, { Fragment } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'

import { useSession } from '@/hooks/use-session'

export default function TabsProfileIndexScreen() {
  const { status, user, refetch, isRefetching, logout } = useSession()
  if (status !== 'authenticated') return null

  const informations = [
    {
      icon: UserIcon,
      title: 'User ID',
      description: user.id,
    },
    {
      icon: MailIcon,
      title: 'Email',
      description: user.email,
    },
    {
      icon: Calendar1Icon,
      title: 'Joined At',
      description: new Date(user.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  ]

  return (
    <ScrollView
      contentContainerClassName='p-4 gap-6 flex-1'
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <Card>
        <Avatar className='mx-auto size-24 overflow-visible'>
          <AvatarImage source={{ uri: user.image || undefined }} />
          <AvatarFallback>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>

          <Badge className='absolute -right-1/4 -bottom-1'>
            <ShieldIcon className='size-3 text-primary-foreground' />
            <Typography className='pr-px uppercase'>{user.role}</Typography>
          </Badge>
        </Avatar>

        <CardContent className='items-center'>
          <CardTitle>{user.username}</CardTitle>
        </CardContent>
      </Card>

      <View className='flex-1 gap-3'>
        <Typography className='text-xs text-muted-foreground uppercase'>
          Account Information
        </Typography>

        <Card>
          {informations.map((info, index) => (
            <Fragment key={info.title}>
              <CardContent className='flex-row gap-2'>
                <info.icon className='size-4 text-muted-foreground' />
                <View className='gap-1'>
                  <CardTitle>{info.title}</CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </View>
              </CardContent>
              {index < informations.length - 1 && <Separator />}
            </Fragment>
          ))}
        </Card>
      </View>

      <Button variant='destructive' onPress={logout}>
        <LogOutIcon className='size-4 text-destructive' />
        <Typography>Log Out</Typography>
      </Button>
    </ScrollView>
  )
}
