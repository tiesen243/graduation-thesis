// oxlint-disable typescript/no-explicit-any typescript/no-non-null-assertion unicorn/no-array-for-each

import type { AnyPgTable } from 'drizzle-orm/pg-core'

import * as PgClient from '@effect/sql-pg/PgClient'
import * as orm from 'drizzle-orm'
import * as PgDrizzle from 'drizzle-orm/effect-postgres'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import { types } from 'pg'

import type { IRepository } from '@/shared/domain/repository'

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
      criteria?: IRepository.Criteria<TEntity>
    ) => Effect.Effect<orm.SQL | undefined>

    buildOrderBy: <TEntity>(
      table: AnyPgTable,
      orderBy?: IRepository.OrderBy<TEntity>
    ) => Effect.Effect<orm.SQL[]>
  }
>()('shared/infrastructure/persistence/drizzle/DrizzleClient', {
  make: Effect.gen(function* DrizzleClientMake() {
    const CYAN = '\u001B[36m'
    const RESET = '\u001B[0m'

    const logger = Layer.succeed(PgDrizzle.EffectLogger, {
      logQuery: (sql, params) => {
        const prettySql = sql
          .replaceAll(/\s+/gu, ' ')
          .replaceAll(
            /\b(?<sql>SELECT|FROM|WHERE|ORDER BY|LIMIT|GROUP BY|LEFT JOIN|RIGHT JOIN|INNER JOIN)\b/giu,
            '\n  $1'
          )

        return Effect.logDebug(
          `\n${CYAN}query:${RESET}  ${prettySql}\n${CYAN}params:${RESET} ${JSON.stringify(params)}`
        ).pipe(Effect.withLogSpan('DrizzleClient'))
      },
    })

    return {
      db: yield* PgDrizzle.make().pipe(
        Effect.provide(logger),
        Effect.provide(PgDrizzle.DefaultServices)
      ),

      // oxlint-disable-next-line no-use-before-define
      buildCriteria,

      buildOrderBy: Effect.fn(function* buildOrderByFn<TEntity>(
        table: AnyPgTable,
        orderBy: IRepository.OrderBy<TEntity> = {}
      ) {
        if (!orderBy) return []

        return yield* Effect.forEach(
          Object.entries(orderBy),
          ([key, direction]) =>
            Effect.sync(() => {
              const column = (table as Record<string, any>)[key]
              if (!column) return

              if (direction === 'asc') return orm.asc(column)
              else if (direction === 'desc') return orm.desc(column)
            }),
          { concurrency: 'unbounded' }
        ).pipe(
          Effect.map((items) =>
            items.filter((x): x is orm.SQL => x !== undefined)
          )
        )
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgClientLive)
  )
}

const buildCriteria = <TEntity>(
  table: AnyPgTable,
  criteria: IRepository.Criteria<TEntity> = {}
): Effect.Effect<orm.SQL | undefined> =>
  Effect.gen(function* buildCriteriaFn() {
    if (!criteria) return

    const conditions: orm.SQL[] = []

    yield* Effect.forEach(
      Object.entries(criteria),
      // oxlint-disable-next-line eslint/complexity
      Effect.fn(function* buildCriteriaMap([key, value]) {
        if (value === undefined) return

        if (key === 'AND') {
          const andList = Array.isArray(value) ? value : [value]
          const andConditions = yield* Effect.forEach(
            andList,
            (c) => buildCriteria(table, c),
            { concurrency: 'unbounded' }
          ).pipe(
            Effect.flatMap((items) =>
              Effect.succeed(items.filter((c): c is orm.SQL => c !== undefined))
            )
          )

          if (andConditions.length > 0)
            conditions.push(orm.and(...andConditions)!)
          return
        }

        if (key === 'OR') {
          let orList: unknown[]
          if (Array.isArray(value)) orList = value
          else if (typeof value === 'object' && value !== null)
            orList = Object.entries(value).map(([k, v]) => ({ [k]: v }))
          else orList = [value]

          const orConditions = yield* Effect.forEach(
            orList,
            (c) => buildCriteria(table, c as IRepository.Criteria<TEntity>),
            { concurrency: 'unbounded' }
          ).pipe(
            Effect.flatMap((items) =>
              Effect.succeed(items.filter((c): c is orm.SQL => c !== undefined))
            )
          )

          if (orConditions.length > 0) conditions.push(orm.or(...orConditions)!)

          return
        }

        if (key === 'NOT') {
          const notList = Array.isArray(value) ? value : [value]
          const notConditions = yield* Effect.forEach(
            notList,
            (c) => buildCriteria(table, c),
            { concurrency: 'unbounded' }
          ).pipe(
            Effect.flatMap((items) =>
              Effect.succeed(items.filter((c): c is orm.SQL => c !== undefined))
            )
          )

          if (notConditions.length > 0)
            conditions.push(orm.not(orm.and(...notConditions))!)

          return
        }

        const column = (table as Record<string, any>)[key]
        if (!column) return

        if (
          typeof value !== 'object' ||
          value === null ||
          value instanceof Date
        ) {
          conditions.push(orm.eq(column, value))
          return
        }

        const opObj = value as IRepository.Operator<unknown>

        if ('eq' in opObj) conditions.push(orm.eq(column, opObj.eq))
        if ('in' in opObj && opObj.in)
          conditions.push(orm.inArray(column, opObj.in))
        if ('isNull' in opObj)
          conditions.push(
            opObj.isNull ? orm.isNull(column) : orm.isNotNull(column)
          )

        if ('gt' in opObj) conditions.push(orm.gt(column, opObj.gt))
        if ('gte' in opObj) conditions.push(orm.gte(column, opObj.gte))

        if ('lt' in opObj) conditions.push(orm.lt(column, opObj.lt))
        if ('lte' in opObj) conditions.push(orm.lte(column, opObj.lte))

        if ('between' in opObj && Array.isArray(opObj.between)) {
          const [from, to] = opObj.between as unknown as [unknown, unknown]
          conditions.push(orm.between(column, from, to))
        }

        if ('like' in opObj && typeof opObj.like === 'string') {
          conditions.push(
            opObj.mode === 'insensitive'
              ? orm.ilike(column, opObj.like)
              : orm.like(column, opObj.like)
          )
        }
      }),
      { concurrency: 'unbounded', discard: true }
    )

    return conditions.length > 0 ? orm.and(...conditions) : undefined
  })
