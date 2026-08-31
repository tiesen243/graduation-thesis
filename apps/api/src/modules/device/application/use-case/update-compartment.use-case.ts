import type { UpdateCompartmentDto } from '@rozumari/contract/device/dto/update-compartment.dto'

import { CompartmentNotFound } from '@rozumari/contract/device/schemas/compartment.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'

export class UpdateCompartmentUseCase extends Context.Service<
  UpdateCompartmentUseCase,
  {
    readonly execute: (
      input: UpdateCompartmentDto.Params & UpdateCompartmentDto.Input
    ) => Effect.Effect<UpdateCompartmentDto.Output, CompartmentNotFound>
  }
>()('device/application/UpdateCompartmentUseCase', {
  make: Effect.gen(function* make() {
    const compartmentRepository = yield* CompartmentRepository

    return {
      execute: Effect.fn(function* execute({ id, position, ...input }) {
        const [compartment] = yield* compartmentRepository.findMany({
          where: { deviceId: { eq: id }, position },
          limit: 1,
        })
        if (!compartment)
          return yield* Effect.fail(
            new CompartmentNotFound({ error: { deviceId: id, position } })
          )

        const updatedCompartment = compartment.update(input)
        yield* compartmentRepository.save(updatedCompartment)

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
