import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { Schedule, ScheduleItem } from '@/modules/schedule/domain/entities/schedule.entity'
import type { IRepository } from '@/shared/repository'

export interface ScheduleWithItems {
  schedule: Schedule
  items: ScheduleItem[]
}

export interface ScheduleRepositoryShape {
  readonly findMany: IRepository<Schedule>['findMany']
  readonly count: IRepository<Schedule>['count']
  readonly findWithItems: (
    scheduleId: ScheduleId
  ) => Effect.Effect<ScheduleWithItems | null>
  readonly findByDevice: (
    deviceId: DeviceId
  ) => Effect.Effect<ScheduleWithItems[]>
  readonly saveWithItems: (
    schedule: Schedule,
    items: ScheduleItem[]
  ) => Effect.Effect<void>
  readonly findTodayByDevice: (
    deviceId: DeviceId
  ) => Effect.Effect<ScheduleWithItems[]>
  readonly deleteWithItems: (scheduleId: ScheduleId) => Effect.Effect<void>
}

export class ScheduleRepository extends Context.Service<
  ScheduleRepository,
  ScheduleRepositoryShape
>()('schedule/domain/ScheduleRepository') {}
