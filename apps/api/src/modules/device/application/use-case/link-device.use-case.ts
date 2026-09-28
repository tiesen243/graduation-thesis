import type { LinkDeviceDto } from '@rozumari/contract/device/dto/link-device.dto'
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import {
  DeviceAlreadyLinked,
  DeviceNotFound,
} from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { Jwt } from '@/shared/application/services/jwt.service'

export class LinkDeviceUseCase extends Context.Service<
  LinkDeviceUseCase,
  {
    readonly execute: (
      input: LinkDeviceDto.Input
    ) => Effect.Effect<
      LinkDeviceDto.Output,
      DeviceNotFound | DeviceAlreadyLinked | Forbidden,
      CurrentUser
    >
  }
>()('device/application/LinkDeviceUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    const jwtService = yield* Jwt

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser
        const { token } = input

        const payload = yield* jwtService
          .verify(token)
          .pipe(
            Effect.catch(() =>
              Effect.fail(new Forbidden({ message: 'Invalid token' }))
            )
          )
        const { deviceId: id, status } = payload as unknown as {
          deviceId: DeviceId
          status: string
        }
        if (status !== 'unlinked')
          return yield* Effect.fail(new DeviceAlreadyLinked({ error: { id } }))

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        const linkedDevice = yield* device.link(userId)
        yield* deviceRepository.save(linkedDevice)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
