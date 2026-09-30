import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@rozumari/ui/components/alert-dialog'
import { Button } from '@rozumari/ui/components/button'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '@/lib/runtime'

export const UnlinkButton: React.FC<{
  id: DeviceId
  name: string | null
  factoryModel: string
}> = ({ id, name, factoryModel }) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const unlinkMutation = useMutation({
    ...api.device.unlink.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: api.device.me.getQueryKey(),
      })
      toast.success('Pill box unlinked successfully.')
      setIsOpen(false)
    },
    onError: ({ message }) => toast.error(message),
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={<Button variant='link' className='text-destructive' />}
      >
        Unlink
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to unlink {name ?? factoryModel}?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. The pill box will be removed from your
            account and you will no longer receive notifications or be able to
            manage it. You will need to re-link the pill box if you want to use
            it again.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={unlinkMutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={unlinkMutation.isPending}
            onClick={() => unlinkMutation.mutate({ id })}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
