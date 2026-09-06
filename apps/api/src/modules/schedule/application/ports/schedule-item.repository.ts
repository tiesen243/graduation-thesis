import * as Context from 'effect/Context'

import type { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface IScheduleItemRepository extends IBaseRepository<ScheduleItem> {}

export class ScheduleItemRepository extends Context.Service<
  ScheduleItemRepository,
  IScheduleItemRepository
>()('schedule/application/ScheduleItemRepository') {}
