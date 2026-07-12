import type { YieldWrap } from 'effect/Utils'

import * as Effect from 'effect/Effect'

export const createUseCase =
  <TInput, TOutput>(
    useCase: (
      input: TInput
    ) => (_: Effect.Adapter) => Generator<YieldWrap<unknown>, TOutput, never>
  ) =>
  (input: TInput) =>
    Effect.gen(useCase(input) as never)
