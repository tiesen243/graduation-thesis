import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { UserRole } from '@rozumari/contract/user/schemas/user.schema';
import type { UserId } from '@rozumari/contract/user/schemas/user.schema';
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'

export class ListSchedulesUseCase extends Context.Service<
  ListSchedulesUseCase,
  {
    readonly execute: (
      input: ListSchedulesDto.Input & { userId?: UserId; userRole?: UserRole }
    ) => Effect.Effect<ListSchedulesDto.Output, never>
  }
>()('schedule/application/ListSchedulesUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId, userRole, deviceId, startDate, endDate } = input

        return yield* scheduleRepository.findManyWithItems({
          userId: userRole === UserRole.make('admin') ? undefined : userId,
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
