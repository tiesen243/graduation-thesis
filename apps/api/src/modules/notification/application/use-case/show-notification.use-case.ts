import type { ShowNotificationDto } from '@rozumari/contract/notification/dto/show-notification.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { NotificationNotFound } from '@rozumari/contract/notification/schemas/notification.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { NotificationRepository } from '@/modules/notification/application/ports/notification.repository'

export class ShowNotificationUseCase extends Context.Service<
  ShowNotificationUseCase,
  {
    readonly execute: (
      input: ShowNotificationDto.Input
    ) => Effect.Effect<
      ShowNotificationDto.Output,
      NotificationNotFound,
      CurrentUser
    >
  }
>()('notification/application/ShowNotificationUseCase', {
  make: Effect.gen(function* make() {
    const notificationRepository = yield* NotificationRepository

    return {
      execute: Effect.fn(function* execute(input) {
        const { userId } = yield* CurrentUser

        const { id } = input

        const [notification] = yield* notificationRepository.findMany({
          where: {
            id: { eq: id },
            userId: { eq: userId },
          },
          limit: 1,
        })
        if (!notification)
          return yield* Effect.fail(new NotificationNotFound({ error: { id } }))

        return notification
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
