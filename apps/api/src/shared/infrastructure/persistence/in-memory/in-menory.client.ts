// oxlint-disable typescript/no-explicit-any unicorn/no-array-for-each

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { Session } from '@/modules/auth/domain/entities/session.entity'
import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import type { Device } from '@/modules/device/domain/entities/device.entity'
import type { User } from '@/modules/user/domain/entities/user.entity'
import type { IRepository } from '@/shared/domain/repository'

export class InMemoryClient extends Context.Service<
  InMemoryClient,
  {
    db: {
      accounts: Ref.Ref<Map<string, Account>>
      sessions: Ref.Ref<Map<Session['id'], Session>>

      users: Ref.Ref<Map<User['id'], User>>

      devices: Ref.Ref<Map<Device['id'], Device>>
      compartments: Ref.Ref<Map<Compartment['id'], Compartment>>
    }

    buildCriteria: <TEntity>(
      item: TEntity,
      criteria?: IRepository.Criteria<TEntity>
    ) => Effect.Effect<boolean>

    buildOrderBy: <TEntity>(
      items: TEntity[],
      orderBy: IRepository.OrderBy<TEntity>
    ) => Effect.Effect<TEntity[]>
  }
>()('shared/infrastructure/persistence/in-memory/InMemoryClient', {
  make: Effect.gen(function* InMemoryClientMake() {
    const db = {
      accounts: yield* Ref.make(new Map<string, Account>()),
      sessions: yield* Ref.make(new Map<Session['id'], Session>()),

      users: yield* Ref.make(new Map<User['id'], User>()),

      devices: yield* Ref.make(new Map<Device['id'], Device>()),
      compartments: yield* Ref.make(new Map<Compartment['id'], Compartment>()),
    }

    return {
      db,

      // oxlint-disable-next-line no-use-before-define
      buildCriteria,

      buildOrderBy: (items, orderBy) =>
        Effect.sync(() =>
          [...items].toSorted((a, b) => {
            for (const [key, direction] of Object.entries(orderBy)) {
              const valA = (a as Record<string, any>)[key]
              const valB = (b as Record<string, any>)[key]

              if (valA === valB) continue

              const orderMultiplier = direction === 'asc' ? 1 : -1
              if (valA > valB) return 1 * orderMultiplier
              if (valA < valB) return -1 * orderMultiplier
            }
            return 0
          })
        ),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}

// oxlint-disable-next-line eslint/complexity
function matchOperator(itemValue: unknown, expr: unknown): boolean {
  if (typeof expr !== 'object' || expr === null || expr instanceof Date) {
    if (itemValue instanceof Date && expr instanceof Date) {
      return itemValue.getTime() === expr.getTime()
    }
    return itemValue === expr
  }

  const opObj = expr as Record<string, unknown>

  if ('eq' in opObj && itemValue !== opObj.eq) return false
  if ('ne' in opObj && itemValue === opObj.ne) return false
  if ('in' in opObj && Array.isArray(opObj.in) && !opObj.in.includes(itemValue))
    return false

  if ('isNull' in opObj) {
    const isNullOrUndefined = itemValue === null || itemValue === undefined
    if (opObj.isNull !== isNullOrUndefined) return false
  }

  if ('gt' in opObj && !((itemValue as any) > (opObj.gt as any))) return false
  if ('gte' in opObj && !((itemValue as any) >= (opObj.gte as any)))
    return false
  if ('lt' in opObj && !((itemValue as any) < (opObj.lt as any))) return false
  if ('lte' in opObj && !((itemValue as any) <= (opObj.lte as any)))
    return false

  if ('between' in opObj && Array.isArray(opObj.between)) {
    const [from, to] = opObj.between as [any, any]
    if ((itemValue as any) < from || (itemValue as any) > to) return false
  }

  if ('like' in opObj && typeof opObj.like === 'string') {
    const strVal = String(itemValue ?? '')
    const pattern = opObj.like
      .replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&')
      .replaceAll('%', '.*')
      .replaceAll('_', '.')

    const flags = opObj.mode === 'insensitive' ? 'i' : ''
    const regex = new RegExp(`^${pattern}$`, flags)

    if (!regex.test(strVal)) return false
  }

  return true
}

const buildCriteria = <TEntity>(
  item: TEntity,
  criteria?: IRepository.Criteria<TEntity>
): Effect.Effect<boolean> =>
  Effect.gen(function* buildCriteriaGen() {
    if (!criteria) return true

    for (const [key, value] of Object.entries(criteria)) {
      if (value === undefined) continue

      if (key === 'AND') {
        const andList = Array.isArray(value) ? value : [value]

        const isMatch = yield* Effect.forEach(
          andList,
          (c) => buildCriteria(item, c),
          { concurrency: 'unbounded' }
        ).pipe(Effect.map((results) => results.every(Boolean)))
        if (!isMatch) return false

        continue
      }

      if (key === 'OR') {
        const orList = Array.isArray(value) ? value : [value]

        const isMatch = yield* Effect.forEach(
          orList,
          (c) => buildCriteria(item, c),
          { concurrency: 'unbounded' }
        ).pipe(Effect.map((results) => results.some(Boolean)))
        if (!isMatch) return false

        continue
      }

      if (key === 'NOT') {
        const notList = Array.isArray(value) ? value : [value]

        const isMatch = yield* Effect.forEach(
          notList,
          (c) => buildCriteria(item, c),
          { concurrency: 'unbounded' }
        ).pipe(Effect.map((results) => results.some(Boolean)))
        if (isMatch) return false

        continue
      }

      const itemValue = (item as Record<string, unknown>)[key]
      if (!matchOperator(itemValue, value)) return false
    }

    return true
  })
