import * as Schema from 'effect/Schema'

export namespace HealthDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = Schema.Struct({
    status: Schema.String,
    uptime: Schema.Number,
    environment: Schema.String,
    memory: Schema.Struct({
      used: Schema.Number,
      total: Schema.Number,
      unit: Schema.String,
    }),
    cpu: Schema.Struct({
      user: Schema.Number,
      system: Schema.Number,
    }),
  })
  export type Output = typeof Output.Type
}
