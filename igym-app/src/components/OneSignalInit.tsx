'use client'

import { useEffect, useRef } from 'react'
import OneSignal from 'react-onesignal'

const ONESIGNAL_APP_ID = 'db886b5c-4ce6-4361-b633-9c1971de9c27'

export default function OneSignalInit() {
  const initializedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return
    initializedRef.current = true

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false,
          } as any,
        })

        // Display push notification slidedown permission prompt
        if (OneSignal.Slidedown) {
          await OneSignal.Slidedown.promptPush()
        }
      } catch (error) {
        console.error('OneSignal initialization error:', error)
      }
    }

    initOneSignal()
  }, [])

  return null
}
