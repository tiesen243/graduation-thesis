import * as React from 'react'

import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'

interface UseMediaQueryOptions {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = React.useCallback(
    (_query: string): boolean => {
      if (typeof window === 'undefined') return defaultValue
      return window.matchMedia(_query).matches
    },
    [defaultValue]
  )

  const [matches, setMatches] = React.useState<boolean>(() => {
    if (initializeWithValue) return getMatches(query)
    return defaultValue
  })

  const handleChange = React.useCallback(
    () => setMatches(getMatches(query)),
    [getMatches, query]
  )

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)

    handleChange()

    if (matchMedia.addListener) matchMedia.addListener(handleChange)
    else matchMedia.addEventListener('change', handleChange)

    return () => {
      if (matchMedia.removeListener) matchMedia.removeListener(handleChange)
      else matchMedia.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
