// oxlint-disable react/jsx-handler-names

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
import { useQuery } from '@tanstack/react-query'
import * as Effect from 'effect/Effect'

import { CreateScheduleForm } from '@/components/schedule/create/_config'
import { DaysOfWeekSelector } from '@/components/schedule/create/days-of-week-selector'
import { PeriodSelector } from '@/components/schedule/create/period-selector'
import { ScheduleItems } from '@/components/schedule/create/schedule-items'
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
      <FieldGroup>
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

                <SelectContent title='Select a device'>
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
                  <FieldLabel>Period</FieldLabel>

                  <PeriodSelector
                    startDate={startDateField.value}
                    endDate={endDateField.value}
                    onStartDateChange={startDateField.onChange}
                    onEndDateChange={endDateField.onChange}
                  />

                  <FieldError errors={startDateMeta.errors} />
                  <FieldError errors={endDateMeta.errors} />
                </Field>
              )}
            />
          )}
        />

        <TimePicker />

        <DaysOfWeekSelector />

        <ScheduleItems />

        <CreateScheduleForm.Submit
          render={({ handleSubmit, meta }) => (
            <Button
              onPress={() => handleSubmit(Effect.log)}
              disabled={meta.isPending}
            >
              Create Schedule
            </Button>
          )}
        />
      </FieldGroup>
    </CreateScheduleForm.Root>
  )
}
