import type { CountUnreadNotificationsDto } from '@rozumari/contract/notification/dto/count-unread-notifications.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { NotificationRepository } from '@/modules/notification/application/ports/notification.repository'

export class CountUnreadNotificationsUseCase extends Context.Service<
  CountUnreadNotificationsUseCase,
  {
    readonly execute: (
      input: CountUnreadNotificationsDto.Input
    ) => Effect.Effect<CountUnreadNotificationsDto.Output, never, CurrentUser>
  }
>()('notification/application/CountUnreadNotificationsUseCase', {
  make: Effect.gen(function* make() {
    const notificationRepository = yield* NotificationRepository

    return {
      execute: Effect.fn(function* execute() {
        const { userId, userRole } = yield* CurrentUser

        const count = yield* notificationRepository.count({
          ...(userRole === 'admin' ? {} : { userId: { eq: userId } }),
          readAt: { isNull: true },
        })

        return { count }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
