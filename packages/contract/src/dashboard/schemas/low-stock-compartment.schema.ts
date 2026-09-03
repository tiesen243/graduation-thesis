import * as Schema from 'effect/Schema'

export const LowStockCompartmentSchema = Schema.Struct({
  medicine: Schema.NullOr(Schema.String),
  capacity: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  position: Schema.NullOr(Schema.String),
  deviceId: Schema.NullOr(Schema.String),
})
