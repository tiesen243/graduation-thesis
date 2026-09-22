import { format, formatRelative } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { vi } from 'date-fns/locale/vi'

type FormatMode = 'date' | 'time' | 'all' | 'custom'

const MODE_FORMATS: Record<FormatMode, string> = {
  date: 'yyyy-MM-dd',
  time: 'HH:mm:ss',
  all: 'yyyy-MM-dd HH:mm',
  custom: '',
}

/**
 * Formats a date object into a string based on the specified mode and locale.
 *
 * @param date - The date object to format.
 * @param options - An object containing optional parameters:
 *  - mode: The format mode ('date', 'time', or 'all'). Default is 'date'.
 *  - locale: The locale for formatting ('en' or 'vi'). Default is 'en'.
 *  @returns A formatted date string based on the specified mode and locale.
 */
export function formatDate(
  date: Date | string | number,
  options: { mode?: FormatMode; locale?: string; custom?: string } = {}
) {
  const { mode = 'date', locale = 'en', custom = '' } = options

  const formatStr = mode === 'custom' ? custom : MODE_FORMATS[mode]

  return format(date, formatStr, { locale: locale === 'vi' ? vi : enUS })
}

/**
 * Formats the distance between a given date and the current date in a human-readable format.
 *
 * @param laterDate - The date to compare with the current date.
 * @param options - An object containing optional parameters:
 * - earlierDate: The date to compare against. Default is the current date.
 * - locale: The locale for formatting ('en' or 'vi'). Default is 'en'.
 *  @returns A string representing the distance between the given date and the current date in a human-readable format.
 */
export function formatDistanceDays(
  laterDate: Date | string | number,
  options: { earlierDate?: Date | string | number; locale?: string } = {}
): string {
  const { earlierDate = new Date(), locale = 'en' } = options

  const relativeString = formatRelative(laterDate, earlierDate, {
    locale: locale === 'vi' ? vi : enUS,
  })

  return relativeString.split(/ vào | at /iu)[0] ?? relativeString
}

export { cn } from 'cn'
export { clsx } from 'cn/lite'
export {
  formatDate as baseFormatDate,
  formatDistance,
  formatDuration,
  formatRelative,
} from 'date-fns'
