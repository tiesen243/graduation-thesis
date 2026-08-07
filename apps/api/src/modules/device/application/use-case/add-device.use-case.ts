import type { AddDeviceDto } from '@rozumari/contract/device/dto/add-device.dto'

import { DeviceAlreadyExists } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Device } from '@/modules/device/domain/entities/device.entity'
import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'

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

    return {
      execute: Effect.fn(function* execute(input) {
        const { factoryModel } = input

        const [existingDevice] = yield* deviceRepository.findMany({
          where: { factoryModel },
          limit: 1,
        })
        if (existingDevice)
          return yield* Effect.fail(
            new DeviceAlreadyExists({ error: { id: null, factoryModel } })
          )

        const device = Device.make({ factoryModel })
        yield* deviceRepository.save(device)

        return { id: device.id }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
