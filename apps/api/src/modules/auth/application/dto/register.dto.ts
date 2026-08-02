import * as Schema from 'effect/Schema'

import { EmailSchema, PasswordSchema } from '@/shared/schema'

export namespace RegisterDto {
  export const Input = Schema.Struct({
    username: Schema.String.check(
      Schema.isMinLength(4),
      Schema.isMaxLength(20)
    ),
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  }).check(
    Schema.makeFilter((data) =>
      data.password === data.confirmPassword
        ? undefined
        : {
            path: ['confirmPassword'],
            issue: 'Passwords do not match',
          }
    )
  )
  export type Input = typeof Input.Type

  export const Output = Schema.Void
  export type Output = typeof Output.Type
}
