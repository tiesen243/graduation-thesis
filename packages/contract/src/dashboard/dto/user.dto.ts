import * as Schema from 'effect/Schema'

import { LowStockCompartmentSchema } from '@/dashboard/schemas/low-stock-compartment.schema'
import { NotificationSchema } from '@/dashboard/schemas/notification.schema'
import { ScheduleStatusCountSchema } from '@/dashboard/schemas/schedule-status-count.schema.ts'
import { UserDeviceSchema } from '@/dashboard/schemas/user-device.schema'
import { ApiResponse } from '@/schema'

export class UserDto extends Schema.TaggedClass<UserDto>()(
  'dashboard/application/UserDto',
  ApiResponse({
    message: 'User dashboard data',

    dataSchema: Schema.Struct({
      metrics: Schema.Struct({
        totalDevices: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
        todaySchedules: ScheduleStatusCountSchema,
        lowStockCount: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
      }),
      devices: Schema.Array(UserDeviceSchema),
      recentNotifications: Schema.Array(NotificationSchema),
      lowStockCompartments: Schema.Array(LowStockCompartmentSchema),
    }),
  })
) {}

export namespace UserDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = UserDto.fields.data
  export type Output = typeof Output.Type
}
