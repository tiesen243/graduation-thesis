import * as Context from 'effect/Context'

import type { Notification } from '@/modules/notification/domain/entities/notification.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface INotificationRepository extends IBaseRepository<Notification> {}

export class NotificationRepository extends Context.Service<
  Notification,
  INotificationRepository
>()('notification/domain/NotificationRepository') {}
