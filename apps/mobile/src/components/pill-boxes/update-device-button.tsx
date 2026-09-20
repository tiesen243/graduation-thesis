import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { UpdateDeviceDto } from '@rozumari/contract/device/dto/update-device.dto'
import { Button } from '@rozumari/ui/components/button'
import { Field, FieldError, FieldLabel } from '@rozumari/ui/components/field'
import { PencilIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, TouchableWithoutFeedback, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

const updateDeviceForm = FormBuilder.empty
  .add('name', UpdateDeviceDto.Input.fields.name)
  .add('position', UpdateDeviceDto.Input.fields.position)
  .make()

function SaveDeviceFormSubmit({
  setIsOpen,
}: Readonly<{ setIsOpen: (isOpen: boolean) => void }>) {
  const isPending = updateDeviceForm.useValue((s) => s.isPending)
  const { id } = useLocalSearchParams<{ id: DeviceId }>()
  const { t } = useTranslation(['common', 'pill-box'])

  const queryClient = useQueryClient()
  const { api } = useRuntime()

  const handleSubmit = updateDeviceForm.useSubmit(
    (payload) => api.device['update'].mutateEffect({ params: { id }, payload }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: api.device.show.getQueryKey({ params: { id } }),
        })
        setIsOpen(false)
        toast.success(t('pill-box:details.device.update.messages.success'))
      },
      onError: (error) =>
        toast.error(
          t('pill-box:details.device.update.messages.error'),
          error.message
        ),
    }
  )

  return (
    <Button onPress={() => handleSubmit()} disabled={isPending}>
      {isPending ? t('saving') : t('save_changes')}
    </Button>
  )
}

export function UpdateDeviceButton({
  device,
}: Readonly<{ device: { name: string | null; position: string | null } }>) {
  const { t } = useTranslation('pill-box')
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button size='sm' variant='ghost' onPress={() => setIsOpen(true)}>
        <PencilIcon className='size-4 text-muted-foreground' />
      </Button>

      <Modal
        animationType='fade'
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
        transparent
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className='flex-1 justify-center bg-black/50 p-4'>
            <updateDeviceForm.Provider defaultValues={device}>
              <Pressable className='w-full gap-4 rounded-lg border border-border bg-popover p-4'>
                <Typography className='text-lg font-semibold'>
                  {t('details.device.update.title')}
                </Typography>
                <Typography className='-mt-4 text-sm text-muted-foreground'>
                  {t('details.device.update.description')}
                </Typography>

                <updateDeviceForm.Field
                  name='name'
                  render={({ field, meta, helpers: { handleChange } }) => (
                    <Field>
                      <FieldLabel>{t('details.device.name')}</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('details.device.name_placeholder')}
                        onChangeText={handleChange}
                      />
                      <FieldError errors={meta.errors} />
                    </Field>
                  )}
                />

                <updateDeviceForm.Field
                  name='position'
                  render={({ field, meta, helpers: { handleChange } }) => (
                    <Field>
                      <FieldLabel>{t('details.device.position')}</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('details.device.position_placeholder')}
                        onChangeText={handleChange}
                      />

                      <FieldError errors={meta.errors} />
                    </Field>
                  )}
                />

                <Field>
                  <SaveDeviceFormSubmit setIsOpen={setIsOpen} />
                </Field>
              </Pressable>
            </updateDeviceForm.Provider>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}
