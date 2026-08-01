import * as Schema from 'effect/Schema'

import { Tokens } from '@/modules/auth/application/types'
import { EmailSchema, PasswordSchema } from '@/shared/schema'

export namespace LoginDto {
  export const Input = Schema.Struct({
    email: EmailSchema,
    password: PasswordSchema,
  })
  export type Input = typeof Input.Type

  export const Output = Tokens
  export type Output = typeof Output.Type
}
