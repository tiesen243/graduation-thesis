// oxlint-disable react-hooks/rules-of-hooks

import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { Checkbox } from '@rozumari/ui/components/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@rozumari/ui/components/field'
import { PlusIcon, XIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

interface ItemValue {
  slot: string
  quantity: number
  isRequired: boolean
}

export interface ScheduleItemsProps {
  deviceId: DeviceId
  field: { id: string; value: readonly ItemValue[] | undefined }
  meta: {
    errors: { message: string }[]
    descriptionId?: string
    errorId?: string
  }
  helpers: {
    add: (item: ItemValue) => void
    remove: (index: number) => void
    update: (index: number, item: ItemValue) => void
  }
}

export function ScheduleItems({
  deviceId,
  field,
  meta,
  helpers,
}: ScheduleItemsProps) {
  const { api } = useRuntime()
  const { data: compartments } = useQuery({
    ...api.device.show.queryOptions({ params: { id: deviceId } }),
    select: (d) => d.data.compartments,
    enabled: !!deviceId,
  })

  const availableCompartments = useMemo(() => {
    if (!compartments) return []
    const selectedSlots = new Set(
      field.value?.map((i) => i.slot).filter(Boolean)
    )
    return compartments.filter((c) => !selectedSlots.has(c.position))
  }, [field.value, compartments])

  return (
    <Field data-invalid={meta.errors.length > 0}>
      <FieldLabel>Items</FieldLabel>

      <View className='gap-3'>
        {field.value?.map((item, index) => {
          const comp = compartments?.find((c) => c.position === item.slot)

          if (!comp) {
            return (
              <Card key={index} className='h-32'>
                <CardHeader className='flex-row items-center justify-between'>
                  <CardTitle>Select Slot</CardTitle>
                  <CardAction>
                    <Button
                      size='icon-xs'
                      variant='destructive'
                      onPress={() => helpers.remove(index)}
                    >
                      <XIcon className='size-3 text-destructive' />
                    </Button>
                  </CardAction>
                </CardHeader>

                <View className='flex-1' />

                <CardContent>
                  <Select
                    value={item.slot}
                    onValueChange={(value) =>
                      helpers.update(index, {
                        ...item,
                        slot: value ?? '',
                      })
                    }
                  >
                    <SelectTrigger
                      className='w-full'
                      disabled={!compartments?.length}
                    >
                      <SelectValue
                        placeholder='Select a compartment'
                        items={availableCompartments.map((c) => ({
                          value: c.position,
                          label: `${c.medicine} (Slot ${c.position})`,
                        }))}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCompartments.map((c) => (
                        <SelectItem
                          key={c.position}
                          value={c.position}
                          disabled={!c.medicine}
                        >
                          <Typography>
                            {c.medicine} (Slot {c.position})
                          </Typography>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={index} className='h-32'>
              <CardHeader className='flex-row items-center justify-between'>
                <CardTitle className='flex-row items-center gap-2'>
                  <Text className='font-semibold text-foreground'>
                    {comp.medicine}
                  </Text>
                  <Badge variant='outline'>
                    <Typography>Slot: {item.slot}</Typography>
                  </Badge>
                </CardTitle>

                <CardAction>
                  <Button
                    size='icon-xs'
                    variant='destructive'
                    onPress={() => helpers.remove(index)}
                  >
                    <XIcon className='size-3 text-destructive' />
                  </Button>
                </CardAction>
              </CardHeader>

              <View className='flex-1' />

              <CardContent className='flex-row items-center justify-between gap-2'>
                <Input
                  keyboardType='numeric'
                  className='w-2/3'
                  onChangeText={(text) =>
                    helpers.update(index, {
                      ...item,
                      quantity: Math.trunc(+text) || 0,
                    })
                  }
                />

                <Checkbox
                  className='w-1/3'
                  checked={item.isRequired}
                  onCheckedChange={(checked) =>
                    helpers.update(index, {
                      ...item,
                      isRequired: !!checked,
                    })
                  }
                  label='Required'
                />
              </CardContent>
            </Card>
          )
        })}

        <Pressable
          onPress={() =>
            helpers.add({ slot: '', quantity: 1, isRequired: true })
          }
          className='h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-transparent active:opacity-70'
        >
          <View className='size-9 items-center justify-center rounded-full border border-muted-foreground/25 bg-transparent'>
            <PlusIcon className='size-4 text-primary' />
          </View>
          <Text className='mt-1 text-xs font-medium text-foreground'>
            Add Item
          </Text>
        </Pressable>
      </View>

      <FieldDescription>
        Add the compartments and quantities to dispense for this schedule.
      </FieldDescription>

      <FieldError errors={meta.errors} />
    </Field>
  )
}
