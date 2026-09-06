import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { DeviceMiddleware } from '@/device/middleware'
import { DeviceNotFound, DeviceNotLinked } from '@/device/schemas/device.error'
import { CreateNotificationDto } from '@/notification/dto/create-notification.dto'

export class NotificationIoTGroup extends HttpApiGroup.make('notification-iot')

  .add(
    HttpApiEndpoint.post('send', '/send', {
      payload: CreateNotificationDto.Input,
      success: CreateNotificationDto,
      error: [DeviceNotFound, DeviceNotLinked],
    })
  )

  .middleware(DeviceMiddleware)

  .prefix('/api/notifications') {}
