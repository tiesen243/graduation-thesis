import * as Schema from 'effect/Schema'

import { CompartmentSchema } from '@/device/schemas/compartment.schema'
import { DeviceSchema } from '@/device/schemas/device.schema'
import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'

export const ScheduleAggregateSchema = Schema.Struct({
  id: ScheduleSchema.fields.id,
  date: ScheduleSchema.fields.date,
  time: ScheduleSchema.fields.time,
  status: ScheduleSchema.fields.status,
  device: Schema.Struct({
    id: DeviceSchema.fields.id,
    name: DeviceSchema.fields.name,
    position: DeviceSchema.fields.position,
  }),
  items: Schema.Array(
    Schema.Struct({
      slot: ScheduleItemSchema.fields.slot,
      medicine: CompartmentSchema.fields.medicine,
      dosage: CompartmentSchema.fields.dosage,
      quantity: ScheduleItemSchema.fields.quantity,
    })
  ),
})
export type ScheduleAggregateSchema = typeof ScheduleAggregateSchema.Type
