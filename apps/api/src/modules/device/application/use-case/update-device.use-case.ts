import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'
import type { UpdateDeviceDto } from '@rozumari/contract/device/dto/update-device.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'

export class UpdateDeviceUseCase extends Context.Service<
  UpdateDeviceUseCase,
  {
    readonly execute: (
      input: ShowDeviceDto.Input & UpdateDeviceDto.Input
    ) => Effect.Effect<
      UpdateDeviceDto.Output,
      DeviceNotFound | Forbidden,
      CurrentUser
    >
  }
>()('device/application/UpdateDeviceUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute({ id, ...input }) {
        const { userId, userRole } = yield* CurrentUser

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        if (userRole !== 'admin' && device.userId !== userId)
          return yield* Effect.fail(
            new Forbidden({
              message: 'You do not have permission to update this device',
            })
          )

        const updatedDevice = device.update({
          name: input.name ?? device.name,
          position: input.position ?? device.position,
        })
        yield* deviceRepository.save(updatedDevice)

        return {
          id: updatedDevice.id,
          name: updatedDevice.name,
          position: updatedDevice.position,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
