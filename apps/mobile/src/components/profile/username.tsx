import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '@rozumari/ui/components/bottom-sheet'
import { Button } from '@rozumari/ui/components/button'
import { CardContent, CardTitle } from '@rozumari/ui/components/card'
import { FieldSet } from '@rozumari/ui/components/field'
import { PencilIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { useRuntime } from '@/hooks/use-runtime'
import { useSession } from '@/hooks/use-session'

export const Username: React.FC = () => {
  const { user, status, refetch } = useSession()
  const { t } = useTranslation()

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
    <BottomSheet open={isOpen} onOpenChange={setIsOpen}>
      <CardContent className='flex-row items-center justify-center gap-2'>
        <CardTitle>{user.username}</CardTitle>

        <BottomSheetTrigger variant='ghost' size='icon-xs'>
          <PencilIcon className='size-3 shrink-0 text-foreground' />
        </BottomSheetTrigger>
      </CardContent>

      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Change Username</BottomSheetTitle>
          <BottomSheetDescription>
            Enter a new username for your account. Please note that changing
            your username may affect your profile URL and how others find you.
          </BottomSheetDescription>
        </BottomSheetHeader>

        <FieldSet className='p-4'>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder='Enter new username'
          />
        </FieldSet>

        <BottomSheetFooter>
          <Button
            disabled={updateMutation.isPending}
            onPress={() => updateMutation.mutate({ username })}
          >
            {updateMutation.isPending ? t('saving') : t('save_changes')}
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}
