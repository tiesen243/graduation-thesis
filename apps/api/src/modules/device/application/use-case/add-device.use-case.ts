import type { AddDeviceDto } from '@rozumari/contract/device/dto/add-device.dto'
import type { DeviceAlreadyExists } from '@rozumari/contract/device/schemas/device.error'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'
import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import { Device } from '@/modules/device/domain/entities/device.entity'
import { withTransaction } from '@/shared/utils'

export class AddDeviceUseCase extends Context.Service<
  AddDeviceUseCase,
  {
    readonly execute: (
      input: AddDeviceDto.Input
    ) => Effect.Effect<AddDeviceDto.Output, DeviceAlreadyExists>
  }
>()('device/application/AddDeviceUseCase', {
  make: Effect.gen(function* make() {
    const compartmentRepository = yield* CompartmentRepository
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { amount, size } = input

        // oxlint-disable-next-line unicorn/no-array-for-each
        return yield* Effect.forEach(
          Array.from({ length: amount }),
          Effect.fn(function* txLoop() {
            const factoryModel = yield* Device.generateFactoryModel
            const device = Device.make({ factoryModel })
            yield* deviceRepository.save(device)

            const compartments = yield* Compartment.makeRange(device.id, size)
            yield* compartmentRepository.save(compartments)

            return { id: device.id, factoryModel }
          }),
          { concurrency: 1 }
        ).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
