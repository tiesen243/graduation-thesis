import * as Schema from 'effect/Schema'

import { RefreshToken } from '@/modules/auth/application/types'

export namespace LogoutDto {
  export const Input = Schema.Struct({
    token: RefreshToken,
  })
  export type Input = typeof Input.Type

  export const Output = Schema.Null
  export type Output = typeof Output.Type
}
