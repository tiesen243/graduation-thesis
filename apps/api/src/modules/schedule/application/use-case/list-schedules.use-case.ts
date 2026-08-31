import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'

export class ListSchedulesUseCase extends Context.Service<
  ListSchedulesUseCase,
  {
    readonly execute: (
      input: ListSchedulesDto.Input & { userId?: UserId }
    ) => Effect.Effect<ListSchedulesDto.Output>
  }
>()('schedule/application/ListSchedulesUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId, deviceId, startDate, endDate } = input

        return yield* scheduleRepository.findManyWithItems({
          userId,
          deviceId,
          startDate,
          endDate,
        })
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
