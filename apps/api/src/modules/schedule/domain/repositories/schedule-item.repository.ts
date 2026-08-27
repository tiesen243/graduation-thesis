import * as Context from 'effect/Context'

import type { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import type { IRepository } from '@/shared/repository'

interface IScheduleItemRepository extends IRepository<ScheduleItem> {}

export class ScheduleItemRepository extends Context.Service<
  ScheduleItemRepository,
  IScheduleItemRepository
>()('schedule/domain/ScheduleItemRepository') {}
