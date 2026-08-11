import * as Effect from 'effect/Effect'

import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const withTransaction = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* transaction() {
    const { maybeDrizzle } = yield* Effect.all(
      {
        maybeDrizzle: Effect.option(DrizzleClient),
        // maybePrisma: Effect.option(PrismaClient),
      },
      { concurrency: 'unbounded' }
    )

    let effectToRun = effect

    // oxlint-disable-next-line eslint/no-underscore-dangle
    if (maybeDrizzle._tag === 'Some')
      effectToRun = maybeDrizzle.value.db
        .transaction((tx) =>
          effect.pipe(
            Effect.provideService(DrizzleClient, {
              ...maybeDrizzle.value,
              db: tx,
            })
          )
        )
        .pipe(Effect.orDie)

    return yield* effectToRun
  }) as Effect.Effect<A, E, Exclude<R, DrizzleClient>>
