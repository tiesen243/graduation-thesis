import { Api } from '@rozumari/contract'
import { CreateNotificationDto } from '@rozumari/contract/notification/dto/create-notification.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { CreateNotificationUseCase } from '@/modules/notification/application/use-case/create-notification.use-case'

export const notificationIoTController = HttpApiBuilder.group(
  Api,
  'notification-iot',
  (handlers) =>
    handlers.handle('send', ({ payload }) =>
      CreateNotificationUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map((data) => CreateNotificationDto.make({ data }))
      )
    )
)
