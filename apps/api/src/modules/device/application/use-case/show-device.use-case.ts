import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'

import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'

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

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })

        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        return device
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
