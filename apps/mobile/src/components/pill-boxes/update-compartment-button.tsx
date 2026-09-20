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
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, TouchableWithoutFeedback, View } from 'react-native'

import type { Compartment } from '@/components/pill-boxes/compartment-card'

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
  const { t } = useTranslation(['common', 'pill-box'])

  const queryClient = useQueryClient()
  const { api } = useRuntime()

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
        toast.success(t('pill-box:details.compartment.update.success'))
      },
      onError: (error) =>
        toast.error(
          t('pill-box:details.compartment.update.error'),
          error.message
        ),
    }
  )

  return (
    <Button onPress={() => handleSubmit()} disabled={isPending}>
      {isPending ? t('common:saving') : t('common:save_changes')}
    </Button>
  )
}

function DeleteCompartmentFormSubmit({
  position,
  setIsOpen,
}: Readonly<{ position: string; setIsOpen: (isOpen: boolean) => void }>) {
  const { id } = useLocalSearchParams<{ id: DeviceId }>()
  const isPending = updateCompartmentForm.useValue((s) => s.isPending)
  const { t } = useTranslation(['common', 'pill-box'])

  const queryClient = useQueryClient()
  const { api } = useRuntime()

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
        toast.success(t('pill-box:details.compartment.delete.success'))
      },
      onError: (error) =>
        toast.error(
          t('pill-box:details.compartment.delete.error'),
          error.message
        ),
    }
  )

  return (
    <Button
      variant='destructive'
      onPress={() => handleSubmit()}
      disabled={isPending}
    >
      {isPending
        ? t('pill-box:details.compartment.delete.actions.submitting')
        : t('pill-box:details.compartment.delete.actions.submit')}
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
  const { t } = useTranslation(['common', 'pill-box'])

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
            <updateCompartmentForm.Provider
              defaultValues={{
                ...compartment,
                medicine: compartment.medicine ?? '',
              }}
            >
              <Pressable className='min-h-fit w-full gap-4 rounded-lg border border-border bg-popover p-4'>
                <Typography className='text-lg font-semibold'>
                  {t('pill-box:details.compartment.update.title')}{' '}
                  {compartment.position}
                </Typography>
                <Typography className='-mt-4 text-sm text-muted-foreground'>
                  {t('pill-box:details.compartment.update.description')}
                </Typography>

                <updateCompartmentForm.Field
                  name='medicine'
                  render={({ field, meta, helpers: { handleChange } }) => (
                    <Field>
                      <FieldLabel>
                        {t('pill-box:details.compartment.medicine')}
                      </FieldLabel>
                      <Input
                        {...field}
                        placeholder={t(
                          'pill-box:details.compartment.medicine_placeholder'
                        )}
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
                      <FieldLabel>{t('common:dosage')}</FieldLabel>
                      <Input
                        {...field}
                        placeholder={t(
                          'pill-box:details.compartment.dosage_placeholder'
                        )}
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
                      <FieldLabel>
                        {t('pill-box:details.compartment.capacity')}
                      </FieldLabel>
                      <Input
                        {...field}
                        placeholder={t(
                          'pill-box:details.compartment.capacity_placeholder'
                        )}
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
              </Pressable>
            </updateCompartmentForm.Provider>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}
