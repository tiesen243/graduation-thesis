import type { UnlinkDeviceDto } from '@rozumari/contract/device/dto/unlink-device.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'

import { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'
import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { withTransaction } from '@/shared/utils'

export class UnlinkDeviceUseCase extends Context.Service<
  UnlinkDeviceUseCase,
  {
    readonly execute: (
      input: UnlinkDeviceDto.Input
    ) => Effect.Effect<
      UnlinkDeviceDto.Output,
      DeviceNotFound | Forbidden,
      CurrentUser
    >
  }
>()('device/application/UnlinkDeviceUseCase', {
  make: Effect.gen(function* make() {
    const compartmentRepository = yield* CompartmentRepository
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId, userRole } = yield* CurrentUser
        const { id } = input

        const [device] = yield* deviceRepository.findMany({
          where: { id: { eq: id } },
          limit: 1,
        })
        if (!device)
          return yield* Effect.fail(new DeviceNotFound({ error: { id } }))

        if (device.userId !== userId && userRole !== 'admin')
          return yield* Effect.fail(
            new Forbidden({
              message: 'You are not allowed to unlink this device',
            })
          )

        const compartments = yield* compartmentRepository.findMany({
          where: { deviceId: { eq: id } },
        })

        const unlinkedDevice = yield* device.unlink()
        const unlinkedCompartments: Compartment[] = []
        for (const compartment of compartments) {
          const unlinkedCompartment = compartment.unlink()
          unlinkedCompartments.push(unlinkedCompartment)
        }

        yield* Effect.gen(function* executeTx() {
          yield* deviceRepository.save(unlinkedDevice)
          yield* compartmentRepository.save(unlinkedCompartments)
        }).pipe(withTransaction)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
