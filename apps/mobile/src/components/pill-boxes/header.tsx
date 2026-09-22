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
  InfoIcon,
  MapPinIcon,
  PackageIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { formatDate } from '@rozumari/ui/lib/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { STATUS_MAPPERS } from '@/app/(tabs)/pill-boxes'
import { UpdateDeviceButton } from '@/components/pill-boxes/update-device-button'

export function PillBoxDetailsHeader({
  device,
}: Readonly<{ device: ShowDeviceDto.Output }>) {
  const { t, i18n } = useTranslation(['common', 'pill-box'])
  const status = STATUS_MAPPERS[device.status as keyof typeof STATUS_MAPPERS]

  return (
    <Card>
      <CardHeader className='flex-row items-center gap-2 border-b border-border pb-4'>
        <CpuIcon size={20} className='text-primary' />
        <CardTitle className='flex-1'>
          {device?.name || t('pill-box:details.device.unnamed_device')}
        </CardTitle>
        <UpdateDeviceButton device={device} />
      </CardHeader>

      <CardContent className='gap-3'>
        <View className='flex-row items-center justify-between gap-1'>
          <InfoIcon className='size-3 text-muted-foreground' />
          <Typography className='flex-1 text-sm text-muted-foreground'>
            {t('status')}
          </Typography>
          <Badge variant={status.variant}>
            <Typography className='capitalize'>{t(status.key)}</Typography>
          </Badge>
        </View>

        <View className='flex-row items-center justify-between gap-1'>
          <PackageIcon className='size-3 text-muted-foreground' />
          <Typography className='flex-1 text-sm text-muted-foreground'>
            {t('pill-box:details.device.model')}
          </Typography>
          <Typography className='text-sm'>{device.factoryModel}</Typography>
        </View>

        <View className='flex-row items-center justify-between gap-1'>
          <MapPinIcon className='size-3 text-muted-foreground' />
          <Typography className='flex-1 text-sm text-muted-foreground'>
            {t('pill-box:details.device.position')}
          </Typography>
          <Typography className='text-sm font-medium'>
            {device.position || t('pill-box:details.device.unknown_position')}
          </Typography>
        </View>

        <View className='flex-row items-center justify-between gap-1'>
          <CalendarIcon className='size-3 text-muted-foreground' />
          <Typography className='flex-1 text-sm text-muted-foreground'>
            {t('pill-box:details.device.activated_at')}
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
