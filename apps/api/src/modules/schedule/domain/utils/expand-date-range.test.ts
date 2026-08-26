import { describe, expect, it } from 'bun:test'

import { expandDateRange } from '@/modules/schedule/domain/utils/expand-date-range'

describe('expandDateRange', () => {
  it('should correctly filter days of the week based on custom mapping (1 = Sun, 2 = Mon, 7 = Sat)', () => {
    // 2026-09-01 is Tuesday (day 3)
    // 2026-09-07 is Monday (day 2)
    const startDate = '2026-09-01'
    const endDate = '2026-09-07'

    // Pick Sunday (1) and Tuesday (3)
    const daysOfWeek = [1, 3]

    const result = expandDateRange(startDate, endDate, daysOfWeek)

    expect(result).toEqual([
      '2026-09-01', // Tuesday
      '2026-09-06', // Sunday
    ])
  })

  it('should work correctly when startDate and endDate are the same day', () => {
    // 2026-09-06 is Sunday (day 1)
    const date = '2026-09-06'

    // Matching day
    expect(expandDateRange(date, date, [1])).toEqual(['2026-09-06'])

    // Non-matching day
    expect(expandDateRange(date, date, [2, 3])).toEqual([])
  })

  it('should return an empty array if no days match daysOfWeek', () => {
    const startDate = '2026-09-01'
    const endDate = '2026-09-03'

    // The range only contains Tue (3), Wed (4), Thu (5) -> Filter for Mon (2) & Sun (1)
    const result = expandDateRange(startDate, endDate, [1, 2])

    expect(result).toEqual([])
  })

  it('should return all dates within the range if daysOfWeek contains 1 through 7', () => {
    const startDate = '2026-09-01'
    const endDate = '2026-09-05'
    const allDays = [1, 2, 3, 4, 5, 6, 7]

    const result = expandDateRange(startDate, endDate, allDays)

    expect(result).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ])
  })

  it('should cross month boundaries seamlessly', () => {
    const startDate = '2026-08-30' // Sunday (1)
    const endDate = '2026-09-02' // Wednesday (4)

    // Pick Monday (2)
    const result = expandDateRange(startDate, endDate, [2])

    expect(result).toEqual(['2026-08-31'])
  })

  it('should throw an error for an invalid date string format', () => {
    expect(() => expandDateRange('invalid-date', '2026-09-01', [1])).toThrow(
      'Invalid date string: invalid-date'
    )
  })
})
