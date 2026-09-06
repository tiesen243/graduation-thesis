import * as Schema from 'effect/Schema'
import * as SchemaTransformation from 'effect/SchemaTransformation'

import { ApiResponse } from '@/schema'

export class LogoutDto extends Schema.TaggedClass<LogoutDto>()(
  'auth/application/LogoutDto',
  ApiResponse({
    message: 'Logout successfully',
  })
) {}

export namespace LogoutDto {
  export const Input = Schema.Struct({
    authorization: Schema.optional(
      Schema.String.check(
        Schema.isPattern(/^Bearer\s.+$/iu, {
          message: 'Invalid authorization format',
        })
      ).pipe(
        Schema.decodeTo(
          Schema.String,
          SchemaTransformation.transform({
            decode: (value) => value.replace(/^Bearer\s/iu, ''),
            encode: (value) => `Bearer ${value}`,
          })
        )
      )
    ),
  })
  export type Input = typeof Input.Type

  export const Output = LogoutDto.fields.data
  export type Output = typeof Output.Type
}
