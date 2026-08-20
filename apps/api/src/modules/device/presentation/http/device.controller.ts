import { Api } from '@rozumari/contract'
import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { AddDeviceDto } from '@rozumari/contract/device/dto/add-device.dto'
import { LinkDeviceDto } from '@rozumari/contract/device/dto/link-device.dto'
import { ListDevicesDto } from '@rozumari/contract/device/dto/list-devices.dto'
import { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'
import { UpdateCompartmentDto } from '@rozumari/contract/device/dto/update-compartment.dto'
import * as Effect from 'effect/Effect'
import { encodeText } from 'effect/Stream'
import { HttpServerResponse } from 'effect/unstable/http'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { AddDeviceUseCase } from '@/modules/device/application/use-case/add-device.use-case'
import { DeviceStreamUseCase } from '@/modules/device/application/use-case/device-stream.use-case'
import { LinkDeviceUseCase } from '@/modules/device/application/use-case/link-device.use-case'
import { ListDevicesUseCase } from '@/modules/device/application/use-case/list-devices.use-case'
import { ShowDeviceUseCase } from '@/modules/device/application/use-case/show-device.use-case'
import { UpdateCompartmentUseCase } from '@/modules/device/application/use-case/update-compartment.use-case'

export const deviceController = HttpApiBuilder.group(
  Api,
  'device',
  (handlers) =>
    handlers

      .handle('list', ({ query }) =>
        ListDevicesUseCase.use((s) => s.execute(query)).pipe(
          Effect.map((data) => ListDevicesDto.make({ data }))
        )
      )

      .handle('me', ({ query }) =>
        CurrentUser.pipe(
          Effect.flatMap(({ userId }) =>
            ListDevicesUseCase.use((s) => s.execute({ ...query, userId }))
          ),
          Effect.map((data) => ListDevicesDto.make({ data }))
        )
      )

      .handle('show', ({ params }) =>
        ShowDeviceUseCase.use((s) => s.execute(params)).pipe(
          Effect.map((data) => ShowDeviceDto.make({ data }))
        )
      )

      .handle('add', ({ payload }) =>
        AddDeviceUseCase.use((s) => s.execute(payload)).pipe(
          Effect.map((data) => AddDeviceDto.make({ data }))
        )
      )

      .handle('link', ({ params }) =>
        CurrentUser.pipe(
          Effect.flatMap(({ userId }) =>
            LinkDeviceUseCase.use((s) => s.execute({ ...params, userId }))
          ),
          Effect.map((data) => LinkDeviceDto.make({ data }))
        )
      )

      .handle('update-compartment', ({ params, payload }) =>
        UpdateCompartmentUseCase.use((s) =>
          s.execute({ ...params, ...payload })
        ).pipe(Effect.map((data) => UpdateCompartmentDto.make({ data })))
      )

      .handle('stream', ({ params }) =>
        DeviceStreamUseCase.use((s) => s.subcribe(params)).pipe(
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
        DeviceStreamUseCase.use((s) => s.emit(payload))
      )
)
