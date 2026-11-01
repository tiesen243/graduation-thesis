// oxlint-disable no-bitwise typescript/no-unsafe-call promise/prefer-await-to-then promise/prefer-await-to-callbacks
import type { Device, BleManager as TBleManager } from 'react-native-ble-plx'

import { toast } from '@rozumari/ui/components/toast'
import * as Base64 from 'effect/encoding/Base64'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { BLE_RX_UUID, BLE_SERVICE_UUID, BLE_TX_UUID } from '@/lib/constants'

let BleManager: TBleManager | null = null

try {
  // oxlint-disable-next-line node/global-require unicorn/prefer-module
  const { BleManager: _BleManager } = require('react-native-ble-plx') as {
    BleManager: typeof TBleManager
  }

  BleManager = new _BleManager()
} catch {
  BleManager = null
}

export const ACTION_CODES = {
  PONG: 0,
  CHECK_WIFI_RES: 1,
  SET_WIFI_RES: 2,
  SET_UTC_RES: 3,
  SET_LANGUAGE_RES: 4,
  SET_SYNC_TIME_RES: 5,
  SET_DROP_TIMEOUT_RES: 6,
  SET_OPEN_TIMEOUT_RES: 7,
  SET_CLOSE_TIMEOUT_RES: 8,
  SEND_DEVICE_INFO: 9,
} as const

export const STATUS_CODES = {
  FAIL: 0,
  SUCCESS: 1,
} as const

export type BLEStatus = 'idle' | 'scanning' | 'connecting' | 'connected'

export interface DeviceInfo {
  utc: number
  language: 'en' | 'vi'
  syncTime: {
    hours: number
    minutes: number
  }
  timeouts: {
    drop: number
    open: number
    close: number
  }
}

export interface BLEResponse {
  action: number
  status: number
}

interface BLEContextValue {
  status: BLEStatus
  devices: Device[]
  selectedDevice: string | null
  setSelectedDevice: (id: string | null) => void

  deviceInfo: DeviceInfo | null
  lastResponse: BLEResponse | null

  startScan: () => Promise<void>
  stopScan: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>

  sendCommand: (
    action: string,
    payload?: Record<string, unknown>
  ) => Promise<void>
}

const parseDeviceInfo = (rawBytes: number[]): DeviceInfo => {
  const [, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0] = rawBytes

  const payload =
    BigInt(b0) |
    (BigInt(b1) << 8n) |
    (BigInt(b2) << 16n) |
    (BigInt(b3) << 24n) |
    (BigInt(b4) << 32n)

  const utcBits = Number(payload & 0x0fn)
  const signBit = (utcBits >> 3) & 0x01
  const absValue = utcBits & 0x07
  const utc = signBit === 1 ? absValue : -absValue

  const language: 'en' | 'vi' =
    Number((payload >> 4n) & 0x01n) === 1 ? 'vi' : 'en'

  const syncTimeBits = Number((payload >> 5n) & 0x07_ffn)
  const hours = syncTimeBits & 0x1f
  const minutes = (syncTimeBits >> 5) & 0x3f

  return {
    utc,
    language,
    syncTime: { hours, minutes },
    timeouts: {
      drop: Number((payload >> 16n) & 0x3fn),
      open: Number((payload >> 22n) & 0x3fn),
      close: Number((payload >> 28n) & 0x3fn),
    },
  }
}

const BLEContext = React.createContext<BLEContextValue | null>(null)

export function BLEProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('profile')

  const [status, setStatus] = React.useState<BLEStatus>('idle')
  const [devices, setDevices] = React.useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = React.useState<string | null>(
    null
  )
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null)
  const [lastResponse, setLastResponse] = React.useState<BLEResponse | null>(
    null
  )

  const connectedDeviceRef = React.useRef<Device | null>(null)
  const scanTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const notificationRef = React.useRef<{ remove: () => void } | null>(null)
  const disconnectRef = React.useRef<{ remove: () => void } | null>(null)
  const writeQueueRef = React.useRef(Promise.resolve())

  const stopScan = React.useCallback(async () => {
    if (!BleManager) return

    await BleManager.stopDeviceScan()

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }

    setStatus((current) => (current === 'scanning' ? 'idle' : current))
  }, [])

  const startScan = React.useCallback(async () => {
    if (!BleManager || status === 'connected' || status === 'connecting') return

    await stopScan()
    setDevices([])
    setStatus('scanning')

    await BleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setStatus('idle')
        return
      }

      if (!device) return

      setDevices((current) => {
        if (current.some(({ id }) => id === device.id)) return current
        return [...current, device]
      })
    })

    scanTimeoutRef.current = setTimeout(() => {
      void stopScan()
    }, 5000)
  }, [status, stopScan])

  const handleNotification = React.useCallback((value: string) => {
    const bytesRes = Base64.decode(value)
    if (bytesRes._tag === 'Failure') return

    const bytes = [...bytesRes.success]
    if (bytes.length >= 6) {
      const action = ((bytes[0] ?? 0) >> 4) & 0x0f

      if (action === ACTION_CODES.SEND_DEVICE_INFO) {
        setDeviceInfo(parseDeviceInfo(bytes))
      }

      return
    }

    if (bytes.length !== 1) return

    const byte = bytes[0] ?? 0
    const action = (byte >> 4) & 0x0f
    const responseStatus = byte & 0x0f

    setLastResponse({ action, status: responseStatus })

    if (action === ACTION_CODES.PONG) {
      toast.success('Pong received!')
    }
  }, [])

  const subscribe = React.useCallback(
    (device: Device) => {
      notificationRef.current?.remove()
      disconnectRef.current?.remove()

      notificationRef.current = device.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        BLE_TX_UUID,
        (error, characteristic) => {
          if (error) {
            return
          }

          if (characteristic?.value) {
            handleNotification(characteristic.value)
          }
        }
      )

      disconnectRef.current = device.onDisconnected((_error) => {
        notificationRef.current?.remove()
        notificationRef.current = null
        disconnectRef.current?.remove()
        disconnectRef.current = null
        connectedDeviceRef.current = null

        setStatus('idle')
        setDeviceInfo(null)
        setLastResponse(null)
      })
    },
    [handleNotification]
  )

  const connect = React.useCallback(async () => {
    if (!BleManager || !selectedDevice) return

    try {
      setStatus('connecting')
      await stopScan()

      const device = await BleManager.connectToDevice(selectedDevice)
      await device.discoverAllServicesAndCharacteristics()

      connectedDeviceRef.current = device
      subscribe(device)
      setStatus('connected')

      toast.success(t('config.messages.success'))
    } catch {
      connectedDeviceRef.current = null
      setStatus('idle')
      toast.error(t('config.messages.failed'))
    }
  }, [selectedDevice, stopScan, subscribe, t])

  const disconnect = React.useCallback(async () => {
    if (!BleManager) return

    const deviceId = connectedDeviceRef.current?.id ?? selectedDevice
    if (!deviceId) return

    try {
      notificationRef.current?.remove()
      notificationRef.current = null
      disconnectRef.current?.remove()
      disconnectRef.current = null

      await BleManager.cancelDeviceConnection(deviceId)
    } catch {
      // noop
    } finally {
      connectedDeviceRef.current = null
      setStatus('idle')
      setDeviceInfo(null)
      setLastResponse(null)
      toast.info(t('config.messages.disconnected'))
    }
  }, [selectedDevice, t])

  const sendCommand = React.useCallback(
    async (action: string, payload: Record<string, unknown> = {}) => {
      const device = connectedDeviceRef.current
      if (!BleManager || !device || !action.trim()) return

      const message = `${JSON.stringify({
        action: action.trim(),
        payload,
      })}\n`
      const value = Base64.encode(message)

      writeQueueRef.current = writeQueueRef.current.then(async () => {
        try {
          await BleManager?.writeCharacteristicWithResponseForDevice(
            device.id,
            BLE_SERVICE_UUID,
            BLE_RX_UUID,
            value
          )
        } catch (error) {
          toast.error(t('config.messages.send_failed'))
          throw error
        }
      })

      await writeQueueRef.current
    },
    [t]
  )

  React.useEffect(() => {
    if (!BleManager) return

    return () => {
      void BleManager.stopDeviceScan()

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }

      notificationRef.current?.remove()
      disconnectRef.current?.remove()

      const device = connectedDeviceRef.current
      if (device)
        void BleManager.cancelDeviceConnection(device.id).catch(() => {
          // noop
        })
    }
  }, [])

  const value = React.useMemo<BLEContextValue>(
    () => ({
      status,
      devices,
      selectedDevice,
      setSelectedDevice,
      deviceInfo,
      lastResponse,
      startScan,
      stopScan,
      connect,
      disconnect,
      sendCommand,
    }),
    [
      status,
      devices,
      selectedDevice,
      deviceInfo,
      lastResponse,
      startScan,
      stopScan,
      connect,
      disconnect,
      sendCommand,
    ]
  )

  return <BLEContext value={value}>{children}</BLEContext>
}

export function useBLE() {
  const context = React.use(BLEContext)

  if (!context) {
    throw new Error('useBLE must be used within a BLEProvider')
  }

  return context
}
