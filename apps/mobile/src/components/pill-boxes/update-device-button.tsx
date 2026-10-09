import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { UpdateDeviceDto } from '@rozumari/contract/device/dto/update-device.dto'
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '@rozumari/ui/components/bottom-sheet'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@rozumari/ui/components/field'
import { PencilIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

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
}: Readonly<{
  device: { id: DeviceId; name: string | null; position: string | null }
}>) {
  const { t } = useTranslation('pill-box')
  const [isOpen, setIsOpen] = React.useState(false)

  const queryClient = useQueryClient()
  const { api } = useRuntime()
  const router = useRouter()

  const unlinkMutation = useMutation({
    ...api.device.unlink.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: api.device.list.getQueryKey(),
      })

      toast.success(t('details.device.unlink.messages.success'))
      router.push('/(tabs)/pill-boxes')
      setIsOpen(false)
    },
    onError: (error) =>
      toast.error(
        t('details.device.unlink.messages.error'),
        error.message ?? undefined
      ),
  })

  return (
    <BottomSheet open={isOpen} onOpenChange={setIsOpen}>
      <BottomSheetTrigger size='sm' variant='ghost'>
        <PencilIcon className='size-4 text-muted-foreground' />
      </BottomSheetTrigger>

      <updateDeviceForm.Provider defaultValues={device}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>
              {t('details.device.update.title')}
            </BottomSheetTitle>
            <BottomSheetDescription>
              {t('details.device.update.description')}
            </BottomSheetDescription>
          </BottomSheetHeader>

          <FieldSet className='p-4'>
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
          </FieldSet>

          <BottomSheetFooter>
            <Field className='flex-row justify-end'>
              <Button
                variant='destructive'
                onPress={() => unlinkMutation.mutate({ id: device.id })}
                disabled={unlinkMutation.isPending}
              >
                {unlinkMutation.isPending
                  ? t('details.device.unlink.actions.submitting')
                  : t('details.device.unlink.actions.submit')}
              </Button>

              <SaveDeviceFormSubmit setIsOpen={setIsOpen} />
            </Field>
          </BottomSheetFooter>
        </BottomSheetContent>
      </updateDeviceForm.Provider>
    </BottomSheet>
  )
}
