import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

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
import { MinusIcon, PillIcon, PlusIcon } from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '@/lib/runtime'

interface DropItemConfig {
  slot: string
  quantity: number
}

export const DropPillButton: React.FC<{
  id: DeviceId
  compartments: readonly CompartmentSchema[]
}> = ({ id, compartments }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<
    Record<string, DropItemConfig>
  >({})

  const handleCloseModal = () => {
    setIsOpen(false)
    // Đợi Dialog đóng xong rồi mới reset state để tránh giật UI
    setTimeout(() => setSelectedItems({}), 150)
  }

  const dropMutation = useMutation({
    ...api.device.emit.mutationOptions({ params: { id } }),
    onSuccess: handleCloseModal,
  })

  const toggleSelectSlot = (compartment: CompartmentSchema) => {
    setSelectedItems((prev) => {
      const next = { ...prev }
      if (next[compartment.position]) {
        // oxlint-disable-next-line typescript/no-dynamic-delete
        delete next[compartment.position]
      } else {
        next[compartment.position] = {
          slot: compartment.position,
          quantity: 1,
        }
      }
      return next
    })
  }

  const updateQuantity = (
    e: React.MouseEvent,
    slot: string,
    delta: number,
    maxQty: number
  ) => {
    e.stopPropagation() // Ngăn việc un-select khi bấm nút +/-
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant='link' className='hidden sm:flex'>
            <PillIcon data-icon='inline-start' className='mr-2' /> Drop a pill
          </Button>
        }
      />

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Drop Pills</DialogTitle>
          <DialogDescription>
            Select the compartments and the amount of pills you want to drop.
          </DialogDescription>
        </DialogHeader>

        <div className='flex max-h-[50vh] flex-col gap-3 overflow-y-auto p-1'>
          {availableCompartments.length === 0 ? (
            <Typography
              variant='p'
              className='text-center text-muted-foreground'
            >
              No available compartments with pills.
            </Typography>
          ) : (
            availableCompartments.map((item) => {
              const isSelected = !!selectedItems[item.position]
              const currentDropQty = selectedItems[item.position]?.quantity ?? 1

              return (
                <button
                  key={item.position}
                  type='button'
                  onClick={() => toggleSelectSlot(item)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  <div className='flex flex-1 flex-col items-start justify-start pr-2'>
                    <Typography variant='p' className='font-semibold'>
                      {item.medicine}
                    </Typography>
                    <Typography
                      variant='p'
                      className='text-xs text-muted-foreground'
                    >
                      Slot: {item.position} | Available: {item.capacity}
                    </Typography>
                  </div>

                  {isSelected && (
                    <div className='flex items-center gap-1 rounded-md border border-primary/20'>
                      <Button
                        size='icon-sm'
                        variant='ghost'
                        className='rounded-r-none border-0 border-r border-primary/20'
                        onClick={(e) =>
                          updateQuantity(e, item.position, -1, item.capacity)
                        }
                      >
                        <MinusIcon className='h-3 w-3' />
                      </Button>

                      <Typography
                        variant='p'
                        className='w-8 text-center text-sm font-medium'
                      >
                        {currentDropQty}
                      </Typography>

                      <Button
                        size='icon-sm'
                        variant='ghost'
                        className='rounded-l-none border-0 border-l border-primary/20'
                        onClick={(e) =>
                          updateQuantity(e, item.position, 1, item.capacity)
                        }
                      >
                        <PlusIcon className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        <DialogFooter className='sm:justify-end'>
          <DialogClose render={<Button variant='ghost'>Cancel</Button>} />
          <Button
            onClick={handleConfirmDrop}
            disabled={
              Object.keys(selectedItems).length === 0 || dropMutation.isPending
            }
          >
            {dropMutation.isPending ? 'Dropping...' : 'Confirm Drop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
