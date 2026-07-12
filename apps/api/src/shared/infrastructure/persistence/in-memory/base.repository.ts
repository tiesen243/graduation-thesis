import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { BaseEntity } from '@/shared/domain/base.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

import { BaseRepository } from '@/shared/domain/base.repository'

// oxlint-disable-next-line typescript/no-explicit-any
export const StoreTag = Context.GenericTag<Ref.Ref<Map<string, any>>>(
  'shared/infrastructure/persistence/in-memory/Store'
)

export const InMemoryBaseRepository = Layer.succeed(BaseRepository, {
  find: (criterias = [], orderBy = {}, options = {}) =>
    StoreTag.pipe(
      Effect.flatMap((store) => Ref.get(store)),
      Effect.map((dict) => [...dict.values()]),
      Effect.map((items) =>
        items.filter((item) => matchCriterias(item, criterias))
      ),
      Effect.map((items) => items.sort((a, b) => compareItems(a, b, orderBy))),
      Effect.map((items) => {
        const offset = options.offset ?? 0
        const limit = options.limit ?? items.length
        return [...items].slice(offset, offset + limit)
      })
    ) as unknown as Effect.Effect<unknown[], Error, never>,

  count: (criterias = []) =>
    StoreTag.pipe(
      Effect.flatMap((store) => Ref.get(store)),
      Effect.map((dict) =>
        criterias.length === 0
          ? dict.size
          : [...dict.values()].filter((item) => matchCriterias(item, criterias))
              .length
      )
    ) as unknown as Effect.Effect<number, Error, never>,

  save: (entity) =>
    StoreTag.pipe(
      Effect.flatMap((store) =>
        Ref.update(store, (dict) => {
          dict.set((entity as BaseEntity).id, entity)
          return dict
        })
      ),
      Effect.asVoid
    ) as unknown as Effect.Effect<void, Error, never>,

  delete: (entity) =>
    StoreTag.pipe(
      Effect.flatMap((store) =>
        Ref.update(store, (dict) => {
          dict.delete((entity as BaseEntity).id)
          return dict
        })
      ),
      Effect.asVoid
    ) as unknown as Effect.Effect<void, Error, never>,
})

function getRecordFromItem(item: unknown): Record<string, unknown> {
  if (item && typeof item === 'object') {
    if (
      'toPersistence' in item &&
      typeof (item as { toPersistence: unknown }).toPersistence === 'function'
    ) {
      const persisted = (
        item as { toPersistence: () => unknown }
      ).toPersistence()
      if (persisted && typeof persisted === 'object') {
        return persisted as Record<string, unknown>
      }
    }
    return item as Record<string, unknown>
  }
  return {}
}

function comparePrimitives(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b)
  return String(a).localeCompare(String(b))
}

function matchCriterias<TEntity>(
  item: unknown,
  criterias: IBaseRepository.Criteria<TEntity>[]
): boolean {
  if (criterias.length === 0) return true
  const record = getRecordFromItem(item)

  return criterias.some((criteria) => {
    if (Object.keys(criteria).length === 0) return true

    // oxlint-disable-next-line complexity
    return Object.entries(criteria).every(([field, operation]) => {
      const value = record[field]
      if (operation === undefined) return true

      if (
        operation &&
        typeof operation === 'object' &&
        !Array.isArray(operation)
      ) {
        const op = operation as Record<string, unknown>

        if ('$gt' in op && !(comparePrimitives(value, op.$gt) > 0)) return false
        if ('$gte' in op && !(comparePrimitives(value, op.$gte) >= 0))
          return false
        if ('$lt' in op && !(comparePrimitives(value, op.$lt) < 0)) return false
        if ('$lte' in op && !(comparePrimitives(value, op.$lte) <= 0))
          return false

        if ('$in' in op) {
          const inArr = op.$in
          if (!Array.isArray(inArr) || !inArr.includes(value)) return false
        }
        if ('$notIn' in op) {
          const notInArr = op.$notIn
          if (!Array.isArray(notInArr) || notInArr.includes(value)) return false
        }

        if ('$isNull' in op) {
          const isNull = value === null || value === undefined
          if (op.$isNull !== isNull) return false
        }

        if ('$like' in op) {
          const searchStr = String(op.$like)
          const itemStr = String(value ?? '')
          const mode = (op.mode as string) ?? 'contains'

          if (mode === 'contains' && !itemStr.includes(searchStr)) return false
          if (mode === 'startsWith' && !itemStr.startsWith(searchStr))
            return false
          if (mode === 'endsWith' && !itemStr.endsWith(searchStr)) return false
        }

        return true
      }

      return value === operation
    })
  })
}

function compareItems<TEntity>(
  a: unknown,
  b: unknown,
  orderBy: Partial<Record<keyof TEntity, 'asc' | 'desc'>>
): number {
  const recordA = getRecordFromItem(a)
  const recordB = getRecordFromItem(b)

  for (const [field, direction] of Object.entries(orderBy)) {
    const valA = recordA[field]
    const valB = recordB[field]

    if (valA === valB) continue

    const modifier = direction === 'desc' ? -1 : 1
    return comparePrimitives(valA, valB) * modifier
  }
  return 0
}
