import * as Effect from 'effect/Effect'
import * as Ref from 'effect/Ref'

import type { IBaseRepository } from '@/shared/domain/base.repository'

import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export const MakeInMemoryRepository = Effect.fn(
  'shared/infrastructure/persistence/in-memory/MakeInMemoryRepository'
)(function* MakeInMemoryRepositoryFn<
  TEntity extends { toJSON: () => Record<string, unknown> },
  TId = TEntity extends { id: infer IdType } ? IdType : never,
>(entities: Ref.Ref<Map<TId, TEntity>>) {
  const { buildCriteria, buildOrderBy } = yield* InMemoryClient

  return {
    findMany: Effect.fn(function* find(criterias = [], options = {}) {
      const criteriasFn = yield* buildCriteria(criterias)
      const orderByFn = yield* buildOrderBy(options.orderBy ?? {})

      let dict = yield* Ref.get(entities).pipe(
        Effect.map((map) => [...map.values()])
      )

      if (criteriasFn) dict = dict.filter(criteriasFn)
      if (orderByFn) dict = dict.toSorted(orderByFn)

      const offset = options.offset ?? 0
      const limit = options.limit ?? dict.length

      return dict.slice(offset, offset + limit)
    }),

    findOne: (id) =>
      Ref.get(entities).pipe(Effect.map((map) => map.get(id as never) ?? null)),

    count: Effect.fn(function* count(criterias = []) {
      const criteriasFn = yield* buildCriteria(criterias)

      let dict = yield* Ref.get(entities).pipe(
        Effect.map((map) => [...map.values()])
      )

      if (criteriasFn) dict = dict.filter(criteriasFn)

      return dict.length
    }),

    save: (entity: TEntity) =>
      Ref.update(entities, (map) =>
        map.set((entity as unknown as { id: TId }).id, entity)
      ).pipe(Effect.asVoid),

    delete: (entity: TEntity) =>
      Ref.update(entities, (map) => {
        map.delete((entity as unknown as { id: TId }).id)
        return map
      }).pipe(Effect.asVoid),
  } satisfies IBaseRepository<TEntity, TId>
})
