import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { UpdateDeviceDto } from '@rozumari/contract/device/dto/update-device.dto'
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
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@rozumari/ui/components/field'
import { BoltIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '@/lib/runtime'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

const updateDeviceForm = FormBuilder.empty
  .add('name', UpdateDeviceDto.Input.fields.name)
  .add('position', UpdateDeviceDto.Input.fields.position)
  .make()

function UpdateDeviceFormSubmit({
  id,
  setIsOpen,
}: Readonly<{ id: DeviceId; setIsOpen: (open: boolean) => void }>) {
  const isPending = updateDeviceForm.useValue((s) => s.isPending)

  const queryClient = useQueryClient()

  const handleSubmit = updateDeviceForm.useSubmit(
    (payload) => api.device.update.mutate({ params: { id }, payload }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.device.show.getQueryKey({ params: { id } }),
        })
        toast.success('Device updated')
        setIsOpen(false)
      },
      onError: (error) => {
        toast.error(error.message)
        setIsOpen(false)
      },
    }
  )

  return (
    <DialogFooter>
      <DialogClose disabled={isPending} render={<Button variant='outline' />}>
        Cancel
      </DialogClose>

      <Button onClick={() => handleSubmit()} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </DialogFooter>
  )
}

export const UpdateDeviceDialog: React.FC = () => {
  const { device } = useDevice()

  const [isOpen, setIsOpen] = useState(false)

  if (!device) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>
        <BoltIcon data-icon='inline-start' /> Configure
      </DialogTrigger>

      <updateDeviceForm.Provider
        defaultValues={{
          name: device.name ?? '',
          position: device.position ?? '',
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure device</DialogTitle>
            <DialogDescription>
              Update the device nickname and location to help you identify it.
            </DialogDescription>
          </DialogHeader>

          <updateDeviceForm.Field
            name='name'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Name</FieldLabel>

                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder='e.g. Box of Mother'
                />

                <FieldDescription id={meta.descriptionId}>
                  A friendly name for this device (e.g. &quot;Box of
                  Mother&quot;).
                </FieldDescription>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <updateDeviceForm.Field
            name='position'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Position</FieldLabel>

                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder='e.g. Bedroom'
                />

                <FieldDescription id={meta.descriptionId}>
                  Where the device is located (e.g. &quot;Bedroom&quot;).
                </FieldDescription>
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <UpdateDeviceFormSubmit id={device.id} setIsOpen={setIsOpen} />
        </DialogContent>
      </updateDeviceForm.Provider>
    </Dialog>
  )
}
