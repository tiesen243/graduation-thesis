import * as Schema from 'effect/Schema'

import { ScheduleStatusCountSchema } from '@/dashboard/schemas/schedule-status-count.schema.ts'
import { NotificationSchema } from '@/notification/schemas/notification.schema'
import { ApiResponse } from '@/schema'

export class AdminDto extends Schema.TaggedClass<AdminDto>()(
  'dashboard/application/AdminDto',
  ApiResponse({
    message: 'Admin dashboard data',

    dataSchema: Schema.Struct({
      metrics: Schema.Struct({
        totalUsers: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
        totalDevices: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
        linkedDevices: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
        schedules: ScheduleStatusCountSchema,
      }),
      recentAlerts: Schema.Array(NotificationSchema),
    }),
  })
) {}

export namespace AdminDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = AdminDto.fields.data
  export type Output = typeof Output.Type
}
