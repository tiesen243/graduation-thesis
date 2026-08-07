import { BunRuntime } from '@effect/platform-bun'
import { DateTime, Effect } from 'effect'

const program = Effect.gen(function* program() {
  const currentTimezone = yield* DateTime.CurrentTimeZone
  yield* Effect.log(`Current timezone: ${currentTimezone}`)

  const now = yield* DateTime.nowInCurrentZone
  yield* Effect.log(`Current date and time: ${now}`)

  const tomorrow = DateTime.add(now, { days: 1 })
  yield* Effect.log(`Date and time after adding 1 day: ${tomorrow}`)
}).pipe(Effect.provide(DateTime.layerCurrentZoneNamed('America/New_York')))

BunRuntime.runMain(program)
