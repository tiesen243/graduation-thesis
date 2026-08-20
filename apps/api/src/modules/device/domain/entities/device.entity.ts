import { DeviceSchema } from '@rozumari/contract/device/schemas/device.schema'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Random from 'effect/Random'
import * as Schema from 'effect/Schema'

export class Device extends Schema.TaggedClass<Device>()(
  'device/domain/Device',
  DeviceSchema
) {
  /**
   * Generates a unique factory model for the device using current timestamp and random sequence.
   *
   * **Format:** `yymmddxxxxxx`
   * - `yy` - Year of manufacture (last two digits)
   * - `mm` - Month of manufacture (01-12)
   * - `dd` - Day of manufacture (01-31)
   * - `xxxxxx` - Unique random sequence number (000000-999999)
   *
   * @returns {Effect.Effect<string>} An Effect that succeeds with the formatted factory model string.
   */
  public static generateFactoryModel = Effect.gen(
    function* generateFactoryModel() {
      const now = yield* DateTime.now

      const year = DateTime.getPart(now, 'year').toString().slice(-2)
      const month = DateTime.getPart(now, 'month').toString().padStart(2, '0')
      const day = DateTime.getPart(now, 'day').toString().padStart(2, '0')
      const randomNumber = yield* Random.nextIntBetween(0, 999_999).pipe(
        Effect.map((num) => num.toString().padStart(6, '0'))
      )

      return `${year}${month}${day}${randomNumber}`
    }
  )

  public update(props: Pick<Device, 'name' | 'position'>) {
    return Device.make({
      ...structuredClone(this),
      ...props,
    })
  }
}
