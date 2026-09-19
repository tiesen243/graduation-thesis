import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'
import type { ScheduleInvalid } from '@rozumari/contract/schedule/schemas/schedule.error'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type * as DateTime from 'effect/DateTime'

import { ScheduleNotFound } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceService } from '@/modules/device/application/ports/device.service'
import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { validateMedicineQuantities } from '@/modules/schedule/domain/services/medicine-quantity.policy'
import {
  validateScheduleIsPending,
  validateTargetDateTime,
} from '@/modules/schedule/domain/services/schedule-policy'
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

      yield* validateScheduleIsPending(found.status)

      return { found, schedule }
    })

    // Helper 4: Prepare entities diff for persistence
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const prepareItemsMutation = (
      scheduleId: ScheduleId,
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
      const nextItems = inputItems ?? foundItems
      const foundBySlot = new Map(foundItems.map((item) => [item.slot, item]))
      const nextBySlot = new Map(nextItems.map((item) => [item.slot, item]))

      const itemsToDelete = foundItems
        .filter((item) => !nextBySlot.has(item.slot))
        .map((item) =>
          ScheduleItem.make({
            ...item,
            scheduleId,
          })
        )

      const itemsToSave = nextItems
        .filter((item) => {
          const oldItem = foundBySlot.get(item.slot)

          return (
            !oldItem ||
            oldItem.quantity !== item.quantity ||
            oldItem.isRequired !== item.isRequired
          )
        })
        .map((item) => ScheduleItem.make({ ...item, scheduleId }))

      return {
        itemsToDelete,
        itemsToSave,
        shouldUpdate: itemsToDelete.length > 0 || itemsToSave.length > 0,
      }
    }

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const { found, schedule } = yield* getAndValidateSchedule(id)

        const targetDateStr = input.date ?? found.date
        const targetTimeStr = input.time ?? found.time
        yield* validateTargetDateTime(targetDateStr, targetTimeStr)

        const itemsToValidate =
          input.items.length > 0 ? input.items : found.items

        const existingSchedules =
          yield* scheduleRepository.findManyPendingByDeviceId({
            deviceId: found.device.id,
            excludeScheduleId: id,
          })

        const compartments = yield* deviceService.findCompartments(
          found.device.id
        )

        yield* validateMedicineQuantities({
          compartments,
          reservedItems: existingSchedules,
          itemsToValidate,
          totalDaysCount: 1,
        })

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
