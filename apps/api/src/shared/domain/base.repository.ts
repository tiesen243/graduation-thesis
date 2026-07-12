import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

export const TableName = Context.GenericTag('shared/domain/TableName')

export interface IBaseRepository<TEntity> {
  find: (
    criterias?: IBaseRepository.Criteria<TEntity>[],
    orderBy?: Partial<Record<keyof TEntity, 'asc' | 'desc'>>,
    options?: { limit?: number; offset?: number }
  ) => Effect.Effect<TEntity[], Error, never>

  count: (
    criterias?: IBaseRepository.Criteria<TEntity>[]
  ) => Effect.Effect<number, Error, never>

  save: (entity: TEntity) => Effect.Effect<void, Error, never>

  delete: (entity: TEntity) => Effect.Effect<void, Error, never>
}

export class BaseRepository extends Context.Tag('shared/domain/BaseRepository')<
  BaseRepository,
  IBaseRepository<unknown>
>() {}

export namespace IBaseRepository {
  export type Criteria<T, TValue = Omit<T, 'clone' | 'toPersistence'>> = {
    [K in keyof TValue]?: SingleOperator<TValue[K]>
  }

  export interface Operators<PropType> {
    $gt: PropType
    $gte: PropType
    $lt: PropType
    $lte: PropType
    $in: PropType[]
    $notIn: PropType[]
    $isNull: boolean
    $like: string
    mode?: 'startsWith' | 'endsWith' | 'contains'
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  type OnlyOne<T, Keys extends keyof T = keyof T> = Keys extends any
    ? Omit<Partial<Record<keyof T, never>>, Keys> & Pick<T, Keys>
    : never

  type SingleOperator<PropType> =
    | OnlyOne<Operators<PropType>>
    | (Omit<Partial<Record<keyof Operators<PropType>, never>>, '$like'> &
        Pick<Operators<PropType>, '$like' | 'mode'>)
    | PropType
}
