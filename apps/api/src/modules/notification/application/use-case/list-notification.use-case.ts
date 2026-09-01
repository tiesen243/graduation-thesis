import type { ListNotificationDto } from '@rozumari/contract/notification/dto/list-notification.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { NotificationRepository } from '@/modules/notification/application/ports/notification.repository'

export class ListNotificationUseCase extends Context.Service<
  ListNotificationUseCase,
  {
    readonly execute: (
      input: ListNotificationDto.Input
    ) => Effect.Effect<ListNotificationDto.Output, never, CurrentUser>
  }
>()('notification/application/ListNotificationUseCase', {
  make: Effect.gen(function* make() {
    const notificationRepository = yield* NotificationRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser

        const { deviceId, page = 1, limit = 10 } = input
        const offset = (page - 1) * limit

        let where: NonNullable<
          Parameters<typeof notificationRepository.findMany>[0]
        >['where'] = { userId: { eq: userId } }
        if (deviceId) where = { ...where, deviceId: { eq: deviceId } }

        const [notifications, total] = yield* Effect.all(
          [
            notificationRepository.findMany({ where, limit, offset }),
            notificationRepository.count(where),
          ],
          { concurrency: 'unbounded' }
        )
        const totalPages = Math.ceil(total / limit)

        return {
          notifications,
          meta: { page, pageSize: limit, total, totalPages },
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
