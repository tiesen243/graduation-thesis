import { Api } from '@rozumari/contract'
import { DeviceStreamDto } from '@rozumari/contract/device/dto/device-stream.dto'
import { CurrentDevice } from '@rozumari/contract/device/middleware'
import { TodayScheduleDto } from '@rozumari/contract/schedule/dto/today-schedule.dto'
import * as Effect from 'effect/Effect'
import { encodeText } from 'effect/Stream'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { DeviceStreamUseCase } from '@/modules/device/application/use-case/device-stream.use-case'
import { TodayScheduleUseCase } from '@/modules/schedule/application/use-case/today-schedule.use-case'

export const iotController = HttpApiBuilder.group(Api, 'iot', (handlers) =>
  handlers
    .handle('subscribe', () =>
      CurrentDevice.pipe(
        Effect.flatMap((id) =>
          DeviceStreamUseCase.use((s) => s.subcribe({ id }))
        ),
        Effect.map((stream) =>
          HttpServerResponse.stream(stream.pipe(encodeText as never), {
            contentType: 'text/event-stream',
            headers: {
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          })
        )
      )
    )

    .handle('emit', ({ payload }) =>
      CurrentDevice.pipe(
        Effect.flatMap((id) =>
          DeviceStreamUseCase.use((s) => s.emit({ id, ...payload }))
        ),
        Effect.map((data) => DeviceStreamDto.make({ data }))
      )
    )

    .handle('schedule-today', ({ params }) =>
      TodayScheduleUseCase.use((s) => s.execute(params)).pipe(
        Effect.map((data) => TodayScheduleDto.make({ data }))
      )
    )
)
