import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@rozumari/ui/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { useQuery } from '@tanstack/react-query'

import { CreateScheduleForm } from '@/components/schedule/create/_config'
import { PeriodSelector } from '@/components/schedule/create/period-selector'
import { TimePicker } from '@/components/schedule/create/time-picker'
import { useRuntime } from '@/hooks/use-runtime'

export default function TabsSchedulesCreateScreen() {
  const { api } = useRuntime()
  const { data } = useQuery(api.device.me.queryOptions({ query: {} }))
  if (!data?.data) return null

  return (
    <CreateScheduleForm.Root
      defaultValues={{
        deviceId: '' as DeviceId,
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        time: '',
        items: [],
      }}
      render={() => <FieldSet className='p-4' />}
    >
      <FieldLegend>Create Schedule</FieldLegend>
      <FieldDescription>
        Create a new schedule for your medication dispenser. Select the device,
        schedule period, time, days of the week, and items to dispense.
      </FieldDescription>

      <CreateScheduleForm.Field
        name='deviceId'
        render={({ field, meta }) => (
          <Field>
            <FieldLabel>Device</FieldLabel>

            <Select
              value={field.value}
              onValueChange={field.onChange as (value: string | null) => void}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder='Select a device'
                  items={data.data.devices.map((device) => ({
                    value: device.id,
                    label: device.name ?? device.factoryModel,
                  }))}
                />
              </SelectTrigger>

              <SelectContent>
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
        render={({ field: startDateField, meta: startDateMeta }) => (
          <CreateScheduleForm.Field
            name='endDate'
            render={({ field: endDateField, meta: endDateMeta }) => (
              <Field>
                <FieldLabel>Schedule Period</FieldLabel>

                <PeriodSelector
                  startDate={startDateField.value}
                  endDate={endDateField.value}
                  // oxlint-disable-next-line react/jsx-handler-names
                  onStartDateChange={startDateField.onChange}
                  // oxlint-disable-next-line react/jsx-handler-names
                  onEndDateChange={endDateField.onChange}
                />

                <FieldDescription>
                  Select the start and end dates for this medication schedule.
                </FieldDescription>
                <FieldError errors={startDateMeta.errors} />
                <FieldError errors={endDateMeta.errors} />
              </Field>
            )}
          />
        )}
      />

      <TimePicker />
    </CreateScheduleForm.Root>
  )
}
