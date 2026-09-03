import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@rozumari/ui/components/field'
import { Loader2Icon } from '@rozumari/ui/components/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { toast } from '@rozumari/ui/components/toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { api } from '@/lib/runtime'
import { useSession } from '@/lib/use-session'
import {
  CreateScheduleForm,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_MAP,
} from '@/routes/dashboard/schedules/_components/_config'
import { ItemField } from '@/routes/dashboard/schedules/_components/item-field'
import { ScheduleDateRangeField } from '@/routes/dashboard/schedules/_components/schedule-date-range-field'

export default function SchedulesCreatePage() {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { user, status } = useSession()

  const { data, isLoading } = useQuery(
    user?.role === 'admin'
      ? api.device.list.queryOptions({ query: { limit: 100 } })
      : api.device.me.queryOptions({ query: { limit: 100 } })
  )

  const deviceOptions = useMemo(
    () =>
      data?.data.devices.map((device) => ({
        value: device.id,
        label: device.name,
      })) ?? [],
    [data]
  )

  if (status === 'unauthenticated' || isLoading || !data)
    return (
      <div className='flex h-64 min-h-[calc(100dvh-8rem)] items-center justify-center'>
        <Loader2Icon className='size-8 animate-spin' />
      </div>
    )

  return (
    <CreateScheduleForm.Root
      defaultValues={{
        deviceId: (searchParams.get('id') ?? '') as DeviceId,
        startDate: '',
        endDate: '',
        time: '00:00:00',
        daysOfWeek: [],
        items: [],
      }}
      render={({ handleSubmit, meta }) => (
        <form
          id={meta.formId}
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleSubmit(
              (payload) => api.schedule.create.mutateEffect({ payload }),
              {
                onSuccess: async () => {
                  await queryClient.invalidateQueries({
                    queryKey: api.schedule.list.getQueryKey(),
                  })
                  toast.add({ type: 'success', title: 'Schedule created' })
                  navigate('/dashboard/schedules')
                },
                onError: (error) =>
                  toast.add({
                    type: 'error',
                    title: 'Failed to create schedule',
                    description: error,
                  }),
              }
            )
          }}
        />
      )}
    >
      <FieldSet>
        <FieldLegend>Create Schedule</FieldLegend>
        <FieldDescription>
          Create a new schedule for your medication dispenser. Select the
          device, schedule period, time, days of the week, and items to
          dispense.
        </FieldDescription>

        <FieldGroup>
          <CreateScheduleForm.Field
            name='deviceId'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Device</FieldLabel>
                <Select
                  value={field.value}
                  items={deviceOptions}
                  onValueChange={
                    field.onChange as (value: string | null) => void
                  }
                >
                  <SelectTrigger id={field.id}>
                    <SelectValue placeholder='Select a device' />
                  </SelectTrigger>
                  <SelectContent>
                    {data.data.devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name ?? device.factoryModel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription id={meta.descriptionId}>
                  Choose the target device for this schedule.
                </FieldDescription>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <ScheduleDateRangeField />

          <CreateScheduleForm.Field
            name='time'
            render={({ field, meta }) => {
              const [hours = '08', minutes = '00'] = (
                field.value || '08:00:00'
              ).split(':')

              const handleTimeChange = (newHours: string, newMinutes: string) =>
                field.onChange(`${newHours}:${newMinutes}:00`)

              return (
                <Field data-invalid={meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.id}>Time</FieldLabel>

                  <div className='flex items-center gap-2'>
                    <Select
                      value={hours}
                      onValueChange={(val) =>
                        handleTimeChange(val ?? '', minutes)
                      }
                    >
                      <SelectTrigger className='w-full sm:w-30'>
                        <SelectValue placeholder='Hour' />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const h = i.toString().padStart(2, '0')
                          return (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    <span className='text-lg font-bold text-muted-foreground'>
                      :
                    </span>

                    <Select
                      value={minutes}
                      onValueChange={(val) =>
                        handleTimeChange(hours, val ?? '')
                      }
                    >
                      <SelectTrigger className='w-full sm:w-30'>
                        <SelectValue placeholder='Minute' />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => {
                          const m = i.toString().padStart(2, '0')
                          return (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <FieldDescription>
                    Set the daily time to dispense medication.
                  </FieldDescription>
                  <FieldError id={meta.errorId} errors={meta.errors} />
                </Field>
              )
            }}
          />

          <CreateScheduleForm.Field
            name='daysOfWeek'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Days of Week</FieldLabel>
                <Select
                  value={[...field.value]}
                  onValueChange={(values) => field.onChange(values)}
                  items={DAYS_OF_WEEK_MAP}
                  multiple
                >
                  <SelectTrigger id={field.id}>
                    <SelectValue placeholder='Select days of week' />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select which days of the week this schedule repeats.
                </FieldDescription>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <CreateScheduleForm.Field
            name='items'
            render={(props) => <ItemField {...props} />}
          />

          <CreateScheduleForm.Submit
            render={({ meta }) => (
              <Field>
                <Button
                  type='submit'
                  form={meta.formId}
                  disabled={meta.isPending}
                >
                  Create Schedule
                </Button>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </CreateScheduleForm.Root>
  )
}
