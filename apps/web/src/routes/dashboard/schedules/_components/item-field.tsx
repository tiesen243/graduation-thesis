import { useAtomValue } from '@effect/atom-react'
import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from '@rozumari/ui/components/field'
import { XIcon, MinusIcon, PlusIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@rozumari/ui/components/select'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useCallback } from 'react'

import { api } from '@/lib/runtime'
import { CreateScheduleForm } from '@/routes/dashboard/schedules/_components/_config'

export const ItemField = ({
  field,
  meta,
}: Parameters<
  Extract<
    React.ComponentProps<typeof CreateScheduleForm.Field<'items'>>,
    { name: 'items' }
  >['render']
>[0]) => {
  const deviceId = useAtomValue(
    CreateScheduleForm.state(),
    (s) => s.values.deviceId
  )

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
      field.value.map((i) => i.slot).filter(Boolean)
    )
    return compartments.filter((c) => !selectedSlots.has(c.position))
  }, [compartments, field.value])

  const handleSlotChange = useCallback(
    (index: number, newSlot: string) => {
      field.onChange(
        field.value.map((item, i) =>
          i === index ? { ...item, slot: newSlot } : item
        )
      )
    },
    [field]
  )

  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      field.onChange(
        field.value.map((item, i) =>
          i === index ? { ...item, quantity } : item
        )
      )
    },
    [field]
  )

  const handleRemoveItem = useCallback(
    (index: number) => {
      field.onChange(field.value.filter((_, i) => i !== index))
    },
    [field]
  )

  const handleAddItem = useCallback(() => {
    field.onChange([...field.value, { slot: '', quantity: 1 }])
  }, [field])

  return (
    <Field data-invalid={meta.errors.length > 0}>
      <FieldLabel htmlFor={field.id}>Items</FieldLabel>

      {/* Grid Layout đồng bộ cho toàn bộ các Card */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
        {field.value.map((item, index) => {
          const comp = compartments?.find((c) => c.position === item.slot)

          {
            /* Trạng thái 1: Chưa chọn slot (Đang chọn Select) */
          }
          if (!comp) {
            return (
              <FieldContent
                key={index}
                className='relative flex min-h-32 flex-col justify-between rounded-xl border bg-card p-4 shadow-sm'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Select Slot
                  </span>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    onClick={() => handleRemoveItem(index)}
                  >
                    <span className='sr-only'>Remove</span>
                    <XIcon className='h-4 w-4' />
                  </Button>
                </div>

                <Select
                  value={item.slot}
                  onValueChange={(value) =>
                    handleSlotChange(index, value ?? '')
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
              </FieldContent>
            )
          }

          return (
            <FieldContent
              key={index}
              className='relative flex min-h-32 flex-col justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-4 pr-6'>
                  <span className='line-clamp-1 font-semibold text-foreground'>
                    {comp.medicine}
                  </span>
                  <Badge variant='outline'>Slot: {item.slot}</Badge>
                </div>

                <Button
                  type='button'
                  size='icon-xs'
                  variant='ghost'
                  className='absolute top-2 right-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                  onClick={() => handleRemoveItem(index)}
                >
                  <XIcon />
                  <span className='sr-only'>Remove</span>
                </Button>
              </div>

              <div className='mt-3 flex items-center justify-between gap-2 rounded-lg bg-muted/50 p-1.5'>
                <span className='pl-1 text-xs font-medium text-muted-foreground'>
                  Qty
                </span>

                <div className='flex items-center gap-1'>
                  <Button
                    type='button'
                    size='icon'
                    variant='outline'
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      handleQuantityChange(
                        index,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                  >
                    <MinusIcon />
                  </Button>

                  <Input
                    type='number'
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        index,
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    }
                  />

                  <Button
                    type='button'
                    size='icon'
                    variant='outline'
                    onClick={() =>
                      handleQuantityChange(index, item.quantity + 1)
                    }
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </div>
            </FieldContent>
          )
        })}

        <button
          type='button'
          onClick={handleAddItem}
          className='flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-transparent p-4 text-muted-foreground transition-all hover:border-primary hover:bg-accent/50 hover:text-primary'
        >
          <div className='flex size-9 items-center justify-center rounded-full border bg-background shadow-xs'>
            <PlusIcon className='size-4' />
          </div>
          <span className='text-xs font-medium'>Add Item</span>
        </button>
      </div>

      <FieldDescription id={meta.descriptionId}>
        Add the compartments and quantities to dispense for this schedule.
      </FieldDescription>

      <FieldError id={meta.errorId} errors={meta.errors} />
    </Field>
  )
}
