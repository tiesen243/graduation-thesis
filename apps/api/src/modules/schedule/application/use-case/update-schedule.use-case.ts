import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'

import { ScheduleNotFound } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'

export class UpdateScheduleUseCase extends Context.Service<
  UpdateScheduleUseCase,
  {
    readonly execute: (
      input: UpdateScheduleDto.Params & UpdateScheduleDto.Input
    ) => Effect.Effect<UpdateScheduleDto.Output, ScheduleNotFound>
  }
>()('schedule/application/UpdateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const found = yield* scheduleRepository.findWithItems(id)
        if (!found)
          return yield* Effect.fail(new ScheduleNotFound({ error: { id } }))

        const updatedSchedule = found.schedule.update({
          date: input.date ?? found.schedule.date,
          time: input.time ?? found.schedule.time,
          status: input.status ?? found.schedule.status,
        })

        const items = input.items
          ? input.items.map((item) =>
              ScheduleItem.make({
                ...(item.id ? { id: item.id } : {}),
                scheduleId: updatedSchedule.id,
                slot: item.slot,
                quantity: item.quantity,
              })
            )
          : found.items

        yield* scheduleRepository.saveWithItems(updatedSchedule, items)

        return { schedule: updatedSchedule, items }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
