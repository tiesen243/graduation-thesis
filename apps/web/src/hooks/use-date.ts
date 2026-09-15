import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {
  // noop
}

export function useDate(now = new Date()) {
  const dateString = useSyncExternalStore(
    emptySubscribe,
    () => {
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    () => null
  )

  return dateString
}
