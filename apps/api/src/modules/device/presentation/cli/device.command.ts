import * as Effect from 'effect/Effect'
import * as Command from 'effect/unstable/cli/Command'
import * as Flag from 'effect/unstable/cli/Flag'

import { ListDevicesUseCase } from '@/modules/device/application/use-case/list-devices.use-case'
import { Jwt } from '@/shared/application/services/jwt.service'

const listDevices = Command.make(
  'list',
  {
    query: Flag.string('query').pipe(Flag.withDefault('')),
    page: Flag.integer('page').pipe(Flag.withDefault(1)),
    limit: Flag.integer('limit').pipe(Flag.withDefault(10)),
  },
  Effect.fn(function* listDevicesFn(input) {
    const { devices, meta } = yield* ListDevicesUseCase.use((s) =>
      s.execute(input)
    )

    yield* Effect.log(`Devices: ${JSON.stringify(devices, null, 2)}`)
    yield* Effect.log(`Meta: ${JSON.stringify(meta, null, 2)}`)
  })
)

const generateToken = Command.make(
  'generate-token',
  {
    deviceId: Flag.string('deviceId'),
  },
  Effect.fn(function* generateTokenFn(input) {
    const jwt = yield* Jwt

    const token = yield* jwt.sign(
      { sub: input.deviceId },
      { expiresIn: 999 * 365 * 24 * 60 * 60 } // no expiration
    )

    yield* Effect.log(`Token: ${token}`)
  })
)

export const deviceCommand = Command.make('device').pipe(
  Command.withSubcommands([listDevices, generateToken])
)
