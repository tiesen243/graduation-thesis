import * as Effect from 'effect/Effect'
import * as Ref from 'effect/Ref'

import type { BaseEntity } from '@/shared/domain/base.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export const MakeInMemoryRepository = Effect.fn(
  'shared/infrastructure/persistence/in-memory/MakeInMemoryRepository'
)(function* MakeInMemoryRepositoryFn<TEntity extends BaseEntity>(
  entities: Ref.Ref<Map<TEntity['id'], TEntity>>
) {
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

    findOne: (id: TEntity['id']) =>
      Ref.get(entities).pipe(Effect.map((map) => map.get(id) ?? null)),

    count: Effect.fn(function* count(criterias = []) {
      const criteriasFn = yield* buildCriteria(criterias)

      let dict = yield* Ref.get(entities).pipe(
        Effect.map((map) => [...map.values()])
      )

      if (criteriasFn) dict = dict.filter(criteriasFn)

      return dict.length
    }),

    save: (entity: TEntity) =>
      Ref.update(entities, (map) => map.set(entity.id, entity)).pipe(
        Effect.asVoid
      ),

    delete: (entity: TEntity) =>
      Ref.update(entities, (map) => {
        map.delete(entity.id)
        return map
      }).pipe(Effect.asVoid),
  } satisfies IBaseRepository<TEntity>
})
