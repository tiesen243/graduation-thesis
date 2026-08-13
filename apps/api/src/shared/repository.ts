import type { Effect } from 'effect/Effect'

// oxlint-disable-next-line typescript/no-explicit-any
type FunctionLike = (...args: any[]) => any

export interface IRepository<TEntity> {
  readonly findMany: (
    options?: Partial<{
      where: IRepository.Criteria<TEntity>
      orderBy: IRepository.OrderBy<TEntity>
      limit: number
      offset: number
    }>
  ) => Effect<TEntity[]>

  readonly count: (where?: IRepository.Criteria<TEntity>) => Effect<number>

  readonly save: (entity: TEntity | TEntity[]) => Effect<void>

  readonly delete: (entity: TEntity) => Effect<void>
}

export namespace IRepository {
  interface BaseOperators<TValue> {
    eq: TValue
    in: TValue[]
    isNull: boolean
  }

  interface RangeOperators<TValue> {
    gt: TValue
    gte: TValue
    lt: TValue
    lte: TValue
    between: [TValue, TValue]
  }

  type AllOpKeys =
    | keyof BaseOperators<unknown>
    | keyof RangeOperators<unknown>
    | 'like'
    | 'mode'

  type MakeExactUnion<T> = {
    [K in keyof T]: { [P in K]: T[P] } & Partial<
      Record<Exclude<AllOpKeys, K>, never>
    >
  }[keyof T]

  type StringOperators = {
    like: string
    mode?: 'insensitive' | 'sensitive'
  } & Partial<Record<Exclude<AllOpKeys, 'like' | 'mode'>, never>>

  export type Operator<V> = V extends string
    ? MakeExactUnion<BaseOperators<V>> | StringOperators
    : V extends number | Date
      ? MakeExactUnion<BaseOperators<V> & RangeOperators<V>>
      : MakeExactUnion<BaseOperators<V>>

  type CriteriaValue<T> = T extends Date
    ? T | Operator<T>
    : T extends object
      ? Operator<T>
      : T | Operator<T>

  export type BaseCriteria<TEntity> = {
    [
      K in keyof TEntity as TEntity[K] extends FunctionLike ? never : K
    ]?: CriteriaValue<NonNullable<TEntity[K]>>
  }

  type Levels = [never, 0, 1, 2]

  export type Criteria<
    TEntity,
    Depth extends number = 2,
  > = BaseCriteria<TEntity> &
    ([Depth] extends [0]
      ? // oxlint-disable-next-line typescript/ban-types typescript/no-empty-object-type
        {}
      : {
          AND?:
            | Criteria<TEntity, Levels[Depth]>
            | Criteria<TEntity, Levels[Depth]>[]
          OR?:
            | Criteria<TEntity, Levels[Depth]>
            | Criteria<TEntity, Levels[Depth]>[]
          NOT?:
            | Criteria<TEntity, Levels[Depth]>[]
            | Criteria<TEntity, Levels[Depth]>[]
        })

  export type OrderBy<TEntity> = Omit<
    {
      [K in keyof TEntity as TEntity[K] extends FunctionLike ? never : K]?:
        | 'asc'
        | 'desc'
    },
    '_tag'
  >
}
