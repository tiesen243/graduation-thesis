import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
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

    return {
      execute: Effect.fn(function* execute({ userId, ...input }) {
        const now = yield* DateTime.nowInCurrentZone
        const startDate = DateTime.makeZoned(
          `${input.startDate}T${input.time}`,
          { timeZone: yield* DateTime.CurrentTimeZone, adjustForTimeZone: true }
        )
        const endDate = DateTime.makeZoned(`${input.endDate}T${input.time}`, {
          timeZone: yield* DateTime.CurrentTimeZone,
          adjustForTimeZone: true,
        })

        if (startDate._tag === 'None' || endDate._tag === 'None')
          return yield* Effect.fail(
            new ScheduleInvalid({ message: 'Invalid start or end date' })
          )

        const isStartDateInThePast = DateTime.isLessThan(startDate.value, now)
        const isEndDateInThePast = DateTime.isLessThan(endDate.value, now)

        if (isStartDateInThePast || isEndDateInThePast)
          return yield* Effect.fail(
            new ScheduleInvalid({ message: 'Start or end date is in the past' })
          )

        const isStartDateAfterEndDate = DateTime.isLessThan(
          endDate.value,
          startDate.value
        )
        if (isStartDateAfterEndDate)
          return yield* Effect.fail(
            new ScheduleInvalid({ message: 'Start date is after end date' })
          )

        const dates =
          input.startDate === input.endDate
            ? [input.startDate]
            : expandDateRange(input.startDate, input.endDate, input.daysOfWeek)

        const existingSchedulesOfDevice =
          yield* scheduleRepository.findManyByDeviceIdFromDate({
            deviceId: input.deviceId,
            startDate: input.startDate,
          })

        const compartments = yield* deviceService.findCompartments(
          input.deviceId
        )

        // 1. Calculate reserved quantities by slot from existing schedules
        const reservedQuantitiesBySlot: Record<string, number> = {}
        for (const item of existingSchedulesOfDevice.flatMap((s) => s.items)) {
          reservedQuantitiesBySlot[item.slot] =
            (reservedQuantitiesBySlot[item.slot] ?? 0) + item.quantity
        }

        // 2. Calculate valid quantities by slot based on compartment capacity and reserved quantities
        const validQuantitiesBySlot: Record<string, number> = {}
        for (const comp of compartments) {
          const reserved = reservedQuantitiesBySlot[comp.position] ?? 0
          validQuantitiesBySlot[comp.position] = Math.max(
            0,
            comp.capacity - reserved
          )
        }

        // 3. Calculate total requested quantities by slot for the new schedule
        const totalRequestedBySlot: Record<string, number> = {}
        for (const item of input.items) {
          totalRequestedBySlot[item.slot] =
            (totalRequestedBySlot[item.slot] ?? 0) +
            item.quantity * dates.length
        }

        // 4. Validate that the requested quantities do not exceed the valid quantities
        for (const item of input.items) {
          const validAmount = validQuantitiesBySlot[item.slot] ?? 0
          const requestedAmount = totalRequestedBySlot[item.slot] ?? 0

          if (requestedAmount > validAmount) {
            return yield* Effect.fail(
              new ScheduleInvalid({
                message: `Slot ${item.slot} does not have enough medicine. Available: ${validAmount}, Requested: ${requestedAmount}`,
              })
            )
          }
        }

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
