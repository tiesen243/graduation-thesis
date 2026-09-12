import type { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { CurrentTimeZone } from 'effect/DateTime'

import { ScheduleInvalid } from '@rozumari/contract/schedule/schemas/schedule.error'
import { ScheduleStatus } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Context from 'effect/Context'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

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
      ScheduleInvalid,
      CurrentTimeZone
    >
  }
>()('schedule/application/CreateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleItemRepository = yield* ScheduleItemRepository
    const scheduleRepository = yield* ScheduleRepository

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
