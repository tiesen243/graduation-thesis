import type { WebViewMessageEvent } from 'react-native-webview'

import { useRef } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

export function TurnstileChallenge({
  setToken,
}: Readonly<{ setToken: (challengeToken: string) => void }>) {
  const webViewRef = useRef<WebView<unknown>>(null)

  const htmlContent = /* HTML */ `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script>
        <style>
          body,
          html {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            height: 100%;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <div
          class="cf-turnstile"
          data-sitekey="${process.env.EXPO_PUBLIC_TURNSTILE_KEY}"
          data-callback="onSuccess"
          data-error-callback="onError"
          data-expired-callback="onExpire"
        ></div>

        <script>
          function onSuccess(token) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: 'SUCCESS', token })
            )
          }
          function onError() {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: 'ERROR' })
            )
          }
          function onExpire() {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: 'EXPIRE' })
            )
          }
        </script>
      </body>
    </html>
  `

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'SUCCESS') setToken(data.token)
      else if (data.type === 'ERROR') setToken('')
      else if (data.type === 'EXPIRE') setToken('')
    } catch (error) {
      console.error('Error parsing Turnstile message:', error)
    }
  }

  return (
    <View className='h-18 w-full'>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: process.env.EXPO_PUBLIC_WEB_URL }}
        style={{ backgroundColor: 'transparent' }}
        onMessage={handleMessage}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  )
}
