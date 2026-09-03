import type { AddDeviceDto } from '@rozumari/contract/device/dto/add-device.dto'

import { Button } from '@rozumari/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@rozumari/ui/components/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { toast } from '@rozumari/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '@/lib/runtime'

const SIZE_OPTIONS = [
  {
    value: 'sm',
    id: 'size-sm',
    title: 'Small',
    description: '4 compartments – Compact size for personal or travel use.',
  },
  {
    value: 'md',
    id: 'size-md',
    title: 'Medium',
    description: '8 compartments – Standard size suitable for general needs.',
  },
  {
    value: 'lg',
    id: 'size-lg',
    title: 'Large',
    description: '12 compartments – High capacity for extended treatment.',
  },
] as const

export const AddDeviceButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState<AddDeviceDto.Input['amount']>(1)
  const [size, setSize] = useState<AddDeviceDto.Input['size']>('sm')

  const { mutate, isPending } = useMutation({
    ...api.device.add.mutationOptions(),
    onSuccess: () => {
      toast.add({ type: 'success', title: 'Device added successfully' })
      setIsOpen(false)
      setSize('sm')
    },
    onError: (error) =>
      toast.add({ type: 'error', description: error.message }),
    meta: { filter: { queryKey: api.device.list.getQueryKey() } },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>Add new device</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new device</DialogTitle>
          <DialogDescription>
            Add a new device to your account. Please provide the necessary
            information to register the device. Once added, you can manage the
            device and its associated schedules.
          </DialogDescription>
        </DialogHeader>

        <FieldLabel htmlFor='amount'>
          <Field orientation='horizontal'>
            <FieldTitle>Amount</FieldTitle>
            <Input
              type='number'
              id='amount'
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              disabled={isPending}
            />
          </Field>
        </FieldLabel>

        <RadioGroup value={size} onValueChange={setSize} disabled={isPending}>
          {SIZE_OPTIONS.map((option) => (
            <FieldLabel key={option.value} htmlFor={option.id}>
              <Field orientation='horizontal'>
                <FieldContent>
                  <FieldTitle>{option.title}</FieldTitle>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={option.value} id={option.id} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>

        <DialogFooter>
          <DialogClose
            disabled={isPending}
            render={<Button variant='outline' />}
          >
            Cancel
          </DialogClose>

          <Button onClick={() => mutate({ amount, size })} disabled={isPending}>
            {isPending ? 'Adding...' : 'Add device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
