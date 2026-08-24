// oxlint-disable require-yield

import type { DeviceStreamDto } from '@rozumari/contract/device/dto/device-stream.dto'

import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { DeviceNotFound } from '@rozumari/contract/device/schemas/device.error'
import { UserRole } from '@rozumari/contract/user/schemas/user.schema'
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
      input: DeviceStreamDto.Params
    ) => Effect.Effect<DeviceStreamDto.Data, DeviceNotFound, CurrentUser>

    readonly emit: (
      input: DeviceStreamDto.Params & DeviceStreamDto.Emit
    ) => Effect.Effect<void, DeviceNotFound, CurrentUser>
  }
>()('device/application/DeviceStreamUseCase', {
  make: Effect.gen(function* make() {
    const deviceRepository = yield* DeviceRepository

    const streamService = yield* StreamService

    return {
      subcribe: Effect.fn(function* subcribe(input) {
        const { userId, userRole } = yield* CurrentUser

        const [device] = yield* deviceRepository.findMany({
          where: {
            id: { eq: input.id },
            ...(userRole === UserRole.make('admin')
              ? {}
              : { userId: { eq: userId } }),
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
          (message) =>
            Effect.succeed(`data: ${JSON.stringify({ message })}\n\n`)
        )

        return Stream.merge(keepAliveStream, dataStream).pipe(
          Stream.ensuring(streamService.unregister(input.id))
        ) as unknown as DeviceStreamDto.Data
      }),

      emit: Effect.fn(function* emit(input) {
        const { userId, userRole } = yield* CurrentUser

        const [device] = yield* deviceRepository.findMany({
          where: {
            id: { eq: input.id },
            ...(userRole === UserRole.make('admin')
              ? {}
              : { userId: { eq: userId } }),
          },
        })
        if (!device)
          return Effect.fail(new DeviceNotFound({ error: { id: input.id } }))

        yield* streamService.publish(input.id, input.message)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
