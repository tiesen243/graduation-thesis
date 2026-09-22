import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import type { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import type { ScheduleInvalid } from '@rozumari/contract/schedule/schemas/schedule.error'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { CurrentTimeZone } from 'effect/DateTime'

import { ScheduleStatus } from '@rozumari/contract/schedule/schemas/schedule.schema'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceService } from '@/modules/device/application/ports/device.service'
import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { validateMedicineQuantities } from '@/modules/schedule/domain/services/medicine-quantity.policy'
import { validateAndExpandScheduleDates } from '@/modules/schedule/domain/services/schedule-policy'
import { withTransaction } from '@/shared/utils'

export class CreateScheduleUseCase extends Context.Service<
  CreateScheduleUseCase,
  {
    readonly execute: (
      input: CreateScheduleDto.Input & { userId: UserId }
    ) => Effect.Effect<
      CreateScheduleDto.Output,
      ScheduleInvalid | DeviceNotFound,
      CurrentTimeZone
    >
  }
>()('schedule/application/CreateScheduleUseCase', {
  make: Effect.gen(function* make() {
    const scheduleItemRepository = yield* ScheduleItemRepository
    const scheduleRepository = yield* ScheduleRepository
    const deviceService = yield* DeviceService

    return {
      execute: Effect.fn(function* execute({ userId, ...input }) {
        const dates = yield* validateAndExpandScheduleDates(input)

        const existingSchedules =
          yield* scheduleRepository.findManyPendingByDeviceId({
            deviceId: input.deviceId,
          })

        const compartments = yield* deviceService.findCompartments(
          input.deviceId
        )

        yield* validateMedicineQuantities({
          compartments,
          reservedItems: existingSchedules,
          itemsToValidate: input.items,
          totalDaysCount: dates.length,
        })

        const results = dates.map((date) => {
          const schedule = Schedule.make({
            userId,
            deviceId: input.deviceId,
            date,
            time: input.time,
            status: ScheduleStatus.make('pending'),
          })

          const items = input.items.map((item) =>
            ScheduleItem.make({
              scheduleId: schedule.id,
              slot: item.slot,
              quantity: item.quantity,
              isRequired: item.isRequired,
            })
          )

          return { schedule, items }
        })

        return yield* Effect.gen(function* tx() {
          yield* scheduleRepository.save(results.map((r) => r.schedule))
          yield* scheduleItemRepository.save(results.flatMap((r) => r.items))
          return results
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
