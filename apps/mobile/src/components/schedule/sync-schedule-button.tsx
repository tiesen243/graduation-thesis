import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { RefreshCwIcon } from '@rozumari/ui/components/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, TouchableWithoutFeedback, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

export const SyncScheduleButton = () => {
  const { t } = useTranslation('schedule')

  const [open, setOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceId>('' as DeviceId)

  const { api } = useRuntime()
  const { data } = useQuery(api.device.me.queryOptions({ query: {} }))

  const syncSchedule = useMutation({
    ...api.device.emit.mutationOptions({ params: { id: selectedDevice } }),
    onSuccess: () => {
      toast.success('Schedule synced successfully')
      setSelectedDevice('' as DeviceId)
      setOpen(false)
    },
    onError: (error) => toast.error('Failed to sync schedule', error.message),
  })

  return (
    <>
      <Button variant='ghost' size='icon' onPress={() => setOpen(true)}>
        <RefreshCwIcon className='size-5 text-foreground' />
      </Button>

      <Modal
        visible={open}
        onRequestClose={() => setOpen(false)}
        animationType='fade'
        transparent
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View className='flex-1 items-center justify-center bg-black/50 px-4'>
            <Card>
              <CardHeader>
                <CardTitle>{t('sync.title')}</CardTitle>
                <CardDescription>{t('sync.description')}</CardDescription>
              </CardHeader>
              <CardContent className='gap-4'>
                <Select
                  value={selectedDevice}
                  onValueChange={setSelectedDevice as never}
                >
                  <SelectTrigger>
                    <SelectValue
                      items={
                        data?.data.devices.map((device) => ({
                          value: device.id,
                          label: device.name ?? device.factoryModel,
                        })) ?? []
                      }
                      placeholder={t('sync.selectDevice')}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {data?.data.devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name ?? device.factoryModel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  disabled={!selectedDevice || syncSchedule.isPending}
                  onPress={() =>
                    syncSchedule.mutate({
                      action: 'sync_schedule',
                      payload: {},
                    })
                  }
                >
                  {syncSchedule.isPending ? 'Syncing...' : 'Sync Schedule'}
                </Button>
              </CardContent>
            </Card>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}
