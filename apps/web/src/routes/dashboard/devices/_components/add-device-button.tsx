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
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '@/lib/runtime'

export const AddDeviceButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const { mutate, isPending } = useMutation({
    ...api.device.add.mutationOptions(),
    onSuccess: () => {
      setIsOpen(false)
      toast.add({ type: 'success', title: 'Device added successfully' })
    },
    meta: { filter: { queryKey: api.device.list.getQueryKey() } },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>Add new device</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new device</DialogTitle>
          <DialogDescription>
            Add a new device to your account. Please provide the necessary
            information to register the device. Once added, you can manage the
            device and its associated schedules.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant='outline' />}>
            Cancel
          </DialogClose>

          <Button
            onClick={() =>
              mutate({
                factoryModel: `PB-${Math.floor(Math.random() * 1_000_000)}`,
              })
            }
          >
            {isPending ? 'Adding...' : 'Add device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
