import type { AddDeviceDto } from '@rozumari/contract/device/dto/add-device.dto'
import type { DeviceAlreadyExists } from '@rozumari/contract/device/schemas/device.error'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import { Device } from '@/modules/device/domain/entities/device.entity'
import { CompartmentRepository } from '@/modules/device/domain/repositories/compartment.repository'
import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'
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
    const deviceRepository = yield* DeviceRepository
    const compartmentRepository = yield* CompartmentRepository

    return {
      execute: Effect.fn(function* execute(_input) {
        const factoryModel = yield* Device.generateFactoryModel

        return yield* Effect.gen(function* tx() {
          const device = Device.make({ factoryModel })
          yield* deviceRepository.save(device)

          const compartments = Array.from({ length: 4 }, (_, index) => {
            const row = Math.floor(index / 2)
            const column = index % 2
            return Compartment.make({
              deviceId: device.id,
              position: `${row}-${column}`,
            })
          })
          yield* compartmentRepository.save(compartments)

          return { id: device.id }
        }).pipe(withTransaction)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
