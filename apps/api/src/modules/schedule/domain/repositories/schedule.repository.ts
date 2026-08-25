import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

import type { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import type { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import type { IRepository } from '@/shared/repository'

interface IScheduleRepository extends IRepository<Schedule> {
  readonly findWithItems: (
    scheduleId: ScheduleId
  ) => Effect<ScheduleRepository.WithItems | null>

  readonly findManyWithItems: (options: {
    userId: UserId
    deviceId?: DeviceId
    limit: number
    offset: number
  }) => Effect<ScheduleRepository.WithItems[]>

  readonly findByDevice: (
    deviceId: DeviceId
  ) => Effect<ScheduleRepository.WithItems[]>

  readonly saveWithItems: (
    schedule: Schedule,
    items: ScheduleItem[]
  ) => Effect<void>

  readonly findTodayByDevice: (
    deviceId: DeviceId
  ) => Effect<ScheduleRepository.WithItems[]>

  readonly deleteWithItems: (scheduleId: ScheduleId) => Effect<void>
}

export class ScheduleRepository extends Context.Service<
  ScheduleRepository,
  IScheduleRepository
>()('schedule/domain/ScheduleRepository') {}

export namespace ScheduleRepository {
  export interface WithItems {
    schedule: Schedule
    items: ScheduleItem[]
  }
}
