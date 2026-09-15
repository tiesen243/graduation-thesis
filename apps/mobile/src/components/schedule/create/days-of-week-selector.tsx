import { Checkbox } from '@rozumari/ui/components/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@rozumari/ui/components/field'
import { View } from 'react-native'

import {
  CreateScheduleForm,
  DAYS_OF_WEEK,
} from '@/components/schedule/create/_config'

export const DaysOfWeekSelector = () => (
  <CreateScheduleForm.Field
    name='daysOfWeek'
    render={({ field, meta, helpers: { handleChange } }) => {
      const value = field.value ?? []

      const toggle = (day: number) => {
        if (value.includes(day)) handleChange(value.filter((d) => d !== day))
        else handleChange([...value, day])
      }

      return (
        <Field>
          <FieldLabel>Repeat on</FieldLabel>

          <View className='flex flex-row flex-wrap gap-x-4 gap-y-2'>
            {DAYS_OF_WEEK.map((day) => {
              const selected = value.includes(day.value)

              return (
                <Checkbox
                  key={day.value}
                  checked={selected}
                  label={day.label}
                  onCheckedChange={() => toggle(day.value)}
                />
              )
            })}
          </View>

          <FieldDescription>
            Choose the days when medication should be dispensed.
          </FieldDescription>

          <FieldError errors={meta.errors} />
        </Field>
      )
    }}
  />
)
