import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'

import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'

export class ShowDeviceUseCase extends Context.Service<
  ShowDeviceUseCase,
  {
    readonly execute: (
      input: ShowDeviceDto.Input
    ) => Effect.Effect<ShowDeviceDto.Output, DeviceNotFound>
  }
>()('device/application/ShowDeviceUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { id } = input

        const agg = yield* deviceRepository.findWithCompartment(id)
        if (!agg)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        const { device, compartments } = agg
        return { ...device, compartments }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
