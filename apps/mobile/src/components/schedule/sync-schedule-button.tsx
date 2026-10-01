import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@rozumari/ui/components/dialog'
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant='ghost' size='icon' onPress={() => setOpen(true)}>
        <RefreshCwIcon className='size-5 text-foreground' />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sync.title')}</DialogTitle>
          <DialogDescription>{t('sync.description')}</DialogDescription>
        </DialogHeader>

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
              placeholder={t('sync.select_device')}
            />
          </SelectTrigger>

          <SelectContent title={t('sync.select_device')}>
            {data?.data.devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                {device.name ?? device.factoryModel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            disabled={!selectedDevice || syncSchedule.isPending}
            onPress={() =>
              syncSchedule.mutate({
                action: 'sync_schedule',
                payload: {},
              })
            }
          >
            {syncSchedule.isPending
              ? t('sync.actions.syncing')
              : t('sync.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
