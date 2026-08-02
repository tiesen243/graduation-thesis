import type * as Effect from 'effect/Effect'

export interface IBaseRepository<
  TEntity,
  TId = TEntity extends { id: infer IdType } ? IdType : never,
> {
  readonly findMany: (
    criterias?: IBaseRepository.Criteria<TEntity>[],
    options?: {
      orderBy?: IBaseRepository.OrderBy<TEntity>
      limit?: number
      offset?: number
    }
  ) => Effect.Effect<TEntity[]>

  readonly findOne: (
    id: TId extends never ? IBaseRepository.Criteria<TEntity> : TId
  ) => Effect.Effect<TEntity | null>

  readonly count: (
    criterias?: IBaseRepository.Criteria<TEntity>[]
  ) => Effect.Effect<number>

  readonly save: (entity: TEntity) => Effect.Effect<void>

  readonly delete: (entity: TEntity) => Effect.Effect<void>
}

export namespace IBaseRepository {
  export type Criteria<TEntity> = {
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

  export type OrderBy<TEntity> = {
    [K in keyof TEntity]?: 'asc' | 'desc'
  }
}
