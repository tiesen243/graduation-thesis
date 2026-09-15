// oxlint-disable react/jsx-handler-names

import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

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
                <FieldLabel>Device</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={handleChange as never}
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
                    <FieldLabel>Period</FieldLabel>

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

          <TimePicker />

          <DaysOfWeekSelector />

          <ScheduleItems />

          {/* <CreateScheduleForm.Submit */}
          {/*   render={({ handleSubmit, meta }) => ( */}
          {/*     <Button */}
          {/*       onPress={() => handleSubmit(Effect.log)} */}
          {/*       disabled={meta.isPending} */}
          {/*     > */}
          {/*       Create Schedule */}
          {/*     </Button> */}
          {/*   )} */}
          {/* /> */}
        </FieldGroup>
      </FieldSet>
    </CreateScheduleForm.Provider>
  )
}
