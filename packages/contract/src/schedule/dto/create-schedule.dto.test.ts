import { describe, expect, it } from 'bun:test'
import * as Schema from 'effect/Schema'

import { CreateScheduleDto } from './create-schedule.dto'

const getFormattedDate = (offsetDays = 0): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('CreateScheduleDto.Input Schema', () => {
  const decode = Schema.decodeUnknownResult(CreateScheduleDto.Input)

  const today = getFormattedDate(0)
  const tomorrow = getFormattedDate(1)
  const nextWeek = getFormattedDate(7)
  const yesterday = getFormattedDate(-1)

  const validPayload = {
    deviceId: 'dsah3djh6jwqh6ehas7dhsja',
    startDate: today,
    endDate: nextWeek,
    daysOfWeek: [1, 2, 7], // CN, T2, T7
    time: '08:00:00',
    items: [{ slot: '0-0', quantity: 2 }],
  }

  it('should pass validation with a valid input', () => {
    const result = decode(validPayload)
    expect(result._tag).toBe('Success')
  })

  it('should pass when startDate equals endDate', () => {
    const result = decode({
      ...validPayload,
      startDate: tomorrow,
      endDate: tomorrow,
    })
    expect(result._tag).toBe('Success')
  })

  it('should fail when startDate is in the past', () => {
    const result = decode({
      ...validPayload,
      startDate: yesterday,
      endDate: nextWeek,
    })

    expect(result._tag).toBe('Failure')
    if (result._tag === 'Failure') {
      const errorMsg = result.failure.message
      expect(errorMsg).toContain('Start date cannot be in the past')
    }
  })

  it('should fail when endDate is before startDate', () => {
    const result = decode({
      ...validPayload,
      startDate: nextWeek,
      endDate: tomorrow,
    })

    expect(result._tag).toBe('Failure')
    if (result._tag === 'Failure') {
      const errorMsg = result.failure.message
      expect(errorMsg).toContain('End date cannot be before start date')
    }
  })

  it('should fail when daysOfWeek contains numbers outside 1..7', () => {
    const resultZero = decode({ ...validPayload, daysOfWeek: [0, 2] })
    const resultEight = decode({ ...validPayload, daysOfWeek: [8] })

    expect(resultZero._tag).toBe('Failure')
    expect(resultEight._tag).toBe('Failure')
  })

  it('should fail when date formats do not match YYYY-MM-DD', () => {
    const resultInvalidStart = decode({
      ...validPayload,
      startDate: '2026/09/01',
    })
    const resultInvalidEnd = decode({ ...validPayload, endDate: '01-09-2026' })

    expect(resultInvalidStart._tag).toBe('Failure')
    expect(resultInvalidEnd._tag).toBe('Failure')
  })
})
