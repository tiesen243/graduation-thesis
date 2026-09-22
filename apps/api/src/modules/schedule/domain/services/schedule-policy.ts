import { ScheduleInvalid } from '@rozumari/contract/schedule/schemas/schedule.error'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'

import { expandDateRange } from '@/modules/schedule/domain/utils/expand-date-range'

export const validateAndExpandScheduleDates = Effect.fn(
  function* validateAndExpandScheduleDates(input: {
    startDate: string
    endDate: string
    time: string
    daysOfWeek: readonly number[]
  }) {
    const now = yield* DateTime.nowInCurrentZone
    const timeZone = yield* DateTime.CurrentTimeZone

    const startDate = DateTime.makeZoned(`${input.startDate}T${input.time}`, {
      timeZone,
      adjustForTimeZone: true,
    })
    const endDate = DateTime.makeZoned(`${input.endDate}T${input.time}`, {
      timeZone,
      adjustForTimeZone: true,
    })

    if (startDate._tag === 'None' || endDate._tag === 'None')
      return yield* Effect.fail(
        new ScheduleInvalid({ message: 'Invalid start or end date' })
      )

    if (
      DateTime.isLessThan(startDate.value, now) ||
      DateTime.isLessThan(endDate.value, now)
    )
      return yield* Effect.fail(
        new ScheduleInvalid({ message: 'Start or end date is in the past' })
      )

    if (DateTime.isLessThan(endDate.value, startDate.value))
      return yield* Effect.fail(
        new ScheduleInvalid({ message: 'Start date is after end date' })
      )

    return input.startDate === input.endDate
      ? [input.startDate]
      : expandDateRange(input.startDate, input.endDate, input.daysOfWeek)
  }
)

export const validateScheduleIsPending = (status: string) => {
  if (status !== 'pending')
    return Effect.fail(
      new ScheduleInvalid({
        message: 'Only pending schedules can be updated',
      })
    )

  return Effect.succeed(null)
}

export const validateTargetDateTime = Effect.fn(
  function* validateTargetDateTime(targetDate: string, targetTime: string) {
    const now = yield* DateTime.nowInCurrentZone
    const target = DateTime.makeZoned(`${targetDate}T${targetTime}`, {
      timeZone: yield* DateTime.CurrentTimeZone,
      adjustForTimeZone: true,
    })

    if (target._tag === 'None')
      return yield* Effect.fail(
        new ScheduleInvalid({ message: 'Invalid date or time format' })
      )

    if (DateTime.isLessThan(target.value, now))
      return yield* Effect.fail(
        new ScheduleInvalid({
          message: 'Schedule date and time must be in the future',
        })
      )
  }
)
