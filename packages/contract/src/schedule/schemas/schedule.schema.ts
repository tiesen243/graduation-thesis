import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { Cuid2, Timestampz } from '@/schema'
import { UserId } from '@/user/schemas/user.schema'

export const ScheduleId = Cuid2.pipe(Schema.brand('schedule/domain/ScheduleId'))
export type ScheduleId = typeof ScheduleId.Type

export const ScheduleSchema = Schema.Struct({
  id: ScheduleId,
  userId: UserId,
  deviceId: DeviceId,

  startDate: Schema.String.check(
    Schema.isPattern(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/u,
      { message: 'Start date must be in dd/MM/yyyy format' }
    )
  ),

  endDate: Schema.String.check(
    Schema.isPattern(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/u,
      { message: 'End date must be in dd/MM/yyyy format' }
    )
  ),

  daysOfWeek: Schema.Array(
    Schema.Int.check(
      Schema.isGreaterThanOrEqualTo(0, {
        message: 'Day of week must be greater than or equal to 0',
      }),
      Schema.isLessThanOrEqualTo(6, {
        message: 'Day of week must be less than or equal to 6',
      })
    )
  ),

  time: Schema.String.check(
    Schema.isPattern(/^([01][0-9]|2[0-3]):([0-5][0-9])$/u, {
      message: 'Time must be in hh:mm format',
    })
  ),

  ...Timestampz.fields,
})
export type ScheduleSchema = typeof ScheduleSchema.Type
