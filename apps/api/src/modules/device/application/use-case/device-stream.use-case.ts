// oxlint-disable require-yield

import type { DeviceStreamDto } from '@rozumari/contract/device/dto/device-stream.dto'
import type { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schedule from 'effect/Schedule'
import * as Stream from 'effect/Stream'

export class DeviceStreamUseCase extends Context.Service<
  DeviceStreamUseCase,
  {
    readonly subcribe: (
      input: ShowDeviceDto.Input
    ) => Effect.Effect<DeviceStreamDto.Data>

    readonly emit: (input: DeviceStreamDto.Emit) => Effect.Effect<void>
  }
>()('device/application/DeviceStreamUseCase', {
  make: Effect.gen(function* make() {
    return {
      subcribe: Effect.fn(function* subcribe(input) {
        const keepAliveStream = Stream.repeat(
          Stream.succeed(':keep-alive\n\n'),
          Schedule.spaced('30 seconds')
        )

        const dataStream = Stream.repeat(
          Stream.succeed(`data: ${JSON.stringify(input)}\n\n`),
          Schedule.spaced('5 seconds')
        )

        return Stream.merge(
          keepAliveStream,
          dataStream
        ) as unknown as DeviceStreamDto.Data
      }),

      emit: Effect.fn(function* emit(_input) {
        // noop
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
