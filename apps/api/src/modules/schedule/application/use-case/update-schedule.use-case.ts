import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'

import { ScheduleNotFound } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import {
  Schedule,
  ScheduleItem,
} from '@/modules/schedule/domain/entities/schedule.entity'
import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'

export class UpdateScheduleUseCase extends Context.Service<
  UpdateScheduleUseCase,
  {
    readonly execute: (
      input: UpdateScheduleDto.Params &
        UpdateScheduleDto.Input
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
          startDate: input.startDate ?? found.schedule.startDate,
          endDate: input.endDate ?? found.schedule.endDate,
          daysOfWeek: input.daysOfWeek ?? found.schedule.daysOfWeek,
          time: input.time ?? found.schedule.time,
        })

        let items: ScheduleItem[]
        if (input.items) {
          items = input.items.map((item) =>
            item.id
              ? found.items
                  .find((i) => i.id === item.id)
                  ?.update({ slot: item.slot, quantity: item.quantity }) ??
                ScheduleItem.make({
                  id: item.id,
                  scheduleId: updatedSchedule.id,
                  slot: item.slot,
                  quantity: item.quantity,
                })
              : ScheduleItem.make({
                  id: item.id,
                  scheduleId: updatedSchedule.id,
                  slot: item.slot,
                  quantity: item.quantity,
                })
          )
        } else {
          items = found.items
        }

        yield* scheduleRepository.saveWithItems(updatedSchedule, items)

        return { schedule: updatedSchedule, items }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
