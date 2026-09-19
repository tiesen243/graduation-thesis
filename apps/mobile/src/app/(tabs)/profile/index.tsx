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
import { formatDate } from '@rozumari/ui/lib/utils'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, ScrollView, View } from 'react-native'

import { useSession } from '@/hooks/use-session'

export default function TabsProfileIndexScreen() {
  const { status, user, refetch, isRefetching, logout } = useSession()
  const { t } = useTranslation(['profile'])
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
      title: t('index.joined'),
      description: formatDate(user.createdAt, 'MMMM dd, yyyy'),
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
          {user.image && <AvatarImage source={{ uri: user.image }} />}

          <AvatarFallback>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>

          <Badge className='absolute -right-1/4 -bottom-1'>
            {user.role === 'admin' ? (
              <ShieldIcon className='size-3 text-primary-foreground' />
            ) : (
              <UserIcon className='size-3 text-primary-foreground' />
            )}
            <Typography className='pr-px uppercase'>{user.role}</Typography>
          </Badge>
        </Avatar>

        <CardContent className='items-center'>
          <CardTitle>{user.username}</CardTitle>
        </CardContent>
      </Card>

      <View className='flex-1 gap-3'>
        <Typography className='text-xs text-muted-foreground uppercase'>
          {t('index.account')}
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

      <Button variant='destructive' size='lg' onPress={logout}>
        <LogOutIcon className='size-4 text-destructive' />
        <Typography>{t('index.logout')}</Typography>
      </Button>
    </ScrollView>
  )
}
