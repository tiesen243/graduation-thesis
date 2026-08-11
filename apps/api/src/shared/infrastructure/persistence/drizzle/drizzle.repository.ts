import type { IndexColumn, AnyPgTable } from 'drizzle-orm/pg-core'

import { and, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import type { IRepository } from '@/shared/repository'

import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const makeDrizzleRepository = Effect.fn(function* makeDrizzleRepository<
  TEntity,
  TInput = Record<string, unknown>,
>(
  table: AnyPgTable,
  primaryKey: IndexColumn | IndexColumn[],
  mapper: {
    toEntity: (row: TInput) => TEntity
    toRow: (entity: TEntity) => TInput
  }
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

    delete: Effect.fn(function* deleteEntity(entity) {
      const row = mapper.toRow(entity) as Record<string, unknown>
      const rowKeys = Object.keys(row)

      const getVal = (pk: IndexColumn) => {
        const colName = pk.name
        if (colName in row) return row[colName]

        const matchedKey = rowKeys.find(
          (key) =>
            key.replaceAll('_', '').toLowerCase() ===
            colName.replaceAll('_', '').toLowerCase()
        )

        return matchedKey ? row[matchedKey] : undefined
      }

      const whereSql = Array.isArray(primaryKey)
        ? and(...primaryKey.map((pk) => eq(pk, getVal(pk))))
        : eq(primaryKey, getVal(primaryKey))

      yield* db.delete(table).where(whereSql).pipe(Effect.orDie)
    }),
  } satisfies IRepository<TEntity>
})
