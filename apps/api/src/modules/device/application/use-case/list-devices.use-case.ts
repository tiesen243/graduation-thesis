import type { ListDevicesDto } from '@rozumari/contract/device/dto/list-devices.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { Device } from '@/modules/device/domain/entities/device.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'

export class ListDevicesUseCase extends Context.Service<
  ListDevicesUseCase,
  {
    readonly execute: (
      input: ListDevicesDto.Input & { userId?: UserId }
    ) => Effect.Effect<ListDevicesDto.Output>
  }
>()('device/application/ListDevicesUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { query, userId, page = 1, limit = 10 } = input
        const offset = (page - 1) * limit

        let where: NonNullable<
          Parameters<IBaseRepository<Device>['findMany']>[0]
        >['where']
        if (query)
          where = {
            OR: {
              factoryModel: { like: `%${query}%`, mode: 'insensitive' },
              name: { like: `%${query}%`, mode: 'insensitive' },
            },
          }
        if (userId) where = { ...where, userId: { eq: userId } }

        const [devices, total] = yield* Effect.all(
          [
            deviceRepository.findMany({ where, limit, offset }),
            deviceRepository.count(where),
          ],
          { concurrency: 'unbounded' }
        )
        const totalPages = Math.ceil(total / limit)

        return {
          devices,
          meta: { page, pageSize: limit, total, totalPages },
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
