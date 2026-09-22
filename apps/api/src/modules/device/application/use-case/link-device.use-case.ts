import type { LinkDeviceDto } from '@rozumari/contract/device/dto/link-device.dto'
import type { DeviceAlreadyLinked } from '@rozumari/contract/device/schemas/device.error'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'

export class LinkDeviceUseCase extends Context.Service<
  LinkDeviceUseCase,
  {
    readonly execute: (
      input: LinkDeviceDto.Input
    ) => Effect.Effect<
      LinkDeviceDto.Output,
      DeviceNotFound | DeviceAlreadyLinked,
      CurrentUser
    >
  }
>()('device/application/LinkDeviceUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser
        const { id } = input

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        const linkedDevice = yield* device.link(userId)
        yield* deviceRepository.save(linkedDevice)

        return {
          id: linkedDevice.id,
          factoryModel: linkedDevice.factoryModel,
          status: linkedDevice.status,
          name: linkedDevice.name,
          userId: linkedDevice.userId,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
