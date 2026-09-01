import type { LinkDeviceDto } from '@rozumari/contract/device/dto/link-device.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import {
  DeviceAlreadyLinked,
  DeviceNotFound,
} from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { Device } from '@/modules/device/domain/entities/device.entity'

export class LinkDeviceUseCase extends Context.Service<
  LinkDeviceUseCase,
  {
    readonly execute: (
      input: LinkDeviceDto.Input & { userId: UserId }
    ) => Effect.Effect<
      LinkDeviceDto.Output,
      DeviceNotFound | DeviceAlreadyLinked
    >
  }
>()('device/application/LinkDeviceUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { id, userId } = input

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        if (device.status !== 'unlinked')
          return yield* Effect.fail(
            new DeviceAlreadyLinked({ error: { id: device.id } })
          )

        const linkedDevice = Device.make({
          ...device,
          status: 'linked' as Device['status'],
          activatedAt: device.activatedAt ?? new Date(),
          userId,
        })
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
