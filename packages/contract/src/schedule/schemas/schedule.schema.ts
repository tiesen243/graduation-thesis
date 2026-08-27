import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { Cuid2 } from '@/schema'
import { UserId } from '@/user/schemas/user.schema'

export const ScheduleId = Cuid2.pipe(Schema.brand('schedule/domain/ScheduleId'))
export type ScheduleId = typeof ScheduleId.Type

export const scheduleStatuses = ['pending', 'completed', 'failed'] as const
export const ScheduleStatus = Schema.Literals(scheduleStatuses).pipe(
  Schema.brand('schedule/domain/ScheduleStatus')
)
export type ScheduleStatus = typeof ScheduleStatus.Type

export const ScheduleSchema = Schema.Struct({
  id: ScheduleId,
  userId: UserId,
  deviceId: DeviceId,

  date: Schema.String.check(
    Schema.isPattern(
      /^\d{4}-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12][0-9]|3[01])$/u,
      { message: 'Date must be in yyyy-MM-dd format' }
    )
  ),

  time: Schema.String.check(
    Schema.isPattern(
      /^(?<hour>[01][0-9]|2[0-3]):(?<minute>[0-5][0-9])(?::(?<second>[0-5][0-9]))$/u,
      { message: 'Time must be in HH:mm or HH:mm:ss format' }
    )
  ),

  status: ScheduleStatus.pipe(
    Schema.withConstructorDefault(Effect.succeed('pending'))
  ),
})
export type ScheduleSchema = typeof ScheduleSchema.Type
