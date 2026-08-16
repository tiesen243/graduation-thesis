import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export class Compartment extends Schema.TaggedClass<Compartment>()(
  'device/domain/Compartment',
  CompartmentSchema
) {
  private static SIZE_MAP = {
    sm: 6,
    md: 12,
    lg: 16,
  } as const
  private static COLS = 2

  /**
   * Generates an array of compartment instances for a device based on a specified preset size.
   *
   * Positions are calculated sequentially into a 2D grid (`row-column`) using `Compartment.COLS`.
   *
   * @param deviceId - The unique identifier of the device to associate compartments with.
   * @param size - The size key from `Compartment.SIZE_MAP` (e.g., 'sm', 'md', 'lg').
   *
   * @returns An Effect that resolves to an array of created `Compartment` instances.
   *
   * @example
   * // Creates 6 compartments arranged in a 2-column grid: "0-0", "0-1", "1-0", ...
   * yield* Compartment.makeRange(deviceId, 'sm')
   */
  public static makeRange = Effect.fn(function* makeRange(
    deviceId: DeviceId,
    size: keyof typeof Compartment.SIZE_MAP
  ) {
    const count = Compartment.SIZE_MAP[size]

    // oxlint-disable-next-line unicorn/no-array-for-each
    return yield* Effect.forEach(
      Array.from({ length: count }),
      Effect.fn(function* makeRangeLoop(_, index) {
        const row = Math.floor(index / Compartment.COLS)
        const column = index % Compartment.COLS

        yield* Effect.sleep(100)
        return Compartment.make({
          deviceId,
          position: `${row}-${column}`,
        })
      }),
      { concurrency: 1 }
    )
  })
}
