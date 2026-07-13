import type { ManagedRuntime } from 'effect/ManagedRuntime'
import type { YieldWrap } from 'effect/Utils'

import * as Effect from 'effect/Effect'

import { Http } from '@/shared/http'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const createUseCase =
  <TInput, TOutput>(
    useCase: (
      input: TInput
    ) => (_: Effect.Adapter) => Generator<YieldWrap<unknown>, TOutput, never>
  ) =>
  (input: TInput) =>
    Effect.gen(useCase(input) as never) as Effect.Effect<TOutput, Http, never>

export const runTransaction = <A, E, R>(
  transactionGen: (_: Effect.Adapter) => Generator<YieldWrap<unknown>, A, never>
): Effect.Effect<A, E, R> =>
  Effect.gen(function* runTransactionGen() {
    const context = yield* Effect.context<R>()
    const { maybeDrizzle } = yield* Effect.all({
      maybeDrizzle: Effect.serviceOption(DrizzleClient),
      // maybePrisma: Effect.serviceOption(PrismaClient),
    })

    const program = Effect.gen(transactionGen as never).pipe(
      Effect.provide(context)
    )

    // oxlint-disable-next-line no-underscore-dangle
    if (maybeDrizzle._tag === 'Some')
      return yield* maybeDrizzle.value((client) =>
        client.transaction((tx) =>
          Effect.runPromise(
            program.pipe(
              // oxlint-disable-next-line unicorn/max-nested-calls
              Effect.provideService(DrizzleClient, DrizzleClient.make(tx))
            )
          )
        )
      ) as unknown as Effect.Effect<A, E, R>

    return yield* program as Effect.Effect<A, E, R>
  })

export const runEffect = <A, R>(
  // oxlint-disable-next-line typescript/no-explicit-any
  runtime: ManagedRuntime<R, any>,
  effect: Effect.Effect<A, Http, R>
) =>
  runtime.runPromise(
    effect.pipe(
      Effect.map((data) => new Http({ data })),
      Effect.catchTag('shared/Http', Effect.succeed),
      Effect.map((http) => http.toResponse())
    )
  )
