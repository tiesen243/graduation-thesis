import type { AnyPgTable } from 'drizzle-orm/pg-core'

import * as orm from 'drizzle-orm'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { BaseEntity } from '@/shared/domain/base.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

import { BaseRepository } from '@/shared/domain/base.repository'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const TableTag = Context.GenericTag<AnyPgTable & { id: orm.Column }>(
  'shared/infrastructure/persistence/drizzle/Table'
)

export const DrizzleBaseRepository = Layer.effect(
  BaseRepository,
  Effect.gen(function* DrizzleBaseRepositoryGen() {
    const $ = yield* DrizzleClient

    return {
      find: (criterias = [], orderBy = {}, options = {}) =>
        TableTag.pipe(
          Effect.flatMap((table) =>
            $((client) => {
              const query = client.select().from(table).$dynamic()

              if (criterias) {
                const whereClauses = buildCriteria(table, criterias)
                if (whereClauses) query.where(whereClauses)
              }

              if (orderBy) {
                const orderByClauses = buildOrderBy(table, orderBy)
                if (orderByClauses.length > 0) query.orderBy(...orderByClauses)
              }

              if (options.limit) query.limit(options.limit)
              if (options.offset) query.offset(options.offset)

              return query
            })
          )
        ) as unknown as Effect.Effect<unknown[], Error, never>,

      count: (criterias = []) =>
        TableTag.pipe(
          Effect.flatMap((table) =>
            $((client) => {
              const whereClauses = buildCriteria(table, criterias)
              if (whereClauses) return client.$count(table, whereClauses)
              return client.$count(table)
            })
          )
        ) as unknown as Effect.Effect<number, Error, never>,

      save: (entity) =>
        TableTag.pipe(
          Effect.flatMap((table) =>
            $((client) =>
              client
                .insert(table)
                .values((entity as BaseEntity).toPersistence())
                .onConflictDoUpdate({
                  target: table.id as never,
                  set: (entity as BaseEntity).toPersistence(),
                })
            )
          ),
          Effect.asVoid
        ) as unknown as Effect.Effect<void, Error, never>,

      delete: (entity) =>
        TableTag.pipe(
          Effect.flatMap((table) =>
            $((client) =>
              client
                .delete(table)
                .where(orm.eq(table.id, (entity as BaseEntity).id))
            )
          ),
          Effect.asVoid
        ) as unknown as Effect.Effect<void, Error, never>,
    }
  })
)

// oxlint-disable-next-line complexity
export function buildCriteria<TEntity>(
  table: AnyPgTable,
  criterias: IBaseRepository.Criteria<TEntity>[]
): orm.SQL | undefined {
  if (criterias.length === 0) return

  const orClauses: (orm.SQL | undefined)[] = []

  for (const criteria of criterias) {
    if (Object.keys(criteria).length === 0) continue

    const andClauses: orm.SQL[] = []

    for (const [field, _operation] of Object.entries(criteria)) {
      const column = table[field as keyof typeof table] as unknown as orm.Column
      if (!column || !_operation) continue

      if (typeof _operation === 'object') {
        const operation = _operation as IBaseRepository.Operators<TEntity>

        if ('$gt' in operation) andClauses.push(orm.gt(column, operation.$gt))
        if ('$gte' in operation)
          andClauses.push(orm.gte(column, operation.$gte))
        if ('$lt' in operation) andClauses.push(orm.lt(column, operation.$lt))
        if ('$lte' in operation)
          andClauses.push(orm.lte(column, operation.$lte))
        if ('$in' in operation)
          andClauses.push(orm.inArray(column, operation.$in))
        if ('$notIn' in operation)
          andClauses.push(orm.notInArray(column, operation.$notIn))
        if ('$isNull' in operation)
          andClauses.push(
            operation.$isNull ? orm.isNull(column) : orm.isNotNull(column)
          )
        if ('$like' in operation) {
          const mode = operation.mode ?? 'contains'
          let value = `%${operation.$like}%`
          if (mode === 'startsWith') value = `${operation.$like}%`
          if (mode === 'endsWith') value = `%${operation.$like}`
          andClauses.push(orm.like(column, value))
        }
      } else andClauses.push(orm.eq(column, _operation))
    }

    orClauses.push(
      andClauses.length === 1 ? andClauses[0] : orm.or(...andClauses)
    )
  }

  return orClauses.length === 1 ? orClauses[0] : orm.and(...orClauses)
}

export function buildOrderBy<TEntity>(
  table: AnyPgTable,
  orderBy: Partial<Record<keyof TEntity, 'asc' | 'desc'>>
): orm.SQL[] {
  if (Object.keys(orderBy).length === 0) return []

  const orderByClauses: orm.SQL[] = []

  for (const [field, direction] of Object.entries(orderBy)) {
    const column = table[field as keyof typeof table] as unknown as orm.Column
    if (!column) continue

    if (direction === 'asc') orderByClauses.push(orm.asc(column))
    else if (direction === 'desc') orderByClauses.push(orm.desc(column))
  }

  return orderByClauses
}
