import type { ListDevicesDto } from '@rozumari/contract/device/dto/list-devices.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
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
      input: ListDevicesDto.Input
    ) => Effect.Effect<ListDevicesDto.Output, never, CurrentUser>
  }
>()('device/application/ListDevicesUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId, userRole } = yield* CurrentUser
        const { query, page = 1, limit = 10 } = input
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
        if (userRole === 'user')
          where = {
            ...where,
            userId: { eq: userId },
            status: { eq: 'linked' },
          }

        const [devices, total] = yield* Effect.all(
          [
            deviceRepository.findMany({
              where,
              limit,
              offset,
              orderBy: { factoryModel: 'desc' },
            }),
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
