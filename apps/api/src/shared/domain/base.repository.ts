import type * as Effect from 'effect/Effect'

import type { BaseEntity } from '@/shared/domain/base.entity'

export interface IBaseRepository<TEntity extends BaseEntity> {
  readonly findMany: (
    criterias?: IBaseRepository.Criteria<TEntity>[],
    options?: {
      orderBy?: IBaseRepository.OrderBy<TEntity>
      limit?: number
      offset?: number
    }
  ) => Effect.Effect<TEntity[]>

  readonly findOne: (id: TEntity['id']) => Effect.Effect<TEntity | null>

  readonly count: (
    criterias?: IBaseRepository.Criteria<TEntity>[]
  ) => Effect.Effect<number>

  readonly save: (entity: TEntity) => Effect.Effect<void>

  readonly delete: (entity: TEntity) => Effect.Effect<void>
}

export namespace IBaseRepository {
  export type Criteria<TEntity extends BaseEntity> = {
    [K in keyof TEntity]?: Operator<TEntity[K]> | TEntity[K]
  }

  export interface Operator<TEntityValue> {
    eq?: TEntityValue
    ne?: TEntityValue
    gt?: TEntityValue
    gte?: TEntityValue
    lt?: TEntityValue
    lte?: TEntityValue
    in?: TEntityValue[]
    isNull?: boolean
    like?: TEntityValue extends string ? string : never
    mode?: TEntityValue extends string ? 'insensitive' | 'sensitive' : never
  }

  export type OrderBy<TEntity extends BaseEntity> = {
    [K in keyof TEntity]?: 'asc' | 'desc'
  }
}
