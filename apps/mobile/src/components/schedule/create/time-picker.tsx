import DateTimePicker from '@react-native-community/datetimepicker'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@rozumari/ui/components/field'
import { Activity, useState } from 'react'
import { useCSSVariable } from 'uniwind'

import { CreateScheduleForm } from '@/components/schedule/create/_config'

export function TimePicker() {
  const [isOpen, setIsOpen] = useState(false)
  const foregroundColor = useCSSVariable('--color-foreground') as string

  return (
    <CreateScheduleForm.Field
      name='time'
      render={({ field, meta }) => (
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
              onValueChange={(_, date) => {
                if (!date) return setIsOpen(false)

                const formatedDate = Intl.DateTimeFormat('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                }).format(date)

                field.onChange(formatedDate)
                setIsOpen(false)
              }}
              is24Hour
            />
          </Activity>

          <FieldDescription>
            Select the time when the schedule should run.
          </FieldDescription>

          <FieldError errors={meta.errors} />
        </Field>
      )}
    />
  )
}
