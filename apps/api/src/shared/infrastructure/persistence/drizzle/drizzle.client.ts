// oxlint-disable unicorn/no-array-for-each

import type { SQL } from 'drizzle-orm'
import type { AnyPgTable, PgColumn } from 'drizzle-orm/pg-core'

import * as PgClient from '@effect/sql-pg/PgClient'
import * as orm from 'drizzle-orm'
import * as PgDrizzle from 'drizzle-orm/effect-postgres'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import { types } from 'pg'

import type { IBaseRepository } from '@/shared/domain/base.repository'

import { env } from '@/shared/env'

const PgClientLive = PgClient.layer({
  url: Redacted.make(env.DATABASE_URL),
  types: {
    getTypeParser: (typeId, format) => {
      if (
        [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
      )
        return (val: number) => val

      return types.getTypeParser(typeId, format)
    },
  },
})

export class DrizzleClient extends Context.Service<
  DrizzleClient,
  {
    db: PgDrizzle.EffectPgDatabase

    buildCriteria: <TEntity>(
      table: AnyPgTable,
      criterias: IBaseRepository.Criteria<TEntity>[]
    ) => Effect.Effect<SQL | undefined>

    buildOrderBy: <TEntity>(
      table: AnyPgTable,
      orderBy: IBaseRepository.OrderBy<TEntity>
    ) => Effect.Effect<SQL[] | undefined>
  }
>()('shared/infrastructure/persistence/drizzle/DrizzleClient', {
  make: Effect.gen(function* DrizzleClientMake() {
    // oxlint-disable-next-line complexity
    const buildCriteria = Effect.fn(function* buildCriteria<TEntity>(
      table: AnyPgTable,
      criterias: IBaseRepository.Criteria<TEntity>[]
    ) {
      if (!criterias || criterias.length === 0) return

      const getColumn = (key: string): PgColumn | undefined =>
        (table as unknown as Record<string, unknown>)[key] as
          | PgColumn
          | undefined

      const orConditions = yield* Effect.forEach(
        criterias,
        Effect.fn(function* orConditions(criteria) {
          const andConditions = yield* Effect.forEach(
            Object.entries(criteria),
            ([key, value]) =>
              Effect.sync(() => {
                const column = getColumn(key)
                if (!column) return

                return parseCondition(column, value)
              }),
            { concurrency: 'unbounded' }
          ).pipe(
            Effect.map((items) =>
              items.filter((x): x is SQL => x !== undefined)
            )
          )

          if (andConditions.length === 0) return
          if (andConditions.length === 1) return andConditions[0]
          return orm.and(...andConditions)
        }),
        { concurrency: 'unbounded' }
      ).pipe(
        Effect.map((items) => items.filter((x): x is SQL => x !== undefined))
      )

      if (orConditions.length === 0) return
      if (orConditions.length === 1) return orConditions[0]
      return orm.or(...orConditions)
    })

    const buildOrderBy = Effect.fn(function* buildOrderBy<TEntity>(
      table: AnyPgTable,
      orderBy: IBaseRepository.OrderBy<TEntity>
    ) {
      const getColumn = (key: string): PgColumn | undefined =>
        (table as unknown as Record<string, unknown>)[key] as
          | PgColumn
          | undefined

      return yield* Effect.forEach(
        Object.entries(orderBy),
        ([key, direction]) =>
          Effect.sync(() => {
            const column = getColumn(key)
            if (!column) return

            return direction === 'asc' ? orm.asc(column) : orm.desc(column)
          }),
        { concurrency: 'unbounded' }
      ).pipe(
        Effect.map((items) => items.filter((x): x is SQL => x !== undefined))
      )
    })

    return {
      db: yield* PgDrizzle.make().pipe(
        Effect.provide(PgDrizzle.DefaultServices)
      ),

      buildCriteria,

      buildOrderBy,
    }
  }),
}) {
  public static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgClientLive)
  )
}

// oxlint-disable-next-line complexity
const parseCondition = (column: PgColumn, value: unknown): SQL | undefined => {
  if (value === undefined) return

  if (typeof value !== 'object' || value === null || value instanceof Date)
    return orm.eq(column, value)

  const ops = value as IBaseRepository.Operator<unknown>

  if ('eq' in ops && ops.eq !== undefined) return orm.eq(column, ops.eq)
  if ('ne' in ops && ops.ne !== undefined) return orm.ne(column, ops.ne)

  if ('gt' in ops && ops.gt !== undefined) return orm.gt(column, ops.gt)
  if ('gte' in ops && ops.gte !== undefined) return orm.gte(column, ops.gte)

  if ('lt' in ops && ops.lt !== undefined) return orm.lt(column, ops.lt)
  if ('lte' in ops && ops.lte !== undefined) return orm.lte(column, ops.lte)

  if ('in' in ops && Array.isArray(ops.in) && ops.in.length > 0)
    return orm.inArray(column, ops.in)

  if ('isNull' in ops && typeof ops.isNull === 'boolean')
    return ops.isNull ? orm.isNull(column) : orm.isNotNull(column)

  if ('like' in ops && typeof ops.like === 'string') {
    const mode = (ops as IBaseRepository.Operator<string>).mode ?? 'sensitive'
    return mode === 'insensitive'
      ? orm.ilike(column, ops.like)
      : orm.like(column, ops.like)
  }
}
