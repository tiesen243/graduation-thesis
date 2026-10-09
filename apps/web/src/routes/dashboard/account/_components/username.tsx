import { Button } from '@rozumari/ui/components/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@rozumari/ui/components/dialog'
import { PencilIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@rozumari/ui/components/input-group'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { useSession } from '@/hooks/use-session'
import { api } from '@/lib/runtime'

export const Username: React.FC = () => {
  const { user, refetch } = useSession()

  const [username, setUsername] = useState(user?.username ?? '')
  const [isOpen, setIsOpen] = useState(false)

  const updateMutation = useMutation({
    ...api.user.update.mutationOptions({ params: { id: user?.id as never } }),
    onSuccess: async () => {
      await refetch()

      toast.success('Username updated successfully')
      setIsOpen(false)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <InputGroup>
        <InputGroupInput value={user?.username} readOnly />
        <InputGroupAddon align='inline-end'>
          <DialogTrigger render={<InputGroupButton size='icon-xs' />}>
            <PencilIcon />
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Username</DialogTitle>
            </DialogHeader>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    variant='outline'
                    disabled={updateMutation.isPending}
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ username })}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </InputGroupAddon>
      </InputGroup>
    </Dialog>
  )
}
