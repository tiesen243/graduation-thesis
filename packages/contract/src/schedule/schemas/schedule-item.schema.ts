import * as Schema from 'effect/Schema'

import { ScheduleId } from '@/schedule/schemas/schedule.schema'

export const ScheduleItemSchema = Schema.Struct({
  scheduleId: ScheduleId,
  slot: Schema.String.check(
    Schema.isPattern(/^[0-9]-[0-1]$/u, {
      message: 'Slot must be in row-column format (e.g. 0-0, 3-1)',
    })
  ),
  quantity: Schema.Number.check(
    Schema.isGreaterThanOrEqualTo(1, {
      message: 'Quantity must be greater than or equal to 1',
    })
  ),
})
export type ScheduleItemSchema = typeof ScheduleItemSchema.Type
