// oxlint-disable require-yield

import type { DeviceStreamDto } from '@rozumari/contract/device/dto/device-stream.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schedule from 'effect/Schedule'
import * as Stream from 'effect/Stream'

import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'
import { StreamService } from '@/shared/stream.service'

export class DeviceStreamUseCase extends Context.Service<
  DeviceStreamUseCase,
  {
    readonly subcribe: (
      input: DeviceStreamDto.Params & { userId?: UserId }
    ) => Effect.Effect<DeviceStreamDto.Stream>

    readonly emit: (
      input: DeviceStreamDto.Params & DeviceStreamDto.Emit & { userId?: UserId }
    ) => Effect.Effect<DeviceStreamDto.EmitSuccess, DeviceNotFound>
  }
>()('device/application/DeviceStreamUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    const streamService = yield* StreamService

    return {
      subcribe: Effect.fn(function* subcribe(input) {
        const [device] = yield* deviceRepository.findMany({
          where: {
            id: { eq: input.id },
            ...(input.userId ? { userId: { eq: input.userId } } : {}),
          },
        })
        if (!device)
          return Stream.fail(new DeviceNotFound({ error: { id: input.id } }))

        yield* streamService.register(input.id)

        const keepAliveStream = Stream.repeat(
          Stream.succeed(':keep-alive\n\n'),
          Schedule.spaced('30 seconds')
        )

        const dataStream = Stream.mapEffect(
          streamService.subscribe(input.id),
          (message) => Effect.succeed(`data: ${message}\n\n`)
        )

        return Stream.merge(keepAliveStream, dataStream).pipe(
          Stream.ensuring(streamService.unregister(input.id))
        ) as unknown as DeviceStreamDto.Stream
      }),

      emit: Effect.fn(function* emit(input) {
        const [device] = yield* deviceRepository.findMany({
          where: {
            id: { eq: input.id },
            ...(input.userId ? { userId: { eq: input.userId } } : {}),
          },
        })
        if (!device)
          return yield* Effect.fail(
            new DeviceNotFound({ error: { id: input.id } })
          )

        yield* streamService.publish(
          input.id,
          JSON.stringify({ action: input.action, payload: input.payload })
        )

        return {
          deviceId: input.id,
          action: input.action,
          payload: input.payload,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
