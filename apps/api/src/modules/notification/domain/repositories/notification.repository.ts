import * as Context from 'effect/Context'

import type { Notification } from '@/modules/notification/domain/entities/notification.entity'
import type { IRepository } from '@/shared/repository'

interface INotificationRepository extends IRepository<Notification> {}

export class NotificationRepository extends Context.Service<
  Notification,
  INotificationRepository
>()('notification/domain/NotificationRepository') {}
