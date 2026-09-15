import DateTimePicker from '@react-native-community/datetimepicker'
import { Button } from '@rozumari/ui/components/button'
import { Field, FieldError, FieldLabel } from '@rozumari/ui/components/field'
import { formatDate } from '@rozumari/ui/lib/utils'
import { Activity, useState } from 'react'
import { useCSSVariable } from 'uniwind'

import { updateScheduleForm } from '@/components/schedule/update/_config'

export const UpdateScheduleTimePicker = () => {
  const [isOpen, setIsOpen] = useState(false)
  const foregroundColor = useCSSVariable('--color-foreground') as string

  return (
    <updateScheduleForm.Field
      name='time'
      render={({ field, meta, helpers: { handleChange } }) => (
        <Field>
          <FieldLabel>Time</FieldLabel>

          <Button variant='outline' onPress={() => setIsOpen(true)}>
            {field.value || 'Select time'}
          </Button>

          <Activity mode={isOpen ? 'visible' : 'hidden'}>
            <DateTimePicker
              mode='time'
              display='spinner'
              minuteInterval={5}
              positiveButton={{ textColor: foregroundColor }}
              negativeButton={{ textColor: foregroundColor }}
              value={
                field.value
                  ? (() => {
                      const date = new Date()
                      const [hours = 0, minutes, seconds] = field.value
                        .split(':')
                        .map(Number)
                      date.setHours(hours, minutes, seconds)
                      return date
                    })()
                  : new Date()
              }
              onDismiss={() => setIsOpen(false)}
              onValueChange={(_event, date) => {
                if (!date) return setIsOpen(false)
                handleChange(formatDate(date, 'HH:mm:ss'))
                setIsOpen(false)
              }}
              is24Hour
            />
          </Activity>

          <FieldError errors={meta.errors} />
        </Field>
      )}
    />
  )
}
