/**
 * Format today's date as a `dd/MM/yyyy` string (local time).
 */
export const formatToday = (): string => {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()

  return `${day}/${month}/${year}`
}
