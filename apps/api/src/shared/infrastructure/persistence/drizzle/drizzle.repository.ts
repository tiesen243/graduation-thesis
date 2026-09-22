import type { IndexColumn, AnyPgTable } from 'drizzle-orm/pg-core'

import { and, eq, or } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export interface DrizzleMapper<TEntity, TInput> {
  toEntity: (row: TInput) => TEntity
  toRow: (entity: TEntity) => TInput
}

const toCamel = (str: string) =>
  str.replaceAll(/_(?<key>[a-z])/gu, (_, letter) => letter.toUpperCase())

export const makeDrizzleRepository = Effect.fn(function* makeDrizzleRepository<
  TEntity,
  TInput = Record<string, unknown>,
>(
  table: AnyPgTable,
  primaryKey: IndexColumn | IndexColumn[],
  mapper: DrizzleMapper<TEntity, TInput>
) {
  const { db, buildCriteria, buildOrderBy } = yield* DrizzleClient

  return {
    findMany: Effect.fn(function* findMany(options = {}) {
      const query = db.select().from(table).$dynamic()

      const whereSql = yield* buildCriteria(table, options.where)
      if (whereSql) query.where(whereSql)

      const orderBySql = yield* buildOrderBy(table, options.orderBy)
      if (orderBySql.length > 0) query.orderBy(...orderBySql)

      if (options.limit) query.limit(options.limit)
      if (options.offset) query.offset(options.offset)

      return yield* query.pipe(
        Effect.map((rows) => rows.map((row) => mapper.toEntity(row as TInput))),
        Effect.orDie
      )
    }),

    count: Effect.fn(function* count(where) {
      const whereSql = yield* buildCriteria(table, where)
      return yield* db.$count(table, whereSql).pipe(Effect.orDie)
    }),

    save: Effect.fn(function* save(entity) {
      if (Array.isArray(entity)) {
        if (entity.length === 0) return

        return yield* db
          .insert(table)
          .values(entity.map(mapper.toRow))
          .onConflictDoNothing({ target: primaryKey })
          .pipe(Effect.asVoid, Effect.orDie)
      }

      const row = mapper.toRow(entity) as Record<string, unknown>

      return yield* db
        .insert(table)
        .values(row)
        .onConflictDoUpdate({ target: primaryKey, set: row })
        .pipe(Effect.asVoid, Effect.orDie)
    }),

    delete: Effect.fn(function* deleteEntity(entity: TEntity | TEntity[]) {
      const items = Array.isArray(entity) ? entity : [entity]
      if (items.length === 0) return

      const pks = Array.isArray(primaryKey) ? primaryKey : [primaryKey]
      const rows = items.map(mapper.toRow)

      const conditions = rows.map((row) =>
        and(
          ...pks.map((pk) => {
            const val =
              row[toCamel(pk.name) as keyof typeof row] ??
              row[pk.name as keyof typeof row]
            return eq(pk, val)
          })
        )
      )
      const whereSql =
        conditions.length === 1 ? conditions[0] : or(...conditions)
      if (!whereSql) return

      return yield* db
        .delete(table)
        .where(whereSql)
        .pipe(Effect.asVoid, Effect.orDie)
    }),
  }
})
