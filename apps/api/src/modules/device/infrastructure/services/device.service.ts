import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import { Effect, Layer } from 'effect'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { DeviceService } from '@/modules/device/application/ports/device.service'

export const DeviceServiceLayer = Layer.effect(
  DeviceService,
  Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      find: Effect.fn(function* find(id) {
        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        return device
      }),
    }
  })
)
