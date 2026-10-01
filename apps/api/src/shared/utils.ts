import * as Crypto from 'effect/Crypto'
import * as Effect from 'effect/Effect'
import * as Hex from 'effect/encoding/Hex'

import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const withTransaction = <A, E, R>(
  effect:
    | Effect.Effect<A, E, R>
    | ((rollback: () => Effect.Effect<void, unknown>) => Effect.Effect<A, E, R>)
) =>
  Effect.gen(function* transaction() {
    const { maybeDrizzle } = yield* Effect.all(
      {
        maybeDrizzle: Effect.option(DrizzleClient),
        // maybePrisma: Effect.option(PrismaClient),
      },
      { concurrency: 'unbounded' }
    )

    let effectToRun =
      typeof effect === 'function'
        ? effect(() => Effect.log('Transaction rolled back'))
        : effect

    // oxlint-disable-next-line eslint/no-underscore-dangle
    if (maybeDrizzle._tag === 'Some')
      effectToRun = maybeDrizzle.value.db
        .transaction((tx) =>
          (typeof effect === 'function' ? effect(tx.rollback) : effect).pipe(
            Effect.provideService(DrizzleClient, {
              ...maybeDrizzle.value,
              db: tx,
            })
          )
        )
        .pipe(Effect.orDie)

    return yield* effectToRun
  }) as Effect.Effect<A, E, Exclude<R, DrizzleClient>>

export const toDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getGravatarUrl = Effect.fn(function* getGravatarUrl(
  email: string
) {
  const crypto = yield* Crypto.Crypto

  const cleanedEmail = email.trim().toLowerCase()
  const encodedEmail = new TextEncoder().encode(cleanedEmail)

  const hash = yield* crypto.digest('SHA-256', encodedEmail).pipe(Effect.orDie)
  const hexHash = Hex.encode(hash)

  return `https://www.gravatar.com/avatar/${hexHash}?s=512&d=identicon`
})
