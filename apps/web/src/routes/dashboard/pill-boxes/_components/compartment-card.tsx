import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'

import { UpdateCompartmentDto } from '@rozumari/contract/device/dto/update-compartment.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardHeader,
  CardContent,
  CardAction,
} from '@rozumari/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@rozumari/ui/components/dialog'
import { Field, FieldError, FieldLabel } from '@rozumari/ui/components/field'
import {
  MoreHorizontalIcon,
  PackageIcon,
  PillIcon,
  PlusIcon,
} from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { Typography } from '@rozumari/ui/components/typography'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useMemo, useState } from 'react'

import { api } from '@/lib/runtime'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

const UpdateCompartmentForm: React.FC<{
  trigger: React.ReactElement
  compartment: CompartmentSchema
}> = ({ trigger, compartment }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { deviceId, position, medicine, dosage, capacity } = compartment
  const { refetch } = useDevice()

  const form = useMemo(
    () =>
      FormBuilder.empty
        .add('medicine', UpdateCompartmentDto.Input.fields.medicine)
        .add('dosage', UpdateCompartmentDto.Input.fields.dosage)
        .add('capacity', UpdateCompartmentDto.Input.fields.capacity)
        .make(
          (payload) =>
            api.device['update-compartment'].mutateEffect({
              params: { deviceId, position },
              payload,
            }),
          {
            defaultValues: { medicine: medicine ?? '', dosage, capacity },
            onSuccess: async () => {
              setIsOpen(false)
              await refetch()
            },
            onError: console.error,
          }
        ),
    [capacity, refetch, dosage, position, medicine, deviceId]
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={trigger} />

      <form.Root render={() => <DialogContent />}>
        <DialogHeader>
          <DialogTitle>Update Compartment</DialogTitle>
          <DialogDescription>Update medicine at {position}</DialogDescription>
        </DialogHeader>

        <form.Field
          name='medicine'
          render={({ field, meta }) => (
            <Field data-invalid={meta.errors.length > 0}>
              <FieldLabel htmlFor={field.id}>Medicine</FieldLabel>
              <Input
                {...field}
                onChange={({ target }) => field.onChange(target.value)}
              />
              <FieldError id={meta.errorId} errors={meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name='dosage'
          render={({ field, meta }) => (
            <Field data-invalid={meta.errors.length > 0}>
              <FieldLabel htmlFor={field.id}>Dosage</FieldLabel>
              <Input
                {...field}
                type='number'
                onChange={({ target }) => field.onChange(target.valueAsNumber)}
              />
              <FieldError id={meta.errorId} errors={meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name='capacity'
          render={({ field, meta }) => (
            <Field data-invalid={meta.errors.length > 0}>
              <FieldLabel htmlFor={field.id}>Dosage</FieldLabel>
              <Input
                {...field}
                type='number'
                onChange={({ target }) => field.onChange(target.valueAsNumber)}
              />
              <FieldError id={meta.errorId} errors={meta.errors} />
            </Field>
          )}
        />

        <DialogFooter>
          <form.Submit
            render={({ handleSubmit, meta }) => (
              <Button onClick={() => handleSubmit()} disabled={meta.isPending}>
                {meta.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            )}
          />
        </DialogFooter>
      </form.Root>
    </Dialog>
  )
}

export const CompartmentCard: React.FC<{
  item: CompartmentSchema
}> = ({ item }) => {
  const isFilled = Boolean(item.medicine)

  return (
    <Card className='flex flex-col justify-between'>
      <CardHeader>
        <Typography className='text-sm font-semibold'>
          SLOT {item.position}
        </Typography>

        <CardAction>
          <UpdateCompartmentForm
            compartment={item}
            trigger={
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label={`More options for compartment ${item.position}`}
              >
                <MoreHorizontalIcon />
              </Button>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col justify-between'>
        {isFilled ? (
          <>
            <div className='flex flex-col items-center justify-center'>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <PillIcon className='size-5' />
              </div>

              <Typography
                variant='h4'
                className='font-semibold text-foreground'
                title={item.medicine ?? undefined}
              >
                {item.medicine}
              </Typography>

              {item.dosage !== null && (
                <Typography className='text-muted-foreground'>
                  {item.dosage} mg / unit
                </Typography>
              )}
            </div>

            <div className='flex h-9 items-baseline justify-between rounded-lg bg-muted px-3'>
              <Typography
                className='font-medium text-muted-foreground'
                as='span'
              >
                Quantity
              </Typography>

              <div className='flex items-baseline gap-1'>
                <span className='text-lg font-bold'>{item.capacity}</span>
                <span className='text-xs text-muted-foreground'>pills</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='mb-2 flex aspect-video flex-col items-center justify-center gap-3 rounded-md bg-muted/60 text-muted-foreground/70'>
              <PackageIcon className='size-5' />

              <Typography variant='small' className='font-medium'>
                Empty compartment
              </Typography>
            </div>

            <UpdateCompartmentForm
              compartment={item}
              trigger={
                <Button variant='outline' size='lg' className='border-dashed'>
                  <PlusIcon />
                  Add medication
                </Button>
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
