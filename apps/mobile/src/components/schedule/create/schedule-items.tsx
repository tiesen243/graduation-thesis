import { Card, CardHeader, CardTitle } from '@rozumari/ui/components/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@rozumari/ui/components/field'
import { Pressable, Text, View } from 'react-native'

import { CreateScheduleForm } from './_config'

export function ScheduleItems() {
  return (
    <CreateScheduleForm.Field
      name='items'
      render={({ field, meta, helpers }) => (
        <Field>
          <FieldLabel>Items</FieldLabel>

          <FieldDescription>Select what should be dispensed.</FieldDescription>

          <View className='gap-3'>
            {field.value.map((item, index) => (
              <Card key={`${item.slot}-${index}`}>
                <CardHeader>
                  <CardTitle>dsdsa</CardTitle>
                </CardHeader>
              </Card>
            ))}

            <Pressable onPress={() => helpers.add({ slot: '', quantity: 1 })}>
              <Text className='font-medium text-foreground'>Add item</Text>
            </Pressable>
          </View>

          <FieldError errors={meta.errors} />
        </Field>
      )}
    />
  )
}
