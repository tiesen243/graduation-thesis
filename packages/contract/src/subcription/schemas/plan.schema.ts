import * as Schema from 'effect/Schema'

import { Cuid2, Timestampz } from '@/schema'

export const PlanId = Cuid2.pipe(Schema.brand('subcription/domain/PlanId'))
export type PlanId = typeof PlanId.Type

export const PlanSchema = Schema.Struct({
  id: PlanId,

  name: Schema.String,

  price: Schema.NumberFromString,

  duration: Schema.Number,

  createdAt: Timestampz.fields.createdAt,
})
export type PlanSchema = typeof PlanSchema.Type
