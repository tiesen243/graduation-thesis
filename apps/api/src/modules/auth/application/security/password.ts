import type * as Effect from 'effect/Effect'
import type { Redacted } from 'effect/Redacted'

import * as Context from 'effect/Context'
import * as Schema from 'effect/Schema'

import { ApiResponseSchema } from '@/shared/schema'

export class PasswordError extends Schema.TaggedErrorClass<PasswordError>()(
  'PasswordError',
  ApiResponseSchema(),
  { httpApiStatus: 401 }
) {}

// oxlint-disable-next-line eslint/max-classes-per-file
export class Password extends Context.Service<
  Password,
  {
    readonly hash: (password: string) => Effect.Effect<string, PasswordError>
    readonly verify: (
      password: string,
      hashedPassword: string
    ) => Effect.Effect<boolean, PasswordError>
  }
>()('auth/application/Password') {}

export namespace Password {
  export interface Config {
    secret?: Redacted<string>
    dkLen?: number
    N?: number
    r?: number
    p?: number
    maxmem?: number
  }
}
