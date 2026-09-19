import { ScheduleInvalid } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Effect from 'effect/Effect'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import type { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'

interface ValidateMedicineQuantitiesInput {
  readonly compartments: readonly Compartment[]
  readonly reservedItems: readonly Pick<ScheduleItem, 'slot' | 'quantity'>[]
  readonly itemsToValidate: readonly Pick<ScheduleItem, 'slot' | 'quantity'>[]
  readonly totalDaysCount: number
}

export const validateMedicineQuantities = Effect.fn(
  function* validateMedicineQuantities(input: ValidateMedicineQuantitiesInput) {
    const { compartments, reservedItems, itemsToValidate, totalDaysCount } =
      input

    const reservedQuantitiesBySlot: Record<string, number> = {}
    for (const item of reservedItems)
      reservedQuantitiesBySlot[item.slot] =
        (reservedQuantitiesBySlot[item.slot] ?? 0) + (item.quantity ?? 0)

    const availableQuantitiesBySlot: Record<string, number> = {}
    for (const compartment of compartments) {
      const reserved = reservedQuantitiesBySlot[compartment.position] ?? 0

      availableQuantitiesBySlot[compartment.position] = Math.max(
        0,
        compartment.capacity - reserved
      )
    }

    const requestedQuantitiesBySlot: Record<string, number> = {}
    for (const item of itemsToValidate) {
      requestedQuantitiesBySlot[item.slot] =
        (requestedQuantitiesBySlot[item.slot] ?? 0) +
        item.quantity * totalDaysCount
    }

    for (const [slot, requestedAmount] of Object.entries(
      requestedQuantitiesBySlot
    )) {
      const availableAmount = availableQuantitiesBySlot[slot] ?? 0
      if (requestedAmount > availableAmount)
        return yield* Effect.fail(
          new ScheduleInvalid({
            message:
              `Slot ${slot} does not have enough medicine. ` +
              `Available: ${availableAmount}, ` +
              `Requested: ${requestedAmount}`,
          })
        )
    }
  }
)
