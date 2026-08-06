// oxlint-disable unicorn/no-array-for-each

import * as Effect from 'effect/Effect'
import * as Ref from 'effect/Ref'

import type { IRepository } from '@/shared/domain/repository'

import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const makeInMemoryRepository = Effect.fn(
  function* makeInMemoryRepository<TEntity, TPkey>(
    dictRef: Ref.Ref<Map<TPkey, TEntity>>,
    primaryKey: (entity: TEntity) => TPkey
  ) {
    const { buildCriteria, buildOrderBy } = yield* InMemoryClient

    return {
      findMany: Effect.fn(function* findMany(options = {}) {
        const dict = yield* Ref.get(dictRef)
        let items = [...dict.values()]

        if (options.where)
          items = yield* Effect.forEach(
            items,
            (item) => buildCriteria(item, options.where),
            { concurrency: 'unbounded' }
          ).pipe(
            Effect.map((results) => items.filter((_, index) => results[index]))
          )

        if (options.orderBy) items = yield* buildOrderBy(items, options.orderBy)

        const offset = options.offset ?? 0
        const limit = options.limit ? offset + options.limit : undefined

        return items.slice(offset, limit)
      }),

      count: Effect.fn(function* count(where) {
        const dict = yield* Ref.get(dictRef)
        if (!where) return dict.size

        const items = yield* Effect.forEach(
          [...dict.values()],
          (item) => buildCriteria(item, where),
          { concurrency: 'unbounded' }
        ).pipe(
          Effect.map((results) =>
            [...dict.values()].filter((_, index) => results[index])
          )
        )

        return items.length
      }),

      save: Effect.fn(function* save(entity) {
        const key = primaryKey(entity)
        yield* Ref.update(dictRef, (dict) => dict.set(key, entity))
      }),

      delete: Effect.fn(function* deleteEntity(entity) {
        const key = primaryKey(entity)

        yield* Ref.update(dictRef, (dict) => {
          const next = new Map(dict)
          next.delete(key)
          return next
        })
      }),
    } satisfies IRepository<TEntity>
  }
)
