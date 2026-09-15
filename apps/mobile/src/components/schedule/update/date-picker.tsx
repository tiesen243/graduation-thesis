import DateTimePicker from '@react-native-community/datetimepicker'
import { Button } from '@rozumari/ui/components/button'
import { Field, FieldError, FieldLabel } from '@rozumari/ui/components/field'
import { formatDate } from '@rozumari/ui/lib/utils'
import { Activity, useState } from 'react'
import { useCSSVariable } from 'uniwind'

import { updateScheduleForm } from '@/components/schedule/update/_config'

export const UpdateScheduleDatePicker = () => {
  const [isOpen, setIsOpen] = useState(false)
  const foregroundColor = useCSSVariable('--color-foreground') as string

  return (
    <updateScheduleForm.Field
      name='date'
      render={({ field, meta, helpers: { handleChange } }) => (
        <Field>
          <FieldLabel>Date</FieldLabel>

          <Button variant='outline' onPress={() => setIsOpen(true)}>
            {field.value || 'Select date'}
          </Button>

          <Activity mode={isOpen ? 'visible' : 'hidden'}>
            <DateTimePicker
              mode='date'
              display='spinner'
              positiveButton={{ textColor: foregroundColor }}
              negativeButton={{ textColor: foregroundColor }}
              value={field.value ? new Date(field.value) : new Date()}
              onDismiss={() => setIsOpen(false)}
              onValueChange={(_event, date) => {
                if (!date) return setIsOpen(false)
                handleChange(formatDate(date, 'yyyy-MM-dd'))
                setIsOpen(false)
              }}
            />
          </Activity>

          <FieldError errors={meta.errors} />
        </Field>
      )}
    />
  )
}
