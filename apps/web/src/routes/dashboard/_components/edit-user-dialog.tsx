import type {
  UserId,
  UserRole,
  UserSchema,
} from '@rozumari/contract/user/schemas/user.schema'

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@rozumari/ui/components/field'
import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { toast } from '@rozumari/ui/components/toast'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api, runtime } from '@/lib/runtime'

const ROLE_OPTIONS = [
  {
    value: 'user',
    id: 'role-user',
    title: 'User',
    description: 'Standard account with access to own devices and schedules.',
  },
  {
    value: 'admin',
    id: 'role-admin',
    title: 'Admin',
    description: 'Full access to manage all users, devices, and settings.',
  },
] as const

interface EditUserDialogProps {
  user: Pick<UserSchema, 'id' | 'username' | 'email' | 'role'>
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user }) => {
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<UserRole>(user.role)
  const [isPending, setIsPending] = useState(false)

  const handleOpenChange = (open: boolean) => {
    if (open) setRole(user.role)
    setIsOpen(open)
  }

  const handleUpdate = async () => {
    setIsPending(true)
    try {
      await runtime.runPromise(
        api.user.update.mutateEffect({
          params: { id: user.id as UserId },
          payload: { role: role as UserRole },
        })
      )
      toast.add({ type: 'success', title: 'User updated successfully' })
      setIsOpen(false)
      await queryClient.invalidateQueries({
        queryKey: api.user.list.getQueryKey(),
      })
    } catch (error) {
      toast.add({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Failed to update user',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant='link' />}>Edit</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update the role for{' '}
            <span className='font-medium'>{user.username}</span> ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={role as string}
          onValueChange={(v) => setRole(v as UserRole)}
          disabled={isPending}
        >
          {ROLE_OPTIONS.map((option) => (
            <FieldLabel key={option.value} htmlFor={option.id}>
              <Field orientation='horizontal'>
                <FieldContent>
                  <FieldTitle>{option.title}</FieldTitle>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={option.value} id={option.id} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>

        <DialogFooter>
          <DialogClose
            disabled={isPending}
            render={<Button variant='outline' />}
          >
            Cancel
          </DialogClose>

          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
