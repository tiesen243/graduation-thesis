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
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldTitle,
} from '@rozumari/ui/components/field'
import { XIcon, MinusIcon, PlusIcon } from '@rozumari/ui/components/icons'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@rozumari/ui/components/input-group'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@rozumari/ui/components/select'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/lib/runtime'

interface ItemValue {
  slot: string
  quantity: number
  isRequired: boolean
}

interface ItemFieldContentProps {
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

export const ItemField = ({
  deviceId,
  field,
  meta,
  helpers,
}: ItemFieldContentProps) => {
  const { data: compartments } = useQuery({
    ...api.device.show.queryOptions({
      params: { id: deviceId },
    }),
    select: (d) => d.data.compartments,
    enabled: !!deviceId,
  })

  const availableCompartments = useMemo(() => {
    if (!compartments) return []
    const selectedSlots = new Set(
      field.value?.map((i) => i.slot).filter(Boolean)
    )
    return compartments.filter((c) => !selectedSlots.has(c.position))
  }, [compartments, field.value])

  return (
    <Field data-invalid={meta.errors.length > 0}>
      <FieldLabel htmlFor={field.id}>Items</FieldLabel>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
        {field.value?.map((item, index) => {
          const comp = compartments?.find((c) => c.position === item.slot)

          if (!comp) {
            return (
              <Card key={index} className='h-32'>
                <CardHeader>
                  <CardTitle>Select Slot</CardTitle>
                  <CardAction>
                    <Button
                      type='button'
                      size='icon-xs'
                      variant='destructive'
                      onClick={() => helpers.remove(index)}
                    >
                      <span className='sr-only'>Remove</span>
                      <XIcon />
                    </Button>
                  </CardAction>
                </CardHeader>

                <div className='flex-1' />

                <CardContent>
                  <Select
                    value={item.slot}
                    onValueChange={(value) =>
                      helpers.update(index, { ...item, slot: value ?? '' })
                    }
                    items={availableCompartments.map((c) => ({
                      value: c.position,
                      label: `${c.medicine} (Slot ${c.position})`,
                    }))}
                    disabled={!compartments?.length}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a compartment' />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCompartments.map((c) => (
                        <SelectItem
                          key={c.position}
                          value={c.position}
                          disabled={!c.medicine}
                        >
                          {c.medicine} (Slot {c.position})
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
              <CardHeader>
                <CardTitle>
                  {comp.medicine}
                  <Badge variant='outline'>Slot: {item.slot}</Badge>
                </CardTitle>

                <CardAction>
                  <Button
                    type='button'
                    size='icon-xs'
                    variant='destructive'
                    onClick={() => helpers.remove(index)}
                  >
                    <XIcon />
                    <span className='sr-only'>Remove</span>
                  </Button>
                </CardAction>
              </CardHeader>

              <div className='flex-1' />

              <CardContent className='flex items-center justify-between gap-2'>
                <InputGroup>
                  <InputGroupAddon align='inline-start'>
                    <InputGroupText>Qty.</InputGroupText>
                  </InputGroupAddon>

                  <InputGroupInput
                    value={item.quantity}
                    onChange={(e) =>
                      helpers.update(index, {
                        ...item,
                        quantity: e.target.valueAsNumber,
                      })
                    }
                  />

                  <InputGroupAddon align='inline-end'>
                    <InputGroupButton
                      onClick={() =>
                        helpers.update(index, {
                          ...item,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      }
                    >
                      <MinusIcon />
                    </InputGroupButton>
                  </InputGroupAddon>

                  <InputGroupAddon align='inline-end'>
                    <InputGroupButton
                      onClick={() =>
                        helpers.update(index, {
                          ...item,
                          quantity: item.quantity + 1,
                        })
                      }
                    >
                      <PlusIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <FieldLabel
                  htmlFor={`${field.id}-${index}-required`}
                  className='basis-1/3'
                >
                  <Field orientation='horizontal' className='h-8'>
                    <Checkbox
                      id={`${field.id}-${index}-required`}
                      checked={item.isRequired}
                      onCheckedChange={(checked) =>
                        helpers.update(index, {
                          ...item,
                          isRequired: checked,
                        })
                      }
                    />
                    <FieldTitle>Required</FieldTitle>
                  </Field>
                </FieldLabel>
              </CardContent>
            </Card>
          )
        })}

        <Card
          onClick={() =>
            helpers.add({ slot: '', quantity: 1, isRequired: true })
          }
          className='h-32 cursor-pointer items-center justify-center border-2 border-dashed border-muted-foreground/25 bg-transparent ring-0 transition-all hover:border-primary hover:bg-accent/50 hover:text-primary'
        >
          <div className='flex size-9 items-center justify-center rounded-full border border-muted-foreground/25 bg-transparent'>
            <PlusIcon className='size-4' />
          </div>
          <span className='text-xs font-medium'>Add Item</span>
        </Card>
      </div>

      <FieldDescription id={meta.descriptionId}>
        Add the compartments and quantities to dispense for this schedule.
      </FieldDescription>

      <FieldError id={meta.errorId} errors={meta.errors} />
    </Field>
  )
}
