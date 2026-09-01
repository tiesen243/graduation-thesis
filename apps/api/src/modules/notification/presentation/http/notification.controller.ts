import { Api } from '@rozumari/contract'
import { ListNotificationDto } from '@rozumari/contract/notification/dto/list-notification.dto'
import { ShowNotificationDto } from '@rozumari/contract/notification/dto/show-notification.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ListNotificationUseCase } from '@/modules/notification/application/use-case/list-notification.use-case'
import { ShowNotificationUseCase } from '@/modules/notification/application/use-case/show-notification.use-case'

export const notificationController = HttpApiBuilder.group(
  Api,
  'notification',
  (handlers) =>
    handlers
      .handle('list', ({ query }) =>
        ListNotificationUseCase.use((s) => s.execute(query)).pipe(
          Effect.map((data) => ListNotificationDto.make({ data }))
        )
      )

      .handle('show', ({ params }) =>
        ShowNotificationUseCase.use((s) => s.execute(params)).pipe(
          Effect.map((data) => ShowNotificationDto.make({ data }))
        )
      )
)
