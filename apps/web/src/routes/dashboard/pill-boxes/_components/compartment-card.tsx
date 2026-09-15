import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@rozumari/ui/components/input-group'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useState } from 'react'

import { api } from '@/lib/runtime'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

const updateCompartmentForm = FormBuilder.empty
  .add('medicine', UpdateCompartmentDto.Input.fields.medicine)
  .add('dosage', UpdateCompartmentDto.Input.fields.dosage)
  .add('capacity', UpdateCompartmentDto.Input.fields.capacity)
  .make()

function SaveChangesButton({
  id,
  position,
  onSuccess,
}: Readonly<{
  id: DeviceId
  position: string
  onSuccess: () => Promise<void>
}>) {
  const isPending = updateCompartmentForm.useValue((s) => s.isPending)

  const handleClick = updateCompartmentForm.useSubmit(
    (payload) =>
      api.device['update-compartment'].mutateEffect({
        params: { id, position },
        payload,
      }),
    { onSuccess, onError: (e) => toast.error(e.message) }
  )

  return (
    <Button onClick={() => handleClick()} disabled={isPending}>
      {isPending ? 'Saving...' : 'Save changes'}
    </Button>
  )
}

const ClearButton: React.FC<{
  id: DeviceId
  position: string
  onSuccess: () => Promise<void>
}> = ({ id, position, onSuccess }) => {
  const isPending = updateCompartmentForm.useValue((s) => s.isPending)

  const handleClick = updateCompartmentForm.useSubmit(
    () =>
      api.device['update-compartment'].mutateEffect({
        params: { id, position },
        payload: { medicine: '', dosage: 0, capacity: 0 },
      }),
    { onSuccess, onError: (e) => toast.error(e.message) }
  )

  return (
    <Button
      variant='destructive'
      onClick={() => handleClick()}
      disabled={isPending}
    >
      {isPending ? 'Clearing...' : 'Clear'}
    </Button>
  )
}

const UpdateCompartmentForm: React.FC<{
  trigger: React.ReactElement
  compartment: CompartmentSchema
}> = ({ trigger, compartment }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { deviceId, position, medicine, dosage, capacity } = compartment
  const { refetch } = useDevice()

  const handleSuccess = async () => {
    await refetch()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={trigger} />

      <updateCompartmentForm.Provider
        defaultValues={{ medicine: medicine ?? '', dosage, capacity }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Compartment</DialogTitle>
            <DialogDescription>Update medicine at {position}</DialogDescription>
          </DialogHeader>

          <updateCompartmentForm.Field
            name='medicine'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Medicine</FieldLabel>
                <Input
                  {...field}
                  onChange={({ target }) => handleChange(target.value)}
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <updateCompartmentForm.Field
            name='dosage'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Dosage</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    type='number'
                    onChange={({ target }) =>
                      handleChange(target.valueAsNumber)
                    }
                  />

                  <InputGroupAddon align='inline-end'>
                    <InputGroupText>mg / unit</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <updateCompartmentForm.Field
            name='capacity'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Capacity</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    type='number'
                    onChange={({ target }) =>
                      handleChange(target.valueAsNumber)
                    }
                  />

                  <InputGroupAddon align='inline-end'>
                    <InputGroupText>pills</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <DialogFooter>
            <ClearButton
              id={deviceId}
              position={position}
              onSuccess={handleSuccess}
            />
            <SaveChangesButton
              id={deviceId}
              position={position}
              onSuccess={handleSuccess}
            />
          </DialogFooter>
        </DialogContent>
      </updateCompartmentForm.Provider>
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

            <div className='flex h-9 items-center justify-between rounded-lg bg-muted px-3'>
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
