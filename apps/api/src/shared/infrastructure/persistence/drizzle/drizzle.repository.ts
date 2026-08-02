import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'

import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import type { IBaseRepository } from '@/shared/domain/base.repository'

import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const MakeDrizzleRepository = Effect.fn(
  'shared/infrastructure/persistence/drizzle/MakeDrizzleRepository'
)(function* MakeDrizzleRepositoryFn<
  TEntity extends { toJSON: () => Record<string, unknown> },
  TId = TEntity extends { id: infer IdType } ? IdType : never,
>(table: PgTable, mapper: (row: Record<string, unknown>) => TEntity) {
  const { db, buildCriteria, buildOrderBy } = yield* DrizzleClient

  return {
    findMany: Effect.fn(function* find(criterias = [], options = {}) {
      const query = db.select().from(table).$dynamic()

      if (criterias.length > 0) {
        const whereClause = yield* buildCriteria(table, criterias)
        query.where(whereClause)
      }

      if (options.orderBy) {
        const orderByClause = yield* buildOrderBy(table, options.orderBy)
        if (orderByClause && orderByClause.length > 0)
          query.orderBy(...orderByClause)
      }

      if (options.limit) query.limit(options.limit)
      if (options.offset) query.offset(options.offset)

      return yield* query.pipe(
        Effect.map((rows) => rows.map(mapper)),
        Effect.orDie
      )
    }),

    findOne: (id) =>
      db
        .select()
        .from(table)
        .where(eq((table as unknown as { id: PgColumn }).id, id))
        .limit(1)
        .pipe(
          Effect.map((rows) => (rows[0] ? mapper(rows[0]) : null)),
          Effect.orDie
        ),

    count: Effect.fn(function* count(criterias = []) {
      const whereClause = yield* buildCriteria(table, criterias)
      return yield* db.$count(table, whereClause).pipe(Effect.orDie)
    }),

    save: (entity: TEntity) =>
      db
        .insert(table)
        .values(entity.toJSON())
        .onConflictDoUpdate({
          target: (table as unknown as { id: PgColumn }).id,
          set: entity.toJSON(),
        })
        .pipe(Effect.asVoid, Effect.orDie),

    delete: (entity: TEntity) =>
      db
        .delete(table)
        .where(
          eq(
            (table as unknown as { id: PgColumn }).id,
            (entity as unknown as { id: string }).id
          )
        )
        .pipe(Effect.asVoid, Effect.orDie),
  } satisfies IBaseRepository<TEntity, TId>
})
