import type { UpdateCapacityDto } from '@rozumari/contract/device/dto/update-capacity.dto'

import { CurrentDevice } from '@rozumari/contract/device/middleware'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'

import { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'

export class UpdateCapacityUseCase extends Context.Service<
  UpdateCapacityUseCase,
  {
    readonly execute: (
      input: UpdateCapacityDto.Input
    ) => Effect.Effect<UpdateCapacityDto.Output, DeviceNotFound, CurrentDevice>
  }
>()('device/application/UpdateCapacityUseCase', {
  make: Effect.gen(function* make() {
    const compartmentRepository = yield* CompartmentRepository

    return {
      execute: Effect.fn(function* execute({ mode, slots }) {
        const deviceId = yield* CurrentDevice

        const compartments = yield* compartmentRepository.findMany({
          where: { deviceId: { eq: deviceId } },
        })
        if (compartments.length === 0)
          return yield* Effect.fail(
            new DeviceNotFound({ error: { id: deviceId } })
          )

        const updatedCompartments: Compartment[] = []
        for (const slot of slots) {
          const compartment = compartments.find(
            (c) => c.position === slot.position
          )
          if (!compartment) continue

          let { capacity } = compartment
          if (mode === 'replacement') ({ capacity } = slot)
          else if (mode === 'addition') capacity += slot.capacity
          else if (mode === 'subtraction') capacity -= slot.capacity
          capacity = Math.max(0, capacity)

          updatedCompartments.push(compartment.update({ capacity }))
        }

        yield* compartmentRepository.save(updatedCompartments)

        return { id: deviceId }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
