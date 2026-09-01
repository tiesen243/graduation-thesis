import * as Schema from 'effect/Schema'

import { NotificationId } from '@/notification/schemas/notification.schema'
import { ApiResponse } from '@/schema'

export class NotificationNotFound extends Schema.TaggedError<NotificationNotFound>()(
  'notification/domain/NotificationNotFound',
  ApiResponse({
    status: 404,
    message: 'Notification not found',
    errorSchema: Schema.Struct({ id: NotificationId }),
  }),
  { httpApiStatus: 404 }
) {}

export class NotificationError extends Schema.TaggedError<NotificationError>()(
  'notification/domain/NotificationError',
  {
    reason: Schema.Union([NotificationNotFound]),
  }
) {}
