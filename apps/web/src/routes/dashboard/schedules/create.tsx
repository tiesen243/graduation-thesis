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
import { Input } from '@rozumari/ui/components/input'
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

import { useSession } from '@/hooks/use-session'
import { api } from '@/lib/runtime'
import {
  CreateScheduleForm,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_MAP,
} from '@/routes/dashboard/schedules/_components/_config'
import { ItemField } from '@/routes/dashboard/schedules/_components/item-field'
import { ScheduleDateRangeField } from '@/routes/dashboard/schedules/_components/schedule-date-range-field'

const ProvidedItemField: React.FC<
  Omit<Parameters<typeof ItemField>[0], 'deviceId'>
> = (props) => {
  const deviceId = CreateScheduleForm.useValue((s) => s.values.deviceId)
  return <ItemField {...props} deviceId={deviceId} />
}

function CreateScheduleFormSubmit({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const formId = CreateScheduleForm.useValue((s) => s.formId)
  const isPending = CreateScheduleForm.useValue((s) => s.isPending)

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleSubmit = CreateScheduleForm.useSubmit(
    (payload) => api.schedule.create.mutateEffect({ payload }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.schedule.list.getQueryKey(),
        })
        toast.success('Schedule created')
        navigate('/dashboard/schedules')
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <FieldSet disabled={isPending}>{children}</FieldSet>
    </form>
  )
}

export default function SchedulesCreatePage() {
  const [searchParams] = useSearchParams()
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
        label: device.name ?? device.factoryModel,
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
    <CreateScheduleForm.Provider
      defaultValues={{
        deviceId: (searchParams.get('id') ?? '') as DeviceId,
        startDate: '',
        endDate: '',
        time: '00:00:00',
        daysOfWeek: [],
        items: [],
      }}
    >
      <CreateScheduleFormSubmit>
        <FieldLegend>Create Schedule</FieldLegend>
        <FieldDescription>
          Create a new schedule for your medication dispenser. Select the
          device, schedule period, time, days of the week, and items to
          dispense.
        </FieldDescription>

        <FieldGroup>
          <CreateScheduleForm.Field
            name='deviceId'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Device</FieldLabel>
                <Select
                  value={field.value}
                  items={deviceOptions}
                  onValueChange={handleChange as never}
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
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Time</FieldLabel>

                <Input
                  {...field}
                  type='time'
                  step={300}
                  onChange={(e) => handleChange(e.target.value)}
                />

                <FieldDescription>
                  Set the daily time to dispense medication.
                </FieldDescription>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <CreateScheduleForm.Field
            name='daysOfWeek'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Days of Week</FieldLabel>
                <Select
                  value={[...field.value]}
                  onValueChange={handleChange}
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
                  Select which days of the week this schedule repeats. Ignored
                  if the start and end dates are the same.
                </FieldDescription>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <CreateScheduleForm.Field
            name='items'
            render={(props) => <ProvidedItemField {...props} />}
          />

          <Field>
            <Button type='submit'>Create Schedule</Button>
          </Field>
        </FieldGroup>
      </CreateScheduleFormSubmit>
    </CreateScheduleForm.Provider>
  )
}
