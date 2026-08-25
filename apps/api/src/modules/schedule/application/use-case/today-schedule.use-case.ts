import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { TodayScheduleDto } from '@rozumari/contract/schedule/dto/today-schedule.dto'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'

export class TodayScheduleUseCase extends Context.Service<
  TodayScheduleUseCase,
  {
    readonly execute: (input: {
      id: DeviceId
    }) => Effect.Effect<TodayScheduleDto.Output>
  }
>()('schedule/application/TodayScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository

    return {
      execute: Effect.fn(function* execute({ id }) {
        const schedules = yield* scheduleRepository.findTodayByDevice(id)

        return { schedules }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
