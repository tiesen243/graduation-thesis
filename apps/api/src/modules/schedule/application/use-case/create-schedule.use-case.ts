import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { CurrentTimeZone } from 'effect/DateTime'

import { ScheduleInvalid } from '@rozumari/contract/schedule/schemas/schedule.error'
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
import { expandDateRange } from '@/modules/schedule/domain/utils/expand-date-range'
import { withTransaction } from '@/shared/utils'

export class CreateScheduleUseCase extends Context.Service<
  CreateScheduleUseCase,
  {
    readonly execute: (
      input: CreateScheduleDto.Input & { userId: UserId }
    ) => Effect.Effect<
      CreateScheduleDto.Output,
      ScheduleInvalid | DeviceNotFound,
      CurrentTimeZone
    >
  }
>()('schedule/application/CreateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleItemRepository = yield* ScheduleItemRepository
    const scheduleRepository = yield* ScheduleRepository
    const deviceService = yield* DeviceService

    // Helper 1: Validate dates and calculate target dates array
    const validateAndExpandDates = Effect.fn(function* validateAndExpandDates(
      input: CreateScheduleDto.Input
    ) {
      const now = yield* DateTime.nowInCurrentZone
      const startDate = DateTime.makeZoned(`${input.startDate}T${input.time}`, {
        timeZone: yield* DateTime.CurrentTimeZone,
        adjustForTimeZone: true,
      })
      const endDate = DateTime.makeZoned(`${input.endDate}T${input.time}`, {
        timeZone: yield* DateTime.CurrentTimeZone,
        adjustForTimeZone: true,
      })

      if (startDate._tag === 'None' || endDate._tag === 'None')
        return yield* Effect.fail(
          new ScheduleInvalid({ message: 'Invalid start or end date' })
        )

      if (
        DateTime.isLessThan(startDate.value, now) ||
        DateTime.isLessThan(endDate.value, now)
      )
        return yield* Effect.fail(
          new ScheduleInvalid({ message: 'Start or end date is in the past' })
        )

      if (DateTime.isLessThan(endDate.value, startDate.value))
        return yield* Effect.fail(
          new ScheduleInvalid({ message: 'Start date is after end date' })
        )

      return input.startDate === input.endDate
        ? [input.startDate]
        : expandDateRange(input.startDate, input.endDate, input.daysOfWeek)
    })

    // Helper 2: Validate slot capacities against existing reserved quantities
    const validateMedicineQuantities = Effect.fn(
      function* validateMedicineQuantities(
        deviceId: DeviceId,
        items: CreateScheduleDto.Input['items'],
        totalDaysCount: number
      ) {
        const existingSchedulesOfDevice =
          yield* scheduleRepository.findManyPendingByDeviceId({ deviceId })
        const compartments = yield* deviceService.findCompartments(deviceId)

        const reservedQuantitiesBySlot: Record<string, number> = {}
        for (const item of existingSchedulesOfDevice) {
          reservedQuantitiesBySlot[item.slot] = item.quantity ?? 0
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
        for (const item of items) {
          totalRequestedBySlot[item.slot] =
            (totalRequestedBySlot[item.slot] ?? 0) +
            item.quantity * totalDaysCount
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

    return {
      execute: Effect.fn(function* execute({ userId, ...input }) {
        const dates = yield* validateAndExpandDates(input)
        yield* validateMedicineQuantities(
          input.deviceId,
          input.items,
          dates.length
        )

        const results = dates.map((date) => {
          const schedule = Schedule.make({
            userId,
            deviceId: input.deviceId,
            date,
            time: input.time,
            status: ScheduleStatus.make('pending'),
          })

          const items = input.items.map((item) =>
            ScheduleItem.make({
              scheduleId: schedule.id,
              slot: item.slot,
              quantity: item.quantity,
              isRequired: item.isRequired,
            })
          )

          return { schedule, items }
        })

        return yield* Effect.gen(function* tx() {
          yield* scheduleRepository.save(results.map((r) => r.schedule))
          yield* scheduleItemRepository.save(results.flatMap((r) => r.items))
          return results
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
