import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { createId } from '@/shared/lib/create-id'

export class BaseEntity extends Schema.TaggedClass<BaseEntity>()(
  'shared/domain/BaseEntity',
  {
    id: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.sync(createId))
    ).check(Schema.isPattern(/^[0-9a-z]+$/u)),

    createdAt: Schema.Date.pipe(
      Schema.withConstructorDefault(Effect.sync(() => new Date()))
    ),
    updatedAt: Schema.Date.pipe(
      Schema.withConstructorDefault(Effect.sync(() => new Date()))
    ),
  }
) {
  public clone(
    overrides: Partial<
      Omit<this, keyof typeof BaseEntity.fields | 'clone' | 'toJSON'>
    >
  ): this {
    const cleanedOverrides = Object.fromEntries(
      Object.entries(overrides).filter(
        ([_, value]) => value !== undefined && value !== ''
      )
    )

    // oxlint-disable-next-line typescript/no-explicit-any
    return new (this.constructor as any)({
      ...structuredClone(this),
      ...cleanedOverrides,
      updatedAt: new Date(),
    })
  }

  public toJSON(): this {
    return structuredClone(this)
  }
}
