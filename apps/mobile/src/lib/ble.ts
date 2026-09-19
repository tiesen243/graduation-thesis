import * as ExpoDevice from 'expo-device'
import * as Linking from 'expo-linking'
import { Alert, PermissionsAndroid, Platform } from 'react-native'

const requestAndroid31Permissions = async (): Promise<boolean> => {
  const permissions = [
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]

  const result = await PermissionsAndroid.requestMultiple(permissions)
  const scanStatus = result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]
  const connectStatus = result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
  const locationStatus =
    result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]

  if (
    scanStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
    connectStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
    locationStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
  ) {
    Alert.alert(
      'Permission Denied',
      'Bluetooth Low Energy requires Bluetooth and Location permissions. Please enable them in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    )
    return false
  }

  return (
    result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED
  )
}

export const requestBLEPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonPositive: 'OK',
        }
      )

      return granted === PermissionsAndroid.RESULTS.GRANTED
    }

    return await requestAndroid31Permissions()
  }

  return true
}
