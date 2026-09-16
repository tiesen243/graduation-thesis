import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { UpdateCompartmentDto } from '@rozumari/contract/device/dto/update-compartment.dto'
import { Button } from '@rozumari/ui/components/button'
import { Field, FieldError, FieldLabel } from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { Modal, TouchableWithoutFeedback, View } from 'react-native'

import type { Compartment } from '@/components/pill-boxes/details/compartment-card'

import { useRuntime } from '@/hooks/use-runtime'

const updateCompartmentForm = FormBuilder.empty
  .add('medicine', UpdateCompartmentDto.Input.fields.medicine)
  .add('dosage', UpdateCompartmentDto.Input.fields.dosage)
  .add('capacity', UpdateCompartmentDto.Input.fields.capacity)
  .make()

function SaveCompartmentFormSubmit({
  position,
  setIsOpen,
}: Readonly<{ position: string; setIsOpen: (isOpen: boolean) => void }>) {
  const { id } = useLocalSearchParams<{ id: DeviceId }>()

  const isPending = updateCompartmentForm.useValue((s) => s.isPending)

  const { api } = useRuntime()
  const queryClient = useQueryClient()

  const handleSubmit = updateCompartmentForm.useSubmit(
    (payload) =>
      api.device['update-compartment'].mutateEffect({
        params: { id, position },
        payload,
      }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.device.show.getQueryKey({ params: { id } }),
        })
        setIsOpen(false)
        toast.success('Compartment updated successfully')
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <Button onPress={() => handleSubmit()} disabled={isPending}>
      {isPending ? 'Saving...' : 'Save Changes'}
    </Button>
  )
}

function DeleteCompartmentFormSubmit({
  position,
  setIsOpen,
}: Readonly<{ position: string; setIsOpen: (isOpen: boolean) => void }>) {
  const { id } = useLocalSearchParams<{ id: DeviceId }>()

  const isPending = updateCompartmentForm.useValue((s) => s.isPending)

  const { api } = useRuntime()
  const queryClient = useQueryClient()

  const handleSubmit = updateCompartmentForm.useSubmit(
    () =>
      api.device['update-compartment'].mutate({
        params: { id, position },
        payload: { medicine: '', dosage: 0, capacity: 0 },
      }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.device.show.getQueryKey({ params: { id } }),
        })
        setIsOpen(false)
        toast.success('Compartment deleted successfully')
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <Button
      variant='destructive'
      onPress={() => handleSubmit()}
      disabled={isPending}
    >
      {isPending ? 'Deleting...' : 'Delete Compartment'}
    </Button>
  )
}

export function UpdateCompartmentButton({
  children,
  compartment,
  hideDelete = false,
}: Readonly<{
  compartment: Compartment
  hideDelete?: boolean
  children: (setIsOpen: (isOpen: boolean) => void) => React.ReactNode
}>) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      {children(setIsOpen)}

      <Modal
        visible={isOpen}
        animationType='fade'
        onRequestClose={() => setIsOpen(false)}
        transparent
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className='flex-1 justify-center bg-black/50 p-4'>
            <TouchableWithoutFeedback>
              <updateCompartmentForm.Provider
                defaultValues={{
                  ...compartment,
                  medicine: compartment.medicine ?? '',
                }}
              >
                <View className='min-h-fit w-full gap-4 rounded-lg border border-border bg-popover p-4'>
                  <Typography className='text-lg font-semibold'>
                    Update Compartment {compartment.position}
                  </Typography>
                  <Typography className='-mt-4 text-sm text-muted-foreground'>
                    Fill in the details of the medicine you want to add to this
                    compartment.
                  </Typography>

                  <updateCompartmentForm.Field
                    name='medicine'
                    render={({ field, meta, helpers: { handleChange } }) => (
                      <Field>
                        <FieldLabel>Medicine</FieldLabel>
                        <Input
                          {...field}
                          placeholder='Enter medicine name'
                          onChangeText={handleChange}
                        />
                        <FieldError errors={meta.errors} />
                      </Field>
                    )}
                  />

                  <updateCompartmentForm.Field
                    name='dosage'
                    render={({ field, meta, helpers: { handleChange } }) => (
                      <Field>
                        <FieldLabel>Dosage</FieldLabel>
                        <Input
                          {...field}
                          placeholder='Enter dosage'
                          keyboardType='numeric'
                          value={field.value.toString()}
                          onChangeText={(text) =>
                            handleChange(Math.trunc(Number(text)))
                          }
                        />

                        <FieldError errors={meta.errors} />
                      </Field>
                    )}
                  />

                  <updateCompartmentForm.Field
                    name='capacity'
                    render={({ field, meta, helpers: { handleChange } }) => (
                      <Field>
                        <FieldLabel>Capacity</FieldLabel>
                        <Input
                          {...field}
                          placeholder='Enter capacity'
                          keyboardType='numeric'
                          value={field.value.toString()}
                          onChangeText={(text) =>
                            handleChange(Math.trunc(Number(text)))
                          }
                        />
                        <FieldError errors={meta.errors} />
                      </Field>
                    )}
                  />

                  <Field orientation='horizontal' className='justify-end'>
                    {!hideDelete && (
                      <DeleteCompartmentFormSubmit
                        position={compartment.position}
                        setIsOpen={setIsOpen}
                      />
                    )}
                    <SaveCompartmentFormSubmit
                      position={compartment.position}
                      setIsOpen={setIsOpen}
                    />
                  </Field>
                </View>
              </updateCompartmentForm.Provider>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}
