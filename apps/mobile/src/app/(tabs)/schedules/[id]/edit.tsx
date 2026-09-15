import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import { Button } from '@rozumari/ui/components/button'
import { FieldSet } from '@rozumari/ui/components/field'
import { toast } from '@rozumari/ui/components/toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { ScheduleItems } from '@/components/schedule/schedule-items'
import { updateScheduleForm } from '@/components/schedule/update/_config'
import { UpdateScheduleDatePicker } from '@/components/schedule/update/date-picker'
import { UpdateScheduleTimePicker } from '@/components/schedule/update/time-picker'
import { useRuntime } from '@/hooks/use-runtime'

function UpdateScheduleFormSubmit({ id }: { id: ScheduleId }) {
  const isPending = updateScheduleForm.useValue((s) => s.isPending)

  const { api } = useRuntime()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSubmit = updateScheduleForm.useSubmit(
    (payload) => api.schedule.update.mutate({ params: { id }, payload }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.schedule.show.getQueryKey({ params: { id } }),
        })
        toast.success('Schedule updated successfully')
        router.back()
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <Button onPress={() => handleSubmit()} disabled={isPending}>
      {isPending ? 'Saving...' : 'Save Changes'}
    </Button>
  )
}

export default function TabsSchedulesEditScreen() {
  const { id } = useLocalSearchParams<{ id: ScheduleId }>()

  const { api } = useRuntime()
  const { data } = useQuery(api.schedule.show.queryOptions({ params: { id } }))
  if (!data?.data) return null

  const schedule = data.data
  const { device, items } = schedule

  return (
    <updateScheduleForm.Provider
      defaultValues={{
        date: schedule.date,
        time: schedule.time,
        items,
      }}
    >
      <FieldSet className='p-4'>
        <UpdateScheduleDatePicker />
        <UpdateScheduleTimePicker />

        <updateScheduleForm.Field
          name='items'
          render={(props) => <ScheduleItems {...props} deviceId={device.id} />}
        />

        <UpdateScheduleFormSubmit id={id} />
      </FieldSet>
    </updateScheduleForm.Provider>
  )
}
