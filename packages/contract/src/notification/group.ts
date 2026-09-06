import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AuthMiddleware } from '@/auth/middleware'
import { CountUnreadNotificationsDto } from '@/notification/dto/count-unread-notifications.dto'
import { ListNotificationsDto } from '@/notification/dto/list-notifications.dto'
import { ShowNotificationDto } from '@/notification/dto/show-notification.dto'
import { NotificationNotFound } from '@/notification/schemas/notification.error'

export class NotificationGroup extends HttpApiGroup.make('notification')
  .add(
    HttpApiEndpoint.get('list', '/', {
      query: ListNotificationsDto.Input,
      success: ListNotificationsDto,
    })
  )

  .add(
    HttpApiEndpoint.get('show', '/:id', {
      params: ShowNotificationDto.Input,
      success: ShowNotificationDto,
      error: [NotificationNotFound],
    })
  )

  .add(
    HttpApiEndpoint.get('unread', '/unread', {
      success: CountUnreadNotificationsDto,
    })
  )

  .middleware(AuthMiddleware)

  .prefix('/api/notifications') {}
