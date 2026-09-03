import { useMemo } from 'react'

export const useDateRange = (startDate: string, endDate: string) =>
  useMemo(() => {
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: { iso: string; weekday: string; dayNumber: number }[] = []

    const currentDate = new Date(start)
    while (currentDate.getTime() <= end.getTime()) {
      const iso = currentDate.toISOString().split('T')[0] ?? ''
      dates.push({
        iso,
        weekday: currentDate.toLocaleString('default', { weekday: 'short' }),
        dayNumber: currentDate.getDate(),
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }, [startDate, endDate])
