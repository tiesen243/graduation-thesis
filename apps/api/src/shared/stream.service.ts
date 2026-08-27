import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as MutableHashMap from 'effect/MutableHashMap'
import * as PubSub from 'effect/PubSub'
import * as Stream from 'effect/Stream'
import * as SynchronizedRef from 'effect/SynchronizedRef'

export class StreamService extends Context.Service<
  StreamService,
  {
    readonly register: (id: string) => Effect.Effect<void>
    readonly unregister: (id: string) => Effect.Effect<void>

    readonly publish: (id: string, message: string) => Effect.Effect<boolean>
    readonly subscribe: (id: string) => Stream.Stream<string>
  }
>()('shared/StreamService', {
  make: Effect.gen(function* make() {
    const connections = yield* SynchronizedRef.make(
      MutableHashMap.empty<string, StreamService.Connection>()
    )

    const register = (id: string) =>
      SynchronizedRef.updateEffect(
        connections,
        Effect.fn(
          function* registerFn(map) {
            const existingOpt = MutableHashMap.get(map, id)

            if (existingOpt._tag === 'Some') {
              const current = existingOpt.value

              MutableHashMap.set(map, id, {
                ...current,
                count: current.count + 1,
              })

              return map
            }

            const pubsub = yield* PubSub.unbounded<string>()
            MutableHashMap.set(map, id, { id, pubsub, count: 1 })

            return map
          },
          Effect.tap((map) =>
            Effect.logInfo(
              `Registered connection for id: ${id}, total connections: ${MutableHashMap.size(map)}`
            )
          )
        )
      )

    const unregister = (id: string) =>
      SynchronizedRef.update(connections, (map) => {
        const existingOpt = MutableHashMap.get(map, id)
        if (existingOpt._tag === 'None') return map

        const current = existingOpt.value
        if (current.count <= 0) {
          MutableHashMap.remove(map, id)
          return map
        }

        MutableHashMap.set(map, id, {
          ...current,
          count: current.count - 1,
        })

        return map
      }).pipe(
        Effect.tap(() =>
          Effect.logInfo(`Unregistered connection for id: ${id}`)
        )
      )

    const publish = Effect.fn(function* publishFn(id: string, message: string) {
      const map = yield* SynchronizedRef.get(connections)

      const existingOpt = MutableHashMap.get(map, id)
      if (existingOpt._tag === 'None') return false
      return yield* PubSub.publish(existingOpt.value.pubsub, message)
    })

    const subscribe = Effect.fn(function* subscribeFn(id: string) {
      const map = yield* SynchronizedRef.get(connections)
      const existingOpt = MutableHashMap.get(map, id)

      if (existingOpt._tag === 'None') return Stream.empty
      return Stream.fromPubSub(existingOpt.value.pubsub)
    }, Stream.unwrap)

    return {
      register,
      unregister,

      publish,
      subscribe,
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}

export namespace StreamService {
  export interface Connection {
    readonly id: string
    readonly pubsub: PubSub.PubSub<string>
    readonly count: number
  }
}
