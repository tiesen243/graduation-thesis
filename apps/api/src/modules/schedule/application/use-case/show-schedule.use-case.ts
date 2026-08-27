import type { ShowScheduleDto } from '@rozumari/contract/schedule/dto/show-schedule.dto'

import { ScheduleNotFound } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'

export class ShowScheduleUseCase extends Context.Service<
  ShowScheduleUseCase,
  {
    readonly execute: (
      input: ShowScheduleDto.Input
    ) => Effect.Effect<ShowScheduleDto.Output, ScheduleNotFound>
  }
>()('schedule/application/ShowScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute({ id }) {
        const result = yield* scheduleRepository.findWithItems(id)
        if (!result)
          return yield* Effect.fail(new ScheduleNotFound({ error: { id } }))

        return result
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
