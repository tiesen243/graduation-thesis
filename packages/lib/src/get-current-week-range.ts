/**
 * Returns the start and end date of the current week (Monday to Sunday) in 'YYYY-MM-DD' format.
 * @param now - The current date. Defaults to the current date if not provided.
 * @param timezone - The timezone to use for date calculations. Defaults to 'UTC'.
 * @returns An object containing the start and end dates of the current week.
 * */
export function getCurrentWeekRange(
  now = new Date(),
  timeZone = 'UTC'
): { startDate: string; endDate: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(now)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''

  const year = Number(get('year'))
  const month = Number(get('month'))
  const day = Number(get('day'))
  const weekday = get('weekday')

  const dayOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(
    weekday
  )

  const startOfWeek = new Date(Date.UTC(year, month - 1, day - dayOfWeek))

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6)

  return {
    startDate: startOfWeek.toISOString().split('T').at(0) ?? '',
    endDate: endOfWeek.toISOString().split('T').at(0) ?? '',
  }
}
