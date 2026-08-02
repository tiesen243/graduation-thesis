import * as Schema from 'effect/Schema'

import { RefreshToken, Tokens } from '@/modules/auth/application/types'

export namespace RefreshTokenDto {
  export const Input = Schema.Struct({
    token: RefreshToken,
  })
  export type Input = typeof Input.Type

  export const Output = Tokens
  export type Output = typeof Output.Type
}
