/**
 * Parse an `yyyy-MM-dd` date string into a `Date` (local midnight).
 */
const parseDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) throw new Error(`Invalid date string: ${value}`)
  return new Date(year, month - 1, day)
}

/**
 * Format a `Date` into an `yyyy-MM-dd` string.
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Expand a date range and a set of days of week into the list of
 * individual `yyyy-MM-dd` dates that fall on those days.
 *
 * - `startDate` / `endDate` are inclusive `yyyy-MM-dd` bounds.
 * - `daysOfWeek` is an array of integers `0` (Sunday) .. `6` (Saturday).
 *
 * @returns an array of `yyyy-MM-dd` strings, one per matching day.
 */
export const expandDateRange = (
  startDate: string,
  endDate: string,
  daysOfWeek: readonly number[]
): string[] => {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const daySet = new Set(daysOfWeek)

  const result: string[] = []
  const cursor = new Date(start)

  // oxlint-disable-next-line no-unmodified-loop-condition
  while (cursor <= end) {
    if (daySet.has(cursor.getDay())) result.push(formatDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}
