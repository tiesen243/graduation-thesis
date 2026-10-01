import { Button } from '@rozumari/ui/components/button'
import { CardContent, CardTitle } from '@rozumari/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@rozumari/ui/components/dialog'
import { PencilIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import * as React from 'react'

import { useRuntime } from '@/hooks/use-runtime'
import { useSession } from '@/hooks/use-session'

export const Username: React.FC = () => {
  const { user, status, refetch } = useSession()

  const [isOpen, setIsOpen] = React.useState(false)
  const [username, setUsername] = React.useState(user?.username ?? '')

  const { api } = useRuntime()
  const updateMutation = useMutation({
    ...api.user.update.mutationOptions({ params: { id: user?.id as never } }),
    onSuccess: async () => {
      toast.success('Username updated successfully')
      setIsOpen(false)
      await refetch()
    },
    onError: (error) => toast.error(error.message),
  })

  if (status !== 'authenticated') return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <CardContent className='flex-row items-center justify-center gap-2'>
        <CardTitle>{user.username}</CardTitle>

        <DialogTrigger variant='ghost' size='icon-xs'>
          <PencilIcon className='size-3 shrink-0 text-foreground' />
        </DialogTrigger>
      </CardContent>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
        </DialogHeader>

        <Input
          value={username}
          onChangeText={setUsername}
          placeholder='Enter new username'
        />

        <DialogFooter showCloseButton>
          <Button
            disabled={updateMutation.isPending}
            onPress={() => updateMutation.mutate({ username })}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
