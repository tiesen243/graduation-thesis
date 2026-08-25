import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'

export class ListSchedulesUseCase extends Context.Service<
  ListSchedulesUseCase,
  {
    readonly execute: (
      input: ListSchedulesDto.Input & { userId: UserId }
    ) => Effect.Effect<ListSchedulesDto.Output>
  }
>()('schedule/application/ListSchedulesUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute({ userId, page, limit, deviceId }) {
        const offset = (page - 1) * limit

        const schedules = yield* scheduleRepository.findMany({
          where: deviceId
            ? { userId: { eq: userId }, deviceId: { eq: deviceId } }
            : { userId: { eq: userId } },
          limit,
          offset,
        })

        const results = yield* Effect.forEach(
          schedules,
          Effect.fn(function* (schedule) {
            const found = yield* scheduleRepository.findWithItems(schedule.id)
            return found ?? { schedule, items: [] }
          }),
          { concurrency: 'unbounded' }
        )

        const total = yield* scheduleRepository.count({
          userId: { eq: userId },
        })

        const totalPages = Math.max(1, Math.ceil(total / limit))

        return {
          schedules: results,
          meta: { page, pageSize: limit, total, totalPages },
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
