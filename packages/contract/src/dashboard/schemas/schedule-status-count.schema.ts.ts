import * as Schema from 'effect/Schema'

export const ScheduleStatusCountSchema = Schema.Struct({
  completed: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  pending: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  failed: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
})
