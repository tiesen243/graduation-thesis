import { useEffect, useRef } from 'react'

import { env } from '@/lib/env'

export function TurnstileChallenge({
  setToken,
}: Readonly<{ setToken: (token: string) => void }>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    const scriptId = 'cf-turnstile-script'
    let script = document.querySelector(`#${scriptId}`) as HTMLScriptElement

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: env.VITE_TURNSTILE_KEY,
          callback: (receivedToken) => setToken(receivedToken),
          'error-callback': () => setToken(''),
          'expired-callback': () => setToken(''),
        })
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.addEventListener('load', renderWidget)
      document.head.append(script)
    } else if (window.turnstile) renderWidget()

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [setToken])

  return <div ref={containerRef} />
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}
