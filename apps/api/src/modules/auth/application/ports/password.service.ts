import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

export class PasswordService extends Context.Service<
  PasswordService,
  {
    readonly hash: (password: string) => Effect.Effect<string>
    readonly verify: (
      password: string,
      hashedPassword: string
    ) => Effect.Effect<boolean>
  }
>()('auth/application/Password') {}

export namespace PasswordService {
  export interface Config {
    secret?: string
    dkLen?: number
    N?: number
    r?: number
    p?: number
    maxmem?: number
  }
}
