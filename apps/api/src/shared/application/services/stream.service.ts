import type * as Effect from 'effect/Effect'
import type * as PubSub from 'effect/PubSub'
import type * as Stream from 'effect/Stream'

import * as Context from 'effect/Context'

export class StreamService extends Context.Service<
  StreamService,
  {
    readonly register: (id: string) => Effect.Effect<void>
    readonly unregister: (id: string) => Effect.Effect<void>

    readonly publish: (id: string, message: string) => Effect.Effect<boolean>
    readonly subscribe: (id: string) => Stream.Stream<string>
  }
>()('shared/application/services/StreamService') {}

export namespace StreamService {
  export interface Connection {
    readonly id: string
    readonly pubsub: PubSub.PubSub<string>
    readonly count: number
  }
}
