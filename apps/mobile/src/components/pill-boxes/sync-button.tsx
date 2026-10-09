import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { useRuntime } from '@/hooks/use-runtime'

export const SyncButton: React.FC<{ id: DeviceId }> = ({ id }) => {
  const { t } = useTranslation('pill-box')

  const { api } = useRuntime()
  const syncMutation = useMutation({
    ...api.device.emit.mutationOptions({ params: { id } }),
    onSuccess: () => toast.success(t('details.sync.messages.success')),
    onError: (error) =>
      toast.error(t('details.sync.messages.error'), error.message),
  })

  return (
    <Button
      size='sm'
      variant='outline'
      onPress={() =>
        syncMutation.mutate({ action: 'sync_schedule', payload: {} })
      }
    >
      {t('details.sync.title')}
    </Button>
  )
}
