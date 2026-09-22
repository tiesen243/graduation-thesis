import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { MinusIcon, PlusIcon } from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, ScrollView, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

interface DropItemConfig {
  slot: string
  medicine: string
  quantity: number
}

export const DropButton: React.FC<{
  id: DeviceId
  compartments: readonly CompartmentSchema[]
}> = ({ id, compartments }) => {
  const { t } = useTranslation(['common', 'pill-box'])

  const { api } = useRuntime()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItems, setSelectedItems] = useState<
    Record<string, DropItemConfig>
  >({})

  const toggleSelectSlot = (compartment: CompartmentSchema) => {
    setSelectedItems((prev) => {
      const next = { ...prev }
      // oxlint-disable-next-line typescript/no-dynamic-delete
      if (next[compartment.position]) delete next[compartment.position]
      else
        next[compartment.position] = {
          slot: compartment.position,
          medicine: compartment.medicine ?? '',
          quantity: 1,
        }
      return next
    })
  }

  const updateQuantity = (slot: string, delta: number, maxQty: number) => {
    setSelectedItems((prev) => {
      const current = prev[slot]
      if (!current) return prev

      const newQty = Math.max(1, Math.min(maxQty, current.quantity + delta))
      return {
        ...prev,
        [slot]: { ...current, quantity: newQty },
      }
    })
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedItems({})
  }

  const dropMutation = useMutation({
    ...api.device.emit.mutationOptions({ params: { id } }),
    onSuccess: handleCloseModal,
  })

  const handleConfirmDrop = () => {
    const payload = Object.values(selectedItems)
    if (payload.length === 0) return
    dropMutation.mutate({
      action: 'drop',
      payload,
    })
  }

  const availableCompartments = compartments.filter(
    (c) => c.medicine && c.capacity > 0
  )

  return (
    <>
      <Button size='sm' variant='outline' onPress={() => setModalVisible(true)}>
        {t('pill-box:details.drop.button')}
      </Button>

      <Modal
        visible={modalVisible}
        transparent
        animationType='fade'
        onRequestClose={handleCloseModal}
      >
        <View className='flex-1 justify-center bg-black/50 p-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('pill-box:details.drop.title')}</CardTitle>
              <CardDescription>
                {t('pill-box:details.drop.description')}
              </CardDescription>
            </CardHeader>

            <ScrollView className='px-4' contentContainerClassName='gap-3'>
              {availableCompartments.length === 0 ? (
                <CardDescription>
                  {t('pill-box:details.drop.empty')}
                </CardDescription>
              ) : (
                availableCompartments.map((item) => {
                  const isSelected = !!selectedItems[item.position]
                  const currentDropQty =
                    selectedItems[item.position]?.quantity ?? 1

                  return (
                    <Pressable
                      key={item.position}
                      onPress={() => toggleSelectSlot(item)}
                      className={cn(
                        'flex-row items-center justify-between rounded-lg border p-3',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card'
                      )}
                    >
                      <View className='flex-1 pr-2'>
                        <CardTitle>{item.medicine}</CardTitle>
                        <CardDescription className='capitalize'>
                          {t('slot')}: {item.position} | {t('available')}:{' '}
                          {item.capacity}
                        </CardDescription>
                      </View>

                      {isSelected && (
                        <View
                          className='flex-row items-center gap-2 rounded-lg border border-primary/20'
                          onStartShouldSetResponder={() => true}
                        >
                          <Button
                            size='icon-sm'
                            variant='ghost'
                            className='rounded-r-none border-0 border-r border-primary/20'
                            onPress={() =>
                              updateQuantity(item.position, -1, item.capacity)
                            }
                          >
                            <MinusIcon className='size-4 shrink-0 text-foreground' />
                          </Button>

                          <Typography className='w-6 text-center text-sm font-medium'>
                            {currentDropQty}
                          </Typography>

                          <Button
                            size='icon-sm'
                            variant='ghost'
                            className='rounded-l-none border-0 border-l border-primary/20'
                            onPress={() =>
                              updateQuantity(item.position, 1, item.capacity)
                            }
                          >
                            <PlusIcon className='size-4 shrink-0 text-foreground' />
                          </Button>
                        </View>
                      )}
                    </Pressable>
                  )
                })
              )}
            </ScrollView>

            <CardFooter className='flex-row items-center justify-end gap-2'>
              <Button
                variant='ghost'
                onPress={handleCloseModal}
                disabled={dropMutation.isPending}
              >
                {t('pill-box:details.drop.actions.cancel')}
              </Button>

              <Button
                onPress={handleConfirmDrop}
                disabled={
                  Object.keys(selectedItems).length === 0 ||
                  dropMutation.isPending
                }
              >
                {dropMutation.isPending
                  ? t('pill-box:details.drop.actions.submitting')
                  : t('pill-box:details.drop.actions.submit')}
              </Button>
            </CardFooter>
          </Card>
        </View>
      </Modal>
    </>
  )
}
