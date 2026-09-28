import { use } from 'react'
import { browser } from 'react-dom'

// oxlint-disable-next-line react/purity
export function useDate(now = new Date()) {
  use(browser())

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
