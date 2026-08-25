import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'

export const ScheduleAggregateSchema = Schema.Struct({
  id: ScheduleSchema.fields.id,
  deviceId: ScheduleSchema.fields.deviceId,
  date: ScheduleSchema.fields.date,
  time: ScheduleSchema.fields.time,
  status: ScheduleSchema.fields.status,
  items: Schema.Array(
    Schema.Struct({
      slot: ScheduleItemSchema.fields.slot,
      quantity: ScheduleItemSchema.fields.quantity,
    })
  ),
})
export type ScheduleAggregate = typeof ScheduleAggregateSchema.Type
