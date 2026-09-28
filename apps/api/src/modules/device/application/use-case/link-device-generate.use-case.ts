import type { LinkDeviceGenerateDto } from '@rozumari/contract/device/dto/link-device-generate.dto'

import { CurrentDevice } from '@rozumari/contract/device/middleware'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { Jwt } from '@/shared/application/services/jwt.service'

export class LinkDeviceGenerateUseCase extends Context.Service<
  LinkDeviceGenerateUseCase,
  {
    readonly execute: (
      input: LinkDeviceGenerateDto.Input
    ) => Effect.Effect<
      LinkDeviceGenerateDto.Output,
      DeviceNotFound,
      CurrentDevice
    >
  }
>()('device/application/LinkDeviceGenerateUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository
    const jwtService = yield* Jwt

    return {
      execute: Effect.fn(function* execute() {
        const id = yield* CurrentDevice

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        const token = yield* jwtService.sign(
          { deviceId: device.id, status: device.status },
          { expiresIn: 60 }
        )

        return token
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
