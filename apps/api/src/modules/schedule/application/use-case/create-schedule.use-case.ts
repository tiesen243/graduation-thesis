import type { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Schedule, ScheduleItem } from '@/modules/schedule/domain/entities/schedule.entity'
import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'

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

    return {
      execute: Effect.fn(function* execute({ userId, ...input }) {
        const schedule = Schedule.make({
          ...input,
          userId,
        })

        const items = input.items.map((item) =>
          ScheduleItem.make({
            scheduleId: schedule.id,
            slot: item.slot,
            quantity: item.quantity,
          })
        )

        yield* scheduleRepository.saveWithItems(schedule, items)

        return {
          schedule,
          items,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
