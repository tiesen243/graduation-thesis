import type { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import type { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'

import {
  ScheduleInvalid,
  ScheduleNotFound,
} from '@rozumari/contract/schedule/schemas/schedule.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'

import { DeviceService } from '@/modules/device/application/ports/device.service'
import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { validateScheduleIsPending } from '@/modules/schedule/domain/services/schedule-policy'
import { withTransaction } from '@/shared/utils'

export class UpdateScheduleStatusUseCase extends Context.Service<
  UpdateScheduleStatusUseCase,
  {
    readonly execute: (
      input: UpdateScheduleDto.Params & Pick<UpdateScheduleDto.Input, 'status'>
    ) => Effect.Effect<
      void,
      ScheduleNotFound | ScheduleInvalid | DeviceNotFound
    >
  }
>()('schedule/application/UpdateScheduleStatusUseCase', {
  make: Effect.gen(function* make() {
    const scheduleRepository = yield* ScheduleRepository
    const deviceService = yield* DeviceService

    return {
      execute: Effect.fn(function* execute({ id, status }) {
        if (status === 'pending')
          return yield* Effect.fail(
            new ScheduleInvalid({ message: 'Cannot set status to pending' })
          )

        const schedule = yield* scheduleRepository.findWithItems(id)
        if (!schedule)
          return yield* Effect.fail(new ScheduleNotFound({ error: { id } }))

        yield* validateScheduleIsPending(schedule.status)

        const { device, items, ..._schedule } = schedule
        const compartments = yield* deviceService.findCompartments(device.id)

        const updatedSchedule = Schedule.make({
          ..._schedule,
          deviceId: device.id,
          status,
        })
        const compartmentsToUpdate: Compartment[] = []

        if (status === 'completed') {
          for (const item of items) {
            const compartment = compartments.find(
              (c) => c.position === item.slot
            )
            if (!compartment) continue

            const updatedCompartment = compartment.update({
              capacity: Math.max(0, compartment.capacity - item.quantity),
            })
            compartmentsToUpdate.push(updatedCompartment)
          }
        } else if (status === 'failed') {
          // noop
        }

        yield* Effect.gen(function* executeTx() {
          yield* scheduleRepository.save(updatedSchedule)
          yield* deviceService.updateCompartments(
            schedule.device.id,
            compartmentsToUpdate
          )
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
