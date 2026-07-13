import * as Schema from 'effect/Schema'

import { createId } from '@/shared/lib/create-id'

export abstract class BaseEntity extends Schema.Class<BaseEntity>(
  'shared/domain/BaseEntity'
)({
  id: Schema.String.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => createId())
  ),
  createdAt: Schema.DateFromSelf.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => new Date())
  ),
  updatedAt: Schema.DateFromSelf.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => new Date())
  ),
}) {
  public clone(
    override: Partial<Omit<this, 'clone' | 'toPersistence'>> = {}
  ): this {
    const cleanedOverride = Object.fromEntries(
      Object.entries(override).filter(
        ([_, value]) => value !== undefined && value.trim() !== ''
      )
    ) as Partial<Omit<this, 'clone'>>

    // oxlint-disable-next-line typescript/no-explicit-any
    return new (this.constructor as new (...args: any[]) => this)({
      ...structuredClone(this),
      ...cleanedOverride,
      updatedAt: new Date(),
    })
  }

  public toPersistence(): this {
    return structuredClone(this as never)
  }
}
