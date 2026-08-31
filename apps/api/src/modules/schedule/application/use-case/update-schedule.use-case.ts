import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'

import { ScheduleNotFound } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { withTransaction } from '@/shared/utils'

export class UpdateScheduleUseCase extends Context.Service<
  UpdateScheduleUseCase,
  {
    readonly execute: (
      input: UpdateScheduleDto.Params & UpdateScheduleDto.Input
    ) => Effect.Effect<UpdateScheduleDto.Output, ScheduleNotFound>
  }
>()('schedule/application/UpdateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleItemRepository = yield* ScheduleItemRepository
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const found = yield* scheduleRepository.findWithItems(id)
        if (!found)
          return yield* Effect.fail(new ScheduleNotFound({ error: { id } }))

        const updatedSchedule = Schedule.make({
          ...found,
          date: input.date ?? found.date,
          time: input.time ?? found.time,
          status: input.status ?? found.status,
        })

        const items = input.items
          ? input.items.map((item) =>
              ScheduleItem.make({
                scheduleId: updatedSchedule.id,
                slot: item.slot,
                quantity: item.quantity,
              })
            )
          : found.items.map((item) =>
              ScheduleItem.make({
                ...item,
                scheduleId: updatedSchedule.id,
              })
            )

        return yield* Effect.gen(function* tx() {
          yield* scheduleRepository.save(updatedSchedule)
          yield* scheduleItemRepository.save(items)

          return { schedule: updatedSchedule, items }
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
