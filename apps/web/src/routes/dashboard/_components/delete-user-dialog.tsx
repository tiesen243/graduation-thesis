import type {
  UserId,
  UserSchema,
} from '@rozumari/contract/user/schemas/user.schema'

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
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api, runtime } from '@/lib/runtime'

interface DeleteUserDialogProps {
  user: Pick<UserSchema, 'id' | 'username'>
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ user }) => {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      await runtime.runPromise(
        api.user.delete.mutateEffect({ params: { id: user.id as UserId } })
      )
      toast.add({ type: 'success', title: 'User deleted successfully' })
      setIsOpen(false)
      await queryClient.invalidateQueries({
        queryKey: api.user.list.getQueryKey(),
      })
    } catch (error) {
      toast.add({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Failed to delete user',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger render={<Button variant='link' />}>
        Delete
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-medium'>{user.username}</span>? This action
            soft-deletes the account and can be restored later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
