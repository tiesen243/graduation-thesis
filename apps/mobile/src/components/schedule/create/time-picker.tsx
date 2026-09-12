import { Field, FieldError, FieldLabel } from '@rozumari/ui/components/field'
import DateTimePicker, {
  useDefaultClassNames,
} from 'react-native-calendars-datepicker'

import { CreateScheduleForm } from '@/components/schedule/create/_config'

export const TimePicker = () => {
  const classNames = useDefaultClassNames()

  return (
    <CreateScheduleForm.Field
      name='time'
      render={({ field, meta }) => (
        <Field>
          <FieldLabel>Time</FieldLabel>

          <DateTimePicker
            mode='single'
            date={field.value ? new Date(field.value) : new Date()}
            classNames={{ ...classNames }}
            timePickerOptions={{ renderBesideSelectors: true }}

            timePicker
          />

          <FieldError errors={meta.errors} />
        </Field>
      )}
    />
  )
}
