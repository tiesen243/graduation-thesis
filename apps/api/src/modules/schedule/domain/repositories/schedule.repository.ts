import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleAggregate } from '@rozumari/contract/schedule/schemas/schedule.aggregate'
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
  ) => Effect<ScheduleAggregate | null>

  readonly findManyWithItems: (options: {
    userId: UserId
    deviceId?: DeviceId
    limit: number
    offset: number
  }) => Effect<ScheduleAggregate[]>

  readonly findByDevice: (deviceId: DeviceId) => Effect<ScheduleAggregate[]>

  readonly saveWithItems: (
    schedule: Schedule,
    items: ScheduleItem[]
  ) => Effect<void>

  readonly findTodayByDevice: (
    deviceId: DeviceId
  ) => Effect<ScheduleAggregate[]>

  readonly deleteWithItems: (scheduleId: ScheduleId) => Effect<void>
}

export class ScheduleRepository extends Context.Service<
  ScheduleRepository,
  IScheduleRepository
>()('schedule/domain/ScheduleRepository') {}
