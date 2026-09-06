import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class HealthDto extends Schema.TaggedClass<HealthDto>()(
  'home/application/HealthDto',
  ApiResponse({
    message: 'Health check successfully',
    dataSchema: Schema.Struct({
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
    }),
  })
) {}

export namespace HealthDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = HealthDto.fields.data
  export type Output = typeof Output.Type
}
