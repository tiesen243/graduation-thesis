import type { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { ScheduleStatus } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { ScheduleItemRepository } from '@/modules/schedule/domain/repositories/schedule-item.repository'
import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'
import { expandDateRange } from '@/modules/schedule/domain/utils/expand-date-range'
import { withTransaction } from '@/shared/utils'

export class CreateScheduleUseCase extends Context.Service<
  CreateScheduleUseCase,
  {
    readonly execute: (
      input: CreateScheduleDto.Input & { userId: UserId }
    ) => Effect.Effect<CreateScheduleDto.Output>
  }
>()('schedule/application/CreateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository
    const scheduleItemRepository = yield* ScheduleItemRepository

    return {
      execute: Effect.fn(function* execute({ userId, ...input }) {
        const dates = expandDateRange(
          input.startDate,
          input.endDate,
          input.daysOfWeek
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
