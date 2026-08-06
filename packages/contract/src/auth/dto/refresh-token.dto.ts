import * as Schema from 'effect/Schema'
import * as SchemaTransformation from 'effect/SchemaTransformation'

import { Token } from '@/auth/schemas/token.schema'
import { ApiResponse } from '@/schema'

export class RefreshTokenDto extends Schema.TaggedClass<RefreshTokenDto>()(
  'auth/application/RefreshTokenDto',
  ApiResponse({
    message: 'Refresh token successfully',
    dataSchema: Token,
  })
) {}

export namespace RefreshTokenDto {
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

  export const Output = RefreshTokenDto.fields.data
  export type Output = typeof Output.Type
}
