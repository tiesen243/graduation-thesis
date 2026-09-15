import { DateRangePicker } from '@rozumari/ui/components/date-range-picker'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@rozumari/ui/components/field'

import { CreateScheduleForm } from '@/routes/dashboard/schedules/_components/_config'

export const ScheduleDateRangeField = () => (
  <CreateScheduleForm.Field
    name='startDate'
    render={({
      field: startField,
      meta: startMeta,
      helpers: { handleChange: handleStartDateChange },
    }) => (
      <CreateScheduleForm.Field
        name='endDate'
        render={({
          field: endField,
          meta: endMeta,
          helpers: { handleChange: handleEndDateChange },
        }) => {
          const hasError =
            startMeta.errors.length > 0 || endMeta.errors.length > 0

          return (
            <Field data-invalid={hasError}>
              <FieldLabel>Schedule Period</FieldLabel>
              <DateRangePicker
                startDate={startField.value}
                endDate={endField.value}
                onChange={({ startDate, endDate }) => {
                  handleStartDateChange(startDate)
                  handleEndDateChange(endDate)
                }}
              />
              <FieldDescription>
                Select the start and end dates for this medication schedule.
              </FieldDescription>
              <FieldError id={startMeta.errorId} errors={startMeta.errors} />
              <FieldError id={endMeta.errorId} errors={endMeta.errors} />
            </Field>
          )
        }}
      />
    )}
  />
)
