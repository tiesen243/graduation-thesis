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

export const UpdateDeviceDialog: React.FC = () => {
  const { device } = useDevice()
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)

  if (!device) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>
        <BoltIcon data-icon='inline-start' /> Configure
      </DialogTrigger>

      <updateDeviceForm.Root
        defaultValues={{
          name: device.name ?? '',
          position: device.position ?? '',
        }}
        render={() => <DialogContent />}
      >
        <DialogHeader>
          <DialogTitle>Configure device</DialogTitle>
          <DialogDescription>
            Update the device nickname and location to help you identify it.
          </DialogDescription>
        </DialogHeader>

        <updateDeviceForm.Field
          name='name'
          render={({ field, meta }) => (
            <Field data-invalid={meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>

              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
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
          render={({ field, meta }) => (
            <Field data-invalid={meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Position</FieldLabel>

              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder='e.g. Bedroom'
              />

              <FieldDescription id={meta.descriptionId}>
                Where the device is located (e.g. &quot;Bedroom&quot;).
              </FieldDescription>
              <FieldError id={meta.errorId} errors={meta.errors} />
            </Field>
          )}
        />

        <updateDeviceForm.Submit
          render={({ handleSubmit, meta: { isPending } }) => (
            <DialogFooter>
              <DialogClose
                disabled={isPending}
                render={<Button variant='outline' />}
              >
                Cancel
              </DialogClose>

              <Button
                onClick={() =>
                  handleSubmit(
                    (payload) =>
                      api.device.update.mutateEffect({
                        params: { id: device.id },
                        payload,
                      }),
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: api.device.show.getQueryKey({
                            params: { id: device.id },
                          }),
                        })
                        setIsOpen(false)
                        toast.add({
                          type: 'success',
                          title: 'Device updated',
                          description:
                            'The device has been updated successfully.',
                        })
                      },
                      onError: (error) =>
                        toast.add({
                          type: 'error',
                          title: 'Error updating device',
                          description: error.message,
                        }),
                    }
                  )
                }
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          )}
        />
      </updateDeviceForm.Root>
    </Dialog>
  )
}
