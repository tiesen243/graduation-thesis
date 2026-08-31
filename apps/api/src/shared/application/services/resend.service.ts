import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

export class ResendService extends Context.Service<
  ResendService,
  {
    readonly sendEmail: (
      options: ResendService.Options
    ) => Effect.Effect<boolean>
  }
>()('shared/application/services/ResendService') {}

export namespace ResendService {
  export interface Options {
    to: string[]
    subject: string
    html: string
  }
}
