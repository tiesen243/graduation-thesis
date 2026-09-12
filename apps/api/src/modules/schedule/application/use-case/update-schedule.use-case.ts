import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'

import {
  ScheduleInvalid,
  ScheduleNotFound,
} from '@rozumari/contract/schedule/schemas/schedule.error'
import { ScheduleStatus } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Context from 'effect/Context'
import * as DateTime from 'effect/DateTime'
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
    ) => Effect.Effect<
      UpdateScheduleDto.Output,
      ScheduleNotFound | ScheduleInvalid,
      DateTime.CurrentTimeZone
    >
  }
>()('schedule/application/UpdateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleItemRepository = yield* ScheduleItemRepository
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const [found, [schedule]] = yield* Effect.all([
          scheduleRepository.findWithItems(id),
          scheduleRepository.findMany({
            where: { id: { eq: id } },
            limit: 1,
          }),
        ])
        if (!found || !schedule)
          return yield* Effect.fail(new ScheduleNotFound({ error: { id } }))

        const now = yield* DateTime.nowInCurrentZone

        const targetDateStr = input.date ?? found.date
        const targetTimeStr = input.time ?? found.time

        const combinedDateTimeStr = `${targetDateStr}T${targetTimeStr}`
        const targetDateTimeOption = DateTime.makeZoned(combinedDateTimeStr, {
          timeZone: yield* DateTime.CurrentTimeZone,
          adjustForTimeZone: true,
        })

        if (targetDateTimeOption._tag === 'None')
          return yield* Effect.fail(
            new ScheduleInvalid({ message: 'Invalid date or time format' })
          )

        const isPastDateTime = DateTime.isLessThan(
          targetDateTimeOption.value,
          now
        )

        if (isPastDateTime)
          return yield* Effect.fail(
            new ScheduleInvalid({
              message: 'Schedule date and time must be in the future',
            })
          )

        if (found.status !== ScheduleStatus.make('pending'))
          return yield* Effect.fail(
            new ScheduleInvalid({
              message: 'Only pending schedules can be updated',
            })
          )

        const updatedSchedule = Schedule.make({
          ...schedule,
          date: input.date ?? found.date,
          time: input.time ?? found.time,
          status: input.status ?? found.status,
        })

        let itemsToDelete: ScheduleItem[] = []
        let itemsToSave: ScheduleItem[] = []

        if (input.items) {
          const newSlotsSet = new Set(input.items.map((i) => i.slot))

          itemsToDelete = found.items
            .filter((oldItem) => !newSlotsSet.has(oldItem.slot))
            .map((item) =>
              ScheduleItem.make({ ...item, scheduleId: updatedSchedule.id })
            )

          itemsToSave = input.items.map((item) =>
            ScheduleItem.make({ ...item, scheduleId: updatedSchedule.id })
          )
        } else
          itemsToSave = found.items.map((item) =>
            ScheduleItem.make({ ...item, scheduleId: updatedSchedule.id })
          )

        return yield* Effect.gen(function* tx() {
          if (itemsToDelete.length > 0)
            yield* scheduleItemRepository.delete(itemsToDelete)

          yield* scheduleRepository.save(updatedSchedule)
          yield* scheduleItemRepository.save(itemsToSave)

          return { id: updatedSchedule.id }
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
