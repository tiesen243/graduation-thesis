import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@rozumari/ui/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { toast } from '@rozumari/ui/components/toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import type { ScheduleItemsProps } from '@/components/schedule/schedule-items'

import { CreateScheduleForm } from '@/components/schedule/create/_config'
import { DaysOfWeekSelector } from '@/components/schedule/create/days-of-week-selector'
import { PeriodSelector } from '@/components/schedule/create/period-selector'
import { CreateScheduleTimePicker } from '@/components/schedule/create/time-picker'
import { ScheduleItems } from '@/components/schedule/schedule-items'
import { useRuntime } from '@/hooks/use-runtime'

function CreateScheduleFormSubmit() {
  const isPending = CreateScheduleForm.useValue((s) => s.isPending)
  const { t } = useTranslation('schedule')
  const queryClient = useQueryClient()
  const { api } = useRuntime()
  const router = useRouter()

  const handleSubmit = CreateScheduleForm.useSubmit(
    (payload) => api.schedule.create.mutate({ payload }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.schedule.list.getQueryKey(),
        })
        router.push('/(tabs)/schedules')
        toast.success(t('create.messages.success'))
      },
      onError: (error) =>
        toast.error(t('create.messages.error'), error.message),
    }
  )

  return (
    <Button onPress={() => handleSubmit()} disabled={isPending}>
      {isPending ? t('create.actions.submitting') : t('create.actions.submit')}
    </Button>
  )
}

function ProvidedScheduleItems(props: Omit<ScheduleItemsProps, 'deviceId'>) {
  const deviceId = CreateScheduleForm.useValue((s) => s.values.deviceId)
  return <ScheduleItems {...props} deviceId={deviceId} />
}

export default function TabsSchedulesCreateScreen() {
  const { api } = useRuntime()

  const { t } = useTranslation('schedule')
  const { data } = useQuery(api.device.me.queryOptions({ query: {} }))
  if (!data?.data) return null

  return (
    <CreateScheduleForm.Provider
      defaultValues={{
        deviceId: '' as DeviceId,
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        time: '',
        items: [],
      }}
    >
      <FieldSet className='p-4'>
        <FieldGroup>
          <CreateScheduleForm.Field
            name='deviceId'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>{t('create.fields.device')}</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={handleChange as never}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('create.fields.devicePlaceholder')}
                      items={data.data.devices.map((device) => ({
                        value: device.id,
                        label: device.name ?? device.factoryModel,
                      }))}
                    />
                  </SelectTrigger>

                  <SelectContent title={t('create.fields.devicePlaceholder')}>
                    {data.data.devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name ?? device.factoryModel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <CreateScheduleForm.Field
            name='startDate'
            render={({
              field: startDateField,
              meta: startDateMeta,
              helpers: { handleChange: handleStartDateChange },
            }) => (
              <CreateScheduleForm.Field
                name='endDate'
                render={({
                  field: endDateField,
                  meta: endDateMeta,
                  helpers: { handleChange: handleEndDateChange },
                }) => (
                  <Field>
                    <FieldLabel>{t('create.fields.period')}</FieldLabel>

                    <PeriodSelector
                      startDate={startDateField.value}
                      endDate={endDateField.value}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />

                    <FieldError errors={startDateMeta.errors} />
                    <FieldError errors={endDateMeta.errors} />
                  </Field>
                )}
              />
            )}
          />

          <CreateScheduleTimePicker />

          <DaysOfWeekSelector />

          <CreateScheduleForm.Field
            name='items'
            render={(props) => <ProvidedScheduleItems {...props} />}
          />

          <CreateScheduleFormSubmit />
        </FieldGroup>
      </FieldSet>
    </CreateScheduleForm.Provider>
  )
}
