/**
 * Returns the start and end date of the current week (Monday to Sunday) in 'YYYY-MM-DD' format.
 * @param now - The current date. Defaults to the current date if not provided.
 * @returns An object containing the start and end dates of the current week.
 * */
export function getCurrentWeekRange(now = new Date()): {
  startDate: string
  endDate: string
} {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return {
    startDate: startOfWeek.toISOString().split('T').at(0) ?? '',
    endDate: endOfWeek.toISOString().split('T').at(0) ?? '',
  }
}
