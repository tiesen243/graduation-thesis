import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'

import { Badge } from '@rozumari/ui/components/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  CalendarIcon,
  CpuIcon,
  MapPinIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { formatDate } from '@rozumari/ui/lib/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { getBadgeVariant } from '@/app/(tabs)/pill-boxes'
import { UpdateDeviceButton } from '@/components/pill-boxes/details/update-device-button'

export function PillBoxDetailsHeader({
  device,
}: Readonly<{ device: ShowDeviceDto.Output }>) {
  const { i18n } = useTranslation('pillBox')

  return (
    <Card className='mx-4'>
      <CardHeader className='flex-row items-center gap-2 border-b border-border pb-4'>
        <CpuIcon size={20} className='text-primary' />
        <CardTitle className='flex-1'>
          {device?.name || 'Unnamed Device'}
        </CardTitle>
        <UpdateDeviceButton device={device} />
      </CardHeader>

      <CardContent className='gap-3'>
        <View className='flex-row items-center justify-between'>
          <Typography className='text-sm text-muted-foreground'>
            Status
          </Typography>
          <Badge variant={getBadgeVariant(device.status)}>
            <Typography className='capitalize'>{device.status}</Typography>
          </Badge>
        </View>

        <View className='flex-row items-center justify-between'>
          <Typography className='text-sm text-muted-foreground'>
            Model Code
          </Typography>
          <Typography className='text-sm'>{device.factoryModel}</Typography>
        </View>

        <View className='flex-row items-center justify-between gap-1'>
          <MapPinIcon className='size-3 text-muted-foreground' />
          <Typography className='flex-1 text-sm text-muted-foreground'>
            Location
          </Typography>
          <Typography className='text-sm font-medium'>
            {device.position || 'Not set'}
          </Typography>
        </View>

        <View className='flex-row items-center justify-between gap-1'>
          <CalendarIcon className='size-3 text-muted-foreground' />
          <Typography className='flex-1 text-sm text-muted-foreground'>
            Activated Date
          </Typography>
          <Typography className='text-sm'>
            {device.activatedAt
              ? formatDate(device.activatedAt, {
                  locale: i18n.resolvedLanguage,
                })
              : 'N/A'}
          </Typography>
        </View>
      </CardContent>
    </Card>
  )
}
