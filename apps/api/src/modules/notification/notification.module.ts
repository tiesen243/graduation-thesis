import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { DeviceService } from '@/modules/device/application/ports/device.service'
import type { StreamService } from '@/shared/application/services/stream.service'

import { CreateNotificationUseCase } from '@/modules/notification/application/use-case/create-notification.use-case'
import { ListNotificationsUseCase } from '@/modules/notification/application/use-case/list-notifications.use-case'
import { ShowNotificationUseCase } from '@/modules/notification/application/use-case/show-notification.use-case'
import { NotificationInfrastructureModule } from '@/modules/notification/infrastructure/infrastructure.module'
import { notificationIoTController } from '@/modules/notification/presentation/http/notification-iot.controller'
import { notificationController } from '@/modules/notification/presentation/http/notification.controller'

export class NotificationModule {
  public static create(
    config: Pick<AppModule.Config, 'persistence'>,
    imports: Layer.Layer<DeviceService, never, StreamService>
  ) {
    const infrastructureLayer = NotificationInfrastructureModule.create(
      config.persistence
    ).pipe(Layer.merge(imports))

    const useCaseLayer = Layer.mergeAll(
      ListNotificationsUseCase.layer,
      ShowNotificationUseCase.layer,
      CreateNotificationUseCase.layer
    )

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      controller: Layer.merge(
        notificationController,
        notificationIoTController
      ).pipe(Layer.provide(layer)),
    }
  }
}
