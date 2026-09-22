import { formatDate } from '@rozumari/ui/lib/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const useDateRange = (startDate: string, endDate: string) => {
  const { i18n } = useTranslation('schedule')

  return useMemo(() => {
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: { iso: string; weekday: string; dayNumber: number }[] = []

    const currentDate = new Date(start)
    while (currentDate.getTime() <= end.getTime()) {
      const [iso = ''] = currentDate.toISOString().split('T')
      dates.push({
        iso,
        weekday: formatDate(currentDate, {
          mode: 'custom',
          custom: 'EEE',
          locale: i18n.resolvedLanguage,
        }),
        dayNumber: currentDate.getDate(),
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }, [startDate, endDate, i18n.resolvedLanguage])
}
