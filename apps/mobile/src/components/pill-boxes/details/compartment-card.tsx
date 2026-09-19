import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import { Card, CardContent, CardHeader } from '@rozumari/ui/components/card'
import {
  MoreVerticalIcon,
  PillIcon,
  PlusIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { UpdateCompartmentButton } from '@/components/pill-boxes/details/update-compartment-button'

export type Compartment = ShowDeviceDto.Output['compartments'][number]

export function CompartmentCard({ compartment }: { compartment: Compartment }) {
  const { t } = useTranslation('pill-box')
  const hasMedicine = Boolean(compartment.medicine)

  return (
    <Card
      className={cn(
        'aspect-square w-full flex-1',
        hasMedicine ? '' : 'border-2 border-dashed border-border ring-0'
      )}
    >
      <CardHeader className='flex-row items-center justify-between gap-2'>
        <Badge variant='outline' className='px-1.5 py-0.5'>
          <Typography className='text-[10px] font-bold'>
            Slot {compartment.position}
          </Typography>
        </Badge>

        {hasMedicine && (
          <UpdateCompartmentButton compartment={compartment}>
            {(setIsOpen) => (
              <Button
                size='icon-sm'
                variant='ghost'
                onPress={() => setIsOpen(true)}
              >
                <MoreVerticalIcon className='size-4 shrink-0 text-muted-foreground' />
              </Button>
            )}
          </UpdateCompartmentButton>
        )}
      </CardHeader>

      {hasMedicine ? (
        <CardContent className='flex-1 items-center justify-center gap-1'>
          <View className='items-center justify-center rounded-md bg-primary/10 p-3'>
            <PillIcon className='size-4 shrink-0 text-primary' />
          </View>

          <Typography className='line-clamp-1 text-sm font-semibold'>
            {compartment.medicine}
          </Typography>

          <Typography className='text-xs text-muted-foreground'>
            {compartment.dosage} mg / unit
          </Typography>

          <View className='flex-1' />

          <View className='h-7 w-full flex-row items-center justify-between rounded-md bg-muted/50 px-3'>
            <Typography>{t('details.compartment.quantity')}</Typography>

            <Typography className='text-sm font-semibold'>
              {compartment.capacity} pills
            </Typography>
          </View>
        </CardContent>
      ) : (
        <CardContent className='flex-1 gap-4'>
          <View className='flex-1 items-center justify-center rounded-md bg-muted'>
            <Typography className='text-sm text-muted-foreground'>
              Empty compartment
            </Typography>
          </View>

          <UpdateCompartmentButton compartment={compartment} hideDelete>
            {(setIsOpen) => (
              <Button
                size='sm'
                variant='outline'
                onPress={() => setIsOpen(true)}
              >
                <PlusIcon className='size-3 shrink-0 text-muted-foreground' />
                <Typography>{t('details.compartment.addMedicine')}</Typography>
              </Button>
            )}
          </UpdateCompartmentButton>
        </CardContent>
      )}
    </Card>
  )
}
