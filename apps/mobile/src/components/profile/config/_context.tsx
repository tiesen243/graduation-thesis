// oxlint-disable no-bitwise

import type * as TLocation from 'expo-location'
import type { Peripheral } from 'react-native-ble-manager'
import type TBleManager from 'react-native-ble-manager'

import { toast } from '@rozumari/ui/components/toast'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { BLE_RX_UUID, BLE_SERVICE_UUID, BLE_TX_UUID } from '@/lib/constants'

let BleManager: typeof TBleManager | null = null,
  Location: typeof TLocation | null = null
try {
  // oxlint-disable-next-line node/global-require unicorn/prefer-module
  BleManager = require('react-native-ble-manager').default
  // oxlint-disable-next-line node/global-require unicorn/prefer-module
  Location = require('expo-location')
} catch {
  // noop
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

interface DeviceInfo {
  utc: number
  language: 'en' | 'vi'
  syncTime: { hours: number; minutes: number }
  timeouts: { drop: number; open: number; close: number }
}

interface BLEContextType {
  discoveredDevices: Peripheral[]
  selectedDevice: string
  setSelectedDevice: (id: string) => void
  isConnected: boolean
  isConnecting: boolean
  deviceInfo: DeviceInfo | null
  handleConnect: () => Promise<void>
  handleDisconnect: () => Promise<void>
  sendBleCommand: (
    actionName: string,
    payloadObj?: Record<string, unknown>
  ) => Promise<void>
  registerByteHandler: (
    handler: (action: number, status: number) => void
  ) => () => void
}

const parseDeviceInfo = (rawBytes: number[]): DeviceInfo => {
  // Mảng 6 bytes: [ActionByte, b0, b1, b2, b3, b4]
  const [, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0] = rawBytes
  const payload =
    BigInt(b0) |
    (BigInt(b1) << 8n) |
    (BigInt(b2) << 16n) |
    (BigInt(b3) << 24n) |
    (BigInt(b4) << 32n)

  // 1. UTC Offset (bits 0..3)
  const utcBits = Number(payload & 0x0fn)
  const signBit = (utcBits >> 3) & 0x01
  const absVal = utcBits & 0x07
  const utc = signBit === 1 ? absVal : -absVal

  // 2. Language (bit 4)
  const langBit = Number((payload >> 4n) & 0x01n)
  const language: 'en' | 'vi' = langBit === 1 ? 'vi' : 'en'

  // 3. Sync Time (bits 5..15)
  const syncTimeBits = Number((payload >> 5n) & 0x07_ffn)
  const hours = syncTimeBits & 0x1f
  const minutes = (syncTimeBits >> 5) & 0x3f

  // 4. Timeouts (bits 16..33)
  const drop = Number((payload >> 16n) & 0x3fn)
  const open = Number((payload >> 22n) & 0x3fn)
  const close = Number((payload >> 28n) & 0x3fn)

  return {
    utc,
    language,
    syncTime: { hours, minutes },
    timeouts: { drop, open, close },
  }
}

const BLEContext = React.createContext<BLEContextType | null>(null)

const stringToBytes = (str: string): number[] =>
  [...str].map((char) => char.codePointAt(0) ?? 0)

const removeVietnameseTones = (str: string): string =>
  str
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/gu, '')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')

export function BLEProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('profile')

  const [discoveredDevices, setDiscoveredDevices] = React.useState<
    Peripheral[]
  >([])
  const [selectedDevice, setSelectedDevice] = React.useState<string>('')
  const [isConnected, setIsConnected] = React.useState<boolean>(false)
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false)
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null)

  const discoverListenerRef = React.useRef<{ remove: () => void } | null>(null)
  const notificationListenerRef = React.useRef<{ remove: () => void } | null>(
    null
  )
  const byteHandlersRef = React.useRef<
    Set<(action: number, status: number) => void>
  >(new Set())

  const registerByteHandler = React.useCallback(
    (handler: (action: number, status: number) => void) => {
      byteHandlersRef.current.add(handler)
      return () => byteHandlersRef.current.delete(handler)
    },
    []
  )

  const handleByteNotification = React.useCallback((byteValue: number) => {
    // 4-bit Action Code (bits 4..7) and 4-bit Status Code (bits 0..3)
    const actionCode = (byteValue >> 4) & 0x0f
    const statusCode = byteValue & 0x0f

    if (actionCode === ACTION_CODES.PONG) toast.success('Pong received!')
    for (const handler of byteHandlersRef.current)
      handler(actionCode, statusCode)
  }, [])

  React.useEffect(() => {
    if (!BleManager || !Location) return

    void (async () => {
      const isLocationEnabled = await Location.hasServicesEnabledAsync()
      if (!isLocationEnabled)
        try {
          await Location.enableNetworkProviderAsync()
        } catch {
          // noop
        }

      await BleManager.start({ showAlert: false })

      try {
        await BleManager.enableBluetooth()
      } catch {
        // noop
      }

      if (!discoverListenerRef.current) {
        discoverListenerRef.current = BleManager.onDiscoverPeripheral(
          (peripheral) => {
            setDiscoveredDevices((prev) => {
              if (!prev.some((d) => d.id === peripheral.id))
                return [...prev, peripheral]
              return prev
            })
          }
        )
      }

      try {
        await BleManager.scan({ serviceUUIDs: [], seconds: 10 })
      } catch {
        // noop
      }
    })()

    return () => {
      discoverListenerRef.current?.remove()
      notificationListenerRef.current?.remove()
    }
  }, [])

  const handleConnect = React.useCallback(async () => {
    if (!selectedDevice || !BleManager) return

    try {
      setIsConnecting(true)
      await BleManager.stopScan()
      await BleManager.connect(selectedDevice)
      await BleManager.retrieveServices(selectedDevice)

      try {
        await BleManager.requestMTU(selectedDevice, 512)
      } catch {
        // noop
      }

      const startNotificationListener = async (deviceId: string) => {
        try {
          if (notificationListenerRef.current) {
            notificationListenerRef.current.remove()
            notificationListenerRef.current = null
          }

          await BleManager.startNotification(
            deviceId,
            BLE_SERVICE_UUID,
            BLE_TX_UUID
          )

          notificationListenerRef.current =
            BleManager.onDidUpdateValueForCharacteristic((data) => {
              if (data.peripheral === deviceId && data.value) {
                const rawArray = Array.isArray(data.value)
                  ? data.value
                  : [...(data.value as Uint8Array)]

                // Nhận gói tin 6 Bytes chứa Device Info
                if (rawArray.length >= 6) {
                  const actionByte = rawArray[0] ?? 0
                  const actionCode = (actionByte >> 4) & 0x0f

                  if (actionCode === ACTION_CODES.SEND_DEVICE_INFO) {
                    const parsedInfo = parseDeviceInfo(rawArray)
                    setDeviceInfo(parsedInfo)
                  }
                } else if (rawArray.length === 1)
                  handleByteNotification(rawArray[0] ?? 0)
              }
            })
        } catch {
          // noop
        }
      }

      await startNotificationListener(selectedDevice)

      setIsConnected(true)
      toast.success(t('config.messages.success'))
    } catch {
      setIsConnected(false)
      toast.error(t('config.messages.failed'))
    } finally {
      setIsConnecting(false)
    }
  }, [t, selectedDevice, handleByteNotification])

  const handleDisconnect = React.useCallback(async () => {
    if (!selectedDevice || !BleManager) return

    try {
      notificationListenerRef.current?.remove()
      notificationListenerRef.current = null
      await BleManager.disconnect(selectedDevice)
      setIsConnected(false)
      setDeviceInfo(null)
      toast.info(t('config.messages.disconnected'))
    } catch {
      // noop
    }
  }, [t, selectedDevice])

  const sendBleCommand = React.useCallback(
    async (actionName: string, payloadObj: Record<string, unknown> = {}) => {
      if (!selectedDevice || !isConnected || !actionName.trim() || !BleManager)
        return

      try {
        const cleanAction = removeVietnameseTones(actionName.trim())
        const cleanPayload = JSON.parse(
          removeVietnameseTones(JSON.stringify(payloadObj))
        )

        const jsonString = JSON.stringify({
          action: cleanAction,
          payload: cleanPayload,
        })

        const sanitizedString = `${jsonString.replaceAll(/[^a-zA-Z0-9_@#$\-\s{}":,]/gu, '')}\n`
        const bytesData = stringToBytes(sanitizedString)

        await BleManager.write(
          selectedDevice,
          BLE_SERVICE_UUID,
          BLE_RX_UUID,
          bytesData,
          500
        )
      } catch {
        toast.error(t('config.messages.send_failed'))
      }
    },
    [t, selectedDevice, isConnected]
  )

  const memorizedValue = React.useMemo(
    () => ({
      discoveredDevices,
      selectedDevice,
      setSelectedDevice,
      isConnected,
      isConnecting,
      deviceInfo,
      handleConnect,
      handleDisconnect,
      sendBleCommand,
      registerByteHandler,
    }),
    [
      discoveredDevices,
      selectedDevice,
      setSelectedDevice,
      isConnected,
      isConnecting,
      deviceInfo,
      handleConnect,
      handleDisconnect,
      sendBleCommand,
      registerByteHandler,
    ]
  )

  return <BLEContext value={memorizedValue}>{children}</BLEContext>
}

export function useBLE() {
  const context = React.use(BLEContext)
  if (!context) throw new Error('useBLE must be used within a BLEProvider')
  return context
}
