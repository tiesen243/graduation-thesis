import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@rozumari/ui/components/dialog'
import { Field, FieldLabel } from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '@/lib/runtime'

export const LinkDeviceButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [deviceId, setDeviceId] = useState('')

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    ...api.device.link.mutationOptions({
      params: { id: deviceId as DeviceId },
    }),
    onSuccess: () => {
      toast.add({ type: 'success', title: 'Device linked successfully' })
      setIsOpen(false)
      setDeviceId('')
    },
    onError: (error) =>
      toast.add({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Failed to link device',
      }),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: api.device.me.getQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: api.device.list.getQueryKey(),
        }),
      ]),
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>Link Device</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link device</DialogTitle>
          <DialogDescription>
            Enter the ID of the device you want to link to your account. Once
            linked, you can manage the device and its compartments.
          </DialogDescription>
        </DialogHeader>

        <Field orientation='horizontal'>
          <FieldLabel htmlFor='device-id' className='whitespace-nowrap'>
            Device ID
          </FieldLabel>
          <Input
            id='device-id'
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder='e.g. abc123def456'
            disabled={isPending}
          />
        </Field>

        <DialogFooter>
          <DialogClose
            disabled={isPending}
            render={<Button variant='outline' />}
          >
            Cancel
          </DialogClose>

          <Button
            onClick={() => mutate({} as never)}
            disabled={isPending || deviceId.length === 0}
          >
            {isPending ? 'Linking...' : 'Link device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
