import { SunIcon, SunsetIcon, MoonIcon } from '@rozumari/ui/components/icons'
import { useMemo } from 'react'

export const STATUS_CONFIG = {
  completed: {
    variant: 'success' as const,
    borderClass: 'border-l-success',
  },
  pending: {
    variant: 'outline' as const,
    borderClass: 'border-l-warning',
  },
  failed: {
    variant: 'destructive' as const,
    borderClass: 'border-l-destructive',
  },
} as const

export const TIME_SLOTS = [
  {
    key: 'morning',
    label: 'Morning',
    period: '05:00 - 11:59',
    icon: SunIcon,
  },
  {
    key: 'afternoon',
    label: 'Afternoon',
    period: '12:00 - 17:59',
    icon: SunsetIcon,
  },
  {
    key: 'night',
    label: 'Night',
    period: '18:00 - 04:59',
    icon: MoonIcon,
  },
] as const

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
