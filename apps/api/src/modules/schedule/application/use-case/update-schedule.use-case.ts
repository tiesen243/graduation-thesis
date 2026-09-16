import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import {
  ScheduleInvalid,
  ScheduleNotFound,
} from '@rozumari/contract/schedule/schemas/schedule.error'
import { ScheduleStatus } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Context from 'effect/Context'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceService } from '@/modules/device/application/ports/device.service'
import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { withTransaction } from '@/shared/utils'

export class UpdateScheduleUseCase extends Context.Service<
  UpdateScheduleUseCase,
  {
    readonly execute: (
      input: UpdateScheduleDto.Params & UpdateScheduleDto.Input
    ) => Effect.Effect<
      UpdateScheduleDto.Output,
      ScheduleNotFound | ScheduleInvalid | DeviceNotFound,
      DateTime.CurrentTimeZone
    >
  }
>()('schedule/application/UpdateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleItemRepository = yield* ScheduleItemRepository
    const scheduleRepository = yield* ScheduleRepository
    const deviceService = yield* DeviceService

    // Helper 1: Fetch and validate schedule existence and status
    const getAndValidateSchedule = Effect.fn(function* getAndValidateSchedule(
      id: ScheduleId
    ) {
      const [found, [schedule]] = yield* Effect.all([
        scheduleRepository.findWithItems(id),
        scheduleRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        }),
      ])

      if (!found || !schedule)
        return yield* Effect.fail(new ScheduleNotFound({ error: { id } }))

      if (found.status !== ScheduleStatus.make('pending'))
        return yield* Effect.fail(
          new ScheduleInvalid({
            message: 'Only pending schedules can be updated',
          })
        )

      return { found, schedule }
    })

    // Helper 2: Validate target date and time format and ensure it's in the future
    const validateTargetDateTime = Effect.fn(function* validateTargetDateTime(
      targetDateStr: string,
      targetTimeStr: string
    ) {
      const now = yield* DateTime.nowInCurrentZone
      const targetDateTimeOption = DateTime.makeZoned(
        `${targetDateStr}T${targetTimeStr}`,
        { timeZone: yield* DateTime.CurrentTimeZone, adjustForTimeZone: true }
      )

      if (targetDateTimeOption._tag === 'None')
        return yield* Effect.fail(
          new ScheduleInvalid({ message: 'Invalid date or time format' })
        )

      if (DateTime.isLessThan(targetDateTimeOption.value, now))
        return yield* Effect.fail(
          new ScheduleInvalid({
            message: 'Schedule date and time must be in the future',
          })
        )
    })

    // Helper 3: Validate available medicine quantities excluding current schedule's previous items
    const validateMedicineQuantities = Effect.fn(
      function* validateMedicineQuantities(
        deviceId: DeviceId,
        currentItems: readonly { slot: string; quantity: number }[],
        newItemsToValidate: readonly { slot: string; quantity: number }[]
      ) {
        const existingSchedulesOfDevice =
          yield* scheduleRepository.findManyPendingByDeviceId({ deviceId })
        const compartments = yield* deviceService.findCompartments(deviceId)

        const reservedQuantitiesBySlot: Record<string, number> = {}
        for (const item of existingSchedulesOfDevice) {
          reservedQuantitiesBySlot[item.slot] = item.quantity ?? 0
        }

        // Subtract current items to prevent double-counting during updates
        for (const currentItem of currentItems) {
          const currentReserved =
            reservedQuantitiesBySlot[currentItem.slot] ?? 0
          reservedQuantitiesBySlot[currentItem.slot] = Math.max(
            0,
            currentReserved - currentItem.quantity
          )
        }

        const validQuantitiesBySlot: Record<string, number> = {}
        for (const comp of compartments) {
          const reserved = reservedQuantitiesBySlot[comp.position] ?? 0
          validQuantitiesBySlot[comp.position] = Math.max(
            0,
            comp.capacity - reserved
          )
        }

        const totalRequestedBySlot: Record<string, number> = {}
        for (const item of newItemsToValidate) {
          totalRequestedBySlot[item.slot] =
            (totalRequestedBySlot[item.slot] ?? 0) + item.quantity
        }

        for (const [slot, requestedAmount] of Object.entries(
          totalRequestedBySlot
        )) {
          const validAmount = validQuantitiesBySlot[slot] ?? 0
          if (requestedAmount > validAmount) {
            return yield* Effect.fail(
              new ScheduleInvalid({
                message: `Slot ${slot} does not have enough medicine. Available: ${validAmount}, Requested: ${requestedAmount}`,
              })
            )
          }
        }
      }
    )

    // Helper 4: Prepare entities diff for persistence
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const prepareItemsMutation = (
      updatedScheduleId: ScheduleId,
      foundItems: readonly {
        slot: string
        quantity: number
        isRequired: boolean
      }[],
      inputItems: readonly {
        slot: string
        quantity: number
        isRequired: boolean
      }[]
    ) => {
      let itemsToDelete: ScheduleItem[] = []
      let itemsToSave: ScheduleItem[] = []

      if (inputItems.length > 0) {
        const newSlotsSet = new Set(inputItems.map((i) => i.slot))
        itemsToDelete = foundItems
          .filter((oldItem) => !newSlotsSet.has(oldItem.slot))
          .map((item) =>
            ScheduleItem.make({ ...item, scheduleId: updatedScheduleId })
          )

        itemsToSave = inputItems.map((item) =>
          ScheduleItem.make({ ...item, scheduleId: updatedScheduleId })
        )
      } else {
        itemsToSave = foundItems.map((item) =>
          ScheduleItem.make({ ...item, scheduleId: updatedScheduleId })
        )
      }

      const shouldUpdate = itemsToSave.some((item, index) => {
        const foundItem = foundItems[index]
        if (!foundItem) return true

        return (
          item.slot !== foundItem.slot ||
          item.quantity !== foundItem.quantity ||
          item.isRequired !== foundItem.isRequired
        )
      })

      return { itemsToDelete, itemsToSave, shouldUpdate }
    }

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const { found, schedule } = yield* getAndValidateSchedule(id)

        const targetDateStr = input.date ?? found.date
        const targetTimeStr = input.time ?? found.time
        yield* validateTargetDateTime(targetDateStr, targetTimeStr)

        const itemsToValidate =
          input.items.length > 0 ? input.items : found.items
        yield* validateMedicineQuantities(
          found.device.id,
          found.items,
          itemsToValidate
        )

        const updatedSchedule = Schedule.make({
          ...schedule,
          date: targetDateStr,
          time: targetTimeStr,
          status: input.status ?? found.status,
        })

        const { itemsToDelete, itemsToSave, shouldUpdate } =
          prepareItemsMutation(updatedSchedule.id, found.items, input.items)

        return yield* Effect.gen(function* tx() {
          if (itemsToDelete.length > 0)
            yield* scheduleItemRepository.delete(itemsToDelete)

          yield* scheduleRepository.save(updatedSchedule)

          if (shouldUpdate) yield* scheduleItemRepository.save(itemsToSave)

          return { id: updatedSchedule.id }
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
