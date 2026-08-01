// oxlint-disable unicorn/no-array-for-each

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { User } from '@/modules/user/domain/entities/user.entity'
import type { BaseEntity } from '@/shared/domain/base.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

export type Predicate<T> = (item: T) => boolean
export type Comparator<T> = (a: T, b: T) => number

export class InMemoryClient extends Context.Service<
  InMemoryClient,
  {
    accounts: Ref.Ref<Map<string, Account>>
    users: Ref.Ref<Map<User['id'], User>>
    sessions: Ref.Ref<Map<Session['id'], Session>>

    buildCriteria: <TEntity extends BaseEntity>(
      criterias: IBaseRepository.Criteria<TEntity>[]
    ) => Effect.Effect<Predicate<TEntity> | undefined>

    buildOrderBy: <TEntity extends BaseEntity>(
      orderBy: IBaseRepository.OrderBy<TEntity>
    ) => Effect.Effect<Comparator<TEntity> | undefined>
  }
>()('shared/infrastructure/persistence/in-memory/InMemoryClient', {
  make: Effect.gen(function* InMemoryClientMake() {
    const buildCriteria = Effect.fn(function* buildCriteria<
      TEntity extends BaseEntity,
    >(criterias?: IBaseRepository.Criteria<TEntity>[]) {
      if (!criterias || criterias.length === 0) return

      const orPredicates = yield* Effect.forEach(
        criterias,
        Effect.fn(function* orPredicates(criteria) {
          const andPredicates = yield* Effect.forEach(
            Object.entries(criteria),
            ([key, value]) =>
              Effect.sync(() =>
                parseCondition<TEntity>(key as keyof TEntity, value)
              ),
            { concurrency: 'unbounded' }
          ).pipe(
            Effect.map((items) =>
              items.filter((x): x is Predicate<TEntity> => x !== undefined)
            )
          )

          if (andPredicates.length === 0) return
          if (andPredicates.length === 1) return andPredicates[0]

          return (entity: TEntity) =>
            andPredicates.every((predicate) => predicate(entity))
        }),
        { concurrency: 'unbounded' }
      ).pipe(
        Effect.map((items) =>
          items.filter((x): x is Predicate<TEntity> => x !== undefined)
        )
      )

      if (orPredicates.length === 0) return
      if (orPredicates.length === 1) return orPredicates[0]

      return (entity: TEntity) =>
        orPredicates.some((predicate) => predicate(entity))
    })

    const buildOrderBy = Effect.fn(function* buildOrderBy<
      TEntity extends BaseEntity,
    >(orderBy?: IBaseRepository.OrderBy<TEntity>) {
      if (!orderBy) return

      const comparators = yield* Effect.forEach(
        Object.entries(orderBy),
        ([key, direction]) =>
          Effect.sync(() => {
            if (!direction) return
            return parseOrderBy<TEntity>(key as keyof TEntity, direction)
          }),
        { concurrency: 'unbounded' }
      ).pipe(
        Effect.map((items) =>
          items.filter((x): x is Comparator<TEntity> => x !== undefined)
        )
      )

      if (comparators.length === 0) return

      return (a: TEntity, b: TEntity): number => {
        for (const comparator of comparators) {
          const result = comparator(a, b)
          if (result !== 0) return result
        }
        return 0
      }
    })

    return {
      accounts: yield* Ref.make(new Map<string, Account>()),
      users: yield* Ref.make(new Map<User['id'], User>()),
      sessions: yield* Ref.make(new Map<Session['id'], Session>()),

      buildCriteria,

      buildOrderBy,
    }
  }),
}) {
  public static layer = Layer.effect(this, this.make)
}

// oxlint-disable-next-line complexity
const parseCondition = <TEntity extends BaseEntity>(
  key: keyof TEntity,
  value: unknown
): Predicate<TEntity> | undefined => {
  if (value === undefined) return

  if (typeof value !== 'object' || value === null || value instanceof Date)
    return (entity) => compareValues(entity[key], value) === 0

  const ops = value as IBaseRepository.Operator<unknown>

  if ('eq' in ops && ops.eq !== undefined)
    return (entity) => compareValues(entity[key], ops.eq) === 0
  if ('ne' in ops && ops.ne !== undefined)
    return (entity) => compareValues(entity[key], ops.ne) !== 0

  if ('gt' in ops && ops.gt !== undefined)
    return (entity) => compareValues(entity[key], ops.gt) > 0
  if ('gte' in ops && ops.gte !== undefined)
    return (entity) => compareValues(entity[key], ops.gte) >= 0

  if ('lt' in ops && ops.lt !== undefined)
    return (entity) => compareValues(entity[key], ops.lt) < 0
  if ('lte' in ops && ops.lte !== undefined)
    return (entity) => compareValues(entity[key], ops.lte) <= 0

  if ('in' in ops && Array.isArray(ops.in) && ops.in.length > 0)
    return (entity) =>
      // oxlint-disable-next-line typescript/no-non-null-assertion
      ops.in!.some((target) => compareValues(entity[key], target) === 0)

  if ('isNull' in ops && typeof ops.isNull === 'boolean')
    return (entity) =>
      ops.isNull
        ? entity[key] === null || entity[key] === undefined
        : entity[key] !== null && entity[key] !== undefined

  if ('like' in ops && typeof ops.like === 'string') {
    const mode = (ops as IBaseRepository.Operator<string>).mode ?? 'sensitive'
    const pattern = likeToRegExp(ops.like, mode === 'insensitive')

    return (entity) => {
      const val = entity[key]
      return typeof val === 'string' && pattern.test(val)
    }
  }
}

const parseOrderBy = <TEntity extends BaseEntity>(
  key: keyof TEntity,
  direction: 'asc' | 'desc'
): Comparator<TEntity> => {
  const multiplier = direction === 'asc' ? 1 : -1

  return (a, b) => compareValues(a[key], b[key]) * multiplier
}

const compareValues = (a: unknown, b: unknown): number => {
  if (a === b) return 0
  if (a === null || a === undefined) return -1
  if (b === null || b === undefined) return 1

  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b)
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

const likeToRegExp = (likeStr: string, caseInsensitive: boolean): RegExp => {
  const escaped = likeStr
    .replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&')
    .replaceAll('%', '.*')
    .replaceAll('_', '.')

  return new RegExp(`^${escaped}$`, caseInsensitive ? 'i' : '')
}
